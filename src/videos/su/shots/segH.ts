// SEGMENT H, lines H53-H55: 两年后 · 儋州, oysters at a fire on the beach. WP1 STUB (the stand-in staging); WP7 replaces it.
// The ink wash lands (hud TRANSITIONS), the stamp 两年后 · 儋州 (hud Stamp); SU_DAN (stand-in, standing at the fire's far
// side until WP7's crouch on a low seat) with an oyster to come (WP3), GUO at the fire's right; he leans to the lens on
// 千万 (her camera comes closer), GUO laughs under card 4; the ink wash out at the end.
// Every frame from beats.ts (BEAT.H), every mark and camera from layout/beach.ts.
import { SEGMENTS, FPS, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU_DAN, GUO } from "../people";
import { BEACH, EYE, FOV, frontCam, type Cam } from "../layout";
import { transitionAt } from "../hud";
import { standing, says, accent, heads, at } from "./common";

const S = SEGMENTS[7], B = BEAT.H;
const key = (f: number, c: Cam): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov });
/** the stand-in's two-shot: SU_DAN left of the middle, GUO at the right, the fire between her and him (BEACH_CAMS.su
 *  frames him crouched) */
const PAIR: Cam = { pos: [BEACH.su.x + 0.75, EYE, BEACH.su.z + 3.05], look: [BEACH.su.x + 0.6, 0.7, BEACH.su.z + 0.15], fov: FOV };
/** the stand-in's lean: her eyes closer on him standing (BEACH_CAMS.lean frames him crouched) */
const LEAN: Cam = frontCam(BEACH.su, BEACH.suFacing, 1.7, { side: 0.18, eyesPx: 560 });
const camH = (f: number): CamPose => C.povCam(f, [
  key(S.from, PAIR),
  key(B.lean - 6, PAIR),
  key(B.lean + 8, LEAN),
  key(B.card[0], LEAN),
  key(B.card[0] + 16, PAIR),
], { mood: "calm", amp: 0.7 });

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    w.setPlace("beach");
    w.set.param("fire", 1);
    const cam = camH(f);
    w.setCamera(cam);
    w.actor(SU_DAN).set(standing(BEACH.su, BEACH.suFacing, f, 1, {
      expr: at(f, [[S.from, "smile"], [B.slurp, "smile_closed"], [B.lean - 4, "smug"], [B.card[0], "happy"]]),
      head: heads(accent("lean", f, B.lean, { dur: 0.9 })),
      ...says("su", ["H53", "H55"], f, 1),
    }));
    w.actor(GUO).set(standing(BEACH.guo, BEACH.guoFacing, f, 2, {
      expr: f >= B.laugh ? "laugh" : "smile",
      head: heads(accent("laugh", f, B.laugh, { dur: 1.2 })),
    }));
    w.update();
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: "H stub (beach)" };
  },
};
