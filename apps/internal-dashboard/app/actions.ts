"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  db,
  getAdmin,
  logModAction,
  creditProjectPixels,
  revokeProjectPixels,
  projectPixelTotal,
  creditReviewerPixels,
  activeDashEvents,
  communityGoalShipCount,
  addReportViewer,
  removeReportViewer,
  EVENT_TYPES,
  type DashEventRow,
} from "@/lib/db";
import { slackHandle, dmUser, slackAvatars } from "@/lib/slack";
import { serializeGroups } from "@/lib/shopOptions";
import { kickOnlinePlayer } from "@/lib/gameServer";
import { dmOrEmail } from "@/lib/notify";
import {
  requirePerm,
  requireSuper,
  requireReportViewer,
  ownerSlackIds,
  secondPassSlackIds,
  SUBADMIN_PERMISSIONS,
  NO_REVIEW,
  SECOND_PASS,
  type AdminAccess,
  type Permission,
} from "@/lib/guard";

const DEFAULT_WARNING =
  "Please keep chat messages and display names appropriate. Continued violations may result in a ban from Pixl.";

const DASH_URL = "https://pixl-dash.ridit.space";

function actorName(access: AdminAccess): string {
  return `${access.session.name} (${access.session.slackId})`;
}

// XP = 1 per lifetime approved hour; level = approved hours, capped at 100.
// Payout is a flat $4.00/hr base plus an XP bonus ramping linearly to $6.00/hr
// at level 100 (40 px base -> 60 px at max). A player's rate for a ship comes
// from their XP before that ship. Keep in sync with server src/xp.ts.
const BASE_PX_PER_HOUR = 40;
const MAX_PX_PER_HOUR = 60;
const MAX_LEVEL = 100;

function pxPerHourFor(xp: number): number {
  const level = Math.min(MAX_LEVEL, Math.floor(Math.max(xp, 0)));
  return Math.round(
    BASE_PX_PER_HOUR + ((MAX_PX_PER_HOUR - BASE_PX_PER_HOUR) * level) / MAX_LEVEL,
  );
}

async function lifetimeApprovedHours(userId: string, excludeProjectId: number): Promise<number> {
  const { data } = await db
    .from("projects")
    .select("id, approved_hours, hackatime_seconds")
    .eq("user_id", userId)
    .eq("status", "approved")
    .is("banned_at", null)
    .neq("id", excludeProjectId);
  return (
    Math.round(
      (data ?? []).reduce((s, p) => {
        const h =
          p.approved_hours != null
            ? Number(p.approved_hours)
            : (Number(p.hackatime_seconds) || 0) / 3600;
        return s + (Number.isFinite(h) ? h : 0);
      }, 0) * 10,
    ) / 10
  );
}

// A reviewer may never act on their own submission (self-review = cheating).
async function isOwnProject(access: AdminAccess, userId: string): Promise<boolean> {
  const { data } = await db.from("users").select("slack_id").eq("id", userId).single();
  return !!data?.slack_id && data.slack_id === access.session.slackId;
}

export async function warnPlayer(formData: FormData): Promise<void> {
  const access = await requirePerm("warn");
  const by = actorName(access);
  const userId = String(formData.get("userId") ?? "");
  const message = String(formData.get("message") ?? "").trim() || DEFAULT_WARNING;
  if (!userId) return;

  const { error } = await db.from("notifications").insert({
    user_id: userId,
    title: "Moderation warning",
    body: message,
  });
  if (error) console.error("warn notification failed", error.message);

  await dmOrEmail(
    userId,
    "Moderation warning",
    [
      "You've received a moderation warning from Pixl.",
      message,
      "If you believe this is a mistake, reach out to the Pixl team.",
    ].join("\n\n"),
  );
  await logModAction(userId, "warn", message, by);
  revalidatePath("/", "layout");
}

function readSeconds(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "0"));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), 86400);
}

async function claimedHoursFor(projectId: number): Promise<number> {
  const [{ data: journals }, { data: proj }] = await Promise.all([
    db.from("project_journals").select("hours").eq("project_id", projectId),
    db.from("projects").select("hackatime_seconds").eq("id", projectId).single(),
  ]);
  const journalHours =
    Math.round((journals ?? []).reduce((s, j) => s + (Number(j.hours) || 0), 0) * 10) / 10;
  const hackatimeHours =
    Math.round(((Number(proj?.hackatime_seconds) || 0) / 3600) * 10) / 10;
  return hackatimeHours > 0 ? hackatimeHours : journalHours;
}

async function insertReviewAudit(
  formData: FormData,
  projectId: number,
  userId: string,
  reviewer: string,
  verdict: string,
  note: string,
  claimedHours: number,
  approvedHours: number | null,
): Promise<void> {
  const { error } = await db.from("review_audits").insert({
    project_id: projectId,
    user_id: userId,
    reviewer,
    verdict,
    note,
    audit_note: String(formData.get("auditNote") ?? "").trim().slice(0, 5000),
    claimed_hours: claimedHours,
    approved_hours: approvedHours,
    repo_opened: formData.get("repoOpened") === "1",
    demo_opened: formData.get("demoOpened") === "1",
    repo_seconds: readSeconds(formData.get("repoSeconds")),
    demo_seconds: readSeconds(formData.get("demoSeconds")),
    total_seconds: readSeconds(formData.get("totalSeconds")),
  });
  if (error) console.error("review audit insert failed", error.message);
}

// Every review earns $0.50 = 5 pixels, paid into the reviewer's game account.
// Rushed reviews are cut 30% (50% if doubly rushed); a first pass that the
// final reviewer overturns is cut 50%, and one whose hours get slashed is cut
// 30%. First-pass payouts stay pending until the final verdict settles them.
const PAYOUT_PIXELS = 5;

function payoutFlagCut(formData: FormData, verdict: string): { pct: number; reason: string } {
  const total = readSeconds(formData.get("totalSeconds"));
  const repoOpened = formData.get("repoOpened") === "1";
  const reasons: string[] = [];
  if (total > 0 && total < 60) reasons.push("review took under a minute");
  if ((verdict === "approved" || verdict === "first_pass_approved") && !repoOpened)
    reasons.push("repo never opened");
  return {
    pct: reasons.length >= 2 ? 50 : reasons.length === 1 ? 30 : 0,
    reason: reasons.join("; "),
  };
}

// During a Review Blitz event every review's base payout is multiplied, so
// full_pixels is locked in at review time and settlement math uses the row.
async function payoutBasePixels(): Promise<number> {
  const [blitz] = await activeDashEvents(["review_blitz"]);
  const mult = blitz ? Math.min(Math.max(Number(blitz.config.mult) || 1, 1), 3) : 1;
  return Math.round(PAYOUT_PIXELS * mult);
}

async function dmPayout(
  slackId: string,
  projectName: string,
  paid: number,
  full: number,
  pct: number,
  reason: string,
  credited: boolean,
): Promise<void> {
  const dollars = `$${(full / 10).toFixed(2)}`;
  let text =
    pct === 0
      ? `You earned ${paid} pixels (${dollars}) for reviewing "${projectName}". Thanks for keeping the queue moving!`
      : `You earned ${paid} pixels for reviewing "${projectName}" , the ${dollars} payout was cut ${pct}%: ${reason}.`;
  if (full > PAYOUT_PIXELS) text += `\n\n⚡ Review Blitz bonus included!`;
  if (!credited)
    text += `\n\nHeads up: there's no Pixl game account linked to your Slack, so the pixels couldn't be credited yet. Contact the team to get it sorted.`;
  await dmUser(slackId, text);
}

