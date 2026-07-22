-- Private internal note reviewers must write with every verdict; only admins
-- see it (dashboard /review/audit). Never shown to players.
alter table review_audits add column if not exists audit_note text not null default '';
