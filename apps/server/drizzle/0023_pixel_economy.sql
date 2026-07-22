-- Pixel economy v2: 1 hour = 5 pixels, 10 pixels = $1, WHOLE pixels only.
-- Crediting is delta-based so re-approving an updated project only adds the
-- difference vs what was already credited (never double-pays), and reverting a
-- verdict claws the pixels back. Every movement stays in pixel_transactions.

-- Convert existing 1h=1px decimal credits to the new 5x integer scale.
update pixel_transactions set amount = round(amount * 5);
update users u set pixels = coalesce(
  (select sum(t.amount) from pixel_transactions t where t.user_id = u.id), 0);

alter table pixel_transactions alter column amount type bigint using round(amount);
alter table users alter column pixels type bigint using round(pixels);

-- Multiple credits per project are now expected (updates credit the delta).
drop index if exists pixel_tx_project_approval;

-- Bring the project's lifetime credit up (or down) to p_amount pixels total.
-- Inserts only the delta vs everything already credited/reverted for the
-- project, so repeat calls and re-approvals are safe. Returns the new balance.
create or replace function credit_project_pixels(
  p_user_id uuid,
  p_project_id bigint,
  p_amount numeric,
  p_hours numeric,
  p_created_by text
) returns numeric
language plpgsql
as $$
declare
  already bigint;
  delta bigint;
  new_balance bigint;
begin
  select coalesce(sum(amount), 0) into already
  from pixel_transactions
  where project_id = p_project_id
    and reason in ('project_approved', 'review_reverted');

  delta := round(p_amount) - already;

  if delta <> 0 then
    insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
    values (p_user_id, p_project_id, delta, p_hours, 'project_approved', p_created_by);

    update users set pixels = pixels + delta
    where id = p_user_id
    returning pixels into new_balance;
  else
    select pixels into new_balance from users where id = p_user_id;
  end if;

  return coalesce(new_balance, 0);
end;
$$;

-- Manual staff adjustment (deduct or grant) with a mandatory reason. Never
-- lets a balance go negative. Returns the new balance.
create or replace function adjust_user_pixels(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_created_by text
) returns numeric
language plpgsql
as $$
declare
  delta bigint;
  new_balance bigint;
begin
  delta := round(p_amount);
  if delta = 0 then
    select pixels into new_balance from users where id = p_user_id;
    return coalesce(new_balance, 0);
  end if;

  update users set pixels = greatest(pixels + delta, 0)
  where id = p_user_id
  returning pixels into new_balance;

  insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
  values (p_user_id, null, delta, 0, p_reason, p_created_by);

  return coalesce(new_balance, 0);
end;
$$;

-- Claw back everything a project has been credited (verdict reverted / sent
-- back to review). Idempotent: net-zero projects are a no-op. Returns the
-- number of pixels removed (positive) for logging.
create or replace function revoke_project_pixels(
  p_user_id uuid,
  p_project_id bigint,
  p_created_by text
) returns numeric
language plpgsql
as $$
declare
  net bigint;
begin
  select coalesce(sum(amount), 0) into net
  from pixel_transactions
  where project_id = p_project_id
    and reason in ('project_approved', 'review_reverted');

  if net <> 0 then
    insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
    values (p_user_id, p_project_id, -net, 0, 'review_reverted', p_created_by);

    update users set pixels = pixels - net where id = p_user_id;
  end if;

  return coalesce(net, 0);
end;
$$;
