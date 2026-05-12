import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

page.on('console', (msg) => console.log(`[console:${msg.type()}]`, msg.text().slice(0, 200)));
page.on('pageerror', (err) => console.log(`[pageerror]`, err.message));

await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

const dump = await page.evaluate(() => {
  return {
    title: document.title,
    bodyText: (document.body?.innerText || '').slice(0, 200),
    h1Count: document.querySelectorAll('h1').length,
    h2Count: document.querySelectorAll('h2').length,
    mainCount: document.querySelectorAll('main').length,
    headerCount: document.querySelectorAll('header').length,
    bodyChildren: document.body ? document.body.children.length : -1,
    documentChildren: document.documentElement.children.length,
    bodyHTML: (document.body?.innerHTML || '').slice(0, 400),
  };
});

console.log(JSON.stringify(dump, null, 2));
await browser.close();
