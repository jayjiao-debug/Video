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
import type { MsFit } from "./fit";

export const FIT_D: MsFit = {
  tick2: {
    box: [{ x0: 752, y0: 146, x1: 1026, y1: 350 }],
    provisional: false,
  },
};
