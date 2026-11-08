// Line-up and two-shot sheets for the v4 cast.  node lineup.mjs <outdir>
//   lineup_v4.png  every character at the same scale (600 px = 1.80 m), front + 3/4, 林冲 (rig) on the first row.
//                  The side cast is traced like the rig and drawn with 林冲's face construction (same look);
//   twoshot_temple.png / twoshot_fanlou.png  林冲 leads by staging only: size, sharpness, light, place in frame.
import { createRequire } from 'module';
import fs from 'fs';
import { lin, EX } from '../../../chars/rig/linchong.mjs';
import * as gao from './gao.mjs';
import * as lu from './luqian.mjs';
import * as zh from './zhang.mjs';
import * as sc from './scribe.mjs';
import * as gd from './guard.mjs';
import * as wf from './wife.mjs';
import * as nt from './night.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] || '/dev/shm/shz01/cast';
fs.mkdirSync(out, { recursive: true });

const M = 600 / 1.8; // px per metre
const label = (x, y, t, s = 30) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Noto Sans CJK SC" font-size="${s}" font-weight="700" fill="#4a3f33">${t}</text>`;
const ROW = 820, W = 2700;
function lineup() {
  let s = `<rect width="${W}" height="${ROW * 5 + 120}" fill="#efe6d4"/>`;
  s += `<text x="60" y="70" font-family="Noto Sans CJK SC" font-size="40" font-weight="700" fill="#2A1C17">v4 角色统一表 · 同比例（600 px = 1.80 m）· 与林冲同一画风（同一描摹流程 + 林冲的脸部画法），主次只靠调度</text>`;
  const base = (r) => 120 + ROW * r + 690;
  const lc = { height: 1.8 * M };
  // row 0: 林冲
  let y = base(0);
  s += lin({ view: 'front', costume: 'A', expr: EX.平静, x: 260, y, ...lc }) + label(260, y + 70, '林冲 · 东京 正');
  s += lin({ view: 'side', costume: 'A', expr: EX.平静, x: 760, y, ...lc }) + label(760, y + 70, '林冲 · 东京 侧');
  s += lin({ view: 'front', costume: 'A', col: { robe: '#3B4356' }, headCloth: 'plain', cangue: true, tattoo: 1, expr: EX.隐忍, x: 1300, y, ...lc }) + label(1300, y + 70, '林冲 · 囚服戴枷 正');
  s += lin({ view: 'side', costume: 'A', col: { robe: '#3B4356' }, headCloth: 'plain', cangue: true, tattoo: 1, expr: EX.隐忍, x: 1850, y, flip: true, ...lc }) + label(1850, y + 70, '林冲 · 囚服戴枷 侧');
  s += lin({ view: 'front', costume: 'C', expr: EX.平静, x: 2400, y, ...lc }) + label(2400, y + 70, '林冲 · 沧州 毡笠');
  // row 1: 高衙内, 陆谦
  y = base(1);
  s += gao.draw({ view: 'front', x: 300, y, height: 1.7 * M }) + label(300, y + 70, '高衙内 正');
  s += gao.draw({ view: 'side', x: 760, y, height: 1.7 * M }) + label(760, y + 70, '高衙内 3/4');
  s += lu.draw({ view: 'front', x: 1500, y, height: 1.7 * M }) + label(1500, y + 70, '陆谦 正');
  s += lu.draw({ view: 'side', x: 1960, y, height: 1.7 * M }) + label(1960, y + 70, '陆谦 3/4');
  // row 2: 张教头, scribe
  y = base(2);
  s += zh.draw({ view: 'front', x: 300, y, height: 1.66 * M }) + label(300, y + 70, '张教头 正');
  s += zh.draw({ view: 'side', x: 760, y, height: 1.66 * M }) + label(760, y + 70, '张教头 3/4');
  s += sc.draw({ view: 'front', x: 1500, y, height: 1.68 * M }) + label(1500, y + 70, '代笔先生 正');
  s += sc.draw({ view: 'side', x: 1960, y, height: 1.68 * M }) + label(1960, y + 70, '代笔先生 3/4');
  // row 3: guard, wife
  y = base(3);
  s += gd.draw({ view: 'front', x: 300, y, height: 1.72 * M }) + label(300, y + 70, '公人 正');
  s += gd.draw({ view: 'side', x: 760, y, height: 1.72 * M }) + label(760, y + 70, '公人 3/4（走）');
  s += wf.draw({ view: 'back', x: 1500, y, height: 1.58 * M }) + label(1500, y + 70, '娘子 背（不露脸）');
  s += wf.draw({ view: 'back34', x: 1960, y, height: 1.58 * M }) + label(1960, y + 70, '娘子 3/4 背');
  // row 4: night silhouettes
  y = base(4);
  s += `<rect x="0" y="${120 + ROW * 4}" width="${W}" height="${ROW}" fill="#2a1d18"/>`;
  s += nt.draw({ who: 'chabo', pose: 'stand', x: 300, y, height: 1.7 * M, rim: '#FF8A3D', id: 'a' }) + label(300, y + 70, '差拨 剪影', 30).replace('#4a3f33', '#d8c6b0');
  s += nt.draw({ who: 'chabo', pose: 'fall', x: 860, y: y - 40, height: 1.7 * M, rim: '#FF8A3D', id: 'b' }) + label(860, y + 70, '差拨 倒').replace('#4a3f33', '#d8c6b0');
  s += nt.draw({ who: 'fuan', pose: 'run', x: 1500, y, height: 1.68 * M, rim: '#FF8A3D', flip: true, id: 'c' }) + label(1500, y + 70, '富安 逃').replace('#4a3f33', '#d8c6b0');
  s += nt.draw({ who: 'chabo', cap: 'scarf', pose: 'cower', x: 2150, y: y - 10, height: 1.7 * M, rim: '#FF8A3D', id: 'd' }) + label(2150, y + 70, '陆谦 雪地（夜）').replace('#4a3f33', '#d8c6b0');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${ROW * 5 + 120}">${s}</svg>`;
}

