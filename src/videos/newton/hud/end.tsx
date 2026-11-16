// hud/end.tsx: THE FILM'S BLACK (PLAN.md section 5 "End"; WP4). Pure functions of the frame.
// Black here is always the film's DARKEST WARM TONE (HC.black #140d09), never #000, and it never flashes: it fades
// in (and out) over FADE >= 3 frames.
//   endBlackAlpha(f, from, fade?)   0 before `from`, rising to 1 over `fade` frames (default 8), then 1 (the end: his
//                                    window goes dark, then black)
//   dipAlpha(f, a, b, fade?)         a dip to black over [a, b] (in over `fade` frames from a, out over `fade` to b)
//   <EndBlack f from fade? />        the end black as a node;  endBlack(f, from, fade?)  the same for a .ts segment
//                                    (no JSX): put it in Pose.top so it covers the subtitle too, or Pose.overlays
//   <Black a />  / black(a)          a full-frame warm black at alpha a (anything you computed yourself)
import React from "react";
import { AbsoluteFill } from "remotion";
import { HC } from "./style";

/** the shortest fade a black may have (frames) */
export const FADE_MIN = 3;
const fadeOf = (n?: number) => Math.max(FADE_MIN, Math.round(n ?? 8));

/** the end black's alpha on frame f: 0 before `from`, 1 after `from + fade - 1`, linear (smoothstep) in between */
export const endBlackAlpha = (f: number, from: number, fade?: number): number => {
  const n = fadeOf(fade), u = Math.min(1, Math.max(0, (f - from + 1) / n));
  return u * u * (3 - 2 * u);
};
/** a dip to black over [a, b]: in over `fade` frames from a, out over `fade` frames to b */
export const dipAlpha = (f: number, a: number, b: number, fade?: number): number => {
  if (f < a || f > b) return 0;
  const n = fadeOf(fade), u = Math.min(1, (f - a + 1) / n, (b - f + 1) / n);
  return u * u * (3 - 2 * u);
};

/** a full-frame warm black at alpha a */
export const Black: React.FC<{ a: number }> = ({ a }) =>
  a <= 0 ? null : <AbsoluteFill style={{ pointerEvents: "none", background: HC.black, opacity: Math.min(1, a) }} />;
/** the same as a plain call (for .ts segments) */
export const black = (a: number): React.ReactNode => React.createElement(Black, { a });
/** the end black from frame `from` (fade >= 3 frames, default 8) */
export const EndBlack: React.FC<{ f: number; from: number; fade?: number }> = ({ f, from, fade }) => <Black a={endBlackAlpha(f, from, fade)} />;
/** the same as a plain call (for .ts segments) */
export const endBlack = (f: number, from: number, fade?: number): React.ReactNode => React.createElement(Black, { a: endBlackAlpha(f, from, fade) });
