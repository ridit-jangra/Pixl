// Tickets live in Pixorpheus, not our DB. We read them (and post threaded
// replies) through its EXTERNAL_API_KEY endpoints , same auth pattern as the
// external DM call in lib/slack.ts.
const BASE = process.env.EXTERNAL_API_BASE ?? "https://dashboard.gabintavernier.com/api/external";

function apiKey(): string {
  const key = process.env.EXTERNAL_API_KEY;
  if (!key) throw new Error("EXTERNAL_API_KEY is not set");
  return key;
}

async function pixo(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "x-api-key": apiKey(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(8000),
  });
}

export interface TicketStats {
  total: number;
  open: number;
  resolved: number;
}

export interface Ticket {
  msg_ts: string;
  description: string;
  title: string;
  status: string;
  opened_by_slack_id: string;
  permalink: string | null;
}

export interface ThreadMessage {
  ts: string;
  text: string;
  name: string;
  avatar: string | null;
  isFirst: boolean;
  isBot: boolean;
}

export async function ticketStats(): Promise<TicketStats> {
  try {
    const res = await pixo("/tickets/stats");
    if (!res.ok) return { total: 0, open: 0, resolved: 0 };
    const d = (await res.json()) as Partial<TicketStats>;
    return { total: d.total ?? 0, open: d.open ?? 0, resolved: d.resolved ?? 0 };
  } catch {
    return { total: 0, open: 0, resolved: 0 };
  }
}

export async function listTickets(
  status: "open" | "closed" | "all" = "open",
  search = "",
): Promise<Ticket[]> {
  const params = new URLSearchParams({ status });
  if (search.trim()) params.set("search", search.trim());
  try {
    const res = await pixo(`/tickets?${params}`);
    if (!res.ok) return [];
    return (await res.json()) as Ticket[];
  } catch {
    return [];
  }
}

export interface ActivityPoint {
  date: string;
  created: number;
  resolved: number;
}

// A full aligned 30-day window (created vs resolved per day) for the activity
// chart. Pixorpheus keys days as YYYY-MM-DD; we fill the gaps with zeros.
export async function ticketActivity(): Promise<ActivityPoint[]> {
  let created: { day: string; count: number }[] = [];
  let resolved: { day: string; count: number }[] = [];
  try {
    const res = await pixo("/tickets/activity");
    if (res.ok) {
      const d = (await res.json()) as {
        created?: { day: string; count: number }[];
        resolved?: { day: string; count: number }[];
      };
      created = d.created ?? [];
      resolved = d.resolved ?? [];
    }
  } catch {
    // fall through to an empty (all-zero) window
  }
  const cMap = new Map(created.map((r) => [r.day, r.count]));
  const rMap = new Map(resolved.map((r) => [r.day, r.count]));
  const out: ActivityPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, created: cMap.get(key) ?? 0, resolved: rMap.get(key) ?? 0 });
  }
  return out;
}

export async function ticketThread(ts: string): Promise<ThreadMessage[]> {
  const res = await pixo(`/tickets/${encodeURIComponent(ts)}/thread`);
  if (!res.ok) throw new Error(`thread failed (${res.status})`);
  return (await res.json()) as ThreadMessage[];
}

export async function ticketReply(
  ts: string,
  text: string,
  actor: { slackId?: string; username?: string },
): Promise<void> {
  const res = await pixo(`/tickets/${encodeURIComponent(ts)}/reply`, {
    method: "POST",
    body: JSON.stringify({ text, slackId: actor.slackId, username: actor.username }),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error ?? "";
    } catch {}
    throw new Error(detail || `reply failed (${res.status})`);
  }
}
