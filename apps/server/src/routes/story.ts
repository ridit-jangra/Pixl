import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";

const router = Router();

// The season timeline (Chronicle). Authored in the dashboard; the web /timeline
// page renders whatever active nodes come back here, in order.
router.get("/api/story", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await supabase
    .from("story_nodes")
    .select("kind, seal, tag, duration, title, body, quote, outcome")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    console.error("[story] list failed", error.message);
    return res.json({ ok: true, nodes: [] });
  }
  res.json({ ok: true, nodes: data ?? [] });
});

export default router;
