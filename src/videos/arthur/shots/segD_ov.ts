// Segment D's own 2D overlays (1080 x 1920 px), in the look of overlay.tsx (thick ink strokes, flat fills). All of
// them are pure functions of the `frame` prop: no hooks, no state.
//   Cross   a red x that slams in (one per lord who fails at the sword)
//   Steam   two small puffs that shoot up from an angry head, in a loop
//   Zzz     the three rising z-less "sleep" bubbles over a dozing head (plain circles: no Latin letters in the picture)
//   Flower  a flower that pops open on top of a head (he has waited so long that flowers bloom on him)
import React from "react";
import { COL } from "../../group/kit/overlay";
import { h, clamp01, hash } from "../story";

const fill: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "visible" };
const svg = (...kids: React.ReactNode[]) => h("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: fill }, ...kids);
/** a damped spring 0 -> 1 with one overshoot, t in frames */
const sp = (t: number, f = 3.2, z = 0.42) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f, s = t / 30, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * s));
};

export type CrossProps = { at: number; out?: number; x: number; y: number; size?: number; frame: number };
export const Cross: React.FC<CrossProps> = ({ at, out, x, y, size = 120, frame }) => {
  if (frame < at) return null;
  const leave = out === undefined ? 0 : Math.pow(clamp01((frame - out) / 5), 2);
  if (leave >= 1) return null;
  const k = sp(frame - at + 1, 5, 0.5) * (1 - leave), a = size * 0.36;
  const d = `M${-a},${-a} L${a},${a} M${a},${-a} L${-a},${a}`;
  return svg(h("g", { transform: `translate(${x},${y}) scale(${k}) rotate(${(1 - Math.min(1, k)) * -40})`, opacity: 1 - leave },
    h("path", { d, stroke: COL.ink, strokeWidth: size * 0.36, strokeLinecap: "round", fill: "none" }),
    h("path", { d, stroke: COL.red, strokeWidth: size * 0.2, strokeLinecap: "round", fill: "none" })));
};

export type SteamProps = { x: number; y: number; r: number; a?: number; seed?: number; frame: number };
/** x, y = the head's centre on screen, r = its radius (px). Two puffs leave the top of the head, left and right. */
export const Steam: React.FC<SteamProps> = ({ x, y, r, a = 1, seed = 0, frame }) => {
  if (a <= 0.02 || r < 20) return null;
  const kids: React.ReactNode[] = [], per = 9;
  for (let i = 0; i < 4; i++) {
    const ph = frame + i * (per / 2) + seed * 4, u = ((((ph % per) + per) % per)) / per, cyc = Math.floor(ph / per);
    const side = i % 2 ? 1 : -1, ang = (-90 + side * (30 + 16 * hash(i + seed * 5, cyc))) * (Math.PI / 180);
    const d = r * (1.08 + 0.75 * (1 - Math.pow(1 - u, 2))), px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d;
    const s = r * (0.13 + 0.2 * u) * clamp01(a), o = clamp01((1 - u) * 2.2) * clamp01(u * 6);
    kids.push(h("g", { key: i, transform: `translate(${px},${py})`, opacity: o },
      h("circle", { cx: 0, cy: 0, r: s, fill: "#ffffff", stroke: COL.ink, strokeWidth: 6 }),
      h("circle", { cx: s * 0.75, cy: -s * 0.55, r: s * 0.62, fill: "#ffffff", stroke: COL.ink, strokeWidth: 6 }),
      h("circle", { cx: s * 0.3, cy: -s * 0.2, r: s * 0.7, fill: "#ffffff" })));
  }
  return svg(...kids);
};

export type ZzzProps = { x: number; y: number; r: number; at: number; out?: number; frame: number };
/** x, y = the head's centre, r = its radius (px): three bubbles rise from the top right of the head, small to large */
export const Zzz: React.FC<ZzzProps> = ({ x, y, r, at, out, frame }) => {
  if (frame < at || (out !== undefined && frame >= out)) return null;
  const kids: React.ReactNode[] = [], per = 30;
  for (let i = 0; i < 3; i++) {
    const u = ((((frame - at + i * 10) % per) + per) % per) / per;
    const px = x + r * (0.75 + 0.55 * u) + Math.sin(u * 6.283 + i) * r * 0.08, py = y - r * (0.85 + 1.0 * u), s = r * (0.07 + 0.13 * u);
    const o = clamp01(u * 5) * clamp01((1 - u) * 3);
    kids.push(h("circle", { key: i, cx: px, cy: py, r: s, fill: "#dff2ff", stroke: COL.ink, strokeWidth: 6, opacity: o }));
  }
  return svg(...kids);
};

export type FlowerProps = { x: number; y: number; r: number; at: number; out?: number; sway?: number; frame: number };
/** x, y = the head's centre, r = its radius (px): a stem grows out of the top of the head and a pink flower opens on
 *  it (stem first, the petals two frames later). sway = degrees about the root. */
export const Flower: React.FC<FlowerProps> = ({ x, y, r, at, out, sway = 0, frame }) => {
  if (frame < at || (out !== undefined && frame >= out)) return null;
  const ks = sp(frame - at + 1, 3.4, 0.5), kp = sp(frame - at - 1, 3.0, 0.38), len = r * 0.8 * Math.min(1.1, ks), pr = r * 0.27 * kp, sw = Math.max(5, r * 0.07);
  const petals: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; petals.push(h("circle", { key: i, cx: Math.cos(a) * pr * 1.05, cy: -len + Math.sin(a) * pr * 1.05, r: pr, fill: "#ff9cc4", stroke: COL.ink, strokeWidth: sw })); }
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; petals.push(h("circle", { key: `f${i}`, cx: Math.cos(a) * pr * 0.8, cy: -len + Math.sin(a) * pr * 0.8, r: pr * 0.8, fill: "#ff9cc4" })); }
  return svg(h("g", { transform: `translate(${x},${y - r * 0.93}) rotate(${sway})` },
    h("path", { d: `M0,0 Q${r * 0.07},${-len * 0.5} 0,${-len}`, stroke: COL.ink, strokeWidth: sw * 2.3, fill: "none", strokeLinecap: "round" }),
    h("path", { d: `M0,0 Q${r * 0.07},${-len * 0.5} 0,${-len}`, stroke: "#4fb04a", strokeWidth: sw * 1.1, fill: "none", strokeLinecap: "round" }),
    h("ellipse", { cx: r * 0.13 * ks, cy: -len * 0.42, rx: r * 0.13 * ks, ry: r * 0.06 * ks, fill: "#4fb04a", stroke: COL.ink, strokeWidth: sw * 0.8, transform: `rotate(-24 ${r * 0.13 * ks} ${-len * 0.42})` }),
    ...petals,
    h("circle", { cx: 0, cy: -len, r: pr * 0.62, fill: "#ffd84a", stroke: COL.ink, strokeWidth: sw * 0.8 })));
};
