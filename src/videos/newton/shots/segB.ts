// SEGMENT B (STUB, WP1 + integration check), lines B01-B09, 上午 in his room, morning light (PLAN 7 B). The stand-in
// staging until WP5 writes the shot: the room at hour "morning" (ROOM_CAMS.desk), NEWTON_INK (no quill, no nest) behind
// the paper-buried desk, HUMPHREY at the window table until he goes (BEAT.B.humphreyGoes); the plate covered, then the
// lid off and steaming from BEAT.B.lid; the drafts, inkwell, sheets and the chair (dressRoom); her mic toward whoever
// speaks, round to the lens on aside 15, out of the card slot under card 2. Mouths only inside their own lines.
import { SEGMENTS, type Segment } from "../story";
import { BEAT } from "../beats";
import { NEWTON_INK, NEWTON_HIDE } from "../people";
import { standIn, dressRoom } from "./common";

const S = SEGMENTS[1];
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => standIn(w, f, {
    params: { hour: "morning" }, humphrey: f < BEAT.B.humphreyGoes + 15, newtonAs: NEWTON_INK, newton: { hide: NEWTON_HIDE, expr: "focus" },
    extra: (w) => dressRoom(w, f, f < BEAT.B.lid ? { lid: 1 } : { lid: 0, steam: 1 }), mic: true, slate: "B stand-in (morning)",
  }),
};
