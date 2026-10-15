/* games26 light toolkit (from nobel26b v2): the whole film in light: gold light on black, trails, sparks, text made of particles.
   Replaces the paper/ink documentary scenes; the canvas does the light, HTML carries crisp labels. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, H, LNUM, Canvas, glowDot, Note, Slate, Chapter, clamp, pr, eo, eio, lerp, pop, hit, rnd, easeInOut, easeOut } from './kit';
import { CUT, bt } from './time';

/* ================================================================ toolkit */
export type P = [number, number];
export const GOLD = '255,214,140', TEAL = '127,214,200', RED = '255,120,90', WHITE = '255,244,220', BLUE = '120,180,255', MAG = '255,110,200';
export const dust = (g: CanvasRenderingContext2D, T: number, n = 420, a = 1) => {
  for (let i = 0; i < n; i++) {
    const z = rnd(i, 3), x = (rnd(i, 1) * W + T * (4 + 10 * z)) % W, y = (rnd(i, 2) * H - T * (3 + 8 * z) + H * 4) % H;
    g.fillStyle = `rgba(255,224,170,${a * (0.03 + 0.14 * z) * (0.6 + 0.4 * Math.sin(T * (0.6 + z) + i))})`;
    g.fillRect(x, y, 1 + z * 1.6, 1 + z * 1.6);
  }
};
/** a glowing polyline: wide faint halo + mid + bright core; optional bright head */
export const trail = (g: CanvasRenderingContext2D, pts: P[], col = GOLD, w = 3, a = 1, head = true) => {
  if (pts.length < 2) return;
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  [[w * 7, 0.05], [w * 3.2, 0.12], [w * 1.6, 0.35], [w * 0.7, 0.9]].forEach(([lw, al], k) => {
    g.strokeStyle = k === 3 ? `rgba(${WHITE},${al * a})` : `rgba(${col},${al * a})`; g.lineWidth = lw; path(); g.stroke();
  });
  if (head) { const [x, y] = pts[pts.length - 1]; glowDot(g, x, y, w * 10, 0.6 * a, col); glowDot(g, x, y, w * 2.5, 0.9 * a, WHITE); }
};
/** a burst of sparks from (x, y) that started at t0 */
export const sparks = (g: CanvasRenderingContext2D, x: number, y: number, t0: number, T: number, n = 60, col = GOLD, power = 1, seed = 0) => {
  const age = T - t0; if (age < 0 || age > 1.6) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(i, seed + 1) * Math.PI * 2, sp = (60 + 260 * rnd(i, seed + 2)) * power;
    const px = x + Math.cos(a) * sp * age * (1 - age * 0.35), py = y + Math.sin(a) * sp * age * (1 - age * 0.35) + 90 * age * age;
    const al = (1 - age / 1.6) * (0.4 + 0.6 * rnd(i, seed + 3));
    g.strokeStyle = `rgba(${col},${al})`; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(px, py); g.lineTo(px - Math.cos(a) * 10 * (1 - age), py - Math.sin(a) * 10 * (1 - age)); g.stroke();
  }
  glowDot(g, x, y, 120 * power * Math.exp(-age / 0.25), 0.5 * Math.exp(-age / 0.3), col);
};
/** sample the pixels of a text into points (cached; deterministic) */
const TEXT_CACHE: Record<string, P[]> = {};
export const textPts = (text: string, font: string, cx: number, cy: number, step = 3): P[] => {
  const key = `${text}|${font}|${cx}|${cy}|${step}`;
  if (TEXT_CACHE[key]) return TEXT_CACHE[key];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!; g.fillStyle = '#fff'; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cx, cy);
  const d = g.getImageData(0, 0, W, H).data, out: P[] = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) out.push([x, y]);
  TEXT_CACHE[key] = out; return out;
};
/** particles flying from scattered seeds into a text, landing at `land` (ease-in: they accelerate into place) */
export const particleText = (g: CanvasRenderingContext2D, pts: P[], T: number, from: number, land: number, col = GOLD, seed = 0, spread = 900, scatterK = 0) => {
  const k = clamp((T - from) / (land - from)), e = k * k * k;
  for (let i = 0; i < pts.length; i++) {
    const [tx, ty] = pts[i];
    const a = rnd(i, seed + 5) * 6.283, r = spread * (0.3 + rnd(i, seed + 6));
    const sx = tx + Math.cos(a) * r, sy = ty + Math.sin(a) * r * 0.6;
    let x = sx + (tx - sx) * e, y = sy + (ty - sy) * e;
    if (scatterK > 0) { const b = rnd(i, seed + 7) * 6.283, s = scatterK * (20 + 140 * rnd(i, seed + 8)); x += Math.cos(b) * s; y += Math.sin(b) * s + scatterK * 40 * rnd(i, 9); }
    const tw = 0.65 + 0.35 * Math.sin(T * 3 + i * 0.7);
    const al = (k < 1 ? 0.25 + 0.75 * e : tw) * (1 - 0.6 * scatterK);
    g.fillStyle = `rgba(${col},${al})`; g.fillRect(x, y, 1.8, 1.8);
  }
};
export const bg = (g: CanvasRenderingContext2D, T: number, a = 1) => { g.fillStyle = '#050506'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; dust(g, T, 420, a); };
export const camT = (g: CanvasRenderingContext2D, s: number, cx = 960, cy = 540) => { g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); };
export const Light: React.FC<{ f: number; draw: (g: CanvasRenderingContext2D) => void; children?: React.ReactNode; o?: number }> = ({ f, draw, children, o = 1 }) => (
  <AbsoluteFill style={{ background: '#050506', opacity: o }}>
    <Canvas dep={f} draw={(g) => { draw(g); g.globalCompositeOperation = 'source-over'; }} />
    {children}
  </AbsoluteFill>
);
export const Lbl: React.FC<{ x: number; y: number; s: string; size?: number; col?: string; o?: number; serif?: boolean; ls?: string; anchor?: 'left' | 'right' | 'center' }> = ({ x, y, s, size = 28, col = C.cream, o = 1, serif = true, ls = '0.08em', anchor = 'left' }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', top: y, opacity: o, whiteSpace: 'nowrap', fontFamily: serif ? F.serif : F.sans, fontWeight: 700, fontSize: size, letterSpacing: ls, color: col, textShadow: `0 0 18px rgba(${GOLD},.25)`, ...LNUM,
      ...(anchor === 'left' ? { left: x } : anchor === 'right' ? { right: W - x } : { left: x - 1000, width: 2000, textAlign: 'center' as const }) }}>{s}</div>
  );

/* ================================================================ G1 · the sentence (0 – 8.51) */
const LINE1 = 'exceptionally low levels for the federal funds rate';
