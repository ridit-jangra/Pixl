import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";
import { communityEnergy } from "../xp.js";

const router = Router();

interface VaultReward {
  icon?: string;
  label?: string;
}

// The Core Vault: the community's pooled Restoration Energy recovers vault
// levels for everyone. A level unlocks once the total energy crosses its
// threshold — the rewards are equipment the Core has finally recovered.
router.get("/api/vault", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const [energy, { data: rows }] = await Promise.all([
    communityEnergy(),
    supabase
      .from("vault_levels")
      .select("level, energy_required, title, blurb, rewards")
      .eq("active", true)
      .order("position", { ascending: true })
      .order("level", { ascending: true }),
  ]);

  const levels = (rows ?? []).map((l) => ({
    level: Number(l.level),
    title: String(l.title ?? ""),
    blurb: String(l.blurb ?? ""),
    energyRequired: Number(l.energy_required),
    rewards: (Array.isArray(l.rewards) ? l.rewards : []) as VaultReward[],
    unlocked: energy >= Number(l.energy_required),
  }));

  const currentLevel = levels.reduce((m, l) => (l.unlocked ? Math.max(m, l.level) : m), 0);
  const next = levels.find((l) => !l.unlocked) ?? null;

  res.json({
    ok: true,
    energy,
    currentLevel,
    nextRequired: next ? next.energyRequired : null,
    levels,
  });
});

export default router;