async function recordSettledPayout(
  projectId: number,
  access: AdminAccess,
  verdict: string,
  formData: FormData,
  projectName: string,
): Promise<void> {
  const { pct, reason } = payoutFlagCut(formData, verdict);
  const full = await payoutBasePixels();
  const paid = Math.round((full * (100 - pct)) / 100);
  const credited = await creditReviewerPixels(access.session.slackId, paid);
  const { error } = await db.from("review_payouts").insert({
    project_id: projectId,
    reviewer: actorName(access),
    reviewer_slack_id: access.session.slackId,
    verdict,
    status: "paid",
    full_pixels: full,
    paid_pixels: paid,
    cut_pct: pct,
    cut_reason: reason,
    credited,
    settled_at: new Date().toISOString(),
  });
  if (error) {
    console.error("review payout insert failed", error.message);
    return;
  }
  await dmPayout(access.session.slackId, projectName, paid, full, pct, reason, credited);
}

async function recordPendingPayout(
  projectId: number,
  access: AdminAccess,
  formData: FormData,
): Promise<void> {
  const { pct, reason } = payoutFlagCut(formData, "first_pass_approved");
  const { error } = await db.from("review_payouts").insert({
    project_id: projectId,
    reviewer: actorName(access),
    reviewer_slack_id: access.session.slackId,
    verdict: "first_pass_approved",
    status: "pending",
    full_pixels: await payoutBasePixels(),
    cut_pct: pct,
    cut_reason: reason,
  });
  if (error) console.error("review payout insert failed", error.message);
}

// Settle every pending first-pass payout on a project once the final verdict
// lands. The transition to 'paid' is guarded on the row still being pending so
// a double-submit can never double-pay.
async function settleFirstPassPayouts(
  projectId: number,
  projectName: string,
  overturned: boolean,
  hoursSlashed: boolean,
): Promise<void> {
  const { data: pending } = await db
    .from("review_payouts")
    .select("id, reviewer_slack_id, cut_pct, cut_reason, full_pixels")
    .eq("project_id", projectId)
    .eq("status", "pending");
  for (const p of pending ?? []) {
    let pct = Number(p.cut_pct) || 0;
    const reasons: string[] = p.cut_reason ? [p.cut_reason] : [];
    if (overturned) {
      pct = Math.max(pct, 50);
      reasons.push("verdict overturned by the final reviewer");
    } else if (hoursSlashed) {
      pct = Math.max(pct, 30);
      reasons.push("credited hours cut sharply by the final reviewer");
    }
    const reason = reasons.join("; ");
    const full = Number(p.full_pixels) || PAYOUT_PIXELS;
    const paid = Math.round((full * (100 - pct)) / 100);
    const { data: claimed } = await db
      .from("review_payouts")
      .update({
        status: "paid",
        paid_pixels: paid,
        cut_pct: pct,
        cut_reason: reason,
        settled_at: new Date().toISOString(),
      })
      .eq("id", p.id)
      .eq("status", "pending")
      .select("id");
    if (!claimed || claimed.length === 0) continue;
    const credited = await creditReviewerPixels(p.reviewer_slack_id, paid);
    if (credited)
      await db.from("review_payouts").update({ credited: true }).eq("id", p.id);
    await dmPayout(p.reviewer_slack_id, projectName, paid, full, pct, reason, credited);
  }
}

async function notifyOwner(
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  const { error } = await db.from("notifications").insert({ user_id: userId, title, body });
  if (error) console.error("review notification failed", error.message);
  await dmOrEmail(userId, title, body);
}

