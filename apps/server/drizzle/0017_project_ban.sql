-- Permanent project ban, distinct from a (reversible, re-shippable) rejection.
-- A banned project cannot be shipped again and is hidden everywhere; staff can
-- still lift it.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "banned_at" timestamptz;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "ban_reason" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "ban_by" text NOT NULL DEFAULT '';
