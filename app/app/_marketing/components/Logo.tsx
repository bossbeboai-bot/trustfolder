/**
 * TrustFolder brand lockup.
 *
 * Swap the SVG below (or replace /public/logo-trustfolder.svg) to update
 * the mark everywhere — nav, footer, favicon, and OG tags.
 */

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 28, withWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
      {withWordmark ? (
        <span
          className="font-serif text-[1.125rem] font-semibold tracking-tightish text-[color:var(--m-black)]"
        >
          TrustFolder
        </span>
      ) : null}
    </span>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="TrustFolder logo"
    >
      <defs>
        <linearGradient id="tf-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6DD5C9" />
          <stop offset="100%" stopColor="#55BCAF" />
        </linearGradient>
        <linearGradient id="tf-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0C2557" />
        </linearGradient>
      </defs>
      <rect x="5" y="12" width="40" height="38" rx="5" fill="url(#tf-navy)" />
      <rect x="11" y="16" width="40" height="38" rx="5" fill="url(#tf-mint)" />
      <rect x="17" y="20" width="40" height="38" rx="5" fill="url(#tf-navy)" />
      <path
        d="M26 39.5 L32.5 46 L48 30"
        stroke="#FAFAF8"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
