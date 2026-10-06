import React from 'react';
import { staticFile } from 'remotion';
import { easeOut, easeInOut, lerp, clamp } from '../v6/ui6';
import tl from './tl12.json';

/* ep12 《为什么一年一眨眼》 — look A 底片灯箱 (a film editor's light table).
   Days are frames of footage; memory is the editor. One accent: grease-pencil cobalt.
   Every frame is a pure function of T (film seconds). Timings come from the aligned TTS voiceover (tl12.json). */
export { easeOut, easeInOut, lerp, clamp };
export const W = 1920, H = 1080;
export const A = '#2347E0', INK = '#121417', LAB = '#3D454B', SEC = '#59616A', TER = '#8D969C';
export const F = {
  sans: '"Noto Sans CJK SC", sans-serif',
  serif: '"Noto Serif CJK SC", serif',
  mono: '"DejaVu Sans Mono", monospace',
};
export const TNUM: React.CSSProperties = { fontFeatureSettings: "'tnum' 1" };

/* ---------- time ---------- */
export type Seg = { id: string; block: string; caption: string | null; gold: boolean; text: string; t0: number; t1: number; chars: [string, number][] };
export const SEGS = tl.segments as unknown as Seg[];
export const BLK = tl.blocks as unknown as Record<string, [number, number]>;
export const TITLE_T: number = tl.title_t;
export const VO_END: number = tl.vo_end;
export const FILM_END: number = tl.film_end;
export const EP12_FRAMES = Math.round(FILM_END * 30);
const byId: Record<string, Seg> = {};
SEGS.forEach((s) => (byId[s.id] = s));
const HZ = /[一-鿿0-9A-Za-z]/;
/** time of the first spoken character of `sub` inside segment `id` (or the segment start) */
export const cue = (id: string, sub?: string, add = 0): number => {
  const s = byId[id];
  if (!s) return 0;
  if (!sub) return s.t0 + add;
  const clean = [...sub].filter((c) => HZ.test(c)).join('');
  const hz = s.chars.map((c) => c[0]).join('');
  const k = hz.indexOf(clean);
  return (k < 0 ? s.t0 : s.chars[k][1]) + add;
};
export const segEnd = (id: string) => (byId[id] ? byId[id].t1 : 0);
/** scene boundary between two blocks: the middle of the gap */
export const bound = (a: string, b: string) => (BLK[a][1] + BLK[b][0]) / 2;

