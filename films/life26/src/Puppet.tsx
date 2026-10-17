/* 《生命平等吗？》 粉笔版 v3, re-skinned in the demo's look D (纸板手偶): the original cardboard stick puppets (public/cut, as they
   were before the review) over the soft-focus code-drawn backgrounds (public/bg). The cut, timing, lines (lines_v3.json) and every
   move are v3's; only how things are drawn changes. Subtitles sit on the full-frame picture over a soft dark fade, no black bar. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import RAW from './lines_v3.json';
import CUT from './cut.json';
import CUT2 from './cut2.json';
import { JUNO } from './brand/identity';
import { FontFaces, clamp, eio, eo, lerp, pr } from './kit';
import * as P from './puppets';

export const PUPPET_FRAMES = Math.round(188.8 * 30);
const TITLE = 42.42, END = 182.6;   // the title on the track's strongest hit (42.48), not 6 frames ahead of it
type G = CanvasRenderingContext2D;
type Pt = [number, number];
const INK = '#1d1915', WARM = '255,206,140', LIGHT = '255,240,214';

const LINES = (RAW as [number, number, string][]).map(([a, z, s], i, arr) => {
  const nxt = i + 1 < arr.length ? arr[i + 1][0] : END;
  return [a, Math.min(nxt - 0.12, z + 0.6), s] as [number, number, string];
});

/* ------------------------------------------------------------ the cardboard pieces (pre-rendered PNGs) and the backgrounds */
type A = { w: number; h: number; ax: number; ay: number; k: number };
const AS: Record<string, A> = {};
for (const [id, a] of Object.entries(CUT as Record<string, any>)) AS[id] = { ...a, k: 1 };
for (const [id, a] of Object.entries(CUT2 as Record<string, any>)) AS[id] = { ...a };
const IMG = new Map<string, HTMLImageElement>();
const BG_IDS = ['night', 'savanna', 'room', 'studio', 'pond', 'dusk', 'river'];
const loadImg = (src: string) => new Promise<HTMLImageElement>((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(im); im.src = src; });
const loadAll = () => Promise.all([
  ...Object.keys(AS).map((id) => loadImg(staticFile(`${(CUT2 as any)[id] ? 'cut2' : 'cut'}/${id}.png`)).then((im) => IMG.set(id, im))),
  ...Object.keys(AS).flatMap((id) => ['sh', 'rim', 'dk'].map((v) => loadImg(staticFile(`cut_${v}/${id}.png`)).then((im) => IMG.set(`${v}_${id}`, im)))),
  ...BG_IDS.map((id) => loadImg(staticFile(`bg2/${id}.jpg`)).then((im) => IMG.set('bg_' + id, im))),
]);

