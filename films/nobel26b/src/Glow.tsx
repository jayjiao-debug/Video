/* v2 · the whole film in light: gold light on black, trails, sparks, text made of particles.
   Replaces the paper/ink documentary scenes; the canvas does the light, HTML carries crisp labels. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, H, LNUM, Canvas, glowDot, Note, Slate, Chapter, clamp, pr, eo, eio, lerp, pop, hit, rnd, easeInOut, easeOut } from './kit';
import { CUT, bt } from './time';
import { JUNO } from './brand/identity';
import sim from './sim.json';

/* ================================================================ toolkit */
type P = [number, number];
const GOLD = '255,214,140', TEAL = '127,214,200', RED = '255,120,90', WHITE = '255,244,220';
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
const particleText = (g: CanvasRenderingContext2D, pts: P[], T: number, from: number, land: number, col = GOLD, seed = 0, spread = 900, scatterK = 0) => {
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
const bg = (g: CanvasRenderingContext2D, T: number, a = 1) => { g.fillStyle = '#050506'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; dust(g, T, 420, a); };
const camT = (g: CanvasRenderingContext2D, s: number, cx = 960, cy = 540) => { g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); };
const Light: React.FC<{ f: number; draw: (g: CanvasRenderingContext2D) => void; children?: React.ReactNode; o?: number }> = ({ f, draw, children, o = 1 }) => (
  <AbsoluteFill style={{ background: '#050506', opacity: o }}>
    <Canvas dep={f} draw={(g) => { draw(g); g.globalCompositeOperation = 'source-over'; }} />
    {children}
  </AbsoluteFill>
);
const Lbl: React.FC<{ x: number; y: number; s: string; size?: number; col?: string; o?: number; serif?: boolean; ls?: string; anchor?: 'left' | 'right' | 'center' }> = ({ x, y, s, size = 28, col = C.cream, o = 1, serif = true, ls = '0.08em', anchor = 'left' }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', top: y, opacity: o, whiteSpace: 'nowrap', fontFamily: serif ? F.serif : F.sans, fontWeight: 700, fontSize: size, letterSpacing: ls, color: col, textShadow: `0 0 18px rgba(${GOLD},.25)`, ...LNUM,
      ...(anchor === 'left' ? { left: x } : anchor === 'right' ? { right: W - x } : { left: x - 1000, width: 2000, textAlign: 'center' as const }) }}>{s}</div>
  );

/* ================================================================ G1 · the sentence (0 – 8.51) */
const LINE1 = 'exceptionally low levels for the federal funds rate';
const LINE2 = 'at least through mid-2013';
export const G1: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const push = eio(T, 4.46, 4.0);
  const typedN = Math.max(0, Math.floor((T - 1.0) * 26));
  return (
    <Light f={f} draw={(g) => {
      bg(g, T, eo(T, 0.4, 0.8));
      g.save(); camT(g, lerp(1.0, 1.14, push), 960, 560);
      // the scan line on the first hit
      const sc = hit(T, 0.4, 0.35);
      if (T >= 0.4) { g.fillStyle = `rgba(${GOLD},${0.5 * sc})`; g.fillRect(0, 539, W, 2); glowDot(g, 960, 540, 600 * sc + 10, 0.25 * sc); }
      // line 1 typed in cream light
      if (typedN > 0) {
        g.font = '400 34px "DejaVu Sans Mono"'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const s = LINE1.slice(0, typedN); const full = g.measureText(LINE1).width, x0 = 960 - full / 2;
        g.textAlign = 'left'; g.fillStyle = `rgba(239,232,218,${0.75 * (1 - 0.35 * push)})`; g.fillText(s, x0, 470);
        if (typedN < LINE1.length) glowDot(g, x0 + g.measureText(s).width + 8, 470, 26, 0.6);
      }
      // line 2: particles converge into the words on the B hit (4.46)
      const pts = textPts(LINE2, '400 76px "DejaVu Sans Mono"', 960, 600, 2);
      if (T > 3.7) particleText(g, pts, T, 3.7, 4.46, GOLD, 11, 700);
      if (T > 4.46) { sparks(g, 960, 600, 4.46, T, 90, GOLD, 2.2, 3); glowDot(g, 960, 600, 520, 0.12 + 0.05 * Math.sin(T * 2)); }
      g.restore();
    }}>
      <Slate a="WASHINGTON, D.C." b="2011.08.09  14:15" o={eo(T, 1.0, 0.5)} />
      <Lbl x={960} y={380} s="FEDERAL RESERVE · PRESS RELEASE" size={18} serif={false} col={C.dim} ls="0.4em" anchor="center" o={eo(T, 0.6, 0.6) * (1 - push * 0.5)} />
      <Chapter n="I" t="一句话" o={eo(T, 1.3, 0.5)} />
    </Light>
  );
};

