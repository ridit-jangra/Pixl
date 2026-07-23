"use client";

import { useEffect, useState } from "react";
import { api } from "../../utils/server-utils";
import { Beacon } from "@/components/ui/dot-matrix";

interface LeaderboardPlayer {
  rank: number;
  id: string;
  display_name: string;
  skin: string;
  pixels: number;
  you: boolean;
}

interface SprintData {
  name: string;
  ends_at: string;
  players: { rank: number; display_name: string; pixels: number; you: boolean }[];
  your_pixels: number;
}

function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [yourRank, setYourRank] = useState<number>(0);
  const [yourPixels, setYourPixels] = useState<number>(0);
  const [sprint, setSprint] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/explore/leaderboard")) as {
        players: LeaderboardPlayer[];
        yourRank: number;
        yourPixels: number;
        sprint: SprintData | null;
      };
      setPlayers(data.players || []);
      setYourRank(data.yourRank || 0);
      setYourPixels(data.yourPixels > 0 ? data.yourPixels : 0);
      setSprint(data.sprint || null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Beacon size={60} color="#338eda" />
      </div>
    );

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Top pixel earners in Pixl.
        </p>
      </div>

      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            NO PIXELS ANYWHERE YET.
          </p>
        ) : (
          players.map((p) => {
            const rankLabel =
              p.rank <= 3
                ? ["#1", "#2", "#3"][p.rank - 1]
                : `#${p.rank}`;
            const isTop = p.rank <= 3;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${
                  p.you ? "ring-1 ring-orange" : ""
                } ${isTop ? "bg-muted/50" : ""}`}
              >
                <span
                  className={`w-10 text-lg font-bold ${
                    p.rank === 1
                      ? "text-orange"
                      : p.rank === 2
                        ? "text-muted-foreground"
                        : p.rank === 3
                          ? "text-amber-700"
                          : "text-muted-foreground"
                  }`}
                >
                  {rankLabel}
                </span>
                <span className="flex-1 truncate">
                  {p.display_name}
                  {p.you && (
                    <span className="text-orange text-xs ml-2">← YOU</span>
                  )}
                </span>
                <span className="text-cyan font-semibold whitespace-nowrap">
                  {p.pixels.toLocaleString()} PX
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 rounded-lg border bg-muted/30 flex gap-4 flex-wrap items-center">
        <span className="text-orange font-semibold">YOUR STANDING</span>
        <span>{yourRank ? `#${yourRank}` : "UNRANKED"}</span>
        <span className="text-cyan font-semibold">
          {yourPixels.toLocaleString()} PX
        </span>
        <span className="text-xs text-muted-foreground">
          ship projects to climb
        </span>
      </div>

      {sprint && (
        <div className="p-4 rounded-lg border">
          <h3 className="text-lg font-heading font-bold text-cyan mb-1">
            {sprint.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Pixels earned during the event only · {countdown(sprint.ends_at)}
          </p>
          <div className="space-y-2">
            {sprint.players.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No sprint pixels yet — be first!
              </p>
            ) : (
              sprint.players.map((p) => (
                <div
                  key={p.rank}
                  className={`flex items-center gap-4 px-3 py-2 rounded-lg border ${
                    p.you ? "ring-1 ring-orange" : ""
                  }`}
                >
                  <span className="w-8 text-sm font-bold text-muted-foreground">
                    #{p.rank}
                  </span>
                  <span className="flex-1 text-sm truncate">
                    {p.display_name}
                    {p.you && (
                      <span className="text-orange text-xs ml-2">← YOU</span>
                    )}
                  </span>
                  <span className="text-cyan text-sm font-semibold">
                    {p.pixels.toLocaleString()} PX
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Your sprint total:{" "}
            {Number(sprint.your_pixels || 0).toLocaleString()} PX
          </p>
        </div>
      )}
    </div>
  );
}
