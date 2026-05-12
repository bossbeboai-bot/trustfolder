// Safe Supabase connectivity probe.
// - Reads engine/.env directly. No reliance on shell-exported env.
// - Never prints secret values. Never prints the full project URL.
// - Reports only: reachability, table existence, bucket existence.
// Usage: node scripts/probe-supabase.mjs

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '..', 'engine', '.env');

function parseEnv(path) {
  const out = {};
  const text = readFileSync(path, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
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
  console.log('PROBE_RESULT: env_incomplete (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing/empty)');
  process.exit(2);
}

console.log('Supabase host (masked): ' + maskHost(url));
console.log('Bucket name to verify   : ' + bucket);

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

async function probe(label, target, opts = {}) {
  try {
    const res = await fetch(target, { method: opts.method ?? 'GET', headers });
    const ok = res.status >= 200 && res.status < 300;
    console.log(`  ${label.padEnd(28)} status=${res.status} ${ok ? 'OK' : 'FAIL'}`);
    return { ok, status: res.status };
  } catch (err) {
    console.log(`  ${label.padEnd(28)} status=NETWORK_ERROR FAIL (${err?.code ?? err?.message ?? 'unknown'})`);
    return { ok: false, status: 0 };
  }
}

const trimmed = url.replace(/\/+$/, '');
const tables = ['leads', 'website_scans', 'assessments', 'orders', 'order_status_events', 'generated_packs', 'qa_results', 'email_events'];

console.log('--- REST table presence (HEAD /rest/v1/<table>?select=id&limit=0) ---');
let tableFails = 0;
for (const t of tables) {
  const r = await probe(`table:${t}`, `${trimmed}/rest/v1/${t}?select=id&limit=0`, { method: 'HEAD' });
  if (!r.ok) tableFails++;
}

// ---------------------------------------------------------------------------
// Phase 3.6: requests table + internal_note + updated_at columns.
// Added in migrations 0002_add_requests.sql + 0003_requests_admin_extensions.sql.
// Column presence is checked by asking PostgREST to project just that column
// with limit=0 via HEAD — PostgREST validates the select list before responding.
// ---------------------------------------------------------------------------
console.log('--- Phase 3.6: requests table + new columns ---');
const requestsTable = await probe('table:requests', `${trimmed}/rest/v1/requests?select=id&limit=0`, { method: 'HEAD' });
const requestsInternalNote = await probe('column:requests.internal_note', `${trimmed}/rest/v1/requests?select=internal_note&limit=0`, { method: 'HEAD' });
const requestsUpdatedAt = await probe('column:requests.updated_at', `${trimmed}/rest/v1/requests?select=updated_at&limit=0`, { method: 'HEAD' });

console.log('--- Storage bucket presence (GET /storage/v1/bucket/<name>) ---');
const bucketRes = await probe(`bucket:${bucket}`, `${trimmed}/storage/v1/bucket/${encodeURIComponent(bucket)}`);

const requestsOk = requestsTable.ok && requestsInternalNote.ok && requestsUpdatedAt.ok;

console.log('--- summary ---');
console.log('  core tables ok   : ' + (tables.length - tableFails) + ' / ' + tables.length);
console.log('  requests table   : ' + (requestsTable.ok ? 'yes' : 'no'));
console.log('  internal_note    : ' + (requestsInternalNote.ok ? 'yes' : 'no'));
console.log('  updated_at       : ' + (requestsUpdatedAt.ok ? 'yes' : 'no'));
console.log('  bucket ok        : ' + (bucketRes.ok ? 'yes' : 'no'));

if (tableFails === 0 && requestsOk && bucketRes.ok) {
  console.log('PROBE_RESULT: GO');
  process.exit(0);
} else {
  console.log('PROBE_RESULT: BLOCKED');
  process.exit(2);
}
