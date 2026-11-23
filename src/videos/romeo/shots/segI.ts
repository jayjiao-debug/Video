// SCENE I · the shard (认识第4天). Her camera lies on the stones, tilted, and one big shard of its lens survives: through
// it the light comes back. The spilled bottle, his empty hand; he stares at it, then toward where it came from. Behind
// him her fingers move; she sits up ("Where is my Romeo?"). He turns; they hug, and it holds four seconds while the lute
// comes back, slow. "Did the friar's letter not reach thee?" "What letter?" Both turn slowly and look up past the shard
// to where she stands. Her last line (…拍不了了。我送。): in the cracked glass the tally turns to 插手 1, the shard
// flickers, the power goes off, black, the end card.
// CAMERA PLAN (the camera is on the floor; it cannot move):
//   1  the light returns through the shard: his empty hand, the spill                      (what she did)
//   2  her fingers move; a flicker of the shard; she is sitting up                          (she wakes)
//   3  the hug, held                                                                       (the end she threw for them)
//   4  they look up past the shard at her; her last line; the power-off                    (the last laugh)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, yawTo, seated } from "./common";
import { VERBS } from "./common";
import { ROMEO_BOTTLE, JULIET } from "../people";
import { P, spot, camAt, faceAt, talk, startOf, endOf, ky, rel, lieDown, REACT } from "./kit";
import { KNEEL, JU_FEET, HEAD_DIR, RO_FACING } from "./segH";
import { seatOn, stoolSeat } from "../../../kit/day/rig/seats";
import { SIT_FLICKER } from "../shard";

const S = seg("I");
/** the reporter: standing where she threw from (they look up at her) */
const HER = P("tomb", 0.35, 1.45, 1.3);
/** Juliet sitting up on the bier's FRONT edge at its head end, her legs over the edge, turned to the lens and a little
 *  to him; Romeo up from his knees at the bier's end to stand at her left: the embrace side by side, cheek to cheek,
 *  both faces to the lens on the floor (v5, 22 Nov: in profile at the bier's end the bier hid their bodies, her robe
 *  went into it, and the rig's short arms could not reach round each other) */
const JU_SIT = P("tomb", 0.81, 0, -0.88), JU_FACING = 0.3;
const RO_HUG = P("tomb", 1.38, 0, -0.62), RO_HUG_FACING = -0.6;
/** the frames: the light is back, her fingers, the flicker she sits up behind, his turn, the hug */
export const I_BEATS = {
  fingers: S.from + 34, sitUp: SIT_FLICKER(), turnBack: endOf("I01") + REACT, hug: endOf("I01") + REACT + 16,
  lookUp: startOf("I03") + 6,
};

