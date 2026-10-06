import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Easing, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';

/* 《心流》pixel-art teaser (19 s) — same beats as MangaTeaser so the two can be compared on the same mix.
   Everything is rasterised by hand into a 384×216 buffer (no anti-aliasing anywhere: scanline polygons,
   Bresenham lines, pixel discs, Bayer dithering, a thresholded 12 px bitmap font), then blown up ×5 with
   nearest-neighbour. Pixel-art equivalents of the manga recipes: panel pop = flash frame + fat border,
   sakuga counter = 3-frame steps, line boil = 2-frame idle bobs, page turn = 8 px block wipe,
   anime impact = palette negative + RGB split + whole-pixel shake, ink bleed = dithered noisy circle reveal. */
export const PX_FRAMES = 636;
const W = 384, H = 216, S = 5;
const FAM = 'FusionPixel';

const pack = (h: string) => { const n = parseInt(h.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255)) >>> 0; };
const K0 = pack('#0d0b14'), K1 = pack('#1b1f3b'), K2 = pack('#2e3566'), K3 = pack('#6a7392');
const SKC = pack('#a9c4e0'), SKW = pack('#f0b98c'), SHW = pack('#b9785a'), WD = pack('#7a4b33'), BR = pack('#3a2622'), O = pack('#d9822b');
const P0 = pack('#f4efe1'), P1 = pack('#cfc7b2'), R = pack('#e0312b'), Y = pack('#ffd25e'), C = pack('#5fd3e8');

const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const ip = (f: number, a: number, b: number, v0 = 0, v1 = 1, ease?: (t: number) => number) => interpolate(f, [a, b], [v0, v1], { ...cl, easing: ease });
const oc = Easing.out(Easing.cubic), ic = Easing.in(Easing.cubic), ioc = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const s = Math.sin(i * 127.3) * 43758.5453; return s - Math.floor(s); };
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

/* timeline (frames) — identical to MangaTeaser */
/* intro (hook): game frenzy → the clock catches him → silence + homework → side by side → the question */
const FREEZE = 76, LOOK = 78, SHOCK = 84, THINK1 = 86, G_END = 104;
const HW0 = 104, SIGH = 122, LOOK2 = 138, FLIP = 144, THINK2 = 148, SPLIT = 172, ASK = 194;
/* everything after the intro is the manga timeline shifted by +66 frames; the music drop stays on HIT */
const TURN = 226, P2 = 238, NARR2 = 246, RISE = 280, HIT = 336, LINE = 350, BLEED = 444, BLEED_END = 510, NARR3 = 536, OUT = 618;
export const TYPE_RATE = 0.7; // characters per frame in the dialog boxes

