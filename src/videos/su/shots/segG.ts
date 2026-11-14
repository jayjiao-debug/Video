// SEGMENT G, line G52: 黎明, the river: the boat leaves. WP1 STUB (the stand-in staging); WP7 replaces it.
// SU (stand-in, on the bank's edge until WP3's boat) waves his whole arm and shouts back G52; the dawn warms (river
// param dawn); her camera eases back a little; the ink wash out at the end (hud TRANSITIONS).
// Every frame from beats.ts (BEAT.G), every mark and camera from layout/river.ts.
import { SEGMENTS, FPS, clamp01, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU } from "../people";
import { RIVER, STAND } from "../layout";
import { transitionAt } from "../hud";
import { standing, says } from "./common";

const S = SEGMENTS[6], B = BEAT.G, ST = STAND.river;
const camG = (f: number): CamPose => C.creep(C.handheld({ ...ST.cam }, f, { mood: "calm", amp: 0.7 }), f, S.from, S.to, -0.5);

export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    w.setPlace("river");
    w.set.param("dawn", 0.4 + 0.5 * clamp01((f - S.from) / (S.to - S.from)));
    const cam = camG(f);
    w.setCamera(cam);
    const waving = f >= B.wave - 6;
    w.actor(SU).set(standing(RIVER.su, RIVER.suFacing, f, 1, {
      pose: waving ? { kind: "wave", t: f / FPS, arm: 1 } : { kind: "idle", t: f / FPS + 0.41 },
      expr: waving ? "happy" : "smile",
      ...says("su", ["G52"], f, 1),
    }));
    w.update();
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: "G stub" };
  },
};
