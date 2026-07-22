import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.beacon-l{opacity:0;animation:beacon-k calc(2400ms / var(--speed, 1)) linear infinite both;}
@keyframes beacon-k{0%,100%{opacity:0.04}6%{opacity:1}18%{opacity:0.04}}
@media (prefers-reduced-motion:reduce){.beacon-l{animation:none;opacity:0.5}}
.beacon-d00{animation-delay:calc(-2100ms / var(--speed, 1))}
.beacon-d01{animation-delay:calc(-2223ms / var(--speed, 1))}
.beacon-d03{animation-delay:calc(-177ms / var(--speed, 1))}
.beacon-d04{animation-delay:calc(-300ms / var(--speed, 1))}
.beacon-d10{animation-delay:calc(-1977ms / var(--speed, 1))}
.beacon-d11{animation-delay:calc(-2100ms / var(--speed, 1))}
.beacon-d13{animation-delay:calc(-300ms / var(--speed, 1))}
.beacon-d14{animation-delay:calc(-423ms / var(--speed, 1))}
.beacon-d20{animation-delay:calc(-1800ms / var(--speed, 1))}
.beacon-d21{animation-delay:calc(-1800ms / var(--speed, 1))}
.beacon-d22{animation-delay:calc(-600ms / var(--speed, 1))}
.beacon-d23{animation-delay:calc(-600ms / var(--speed, 1))}
.beacon-d24{animation-delay:calc(-600ms / var(--speed, 1))}
.beacon-d30{animation-delay:calc(-1623ms / var(--speed, 1))}
.beacon-d31{animation-delay:calc(-1500ms / var(--speed, 1))}
.beacon-d32{animation-delay:calc(-1200ms / var(--speed, 1))}
.beacon-d33{animation-delay:calc(-900ms / var(--speed, 1))}
.beacon-d34{animation-delay:calc(-777ms / var(--speed, 1))}
.beacon-d40{animation-delay:calc(-1500ms / var(--speed, 1))}
.beacon-d41{animation-delay:calc(-1377ms / var(--speed, 1))}
.beacon-d42{animation-delay:calc(-1200ms / var(--speed, 1))}
.beacon-d43{animation-delay:calc(-1023ms / var(--speed, 1))}
.beacon-d44{animation-delay:calc(-900ms / var(--speed, 1))}`;

export function Beacon({
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
      aria-label={ariaLabel ?? "Beacon"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Beacon</title>
      <desc>A bright pulse rotates around the grid.</desc>
      <defs>
        <circle id="beacon-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#beacon-dot" className="beacon-l beacon-d00" x="6" y="6" />
      <use href="#beacon-dot" className="beacon-l beacon-d01" x="17" y="6" />
      <use href="#beacon-dot" className="beacon-l" x="28" y="6" />
      <use href="#beacon-dot" className="beacon-l beacon-d03" x="39" y="6" />
      <use href="#beacon-dot" className="beacon-l beacon-d04" x="50" y="6" />
      <use href="#beacon-dot" className="beacon-l beacon-d10" x="6" y="17" />
      <use href="#beacon-dot" className="beacon-l beacon-d11" x="17" y="17" />
      <use href="#beacon-dot" className="beacon-l" x="28" y="17" />
      <use href="#beacon-dot" className="beacon-l beacon-d13" x="39" y="17" />
      <use href="#beacon-dot" className="beacon-l beacon-d14" x="50" y="17" />
      <use href="#beacon-dot" className="beacon-l beacon-d20" x="6" y="28" />
      <use href="#beacon-dot" className="beacon-l beacon-d21" x="17" y="28" />
      <use href="#beacon-dot" className="beacon-l beacon-d22" x="28" y="28" />
      <use href="#beacon-dot" className="beacon-l beacon-d23" x="39" y="28" />
      <use href="#beacon-dot" className="beacon-l beacon-d24" x="50" y="28" />
      <use href="#beacon-dot" className="beacon-l beacon-d30" x="6" y="39" />
      <use href="#beacon-dot" className="beacon-l beacon-d31" x="17" y="39" />
      <use href="#beacon-dot" className="beacon-l beacon-d32" x="28" y="39" />
      <use href="#beacon-dot" className="beacon-l beacon-d33" x="39" y="39" />
      <use href="#beacon-dot" className="beacon-l beacon-d34" x="50" y="39" />
      <use href="#beacon-dot" className="beacon-l beacon-d40" x="6" y="50" />
      <use href="#beacon-dot" className="beacon-l beacon-d41" x="17" y="50" />
      <use href="#beacon-dot" className="beacon-l beacon-d42" x="28" y="50" />
      <use href="#beacon-dot" className="beacon-l beacon-d43" x="39" y="50" />
      <use href="#beacon-dot" className="beacon-l beacon-d44" x="50" y="50" />
    </svg>
  );
}
