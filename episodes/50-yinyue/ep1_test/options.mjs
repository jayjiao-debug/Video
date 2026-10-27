// node options.mjs <outdir> : renders every option in options.js to <outdir>/<name>.png, plus layouts.jpg / styles.jpg sheets
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const out = process.argv[2], extra = process.argv.slice(3); fs.mkdirSync(out, { recursive: true });
const js = fs.readFileSync(new URL('./page.js', import.meta.url), 'utf8'), opt = ['options.js', ...extra].map((f) => fs.readFileSync(new URL('./' + f, import.meta.url), 'utf8')).join('\n;\n');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden}</style></head>
<body><svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg><script>window.SCORE={bars:[],hits:[]};</script><script>${js}</script><script>${opt}</script></body></html>`;
fs.writeFileSync(out + '/options.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + out + '/options.html');
const names = await p.evaluate(() => Object.keys(window.OPTIONS));
for (const n of names) { await p.evaluate((n) => { document.getElementById('art').innerHTML = window.OPTIONS[n](); }, n); await p.waitForTimeout(100); await p.screenshot({ path: `${out}/${n}.png` }); console.log(n); }
const LABEL = { L1_stage_and_grid: 'L1 舞台 + 格子 · band left, 16 cells right', L2_clock_ring: 'L2 时钟环 · 16 cells round a clock', L3_band_house: 'L3 乐队之家 · one floor per instrument', L4_light_up_floor: 'L4 发光地板 · the band stands on the cells',
	S1_puppet_theatre: 'S1 木偶剧场 · velvet, wood, felt', S2_neon_rooftop: 'S2 霓虹天台 · dusk city, neon tubes', S3_paper_diorama: 'S3 纸雕 · layered paper, daylight', S4_glass_and_chrome: 'S4 玻璃 · glass and bloom (bold)',
	L3_light_wall: 'L3 灯墙 · the cells are an LED wall behind the band',
	SA_concert_backlight: 'A 演唱会逆光 · backlight, beams, haze', SB_rooftop_sunset: 'B 天台日落 · rooftop against the sun', SC_paper_cut: 'C 纸雕剪影 · band cut from dark paper', SD_shadow_screen: 'D 皮影幕布 · shadows on a lit screen',
	BA_split_panels: 'A 分屏 · a panel per player, their own 16 cells underneath', BB_stage_and_tracks: 'B 舞台 + 音轨 · one track per part, headed by its player', BC_lanes_to_the_players: 'C 音轨通道 · notes rise to each player and play at their feet' };
for (const [sheet, pre] of [['layouts', 'L'], ['styles', 'S'], ['band_layouts', 'B']]) {
	const ns = names.filter((n) => n.startsWith(pre));
	const pg = await b.newPage({ viewport: { width: 1920, height: 1160 } });
	fs.writeFileSync(`${out}/${sheet}.html`, `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;font:700 26px 'Noto Sans CJK SC';color:#eee">
	${ns.map((n) => `<div><img src="file://${out}/${n}.png" style="width:100%;display:block;border-radius:6px"><div style="padding:8px 2px">${LABEL[n] || n}</div></div>`).join('')}</body></html>`); await pg.goto(`file://${out}/${sheet}.html`);
	await pg.waitForTimeout(400); await pg.screenshot({ path: `${out}/${sheet}.jpg`, type: 'jpeg', quality: 88, fullPage: true });
}
await b.close();
