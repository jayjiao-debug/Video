// SEGMENT C (STUB, WP1 + integration check), lines C01-C07, 中午: the noon plate in the room, the garden walk, the whip
// upstairs, the chair (PLAN 7 C). The stand-in staging until WP5 writes the shot: the place of every frame (beats.ts
// placeAt: room, garden from BEAT.C.garden, room again from BEAT.C.whip), the room at hour "noon" (the plate lid off, no
// steam), the garden at noon; NEWTON_INK in the room, NEWTON_GOWN_INK (the gown, outdoors) in the garden, no quill, no
// nest; her mic toward him. The chair drag (C06: cam.ts chairDrag, ROOM_CAMS.chair) is WP5's: the chair stands behind him.
import { SEGMENTS, type Segment } from "../story";
import { placeAt } from "../beats";
import { NEWTON_INK, NEWTON_GOWN_INK, NEWTON_HIDE } from "../people";
import { standIn, dressRoom } from "./common";

const S = SEGMENTS[2];
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => {
    const room = placeAt(f) === "room";
    return standIn(w, f, {
      params: room ? { hour: "noon" } : { time: "noon" }, humphrey: false, newtonAs: room ? NEWTON_INK : NEWTON_GOWN_INK, newton: { hide: NEWTON_HIDE },
      extra: room ? (w) => dressRoom(w, f, { lid: 0 }) : undefined, mic: true, slate: `C stand-in (${placeAt(f)})`,
    });
  },
};
