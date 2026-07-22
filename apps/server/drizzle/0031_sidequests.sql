-- Sidequest scaffolding: quests are authored in the dashboard, unlocked per
-- player (by talking to NPCs — wiring comes later), and picked at ship time
-- eventually. The quest log in-game lists all active quests either way.
create table if not exists sidequests (
  id bigint generated always as identity primary key,
  name text not null,
  region text not null default '',
  npc text not null default '',
  description text not null default '',
  reward text not null default '',
  active boolean not null default true,
  position integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists sidequest_unlocks (
  id bigint generated always as identity primary key,
  sidequest_id bigint not null references sidequests(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (sidequest_id, user_id)
);
