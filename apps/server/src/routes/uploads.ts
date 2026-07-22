import express, { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { checkImageSafe } from "../imageModeration.js";

const router = Router();

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Proxy image uploads to the Hack Club CDN so the key stays server-side.
router.post(
  "/api/uploads",
  express.raw({ type: IMAGE_TYPES, limit: "8mb" }),
  async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const session = token ? verifySessionToken(token) : null;
    if (!session) return res.status(401).json({ ok: false });

    const key = process.env.HACKCLUB_CDN_KEY;
    if (!key)
      return res.status(503).json({ ok: false, error: "cdn_not_configured" });

    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || buf.length === 0)
      return res.status(400).json({ ok: false, error: "empty_body" });

    const type = String(req.headers["content-type"] ?? "image/png");

    const safety = await checkImageSafe(buf, type);
    if (!safety.safe) {
      return res
        .status(400)
        .json({ ok: false, error: "image_rejected", reason: safety.reason });
    }

    const ext = type === "image/jpeg" ? "jpg" : (type.split("/")[1] ?? "png");
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(buf)], { type }),
      `journal-${Date.now()}.${ext}`,
    );

    try {
      const r = await fetch("https://cdn.hackclub.com/api/v4/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
      if (!r.ok) {
        console.error("[uploads] cdn rejected", r.status, await r.text());
        return res.status(502).json({ ok: false, error: "cdn_failed" });
      }
      const json = (await r.json()) as { url?: string };
      if (!json.url) {
        console.error("[uploads] cdn response missing url", json);
        return res.status(502).json({ ok: false, error: "cdn_failed" });
      }
      res.json({ ok: true, url: json.url });
    } catch (e) {
      console.error("[uploads] cdn upload failed", e);
      res.status(502).json({ ok: false, error: "cdn_failed" });
    }
  },
);

export default router;
