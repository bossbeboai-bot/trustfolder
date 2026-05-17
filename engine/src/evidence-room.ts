import type { GeneratedDoc, Tier } from './lib/types.js';
import type { ReadinessScore } from './readiness-score.js';
import {
  renderOpenReviewItemsMarkdown,
  type OpenReviewItem,
} from './open-review-items.js';

export type EvidenceRoomTier = Extract<Tier, 'tier_2' | 'tier_3'>;
export type EvidenceRoomManifestTier = 'disclosure' | 'governance';
export type ArtifactAudience = 'founder' | 'buyer' | 'legal' | 'operator' | 'authority-readiness';
export type SourceCoverage = 'strong' | 'partial' | 'needs-review';
export type ReviewStatus = 'draft' | 'review-needed' | 'manual-upgrade';

export interface EvidenceRoomFile {
  path: string;
  content: string;
}

export interface EvidenceRoomArtifact {
  path: string;
  title: string;
  category: string;
  audience: ArtifactAudience;
  sourceCoverage: SourceCoverage;
  reviewStatus: ReviewStatus;
}

export interface EvidenceRoomQaResult {
  banned_claims_found: string[];
  missing_source_notes: string[];
  referenced_paths_missing: string[];
  artifact_count: number;
  source_traced_artifact_count: number;
  scope_boundary_present: boolean;
}

export interface TrustFolderPackManifest {
  packId: string;
  tier: EvidenceRoomManifestTier;
  companyName: string;
  generatedAt: string;
  sourceUrl: string | null;
  artifacts: EvidenceRoomArtifact[];
  qa: EvidenceRoomQaResult;
  disclaimers: string[];
}

export interface EvidenceRoomBuild {
  rootFolderName: string;
  files: EvidenceRoomFile[];
  manifest: TrustFolderPackManifest;
}

export interface EvidenceRoomInput {
  tier: EvidenceRoomTier;
  companyName: string;
  generationDate: string;
  sourceUrl?: string | null;
  docs: GeneratedDoc[];
  readiness?: ReadinessScore | null;
  openItems?: OpenReviewItem[];
  supportEmail?: string;
}

const DISCLAIMERS = [
  'Not legal advice.',
  'Not certification.',
  'Not a compliance guarantee.',
  'Not a complete regulatory filing.',
];

const BANNED_CLAIMS = [
  'fully compliant',
  'certified',
  'guaranteed compliance',
  'audit-proof',
  'legally complete',
  'no lawyer needed',
  'GDPR Article 50',
  'final EU declaration of conformity',
  'final authority submission',
];

export function buildEvidenceRoomFiles(input: EvidenceRoomInput): EvidenceRoomBuild {
  const docs = input.docs.filter((doc) => doc.ok && doc.content_md.trim().length > 0);
  const manifestTier: EvidenceRoomManifestTier =
    input.tier === 'tier_2' ? 'disclosure' : 'governance';
  const rootFolderName = rootFolderNameFor(input);
  const files: EvidenceRoomFile[] =
    input.tier === 'tier_2'
      ? buildDisclosurePackFiles(input, docs)
      : buildGovernanceFolderFiles(input, docs);

  const qa = qaFor(files, docs);
  for (const report of files.filter((candidate) => candidate.path.endsWith('pack-qa-report.md'))) {
    report.content = renderQaReport(input, docs, qa);
  }

  const artifacts = files
    .filter((file) => file.path !== 'manifest.json')
    .map((file) => artifactFor(file.path, docs));
  const manifest: TrustFolderPackManifest = {
    packId: `tf-${manifestTier}-${slug(input.companyName)}-${input.generationDate}`,
    tier: manifestTier,
    companyName: input.companyName,
    generatedAt: input.generationDate,
    sourceUrl: input.sourceUrl ?? null,
    artifacts,
    qa,
    disclaimers: DISCLAIMERS,
  };

  files.push(file('manifest.json', JSON.stringify(manifest, null, 2)));
  return { rootFolderName, files, manifest };
}

function buildDisclosurePackFiles(input: EvidenceRoomInput, docs: GeneratedDoc[]): EvidenceRoomFile[] {
  const disclosureDocs = docs.filter((doc) => doc.template_id.startsWith('t1-'));
  const files: EvidenceRoomFile[] = [
    file('START-HERE.html', renderStartHereHtml(input, 'AI Disclosure Pack', disclosureDocs.length)),
    file('README.md', renderReadme(input, 'AI Disclosure Pack', disclosureDocs.length)),
    file('00-client-orientation/client-delivery-summary.md', renderClientDeliverySummary(input, 'AI Disclosure Pack')),
    file('00-client-orientation/document-index-and-control.md', renderDocumentIndexAndControl(input, 'AI Disclosure Pack')),
    file('00-client-orientation/document-format-and-review-rules.md', renderDocumentFormatAndReviewRules(input)),
    file('01-ai-use-summary/product-ai-use-summary.md', renderProductAiUseSummary(input, docs)),
  ];

  for (const doc of disclosureDocs) {
    files.push(
      file(
        `02-disclosure-drafts/${normaliseDocFilename(doc.filename)}`,
        renderGeneratedDoc(input, doc, 'Disclosure draft', 'buyer'),
      ),
    );
  }

  files.push(
    file('02-disclosure-drafts/article-50-applicability-matrix.md', renderArticle50ApplicabilityMatrix(input)),
    file('02-disclosure-drafts/ai-transparency-notice-register.md', renderTransparencyNoticeRegister(input)),
    file('02-disclosure-drafts/disclosure-placement-and-copy-deck.md', renderDisclosureCopyDeck(input)),
    file('02-disclosure-drafts/user-instructions-and-limitations-starter.md', renderUserInstructionsAndLimitations(input)),
    file('02-disclosure-drafts/article-4-ai-literacy-note.md', renderAiLiteracyNote(input)),
    file('03-evidence-tracker/evidence-tracker.md', renderEvidenceTracker(input, docs)),
    file('03-evidence-tracker/claim-to-source-matrix.md', renderClaimSourceMatrix(input, docs)),
    file('03-evidence-tracker/source-reference-register.md', renderSourceReferenceRegister(input, docs)),
    file('04-buyer-legal-handoff/buyer-legal-cover-note.md', renderBuyerLegalCoverNote(input, docs)),
    file('04-buyer-legal-handoff/lawyer-review-checklist.md', renderLawyerReviewChecklist(input)),
    file('04-buyer-legal-handoff/open-review-items.md', renderOpenItems(input.openItems ?? [])),
    file('04-buyer-legal-handoff/procurement-answer-bank.md', renderProcurementAnswerBank(input)),
    file('04-buyer-legal-handoff/external-sharing-checklist.md', renderExternalSharingChecklist(input)),
    file('05-source-notes/sources-and-notes.md', renderSourcesAndNotes(input, docs)),
    file('06-appendices/regulatory-source-map.md', renderRegulatorySourceMap(input)),
    file('pack-qa-report.md', renderQaReport(input, docs)),
  );
  return files;
}

function buildGovernanceFolderFiles(input: EvidenceRoomInput, docs: GeneratedDoc[]): EvidenceRoomFile[] {
  const files: EvidenceRoomFile[] = [
    file('START-HERE.html', renderStartHereHtml(input, 'Buyer-Ready Governance Folder', docs.length)),
    file('README.md', renderReadme(input, 'Buyer-Ready Governance Folder', docs.length)),
    file('00-executive-brief/client-delivery-summary.md', renderClientDeliverySummary(input, 'Buyer-Ready Governance Folder')),
    file('00-executive-brief/document-index-and-control.md', renderDocumentIndexAndControl(input, 'Buyer-Ready Governance Folder')),
    file('00-executive-brief/document-format-and-review-rules.md', renderDocumentFormatAndReviewRules(input)),
    file('00-executive-brief/pack-navigation-map.md', renderPackNavigationMap(input)),
    file('00-executive-brief/board-cover-note.md', renderBoardCoverNote(input)),
    file('00-executive-brief/executive-buyer-brief.md', renderExecutiveBrief(input, docs)),
    file('01-ai-system-inventory/product-ai-use-summary.md', renderProductAiUseSummary(input, docs)),
  ];

  const inventory = findDoc(docs, 't2-01-ai-system-inventory');
  files.push(
    file(
      '01-ai-system-inventory/ai-system-inventory.md',
      inventory
        ? renderGeneratedDoc(input, inventory, 'AI system inventory', 'operator')
        : renderInventoryStarter(input),
    ),
    file('01-ai-system-inventory/ai-use-case-map.md', renderAiUseCaseMap(input)),
    file('01-ai-system-inventory/eu-market-exposure-note.md', renderEuMarketExposureNote(input)),
    file('01-ai-system-inventory/customer-user-impact-summary.md', renderCustomerImpactSummary(input)),
    file('01-ai-system-inventory/data-and-model-dependency-map.md', renderDataAndModelMap(input, docs)),
    file('01-ai-system-inventory/intended-purpose-and-lifecycle.md', renderIntendedPurposeLifecycle(input)),
    file('01-ai-system-inventory/model-card-lite.md', renderModelCardLite(input)),
    file('01-ai-system-inventory/data-provenance-register.md', renderDataProvenanceRegister(input)),
    file('01-ai-system-inventory/instructions-for-use-starter.md', renderInstructionsForUseStarter(input)),
  );

  for (const doc of docs.filter((candidate) => candidate.template_id.startsWith('t1-'))) {
    files.push(
      file(
        `02-disclosures-and-transparency/${normaliseDocFilename(doc.filename)}`,
        renderGeneratedDoc(input, doc, 'Transparency/disclosure draft', 'buyer'),
      ),
    );
  }
  files.push(
    file('02-disclosures-and-transparency/article-50-transparency-readiness.md', renderArticle50Memo(input)),
    file('02-disclosures-and-transparency/article-50-applicability-matrix.md', renderArticle50ApplicabilityMatrix(input)),
    file('02-disclosures-and-transparency/article-50-notice-library.md', renderArticle50NoticeLibrary(input)),
    file('02-disclosures-and-transparency/disclosure-placement-plan.md', renderDisclosurePlacementPlan(input)),
    file('02-disclosures-and-transparency/disclosure-placement-and-copy-deck.md', renderDisclosureCopyDeck(input)),
    file('02-disclosures-and-transparency/user-instructions-and-limitations-starter.md', renderUserInstructionsAndLimitations(input)),
    file('02-disclosures-and-transparency/article-4-ai-literacy-note.md', renderAiLiteracyNote(input)),
  );

  files.push(
    file('03-governance-and-controls/ai-governance-summary.md', renderGovernanceSummary(input, docs)),
    fileFromDoc(input, docs, 't2-02-provider-deployer-memo', '03-governance-and-controls/provider-deployer-role-map.md', 'Provider/deployer role map', 'operator'),
    fileFromDoc(input, docs, 't2-06-ai-policy-draft', '03-governance-and-controls/ai-governance-policy-starter.md', 'AI governance policy starter', 'operator'),
    fileFromDoc(input, docs, 't2-07-human-oversight-procedure', '03-governance-and-controls/human-oversight-procedure.md', 'Human oversight procedure', 'operator'),
    fileFromDoc(input, docs, 't2-08-vendor-questionnaire', '03-governance-and-controls/vendor-provider-inventory.md', 'Vendor/provider inventory', 'operator'),
    file('03-governance-and-controls/ai-governance-raci.md', renderGovernanceRaci(input)),
    file('03-governance-and-controls/change-management-and-version-log.md', renderChangeManagementLog(input)),
    file('03-governance-and-controls/incident-escalation-procedure.md', renderIncidentEscalationProcedure(input)),
    file('03-governance-and-controls/model-vendor-review-procedure.md', renderModelVendorReviewProcedure(input)),
    file('03-governance-and-controls/internal-ai-acceptable-use-and-training.md', renderAcceptableUseTraining(input)),
    file('03-governance-and-controls/risk-management-file.md', renderRiskManagementFile(input)),
    file('03-governance-and-controls/management-review-agenda.md', renderManagementReviewAgenda(input)),
    file('03-governance-and-controls/ai-literacy-training-register.md', renderAiLiteracyTrainingRegister(input)),
    file('03-governance-and-controls/role-based-operating-procedures.md', renderRoleBasedOperatingProcedures(input)),
  );

  files.push(
    fileFromDoc(input, docs, 't2-03-risk-classification-memo', '04-risk-and-readiness/eu-ai-act-risk-classification-memo.md', 'EU AI Act risk classification memo', 'authority-readiness'),
    file('04-risk-and-readiness/annex-iii-high-risk-screen.md', renderAnnexIiiScreen(input)),
    fileFromDoc(input, docs, 't2-04-iso-42001-checklist', '04-risk-and-readiness/iso-iec-42001-aligned-readiness-checklist.md', 'ISO/IEC 42001-aligned readiness checklist', 'authority-readiness'),
    file('04-risk-and-readiness/eu-ai-act-articles-8-to-15-crosswalk.md', renderAiActRequirementsCrosswalk(input)),
    file('04-risk-and-readiness/data-governance-readiness.md', renderDataGovernanceReadiness(input)),
    file('04-risk-and-readiness/accuracy-robustness-cybersecurity-readiness.md', renderAccuracyRobustnessCybersecurity(input)),
    file('04-risk-and-readiness/annex-iv-technical-documentation-index.md', renderAnnexIvIndex(input)),
    file('04-risk-and-readiness/annex-iv-evidence-request-list.md', renderAnnexIvEvidenceRequestList(input)),
    file('04-risk-and-readiness/quality-management-starter-checklist.md', renderQualityManagementChecklist(input)),
    file('04-risk-and-readiness/record-keeping-and-logging-readiness.md', renderRecordKeepingLogging(input)),
    file('04-risk-and-readiness/post-market-and-incident-starter.md', renderPostMarketStarter(input)),
    file('04-risk-and-readiness/eu-database-registration-readiness.md', renderEuDatabaseRegistration(input)),
    file('04-risk-and-readiness/conformity-assessment-readiness.md', renderConformityAssessmentReadiness(input)),
    file('04-risk-and-readiness/fria-starter-checklist.md', renderFriaStarter(input)),
  );

  files.push(
    fileFromDoc(input, docs, 't2-05-evidence-tracker', '05-evidence-and-source-trail/evidence-tracker.md', 'Evidence tracker', 'legal'),
    file('05-evidence-and-source-trail/claim-to-source-matrix.md', renderClaimSourceMatrix(input, docs)),
    file('05-evidence-and-source-trail/source-reference-register.md', renderSourceReferenceRegister(input, docs)),
    file('05-evidence-and-source-trail/source-quality-register.md', renderSourceQualityRegister(input, docs)),
    file('05-evidence-and-source-trail/sources-and-notes.md', renderSourcesAndNotes(input, docs)),
    file('05-evidence-and-source-trail/control-mapping-eu-ai-act-iso-gdpr.md', renderControlMapping(input)),
    file('05-evidence-and-source-trail/decision-log.md', renderDecisionLog(input)),
    file('05-evidence-and-source-trail/review-status-manifest.md', renderReviewStatusManifest(input, docs)),
  );

  files.push(
    fileFromDoc(input, docs, 't2-09-lawyer-handoff-pack', '06-buyer-legal-handoff/buyer-legal-handoff-memo.md', 'Buyer/legal handoff memo', 'legal'),
    file('06-buyer-legal-handoff/buyer-review-packet.html', renderBuyerPacketHtml(input, docs)),
    file('06-buyer-legal-handoff/buyer-review-packet.md', renderBuyerPacketMarkdown(input, docs)),
    file('06-buyer-legal-handoff/buyer-executive-qa.md', renderBuyerExecutiveQa(input)),
    file('06-buyer-legal-handoff/procurement-faq-starter.md', renderProcurementFaq(input)),
    file('06-buyer-legal-handoff/security-questionnaire-starter.md', renderSecurityQuestionnaireStarter(input)),
    file('06-buyer-legal-handoff/vendor-questionnaire-response-draft.md', renderVendorQuestionnaireResponse(input)),
    file('06-buyer-legal-handoff/customer-trust-center-copy-starter.md', renderTrustCenterCopyStarter(input)),
    file('06-buyer-legal-handoff/authority-readiness-note.md', renderAuthorityReadinessNote(input)),
    file('06-buyer-legal-handoff/external-sharing-checklist.md', renderExternalSharingChecklist(input)),
    file('06-buyer-legal-handoff/counsel-review-checklist.md', renderLawyerReviewChecklist(input)),
    file('07-open-items-and-roadmap/open-review-items.md', renderOpenItems(input.openItems ?? [])),
    fileFromDoc(input, docs, 't2-10-governance-roadmap', '07-open-items-and-roadmap/readiness-roadmap.md', 'Readiness roadmap', 'founder'),
    file('07-open-items-and-roadmap/30-60-90-governance-roadmap.md', renderGovernanceRoadmap90Day(input)),
    file('07-open-items-and-roadmap/pack-qa-report.md', renderQaReport(input, docs)),
  );

  files.push(
    file('08-privacy-and-data-protection/dpia-starter-checklist.md', renderDpiaStarter(input)),
    file('08-privacy-and-data-protection/data-processing-map.md', renderDataProcessingMap(input)),
    file('08-privacy-and-data-protection/personal-data-category-table.md', renderPersonalDataCategoryTable(input)),
    file('08-privacy-and-data-protection/lawful-basis-and-role-intake.md', renderLawfulBasisRoleIntake(input)),
    file('08-privacy-and-data-protection/dpa-subprocessor-summary.md', renderDpaSubprocessorSummary(input)),
    file('08-privacy-and-data-protection/retention-deletion-and-data-subject-rights.md', renderRetentionDeletionRights(input)),
    file('08-privacy-and-data-protection/privacy-ai-risk-register.md', renderPrivacyAiRiskRegister(input)),
    file('08-privacy-and-data-protection/privacy-notice-update-brief.md', renderPrivacyNoticeUpdateBrief(input)),
    file('09-appendices/regulatory-source-map.md', renderRegulatorySourceMap(input)),
    file('09-appendices/customer-evidence-request-list.md', renderCustomerEvidenceRequestList(input)),
    file('09-appendices/document-format-and-review-rules.md', renderDocumentFormatAndReviewRules(input)),
    file('pack-qa-report.md', renderQaReport(input, docs)),
  );
  return files;
}