/* ---------- easing ---------- */
export const pr = (T: number, a: number, d: number) => clamp((T - a) / d);
export const eo = (T: number, a: number, d: number) => easeOut(pr(T, a, d));
export const eio = (T: number, a: number, d: number) => easeInOut(pr(T, a, d));
export const win = (T: number, a: number, z: number, fi = 0.3, fo = 0.3) => Math.min(easeOut(pr(T, a, fi)), 1 - pr(T, z - fo, fo));
export const pop = (T: number, a: number, d = 0.32) => {
  const k = pr(T, a, d);
  return k <= 0 ? 0 : easeOut(k) + 0.18 * Math.sin(k * Math.PI) * (1 - k);
};
export const spring = (T: number, a: number, freq = 2.2, decay = 5) => {
  if (T <= a) return 0;
  const t = T - a;
  return 1 - Math.exp(-decay * t) * Math.cos(2 * Math.PI * freq * t);
};
export const mix = (a: string, z: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pz = [1, 3, 5].map((i) => parseInt(z.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pz[i], clamp(k)))).join(',')})`;
};
export const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const cnt = (T: number, at: number, n: number, d = 0.8, dec = 0) => {
  const v = n * eo(T, at, d);
  return dec ? v.toFixed(dec) : String(Math.round(v));
};
export const drawOn = (p: number) => ({ pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - clamp(p) });

/* ---------- hand-drawn grease geometry (ported from style/lookA_*.html, seeded) ---------- */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const crPath = (pts: number[][], closed = false) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const N = closed ? n : n - 1;
  for (let i = 0; i < N; i++) {
    const p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
};
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed: number, turns = 1.12, wob = 0.035, tilt = 0) => {
  const r = rng(seed);
  const a0 = -Math.PI * 0.6 + r() * 0.6, N = Math.round(56 * turns), pts: number[][] = [];
  const p1 = r() * 6.28, p2 = r() * 6.28;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = a0 + t * turns * Math.PI * 2;
    const k = 1 + wob * Math.sin(a * 2 + p1) + wob * 0.6 * Math.sin(a * 3 + p2) + (t > 0.82 ? (t - 0.82) * 0.35 : 0) - (t < 0.08 ? (0.08 - t) * 0.5 : 0);
    const x = rx * k * Math.cos(a), y = ry * k * Math.sin(a);
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return crPath(pts);
};
export const roughLine = (x1: number, y1: number, x2: number, y2: number, seed: number, wob = 2.5, n = 6) => {
  const r = rng(seed), pts: number[][] = [];
  const nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n, o = i === 0 || i === n ? 0 : (r() - 0.5) * 2 * wob;
    pts.push([x1 + (x2 - x1) * t + (nx / L) * o, y1 + (y2 - y1) * t + (ny / L) * o]);
  }
  return crPath(pts);
};
export const roughCurve = (pts: number[][], seed: number, wob = 4) => {
  const r = rng(seed);
  return crPath(pts.map((p, i) => (i === 0 || i === pts.length - 1 ? p : [p[0] + (r() - 0.5) * wob, p[1] + (r() - 0.5) * wob])));
};
/** an arrow (shaft + two heads) ending at the last point */
export const Arrow: React.FC<{ pts: number[][]; p: number; seed: number; w?: number; head?: number }> = ({ pts, p, seed, w = 6, head = 26 }) => {
  const n = pts.length, [x2, y2] = pts[n - 1], [x1, y1] = pts[n - 2];
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h1 = [x2 - head * Math.cos(ang - 0.6), y2 - head * Math.sin(ang - 0.6)], h2 = [x2 - head * Math.cos(ang + 0.6), y2 - head * Math.sin(ang + 0.6)];
  const ps = clamp(p / 0.8), ph = clamp((p - 0.8) / 0.2);
  return (
    <g>
      <G d={roughCurve(pts, seed, 4)} p={ps} w={w} />
      <G d={roughLine(x2, y2, h1[0], h1[1], seed + 1, 1, 3)} p={ph} w={w} />
      <G d={roughLine(x2, y2, h2[0], h2[1], seed + 2, 1, 3)} p={ph} w={w} />
    </g>
  );
};
/** one grease stroke; put several inside <Grease> so the filter runs once */
export const G: React.FC<{ d: string; p?: number; w?: number; o?: number; color?: string }> = ({ d, p = 1, w = 7, o = 0.95, color = A }) =>
  p <= 0.001 || o <= 0.001 ? null : <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} {...drawOn(p)} />;
export const Grease: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => <g filter="url(#g12-grease)" opacity={o}>{children}</g>;
/** grease handwriting: text wiped on left → right */
export const GText: React.FC<{ x: number; y: number; p: number; size: number; text: string; anchor?: 'start' | 'middle' | 'end'; w?: number; color?: string; o?: number }> = ({ x, y, p, size, text, anchor = 'start', w, color = A, o = 1 }) => {
  if (p <= 0.001 || o <= 0.001) return null;
  const tw = w ?? [...text].reduce((s, c) => s + (/[一-鿿：，？！、…“”]/.test(c) ? size : size * 0.6), 0);
  const x0 = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
  const id = `gt-${Math.round(x)}-${Math.round(y)}-${text.length}`;
  return (
    <g opacity={o}>
      <clipPath id={id}><rect x={x0 - 10} y={y - size * 1.2} width={(tw + 20) * clamp(p)} height={size * 1.6} /></clipPath>
      <text x={x} y={y} textAnchor={anchor} clipPath={`url(#${id})`} style={{ fontFamily: F.sans, fontWeight: 900, fontSize: size }} fill={color}>{text}</text>
    </g>
  );
};

