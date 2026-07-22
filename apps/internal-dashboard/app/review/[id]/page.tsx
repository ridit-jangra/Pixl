import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePagePerm } from "@/lib/guard";
import { getProject, listShippedProjects, listSecondReviewProjects, claimReview } from "@/lib/db";
import { fetchCommits, attachCommitStats } from "@/lib/github";
import { fetchUserSpans, attachTrackedTime, fetchTrustFactor, fetchHackatimeReport } from "@/lib/hackatime";
import { yswsShipsFor } from "@/lib/ysws";
import { renderMarkdown } from "@/lib/markdown";
import { db } from "@/lib/db";
import { ReviewForm, type BountyOption } from "@/app/_components/ReviewForm";
import { banProject } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { ReviewDetailTabs } from "@/app/_components/ReviewDetailTabs";
import { LevelBadge, ShipBadges, StatusBadge } from "@/app/_components/ProjectBadges";
import { slackHandle } from "@/lib/slack";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

function fmtHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ago(iso: string | null): string {
  if (!iso) return "unknown";
  const d = Math.max(0, Date.now() - new Date(iso).getTime());
  const days = Math.floor(d / 86_400_000);
  if (days >= 1) return `${days}d ago`;
  const hrs = Math.floor(d / 3_600_000);
  if (hrs >= 1) return `${hrs}h ago`;
  return `${Math.floor(d / 60_000)}m ago`;
}

const TRUST_VARIANT = (level: string): "success" | "destructive" | "warning" | "info" =>
  level === "green"
    ? "success"
    : level === "red" || level === "convicted"
      ? "destructive"
      : level === "yellow" || level === "suspected"
        ? "warning"
        : "info";

