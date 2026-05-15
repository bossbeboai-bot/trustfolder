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
    <img
      src="/logo-trustfolder-mark-transparent.png"
      width={size}
      height={size}
      alt="TrustFolder logo"
      className="block rounded-[6px] object-contain"
    />
  );
}
