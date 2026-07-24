"use client";

import { useState } from "react";
import { PendingButton } from "@/app/_components/PendingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectCls =
  "w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs";

interface ShopItemLite {
  id: number;
  name: string;
  active: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="block font-normal">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </Label>
  );
}

export function CreateEventForm({
  action,
  types,
  shopItems,
}: {
  action: (fd: FormData) => void;
  types: Record<string, string>;
  shopItems: ShopItemLite[];
}) {
  const keys = Object.keys(types);
  const [type, setType] = useState(keys[0]);

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Event type">
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            {keys.map((k) => (
              <option key={k} value={k}>
                {types[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name (players see this)">
          <Input name="name" required maxLength={100} placeholder="Double Streak Weekend" className="text-sm" />
        </Field>
        <Field label="Starts (UTC , blank = now)">
          <Input name="startsAt" type="datetime-local" className="text-sm" />
        </Field>
        <Field label="Ends (UTC)">
          <Input name="endsAt" type="datetime-local" required className="text-sm" />
        </Field>
      </div>

      {/* only the settings this event type actually uses */}
      {type === "bounty" && (
        <div className="rounded-lg border border-border p-4 grid sm:grid-cols-2 gap-4">
          <Field label="Reward (px per project)">
            <Input name="reward" type="number" min={0} max={500} placeholder="50" className="text-sm" />
          </Field>
          <Field label="What to build">
            <Input name="description" maxLength={500} placeholder="ship something multiplayer" className="text-sm" />
          </Field>
        </div>
      )}

      {type === "community_goal" && (
        <div className="rounded-lg border border-border p-4 grid sm:grid-cols-2 gap-4">
          <Field label="Ships target">
            <Input name="target" type="number" min={0} placeholder="25" className="text-sm" />
          </Field>
          <Field label="Bonus % for every shipper">
            <Input name="bonusPct" type="number" min={0} max={50} placeholder="10" className="text-sm" />
          </Field>
        </div>
      )}

      {type === "review_blitz" && (
        <div className="rounded-lg border border-border p-4 sm:max-w-xs">
          <Field label="Reviewer payout multiplier">
            <Input name="mult" type="number" step="0.1" min={1} max={3} placeholder="1.5" className="text-sm" />
          </Field>
        </div>
      )}

      {type === "mystery_merchant" && (
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm font-medium mb-1">Items to reveal while the event runs</div>
          <p className="text-xs text-muted-foreground mb-3">
            Keep these inactive in the shop , they only appear during the event.
          </p>
          {shopItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No shop items yet.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto grid sm:grid-cols-2 gap-2 pr-1">
              {shopItems.map((i) => (
                <label
                  key={i.id}
                  className={`flex items-center gap-2 text-sm rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted/40 ${
                    i.active ? "opacity-60" : ""
                  }`}
                >
                  <input type="checkbox" name="itemIds" value={String(i.id)} className="accent-brand" />
                  <span className="truncate">{i.name}</span>
                  {i.active && <span className="text-xs text-muted-foreground shrink-0">(active anyway)</span>}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {type === "leaderboard_sprint" && (
        <p className="text-sm text-muted-foreground rounded-lg border border-border p-4">
          No extra settings , this just runs a window-only leaderboard in the in-game explore menu.
        </p>
      )}

      <PendingButton className="bg-brand text-white border-transparent" pendingText="Creating…">
        Create event
      </PendingButton>
    </form>
  );
}
