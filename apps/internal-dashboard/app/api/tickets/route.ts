import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/guard";
import { listTickets } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getAccess();
  if (!access) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "closed" || statusParam === "all" ? statusParam : "open";
  const search = searchParams.get("search") ?? "";
  const tickets = await listTickets(status, search);
  return NextResponse.json({ tickets });
}
