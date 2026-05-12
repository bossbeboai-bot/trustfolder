import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const h3s = Array.from(document.querySelectorAll('h3')).map((h) => h.textContent?.trim());
  const sections = Array.from(document.querySelectorAll('section')).map((s) => ({
    height: Math.round(s.getBoundingClientRect().height),
    text: (s.textContent || '').slice(0, 80).replace(/\s+/g, ' '),
  }));
  return { h3s, sections };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
