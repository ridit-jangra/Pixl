-- Ship flow: projects move draft -> shipped -> approved / needs_changes,
-- plus a project type for explore filters.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'draft';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'other';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "review_note" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "shipped_at" timestamptz;

CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("status");
CREATE INDEX IF NOT EXISTS "idx_projects_type" ON "projects"("type");
