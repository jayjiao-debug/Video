// node test_sheet.mjs [out.png]  — 林冲 rig test sheet (default /dev/shm/shz01/rig/test_rig.png).
// Reference images are read from /dev/shm/shz01/art only to show the likeness side by side;
// nothing rendered here is committed.
import { createRequire } from 'module';
import fs from 'fs';
import { lin, EX, blink } from './linchong.mjs';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }

const OUT = process.argv[2] || '/dev/shm/shz01/rig/test_rig.png';
const W = 4200;
const ART = '/dev/shm/shz01/art/';
const ref = (n) => (fs.existsSync(ART + n) ? 'data:image/png;base64,' + fs.readFileSync(ART + n).toString('base64') : null);
const T = (x, y, t, sz = 34, w = 700, col = '#2a221d') => `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC, sans-serif" font-size="${sz}" font-weight="${w}" fill="${col}">${t}</text>`;
const panel = (x, y, w, h, fill = '#e9e2d6') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}"/>`;
let b = '';
let y = 40;
b += T(60, y + 50, '林冲 · 代码矢量骨骼 (traced rig) · 测试单', 60, 900);
b += T(60, y + 100, '1.80 m = 7.5 头身 · 同一尺度 · 参考图 (左) 对照 · 关节无缝 · 表情参数化', 32, 500, '#6b5d52');
y += 140;

// ---- row 1: reference vs rig, the four base views at one scale
const FH = 1500, rowH = FH + 120;
b += panel(40, y, W - 80, rowH);
const r1 = ref('ref_linchong_A_front.png');
const refH = FH * (1536 / 1300) * 0.0 + 0; // reference drawn at the rig's scale below
// rig scale: skull-to-sole = FH; the reference's sole-to-chin = 6.5 H -> scale the image the same way
const kRef = FH / 7.5 / ((1468 - 331) / 6.5);
if (r1) {
  const iw = 864 * kRef, ih = 1536 * kRef;
  const feetX = 360, feetY = y + 60 + FH;
  b += `<clipPath id="refc"><rect x="${feetX - 300}" y="${y + 20}" width="600" height="${FH + 90}" rx="10"/></clipPath>`;
  b += `<image clip-path="url(#refc)" href="${r1}" x="${feetX - 428 * kRef}" y="${feetY - 1468 * kRef}" width="${iw}" height="${ih}"/>`;
}
b += T(80, y + 50, '参考 A 正面 (painting)', 30);
const views = [['front', 'A', 1060, '代码 A 正面'], ['side', 'A', 1760, 'A 侧面'], ['front', 'C', 2560, 'C 正面 (毡笠代码绘制)'], ['side', 'C', 3460, 'C 侧面']];
for (const [v, c, x, lab] of views) {
  b += lin({ view: v, costume: c, height: FH, x, y: y + 60 + FH, expr: EX['平静'] });
  b += T(x - 220, y + 50, lab, 30);
}
b += `<path d="M80,${y + 60 + FH} H${W - 80}" stroke="#b9ab98" stroke-width="2" stroke-dasharray="10 8"/>`;
b += `<path d="M80,${y + 60} H${W - 80}" stroke="#b9ab98" stroke-width="2" stroke-dasharray="10 8"/>`;
b += T(W - 560, y + 52, '— 头顶 (7.5 H) / 脚底', 26, 500, '#8a7b6e');
y += rowH + 40;

// ---- row 2 + 3: face close-ups, front and profile (expressions + blink)
const exs = [['平静', EX['平静']], ['隐忍', EX['隐忍']], ['怒', EX['怒']], ['悲', EX['悲']], ['眨眼 blink', blink(EX['平静'])]];
const cw = 780, ch = 860;
for (const [v, title] of [['front', '正面特写 (A)'], ['side', '侧面特写 (A)']]) {
  b += panel(40, y, W - 80, ch + 110);
  b += T(70, y + 52, title, 36);
  exs.forEach(([name, e], i) => {
    const x0 = 70 + i * (cw + 30), y0 = y + 80;
    // render at a CU scale: head ~ 560 px
    const Hh = 4200; // px per 1.80 m -> H = 560
    const Hp = Hh / 7.5, vh = 1.86 * Hp, vw = (vh * cw) / ch;
    const vb = v === 'front' ? [-vw / 2, -7.62 * Hp, vw, vh] : [-vw / 2 - 40, -7.62 * Hp, vw, vh];
    b += `<svg x="${x0}" y="${y0}" width="${cw}" height="${ch}" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid slice"><rect x="-2000" y="-6000" width="4000" height="8000" fill="#f2ede4"/>${lin({ view: v, costume: 'A', height: Hh, x: 0, y: 0, expr: e })}</svg>`;
    b += `<rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" fill="none" stroke="#c9bcaa" stroke-width="2"/>`;
    b += T(x0 + 20, y0 + ch - 24, name, 34, 700, '#3a2e26');
  });
  y += ch + 150;
}

