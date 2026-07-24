-- Migration: force Slack timestamp columns to TEXT (Pixorpheus tickets/polls)
--
-- WHY: Slack message timestamps are strings like "1769257393.482600". If these
-- columns are a numeric/float type, Postgres hands them back as numbers and
-- (a) Slack rejects buttons built with a numeric value (invalid_blocks), so
-- tickets never forward to the private channel, and (b) float values no longer
-- match the original Slack ts, so resolve/reopen/reactions break. Floats also
-- drop trailing zeros (…482600 -> …4826), permanently corrupting existing rows.
--
-- Run this in the Supabase SQL editor. Safe to run more than once.

-- 1. Check the current types first (informational — run on its own):
--    SELECT table_name, column_name, data_type
--    FROM information_schema.columns
--    WHERE (table_name = 'tickets'  AND column_name IN ('msg_ts','ticket_msg_ts'))
--       OR (table_name = 'polls'    AND column_name = 'message_ts')
--    ORDER BY table_name, column_name;

-- 2. Coerce to TEXT. No-ops if they are already text.
ALTER TABLE tickets ALTER COLUMN msg_ts        TYPE TEXT USING msg_ts::text;
ALTER TABLE tickets ALTER COLUMN ticket_msg_ts TYPE TEXT USING ticket_msg_ts::text;
ALTER TABLE polls   ALTER COLUMN message_ts    TYPE TEXT USING message_ts::text;

-- 3. Old OPEN tickets created before this fix have timestamps whose precision is
-- already lost (…4826 instead of …482600); they can never match a Slack message
-- again, so resolve/reopen will always fail on them. Close them out so the queue
-- only holds tickets created after the fix. Comment this out if you'd rather keep
-- them visible.
UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE status = 'open';
