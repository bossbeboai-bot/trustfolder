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
 * tier_1 (Lite Readiness Snapshot) uses `buildSnapshotPack` below to produce
 * a branded ZIP with START-HERE.html, HTML report, Markdown, QA, and manifest.
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
  type OpenReviewItem,
} from './open-review-items.js';
import { buildEvidenceRoomFiles } from './evidence-room.js';

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
  source_url?: string | null;
  /** Phase 8 readiness inputs. Optional — if absent, no readiness score is included. */
  extraction?: ExtractionData | null;
  answers?: QuestionnaireAnswers | null;
  scope?: Pick<ScopeCheckResult, 'in_scope' | 'band'> | null;
  /** Support email surfaced in the buyer-review packet. */
  support_email?: string;
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line === '---') {
      closeList();
      html.push('<hr />');
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(2))}</h2>`);
      continue;
    }
    if (line.startsWith('> ')) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function slugForPath(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function buildPack(input: PackageInput): Promise<Result<PackagedPack>> {
  const okDocs = input.docs.filter((d) => d.ok && d.content_md.length > 0);
  if (okDocs.length === 0) {
    return { ok: false, error: 'no_ok_docs' };
  }

  if (input.tier === 'tier_1') {
    return {
      ok: false,
      error: 'tier_1_uses_snapshot_packager: call buildSnapshotPack instead of buildPack',
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
  const evidenceRoom = buildEvidenceRoomFiles({
    tier: input.tier,
    companyName: input.company_name,
    generationDate: input.generation_date,
    sourceUrl: input.source_url ?? null,
    docs: okDocs,
    readiness,
    openItems,
    supportEmail: input.support_email ?? 'support@trustfolder.com',
  });
  const root = zip.folder(evidenceRoom.rootFolderName);
  for (const file of evidenceRoom.files) {
    root?.file(file.path, file.content);
  }

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
      download: `${evidenceRoom.rootFolderName}.zip`,
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

export interface SnapshotPackageInput {
  order_id: string;
  email: string;
  company_name: string;
  generation_date: string;
  source_url?: string | null;
  report_md: string;
  readiness_score: ReadinessScore;
  support_email?: string;
}

export async function buildSnapshotPack(input: SnapshotPackageInput): Promise<Result<PackagedPack>> {
  const zip = new JSZip();
  const rootFolderName = `TrustFolder Lite Readiness Snapshot - ${input.company_name} - ${input.generation_date}`;
  const root = zip.folder(rootFolderName);
  const files = [
    {
      path: 'START-HERE.html',
      content: renderSnapshotStartHereHtml(input),
    },
    {
      path: 'TrustFolder Lite Readiness Snapshot.html',
      content: renderSnapshotReportHtml(input),
    },
    {
      path: 'lite-readiness-snapshot.md',
      content: input.report_md,
    },
    {
      path: 'snapshot-qa-report.md',
      content: renderSnapshotQaReport(input),
    },
    {
      path: 'manifest.json',
      content: JSON.stringify(
        {
          packId: `tf-snapshot-${slugForPath(input.company_name)}-${input.generation_date}`,
          tier: 'snapshot',
          companyName: input.company_name,
          generatedAt: input.generation_date,
          sourceUrl: input.source_url ?? null,
          artifacts: [
            {
              path: 'TrustFolder Lite Readiness Snapshot.html',
              title: 'Lite Readiness Snapshot',
              category: 'snapshot',
              audience: 'founder',
              sourceCoverage: input.source_url ? 'partial' : 'needs-review',
              reviewStatus: 'review-needed',
            },
            {
              path: 'lite-readiness-snapshot.md',
              title: 'Editable Snapshot Markdown',
              category: 'snapshot',
              audience: 'operator',
              sourceCoverage: input.source_url ? 'partial' : 'needs-review',
              reviewStatus: 'review-needed',
            },
          ],
          readiness_score: input.readiness_score,
          disclaimers: [
            'Not legal advice.',
            'Not certification.',
            'Not a compliance guarantee.',
            'Not a complete regulatory filing.',
          ],
        },
        null,
        2,
      ),
    },
  ];

  for (const file of files) {
    root?.file(file.path, file.content);
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const sb = service();
  const bucket = env.supabaseStorageBucket();
  const objectPath = `orders/${input.order_id}/trustfolder-lite-readiness-snapshot-${input.generation_date}.zip`;

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
      download: `${rootFolderName}.zip`,
    });
  if (urlErr || !urlData?.signedUrl) {
    return { ok: false, error: `signed_url_failed: ${urlErr?.message ?? 'no_url'}` };
  }

  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

  try {
    await sb
      .from('orders')
      .update({
        signed_download_url: urlData.signedUrl,
        signed_url_expires_at: expiresAt,
      })
      .eq('id', input.order_id);
  } catch (err) {
    dbError('snapshot.persistOrder', err);
  }

  return {
    ok: true,
    data: {
      order_id: input.order_id,
      storage_path: objectPath,
      zip_size_bytes: buffer.byteLength,
      signed_url: urlData.signedUrl,
      signed_url_expires_at: expiresAt,
      doc_count: files.length,
    },
  };
}

function renderSnapshotStartHereHtml(input: SnapshotPackageInput): string {
  const score = `${input.readiness_score.overall} / 100`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.company_name)} - TrustFolder Lite Readiness Snapshot</title>
<style>
:root { color-scheme: light; --ink:#09231b; --muted:#5e6b64; --line:#ded8ca; --cream:#fbfaf6; --paper:#fffdf7; --green:#0f7b5a; --deep:#063d2f; --soft:#e7f3ed; --gold:#b89555; }
* { box-sizing: border-box; }
body { margin:0; background:var(--cream); color:var(--ink); font-family:Arial,sans-serif; line-height:1.55; }
main { max-width:980px; margin:0 auto; padding:44px 28px 64px; }
.cover { border:1px solid var(--line); background:linear-gradient(135deg,#fffdf7 0%,#f4f0e7 100%); border-radius:28px; padding:40px; box-shadow:0 28px 80px rgba(9,35,27,.08); }
.brand { display:flex; justify-content:space-between; gap:16px; margin-bottom:46px; }
.mark { font-weight:800; color:var(--deep); }
.eyebrow { color:var(--green); font-size:11px; letter-spacing:.18em; text-transform:uppercase; font-weight:800; }
h1 { max-width:760px; margin:12px 0 18px; font-size:clamp(36px,6vw,64px); line-height:.98; letter-spacing:-.045em; }
.lead { max-width:720px; color:var(--muted); font-size:18px; }
.grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-top:32px; }
.card { border:1px solid var(--line); background:rgba(255,255,255,.8); border-radius:16px; padding:18px; }
.metric { font-size:30px; font-weight:800; letter-spacing:-.03em; }
.label { color:var(--muted); font-size:13px; }
.section { margin-top:24px; border:1px solid var(--line); border-radius:20px; background:white; padding:24px; }
li { margin:10px 0; }
footer { margin-top:30px; color:var(--muted); font-size:13px; }
@page { margin:18mm; }
@media print { body{background:white;} main{padding:0;max-width:none;} .cover,.section{box-shadow:none;break-inside:avoid;border-radius:0;} }
@media (max-width:720px){ main{padding:24px 16px;} .cover{padding:26px;} .grid{grid-template-columns:1fr;} }
</style>
</head>
<body>
<main>
<section class="cover">
<div class="brand"><div class="mark">TrustFolder</div><div class="eyebrow">$99 autonomous snapshot</div></div>
<p class="eyebrow">Lite Readiness Snapshot</p>
<h1>${escapeHtml(input.company_name)} AI governance readiness snapshot</h1>
<p class="lead">A source-informed first diagnostic for the buyer-review questions your team should answer before an enterprise or legal review.</p>
<section class="grid" aria-label="Snapshot summary">
<div class="card"><div class="metric">${escapeHtml(score)}</div><div class="label">documentation readiness</div></div>
<div class="card"><div class="metric">${escapeHtml(input.readiness_score.band_label)}</div><div class="label">readiness band</div></div>
<div class="card"><div class="metric">4</div><div class="label">files included</div></div>
</section>
</section>
<section class="section">
<p class="eyebrow">Open first</p>
<ol>
<li>Open <strong>TrustFolder Lite Readiness Snapshot.html</strong> for the polished report.</li>
<li>Use <strong>lite-readiness-snapshot.md</strong> as the editable working copy.</li>
<li>Read <strong>snapshot-qa-report.md</strong> before sharing the report externally.</li>
<li>Upgrade to the Disclosure Pack or Governance Folder when a buyer needs source-traced drafts and handoff materials.</li>
</ol>
</section>
<section class="section">
<p class="eyebrow">Safe boundary</p>
<p>Not legal advice. Not certification. Not a compliance guarantee. Not a complete regulatory filing.</p>
</section>
<footer>Generated ${escapeHtml(input.generation_date)}. Source URL: ${escapeHtml(input.source_url ?? 'Not provided')}. Questions: ${escapeHtml(input.support_email ?? 'support@trustfolder.com')}.</footer>
</main>
</body>
</html>`;
}

