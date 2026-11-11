// Segment A's own 2D overlays (1080 x 1920 px), in the look of overlay.tsx: thick ink strokes, white / gold / pale
// blue fills. All of them are pure functions of the `frame` prop (no hooks, no state).
//   Glint   a four-point sparkle that opens and closes on a point (the blade catching the light)
//   Sweat   drops flying off a straining head, in a loop
//   Strain  short tremble strokes on both sides of a point (two fists shaking on the grip)
import React from "react";
import { COL } from "../../group/kit/overlay";
import { h, clamp01, hash } from "../story";

const fill: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "visible" };
const svg = (...kids: React.ReactNode[]) => h("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: fill }, ...kids);

export type GlintProps = { at: number; x: number; y: number; size?: number; dur?: number; rot?: number; color?: string; frame: number };
export const Glint: React.FC<GlintProps> = ({ at, x, y, size = 120, dur = 10, rot = 0, color = "#ffffff", frame }) => {
  const u = (frame - at) / dur;
  if (u < 0 || u >= 1) return null;
  const s = Math.sin(Math.PI * Math.pow(u, 0.7)) * size * 0.5, a = rot + 50 * u;
  if (s < 2) return null;
  const k = 0.13;
  const d = `M0,${-s} Q${s * k},${-s * k} ${s},0 Q${s * k},${s * k} 0,${s} Q${-s * k},${s * k} ${-s},0 Q${-s * k},${-s * k} 0,${-s} Z`;
  return svg(h("g", { transform: `translate(${x},${y}) rotate(${a})` },
    h("path", { d, fill: color, stroke: COL.ink, strokeWidth: 7, strokeLinejoin: "round" }),
    h("circle", { cx: 0, cy: 0, r: s * 0.16, fill: "#ffffff" })));
};

export type SweatProps = { x: number; y: number; r: number; a?: number; seed?: number; frame: number };
/** x, y = the head's centre, r = its radius on screen (px). Drops leave the top of the head on both sides. */
export const Sweat: React.FC<SweatProps> = ({ x, y, r, a = 1, seed = 0, frame }) => {
  if (a <= 0.02 || r < 20) return null;
  const drops: React.ReactNode[] = [], N = 5, per = 10;
  for (let i = 0; i < N; i++) {
    const ph = (((frame + i * (per / N) + seed * 3) % per) + per) % per, u = ph / per;
    const cyc = Math.floor((frame + i * (per / N) + seed * 3) / per);
    const side = i % 2 ? 1 : -1, ang = (-90 + side * (28 + 34 * hash(i + seed * 7, cyc))) * (Math.PI / 180);
    const d = r * (1.04 + 0.55 * (1 - Math.pow(1 - u, 2))), px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d + r * 0.25 * u * u;
    const s = r * 0.11 * (0.7 + 0.5 * hash(i, 3)) * clamp01(a), o = clamp01((1 - u) * 3);
    const rot = (Math.atan2(Math.sin(ang), Math.cos(ang)) * 180) / Math.PI + 90;
    drops.push(h("g", { key: i, transform: `translate(${px},${py}) rotate(${rot}) scale(${s})`, opacity: o },
      h("path", { d: "M0,-2.2 C1.1,-0.6 1.5,0.3 1.5,1 A1.5,1.5 0 1 1 -1.5,1 C-1.5,0.3 -1.1,-0.6 0,-2.2 Z", fill: "#9fdcff", stroke: COL.ink, strokeWidth: 0.55, strokeLinejoin: "round" })));
  }
  return svg(...drops);
};

export type StrainProps = { x: number; y: number; w: number; a?: number; frame: number };
/** x, y = the point that shakes (the fists), w = how far out the strokes sit (px) */
export const Strain: React.FC<StrainProps> = ({ x, y, w, a = 1, frame }) => {
  if (a <= 0.02) return null;
  const flip = Math.floor(frame / 2) % 2, kids: React.ReactNode[] = [];
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const off = w * (1 + 0.28 * i + (flip ? 0.1 : 0)), hh = w * (0.62 - 0.14 * i), cx = x + side * off, bow = side * w * 0.16;
    const d = `M${cx},${y - hh} Q${cx + bow},${y} ${cx},${y + hh}`;
    kids.push(h("path", { key: `${side}${i}a`, d, stroke: COL.ink, strokeWidth: 15, fill: "none", strokeLinecap: "round", opacity: a * (1 - 0.25 * i) }));
    kids.push(h("path", { key: `${side}${i}b`, d, stroke: "#ffffff", strokeWidth: 7, fill: "none", strokeLinecap: "round", opacity: a * (1 - 0.25 * i) }));
  }
  return svg(...kids);
};
