import JSZip from 'jszip';
import {
  buildBuyerReviewPacket,
  buildOpenReviewItems,
  computeReadinessScore,
  renderOpenReviewItemsMarkdown,
  renderSnapshotMarkdown,
} from '@trustfolder/engine';
import type {
  ClassificationResult,
  ExtractionData,
  GeneratedDoc,
  QuestionnaireAnswers,
  ScopeCheckResult,
  Tier,
} from '@trustfolder/engine';

export type PackagePreviewId =
  | 'free-check'
  | 'lite-snapshot'
  | 'disclosure-pack'
  | 'governance-folder'
  | 'premium-handoff'
  | 'request-modules';

export interface PackagePreviewCatalogItem {
  id: PackagePreviewId;
  label: string;
  price: string;
  delivery: string;
  customerReceives: string;
  route: string;
  outputKind: 'page' | 'markdown' | 'zip';
}

export interface PreviewFile {
  path: string;
  content: string;
}

export interface PreviewArtifact {
  id: PackagePreviewId;
  filename: string;
  contentType: string;
  disposition: 'inline' | 'attachment';
  files: PreviewFile[];
}

export const PACKAGE_PREVIEW_CATALOG: PackagePreviewCatalogItem[] = [
  {
    id: 'free-check',
    label: 'Free Readiness Check',
    price: '$0',
    delivery: 'On-screen assessment result',
    customerReceives: 'Fit/readiness result, recommended path, and scope warnings. No document pack.',
    route: '/assessment',
    outputKind: 'markdown',
  },
  {
    id: 'lite-snapshot',
    label: 'Lite Readiness Snapshot',
    price: '$99',
    delivery: 'Request-led single report',
    customerReceives: 'One polished readiness snapshot in Markdown v1. No ZIP and no instant checkout.',
    route: '/request?type=snapshot',
    outputKind: 'markdown',
  },
  {
    id: 'disclosure-pack',
    label: 'AI Disclosure Pack',
    price: '$499',
    delivery: 'ZIP after assessment-gated checkout',
    customerReceives: 'Disclosure drafts, placement guide, legal-review note, roadmap, open items, buyer packet, and manifest.',
    route: '/assessment',
    outputKind: 'zip',
  },
  {
    id: 'governance-folder',
    label: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    delivery: 'ZIP after assessment-gated checkout',
    customerReceives: 'Disclosure, governance, evidence, buyer/legal handoff, readiness, open items, buyer packet, and manifest.',
    route: '/assessment',
    outputKind: 'zip',
  },
  {
    id: 'premium-handoff',
    label: 'Premium Buyer/Legal Handoff',
    price: '$2,500+',
    delivery: 'Manual/application-led',
    customerReceives: 'Scoped handoff brief and custom review plan. Automated preview is representative only.',
    route: '/request?type=premium',
    outputKind: 'page',
  },
  {
    id: 'request-modules',
    label: 'Request-Only Specialized Modules',
    price: 'Request-led',
    delivery: 'Manual/request-led',
    customerReceives: 'Module-specific intake summaries for SOC 2, security questionnaires, GDPR/data, HIPAA, biometrics, and other sensitive cases.',
    route: '/request',
    outputKind: 'zip',
  },
];

const GENERATION_DATE = '2026-05-17';
const COMPANY = 'Acme AI';
const SUPPORT_EMAIL = 'support@trustfolder.com';

export function getPackagePreview(id: string): PackagePreviewCatalogItem | null {
  return PACKAGE_PREVIEW_CATALOG.find((item) => item.id === id) ?? null;
}

export async function buildPreviewArtifact(id: PackagePreviewId): Promise<PreviewArtifact> {
  switch (id) {
    case 'free-check':
      return {
        id,
        filename: 'trustfolder-free-readiness-check-preview.md',
        contentType: 'text/markdown; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'free-readiness-check-result.md', content: renderFreeCheckResult() }],
      };
    case 'lite-snapshot':
      return {
        id,
        filename: 'trustfolder-lite-readiness-snapshot-preview.md',
        contentType: 'text/markdown; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'lite-readiness-snapshot.md', content: renderSnapshot() }],
      };
    case 'disclosure-pack':
      return zipArtifact(id, 'trustfolder-ai-disclosure-pack-preview.zip', tier2Files());
    case 'governance-folder':
      return zipArtifact(id, 'trustfolder-buyer-ready-governance-folder-preview.zip', tier3Files());
    case 'premium-handoff':
      return {
        id,
        filename: 'trustfolder-premium-handoff-preview.html',
        contentType: 'text/html; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'premium-buyer-legal-handoff.html', content: renderPremiumHandoffHtml() }],
      };
    case 'request-modules':
      return zipArtifact(id, 'trustfolder-request-only-module-previews.zip', requestModuleFiles());
  }
}