// Two-pass review. A shipped project gets a first pass from any reviewer; if
// approved it moves to 'second_review' for a final reviewer's sign-off (unless
// that first reviewer is themselves a final reviewer, in which case it's
// approved outright). Pixels are credited only on final approval. "Request
// changes" bounces it back to the maker from either stage.
export async function reviewProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  const verdict = String(formData.get("verdict") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (!projectId || (verdict !== "approved" && verdict !== "needs_changes")) return;

  const { data: current } = await db
    .from("projects")
    .select("status, user_id, name, first_pass_by, first_pass_hours, shipped_at")
    .eq("id", projectId)
    .single();
  if (!current) return;
  const stage = String(current.status);
  const back = `/review/${projectId}`;
  const own = await isOwnProject(access, current.user_id);
  if (stage === "shipped" && !access.isSuper && own)
    redirect(`${back}?error=${encodeURIComponent("You can't first-pass your own project , another reviewer has to take it.")}`);
  if (stage !== "shipped" && stage !== "second_review")
    redirect(`${back}?error=${encodeURIComponent("This project isn't awaiting review anymore.")}`);
  if (!note)
    redirect(`${back}?error=${encodeURIComponent("Feedback is required for every verdict.")}`);
  const auditNote = String(formData.get("auditNote") ?? "").trim();
  if (auditNote.length < 150)
    redirect(`${back}?error=${encodeURIComponent("The internal audit note needs at least 150 characters.")}`);

  const claimedHours = await claimedHoursFor(projectId);
  const hoursRaw = String(formData.get("approvedHours") ?? "").trim();
  let approvedHours: number | null = null;
  if (hoursRaw !== "") {
    const n = Number(hoursRaw);
    if (!Number.isFinite(n) || n < 0)
      redirect(`${back}?error=${encodeURIComponent("Credited hours must be a number of 0 or more.")}`);
    approvedHours = Math.min(Math.round(n * 10) / 10, claimedHours);
  }
  const reviewer = (await slackHandle(access.session.slackId)) ?? access.session.name;

  // Request changes , bounce back to the maker from either stage.
  if (verdict === "needs_changes") {
    const { data: project, error } = await db
      .from("projects")
      .update({
        status: "needs_changes",
        review_note: note,
        reviewing_by: "",
        reviewing_at: null,
        first_pass_by: "",
        first_pass_at: null,
        first_pass_note: "",
        first_pass_hours: null,
      })
      .eq("id", projectId)
      .in("status", ["shipped", "second_review"])
      .select("id, name, user_id")
      .single();
    if (error || !project) {
      console.error("reviewProject (changes) failed", error?.message);
      return;
    }
    await insertReviewAudit(formData, projectId, project.user_id, by, "needs_changes", note, claimedHours, approvedHours);
    if (stage === "second_review")
      await settleFirstPassPayouts(projectId, project.name, true, false);
    if (!own) await recordSettledPayout(projectId, access, "needs_changes", formData, project.name);
    await notifyOwner(
      project.user_id,
      "Changes requested",
      `"${project.name}" needs changes before it can be approved , ${reviewer}:\n\n${note}\n\nUpdate your project and ship it again.`,
    );
    await logModAction(project.user_id, "project_needs_changes", `${project.name}: ${note}`, by);
    revalidatePath("/review");
    redirect("/review");
  }

  // First pass without final-reviewer rights → hold for a second pass.
  if (stage === "shipped" && !access.canSecondPass) {
    const { data: project, error } = await db
      .from("projects")
      .update({
        status: "second_review",
        review_note: note,
        approved_hours: approvedHours,
        reviewing_by: "",
        reviewing_at: null,
        first_pass_by: by,
        first_pass_at: new Date().toISOString(),
        first_pass_note: note,
        first_pass_hours: approvedHours,
      })
      .eq("id", projectId)
      .eq("status", "shipped")
      .select("id, name, user_id")
      .single();
    if (error || !project) {
      console.error("reviewProject (first pass) failed", error?.message);
      return;
    }
    await insertReviewAudit(formData, projectId, project.user_id, by, "first_pass_approved", note, claimedHours, approvedHours);
    if (!own) await recordPendingPayout(projectId, access, formData);
    await logModAction(project.user_id, "project_first_pass", `${project.name}: ${note}`, by);
    revalidatePath("/review");
    redirect("/review");
  }

  // Final approval , credit pixels. Only final reviewers reach here.
  if (stage === "second_review" && !access.canSecondPass)
    redirect(`${back}?error=${encodeURIComponent("Only a final reviewer can approve this stage.")}`);
  if (stage === "second_review" && !access.isSuper && current.first_pass_by && current.first_pass_by === by)
    redirect(`${back}?error=${encodeURIComponent("A different reviewer must do the final pass.")}`);

  const creditHours = approvedHours ?? claimedHours;
  const { data: project, error } = await db
    .from("projects")
    .update({
      status: "approved",
      review_note: note,
      approved_hours: approvedHours,
      reviewing_by: "",
      reviewing_at: null,
    })
    .eq("id", projectId)
    .in("status", ["shipped", "second_review"])
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("reviewProject (approve) failed", error?.message);
    return;
  }
  await insertReviewAudit(formData, projectId, project.user_id, by, "approved", note, claimedHours, approvedHours);

  if (stage === "second_review") {
    const fpHours =
      current.first_pass_hours != null ? Number(current.first_pass_hours) : claimedHours;
    const hoursSlashed = fpHours > 0 && (approvedHours ?? claimedHours) < fpHours * 0.7;
    await settleFirstPassPayouts(projectId, project.name, false, hoursSlashed);
  }
  if (!own) await recordSettledPayout(projectId, access, "approved", formData, project.name);

  // Lifetime credit for the project = round(hours * the player's level rate *
  // any community-goal bonus); the DB function only adds the delta vs what
  // earlier approvals already paid out.
  let goalMult = 1;
  let goalNote = "";
  if (current.shipped_at) {
    const { data: goals } = await db
      .from("events")
      .select("*")
      .eq("type", "community_goal")
      .is("stopped_at", null)
      .lte("starts_at", current.shipped_at)
      .gt("ends_at", current.shipped_at);
    for (const g of (goals ?? []) as DashEventRow[]) {
      const target = Number(g.config.target) || 0;
      const bonusPct = Number(g.config.bonusPct) || 0;
      if (target > 0 && bonusPct > 0 && (await communityGoalShipCount(g)) >= target) {
        goalMult *= 1 + bonusPct / 100;
        goalNote += ` The "${g.name}" community goal was hit , +${bonusPct}% on this project!`;
      }
    }
  }
  const xpBefore = await lifetimeApprovedHours(project.user_id, projectId);
  const pxRate = pxPerHourFor(xpBefore);
  const totalPx = Math.round(creditHours * pxRate * goalMult);
  const alreadyPx = await projectPixelTotal(project.id);
  const deltaPx = totalPx - alreadyPx;
  await creditProjectPixels(project.user_id, project.id, totalPx, creditHours, by);

  let credited: string;
  if (alreadyPx > 0 && deltaPx > 0) {
    credited = `\n\n+${deltaPx} pixels for what's new (${totalPx} pixels total for this project , ${creditHours}h approved).`;
  } else if (alreadyPx > 0 && deltaPx <= 0) {
    credited = `\n\nNo new pixels this time , this project already earned ${alreadyPx} pixels.`;
  } else {
    credited =
      approvedHours !== null && approvedHours !== claimedHours
        ? `\n\n${totalPx} pixels credited (${approvedHours}h approved of ${claimedHours}h logged).`
        : `\n\n${totalPx} pixels credited for ${creditHours}h approved.`;
  }
  if (deltaPx > 0)
    credited += ` Your rate: ${pxRate} px/h ($${(pxRate / 10).toFixed(2)}/hr at level ${Math.min(10, Math.floor(xpBefore / 10))}).`;
  if (goalNote && deltaPx > 0) credited += goalNote;

  // Bounties the final reviewer ticked: fixed prize each, once per project,
  // only for projects shipped inside the bounty window.
  const bountyIds = [...new Set(formData.getAll("bountyIds").map(Number))].filter(
    (n) => Number.isFinite(n) && n > 0,
  );
  for (const bid of bountyIds) {
    const { data: ev } = await db
      .from("events")
      .select("*")
      .eq("id", bid)
      .eq("type", "bounty")
      .is("stopped_at", null)
      .maybeSingle();
    if (!ev) continue;
    const bounty = ev as DashEventRow;
    const reward = Math.min(Math.max(Math.round(Number(bounty.config.reward) || 0), 0), 500);
    if (reward === 0) continue;
    if (
      !current.shipped_at ||
      current.shipped_at < bounty.starts_at ||
      current.shipped_at >= bounty.ends_at
    )
      continue;
    const { error: claimError } = await db.from("bounty_claims").insert({
      event_id: bid,
      project_id: projectId,
      user_id: project.user_id,
      pixels: reward,
      awarded_by: by,
    });
    if (claimError) continue;
    await db.rpc("adjust_user_pixels", {
      p_user_id: project.user_id,
      p_amount: reward,
      p_reason: "bounty",
      p_created_by: by,
    });
    credited += ` Bounty "${bounty.name}" met , +${reward} pixels!`;
    await logModAction(project.user_id, "bounty_awarded", `${bounty.name}: +${reward} pixels (${project.name})`, by);
  }
  await notifyOwner(
    project.user_id,
    "Project approved!",
    `"${project.name}" passed review , approved by ${reviewer}. Congrats on shipping!\n\nReviewer note: ${note}${credited}`,
  );
  await logModAction(
    project.user_id,
    "project_approved",
    `${project.name}: ${deltaPx >= 0 ? "+" : ""}${deltaPx} pixels (total ${totalPx})`,
    by,
  );
  revalidatePath("/review");
  redirect("/review");
}

export async function reReviewProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  if (!projectId) return;

  const { data: project, error } = await db
    .from("projects")
    .update({ status: "shipped", review_note: "", approved_hours: null })
    .eq("id", projectId)
    .in("status", ["approved", "needs_changes"])
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("reReviewProject failed", error?.message);
    return;
  }

  const claimedHours = await claimedHoursFor(projectId);

  // The verdict is void, so the payout is too , claw back every pixel this
  // project was credited and leave the reversal in the ledger.
  const revoked = await revokeProjectPixels(project.user_id, project.id, by);

  await logModAction(
    project.user_id,
    "review_reverted",
    `${project.name}: verdict reverted, back in the review queue${
      revoked > 0 ? ` , ${revoked} pixels revoked` : ""
    }`,
    by,
  );
  const { error: auditError } = await db.from("review_audits").insert({
    project_id: projectId,
    user_id: project.user_id,
    reviewer: by,
    verdict: "reverted",
    note: "Previous verdict reverted , project returned to the review queue.",
    audit_note: "",
    claimed_hours: claimedHours,
  });
  if (auditError) console.error("re-review audit insert failed", auditError.message);

  const { error: notifyError } = await db.from("notifications").insert({
    user_id: project.user_id,
    title: "Project back in review",
    body: `"${project.name}" is getting another look from the review team.${
      revoked > 0
        ? ` The ${revoked} pixels it earned are on hold until the new verdict.`
        : ""
    } You'll hear back here soon , nothing needed from you.`,
  });
  if (notifyError) console.error("re-review notification failed", notifyError.message);
  revalidatePath("/", "layout");
}

