"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { adjustPixels, searchPlayers, type PlayerHit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton({ mode }: { mode: "deduct" | "grant" }) {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      className={`text-white border-transparent ${
        mode === "deduct" ? "bg-brand hover:bg-brand/90" : "bg-hc-green hover:bg-hc-green/90"
      }`}
    >
      {pending
        ? mode === "deduct"
          ? "Deducting…"
          : "Granting…"
        : mode === "deduct"
          ? "Deduct pixels"
          : "Grant pixels"}
    </Button>
  );
}

// Owner-only manual pixel correction: pick a player, deduct or grant whole
// pixels with a mandatory reason. Everything lands in the ledger.
export function PixelAdjustForm() {
  const [player, setPlayer] = useState("");
  const [selected, setSelected] = useState<PlayerHit | null>(null);
  const [hits, setHits] = useState<PlayerHit[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<"deduct" | "grant">("deduct");
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
        setHits(await searchPlayers(q));
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

  return (
    <details className="rounded-xl border border-border bg-card p-4 mb-6">
      <summary className="cursor-pointer text-sm font-semibold select-none">
        Adjust a player&apos;s pixels (owners only)
      </summary>
      <form action={adjustPixels} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] items-start">
        <div ref={boxRef} className="relative">
          {selected && <input type="hidden" name="userId" value={selected.id} />}
          <Input
            autoComplete="off"
            value={player}
            onChange={(e) => {
              setPlayer(e.target.value);
              setSelected(null);
            }}
            onFocus={() => hits.length > 0 && setOpen(true)}
            placeholder="Search player…"
            required
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
                  onClick={() => {
                    setSelected(h);
                    setPlayer(h.name);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {h.name}
                </button>
              ))}
              {!searching && hits.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No players found.</div>
              )}
            </div>
          )}
        </div>
        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-card">
          <input type="hidden" name="mode" value={mode} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("deduct")}
            className={mode === "deduct" ? "bg-brand text-white hover:bg-brand/90" : ""}
          >
            Deduct
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("grant")}
            className={mode === "grant" ? "bg-hc-green text-white hover:bg-hc-green/90" : ""}
          >
            Grant
          </Button>
        </div>
        <Input
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          placeholder="Pixels"
          className="w-28 text-sm"
        />
        <Textarea
          name="reason"
          required
          rows={2}
          placeholder="What's this for? (required , names the transaction in the log, e.g. “Logo design , contract work”. Shown to the player.)"
          className="text-sm resize-y sm:col-span-2"
        />
        <SubmitButton mode={mode} />
      </form>
    </details>
  );
}
