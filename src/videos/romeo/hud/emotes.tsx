// hud/emotes.tsx: WHAT COMES OUT OF THEIR EYES. The owner, 23 Nov, on v3b: "the tears and other expressions need to be
// bettered, maybe like libai tear drops coming out, heart coming out their eyes". Until v3b Romeo's tears were two
// streams painted on his cheeks and love was a face; now tears fly and hearts float.
// These belong to the FACES, not to her notes, so they are drawn in the picture's own hand (the rig's ink line, a flat
// fill, one light), never on parchment. Pure functions of the frame; the shot gives the eyes' places every frame
// (shots/kit.ts eyesPx), so everything rides the head through a sob, a turn or a zoom.
//
//   <TearSpray f eyes from to power? at? />      crying hard: a bead of tear wells at the outer corner of each eye and
//                                                drops fly out of it in an arc, one after another, and fall
//       eyes    the two eyes this frame (eyesPx);  from, to  the frames tears are let go (the last ones fall after `to`)
//       power   how hard he sobs at a frame, 0..1 (the drops let go on a sob are bigger and fly further)
//       at      where on the face the tears come out, in face units from the eye's middle: [outward, down]
//   <TearHang f eye from fall />                 one tear left hanging at an eye's corner: it swells, hangs, and at
//                                                `fall` runs down the cheek and is gone
//   <EyeHearts f eyes from to dir? pop? />       in love: small hearts float out of the eyes, one after another,
//                                                swaying, and fade
//       dir     the way they drift on screen (a unit vector; up by default: toward the one they look at)
//       pop     a frame at which every heart still in the air bursts (the question that wakes her)
//       size    the hearts' size against the head (1);  far  how far they float against that size (1)
//   <Huff f at x y dir? />                       a puff of breath blown out (her huff)
// THE LIMITS (the format's): tears and hearts live only in the comedy half (scenes A to C); the turn, the tomb and the
// shard get none. The floating hearts are the film's one signature emote (v5, the owner on the v4 cut: "This eyes
// turning into heart is too much, the floatinng heart is enough": the heart eyes and the heart that beat out of each
// eye are gone).
import React from "react";
import { clamp01, easeOut, easeOutBack, hash01, smooth } from "../../../kit/overlay";
import type { EyePt } from "../shots/kit";

const INK = "#1b2440";
export const TEAR = { fill: "#a9defa", lo: "#74bdea", ink: INK, hi: "#ffffff" } as const;
export const HEART_INK = { fill: "#e0364e", lo: "#b8252f", ink: "#5a0d1a", hi: "#ffd0d4" } as const;

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>{children}</svg>
);
const n1 = (v: number) => v.toFixed(1);

// ----------------------------------------------------------------------------------------------------------- tears
/** a tear drop in units of u: its round head toward +x, its tail at -x (length 10.4, width 5.8) */
const DROP = "M -5.6 0 C -2.8 -0.45 -0.5 -2.9 1.9 -2.9 A 2.9 2.9 0 1 1 1.9 2.9 C -0.5 2.9 -2.8 0.45 -5.6 0 Z";
const Drop: React.FC<{ x: number; y: number; deg: number; k: number; o?: number; sq?: number }> = ({ x, y, deg, k, o = 1, sq = 1 }) => (
  <g transform={`translate(${n1(x)},${n1(y)}) rotate(${n1(deg)}) scale(${(k * sq).toFixed(3)},${(k / sq).toFixed(3)})`} opacity={o}>
    <path d={DROP} fill={TEAR.fill} stroke={TEAR.ink} strokeWidth={1.25} strokeLinejoin="round" />
    <path d="M -2.2 1.2 C -0.6 2.0 0.9 2.2 2.6 1.9" stroke={TEAR.lo} strokeWidth={1.0} fill="none" strokeLinecap="round" />
    <path d="M 2.0 -1.75 A 2.0 2.0 0 0 1 3.75 -0.35" stroke={TEAR.hi} strokeWidth={0.95} fill="none" strokeLinecap="round" />
  </g>
);

/** the spray's numbers: one drop from each eye every PERIOD frames (the eyes take turns), LIFE frames in the air; the
 *  speeds are in face units a frame */
