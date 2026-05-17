import JSZip from 'jszip';
import {
  buildEvidenceRoomFiles,
  buildOpenReviewItems,
  computeReadinessScore,
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
  readiness: 'customer-ready-sample' | 'request-led' | 'no-documents';
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
  rootFolderName?: string;
}

export const PACKAGE_PREVIEW_CATALOG: PackagePreviewCatalogItem[] = [
  {
    id: 'free-check',
    label: 'Free Readiness Check',
    price: '$0',
    delivery: 'On-screen assessment result only',
    customerReceives: 'Fit/readiness result, detected AI-use summary, scope warnings, and recommended next path. No document pack.',
    route: '/assessment',
    outputKind: 'markdown',
    readiness: 'no-documents',
  },
  {
    id: 'lite-snapshot',
    label: 'Lite Readiness Snapshot',
    price: '$99',
    delivery: 'Automated ZIP after assessment-gated checkout',
    customerReceives: 'One founder-friendly readiness snapshot with gaps, source-traced observations, and recommended next documents.',
    route: '/assessment',
    outputKind: 'page',
    readiness: 'customer-ready-sample',
  },
  {
    id: 'disclosure-pack',
    label: 'AI Disclosure Pack',
    price: '$499',
    delivery: 'ZIP after assessment-gated checkout',
    customerReceives: 'A branded disclosure evidence folder with START-HERE, AI use summary, disclosure drafts, evidence tracker, source notes, legal checklist, open items, QA report, and manifest.',
    route: '/assessment',
    outputKind: 'zip',
    readiness: 'customer-ready-sample',
  },
  {
    id: 'governance-folder',
    label: 'Buyer-Ready AI Governance Folder',
    price: '$999',
    delivery: 'ZIP after assessment-gated checkout',
    customerReceives: 'A complete buyer-review evidence room with executive brief, inventory, disclosures, governance controls, risk/readiness starters, source trail, buyer packet, open items, roadmap, QA report, and manifest.',
    route: '/assessment',
    outputKind: 'zip',
    readiness: 'customer-ready-sample',
  },
  {
    id: 'premium-handoff',
    label: 'Premium Buyer/Legal Handoff',
    price: '$2,500+',
    delivery: 'Manual/application-led',
    customerReceives: 'The governance folder plus manually reviewed buyer-specific Q&A, counsel handoff, revision log, and expert-review flags.',
    route: '/request?type=premium',
    outputKind: 'page',
    readiness: 'request-led',
  },
  {
    id: 'request-modules',
    label: 'Request-Only Specialized Modules',
    price: 'Request-led',
    delivery: 'Manual/request-led',
    customerReceives: 'Module-specific intake summary, applicability note, starter artifact, requested evidence, open questions, and expert-review recommendation.',
    route: '/request',
    outputKind: 'zip',
    readiness: 'request-led',
  },
];

const GENERATION_DATE = '2026-05-18';
const COMPANY = 'BrightDesk AI';
const PRODUCT = 'BrightDesk Copilot';
const SOURCE_URL = 'https://brightdesk.example/product';
const SECURITY_URL = 'https://brightdesk.example/security';
const SUPPORT_EMAIL = 'support@trustfolder.com';

export function getPackagePreview(id: string): PackagePreviewCatalogItem | null {
  return PACKAGE_PREVIEW_CATALOG.find((item) => item.id === id) ?? null;
}

export async function buildPreviewArtifact(id: PackagePreviewId): Promise<PreviewArtifact> {
  switch (id) {
    case 'free-check':
      return {
        id,
        filename: 'trustfolder-free-readiness-check-sample.md',
        contentType: 'text/markdown; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'free-readiness-check-result.md', content: renderFreeCheckResult() }],
      };
    case 'lite-snapshot':
      return {
        id,
        filename: 'TrustFolder Lite Readiness Snapshot - BrightDesk AI.html',
        contentType: 'text/html; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'TrustFolder Lite Readiness Snapshot.html', content: renderSnapshotHtml() }],
      };
    case 'disclosure-pack': {
      const room = buildDisclosureRoom();
      return zipArtifact(id, `${room.rootFolderName}.zip`, room.files, room.rootFolderName);
    }
    case 'governance-folder': {
      const room = buildGovernanceRoom();
      return zipArtifact(id, `${room.rootFolderName}.zip`, room.files, room.rootFolderName);
    }
    case 'premium-handoff':
      return {
        id,
        filename: 'TrustFolder Premium Buyer Legal Handoff - BrightDesk AI.html',
        contentType: 'text/html; charset=utf-8',
        disposition: 'inline',
        files: [{ path: 'premium-buyer-legal-handoff.html', content: renderPremiumHandoffHtml() }],
      };
    case 'request-modules':
      return zipArtifact(
        id,
        'trustfolder-request-led-module-samples.zip',
        requestModuleFiles(),
        `TrustFolder Request-Led Module Samples - ${GENERATION_DATE}`,
      );
  }
}

