import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/guard";
import { payoutInvoice } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const access = await getAccess();
  if (!access?.isSuper) return new NextResponse("Forbidden", { status: 403 });

  const m = req.nextUrl.searchParams.get("m") ?? "";
  const now = new Date();
  const key = /^\d{4}-\d{2}$/.test(m)
    ? m
    : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const rows = await payoutInvoice(start, end);
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
  const lines = [
    "reviewer,slack_id,reviews_paid,pixels_paid,pixels_full,usd_owed,cut_payouts,uncredited_payouts",
    ...rows.map((r) =>
      [
        esc(r.reviewer),
        r.slackId,
        r.payouts,
        r.paidPixels,
        r.fullPixels,
        (r.paidPixels / 10).toFixed(2),
        r.cuts,
        r.uncredited,
      ].join(","),
    ),
  ];
  return new NextResponse(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pixl-payouts-${key}.csv"`,
    },
  });
}