export const SPRAY = { period: 2, life: 17, out: 3.0, up: 5.0, g: 0.68, at: [5.6, 4.6] as [number, number] } as const;
export const TearSpray: React.FC<{ f: number; eyes: EyePt[]; from: number; to: number; power?: (f: number) => number; at?: [number, number]; size?: number }> = ({ f, eyes, from, to, power, at = SPRAY.at, size = 1 }) => {
  if (f < from || f >= to + SPRAY.life) return null;
  const S = SPRAY, kids: React.ReactNode[] = [];
  eyes.forEach((e, ei) => {
    if (e.on < 0.5 || !(e.u > 0)) return;
    const u = e.u, s = e.side;
    const P = (ox: number, oy: number): [number, number] => [e.x + e.ex[0] * s * ox + e.ey[0] * oy, e.y + e.ex[1] * s * ox + e.ey[1] * oy];
    // the drops in the air: born at b = from + n * period (+ half a period for the second eye), all the way back
    const off = ei * Math.floor(S.period / 2) + (ei ? 1 : 0);
    const n1st = Math.ceil((f - S.life + 1 - from - off) / S.period), nLast = Math.floor((Math.min(f, to - 1) - from - off) / S.period);
    for (let n = Math.max(0, n1st); n <= nLast; n++) {
      const b = from + off + n * S.period, t = f - b + 0.5, pw = power ? clamp01(power(b)) : 0.7;
      const h1 = hash01(n, 11 + ei), h2 = hash01(n, 23 + ei), h3 = hash01(n, 37 + ei);
      const sp = (0.74 + 0.42 * pw) * (0.92 + 0.16 * h1), vx = S.out * sp * (0.88 + 0.24 * h2), vy = -S.up * sp * (0.92 + 0.16 * h3);
      const [x0, y0] = P(at[0] + vx * t, at[1] + vy * t), gy = 0.5 * S.g * u * t * t;
      // heading: along its velocity on screen
      const wx = e.ex[0] * s * vx + e.ey[0] * vy, wy = e.ex[1] * s * vx + e.ey[1] * vy + S.g * u * t;
      const k = u * size * (0.62 + 0.3 * pw + 0.22 * h1) * Math.min(1, 0.45 + 0.28 * t), o = clamp01((S.life - t) / 3.2);
      // a drop is stretched along its way while it is fast, round as it tops out
      const sq = 1 + 0.16 * clamp01(Math.hypot(wx, wy) / (4.2 * u) - 0.4);
      kids.push(<Drop key={`${ei}-${n}`} x={x0} y={y0 + gy} deg={(Math.atan2(wy, wx) * 180) / Math.PI} k={k} o={o} sq={sq} />);
    }
    // the bead at the corner they come from: it swells with the sob
    if (f < to + 2) {
      const pw = power ? clamp01(power(f)) : 0.7, [bx, by] = P(at[0] - 0.6, at[1] + 0.4), r = u * size * (2.1 + 1.1 * pw) * clamp01((f - from + 2) / 3) * clamp01((to + 2 - f) / 3);
      if (r > 0.2) kids.push(
        <g key={`b${ei}`}>
          <circle cx={n1(bx)} cy={n1(by)} r={n1(r)} fill={TEAR.fill} stroke={TEAR.ink} strokeWidth={n1(1.25 * u * size)} />
          <path d={`M ${n1(bx + s * 0.1 * r)} ${n1(by - 0.62 * r)} A ${n1(0.62 * r)} ${n1(0.62 * r)} 0 0 ${s > 0 ? 1 : 0} ${n1(bx + s * 0.62 * r)} ${n1(by - 0.05 * r)}`} stroke={TEAR.hi} strokeWidth={n1(0.9 * u * size)} fill="none" strokeLinecap="round" />
        </g>);
    }
  });
  return kids.length ? <Svg>{kids}</Svg> : null;
};

/** ONE TEAR LEFT HANGING (he stops dead in the middle of a sob): it swells at the eye's outer corner over 6 frames,
 *  hangs there trembling, and from `fall` runs down the cheek, faster and faster, and is gone */
