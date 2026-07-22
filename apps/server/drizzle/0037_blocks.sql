-- Personal block list: a player blocks another so the blocked person's chat and
-- DMs stop reaching them. One-way (blocking stops THEM from reaching you).
create table if not exists blocks (
  blocker_id uuid not null references users(id) on delete cascade,
  blocked_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on blocks (blocker_id);
