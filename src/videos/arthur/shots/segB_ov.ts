// Segment B's own 2D overlays (1080 x 1920), plain functions of the frame that return React nodes (no hooks, no text):
//   speedLines(f, { from, to, dir, rows })   white streaks that fly past while Arthur runs
//   thoughtSword(f, { at, out, x, y })       a thought bubble with the sword in the stone ("他想起")
// Same look as overlay.tsx: white / gold shapes with a thick ink stroke.
import type React from "react";
import { h, hash, clamp01, easeOutQuad, lerp, smooth } from "../story";

const INK = "#11131b", GOLD = "#ffc53d";

/** Speed lines: dir = the way the RUNNER goes on screen (1 = to the right: the streaks fly to the left). rows = the
 *  bands of the frame (y in px) the streaks may use: keep them off the runner's face and out of the caption band. */
export const speedLines = (f: number, o: { from: number; to: number; dir: 1 | -1; rows: [number, number][]; n?: number }): React.ReactNode => {
  if (f < o.from || f > o.to) return null;
  const a = Math.min(1, (f - o.from + 1) / 2, (o.to - f + 1) / 2), n = o.n ?? 10, out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const row = o.rows[i % o.rows.length], y = lerp(row[0], row[1], hash(i, 3));
    const len = 240 + 420 * hash(i, 5), speed = 170 + 120 * hash(i, 7), span = 1080 + len + 260;
    const s = (hash(i, 9) * span + (f - o.from) * speed) % span, x = o.dir > 0 ? 1080 + 130 - s : s - len - 130;
    const th = 7 + 6 * hash(i, 11);
    out.push(h("g", { key: i },
      h("path", { d: `M${x},${y} L${x + len},${y}`, stroke: INK, strokeWidth: th + 8, strokeLinecap: "round", opacity: 0.5 * a }),
      h("path", { d: `M${x},${y} L${x + len},${y}`, stroke: "#ffffff", strokeWidth: th, strokeLinecap: "round", opacity: 0.92 * a })));
  }
  return h("svg", { key: "speed", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { position: "absolute", left: 0, top: 0, pointerEvents: "none" } }, ...out);
};

/** A thought bubble with the sword standing in the anvil on the stone. x, y = the bubble's centre; tail = which way
 *  the little bubbles run down to the thinker's head (1 = down to the right, -1 = down to the left). */
export const thoughtSword = (f: number, o: { at: number; out?: number; x: number; y: number; scale?: number; tail?: 1 | -1 }): React.ReactNode => {
  if (f < o.at) return null;
  const leave = o.out === undefined ? 0 : clamp01((f - o.out) / 5);
  if (leave >= 1) return null;
  const x = (f - o.at) / 6, k = (x >= 1 ? 1 : x < 0.6 ? 1.14 * easeOutQuad(x / 0.6) : lerp(1.14, 1, smooth((x - 0.6) / 0.4))) * (1 - leave) * (o.scale ?? 1);
  const tl = o.tail ?? -1;
  // the cloud: circles drawn twice (all the ink first, then all the white), so they merge into one outline
  const C: [number, number, number][] = [[-70, 10, 78], [0, -34, 92], [78, 4, 80], [-22, 48, 80], [52, 52, 74], [-104, -24, 50], [112, -40, 46]];
  const T: [number, number, number][] = [[tl * 118, 142, 26], [tl * 158, 190, 16]];
  const kt = (i: number) => clamp01((f - o.at - 1 - i * 2) / 3);
  const glint = 0.5 + 0.5 * Math.sin((f - o.at) * 0.9);
  return h("div", { key: "think", style: { position: "absolute", left: o.x, top: o.y, width: 0, height: 0, transform: `scale(${k})`, opacity: 1 - leave, pointerEvents: "none" } },
    h("svg", { width: 520, height: 520, viewBox: "-260 -230 520 520", style: { position: "absolute", left: -260, top: -230, overflow: "visible" } },
      ...T.map(([cx, cy, r], i) => h("circle", { key: "t" + i, cx, cy, r: r * kt(1 - i), fill: "#ffffff", stroke: INK, strokeWidth: 9 })),
      ...C.map(([cx, cy, r], i) => h("circle", { key: "a" + i, cx, cy, r: r + 9, fill: INK })),
      ...C.map(([cx, cy, r], i) => h("circle", { key: "b" + i, cx, cy, r, fill: "#ffffff" })),
      // the stone, the anvil and the sword
      h("g", { key: "s", stroke: INK, strokeWidth: 7, strokeLinejoin: "round", strokeLinecap: "round" },
        h("rect", { x: -88, y: 44, width: 176, height: 58, rx: 12, fill: "#b9c1cf" }),
        h("path", { d: "M-46,44 L-38,22 L-52,12 L-52,2 L50,2 L50,12 L36,22 L44,44 Z", fill: "#6c7482" }),
        h("path", { d: "M-9,-70 L9,-70 L9,2 L-9,2 Z", fill: "#eef2f7" }),
        h("rect", { x: -34, y: -84, width: 68, height: 15, rx: 6, fill: GOLD }),
        h("rect", { x: -8, y: -116, width: 16, height: 33, fill: "#6b4a2c" }),
        h("circle", { cx: 0, cy: -124, r: 12, fill: GOLD })),
      // a glint on the pommel
      h("g", { key: "g", stroke: GOLD, strokeWidth: 8, strokeLinecap: "round", opacity: 0.4 + 0.6 * glint },
        h("path", { d: "M52,-126 L72,-134" }), h("path", { d: "M44,-146 L56,-164" }), h("path", { d: "M56,-104 L76,-100" }))));
};
