import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.helix-l{opacity:0;animation:helix-k calc(2600ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes helix-k{0%,100%{opacity:0.1}30%{opacity:0.95}50%{opacity:0.3}80%{opacity:0.95}}
@media (prefers-reduced-motion:reduce){.helix-l{animation:none;opacity:0.5}}
.helix-d00{animation-delay:calc(-2275ms / var(--speed, 1))}
.helix-d01{animation-delay:calc(-2408ms / var(--speed, 1))}
.helix-d03{animation-delay:calc(-192ms / var(--speed, 1))}
.helix-d04{animation-delay:calc(-325ms / var(--speed, 1))}
.helix-d10{animation-delay:calc(-2142ms / var(--speed, 1))}
.helix-d11{animation-delay:calc(-2275ms / var(--speed, 1))}
.helix-d13{animation-delay:calc(-325ms / var(--speed, 1))}
.helix-d14{animation-delay:calc(-458ms / var(--speed, 1))}
.helix-d20{animation-delay:calc(-1950ms / var(--speed, 1))}
.helix-d21{animation-delay:calc(-1950ms / var(--speed, 1))}
.helix-d22{animation-delay:calc(-650ms / var(--speed, 1))}
.helix-d23{animation-delay:calc(-650ms / var(--speed, 1))}
.helix-d24{animation-delay:calc(-650ms / var(--speed, 1))}
.helix-d30{animation-delay:calc(-1758ms / var(--speed, 1))}
.helix-d31{animation-delay:calc(-1625ms / var(--speed, 1))}
.helix-d32{animation-delay:calc(-1300ms / var(--speed, 1))}
.helix-d33{animation-delay:calc(-975ms / var(--speed, 1))}
.helix-d34{animation-delay:calc(-842ms / var(--speed, 1))}
.helix-d40{animation-delay:calc(-1625ms / var(--speed, 1))}
.helix-d41{animation-delay:calc(-1492ms / var(--speed, 1))}
.helix-d42{animation-delay:calc(-1300ms / var(--speed, 1))}
.helix-d43{animation-delay:calc(-1108ms / var(--speed, 1))}
.helix-d44{animation-delay:calc(-975ms / var(--speed, 1))}`;

export function Helix({
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
      aria-label={ariaLabel ?? "Helix"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Helix</title>
      <desc>Brightness winds around like a strand.</desc>
      <defs>
        <circle id="helix-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#helix-dot" className="helix-l helix-d00" x="6" y="6" />
      <use href="#helix-dot" className="helix-l helix-d01" x="17" y="6" />
      <use href="#helix-dot" className="helix-l" x="28" y="6" />
      <use href="#helix-dot" className="helix-l helix-d03" x="39" y="6" />
      <use href="#helix-dot" className="helix-l helix-d04" x="50" y="6" />
      <use href="#helix-dot" className="helix-l helix-d10" x="6" y="17" />
      <use href="#helix-dot" className="helix-l helix-d11" x="17" y="17" />
      <use href="#helix-dot" className="helix-l" x="28" y="17" />
      <use href="#helix-dot" className="helix-l helix-d13" x="39" y="17" />
      <use href="#helix-dot" className="helix-l helix-d14" x="50" y="17" />
      <use href="#helix-dot" className="helix-l helix-d20" x="6" y="28" />
      <use href="#helix-dot" className="helix-l helix-d21" x="17" y="28" />
      <use href="#helix-dot" className="helix-l helix-d22" x="28" y="28" />
      <use href="#helix-dot" className="helix-l helix-d23" x="39" y="28" />
      <use href="#helix-dot" className="helix-l helix-d24" x="50" y="28" />
      <use href="#helix-dot" className="helix-l helix-d30" x="6" y="39" />
      <use href="#helix-dot" className="helix-l helix-d31" x="17" y="39" />
      <use href="#helix-dot" className="helix-l helix-d32" x="28" y="39" />
      <use href="#helix-dot" className="helix-l helix-d33" x="39" y="39" />
      <use href="#helix-dot" className="helix-l helix-d34" x="50" y="39" />
      <use href="#helix-dot" className="helix-l helix-d40" x="6" y="50" />
      <use href="#helix-dot" className="helix-l helix-d41" x="17" y="50" />
      <use href="#helix-dot" className="helix-l helix-d42" x="28" y="50" />
      <use href="#helix-dot" className="helix-l helix-d43" x="39" y="50" />
      <use href="#helix-dot" className="helix-l helix-d44" x="50" y="50" />
    </svg>
  );
}