/* ---------- shared defs ---------- */
export const Defs12: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="g12-film" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1d2023" /><stop offset=".12" stopColor="#141618" /><stop offset=".5" stopColor="#17191c" /><stop offset=".88" stopColor="#121416" /><stop offset="1" stopColor="#1d2023" />
      </linearGradient>
      <linearGradient id="g12-img" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4147" /><stop offset="1" stopColor="#2a2f34" /></linearGradient>
      <linearGradient id="g12-imgKey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5d666d" /><stop offset="1" stopColor="#40474d" /></linearGradient>
      <linearGradient id="g12-imgDim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30363b" /><stop offset="1" stopColor="#25292d" /></linearGradient>
      <linearGradient id="g12-acc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a5cf0" /><stop offset="1" stopColor="#1d3cc4" /></linearGradient>
      <filter id="g12-lift" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity=".28" /></filter>
      <filter id="g12-liftHi" x="-8%" y="-30%" width="116%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#0b1a5c" floodOpacity=".30" /></filter>
      <filter id="g12-grease" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2320" height="1480">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.4} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.3 0.5" numOctaves={1} seed={8} result="n2" />
        <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
      {/* day pictograms (viewBox 100×60), light greys on the dark frame; no people */}
      <symbol id="pSea" viewBox="0 0 100 60">
        <circle cx="70" cy="19" r="9" fill="#c9d0d4" />
        <g fill="none" stroke="#b7bfc4" strokeWidth="2.8" strokeLinecap="round">
          <line x1="4" y1="33" x2="96" y2="33" /><path d="M8,42 q6,-5 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0" /><path d="M2,51 q6,-5 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0" />
        </g>
      </symbol>
      <symbol id="pBooks" viewBox="0 0 100 60">
        <g stroke="#2a2f34" strokeWidth="1.2">
          <rect x="22" y="47" width="58" height="8" fill="#8a939a" /><rect x="26" y="39" width="52" height="8" fill="#a3abb1" />
          <rect x="20" y="31" width="56" height="8" fill="#7b848b" /><rect x="25" y="23" width="54" height="8" fill="#9aa2a8" />
          <rect x="23" y="15" width="50" height="8" fill="#868f96" /><rect x="28" y="7" width="47" height="8" fill="#a9b1b6" />
        </g>
      </symbol>
      <symbol id="pDesk" viewBox="0 0 100 60">
        <rect x="58" y="6" width="34" height="26" fill="#5d666d" stroke="#aab2b8" strokeWidth="2" />
        <line x1="75" y1="6" x2="75" y2="32" stroke="#aab2b8" strokeWidth="1.6" /><line x1="58" y1="19" x2="92" y2="19" stroke="#aab2b8" strokeWidth="1.6" />
        <rect x="6" y="40" width="88" height="5" fill="#aab2b8" /><path d="M12,45 L12,58 M88,45 L88,58" stroke="#aab2b8" strokeWidth="3" />
        <rect x="16" y="31" width="30" height="5" fill="#8a939a" /><rect x="18" y="26" width="26" height="5" fill="#a3abb1" /><rect x="15" y="21" width="28" height="5" fill="#7b848b" />
      </symbol>
      <symbol id="pWalk" viewBox="0 0 100 60">
        <g fill="none" stroke="#8a939a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="30" x2="98" y2="30" /><path d="M30,58 L47,30 M70,58 L53,30" /><path d="M50,52 L50,47 M50,42 L50,38 M50,34 L50,32" />
          <path d="M80,30 L80,10 L86,10" /><path d="M14,30 L14,22" /><circle cx="14" cy="16" r="7" />
        </g>
      </symbol>
      <symbol id="pPost" viewBox="0 0 100 60">
        <g stroke="#e3e7e9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M36,54 L36,26 Q36,12 50,12 Q64,12 64,26 L64,54 Z" fill="#9aa3a9" />
          <line x1="43" y1="27" x2="57" y2="27" stroke="#2a2f34" strokeWidth="3.4" /><line x1="30" y1="54" x2="70" y2="54" />
          <rect x="66" y="4" width="22" height="15" rx="1.5" fill="#e3e7e9" stroke="none" />
          <path d="M66,4 L77,12 L88,4" fill="none" stroke="#7b848b" strokeWidth="1.8" />
        </g>
      </symbol>
      <symbol id="pPaper" viewBox="0 0 100 60">
        <g transform="rotate(-6 50 30)">
          <rect x="24" y="8" width="52" height="44" rx="1.5" fill="#d6dbde" /><rect x="29" y="13" width="42" height="7" fill="#5d666d" />
          <g stroke="#7b848b" strokeWidth="2.2" strokeLinecap="round"><line x1="29" y1="26" x2="48" y2="26" /><line x1="29" y1="32" x2="48" y2="32" /><line x1="29" y1="38" x2="48" y2="38" /><line x1="29" y1="44" x2="44" y2="44" /></g>
          <rect x="52" y="24" width="19" height="22" fill="#9aa3a9" /><line x1="50" y1="8" x2="50" y2="52" stroke="#aab2b8" strokeWidth="1.2" />
        </g>
      </symbol>
      <symbol id="pDrink" viewBox="0 0 100 60">
        <path d="M38,18 L62,18 L58,56 L42,56 Z" fill="#aab2b8" /><rect x="35" y="13" width="30" height="6" rx="2" fill="#e3e7e9" />
        <path d="M53,13 L57,2 L64,2" fill="none" stroke="#e3e7e9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M41,32 L59,32 L58.3,40 L41.7,40 Z" fill="#e3e7e9" />
      </symbol>
      <symbol id="pCafe" viewBox="0 0 100 60">
        <g fill="none" stroke="#c3cacf" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="16" y1="34" x2="84" y2="34" /><path d="M24,34 L24,56 M76,34 L76,56" /><path d="M8,22 L8,56 M8,40 L20,40 L20,56" /></g>
        <rect x="34" y="26" width="34" height="6" rx="1.5" fill="#e3e7e9" /><path d="M41,26 Q41,16 51,16 Q61,16 61,26 Z" fill="#aab2b8" />
        <path d="M46,13 q2,-4 0,-8 M52,13 q2,-4 0,-8" fill="none" stroke="#aab2b8" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="pBlur" viewBox="0 0 100 60">
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={rnd(i, 3) * 60} y={4 + rnd(i, 4) * 52} width={20 + rnd(i, 5) * 40} height={1.5 + rnd(i, 6) * 2.5} fill="#68727a" opacity={0.25 + rnd(i, 7) * 0.5} />)}
      </symbol>
      <symbol id="pTower" viewBox="0 0 100 60">
        <g stroke="#aab2b8" strokeWidth="1.6" fill="none"><path d="M40,58 L46,4 L54,4 L60,58" />{[12, 20, 28, 36, 44, 52].map((y) => <line key={y} x1={45.5 - (y - 4) * 0.11} y1={y} x2={54.5 + (y - 4) * 0.11} y2={y} />)}</g>
        <rect x="42" y="2" width="16" height="4" fill="#e3e7e9" />
      </symbol>
      <symbol id="pWheel" viewBox="0 0 100 60">
        <g fill="none" stroke="#c9d0d4" strokeWidth="1.8"><circle cx="50" cy="27" r="22" />{Array.from({ length: 8 }, (_, i) => <line key={i} x1="50" y1="27" x2={50 + 22 * Math.cos((i * Math.PI) / 4)} y2={27 + 22 * Math.sin((i * Math.PI) / 4)} />)}<path d="M40,58 L50,27 L60,58" /></g>
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={50 + 22 * Math.cos((i * Math.PI) / 4)} cy={27 + 22 * Math.sin((i * Math.PI) / 4)} r="2.6" fill="#f1e2c0" />)}
      </symbol>
    </defs>
  </svg>
);

