import React from 'react';
import { AbsoluteFill } from 'remotion';
import { W, H, prog, easeInOut, expoInOut, hit, lerp, rnd, CUT, FILM_END, fb } from './lib';
import { useLook } from './look';

/* The camera of 《最后一面》. Every chapter is a full-frame stage; the camera lives in the transitions between them:
   whip pans (horizontal / vertical), zoom-throughs into a point of the outgoing stage, a roll, and a hard cut with a
   shake on the second drop. While a transition runs, the frame is rendered 8× across one frame's time and averaged
   (true motion blur), which is where the force of the moves comes from. Between transitions the stages drift slowly
   (translation only: text is never slowly scaled, which made type shimmer in an earlier film). */

export type TType = 'whip' | 'tilt' | 'push' | 'roll' | 'shake' | 'blur';
export type Trans = { at: number; type: TType; d: number; px?: number; py?: number };
export const TRANS: Trans[] = [
  { at: CUT.intro, type: 'whip', d: 0.42 },
  { at: CUT.model, type: 'tilt', d: 0.42 },
  { at: fb(64), type: 'push', d: 0.5, px: 960, py: 540 },
  { at: CUT.net, type: 'whip', d: 0.42 },
  { at: CUT.atus, type: 'push', d: 0.5, px: 960, py: 700 },
  { at: CUT.dunbar, type: 'roll', d: 0.5 },
  { at: CUT.drop, type: 'shake', d: 0.0 },
  { at: CUT.pay, type: 'tilt', d: 0.42 },
  { at: CUT.end, type: 'push', d: 0.5, px: 960, py: 560 },
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
    const h = hit(T, a, 0.14);
    x += Math.sin(T * 97) * 12 * h; y += Math.cos(T * 71) * 8 * h; s *= 1 + 0.035 * h;
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
  const L = useLook();
  const c = camOffset(T);
  const G = L.dark ? 64 : 30;
  const gx = ((c.x % G) + G) % G, gy = ((c.y % G) + G) % G;
  const marks: React.ReactNode[] = [];
  if (L.dark) {
    for (let i = -1; i < W / G + 2; i++) for (let j = -1; j < H / G + 2; j++) marks.push(<circle key={`${i}-${j}`} cx={i * G + gx} cy={j * G + gy} r={1.2} fill={L.grid} />);
  } else {
    const M = G * 5, mx = ((c.x % M) + M) % M, my = ((c.y % M) + M) % M;
    for (let i = -1; i < W / G + 2; i++) marks.push(<line key={`v${i}`} x1={i * G + gx} x2={i * G + gx} y1={-40} y2={H + 40} stroke={L.grid} strokeWidth={1} />);
    for (let j = -1; j < H / G + 2; j++) marks.push(<line key={`h${j}`} y1={j * G + gy} y2={j * G + gy} x1={-40} x2={W + 40} stroke={L.grid} strokeWidth={1} />);
    for (let i = -1; i < W / M + 2; i++) marks.push(<line key={`V${i}`} x1={i * M + mx} x2={i * M + mx} y1={-40} y2={H + 40} stroke={L.gridMajor} strokeWidth={1.6} />);
    for (let j = -1; j < H / M + 2; j++) marks.push(<line key={`H${j}`} y1={j * M + my} y2={j * M + my} x1={-40} x2={W + 40} stroke={L.gridMajor} strokeWidth={1.6} />);
  }
  const dust = Array.from({ length: L.dark ? 70 : 30 }, (_, i) => {
    const z = 0.3 + rnd(i, 1) * 1.2;
    const x = ((rnd(i, 2) * (W + 400) + c.x * z * 0.6 + T * 8 * z) % (W + 400) + W + 400) % (W + 400) - 200;
    const y = ((rnd(i, 3) * (H + 400) + c.y * z * 0.6 - T * 5 * z) % (H + 400) + H + 400) % (H + 400) - 200;
    return <circle key={i} cx={x} cy={y} r={0.8 + z * 1.4} fill={L.dust} opacity={(L.dark ? 0.08 : 0.05) + (L.dark ? 0.18 : 0.08) * z} />;
  });
  return (
    <AbsoluteFill style={{ background: L.bgGrad }}>
      {L.id === 'dusk' && <div style={{ position: 'absolute', left: 960 - 520 + c.x * 0.05, top: 760, width: 1040, height: 1040, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,0.55) 0%, rgba(255,150,80,0.25) 30%, rgba(255,120,60,0) 62%)' }} />}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, transform: `rotate(${c.r}deg) scale(${c.s})`, transformOrigin: '960px 540px' }}>
        {marks}
        {dust}
      </svg>
    </AbsoluteFill>
  );
};
export { FILM_END };

/** an inner camera from keys [t, z, cx, cy, tx, ty]: zoom z about (cx, cy) placed at screen (tx, ty); moves ease expo */
export type CamKey = [number, number, number, number, number, number];
export const keyCam = (T: number, keys: CamKey[]) => {
  let k = 0;
  while (k < keys.length - 1 && T >= keys[k + 1][0]) k++;
  const a = keys[k], b = keys[Math.min(k + 1, keys.length - 1)];
  const e = b[0] > a[0] ? expoInOut(prog(T, a[0], b[0])) : 0;
  const v = (j: number) => lerp(a[j], b[j], e);
  const z = v(1), cx = v(2), cy = v(3), tx = v(4), ty = v(5);
  return { z, cx, cy, tx, ty, t: `translate(${tx} ${ty}) scale(${z}) translate(${-cx} ${-cy})`, at: (x: number, y: number): [number, number] => [tx + z * (x - cx), ty + z * (y - cy)] };
};
