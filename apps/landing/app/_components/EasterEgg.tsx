"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";

// Hidden easter egg: enter the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) anywhere on
// the site to pop the LingoJam "Pixlify" text-to-pixl-emoji converter.
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function EasterEgg() {
  const { dict } = useLocale();
  const t = dict.easterEgg;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let progress = 0;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      const expected = SEQUENCE[progress];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        progress += 1;
        if (progress === SEQUENCE.length) {
          progress = 0;
          setOpen(true);
        }
      } else {
        // Restart, but allow the wrong key to be a fresh first key.
        progress = key === SEQUENCE[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.dialogLabel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold tracking-widest text-amber-300">
            ✨ {t.title}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="rounded px-2 py-0.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>
        <iframe
          src="https://lingojam.com/embed/Pixlify"
          title={t.dialogLabel}
          className="h-[300px] w-full rounded-md border-0 bg-white"
        />
        <p className="mt-2 text-center text-xs text-neutral-500">{t.hint}</p>
      </div>
    </div>
  );
}
