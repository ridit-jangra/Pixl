-- ⛔ OBSOLETE — DO NOT RUN. Superseded by app-level notification.
--
-- This migration depends on pg_net, which is a Supabase extension. On the
-- orchard/CNPG cluster the stack now runs on, pg_net is not installed and not
-- even available (it is absent from pg_available_extensions), so this cannot
-- be applied at all. It was also never filled in — the two placeholders below
-- were left literal, so any run of it would have POSTed to the invalid host
-- "<PIXORPHEUS_PUBLIC_URL>" and failed silently (pg_net reports errors
-- asynchronously into net._http_response, which nothing here ever read).
--
-- The notification is now sent from the dashboard after a successful write:
-- apps/dashboard/lib/shopNotify.ts, called from the shop mutations in
-- apps/dashboard/app/actions.ts. That works on any Postgres.
--
-- Kept only for history. If this trigger was ever installed on the old
-- Supabase project, drop it there with:
--   DROP TRIGGER IF EXISTS shop_items_change_webhook ON public.shop_items;
--   DROP FUNCTION IF EXISTS public.notify_shop_change();
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Notify pixorpheus (Slack bot) whenever the shop catalog changes — new item,
-- price change, description edit, activate/deactivate, delete, etc. An AFTER
-- INSERT/UPDATE/DELETE trigger on shop_items POSTs the changed row
-- (record + old_record) to pixorpheus' /webhooks/shop endpoint, which diffs it
-- and posts a message to the shop channel.
--
-- This calls pg_net's net.http_post directly, so it does NOT require the
-- "Database Webhooks" feature (the supabase_functions schema) to be enabled —
-- it builds the same payload shape that a Supabase webhook would send.
--
-- BEFORE RUNNING, replace the two placeholders below:
--   1. <PIXORPHEUS_PUBLIC_URL>  — the same public host GitHub webhooks hit,
--                                 e.g. https://pixorpheus.example.com
--   2. <SHOP_WEBHOOK_SECRET>    — a shared secret; set the SAME value as the
--                                 SHOP_WEBHOOK_SECRET env var on pixorpheus.
--                                 (If you leave pixorpheus without that env
--                                 var, the header is simply ignored.)
--
-- Safe to run once. Re-running is a no-op (function/trigger replaced in place).
-- Run this in the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_shop_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://<PIXORPHEUS_PUBLIC_URL>/webhooks/shop',
    body    := jsonb_build_object(
      'type',       TG_OP,
      'table',      TG_TABLE_NAME,
      'schema',     TG_TABLE_SCHEMA,
      'record',     CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
      'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-shop-webhook-secret', '<SHOP_WEBHOOK_SECRET>'
    ),
    timeout_milliseconds := 5000
  );
  RETURN NULL; -- AFTER trigger; return value ignored
END;
$$;

DROP TRIGGER IF EXISTS shop_items_change_webhook ON public.shop_items;

CREATE TRIGGER shop_items_change_webhook
AFTER INSERT OR UPDATE OR DELETE ON public.shop_items
FOR EACH ROW EXECUTE FUNCTION public.notify_shop_change();
