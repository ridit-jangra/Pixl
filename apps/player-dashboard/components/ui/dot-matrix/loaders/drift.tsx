import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.drift-l{opacity:0;animation:drift-k calc(3200ms / var(--speed, 1)) cubic-bezier(0.4, 0, 0.6, 1) infinite both;}
@keyframes drift-k{0%,100%{opacity:0.06}20%{opacity:0.3}40%{opacity:0.95}60%{opacity:0.3}80%{opacity:0.06}}
@media (prefers-reduced-motion:reduce){.drift-l{animation:none;opacity:0.5}}
.drift-d01{animation-delay:calc(240ms / var(--speed, 1))}
.drift-d02{animation-delay:calc(480ms / var(--speed, 1))}
.drift-d03{animation-delay:calc(720ms / var(--speed, 1))}
.drift-d04{animation-delay:calc(960ms / var(--speed, 1))}
.drift-d10{animation-delay:calc(240ms / var(--speed, 1))}
.drift-d11{animation-delay:calc(480ms / var(--speed, 1))}
.drift-d12{animation-delay:calc(720ms / var(--speed, 1))}
.drift-d13{animation-delay:calc(960ms / var(--speed, 1))}
.drift-d14{animation-delay:calc(1200ms / var(--speed, 1))}
.drift-d20{animation-delay:calc(480ms / var(--speed, 1))}
.drift-d21{animation-delay:calc(720ms / var(--speed, 1))}
.drift-d22{animation-delay:calc(960ms / var(--speed, 1))}
.drift-d23{animation-delay:calc(1200ms / var(--speed, 1))}
.drift-d24{animation-delay:calc(1440ms / var(--speed, 1))}
.drift-d30{animation-delay:calc(720ms / var(--speed, 1))}
.drift-d31{animation-delay:calc(960ms / var(--speed, 1))}
.drift-d32{animation-delay:calc(1200ms / var(--speed, 1))}
.drift-d33{animation-delay:calc(1440ms / var(--speed, 1))}
.drift-d34{animation-delay:calc(1680ms / var(--speed, 1))}
.drift-d40{animation-delay:calc(960ms / var(--speed, 1))}
.drift-d41{animation-delay:calc(1200ms / var(--speed, 1))}
.drift-d42{animation-delay:calc(1440ms / var(--speed, 1))}
.drift-d43{animation-delay:calc(1680ms / var(--speed, 1))}
.drift-d44{animation-delay:calc(1920ms / var(--speed, 1))}`;

export function Drift({
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
      aria-label={ariaLabel ?? "Drift"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Drift</title>
      <desc>A soft wave drifts along the diagonal.</desc>
      <defs>
        <circle id="drift-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#drift-dot" className="drift-l" x="6" y="6" />
      <use href="#drift-dot" className="drift-l drift-d01" x="17" y="6" />
      <use href="#drift-dot" className="drift-l drift-d02" x="28" y="6" />
      <use href="#drift-dot" className="drift-l drift-d03" x="39" y="6" />
      <use href="#drift-dot" className="drift-l drift-d04" x="50" y="6" />
      <use href="#drift-dot" className="drift-l drift-d10" x="6" y="17" />
      <use href="#drift-dot" className="drift-l drift-d11" x="17" y="17" />
      <use href="#drift-dot" className="drift-l drift-d12" x="28" y="17" />
      <use href="#drift-dot" className="drift-l drift-d13" x="39" y="17" />
      <use href="#drift-dot" className="drift-l drift-d14" x="50" y="17" />
      <use href="#drift-dot" className="drift-l drift-d20" x="6" y="28" />
      <use href="#drift-dot" className="drift-l drift-d21" x="17" y="28" />
      <use href="#drift-dot" className="drift-l drift-d22" x="28" y="28" />
      <use href="#drift-dot" className="drift-l drift-d23" x="39" y="28" />
      <use href="#drift-dot" className="drift-l drift-d24" x="50" y="28" />
      <use href="#drift-dot" className="drift-l drift-d30" x="6" y="39" />
      <use href="#drift-dot" className="drift-l drift-d31" x="17" y="39" />
      <use href="#drift-dot" className="drift-l drift-d32" x="28" y="39" />
      <use href="#drift-dot" className="drift-l drift-d33" x="39" y="39" />
      <use href="#drift-dot" className="drift-l drift-d34" x="50" y="39" />
      <use href="#drift-dot" className="drift-l drift-d40" x="6" y="50" />
      <use href="#drift-dot" className="drift-l drift-d41" x="17" y="50" />
      <use href="#drift-dot" className="drift-l drift-d42" x="28" y="50" />
      <use href="#drift-dot" className="drift-l drift-d43" x="39" y="50" />
      <use href="#drift-dot" className="drift-l drift-d44" x="50" y="50" />
    </svg>
  );
}
