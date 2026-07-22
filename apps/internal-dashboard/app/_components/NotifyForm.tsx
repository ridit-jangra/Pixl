"use client";

import { useEffect, useRef, useState } from "react";
import { sendNotification, searchPlayers, type PlayerHit } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function NotifyForm() {
  const [everyone, setEveryone] = useState(true);
  const [player, setPlayer] = useState("");
  const [selected, setSelected] = useState<PlayerHit | null>(null);
  const [hits, setHits] = useState<PlayerHit[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && player === selected.name) {
      setOpen(false);
      return;
    }
    const q = player.trim();
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    setOpen(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchPlayers(q);
        setHits(res);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [player, selected]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (hit: PlayerHit) => {
    setSelected(hit);
    setPlayer(hit.name);
    setOpen(false);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <Card>
        <CardContent>
          <form action={sendNotification} className="space-y-4">
            <input type="hidden" name="backTo" value="/notify" />

            <div>
              <div className="text-sm font-medium mb-2">Audience</div>
              <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-card">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEveryone(true)}
                  className={everyone ? "bg-ink text-white hover:bg-ink/90" : ""}
                >
                  Everyone
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEveryone(false)}
                  className={!everyone ? "bg-ink text-white hover:bg-ink/90" : ""}
                >
                  One player
                </Button>
              </div>
            </div>

            {!everyone && (
              <div className="block" ref={boxRef}>
                <span className="block text-sm font-medium mb-1.5">Player</span>
                <div className="relative">
                  {selected && <input type="hidden" name="userId" value={selected.id} />}
                  <Input
                    name="playerName"
                    autoComplete="off"
                    value={player}
                    onChange={(e) => {
                      setPlayer(e.target.value);
                      setSelected(null);
                    }}
                    onFocus={() => hits.length > 0 && setOpen(true)}
                    placeholder="Search by display name…"
                    required={!everyone}
                    className="w-full text-sm"
                  />
                  {open && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                      {searching && hits.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
                      )}
                      {hits.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => pick(h)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <span className="grid place-items-center w-6 h-6 rounded-full bg-primary/15 text-primary text-[0.65rem] font-semibold shrink-0">
                            {h.name.replace(/^@/, "").slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-medium truncate">{h.name}</span>
                          {!h.hasSlack && (
                            <span className="ml-auto text-[0.7rem] text-amber-600 dark:text-amber-400 shrink-0">
                              no slack , no DM
                            </span>
                          )}
                        </button>
                      ))}
                      {!searching && hits.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No players found.</div>
                      )}
                    </div>
                  )}
                </div>
                {selected ? (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Selected <span className="font-medium text-foreground/70">{selected.name}</span>
                    {!selected.hasSlack && " · no Slack linked, so they won't get a DM (inbox only)"}
                  </span>
                ) : (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Pick a player from the list , no need to type the exact name.
                  </span>
                )}
              </div>
            )}

            <Label className="block">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium">Title</span>
                <span className="text-xs text-muted-foreground tabular-nums">{title.length}/100</span>
              </div>
              <Input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                placeholder="e.g. New season is live!"
                className="w-full text-sm"
              />
            </Label>

            <Label className="block">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium">Message</span>
                <span className="text-xs text-muted-foreground tabular-nums">{body.length}/500</span>
              </div>
              <Textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
                rows={5}
                required
                placeholder="Write your message…"
                className="w-full text-sm resize-y"
              />
            </Label>

            <div className="flex items-center gap-3 pt-1">
              <PendingButton
                className="bg-brand text-white border-transparent hover:bg-brand/90"
                pendingText="Sending…"
              >
                {everyone ? "Send to everyone" : "Send"}
              </PendingButton>
              <span className="text-xs text-muted-foreground">
                {everyone
                  ? "Goes to every player's in-game inbox."
                  : "Goes to one player's in-game inbox."}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Preview</div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="grid place-items-center w-6 h-6 rounded-md bg-brand text-white text-[0.6rem] font-bold">
                P
              </span>
              <span className="text-xs text-muted-foreground">Pixl · inbox</span>
            </div>
            <div className="font-semibold text-sm break-words">{title || "Title"}</div>
            <div className="text-sm text-foreground/70 mt-1 whitespace-pre-wrap break-words">
              {body || "Your message will appear here."}
            </div>
            <div className="text-[0.7rem] text-muted-foreground mt-3">
              {everyone ? "To: everyone" : `To: ${player || "…"}`}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
