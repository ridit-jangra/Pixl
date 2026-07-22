import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.heart-pulse-l{opacity:0;animation:heart-pulse-k calc(1600ms / var(--speed, 1)) ease-out infinite both;}
@keyframes heart-pulse-k{0%{opacity:0.16}10%{opacity:1}20%{opacity:0.45}30%{opacity:1}45%{opacity:0.16}100%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.heart-pulse-l{animation:none;opacity:0.5}}`;

export function HeartPulse({
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
      aria-label={ariaLabel ?? "Heart Pulse"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Heart Pulse</title>
      <desc>A heart beats with a double thump.</desc>
      <defs>
        <circle id="heart-pulse-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="17" y="6" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="39" y="6" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="6" y="17" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="17" y="17" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="28" y="17" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="39" y="17" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="50" y="17" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="6" y="28" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="17" y="28" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="28" y="28" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="39" y="28" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="50" y="28" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="17" y="39" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="28" y="39" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="39" y="39" />
      <use href="#heart-pulse-dot" className="heart-pulse-l" x="28" y="50" />
    </svg>
  );
}
