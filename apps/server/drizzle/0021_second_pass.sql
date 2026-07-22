-- Two-pass review: a shipped project gets a first pass (any reviewer), then a
-- required second pass by a final reviewer (Gabin for now) before it is truly
-- approved and pixels are credited. status 'second_review' sits between
-- 'shipped' and 'approved'.
alter table projects add column if not exists first_pass_by text not null default '';
alter table projects add column if not exists first_pass_at timestamptz;
alter table projects add column if not exists first_pass_note text not null default '';
alter table projects add column if not exists first_pass_hours numeric(10, 2);
