import React from 'react';
import { staticFile } from 'remotion';
import { evolvePath } from '@remotion/paths';

/* ep13 《心流》 — a 3Blue1Brown-style kit: black, manim colours, Computer-Modern numbers,
   Create / Write / FadeIn / Transform / Indicate, all pure functions of T. */
export const W = 1920, H = 1080;
export const C = {
  bg: '#0C0C0E', white: '#ECECEC', grey: '#888888', dim: '#4A4A4E', line: '#BBBBBB',
  blue: '#58C4DD', teal: '#5CD0B3', green: '#83C167', yellow: '#FFFF00', gold: '#F0AC5F',
  red: '#FC6255', purple: '#9A72AC', pink: '#D147BD',
};
export const F = {
  zh: '"Noto Sans CJK SC", sans-serif',
  math: '"LMRoman", "Latin Modern Roman", serif',
  mono: '"DejaVu Sans Mono", monospace',
};
export const FontFaces: React.FC = () => (
  <style>{`
    @font-face { font-family: 'LMRoman'; src: url('${staticFile('fonts/lmroman10-regular.otf')}'); font-weight: 400; font-style: normal; }
    @font-face { font-family: 'LMRoman'; src: url('${staticFile('fonts/lmroman10-italic.otf')}'); font-weight: 400; font-style: italic; }
    @font-face { font-family: 'LMRoman'; src: url('${staticFile('fonts/lmroman10-bold.otf')}'); font-weight: 700; font-style: normal; }
  `}</style>
);

/* ---------- time helpers ---------- */
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (T: number, a: number, d: number) => (d <= 0 ? (T >= a ? 1 : 0) : clamp((T - a) / d));
/** manim's `smooth` rate function */
export const smooth = (t: number) => { const s = 10; const e = (x: number) => 1 / (1 + Math.exp(-s * (x - 0.5))); return clamp((e(t) - e(0)) / (e(1) - e(0))); };
export const sm = (T: number, a: number, d: number) => smooth(prog(T, a, d));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const there = (T: number, a: number, d: number) => (T < a ? 0 : sm(T, a, d));
/** in-then-out envelope */
export const life = (T: number, a: number, b: number, fi = 0.4, fo = 0.4) => Math.min(sm(T, a, fi), 1 - sm(T, b - fo, fo));

/* ---------- path helpers ---------- */
export type P2 = [number, number];
export const poly = (p: P2[]) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
export const graph = (f: (x: number) => number, x0: number, x1: number, n: number, map: (x: number, y: number) => P2) =>
  poly(Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return map(x, f(x)); }));

/** manim Create: stroke drawn from start to end */
export const Create: React.FC<{ d: string; k: number; stroke: string; w?: number; o?: number; fill?: string; fillO?: number; dash?: string; cap?: 'round' | 'butt' }> = ({ d, k, stroke, w = 4, o = 1, fill, fillO = 0, dash, cap = 'round' }) => {
  if (k <= 0.0005 || o <= 0.001) return null;
  if (k >= 0.9995 || dash) return <path d={d} stroke={stroke} strokeWidth={w} fill={fill ?? 'none'} fillOpacity={fillO} opacity={o} strokeLinecap={cap} strokeLinejoin="round" strokeDasharray={dash} />;
  const ev = evolvePath(k, d);
  return <path d={d} stroke={stroke} strokeWidth={w} fill={fill ?? 'none'} fillOpacity={fillO * k} opacity={o} strokeLinecap={cap} strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
};

/** manim Write for text: a soft wipe left→right with a short stroke lead, then filled */
let _wid = 0;
export const Write: React.FC<{ x: number; y: number; k: number; children: React.ReactNode; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; font?: string; weight?: number; ls?: string; o?: number; italic?: boolean; w?: number }> = ({ x, y, k, children, size, fill = C.white, anchor = 'middle', font = F.zh, weight = 400, ls, o = 1, italic, w = 2400 }) => {
  if (k <= 0.001 || o <= 0.001) return null;
  const id = `wr${(_wid = (_wid + 1) % 100000)}`;
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  const reveal = x0 + (w + 80) * k - 40;
  const style: React.CSSProperties = { fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: ls, fontStyle: italic ? 'italic' : undefined, fontFeatureSettings: "'tnum' 1" };
  const full = k >= 0.999;
  return (
    <g opacity={o}>
      {!full && (
        <defs>
          <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={reveal - 60} x2={reveal + 6} y1={0} y2={0}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
          <mask id={id} maskUnits="userSpaceOnUse" x={x0 - 100} y={y - size * 2} width={w + 400} height={size * 3}><rect x={x0 - 100} y={y - size * 2} width={w + 400} height={size * 3} fill={`url(#${id}g)`} /></mask>
        </defs>
      )}
      <text x={x} y={y} textAnchor={anchor} style={style} fill={fill} mask={full ? undefined : `url(#${id})`}>{children}</text>
      {!full && <text x={x} y={y} textAnchor={anchor} style={style} fill="none" stroke={fill} strokeWidth={1.2} opacity={0.9 * (1 - k)} mask={`url(#${id})`}>{children}</text>}
    </g>
  );
};

