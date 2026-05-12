/**
 * Buyer Review Packet — Phase 8 batch 5.
 *
 * Builds a cleaner, buyer-facing summary export that lives INSIDE the
 * delivered ZIP (and is surfaced on the dashboard). NOT a hosted public
 * trust center. Markdown is the source of truth; the HTML version is a
 * stand-alone printable file the customer can save as PDF from a browser.
 *
 * Hard rules:
 *  - No legal advice, no certification, no compliance guarantee.
 *  - No "audit-proof", "fully compliant", "certified", "no lawyer needed".
 *  - Always carries the standard disclaimer footer.
 */

import type { GeneratedDoc, Tier } from './lib/types.js';
import type { OpenReviewItem } from './open-review-items.js';
import type { ReadinessScore } from './readiness-score.js';
import { tierLabel } from './paypal.js';

export interface BuyerReviewPacketInput {
  company_name: string;
  generation_date: string;
  tier: Tier;
  docs: GeneratedDoc[];
  readiness: ReadinessScore | null;
  open_items: OpenReviewItem[];
  support_email: string;
}

export interface BuyerReviewPacketOutput {
  markdown: string;
  html: string;
}

export function buildBuyerReviewPacket(input: BuyerReviewPacketInput): BuyerReviewPacketOutput {
  const md = renderMarkdown(input);
  const html = renderHtml(input, md);
  return { markdown: md, html };
}

function renderMarkdown(input: BuyerReviewPacketInput): string {
  const t = tierLabel(input.tier);
  const summary = summariseDocs(input.docs);
  const readiness = input.readiness;
  const items = input.open_items;

  return `# Buyer Review Packet — ${input.company_name}

Prepared: ${input.generation_date}
Pack: ${t}

---

## What this packet is

This packet is prepared for buyer / internal / legal review. It summarises
the AI use, the disclosure surface, the source/evidence references, and the
open review items that came out of the TrustFolder pack.

This is not legal advice. Not certification. Not a compliance guarantee.

## AI documentation readiness score

${readiness ? renderReadinessBlock(readiness) : '_(no readiness score available)_'}

## AI use summary (from the pack)

${summary.useSummary}

## Disclosure summary (from the pack)

${summary.disclosureSummary}

## Source / evidence summary

${summary.evidenceSummary}

## Confidence band

${summary.confidenceSummary}

## Open review items

${
  items.length > 0
    ? items
        .map((i) => `- **[${i.priority}] ${i.title}** — ${i.why}`)
        .join('\n')
    : '_(none flagged)_'
}

## Legal review note

Have qualified counsel review legal-impact drafts (disclosure, governance
policy, lawyer handoff) before publishing or sharing externally.

## Contact / support

Questions about this packet? Email ${input.support_email}.

---

## Disclaimer

TrustFolder prepares review-ready AI governance and disclosure readiness
drafts. It is not legal advice. Not certification. Not a compliance
guarantee. Final decisions belong with qualified counsel and your team.
`;
}

