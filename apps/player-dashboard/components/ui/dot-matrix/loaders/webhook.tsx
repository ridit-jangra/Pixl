import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.webhook-l{opacity:0;animation:webhook-k calc(2400ms / var(--speed, 1)) cubic-bezier(0.215, 0.61, 0.355, 1) infinite both;}
@keyframes webhook-k{0%,100%{opacity:0.16}18%{opacity:1}40%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.webhook-l{animation:none;opacity:0.5}}
.webhook-d00{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d01{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d02{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d03{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d04{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d10{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d11{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d12{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d13{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d14{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d20{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d21{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d23{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d24{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d30{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d31{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d32{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d33{animation-delay:calc(320ms / var(--speed, 1))}
.webhook-d34{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d40{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d41{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d42{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d43{animation-delay:calc(640ms / var(--speed, 1))}
.webhook-d44{animation-delay:calc(640ms / var(--speed, 1))}`;

export function Webhook({
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
      aria-label={ariaLabel ?? "Webhook"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Webhook</title>
      <desc>A pulse radiates outward on each call.</desc>
      <defs>
        <circle id="webhook-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#webhook-dot" className="webhook-l webhook-d00" x="6" y="6" />
      <use href="#webhook-dot" className="webhook-l webhook-d01" x="17" y="6" />
      <use href="#webhook-dot" className="webhook-l webhook-d02" x="28" y="6" />
      <use href="#webhook-dot" className="webhook-l webhook-d03" x="39" y="6" />
      <use href="#webhook-dot" className="webhook-l webhook-d04" x="50" y="6" />
      <use href="#webhook-dot" className="webhook-l webhook-d10" x="6" y="17" />
      <use href="#webhook-dot" className="webhook-l webhook-d11" x="17" y="17" />
      <use href="#webhook-dot" className="webhook-l webhook-d12" x="28" y="17" />
      <use href="#webhook-dot" className="webhook-l webhook-d13" x="39" y="17" />
      <use href="#webhook-dot" className="webhook-l webhook-d14" x="50" y="17" />
      <use href="#webhook-dot" className="webhook-l webhook-d20" x="6" y="28" />
      <use href="#webhook-dot" className="webhook-l webhook-d21" x="17" y="28" />
      <use href="#webhook-dot" className="webhook-l" x="28" y="28" />
      <use href="#webhook-dot" className="webhook-l webhook-d23" x="39" y="28" />
      <use href="#webhook-dot" className="webhook-l webhook-d24" x="50" y="28" />
      <use href="#webhook-dot" className="webhook-l webhook-d30" x="6" y="39" />
      <use href="#webhook-dot" className="webhook-l webhook-d31" x="17" y="39" />
      <use href="#webhook-dot" className="webhook-l webhook-d32" x="28" y="39" />
      <use href="#webhook-dot" className="webhook-l webhook-d33" x="39" y="39" />
      <use href="#webhook-dot" className="webhook-l webhook-d34" x="50" y="39" />
      <use href="#webhook-dot" className="webhook-l webhook-d40" x="6" y="50" />
      <use href="#webhook-dot" className="webhook-l webhook-d41" x="17" y="50" />
      <use href="#webhook-dot" className="webhook-l webhook-d42" x="28" y="50" />
      <use href="#webhook-dot" className="webhook-l webhook-d43" x="39" y="50" />
      <use href="#webhook-dot" className="webhook-l webhook-d44" x="50" y="50" />
    </svg>
  );
}
