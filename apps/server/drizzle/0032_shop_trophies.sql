-- Trophies: shop items unlocked by hitting an XP milestone (1 approved hour =
-- 1 XP) instead of being bought with pixels. unlock_xp = 0 keeps an item a
-- normal, purchasable item. Levels cap at 10 (= 100 XP), so a "level 100"
-- trophy is the max-level / 100-approved-hours milestone.
alter table shop_items add column if not exists unlock_xp integer not null default 0;

-- The 3D Printed Blahaj is now the 100-XP trophy, no longer for sale.
update shop_items set unlock_xp = 100, price = 0 where name ilike '%blahaj%';

-- One row per player per trophy claimed. The unique constraint makes claiming
-- idempotent; the game only ever inserts, never updates.
create table if not exists shop_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  item_id integer not null references shop_items(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists idx_shop_claims_user on shop_claims(user_id);
