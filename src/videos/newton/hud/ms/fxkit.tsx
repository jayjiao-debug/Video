// hud/ms/fxkit.tsx: the few helpers skin A's effects share (stage 2b): the film-sized SVG sheet, a slip LAID DOWN, the
// EXIT (the ink sinks into the paper, then the slip goes), clamping a place into an item's box, the frame's anchors.
// Used by hud/ms/fx.tsx, meter.tsx and banner.tsx. Plain functions of their arguments (no hooks, no state, hash01 only).
import React from "react";
import { clamp, clamp01, easeOut } from "../../../../kit/overlay";
import type { Rect } from "../../../../kit/overlay/frame";
import { MOTION } from "./skin";
import { sinkFilter, sinkK } from "./marks";
import type { MsCtx, MsFig, MsPt } from "./screen";

/** the film-sized SVG every piece draws in (1080 x 1920 film px) */
export const Sheet: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <svg id={id} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
);

/** A SLIP LAID DOWN at local frame `at` over MOTION.slap frames (3): it comes down a touch large and settles flat, its
 *  shadow tightening (looks.md A: "the slip is laid down in 3 f"). s = its scale about its centre, o = its opacity */
export const layK = (t: number, at = 0, n: number = MOTION.slap) => {
  const k = clamp01((t - at + 1) / Math.max(1, n));
  if (t < at) return { s: 1, o: 0, k: 0 };
  return { s: 1 + 0.07 * (1 - easeOut(k, 2)), o: clamp01(k * 2), k };
};
/** a transform that scales about (cx, cy) */
export const about = (cx: number, cy: number, s: number, rot = 0) =>
  `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(3)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})`;

/** THE EXIT (the skin's one way of leaving): over the item's last `leave` frames the ink sinks into the paper (marks.tsx
 *  sinkFilter: sepia, then the paper takes it in patches) and the slip itself goes over the second half. ink = the
 *  filter's progress (0 = untouched), paper = the slip's opacity */
export const exitK = (t: number, out: number, leave: number) => {
  const k = sinkK(t, out, Math.max(1, leave));
  return { k, ink: k, paper: 1 - clamp01((k - 0.45) / 0.55) };
};
/** the sink filter of a piece for this frame (put it in the piece's <defs>; wrap the ink in url(#id)) */
export const sinkDef = (id: string, k: number) => sinkFilter(id, Math.min(0.999, k));

/** a point clamped into a box (x0..x1, y0..y1) */
export const clampPt = (p: MsPt, r: Rect): MsPt => ({ x: clamp(p.x, r.x0, r.x1), y: clamp(p.y, r.y0, r.y1) });
/** whether two boxes overlap */
export const hits = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
/** a figure's head as a box (the head circle with its outline) */
export const headBox = (g: MsFig, pad = 8): Rect => ({ x0: g.head.x - g.r - pad, y0: g.head.y - g.r - pad, x1: g.head.x + g.r + pad, y1: g.head.y + g.r + pad });
/** every visible face on the frame, as boxes (the faces checker's skin region, padded) */
export const faceBoxes = (ctx: MsCtx | null | undefined, pad = 10): Rect[] =>
  (ctx?.figs ?? []).filter((g) => g.front).map((g) => ({ x0: g.face.x0 - pad, y0: g.face.y0 - pad, x1: g.face.x1 + pad, y1: g.face.y1 + pad }));
