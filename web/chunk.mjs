// node chunk.mjs <outDir> <from> <to> <query>  — renders frames [from,to) of the 15 s shot at 24 fps
import { chromium } from 'playwright-core'; import fs from 'fs'; import { serve } from './serve.mjs';
const [, , out, from, to, query] = process.argv; fs.mkdirSync(out, { recursive: true });
const ss = +(new URLSearchParams(query).get('ss') || 1);
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280 * ss, height: 720 * ss } });
p.on('pageerror', e => console.error('PAGEERR', e.message));
await p.goto(`http://127.0.0.1:${PORT}/ice15.html?${query}`); await p.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
const t0 = Date.now();
for (let i = +from; i < +to; i++) { await p.evaluate(t => window.renderAt(t), i / 24); await p.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.png`, type: 'png' }); }
console.log('CHUNK_MS_PER_FRAME', Math.round((Date.now() - t0) / (+to - +from)));
await b.close(); SRV.close();
