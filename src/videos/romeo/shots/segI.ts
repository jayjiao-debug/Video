// SCENE I · the shard (认识第4天). Her camera lies on the stones, tilted, and one big shard of its lens survives: through
// it the light comes back. The spilled bottle, his empty hand; he stands bent over it and stares, then toward where it
// came from. Beside him her fingers move; she sits up ("O my Romeo!"). He turns and steps to her; they hug, and
// it holds four seconds while the lute
// comes back, slow. "Did the friar's letter not reach thee?" "What letter?" Both turn slowly and look up past the shard
// to where she stands. Her last line (……我得买新手机了。): in the cracked glass the tally turns to 插手 1, the shard
// flickers, the power goes off, black, the end card.
// CAMERA PLAN (the camera is on the floor; it cannot move):
//   1  the light returns through the shard: his empty hand, the spill                      (what she did)
//   2  her fingers move; a flicker of the shard; she is sitting up                          (she wakes)
//   3  the hug, held                                                                       (the end she threw for them)
//   4  they look up past the shard at her; her last line; the power-off                    (the last laugh)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, yawTo, seated, walkAlong } from "./common";
import { VERBS } from "./common";
import { ROMEO_LOW, JULIET_LOW } from "../people";
import { P, spot, camAt, faceAt, talk, startOf, endOf, ky, rel, lieDown, carry, lieQ, soft, REACT } from "./kit";
import { EMPTY, BEND, STAND, JU_FEET, HEAD_DIR, RO_FACING } from "./segH";
import { seatOn, stoolSeat } from "../../../kit/day/rig/seats";
import type { RigHead } from "../../group/kit/rig3d";
import { reach } from "./gest";

const S = seg("I");
/** the reporter: standing where she threw from (they look up at her) */
const HER = P("tomb", 0.35, 1.45, 1.3);
/** Juliet sitting up on the bier's FRONT edge at its head end, her legs over the edge, turned to the lens and a little
 *  to him; Romeo steps from the bier's end (two short steps) to stand at her left: the embrace side by side, cheek to cheek,
 *  both faces to the lens on the floor (v5, 22 Nov: in profile at the bier's end the bier hid their bodies, her robe
 *  went into it, and the rig's short arms could not reach round each other) */
const JU_SIT = P("tomb", 0.81, 0, -0.88), JU_FACING = 0.3;
/** THE HUG (v6, the owner on the v5 cut: "Make them hug"; until v5 he stood beside her, both square to the lens, their
 *  inner arms behind each other's backs, the heads 5 cm apart: it read as two people posing). He comes in close and
 *  turns his body to her (his face still turns to the lens): his right arm round her back, his left round her front,
 *  at her waist; her left arm over his shoulder, her right hand on his arm round her; cheek to cheek, his head in front. */
const RO_HUG = P("tomb", 1.28, 0, -0.62), RO_HUG_FACING = yawTo(RO_HUG, JU_SIT);

/** where he stands when the light comes back: 14 cm nearer the bier than in scene H (he shifted his feet in the dark).
 *  From the floor the shard's right edge is close behind him: at H's 1.6 his head went 30 px past it as he straightened
 *  (still v28 f5800). He bends less here than over her in H, so his beret still clears her hair. */
const AT = P("tomb", 1.46, 0, -1.0), UP_BEND = 7;
const STEP_VIA = P("tomb", 1.5, 0, -0.82);
/** the frames: the light is back, her fingers, she sits up (from .. sitUp), his turn, the hug */
export const I_BEATS = {
  fingers: S.from + 34, sitFrom: S.from + 44, sitUp: S.from + 66, turnBack: endOf("I01") + REACT, hug: endOf("I01") + REACT + 16,
  lookUp: startOf("I03") + 6,
};
/** HER WAKING (v4, the owner: "the ending animation where she wakes is now just teleport, need animation"). Until v3
 *  she lay, the shard flickered, and she was sitting. Now she wakes: her lids flutter, her eyes open, her body rises
 *  about her hips and turns to the lens as her legs swing over the bier's front edge (quick off the mark, easing in),
 *  she swings a little past upright and settles, her head a beat behind her body, and she blinks once at where she is.
 *  The rig cannot lie down or sit up, so it is done as lieDown does lying: the figure is solved as a normal one and
 *  CARRIED (kit.ts carry). Up to SIT_SWAP of the way it is the lying figure (solved standing) turning up about its
 *  hips; from there the sitting figure (solved on the bier's edge) turned back by what is left of the turn, so her
 *  thighs come over the edge as her back comes up. The swap falls where both have the same back and head; the legs
 *  that change are out of the shard's view at her feet end.
 *  HER GOWN AND THE STONE: sitting, her gown hangs down the bier's front face (its back half is in the stone, as on
 *  any seat). So her hips come forward to the edge FIRST, while her legs are still above the slab (SIT_EDGE of the
 *  way); after that the gown swings down in front of the face and never comes out through it (stills v12: with the
 *  hips drifting forward all the way up, the gown slid out of the stone for six frames). */
