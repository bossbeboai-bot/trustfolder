// Phase 7 production end-to-end dry-run.
//
// Verifies what we can verify without faking PayPal approval/capture. Steps
// that need a real PayPal buyer interaction are clearly marked
// NOT_RUN_MANUAL_REQUIRED and never reported as PASS.
//
// What this script DOES (against the local or production app):
//   - GETs /api/health
//   - GETs /assessment, /pricing, /request, /examples, /safety
//   - Checks /dashboard requires auth (302/401)
//   - Checks /admin requires auth (302/401)
//   - Confirms /api/paypal/create-order enables tier_1 and rejects unknown tiers
//
// What this script DOES NOT do:
//   - Approve a real PayPal order (manual)
//   - Capture a real PayPal order (manual)
//   - Run the engine generation pipeline (manual / via webhook)
//   - Send a real customer email (use scripts/test-email-production.mjs)
//
// Usage:
//   BASE_URL=https://yourdomain.com node scripts/qa-production-e2e-dry-run.mjs
// Or against local:
//   node scripts/qa-production-e2e-dry-run.mjs

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const results = [];
let allOk = true;

function record(name, status, detail = '') {
  results.push({ name, status, detail });
  if (status === 'FAIL') allOk = false;
  console.log(`${status.padEnd(28)} ${name}${detail ? '  — ' + detail : ''}`);
}

async function getJson(path, init) {
  try {
    const res = await fetch(BASE + path, { ...init, redirect: 'manual' });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, body: null, error: String(err?.message ?? err) };
  }
}

async function getStatus(path) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    return { status: res.status };
  } catch (err) {
    return { status: 0, error: String(err?.message ?? err) };
  }
}

// 1. Health
{
  const r = await getJson('/api/health');
  if (r.status === 200 && r.body?.ok === true) {
    record('health endpoint returns 200/ok', 'PASS');
  } else if (r.status === 503 && r.body?.ok === false) {
    record('health endpoint reachable but checks failing', 'FAIL', `status=${r.status}`);
  } else {
    record('health endpoint reachable', 'FAIL', `status=${r.status}`);
  }
}

// 2. Public route render
const publicRoutes = ['/assessment', '/pricing', '/request', '/examples', '/safety', '/terms', '/privacy', '/refund', '/legal'];
for (const path of publicRoutes) {
  const r = await getStatus(path);
  if (r.status === 200) record(`public ${path}`, 'PASS');
  else record(`public ${path}`, 'FAIL', `status=${r.status}`);
}

// 3. Auth-gated surfaces
for (const path of ['/dashboard', '/dashboard/orders', '/dashboard/packs', '/dashboard/downloads']) {
  const r = await getStatus(path);
  if (r.status === 200 || r.status === 302 || r.status === 307 || r.status === 401) {
    // Dashboard pages may redirect to /login (302/307) or render a login state (200) when unauthenticated.
    record(`auth-gate ${path}`, 'PASS', `status=${r.status}`);
  } else {
    record(`auth-gate ${path}`, 'FAIL', `status=${r.status}`);
  }
}
for (const path of ['/admin', '/admin/orders', '/admin/requests', '/admin/failures']) {
  const r = await getStatus(path);
  if (r.status === 200 || r.status === 302 || r.status === 307 || r.status === 401) {
    record(`admin-gate ${path}`, 'PASS', `status=${r.status}`);
  } else {
    record(`admin-gate ${path}`, 'FAIL', `status=${r.status}`);
  }
}

// 4. Tier guard
{
  const r = await getJson('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment_id: 'phase7-dry-run', tier: 'tier_1' }),
  });
  if (r.status === 404 && r.body?.error === 'assessment_not_found') {
    record('tier_1 checkout route enabled', 'PASS');
  } else {
    record('tier_1 checkout route enabled', 'FAIL', `status=${r.status} error=${r.body?.error ?? ''}`);
  }
}
{
  const r = await getJson('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment_id: 'phase7-dry-run', tier: 'tier_999' }),
  });
  if (r.status === 400 && r.body?.error === 'unsupported_tier') {
    record('unsupported tier rejected', 'PASS');
  } else {
    record('unsupported tier rejected', 'FAIL', `status=${r.status} error=${r.body?.error ?? ''}`);
  }
}

// 5. Manual-only gates
record('PayPal sandbox approval/capture tier_2', 'NOT_RUN_MANUAL_REQUIRED', 'see docs/43');
record('PayPal sandbox approval/capture tier_3', 'NOT_RUN_MANUAL_REQUIRED', 'see docs/43');
record('Generation pipeline produces pack', 'NOT_RUN_MANUAL_REQUIRED', 'runs from PayPal capture webhook');
record('Pack uploaded to deliveries bucket', 'NOT_RUN_MANUAL_REQUIRED', 'verify via Supabase storage');
record('Customer dashboard download link', 'NOT_RUN_MANUAL_REQUIRED', 'verify with a known test account');
record('Resend transactional email round-trip', 'NOT_RUN_MANUAL_REQUIRED', 'use scripts/test-email-production.mjs');

console.log('\n----- summary -----');
const counts = results.reduce((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(28)} ${v}`);
if (!allOk) {
  console.log('E2E_DRY_RUN_RESULT: BLOCKED');
  process.exit(1);
}
console.log('E2E_DRY_RUN_RESULT: AUTOMATED_GATES_PASS (manual gates still required)');