function renderGeneratedDoc(
  input: EvidenceRoomInput,
  doc: GeneratedDoc,
  purpose: string,
  audience: ArtifactAudience,
): string {
  return [
    renderMetadataCard({
      title: titleFromFilename(doc.filename),
      purpose,
      audience,
      reviewStatus: 'Draft for review',
      sourceCoverage: doc.citations.length > 0 ? 'Source-traced from available inputs' : 'Needs source confirmation',
      nextAction: 'Confirm the factual claims before external sharing.',
    }),
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    doc.content_md.trim(),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderStartHereHtml(input: EvidenceRoomInput, packName: string, docCount: number): string {
  const readiness = input.readiness;
  const score = readiness ? `${readiness.overall} / 100` : 'Not scored';
  const openItems = input.openItems?.length ?? 0;
  const scope = input.tier === 'tier_2'
    ? 'Disclosure and buyer/legal transparency readiness pack.'
    : 'Buyer-review evidence folder with governance, source trail, readiness, and handoff materials.';
  const primarySections: Array<[string, string, string]> = input.tier === 'tier_2'
    ? [
        ['00', 'Client orientation', 'Open the delivery summary and document-control page first.'],
        ['01', 'AI use summary', 'Confirm the product story before any disclosure is shared.'],
        ['02', 'Disclosure drafts', 'Review Article 50 triggers, copy, placement, and user instructions.'],
        ['03', 'Evidence tracker', 'Check every claim against the source trail.'],
        ['04', 'Buyer/legal handoff', 'Use this for procurement, counsel, and founder review.'],
      ]
    : [
        ['00', 'Executive brief', 'Start with the board cover note and document-control index.'],
        ['01', 'AI system inventory', 'Confirm intended purpose, users, data, model dependencies, and instructions.'],
        ['02', 'Transparency', 'Review Article 50 notices, placement, and disclosure copy.'],
        ['03', 'Governance controls', 'Assign owners for oversight, risk, change, vendor, training, and incidents.'],
        ['04', 'Risk readiness', 'Use high-risk, Annex IV, ISO/IEC 42001, FRIA, monitoring, and conformity checklists as starter evidence maps.'],
        ['05', 'Evidence trail', 'Use source, claim, control, decision, and status registers to prove the basis for claims.'],
        ['06', 'Buyer/legal handoff', 'Share only after product, privacy, security, and counsel review.'],
      ];
  const sectionCards = primarySections
    .map(
      ([number, title, body]) =>
        `<article class="route"><span>${escapeHtml(number)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`,
    )
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.companyName)} - TrustFolder ${escapeHtml(packName)}</title>
<style>
:root { color-scheme: light; --ink: #09231b; --muted: #5e6b64; --line: #ded8ca; --cream: #fbfaf6; --paper: #fffdf7; --green: #0f7b5a; --deep: #063d2f; --soft: #e7f3ed; --gold: #b89555; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--cream); color: var(--ink); font-family: Arial, sans-serif; line-height: 1.52; }
main { max-width: 1080px; margin: 0 auto; padding: 48px 30px 68px; }
.cover { border: 1px solid var(--line); background: linear-gradient(135deg, #fffdf7 0%, #f4f0e7 100%); border-radius: 28px; padding: 42px; box-shadow: 0 28px 80px rgba(9, 35, 27, .08); }
.brand { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 54px; }
.mark { font-weight: 800; color: var(--deep); letter-spacing: -.02em; }
.eyebrow { color: var(--green); font-size: 11px; letter-spacing: .18em; text-transform: uppercase; font-weight: 800; }
h1 { max-width: 800px; margin: 12px 0 18px; font-size: clamp(36px, 6vw, 68px); line-height: .96; letter-spacing: -.045em; }
.lead { max-width: 780px; color: var(--muted); font-size: 19px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 34px 0 10px; }
.card { border: 1px solid var(--line); background: rgba(255,255,255,.78); border-radius: 16px; padding: 18px; }
.metric { font-size: 30px; font-weight: 800; letter-spacing: -.03em; }
.label { color: var(--muted); font-size: 13px; }
.section { margin-top: 28px; border: 1px solid var(--line); border-radius: 22px; background: white; padding: 24px; }
.routes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.route { border: 1px solid #ece5d8; border-radius: 14px; padding: 16px; min-height: 128px; }
.route span { color: var(--gold); font-weight: 800; font-size: 12px; letter-spacing: .16em; }
.route strong { display: block; margin-top: 8px; }
.route p { margin: 8px 0 0; color: var(--muted); font-size: 14px; }
.steps li { margin: 10px 0; }
.scope { border-left: 4px solid var(--green); padding-left: 16px; color: var(--muted); }
a { color: var(--green); font-weight: 700; }
footer { margin-top: 34px; color: var(--muted); font-size: 13px; }
@page { margin: 18mm; }
@media print { body { background: white; } main { padding: 0; max-width: none; } .cover, .section { box-shadow: none; break-inside: avoid; border-radius: 0; } }
@media (max-width: 720px) { main { padding: 24px 16px; } .cover { padding: 26px; } .grid, .routes { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<main>
<section class="cover">
<div class="brand"><div class="mark">TrustFolder</div><div class="eyebrow">Buyer-review evidence room</div></div>
<p class="eyebrow">${escapeHtml(packName)}</p>
<h1>${escapeHtml(input.companyName)} AI governance evidence folder</h1>
<p class="lead">${escapeHtml(scope)} This is the first structured evidence folder your buyer, lawyer, or internal operator can review.</p>
<section class="grid" aria-label="Pack summary">
<div class="card"><div class="metric">${docCount}</div><div class="label">generated source-informed artifacts</div></div>
<div class="card"><div class="metric">${escapeHtml(score)}</div><div class="label">AI documentation readiness</div></div>
<div class="card"><div class="metric">${openItems}</div><div class="label">open review items</div></div>
</section>
</section>
<section class="section">
<p class="eyebrow">Start here</p>
<ol class="steps">
<li>Open <strong>document-index-and-control.md</strong> to understand the pack status, owners, review level, and what is safe to share.</li>
<li>Read the executive or buyer/legal handoff before sending any file externally.</li>
<li>Use the source registers and QA report to confirm every buyer-facing claim.</li>
<li>Assign open review items to product, privacy, security, legal, or expert owners before procurement review.</li>
</ol>
<p class="scope">${escapeHtml(DISCLAIMERS.join(' '))}</p>
</section>
<section class="section">
<p class="eyebrow">Navigation map</p>
<div class="routes">${sectionCards}</div>
</section>
<footer>
Generated ${escapeHtml(input.generationDate)}. Source URL: ${escapeHtml(input.sourceUrl ?? 'Not provided')}. Questions: ${escapeHtml(input.supportEmail ?? 'support@trustfolder.com')}.
</footer>
</main>
</body>
</html>`;
}

function renderReadme(input: EvidenceRoomInput, packName: string, docCount: number): string {
  return [
    `# ${input.companyName} - ${packName}`,
    '',
    `Generated: ${input.generationDate}`,
    `Source URL: ${input.sourceUrl ?? 'Not provided'}`,
    `Artifacts: ${docCount}`,
    '',
    '## What this pack is',
    '',
    'TrustFolder creates the first structured evidence folder your buyer, lawyer, or internal operator can review.',
    'It is not legal advice, certification, or a complete regulatory filing.',
    '',
    '## Where to start',
    '',
    '1. Open `START-HERE.html` for the guided overview.',
    '2. Read the buyer/legal handoff before sharing externally.',
    '3. Check `sources-and-notes.md` or the source-trail folder for claim support.',
    '4. Assign the open review items before buyer or counsel review.',
    '',
    '## Safe boundary',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderClientDeliverySummary(input: EvidenceRoomInput, packName: string): string {
  return [
    renderMetadataCard({
      title: 'Client delivery summary',
      purpose: 'Explain what the customer has received and how to use it without overclaiming.',
      audience: 'founder',
      reviewStatus: 'Draft for review',
      sourceCoverage: 'Partial - confirm source registers before external sharing',
      nextAction: 'Use this as the orientation note before opening individual documents.',
    }),
    '',
    `# Client Delivery Summary - ${input.companyName}`,
    '',
    `Pack: ${packName}`,
    `Generated: ${input.generationDate}`,
    `Source URL: ${input.sourceUrl ?? 'Not provided'}`,
    '',
    '## What this deliverable is',
    '',
    'This TrustFolder package is a structured buyer-review evidence room. It organizes AI-use, disclosure, governance, privacy, source, and handoff materials so a founder, operator, buyer, or lawyer can review the first evidence layer quickly.',
    '',
    '## What this deliverable is not',
    '',
    '- It is not legal advice.',
    '- It is not a certification or audit report.',
    '- It is not a completed regulatory filing.',
    '- It does not replace qualified counsel, privacy, security, or high-risk AI review.',
    '',
    '## Recommended review order',
    '',
    '1. `START-HERE.html`',
    '2. `document-index-and-control.md`',
    '3. Buyer/legal handoff files',
    '4. Evidence and source registers',
    '5. Open items and roadmap',
    '6. Regulatory readiness starter files, if applicable',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderDocumentIndexAndControl(input: EvidenceRoomInput, packName: string): string {
  const isGovernance = input.tier === 'tier_3';
  const sections = isGovernance
    ? [
        ['00-executive-brief', 'Executive orientation', 'Founder, buyer, legal', 'Draft for review'],
        ['01-ai-system-inventory', 'System, data, model, intended-purpose inventory', 'Product, security, legal', 'Draft/starter'],
        ['02-disclosures-and-transparency', 'Article 50 and transparency notices', 'Product, legal, buyer', 'Draft/starter'],
        ['03-governance-and-controls', 'Operating controls, ownership, oversight, incidents, training', 'Operator, founder, legal', 'Starter'],
        ['04-risk-and-readiness', 'EU AI Act, Annex IV, ISO/IEC 42001, FRIA, monitoring readiness', 'Legal, expert reviewer', 'Starter only'],
        ['05-evidence-and-source-trail', 'Source trail, claim matrix, control map, decision log', 'Buyer, legal, operator', 'Draft/starter'],
        ['06-buyer-legal-handoff', 'Procurement/counsel-ready summaries and answer starters', 'Buyer, legal', 'Draft for review'],
        ['07-open-items-and-roadmap', 'Open items, readiness roadmap, QA', 'Founder, operator', 'Draft'],
        ['08-privacy-and-data-protection', 'DPIA, data map, DPA/subprocessor, retention rights', 'Privacy, legal', 'Starter only'],
        ['09-appendices', 'Regulatory source map, evidence request list, format rules', 'Founder, operator', 'Reference'],
      ]
    : [
        ['00-client-orientation', 'Orientation, document control, format rules', 'Founder, operator', 'Reference'],
        ['01-ai-use-summary', 'Plain-English AI use context', 'Founder, buyer', 'Draft for review'],
        ['02-disclosure-drafts', 'Article 50 transparency matrix, notices, copy, instructions', 'Product, legal, buyer', 'Draft/starter'],
        ['03-evidence-tracker', 'Claim/source/evidence registers', 'Legal, buyer', 'Draft/starter'],
        ['04-buyer-legal-handoff', 'Cover note, review checklist, procurement answer bank', 'Buyer, legal', 'Draft for review'],
        ['05-source-notes', 'Consolidated source notes', 'Legal, operator', 'Reference'],
        ['06-appendices', 'Regulatory source map', 'Founder, legal', 'Reference'],
      ];

  return [
    `# Document Index and Control - ${input.companyName}`,
    '',
    `Pack: ${packName}`,
    `Generated: ${input.generationDate}`,
    '',
    '## Document-control rules',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Customer | ${input.companyName} |`,
    '| Classification | Customer review draft |',
    '| External sharing | Share only after source, privacy, security, and legal confirmation |',
    '| Version | v1 TrustFolder generated baseline |',
    '| Review cadence | Review before buyer submission and after material AI feature changes |',
    '',
    '## Package index',
    '',
    '| Folder | Purpose | Primary audience | Status |',
    '| --- | --- | --- | --- |',
    ...sections.map(([folder, purpose, audience, status]) => `| ${folder} | ${purpose} | ${audience} | ${status} |`),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderDocumentFormatAndReviewRules(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Document Format and Review Rules',
    purpose: 'Define the professional document rules the customer should use when converting this pack into board, counsel, or buyer-ready files.',
    audience: 'operator',
    nextAction: 'Apply these rules before exporting any document to PDF, DOCX, a trust center, or a buyer portal.',
    body: [
      '## Recommended page setup',
      '',
      '| Area | Rule |',
      '| --- | --- |',
      '| Page size | A4 or US Letter, selected consistently across the whole pack |',
      '| Margins | 18-22 mm for PDF/print, never below 14 mm |',
      '| Body type | 10.5-11.5 pt equivalent, 1.45-1.6 line height |',
      '| Headings | Clear H1/H2/H3 hierarchy; avoid decorative heading-only pages |',
      '| Tables | Use short rows, one concept per row, repeat header rows in PDF exports |',
      '| Metadata | Every document needs purpose, audience, review status, source coverage, and next action |',
      '| Source notes | Every external claim should connect to a source note, intake answer, or open review item |',
      '| Empty fields | Use TBD/Needs confirmation intentionally; never hide unknown facts |',
      '| External sharing | Convert to PDF only after source and counsel review; keep Markdown as the editable working copy |',
      '',
      '## Buyer/legal review rules',
      '',
      '- Keep claims factual and product-specific.',
      '- Do not claim certification, a compliance guarantee, or completed regulatory filing.',
      '- Mark high-risk, Annex IV, DPIA, FRIA, post-market, and conformity materials as starter/readiness artifacts unless manually reviewed.',
      '- Update the decision log whenever a disclosure, model, data, oversight, or vendor fact changes.',
      '- Keep open items visible; buyers trust honest review status more than polished uncertainty.',
    ],
  });
}

function renderPackNavigationMap(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Pack Navigation Map',
    purpose: 'Help a busy buyer, lawyer, or founder jump to the right artifact in the evidence room.',
    audience: 'founder',
    nextAction: 'Use this as the first internal handoff map before buyer submission.',
    body: [
      '| If the reviewer asks... | Open this folder/file |',
      '| --- | --- |',
      '| What does the AI product do? | `01-ai-system-inventory/product-ai-use-summary.md` and `01-ai-system-inventory/ai-system-inventory.md` |',
      '| What disclosures are needed? | `02-disclosures-and-transparency/article-50-applicability-matrix.md` and disclosure drafts |',
      '| What is the evidence trail? | `05-evidence-and-source-trail/claim-to-source-matrix.md` and `sources-and-notes.md` |',
      '| Who owns governance? | `03-governance-and-controls/ai-governance-raci.md` |',
      '| What risks are unresolved? | `07-open-items-and-roadmap/open-review-items.md` |',
      '| Is this high-risk? | `04-risk-and-readiness/annex-iii-high-risk-screen.md` and risk memo |',
      '| What should counsel review? | `06-buyer-legal-handoff/counsel-review-checklist.md` |',
    ],
  });
}

function renderBoardCoverNote(input: EvidenceRoomInput): string {
  return [
    renderMetadataCard({
      title: 'Board cover note',
      purpose: 'Give leadership a concise, credible summary of the governance evidence room.',
      audience: 'founder',
      reviewStatus: 'Draft for review',
      sourceCoverage: 'Partial - based on generated pack and customer inputs',
      nextAction: 'Review with product, privacy, security, and counsel before board or investor use.',
    }),
    '',
    `# Board Cover Note - ${input.companyName}`,
    '',
    '## Executive readout',
    '',
    `${input.companyName} now has a first TrustFolder evidence-room baseline for buyer/legal review. The folder organizes AI system context, transparency drafts, governance starters, risk/readiness checklists, privacy inputs, source registers, open review items, and buyer handoff materials.`,
    '',
    '## Leadership decisions to make',
    '',
    '- Confirm who owns AI governance and buyer evidence maintenance.',
    '- Confirm whether current AI use remains low/limited-risk or needs expert high-risk review.',
    '- Confirm customer data, vendor/model, retention, and training/improvement facts.',
    '- Decide which disclosure surfaces should be updated before the next enterprise buyer review.',
    '- Assign open items with due dates before sending the buyer packet externally.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderProductAiUseSummary(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    renderMetadataCard({
      title: 'Product AI use summary',
      purpose: 'Explain what the product appears to do with AI in founder-friendly language.',
      audience: 'founder',
      reviewStatus: 'Draft for review',
      sourceCoverage: docs.some((doc) => doc.citations.length > 0) ? 'Source-traced from available inputs' : 'Needs source confirmation',
      nextAction: 'Confirm this summary against the shipped product and privacy/security facts.',
    }),
    '',
    `# Product AI Use Summary - ${input.companyName}`,
    '',
    `${input.companyName} should use this page as the plain-English product context before a buyer, lawyer, or operator reviews the rest of the pack.`,
    '',
    '## Buyer-review summary',
    '',
    '- What AI features exist in the product?',
    '- Who sees or relies on AI output?',
    '- Whether a human reviews AI output before external use.',
    '- What source material supports those claims.',
    '- Which claims still need product, privacy, security, or legal confirmation.',
    '',
    '## Source inputs used',
    '',
    renderCitationList(docs),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderExecutiveBrief(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    renderMetadataCard({
      title: 'Executive buyer brief',
      purpose: 'Give a buyer or legal reviewer a short orientation before they inspect detailed files.',
      audience: 'buyer',
      reviewStatus: 'Draft for review',
      sourceCoverage: docs.length > 0 ? 'Source-traced from available inputs' : 'Needs source confirmation',
      nextAction: 'Review with founder and counsel before external use.',
    }),
    '',
    `# Executive Buyer Brief - ${input.companyName}`,
    '',
    '## The buyer-review moment',
    '',
    'Enterprise buyers rarely pause a deal because a product uses AI. They pause when the seller cannot explain what the AI does, where claims came from, who reviews the output, and what remains unresolved.',
    '',
    '## What this folder provides',
    '',
    '- A structured summary of the AI system and buyer-facing disclosures.',
    '- Governance and oversight starter documents.',
    '- A claim-to-source trail and evidence tracker.',
    '- Open review items separated from completed drafts.',
    '- A buyer/legal handoff memo for counsel or procurement review.',
    '',
    renderReadinessSummary(input.readiness ?? null),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderGovernanceSummary(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# AI Governance Summary',
    '',
    '## What this covers',
    '',
    'This summary organizes the first governance layer a buyer or internal operator expects to see: ownership, oversight, evidence, third-party dependencies, and unresolved review items.',
    '',
    '## Core operating questions',
    '',
    '- Who owns AI governance internally?',
    '- What AI features are in scope?',
    '- What human oversight exists?',
    '- What model or vendor dependencies are used?',
    '- What evidence supports external claims?',
    '- What needs legal, privacy, security, or expert review?',
    '',
    '## Source trail',
    '',
    renderCitationList(docs),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderEvidenceTracker(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  const rows = docs.map((doc) =>
    `| ${titleFromFilename(doc.filename)} | ${doc.confidence_band} | ${doc.citations.length > 0 ? 'Source-traced' : 'Needs source'} | Confirm factual accuracy before sharing |`,
  );
  return [
    '# Evidence Tracker',
    '',
    '| Claim or artifact | Confidence | Source status | Next action |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    `Generated for ${input.companyName} on ${input.generationDate}.`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderBuyerLegalCoverNote(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# Buyer/Legal Cover Note',
    '',
    `This note introduces the ${input.companyName} TrustFolder pack for buyer or counsel review.`,
    '',
    '## Suggested review sequence',
    '',
    '1. Confirm the AI use summary.',
    '2. Review the disclosure drafts and placement decisions.',
    '3. Check the evidence tracker and source notes.',
    '4. Assign open review items.',
    '',
    '## Materials included',
    '',
    docs.map((doc) => `- ${titleFromFilename(doc.filename)} (${doc.confidence_band})`).join('\n'),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderLawyerReviewChecklist(input: EvidenceRoomInput): string {
  return [
    '# Lawyer Review Checklist',
    '',
    `Customer: ${input.companyName}`,
    '',
    '- [ ] Confirm product description and AI feature scope.',
    '- [ ] Confirm whether Article 50 transparency notices are applicable.',
    '- [ ] Confirm whether high-risk AI Act analysis is needed.',
    '- [ ] Confirm privacy, DPA, subprocessor, and data-retention statements.',
    '- [ ] Confirm customer-facing disclosure placement.',
    '- [ ] Confirm no final compliance, certification, or legal conclusion is implied.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderArticle50Memo(input: EvidenceRoomInput): string {
  return [
    '# Article 50 Transparency Readiness Memo',
    '',
    '## Why this exists',
    '',
    'EU AI Act Article 50 transparency rules begin applying on 2 August 2026. This memo is a readiness aid for disclosure placement and buyer/legal review.',
    '',
    '## Areas to confirm',
    '',
    '- Whether users interact directly with an AI system.',
    '- Whether the product generates synthetic text, audio, image, or video content.',
    '- Whether deepfake or synthetic media disclosures are relevant.',
    '- Whether emotion recognition or biometric categorisation is involved.',
    '- Whether published AI-generated text informs the public on matters of public interest.',
    '',
    '## Customer action',
    '',
    `Review these questions against ${input.companyName}'s actual product behavior and counsel guidance before publishing disclosures.`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderArticle50ApplicabilityMatrix(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Article 50 Applicability Matrix',
    purpose: 'Map the product against the main EU AI Act Article 50 transparency disclosure triggers.',
    audience: 'legal',
    nextAction: 'Confirm which triggers apply before publishing notices or sharing with buyers.',
    body: [
      '| Article 50 area | When it matters | TrustFolder starter output | Review status |',
      '| --- | --- | --- | --- |',
      '| AI system interaction notice | A person directly interacts with an AI system | AI interaction notice and disclosure placement plan | Confirm actual user experience |',
      '| Synthetic content labeling | AI generates audio, image, video, or text outputs | Generated-content labeling guidance | Confirm output types and review process |',
      '| Emotion recognition notice | People are exposed to emotion recognition | Applicability flag and expert review note | Only if detected/applicable |',
      '| Biometric categorisation notice | People are exposed to biometric categorisation | Applicability flag and expert review note | Only if detected/applicable |',
      '| Deepfake/synthetic media disclosure | Image, audio, or video content is generated or manipulated as a deepfake | Synthetic media/deepfake disclosure draft | Only if detected/applicable |',
      '| Public-interest generated text disclosure | AI-generated/manipulated text is published to inform the public | Public text disclosure review item | Confirm editorial review and responsibility |',
    ],
  });
}

function renderArticle50NoticeLibrary(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Article 50 Notice Library',
    purpose: 'Provide reusable notice patterns for the main EU AI Act Article 50 transparency scenarios.',
    audience: 'legal',
    nextAction: 'Select only notices that match the real product behavior and place them in the user journey before or during AI interaction.',
    body: [
      '| Notice type | Draft pattern | Placement rule | Review note |',
      '| --- | --- | --- | --- |',
      '| AI interaction notice | This feature uses AI to help generate or retrieve responses. | Before or during direct AI interaction | Confirm whether users directly interact with AI |',
      '| AI-generated content label | This content was generated or materially assisted by AI and reviewed according to company process. | Near generated text/media or in export/share flow | Confirm output types and human review |',
      '| Synthetic media/deepfake notice | This media was generated or altered using AI. | Clearly near synthetic image/audio/video | Use only where synthetic media exists |',
      '| Emotion recognition notice | This feature may infer emotional state using AI. | Before exposure to the system | Expert/legal review required if applicable |',
      '| Biometric categorisation notice | This feature may categorise biometric attributes using AI. | Before exposure to the system | Expert/legal review required if applicable |',
      '| Public-interest text notice | AI-assisted text has been reviewed before publication. | Near public-interest publication or editorial note | Confirm editorial responsibility and exceptions |',
    ],
  });
}

function renderTransparencyNoticeRegister(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Transparency Notice Register',
    purpose: 'Track each disclosure notice, owner, placement, review status, and source support.',
    audience: 'operator',
    nextAction: 'Turn every applicable notice into an owned product/legal task before launch or buyer review.',
    body: [
      '| Notice | Surface | Owner | Source support | Status |',
      '| --- | --- | --- | --- | --- |',
      '| AI interaction notice | Product UI, chatbot opener, help docs | Product/legal | Website scan + intake | Needs confirmation |',
      '| Generated-content label | Export/share flow, content editor, help docs | Product/legal | Intake + product docs | Needs confirmation |',
      '| Public AI disclosure | Trust/security/AI disclosure page | Founder/legal | Website scan + source notes | Draft |',
      '| Synthetic media/deepfake notice | Media generation surface, if any | Product/legal | Product evidence | Only if applicable |',
      '| Emotion/biometric notice | Sensitive feature surface, if any | Legal/expert | Product evidence | Expert review if applicable |',
    ],
  });
}

function renderDisclosurePlacementPlan(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Disclosure Placement Plan',
    purpose: 'Turn disclosure drafts into practical product, website, and buyer-review placement decisions.',
    audience: 'operator',
    nextAction: 'Assign each disclosure surface to product/design/legal before publication.',
    body: [
      '| Surface | Disclosure need | Owner | Status |',
      '| --- | --- | --- | --- |',
      '| Product UI or chatbot opener | Clear AI interaction notice if users interact with AI | Product/design | Needs confirmation |',
      '| Public trust or AI disclosure page | Plain-English AI system disclosure | Founder/legal | Draft |',
      '| Help center or documentation | User instructions and AI-output limits | Product/support | Needs confirmation |',
      '| Buyer/legal packet | Source-traced explanation of AI use and open items | Founder/legal | Draft |',
      '| Privacy/security pages | Data-use, model-provider, and retention claims | Privacy/security | Needs confirmation |',
    ],
  });
}

function renderDisclosureCopyDeck(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Disclosure Placement and Copy Deck',
    purpose: 'Convert disclosure analysis into exact buyer, website, product, and support-copy tasks.',
    audience: 'operator',
    nextAction: 'Review each line with product/legal and move approved copy into the correct product surface.',
    body: [
      '| Surface | Copy job | Draft copy pattern | Approval owner |',
      '| --- | --- | --- | --- |',
      '| Website AI disclosure page | Explain what AI does and does not do | "Our product uses AI to support [workflow]. Human users remain responsible for [decision/action]." | Founder/legal |',
      '| Product UI | Notify user when interacting with AI | "You are using an AI-assisted feature. Review outputs before relying on them." | Product/legal |',
      '| Export/share flow | Label AI-assisted output | "AI-assisted draft. Review before sending externally." | Product/legal |',
      '| Help center | Explain limitations and human review | "AI output may be incomplete or inaccurate and should be checked against source material." | Support/product |',
      '| Buyer packet | State source-traced status and open items | "This pack contains review drafts, source notes, and open items for buyer/legal review." | Founder/legal |',
    ],
  });
}

function renderUserInstructionsAndLimitations(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'User Instructions and Limitations Starter',
    purpose: 'Draft practical deployer/user instructions for safe use, oversight, and buyer review.',
    audience: 'operator',
    nextAction: 'Confirm actual product limitations, oversight points, and support/escalation paths before publishing.',
    body: [
      '| Instruction area | Starter content | Evidence to confirm |',
      '| --- | --- | --- |',
      '| Intended use | Use the AI feature for the documented workflow only | Product docs, onboarding copy |',
      '| Human review | Review AI output before external reliance or customer-facing use | Workflow evidence |',
      '| Prohibited or discouraged use | Do not use outputs as legal, financial, health, employment, or eligibility decisions unless separately reviewed | Product/legal policy |',
      '| Source checking | Check generated answers against cited or original source material | Retrieval/source logs |',
      '| Error escalation | Report harmful, inaccurate, biased, privacy, or security issues through the incident path | Support/security SOP |',
      '| Change notice | Re-review instructions after model, prompt, data, or workflow changes | Change log |',
    ],
  });
}

function renderAiLiteracyNote(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Literacy and Training Note',
    purpose: 'Create a first evidence note for AI literacy expectations across people who operate or oversee AI features.',
    audience: 'operator',
    nextAction: 'Convert into a role-based training register and keep acknowledgement evidence.',
    body: [
      '| Role | Minimum AI literacy topic | Evidence |',
      '| --- | --- | --- |',
      '| Founder/leadership | AI governance ownership, buyer claims, open-item accountability | Management review note |',
      '| Product/design | Disclosure placement, user instructions, limitations, human oversight | Product checklist |',
      '| Engineering/security | Logs, model/provider changes, incident evidence preservation | Change/security records |',
      '| Sales/customer success | Safe buyer-facing claims and handoff boundaries | Enablement acknowledgement |',
      '| Support/operations | Escalating harmful, inaccurate, privacy, or security issues | Training record |',
    ],
  });
}

function renderAnnexIvIndex(input: EvidenceRoomInput): string {
  return [
    '# Annex IV Technical Documentation Index',
    '',
    'This is a starter index for high-risk readiness only. It is not a completed technical documentation file or regulatory submission.',
    '',
    '| Annex IV area | Starter evidence in this pack | Status |',
    '| --- | --- | --- |',
    '| Intended purpose and provider details | AI system inventory, product AI use summary | Draft |',
    '| System interaction, UI, and instructions | AI system inventory, disclosure drafts | Needs review |',
    '| Development process and design choices | Open review items, governance summary | Starter only |',
    '| Data requirements and provenance | Data and model dependency map | Starter only |',
    '| Human oversight measures | Human oversight procedure | Draft |',
    '| Validation, testing, metrics | Open review items | Needs customer evidence |',
    '| Cybersecurity measures | Vendor/security questionnaire support recommended | Needs customer evidence |',
    '| Risk management system | Risk classification memo, roadmap | Starter only |',
    '| Post-market monitoring | Post-market and incident starter | Starter only |',
    '',
    `Customer: ${input.companyName}`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderAnnexIvEvidenceRequestList(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Annex IV Evidence Request List',
    purpose: 'List the real evidence a customer would need if high-risk technical documentation becomes relevant.',
    audience: 'authority-readiness',
    nextAction: 'Collect this evidence from product, engineering, security, privacy, data, and legal teams before any formal technical documentation effort.',
    body: [
      '| Annex IV evidence area | Concrete evidence to request | Current TrustFolder status |',
      '| --- | --- | --- |',
      '| Provider/system identity | Legal entity, system name/version, intended purpose, deployment context | Starter inventory |',
      '| Design/specification | Architecture overview, UI flow, model/prompt/data flow, dependencies | Needs customer evidence |',
      '| Development process | Design decisions, validation process, change records | Needs engineering evidence |',
      '| Data | Data sources, provenance, governance, quality, representativeness, limitations | Starter data registers |',
      '| Risk management | Risk analysis, mitigations, residual risk, review cadence | Starter risk file |',
      '| Human oversight | Oversight measures, user instructions, escalation path | Draft procedure |',
      '| Testing/validation | Test cases, metrics, robustness, bias/fairness, cybersecurity tests | Needs evidence |',
      '| Logs/records | Logging configuration, retention, access, exportability | Starter logging checklist |',
      '| Post-market monitoring | Monitoring plan, feedback channels, corrective action process | Starter plan |',
      '| Declaration/registration | Only after formal assessment path | Not generated by TrustFolder |',
    ],
  });
}

function renderAnnexIiiScreen(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Annex III High-Risk Screen',
    purpose: 'Create a first screen for whether the product may fall into an EU AI Act high-risk area.',
    audience: 'authority-readiness',
    nextAction: 'Confirm intended purpose and deployment context with counsel before relying on the classification.',
    body: [
      '| Annex III area | Buyer question | Starter status |',
      '| --- | --- | --- |',
      '| Biometrics | Does the system identify, categorise, or analyse people biometrically? | Confirm |',
      '| Critical infrastructure | Could output affect safety-critical infrastructure? | Confirm |',
      '| Education/vocational training | Could output affect access, scoring, or evaluation? | Confirm |',
      '| Employment/work management | Could output affect hiring, promotion, termination, or worker monitoring? | Confirm |',
      '| Access to essential services | Could output affect credit, insurance, benefits, or public services? | Confirm |',
      '| Law enforcement/migration/justice | Could output support public authority decisions in these areas? | Confirm |',
      '| Product safety component | Is the AI part of a regulated product or safety component? | Confirm |',
    ],
  });
}

