import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAllowed, setSessionCookie } from "@/lib/session";
import { getAdmin } from "@/lib/db";

const HCA_BASE_URL = "https://auth.hackclub.com";

interface HackClubTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface HackClubMeResponse {
  identity: {
    id: string;
    first_name?: string;
    last_name?: string;
    primary_email?: string;
    slack_id?: string;
    verification_status?: string;
    [key: string]: unknown;
  };
  scopes: string[];
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

  const tokenRes = await fetch(`${HCA_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.HCA_CLIENT_ID,
      client_secret: process.env.HCA_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/auth/callback`,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return fail("token");

  const tokens = (await tokenRes.json()) as HackClubTokenResponse;

  const meRes = await fetch(`${HCA_BASE_URL}/api/v1/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!meRes.ok) return fail("identity");

  const me = (await meRes.json()) as HackClubMeResponse;
  const identity = me.identity;
  const slackId = identity.slack_id;
  if (!slackId) return fail("denied");

  const fullName = [identity.first_name, identity.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name = fullName || identity.primary_email || slackId;

  if (!isAllowed(slackId) && !(await getAdmin(slackId))) return fail("denied");

  await setSessionCookie(slackId, name);
  return NextResponse.redirect(`${process.env.BASE_URL}/`);
}
