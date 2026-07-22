import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.orbit-l{opacity:0;animation:orbit-k calc(2000ms / var(--speed, 1)) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both;}
@keyframes orbit-k{0%,100%{opacity:0.1}40%{opacity:1}60%{opacity:0.1}}
@media (prefers-reduced-motion:reduce){.orbit-l{animation:none;opacity:0.5}}
.orbit-d20{animation-delay:calc(-1500ms / var(--speed, 1))}
.orbit-d24{animation-delay:calc(-500ms / var(--speed, 1))}
.orbit-d42{animation-delay:calc(-1000ms / var(--speed, 1))}`;

export function Orbit({
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
      aria-label={ariaLabel ?? "Orbit"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Orbit</title>
      <desc>A dot circles the perimeter.</desc>
      <defs>
        <circle id="orbit-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#orbit-dot" x="6" y="6" opacity="0.05" />
      <use href="#orbit-dot" x="17" y="6" opacity="0.05" />
      <use href="#orbit-dot" className="orbit-l" x="28" y="6" />
      <use href="#orbit-dot" x="39" y="6" opacity="0.05" />
      <use href="#orbit-dot" x="50" y="6" opacity="0.05" />
      <use href="#orbit-dot" x="6" y="17" opacity="0.05" />
      <use href="#orbit-dot" x="17" y="17" opacity="0.05" />
      <use href="#orbit-dot" x="28" y="17" opacity="0.05" />
      <use href="#orbit-dot" x="39" y="17" opacity="0.05" />
      <use href="#orbit-dot" x="50" y="17" opacity="0.05" />
      <use href="#orbit-dot" className="orbit-l orbit-d20" x="6" y="28" />
      <use href="#orbit-dot" x="17" y="28" opacity="0.05" />
      <use href="#orbit-dot" x="28" y="28" opacity="0.05" />
      <use href="#orbit-dot" x="39" y="28" opacity="0.05" />
      <use href="#orbit-dot" className="orbit-l orbit-d24" x="50" y="28" />
      <use href="#orbit-dot" x="6" y="39" opacity="0.05" />
      <use href="#orbit-dot" x="17" y="39" opacity="0.05" />
      <use href="#orbit-dot" x="28" y="39" opacity="0.05" />
      <use href="#orbit-dot" x="39" y="39" opacity="0.05" />
      <use href="#orbit-dot" x="50" y="39" opacity="0.05" />
      <use href="#orbit-dot" x="6" y="50" opacity="0.05" />
      <use href="#orbit-dot" x="17" y="50" opacity="0.05" />
      <use href="#orbit-dot" className="orbit-l orbit-d42" x="28" y="50" />
      <use href="#orbit-dot" x="39" y="50" opacity="0.05" />
      <use href="#orbit-dot" x="50" y="50" opacity="0.05" />
    </svg>
  );
}