/* ================================================================ G2 · the market as a light trail (8.51 – 15.9) */
const G2_END = 15.9;
export const G2: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const MARK = bt(20), LAND = bt(22), STAMP = bt(24);
  const N = 120, pts: P[] = [];
  const X = (u: number) => 220 + u * 1260, Y = (v: number) => 800 - v * 540;
  for (let i = 0; i < N; i++) { const u = i / (N - 1); const v = u < 0.62 ? 0.62 + 0.05 * Math.sin(i * 0.42) * (1 - u) : 0.62 - 0.5 * easeOut((u - 0.62) / 0.3); pts.push([X(u), Y(Math.max(0.12, v))]); }
  const drawK = T < MARK ? lerp(0, 0.62, eo(T, CUT.yield + 0.1, MARK - CUT.yield - 0.1)) : lerp(0.62, 1, eio(T, MARK, LAND - MARK));
  const n = Math.max(2, Math.floor(drawK * (N - 1)) + 1);
  const end = pts[N - 1];
  const out = 1 - pr(T, G2_END - 0.3, 0.3);
  return (
    <Light f={f} o={out} draw={(g) => {
      bg(g, T);
      g.save(); camT(g, lerp(1.0, 1.06, pr(T, CUT.yield, 7)), 1150, 600);
      for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(${GOLD},0.06)`; g.lineWidth = 1; g.setLineDash([2, 10]); g.beginPath(); g.moveTo(220, Y(0.2 + k * 0.2)); g.lineTo(1480, Y(0.2 + k * 0.2)); g.stroke(); }
      g.setLineDash([]);
      if (T > MARK) { const a = eo(T, MARK, 0.3); g.fillStyle = `rgba(${GOLD},${0.35 * a})`; g.fillRect(X(0.62), 250, 1.5, 560); glowDot(g, X(0.62), 250, 30, 0.5 * a); sparks(g, X(0.62), pts[Math.floor(0.62 * (N - 1))][1], MARK, T, 30, GOLD, 0.7, 4); }
      trail(g, pts.slice(0, n), T < MARK ? WHITE : GOLD, 2.6);
      if (T >= LAND) { sparks(g, end[0], end[1], LAND, T, 110, GOLD, 1.6, 7); glowDot(g, end[0], end[1], 60, 0.35); }
      g.restore();
    }}>
      <Lbl x={220} y={210} s="两年期美国国债利率 · 2011年8月9日" size={30} o={eo(T, CUT.yield + 0.1, 0.5)} />
      <Lbl x={X(0.62) + 14} y={262} s="14:15 声明发布" size={18} col={C.gold} serif={false} ls="0.2em" o={eo(T, MARK, 0.3)} />
      <div style={{ position: 'absolute', left: end[0] + 34, top: end[1] - 50, opacity: clamp(pop(T, LAND, 0.3)), transform: `scale(${pop(T, LAND, 0.3)})`, transformOrigin: '0 50%' }}>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 72, color: C.goldHi, textShadow: `0 0 30px rgba(${GOLD},.6)`, ...LNUM }}>0.20%</div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: C.gold }}>收盘 · 历史最低</div>
      </div>
      <div style={{ position: 'absolute', left: 1580, top: 300, width: 240, padding: '22px 0', border: `1.5px solid rgba(${GOLD},.45)`, boxShadow: `0 0 30px rgba(${GOLD},.15), inset 0 0 30px rgba(${GOLD},.08)`, textAlign: 'center', opacity: eo(T, LAND + 0.3, 0.4) }}>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>政策利率</div>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 58, color: C.cream, marginTop: 6, ...LNUM }}>0–0.25%</div>
        {T >= STAMP - 0.08 && <div style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', border: `2px solid ${C.red}`, color: '#ff8a6e', boxShadow: '0 0 18px rgba(255,120,90,.5)', fontFamily: F.serif, fontWeight: 900, fontSize: 24, letterSpacing: '0.3em', transform: `rotate(-6deg) scale(${lerp(1.6, 1, eo(T, STAMP - 0.08, 0.08))})`, opacity: eo(T, STAMP - 0.08, 0.06) }}>未变</div>}
      </div>
      <Note x={220} y={830} s="走势为示意 · 收盘 0.20% 为当日实际（CNN Money）" o={eo(T, CUT.yield + 0.6, 0.5)} />
      <Slate a="NEW YORK" b="同日收盘" o={eo(T, CUT.yield + 0.3, 0.5)} />
    </Light>
  );
};

/* ================================================================ G3 · the title assembles from light on the strongest hit */
export const G3_START = G2_END;
export const G3: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const HIT = CUT.title;
  const crisp = eo(T, HIT + 0.05, 0.4);
  const ring = eio(T, HIT + 0.1, 0.7);
  const out = 1 - pr(T, CUT.laur - 0.25, 0.25);
  return (
    <Light f={f} o={out} draw={(g) => {
      bg(g, T, 0.7);
      const pts = textPts('《一句话，让钱变便宜》', '900 112px "Noto Serif CJK SC"', 960, 548, 3);
      particleText(g, pts, T, G3_START, HIT, GOLD, 21, 1100);
      if (T >= HIT) { sparks(g, 960, 548, HIT, T, 160, GOLD, 3.2, 9); g.fillStyle = `rgba(${WHITE},${0.6 * hit(T, HIT, 0.25)})`; g.fillRect(260, 547, 1400, 3); }
      glowDot(g, 960, 548, 700, 0.1 * crisp);
    }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="g3g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <circle cx={960} cy={340} r={92} fill="none" stroke={C.gold} strokeWidth={1.4} opacity={0.8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 340)" style={{ filter: `drop-shadow(0 0 8px rgba(${GOLD},.7))` }} />
        <g opacity={eo(T, HIT + 0.3, 0.4)}>
          <text x={960} y={332} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', ...LNUM }} fill={C.gold}>2026</text>
          <text x={960} y={368} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 19, letterSpacing: '0.35em' }} fill={C.gold}>经济学奖</text>
        </g>
        <text x={960} y={588} textAnchor="middle" opacity={crisp * 0.85} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 112, letterSpacing: '0.04em' }} fill="url(#g3g)">《一句话，让钱变便宜》</text>
        <text x={960} y={712} textAnchor="middle" opacity={eo(T, HIT + 0.5, 0.5)} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>HALL · WOODFORD · 2026</text>
      </svg>
    </Light>
  );
};

/* ================================================================ G4 · the laureates, cards traced in light (20.66 – 28.76) */
const rectPerim = (x: number, y: number, w: number, h: number, k: number): P[] => {
  const L = 2 * (w + h), d = k * L, pts: P[] = [[x, y]];
  const corners: P[] = [[x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  let acc = 0, prev: P = [x, y];
  for (const c of corners) {
    const seg = Math.hypot(c[0] - prev[0], c[1] - prev[1]);
    if (acc + seg >= d) { const u = (d - acc) / seg; pts.push([prev[0] + (c[0] - prev[0]) * u, prev[1] + (c[1] - prev[1]) * u]); return pts; }
    pts.push(c); acc += seg; prev = c;
  }
  return pts;
};
const Card: React.FC<{ x: number; k: number; cn: string; en: string; inst: string; born: string; work: string; workSub: string }> = ({ x, k, cn, en, inst, born, work, workSub }) => {
  const t = clamp((k - 0.45) / 0.4);
  return t <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: 230, width: 640, height: 600, opacity: t }}>
      <div style={{ position: 'absolute', left: 48, top: 56, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.gold }}>Laureate · 2026</div>
      <div style={{ position: 'absolute', left: 48, top: 104, fontFamily: F.serif, fontWeight: 900, fontSize: 64, color: '#fff3dc', letterSpacing: '0.04em', textShadow: `0 0 24px rgba(${GOLD},.35)` }}>{cn}</div>
      <div style={{ position: 'absolute', left: 50, top: 192, fontFamily: F.lat, fontWeight: 600, fontSize: 34, color: C.dim }}>{en}</div>
      <div style={{ position: 'absolute', left: 48, top: 262, width: 544, height: 1, background: `rgba(${GOLD},.35)` }} />
      <div style={{ position: 'absolute', left: 48, top: 290, fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: C.cream }}>{inst}</div>
      <div style={{ position: 'absolute', left: 48, top: 340, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.dim, ...LNUM }}>{born}</div>
      <div style={{ position: 'absolute', left: 48, top: 430, fontFamily: F.lat, fontWeight: 700, fontSize: 32, color: C.goldHi, ...LNUM }}>{work}</div>
      <div style={{ position: 'absolute', left: 48, top: 478, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.dim }}>{workSub}</div>
    </div>
  );
};
export const G4: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const a = pr(T, CUT.laur, 1.0), b = pr(T, CUT.wood, 1.0);
  return (
    <Light f={f} o={eo(T, CUT.laur - 0.05, 0.25)} draw={(g) => {
      bg(g, T);
      g.save(); camT(g, lerp(1, 1.04, pr(T, CUT.laur, 8)));
      [[250, a], [1030, b]].forEach(([x, k]) => {
        if (k <= 0) return;
        trail(g, rectPerim(x, 230, 640, 600, easeInOut(Math.min(1, k / 0.6))), GOLD, 1.6, 0.9, k < 0.6);
        glowDot(g, x + 320, 530, 420, 0.06 * clamp(k * 2));
      });
      if (a > 0) sparks(g, 250, 230, CUT.laur, T, 40, GOLD, 0.8, 1);
      if (b > 0) sparks(g, 1030, 230, CUT.wood, T, 40, GOLD, 0.8, 2);
      g.restore();
    }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '960px 540px', transform: `scale(${lerp(1, 1.04, pr(T, CUT.laur, 8))})` }}>
        <Card x={250} k={a} cn="罗伯特·霍尔" en="Robert E. Hall" inst="斯坦福大学" born="1943年生 · 美国" work="J. Political Economy · 1978" workSub="人一辈子怎么花钱" />
        <Card x={1030} k={b} cn="迈克尔·伍德福德" en="Michael Woodford" inst="哥伦比亚大学" born="1955年生 · 美国" work="Interest and Prices · 2003" workSub="央行的一句话为什么管用" />
      </div>
      <Slate a="STOCKHOLM" b="2026.10.12  11:45" o={eo(T, CUT.laur + 0.3, 0.5)} />
    </Light>
  );
};

/* ================================================================ G6 · the 1970s as constellations (32.81 – 49.01)
   Annual averages: CPI inflation (BLS, via usinflationcalculator.com) and civilian unemployment (BLS, via SSA Trustees Report). */
const INFL: Record<number, number> = { 1961: 1.0, 1962: 1.0, 1963: 1.3, 1964: 1.3, 1965: 1.6, 1966: 2.9, 1967: 3.1, 1968: 4.2, 1969: 5.5, 1970: 5.7, 1971: 4.4, 1972: 3.2, 1973: 6.2, 1974: 11.0, 1975: 9.1, 1976: 5.8, 1977: 6.5, 1978: 7.6, 1979: 11.3, 1980: 13.5, 1981: 10.3, 1982: 6.2 };
const UNEMP: Record<number, number> = { 1961: 6.7, 1962: 5.6, 1963: 5.6, 1964: 5.2, 1965: 4.5, 1966: 3.8, 1967: 3.8, 1968: 3.6, 1969: 3.5, 1970: 5.0, 1971: 6.0, 1972: 5.6, 1973: 4.9, 1974: 5.6, 1975: 8.5, 1976: 7.7, 1977: 7.1, 1978: 6.1, 1979: 5.9, 1980: 7.2, 1981: 7.6, 1982: 9.7 };
export const G6: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const X = (u: number) => 330 + (u - 3) * 150, Y = (p: number) => 820 - p * 44;
  const S60 = Array.from({ length: 9 }, (_, i) => 1961 + i), S70 = Array.from({ length: 13 }, (_, i) => 1970 + i);
  const A60 = CUT.oil + 1.6, A70 = bt(80), TAGS = bt(88);
  const at60 = (i: number) => A60 + i * 0.36, at70 = (i: number) => A70 + i * 0.24;
  const curveK = eio(T, at60(9) + 0.2, 0.8), broken = eo(T, A70, 0.5);
  const camS = lerp(1.12, 1.0, eio(T, A70 - 0.2, 1.2));
  const tags = ['房租', '工资', '面包', '车票', '学费'];
  return (
    <Light f={f} draw={(g) => {
      bg(g, T);
      // 1973 bursts into the chart
      const yearPts = textPts('1973', '700 260px "Cormorant Garamond"', 960, 470, 3);
      const burst = pr(T, CUT.oil + 0.9, 0.9);
      if (burst < 1) particleText(g, yearPts, T, CUT.oil - 0.35, CUT.oil, GOLD, 31, 800, burst * 3);
      if (T > CUT.oil) sparks(g, 960, 470, CUT.oil, T, 120, GOLD, 2.6, 13);
      g.save(); camT(g, camS, 720, 720);
      const axisA = eo(T, CUT.oil + 1.2, 0.6);
      for (const p of [0, 4, 8, 12]) { g.strokeStyle = `rgba(${GOLD},${0.07 * axisA})`; g.setLineDash([2, 10]); g.lineWidth = 1; g.beginPath(); g.moveTo(330, Y(p)); g.lineTo(1400, Y(p)); g.stroke(); }
      g.setLineDash([]);
      // 1960s: teal stars and their trail; the fitted rule as a teal river
      const p60 = S60.filter((_, i) => T > at60(i)).map((y) => [X(UNEMP[y]), Y(INFL[y])] as P);
      if (p60.length > 1) trail(g, p60, TEAL, 1.2, 0.6, false);
      S60.forEach((y, i) => { if (T > at60(i)) { const k = pop(T, at60(i), 0.25); glowDot(g, X(UNEMP[y]), Y(INFL[y]), 26 * k, 0.5, TEAL); glowDot(g, X(UNEMP[y]), Y(INFL[y]), 6, 1, WHITE); } });
      if (curveK > 0) {
        const cp: P[] = []; for (let q = 0; q <= 60 * curveK; q++) { const u = q / 60; const x = 3.3 + u * 3.7, yv = 0.7 + 5.5 * Math.exp(-(x - 3.3) * 1.15); cp.push([X(x), Y(yv)]); }
        if (broken <= 0) trail(g, cp, TEAL, 2.4, 1, curveK < 1);
        else cp.forEach(([x, y], i) => { if (i % 2) return; const s = broken * 40 * rnd(i, 4); glowDot(g, x + (rnd(i, 5) - 0.5) * s, y + s * 0.6, 5, 0.6 * (1 - broken * 0.6), TEAL); });
      }
      // 1970s: red stars breaking away
      const p70 = S70.filter((_, i) => T > at70(i)).map((y) => [X(UNEMP[y]), Y(INFL[y])] as P);
      if (p70.length > 1) trail(g, p70, RED, 1.8, 0.85, true);
      S70.forEach((y, i) => { if (T > at70(i)) { const big = y === 1974 || y === 1980; glowDot(g, X(UNEMP[y]), Y(INFL[y]), (big ? 40 : 26) * pop(T, at70(i), 0.25), 0.55, RED); glowDot(g, X(UNEMP[y]), Y(INFL[y]), big ? 8 : 6, 1, WHITE); if (big) sparks(g, X(UNEMP[y]), Y(INFL[y]), at70(i), T, 40, RED, 0.8, y); } });
      g.restore();
    }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '720px 720px', transform: `scale(${camS})` }}>
        <Lbl x={330} y={210} s="美国：物价涨幅（纵）× 失业率（横）" size={28} o={eo(T, CUT.oil + 1.2, 0.5)} />
        {[0, 4, 8, 12].map((p) => <Lbl key={p} x={300} y={Y(p) - 14} s={`${p}%`} size={22} col={C.dim} anchor="right" serif={false} o={eo(T, CUT.oil + 1.2, 0.5)} />)}
        {[3, 5, 7, 9].map((u) => <Lbl key={u} x={X(u) - 16} y={838} s={`${u}%`} size={22} col={C.dim} serif={false} o={eo(T, CUT.oil + 1.2, 0.5)} />)}
        {S60.map((y, i) => <Lbl key={y} x={X(UNEMP[y]) + 12} y={Y(INFL[y]) - 34} s={`'${String(y).slice(2)}`} size={20} col="rgba(127,214,200,.8)" serif={false} o={eo(T, at60(i), 0.3)} />)}
        {S70.map((y, i) => <Lbl key={y} x={X(UNEMP[y]) + 12} y={Y(INFL[y]) - 34} s={`'${String(y).slice(2)}`} size={20} col="rgba(255,150,120,.85)" serif={false} o={eo(T, at70(i), 0.3)} />)}
        <Lbl x={X(5.4)} y={Y(2.6)} s="1960年代：物价涨，工作就好找" size={26} col="#9fe3d6" o={curveK * (1 - 0.6 * broken)} />
        <Lbl x={X(7.6)} y={Y(14.6)} s="1970年代：两样一起涨" size={28} col="#ff9a7e" o={eo(T, A70 + 2.6, 0.4)} />
      </div>
      <Note x={330} y={880} s="年均 · 美国劳工统计局（BLS）数据" o={eo(T, A60, 0.5)} />
      {T > TAGS && (
        <div style={{ position: 'absolute', left: 1460, top: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tags.map((tg, i) => { const k = clamp(pop(T, TAGS + 0.1 + i * 0.42, 0.3)); return (
            <div key={tg} style={{ opacity: k, transform: `translateY(${(1 - k) * 20}px)`, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px', border: '1.5px solid rgba(255,140,110,.45)', boxShadow: '0 0 20px rgba(255,120,90,.15)' }}>
              <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: C.cream }}>{tg}</span>
              <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: '#ff8a6e', textShadow: '0 0 12px rgba(255,120,90,.8)' }}>↑</span>
              <span style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 20, color: C.dim }}>先涨了</span>
            </div>); })}
        </div>
      )}
      <Chapter n="II" t="老办法失灵" o={eo(T, CUT.oil + 1.2, 0.5)} />
    </Light>
  );
};

