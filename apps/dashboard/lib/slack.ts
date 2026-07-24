const API = "https://slack.com/api";

function botToken(): string {
  const t = process.env.SLACK_BOT_TOKEN;
  if (!t) throw new Error("SLACK_BOT_TOKEN is not set");
  return t;
}

async function slackCall(
  method: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken()}`,
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

const HANDLE_TTL = 10 * 60_000;

// Workspace-wide id -> profile photo map, for filling player cards.
export async function slackAvatars(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!process.env.SLACK_BOT_TOKEN) return map;
  try {
    let cursor = "";
    for (let page = 0; page < 20; page++) {
      const res = (await slackCall("users.list", { limit: 200, cursor })) as {
        members?: { id?: string; profile?: { image_512?: string; image_192?: string } }[];
        response_metadata?: { next_cursor?: string };
      };
      for (const u of res.members ?? []) {
        const img = u.profile?.image_512 || u.profile?.image_192;
        if (u.id && img) map.set(u.id, img);
      }
      cursor = res.response_metadata?.next_cursor ?? "";
      if (!cursor) break;
    }
  } catch (e) {
    console.error("slack avatars failed", (e as Error).message);
  }
  return map;
}

// Resolve a single id -> "@handle" via one users.info call (cheap and fast),
// cached per-id. This replaces crawling the whole workspace with users.list,
// which paginated up to 20 rate-limited calls and stalled the review page.
const idHandleCache = new Map<string, { at: number; handle: string | null }>();

export async function slackHandle(id: string | null | undefined): Promise<string | null> {
  if (!id) return null;
  const hit = idHandleCache.get(id);
  if (hit && Date.now() - hit.at < HANDLE_TTL) return hit.handle;
  let handle: string | null = null;
  if (process.env.SLACK_BOT_TOKEN) {
    try {
      const res = (await slackCall("users.info", { user: id })) as {
        user?: { name?: string; profile?: { display_name?: string } };
      };
      const h = res.user?.profile?.display_name || res.user?.name;
      handle = h ? `@${h}` : null;
    } catch (e) {
      console.error("slack users.info failed", (e as Error).message);
    }
  }
  idHandleCache.set(id, { at: Date.now(), handle });
  return handle;
}

export async function slackHandles(
  ids: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const uniq = [...new Set(ids.filter((x): x is string => !!x))];
  const out = new Map<string, string>();
  await Promise.all(
    uniq.map(async (id) => {
      const h = await slackHandle(id);
      if (h) out.set(id, h);
    }),
  );
  return out;
}

// Post to a channel as the dashboard bot (bot must be invited to the channel).
export async function postToChannel(channel: string, text: string): Promise<void> {
  await slackCall("chat.postMessage", { channel, text, unfurl_links: false });
}

// Opens (or reuses) a DM with the user and sends the message.
const EXTERNAL_DM_URL =
  process.env.EXTERNAL_DM_URL ?? "https://dashboard.gabintavernier.com/api/external/dm";

// All player-facing DMs (warns, bans, project approve/reject/ban, notices) go
// out as Pixorpheus via the external DM API, not the internal dashboard bot.
export async function dmUser(slackUserId: string, text: string): Promise<void> {
  const key = process.env.EXTERNAL_API_KEY;
  if (!key) throw new Error("EXTERNAL_API_KEY is not set");
  const res = await fetch(EXTERNAL_DM_URL, {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ userId: slackUserId, message: text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error ?? "";
    } catch {}
    throw new Error(`Pixorpheus DM failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
}
