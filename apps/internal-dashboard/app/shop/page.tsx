import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guard";
import { listShopItems } from "@/lib/db";
import { addShopItem, toggleShopItem, deleteShopItem, updateShopItem } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Disclosure } from "@/app/_components/Disclosure";
import { OptionsEditor } from "@/app/_components/OptionsEditor";
import { AddShopItemForm } from "@/app/_components/AddShopItemForm";
import { parseOptionGroups } from "@/lib/shopOptions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

const PER = 8;

const FILE_INPUT =
  "block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const allItems = await listShopItems();
  const { page } = await searchParams;
  const pages = Math.max(1, Math.ceil(allItems.length / PER));
  const cur = Math.min(Math.max(parseInt(page ?? "1", 10) || 1, 1), pages);
  const start = (cur - 1) * PER;
  const items = allItems.slice(start, start + PER);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Shop</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Items shown in the in-game Pixl shop. Purchases aren&apos;t enabled yet , players can
          only browse, so feel free to stock the shelves.
        </p>
      </div>

      <Card className="p-5 md:p-6 gap-0">
        <div className="text-base font-semibold mb-4">Add an item</div>
        <AddShopItemForm action={addShopItem} />
      </Card>

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-3">
          {allItems.length} item{allItems.length === 1 ? "" : "s"} · only active ones show in game
        </div>
        {allItems.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Empty shelves. Add the first item above.
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id} className={`p-4 gap-4 flex-row ${item.active ? "" : "opacity-60"}`}>
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-border shrink-0 [image-rendering:pixelated]"
                  />
                ) : (
                  <span className="grid place-items-center w-20 h-20 rounded-lg bg-muted border border-border shrink-0 text-2xl">
                    🛍️
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{item.name}</span>
                    <Badge variant="success" className="tabular-nums">
                      {item.price} px
                    </Badge>
                    {!item.active && <Badge variant="secondary">hidden</Badge>}
                  </div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                  )}
                  {item.options.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {parseOptionGroups(item.options).map((g, gi) => (
                        <div key={gi} className="flex items-center gap-1.5 flex-wrap">
                          {g.name && (
                            <span className="text-xs font-medium text-muted-foreground">{g.name}:</span>
                          )}
                          {g.choices.map((c) => (
                            <Badge key={c} variant="secondary">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <form action={toggleShopItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="active" value={item.active ? "0" : "1"} />
                      <PendingButton
                        variant="outline"
                        size="sm"
                        pendingText={item.active ? "Hiding…" : "Showing…"}
                      >
                        {item.active ? "Hide" : "Show"}
                      </PendingButton>
                    </form>
                    <form action={deleteShopItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <PendingButton
                        variant="outline"
                        size="sm"
                        pendingText="Deleting…"
                        confirm={`Delete "${item.name}" from the shop? This can't be undone.`}
                        className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        Delete
                      </PendingButton>
                    </form>
                  </div>
                  <Disclosure summary="Edit item" className="mt-3">
                    <form action={updateShopItem} className="space-y-3">
                      <input type="hidden" name="id" value={item.id} />
                      <div className="grid grid-cols-[1fr_6.5rem] gap-3">
                        <Label className="block font-normal">
                          <span className="block text-xs font-medium text-muted-foreground mb-1">Name</span>
                          <Input
                            name="name"
                            required
                            maxLength={60}
                            defaultValue={item.name}
                            className="w-full text-sm"
                          />
                        </Label>
                        <Label className="block font-normal">
                          <span className="block text-xs font-medium text-muted-foreground mb-1">Price (px)</span>
                          <Input
                            name="price"
                            type="number"
                            min={0}
                            required
                            defaultValue={item.price}
                            className="w-full text-sm"
                          />
                        </Label>
                      </div>
                      <Label className="block font-normal">
                        <span className="block text-xs font-medium text-muted-foreground mb-1">Description</span>
                        <Input
                          name="description"
                          maxLength={300}
                          defaultValue={item.description}
                          className="w-full text-sm"
                        />
                      </Label>
                      <div className="block">
                        <span className="block text-xs font-medium text-muted-foreground mb-1">Options</span>
                        <OptionsEditor name="options" initial={item.options} />
                      </div>
                      <Label className="block font-normal">
                        <span className="block text-xs font-medium text-muted-foreground mb-1">
                          Replace image (optional , leave empty to keep the current one)
                        </span>
                        <input
                          name="image"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className={FILE_INPUT}
                        />
                      </Label>
                      <PendingButton
                        className="bg-brand text-white border-transparent"
                        pendingText="Saving…"
                      >
                        Save changes
                      </PendingButton>
                    </form>
                  </Disclosure>
                </div>
              </Card>
            ))}
          </div>
        )}

        {allItems.length > PER && (
          <div className="flex items-center justify-between gap-3 mt-4 text-sm">
            <span className="text-muted-foreground">
              Showing {start + 1}–{Math.min(start + PER, allItems.length)} of {allItems.length}
            </span>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href={`/shop?page=${cur - 1}`}
                    aria-label="Previous page"
                    className={cur <= 1 ? "pointer-events-none opacity-40" : ""}
                  >
                    ←
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-muted-foreground tabular-nums">
                    {cur} / {pages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href={`/shop?page=${cur + 1}`}
                    aria-label="Next page"
                    className={cur >= pages ? "pointer-events-none opacity-40" : ""}
                  >
                    →
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
