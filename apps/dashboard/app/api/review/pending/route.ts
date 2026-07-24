import { NextResponse } from "next/server";
import { getAccess, canView } from "@/lib/guard";
import { countPendingReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getAccess();
  if (!access || !canView(access, ["review"]))
    return NextResponse.json({ count: 0 }, { status: 401 });
  return NextResponse.json({ count: await countPendingReviews() });
}
