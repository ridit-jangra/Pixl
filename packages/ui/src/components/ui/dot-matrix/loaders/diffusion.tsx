import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.diffusion-l{opacity:0;animation-duration:calc(3000ms / var(--speed, 1));animation-timing-function:cubic-bezier(0.45, 0.05, 0.55, 0.95);animation-iteration-count:infinite;animation-fill-mode:both;}
.diffusion-v1{animation-name:diffusion-k-1;}
.diffusion-v2{animation-name:diffusion-k-2;}
.diffusion-v3{animation-name:diffusion-k-3;}
.diffusion-v4{animation-name:diffusion-k-4;}
@keyframes diffusion-k-1{0%,100%{opacity:0.16}10%{opacity:0.45}22%{opacity:0.16}38%{opacity:0.7}50%{opacity:0.16}64%{opacity:0.5}78%{opacity:1}88%{opacity:1}93%{opacity:0.16}}
@keyframes diffusion-k-2{0%,100%{opacity:0.16}8%{opacity:0.6}20%{opacity:0.16}30%{opacity:0.35}44%{opacity:0.7}58%{opacity:0.16}70%{opacity:0.45}78%{opacity:1}88%{opacity:1}93%{opacity:0.16}}
@keyframes diffusion-k-3{0%,100%{opacity:0.16}14%{opacity:0.5}26%{opacity:0.16}40%{opacity:0.6}52%{opacity:0.3}66%{opacity:0.16}74%{opacity:0.85}78%{opacity:1}88%{opacity:1}93%{opacity:0.16}}
@keyframes diffusion-k-4{0%,100%{opacity:0.16}6%{opacity:0.3}18%{opacity:0.7}32%{opacity:0.16}48%{opacity:0.55}60%{opacity:0.25}72%{opacity:0.6}78%{opacity:1}88%{opacity:1}93%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.diffusion-l{animation:none;opacity:0.5}}`;

export function Diffusion({
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
      aria-label={ariaLabel ?? "Diffusion"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Diffusion</title>
      <desc>Noise resolves into a steady signal.</desc>
      <defs>
        <circle id="diffusion-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#diffusion-dot" className="diffusion-l diffusion-v1" x="6" y="6" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="17" y="6" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="28" y="6" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="39" y="6" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="50" y="6" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v4" x="6" y="17" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v4" x="17" y="17" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v1" x="28" y="17" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="39" y="17" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="50" y="17" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="6" y="28" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v4" x="17" y="28" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="28" y="28" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="39" y="28" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="50" y="28" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v1" x="6" y="39" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v4" x="17" y="39" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="28" y="39" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v1" x="39" y="39" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v2" x="50" y="39" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="6" y="50" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v4" x="17" y="50" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="28" y="50" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v3" x="39" y="50" />
      <use href="#diffusion-dot" className="diffusion-l diffusion-v1" x="50" y="50" />
    </svg>
  );
}
