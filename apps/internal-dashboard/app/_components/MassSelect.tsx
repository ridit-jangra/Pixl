"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function SelectAllBox() {
  return (
    <Checkbox
      aria-label="Select all on this page"
      onCheckedChange={(checked) => {
        for (const el of document.querySelectorAll<HTMLElement>("[data-row-select]")) {
          const isChecked = el.getAttribute("aria-checked") === "true";
          if (isChecked !== Boolean(checked)) el.click();
        }
      }}
    />
  );
}

export function RowSelect({ id, label }: { id: string; label: string }) {
  return (
    <Checkbox
      name="userIds"
      value={id}
      aria-label={label}
      data-row-select
    />
  );
}