export const TearHang: React.FC<{ f: number; eye: EyePt; from: number; fall: number; at?: [number, number]; size?: number }> = ({ f, eye: e, from, fall, at = [4.4, 5.4], size = 1 }) => {
  if (f < from || e.on < 0.5 || !(e.u > 0)) return null;
  const u = e.u, s = e.side, t = f - from, tf = Math.max(0, f - fall + 0.5);
  const run = 0.5 * 0.5 * tf * tf;                                   // face units down the cheek
  if (run > 34) return null;
  const grow = easeOutBack(t / 6, 2.2), tremble = tf > 0 ? 0 : 0.035 * Math.sin(t * 0.9);
  const ox = at[0] + 0.05 * run, oy = at[1] + run;
  const x = e.x + e.ex[0] * s * ox + e.ey[0] * oy, y = e.y + e.ex[1] * s * ox + e.ey[1] * oy;
  const k = u * size * 0.86 * grow, o = clamp01((34 - run) / 8);
  // (the drop hangs head down: along the face's own down)
  const deg = (Math.atan2(e.ey[1], e.ey[0]) * 180) / Math.PI;
  return <Svg><Drop x={x} y={y} deg={deg} k={k} o={o} sq={1 + tremble + 0.22 * clamp01(tf / 6)} /></Svg>;
};

// ---------------------------------------------------------------------------------------------------------- hearts
/** a heart in units of its half width: its middle at 0, 0 (eyes.ts heart: the same curve as the heart eyes) */
const HEART_D = (() => {
  const a: string[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = (i / 36) * Math.PI * 2;
    a.push(`${i ? "L" : "M"} ${Math.pow(Math.sin(t), 3).toFixed(3)} ${(0.2 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16).toFixed(3)}`);
  }
  return a.join(" ") + " Z";
})();
const Heart: React.FC<{ x: number; y: number; r: number; deg?: number; o?: number; line?: boolean; w?: number }> = ({ x, y, r, deg = 0, o = 1, line, w = 1 }) => (
  <g transform={`translate(${n1(x)},${n1(y)}) rotate(${n1(deg)}) scale(${r.toFixed(3)})`} opacity={o}>
    {line
      ? <path d={HEART_D} fill="none" stroke={HEART_INK.fill} strokeWidth={(0.2 * w).toFixed(3)} strokeLinejoin="round" />
      : <>
        <path d={HEART_D} fill={HEART_INK.fill} stroke={HEART_INK.ink} strokeWidth={(0.2 * w).toFixed(3)} strokeLinejoin="round" />
        <path d="M 0.12 0.86 C 0.5 0.62 0.74 0.3 0.8 -0.02" stroke={HEART_INK.lo} strokeWidth={0.13} fill="none" strokeLinecap="round" />
        <path d="M -0.66 -0.2 C -0.66 -0.42 -0.52 -0.56 -0.36 -0.58" stroke={HEART_INK.hi} strokeWidth={0.15} fill="none" strokeLinecap="round" />
      </>}
  </g>
);

/** the hearts' numbers: one heart every PERIOD frames (the eyes take turns), LIFE frames in the air; speeds in face
 *  units a frame; r = the half width of a heart in face units */
