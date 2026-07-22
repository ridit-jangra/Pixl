-- Reporting moved to a web page: reports are anonymous by default (reporter can
-- opt to reveal), and each report gets an AI pass over the target's recent chat.
alter table reports add column if not exists anonymous boolean not null default true;
alter table reports add column if not exists ai_verdict text not null default '';
alter table reports add column if not exists ai_summary text not null default '';
alter table reports add column if not exists ai_score int;
alter table reports add column if not exists ai_at timestamptz;
