'use client';

/**
 * Shared buyer-review artifact explainer. Keep this component plain-language:
 * it is used where founders need to understand what they actually get.
 */

const DOCUMENTS = [
  {
    title: 'AI disclosure draft',
    what: 'Plain-language user-facing disclosure text for AI-assisted features.',
    why: 'Helps buyer and legal teams see how users are informed when AI is involved.',
    where: 'Product UI, trust page, help center, or legal-review packet.',
  },
  {
    title: 'AI use summary',
    what: 'A short explanation of what the AI feature does, who uses it, and where output appears.',
    why: 'Gives reviewers one clean product-context page before they read detailed notes.',
    where: 'Buyer packet cover, vendor intake answers, and internal review.',
  },
  {
    title: 'Governance summary',
    what: 'A structured summary of ownership, review cadence, human oversight, and escalation.',
    why: 'Shows the product is not being described as a black box.',
    where: 'Governance folder and counsel handoff.',
  },
  {
    title: 'Evidence tracker',
    what: 'A table linking each claim to your website, intake answers, or review notes.',
    why: 'Makes the pack checkable instead of just persuasive.',
    where: 'Evidence folder, buyer review, and internal cleanup.',
  },
  {
    title: 'Source notes',
    what: 'A scan log of source pages, timestamps, citations, and confidence flags.',
    why: 'Lets reviewers trace where the draft language came from.',
    where: 'Manifest, sources-and-notes file, and buyer packet appendix.',
  },
  {
    title: 'Buyer/legal handoff',
    what: 'A cover sheet that orients counsel or procurement to the pack.',
    why: 'Reduces the "what am I looking at?" tax during review.',
    where: 'Buyer review packet and legal handoff folder.',
  },
  {
    title: 'Open review items',
    what: 'A list of claims, gaps, or sensitive points that still need human review.',
    why: 'Builds trust by naming uncertainty instead of hiding it.',
    where: 'Open-review file, README, and buyer packet.',
  },
  {
    title: 'Readiness roadmap',
    what: 'A practical 30-day list of fixes, reviews, and disclosure updates.',
    why: 'Turns review gaps into next actions your team can assign.',
    where: 'Next-steps roadmap and dashboard follow-up.',
  },
  {
    title: 'Buyer review packet',
    what: 'A printable HTML/markdown overview combining score, scope, docs, and open items.',
    why: 'Gives buyers and lawyers a single starting point.',
    where: 'Pack download and sample packet page.',
  },
] as const;

export function DocumentDictionary({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? '' : 'mx-auto max-w-site px-6 py-16 md:px-8 md:py-24'}>
      <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-[color:var(--m-subtle)]">
            Document dictionary
          </p>
          <h2 className="mt-3 max-w-[12ch] font-serif text-[30px] font-semibold leading-tight text-[color:var(--m-black)] md:text-[38px]">
            What each artifact is for.
          </h2>
          <p className="mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-[color:var(--m-muted)]">
            TrustFolder is not a generic template bundle. Each artifact has a job in the buyer-review conversation.
          </p>
        </div>
        <div className="grid gap-3">
          {DOCUMENTS.map((doc) => (
            <article
              key={doc.title}
              className="grid gap-3 rounded-xl border border-[color:var(--m-border)] bg-[color:var(--m-white)] p-4 md:grid-cols-[0.7fr_1.3fr]"
            >
              <div>
                <p className="font-serif text-[18px] font-semibold leading-tight text-[color:var(--m-black)]">
                  {doc.title}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wideish text-[color:var(--m-subtle)]">
                  {doc.where}
                </p>
              </div>
              <div className="grid gap-2 text-[13px] leading-relaxed text-[color:var(--m-muted)]">
                <p>
                  <span className="font-medium text-[color:var(--m-black)]">What it is: </span>
                  {doc.what}
                </p>
                <p>
                  <span className="font-medium text-[color:var(--m-black)]">Why it matters: </span>
                  {doc.why}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
