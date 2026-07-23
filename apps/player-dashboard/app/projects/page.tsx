"use client";

import { useEffect, useState } from "react";
import { api } from "../utils/server-utils";
import { Compile } from "@/components/ui/dot-matrix";
import { renderMarkdown } from "@/lib/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserProject {
  id: number;
  name: string;
  description: string;
  status: string;
  image_url: string;
  url: string;
  created_at: string;
  shipped_at: string | null;
  hackatime_seconds: number;
  pixels_earned: number;
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

export default function MyProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/projects")) as { projects: UserProject[] };
      setProjects(data.projects || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Compile size={60} color="#8492a6" />
      </div>
    );

  const displayed = projects.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {projects.length} project{projects.length !== 1 ? "s" : ""}
            .
          </p>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="absolute left-[40%] top-1/2 flex items-center flex-col gap-3">
          <p className="text-muted-foreground text-center">
            No projects yet. Ship something!
          </p>
          <Button onClick={() => router.push("/projects/new")}>
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((p) => (
            <Card key={p.id} size="sm" className="relative">
              <button
                onClick={() => router.push(`/projects/${p.id}`)}
                className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground z-10 px-2 py-1 rounded bg-background/80 border"
              >
                VIEW
              </button>
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
                {p.description && (
                  <div
                    className="text-xs text-muted-foreground line-clamp-2 md"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(p.description),
                    }}
                  />
                )}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`px-1.5 py-0.5 rounded uppercase font-medium ${
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
                  <span className="text-muted-foreground">
                    {timeAgo(p.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {p.pixels_earned > 0
                      ? `${p.pixels_earned} PX earned`
                      : "No pixels yet"}
                  </span>
                  {p.hackatime_seconds > 0 && (
                    <span className="text-cyan">
                      {(p.hackatime_seconds / 3600).toFixed(1)}h coded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projects.length > 3 && (
        <p className="text-center text-sm text-muted-foreground">
          and {projects.length - 3} more project
          {projects.length - 3 !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