// Manual pixel correction from the Pixels tab. Deducts (or grants) whole
// pixels with a mandatory reason; owners only, everything lands in the ledger.
export async function adjustPixels(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const by = actorName(access);
  const userId = String(formData.get("userId") ?? "").trim();
  const amount = Math.round(Number(formData.get("amount") ?? 0));
  const deduct = formData.get("mode") !== "grant";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!userId || !Number.isFinite(amount) || amount <= 0)
    redirect(`/pixels?error=${encodeURIComponent("Pick a player and a whole number of pixels.")}`);
  if (!reason)
    redirect(`/pixels?error=${encodeURIComponent("A reason is required for manual pixel changes.")}`);
  const { data: target } = await db.from("users").select("slack_id").eq("id", userId).single();
  if (!deduct && target?.slack_id && target.slack_id === access.session.slackId)
    redirect(`/pixels?error=${encodeURIComponent("You can't grant pixels to yourself.")}`);

  const delta = deduct ? -amount : amount;
  const { error } = await db.rpc("adjust_user_pixels", {
    p_user_id: userId,
    p_amount: delta,
    p_reason: deduct ? "manual_deduction" : "manual_grant",
    p_created_by: `${by} , ${reason}`,
  });
  if (error) {
    console.error("adjustPixels failed", error.message);
    redirect(`/pixels?error=${encodeURIComponent("Couldn't adjust pixels , try again.")}`);
  }
  await logModAction(
    userId,
    deduct ? "pixels_deducted" : "pixels_granted",
    `${deduct ? "-" : "+"}${amount} pixels , ${reason}`,
    by,
  );
  const title = deduct ? "Pixels deducted" : "Pixels granted";
  const body = `${deduct ? `${amount} pixels were removed from` : `${amount} pixels were added to`} your balance by the Pixl team.\n\nReason: ${reason}\n\nIf you think this is a mistake, contact the Pixl team.`;
  const { error: notifyError } = await db
    .from("notifications")
    .insert({ user_id: userId, title, body });
  if (notifyError) console.error("adjustPixels notification failed", notifyError.message);

  await dmOrEmail(userId, title, body);
  revalidatePath("/pixels");
  redirect("/pixels?adjusted=1");
}

export async function archiveProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  const unarchive = formData.get("unarchive") === "1";
  if (!projectId) return;
  const { data: project, error } = await db
    .from("projects")
    .update({ archived_at: unarchive ? null : new Date().toISOString() })
    .eq("id", projectId)
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("archiveProject failed", error?.message);
    return;
  }
  await logModAction(
    project.user_id,
    unarchive ? "project_unarchived" : "project_archived",
    project.name,
    by,
  );
  revalidatePath("/", "layout");
}

export async function rejectProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  const returnTo = String(formData.get("returnTo") ?? "") || `/projects/${projectId}`;
  if (!projectId) return;
  if (!reason)
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("A reason is required to reject a project.")}`);

  const { data: target } = await db.from("projects").select("user_id").eq("id", projectId).single();
  if (target && (await isOwnProject(access, target.user_id)))
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("You can't act on your own project.")}`);

  const reviewer = (await slackHandle(access.session.slackId)) ?? access.session.name;

  const { data: project, error } = await db
    .from("projects")
    .update({
      rejected_at: new Date().toISOString(),
      reject_reason: reason,
      reject_by: reviewer,
    })
    .eq("id", projectId)
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("rejectProject failed", error?.message);
    return;
  }
  await logModAction(project.user_id, "project_rejected", `${project.name}: ${reason}`, by);

  const body = `Your project "${project.name}" was rejected by ${reviewer} and removed from Pixl.\n\nReason: ${reason}\n\nIf you think this is a mistake, contact the Pixl team.`;
  const { error: notifyError } = await db.from("notifications").insert({
    user_id: project.user_id,
    title: "Project rejected",
    body,
  });
  if (notifyError) console.error("reject notification failed", notifyError.message);

  await dmOrEmail(project.user_id, "Project rejected", body);
  revalidatePath("/", "layout");
}

export async function unrejectProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  if (!projectId) return;
  const { data: project, error } = await db
    .from("projects")
    .update({ rejected_at: null, reject_reason: "", reject_by: "" })
    .eq("id", projectId)
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("unrejectProject failed", error?.message);
    return;
  }
  await logModAction(project.user_id, "project_unrejected", project.name, by);
  const { error: notifyError } = await db.from("notifications").insert({
    user_id: project.user_id,
    title: "Project restored",
    body: `"${project.name}" was restored and is visible again. Sorry for the mix-up!`,
  });
  if (notifyError) console.error("unreject notification failed", notifyError.message);
  revalidatePath("/", "layout");
}

export async function banProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  const returnTo = String(formData.get("returnTo") ?? "") || `/projects/${projectId}`;
  if (!projectId) return;
  if (!reason)
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("A reason is required to ban a project.")}`);

  const { data: target } = await db.from("projects").select("user_id").eq("id", projectId).single();
  if (target && (await isOwnProject(access, target.user_id)))
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("You can't act on your own project.")}`);

  const reviewer = (await slackHandle(access.session.slackId)) ?? access.session.name;

  const { data: project, error } = await db
    .from("projects")
    .update({
      banned_at: new Date().toISOString(),
      ban_reason: reason,
      ban_by: reviewer,
    })
    .eq("id", projectId)
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("banProject failed", error?.message);
    return;
  }
  await logModAction(project.user_id, "project_banned", `${project.name}: ${reason}`, by);

  const body = `Your project "${project.name}" was permanently banned by ${reviewer} and can no longer be shipped to Pixl.\n\nReason: ${reason}\n\nIf you think this is a mistake, contact the Pixl team.`;
  const { error: notifyError } = await db.from("notifications").insert({
    user_id: project.user_id,
    title: "Project banned",
    body,
  });
  if (notifyError) console.error("ban notification failed", notifyError.message);

  await dmOrEmail(project.user_id, "Project banned", body);
  revalidatePath("/", "layout");
}

export async function unbanProject(formData: FormData): Promise<void> {
  const access = await requirePerm("review");
  const by = actorName(access);
  const projectId = Number(formData.get("projectId") ?? 0);
  if (!projectId) return;
  const { data: project, error } = await db
    .from("projects")
    .update({ banned_at: null, ban_reason: "", ban_by: "" })
    .eq("id", projectId)
    .select("id, name, user_id")
    .single();
  if (error || !project) {
    console.error("unbanProject failed", error?.message);
    return;
  }
  await logModAction(project.user_id, "project_unbanned", project.name, by);
  const { error: notifyError } = await db.from("notifications").insert({
    user_id: project.user_id,
    title: "Project ban lifted",
    body: `The ban on "${project.name}" was lifted. You can ship it again. Sorry for the mix-up!`,
  });
  if (notifyError) console.error("unban notification failed", notifyError.message);
  revalidatePath("/", "layout");
}

