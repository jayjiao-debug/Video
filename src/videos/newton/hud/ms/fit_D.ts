// hud/ms/fit_D.ts: SCENE D's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene D
// builder (with shots/segD.ts and shots/segD_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene D's items: tick2 (D05: the meter's slot and the note 我笑的不算 under it).
// THE v5 REBUILD (15 Nov), refitted to the one take (shots/segD.ts):
//   tick2   REFITTED, box unchanged (the slot x 752-1026, y 146-350: the slip y 154-292, the note 我笑的不算 on its slip
//           about y 296-344). The pull back M5 lands on the MEDIUM on tick2's first frame (D05.to + 1 = BEAT tick2 - 2:
//           f2419) and the hall holds there to the scene's end, so the whole tick (f2419-2448) is one framing: his
//           head (faces checker) x 256-693, top y 339-349 (y 282 at the top of clap 1's jolt, f2437), its right edge
//           at x 693 or less on every frame; the wig's right locks hang to about x 755 but only below y 480, and the
//           top-right roll of the wig ends about (690, 420): nothing of him in x 740-1026, y 146-416 (the director's
//           keep-clear for the wig). His lecture hand (f2421-2436) is up on the LEFT of his head (about x 190), the
//           far side from the slot. The piece does not jolt with clap 1 (a screen element; when.ts says so).
//           Frames unchanged (D05.to + 1 .. D05.to + 30): out 12 frames before clap 2.
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// THE D SCENE PASS ON 9:16 (15 Nov): the slot is fixed by the frame (skin.ts METER), and on the picture it now sits
// 56 px further left and 134 px lower than in 9:15, so on the approved medium the wig's right side came within 19-28 px
// of the box on the hold and 2 px at the top of clap 1's jolt (f2437; in 9:15 it was 83-107 px clear). segD.ts HOLD
// (M5's landing, the medium for tick 2, the claps and "Don't.") takes his eyes 8 px left and 8 px lower: nothing of him
// (wig, locks, quill, ink line included) comes within 28 px of the box on f2419-2435 and 12 px at f2437 (the box's empty
// bottom-left corner; the slip and the note themselves are 35 px and more away). Box and frames unchanged.
import type { MsFit } from "./fit";

export const FIT_D: MsFit = {
  tick2: {
    box: [{ x0: 696, y0: 340, x1: 970, y1: 544 }],   // 9:16: the meter's slot under the REC display (skin.ts METER) and the note
    provisional: false,
  },
};
