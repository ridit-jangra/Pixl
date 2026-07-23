"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { api, send } from "../utils/server-utils";
import { Ripple } from "@/components/ui/dot-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlayerSearchResult {
  id: string;
  display_name: string;
}

interface ReportEntry {
  id: number;
  target_id: string;
  reason: string;
  status: string;
  anonymous: boolean;
  created_at: string;
  target_name: string;
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

export default function Report() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [picked, setPicked] = useState<PlayerSearchResult | null>(null);
  const [reason, setReason] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setReportsLoading(true);
      try {
        const data = (await api("/reports/mine")) as { reports: ReportEntry[] };
        setReports(data.reports || []);
      } catch {}
      setLoading(false);
      setReportsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    const q = query.trim();
    if (q.length < 2 || picked) return;
    searchTimer.current = setTimeout(async () => {
      try {
        const data = (await api(
          `/reports/players?q=${encodeURIComponent(q)}`,
        )) as {
          players: PlayerSearchResult[];
        };
        setResults(data.players || []);
        setShowMenu(data.players?.length > 0);
      } catch {
        setShowMenu(false);
      }
    }, 220);
  }, [query, picked]);

  async function handleSubmit() {
    if (!picked || submitting) return;
    setSubmitting(true);
    const r = await send("POST", "/reports", {
      targetId: picked.id,
      reason: reason.trim(),
      anonymous,
    });
    setSubmitting(false);
    if (r.ok) {
      setReason("");
      setPicked(null);
      setQuery("");
      const data = (await api("/reports/mine")) as { reports: ReportEntry[] };
      setReports(data.reports || []);
    }
  }

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Ripple size={60} color="#a633d6" />
      </div>
    );

  return (
    <div className="p-6 space-y-6 ">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          REPORT A PLAYER
        </h1>
        <p className="text-muted-foreground mt-1">
          SEEN SOMEONE BEING MEAN? LET THE TEAM KNOW. YOU CAN STAY ANONYMOUS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FILE A REPORT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Who are you reporting?
            </p>
            <div className="relative">
              {picked ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-1 rounded bg-orange/10 text-orange border border-orange/30">
                    {picked.display_name}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setPicked(null);
                      setQuery("");
                    }}
                  >
                    change
                  </Button>
                </div>
              ) : (
                <Input
                  placeholder="Search a player's name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              )}
              {showMenu && results.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border bg-popover shadow-md max-h-48 overflow-y-auto">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setPicked(p);
                        setShowMenu(false);
                      }}
                    >
                      {p.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              What happened? (optional but helps a lot)
            </p>
            <Textarea
              placeholder="e.g. they kept insulting me in chat near the village…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={anonymous}
              onCheckedChange={(c) => setAnonymous(c === true)}
            />
            <span className="text-muted-foreground">
              Report anonymously — the review team won&apos;t be shown who you
              are. Uncheck to reveal your name to them.
            </span>
          </label>

          <Button onClick={handleSubmit} disabled={!picked || submitting}>
            {submitting ? "SUBMITTING..." : "SUBMIT REPORT"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>YOUR REPORTS</CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t filed any reports.
            </p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg border text-sm space-y-1"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.target_name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
                        r.status === "open"
                          ? "bg-orange/10 text-orange"
                          : "bg-green/10 text-green"
                      }`}
                    >
                      {r.status === "open" ? "OPEN" : r.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-medium">
                      {r.anonymous ? "ANONYMOUS" : "IDENTITY SHARED"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {timeAgo(r.created_at)}
                    </span>
                  </div>
                  {r.reason && (
                    <p className="text-muted-foreground text-xs">{r.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
