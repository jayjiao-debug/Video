// node board/safe2_sheet.mjs <outdir> — the full safe keyframe board, 3 pages (frames from board/safe2.mjs stills)
import { createRequire } from 'module';
import fs from 'fs';
import { FRAMES } from './safe2.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] || '/dev/shm/shz01/safe2/board';
fs.mkdirSync(out, { recursive: true });
const IMG = (i) => `/dev/shm/shz01/safe2/t_${i.toFixed(2).padStart(6, '0')}.jpg`;
const NEW = new Set([2, 6, 7, 8, 9, 10, 13, 14, 15, 16, 18, 19, 25, 32]);
const FIX = new Set([17, 36, 37]);
const tag = (i) => (NEW.has(i) ? ['新画 new', '#b3302a'] : FIX.has(i) ? ['改 fixed', '#7a5a2a'] : ['沿用 kept', '#4a5a4a']);
const PER = 12, pages = Math.ceil(FRAMES.length / PER);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
for (let p = 0; p < pages; p++) {
  const cells = FRAMES.slice(p * PER, (p + 1) * PER).map(([line, pic], j) => {
    const i = p * PER + j, [tl, tc] = tag(i);
    return `<div class="c"><div class="f"><img src="file://${IMG(i)}"><span class="k">${String(i + 1).padStart(2, '0')}</span><span class="tg" style="background:${tc}">${tl}</span></div><div class="l">${line}</div><div class="n">${pic}</div></div>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#16130f;color:#efe6d4;font-family:'Noto Sans CJK SC';width:1920px}
  h1{font-size:30px;margin:22px 30px 4px;color:#E2B865} .s{margin:0 30px 14px;color:#a99f8e;font-size:18px}
  .g{display:grid;grid-template-columns:repeat(3,610px);gap:16px 20px;padding:0 20px 24px 30px}
  .f{position:relative;width:610px;height:343px;border-radius:5px;overflow:hidden} .f img{width:610px;height:343px;display:block}
  .k{position:absolute;left:8px;top:8px;background:#000c;padding:2px 8px;font-size:18px;font-weight:700}
  .tg{position:absolute;right:8px;top:8px;padding:2px 8px;font-size:15px;font-weight:700;border-radius:3px}
  .l{margin-top:6px;font-size:19px;font-weight:700;line-height:1.35} .n{font-size:16px;color:#b5aa98;margin-top:2px;line-height:1.35}
  </style></head><body><h1>《林冲为什么要休妻？》v4 · safe keyframe board · ${p + 1}/${pages}</h1>
  <div class="s">No hands on screen · side characters only as shadows, silhouettes or objects · 林冲 close-ups: 3 (+1 medium) · no prop handling · real motion only (mocap push, mocap silhouette fight) · cuts / dissolves only · same narration and music</div>
  <div class="g">${cells}</div></body></html>`;
  const f = `${out}/page_${p + 1}.html`; fs.writeFileSync(f, html);
  const pg = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  await pg.goto('file://' + f);
  await pg.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${out}/林冲v4_安全分镜_${p + 1}.jpg`, type: 'jpeg', quality: 86, fullPage: true });
  await pg.close();
}
await browser.close();
console.log('board in', out);
