import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.plus-pulse-l{opacity:0;animation:plus-pulse-k calc(1600ms / var(--speed, 1)) cubic-bezier(0.45, 0, 0.55, 1) infinite both;}
@keyframes plus-pulse-k{0%,100%{opacity:0.2}20%{opacity:1}40%{opacity:0.2}}
@media (prefers-reduced-motion:reduce){.plus-pulse-l{animation:none;opacity:0.5}}
.plus-pulse-d02{animation-delay:calc(280ms / var(--speed, 1))}
.plus-pulse-d12{animation-delay:calc(140ms / var(--speed, 1))}
.plus-pulse-d20{animation-delay:calc(280ms / var(--speed, 1))}
.plus-pulse-d21{animation-delay:calc(140ms / var(--speed, 1))}
.plus-pulse-d23{animation-delay:calc(140ms / var(--speed, 1))}
.plus-pulse-d24{animation-delay:calc(280ms / var(--speed, 1))}
.plus-pulse-d32{animation-delay:calc(140ms / var(--speed, 1))}
.plus-pulse-d42{animation-delay:calc(280ms / var(--speed, 1))}`;

export function PlusPulse({
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
      aria-label={ariaLabel ?? "Plus Pulse"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Plus Pulse</title>
      <desc>A plus shape pulses in and out.</desc>
      <defs>
        <circle id="plus-pulse-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d02" x="28" y="6" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d12" x="28" y="17" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d20" x="6" y="28" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d21" x="17" y="28" />
      <use href="#plus-pulse-dot" className="plus-pulse-l" x="28" y="28" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d23" x="39" y="28" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d24" x="50" y="28" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d32" x="28" y="39" />
      <use href="#plus-pulse-dot" className="plus-pulse-l plus-pulse-d42" x="28" y="50" />
    </svg>
  );
}
