import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const distIndex = resolve(process.cwd(), 'dist', 'index.html');
if (!existsSync(distIndex)) {
  console.error('[postbuild] dist/index.html no existe. ¿Se ejecutó vite build?');
  process.exit(1);
}

let html = readFileSync(distIndex, 'utf8');

// Quitar atributo crossorigin de <link rel="stylesheet"> y <script type="module">
html = html.replace(/\s+crossorigin(=["'][^"']*["'])?/g, '');

// Asegurar rutas relativas con ./ (por si algún plugin las dejó absolutas)
html = html.replace(/href="\/assets\//g, 'href="./assets/');
html = html.replace(/src="\/assets\//g, 'src="./assets/');

writeFileSync(distIndex, html);
console.log('[postbuild] HTML ajustado para WKWebView (sin crossorigin, rutas relativas).');

// Inline del CSS principal para evitar fallos de carga del CSS en WKWebView
const cssMatch = html.match(/<link\s+rel=["']stylesheet["'][^>]*href=["'](.+?index-[^"']+\.css)["'][^>]*>/);
if (cssMatch) {
  const cssPath = resolve(process.cwd(), 'dist', cssMatch[1].replace(/^\.\//, ''));
  try {
    const css = readFileSync(cssPath, 'utf8');
    html = html.replace(cssMatch[0], `<style>${css}</style>`);
    writeFileSync(distIndex, html);
    console.log('[postbuild] CSS inlined en index.html para mayor fiabilidad en iOS.');
  } catch (e) {
    console.warn('[postbuild] No se pudo inlinear CSS:', e.message);
  }
}


