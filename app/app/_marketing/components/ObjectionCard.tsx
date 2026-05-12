/**
 * ObjectionCard — three-up comparison card for the "Why not ChatGPT?"
 * section. Accepts a title, bullet points, and optional "Structured" badge
 * for the featured variant.
 */

interface ObjectionCardProps {
  title: string;
  items: string[];
  variant?: 'neutral' | 'featured';
  badge?: string;
}

export function ObjectionCard({
  title,
  items,
  variant = 'neutral',
  badge,
}: ObjectionCardProps) {
  const featured = variant === 'featured';
  return (
    <article
      className={`relative flex flex-col gap-4 rounded-lg bg-[color:var(--m-white)] p-5 transition-all duration-200 ease-editorial hover:-translate-y-0.5 ${
        featured
          ? 'border-2 border-[color:var(--m-green)] shadow-[0_8px_24px_-16px_rgba(26,107,74,0.25)]'
          : 'border border-[color:var(--m-border)] hover:border-[color:var(--m-border-mid)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-[14px] font-medium ${
            featured ? 'text-[color:var(--m-black)]' : 'text-[color:var(--m-black)]'
          }`}
        >
          {title}
        </h3>
        {badge ? (
          <span className="shrink-0 rounded-sm bg-[color:var(--m-green-light)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wideish text-[color:var(--m-green-dark)]">
            {badge}
          </span>
        ) : null}
      </div>
      <ul className="flex flex-col divide-y divide-[color:var(--m-border)] text-[12.5px] text-[color:var(--m-muted)]">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 py-2 leading-relaxed">
            <span
              aria-hidden
              className={`mt-[6px] h-1 w-1 shrink-0 rounded-full ${
                featured ? 'bg-[color:var(--m-green)]' : 'bg-[color:var(--m-border-mid)]'
              }`}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
