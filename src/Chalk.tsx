/* 《生命平等吗？》 v8 · clear look: flat-colour "sticker" characters (light rim, dark lines) on a clean dark board; hearts, rings,
   glows and the title stay warm light. Lines are re-timed to src/lines.json (timeline_v8.py, 6.3 characters a second);
   scene times are written relative to those lines (L(i)), so a re-pace moves the pictures with the words. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import RAW from './lines.json';
import { JUNO } from './brand/identity';
import { Canvas, FontFaces, clamp, eio, eo, lerp, pr } from './kit';
import * as P from './puppets';
import { PUPPETS } from './Asset';

export const FILM_END = 194.2;
export const CHALK_FRAMES = Math.round(FILM_END * 30);
const TITLE = 42.36, END = 187.9, DROP = 168.40;
type G = CanvasRenderingContext2D;
type Pt = [number, number];

const RL = RAW as [number, number, string][];
const L = (i: number) => RL[i][0];
const LINES = RL.map(([a, z, s], i, arr) => {
  const nxt = i + 1 < arr.length ? arr[i + 1][0] : END;
  return [a, Math.min(nxt - 0.12, z + 0.6), s] as [number, number, string];
});

const CHALK = '242,236,222', WARM = '255,206,140', INK = '30,27,24', RIM = '246,241,231';
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
const mix = (a: string, b: string, k: number) => { const A = a.split(',').map(Number), B = b.split(',').map(Number); return A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(','); };
const hash = (i: number, k = 0) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };

/* ------------------------------------------------------------ recording a puppet: its shapes, fills and ink */
type Stroke = { pts: Pt[]; w: number; a: number; kind: 'line' | 'dot' | 'fill'; len: number; col: string };
type Rec = { strokes: Stroke[]; total: number; body: P.Shape[]; fills: (string | null)[]; light: boolean; m: number; minY: number; minX: number; maxX: number };
const LIGHT = new Set(['window']);
const CACHE = new Map<string, Rec>();
const record = (id: string): Rec => {
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
    stroke() { for (const s of [...subs, cur]) if (s.length > 1) { let len = 0; for (let i = 1; i < s.length; i++) len += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); strokes.push({ pts: s.slice(), w: rec.lineWidth, a: rec.globalAlpha, kind: 'line', len, col: '' }); } },
    fill() { if (dot) strokes.push({ pts: [[dot[0], dot[1]]], w: dot[2], a: 1, kind: 'dot', len: 4, col: '' }); else if (cur.length > 2) strokes.push({ pts: cur.slice(), w: 0, a: rec.globalAlpha, kind: 'fill', len: 10, col: String(rec.fillStyle) }); },
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, fillRect() {},
  };
  const pup = PUPPETS[id]();
  pup.ink(rec as G);
  const total = strokes.reduce((a, s) => a + (s.a > 0.5 ? s.len : 0), 0) || 1;
  const all = pup.body.flatMap((b) => b.pts);
  const out: Rec = { strokes, total, body: pup.body, fills: pup.fills ?? pup.body.map(() => pup.tint ?? '#c9a272'), light: LIGHT.has(id), m: pup.m ?? 16,
    minY: Math.min(...all.map((p) => p[1])), minX: Math.min(...all.map((p) => p[0])), maxX: Math.max(...all.map((p) => p[0])) };
  CACHE.set(id, out);
  return out;
};
const shapePath = (g: G, b: P.Shape) => { g.beginPath(); b.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (b.closed) g.closePath(); };
const strokePart = (g: G, pts: Pt[], use: number) => {
  g.beginPath(); let acc = 0; g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay);
    if (acc + d >= use) { const k = (use - acc) / Math.max(d, 1e-6); g.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k); break; }
    g.lineTo(bx, by); acc += d;
  }
};

/** a character as a sticker at (x, y) (its feet), scale s. p 0..1 draws it on (colour first, then the lines); warm 0..1 = in the circle of care */
const figure = (g: G, id: string, x: number, y: number, s: number, p: number, o = 1, warm = 0, flip = false) => {
  if (o <= 0.002 || p <= 0) return;
  const R = record(id);
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  if (R.light) {
    let budget = p * R.total * 1.02;
    for (const st of R.strokes) { if (st.kind !== 'line' || st.a < 0.5 || budget <= 0) continue; strokePart(g, st.pts, Math.min(st.len, budget)); budget -= st.len; lightStroke(g, CHALK, st.w * 1.25 / Math.max(0.5, s) * 0.95, o); }
    g.restore(); return;
  }
  const fo = o * clamp(p * 2.4);
  if (fo > 0.002) {
    const rimW = (6.5 + 4 * warm) / s, rc = mix(RIM, WARM, warm * 0.9);
    g.globalAlpha = fo; g.fillStyle = `rgb(${rc})`; g.strokeStyle = `rgb(${rc})`;
    R.body.forEach((b, i) => { if (b.closed && R.fills[i] === null) return; shapePath(g, b); if (b.closed) { g.lineWidth = 2 * rimW; g.fill(); g.stroke(); } else { g.lineWidth = R.m * 2 + 2 * rimW; g.stroke(); } });
    R.body.forEach((b, i) => { const c = R.fills[i]; if (!c) return; shapePath(g, b); if (b.closed) { g.fillStyle = c; g.fill(); } else { g.strokeStyle = c; g.lineWidth = R.m * 2; g.stroke(); } });
    if (warm > 0.02) { g.globalAlpha = fo * 0.16 * warm; g.fillStyle = `rgb(${WARM})`; R.body.forEach((b, i) => { if (!b.closed || !R.fills[i]) return; shapePath(g, b); g.fill(); }); }
    g.globalAlpha = 1;
  }
  const iw = (0.55 + 0.9 * s) / s;
  let budget = p * R.total * 1.02;
  for (const st of R.strokes) {
    if (st.kind === 'dot') { if (budget <= 0) break; g.fillStyle = `rgba(${INK},${o})`; g.beginPath(); g.arc(st.pts[0][0], st.pts[0][1], st.w * Math.min(1.5, iw * 0.85), 0, 7); g.fill(); continue; }
    if (st.kind === 'fill') { if (budget <= 0) break; g.globalAlpha = o * st.a; g.fillStyle = st.col || `rgb(${INK})`; g.beginPath(); st.pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); g.globalAlpha = 1; continue; }
    if (st.a < 0.5) continue;
    if (budget <= 0) break;
    strokePart(g, st.pts, Math.min(st.len, budget)); budget -= st.len;
    g.strokeStyle = `rgba(${INK},${o})`; g.lineWidth = st.w * iw; g.stroke();
  }
  g.restore();
};
/** the top of a character drawn at (y, s): where a heart above it goes */
const topOf = (id: string, y: number, s: number) => y + record(id).minY * s;

