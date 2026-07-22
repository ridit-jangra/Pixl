import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";

const router = Router();

// Drop a notification into a user's inbox. Best-effort: failures are logged,
// never thrown, so they can't break the action that triggered them.
export async function addNotification(
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, title, body });
  if (error) console.error("[notifications] insert failed", error);
}

// Automation hook: external tools push notifications with the server's API
// key. Omit userId to broadcast to every registered player.
router.post("/api/admin/notifications", async (req, res) => {
  const key =
    req.header("x-api-key") ??
    (typeof req.query.key === "string" ? req.query.key : "");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY)
    return res.status(401).json({ ok: false, reason: "Bad API key." });

  const title =
    typeof req.body?.title === "string" ? req.body.title.trim().slice(0, 100) : "";
  const body =
    typeof req.body?.body === "string" ? req.body.body.trim().slice(0, 500) : "";
  if (!title || !body)
    return res.status(400).json({ ok: false, reason: "title and body required." });

  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  if (userId) {
    const { error } = await supabase
      .from("notifications")
      .insert({ user_id: userId, title, body });
    if (error) {
      console.error("[notifications] admin insert failed", error);
      return res.status(500).json({ ok: false });
    }
    return res.json({ ok: true, sent: 1 });
  }

  const { data, error } = await supabase.from("users").select("id");
  if (error) {
    console.error("[notifications] admin user list failed", error);
    return res.status(500).json({ ok: false });
  }
  const rows = (data ?? []).map((u) => ({
    user_id: u.id as string,
    title,
    body,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error: insertError } = await supabase
      .from("notifications")
      .insert(rows.slice(i, i + 500));
    if (insertError) {
      console.error("[notifications] admin broadcast failed", insertError);
      return res.status(500).json({ ok: false, sent: i });
    }
  }
  res.json({ ok: true, sent: rows.length });
});

router.get("/api/notifications", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[notifications] list failed", error);
    return res.status(500).json({ ok: false });
  }
  const notifications = data ?? [];
  const unread = notifications.filter((n: { read?: boolean }) => !n.read).length;
  res.json({ ok: true, notifications, unread });
});

router.post("/api/notifications/read", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", session.userId)
    .eq("read", false);
  if (error) {
    console.error("[notifications] read failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true });
});

export default router;