/** manim FadeIn(shift=UP) */
export const FadeUp: React.FC<{ k: number; dy?: number; children: React.ReactNode }> = ({ k, dy = 24, children }) =>
  k <= 0.001 ? null : <g opacity={k} transform={`translate(0,${(1 - k) * dy})`}>{children}</g>;

export const Txt: React.FC<{ x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; font?: string; weight?: number; o?: number; ls?: string; italic?: boolean; children: React.ReactNode }> = ({ x, y, size, fill = C.white, anchor = 'middle', font = F.zh, weight = 400, o = 1, ls, italic, children }) =>
  o <= 0.001 ? null : <text x={x} y={y} textAnchor={anchor} opacity={o} style={{ fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: ls, fontStyle: italic ? 'italic' : undefined, fontFeatureSettings: "'tnum' 1" }} fill={fill}>{children}</text>;

/** manim DecimalNumber */
export const fmt = (v: number, dp = 0) => v.toFixed(dp);

/** manim SurroundingRectangle, drawn with Create */
export const SurRect: React.FC<{ x: number; y: number; w: number; h: number; k: number; color?: string; sw?: number; o?: number }> = ({ x, y, w, h, k, color = C.yellow, sw = 3, o = 1 }) =>
  <Create d={`M${x},${y} H${x + w} V${y + h} H${x} Z`} k={k} stroke={color} w={sw} o={o} />;

/** manim Brace (pointing down by default), from x0 to x1 at y */
export const brace = (x0: number, x1: number, y: number, depth = 18) => {
  const m = (x0 + x1) / 2, q = depth / 2;
  return `M${x0},${y} Q${x0},${y + q} ${x0 + q * 1.4},${y + q} L${m - q * 1.4},${y + q} Q${m},${y + q} ${m},${y + depth} Q${m},${y + q} ${m + q * 1.4},${y + q} L${x1 - q * 1.4},${y + q} Q${x1},${y + q} ${x1},${y}`;
};

/** arrow from a to b with a filled tip */
export const Arrow: React.FC<{ a: P2; b: P2; k: number; color?: string; w?: number; tip?: number; o?: number }> = ({ a, b, k, color = C.white, w = 4, tip = 16, o = 1 }) => {
  if (k <= 0.001) return null;
  const ex = lerp(a[0], b[0], k), ey = lerp(a[1], b[1], k);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const bx = ex - Math.cos(ang) * tip, by = ey - Math.sin(ang) * tip;
  const l = [bx - Math.sin(ang) * tip * 0.55, by + Math.cos(ang) * tip * 0.55], r = [bx + Math.sin(ang) * tip * 0.55, by - Math.cos(ang) * tip * 0.55];
  return (
    <g opacity={o}>
      <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex},${ey} L${l[0]},${l[1]} L${r[0]},${r[1]} Z`} fill={color} />
    </g>
  );
};

/** manim Indicate: scale 1.2 and tint yellow, then back */
export const indicate = (T: number, at: number, d = 0.8) => { const t = prog(T, at, d); return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t); };

/* ---------- Gaussian ---------- */
export const gauss = (x: number, mu: number, s: number) => Math.exp(-0.5 * ((x - mu) / s) ** 2);
/** standard normal CDF */
export const Phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };

/* ---------- Wilson et al. 2019 learning-speed curve (Gaussian noise) ----------
   accuracy a = Φ(Δ); the expected gradient ∝ Δ·φ(Δ) → max at Δ = 1, a = Φ(1) = 84.13 %. Returned normalised to 1. */
export const learnRate = (acc: number) => {
  if (acc <= 0.5) return 0;
  // invert Φ by bisection
  let lo = 0, hi = 6; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Phi(m) < acc) lo = m; else hi = m; }
  const dlt = (lo + hi) / 2;
  return (dlt * Math.exp(-dlt * dlt / 2)) / Math.exp(-0.5);
};
export const ACC_STAR = 0.8413;
