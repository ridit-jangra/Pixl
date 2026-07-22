"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);

    return () => {
      lenis.destroy();
      ro.disconnect();
    };
  }, []);

  return <>{children}</>;
}
