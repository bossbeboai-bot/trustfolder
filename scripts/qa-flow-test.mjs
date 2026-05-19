/**
 * Launch-ready v1 flow tests.
 *
 * Runs against the live TrustFolder alias by default. Tests the
 * three public flows from the sprint plan (P2) plus a CTA reachability
 * sweep (Flow D). Admin flow (C) is covered by a separate script because
 * it requires the admin password from env.
 *
 * Set BASE_URL=http://localhost:3000 for local. Request-form submission is
 * read-only by default on production; set RUN_REQUEST_WRITE_QA=1 only when
 * you intentionally want to create a QA request record.
 *
 * Output: human-readable pass/fail per step. Exits non-zero on any failure.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = (process.env.BASE_URL ?? 'https://trustfolder.vercel.app').replace(/\/+$/, '');
const WRITE_REQUEST_QA = process.env.RUN_REQUEST_WRITE_QA === '1';
const OUT = resolve(process.cwd(), '.playwright-mcp');

const results = [];
let allOk = true;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) allOk = false;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// ---------------------------------------------------------------------------
// Flow A: home → run free check → assessment first step renders
// ---------------------------------------------------------------------------
try {
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const heroH1 = await page.locator('h1').first().textContent();
  record('A1 home renders', !!heroH1 && heroH1.length > 10, heroH1?.slice(0, 60));

  // Click the visible "Run free check" header CTA
  const headerCta = page
    .locator('a:has-text("Run free readiness check"), a:has-text("Run free check")')
    .first();
  await headerCta.waitFor({ state: 'visible', timeout: 8000 });
  await Promise.all([
    page.waitForURL('**/assessment', { timeout: 10000 }),
    headerCta.click(),
  ]);
  record('A2 navigated to /assessment', page.url().endsWith('/assessment'));

  // Assessment step 1 should be "Website" — confirm input rendered
  const websiteInput = page.locator('input[placeholder*="example.com" i], input[placeholder*="acme" i], input[type="url"]').first();
  await websiteInput.scrollIntoViewIfNeeded().catch(() => {});
  const hasInput = await websiteInput.count() > 0;
  record('A3 assessment step 1 input visible', hasInput);

  await page.screenshot({ path: resolve(OUT, 'flow-a-assessment.png'), fullPage: false });
  await page.close();
} catch (err) {
  record('FLOW A', false, err.message);
}

// ---------------------------------------------------------------------------
// Flow B: /request?type=governance → submit → success state
// ---------------------------------------------------------------------------
try {
  const page = await context.newPage();
  await page.goto(BASE + '/request?type=governance', { waitUntil: 'networkidle' });
  const h1 = await page.locator('h1').first().textContent();
  record('B1 /request?type=governance renders', !!h1 && /request|governance|pack/i.test(h1 ?? ''), h1?.slice(0, 60));

  // Capture form structure to debug if needed
  await page.screenshot({ path: resolve(OUT, 'flow-b-form.png'), fullPage: false });

  // Locate the visible form fields. The form is in RequestLeadPage.
  const stamp = Date.now();
  const testEmail = `qa-flow-${stamp}@trustfolder.test`;

  // Fill required fields. Use label-text or placeholder selectors so we tolerate small DOM changes.
  const emailField = page.locator('input[type="email"]').first();
  if (await emailField.count()) await emailField.fill(testEmail);

  const websiteField = page.locator('input[name="website"], input[placeholder*="company" i], input[placeholder*="acme" i], input[placeholder*="http" i]').first();
  if (await websiteField.count()) await websiteField.fill('https://qa-test.example.com');

  const companyField = page.locator('input[name="company"], input[name="companyName"], input[placeholder*="company name" i]').first();
  if (await companyField.count()) await companyField.fill('QA Flow Test Co');

  const productField = page.locator('input[name="product"], input[name="productName"], textarea[name="product"], input[placeholder*="product" i]').first();
  if (await productField.count()) await productField.fill('QA AI Assistant');

  const aboutField = page.locator('textarea').first();
  if (await aboutField.count()) await aboutField.fill('Automated launch readiness flow test from qa-flow-test.mjs.');

  const submitBtn = page.locator('button[type="submit"]').first();
  const formReady = (await submitBtn.count()) > 0 && (await emailField.count()) > 0;
  record('B2 request form fields visible', formReady, WRITE_REQUEST_QA ? 'write mode' : 'read-only mode');

  if (WRITE_REQUEST_QA) {
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();

    // Wait for success indicator
    const success = await page
      .locator('text=/thanks|received|received your request|we will reply|reply within|next step/i')
      .first()
      .waitFor({ timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    record('B3 request submit shows success state', success);
  } else {
    record('B3 request submit skipped', true, 'set RUN_REQUEST_WRITE_QA=1 to create a QA request');
  }

  await page.screenshot({ path: resolve(OUT, 'flow-b-success.png'), fullPage: false });
  await page.close();

  globalThis.__qaEmail = testEmail; // expose for admin verification later
} catch (err) {
  record('FLOW B', false, err.message);
}

// ---------------------------------------------------------------------------
// Flow D: all secondary pages render with a clickable primary CTA
// ---------------------------------------------------------------------------
const secondaries = [
  ['/pricing', /pricing|pack|preparation|buyer-review evidence/i],
  ['/examples', /examples|sample|structure/i],
  ['/safety', /safe|scope|safety/i],
  ['/agencies', /agencies|agency|handoff/i],
  ['/contact', /contact|partnership|reply/i],
];
for (const [path, hintRe] of secondaries) {
  try {
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const h1 = (await page.locator('h1').first().textContent()) || '';
    const renders = hintRe.test(h1);
    // Count visible CTA anchors
    const ctaCount = await page
      .locator(
        'a:has-text("Run free readiness check"), a:has-text("Run free check"), a:has-text("Run assessment"), a:has-text("Request"), a:has-text("Request paid pack"), a:has-text("See sample packet"), a:has-text("Start secure checkout")',
      )
      .count();
    record(`D ${path} renders`, renders, h1.slice(0, 60));
    record(`D ${path} has CTAs`, ctaCount > 0, `${ctaCount} CTA anchors`);
    await page.close();
  } catch (err) {
    record(`FLOW D ${path}`, false, err.message);
  }
}

await browser.close();

console.log('\n----- summary -----');
console.log(`pass: ${results.filter((r) => r.ok).length}/${results.length}`);
if (!allOk) {
  console.log('FAILED:', results.filter((r) => !r.ok).map((r) => r.name).join(', '));
  process.exit(1);
}
console.log('All flow tests passed.');
