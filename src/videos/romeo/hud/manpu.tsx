// hud/manpu.tsx: 漫符, THE MANGA MARKS of the party and the balcony (v7, the owner, 24 Nov: "IM thinking of adding more
// expressive emotes to the characters in that balcony, party scenes"; emo.ts switches each one on). Drawn in the same
// hand as hud/emotes.tsx (the rig's ink line, a flat fill, one light). Pure functions of the frame; the shot gives the
// head's place on screen every frame (VERBS.headPx: x, y, r in px), so a mark rides the head through a turn or a zoom.
//
//   <Sparkles f from to head />     少女漫 sparkles: four-point stars twinkle round the head, one after another, and go
//   <DustPuff f at x y s dir />     the cloud a cartoon figure leaves when it dashes off: puffs that swell and thin out
//                                   where it stood, a few speed lines toward where it went. (x, y) = the ground point
//                                   in px, s = px per metre there, dir = the screen way it went
import React from "react";
import { clamp01, easeOut, easeOutBack, hash01, smooth } from "../../../kit/overlay";

const INK = "#1b2440";
const n1 = (v: number) => v.toFixed(1);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>{children}</svg>
);
export type HeadPx = { x: number; y: number; r: number };
/** the phone-safe band the marks keep to (px from the top): under the REC row, over the subtitles */
const SAFE = { top: 250, bottom: 1240 };

// ------------------------------------------------------------------------------------------------------- sparkles
/** a four-point star, unit size (tips at 1), its waist pinched in */
const STAR = "M 0 -1 Q 0.13 -0.13 1 0 Q 0.13 0.13 0 1 Q -0.13 0.13 -1 0 Q -0.13 -0.13 0 -1 Z";
export const SPARKLE = { period: 4, life: 24, gold: "#f2bf45", fill: "#fffbea", glow: "#fff3c4" } as const;
export const Sparkles: React.FC<{ f: number; from: number; to: number; head: HeadPx | null; size?: number }> = ({ f, from, to, head, size = 1 }) => {
  const S = SPARKLE;
  if (!head || f < from || f >= to + S.life) return null;
  const kids: React.ReactNode[] = [];
  const n1st = Math.ceil((f - S.life + 1 - from) / S.period), nLast = Math.floor((Math.min(f, to - 1) - from) / S.period);
  for (let n = Math.max(0, n1st); n <= nLast; n++) {
    const b = from + n * S.period, t = f - b + 0.5;
    const h1 = hash01(n, 131), h2 = hash01(n, 149), h3 = hash01(n, 163);
    // round the head's edge from its upper sides down past its ears, never over the face; alternating sides (in her
    // close the head is most of the frame's width: further out they were off the frame)
    const side = n % 2 ? 1 : -1, a = -Math.PI / 2 + side * (0.6 + 1.55 * h1);
    const R = head.r * (0.98 + 0.4 * h2);
    const x = head.x + Math.cos(a) * R, y = head.y + Math.sin(a) * R - head.r * 0.18 * (t / S.life);
    if (y < SAFE.top || y > SAFE.bottom || x < 20 || x > 1060) continue;
    const k = easeOutBack(t / 7, 2.2) * smooth((S.life - t) / 9), s = head.r * size * (0.085 + 0.075 * h3) * k;
    if (s <= 0.3) continue;
    const deg = 40 * (t / S.life) * (h2 > 0.5 ? 1 : -1);
    kids.push(
      <g key={n} transform={`translate(${n1(x)},${n1(y)})`}>
        <circle r={n1(s * 0.9)} fill={S.glow} opacity={0.35 * k} />
        <g transform={`rotate(${n1(deg)}) scale(${s.toFixed(2)})`}>
          <path d={STAR} fill={S.fill} stroke={S.gold} strokeWidth={0.09} strokeLinejoin="round" />
        </g>
        {/* a small second star at its shoulder on every third */}
        {n % 3 === 0 ? <g transform={`translate(${n1(s * 1.15)},${n1(-s * 0.95)}) rotate(${n1(-deg)}) scale(${(s * 0.42).toFixed(2)})`}><path d={STAR} fill={S.fill} stroke={S.gold} strokeWidth={0.12} /></g> : null}
      </g>);
  }
  return kids.length ? <Svg>{kids}</Svg> : null;
};

// ---------------------------------------------------------------------------------------------------- dust cloud
export const DUST = { life: 34, fill: "#efe6d6", shade: "#cfc2ab" } as const;
export const DustPuff: React.FC<{ f: number; at: number; x: number; y: number; s: number; dir?: [number, number] }> = ({ f, at, x, y, s, dir = [1, 0] }) => {
  const D = DUST, t = f - at + 0.5;
  if (t < 0 || t > D.life || !(s > 0)) return null;
  const dl = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / dl, dy = dir[1] / dl;
  const grow = easeOut(clamp01(t / 10), 2.2), o = clamp01((D.life - t) / 12);
  // five puffs along the ground, leaning away from the way he went, the biggest in the middle
  const puffs: [number, number, number][] = [[-0.26, -0.02, 0.13], [-0.1, -0.1, 0.18], [0.08, -0.06, 0.16], [0.24, -0.01, 0.12], [-0.02, 0.02, 0.14]];
  const kids: React.ReactNode[] = [];
  const geo = puffs.map(([px, py, pr], i) => {
    const h = hash01(i, 191), r = s * pr * (0.55 + 0.6 * grow) * (0.9 + 0.2 * h);
    return { cx: x + s * (px - 0.18 * dx * grow), cy: y + s * (py - 0.05 * grow - 0.06 * t / D.life), r };
  });
  // (v7.1) never on the subtitles: while the lens is still tilting down onto the spot, the cloud passed through the
  // subtitle band on its way up the picture. Below the marks' safe band it fades out (gone 60 px under it), so it comes
  // into view as the lens arrives
  const bottom = Math.max(...geo.map((g) => g.cy + g.r + 2.4)), vis = clamp01((SAFE.bottom + 60 - bottom) / 60);
  if (vis <= 0) return null;
  geo.forEach(({ cx, cy, r }, i) => {
    kids.push(<circle key={`o${i}`} cx={n1(cx)} cy={n1(cy)} r={n1(r + 2.4)} fill={INK} opacity={o * vis} />);
    kids.push(<circle key={`f${i}`} cx={n1(cx)} cy={n1(cy)} r={n1(r)} fill={D.fill} opacity={o * vis} />);
    kids.push(<circle key={`s${i}`} cx={n1(cx + r * 0.22)} cy={n1(cy + r * 0.28)} r={n1(r * 0.55)} fill={D.shade} opacity={0.55 * o * vis} />);
  });
  // the speed lines: three, toward where he went, gone in the first half
  const lo = clamp01((D.life * 0.55 - t) / 6) * vis;
  if (lo > 0) [-0.12, 0, 0.12].forEach((oy, i) => {
    const x0 = x + s * (0.3 + 0.1 * i) * dx, y0 = y + s * (oy - 0.12), L = s * (0.35 + 0.15 * hash01(i, 211)) * smooth(t / 5);
    kids.push(<line key={`l${i}`} x1={n1(x0)} y1={n1(y0)} x2={n1(x0 + dx * L)} y2={n1(y0 + dy * L)} stroke={INK} strokeWidth={n1(Math.max(2, s * 0.018))} strokeLinecap="round" opacity={0.8 * lo} />);
  });
  return <Svg>{kids}</Svg>;
};
