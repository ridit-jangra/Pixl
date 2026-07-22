"use client";

import { useEffect, useState } from "react";
import { setDeduction, getDeduction, subscribeDeductions } from "./deflateStore";
import { Input } from "@/components/ui/input";

// Compact "deduct N minutes" control shown on a commit or journal row. Feeds the
// shared store, which the review form reads to lower the credited hours. Stays in
// sync with the store so a saved draft (localStorage) shows up when it loads.
export function DeflateInput({ itemKey, maxMinutes }: { itemKey: string; maxMinutes?: number }) {
  const [min, setMin] = useState(() => getDeduction(itemKey));

  useEffect(() => {
    const sync = () => setMin(getDeduction(itemKey));
    sync();
    return subscribeDeductions(sync);
  }, [itemKey]);

  return (
    <label
      className={`flex items-center gap-1 shrink-0 text-xs ${min > 0 ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground"}`}
      title="Deduct this many minutes from the credited hours"
      onClick={(e) => e.stopPropagation()}
    >
      −
      <Input
        type="number"
        min="0"
        max={maxMinutes}
        step="5"
        value={min || ""}
        placeholder="0"
        onChange={(e) => {
          let v = Math.max(0, Math.round(Number(e.target.value) || 0));
          if (maxMinutes !== undefined) v = Math.min(v, maxMinutes);
          setMin(v);
          setDeduction(itemKey, v);
        }}
        className="w-20 h-9 text-sm px-2.5"
      />
      min
    </label>
  );
}
