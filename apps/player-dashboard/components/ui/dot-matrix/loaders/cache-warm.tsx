import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.cache-warm-l{opacity:0;animation:cache-warm-k calc(2600ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes cache-warm-k{0%,4%{opacity:0.16}16%{opacity:1}78%{opacity:1}88%{opacity:0.16}100%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.cache-warm-l{animation:none;opacity:0.5}}
.cache-warm-d01{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d02{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d03{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d10{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d11{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d12{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d13{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d14{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d20{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d21{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d22{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d23{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d24{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d30{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d31{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d32{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d33{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d34{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d41{animation-delay:calc(280ms / var(--speed, 1))}
.cache-warm-d42{animation-delay:calc(560ms / var(--speed, 1))}
.cache-warm-d43{animation-delay:calc(280ms / var(--speed, 1))}`;

export function CacheWarm({
  size = 24,
  speed,
  color,
  className,
  "aria-label": ariaLabel,
}: LoaderProps = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      width={size}
      height={size}
      role="img"
      data-slot="icon"
      aria-label={ariaLabel ?? "Cache Warm"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Cache Warm</title>
      <desc>Warmth spreads from the corners inward.</desc>
      <defs>
        <circle id="cache-warm-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#cache-warm-dot" className="cache-warm-l" x="6" y="6" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d01" x="17" y="6" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d02" x="28" y="6" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d03" x="39" y="6" />
      <use href="#cache-warm-dot" className="cache-warm-l" x="50" y="6" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d10" x="6" y="17" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d11" x="17" y="17" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d12" x="28" y="17" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d13" x="39" y="17" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d14" x="50" y="17" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d20" x="6" y="28" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d21" x="17" y="28" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d22" x="28" y="28" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d23" x="39" y="28" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d24" x="50" y="28" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d30" x="6" y="39" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d31" x="17" y="39" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d32" x="28" y="39" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d33" x="39" y="39" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d34" x="50" y="39" />
      <use href="#cache-warm-dot" className="cache-warm-l" x="6" y="50" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d41" x="17" y="50" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d42" x="28" y="50" />
      <use href="#cache-warm-dot" className="cache-warm-l cache-warm-d43" x="39" y="50" />
      <use href="#cache-warm-dot" className="cache-warm-l" x="50" y="50" />
    </svg>
  );
}
