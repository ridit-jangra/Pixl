import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./app/[lang]/dictionaries";

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) return defaultLocale;

  const preferred = acceptLang
    .split(",")
    .map((s) => {
      const [tag, q = "1"] = s.trim().split(";q=");
      return { tag: tag.split("-")[0], q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);

  for (const p of preferred) {
    if ((locales as string[]).includes(p.tag)) return p.tag;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Exclude the game + game-dash paths (rewritten to play.pixl.rsvp in
  // vercel.json) so the locale redirect never rewrites them to /<lang>/….
  matcher: [
    "/((?!_next|favicon|api|shop|play|vault|explore|quests|timeline|projects|report|hackatime|img|fonts|pixl|index|hero-bg|step-|pixel_|hc-logo).*)",
  ],
};
