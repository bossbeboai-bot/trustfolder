/**
 * Phase 6 request package-interest smoke.
 *
 * Runs against http://localhost:3000 and verifies that every new Phase 6
 * module type renders on /request with the matching package selected.
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const CASES = [
  ['soc2-readiness', 'SOC 2 Readiness Evidence Pack'],
  ['security-questionnaire', 'Enterprise Security Questionnaire Support'],
  ['gdpr-ai-data-readiness', 'GDPR AI/Data Readiness Pack'],
  ['dpa-privacy-handoff', 'DPA / Privacy Agreement Handoff Pack'],
  ['iso42001-readiness', 'ISO 42001 Readiness Pack'],
  ['hipaa-healthcare-intake', 'HIPAA / Healthcare Data Intake Pack'],
  ['medical-ai-intake', 'Medical AI Expert-Review Intake'],
  ['employment-ai-intake', 'Hiring AI Expert-Review Intake'],
  ['financial-credit-insurance-intake', 'Financial / Credit / Insurance AI Intake'],
  ['childrens-products-intake', 'Children’s Product Expert-Review Intake'],
  ['biometrics-intake', 'Biometrics Expert-Review Intake'],
  ['law-enforcement-critical-infrastructure-intake', 'Law Enforcement / Critical Infrastructure Intake'],
];

let ok = true;
const browser = await chromium.launch();
const page = await browser.newPage();

for (const [type, label] of CASES) {
  await page.goto(`${BASE}/request?type=${type}`, { waitUntil: 'domcontentloaded' });
  await page.locator('select#pack').waitFor({ state: 'visible', timeout: 15000 });
  const selected = await page.locator('select#pack').inputValue();
  const packageSummary = (await page.getByText(label).first().textContent().catch(() => '')) ?? '';
  const pass = selected === type && packageSummary.includes(label);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${type} — selected=${selected} label=${label}`);
  if (!pass) ok = false;
}

await browser.close();

if (!ok) process.exit(1);
console.log('All Phase 6 request package-interest cases passed.');
