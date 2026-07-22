"use client";

import { useEffect, useState } from "react";
import { VaultData } from "../types";
import { api } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Vault,
  Lock,
  LockOpen,
  Lightning,
  Cube,
} from "@phosphor-icons/react";

function fmt(n: number) {
  return (n || 0).toLocaleString();
}

export default function VaultPage() {
  const [data, setData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await api("/vault");
        setData(d);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const energy = data?.energy || 0;
  const levels = data?.levels || [];
  const nextRequired = data?.nextRequired;
  const currentLevel = data?.currentLevel || 0;

  const prevUnlocked = levels
    .filter((l) => l.unlocked)
    .reduce((max, l) => Math.max(max, l.energyRequired || l.energy_required || 0), 0);
  const span = nextRequired ? Math.max(1, nextRequired - prevUnlocked) : 1;
  const progress = nextRequired
    ? Math.min(100, Math.max(0, ((energy - prevUnlocked) / span) * 100))
    : 100;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold">The Core Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every ship feeds restoration energy — the community recovers the vault together
        </p>
      </div>

      <Card className="text-center">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <Vault className="size-8 text-violet-500" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Restoration Energy
            </p>
            <p className="text-4xl font-heading font-bold text-amber-400">
              {fmt(energy)}
            </p>
            <p className="text-xs text-muted-foreground">Community Total</p>
          </div>
          {nextRequired && (
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Vault Level {currentLevel + 1}</span>
                <span>{fmt(nextRequired - energy)} more to recover</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {levels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Vault className="size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              The vault is sealed — no levels configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {levels.map((level, i) => {
            const unlocked = level.unlocked;
            return (
              <Card
                key={i}
                className={`transition-all ${
                  unlocked
                    ? "ring-1 ring-violet-400"
                    : "opacity-70"
                }`}
              >
                <CardContent className="p-0 flex overflow-hidden">
                  <div
                    className={`w-24 flex flex-col items-center justify-center gap-1 p-3 shrink-0 ${
                      unlocked
                        ? "bg-violet-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">Vault</span>
                    <span className="text-3xl font-heading font-bold">{level.level}</span>
                    <Badge
                      variant={unlocked ? "secondary" : "outline"}
                      className={`text-[10px] ${unlocked ? "bg-white/20 text-white" : ""}`}
                    >
                      {unlocked ? "Recovered" : "Sealed"}
                    </Badge>
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {level.title || `Vault Level ${level.level}`}
                      </h3>
                    </div>
                    {level.blurb && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {level.blurb}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="violet" className="gap-1">
                        <Lightning className="size-3" />
                        {fmt(level.energyRequired || level.energy_required || 0)}
                      </Badge>
                      {(level.rewards || []).map((r, ri) => (
                        <Badge key={ri} variant="secondary" className="gap-1">
                          {r.icon && <span>{r.icon}</span>}
                          {r.label || ""}
                        </Badge>
                      ))}
                    </div>
                    {!unlocked && (
                      <p className="text-xs text-violet-500 mt-2">
                        {fmt(Math.max(0, (level.energyRequired || level.energy_required || 0) - energy))} more energy to recover
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="p-4 text-sm text-muted-foreground text-center">
          The Core is a vault holding the old civilization&apos;s technology. As the community pours in
          <strong className="text-foreground"> Restoration Energy</strong>, it recovers another chamber — and hands
          the equipment inside back to <strong className="text-foreground">everyone</strong>.
        </CardContent>
      </Card>
    </div>
  );
}
