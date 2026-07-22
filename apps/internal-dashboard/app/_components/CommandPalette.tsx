"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";

export interface NavItem {
  href: string;
  label: string;
}
export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

interface PlayerHit {
  id: string;
  label: string;
  sub: string;
}
interface ProjectHit {
  id: number;
  label: string;
}

export function CommandPalette({ navGroups }: { navGroups: NavGroup[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<PlayerHit[]>([]);
  const [projects, setProjects] = useState<ProjectHit[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setPlayers([]);
      setProjects([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) return;
        const d = (await res.json()) as {
          players?: PlayerHit[];
          projects?: ProjectHit[];
        };
        setPlayers(d.players ?? []);
        setProjects(d.projects ?? []);
      } catch {
        /* aborted */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  const ql = q.trim().toLowerCase();
  const nav = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => !ql || it.label.toLowerCase().includes(ql)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left text-[0.9rem]">Search…</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
          >
            <CommandInput
              value={q}
              onValueChange={setQ}
              placeholder="Search pages, players, projects…"
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {nav.map((g, i) => (
                <CommandGroup key={i} heading={g.label ?? "Navigate"}>
                  {g.items.map((it) => (
                    <CommandItem
                      key={it.href}
                      value={`nav:${it.href}`}
                      onSelect={() => go(it.href)}
                    >
                      {it.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {players.length > 0 && (
                <CommandGroup heading="Players">
                  {players.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`player:${p.id}`}
                      onSelect={() => go(`/players/${p.id}`)}
                    >
                      <span>{p.label}</span>
                      {p.sub && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {p.sub}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {projects.length > 0 && (
                <CommandGroup heading="Projects">
                  {projects.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`project:${p.id}`}
                      onSelect={() => go(`/projects/${p.id}`)}
                    >
                      {p.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
