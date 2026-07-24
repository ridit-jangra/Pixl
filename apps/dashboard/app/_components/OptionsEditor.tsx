"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseOptionGroups } from "@/lib/shopOptions";

type Row = { name: string; choices: string };

// Dynamic editor for shop-item option groups. Serializes to a hidden field as
// JSON ([{ name, choices: [] }]); the server (readOptions) encodes it back into
// the stored string[] format.
export function OptionsEditor({
  name = "options",
  initial = [],
}: {
  name?: string;
  initial?: string[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    parseOptionGroups(initial).map((g) => ({ name: g.name, choices: g.choices.join(", ") })),
  );

  const serialized = JSON.stringify(
    rows
      .map((r) => ({
        name: r.name.trim(),
        choices: r.choices
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((g) => g.choices.length > 0),
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => setRows((rs) => [...rs, { name: "", choices: "" }]);
  const remove = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={serialized} />
      {rows.length === 0 && (
        <div className="text-xs text-muted-foreground">
          No options yet. Add a group like “Color”, “Storage” or “RAM”.
        </div>
      )}
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            placeholder="Group (e.g. Color)"
            value={r.name}
            onChange={(e) => update(i, { name: e.target.value })}
            maxLength={40}
            className="w-40 text-sm"
          />
          <Input
            placeholder="Choices, comma-separated (e.g. 256GB, 512GB, 1TB)"
            value={r.choices}
            onChange={(e) => update(i, { choices: e.target.value })}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(i)}
            aria-label="Remove option group"
            className="shrink-0 text-muted-foreground hover:text-rose-600"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        + Add option group
      </Button>
    </div>
  );
}
