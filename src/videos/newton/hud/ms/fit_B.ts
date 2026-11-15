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
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// SCENE B ON 9:16 (15 Nov, the scene pass):
//   flick   still held off; the label's box now ends at y 1320, 5 px over B01's subtitle block (Chinese + English rows
//           from y 1325 on the 9:16 frame: the captions sit 90 px higher on the picture than in 9:15), so the label
//           stays above the subtitle if it is ever released (B01 shows to f778, the flick runs f768-797).
//   card    I2 is 7 % looser with his eyes 22 px right (segB.ts I2), so the whole lifted sticker stays inside what the
//           phone shows (x >= 58): on the held frame his head is x 146-561, y 311-726 (eyes y 612), both hands above
//           the slip's top (y 996); the lifted sticker's footprint x 61-680, y 252-989 (matte 98-662), the seal box still
//           10 px clear, the name 艾 28 px clear (was 0), every written word clear (faces check).
//   meter0  unchanged (the slot x 696-970, y 340-494): his head stays left of x 561 on the I2 hold.
//   tick1   unchanged in time and box; segB.ts C2 now lands his head ball at (559, 701) r 223, 25 px off the slot's
//           corner from f1475 to the tick's end (f1497). On f1469-1473 (the slip arriving while the lens eases back out
//           of the whisper's extreme close) the slip passes over the top of his wig, never his face.
import type { MsFit } from "./fit";

export const FIT_B: MsFit = {
  flick: {
    box: [{ x0: 490, y0: 750, x1: 890, y1: 1070 }, { x0: 490, y0: 1070, x1: 890, y1: 1320 }],   // 9:15 + 60, left of x 890; the label above B01's subtitle (1325)
    provisional: true,
    heldOff: "B gate 5 r2 (15 Nov): W1 is the closer two-thing (Newton's head 337 px) and the flick travels 188 px across his chest toward the door (f766-768), readable in a 270 px thumbnail, but the hand is about 34 px across (director wants 70+); held off, the editor's fallback drops row 3",
  },
};
