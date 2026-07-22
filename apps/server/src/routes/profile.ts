import { Router } from "express";
import { issueSessionToken, verifySessionToken } from "../auth/session.js";
import { containsBlocked, logViolation } from "../moderation.js";
import { supabase } from "../db/client.js";
import { approvedHoursFor, levelFor, pxPerHourFor } from "../xp.js";

const router = Router();

// Returns a human-readable rejection reason, or null when the name is fine.
export function nameProblem(raw: string): string | null {
  const name = raw.trim();
  if (name.length < 2) return "That name is too short — use at least 2 characters.";
  if (name.length > 24) return "That name is too long — keep it under 24 characters.";
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(name))
    return "Only letters, numbers, spaces and . _ ' - are allowed.";
  if (containsBlocked(name))
    return "That name isn't okay here. Pick something friendly — this is a warning.";
  return null;
}

router.post("/api/profile/name", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false, reason: "Not signed in." });

  const raw = typeof req.body?.name === "string" ? req.body.name : "";
  const name = raw.trim().replace(/\s+/g, " ");
  const problem = nameProblem(name);
  if (problem) {
    if (containsBlocked(name)) logViolation(session.userId, "name", name);
    return res.json({ ok: false, reason: problem });
  }

  const { error } = await supabase
    .from("users")
    .update({ display_name: name })
    .eq("id", session.userId);
  if (error) {
    console.error("Failed to update display_name", error);
    return res.status(500).json({ ok: false, reason: "Database error." });
  }

  // Re-issue the session token so the embedded displayName matches the new one.
  const fresh = issueSessionToken({ userId: session.userId, displayName: name });
  res.json({ ok: true, name, token: fresh });
});

// Read-only wallet: current pixel balance and lifetime approved hours. Pixels
// are only ever changed server-side (by the dashboard on final approval), so
// the game just displays whatever this returns.
router.get("/api/profile/wallet", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const [{ data: user }, approvedHours] = await Promise.all([
    supabase.from("users").select("pixels").eq("id", session.userId).single(),
    approvedHoursFor(session.userId),
  ]);
  const pixels = Math.round(Number(user?.pixels) || 0);
  res.json({
    ok: true,
    pixels,
    approvedHours,
    level: levelFor(approvedHours),
    pxPerHour: pxPerHourFor(approvedHours),
  });
});

// The player's own pixel ledger, newest first, with project names attached.
router.get("/api/profile/transactions", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await supabase
    .from("pixel_transactions")
    .select("id, project_id, amount, hours, reason, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[profile] transactions failed", error);
    return res.status(500).json({ ok: false });
  }
  const rows = data ?? [];
  const projectIds = [
    ...new Set(rows.map((t) => t.project_id).filter((x): x is number => x != null)),
  ];
  const names = new Map<number, string>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", projectIds);
    for (const p of projects ?? []) names.set(p.id as number, p.name as string);
  }
  res.json({
    ok: true,
    transactions: rows.map((t) => ({
      id: t.id,
      amount: Math.round(Number(t.amount) || 0),
      reason: t.reason,
      project: t.project_id != null ? (names.get(t.project_id as number) ?? "") : "",
      created_at: t.created_at,
    })),
  });
});

// Player-card photo settings. The photo itself goes through /api/uploads
// (or comes from Slack at sign-up); these just point the card at it.
router.get("/api/profile/card", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  let { data: user, error } = await supabase
    .from("users")
    .select("avatar_url, card_pixelate")
    .eq("id", session.userId)
    .maybeSingle();
  if (error)
    ({ data: user } = (await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", session.userId)
      .maybeSingle()) as { data: typeof user });
  res.json({
    ok: true,
    avatar_url: user?.avatar_url ?? "",
    pixelate: user?.card_pixelate ?? true,
  });
});

router.post("/api/profile/card-image", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  if (!url.startsWith("https://") || url.length > 500)
    return res.status(400).json({ ok: false, error: "bad_url" });
  const { error } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", session.userId);
  if (error) {
    console.error("[profile] card image update failed", error.message);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true });
});

router.post("/api/profile/card-pixelate", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const pixelate = req.body?.pixelate === true;
  const { error } = await supabase
    .from("users")
    .update({ card_pixelate: pixelate })
    .eq("id", session.userId);
  if (error) {
    console.error("[profile] card pixelate update failed", error.message);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true });
});

export default router;
