// freeze.ts: THE FREEZE of the lead card (skin A 「手稿」, stage 1; EFFECTS_PLAN row 4, gap G2). Picture side: it
// decides which frame the WORLD is posed at, so it lives outside hud/ (kit.json domOnly: hud/ never touches the
// picture; hud/ms/when.ts imports this file, never the other way round). The kit's freeze clock, the HOLD way
// (src/kit/overlay/freeze.ts): the voice track carries the gap, every shot is keyed to the film clock, so on the card's
// frames the picture shows B03's last frame and after them the film's own frame again (nothing is shifted, TOTAL and
// SEGMENTS are the voice track's).
//   FREEZE            { at: line("B03").to, frames: 75 }: the picture stops ON B03's last frame and holds 75 more
//                     (the voice track's and the mix's G2: B04 starts on B03.to + 78, cues.json stops the room tone and
//                     the quill for B03.to + 1 .. B03.to + 75; Jay 20:15: a freeze of about 2.5 s)
//   FREEZE_ON         the freeze is on: G2 is in the voice track (line("B04").preFrom - line("B03").to >= 40), or a still
//                     forces the card (input prop fx.force has "card" or is "all": Film.tsx header)
//   msHold(f)         the frame the picture (the world, its camera, the vlog HUD) shows on film frame f
//   msFreezeAt(f)     where f is in the freeze ({ t: 0 on B03's last frame, the card's frames t 1..75 }), or null
//   msFrozen(f)       true on the card's 75 frames (the picture held; Film.tsx hides the subtitle and the bubble)
//   washAt(f)         the sepia wash of the held frame (wash.ts msWash): { k, sweep } on the card's frames, else null
//   THE CUT-OUT (the owner, 14 Nov: "we still gonna be doing isolating him when his introcard comes up right?"): on the
//   card's frames Newton stays in full colour with a line of the skin's paper round him, lifted off the frozen page like
//   a sticker (the kit's IsolatePass, src/kit/fx/isolate.ts; Film.tsx sets it every frame from cutout.ts cutState, which
//   reads these):
//   CUT               the cut-out's life in the card's local frames: in over CUT.in with the card's build (t 0-5), out
//                     over CUT.leave from CUT.out with the card's exit (t 67-74: gone on t 74, the frame before the
//                     picture runs again, so he never jumps)
//   LIFT              the lift at full strength: s (scale), rot (deg, + = clockwise), y (film px, - = up), about the pivot
//   cutAt(f)          { k, t } on the card's frames while the cut-out shows (k 0..1), else null
//   cutPivot(h, hs)   the lift's pivot from his head and hands on screen (the held frame): x = the head's, y = the lower
//                     hand's (his hands rest on the desk: the lift grows him up and away from the card's slip below)
//   cutLift(f, pivot) the kit's Lift on frame f (from s 1, rot 0, y 0, eased with k), or undefined off the cut-out
//   liftPt(p, lift)   where a point of the held frame lands once lifted (the kit's liftBox, one point): the card puts
//                     its construction, its cut-away and its seal round the LIFTED figure with it
import { line } from "./story";
import { IP } from "../../kit/film/env";
import { clock, type FreezeAt } from "../../kit/overlay/freeze";
import { smooth } from "../../kit/overlay/time";
import { liftBox, type Lift } from "../../kit/fx/isolate";

const B03 = line("B03"), B04 = line("B04");
/** the lead card's length in frames (2.5 s at 30 fps: the voice track and the mix hold 75 frames, cues.json stops the
 *  room tone and the quill for exactly these; the picture runs again on B03.to + 76, two frames before B04) */
export const CARD_LEN = 75;
/** the picture stops ON B03's last frame (her walk has landed on 写) and holds CARD_LEN more frames: the card's */
export const FREEZE = { at: B03.to, frames: CARD_LEN } as const;
/** G2 is in the voice track: B04's silent beat starts after the card's last frame (the voice job puts the 2.5 s after
 *  B03, as B03's after-hold: if it went into B04's pre instead, preFrom would not move and this stays false) */