/* ------------------------------------------------------------ light lines: the ground, rings, hearts, bubbles */
const lightStroke = (g: G, col: string, w: number, o: number) => {
  g.setLineDash([]); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = `rgba(${col},${0.1 * o})`; g.lineWidth = w * 2.6; g.stroke();
  g.strokeStyle = `rgba(${col},${0.95 * o})`; g.lineWidth = w; g.stroke();
};
const glow = (g: G, x: number, y: number, r: number, a: number, col = WARM) => {
  if (a <= 0.002 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.45, `rgba(${col},${a * 0.38})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};
const line = (g: G, pts: Pt[], p: number, w = 5, o = 1, col = CHALK) => {
  if (p <= 0 || o <= 0) return;
  let Ln = 0; for (let i = 1; i < pts.length; i++) Ln += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  strokePart(g, pts, p * Ln); lightStroke(g, col, w * 1.35, o);
};
const wobbly = (x0: number, y0: number, x1: number, y1: number, n = 40, amp = 3, seed = 1): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + amp * Math.sin(t * 13 + seed) * Math.sin(t * 5.3 + seed * 2)]; });
const heartPts = (cx: number, cy: number, size: number): Pt[] => { const sc = size / 320, tip = cy + size * 0.45; return [...P.bez([0, 0], [-160, -110], [-120, -260], [0, -190], 24), ...P.bez([0, -190], [120, -260], [160, -110], [0, 0], 24)].map(([x, y]) => [cx + x * sc, tip + y * sc]); };
/** a heart (centre cx, cy) whose inside fills from the bottom with warm light to level k */
const heart = (g: G, cx: number, cy: number, size: number, k: number, p: number, o: number, halo = true) => {
  if (p <= 0 || o <= 0) return;
  const pts = heartPts(cx, cy, size), top = cy - size * 0.42, tip = cy + size * 0.45;
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = `rgba(14,17,24,${0.7 * o * clamp(p * 2)})`; g.fill(); g.restore();
  if (k > 0.01) {
    if (halo && k > 0.3) glow(g, cx, cy, size * 1.4 * k, 0.32 * k * o);
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    const lvl = tip - (tip - top) * k;
    const gr = g.createLinearGradient(0, tip, 0, lvl); gr.addColorStop(0, `rgba(${WARM},${0.95 * o})`); gr.addColorStop(1, `rgba(${WARM},${0.7 * o})`);
    g.fillStyle = gr; g.fillRect(cx - size, lvl, size * 2, tip - lvl + 4);
    g.strokeStyle = `rgba(255,240,210,${0.8 * o})`; g.lineWidth = Math.max(2, size / 40); g.beginPath(); g.moveTo(cx - size, lvl); g.lineTo(cx + size, lvl); g.stroke();
    g.restore();
  }
  line(g, pts, p, Math.max(4.5, size / 24), o, k > 0.3 ? WARM : CHALK);
};

/* ------------------------------------------------------------ crumbling into dust, front edge ragged, the dust in each part's own colour */
type Dis = { id: string; x: number; y: number; s: number; t0: number; speed: number; seed: number; xmin: number; pts: [number, number, number][]; cols: string[]; hx: number; hy: number; hs: number; hk: number; th: number; tin: number; din: number; warm: number };
const edgeOff = (y: number, seed: number) => -40 * (0.5 + 0.25 * Math.sin(y / 31 + seed) + 0.15 * Math.sin(y / 11.3 + seed * 2.1) + 0.1 * Math.sin(y / 5.1 + seed * 3.7));
const makeDis = (id: string, x: number, y: number, s: number, t0: number, speed: number, o: { hx?: number; hy?: number; hs?: number; hk?: number; th?: number; tin?: number; din?: number; warm?: number } = {}): Dis => {
  const R = record(id), pts: [number, number, number][] = [], cols: string[] = [hex('#f6f1e7'), WARM];
  const c = document.createElement('canvas').getContext('2d')!;
  const paths = R.body.map((b) => { const pa = new Path2D(); b.pts.forEach(([a, bb], i) => (i ? pa.lineTo(x + a * s, y + bb * s) : pa.moveTo(x + a * s, y + bb * s))); if (b.closed) pa.closePath(); return pa; });
  const colIdx = R.body.map((_, i) => { const f = R.fills[i]; if (!f) return -1; const k = hex(f); let j = cols.indexOf(k); if (j < 0) { cols.push(k); j = cols.length - 1; } return j; });
  const all = R.body.flatMap((b) => b.pts);
  const x0 = x + Math.min(...all.map((p) => p[0])) * s - 10, x1 = x + Math.max(...all.map((p) => p[0])) * s + 10, y0 = y + Math.min(...all.map((p) => p[1])) * s - 10, y1 = y + Math.max(...all.map((p) => p[1])) * s + 10;
  const step = 6.5;
  for (let yy = y0; yy < y1; yy += step) for (let xx = x0; xx < x1; xx += step) {
    for (let i = R.body.length - 1; i >= 0; i--) { if (!R.body[i].closed || colIdx[i] < 0) continue; if (c.isPointInPath(paths[i], xx, yy)) { pts.push([xx, yy, colIdx[i]]); break; } }
  }
  const hs = o.hs ?? 0;
  if (hs > 0) {
    const hp = heartPts(o.hx!, o.hy!, hs);
    for (let i = 1; i < hp.length; i++) { const [ax, ay] = hp[i - 1], [bx, by] = hp[i], d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(d / 5)); for (let k = 0; k < n; k++) pts.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n, (o.hk ?? 0) > 0.3 ? 1 : 0]); }
    if ((o.hk ?? 0) > 0.01) { const path = new Path2D(); hp.forEach(([a, b], i) => (i ? path.lineTo(a, b) : path.moveTo(a, b))); path.closePath(); const top = o.hy! - hs * 0.42, tip = o.hy! + hs * 0.45, lvl = tip - (tip - top) * o.hk!; for (let yy = lvl; yy < tip; yy += 7) for (let xx = o.hx! - hs; xx < o.hx! + hs; xx += 7) if (c.isPointInPath(path, xx, yy)) pts.push([xx, yy, 1]); }
  }
  const seed = id.length * 1.7 + x * 0.013;
  const xmin = Math.min(...pts.map((p) => p[0]));
  return { id, x, y, s, t0, speed, seed, xmin, pts, cols, hx: o.hx ?? 0, hy: o.hy ?? 0, hs, hk: o.hk ?? 0, th: o.th ?? 0, tin: o.tin ?? 0, din: o.din ?? 1, warm: o.warm ?? 0 };
};
const front = (d: Dis, T: number) => (T < d.t0 ? -1e9 : d.xmin + (T - d.t0) * d.speed);
/** clip to what is still standing: right of the ragged front */
const clipStanding = (g: G, d: Dis, T: number) => {
  if (T < d.t0) return;
  const f = front(d, T); g.beginPath(); g.moveTo(f + edgeOff(-300, d.seed), -300);
  for (let y = -300; y <= 1500; y += 8) g.lineTo(f + edgeOff(y, d.seed), y);
  g.lineTo(5000, 1500); g.lineTo(5000, -300); g.closePath(); g.clip();
};
const LIFE = 2.6;
const dustAt = (d: Dis, i: number, T: number) => {
  const [x, y] = d.pts[i];
  const tr = d.t0 + (x - edgeOff(y, d.seed) - d.xmin) / d.speed + hash(i) * 0.15, age = Math.max(0, T - tr);
  const h1 = hash(i, 1), h2 = hash(i, 2), e = Math.min(1, age / LIFE);
  return { px: x + age * (70 + 90 * h1) + 18 * Math.sin(age * 2.4 + h2 * 6), py: y - age * (40 + 70 * h2) - 25 * e * e, age, tr };
};
const crumble = (g: G, d: Dis, T: number, life = LIFE, o = 1) => {
  if (T < d.t0) return;
  for (let i = 0; i < d.pts.length; i++) {
    const q = dustAt(d, i, T);
    if (T < q.tr || q.age > life) continue;
    const e = q.age / life, ci = d.pts[i][2];
    g.fillStyle = `rgba(${mix(d.cols[ci], WARM, e * 0.6)},${0.95 * (1 - e) * (1 - e) * o})`;
    g.beginPath(); g.arc(q.px, q.py, 2.9 * (1 - 0.45 * e), 0, 7); g.fill();
  }
};

/* ------------------------------------------------------------ text: name tags, bubbles, the title */
const TXT = new Map<string, HTMLCanvasElement>();
/** a line of text centred at (960, 200) on a 1920×400 canvas, with a dark outline so it reads on anything */
const text = (s: string, size: number, col: string, font: string, outline = 0) => {
  const key = [s, size, col, font, outline].join('|'); if (TXT.has(key)) return TXT.get(key)!;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 400; const g = c.getContext('2d')!;
  const wm = font.match(/^(\d+) (.*)$/);
  g.font = wm ? `${wm[1]} ${size}px ${wm[2]}` : `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (outline) { g.strokeStyle = 'rgba(8,10,14,.92)'; g.lineWidth = outline; g.strokeText(s, 960, 200); }
  g.fillStyle = col; g.fillText(s, 960, 200);
  TXT.set(key, c); return c;
};
const SANS = '"Noto Sans CJK SC"';
const nameTag = (g: G, s: string, x: number, y: number, o: number) => {
  if (!s || o <= 0) return;
  g.save(); g.globalAlpha = o; g.drawImage(text(s, 46, '#f4efe4', `700 ${SANS}`, 9), x - 960, y - 200); g.restore();
};
const person = (g: G, id: string, x: number, y: number, s: number, p: number, o: number, name: string, warm = 0) => {
  if (o <= 0) return;
  figure(g, id, x, y, s, p, o, warm);
  nameTag(g, name, x, y + 50, o * clamp((p - 0.5) / 0.4));
};
const BUB = new Map<string, HTMLCanvasElement>();
const bubbleText = (lines: string[], size: number, latin: boolean) => {
  const key = lines.join('|') + size; if (BUB.has(key)) return BUB.get(key)!;
  const c = document.createElement('canvas'); c.width = 1400; c.height = 400; const t = c.getContext('2d')!;
  t.font = `${size}px ${latin ? '"PatrickHand"' : '"Ma Shan Zheng"'}`; t.textAlign = 'center'; t.textBaseline = 'middle'; t.fillStyle = `rgb(${CHALK})`;
  const lh = size * 1.18; lines.forEach((l, i) => t.fillText(l, 700, 200 + (i - (lines.length - 1) / 2) * lh));
  BUB.set(key, c); return c;
};
/** a speech bubble centred at (x, y), w × h, tail toward the speaker. Foreign-language quotes are drawn quieter: the subtitle carries them */
const bubble = (g: G, x: number, y: number, w: number, h: number, side: number, p: number, o: number, lines: string[], latin: boolean, size: number) => {
  if (p <= 0 || o <= 0) return;
  const q = latin ? 0.6 : 1, r = 46, x0 = x - w / 2, y0 = y - h / 2, x1 = x + w / 2, y1 = y + h / 2, pts: Pt[] = [];
  const arc = (cx: number, cy: number, a0: number) => P.ell(cx, cy, r, r, a0, a0 + Math.PI / 2, 8);
  const tx = side < 0 ? x0 + w * 0.22 : x1 - w * 0.22;
  pts.push(...arc(x1 - r, y0 + r, -Math.PI / 2), ...arc(x1 - r, y1 - r, 0));
  pts.push([tx + 40, y1], [tx + side * 90, y1 + 80], [tx - 10, y1]);
  pts.push(...arc(x0 + r, y1 - r, Math.PI / 2), ...arc(x0 + r, y0 + r, Math.PI), [x1 - r, y0]);
  g.fillStyle = `rgba(10,13,20,${0.6 * o})`; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.fill();
  line(g, pts, p, 4, o * q);
  const k = clamp((p - 0.55) / 0.45);
  if (k > 0) { g.save(); g.globalAlpha = o * k * (latin ? 0.62 : 1); g.drawImage(bubbleText(lines, size, latin), x - 700, y - 200); g.restore(); }
};
const flower = (g: G, x: number, y: number, s: number, p: number, o: number, warm: number) => {
  const col = mix(CHALK, WARM, warm);
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y);
  line(g, P.bez([x, y], [x - 8, y - 60], [x + 8, y - 110], [x, y - 160], 20), clamp(p * 2), 5, o, '140,200,130');
  line(g, P.bez([x, y - 70], [x + 30, y - 90], [x + 50, y - 80], [x + 56, y - 66], 12), clamp(p * 2 - 0.5), 4.5, o, '140,200,130');
  const k = clamp(p * 2 - 1);
  if (k > 0) {
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, px = x + Math.cos(a) * 24, py = y - 160 + Math.sin(a) * 24; g.fillStyle = `rgba(240,140,150,${o * k})`; g.beginPath(); g.arc(px, py, 18, 0, 7); g.fill(); }
    g.fillStyle = `rgba(${mix('246,214,120', WARM, warm)},${o * k})`; g.beginPath(); g.arc(x, y - 160, 15, 0, 7); g.fill();
    g.strokeStyle = `rgba(${col},${0.5 * o * k})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y - 160, 44, 0, 7); g.stroke();
  }
  g.restore();
};

/* ------------------------------------------------------------ the title layer, drawn once */
let TL: { img: HTMLCanvasElement; snap: { d: number; i: number; tx: number; ty: number }[] } | null = null;
const TITLE_CHARS = ['生', '命', '平', '等', '吗', '？'];
let DIS: Dis[] = [];
let FLY_DIS: Dis, CAT_DIS: Dis, RHINO_DIS: Dis;
const ensureDis = () => {
  if (DIS.length) return;
  CAT_DIS = makeDis('cat', 1040, 800, 1.15, 2.2, 170);
  RHINO_DIS = makeDis('rhino', 940, 800, 1.2, 13.3, 420);
  FLY_DIS = makeDis('fly', 1100, 820, 0.62, 20.0, 260);
  DIS = [
    makeDis('fly', 470, 780, 0.9, 35.0, 160, { hx: 470, hy: 545, hs: 80, hk: 0.04, th: 26.5, tin: 22.5, din: 1.2 }),
    makeDis('cat', 960, 790, 0.95, 36.6, 160, { hx: 960, hy: 400, hs: 160, hk: 0.55, th: 26.62, tin: 23.0, din: 1.6, warm: 0.45 }),
    makeDis('rhino', 1440, 795, 0.72, 38.2, 160, { hx: 1470, hy: 420, hs: 240, hk: 1.0, th: 26.75, tin: 23.5, din: 2.0, warm: 0.8 }),
  ];
};
const titleLayer = () => {
  if (TL) return TL;
  const size = 216, base = 700, adv = size * 0.9, qadv = size * 0.62;
  const total = adv * 5 + qadv, x0 = 960 - total / 2;
  const paint = (t: CanvasRenderingContext2D, col: string, halo: boolean) => {
    t.textBaseline = 'alphabetic'; t.textAlign = 'center'; t.fillStyle = col;
    if (halo) { t.shadowColor = `rgba(${WARM},.55)`; t.shadowBlur = 26; }
    TITLE_CHARS.forEach((ch, i) => { const q = i === 5, fs = q ? size * 0.72 : size; t.font = `${fs}px "Ma Shan Zheng"`; const cx = x0 + (q ? adv * 5 + qadv / 2 : adv * i + adv / 2); t.save(); t.translate(cx, base - 34); t.rotate((hash(i, 9) - 0.5) * 0.06); t.fillText(ch, 0, 0); t.restore(); });
    t.shadowBlur = 0;
  };
  const img = document.createElement('canvas'); img.width = 1920; img.height = 1080; const c = img.getContext('2d')!;
  paint(c, JUNO.colors.gold, true); paint(c, '#ffe2a6', false);
  const solid = document.createElement('canvas'); solid.width = 1920; solid.height = 1080; const sc = solid.getContext('2d')!;
  paint(sc, '#fff', false);
  const im = sc.getImageData(0, 0, 1920, 1080).data, tg: Pt[] = [];
  for (let y = 320; y < 760; y += 5) for (let x = 200; x < 1720; x += 5) if (im[(y * 1920 + x) * 4 + 3] > 140) tg.push([x, y]);
  tg.sort((a, b) => a[0] - b[0]);
  const src: { d: number; i: number; x: number }[] = [];
  DIS.forEach((d, di) => d.pts.forEach((_, i) => { const q = dustAt(d, i, TITLE - 0.02); src.push({ d: di, i, x: q.px }); }));
  src.sort((a, b) => a.x - b.x);
  const snap = src.map((s0, j) => { const t = tg[Math.min(tg.length - 1, Math.floor(j * tg.length / src.length))]; return { d: s0.d, i: s0.i, tx: t[0] + (hash(j, 3) - 0.5) * 3, ty: t[1] + (hash(j, 4) - 0.5) * 3 }; });
  TL = { img, snap }; return TL;
};

/* ------------------------------------------------------------ the board: clean dark slate, a soft vignette, a whisper of dither against banding */
let BOARD: HTMLCanvasElement | null = null;
const board = () => {
  if (BOARD) return BOARD;
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#121620'); gr.addColorStop(1, '#1a1e28'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  const v = g.createRadialGradient(960, 520, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
  const im = g.getImageData(0, 0, 1920, 1080), d = im.data; P.reseed(99);
  for (let i = 0; i < d.length; i += 4) { const n = (P.rand() - 0.5) * 2.2; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(im, 0, 0);
  BOARD = c; return c;
};
const dust = (g: G, x: number, y: number, t: number, n = 40, col = CHALK) => {
  if (t < 0 || t > 1.4) return;
  P.reseed(Math.round(x + y));
  for (let i = 0; i < n; i++) { const a = P.rand() * Math.PI * 2, v = 80 + P.rand() * (n > 150 ? 900 : 380), r = 2 + P.rand() * 4; const px = x + Math.cos(a) * v * eo(t, 0, 1.2), py = y + Math.sin(a) * v * eo(t, 0, 1.2) + 60 * t * t; g.fillStyle = `rgba(${col},${0.75 * (1 - t / 1.4)})`; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }
};
const cam = (g: G, s: number, cx: number, cy: number) => { g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); };

/* ------------------------------------------------------------ the picture */
const fade = (T: number, a: number, z: number, fi = 0.6, fo = 0.6) => Math.min(eo(T, a, fi), 1 - pr(T, z - fo, fo));
const GRID_IDS = ['cat', 'dog', 'bird', 'frog', 'fish', 'fly', 'chicken', 'rhino', 'bat', 'hippo', 'rabbit', 'mouse', 'snail', 'turtle', 'butterfly', 'hedgehog', 'duck', 'pig'];
const fitScale = (id: string, px: number) => { const R = record(id); return px / Math.max(R.maxX - R.minX, -R.minY); };

const draw = (g: G, T: number) => {
  ensureDis();
  g.drawImage(board(), 0, 0);
  g.save(); g.translate(0, -45);   // the picture sits a little high: the bottom is the subtitles'

  // A · the cat under the lamp (0–5.9): it is there from the first frame; on "被车撞了" it rises away as dust;
  //     "很多人会难过一整天" plays over the empty pool of light
  const oA = fade(T, 0, 5.9, 0.01, 0.5);
  if (oA > 0) {
    g.save(); cam(g, 1 + 0.02 * T, 960, 600);
    const dim = 1 - 0.25 * eo(T, 3.6, 1.5);
    glow(g, 905, 230, 260, 0.38 * oA * dim);
    g.save(); g.globalAlpha = 0.24 * oA * dim; const cone = g.createLinearGradient(0, 230, 0, 800); cone.addColorStop(0, 'rgba(255,206,140,.9)'); cone.addColorStop(1, 'rgba(255,206,140,0.15)'); g.fillStyle = cone; g.beginPath(); g.moveTo(880, 240); g.lineTo(940, 240); g.lineTo(1220, 800); g.lineTo(760, 800); g.closePath(); g.fill(); g.restore();
    glow(g, 1010, 800, 340, 0.3 * oA * dim);
    line(g, wobbly(180, 802, 1740, 806, 60, 2, 1), 1, 5, oA);
    figure(g, 'lamp', 780, 800, 0.9, 1, oA);
    g.save(); clipStanding(g, CAT_DIS, T); figure(g, 'cat', 1040, 800, 1.15, 1, oA); g.restore();
    crumble(g, CAT_DIS, T, 2.4, oA);
    g.restore();
  }
  // B · Sudan (5.6–16.9): the savanna, the last male northern white rhino, his name; after the name he rises away,
  //     and the world's small lights come on over the place where he stood
  const oB = fade(T, 5.6, 16.9, 0.5, 0.5);
  if (oB > 0) {
    g.save(); cam(g, 1 + 0.012 * (T - 5.6), 960, 640);
    glow(g, 1500, 760, 520, 0.4 * eo(T, 5.8, 2.0) * oB);
    line(g, wobbly(120, 800, 1800, 798, 70, 3, 2), eo(T, 5.7, 1.2), 4.5, oB);
    for (const [x, sc, t0] of [[300, 1, 6.0], [1680, 0.8, 6.3]] as const) {
      const ty = 560 + (1 - sc) * 120;
      line(g, wobbly(x, 800, x + 6 * sc, ty, 10, 2, x), eo(T, t0, 0.7), 6, oB, '200,170,120');
      g.save(); g.globalAlpha = oB * eo(T, t0 + 0.4, 0.6); g.fillStyle = 'rgba(120,160,110,1)'; g.beginPath(); P.ell(x, ty, 170 * sc, 34 * sc, Math.PI, Math.PI * 2, 30).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); g.restore();
      line(g, [...P.ell(x, ty, 170 * sc, 34 * sc, Math.PI, Math.PI * 2, 30), [x - 170 * sc, ty]], eo(T, t0 + 0.4, 0.8), 4, oB, '200,230,190');
    }
    g.save(); clipStanding(g, RHINO_DIS, T);
    figure(g, 'rhino', 940, 800, 1.2, eo(T, 6.3, 2.0), oB, 0.05);
    const kn = eo(T, L(4) + 0.15, 0.9);
    if (kn > 0) { g.save(); g.globalAlpha = oB; g.beginPath(); g.rect(0, 0, 1180 + 220 * kn, 1080); g.clip(); g.drawImage(text('苏丹', 76, '#f4efe4', `700 ${SANS}`, 10), 1290 - 960, 360 - 200); g.restore(); line(g, [[1250, 410], [1150, 470]], kn, 4, oB * 0.8); }
    g.restore();
    crumble(g, RHINO_DIS, T, 2.6, oB);
    if (T > 14.2) { P.reseed(7); for (let i = 0; i < 80; i++) { const x = 80 + P.rand() * 1760, y = 60 + P.rand() * 560, t0 = 14.3 + P.rand() * 2.0; const a = eo(T, t0, 0.6) * (0.55 + 0.45 * Math.sin(T * 3 + i)) * oB; glow(g, x, y, 16 + P.rand() * 18, 0.85 * a); } }
    g.restore();
  }
  // C · the fly on the sill (16.8–22.5), unchanged: a soft shadow passes, the fly rises away, the window stays empty
  const oC = fade(T, 16.8, 22.5);
  if (oC > 0) {
    glow(g, 960, 470, 420, 0.13 * oC, '170,195,240');
    figure(g, 'window', 960, 830, 0.82, eo(T, 16.8, 1.4), oC);
    const sh = Math.min(eo(T, 19.75, 0.2), 1 - pr(T, 20.05, 0.35));
    if (sh > 0) { const gr = g.createRadialGradient(1100, 790, 0, 1100, 790, 200); gr.addColorStop(0, `rgba(4,6,10,${0.4 * sh})`); gr.addColorStop(1, 'rgba(4,6,10,0)'); g.fillStyle = gr; g.fillRect(900, 590, 400, 400); }
    g.save(); clipStanding(g, FLY_DIS, T); figure(g, 'fly', 1100, 820, 0.62, eo(T, 17.2, 1.0), oC); g.restore();
    crumble(g, FLY_DIS, T, 2.0, oC);
  }
  // D · fly, cat, rhino, each with a heart that fills with warm light (22.5–35), then all three crumble left to right (35–42)
  const oD = fade(T, 22.5, 47.6, 0.6, 1.0);
  if (oD > 0) {
    const fillK = eo(T, 28.4, 2.4);
    line(g, wobbly(200, 796, 1720, 799, 60, 2, 4), eo(T, 22.6, 1.2), 4, oD * 0.8);
    for (const d of DIS) {
      const f = front(d, T), hk = d.hk * fillK, remain = f < -1e8 ? 1 : clamp((d.hx + d.hs * 0.5 - f) / d.hs);
      if (hk > 0.3) glow(g, d.hx, d.hy, d.hs * 1.4 * hk, 0.32 * hk * oD * remain);
      g.save(); clipStanding(g, d, T);
      figure(g, d.id, d.x, d.y, d.s, eo(T, d.tin, d.din), oD, d.warm * fillK);
      heart(g, d.hx, d.hy, d.hs, hk, eo(T, d.th, 0.8), oD, false);
      g.restore();
      if (T < TITLE - 0.02) crumble(g, d, T);
    }
  }

  // ================================================================ the middle
  // M1 · the survey (46.6–63.8): a researcher asks; 52 kinds of life; the answer is a line of hearts that empty as life gets further from us
  const oM1 = fade(T, 46.6, L(20) - 0.1, 0.6, 0.6);
  if (oM1 > 0) {
    g.save(); cam(g, 1 + 0.02 * pr(T, 46.6, 17), 960, 600);
    const oR = fade(T, 46.6, L(16) - 0.1, 0.6, 0.6);
    person(g, 'researcher', 300, 830, 0.85, eo(T, 46.7, 1.4), oR, '研究者 · 法国');
    bubble(g, 1060, 300, 760, 210, -1, eo(T, 47.0, 0.7), oR * (1 - pr(T, L(15) - 0.2, 0.4)), ["Si vous ne pouviez en", "sauver qu'un, lequel ?"], true, 50);
    // 52 kinds of life
    for (let i = 0; i < 52; i++) {
      const id = GRID_IDS[(i * 7) % GRID_IDS.length], col = i % 13, row = Math.floor(i / 13);
      const x = 700 + col * 90 + (row % 2) * 30, y = 330 + row * 118, a = eo(T, L(15) + 0.1 + i * 0.018, 0.4) * oR;
      if (a > 0) figure(g, id, x, y + 40, fitScale(id, 74), 1, a);
    }
    const row: [string, number, number, number][] = [['we', 330, 0.5, 1], ['dog', 600, 0.52, 0.8], ['bird', 860, 0.62, 0.6], ['frog', 1110, 0.62, 0.42], ['fish', 1370, 0.62, 0.26], ['fly', 1620, 0.7, 0.08]];
    const oL = eo(T, L(16), 0.8) * oM1;
    if (oL > 0) {
      line(g, wobbly(200, 832, 1760, 834, 60, 2, 11), eo(T, L(16), 1.2), 4, oL);
      for (let i = 0; i <= 26; i++) line(g, [[220 + i * 58, 834], [220 + i * 58, i % 5 ? 852 : 866]], eo(T, L(16) + 0.2 + i * 0.03, 0.3), 3, oL * 0.8);
      row.forEach(([id, x, sc, k], i) => {
        figure(g, id, x, 825, sc, eo(T, L(16) + 0.3 + i * 0.25, 1.0), oL, 0.7 * k * eo(T, L(17), 1.5));
        heart(g, x, 450, 100, k * eo(T, L(17) + i * 0.15, 1.6), eo(T, L(16) + 1.4 + i * 0.2, 0.7), oL);
      });
      const kl = eo(T, L(19) + 0.3, 0.6) * oL;
      if (kl > 0) { g.save(); g.globalAlpha = kl; g.drawImage(text('像我们', 46, `rgb(${WARM})`, `700 ${SANS}`, 9), 330 - 960, 910 - 200); g.drawImage(text('不像我们', 46, `rgb(${CHALK})`, `700 ${SANS}`, 9), 1620 - 960, 910 - 200); g.restore(); line(g, [[480, 910], [1480, 910]], eo(T, L(19) + 0.3, 0.8), 3, kl * 0.7); }
    }
    g.restore();
  }
  // M2 · 庄子 and 惠子 on the bridge
  const S2 = L(20) - 0.3, oM2 = fade(T, S2, L(23) - 0.05, 0.6, 0.6);
  if (oM2 > 0) {
    g.save(); cam(g, 1 + 0.025 * pr(T, S2, 10), 960, 640);
    line(g, P.bez([140, 860], [600, 720], [1320, 720], [1780, 860], 50), eo(T, S2, 1.2), 5, oM2, '210,190,160');
    for (let i = -7; i <= 7; i++) { const x = 960 + i * 110, y = 860 - 140 * (1 - (i / 8.6) ** 2); line(g, [[x, y], [x, y - 60]], eo(T, S2 + 0.3 + (i + 7) * 0.04, 0.4), 3.5, oM2, '210,190,160'); }
    for (let i = 0; i < 5; i++) line(g, wobbly(260 + i * 300, 940 + (i % 2) * 18, 420 + i * 300, 940 + (i % 2) * 18, 12, 4, i), eo(T, S2 + 0.8 + i * 0.15, 0.6), 3, oM2 * 0.7, '150,190,230');
    const FISH_SWIM: [number, number, number, number, boolean][] = [[520, 912, 0.4, 46, false], [1010, 935, 0.36, -38, true], [1340, 905, 0.34, 52, false], [760, 950, 0.32, -30, true]];
    FISH_SWIM.forEach(([x0, y0, sc, v, fl], i) => { const t = T - S2, x = x0 + v * t, y = y0 + 6 * Math.sin(t * 1.7 + i * 2); figure(g, 'fish', x, y, sc, eo(T, S2 + 0.6 + i * 0.25, 1.0), oM2 * 0.95, 0, fl); });
    const lj = pr(T, L(21) + 0.4, 1.3);
    if (lj > 0 && lj < 1) {
      const lx = lerp(860, 1120, lj), ly = 910 - 230 * Math.sin(lj * Math.PI);
      g.save(); g.translate(lx, ly); g.rotate(lerp(-0.8, 0.8, lj)); figure(g, 'fish', 0, 0, 0.44, 1, oM2, 0.3); g.restore();
      for (const [px, t0] of [[860, L(21) + 0.4], [1120, L(21) + 1.6]] as const) { const k = pr(T, t0, 0.9); if (k > 0 && k < 1) line(g, P.ell(px, 930, 30 + 80 * k, 8 + 16 * k, 0, Math.PI * 2, 40), 1, 3, oM2 * (1 - k), '170,200,230'); }
    }
    person(g, 'zhuang', 330, 790, 0.8, eo(T, S2 + 0.2, 1.4), oM2, '庄子');
    person(g, 'hui', 1590, 790, 0.8, eo(T, S2 + 0.5, 1.4), oM2, '惠子');
    bubble(g, 760, 300, 600, 220, -1, eo(T, L(21), 0.6), oM2, ['儵鱼出游从容，', '是鱼之乐也。'], false, 60);
    bubble(g, 1190, 500, 560, 210, 1, eo(T, L(22), 0.6), oM2, ['子非鱼，', '安知鱼之乐？'], false, 64);
    g.restore();
  }
  // M3 · Nagel and the bat: a closed circle we cannot step into
  const S3 = L(23) - 0.15, oM3 = fade(T, S3, L(26) + 0.7, 0.6, 0.7);
  if (oM3 > 0) {
    g.save(); cam(g, 1 + 0.05 * eio(T, S3, 10), 1250, 560);
    person(g, 'nagel', 320, 830, 0.85, eo(T, S3 + 0.1, 1.4), oM3, '内格尔 · 1974');
    bubble(g, 860, 280, 600, 200, -1, eo(T, S3 + 0.4, 0.6), oM3, ['What is it like', 'to be a bat?'], true, 58);
    const by = 640 + 12 * Math.sin(T * 2.2), fl = 1 + 0.07 * Math.sin(T * 7);
    g.save(); g.translate(1360, by); g.scale(fl, 1); g.translate(-1360, -by); figure(g, 'bat', 1360, by, 1.15, eo(T, S3 + 0.8, 1.2), oM3); g.restore();
    line(g, P.ell(1360, by - 130, 270, 220, -Math.PI / 2, Math.PI * 1.5, 90), eo(T, L(24) + 0.2, 1.3), 6, oM3, WARM);
    const qk = eo(T, L(25) + 0.4, 0.5) * oM3;
    if (qk > 0) { g.save(); g.globalAlpha = qk; g.drawImage(text('?', 110, `rgb(${WARM})`, `700 ${SANS}`, 10), 1560 - 960, by - 330 - 200); g.restore(); }
    g.restore();
  }
  // M4 · where to draw the line: a row of lives; each thinker draws the boundary somewhere else
  const ROW: [string, number, number][] = [['we', 585, 0.62], ['dog', 880, 0.64], ['chicken', 1110, 0.62], ['fish', 1330, 0.74], ['fly', 1525, 0.8], ['flower', 1710, 1.3]];
  const rowLife = (oR: number, bx: number, allWarm: number, t0: number, hearts = 0, harm = 0) => {
    line(g, wobbly(450, 832, 1840, 834, 50, 2, 21), eo(T, t0, 1.0), 4, oR);
    ROW.forEach(([id, x, sc], i) => {
      const inside = Math.max(allWarm, clamp((bx - x) / 40 + 0.5));
      const o = oR * (0.35 + 0.65 * inside), p = eo(T, t0 + 0.2 + i * 0.2, 1.0);
      if (id === 'flower') flower(g, x, 830, 1.15, p, o, 0.8 * inside); else figure(g, id, x, 825, sc, p, o, 0.8 * inside);
      if (hearts > 0) { const hurt = (id === 'fish' || id === 'flower') ? harm : 0; heart(g, x, 440, 100, hearts * 0.7 * (1 - 0.55 * hurt), hearts, oR, false); }
    });
  };
  const S4 = L(26) + 0.05, E4 = 125.55, oM4 = fade(T, S4, E4, 0.6, 0.5);
  if (oM4 > 0) {
    const tB = L(30), tS = L(33), tW = L(39);
    // the camera: wide on Kant, a little in on Bentham, then Singer pushes toward the two hearts
    const s4 = 1 + 0.035 * eio(T, tB - 0.2, 1.2) - 0.035 * eio(T, tS - 0.2, 1.0) + 0.05 * eio(T, L(35), 3.0) - 0.05 * eio(T, tW - 0.3, 1.2);
    g.save(); cam(g, s4, 1000, 620);
    const bx = T < tB + 0.5 ? 690 : T < tW + 0.4 ? lerp(690, 1430, eio(T, tB + 0.5, 1.4)) : lerp(1430, 2300, eio(T, tW + 0.4, 1.8));
    const allWarm = eo(T, tW + 0.9, 1.4);
    rowLife(oM4, T > L(27) + 0.2 ? bx : -999, allWarm, S4);
    if (T > L(27) + 0.2) line(g, wobbly(bx, 400, bx, 880, 30, 3, 5).map(([a, b]) => [a + 3 * Math.sin(b / 40), b] as Pt), eo(T, L(27) + 0.3, 0.8), 7, oM4 * (1 - pr(T, tW + 1.6, 0.6)), WARM);
    const oK = fade(T, L(27) - 0.4, tB + 0.1, 0.5, 0.4), oBn = fade(T, tB - 0.1, tS + 0.1, 0.4, 0.4), oS = fade(T, tS - 0.1, tW + 0.1, 0.4, 0.4), oW = fade(T, tW - 0.1, E4, 0.4, 0.4);
    person(g, 'kant', 250, 830, 0.8, eo(T, L(27) - 0.3, 1.2), oK, '康德 · Kant');
    bubble(g, 880, 270, 860, 200, -1, eo(T, L(27) + 0.3, 0.6), oK, ['Der Mensch existiert als', 'Zweck an sich selbst.'], true, 52);
    person(g, 'bentham', 250, 830, 0.8, eo(T, tB, 1.2), oBn, '边沁 · Bentham');
    bubble(g, 940, 270, 1060, 200, -1, eo(T, L(31) + 0.1, 0.6), oBn, ['The question is not, Can they reason?', 'nor, Can they talk? but, Can they suffer?'], true, 44);
    person(g, 'singer', 250, 830, 0.8, eo(T, tS, 1.2), oS, '辛格 · 1975');
    bubble(g, 830, 270, 640, 170, -1, eo(T, tS + 0.3, 0.6), oS * (1 - pr(T, L(35) - 0.3, 0.4)), ['All animals are equal.'], true, 56);
    bubble(g, 830, 270, 500, 170, -1, eo(T, L(37) + 0.2, 0.6), oS, ['Speciesism.'], true, 62);
    if (T > L(35)) { const kk = eo(T, L(35) + 0.3, 1.4), oh = oS * (1 - pr(T, L(37) + 3, 0.6)); heart(g, 880, 520, 130, 0.75 * kk, eo(T, L(35) + 0.1, 0.5), oh); heart(g, 1110, 520, 130, 0.75 * kk, eo(T, L(35) + 0.25, 0.5), oh); }
    person(g, 'schweitzer', 250, 830, 0.8, eo(T, tW, 1.2), oW, '史怀哲 · Schweitzer', allWarm * 0.5);
    g.restore();
  }
  // M5 · Schweitzer on the river, 1915
  const S5 = 125.5, E5 = L(44) - 0.15, oM5 = fade(T, S5, E5, 0.5, 0.5);
  if (oM5 > 0) {
    g.save(); cam(g, 1 + 0.03 * pr(T, S5, E5 - S5), 900, 700);
    glow(g, 1500, 640, 520, 0.28 * oM5);
    line(g, wobbly(100, 700, 1820, 700, 60, 2, 31), eo(T, S5, 1.0), 3.5, oM5 * 0.6, '200,200,210');
    for (let i = 0; i < 7; i++) line(g, wobbly(150 + i * 240, 960 + (i % 3) * 22, 330 + i * 240, 960 + (i % 3) * 22, 12, 4, i + 3), eo(T, S5 + 0.3 + i * 0.1, 0.6), 3, oM5 * 0.6, '150,190,230');
    const dx = 320 * pr(T, S5, E5 - S5);
    for (const [hx, hs, t0] of [[330, 0.82, L(40) + 0.5], [1660, 0.72, L(40) + 1.0]] as const) {
      figure(g, 'hippo', hx, 905, hs, eo(T, t0, 1.0), oM5, 0, hx > 1000);
      for (let k = 0; k < 2; k++) line(g, P.ell(hx, 908, 230 * hs + k * 40, 12 + k * 6, 0, Math.PI, 30), eo(T, t0 + 0.3, 0.6), 3, oM5 * (0.7 - k * 0.3), '150,190,230');
    }
    figure(g, 'boat', 880 + dx, 905, 0.82, eo(T, S5 + 0.1, 1.2), oM5);
    person(g, 'schweitzer', 720 + dx, 805, 0.62, eo(T, S5 + 0.3, 1.2), oM5, '');
    nameTag(g, '史怀哲 · 1915', 720 + dx, 470, oM5 * eo(T, S5 + 1.0, 0.6));
    bubble(g, 1260, 290, 640, 170, -1, eo(T, L(41) + 0.3, 0.6), oM5 * (1 - pr(T, L(42) - 0.1, 0.3)), ['Ehrfurcht vor dem Leben.'], true, 50);
    bubble(g, 1220, 290, 940, 200, -1, eo(T, L(42) + 0.3, 0.6), oM5, ['Ich bin Leben, das leben will,', 'inmitten von Leben, das leben will.'], true, 46);
    g.restore();
  }
  // M6 · no ranking: the row again, every life warm, the same heart over each; "免不了伤害" dims two, "但不该毫无必要" lights them again
  const S6 = L(44) - 0.3, oM6 = fade(T, S6, L(47) - 0.1, 0.5, 0.5);
  if (oM6 > 0) {
    g.save(); cam(g, 1 + 0.03 * pr(T, S6, 8), 1000, 600);
    const harm = eo(T, L(45) + 0.3, 0.6) * (1 - eo(T, L(46) + 0.3, 0.8));
    rowLife(oM6, 9999, 1, S6, eo(T, S6 + 0.6, 0.8), harm);
    person(g, 'schweitzer', 250, 830, 0.8, 1, oM6, '史怀哲 · Schweitzer', 0.5);
    g.restore();
  }
  // M7 · Lecky: kindness as a circle that widens (family → class → nation → humanity → animals); then the rings close back in on us
  //      and slide to the centre, ending as exactly the small circle the ending starts from
  const S7 = L(47) - 0.2, HAND = L(53), oM7 = fade(T, S7, HAND + 0.05, 0.5, 0.05);
  if (oM7 > 0) {
    const oLk = fade(T, S7, L(50) + 1.4, 0.5, 0.5);
    person(g, 'lecky', 250, 830, 0.8, eo(T, S7 + 0.1, 1.2), oLk, '莱基 · 1869');
    bubble(g, 880, 270, 860, 200, -1, eo(T, S7 + 0.4, 0.6), oLk * (1 - pr(T, L(49) - 0.2, 0.4)), ['…soon the circle expanding…', 'and finally, the animal world.'], true, 46);
    const k = eio(T, L(51) + 0.1, 4.0), cx = lerp(1180, 960, k), cy = 700, ryk = lerp(0.5, 0.55, k);
    const rings: [number, number][] = [[150, L(48) + 0.4], [240, L(49) + 0.2], [320, L(49) + 0.9], [400, L(49) + 1.6], [490, L(50) + 0.3]];
    rings.forEach(([r0, t0], i) => {
      const r = lerp(r0, 190, k), oi = i === 0 ? 1 : 1 - clamp((k - 0.5) / 0.45);
      glow(g, cx, cy + 40 * k, lerp(r0 * 1.1, 190 * 1.15, k), lerp(0.1, i === 0 ? 0.38 : 0, k) * eo(T, t0, 1.0) * oM7 * oi);
      line(g, P.ell(cx, cy, r, r * ryk, -Math.PI / 2, Math.PI * 1.5, 100), eo(T, t0, 1.0), lerp(4.5, 6, k), oM7 * oi * (i === 4 ? 1 : 0.85), WARM);
    });
    const fo = 1 - clamp(k * 1.6);
    figure(g, 'we', lerp(1140, 960, k), lerp(770, 820, k), lerp(0.4, 0.6, k), eo(T, L(48) + 0.5, 0.8), oM7, 0.6);
    figure(g, 'p_long', cx + 50, 770, 0.36, eo(T, L(48) + 0.8, 0.8), oM7 * fo, 0.6);
    figure(g, 'p_cap', cx - 200, 790, 0.34, eo(T, L(49) + 0.3, 0.8), oM7 * fo, 0.4);
    figure(g, 'p_side', cx + 240, 790, 0.34, eo(T, L(49) + 1.0, 0.8), oM7 * fo, 0.4);
    figure(g, 'p_long', cx - 320, 800, 0.3, eo(T, L(49) + 1.7, 0.8), oM7 * fo, 0.3, true);
    figure(g, 'p_cap', cx + 340, 600, 0.26, eo(T, L(49) + 1.7, 0.8), oM7 * fo, 0.3);
    figure(g, 'dog', cx - 420, 820, 0.36, eo(T, L(50) + 0.4, 0.8), oM7 * fo, 0.3); figure(g, 'cat', cx + 430, 820, 0.38, eo(T, L(50) + 0.55, 0.8), oM7 * fo, 0.3); figure(g, 'bird', cx + 360, 520, 0.44, eo(T, L(50) + 0.7, 0.8), oM7 * fo, 0.3);
    line(g, wobbly(160, 822, 1760, 826, 60, 2, 8), eo(T, L(52), 1.4), 4, 0.6 * oM7);
  }
  // E · the ending: us in a small circle, everyone else outside, dim and cold. On the drop the circle blasts open, every life lights
  //     up and gets a full heart; then, line by line, more small lives arrive, each lit as it comes, and the camera pulls back on 庄子.
  const oE = fade(T, HAND, END + 2.5, 0.01, 1.2);
  if (oE > 0) {
    const td = T - DROP, warmAll = eo(T, L(59), 2.5), punch = td > 0 ? Math.exp(-td / 0.45) : 0;
    const r = T < 167.0 ? 190 : T < DROP ? lerp(190, 225, eio(T, 167.0, DROP - 167.0)) : lerp(225, 1700, eo(T, DROP, 0.75)), cx = 960, cy = 700, ry = 0.55;
    const pull = eio(T, L(58), 3.6), sE = (1 + 0.045 * punch) * lerp(1, 0.82, pull);
    g.save(); cam(g, sE, 960, 600);
    // warmth: a small pool in the circle before the drop; after it, a broad warm floor behind everyone, the board stays dark
    if (td < 0) glow(g, cx, cy + 40, r * 1.15, 0.4 * oE);
    else { glow(g, 960, 760, lerp(300, 1250, eo(T, DROP, 0.9)), 0.32 * oE); glow(g, 960, 760, 600, 0.12 * oE * warmAll); }
    if (td > 0) glow(g, cx, cy, 1500, 0.55 * Math.exp(-td / 0.5) * oE);
    line(g, wobbly(-300, 822, 2220, 826, 90, 2, 8), 1, 4, oE * 0.6);
    if (r < 1600) line(g, P.ell(cx, cy, r, r * ry, -Math.PI / 2, Math.PI * 1.5, 140), 1, 6, oE * (td > 0 ? 1 - clamp(td / 0.7) : 1), WARM);
    if (td > 0 && td < 1.0) line(g, P.ell(cx, cy, r * 1.2 + 200 * td, (r * 1.2 + 200 * td) * ry, 0, Math.PI * 2, 140), 1, 10 * (1 - td), oE * (1 - td), WARM);
    const beat = (i: number) => (T > L(59) ? 0.06 * Math.sin((T - L(59)) * 5.2 + i * 0.4) : 0);
    // who is there from the start (outside the circle until the drop) and who arrives after it
    type Who = [string, number, number, number, number, number?];   // id, x, y, s, t0 (draw on), heart size
    const crowd: Who[] = [['chicken', 330, 835, 0.55, HAND + 0.3], ['cat', 640, 830, 0.6, HAND + 0.4], ['dog', 1290, 830, 0.56, HAND + 0.5], ['rhino', 1640, 838, 0.52, HAND + 0.6],
      ['fly', 470, 560, 0.62, HAND + 0.7], ['frog', 790, 590, 0.56, HAND + 0.8], ['fish', 1150, 550, 0.56, HAND + 0.9], ['bird', 1480, 540, 0.6, HAND + 1.0]];
    const late: Who[] = [
      ['rabbit', 150, 832, 0.5, L(55) + 0.3], ['mouse', 820, 912, 0.5, L(55) + 0.6], ['butterfly', 1660, 330, 0.5, L(55) + 0.9],
      ['snail', 560, 914, 0.5, L(56) + 0.3], ['turtle', 1120, 914, 0.5, L(56) + 0.6], ['hedgehog', 250, 914, 0.5, L(56) + 0.9],
      ['duck', 1430, 910, 0.5, L(57) + 0.3], ['butterfly', 320, 350, 0.42, L(57) + 0.6], ['bat', 1240, 300, 0.48, L(57) + 0.9],
      ['pig', -60, 838, 0.5, L(58) + 0.6], ['rabbit', 1990, 836, 0.46, L(58) + 0.9], ['bird', 2060, 520, 0.55, L(58) + 1.2], ['snail', -150, 914, 0.45, L(58) + 1.4], ['mouse', 2090, 914, 0.45, L(58) + 1.6], ['duck', 1870, 912, 0.42, L(58) + 1.8],
    ];
    const heartFor = (id: string, x: number, y: number, s: number, k: number, size: number, i: number, extra = 0) => {
      const hs = size * (1 + beat(i) + extra), hy = topOf(id, y, s) - 30 - size * 0.45;
      heart(g, x, hy, hs, k, k, oE);
    };
    crowd.forEach(([id, x, y, s, t0], i) => {
      const d = Math.hypot((x - cx) / r, (y - 80 - cy) / (r * ry)), inside = clamp((1.1 - d) / 0.2);
      const sudan = id === 'rhino' ? eo(T, L(55) + 0.1, 0.6) : 0;
      if (sudan > 0) glow(g, x - 40, y - 120, 300, 0.3 * sudan * oE);
      figure(g, id, x, y, s, eo(T, t0, 1.2), oE * (0.3 + 0.7 * inside), Math.max(inside * 0.85, warmAll * 0.9, sudan));
      if (td > 0) {
        const k = eo(T, DROP + 0.05 + i * 0.03, 0.35), pop = 0.3 * Math.exp(-Math.max(0, td - i * 0.03) / 0.18);
        const flyPulse = id === 'fly' ? 0.55 * Math.exp(-Math.max(0, T - L(56) - 0.3) / 0.6) * (T > L(56) + 0.3 ? 1 : 0) : 0;
        const seen = T > L(57) + 0.5 ? 0.18 * Math.exp(-(T - L(57) - 0.5) / 0.5) : 0;
        heartFor(id, x, y, s, k, 74, i, pop + flyPulse + seen + (id === 'fly' ? 0.25 * eo(T, L(56) + 0.3, 0.6) : 0));
      }
    });
    late.forEach(([id, x, y, s, t0], i) => {
      const p = eo(T, t0, 1.0); if (p <= 0) return;
      figure(g, id, x, y, s, p, oE, Math.max(0.75, warmAll * 0.9));
      const k = eo(T, t0 + 0.4, 0.5), seen = T > L(57) + 0.5 && t0 < L(57) + 0.5 ? 0.18 * Math.exp(-(T - L(57) - 0.5) / 0.5) : 0;
      heartFor(id, x, y, s, k, 60, i + 9, seen);
    });
    const weSoft = eo(T, DROP + 0.2, 0.6);
    figure(g, 'we', 960, 820, 0.62, 1, oE * (1 - weSoft), 0.6 + 0.4 * eo(T, DROP, 0.4));
    figure(g, 'we_soft', 960, 820, 0.62, 1, oE * weSoft, 1);
    if (td > 0) { const k = eo(T, DROP + 0.02, 0.35); heartFor('we', 960, 820, 0.62, k, 80, 30); }
    if (td > 0) dust(g, cx, cy, td, 180, WARM);
    g.restore();
  }
  g.restore();
  // the title on the hit: every grain of the three lives' dust flies into the letters
  if (T >= TITLE - 0.02 && T < 47.6) {
    const o = 1 - pr(T, 46.4, 0.9), t = T - TITLE + 0.02;
    g.save(); g.translate(0, -45);
    glow(g, 960, 600, 820, 0.5 * Math.exp(-t / 0.5) * o);
    const tl = titleLayer();
    g.save(); g.globalAlpha = o * eo(t, 0.14, 0.34); g.drawImage(tl.img, 0, 0); g.restore();
    if (t < 0.75) {
      const k = 1 - Math.pow(1 - clamp(t / 0.3), 3), a = 0.95 * (1 - pr(t, 0.3, 0.4));
      for (const s0 of tl.snap) {
        const d = DIS[s0.d], q = dustAt(d, s0.i, TITLE - 0.02);
        const x = lerp(q.px, s0.tx, k), y = lerp(q.py, s0.ty, k);
        g.fillStyle = `rgba(${mix(d.cols[d.pts[s0.i][2]], WARM, 0.5 + 0.5 * k)},${a})`; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill();
      }
    }
    g.restore();
  }
  // the corner mark, quietly, between the title and the end card
  const oMark = Math.min(eo(T, 47.6, 0.8), 1 - pr(T, END - 0.6, 0.5));
  if (oMark > 0) { g.save(); g.globalAlpha = 0.5 * oMark; g.font = `500 26px ${SANS}`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = '#f3ede2'; g.fillText(`◆ ${JUNO.mark}`, 1876, 52); g.restore(); }
  // end card, on the track's own closing bars
  if (T >= END) {
    const o = eo(T, END, 0.45);
    g.fillStyle = `rgba(10,12,18,${0.8 * o})`; g.fillRect(0, 0, 1920, 1080);
    const tt = text('生命平等吗？', 140, JUNO.colors.gold, '"Ma Shan Zheng"');
    g.save(); g.globalAlpha = o * eo(T, END + 0.25, 0.6); g.drawImage(tt, 0, 120); g.restore();
    g.save(); g.globalAlpha = o * eo(T, END + 0.8, 0.6); g.drawImage(text('苍蝇，在你的圈里吗？评论区说说', 60, '#f4efe4', `700 ${SANS}`), 0, 300); g.restore();
    line(g, [...P.ell(960, 662, 330, 54, Math.PI, Math.PI * 3, 90)], eo(T, END + 1.2, 0.9), 3.5, o, WARM);
    g.save(); g.globalAlpha = o * eo(T, END + 1.5, 0.5); g.drawImage(text(JUNO.follow, 46, JUNO.colors.gold, `700 ${SANS}`), 0, 462); g.restore();
    g.save(); g.globalAlpha = o * eo(T, END + 1.9, 0.5);
    g.drawImage(text('资料：Miralles 等 2019 ·《庄子》· Nagel 1974 · Kant · Bentham 1789 · Singer 1975 · Schweitzer · Lecky 1869', 28, 'rgba(242,236,222,.75)', `400 ${SANS}`), 0, 590);
    g.drawImage(text('音乐：Cry For Me (feat. 愛海) · MICHITA', 28, 'rgba(242,236,222,.75)', `400 ${SANS}`), 0, 636);
    g.restore();
  }
};

export const Chalk: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const zh = Array.from(new Set(LINES.map((l) => l[2]).join('') + '生命平等吗？你的圈，画到了哪里评论区说说苍蝇在关注一起看懂世界资料等庄子音乐VIBE知识大赏—·◆研究者法国像我们不像惠子内格尔康德边沁辛格史怀哲莱基苏丹')).join('');
    Promise.all(['40px "Ma Shan Zheng"', '40px "PatrickHand"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '400 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, zh + 'SudanABCabc?0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return (
    <AbsoluteFill style={{ background: '#121620' }}>
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

/* ------------------------------------------------------------ model sheet: every character in the clear look */
export const SHEET_IDS = ['cat', 'rhino', 'fly', 'dog', 'chicken', 'bird', 'frog', 'fish', 'bat', 'hippo', 'rabbit', 'mouse', 'snail', 'turtle', 'butterfly', 'hedgehog', 'duck', 'pig',
  'researcher', 'zhuang', 'hui', 'nagel', 'kant', 'bentham', 'singer', 'schweitzer', 'lecky', 'we', 'we_soft', 'p_long', 'p_cap', 'p_side', 'lamp', 'boat'];
export const ChalkSheet: React.FC = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(['700 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, '研究者法国').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  return (
    <AbsoluteFill style={{ background: '#121620' }}>
      {ok && <Canvas dep={0} draw={(g) => {
        g.drawImage(board(), 0, 0);
        const animals = SHEET_IDS.slice(0, 18), people = SHEET_IDS.slice(18);
        animals.forEach((id, i) => { const c = i % 9, r = Math.floor(i / 9); const x = 110 + c * 212, y = 250 + r * 230; figure(g, id, x, y, fitScale(id, 170), 1, 1); g.drawImage(text(id, 22, '#9aa', `700 ${SANS}`), x - 960, y + 22 - 200); });
        people.forEach((id, i) => { const x = 70 + i * 118, y = 1000; const s = id === 'lamp' ? 0.42 : id === 'boat' ? 0.13 : 0.55; figure(g, id, x, y - (id === 'boat' ? 0 : 0), s, 1, 1, id === 'we_soft' ? 0.8 : 0); g.drawImage(text(id, 18, '#9aa', `700 ${SANS}`), x - 960, y + 20 - 200); });
        heart(g, 1820, 420, 120, 0.7, 1, 1);
      }} />}
    </AbsoluteFill>
  );
};
