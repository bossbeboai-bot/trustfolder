import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scanRoots = [
  path.join(root, 'app', 'app'),
  path.join(root, 'app', 'lib'),
];

const forbidden = [
  'fully compliant',
  'guaranteed compliance',
  'audit-proof',
  'no lawyer needed',
  'GDPR Article 50',
  '8 documents per pack',
  '8/8 ready',
  'PayPal checkout when live',
  'checkout is not live',
  'ISO 42001-inspired',
];

const allowedInternal = [
  path.normalize('app/app/api/paypal/create-order/route.ts'),
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|mdx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const hits = [];
for (const file of scanRoots.flatMap((dir) => walk(dir))) {
  const rel = path.relative(root, file);
  if (allowedInternal.includes(path.normalize(rel))) continue;
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (const phrase of forbidden) {
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(phrase.toLowerCase())) {
        hits.push(`${rel}:${index + 1}: ${phrase}`);
      }
    });
  }
}

if (hits.length) {
  console.error('Copy guardrail failures:');
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}

console.log(`Copy guardrails passed (${forbidden.length} phrases scanned).`);
