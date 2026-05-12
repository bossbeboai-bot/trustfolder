import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const CASES = [
  ['/', 'Compliance-readiness modules for AI teams.'],
  ['/pricing', 'Request-only modules. No checkout yet.'],
  ['/request?type=soc2-readiness', 'SOC 2 Readiness Evidence Pack'],
  ['/safety', 'Readiness packs, expert-review handoffs, and intake-only routing.'],
  ['/examples', 'Compliance-readiness module examples'],
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
