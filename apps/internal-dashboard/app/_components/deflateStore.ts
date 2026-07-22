"use client";

// Shared store so reviewers can deflate time straight off a commit or a journal
// row and have it subtract from the credited-hours total in the review form.
// Keyed per item (c:<sha> / j:<id>), values are minutes to remove.
//
// Drafts are persisted to localStorage per project, so a reviewer who fills in
// the deflate boxes but leaves without submitting a verdict gets them back on
// their next visit. The draft is cleared once a verdict is submitted.

type Sub = () => void;

const deductions = new Map<string, number>();
const subs = new Set<Sub>();
let currentProjectId: string | null = null;

function notify() {
  for (const s of subs) s();
}

function storageKey(pid: string): string {
  return `pixl.deflate.${pid}`;
}

function persist(): void {
  if (currentProjectId == null || typeof localStorage === "undefined") return;
  try {
    if (deductions.size === 0) {
      localStorage.removeItem(storageKey(currentProjectId));
      return;
    }
    const obj: Record<string, number> = {};
    for (const [k, v] of deductions) obj[k] = v;
    localStorage.setItem(storageKey(currentProjectId), JSON.stringify(obj));
  } catch {
    /* private mode / quota , persistence is best-effort */
  }
}

// Point the store at a project and load any saved draft for it. Safe to call on
// every review-form mount; a no-op if we're already on that project.
export function initDeductions(projectId: string): void {
  if (currentProjectId === projectId) return;
  currentProjectId = projectId;
  deductions.clear();
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(storageKey(projectId));
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, unknown>;
        for (const [k, v] of Object.entries(obj)) {
          const m =
            typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
          if (m > 0) deductions.set(k, m);
        }
      }
    } catch {
      /* corrupt draft , ignore it */
    }
  }
  notify();
}

export function setDeduction(key: string, minutes: number): void {
  const m = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  if (m > 0) deductions.set(key, m);
  else deductions.delete(key);
  persist();
  notify();
}

export function getDeduction(key: string): number {
  return deductions.get(key) ?? 0;
}

export function totalDeductedMinutes(): number {
  let t = 0;
  for (const v of deductions.values()) t += v;
  return t;
}

// Called once a verdict is submitted , the deductions have been applied, so drop
// both the in-memory copy and the saved draft.
export function clearDeductions(): void {
  const pid = currentProjectId;
  deductions.clear();
  if (pid != null && typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(storageKey(pid));
    } catch {
      /* best-effort */
    }
  }
  notify();
}

export function subscribeDeductions(s: Sub): () => void {
  subs.add(s);
  return () => {
    subs.delete(s);
  };
}
