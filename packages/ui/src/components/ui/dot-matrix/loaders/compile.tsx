import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.compile-l{opacity:0;animation:compile-k calc(2000ms / var(--speed, 1)) linear infinite both;}
@keyframes compile-k{0%,100%{opacity:0.16}6%{opacity:1}16%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.compile-l{animation:none;opacity:0.5}}
.compile-d00{animation-delay:calc(800ms / var(--speed, 1))}
.compile-d01{animation-delay:calc(800ms / var(--speed, 1))}
.compile-d02{animation-delay:calc(800ms / var(--speed, 1))}
.compile-d03{animation-delay:calc(800ms / var(--speed, 1))}
.compile-d04{animation-delay:calc(800ms / var(--speed, 1))}
.compile-d10{animation-delay:calc(600ms / var(--speed, 1))}
.compile-d11{animation-delay:calc(600ms / var(--speed, 1))}
.compile-d12{animation-delay:calc(600ms / var(--speed, 1))}
.compile-d13{animation-delay:calc(600ms / var(--speed, 1))}
.compile-d14{animation-delay:calc(600ms / var(--speed, 1))}
.compile-d20{animation-delay:calc(400ms / var(--speed, 1))}
.compile-d21{animation-delay:calc(400ms / var(--speed, 1))}
.compile-d22{animation-delay:calc(400ms / var(--speed, 1))}
.compile-d23{animation-delay:calc(400ms / var(--speed, 1))}
.compile-d24{animation-delay:calc(400ms / var(--speed, 1))}
.compile-d30{animation-delay:calc(200ms / var(--speed, 1))}
.compile-d31{animation-delay:calc(200ms / var(--speed, 1))}
.compile-d32{animation-delay:calc(200ms / var(--speed, 1))}
.compile-d33{animation-delay:calc(200ms / var(--speed, 1))}
.compile-d34{animation-delay:calc(200ms / var(--speed, 1))}`;

export function Compile({
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
      aria-label={ariaLabel ?? "Compile"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Compile</title>
      <desc>Rows resolve from the bottom up.</desc>
      <defs>
        <circle id="compile-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#compile-dot" className="compile-l compile-d00" x="6" y="6" />
      <use href="#compile-dot" className="compile-l compile-d01" x="17" y="6" />
      <use href="#compile-dot" className="compile-l compile-d02" x="28" y="6" />
      <use href="#compile-dot" className="compile-l compile-d03" x="39" y="6" />
      <use href="#compile-dot" className="compile-l compile-d04" x="50" y="6" />
      <use href="#compile-dot" className="compile-l compile-d10" x="6" y="17" />
      <use href="#compile-dot" className="compile-l compile-d11" x="17" y="17" />
      <use href="#compile-dot" className="compile-l compile-d12" x="28" y="17" />
      <use href="#compile-dot" className="compile-l compile-d13" x="39" y="17" />
      <use href="#compile-dot" className="compile-l compile-d14" x="50" y="17" />
      <use href="#compile-dot" className="compile-l compile-d20" x="6" y="28" />
      <use href="#compile-dot" className="compile-l compile-d21" x="17" y="28" />
      <use href="#compile-dot" className="compile-l compile-d22" x="28" y="28" />
      <use href="#compile-dot" className="compile-l compile-d23" x="39" y="28" />
      <use href="#compile-dot" className="compile-l compile-d24" x="50" y="28" />
      <use href="#compile-dot" className="compile-l compile-d30" x="6" y="39" />
      <use href="#compile-dot" className="compile-l compile-d31" x="17" y="39" />
      <use href="#compile-dot" className="compile-l compile-d32" x="28" y="39" />
      <use href="#compile-dot" className="compile-l compile-d33" x="39" y="39" />
      <use href="#compile-dot" className="compile-l compile-d34" x="50" y="39" />
      <use href="#compile-dot" className="compile-l" x="6" y="50" />
      <use href="#compile-dot" className="compile-l" x="17" y="50" />
      <use href="#compile-dot" className="compile-l" x="28" y="50" />
      <use href="#compile-dot" className="compile-l" x="39" y="50" />
      <use href="#compile-dot" className="compile-l" x="50" y="50" />
    </svg>
  );
}
