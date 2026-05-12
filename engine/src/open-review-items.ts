/**
 * Open Review Items — Phase 8 batch 3.
 *
 * Pure helper that, given the pack inputs, returns a static list of "open
 * review items" to ship inside the delivered pack and to render on the
 * customer dashboard. Items are intentionally categorical and human-facing.
 * No legal conclusions; nothing is auto-resolved.
 *
 * Hard rules:
 *  - Each item is framed as a thing the customer/lawyer/security reviewer
 *    must confirm, not a thing TrustFolder has certified.
 *  - High-risk vertical signals always produce an "Expert review required"
 *    item.
 */

import type {
  ExtractionData,
  QuestionnaireAnswers,
  ScopeCheckResult,
  Tier,
} from './lib/types.js';

export type OpenReviewCategory =
  | 'product_clarity'
  | 'user_disclosure'
  | 'data_use'
  | 'human_oversight'
  | 'buyer_legal_review'
  | 'high_risk_scope'
  | 'missing_evidence'
  | 'expert_review_required';

export type OpenReviewPriority = 'high' | 'medium' | 'low';

export interface OpenReviewItem {
  id: string;
  title: string;
  why: string;
  category: OpenReviewCategory;
  priority: OpenReviewPriority;
  suggested_owner: 'founder' | 'product' | 'legal' | 'security' | 'privacy' | 'expert';
  status: 'open';
}

export interface OpenReviewInput {
  extraction: ExtractionData | null;
  answers: QuestionnaireAnswers | null;
  scope: Pick<ScopeCheckResult, 'in_scope' | 'band'> | null;
  tier: Tier;
}

export function buildOpenReviewItems(input: OpenReviewInput): OpenReviewItem[] {
  const items: OpenReviewItem[] = [];
  const e = input.extraction;
  const a = input.answers;
  const s = input.scope;

  // Always-on items.
  items.push({
    id: 'product-clarity-1',
    title: 'Confirm the AI use summary matches what your team actually ships',
    why: 'The pack is built from your public site and intake. Confirm the AI use summary before sharing externally.',
    category: 'product_clarity',
    priority: 'high',
    suggested_owner: 'product',
    status: 'open',
  });

  items.push({
    id: 'buyer-legal-1',
    title: 'Forward the buyer/legal handoff to qualified counsel',
    why: 'TrustFolder prepares review-ready drafts. Final review belongs with qualified counsel.',
    category: 'buyer_legal_review',
    priority: 'high',
    suggested_owner: 'legal',
    status: 'open',
  });

  // Disclosure surfaces.
  if (a?.ai_user_interaction === 'background') {
    items.push({
      id: 'disclosure-1',
      title: 'Decide where to place AI disclosures when the AI runs in the background',
      why: 'Background AI is harder to disclose. Confirm the disclosure surface before publishing.',
      category: 'user_disclosure',
      priority: 'medium',
      suggested_owner: 'product',
      status: 'open',
    });
  }

  // Data use.
  if (a?.processes_personal_data === 'yes') {
    items.push({
      id: 'data-use-1',
      title: 'Confirm whether customer data is used for model training',
      why: 'Buyers and privacy reviewers ask this directly. Document the answer with evidence pointers.',
      category: 'data_use',
      priority: 'high',
      suggested_owner: 'privacy',
      status: 'open',
    });
  }
  if (a?.processes_personal_data === 'unsure') {
    items.push({
      id: 'data-use-2',
      title: 'Document what personal data flows through your AI features',
      why: 'You marked personal-data processing as unsure. Capture the answer with sources before buyer review.',
      category: 'data_use',
      priority: 'high',
      suggested_owner: 'privacy',
      status: 'open',
    });
  }

  // Human oversight.
  if (a?.human_oversight === 'never') {
    items.push({
      id: 'oversight-1',
      title: 'Document a human oversight procedure (or planned procedure)',
      why: 'No human oversight raises buyer-review and regulator-review attention. Capture what review looks like, even informally.',
      category: 'human_oversight',
      priority: 'high',
      suggested_owner: 'founder',
      status: 'open',
    });
  }

  // Missing evidence.
  if ((e?.ai_features ?? []).length === 0) {
    items.push({
      id: 'evidence-1',
      title: 'Confirm at least one AI feature description on your site',
      why: 'We did not extract any AI feature description from your site. Add or confirm one before sharing the pack.',
      category: 'missing_evidence',
      priority: 'medium',
      suggested_owner: 'product',
      status: 'open',
    });
  }
  if (e?.confidence === 'low') {
    items.push({
      id: 'evidence-2',
      title: 'Confirm extracted facts before sharing the pack',
      why: 'Extraction confidence from your website was low. Confirm key facts in the pack with your team.',
      category: 'missing_evidence',
      priority: 'medium',
      suggested_owner: 'founder',
      status: 'open',
    });
  }

  // High-risk scope.
  if (s && s.band === 'REVIEW') {
    items.push({
      id: 'highrisk-1',
      title: 'Sensitive areas flagged — confirm expert review path',
      why: 'Scope check flagged sensitive aspects. Plan an expert review before any external use of the pack.',
      category: 'high_risk_scope',
      priority: 'high',
      suggested_owner: 'expert',
      status: 'open',
    });
  }
  if (s && s.band === 'SOFT_OUT') {
    items.push({
      id: 'highrisk-2',
      title: 'Founder review recommended before external use',
      why: 'Scope check flagged soft-out signals. Confirm scope with the founder review.',
      category: 'high_risk_scope',
      priority: 'high',
      suggested_owner: 'founder',
      status: 'open',
    });
  }
  if (s && s.in_scope === false) {
    items.push({
      id: 'expert-1',
      title: 'Route to qualified expert review (not eligible for automated pack)',
      why: 'Your use case is in an out-of-scope vertical. We will not auto-generate a final pack here.',
      category: 'expert_review_required',
      priority: 'high',
      suggested_owner: 'expert',
      status: 'open',
    });
  }

  return items;
}

export function renderOpenReviewItemsMarkdown(items: OpenReviewItem[]): string {
  if (items.length === 0) {
    return '# Open review items\n\n_(none flagged)_\n';
  }
  const lines: string[] = [
    '# Open review items',
    '',
    'These items are open for confirmation. None of them are auto-resolved by TrustFolder.',
    '',
    'Not legal advice. Not certification. Not a compliance guarantee.',
    '',
  ];
  for (const item of items) {
    lines.push(`## ${item.title}`);
    lines.push('');
    lines.push(`- **Category:** ${labelForCategory(item.category)}`);
    lines.push(`- **Priority:** ${item.priority}`);
    lines.push(`- **Suggested owner:** ${item.suggested_owner}`);
    lines.push(`- **Status:** ${item.status}`);
    lines.push('');
    lines.push(`Why it matters: ${item.why}`);
    lines.push('');
  }
  return lines.join('\n');
}

function labelForCategory(c: OpenReviewCategory): string {
  switch (c) {
    case 'product_clarity':
      return 'Product clarity';
    case 'user_disclosure':
      return 'User disclosure';
    case 'data_use':
      return 'Data use';
    case 'human_oversight':
      return 'Human oversight';
    case 'buyer_legal_review':
      return 'Buyer / legal review';
    case 'high_risk_scope':
      return 'High-risk scope';
    case 'missing_evidence':
      return 'Missing evidence';
    case 'expert_review_required':
      return 'Expert review required';
  }
}
