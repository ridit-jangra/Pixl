"use client";

import { useEffect, useState } from "react";
import { Project } from "./types";
import { api } from "./utils/server-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Code,
  Cube,
  Users,
  Lightning,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const statusColor: Record<string, string> = {
  draft: "ghost",
  shipped: "info",
  approved: "success",
  needs_changes: "warning",
  rejected: "destructive",
  banned: "destructive",
};

export default function Overview() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, shipped: 0, approved: 0, pixels: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api("/projects");
        setProjects(data || []);
        const projs: Project[] = data || [];
        setStats({
          total: projs.length,
          shipped: projs.filter((p: Project) => p.status === "shipped").length,
          approved: projs.filter((p: Project) => p.status === "approved").length,
          pixels: projs.reduce((s: number, p: Project) => s + (p.pixels_earned || 0), 0),
        });
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to Pixl. Here&apos;s your overview.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Cube className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Code className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Lightning className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pixels Earned</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pixels.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total pixels</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your latest projects and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Cube className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No projects yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push("/projects")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {p.description?.slice(0, 60) || "No description"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={(statusColor[p.status] || "ghost") as any}>
                      {p.status.replace("_", " ")}
                    </Badge>
                    {p.pixels_earned ? (
                      <span className="text-xs text-emerald-500">+{p.pixels_earned} px</span>
                    ) : null}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
