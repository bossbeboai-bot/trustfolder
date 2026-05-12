// Smoke runner for paths A, C, D against a running Next.js server.
// - No secret values are read or printed.
// - Only response shape signals (status, in_scope, band, next_step, recommended_tier,
//   scan_ok, assessment_id_present, extraction_null) are surfaced.
// - Exit code: 0 if A && C && D pass, otherwise 2.
//
// Usage:
//   PORT=3000 node scripts/smoke-acd.mjs
//   node scripts/smoke-acd.mjs           (defaults to 3000)

const PORT = process.env.PORT || '3000';
const BASE = `http://localhost:${PORT}`;

const REAL_SAFE_URL = 'https://linear.app';
const BROKEN_URL = 'https://does-not-exist-smoke-test.invalid';

function ts() {
  return new Date().toISOString();
}

async function postJson(path, body) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      // ignore parse error
    }
    return {
      status: res.status,
      body: payload,
      duration_ms: Date.now() - t0,
    };
  } catch (err) {
    return {
      status: 0,
      body: null,
      duration_ms: Date.now() - t0,
      network_error: err?.message ?? String(err),
    };
  }
}

function clearAnswers(overrides = {}) {
  return {
    company_name: 'Linear',
    product_description: 'Project management for software teams',
    primary_ai_use_case: 'sprint planning suggestions',
    b2b_or_b2c: 'B2B',
    has_eu_customers: 'yes',
    ai_user_interaction: 'reviewed',
    processes_personal_data: 'no',
    vertical: 'productivity',
    ...overrides,
  };
}

function hrAnswers() {
  return {
    company_name: 'Acme HR',
    product_description: 'AI-powered HR scoring for recruitment',
    primary_ai_use_case: 'candidate ranking',
    b2b_or_b2c: 'B2B',
    has_eu_customers: 'yes',
    ai_user_interaction: 'reviewed',
    processes_personal_data: 'yes',
    vertical: 'hr',
  };
}

async function pathA() {
  const startedAt = ts();
  const scan = await postJson('/api/scan', {
    url: REAL_SAFE_URL,
    email: 'smoke+a@trustfolder.test',
  });
  const assessmentId = scan.body?.assessment_id ?? null;
  const summaryScan = {
    status: scan.status,
    duration_ms: scan.duration_ms,
    scan_ok: scan.body?.scan_ok ?? null,
    extraction_present: !!scan.body?.extraction,
    assessment_id_present: !!assessmentId,
    network_error: scan.network_error ?? null,
  };
  if (!(scan.status === 200 && assessmentId)) {
    return {
      ok: false,
      step_failed: 'scan',
      startedAt,
      scan: summaryScan,
    };
  }

  const confirm = await postJson('/api/confirm', {
    assessment_id: assessmentId,
    answers: clearAnswers(),
  });
  const summaryConfirm = {
    status: confirm.status,
    duration_ms: confirm.duration_ms,
    in_scope: confirm.body?.in_scope ?? null,
    band: confirm.body?.band ?? null,
    next_step: confirm.body?.next_step ?? null,
    recommended_tier: confirm.body?.recommended_tier ?? null,
    network_error: confirm.network_error ?? null,
  };
  // For free eligibility check, success is: API responded 200, in_scope true, next_step pay or soft_out_review,
  // recommended_tier non-null. Bands CLEAR or REVIEW or SOFT_OUT all acceptable.
  const ok =
    confirm.status === 200 &&
    confirm.body?.in_scope === true &&
    (confirm.body?.next_step === 'pay' ||
      confirm.body?.next_step === 'soft_out_review') &&
    (confirm.body?.recommended_tier === 'tier_1' ||
      confirm.body?.recommended_tier === 'tier_2' ||
      confirm.body?.recommended_tier === 'tier_3');
  return {
    ok,
    step_failed: ok ? null : 'confirm',
    startedAt,
    scan: summaryScan,
    confirm: summaryConfirm,
  };
}

async function pathC() {
  const startedAt = ts();
  const scan = await postJson('/api/scan', {
    url: BROKEN_URL,
    email: 'smoke+c@trustfolder.test',
  });
  const assessmentId = scan.body?.assessment_id ?? null;
  const extraction = scan.body?.extraction ?? null;
  const usedFallbackMinimal = extraction?.used_fallback_minimal === true;
  const fallbackBehaviorOk =
    extraction === null || usedFallbackMinimal;
  const summaryScan = {
    status: scan.status,
    duration_ms: scan.duration_ms,
    scan_ok: scan.body?.scan_ok ?? null,
    extraction_null: extraction === null,
    used_fallback_minimal: usedFallbackMinimal,
    assessment_id_present: !!assessmentId,
    network_error: scan.network_error ?? null,
  };
  // Spec: scan must fail gracefully and still allow user to proceed.
  // 200 + assessment_id present + scan_ok=false + (extraction null or fallback-minimal).
  const ok =
    scan.status === 200 &&
    !!assessmentId &&
    scan.body?.scan_ok === false &&
    fallbackBehaviorOk;
  return {
    ok,
    step_failed: ok ? null : 'scan',
    startedAt,
    scan: summaryScan,
  };
}

async function pathD() {
  const startedAt = ts();
  const scan = await postJson('/api/scan', {
    url: REAL_SAFE_URL,
    email: 'smoke+d@trustfolder.test',
  });
  const assessmentId = scan.body?.assessment_id ?? null;
  const summaryScan = {
    status: scan.status,
    duration_ms: scan.duration_ms,
    scan_ok: scan.body?.scan_ok ?? null,
    assessment_id_present: !!assessmentId,
    network_error: scan.network_error ?? null,
  };
  if (!(scan.status === 200 && assessmentId)) {
    return {
      ok: false,
      step_failed: 'scan',
      startedAt,
      scan: summaryScan,
    };
  }

  const confirm = await postJson('/api/confirm', {
    assessment_id: assessmentId,
    answers: hrAnswers(),
  });
  const summaryConfirm = {
    status: confirm.status,
    duration_ms: confirm.duration_ms,
    in_scope: confirm.body?.in_scope ?? null,
    band: confirm.body?.band ?? null,
    next_step: confirm.body?.next_step ?? null,
    recommended_tier: confirm.body?.recommended_tier ?? null,
    network_error: confirm.network_error ?? null,
  };
  // Out-of-scope rejection: in_scope false, band HARD_OUT, next_step out_of_scope, recommended_tier null.
  const ok =
    confirm.status === 200 &&
    confirm.body?.in_scope === false &&
    confirm.body?.band === 'HARD_OUT' &&
    confirm.body?.next_step === 'out_of_scope' &&
    confirm.body?.recommended_tier === null;
  return {
    ok,
    step_failed: ok ? null : 'confirm',
    startedAt,
    scan: summaryScan,
    confirm: summaryConfirm,
  };
}

(async () => {
  const a = await pathA();
  const c = await pathC();
  const d = await pathD();
  const out = {
    base_url: BASE,
    finished_at: ts(),
    A: { ok: a.ok, step_failed: a.step_failed, scan: a.scan, confirm: a.confirm ?? null },
    C: { ok: c.ok, step_failed: c.step_failed, scan: c.scan },
    D: { ok: d.ok, step_failed: d.step_failed, scan: d.scan, confirm: d.confirm ?? null },
  };
  console.log(JSON.stringify(out, null, 2));
  if (a.ok && c.ok && d.ok) {
    process.exit(0);
  }
  process.exit(2);
})();
