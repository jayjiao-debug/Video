// node board/safe_sheet.mjs <out.jpg> — the safe-storyboard samples with captions (frames from board/safe.mjs)
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] || '/dev/shm/shz01/safe/safe_board.jpg';
const F = (i) => `/dev/shm/shz01/safe/t_${i.toFixed(2).padStart(6, '0')}.jpg`;
const C = [
  [0, 'W01–02 休书', 'The letter, no hand. The palm print is already pressed; the brush lies on the inkstone.', 'no hands'],
  [1, 'W07–10 岳庙', 'The scuffle as shadows on the temple wall. 高衙内 is known by his lantern, never by his face.', 'no side-character faces'],
  [2, 'W11 陆谦', 'Two cups (his untouched), the jug, an empty cushion, his shadow leaving across the screen.', 'no faces, no pouring'],
  [3, 'W19 岳父', '林冲 alone, listening. The promise is brushed beside him. No hand on his shoulder.', 'one close-up, calligraphy'],
  [4, 'W27 the fight', 'Moving silhouettes against the fire, driven by real motion capture (4 phases of one thrust shown here).', 'silhouette = no fingers, no face lines'],
  [5, 'W26 庙门', 'The doors open with the camera standing still. Nothing flies at the lens.', 'simple transitions'],
  [6, 'W39 the end', 'The print alone; the ink lifts away. No fist.', 'objects carry the ending'],
  [7, 'Option B · 皮影', 'Look test only: the whole film as a backlit shadow-puppet play — simple hands and visible joints are part of the style.', 'bigger change'],
];
const cell = ([i, t, d, tag]) => `<div class="c"><div class="f"><img src="file://${F(i)}"><span class="tg">${tag}</span></div><div class="t">${t}</div><div class="d">${d}</div></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#16130f;color:#efe6d4;font-family:'Noto Sans CJK SC';width:1920px}
h1{font-size:34px;margin:24px 34px 4px;color:#E2B865} .s{margin:0 34px 18px;color:#a99f8e;font-size:20px}
.g{display:grid;grid-template-columns:repeat(2,920px);gap:22px 24px;padding:0 30px 30px 34px}
.f{position:relative;width:920px;height:518px;border-radius:6px;overflow:hidden} .f img{width:920px;height:518px;display:block}
.tg{position:absolute;right:10px;top:10px;background:#2d6a4f;padding:3px 10px;border-radius:4px;font-size:18px;font-weight:700}
.t{margin-top:8px;font-size:26px;font-weight:800} .d{font-size:19px;color:#c9bfae;margin-top:2px;line-height:1.4}
</style></head><body><h1>林冲 v4 · the "safe" storyboard — sample frames</h1>
<div class="s">Rules: no hands on screen · no side-character faces (shadows, silhouettes, objects) · 林冲 close-ups only 3 · no prop handling · motion only where real (mocap silhouettes, walking, the push) · cuts / dissolves only</div>
<div class="g">${C.map(cell).join('')}</div></body></html>`;
const f = out.replace(/\.jpg$/, '.html'); fs.writeFileSync(f, html);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
await p.goto('file://' + f); await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: out, type: 'jpeg', quality: 85, fullPage: true }); await b.close();
console.log(out);
