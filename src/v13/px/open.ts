import { Easing } from 'remotion';
import { Buf, W, H, K0, K1, K2, K3, SKC, SKW, SHW, WD, BR, O, P0, P1, R, Y, C, ip, oc, ic, rnd, rng, bay, glyph, dialog, clockTime, panel, rmask, tint, maskOf, scan, cloud } from './core';
/* 《心流》 pixel film — the opening, shared with the teaser look: game → 02:47 → homework → split → 85% → sky title.
   Intro frames are fixed; the 85% page and the sky page read their frames from OT (set by the film). */
export const FREEZE = 76, LOOK = 78, SHOCK = 84, THINK1 = 86, G_END = 104;
export const HW0 = 104, SIGH = 122, LOOK2 = 138, FLIP = 144, THINK2 = 148, SPLIT = 172, ASK = 194;
export const OT = { TURN: 258, P2: 270, RISE: 348, HIT: 404, LINE: 418, BLEED: 498, BLEED_END: 564, OUT: 99999 };
/** night clock: 23:00 → 02:47, accelerating, 2-frame steps, freezes when he notices */
export const nightAt = (f: number) => { const st = Math.floor(Math.min(f, FREEZE) / 2) * 2; return 23 * 60 + Math.round(227 * ip(st, 8, FREEZE, 0, 1, Easing.in(Easing.quad))); };

