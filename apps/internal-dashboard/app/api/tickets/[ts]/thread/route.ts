import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/guard";
import { ticketThread } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ts: string }> },
) {
  const access = await getAccess();
  if (!access) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ts } = await params;
  try {
    const messages = await ticketThread(ts);
    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