/* ================================================================ G7 · Hall: one light, then a life as two trails (49.01 – 63.18) */
export const G7: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const inc = (sim as any).hall.income as number[], con = (sim as any).hall.cons as number[];
  const X = (q: number) => 200 + q * 8.6, Y = (v: number) => 840 - (v - 90) * 5.2;
  const D0 = 52.9, D1 = 61.5;
  const qf = lerp(0, 159, clamp((T - D0) / (D1 - D0))), q = Math.floor(qf);
  const tq = (qq: number) => D0 + (qq / 159) * (D1 - D0);
  const zoom = eio(T, CUT.hall + 1.6, 1.4);
  const chartO = eo(T, CUT.hall + 2.6, 0.6);
  const formula = pr(T, 59.6, 1.0);
  return (
    <Light f={f} draw={(g) => {
      bg(g, T);
      // one household: a window light that we fly into
      if (zoom < 1) {
        const r = lerp(46, 1600, zoom * zoom) * (1 + 0.04 * Math.sin(T * 3));
        glowDot(g, 960, 540, r * 3, lerp(0.5, 0.15, zoom));
        g.fillStyle = `rgba(255,228,170,${1 - zoom})`; g.fillRect(960 - r * 0.4, 540 - r * 0.55, r * 0.8, r * 1.1);
      }
      if (chartO > 0) {
        g.globalAlpha = chartO;
        g.strokeStyle = `rgba(${GOLD},0.08)`; g.setLineDash([2, 10]); g.beginPath(); g.moveTo(200, Y(100)); g.lineTo(1580, Y(100)); g.stroke(); g.setLineDash([]);
        if (q > 1) {
          trail(g, inc.slice(0, q + 1).map((v, i) => [X(i), Y(v)] as P), TEAL, 1.4, 0.8, true);
          trail(g, con.slice(0, q + 1).map((v, i) => [X(i), Y(v)] as P), GOLD, 3.2, 1, true);
        }
        (sim as any).hall.bonus.forEach((bq: number, i: number) => sparks(g, X(bq), Y(inc[bq]), tq(bq), T, 50, TEAL, 0.9, 20 + i));
        if (T > tq(60)) { sparks(g, X(60), Y(con[61]), tq(60), T, 120, GOLD, 1.8, 40); glowDot(g, X(60), Y(con[61]), 300 * hit(T, tq(60), 0.4), 0.25); }
        g.globalAlpha = 1;
      }
    }}>
      <Lbl x={960} y={640} s="一个家庭" size={32} col={C.cream} ls="0.4em" anchor="center" o={eo(T, CUT.hall + 0.5, 0.5) * (1 - zoom)} />
      <div style={{ position: 'absolute', inset: 0, opacity: chartO }}>
        <Lbl x={200} y={210} s="— 收入" size={26} col="#9fe3d6" />
        <Lbl x={340} y={210} s="— 花钱" size={26} col={C.goldHi} />
        <Lbl x={X(20) + 14} y={Y(160) - 20} s="奖金" size={26} col="#9fe3d6" o={eo(T, tq(21), 0.3)} />
        <Lbl x={X(24) + 12} y={Y(104) - 40} s="花钱几乎不动" size={22} col={C.dim} serif={false} o={eo(T, tq(23), 0.3)} />
        <Lbl x={X(60) + 14} y={300} s="涨薪的消息" size={28} col={C.goldHi} o={eo(T, tq(60), 0.3)} />
        <Lbl x={X(60) + 14} y={342} s="花钱线立刻整体抬升" size={22} col={C.dim} serif={false} o={eo(T, tq(60) + 0.2, 0.3)} />
        <Note x={200} y={880} s="一个人 40 年 · 按霍尔 1978 模型模拟（示意）" />
        {formula > 0 && (
          <div style={{ position: 'absolute', right: 150, top: 220, textAlign: 'right', clipPath: `inset(-20px ${(1 - formula) * 100}% -20px -20px)` }}>
            <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 92, color: C.goldHi, textShadow: `0 0 30px rgba(${GOLD},.6), 0 0 80px rgba(${GOLD},.3)` }}>
              C<sub style={{ fontSize: 46 }}>t+1</sub> = C<sub style={{ fontSize: 46 }}>t</sub> + <span style={{ fontFamily: F.serif, fontStyle: 'normal', fontWeight: 900, fontSize: 70 }}>新消息</span>
            </div>
            <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, color: C.dim, marginTop: 4, letterSpacing: '0.12em' }}>明天花多少 = 今天花多少 + 意外</div>
          </div>
        )}
        <Chapter n="III" t="霍尔" />
      </div>
    </Light>
  );
};

