import { db } from "@/lib/db";

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
    const [{ count: total }, { count: open }, { count: resolved }] = await Promise.all([
      db.from("tickets").select("*", { count: "exact", head: true }),
      db.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      db.from("tickets").select("*", { count: "exact", head: true }).eq("status", "closed"),
    ]);
    return { total: total ?? 0, open: open ?? 0, resolved: resolved ?? 0 };
  } catch (e) {
    console.error("ticketStats", (e as Error).message);
    return { total: 0, open: 0, resolved: 0 };
  }
}

export async function listTickets(
  status: "open" | "closed" | "all" = "open",
  search = "",
): Promise<Ticket[]> {
  try {
    let q = db.from("tickets").select("*").order("msg_ts", { ascending: false }).limit(200);
    if (status !== "all") q = q.eq("status", status);
    if (search.trim()) q = q.ilike("description", `%${search.trim()}%`);
    const { data } = await q;
    return (data ?? []) as Ticket[];
  } catch (e) {
    console.error("listTickets", (e as Error).message);
    return [];
  }
}

export interface ActivityPoint {
  date: string;
  created: number;
  resolved: number;
}

export async function ticketActivity(): Promise<ActivityPoint[]> {
  try {
    const cutoff = new Date(Date.now() - 30 * 86400_000);
    const [{ data: all }, { data: closed }] = await Promise.all([
      db.from("tickets").select("msg_ts, closed_at"),
      db.from("tickets").select("closed_at").eq("status", "closed"),
    ]);

    const cMap = new Map<string, number>();
    const rMap = new Map<string, number>();

    for (const t of all ?? []) {
      const d = new Date(parseFloat(t.msg_ts) * 1000);
      if (d >= cutoff) {
        const key = d.toISOString().slice(0, 10);
        cMap.set(key, (cMap.get(key) ?? 0) + 1);
      }
    }
    for (const t of closed ?? []) {
      if (t.closed_at) {
        const d = new Date(t.closed_at);
        if (d >= cutoff) {
          const key = d.toISOString().slice(0, 10);
          rMap.set(key, (rMap.get(key) ?? 0) + 1);
        }
      }
    }

    const out: ActivityPoint[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, created: cMap.get(key) ?? 0, resolved: rMap.get(key) ?? 0 });
    }
    return out;
  } catch (e) {
    console.error("ticketActivity", (e as Error).message);
    return [];
  }
}

async function slackCall(
  method: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is not set");
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown> & {
    ok: boolean;
    error?: string;
  };
  if (!json.ok) throw new Error(`Slack ${method} failed: ${json.error}`);
  return json;
}

const userCache = new Map<string, { name: string; avatar: string | null }>();

async function getSlackUser(id: string) {
  const hit = userCache.get(id);
  if (hit) return hit;
  try {
    const res = (await slackCall("users.info", { user: id })) as {
      user?: { profile?: { display_name?: string; real_name?: string; image_72?: string } };
    };
    const p = res.user?.profile;
    const info = {
      name: p?.display_name || p?.real_name || id,
      avatar: p?.image_72 ?? null,
    };
    userCache.set(id, info);
    setTimeout(() => userCache.delete(id), 5 * 60_000);
    return info;
  } catch {
    return { name: id, avatar: null };
  }
}

export async function ticketThread(ts: string): Promise<ThreadMessage[]> {
  const channel = process.env.SLACK_HELP_CHANNEL;
  if (!channel) throw new Error("SLACK_HELP_CHANNEL is not set");
  const res = (await slackCall("conversations.replies", {
    channel,
    ts,
    limit: 200,
  })) as { messages?: { ts: string; text: string; user?: string; username?: string; bot_id?: string; icons?: { image_72?: string } }[] };
  const messages = res.messages ?? [];
  return Promise.all(
    messages.map(async (msg, i) => {
      let name = msg.username || "Bot";
      let avatar = msg.icons?.image_72 ?? null;
      if (msg.user) {
        const u = await getSlackUser(msg.user);
        name = u.name;
        avatar = u.avatar;
      }
      return {
        ts: msg.ts,
        text: msg.text,
        name,
        avatar,
        isFirst: i === 0,
        isBot: !!msg.bot_id,
      };
    }),
  );
}

export async function ticketReply(
  ts: string,
  text: string,
  actor: { slackId?: string; username?: string },
): Promise<void> {
  const channel = process.env.SLACK_HELP_CHANNEL;
  if (!channel) throw new Error("SLACK_HELP_CHANNEL is not set");
  let username = actor.username || "Support";
  let icon_url: string | null = null;
  if (actor.slackId) {
    const u = await getSlackUser(actor.slackId);
    username = u.name;
    icon_url = u.avatar;
  }
  const body: Record<string, unknown> = {
    channel,
    thread_ts: ts,
    text: text.trim(),
    username,
  };
  if (icon_url) body.icon_url = icon_url;
  await slackCall("chat.postMessage", body);
}

export interface ResolveResult {
  ok: boolean;
  error?: string;
  alreadyClosed?: boolean;
}

// Resolve a ticket straight from the dashboard: close it in the DB, swap the
// help-channel reactions and drop a note in the thread. Mirrors the Pixorpheus
// bot's "Mark resolved" button so both stay in sync (shared `tickets` table).
export async function resolveTicketFromDash(
  ts: string,
  actor: { slackId: string; username: string },
): Promise<ResolveResult> {
  const { data: ticket, error: readError } = await db
    .from("tickets")
    .select("status")
    .eq("msg_ts", ts)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!ticket) return { ok: false, error: "No ticket found for this message." };
  if (ticket.status === "closed") return { ok: true, alreadyClosed: true };

  const { error } = await db
    .from("tickets")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by_slack_id: actor.slackId,
    })
    .eq("msg_ts", ts);
  if (error) return { ok: false, error: error.message };

  // Slack side-effects are best-effort , the DB row is the source of truth.
  const channel = process.env.SLACK_HELP_CHANNEL;
  if (channel) {
    try {
      await slackCall("reactions.add", { channel, timestamp: ts, name: "white_check_mark" });
    } catch {
      /* reaction may already exist */
    }
    try {
      await slackCall("reactions.remove", { channel, timestamp: ts, name: "thinking_face" });
    } catch {
      /* reaction may not be present */
    }
    try {
      await ticketReply(ts, `✅ Resolved by ${actor.username} from the dashboard.`, actor);
    } catch {
      /* thread note is a nicety, not required */
    }
  }
  return { ok: true };
}