-- Player reports: someone flags another player (harassment, etc.). Chat isn't
-- persisted, so the reporter's client attaches a snapshot of the recent chat
-- it had on screen as context. Reviewed in the dashboard moderation queue.
create table if not exists reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references users(id) on delete cascade,
  target_id uuid not null references users(id) on delete cascade,
  reason text not null default '',
  context jsonb not null default '[]',
  scene text not null default '',
  status text not null default 'open',
  handled_by text not null default '',
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on reports (status, created_at desc);
create index if not exists reports_target_idx on reports (target_id);
