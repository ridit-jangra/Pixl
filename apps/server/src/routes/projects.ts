import { Router } from "express";
import { verifySessionToken } from "../auth/session.js";
import { supabase } from "../db/client.js";
import { addNotification } from "./notifications.js";
import { findInYswsArchive } from "../shipsArchive.js";
import { fetchHackatimeStats } from "../hackatime/api.js";

const router = Router();

// List the logged-in user's projects, newest first.
router.get("/api/projects", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", session.userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[projects] list failed", error);
    return res.status(500).json({ ok: false });
  }
  const projects = data ?? [];
  const ids = projects.map((p) => p.id as number);
  const earned = new Map<number, number>();
  if (ids.length > 0) {
    const { data: txs } = await supabase
      .from("pixel_transactions")
      .select("project_id, amount")
      .in("project_id", ids)
      .in("reason", ["project_approved", "review_reverted"]);
    for (const t of txs ?? [])
      earned.set(
        t.project_id as number,
        (earned.get(t.project_id as number) ?? 0) + Number(t.amount),
      );
  }
  res.json({
    ok: true,
    projects: projects.map((p) => ({
      ...p,
      pixels_earned: earned.get(p.id as number) ?? 0,
    })),
  });
});

function isGithubRepoUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return false;
  return u.pathname.split("/").filter(Boolean).length >= 2;
}

async function urlAlive(url: string): Promise<boolean> {
  try {
    let r = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 405 || r.status === 501)
      r = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
    return r.ok || r.status === 401 || r.status === 403;
  } catch {
    return false;
  }
}

interface ProjectFields {
  name: string;
  description: string;
  repo_url: string;
  demo_url: string;
  image_url: string;
  level: number;
  used_ai: boolean;
  ai_notes: string;
  hackatime_projects: string[];
}

// Shared field parsing/validation for create + update. Returns an error code
// on a missing name or a repo link that isn't a GitHub repository.
function parseProjectBody(
  body: any,
): { error: string; fields?: never } | { error?: never; fields: ProjectFields } {
  const name = String(body?.name ?? "").trim().slice(0, 120);
  if (!name) return { error: "name_required" };
  const repoUrl = String(body?.repoUrl ?? "").trim().slice(0, 500);
  if (repoUrl && !isGithubRepoUrl(repoUrl)) return { error: "repo_not_github" };
  const usedAi = body?.usedAi === true;
  const aiNotes = String(body?.aiNotes ?? "").trim().slice(0, 500);
  if (usedAi && aiNotes.length < 10) return { error: "ai_notes_required" };
  const level = Number(body?.level ?? 1);
  return {
    fields: {
      name,
      description: String(body?.description ?? "").trim().slice(0, 2000),
      repo_url: repoUrl,
      demo_url: String(body?.demoUrl ?? "").trim().slice(0, 500),
      image_url: String(body?.imageUrl ?? "").trim().slice(0, 500),
      level: Number.isInteger(level) && level >= 1 && level <= 4 ? level : 1,
      used_ai: usedAi,
      ai_notes: usedAi ? aiNotes : "",
      hackatime_projects: Array.isArray(body?.hackatimeProjects)
        ? body.hackatimeProjects.map((p: unknown) => String(p)).slice(0, 50)
        : [],
    },
  };
}

// Create a project, optionally linked to HackTime project names.
router.post("/api/projects", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const parsed = parseProjectBody(req.body);
  if (parsed.error !== undefined)
    return res.status(400).json({ ok: false, error: parsed.error });

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: session.userId, ...parsed.fields })
    .select()
    .single();
  if (error) {
    console.error("[projects] create failed", error);
    return res.status(500).json({ ok: false });
  }
  void addNotification(session.userId, "Project logged", `You logged "${parsed.fields.name}".`);
  res.json({ ok: true, project: data });
});