/* ---------- bitmap font ---------- */
type Glyph = { w: number; h: number; a: Uint8Array };
const gcache = new Map<string, Glyph>();
const glyph = (t: string): Glyph => {
  const hit = gcache.get(t); if (hit) return hit;
  const cv = document.createElement('canvas'); const ctx = cv.getContext('2d')!;
  ctx.font = `12px ${FAM}`; const w = Math.max(1, Math.ceil(ctx.measureText(t).width)); cv.width = w; cv.height = 12;
  ctx.font = `12px ${FAM}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, 0, 10);
  const im = ctx.getImageData(0, 0, w, 12).data; const a = new Uint8Array(w * 12);
  for (let i = 0; i < w * 12; i++) a[i] = im[i * 4 + 3] >= 110 ? 1 : 0;
  const g = { w, h: 12, a }; gcache.set(t, g); return g;
};

/* ---------- raster buffer ---------- */
class Buf {
  d = new Uint32Array(W * H);
  clip: Uint8Array | null = null;
  within(m: Uint8Array, fn: () => void) {
    const prev = this.clip; let c = m;
    if (prev) { c = new Uint8Array(W * H); for (let i = 0; i < c.length; i++) c[i] = prev[i] & m[i]; }
    this.clip = c; fn(); this.clip = prev;
  }
  set(x: number, y: number, c: number) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; if (this.clip && !this.clip[i]) return; this.d[i] = c; }
  get(x: number, y: number) { return x < 0 || y < 0 || x >= W || y >= H ? K0 : this.d[y * W + x]; }
  rect(x: number, y: number, w: number, h: number, c: number) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) this.set(i, j, c);
  }
  dither(x: number, y: number, w: number, h: number, c: number, level: number) {
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) if (bay(i, j) < level * 16) this.set(i, j, c);
  }
  poly(pts: number[][], c: number) { scan(pts, (x, y) => this.set(x, y, c)); }
  disc(cx: number, cy: number, r: number, c: number) {
    cx = Math.round(cx); cy = Math.round(cy); const rr = r * r + r * 0.6, ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++) for (let dx = -ri; dx <= ri; dx++) if (dx * dx + dy * dy <= rr) this.set(cx + dx, cy + dy, c);
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: number) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; if (u * u + v * v <= 1) this.set(x, y, c);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: number, w = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, o = Math.floor((w - 1) / 2);
    let err = dx + dy;
    for (;;) {
      for (let v = 0; v < w; v++) for (let u = 0; u < w; u++) this.set(x0 + u - o, y0 + v - o, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  blit(g: Glyph, x: number, y: number, s: number, c: number) {
    for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) if (g.a[j * g.w + i]) for (let v = 0; v < s; v++) for (let u = 0; u < s; u++) this.set(x + i * s + u, y + j * s + v, c);
  }
  text(t: string, x: number, y: number, s: number, c: number, align: 'left' | 'center' | 'right' = 'left', outline?: number) {
    const g = glyph(t); const w = g.w * s;
    const x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x), y0 = Math.round(y);
    if (outline !== undefined) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) this.blit(g, x0 + ox, y0 + oy, s, outline);
    this.blit(g, x0, y0, s, c);
  }
}
/** scanline fill (even-odd), pixel centres */
const scan = (pts: number[][], cb: (x: number, y: number) => void) => {
  let y0 = H, y1 = 0; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
    const yc = y + 0.5, xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); x++) cb(x, y);
  }
};
const maskOf = (pts: number[][]) => { const m = new Uint8Array(W * H); scan(pts, (x, y) => { m[y * W + x] = 1; }); return m; };
const outlinePoly = (b: Buf, pts: number[][], c: number, th: number) => { for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; b.line(p[0], p[1], q[0], q[1], c, th); } };
const grow = (pts: number[][], k: number) => { const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };

/** RPG dialog box: opens over 3 frames, types at TYPE_RATE chars/frame, blinking ▼ when done */
const dialog = (b: Buf, x: number, y: number, lines: string[], f: number, at: number, rate = TYPE_RATE, sc = 1) => {
  if (f < at) return;
  const pad = 6, lh = 12 * sc + 3;
  const w = Math.max(...lines.map((l) => glyph(l).w * sc)) + pad * 2 + 4, h = lines.length * lh + pad * 2 - 1;
  const open = Math.min(1, (f - at + 1) / 3), hh = Math.max(4, Math.round(h * open)), yy = y + Math.round((h - hh) / 2);
  b.rect(x - 1, yy - 1, w + 2, hh + 2, K0);
  b.rect(x + 1, yy + 1, w - 2, 1, P0); b.rect(x + 1, yy + hh - 2, w - 2, 1, P0); b.rect(x + 1, yy + 1, 1, hh - 2, P0); b.rect(x + w - 2, yy + 1, 1, hh - 2, P0);
  if (open < 1) return;
  let budget = Math.floor((f - at - 3) * rate);
  lines.forEach((l, i) => { const ch = [...l]; const n = Math.max(0, Math.min(ch.length, budget)); budget -= ch.length; if (n > 0) b.text(ch.slice(0, n).join(''), x + pad + 2, y + pad + 1 + i * lh, sc, P0); });
  if (budget >= 0 && Math.floor(f / 8) % 2 === 0) { const cx = x + w - 10, cy = y + h - 8; b.rect(cx, cy, 5, 1, R); b.rect(cx + 1, cy + 1, 3, 1, R); b.rect(cx + 2, cy + 2, 1, 1, R); }
};
const clockTime = (m: number) => { const h = Math.floor((((m % 1440) + 1440) % 1440) / 60), mm = Math.floor(((m % 60) + 60) % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

/* ---------- intro: the hook ---------- */
/** comic panel: one flash frame, then content with a fat border that settles */
const panel = (b: Buf, pts: number[][], m: Uint8Array, f: number, at: number, draw: () => void) => {
  if (f < at) return;
  const k = f - at;
  b.within(m, () => { if (k === 0) b.rect(0, 0, W, H, P0); else draw(); });
  outlinePoly(b, k === 0 ? grow(pts, 1.03) : k === 1 ? grow(pts, 1.012) : pts, K0, k < 2 ? 3 : 2);
};
const rectMask = new Map<string, Uint8Array>();
const rmask = (x: number, y: number, w: number, h: number) => { const k = `${x},${y},${w},${h}`; let m = rectMask.get(k); if (!m) { m = maskOf([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); rectMask.set(k, m); } return m; };
/** fill an ellipse but only over pixels currently equal to `only` */
const tint = (b: Buf, cx: number, cy: number, rx: number, ry: number, only: number, c: number, level: number, test?: (x: number, y: number) => boolean) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
    if (u * u + v * v <= 1 && b.get(x, y) === only && bay(x, y) < level * 16 && (!test || test(x, y))) b.set(x, y, c);
  }
};
/** night clock: 23:00 → 02:47, accelerating, 2-frame steps, freezes when he notices */
const nightAt = (f: number) => { const st = Math.floor(Math.min(f, FREEZE) / 2) * 2; return 23 * 60 + Math.round(227 * ip(st, 8, FREEZE, 0, 1, Easing.in(Easing.quad))); };

const sceneGame = (b: Buf, f: number) => {
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

const sceneHW = (b: Buf, f: number) => {
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
const sceneSplit = (b: Buf, f: number) => {
  if (!splitMasks) splitMasks = [maskOf(SL), maskOf(SRP)];
  b.rect(0, 0, W, H, P0);
  panel(b, SL, splitMasks[0], f, SPLIT, () => sceneGame(b, 100));
  panel(b, SRP, splitMasks[1], f, SPLIT + 5, () => sceneHW(b, 166));
  if (f >= SPLIT + 10) b.text('3小时47分', 98, 176 - (f < SPLIT + 12 ? 3 : 0), 2, P0, 'center', K0);
  if (f >= SPLIT + 16) b.text('10分钟', 284, 176 - (f < SPLIT + 18 ? 3 : 0), 2, P0, 'center', K0);
};

const intro = (b: Buf, f: number) => {
  if (f < G_END) { sceneGame(b, f); dialog(b, 186, 150, ['已经02:47了？！'], f, THINK1, 1.2, 2); }
  else if (f < SPLIT) { sceneHW(b, f); dialog(b, 14, 152, ['才过了10分钟？'], f, THINK2, 1.2, 2); }
  else { sceneSplit(b, f); dialog(b, 136, 14, ['同一个脑子，', '为什么差这么多？'], f, ASK, 1.0); }
};

/* ---------- page 2: build-up and the hit ---------- */
const CX = 204, CY = 104;
const page2 = (b: Buf, f: number, neg: boolean) => {
  b.rect(0, 0, W, H, P0);
  const r0 = f < HIT ? ip(f, RISE, HIT, 180, 66, ic) : 66;
  const phase = f >= HIT && f < HIT + 3 ? f - HIT : Math.floor(f / 3);
  const r = rng(21 + phase * 7), n = 110;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.03, wd = 0.002 + r() * (f >= HIT ? 0.011 : 0.007), ri = r0 * (0.85 + r() * 0.5);
    b.poly([[CX + ri * Math.cos(a), CY + ri * Math.sin(a)], [CX + 420 * Math.cos(a - wd), CY + 420 * Math.sin(a - wd)], [CX + 420 * Math.cos(a + wd), CY + 420 * Math.sin(a + wd)]], K0);
  }
  b.ellipse(CX, CY, 86 * (r0 / 66) * 0.9, 60 * (r0 / 66) * 0.9, P0);
  for (let k = 0; k < 8; k++) b.dither(0, 152 + k * 8, W, 8, K0, k * 0.07);
  const stamp = f >= HIT;
  if (!stamp && f >= NARR2 + 20) {
    const num = 10 + Math.floor(rnd(Math.floor(f / 3) * 7 + 3) * 89);
    b.text(`${num}%`, CX, CY - 36, 6, ip(f, RISE, HIT, 0, 1, ic) < 0.55 ? P1 : K3, 'center');
  }
  if (stamp) {
    const k = f - HIT, s = [10, 9, 9, 8, 8][k] ?? 7;
    const bob = f >= LINE + 14 && f < BLEED ? Math.floor(f / 8) % 2 : 0;
    b.text('85%', CX, CY - 6 * s + bob - 5, s, K0, 'center');
  }
  if (f >= LINE) {
    const bx = 134, by = 141, bw = 140, bh = 7;
    b.rect(bx - 2, by - 2, bw + 4, bh + 4, K0); b.rect(bx, by, bw, bh, P0);
    for (let i = 1; i < 10; i++) b.rect(bx + i * 14, by + bh - 2, 1, 2, K3);
    const p = ip(f, LINE, LINE + 12, 0, 0.85, oc), fw = Math.floor((bw * p) / 2) * 2;
    b.rect(bx, by, fw, bh, R); b.dither(bx, by + bh - 2, fw, 2, K0, 0.3);
    const k = f - (LINE + 12);
    if (k >= 0 && k < 9) { const e = k < 3 ? 2 : k < 6 ? 4 : 3; const sx = bx + fw, sy = by + 3; b.rect(sx - e, sy, 2 * e + 1, 1, k < 6 ? Y : P1); b.rect(sx, sy - e, 1, 2 * e + 1, k < 6 ? Y : P1); b.set(sx, sy, P0); }
  }
  if (f >= LINE + 12) { // title plaque: opens from the centre as the bar lands, text flashes in
    const T = '学得最快的正确率', k = f - (LINE + 12), pw = glyph(T).w * 2 + 36, ph = 32, py = 157;
    const w = Math.round((pw * Math.min(1, (k + 1) / 4)) / 2) * 2, x = Math.round(CX - w / 2);
    b.rect(x - 2, py - 2, w + 4, ph + 4, P0); b.rect(x, py, w, ph, K0);
    b.rect(x + 2, py + 2, w - 4, 1, P0); b.rect(x + 2, py + ph - 3, w - 4, 1, P0);
    b.rect(x, py, 5, ph, R); b.rect(x + w - 5, py, 5, ph, R);
    if (k >= 3) b.text(T, CX, py + 4, 2, k === 3 || k === 4 ? Y : P0, 'center');
  }
  if (!neg) dialog(b, 18, 18, ['2019年，几位科学家', '用数学模型算出——'], f, NARR2);
};

/* ---------- page 3: the flow sky ---------- */
const cloud = (b: Buf, x: number, y: number, s: number, seed: number) => {
  const r = rng(seed); const bl: number[][] = [];
  for (let i = 0; i < 9; i++) { const t = i / 8; bl.push([((t - 0.5) * 96 + (r() - 0.5) * 8) * s, -Math.sin(Math.PI * t) * 24 * (0.6 + r() * 0.5) * s, (11 + Math.sin(Math.PI * t) * 14 * (0.7 + r() * 0.4)) * s]); }
  const X = Math.floor(x), Yc = Math.floor(y);
  const inside = (dx: number, dy: number) => {
    if (Math.abs(dx) <= 51 * s && Math.abs(dy - s) <= 7 * s) return true;
    for (const [bx, by, br] of bl) if ((dx - bx) ** 2 + (dy - by) ** 2 <= br * br) return true;
    for (const ex of [-51 * s, 51 * s]) if ((dx - ex) ** 2 + (dy - s) ** 2 <= 49 * s * s) return true;
    return false;
  };
  const x0 = Math.floor(-62 * s), x1 = Math.ceil(62 * s), y0 = Math.floor(-50 * s), y1 = Math.ceil(10 * s);
  for (let dy = y0; dy <= y1; dy++) for (let dx = x0; dx <= x1; dx++) {
    const px = X + dx, py = Yc + dy;
    if (inside(dx, dy)) b.set(px, py, dy > 2 * s ? (bay(px, py) < 8 ? P1 : P0) : dy > -2 * s && bay(px, py) < 3 ? P1 : P0);
    else if (inside(dx + 1, dy) || inside(dx - 1, dy) || inside(dx, dy + 1) || inside(dx, dy - 1)) b.set(px, py, K0);
  }
};
const page3 = (b: Buf, f: number) => {
  b.rect(0, 0, W, H, P0);
  for (let k = 0; k < 10; k++) b.dither(0, k * 8, W, 8, P1, 0.5 * (1 - k / 10));
  const drift = ip(f, BLEED, OUT + 18, 0, 1);
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
  if (f >= BLEED_END - 12) { // vertical title plate: opens downward in 4 px steps
    const hh = Math.min(92, Math.floor((f - (BLEED_END - 12)) * 1.5) * 8 + 8);
    b.rect(318, 26, 44, hh + 4, K0); b.rect(320, 28, 40, hh, P0); b.rect(322, 30, 36, 1, P1);
  }
  if (f >= BLEED_END - 8) b.text('心', 340, 32 - (f < BLEED_END - 6 ? 3 : 0), 3, K0, 'center');
  if (f >= BLEED_END - 2) b.text('流', 340, 76 - (f < BLEED_END ? 3 : 0), 3, K0, 'center');
  if (f >= BLEED_END + 24) { const e = f < BLEED_END + 26 ? 3 : 0; b.rect(327 - e, 128 - e, 26 + 2 * e, 16 + 2 * e, R); b.text('flow', 340, 129, 1, P0, 'center'); }
  dialog(b, 18, 18, ['目标清楚，马上反馈，难度刚好——', '时间，就消失了。'], f, NARR3);
};

/* ---------- transitions + compositor ---------- */
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
  const h = (a: number, c: number) => rnd(a * 57.13 + c * 131.7 + 7);
  return (h(xi, yi) * (1 - sx) + h(xi + 1, yi) * sx) * (1 - sy) + (h(xi, yi + 1) * (1 - sx) + h(xi + 1, yi + 1) * sx) * sy;
};
const bufs = [new Buf(), new Buf()];
const compose = (f: number): Uint32Array => {
  const [A, B] = bufs;
  const impact = f >= HIT && f < HIT + 3;
  if (f < TURN) {
    intro(A, f);
    if (f < 6) { // CRT power-on: a bright line opens into the picture
      const hh = [0, 1, 4, 16, 44, 80][f];
      for (let y = 0; y < H; y++) { const d = Math.abs(y - 108); for (let x = 0; x < W; x++) if (d > hh) A.d[y * W + x] = K0; else if (f < 3 || d >= hh - 1) A.d[y * W + x] = P0; }
    }
  }
  else if (f < P2) {
    intro(A, f); page2(B, f, false);
    const tt = ip(f, TURN, P2, 0, 1, ioc);
    for (let cy = 0; cy < 27; cy++) for (let cx = 0; cx < 48; cx++) {
      const thr = (47 - cx + cy * 0.5) / (47 + 13);
      const mode = tt > thr ? 1 : tt > thr - 0.04 ? 2 : 0;
      if (!mode) continue;
      for (let y = cy * 8; y < cy * 8 + 8; y++) for (let x = cx * 8; x < cx * 8 + 8; x++) A.d[y * W + x] = mode === 1 ? B.d[y * W + x] : K0;
    }
  } else if (f < BLEED) {
    page2(A, f, impact);
    if (impact) {
      for (let i = 0; i < A.d.length; i++) A.d[i] = (A.d[i] & 0xff000000) | (~A.d[i] & 0x00ffffff);
      for (let i = 0; i < 30; i++) {
        const k = i * 13 + (f - HIT) * 101, ang = ((i + 0.5) / 30) * Math.PI * 2 + (rnd(k) - 0.5) * 0.22, rr = 60 + rnd(k + 1) * 44, hw = (7 + rnd(k + 2) * 16) / 1300;
        A.poly([[CX + Math.cos(ang) * rr, CY + Math.sin(ang) * rr], [CX + Math.cos(ang - hw) * 300, CY + Math.sin(ang - hw) * 300], [CX + Math.cos(ang + hw) * 300, CY + Math.sin(ang + hw) * 300]], i % 4 === 0 ? K0 : P0);
      }
    }
  } else if (f < BLEED_END + 2) {
    page2(A, f, false); page3(B, f);
    const Rr = ip(f, BLEED, BLEED_END - 4, 0, 340, Easing.out(Easing.quad));
    if (Rr > 0.5) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - CX, y - 112);
      const v = d / Rr + (bay(x, y) / 16 - 0.5) * 0.18 + (vnoise(x / 22 + f * 0.03, y / 22) - 0.5) * 0.35;
      if (v < 1) A.d[y * W + x] = B.d[y * W + x];
    }
  } else page3(A, f);
  return A.d;
};

export const PixelTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const big = useRef<HTMLCanvasElement>(null);
  const low = useRef<HTMLCanvasElement | null>(null);
  const [handle] = useState(() => delayRender('pixel font'));
  const [ready, setReady] = useState(false);
  const released = useRef(false);
  useEffect(() => {
    const ff = new FontFace(FAM, `url(${staticFile('fonts/fusion-pixel.ttf')})`);
    ff.load().then((l) => { document.fonts.add(l); setReady(true); }).catch((e) => cancelRender(e));
  }, []);
  useLayoutEffect(() => {
    if (!ready || !big.current) return;
    if (!low.current) { low.current = document.createElement('canvas'); low.current.width = W; low.current.height = H; }
    const src = compose(f);
    // whole-pixel shake after the hit, RGB split on the 3 negative frames, stepped fade at the end
    const since = f - (HIT + 3), env = since >= 0 ? 2.6 * Math.exp(-since / 2.4) : 0;
    const shx = Math.round(env * Math.sin(since * 3.7)), shy = Math.round(env * 0.7 * Math.sin(since * 5.1 + 0.9));
    const split = f >= HIT && f < HIT + 3, jy = (f - HIT) % 2 === 0 ? 1 : -1;
    const lv = Math.ceil((1 - ip(f, OUT, PX_FRAMES - 1)) * 4) / 4;
    const lctx = low.current.getContext('2d')!;
    const img = lctx.createImageData(W, H); const o = new Uint32Array(img.data.buffer);
    const at = (x: number, y: number) => { x = Math.min(W - 1, Math.max(0, x)); y = Math.min(H - 1, Math.max(0, y)); return src[y * W + x]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = x - shx, sy = y - shy;
      let c = sx < 0 || sy < 0 || sx >= W || sy >= H ? K0 : src[sy * W + sx];
      if (split) { const cr = at(x - 2, y - jy), cb = at(x + 2, y + jy); c = (c & 0xff00ff00) | (cr & 0xff) | (cb & 0xff0000); }
      if (lv < 1) { const r = Math.round((c & 255) * lv), g = Math.round(((c >> 8) & 255) * lv), bl = Math.round(((c >> 16) & 255) * lv); c = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0; }
      o[y * W + x] = c;
    }
    lctx.putImageData(img, 0, 0);
    const ctx = big.current.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(low.current, 0, 0, W * S, H * S);
    if (!released.current) { released.current = true; continueRender(handle); }
  }, [f, ready, handle]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <canvas ref={big} width={W * S} height={H * S} style={{ width: W * S, height: H * S }} />
    </AbsoluteFill>
  );
};
