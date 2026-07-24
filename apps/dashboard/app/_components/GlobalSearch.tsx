"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/app/_components/ProjectBadges";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";

interface PlayerHit {
  id: string;
  label: string;
  sub: string;
}
interface ProjectHit {
  id: number;
  label: string;
  status: string;
}
interface FlatItem {
  href: string;
  label: string;
  sub?: string;
  status?: string;
  group: "Players" | "Projects";
}

export function GlobalSearch() {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FlatItem[]>([]);
  const [active, setActive] = useState(0);

  // ⌘K / Ctrl+K to focus, "/" to focus when not typing elsewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // click outside closes
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // debounced fetch
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        const data: { players: PlayerHit[]; projects: ProjectHit[] } = await res.json();
        const flat: FlatItem[] = [
          ...data.players.map((p) => ({
            href: `/players/${p.id}`,
            label: p.label,
            sub: p.sub,
            group: "Players" as const,
          })),
          ...data.projects.map((p) => ({
            href: `/projects/${p.id}`,
            label: p.label,
            status: p.status,
            group: "Projects" as const,
          })),
        ];
        setItems(flat);
        setActive(0);
      } catch {
        /* aborted or failed */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = (item: FlatItem) => {
    setOpen(false);
    setQ("");
    setItems([]);
    inputRef.current?.blur();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && q.trim().length >= 2;
  let cursor = -1;

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search players, projects…"
          className="w-full pl-9 pr-12 h-9"
          aria-label="Global search"
        />
        <Kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex pointer-events-none">
          ⌘K
        </Kbd>
      </div>

      {showPanel && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-border bg-popover p-1.5 max-h-[70vh] overflow-y-auto shadow-lg">
          {loading && items.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">Searching…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">No matches for “{q.trim()}”.</div>
          )}
          {(["Players", "Projects"] as const).map((group) => {
            const groupItems = items.filter((i) => i.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group} className="mb-1 last:mb-0">
                <div className="px-3 pt-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </div>
                {groupItems.map((item) => {
                  cursor += 1;
                  const idx = cursor;
                  const isActive = idx === active;
                  return (
                    <button
                      key={`${group}-${item.href}`}
                      type="button"
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex-1 min-w-0 truncate font-medium">{item.label}</span>
                      {item.sub && (
                        <span className="text-xs text-muted-foreground truncate shrink-0 max-w-[40%]">
                          {item.sub}
                        </span>
                      )}
                      {item.status && <StatusBadge status={item.status} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
