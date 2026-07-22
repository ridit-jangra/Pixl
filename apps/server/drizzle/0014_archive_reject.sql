-- Soft-delete (archive) and permanent reject/ban for projects. Both are
-- reversible and preserve review history; archived/rejected projects are
-- hidden from explore and player profiles but kept in the dashboard archive.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "archived_at" timestamptz;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "rejected_at" timestamptz;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reject_reason" text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "idx_projects_archived" ON "projects"("archived_at");
