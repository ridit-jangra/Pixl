import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.constellation-l{opacity:0;animation:constellation-k calc(3500ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes constellation-k{0%,100%{opacity:0.06}10%{opacity:1}20%{opacity:0.06}}
@media (prefers-reduced-motion:reduce){.constellation-l{animation:none;opacity:0.5}}
.constellation-d00{animation-delay:calc(-246ms / var(--speed, 1))}
.constellation-d01{animation-delay:calc(-2274ms / var(--speed, 1))}
.constellation-d02{animation-delay:calc(-1725ms / var(--speed, 1))}
.constellation-d03{animation-delay:calc(-1597ms / var(--speed, 1))}
.constellation-d04{animation-delay:calc(-2110ms / var(--speed, 1))}
.constellation-d10{animation-delay:calc(-3373ms / var(--speed, 1))}
.constellation-d11{animation-delay:calc(-3302ms / var(--speed, 1))}
.constellation-d12{animation-delay:calc(-750ms / var(--speed, 1))}
.constellation-d13{animation-delay:calc(-2007ms / var(--speed, 1))}
.constellation-d14{animation-delay:calc(-2059ms / var(--speed, 1))}
.constellation-d20{animation-delay:calc(-2464ms / var(--speed, 1))}
.constellation-d21{animation-delay:calc(-3247ms / var(--speed, 1))}
.constellation-d22{animation-delay:calc(-1212ms / var(--speed, 1))}
.constellation-d23{animation-delay:calc(-1205ms / var(--speed, 1))}
.constellation-d24{animation-delay:calc(-1677ms / var(--speed, 1))}
.constellation-d30{animation-delay:calc(-480ms / var(--speed, 1))}
.constellation-d31{animation-delay:calc(-3120ms / var(--speed, 1))}
.constellation-d32{animation-delay:calc(-2098ms / var(--speed, 1))}
.constellation-d33{animation-delay:calc(-724ms / var(--speed, 1))}
.constellation-d34{animation-delay:calc(-1596ms / var(--speed, 1))}
.constellation-d40{animation-delay:calc(-2002ms / var(--speed, 1))}
.constellation-d41{animation-delay:calc(-3417ms / var(--speed, 1))}
.constellation-d42{animation-delay:calc(-1964ms / var(--speed, 1))}
.constellation-d43{animation-delay:calc(-2284ms / var(--speed, 1))}
.constellation-d44{animation-delay:calc(-704ms / var(--speed, 1))}`;

export function Constellation({
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
      aria-label={ariaLabel ?? "Constellation"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Constellation</title>
      <desc>Stars twinkle on a deterministic loop.</desc>
      <defs>
        <circle id="constellation-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#constellation-dot" className="constellation-l constellation-d00" x="6" y="6" />
      <use href="#constellation-dot" className="constellation-l constellation-d01" x="17" y="6" />
      <use href="#constellation-dot" className="constellation-l constellation-d02" x="28" y="6" />
      <use href="#constellation-dot" className="constellation-l constellation-d03" x="39" y="6" />
      <use href="#constellation-dot" className="constellation-l constellation-d04" x="50" y="6" />
      <use href="#constellation-dot" className="constellation-l constellation-d10" x="6" y="17" />
      <use href="#constellation-dot" className="constellation-l constellation-d11" x="17" y="17" />
      <use href="#constellation-dot" className="constellation-l constellation-d12" x="28" y="17" />
      <use href="#constellation-dot" className="constellation-l constellation-d13" x="39" y="17" />
      <use href="#constellation-dot" className="constellation-l constellation-d14" x="50" y="17" />
      <use href="#constellation-dot" className="constellation-l constellation-d20" x="6" y="28" />
      <use href="#constellation-dot" className="constellation-l constellation-d21" x="17" y="28" />
      <use href="#constellation-dot" className="constellation-l constellation-d22" x="28" y="28" />
      <use href="#constellation-dot" className="constellation-l constellation-d23" x="39" y="28" />
      <use href="#constellation-dot" className="constellation-l constellation-d24" x="50" y="28" />
      <use href="#constellation-dot" className="constellation-l constellation-d30" x="6" y="39" />
      <use href="#constellation-dot" className="constellation-l constellation-d31" x="17" y="39" />
      <use href="#constellation-dot" className="constellation-l constellation-d32" x="28" y="39" />
      <use href="#constellation-dot" className="constellation-l constellation-d33" x="39" y="39" />
      <use href="#constellation-dot" className="constellation-l constellation-d34" x="50" y="39" />
      <use href="#constellation-dot" className="constellation-l constellation-d40" x="6" y="50" />
      <use href="#constellation-dot" className="constellation-l constellation-d41" x="17" y="50" />
      <use href="#constellation-dot" className="constellation-l constellation-d42" x="28" y="50" />
      <use href="#constellation-dot" className="constellation-l constellation-d43" x="39" y="50" />
      <use href="#constellation-dot" className="constellation-l constellation-d44" x="50" y="50" />
    </svg>
  );
}
