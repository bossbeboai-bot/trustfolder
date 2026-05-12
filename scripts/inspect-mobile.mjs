import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const hero = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  const ctas = Array.from(document.querySelectorAll('main a[href]'))
    .slice(0, 3)
    .map((a) => ({ href: a.getAttribute('href'), text: a.textContent?.trim().slice(0, 40) }));
  const heroRect = h1?.getBoundingClientRect();
  return {
    h1Text: h1?.textContent?.trim().slice(0, 80),
    h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
    heroRect: heroRect ? { x: heroRect.x, y: heroRect.y, w: heroRect.width, h: heroRect.height } : null,
    ctas,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
});

console.log(JSON.stringify(hero, null, 2));
await browser.close();
