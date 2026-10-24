// node stills.mjs <outDir> t1 t2 ...   (GPU: Vulkan ANGLE)
import {chromium} from 'playwright-core'; import fs from 'fs'; import {serve} from './serve.mjs';
const [, , out, ...ts] = process.argv; fs.mkdirSync(out, {recursive: true});
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--no-sandbox']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', (e) => console.log('PAGEERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('LOG', m.text().slice(0, 300)); });
await p.goto(`http://127.0.0.1:${PORT}/film.html`); await p.waitForFunction(() => window.READY === true, null, {timeout: 600000});
for (const t of ts) { await p.evaluate((x) => window.renderAt(x), +t); await p.screenshot({path: `${out}/t${(+t).toFixed(2).padStart(7, '0')}.jpg`, type: 'jpeg', quality: 85, timeout: 600000}); }
console.log('STILLS', ts.length); await b.close(); SRV.close();
