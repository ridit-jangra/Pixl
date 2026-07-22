import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("pixl_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = new URL("https://slack.com/openid/connect/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile");
  url.searchParams.set("client_id", process.env.SLACK_CLIENT_ID ?? "");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", `${process.env.BASE_URL}/api/auth/callback`);
  return NextResponse.redirect(url.toString());
}
