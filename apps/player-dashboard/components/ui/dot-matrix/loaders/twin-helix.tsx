import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.twin-helix-l{opacity:0;animation:twin-helix-k calc(2400ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes twin-helix-k{0%,100%{opacity:0.12}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.twin-helix-l{animation:none;opacity:0.5}}
.twin-helix-d04{animation-delay:calc(1200ms / var(--speed, 1))}
.twin-helix-d10{animation-delay:calc(200ms / var(--speed, 1))}
.twin-helix-d14{animation-delay:calc(1400ms / var(--speed, 1))}
.twin-helix-d20{animation-delay:calc(400ms / var(--speed, 1))}
.twin-helix-d24{animation-delay:calc(1600ms / var(--speed, 1))}
.twin-helix-d30{animation-delay:calc(600ms / var(--speed, 1))}
.twin-helix-d34{animation-delay:calc(1800ms / var(--speed, 1))}
.twin-helix-d40{animation-delay:calc(800ms / var(--speed, 1))}
.twin-helix-d44{animation-delay:calc(2000ms / var(--speed, 1))}`;

export function TwinHelix({
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
      aria-label={ariaLabel ?? "Twin Helix"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Twin Helix</title>
      <desc>Two strands pulse out of phase.</desc>
      <defs>
        <circle id="twin-helix-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#twin-helix-dot" className="twin-helix-l" x="6" y="6" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d04" x="50" y="6" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d10" x="6" y="17" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d14" x="50" y="17" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d20" x="6" y="28" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d24" x="50" y="28" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d30" x="6" y="39" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d34" x="50" y="39" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d40" x="6" y="50" />
      <use href="#twin-helix-dot" className="twin-helix-l twin-helix-d44" x="50" y="50" />
    </svg>
  );
}
