// Phase 7 production Supabase probe.
// Reads engine/.env. Never prints secret values. Verifies migrations
// 0001-0004 worth of tables and the deliveries bucket. Requires:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SUPABASE_STORAGE_BUCKET (default 'deliveries')
//
// Usage:
//   node scripts/probe-production-supabase.mjs
//
// Exit codes:
//   0  GO
//   2  BLOCKED (missing env, missing tables, missing bucket, or bucket public)

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '..', 'engine', '.env');

function parseEnv(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return out;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

function maskHost(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (h.length <= 8) return '****';
    return h.slice(0, 4) + '****' + h.slice(-12);
  } catch {
    return '****';
  }
}

const env = parseEnv(envPath);
const url = env.SUPABASE_URL ?? '';
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const bucket = env.SUPABASE_STORAGE_BUCKET ?? 'deliveries';

if (!url || !serviceKey) {
  console.log('PROBE_RESULT: env_incomplete (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
  process.exit(2);
}

console.log('Supabase host (masked): ' + maskHost(url));
console.log('Bucket name to verify : ' + bucket);

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
const trimmed = url.replace(/\/+$/, '');

async function probe(label, target, opts = {}) {
  try {
    const res = await fetch(target, { method: opts.method ?? 'GET', headers });
    const ok = (opts.acceptable ?? ((s) => s >= 200 && s < 300))(res.status);
    console.log(`  ${label.padEnd(36)} status=${res.status} ${ok ? 'OK' : 'FAIL'}`);
    return { ok, status: res.status, body: opts.parseBody ? await res.json().catch(() => null) : null };
  } catch (err) {
    console.log(`  ${label.padEnd(36)} status=NETWORK_ERROR FAIL (${err?.code ?? err?.message ?? 'unknown'})`);
    return { ok: false, status: 0, body: null };
  }
}

const coreTables = [
  'leads',
  'website_scans',
  'assessments',
  'orders',
  'order_status_events',
  'generated_packs',
  'qa_results',
  'email_events',
];

console.log('--- Migrations 0001/0002/0003 core tables ---');
let coreFails = 0;
for (const t of coreTables) {
  const r = await probe(`table:${t}`, `${trimmed}/rest/v1/${t}?select=id&limit=0`, { method: 'HEAD' });
  if (!r.ok) coreFails++;
}

console.log('--- Migration 0002/0003 requests table + columns ---');
const requestsTable = await probe('table:requests', `${trimmed}/rest/v1/requests?select=id&limit=0`, { method: 'HEAD' });
const requestsInternalNote = await probe('column:requests.internal_note', `${trimmed}/rest/v1/requests?select=internal_note&limit=0`, { method: 'HEAD' });
const requestsUpdatedAt = await probe('column:requests.updated_at', `${trimmed}/rest/v1/requests?select=updated_at&limit=0`, { method: 'HEAD' });

console.log('--- Migration 0004 customer auth tables ---');
const customerTables = ['customer_profiles', 'customer_link_tokens', 'customer_auth_events'];
let customerFails = 0;
for (const t of customerTables) {
  const r = await probe(`table:${t}`, `${trimmed}/rest/v1/${t}?select=id&limit=0`, { method: 'HEAD' });
  if (!r.ok) customerFails++;
}

console.log('--- Storage bucket ---');
const bucketRes = await probe(`bucket:${bucket}`, `${trimmed}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
  parseBody: true,
});
const bucketIsPrivate = !!(bucketRes.ok && bucketRes.body && bucketRes.body.public === false);
console.log('  bucket private                       ' + (bucketIsPrivate ? 'OK' : 'FAIL'));

console.log('--- summary ---');
console.log('  core tables ok       : ' + (coreTables.length - coreFails) + ' / ' + coreTables.length);
console.log('  requests table ok    : ' + (requestsTable.ok && requestsInternalNote.ok && requestsUpdatedAt.ok ? 'yes' : 'no'));
console.log('  customer auth tables : ' + (customerTables.length - customerFails) + ' / ' + customerTables.length);
console.log('  bucket exists        : ' + (bucketRes.ok ? 'yes' : 'no'));
console.log('  bucket is private    : ' + (bucketIsPrivate ? 'yes' : 'no'));

const allOk =
  coreFails === 0 &&
  requestsTable.ok &&
  requestsInternalNote.ok &&
  requestsUpdatedAt.ok &&
  customerFails === 0 &&
  bucketRes.ok &&
  bucketIsPrivate;

if (allOk) {
  console.log('PROBE_RESULT: GO');
  process.exit(0);
} else {
  console.log('PROBE_RESULT: BLOCKED');
  process.exit(2);
}
