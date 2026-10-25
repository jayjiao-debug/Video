// node chunk.mjs <outDir> <fromFrame> <toFrame> <fps>
import { chromium } from 'playwright-core'; import fs from 'fs'; import { serve } from './serve.mjs';
const [, , out, from, to, fps] = process.argv; fs.mkdirSync(out, { recursive: true });
const LINES = fs.existsSync('lines.json') ? JSON.parse(fs.readFileSync('lines.json', 'utf8')) : [];
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('LOG', m.text().slice(0, 300)); });
await p.addInitScript(l => { window.LINES = l; }, LINES);
await p.goto(`http://127.0.0.1:${PORT}/film.html`); await p.waitForFunction(() => window.READY === true, null, { timeout: 600000 });
await p.evaluate(() => document.fonts.ready);
const gl = await p.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const e = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(e.UNMASKED_RENDERER_WEBGL); });
console.log('RENDERER', gl);
const t0 = Date.now();
const PG = fs.existsSync('page.json') ? JSON.parse(fs.readFileSync('page.json', 'utf8')) : null;   // optional: clip t0, n frames per variant, variants [{cls, flags}]
let curV = -1;
for (let i = +from; i < +to; i++) {
	let t = i / +fps;
	if (PG) { const v = Math.floor(i / PG.n); t = PG.t0 + (i % PG.n) / +fps; if (v !== curV) { curV = v; await p.evaluate(c => { document.body.className = c.cls || ''; Object.assign(window, c.flags || {}); }, PG.variants[v]); } }
	await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ timeout: 600000, path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); }
console.log('MS_PER_FRAME', Math.round((Date.now() - t0) / (+to - +from)));
await b.close(); SRV.close();
