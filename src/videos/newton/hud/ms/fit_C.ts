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
import type { MsFit } from "./fit";

export const FIT_C: MsFit = {
  stamp: {
    box: [{ x0: 300, y0: 1000, x1: 920, y1: 1290 }],
    provisional: false,
  },
};
