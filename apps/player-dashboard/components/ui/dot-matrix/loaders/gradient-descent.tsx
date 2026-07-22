import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.gradient-descent-l{opacity:0;animation:gradient-descent-k calc(2400ms / var(--speed, 1)) cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite both;}
@keyframes gradient-descent-k{0%,100%{opacity:0.16}16%{opacity:1}32%{opacity:0.45}48%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.gradient-descent-l{animation:none;opacity:0.5}}
.gradient-descent-d10{animation-delay:calc(320ms / var(--speed, 1))}
.gradient-descent-d11{animation-delay:calc(320ms / var(--speed, 1))}
.gradient-descent-d12{animation-delay:calc(320ms / var(--speed, 1))}
.gradient-descent-d13{animation-delay:calc(320ms / var(--speed, 1))}
.gradient-descent-d14{animation-delay:calc(320ms / var(--speed, 1))}
.gradient-descent-d20{animation-delay:calc(640ms / var(--speed, 1))}
.gradient-descent-d21{animation-delay:calc(640ms / var(--speed, 1))}
.gradient-descent-d22{animation-delay:calc(640ms / var(--speed, 1))}
.gradient-descent-d23{animation-delay:calc(640ms / var(--speed, 1))}
.gradient-descent-d24{animation-delay:calc(640ms / var(--speed, 1))}
.gradient-descent-d30{animation-delay:calc(960ms / var(--speed, 1))}
.gradient-descent-d31{animation-delay:calc(960ms / var(--speed, 1))}
.gradient-descent-d32{animation-delay:calc(960ms / var(--speed, 1))}
.gradient-descent-d33{animation-delay:calc(960ms / var(--speed, 1))}
.gradient-descent-d34{animation-delay:calc(960ms / var(--speed, 1))}
.gradient-descent-d40{animation-delay:calc(1280ms / var(--speed, 1))}
.gradient-descent-d41{animation-delay:calc(1280ms / var(--speed, 1))}
.gradient-descent-d42{animation-delay:calc(1280ms / var(--speed, 1))}
.gradient-descent-d43{animation-delay:calc(1280ms / var(--speed, 1))}
.gradient-descent-d44{animation-delay:calc(1280ms / var(--speed, 1))}`;

export function GradientDescent({
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
      aria-label={ariaLabel ?? "Gradient Descent"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Gradient Descent</title>
      <desc>Rows descend, fading as they settle.</desc>
      <defs>
        <circle id="gradient-descent-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#gradient-descent-dot" className="gradient-descent-l" x="6" y="6" />
      <use href="#gradient-descent-dot" className="gradient-descent-l" x="17" y="6" />
      <use href="#gradient-descent-dot" className="gradient-descent-l" x="28" y="6" />
      <use href="#gradient-descent-dot" className="gradient-descent-l" x="39" y="6" />
      <use href="#gradient-descent-dot" className="gradient-descent-l" x="50" y="6" />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d10"
        x="6"
        y="17"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d11"
        x="17"
        y="17"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d12"
        x="28"
        y="17"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d13"
        x="39"
        y="17"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d14"
        x="50"
        y="17"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d20"
        x="6"
        y="28"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d21"
        x="17"
        y="28"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d22"
        x="28"
        y="28"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d23"
        x="39"
        y="28"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d24"
        x="50"
        y="28"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d30"
        x="6"
        y="39"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d31"
        x="17"
        y="39"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d32"
        x="28"
        y="39"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d33"
        x="39"
        y="39"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d34"
        x="50"
        y="39"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d40"
        x="6"
        y="50"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d41"
        x="17"
        y="50"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d42"
        x="28"
        y="50"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d43"
        x="39"
        y="50"
      />
      <use
        href="#gradient-descent-dot"
        className="gradient-descent-l gradient-descent-d44"
        x="50"
        y="50"
      />
    </svg>
  );
}
