"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "../utils/server-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlass, Trophy, CaretRight, Users, Cube, Clock, Medal, Star } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";

interface Player {
  id: string;
  display_name: string;
  slack_id?: string;
  avatar_url?: string;
  project_count: number;
  pixels?: number;
  level?: number;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  owner_name?: string;
  owner_id?: string;
  status: string;
  level?: number;
  hackatime_seconds?: number;
  created_at: string;
}

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  pixels: number;
  you?: boolean;
}

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

const statusColor: Record<string, string> = {
  draft: "ghost",
  shipped: "info",
  approved: "success",
  needs_changes: "warning",
  rejected: "destructive",
};

export default function Explore() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "players";

  const [players, setPlayers] = useState<Player[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const loadPlayers = useCallback(async (q = "") => {
    try {
      const data = await api("/explore/players" + (q ? "?q=" + encodeURIComponent(q) : ""));
      setPlayers(data.players || []);
    } catch {}
  }, []);

  const loadProjects = useCallback(async (q = "") => {
    try {
      const data = await api("/explore/projects" + (q ? "?q=" + encodeURIComponent(q) : ""));
      setProjects(data.projects || []);
    } catch {}
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await api("/explore/leaderboard");
      setLeaderboard(data.players || []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPlayers(), loadProjects(), loadLeaderboard()]).finally(() => setLoading(false));
  }, [loadPlayers, loadProjects, loadLeaderboard]);

  let searchTimer: ReturnType<typeof setTimeout>;
  function onSearch(val: string) {
    setSearch(val);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadPlayers(val);
      loadProjects(val);
    }, 350);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">Discover players, projects, and the leaderboard</p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search players or projects..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="players"><Users className="size-4" /> Players</TabsTrigger>
          <TabsTrigger value="projects"><Cube className="size-4" /> Projects</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="size-4" /> Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex flex-col items-center gap-3">
                    <Skeleton className="size-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No players found</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedPlayer(p)}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                      {p.display_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{p.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.project_count} project{p.project_count !== 1 ? "s" : ""} · joined {timeAgo(p.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Cube className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                  onClick={() => setSelectedProject(p)}
                >
                  {p.image_url && (
                    <div className="h-32 bg-muted overflow-hidden">
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 flex flex-col gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description || "No description"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={(statusColor[p.status] || "ghost") as any}>
                        {p.status.replace("_", " ")}
                      </Badge>
                      {p.hackatime_seconds ? (
                        <span className="text-xs text-muted-foreground">{Math.round(p.hackatime_seconds / 3600)}h coded</span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="size-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Trophy className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No pixels earned yet</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 border-b last:border-0 ${
                      entry.you ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {entry.rank <= 3 ? (
                        <Medal className={`size-5 ${
                          entry.rank === 1 ? "text-amber-400" :
                          entry.rank === 2 ? "text-slate-400" :
                          "text-amber-700"
                        }`} />
                      ) : (
                        <span className="text-sm text-muted-foreground">#{entry.rank}</span>
                      )}
                    </div>
                    <span className="flex-1 font-medium truncate">
                      {entry.display_name}
                      {entry.you && <Badge variant="outline" className="ml-2">You</Badge>}
                    </span>
                    <span className="text-sm font-mono text-emerald-500">
                      {entry.pixels.toLocaleString()} PX
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
                <DialogDescription>
                  by {selectedProject.owner_name || "Unknown"}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {selectedProject.image_url && (
                  <div className="h-40 rounded-lg bg-muted overflow-hidden">
                    <img src={selectedProject.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm">{selectedProject.description || "No description"}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={(statusColor[selectedProject.status] || "ghost") as any}>
                    {selectedProject.status.replace("_", " ")}
                  </Badge>
                  {selectedProject.level && (
                    <Badge variant="violet">L{selectedProject.level}</Badge>
                  )}
                  {selectedProject.hackatime_seconds ? (
                    <Badge variant="info">{Math.round(selectedProject.hackatime_seconds / 3600)}h</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">Created {timeAgo(selectedProject.created_at)}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-sm">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPlayer.display_name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {selectedPlayer.display_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedPlayer.project_count} project{selectedPlayer.project_count !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined {timeAgo(selectedPlayer.created_at)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
