// node render.mjs <dir with score.json> [--stills t1 t2 ...] [--part k n] : frames of the film (30 fps) into <dir>/frames
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [, , dir, ...rest] = process.argv; fs.mkdirSync(dir + '/frames', { recursive: true });
const rd = (f) => fs.readFileSync(new URL('./' + f, import.meta.url), 'utf8');
const score = fs.readFileSync(dir + '/score.json', 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>
<script>window.SCORE=${score};</script>${['grain.js', 'tour.js'].map((f) => `<script>${rd(f)}</script>`).join('')}</body></html>`;
const tag = rest[0] === '--part' ? rest[1] : 's'; fs.writeFileSync(`${dir}/film_${tag}.html`, html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto(`file://${dir}/film_${tag}.html`); await p.waitForFunction(() => window.READY === true);
const S = JSON.parse(score);
let ts;
if (rest[0] === '--stills') ts = rest.slice(1).map(Number);
else { const all = [...Array(Math.ceil(S.end * 30) + 15).keys()]; const [k, n] = rest[0] === '--part' ? [+rest[1], +rest[2]] : [0, 1]; ts = all.filter((i) => i % n === k).map((i) => i / 30); }
const t0 = Date.now();
for (const t of ts) { const still = rest[0] === '--stills', out = still ? `${dir}/s${t.toFixed(2)}.png` : `${dir}/frames/f${String(Math.round(t * 30)).padStart(5, '0')}.jpg`;
	if (!still && fs.existsSync(out)) continue;
	await p.evaluate((t) => window.renderAt(t), t);
	await p.screenshot(still ? { path: out, type: 'png' } : { path: out, type: 'jpeg', quality: 92 }); }
await b.close(); console.log('frames', ts.length, 'sec/frame', ((Date.now() - t0) / 1000 / ts.length).toFixed(3));
