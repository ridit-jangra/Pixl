import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";
import { activeEvents } from "../events.js";
import { approvedHoursFor, levelFor } from "../xp.js";

const router = Router();

// Public-to-players directory: browse everyone, their projects and journals.
router.get("/api/explore/players", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const buildQuery = (fields: string) => {
    let query = supabase
      .from("users")
      .select(fields)
      .order("created_at", { ascending: false })
      .limit(100);
    if (q) query = query.ilike("display_name", `%${q}%`);
    return query;
  };
  // card_pixelate arrives with migration 0030 — fall back gracefully before it.
  const first = await buildQuery(
    "id, display_name, skin, created_at, avatar_url, card_pixelate, slack_id",
  );
  let users = (first.data ?? null) as Record<string, unknown>[] | null;
  let error = first.error;
  if (error) {
    const second = await buildQuery(
      "id, display_name, skin, created_at, avatar_url, slack_id",
    );
    users = (second.data ?? null) as Record<string, unknown>[] | null;
    error = second.error;
  }
  if (error) {
    console.error("[explore] players failed", error);
    return res.status(500).json({ ok: false });
  }

  const ids = (users ?? []).map((u) => u.id as string);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("user_id")
      .is("archived_at", null)
      .is("rejected_at", null)
    .is("banned_at", null)
    .eq("status", "approved")
      .in("user_id", ids);
    for (const p of projects ?? [])
      counts.set(p.user_id as string, (counts.get(p.user_id as string) ?? 0) + 1);
  }

  res.json({
    ok: true,
    players: (users ?? []).map((u) => ({
      ...u,
      project_count: counts.get(u.id as string) ?? 0,
    })),
  });
});

// Top pixel balances for the in-game leaderboard. Read-only; balances are
// server-authoritative so this can't be gamed from the client.
router.get("/api/explore/leaderboard", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, skin, pixels")
    .gt("pixels", 0)
    .order("pixels", { ascending: false })
    .limit(25);
  if (error) {
    console.error("[explore] leaderboard failed", error);
    return res.status(500).json({ ok: false });
  }
  const players = (data ?? []).map((u, i) => ({
    rank: i + 1,
    id: u.id,
    display_name: u.display_name,
    skin: u.skin,
    pixels: Math.round(Number(u.pixels) || 0),
    you: u.id === session.userId,
  }));

  let yourRank = players.find((p) => p.you)?.rank ?? 0;
  let yourPixels = players.find((p) => p.you)?.pixels ?? -1;
  if (yourPixels < 0) {
    const { data: me } = await supabase
      .from("users")
      .select("pixels")
      .eq("id", session.userId)
      .single();
    yourPixels = Math.round(Number(me?.pixels) || 0);
    if (yourPixels > 0) {
      const { count } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gt("pixels", yourPixels);
      yourRank = (count ?? 0) + 1;
    }
  }

  // During a leaderboard sprint, a second board counts only pixels earned
  // inside the event window (approvals and bounties — nothing manual).
  let sprint: Record<string, unknown> | null = null;
  const [sprintEvent] = await activeEvents(["leaderboard_sprint"]);
  if (sprintEvent) {
    const { data: txs } = await supabase
      .from("pixel_transactions")
      .select("user_id, amount")
      .gt("amount", 0)
      .in("reason", ["project_approved", "bounty"])
      .gte("created_at", sprintEvent.starts_at)
      .lt("created_at", sprintEvent.ends_at);
    const earned = new Map<string, number>();
    for (const t of txs ?? [])
      earned.set(t.user_id as string, (earned.get(t.user_id as string) ?? 0) + Number(t.amount));
    const ranked = [...earned.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
    const names = new Map<string, string>();
    if (ranked.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, display_name")
        .in("id", ranked.map(([id]) => id));
      for (const u of users ?? []) names.set(u.id as string, u.display_name as string);
    }
    sprint = {
      name: sprintEvent.name || "Leaderboard sprint",
      ends_at: sprintEvent.ends_at,
      players: ranked.map(([id, px], i) => ({
        rank: i + 1,
        display_name: names.get(id) ?? "?",
        pixels: Math.round(px),
        you: id === session.userId,
      })),
      your_pixels: Math.round(earned.get(session.userId) ?? 0),
    };
  }

  res.json({ ok: true, players, yourRank, yourPixels, sprint });
});