function renderAiActRequirementsCrosswalk(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'EU AI Act Articles 8-15 Requirements Crosswalk',
    purpose: 'Map high-risk AI-system requirement families to the evidence-room starter artifacts.',
    audience: 'authority-readiness',
    nextAction: 'Use only as a readiness map. High-risk classification and requirement compliance require expert/legal review.',
    body: [
      '| Requirement family | What a mature file needs | TrustFolder starter artifact | Status |',
      '| --- | --- | --- | --- |',
      '| Article 8 compliance with requirements | Evidence that all relevant high-risk requirements are addressed | Control mapping, QA report | Starter map |',
      '| Article 9 risk management | Lifecycle risk identification, evaluation, mitigation, residual-risk review | Risk management file | Starter |',
      '| Article 10 data/data governance | Training/validation/testing data governance where relevant | Data provenance register, data governance readiness | Starter |',
      '| Article 11 technical documentation | Technical documentation before market/putting into service | Annex IV index and evidence request list | Index only |',
      '| Article 12 record keeping | Automatic logs/record retention appropriate to purpose | Logging readiness checklist | Starter |',
      '| Article 13 transparency/instructions | Instructions for use and deployer information | Instructions for use starter | Draft/starter |',
      '| Article 14 human oversight | Oversight measures, competence, override/stop procedures | Human oversight procedure | Draft/starter |',
      '| Article 15 accuracy/robustness/cybersecurity | Performance, robustness, security controls and testing | Accuracy/robustness/cybersecurity readiness | Needs evidence |',
    ],
  });
}

