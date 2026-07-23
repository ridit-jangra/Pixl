"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, send, upload } from "@/app/utils/server-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Compile } from "@/components/ui/dot-matrix";
import { renderMarkdown } from "@/lib/markdown";

const LEVELS: [string, string][] = [
  ["BASIC", "A small script, simple website, or single-page app"],
  ["INTERMEDIATE", "Multiple features, pages, or components"],
  ["ADVANCED", "Complex app with significant architecture"],
  ["EXPERT", "Production-quality, polished, and robust"],
];

interface ProjectData {
  id: number;
  name: string;
  description: string;
  repo_url: string;
  demo_url: string;
  image_url: string;
  level: number;
  used_ai: boolean;
  ai_notes: string;
  status: string;
  hackatime_projects: string[];
  hackatime_seconds: number;
  pixels_earned: number;
  created_at: string;
  shipped_at: string | null;
  review_note?: string;
  reject_reason?: string;
  rejected_at?: string;
}

interface JournalEntry {
  id: number;
  content: string;
  hours: number;
  created_at: string;
}

interface TimelineEvent {
  kind: string;
  at: string;
  verdict?: string;
  note?: string;
  claimedHours?: number;
  approvedHours?: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [level, setLevel] = useState(1);
  const [usedAi, setUsedAi] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalContent, setJournalContent] = useState("");
  const [journalHours, setJournalHours] = useState(0);
  const [posting, setPosting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/projects")) as { projects: ProjectData[] };
      const p = data.projects?.find((x) => x.id === Number(id));
      if (p) {
        setProject(p);
        setName(p.name || "");
        setDescription(p.description || "");
        setRepoUrl(p.repo_url || "");
        setDemoUrl(p.demo_url || "");
        setImageUrl(p.image_url || "");
        setLevel(p.level || 1);
        setUsedAi(p.used_ai || false);
        setAiNotes(p.ai_notes || "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!project) return;
    api(`/projects/${id}/journal`).then((d) =>
      setJournal((d as { entries: JournalEntry[] }).entries || []),
    );
    api(`/projects/${id}/timeline`).then((d) =>
      setTimeline((d as { events: TimelineEvent[] }).events || []),
    );
  }, [project, id]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const url = await upload(file);
      setImageUrl(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      alert(msg);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!name.trim()) return alert("Name is required.");
    setSaving(true);
    const r = await send("PUT", `/projects/${id}`, {
      name: name.trim(),
      description: description.trim(),
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim(),
      imageUrl,
      level,
      usedAi,
      aiNotes: usedAi ? aiNotes.trim() : "",
    });
    setSaving(false);
    if (r.ok) {
      const data = (await api("/projects")) as { projects: ProjectData[] };
      const p = data.projects?.find((x) => x.id === Number(id));
      if (p) setProject(p);
    } else {
      const errs: Record<string, string> = {
        name_required: "Name is required.",
        repo_not_github: "Repo URL must be a GitHub URL.",
        ai_notes_required: "AI notes must be at least 10 characters.",
      };
      alert(errs[r.error as string] || "Failed to save.");
    }
  }

  async function handleShip() {
    if (!project || shipping) return;
    setShipping(true);
    const r = await send("POST", `/projects/${id}/ship`, {});
    setShipping(false);
    if (r.ok) {
      const data = (await api("/projects")) as { projects: ProjectData[] };
      const p = data.projects?.find((x) => x.id === Number(id));
      if (p) setProject(p);
      api(`/projects/${id}/timeline`).then((d) =>
        setTimeline((d as { events: TimelineEvent[] }).events || []),
      );
    } else {
      alert(r.error || "Failed to ship.");
    }
  }

  async function handleUnship() {
    if (!project) return;
    if (!confirm("Unship this project? It goes back to draft.")) return;
    const r = await send("POST", `/projects/${id}/unship`);
    if (r.ok) {
      const data = (await api("/projects")) as { projects: ProjectData[] };
      const p = data.projects?.find((x) => x.id === Number(id));
      if (p) setProject(p);
      api(`/projects/${id}/timeline`).then((d) =>
        setTimeline((d as { events: TimelineEvent[] }).events || []),
      );
    }
  }

  async function handlePostJournal() {
    if (!project || posting) return;
    const content = journalContent.trim();
    if (!content) return alert("Write something first!");
    setPosting(true);
    const r = await send("POST", `/projects/${id}/journal`, {
      content,
      hours: journalHours,
    });
    setPosting(false);
    if (r.ok) {
      setJournalContent("");
      setJournalHours(0);
      const d = (await api(`/projects/${id}/journal`)) as {
        entries: JournalEntry[];
      };
      setJournal(d.entries || []);
    } else {
      alert(r.error || "Failed to post.");
    }
  }

  async function handleDeleteJournal(entryId: number) {
    if (!confirm("Delete this journal entry?")) return;
    const r = await send("DELETE", `/projects/${id}/journal/${entryId}`);
    if (r.ok) {
      const d = (await api(`/projects/${id}/journal`)) as {
        entries: JournalEntry[];
      };
      setJournal(d.entries || []);
    }
  }

  async function handleDeleteProject() {
    if (!project) return;
    if (!confirm(`Delete "${project.name}" and all its journal entries?`))
      return;
    if (!confirm("Really sure? Gone means gone.")) return;
    const r = await send("DELETE", `/projects/${id}`);
    if (r.ok) router.push("/projects");
  }

  function linkedSeconds() {
    return project?.hackatime_seconds ?? 0;
  }

  function canShip() {
    if (!project) return false;
    if (project.status === "shipped" || project.status === "second_review")
      return false;
    return (
      ["draft", "needs_changes", "approved"].includes(project.status) ||
      !!project.rejected_at
    );
  }

  function shipBlockers() {
    if (!project) return [];
    const b: string[] = [];
    if (!project.repo_url) b.push("add a GitHub repo");
    if (!project.demo_url) b.push("add a demo / playable link");
    if (!project.image_url) b.push("upload a thumbnail");
    if (linkedSeconds() < 3600) b.push("link a Hackatime project with >= 1h");
    return b;
  }

  const inReview =
    project?.status === "shipped" || project?.status === "second_review";
  const blockers = shipBlockers();
  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    shipped: "bg-cyan/10 text-cyan",
    second_review: "bg-cyan/10 text-cyan",
    approved: "bg-green/10 text-green",
    needs_changes: "bg-red/10 text-red",
    rejected: "bg-red/10 text-red",
  };

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Compile size={60} color="#8492a6" />
      </div>
    );

  if (!project)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Project not found.
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <button
        onClick={() => router.push("/projects")}
        className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
      >
        ← ALL PROJECTS
      </button>

      <div className="flex items-start gap-3 flex-wrap">
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          {project.name}
        </h1>
        <span
          className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${statusColor[project.status] || "bg-muted"}`}
        >
          {project.status.replace("_", " ")}
        </span>
        {project.pixels_earned > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-orange/10 text-orange uppercase font-medium">
            +{Math.round(project.pixels_earned)} PX EARNED
          </span>
        )}
      </div>

      {project.status === "needs_changes" && project.review_note && (
        <div className="p-3 rounded-lg border border-red/30 bg-red/5 text-sm">
          REVIEWER: {project.review_note}
        </div>
      )}
      {project.rejected_at && (
        <div className="p-3 rounded-lg border border-red/30 bg-red/5 text-sm">
          REJECTED{project.reject_reason ? `: ${project.reject_reason}` : ""}—
          fix it up and ship again.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>NAME *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              disabled={inReview}
            />
          </div>

          <div className="space-y-2">
            <Label>DESCRIPTION</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              disabled={inReview}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                GITHUB REPO{" "}
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange hover:underline text-xs ml-1"
                  >
                    ↗ open
                  </a>
                )}
              </Label>
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                maxLength={500}
                disabled={inReview}
              />
            </div>
            <div className="space-y-2">
              <Label>
                DEMO / PLAYABLE LINK{" "}
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange hover:underline text-xs ml-1"
                  >
                    ↗ open
                  </a>
                )}
              </Label>
              <Input
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                maxLength={500}
                disabled={inReview}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>THUMBNAIL</Label>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-32 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No image
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading || inReview}
                  onClick={() =>
                    document.getElementById("thumb-input")?.click()
                  }
                >
                  {uploading ? "UPLOADING…" : "CHOOSE IMAGE"}
                </Button>
                <input
                  id="thumb-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>COMPLEXITY</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEVELS.map(([l, tip], i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLevel(i + 1)}
                  disabled={inReview}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                    level === i + 1
                      ? "border-orange bg-orange/10"
                      : "border-border bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{l}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {tip}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={usedAi}
                onCheckedChange={(c) => setUsedAi(c === true)}
                disabled={inReview}
              />
              <div>
                <span className="font-medium">I used AI on this project</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Only you and reviewers see this.
                </p>
              </div>
            </label>
            {usedAi && (
              <div className="space-y-2 pl-7">
                <Label>WHAT DID YOU USE AI FOR? *</Label>
                <Textarea
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  maxLength={500}
                  rows={2}
                  disabled={inReview}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {inReview ? (
              <>
                <span className="text-sm text-muted-foreground">
                  IN REVIEW — CAN&apos;T EDIT
                </span>
                <Button variant="outline" onClick={handleUnship}>
                  UNSHIP TO EDIT
                </Button>
              </>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "SAVING…" : "SAVE"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SHIP IT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={project.repo_url ? "text-green" : "text-red"}>
                {project.repo_url ? "+" : "-"}
              </span>
              GitHub repo linked
            </div>
            <div className="flex items-center gap-2">
              <span className={project.demo_url ? "text-green" : "text-red"}>
                {project.demo_url ? "+" : "-"}
              </span>
              Demo link added
            </div>
            <div className="flex items-center gap-2">
              <span className={project.image_url ? "text-green" : "text-red"}>
                {project.image_url ? "+" : "-"}
              </span>
              Thumbnail uploaded
            </div>
            <div className="flex items-center gap-2">
              <span
                className={linkedSeconds() >= 3600 ? "text-green" : "text-red"}
              >
                {linkedSeconds() >= 3600 ? "+" : "-"}
              </span>
              &ge; 1h tracked on linked Hackatime projects{" "}
              <span className="text-cyan">
                ({(linkedSeconds() / 3600).toFixed(1)}h)
              </span>
            </div>
          </div>

          {inReview ? (
            <div className="p-3 rounded-lg bg-cyan/5 border border-cyan/20 text-sm">
              This project is in the review queue.
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap items-center">
              <Button
                onClick={handleShip}
                disabled={!canShip() || blockers.length > 0 || shipping}
              >
                {shipping
                  ? "SHIPPING…"
                  : canShip()
                    ? blockers.length > 0
                      ? "BLOCKED"
                      : "SHIP FOR REVIEW"
                    : "CAN'T SHIP"}
              </Button>
              {blockers.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Fix: {blockers.join(", ")}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Save your edits first
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TIMELINE</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No history yet — ship it to start the timeline.
            </p>
          ) : (
            <div className="space-y-3">
              {timeline.map((e, i) => {
                const label =
                  e.kind === "created"
                    ? "Project created"
                    : e.kind === "shipped"
                      ? "Shipped for review"
                      : e.verdict === "approved" ||
                          e.verdict === "first_pass_approved"
                        ? "Approved"
                        : e.verdict === "needs_changes"
                          ? "Sent back for changes"
                          : e.verdict === "rejected"
                            ? "Rejected"
                            : "Reviewed";
                const hoursHtml =
                  e.approvedHours != null
                    ? `Credited ${e.approvedHours}h${e.claimedHours && e.claimedHours > e.approvedHours ? ` of ${e.claimedHours}h claimed (-${Math.round((e.claimedHours - e.approvedHours) * 10) / 10}h)` : ""}`
                    : "";
                return (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(e.at)}
                        </span>
                      </div>
                      {hoursHtml && (
                        <p className="text-xs text-muted-foreground">
                          {hoursHtml}
                        </p>
                      )}
                      {e.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JOURNAL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="What did you build today? Markdown supported — **bold**, # headings, - lists, links, code blocks."
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">hours:</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={journalHours}
                  onChange={(e) => setJournalHours(Number(e.target.value))}
                  className="w-20 h-7 text-sm"
                />
              </div>
              <Button size="sm" onClick={handlePostJournal} disabled={posting}>
                {posting ? "POSTING…" : "POST ENTRY"}
              </Button>
            </div>
          </div>

          {journal.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries yet — journal as you build.
            </p>
          ) : (
            <div className="space-y-2">
              {journal.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-lg border text-sm space-y-1"
                >
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span>{timeAgo(e.created_at)}</span>
                    {e.hours > 0 && (
                      <span className="text-cyan">
                        {Number(e.hours).toFixed(1)}h
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteJournal(e.id)}
                      className="ml-auto text-red hover:underline"
                    >
                      delete
                    </button>
                  </div>
                  <div
                    className="md"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(e.content),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-red/30">
        <CardHeader>
          <CardTitle className="text-red">DANGER ZONE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Done with this project?
            </span>
            <Button variant="destructive" onClick={handleDeleteProject}>
              DELETE PROJECT
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
