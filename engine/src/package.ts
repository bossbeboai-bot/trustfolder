/**
 * Pack packager.
 *
 * Takes the QA-passed generated docs, builds a ZIP file with a tier-specific
 * folder structure + a customer-facing README, uploads to Supabase Storage,
 * and returns a signed download URL.
 *
 * Tier-specific layouts (per `docs/10` §10):
 *
 * tier_2 — Article 50 Disclosure Pack ($499)
 *   TrustFolder-Disclosure-Pack/
 *   ├── README.md
 *   ├── disclosures/
 *   │   ├── 01-chatbot-disclosure.md
 *   │   ├── 02-ai-content-labeling.md
 *   │   └── …
 *   ├── placement-guide.md          (extracted from t1-06-ai-system-disclosure-page)
 *   └── legal-review-note.md         (1-page handoff note)
 *
 * tier_3 — Full AI Governance Evidence Folder ($999)
 *   TrustFolder-Pack/
 *   ├── README.md
 *   ├── 01-disclosures/              (Tier 2 disclosures bundled in)
 *   ├── 02-governance/               (inventory, policy, oversight)
 *   ├── 03-evidence/                 (ISO checklist, evidence tracker)
 *   ├── 04-buyer-legal-handoff/     (lawyer brief, role memo, classification memo)
 *   ├── next-steps-roadmap.md
 *   └── sources-and-notes.md
 *
 * tier_1 (Lite Readiness Snapshot) is delivered as a single .md/.pdf via
 * `snapshot.ts` — it does NOT pass through this packager.
 */

import JSZip from 'jszip';
import { service, dbError } from './lib/supabase.js';
import { env } from './lib/env.js';
import { tierLabel } from './paypal.js';
import type {
  ExtractionData,
  GeneratedDoc,
  PackagedPack,
  QuestionnaireAnswers,
  Result,
  ScopeCheckResult,
  Tier,
} from './lib/types.js';
import { computeReadinessScore, type ReadinessScore } from './readiness-score.js';
import {
  buildOpenReviewItems,
  renderOpenReviewItemsMarkdown,
  type OpenReviewItem,
} from './open-review-items.js';
import { buildBuyerReviewPacket } from './buyer-review-packet.js';

const SIGNED_URL_TTL = 7 * 24 * 60 * 60; // 7 days, can be overridden via env

// =============================================================================
// Public API
// =============================================================================

export interface PackageInput {
  order_id: string;
  email: string;
  tier: Tier;
  docs: GeneratedDoc[];
  /** Generation context summary for the README header. */
  company_name: string;
  generation_date: string; // YYYY-MM-DD
  /** Phase 8 readiness inputs. Optional — if absent, no readiness score is included. */
  extraction?: ExtractionData | null;
  answers?: QuestionnaireAnswers | null;
  scope?: Pick<ScopeCheckResult, 'in_scope' | 'band'> | null;
  /** Support email surfaced in the buyer-review packet. */
  support_email?: string;
}