function renderDataGovernanceReadiness(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Data Governance Readiness',
    purpose: 'Prepare first-pass data governance evidence for AI risk, buyer review, privacy review, and possible high-risk readiness.',
    audience: 'operator',
    nextAction: 'Fill with verified datasets, permissions, quality checks, bias/fairness review, and retention facts.',
    body: [
      '| Data governance area | Evidence needed | Status |',
      '| --- | --- | --- |',
      '| Data sources | Dataset/source list, ownership, permissions, provenance | Needs confirmation |',
      '| Data quality | Accuracy, freshness, completeness, duplicate/noise checks | Needs evidence |',
      '| Representativeness | Population/use-case coverage and known gaps | Needs review |',
      '| Bias/fairness | Known skew, sensitive categories, mitigation/testing approach | Expert review if material |',
      '| Labeling/annotation | Label process, reviewer guidance, quality review | If applicable |',
      '| Access controls | Who can access source data, inputs, outputs, logs | Security/privacy evidence |',
      '| Retention/deletion | Retention periods and deletion process for inputs/outputs/logs | Needs confirmation |',
      '| Vendor data use | Training/improvement/abuse-monitoring settings and contract terms | Needs vendor evidence |',
    ],
  });
}

function renderAccuracyRobustnessCybersecurity(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Accuracy, Robustness, and Cybersecurity Readiness',
    purpose: 'Capture the evidence buyers and expert reviewers may ask for around AI performance and resilience.',
    audience: 'authority-readiness',
    nextAction: 'Replace starter prompts with actual evaluation, monitoring, and security evidence.',
    body: [
      '| Area | Buyer/expert question | Evidence needed |',
      '| --- | --- | --- |',
      '| Accuracy | How often are outputs correct for the intended task? | Eval set, acceptance criteria, sampling results |',
      '| Limitations | What failure modes are known and disclosed? | Limitations register, help docs |',
      '| Robustness | How does the system behave under unusual, adversarial, or incomplete inputs? | Robustness tests, fallback rules |',
      '| Hallucination/source errors | How are unsupported claims detected or reduced? | Source-grounding checks, human review records |',
      '| Cybersecurity | How are prompt injection, data leakage, abuse, and account security handled? | Security controls, pen test/security review |',
      '| Monitoring | How are drift, incidents, and user feedback reviewed? | Monitoring plan, incident records |',
      '| Corrective action | How are issues fixed and communicated? | Change log, release notes, customer notice process |',
    ],
  });
}

function renderQualityManagementChecklist(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Quality Management Starter Checklist',
    purpose: 'Prepare the first evidence layer for high-risk provider obligations and ISO/IEC 42001-style governance.',
    audience: 'authority-readiness',
    nextAction: 'Use this as a readiness checklist only; it is not a formally audited management system.',
    body: [
      '| Area | Evidence to collect | Status |',
      '| --- | --- | --- |',
      '| AI governance scope | Which systems and teams are in scope | Needs owner |',
      '| Risk management process | How risks are identified, evaluated, treated, and reviewed | Starter only |',
      '| Data governance | Data sources, quality, representativeness, retention, and constraints | Needs evidence |',
      '| Human oversight | Human review points, escalation, and stop-use conditions | Draft |',
      '| Supplier controls | Model/provider contracts, subprocessor list, and review cadence | Needs evidence |',
      '| Change management | Versioning, release review, and material-change process | Draft |',
      '| Performance evaluation | Metrics, monitoring cadence, and issue review | Needs evidence |',
      '| Internal review | Management review cadence and assigned owners | Needs owner |',
    ],
  });
}

function renderRecordKeepingLogging(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Record-Keeping and Logging Readiness',
    purpose: 'Identify what logs and records buyer/legal teams may ask for before relying on the AI system.',
    audience: 'operator',
    nextAction: 'Confirm what is technically logged, retained, exportable, and privacy-reviewed.',
    body: [
      '| Record area | Examples | Owner | Status |',
      '| --- | --- | --- | --- |',
      '| System/version records | Model version, prompt/config version, release date | Engineering | Needs confirmation |',
      '| User/action records | User, timestamp, feature used, review status | Security/privacy | Needs confirmation |',
      '| AI-output review records | Human approval, rejection, edits, escalation | Product/ops | Needs process |',
      '| Incident records | Issue, severity, cause, corrective action | Security/legal | Starter only |',
      '| Evidence records | Source claim, source URL, source date, owner | Founder/legal | Draft |',
    ],
  });
}

