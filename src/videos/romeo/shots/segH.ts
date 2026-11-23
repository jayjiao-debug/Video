// SCENE H · Thursday before dawn, the Capulet vault (认识第4天). THE QUIET SCENE: torchlight, Juliet on the stone bier
// with her hands folded, Romeo kneeling beside her. "Death hath had no power yet upon thy beauty"; his hand near her
// cheek, not touching ("crimson in thy lips"). She says it out loud this time (they're red because she's alive!); he does
// not turn. He raises the dark bottle to his love with Juliet's own toast; it never reaches his lips. "I only film, I
// don't inter— I'm done filming!" The picture lurches; the camera leaves her hands and flies at his hand; glass breaks;
// it lands on the stones; a crack splits the picture; black. The REC display stutters and dies.
// No effects, no snaps, no sway: one slow push, then the throw.
// CAMERA PLAN:
//   1  H01-H04  THE ONE SLOW PUSH (fov 46 -> 37)                                                        (the quiet scene)
//   2  H05 插   the picture lurches                                                                    (she decides)
//   3  不拍了   the throw: the lens flies at his raised hand, tumbling                                  (the throw)
//   4  impact   on the floor, tilted, looking up at the bier; the crack; black                          (the camera breaks)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, nudge, type CamKey } from "../cam";
import { V, standing, yawTo } from "./common";
import { VERBS } from "./common";
import { ROMEO_BOTTLE, JULIET } from "../people";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, rel, lieDown, REACT } from "./kit";
import { capWord } from "../captions";
import { THROW_AT, IMPACT_AT } from "../shard";

const S = seg("H");
const BIER = spot("tomb", "bier"), FLOOR = spot("tomb", "shardFloor");
/** Romeo kneels at the bier's head end (its right end in the lens), facing along it to her face: both faces read
 *  (v2, 22 Nov: kneeling at its front he hid her face, and the lens, at her feet, saw only the hem of her robe) */
export const KNEEL = P("tomb", 1.3, 0, -1.0);
/** Juliet lying on the bier near its front edge: her feet (the pivot of lieDown), her head toward +x, toward him */
export const JU_FEET = P("tomb", -0.44, 0.87, -1.05), HEAD_DIR = V(1, 0, 0);
const JU_FACE = P("tomb", 0.76, 0.85, -1.05);
export const RO_FACING = yawTo(KNEEL, JU_FACE);
/** his toast: the dark bottle raised toward her in his right hand, never near his lips. He comes up onto his knees for
 *  it (kneel 1 -> 0.5): from the full kneel the rig's 0.4 m arm could not get the bottle clear of the two heads (v5
 *  stills: at y 1.0 it was behind her head; set higher, the hand stopped short beside his own) */
