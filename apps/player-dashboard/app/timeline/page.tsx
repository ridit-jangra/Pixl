"use client";

import { useEffect, useState } from "react";
import { StoryNode } from "../types";
import { api } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Lock, Star } from "@phosphor-icons/react";

const EMOJI_MAP: Record<string, string> = {
  prologue: "✦",
  chapter: "◆",
  op: "⬥",
};

export default function Timeline() {
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api("/story");
        setNodes(data?.nodes || []);
      } catch {
        // Use seed data as fallback
        setNodes(SEED_NODES);
      }
      setLoading(false);
    }
    load();
  }, []);

  const revealed = (() => {
    const last = nodes.findLastIndex((n) => n.revealed !== false);
    return last >= 0 ? last : nodes.length - 1;
  })();
  const shown = nodes.slice(0, revealed + 1);
  const hasMore = revealed + 1 < nodes.length;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-32 w-full" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl mx-auto">
      <div className="text-center">
        <Badge variant="warning" className="mb-3">Season One</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          The Chronicle
          <span className="block text-lg font-normal text-muted-foreground mt-2">
            of Pixl
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
          Origin was the greatest digital civilization ever built — until the Core overloaded
          and <strong>The Great Static</strong> shattered it. Builders were called across
          universes to rebuild it, one Chapter at a time.
        </p>
      </div>

      <div className="relative pl-12">
        <div className="absolute left-[22px] top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700" />

        {shown.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Book className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">The chronicle has not been written yet.</p>
            </CardContent>
          </Card>
        ) : (
          shown.map((node, i) => {
            const kindClass =
              node.kind === "op"
                ? "op"
                : node.kind === "prologue"
                  ? "prologue"
                  : "chapter";

            const emoji = EMOJI_MAP[node.kind] || "◆";

            return (
              <div
                key={node.id || i}
                className="relative pb-8"
                style={{ animation: "fadeIn 0.3s ease-out backwards", animationDelay: `${i * 70}ms` }}
              >
                <div
                  className={`absolute left-[-24px] top-1 size-11 flex items-center justify-center rounded-lg border-2 text-sm font-bold z-10 ${
                    kindClass === "chapter"
                      ? "bg-amber-400 text-amber-950 border-amber-600"
                      : kindClass === "op"
                        ? "bg-orange-500 text-white border-orange-700 -rotate-45"
                        : "bg-stone-200 text-stone-800 border-stone-400 dark:bg-stone-700 dark:text-stone-200 dark:border-stone-500"
                   } ${kindClass === "op" ? "rotate-45" : ""}`}
                >
                  <span className={kindClass === "op" ? "-rotate-45" : ""}>
                    {node.seal || emoji}
                  </span>
                </div>

                <Card
                  className={`transition-all hover:translate-x-1 hover:-translate-y-0.5 ${
                    kindClass === "chapter"
                      ? "ring-1 ring-amber-400/30"
                      : kindClass === "op"
                        ? "ring-1 ring-orange-400/30"
                        : ""
                  }`}
                >
                  <CardHeader
                    className={`pb-2 ${
                      kindClass === "chapter"
                        ? "bg-amber-50 dark:bg-amber-500/10"
                        : kindClass === "op"
                          ? "bg-orange-50 dark:bg-orange-500/10"
                          : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">
                        {node.tag || node.kind.toUpperCase()}
                      </CardTitle>
                      {node.duration && (
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {node.duration || node.dur}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <h3 className="text-lg font-heading font-semibold mb-2">{node.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {(node.quote || node.q) && (
                        <span className="italic text-amber-500">&ldquo;{node.quote || node.q}&rdquo; </span>
                      )}
                      {node.body}
                    </p>
                    {node.outcome && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">Outcome: </span>
                        {node.outcome}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}

        {hasMore && (
          <div className="relative pb-4">
            <div className="absolute left-[-24px] top-1 size-11 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground bg-muted z-10">
              <Lock className="size-4" />
            </div>
            <Card className="border-dashed opacity-60">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">The story continues...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The next page of the Chronicle has not been written yet.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

const SEED_NODES: StoryNode[] = [
  {
    id: "prologue", kind: "prologue", seal: "✦", tag: "PROLOGUE",
    title: "The Fall of Pixl",
    body: "Origin has fallen. Centuries of every invention uploaded into the Core finally exceeded its limits — the overload became The Great Static, and the world crashed into pixelated fragments drifting in the Void. Unable to repair itself, the Core reaches into our universe and wakes the Builders."
  },
  {
    id: "chapter-1", kind: "chapter", seal: "I", tag: "CHAPTER I", duration: "3 WEEKS",
    title: "Rise of Pixl",
    body: "Builders arrive in Pixl for the first time. They restore the Capital District, reactivate the Core, and help the first settlements recover from the Crash. Hope returns for the first time in centuries."
  },
  {
    id: "operation-1", kind: "op", seal: "I", tag: "OPERATION I", duration: "1 WEEK",
    title: "Forge Weekend",
    q: "The Capital is standing… but its workshops remain silent.",
    body: "A mini online hackathon focused on developer tools.",
    outcome: "The Great Forge is restored — Pixl can manufacture advanced technology once again."
  },
];
