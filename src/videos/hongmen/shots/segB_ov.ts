// Segment B's own 2D overlays (hook-free: plain functions of the frame that return React nodes, built with h(...)):
// the three things the film's overlay package (src/videos/hongmen/hud/) does not have. The name tags, the 亲家 stamp
// and the informer's window of this segment ARE the package's (hud/tag.tsx, stamp.tsx, inset.tsx: see segB.ts).
//   burst      radial dashes on a hit (the fist on the table)
//   streak     the smear of a whip pan (the post chain has no motion blur)
//   flapWipe   the tent-door cloth that sweeps down over the frame (the way into the banquet)
//   anger      the vein mark beside a furious head (line 6: 大怒)
//   mystery    the informer's round window BEFORE he has a face: a black figure with his cap and a "?" (line 8, 小人),
//              ring for ring where hud/inset.tsx then pops the real face over it (line 9)
// Nothing here keeps state; nothing is random.
import type React from "react";
import { COL, FONT_STACK } from "../../group/kit/overlay";
import { clamp01, h, lerp, easeOutBack } from "../story";

const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };

// ------------------------------------------------------------------------------------------------------------ burst
/** radial dashes for 8 frames from `at` (a fist on a table, a name that lands) */
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
  // strength: 0 at the ends, 1 on the cut
  const k = f < cut ? (f - from + 1) / (cut - from + 1) : 1 - (f - cut) / (to - cut + 1);
  const n = 22, bars: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    // a fixed pseudo-random layout per bar (a hash of i), sliding with the frame
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(i * 78.233 + 1.7) * 12543.123) % 1, a = Math.abs(r1), b = Math.abs(r2);
    const y = ((i + 0.5) / n) * 1920 + (a - 0.5) * 60, hgt = 26 + 90 * b, len = 500 + 900 * a;
    const x = ((b * 1900 - dir * (f - from) * 420 * (0.6 + 0.8 * a)) % 2200 + 2200) % 2200 - 700;
    bars.push(h("rect", { key: i, x, y: y - hgt / 2, width: len, height: hgt, rx: hgt / 2, fill: cols[i % cols.length], opacity: (0.35 + 0.5 * a) * k }));
  }
  return h("svg", { key: `streak${cut}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: FULL },
    h("rect", { x: 0, y: 0, width: 1080, height: 1920, fill: cols[0], opacity: 0.55 * k * k }), ...bars);
};

// ------------------------------------------------------------------------------------------------------------ flap wipe
/** THE FLAP WIPE going IN: the cream cloth of the command tent's door sweeps DOWN over the frame. `cover` 0 = nothing,
 *  1 = the whole frame is cloth (its hem a soft scallop, a darker shadow line under the hem). */
export const flapWipe = (cover: number, col = "#eadfb8"): React.ReactNode => {
  const c = clamp01(cover);
  if (c <= 0) return null;
  const y = lerp(-80, 2060, c), pts: string[] = [`M0,0 L1080,0 L1080,${y}`];
  for (let i = 4; i >= 0; i--) { const x0 = (i * 1080) / 5, xm = x0 + 108; pts.push(`Q${xm},${y + 70} ${x0},${y}`); }
  return h("svg", { key: "flap", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: FULL },
    h("path", { d: pts.join(" ") + " Z", fill: "#3a2f4a", opacity: 0.35, transform: "translate(0,26)" }),
    h("path", { d: pts.join(" ") + " Z", fill: col, stroke: COL.ink, strokeWidth: 9, strokeLinejoin: "round" }),
    ...[0.22, 0.5, 0.78].map((u, i) => h("rect", { key: i, x: 1080 * u - 5, y: 0, width: 10, height: Math.max(0, y - 20), fill: "#c9b98a", opacity: 0.55 })));
};

// ------------------------------------------------------------------------------------------------------------ anger
/** THE VEIN MARK of a furious man (four hooked strokes round a centre): pops on `from` beside his head at (x, y),
 *  throbs twice a second, jumps again on every frame of `hits`, leaves over its last 4 frames before `out`. s = size. */
export const anger = ({ f, from, out, x, y, s = 1, hits = [] }: { f: number; from: number; out: number; x: number; y: number; s?: number; hits?: number[] }): React.ReactNode => {
  if (f < from || f >= out) return null;
  const pop = easeOutBack(clamp01((f - from) / 4), 2.4), gone = clamp01((out - f) / 4);
  let hit = 0; for (const k of hits) if (f >= k && f < k + 5) hit = Math.max(hit, 1 - (f - k) / 5);
  const k = s * pop * (1 + 0.09 * Math.sin((f - from) * 0.42) + 0.3 * hit) * (0.6 + 0.4 * gone);
  const arm = "M-12,-40 C-12,-22 -22,-12 -40,-12", arms = [0, 90, 180, 270].map((a) => h("path", { key: a, d: arm, transform: `rotate(${a})` }));
  return h("svg", { key: `anger${from}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
    h("g", { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(12) scale(${k.toFixed(3)})`, opacity: gone, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
      h("g", { stroke: COL.ink, strokeWidth: 26 }, ...arms), h("g", { stroke: "#e2342a", strokeWidth: 13 }, ...arms)));
};

// ------------------------------------------------------------------------------------------------------------ the unknown man
/** THE WINDOW OF THE UNKNOWN MAN: the round window of hud/inset.tsx (same rings, same centre x / y and diameter d, so
 *  that the film's inset lands exactly on it) with a black figure in the informer's gable cap and a gold "?" where
 *  his face will be. Pops on `from`; leaves over the 5 frames from `out` (by then the real window covers it). */
export const mystery = ({ f, from, out, x, y, d }: { f: number; from: number; out: number; x: number; y: number; d: number }): React.ReactNode => {
  if (f < from || f >= out + 5) return null;
  const r = d / 2, pic = d - 28, lv = clamp01((f - out + 1) / 5), s = (0.3 + 0.7 * easeOutBack(clamp01((f - from) / 6), 2.2)) * (1 - 0.1 * lv);
  const wob = f - from < 14 ? 5 * Math.sin((f - from) * 1.1) * (1 - (f - from) / 14) : 0, q = 1 + 0.06 * Math.sin((f - from) * 0.35);
  const INK = "#15131d", DARK = "#0e0c15";
  return h("svg", { key: `mystery${from}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
    h("g", { transform: `translate(${x},${y}) rotate(${wob.toFixed(2)}) scale(${s.toFixed(4)})`, opacity: 1 - lv },
      h("circle", { cx: 0, cy: 12, r: r + 7, fill: "rgba(12,10,22,0.34)" }),
      h("circle", { r: r + 4, fill: "#fff3da" }),
      h("circle", { r, fill: "#cb2f29", stroke: INK, strokeWidth: 7 }),
      h("circle", { r: pic / 2 + 3, fill: INK }),
      // the picture: hud's portrait reduced to its outline (viewBox 400, the same shapes), inside the round hole
      h("g", { transform: `translate(${-pic / 2},${-pic / 2}) scale(${pic / 400})` },
        h("g", null,
          h("circle", { cx: 200, cy: 200, r: 200, fill: "#3a3157" }),
          h("circle", { cx: 200, cy: 215, r: 185, fill: "#51457a" }),
          h("circle", { cx: 200, cy: 215, r: 135, fill: "#63568f" }),
          // (no clip path: every shape stays inside the round hole; the shoulders end on its lower arc)
          h("path", { d: "M62,345 C80,318 130,306 200,306 C270,306 320,318 338,345 A200,200 0 0 1 62,345 Z", fill: DARK }),
          h("ellipse", { cx: 200, cy: 212, rx: 112, ry: 106, fill: DARK }),
          h("path", { d: "M126,132 L274,132 L268,92 L132,92 Z", fill: DARK }),
          h("path", { d: "M84,98 L200,22 L316,98 L296,108 L104,108 Z", fill: DARK, stroke: DARK, strokeWidth: 10, strokeLinejoin: "round" }),
          h("text", { x: 200, y: 212 + 150 * 0.355, textAnchor: "middle", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 150, fill: COL.gold, stroke: INK, strokeWidth: 14, strokeLinejoin: "round",
            style: { paintOrder: "stroke fill" } as React.CSSProperties, transform: `translate(200,212) scale(${q.toFixed(3)}) translate(-200,-212)` }, "?")))));
};
