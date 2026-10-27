// node render.mjs <dir with score.json> [--stills t ...] : renders page.js at 30 fps, 1920x1080, into <dir>/frames
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [, , dir, ...rest] = process.argv; const out = dir + '/frames'; fs.mkdirSync(out, { recursive: true });
const score = fs.readFileSync(dir + '/score.json', 'utf8'), js = fs.readFileSync(new URL('./page.js', import.meta.url), 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#0B1230}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg><script>window.SCORE=${score};</script><script>${js}</script></body></html>`;
fs.writeFileSync(dir + '/page.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + dir + '/page.html'); await p.waitForFunction(() => window.READY === true);
const S = JSON.parse(score);
const ts = rest[0] === '--stills' ? rest.slice(1).map(Number) : [...Array(Math.round(S.end * 30)).keys()].map((i) => i / 30);
for (const t of ts) { await p.evaluate((t) => window.renderAt(t), t);
	await p.screenshot({ path: rest[0] === '--stills' ? `${dir}/s${t.toFixed(2)}.png` : `${out}/f${String(Math.round(t * 30)).padStart(5, '0')}.png` }); }
await b.close(); console.log('frames', ts.length);