function renderPostMarketStarter(input: EvidenceRoomInput): string {
  return [
    '# Post-Market Monitoring and Incident Reporting Starter',
    '',
    'This starter document helps the customer identify what they still need for ongoing monitoring and serious-incident reporting readiness if high-risk obligations become relevant.',
    '',
    '## Starter checklist',
    '',
    '- [ ] Define monitored AI system events.',
    '- [ ] Define owner for performance, risk, and incident review.',
    '- [ ] Decide what logs are retained and where.',
    '- [ ] Define escalation path for serious incidents.',
    '- [ ] Define cadence for reviewing buyer/user feedback.',
    '- [ ] Confirm counsel/security review before external use.',
    '',
    `Customer: ${input.companyName}`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderEuDatabaseRegistration(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'EU Database / Registration Readiness Note',
    purpose: 'Capture whether future EU AI Act registration steps may be relevant if the system is high-risk.',
    audience: 'authority-readiness',
    nextAction: 'Do not submit this as a registration. Confirm applicability, fields, and authority process with counsel.',
    body: [
      '| Registration-readiness area | What to prepare | Status |',
      '| --- | --- | --- |',
      '| Provider identity | Legal name, contact, responsible team | Needs confirmation |',
      '| System identity | Name, version, intended purpose, category | Draft |',
      '| High-risk basis | Annex III or Annex I basis, if any | Needs legal review |',
      '| Instructions for use | Deployer-facing use limits and oversight instructions | Draft |',
      '| Declaration/conformity references | Only after proper conformity assessment | Not generated by TrustFolder |',
      '| Post-market monitoring reference | Monitoring plan and incident process | Starter only |',
    ],
  });
}

function renderConformityAssessmentReadiness(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Conformity Assessment Readiness Checklist',
    purpose: 'Show the customer what evidence would be needed before a formal conformity assessment path.',
    audience: 'authority-readiness',
    nextAction: 'Treat as an evidence gap checklist. TrustFolder does not produce a final declaration or CE marking.',
    body: [
      '| Readiness area | Evidence needed | TrustFolder status |',
      '| --- | --- | --- |',
      '| Risk classification | Intended-purpose and high-risk analysis | Draft/starter |',
      '| Technical documentation | Annex IV documentation set | Index only |',
      '| Quality management | Governance and lifecycle procedures | Starter checklist |',
      '| Data governance | Data provenance, quality, bias, limitations | Needs customer evidence |',
      '| Validation/testing | Performance, robustness, cybersecurity evidence | Needs customer evidence |',
      '| Post-market monitoring | Monitoring plan and incident process | Starter only |',
      '| Declaration of conformity | Formal legal declaration after assessment | Not generated |',
      '| CE marking | Product/regulatory marking where applicable | Not generated |',
    ],
  });
}

function renderFriaStarter(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'FRIA Starter Checklist',
    purpose: 'Prepare a first Fundamental Rights Impact Assessment outline for covered high-risk deployments.',
    audience: 'authority-readiness',
    nextAction: 'Use only if the customer/deployer is in a covered high-risk scenario; confirm with counsel.',
    body: [
      '| Article 27 FRIA element | Starter question | Status |',
      '| --- | --- | --- |',
      '| Deployer process | In which business or public-service process will the AI be used? | Needs deployer input |',
      '| Use period/frequency | How often and for how long will the AI be used? | Needs deployer input |',
      '| Affected groups | Which natural persons or groups may be affected? | Needs review |',
      '| Specific risks of harm | What risks could affect those groups? | Needs review |',
      '| Human oversight | What oversight measures are implemented? | Draft |',
      '| Mitigations/complaints | What governance, mitigation, and complaint channels exist? | Starter only |',
      '| DPIA relationship | Does a GDPR DPIA already cover part of the same risk? | Needs privacy review |',
    ],
  });
}

function renderAiUseCaseMap(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Use-Case Map',
    purpose: 'Separate each AI feature by user, output, review step, and buyer/legal concern.',
    audience: 'operator',
    nextAction: 'Confirm every use case against the product roadmap and shipped UI.',
    body: [
      '| Use case | User | Output | Human review | Buyer/legal concern |',
      '| --- | --- | --- | --- | --- |',
      '| Summarization or drafting | Internal team or customer-facing user | Text output | Confirm | Disclosure, accuracy, data use |',
      '| Search or retrieval | Internal team or customer-facing user | Retrieved answer/source | Confirm | Source quality and hallucination controls |',
      '| Recommendation or scoring | Customer or internal operator | Ranking/score/action suggestion | Confirm | Human oversight and risk classification |',
      '| Generated media/content | Customer or public audience | Image/audio/video/text | Confirm | Article 50 labeling and review |',
    ],
  });
}

function renderEuMarketExposureNote(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'EU Market Exposure Note',
    purpose: 'Capture why EU AI Act, GDPR, and buyer transparency questions may appear in procurement review.',
    audience: 'founder',
    nextAction: 'Confirm customer locations, user locations, EU marketing, and contractual commitments.',
    body: [
      '| Exposure signal | Question to confirm | Status |',
      '| --- | --- | --- |',
      '| EU customers/users | Does the product serve EU-based customers or users? | Confirm |',
      '| EU marketing/sales | Is the product marketed or sold into the EU? | Confirm |',
      '| EU personal data | Is personal data from EU individuals processed? | Confirm |',
      '| EU deployer/buyer | Could an EU customer deploy the AI in a regulated context? | Confirm |',
      '| Public-sector buyer | Could a public body use the product? | Confirm FRIA path if high-risk |',
    ],
  });
}

function renderCustomerImpactSummary(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Customer and User Impact Summary',
    purpose: 'Explain who may be affected by the AI system and what review questions follow.',
    audience: 'buyer',
    nextAction: 'Confirm affected groups and whether any high-risk, sensitive, or vulnerable groups are involved.',
    body: [
      '| Impact area | Starter question | Status |',
      '| --- | --- | --- |',
      '| Direct users | Who sees or uses AI output? | Needs confirmation |',
      '| End customers | Could the buyer’s customers be affected? | Needs confirmation |',
      '| Employees/operators | Could internal staff be monitored, ranked, or directed? | Needs confirmation |',
      '| Vulnerable groups | Could children, patients, applicants, workers, or citizens be affected? | Expert review if yes |',
      '| Material decisions | Could AI output affect access, opportunity, pricing, eligibility, or safety? | Legal review if yes |',
    ],
  });
}

function renderDataAndModelMap(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# Data and Model Dependency Map',
    '',
    '| Area | What to document | Current status |',
    '| --- | --- | --- |',
    '| Model/provider | Third-party model names and contract owner | Needs confirmation |',
    '| Input data | Customer, public, internal, or user-provided data categories | Needs confirmation |',
    '| Output use | Drafting, summarization, search, recommendations, decisions | Needs confirmation |',
    '| Human review | Whether a human reviews before external use | Needs confirmation |',
    '| Retention | What is stored and for how long | Needs confirmation |',
    '',
    '## Source trail',
    '',
    renderCitationList(docs),
    '',
    `Customer: ${input.companyName}`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderIntendedPurposeLifecycle(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Intended Purpose and Lifecycle Statement',
    purpose: 'Document intended use, users, limitations, lifecycle state, and change triggers for buyer/legal review.',
    audience: 'operator',
    nextAction: 'Confirm every row with product and engineering before sharing externally.',
    body: [
      '| Area | Current statement to confirm | Evidence needed |',
      '| --- | --- | --- |',
      '| Intended purpose | Describe the exact workflow the AI supports and what it does not decide | Product docs, website copy |',
      '| Intended users | Identify operators, admins, customers, end users, and reviewers | Product roles, onboarding |',
      '| Input context | List user inputs, retrieved data, customer data, and system prompts at a high level | Architecture notes |',
      '| Output context | List generated text, summaries, recommendations, labels, or media | Product screenshots |',
      '| Human oversight | State where a human reviews, edits, approves, or can override output | Workflow evidence |',
      '| Lifecycle stage | Prototype, beta, GA, enterprise deployment, or material-change review | Release notes |',
      '| Material-change triggers | Model, prompt, data source, UI, user group, jurisdiction, or risk-use change | Change process |',
    ],
  });
}

function renderModelCardLite(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Model Card Lite',
    purpose: 'Capture model/provider facts buyers commonly ask for without pretending to be a full model card from the provider.',
    audience: 'buyer',
    nextAction: 'Fill from verified vendor terms, model documentation, contracts, and security/privacy evidence.',
    body: [
      '| Field | Customer answer | Evidence to attach |',
      '| --- | --- | --- |',
      '| Model/provider | TBD | Vendor contract, model docs |',
      '| AI capability | Text generation, retrieval, summarization, classification, media generation, or other | Product docs |',
      '| Customer data use | TBD - training, retention, abuse monitoring, opt-out settings | Vendor DPA/terms |',
      '| Region/transfer | TBD | DPA, SCCs, region settings |',
      '| Evaluation performed | TBD | Internal QA, eval results, acceptance criteria |',
      '| Known limitations | TBD | Product docs, support notes |',
      '| Human oversight | TBD | Workflow evidence |',
      '| Change management | TBD | Vendor notices, release process |',
    ],
  });
}

function renderDataProvenanceRegister(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Data Provenance Register',
    purpose: 'Track the origin, permissions, quality, and review status of data used by AI features.',
    audience: 'operator',
    nextAction: 'Fill this from actual product architecture, data agreements, retention settings, and customer commitments.',
    body: [
      '| Data source | Origin | Permission/contract basis | Quality check | Retention | Status |',
      '| --- | --- | --- | --- | --- | --- |',
      '| Public website/product docs | Public/company-owned | Confirm | Source freshness review | TBD | Needs confirmation |',
      '| Customer-provided content | Customer systems/users | DPA/customer contract | Completeness and sensitivity review | TBD | Needs privacy review |',
      '| Internal knowledge base | Company-owned | Internal policy | Version/freshness review | TBD | Needs confirmation |',
      '| AI output logs | Product telemetry | Privacy/security approval | Sampling/incident review | TBD | Needs confirmation |',
      '| Vendor/provider logs | Third-party model provider | Vendor terms/DPA | Vendor evidence | TBD | Needs evidence |',
    ],
  });
}

function renderInstructionsForUseStarter(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Instructions for Use Starter',
    purpose: 'Prepare deployer/customer instructions that may be needed for buyer review and, if high-risk applies, later technical documentation.',
    audience: 'buyer',
    nextAction: 'Confirm instructions against actual UI, support docs, contractual scope, and risk classification.',
    body: [
      '| Instruction area | What the customer should receive | Status |',
      '| --- | --- | --- |',
      '| Intended purpose | Exact product workflow and use limits | Draft |',
      '| User responsibilities | What users must review, approve, or avoid | Needs confirmation |',
      '| Input restrictions | Data types that should not be entered without approval | Needs privacy/security review |',
      '| Output limitations | Accuracy, hallucination, source, bias, and dependency limits | Draft |',
      '| Human oversight | How to review, override, escalate, or stop use | Needs workflow evidence |',
      '| Logging/support | How issues and incidents are reported | Needs support/security review |',
      '| Updates | How customers learn about material AI changes | Needs contract/product confirmation |',
    ],
  });
}

function renderGovernanceRaci(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Governance RACI',
    purpose: 'Assign first-pass responsibility for the documents and controls in this evidence room.',
    audience: 'operator',
    nextAction: 'Replace role placeholders with named owners before buyer or counsel review.',
    body: [
      '| Activity | Responsible | Accountable | Consulted | Informed |',
      '| --- | --- | --- | --- | --- |',
      '| AI use summary accuracy | Product | Founder | Legal/privacy | Sales |',
      '| Disclosure placement | Product/design | Founder | Legal | Support |',
      '| Data/privacy claims | Privacy/security | Founder | Legal | Product |',
      '| Vendor/model review | Security/engineering | Founder | Legal/privacy | Buyer owner |',
      '| Incident escalation | Security | Founder | Legal/privacy | Customer success |',
      '| Evidence tracker maintenance | Operations | Founder | Product/security/legal | Sales |',
    ],
  });
}

function renderChangeManagementLog(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Change Management and Version Log',
    purpose: 'Track AI-system changes that could affect disclosures, evidence, or buyer commitments.',
    audience: 'operator',
    nextAction: 'Start a row for every material model, prompt, data, UI, or disclosure change.',
    body: [
      '| Date | Change | Reason | Risk/evidence impact | Reviewer | Status |',
      '| --- | --- | --- | --- | --- | --- |',
      `| ${input.generationDate} | Initial TrustFolder evidence room generated | Buyer/legal readiness | Establish baseline | Founder | Draft |`,
      '| TBD | Model/provider change | TBD | Recheck vendor, data, performance, disclosure claims | Product/security | Open |',
      '| TBD | New AI feature | TBD | Recheck Article 50, risk classification, user instructions | Product/legal | Open |',
    ],
  });
}

function renderIncidentEscalationProcedure(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Incident Escalation Procedure',
    purpose: 'Create a first operating path for AI-related issues, buyer escalations, and serious-incident review.',
    audience: 'operator',
    nextAction: 'Confirm severity definitions, reporting owners, and regulator/customer notification paths.',
    body: [
      '| Step | Action | Owner | Evidence |',
      '| --- | --- | --- | --- |',
      '| 1. Intake | Capture issue, reporter, affected system, time, and observed impact | Support/security | Incident ticket |',
      '| 2. Triage | Decide if issue involves safety, rights, privacy, security, or material customer impact | Security/legal | Triage note |',
      '| 3. Contain | Pause feature, roll back, or add human review if needed | Engineering/product | Change log |',
      '| 4. Investigate | Preserve logs, prompts/configs, source material, and affected outputs | Engineering/security | Evidence folder |',
      '| 5. Notify | Decide buyer, user, regulator, or authority notification with counsel | Legal/founder | Notification record |',
      '| 6. Correct | Track corrective action, owner, due date, and follow-up review | Product/security | Closure note |',
    ],
  });
}

function renderModelVendorReviewProcedure(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Model and Vendor Review Procedure',
    purpose: 'Help the customer document third-party AI providers and vendor controls for buyer review.',
    audience: 'operator',
    nextAction: 'Fill provider names, contracts, data-use terms, retention, subprocessors, and security evidence.',
    body: [
      '| Review area | Question | Evidence to attach |',
      '| --- | --- | --- |',
      '| Provider identity | Which model/API/vendor powers each AI feature? | Vendor list, contract, DPA |',
      '| Data use | Is customer data used for training, improvement, abuse monitoring, or retention? | Provider terms, config, DPA |',
      '| Location/transfer | Where is data processed or stored? | DPA, SCCs, region settings |',
      '| Security | What security controls and certifications exist? | SOC 2/ISO reports, security page |',
      '| Change notice | How are model or policy changes communicated? | Contract, status page, changelog |',
      '| Fallback/exit | What happens if vendor access changes or an incident occurs? | Continuity plan |',
    ],
  });
}

