-- Pixels are the in-game currency and map to real money (1 approved hour = 1
-- pixel). The balance is authoritative on the server: only trusted crediting
-- (the dashboard, on final approval) may change it. The game only ever reads it.
alter table users add column if not exists pixels numeric(12, 2) not null default 0;

create table if not exists pixel_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  project_id bigint references projects(id) on delete set null,
  amount numeric(12, 2) not null,
  hours numeric(10, 2) not null default 0,
  reason text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists pixel_tx_user_idx on pixel_transactions (user_id);

-- One approval credit per project, ever — hard guard against double-crediting.
create unique index if not exists pixel_tx_project_approval
  on pixel_transactions (project_id)
  where reason = 'project_approved';

-- Credit a project's approval exactly once and bump the user's balance
-- atomically. Idempotent: a repeat call for the same project is a no-op and
-- just returns the current balance.
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
  new_balance numeric;
begin
  if exists (
    select 1 from pixel_transactions
    where project_id = p_project_id and reason = 'project_approved'
  ) then
    select pixels into new_balance from users where id = p_user_id;
    return coalesce(new_balance, 0);
  end if;

  insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
  values (p_user_id, p_project_id, p_amount, p_hours, 'project_approved', p_created_by);

  update users set pixels = pixels + p_amount
  where id = p_user_id
  returning pixels into new_balance;

  return coalesce(new_balance, 0);
end;
$$;
