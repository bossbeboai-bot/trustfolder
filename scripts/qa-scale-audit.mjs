import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', '.playwright-mcp');
const BASE = process.env.BASE_URL ?? 'https://trustfolder.vercel.app';

const pages = [
  ['home', '/'],
  ['assessment', '/assessment'],
  ['request-governance', '/request?type=governance'],
  ['pricing', '/pricing'],
  ['examples', '/examples'],
  ['safety', '/safety'],
  ['agencies', '/agencies'],
  ['contact', '/contact'],
];

const viewports = [
  ['desktop1440', { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ['desktop1920', { width: 1920, height: 1080, deviceScaleFactor: 1 }],
  ['mobile390', { width: 390, height: 844, deviceScaleFactor: 2 }],
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [vpName, viewport] of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.deviceScaleFactor });
  for (const [id, path] of pages) {
    const page = await context.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    const file = resolve(OUT, `v1-${vpName}-${id}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const metrics = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const main = document.querySelector('main');
      const cards = Array.from(document.querySelectorAll('main [class*="rounded"]')).slice(0, 8);
      const cardRects = cards.map((card) => {
        const r = card.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });
      return {
        title: document.title,
        h1: h1?.textContent?.trim().slice(0, 80) ?? null,
        h1Font: h1 ? getComputedStyle(h1).fontSize : null,
        h1Rect: h1 ? (() => { const r = h1.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })() : null,
        mainWidth: main ? Math.round(main.getBoundingClientRect().width) : null,
        overflowX: document.body.scrollWidth > document.documentElement.clientWidth,
        cardRects,
      };
    });
    console.log(JSON.stringify({ vpName, id, file, metrics }));
    await page.close();
  }
  await context.close();
}

await browser.close();
