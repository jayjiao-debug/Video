/* 《生命平等吗？》 look C · 暖夜粉笔: chalk drawings that draw themselves on a dark night board, one warm light.
   Sample cut: the cold open to the title (0–47 s) and the ending + end card (163–188.8 s). The drawings reuse the puppet
   ink (puppets.ts) through a recording context, replayed as chalk lines with a reveal. No canvas filters. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import RAW from './lines.json';
import { JUNO } from './brand/identity';
import { Canvas, FontFaces, clamp, eio, eo, lerp, pr } from './kit';
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
  const col = tint(warm);
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
    chalkStroke(g, col, st.w * 0.95 / Math.max(0.5, s), o, !main);
  }
  g.restore();
};
/** chalk grain: a tile of specks in the given colour, used as the stroke paint so every line breaks up like chalk */
const GRAIN = new Map<string, CanvasPattern>();
const grain = (g: G, col: string) => {
  const key = col; if (GRAIN.has(key)) return GRAIN.get(key)!;
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const t = c.getContext('2d')!;
  P.reseed(col.length * 13 + 5);
  for (let i = 0; i < 16000; i++) { t.fillStyle = `rgba(${col},${0.3 + P.rand() * 0.7})`; const w = 0.8 + P.rand() * 2.2; t.fillRect(P.rand() * 256, P.rand() * 256, w, 0.8 + P.rand() * 1.6); }
  for (let i = 0; i < 120; i++) { t.strokeStyle = `rgba(${col},.5)`; t.lineWidth = 0.8; const x = P.rand() * 256, y = P.rand() * 256; t.beginPath(); t.moveTo(x, y); t.lineTo(x + 6 + P.rand() * 10, y + (P.rand() - 0.5) * 2); t.stroke(); }
  const p = g.createPattern(c, 'repeat')!; GRAIN.set(key, p); return p;
};
const tint = (warm: number) => { const q = Math.round(clamp(warm) * 4) / 4; return `${Math.round(lerp(242, 255, q))},${Math.round(lerp(236, 206, q))},${Math.round(lerp(222, 140, q))}`; };
/** stroke the current path as chalk: a faint dust smear, a grainy body, a thin denser core */
const chalkStroke = (g: G, col: string, w: number, o: number, light = false) => {
  g.setLineDash([]); g.lineCap = 'round'; g.lineJoin = 'round';
  if (!light) { g.strokeStyle = `rgba(${col},${0.035 * o})`; g.lineWidth = w * 3.0; g.stroke(); }
  g.globalAlpha = (light ? 0.18 : 0.6) * o; g.strokeStyle = grain(g, col); g.lineWidth = w * (light ? 0.8 : 1.25); g.stroke(); g.globalAlpha = 1;
  if (!light) { g.strokeStyle = `rgba(${col},${0.62 * o})`; g.lineWidth = w * 0.75; g.stroke(); }
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
  chalkStroke(g, col, w, o);
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
const DIS_SPEED = 125;   // px/s, the same for all three
type Dis = { id: string; x: number; y: number; s: number; tin: number; din: number; warm: number; hx: number; hy: number; hs: number; hk: number; th: number; t0: number; xmin: number; pts: [number, number, boolean][] };
const hash = (i: number, k = 0) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const heartPts = (cx: number, cy: number, size: number): Pt[] => { const sc = size / 320, tip = cy + size * 0.45; return [...P.bez([0, 0], [-160, -110], [-120, -260], [0, -190], 24), ...P.bez([0, -190], [120, -260], [160, -110], [0, 0], 24)].map(([x, y]) => [cx + x * sc, tip + y * sc]); };
const makeDis = (id: string, x: number, y: number, s: number, tin: number, din: number, warm: number, hx: number, hy: number, hs: number, hk: number, th: number, t0: number): Dis => {
  const pts: [number, number, boolean][] = [];
  const walk = (poly: Pt[], step: number, warmPt: boolean) => { for (let i = 1; i < poly.length; i++) { const [ax, ay] = poly[i - 1], [bx, by] = poly[i], d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(d / step)); for (let k = 0; k < n; k++) pts.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n, warmPt]); } };
  for (const st of record(id).strokes) { if (st.a < 0.5) continue; if (st.kind === 'line') walk(st.pts.map(([a, b]) => [x + a * s, y + b * s] as Pt), 4, false); if (st.kind === 'dot') pts.push([x + st.pts[0][0] * s, y + st.pts[0][1] * s, false]); }
  const hp = hs > 0 ? heartPts(hx, hy, hs) : []; if (hs > 0) walk(hp, 4, hk > 0.3);
  if (hs > 0 && hk > 0.01) { const path = new Path2D(); hp.forEach(([a, b], i) => (i ? path.lineTo(a, b) : path.moveTo(a, b))); path.closePath(); const c = document.createElement('canvas').getContext('2d')!; const top = hy - hs * 0.42, tip = hy + hs * 0.45, lvl = tip - (tip - top) * hk; for (let yy = lvl; yy < tip; yy += 7) for (let xx = hx - hs; xx < hx + hs; xx += 7) if (c.isPointInPath(path, xx, yy)) pts.push([xx, yy, true]); }
  const xmin = Math.min(...pts.map((p) => p[0]));
  return { id, x, y, s, tin, din, warm, hx, hy, hs, hk, th, t0, xmin, pts };
};
let DIS: Dis[] = [];
let FLY_DIS: Dis;
const ensureDis = () => { if (DIS.length) return; FLY_DIS = makeDis('fly', 1100, 820, 0.62, 17.2, 1.0, 0, 0, 0, 0, 0, 0, 20.0); DIS = [
  makeDis('fly', 470, 780, 0.9, 22.5, 1.2, 0, 470, 545, 80, 0.04, 27.7, 35.0),
  makeDis('cat', 960, 790, 0.8, 23.0, 1.6, 0.45, 960, 420, 160, 0.55, 27.9, 36.6),
  makeDis('rhino', 1440, 790, 0.62, 23.5, 2.0, 0.8, 1440, 440, 250, 1.0, 28.1, 38.2),
]; };
const LIFE = 2.6;
const dustAt = (d: Dis, i: number, T: number, speed = DIS_SPEED, fall = false) => {
  const [x, y] = d.pts[i];
  const tr = d.t0 + (x - d.xmin) / speed + hash(i) * 0.18, age = Math.max(0, T - tr);
  const h1 = hash(i, 1), h2 = hash(i, 2), e = Math.min(1, age / LIFE);
  if (fall) return { px: x + age * (20 + 30 * h1) * (h2 - 0.4), py: y + age * (14 + 26 * h2) + 4 * Math.sin(age * 3 + h1 * 6), age, e, tr };
  return { px: x + age * (70 + 90 * h1) + 18 * Math.sin(age * 2.4 + h2 * 6), py: y - age * (40 + 70 * h2) - 25 * e * e, age, e, tr };
};
const crumble = (g: G, d: Dis, T: number, speed = DIS_SPEED, fall = false, life = LIFE) => {
  d.pts.forEach(([x, y, warm], i) => {
    const q = dustAt(d, i, T, speed, fall);
    if (T < q.tr || q.age > life) return;
    const e = q.age / life, px = q.px, py = q.py; void x; void y;
    g.fillStyle = `rgba(${warm ? WARM : CHALK},${(warm ? 0.9 : 0.75) * (1 - e) * (1 - e)})`;
    const r = (warm ? 2.6 : 2.2) * (1 - 0.5 * e); g.fillRect(px - r, py - r, 2 * r, 2 * r);
  });
};