export const sceneGame = (b: Buf, f: number) => {
  const p = (nightAt(f) - 23 * 60) / 227, live = f < FREEZE;
  b.rect(0, 0, W, H, K1);
  b.dither(0, 0, 20, H, K0, 0.5); b.dither(0, 196, W, 20, K0, 0.4);
  // window: star trails lengthen and city lights go out as the hours vanish
  const wx = 236, wy = 18, ww = 136, wh = 124;
  b.rect(wx - 3, wy - 3, ww + 6, wh + 6, K3); b.rect(wx, wy, ww, wh, K0);
  b.within(rmask(wx, wy, ww, wh), () => {
    b.dither(wx, wy + 56, ww, 68, K1, 0.5); b.dither(wx, wy + 92, ww, 32, K2, 0.35);
    const r = rng(9), px = wx + 24, py = wy + 10;
    for (let i = 0; i < 30; i++) {
      const rad = 10 + r() * 130, a0 = r() * Math.PI * 2, len = 0.04 + p * 0.95, steps = Math.max(1, Math.ceil(rad * len));
      for (let s = 0; s <= steps; s++) { const a = a0 + (len * s) / steps; b.set(px + rad * Math.cos(a), py + rad * Math.sin(a), s === steps ? P0 : s > steps * 0.6 ? P1 : K3); }
    }
    const mx = wx + 18 + p * 100, my = wy + 74 - Math.sin(p * Math.PI) * 50;
    b.disc(mx, my, 7, P0); b.disc(mx + 4, my - 3, 6, K0);
    const rc = rng(5);
    for (let i = 0; i < 9; i++) {
      const x = wx - 2 + i * 16, h = Math.round(18 + rc() * 38), top = wy + wh - h;
      b.rect(x, top, 14, h, K2);
      for (let row = top + 3; row < wy + wh - 2; row += 6) for (let c = 0; c < 3; c++) { const lit = rc() > 0.4, off = rc(); if (lit && off > p * 1.05) b.rect(x + 3 + c * 4, row, 2, 3, Y); }
    }
  });
  b.rect(wx + ww / 2 - 1, wy, 2, wh, K3);
  // clock (flashes red the moment it freezes)
  const t1 = clockTime(nightAt(f)), flash = f >= FREEZE && f < FREEZE + 3, bw = glyph(t1).w * 3 + 12;
  b.rect(14, 14, bw, 58, flash ? R : K0); b.text(t1, 20, 16, 3, P0); b.text('打游戏', 21, 55, 1, flash ? P0 : P1);
  // the gamer, face lit by the screen (camera = his monitor)
  const bob = live ? Math.floor(f / 5) % 2 : 0, hx = 150, hy = 124 + bob, shock = f >= SHOCK;
  b.poly([[84, 216], [90, 186], [112, 168], [188, 168], [210, 186], [216, 216]], K2);
  b.line(112, 168, 188, 168, K3); b.line(140, 170, 138, 186, P1); b.line(160, 170, 162, 186, P1);
  b.rect(138, 150 + bob, 24, 20, K3);
  b.ellipse(hx, hy - 10, 44, 38, K0);                                   // hair mass
  b.ellipse(hx, hy + 6, 37, 35, SKC);                                   // face
  tint(b, hx, hy + 6, 37, 35, SKC, K3, 0.5, (x, y) => x > hx + 24 || y > hy + 33);
  for (let i = 0; i < 6; i++) { const x0 = hx - 38 + i * 13; b.poly([[x0, hy - 30], [x0 + 15, hy - 30], [x0 + 9 + (i % 2) * 2, hy - 14 + (i % 3) * 2]], K0); }
  // headphones
  for (let a = Math.PI * 1.08; a <= Math.PI * 1.92; a += 0.02) b.rect(hx + 47 * Math.cos(a) - 1, hy - 8 + 47 * Math.sin(a) - 1, 4, 4, K3);
  for (const sx of [-1, 1]) { const cx = hx + sx * 44; b.rect(cx - 7, hy - 14, 14, 30, K0); b.rect(cx - 5, hy - 12, 10, 26, R); b.rect(cx - 5, hy - 12, 10, 2, P0); }
  // screen flicker on the face while he plays
  if (live) { const k = Math.floor(f / 3), fc = [C, R, Y, C][k % 4]; if (rnd(k * 3 + 1) > 0.3) tint(b, hx, hy + 6, 37, 35, SKC, fc, 1, (x, y) => ((x + 0.5 - hx) / 37) ** 2 + ((y + 0.5 - hy - 6) / 35) ** 2 > 0.8); }
  // eyes
  for (const sx of [-1, 1]) {
    const ex = hx + sx * 15, ey = hy + 2, eh = shock ? 6 : 4;
    b.rect(ex - 6, ey - eh, 12, eh * 2, P0);
    if (shock) b.rect(ex - 2, ey - 2, 2, 3, K0);
    else { const dx = f >= LOOK ? -3 : 0, dy = f >= LOOK ? -2 : 0; b.rect(ex - 2 + dx, ey - 2 + dy, 4, 5, K0); if (live) b.set(ex - 1 + (Math.floor(f / 3) % 2), ey - 1, C); }
    const by = shock ? ey - 12 : ey - 8;
    if (shock) b.line(ex - 6, by + 2, ex + 6, by, K0, 2);
    else b.line(ex - 6, by - (sx > 0 ? 0 : 3), ex + 6, by - (sx > 0 ? 3 : 0), K0, 2);   // focused frown
  }
  if (shock) { b.ellipse(hx, hy + 26, 4, 6, K0); b.rect(hx - 2, hy + 29, 4, 2, R); }
  else if (live) { b.rect(hx - 10, hy + 20, 20, 7, K0); b.rect(hx - 8, hy + 21, 16, 2, P0); b.rect(hx - 5, hy + 25, 10, 1, R); b.rect(hx - 12, hy + 18, 2, 2, K0); b.rect(hx + 10, hy + 18, 2, 2, K0); }
  else { b.line(hx - 6, hy + 24, hx + 5, hy + 24, K0); }
  if (shock) {
    const sy = hy - 14 + Math.min(12, Math.floor((f - SHOCK) / 3));
    b.rect(hx + 30, sy, 3, 5, P0); b.set(hx + 31, sy - 1, P0); b.set(hx + 33, sy + 2, C);
    b.line(hx + 40, hy - 46, hx + 48, hy - 56, P0); b.line(hx + 47, hy - 36, hx + 59, hy - 42, P0); b.line(hx + 28, hy - 52, hx + 31, hy - 63, P0);
  }
  // controller; thumbs mash while the game runs
  b.rect(116, 196, 68, 20, K3); b.rect(118, 198, 64, 18, K2);
  b.rect(127, 204, 9, 3, K0); b.rect(130, 201, 3, 9, K0);
  const m = live && Math.floor(f / 2) % 2 === 0;
  b.disc(166, 205, 2, m ? Y : R); b.disc(174, 201, 2, R);
  b.ellipse(132, 199 + (live && Math.floor(f / 3) % 2 ? 1 : 0), 7, 4, SKC); b.ellipse(169, 200 + (m ? 1 : 0), 7, 4, SKC);
};

