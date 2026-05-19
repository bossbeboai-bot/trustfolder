// TrustFolder live delivery gate reporter.
//
// Read-only by default. It checks the public production alias, production
// webhook behavior, Supabase delivery state, recent email status, and whether
// at least one delivered order has a ZIP object in private storage. It never
// prints secrets and does not create customer records.
//
// Usage:
//   node scripts/qa-live-delivery-gates.mjs
//   BASE_URL=https://trustfolder.vercel.app node scripts/qa-live-delivery-gates.mjs
//
// Exit codes:
//   0  all automated live gates green
//   2  one or more live gates blocked

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const envPath = resolve(root, 'engine', '.env');
const baseUrl = (process.env.BASE_URL ?? 'https://trustfolder.vercel.app').replace(/\/+$/, '');

const rows = [];
let blocked = false;

function parseEnv(path) {
  const out = {};
  let text = '';
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

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'unknown';
  return email.replace(/(^.).+(@.*$)/, '$1***$2');
}

function maskId(id) {
  if (!id) return 'none';
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function record(name, status, detail = '') {
  rows.push({ name, status, detail });
  if (status === 'BLOCKED') blocked = true;
  console.log(`${status.padEnd(10)} ${name}${detail ? ' - ' + detail : ''}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body };
}

async function checkLiveHealth() {
  try {
    const { res, body } = await fetchJson(`${baseUrl}/api/health`);
    if (res.status === 200 && body?.ok === true) {
      record('live /api/health', 'GO', 'ok=true');
    } else {
      record('live /api/health', 'BLOCKED', `status=${res.status} body=${JSON.stringify(body)}`);
    }
  } catch (err) {
    record('live /api/health', 'BLOCKED', err?.message ?? 'network_error');
  }
}

async function checkWebhookGuard() {
  try {
    const { res, body } = await fetchJson(`${baseUrl}/api/paypal/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    if (res.status === 401 && text.includes('webhook_verification_failed')) {
      record('unsigned PayPal webhook guard', 'GO', '401 webhook_verification_failed');
    } else {
      record('unsigned PayPal webhook guard', 'BLOCKED', `status=${res.status} body=${text}`);
    }
  } catch (err) {
    record('unsigned PayPal webhook guard', 'BLOCKED', err?.message ?? 'network_error');
  }
}

const env = parseEnv(envPath);
const supabaseUrl = (env.SUPABASE_URL ?? '').replace(/\/+$/, '');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const bucket = env.SUPABASE_STORAGE_BUCKET ?? 'deliveries';

const supabaseHeaders = serviceKey
  ? { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  : {};

async function supabaseGet(path) {
  const { res, body } = await fetchJson(`${supabaseUrl}${path}`, { headers: supabaseHeaders });
  return { ok: res.status >= 200 && res.status < 300, status: res.status, body };
}

async function checkSupabaseEnv() {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    record('local Supabase env for live gate script', 'BLOCKED', `missing ${missing.join(', ')}`);
    return false;
  }
  record('local Supabase env for live gate script', 'GO', 'present, values hidden');
  return true;
}

async function checkCustomerAuthTables() {
  const tables = ['customer_profiles', 'customer_link_tokens', 'customer_auth_events'];
  let okCount = 0;
  for (const table of tables) {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=0`, {
      method: 'HEAD',
      headers: supabaseHeaders,
    });
    if (r.status >= 200 && r.status < 300) okCount++;
  }
  if (okCount === tables.length) {
    record('customer auth schema', 'GO', `${okCount}/${tables.length} current tables reachable`);
  } else {
    record('customer auth schema', 'BLOCKED', `${okCount}/${tables.length} current tables reachable`);
  }
}

async function checkRecentEmailStatus() {
  const q =
    '/rest/v1/email_events?' +
    'select=id,to_email,template_id,status,resend_message_id,error_message,created_at' +
    '&order=created_at.desc&limit=10';
  const r = await supabaseGet(q);
  if (!r.ok || !Array.isArray(r.body)) {
    record('recent production email events', 'BLOCKED', `query status=${r.status}`);
    return;
  }

  if (r.body.length === 0) {
    record('recent production email events', 'BLOCKED', 'no email_events rows found');
    return;
  }

  const latest = r.body[0];
  const sent = r.body.find((e) => e.status === 'sent' && e.resend_message_id);
  const failedInvalidKey = r.body.find((e) =>
    String(e.error_message ?? '').toLowerCase().includes('api key is invalid'),
  );

  if (sent) {
    record(
      'recent production email events',
      'GO',
      `${sent.template_id} sent to ${maskEmail(sent.to_email)} message=${maskId(sent.resend_message_id)}`,
    );
    return;
  }

  if (failedInvalidKey) {
    record(
      'recent production email events',
      'BLOCKED',
      `${failedInvalidKey.template_id} failed for ${maskEmail(failedInvalidKey.to_email)}: API key is invalid`,
    );
    return;
  }

  record(
    'recent production email events',
    'BLOCKED',
    `latest ${latest.template_id} status=${latest.status} recipient=${maskEmail(latest.to_email)}`,
  );
}

async function checkDeliveredZip() {
  const q =
    '/rest/v1/orders?' +
    'select=id,email,tier,status,delivered_at,generated_pack_id,created_at' +
    '&delivered_at=not.is.null&order=delivered_at.desc&limit=5';
  const r = await supabaseGet(q);
  if (!r.ok || !Array.isArray(r.body)) {
    record('delivered order query', 'BLOCKED', `query status=${r.status}`);
    return;
  }
  if (r.body.length === 0) {
    record('delivered order with storage ZIP', 'BLOCKED', 'no delivered orders found');
    return;
  }

  for (const order of r.body) {
    const prefix = `orders/${order.id}`;
    const storageRes = await fetch(`${supabaseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: 'POST',
      headers: { ...supabaseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 50, sortBy: { column: 'created_at', order: 'desc' } }),
    });
    const files = await storageRes.json().catch(() => []);
    const zip = Array.isArray(files) ? files.find((f) => String(f.name ?? '').endsWith('.zip')) : null;
    if (storageRes.status >= 200 && storageRes.status < 300 && zip) {
      record(
        'delivered order with storage ZIP',
        'GO',
        `${maskId(order.id)} ${order.tier} ${order.status} zip=${zip.name}`,
      );
      return;
    }
  }

  record('delivered order with storage ZIP', 'BLOCKED', 'delivered rows found but no ZIP under orders/<id>/');
}

