// tests/test_sw_bypass.js — Verifies web/sw.js contains the required bypass
// fixes for the upload=0 Mbps hotfix. Node only, no deps.
const fs = require('fs');

const swPath = 'web/sw.js';
const src = fs.readFileSync(swPath, 'utf8');

const required = [
  "method !== 'GET'",
  "'/empty'",
  "'/garbage'",
  "'/getIP'",
  'skipWaiting',
  'clients.claim',
  'local-speedtest-v2'
];

let failed = 0;
for (const token of required) {
  if (!src.includes(token)) {
    console.log(`[FAIL] missing: ${token}`);
    failed += 1;
  } else {
    console.log(`[PASS] contains: ${token}`);
  }
}

if (failed > 0) {
  console.log(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${required.length} checks passed`);
process.exit(0);