/* ================================================================ G11 · the experiment as two light trails (89.51 – 97.61) */
export const G11: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const fg = (sim as any).fg;
  const X = (q: number) => 260 + q * 52, Y = (v: number) => 560 - v * 30;
  const qf = lerp(1, 24, eio(T, CUT.fg + 0.3, 3.2)), q = Math.floor(qf);
  const gapK = eo(T, 93.5, 0.6);
  return (
    <Light f={f} draw={(g) => {
      bg(g, T);
      g.save(); camT(g, lerp(1.0, 1.05, pr(T, CUT.fg, 8)), 760, 560);
      g.fillStyle = `rgba(${TEAL},0.05)`; g.fillRect(X(0), 250, X(8) - X(0), 620);
      g.strokeStyle = `rgba(${GOLD},0.12)`; g.lineWidth = 1; g.beginPath(); g.moveTo(260, Y(0)); g.lineTo(1520, Y(0)); g.stroke();
      trail(g, fg.x_no.slice(0, q + 1).map((v: number, i: number) => [X(i), Y(v)] as P), RED, 2.4, 0.95, true);
      trail(g, fg.x_fg.slice(0, q + 1).map((v: number, i: number) => [X(i), Y(v)] as P), GOLD, 3.2, 1, true);
      if (gapK > 0) { const y1 = Y(fg.x_fg[2]) + 10, y2 = Y(fg.x_no[2]) - 10; trail(g, [[X(2), y1], [X(2), lerp(y1, y2, gapK)]], GOLD, 1.4, 1, gapK < 1); }
      g.restore();
    }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '760px 560px', transform: `scale(${lerp(1.0, 1.05, pr(T, CUT.fg, 8))})` }}>
        <Lbl x={260} y={210} s="经济活动 · 伍德福德模型实验" size={28} />
        <Lbl x={X(0) + 12} y={262} s="经济下滑 · 利率已经是 0" size={22} col="#9fe3d6" />
        <Lbl x={160} y={Y(0) - 14} s="正常" size={22} col={C.dim} />
        <Lbl x={X(3)} y={Y(fg.x_no[3]) + 26} s="只管今天" size={28} col="#ff9a7e" o={eo(T, CUT.fg + 1.2, 0.4)} />
        <Lbl x={X(10)} y={Y(fg.x_fg[10]) - 64} s='先说一句"低利率会保持更久"' size={28} col={C.goldHi} o={eo(T, CUT.fg + 2.4, 0.4)} />
        <Lbl x={X(2) + 18} y={(Y(fg.x_fg[2]) + Y(fg.x_no[2])) / 2 - 16} s="一句话的差别" size={26} col={C.gold} o={gapK} />
        <Note x={260} y={890} s="按新凯恩斯模型模拟 · 只示意方向" />
        <div style={{ position: 'absolute', left: 1580, top: 330, width: 230, padding: '20px 0', border: `1.5px solid rgba(${GOLD},.45)`, boxShadow: `0 0 30px rgba(${GOLD},.15)`, textAlign: 'center' }}>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>利率</div>
          <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 70, color: C.cream, ...LNUM }}>0%</div>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, color: C.gold, letterSpacing: '0.2em' }}>一分没动</div>
        </div>
      </div>
      <Chapter n="IV" t="伍德福德" />
    </Light>
  );
};