export async function banPlayer(formData: FormData): Promise<void> {
  const access = await requirePerm("ban");
  const by = actorName(access);
  const userId = String(formData.get("userId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  const hours = Number(formData.get("hours") ?? 0);
  if (!userId || !reason) return;

  const expiresAt =
    hours > 0 ? new Date(Date.now() + hours * 3600_000).toISOString() : null;
  const { error } = await db.from("bans").insert({
    user_id: userId,
    reason,
    banned_by: by,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  await logModAction(
    userId,
    "ban",
    expiresAt ? `${hours}h , ${reason}` : `permanent , ${reason}`,
    by,
  );

  const lines = [
    expiresAt
      ? `You've been temporarily banned from Pixl until ${new Date(expiresAt).toUTCString()}.`
      : "You've been permanently banned from Pixl.",
  ];
  if (reason) lines.push(`Reason: ${reason}`);
  lines.push("If you believe this is a mistake, reach out to the Pixl team.");
  await dmOrEmail(userId, "Banned from Pixl", lines.join("\n\n"));
  revalidatePath("/", "layout");
}

export async function liftBan(formData: FormData): Promise<void> {
  const access = await requirePerm("ban");
  const by = actorName(access);
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const now = new Date().toISOString();
  const { data: lifted, error } = await db
    .from("bans")
    .update({ lifted_at: now })
    .eq("user_id", userId)
    .is("lifted_at", null)
    .select("id");
  if (error) throw new Error(error.message);

  const count = (lifted ?? []).length;
  await logModAction(userId, "unban", `${count} active ban(s) lifted`, by);

  if (count > 0) {
    await dmOrEmail(
      userId,
      "Ban lifted",
      [
        "Your ban from Pixl has been lifted. You're welcome to rejoin the game.",
        "Please keep the community guidelines in mind going forward.",
      ].join("\n\n"),
    );
  }
  revalidatePath("/", "layout");
}

// Mass moderation from the Players page: one action applied to every selected
// player, with the same guards, mod log entries and DMs as the single-player
// versions. Capped so a stray select-all can't nuke the whole playerbase.
export async function massPlayerAction(formData: FormData): Promise<void> {
  const action = String(formData.get("massAction") ?? "");
  const permFor: Record<string, Permission> = {
    warn: "warn",
    notify: "notify",
    ban: "ban",
    unban: "ban",
  };
  const perm = permFor[action];
  if (!perm) return;
  const access = await requirePerm(perm);
  const by = actorName(access);

  const back = String(formData.get("back") ?? "/players") || "/players";
  const fail = (msg: string) => redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(msg)}`);
  const ids = [...new Set(formData.getAll("userIds").map(String).filter(Boolean))];
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  const hours = Number(formData.get("hours") ?? 0);

  if (ids.length === 0) fail("Select at least one player first.");
  if (ids.length > 100) fail("Mass actions are capped at 100 players at a time.");
  if (action === "ban" && !message) fail("A ban reason is required.");
  if (action === "notify" && !message) fail("A message is required to notify players.");

  if (action === "warn") {
    const text = message || DEFAULT_WARNING;
    for (const userId of ids) {
      await db.from("notifications").insert({
        user_id: userId,
        title: "Moderation warning",
        body: text,
      });
      await dmOrEmail(
        userId,
        "Moderation warning",
        [
          "You've received a moderation warning from Pixl.",
          text,
          "If you believe this is a mistake, reach out to the Pixl team.",
        ].join("\n\n"),
      );
      await logModAction(userId, "warn", `${text} (mass action, ${ids.length} players)`, by);
    }
  } else if (action === "notify") {
    const heading = title || "Message from the Pixl team";
    const { error } = await db
      .from("notifications")
      .insert(ids.map((userId) => ({ user_id: userId, title: heading, body: message })));
    if (error) throw new Error(error.message);
    for (const userId of ids)
      await logModAction(userId, "notify", `${heading} (mass action, ${ids.length} players)`, by);
  } else if (action === "ban") {
    const expiresAt =
      hours > 0 ? new Date(Date.now() + hours * 3600_000).toISOString() : null;
    for (const userId of ids) {
      const { error } = await db.from("bans").insert({
        user_id: userId,
        reason: message,
        banned_by: by,
        expires_at: expiresAt,
      });
      if (error) throw new Error(error.message);
      await logModAction(
        userId,
        "ban",
        `${expiresAt ? `${hours}h` : "permanent"} , ${message} (mass action, ${ids.length} players)`,
        by,
      );
      await dmOrEmail(
        userId,
        "Banned from Pixl",
        [
          expiresAt
            ? `You've been temporarily banned from Pixl until ${new Date(expiresAt).toUTCString()}.`
            : "You've been permanently banned from Pixl.",
          `Reason: ${message}`,
          "If you believe this is a mistake, reach out to the Pixl team.",
        ].join("\n\n"),
      );
    }
  } else if (action === "unban") {
    for (const userId of ids) {
      const { data: lifted, error } = await db
        .from("bans")
        .update({ lifted_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("lifted_at", null)
        .select("id");
      if (error) throw new Error(error.message);
      if ((lifted ?? []).length === 0) continue;
      await logModAction(userId, "unban", `${(lifted ?? []).length} active ban(s) lifted (mass action)`, by);
      await dmOrEmail(
        userId,
        "Ban lifted",
        [
          "Your ban from Pixl has been lifted. You're welcome to rejoin the game.",
          "Please keep the community guidelines in mind going forward.",
        ].join("\n\n"),
      );
    }
  }

  revalidatePath("/", "layout");
  const verb = { warn: "Warned", notify: "Notified", ban: "Banned", unban: "Lifted bans for" }[action];
  redirect(
    `${back}${back.includes("?") ? "&" : "?"}done=${encodeURIComponent(
      `${verb} ${ids.length} player${ids.length === 1 ? "" : "s"}.`,
    )}`,
  );
}

export async function sendNotification(formData: FormData): Promise<void> {
  const access = await requirePerm("notify");
  const by = actorName(access);
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  const body = String(formData.get("body") ?? "").trim().slice(0, 500);
  const userId = String(formData.get("userId") ?? "").trim();
  const playerName = String(formData.get("playerName") ?? "").trim();
  const backTo = String(formData.get("backTo") ?? "");
  if (!title || !body) {
    if (backTo) redirect(`${backTo}?error=${encodeURIComponent("Title and message are required.")}`);
    return;
  }

  let targetId = userId;
  if (!targetId && playerName) {
    const { data } = await db
      .from("users")
      .select("id, display_name")
      .ilike("display_name", playerName)
      .limit(2);
    if (!data || data.length !== 1) {
      if (backTo)
        redirect(
          `${backTo}?error=${encodeURIComponent(
            data && data.length > 1
              ? `Multiple players match "${playerName}" , be more specific.`
              : `No player named "${playerName}".`,
          )}`,
        );
      return;
    }
    targetId = data[0].id as string;
  }

  if (targetId) {
    const { error } = await db
      .from("notifications")
      .insert({ user_id: targetId, title, body });
    if (error) throw new Error(error.message);
    await logModAction(targetId, "notify", title, by);
    revalidatePath("/", "layout");
    if (backTo) redirect(`${backTo}?sent=1`);
    return;
  }

  const { data: users, error } = await db.from("users").select("id");
  if (error) throw new Error(error.message);
  const rows = (users ?? []).map((u) => ({ user_id: u.id as string, title, body }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error: insertError } = await db
      .from("notifications")
      .insert(rows.slice(i, i + 500));
    if (insertError) throw new Error(insertError.message);
  }
  revalidatePath("/", "layout");
  if (backTo) redirect(`${backTo}?sent=${rows.length}`);
}

export interface PlayerHit {
  id: string;
  name: string;
  hasSlack: boolean;
}

// Typeahead for the notify page: find players by display name so an admin can
// pick one instead of guessing the exact spelling.
export async function searchPlayers(query: string): Promise<PlayerHit[]> {
  await requirePerm("notify");
  const clean = query.replace(/[%_,()\\]/g, " ").trim();
  if (clean.length < 2) return [];
  const { data, error } = await db
    .from("users")
    .select("id, display_name, slack_id")
    .ilike("display_name", `%${clean}%`)
    .order("display_name", { ascending: true })
    .limit(8);
  if (error) {
    console.error("searchPlayers", error.message);
    return [];
  }
  return (data ?? []).map((u) => ({
    id: u.id as string,
    name: (u.display_name as string) ?? "(unnamed)",
    hasSlack: Boolean(u.slack_id),
  }));
}

function readSubadminPerms(formData: FormData, existing: string[]): string[] {
  const perms = formData
    .getAll("perms")
    .map(String)
    .filter((p) => (SUBADMIN_PERMISSIONS as readonly string[]).includes(p));
  if (existing.includes("review")) perms.push("review");
  if (existing.includes(NO_REVIEW)) perms.push(NO_REVIEW);
  if (existing.includes(SECOND_PASS)) perms.push(SECOND_PASS);
  return perms;
}

async function logTeamChange(
  slackId: string,
  name: string,
  action: string,
  before: string[],
  after: string[],
  actor: string,
  reason: string,
): Promise<void> {
  const { error } = await db.from("team_log").insert({
    slack_id: slackId,
    name,
    action,
    before,
    after,
    actor,
    reason,
  });
  if (error) console.error("team log insert failed", error.message);
}

// Set someone's team permissions: empty = off the team entirely. Every change
// lands in team_log so it can be undone.
async function setTeamPerms(
  slackId: string,
  name: string,
  permissions: string[],
  action: string,
  actor: string,
  addedBy?: string,
  reason = "",
): Promise<void> {
  const existing = await getAdmin(slackId);
  if (permissions.length === 0) {
    if (!existing) return;
    const { error } = await db.from("admins").delete().eq("slack_id", slackId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("admins").upsert({
      slack_id: slackId,
      name: name || existing?.name || slackId,
      permissions,
      added_by: existing?.added_by || addedBy || "",
    });
    if (error) throw new Error(error.message);
  }
  await logTeamChange(
    slackId,
    name || existing?.name || slackId,
    action,
    existing?.permissions ?? [],
    permissions,
    actor,
    reason,
  );
  revalidatePath("/", "layout");
}

export async function addAdmin(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!slackId) return;
  const existing = await getAdmin(slackId);
  const perms = readSubadminPerms(formData, existing?.permissions ?? []);
  await setTeamPerms(
    slackId,
    name,
    perms,
    existing ? "updated" : "added",
    actorName(access),
    actorName(access),
  );
  if (!existing && perms.length > 0)
    await dmTeam(
      slackId,
      [
        "Welcome to the Pixl mod team! 🎉",
        `You now have access to the Pixl dashboard with these permissions: ${perms.filter((p) => p !== "review").join(", ")}.`,
        `Sign in with Slack here: ${DASH_URL}`,
      ].join("\n\n"),
    );
}

export async function updateAdminPerms(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  if (!slackId) return;
  const existing = await getAdmin(slackId);
  if (!existing) return;
  await setTeamPerms(
    slackId,
    existing.name,
    readSubadminPerms(formData, existing.permissions),
    "updated",
    actorName(access),
  );
}

export async function removeAdmin(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!slackId || !reason) return;
  const existing = await getAdmin(slackId);
  if (!existing) return;
  await setTeamPerms(
    slackId,
    existing.name,
    existing.permissions.includes("review") ? ["review"] : [],
    "removed",
    actorName(access),
    undefined,
    reason,
  );
  await dmRemoved(slackId, "You've been removed from the Pixl mod team.", reason);
}

