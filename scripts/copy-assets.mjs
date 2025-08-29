import { statSync, mkdirSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'Assets');
const DEST_DIR = resolve(process.cwd(), 'public', 'Assets');

function copyRecursive(src, dest) {
  const s = statSync(src);
  if (s.isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
      if (entry === '.DS_Store') continue;
      copyRecursive(join(src, entry), join(dest, entry));
    }
  } else {
    mkdirSync(resolve(dest, '..'), { recursive: true });
    copyFileSync(src, dest);
  }
}

try {
  rmSync(DEST_DIR, { recursive: true, force: true });
} catch {}

copyRecursive(SRC, DEST_DIR);
console.log(`[copy-assets] Copiado Assets -> ${DEST_DIR}`);


