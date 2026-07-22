import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.bloom-l{opacity:0;animation:bloom-k calc(2600ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes bloom-k{0%,100%{opacity:0.08}35%{opacity:1}60%{opacity:0.08}}
@media (prefers-reduced-motion:reduce){.bloom-l{animation:none;opacity:0.5}}
.bloom-d01{animation-delay:calc(260ms / var(--speed, 1))}
.bloom-d02{animation-delay:calc(520ms / var(--speed, 1))}
.bloom-d03{animation-delay:calc(780ms / var(--speed, 1))}
.bloom-d04{animation-delay:calc(1040ms / var(--speed, 1))}
.bloom-d10{animation-delay:calc(260ms / var(--speed, 1))}
.bloom-d11{animation-delay:calc(520ms / var(--speed, 1))}
.bloom-d12{animation-delay:calc(780ms / var(--speed, 1))}
.bloom-d13{animation-delay:calc(1040ms / var(--speed, 1))}
.bloom-d14{animation-delay:calc(1300ms / var(--speed, 1))}
.bloom-d20{animation-delay:calc(520ms / var(--speed, 1))}
.bloom-d21{animation-delay:calc(780ms / var(--speed, 1))}
.bloom-d22{animation-delay:calc(1040ms / var(--speed, 1))}
.bloom-d23{animation-delay:calc(1300ms / var(--speed, 1))}
.bloom-d24{animation-delay:calc(1560ms / var(--speed, 1))}
.bloom-d30{animation-delay:calc(780ms / var(--speed, 1))}
.bloom-d31{animation-delay:calc(1040ms / var(--speed, 1))}
.bloom-d32{animation-delay:calc(1300ms / var(--speed, 1))}
.bloom-d33{animation-delay:calc(1560ms / var(--speed, 1))}
.bloom-d34{animation-delay:calc(1820ms / var(--speed, 1))}
.bloom-d40{animation-delay:calc(1040ms / var(--speed, 1))}
.bloom-d41{animation-delay:calc(1300ms / var(--speed, 1))}
.bloom-d42{animation-delay:calc(1560ms / var(--speed, 1))}
.bloom-d43{animation-delay:calc(1820ms / var(--speed, 1))}
.bloom-d44{animation-delay:calc(2080ms / var(--speed, 1))}`;

export function Bloom({
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
      aria-label={ariaLabel ?? "Bloom"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Bloom</title>
      <desc>Brightness blooms outward along the diagonal.</desc>
      <defs>
        <circle id="bloom-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#bloom-dot" className="bloom-l" x="6" y="6" />
      <use href="#bloom-dot" className="bloom-l bloom-d01" x="17" y="6" />
      <use href="#bloom-dot" className="bloom-l bloom-d02" x="28" y="6" />
      <use href="#bloom-dot" className="bloom-l bloom-d03" x="39" y="6" />
      <use href="#bloom-dot" className="bloom-l bloom-d04" x="50" y="6" />
      <use href="#bloom-dot" className="bloom-l bloom-d10" x="6" y="17" />
      <use href="#bloom-dot" className="bloom-l bloom-d11" x="17" y="17" />
      <use href="#bloom-dot" className="bloom-l bloom-d12" x="28" y="17" />
      <use href="#bloom-dot" className="bloom-l bloom-d13" x="39" y="17" />
      <use href="#bloom-dot" className="bloom-l bloom-d14" x="50" y="17" />
      <use href="#bloom-dot" className="bloom-l bloom-d20" x="6" y="28" />
      <use href="#bloom-dot" className="bloom-l bloom-d21" x="17" y="28" />
      <use href="#bloom-dot" className="bloom-l bloom-d22" x="28" y="28" />
      <use href="#bloom-dot" className="bloom-l bloom-d23" x="39" y="28" />
      <use href="#bloom-dot" className="bloom-l bloom-d24" x="50" y="28" />
      <use href="#bloom-dot" className="bloom-l bloom-d30" x="6" y="39" />
      <use href="#bloom-dot" className="bloom-l bloom-d31" x="17" y="39" />
      <use href="#bloom-dot" className="bloom-l bloom-d32" x="28" y="39" />
      <use href="#bloom-dot" className="bloom-l bloom-d33" x="39" y="39" />
      <use href="#bloom-dot" className="bloom-l bloom-d34" x="50" y="39" />
      <use href="#bloom-dot" className="bloom-l bloom-d40" x="6" y="50" />
      <use href="#bloom-dot" className="bloom-l bloom-d41" x="17" y="50" />
      <use href="#bloom-dot" className="bloom-l bloom-d42" x="28" y="50" />
      <use href="#bloom-dot" className="bloom-l bloom-d43" x="39" y="50" />
      <use href="#bloom-dot" className="bloom-l bloom-d44" x="50" y="50" />
    </svg>
  );
}
