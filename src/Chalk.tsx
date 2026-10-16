/* 《生命平等吗？》 look C · 暖夜粉笔: chalk drawings that draw themselves on a dark night board, one warm light.
   Sample cut: the cold open to the title (0–47 s) and the ending + end card (163–188.8 s). The drawings reuse the puppet
   ink (puppets.ts) through a recording context, replayed as chalk lines with a reveal. No canvas filters. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import RAW from './lines.json';
import { JUNO } from './brand/identity';
import { Canvas, FontFaces, clamp, eo, lerp, pr } from './kit';
import * as P from './puppets';
import { PUPPETS } from './Asset';

export const CHALK_FRAMES = Math.round(188.8 * 30);
const TITLE = 42.27, END = 182.6;
type G = CanvasRenderingContext2D;
type Pt = [number, number];
type Stroke = { pts: Pt[]; w: number; a: number; kind: 'line' | 'dot' | 'fill'; len: number };

const LINES = (RAW as [number, number, string][]).map(([a, z, s], i, arr) => {
  const nxt = i + 1 < arr.length ? arr[i + 1][0] : END;
  return [a, Math.min(nxt - 0.12, z + 0.6), s] as [number, number, string];
});

/* ------------------------------------------------------------ recording the puppet ink as polylines */
const CACHE = new Map<string, { strokes: Stroke[]; total: number }>();
const record = (id: string) => {
  if (CACHE.has(id)) return CACHE.get(id)!;
  P.reseed(id.split('').reduce((a, c) => a + c.charCodeAt(0), 7));
  const strokes: Stroke[] = [];
  let subs: Pt[][] = [], cur: Pt[] = [], dot: [number, number, number] | null = null;
  const rec: any = {
    lineWidth: 1, globalAlpha: 1, strokeStyle: '', fillStyle: '', lineCap: '', lineJoin: '',
    beginPath() { subs = []; cur = []; dot = null; },
    moveTo(x: number, y: number) { if (cur.length) subs.push(cur); cur = [[x, y]]; },
    lineTo(x: number, y: number) { cur.push([x, y]); },
    closePath() { if (cur.length) cur.push([cur[0][0], cur[0][1]]); },
    arc(x: number, y: number, r: number) { dot = [x, y, r]; },
    stroke() { for (const s of [...subs, cur]) if (s.length > 1) { let len = 0; for (let i = 1; i < s.length; i++) len += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); strokes.push({ pts: s.slice(), w: rec.lineWidth, a: rec.globalAlpha, kind: 'line', len }); } },
    fill() { if (dot) strokes.push({ pts: [[dot[0], dot[1]]], w: dot[2], a: 1, kind: 'dot', len: 4 }); else if (cur.length > 2) strokes.push({ pts: cur.slice(), w: 0, a: rec.globalAlpha, kind: 'fill', len: 10 }); },
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, fillRect() {},
  };
  PUPPETS[id]().ink(rec as G);
  // keep the main pass of each marker line (the faint second pass doubles as chalk texture, at low alpha)
  const total = strokes.reduce((a, s) => a + (s.a > 0.5 ? s.len : 0), 0) || 1;
  const out = { strokes, total };
  CACHE.set(id, out);
  return out;
};

