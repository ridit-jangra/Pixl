-- Persist all in-game chat so reports can pull a player's recent history
-- (harassment context). Broadcast still happens live; this is the record.
create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid references users(id) on delete set null,
  display_name text not null default '',
  scene text not null default '',
  text text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_time on chat_messages (user_id, created_at desc);
create index if not exists chat_messages_time on chat_messages (created_at desc);
