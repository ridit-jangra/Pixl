-- Shop catalog managed from the dashboard; the game reads active items.
-- options is a jsonb array of variant strings (e.g. colors).
create table if not exists shop_items (
  id serial primary key,
  name text not null,
  description text not null default '',
  price integer not null default 0,
  image_url text not null default '',
  options jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  position integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now()
);
