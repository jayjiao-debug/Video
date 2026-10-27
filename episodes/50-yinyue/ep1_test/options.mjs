// node options.mjs <outdir> : renders every option in options.js to <outdir>/<name>.png, plus layouts.jpg / styles.jpg sheets
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const js = fs.readFileSync(new URL('./page.js', import.meta.url), 'utf8'), opt = fs.readFileSync(new URL('./options.js', import.meta.url), 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg><script>window.SCORE={bars:[],hits:[]};</script><script>${js}</script><script>${opt}</script></body></html>`;
fs.writeFileSync(out + '/options.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + out + '/options.html');
const names = await p.evaluate(() => Object.keys(window.OPTIONS));
for (const n of names) { await p.evaluate((n) => { document.getElementById('art').innerHTML = window.OPTIONS[n](); }, n); await p.waitForTimeout(100); await p.screenshot({ path: `${out}/${n}.png` }); console.log(n); }
const LABEL = { L1_stage_and_grid: 'L1 舞台 + 格子 · band left, 16 cells right', L2_clock_ring: 'L2 时钟环 · 16 cells round a clock', L3_band_house: 'L3 乐队之家 · one floor per instrument', L4_light_up_floor: 'L4 发光地板 · the band stands on the cells',
	S1_puppet_theatre: 'S1 木偶剧场 · velvet, wood, felt', S2_neon_rooftop: 'S2 霓虹天台 · dusk city, neon tubes', S3_paper_diorama: 'S3 纸雕 · layered paper, daylight', S4_glass_and_chrome: 'S4 玻璃 · glass and bloom (bold)' };
for (const [sheet, pre] of [['layouts', 'L'], ['styles', 'S']]) {
	const ns = names.filter((n) => n.startsWith(pre));
	const pg = await b.newPage({ viewport: { width: 1920, height: 1160 } });
	fs.writeFileSync(`${out}/${sheet}.html`, `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;font:700 26px 'Noto Sans CJK SC';color:#eee">
	${ns.map((n) => `<div><img src="file://${out}/${n}.png" style="width:100%;display:block;border-radius:6px"><div style="padding:8px 2px">${LABEL[n]}</div></div>`).join('')}</body></html>`); await pg.goto(`file://${out}/${sheet}.html`);
	await pg.waitForTimeout(400); await pg.screenshot({ path: `${out}/${sheet}.jpg`, type: 'jpeg', quality: 88, fullPage: true });
}
await b.close();
