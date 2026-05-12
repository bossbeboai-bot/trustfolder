// Phase 7 Resend production test.
// Sends ONE clearly-marked test email. Never prints any secret. Exits 0 on
// success and 2 on failure.
//
// Usage:
//   node scripts/test-email-production.mjs --to founder@trustfolder.com
//
// If --to is omitted, falls back to ADMIN_EMAIL from engine/.env. The script
// refuses to send if the recipient looks like a customer-facing inbox
// (support@, hello@) — those are reserved for actual transactional flow.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '..', 'engine', '.env');

function parseEnv(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return out;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
  }
  return out;
}

const env = parseEnv(envPath);
const apiKey = env.RESEND_API_KEY ?? '';
const from = env.RESEND_FROM_EMAIL ?? '';
const adminEmail = env.ADMIN_EMAIL ?? '';

const toFlagIdx = process.argv.indexOf('--to');
const argTo = toFlagIdx > -1 ? process.argv[toFlagIdx + 1] : '';
const to = argTo || adminEmail;

if (!apiKey || !from) {
  console.log('EMAIL_TEST_RESULT: env_incomplete (RESEND_API_KEY or RESEND_FROM_EMAIL missing)');
  process.exit(2);
}
if (!to) {
  console.log('EMAIL_TEST_RESULT: missing_recipient (pass --to <email> or set ADMIN_EMAIL)');
  process.exit(2);
}
if (/^(support|hello|hi)@/i.test(to)) {
  console.log('EMAIL_TEST_RESULT: refused_customer_inbox (use a personal/admin inbox for the test)');
  process.exit(2);
}

const subject = '[TrustFolder TEST] production Resend probe';
const text = [
  'This is a TrustFolder production email probe.',
  'It is not a customer email.',
  'If you received this unexpectedly, ignore it.',
  '',
  'Sent by scripts/test-email-production.mjs',
].join('\n');

const payload = { from, to, subject, text };

try {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const ok = res.status >= 200 && res.status < 300;
  console.log('  resend status=' + res.status + ' ' + (ok ? 'OK' : 'FAIL'));
  console.log('  recipient (masked)=' + (to.replace(/(^.).+(@.*$)/, '$1***$2')));
  console.log('  from (masked)=' + (from.replace(/(^.).+(@.*$)/, '$1***$2')));
  if (ok) {
    console.log('EMAIL_TEST_RESULT: GO');
    process.exit(0);
  }
  console.log('EMAIL_TEST_RESULT: BLOCKED');
  process.exit(2);
} catch (err) {
  console.log('EMAIL_TEST_RESULT: NETWORK_ERROR (' + (err?.code ?? err?.message ?? 'unknown') + ')');
  process.exit(2);
}
