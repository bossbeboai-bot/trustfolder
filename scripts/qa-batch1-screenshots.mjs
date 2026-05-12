/**
 * Batch 1 screenshot QA.
 *
 * Phase 1 (always runs): /login renders + /dashboard redirects to /login.
 * Phase 2 (requires migration 0004 + at least one known email): forge a
 *   tf_customer cookie via the same HMAC the app uses, then capture each
 *   dashboard tab.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHmac, randomBytes, createHash } from 'node:crypto';

const BASE = 'http://localhost:3000';
const OUT = resolve(process.cwd(), '.playwright-mcp');
mkdirSync(OUT, { recursive: true });

function loadEnv() {
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
}

const env = loadEnv();
const sbUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const sbKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
const sessionSecret = env.CUSTOMER_SESSION_SECRET || '';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// =============================================================================
// Phase 1
// =============================================================================
console.log('----- Phase 1 -----');

let page = await context.newPage();
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: resolve(OUT, 'b1-desktop1440-login.png') });
console.log('captured b1-desktop1440-login.png');
await page.close();

// /dashboard without cookie -> Next will redirect to /login. Capture the destination.
page = await context.newPage();
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.screenshot({ path: resolve(OUT, 'b1-desktop1440-dashboard-redirected.png') });
console.log('captured b1-desktop1440-dashboard-redirected.png');
await page.close();

// =============================================================================
// Phase 2 — only if env + DB are ready
// =============================================================================
console.log('----- Phase 2 -----');

if (!sbUrl || !sbKey || !sessionSecret) {
  console.log('SKIP Phase 2 — env incomplete');
} else {
  const probe = await fetch(
    `${sbUrl}/rest/v1/customer_profiles?select=id&limit=1`,
    { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } },
  );
  if (probe.status !== 200) {
    console.log(`SKIP Phase 2 — customer_profiles probe ${probe.status} (apply migration 0004 first)`);
  } else {
    // Get-or-create a profile from any known email.
    const known = await fetch(
      `${sbUrl}/rest/v1/requests?select=email&limit=1`,
      { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } },
    );
    const knownJson = await known.json();
    const knownEmail = Array.isArray(knownJson) ? knownJson[0]?.email : null;
    if (!knownEmail) {
      console.log('SKIP Phase 2 — no known email in requests table');
    } else {
      // Upsert profile.
      const upsert = await fetch(`${sbUrl}/rest/v1/customer_profiles`, {
        method: 'POST',
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({ email: knownEmail.toLowerCase() }),
      });
      const upJson = await upsert.json();
      const profile = Array.isArray(upJson) ? upJson[0] : upJson;
      if (!profile?.id) {
        console.log(`SKIP Phase 2 — profile upsert failed: ${JSON.stringify(upJson)}`);
      } else {
        // Forge an HMAC cookie matching app/lib/customer-auth.ts:signSession.
        const exp = Math.floor(Date.now() / 1000) + 600; // 10 minutes
        const payload = `${exp}.${profile.id}`;
        const sig = createHmac('sha256', sessionSecret).update(payload).digest('hex');
        const cookieValue = `${payload}.${sig}`;
        await context.addCookies([
          {
            name: 'tf_customer',
            value: cookieValue,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
          },
        ]);

        const tabs = [
          ['overview', '/dashboard/overview'],
          ['requests', '/dashboard/requests'],
          ['orders', '/dashboard/orders'],
          ['packs', '/dashboard/packs'],
          ['downloads', '/dashboard/downloads'],
          ['settings', '/dashboard/settings'],
        ];
        for (const [name, path] of tabs) {
          const p = await context.newPage();
          await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
          await p.screenshot({ path: resolve(OUT, `b1-desktop1440-dashboard-${name}.png`) });
          console.log(`captured b1-desktop1440-dashboard-${name}.png`);
          await p.close();
        }
      }
    }
  }
}

await browser.close();
console.log('done');
