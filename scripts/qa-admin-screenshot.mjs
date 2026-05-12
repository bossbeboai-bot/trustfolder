/** Capture /admin/login and /admin/requests at 1440 desktop for visual QA. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'http://localhost:3000';
const OUT = resolve(process.cwd(), '.playwright-mcp');

const env = readFileSync(resolve(process.cwd(), 'app', '.env.local'), 'utf8');
const password = env.match(/^ADMIN_PASSWORD\s*=\s*(.*)$/m)[1].trim().replace(/^['"]|['"]$/g, '');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Login screen
let page = await context.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: resolve(OUT, 'v1-desktop1440-admin-login.png'), fullPage: false });
await page.close();

// Login via API, set cookie, then visit /admin/requests
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
});
const setCookie = loginRes.headers.get('set-cookie') || '';
const cookieMatch = setCookie.match(/tf_admin=([^;]+)/);
if (!cookieMatch) throw new Error('login failed: no cookie');
await context.addCookies([
  {
    name: 'tf_admin',
    value: cookieMatch[1],
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  },
]);

page = await context.newPage();
await page.goto(`${BASE}/admin/requests`, { waitUntil: 'networkidle' });
await page.screenshot({ path: resolve(OUT, 'v1-desktop1440-admin-requests.png'), fullPage: false });
await page.close();

await page.context()?.close().catch(() => {});
await browser.close();
console.log('Admin screenshots saved.');
