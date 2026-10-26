// Render the Canvas2D drummer: serve <dir>, call renderAt(t) per frame, pull the canvas as JPEG (no screenshot).
// node render2d.mjs <servedDir> <framesDir> [fps] [t0 t1]
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path';
const [DIR, OUT, FPS = '30', T0, T1] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const browser = await chromium.launch({ args: ['--no-proxy-server'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/drummer2d.html?arm=${process.env.ARM || 'A'}`); await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const S = JSON.parse(fs.readFileSync(path.join(DIR, 'hits.json'))), fps = +FPS;
const a = Math.round((T0 ? +T0 : 0) * fps), b = Math.ceil((T1 ? +T1 : S.dur) * fps), t0 = Date.now();
for (let i = a; i < b; i++) { const url = await page.evaluate((t) => { window.renderAt(t); return window.grab(); }, i / fps);
	fs.writeFileSync(path.join(OUT, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64')); }
console.log('frames', b - a, 'in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await browser.close(); srv.close();