export const G2_READY = B04.preFrom - B03.to >= CARD_LEN + 1;
/** a still forces the card (input prop fx.force: ["card", ...] or "all"; hud/ms/when.ts MS_FX reads the rest) */
const FORCED = (() => {
  const o = (IP.fx ?? {}) as { force?: unknown };
  return o.force === "all" || (Array.isArray(o.force) && o.force.includes("card"));
})();
/** the freeze is on (the card draws): G2 is in, or a still forces the card */
export const FREEZE_ON = G2_READY || FORCED;
/** THE FREEZE CLOCK (kit overlay/freeze.ts, HOLD): empty while the card is off */
export const MS_CLOCK = clock(FREEZE_ON ? [FREEZE] : []);
/** the frame the picture (the world, its camera, the vlog HUD) shows on film frame f */
export const msHold = (fr: number) => MS_CLOCK.hold(fr);
/** where f is in the freeze (t = 0 on B03's last frame, the live one; the card's frames are t 1..75), or null */
export const msFreezeAt = (fr: number): FreezeAt | null => MS_CLOCK.at(fr);
/** true on the card's frames: the picture is held, the subtitle and the whisper are hidden */
export const msFrozen = (fr: number): boolean => { const z = MS_CLOCK.at(fr); return !!z && z.t >= 1; };

/** the wash's beats in the card's local frames (t = 0 on the card's first frame = FREEZE.at + 1): the page-turn front
 *  sweeps the colour out over WIPE.len frames from WIPE.at; the ink drains back into colour from DRAIN to the end
 *  (hud/ms/when.ts copies them into the card's beats: wipe, drain). On the 75-frame card: the wipe t 0-5, the drain
 *  t 71-74 (the colour is back on the card's last frame, as its target line lands in the meter's slot) */
export const WIPE = { at: 0, len: 6 } as const, DRAIN = 71;
/** THE WASH of the frozen frame (wash.ts): k = how much of the set is washed to sepia paper (0..1), sweep = where the
 *  page-turn front is (0 = nothing washed yet, 1 = the whole frame; the front runs from the top right to the bottom
 *  left). Newton (every figure) stays in colour. Null when nothing is washed. */
export const washAt = (fr: number): { k: number; sweep: number } | null => {
  if (!msFrozen(fr)) return null;
  const t = fr - (FREEZE.at + 1);
  const sweep = smooth((t - WIPE.at + 1) / WIPE.len);
  const k = 1 - smooth((t - DRAIN + 1) / (CARD_LEN - DRAIN));
  return k > 0 && sweep > 0 ? { k, sweep } : null;
};

// ---------------------------------------------------------------------------------------------------- the cut-out
/** THE CUT-OUT's life in the card's local frames (t 0 on the card's first frame): in over `in` frames with the card's
 *  build, out over `leave` frames from `out` with the card's exit (hud/ms/when.ts card beats in / out / leave are these
 *  numbers; check.ts checks they agree): k is 0 again on t 74, the card's last frame, so the live picture on f991 meets
 *  him where he stood */
export const CUT = { in: 6, out: CARD_LEN - 8, leave: 8 } as const;
/** the lift at full strength (the kit's Lift without its pivot): 3 % bigger, turned 1.5 deg anticlockwise, 20 px up */
export const LIFT = { s: 1.03, rot: -1.5, y: -20 } as const;
/** the cut-out on film frame f: k (0..1: the line, the drop, the lift) and the card's local frame t, or null */
export const cutAt = (fr: number): { k: number; t: number } | null => {
  if (!msFrozen(fr)) return null;
  const t = fr - (FREEZE.at + 1);
  const k = smooth((t + 1) / CUT.in) * (1 - smooth((t - CUT.out + 1) / CUT.leave));
  return k > 0 ? { k, t } : null;
};
type Pt = { x: number; y: number };
/** the lift's pivot: his head's x, the lower hand's y (film px, on the held frame) */
export const cutPivot = (head: Pt, hands: Pt[]): Pt => ({ x: head.x, y: Math.max(head.y, ...hands.map((h) => h.y)) });
/** the kit's Lift on frame f about `pivot`, eased with the cut-out's k (s 1, rot 0, y 0 at k 0); undefined off it */
export const cutLift = (fr: number, pivot: Pt): Lift | undefined => {
  const c = cutAt(fr);
  if (!c) return undefined;
  const e = c.k * c.k * (3 - 2 * c.k);
  return { s: 1 + (LIFT.s - 1) * e, rot: LIFT.rot * e, y: LIFT.y * e, cx: pivot.x, cy: pivot.y };
};
/** where a point of the held frame lands once lifted (the kit's liftBox, on a box of one point) */
export const liftPt = (p: Pt, l: Lift | undefined): Pt => {
  const b = liftBox({ x0: p.x, y0: p.y, x1: p.x, y1: p.y }, l);
  return { x: b.x0, y: b.y0 };
};
