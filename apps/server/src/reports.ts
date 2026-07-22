import { supabase } from "./db/client.js";

const MODEL = "google/gemini-2.5-flash-lite";
const LOOKBACK_HOURS = 10;
const DASH_URL = "https://dash.pixl.rsvp";

export interface ReportAiResult {
  score: number;
  verdict: string;
  summary: string;
}

// The reported player's recent messages — the evidence the AI (and a human
// reviewer) judges, since chat is otherwise ephemeral.
export async function fetchTargetChat(
  targetId: string,
  hours = LOOKBACK_HOURS,
): Promise<{ text: string; created_at: string }[]> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const { data } = await supabase
    .from("chat_messages")
    .select("text, created_at")
    .eq("user_id", targetId)
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(400);
  return data ?? [];
}

// Models don't always honour strict-JSON mode: they may wrap output in ```json
// fences or add prose. Strip fences and slice the first {...} block before parse.
function parseJsonLoose(raw: string): Partial<ReportAiResult> | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end > start) s = s.slice(start, end + 1);
  try {
    return JSON.parse(s) as Partial<ReportAiResult>;
  } catch {
    return null;
  }
}

export async function analyzeReport(
  targetName: string,
  reason: string,
  chat: { text: string }[],
): Promise<ReportAiResult | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const transcript =
    chat
      .map((m) => `- ${m.text}`)
      .join("\n")
      .slice(0, 8000) || "(no recent messages)";
  const prompt = [
    `You are a moderation assistant for a kids' game chat. A player was reported: "${targetName}".`,
    `Reporter's reason: ${reason || "(none given)"}`,
    ``,
    `Here are ${targetName}'s recent chat messages:`,
    transcript,
    ``,
    `Assess whether ${targetName} was being mean, harassing, bullying, threatening, or otherwise breaking chat rules.`,
    `Respond ONLY with strict JSON, no prose: {"score": <0-100 integer likelihood they were being mean>, "verdict": "<one of: clear, minor, concerning, severe>", "summary": "<1-2 sentences citing what you saw>"}.`,
  ].join("\n");
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) {
      console.error("openrouter http", r.status, await r.text().catch(() => ""));
      return null;
    }
    const json = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonLoose(content);
    if (!parsed) {
      console.error("analyzeReport: unparseable model output", content.slice(0, 300));
      return null;
    }
    return {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      verdict: String(parsed.verdict ?? "").slice(0, 40),
      summary: String(parsed.summary ?? "").slice(0, 1000),
    };
  } catch (e) {
    console.error("analyzeReport failed", e);
    return null;
  }
}

export async function runReportAnalysis(
  reportId: number,
  targetId: string,
  targetName: string,
  reason: string,
): Promise<ReportAiResult | null> {
  const chat = await fetchTargetChat(targetId);
  const result = await analyzeReport(targetName, reason, chat);
  if (result) {
    await supabase
      .from("reports")
      .update({
        ai_verdict: result.verdict,
        ai_summary: result.summary,
        ai_score: result.score,
        ai_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    // Auto-action on a high-confidence severe verdict: warn the player and log
    // a violation (which feeds the existing auto-ban escalation). We never
    // auto-ban straight off an AI call — a human still confirms in the queue.
    if (result.verdict.toLowerCase() === "severe" && result.score >= 80) {
      await supabase.from("violations").insert({
        user_id: targetId,
        kind: "chat",
        content: `[AI auto-flag ${result.score}/100] ${result.summary}`.slice(0, 500),
      });
      await supabase.from("notifications").insert({
        user_id: targetId,
        title: "Chat warning",
        body: "Your recent chat was flagged as harmful by automated review after a player reported you. Keep it kind — continued behaviour like this leads to a ban.",
      });
    }
  }
  return result;
}

// Ping the report-viewers Slack channel with a deep link to the dashboard.
export async function postReportToSlack(
  reportId: number,
  targetName: string,
  reason: string,
  ai: ReportAiResult | null,
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.REPORT_SLACK_CHANNEL;
  if (!token || !channel) return;
  const url = `${DASH_URL}/reports/${reportId}`;
  const severe = ai != null && ai.verdict.toLowerCase() === "severe" && ai.score >= 80;
  const aiLine = ai
    ? `\n:robot_face: AI: *${ai.verdict}* (${ai.score}/100) — ${ai.summary}`
    : "";
  const head = severe
    ? `<!here> :rotating_light: *SEVERE* report against *${targetName}* — auto-warned, needs review`
    : `:rotating_light: New report against *${targetName}*`;
  const text = `${head}\nReason: ${reason || "_none given_"}${aiLine}\n<${url}|Open in dashboard>`;
  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, text, unfurl_links: false }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("postReportToSlack failed", e);
  }
}
