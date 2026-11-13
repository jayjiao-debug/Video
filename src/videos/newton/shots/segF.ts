// SEGMENT F (STUB, WP1 + integration check), lines F01-F16, 夜: the blue garden, then the elaboratory's firelight
// (PLAN 7 F). The stand-in staging until WP5 writes the shot: the place of every frame (beats.ts placeAt: the garden at
// night with the outbuilding glowing, the elaboratory from BEAT.F.inside), the fire roaring until BEAT.F.timePass and
// deep red after it (the set candle shorter); NEWTON (no quill, no nest) on his mark, HUMPHREY_SOOT on his until he goes
// for charcoal (BEAT.F.sackOut); the stool by the fire door; her mic toward him, out of the card slot under card 3.
import { SEGMENTS, type Segment } from "../story";
import { BEAT, placeAt } from "../beats";
import { ELAB } from "../layout";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT } from "../people";
import { standIn } from "./common";

const S = SEGMENTS[5];
export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => {
    const later = f >= BEAT.F.timePass, garden = placeAt(f) === "garden";
    const params: Record<string, number | string> = garden ? { time: "night", glow: 1 } : { fire: later ? 0.35 : 1, candle: later ? 0.45 : 1 };
    return standIn(w, f, {
      params, humphrey: f < BEAT.F.sackOut + 15, humphreyAs: HUMPHREY_SOOT, newtonAs: NEWTON, newton: { hide: NEWTON_HIDE },
      extra: garden ? undefined : (w) => { w.prop("stool").put(ELAB.stool, { rot: ELAB.stoolFacing }); },
      mic: true, slate: `F stand-in (${placeAt(f)}${later ? ", later" : ""})`,
    });
  },
};
