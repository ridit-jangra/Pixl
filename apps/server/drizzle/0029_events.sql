-- Weekend events, triggered from the dashboard. An event is live between
-- starts_at and ends_at unless stopped early. config is per-type:
--   double_streak      { perDay: 2 }            streak days count double
--   bounty             { reward: 50, description } fixed prize, reviewer verifies
--   community_goal     { target: 25, bonusPct: 10 } ships in window, everyone wins
--   mystery_merchant   { itemIds: [1,2] }       limited-time shop stock
--   review_blitz       { mult: 1.5 }            reviewer payout multiplier
--   leaderboard_sprint {}                        window-only leaderboard
create table if not exists events (
  id bigint generated always as identity primary key,
  type text not null,
  name text not null default '',
  config jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_by text not null default '',
  stopped_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists events_window_idx on events (starts_at, ends_at);

-- One bounty payout per project, awarded by the final reviewer.
create table if not exists bounty_claims (
  id bigint generated always as identity primary key,
  event_id bigint not null,
  project_id bigint not null,
  user_id uuid not null,
  pixels bigint not null default 0,
  awarded_by text not null default '',
  created_at timestamptz not null default now(),
  unique (event_id, project_id)
);