/* ------------------------------------------------------------ people, names, bubbles, a flower */
const nameTag = (g: G, text: string, x: number, y: number, o: number) => {
  if (!text || o <= 0) return;
  const c = chalkText(text, 44, `rgb(${CHALK})`, '"Ma Shan Zheng"');
  g.save(); g.globalAlpha = o * 0.9; g.drawImage(c, x - 960, y - 200); g.restore();
};
const person = (g: G, id: string, x: number, y: number, s: number, p: number, o: number, name: string) => {
  if (o <= 0) return;
  chalkPuppet(g, id, x, y, s, p, o);
  nameTag(g, name, x, y + 46, o * clamp((p - 0.6) / 0.4));
};
const BUBTXT = new Map<string, HTMLCanvasElement>();
const bubbleText = (lines: string[], size: number, latin: boolean) => {
  const key = lines.join('|') + size; if (BUBTXT.has(key)) return BUBTXT.get(key)!;
  const c = document.createElement('canvas'); c.width = 1400; c.height = 400; const t = c.getContext('2d')!;
  t.font = `${size}px ${latin ? '"PatrickHand"' : '"Ma Shan Zheng"'}`; t.textAlign = 'center'; t.textBaseline = 'middle'; t.fillStyle = `rgb(${CHALK})`;
  const lh = size * 1.18; lines.forEach((l, i) => t.fillText(l, 700, 200 + (i - (lines.length - 1) / 2) * lh));
  grainMask(t, 1400, 400, key.length * 7);
  BUBTXT.set(key, c); return c;
};
/** a chalk speech bubble centred at (x, y), w × h, its tail toward the speaker (side -1 = left/below-left) */
const bubble = (g: G, x: number, y: number, w: number, h: number, side: number, p: number, o: number, lines: string[], latin: boolean, size: number) => {
  if (p <= 0 || o <= 0) return;
  const r = 50, x0 = x - w / 2, y0 = y - h / 2, x1 = x + w / 2, y1 = y + h / 2, pts: Pt[] = [];
  const arc = (cx: number, cy: number, a0: number) => P.ell(cx, cy, r, r, a0, a0 + Math.PI / 2, 8);
  const tx = side < 0 ? x0 + w * 0.22 : x1 - w * 0.22;
  pts.push(...arc(x1 - r, y0 + r, -Math.PI / 2), ...arc(x1 - r, y1 - r, 0));
  pts.push([tx + 40, y1], [tx + side * 90, y1 + 80], [tx - 10, y1]);
  pts.push(...arc(x0 + r, y1 - r, Math.PI / 2), ...arc(x0 + r, y0 + r, Math.PI), [x1 - r, y0]);
  g.fillStyle = `rgba(10,13,20,${0.35 * o})`; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.fill();
  chalkLine(g, pts, p, 4.5, o);
  const k = clamp((p - 0.55) / 0.45);
  if (k > 0) { g.save(); g.globalAlpha = o * k; g.drawImage(bubbleText(lines, size, latin), x - 700, y - 200); g.restore(); }
};
const flower = (g: G, x: number, y: number, p: number, o: number, warm: number) => {
  const col = tint(warm);
  chalkLine(g, P.bez([x, y], [x - 8, y - 60], [x + 8, y - 110], [x, y - 160], 20), clamp(p * 2), 4, o, col);
  chalkLine(g, P.bez([x, y - 70], [x + 30, y - 90], [x + 50, y - 80], [x + 56, y - 66], 12), clamp(p * 2 - 0.5), 3.5, o, col);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; chalkLine(g, P.ell(x + Math.cos(a) * 22, y - 160 + Math.sin(a) * 22, 16, 16, 0, Math.PI * 2, 16), clamp(p * 2 - 1 + i * 0.02), 3.5, o, col); }
};

