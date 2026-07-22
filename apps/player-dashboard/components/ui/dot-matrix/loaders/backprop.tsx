import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.backprop-l{opacity:0.16;animation:backprop-k calc(2800ms / var(--speed, 1)) linear infinite both,backprop-k calc(2800ms / var(--speed, 1)) linear infinite both;animation-composition:add;}
@keyframes backprop-k{0%,100%{opacity:0}10%{opacity:0.84}22%{opacity:0}}
@media (prefers-reduced-motion:reduce){.backprop-l{animation:none;opacity:0.5}}
.backprop-d00{animation-delay:calc(0ms / var(--speed, 1)),calc(2360ms / var(--speed, 1))}
.backprop-d01{animation-delay:calc(240ms / var(--speed, 1)),calc(2120ms / var(--speed, 1))}
.backprop-d02{animation-delay:calc(480ms / var(--speed, 1)),calc(1880ms / var(--speed, 1))}
.backprop-d03{animation-delay:calc(720ms / var(--speed, 1)),calc(1640ms / var(--speed, 1))}
.backprop-d04{animation-delay:calc(960ms / var(--speed, 1)),calc(1400ms / var(--speed, 1))}
.backprop-d10{animation-delay:calc(0ms / var(--speed, 1)),calc(2360ms / var(--speed, 1))}
.backprop-d11{animation-delay:calc(240ms / var(--speed, 1)),calc(2120ms / var(--speed, 1))}
.backprop-d12{animation-delay:calc(480ms / var(--speed, 1)),calc(1880ms / var(--speed, 1))}
.backprop-d13{animation-delay:calc(720ms / var(--speed, 1)),calc(1640ms / var(--speed, 1))}
.backprop-d14{animation-delay:calc(960ms / var(--speed, 1)),calc(1400ms / var(--speed, 1))}
.backprop-d20{animation-delay:calc(0ms / var(--speed, 1)),calc(2360ms / var(--speed, 1))}
.backprop-d21{animation-delay:calc(240ms / var(--speed, 1)),calc(2120ms / var(--speed, 1))}
.backprop-d22{animation-delay:calc(480ms / var(--speed, 1)),calc(1880ms / var(--speed, 1))}
.backprop-d23{animation-delay:calc(720ms / var(--speed, 1)),calc(1640ms / var(--speed, 1))}
.backprop-d24{animation-delay:calc(960ms / var(--speed, 1)),calc(1400ms / var(--speed, 1))}
.backprop-d30{animation-delay:calc(0ms / var(--speed, 1)),calc(2360ms / var(--speed, 1))}
.backprop-d31{animation-delay:calc(240ms / var(--speed, 1)),calc(2120ms / var(--speed, 1))}
.backprop-d32{animation-delay:calc(480ms / var(--speed, 1)),calc(1880ms / var(--speed, 1))}
.backprop-d33{animation-delay:calc(720ms / var(--speed, 1)),calc(1640ms / var(--speed, 1))}
.backprop-d34{animation-delay:calc(960ms / var(--speed, 1)),calc(1400ms / var(--speed, 1))}
.backprop-d40{animation-delay:calc(0ms / var(--speed, 1)),calc(2360ms / var(--speed, 1))}
.backprop-d41{animation-delay:calc(240ms / var(--speed, 1)),calc(2120ms / var(--speed, 1))}
.backprop-d42{animation-delay:calc(480ms / var(--speed, 1)),calc(1880ms / var(--speed, 1))}
.backprop-d43{animation-delay:calc(720ms / var(--speed, 1)),calc(1640ms / var(--speed, 1))}
.backprop-d44{animation-delay:calc(960ms / var(--speed, 1)),calc(1400ms / var(--speed, 1))}`;

export function Backprop({
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
      aria-label={ariaLabel ?? "Backprop"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Backprop</title>
      <desc>Pulses propagate forward then back across columns.</desc>
      <defs>
        <circle id="backprop-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#backprop-dot" className="backprop-l backprop-d00" x="6" y="6" />
      <use href="#backprop-dot" className="backprop-l backprop-d01" x="17" y="6" />
      <use href="#backprop-dot" className="backprop-l backprop-d02" x="28" y="6" />
      <use href="#backprop-dot" className="backprop-l backprop-d03" x="39" y="6" />
      <use href="#backprop-dot" className="backprop-l backprop-d04" x="50" y="6" />
      <use href="#backprop-dot" className="backprop-l backprop-d10" x="6" y="17" />
      <use href="#backprop-dot" className="backprop-l backprop-d11" x="17" y="17" />
      <use href="#backprop-dot" className="backprop-l backprop-d12" x="28" y="17" />
      <use href="#backprop-dot" className="backprop-l backprop-d13" x="39" y="17" />
      <use href="#backprop-dot" className="backprop-l backprop-d14" x="50" y="17" />
      <use href="#backprop-dot" className="backprop-l backprop-d20" x="6" y="28" />
      <use href="#backprop-dot" className="backprop-l backprop-d21" x="17" y="28" />
      <use href="#backprop-dot" className="backprop-l backprop-d22" x="28" y="28" />
      <use href="#backprop-dot" className="backprop-l backprop-d23" x="39" y="28" />
      <use href="#backprop-dot" className="backprop-l backprop-d24" x="50" y="28" />
      <use href="#backprop-dot" className="backprop-l backprop-d30" x="6" y="39" />
      <use href="#backprop-dot" className="backprop-l backprop-d31" x="17" y="39" />
      <use href="#backprop-dot" className="backprop-l backprop-d32" x="28" y="39" />
      <use href="#backprop-dot" className="backprop-l backprop-d33" x="39" y="39" />
      <use href="#backprop-dot" className="backprop-l backprop-d34" x="50" y="39" />
      <use href="#backprop-dot" className="backprop-l backprop-d40" x="6" y="50" />
      <use href="#backprop-dot" className="backprop-l backprop-d41" x="17" y="50" />
      <use href="#backprop-dot" className="backprop-l backprop-d42" x="28" y="50" />
      <use href="#backprop-dot" className="backprop-l backprop-d43" x="39" y="50" />
      <use href="#backprop-dot" className="backprop-l backprop-d44" x="50" y="50" />
    </svg>
  );
}