export async function buildPack(input: PackageInput): Promise<Result<PackagedPack>> {
  const okDocs = input.docs.filter((d) => d.ok && d.content_md.length > 0);
  if (okDocs.length === 0) {
    return { ok: false, error: 'no_ok_docs' };
  }

  if (input.tier === 'tier_1') {
    return {
      ok: false,
      error:
        'tier_1_uses_snapshot_module: snapshot is delivered as a single .md/.pdf via deliver.ts, not via this packager',
    };
  }
  if (input.tier === 'tier_0' || input.tier === 'tier_4') {
    return { ok: false, error: `tier_not_packaged:${input.tier}` };
  }

  // Phase 8 — readiness score + open review items + buyer review packet.
  // Each is optional: if the caller did not pass intake data, they no-op.
  const totalCitations = okDocs.reduce((n, d) => n + d.citations.length, 0);
  const readiness: ReadinessScore | null =
    input.extraction && input.answers
      ? computeReadinessScore({
          extraction: input.extraction,
          answers: input.answers,
          scope: input.scope ?? null,
          citations_count: totalCitations,
        })
      : null;
  const openItems: OpenReviewItem[] = input.extraction && input.answers
    ? buildOpenReviewItems({
        extraction: input.extraction,
        answers: input.answers,
        scope: input.scope ?? null,
        tier: input.tier,
      })
    : [];

  const zip = new JSZip();

  // Customer-facing top-level README
  zip.file('README.md', renderTopReadme(input, okDocs, readiness, openItems));

  // Layout depends on tier
  if (input.tier === 'tier_2') {
    // Tier 2 — Article 50 Disclosure Pack: flat disclosures folder + placement guide + legal note
    for (const doc of okDocs) {
      if (doc.template_id === 't1-06-ai-system-disclosure-page') {
        zip.file('placement-guide.md', doc.content_md);
      } else if (doc.template_id === 't1-07-ai-usage-policy-summary') {
        zip.file('legal-review-note.md', doc.content_md);
      } else if (doc.template_id.startsWith('t1-')) {
        zip.file(`disclosures/${doc.filename}`, doc.content_md);
      }
      // governance docs (t2-*) are not included in tier_2
    }
  } else {
    // Tier 3 — Full AI Governance Evidence Folder: 4-folder organized structure
    for (const doc of okDocs) {
      const folder = folderForTier3(doc.template_id);
      zip.file(`${folder}/${doc.filename}`, doc.content_md);
    }
    // Consolidated sources-and-notes file
    zip.file('sources-and-notes.md', renderSourcesAndNotes(input, okDocs));
  }

  // 30-day next-steps roadmap (Tier 2: weeks 1-2 only; Tier 3: full 4 weeks)
  zip.file('next-steps-roadmap.md', renderNextStepsRoadmap(input, openItems));

  // Phase 8 — open review items file (always written so the format is stable
  // for downstream tooling; when items is empty, the markdown shows that).
  zip.file('open-review-items.md', renderOpenReviewItemsMarkdown(openItems));

  // Phase 8 — buyer review packet (markdown + printable HTML).
  if (readiness !== null || okDocs.length > 0) {
    const packet = buildBuyerReviewPacket({
      company_name: input.company_name,
      generation_date: input.generation_date,
      tier: input.tier,
      docs: okDocs,
      readiness,
      open_items: openItems,
      support_email: input.support_email ?? 'support@trustfolder.com',
    });
    zip.file('buyer-review-packet.md', packet.markdown);
    zip.file('buyer-review-packet.html', packet.html);
  }

  // Add a manifest.json for machine-readable consumers (Notion automations etc.)
  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        company: input.company_name,
        generated_at: input.generation_date,
        tier: input.tier,
        tier_label: tierLabel(input.tier),
        documents: okDocs.map((d) => ({
          template_id: d.template_id,
          filename: d.filename,
          confidence_band: d.confidence_band,
          citations: d.citations,
          sources: {
            website_pages: d.citations,
            user_confirmed_answers_used: true,
            system_inferred_signals_used: true,
            confidence_band: d.confidence_band,
            needs_human_review:
              d.confidence_band === 'REVIEW' ||
              d.confidence_band === 'UNCERTAIN' ||
              d.confidence_band === 'SOFT_OUT' ||
              d.confidence_band === 'HARD_OUT',
          },
        })),
        readiness_score: readiness,
        open_review_items: openItems,
        generator: 'TrustFolder v0.1',
        buyer_review_packet_present: true,
      },
      null,
      2,
    ),
  );

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Upload to Supabase Storage
  const sb = service();
  const bucket = env.supabaseStorageBucket();
  const objectPath = `orders/${input.order_id}/trustfolder-pack-${input.generation_date}.zip`;

  try {
    const { error: upErr } = await sb.storage
      .from(bucket)
      .upload(objectPath, buffer, {
        contentType: 'application/zip',
        upsert: true,
      });
    if (upErr) {
      return { ok: false, error: `storage_upload_failed: ${upErr.message}` };
    }
  } catch (err) {
    return { ok: false, error: `storage_upload_threw: ${err instanceof Error ? err.message : String(err)}` };
  }

  const ttl = env.signedUrlTtlSeconds() || SIGNED_URL_TTL;
  const { data: urlData, error: urlErr } = await sb.storage
    .from(bucket)
    .createSignedUrl(objectPath, ttl, {
      download: `trustfolder-pack-${input.generation_date}.zip`,
    });
  if (urlErr || !urlData?.signedUrl) {
    return { ok: false, error: `signed_url_failed: ${urlErr?.message ?? 'no_url'}` };
  }

  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

  // Persist on the order
  try {
    await sb
      .from('orders')
      .update({
        signed_download_url: urlData.signedUrl,
        signed_url_expires_at: expiresAt,
      })
      .eq('id', input.order_id);
  } catch (err) {
    dbError('package.persistOrder', err);
  }

  return {
    ok: true,
    data: {
      order_id: input.order_id,
      storage_path: objectPath,
      zip_size_bytes: buffer.byteLength,
      signed_url: urlData.signedUrl,
      signed_url_expires_at: expiresAt,
      doc_count: okDocs.length,
    },
  };
}