async function dmTeam(slackId: string, text: string): Promise<void> {
  try {
    await dmUser(slackId, text);
  } catch (e) {
    console.error("team DM failed", (e as Error).message);
  }
}

async function dmRemoved(slackId: string, headline: string, reason: string): Promise<void> {
  await dmTeam(
    slackId,
    [headline, `Reason: ${reason}`, "If you think this is a mistake, reach out to the Pixl team."].join(
      "\n\n",
    ),
  );
}

function isEnvReviewer(slackId: string): boolean {
  return ownerSlackIds().includes(slackId) || secondPassSlackIds().includes(slackId);
}

// Promote a reviewer to final (second-pass) reviewer, or take it back. The
// grant lives as a SECOND_PASS marker in their admins row, alongside whatever
// SECOND_PASS_SLACK_IDS says (env grants can only be changed in the env).
export async function setSecondPass(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const enable = formData.get("enable") === "1";
  if (!slackId) return;
  const existing = await getAdmin(slackId);
  const kept = (existing?.permissions ?? []).filter((p) => p !== SECOND_PASS);
  const permissions = enable ? [...kept, SECOND_PASS] : kept;
  const already = existing?.permissions.includes(SECOND_PASS) ?? false;
  if (enable === already) return;
  await setTeamPerms(
    slackId,
    name,
    permissions,
    enable ? "promoted to final reviewer" : "final reviewer removed",
    actorName(access),
    actorName(access),
  );
  if (enable)
    await dmTeam(
      slackId,
      [
        "You've been promoted to final reviewer on Pixl! 🎉",
        `You now handle the second pass: your approvals are the ones that credit pixels. The second-review queue is waiting for you: ${DASH_URL}/review`,
      ].join("\n\n"),
    );
  else
    await dmTeam(
      slackId,
      "Your final-reviewer role on Pixl has been removed , you can still review first passes as usual. Contact the team if you think this is a mistake.",
    );
}

export async function addReviewer(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!slackId) return;
  const existing = await getAdmin(slackId);
  const kept = (existing?.permissions ?? []).filter((p) => p !== NO_REVIEW);
  // Env admins review by default: lifting their block is enough, no row needed.
  const permissions = isEnvReviewer(slackId) ? kept : [...new Set([...kept, "review"])];
  const wasReviewer =
    !existing?.permissions.includes(NO_REVIEW) &&
    (existing?.permissions.includes("review") || isEnvReviewer(slackId));
  await setTeamPerms(
    slackId,
    name,
    permissions,
    existing ? "updated" : "added",
    actorName(access),
    actorName(access),
  );
  if (!wasReviewer)
    await dmTeam(
      slackId,
      [
        "Welcome to the Pixl review team! 🎉",
        `You now have access to the review queue on the Pixl dashboard , projects shipped by players are waiting for your verdict: ${DASH_URL}/review`,
        "Happy reviewing!",
      ].join("\n\n"),
    );
}

export async function removeReviewer(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const slackId = String(formData.get("slackId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!slackId || !reason) return;
  const existing = await getAdmin(slackId);
  if (!existing && !isEnvReviewer(slackId)) return;
  const permissions = (existing?.permissions ?? []).filter((p) => p !== "review");
  if (isEnvReviewer(slackId) && !permissions.includes(NO_REVIEW)) permissions.push(NO_REVIEW);
  await setTeamPerms(
    slackId,
    existing?.name ?? "",
    permissions,
    "removed",
    actorName(access),
    actorName(access),
    reason,
  );
  await dmRemoved(slackId, "You've been removed from the Pixl review team.", reason);
  redirect("/reviewers");
}

export async function kickPlayer(formData: FormData): Promise<void> {
  const access = await requirePerm("ban");
  const by = actorName(access);
  const userId = String(formData.get("userId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 100);
  if (!userId) return;
  const kicked = await kickOnlinePlayer(userId, reason);
  if (kicked) await logModAction(userId, "kick", reason || "(no reason)", by);
  revalidatePath("/online");
}

// Upload a shop image to Supabase Storage (public "shop" bucket, created on
// first use) and return its public URL.
async function uploadShopImage(file: File): Promise<string> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) throw new Error("Supabase is not configured");
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const upload = () =>
    fetch(`${base}/storage/v1/object/shop/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": file.type || "image/png",
      },
      body,
    });
  let res = await upload();
  if (res.status === 400 || res.status === 404) {
    await fetch(`${base}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: "shop", name: "shop", public: true }),
    });
    res = await upload();
  }
  if (!res.ok) throw new Error(`image upload failed (${res.status})`);
  return `${base}/storage/v1/object/public/shop/${name}`;
}

function readOptions(raw: string): string[] {
  const s = raw.trim();
  if (!s) return [];
  // The options editor submits JSON groups: [{ name, choices: [] }].
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return serializeGroups(
          parsed.map((g) => ({
            name: String(g?.name ?? ""),
            choices: Array.isArray(g?.choices) ? g.choices.map(String) : [],
          })),
        );
      }
    } catch {
      /* fall through to the comma-list fallback */
    }
  }
  // Fallback: a plain comma list becomes a single unnamed group.
  return serializeGroups([{ name: "", choices: s.split(",") }]);
}