// ---- row 4: poses
const PH = 1150, prow = PH + 260;
b += panel(40, y, W - 80, prow);
b += T(70, y + 52, '姿势: 举拳 (肘 100°) · 持枪 (枪 2.30 m, 红缨, 葫芦挂枪头) · 平刺 · 行走', 36);
const fy = y + 120 + PH;
const poses = [
  [{ view: 'front', costume: 'A', expr: EX['怒'], pose: { shoulderR: 80, elbowR: 100, fistR: true } }, 470, 'A 正面 · 右臂举拳'],
  [{ view: 'side', costume: 'A', flip: true, expr: EX['怒'], pose: { shoulderR: 62, elbowR: 100, fistR: true } }, 1150, 'A 侧面 · 右臂举拳'],
  [{ view: 'front', costume: 'C', expr: EX['平静'], pose: { shoulderR: 12, elbowR: -115 }, props: { spear: { hand: 'R', angle: -26, grip: 0.08 } } }, 1850, 'C 正面 · 枪扛肩'],
  [{ view: 'side', costume: 'C', expr: EX['隐忍'], pose: { shoulderL: 25, elbowL: 100, legL: 13, legR: -11 }, props: { spear: { hand: 'L', angle: -50, grip: 0.15 } } }, 2650, 'C 侧面 · 扛枪行走'],
  [{ view: 'side', costume: 'C', flip: true, expr: EX['怒'], pose: { shoulderR: 80, elbowR: 10 }, props: { spear: { hand: 'R', angle: 90, grip: 0.3, gourd: false } } }, 3300, 'C 侧面 · 平刺'],
];
b += `<clipPath id="poseclip"><rect x="40" y="${y}" width="${W - 80}" height="${prow}" rx="14"/></clipPath><g clip-path="url(#poseclip)">`;
for (const [o, x, lab] of poses) {
  b += lin({ ...o, height: PH, x, y: fy });
  b += T(x - 200, fy + 80, lab, 30);
}
b += '</g>';
y += prow + 40;

// ---- row 5: options
const OH = 900, orow = OH + 220;
b += panel(40, y, W - 80, orow);
b += T(70, y + 52, '选项: 囚服换色 col.robe + 团头铁叶枷 cangue + 金印 tattoo · 毡笠可摘 hat:false · headCloth plain', 34);
const oy = y + 110 + OH;
const opts = [
  [{ view: 'front', costume: 'A', col: { robe: '#3B4356' }, headCloth: 'plain', cangue: true, tattoo: 1, expr: EX['悲'] }, 400, '囚服 · 枷 (正)'],
  [{ view: 'side', costume: 'A', col: { robe: '#3B4356' }, headCloth: 'plain', cangue: true, tattoo: 1, expr: EX['隐忍'] }, 1000, '囚服 · 枷 (侧)'],
  [{ view: 'front', costume: 'A', col: { robe: '#2E3446' }, headCloth: 'plain', expr: EX['平静'] }, 1650, '梁山 (靛蓝)'],
  [{ view: 'front', costume: 'C', hat: false, expr: EX['平静'] }, 2350, 'C 摘笠'],
  [{ view: 'side', costume: 'A', expr: EX['平静'], pose: { headTilt: -8, shoulderL: -14, legL: 12, legR: -10 } }, 3050, 'A 侧面 · 低头 + 行走'],
  [{ view: 'front', costume: 'A', expr: EX['平静'], pose: { headTurn: 0.6, headTilt: 5, shoulderL: 25, elbowL: -40 } }, 3650, 'A 正面 · 转头 0.6'],
];
for (const [o, x, lab] of opts) {
  b += lin({ ...o, height: OH, x, y: oy });
  b += T(x - 160, oy + 70, lab, 28);
}
y += orow + 30;

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
