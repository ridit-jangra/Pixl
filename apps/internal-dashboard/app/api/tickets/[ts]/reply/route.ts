import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/guard";
import { ticketReply } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ts: string }> },
) {
  const access = await getAccess();
  if (!access) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ts } = await params;
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
  try {
    await ticketReply(ts, text, {
      slackId: access.session.slackId,
      username: access.session.name,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
