import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";
import { runReportAnalysis, postReportToSlack } from "../reports.js";

const router = Router();

// File a report from the web report page. Anonymous by default; the reporter
// can opt to reveal their identity to the review team.
router.post("/api/reports", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const targetId = String(req.body?.targetId ?? "").trim();
  const reason = String(req.body?.reason ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
  const anonymous = req.body?.anonymous !== false;
  if (!targetId || targetId === session.userId)
    return res.status(400).json({ ok: false, error: "bad_target" });

  const { data: target } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("id", targetId)
    .single();
  if (!target) return res.status(404).json({ ok: false, error: "no_target" });

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", session.userId)
    .gte("created_at", since);
  if ((count ?? 0) >= 5)
    return res.status(429).json({ ok: false, error: "rate_limited" });

  const { data: inserted, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: session.userId,
      target_id: targetId,
      reason,
      anonymous,
      scene: "",
      context: [],
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.error("report insert failed", error?.message);
    return res.status(500).json({ ok: false });
  }

  const reportId = inserted.id as number;
  void (async () => {
    const ai = await runReportAnalysis(
      reportId,
      targetId,
      target.display_name,
      reason,
    );
    await postReportToSlack(reportId, target.display_name, reason, ai);
  })().catch(console.error);

  res.json({ ok: true, id: reportId });
});

// Reports this player has filed (their own history).
router.get("/api/reports/mine", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data } = await supabase
    .from("reports")
    .select("id, target_id, reason, status, anonymous, created_at")
    .eq("reporter_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.target_id as string))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: users } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", ids);
    for (const u of users ?? []) names.set(u.id as string, u.display_name as string);
  }
  res.json({
    ok: true,
    reports: rows.map((r) => ({
      ...r,
      target_name: names.get(r.target_id as string) ?? "player",
    })),
  });
});

// Player search to pick who to report (by display name), excluding self.
router.get("/api/reports/players", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const q = String(req.query.q ?? "")
    .replace(/[,()%*\\]/g, " ")
    .trim();
  if (q.length < 2) return res.json({ ok: true, players: [] });
  const { data } = await supabase
    .from("users")
    .select("id, display_name")
    .ilike("display_name", `%${q}%`)
    .neq("id", session.userId)
    .limit(8);
  res.json({ ok: true, players: data ?? [] });
});

export default router;
