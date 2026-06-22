// Build-artifact integrity check: assert that every local asset referenced by
// dist/index.html actually exists in dist/. The white-screen incident shipped an
// index.html whose /assets/*.js and *.css returned 404 — a passing `vite build`
// does not by itself prove the emitted HTML and assets are consistent. Run this
// right after `npm run build` (CI does). Exits non-zero on any missing file.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const indexPath = join(dist, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`check-dist: ${indexPath} not found — run \`npm run build\` first.`);
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

// Local refs only (start with "/"); ignore absolute http(s) URLs (CDNs, beacons).
const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
const missing = [];
for (const ref of refs) {
  const clean = ref.split(/[?#]/)[0]; // strip query/hash
  const filePath = join(dist, clean);
  if (!existsSync(filePath)) missing.push(ref);
}

if (missing.length > 0) {
  console.error('check-dist: index.html references files missing from dist/:');
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}

console.log(`check-dist: OK — all ${refs.length} referenced local asset(s) exist in dist/.`);
