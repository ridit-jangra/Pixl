import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const HCA_BASE_URL = "https://auth.hackclub.com";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("pixl_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = new URL(`${HCA_BASE_URL}/oauth/authorize`);
  url.searchParams.set("client_id", process.env.HCA_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", `${process.env.BASE_URL}/api/auth/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile slack_id");
  url.searchParams.set("state", state);
  return NextResponse.redirect(url.toString());
}