export async function buildAllPreviewZip(): Promise<Buffer> {
  const zip = new JSZip();
  for (const item of PACKAGE_PREVIEW_CATALOG) {
    const artifact = await buildPreviewArtifact(item.id);
    const folder = zip.folder(`${item.price.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${item.id}`);
    for (const file of artifact.files) {
      folder?.file(file.path, file.content);
    }
  }
  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function artifactToBody(artifact: PreviewArtifact): Promise<Buffer> {
  if (artifact.contentType.startsWith('application/zip')) {
    const zip = new JSZip();
    for (const file of artifact.files) zip.file(file.path, file.content);
    return zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }
  return Buffer.from(artifact.files[0]?.content ?? '', 'utf8');
}

function zipArtifact(
  id: PackagePreviewId,
  filename: string,
  files: PreviewFile[],
): PreviewArtifact {
  return {
    id,
    filename,
    contentType: 'application/zip',
    disposition: 'attachment',
    files,
  };
}

function demoExtraction(): ExtractionData {
  return {
    company_name: COMPANY,
    product_name: 'Acme Copilot',
    product_description:
      'Acme Copilot is a B2B AI assistant that helps customer-success teams summarize account notes, draft follow-up emails, and search product knowledge base content.',
    ai_features: [
      {
        name: 'Customer-success assistant',
        description: 'Answers internal team questions using product and account context.',
        feature_type: 'chatbot',
        customer_facing: false,
      },
      {
        name: 'Follow-up email drafting',
        description: 'Drafts suggested customer follow-up messages for human review.',
        feature_type: 'content_generation',
        customer_facing: false,
      },
      {
        name: 'Knowledge base search',
        description: 'Retrieves relevant product documentation using AI-assisted search.',
        feature_type: 'search',
        customer_facing: true,
      },
    ],
    target_users: 'B2B SaaS customer-success, support, and product-operations teams.',
    b2b_or_b2c: 'B2B',
    eu_signals: ['eu_customers_possible', 'gdpr_mention'],
    possible_risk_areas: [],
    sensitive_data_signals: ['customer account notes may include personal data'],
    confidence: 'high',
    notes: 'Illustrative admin preview data. Not a real customer scan.',
  };
}

function demoAnswers(): QuestionnaireAnswers {
  return {
    company_name: COMPANY,
    product_description:
      'B2B AI assistant for customer-success teams, focused on summaries, drafted replies, and knowledge search.',
    primary_ai_use_case: 'Summarizing account context and drafting suggested customer communications for human review.',
    b2b_or_b2c: 'B2B',
    has_eu_customers: 'yes',
    ai_user_interaction: 'reviewed',
    processes_personal_data: 'yes',
    vertical: 'customer_support',
    num_eu_customers: '11-100',
    primary_jurisdictions: ['United States', 'European Union'],
    data_subject_categories: ['Business customers', 'Customer-success contacts'],
    ai_training_data_sources: ['Public product docs', 'Customer-provided account notes'],
    third_party_models: ['OpenAI API'],
    human_oversight: 'always',
    has_incident_response: 'partial',
  };
}

function demoClassification(): ClassificationResult {
  return {
    systems: [
      {
        system_id: 'acme-copilot-assistant',
        name: 'Customer-success assistant',
        description: 'Internal AI assistant for support and customer-success workflows.',
        feature_type: 'chatbot',
        ai_act_classification: 'limited_risk',
        ai_act_citation: 'EU AI Act transparency context; confirm with counsel for final interpretation.',
        our_role: 'provider',
        role_citation: 'Company controls product behavior and user-facing descriptions.',
        confidence_band: 'REVIEW',
        recommended_action:
          'Prepare a plain-English AI use summary, source-traced evidence tracker, and buyer/legal handoff.',
        applicable_disclosure_templates: [
          't1-04-ai-interaction-notice',
          't1-05-user-instructions',
          't1-06-ai-system-disclosure-page',
          't1-07-ai-usage-policy-summary',
        ],
        notes: 'Illustrative preview system.',
      },
    ],
    overall_band: 'REVIEW',
    pack_metadata: {
      company_name: COMPANY,
      primary_ai_role: 'provider',
      has_eu_customers: true,
      risk_summary: 'Low-to-limited transparency-readiness risk; source trail and legal review still needed.',
    },
  };
}

function demoScope(): ScopeCheckResult {
  return {
    in_scope: true,
    band: 'REVIEW',
    matched_keywords: [],
    reason: 'B2B SaaS support workflow; no hard out-of-scope vertical detected.',
    recommended_tier: 'tier_3',
    user_message: 'Eligible for automated pack with review flags.',
  };
}

function demoDocs(tier: Extract<Tier, 'tier_2' | 'tier_3'>): GeneratedDoc[] {
  const disclosureDocs: GeneratedDoc[] = [
    doc('t1-01-chatbot-disclosure', '01-ai-interaction-notice.md', 'AI Interaction Notice'),
    doc('t1-02-ai-content-labeling', '02-ai-generated-content-labeling.md', 'AI-Generated Content Labeling'),
    doc('t1-04-ai-interaction-notice', '03-customer-facing-ai-notice.md', 'Customer-Facing AI Notice'),
    doc('t1-05-user-instructions', '04-user-instructions-for-ai-output.md', 'User Instructions for AI Output'),
    doc('t1-06-ai-system-disclosure-page', '05-ai-system-disclosure-page.md', 'AI System Disclosure Page'),
    doc('t1-07-ai-usage-policy-summary', '06-legal-review-note.md', 'Legal Review Note'),
  ];
  if (tier === 'tier_2') return disclosureDocs;
  return [
    ...disclosureDocs,
    doc('t2-01-ai-system-inventory', '01-ai-system-inventory.md', 'AI System Inventory'),
    doc('t2-02-provider-deployer-memo', '02-provider-deployer-role-memo.md', 'Provider / Deployer Role Memo'),
    doc('t2-03-risk-classification-memo', '03-risk-classification-memo.md', 'Risk Classification Memo'),
    doc('t2-04-iso-42001-checklist', '04-iso-iec-42001-readiness-checklist.md', 'ISO/IEC 42001-Aligned Readiness Checklist'),
    doc('t2-05-evidence-tracker', '05-evidence-tracker.md', 'Evidence Tracker'),
    doc('t2-06-ai-governance-policy', '06-ai-governance-policy.md', 'AI Governance Policy Draft'),
    doc('t2-07-human-oversight-procedure', '07-human-oversight-procedure.md', 'Human Oversight Procedure'),
    doc('t2-09-lawyer-handoff-pack', '09-lawyer-handoff-pack.md', 'Lawyer Handoff Pack'),
  ];
}

function doc(templateId: string, filename: string, title: string): GeneratedDoc {
  return {
    template_id: templateId,
    filename,
    content_md: [
      `# ${title} - ${COMPANY}`,
      '',
      'Illustrative admin preview. Not a real customer pack. Not legal advice.',
      '',
      '## Purpose',
      '',
      `${title} gives a buyer, legal reviewer, or internal owner a structured starting point for review.`,
      '',
      '## Draft content',
      '',
      'Acme Copilot uses AI to support customer-success workflows, including account-note summaries, suggested follow-up drafts, and knowledge base search. Human users review outputs before external use.',
      '',
      '## Source trail',
      '',
      '- https://acme.example/product',
      '- https://acme.example/security',
      '- Founder intake answers from TrustFolder assessment',
      '',
      '## Review status',
      '',
      'Confidence band: REVIEW. Confirm claims with product, security, privacy, and counsel before external sharing.',
      '',
    ].join('\n'),
    confidence_band: 'REVIEW',
    citations: ['https://acme.example/product', 'https://acme.example/security'],
    api_cost_cents: 0,
    duration_ms: 0,
    ok: true,
  };
}

function renderFreeCheckResult(): string {
  const readiness = computeReadinessScore({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    citations_count: 0,
  });
  return [
    '# Free Readiness Check Result - Acme AI',
    '',
    'Illustrative admin preview. This is the no-payment assessment output, not a document pack.',
    '',
    `## Readiness direction: ${readiness.band_label}`,
    '',
    `Score shown to orient the founder: ${readiness.overall}/100.`,
    '',
    '## What the customer receives',
    '',
    '- Fit/readiness result',
    '- Recommended next TrustFolder path',
    '- Scope warnings if the use case looks sensitive',
    '- CTA to request a paid pack or expert review',
    '',
    '## What the customer does not receive',
    '',
    '- No ZIP',
    '- No buyer packet',
    '- No disclosure drafts',
    '- No governance folder',
    '',
    readiness.disclaimer,
    '',
  ].join('\n');
}

function renderSnapshot(): string {
  return renderSnapshotMarkdown(
    demoExtraction(),
    demoClassification(),
    demoScope(),
    COMPANY,
    GENERATION_DATE,
  );
}

function tier2Files(): PreviewFile[] {
  const docs = demoDocs('tier_2');
  const readiness = computeReadinessScore({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    citations_count: docs.flatMap((d) => d.citations).length,
  });
  const openItems = buildOpenReviewItems({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    tier: 'tier_2',
  });
  const packet = buildBuyerReviewPacket({
    company_name: COMPANY,
    generation_date: GENERATION_DATE,
    tier: 'tier_2',
    docs,
    readiness,
    open_items: openItems,
    support_email: SUPPORT_EMAIL,
  });

  return [
    file('README.md', readme('AI Disclosure Pack', docs, readiness.overall)),
    ...docs.map((d) =>
      d.template_id === 't1-06-ai-system-disclosure-page'
        ? file('placement-guide.md', d.content_md)
        : d.template_id === 't1-07-ai-usage-policy-summary'
          ? file('legal-review-note.md', d.content_md)
          : file(`disclosures/${d.filename}`, d.content_md),
    ),
    file('next-steps-roadmap.md', nextSteps('AI Disclosure Pack', 2)),
    file('open-review-items.md', renderOpenReviewItemsMarkdown(openItems)),
    file('buyer-review-packet.md', packet.markdown),
    file('buyer-review-packet.html', packet.html),
    file('manifest.json', manifest('tier_2', docs, readiness.overall, openItems.length)),
  ];
}

function tier3Files(): PreviewFile[] {
  const docs = demoDocs('tier_3');
  const readiness = computeReadinessScore({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    citations_count: docs.flatMap((d) => d.citations).length,
  });
  const openItems = buildOpenReviewItems({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    tier: 'tier_3',
  });
  const packet = buildBuyerReviewPacket({
    company_name: COMPANY,
    generation_date: GENERATION_DATE,
    tier: 'tier_3',
    docs,
    readiness,
    open_items: openItems,
    support_email: SUPPORT_EMAIL,
  });

  return [
    file('README.md', readme('Buyer-Ready AI Governance Folder', docs, readiness.overall)),
    ...docs.map((d) => file(`${folderForTier3(d.template_id)}/${d.filename}`, d.content_md)),
    file('sources-and-notes.md', sourcesAndNotes(docs)),
    file('next-steps-roadmap.md', nextSteps('Buyer-Ready AI Governance Folder', 4)),
    file('open-review-items.md', renderOpenReviewItemsMarkdown(openItems)),
    file('buyer-review-packet.md', packet.markdown),
    file('buyer-review-packet.html', packet.html),
    file('manifest.json', manifest('tier_3', docs, readiness.overall, openItems.length)),
  ];
}

function requestModuleFiles(): PreviewFile[] {
  const modules = [
    ['soc2-readiness', 'SOC 2 Readiness Evidence Pack'],
    ['security-questionnaire', 'Enterprise Security Questionnaire Support'],
    ['gdpr-ai-data-readiness', 'GDPR AI/Data Readiness Pack'],
    ['dpa-privacy-handoff', 'DPA / Privacy Agreement Handoff Pack'],
    ['iso42001-readiness', 'ISO/IEC 42001-Aligned Readiness Pack'],
    ['hipaa-healthcare-intake', 'HIPAA / Healthcare Data Intake Pack'],
    ['medical-ai-intake', 'Medical AI Expert-Review Intake'],
    ['employment-ai-intake', 'Hiring AI Expert-Review Intake'],
    ['financial-credit-insurance-intake', 'Financial / Credit / Insurance AI Intake'],
    ['childrens-products-intake', "Children's Product Expert-Review Intake"],
    ['biometrics-intake', 'Biometrics Expert-Review Intake'],
    ['law-enforcement-critical-infrastructure-intake', 'Law Enforcement / Critical Infrastructure Intake'],
  ];
  return modules.map(([id, label]) =>
    file(
      `${id}.md`,
      [
        `# ${label} - Request Preview`,
        '',
        'Illustrative admin preview. This request-led module is manually scoped; it is not an instant checkout product.',
        '',
        '## Customer receives',
        '',
        '- Confirmation that the request was received',
        '- Founder/manual review of scope',
        '- A scoped follow-up path before any expert-review or custom handoff work begins',
        '',
        '## Intake focus',
        '',
        `This module captures context for ${label.toLowerCase()} and routes sensitive cases to appropriate human review.`,
        '',
        '## Safe boundary',
        '',
        'Not legal advice. Not certification. Not a compliance guarantee.',
        '',
      ].join('\n'),
    ),
  );
}

function renderPremiumHandoffHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Premium Buyer/Legal Handoff Preview</title>
<style>
body { margin: 0; background: #fbfaf6; color: #07111f; font: 16px/1.6 Arial, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 48px 28px; }
h1 { font-size: 38px; line-height: 1.05; margin: 0 0 12px; }
h2 { margin-top: 32px; }
.panel { border: 1px solid #ded8ca; background: white; border-radius: 16px; padding: 22px; margin-top: 16px; }
.label { color: #0f7b5a; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
li { margin: 8px 0; }
</style>
</head>
<body>
<main>
<p class="label">Illustrative admin preview</p>
<h1>Premium Buyer/Legal Handoff - ${COMPANY}</h1>
<p>This is the representative output shape for a manually scoped premium engagement. It is not a fixed automated pack and not legal advice.</p>
<section class="panel">
<h2>What the customer receives</h2>
<ul>
<li>Buyer/legal handoff brief tailored to the transaction or enterprise review.</li>
<li>Source-traced review packet using the available product, security, privacy, and intake material.</li>
<li>Open review items separated by owner: founder, product, security, privacy, legal, expert.</li>
<li>Manual recommendations for what should be reviewed before external sharing.</li>
</ul>
</section>
<section class="panel">
<h2>Delivery mode</h2>
<p>Application-led and manually invoiced. The admin/request flow captures the need; the final scope is confirmed by the founder before fulfillment.</p>
</section>
<section class="panel">
<h2>Safe boundary</h2>
<p>Not legal advice. Not certification. Not a compliance guarantee. Final decisions belong with qualified counsel and the customer team.</p>
</section>
</main>
</body>
</html>`;
}

function file(path: string, content: string): PreviewFile {
  return { path, content };
}

function readme(packName: string, docs: GeneratedDoc[], readiness: number): string {
  return [
    `# ${COMPANY} - ${packName}`,
    '',
    `Generated: ${GENERATION_DATE}`,
    `Documents: ${docs.length}`,
    `Readiness score: ${readiness}/100`,
    '',
    '## What this preview is',
    '',
    'This is an illustrative admin preview of the customer-facing output shape. It uses fictional company data and does not create an order, email, payment, or storage object.',
    '',
    '## Where to start',
    '',
    '- Open buyer-review-packet.html for the buyer-facing summary.',
    '- Read README.md and next-steps-roadmap.md first.',
    '- Review open-review-items.md before sending anything externally.',
    '',
    '## Safe boundary',
    '',
    'Not legal advice. Not certification. Not a compliance guarantee.',
    '',
  ].join('\n');
}

function nextSteps(packName: string, weeks: 2 | 4): string {
  const base = [
    `# Next Steps - ${packName}`,
    '',
    '- Week 1: confirm AI use summary and disclosure placement.',
    '- Week 2: review source trail, owner assignments, and open items.',
  ];
  if (weeks === 4) {
    base.push(
      '- Week 3: prepare buyer/legal handoff and review governance evidence.',
      '- Week 4: refresh source trail and close open review items.',
    );
  }
  base.push('', 'Not legal advice. Not certification. Not a compliance guarantee.', '');
  return base.join('\n');
}

function sourcesAndNotes(docs: GeneratedDoc[]): string {
  const citations = Array.from(new Set(docs.flatMap((d) => d.citations))).sort();
  return [
    '# Sources and Notes',
    '',
    ...citations.map((citation) => `- ${citation}`),
    '',
    '## Per-document notes',
    '',
    ...docs.map((d) => `- ${d.filename}: confidence ${d.confidence_band}`),
    '',
  ].join('\n');
}

function manifest(tier: Tier, docs: GeneratedDoc[], readiness: number, openItemCount: number): string {
  return JSON.stringify(
    {
      company: COMPANY,
      generated_at: GENERATION_DATE,
      tier,
      admin_preview: true,
      documents: docs.map((d) => ({
        template_id: d.template_id,
        filename: d.filename,
        confidence_band: d.confidence_band,
        citations: d.citations,
      })),
      readiness_score: readiness,
      open_review_item_count: openItemCount,
      buyer_review_packet_present: true,
      disclaimer: 'Illustrative admin preview. Not legal advice. Not certification. Not a compliance guarantee.',
    },
    null,
    2,
  );
}

function folderForTier3(templateId: string): string {
  if (templateId.startsWith('t1-')) return '01-disclosures';
  if (templateId === 't2-04-iso-42001-checklist' || templateId === 't2-05-evidence-tracker') {
    return '03-evidence';
  }
  if (
    templateId === 't2-09-lawyer-handoff-pack' ||
    templateId === 't2-02-provider-deployer-memo' ||
    templateId === 't2-03-risk-classification-memo' ||
    templateId === 't2-12-out-of-scope-handoff'
  ) {
    return '04-buyer-legal-handoff';
  }
  return '02-governance';
}
