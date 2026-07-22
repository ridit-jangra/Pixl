import type { CSSProperties } from "react";
import type { LoaderProps } from "../types";

const STYLE = `.auth-handshake-l{opacity:0;animation-duration:calc(2000ms / var(--speed, 1));animation-timing-function:linear;animation-iteration-count:infinite;animation-fill-mode:both;}
.auth-handshake-va{animation-name:auth-handshake-k-a;}
.auth-handshake-vmid{animation-name:auth-handshake-k-mid;}
@keyframes auth-handshake-k-a{0%,100%{opacity:0.16}14%{opacity:1}32%{opacity:0.16}}
@keyframes auth-handshake-k-mid{0%,100%{opacity:0.16}14%{opacity:1}32%{opacity:0.16}64%{opacity:1}82%{opacity:0.16}}
@media (prefers-reduced-motion:reduce){.auth-handshake-l{animation:none;opacity:0.5}}
.auth-handshake-d03{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d04{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d13{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d14{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d23{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d24{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d33{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d34{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d43{animation-delay:calc(1000ms / var(--speed, 1))}
.auth-handshake-d44{animation-delay:calc(1000ms / var(--speed, 1))}`;

export function AuthHandshake({
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
      aria-label={ariaLabel ?? "Auth Handshake"}
      className={className}
      style={{ color, "--speed": speed } as CSSProperties}
    >
      <title>Auth Handshake</title>
      <desc>Left and right halves flash and meet in the middle.</desc>
      <defs>
        <circle id="auth-handshake-dot" r="3.1" fill="currentColor" />
      </defs>
      <style>{STYLE}</style>
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="6" y="6" />
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="17" y="6" />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-vmid"
        x="28"
        y="6"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d03"
        x="39"
        y="6"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d04"
        x="50"
        y="6"
      />
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="6" y="17" />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va"
        x="17"
        y="17"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-vmid"
        x="28"
        y="17"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d13"
        x="39"
        y="17"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d14"
        x="50"
        y="17"
      />
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="6" y="28" />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va"
        x="17"
        y="28"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-vmid"
        x="28"
        y="28"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d23"
        x="39"
        y="28"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d24"
        x="50"
        y="28"
      />
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="6" y="39" />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va"
        x="17"
        y="39"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-vmid"
        x="28"
        y="39"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d33"
        x="39"
        y="39"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d34"
        x="50"
        y="39"
      />
      <use href="#auth-handshake-dot" className="auth-handshake-l auth-handshake-va" x="6" y="50" />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va"
        x="17"
        y="50"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-vmid"
        x="28"
        y="50"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d43"
        x="39"
        y="50"
      />
      <use
        href="#auth-handshake-dot"
        className="auth-handshake-l auth-handshake-va auth-handshake-d44"
        x="50"
        y="50"
      />
    </svg>
  );
}