export default async function ReviewDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await requirePagePerm(["review"]);
  const viewer = access.session.slackId;
  const canSecondPass = access.canSecondPass;
  const { id } = await params;
  const { error } = await searchParams;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) notFound();

  const data = await getProject(projectId);
  if (!data) notFound();
  const { project: p, journals, verdicts } = data;

  const isFinalStage = p.status === "second_review";
  const isOwn = !!p.users?.slack_id && p.users.slack_id === viewer && !access.isSuper;
  const canReview =
    (p.status === "shipped" && !isOwn) || (isFinalStage && canSecondPass);

  const claim = canReview
    ? await claimReview(projectId, viewer)
    : { ok: true as const, by: undefined };
  const claimHandle = !claim.ok && claim.by ? await slackHandle(claim.by) : null;

  const journalHours =
    Math.round(journals.reduce((s, j) => s + (Number(j.hours) || 0), 0) * 10) / 10;
  const hackatimeHours = Math.round(((p.hackatime_seconds ?? 0) / 3600) * 10) / 10;
  const hours = Math.round((hackatimeHours + journalHours) * 10) / 10;
  const htPct = hours > 0 ? Math.round((hackatimeHours / hours) * 100) : 0;

  const formDefaultHours =
    isFinalStage && p.first_pass_hours != null ? p.first_pass_hours : hours;

  const firstPassDeflated =
    p.first_pass_hours != null ? Math.round((hours - p.first_pass_hours) * 10) / 10 : 0;
  const firstPassCutPct =
    p.first_pass_hours != null && hours > 0
      ? Math.round(((hours - p.first_pass_hours) / hours) * 100)
      : 0;

  const shippedAt = (p as { shipped_at?: string | null }).shipped_at ?? null;
  let bounties: BountyOption[] = [];
  if (shippedAt) {
    const { data: bountyEvents } = await db
      .from("events")
      .select("*")
      .eq("type", "bounty")
      .is("stopped_at", null)
      .lte("starts_at", shippedAt)
      .gt("ends_at", shippedAt);
    bounties = ((bountyEvents ?? []) as {
      id: number;
      name: string;
      config: Record<string, unknown>;
    }[]).map((ev) => ({
      id: ev.id,
      name: ev.name,
      reward: Number(ev.config.reward) || 0,
      description: String(ev.config.description ?? ""),
    }));
  }

  // These calls hit GitHub, Hackatime, the YSWS archive, Slack and the DB.
  // They're independent, so run them concurrently , the page is only as slow as
  // the slowest one, not their sum. The commit stats + tracked-time attach form
  // one chain (both mutate `commits`) that runs alongside the rest.
  const hackatimeProjects = p.hackatime_projects ?? [];
  const tokenPromise = hackatimeProjects.length
    ? db
        .from("users")
        .select("hackatime_token")
        .eq("id", p.user_id)
        .single()
        .then((r) => (r.data as { hackatime_token?: string } | null)?.hackatime_token ?? null)
    : Promise.resolve(null);

  const commitsChain = (async () => {
    const commits = await fetchCommits(p.repo_url);
    await attachCommitStats(commits);
    if (commits.commits.length > 0 && hackatimeProjects.length > 0) {
      const spans = await fetchUserSpans(p.users?.slack_id, await tokenPromise, hackatimeProjects);
      if (spans) attachTrackedTime(commits.commits, spans);
    }
    return commits;
  })();

  const hackatimeReportPromise = hackatimeProjects.length
    ? tokenPromise.then((tok) => fetchHackatimeReport(p.users?.slack_id, tok, hackatimeProjects))
    : Promise.resolve(null);

  const [commits, trust, yswsShips, ownerHandle, queue, hackatimeReport] = await Promise.all([
    commitsChain,
    fetchTrustFactor(p.users?.slack_id),
    yswsShipsFor(p.users?.slack_id, p.repo_url, p.demo_url),
    slackHandle(p.users?.slack_id),
    isFinalStage ? listSecondReviewProjects(viewer) : listShippedProjects(viewer),
    hackatimeReportPromise,
  ]);
  const ownerName = ownerHandle ?? p.users?.display_name ?? p.users?.slack_id ?? p.user_id;
  const idx = queue.findIndex((q) => q.id === projectId);
  const prev = idx > 0 ? queue[idx - 1] : null;
  const next = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null;

  return (
    <div>
      <Link href="/review" className="text-sm text-brand font-medium hover:underline">
        ← Needs review
      </Link>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="font-medium text-destructive">{error}</AlertDescription>
        </Alert>
      )}
      {!claim.ok && (
        <Alert className="mt-4 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10">
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            Heads up , {claimHandle ?? claim.by ?? "another reviewer"} is already reviewing this
            submission. Avoid double-grading it.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6 pb-24 mt-4">
        {/* main */}
        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <StatusBadge status={p.status} />
              <LevelBadge level={p.level} />
              <ShipBadges project={p} />
              <span className="text-xs text-muted-foreground font-mono ml-auto">#{p.id}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-words">{p.name}</h1>
            {p.description && (
              <div
                className="md text-muted-foreground mt-2 break-words"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(p.description) }}
              />
            )}
          </div>

          {p.image_url && (
            <img
              src={p.image_url}
              alt=""
              className="w-full max-h-96 object-contain rounded-xl border border-border bg-black/40"
            />
          )}

          {p.system_note && (
            <Alert className="border-brand/30 bg-brand/10">
              <AlertDescription className="font-medium text-brand">{p.system_note}</AlertDescription>
            </Alert>
          )}
          {(() => {
            const aiCommits = commits.commits.filter((c) => c.ai).length;
            if (aiCommits === 0 || p.used_ai) return null;
            return (
              <Alert className="border-violet-300 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-500/10">
                <AlertDescription className="font-medium text-violet-700 dark:text-violet-300">
                  {aiCommits} commit{aiCommits === 1 ? "" : "s"} in this repo {aiCommits === 1 ? "is" : "are"} signed
                  by an AI tool, but the maker did not tick &ldquo;AI used&rdquo;. Undisclosed AI ,
                  verify before crediting.
                </AlertDescription>
              </Alert>
            );
          })()}
          {p.is_update && p.update_notes && (
            <div className="rounded-xl border border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 p-4 text-sm">
              <div className="font-semibold mb-1 text-blue-700 dark:text-blue-300">
                What changed since last approval
              </div>
              <div className="whitespace-pre-wrap break-words text-blue-900/90 dark:text-blue-200/90">
                {p.update_notes}
              </div>
            </div>
          )}
          {p.used_ai && (
            <div className="rounded-xl border border-violet-300 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-500/10 p-4 text-sm">
              <div className="font-semibold mb-1 text-violet-700 dark:text-violet-300">
                AI declaration
              </div>
              <div className="whitespace-pre-wrap break-words text-violet-900/90 dark:text-violet-200/90">
                {p.ai_notes || "Player ticked “AI used” but gave no details (pre-dates the details field)."}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold shrink-0">
                {String(ownerName).replace(/^@/, "").slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <Link href={`/players/${p.user_id}`} className="font-medium hover:text-brand truncate block">
                  {ownerName}
                </Link>
                {p.users?.slack_id && (
                  <a
                    href={`https://hackclub.slack.com/team/${p.users.slack_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-muted-foreground hover:text-brand"
                    title="Open in Slack"
                  >
                    {p.users.slack_id}
                  </a>
                )}
              </div>
            </div>
            {p.repo_url && (
              <Button asChild variant="secondary" size="sm">
                <a href={p.repo_url} target="_blank" rel="noreferrer">
                  Repo ↗
                </a>
              </Button>
            )}
            {p.demo_url && (
              <Button asChild variant="secondary" size="sm">
                <a href={p.demo_url} target="_blank" rel="noreferrer">
                  Live demo ↗
                </a>
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Submitted {ago(p.shipped_at)} · {fmtHM(hours)} logged
            {p.hackatime_projects?.length > 0 && (
              <>
                {" · "}
                <a href="#hackatime" className="text-brand hover:underline">
                  hackatime: {p.hackatime_projects.join(", ")}
                </a>
              </>
            )}
          </div>

          <ReviewDetailTabs
            commits={commits}
            journals={journals}
            verdicts={verdicts}
            yswsShips={yswsShips}
            hackatime={hackatimeReport}
          />
        </div>

        {/* sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card className="p-5 gap-0">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Logged hours
              </div>
              <div className="mt-1 mb-3">
                <span className="text-3xl font-bold">{fmtHM(hours)}</span>{" "}
                <span className="text-muted-foreground text-sm">logged</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div className="h-full bg-[color:var(--color-hc-blue)]" style={{ width: `${htPct}%` }} />
                <div className="h-full bg-[color:var(--color-hc-purple)]" style={{ width: `${100 - htPct}%` }} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a href="#hackatime" className="flex items-center gap-2 hover:text-brand" title="See the full Hackatime breakdown">
                  <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--color-hc-blue)]" />
                  <span className="text-foreground/70">Hackatime →</span>
                  <span className="ml-auto tabular-nums font-medium">{fmtHM(hackatimeHours)}</span>
                </a>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--color-hc-purple)]" />
                  <span className="text-foreground/70">Journals</span>
                  <span className="ml-auto tabular-nums font-medium">{fmtHM(journalHours)}</span>
                </div>
              </div>
            </Card>

            {trust && (
              <Card className="p-4 flex-row items-center gap-3">
                <Badge variant={TRUST_VARIANT(trust.level)}>{trust.level}</Badge>
                <span className="text-xs text-muted-foreground">
                  Hackatime trust factor , {trust.level === "green"
                    ? "no fraud flags on this account."
                    : trust.level === "red" || trust.level === "convicted"
                      ? "Hackatime has convicted this account of fraud. Do not credit without digging."
                      : trust.level === "yellow" || trust.level === "suspected"
                        ? "Hackatime suspects this account , verify carefully."
                        : "not scored yet."}
                </span>
              </Card>
            )}

            {isFinalStage && (
              <Card className="p-5 gap-0 ring-violet-300 dark:ring-violet-500/30">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-2">
                  First pass
                </div>
                <div className="text-sm text-foreground/70">
                  Passed by <span className="font-medium text-foreground">{p.first_pass_by || "a reviewer"}</span>
                  {p.first_pass_hours != null && (
                    <>
                      {" "}
                      · credited <span className="font-medium text-foreground">{p.first_pass_hours}h</span> of{" "}
                      {hours}h claimed
                    </>
                  )}
                </div>
                {firstPassDeflated > 0 && (
                  <div className="mt-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                    Deflated {firstPassDeflated}h {firstPassCutPct > 0 ? `(−${firstPassCutPct}%)` : ""}
                  </div>
                )}
                {p.first_pass_note && (
                  <p className="mt-2 text-sm whitespace-pre-wrap break-words text-foreground/80">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Their note:{" "}
                    </span>
                    {p.first_pass_note}
                  </p>
                )}
              </Card>
            )}

            {isOwn && p.status === "shipped" && (
              <Card className="p-5 text-sm gap-0 ring-amber-300 dark:ring-amber-500/30 text-amber-700 dark:text-amber-300">
                This is your own submission , another reviewer has to do the first pass.
              </Card>
            )}
            {isOwn && isFinalStage && canReview && (
              <Card className="p-4 text-xs gap-0 ring-amber-300 dark:ring-amber-500/30 text-amber-700 dark:text-amber-300">
                Your own submission , someone else first-passed it, so you may finalize. This is
                logged.
              </Card>
            )}

            {canReview ? (
              <>
                <Card className="p-5 gap-0">
                  <div className="text-sm font-semibold mb-1">
                    {isFinalStage ? "Final pass" : canSecondPass ? "Your verdict" : "First pass"}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {canSecondPass
                      ? "Approving credits pixels at the player's level rate ($4–6/hr in px) and ships it. Every verdict needs a note. You can only lower the credited hours."
                      : "Every verdict needs a note. Approving sends this to a final reviewer before pixels are credited. You can only lower the credited hours."}
                  </p>
                  <ReviewForm
                    projectId={p.id}
                    repoUrl={p.repo_url}
                    demoUrl={p.demo_url}
                    claimedHours={hours}
                    defaultHours={formDefaultHours}
                    secondPass={canSecondPass}
                    bounties={bounties}
                  />
                </Card>

                <details className="rounded-xl bg-card ring-1 ring-rose-300 dark:ring-rose-500/30 p-4 text-card-foreground">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-rose-700 dark:text-rose-400 select-none list-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    Ban project , permanent
                  </summary>
                  <p className="text-xs text-muted-foreground mt-2">
                    Permanently bans this project , it can never be shipped again and is hidden
                    everywhere. Different from requesting changes. Reversible by staff only.
                  </p>
                  <form action={banProject} className="mt-3 flex flex-col gap-2">
                    <input type="hidden" name="projectId" value={p.id} />
                    <input type="hidden" name="returnTo" value={`/review/${p.id}`} />
                    <Textarea
                      name="reason"
                      required
                      rows={2}
                      placeholder="Reason for the ban (shown to the owner)…"
                      className="text-sm resize-y"
                    />
                    <PendingButton
                      className="bg-rose-800 text-white border-transparent hover:bg-rose-900"
                      pendingText="Banning…"
                      confirm="Permanently ban this project? It can never be shipped again."
                    >
                      Ban project
                    </PendingButton>
                  </form>
                </details>
              </>
            ) : isOwn ? null : isFinalStage ? (
              <Card className="p-5 text-sm text-muted-foreground">
                Passed the first review , waiting on a final reviewer to sign off before pixels are
                credited.
              </Card>
            ) : (
              <Card className="p-5 text-sm text-muted-foreground">
                Already reviewed ,{" "}
                <StatusBadge status={p.status} />. See the{" "}
                <Link href={`/projects/${p.id}`} className="text-brand hover:underline">
                  project page
                </Link>{" "}
                to revert or take further action.
              </Card>
            )}
          </div>
        </aside>
      </div>

      {/* sticky nav bar */}
      <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-t border-border bg-background/90 backdrop-blur flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className={prev ? "" : "pointer-events-none opacity-40"}>
          <Link href={prev ? `/review/${prev.id}` : "#"} prefetch={false}>
            ← Prev
          </Link>
        </Button>
        <div className="flex-1 text-center text-sm text-muted-foreground tabular-nums">
          {idx >= 0 ? `Submission ${idx + 1} of ${queue.length}` : "Not in queue"}
        </div>
        <Button asChild variant="outline" size="sm" className={next ? "" : "pointer-events-none opacity-40"}>
          <Link href={next ? `/review/${next.id}` : "#"} prefetch={false}>
            Next →
          </Link>
        </Button>
      </div>
    </div>
  );
}
