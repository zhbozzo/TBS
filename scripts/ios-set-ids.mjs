import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(envPath)) {
  console.error('[ios-set-ids] .env.production no existe. Crea el archivo con VITE_IOS_ADMOB_APP_ID.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const appId = env.VITE_IOS_ADMOB_APP_ID;
if (!appId || appId.includes('xxxxxxxx')) {
  console.error('[ios-set-ids] VITE_IOS_ADMOB_APP_ID inválido. Edita .env.production.');
  process.exit(2);
}

const plistPath = path.resolve(process.cwd(), 'ios/App/App/Info.plist');
let plist = fs.readFileSync(plistPath, 'utf8');

plist = plist.replace(
  /<key>GADApplicationIdentifier<\/key>\s*<string>[^<]*<\/string>/,
  `<key>GADApplicationIdentifier</key>\n    <string>${appId}</string>`
);

fs.writeFileSync(plistPath, plist, 'utf8');
console.log('[ios-set-ids] Info.plist actualizado con GADApplicationIdentifier.');


