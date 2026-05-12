/**
 * Launch-ready v1 admin flow test (Flow C).
 *
 *   1. POST /api/admin/login with the configured password → get `tf_admin` cookie.
 *   2. GET  /api/admin/requests → confirm there is at least one row.
 *   3. PATCH /api/admin/requests/[id] → flip status from 'new' to 'contacted'.
 *   4. GET  again to confirm the update persisted.
 *
 * Exits non-zero on any failure.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'http://localhost:3000';

function loadAdminPassword() {
  const envPath = resolve(process.cwd(), 'app', '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^ADMIN_PASSWORD\s*=\s*(.*)$/);
    if (m) return m[1].replace(/^['"]|['"]$/g, '');
  }
  throw new Error('ADMIN_PASSWORD not found in app/.env.local');
}

const password = loadAdminPassword();
console.log(`Loaded admin password (length ${password.length}).`);

const results = [];
let allOk = true;
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) allOk = false;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

// 1. Login
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
});
record('C1 admin login 200', loginRes.ok, `status ${loginRes.status}`);
const setCookie = loginRes.headers.get('set-cookie') || '';
const cookieMatch = setCookie.match(/tf_admin=[^;]+/);
const adminCookie = cookieMatch ? cookieMatch[0] : null;
record('C2 admin session cookie set', !!adminCookie, adminCookie ? adminCookie.slice(0, 30) + '...' : 'no cookie');

if (!adminCookie) {
  console.log('Cannot continue without admin cookie.');
  process.exit(1);
}

// 2. List requests
const listRes = await fetch(`${BASE}/api/admin/requests`, {
  headers: { cookie: adminCookie },
});
record('C3 GET /api/admin/requests 200', listRes.ok, `status ${listRes.status}`);

const listJson = await listRes.json();
const rows = Array.isArray(listJson.rows) ? listJson.rows : [];
record('C4 at least 1 request row exists', rows.length > 0, `${rows.length} rows`);

if (rows.length === 0) {
  console.log('No rows — cannot test status update. Did Flow B run first?');
  process.exit(1);
}

// Pick the newest row (top of list — listRequests should sort by created_at desc)
const target = rows[0];
console.log(`Target row: id=${target.id} email=${target.email} status=${target.status}`);

// 3. PATCH status → 'contacted'
const patchRes = await fetch(`${BASE}/api/admin/requests/${target.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', cookie: adminCookie },
  body: JSON.stringify({ status: 'contacted' }),
});
record('C5 PATCH status=contacted 200', patchRes.ok, `status ${patchRes.status}`);
const patchJson = await patchRes.json();
const updatedStatus = patchJson.row?.status;
record('C6 PATCH response shows new status', updatedStatus === 'contacted', `got ${updatedStatus}`);

// 4. Re-fetch and verify
const verifyRes = await fetch(`${BASE}/api/admin/requests?limit=20`, {
  headers: { cookie: adminCookie },
});
const verifyJson = await verifyRes.json();
const updated = verifyJson.rows.find((r) => r.id === target.id);
record('C7 row visible in list after update', !!updated, updated ? `status=${updated.status}` : 'not found');
record('C8 status persisted as contacted', updated?.status === 'contacted', `status=${updated?.status}`);

// Reset back to 'new' so the QA row doesn't pollute the founder's real inbox state
await fetch(`${BASE}/api/admin/requests/${target.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', cookie: adminCookie },
  body: JSON.stringify({ status: 'new' }),
});

console.log('\n----- summary -----');
console.log(`pass: ${results.filter((r) => r.ok).length}/${results.length}`);
if (!allOk) {
  console.log('FAILED:', results.filter((r) => !r.ok).map((r) => r.name).join(', '));
  process.exit(1);
}
console.log('Admin flow C: all checks passed.');
