import { redirect } from "next/navigation";
import { getSession, isAllowed, type AdminSession } from "./session";
import { getAdmin, listReportViewerIds } from "./db";

export const ALL_PERMISSIONS = ["warn", "ban", "notify", "review"] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];

// Sub-admins are managed with these; "review" is granted from the Reviewers tab.
export const SUBADMIN_PERMISSIONS = ["warn", "ban", "notify"] as const;

// Marker stored in an admins row to take reviewing away from an env admin,
// whose review right would otherwise come from ADMIN_SLACK_IDS.
export const NO_REVIEW = "no_review";

// Marker stored in an admins row to promote a reviewer to final (second-pass)
// reviewer, on top of whoever SECOND_PASS_SLACK_IDS grants.
export const SECOND_PASS = "second_pass";

export interface AdminAccess {
  session: AdminSession;
  isSuper: boolean;
  perms: Set<string>;
  canSecondPass: boolean;
}

function envIds(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ownerSlackIds(): string[] {
  return envIds("ADMIN_SLACK_IDS");
}

export function secondPassSlackIds(): string[] {
  return envIds("SECOND_PASS_SLACK_IDS");
}

// Final reviewers do the mandatory second pass and are the only ones who can
// approve (and credit pixels). Comes from SECOND_PASS_SLACK_IDS (if unset,
// owners qualify) or a SECOND_PASS marker granted from the dashboard.
export function isSecondPassReviewer(slackId: string, tablePerms?: string[]): boolean {
  if (tablePerms?.includes(SECOND_PASS)) return true;
  const ids = secondPassSlackIds();
  if (ids.length === 0) return isAllowed(slackId);
  return ids.includes(slackId);
}

// Owners come from the ADMIN_SLACK_IDS env allowlist and hold every
// permission (minus review if blocked via NO_REVIEW); sub-admins live in the
// admins table with an explicit set.
export async function getAccess(): Promise<AdminAccess | null> {
  const session = await getSession();
  if (!session) return null;
  const row = await getAdmin(session.slackId);
  const reviewBlocked = row?.permissions.includes(NO_REVIEW) ?? false;
  const canSecondPass =
    isSecondPassReviewer(session.slackId, row?.permissions) && !reviewBlocked;
  if (isAllowed(session.slackId)) {
    const perms = new Set<string>(ALL_PERMISSIONS);
    if (reviewBlocked) perms.delete("review");
    return { session, isSuper: true, perms, canSecondPass };
  }
  if (!row) return null;
  const perms = new Set(row.permissions.filter((p) => p !== NO_REVIEW && p !== SECOND_PASS));
  return { session, isSuper: false, perms, canSecondPass };
}

// Signed-in users who lost their access land on /removed instead of the
// login screen, so they know it was on purpose (or who to ping if not).
export async function requireAdmin(): Promise<AdminAccess> {
  const access = await getAccess();
  if (access) return access;
  const session = await getSession();
  redirect(session ? "/removed" : "/login");
}

// perms carries the effective set for supers too (review may be blocked), so
// checks go through it rather than short-circuiting on isSuper.
export function canView(access: AdminAccess, perms: Permission[]): boolean {
  return perms.some((p) => access.perms.has(p));
}

// Page-level gate: sub-admins only reach pages matching one of their
// permissions; everyone else bounces back to the overview.
export async function requirePagePerm(perms: Permission[]): Promise<AdminAccess> {
  const access = await requireAdmin();
  if (!canView(access, perms)) redirect("/");
  return access;
}

export async function requirePerm(perm: Permission): Promise<AdminAccess> {
  const access = await getAccess();
  if (!access) throw new Error("Not signed in");
  if (!access.perms.has(perm))
    throw new Error(`You don't have the "${perm}" permission.`);
  return access;
}

// Reports are a separate, explicit allow-list (report_viewers table) , regular
// admins/sub-admins do NOT get in. A viewer only needs a valid session.
export async function isReportViewer(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return (await listReportViewerIds()).includes(session.slackId);
}

export async function requireReportViewer(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await listReportViewerIds()).includes(session.slackId)) redirect("/");
  return session;
}

export async function requireSuper(): Promise<AdminAccess> {
  const access = await getAccess();
  if (!access || !access.isSuper) throw new Error("Owners only.");
  return access;
}
