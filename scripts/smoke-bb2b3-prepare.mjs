const PORT = process.env.PORT || '3000';
const BASE = `http://localhost:${PORT}`;
const SAFE_URL = 'https://linear.app';

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
    } catch {}
    return { status: res.status, body: payload, duration_ms: Date.now() - t0 };
  } catch (err) {
    return { status: 0, body: null, duration_ms: Date.now() - t0, network_error: err?.message ?? String(err) };
  }
}

function answers(overrides = {}) {
  return {
    company_name: 'Linear',
    product_description: 'Project management for software teams using AI-assisted planning summaries',
    primary_ai_use_case: 'AI-assisted planning summaries',
    b2b_or_b2c: 'B2B',
    has_eu_customers: 'yes',
    ai_user_interaction: 'reviewed',
    processes_personal_data: 'no',
    vertical: 'productivity',
    ...overrides,
  };
}

async function preparePaidPath(label, tier, answerOverrides = {}) {
  const scan = await postJson('/api/scan', {
    url: SAFE_URL,
    email: `smoke+${label.toLowerCase()}@trustfolder.test`,
  });
  const assessmentId = scan.body?.assessment_id ?? null;
  if (!(scan.status === 200 && assessmentId)) {
    return {
      ok: false,
      stage: 'scan',
      scan: {
        status: scan.status,
        duration_ms: scan.duration_ms,
        scan_ok: scan.body?.scan_ok ?? null,
        assessment_id_present: !!assessmentId,
        network_error: scan.network_error ?? null,
      },
    };
  }

  const confirm = await postJson('/api/confirm', {
    assessment_id: assessmentId,
    answers: answers(answerOverrides),
  });
  if (!(confirm.status === 200 && confirm.body?.in_scope === true)) {
    return {
      ok: false,
      stage: 'confirm',
      assessment_id_present: true,
      confirm: {
        status: confirm.status,
        duration_ms: confirm.duration_ms,
        in_scope: confirm.body?.in_scope ?? null,
        band: confirm.body?.band ?? null,
        next_step: confirm.body?.next_step ?? null,
        recommended_tier: confirm.body?.recommended_tier ?? null,
        network_error: confirm.network_error ?? null,
      },
    };
  }

  const create = await postJson('/api/paypal/create-order', {
    assessment_id: assessmentId,
    tier,
  });

  return {
    ok: create.status === 200 && !!create.body?.order_id && !!create.body?.paypal_order_id && !!create.body?.approve_url,
    stage: 'create-order',
    assessment_id_present: true,
    confirm: {
      status: confirm.status,
      duration_ms: confirm.duration_ms,
      in_scope: confirm.body?.in_scope ?? null,
      band: confirm.body?.band ?? null,
      next_step: confirm.body?.next_step ?? null,
      recommended_tier: confirm.body?.recommended_tier ?? null,
    },
    create_order: {
      status: create.status,
      duration_ms: create.duration_ms,
      order_id: create.body?.order_id ?? null,
      paypal_order_id_present: !!create.body?.paypal_order_id,
      approve_url_present: !!create.body?.approve_url,
      approve_url: create.body?.approve_url ?? null,
      amount_cents: create.body?.amount_cents ?? null,
      tier: create.body?.tier ?? null,
      error: create.body?.error ?? null,
      network_error: create.network_error ?? null,
    },
  };
}

(async () => {
  const b2 = await preparePaidPath('B2', 'tier_2');
  const b3 = await preparePaidPath('B3', 'tier_3', {
    num_eu_customers: '100+',
    primary_jurisdictions: ['Germany', 'France'],
    data_subject_categories: ['business users'],
    ai_training_data_sources: ['customer-provided content', 'vendor model'],
    third_party_models: ['OpenAI', 'Anthropic'],
    human_oversight: 'always',
    has_incident_response: 'partial',
  });

  const out = {
    finished_at: new Date().toISOString(),
    B: {
      ok: true,
      status: 'IMPLEMENTED_SEPARATELY',
      reason: 'Tier 1 Snapshot now routes through the autonomous snapshot pipeline after assessment-gated PayPal checkout.',
    },
    B2: b2,
    B3: b3,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(b2.ok && b3.ok ? 0 : 2);
})();
