// Phase 7 production readiness aggregator.
//
// Runs only non-manual checks. Manual checks are listed at the end and never
// reported as PASS automatically.
//
// Usage:
//   BASE_URL=https://yourdomain.com node scripts/qa-production-readiness.mjs
// Or against local:
//   node scripts/qa-production-readiness.mjs
//
// What it does:
//   1. Public route smoke: /, /pricing, /examples, /safety, /agencies,
//      /assessment, /request, /blog, /contact, /terms, /privacy, /refund,
//      /legal, /sitemap.xml, /robots.txt
//   2. Auth-gate smoke: /dashboard*, /admin*
//   3. /api/health
//   4. Tier guards: tier_1 disabled, unsupported tier rejected
//   5. Env presence (without printing values) for engine/.env
//   6. Forbidden phrase scan across public/docs/templates/engine sources
//
// Manual checks listed but NOT executed:
//   - PayPal real buyer approval / capture
//   - Live webhook signing / delivery
//   - Real customer email deliverability

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const results = [];
let blocked = false;

function record(name, status, detail = '') {
  results.push({ name, status, detail });
  if (status === 'FAIL') blocked = true;
  console.log(`${status.padEnd(28)} ${name}${detail ? '  — ' + detail : ''}`);
}

async function getStatus(path) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    return res.status;
  } catch {
    return 0;
  }
}

async function postJson(path, body) {
  try {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'manual',
    });
    let parsed = null;
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
    return { status: res.status, body: parsed };
  } catch (err) {
    return { status: 0, body: null, error: String(err?.message ?? err) };
  }
}

console.log('--- Public routes ---');
const publicRoutes = [
  '/',
  '/pricing',
  '/examples',
  '/safety',
  '/agencies',
  '/assessment',
  '/request',
  '/blog',
  '/contact',
  '/terms',
  '/privacy',
  '/refund',
  '/legal',
  '/sitemap.xml',
  '/robots.txt',
];
for (const p of publicRoutes) {
  const s = await getStatus(p);
  if (s === 200) record(`public ${p}`, 'PASS');
  else record(`public ${p}`, 'FAIL', `status=${s}`);
}

console.log('--- Auth-gated surfaces ---');
for (const p of [
  '/dashboard',
  '/dashboard/orders',
  '/dashboard/packs',
  '/dashboard/downloads',
  '/admin',
  '/admin/orders',
  '/admin/requests',
  '/admin/failures',
]) {
  const s = await getStatus(p);
  if (s === 200 || s === 302 || s === 307 || s === 401) record(`auth ${p}`, 'PASS', `status=${s}`);
  else record(`auth ${p}`, 'FAIL', `status=${s}`);
}

console.log('--- /api/health ---');
{
  const s = await getStatus('/api/health');
  // 503 means reachable but a sub-check failed; that's a FAIL for production launch.
  if (s === 200) record('api health', 'PASS');
  else record('api health', 'FAIL', `status=${s}`);
}

console.log('--- Tier guards ---');
{
  const r = await postJson('/api/paypal/create-order', { assessment_id: 'p7-readiness', tier: 'tier_1' });
  if (r.status === 400 && r.body?.error === 'tier_1_checkout_disabled') record('tier_1 disabled', 'PASS');
  else record('tier_1 disabled', 'FAIL', `status=${r.status} error=${r.body?.error ?? ''}`);
}
{
  const r = await postJson('/api/paypal/create-order', { assessment_id: 'p7-readiness', tier: 'tier_42' });
  if (r.status === 400 && r.body?.error === 'unsupported_tier') record('unsupported tier rejected', 'PASS');
  else record('unsupported tier rejected', 'FAIL', `status=${r.status} error=${r.body?.error ?? ''}`);
}

console.log('--- Engine env presence (engine/.env) ---');
const engineEnvPath = resolve(root, 'engine', '.env');
let engineEnv = {};
try {
  const text = readFileSync(engineEnvPath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) engineEnv[m[1]] = m[2];
  }
} catch {
  record('engine/.env readable', 'FAIL', 'file missing — copy from engine/.env.example');
}
const requiredEngineKeys = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'AI_PROVIDER',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_WEBHOOK_ID',
  'PAYPAL_ENV',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'APP_BASE_URL',
];
for (const key of requiredEngineKeys) {
  const present = engineEnv[key] !== undefined && engineEnv[key].trim() !== '';
  record(`env ${key}`, present ? 'PASS' : 'FAIL', present ? 'present' : 'missing or empty');
}

console.log('--- Forbidden phrase scan ---');
const forbidden = [
  'fully compliant',
  'guaranteed compliance',
  'guarantees compliance',
  'audit-proof',
  'audit proof',
  'no lawyer needed',
  'legal guarantee',
  '100% autonomous compliance',
  'skip legal review',
  'complete compliance solution',
  'become eu ai act compliant',
  'becomes eu ai act compliant',
  'buy now',
];
// Scan only customer-facing surfaces. Internal spec docs and engine/src/qa.ts
// intentionally enumerate forbidden phrases and must not be flagged here.
// The engine QA pipeline (engine/src/qa.ts) is the canonical scan for
// generated content; this is the public-surface scan.
const scanFiles = [];
function walk(dir, fn) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e === 'dist' || e === '.git') continue;
    const full = join(dir, e);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, fn);
    else fn(full);
  }
}
walk(resolve(root, 'app', 'app'), (f) => {
  if (f.endsWith('.tsx') || f.endsWith('.mdx')) scanFiles.push(f);
});
walk(resolve(root, 'app', 'lib'), (f) => {
  if (f.endsWith('blog-posts.ts')) scanFiles.push(f);
});
// Phase 6 module starter content (skip qa-rules.md which enumerates forbidden phrases).
walk(resolve(root, 'templates', 'modules'), (f) => {
  if (/[\\/](README|outputs|disclaimers|starter-template)\.md$/i.test(f)) scanFiles.push(f);
});

let scanHits = 0;
for (const file of scanFiles) {
  let text;
  try {
    text = readFileSync(file, 'utf8').toLowerCase();
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  for (const phrase of forbidden) {
    for (const line of lines) {
      if (!line.includes(phrase)) continue;
      // Skip lines that frame the phrase as forbidden / negated.
      if (/forbidden|never|do not|don't|must not|avoid/.test(line)) continue;
      if (/\bnot\b[^.]{0,40}\b(legal|certification|guarantee|advice)\b/.test(line)) continue;
      scanHits++;
      record(`forbidden in ${file.replace(root + '\\', '').replace(root + '/', '')}`, 'FAIL', `phrase="${phrase}"`);
    }
  }
}
if (scanHits === 0) record('forbidden phrase scan (public surface + module starters)', 'PASS');

console.log('\n--- Manual checks (listed but NOT executed) ---');
const manualChecks = [
  'PayPal real buyer approval/capture (sandbox or live)',
  'Live PayPal webhook delivery + signature verification',
  'Real Resend email arrives at a real inbox (deliverability)',
  'Customer magic link round-trip on production',
  'Admin login on production',
  'Health route configured on UptimeRobot / Better Stack',
];
for (const m of manualChecks) record(m, 'NOT_RUN_MANUAL_REQUIRED');

console.log('\n----- summary -----');
const counts = results.reduce((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(28)} ${v}`);

if (blocked) {
  console.log('PRODUCTION_READINESS_RESULT: BLOCKED');
  process.exit(1);
}
console.log('PRODUCTION_READINESS_RESULT: AUTOMATED_GATES_PASS (manual gates still required)');