// Proxy to Pixo's avatar pixelator so the API key never reaches the client.
// Returns the player's Slack avatar as an already-pixelated PNG.
const EXTERNAL_PIXIFY_URL =
  process.env.EXTERNAL_PIXIFY_URL ??
  "https://dashboard.gabintavernier.com/api/external/pixify";

router.get("/api/pixify", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const slackId = typeof req.query.user === "string" ? req.query.user : "";
  const size = Math.min(Math.max(Number(req.query.size) || 32, 2), 64);
  const key = process.env.EXTERNAL_API_KEY;
  if (!slackId || !/^[A-Z0-9]{5,20}$/.test(slackId))
    return res.status(400).json({ ok: false });
  if (!key) return res.status(503).json({ ok: false, error: "pixify_not_configured" });

  try {
    const r = await fetch(
      `${EXTERNAL_PIXIFY_URL}?userId=${encodeURIComponent(slackId)}&size=${size}`,
      { headers: { "x-api-key": key }, signal: AbortSignal.timeout(10_000) },
    );
    if (!r.ok) return res.status(r.status === 404 ? 404 : 502).json({ ok: false });
    const buf = Buffer.from(await r.arrayBuffer());
    res
      .set("Content-Type", "image/png")
      .set("Cache-Control", "public, max-age=3600")
      .send(buf);
  } catch {
    res.status(502).json({ ok: false });
  }
});

router.get("/api/explore/showcase", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .is("archived_at", null)
    .is("rejected_at", null)
    .is("banned_at", null)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(4);
  if (error) {
    console.error("[explore] showcase failed", error);
    return res.status(500).json({ ok: false });
  }

  const ids = [...new Set((projects ?? []).map((p) => p.user_id as string))];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", ids);
    for (const u of users ?? []) names.set(u.id as string, u.display_name as string);
  }

  res.json({
    ok: true,
    projects: (projects ?? []).map((p) => ({
      ...p,
      owner_name: names.get(p.user_id as string) ?? "?",
    })),
  });
});

router.get("/api/explore/players/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = String(req.params.id);
  const userQuery = (fields: string) =>
    supabase.from("users").select(fields).eq("id", id).maybeSingle();
  const [user, fallbackUser, projects] = await Promise.all([
    userQuery("id, display_name, skin, created_at, pixels, avatar_url, card_pixelate, slack_id"),
    userQuery("id, display_name, skin, created_at, pixels, avatar_url, slack_id"),
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", id)
      .is("archived_at", null)
      .is("rejected_at", null)
    .is("banned_at", null)
    .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ]);
  const data = (user.error ? fallbackUser.data : user.data) as Record<string, unknown> | null;
  if (!data) return res.status(404).json({ ok: false });

  const xp = await approvedHoursFor(id);
  res.json({
    ok: true,
    player: { ...data, xp_hours: xp, level: levelFor(xp) },
    projects: projects.data ?? [],
  });
});

// Browse everyone's projects, newest first, with an optional search filter.
router.get("/api/explore/projects", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  let query = supabase
    .from("projects")
    .select("*")
    .is("archived_at", null)
    .is("rejected_at", null)
    .is("banned_at", null)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: projects, error } = await query;
  if (error) {
    console.error("[explore] projects failed", error);
    return res.status(500).json({ ok: false });
  }

  const ids = [...new Set((projects ?? []).map((p) => p.user_id as string))];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", ids);
    for (const u of users ?? []) names.set(u.id as string, u.display_name as string);
  }

  res.json({
    ok: true,
    projects: (projects ?? []).map((p) => ({
      ...p,
      owner_name: names.get(p.user_id as string) ?? "?",
    })),
  });
});

router.get("/api/explore/projects/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("archived_at", null)
    .is("rejected_at", null)
    .is("banned_at", null)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !project) return res.status(404).json({ ok: false });

  const [owner, entries] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name")
      .eq("id", project.user_id as string)
      .maybeSingle(),
    supabase
      .from("project_journals")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  res.json({
    ok: true,
    project,
    owner: owner.data ?? null,
    entries: entries.data ?? [],
  });
});

export default router;