export const HEARTS = { period: 5, life: 30, rise: 2.5, sway: 4.2, r: [3.3, 5.4] as [number, number] } as const;
export const EyeHearts: React.FC<{ f: number; eyes: EyePt[]; from: number; to: number; dir?: [number, number]; pop?: number; size?: number; far?: number }> = ({ f, eyes, from, to, dir = [0, -1], pop, size = 1, far = 1 }) => {
  const S = HEARTS;
  if (f < from || f >= to + S.life || (pop !== undefined && f > pop + 3)) return null;
  const dl = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / dl, dy = dir[1] / dl, kids: React.ReactNode[] = [];
  eyes.forEach((e, ei) => {
    if (e.on < 0.5 || !(e.u > 0)) return;
    const u = e.u * size;
    const off = ei * Math.round(S.period / 2) + 3;
    const n1st = Math.ceil((f - S.life + 1 - from - off) / S.period), nLast = Math.floor((Math.min(f, to - 1) - from - off) / S.period);
    for (let n = Math.max(0, n1st); n <= nLast; n++) {
      const b = from + off + n * S.period, t = f - b + 0.5;
      const h1 = hash01(n, 51 + ei), h2 = hash01(n, 67 + ei), h3 = hash01(n, 83 + ei);
      // the way up: quick out of the eye, then slower; a sway across the way; a little out to its own side
      const way = far * S.rise * (6 * (1 - Math.exp(-t / 4)) + 0.95 * t) * (0.85 + 0.3 * h1), sw = S.sway * Math.sin(t * (0.26 + 0.1 * h2) + 6.28 * h3) * smooth(t / 8) + e.side * 0.22 * t * (0.4 + h2);
      let x = e.x + u * (dx * way - dy * sw), y = e.y + u * (dy * way + dx * sw);
      let r = u * (S.r[0] + (S.r[1] - S.r[0]) * (n === 0 ? 1 : h1)) * easeOutBack(t / 6, 2.4) * (1 + 0.1 * smooth((t - S.life + 8) / 8)), o = clamp01((S.life - t) / 7);
      const deg = 13 * Math.sin(t * 0.3 + 6.28 * h2) * smooth(t / 6);
      const ticks: React.ReactNode[] = [];
      if (pop !== undefined && f >= pop) {
        // the burst: it swells and is gone in two frames; four short strokes jump off it and go in three
        const tp = f - pop + 0.5, k = clamp01(tp / 3);
        if (b > pop) continue;
        if (t > 3 && tp < 3) {
          const R = r * (1.15 + 0.75 * easeOut(k, 2));
          for (let i = 0; i < 4; i++) { const a = (i / 4) * 6.283 + 0.6 + h3 * 1.5, c = Math.cos(a), sn = Math.sin(a); ticks.push(<line key={i} x1={n1(x + c * R)} y1={n1(y + sn * R)} x2={n1(x + c * R * 1.38)} y2={n1(y + sn * R * 1.38)} stroke={HEART_INK.fill} strokeWidth={n1(1.5 * u)} strokeLinecap="round" opacity={1 - 0.6 * k} />); }
        }
        r *= 1 + 0.4 * clamp01(tp / 2); o *= clamp01(1 - tp / 2.2);
      }
      kids.push(<g key={`${ei}-${n}`}>{o > 0.01 ? <Heart x={x} y={y} r={r} deg={deg} o={o} /> : null}{ticks}</g>);
    }
  });
  return kids.length ? <Svg>{kids}</Svg> : null;
};

// ------------------------------------------------------------------------------------------------------------ huff
/** A HUFF: two little puffs of breath blown out from (x, y) along `dir`, growing and thinning over 14 frames (the
 *  series' 哼). r = the first puff's size in px */
export const Huff: React.FC<{ f: number; at: number; x: number; y: number; dir?: [number, number]; r?: number }> = ({ f, at, x, y, dir = [1, -0.25], r = 30 }) => {
  const t = f - at + 0.5;
  if (t < 0 || t > 16) return null;
  const dl = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / dl, dy = dir[1] / dl, kids: React.ReactNode[] = [];
  [0, 3].forEach((d, i) => {
    const tt = t - d;
    if (tt <= 0 || tt > 13) return;
    const k = easeOut(tt / 13, 2.4), way = r * (1.2 + 6 * k) * (i ? 0.72 : 1), R = r * (0.5 + 0.95 * k) * (i ? 0.7 : 1), o = clamp01((13 - tt) / 5);
    const cx = x + dx * way - dy * (i ? -0.5 : 0.35) * r, cy = y + dy * way + dx * (i ? -0.5 : 0.35) * r;
    // a puff: three round lobes with one outline
    const lob = [[-0.55, 0.1, 0.62], [0.1, -0.22, 0.8], [0.62, 0.16, 0.56]];
    kids.push(
      <g key={i} opacity={o}>
        {lob.map(([lx, ly, lr], j) => <circle key={`o${j}`} cx={n1(cx + lx * R)} cy={n1(cy + ly * R)} r={n1(lr * R + 2.6)} fill={INK} />)}
        {lob.map(([lx, ly, lr], j) => <circle key={`f${j}`} cx={n1(cx + lx * R)} cy={n1(cy + ly * R)} r={n1(lr * R)} fill="#f4efe6" />)}
      </g>);
  });
  return kids.length ? <Svg>{kids}</Svg> : null;
};