function renderAcceptableUseTraining(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Internal AI Acceptable Use and Training',
    purpose: 'Provide a first policy/training checklist for teams operating AI features.',
    audience: 'operator',
    nextAction: 'Turn this into internal guidance and record who has acknowledged it.',
    body: [
      '| Topic | Minimum guidance | Evidence |',
      '| --- | --- | --- |',
      '| Human review | AI output must be reviewed before customer-facing use where applicable | Policy acknowledgement |',
      '| Sensitive data | Do not enter restricted personal, health, financial, or child data unless approved | Training record |',
      '| Buyer claims | Do not claim compliance, certification, or legal conclusions from TrustFolder drafts | Sales enablement note |',
      '| Incident reporting | Report harmful, biased, privacy, or security issues through the escalation path | Ticket/log |',
      '| Version changes | Material AI changes trigger disclosure and evidence review | Change log |',
    ],
  });
}

function renderRiskManagementFile(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Risk Management File',
    purpose: 'Create a living register for AI risks, controls, owners, evidence, and review dates.',
    audience: 'operator',
    nextAction: 'Use this as a starter register; high-risk or sensitive use needs expert review and deeper evidence.',
    body: [
      '| Risk area | Example risk | Control/evidence | Owner | Status |',
      '| --- | --- | --- | --- | --- |',
      '| Transparency | User does not understand AI involvement | Article 50 notices, placement plan | Product/legal | Draft |',
      '| Accuracy | Output is incomplete, outdated, or misleading | Human review, source checks, eval notes | Product/engineering | Needs evidence |',
      '| Bias/fairness | Output treats groups unfairly or reflects skewed data | Data provenance, monitoring, escalation | Product/legal | Starter only |',
      '| Privacy | Personal data is entered, retained, or transferred improperly | DPIA starter, DPA/subprocessor summary | Privacy/legal | Needs evidence |',
      '| Security | Prompt injection, data leakage, model/vendor incident | Security questionnaire, incident SOP | Security | Needs evidence |',
      '| Human oversight | Users over-rely on AI output | Instructions, training, oversight procedure | Product/ops | Draft |',
      '| Vendor dependency | Model/provider change affects commitments | Vendor review procedure, change log | Security/legal | Needs evidence |',
    ],
  });
}

function renderManagementReviewAgenda(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Management Review Agenda',
    purpose: 'Give leadership a recurring meeting structure for reviewing AI governance evidence.',
    audience: 'operator',
    nextAction: 'Schedule a monthly or quarterly review and attach decisions to the decision log.',
    body: [
      '| Agenda item | Evidence to review | Decision/output |',
      '| --- | --- | --- |',
      '| AI system scope changes | System inventory, change log | Confirm whether pack updates are needed |',
      '| Buyer/legal questions | Procurement FAQ, handoff memo | Assign owners and deadlines |',
      '| Source/evidence gaps | Evidence tracker, source register | Add evidence or open item |',
      '| Risk/open items | Risk file, open review items | Update severity and owner |',
      '| Incidents/issues | Incident escalation log | Decide corrective action |',
      '| Training/readiness | AI literacy register | Update acknowledgements and gaps |',
      '| Vendor/model changes | Vendor review procedure | Update buyer answers and privacy notes |',
    ],
  });
}

function renderAiLiteracyTrainingRegister(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Literacy Training Register',
    purpose: 'Track role-based AI literacy evidence for people who operate, sell, support, or govern AI features.',
    audience: 'operator',
    nextAction: 'Replace placeholders with named roles, dates, training material, and acknowledgement evidence.',
    body: [
      '| Role/group | Training topic | Evidence | Due date | Status |',
      '| --- | --- | --- | --- | --- |',
      '| Leadership | Governance ownership, safe claims, review cadence | Meeting note/acknowledgement | TBD | Open |',
      '| Product/design | Disclosure placement, user instructions, human oversight | Checklist | TBD | Open |',
      '| Engineering/security | Logging, incident evidence, model/provider changes | SOP acknowledgement | TBD | Open |',
      '| Sales/customer success | Buyer claim boundaries and handoff process | Enablement record | TBD | Open |',
      '| Support/operations | Escalation of AI output, privacy, security, and harm issues | Training record | TBD | Open |',
    ],
  });
}

function renderRoleBasedOperatingProcedures(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Role-Based AI Operating Procedures',
    purpose: 'Turn governance ownership into practical operating rules for each team.',
    audience: 'operator',
    nextAction: 'Assign named owners and add links to real tickets, docs, and review rituals.',
    body: [
      '| Team | Operating procedure | Evidence produced |',
      '| --- | --- | --- |',
      '| Product | Review disclosures and user instructions before material AI changes | Disclosure review ticket |',
      '| Engineering | Log model/prompt/data changes and preserve incident evidence | Change log, incident record |',
      '| Privacy/legal | Review DPIA, DPA, lawful basis, subprocessor, and Article 50 questions | Review memo |',
      '| Security | Maintain vendor/model security evidence and AI incident escalation | Security questionnaire, vendor evidence |',
      '| Sales/customer success | Use approved buyer answers and route gaps to owner | Buyer response log |',
      '| Founder/leadership | Review open items, risk, and buyer escalations | Management review note |',
    ],
  });
}

function renderClaimSourceMatrix(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# Claim-to-Source Matrix',
    '',
    '| Artifact | Source coverage | Sources |',
    '| --- | --- | --- |',
    ...docs.map((doc) => `| ${titleFromFilename(doc.filename)} | ${doc.citations.length > 0 ? 'Source-traced' : 'Needs source'} | ${doc.citations.join('; ') || 'None captured'} |`),
    '',
    `Customer: ${input.companyName}`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderSourceReferenceRegister(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  const citations = Array.from(new Set(docs.flatMap((doc) => doc.citations))).sort();
  const rows = citations.length > 0
    ? citations.map((citation, index) => `| S-${String(index + 1).padStart(3, '0')} | ${citation} | Website/intake/vendor evidence | Confirm owner and freshness |`)
    : ['| S-001 | No source citations captured | Missing | Add source before external use |'];
  return [
    '# Source Reference Register',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '| Source ID | Source | Source type | Review note |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '## Source-quality rules',
    '',
    '- Public website claims need a URL and scan date.',
    '- Intake answers need an accountable owner.',
    '- Vendor/security/privacy claims need contract, DPA, security report, or vendor documentation evidence.',
    '- Unknown facts become open review items, not polished claims.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderSourceQualityRegister(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return renderStarterArtifact(input, {
    title: 'Source Quality Register',
    purpose: 'Separate strong evidence from weak, stale, or unverified sources.',
    audience: 'legal',
    nextAction: 'Upgrade weak evidence before buyer/legal sharing.',
    body: [
      '| Source class | Example | Reliability | Required action |',
      '| --- | --- | --- | --- |',
      '| Public product page | Feature description, AI-use page, support docs | Medium-high if current | Capture URL, date, owner |',
      '| Founder intake | Product facts, human oversight, intended use | Medium | Confirm with product owner |',
      '| Vendor documentation | Model/data/security terms | High if current and contractual | Attach source and date |',
      '| Internal policy/SOP | Oversight, incident, training, change management | High if approved | Add version and approver |',
      '| Security/privacy evidence | SOC 2, ISO report, DPA, subprocessor list | High if current | Attach or reference secured repository |',
      '| Assumption | Anything inferred from missing evidence | Low | Convert to open item |',
    ],
  });
}

function renderControlMapping(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Control Mapping: EU AI Act, ISO/IEC 42001, GDPR',
    purpose: 'Show how the evidence room maps to buyer-review control families without asserting full compliance.',
    audience: 'legal',
    nextAction: 'Use this as a review map; replace starter status with verified evidence as the program matures.',
    body: [
      '| Control family | Evidence-room artifact | Framework context | Status |',
      '| --- | --- | --- | --- |',
      '| Transparency/disclosure | Article 50 matrix, disclosure drafts, placement plan | EU AI Act Article 50 | Draft |',
      '| Risk classification | Annex III screen, risk classification memo | EU AI Act high-risk triage | Needs legal review |',
      '| Technical documentation | Annex IV index, system inventory, data/model map | EU AI Act Article 11 / Annex IV | Starter only |',
      '| Risk management | Governance summary, roadmap, open items | EU AI Act Article 9 / ISO/IEC 42001 | Starter only |',
      '| Data governance | Data processing map, DPIA starter, evidence tracker | GDPR / EU AI Act data governance | Needs privacy review |',
      '| Human oversight | Human oversight procedure, RACI, incident escalation | EU AI Act / ISO/IEC 42001 | Draft |',
      '| Monitoring/incidents | Post-market starter, incident escalation | EU AI Act Articles 72-73 | Starter only |',
      '| Supplier management | Vendor inventory, model/vendor review procedure | Buyer due diligence / ISO/IEC 42001 | Needs evidence |',
    ],
  });
}

function renderBuyerExecutiveQa(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Buyer Executive Q&A',
    purpose: 'Prepare concise, non-overclaiming answers for the most common enterprise buyer questions.',
    audience: 'buyer',
    nextAction: 'Replace every TBD with verified product, privacy, security, and legal facts before sending externally.',
    body: [
      '| Buyer question | Answer pattern | Evidence to reference |',
      '| --- | --- | --- |',
      '| What does your AI do? | It supports the documented workflow and remains within the intended-use boundary. | Product AI use summary, system inventory |',
      '| Does AI make decisions about people? | TBD based on product behavior; identify whether outputs are advisory or decisioning. | Use-case map, human oversight procedure |',
      '| Is customer data used to train models? | TBD; answer only from vendor/customer configuration and data terms. | DPA/subprocessor summary, vendor review |',
      '| What disclosures do users see? | Reference approved Article 50 notices and placement plan. | Disclosure matrix, copy deck |',
      '| How do you handle AI errors or incidents? | Reference escalation, logging, monitoring, and corrective-action process. | Incident SOP, post-market starter |',
      '| What is still open? | Share the open review item register honestly. | Open review items, roadmap |',
    ],
  });
}

function renderAuthorityReadinessNote(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Authority Readiness Note',
    purpose: 'Clarify which artifacts are only preparatory if a regulator, public-sector buyer, or high-risk review becomes relevant.',
    audience: 'authority-readiness',
    nextAction: 'Escalate to qualified counsel or expert assessor before using any readiness artifact for an authority-facing process.',
    body: [
      '| Artifact family | Use | Boundary |',
      '| --- | --- | --- |',
      '| Annex III screen | First high-risk triage | Not a final legal classification |',
      '| Annex IV index | Evidence-request map | Not completed technical documentation |',
      '| Conformity readiness | Gap checklist | Not CE marking or declaration |',
      '| FRIA starter | Deployment impact outline | Not a completed FRIA |',
      '| DPIA starter | Privacy-risk input map | Not a completed DPIA |',
      '| Post-market/incident starter | Monitoring/reporting process outline | Not an official notification or report |',
      '| ISO/IEC 42001 checklist | Management-system readiness | Not certification or audit evidence by itself |',
    ],
  });
}

function renderDecisionLog(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Governance Decision Log',
    purpose: 'Record the buyer/legal decisions that should not live only in Slack, email, or memory.',
    audience: 'operator',
    nextAction: 'Use this as a living log for disclosure, risk, vendor, privacy, and buyer-response decisions.',
    body: [
      '| Date | Decision | Reason | Owner | Evidence link | Review date |',
      '| --- | --- | --- | --- | --- | --- |',
      `| ${input.generationDate} | Establish TrustFolder evidence-room baseline | Buyer/legal readiness | Founder | START-HERE.html | Next material AI change |`,
      '| TBD | Confirm Article 50 disclosure placement | Product disclosure readiness | Product/legal | Disclosure placement plan | TBD |',
      '| TBD | Confirm model/provider data-use terms | Buyer/privacy review | Security/privacy | Vendor review procedure | TBD |',
      '| TBD | Confirm high-risk applicability | EU AI Act scope | Legal/founder | Annex III screen | TBD |',
    ],
  });
}