export const SEG: Segment = {
  id: "I", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("tomb");
    const B = I_BEATS;
    const camera = povCam(f, [camAt("tomb", "floor", S.from), camAt("tomb", "floor", S.to)], { mood: "calm", amp: 0 });
    w.setCamera(camera);
    // what fell on the stones
    w.prop("darkBottle").put(P("tomb", 1.02, 0.0, -0.42), { lying: true, rot: 2.2, scale: 1.3 });
    w.prop("spill").put(P("tomb", 0.96, 0.005, -0.38), { amount: 1 });
    w.prop("glassShards").put(P("tomb", 0.78, 0.005, -0.12), { rot: 0.6 });

    // ---------------------------------------------------------------- Romeo
    const ro = w.actor(ROMEO_BOTTLE);
    const toHer = yawTo(KNEEL, HER);
    // stares at his empty hand, then toward where the camera came from; turns back to Juliet when she speaks; the hug;
    // then both look up at the reporter
    const lookCam = ky(f, [[S.from + 18, 0], [S.from + 30, 1]]);
    const back = ky(f, [[B.turnBack, 0], [B.turnBack + 12, 1]]);
    const up = ky(f, [[B.lookUp, 0], [B.lookUp + 20, 1]]);
    const rise = ky(f, [[B.turnBack + 4, 0], [B.hug, 1]]);
    const roAt = KNEEL.clone().lerp(RO_HUG, rise);
    const hugFacing = RO_HUG_FACING;
    let roFacing = THREE.MathUtils.lerp(RO_FACING, toHer, lookCam);
    if (back > 0) roFacing = THREE.MathUtils.lerp(roFacing, THREE.MathUtils.lerp(RO_FACING, hugFacing, rise), back);
    if (up > 0) roFacing = THREE.MathUtils.lerp(roFacing, yawTo(RO_HUG, HER), 0.55 * up);
    const hugging = f >= B.hug;
    // the embrace: heads together, their inner arms round each other's backs (behind them), the outer ones easy (the
    // rig's arms are 0.4 m: across to the other's chest they could not reach)
    const roRoundHer = P("tomb", 0.95, 0.98, -0.96), juRoundHim = P("tomb", 1.3, 0.95, -0.78);
    ro.set({
      ...standing(roAt, roFacing, f, 1),
      ...VERBS.kneel(1 - rise, roAt, 0),
      pose: { kind: "hold", t: f / 30 },
      // before he turns back, his empty right hand held where the bottle was
      hands: hugging ? [roRoundHer, null]
        : f < B.turnBack ? [rel(KNEEL, RO_FACING, -0.18, 0.84 - 0.1 * lookCam, 0.32), null] : [null, null],
      head: hugging && up < 1 ? { tilt: -13 * (1 - up) } : undefined,
      expr: faceAt(f, [[0, "blank"], [startOf("I01") + REACT, "caught"], [B.hug, "dreamy"], [startOf("I03") - 2, "blank"]]),
      ...talk("ro", f, 1),
      lookDown: f < S.from + 18 ? 14 : up > 0 ? -16 * up : 0,
      hide: ["letter", "darkBottle"],
    });

    // ---------------------------------------------------------------- Juliet: lying; her fingers move; sitting up; the hug
    const ju = w.actor(JULIET);
    const sitting = f >= B.sitUp;
    if (!sitting) {
      const twitch = f >= B.fingers ? 0.03 * Math.sin((f - B.fingers) * 0.8) : 0;
      ju.set({
        ...standing(JU_FEET, 0, 0, 2),
        pose: { kind: "hold", t: 0 },
        hands: [rel(JU_FEET, 0, -0.035 - twitch, 0.7, 0.15), rel(JU_FEET, 0, 0.035 + twitch, 0.7 + twitch, 0.15)],
        expr: "sleep", blink: f >= B.fingers + 8 ? 0.5 : 1, gaze: 0,
        hide: ["vial"],
      });
    } else {
      const seat = seatOn(stoolSeat({ seat: 0.62, d: 0.3 }), JU_SIT, JU_FACING);
      const juUp = yawTo(JU_SIT, HER);
      ju.set({
        ...standing(seat.top.clone(), JU_FACING, f, 2),
        ...seated(seat, f / 30, { facing: up > 0 ? THREE.MathUtils.lerp(JU_FACING, juUp, 0.5 * up) : JU_FACING }),
        // the embrace: her right hand on his chest, her left round his back
        hands: hugging ? [VERBS.lap(seat, 0.1, 0.25, 0.2).hands?.[0] ?? null, juRoundHim] : VERBS.lap(seat, 0.1, 0.25, 0.2).hands ?? [null, null],
        head: hugging && up < 1 ? { tilt: 13 * (1 - up) } : undefined,
        expr: faceAt(f, [[0, "waking"], [B.hug, "swoon"], [startOf("I02") - 2, "puzzled"], [startOf("I03") + REACT, "blank"]]),
        ...talk("ju", f, 2),
        lookDown: up > 0 ? -12 * up : 4,
        hide: ["vial"],
      });
    }
    w.update();
    if (!sitting) lieDown(w, ju, JU_FEET, HEAD_DIR, 1);
    return { camera, cards: false };
  },
};