/* ================================================================ G12 · central banks in light; the river of the economy smooths (97.61 – 105.71) */
const colonnade = (x: number, w: number, h: number): P[][] => {
  const base = 820, cols = Math.max(4, Math.round(w / 46)), out: P[][] = [];
  out.push([[x - 14, base - h], [x + w / 2, base - h - h * 0.28], [x + w + 14, base - h], [x - 14, base - h]]);
  out.push([[x - 10, base - h + 14], [x + w + 10, base - h + 14]]);
  for (let i = 0; i < cols; i++) { const cx = x + 12 + i * ((w - 24) / (cols - 1)); out.push([[cx, base - h + 18], [cx, base - 16]]); }
  out.push([[x - 16, base - 14], [x + w + 16, base - 14]]);
  return out;
};
const BANKS = [{ x: 140, w: 240, h: 230 }, { x: 470, w: 300, h: 280 }, { x: 860, w: 220, h: 210 }, { x: 1170, w: 320, h: 300 }, { x: 1580, w: 220, h: 220 }];
export const G12: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const smooth = eio(T, 101.9, 2.6);
  const cyc = (u: number) => { const big = 120 * Math.sin(u * 18) + 50 * Math.sin(u * 41 + 1); return lerp(big, big * 0.22, smooth); };
  return (
    <Light f={f} draw={(g) => {
      bg(g, T);
      g.save(); camT(g, lerp(1.0, 1.05, pr(T, CUT.banks, 8)), 960, 700);
      BANKS.forEach((b, i) => {
        const k = eio(T, CUT.banks + i * 0.15, 0.7);
        colonnade(b.x, b.w, b.h).forEach((seg, j) => { const kk = clamp(k * 1.4 - j * 0.03); if (kk <= 0) return; const [a0, a1] = [seg[0], seg[seg.length - 1]]; const pts = seg.length > 2 ? seg : [a0, [a0[0] + (a1[0] - a0[0]) * kk, a0[1] + (a1[1] - a0[1]) * kk] as P]; trail(g, pts, GOLD, 0.9, 0.5, false); });
        const lit = eo(T, CUT.banks + 0.5 + i * 0.18, 0.4);
        trail(g, [[b.x - 24, 826], [b.x + b.w + 24, 826]], GOLD, 3, lit, false);
        if (lit > 0) sparks(g, b.x + b.w / 2, 826, CUT.banks + 0.5 + i * 0.18, T, 30, GOLD, 0.7, 50 + i);
      });
      // the economy as a river of particles flowing left to right along the cycle
      const riverA = eo(T, CUT.banks + 1.4, 1.0);
      if (riverA > 0) {
        const N = 2600;
        for (let i = 0; i < N; i++) {
          const u = ((rnd(i, 1) + T * (0.05 + 0.03 * rnd(i, 2))) % 1), y = 360 + cyc(u) + (rnd(i, 3) - 0.5) * 18 * (1 - 0.5 * smooth);
          const a = riverA * (0.25 + 0.6 * rnd(i, 4)) * Math.min(1, u * 8, (1 - u) * 8);
          g.fillStyle = `rgba(${GOLD},${a})`; g.fillRect(140 + u * 1660, y, 1.8, 1.8);
        }
      }
      g.restore();
    }}>
      <Lbl x={140} y={210} s="经济的起伏（示意）" size={26} col={C.dim} o={eo(T, CUT.banks + 1.4, 0.5)} />
      <Chapter n="V" t="一句话的力量" />
    </Light>
  );
};