// =============================================================================
// Top README rendering
// =============================================================================

function renderTopReadme(
  input: PackageInput,
  docs: GeneratedDoc[],
  readiness: ReadinessScore | null = null,
  openItems: OpenReviewItem[] = [],
): string {
  const disclosures = docs.filter((d) => d.template_id.startsWith('t1-'));
  const governance = docs.filter((d) => d.template_id.startsWith('t2-'));

  const list = (arr: GeneratedDoc[]) =>
    arr.map((d) => `- \`${d.filename}\` _(confidence: ${d.confidence_band})_`).join('\n') ||
    '_(none generated)_';

  const label = tierLabel(input.tier);
  const confSummary = renderConfidenceSummary(docs);
  const readinessBlock = renderReadinessBlockForReadme(readiness);
  const openItemsBlock = renderOpenItemsForReadme(openItems);

  if (input.tier === 'tier_2') {
    return `# ${input.company_name} — ${label}

**Generated:** ${input.generation_date}
**Documents:** ${docs.length}

---

## What this pack is

The **${label}** is a set of AI-generated draft disclosures you can adapt for your
product, your privacy / trust pages, and your lawyer's review. It is not legal
advice, not certification, and not a compliance guarantee.

## Where to start

1. **Read \`placement-guide.md\` first** — it tells you where each disclosure goes.
2. **Apply the disclosures** to your product UI / pricing page / chatbot opener.
3. **Forward \`legal-review-note.md\`** to your lawyer for a quick review before public launch.
4. **Open \`next-steps-roadmap.md\`** for the 30-day plan (weeks 1–2 are scoped to this pack).

## What's inside

- \`disclosures/\` — your filled Article 50 transparency disclosures
- \`placement-guide.md\` — where to put each disclosure on your site/product
- \`legal-review-note.md\` — 1-page brief for your lawyer
- \`next-steps-roadmap.md\` — 30-day plan (weeks 1–2)
- \`manifest.json\` — machine-readable summary

### Disclosures included
${list(disclosures)}

## AI documentation readiness score

${readinessBlock}

## Open review items

${openItemsBlock}

## Confidence summary

${confSummary}

Every file is annotated with its own confidence band. Where confidence is
**REVIEW** or **UNCERTAIN**, treat the draft as a starting point and confirm
with counsel before publication.

## Review note

These drafts are designed to read like a clean brief for a lawyer. Confirm
placement, jurisdictional language, and any vendor-specific disclosure with
qualified counsel before going live.

## Upgrade path

When you're ready for the full evidence folder (governance docs, ISO 42001
readiness, lawyer-handoff pack), upgrade to the **Full AI Governance Evidence
Folder** at trustfolder.com.

${disclaimerBlock()}
`;
  }

  // Tier 3 — Full Evidence Folder
  return `# ${input.company_name} — ${label}

**Generated:** ${input.generation_date}
**Documents:** ${docs.length}

---

## What this pack is

The **${label}** is a buyer-ready folder of AI-generated drafts covering
disclosure, governance, evidence, and a lawyer/buyer handoff. It is not legal
advice, not certification, and not a compliance guarantee.

## Where to start

1. **Open \`04-buyer-legal-handoff/02-09-lawyer-handoff-pack.md\` first.** It briefs your lawyer in 1–2 pages.
2. **Apply the customer-facing transparency content** (\`01-disclosures/\`) on your product UI before public launch.
3. **Maintain the evidence tracker** (\`03-evidence/02-05-evidence-tracker.md\`) as a living register.
4. **Open \`next-steps-roadmap.md\`** for the 30-day plan and assign owners.

## What's inside

- \`01-disclosures/\` — Article 50 transparency disclosures (apply these to your product)
- \`02-governance/\` — AI system inventory, policy, human oversight procedure
- \`03-evidence/\` — ISO 42001 readiness checklist + evidence tracker
- \`04-buyer-legal-handoff/\` — lawyer brief, role memo, classification memo
- \`next-steps-roadmap.md\` — 30-day plan
- \`sources-and-notes.md\` — consolidated citations + manifest
- \`manifest.json\` — machine-readable summary

### Disclosures (${disclosures.length})
${list(disclosures)}

### Governance, evidence, lawyer-handoff (${governance.length})
${list(governance)}

## AI documentation readiness score

${readinessBlock}

## Open review items

${openItemsBlock}

## Confidence summary

${confSummary}

Every file is annotated with its own confidence band. Where confidence is
**REVIEW** or **UNCERTAIN**, treat the draft as a starting point and confirm
with counsel before publication.

## Review note

Use the lawyer-handoff doc as the cover letter to outside counsel. The
buyer-questionnaire scaffolding (where present) should never be sent without
founder review of every claim.

${disclaimerBlock()}
`;
}

