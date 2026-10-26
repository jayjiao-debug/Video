// node render.mjs <outDir> [t0 t1 | --stills t ...] : renders page.js frames at 30 fps (1080×1920) with Playwright
import {createRequire} from 'module'; const {chromium} = createRequire('/home/claude/video/episodes/43-qingming/film/package.json')('playwright');
import fs from 'fs';
const [, , out, ...rest] = process.argv; fs.mkdirSync(out, {recursive: true});
const score = fs.readFileSync(new URL('./score.json', import.meta.url), 'utf8'), js = fs.readFileSync(new URL('./page.js', import.meta.url), 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#0E1016;font-family:'Noto Sans CJK SC',sans-serif}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"></svg><script>window.SCORE=${score};</script><script>${js}</script></body></html>`;
fs.writeFileSync(out + '/page.html', html);
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}});
await p.goto('file://' + out + '/page.html'); await p.waitForFunction(() => window.READY === true);
const S = JSON.parse(score);
const ts = rest[0] === '--stills' ? rest.slice(1).map(Number) : (() => { const a = +(rest[0] ?? 0), z = +(rest[1] ?? S.end); const r = []; for (let i = Math.round(a * 30); i < Math.round(z * 30); i++) r.push(i / 30); return r; })();
for (const t of ts) { await p.evaluate((t) => window.renderAt(t), t);
	await p.screenshot({path: rest[0] === '--stills' ? `${out}/s${t.toFixed(2)}.png` : `${out}/f${String(Math.round(t * 30)).padStart(5, '0')}.png`}); }
await b.close(); console.log('frames', ts.length);
