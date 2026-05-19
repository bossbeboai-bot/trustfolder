import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'https://trustfolder.vercel.app';
const CASES = [
  ['/', "Enterprise buyers don't pause deals over AI features."],
  ['/pricing', 'Choose the buyer-review evidence level after the free check'],
  ['/request?type=soc2-readiness', 'SOC 2 Readiness Evidence Pack'],
  ['/safety', 'Safe by default. Clear when expert review is needed.'],
  ['/examples', 'Sample AI governance documents and buyer-review packet'],
];

let ok = true;
const browser = await chromium.launch();
const page = await browser.newPage();

for (const [path, text] of CASES) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  const found = await page.getByText(text).first().waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
  console.log(`${found ? 'PASS' : 'FAIL'} ${path} contains ${text}`);
  if (!found) ok = false;
}

await browser.close();
if (!ok) process.exit(1);
console.log('All Phase 6 public routes passed.');
