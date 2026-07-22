import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.snowflake-l{opacity:0;animation:snowflake-k calc(2600ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes snowflake-k{0%,100%{opacity:0.18}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.snowflake-l{animation:none;opacity:0.5}}
.snowflake-d00{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d02{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d04{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d11{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d12{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d13{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d20{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d21{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d23{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d24{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d31{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d32{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d33{animation-delay:calc(180ms / var(--speed, 1))}
.snowflake-d40{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d42{animation-delay:calc(360ms / var(--speed, 1))}
.snowflake-d44{animation-delay:calc(360ms / var(--speed, 1))}`;

export function Snowflake({
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
      aria-label={ariaLabel ?? "Snowflake"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Snowflake</title>
      <desc>A six-fold flake shimmers softly.</desc>
      <defs>
        <circle id="snowflake-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#snowflake-dot" className="snowflake-l snowflake-d00" x="6" y="6" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d02" x="28" y="6" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d04" x="50" y="6" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d11" x="17" y="17" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d12" x="28" y="17" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d13" x="39" y="17" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d20" x="6" y="28" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d21" x="17" y="28" />
      <use href="#snowflake-dot" className="snowflake-l" x="28" y="28" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d23" x="39" y="28" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d24" x="50" y="28" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d31" x="17" y="39" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d32" x="28" y="39" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d33" x="39" y="39" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d40" x="6" y="50" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d42" x="28" y="50" />
      <use href="#snowflake-dot" className="snowflake-l snowflake-d44" x="50" y="50" />
    </svg>
  );
}
