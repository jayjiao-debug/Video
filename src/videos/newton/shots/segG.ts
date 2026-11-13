// SEGMENT G (STUB, WP1 + integration check), lines G01-G04, 凌晨两点: the clock, the board, the laugh, the sack, good
// night; his room by candle; his window goes dark; black (PLAN 7 G). The stand-in staging until WP5 writes the shot:
// the place of every frame (beats.ts placeAt: the elaboratory (fire deep red, the candle a stub), his room from
// BEAT.G.room at hour "night", the night garden from BEAT.G.outside seen from the elaboratory door (GARDEN_CAMS.window)
// with his window lit until BEAT.G.windowDark); NEWTON (no quill, no nest) on his mark: THE LAUGH (people.ts laugh) from
// BEAT.G.laugh through the hold, smiling after it; HUMPHREY_SOOT from the laugh to the end of card 4; her hand holds the
// board up close over BEAT.G.boardUp (cam.ts boardHold, the mic out of shot), the mic toward him otherwise (not in the
// garden); the end black (hud endBlack: the film's darkest warm tone, an 8-frame fade) in Pose.top from BEAT.G.black.
import { SEGMENTS, FPS, clamp01, type Segment, type CamPose } from "../story";
import { BEAT, placeAt } from "../beats";
import { STAND, GARDEN_CAMS } from "../layout";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT, laugh } from "../people";
import { boardHold } from "../cam";
import { endBlack } from "../hud";
import { standIn, dressRoom } from "./common";

const S = SEGMENTS[6];
export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => {
    const p = placeAt(f), garden = p === "garden", room = p === "room";
    const params: Record<string, number | string> = room ? { hour: "night" } : garden ? { time: "night", glow: 1, window: f < BEAT.G.windowDark ? 1 : 0 } : { fire: 0.35, candle: 0.3 };
    const camera: CamPose = garden ? GARDEN_CAMS.window : STAND[p].cam;
    const board = f >= BEAT.G.boardUp[0] && f <= BEAT.G.boardUp[1] && p === "elaboratory";
    const laughing = f >= BEAT.G.laugh && f <= BEAT.G.laughHold[1];
    const P = standIn(w, f, {
      cam: camera, params, humphrey: f >= BEAT.G.laugh && f <= BEAT.G.card4[1], humphreyAs: HUMPHREY_SOOT, newtonAs: NEWTON,
      newton: garden ? false : { hide: NEWTON_HIDE, ...(laughing ? laugh((f - BEAT.G.laugh) / FPS) : { expr: f > BEAT.G.laughHold[1] ? "smile" : "deadpan" }) },
      extra: room ? (w) => dressRoom(w, f, { lid: 0, bites: 3 }) : undefined,
      mic: !garden && !board,
      after: board ? (w) => {
        const B = boardHold(camera, f, { k: clamp01((f - BEAT.G.boardUp[0]) / 12) });
        w.prop("board").put(B.board.at, { rot: B.board.rot });
        w.prop("handR").put(B.hand.at, { rot: B.hand.rot, pose: "grip" }); w.prop("hand").put(B.handL.at, { rot: B.handL.rot, pose: "grip" });
      } : undefined,
      slate: `G stand-in (${p})`,
    });
    return f >= BEAT.G.black[0] ? { ...P, top: endBlack(f, BEAT.G.black[0]) } : P;
  },
};
