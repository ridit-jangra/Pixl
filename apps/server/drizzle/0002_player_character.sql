-- Per-user appearance descriptor (see client SkinUtil):
--   "cvc:N"           pre-assembled character N (1..9)
--   "cv1:bB hH tT oO" layered outfit
-- New accounts get a random pre-assembled character; existing rows are
-- backfilled the same way.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "skin" text NOT NULL
  DEFAULT ('cvc:' || ((floor(random() * 9) + 1)::int)::text);
