"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Polls the pending-review count and refreshes the queue in place when it
// changes, so newly shipped projects appear without a manual reload.
export function LiveReview() {
  const router = useRouter();
  const baseline = useRef<number | null>(null);
  const [live, setLive] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch("/api/review/pending", { cache: "no-store" });
        if (res.ok) {
          const { count } = (await res.json()) as { count: number };
          setLive(true);
          if (baseline.current === null) {
            baseline.current = count;
          } else if (count !== baseline.current) {
            baseline.current = count;
            setFlash(true);
            setTimeout(() => setFlash(false), 1500);
            router.refresh();
          }
        } else {
          setLive(false);
        }
      } catch {
        setLive(false);
      }
      if (!stopped) timer = setTimeout(tick, 12000);
    };

    timer = setTimeout(tick, 12000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        live ? "text-hc-green" : "text-ink/40"
      }`}
      title={live ? "The queue updates automatically" : "Live updates paused"}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          live ? "bg-hc-green" : "bg-ink/30"
        } ${flash ? "animate-ping" : live ? "animate-pulse" : ""}`}
      />
      {flash ? "Updating…" : live ? "Live" : "Paused"}
    </span>
  );
}
