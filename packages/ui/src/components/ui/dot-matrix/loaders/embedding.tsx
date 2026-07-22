import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.embedding-l{opacity:0;animation:embedding-k calc(2400ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes embedding-k{0%,100%{opacity:0.16}20%{opacity:1}45%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.embedding-l{animation:none;opacity:0.5}}
.embedding-d11{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d12{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d13{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d21{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d22{animation-delay:calc(760ms / var(--speed, 1))}
.embedding-d23{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d31{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d32{animation-delay:calc(380ms / var(--speed, 1))}
.embedding-d33{animation-delay:calc(380ms / var(--speed, 1))}`;

export function Embedding({
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
      aria-label={ariaLabel ?? "Embedding"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Embedding</title>
      <desc>Brightness collapses inward to the center.</desc>
      <defs>
        <circle id="embedding-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#embedding-dot" className="embedding-l" x="6" y="6" />
      <use href="#embedding-dot" className="embedding-l" x="17" y="6" />
      <use href="#embedding-dot" className="embedding-l" x="28" y="6" />
      <use href="#embedding-dot" className="embedding-l" x="39" y="6" />
      <use href="#embedding-dot" className="embedding-l" x="50" y="6" />
      <use href="#embedding-dot" className="embedding-l" x="6" y="17" />
      <use href="#embedding-dot" className="embedding-l embedding-d11" x="17" y="17" />
      <use href="#embedding-dot" className="embedding-l embedding-d12" x="28" y="17" />
      <use href="#embedding-dot" className="embedding-l embedding-d13" x="39" y="17" />
      <use href="#embedding-dot" className="embedding-l" x="50" y="17" />
      <use href="#embedding-dot" className="embedding-l" x="6" y="28" />
      <use href="#embedding-dot" className="embedding-l embedding-d21" x="17" y="28" />
      <use href="#embedding-dot" className="embedding-l embedding-d22" x="28" y="28" />
      <use href="#embedding-dot" className="embedding-l embedding-d23" x="39" y="28" />
      <use href="#embedding-dot" className="embedding-l" x="50" y="28" />
      <use href="#embedding-dot" className="embedding-l" x="6" y="39" />
      <use href="#embedding-dot" className="embedding-l embedding-d31" x="17" y="39" />
      <use href="#embedding-dot" className="embedding-l embedding-d32" x="28" y="39" />
      <use href="#embedding-dot" className="embedding-l embedding-d33" x="39" y="39" />
      <use href="#embedding-dot" className="embedding-l" x="50" y="39" />
      <use href="#embedding-dot" className="embedding-l" x="6" y="50" />
      <use href="#embedding-dot" className="embedding-l" x="17" y="50" />
      <use href="#embedding-dot" className="embedding-l" x="28" y="50" />
      <use href="#embedding-dot" className="embedding-l" x="39" y="50" />
      <use href="#embedding-dot" className="embedding-l" x="50" y="50" />
    </svg>
  );
}
