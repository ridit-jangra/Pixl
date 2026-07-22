// Thin client for the HackTime API. We only need the authenticated project
// list (used to show "connected" + per-project time and to offer projects to
// link). Base URL is overridable via env for staging.
const BASE = (process.env.HACKATIME_BASE ?? "https://hackatime.hackclub.com").replace(/\/$/, "");
const PROJECTS_PATH = "/api/v1/authenticated/projects";

export interface HackatimeProject {
  name: string;
  seconds: number;
}

export interface HackatimeStats {
  connected: boolean;
  projects: HackatimeProject[];
  totalSeconds: number;
  error?: string;
}

const DISCONNECTED: HackatimeStats = { connected: false, projects: [], totalSeconds: 0 };

export async function fetchHackatimeStats(token: string | null): Promise<HackatimeStats> {
  if (!token) return DISCONNECTED;
  try {
    const res = await fetch(BASE + PROJECTS_PATH, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (res.status === 401) return { ...DISCONNECTED, error: "invalid_key" };
    if (!res.ok) return { ...DISCONNECTED, error: `http_${res.status}` };

    const body = (await res.json()) as {
      projects?: unknown[];
      data?: { projects?: unknown[] };
    };
    const raw = body.projects ?? body.data?.projects ?? [];
    const projects: HackatimeProject[] = raw
      .map((p) => {
        const o = p as { name?: unknown; total_seconds?: unknown; seconds?: unknown };
        return {
          name: String(o.name ?? ""),
          seconds: Number(o.total_seconds ?? o.seconds ?? 0),
        };
      })
      .filter((p) => p.name.length > 0);
    const totalSeconds = projects.reduce((sum, p) => sum + p.seconds, 0);
    return { connected: true, projects, totalSeconds };
  } catch (e) {
    console.error("[hackatime] fetch failed:", (e as Error)?.message ?? e);
    return { ...DISCONNECTED, error: "fetch_failed" };
  }
}
