import type { ReactNode } from 'react';

interface TextHeroProps {
  eyebrow: string;
  title: string;
  lede: string;
}

export function TextHero({ eyebrow, title, lede }: TextHeroProps) {
  return (
    <section className="mx-auto max-w-site px-6 pb-10 pt-16 md:px-8 md:pb-14 md:pt-24">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-[36px] font-semibold leading-[1.08] text-[color:var(--m-black)] md:text-[52px]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[color:var(--m-muted)] md:text-[18px]">
          {lede}
        </p>
      </div>
    </section>
  );
}

interface TextSectionProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function TextSection({ eyebrow, title, children }: TextSectionProps) {
  return (
    <section className="border-t border-[color:var(--m-border)] py-9">
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-[26px] font-semibold leading-tight text-[color:var(--m-black)]">
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-8 text-[color:var(--m-muted)]">{children}</div>
    </section>
  );
}

export function TextPageBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl px-6 pb-24 md:px-8">{children}</div>;
}

export function TextList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3 pl-5 marker:text-[color:var(--m-green)]">{children}</ul>;
}

