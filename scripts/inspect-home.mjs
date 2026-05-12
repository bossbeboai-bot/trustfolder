import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('main > section')).map((s) => ({
    id: s.id,
    height: Math.round(s.getBoundingClientRect().height),
    title: s.querySelector('h1, h2')?.textContent?.trim().slice(0, 80),
  }));
  const h2s = Array.from(document.querySelectorAll('h2')).map((h) =>
    h.textContent?.trim().slice(0, 80),
  );
  return { sections, h2s };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
