// hud/ms/fit_A.ts: SCENE A's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene A
// builder (with shots/segA.ts and shots/segA_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene A's items: title (approved, on today's door) and banner (A04).
//   title   not refitted: the v5 one take lands on the approved title framing (her eye square on to the shut door,
//           segA P_DOOR / DOOR_AT, fov 62) on the thud and holds it through the title, so the door has not moved
//   banner  the A rebuild (15 Nov): Humphrey slips out on the latch (BEAT.A.humphreyOut = A03's end) and her pan takes
//           him from his door, so the banner comes in as his face shows in the opening (the latch + 4 frames) and is
//           gone the frame before her snap zoom starts (A05's voice - 6: the snap lands on A05's first sound in 5
//           frames, segA M5): 90 frames, 3 s (director r1 note 6: >= 90). Its slip sits BESIDE his
//           head (bannerplace.ts "beside", the approved place): the A04 hold puts his head at (700, 560) with a clear
//           360 x 270 left of it, inside x 66-930, y 240-1290; the box below lets the slip ride with him while her
//           sidestep lands (f308-343) and holds it still through A04. Track re-probed: bash scripts/newton/ms/track.sh
import type { MsFit } from "./fit";
import { afterStart } from "./fit";
import { BEAT } from "../../beats";

export const FIT_A: MsFit = {
  banner: {
    from: BEAT.A.humphreyOut + 4,
    to: afterStart("A05", 0) - 6,
    slip: { x0: 66, y0: 250, x1: 620, y1: 760 },
    provisional: false,
  },
};