export const sceneHW = (b: Buf, f: number) => {
  const hwMin = f >= FLIP ? 20 * 60 + 10 : 20 * 60;
  b.rect(0, 0, W, H, BR);
  for (let x = 0; x < W; x += 12) b.dither(x, 0, 1, 168, K0, 0.5);
  b.within(rmask(0, 0, W, 168), () => { tint(b, 300, 90, 150, 100, BR, O, 0.12); });
  // wall clock: second hand ticks once a second; hands jump when he finally looks
  const cx = 80, cy = 60;
  b.disc(cx, cy, 32, K0); b.disc(cx, cy, 29, P1);
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; b.line(cx + 23 * Math.cos(a), cy + 23 * Math.sin(a), cx + 26 * Math.cos(a), cy + 26 * Math.sin(a), K0, 2); }
  const mA = ((hwMin % 60) * 6 * Math.PI) / 180, hA = ((240 + (hwMin % 60) * 0.5) * Math.PI) / 180;
  const sec = 15 + (f >= HW0 + 4 ? 1 : 0) + (f >= HW0 + 34 ? 1 : 0) + (f >= FLIP ? 5 : 0), sA = (sec * 6 * Math.PI) / 180;
  b.line(cx, cy, cx + 21 * Math.sin(mA), cy - 21 * Math.cos(mA), K0, 2);
  b.line(cx, cy, cx + 14 * Math.sin(hA), cy - 14 * Math.cos(hA), K0, 3);
  b.line(cx, cy, cx + 25 * Math.sin(sA), cy - 25 * Math.cos(sA), R, 1);
  b.disc(cx, cy, 2, K0);
  const fl = f >= FLIP && f < FLIP + 3;
  b.rect(cx - 33, 100, 66, 30, fl ? R : K0); b.text(clockTime(hwMin), cx, 103, 2, fl ? P0 : Y, 'center');
  b.text('写作业', cx, 136, 1, P1, 'center');
  // desk, lamp and its light
  b.rect(0, 168, W, 48, WD); b.rect(0, 168, W, 2, O); b.dither(0, 196, W, 20, BR, 0.5);
  b.within(rmask(0, 0, W, H), () => { scan([[312, 84], [338, 74], [380, 168], [214, 168]], (x, y) => { if (bay(x, y) < 2) b.set(x, y, Y); }); });
  b.rect(346, 164, 22, 4, K0); b.line(356, 164, 344, 112, K0, 2); b.line(344, 112, 326, 74, K0, 2);
  b.poly([[302, 66], [330, 56], [338, 74], [312, 86]], K0); b.line(312, 85, 338, 75, Y, 2);
  b.poly([[262, 174], [338, 171], [343, 188], [256, 190]], P0);
  for (let k = 0; k < 3; k++) b.line(266, 178 + k * 4, 334, 175 + k * 4, P1);
  // the same kid, slumped, cheek on his hand
  const hx = 252, hy = 120, look = f >= LOOK2, blink = f >= 126 && f < 130;
  b.poly([[196, 216], [200, 178], [222, 160], [282, 160], [304, 178], [308, 216]], K2);
  tint(b, 290, 190, 30, 40, K2, O, 0.18);
  b.line(212, 170, 222, 136, K2, 10);
  b.ellipse(hx, hy - 10, 42, 36, K0);
  b.ellipse(hx + 2, hy + 6, 36, 33, SKW);
  tint(b, hx + 2, hy + 6, 36, 33, SKW, SHW, 0.5, (x, y) => x < hx - 22 || y > hy + 32);
  for (let i = 0; i < 6; i++) { const x0 = hx - 36 + i * 13; b.poly([[x0, hy - 28], [x0 + 15, hy - 28], [x0 + 6, hy - 10 + (i % 2) * 3]], K0); }
  b.ellipse(224, 130, 9, 12, SKW); for (let k = 0; k < 3; k++) b.line(217, 124 + k * 5, 222, 123 + k * 5, SHW);
  for (const sx of [-1, 1]) {
    const ex = hx + 2 + sx * 15, ey = hy + 6;
    if (blink) { b.line(ex - 5, ey, ex + 5, ey, K0); continue; }
    b.rect(ex - 5, ey - 1, 10, 4, P0);
    b.rect(ex - 2 + (look ? -3 : 0), ey + (look ? -1 : 0), 3, 3, K0);
    b.line(ex - 6, ey - 2, ex + 5, ey - 2, K0);                                   // heavy lids
    b.line(ex - 6, ey - 9, ex + 6, ey - (sx < 0 ? 8 : 10), K0);                   // tired brows
  }
  b.line(hx - 3, hy + 25, hx + 7, hy + 26, SHW, 2);
  // sigh
  if (f >= SIGH && f < SIGH + 18) { const k = f - SIGH; for (let y = -3; y <= 3; y++) for (let x = -5; x <= 5; x++) if (x * x / 25 + y * y / 9 <= 1 && bay(x, y) < 16 * (1 - k / 18) * 0.6) b.set(hx + 20 + k + x, hy + 24 - k + y, P1); }
  // pencil: idle tapping
  const tap = f < LOOK2 && f % 10 < 3 ? -3 : 0;
  b.ellipse(292, 172, 8, 6, SKW);
  b.line(294, 170 + tap, 308, 150 + tap, Y, 2); b.set(293, 172 + tap, K0); b.rect(307, 148 + tap, 2, 3, R);
};

