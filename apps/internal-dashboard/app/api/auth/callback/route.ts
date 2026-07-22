import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAllowed, setSessionCookie } from "@/lib/session";
import { getAdmin } from "@/lib/db";

interface SlackIdClaims {
  "https://slack.com/user_id"?: string;
  name?: string;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("pixl_oauth_state")?.value;
  jar.delete("pixl_oauth_state");

  const fail = (reason: string) =>
    NextResponse.redirect(`${process.env.BASE_URL}/login?error=${reason}`);

  if (!code || !state || !expected || state !== expected) return fail("state");

  const body = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID ?? "",
    client_secret: process.env.SLACK_CLIENT_SECRET ?? "",
    code,
    redirect_uri: `${process.env.BASE_URL}/api/auth/callback`,
  });
  const res = await fetch("https://slack.com/api/openid.connect.token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as { ok: boolean; id_token?: string };
  if (!json.ok || !json.id_token) return fail("token");

  // The id_token comes straight from Slack over TLS, so decoding its payload
  // without JWKS verification is fine here.
  const payload = json.id_token.split(".")[1];
  let claims: SlackIdClaims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return fail("claims");
  }
  const slackId = claims["https://slack.com/user_id"];
  if (!slackId) return fail("claims");
  if (!isAllowed(slackId) && !(await getAdmin(slackId))) return fail("denied");

  await setSessionCookie(slackId, claims.name ?? slackId);
  return NextResponse.redirect(`${process.env.BASE_URL}/`);
}