export async function buildAllPreviewZip(): Promise<Buffer> {
  const zip = new JSZip();
  const root = zip.folder(`ADMIN-ONLY TrustFolder Package Samples - ${GENERATION_DATE}`);
  for (const item of PACKAGE_PREVIEW_CATALOG) {
    const artifact = await buildPreviewArtifact(item.id);
    const folder = root?.folder(`${item.price.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${item.id}`);
    for (const file of artifact.files) {
      const path = artifact.rootFolderName ? `${artifact.rootFolderName}/${file.path}` : file.path;
      folder?.file(path, file.content);
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
    for (const file of artifact.files) {
      const path = artifact.rootFolderName ? `${artifact.rootFolderName}/${file.path}` : file.path;
      zip.file(path, file.content);
    }
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
  rootFolderName?: string,
): PreviewArtifact {
  return {
    id,
    filename,
    contentType: 'application/zip',
    disposition: 'attachment',
    files,
    rootFolderName,
  };
}

function buildDisclosureRoom() {
  const docs = demoDocs('tier_2');
  const readiness = readinessFor(docs);
  const openItems = openItemsFor('tier_2');
  return buildEvidenceRoomFiles({
    tier: 'tier_2',
    companyName: COMPANY,
    generationDate: GENERATION_DATE,
    sourceUrl: SOURCE_URL,
    docs,
    readiness,
    openItems,
    supportEmail: SUPPORT_EMAIL,
  });
}

function buildGovernanceRoom() {
  const docs = demoDocs('tier_3');
  const readiness = readinessFor(docs);
  const openItems = openItemsFor('tier_3');
  return buildEvidenceRoomFiles({
    tier: 'tier_3',
    companyName: COMPANY,
    generationDate: GENERATION_DATE,
    sourceUrl: SOURCE_URL,
    docs,
    readiness,
    openItems,
    supportEmail: SUPPORT_EMAIL,
  });
}

function readinessFor(docs: GeneratedDoc[]) {
  return computeReadinessScore({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    citations_count: docs.flatMap((doc) => doc.citations).length,
  });
}

function openItemsFor(tier: Extract<Tier, 'tier_2' | 'tier_3'>) {
  return buildOpenReviewItems({
    extraction: demoExtraction(),
    answers: demoAnswers(),
    scope: demoScope(),
    tier,
  });
}

function demoExtraction(): ExtractionData {
  return {
    company_name: COMPANY,
    product_name: PRODUCT,
    product_description:
      'BrightDesk Copilot is a B2B AI assistant that helps customer-success teams summarize account notes, draft customer follow-ups, and search product knowledge base content.',
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
    notes: 'Sample package data for reviewing the output shape.',
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
        system_id: 'brightdesk-copilot-assistant',
        name: 'Customer-success assistant',
        description: 'Internal AI assistant for support and customer-success workflows.',
        feature_type: 'chatbot',
        ai_act_classification: 'limited_risk',
        ai_act_citation: 'EU AI Act transparency context; confirm final interpretation with qualified counsel.',
        our_role: 'provider',
        role_citation: 'Company controls product behavior and user-facing descriptions.',
        confidence_band: 'REVIEW',
        recommended_action:
          'Prepare a plain-English AI use summary, source-traced evidence tracker, and buyer/legal handoff.',
        applicable_disclosure_templates: [
          't1-01-chatbot-disclosure',
          't1-02-ai-content-labeling',
          't1-06-ai-system-disclosure-page',
          't1-07-ai-usage-policy-summary',
        ],
        notes: 'Sample system for package preview.',
      },
    ],
    overall_band: 'REVIEW',
    pack_metadata: {
      company_name: COMPANY,
      primary_ai_role: 'provider',
      has_eu_customers: true,
      risk_summary: 'Limited-risk transparency readiness likely; buyer/legal review should confirm final position.',
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
    doc('t1-02-ai-content-labeling', '02-ai-generated-content-labeling.md', 'AI-Generated Content Labeling Guidance'),
    doc('t1-06-ai-system-disclosure-page', '03-public-ai-disclosure-draft.md', 'Public AI Disclosure Draft'),
    doc('t1-07-ai-usage-policy-summary', '04-internal-ai-use-summary.md', 'Internal AI Use Summary'),
  ];
  if (tier === 'tier_2') return disclosureDocs;
  return [
    ...disclosureDocs,
    doc('t2-01-ai-system-inventory', '01-ai-system-inventory.md', 'AI System Inventory'),
    doc('t2-02-provider-deployer-memo', '02-provider-deployer-role-memo.md', 'Provider / Deployer Role Memo'),
    doc('t2-03-risk-classification-memo', '03-risk-classification-memo.md', 'EU AI Act Risk Classification Memo'),
    doc('t2-04-iso-42001-checklist', '04-iso-iec-42001-readiness-checklist.md', 'ISO/IEC 42001-Aligned Readiness Checklist'),
    doc('t2-05-evidence-tracker', '05-evidence-tracker.md', 'Evidence Tracker'),
    doc('t2-06-ai-policy-draft', '06-ai-governance-policy-starter.md', 'AI Governance Policy Starter'),
    doc('t2-07-human-oversight-procedure', '07-human-oversight-procedure.md', 'Human Oversight Procedure'),
    doc('t2-08-vendor-questionnaire', '08-vendor-provider-inventory.md', 'Vendor / Provider Inventory'),
    doc('t2-09-lawyer-handoff-pack', '09-buyer-legal-handoff-memo.md', 'Buyer / Legal Handoff Memo'),
    doc('t2-10-governance-roadmap', '10-readiness-roadmap.md', 'Readiness Roadmap'),
  ];
}

function doc(templateId: string, filename: string, title: string): GeneratedDoc {
  return {
    template_id: templateId,
    filename,
    content_md: [
      `# ${title} - ${COMPANY}`,
      '',
      '## Why this document exists',
      '',
      `${title} gives a buyer, legal reviewer, or internal operator a structured first draft for reviewing ${PRODUCT}.`,
      '',
      '## Draft substance',
      '',
      `${PRODUCT} supports customer-success workflows by summarizing account notes, drafting suggested follow-up messages, and retrieving relevant knowledge base content. Human team members review AI output before sending customer-facing communications.`,
      '',
      '## Buyer/legal questions this helps answer',
      '',
      '- What AI functionality is present in the product?',
      '- Where should users or buyers see disclosures?',
      '- What source material supports product claims?',
      '- What facts still require product, privacy, security, or counsel confirmation?',
      '',
      '## Source trail',
      '',
      `- ${SOURCE_URL}`,
      `- ${SECURITY_URL}`,
      '- Founder intake answers captured during TrustFolder assessment',
      '',
      '## Review status',
      '',
      'Confidence band: REVIEW. Confirm factual claims with product, security, privacy, and counsel before external sharing.',
      '',
      'Not legal advice. Not certification. Not a compliance guarantee.',
      '',
    ].join('\n'),
    confidence_band: 'REVIEW',
    citations: [SOURCE_URL, SECURITY_URL, 'Founder intake answers'],
    api_cost_cents: 0,
    duration_ms: 0,
    ok: true,
  };
}

function renderFreeCheckResult(): string {
  const readiness = readinessFor([]);
  return [
    '# Free Readiness Check Result - BrightDesk AI',
    '',
    'This sample shows the no-payment assessment output. It is not a document pack.',
    '',
    `## Readiness direction: ${readiness.band_label}`,
    '',
    `Score shown to orient the founder: ${readiness.overall}/100.`,
    '',
    '## What the customer receives',
    '',
    '- Fit/readiness result',
    '- Detected AI-use summary from the website scan',
    '- Recommended next TrustFolder path',
    '- Scope warnings if the use case looks sensitive',
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

function renderSnapshotHtml(): string {
  const readiness = readinessFor([]);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TrustFolder Lite Readiness Snapshot - ${COMPANY}</title>
<style>
body { margin: 0; background: #fbfaf6; color: #09231b; font-family: Arial, sans-serif; line-height: 1.6; }
main { max-width: 900px; margin: 0 auto; padding: 48px 28px; }
.label { color: #0f7b5a; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; }
h1 { font-size: clamp(34px, 6vw, 60px); line-height: 1; letter-spacing: -.04em; margin: 12px 0 18px; }
.panel { background: white; border: 1px solid #ded8ca; border-radius: 18px; padding: 22px; margin: 18px 0; }
li { margin: 8px 0; }
</style>
</head>
<body>
<main>
<p class="label">$99 autonomous snapshot</p>
<h1>Lite Readiness Snapshot - ${COMPANY}</h1>
<p>This single report helps a founder see the AI governance gaps a buyer or lawyer is likely to ask about first.</p>
<section class="panel">
<p class="label">Readiness</p>
<h2>${readiness.overall} / 100 - ${readiness.band_label}</h2>
<p>${readiness.disclaimer}</p>
</section>
<section class="panel">
<h2>What is inside</h2>
<ul>
<li>Executive summary of the product's AI use.</li>
<li>Likely buyer/legal questions.</li>
<li>Transparency readiness gaps.</li>
<li>Source-traced observations from the scanned site.</li>
<li>Recommended next documents and pack route.</li>
</ul>
</section>
<section class="panel">
<h2>Safe boundary</h2>
<p>Request-led product. Not instant checkout. Not legal advice. Not certification. Not a compliance guarantee.</p>
</section>
</main>
</body>
</html>`;
}

function requestModuleFiles(): PreviewFile[] {
  const modules = [
    ['eu-ai-act-high-risk-triage', 'EU AI Act High-Risk Triage'],
    ['annex-iv-technical-documentation-index', 'Annex IV Technical Documentation Index'],
    ['ai-transparency-disclosure-module', 'AI Transparency / Disclosure Module'],
    ['ai-vendor-questionnaire', 'AI Vendor Questionnaire'],
    ['dpia-support-pack', 'DPIA Support Pack'],
    ['fria-starter-pack', 'FRIA Starter Pack'],
    ['post-market-monitoring-starter', 'Post-Market Monitoring Starter'],
    ['serious-incident-reporting-sop', 'Serious Incident Reporting SOP Starter'],
    ['human-oversight-procedure', 'Human Oversight Procedure'],
    ['ai-governance-policy', 'AI Governance Policy'],
    ['security-questionnaire-support', 'Security Questionnaire Support'],
    ['buyer-review-response-pack', 'Buyer Review Response Pack'],
  ];
  return modules.map(([id, label]) =>
    file(
      `${id}.md`,
      [
        `# ${label}`,
        '',
        '## Delivery mode',
        '',
        'This module is manually scoped before fulfillment. It is not an instant checkout product and not a full compliance filing.',
        '',
        '## Customer receives',
        '',
        '- Intake summary',
        '- Applicability note',
        '- Starter artifact',
        '- Evidence requested',
        '- Open questions',
        '- Expert-review recommendation',
        '',
        '## Safe boundary',
        '',
        'Not legal advice. Not certification. Not a compliance guarantee. Sensitive or high-risk uses require expert review.',
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
<title>Premium Buyer/Legal Handoff - ${COMPANY}</title>
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
<p class="label">Premium request-led handoff</p>
<h1>Premium Buyer/Legal Handoff - ${COMPANY}</h1>
<p>This is the manually scoped upgrade for a serious buyer, procurement, or counsel review.</p>
<section class="panel">
<h2>What the customer receives</h2>
<ul>
<li>Everything in the Buyer-Ready Governance Folder.</li>
<li>Manually reviewed executive memo.</li>
<li>Buyer-specific Q&A response draft.</li>
<li>Vendor/security questionnaire starter.</li>
<li>Counsel handoff brief and revision log.</li>
<li>Expert-review flags for sensitive or high-risk areas.</li>
</ul>
</section>
<section class="panel">
<h2>Delivery mode</h2>
<p>Application-led and manually invoiced. The final scope is confirmed before fulfillment.</p>
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