const CHALK = '242,236,222', WARM = '255,206,140';
/** draw a recorded puppet as chalk at (x, y), scale s; `p` reveals it along its length; `warm` 0..1 tints it */
const chalkPuppet = (g: G, id: string, x: number, y: number, s: number, p: number, o = 1, warm = 0) => {
  if (o <= 0.002 || p <= 0) return;
  const { strokes, total } = record(id);
  const col = warm > 0 ? `${Math.round(lerp(242, 255, warm))},${Math.round(lerp(236, 206, warm))},${Math.round(lerp(222, 140, warm))}` : CHALK;
  let budget = p * total * 1.02, lastFull = true;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const st of strokes) {
    const main = st.a > 0.5;
    if (st.kind === 'dot') { if (budget <= 0) break; g.fillStyle = `rgba(${col},${0.85 * o})`; g.beginPath(); g.arc(st.pts[0][0], st.pts[0][1], st.w, 0, 7); g.fill(); continue; }
    if (st.kind === 'fill') { if (budget <= 0) break; g.fillStyle = `rgba(${col},${0.22 * o})`; g.beginPath(); st.pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); continue; }
    let use = st.len;
    if (main) { if (budget <= 0) break; use = Math.min(st.len, budget); lastFull = budget >= st.len; budget -= st.len; }
    else if (!lastFull) continue;
    // partial polyline
    g.beginPath(); let acc = 0; g.moveTo(st.pts[0][0], st.pts[0][1]);
    for (let i = 1; i < st.pts.length; i++) {
      const [ax, ay] = st.pts[i - 1], [bx, by] = st.pts[i], d = Math.hypot(bx - ax, by - ay);
      if (acc + d >= use) { const k = (use - acc) / d; g.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k); break; }
      g.lineTo(bx, by); acc += d;
    }
    const w = st.w * (main ? 0.85 : 0.7);
    g.setLineDash([]); g.strokeStyle = `rgba(${col},${(main ? 0.72 : 0.22) * o})`; g.lineWidth = w; g.stroke();
    if (main) { g.setLineDash([1.6, 3.2]); g.strokeStyle = `rgba(${col},${0.3 * o})`; g.lineWidth = w * 1.6; g.stroke(); g.setLineDash([]); }
  }
  g.restore();
};
const glow = (g: G, x: number, y: number, r: number, a: number, col = WARM) => {
  if (a <= 0.002 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.45, `rgba(${col},${a * 0.38})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};
const chalkLine = (g: G, pts: Pt[], p: number, w = 5, o = 1, col = CHALK) => {
  if (p <= 0 || o <= 0) return;
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let use = p * L, acc = 0; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= use) { const k = (use - acc) / d; g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k); break; } g.lineTo(pts[i][0], pts[i][1]); acc += d; }
  g.lineCap = 'round'; g.strokeStyle = `rgba(${col},${0.7 * o})`; g.lineWidth = w; g.stroke();
  g.setLineDash([1.6, 3.2]); g.strokeStyle = `rgba(${col},${0.28 * o})`; g.lineWidth = w * 1.7; g.stroke(); g.setLineDash([]);
};
const wobbly = (x0: number, y0: number, x1: number, y1: number, n = 40, amp = 3, seed = 1): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + amp * Math.sin(t * 13 + seed) * Math.sin(t * 5.3 + seed * 2)]; });

/** a chalk heart (tip at cx, cy + size*0.45) whose inside fills from the bottom with warm light to level k */
const chalkHeart = (g: G, cx: number, cy: number, size: number, k: number, p: number, o: number, halo = true) => {
  if (p <= 0 || o <= 0) return;
  const sc = size / 320, top = cy - size * 0.42, tip = cy + size * 0.45;
  const pts: Pt[] = [...P.bez([0, 0], [-160, -110], [-120, -260], [0, -190], 24), ...P.bez([0, -190], [120, -260], [160, -110], [0, 0], 24)].map(([x, y]) => [cx + x * sc, tip + y * sc * 1.0]);
  if (k > 0.01) {
    if (halo && k > 0.3) glow(g, cx, cy, size * 1.4 * k, 0.32 * k * o);
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    const lvl = tip - (tip - top) * k;
    const gr = g.createLinearGradient(0, tip, 0, lvl); gr.addColorStop(0, `rgba(${WARM},${0.85 * o})`); gr.addColorStop(1, `rgba(${WARM},${0.55 * o})`);
    g.fillStyle = gr; g.fillRect(cx - size, lvl, size * 2, tip - lvl + 4);
    g.strokeStyle = `rgba(255,236,200,${0.6 * o})`; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - size, lvl); g.lineTo(cx + size, lvl); g.stroke();
    g.restore();
  }
  chalkLine(g, pts, p, Math.max(4, size / 34), o, k > 0.3 ? WARM : CHALK);
};

/* ------------------------------------------------------------ crumbling into chalk dust */
const DIS_SPEED = 170;   // px/s, the same for all three
type Dis = { id: string; x: number; y: number; s: number; tin: number; din: number; warm: number; hx: number; hy: number; hs: number; hk: number; th: number; t0: number; xmin: number; pts: [number, number, boolean][] };
const hash = (i: number, k = 0) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const heartPts = (cx: number, cy: number, size: number): Pt[] => { const sc = size / 320, tip = cy + size * 0.45; return [...P.bez([0, 0], [-160, -110], [-120, -260], [0, -190], 24), ...P.bez([0, -190], [120, -260], [160, -110], [0, 0], 24)].map(([x, y]) => [cx + x * sc, tip + y * sc]); };
const makeDis = (id: string, x: number, y: number, s: number, tin: number, din: number, warm: number, hx: number, hy: number, hs: number, hk: number, th: number, t0: number): Dis => {
  const pts: [number, number, boolean][] = [];
  const walk = (poly: Pt[], step: number, warmPt: boolean) => { for (let i = 1; i < poly.length; i++) { const [ax, ay] = poly[i - 1], [bx, by] = poly[i], d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(d / step)); for (let k = 0; k < n; k++) pts.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n, warmPt]); } };
  for (const st of record(id).strokes) { if (st.a < 0.5) continue; if (st.kind === 'line') walk(st.pts.map(([a, b]) => [x + a * s, y + b * s] as Pt), 4, false); if (st.kind === 'dot') pts.push([x + st.pts[0][0] * s, y + st.pts[0][1] * s, false]); }
  const hp = heartPts(hx, hy, hs); walk(hp, 4, hk > 0.3);
  if (hk > 0.01) { const path = new Path2D(); hp.forEach(([a, b], i) => (i ? path.lineTo(a, b) : path.moveTo(a, b))); path.closePath(); const c = document.createElement('canvas').getContext('2d')!; const top = hy - hs * 0.42, tip = hy + hs * 0.45, lvl = tip - (tip - top) * hk; for (let yy = lvl; yy < tip; yy += 7) for (let xx = hx - hs; xx < hx + hs; xx += 7) if (c.isPointInPath(path, xx, yy)) pts.push([xx, yy, true]); }
  const xmin = Math.min(...pts.map((p) => p[0]));
  return { id, x, y, s, tin, din, warm, hx, hy, hs, hk, th, t0, xmin, pts };
};
let DIS: Dis[] = [];
const ensureDis = () => { if (DIS.length) return; DIS = [
  makeDis('fly', 470, 780, 0.9, 22.5, 1.2, 0, 470, 545, 80, 0.04, 27.7, 34.0),
  makeDis('cat', 960, 790, 0.8, 23.0, 1.6, 0.45, 960, 420, 160, 0.55, 27.9, 35.4),
  makeDis('rhino', 1440, 790, 0.62, 23.5, 2.0, 0.8, 1440, 440, 250, 1.0, 28.1, 36.9),
]; };
const crumble = (g: G, d: Dis, T: number) => {
  const LIFE = 2.4;
  d.pts.forEach(([x, y, warm], i) => {
    const tr = d.t0 + (x - d.xmin) / DIS_SPEED + hash(i) * 0.18;
    if (T < tr) return; const age = T - tr; if (age > LIFE) return;
    const h1 = hash(i, 1), h2 = hash(i, 2), e = age / LIFE;
    const px = x + age * (70 + 90 * h1) + 18 * Math.sin(age * 2.4 + h2 * 6), py = y - age * (40 + 70 * h2) - 25 * e * e;
    g.fillStyle = `rgba(${warm ? WARM : CHALK},${(warm ? 0.9 : 0.75) * (1 - e) * (1 - e)})`;
    const r = (warm ? 2.6 : 2.2) * (1 - 0.5 * e); g.fillRect(px - r, py - r, 2 * r, 2 * r);
  });
};

/* ------------------------------------------------------------ the board */
let BOARD: HTMLCanvasElement | null = null;
const board = () => {
  if (BOARD) return BOARD;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d')!;
  P.reseed(99);
  const gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#11151d'); gr.addColorStop(1, '#191d26'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 70; i++) { const x = P.rand() * 1920, y = P.rand() * 1080, r = 80 + P.rand() * 260; const s = g.createRadialGradient(x, y, 0, x, y, r); s.addColorStop(0, 'rgba(240,236,225,.035)'); s.addColorStop(1, 'rgba(240,236,225,0)'); g.fillStyle = s; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(240,236,225,${P.rand() * 0.06})`; g.fillRect(P.rand() * 1920, P.rand() * 1080, 1 + P.rand() * 1.5, 1 + P.rand() * 1.5); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(240,236,225,.025)'; g.lineWidth = 30 + P.rand() * 40; const x = P.rand() * 1920, y = P.rand() * 1080; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 200 + P.rand() * 300, y + (P.rand() - 0.5) * 60); g.stroke(); }
  const v = g.createRadialGradient(960, 520, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
  BOARD = c; return c;
};
/** the title in warm chalk: text eroded by specks, cached */
const TITLE_CACHE = new Map<string, HTMLCanvasElement>();
const chalkText = (s: string, size: number, col: string, font: string) => {
  const key = s + size + col; if (TITLE_CACHE.has(key)) return TITLE_CACHE.get(key)!;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 400; const g = c.getContext('2d')!;
  g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, 960, 200);
  P.reseed(s.length * 31);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(0,0,0,${0.25 + P.rand() * 0.6})`; g.fillRect(P.rand() * 1920, P.rand() * 400, 1 + P.rand() * 2.2, 1 + P.rand() * 1.6); }
  for (let i = 0; i < 180; i++) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.2; const x = P.rand() * 1920, y = P.rand() * 400; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + P.rand() * 60, y + (P.rand() - 0.5) * 8); g.stroke(); }
  TITLE_CACHE.set(key, c); return c;
};
const dust = (g: G, x: number, y: number, t: number, n = 40, col = CHALK) => {
  if (t < 0 || t > 1.4) return;
  P.reseed(Math.round(x + y));
  for (let i = 0; i < n; i++) { const a = P.rand() * Math.PI * 2, v = 80 + P.rand() * 380, r = 1.5 + P.rand() * 3.5; const px = x + Math.cos(a) * v * eo(t, 0, 1.2), py = y + Math.sin(a) * v * eo(t, 0, 1.2) + 60 * t * t; g.fillStyle = `rgba(${col},${0.7 * (1 - t / 1.4)})`; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }
};

/* ------------------------------------------------------------ the picture */
const fade = (T: number, a: number, z: number, fi = 0.6, fo = 0.6) => Math.min(eo(T, a, fi), 1 - pr(T, z - fo, fo));
const draw = (g: G, T: number) => {
  ensureDis();
  g.drawImage(board(), 0, 0);
  // camera: a slow push per scene
  // the whole picture sits a little higher so the bottom stays clear for the subtitles
  g.save(); g.translate(0, -45);

  // A · the cat under the lamp (0–5.6)
  const oA = fade(T, 0, 5.7, 0.01, 0.6);
  if (oA > 0) {
    const s = 1 + 0.025 * T; g.save(); g.translate(960, 600); g.scale(s, s); g.translate(-960, -600);
    glow(g, 910, 230, 260, 0.35 * eo(T, 1.0, 1.5) * oA);
    g.save(); g.globalAlpha = 0.22 * eo(T, 1.2, 1.6) * oA; const cone = g.createLinearGradient(0, 230, 0, 800); cone.addColorStop(0, 'rgba(255,206,140,.9)'); cone.addColorStop(1, 'rgba(255,206,140,0.15)'); g.fillStyle = cone; g.beginPath(); g.moveTo(880, 240); g.lineTo(940, 240); g.lineTo(1200, 800); g.lineTo(780, 800); g.closePath(); g.fill(); g.restore();
    glow(g, 1000, 800, 330, 0.28 * eo(T, 1.4, 1.6) * oA);
    chalkLine(g, wobbly(180, 802, 1740, 806, 60, 2, 1), eo(T, 0.1, 1.4), 5, oA);
    chalkPuppet(g, 'lamp', 780, 800, 0.9, eo(T, 0.3, 1.8), oA);
    chalkPuppet(g, 'cat', 1040, 800, 0.9, eo(T, 1.1, 2.0), oA, 0.15);
    g.restore();
  }
  // B · Sudan (5.6–16.8)
  const oB = fade(T, 5.6, 16.8);
  if (oB > 0) {
    const s = 1 + 0.012 * (T - 5.6); g.save(); g.translate(960, 640); g.scale(s, s); g.translate(-960, -640);
    glow(g, 1500, 760, 520, 0.4 * eo(T, 5.8, 2.0) * oB);
    chalkLine(g, wobbly(120, 760, 1800, 758, 70, 3, 2), eo(T, 5.7, 1.5), 4.5, oB);
    for (const [x, sc, t0] of [[340, 1, 6.2], [1640, 0.8, 6.6]] as const) {
      chalkLine(g, wobbly(x, 760, x + 6 * sc, 560 * 1 + (1 - sc) * 120, 10, 2, x), eo(T, t0, 0.8), 6, oB);
      chalkLine(g, [...P.ell(x, 560 + (1 - sc) * 120, 170 * sc, 34 * sc, Math.PI, Math.PI * 2, 30)], eo(T, t0 + 0.5, 0.9), 5, oB);
      chalkLine(g, wobbly(x - 170 * sc, 560 + (1 - sc) * 120, x + 170 * sc, 562 + (1 - sc) * 120, 20, 3, x + 1), eo(T, t0 + 0.9, 0.7), 4, oB);
    }
    chalkPuppet(g, 'rhino', 940, 800, 1.05, eo(T, 7.9, 2.8), oB, 0.1);
    // its name, written in chalk
    const nm = chalkText('Sudan', 90, `rgb(${CHALK})`, '"PatrickHand"');
    const kn = eo(T, 11.5, 0.9);
    if (kn > 0) { g.save(); g.globalAlpha = oB; g.beginPath(); g.rect(0, 0, 760 + 400 * kn, 1080); g.clip(); g.drawImage(nm, -40, 640); g.restore(); }
    // the world's attention: small warm lights blooming
    if (T > 13.6) { P.reseed(7); for (let i = 0; i < 70; i++) { const x = 80 + P.rand() * 1760, y = 60 + P.rand() * 540, t0 = 13.7 + P.rand() * 2.4; const a = eo(T, t0, 0.6) * (0.55 + 0.45 * Math.sin(T * 3 + i)) * oB; glow(g, x, y, 14 + P.rand() * 18, 0.8 * a); } }
    g.restore();
  }
  // C · the fly on the sill (16.8–22.5)
  const oC = fade(T, 16.8, 22.5);
  if (oC > 0) {
    glow(g, 960, 470, 420, 0.13 * oC, '170,195,240');
    chalkPuppet(g, 'window', 960, 830, 0.82, eo(T, 16.8, 1.4), oC);
    // the swat, kept quiet: a soft shadow passes over and the fly is simply rubbed out, leaving a faint smudge
    const sh = Math.min(eo(T, 19.75, 0.2), 1 - pr(T, 20.05, 0.35));
    if (sh > 0) { const gr = g.createRadialGradient(1100, 790, 0, 1100, 790, 200); gr.addColorStop(0, `rgba(4,6,10,${0.4 * sh})`); gr.addColorStop(1, 'rgba(4,6,10,0)'); g.fillStyle = gr; g.fillRect(900, 590, 400, 400); }
    const fo = 1 - pr(T, 20.0, 0.35);
    if (fo > 0) { const tw = T < 20.0 && Math.sin(T * 23) > 0.92 ? 3 : 0; chalkPuppet(g, 'fly', 1100 + tw, 820, 0.62, eo(T, 17.2, 1.0), oC * fo); }
    if (T > 20.0) { g.fillStyle = `rgba(${CHALK},${0.1 * oC * eo(T, 20.05, 0.4)})`; g.beginPath(); g.ellipse(1100, 795, 56, 20, -0.1, 0, 7); g.fill(); }
  }
  // D · fly, cat, rhino, each with a chalk heart that fills with warm light: how much we ache for it (22.5–34),
  //     then all three crumble into chalk dust, left to right at the same speed (34–40)
  const oD = fade(T, 22.5, 42, 0.6, 0.01);
  if (oD > 0) {
    const fillK = eo(T, 28.4, 2.4);
    chalkLine(g, wobbly(200, 792, 1720, 795, 60, 2, 4), eo(T, 22.6, 1.2), 4, oD * 0.8 * (1 - pr(T, 38.6, 2.0)));
    for (const d of DIS) {
      const front = T < d.t0 ? -1 : d.xmin + (T - d.t0) * DIS_SPEED;
      const hk = d.hk * fillK, remain = front < 0 ? 1 : clamp((d.hx + d.hs * 0.5 - front) / d.hs);
      if (hk > 0.3) glow(g, d.hx, d.hy, d.hs * 1.4 * hk, 0.32 * hk * oD * remain);
      g.save(); if (front > 0) { g.beginPath(); g.rect(front, -200, 3000, 1600); g.clip(); }
      chalkPuppet(g, d.id, d.x, d.y, d.s, eo(T, d.tin, d.din), oD, d.warm * fillK);
      chalkHeart(g, d.hx, d.hy, d.hs, hk, eo(T, d.th, 0.9), oD, false);
      g.restore();
      if (T >= d.t0) crumble(g, d, T);
    }
  }

  // E · the ending (163–182.6): a chalk circle around us; everyone outside is dim and cold. Then the circle grows,
  //     and whoever it reaches turns warm.
  const oE = fade(T, 163.0, END + 2.5, 0.8, 1.2);
  if (oE > 0) {
    const r = T < 167.1 ? 190 : lerp(190, 1300, eo(T, 167.1, 4.6)), cx = 960, cy = 700, ry = 0.55;
    const warmAll = eo(T, 177.3, 3.0);
    glow(g, cx, cy + 40, r * 1.15, 0.38 * oE);
    chalkLine(g, wobbly(160, 822, 1760, 826, 60, 2, 8), eo(T, 163.1, 1.5), 4, oE * 0.6);
    chalkLine(g, P.ell(cx, cy, r, r * ry, -Math.PI / 2, Math.PI * 1.5, 140), eo(T, 163.3, 1.4), 6, oE, WARM);
    chalkPuppet(g, 'we', 960, 820, 0.6, eo(T, 163.2, 1.8), oE, 0.6 + 0.4 * warmAll);
    const crowd: [string, number, number, number, number][] = [['cat', 640, 820, 0.55, 163.8], ['dog', 1290, 820, 0.5, 164.0], ['rhino', 1620, 830, 0.5, 164.2], ['chicken', 330, 830, 0.5, 164.4], ['fly', 470, 560, 0.55, 164.6], ['bird', 1470, 540, 0.55, 164.8], ['frog', 790, 580, 0.5, 165.0], ['fish', 1150, 540, 0.5, 165.2]];
    for (const [id, x, y, s, t0] of crowd) {
      const d = Math.hypot((x - cx) / r, (y - 80 - cy) / (r * ry)), inside = clamp((1.1 - d) / 0.2);
      const warm = Math.max(inside * 0.85, warmAll * 0.9, id === 'rhino' ? inside * eo(T, 169.7, 1.0) : 0);
      chalkPuppet(g, id, x, y, s, eo(T, t0, 1.8), oE * (0.3 + 0.7 * inside), warm);
    }
  }
  g.restore();
  // the title on the hit: light burst + chalk dust
  if (T >= TITLE - 0.05 && T < 47.6) {
    const o = 1 - pr(T, 46.6, 0.9), k = T >= TITLE - 0.02 ? 1 : 0;
    if (T >= TITLE - 0.02) glow(g, 960, 470, 760, 0.55 * Math.exp(-(T - TITLE) / 0.45) * o);
    const tt = chalkText('生命平等吗？', 170, JUNO.colors.gold, '"Ma Shan Zheng"');
    g.save(); g.globalAlpha = o * k; g.translate(960, 470); g.scale(1 + 0.008 * (T - TITLE), 1 + 0.008 * (T - TITLE)); g.drawImage(tt, -960, -200); g.restore();
    dust(g, 960, 470, T - TITLE + 0.02, 120, WARM);
  }
  // end card
  if (T >= END) {
    const o = eo(T, END, 0.8);
    g.fillStyle = `rgba(10,12,18,${0.62 * o})`; g.fillRect(0, 0, 1920, 1080);
    const tt = chalkText('生命平等吗？', 130, JUNO.colors.gold, '"Ma Shan Zheng"');
    g.save(); g.globalAlpha = o * eo(T, END + 0.3, 0.6); g.drawImage(tt, 0, 160); g.restore();
    const q = chalkText('你的圈，画到了哪里？评论区说说', 58, `rgb(${CHALK})`, '"Ma Shan Zheng"');
    g.save(); g.globalAlpha = o * eo(T, END + 0.9, 0.6); g.drawImage(q, 0, 330); g.restore();
    // the follow line inside a chalk ring drawn on
    chalkLine(g, [...P.ell(960, 690, 300, 46, Math.PI, Math.PI * 3, 90)], eo(T, END + 1.3, 1.0), 3.5, o, WARM);
    const fl = chalkText(JUNO.follow, 34, JUNO.colors.gold, '"Noto Sans CJK SC"');
    g.save(); g.globalAlpha = o * eo(T, END + 1.6, 0.5); g.drawImage(fl, 0, 490); g.restore();
    const src = chalkText('资料：Miralles 等 2019 · 《庄子》· Nagel 1974 · Kant · Bentham 1789 · Singer 1975 · Schweitzer · Lecky 1869 · CBC 2018', 22, `rgba(${CHALK},.8)`, '"Noto Sans CJK SC"');
    g.save(); g.globalAlpha = o * eo(T, END + 2.0, 0.5); g.drawImage(src, 0, 610); g.restore();
    const mu = chalkText('音乐：Cry For Me (feat. 愛海) · MICHITA', 22, `rgba(${CHALK},.8)`, '"Noto Sans CJK SC"');
    g.save(); g.globalAlpha = o * eo(T, END + 2.2, 0.5); g.drawImage(mu, 0, 646); g.restore();
  }
};

export const Chalk: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const zh = Array.from(new Set(LINES.map((l) => l[2]).join('') + '生命平等吗？你的圈，画到了哪里评论区说说关注一起看懂世界资料等庄子音乐VIBE知识大赏—·')).join('');
    Promise.all(['40px "Ma Shan Zheng"', '40px "PatrickHand"', '700 40px "Noto Sans CJK SC"', '400 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, zh + 'SudanABCabc').catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  const titleOn = T >= TITLE - 0.3 && T < 47.0, endOn = T >= END;
  return (
    <AbsoluteFill style={{ background: '#11151d' }}>
      <FontFaces />
      <style>{`@font-face { font-family: "PatrickHand"; src: url(${staticFile('fonts/patrick-hand-latin-400-normal.woff2')}) format("woff2"); }`}</style>
      {ok && <>
        <Canvas dep={f} draw={(g) => draw(g, T)} />
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
