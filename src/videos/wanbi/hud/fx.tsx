// hud/fx.tsx: THE SMALL EFFECTS (Hongmen's segA_ov / segB_ov family, moved here, plus this film's new ones). Plain
// functions of the frame; nothing random (hash01 of integers), no ids, no blend modes. Never in the caption band:
// the builder places them (they are drawn where they are told).
//   glint   a 4-point star on the jade (90 px, 6 frames) at every hand-over
//   burst   a ring of short gold rays (23b swap)
//   streak  the whip pan's speed streaks (the post chain has no motion blur)
//   tint    a full-frame warm wash: the sepia rewind of the 2 -> 3 whip
//   puff    a dust-and-cloth puff (16a cloth, 19 the cauldron's rim)
//   rage    short gold strokes radiating from a head, re-drawn every 3 frames (10b)
//   steam   wisps rising from the cauldron's rim (19)
//   glow    a soft warm glow (the servant's chest; a bright dot in 16b)
//   sweat   a sweat drop at the temple (2, 12a)
//   smear   the gold arc of the strike, a -> b (1, 11)
//   panic   short strokes at the king's hands, re-drawn every 4 frames (1, 2, 11)
import React from "react";
import { HC, FULL, clamp01, eOut, hash01, lerp, life, outOf, springAt, PUNCH, type Head, type Pt } from "./base";

type LifeP = { f: number; from: number; len?: number; out?: number; key?: string };
const svgF = (key: string, op: number, ...kids: React.ReactNode[]) => (
  <svg key={key} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: op }}>{kids}</svg>
);

