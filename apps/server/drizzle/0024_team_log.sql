-- Log of Pixl team changes (sub-admins & reviewers) so mistakes can be undone
-- from the dashboard. before/after are permission arrays.
create table if not exists team_log (
  id serial primary key,
  slack_id text not null,
  name text not null default '',
  action text not null,
  before jsonb not null default '[]'::jsonb,
  after jsonb not null default '[]'::jsonb,
  actor text not null default '',
  reason text not null default '',
  created_at timestamptz not null default now()
);
alter table team_log add column if not exists reason text not null default '';
create index if not exists team_log_created_idx on team_log (created_at desc);
