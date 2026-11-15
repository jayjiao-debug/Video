// hud/ms/fit_B.ts: SCENE B's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene B
// builder (with shots/segB.ts and shots/segB_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene B's items: flick (B01, provisional and held off: heldOff: null releases it once his flicking hand stays in frame), card / meter0 (approved: the freeze), tick1 (B09: the meter's slot top right).
// THE v5 REBUILD (15 Nov), refitted to the one take (shots/segB.ts):
//   flick   REFITTED, STILL HELD OFF. The take holds the two-thing W1 (Humphrey left, Newton right behind his desk,
//           2.9 m from her lens) from "dinner" to his first step (f749-786): his left hand comes up off the page and
//           out to his left (about 1 m up, against the panel), flicks on the swish (f768) and stays put, steady, at about
//           (892, 922) from f774 until her head starts after Humphrey (f786); it leaves the picture's right edge about f791
//           (B02 starts f799). It is in frame, steady and clear of both faces (Newton's head (737, 800) r110; Humphrey's (220, 913) r135), but
//           only about 20 px across (his head is 220 px), far under the director's 70 px, and a two-thing in depth
//           cannot hold it bigger. So heldOff stays (the editor's fallback: drop row 3). The boxes follow the hand:
//           the ring in the free desk front under his face and left of the button column (fx.tsx puts the ring
//           up-left of a hand right of x 820: clamped here to centre about (740, 1040), its leader to the hand), the
//           label under it, both clear of the faces and above the subtitle band.
//   card    approved, unchanged: B03's last frame (FREEZE.at, f915) holds his head at (330, 455) r240 (x 91-570)
//           with both hands at y 922-927 (above the slip's top, y 936). The lifted cut-out (matte 58..662, footprint
//           19..680 with the paper margin) stays left of the seal box x 690-926 (10 px; his right wig locks are its
//           right edge) and clear of every written word (faces check: the card's words clear).
//   meter0  approved, unchanged (the slot; f991 is the same picture as f915).
//   tick1   unchanged (the slot x 752-1026, y 146-300): the extreme close holds his head centre at about (515, 717)
//           r443 on tick1's first frame, and the ease back (landing on card 2's ding) carries it down-left of the slot
//           and then under it at C2 (652, 544) r238; his head's edge stays below y 300 across x 752-1026 for the whole
//           tick (f1469-1497).
import type { MsFit } from "./fit";

export const FIT_B: MsFit = {
  flick: {
    box: [{ x0: 560, y0: 920, x1: 930, y1: 1300 }, { x0: 400, y0: 1140, x1: 930, y1: 1300 }],
    provisional: true,
    heldOff: "B rebuild (v5, 15 Nov): his flicking hand stays in frame, steady and clear of both faces (f774-786 at about (892, 922)), but it is about 20 px across in the two-thing (director wants 70+); held off, the editor's fallback drops row 3",
  },
};
