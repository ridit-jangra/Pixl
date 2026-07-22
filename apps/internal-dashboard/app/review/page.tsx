import Link from "next/link";
import { requirePagePerm } from "@/lib/guard";
import { listShippedProjects, listSecondReviewProjects, listReviewAudits } from "@/lib/db";
import { slackHandles } from "@/lib/slack";
import { ReviewTabs } from "@/app/_components/ReviewTabs";
import { ReviewTable } from "@/app/_components/ReviewTable";
import { LiveReview } from "@/app/_components/LiveReview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

const PER = 15;
const SORTS = [
  { key: "oldest", label: "Oldest" },
  { key: "hours", label: "Hours" },
  { key: "status", label: "Status" },
];

export default async function ReviewListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const access = await requirePagePerm(["review"]);
  const viewer = access.session.slackId;
  const { page, sort } = await searchParams;

  const finalRows = access.canSecondPass ? await listSecondReviewProjects(viewer) : [];
  const finalHandles = finalRows.length
    ? await slackHandles(finalRows.map((p) => p.users?.slack_id))
    : new Map<string, string>();

  const myRecent = await listReviewAudits(5, viewer);
  let rows = await listShippedProjects(viewer);
  if (sort === "hours") rows = [...rows].sort((a, b) => b.hours - a.hours);
  else if (sort === "status") rows = [...rows].sort((a, b) => a.status.localeCompare(b.status));

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PER));
  const cur = Math.min(Math.max(parseInt(page ?? "1", 10) || 1, 1), pages);
  const start = (cur - 1) * PER;
  const slice = rows.slice(start, start + PER);
  const handles = await slackHandles(slice.map((p) => p.users?.slack_id));
  const sortKey = SORTS.some((s) => s.key === sort) ? sort : "oldest";
  const qp = (p: number) => `/review?page=${p}${sortKey !== "oldest" ? `&sort=${sortKey}` : ""}`;

  return (
    <div>
      <ReviewTabs isSuper={access.isSuper} pending={total} />

      {finalRows.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Awaiting your final pass
              <Badge variant="violet" className="ml-2">
                {finalRows.length}
              </Badge>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These passed a first review. Your approval credits pixels and ships them.
          </p>
          <ReviewTable
            rows={finalRows}
            handles={finalHandles}
            emptyLabel="Nothing waiting on a final pass."
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-card">
          {SORTS.map((s) => (
            <Button
              key={s.key}
              asChild
              variant="ghost"
              size="sm"
              className={sortKey === s.key ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
            >
              <Link href={`/review${s.key !== "oldest" ? `?sort=${s.key}` : ""}`}>
                {s.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LiveReview />
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground/70">{total}</span> of {total}
          </div>
        </div>
      </div>

      <ReviewTable
        rows={slice}
        handles={handles}
        emptyLabel="Queue's clear. Nothing waiting for review."
      />

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 mt-4 text-sm">
          <span className="text-muted-foreground">
            Showing {start + 1}–{Math.min(start + PER, total)} of {total}
          </span>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href={qp(cur - 1)}
                  aria-label="Previous page"
                  className={cur <= 1 ? "pointer-events-none opacity-40" : ""}
                >
                  ←
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-muted-foreground tabular-nums">
                  {cur} / {pages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href={qp(cur + 1)}
                  aria-label="Next page"
                  className={cur >= pages ? "pointer-events-none opacity-40" : ""}
                >
                  →
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {myRecent.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recently reviewed by you</h3>
          <Card className="divide-y divide-border py-0">
            {myRecent.map((a) => (
              <Link
                key={a.id}
                href={`/projects/${a.project_id}`}
                className="p-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 hover:bg-muted/50"
              >
                <span className="font-medium text-sm">{a.project_name}</span>
                <span className="text-xs text-muted-foreground">
                  {a.verdict.replaceAll("_", " ")} · {a.player_name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
