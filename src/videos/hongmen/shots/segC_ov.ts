// Segment C's own 2D overlays (plain functions of the frame that return React nodes, built with h(...): no hooks).
// Name tags, the idiom stamp and the ×1 ×2 ×3 count come from the film's hud/ folder (segC.ts imports them); what is
// left here has no hud equivalent:
//   burst      radial gold dashes where the two blades meet
//   flapLift   the tent-door cloth of segment B's wipe going on UP and off the frame (the way into the banquet)
// Nothing here keeps state; nothing is random.
import type React from "react";
import { COL } from "../../group/kit/overlay";
import { clamp01, h, lerp } from "../story";

const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };

/** radial dashes for 8 frames from `at` (the two blades meet) */
export const burst = (f: number, o: { at: number; x: number; y: number; r?: number; n?: number; color?: string }): React.ReactNode => {
  const { at, x, y, r = 120, n = 10, color = COL.gold } = o, u = (f - at) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), op = 1 - u * u;
  return h("svg", { key: `burst${at}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
    h("g", { opacity: op, strokeLinecap: "round", fill: "none" },
      ...Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
        const d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
        return h("g", { key: i }, h("path", { d, stroke: COL.ink, strokeWidth: 17 }), h("path", { d, stroke: color, strokeWidth: 9 }));
      })));
};

/** THE FLAP WIPE going on: segment B ends with the frame covered by the command tent's door cloth (segB_ov flapWipe,
 *  same colours and hem); here it is rolled UP off the frame. `open` 0 = the whole frame is cloth, 1 = gone. */
export const flapLift = (open: number, col = "#eadfb8"): React.ReactNode => {
  const c = clamp01(open);
  if (c >= 1) return null;
  const y = lerp(2060, -90, c), pts: string[] = [`M0,0 L1080,0 L1080,${y}`];
  for (let i = 4; i >= 0; i--) { const x0 = (i * 1080) / 5, xm = x0 + 108; pts.push(`Q${xm},${y + 70} ${x0},${y}`); }
  return h("svg", { key: "flapLift", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: FULL },
    h("path", { d: pts.join(" ") + " Z", fill: "#3a2f4a", opacity: 0.35, transform: "translate(0,26)" }),
    h("path", { d: pts.join(" ") + " Z", fill: col, stroke: COL.ink, strokeWidth: 9, strokeLinejoin: "round" }),
    ...[0.22, 0.5, 0.78].map((u, i) => h("rect", { key: i, x: 1080 * u - 5, y: 0, width: 10, height: Math.max(0, y - 20), fill: "#c9b98a", opacity: 0.55 })));
};