let NOW = 0;
const hash = (i: number, k = 0) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const backOut = (x: number) => { x = clamp(x); const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const glow = (g: G, x: number, y: number, r: number, a: number, col = WARM) => {
  if (a <= 0.002 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.45, `rgba(${col},${a * 0.38})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

/** a warm pool of light lying on the floor (an ellipse), so warmth lights the ground around a puppet instead of the air behind it */
const pool = (g: G, x: number, y: number, r: number, a: number, ry: number, col = WARM) => { if (a <= 0.002) return; g.save(); g.translate(x, y); g.scale(1, ry); glow(g, 0, 0, r, a, col); g.restore(); };
const SH_PAD = 90;
/** a cardboard puppet with its feet at (x, y), scale s (puppet units). p 0..1 brings it up from below the way a stick puppet comes on;
 *  warm 0..1 lights it from behind; sway = the hand holding the stick */
type CardOpt = { fade?: boolean; dark?: number };
const card = (g: G, id: string, x: number, y: number, s: number, p: number, o = 1, warm = 0, flip = false, sway = 1, opt: CardOpt = {}) => {
  const a = AS[id], im = IMG.get(id);
  if (!a || !im || o <= 0.002 || p <= 0) return;
  const k = clamp(p), sc = s / a.k, ph = (x * 0.013 + id.length * 1.7);
  // set pieces (opt.fade) are already on stage and fade in with their set; characters come up from below like a stick puppet
  const rise = opt.fade ? 0 : (1 - backOut(k)) * 420 * Math.max(0.5, s), al = o * clamp(opt.fade ? k : k * 3);
  if (warm > 0.02) glow(g, x, y - a.ay * sc * 0.5, Math.max(a.w, a.h) * sc * 0.5, 0.22 * warm * o, '255,186,100');
  const rot = sway * (0.022 * Math.sin(NOW * 2.1 + ph) + 0.01 * Math.sin(NOW * 3.7 + ph * 2)) * (1 - 0.5 * (1 - k));
  g.save(); g.translate(x, y + rise + sway * 4 * Math.sin(NOW * 2.6 + ph)); g.rotate(rot); if (flip) g.scale(-1, 1);
  const sh = IMG.get('sh_' + id), off = Math.max(0.5, s);
  if (sh) { g.globalAlpha = al; g.drawImage(sh, -(a.ax + SH_PAD) * sc + 22 * off, -(a.ay + SH_PAD) * sc + 30 * off, sh.width * sc, sh.height * sc); }
  g.globalAlpha = al; g.drawImage(im, -a.ax * sc, -a.ay * sc, a.w * sc, a.h * sc);
  const dk = IMG.get('dk_' + id); if (dk && (opt.dark ?? 0) > 0.01) { g.globalAlpha = al * clamp(opt.dark!); g.drawImage(dk, -a.ax * sc, -a.ay * sc, a.w * sc, a.h * sc); }
  const rim = IMG.get('rim_' + id); if (rim && warm > 0.05) { g.globalAlpha = al * 0.7 * clamp(warm); g.drawImage(rim, -a.ax * sc, -a.ay * sc, a.w * sc, a.h * sc); }
  g.restore();
};
/** the hand holding the stick goes still before a puppet dies (eased, not switched off) */
const still = (T: number, t: number) => 1 - eio(T, t - 0.3, 0.3);
/** where a puppet's head is (for hearts above it) */
const topOf = (id: string, y: number, s: number) => { const a = AS[id]; const sc = s / a.k; return y - (a.ay * sc) + 18 * s; };

/** a glowing line of light (rings, the boundary, the circle around the bat) */
const light = (g: G, pts: Pt[], p: number, w = 5, o = 1, col = WARM) => {
  if (p <= 0 || o <= 0) return;
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let use = p * L, acc = 0; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= use) { const kk = (use - acc) / d; g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * kk, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * kk); break; } g.lineTo(pts[i][0], pts[i][1]); acc += d; }
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = `rgba(${col},${0.16 * o})`; g.lineWidth = w * 4; g.stroke();
  g.strokeStyle = `rgba(${col},${0.35 * o})`; g.lineWidth = w * 2; g.stroke();
  g.strokeStyle = `rgba(255,246,228,${0.95 * o})`; g.lineWidth = w * 0.8; g.stroke();
};
const heartPts = (cx: number, cy: number, size: number): Pt[] => { const sc = size / 320, tip = cy + size * 0.45; return [...P.bez([0, 0], [-160, -110], [-120, -260], [0, -190], 24), ...P.bez([0, -190], [120, -260], [160, -110], [0, 0], 24)].map(([x, y]) => [cx + x * sc, tip + y * sc]); };
const path = (g: G, pts: Pt[]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
/** a cardboard heart (centre cx, cy) whose inside fills from the bottom with warm red to level k */
const heart = (g: G, cx: number, cy: number, size: number, k: number, p: number, o: number, halo = true) => {
  if (p <= 0 || o <= 0) return;
  const sz = size * (0.4 + 0.6 * backOut(clamp(p))), pts = heartPts(cx, cy, sz), top = cy - sz * 0.42, tip = cy + sz * 0.45;
  g.save(); g.globalAlpha = o * clamp(p * 3);
  if (halo && k > 0.3) glow(g, cx, cy, sz * 1.5 * k, 0.4 * k);
  g.save(); g.translate(sz * 0.03, sz * 0.045); path(g, pts); g.fillStyle = 'rgba(30,16,6,.38)'; g.fill(); g.restore();
  path(g, pts); g.fillStyle = '#ead4aa'; g.fill();
  if (k > 0.01) {
    g.save(); path(g, pts); g.clip();
    const lvl = tip - (tip - top) * k, gr = g.createLinearGradient(0, tip, 0, lvl); gr.addColorStop(0, '#d9473f'); gr.addColorStop(1, '#ee7a62');
    g.fillStyle = gr; g.fillRect(cx - sz, lvl, sz * 2, tip - lvl + 4);
    g.strokeStyle = 'rgba(255,220,190,.8)'; g.lineWidth = Math.max(2, sz / 45); g.beginPath(); g.moveTo(cx - sz, lvl); g.lineTo(cx + sz, lvl); g.stroke();
    g.restore();
  }
  path(g, pts); g.strokeStyle = INK; g.lineWidth = Math.max(3.5, sz / 26); g.lineJoin = 'round'; g.stroke();
  g.restore();
};

/* ------------------------------------------------------------ crumbling into flakes of the puppet's own cardboard */
type Dis = { id: string; x: number; y: number; s: number; hx: number; hy: number; hs: number; hk: number; th: number; t0: number; xmin: number; tin: number; din: number; warm: number; pts: [number, number, string][] };
const makeDis = (id: string, x: number, y: number, s: number, tin: number, din: number, warm: number, hx: number, hy: number, hs: number, hk: number, th: number, t0: number): Dis => {
  const pts: [number, number, string][] = [];
  const a = AS[id], im = IMG.get(id)!, sc = s / a.k;
  const x0 = Math.floor(x - a.ax * sc), y0 = Math.floor(y - a.ay * sc), w = Math.ceil(a.w * sc), h = Math.ceil(a.h * sc);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const t = c.getContext('2d')!;
  t.drawImage(im, x - a.ax * sc - x0, y - a.ay * sc - y0, a.w * sc, a.h * sc);
  const d = t.getImageData(0, 0, w, h).data, step = 5;
  for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) { const i = (yy * w + xx) * 4; if (d[i + 3] > 150) pts.push([x0 + xx, y0 + yy, `${d[i]},${d[i + 1]},${d[i + 2]}`]); }
  if (hs > 0) {
    const hp = heartPts(hx, hy, hs), path2 = new Path2D(); hp.forEach(([px, py], i) => (i ? path2.lineTo(px, py) : path2.moveTo(px, py))); path2.closePath();
    const top = hy - hs * 0.42, tip = hy + hs * 0.45, lvl = tip - (tip - top) * hk;
    for (let yy = hy - hs * 0.5; yy < tip; yy += 6) for (let xx = hx - hs * 0.6; xx < hx + hs * 0.6; xx += 6) if (t.isPointInPath(path2, xx, yy)) pts.push([xx, yy, yy > lvl ? '226,90,70' : '234,212,170']);
  }
  const xmin = Math.min(...pts.map((p) => p[0]));
  return { id, x, y, s, tin, din, warm, hx, hy, hs, hk, th, t0, xmin, pts };
};
let DIS: Dis[] = [];
let FLY_DIS: Dis, CAT_DIS: Dis, RHINO_DIS: Dis;
const ensureDis = () => {
  if (DIS.length) return;
  FLY_DIS = makeDis('fly', 1100, 820, 0.62, 17.2, 1.0, 0, 0, 0, 0, 0, 0, 20.0); CAT_DIS = makeDis('cat', 1040, 800, 0.9, 0.6, 0.8, 0, 0, 0, 0, 0, 0, 2.67); RHINO_DIS = makeDis('rhino', 940, 800, 1.05, 7.9, 2.8, 0, 0, 0, 0, 0, 0, 13.17);
  DIS = [
    makeDis('fly', 470, 780, 0.9, 22.5, 1.2, 0, 470, 545, 80, 0.04, 27.7, 35.0),
    makeDis('cat', 960, 790, 0.8, 23.0, 1.6, 0.45, 960, 420, 160, 0.55, 27.9, 36.6),
    makeDis('rhino', 1440, 790, 0.62, 23.5, 2.0, 0.8, 1440, 440, 250, 1.0, 28.1, 38.2),
  ];
};
const DIS_SPEED = 125, LIFE = 2.6;
const dustAt = (d: Dis, i: number, T: number, speed = DIS_SPEED) => {
  const [x, y] = d.pts[i];
  const tr = d.t0 + (x - d.xmin) / speed + hash(i) * 0.18, age = Math.max(0, T - tr);
  const h1 = hash(i, 1), h2 = hash(i, 2), e = Math.min(1, age / LIFE);
  return { px: x + age * (70 + 90 * h1) + 18 * Math.sin(age * 2.4 + h2 * 6), py: y - age * (40 + 70 * h2) - 25 * e * e, age, e, tr };
};
const crumble = (g: G, d: Dis, T: number, speed = DIS_SPEED, life = LIFE) => {
  for (let i = 0; i < d.pts.length; i++) {
    const q = dustAt(d, i, T, speed);
    if (T < q.tr || q.age > life) continue;
    const e = q.age / life, r = 3.2 * (1 - 0.5 * e), rot = hash(i, 5) * 6 + q.age * (2 + 3 * hash(i, 6));
    g.save(); g.translate(q.px, q.py); g.rotate(rot); g.fillStyle = `rgba(${d.pts[i][2]},${0.95 * (1 - e) * (1 - e)})`; g.fillRect(-r, -r * 0.7, 2 * r, 1.4 * r); g.restore();
  }
};
const clipFront = (g: G, f: number) => { if (f > -1e8) { g.beginPath(); g.rect(f, -300, 4000, 1800); g.clip(); } };

/* ------------------------------------------------------------ cardboard bubbles, name tags, text */
const TXT = new Map<string, HTMLCanvasElement>();
const text = (s: string, size: number, col: string, font: string, shadow = 0) => {
  const key = [s, size, col, font, shadow].join('|'); if (TXT.has(key)) return TXT.get(key)!;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 400; const g = c.getContext('2d')!;
  g.font = font.replace('SIZE', `${size}px`); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
  if (shadow) { g.shadowColor = col; g.shadowBlur = shadow; }
  g.fillText(s, 960, 200); TXT.set(key, c); return c;
};
const ZH = 'SIZE "Ma Shan Zheng"', LAT = 'SIZE "PatrickHand", "Ma Shan Zheng"', SANS = '700 SIZE "Noto Sans CJK SC"';
/** a cardboard label with the name, pinned on the speaker */
const tag = (g: G, s: string, x: number, y: number, o: number) => {
  if (!s || o <= 0) return;
  g.save(); g.globalAlpha = o; g.translate(x, y); g.rotate(-0.035);
  g.font = '38px "Ma Shan Zheng"'; const w = g.measureText(s).width + 40, h = 56;
  g.fillStyle = '#7d5d3a'; g.beginPath(); g.roundRect(-w / 2 + 4, -h / 2 + 5, w, h, 7); g.fill();
  g.fillStyle = '#ecd6ad'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 7); g.fill(); g.stroke();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 2);
  g.restore();
};
const person = (g: G, id: string, x: number, y: number, s: number, p: number, o: number, name: string) => {
  if (o <= 0) return;
  card(g, id, x, y, s, p, o);
  tag(g, name, x, y - 150 * s + (1 - backOut(clamp(p))) * 420 * Math.max(0.5, s), o * clamp((p - 0.6) / 0.4));
};
/** a cardboard speech bubble centred at (x, y), about w × h, its tail toward the speaker (side -1 = left) */
const bubble = (g: G, x: number, y: number, w: number, h: number, side: number, p: number, o: number, lines: string[], latin: boolean, size: number) => {
  if (p <= 0 || o <= 0) return;
  const cls = w <= 560 ? 's' : w <= 720 ? 'm' : w <= 940 ? 'l' : 'xl', hh = { s: 170, m: 210, l: 250, xl: 300 }[cls], id = `b_${cls}_${side < 0 ? 'l' : 'r'}`;
  const a = AS[id] ?? AS[`b_${cls}_l`], im = IMG.get(id) ?? IMG.get(`b_${cls}_l`);
  if (!a || !im) return;
  const k = backOut(clamp(p)), by = y + hh / 2;
  g.save(); g.globalAlpha = o * clamp(p * 3); g.translate(x + side * 120, by + 70); g.scale(k, k); g.rotate((side * -1.5 + Math.sin(NOW * 1.9) * 0.6) * Math.PI / 180); g.translate(-(x + side * 120), -(by + 70));
  g.drawImage(im, x - a.ax, by - a.ay, a.w, a.h);
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = (latin ? LAT : ZH).replace('SIZE', `${size}px`);
  const lh = size * 1.15; lines.forEach((l, i) => g.fillText(l, x, by - hh / 2 + (i - (lines.length - 1) / 2) * lh + 2));
  g.restore();
};

/* ------------------------------------------------------------ the title layer: v3's, gold letters the dust flies into */
let TL: { img: HTMLCanvasElement; snap: { d: number; i: number; tx: number; ty: number }[] } | null = null;
const TITLE_CHARS = ['生', '命', '平', '等', '吗', '？'];
const titleLayer = () => {
  if (TL) return TL;
  const size = 216, base = 760, adv = size * 0.9, qadv = size * 0.62, total = adv * 5 + qadv, x0 = 960 - total / 2;
  const paint = (t: CanvasRenderingContext2D, col: string, halo: boolean) => {
    t.textBaseline = 'alphabetic'; t.textAlign = 'center'; t.fillStyle = col;
    if (halo) { t.shadowColor = 'rgba(0,0,0,.75)'; t.shadowBlur = 30; t.shadowOffsetY = 8; }
    TITLE_CHARS.forEach((ch, i) => { const q = i === 5, fs = q ? size * 0.72 : size; t.font = `${fs}px "Ma Shan Zheng"`; const cx = x0 + (q ? adv * 5 + qadv / 2 : adv * i + adv / 2); t.save(); t.translate(cx, base - 34); t.rotate((hash(i, 9) - 0.5) * 0.06); t.fillText(ch, 0, 0); t.restore(); });
    t.shadowBlur = 0; t.shadowOffsetY = 0;
  };
  const img = document.createElement('canvas'); img.width = 1920; img.height = 1080; const c = img.getContext('2d')!;
  paint(c, JUNO.colors.gold, true); paint(c, '#ffe2a6', false);
  const solid = document.createElement('canvas'); solid.width = 1920; solid.height = 1080; const sc = solid.getContext('2d')!; paint(sc, '#fff', false);
  const px = sc.getImageData(0, 0, 1920, 1080).data, tg: Pt[] = [];
  for (let y = 380; y < 800; y += 5) for (let x = 200; x < 1720; x += 5) if (px[(y * 1920 + x) * 4 + 3] > 140) tg.push([x, y]);
  tg.sort((a, b) => a[0] - b[0]);
  const src: { d: number; i: number; x: number }[] = [];
  DIS.forEach((d, di) => d.pts.forEach((_, i) => { const q = dustAt(d, i, TITLE - 0.02); src.push({ d: di, i, x: q.px }); }));
  src.sort((a, b) => a.x - b.x);
  const snap = src.map((s0, j) => { const t = tg[Math.min(tg.length - 1, Math.floor(j * tg.length / src.length))]; return { d: s0.d, i: s0.i, tx: t[0] + (hash(j, 3) - 0.5) * 3, ty: t[1] + (hash(j, 4) - 0.5) * 3 }; });
  TL = { img, snap }; return TL;
};

/* ------------------------------------------------------------ backgrounds: one soft set per scene, crossfaded, a slow push */
const BGS: [string, number][] = [['night', 0], ['savanna', 5.6], ['room', 16.8], ['studio', 22.5], ['pond', 63.0], ['dusk', 71.1], ['studio', 81.1], ['river', 122.6], ['studio', 137.3], ['dusk', 146.2]];
const background = (g: G, T: number) => {
  let bi = 0; for (let i = 0; i < BGS.length; i++) if (T >= BGS[i][1]) bi = i;
  // a real dissolve (0.9 s, eased both ways); the outgoing set keeps its own push so nothing jumps
  const pushAt = (i: number, t: number) => 1 + 0.03 * clamp((t - BGS[i][1]) / 20);
  const at = (i: number, sc: number, a: number) => { const b = IMG.get('bg_' + BGS[i][0]); if (!b || a <= 0) return; g.save(); g.globalAlpha = a; g.translate(960, 560); g.scale(sc, sc); g.translate(-960, -560); g.drawImage(b, 0, 0, 1920, 1080); g.restore(); };
  const fadeIn = bi > 0 ? eio(T, BGS[bi][1], 0.9) : 1;
  if (bi > 0 && fadeIn < 1) at(bi - 1, pushAt(bi - 1, T), 1);
  at(bi, pushAt(bi, T), fadeIn);
};

/* ------------------------------------------------------------ the picture (v3, scene by scene) */
const fade = (T: number, a: number, z: number, fi = 0.6, fo = 0.6) => Math.min(eo(T, a, fi), 1 - pr(T, z - fo, fo));
const draw = (g: G, T: number) => {
  NOW = T; ensureDis();
  background(g, T);
  g.save(); g.translate(0, -45);

  // A · the cat under the lamp (0–5.6)
  const oA = fade(T, 0, 5.7, 0.01, 0.6);
  if (oA > 0) {
    const s = 1 + 0.025 * T; g.save(); g.translate(960, 600); g.scale(s, s); g.translate(-960, -600);
    glow(g, 910, 230, 260, 0.45 * eo(T, 1.0, 1.5) * oA);
    g.save(); g.globalAlpha = 0.24 * eo(T, 1.2, 1.6) * oA; const cone = g.createLinearGradient(0, 230, 0, 800); cone.addColorStop(0, 'rgba(255,206,140,.9)'); cone.addColorStop(1, 'rgba(255,206,140,0.15)'); g.fillStyle = cone; g.beginPath(); g.moveTo(880, 240); g.lineTo(940, 240); g.lineTo(1200, 800); g.lineTo(780, 800); g.closePath(); g.fill(); g.restore();
    pool(g, 1000, 835, 430, 0.36 * eo(T, 0.4, 1.4) * oA, 0.3);
    card(g, 'lamp', 780, 800, 0.9, eo(T, 0.0, 0.5), oA, 0, false, 0.4, { fade: true });
    // the cat: there with the first line; on "被车撞了" it breaks into flakes; "很多人会难过一整天" is read over the empty pool of light
    g.save(); clipFront(g, T < CAT_DIS.t0 ? -1e9 : CAT_DIS.xmin + (T - CAT_DIS.t0) * 330); card(g, 'cat', 1040, 800, 0.9, eo(T, 0.6, 0.8), oA, 0.15, false, still(T, 2.6)); g.restore();
    if (T >= CAT_DIS.t0) crumble(g, CAT_DIS, T, 330, 1.6);
    g.restore();
  }
  // B · Sudan (5.6–16.8)
  const oB = fade(T, 5.6, 16.8);
  if (oB > 0) {
    const s = 1 + 0.012 * (T - 5.6); g.save(); g.translate(960, 640); g.scale(s, s); g.translate(-960, -640);
    glow(g, 1610, 470, 300, 0.28 * eo(T, 5.8, 2.0) * oB); pool(g, 940, 812, 560, 0.22 * eo(T, 7.9, 1.5) * oB, 0.22);
    // Sudan: after his name he breaks into flakes; his name tag stays where he stood, and the world's small lights gather over the empty place
    const fR = T < RHINO_DIS.t0 ? -1e9 : RHINO_DIS.xmin + (T - RHINO_DIS.t0) * 500;
    g.save(); clipFront(g, fR); card(g, 'rhino', 940, 800, 1.05, eo(T, 7.9, 1.2), oB, 0.1, false, still(T, 13.1)); g.restore();
    const kn = eo(T, 11.5, 0.9), drop = eo(T, RHINO_DIS.t0 + (870 - RHINO_DIS.xmin) / 500, 0.35);
    if (kn > 0) { g.save(); g.beginPath(); g.rect(0, 0, 760 + 400 * kn, 1080); g.clip(); g.translate(930, 862 + 50 * drop); g.rotate(0.12 * drop); tag(g, 'Sudan', 0, 0, oB); g.restore(); }
    if (T >= RHINO_DIS.t0) crumble(g, RHINO_DIS, T, 500, 1.8);
    if (T > 14.2) { P.reseed(7); for (let i = 0; i < 70; i++) { const near = i % 2 === 0, x = near ? 600 + P.rand() * 700 : 80 + P.rand() * 1760, y = near ? 260 + P.rand() * 420 : 60 + P.rand() * 540, t0 = 14.3 + P.rand() * 1.6; const a = eo(T, t0, 0.6) * (0.55 + 0.45 * Math.sin(T * 3 + i)) * oB; glow(g, x, y, 14 + P.rand() * 18, 0.85 * a); } }
    g.restore();
  }
  // C · the fly on the sill (16.8–22.5)
  const oC = fade(T, 16.8, 22.5);
  if (oC > 0) {
    card(g, 'window', 960, 830, 0.82, eo(T, 16.8, 0.6), oC, 0, false, 0.3, { fade: true });
    const sh = Math.min(eo(T, 19.75, 0.2), 1 - pr(T, 20.05, 0.35));
    if (sh > 0) { const gr = g.createRadialGradient(1100, 790, 0, 1100, 790, 220); gr.addColorStop(0, `rgba(20,12,6,${0.5 * sh})`); gr.addColorStop(1, 'rgba(20,12,6,0)'); g.fillStyle = gr; g.fillRect(880, 570, 440, 440); }
    g.save(); clipFront(g, T < 20.0 ? -1e9 : FLY_DIS.xmin + (T - 20.0) * 260); card(g, 'fly', 1100, 820, 0.62, eo(T, 17.2, 0.8), oC, 0, false, T < 19.9 ? 1 : 0); g.restore();
    if (T >= 20.0) crumble(g, FLY_DIS, T, 260, 1.9);
  }
  // D · fly, cat, rhino, each with a heart that fills (22.5–34), then all three crumble left to right (34–40)
  const oD = fade(T, 22.5, 47.6, 0.6, 1.0);
  if (oD > 0) {
    const fillK = eo(T, 28.4, 2.4);
    for (const d of DIS) {
      const front = T < d.t0 ? -1e9 : d.xmin + (T - d.t0) * DIS_SPEED;
      const hk = d.hk * fillK, remain = front < -1e8 ? 1 : clamp((d.hx + d.hs * 0.5 - front) / d.hs);
      if (hk > 0.3) glow(g, d.hx, d.hy, d.hs * 1.5 * hk, 0.38 * hk * oD * remain);
      g.save(); clipFront(g, front);
      card(g, d.id, d.x, d.y, d.s, eo(T, d.tin, d.din * 0.7), oD, d.warm * fillK, false, 0, { fade: true });
      heart(g, d.hx, d.hy, d.hs, hk, eo(T, d.th, 0.6), oD, false);
      g.restore();
      if (T >= d.t0 && T < TITLE - 0.02) crumble(g, d, T);
    }
  }

  // M1 · the survey (47–63)
  const oM1 = fade(T, 47.0, 63.0, 0.6, 0.7);
  if (oM1 > 0) {
    const oR = fade(T, 47.0, 53.2, 0.6, 0.6);
    person(g, 'researcher', 300, 830, 0.78, eo(T, 47.1, 1.0), oR, '研究者 · 法国');
    bubble(g, 1060, 330, 800, 230, -1, eo(T, 47.6, 0.5), oR, ["Si vous ne pouviez en", "sauver qu'un, lequel ?"], true, 54);
    const row: [string, number, number, number][] = [['we', 330, 0.46, 1], ['dog', 600, 0.46, 0.8], ['bird', 860, 0.55, 0.6], ['frog', 1110, 0.55, 0.42], ['fish', 1370, 0.55, 0.26], ['fly', 1620, 0.62, 0.08]];
    const oL = eo(T, 53.0, 0.8) * oM1;
    if (oL > 0) {
      card(g, 'ruler', 1000, 922, 1.0, eo(T, 53.0, 0.6), oL, 0, false, 0.3, { fade: true });
      row.forEach(([id, x, sc, k], i) => {
        card(g, id, x, 825, sc, eo(T, 53.3 + i * 0.25, 0.8), oL, 0.7 * k * eo(T, 55.4, 1.5));
        heart(g, x, 470, 90, k * eo(T, 55.4 + i * 0.15, 1.6), eo(T, 54.4 + i * 0.2, 0.5), oL);
      });
    }
  }
  // M2 · 庄子 and 惠子 on the bridge (63–71)
  const oM2 = fade(T, 63.0, 71.2, 0.6, 0.6);
  if (oM2 > 0) {
    card(g, 'bridge', 960, 862, 1.0, eo(T, 63.0, 0.6), oM2, 0, false, 0.2, { fade: true });
    const FISH_SWIM: [number, number, number, number, boolean][] = [[520, 905, 0.36, 46, false], [1010, 930, 0.32, -38, true], [1340, 900, 0.3, 52, false], [760, 945, 0.28, -30, true]];
    FISH_SWIM.forEach(([x0, y0, sc, v, fl], i) => { const t = T - 63.0, x = x0 + v * t, y = y0 + 6 * Math.sin(t * 1.7 + i * 2); card(g, 'fish', x, y, sc, eo(T, 63.6 + i * 0.25, 0.8), oM2 * 0.95, 0.15, fl); });
    const lj = pr(T, 66.0, 1.1);
    if (lj > 0 && lj < 1) {
      const lx = lerp(880, 1100, lj), ly = 905 - 150 * Math.sin(lj * Math.PI);
      g.save(); g.translate(lx, ly); g.rotate(lerp(-0.7, 0.7, lj)); card(g, 'fish', 0, 0, 0.36, 1, oM2, 0.3, false, 0); g.restore();
      for (const [px, t0] of [[880, 66.0], [1100, 67.05]] as const) { const k = pr(T, t0, 0.9); if (k > 0 && k < 1) light(g, P.ell(px, 925, 30 + 70 * k, 8 + 14 * k, 0, Math.PI * 2, 40), 1, 2.5, oM2 * (1 - k), LIGHT); }
    }
    person(g, 'zhuang', 340, 790, 0.72, eo(T, 63.2, 1.0), oM2, '庄子');
    person(g, 'hui', 1580, 790, 0.72, eo(T, 63.5, 1.0), oM2, '惠子');
    bubble(g, 760, 330, 600, 230, -1, eo(T, 65.85, 0.5), oM2, ['儵鱼出游从容，', '是鱼之乐也。'], false, 56);
    bubble(g, 1180, 520, 560, 210, 1, eo(T, 68.07, 0.5), oM2, ['子非鱼，', '安知鱼之乐？'], false, 58);
  }
  // M3 · Nagel and the bat (71–82)
  const oM3 = fade(T, 71.1, 82.2, 0.6, 0.8);
  if (oM3 > 0) {
    person(g, 'nagel', 320, 830, 0.78, eo(T, 71.2, 1.0), oM3, '内格尔 · Nagel');
    bubble(g, 900, 300, 660, 220, -1, eo(T, 71.5, 0.5), oM3, ['What is it like', 'to be a bat?'], true, 62);
    const by = 600 + 10 * Math.sin(T * 2.2);
    card(g, 'bat', 1360, by, 1.0, eo(T, 72.2, 1.0), oM3, 0, false, 0.6);
    light(g, P.ell(1360, by - 120, 250, 210, -Math.PI / 2, Math.PI * 1.5, 90), eo(T, 75.2, 1.4), 5, oM3);
  }
  // M4 · where to draw the line (81–122.6)
  const ROW: [string, number, number][] = [['we', 640, 0.44], ['dog', 850, 0.44], ['chicken', 1060, 0.44], ['fish', 1270, 0.5], ['fly', 1460, 0.56], ['flower', 1650, 0.9]];
  const rowLife = (oR: number, bx: number, allWarm: number, t0: number) => {
    ROW.forEach(([id, x, sc], i) => {
      const inside = Math.max(allWarm, clamp((bx - x) / 40 + 0.5));
      card(g, id, x, 825, sc, eo(T, t0 + 0.2 + i * 0.25, 0.8), oR, 0.8 * inside, false, 1, { dark: 0.85 * (1 - inside) });
    });
  };
  const oM4 = fade(T, 81.1, 122.6, 0.7, 0.6);
  if (oM4 > 0) {
    const bx = T < 97.6 ? 745 : lerp(745, 1365, eio(T, 97.6, 1.4));
    const showB = T > 84.4 ? 1 : 0;
    rowLife(oM4, showB ? bx : -999, 0, 81.2);
    if (showB) light(g, Array.from({ length: 31 }, (_, i) => { const b = 380 + i * 500 / 30; return [bx + 3 * Math.sin(b / 40), b] as Pt; }), eo(T, 84.5, 0.9), 5, oM4);
    const oK = fade(T, 83.8, 97.0, 0.6, 0.5), oB = fade(T, 97.0, 105.3, 0.5, 0.5), oS = fade(T, 105.3, 122.6, 0.5, 0.6);
    person(g, 'kant', 250, 830, 0.72, eo(T, 83.9, 1.0), oK, '康德 · Kant');
    bubble(g, 900, 300, 940, 230, -1, eo(T, 84.2, 0.5), oK * (1 - pr(T, 90.9, 0.4)), ['Der Mensch existiert als', 'Zweck an sich selbst.'], true, 56);
    bubble(g, 900, 300, 980, 230, -1, eo(T, 91.3, 0.5), oK, ['Wer gegen Tiere grausam ist,', 'wird auch hart gegen Menschen.'], true, 50);
    person(g, 'bentham', 250, 830, 0.72, eo(T, 97.1, 1.0), oB, '边沁 · Bentham');
    bubble(g, 960, 300, 1180, 230, -1, eo(T, 99.4, 0.5), oB, ['The question is not, Can they reason?', 'nor, Can they talk? but, Can they suffer?'], true, 42);
    person(g, 'singer', 250, 830, 0.72, eo(T, 105.4, 1.0), oS, '辛格 · Singer');
    bubble(g, 860, 300, 720, 190, -1, eo(T, 105.7, 0.5), oS * (1 - pr(T, 111.3, 0.4)), ['All animals are equal.'], true, 58);
    bubble(g, 860, 300, 560, 190, -1, eo(T, 117.6, 0.5), oS, ['Speciesism.'], true, 66);
    if (T > 111.6) { const kk = eo(T, 112.0, 1.4); heart(g, 850, 600, 110, 0.75 * kk, eo(T, 111.7, 0.5), oS); heart(g, 1060, 600, 110, 0.75 * kk, eo(T, 111.9, 0.5), oS); }
  }
  // M5 · Schweitzer on the river (122.6–137.3)
  const oM5 = fade(T, 122.6, 137.4, 0.7, 0.7);
  if (oM5 > 0) {
    glow(g, 1500, 470, 380, 0.22 * oM5); pool(g, 960, 905, 600, 0.16 * oM5, 0.2);
    const dx = 120 * pr(T, 122.7, 14.7);
    person(g, 'schweitzer', 720 + dx, 800, 0.6, eo(T, 123.0, 1.0), oM5, '');
    card(g, 'boat', 900 + dx, 900, 0.85, eo(T, 122.6, 0.6), oM5, 0, false, 0.6, { fade: true });
    tag(g, '史怀哲 · Schweitzer', 720 + dx, 470, oM5 * eo(T, 124.0, 0.6));
    card(g, 'hippo', 300, 900, 0.7, eo(T, 125.8, 0.9), oM5, 0, false, 0.4); card(g, 'hippo', 1640, 910, 0.6, eo(T, 126.3, 0.9), oM5, 0, false, 0.4);
    bubble(g, 1240, 330, 680, 190, -1, eo(T, 129.2, 0.5), oM5 * (1 - pr(T, 131.6, 0.3)), ['Ehrfurcht vor dem Leben.'], true, 52);
    bubble(g, 1180, 330, 1000, 230, -1, eo(T, 131.9, 0.5), oM5, ['Ich bin Leben, das leben will,', 'inmitten von Leben, das leben will.'], true, 48);
  }
  // M6 · no ranking: the row again, every life warm (137.3–146.2)
  const oM6 = fade(T, 137.3, 146.2, 0.7, 0.6);
  if (oM6 > 0) { rowLife(oM6, 9999, eo(T, 137.8, 1.6), 137.3); person(g, 'schweitzer', 250, 830, 0.72, eo(T, 137.4, 1.0), oM6, '史怀哲 · Schweitzer'); }
  // M7 · Lecky: circles of kindness widening (146.3–163.2), then closing back in on us at the centre
  const oM7 = fade(T, 146.2, 163.25, 0.6, 0.05);
  if (oM7 > 0) {
    const oLk = fade(T, 146.2, 157.6, 0.5, 0.6);
    person(g, 'lecky', 250, 830, 0.72, eo(T, 146.3, 1.0), oLk, '莱基 · Lecky');
    bubble(g, 900, 300, 920, 230, -1, eo(T, 146.6, 0.5), oLk * (1 - pr(T, 152.9, 0.4)), ['…soon the circle expanding…', 'and finally, the animal world.'], true, 50);
    const k = eio(T, 159.6, 3.6), cx = lerp(1180, 960, k), cy = 700, ryk = lerp(0.5, 0.55, k);
    const rings: [number, number][] = [[150, 148.9], [300, 151.5], [460, 154.2]];
    rings.forEach(([r0, t0], i) => {
      const r = lerp(r0, 190, k), oi = i === 0 ? 1 : 1 - clamp((k - 0.55) / 0.45);
      glow(g, cx, cy + 40 * k, lerp(r0 * 1.1, 190 * 1.15, k), lerp(0.14, i === 0 ? 0.38 : 0, k) * eo(T, t0, 1.0) * oM7 * oi);
      light(g, P.ell(cx, cy, r, r * ryk, -Math.PI / 2, Math.PI * 1.5, 100), eo(T, t0, 1.2), lerp(4.5, 5.5, k), oM7 * oi * (1 - 0.3 * i / 3 * (1 - k)));
    });
    const fo = 1 - clamp(k * 1.6);
    card(g, 'we', lerp(1140, 960, k), lerp(760, 820, k), lerp(0.36, 0.6, k), eo(T, 148.9, 0.8), oM7, 0.6);
    card(g, 'we', cx + 40, 760, 0.3, eo(T, 149.2, 0.8), oM7 * fo, 0.6);
    card(g, 'researcher', cx - 200, 770, 0.3, eo(T, 151.6, 0.8), oM7 * fo, 0.4); card(g, 'singer', cx + 210, 770, 0.3, eo(T, 151.8, 0.8), oM7 * fo, 0.4); card(g, 'nagel', cx + 120, 640, 0.26, eo(T, 152.0, 0.8), oM7 * fo, 0.4);
    card(g, 'dog', cx - 390, 790, 0.34, eo(T, 154.4, 0.8), oM7 * fo, 0.3); card(g, 'cat', cx + 380, 790, 0.36, eo(T, 154.6, 0.8), oM7 * fo, 0.3); card(g, 'bird', cx + 300, 560, 0.4, eo(T, 154.8, 0.8), oM7 * fo, 0.3);
  }
  // E · the ending (163.2–182.6): us in a small circle, everyone else outside, dim; on the drop (168.40) it blasts open, every life
  //     lights up and gets a full heart
  const oE = fade(T, 163.2, END + 2.5, 0.01, 1.2);
  if (oE > 0) {
    const DROP = 168.40, td = T - DROP;
    const r = T < 167.2 ? 190 : T < DROP ? lerp(190, 225, eio(T, 167.2, DROP - 167.2)) : lerp(225, 1700, eo(T, DROP, 0.75)), cx = 960, cy = 700, ry = 0.55;
    const warmAll = eo(T, 177.3, 3.0), punch = td > 0 ? Math.exp(-td / 0.45) : 0;
    // before the drop the world outside the circle is in shadow; on the drop the shadow lifts
    const shade = 0.42 * (1 - eo(T, DROP, 0.5)) * oE;
    if (shade > 0) { g.save(); g.translate(0, 45); g.fillStyle = `rgba(8,8,16,${shade})`; g.fillRect(0, 0, 1920, 1080); g.restore(); }
    g.save(); g.translate(960, 640); g.scale(1 + 0.045 * punch, 1 + 0.045 * punch); g.translate(-960, -640);
    if (td < 0.3) glow(g, cx, cy + 40, Math.min(r * 1.15, 900), 0.38 * oE * (1 - clamp(td / 0.3)));
    if (td > 0) pool(g, 960, 800, 950, 0.3 * eo(T, DROP, 0.6) * oE, 0.36);
    if (td > 0) glow(g, cx, cy, 1500, 0.55 * Math.exp(-td / 0.6) * oE);
    if (r < 1600) light(g, P.ell(cx, cy, r, r * ry, -Math.PI / 2, Math.PI * 1.5, 140), 1, 5.5, oE * (td > 0 ? 1 - clamp(td / 0.8) : 1));
    if (td > 0 && td < 1.0) light(g, P.ell(cx, cy, r * 1.2 + 200 * td, (r * 1.2 + 200 * td) * ry, 0, Math.PI * 2, 140), 1, 9 * (1 - td), oE * (1 - td));
    const crowd: [string, number, number, number, number][] = [['cat', 640, 820, 0.55, 163.4], ['dog', 1290, 820, 0.5, 163.6], ['rhino', 1620, 830, 0.5, 163.8], ['chicken', 330, 830, 0.5, 164.0], ['fly', 470, 560, 0.55, 164.2], ['bird', 1470, 540, 0.55, 164.4], ['frog', 790, 580, 0.5, 164.6], ['fish', 1150, 540, 0.5, 164.8]];
    crowd.forEach(([id, x, y, s, t0], i) => {
      const d = Math.hypot((x - cx) / r, (y - 80 - cy) / (r * ry)), inside = clamp((1.1 - d) / 0.2);
      const warm = Math.max(inside * 0.85, warmAll * 0.9);
      card(g, id, x, y, s, eo(T, t0, 1.0), oE, warm, false, 1, { dark: 0.8 * (1 - inside) });
      if (td > 0) { const k = eo(T, DROP + 0.05 + i * 0.03, 0.35), hs = 78 * (0.6 + 0.4 * k + 0.25 * Math.exp(-Math.max(0, td - i * 0.03) / 0.18)); heart(g, x, topOf(id, y, s) - 46, hs, k, k, oE); }
    });
    card(g, 'we', 960, 820, 0.6, 1, oE, 0.6 + 0.4 * Math.max(warmAll, eo(T, DROP, 0.4)));
    if (td > 0) { const k = eo(T, DROP + 0.02, 0.35); heart(g, 960, topOf('we', 820, 0.6) - 50, 84 * (0.6 + 0.4 * k), k, k, oE); }
    if (td > 0) { P.reseed(3); for (let i = 0; i < 180; i++) { const a = P.rand() * Math.PI * 2, v = 80 + P.rand() * 900, rr = 2 + P.rand() * 3.5, t = clamp(td / 1.4); if (td > 1.4) break; const px = cx + Math.cos(a) * v * eo(td, 0, 1.2), py = cy + Math.sin(a) * v * eo(td, 0, 1.2) + 60 * td * td; g.fillStyle = `rgba(${WARM},${0.75 * (1 - t)})`; g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill(); } }
    g.restore();
  }
  g.restore();
  // the title on the hit: the three lives' cardboard flakes fly into gold letters
  if (T >= TITLE - 0.02 && T < 47.6) {
    const o = 1 - pr(T, 46.6, 0.9), t = T - TITLE + 0.02;
    g.fillStyle = `rgba(10,8,6,${0.5 * o * eo(t, 0, 0.3)})`; g.fillRect(0, 0, 1920, 1080);
    g.save(); g.translate(0, -45);
    glow(g, 960, 640, 820, 0.5 * Math.exp(-t / 0.5) * o);
    const tl = titleLayer();
    g.save(); g.globalAlpha = o * eo(t, 0.14, 0.34); g.drawImage(tl.img, 0, 0); g.restore();
    if (t < 0.75) {
      const k = 1 - Math.pow(1 - clamp(t / 0.3), 3), a = 0.95 * (1 - pr(t, 0.3, 0.4));
      for (const s0 of tl.snap) { const q = dustAt(DIS[s0.d], s0.i, TITLE - 0.02); const x = lerp(q.px, s0.tx, k), y = lerp(q.py, s0.ty, k); g.fillStyle = `rgba(${WARM},${a})`; g.fillRect(x - 1.8, y - 1.8, 3.6, 3.6); }
    }
    g.restore();
  }
  // the soft fade under the subtitles (instead of a black bar)
  const sg = g.createLinearGradient(0, 760, 0, 1080); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.55, 'rgba(0,0,0,.28)'); sg.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = sg; g.fillRect(0, 760, 1920, 320);
  // end card (v3's)
  if (T >= END) {
    const o = eo(T, END, 0.8);
    g.fillStyle = `rgba(10,9,8,${0.74 * o})`; g.fillRect(0, 0, 1920, 1080);
    g.save(); g.globalAlpha = o * eo(T, END + 0.3, 0.6); g.drawImage(text('生命平等吗？', 130, JUNO.colors.gold, ZH, 18), 0, 160); g.restore();
    g.save(); g.globalAlpha = o * eo(T, END + 0.9, 0.6); g.drawImage(text('你的圈，画到了哪里？评论区说说', 58, '#f2ecde', ZH), 0, 330); g.restore();
    light(g, [...P.ell(960, 690, 300, 46, Math.PI, Math.PI * 3, 90)], eo(T, END + 1.3, 1.0), 2.5, o);
    g.save(); g.globalAlpha = o * eo(T, END + 1.6, 0.5); g.drawImage(text(JUNO.follow, 34, JUNO.colors.gold, SANS), 0, 490); g.restore();
    g.save(); g.globalAlpha = o * eo(T, END + 2.0, 0.5); g.drawImage(text('资料：Miralles 等 2019 · 《庄子》· Nagel 1974 · Kant · Bentham 1789 · Singer 1975 · Schweitzer · Lecky 1869 · CBC 2018', 22, 'rgba(242,236,222,.8)', '400 SIZE "Noto Sans CJK SC"'), 0, 610); g.restore();
    g.save(); g.globalAlpha = o * eo(T, END + 2.2, 0.5); g.drawImage(text('音乐：Cry For Me (feat. 愛海) · MICHITA', 22, 'rgba(242,236,222,.8)', '400 SIZE "Noto Sans CJK SC"'), 0, 646); g.restore();
  }
};

const Cv: React.FC<{ T: number }> = ({ T }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => { const c = ref.current; if (c) draw(c.getContext('2d')!, T); }, [T]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }} />;
};

export const Puppet: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('fonts+images', { timeoutInMilliseconds: 120000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const zh = Array.from(new Set(LINES.map((l) => l[2]).join('') + '生命平等吗？你的圈，画到了哪里评论区说说关注一起看懂世界资料等庄子音乐研究者法国惠子内格尔康德边沁辛格史怀哲莱基儵鱼出游从容是之乐也子非安知—·')).join('');
    Promise.all([loadAll(), ...['40px "Ma Shan Zheng"', '40px "PatrickHand"', '700 40px "Noto Sans CJK SC"', '400 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, zh + 'SudanABCabc…').catch(() => null))])
      .then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      <style>{`@font-face { font-family: "PatrickHand"; src: url(${staticFile('fonts/patrick-hand-latin-400-normal.woff2')}) format("woff2"); }
        @font-face { font-family: "PatrickHand"; src: url(${staticFile('fonts/patrick-hand-latin-ext-400-normal.woff2')}) format("woff2"); unicode-range: U+0100-024F, U+1E00-1EFF; }`}</style>
      {ok && <>
        <Cv T={T} />
        {LINES.map(([a, z, t], i) => {
          const o = Math.min(eo(T, a, 0.2), 1 - pr(T, z - 0.18, 0.18));
          if (o <= 0) return null;
          const parts = t.split(/(\[[^\]]+\]|\{[^}]+\})/);
          return (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', opacity: o, transform: `translateY(${(1 - eo(T, a, 0.35)) * 8}px)`, fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 900, fontSize: 74, letterSpacing: '0.04em', color: '#fbf7ee', whiteSpace: 'nowrap',
              textShadow: '0 0 2px #000, 3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000, 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 4px 16px rgba(0,0,0,.8)' }}>
              {parts.map((x, j) => { const hl = x.startsWith('[') || x.startsWith('{'); return <span key={j} style={hl ? { color: x.startsWith('[') ? '#f6d58e' : '#ff8a7a' } : undefined}>{hl ? x.slice(1, -1) : x}</span>; })}
            </div>
          );
        })}
      </>}
    </AbsoluteFill>
  );
};