/** a 4-point star on the jade (90 px, 6 frames) at every hand-over */
export const glint = (p: { f: number; from: number; x: number; y: number; size?: number; dur?: number; key?: string }): React.ReactNode => {
  const { f, from, x, y, size = 90, dur = 6 } = p, u = (f - from) / dur;
  if (u < 0 || u >= 1) return null;
  const s = Math.sin(Math.PI * Math.pow(u + 0.5 / dur, 0.7)) * size * 0.5, a = 45 * u, q = 0.13;
  if (s < 2) return null;
  const d = `M0,${-s} Q${s * q},${-s * q} ${s},0 Q${s * q},${s * q} 0,${s} Q${-s * q},${s * q} ${-s},0 Q${-s * q},${-s * q} 0,${-s} Z`;
  return svgF(p.key ?? `glint${from}`, 1, <g key="g" transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})`}>
    <path d={d} fill="#ffffff" stroke={HC.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={0} r={s * 0.16} fill="#fff6cf" />
  </g>);
};

/** a ring of short gold rays (23b swap), 8 frames */
export const burst = (p: { f: number; from: number; x: number; y: number; r?: number; n?: number; color?: string; key?: string }): React.ReactNode => {
  const { f, from, x, y, r = 120, n = 10, color = HC.gold } = p, u = (f - from) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), kids: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a), d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
    kids.push(<path key={`a${i}`} d={d} stroke={HC.ink} strokeWidth={17} />, <path key={`b${i}`} d={d} stroke={color} strokeWidth={9} />);
  }
  return svgF(p.key ?? `burst${from}`, 1, <g key="g" opacity={1 - u * u} strokeLinecap="round" fill="none">{kids}</g>);
};

/** the whip pan's speed streaks on frames from..to (dir 1 = the camera pans right: the picture rushes left), strongest
 *  in the middle of the run (the cut), with a wash of cols[0]. Each shot gives the same call on its own frames. */
export const streak = (p: { f: number; from: number; to: number; dir: 1 | -1; cols?: string[]; key?: string }): React.ReactNode => {
  const { f, from, to, dir, cols = ["#ece2c8", "#d3ab52", "#3a3442", "#f7f1df"] } = p;
  if (f < from || f > to) return null;
  const u = (f - from + 0.5) / (to - from + 1), k = Math.sin(Math.PI * u), n = 22, bars: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = hash01(i, 11), b = hash01(i, 12);
    const y = ((i + 0.5) / n) * 1920 + (a - 0.5) * 60, hgt = 26 + 90 * b, len = 500 + 900 * a;
    const x = ((b * 1900 - dir * (f - from) * 420 * (0.6 + 0.8 * a)) % 2200 + 2200) % 2200 - 700;
    bars.push(<rect key={i} x={x} y={y - hgt / 2} width={len} height={hgt} rx={hgt / 2} fill={cols[i % cols.length]} opacity={(0.35 + 0.5 * a) * k} />);
  }
  return svgF(p.key ?? `streak${from}`, 1, <rect key="w" x={0} y={0} width={1080} height={1920} fill={cols[0]} opacity={0.55 * k * k} />, ...bars);
};

/** a full-frame wash: the sepia rewind of the 2 -> 3 whip (in over 2 frames from `from`, faded out by `out`: gone on
 *  `out`, a 6-frame fade before it), with two pale tape bands that roll up the frame */
export const tint = (p: LifeP & { color?: string; amount?: number }): React.ReactNode => {
  const { f, from, color = "#a8743a", amount = 0.42 } = p, out = outOf(p);
  if (f < from || (out !== undefined && f >= out)) return null;
  const t = f - from, k = clamp01((t + 1) / 2) * (out === undefined ? 1 : clamp01((out - f) / 6));
  const bands = [0, 1].map((i) => { const y = 1920 - (((t * 170 + i * 960) % 2300) - 200); return <div key={i} style={{ position: "absolute", left: 0, top: y, width: 1080, height: 70, background: "rgba(255,240,210,0.16)" }} />; });
  return (
    <div key={p.key ?? `tint${from}`} style={{ ...FULL, opacity: k }}>
      <div style={{ ...FULL, background: color, opacity: amount }} />
      <div style={{ ...FULL, background: "radial-gradient(ellipse at 50% 45%, rgba(60,36,14,0) 55%, rgba(60,36,14,0.35) 100%)" }} />
      {bands}
    </div>
  );
};

/** a dust-and-cloth puff: five round puffs that swell and drift up from a point over `dur` frames (16a: the cloth over
 *  the servant, a brown `color`; 19: the cauldron's landing, at its rim) */
export const puff = (p: { f: number; from: number; x: number; y: number; r?: number; dur?: number; color?: string; key?: string }): React.ReactNode => {
  const { f, from, x, y, r = 46, dur = 12, color = "#f4ecd6" } = p, u = (f - from) / dur;
  if (u < 0 || u >= 1) return null;
  const kids: React.ReactNode[] = [], back: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const side = i - 2, dx = side * r * 0.95 * (0.35 + 0.65 * eOut(u)), dy = -r * (0.25 + 1.0 * u) * (1 - 0.18 * Math.abs(side)) + Math.abs(side) * r * 0.2;
    const rr = r * (0.45 + 0.6 * eOut(u)) * (i === 2 ? 1.15 : 0.82 + 0.1 * hash01(i, from));
    back.push(<circle key={`i${i}`} cx={x + dx} cy={y + dy} r={rr + 5} fill={HC.ink} />);
    kids.push(<circle key={`c${i}`} cx={x + dx} cy={y + dy} r={rr} fill={color} />);
  }
  return svgF(p.key ?? `puff${from}`, clamp01((1 - u) * 2.2), ...back, ...kids);
};

/** short strokes radiating from a head (10b, 803-830): gold on ink, over the top half and the sides, their lengths
 *  re-drawn every 3 frames; they pop in over 3 frames and leave in 4 */
export const rage = (p: LifeP & { at: Head; n?: number }): React.ReactNode => {
  const { f, from, at, n = 10 } = p, Lf = life(f, from, outOf(p), 4);
  if (!Lf) return null;
  const step = Math.floor(Lf.t / 3), k = eOut((Lf.t + 1) / 3), kids: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + (i + 0.5) / n * Math.PI * 1.0 + (hash01(i, step) - 0.5) * 0.18 - 0.0;
    const r0 = at.r * (1.3 + 0.12 * hash01(i, step + 7)), len = at.r * (0.35 + 0.35 * hash01(i, step + 3)) * k;
    const c = Math.cos(a), s = Math.sin(a), d = `M${(at.x + c * r0).toFixed(1)},${(at.y + s * r0).toFixed(1)} L${(at.x + c * (r0 + len)).toFixed(1)},${(at.y + s * (r0 + len)).toFixed(1)}`;
    kids.push(<path key={`a${i}`} d={d} stroke={HC.ink} strokeWidth={17} />, <path key={`b${i}`} d={d} stroke={HC.gold} strokeWidth={8} />);
  }
  return svgF(p.key ?? `rage${from}`, 1 - Lf.lv, <g key="g" strokeLinecap="round" fill="none">{kids}</g>);
};

/** wisps of steam rising from the cauldron's rim at (x, y), `w` wide (default 140): four S-curves that rise and fade
 *  on a 24-frame loop, drawn upward, away from the captions */
export const steam = (p: LifeP & { x: number; y: number; w?: number }): React.ReactNode => {
  const { f, from, x, y, w = 140 } = p, Lf = life(f, from, outOf(p), 6);
  if (!Lf) return null;
  const H = 200, kids: React.ReactNode[] = [], kin = clamp01((Lf.t + 1) / 6);
  for (let i = 0; i < 4; i++) {
    const u = ((Lf.t + i * 6) % 24) / 24, x0 = x + (i / 3 - 0.5) * w * 0.8, y0 = y - u * H * 0.55, sw = (i % 2 ? -1 : 1) * 16 * (1 + u);
    const d = `M${x0.toFixed(1)},${y0.toFixed(1)} C${(x0 + sw).toFixed(1)},${(y0 - H * 0.2).toFixed(1)} ${(x0 - sw).toFixed(1)},${(y0 - H * 0.35).toFixed(1)} ${(x0 + sw * 0.6).toFixed(1)},${(y0 - H * 0.55).toFixed(1)}`;
    const env = Math.sin(Math.PI * u) * kin;
    kids.push(<g key={i} opacity={env} fill="none" strokeLinecap="round"><path d={d} stroke="rgba(30,26,40,0.35)" strokeWidth={20} /><path d={d} stroke="#f6f3ec" strokeWidth={12} /></g>);
  }
  return svgF(p.key ?? `steam${from}`, 1 - Lf.lv, ...kids);
};

/** a soft warm glow (the servant's chest 1368-1419, 60 px; a bright dot in 16b): in over 4 frames, a slow pulse */
export const glow = (p: LifeP & { x: number; y: number; r?: number; color?: string }): React.ReactNode => {
  const { f, from, x, y, r = 60, color = "255,236,170" } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const rgb = color.startsWith("#") ? [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)).join(",") : color;
  const rr = r * (1 + 0.08 * Math.sin(Lf.t * 0.45)), k = clamp01((Lf.t + 1) / 4) * (1 - Lf.lv);
  return (
    <div key={p.key ?? `glow${from}`} style={{ ...FULL, opacity: k, background: `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(255,255,240,0.95) 0px, rgba(${rgb},0.75) ${(rr * 0.35).toFixed(1)}px, rgba(${rgb},0) ${rr.toFixed(1)}px)` }} />
  );
};

/** a sweat drop at the temple (2, 12a): pops in, slides down a little, fades in its last 5 frames (default len 20) */
export const sweat = (p: LifeP & { x: number; y: number; size?: number }): React.ReactNode => {
  const { f, from, x, y, size = 46 } = p, out = outOf(p, 20), Lf = life(f, from, out);
  if (!Lf) return null;
  const k = springAt(f, from, PUNCH), span = (out ?? from + 20) - from + 5, dy = size * 0.7 * clamp01(Lf.t / span), s = size / 2;
  const d = `M0,${-s} C${s * 0.55},${-s * 0.1} ${s * 0.62},${s * 0.35} ${s * 0.42},${s * 0.62} A${s * 0.6},${s * 0.6} 0 0 1 ${-s * 0.42},${s * 0.62} C${-s * 0.62},${s * 0.35} ${-s * 0.55},${-s * 0.1} 0,${-s} Z`;
  return svgF(p.key ?? `sweat${from}`, 1 - Lf.lv, <g key="g" transform={`translate(${x.toFixed(1)},${(y + dy).toFixed(1)}) scale(${(0.3 + 0.7 * k).toFixed(3)})`}>
    <path d={d} fill="#c4e8ff" stroke={HC.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M${-s * 0.2},${s * 0.05} Q${-s * 0.3},${s * 0.35} ${-s * 0.12},${s * 0.48}`} fill="none" stroke="#ffffff" strokeWidth={Math.max(3, s * 0.16)} strokeLinecap="round" />
  </g>);
};

