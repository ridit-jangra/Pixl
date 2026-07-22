-- Shop purchases. Buying a priced item deducts pixels and opens an order the
-- team fulfils by hand (same "team will reach out" idea as trophy claims). One
-- row per purchase; every pixel movement lands in pixel_transactions with
-- reason 'shop_purchase' (and 'shop_refund' when a pending order is cancelled).
create table if not exists shop_orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  item_id integer references shop_items(id) on delete set null,
  item_name text not null default '',
  option text not null default '',
  price integer not null default 0,
  status text not null default 'pending',
  note text not null default '',
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  fulfilled_by text not null default ''
);

create index if not exists idx_shop_orders_user on shop_orders(user_id);
create index if not exists idx_shop_orders_status on shop_orders(status, created_at desc);

-- Server-authoritative purchase. Re-checks the item is active and actually for
-- sale (price > 0, not an XP trophy) and that the buyer can afford it, then
-- deducts the pixels and opens a pending order under one row lock so a
-- double-click can never overspend. Returns the new balance and order id, or an
-- error code the caller turns into a message.
create or replace function buy_shop_item(
  p_user_id uuid,
  p_item_id integer,
  p_option text
) returns json
language plpgsql
as $$
declare
  v_item shop_items%rowtype;
  v_balance bigint;
  v_order_id bigint;
begin
  select * into v_item from shop_items where id = p_item_id;
  if not found or not v_item.active then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;
  if coalesce(v_item.unlock_xp, 0) > 0 or v_item.price <= 0 then
    return json_build_object('ok', false, 'error', 'not_for_sale');
  end if;

  select pixels into v_balance from users where id = p_user_id for update;
  if v_balance is null then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;
  if v_balance < v_item.price then
    return json_build_object('ok', false, 'error', 'insufficient',
      'balance', v_balance, 'price', v_item.price);
  end if;

  update users set pixels = pixels - v_item.price where id = p_user_id
    returning pixels into v_balance;

  insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
  values (p_user_id, null, -v_item.price, 0, 'shop_purchase', 'shop');

  insert into shop_orders (user_id, item_id, item_name, option, price, status)
  values (p_user_id, v_item.id, v_item.name, coalesce(p_option, ''), v_item.price, 'pending')
  returning id into v_order_id;

  return json_build_object('ok', true, 'balance', v_balance,
    'order_id', v_order_id, 'item_name', v_item.name);
end;
$$;

-- Cancel a pending order and hand the pixels back. Idempotent: only a pending
-- order refunds and flips to cancelled, so a repeated click is a no-op. Returns
-- the refunded amount (0 when nothing changed).
create or replace function cancel_shop_order(
  p_order_id bigint,
  p_by text
) returns integer
language plpgsql
as $$
declare
  v_order shop_orders%rowtype;
begin
  select * into v_order from shop_orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending' then
    return 0;
  end if;

  update shop_orders
    set status = 'cancelled', fulfilled_at = now(), fulfilled_by = p_by
    where id = p_order_id;

  update users set pixels = pixels + v_order.price where id = v_order.user_id;

  insert into pixel_transactions (user_id, project_id, amount, hours, reason, created_by)
  values (v_order.user_id, null, v_order.price, 0, 'shop_refund', p_by);

  return v_order.price;
end;
$$;