async function checkRecentPaymentState() {
  const q =
    '/rest/v1/orders?' +
    'select=id,tier,status,payment_status,paypal_order_id,paypal_capture_id,paid_at,delivered_at,created_at' +
    '&order=created_at.desc&limit=5';
  const r = await supabaseGet(q);
  if (!r.ok || !Array.isArray(r.body)) {
    record('recent payment/order state', 'BLOCKED', `query status=${r.status}`);
    return;
  }
  if (!r.body.length) {
    record('recent payment/order state', 'BLOCKED', 'no orders found');
    return;
  }
  const latest = r.body[0];
  const deliveredPaid = r.body.find((o) => o.paid_at && o.delivered_at && o.paypal_capture_id);
  if (deliveredPaid) {
    record(
      'recent payment/order state',
      'GO',
      `${maskId(deliveredPaid.id)} ${deliveredPaid.tier} paid and delivered capture=${maskId(deliveredPaid.paypal_capture_id)}`,
    );
    return;
  }
  record(
    'recent payment/order state',
    'BLOCKED',
    `latest ${maskId(latest.id)} ${latest.tier} status=${latest.status} payment=${latest.payment_status}`,
  );
}

console.log(`TrustFolder live delivery gates for ${baseUrl}`);
console.log('Secrets are hidden. This script is read-only.');
console.log('');

await checkLiveHealth();
await checkWebhookGuard();

if (await checkSupabaseEnv()) {
  await checkCustomerAuthTables();
  await checkRecentEmailStatus();
  await checkRecentPaymentState();
  await checkDeliveredZip();
}

console.log('');
const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
for (const [status, count] of Object.entries(counts)) {
  console.log(`${status.padEnd(10)} ${count}`);
}

if (blocked) {
  console.log('LIVE_DELIVERY_GATES_RESULT: BLOCKED');
  process.exit(2);
}

console.log('LIVE_DELIVERY_GATES_RESULT: GO');
