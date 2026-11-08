// node lineup.mjs [out.png] — head turnaround + costume line-up at one scale (default
// /dev/shm/shz01/rig/lineup_lin.png). Nothing rendered here is committed.
import { createRequire } from 'module';
import fs from 'fs';
import { lin, EX } from './linchong.mjs';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const OUT = process.argv[2] || '/dev/shm/shz01/rig/lineup_lin.png';
const W = 4200;
const T = (x, y, t, sz = 32, w = 700, col = '#2a221d') => `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC, sans-serif" font-size="${sz}" font-weight="${w}" fill="${col}">${t}</text>`;
const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#e9e2d6"/>`;
const CONV = { col: { robe: '#3B4356' }, headCloth: 'plain', tattoo: 1 };
let b = '', y = 30;
b += T(60, y + 48, '林冲 · 同一人: 头部转面 + 服装同尺度对照 (颈部缩短)', 54, 900);
y += 90;

// ---- row 1: head turnaround at one scale (H = 600 px)
const Hh = 4500, Hp = Hh / 7.5, ch = 1000, cw = 780;
b += panel(40, y, W - 80, ch + 90);
b += T(70, y + 46, '头部转面: 正面 · 3/4 (headTurn ±0.5) · 侧面 (左 / 右) · 同一尺度 H = 600 px', 32);
const heads = [
  [{ view: 'front' }, 0, '正面'], [{ view: 'front', pose: { headTurn: 0.5 } }, 0, '3/4 → (0.5)'], [{ view: 'front', pose: { headTurn: -0.5 } }, 0, '3/4 ← (−0.5)'],
  [{ view: 'side' }, -0.12, '侧面 (朝左)'], [{ view: 'side', flip: true }, 0.12, '侧面 (朝右)'],
];
heads.forEach(([o, dx, lab], i) => {
  const x0 = 70 + i * (cw + 30), y0 = y + 70;
  b += `<svg x="${x0}" y="${y0}" width="${cw}" height="${ch}" viewBox="${(dx - 0.65) * Hp} ${-7.9 * Hp} ${1.3 * Hp} ${(1.3 * Hp * ch) / cw}" preserveAspectRatio="xMidYMid slice"><rect x="-9999" y="-9999" width="99999" height="99999" fill="#f2ede4"/>${lin({ costume: 'A', ...o, height: Hh, x: 0, y: 0, expr: EX['平静'] })}</svg>`;
  for (const [k, c] of [[-7.5, '#c96'], [-6.5, '#c96']]) {
    const yy = y0 + ((k * Hp - -7.9 * Hp) * cw) / (1.3 * Hp);
    b += `<path d="M${x0},${yy} h${cw}" stroke="${c}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.7"/>`;
  }
  b += `<rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" fill="none" stroke="#c9bcaa" stroke-width="2"/>`;
  b += T(x0 + 18, y0 + ch - 20, lab, 30);
});
y += ch + 120;

// ---- row 2 + 3: costume line-up, same body, front then side
const FH = 1400, rowH = FH + 170;
for (const view of ['front', 'side']) {
  b += panel(40, y, W - 80, rowH);
  b += T(70, y + 46, view === 'front' ? '服装对照 (正面): 同一身高、肩宽、头身 — 只换衣服' : '服装对照 (侧面)', 32);
  const feet = y + 90 + FH;
  // guides: skull top, chin, shoulder line, sole
  const H = FH / 7.5;
  for (const [k, lab] of [[7.5, '头顶'], [6.5, '下巴'], [6.05, '肩'], [0, '脚底']]) {
    const yy = feet - k * H;
    b += `<path d="M90,${yy} H${W - 90}" stroke="#b9ab98" stroke-width="2" stroke-dasharray="10 8"/>` + T(W - 170, yy - 8, lab, 24, 500, '#8a7b6e');
  }
  const looks = [
    [{ costume: 'A' }, 'A 东京教头'],
    [{ costume: 'A', ...CONV, cangue: true }, '囚服 + 枷'],
    [{ costume: 'C' }, 'C 毡笠'],
    [{ costume: 'C', hat: false }, 'C 摘笠'],
  ];
  looks.forEach(([o, lab], i) => {
    const x = 520 + i * 960;
    b += lin({ view, ...o, height: FH, x, y: feet, expr: EX['平静'] });
    b += T(x - 120, feet + 60, lab, 30);
  });
  y += rowH + 30;
}

// ---- row 4: close-ups the film uses (S03-like, S17-like, profile CU), neck check
const ch2 = 900, cw2 = 1000;
b += panel(40, y, W - 80, ch2 + 90);
b += T(70, y + 46, '镜头检查: S03 式正面特写 (囚服+枷) · S17 式中景 (枷) · 侧面特写 · 颈长 ≈ 0.25–0.3 头', 32);
const cus = [
  [{ view: 'front', costume: 'A', ...CONV, cangue: true, expr: EX['隐忍'], pose: { headTurn: -0.3 } }, 4050, [-0.95, -7.95, 1.9], 'S03 式 (H 540)'],
  [{ view: 'front', costume: 'A', ...CONV, cangue: true, expr: EX['悲'] }, 1950, [-1.7, -8.0, 3.4], 'S17 式 (H 260)'],
  [{ view: 'side', costume: 'A', expr: EX['怒'] }, 4050, [-1.1, -7.95, 1.9], '侧面特写'],
  [{ view: 'side', costume: 'A', ...CONV, cangue: true, expr: EX['悲'] }, 1950, [-2.2, -8.1, 3.6], '侧面 + 枷'],
];
cus.forEach(([o, hh, [vx, vy, vw], lab], i) => {
  const x0 = 70 + i * (cw2 + 20), y0 = y + 70, hp = hh / 7.5;
  b += `<svg x="${x0}" y="${y0}" width="${cw2}" height="${ch2}" viewBox="${vx * hp} ${vy * hp} ${vw * hp} ${(vw * hp * ch2) / cw2}" preserveAspectRatio="xMidYMid slice"><rect x="-9999" y="-9999" width="99999" height="99999" fill="#d9c8ad"/>${lin({ ...o, height: hh, x: 0, y: 0 })}</svg>`;
  b += `<rect x="${x0}" y="${y0}" width="${cw2}" height="${ch2}" fill="none" stroke="#c9bcaa" stroke-width="2"/>` + T(x0 + 18, y0 + ch2 - 20, lab, 30);
});
y += ch2 + 120;

const H = y;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f5f0e8"/>${b}</svg>`;
fs.mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: W, height: H } });
await pg.setContent(`<html><head><meta charset="utf-8"><style>body{margin:0}</style></head><body>${svg}</body></html>`, { waitUntil: 'load' });
await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: OUT });
await br.close();
console.log(OUT, W, H);
