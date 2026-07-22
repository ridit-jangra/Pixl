import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.rate-limit-l{opacity:0;animation:rate-limit-k calc(2400ms / var(--speed, 1)) steps(1, end) infinite both;}
@keyframes rate-limit-k{0%,18%{opacity:0.16}22%{opacity:1}60%{opacity:1}64%{opacity:0.16}100%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.rate-limit-l{animation:none;opacity:0.5}}
.rate-limit-d21{animation-delay:calc(200ms / var(--speed, 1))}
.rate-limit-d22{animation-delay:calc(400ms / var(--speed, 1))}
.rate-limit-d23{animation-delay:calc(600ms / var(--speed, 1))}
.rate-limit-d24{animation-delay:calc(800ms / var(--speed, 1))}`;

export function RateLimit({
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
      aria-label={ariaLabel ?? "Rate Limit"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Rate Limit</title>
      <desc>The middle row gates through in bursts.</desc>
      <defs>
        <circle id="rate-limit-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#rate-limit-dot" x="6" y="6" opacity="0.06" />
      <use href="#rate-limit-dot" x="17" y="6" opacity="0.06" />
      <use href="#rate-limit-dot" x="28" y="6" opacity="0.06" />
      <use href="#rate-limit-dot" x="39" y="6" opacity="0.06" />
      <use href="#rate-limit-dot" x="50" y="6" opacity="0.06" />
      <use href="#rate-limit-dot" x="6" y="17" opacity="0.06" />
      <use href="#rate-limit-dot" x="17" y="17" opacity="0.06" />
      <use href="#rate-limit-dot" x="28" y="17" opacity="0.06" />
      <use href="#rate-limit-dot" x="39" y="17" opacity="0.06" />
      <use href="#rate-limit-dot" x="50" y="17" opacity="0.06" />
      <use href="#rate-limit-dot" className="rate-limit-l" x="6" y="28" />
      <use href="#rate-limit-dot" className="rate-limit-l rate-limit-d21" x="17" y="28" />
      <use href="#rate-limit-dot" className="rate-limit-l rate-limit-d22" x="28" y="28" />
      <use href="#rate-limit-dot" className="rate-limit-l rate-limit-d23" x="39" y="28" />
      <use href="#rate-limit-dot" className="rate-limit-l rate-limit-d24" x="50" y="28" />
      <use href="#rate-limit-dot" x="6" y="39" opacity="0.06" />
      <use href="#rate-limit-dot" x="17" y="39" opacity="0.06" />
      <use href="#rate-limit-dot" x="28" y="39" opacity="0.06" />
      <use href="#rate-limit-dot" x="39" y="39" opacity="0.06" />
      <use href="#rate-limit-dot" x="50" y="39" opacity="0.06" />
      <use href="#rate-limit-dot" x="6" y="50" opacity="0.06" />
      <use href="#rate-limit-dot" x="17" y="50" opacity="0.06" />
      <use href="#rate-limit-dot" x="28" y="50" opacity="0.06" />
      <use href="#rate-limit-dot" x="39" y="50" opacity="0.06" />
      <use href="#rate-limit-dot" x="50" y="50" opacity="0.06" />
    </svg>
  );
}
