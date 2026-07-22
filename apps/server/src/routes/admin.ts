import { Router, type Request } from "express";
import { listOnlinePlayers, kickPlayer } from "../ws/gameServer.js";

const router = Router();

// Dashboard-to-server admin API, guarded by a shared secret.
function authorized(req: Request): boolean {
  const key = process.env.ADMIN_API_KEY;
  return !!key && req.header("x-admin-key") === key;
}

router.get("/api/admin/online", (req, res) => {
  if (!authorized(req)) return res.status(401).json({ ok: false });
  res.json({ ok: true, players: listOnlinePlayers() });
});

router.post("/api/admin/kick", (req, res) => {
  if (!authorized(req)) return res.status(401).json({ ok: false });
  const userId = String(req.body?.userId ?? "");
  const reason = String(req.body?.reason ?? "").slice(0, 100);
  if (!userId) return res.status(400).json({ ok: false, error: "userId required" });
  const kicked = kickPlayer(
    userId,
    reason ? `Kicked by a moderator: ${reason}` : "",
  );
  res.json({ ok: true, kicked });
});

export default router;
