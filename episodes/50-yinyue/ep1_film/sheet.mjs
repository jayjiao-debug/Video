// node sheet.mjs <out.png> <js expression returning svg body> : renders one 1920x1080 still using chars.js (+ film.js if present)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [, , out, expr, ...extra] = process.argv;
const rd = (f) => fs.readFileSync(new URL('./' + f, import.meta.url), 'utf8');
const files = ['chars.js', ...extra];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#222}</style></head><body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>${files.map((f) => `<script>${rd(f)}</script>`).join('')}</body></html>`;
fs.writeFileSync('/tmp/sheet.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message)); p.on('console', (m) => console.log('LOG', m.text()));
await p.goto('file:///tmp/sheet.html');
await p.evaluate((e) => { document.getElementById('art').innerHTML = eval(e); }, expr);
await p.screenshot({ path: out }); await b.close();