function renderSnapshotReportHtml(input: SnapshotPackageInput): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.company_name)} - Lite Readiness Snapshot</title>
<style>
:root { color-scheme: light; --ink:#09231b; --muted:#5e6b64; --line:#ded8ca; --cream:#fbfaf6; --paper:#fffdf7; --green:#0f7b5a; --soft:#e7f3ed; }
* { box-sizing: border-box; }
body { margin:0; background:var(--cream); color:var(--ink); font-family:Arial,sans-serif; line-height:1.58; }
main { max-width:920px; margin:0 auto; padding:42px 28px 64px; }
header { border:1px solid var(--line); background:var(--paper); border-radius:24px; padding:34px; }
.eyebrow { color:var(--green); font-size:11px; letter-spacing:.18em; text-transform:uppercase; font-weight:800; }
h1 { margin:12px 0 10px; font-size:clamp(34px,5vw,58px); line-height:1; letter-spacing:-.045em; }
.score { display:inline-flex; margin-top:20px; align-items:baseline; gap:10px; border:1px solid var(--line); border-radius:16px; background:white; padding:14px 18px; }
.score strong { font-size:32px; }
article { margin-top:24px; border:1px solid var(--line); background:white; border-radius:20px; padding:28px; }
h2 { margin:28px 0 10px; font-size:24px; letter-spacing:-.03em; }
h3 { margin:22px 0 8px; font-size:18px; }
p, li { color:var(--muted); }
blockquote { margin:16px 0; padding:14px 18px; border-left:4px solid var(--green); background:var(--soft); color:var(--ink); }
code { background:#f3efe5; padding:2px 5px; border-radius:5px; }
hr { border:0; border-top:1px solid var(--line); margin:26px 0; }
@page { margin:18mm; }
@media print { body{background:white;} main{padding:0;max-width:none;} header,article{break-inside:avoid;border-radius:0;} }
</style>
</head>
<body>
<main>
<header>
<p class="eyebrow">TrustFolder Lite Readiness Snapshot</p>
<h1>${escapeHtml(input.company_name)} readiness report</h1>
<p>This report is a founder-friendly first diagnostic for AI transparency and buyer-review readiness.</p>
<div class="score"><strong>${input.readiness_score.overall}/100</strong><span>${escapeHtml(input.readiness_score.band_label)}</span></div>
</header>
<article>
${markdownToHtml(input.report_md)}
</article>
</main>
</body>
</html>`;
}

function renderSnapshotQaReport(input: SnapshotPackageInput): string {
  const banned = [
    'fully compliant',
    'guaranteed compliance',
    'audit-proof',
    'no lawyer needed',
    'GDPR Article 50',
    'final EU declaration of conformity',
  ].filter((phrase) => input.report_md.toLowerCase().includes(phrase.toLowerCase()));

  return [
    `# Snapshot QA Report - ${input.company_name}`,
    '',
    `Generated: ${input.generation_date}`,
    `Source URL: ${input.source_url ?? 'Not provided'}`,
    '',
    '## Automated checks',
    '',
    `- Banned claims found: ${banned.length === 0 ? 'None' : banned.join(', ')}`,
    `- Readiness score included: ${input.readiness_score.overall}/100`,
    '- Scope boundary present: yes',
    '- Customer receives only the snapshot package for this tier.',
    '',
    '## Manual review still required',
    '',
    '- Product/factual accuracy.',
    '- Personal-data and vendor/model claims.',
    '- Legal interpretation.',
    '- Any high-risk or sensitive-use applicability.',
    '',
    'Not legal advice. Not certification. Not a compliance guarantee. Not a complete regulatory filing.',
    '',
  ].join('\n');
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
