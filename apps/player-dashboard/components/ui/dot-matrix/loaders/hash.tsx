import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.hash-l{opacity:0;animation:hash-k calc(1400ms / var(--speed, 1)) linear infinite both;}
@keyframes hash-k{0%,100%{opacity:0.16}6%{opacity:1}14%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.hash-l{animation:none;opacity:0.5}}
.hash-d00{animation-delay:calc(-98ms / var(--speed, 1))}
.hash-d01{animation-delay:calc(-909ms / var(--speed, 1))}
.hash-d02{animation-delay:calc(-690ms / var(--speed, 1))}
.hash-d03{animation-delay:calc(-639ms / var(--speed, 1))}
.hash-d04{animation-delay:calc(-844ms / var(--speed, 1))}
.hash-d10{animation-delay:calc(-1349ms / var(--speed, 1))}
.hash-d11{animation-delay:calc(-1321ms / var(--speed, 1))}
.hash-d12{animation-delay:calc(-300ms / var(--speed, 1))}
.hash-d13{animation-delay:calc(-803ms / var(--speed, 1))}
.hash-d14{animation-delay:calc(-824ms / var(--speed, 1))}
.hash-d20{animation-delay:calc(-986ms / var(--speed, 1))}
.hash-d21{animation-delay:calc(-1299ms / var(--speed, 1))}
.hash-d22{animation-delay:calc(-485ms / var(--speed, 1))}
.hash-d23{animation-delay:calc(-482ms / var(--speed, 1))}
.hash-d24{animation-delay:calc(-671ms / var(--speed, 1))}
.hash-d30{animation-delay:calc(-192ms / var(--speed, 1))}
.hash-d31{animation-delay:calc(-1248ms / var(--speed, 1))}
.hash-d32{animation-delay:calc(-839ms / var(--speed, 1))}
.hash-d33{animation-delay:calc(-290ms / var(--speed, 1))}
.hash-d34{animation-delay:calc(-638ms / var(--speed, 1))}
.hash-d40{animation-delay:calc(-801ms / var(--speed, 1))}
.hash-d41{animation-delay:calc(-1367ms / var(--speed, 1))}
.hash-d42{animation-delay:calc(-786ms / var(--speed, 1))}
.hash-d43{animation-delay:calc(-914ms / var(--speed, 1))}
.hash-d44{animation-delay:calc(-282ms / var(--speed, 1))}`;

export function Hash({
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
      aria-label={ariaLabel ?? "Hash"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Hash</title>
      <desc>Cells flicker in a scattered, fixed pattern.</desc>
      <defs>
        <circle id="hash-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#hash-dot" className="hash-l hash-d00" x="6" y="6" />
      <use href="#hash-dot" className="hash-l hash-d01" x="17" y="6" />
      <use href="#hash-dot" className="hash-l hash-d02" x="28" y="6" />
      <use href="#hash-dot" className="hash-l hash-d03" x="39" y="6" />
      <use href="#hash-dot" className="hash-l hash-d04" x="50" y="6" />
      <use href="#hash-dot" className="hash-l hash-d10" x="6" y="17" />
      <use href="#hash-dot" className="hash-l hash-d11" x="17" y="17" />
      <use href="#hash-dot" className="hash-l hash-d12" x="28" y="17" />
      <use href="#hash-dot" className="hash-l hash-d13" x="39" y="17" />
      <use href="#hash-dot" className="hash-l hash-d14" x="50" y="17" />
      <use href="#hash-dot" className="hash-l hash-d20" x="6" y="28" />
      <use href="#hash-dot" className="hash-l hash-d21" x="17" y="28" />
      <use href="#hash-dot" className="hash-l hash-d22" x="28" y="28" />
      <use href="#hash-dot" className="hash-l hash-d23" x="39" y="28" />
      <use href="#hash-dot" className="hash-l hash-d24" x="50" y="28" />
      <use href="#hash-dot" className="hash-l hash-d30" x="6" y="39" />
      <use href="#hash-dot" className="hash-l hash-d31" x="17" y="39" />
      <use href="#hash-dot" className="hash-l hash-d32" x="28" y="39" />
      <use href="#hash-dot" className="hash-l hash-d33" x="39" y="39" />
      <use href="#hash-dot" className="hash-l hash-d34" x="50" y="39" />
      <use href="#hash-dot" className="hash-l hash-d40" x="6" y="50" />
      <use href="#hash-dot" className="hash-l hash-d41" x="17" y="50" />
      <use href="#hash-dot" className="hash-l hash-d42" x="28" y="50" />
      <use href="#hash-dot" className="hash-l hash-d43" x="39" y="50" />
      <use href="#hash-dot" className="hash-l hash-d44" x="50" y="50" />
    </svg>
  );
}
