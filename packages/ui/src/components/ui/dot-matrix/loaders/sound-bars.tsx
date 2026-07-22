import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.sound-bars-l{opacity:0;animation:sound-bars-k calc(1400ms / var(--speed, 1)) ease-in-out infinite both;}
@keyframes sound-bars-k{0%,100%{opacity:var(--min-op)}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.sound-bars-l{animation:none;opacity:0.5}}
.sound-bars-d00{--min-op:0.05}
.sound-bars-d01{--min-op:0.05;animation-delay:calc(140ms / var(--speed, 1))}
.sound-bars-d02{--min-op:0.05;animation-delay:calc(280ms / var(--speed, 1))}
.sound-bars-d03{--min-op:0.05;animation-delay:calc(420ms / var(--speed, 1))}
.sound-bars-d04{--min-op:0.05;animation-delay:calc(560ms / var(--speed, 1))}
.sound-bars-d10{--min-op:0.23}
.sound-bars-d11{--min-op:0.23;animation-delay:calc(140ms / var(--speed, 1))}
.sound-bars-d12{--min-op:0.23;animation-delay:calc(280ms / var(--speed, 1))}
.sound-bars-d13{--min-op:0.23;animation-delay:calc(420ms / var(--speed, 1))}
.sound-bars-d14{--min-op:0.23;animation-delay:calc(560ms / var(--speed, 1))}
.sound-bars-d20{--min-op:0.41}
.sound-bars-d21{--min-op:0.41;animation-delay:calc(140ms / var(--speed, 1))}
.sound-bars-d22{--min-op:0.41;animation-delay:calc(280ms / var(--speed, 1))}
.sound-bars-d23{--min-op:0.41;animation-delay:calc(420ms / var(--speed, 1))}
.sound-bars-d24{--min-op:0.41;animation-delay:calc(560ms / var(--speed, 1))}
.sound-bars-d30{--min-op:0.59}
.sound-bars-d31{--min-op:0.59;animation-delay:calc(140ms / var(--speed, 1))}
.sound-bars-d32{--min-op:0.59;animation-delay:calc(280ms / var(--speed, 1))}
.sound-bars-d33{--min-op:0.59;animation-delay:calc(420ms / var(--speed, 1))}
.sound-bars-d34{--min-op:0.59;animation-delay:calc(560ms / var(--speed, 1))}
.sound-bars-d40{--min-op:0.77}
.sound-bars-d41{--min-op:0.77;animation-delay:calc(140ms / var(--speed, 1))}
.sound-bars-d42{--min-op:0.77;animation-delay:calc(280ms / var(--speed, 1))}
.sound-bars-d43{--min-op:0.77;animation-delay:calc(420ms / var(--speed, 1))}
.sound-bars-d44{--min-op:0.77;animation-delay:calc(560ms / var(--speed, 1))}`;

export function SoundBars({
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
      aria-label={ariaLabel ?? "Sound Bars"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Sound Bars</title>
      <desc>Columns rise and fall like a meter.</desc>
      <defs>
        <circle id="sound-bars-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d00" x="6" y="6" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d01" x="17" y="6" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d02" x="28" y="6" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d03" x="39" y="6" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d04" x="50" y="6" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d10" x="6" y="17" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d11" x="17" y="17" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d12" x="28" y="17" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d13" x="39" y="17" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d14" x="50" y="17" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d20" x="6" y="28" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d21" x="17" y="28" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d22" x="28" y="28" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d23" x="39" y="28" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d24" x="50" y="28" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d30" x="6" y="39" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d31" x="17" y="39" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d32" x="28" y="39" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d33" x="39" y="39" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d34" x="50" y="39" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d40" x="6" y="50" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d41" x="17" y="50" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d42" x="28" y="50" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d43" x="39" y="50" />
      <use href="#sound-bars-dot" className="sound-bars-l sound-bars-d44" x="50" y="50" />
    </svg>
  );
}