const SL = [[8, 8], [196, 8], [184, 208], [8, 208]], SRP = [[202, 8], [376, 8], [376, 208], [190, 208]];
let splitMasks: Uint8Array[] | null = null;
export const sceneSplit = (b: Buf, f: number) => {
  if (!splitMasks) splitMasks = [maskOf(SL), maskOf(SRP)];
  b.rect(0, 0, W, H, P0);
  panel(b, SL, splitMasks[0], f, SPLIT, () => sceneGame(b, 100));
  panel(b, SRP, splitMasks[1], f, SPLIT + 5, () => sceneHW(b, 166));
  if (f >= SPLIT + 10) b.text('3小时47分', 98, 176 - (f < SPLIT + 12 ? 3 : 0), 2, P0, 'center', K0);
  if (f >= SPLIT + 16) b.text('10分钟', 284, 176 - (f < SPLIT + 18 ? 3 : 0), 2, P0, 'center', K0);
};

export const intro = (b: Buf, f: number) => {
  if (f < G_END) { sceneGame(b, f); dialog(b, 186, 150, ['已经02:47了？！'], f, THINK1, 1.2, 2); }
  else if (f < SPLIT) { sceneHW(b, f); dialog(b, 14, 152, ['才过了10分钟？'], f, THINK2, 1.2, 2); }
  else { sceneSplit(b, f); dialog(b, 136, 14, ['同一个脑子，', '为什么差这么多？'], f, ASK, 1.0); }
};

export const CX = 204, CY = 104;
export const page2 = (b: Buf, f: number, neg: boolean) => {
  b.rect(0, 0, W, H, P0);
  const r0 = f < OT.HIT ? ip(f, OT.RISE, OT.HIT, 180, 66, ic) : 66;
  const phase = f >= OT.HIT && f < OT.HIT + 3 ? f - OT.HIT : Math.floor(f / 3);
  const r = rng(21 + phase * 7), n = 110;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.03, wd = 0.002 + r() * (f >= OT.HIT ? 0.011 : 0.007), ri = r0 * (0.85 + r() * 0.5);
    b.poly([[CX + ri * Math.cos(a), CY + ri * Math.sin(a)], [CX + 420 * Math.cos(a - wd), CY + 420 * Math.sin(a - wd)], [CX + 420 * Math.cos(a + wd), CY + 420 * Math.sin(a + wd)]], K0);
  }
  b.ellipse(CX, CY, 86 * (r0 / 66) * 0.9, 60 * (r0 / 66) * 0.9, P0);
  for (let k = 0; k < 8; k++) b.dither(0, 152 + k * 8, W, 8, K0, k * 0.07);
  const stamp = f >= OT.HIT;
  if (!stamp && f >= OT.TURN + 24) {
    const num = 10 + Math.floor(rnd(Math.floor(f / 3) * 7 + 3) * 89);
    b.text(`${num}%`, CX, CY - 36, 6, ip(f, OT.RISE, OT.HIT, 0, 1, ic) < 0.55 ? P1 : K3, 'center');
  }
  if (stamp) {
    const k = f - OT.HIT, s = [10, 9, 9, 8, 8][k] ?? 7;
    const bob = f >= OT.LINE + 14 && f < OT.BLEED ? Math.floor(f / 8) % 2 : 0;
    b.text('85%', CX, CY - 6 * s + bob - 5, s, K0, 'center');
  }
  if (f >= OT.LINE) {
    const bx = 134, by = 141, bw = 140, bh = 7;
    b.rect(bx - 2, by - 2, bw + 4, bh + 4, K0); b.rect(bx, by, bw, bh, P0);
    for (let i = 1; i < 10; i++) b.rect(bx + i * 14, by + bh - 2, 1, 2, K3);
    const p = ip(f, OT.LINE, OT.LINE + 12, 0, 0.85, oc), fw = Math.floor((bw * p) / 2) * 2;
    b.rect(bx, by, fw, bh, R); b.dither(bx, by + bh - 2, fw, 2, K0, 0.3);
    const k = f - (OT.LINE + 12);
    if (k >= 0 && k < 9) { const e = k < 3 ? 2 : k < 6 ? 4 : 3; const sx = bx + fw, sy = by + 3; b.rect(sx - e, sy, 2 * e + 1, 1, k < 6 ? Y : P1); b.rect(sx, sy - e, 1, 2 * e + 1, k < 6 ? Y : P1); b.set(sx, sy, P0); }
  }
  if (f >= OT.LINE + 12) { // title plaque: opens from the centre as the bar lands, text flashes in
    const T = '学得最快的正确率', k = f - (OT.LINE + 12), pw = glyph(T).w * 2 + 36, ph = 32, py = 157;
    const w = Math.round((pw * Math.min(1, (k + 1) / 4)) / 2) * 2, x = Math.round(CX - w / 2);
    b.rect(x - 2, py - 2, w + 4, ph + 4, P0); b.rect(x, py, w, ph, K0);
    b.rect(x + 2, py + 2, w - 4, 1, P0); b.rect(x + 2, py + ph - 3, w - 4, 1, P0);
    b.rect(x, py, 5, ph, R); b.rect(x + w - 5, py, 5, ph, R);
    if (k >= 3) b.text(T, CX, py + 4, 2, k === 3 || k === 4 ? Y : P0, 'center');
  }
  if (f >= OT.LINE + 30) b.text('学习模型的结论·尚未在人身上实验', W - 6, H - 15, 1, K3, 'right', P0);
};

