import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.cluster-sync-l{opacity:0;animation:cluster-sync-k calc(2400ms / var(--speed, 1)) cubic-bezier(0.215, 0.61, 0.355, 1) infinite both;}
@keyframes cluster-sync-k{0%,100%{opacity:0.16}16%{opacity:1}36%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.cluster-sync-l{animation:none;opacity:0.5}}
.cluster-sync-d03{animation-delay:calc(480ms / var(--speed, 1))}
.cluster-sync-d04{animation-delay:calc(480ms / var(--speed, 1))}
.cluster-sync-d13{animation-delay:calc(480ms / var(--speed, 1))}
.cluster-sync-d14{animation-delay:calc(480ms / var(--speed, 1))}
.cluster-sync-d30{animation-delay:calc(1440ms / var(--speed, 1))}
.cluster-sync-d31{animation-delay:calc(1440ms / var(--speed, 1))}
.cluster-sync-d33{animation-delay:calc(960ms / var(--speed, 1))}
.cluster-sync-d34{animation-delay:calc(960ms / var(--speed, 1))}
.cluster-sync-d40{animation-delay:calc(1440ms / var(--speed, 1))}
.cluster-sync-d41{animation-delay:calc(1440ms / var(--speed, 1))}
.cluster-sync-d43{animation-delay:calc(960ms / var(--speed, 1))}
.cluster-sync-d44{animation-delay:calc(960ms / var(--speed, 1))}`;

export function ClusterSync({
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
      aria-label={ariaLabel ?? "Cluster Sync"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Cluster Sync</title>
      <desc>Quadrants sync in turn around an empty cross.</desc>
      <defs>
        <circle id="cluster-sync-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#cluster-sync-dot" className="cluster-sync-l" x="6" y="6" />
      <use href="#cluster-sync-dot" className="cluster-sync-l" x="17" y="6" />
      <use href="#cluster-sync-dot" x="28" y="6" opacity="0.05" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d03" x="39" y="6" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d04" x="50" y="6" />
      <use href="#cluster-sync-dot" className="cluster-sync-l" x="6" y="17" />
      <use href="#cluster-sync-dot" className="cluster-sync-l" x="17" y="17" />
      <use href="#cluster-sync-dot" x="28" y="17" opacity="0.05" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d13" x="39" y="17" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d14" x="50" y="17" />
      <use href="#cluster-sync-dot" x="6" y="28" opacity="0.05" />
      <use href="#cluster-sync-dot" x="17" y="28" opacity="0.05" />
      <use href="#cluster-sync-dot" x="28" y="28" opacity="0.05" />
      <use href="#cluster-sync-dot" x="39" y="28" opacity="0.05" />
      <use href="#cluster-sync-dot" x="50" y="28" opacity="0.05" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d30" x="6" y="39" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d31" x="17" y="39" />
      <use href="#cluster-sync-dot" x="28" y="39" opacity="0.05" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d33" x="39" y="39" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d34" x="50" y="39" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d40" x="6" y="50" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d41" x="17" y="50" />
      <use href="#cluster-sync-dot" x="28" y="50" opacity="0.05" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d43" x="39" y="50" />
      <use href="#cluster-sync-dot" className="cluster-sync-l cluster-sync-d44" x="50" y="50" />
    </svg>
  );
}
