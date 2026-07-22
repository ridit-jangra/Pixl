-- Reports are sensitive: only an explicit allow-list may see them, NOT regular
-- admins/sub-admins. Seeded with the owner; managed from the dashboard.
create table if not exists report_viewers (
  slack_id text primary key,
  added_by text not null default '',
  created_at timestamptz not null default now()
);

insert into report_viewers (slack_id, added_by)
values ('U0ARC79GEAV', 'seed')
on conflict (slack_id) do nothing;
