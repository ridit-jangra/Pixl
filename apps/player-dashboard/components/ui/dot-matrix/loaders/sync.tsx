import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.sync-l{opacity:0;animation:sync-k calc(1600ms / var(--speed, 1)) cubic-bezier(0.215, 0.61, 0.355, 1) infinite both;}
@keyframes sync-k{0%,100%{opacity:0.16}20%{opacity:1}45%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.sync-l{animation:none;opacity:0.5}}
.sync-d00{animation-delay:calc(1400ms / var(--speed, 1))}
.sync-d04{animation-delay:calc(200ms / var(--speed, 1))}
.sync-d40{animation-delay:calc(1000ms / var(--speed, 1))}
.sync-d44{animation-delay:calc(600ms / var(--speed, 1))}`;

export function Sync({
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
      aria-label={ariaLabel ?? "Sync"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Sync</title>
      <desc>The four corners flash in rotation.</desc>
      <defs>
        <circle id="sync-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#sync-dot" className="sync-l sync-d00" x="6" y="6" />
      <use href="#sync-dot" x="17" y="6" opacity="0.05" />
      <use href="#sync-dot" x="28" y="6" opacity="0.05" />
      <use href="#sync-dot" x="39" y="6" opacity="0.05" />
      <use href="#sync-dot" className="sync-l sync-d04" x="50" y="6" />
      <use href="#sync-dot" x="6" y="17" opacity="0.05" />
      <use href="#sync-dot" x="17" y="17" opacity="0.05" />
      <use href="#sync-dot" x="28" y="17" opacity="0.05" />
      <use href="#sync-dot" x="39" y="17" opacity="0.05" />
      <use href="#sync-dot" x="50" y="17" opacity="0.05" />
      <use href="#sync-dot" x="6" y="28" opacity="0.05" />
      <use href="#sync-dot" x="17" y="28" opacity="0.05" />
      <use href="#sync-dot" x="28" y="28" opacity="0.05" />
      <use href="#sync-dot" x="39" y="28" opacity="0.05" />
      <use href="#sync-dot" x="50" y="28" opacity="0.05" />
      <use href="#sync-dot" x="6" y="39" opacity="0.05" />
      <use href="#sync-dot" x="17" y="39" opacity="0.05" />
      <use href="#sync-dot" x="28" y="39" opacity="0.05" />
      <use href="#sync-dot" x="39" y="39" opacity="0.05" />
      <use href="#sync-dot" x="50" y="39" opacity="0.05" />
      <use href="#sync-dot" className="sync-l sync-d40" x="6" y="50" />
      <use href="#sync-dot" x="17" y="50" opacity="0.05" />
      <use href="#sync-dot" x="28" y="50" opacity="0.05" />
      <use href="#sync-dot" x="39" y="50" opacity="0.05" />
      <use href="#sync-dot" className="sync-l sync-d44" x="50" y="50" />
    </svg>
  );
}