export const TOAST = rel(KNEEL, RO_FACING, 0, 1.2, 0.36);

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("tomb");
    const h02 = startOf("H02"), h04 = startOf("H04"), tLurch = capWord("H05", "插").from;
    // ---------------------------------------------------------------- the camera
    const PUSH = camAt("tomb", "push", 0), FLOORC = camAt("tomb", "floor", 0);
    let camera;
    if (f < IMPACT_AT) {
      const from = new THREE.Vector3(...(PUSH.pos as [number, number, number]));
      const hit = TOAST.clone(), dir = hit.clone().sub(from).normalize();
      const near = hit.clone().sub(dir.clone().multiplyScalar(0.28));
      const mid = from.clone().lerp(near, 0.55).add(V(0, 0.12, 0));
      const k = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...PUSH, f: fr, ...o });
      camera = povCam(f, [
        k(S.from),
        k(h04, { fov: 42 }),
        k(THROW_AT, { fov: 42 }),
        k(THROW_AT + 5, { pos: [mid.x, mid.y, mid.z], look: [hit.x, hit.y, hit.z], fov: 44, roll: 70 }),
        k(IMPACT_AT, { pos: [near.x, near.y, near.z], look: [hit.x, hit.y, hit.z], fov: 50, roll: 150 }),
      ], { mood: "calm", amp: f < THROW_AT ? 0.15 : 0 });
      // the lurch on 插: she has decided
      const lurch = ky(f, [[tLurch - 1, 0], [tLurch + 2, 1], [tLurch + 9, 0]]);
      if (lurch > 0 && f < THROW_AT) camera = nudge(camera, { pitch: -3.5 * lurch, roll: 4 * lurch, fwd: 0.06 * lurch });
    } else {
      // on the stones: a tumble into the floor view, then still
      const k = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...FLOORC, f: fr, ...o });
      camera = povCam(f, [k(IMPACT_AT, { roll: 75, fov: 68 }), k(IMPACT_AT + 7, {}), k(S.to, {})], { mood: "calm", amp: 0 });
    }
    w.setCamera(camera);

    // ---------------------------------------------------------------- Romeo, kneeling beside her
    const ro = w.actor(ROMEO_BOTTLE);
    const knocked = f >= IMPACT_AT;
    const reach = ky(f, [[h02 + 6, 0], [h02 + 24, 1], [endOf("H02") + 4, 1], [endOf("H02") + 20, 0]]);
    // his left hand (the lens side): resting on his thigh; up beside the bier's end; then out over its front edge to a
    // hand's breadth from her cheek
    const rest = rel(KNEEL, RO_FACING, 0.14, 0.45, 0.15), upP = rel(KNEEL, RO_FACING, 0.32, 0.78, 0.25), cheek = rel(KNEEL, RO_FACING, 0.3, 0.86, 0.66);
    const reachAt = reach < 0.4 ? rest.clone().lerp(upP, reach / 0.4) : upP.clone().lerp(cheek, (reach - 0.4) / 0.6);
    const raise = ky(f, [[h04 - 6, 0], [h04 + 10, 1]]);
    const lap = rel(KNEEL, RO_FACING, -0.12, 0.42, 0.2), lift = rel(KNEEL, RO_FACING, -0.08, 0.98, 0.14);
    // the bottle comes up close to him first, then out over her: a straight lap-to-toast line went through her head
    const toastAt = raise < 0.55 ? lap.clone().lerp(lift, raise / 0.55) : lift.clone().lerp(TOAST, (raise - 0.55) / 0.45);
    ro.set({
      ...standing(KNEEL, RO_FACING, f, 1),
      ...VERBS.kneel(knocked ? 1 : 1 - 0.5 * raise, KNEEL, 10),
      pose: { kind: "hold", t: f / 30 },
      hands: [knocked ? rel(KNEEL, RO_FACING, -0.18, 0.84, 0.32) : toastAt, knocked ? null : reachAt],
      expr: faceAt(f, [[0, "tender"], [h04 - 4, "grief"], [IMPACT_AT + REACT, "blank"]]),   // eyes on her, never a smile with closed eyes beside her
      ...talk("ro", f, 1),
      lookDown: knocked ? -4 : 12,
      hide: knocked ? ["letter", "darkBottle"] : ["letter"],
    });

    // ---------------------------------------------------------------- Juliet on the bier (solved standing, then laid down)
    const ju = w.actor(JULIET);
    ju.set({
      ...standing(JU_FEET, 0, 0, 2),
      pose: { kind: "hold", t: 0 },
      hands: [rel(JU_FEET, 0, -0.035, 0.7, 0.15), rel(JU_FEET, 0, 0.035, 0.7, 0.15)],
      expr: "sleep", blink: 1, gaze: 0, mouth: undefined,
      hide: ["vial"],
    });

    // ---------------------------------------------------------------- after the throw: what fell on the stones
    if (knocked) {
      const t = (f - IMPACT_AT) / 30;
      w.prop("darkBottle").put(P("tomb", 1.02, 0.0, -0.42), { lying: true, rot: 2.2, scale: 1.3 });
      w.prop("spill").put(P("tomb", 0.96, 0.005, -0.38), { amount: Math.min(1, t * 1.2) });
      w.prop("glassShards").put(P("tomb", 0.78, 0.005, -0.12), { rot: 0.6 });
    }
    w.update();
    lieDown(w, ju, JU_FEET, HEAD_DIR, 1, 0.04);

    // ---------------------------------------------------------------- her camera's display stutters and dies at the impact
    const stutter = f >= IMPACT_AT && f < IMPACT_AT + 12;
    const dead = f >= IMPACT_AT + 12;
    return { camera, rec: stutter ? f % 3 === 0 : dead ? false : undefined, hud: dead ? false : undefined };
  },
};
