import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.cron-l{opacity:0;animation:cron-k calc(2000ms / var(--speed, 1)) linear infinite both;}
@keyframes cron-k{0%,100%{opacity:0.16}8%{opacity:1}18%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.cron-l{animation:none;opacity:0.5}}
.cron-d00{animation-delay:calc(1750ms / var(--speed, 1))}
.cron-d01{animation-delay:calc(1852ms / var(--speed, 1))}
.cron-d03{animation-delay:calc(148ms / var(--speed, 1))}
.cron-d04{animation-delay:calc(250ms / var(--speed, 1))}
.cron-d10{animation-delay:calc(1648ms / var(--speed, 1))}
.cron-d14{animation-delay:calc(352ms / var(--speed, 1))}
.cron-d20{animation-delay:calc(1500ms / var(--speed, 1))}
.cron-d24{animation-delay:calc(500ms / var(--speed, 1))}
.cron-d30{animation-delay:calc(1352ms / var(--speed, 1))}
.cron-d34{animation-delay:calc(648ms / var(--speed, 1))}
.cron-d40{animation-delay:calc(1250ms / var(--speed, 1))}
.cron-d41{animation-delay:calc(1148ms / var(--speed, 1))}
.cron-d42{animation-delay:calc(1000ms / var(--speed, 1))}
.cron-d43{animation-delay:calc(852ms / var(--speed, 1))}
.cron-d44{animation-delay:calc(750ms / var(--speed, 1))}`;

export function Cron({
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
      aria-label={ariaLabel ?? "Cron"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Cron</title>
      <desc>The outer ring ticks around like a clock.</desc>
      <defs>
        <circle id="cron-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#cron-dot" className="cron-l cron-d00" x="6" y="6" />
      <use href="#cron-dot" className="cron-l cron-d01" x="17" y="6" />
      <use href="#cron-dot" className="cron-l" x="28" y="6" />
      <use href="#cron-dot" className="cron-l cron-d03" x="39" y="6" />
      <use href="#cron-dot" className="cron-l cron-d04" x="50" y="6" />
      <use href="#cron-dot" className="cron-l cron-d10" x="6" y="17" />
      <use href="#cron-dot" x="17" y="17" opacity="0.06" />
      <use href="#cron-dot" x="28" y="17" opacity="0.06" />
      <use href="#cron-dot" x="39" y="17" opacity="0.06" />
      <use href="#cron-dot" className="cron-l cron-d14" x="50" y="17" />
      <use href="#cron-dot" className="cron-l cron-d20" x="6" y="28" />
      <use href="#cron-dot" x="17" y="28" opacity="0.06" />
      <use href="#cron-dot" x="28" y="28" opacity="0.06" />
      <use href="#cron-dot" x="39" y="28" opacity="0.06" />
      <use href="#cron-dot" className="cron-l cron-d24" x="50" y="28" />
      <use href="#cron-dot" className="cron-l cron-d30" x="6" y="39" />
      <use href="#cron-dot" x="17" y="39" opacity="0.06" />
      <use href="#cron-dot" x="28" y="39" opacity="0.06" />
      <use href="#cron-dot" x="39" y="39" opacity="0.06" />
      <use href="#cron-dot" className="cron-l cron-d34" x="50" y="39" />
      <use href="#cron-dot" className="cron-l cron-d40" x="6" y="50" />
      <use href="#cron-dot" className="cron-l cron-d41" x="17" y="50" />
      <use href="#cron-dot" className="cron-l cron-d42" x="28" y="50" />
      <use href="#cron-dot" className="cron-l cron-d43" x="39" y="50" />
      <use href="#cron-dot" className="cron-l cron-d44" x="50" y="50" />
    </svg>
  );
}
