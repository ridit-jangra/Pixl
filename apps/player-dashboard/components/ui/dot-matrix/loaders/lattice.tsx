import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.lattice-l{opacity:0;animation:lattice-k calc(2400ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes lattice-k{0%,100%{opacity:0.18}50%{opacity:0.95}}
@media (prefers-reduced-motion:reduce){.lattice-l{animation:none;opacity:0.5}}
.lattice-d01{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d02{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d03{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d10{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d11{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d12{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d13{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d14{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d20{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d21{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d22{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d23{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d24{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d30{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d31{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d32{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d33{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d34{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d41{animation-delay:calc(480ms / var(--speed, 1))}
.lattice-d42{animation-delay:calc(960ms / var(--speed, 1))}
.lattice-d43{animation-delay:calc(480ms / var(--speed, 1))}`;

export function Lattice({
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
      aria-label={ariaLabel ?? "Lattice"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Lattice</title>
      <desc>The grid breathes in two phases.</desc>
      <defs>
        <circle id="lattice-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#lattice-dot" className="lattice-l" x="6" y="6" />
      <use href="#lattice-dot" className="lattice-l lattice-d01" x="17" y="6" />
      <use href="#lattice-dot" className="lattice-l lattice-d02" x="28" y="6" />
      <use href="#lattice-dot" className="lattice-l lattice-d03" x="39" y="6" />
      <use href="#lattice-dot" className="lattice-l" x="50" y="6" />
      <use href="#lattice-dot" className="lattice-l lattice-d10" x="6" y="17" />
      <use href="#lattice-dot" className="lattice-l lattice-d11" x="17" y="17" />
      <use href="#lattice-dot" className="lattice-l lattice-d12" x="28" y="17" />
      <use href="#lattice-dot" className="lattice-l lattice-d13" x="39" y="17" />
      <use href="#lattice-dot" className="lattice-l lattice-d14" x="50" y="17" />
      <use href="#lattice-dot" className="lattice-l lattice-d20" x="6" y="28" />
      <use href="#lattice-dot" className="lattice-l lattice-d21" x="17" y="28" />
      <use href="#lattice-dot" className="lattice-l lattice-d22" x="28" y="28" />
      <use href="#lattice-dot" className="lattice-l lattice-d23" x="39" y="28" />
      <use href="#lattice-dot" className="lattice-l lattice-d24" x="50" y="28" />
      <use href="#lattice-dot" className="lattice-l lattice-d30" x="6" y="39" />
      <use href="#lattice-dot" className="lattice-l lattice-d31" x="17" y="39" />
      <use href="#lattice-dot" className="lattice-l lattice-d32" x="28" y="39" />
      <use href="#lattice-dot" className="lattice-l lattice-d33" x="39" y="39" />
      <use href="#lattice-dot" className="lattice-l lattice-d34" x="50" y="39" />
      <use href="#lattice-dot" className="lattice-l" x="6" y="50" />
      <use href="#lattice-dot" className="lattice-l lattice-d41" x="17" y="50" />
      <use href="#lattice-dot" className="lattice-l lattice-d42" x="28" y="50" />
      <use href="#lattice-dot" className="lattice-l lattice-d43" x="39" y="50" />
      <use href="#lattice-dot" className="lattice-l" x="50" y="50" />
    </svg>
  );
}