function disclaimerBlock(): string {
  return `## Disclaimer

This pack is generated by TrustFolder for preparatory and informational purposes. It does not constitute legal advice, certification, or a confirmed compliance determination for any regulation including the EU AI Act, ISO/IEC 42001, GDPR, or other applicable laws.

Always review with qualified legal counsel before publication, regulatory submission, or external use. Regulatory requirements change — see https://trustfolder.com/regulatory-watch.

TrustFolder is an AI governance evidence folder, not a substitute for qualified legal review.

---

*Questions? Reply to the delivery email or write to hello@trustfolder.com.*`;
}

/**
 * Map a template_id to its Tier 3 folder.
 * Disclosures → 01-disclosures/, governance/policy/oversight → 02-governance/,
 * ISO + evidence → 03-evidence/, lawyer/role/classification → 04-buyer-legal-handoff/.
 */
function folderForTier3(template_id: string): string {
  if (template_id.startsWith('t1-')) return '01-disclosures';

  // t2-* governance docs split by purpose
  if (template_id === 't2-04-iso-42001-checklist' || template_id === 't2-05-evidence-tracker') {
    return '03-evidence';
  }
  if (
    template_id === 't2-09-lawyer-handoff-pack' ||
    template_id === 't2-02-provider-deployer-memo' ||
    template_id === 't2-03-risk-classification-memo' ||
    template_id === 't2-12-out-of-scope-handoff'
  ) {
    return '04-buyer-legal-handoff';
  }
  // t2-01 inventory, t2-06 policy, t2-07 oversight, t2-08 vendor q, t2-10 roadmap, t2-11 readme
  return '02-governance';
}

/**
 * Render a short confidence summary across all docs in the pack.
 * Counts each ConfidenceBand value and emits a single-line markdown summary.
 */
function renderConfidenceSummary(docs: GeneratedDoc[]): string {
  const counts: Record<string, number> = {};
  for (const d of docs) {
    const k = d.confidence_band ?? 'UNKNOWN';
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const parts = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `**${k}** × ${v}`);
  return parts.length > 0 ? parts.join(' · ') : '_(no documents to summarise)_';
}

/**
 * Deterministic 30-day next-steps roadmap. Tier 2 ships weeks 1–2 only;
 * Tier 3 ships the full 4-week plan. No LLM call — pure template.
 */
