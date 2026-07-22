-- Update re-ships, double-dip disclosure/flagging, AI disclosure,
-- thumbnail image (required to ship), complexity level.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "image_url" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "level" int NOT NULL DEFAULT 1;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "used_ai" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_update" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "update_notes" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "other_ysws" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "system_note" text NOT NULL DEFAULT '';
