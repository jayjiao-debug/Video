// Serve ./ (with node_modules/three) on localhost and render frames of cat3d.html with headless Chromium (WebGL).
// node render3d.mjs <servedDir> <framesDir> [fps] [stillTimes...]
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path';
const [DIR, OUT, FPS = '30', ...stills] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-proxy-server'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => console.log('page:', m.text())); page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto(`http://127.0.0.1:${port}/cat3d.html`); await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const S = JSON.parse(fs.readFileSync(path.join(DIR, 'hits.json')));
const list = stills.length ? stills.map((t) => [+t, `still_${(+t).toFixed(2)}.png`]) : [...Array(Math.ceil(S.dur * +FPS)).keys()].map((i) => [i / +FPS, `f${String(i).padStart(5, '0')}.jpg`]);
const canvas = await page.$('canvas'); const t0 = Date.now();
for (const [t, name] of list) { await page.evaluate((x) => window.renderAt(x), t); await canvas.screenshot({ path: path.join(OUT, name), ...(name.endsWith('.jpg') ? { type: 'jpeg', quality: 93 } : {}) }); }
console.log('frames', list.length, 'in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await browser.close(); srv.close();
