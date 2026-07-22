"use client";

import { useEffect, useState, useRef } from "react";
import { Report } from "../types";
import { api, send } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flag,
  MagnifyingGlass,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";

interface PlayerResult {
  id: string;
  display_name: string;
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

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [picked, setPicked] = useState<PlayerResult | null>(null);
  const [reason, setReason] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMine();
  }, []);

  async function loadMine() {
    setLoading(true);
    try {
      const data = await api("/reports/mine");
      setReports(data.reports || []);
    } catch {}
    setLoading(false);
  }

  function onSearch(val: string) {
    setSearch(val);
    setPicked(null);
    if (searchTimer) clearTimeout(searchTimer);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await api("/reports/players?q=" + encodeURIComponent(val));
        setResults(data.players || []);
      } catch {
        setResults([]);
      }
    }, 220);
    setSearchTimer(timer);
  }

  async function submitReport() {
    if (!picked) return;
    setSubmitting(true);
    const r = await send("POST", "/reports", {
      targetId: picked.id,
      reason,
      anonymous,
    });
    setSubmitting(false);
    if (r.ok) {
      setPicked(null);
      setSearch("");
      setReason("");
      loadMine();
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Report a Player</h1>
        <p className="text-sm text-muted-foreground">
          Seen someone being mean? Let the team know. You can stay anonymous.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-4" />
            File a Report
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Who are you reporting?</label>
            {picked ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm py-1">{picked.display_name}</Badge>
                <Button variant="ghost" size="xs" onClick={() => { setPicked(null); setSearch(""); }}>Change</Button>
              </div>
            ) : (
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search a player's name..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                />
                {results.length > 0 && (
                  <div
                    ref={menuRef}
                    className="absolute z-10 left-0 right-0 mt-1 rounded-lg border bg-popover shadow-md max-h-48 overflow-y-auto"
                  >
                    {results.map((p) => (
                      <button
                        key={p.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setPicked(p);
                          setResults([]);
                          setSearch("");
                        }}
                      >
                        {p.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">What happened? (optional but helps)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. they kept insulting me in chat near the village..."
              rows={3}
              maxLength={500}
            />
            <span className="text-xs text-muted-foreground self-end">{reason.length} / 500</span>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="accent-primary"
            />
            Report anonymously — the review team won&apos;t be shown who you are.
          </label>

          <Button
            onClick={submitReport}
            disabled={!picked || submitting}
            className="self-start"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-4" />
            Your Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3 mt-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Flag className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">You haven&apos;t filed any reports.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((r) => (
                <div key={r.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.target_name}</span>
                    <Badge variant={r.status === "open" ? "warning" : "success"}>
                      {r.status === "open" ? "Open" : r.status.toUpperCase()}
                    </Badge>
                    <Badge variant={r.anonymous ? "outline" : "secondary"}>
                      {r.anonymous ? "Anonymous" : "Identity Shared"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{timeAgo(r.created_at)}</span>
                  </div>
                  {r.reason && (
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
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