function renderNextStepsRoadmap(input: PackageInput, openItems: OpenReviewItem[] = []): string {
  const isTier2 = input.tier === 'tier_2';

  const week1 = `## Week 1 — Place disclosures

- [ ] Add the chatbot / AI-content disclosure text to the relevant UI surfaces (chat header, content captions, settings page).
- [ ] Publish the AI system disclosure page (or merge it into your existing trust / privacy page).
- [ ] Update footer to link to the disclosure page.
- [ ] Owner: founder / product / design.
- [ ] Effort: S–M.`;

  const week2 = `## Week 2 — Internalise governance

- [ ] Forward the legal-review note (Tier 2) or lawyer-handoff pack (Tier 3) to outside counsel.
- [ ] Assign an internal owner for the AI policy draft and the human oversight procedure.
- [ ] Collect DPA / sub-processor lists from each third-party AI vendor.
- [ ] Owner: founder / ops / legal.
- [ ] Effort: M.`;

  const week3 = `## Week 3 — Buyer / lawyer handoff

- [ ] Send the lawyer-handoff pack with a cover note describing your buyer-review moment.
- [ ] Pre-fill the buyer questionnaire answers using the inventory and risk notes.
- [ ] Confirm the AI system inventory matches what your team actually ships.
- [ ] Owner: founder / GTM.
- [ ] Effort: M.`;

  const week4 = `## Week 4 — Refresh + monitor

- [ ] Re-scan after any meaningful copy change on your website.
- [ ] Schedule the next governance review (recommended cadence: quarterly).
- [ ] Track open evidence-tracker items to closure.
- [ ] Owner: founder / ops.
- [ ] Effort: S.`;

  const weeks = isTier2 ? [week1, week2] : [week1, week2, week3, week4];

  const openItemsAddendum = openItems.length > 0
    ? `\n\n## Open review items (from this pack)\n\n${openItems
        .map((i) => `- [${i.priority}] ${i.title} — ${i.why}`)
        .join('\n')}`
    : '';
  return `# Next steps — ${input.company_name}

**Generated:** ${input.generation_date}
**Pack:** ${tierLabel(input.tier)}

${
  isTier2
    ? 'This roadmap covers the first two weeks. Upgrade to the **Full AI Governance Evidence Folder** for the full 4-week plan including buyer / lawyer handoff and refresh cadence.'
    : 'This roadmap is a 30-day plan. Treat each item as a working ticket and assign owners on day one.'
}

${weeks.join('\n\n')}${openItemsAddendum}

---

${disclaimerBlock()}
`;
}

function renderSourcesAndNotes(input: PackageInput, docs: GeneratedDoc[]): string {
  const allCitations = Array.from(
    new Set(docs.flatMap((d) => d.citations)),
  ).sort();

  const perDoc = docs
    .map(
      (d) =>
        `### \`${d.filename}\`\n- **Confidence band:** ${d.confidence_band}\n- **Citations:** ${
          d.citations.length > 0 ? d.citations.map((c) => `\`${c}\``).join(', ') : '_(none extracted)_'
        }`,
    )
    .join('\n\n');

  return `# Sources & notes

**Generated:** ${input.generation_date}
**Pack:** ${tierLabel(input.tier)}
**Customer:** ${input.company_name}

---

## Consolidated citations across the pack

${allCitations.map((c) => `- ${c}`).join('\n') || '_(none)_'}

---

## Per-document confidence + citations

${perDoc}

---

${disclaimerBlock()}
`;
}

// ---------------------------------------------------------------------------
// Phase 8 — README helpers for readiness score + open review items.
// ---------------------------------------------------------------------------

function renderReadinessBlockForReadme(readiness: ReadinessScore | null): string {
  if (!readiness) return '_(no readiness score available)_';
  const dims = readiness.dimensions
    .map((d) => `- **${d.label}** — ${d.score}/100. ${d.rationale}`)
    .join('\n');
  return `**Overall:** ${readiness.overall}/100 — ${readiness.band_label}

**Recommended next step:** ${readiness.recommended_next_step}

${dims}

> ${readiness.disclaimer}`;
}

function renderOpenItemsForReadme(items: OpenReviewItem[]): string {
  if (items.length === 0) return '_(none flagged)_';
  return items
    .map((i) => `- **[${i.priority}] ${i.title}** — ${i.why}`)
    .join('\n');
}
