"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../../utils/server-utils";
import { Bloom } from "@/components/ui/dot-matrix";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExplorerPlayer {
  id: string;
  display_name: string;
  skin: string;
  created_at: string;
  avatar_url: string | null;
  card_pixelate: boolean | null;
  slack_id: string | null;
  project_count: number;
}

interface PlayerDetail {
  id: string;
  display_name: string;
  skin: string;
  created_at: string;
  pixels: number;
  avatar_url: string | null;
  card_pixelate: boolean | null;
  slack_id: string | null;
  xp_hours: number;
  level: number;
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

export default function Players() {
  const [players, setPlayers] = useState<ExplorerPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ExplorerPlayer | null>(null);
  const [detail, setDetail] = useState<PlayerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/explore/players")) as { players: ExplorerPlayer[] };
      setPlayers(data.players || []);
      setLoading(false);
    }
    load();
  }, []);

  const openDetail = useCallback((player: ExplorerPlayer) => {
    setSelected(player);
    setDetailLoading(true);
    api(`/explore/players/${encodeURIComponent(player.id)}`)
      .then((data) => setDetail((data as { player: PlayerDetail }).player))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return players;
    const q = search.toLowerCase();
    return players.filter((p) => p.display_name.toLowerCase().includes(q));
  }, [players, search]);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Bloom size={60} color="#33d6a6" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Players
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse every Pixl player.
        </p>
      </div>

      <Input
        placeholder="Find a player…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          NOBODY HERE BY THAT NAME.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              size="sm"
              className="cursor-pointer text-center pt-4"
              onClick={() => openDetail(p)}
            >
              <CardContent className="space-y-2">
                <div className="w-20 h-20 mx-auto rounded-lg bg-muted flex items-center justify-center text-2xl font-bold text-orange overflow-hidden ring-1 ring-border">
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    p.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <p className="font-medium truncate">{p.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.project_count} project{p.project_count === 1 ? "" : "s"} · joined{" "}
                  {timeAgo(p.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setDetail(null); } }}>
        {selected && detail && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{detail.display_name}</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 flex-wrap">
              <div className="w-28 h-28 rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-orange overflow-hidden ring-1 ring-border flex-shrink-0">
                {detail.avatar_url ? (
                  <img
                    src={detail.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  detail.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-bold text-orange">
                    LV {detail.level ?? 1}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Level
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-bold text-orange">
                    {Number(detail.xp_hours || 0).toFixed(1)}h
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Approved
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-bold text-orange">
                    {detail.pixels?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Pixels
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-bold text-orange">
                    {timeAgo(detail.created_at)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Joined
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
        {selected && detailLoading && (
          <DialogContent className="sm:max-w-md">
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
