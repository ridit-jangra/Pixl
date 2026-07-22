"use client";

import { useEffect, useState } from "react";
import { Quest } from "../types";
import { api } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  LockOpen,
  MapPin,
  User,
  Gift,
  Scroll,
} from "@phosphor-icons/react";

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api("/sidequests");
        setQuests(data.quests || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const unlocked = quests.filter((q) => q.unlocked).length;
  const progress = quests.length ? (unlocked / quests.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Quest Log</h1>
        <p className="text-sm text-muted-foreground">
          Sidequests from the villagers — special rewards on top
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Scroll className="size-8 text-amber-500" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {unlocked} / {quests.length} Unlocked
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {quests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Scroll className="size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No sidequests posted right now. The villagers are thinking...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {[...quests]
            .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
            .map((quest) => (
              <Card
                key={quest.id}
                className={`transition-all ${
                  quest.unlocked
                    ? "ring-1 ring-amber-400"
                    : "opacity-60"
                }`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                      quest.unlocked
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {quest.unlocked ? (
                      <LockOpen className="size-5" />
                    ) : (
                      <Lock className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{quest.name}</h3>
                      <Badge variant={quest.unlocked ? "warning" : "outline"}>
                        {quest.unlocked ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                    {quest.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {quest.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {quest.region && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="size-3" />
                          {quest.region}
                        </Badge>
                      )}
                      {quest.npc && (
                        <Badge variant="info" className="gap-1">
                          <User className="size-3" />
                          {quest.npc}
                        </Badge>
                      )}
                      {quest.reward && (
                        <Badge variant="success" className="gap-1">
                          <Gift className="size-3" />
                          {quest.reward}
                        </Badge>
                      )}
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
