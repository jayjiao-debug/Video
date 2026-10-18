/* Gate 2a: three looks for 《两个生日》, two style frames each (hook + key visual). Everything drawn in code. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

const W = 1920, H = 1080;
type G = CanvasRenderingContext2D;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"';
const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; sh?: number } = {}) => {
  g.save(); g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = col;
  if (o.sh) { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = o.sh; } g.fillText(s, x, y); g.restore();
};
const sub = (g: G, s: string, dark = true) => {
  g.save(); g.font = `900 74px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round';
  g.lineWidth = 12; g.strokeStyle = dark ? '#000' : 'rgba(40,20,10,.95)'; g.strokeText(s, W / 2, H - 64); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 64); g.restore();
};
const mark = (g: G, col: string) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, col, { w: 500, a: 'right' });
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
/** a hand-drawn brush ring */
const brush = (g: G, x: number, y: number, rx: number, ry: number, col: string, w: number, s0 = 3) => {
  seed = s0; g.save(); g.strokeStyle = col; g.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) { g.lineWidth = w * (pass ? 0.55 : 1); g.globalAlpha = pass ? 0.6 : 0.92; g.beginPath(); const a0 = -2.2 + rnd() * 0.3, n = 70;
    for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI * 2 + 0.55), j = 1 + (rnd() - 0.5) * 0.05 + pass * 0.05; const px = x + Math.cos(t) * rx * j, py = y + Math.sin(t) * ry * j; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  g.restore();
};

/* October 2026: day, weekday, lunar label (computed with lunar-javascript 1.7.7) */
const OCT: [number, number, string][] = [[1,4,'廿一'],[2,5,'廿二'],[3,6,'廿三'],[4,0,'廿四'],[5,1,'廿五'],[6,2,'廿六'],[7,3,'廿七'],[8,4,'寒露'],[9,5,'廿九'],[10,6,'九月'],[11,0,'初二'],[12,1,'初三'],[13,2,'初四'],[14,3,'初五'],[15,4,'初六'],[16,5,'初七'],[17,6,'初八'],[18,0,'初九'],[19,1,'初十'],[20,2,'十一'],[21,3,'十二'],[22,4,'十三'],[23,5,'霜降'],[24,6,'十五'],[25,0,'十六'],[26,1,'十七'],[27,2,'十八'],[28,3,'十九'],[29,4,'二十'],[30,5,'廿一'],[31,6,'廿二']];
const cell = (d: number) => { const k = d - 1 + 4; return [k % 7, Math.floor(k / 7)]; };
/* born 2005-10-18 (九月十六): days between the lunar and the solar birthday, years 0..19 */
const GAP = [0, 19, 8, -4, 15, 5, -6, 12, 2, -9, 10, -2, 17, 6, -4, 14, 3, -7, 12, 0];

