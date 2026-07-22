const ARCHIVE_URL = "https://ships.hackclub.com/api/v1/ysws_entries";
const CACHE_MS = 10 * 60_000;

export interface ArchiveEntry {
  ysws: string;
  hours: number;
  approvedAt: number | null;
}

let cache: { at: number; entries: Map<string, ArchiveEntry> } | null = null;

export function normalizeProjectUrl(raw: string): string {
  let s = raw.trim().toLowerCase();
  if (s === "") return "";
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.replace(/\.git$/, "");
  s = s.replace(/\/+$/, "");
  return s;
}

async function loadArchive(): Promise<Map<string, ArchiveEntry> | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.entries;
  try {
    const r = await fetch(ARCHIVE_URL, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const json = (await r.json()) as any;
    const raw: unknown[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.entries)
        ? json.entries
        : Array.isArray(json?.data)
          ? json.data
          : [];
    const entries = new Map<string, ArchiveEntry>();
    for (const e of raw) {
      const entry = e as Record<string, unknown>;
      const info: ArchiveEntry = {
        ysws: String(entry.ysws ?? "another YSWS"),
        hours: Number(entry.hours) || 0,
        approvedAt: Number(entry.approved_at) > 0 ? Number(entry.approved_at) : null,
      };
      for (const key of ["code_url", "demo_url"]) {
        const u = normalizeProjectUrl(String(entry[key] ?? ""));
        if (u !== "" && !entries.has(u)) entries.set(u, info);
      }
    }
    cache = { at: Date.now(), entries };
    return entries;
  } catch (e) {
    console.error("[ships-archive] fetch failed", e);
    return cache?.entries ?? null;
  }
}

export interface ArchiveMatch extends ArchiveEntry {
  url: string;
}

// Returns the archive entry for the first of the given URLs that already
// exists in the Hack Club YSWS archive, or null when none match / the archive
// is unreachable.
export async function findInYswsArchive(
  repoUrl: string,
  demoUrl: string,
): Promise<ArchiveMatch | null> {
  const entries = await loadArchive();
  if (!entries) return null;
  const repo = normalizeProjectUrl(repoUrl);
  if (repo !== "" && entries.has(repo)) return { url: repoUrl, ...entries.get(repo)! };
  const demo = normalizeProjectUrl(demoUrl);
  if (demo !== "" && entries.has(demo)) return { url: demoUrl, ...entries.get(demo)! };
  return null;
}