/** the gold arc of the strike, a -> b (1: 98-104, 11: 894-902): a crescent, thin at a, full at b (the jade's head),
 *  drawn on over 3 frames, then it thins and fades (default len 7) */
export const smear = (p: LifeP & { a: Pt; b: Pt; bend?: number; width?: number }): React.ReactNode => {
  const { f, from, a, b, bend = 0.22, width = 40 } = p, out = outOf(p, 7), t = f - from;
  if (t < 0 || (out !== undefined && f >= out)) return null;
  const span = (out ?? from + 7) - from, draw = clamp01((t + 1) / 3), fade = clamp01((t - 2) / Math.max(1, span - 2));
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const c = { x: (a.x + b.x) / 2 + nx * len * bend, y: (a.y + b.y) / 2 + ny * len * bend };
  const q = (u: number) => ({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y });
  const N = 24, L: string[] = [], R: string[] = [], u1 = draw, u0 = lerp(0, 0.85, fade);
  for (let i = 0; i <= N; i++) {
    const u = lerp(u0, u1, i / N), P = q(u), P2 = q(Math.min(1, u + 0.01)), P1 = q(Math.max(0, u - 0.01));
    const tx = P2.x - P1.x, ty = P2.y - P1.y, tl = Math.hypot(tx, ty) || 1, w = (width / 2) * Math.pow((u - u0) / Math.max(1e-3, u1 - u0), 0.8) * (1 - 0.5 * fade);
    L.push(`${(P.x - (ty / tl) * w).toFixed(1)},${(P.y + (tx / tl) * w).toFixed(1)}`);
    R.push(`${(P.x + (ty / tl) * w).toFixed(1)},${(P.y - (tx / tl) * w).toFixed(1)}`);
  }
  const d = `M${L.join(" L")} L${R.reverse().join(" L")} Z`;
  return svgF(p.key ?? `smear${from}`, 1 - 0.7 * fade,
    <path key="i" d={d} fill={HC.ink} stroke={HC.ink} strokeWidth={10} strokeLinejoin="round" />,
    <path key="g" d={d} fill={HC.gold} />,
    <path key="h" d={d} fill="none" stroke={HC.goldPale} strokeWidth={3} transform="translate(0,-3)" opacity={0.7} />);
};

