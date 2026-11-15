// hud/ms/fit_C.ts: SCENE C's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene C
// builder (with shots/segC.ts and shots/segC_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene C's items: stamp (C07).
//   stamp   the C rebuild (15 Nov, the one take): his calves shove the chair on the skid (BEAT.C.skid = C07 end + 0.1 s,
//           the stamp's `from` as when.ts has it), it skids back along the corridor into her lens and knocks her shins
//           on BEAT.C.jolt (C07 end + 0.65 s: the stamp's absBeats jolt, kept on its sound), bounces off toward the
//           desk side and stands askew at her feet, dead still from the jolt + 6 to the scene's end (clock join 5).
//           拒收 rides the chair's seat (fx.tsx stampAnchor) inside this box: the floor where the chair comes to rest,
//           its back across the middle of the frame (rail x ~290-800, y ~1020; seat about (533, 1240)), below his gown
//           and clear of his face (head about (390, 400) r 190 after the jolt), the plate (upper right) and the
//           subtitle band (C07's rows end at 2010, 1330-1490 is below the box's 1290). While the chair rushes out of
//           the bottom of the frame (2012-2016) the anchor holds at the box's floor (y 1178). from / to unchanged.
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// THE C SCENE PASS ON 9:16 (15 Nov): y1 1350 -> 1320. C07's subtitle 没空。/ No time. (shown to f2010, a Chinese row and
// an English row: block top 1325) is on screen for the stamp's first 10 frames (from f2001), so the box ends 5 px above
// it (skin check: 0 findings). fx.tsx keeps the piece, its jolt included, inside the box: the anchor may sit at y
// 1200-1208 (it was 1200-1238 on the +60 box) and x 496-730 (x1 890: was 760 in 9:15). On the final hold the seat is at
// (551, 1300) and 拒收's anchor at (551, 1208): on the chair's back, 30 px higher on the seat than approved; during
// the skid (seat x 599-692) the anchor x follows the seat as before.
import type { MsFit } from "./fit";

export const FIT_C: MsFit = {
  stamp: {
    box: [{ x0: 300, y0: 1060, x1: 890, y1: 1320 }],   // 9:15 { 300, 1000, 920, 1290 } + 60, left of x 890, over C07's subtitle
    provisional: false,
  },
};