/* ------------------------------------------------------------ the title layer: drawn once, in board coordinates */
let TL: { chalk: HTMLCanvasElement; snap: { d: number; i: number; tx: number; ty: number }[] } | null = null;
const TITLE_CHARS = ['生', '命', '平', '等', '吗', '？'];
const titleLayer = () => {
  if (TL) return TL;
  const size = 216, base = 760, adv = size * 0.9, qadv = size * 0.62;
  const total = adv * 5 + qadv, x0 = 960 - total / 2;
  const paint = (t: CanvasRenderingContext2D, col: string, halo: boolean) => {
    t.textBaseline = 'alphabetic'; t.textAlign = 'center'; t.fillStyle = col;
    if (halo) { t.shadowColor = `rgba(${WARM},.55)`; t.shadowBlur = 26; }
    TITLE_CHARS.forEach((ch, i) => { const q = i === 5, fs = q ? size * 0.72 : size; t.font = `${fs}px "Ma Shan Zheng"`; const cx = x0 + (q ? adv * 5 + qadv / 2 : adv * i + adv / 2); t.save(); t.translate(cx, base - 34); t.rotate((hash(i, 9) - 0.5) * 0.06); t.fillText(ch, 0, 0); t.restore(); });
    t.shadowBlur = 0;
  };
  const chalk = document.createElement('canvas'); chalk.width = 1920; chalk.height = 1080; const c = chalk.getContext('2d')!;
  paint(c, JUNO.colors.gold, true); paint(c, '#ffe2a6', false); grainMask(c, 1920, 1080, 4242);
  // targets for the dust: sample the solid letters
  const solid = document.createElement('canvas'); solid.width = 1920; solid.height = 1080; const sc = solid.getContext('2d')!;
  paint(sc, '#fff', false);
  const img = sc.getImageData(0, 0, 1920, 1080).data, tg: Pt[] = [];
  for (let y = 380; y < 800; y += 5) for (let x = 200; x < 1720; x += 5) if (img[(y * 1920 + x) * 4 + 3] > 140) tg.push([x, y]);
  tg.sort((a, b) => a[0] - b[0]);
  const src: { d: number; i: number; x: number }[] = [];
  DIS.forEach((d, di) => d.pts.forEach((_, i) => { const q = dustAt(d, i, TITLE - 0.02); src.push({ d: di, i, x: q.px }); }));
  src.sort((a, b) => a.x - b.x);
  const snap = src.map((s0, j) => { const t = tg[Math.min(tg.length - 1, Math.floor(j * tg.length / src.length))]; return { d: s0.d, i: s0.i, tx: t[0] + (hash(j, 3) - 0.5) * 3, ty: t[1] + (hash(j, 4) - 0.5) * 3 }; });
  TL = { chalk, snap }; return TL;
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
  for (let i = 0; i < 14; i++) { const x = P.rand() * 1920, y = P.rand() * 1080, r = 120 + P.rand() * 220; g.strokeStyle = 'rgba(240,236,225,.016)'; g.lineWidth = 50 + P.rand() * 40; g.beginPath(); g.arc(x, y, r, P.rand() * 6, P.rand() * 6 + 2.5); g.stroke(); }
  for (let i = 0; i < 60; i++) { const x = P.rand() * 1920, y = P.rand() * 1080; g.strokeStyle = 'rgba(240,236,225,.035)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); for (let k = 1; k < 6; k++) g.lineTo(x + k * 14, y + (P.rand() - 0.5) * 16); g.stroke(); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(240,236,225,.025)'; g.lineWidth = 30 + P.rand() * 40; const x = P.rand() * 1920, y = P.rand() * 1080; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 200 + P.rand() * 300, y + (P.rand() - 0.5) * 60); g.stroke(); }
  const v = g.createRadialGradient(960, 520, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
  BOARD = c; return c;
};
/** keep only a speckled ~70 % of what is drawn: the chalk texture for text */
const grainMask = (g: G, w: number, h: number, seed: number) => {
  const m = document.createElement('canvas'); m.width = w; m.height = h; const t = m.getContext('2d')!;
  P.reseed(seed);
  for (let i = 0; i < w * h / 1.9; i++) { t.fillStyle = `rgba(0,0,0,${0.7 + P.rand() * 0.3})`; t.fillRect(P.rand() * w, P.rand() * h, 1 + P.rand() * 2.4, 1 + P.rand() * 1.8); }
  g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0); g.globalCompositeOperation = 'source-over';
};
/** the title in warm chalk, cached */
const TITLE_CACHE = new Map<string, HTMLCanvasElement>();
const chalkText = (s: string, size: number, col: string, font: string) => {
  const key = s + size + col; if (TITLE_CACHE.has(key)) return TITLE_CACHE.get(key)!;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 400; const g = c.getContext('2d')!;
  g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
  g.shadowColor = col; g.shadowBlur = size * 0.12; g.fillText(s, 960, 200); g.shadowBlur = 0;
  grainMask(g, 1920, 400, s.length * 31);
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
    const front = T < 20.0 ? -1 : FLY_DIS.xmin + (T - 20.0) * 260;
    g.save(); if (front > 0) { g.beginPath(); g.rect(front, -200, 3000, 1600); g.clip(); }
    chalkPuppet(g, 'fly', 1100, 820, 0.62, eo(T, 17.2, 1.0), oC);
    g.restore();
    if (T >= 20.0) crumble(g, FLY_DIS, T, 260, true, 1.9);
  }
  // D · fly, cat, rhino, each with a chalk heart that fills with warm light: how much we ache for it (22.5–34),
  //     then all three crumble into chalk dust, left to right at the same speed (34–40)
  const oD = fade(T, 22.5, 47.6, 0.6, 1.0);
  if (oD > 0) {
    const fillK = eo(T, 28.4, 2.4);
    chalkLine(g, wobbly(200, 792, 1720, 795, 60, 2, 4), eo(T, 22.6, 1.2), 4, oD * 0.8);
    for (const d of DIS) {
      const front = T < d.t0 ? -1 : d.xmin + (T - d.t0) * DIS_SPEED;
      const hk = d.hk * fillK, remain = front < 0 ? 1 : clamp((d.hx + d.hs * 0.5 - front) / d.hs);
      if (hk > 0.3) glow(g, d.hx, d.hy, d.hs * 1.4 * hk, 0.32 * hk * oD * remain);
      g.save(); if (front > 0) { g.beginPath(); g.rect(front, -200, 3000, 1600); g.clip(); }
      chalkPuppet(g, d.id, d.x, d.y, d.s, eo(T, d.tin, d.din), oD, d.warm * fillK);
      chalkHeart(g, d.hx, d.hy, d.hs, hk, eo(T, d.th, 0.9), oD, false);
      g.restore();
      if (T >= d.t0 && T < TITLE - 0.02) crumble(g, d, T);
    }
  }

  // ================================================================ the middle (47–163)
  // M1 · the survey (47–63): a researcher asks; the answer is a line of hearts that empty as life gets further from us
  const oM1 = fade(T, 47.0, 63.0, 0.6, 0.7);
  if (oM1 > 0) {
    const oR = fade(T, 47.0, 53.2, 0.6, 0.6);
    person(g, 'researcher', 300, 830, 0.78, eo(T, 47.1, 1.6), oR, '研究者 · 法国');
    bubble(g, 1060, 330, 800, 230, -1, eo(T, 47.6, 0.8), oR, ["Si vous ne pouviez en", "sauver qu'un, lequel ?"], true, 56);
    const line: [string, number, number, number][] = [['we', 330, 0.46, 1], ['dog', 600, 0.46, 0.8], ['bird', 860, 0.55, 0.6], ['frog', 1110, 0.55, 0.42], ['fish', 1370, 0.55, 0.26], ['fly', 1620, 0.62, 0.08]];
    const oL = eo(T, 53.0, 0.8) * oM1;
    if (oL > 0) {
      chalkLine(g, wobbly(200, 832, 1760, 834, 60, 2, 11), eo(T, 53.0, 1.2), 4, oL);
      for (let i = 0; i <= 26; i++) chalkLine(g, [[220 + i * 58, 834], [220 + i * 58, i % 5 ? 852 : 866]], eo(T, 53.2 + i * 0.03, 0.3), 3, oL * 0.8);
      line.forEach(([id, x, sc, k], i) => {
        chalkPuppet(g, id, x, 825, sc, eo(T, 53.3 + i * 0.25, 1.2), oL, 0.7 * k * eo(T, 55.4, 1.5));
        chalkHeart(g, x, 470, 90, k * eo(T, 55.4 + i * 0.15, 1.6), eo(T, 54.4 + i * 0.2, 0.7), oL);
      });
    }
  }
  // M2 · 庄子 and 惠子 on the bridge (63–71)
  const oM2 = fade(T, 63.0, 71.2, 0.6, 0.6);
  if (oM2 > 0) {
    chalkLine(g, P.bez([140, 860], [600, 720], [1320, 720], [1780, 860], 50), eo(T, 63.0, 1.4), 5, oM2);
    for (let i = -7; i <= 7; i++) { const x = 960 + i * 110, y = 860 - 140 * (1 - (i / 8.6) ** 2); chalkLine(g, [[x, y], [x, y - 60]], eo(T, 63.3 + (i + 7) * 0.04, 0.4), 3.5, oM2); }
    for (let i = 0; i < 5; i++) chalkLine(g, wobbly(260 + i * 300, 930 + (i % 2) * 18, 420 + i * 300, 930 + (i % 2) * 18, 12, 4, i), eo(T, 63.8 + i * 0.15, 0.6), 3, oM2 * 0.6, '170,200,230');
    person(g, 'zhuang', 340, 790, 0.72, eo(T, 63.2, 1.6), oM2, '庄子');
    person(g, 'hui', 1580, 790, 0.72, eo(T, 63.5, 1.6), oM2, '惠子');
    bubble(g, 760, 330, 600, 230, -1, eo(T, 65.85, 0.7), oM2, ['儵鱼出游从容，', '是鱼之乐也。'], false, 60);
    bubble(g, 1180, 520, 560, 210, 1, eo(T, 68.07, 0.7), oM2, ['子非鱼，', '安知鱼之乐？'], false, 64);
  }
  // M3 · Nagel and the bat; a closed circle we cannot step into (71–82)
  const oM3 = fade(T, 71.1, 82.2, 0.6, 0.8);
  if (oM3 > 0) {
    person(g, 'nagel', 320, 830, 0.78, eo(T, 71.2, 1.6), oM3, '内格尔 · Nagel');
    bubble(g, 900, 300, 660, 220, -1, eo(T, 71.5, 0.7), oM3, ['What is it like', 'to be a bat?'], true, 66);
    const by = 600 + 10 * Math.sin(T * 2.2);
    chalkPuppet(g, 'bat', 1360, by, 1.0, eo(T, 72.2, 1.6), oM3);
    chalkLine(g, P.ell(1360, by - 120, 250, 210, -Math.PI / 2, Math.PI * 1.5, 90), eo(T, 75.2, 1.4), 5, oM3, WARM);
  }
  // M4 · where to draw the line: a row of lives; each philosopher draws the boundary somewhere else (81–122.6)
  const ROW: [string, number, number][] = [['we', 640, 0.44], ['dog', 850, 0.44], ['chicken', 1060, 0.44], ['fish', 1270, 0.5], ['fly', 1460, 0.56], ['flower', 1650, 1]];
  const rowLife = (oR: number, bx: number, allWarm: number, t0: number) => {
    chalkLine(g, wobbly(480, 832, 1780, 834, 50, 2, 21), eo(T, t0, 1.0), 4, oR);
    ROW.forEach(([id, x, sc], i) => {
      const inside = Math.max(allWarm, clamp((bx - x) / 40 + 0.5));
      const o = oR * (0.4 + 0.6 * inside), p = eo(T, t0 + 0.2 + i * 0.25, 1.2);
      if (id === 'flower') flower(g, x, 830, p, o, 0.8 * inside); else chalkPuppet(g, id, x, 825, sc, p, o, 0.8 * inside);
    });
  };
  const oM4 = fade(T, 81.1, 122.6, 0.7, 0.6);
  if (oM4 > 0) {
    // the boundary: Kant after us; Bentham and Singer after the fish
    const bx = T < 97.6 ? 745 : lerp(745, 1365, eio(T, 97.6, 1.4));
    const showB = T > 84.4 ? 1 : 0;
    rowLife(oM4, showB ? bx : -999, 0, 81.2);
    if (showB) chalkLine(g, wobbly(bx, 380, bx, 880, 30, 3, 5).map(([a, b]) => [b * 0 + a + 3 * Math.sin(b / 40), b] as Pt), eo(T, 84.5, 0.9), 6, oM4, WARM);
    const oK = fade(T, 83.8, 97.0, 0.6, 0.5), oB = fade(T, 97.0, 105.3, 0.5, 0.5), oS = fade(T, 105.3, 122.6, 0.5, 0.6);
    person(g, 'kant', 250, 830, 0.72, eo(T, 83.9, 1.4), oK, '康德 · Kant');
    bubble(g, 900, 300, 940, 230, -1, eo(T, 84.2, 0.7), oK * (1 - pr(T, 90.9, 0.4)), ['Der Mensch existiert als', 'Zweck an sich selbst.'], true, 58);
    bubble(g, 900, 300, 980, 230, -1, eo(T, 91.3, 0.7), oK, ['Wer gegen Tiere grausam ist,', 'wird auch hart gegen Menschen.'], true, 54);
    person(g, 'bentham', 250, 830, 0.72, eo(T, 97.1, 1.4), oB, '边沁 · Bentham');
    bubble(g, 960, 300, 1180, 230, -1, eo(T, 99.4, 0.7), oB, ['The question is not, Can they reason?', 'nor, Can they talk? but, Can they suffer?'], true, 46);
    person(g, 'singer', 250, 830, 0.72, eo(T, 105.4, 1.4), oS, '辛格 · Singer');
    bubble(g, 860, 300, 720, 190, -1, eo(T, 105.7, 0.7), oS * (1 - pr(T, 111.3, 0.4)), ['All animals are equal.'], true, 62);
    bubble(g, 860, 300, 560, 190, -1, eo(T, 117.6, 0.7), oS, ['Speciesism.'], true, 70);
    // one chicken's pain, one dog's pain: two equal hearts
    if (T > 111.6) { const kk = eo(T, 112.0, 1.4); chalkHeart(g, 850, 600, 110, 0.75 * kk, eo(T, 111.7, 0.6), oS); chalkHeart(g, 1060, 600, 110, 0.75 * kk, eo(T, 111.9, 0.6), oS); }
  }
  // M5 · Schweitzer on the river (122.6–137.3)
  const oM5 = fade(T, 122.6, 137.4, 0.7, 0.7);
  if (oM5 > 0) {
    glow(g, 1500, 640, 520, 0.28 * oM5);
    chalkLine(g, wobbly(100, 700, 1820, 700, 60, 2, 31), eo(T, 122.7, 1.2), 3.5, oM5 * 0.7);
    for (let i = 0; i < 7; i++) chalkLine(g, wobbly(150 + i * 240, 900 + (i % 3) * 30, 330 + i * 240, 900 + (i % 3) * 30, 12, 4, i + 3), eo(T, 123.0 + i * 0.1, 0.6), 3, oM5 * 0.55, '170,200,230');
    const dx = 120 * pr(T, 122.7, 14.7);
    chalkPuppet(g, 'boat', 900 + dx, 900, 0.85, eo(T, 122.8, 1.6), oM5);
    person(g, 'schweitzer', 720 + dx, 800, 0.6, eo(T, 123.0, 1.6), oM5, '');
    nameTag(g, '史怀哲 · Schweitzer', 720 + dx, 952, oM5 * eo(T, 124.0, 0.6));
    chalkPuppet(g, 'hippo', 300, 900, 0.7, eo(T, 125.8, 1.4), oM5); chalkPuppet(g, 'hippo', 1640, 910, 0.6, eo(T, 126.3, 1.4), oM5);
    bubble(g, 1240, 330, 680, 190, -1, eo(T, 129.2, 0.7), oM5 * (1 - pr(T, 131.6, 0.3)), ['Ehrfurcht vor dem Leben.'], true, 56);
    bubble(g, 1180, 330, 1000, 230, -1, eo(T, 131.9, 0.7), oM5, ['Ich bin Leben, das leben will,', 'inmitten von Leben, das leben will.'], true, 52);
  }
  // M6 · no ranking: the row again, the boundary gone, every life warm (137.3–146.2)
  const oM6 = fade(T, 137.3, 146.2, 0.7, 0.6);
  if (oM6 > 0) {
    rowLife(oM6, 9999, eo(T, 137.8, 1.6), 137.3);
    person(g, 'schweitzer', 250, 830, 0.72, eo(T, 137.4, 1.2), oM6, '史怀哲 · Schweitzer');
  }
  // M7 · Lecky: circles of kindness widening (146.3–163)
  const oM7 = fade(T, 146.2, 163.0, 0.6, 0.9);
  if (oM7 > 0) {
    const oLk = fade(T, 146.2, 157.6, 0.5, 0.6);
    person(g, 'lecky', 250, 830, 0.72, eo(T, 146.3, 1.4), oLk, '莱基 · Lecky');
    bubble(g, 900, 300, 920, 230, -1, eo(T, 146.6, 0.7), oLk * (1 - pr(T, 152.9, 0.4)), ['…soon the circle expanding…', 'and finally, the animal world.'], true, 52);
    const cx = 1180, cy = 700;
    const rings: [number, number][] = [[150, 148.9], [300, 151.5], [460, 154.2]];
    rings.forEach(([r, t0], i) => { glow(g, cx, cy, r * 1.1, 0.12 * eo(T, t0, 1.0) * oM7); chalkLine(g, P.ell(cx, cy, r, r * 0.5, -Math.PI / 2, Math.PI * 1.5, 100), eo(T, t0, 1.2), 4.5, oM7 * (1 - 0.3 * i / 3), WARM); });
    chalkPuppet(g, 'we', cx - 40, 760, 0.36, eo(T, 148.9, 1.0), oM7, 0.6); chalkPuppet(g, 'we', cx + 40, 760, 0.3, eo(T, 149.2, 1.0), oM7, 0.6);
    chalkPuppet(g, 'researcher', cx - 200, 770, 0.3, eo(T, 151.6, 1.0), oM7, 0.4); chalkPuppet(g, 'singer', cx + 210, 770, 0.3, eo(T, 151.8, 1.0), oM7, 0.4); chalkPuppet(g, 'nagel', cx + 120, 640, 0.26, eo(T, 152.0, 1.0), oM7, 0.4);
    chalkPuppet(g, 'dog', cx - 390, 790, 0.34, eo(T, 154.4, 1.0), oM7, 0.3); chalkPuppet(g, 'cat', cx + 380, 790, 0.36, eo(T, 154.6, 1.0), oM7, 0.3); chalkPuppet(g, 'bird', cx + 300, 560, 0.4, eo(T, 154.8, 1.0), oM7, 0.3);
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
  // the title on the hit: every grain of the three lives' dust flies into the letters, which stand on their ground line
  if (T >= TITLE - 0.02 && T < 47.6) {
    const o = 1 - pr(T, 46.6, 0.9), t = T - TITLE + 0.02;
    g.save(); g.translate(0, -45);
    glow(g, 960, 640, 820, 0.5 * Math.exp(-t / 0.5) * o);
    const tl = titleLayer();
    g.save(); g.globalAlpha = o * eo(t, 0.14, 0.34); g.drawImage(tl.chalk, 0, 0); g.restore();
    if (t < 0.75) {
      const k = 1 - Math.pow(1 - clamp(t / 0.3), 3), a = 0.95 * (1 - pr(t, 0.3, 0.4));
      for (const s0 of tl.snap) {
        const q = dustAt(DIS[s0.d], s0.i, TITLE - 0.02);
        const x = lerp(q.px, s0.tx, k), y = lerp(q.py, s0.ty, k);
        g.fillStyle = `rgba(${WARM},${a})`; g.fillRect(x - 1.8, y - 1.8, 3.6, 3.6);
      }
    }
    g.restore();
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
