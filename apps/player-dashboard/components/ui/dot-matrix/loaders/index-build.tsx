import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.index-build-l{opacity:0;animation:index-build-k calc(2800ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes index-build-k{0%,100%{opacity:0.16}16%{opacity:1}38%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.index-build-l{animation:none;opacity:0.5}}
.index-build-d01{animation-delay:calc(130ms / var(--speed, 1))}
.index-build-d02{animation-delay:calc(260ms / var(--speed, 1))}
.index-build-d03{animation-delay:calc(390ms / var(--speed, 1))}
.index-build-d04{animation-delay:calc(520ms / var(--speed, 1))}
.index-build-d10{animation-delay:calc(650ms / var(--speed, 1))}
.index-build-d11{animation-delay:calc(780ms / var(--speed, 1))}
.index-build-d12{animation-delay:calc(910ms / var(--speed, 1))}
.index-build-d13{animation-delay:calc(1040ms / var(--speed, 1))}
.index-build-d14{animation-delay:calc(1170ms / var(--speed, 1))}
.index-build-d20{animation-delay:calc(1300ms / var(--speed, 1))}
.index-build-d21{animation-delay:calc(1430ms / var(--speed, 1))}
.index-build-d22{animation-delay:calc(1560ms / var(--speed, 1))}
.index-build-d23{animation-delay:calc(1430ms / var(--speed, 1))}
.index-build-d24{animation-delay:calc(1300ms / var(--speed, 1))}
.index-build-d30{animation-delay:calc(1170ms / var(--speed, 1))}
.index-build-d31{animation-delay:calc(1040ms / var(--speed, 1))}
.index-build-d32{animation-delay:calc(910ms / var(--speed, 1))}
.index-build-d33{animation-delay:calc(780ms / var(--speed, 1))}
.index-build-d34{animation-delay:calc(650ms / var(--speed, 1))}
.index-build-d40{animation-delay:calc(520ms / var(--speed, 1))}
.index-build-d41{animation-delay:calc(390ms / var(--speed, 1))}
.index-build-d42{animation-delay:calc(260ms / var(--speed, 1))}
.index-build-d43{animation-delay:calc(130ms / var(--speed, 1))}`;

export function IndexBuild({
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
      aria-label={ariaLabel ?? "Index Build"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Index Build</title>
      <desc>Pairs build inward from the edges.</desc>
      <defs>
        <circle id="index-build-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#index-build-dot" className="index-build-l" x="6" y="6" />
      <use href="#index-build-dot" className="index-build-l index-build-d01" x="17" y="6" />
      <use href="#index-build-dot" className="index-build-l index-build-d02" x="28" y="6" />
      <use href="#index-build-dot" className="index-build-l index-build-d03" x="39" y="6" />
      <use href="#index-build-dot" className="index-build-l index-build-d04" x="50" y="6" />
      <use href="#index-build-dot" className="index-build-l index-build-d10" x="6" y="17" />
      <use href="#index-build-dot" className="index-build-l index-build-d11" x="17" y="17" />
      <use href="#index-build-dot" className="index-build-l index-build-d12" x="28" y="17" />
      <use href="#index-build-dot" className="index-build-l index-build-d13" x="39" y="17" />
      <use href="#index-build-dot" className="index-build-l index-build-d14" x="50" y="17" />
      <use href="#index-build-dot" className="index-build-l index-build-d20" x="6" y="28" />
      <use href="#index-build-dot" className="index-build-l index-build-d21" x="17" y="28" />
      <use href="#index-build-dot" className="index-build-l index-build-d22" x="28" y="28" />
      <use href="#index-build-dot" className="index-build-l index-build-d23" x="39" y="28" />
      <use href="#index-build-dot" className="index-build-l index-build-d24" x="50" y="28" />
      <use href="#index-build-dot" className="index-build-l index-build-d30" x="6" y="39" />
      <use href="#index-build-dot" className="index-build-l index-build-d31" x="17" y="39" />
      <use href="#index-build-dot" className="index-build-l index-build-d32" x="28" y="39" />
      <use href="#index-build-dot" className="index-build-l index-build-d33" x="39" y="39" />
      <use href="#index-build-dot" className="index-build-l index-build-d34" x="50" y="39" />
      <use href="#index-build-dot" className="index-build-l index-build-d40" x="6" y="50" />
      <use href="#index-build-dot" className="index-build-l index-build-d41" x="17" y="50" />
      <use href="#index-build-dot" className="index-build-l index-build-d42" x="28" y="50" />
      <use href="#index-build-dot" className="index-build-l index-build-d43" x="39" y="50" />
      <use href="#index-build-dot" className="index-build-l" x="50" y="50" />
    </svg>
  );
}
