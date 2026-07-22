"use client";

import { useEffect, useState } from "react";
import { Project, JournalEntry, TimelineEvent } from "../types";
import { api, send } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ArrowLeft,
  Clock,
  Cube,
  Note,
  Timer,
  Trash,
  ArrowUp,
} from "@phosphor-icons/react";

const statusColor: Record<string, string> = {
  draft: "ghost",
  shipped: "info",
  approved: "success",
  needs_changes: "warning",
  rejected: "destructive",
  banned: "destructive",
};

const LEVELS = [
  { label: "L1 Greenhorn", desc: "A first ship: simple site, script, or tiny tool." },
  { label: "L2 Deputy", desc: "A focused app, CLI, or game with clean polish." },
  { label: "L3 Outlaw", desc: "Multiple systems working together: backend, state, infra." },
  { label: "L4 Legend", desc: "Deep systems work: complex architecture, serious scope." },
];

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Project>>({});
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [journalContent, setJournalContent] = useState("");
  const [journalHours, setJournalHours] = useState("0");
  const [posting, setPosting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await api("/projects");
      setProjects(Array.isArray(data) ? data : data?.projects || []);
    } catch {}
    setLoading(false);
  }

  async function loadDetail(id: number) {
    setSelectedId(id);
    setEditing(false);
    try {
      const data = await api(`/projects/${id}`);
      setForm(data.project || data);
      setJournal(data.entries || []);
      setTimeline(data.timeline || []);
    } catch {}
  }

  async function loadJournalFor(id: number) {
    try {
      const data = await api(`/projects/${id}/journal`);
      setJournal(data.entries || []);
    } catch {}
  }

  async function loadTimelineFor(id: number) {
    try {
      const data = await api(`/projects/${id}/timeline`);
      setTimeline(data.events || []);
    } catch {}
  }

  async function saveProject() {
    if (!form.name?.trim()) return;
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description || "",
      repoUrl: form.repo_url || "",
      demoUrl: form.demo_url || "",
      imageUrl: form.image_url || "",
      level: form.level || 1,
      usedAi: form.used_ai || false,
      aiNotes: form.ai_notes || "",
    };
    const r = selectedId
      ? await send("PUT", `/projects/${selectedId}`, body)
      : await send("POST", "/projects", body);
    setSaving(false);
    if (r.ok || r.project) {
      setEditing(false);
      setSelectedId(null);
      loadProjects();
    }
  }

  async function postJournal() {
    if (!journalContent.trim() || !selectedId) return;
    setPosting(true);
    const r = await send("POST", `/projects/${selectedId}/journal`, {
      content: journalContent,
      hours: Number(journalHours) || 0,
    });
    setPosting(false);
    if (r.ok) {
      setJournalContent("");
      setJournalHours("0");
      loadJournalFor(selectedId);
    }
  }

  async function deleteJournalEntry(entryId: number) {
    if (!selectedId) return;
    await send("DELETE", `/projects/${selectedId}/journal/${entryId}`);
    loadJournalFor(selectedId);
  }

  async function shipProject() {
    if (!selectedId) return;
    setShipLoading(true);
    const r = await send("POST", `/projects/${selectedId}/ship`, { otherYsws: false });
    setShipLoading(false);
    if (r.ok) {
      loadDetail(selectedId);
      loadProjects();
    }
  }

  async function unshipProject() {
    if (!selectedId) return;
    const r = await send("POST", `/projects/${selectedId}/unship`);
    if (r.ok) {
      loadDetail(selectedId);
      loadProjects();
    }
  }

  async function deleteProject() {
    if (!selectedId) return;
    await send("DELETE", `/projects/${selectedId}`);
    setSelectedId(null);
    loadProjects();
  }

  function startNew() {
    setSelectedId(null);
    setEditing(true);
    setForm({ name: "", description: "", level: 1, repo_url: "", demo_url: "", image_url: "" });
    setJournal([]);
    setTimeline([]);
  }

  const selected = selectedId ? projects.find((p) => p.id === selectedId) : null;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (selectedId || editing) {
    const p = form;

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedId(null); setEditing(false); }}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold">
              {editing && !selectedId ? "New Project" : p.name || "Loading..."}
            </h1>
            {selected && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={(statusColor[selected.status] || "ghost") as any}>
                  {selected.status?.replace("_", " ")}
                </Badge>
                {selected.pixels_earned ? (
                  <span className="text-sm text-emerald-500">+{selected.pixels_earned} px</span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{editing ? "Edit Project" : "Project Details"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground">Name *</label>
                  <Input
                    value={p.name || ""}
                    onChange={(e) => setForm({ ...p, name: e.target.value })}
                    placeholder="What are you building?"
                    disabled={!editing}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <Textarea
                    value={p.description || ""}
                    onChange={(e) => setForm({ ...p, description: e.target.value })}
                    placeholder="What it is, what it does..."
                    rows={3}
                    disabled={!editing}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">GitHub Repo</label>
                    <Input
                      value={p.repo_url || ""}
                      onChange={(e) => setForm({ ...p, repo_url: e.target.value })}
                      placeholder="https://github.com/you/project"
                      disabled={!editing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">Demo Link</label>
                    <Input
                      value={p.demo_url || ""}
                      onChange={(e) => setForm({ ...p, demo_url: e.target.value })}
                      placeholder="https://..."
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground">Thumbnail URL</label>
                  <Input
                    value={p.image_url || ""}
                    onChange={(e) => setForm({ ...p, image_url: e.target.value })}
                    placeholder="https://..."
                    disabled={!editing}
                  />
                  {p.image_url && (
                    <div className="h-32 rounded-lg bg-muted overflow-hidden">
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {editing && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-muted-foreground">Complexity</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LEVELS.map((l, i) => (
                          <Button
                            key={i}
                            variant={(p.level || 1) === i + 1 ? "default" : "outline"}
                            size="sm"
                            className="flex-col h-auto py-2 text-xs gap-0"
                            onClick={() => setForm({ ...p, level: i + 1 })}
                          >
                            {l.label}
                            <span className="text-[10px] opacity-70 mt-1">{l.desc}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="used-ai"
                        checked={p.used_ai || false}
                        onChange={(e) => setForm({ ...p, used_ai: e.target.checked })}
                        className="accent-primary"
                      />
                      <label htmlFor="used-ai" className="text-sm">I used AI on this project</label>
                    </div>
                    {p.used_ai && (
                      <Textarea
                        value={p.ai_notes || ""}
                        onChange={(e) => setForm({ ...p, ai_notes: e.target.value })}
                        placeholder="Describe how you used AI..."
                        rows={2}
                      />
                    )}
                  </>
                )}
                {editing && (
                  <div className="flex gap-3">
                    <Button onClick={saveProject} disabled={saving || !p.name?.trim()}>
                      {saving ? "Saving..." : selectedId ? "Save Changes" : "Create Project"}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); if (!selectedId) setSelectedId(null); }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedId && selected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cube className="size-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {timeline.map((e, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="size-2 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-medium">{e.kind === "created" ? "Created" : e.kind === "shipped" ? "Shipped" : e.verdict || "Updated"}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(e.at)}</p>
                            {e.note && <p className="text-xs mt-1">{e.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {selectedId && selected && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUp className="size-4" />
                      Ship It
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`size-2 rounded-full ${selected.repo_url ? "bg-emerald-500" : "bg-destructive"}`} />
                      <span className="text-muted-foreground">GitHub repo linked</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`size-2 rounded-full ${selected.demo_url ? "bg-emerald-500" : "bg-destructive"}`} />
                      <span className="text-muted-foreground">Demo link added</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`size-2 rounded-full ${selected.image_url ? "bg-emerald-500" : "bg-destructive"}`} />
                      <span className="text-muted-foreground">Thumbnail uploaded</span>
                    </div>
                    {selected.status === "shipped" || selected.status === "second_review" ? (
                      <Button variant="outline" onClick={unshipProject}>Unship to Edit</Button>
                    ) : (
                      <Button
                        onClick={shipProject}
                        disabled={shipLoading || !selected.repo_url || !selected.demo_url || !selected.image_url}
                      >
                        {shipLoading ? "Shipping..." : "Ship for Review"}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Note className="size-4" />
                      Journal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        placeholder="What did you build today?"
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={journalHours}
                          onChange={(e) => setJournalHours(e.target.value)}
                          className="w-20"
                          min="0"
                          step="0.5"
                          placeholder="Hours"
                        />
                        <span className="text-xs text-muted-foreground">hours</span>
                        <Button
                          size="sm"
                          className="ml-auto"
                          onClick={postJournal}
                          disabled={posting || !journalContent.trim()}
                        >
                          {posting ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                      {journal.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No journal entries yet</p>
                      ) : (
                        [...journal].reverse().map((entry) => (
                          <div key={entry.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {timeAgo(entry.created_at)}
                                {entry.hours > 0 && (
                                  <span className="text-emerald-500">{entry.hours}h</span>
                                )}
                              </div>
                              <button
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteJournalEntry(entry.id)}
                              >
                                <Trash className="size-3" />
                              </button>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button variant="destructive" onClick={deleteProject} className="w-full">
                  Delete Project
                </Button>
              </>
            )}

            {editing && !selectedId && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Build something, journal as you go, then ship it for review.</p>
                  <p>Approved hours pay out in pixels.</p>
                  <p>You need a GitHub repo, demo link, and thumbnail to ship.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Build · Journal · Ship · Get paid in pixels</p>
        </div>
        <Button onClick={startNew}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Cube className="size-12 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Log what you&apos;re building, journal as you go, then ship it for review
              </p>
            </div>
            <Button onClick={startNew}>
              <Plus className="size-4" />
              Start Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => loadDetail(p.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {p.image_url && (
                  <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{p.name}</span>
                    <Badge variant={(statusColor[p.status] || "ghost") as any}>
                      {p.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="violet">{LEVELS[(p.level || 1) - 1]?.label || `L${p.level}`}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {p.hackatime_seconds ? (
                      <span className="text-emerald-500">{Math.round(p.hackatime_seconds / 3600)}h coded</span>
                    ) : (
                      <span>No hackatime linked</span>
                    )}
                    {p.pixels_earned ? (
                      <span className="text-emerald-500">+{Math.round(p.pixels_earned)} px earned</span>
                    ) : null}
                    <span>{timeAgo(p.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
