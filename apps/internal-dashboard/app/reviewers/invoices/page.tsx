import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guard";
import { payoutInvoice } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const { m } = await searchParams;

  const now = new Date();
  const key = m && /^\d{4}-\d{2}$/.test(m) ? m : monthKey(now);
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const prev = monthKey(new Date(Date.UTC(year, month - 2, 1)));
  const next = monthKey(end);
  const isCurrent = key === monthKey(now);

  const rows = await payoutInvoice(start, end);
  const totals = rows.reduce(
    (acc, r) => {
      acc.payouts += r.payouts;
      acc.paidPixels += r.paidPixels;
      acc.fullPixels += r.fullPixels;
      acc.cuts += r.cuts;
      return acc;
    },
    { payouts: 0, paidPixels: 0, fullPixels: 0, cuts: 0 },
  );
  const monthName = start.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/reviewers" className="text-sm text-muted-foreground hover:text-brand">
          ← Reviewers
        </Link>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Payout invoices</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            What each reviewer earned from the $1-per-review payouts, month by month. 10 pixels
            = $1 , settle the dollar column however you pay people.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/reviewers/invoices?m=${prev}`}>←</Link>
          </Button>
          <span className="text-sm font-semibold px-1 whitespace-nowrap">{monthName}</span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={isCurrent ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/reviewers/invoices?m=${next}`}>→</Link>
          </Button>
          <Button asChild size="sm" className="bg-ink text-white hover:bg-ink/90 ml-2">
            <a href={`/api/invoices?m=${key}`}>Download CSV</a>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="p-3">Reviewer</TableHead>
              <TableHead className="p-3">Reviews paid</TableHead>
              <TableHead className="p-3">Pixels</TableHead>
              <TableHead className="p-3">Owed</TableHead>
              <TableHead className="p-3">Cuts</TableHead>
              <TableHead className="p-3">Not credited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.slackId}>
                <TableCell className="p-3">
                  <Link href={`/reviewers/${r.slackId}`} className="font-bold hover:text-brand">
                    {r.reviewer}
                  </Link>
                  <div className="text-xs text-muted-foreground font-mono">{r.slackId}</div>
                </TableCell>
                <TableCell className="p-3 tabular-nums">{r.payouts}</TableCell>
                <TableCell className="p-3 tabular-nums">
                  {r.paidPixels}
                  {r.paidPixels < r.fullPixels && (
                    <span className="text-xs text-muted-foreground"> of {r.fullPixels}</span>
                  )}
                </TableCell>
                <TableCell className="p-3 tabular-nums font-semibold">
                  ${(r.paidPixels / 10).toFixed(2)}
                </TableCell>
                <TableCell
                  className={`p-3 tabular-nums ${
                    r.cuts > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : ""
                  }`}
                >
                  {r.cuts}
                </TableCell>
                <TableCell
                  className={`p-3 tabular-nums ${
                    r.uncredited > 0 ? "text-tang font-bold" : ""
                  }`}
                >
                  {r.uncredited}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="p-5 text-muted-foreground" colSpan={6}>
                  No settled payouts in {monthName}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {rows.length > 0 && (
            <TableFooter>
              <TableRow className="hover:bg-transparent font-semibold">
                <TableCell className="p-3">Total</TableCell>
                <TableCell className="p-3 tabular-nums">{totals.payouts}</TableCell>
                <TableCell className="p-3 tabular-nums">{totals.paidPixels}</TableCell>
                <TableCell className="p-3 tabular-nums">${(totals.paidPixels / 10).toFixed(2)}</TableCell>
                <TableCell className="p-3 tabular-nums">{totals.cuts}</TableCell>
                <TableCell className="p-3" />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </div>
  );
}
