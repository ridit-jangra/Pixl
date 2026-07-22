import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.star-burst-l{opacity:0;animation:star-burst-k calc(2200ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes star-burst-k{0%,100%{opacity:0.1}40%{opacity:1}70%{opacity:0.1}}
@media (prefers-reduced-motion:reduce){.star-burst-l{animation:none;opacity:0.5}}
.star-burst-d02{animation-delay:calc(440ms / var(--speed, 1))}
.star-burst-d11{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d12{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d13{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d20{animation-delay:calc(440ms / var(--speed, 1))}
.star-burst-d21{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d23{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d24{animation-delay:calc(440ms / var(--speed, 1))}
.star-burst-d31{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d32{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d33{animation-delay:calc(220ms / var(--speed, 1))}
.star-burst-d42{animation-delay:calc(440ms / var(--speed, 1))}`;

export function StarBurst({
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
      aria-label={ariaLabel ?? "Star Burst"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Star Burst</title>
      <desc>A star flares from the center.</desc>
      <defs>
        <circle id="star-burst-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#star-burst-dot" className="star-burst-l star-burst-d02" x="28" y="6" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d11" x="17" y="17" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d12" x="28" y="17" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d13" x="39" y="17" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d20" x="6" y="28" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d21" x="17" y="28" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d23" x="39" y="28" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d24" x="50" y="28" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d31" x="17" y="39" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d32" x="28" y="39" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d33" x="39" y="39" />
      <use href="#star-burst-dot" className="star-burst-l star-burst-d42" x="28" y="50" />
    </svg>
  );
}
