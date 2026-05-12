/**
 * POST /api/confirm
 *
 * Step 2-3 of the customer journey: user submits the 8-question confirmation form.
 * Persists answers to the assessment, then runs scope-check.
 *
 * Inputs:  { assessment_id, answers }
 * Returns: { in_scope, band, recommended_tier, user_message, next_step }
 *   next_step: 'pay' | 'out_of_scope' | 'soft_out_review'
 */

import { NextResponse } from 'next/server';
import { computeReadinessScore, scopeCheck, service } from '@trustfolder/engine';
import type { QuestionnaireAnswers, ExtractionData } from '@trustfolder/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ConfirmRequest {
  assessment_id: string;
  answers: QuestionnaireAnswers;
}

export async function POST(req: Request) {
  let body: ConfirmRequest;
  try {
    body = (await req.json()) as ConfirmRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.assessment_id) {
    return NextResponse.json({ error: 'missing_assessment_id' }, { status: 400 });
  }

  const sb = service();

  // Read assessment
  const { data: a, error: aErr } = await sb
    .from('assessments')
    .select('id, email, url, extraction_data')
    .eq('id', body.assessment_id)
    .single();

  if (aErr || !a) {
    return NextResponse.json({ error: 'assessment_not_found' }, { status: 404 });
  }

  const answers = body.answers ?? ({} as QuestionnaireAnswers);
  const extraction = (a.extraction_data ?? {}) as ExtractionData;

  // Run scope-check (deterministic, no LLM)
  const sc = scopeCheck({ extraction, answers });

  // Persist
  const { error: updErr } = await sb
    .from('assessments')
    .update({
      questionnaire_data: answers,
      questionnaire_completed_at: new Date().toISOString(),
      scope_check_passed: sc.in_scope,
      scope_check_band: sc.band,
      scope_check_matched_keywords: sc.matched_keywords,
      scope_check_at: new Date().toISOString(),
      recommended_tier: sc.recommended_tier ?? null,
    })
    .eq('id', body.assessment_id);

  if (updErr) {
    return NextResponse.json(
      { error: 'assessment_update_failed', detail: updErr.message },
      { status: 500 },
    );
  }

  // Decide next step
  let next_step: 'pay' | 'out_of_scope' | 'soft_out_review';
  if (!sc.in_scope) {
    next_step = 'out_of_scope';
  } else if (sc.band === 'SOFT_OUT') {
    next_step = 'soft_out_review';
  } else {
    next_step = 'pay';
  }

  // Phase 8 — Readiness Score for the assessment review screen.
  const readiness = computeReadinessScore({
    extraction,
    answers,
    scope: { in_scope: sc.in_scope, band: sc.band },
  });

  return NextResponse.json({
    in_scope: sc.in_scope,
    band: sc.band,
    recommended_tier: sc.recommended_tier,
    user_message: sc.user_message,
    next_step,
    matched_keywords: sc.matched_keywords,
    readiness,
  });
}
