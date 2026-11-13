// SEGMENT E (STUB, WP1 + integration check), lines E01-E07, 傍晚 in his room, gold light: the fly, two bites, Hooke
// (PLAN 7 E). The stand-in staging until WP5 writes the shot: the room at hour "evening", NEWTON (the ink gone since
// D's wipe; no quill, no nest) behind the desk; the cold plate with the fly walking on it, two bites gone from
// BEAT.E.twoBites (dressRoom); her mic toward him, round to the lens on aside 35. Mouths only inside their own lines.
import { SEGMENTS, FPS, type Segment } from "../story";
import { BEAT } from "../beats";
import { NEWTON, NEWTON_HIDE } from "../people";
import { standIn, dressRoom } from "./common";

const S = SEGMENTS[4];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => standIn(w, f, {
    params: { hour: "evening" }, humphrey: false, newtonAs: NEWTON, newton: { hide: NEWTON_HIDE },
    extra: (w) => dressRoom(w, f, { lid: 0, bites: f >= BEAT.E.twoBites ? 2 : 0, fly: f <= BEAT.E.fly[1] ? ((f - S.from) / FPS / 6) % 1 : undefined }),
    mic: true, slate: "E stand-in (evening)",
  }),
};