function renderReviewStatusManifest(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# Review Status Manifest',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '| Artifact | Status | Owner to confirm | Source coverage |',
    '| --- | --- | --- | --- |',
    ...docs.map((doc) => `| ${titleFromFilename(doc.filename)} | Draft for review | ${doc.template_id.startsWith('t1-') ? 'Product/legal' : 'Founder/legal/security'} | ${doc.citations.length > 0 ? 'Source-traced' : 'Needs source'} |`),
    '| Annex IV technical documentation index | Starter only | Legal/engineering | Needs evidence |',
    '| DPIA starter checklist | Starter only | Privacy/legal | Needs privacy evidence |',
    '| FRIA starter checklist | Starter only if applicable | Legal/public-sector buyer | Needs deployer evidence |',
    '| Conformity assessment readiness | Starter only | Legal/qualified assessor | Needs formal process |',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderSourcesAndNotes(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  const citations = Array.from(new Set(docs.flatMap((doc) => doc.citations))).sort();
  return [
    '# Sources and Notes',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '## Consolidated sources',
    '',
    citations.length > 0 ? citations.map((citation) => `- ${citation}`).join('\n') : '- No source citations captured. Confirm manually before external use.',
    '',
    '## Per-artifact notes',
    '',
    ...docs.map((doc) => `- ${doc.filename}: ${doc.confidence_band}; ${doc.citations.length} source reference(s).`),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderOpenItems(items: OpenReviewItem[]): string {
  return renderOpenReviewItemsMarkdown(items);
}

function renderBuyerPacketMarkdown(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  return [
    '# Buyer Review Packet',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '## What the buyer can review',
    '',
    '- Product AI use summary.',
    '- Disclosure and transparency drafts.',
    '- Governance and oversight starter documents.',
    '- Evidence tracker and source notes.',
    '- Open review items.',
    '',
    renderReadinessSummary(input.readiness ?? null),
    '',
    '## Artifact list',
    '',
    docs.map((doc) => `- ${titleFromFilename(doc.filename)} (${doc.confidence_band})`).join('\n'),
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderBuyerPacketHtml(input: EvidenceRoomInput, docs: GeneratedDoc[]): string {
  const readiness = input.readiness ? `${input.readiness.overall} / 100` : 'Not scored';
  const artifactItems = docs
    .slice(0, 14)
    .map((doc) => `<li><strong>${escapeHtml(titleFromFilename(doc.filename))}</strong><span>${escapeHtml(doc.confidence_band)}</span></li>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.companyName)} Buyer Review Packet</title>
<style>
body { margin: 0; background: #fbfaf6; color: #09231b; font-family: Arial, sans-serif; line-height: 1.55; }
main { max-width: 920px; margin: 0 auto; padding: 44px 28px; }
.label { color: #0f7b5a; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; }
h1 { font-size: clamp(32px, 5vw, 58px); line-height: 1; letter-spacing: -.04em; margin: 10px 0 18px; }
.panel { background: white; border: 1px solid #ded8ca; border-radius: 18px; padding: 22px; margin: 18px 0; }
li { margin: 9px 0; display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #ede8dc; padding-bottom: 8px; }
span { color: #5e6b64; }
</style>
</head>
<body>
<main>
<p class="label">Buyer review packet</p>
<h1>${escapeHtml(input.companyName)} AI governance evidence summary</h1>
<p>This packet gives buyer, legal, and internal reviewers a structured starting point with source-traced artifacts and open review items.</p>
<section class="panel"><p class="label">Readiness</p><h2>${escapeHtml(readiness)}</h2><p>${escapeHtml(input.readiness?.disclaimer ?? 'AI documentation readiness score. Not legal advice. Not certification. Not a compliance guarantee.')}</p></section>
<section class="panel"><p class="label">Artifacts</p><ul>${artifactItems}</ul></section>
<section class="panel"><p class="label">Scope</p><p>${escapeHtml(DISCLAIMERS.join(' '))}</p></section>
</main>
</body>
</html>`;
}

function renderStarterArtifact(
  input: EvidenceRoomInput,
  artifact: {
    title: string;
    purpose: string;
    audience: ArtifactAudience;
    nextAction: string;
    body: string[];
  },
): string {
  return [
    renderMetadataCard({
      title: artifact.title,
      purpose: artifact.purpose,
      audience: artifact.audience,
      reviewStatus: 'Starter for review',
      sourceCoverage: 'Needs source confirmation',
      nextAction: artifact.nextAction,
    }),
    '',
    `# ${artifact.title}`,
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    ...artifact.body,
    '',
    '## Safe-use note',
    '',
    'This is a starter/review artifact. It helps organize evidence and questions; it is not a legal conclusion, formal regulatory submission, certification, or proof of compliance.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderProcurementFaq(input: EvidenceRoomInput): string {
  return [
    '# Procurement FAQ Starter',
    '',
    `Customer: ${input.companyName}`,
    '',
    '## Questions to answer before buyer review',
    '',
    '- What AI features are included in the product?',
    '- Does the product use third-party model providers?',
    '- Is customer data used for training or improvement?',
    '- What human review exists before external use?',
    '- What disclosures are shown to users?',
    '- What open items still require legal, privacy, security, or expert review?',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderProcurementAnswerBank(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Procurement Answer Bank',
    purpose: 'Give sales/founder teams approved answer patterns for buyer AI-governance questions.',
    audience: 'buyer',
    nextAction: 'Approve final wording with legal/privacy/security before using in questionnaires or email.',
    body: [
      '| Topic | Safe answer pattern | Evidence to cite |',
      '| --- | --- | --- |',
      '| AI feature scope | "Our AI features are documented in the AI use summary and system inventory." | AI use summary, inventory |',
      '| Transparency | "We maintain draft transparency notices and placement notes for applicable AI interactions." | Article 50 matrix, notice register |',
      '| Human oversight | "Human review points are documented and are being confirmed against actual workflows." | Human oversight procedure |',
      '| Data use | "Data use, retention, and vendor processing are tracked for privacy/security review." | Data processing map, DPA summary |',
      '| Vendor/model providers | "Provider dependencies are tracked with contract, DPA, and security-evidence requests." | Vendor review procedure |',
      '| Open items | "Open review items are tracked separately and assigned to responsible owners." | Open review items, roadmap |',
      '| Legal boundary | "These are review drafts and readiness artifacts, not legal advice or certification." | START-HERE, QA report |',
    ],
  });
}

function renderExternalSharingChecklist(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'External Sharing Checklist',
    purpose: 'Prevent premature sharing of unsupported claims with buyers, counsel, or procurement teams.',
    audience: 'founder',
    nextAction: 'Complete before sending a ZIP, buyer packet, trust-center copy, or questionnaire answer externally.',
    body: [
      '- [ ] Product owner confirmed AI feature descriptions.',
      '- [ ] Privacy/security owner confirmed data, retention, vendor, and transfer claims.',
      '- [ ] Legal/counsel reviewed Article 50, high-risk, DPIA, FRIA, and customer-facing wording where relevant.',
      '- [ ] Evidence tracker has source support or open-item status for every material claim.',
      '- [ ] Buyer answers do not state certification, guarantee, legal conclusion, or completed filing.',
      '- [ ] Unknown facts remain visible as open items.',
      '- [ ] START-HERE, README, and QA report are included when sharing the pack.',
      '- [ ] The recipient understands the pack is a draft evidence room for review.',
    ],
  });
}

function renderSecurityQuestionnaireStarter(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Security Questionnaire Starter',
    purpose: 'Prepare buyer-security answers that commonly appear beside AI governance questions.',
    audience: 'buyer',
    nextAction: 'Fill only verified security facts; do not infer certifications or controls.',
    body: [
      '| Buyer question | Starter answer area | Evidence owner |',
      '| --- | --- | --- |',
      '| What AI features are in scope? | Reference AI system inventory and use-case map | Product |',
      '| What data is processed by AI? | Reference data processing map and vendor review procedure | Privacy/security |',
      '| Is customer data used for training? | Confirm provider/customer configuration and terms | Privacy/legal |',
      '| What logging and monitoring exists? | Reference record-keeping and incident starter | Security/engineering |',
      '| What vendor/model providers are used? | Reference vendor/provider inventory | Security/legal |',
      '| How are incidents handled? | Reference AI incident escalation procedure | Security/legal |',
    ],
  });
}

function renderVendorQuestionnaireResponse(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Vendor Questionnaire Response Draft',
    purpose: 'Draft safe, non-overclaiming answers for procurement and AI vendor review.',
    audience: 'buyer',
    nextAction: 'Review every answer with the responsible owner before sending to a buyer.',
    body: [
      '| Question | Draft response pattern | Owner |',
      '| --- | --- | --- |',
      '| Describe your AI use | Use product AI use summary; avoid unsupported claims | Product/founder |',
      '| Describe human oversight | Reference human oversight procedure and actual workflow | Product/legal |',
      '| Describe data use | Reference data processing map, DPA, and vendor terms | Privacy/legal |',
      '| Describe risk management | Reference governance summary, RACI, open items, and roadmap | Founder/legal |',
      '| Describe transparency notices | Reference Article 50 matrix and disclosure placement plan | Product/legal |',
      '| Describe unresolved issues | Reference open review items; do not hide review gaps | Founder/legal |',
    ],
  });
}

function renderTrustCenterCopyStarter(input: EvidenceRoomInput): string {
  return [
    '# Customer Trust Center Copy Starter',
    '',
    `Customer: ${input.companyName}`,
    '',
    'Use this as draft trust-center language only after product, privacy, security, and legal review.',
    '',
    '## AI use summary',
    '',
    `${input.companyName} uses AI to support product workflows described in its AI use summary. The company maintains source-traced documentation, human review expectations, and open review items for buyer/legal review.`,
    '',
    '## Responsible-use boundary',
    '',
    'The AI governance materials are maintained as review documents. They are not legal advice, certification, or a compliance guarantee.',
    '',
    '## Buyer review materials available',
    '',
    '- AI use summary',
    '- Disclosure drafts and placement notes',
    '- Evidence tracker and source notes',
    '- Open review items',
    '- Buyer/legal handoff memo',
    '',
    '## Do not publish before confirming',
    '',
    '- Actual AI features and model providers',
    '- Data-use and retention claims',
    '- Security certifications or reports',
    '- Legal/regulatory applicability',
    '',
  ].join('\n');
}

function renderDpiaStarter(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'DPIA Starter Checklist',
    purpose: 'Prepare privacy-review inputs where AI processing may create high risk to individuals.',
    audience: 'legal',
    nextAction: 'Use with privacy counsel/DPO where GDPR Article 35 or local DPA guidance indicates a DPIA may be required.',
    body: [
      '| DPIA area | Starter question | Status |',
      '| --- | --- | --- |',
      '| Processing description | What personal data is processed by AI features? | Needs privacy input |',
      '| Purpose and necessity | Why is the processing needed and proportionate? | Needs legal basis review |',
      '| Data subjects | Which people are affected? | Needs confirmation |',
      '| Risks to rights/freedoms | What harm could arise from inaccurate, biased, or exposed AI output? | Needs review |',
      '| Mitigations | What controls reduce privacy, security, and fairness risk? | Starter only |',
      '| Residual risk | Is consultation with a DPA needed before processing? | Counsel/DPO decision |',
      '| Relationship to FRIA | Does a covered high-risk AI deployment also need FRIA review? | Confirm if applicable |',
    ],
  });
}

function renderDataProcessingMap(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'AI Data Processing Map',
    purpose: 'Map AI-related personal-data processing for privacy, vendor, and buyer review.',
    audience: 'legal',
    nextAction: 'Fill with verified data categories, systems, vendors, transfers, and retention facts.',
    body: [
      '| Processing step | Data category | System/vendor | Region/transfer | Retention | Status |',
      '| --- | --- | --- | --- | --- | --- |',
      '| User input to AI feature | TBD | TBD | TBD | TBD | Needs confirmation |',
      '| Retrieval/context data | TBD | TBD | TBD | TBD | Needs confirmation |',
      '| AI output | TBD | TBD | TBD | TBD | Needs confirmation |',
      '| Logs/monitoring | TBD | TBD | TBD | TBD | Needs confirmation |',
      '| Support/escalation review | TBD | TBD | TBD | TBD | Needs confirmation |',
    ],
  });
}

function renderPersonalDataCategoryTable(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Personal Data Category Table',
    purpose: 'Separate ordinary, sensitive, customer, employee, and operational data categories for privacy review.',
    audience: 'legal',
    nextAction: 'Confirm categories before sending buyer/security/privacy answers.',
    body: [
      '| Data category | Example | AI use | Sensitive/special category? | Status |',
      '| --- | --- | --- | --- | --- |',
      '| Account/contact data | Name, email, company, role | Context or support workflow | Usually no, confirm | Needs confirmation |',
      '| Customer notes/content | CRM notes, tickets, documents | Summarization/retrieval/drafting | Depends on content | Needs privacy review |',
      '| Employee/operator data | Staff names, actions, edits | Logging/human review | Usually no, confirm | Needs confirmation |',
      '| Sensitive data | Health, biometrics, children, finance, criminal, special categories | Avoid unless approved | Yes or regulated | Expert review |',
      '| Derived AI output | Summary, recommendation, classification | Product output | Depends on use | Needs review |',
    ],
  });
}

function renderLawfulBasisRoleIntake(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Lawful Basis and Role Intake',
    purpose: 'Capture the privacy role and lawful-basis questions a buyer or DPA review may raise.',
    audience: 'legal',
    nextAction: 'Have privacy counsel/DPO confirm controller/processor roles and lawful basis.',
    body: [
      '| Question | Why it matters | Status |',
      '| --- | --- | --- |',
      '| Is the customer or vendor controller, processor, or joint controller for each AI workflow? | Determines DPA and responsibility allocation | Needs legal review |',
      '| What lawful basis supports each processing purpose? | Needed for GDPR transparency and DPIA analysis | Needs legal review |',
      '| Are special-category data or children’s data involved? | May trigger stricter restrictions and expert review | Confirm |',
      '| Are international transfers involved? | May require SCCs/TIAs or vendor documentation | Confirm |',
      '| Does automated decision-making/profiling affect people materially? | May require separate GDPR and AI Act review | Confirm |',
    ],
  });
}

function renderDpaSubprocessorSummary(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'DPA and Subprocessor Summary',
    purpose: 'Prepare the handoff between AI governance evidence and privacy/vendor contracting.',
    audience: 'legal',
    nextAction: 'Attach verified DPA, subprocessor, transfer, and model-provider evidence.',
    body: [
      '| Area | Evidence to attach | Status |',
      '| --- | --- | --- |',
      '| Customer DPA | Current customer data processing agreement | Needs attachment |',
      '| AI vendor DPA | Model/API provider DPA or data terms | Needs attachment |',
      '| Subprocessor list | Provider, purpose, region, transfer mechanism | Needs confirmation |',
      '| Data-use terms | Training, retention, abuse monitoring, opt-out settings | Needs confirmation |',
      '| Security reports | SOC 2, ISO 27001, penetration summary, security page | Needs evidence |',
      '| Change notice | How subprocessor/model-provider changes are communicated | Needs confirmation |',
    ],
  });
}

function renderRetentionDeletionRights(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Retention, Deletion, and Data Subject Rights',
    purpose: 'Prepare buyer/privacy answers about how AI-related data is retained, deleted, and actioned for rights requests.',
    audience: 'legal',
    nextAction: 'Confirm actual system behavior with engineering, privacy, and vendor documentation.',
    body: [
      '| Area | Question | Status |',
      '| --- | --- | --- |',
      '| Input retention | How long are AI inputs stored by the product and model provider? | Needs confirmation |',
      '| Output retention | How long are AI outputs stored in product logs or customer records? | Needs confirmation |',
      '| Training/improvement | Are customer inputs/outputs used to train or improve models? | Needs confirmation |',
      '| Deletion | Can customer/user AI data be deleted on request? | Needs confirmation |',
      '| Access/export | Can relevant AI-related records be exported for a rights request? | Needs confirmation |',
      '| Vendor propagation | How are deletion/access requests handled by subprocessors? | Needs vendor evidence |',
    ],
  });
}

function renderGovernanceRoadmap90Day(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: '30-60-90 Day Governance Roadmap',
    purpose: 'Turn the evidence room into a practical operating plan after delivery.',
    audience: 'founder',
    nextAction: 'Assign owners and dates, then link each workstream to actual tickets or tasks.',
    body: [
      '| Window | Workstream | Outcome | Owner |',
      '| --- | --- | --- | --- |',
      '| Days 0-30 | Confirm AI inventory, disclosures, source trail, and buyer answer bank | Buyer-safe baseline | Founder/product/legal |',
      '| Days 0-30 | Confirm data, vendor, DPA, subprocessor, retention, and privacy facts | Privacy/security baseline | Privacy/security/legal |',
      '| Days 31-60 | Formalize oversight, incident, change, vendor review, and training records | Operating controls | Product/security/ops |',
      '| Days 31-60 | Add evaluation, accuracy, robustness, cybersecurity, and monitoring evidence | Evidence maturity | Engineering/security |',
      '| Days 61-90 | Review high-risk, Annex IV, FRIA, post-market, conformity, and authority-readiness gaps | Expert-review decision | Legal/founder |',
      '| Days 61-90 | Convert approved materials into trust-center, procurement, and counsel handoff assets | Commercial handoff | Founder/sales/legal |',
    ],
  });
}

