// SEGMENT I, lines I56-I57: 四年后 · 金山寺, the portrait. WP1 STUB (the stand-in staging); WP7 replaces it.
// The ink wash lands, the stamp 四年后 · 金山寺 (hud Stamp); SU_OLD (stand-in) before his portrait; after I56 he turns to
// look at it (back three-quarters, her camera over his shoulder), then turns back and smiles; the camera eases in on I57
// (the three names: hud EndNames); the picture dims, card 5, the fade to black (Film.tsx EndBlack).
// Every frame from beats.ts (BEAT.I), every mark and camera from layout/temple.ts.
import { SEGMENTS, FPS, clamp01, smooth, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU_OLD } from "../people";
import { TEMPLE, TEMPLE_CAMS, type Cam } from "../layout";
import { transitionAt } from "../hud";
import { standing, says, lerpA, at } from "./common";

const S = SEGMENTS[8], B = BEAT.I;
const key = (f: number, c: Cam): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov });
const camI = (f: number): CamPose => C.povCam(f, [
  key(S.from, TEMPLE_CAMS.stand),
  key(B.look[0], TEMPLE_CAMS.stand),
  key(B.look[0] + 20, TEMPLE_CAMS.portrait),
  key(B.smile - 16, TEMPLE_CAMS.portrait),
  key(B.ease, TEMPLE_CAMS.stand),
  key(B.pictures, TEMPLE_CAMS.ease),
], { mood: "calm", amp: f >= B.ease ? 0.35 : 0.6 });
/** to her, turned to the portrait (back three-quarters) during BEAT.I.look, back to her for I57 */
const facingAt = (f: number) => f < B.look[0] ? TEMPLE.suFacing : f < B.smile ? lerpA(TEMPLE.suFacing, Math.PI - 0.4, smooth(clamp01((f - B.look[0]) / 16))) : lerpA(Math.PI - 0.4, TEMPLE.suFacing, smooth(clamp01((f - B.smile) / 14)));

export const SEG: Segment = {
  id: "I", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    w.setPlace("temple");
    const cam = camI(f);
    w.setCamera(cam);
    const away = f >= B.look[0] + 4 && f < B.smile + 8;
    w.actor(SU_OLD).set(standing(TEMPLE.su, facingAt(f), f, 1, {
      turn: away ? 1 : undefined,
      expr: at(f, [[S.from, "smile_closed"], [B.smile, "smile"]]),
      ...says("su", ["I57"], f, 1),
    }));
    w.update();
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: `I stub ${f >= B.black[0] ? "black" : f >= B.ease ? "names" : "portrait"}` };
  },
};
