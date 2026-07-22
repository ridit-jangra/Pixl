import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";
import { activeEvents } from "../events.js";
import { approvedHoursFor } from "../xp.js";
import { addNotification } from "./notifications.js";

const router = Router();

// Base columns plus unlock_xp (trophies). unlock_xp arrives with migration 0032
// — fall back gracefully before it's applied so the catalog keeps loading.
const ITEM_COLUMNS = "id, name, description, price, image_url, options, unlock_xp";
const ITEM_COLUMNS_FALLBACK = "id, name, description, price, image_url, options";

async function fetchItems(filterIds?: number[]) {
  const build = (cols: string) => {
    let q = supabase.from("shop_items").select(cols);
    if (filterIds) q = q.in("id", filterIds);
    else q = q.eq("active", true);
    return q.order("position", { ascending: true }).order("id", { ascending: true });
  };
  const first = await build(ITEM_COLUMNS);
  if (first.error) {
    const second = await build(ITEM_COLUMNS_FALLBACK);
    return {
      error: second.error,
      data: ((second.data ?? []) as unknown as Record<string, unknown>[]).map((i) => ({
        ...i,
        unlock_xp: 0,
      })),
    };
  }
  return { error: null, data: (first.data ?? []) as unknown as Record<string, unknown>[] };
}

// Active catalog, plus mystery-merchant items while their event runs — those
// stay inactive in the dashboard so they vanish the moment the event ends.
// Trophy items (unlock_xp > 0) come back flagged with the player's own progress.
router.get("/api/shop/items", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await fetchItems();
  if (error) {
    console.error("[shop] items failed", error);
    return res.status(500).json({ ok: false });
  }
  const items: Record<string, unknown>[] = data.map((i) => ({ ...i, limited: false }));

  const merchants = await activeEvents(["mystery_merchant"]);
  const limitedIds = [
    ...new Set(
      merchants.flatMap((ev) =>
        Array.isArray(ev.config.itemIds) ? ev.config.itemIds.map(Number) : [],
      ),
    ),
  ].filter((id) => Number.isFinite(id) && !items.some((i) => i.id === id));
  if (limitedIds.length > 0) {
    const { data: limited } = await fetchItems(limitedIds);
    const endsAt = merchants.map((m) => m.ends_at).sort()[0];
    for (const i of limited ?? []) items.unshift({ ...i, limited: true, limited_until: endsAt });
  }

  // The player's own trophy progress: current XP and which trophies they've claimed.
  const hasTrophies = items.some((i) => Number(i.unlock_xp) > 0);
  let xp = 0;
  let claimed: number[] = [];
  if (hasTrophies) {
    const [hours, { data: claims }] = await Promise.all([
      approvedHoursFor(session.userId),
      supabase.from("shop_claims").select("item_id").eq("user_id", session.userId),
    ]);
    xp = hours;
    claimed = ((claims ?? []) as { item_id: number }[]).map((c) => c.item_id);
  }

  res.json({ ok: true, items, xp, claimed });
});

// Claim a trophy the player has earned. Server-authoritative: it re-checks the
// XP requirement, so a client can't claim early. Idempotent via the unique
// (user_id, item_id) constraint.
router.post("/api/shop/claim/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const { data: item } = await supabase
    .from("shop_items")
    .select("id, name, unlock_xp, active")
    .eq("id", id)
    .maybeSingle();
  const unlockXp = Number((item as { unlock_xp?: number } | null)?.unlock_xp ?? 0);
  if (!item || !item.active || unlockXp <= 0)
    return res.status(404).json({ ok: false, error: "not_a_trophy" });

  const xp = await approvedHoursFor(session.userId);
  if (xp < unlockXp)
    return res.status(400).json({ ok: false, error: "not_eligible", xp, need: unlockXp });

  const { error } = await supabase
    .from("shop_claims")
    .upsert(
      { user_id: session.userId, item_id: id },
      { onConflict: "user_id,item_id", ignoreDuplicates: true },
    );
  if (error) {
    console.error("[shop] claim failed", error);
    return res.status(500).json({ ok: false });
  }
  void addNotification(
    session.userId,
    "Trophy claimed! 🏆",
    `You claimed "${item.name}". The team will reach out about getting it to you.`,
  );
  res.json({ ok: true, claimed: true });
});

// Buy a priced item with pixels. All the real checks (item on sale, affordable,
// pixels deducted) happen inside buy_shop_item under a row lock, so a
// double-click can't overspend. On success we open a pending order the team
// fulfils from the dashboard and tell the player to expect us.
router.post("/api/shop/buy/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });
  const option = typeof req.body?.option === "string" ? req.body.option.slice(0, 80) : "";

  const { data, error } = await supabase.rpc("buy_shop_item", {
    p_user_id: session.userId,
    p_item_id: id,
    p_option: option,
  });
  if (error) {
    console.error("[shop] buy failed", error);
    return res.status(500).json({ ok: false });
  }
  const result = (data ?? {}) as {
    ok?: boolean;
    error?: string;
    balance?: number;
    price?: number;
    item_name?: string;
  };
  if (!result.ok) {
    return res.status(result.error === "insufficient" ? 400 : 409).json(result);
  }

  void addNotification(
    session.userId,
    "Order placed! 🛍️",
    `You bought "${result.item_name}"${option ? ` (${option})` : ""}. The team will reach out about getting it to you.`,
  );
  res.json({ ok: true, balance: result.balance });
});

export default router;