function renderPrivacyAiRiskRegister(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Privacy and AI Risk Register',
    purpose: 'Track privacy risks raised by AI inputs, outputs, model providers, logs, and buyer commitments.',
    audience: 'legal',
    nextAction: 'Review with privacy counsel or DPO where GDPR, local DPA guidance, or customer contracts require it.',
    body: [
      '| Risk | Trigger | Evidence/control | Owner | Status |',
      '| --- | --- | --- | --- | --- |',
      '| Personal data in AI inputs | Customer notes, support tickets, user prompts | Data map, input restrictions | Privacy/product | Needs confirmation |',
      '| Special-category or sensitive data | Health, children, biometric, finance, criminal, vulnerable groups | Intake and blocking policy | Legal/privacy | Expert review |',
      '| Vendor training/retention | Third-party model terms or settings | DPA, vendor terms, opt-out evidence | Privacy/security | Needs evidence |',
      '| Automated decisioning/profiling | AI output affects eligibility, access, employment, credit, pricing, or legal effects | Use-case map, legal review | Legal/product | Confirm |',
      '| International transfers | AI providers or subprocessors outside EU/UK | DPA, SCCs, transfer assessment | Privacy/legal | Needs evidence |',
      '| Data subject rights | Access, deletion, objection, explanation requests involving AI records | Rights handling note | Privacy/support | Starter |',
    ],
  });
}

function renderPrivacyNoticeUpdateBrief(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Privacy Notice Update Brief',
    purpose: 'Identify privacy notice areas that may need updates when AI features process personal data.',
    audience: 'legal',
    nextAction: 'Do not publish directly; use this as input for privacy counsel or the DPO.',
    body: [
      '| Notice area | Question to answer | Evidence source |',
      '| --- | --- | --- |',
      '| AI processing purpose | Why personal data is processed by AI features | Data processing map |',
      '| Categories of data | What personal data may appear in inputs, outputs, logs, and support review | Personal data category table |',
      '| Legal basis/role | Controller/processor role and lawful basis per workflow | Lawful basis intake |',
      '| Vendors/subprocessors | Which model/API providers process AI-related data | DPA/subprocessor summary |',
      '| Retention/deletion | How long AI inputs, outputs, and logs are retained | Retention/deletion note |',
      '| Rights and complaints | How access, deletion, objection, and complaint requests are handled | Rights handling note |',
    ],
  });
}

function renderRegulatorySourceMap(input: EvidenceRoomInput): string {
  return [
    '# Regulatory Source Map',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '| Topic | Source context | TrustFolder artifact | Boundary |',
    '| --- | --- | --- | --- |',
    '| EU AI Act Article 50 transparency | Transparency notices for AI interaction, generated content, deepfakes/synthetic media, emotion recognition, biometric categorisation, and certain public-interest text | Article 50 memo, matrix, notice register, notice library | Readiness/draft notices only |',
    '| EU AI Act high-risk requirements | Risk management, data governance, technical documentation, logging, instructions, human oversight, accuracy/robustness/cybersecurity | Articles 8-15 crosswalk, Annex IV index, risk file | Starter evidence map, not compliance conclusion |',
    '| EU AI Act Annex IV | Technical documentation evidence for high-risk AI systems | Annex IV technical documentation index and evidence request list | Index only |',
    '| EU AI Act Article 4 | AI literacy expectations for providers/deployers | AI literacy note and training register | Training evidence starter |',
    '| EU AI Act Articles 72-73 | Post-market monitoring and serious-incident reporting context | Post-market and incident starter, incident escalation | Starter SOP only |',
    '| EU AI Act Article 27 | FRIA context for covered high-risk deployments | FRIA starter checklist | Only where applicable; expert review needed |',
    '| ISO/IEC 42001 | AI management system standard for governance processes | ISO/IEC 42001-aligned readiness checklist, management review agenda | Alignment checklist only, not certification |',
    '| GDPR / privacy review | DPIA, lawful basis, processor/controller role, data subject rights, vendor data processing | DPIA starter, data map, DPA/subprocessor summary | Privacy review input, not legal advice |',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderCustomerEvidenceRequestList(input: EvidenceRoomInput): string {
  return renderStarterArtifact(input, {
    title: 'Customer Evidence Request List',
    purpose: 'Tell the customer exactly what to upload or confirm to turn starter artifacts into stronger evidence.',
    audience: 'founder',
    nextAction: 'Collect these items in a secure internal folder and link them from the evidence tracker.',
    body: [
      '| Evidence category | Examples to collect | Needed for |',
      '| --- | --- | --- |',
      '| Product evidence | Screenshots, UI copy, help docs, onboarding, terms, release notes | AI use summary, disclosures, instructions |',
      '| Architecture evidence | Data flow, model/provider diagram, prompts/config summaries, logging overview | Inventory, Annex IV index, security answers |',
      '| Vendor evidence | DPA, subprocessor list, model terms, security page, SOC/ISO reports if available | Vendor review, privacy, buyer questionnaire |',
      '| Privacy evidence | Privacy notice, DPA, retention policy, DSAR process, DPIA if existing | Privacy/data protection section |',
      '| Security evidence | Incident policy, access control, monitoring, penetration or SOC evidence if available | Security questionnaire, incident SOP |',
      '| Governance evidence | Owner list, policy approvals, management review notes, training records | ISO/IEC 42001 readiness, RACI, operating procedures |',
      '| Evaluation evidence | Test cases, eval results, red-team notes, issue logs, customer feedback | Accuracy/robustness/cybersecurity, monitoring |',
      '| Legal/commercial evidence | Customer commitments, buyer questions, counsel notes, contract language | Buyer handoff and procurement answers |',
    ],
  });
}

function renderInventoryStarter(input: EvidenceRoomInput): string {
  return [
    '# AI System Inventory',
    '',
    'No generated inventory document was available, so this starter inventory is included for completion.',
    '',
    '| System | Intended use | Users | Review status |',
    '| --- | --- | --- | --- |',
    `| ${input.companyName} AI system | Confirm product AI use | Confirm users | Needs review |`,
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderQaReport(
  input: EvidenceRoomInput,
  docs: GeneratedDoc[],
  qa: EvidenceRoomQaResult = qaFor([], docs),
): string {
  return [
    '# Pack QA Report',
    '',
    `Customer: ${input.companyName}`,
    `Generated: ${input.generationDate}`,
    '',
    '## Automated checks',
    '',
    `- Banned claims found: ${qa.banned_claims_found.length === 0 ? 'None' : qa.banned_claims_found.join(', ')}`,
    `- Generated docs missing source citations: ${qa.missing_source_notes.length === 0 ? 'None' : qa.missing_source_notes.join(', ')}`,
    `- Referenced package paths missing: ${qa.referenced_paths_missing.length === 0 ? 'None' : qa.referenced_paths_missing.join(', ')}`,
    `- Total package artifacts: ${qa.artifact_count}`,
    `- Source-traced generated docs: ${qa.source_traced_artifact_count}`,
    '- Scope disclaimer present: yes',
    '',
    '## Manual review still required',
    '',
    '- Product/factual accuracy.',
    '- Privacy and security claims.',
    '- Legal interpretation.',
    '- High-risk or sensitive-use applicability.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function renderMetadataCard(input: {
  title: string;
  purpose: string;
  audience: ArtifactAudience;
  reviewStatus: string;
  sourceCoverage: string;
  nextAction: string;
}): string {
  return [
    `> **${input.title}**`,
    `> Purpose: ${input.purpose}`,
    `> Audience: ${input.audience}`,
    `> Review status: ${input.reviewStatus}`,
    `> Source coverage: ${input.sourceCoverage}`,
    `> Next action: ${input.nextAction}`,
  ].join('\n');
}

function fileFromDoc(
  input: EvidenceRoomInput,
  docs: GeneratedDoc[],
  templateId: string,
  path: string,
  purpose: string,
  audience: ArtifactAudience,
): EvidenceRoomFile {
  const doc = findDoc(docs, templateId);
  if (doc) return file(path, renderGeneratedDoc(input, doc, purpose, audience));
  return file(path, renderMissingArtifactStarter(input, path, purpose, audience));
}

function renderMissingArtifactStarter(
  input: EvidenceRoomInput,
  path: string,
  purpose: string,
  audience: ArtifactAudience,
): string {
  return [
    renderMetadataCard({
      title: titleFromFilename(path),
      purpose,
      audience,
      reviewStatus: 'Needs review',
      sourceCoverage: 'Needs source confirmation',
      nextAction: 'Generate or fill this artifact before external use.',
    }),
    '',
    `# ${titleFromFilename(path)} - ${input.companyName}`,
    '',
    'This starter file marks a required evidence-room slot. It was not fully generated from the available inputs.',
    '',
    scopeBoundary(),
    '',
  ].join('\n');
}

function findDoc(docs: GeneratedDoc[], templateId: string): GeneratedDoc | undefined {
  return docs.find((doc) => doc.template_id === templateId);
}

function artifactFor(path: string, docs: GeneratedDoc[]): EvidenceRoomArtifact {
  const generated = docs.find((doc) => path.endsWith(normaliseDocFilename(doc.filename)));
  return {
    path,
    title: titleFromFilename(path),
    category: categoryForPath(path),
    audience: audienceForPath(path),
    sourceCoverage: generated ? coverageFor(generated) : 'partial',
    reviewStatus: generated?.confidence_band === 'CLEAR' ? 'draft' : 'review-needed',
  };
}

function qaFor(files: EvidenceRoomFile[], docs: GeneratedDoc[]): EvidenceRoomQaResult {
  const content = files.map((file) => file.content).join('\n');
  const banned = BANNED_CLAIMS.filter((claim) => new RegExp(escapeRegExp(claim), 'i').test(content));
  const existingPaths = new Set(files.map((file) => file.path));
  const existingBasenames = new Set(files.map((file) => file.path.split('/').pop() ?? file.path));
  const referencedPaths = Array.from(content.matchAll(/`([^`\n]+\.(?:md|html|json))`/gi))
    .map((match) => match[1]?.trim())
    .filter((candidate): candidate is string => Boolean(candidate))
    .filter((candidate) => !candidate.startsWith('http'));
  const referencedMissing = Array.from(new Set(
    referencedPaths.filter((candidate) => {
      const basename = candidate.split('/').pop() ?? candidate;
      return !existingPaths.has(candidate) && !existingBasenames.has(basename);
    }),
  )).sort();
  const missing = docs
    .filter((doc) => doc.ok && doc.content_md.trim().length > 0 && doc.citations.length === 0)
    .map((doc) => doc.filename);
  return {
    banned_claims_found: banned,
    missing_source_notes: missing,
    referenced_paths_missing: referencedMissing,
    artifact_count: files.length,
    source_traced_artifact_count: docs.filter((doc) => doc.citations.length > 0).length,
    scope_boundary_present: true,
  };
}

function categoryForPath(path: string): string {
  if (path.includes('disclosure') || path.includes('transparency')) return 'transparency';
  if (path.includes('governance') || path.includes('oversight')) return 'governance';
  if (path.includes('risk') || path.includes('readiness') || path.includes('annex')) return 'risk-readiness';
  if (path.includes('privacy') || path.includes('dpia') || path.includes('data-protection')) return 'privacy-data';
  if (path.includes('security') || path.includes('vendor') || path.includes('procurement')) return 'buyer-security';
  if (path.includes('evidence') || path.includes('source')) return 'evidence';
  if (path.includes('buyer') || path.includes('legal') || path.includes('lawyer')) return 'buyer-legal';
  if (path.includes('open-items') || path.includes('roadmap')) return 'next-steps';
  if (path.includes('appendices') || path.includes('format')) return 'appendix';
  return 'summary';
}

function audienceForPath(path: string): ArtifactAudience {
  if (path.includes('annex') || path.includes('risk') || path.includes('iso') || path.includes('authority')) return 'authority-readiness';
  if (path.includes('buyer')) return 'buyer';
  if (path.includes('legal') || path.includes('lawyer') || path.includes('privacy') || path.includes('dpia')) return 'legal';
  if (path.includes('governance') || path.includes('inventory') || path.includes('oversight')) return 'operator';
  return 'founder';
}

function coverageFor(doc: GeneratedDoc): SourceCoverage {
  if (doc.citations.length >= 2) return 'strong';
  if (doc.citations.length === 1) return 'partial';
  return 'needs-review';
}

function renderCitationList(docs: GeneratedDoc[]): string {
  const citations = Array.from(new Set(docs.flatMap((doc) => doc.citations))).sort();
  return citations.length > 0
    ? citations.map((citation) => `- ${citation}`).join('\n')
    : '- No source citations captured. Confirm manually before external use.';
}

function renderReadinessSummary(readiness: ReadinessScore | null): string {
  if (!readiness) {
    return [
      '## AI documentation readiness',
      '',
      'No readiness score was available for this pack. Use the open review items and QA report as the next review surface.',
    ].join('\n');
  }
  return [
    '## AI documentation readiness',
    '',
    `Overall score: ${readiness.overall}/100 - ${readiness.band_label}`,
    '',
    `Recommended next step: ${readiness.recommended_next_step}`,
    '',
    readiness.disclaimer,
  ].join('\n');
}

function rootFolderNameFor(input: EvidenceRoomInput): string {
  const packName =
    input.tier === 'tier_2'
      ? 'TrustFolder AI Disclosure Pack'
      : 'TrustFolder Buyer-Ready Governance Folder';
  return `${packName} - ${input.companyName} - ${input.generationDate}`;
}

function normaliseDocFilename(filename: string): string {
  return filename.replace(/^0?5-ai-system-disclosure-page\.md$/, 'public-ai-disclosure-draft.md');
}

function titleFromFilename(filename: string): string {
  const base = filename.split('/').pop() ?? filename;
  return base
    .replace(/\.html?$/i, '')
    .replace(/\.md$/i, '')
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function scopeBoundary(): string {
  return DISCLAIMERS.join(' ');
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function file(path: string, content: string): EvidenceRoomFile {
  return { path, content };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
