import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.token-stream-l{opacity:0;animation:token-stream-k calc(2000ms / var(--speed, 1)) linear infinite both;}
@keyframes token-stream-k{0%,100%{opacity:0.16}10%{opacity:1}25%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.token-stream-l{animation:none;opacity:0.5}}
.token-stream-d01{animation-delay:calc(320ms / var(--speed, 1))}
.token-stream-d02{animation-delay:calc(640ms / var(--speed, 1))}
.token-stream-d03{animation-delay:calc(960ms / var(--speed, 1))}
.token-stream-d04{animation-delay:calc(1280ms / var(--speed, 1))}
.token-stream-d11{animation-delay:calc(320ms / var(--speed, 1))}
.token-stream-d12{animation-delay:calc(640ms / var(--speed, 1))}
.token-stream-d13{animation-delay:calc(960ms / var(--speed, 1))}
.token-stream-d14{animation-delay:calc(1280ms / var(--speed, 1))}
.token-stream-d21{animation-delay:calc(320ms / var(--speed, 1))}
.token-stream-d22{animation-delay:calc(640ms / var(--speed, 1))}
.token-stream-d23{animation-delay:calc(960ms / var(--speed, 1))}
.token-stream-d24{animation-delay:calc(1280ms / var(--speed, 1))}
.token-stream-d31{animation-delay:calc(320ms / var(--speed, 1))}
.token-stream-d32{animation-delay:calc(640ms / var(--speed, 1))}
.token-stream-d33{animation-delay:calc(960ms / var(--speed, 1))}
.token-stream-d34{animation-delay:calc(1280ms / var(--speed, 1))}
.token-stream-d41{animation-delay:calc(320ms / var(--speed, 1))}
.token-stream-d42{animation-delay:calc(640ms / var(--speed, 1))}
.token-stream-d43{animation-delay:calc(960ms / var(--speed, 1))}
.token-stream-d44{animation-delay:calc(1280ms / var(--speed, 1))}`;

export function TokenStream({
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
      aria-label={ariaLabel ?? "Token Stream"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Token Stream</title>
      <desc>Tokens emit column by column.</desc>
      <defs>
        <circle id="token-stream-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#token-stream-dot" className="token-stream-l" x="6" y="6" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d01" x="17" y="6" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d02" x="28" y="6" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d03" x="39" y="6" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d04" x="50" y="6" />
      <use href="#token-stream-dot" className="token-stream-l" x="6" y="17" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d11" x="17" y="17" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d12" x="28" y="17" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d13" x="39" y="17" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d14" x="50" y="17" />
      <use href="#token-stream-dot" className="token-stream-l" x="6" y="28" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d21" x="17" y="28" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d22" x="28" y="28" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d23" x="39" y="28" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d24" x="50" y="28" />
      <use href="#token-stream-dot" className="token-stream-l" x="6" y="39" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d31" x="17" y="39" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d32" x="28" y="39" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d33" x="39" y="39" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d34" x="50" y="39" />
      <use href="#token-stream-dot" className="token-stream-l" x="6" y="50" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d41" x="17" y="50" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d42" x="28" y="50" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d43" x="39" y="50" />
      <use href="#token-stream-dot" className="token-stream-l token-stream-d44" x="50" y="50" />
    </svg>
  );
}
