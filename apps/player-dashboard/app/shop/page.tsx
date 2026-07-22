"use client";

import { useEffect, useState } from "react";
import { ShopData } from "../types";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlass, Tag, Clock, Cube, Star, ShoppingCart } from "@phosphor-icons/react";

export default function Shop() {
  const [shop, setShop] = useState<ShopData>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [selectedItem, setSelectedItem] = useState<ShopData["items"][0] | null>(null);
  const [optionPick, setOptionPick] = useState<Record<number, string>>({});
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api("/shop/items");
        setShop(data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const items = (shop?.items || []).filter((i) => !i.unlock_xp);
  const trophies = (shop?.items || []).filter((i) => i.unlock_xp > 0);

  const filtered = items.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "cheap") return a.price - b.price;
    if (sort === "pricey") return b.price - a.price;
    if (sort === "name") return a.name.localeCompare(b.name);
    return a.id - b.id;
  });

  function parseOptions(item: typeof selectedItem) {
    if (!item?.options) return [];
    const groups: { name: string; choices: string[] }[] = [];
    const loose: string[] = [];
    for (const raw of item.options) {
      const idx = raw.indexOf(":");
      if (idx > 0) {
        const name = raw.slice(0, idx).trim();
        const choices = raw.slice(idx + 1).split(",").map((s) => s.trim()).filter(Boolean);
        if (choices.length) groups.push({ name, choices });
      } else if (raw.trim()) loose.push(raw.trim());
    }
    if (loose.length) groups.unshift({ name: "", choices: loose });
    return groups;
  }

  function optionSummary() {
    if (!selectedItem) return "";
    return parseOptions(selectedItem)
      .map((g, gi) => {
        const pick = optionPick[gi] ?? g.choices[0];
        return g.name ? `${g.name}: ${pick}` : pick;
      })
      .join(" · ");
  }

  function canAfford(item: typeof selectedItem) {
    if (!shop || !item) return false;
    const totalPixels = items.reduce((s, i) => s + i.price, 0);
    return (shop.xp || 0) >= item.price;
  }

  async function handleBuy() {
    if (!selectedItem || buying) return;
    setBuying(true);
    const option = optionSummary();
    const r = await send("POST", `/shop/buy/${selectedItem.id}`, { option });
    setBuying(false);
    if (r.ok) {
      setSelectedItem(null);
    }
  }

  async function claimTrophy(id: number) {
    const r = await send("POST", `/shop/claim/${id}`);
    if (r.ok) {
      setSelectedItem(null);
      const data = await api("/shop/items");
      setShop(data);
    }
  }

  const trophyState = (item: ShopData["items"][0]) => {
    if (shop?.claimed?.includes(item.id)) return "claimed";
    return (shop?.xp || 0) >= item.unlock_xp ? "claimable" : "locked";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">The Pixl Shop</h1>
        <p className="text-sm text-muted-foreground">Stickers · Licenses · Plushies · Hardware</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search the shelves..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="cheap">Price ↑</SelectItem>
            <SelectItem value="pricey">Price ↓</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex flex-col gap-3">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {trophies.length > 0 && (
            <>
              <div>
                <h2 className="text-lg font-heading font-semibold mb-3">Trophies</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {trophies.map((item) => {
                    const state = trophyState(item);
                    return (
                      <Card
                        key={item.id}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                          state === "claimable" ? "ring-2 ring-amber-400" :
                          state === "claimed" ? "ring-2 ring-emerald-400" : ""
                        }`}
                        onClick={() => {
                          setSelectedItem(item);
                          setOptionPick({});
                        }}
                      >
                        <CardContent className="p-4 flex flex-col gap-3">
                          {item.image_url && (
                            <div className="h-36 rounded-lg bg-muted overflow-hidden">
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          <Badge variant={
                            state === "claimed" ? "success" :
                            state === "claimable" ? "warning" : "outline"
                          }>
                            {state === "claimed" ? "Claimed" :
                             state === "claimable" ? "Claim me!" :
                             `Level ${item.unlock_xp}`}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.length === 0 ? (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <ShoppingCart className="size-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nothing in stock. Check back soon!</p>
              </div>
            ) : sorted.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden ${
                  item.limited ? "ring-1 ring-amber-400" : ""
                }`}
                onClick={() => {
                  setSelectedItem(item);
                  setOptionPick({});
                }}
              >
                {item.limited && (
                  <div className="bg-amber-400 text-amber-950 text-[10px] font-bold text-center py-1 tracking-wider">
                    LIMITED
                  </div>
                )}
                {item.image_url && (
                  <div className="h-36 bg-muted overflow-hidden">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 flex flex-col gap-2">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description || "No description"}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-sm font-mono ${canAfford(item) ? "text-emerald-500" : "text-destructive"}`}>
                      {item.price.toLocaleString()} PX
                    </span>
                    <div className={`size-2.5 rounded-full ${canAfford(item) ? "bg-emerald-500" : "bg-destructive"}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="sm:max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                {selectedItem.limited && selectedItem.limited_until && (
                  <DialogDescription>Limited item</DialogDescription>
                )}
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {selectedItem.image_url && (
                  <div className="h-48 rounded-lg bg-muted/50 overflow-hidden">
                    <img src={selectedItem.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{selectedItem.description || "No description"}</p>

                {selectedItem.unlock_xp > 0 ? (
                  <div className="flex flex-col gap-3">
                    <Badge variant={
                      trophyState(selectedItem) === "claimed" ? "success" :
                      trophyState(selectedItem) === "claimable" ? "warning" : "outline"
                    } className="self-start">
                      {trophyState(selectedItem) === "claimed" ? "Claimed" :
                       trophyState(selectedItem) === "claimable" ? "Ready to claim!" :
                       `Level ${selectedItem.unlock_xp} Trophy`}
                    </Badge>
                    {trophyState(selectedItem) === "claimable" && (
                      <Button onClick={() => claimTrophy(selectedItem.id)}>Claim Trophy</Button>
                    )}
                    {trophyState(selectedItem) === "locked" && (
                      <p className="text-xs text-muted-foreground">
                        Reach level {selectedItem.unlock_xp} to unlock this trophy
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold">
                        {selectedItem.price.toLocaleString()} PX
                      </span>
                      <Badge variant={canAfford(selectedItem) ? "success" : "destructive"}>
                        {canAfford(selectedItem) ? "Can afford" : "Keep shipping!"}
                      </Badge>
                    </div>

                    {parseOptions(selectedItem).length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">Options</p>
                        <div className="flex flex-wrap gap-2">
                          {parseOptions(selectedItem).map((g, gi) => (
                            <div key={gi} className="flex flex-col gap-1">
                              {g.name && <span className="text-xs text-muted-foreground">{g.name}</span>}
                              <div className="flex flex-wrap gap-1">
                                {g.choices.map((c) => (
                                  <Badge
                                    key={c}
                                    variant={(optionPick[gi] ?? g.choices[0]) === c ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setOptionPick({ ...optionPick, [gi]: c })}
                                  >
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      disabled={!canAfford(selectedItem) || buying}
                      onClick={handleBuy}
                    >
                      {buying ? "Buying..." : "Buy"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
