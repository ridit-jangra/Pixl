-- Projects can be anything now: drop the type column and its index.
DROP INDEX IF EXISTS "idx_projects_type";
ALTER TABLE "projects" DROP COLUMN IF EXISTS "type";