function twoshots() {
  const F = (inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="${bg}"/>${inner}</svg>`;
  // temple: 林冲 profile lead (left, large, sharp, lit), 高衙内 smaller mid-ground right, the wife soft between
  const t1 = `<defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe2c4"/><stop offset="1" stop-color="#d9c8a6"/></linearGradient>
    <filter id="tb3"><feGaussianBlur stdDeviation="3"/></filter><filter id="tdim"><feComponentTransfer><feFuncR type="linear" slope="0.86"/><feFuncG type="linear" slope="0.86"/><feFuncB type="linear" slope="0.88"/></feComponentTransfer></filter><filter id="tb8"><feGaussianBlur stdDeviation="8"/></filter></defs>
    <rect width="1920" height="1080" fill="url(#tsky)"/>
    <g filter="url(#tb8)" opacity="0.8"><rect x="80" y="0" width="70" height="1080" fill="#a8483a"/><rect x="1500" y="0" width="70" height="1080" fill="#a8483a"/><rect x="0" y="700" width="1920" height="380" fill="#c9b894"/></g>
    <g filter="url(#tb3)" opacity="0.92">${wf.draw({ view: 'back34', x: 1060, y: 1010, height: 1.58 * 520 / 1.8 })}</g>
    <g filter="url(#tdim)">${gao.draw({ view: 'side', x: 1350, y: 1180, height: 1.7 * 640 / 1.8, flip: false })}</g>
    ${lin({ view: 'side', costume: 'A', expr: EX.怒, flip: true, x: 640, y: 1480, height: 1150 })}
    <text x="40" y="60" font-family="Noto Sans CJK SC" font-size="28" fill="#5a4a3a">示例 1 · 岳庙：同一画风；林冲最大、最清楚、最亮；高衙内在中景、更小、略暗；娘子背影虚化</text>`;
  // 樊楼: 林冲 3/4 front lead (left, warm key), 陆谦 behind the table smaller and soft
  const t2 = `<defs><radialGradient id="lamp" cx="0.75" cy="0.25" r="0.6"><stop offset="0" stop-color="#f0b766"/><stop offset="1" stop-color="#5a3a2a"/></radialGradient>
    <filter id="fb2"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <rect width="1920" height="1080" fill="url(#lamp)"/>
    <g opacity="0.55"><rect x="1080" y="120" width="560" height="520" fill="#e8a858"/><path d="M1080 120 h560 v520 h-560z M1220 120 v520 M1360 120 v520 M1500 120 v520 M1080 290 h560 M1080 460 h560" stroke="#6b3a24" stroke-width="10" fill="none"/></g>
    <g filter="url(#fb2)">${lu.draw({ view: 'front', x: 1330, y: 1240, height: 1.7 * 760 / 1.8, expr: { mouth: 0.5, eye: 0.3 } })}</g>
    <rect x="860" y="760" width="1060" height="320" fill="#4a2e20"/><rect x="860" y="760" width="1060" height="18" fill="#6b4630"/>
    ${lin({ view: 'front', costume: 'A', expr: EX.平静, pose: { headTurn: 0.45 }, x: 560, y: 2350, height: 2000 })}
    <text x="40" y="60" font-family="Noto Sans CJK SC" font-size="28" fill="#f2dfc0">示例 2 · 樊楼：同一画风；林冲前景主光；陆谦在后、更小、略虚</text>`;
  return [F(t1, '#efe2c4'), F(t2, '#5a3a2a')];
}

const b = await chromium.launch();
const shot = async (svg, w, h, file) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<html><head><meta charset="utf-8"><style>body{margin:0}</style></head><body>${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: file });
  await p.close();
};
await shot(lineup(), W, ROW * 5 + 120, `${out}/lineup_v4.png`);
const [a, c] = twoshots();
await shot(a, 1920, 1080, `${out}/twoshot_temple.png`);
await shot(c, 1920, 1080, `${out}/twoshot_fanlou.png`);
await b.close();
console.log('ok', out);
