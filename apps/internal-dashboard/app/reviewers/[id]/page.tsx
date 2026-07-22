import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  requireAdmin,
  isSecondPassReviewer,
  ownerSlackIds,
  secondPassSlackIds,
  NO_REVIEW,
  SECOND_PASS,
} from "@/lib/guard";
import {
  getAdmin,
  listReviewAudits,
  reviewerStatsBySlackId,
  displayNamesBySlackId,
  auditFlags,
  listReviewPayouts,
  payoutTotalsBySlackId,
  type ReviewerStats,
  type PayoutTotals,
} from "@/lib/db";
import { removeReviewer, setSecondPass } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { slackHandle } from "@/lib/slack";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const EMPTY_STATS: ReviewerStats = {
  reviews: 0,
  approved: 0,
  firstPass: 0,
  needsChanges: 0,
  hoursApproved: 0,
  avgSeconds: 0,
  repoOpenRate: 0,
  flagged: 0,
  lastReview: null,
};

function fmtDuration(seconds: number): string {
  if (seconds <= 0) return ",";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ${seconds % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "never";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const VERDICT_BADGE: Record<
  string,
  { label: string; variant: "success" | "secondary" | "warning" | "destructive" }
> = {
  approved: { label: "approved", variant: "success" },
  first_pass_approved: { label: "first pass", variant: "secondary" },
  needs_changes: { label: "needs changes", variant: "warning" },
  reverted: { label: "reverted", variant: "destructive" },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 gap-0">
      <div className="text-xl font-semibold tabular-nums leading-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}

export default async function ReviewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const { id } = await params;
  const slackId = decodeURIComponent(id);

  const admin = await getAdmin(slackId);
  const inTable = !!admin?.permissions.includes("review");
  const blocked = !!admin?.permissions.includes(NO_REVIEW);
  const fromEnv =
    (ownerSlackIds().includes(slackId) || secondPassSlackIds().includes(slackId)) && !blocked;
  if (!inTable && !fromEnv) notFound();

  const [stats, audits, handle, playerNames, payouts, payoutTotals] = await Promise.all([
    reviewerStatsBySlackId(),
    listReviewAudits(100, slackId),
    slackHandle(slackId),
    displayNamesBySlackId([slackId]),
    listReviewPayouts(slackId, 50),
    payoutTotalsBySlackId(),
  ]);
  const s = stats.get(slackId) ?? EMPTY_STATS;
  const pay: PayoutTotals =
    payoutTotals.get(slackId) ?? { earnedPixels: 0, paid: 0, pending: 0, cut: 0 };
  const display = admin?.name || handle || playerNames.get(slackId) || slackId;
  const isOwner = ownerSlackIds().includes(slackId);
  const initials =
    display
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/reviewers" className="text-sm text-muted-foreground hover:text-brand">
          ← Reviewers
        </Link>
      </div>

      <Card className="p-5 md:p-6 gap-0 flex-row items-start justify-between flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <span className="grid place-items-center w-14 h-14 rounded-full bg-brand/10 text-brand text-lg font-semibold shrink-0">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="text-xl font-semibold flex items-center gap-2 flex-wrap">
              {display}
              {isOwner && (
                <Badge variant="destructive" className="text-[0.65rem] uppercase tracking-wide">
                  admin
                </Badge>
              )}
              {isSecondPassReviewer(slackId, admin?.permissions) && (
                <Badge variant="success" className="text-[0.65rem] uppercase tracking-wide">
                  second pass
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground font-mono truncate">
              {handle ?? slackId} · {slackId}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {admin?.added_by ? `added by ${admin.added_by} · ` : ""}
              last review {fmtDate(s.lastReview)}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <form action={removeReviewer} className="flex items-center gap-2 flex-wrap">
            <input type="hidden" name="slackId" value={slackId} />
            <Input
              name="reason"
              required
              maxLength={500}
              placeholder="Reason (sent to them)"
              className="text-sm w-52"
            />
            <PendingButton
              variant="outline"
              pendingText="Removing…"
              confirm={`Remove ${display} as a reviewer?`}
              className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
            >
              Remove reviewer
            </PendingButton>
          </form>
          {secondPassSlackIds().includes(slackId) ? (
            <span className="text-xs text-muted-foreground">
              Final reviewer via SECOND_PASS_SLACK_IDS , change it in the env.
            </span>
          ) : (
            <form action={setSecondPass}>
              <input type="hidden" name="slackId" value={slackId} />
              <input type="hidden" name="name" value={display} />
              <input
                type="hidden"
                name="enable"
                value={admin?.permissions.includes(SECOND_PASS) ? "0" : "1"}
              />
              {admin?.permissions.includes(SECOND_PASS) ? (
                <PendingButton
                  variant="ghost"
                  size="sm"
                  pendingText="Removing…"
                  className="text-foreground/70"
                >
                  Remove final reviewer
                </PendingButton>
              ) : (
                <PendingButton
                  size="sm"
                  pendingText="Saving…"
                  className="bg-mint text-ink border-transparent hover:bg-mint/90"
                >
                  Make final reviewer
                </PendingButton>
              )}
            </form>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="reviews all-time" value={String(s.reviews)} />
        <Stat label="final approvals" value={String(s.approved)} />
        <Stat label="first passes" value={String(s.firstPass)} />
        <Stat label="needs changes" value={String(s.needsChanges)} />
        <Stat label="hours credited" value={String(Math.round(s.hoursApproved * 10) / 10)} />
        <Stat label="avg review time" value={fmtDuration(s.avgSeconds)} />
        <Stat label="repo opened" value={`${Math.round(s.repoOpenRate * 100)}%`} />
        <Card className={`p-4 gap-0 ${s.flagged > 0 ? "ring-rose-300 dark:ring-rose-500/40" : ""}`}>
          <div
            className={`text-xl font-semibold tabular-nums leading-tight ${
              s.flagged > 0 ? "text-rose-600 dark:text-rose-400" : ""
            }`}
          >
            {s.flagged}
          </div>
          <div className="text-xs text-muted-foreground mt-1">flagged reviews</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          label="pixels earned reviewing"
          value={`${pay.earnedPixels} ($${(pay.earnedPixels / 10).toFixed(2)})`}
        />
        <Stat label="payouts settled" value={String(pay.paid)} />
        <Stat label="payouts pending" value={String(pay.pending)} />
        <Card className={`p-4 gap-0 ${pay.cut > 0 ? "ring-rose-300 dark:ring-rose-500/40" : ""}`}>
          <div
            className={`text-xl font-semibold tabular-nums leading-tight ${
              pay.cut > 0 ? "text-rose-600 dark:text-rose-400" : ""
            }`}
          >
            {pay.cut}
          </div>
          <div className="text-xs text-muted-foreground mt-1">payouts cut</div>
        </Card>
      </div>

      {payouts.length > 0 && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-3">
            Payouts{payouts.length === 50 ? " (last 50)" : ""}
          </div>
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="p-3">Project</TableHead>
                  <TableHead className="p-3">For</TableHead>
                  <TableHead className="p-3">Payout</TableHead>
                  <TableHead className="p-3">Status</TableHead>
                  <TableHead className="p-3">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => {
                  const badge = VERDICT_BADGE[p.verdict] ?? {
                    label: p.verdict,
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow
                      key={p.id}
                      className={
                        p.cut_pct > 0 && p.status === "paid"
                          ? "bg-rose-50/60 dark:bg-rose-500/[0.06] hover:bg-rose-50 dark:hover:bg-rose-500/10 align-top"
                          : "align-top"
                      }
                    >
                      <TableCell className="p-3">
                        <Link
                          href={`/projects/${p.project_id}`}
                          className="font-bold hover:text-brand"
                        >
                          {p.project_name}
                        </Link>
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="p-3 tabular-nums whitespace-nowrap">
                        {p.status === "paid" ? (
                          <>
                            {p.paid_pixels}/{p.full_pixels} px
                            {p.cut_pct > 0 && (
                              <div
                                className="text-[0.7rem] text-rose-600 dark:text-rose-400 mt-1 max-w-64 whitespace-normal"
                                title={p.cut_reason}
                              >
                                −{p.cut_pct}% , {p.cut_reason}
                              </div>
                            )}
                          </>
                        ) : (
                          `${p.full_pixels} px`
                        )}
                      </TableCell>
                      <TableCell className="p-3 whitespace-nowrap">
                        {p.status === "pending" ? (
                          <Badge variant="secondary">awaiting final pass</Badge>
                        ) : p.credited ? (
                          <Badge variant="success">paid</Badge>
                        ) : (
                          <Badge variant="warning">no game account</Badge>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-muted-foreground whitespace-nowrap">
                        {fmtDateTime(p.settled_at ?? p.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Review history{audits.length === 100 ? " (last 100)" : ""}
        </div>
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="p-3">Project</TableHead>
                <TableHead className="p-3">Player</TableHead>
                <TableHead className="p-3">Verdict</TableHead>
                <TableHead className="p-3">Hours</TableHead>
                <TableHead className="p-3">Time spent</TableHead>
                <TableHead className="p-3">Checked</TableHead>
                <TableHead className="p-3">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((a) => {
                const badge = VERDICT_BADGE[a.verdict] ?? {
                  label: a.verdict,
                  variant: "secondary" as const,
                };
                const flags = auditFlags(a);
                return (
                  <TableRow
                    key={a.id}
                    className={
                      flags.length > 0
                        ? "bg-rose-50/60 dark:bg-rose-500/[0.06] hover:bg-rose-50 dark:hover:bg-rose-500/10 align-top"
                        : "align-top"
                    }
                  >
                    <TableCell className="p-3">
                      <Link
                        href={`/projects/${a.project_id}`}
                        className="font-bold hover:text-brand"
                      >
                        {a.project_name}
                      </Link>
                      {a.note && (
                        <div className="text-xs text-muted-foreground max-w-72 truncate" title={a.note}>
                          {a.note}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3">
                      <Link href={`/players/${a.user_id}`} className="hover:text-brand">
                        {a.player_name}
                      </Link>
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {flags.map((f) => (
                        <div
                          key={f}
                          className="text-[0.7rem] text-rose-600 dark:text-rose-400 mt-1 whitespace-nowrap"
                        >
                          ⚠ {f}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="p-3 tabular-nums whitespace-nowrap">
                      {a.claimed_hours}
                      {a.approved_hours != null ? ` → ${a.approved_hours}` : ""}
                    </TableCell>
                    <TableCell className="p-3 tabular-nums">{fmtDuration(a.total_seconds)}</TableCell>
                    <TableCell className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {[a.repo_opened ? "repo" : null, a.demo_opened ? "demo" : null]
                        .filter(Boolean)
                        .join(" · ") || ","}
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground whitespace-nowrap">
                      {fmtDateTime(a.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {audits.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell className="p-5 text-muted-foreground" colSpan={7}>
                    No reviews yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
