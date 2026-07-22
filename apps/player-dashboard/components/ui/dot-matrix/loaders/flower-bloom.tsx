import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.flower-bloom-l{opacity:0;animation:flower-bloom-k calc(3000ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes flower-bloom-k{0%{opacity:0.1}35%{opacity:1}65%{opacity:1}100%{opacity:0.1}}
@media (prefers-reduced-motion:reduce){.flower-bloom-l{animation:none;opacity:0.5}}
.flower-bloom-d01{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d02{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d03{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d10{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d11{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d12{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d13{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d14{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d20{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d21{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d23{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d24{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d30{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d31{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d32{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d33{animation-delay:calc(280ms / var(--speed, 1))}
.flower-bloom-d34{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d41{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d42{animation-delay:calc(560ms / var(--speed, 1))}
.flower-bloom-d43{animation-delay:calc(560ms / var(--speed, 1))}`;

export function FlowerBloom({
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
      aria-label={ariaLabel ?? "Flower Bloom"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Flower Bloom</title>
      <desc>Petals brighten and fade around the core.</desc>
      <defs>
        <circle id="flower-bloom-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d01" x="17" y="6" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d02" x="28" y="6" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d03" x="39" y="6" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d10" x="6" y="17" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d11" x="17" y="17" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d12" x="28" y="17" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d13" x="39" y="17" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d14" x="50" y="17" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d20" x="6" y="28" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d21" x="17" y="28" />
      <use href="#flower-bloom-dot" className="flower-bloom-l" x="28" y="28" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d23" x="39" y="28" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d24" x="50" y="28" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d30" x="6" y="39" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d31" x="17" y="39" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d32" x="28" y="39" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d33" x="39" y="39" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d34" x="50" y="39" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d41" x="17" y="50" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d42" x="28" y="50" />
      <use href="#flower-bloom-dot" className="flower-bloom-l flower-bloom-d43" x="39" y="50" />
    </svg>
  );
}
