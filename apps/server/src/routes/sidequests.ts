import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";

const router = Router();

// Quest log: every active sidequest, flagged with whether this player has
// unlocked it (NPCs grant unlocks; that wiring lands later).
router.get("/api/sidequests", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const [{ data: quests, error }, { data: unlocks }] = await Promise.all([
    supabase
      .from("sidequests")
      .select("id, name, region, npc, description, reward")
      .eq("active", true)
      .order("position", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("sidequest_unlocks")
      .select("sidequest_id")
      .eq("user_id", session.userId),
  ]);
  if (error) return res.json({ ok: true, quests: [] });
  const unlocked = new Set((unlocks ?? []).map((u) => u.sidequest_id as number));
  res.json({
    ok: true,
    quests: (quests ?? []).map((q) => ({ ...q, unlocked: unlocked.has(q.id as number) })),
  });
});

export default router;