/** short strokes at the king's hands, re-drawn every 4 frames from hash (1, 2, 11): three per point, cream on ink.
 *  A stroke never reaches past PANIC_X (x 40..1040, film px: the hook's left hand is near the left edge, and a stroke
 *  cut by the edge read as a glitch on the thumbnail): it is shortened to the margin, or left out under 10 px */
const PANIC_X = [40, 1040] as const;
export const panic = (p: LifeP & { pts: Pt[]; seed?: number }): React.ReactNode => {
  const { f, from, pts, seed = 1 } = p, Lf = life(f, from, outOf(p), 3);
  if (!Lf) return null;
  const step = Math.floor((f - from) / 4), kids: React.ReactNode[] = [];   // the shot's clock: 852 draws what 0 drew
  pts.forEach((q, i) => {
    for (let k = 0; k < 3; k++) {
      const a = -Math.PI / 2 + (k - 1) * 0.95 + (hash01(step * 3 + k, i * 17 + seed) - 0.5) * 0.7 + (i % 2 ? 0.35 : -0.35);
      const r0 = 30 + 10 * hash01(step, i + k * 5 + seed), c = Math.cos(a), s = Math.sin(a);
      let len = 22 + 18 * hash01(step + 1, i * 3 + k + seed);
      const x0 = q.x + c * r0, x1 = x0 + c * len;
      if (x1 < PANIC_X[0]) len = (x0 - PANIC_X[0]) / -c;
      else if (x1 > PANIC_X[1]) len = (PANIC_X[1] - x0) / c;
      if (len < 10) continue;
      const d = `M${x0.toFixed(1)},${(q.y + s * r0).toFixed(1)} L${(q.x + c * (r0 + len)).toFixed(1)},${(q.y + s * (r0 + len)).toFixed(1)}`;
      kids.push(<path key={`a${i}${k}`} d={d} stroke={HC.ink} strokeWidth={15} />, <path key={`b${i}${k}`} d={d} stroke={HC.cream} strokeWidth={7} />);
    }
  });
  return svgF(p.key ?? `panic${from}`, 1 - Lf.lv, <g key="g" strokeLinecap="round" fill="none">{kids}</g>);
};
