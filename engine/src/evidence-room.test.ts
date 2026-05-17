import { describe, expect, it } from 'vitest';
import type { GeneratedDoc } from './lib/types.js';
import { buildEvidenceRoomFiles } from './evidence-room.js';

const generatedAt = '2026-05-17';
const companyName = 'BrightDesk AI';
const sourceUrl = 'https://brightdesk.example/product';

function doc(templateId: string, filename: string, title: string): GeneratedDoc {
  return {
    template_id: templateId,
    filename,
    content_md: [
      `# ${title}`,
      '',
      `BrightDesk AI uses AI to help customer-success teams summarize account notes and draft customer replies.`,
      '',
      '## Source trail',
      '',
      `- ${sourceUrl}`,
      '- Founder intake answers',
      '',
      '## Review status',
      '',
      'Draft for buyer/legal review.',
      '',
    ].join('\n'),
    confidence_band: 'REVIEW',
    citations: [sourceUrl, 'Founder intake answers'],
    api_cost_cents: 0,
    duration_ms: 0,
    ok: true,
  };
}

const disclosureDocs = [
  doc('t1-01-chatbot-disclosure', '01-ai-interaction-notice.md', 'AI Interaction Notice'),
  doc('t1-02-ai-content-labeling', '02-ai-generated-content-labeling.md', 'AI-Generated Content Labeling'),
  doc('t1-06-ai-system-disclosure-page', '05-ai-system-disclosure-page.md', 'AI System Disclosure Page'),
  doc('t1-07-ai-usage-policy-summary', '06-ai-usage-policy-summary.md', 'AI Usage Policy Summary'),
];

const governanceDocs = [
  doc('t2-01-ai-system-inventory', '01-ai-system-inventory.md', 'AI System Inventory'),
  doc('t2-02-provider-deployer-memo', '02-provider-deployer-role-memo.md', 'Provider / Deployer Role Memo'),
  doc('t2-03-risk-classification-memo', '03-risk-classification-memo.md', 'Risk Classification Memo'),
  doc('t2-04-iso-42001-checklist', '04-iso-iec-42001-readiness-checklist.md', 'ISO/IEC 42001 Readiness Checklist'),
  doc('t2-05-evidence-tracker', '05-evidence-tracker.md', 'Evidence Tracker'),
  doc('t2-06-ai-policy-draft', '06-ai-governance-policy.md', 'AI Governance Policy'),
  doc('t2-07-human-oversight-procedure', '07-human-oversight-procedure.md', 'Human Oversight Procedure'),
  doc('t2-08-vendor-questionnaire', '08-vendor-questionnaire.md', 'Vendor Questionnaire'),
  doc('t2-09-lawyer-handoff-pack', '09-lawyer-handoff-pack.md', 'Lawyer Handoff Pack'),
  doc('t2-10-governance-roadmap', '10-governance-roadmap.md', 'Governance Roadmap'),
];

