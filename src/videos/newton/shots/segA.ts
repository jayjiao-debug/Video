// SEGMENT A (STUB, WP1 + integration check), lines A01-A06, 清晨 on the stairs (PLAN 7 A). The stand-in staging until
// WP5 writes the shot: the stairs (WP2), NEWTON_INK (the ink smear, the quill behind his ear, the bird's nest) in his
// doorway from the knock to the shut, seen from the head of the flight (STAIRS_CAMS.top); the shut door square on
// (STAIRS_CAMS.door) with the TITLE BLOCK on it (Pose.title, from the door's place on screen); HUMPHREY on the landing
// from the crack in the door (BEAT.A.humphreyOut) until he goes down. Her mic comes in from the lower left over the
// first frames and raps on the door (STAIRS.knock, rapK), then is held toward whoever speaks, round to the lens on the
// asides (03, 06), out of the card slot under card 1 (standIn mic). Each mouth moves only inside its own lines.
import { SEGMENTS, clamp01, type Segment } from "../story";
import { BEAT } from "../beats";
import { STX, STAIRS, STAIRS_CAMS, eyeCam } from "../layout";
import { NEWTON_INK } from "../people";
import { rapK, toScreen } from "../cam";
import { standIn } from "./common";

const S = SEGMENTS[0];
/** HUMPHREY's stand-in camera: from two steps down on his mark by the window */
const CAM_HUMPHREY = eyeCam(STX - 0.25, 0.92, [STAIRS.humphrey.x + 0.05, 0.85, STAIRS.humphrey.z], undefined, -0.36);
/** the title block on the shut door: centred on the door's upper half as STAIRS_CAMS.door (square on) sees it */
const TC = toScreen(STAIRS_CAMS.door, [STAIRS.door.x - 0.03, 1.42, STAIRS.door.z]);
const TITLE_ON_DOOR = { x: Math.round(TC.x), y: Math.round(TC.y), scale: 0.92 };
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => {
    const open = (f >= BEAT.A.doorOpen[0] && f < BEAT.A.doorShut) || (f >= BEAT.A.humphreyOut && f < BEAT.A.humphreyShuts) ? 1 : 0;
    const hm = f >= BEAT.A.humphreyOut && f < BEAT.A.humphreyDown + 20;
    const cam = f < BEAT.A.doorShut ? STAIRS_CAMS.top : f < BEAT.A.humphreyOut ? STAIRS_CAMS.door : CAM_HUMPHREY;
    const knocking = f < BEAT.A.doorOpen[0];
    const P = standIn(w, f, {
      cam, params: { door: open, glow: f < BEAT.A.glowOut ? 1 : 0 }, humphrey: hm, newtonAs: NEWTON_INK,
      newton: f >= BEAT.A.doorOpen[0] && f < BEAT.A.doorShut ? { expr: "deadpan" } : false,
      mic: knocking ? { aim: STAIRS.knock, rap: rapK(f, [BEAT.A.knock - 7, BEAT.A.knock]), enter: clamp01(f / 10) } : hm ? { listener: "hm" } : true,
      slate: `A stand-in${open ? " door open" : ""}`,
    });
    return { ...P, title: TITLE_ON_DOOR };
  },
};
