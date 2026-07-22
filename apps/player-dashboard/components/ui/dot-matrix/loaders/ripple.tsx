import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.ripple-l{opacity:0;animation:ripple-k calc(2400ms / var(--speed, 1)) ease-out infinite both;}
@keyframes ripple-k{0%,80%,100%{opacity:0.1}10%,25%{opacity:1}45%{opacity:0.1}}
@media (prefers-reduced-motion:reduce){.ripple-l{animation:none;opacity:0.5}}
.ripple-d00{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d01{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d02{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d03{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d04{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d10{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d11{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d12{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d13{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d14{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d20{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d21{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d23{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d24{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d30{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d31{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d32{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d33{animation-delay:calc(400ms / var(--speed, 1))}
.ripple-d34{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d40{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d41{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d42{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d43{animation-delay:calc(800ms / var(--speed, 1))}
.ripple-d44{animation-delay:calc(800ms / var(--speed, 1))}`;

export function Ripple({
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
      aria-label={ariaLabel ?? "Ripple"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Ripple</title>
      <desc>Rings ripple outward from the center.</desc>
      <defs>
        <circle id="ripple-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#ripple-dot" className="ripple-l ripple-d00" x="6" y="6" />
      <use href="#ripple-dot" className="ripple-l ripple-d01" x="17" y="6" />
      <use href="#ripple-dot" className="ripple-l ripple-d02" x="28" y="6" />
      <use href="#ripple-dot" className="ripple-l ripple-d03" x="39" y="6" />
      <use href="#ripple-dot" className="ripple-l ripple-d04" x="50" y="6" />
      <use href="#ripple-dot" className="ripple-l ripple-d10" x="6" y="17" />
      <use href="#ripple-dot" className="ripple-l ripple-d11" x="17" y="17" />
      <use href="#ripple-dot" className="ripple-l ripple-d12" x="28" y="17" />
      <use href="#ripple-dot" className="ripple-l ripple-d13" x="39" y="17" />
      <use href="#ripple-dot" className="ripple-l ripple-d14" x="50" y="17" />
      <use href="#ripple-dot" className="ripple-l ripple-d20" x="6" y="28" />
      <use href="#ripple-dot" className="ripple-l ripple-d21" x="17" y="28" />
      <use href="#ripple-dot" className="ripple-l" x="28" y="28" />
      <use href="#ripple-dot" className="ripple-l ripple-d23" x="39" y="28" />
      <use href="#ripple-dot" className="ripple-l ripple-d24" x="50" y="28" />
      <use href="#ripple-dot" className="ripple-l ripple-d30" x="6" y="39" />
      <use href="#ripple-dot" className="ripple-l ripple-d31" x="17" y="39" />
      <use href="#ripple-dot" className="ripple-l ripple-d32" x="28" y="39" />
      <use href="#ripple-dot" className="ripple-l ripple-d33" x="39" y="39" />
      <use href="#ripple-dot" className="ripple-l ripple-d34" x="50" y="39" />
      <use href="#ripple-dot" className="ripple-l ripple-d40" x="6" y="50" />
      <use href="#ripple-dot" className="ripple-l ripple-d41" x="17" y="50" />
      <use href="#ripple-dot" className="ripple-l ripple-d42" x="28" y="50" />
      <use href="#ripple-dot" className="ripple-l ripple-d43" x="39" y="50" />
      <use href="#ripple-dot" className="ripple-l ripple-d44" x="50" y="50" />
    </svg>
  );
}