/* ---------- the light table ---------- */
export const LightTable: React.FC<{ T: number; warm: number; on: number; gx: number }> = ({ T, warm, on, gx }) => {
  const fl = 1 - 0.01 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.55 * T)) - 0.006 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 1.9 * T + 1.3));
  const cool = ['#FCFDFB', '#F4F7F3', '#E6EBE6', '#D7DDD8'], wm = ['#FFF9EE', '#F8F0E2', '#EEE3D0', '#E2D5BF'], off = ['#15181B', '#101214', '#0C0E10', '#090A0C'];
  const c = cool.map((x, i) => mix(mix(x, wm[i], warm).replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) => '#' + [r, g, b].map((v: string) => (+v).toString(16).padStart(2, '0')).join('')), off[i], 1 - on));
  const cx = 50 + 1.5 * Math.sin((2 * Math.PI * T) / 9), cy = 40 + 1 * Math.sin((2 * Math.PI * T) / 13);
  const grid = mix('#C3CBC5', '#D5C9B4', warm);
  const ox = ((gx % 120) + 120) % 120;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <radialGradient id="g12-bl" cx={`${cx}%`} cy={`${cy}%`} r="82%" fx={`${cx}%`} fy={`${cy}%`}>
          <stop offset="0" stopColor={c[0]} /><stop offset=".46" stopColor={c[1]} /><stop offset=".82" stopColor={c[2]} /><stop offset="1" stopColor={c[3]} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#g12-bl)" />
      <rect width={W} height={H} fill="#000" opacity={(1 - fl) * on} />
      <g stroke={grid} strokeWidth={1} opacity={0.42 * on}>
        {Array.from({ length: 18 }, (_, i) => <line key={`v${i}`} x1={i * 120 - ox} y1={0} x2={i * 120 - ox} y2={H} />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={0} y1={60 + i * 120} x2={W} y2={60 + i * 120} />)}
      </g>
      {Array.from({ length: 8 }, (_, i) => {
        const x = ((rnd(i, 11) * W + T * (3 + rnd(i, 12) * 3) - gx * 0.98) % W + W) % W, y = rnd(i, 13) * H + Math.sin(T * 0.4 + i) * 8;
        return <circle key={i} cx={x} cy={y} r={1.2 + rnd(i, 14) * 2} fill="#8F989E" opacity={(0.18 + rnd(i, 15) * 0.17) * on} />;
      })}
    </svg>
  );
};
export const Grain: React.FC<{ T: number; o?: number }> = ({ T, o = 0.22 }) => {
  const f = Math.floor(T * 15);
  return <img src={staticFile('ep12_grain.png')} style={{ position: 'absolute', left: -8 + (rnd(f, 21) * 8), top: -8 + rnd(f, 22) * 8, width: W + 16, height: H + 16, opacity: o, mixBlendMode: 'multiply' }} />;
};