// Update one of the user's own projects.
router.put("/api/projects/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const parsed = parseProjectBody(req.body);
  if (parsed.error !== undefined)
    return res.status(400).json({ ok: false, error: parsed.error });

  const { data, error } = await supabase
    .from("projects")
    .update(parsed.fields)
    .eq("id", id)
    .eq("user_id", session.userId)
    .select()
    .single();
  if (error) {
    console.error("[projects] update failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true, project: data });
});

// Ship a project for review: draft/needs_changes -> shipped, or approved ->
// shipped again as an update (requires update notes). Requires repo, demo and
// thumbnail. Undisclosed matches against the Hack Club YSWS archive get a
// system note for the reviewer plus a mod_actions entry.
router.post("/api/projects/:id/ship", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, status, repo_url, demo_url, image_url, hackatime_projects, rejected_at, banned_at")
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle();
  if (error || !project) return res.status(404).json({ ok: false });

  if (project.banned_at)
    return res.status(400).json({ ok: false, error: "project_banned" });

  const shippable = ["draft", "needs_changes", "approved"];
  if (!shippable.includes(project.status as string) && !project.rejected_at)
    return res.status(400).json({ ok: false, error: "already_shipped" });
  if (!project.repo_url)
    return res.status(400).json({ ok: false, error: "repo_required" });
  if (!project.demo_url)
    return res.status(400).json({ ok: false, error: "demo_required" });
  if (!String(project.image_url ?? "").trim())
    return res.status(400).json({ ok: false, error: "image_required" });

  const [repoAlive, demoAlive] = await Promise.all([
    urlAlive(project.repo_url as string),
    urlAlive(project.demo_url as string),
  ]);
  if (!repoAlive)
    return res.status(400).json({ ok: false, error: "repo_not_found" });
  if (!demoAlive)
    return res.status(400).json({ ok: false, error: "demo_unreachable" });

  const { data: userRow } = await supabase
    .from("users")
    .select("hackatime_token")
    .eq("id", session.userId)
    .single();
  const stats = await fetchHackatimeStats(
    (userRow as { hackatime_token?: string } | null)?.hackatime_token ?? null,
  );
  if (!stats.connected && stats.error)
    return res.status(502).json({ ok: false, error: "hackatime_unavailable" });
  const linked = new Set((project.hackatime_projects as string[]) ?? []);
  const trackedSeconds = stats.projects
    .filter((p) => linked.has(p.name))
    .reduce((sum, p) => sum + p.seconds, 0);
  if (trackedSeconds < 3600)
    return res.status(400).json({ ok: false, error: "hackatime_hours_required" });

  const isUpdate = project.status === "approved" && !project.rejected_at;
  const updateNotes = String(req.body?.updateNotes ?? "").trim().slice(0, 2000);
  if (isUpdate && !updateNotes)
    return res.status(400).json({ ok: false, error: "update_notes_required" });
  if (isUpdate && updateNotes.length < 100)
    return res.status(400).json({ ok: false, error: "update_notes_too_short" });
  const otherYsws = req.body?.otherYsws === true;

  let systemNote = "";
  const matched = await findInYswsArchive(
    project.repo_url as string,
    project.demo_url as string,
  );
  if (matched) {
    const claimedHours = Math.round((trackedSeconds / 3600) * 10) / 10;
    const suggested = Math.max(0, Math.round((claimedHours - matched.hours) * 10) / 10);
    const when = matched.approvedAt
      ? new Date(matched.approvedAt * 1000).toISOString().slice(0, 10)
      : "unknown date";
    const overlap = `It got ${matched.hours}h there (approved ${when}); the player claims ${claimedHours}h here — suggest crediting at most ${suggested}h unless the new work is clearly separate.`;
    if (otherYsws) {
      systemNote = `SYSTEM: Player disclosed this was submitted to "${matched.ysws}" (${matched.url}). ${overlap}`;
    } else {
      systemNote = `SYSTEM: ${matched.url} already appears in the Hack Club YSWS archive under "${matched.ysws}" but the player did NOT disclose it. Possible double dip. ${overlap}`;
      const { error: flagError } = await supabase.from("mod_actions").insert({
        user_id: session.userId,
        action: "double_dip_flag",
        detail: `"${project.name}" shipped without disclosure — ${matched.url} found in the YSWS archive (${matched.ysws}, ${matched.hours}h)`,
        actor: "system",
      });
      if (flagError) console.error("[projects] double dip log failed", flagError);
    }
  }

  const { data, error: updateError } = await supabase
    .from("projects")
    .update({
      status: "shipped",
      shipped_at: new Date().toISOString(),
      review_note: "",
      rejected_at: null,
      reject_reason: "",
      reject_by: "",
      hackatime_seconds: trackedSeconds,
      is_update: isUpdate,
      update_notes: isUpdate ? updateNotes : "",
      other_ysws: otherYsws,
      system_note: systemNote,
    })
    .eq("id", id)
    .eq("user_id", session.userId)
    .select()
    .single();
  if (updateError) {
    console.error("[projects] ship failed", updateError);
    return res.status(500).json({ ok: false });
  }
  void addNotification(
    session.userId,
    isUpdate ? "Update shipped" : "Project shipped",
    `"${project.name}" is in the review queue. You'll hear back here once it's reviewed.`,
  );
  res.json({ ok: true, project: data });
});