export const page3 = (b: Buf, f: number) => {
  b.rect(0, 0, W, H, P0);
  for (let k = 0; k < 10; k++) b.dither(0, k * 8, W, 8, P1, 0.5 * (1 - k / 10));
  const drift = ip(f, OT.BLEED, OT.OUT + 18, 0, 1);
  cloud(b, 84 + 6 * drift, 66, 0.9, 3);
  cloud(b, 300 + 4 * drift, 46, 0.7, 5);
  cloud(b, 250 + 9 * drift, 130, 1.2, 8);
  const t = f / 30;
  for (let k = 0; k < 7; k++) {
    const col = k === 3 ? R : k % 2 ? K3 : K0, kk = k * 0.7;
    let prev: number | null = null;
    for (let x = -1; x <= W; x++) {
      const u = (x + 16) / 420, yy = Math.round(158 - 112 * u + 14 * Math.sin(u * 6 + kk * 0.35 - t * 1.6) + k * 4);
      const a = prev === null ? yy : prev;
      for (let y = Math.min(a, yy); y <= Math.max(a, yy); y++) { b.set(x, y, col); if (k === 3) b.set(x, y + 1, col); }
      prev = yy;
    }
  }
  b.poly([[0, 186], [W, 180], [W, H], [0, H]], K0);
  b.line(0, 181, W, 175, K0);
  for (let i = 0; i < 25; i++) { const x = 4 + i * 16; b.line(x, 186 - i * 0.25, x, 177 - i * 0.25, K0); }
  b.poly([[60, 187], [60, 172], [63, 166], [73, 166], [76, 172], [76, 187]], K0); b.disc(68, 160, 5, K0);
  const fl = Math.floor(f / 6) % 2; b.rect(73, 167, 5, 2, R); b.rect(78, 167 + fl, 4, 2, R);
  if (f >= OT.BLEED_END - 12) { // vertical title plate: opens downward in 4 px steps
    const hh = Math.min(92, Math.floor((f - (OT.BLEED_END - 12)) * 1.5) * 8 + 8);
    b.rect(318, 26, 44, hh + 4, K0); b.rect(320, 28, 40, hh, P0); b.rect(322, 30, 36, 1, P1);
  }
  if (f >= OT.BLEED_END - 8) b.text('心', 340, 32 - (f < OT.BLEED_END - 6 ? 3 : 0), 3, K0, 'center');
  if (f >= OT.BLEED_END - 2) b.text('流', 340, 76 - (f < OT.BLEED_END ? 3 : 0), 3, K0, 'center');
  if (f >= OT.BLEED_END + 24) { const e = f < OT.BLEED_END + 26 ? 3 : 0; b.rect(327 - e, 128 - e, 26 + 2 * e, 16 + 2 * e, R); b.text('flow', 340, 129, 1, P0, 'center'); }
};
