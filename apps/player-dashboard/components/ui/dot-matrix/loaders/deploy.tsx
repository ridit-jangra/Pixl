import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.deploy-l{opacity:0;animation:deploy-k calc(1600ms / var(--speed, 1)) linear infinite both;}
@keyframes deploy-k{0%,100%{opacity:0.16}10%{opacity:1}18%{opacity:1}22%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.deploy-l{animation:none;opacity:0.5}}
.deploy-d01{animation-delay:calc(320ms / var(--speed, 1))}
.deploy-d02{animation-delay:calc(640ms / var(--speed, 1))}
.deploy-d03{animation-delay:calc(960ms / var(--speed, 1))}
.deploy-d04{animation-delay:calc(1280ms / var(--speed, 1))}
.deploy-d11{animation-delay:calc(320ms / var(--speed, 1))}
.deploy-d12{animation-delay:calc(640ms / var(--speed, 1))}
.deploy-d13{animation-delay:calc(960ms / var(--speed, 1))}
.deploy-d14{animation-delay:calc(1280ms / var(--speed, 1))}
.deploy-d21{animation-delay:calc(320ms / var(--speed, 1))}
.deploy-d22{animation-delay:calc(640ms / var(--speed, 1))}
.deploy-d23{animation-delay:calc(960ms / var(--speed, 1))}
.deploy-d24{animation-delay:calc(1280ms / var(--speed, 1))}
.deploy-d31{animation-delay:calc(320ms / var(--speed, 1))}
.deploy-d32{animation-delay:calc(640ms / var(--speed, 1))}
.deploy-d33{animation-delay:calc(960ms / var(--speed, 1))}
.deploy-d34{animation-delay:calc(1280ms / var(--speed, 1))}
.deploy-d41{animation-delay:calc(320ms / var(--speed, 1))}
.deploy-d42{animation-delay:calc(640ms / var(--speed, 1))}
.deploy-d43{animation-delay:calc(960ms / var(--speed, 1))}
.deploy-d44{animation-delay:calc(1280ms / var(--speed, 1))}`;

export function Deploy({
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
      aria-label={ariaLabel ?? "Deploy"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Deploy</title>
      <desc>Columns roll out left to right.</desc>
      <defs>
        <circle id="deploy-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#deploy-dot" className="deploy-l" x="6" y="6" />
      <use href="#deploy-dot" className="deploy-l deploy-d01" x="17" y="6" />
      <use href="#deploy-dot" className="deploy-l deploy-d02" x="28" y="6" />
      <use href="#deploy-dot" className="deploy-l deploy-d03" x="39" y="6" />
      <use href="#deploy-dot" className="deploy-l deploy-d04" x="50" y="6" />
      <use href="#deploy-dot" className="deploy-l" x="6" y="17" />
      <use href="#deploy-dot" className="deploy-l deploy-d11" x="17" y="17" />
      <use href="#deploy-dot" className="deploy-l deploy-d12" x="28" y="17" />
      <use href="#deploy-dot" className="deploy-l deploy-d13" x="39" y="17" />
      <use href="#deploy-dot" className="deploy-l deploy-d14" x="50" y="17" />
      <use href="#deploy-dot" className="deploy-l" x="6" y="28" />
      <use href="#deploy-dot" className="deploy-l deploy-d21" x="17" y="28" />
      <use href="#deploy-dot" className="deploy-l deploy-d22" x="28" y="28" />
      <use href="#deploy-dot" className="deploy-l deploy-d23" x="39" y="28" />
      <use href="#deploy-dot" className="deploy-l deploy-d24" x="50" y="28" />
      <use href="#deploy-dot" className="deploy-l" x="6" y="39" />
      <use href="#deploy-dot" className="deploy-l deploy-d31" x="17" y="39" />
      <use href="#deploy-dot" className="deploy-l deploy-d32" x="28" y="39" />
      <use href="#deploy-dot" className="deploy-l deploy-d33" x="39" y="39" />
      <use href="#deploy-dot" className="deploy-l deploy-d34" x="50" y="39" />
      <use href="#deploy-dot" className="deploy-l" x="6" y="50" />
      <use href="#deploy-dot" className="deploy-l deploy-d41" x="17" y="50" />
      <use href="#deploy-dot" className="deploy-l deploy-d42" x="28" y="50" />
      <use href="#deploy-dot" className="deploy-l deploy-d43" x="39" y="50" />
      <use href="#deploy-dot" className="deploy-l deploy-d44" x="50" y="50" />
    </svg>
  );
}