/* ================================================================ Look A · 老日历 (paper) */
const paperBg = (g: G) => {
  const b = g.createLinearGradient(0, 0, W, H); b.addColorStop(0, '#efe3c8'); b.addColorStop(1, '#d6bf96'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  const l = g.createRadialGradient(420, 120, 50, 420, 120, 1500); l.addColorStop(0, 'rgba(255,248,225,.55)'); l.addColorStop(1, 'rgba(120,80,40,.25)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
  seed = 5; for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '90,60,30' : '255,250,235'},${rnd() * 0.07})`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
};
const RED = '#b8261c', INK = '#2b2118', BLUE = '#2f5d8a';
const calPage = (g: G, x0: number, y0: number, w: number, h: number) => {
  g.save(); g.shadowColor = 'rgba(70,40,10,.35)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#fbf5e6'; g.fillRect(x0, y0, w, h); g.restore();
  g.fillStyle = RED; g.fillRect(x0, y0, w, 150);
  for (let i = 0; i < 9; i++) { g.fillStyle = '#7a1a12'; g.beginPath(); g.arc(x0 + 70 + i * (w - 140) / 8, y0 + 22, 7, 0, 7); g.fill(); }
  txt(g, '十月', x0 + 60, y0 + 118, 84, '#fff3dc', { f: SERIF, a: 'left' }); txt(g, '2026  丙午年', x0 + w - 50, y0 + 112, 38, '#ffe2b8', { f: SERIF, w: 700, a: 'right' });
  const gx = x0 + 30, gy = y0 + 190, cw = (w - 60) / 7, ch = (h - 230) / 5.4;
  '日一二三四五六'.split('').forEach((c, i) => txt(g, c, gx + cw * (i + 0.5), gy, 30, i === 0 || i === 6 ? RED : INK, { f: SERIF, w: 700 }));
  for (const [d, wd, lu] of OCT) { const [c, r] = cell(d), cx = gx + cw * (c + 0.5), cy = gy + 30 + ch * (r + 0.5);
    txt(g, String(d), cx, cy + 10, 62, wd === 0 || wd === 6 ? RED : INK, { f: SERIF }); txt(g, lu, cx, cy + 50, 24, lu.length === 2 && /[露降]/.test(lu) ? RED : 'rgba(43,33,24,.6)', { w: 500 }); }
  return { gx, gy, cw, ch };
};
const hookA = (g: G) => {
  paperBg(g);
  const { gx, gy, cw, ch } = calPage(g, 400, 70, 900, 870);
  const at = (d: number) => { const [c, r] = cell(d); return [gx + cw * (c + 0.5), gy + 30 + ch * (r + 0.5) + 14]; };
  const [ax, ay] = at(18), [bx, by] = at(25);
  brush(g, ax, ay, 66, 62, RED, 9, 4); brush(g, bx, by, 66, 62, BLUE, 9, 9);
  g.save(); g.strokeStyle = 'rgba(43,33,24,.75)'; g.lineWidth = 4; g.setLineDash([10, 10]); g.beginPath(); g.moveTo(ax - 75, ay + 10); g.quadraticCurveTo(ax - 170, (ay + by) / 2, bx - 75, by + 4); g.stroke(); g.restore();
  txt(g, '差 7 天', ax - 250, (ay + by) / 2 + 30, 40, INK, { f: SERIF });
  const tag = (x: number, y: number, s: string, col: string) => { g.save(); g.translate(x, y); g.rotate(-0.04); g.fillStyle = col; rrect(g, 0, 0, 250, 64, 8); g.fill(); txt(g, s, 125, 44, 32, '#fff6e6', { w: 900 }); g.restore(); };
  tag(110, ay - 60, '公历生日', RED); tag(110, by + 20, '农历 九月十六', BLUE);
  // quiz cards
  const q: [string, string][] = [['A', '12 年'], ['B', '19 年'], ['C', '60 年']];
  q.forEach(([k, v], i) => { const x = 1350, y = 250 + i * 190; g.save(); g.translate(x, y); g.rotate((i - 1) * 0.025); g.shadowColor = 'rgba(70,40,10,.3)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = '#fbf5e6'; rrect(g, 0, 0, 460, 150, 10); g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = RED; g.lineWidth = 4; rrect(g, 12, 12, 436, 126, 6); g.stroke(); g.fillStyle = RED; g.beginPath(); g.arc(85, 75, 46, 0, 7); g.fill(); txt(g, k, 85, 96, 58, '#fff3dc', { f: SERIF }); txt(g, v, 290, 102, 76, INK, { f: SERIF }); g.restore(); });
  txt(g, '多少年后重合？', 1580, 200, 48, INK, { f: SERIF });
  mark(g, 'rgba(60,40,20,.55)'); sub(g, '猜猜：多少年后它们会重合？', false);
};
const volvelle = (g: G, cx: number, cy: number, R: number, dark: boolean) => {
  // sun disc: 365 ticks, 12 months
  g.save(); g.shadowColor = dark ? 'rgba(0,0,0,.6)' : 'rgba(70,40,10,.35)'; g.shadowBlur = 40; g.shadowOffsetY = dark ? 0 : 16;
  g.fillStyle = dark ? 'rgba(20,30,60,.0)' : '#fbf5e6'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.restore();
  const SUN = dark ? 'rgba(255,214,140,' : 'rgba(184,38,28,', MOON = dark ? 'rgba(200,220,255,' : 'rgba(47,93,138,';
  g.strokeStyle = SUN + '1)'; g.lineWidth = dark ? 3 : 5; g.beginPath(); g.arc(cx, cy, R - 10, 0, 7); g.stroke();
  for (let i = 0; i < 365; i++) { const a = -Math.PI / 2 + (i / 365.2422) * Math.PI * 2, l = i % 30 === 0 ? 34 : i % 5 === 0 ? 20 : 11; g.strokeStyle = SUN + (i % 5 ? 0.45 : 0.9) + ')'; g.lineWidth = i % 30 ? 1.5 : 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14)); g.lineTo(cx + Math.cos(a) * (R - 14 - l), cy + Math.sin(a) * (R - 14 - l)); g.stroke(); }
  for (let m = 0; m < 12; m++) { const a = -Math.PI / 2 + ((m + 0.5) / 12) * Math.PI * 2; txt(g, `${m + 1}月`, cx + Math.cos(a) * (R - 78), cy + Math.sin(a) * (R - 78) + 12, 30, SUN + '0.9)', { f: SERIF, w: 700 }); }
  // moon disc
  const r2 = R * 0.6; g.fillStyle = dark ? 'rgba(30,45,90,.55)' : '#2f5d8a'; g.beginPath(); g.arc(cx, cy, r2, 0, 7); g.fill();
  if (dark) { g.strokeStyle = MOON + '0.9)'; g.lineWidth = 3; g.stroke(); }
  for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + (k / 12) * Math.PI * 2, px = cx + Math.cos(a) * (r2 - 52), py = cy + Math.sin(a) * (r2 - 52), ph = k / 12;
    g.fillStyle = dark ? 'rgba(20,28,55,1)' : '#1f3f60'; g.beginPath(); g.arc(px, py, 24, 0, 7); g.fill();
    { const k = Math.cos(2 * Math.PI * ph), r = 24; g.fillStyle = dark ? '#e8eefc' : '#f4ead2'; g.beginPath();
      if (ph <= 0.5) { g.arc(px, py, r, -Math.PI / 2, Math.PI / 2, false); g.ellipse(px, py, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0); }
      else { g.arc(px, py, r, Math.PI / 2, 1.5 * Math.PI, false); g.ellipse(px, py, Math.abs(k) * r, r, 0, 1.5 * Math.PI, Math.PI / 2, k > 0); }
      if (ph > 0) g.fill(); } }
  txt(g, '月', cx, cy + 34, 96, dark ? '#e8eefc' : '#f4ead2', { f: SERIF });
  // aligned pointers
  g.strokeStyle = SUN + '1)'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy - r2 - 8); g.lineTo(cx, cy - R - 26); g.stroke();
  if (dark) glow(g, cx, cy - R - 10, 140, '255,214,140', 0.6);
  g.fillStyle = SUN + '1)'; g.beginPath(); g.moveTo(cx - 20, cy - R - 26); g.lineTo(cx + 20, cy - R - 26); g.lineTo(cx, cy - R + 4); g.fill();
};
const counters = (g: G, x: number, y: number, ink: string, sunC: string, moonC: string, f: string) => {
  txt(g, '太阳 19 圈', x, y, 44, sunC, { f, a: 'left' }); txt(g, '6 939.60 天', x, y + 78, 72, ink, { f, a: 'left' });
  txt(g, '月亮 235 圈', x, y + 180, 44, moonC, { f, a: 'left' }); txt(g, '6 939.69 天', x, y + 258, 72, ink, { f, a: 'left' });
  txt(g, '只差 ≈ 2 小时', x, y + 370, 52, sunC, { f, a: 'left' });
  txt(g, '19 × 12 + 7 = 235', x, y + 440, 34, ink, { f, a: 'left', w: 500 });
};
const keyA = (g: G) => { paperBg(g); volvelle(g, 660, 500, 400, false); counters(g, 1200, 300, INK, RED, BLUE, SERIF); mark(g, 'rgba(60,40,20,.55)'); sub(g, '所以是19年，补7个闰月', false); };

/* ================================================================ Look B · 天文仪 (night brass) */
const nightBg = (g: G) => {
  const b = g.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, 1200); b.addColorStop(0, '#16224a'); b.addColorStop(1, '#04060f'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  seed = 7; for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(200,220,255,${rnd() * 0.45})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 1.6 + 0.3, 0, 7); g.fill(); }
};
const hookB = (g: G) => {
  nightBg(g);
  const x0 = 400, y0 = 110, w = 900, h = 800;
  g.save(); g.fillStyle = 'rgba(30,45,90,.35)'; rrect(g, x0, y0, w, h, 26); g.fill(); g.strokeStyle = 'rgba(255,214,140,.45)'; g.lineWidth = 2; g.stroke(); g.restore();
  txt(g, '2026 · 十月', x0 + 50, y0 + 90, 54, '#f3dca6', { f: SERIF, a: 'left' });
  const gx = x0 + 30, gy = y0 + 160, cw = (w - 60) / 7, ch = (h - 200) / 5.3;
  '日一二三四五六'.split('').forEach((c, i) => txt(g, c, gx + cw * (i + 0.5), gy, 26, 'rgba(200,215,255,.6)', { w: 500 }));
  const at = (d: number) => { const [c, r] = cell(d); return [gx + cw * (c + 0.5), gy + 26 + ch * (r + 0.5)]; };
  const [ax, ay] = at(18), [bx, by] = at(25);
  glow(g, ax, ay + 10, 150, '255,200,110', 0.55); glow(g, bx, by + 10, 150, '170,200,255', 0.55);
  for (const [d, , lu] of OCT) { const [cx, cy] = at(d); const hot = d === 18 || d === 25; txt(g, String(d), cx, cy + 14, 52, hot ? '#fff' : 'rgba(225,235,255,.75)', { w: 700 }); txt(g, lu, cx, cy + 50, 22, d === 25 ? '#cfe0ff' : 'rgba(200,215,255,.45)', { w: 500 }); }
  g.strokeStyle = 'rgba(255,214,140,.95)'; g.lineWidth = 4; g.beginPath(); g.arc(ax, ay + 10, 58, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(190,215,255,.95)'; g.beginPath(); g.arc(bx, by + 10, 58, 0, 7); g.stroke();
  txt(g, '公历生日', ax - 120, ay + 22, 34, '#ffd68c', { w: 900, a: 'right' }); txt(g, '农历生日', bx - 120, by + 22, 34, '#cfe0ff', { w: 900, a: 'right' });
  const q: [string, string][] = [['A', '12 年'], ['B', '19 年'], ['C', '60 年']];
  q.forEach(([k, v], i) => { const x = 1370, y = 260 + i * 180; g.save(); g.fillStyle = 'rgba(30,45,90,.45)'; rrect(g, x, y, 420, 140, 70); g.fill(); g.strokeStyle = 'rgba(255,214,140,.7)'; g.lineWidth = 3; g.stroke(); g.restore();
    txt(g, k, x + 72, y + 92, 60, '#ffd68c', { f: SERIF }); txt(g, v, x + 260, y + 96, 70, '#f3f6ff', { w: 900 }); });
  txt(g, '多少年后重合？', 1580, 210, 44, '#f3dca6', { f: SERIF });
  mark(g, 'rgba(243,237,226,.45)'); sub(g, '猜猜：多少年后它们会重合？');
};
const keyB = (g: G) => { nightBg(g); volvelle(g, 660, 520, 400, true); counters(g, 1200, 310, '#f3f6ff', '#ffd68c', '#cfe0ff', SANS); mark(g, 'rgba(243,237,226,.45)'); sub(g, '所以是19年，补7个闰月'); };

/* ================================================================ Look C · 手机日历 (flat, white) */
const flatBg = (g: G) => { g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, W, H); };
const OR = '#ff7a1a', RD = '#ff3b30', GR = '#1c1c1e';
const hookC = (g: G) => {
  flatBg(g);
  const x0 = 400, y0 = 70, w = 900, h = 860;
  g.save(); g.shadowColor = 'rgba(0,0,0,.12)'; g.shadowBlur = 50; g.shadowOffsetY = 20; g.fillStyle = '#fff'; rrect(g, x0, y0, w, h, 44); g.fill(); g.restore();
  txt(g, '2026年10月', x0 + 56, y0 + 100, 60, GR, { a: 'left' }); txt(g, '丙午马年', x0 + w - 56, y0 + 96, 32, '#8e8e93', { a: 'right', w: 500 });
  const gx = x0 + 30, gy = y0 + 170, cw = (w - 60) / 7, ch = (h - 210) / 5.3;
  '日一二三四五六'.split('').forEach((c, i) => txt(g, c, gx + cw * (i + 0.5), gy, 26, '#8e8e93', { w: 500 }));
  const at = (d: number) => { const [c, r] = cell(d); return [gx + cw * (c + 0.5), gy + 26 + ch * (r + 0.5)]; };
  const [ax, ay] = at(18), [bx, by] = at(25);
  g.fillStyle = RD; g.beginPath(); g.arc(ax, ay + 12, 54, 0, 7); g.fill(); g.fillStyle = OR; g.beginPath(); g.arc(bx, by + 12, 54, 0, 7); g.fill();
  for (const [d, wd, lu] of OCT) { const [cx, cy] = at(d); const hot = d === 18 || d === 25; txt(g, String(d), cx, cy + 16, 48, hot ? '#fff' : wd === 0 || wd === 6 ? '#8e8e93' : GR, { w: 700 }); txt(g, lu, cx, cy + 46, 20, hot ? 'rgba(255,255,255,.9)' : '#aeaeb2', { w: 500 }); }
  const chip = (x: number, y: number, s: string, col: string) => { g.fillStyle = col; rrect(g, x, y, 250, 60, 30); g.fill(); txt(g, s, x + 125, y + 41, 30, '#fff', { w: 900 }); };
  chip(110, ay - 18, '公历生日', RD); chip(110, by - 18, '农历生日', OR);
  // poll
  g.save(); g.shadowColor = 'rgba(0,0,0,.12)'; g.shadowBlur = 40; g.shadowOffsetY = 16; g.fillStyle = '#fff'; rrect(g, 1360, 170, 470, 640, 40); g.fill(); g.restore();
  txt(g, '多少年后重合？', 1595, 260, 44, GR);
  const q: [string, string][] = [['A', '12 年'], ['B', '19 年'], ['C', '60 年']];
  q.forEach(([k, v], i) => { const y = 320 + i * 150; g.fillStyle = '#f2f2f7'; rrect(g, 1400, y, 390, 116, 58); g.fill(); g.fillStyle = GR; g.beginPath(); g.arc(1460, y + 58, 38, 0, 7); g.fill(); txt(g, k, 1460, y + 76, 44, '#fff'); txt(g, v, 1640, y + 82, 62, GR); });
  mark(g, 'rgba(28,28,30,.45)'); sub(g, '猜猜：多少年后它们会重合？');
};
const keyC = (g: G) => {
  flatBg(g);
  const x0 = 140, y0 = 120, rowH = 38, sx = (d: number) => 760 + d * 22;
  txt(g, '你的农历生日，每年落在哪天', 140, 80, 40, GR, { a: 'left' });
  g.strokeStyle = 'rgba(255,59,48,.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx(0), y0 - 10); g.lineTo(sx(0), y0 + 19 * rowH + 20); g.stroke();
  GAP.forEach((d, k) => { const y = y0 + k * rowH + 14; txt(g, `${k} 岁`, x0 + 120, y + 12, 26, '#8e8e93', { a: 'right', w: 500 });
    g.fillStyle = '#e5e5ea'; g.fillRect(x0 + 150, y, 1100, 3);
    g.fillStyle = RD; g.beginPath(); g.arc(sx(0), y + 1, 11, 0, 7); g.fill();
    g.fillStyle = k === 19 ? RD : OR; g.beginPath(); g.arc(sx(d), y + 1, 13, 0, 7); g.fill();
    if (k === 19) { g.strokeStyle = GR; g.lineWidth = 4; g.beginPath(); g.arc(sx(d), y + 1, 26, 0, 7); g.stroke(); } });
  txt(g, '19 岁：又是同一天', sx(0) + 60, y0 + 19 * rowH + 26, 34, GR, { a: 'left' });
  g.save(); g.shadowColor = 'rgba(0,0,0,.12)'; g.shadowBlur = 40; g.fillStyle = '#fff'; rrect(g, 1400, 220, 440, 560, 40); g.fill(); g.restore();
  txt(g, '19 年', 1620, 340, 92, GR); txt(g, '= 235 个月', 1620, 420, 52, GR); txt(g, '19 × 12 + 7', 1620, 520, 44, '#8e8e93', { w: 700 }); txt(g, '7 个闰月', 1620, 600, 56, OR); txt(g, '只差 ≈ 2 小时', 1620, 700, 40, RD);
  mark(g, 'rgba(28,28,30,.45)'); sub(g, '所以是19年，补7个闰月');
};

export const LOOKS: { t: string; draw: (g: G) => void }[] = [
  { t: 'A 老日历 · 开头', draw: hookA }, { t: 'A 老日历 · 19年对齐', draw: keyA },
  { t: 'B 天文仪 · 开头', draw: hookB }, { t: 'B 天文仪 · 19年对齐', draw: keyB },
  { t: 'C 手机日历 · 开头', draw: hookC }, { t: 'C 手机日历 · 19年对齐', draw: keyC },
];

export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '你有两个生日公历农历猜多少年后它们会重合所以是补个闰月差天九月十六丙午年十月日一二三四五六太阳圈月亮只小时同一天岁每落在哪又马初廿寒露霜降八七十AB C☉☾◆·×=≈Juno VIBE知识大赏0123456789';
    Promise.all([`900 74px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`, `700 40px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); LOOKS[f].draw(g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
