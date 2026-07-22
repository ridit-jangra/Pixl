-- Reviewer payouts: every review earns $1 (10 pixels). First-pass payouts sit
-- pending until the final pass confirms the verdict — agreement pays in full,
-- an overturn cuts 50%, a big hours correction cuts 30%. Rushed reviews
-- (under a minute / repo never opened) are cut 30-50% at settlement. Pixels
-- land in the reviewer's linked game account via adjust_user_pixels.
create table if not exists review_payouts (
  id bigint generated always as identity primary key,
  project_id bigint not null,
  reviewer text not null default '',
  reviewer_slack_id text not null default '',
  verdict text not null default '',
  status text not null default 'pending',
  full_pixels bigint not null default 10,
  paid_pixels bigint not null default 0,
  cut_pct bigint not null default 0,
  cut_reason text not null default '',
  credited boolean not null default false,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists review_payouts_reviewer_idx on review_payouts (reviewer_slack_id);
create index if not exists review_payouts_project_idx on review_payouts (project_id);
create index if not exists review_payouts_status_idx on review_payouts (status);