const SIT_SWAP = 0.3, SIT_EDGE = 0.22, SIT_OVER = 0.05, Q_LIE = lieQ(HEAD_DIR, 0.04), Q_SIT = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), JU_FACING);

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
    const ro = w.actor(ROMEO_LOW);
    const toHer = yawTo(AT, HER);
    // stares at his empty hand, then toward where the camera came from; turns back to Juliet when she speaks; the hug;
    // then both look up at the reporter
    const lookCam = ky(f, [[S.from + 18, 0], [S.from + 30, 1]]);
    const back = ky(f, [[B.turnBack, 0], [B.turnBack + 12, 1]]);
    const up = ky(f, [[B.lookUp, 0], [B.lookUp + 20, 1]]);
    // (v5: he stands, as in scene H; until v4 he rose from his knees here, the figure coming up out of the floor as it
    // slid to her. Now he walks the two steps.)
    const rise = ky(f, [[B.turnBack + 4, 0], [B.hug, 1]]);
    // (v6: round by STEP_VIA, out to his side: straight from the bier's end his leaning head passed 2 cm into hers)
    const step = walkAlong([AT, STEP_VIA, RO_HUG], (AT.distanceTo(STEP_VIA) + STEP_VIA.distanceTo(RO_HUG)) / ((B.hug - (B.turnBack + 4)) / 30), (f - (B.turnBack + 4)) / 30);
    const roAt = step.at;
    const hugFacing = RO_HUG_FACING;
    let roFacing = THREE.MathUtils.lerp(RO_FACING, toHer, lookCam);
    if (back > 0) roFacing = THREE.MathUtils.lerp(roFacing, THREE.MathUtils.lerp(RO_FACING, hugFacing, rise), back);
    if (up > 0) roFacing = THREE.MathUtils.lerp(roFacing, yawTo(RO_HUG, HER), 0.55 * up);
    const hugging = f >= B.hug;
    // their heads tip together over ten frames, and stay together while they speak (v4: the tip came and went in one
    // frame, 5 to 6 cm at the head, at the hug and at each line: a spoken line's own head replaced it)
    const hugK = ky(f, [[B.hug - 3, 0], [B.hug + 7, 1]]) * (1 - up);
    const tilted = (hd: RigHead | undefined, tilt: number): RigHead | undefined => (tilt ? { ...hd, tilt: (hd?.tilt ?? 0) + tilt } : hd);
    const roSay = talk("ro", f, 1) as { head?: RigHead }, juSay = talk("ju", f, 2) as { head?: RigHead };
    // the embrace (see RO_HUG): his right hand behind her back, his left round her front at the waist; her left hand on
    // his arm that goes round her, her right round his waist (the rig's arm reaches 0.4 m). (Her right hand was higher,
    // under his jaw: the elbow changed sides every second or so as her head breathed, 11 cm in a frame. At his waist
    // it holds still.)
    const roRoundHer = P("tomb", 0.9, 0.98, -1.04), roFront = P("tomb", 0.95, 0.86, -0.64);
    const juRoundHim = P("tomb", 1.10, 0.86, -0.58), juOnArm = P("tomb", 0.99, 0.95, -0.66);
    ro.set({
      ...standing(roAt, roFacing, f, 1),
      pose: step.moving ? step.pose : { kind: "hold", t: f / 30 },
      // bent over his empty hand; he straightens (not all the way: the shard's edge is close behind his head) as he
      // looks toward where the camera came from, and stands up to her
      lean: { pitch: BEND.after - (BEND.after - UP_BEND) * lookCam - UP_BEND * rise },
      // his empty right hand held where the bottle was knocked out of it, the very point of scene H (measured from
      // where he stood there: measured from AT it lay 14 cm nearer her and 6.5 cm in her hair, clearance f5747-5770);
      // it sinks to his side as he looks toward where the camera came from (held on in the world while his body
      // turned under it, its elbow flipped 18 cm in one frame, f5774)
      hands: hugging ? [roRoundHer, roFront] : [reach(rel(STAND, RO_FACING, EMPTY[0], EMPTY[1], EMPTY[2]), 1 - lookCam), null],
      expr: faceAt(f, [[0, "blank"], [startOf("I01") + REACT, "caught"], [B.hug, "dreamy"], [startOf("I03") - 2, "blank"]]),
      ...roSay,
      head: tilted(roSay.head, -9 * hugK),
      // (his eyes leave his empty hand as he turns toward where the camera came from: the head came up in one frame)
      lookDown: soft(f, (g) => { const u = ky(g, [[B.lookUp, 0], [B.lookUp + 20, 1]]); return g < S.from + 18 ? 14 : u > 0 ? -16 * u : 0; }),
      hide: ["letter", "darkBottle"],
    });

    // ---------------------------------------------------------------- Juliet: lying; her fingers move; sitting up; the hug
    const ju = w.actor(JULIET_LOW);
    // 0 lying .. 1 sitting: quick off the mark, easing in
    const st = Math.min(1, Math.max(0, (f - B.sitFrom) / (B.sitUp - B.sitFrom))), sitK = 0.3 * st * st * (3 - 2 * st) + 0.7 * (1 - Math.pow(1 - st, 2.4));
    // her turn swings a little past upright as she arrives and comes back (toward the lens: the way she is going)
    const turnK = sitK + SIT_OVER * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - (B.sitUp - 7)) / 16)));
    // her lids: fluttering as her fingers move, open as she starts up, one slow blink once she is up
    const lids = ky(f, [[B.fingers - 5, 1], [B.fingers - 1, 0.5], [B.fingers + 2, 1], [B.fingers + 5, 0.3], [B.fingers + 7, 0.75], [B.sitFrom, 0], [B.sitUp + 1, 0], [B.sitUp + 3, 1], [B.sitUp + 4, 0.6], [B.sitUp + 6, 0]]);
    // her head a beat behind her body: tipped back on the way up, a nod as she arrives, level
    const nod = ky(f, [[B.sitFrom, 0], [B.sitFrom + 4, -10], [B.sitUp - 5, -10], [B.sitUp + 2, 12], [B.sitUp + 9, 4]]);
    const waking = f >= B.fingers - 5 && f < B.sitUp + 7;
    const lying = sitK < SIT_SWAP;
    const seat = seatOn(stoolSeat({ seat: 0.62, d: 0.3 }), JU_SIT, JU_FACING);
    if (lying) {
      const twitch = f >= B.fingers ? 0.03 * Math.sin((f - B.fingers) * 0.8) : 0;
      ju.set({
        ...standing(JU_FEET, 0, 0, 2),
        pose: { kind: "hold", t: 0 },
        hands: [rel(JU_FEET, 0, -0.035 - twitch, 0.7, 0.15), rel(JU_FEET, 0, 0.035 + twitch, 0.7 + twitch, 0.15)],
        expr: waking ? faceAt(f, [[0, "waking"]]) : "sleep", blink: waking ? lids : 1, gaze: 0,
        lookDown: nod,
        hide: ["vial"],
      });
    } else {
      const juUp = yawTo(JU_SIT, HER);
      // her hands come down from her chest to her lap as she comes up
      const lapH = VERBS.lap(seat, 0.1, 0.25, 0.2).hands ?? [null, null], hk = ky(f, [[B.sitFrom + 6, 0], [B.sitUp + 4, 1]]);
      const chest = [rel(seat.top, JU_FACING, -0.035, 0.2, 0.15), rel(seat.top, JU_FACING, 0.035, 0.2, 0.15)];
      const downH = lapH.map((h, i) => (h ? chest[i].clone().lerp(h, hk) : null)) as [THREE.Vector3 | null, THREE.Vector3 | null];
      ju.set({
        ...standing(seat.top.clone(), JU_FACING, f, 2),
        ...seated(seat, f / 30, { facing: up > 0 ? THREE.MathUtils.lerp(JU_FACING, juUp, 0.5 * up) : JU_FACING }),
        // the embrace: her right hand on his chest, her left round his back
        hands: hugging ? [juOnArm, juRoundHim] : downH,
        expr: faceAt(f, [[0, "waking"], [B.hug, "swoon"], [startOf("I02") - 2, "puzzled"], [startOf("I03") + REACT, "blank"]]),
        ...juSay,
        head: tilted(juSay.head, 9 * hugK),
        ...(waking ? { blink: lids } : {}),
        lookDown: up > 0 ? 4 - 16 * up : f < B.sitUp + 9 ? nod : 4,      // (the look up starts from where her head is: it started 4 degrees off, in one frame)
        hide: ["vial"],
      });
    }
    w.update();
    if (sitK <= 0) lieDown(w, ju, JU_FEET, HEAD_DIR, 1, 0.04);
    else if (sitK < 1 || turnK !== 1) {
      // the hips' way: from where they lie to the edge she sits on, a little up and toward her feet in the middle (the
      // arc of a real sit-up), forward to the edge first (SIT_EDGE); the turn: from lying to sitting and a little
      // past it, one turn about one axis
      const hipL = (ju as unknown as { dim: { hipY: number } }).dim.hipY, pivL = JU_FEET.clone().add(V(0, hipL, 0));
      const H0 = JU_FEET.clone().add(V(0, hipL, 0).applyQuaternion(Q_LIE)), H1 = seat.top.clone().add(V(0, 0.03, 0));
      const arc = Math.sin(Math.PI * sitK), hip = H0.clone().lerp(H1, sitK).add(V(-0.1 * arc, 0.05 * arc, 0));
      const ek = Math.min(1, sitK / SIT_EDGE);
      hip.z = H0.z + (H1.z - H0.z) * ek * ek * (3 - 2 * ek);
      const q = Q_LIE.clone().slerp(Q_SIT, turnK);
      if (lying) carry(w, ju, q, pivL, hip.clone().sub(pivL));
      else carry(w, ju, q.clone().multiply(Q_SIT.clone().invert()), H1, hip.clone().sub(H1), true);
    }
    return { camera, cards: false };
  },
};
