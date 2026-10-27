// node clip_render.mjs <dir with clip_score.json> [--stills t ...] : 30 fps frames of the genre-switch demo into <dir>/frames
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [, , dir, ...rest] = process.argv; fs.mkdirSync(dir + '/frames', { recursive: true });
const rd = (f) => fs.readFileSync(new URL('./' + f, import.meta.url), 'utf8');
const score = fs.readFileSync(dir + '/clip_score.json', 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#1E2230}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>
<script>window.SCORE=${score};const F='font-family="Noto Sans CJK SC, sans-serif"';</script>${['band.js', 'genre_band.js', 'genre_frames.js', 'clip.js'].map((f) => `<script>${rd(f)}</script>`).join('')}</body></html>`;
fs.writeFileSync(dir + '/clip.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + dir + '/clip.html'); await p.waitForFunction(() => window.READY === true);
const S = JSON.parse(score);
const ts = rest[0] === '--stills' ? rest.slice(1).map(Number) : [...Array(Math.round(S.end * 30)).keys()].map((i) => i / 30);
for (const t of ts) { await p.evaluate((t) => window.renderAt(t), t);
	await p.screenshot({ path: rest[0] === '--stills' ? `${dir}/s${t.toFixed(2)}.png` : `${dir}/frames/f${String(Math.round(t * 30)).padStart(5, '0')}.png` }); }
await b.close(); console.log('frames', ts.length);
