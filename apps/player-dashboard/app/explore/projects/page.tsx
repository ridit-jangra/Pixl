"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../../utils/server-utils";
import { FlowerBloom } from "@/components/ui/dot-matrix";
import { renderMarkdown } from "@/lib/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExploreProject {
  id: number;
  user_id: string;
  name: string;
  description: string;
  url: string;
  image_url: string;
  status: string;
  hackatime_seconds: number;
  created_at: string;
  shipped_at: string | null;
  owner_name: string;
  level?: number;
}

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  image_url: string;
  status: string;
  hackatime_seconds: number;
  created_at: string;
  shipped_at: string | null;
  level?: number;
}

interface OwnerInfo {
  id: string;
  display_name: string;
}

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  hours?: number;
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

function hours(seconds: number) {
  return (seconds / 3600).toFixed(1) + "h";
}

export default function ExploreProjects() {
  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ExploreProject | null>(null);
  const [detail, setDetail] = useState<{
    project: ProjectDetail;
    owner: OwnerInfo;
    entries: JournalEntry[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/explore/projects")) as {
        projects: ExploreProject[];
      };
      setProjects(data.projects || []);
      setLoading(false);
    }
    load();
  }, []);

  const openDetail = useCallback((project: ExploreProject) => {
    setSelected(project);
    setDetailLoading(true);
    api(`/explore/projects/${project.id}`)
      .then((data) =>
        setDetail(
          data as { project: ProjectDetail; owner: OwnerInfo; entries: JournalEntry[] },
        ),
      )
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q),
    );
  }, [projects, search]);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <FlowerBloom size={60} color="#5bc0de" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Projects
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore approved projects from the community.
        </p>
      </div>

      <Input
        placeholder="Find a project…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          NO PROJECTS YET — GO MAKE THE FIRST ONE!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              size="sm"
              className="cursor-pointer"
              onClick={() => openDetail(p)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                </div>
                <p className="font-medium text-sm truncate">{p.name}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">by {p.owner_name || "?"}</span>
                  <span>{timeAgo(p.created_at)}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {p.status && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
                        p.status === "approved"
                          ? "bg-green/10 text-green"
                          : p.status === "shipped"
                            ? "bg-cyan/10 text-cyan"
                            : p.status === "needs_changes"
                              ? "bg-red/10 text-red"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status.replace("_", " ")}
                    </span>
                  )}
                  {p.hackatime_seconds ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan uppercase font-medium">
                      {hours(p.hackatime_seconds)}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setDetail(null); } }}>
        {detail && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{detail.project.name}</DialogTitle>
              <DialogDescription>
                by{" "}
                <a
                  href={`/explore/players`}
                  className="underline underline-offset-2"
                >
                  {detail.owner.display_name}
                </a>{" "}
                · started {timeAgo(detail.project.created_at)}
                {detail.project.shipped_at
                  ? ` · shipped ${timeAgo(detail.project.shipped_at)}`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4">
              <div className="w-36 h-28 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
                {detail.project.image_url ? (
                  <img
                    src={detail.project.image_url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
                      detail.project.status === "approved"
                        ? "bg-green/10 text-green"
                        : detail.project.status === "shipped"
                          ? "bg-cyan/10 text-cyan"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {detail.project.status.replace("_", " ")}
                  </span>
                  {detail.project.hackatime_seconds && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan uppercase font-medium">
                      {hours(detail.project.hackatime_seconds)} CODED
                    </span>
                  )}
                  {detail.project.level && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-medium">
                      LEVEL {detail.project.level}
                    </span>
                  )}
                </div>
                {detail.project.description && (
                  <div className="text-muted-foreground md" dangerouslySetInnerHTML={{ __html: renderMarkdown(detail.project.description) }} />
                )}
              </div>
            </div>

            {detail.entries.length > 0 && (
              <div>
                <h3 className="text-sm font-heading font-semibold mb-2">
                  DEVLOG · {detail.entries.length} ENTR
                  {detail.entries.length === 1 ? "Y" : "IES"}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {detail.entries.map((e) => (
                    <div
                      key={e.id}
                      className="p-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex gap-3 text-xs text-muted-foreground mb-1">
                        <span>{timeAgo(e.created_at)}</span>
                        {e.hours ? (
                          <span className="text-cyan">
                            {Number(e.hours).toFixed(1)}h logged
                          </span>
                        ) : null}
                      </div>
                      <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(e.content) }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        )}
        {detailLoading && (
          <DialogContent className="sm:max-w-lg">
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