describe('buildEvidenceRoomFiles', () => {
  it('builds a client-grade $499 disclosure pack with source notes and no admin-demo labels', () => {
    const room = buildEvidenceRoomFiles({
      tier: 'tier_2',
      companyName,
      generationDate: generatedAt,
      sourceUrl,
      docs: disclosureDocs,
      readiness: null,
      openItems: [],
      supportEmail: 'support@trustfolder.com',
    });

    const paths = room.files.map((file) => file.path).sort();
    expect(room.rootFolderName).toBe('TrustFolder AI Disclosure Pack - BrightDesk AI - 2026-05-17');
    expect(paths).toContain('START-HERE.html');
    expect(paths).toContain('README.md');
    expect(paths).toContain('00-client-orientation/client-delivery-summary.md');
    expect(paths).toContain('00-client-orientation/document-index-and-control.md');
    expect(paths).toContain('00-client-orientation/document-format-and-review-rules.md');
    expect(paths).toContain('01-ai-use-summary/product-ai-use-summary.md');
    expect(paths).toContain('02-disclosure-drafts/01-ai-interaction-notice.md');
    expect(paths).toContain('02-disclosure-drafts/article-50-applicability-matrix.md');
    expect(paths).toContain('02-disclosure-drafts/ai-transparency-notice-register.md');
    expect(paths).toContain('02-disclosure-drafts/disclosure-placement-and-copy-deck.md');
    expect(paths).toContain('02-disclosure-drafts/user-instructions-and-limitations-starter.md');
    expect(paths).toContain('02-disclosure-drafts/article-4-ai-literacy-note.md');
    expect(paths).toContain('03-evidence-tracker/evidence-tracker.md');
    expect(paths).toContain('03-evidence-tracker/claim-to-source-matrix.md');
    expect(paths).toContain('03-evidence-tracker/source-reference-register.md');
    expect(paths).toContain('04-buyer-legal-handoff/buyer-legal-cover-note.md');
    expect(paths).toContain('04-buyer-legal-handoff/lawyer-review-checklist.md');
    expect(paths).toContain('04-buyer-legal-handoff/procurement-answer-bank.md');
    expect(paths).toContain('04-buyer-legal-handoff/external-sharing-checklist.md');
    expect(paths).toContain('05-source-notes/sources-and-notes.md');
    expect(paths).toContain('06-appendices/regulatory-source-map.md');
    expect(paths).toContain('pack-qa-report.md');
    expect(paths).toContain('manifest.json');

    const allContent = room.files.map((file) => file.content).join('\n');
    expect(allContent).not.toMatch(/Illustrative admin preview|Acme AI|acme\.example/i);
    expect(allContent).toMatch(/Not legal advice/);

    const manifest = JSON.parse(room.files.find((file) => file.path === 'manifest.json')!.content);
    expect(manifest.tier).toBe('disclosure');
    expect(manifest.artifacts.length).toBeGreaterThanOrEqual(20);
    expect(manifest.qa.banned_claims_found).toEqual([]);
    expect(manifest.qa.referenced_paths_missing).toEqual([]);
  });

  it('builds the $999 governance folder as a complete buyer-review evidence room', () => {
    const room = buildEvidenceRoomFiles({
      tier: 'tier_3',
      companyName,
      generationDate: generatedAt,
      sourceUrl,
      docs: [...disclosureDocs, ...governanceDocs],
      readiness: {
        overall: 74,
        band: 'partial',
        band_label: 'Developing evidence base',
        recommended_next_step: 'Review open items with product, privacy, and counsel.',
        dimensions: [],
        disclaimer: 'Readiness score is directional and not a compliance determination.',
        limitations: ['Sample readiness score for package rendering.'],
        label: 'AI documentation readiness score',
      },
      openItems: [
        {
          id: 'confirm-personal-data',
          category: 'privacy',
          status: 'open',
          priority: 'high',
          title: 'Confirm personal-data handling',
          why: 'Buyer/legal review will ask how customer account notes are processed.',
          suggested_owner: 'privacy',
        },
      ],
      supportEmail: 'support@trustfolder.com',
    });

    const paths = room.files.map((file) => file.path).sort();
    expect(room.rootFolderName).toBe('TrustFolder Buyer-Ready Governance Folder - BrightDesk AI - 2026-05-17');
    expect(paths).toContain('START-HERE.html');
    expect(paths).toContain('00-executive-brief/client-delivery-summary.md');
    expect(paths).toContain('00-executive-brief/document-index-and-control.md');
    expect(paths).toContain('00-executive-brief/document-format-and-review-rules.md');
    expect(paths).toContain('00-executive-brief/pack-navigation-map.md');
    expect(paths).toContain('00-executive-brief/board-cover-note.md');
    expect(paths).toContain('00-executive-brief/executive-buyer-brief.md');
    expect(paths).toContain('01-ai-system-inventory/ai-system-inventory.md');
    expect(paths).toContain('01-ai-system-inventory/ai-use-case-map.md');
    expect(paths).toContain('01-ai-system-inventory/eu-market-exposure-note.md');
    expect(paths).toContain('01-ai-system-inventory/customer-user-impact-summary.md');
    expect(paths).toContain('01-ai-system-inventory/intended-purpose-and-lifecycle.md');
    expect(paths).toContain('01-ai-system-inventory/model-card-lite.md');
    expect(paths).toContain('01-ai-system-inventory/data-provenance-register.md');
    expect(paths).toContain('01-ai-system-inventory/instructions-for-use-starter.md');
    expect(paths).toContain('02-disclosures-and-transparency/article-50-transparency-readiness.md');
    expect(paths).toContain('02-disclosures-and-transparency/article-50-notice-library.md');
    expect(paths).toContain('02-disclosures-and-transparency/disclosure-placement-plan.md');
    expect(paths).toContain('02-disclosures-and-transparency/user-instructions-and-limitations-starter.md');
    expect(paths).toContain('02-disclosures-and-transparency/article-4-ai-literacy-note.md');
    expect(paths).toContain('03-governance-and-controls/ai-governance-summary.md');
    expect(paths).toContain('03-governance-and-controls/provider-deployer-role-map.md');
    expect(paths).toContain('03-governance-and-controls/ai-governance-raci.md');
    expect(paths).toContain('03-governance-and-controls/change-management-and-version-log.md');
    expect(paths).toContain('03-governance-and-controls/incident-escalation-procedure.md');
    expect(paths).toContain('03-governance-and-controls/model-vendor-review-procedure.md');
    expect(paths).toContain('03-governance-and-controls/internal-ai-acceptable-use-and-training.md');
    expect(paths).toContain('03-governance-and-controls/risk-management-file.md');
    expect(paths).toContain('03-governance-and-controls/management-review-agenda.md');
    expect(paths).toContain('03-governance-and-controls/ai-literacy-training-register.md');
    expect(paths).toContain('03-governance-and-controls/role-based-operating-procedures.md');
    expect(paths).toContain('04-risk-and-readiness/eu-ai-act-risk-classification-memo.md');
    expect(paths).toContain('04-risk-and-readiness/annex-iii-high-risk-screen.md');
    expect(paths).toContain('04-risk-and-readiness/eu-ai-act-articles-8-to-15-crosswalk.md');
    expect(paths).toContain('04-risk-and-readiness/data-governance-readiness.md');
    expect(paths).toContain('04-risk-and-readiness/accuracy-robustness-cybersecurity-readiness.md');
    expect(paths).toContain('04-risk-and-readiness/annex-iv-evidence-request-list.md');
    expect(paths).toContain('05-evidence-and-source-trail/evidence-tracker.md');
    expect(paths).toContain('04-risk-and-readiness/quality-management-starter-checklist.md');
    expect(paths).toContain('04-risk-and-readiness/record-keeping-and-logging-readiness.md');
    expect(paths).toContain('04-risk-and-readiness/eu-database-registration-readiness.md');
    expect(paths).toContain('04-risk-and-readiness/conformity-assessment-readiness.md');
    expect(paths).toContain('04-risk-and-readiness/fria-starter-checklist.md');
    expect(paths).toContain('05-evidence-and-source-trail/control-mapping-eu-ai-act-iso-gdpr.md');
    expect(paths).toContain('05-evidence-and-source-trail/source-reference-register.md');
    expect(paths).toContain('05-evidence-and-source-trail/source-quality-register.md');
    expect(paths).toContain('05-evidence-and-source-trail/decision-log.md');
    expect(paths).toContain('05-evidence-and-source-trail/review-status-manifest.md');
    expect(paths).toContain('06-buyer-legal-handoff/buyer-review-packet.html');
    expect(paths).toContain('06-buyer-legal-handoff/buyer-executive-qa.md');
    expect(paths).toContain('06-buyer-legal-handoff/security-questionnaire-starter.md');
    expect(paths).toContain('06-buyer-legal-handoff/vendor-questionnaire-response-draft.md');
    expect(paths).toContain('06-buyer-legal-handoff/customer-trust-center-copy-starter.md');
    expect(paths).toContain('06-buyer-legal-handoff/authority-readiness-note.md');
    expect(paths).toContain('06-buyer-legal-handoff/external-sharing-checklist.md');
    expect(paths).toContain('06-buyer-legal-handoff/counsel-review-checklist.md');
    expect(paths).toContain('07-open-items-and-roadmap/30-60-90-governance-roadmap.md');
    expect(paths).toContain('08-privacy-and-data-protection/dpia-starter-checklist.md');
    expect(paths).toContain('08-privacy-and-data-protection/data-processing-map.md');
    expect(paths).toContain('08-privacy-and-data-protection/personal-data-category-table.md');
    expect(paths).toContain('08-privacy-and-data-protection/lawful-basis-and-role-intake.md');
    expect(paths).toContain('08-privacy-and-data-protection/dpa-subprocessor-summary.md');
    expect(paths).toContain('08-privacy-and-data-protection/retention-deletion-and-data-subject-rights.md');
    expect(paths).toContain('08-privacy-and-data-protection/privacy-ai-risk-register.md');
    expect(paths).toContain('08-privacy-and-data-protection/privacy-notice-update-brief.md');
    expect(paths).toContain('09-appendices/regulatory-source-map.md');
    expect(paths).toContain('09-appendices/customer-evidence-request-list.md');
    expect(paths).toContain('07-open-items-and-roadmap/open-review-items.md');
    expect(paths).toContain('manifest.json');
    expect(paths.length).toBeGreaterThanOrEqual(75);

    const startHere = room.files.find((file) => file.path === 'START-HERE.html')!.content;
    expect(startHere).toMatch(/buyer-review evidence folder/i);
    expect(startHere).toMatch(/74 \/ 100/);
    expect(startHere).not.toMatch(/final EU declaration of conformity|fully compliant|certified/i);

    const manifest = JSON.parse(room.files.find((file) => file.path === 'manifest.json')!.content);
    expect(manifest.tier).toBe('governance');
    expect(manifest.qa.missing_source_notes).toEqual([]);
    expect(manifest.qa.referenced_paths_missing).toEqual([]);
    expect(manifest.disclaimers.join(' ')).toMatch(/not legal advice/i);
  });
});
