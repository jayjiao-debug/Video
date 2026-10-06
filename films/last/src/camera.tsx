import React from 'react';
import { AbsoluteFill } from 'remotion';
import { W, H, prog, easeInOut, expoInOut, hit, lerp, rnd, CUT, FILM_END, INK } from './lib';

/* The camera of 《最后一面》. Every chapter is a full-frame stage; the camera lives in the transitions between them:
   whip pans (horizontal / vertical), zoom-throughs into a point of the outgoing stage, a roll, and a hard cut with a
   shake on the second drop. While a transition runs, the frame is rendered 8× across one frame's time and averaged
   (true motion blur), which is where the force of the moves comes from. Between transitions the stages drift slowly
   (translation only: text is never slowly scaled, which made type shimmer in an earlier film). */

export type TType = 'whip' | 'tilt' | 'push' | 'roll' | 'shake';
export type Trans = { at: number; type: TType; d: number; px?: number; py?: number };
export const TRANS: Trans[] = [
  { at: CUT.intro, type: 'whip', d: 0.5 },
  { at: CUT.model, type: 'push', d: 0.6, px: 960, py: 470 },
  { at: CUT.net, type: 'push', d: 0.6, px: 0, py: 0 }, // px/py filled by the model stage (the last red dot)
  { at: CUT.atus, type: 'whip', d: 0.5 },
  { at: CUT.dunbar, type: 'tilt', d: 0.5 },
  { at: CUT.drop, type: 'shake', d: 0.0 },
  { at: CUT.pay, type: 'roll', d: 0.6 },
  { at: CUT.end, type: 'push', d: 0.6, px: 960, py: 470 },
];

export const transAt = (T: number) => TRANS.find((t) => t.d > 0 && Math.abs(T - t.at) < t.d / 2 + 1 / 30);

/** transform of a stage that runs [a, z): its entry transition at a and exit at z */
export const stageStyle = (T: number, a: number, z: number, drift: [number, number] = [0, 0], focus?: [number, number]): React.CSSProperties | null => {
  const tin = TRANS.find((t) => Math.abs(t.at - a) < 1e-3);
  const tout = TRANS.find((t) => Math.abs(t.at - z) < 1e-3);
  const din = tin?.d ?? 0, dout = tout?.d ?? 0;
  if (T < a - din / 2 || T >= z + dout / 2) return null;
  let x = drift[0] * prog(T, a, z), y = drift[1] * prog(T, a, z), s = 1, r = 0, o = 1;
  let ox = 960, oy = 540;
  if (tin && T < a + din / 2 && din > 0) {
    const u = prog(T, a - din / 2, a + din / 2);
    const e = easeInOut(u);
    if (tin.type === 'whip') x += 1.25 * W * (1 - e);
    if (tin.type === 'tilt') y += 1.25 * H * (1 - e);
    if (tin.type === 'push') { s *= Math.exp(Math.log(0.08) * (1 - expoInOut(u))); o *= prog(u, 0.42, 0.62); }
    if (tin.type === 'roll') { r += -35 * (1 - e); s *= lerp(0.55, 1, e); o *= prog(u, 0.35, 0.6); }
  }
  if (tin?.type === 'shake') {
    const h = hit(T, a, 0.22);
    x += Math.sin(T * 97) * 26 * h; y += Math.cos(T * 71) * 18 * h; s *= 1 + 0.07 * h;
  }
  if (tout && T >= z - dout / 2 && dout > 0) {
    const u = prog(T, z - dout / 2, z + dout / 2);
    const e = easeInOut(u);
    if (tout.type === 'whip') x -= 1.25 * W * e;
    if (tout.type === 'tilt') y -= 1.25 * H * e;
    if (tout.type === 'push') {
      const [px, py] = focus ?? [tout.px ?? 960, tout.py ?? 540];
      const k = expoInOut(u);
      s *= Math.exp(Math.log(14) * k); ox = px; oy = py;
      x += (960 - px) * k; y += (540 - py) * k;
      o *= 1 - prog(u, 0.5, 0.75);
    }
    if (tout.type === 'roll') { r += 40 * e; s *= lerp(1, 2.4, e); o *= 1 - prog(u, 0.45, 0.7); }
  }
  return { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, transformOrigin: `${ox}px ${oy}px`, opacity: o };
};

/** the world behind the stages: a dot grid and drifting dust that follow the camera (parallax), so the frame is never still */
const camOffset = (T: number) => {
  let x = -14 * T, y = -6 * T, s = 1, r = 0;
  for (const t of TRANS) {
    if (t.d <= 0) continue;
    const e = easeInOut(prog(T, t.at - t.d / 2, t.at + t.d / 2));
    if (t.type === 'whip') x -= 0.4 * W * e;
    if (t.type === 'tilt') y -= 0.4 * H * e;
    if (t.type === 'push' || t.type === 'roll') { const k = Math.sin(Math.PI * e); s *= 1 + 0.6 * k; if (t.type === 'roll') r += 12 * k; }
  }
  return { x, y, s, r };
};

export const World: React.FC<{ T: number }> = ({ T }) => {
  const c = camOffset(T);
  const G = 64;
  const gx = ((c.x % G) + G) % G, gy = ((c.y % G) + G) % G;
  const dots: React.ReactNode[] = [];
  for (let i = -1; i < W / G + 2; i++) for (let j = -1; j < H / G + 2; j++) dots.push(<circle key={`${i}-${j}`} cx={i * G + gx} cy={j * G + gy} r={1.2} fill="rgba(242,240,234,0.10)" />);
  const dust = Array.from({ length: 70 }, (_, i) => {
    const z = 0.3 + rnd(i, 1) * 1.2;
    const x = ((rnd(i, 2) * (W + 400) + c.x * z * 0.6 + T * 8 * z) % (W + 400) + W + 400) % (W + 400) - 200;
    const y = ((rnd(i, 3) * (H + 400) + c.y * z * 0.6 - T * 5 * z) % (H + 400) + H + 400) % (H + 400) - 200;
    return <circle key={i} cx={x} cy={y} r={0.8 + z * 1.4} fill={INK} opacity={0.08 + 0.18 * z} />;
  });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 45%, #111216 0%, #08080b 60%, #040405 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, transform: `rotate(${c.r}deg) scale(${c.s})`, transformOrigin: '960px 540px' }}>
        {dots}
        {dust}
      </svg>
    </AbsoluteFill>
  );
};
export { FILM_END };
