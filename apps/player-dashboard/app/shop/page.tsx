"use client";

import { useEffect, useState, useMemo } from "react";
import { ShopData, ShopItem } from "../types";
import { api, send } from "../utils/server-utils";
import { HeartPulse } from "@/components/ui/dot-matrix";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { renderMarkdown } from "@/lib/markdown";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function isTrophy(item: ShopItem) {
  return Number(item.unlock_xp) > 0;
}

function optionGroups(item: ShopItem) {
  const named: { name: string; choices: string[] }[] = [];
  const loose: string[] = [];
  for (const raw of Array.isArray(item.options) ? item.options : []) {
    const o = String(raw);
    const idx = o.indexOf(":");
    if (idx > 0) {
      const name = o.slice(0, idx).trim();
      const choices = o
        .slice(idx + 1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (choices.length) named.push({ name, choices });
    } else if (o.trim()) {
      loose.push(o.trim());
    }
  }
  if (loose.length) named.unshift({ name: "", choices: loose });
  return named;
}

export default function Shop() {
  const [shop, setShop] = useState<ShopData>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [optionPick, setOptionPick] = useState<Record<number, string>>({});
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = (await api("/shop/items")) as ShopData;
      setShop(data);
      setLoading(false);
    }
    load();
  }, []);

  function canAfford(item: ShopItem) {
    if (!shop) return false;
    return shop.pixels >= Number(item.price);
  }

  function trophyState(item: ShopItem) {
    if (!shop) return "locked";
    if (shop.claimed.includes(item.id)) return "claimed";
    return shop.xp >= Number(item.unlock_xp) ? "claimable" : "locked";
  }

  function optionSummary() {
    if (!selected) return "";
    return optionGroups(selected)
      .map((g, gi) => {
        const pick = optionPick[gi] ?? g.choices[0];
        return g.name ? `${g.name}: ${pick}` : pick;
      })
      .join(" · ");
  }

  async function handleBuy() {
    if (!selected || buying) return;
    if (isTrophy(selected)) {
      if (trophyState(selected) !== "claimable") return;
      setBuying(true);
      const r = await send("POST", `/shop/claim/${selected.id}`);
      setBuying(false);
      if (r.ok && r.claimed) {
        setShop((prev) =>
          prev ? { ...prev, claimed: [...prev.claimed, selected.id] } : prev,
        );
        setSelected(null);
      }
      return;
    }

    if (!canAfford(selected)) return;
    setBuying(true);
    const r = await send("POST", `/shop/buy/${selected.id}`, {
      option: optionSummary(),
    });
    setBuying(false);
    if (r.ok && typeof r.balance === "number") {
      setShop((prev) => prev ? { ...prev, items: [...prev.items] } : prev);
      setSelected(null);
    }
  }

  const filtered = useMemo(() => {
    if (!shop) return { trophies: [] as ShopItem[], items: [] as ShopItem[] };
    const q = search.toLowerCase();
    const match = (i: ShopItem) =>
      !q ||
      i.name.toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q);

    const trophies = shop.items.filter((i) => isTrophy(i) && match(i));
    let list = shop.items.filter((i) => !isTrophy(i) && match(i));

    if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "pricey")
      list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return { trophies, items: list };
  }, [shop, search, sort]);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <HeartPulse size={60} color="#ff8c37" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          THE PIXL SHOP
        </h1>
        <p className="text-muted-foreground mt-1">
          STICKERS · LICENSES · PLUSHIES · HARDWARE — ALL REAL
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search the shelves…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">FEATURED</SelectItem>
            <SelectItem value="cheap">PRICE ↑</SelectItem>
            <SelectItem value="pricey">PRICE ↓</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.trophies.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-heading font-bold text-orange mb-3">
              TROPHIES — EARNED, NOT BOUGHT
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.trophies.map((item) => {
                const state = trophyState(item);
                const need = Number(item.unlock_xp);
                const pct = shop
                  ? Math.max(
                      0,
                      Math.min(100, (shop.xp / Math.max(1, need)) * 100),
                    )
                  : 0;
                return (
                  <Card
                    key={item.id}
                    size="sm"
                    className={`cursor-pointer transition-opacity ${
                      state === "locked" ? "opacity-60" : ""
                    } ${state === "claimable" ? "ring-2 ring-orange" : ""} ${
                      state === "claimed" ? "ring-2 ring-green" : ""
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : null}
                      </div>
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      {state === "locked" && (
                        <div className="space-y-1">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-orange rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(shop?.xp ?? 0)} / {need} XP
                          </p>
                        </div>
                      )}
                      {state === "claimable" && (
                        <span className="text-xs font-semibold text-orange">
                          CLAIM ME!
                        </span>
                      )}
                      {state === "claimed" && (
                        <span className="text-xs font-semibold text-green">
                          CLAIMED
                        </span>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          <hr className="border-border" />
        </>
      )}

      <div>
        {filtered.items.length === 0 && filtered.trophies.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            NOTHING IN STOCK. CHECK BACK SOON!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.items.map((item) => (
              <Card
                key={item.id}
                size="sm"
                className={`cursor-pointer relative ${
                  item.limited ? "ring-1 ring-orange" : ""
                }`}
                onClick={() => {
                  setOptionPick({});
                  setSelected(item);
                }}
              >
                {item.limited && (
                  <span className="absolute -top-2 right-2 bg-orange text-orange-foreground text-[10px] font-bold px-2 py-0.5 rounded z-10">
                    LIMITED
                  </span>
                )}
                <CardContent className="p-3 space-y-2">
                  <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <div className="text-xs text-muted-foreground line-clamp-2 md" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description) }} />
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-sm font-semibold ${
                        canAfford(item) ? "text-cyan" : "text-red"
                      }`}
                    >
                      {Number(item.price)} PX
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full border ${
                        canAfford(item)
                          ? "bg-green border-green"
                          : "bg-red border-red"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
              {selected.limited && selected.limited_until && (
                <DialogDescription>
                  LIMITED — ends{" "}
                  {new Date(selected.limited_until).toLocaleDateString()}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="flex gap-4 flex-wrap">
              <div className="w-40 h-40 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-[200px] space-y-3">
                {isTrophy(selected) ? (
                  <>
                    <span className="text-xs font-semibold text-orange uppercase">
                      LEVEL {selected.unlock_xp} TROPHY — EARNED, NOT BOUGHT
                    </span>
                    <div className="text-sm md" dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.description) }} />
                    {optionGroups(selected).flatMap((g) => g.choices).length >
                      0 && (
                      <div className="flex flex-wrap gap-2">
                        {optionGroups(selected)
                          .flatMap((g) => g.choices)
                          .map((o) => (
                            <span
                              key={o}
                              className="text-xs px-2 py-1 rounded border border-border bg-muted"
                            >
                              {o.toUpperCase()}
                            </span>
                          ))}
                      </div>
                    )}
                    {(() => {
                      const state = trophyState(selected);
                      const need = Number(selected.unlock_xp);
                      const pct = shop
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              (shop.xp / Math.max(1, need)) * 100,
                            ),
                          )
                        : 0;
                      return (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                YOU&apos;RE AT {Math.floor(shop?.xp ?? 0)} /{" "}
                                {need} XP
                              </span>
                              {pct >= 100 && <span>EARNED!</span>}
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 100 ? "bg-green" : "bg-orange"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {pct < 100 && (
                              <p className="text-xs text-muted-foreground">
                                {need - Math.floor(shop?.xp ?? 0)} to go
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              disabled={state !== "claimable" || buying}
                              onClick={handleBuy}
                              className="w-full"
                            >
                              {state === "claimed"
                                ? "CLAIMED"
                                : state === "claimable"
                                  ? buying
                                    ? "CLAIMING..."
                                    : "CLAIM"
                                  : "LOCKED"}
                            </Button>
                          </DialogFooter>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <div className="text-sm md" dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.description) }} />
                    {optionGroups(selected).length > 0 && (
                      <div className="space-y-2">
                        {optionGroups(selected).map((g, gi) => (
                          <div key={gi}>
                            {g.name && (
                              <p className="text-xs text-muted-foreground uppercase mb-1">
                                {g.name}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {g.choices.map((c) => (
                                <button
                                  key={c}
                                  onClick={() =>
                                    setOptionPick((prev) => ({
                                      ...prev,
                                      [gi]: c,
                                    }))
                                  }
                                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                                    (optionPick[gi] ?? g.choices[0]) === c
                                      ? "bg-orange text-orange-foreground border-orange"
                                      : "border-border bg-muted hover:bg-muted/80"
                                  }`}
                                >
                                  {c.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-cyan">
                        {Number(selected.price)} PIXELS
                      </p>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            canAfford(selected) ? "bg-green" : "bg-orange"
                          }`}
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                ((shop?.pixels ?? 0) /
                                  Math.max(1, selected.price)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        YOU HAVE{" "}
                        {Math.round(shop?.pixels ?? 0).toLocaleString()}{" "}
                        / {Number(selected.price)} PX
                        {canAfford(selected) ? " — EASY." : ""}
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={!canAfford(selected) || buying}
                        onClick={handleBuy}
                        className="w-full"
                      >
                        {buying ? "BUYING..." : "BUY"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