export async function addShopItem(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const description = String(formData.get("description") ?? "").trim().slice(0, 300);
  const price = Math.max(0, Math.round(Number(formData.get("price") ?? 0)));
  const options = readOptions(String(formData.get("options") ?? ""));
  if (!name) return;
  // Double-submit guard: an identical name created in the last minute is the
  // same click arriving twice, not a new item.
  const { data: recent } = await db
    .from("shop_items")
    .select("id")
    .eq("name", name)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString())
    .limit(1);
  if (recent && recent.length > 0) {
    revalidatePath("/shop");
    return;
  }
  let imageUrl = "";
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 4 * 1024 * 1024) throw new Error("Image too big (max 4 MB).");
    imageUrl = await uploadShopImage(image);
  }
  const { error } = await db.from("shop_items").insert({
    name,
    description,
    price,
    image_url: imageUrl,
    options,
    created_by: actorName(access),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/shop");
}

export async function updateShopItem(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const description = String(formData.get("description") ?? "").trim().slice(0, 300);
  const price = Math.max(0, Math.round(Number(formData.get("price") ?? 0)));
  const options = readOptions(String(formData.get("options") ?? ""));
  if (!id || !name) return;
  const patch: Record<string, unknown> = { name, description, price, options };
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 4 * 1024 * 1024) throw new Error("Image too big (max 4 MB).");
    patch.image_url = await uploadShopImage(image);
  }
  const { error } = await db.from("shop_items").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shop");
}

export async function toggleShopItem(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  const active = String(formData.get("active") ?? "") === "1";
  if (!id) return;
  const { error } = await db.from("shop_items").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shop");
}

export async function deleteShopItem(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db.from("shop_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shop");
}

// Mark a shop order shipped/handed over. Only flips a pending order so a repeat
// click is a no-op, and drops the player a note so they know it's on the way.
export async function fulfillOrder(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (!id) return;
  const { data: order } = await db
    .from("shop_orders")
    .select("user_id, item_name, status")
    .eq("id", id)
    .maybeSingle();
  if (!order || order.status !== "pending") {
    revalidatePath("/fulfillment");
    return;
  }
  const { error } = await db
    .from("shop_orders")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
      fulfilled_by: actorName(access),
      note,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  await db.from("notifications").insert({
    user_id: order.user_id,
    title: "Order on its way! 📦",
    body: `Your "${order.item_name}" order has been fulfilled.${note ? ` ${note}` : ""}`,
  });
  revalidatePath("/fulfillment");
}

// Cancel a pending order and refund the pixels. The refund + status flip happen
// inside cancel_shop_order so they can't drift apart; it's idempotent, so a
// double-click won't refund twice.
export async function cancelOrder(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { data: order } = await db
    .from("shop_orders")
    .select("user_id, item_name, status")
    .eq("id", id)
    .maybeSingle();
  if (!order || order.status !== "pending") {
    revalidatePath("/fulfillment");
    return;
  }
  const { data: refunded, error } = await db.rpc("cancel_shop_order", {
    p_order_id: id,
    p_by: actorName(access),
  });
  if (error) throw new Error(error.message);
  const amount = Number(refunded ?? 0);
  await db.from("notifications").insert({
    user_id: order.user_id,
    title: "Order cancelled",
    body: `Your "${order.item_name}" order was cancelled and ${amount} pixel${amount === 1 ? "" : "s"} refunded.`,
  });
  revalidatePath("/fulfillment");
  revalidatePath("/pixels");
}

// Backfill player-card photos from Slack for everyone who has a slack_id but
// no photo yet. New sign-ups get theirs automatically from the game server.
export async function syncSlackAvatars(): Promise<void> {
  await requireSuper();
  const avatars = await slackAvatars();
  if (avatars.size === 0)
    redirect(`/players?error=${encodeURIComponent("Slack returned no profile photos , check SLACK_BOT_TOKEN.")}`);
  const { data: users, error } = await db
    .from("users")
    .select("id, slack_id, avatar_url")
    .not("slack_id", "is", null);
  if (error) {
    console.error("syncSlackAvatars", error.message);
    redirect(`/players?error=${encodeURIComponent("Couldn't load players.")}`);
  }
  let updated = 0;
  for (const u of users ?? []) {
    if (u.avatar_url) continue;
    const img = avatars.get(u.slack_id as string);
    if (!img) continue;
    const { error: upErr } = await db.from("users").update({ avatar_url: img }).eq("id", u.id);
    if (!upErr) updated++;
  }
  revalidatePath("/", "layout");
  redirect(
    `/players?done=${encodeURIComponent(`Filled ${updated} player card photo${updated === 1 ? "" : "s"} from Slack.`)}`,
  );
}

export async function addSidequest(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const region = String(formData.get("region") ?? "").trim().slice(0, 40);
  const npc = String(formData.get("npc") ?? "").trim().slice(0, 40);
  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const reward = String(formData.get("reward") ?? "").trim().slice(0, 120);
  if (!name)
    redirect(`/sidequests?error=${encodeURIComponent("A sidequest needs a name.")}`);
  const { error } = await db.from("sidequests").insert({
    name,
    region,
    npc,
    description,
    reward,
    created_by: actorName(access),
  });
  if (error) {
    console.error("addSidequest", error.message);
    redirect(`/sidequests?error=${encodeURIComponent("Couldn't save , is the sidequests migration applied?")}`);
  }
  revalidatePath("/sidequests");
  redirect("/sidequests?created=1");
}

export async function toggleSidequest(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db
    .from("sidequests")
    .update({ active: formData.get("active") === "1" })
    .eq("id", id);
  if (error) console.error("toggleSidequest", error.message);
  revalidatePath("/sidequests");
}

export async function deleteSidequest(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db.from("sidequests").delete().eq("id", id);
  if (error) console.error("deleteSidequest", error.message);
  revalidatePath("/sidequests");
}

export async function createEvent(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const type = String(formData.get("type") ?? "");
  const fail = (msg: string) => redirect(`/events?error=${encodeURIComponent(msg)}`);
  if (!(type in EVENT_TYPES)) fail("Pick an event type.");
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  if (!name) fail("Give the event a name players will see.");
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  const endsRaw = String(formData.get("endsAt") ?? "").trim();
  const starts = startsRaw ? new Date(startsRaw + "Z") : new Date();
  const ends = new Date(endsRaw + "Z");
  if (!endsRaw || isNaN(ends.getTime())) fail("An end time is required.");
  if (isNaN(starts.getTime()) || ends <= starts) fail("The event must end after it starts.");

  const config: Record<string, unknown> = {};
  if (type === "bounty") {
    const reward = Math.round(Number(formData.get("reward") ?? 0));
    if (reward <= 0) fail("A bounty needs a pixel reward.");
    config.reward = Math.min(reward, 500);
    config.description = String(formData.get("description") ?? "").trim().slice(0, 500);
  } else if (type === "community_goal") {
    const target = Math.round(Number(formData.get("target") ?? 0));
    const bonusPct = Math.round(Number(formData.get("bonusPct") ?? 0));
    if (target <= 0 || bonusPct <= 0) fail("A community goal needs a ship target and a bonus %.");
    config.target = target;
    config.bonusPct = Math.min(bonusPct, 50);
  } else if (type === "review_blitz") {
    const mult = Number(formData.get("mult") ?? 1.5);
    if (!(mult > 1)) fail("The blitz multiplier must be above 1.");
    config.mult = Math.min(mult, 3);
  } else if (type === "mystery_merchant") {
    const itemIds = [...new Set(formData.getAll("itemIds").map(Number))].filter(
      (n) => Number.isFinite(n) && n > 0,
    );
    if (itemIds.length === 0) fail("Pick at least one shop item for the merchant.");
    config.itemIds = itemIds;
  }

  const { error } = await db.from("events").insert({
    type,
    name,
    config,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    created_by: actorName(access),
  });
  if (error) {
    console.error("createEvent", error.message);
    fail("Couldn't create the event , is the events migration applied?");
  }
  revalidatePath("/", "layout");
  redirect("/events?created=1");
}