function renderHtml(input: BuyerReviewPacketInput, _md: string): string {
  // Minimal printable HTML. The customer can "Print to PDF" from any browser.
  const safe = (s: string) => s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
  const t = tierLabel(input.tier);
  const readiness = input.readiness;
  const items = input.open_items;
  const summary = summariseDocs(input.docs);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Buyer Review Packet — ${safe(input.company_name)}</title>
<style>
  :root { --ink: #07111f; --slate: #4d5a70; --soft: #8a93a4; --bg: #fbfaf6; --accent: #8a6a3b; --border: #e3dccc; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 2.2rem 2.4rem; background: var(--bg); color: var(--ink); font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif; max-width: 880px; margin: auto; }
  h1 { font-size: 32px; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
  h2 { font-size: 20px; margin: 2rem 0 0.8rem; letter-spacing: -0.01em; }
  h3 { font-size: 16px; margin: 1.4rem 0 0.4rem; }
  p, li { color: var(--slate); }
  .meta { color: var(--soft); font-size: 13px; margin-bottom: 1.4rem; }
  .panel { border: 1px solid var(--border); border-radius: 14px; padding: 1.1rem 1.2rem; background: white; }
  .score-row { display: flex; align-items: baseline; gap: 1rem; }
  .score-num { font-size: 42px; font-weight: 600; color: var(--ink); }
  .score-band { font-size: 14px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.18em; }
  .dim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 0.8rem; }
  .dim { border-top: 1px solid var(--border); padding-top: 0.5rem; }
  .dim-label { font-size: 13px; color: var(--ink); font-weight: 600; }
  .dim-score { font-size: 13px; color: var(--accent); }
  .dim-rationale { font-size: 12px; color: var(--slate); }
  .priority-high { color: #8c2e2e; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.14em; }
  .priority-medium { color: #8c6c2e; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.14em; }
  .priority-low { color: #4d5a70; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.14em; }
  .disclaimer { font-size: 12px; color: var(--soft); border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 2.4rem; }
  @media print { body { background: white; padding: 0.8in; } .panel { box-shadow: none; } }
</style>
</head>
<body>
  <h1>Buyer Review Packet — ${safe(input.company_name)}</h1>
  <div class="meta">Prepared ${safe(input.generation_date)} · ${safe(t)}</div>

  <h2>What this packet is</h2>
  <p>This packet is prepared for buyer / internal / legal review. It is not legal advice, not certification, and not a compliance guarantee.</p>

  <h2>AI documentation readiness score</h2>
  ${readiness ? renderReadinessHtml(readiness, safe) : '<p>(no readiness score)</p>'}

  <h2>AI use summary</h2>
  <div class="panel"><p>${safe(summary.useSummary)}</p></div>

  <h2>Disclosure summary</h2>
  <div class="panel"><p>${safe(summary.disclosureSummary)}</p></div>

  <h2>Source / evidence summary</h2>
  <div class="panel"><p>${safe(summary.evidenceSummary)}</p></div>

  <h2>Confidence band</h2>
  <div class="panel"><p>${safe(summary.confidenceSummary)}</p></div>

  <h2>Open review items</h2>
  ${
    items.length === 0
      ? '<p>(none flagged)</p>'
      : `<ul>${items
          .map(
            (i) =>
              `<li><span class="priority-${i.priority}">${i.priority}</span> &middot; <strong>${safe(i.title)}</strong> — ${safe(i.why)}</li>`,
          )
          .join('\n')}</ul>`
  }

  <h2>Legal review note</h2>
  <p>Have qualified counsel review legal-impact drafts before publishing or sharing externally.</p>

  <h2>Contact / support</h2>
  <p>Questions? Email ${safe(input.support_email)}.</p>

  <div class="disclaimer">TrustFolder prepares review-ready AI governance and disclosure readiness drafts. Not legal advice. Not certification. Not a compliance guarantee.</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderReadinessBlock(r: ReadinessScore): string {
  const dimLines = r.dimensions
    .map((d) => `- **${d.label}** — ${d.score}/100. ${d.rationale}`)
    .join('\n');
  return `- **Overall:** ${r.overall}/100 — ${r.band_label}
- **Recommended next step:** ${r.recommended_next_step}

${dimLines}

> ${r.disclaimer}`;
}

function renderReadinessHtml(r: ReadinessScore, safe: (s: string) => string): string {
  const dims = r.dimensions
    .map(
      (d) =>
        `<div class="dim"><div class="dim-label">${safe(d.label)}</div><div class="dim-score">${d.score}/100</div><div class="dim-rationale">${safe(d.rationale)}</div></div>`,
    )
    .join('');
  return `<div class="panel"><div class="score-row"><div class="score-num">${r.overall}</div><div class="score-band">${safe(r.band_label)}</div></div><p>${safe(r.recommended_next_step)}</p><div class="dim-grid">${dims}</div><p class="disclaimer">${safe(r.disclaimer)}</p></div>`;
}

function summariseDocs(docs: GeneratedDoc[]): {
  useSummary: string;
  disclosureSummary: string;
  evidenceSummary: string;
  confidenceSummary: string;
} {
  const disclosures = docs.filter((d) => d.template_id.startsWith('t1-'));
  const governance = docs.filter((d) => d.template_id.startsWith('t2-'));
  const allCitations = Array.from(new Set(docs.flatMap((d) => d.citations))).sort();
  const counts: Record<string, number> = {};
  for (const d of docs) {
    const k = d.confidence_band ?? 'UNKNOWN';
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const conf = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k} x ${v}`)
    .join(' / ');

  return {
    useSummary: `${docs.length} document(s) generated, including ${governance.length} governance and ${disclosures.length} disclosure draft(s). See the AI use summary inside the pack for the full description.`,
    disclosureSummary: disclosures.length > 0
      ? `${disclosures.length} disclosure draft(s) included. See the disclosures folder in the pack for the full text.`
      : 'No disclosure drafts in this pack tier.',
    evidenceSummary: allCitations.length > 0
      ? `${allCitations.length} citation(s) recorded across the pack. See sources-and-notes for the full list.`
      : 'Citations are thin for this pack — confirm key facts with your team.',
    confidenceSummary: conf || '(no documents)',
  };
}
