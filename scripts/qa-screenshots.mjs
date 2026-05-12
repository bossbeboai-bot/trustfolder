/**
 * Phase 3.8 visual QA — capture full-page screenshots of every public page.
 *
 * Run with: node scripts/qa-screenshots.mjs
 *
 * Outputs to .playwright-mcp/qa-*.png so they sit alongside the prototype
 * screenshot directory and don't pollute the repo root.
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

const VIEWPORT = { width: 1440, height: 900 };
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: VIEWPORT });

for (const p of PAGES) {
  const page = await ctx.newPage();
  const url = `${BASE}${p.path}`;
  console.log(`→ ${p.id} (${url})`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  const fold = resolve(OUT, `qa-${p.id}-fold.png`);
  const full = resolve(OUT, `qa-${p.id}-full.png`);
  await page.screenshot({ path: fold, fullPage: false });
  await page.screenshot({ path: full, fullPage: true });
  console.log(`  saved ${fold} + ${full}`);
  await page.close();
}

await ctx.close();
await browser.close();
console.log('done');
