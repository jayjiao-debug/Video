// Segment E's own 2D overlay: <Rays>, the film's Burst (overlay.tsx) limited to a fan of directions, so that a hit on
// top of a head throws its dashes up and outward and none across the face. Same look: gold dashes with an ink edge,
// 8 frames, a pure function of the frame. No JSX (a .ts file): built with createElement.
//   h(Rays, { at, x, y, r?, n?, from?, to?, color?, frame })   from / to = the fan in degrees (0 = screen right, -90 = up)
import { createElement as h, type FC } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COL } from "../../group/kit/overlay";

export type RaysProps = { at: number; x: number; y: number; r?: number; n?: number; from?: number; to?: number; color?: string; frame?: number };
export const Rays: FC<RaysProps> = ({ at, x, y, r = 160, n = 9, from = -165, to = -15, color = COL.gold, frame }) => {
  const cur = useCurrentFrame(), f = frame ?? cur;
  const u = (f - at) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.5 + 0.5 * (1 - Math.pow(1 - u, 2))), len = r * 0.4 * (1 - u), o = 1 - u * u;
  const kids = Array.from({ length: n }, (_, i) => {
    const a = ((from + ((to - from) * i) / Math.max(1, n - 1)) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
    return h("g", { key: i }, h("path", { d, stroke: COL.ink, strokeWidth: 17 }), h("path", { d, stroke: color, strokeWidth: 9 }));
  });
  return h(AbsoluteFill, { style: { pointerEvents: "none" } },
    h("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { position: "absolute", left: 0, top: 0, overflow: "visible" } },
      h("g", { opacity: o, strokeLinecap: "round", fill: "none" }, ...kids)));
};
