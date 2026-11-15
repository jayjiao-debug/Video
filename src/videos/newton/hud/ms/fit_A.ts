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
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// The scene A refit on 9:16 (15 Nov): the slip box stays as it is (the title too: the door has not moved). Pulled to
// x 110, the slip's box can reach no further left than x 505, and on f314-321 (her sidestep, his corner round the leaf)
// his cheek swung to x 484-513 (faces: med, f315-320). The slip cannot clear him by moving up either (its top is held at
// y 340, so its bottom stays below y 639, on his cheek line), and from / to stay on the approved f308-397 and the
// slip's sound on f310; so the follow leads him right by up to 40 px over f306-326 instead (segA FOL_LEAD), and his
// cheek keeps 18 px or more clear of the slip's box on every frame. track.ts re-probed. The manicule's envelope over the
// hold is now x 345-646, y 635-911 (inside the rules); y1 820 never binds (the slip's bottom reaches y 757 at most).
import type { MsFit } from "./fit";
import { afterStart } from "./fit";
import { BEAT } from "../../beats";

export const FIT_A: MsFit = {
  banner: {
    from: BEAT.A.humphreyOut + 4,
    to: afterStart("A05", 0) - 6,
    slip: { x0: 110, y0: 340, x1: 620, y1: 820 },   // 9:15 { 66, 250, 620, 760 } + 60, from x 110 / y 340
    provisional: false,
  },
};
