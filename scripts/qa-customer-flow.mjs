/**
 * Batch 1 customer-auth + dashboard QA.
 *
 * Phase 1 — runs WITHOUT migration 0004 applied. Covers everything the new
 *           customer auth feature does at the Next.js layer: page renders,
 *           cookie gate, generic login-link response.
 * Phase 2 — runs WITH migration 0004 applied. End-to-end magic-link flow:
 *           known email -> link sent (DB row in customer_link_tokens) ->
 *           verify -> tf_customer cookie -> dashboard renders -> /api/customer/me
 *           returns the profile.
 *
 * Phase 2 auto-detects whether the customer_link_tokens table exists. If
 * the migration hasn't been applied, Phase 2 is skipped with a clear note.
 *
 * Each phase exits non-zero on any failure.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'http://localhost:3000';

const results = [];
let allOk = true;
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) allOk = false;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

function section(title) {
  console.log('\n----- ' + title + ' -----');
}

// ---------------------------------------------------------------------------
// Phase 1 — always-runnable smoke
// ---------------------------------------------------------------------------
section('Phase 1: customer auth chrome (no DB migration required)');

// 1. /login renders
{
  const res = await fetch(`${BASE}/login`, { redirect: 'manual' });
  const ok = res.status === 200;
  record('P1.1 /login renders 200', ok, `status ${res.status}`);
}

// 2. /dashboard without cookie -> redirect to /login
{
  const res = await fetch(`${BASE}/dashboard`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  const ok = (res.status === 307 || res.status === 302 || res.status === 308) && loc.includes('/login');
  record('P1.2 /dashboard redirects unauth to /login', ok, `status ${res.status} loc ${loc}`);
}

// 3. /dashboard/overview without cookie -> redirect
{
  const res = await fetch(`${BASE}/dashboard/overview`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  const ok = (res.status === 307 || res.status === 302 || res.status === 308) && loc.includes('/login');
  record('P1.3 /dashboard/overview redirects unauth to /login', ok, `status ${res.status}`);
}

// 4. POST /api/customer/login-link with unknown email -> 200 generic
{
  const res = await fetch(`${BASE}/api/customer/login-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `qa-unknown-${Date.now()}@trustfolder.test` }),
  });
  const j = await res.json();
  const ok = res.status === 200 && typeof j.message === 'string' && j.message.includes('sign-in link');
  record('P1.4 login-link unknown email returns 200 generic', ok, `status ${res.status}`);
}

// 5. /api/customer/me without cookie -> 401
{
  const res = await fetch(`${BASE}/api/customer/me`);
  record('P1.5 /api/customer/me 401 without cookie', res.status === 401, `status ${res.status}`);
}

// 6. /api/customer/logout without cookie -> 200 (idempotent)
{
  const res = await fetch(`${BASE}/api/customer/logout`, { method: 'POST' });
  record('P1.6 /api/customer/logout 200 (idempotent)', res.status === 200, `status ${res.status}`);
}

// 7. /api/customer/verify without token -> redirect to /login?status=invalid_link
{
  const res = await fetch(`${BASE}/api/customer/verify`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  const ok = (res.status >= 300 && res.status < 400) && loc.includes('status=invalid_link');
  record('P1.7 /api/customer/verify w/o token redirects with invalid_link', ok, `loc ${loc}`);
}

// ---------------------------------------------------------------------------
// Phase 2 — requires migration 0004 applied + at least one known email row
// ---------------------------------------------------------------------------
section('Phase 2: magic-link end-to-end (requires migration 0004)');

const env = (() => {
  try {
    const raw = readFileSync(resolve(process.cwd(), 'app', '.env.local'), 'utf8');
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
    return out;
  } catch {
    return {};
  }
})();

const sbUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const sbKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!sbUrl || !sbKey) {
  console.log('SKIP Phase 2 — Supabase env not in app/.env.local');
} else {
  // 2a. Detect whether customer_link_tokens exists.
  const probe = await fetch(
    `${sbUrl}/rest/v1/customer_link_tokens?select=id&limit=1`,
    { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } },
  );
  if (probe.status !== 200) {
    console.log(
      `SKIP Phase 2 — customer_link_tokens probe returned ${probe.status}.\n` +
      '  Apply engine/supabase/migrations/0004_customer_auth.sql in your Supabase SQL editor first.',
    );
  } else {
    // 2b. Pick a known email (any from `requests`).
    const knownRes = await fetch(
      `${sbUrl}/rest/v1/requests?select=email&limit=1`,
      { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } },
    );
    const known = await knownRes.json();
    const knownEmail = Array.isArray(known) && known[0]?.email ? known[0].email : null;
    if (!knownEmail) {
      console.log('SKIP Phase 2 — no known email in `requests`. Submit a test request first.');
    } else {
      record('P2.1 found known email to test', true, `email ${knownEmail}`);

      // 2c. Issue a magic link.
      const linkRes = await fetch(`${BASE}/api/customer/login-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: knownEmail }),
      });
      record('P2.2 login-link known email returns 200', linkRes.status === 200, `status ${linkRes.status}`);

      // 2d. Confirm a customer_profile row got created.
      const profRes = await fetch(
        `${sbUrl}/rest/v1/customer_profiles?select=id,email&email=ilike.${encodeURIComponent(knownEmail)}`,
        { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } },
      );
      const profs = await profRes.json();
      const profile = Array.isArray(profs) ? profs[0] : null;
      record('P2.3 customer_profiles row created', !!profile, profile ? `id ${profile.id}` : 'no row');

      // 2e. Confirm a customer_link_tokens row got created. We can't read the
      // raw token (only the hash is stored), so we cannot complete /verify
      // without the email being received. Instead, mint a short-lived token
      // ourselves via the engine's pattern by directly inserting a known
      // hash, then exercising /verify with that raw token. This is the only
      // QA-time shortcut.
      if (profile) {
        const { createHash, randomBytes } = await import('node:crypto');
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const insRes = await fetch(`${sbUrl}/rest/v1/customer_link_tokens`, {
          method: 'POST',
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            customer_id: profile.id,
            token_hash: tokenHash,
            expires_at: expiresAt,
          }),
        });
        record('P2.4 inserted QA-only test token', insRes.status === 201, `status ${insRes.status}`);

        // 2f. Hit /api/customer/verify with the raw token.
        const verifyRes = await fetch(`${BASE}/api/customer/verify?t=${rawToken}`, {
          redirect: 'manual',
        });
        const loc = verifyRes.headers.get('location') || '';
        const setCookie = verifyRes.headers.get('set-cookie') || '';
        const cookieMatch = setCookie.match(/tf_customer=([^;]+)/);
        const ok = loc.includes('/dashboard') && !!cookieMatch;
        record('P2.5 /verify sets tf_customer cookie + redirects to /dashboard', ok, `loc ${loc}`);

        if (cookieMatch) {
          const cookie = `tf_customer=${cookieMatch[1]}`;

          // 2g. /api/customer/me with cookie returns the profile.
          const meRes = await fetch(`${BASE}/api/customer/me`, { headers: { cookie } });
          const meJson = await meRes.json();
          record(
            'P2.6 /api/customer/me returns profile',
            meRes.status === 200 && meJson.profile?.email === profile.email,
            `email ${meJson.profile?.email}`,
          );

          // 2h. /dashboard/overview with cookie returns 200 (HTML).
          const dashRes = await fetch(`${BASE}/dashboard/overview`, { headers: { cookie } });
          record('P2.7 /dashboard/overview 200 with cookie', dashRes.status === 200, `status ${dashRes.status}`);

          // 2i. /api/customer/logout clears the cookie.
          const logoutRes = await fetch(`${BASE}/api/customer/logout`, {
            method: 'POST',
            headers: { cookie },
          });
          const lc = logoutRes.headers.get('set-cookie') || '';
          record(
            'P2.8 /api/customer/logout clears tf_customer',
            logoutRes.status === 200 && lc.includes('tf_customer=;'),
            'cookie cleared',
          );
        }

        // 2j. Verifying the same token a second time should now fail (single-use).
        const replay = await fetch(`${BASE}/api/customer/verify?t=${rawToken}`, {
          redirect: 'manual',
        });
        const replayLoc = replay.headers.get('location') || '';
        record(
          'P2.9 token is single-use (replay redirects to invalid_link)',
          replayLoc.includes('status=invalid_link'),
          replayLoc,
        );
      }
    }
  }
}

console.log('\n----- summary -----');
console.log(`pass: ${results.filter((r) => r.ok).length}/${results.length}`);
if (!allOk) {
  console.log('FAILED:', results.filter((r) => !r.ok).map((r) => r.name).join(', '));
  process.exit(1);
}
console.log('Customer flow: all enabled checks passed.');
