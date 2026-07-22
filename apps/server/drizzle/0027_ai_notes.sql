-- Players who declare AI use must say which AI and what they used it for.
alter table projects add column if not exists ai_notes text not null default '';
