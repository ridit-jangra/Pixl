-- Soft review claim: when a reviewer opens a submission it is claimed for a
-- short window so two reviewers don't grade the same project at once.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reviewing_by" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reviewing_at" timestamptz;
