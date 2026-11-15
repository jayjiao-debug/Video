// hud/ms/fit_B.ts: SCENE B's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene B
// builder (with shots/segB.ts and shots/segB_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene B's items: flick (B01, provisional and held off: heldOff: null releases it once his flicking hand reaches 70 px), card / meter0 (approved: the freeze), tick1 (B09: the meter's slot top right).
// THE v5 REBUILD (15 Nov), refitted to the one take (shots/segB.ts):
//   flick   GATE 5 r2 (note B1), REFITTED, STILL HELD OFF. W1 is now the closer two-thing of v5's fallback (lens 76 -> 54:
//           Newton's head (813, 497) r168, 337 px; Humphrey's (277, 654) r201, its left edge at x 72-79). His left hand
//           comes up off the page to just below his chin (f759-766, to (899, 734)), flicks across his white jabot toward
//           Humphrey and the door on the swish (f767-768, to (711, 727): 188 px, his torso turning with it), holds
//           (f768-773), and is back on the page by f784. The flick reads in a 270 px thumbnail of f766-772 (the dark
//           sleeve across the white shirt), but the hand itself is about 34 px across, under the director's 70 px, so
//           heldOff stays (the editor drops row 3). The boxes follow the new hand: the ring between the two men under
//           Newton's chin (clear of both faces: Newton's head box y <= 666, Humphrey's x <= 483), the label under it,
//           left of the button column and above the subtitle band.
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
    box: [{ x0: 490, y0: 690, x1: 930, y1: 1010 }, { x0: 490, y0: 1010, x1: 930, y1: 1300 }],
    provisional: true,
    heldOff: "B gate 5 r2 (15 Nov): W1 is the closer two-thing (Newton's head 337 px) and the flick travels 188 px across his chest toward the door (f766-768), readable in a 270 px thumbnail, but the hand is about 34 px across (director wants 70+); held off, the editor's fallback drops row 3",
  },
};
