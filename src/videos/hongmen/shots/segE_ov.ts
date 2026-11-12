// Segment E's own 2D overlays (hook-free: plain functions of the frame that return React nodes, built with h(...)).
// STAND-INS for the film-wide overlay components of src/videos/hongmen/hud/ (that folder did not exist when segment E
// was built). The LOOK is the one segments A and B use (group/kit/overlay.tsx type: gold / white on a thick ink
// stroke, springy pops), so the informer's "?" (line 2) and his name plate (line 9) come back at line 20 as the same
// things. Every function takes the frame and px on the 1080 x 1920 frame; swapping a hud component in is one line.
//   tag        a name tag: the name in gold, the role in white under it
//   mark       the gold "?" of line 2
//   burst      radial dashes on a hit
//   streak     the smear of a whip pan
//   cloth      the tent-door cloth of the flap wipe (covering, then uncovering: it goes on down)
//   bubble     a speech bubble with the NAME in gold (the flash back of line 21)
//   memory     the look of a flash back: a white flash on its first frames, a soft white edge round the frame
// Nothing here keeps state; nothing is random.
import type React from "react";
import { COL, PUNCH, SNAP, springAt, ts } from "../../group/kit/overlay";
import { clamp01, h, lerp } from "../story";

const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };
const eIn = (x: number) => Math.pow(clamp01(x), 3);
/** 0 before `out`, 1 `n` frames later (the leave of an overlay) */
const leave = (f: number, out?: number, n = 7) => (out === undefined ? 0 : eIn((f - out) / n));

// ------------------------------------------------------------------------------------------------------------ name tag
export type TagProps = { f: number; at: number; out?: number; x: number; y: number; text: string; sub?: string; size?: number; color?: string; slam?: boolean; key?: string };
/** a name tag centred on (x, y): pops in by a spring on `at` (slam: it comes down large and lands in 3 frames, as the
 *  name plate of line 9), leaves over 7 frames from `out` */
export const tag = ({ f, at, out, x, y, text, sub, size = 84, color = COL.gold, slam, key }: TagProps): React.ReactNode => {
  if (f < at) return null;
  const lv = leave(f, out); if (lv >= 1) return null;
  const k = springAt(f, at, PUNCH), ks = springAt(f, at + 3, SNAP);
  const sc = slam ? lerp(2.1, 1, 1 - Math.pow(1 - clamp01((f - at + 1) / 3), 3)) : 0.5 + 0.5 * k;
  return h("div", { style: FULL, key: key ?? `tag${at}` },
    h("div", { style: { position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - lv } },
      h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${(sc * (1 - 0.3 * lv)).toFixed(4)})`, display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" } },
        h("span", { style: ts(size, color) }, text),
        sub ? h("span", { style: { ...ts(Math.round(size * 0.52), COL.white), marginTop: 6, transform: `scale(${ks.toFixed(4)})`, display: "inline-block" } }, sub) : null)));
};

// ------------------------------------------------------------------------------------------------------------ the "?"
/** the gold "?" of line 2 (same size, colour and wobble): pops from its foot on `at`; from `out` it is knocked away up
 *  and to the right over 4 frames */
export const mark = ({ f, at, out, x, y, text = "?", size = 230 }: { f: number; at: number; out: number; x: number; y: number; text?: string; size?: number }): React.ReactNode => {
  if (f < at || f >= out + 4) return null;
  const t = (f - at + 1) / 30, k = springAt(f, at, PUNCH), u = clamp01((f - out + 1) / 4);
  const wob = 9 + 7 * Math.exp(-t * 5) * Math.sin(t * 2 * Math.PI * 3.2);
  return h("div", { style: FULL, key: `mark${at}` },
    h("div", { style: { position: "absolute", left: x + 260 * u * u, top: y - 330 * u, width: 0, height: 0, opacity: 1 - u * u } },
      h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${k.toFixed(4)}) rotate(${(wob + 50 * u).toFixed(2)}deg)`, transformOrigin: "50% 85%", whiteSpace: "nowrap" } },
        h("span", { style: ts(size, COL.gold) }, text))));
};

// ------------------------------------------------------------------------------------------------------------ burst
/** radial dashes for 8 frames from `at` (a name that lands) */
export const burst = ({ f, at, x, y, r = 120, n = 10, color = COL.gold }: { f: number; at: number; x: number; y: number; r?: number; n?: number; color?: string }): React.ReactNode => {
  const u = (f - at) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), o = 1 - u * u;
  return h("svg", { key: `burst${at}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
    h("g", { opacity: o, strokeLinecap: "round", fill: "none" },
      ...Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
        const d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
        return h("g", { key: i }, h("path", { d, stroke: COL.ink, strokeWidth: 17 }), h("path", { d, stroke: color, strokeWidth: 9 }));
      })));
};

// ------------------------------------------------------------------------------------------------------------ whip pan
/** THE SMEAR OF A WHIP PAN (the post chain has no motion blur): horizontal streaks in the colours of the two plates,
 *  over frames from .. to (inclusive), thickest on the cut. dir 1 = the camera pans RIGHT (the picture rushes left). */
export const streak = ({ f, from, to, cut, dir, cols }: { f: number; from: number; to: number; cut: number; dir: 1 | -1; cols: string[] }): React.ReactNode => {
  if (f < from || f > to) return null;
  const k = f < cut ? (f - from + 1) / (cut - from + 1) : 1 - (f - cut) / (to - cut + 1);
  const n = 22, bars: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(i * 78.233 + 1.7) * 12543.123) % 1, a = Math.abs(r1), b = Math.abs(r2);
    const y = ((i + 0.5) / n) * 1920 + (a - 0.5) * 60, hgt = 26 + 90 * b, len = 500 + 900 * a;
    const x = ((b * 1900 - dir * (f - from) * 420 * (0.6 + 0.8 * a)) % 2200 + 2200) % 2200 - 700;
    bars.push(h("rect", { key: i, x, y: y - hgt / 2, width: len, height: hgt, rx: hgt / 2, fill: cols[i % cols.length], opacity: (0.35 + 0.5 * a) * k }));
  }
  return h("svg", { key: `streak${cut}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: FULL },
    h("rect", { x: 0, y: 0, width: 1080, height: 1920, fill: cols[0], opacity: 0.55 * k * k }), ...bars);
};

