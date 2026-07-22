import { supabase } from "./db/client.js";

// XP = 1 per approved hour; level = approved hours, capped at 100. Payout is a
// flat $4.00/hr base plus an XP bonus that ramps linearly to $6.00/hr at level
// 100. 10 px = $1, so px/hr = $/hr x 10 (40 px base -> 60 px at max level).
export const BASE_PX_PER_HOUR = 40;
export const MAX_PX_PER_HOUR = 60;
export const MAX_LEVEL = 100;

export function levelFor(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(Math.max(xp, 0)));
}

export function pxPerHourFor(xp: number): number {
  const level = levelFor(xp);
  return Math.round(
    BASE_PX_PER_HOUR + ((MAX_PX_PER_HOUR - BASE_PX_PER_HOUR) * level) / MAX_LEVEL,
  );
}

export async function approvedHoursFor(
  userId: string,
  excludeProjectId?: number,
): Promise<number> {
  let q = supabase
    .from("projects")
    .select("id, approved_hours, hackatime_seconds")
    .eq("user_id", userId)
    .eq("status", "approved")
    .is("banned_at", null);
  if (excludeProjectId) q = q.neq("id", excludeProjectId);
  const { data } = await q;
  return (
    Math.round(
      (data ?? []).reduce((s, p) => {
        const h =
          p.approved_hours != null
            ? Number(p.approved_hours)
            : (Number(p.hackatime_seconds) || 0) / 3600;
        return s + (Number.isFinite(h) ? h : 0);
      }, 0) * 10,
    ) / 10
  );
}

// Total Restoration Energy pooled by the whole community: every approved hour
// shipped, summed across all players. Drives the Core Vault's community goals.
export async function communityEnergy(): Promise<number> {
  const { data } = await supabase
    .from("projects")
    .select("approved_hours, hackatime_seconds")
    .eq("status", "approved")
    .is("banned_at", null);
  const hours = (data ?? []).reduce((s, p) => {
    const h =
      p.approved_hours != null
        ? Number(p.approved_hours)
        : (Number(p.hackatime_seconds) || 0) / 3600;
    return s + (Number.isFinite(h) ? h : 0);
  }, 0);
  return Math.round(hours);
}