/* ================================================================ G12b · trust: the sentence in light flickers, scatters, re-forms (105.71 – 113.81) */
export const G12b: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const DOUBT = 109.0, BACK = 111.7;
  const scatter = eo(T, DOUBT, 0.9) * (1 - eio(T, BACK, 0.45));
  return (
    <Light f={f} draw={(g) => {
      bg(g, T);
      g.save(); camT(g, lerp(1.0, 1.08, pr(T, CUT.trust, 8)), 960, 560);
      const pts = textPts(LINE2, '400 76px "DejaVu Sans Mono"', 960, 560, 2);
      const flick = T > DOUBT && T < BACK ? (Math.floor(T * 14) % 3 === 0 ? 0.35 : 1) : 1;
      particleText(g, pts, T, CUT.trust - 1, CUT.trust - 0.9, flick < 1 ? '170,175,190' : GOLD, 11, 700, scatter);
      glowDot(g, 960, 560, 520, (0.12 + 0.06 * Math.sin(T * 2)) * (1 - scatter) * flick);
      if (T > BACK) sparks(g, 960, 560, BACK, T, 140, GOLD, 2.4, 61);
      g.restore();
    }}>
      <Lbl x={960} y={440} s="exceptionally low levels for the federal funds rate" size={30} col="rgba(239,232,218,.5)" serif={false} ls="0.02em" anchor="center" o={eo(T, CUT.trust, 0.5) * (1 - scatter)} />
    </Light>
  );
};

