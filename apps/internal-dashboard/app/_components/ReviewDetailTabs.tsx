"use client";

import { useEffect, useState } from "react";
import type { CommitResult } from "@/lib/github";
import type { HackatimeReport } from "@/lib/hackatime";
import type { JournalRow, ModActionRow } from "@/lib/db";
import type { YswsShip } from "@/lib/ysws";
import { CommitList } from "@/app/_components/CommitList";
import { renderMarkdown } from "@/lib/markdown";
import { DeflateInput } from "@/app/_components/DeflateInput";
import { HackatimePanel } from "@/app/_components/HackatimePanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VERDICT_LABEL: Record<
  string,
  { label: string; variant: "success" | "destructive" | "info" }
> = {
  project_approved: { label: "Approved", variant: "success" },
  project_needs_changes: { label: "Needs changes", variant: "destructive" },
  review_reverted: { label: "Reverted", variant: "info" },
};

export function ReviewDetailTabs({
  commits,
  journals,
  verdicts,
  yswsShips,
  hackatime,
}: {
  commits: CommitResult;
  journals: JournalRow[];
  verdicts: ModActionRow[];
  yswsShips: YswsShip[];
  hackatime: HackatimeReport | null;
}) {
  const [tab, setTab] = useState<
    "commits" | "journals" | "reviews" | "ysws" | "hackatime"
  >("commits");

  useEffect(() => {
    const open = () => {
      if (location.hash === "#hackatime" && hackatime) setTab("hackatime");
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [hackatime]);

  const tabs = [
    { key: "commits" as const, label: "Commits", count: commits.commits.length },
    { key: "journals" as const, label: "Journals", count: journals.length },
    ...(hackatime?.ok
      ? [{ key: "hackatime" as const, label: "Hackatime", count: hackatime.projects.filter((p) => p.linked).length }]
      : []),
    { key: "reviews" as const, label: "Past reviews", count: verdicts.length },
    { key: "ysws" as const, label: "Other YSWS", count: yswsShips.filter((s) => s.urlMatch).length },
  ];

  return (
    <Card className="overflow-hidden py-0">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start rounded-none border-b border-border px-2"
        >
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="py-3">
              {t.label}
              <Badge
                variant={tab === t.key ? "default" : "secondary"}
                className="ml-1"
              >
                {t.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="commits">
          <CommitList result={commits} />
        </TabsContent>

        {hackatime && (
          <TabsContent value="hackatime">
            <HackatimePanel report={hackatime} />
          </TabsContent>
        )}

        <TabsContent value="journals">
          <div className="divide-y divide-border">
            {journals.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">
                No journal entries.
              </div>
            )}
            {journals.map((j) => (
              <div key={j.id} className="p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="secondary">
                    {Math.round((Number(j.hours) || 0) * 10) / 10}h
                  </Badge>
                  {Number(j.hours) > 0 && (
                    <DeflateInput
                      itemKey={`j:${j.id}`}
                      maxMinutes={Math.round((Number(j.hours) || 0) * 60)}
                    />
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(j.created_at).toLocaleString()}
                  </span>
                </div>
                <div
                  className="md text-sm break-words text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(j.content) }}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ysws">
          {(() => {
            const matches = yswsShips.filter((s) => s.urlMatch);
            const Row = (s: YswsShip, i: number) => (
              <div key={i} className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{s.ysws}</span>
                  {s.urlMatch && (
                    <Badge variant="destructive">
                      same repo/demo as this submission
                    </Badge>
                  )}
                  <Badge variant="secondary">{s.hours}h</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {s.approvedAt
                      ? `approved ${new Date(s.approvedAt).toLocaleDateString()}`
                      : "no date"}
                  </span>
                </div>
                {s.description && (
                  <div className="text-sm text-foreground/70 break-words mb-1">
                    {s.description}
                  </div>
                )}
                <div className="flex gap-3 text-xs">
                  {s.codeUrl && s.codeUrl !== "null" && (
                    <a href={s.codeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      repo ↗
                    </a>
                  )}
                  {s.demoUrl && s.demoUrl !== "null" && (
                    <a href={s.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      demo ↗
                    </a>
                  )}
                </div>
              </div>
            );
            return (
              <div className="divide-y divide-border">
                {matches.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground">
                    This project&apos;s repo/demo isn&apos;t in the YSWS archive , no sign it was double-dipped.
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-destructive">
                      ⚠ This exact project also shipped to another YSWS
                    </div>
                    {matches.map(Row)}
                  </>
                )}
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="divide-y divide-border">
            {verdicts.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">
                No past reviews.
              </div>
            )}
            {verdicts.map((v) => {
              const meta = VERDICT_LABEL[v.action] ?? {
                label: v.action,
                variant: "secondary" as const,
              };
              return (
                <div
                  key={v.id}
                  className="p-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                >
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <div className="flex-1 min-w-48">
                    <span className="font-medium">{v.actor}</span>
                    <div className="text-foreground/70 break-words">{v.detail}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
