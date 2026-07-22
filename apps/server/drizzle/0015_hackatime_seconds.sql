-- Persist the Hackatime tracked time (across linked projects) captured at
-- ship time so the dashboard can show/credit real coding hours instead of
-- only manually journalled hours.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "hackatime_seconds" integer NOT NULL DEFAULT 0;
