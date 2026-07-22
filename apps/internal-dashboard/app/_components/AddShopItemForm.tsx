"use client";

import { useState } from "react";
import { PendingButton } from "@/app/_components/PendingButton";
import { OptionsEditor } from "@/app/_components/OptionsEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FILE_INPUT =
  "block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80";

export function AddShopItemForm({ action }: { action: (fd: FormData) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setImage(f ? URL.createObjectURL(f) : null);
  }

  return (
    <form action={action} className="grid lg:grid-cols-[1fr_15rem] gap-6">
      <div className="space-y-5 min-w-0">
        <div className="grid sm:grid-cols-[1fr_9rem] gap-4">
          <Label className="block font-normal">
            <span className="block text-sm font-medium mb-1.5">Name</span>
            <Input
              name="name"
              required
              maxLength={60}
              placeholder="Holo Sticker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm"
            />
          </Label>
          <Label className="block font-normal">
            <span className="block text-sm font-medium mb-1.5">Price (px)</span>
            <Input
              name="price"
              type="number"
              min={0}
              required
              placeholder="60"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full text-sm"
            />
          </Label>
        </div>

        <Label className="block font-normal">
          <span className="block text-sm font-medium mb-1.5">Description</span>
          <Input
            name="description"
            maxLength={300}
            placeholder="Holographic, shimmery. Looks great on a laptop."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm"
          />
        </Label>

        <div className="block">
          <span className="block text-sm font-medium mb-1.5">Options</span>
          <OptionsEditor name="options" />
          <span className="block text-xs text-muted-foreground mt-1">
            Optional , groups like Color or Storage, each with comma-separated choices.
          </span>
        </div>

        <Label className="block font-normal">
          <span className="block text-sm font-medium mb-1.5">Image</span>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className={FILE_INPUT} />
          <span className="block text-xs text-muted-foreground mt-1">Optional , PNG/JPG/WebP, max 4 MB.</span>
        </Label>

        <div className="flex justify-start">
          <PendingButton
            className="bg-brand text-white border-transparent"
            pendingText="Adding… (uploading can take a few seconds)"
          >
            Add item
          </PendingButton>
        </div>
      </div>

      {/* live preview , what the card looks like in the shop */}
      <div className="lg:sticky lg:top-14 self-start">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Preview</div>
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="aspect-square rounded-lg border border-border bg-gradient-to-b from-muted/40 to-muted/10 flex items-center justify-center overflow-hidden mb-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="w-full h-full object-cover [image-rendering:pixelated]" />
            ) : (
              <span className="text-3xl opacity-50">🎁</span>
            )}
          </div>
          <div className="font-semibold text-sm truncate">{name || "Item name"}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 min-h-8 mt-0.5">
            {description || "Description shows up here."}
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 text-xs font-semibold tabular-nums">
              {price ? Number(price).toLocaleString() : "0"} px
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
