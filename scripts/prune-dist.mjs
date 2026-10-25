// Tras `astro build`: borra de dist/ las imagenes que ningun .html/.css/.js/.xml/.webmanifest referencia
// (Astro deja los PNG/JPG originales en dist/_astro aunque solo se sirvan sus variantes optimizadas).
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const IMG = /\.(png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?)$/i;
const TXT = /\.(html|css|m?js|xml|webmanifest|json|txt)$/i;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(DIST);
const text = files.filter((f) => TXT.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
const haystack = text;

let removed = 0;
let bytes = 0;
for (const f of files.filter((f) => IMG.test(f))) {
  const rel = f.slice(DIST.length).split(sep).join('/');
  const name = basename(f);
  if (haystack.includes(rel) || haystack.includes(name)) continue;
  bytes += statSync(f).size;
  rmSync(f);
  removed++;
  console.log(`  - ${rel}`);
}
console.log(`prune-dist: ${removed} imagen(es) sin referencia borradas (${(bytes / 1048576).toFixed(1)} MB)`);
