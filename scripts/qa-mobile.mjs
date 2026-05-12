/**
 * Phase 3.8 mobile QA — capture every public page at iPhone 14-ish width.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', '.playwright-mcp');

const PAGES = [
  { id: 'home', path: '/' },
  { id: 'assessment', path: '/assessment' },
  { id: 'request-governance', path: '/request?type=governance' },
  { id: 'pricing', path: '/pricing' },
  { id: 'examples', path: '/examples' },
  { id: 'safety', path: '/safety' },
  { id: 'agencies', path: '/agencies' },
  { id: 'contact', path: '/contact' },
];

const VIEWPORT = { width: 390, height: 844 }; // iPhone 14
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });

for (const p of PAGES) {
  const page = await ctx.newPage();
  const url = `${BASE}${p.path}`;
  console.log(`→ ${p.id} (${url})`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  const fold = resolve(OUT, `qa-mobile-${p.id}.png`);
  await page.screenshot({ path: fold, fullPage: false });
  // Detect horizontal overflow (a common mobile bug)
  const overflow = await page.evaluate(() => {
    return {
      bodyScrollWidth: document.body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowX: document.body.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(`  ${fold}  (overflow=${JSON.stringify(overflow)})`);
  await page.close();
}

await ctx.close();
await browser.close();
console.log('done');
