const ARCHIVE_URL = "https://ships.hackclub.com/api/v1/ysws_entries";
const CACHE_MS = 10 * 60_000;

export interface YswsShip {
  ysws: string;
  approvedAt: string | null;
  hours: number;
  codeUrl: string;
  demoUrl: string;
  description: string;
  urlMatch: boolean;
}

interface ArchiveEntry {
  ysws?: string;
  approved_at?: number;
  hours?: number;
  code_url?: string;
  demo_url?: string;
  description?: string;
  slack_id?: string;
}

let cache: { at: number; entries: ArchiveEntry[] } | null = null;

function norm(raw: string): string {
  let s = (raw ?? "").trim().toLowerCase();
  if (s === "" || s === "null") return "";
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.replace(/\.git$/, "");
  s = s.replace(/\/+$/, "");
  return s;
}

async function loadArchive(): Promise<ArchiveEntry[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.entries;
  try {
    const r = await fetch(ARCHIVE_URL, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const json = (await r.json()) as unknown;
    const entries = (Array.isArray(json) ? json : []) as ArchiveEntry[];
    cache = { at: Date.now(), entries };
    return entries;
  } catch (e) {
    console.error("ysws archive fetch failed", (e as Error).message);
    return cache?.entries ?? [];
  }
}

// Archive entries that reuse THIS project's repo/demo URL , i.e. the same
// project shipped to another YSWS (a possible double-dip). Reviewers compare
// hours and dates for overlap before crediting. The maker's unrelated ships are
// intentionally not returned; they're noise on a per-project review.
export async function yswsShipsFor(
  _slackId: string | null | undefined,
  repoUrl: string | null,
  demoUrl: string | null,
): Promise<YswsShip[]> {
  const entries = await loadArchive();
  const repo = norm(repoUrl ?? "");
  const demo = norm(demoUrl ?? "");
  if (repo === "" && demo === "") return [];

  const out: YswsShip[] = [];
  for (const e of entries) {
    const eRepo = norm(e.code_url ?? "");
    const eDemo = norm(e.demo_url ?? "");
    const urlMatch =
      (repo !== "" && (eRepo === repo || eDemo === repo)) ||
      (demo !== "" && (eRepo === demo || eDemo === demo));
    if (!urlMatch) continue;
    out.push({
      ysws: String(e.ysws ?? "?"),
      approvedAt:
        typeof e.approved_at === "number" && e.approved_at > 0
          ? new Date(e.approved_at * 1000).toISOString()
          : null,
      hours: Number(e.hours) || 0,
      codeUrl: String(e.code_url ?? "").trim(),
      demoUrl: String(e.demo_url ?? "").trim(),
      description: String(e.description ?? "").slice(0, 300),
      urlMatch,
    });
  }
  out.sort((a, b) => {
    if (a.urlMatch !== b.urlMatch) return a.urlMatch ? -1 : 1;
    return (b.approvedAt ?? "").localeCompare(a.approvedAt ?? "");
  });
  return out;
}