// ------------------------------------------------------------------------------------------------------------ flap wipe
/** THE FLAP WIPE going IN: the cream cloth of the command tent's door sweeps DOWN over the frame and on down out of
 *  it. p 0 = nothing; 0..1 = the hem comes down (p 1 = the whole frame is cloth); 1..2 = the cloth's upper edge
 *  follows it down (p 2 = nothing again). The cut sits at p = 1. */
export const cloth = (p: number, col = "#eadfb8"): React.ReactNode => {
  if (p <= 0 || p >= 2) return null;
  const hem = lerp(-80, 2060, clamp01(p)), top = p > 1 ? lerp(-40, 2000, p - 1) : -40;
  const pts: string[] = [`M0,${top} L1080,${top} L1080,${hem}`];
  for (let i = 4; i >= 0; i--) { const x0 = (i * 1080) / 5, xm = x0 + 108; pts.push(`Q${xm},${hem + 70} ${x0},${hem}`); }
  const d = pts.join(" ") + " Z";
  return h("svg", { key: "cloth", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: FULL },
    h("path", { d, fill: "#3a2f4a", opacity: 0.35, transform: "translate(0,26)" }),
    h("path", { d, fill: col, stroke: COL.ink, strokeWidth: 9, strokeLinejoin: "round" }),
    ...[0.22, 0.5, 0.78].map((u, i) => h("rect", { key: i, x: 1080 * u - 5, y: Math.max(0, top), width: 10, height: Math.max(0, hem - 20 - Math.max(0, top)), fill: "#c9b98a", opacity: 0.55 })),
    // the roller on the cloth's upper edge while it leaves
    p > 1 ? h("rect", { x: -20, y: top - 26, width: 1120, height: 52, rx: 26, fill: "#8a6a44", stroke: COL.ink, strokeWidth: 9 }) : null);
};

// ------------------------------------------------------------------------------------------------------------ speech bubble
export type BubbleProps = { f: number; at: number; out?: number; x: number; y: number; w: number; hgt: number; text: string; size?: number; tail: [number, number]; color?: string };
/** A SPEECH BUBBLE centred on (x, y), w x hgt px, white with an ink edge, its tail pointing at `tail` (the speaker's
 *  mouth); the text in gold on ink like the name plate. Pops by a spring on `at`, jolts once 3 frames later. */
export const bubble = ({ f, at, out, x, y, w, hgt, text, size = 110, tail, color = COL.gold }: BubbleProps): React.ReactNode => {
  if (f < at) return null;
  const lv = leave(f, out, 4); if (lv >= 1) return null;
  const k = springAt(f, at, PUNCH), sc = (0.25 + 0.75 * k) * (1 - 0.4 * lv), r = Math.min(hgt / 2, 64);
  // the tail: a wedge from the bubble's edge toward the mouth (drawn under the body so that the edge is one line)
  const dx = tail[0] - x, dy = tail[1] - y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, bw = 46;
  const ax = x + (dx / L) * (hgt * 0.32), ay = y + (dy / L) * (hgt * 0.32);
  const tailD = `M${ax + nx * bw},${ay + ny * bw} L${tail[0]},${tail[1]} L${ax - nx * bw},${ay - ny * bw} Z`;
  return h("div", { style: { ...FULL, opacity: 1 - lv }, key: `bubble${at}` },
    h("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
      h("g", { transform: `translate(${x},${y}) scale(${sc.toFixed(4)}) translate(${-x},${-y})` },
        h("path", { d: tailD, fill: COL.white, stroke: COL.ink, strokeWidth: 12, strokeLinejoin: "round" }),
        h("rect", { x: x - w / 2, y: y - hgt / 2, width: w, height: hgt, rx: r, fill: COL.white, stroke: COL.ink, strokeWidth: 12 }),
        h("path", { d: tailD, fill: COL.white }))),
    h("div", { style: { position: "absolute", left: x, top: y, width: 0, height: 0 } },
      h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-52%) scale(${sc.toFixed(4)})`, whiteSpace: "nowrap" } },
        h("span", { style: ts(size, color) }, text))));
};

// ------------------------------------------------------------------------------------------------------------ flash back
/** THE LOOK OF A FLASH BACK over frames from .. to (inclusive): a white flash that opens it (3 frames) and closes it
 *  (the last 2 frames), and a soft white edge round the whole frame in between (a memory, not the present) */
export const memory = (f: number, from: number, to: number): React.ReactNode => {
  if (f < from || f > to) return null;
  const flash = Math.max([0.85, 0.5, 0.2][f - from] ?? 0, [0.7, 0.35][to - f] ?? 0);
  return h("div", { style: FULL, key: "memory" },
    h("div", { style: { ...FULL, background: "radial-gradient(ellipse 62% 56% at 50% 46%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.62) 100%)" } }),
    flash > 0 ? h("div", { style: { ...FULL, background: "#ffffff", opacity: flash } }) : null);
};
/** a white flash that opens a shot after a flash back (frames from .. from + 1) */
export const flashIn = (f: number, from: number): React.ReactNode => {
  const o = [0.55, 0.22][f - from];
  return o === undefined ? null : h("div", { style: { ...FULL, background: "#ffffff", opacity: o }, key: "flashIn" });
};