/* ---------- film strip ---------- */
export type Gauge = { h: number; band: number; hw: number; hh: number; hr: number; pitch: number; inset: number };
export const GA: Record<string, Gauge> = {
  hero: { h: 310, band: 45, hw: 20, hh: 22, hr: 4, pitch: 44, inset: 7 },
  card: { h: 116, band: 28, hw: 9, hh: 12, hr: 2, pitch: 18, inset: 8 },
  life: { h: 104, band: 28, hw: 10, hh: 13, hr: 2, pitch: 22, inset: 9 },
  bar: { h: 64, band: 10, hw: 8, hh: 6, hr: 1.5, pitch: 18, inset: 2 },
  wide: { h: 150, band: 30, hw: 12, hh: 14, hr: 2.5, pitch: 24, inset: 8 },
};
export type Fr = { x: number; w: number; state?: 'dim' | 'normal' | 'key' | 'lit' | 'acc'; pic?: string; picO?: number; label?: string; warm?: number; tint?: string };
export const Strip: React.FC<{ x0: number; x1: number; y: number; g: Gauge; perf?: 'bright' | 'dim' | 'dark'; frames?: Fr[]; hi?: boolean; edge?: [number, string][]; tc?: string; o?: number; perfOff?: number }> = ({ x0, x1, y, g, perf = 'dim', frames = [], hi = false, edge = [], tc, o = 1, perfOff = 0 }) => {
  if (o <= 0.001 || x1 - x0 < 1) return null;
  const pc = perf === 'bright' ? '#EEF2EE' : perf === 'dark' ? '#2A2F34' : '#8F989E';
  const holes: number[] = [];
  const start = x0 + 4 + (((perfOff % g.pitch) + g.pitch) % g.pitch);
  for (let hx = start; hx < x1 - g.hw; hx += g.pitch) holes.push(hx);
  const fy = y + g.band, fh = g.h - 2 * g.band;
  const fid = `cl-${Math.round(x0)}-${Math.round(y)}-${Math.round(x1)}`;
  return (
    <g opacity={o} filter={hi ? 'url(#g12-liftHi)' : 'url(#g12-lift)'}>
      <rect x={x0} y={y} width={x1 - x0} height={g.h} fill="url(#g12-film)" />
      {holes.map((hx, i) => (
        <g key={i}>
          <rect x={hx} y={y + g.inset} width={g.hw} height={g.hh} rx={g.hr} fill={pc} />
          <rect x={hx} y={y + g.h - g.inset - g.hh} width={g.hw} height={g.hh} rx={g.hr} fill={pc} />
        </g>
      ))}
      <clipPath id={fid}><rect x={x0} y={y} width={x1 - x0} height={g.h} /></clipPath>
      <g clipPath={`url(#${fid})`}>
        {frames.map((f, i) => {
          if (f.w <= 0.5) return null;
          const fill = f.state === 'key' ? 'url(#g12-imgKey)' : f.state === 'lit' ? (f.warm ? mix('#E4E9EB', '#F6EAD6', f.warm) : '#E4E9EB') : f.state === 'acc' ? 'url(#g12-acc)' : f.state === 'dim' ? 'url(#g12-imgDim)' : 'url(#g12-img)';
          const id = `fr-${fid}-${i}`;
          return (
            <g key={i}>
              <clipPath id={id}><rect x={f.x} y={fy} width={f.w} height={fh} rx={3} /></clipPath>
              <g clipPath={`url(#${id})`}>
                <rect x={f.x} y={fy} width={f.w} height={fh} fill={fill} />
                {f.tint && <rect x={f.x} y={fy} width={f.w} height={fh} fill={f.tint} opacity={0.28} />}
                {f.pic && <use href={`#${f.pic}`} x={f.x + (f.w - fh * (100 / 60)) / 2} y={fy + 1} width={fh * (100 / 60)} height={fh - 2} opacity={f.picO ?? (f.state === 'dim' ? 0.6 : 0.95)} />}
                {f.label && <text x={f.x + 5} y={fy + 13} style={{ fontFamily: F.mono, fontSize: 12 }} fill={f.state === 'lit' ? INK : '#768087'}>{f.label}</text>}
              </g>
            </g>
          );
        })}
      </g>
      {edge.map(([ex, s], i) => <text key={i} x={ex} y={y + g.band - 4} style={{ fontFamily: F.mono, fontSize: g.h > 200 ? 16 : 13, letterSpacing: '.08em' }} fill={TER}>{s}</text>)}
      {tc && <text x={x1 - 12} y={y + g.h - 4} textAnchor="end" style={{ fontFamily: F.mono, fontSize: 13 }} fill={TER}>{tc}</text>}
    </g>
  );
};
export const tcOf = (T: number) => {
  const s = Math.floor(T), fr = Math.floor((T - s) * 30);
  return `TC 00:00:${String(s % 60).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
};

/* ---------- text pieces (HTML) ---------- */
export const Chip: React.FC<{ label: string; size?: number; o?: number; s?: number }> = ({ label, size = 30, o = 1, s = 1 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', height: size + 18, padding: `0 14px 0 12px`, background: '#E1E6E2', border: '1.4px solid #7D868C', borderRadius: 5, boxShadow: '0 1.5px 2.4px rgba(0,0,0,.18)', opacity: o, transform: `scale(${s})`, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
    <span style={{ fontFamily: F.mono, fontSize: size * 0.62, color: SEC, marginRight: 4 }}>▸</span>
    <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: size, color: INK, letterSpacing: '.04em', lineHeight: 1 }}>{label}</span>
  </span>
);
/** the card header: 卷 tag · heading · English line · chip + researcher line. Appears from `a`; leaves (cross-slide) from `z`. */
export const Header: React.FC<{ T: number; a: number; z?: number; vol: string; field: string; title: string; titleSize?: number; titleChip?: string; eng: string; chip: string; line: React.ReactNode; chipPulse?: number }> = ({ T, a, z = 1e9, vol, field, title, titleSize = 96, titleChip, eng, chip, line, chipPulse = -1 }) => {
  const inK = eo(T, a, 0.35), outK = eio(T, z, 0.3);
  if (T < a - 0.01 || outK >= 1) return null;
  const dx = -60 * outK + 60 * (1 - eo(T, a, 0.3));
  const o = (1 - outK) * eo(T, a, 0.3);
  const pulse = chipPulse > 0 ? 1 + 0.1 * Math.sin(Math.PI * pr(T, chipPulse, 0.3)) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 330, opacity: o, transform: `translateX(${dx}px)` }}>
      <div style={{ position: 'absolute', top: 50, width: W, textAlign: 'center', fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '.18em', color: SEC, opacity: eo(T, a, 0.25) }}>
        <span style={{ fontFamily: F.mono, fontSize: 20, color: TER }}>▸ </span>第<span style={{ fontFamily: F.mono, fontWeight: 700, color: INK }}>{vol}</span>卷 · {field}
      </div>
      <div style={{ position: 'absolute', top: 104, width: W, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 22 }}>
        <div style={{ fontFamily: F.sans, fontWeight: 900, fontSize: titleSize, letterSpacing: '.04em', color: INK, lineHeight: 1.08, clipPath: `inset(-20px ${100 - 100 * inK}% -20px 0)`, whiteSpace: 'nowrap' }}>{title}</div>
        {titleChip && <div style={{ marginTop: 22, opacity: eo(T, a + 0.25, 0.22), transform: `scale(${lerp(1.25, 1, eo(T, a + 0.25, 0.22))})` }}><Chip label={titleChip} /></div>}
      </div>
      <div style={{ position: 'absolute', top: 218, width: W, textAlign: 'center', fontFamily: F.mono, fontSize: 24, letterSpacing: '.2em', color: SEC, opacity: eo(T, a + 0.1, 0.25) }}>{eng}</div>
      <div style={{ position: 'absolute', top: 256, width: W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'inline-block', opacity: eo(T, a + 0.15, 0.22), transform: `scale(${lerp(1.25, 1, eo(T, a + 0.15, 0.22)) * pulse}) rotate(${lerp(-2, 0, eo(T, a + 0.15, 0.22))}deg)` }}><Chip label={chip} /></span>
        <span style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, color: '#3B4248', opacity: eo(T, a + 0.2, 0.25), whiteSpace: 'nowrap', ...TNUM }}>{line}</span>
      </div>
    </div>
  );
};
/** an SVG text helper */
export const Tx: React.FC<{ x: number; y: number; size: number; w?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; serif?: boolean; mono?: boolean; ls?: string; children: React.ReactNode; tnum?: boolean; transform?: string }> = ({ x, y, size, w = 700, color = INK, anchor = 'start', o = 1, serif, mono, ls, children, tnum, transform }) =>
  o <= 0.001 ? null : (
    <text x={x} y={y} textAnchor={anchor} opacity={o} transform={transform} style={{ fontFamily: mono ? F.mono : serif ? F.serif : F.sans, fontWeight: w, fontSize: size, letterSpacing: ls, ...(tnum ? TNUM : {}) }} fill={color}>{children}</text>
  );
/** a plain token (pawn): no face, no arms */
export const Token: React.FC<{ x: number; y: number; s?: number; color?: string; rot?: number; o?: number }> = ({ x, y, s = 1, color = INK, rot = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-58} r={15} fill={color} />
    <path d="M-10,-40 L10,-40 L22,-4 Q22,0 18,0 L-18,0 Q-22,0 -22,-4 Z" fill={color} />
  </g>
);

/* ---------- captions + gold lines ---------- */
const Rich: React.FC<{ s: string; acc: string; bold?: number }> = ({ s, acc, bold = 700 }) => (
  <>{s.split(/(\[[^\]]+\])/).map((p, i) => (p.startsWith('[') ? <span key={i} style={{ color: acc, fontWeight: bold }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>))}</>
);
export const Captions: React.FC<{ T: number; dark?: (T: number) => boolean }> = ({ T }) => {
  const out: React.ReactNode[] = [];
  SEGS.forEach((s, i) => {
    if (!s.caption) return;
    const next = SEGS[i + 1];
    if (s.gold) {
      // gold line: holds until the next caption-bearing segment starts (or 0.6 s after it ends)
      let z = s.t1 + 0.6;
      for (let j = i + 1; j < SEGS.length; j++) {
        if (SEGS[j].caption) { z = SEGS[j].t0 - 0.02; break; }
        if (SEGS[j].block !== s.block) { z = Math.max(s.t1 + 0.15, SEGS[j].t0 - 0.02); break; }
      }
      const prevGold = i > 0 && SEGS[i - 1].gold && SEGS[i - 1].caption && SEGS[i - 1].block === s.block;
      const a = prevGold ? s.t0 + 0.02 : s.t0 - 0.12;
      if (T < a || T > z) return;
      const k = eo(T, a, 0.35), fo = 1 - pr(T, z - 0.12, 0.12);
      const band = eo(T, a + 0.2, 0.4);
      out.push(
        <div key={s.id} style={{ position: 'absolute', left: 0, width: W, top: 872 + 12 * (1 - k), textAlign: 'center', opacity: k * fo }}>
          <span style={{ position: 'relative', fontFamily: F.serif, fontWeight: 900, fontSize: 60, letterSpacing: '.06em', color: A, textShadow: '0 0 14px rgba(255,255,255,.9), 0 0 3px rgba(255,255,255,.9)' }}>
            {s.caption.split(/(\[[^\]]+\])/).map((p, k2) => p.startsWith('[') ? (
              <span key={k2} style={{ background: `linear-gradient(transparent 78%, rgba(35,71,224,.16) 78%, rgba(35,71,224,.16) 94%, transparent 94%) no-repeat 0 0 / ${band * 100}% 100%` }}>{p.slice(1, -1)}</span>
            ) : <span key={k2}>{p}</span>)}
          </span>
        </div>,
      );
      return;
    }
    const a = s.t0 - 0.06, z = next && next.caption ? (next.gold ? Math.min(s.t1 + 0.1, next.t0 - 0.16) : Math.min(s.t1 + 0.12, next.t0 - 0.04)) : s.t1 + 0.25;
    if (T < a || T > z) return;
    const o = (a <= 0.01 ? 1 : eo(T, a, 0.12)) * (1 - pr(T, z - 0.1, 0.1));
    out.push(
      <div key={s.id} style={{ position: 'absolute', left: 0, width: W, top: 900, textAlign: 'center', opacity: o, fontFamily: F.sans, fontWeight: 500, fontSize: 38, letterSpacing: '.05em', lineHeight: '48px', color: '#16181A', textShadow: '0 0 10px rgba(255,255,255,.85), 0 0 2px rgba(255,255,255,.9)', ...TNUM }}>
        <Rich s={s.caption} acc={A} />
      </div>,
    );
  });
  return <>{out}</>;
};
/** is a gold line on screen at T (for the focus rule) */
export const goldOn = (T: number) => SEGS.some((s) => s.gold && T > s.t0 - 0.2 && T < s.t1 + 0.4);
export const Mark: React.FC<{ onDark: number; o?: number }> = ({ onDark, o = 1 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: 'absolute', top: 44, right: 56, opacity: o, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: onDark > 0.5 ? 'rgba(243,237,226,.55)' : 'rgba(22,24,26,.52)' }}>
      <span style={{ color: onDark > 0.5 ? '#F1C56D' : '#C8913A' }}>◆ </span>Juno · VIBE知识大赏
    </div>
  );
/** layer wrapper: full-frame absolutely positioned svg */
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>{children}</svg>
);
export const Layer: React.FC<{ x?: number; y?: number; s?: number; cx?: number; cy?: number; o?: number; children: React.ReactNode }> = ({ x = 0, y = 0, s = 1, cx = 960, cy = 540, o = 1, children }) =>
  o <= 0.001 ? null : <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${x}px, ${y}px) scale(${s})` }}>{children}</div>;
