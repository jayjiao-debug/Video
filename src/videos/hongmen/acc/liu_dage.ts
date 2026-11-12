// LIU BANG FOR THE PRIVY SHOT (the film's first and last picture): the same man twice.
//   LIU_PRIVY  = LIU_BANG exactly as people.ts builds him, plus the raised forefinger of his right hand (kit/rigacc
//                finger: the "shh" pose stands it across the lips).
//   LIU_DAGE   = the same Liu Bang with ONE thing taken from the account's cameo figure 大哥 (kit/rigacc/dage.ts): the
//                head's SHAPE, a block wider at the jaw than at the crown with a CUT jaw (Look.head, Look.head.jaw:
//                from the jaw's corners straight in to the chin). Nothing else of 大哥: no stubble, no grey, not his
//                hair. Liu Bang keeps his own skin, hair, topknot with the little red cap and the gold pin, his pencil
//                moustache and chin tuft, the red robe and the gold sash. The cheek (dimple) lines, the narrowed eyes,
//                the cocked brow and the smirk come from the EXPRESSION "hush", which draws them on any face; the
//                movement is the kit's rigJawline (the fingertip runs along the head's outline, so it follows the cut).
//                The cut is a little shallower than 大哥's own (LIU_JAW, and why, below).
// A Look's head shape is fixed when a figure is built (it shapes the head mesh, the hair and what sits on it), so the
// change from one to the other is a swap of two figures on one frame, not a morph: sets/privy.ts privyOpening().
// Same seed, skin and width in both: the body, the robe and the arms are identical, only the head differs.
// BOTH SIT ON THE COMMODE for as long as they exist: their robe is Liu Bang's own robe made for that seat (acc/garb.ts
// onSeat with sets/privy.ts PRIVY.seat.B), so the cloth lies over the thighs, hangs from the knees and leaves the
// commode in view under him. A shot does nothing for it. (The banquet's Liu Bang is people.ts LIU_BANG, another
// figure: his robe knows no seat and rests on the floor round him, as before.)
import { finger } from "../../group/kit/rigacc/finger";
import { DAGE } from "../../group/kit/rigacc/dage";
import type { Acc } from "../../group/kit/rig3d";
import { LIU_BANG, type Person } from "../people";
import { PRIVY, PRIVY_FACING } from "../sets/privy";
import { onSeat } from "./garb";

/** which hand does the gesture: 0 = his right (screen left from in front). The camera must be in front of him or on
 *  that side (the wide jaw: the far arm cannot come round it; kit/rigacc/dage.ts) */
export const LIU_HAND = 0 as const;

/** Liu Bang's own accessories, the robe made for the commode's seat (film variant B), and the finger for the gesture's
 *  hand */
const privyAcc = (): Acc[] => [...LIU_BANG.acc().map((a) => (a.name === "robe" ? onSeat(a, PRIVY.seat.B, PRIVY_FACING) : a)), finger({ hand: LIU_HAND })];
/** Liu Bang as in the rest of the film, seated on the commode, with the finger for the gesture's hand */
export const LIU_PRIVY: Person = { name: "liuPrivy", scale: 1, look: LIU_BANG.look, acc: privyAcc };
/** The cut of the block head's jaw on Liu Bang, Look.head.jaw = [a, c]: the jaw's corner lies a of the half height
 *  below the middle of the head, the chin is c of the head's width. 大哥's own is DAGE.head.jaw = [0.4, 0.42].
 *  With that cut Liu Bang's black chin tuft does not reach his chin: it blurs out 2.5 cm (25 px at 1080 x 1920) above
 *  the chin's edge, over a pale violet band. The cause is in the kit (rig3d FRAG "face": the drawn face is masked by
 *  smoothstep(0, 0.2, dot(n, uFF)) with n = the BALL's normal; the cut pulls the points of the head's underside,
 *  whose ball normals point down, up onto the visible chin, so every drawing fades there and the skin takes the
 *  underside's shade; 大哥's see-through stubble hides it, a solid beard does not). Until the kit masks by the cut
 *  head's own shape, the cut here is the deepest one that keeps the tuft whole down to the chin's line (tried at
 *  1080 x 1920, frame 51: [0.4, 0.42] 25 px of blur, [0.4, 0.5] 8 px, [0.45, 0.56] none, [0.5, 0.62] none). The jaw
 *  still reads as cut: square corners, a straight edge in to a broad chin. To take 大哥's cut again: LIU_JAW = DAGE.head!.jaw. */
export const LIU_JAW: [number, number] = [0.45, 0.56];
/** Liu Bang with the chiselled block head (大哥's Look.head with LIU_JAW, nothing else of him) */
export const LIU_DAGE: Person = {
  name: "liuDage", scale: 1, look: { ...LIU_BANG.look, head: { ...DAGE.head, jaw: LIU_JAW } },
  acc: privyAcc,
};
