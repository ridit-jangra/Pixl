"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface Ticket {
  msg_ts: string;
  description: string;
  status: string;
  opened_by_slack_id: string;
}

interface ThreadMsg {
  ts: string;
  text: string;
  name: string;
  avatar: string | null;
  isBot: boolean;
}

type Status = "open" | "all" | "closed";

function relTime(slackTs: string): string {
  const d = Date.now() - parseFloat(slackTs) * 1000;
  const m = Math.floor(d / 60000);
  const h = Math.floor(m / 60);
  const dy = Math.floor(h / 24);
  if (dy > 0) return `${dy}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "< 1m";
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtSlack(t: string): string {
  return esc(t ?? "")
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>')
    .replace(/&lt;@([A-Z0-9]+)(?:\|[^&]+)?&gt;/g, '<span class="font-semibold text-muted-foreground">@$1</span>')
    .replace(/\n/g, "<br>");
}

const TABS: { key: Status; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "all", label: "All" },
  { key: "closed", label: "Resolved" },
];

export function TicketsClient() {
  const [status, setStatus] = useState<Status>("open");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMsg[] | null>(null);
  const [draft, setDraft] = useState("");
  const [rowStatus, setRowStatus] = useState<{ msg: string; kind: "ok" | "err" | "" }>({
    msg: "",
    kind: "",
  });
  const [busy, setBusy] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams({ status });
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`/api/tickets?${params}`);
      if (res.status === 401) {
        location.href = "/login";
        return;
      }
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch {
      setTickets([]);
    }
  }, [status, search]);

  useEffect(() => {
    setTickets(null);
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const id = setInterval(loadTickets, 30000);
    return () => clearInterval(id);
  }, [loadTickets]);

  const loadThread = useCallback(async (ts: string, silent = false) => {
    if (!silent) setThread(null);
    try {
      const res = await fetch(`/api/tickets/${ts}/thread`);
      const data = await res.json();
      setThread(data.messages ?? []);
    } catch {
      setThread([]);
    }
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const id = setInterval(() => loadThread(expanded, true), 5000);
    return () => clearInterval(id);
  }, [expanded, loadThread]);

  function toggle(ts: string) {
    setRowStatus({ msg: "", kind: "" });
    if (expanded === ts) {
      setExpanded(null);
      setThread(null);
      return;
    }
    setExpanded(ts);
    setDraft("");
    loadThread(ts);
  }

  async function sendReply(ts: string) {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tickets/${ts}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDraft("");
        setRowStatus({ msg: "Sent", kind: "ok" });
        loadThread(ts, true);
      } else {
        setRowStatus({ msg: data.error || "Failed", kind: "err" });
      }
    } catch (e) {
      setRowStatus({ msg: (e as Error).message, kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 rounded-md border border-border p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                status === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => setSearch(v), 300);
          }}
          placeholder="Search tickets…"
          className="max-w-xs"
        />
      </div>

      {tickets === null ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
          No tickets found.
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const open = expanded === t.msg_ts;
            return (
              <div key={t.msg_ts} className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggle(t.msg_ts)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1 min-w-0 truncate text-sm font-medium">
                      {t.description || "[no text]"}
                    </span>
                    <Badge variant={t.status === "open" ? "warning" : "success"}>
                      {t.status === "open" ? "Open" : "Resolved"}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {relTime(t.msg_ts)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    opened by @{t.opened_by_slack_id}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20">
                    <div className="max-h-72 overflow-y-auto space-y-3 mb-3">
                      {thread === null ? (
                        <div className="text-xs text-muted-foreground">Loading…</div>
                      ) : thread.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No messages yet.</div>
                      ) : (
                        thread.map((m) => (
                          <div key={m.ts} className="flex gap-2">
                            {m.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.avatar}
                                alt=""
                                className="h-7 w-7 rounded shrink-0"
                              />
                            ) : (
                              <div className="h-7 w-7 rounded bg-muted shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold">
                                {m.name}
                                <span className="ml-2 font-normal text-muted-foreground">
                                  {relTime(m.ts)}
                                </span>
                              </div>
                              <div
                                className="text-sm break-words"
                                dangerouslySetInnerHTML={{ __html: fmtSlack(m.text) }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {t.status === "open" && (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Reply in thread as you…"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => sendReply(t.msg_ts)}
                            disabled={busy || !draft.trim()}
                          >
                            Send reply
                          </Button>
                          {rowStatus.msg && (
                            <span
                              className={`text-xs ${
                                rowStatus.kind === "ok"
                                  ? "text-emerald-500"
                                  : rowStatus.kind === "err"
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {rowStatus.msg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