/* ================================================================ end card (113.81 – 121.9) */
export const GEnd: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const t = T - CUT.end, ring = eio(t, 0, 0.8), fo = (a: number) => eo(t, a, 0.4);
  const black = pr(T, CUT.fin - 0.6, 0.6);
  return (
    <Light f={f} draw={(g) => { bg(g, T, 0.8); glowDot(g, 960, 420, 800, 0.08); sparks(g, 960, 232, CUT.end, T, 80, GOLD, 1.2, 77); }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="gec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <circle cx={960} cy={232} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 232)" style={{ filter: `drop-shadow(0 0 8px rgba(${GOLD},.7))` }} />
        <text x={960} y={252} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={fo(0.4)}>J</text>
        <text x={960} y={304} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.8 * fo(0.6)}>JUNO</text>
        <text x={960} y={430} textAnchor="middle" opacity={fo(0.5)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 92 }} fill="url(#gec)">《一句话，让钱变便宜》</text>
        <text x={960} y={540} textAnchor="middle" opacity={fo(0.9)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill={C.cream}>央行的一句话，会改变你的打算吗？</text>
        <text x={960} y={590} textAnchor="middle" opacity={fo(1.1)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 25, letterSpacing: '0.12em' }} fill={C.dim}>评论区聊聊：你会等降息再做决定吗？</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: fo(1.4) }}>
        <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, boxShadow: `0 0 24px rgba(${GOLD},.25)`, fontFamily: F.sans, fontWeight: 500, fontSize: 28, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', opacity: fo(1.8), fontFamily: F.sans, fontSize: 17, letterSpacing: '0.03em', color: 'rgba(239,232,218,.42)', lineHeight: '28px', ...LNUM }}>
        <div>资料：瑞典皇家科学院 2026 经济学奖公告 · Hall, J. Political Economy 1978 · Hall & Mishkin, Econometrica 1982 · Woodford, Interest and Prices 2003</div>
        <div>美联储 2011-08-09 声明 · CNN Money 2011-08-09 · 美国劳工统计局（BLS）· 文中模拟按两位得主的模型计算，仅作示意</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </Light>
  );
};
