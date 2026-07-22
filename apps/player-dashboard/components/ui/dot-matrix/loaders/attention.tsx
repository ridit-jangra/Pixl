import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.attention-l{opacity:0;animation:attention-k calc(1800ms / var(--speed, 1)) linear infinite both;}
@keyframes attention-k{0%,100%{opacity:0.16}12%{opacity:1}30%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.attention-l{animation:none;opacity:0.5}}
.attention-d10{animation-delay:calc(280ms / var(--speed, 1))}
.attention-d11{animation-delay:calc(280ms / var(--speed, 1))}
.attention-d12{animation-delay:calc(280ms / var(--speed, 1))}
.attention-d13{animation-delay:calc(280ms / var(--speed, 1))}
.attention-d14{animation-delay:calc(280ms / var(--speed, 1))}
.attention-d20{animation-delay:calc(560ms / var(--speed, 1))}
.attention-d21{animation-delay:calc(560ms / var(--speed, 1))}
.attention-d22{animation-delay:calc(560ms / var(--speed, 1))}
.attention-d23{animation-delay:calc(560ms / var(--speed, 1))}
.attention-d24{animation-delay:calc(560ms / var(--speed, 1))}
.attention-d30{animation-delay:calc(840ms / var(--speed, 1))}
.attention-d31{animation-delay:calc(840ms / var(--speed, 1))}
.attention-d32{animation-delay:calc(840ms / var(--speed, 1))}
.attention-d33{animation-delay:calc(840ms / var(--speed, 1))}
.attention-d34{animation-delay:calc(840ms / var(--speed, 1))}
.attention-d40{animation-delay:calc(1120ms / var(--speed, 1))}
.attention-d41{animation-delay:calc(1120ms / var(--speed, 1))}
.attention-d42{animation-delay:calc(1120ms / var(--speed, 1))}
.attention-d43{animation-delay:calc(1120ms / var(--speed, 1))}
.attention-d44{animation-delay:calc(1120ms / var(--speed, 1))}`;

export function Attention({
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
      aria-label={ariaLabel ?? "Attention"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Attention</title>
      <desc>Rows light top to bottom in a steady sweep.</desc>
      <defs>
        <circle id="attention-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#attention-dot" className="attention-l" x="6" y="6" />
      <use href="#attention-dot" className="attention-l" x="17" y="6" />
      <use href="#attention-dot" className="attention-l" x="28" y="6" />
      <use href="#attention-dot" className="attention-l" x="39" y="6" />
      <use href="#attention-dot" className="attention-l" x="50" y="6" />
      <use href="#attention-dot" className="attention-l attention-d10" x="6" y="17" />
      <use href="#attention-dot" className="attention-l attention-d11" x="17" y="17" />
      <use href="#attention-dot" className="attention-l attention-d12" x="28" y="17" />
      <use href="#attention-dot" className="attention-l attention-d13" x="39" y="17" />
      <use href="#attention-dot" className="attention-l attention-d14" x="50" y="17" />
      <use href="#attention-dot" className="attention-l attention-d20" x="6" y="28" />
      <use href="#attention-dot" className="attention-l attention-d21" x="17" y="28" />
      <use href="#attention-dot" className="attention-l attention-d22" x="28" y="28" />
      <use href="#attention-dot" className="attention-l attention-d23" x="39" y="28" />
      <use href="#attention-dot" className="attention-l attention-d24" x="50" y="28" />
      <use href="#attention-dot" className="attention-l attention-d30" x="6" y="39" />
      <use href="#attention-dot" className="attention-l attention-d31" x="17" y="39" />
      <use href="#attention-dot" className="attention-l attention-d32" x="28" y="39" />
      <use href="#attention-dot" className="attention-l attention-d33" x="39" y="39" />
      <use href="#attention-dot" className="attention-l attention-d34" x="50" y="39" />
      <use href="#attention-dot" className="attention-l attention-d40" x="6" y="50" />
      <use href="#attention-dot" className="attention-l attention-d41" x="17" y="50" />
      <use href="#attention-dot" className="attention-l attention-d42" x="28" y="50" />
      <use href="#attention-dot" className="attention-l attention-d43" x="39" y="50" />
      <use href="#attention-dot" className="attention-l attention-d44" x="50" y="50" />
    </svg>
  );
}
