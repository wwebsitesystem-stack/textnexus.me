import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
const pages = process.argv.slice(2);
mkdirSync('artifacts/audit/tmp', { recursive: true });
let bad = 0, total = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(html))) {
    const attrs = m[1], body = m[2];
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
    const ext = /type\s*=\s*["']module["']/.test(attrs) ? 'mjs' : 'js';
    const f = join('artifacts/audit/tmp', `${p.replace(/[^a-z0-9]/gi, '_')}-${i++}.${ext}`);
    writeFileSync(f, body);
    total++;
    try { execFileSync('node', ['--check', f], { stdio: 'pipe' }); }
    catch (e) { bad++; console.log(`SYNTAX FAIL ${p} block ${i}: ${String(e.stderr).split('\n').slice(0, 4).join(' | ')}`); }
  }
}
console.log(`inline scripts checked: ${total}, failures: ${bad}`);