// Withdraw a project from the review queue back to a draft so the owner can
// edit it. Only allowed while it's actually in review (shipped/second_review).
router.post("/api/projects/:id/unship", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle();
  if (!project) return res.status(404).json({ ok: false });
  if (project.status !== "shipped" && project.status !== "second_review")
    return res.status(400).json({ ok: false, error: "not_in_review" });

  const { data, error } = await supabase
    .from("projects")
    .update({
      status: "draft",
      shipped_at: null,
      review_note: "",
      reviewing_by: "",
      reviewing_at: null,
    })
    .eq("id", id)
    .eq("user_id", session.userId)
    .select()
    .single();
  if (error) {
    console.error("[projects] unship failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true, project: data });
});

async function ownsProject(userId: string, projectId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[projects] ownership check failed", error);
    return false;
  }
  return data !== null;
}

// List journal entries for one of the user's own projects, newest first.
router.get("/api/projects/:id/journal", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });
  if (!(await ownsProject(session.userId, id)))
    return res.status(404).json({ ok: false });

  const { data, error } = await supabase
    .from("project_journals")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[projects] journal list failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true, entries: data ?? [] });
});

// Player-visible history for an own project: creation, current ship, and each
// review verdict with its player-facing note. Internal audit notes are never
// exposed here.
router.get("/api/projects/:id/timeline", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });
  if (!(await ownsProject(session.userId, id)))
    return res.status(404).json({ ok: false });

  const [{ data: proj }, { data: audits }] = await Promise.all([
    supabase.from("projects").select("created_at, shipped_at, status").eq("id", id).single(),
    supabase
      .from("review_audits")
      .select("verdict, note, claimed_hours, approved_hours, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const events: Record<string, unknown>[] = [];
  if (proj?.created_at) events.push({ kind: "created", at: proj.created_at });
  for (const a of audits ?? [])
    events.push({
      kind: "review",
      at: a.created_at,
      verdict: a.verdict,
      note: a.note ?? "",
      claimedHours: a.claimed_hours ?? null,
      approvedHours: a.approved_hours ?? null,
    });
  if (proj?.shipped_at && (proj.status === "shipped" || proj.status === "second_review"))
    events.push({ kind: "shipped", at: proj.shipped_at });

  events.sort(
    (a, b) => new Date(a.at as string).getTime() - new Date(b.at as string).getTime(),
  );
  res.json({ ok: true, events });
});

// Add a journal entry (markdown content + optional hours) to an own project.
router.post("/api/projects/:id/journal", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });
  if (!(await ownsProject(session.userId, id)))
    return res.status(404).json({ ok: false });

  const content = String(req.body?.content ?? "").trim().slice(0, 5000);
  if (!content)
    return res.status(400).json({ ok: false, error: "content_required" });
  let hours = Number(req.body?.hours ?? 0);
  if (!Number.isFinite(hours) || hours < 0) hours = 0;
  hours = Math.min(Math.round(hours * 100) / 100, 100);

  // Entries that log time need substance: at least 100 characters per hour
  // (min 100 for any logged time), so "4h" can't be a one-liner.
  if (hours > 0) {
    const need = Math.max(100, Math.round(hours * 100));
    if (content.length < need)
      return res.status(400).json({ ok: false, error: "journal_too_short", need, hours });
  }

  const { data, error } = await supabase
    .from("project_journals")
    .insert({ project_id: id, user_id: session.userId, content, hours })
    .select()
    .single();
  if (error) {
    console.error("[projects] journal create failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true, entry: data });
});

// Delete one of the user's own journal entries.
router.delete("/api/projects/:id/journal/:entryId", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  const entryId = Number(req.params.entryId);
  if (!Number.isFinite(id) || !Number.isFinite(entryId))
    return res.status(400).json({ ok: false });

  const { error } = await supabase
    .from("project_journals")
    .delete()
    .eq("id", entryId)
    .eq("project_id", id)
    .eq("user_id", session.userId);
  if (error) {
    console.error("[projects] journal delete failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true });
});

// Delete one of the user's own projects.
router.delete("/api/projects/:id", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ ok: false });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);
  if (error) {
    console.error("[projects] delete failed", error);
    return res.status(500).json({ ok: false });
  }
  res.json({ ok: true });
});

export default router;
