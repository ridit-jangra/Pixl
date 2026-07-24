// Talks to the live PixlServer admin API (shared-secret guarded).

export interface OnlinePlayer {
  userId: string;
  displayName: string;
  scene: string;
  skin: string;
}

function config(): { url: string; key: string } | null {
  const url = process.env.PIXL_SERVER_URL;
  const key = process.env.ADMIN_API_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function gameServerConfigured(): boolean {
  return config() !== null;
}

export async function fetchOnlinePlayers(): Promise<OnlinePlayer[] | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/api/admin/online`, {
      headers: { "x-admin-key": cfg.key },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { ok: boolean; players?: OnlinePlayer[] };
    if (!json.ok) return null;
    return json.players ?? [];
  } catch (e) {
    console.error("fetchOnlinePlayers", (e as Error).message);
    return null;
  }
}

export async function kickOnlinePlayer(userId: string, reason: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/api/admin/kick`, {
      method: "POST",
      headers: { "x-admin-key": cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { ok: boolean; kicked?: boolean };
    return json.ok && json.kicked === true;
  } catch (e) {
    console.error("kickOnlinePlayer", (e as Error).message);
    return false;
  }
}
