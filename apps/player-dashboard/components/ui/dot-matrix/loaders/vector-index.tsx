import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.vector-index-l{opacity:0;animation:vector-index-k calc(2400ms / var(--speed, 1)) linear infinite both;}
@keyframes vector-index-k{0%,100%{opacity:0.16}8%{opacity:1}20%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.vector-index-l{animation:none;opacity:0.5}}
.vector-index-d01{animation-delay:calc(220ms / var(--speed, 1))}
.vector-index-d02{animation-delay:calc(440ms / var(--speed, 1))}
.vector-index-d03{animation-delay:calc(660ms / var(--speed, 1))}
.vector-index-d04{animation-delay:calc(880ms / var(--speed, 1))}
.vector-index-d10{animation-delay:calc(220ms / var(--speed, 1))}
.vector-index-d11{animation-delay:calc(440ms / var(--speed, 1))}
.vector-index-d12{animation-delay:calc(660ms / var(--speed, 1))}
.vector-index-d13{animation-delay:calc(880ms / var(--speed, 1))}
.vector-index-d14{animation-delay:calc(1100ms / var(--speed, 1))}
.vector-index-d20{animation-delay:calc(440ms / var(--speed, 1))}
.vector-index-d21{animation-delay:calc(660ms / var(--speed, 1))}
.vector-index-d22{animation-delay:calc(880ms / var(--speed, 1))}
.vector-index-d23{animation-delay:calc(1100ms / var(--speed, 1))}
.vector-index-d24{animation-delay:calc(1320ms / var(--speed, 1))}
.vector-index-d30{animation-delay:calc(660ms / var(--speed, 1))}
.vector-index-d31{animation-delay:calc(880ms / var(--speed, 1))}
.vector-index-d32{animation-delay:calc(1100ms / var(--speed, 1))}
.vector-index-d33{animation-delay:calc(1320ms / var(--speed, 1))}
.vector-index-d34{animation-delay:calc(1540ms / var(--speed, 1))}
.vector-index-d40{animation-delay:calc(880ms / var(--speed, 1))}
.vector-index-d41{animation-delay:calc(1100ms / var(--speed, 1))}
.vector-index-d42{animation-delay:calc(1320ms / var(--speed, 1))}
.vector-index-d43{animation-delay:calc(1540ms / var(--speed, 1))}
.vector-index-d44{animation-delay:calc(1760ms / var(--speed, 1))}`;

export function VectorIndex({
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
      aria-label={ariaLabel ?? "Vector Index"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Vector Index</title>
      <desc>Diagonals index across the grid.</desc>
      <defs>
        <circle id="vector-index-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#vector-index-dot" className="vector-index-l" x="6" y="6" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d01" x="17" y="6" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d02" x="28" y="6" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d03" x="39" y="6" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d04" x="50" y="6" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d10" x="6" y="17" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d11" x="17" y="17" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d12" x="28" y="17" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d13" x="39" y="17" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d14" x="50" y="17" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d20" x="6" y="28" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d21" x="17" y="28" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d22" x="28" y="28" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d23" x="39" y="28" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d24" x="50" y="28" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d30" x="6" y="39" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d31" x="17" y="39" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d32" x="28" y="39" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d33" x="39" y="39" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d34" x="50" y="39" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d40" x="6" y="50" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d41" x="17" y="50" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d42" x="28" y="50" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d43" x="39" y="50" />
      <use href="#vector-index-dot" className="vector-index-l vector-index-d44" x="50" y="50" />
    </svg>
  );
}
