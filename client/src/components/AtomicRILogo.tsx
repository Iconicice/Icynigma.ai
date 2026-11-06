import type { HTMLAttributes } from "react";

interface AtomicRILogoProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * Icynigma.ai Systems [R.I] identity mark.
 * The I, M, and E particles continuously orbit the supplied IME-inspired core.
 */
export function AtomicRILogo({ size = "md", className = "", ...props }: AtomicRILogoProps) {
  return (
    <span
      className={`atomic-ri-logo atomic-ri-logo-${size} ${className}`}
      role="img"
      aria-label="Icynigma.ai Systems Rogue Intelligence IME orbital logo"
      {...props}
    >
      <span className="atomic-ri-logo__halo" aria-hidden="true" />
      <span className="atomic-ri-logo__core" aria-hidden="true">
        <img src="/icynigma-ri-default.png" alt="" />
      </span>
      <span className="atomic-ri-logo__orbit atomic-ri-logo__orbit--one" aria-hidden="true" />
      <span className="atomic-ri-logo__orbit atomic-ri-logo__orbit--two" aria-hidden="true" />
      <span className="atomic-ri-logo__particle atomic-ri-logo__particle--i" aria-hidden="true">I</span>
      <span className="atomic-ri-logo__particle atomic-ri-logo__particle--m" aria-hidden="true">M</span>
      <span className="atomic-ri-logo__particle atomic-ri-logo__particle--e" aria-hidden="true">E</span>
    </span>
  );
}
