/**
 * FounderCard — founder signal block with initials avatar, name, bio,
 * and contact email.
 */

interface FounderCardProps {
  name: string;
  initials: string;
  bio: string;
  email: string;
  link?: { label: string; href: string };
}

export function FounderCard({ name, initials, bio, email, link }: FounderCardProps) {
  return (
    <div className="flex items-start gap-5 rounded-xl border border-[color:var(--m-border-mid)] bg-[color:var(--m-white)] p-6">
      <div
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[color:var(--m-green-light)] font-serif text-[18px] font-semibold text-[color:var(--m-green-dark)]"
      >
        {initials}
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-medium text-[color:var(--m-black)]">{name}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--m-muted)]">{bio}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] text-[color:var(--m-green)]">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1 hover:text-[color:var(--m-green-dark)] hover:underline underline-offset-4"
          >
            {email}
          </a>
          {link ? (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-[color:var(--m-green-dark)] hover:underline underline-offset-4"
            >
              {link.label} ↗
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