export async function stopEvent(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db
    .from("events")
    .update({ stopped_at: new Date().toISOString() })
    .eq("id", id)
    .is("stopped_at", null);
  if (error) console.error("stopEvent", error.message);
  revalidatePath("/", "layout");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db.from("events").delete().eq("id", id);
  if (error) console.error("deleteEvent", error.message);
  revalidatePath("/", "layout");
}

export async function undoTeamChange(formData: FormData): Promise<void> {
  const access = await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { data } = await db.from("team_log").select("*").eq("id", id).single();
  if (!data) return;
  await setTeamPerms(
    String(data.slack_id),
    String(data.name),
    (data.before ?? []) as string[],
    "undo",
    actorName(access),
    actorName(access),
  );
}

export async function resolveReport(formData: FormData): Promise<void> {
  const session = await requireReportViewer();
  const id = Number(formData.get("id") ?? 0);
  const dismissed = formData.get("action") === "dismiss";
  if (!id) return;
  const { data: updated, error } = await db
    .from("reports")
    .update({
      status: dismissed ? "dismissed" : "resolved",
      handled_by: `${session.name} (${session.slackId})`,
      handled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("reporter_id, target_id")
    .single();
  if (error) {
    console.error("resolveReport", error.message);
    return;
  }
  // Close the loop with the reporter , works even for anonymous reports, since
  // it goes to them privately and never names them to anyone.
  if (updated?.reporter_id) {
    const { data: target } = await db
      .from("users")
      .select("display_name")
      .eq("id", updated.target_id)
      .single();
    const name = target?.display_name ?? "a player";
    const title = "Report reviewed";
    const body = dismissed
      ? `Your report on ${name} was reviewed and closed , no action was needed this time. Thanks for helping keep Pixl safe.`
      : `Your report on ${name} was reviewed and acted on. Thanks for helping keep Pixl safe.`;
    await db.from("notifications").insert({ user_id: updated.reporter_id, title, body });
    await dmOrEmail(updated.reporter_id, title, body);
  }
  revalidatePath("/reports");
}

export async function addReportViewerAction(formData: FormData): Promise<void> {
  const session = await requireReportViewer();
  const slackId = String(formData.get("slackId") ?? "").trim().toUpperCase();
  if (!/^[UW][A-Z0-9]{6,}$/.test(slackId))
    redirect(`/reports?verror=${encodeURIComponent("Enter a valid Slack member ID (starts with U).")}`);
  await addReportViewer(slackId, `${session.name} (${session.slackId})`);
  revalidatePath("/reports");
}

export async function removeReportViewerAction(formData: FormData): Promise<void> {
  const session = await requireReportViewer();
  const slackId = String(formData.get("slackId") ?? "").trim();
  if (slackId && slackId !== session.slackId) await removeReportViewer(slackId);
  revalidatePath("/reports");
}

function parseRewards(raw: string): { icon: string; label: string }[] {
  return String(raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((l) => {
      const sp = l.indexOf(" ");
      if (sp === -1) return { icon: "🎁", label: l.slice(0, 60) };
      return { icon: l.slice(0, sp), label: l.slice(sp + 1).trim().slice(0, 60) };
    });
}

export async function addVaultLevel(formData: FormData): Promise<void> {
  await requireSuper();
  const level = Number(formData.get("level") ?? 0);
  const energy_required = Number(formData.get("energy_required") ?? 0);
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const blurb = String(formData.get("blurb") ?? "").trim().slice(0, 400);
  const position = Number(formData.get("position") ?? level) || level;
  const rewards = parseRewards(String(formData.get("rewards") ?? ""));
  if (!level || !title)
    redirect(`/community-goals?error=${encodeURIComponent("A level needs a number and a title.")}`);
  const { error } = await db
    .from("vault_levels")
    .insert({ level, energy_required, title, blurb, rewards, position, active: true });
  if (error) {
    console.error("addVaultLevel", error.message);
    redirect(`/community-goals?error=${encodeURIComponent("Couldn't save , is migration 0038 applied? (level must be unique)")}`);
  }
  revalidatePath("/community-goals");
  redirect("/community-goals?saved=1");
}

export async function updateVaultLevel(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const patch = {
    level: Number(formData.get("level") ?? 0),
    energy_required: Number(formData.get("energy_required") ?? 0),
    title: String(formData.get("title") ?? "").trim().slice(0, 80),
    blurb: String(formData.get("blurb") ?? "").trim().slice(0, 400),
    position: Number(formData.get("position") ?? 0),
    rewards: parseRewards(String(formData.get("rewards") ?? "")),
  };
  const { error } = await db.from("vault_levels").update(patch).eq("id", id);
  if (error) {
    console.error("updateVaultLevel", error.message);
    redirect(`/community-goals?error=${encodeURIComponent("Couldn't update that level.")}`);
  }
  revalidatePath("/community-goals");
  redirect("/community-goals?saved=1");
}

export async function toggleVaultLevel(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db
    .from("vault_levels")
    .update({ active: formData.get("active") === "1" })
    .eq("id", id);
  if (error) console.error("toggleVaultLevel", error.message);
  revalidatePath("/community-goals");
}

export async function deleteVaultLevel(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db.from("vault_levels").delete().eq("id", id);
  if (error) console.error("deleteVaultLevel", error.message);
  revalidatePath("/community-goals");
}

export async function addStoryNode(formData: FormData): Promise<void> {
  await requireSuper();
  const s = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  const title = s("title", 120);
  if (!title)
    redirect(`/story?error=${encodeURIComponent("A node needs a title.")}`);
  const { error } = await db.from("story_nodes").insert({
    kind: s("kind", 20) || "chapter",
    seal: s("seal", 8),
    tag: s("tag", 40),
    duration: s("duration", 40),
    title,
    body: s("body", 1200),
    quote: s("quote", 300),
    outcome: s("outcome", 400),
    position: Number(formData.get("position") ?? 0),
  });
  if (error) {
    console.error("addStoryNode", error.message);
    redirect(`/story?error=${encodeURIComponent("Couldn't save , is migration 0040 applied?")}`);
  }
  revalidatePath("/story");
  redirect("/story?saved=1");
}

export async function updateStoryNode(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const s = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  const { error } = await db
    .from("story_nodes")
    .update({
      kind: s("kind", 20) || "chapter",
      seal: s("seal", 8),
      tag: s("tag", 40),
      duration: s("duration", 40),
      title: s("title", 120),
      body: s("body", 1200),
      quote: s("quote", 300),
      outcome: s("outcome", 400),
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);
  if (error) {
    console.error("updateStoryNode", error.message);
    redirect(`/story?error=${encodeURIComponent("Couldn't update that node.")}`);
  }
  revalidatePath("/story");
  redirect("/story?saved=1");
}

export async function toggleStoryNode(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db
    .from("story_nodes")
    .update({ active: formData.get("active") === "1" })
    .eq("id", id);
  if (error) console.error("toggleStoryNode", error.message);
  revalidatePath("/story");
}

export async function deleteStoryNode(formData: FormData): Promise<void> {
  await requireSuper();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const { error } = await db.from("story_nodes").delete().eq("id", id);
  if (error) console.error("deleteStoryNode", error.message);
  revalidatePath("/story");
}
