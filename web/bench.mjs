// node bench.mjs <outDir> <nFrames> <flagset>  -> prints JSON {renderer, msPerFrame, ...}
import { chromium } from 'playwright-core'; import fs from 'fs'; import { serve } from './serve.mjs';
const [, , out, n, flagset] = process.argv; fs.mkdirSync(out, { recursive: true });
const FLAGS = {
  cpu: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  vulkan: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu'],
  egl: ['--use-gl=egl', '--ignore-gpu-blocklist', '--enable-gpu'],
  angle_gl: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu'],
}[flagset];
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({ args: [...FLAGS, '--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const t0 = Date.now();
await p.goto(`http://127.0.0.1:${PORT}/ice15.html`); await p.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
const load = Date.now() - t0;
const renderer = await p.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); if (!c) return 'no webgl2'; const e = c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER); });
const N = +n; const t1 = Date.now();
for (let i = 0; i < N; i++) { const t = (i / N) * 15; await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ path: `${out}/${flagset}_${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 90 }); }
const ms = (Date.now() - t1) / N;
console.log('RESULT ' + JSON.stringify({ flagset, renderer, loadMs: load, msPerFrame: Math.round(ms) }));
await b.close(); SRV.close();
