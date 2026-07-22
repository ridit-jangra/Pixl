import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.quantize-l{opacity:0;animation:quantize-k calc(3000ms / var(--speed, 1)) steps(1, end) infinite both;}
@keyframes quantize-k{0%,30%{opacity:0.16}35%{opacity:1}82%{opacity:1}88%{opacity:0.16}100%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.quantize-l{animation:none;opacity:0.5}}
.quantize-d00{animation-delay:calc(42ms / var(--speed, 1))}
.quantize-d01{animation-delay:calc(390ms / var(--speed, 1))}
.quantize-d02{animation-delay:calc(296ms / var(--speed, 1))}
.quantize-d03{animation-delay:calc(274ms / var(--speed, 1))}
.quantize-d04{animation-delay:calc(362ms / var(--speed, 1))}
.quantize-d10{animation-delay:calc(578ms / var(--speed, 1))}
.quantize-d11{animation-delay:calc(566ms / var(--speed, 1))}
.quantize-d12{animation-delay:calc(129ms / var(--speed, 1))}
.quantize-d13{animation-delay:calc(344ms / var(--speed, 1))}
.quantize-d14{animation-delay:calc(353ms / var(--speed, 1))}
.quantize-d20{animation-delay:calc(422ms / var(--speed, 1))}
.quantize-d21{animation-delay:calc(557ms / var(--speed, 1))}
.quantize-d22{animation-delay:calc(208ms / var(--speed, 1))}
.quantize-d23{animation-delay:calc(207ms / var(--speed, 1))}
.quantize-d24{animation-delay:calc(288ms / var(--speed, 1))}
.quantize-d30{animation-delay:calc(82ms / var(--speed, 1))}
.quantize-d31{animation-delay:calc(535ms / var(--speed, 1))}
.quantize-d32{animation-delay:calc(360ms / var(--speed, 1))}
.quantize-d33{animation-delay:calc(124ms / var(--speed, 1))}
.quantize-d34{animation-delay:calc(274ms / var(--speed, 1))}
.quantize-d40{animation-delay:calc(343ms / var(--speed, 1))}
.quantize-d41{animation-delay:calc(586ms / var(--speed, 1))}
.quantize-d42{animation-delay:calc(337ms / var(--speed, 1))}
.quantize-d43{animation-delay:calc(392ms / var(--speed, 1))}
.quantize-d44{animation-delay:calc(121ms / var(--speed, 1))}`;

export function Quantize({
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
      aria-label={ariaLabel ?? "Quantize"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Quantize</title>
      <desc>Cells snap between levels in steps.</desc>
      <defs>
        <circle id="quantize-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#quantize-dot" className="quantize-l quantize-d00" x="6" y="6" />
      <use href="#quantize-dot" className="quantize-l quantize-d01" x="17" y="6" />
      <use href="#quantize-dot" className="quantize-l quantize-d02" x="28" y="6" />
      <use href="#quantize-dot" className="quantize-l quantize-d03" x="39" y="6" />
      <use href="#quantize-dot" className="quantize-l quantize-d04" x="50" y="6" />
      <use href="#quantize-dot" className="quantize-l quantize-d10" x="6" y="17" />
      <use href="#quantize-dot" className="quantize-l quantize-d11" x="17" y="17" />
      <use href="#quantize-dot" className="quantize-l quantize-d12" x="28" y="17" />
      <use href="#quantize-dot" className="quantize-l quantize-d13" x="39" y="17" />
      <use href="#quantize-dot" className="quantize-l quantize-d14" x="50" y="17" />
      <use href="#quantize-dot" className="quantize-l quantize-d20" x="6" y="28" />
      <use href="#quantize-dot" className="quantize-l quantize-d21" x="17" y="28" />
      <use href="#quantize-dot" className="quantize-l quantize-d22" x="28" y="28" />
      <use href="#quantize-dot" className="quantize-l quantize-d23" x="39" y="28" />
      <use href="#quantize-dot" className="quantize-l quantize-d24" x="50" y="28" />
      <use href="#quantize-dot" className="quantize-l quantize-d30" x="6" y="39" />
      <use href="#quantize-dot" className="quantize-l quantize-d31" x="17" y="39" />
      <use href="#quantize-dot" className="quantize-l quantize-d32" x="28" y="39" />
      <use href="#quantize-dot" className="quantize-l quantize-d33" x="39" y="39" />
      <use href="#quantize-dot" className="quantize-l quantize-d34" x="50" y="39" />
      <use href="#quantize-dot" className="quantize-l quantize-d40" x="6" y="50" />
      <use href="#quantize-dot" className="quantize-l quantize-d41" x="17" y="50" />
      <use href="#quantize-dot" className="quantize-l quantize-d42" x="28" y="50" />
      <use href="#quantize-dot" className="quantize-l quantize-d43" x="39" y="50" />
      <use href="#quantize-dot" className="quantize-l quantize-d44" x="50" y="50" />
    </svg>
  );
}
