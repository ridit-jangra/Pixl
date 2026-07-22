// Slack profile photos via users.info. Needs SLACK_BOT_TOKEN (users:read);
// silently does nothing without it so login never breaks.
export async function fetchSlackAvatar(slackId: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !slackId) return null;
  try {
    const r = await fetch(
      `https://slack.com/api/users.info?user=${encodeURIComponent(slackId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) return null;
    const json = (await r.json()) as {
      ok?: boolean;
      user?: { profile?: { image_512?: string; image_192?: string } };
    };
    if (!json.ok) return null;
    return json.user?.profile?.image_512 || json.user?.profile?.image_192 || null;
  } catch {
    return null;
  }
}
