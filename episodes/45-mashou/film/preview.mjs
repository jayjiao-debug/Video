// node preview.mjs <outDir> <t1> <t2> ...   — local stills through SwiftShader (slow; for checking only)
import {chromium} from 'playwright-core'; import fs from 'fs'; import {serve} from './serve.mjs';
const [, , out, ...ts] = process.argv; fs.mkdirSync(out, {recursive: true});
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', (e) => console.error('PAGEERR', e.message)); p.on('console', (m) => { if (m.type() === 'error' || process.env.LOG) console.log('LOG', m.text().slice(0, 300)); });
await p.addInitScript((o) => { if (o) window.ONLY = o.split(','); }, process.env.ONLY || '');
await p.goto(`http://127.0.0.1:${PORT}/film.html`); await p.waitForFunction(() => window.READY === true, null, {timeout: 900000});
for (const t of ts) { const t0 = Date.now(); await p.evaluate((x) => window.renderAt(x), +t); await p.screenshot({path: `${out}/t${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 88, scale: 'css', timeout: 900000}); console.log('frame', t, Date.now() - t0, 'ms'); }
await b.close(); SRV.close();
