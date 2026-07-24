import { NextRequest, NextResponse } from "next/server";
import { getHelperAccess } from "@/lib/guard";
import { resolveTicketFromDash } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ ts: string }> },
) {
  const access = await getHelperAccess();
  if (!access) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { ts } = await params;
  const result = await resolveTicketFromDash(ts, {
    slackId: access.session.slackId,
    username: access.session.name,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, alreadyClosed: result.alreadyClosed ?? false });
}
