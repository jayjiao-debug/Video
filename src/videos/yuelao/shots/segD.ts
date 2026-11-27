// SCENE D · 11:00. THE RUSH ORDER. He is still drooping at the cabinet when the burner by the door begins to smoke: a
// prayer from the 月老 temple, marked urgent. He runs to it. The mother appears in the smoke, small, kneeling on a
// cloud, praying at him (her daughter is thirty, works every night, will not look for anyone); then she bows right
// down: "I am not getting up until it is done". The smoke gathers into the order slip, which drops into his hands:
// 林小满, tonight. He tucks the slip away, pulls a spool from his robe, and tosses it at her lens (hold the thread): follow me.
// CAMERA PLAN (her eyes, one take from scene C; 17 s, four moves):
//   open     LOOK AT him small before his open drawers      wide (scene C's last frame; the clock races)   still
//   来单了    him running across the room                    he grows as he passes her                     a pan right with him to the burner
//   D02-D03  the two of them: he on the left, the vision    medium two-shot                                still (the acting is theirs)
//            in the smoke on the right
//   就她了    him with the slip; the order's card beside    medium, he is on the right                     a step to the right as he turns to her with it
//   跟我来    the spool thrown at the lens                   it fills the frame                             still; THE JOIN (the spool comes away from her lens in scene E)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { toScreen } from "../cam";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, faceTo, v3, through, turnTo, hit, shotCam, inHand, VERBS, wv, type ShotKey } from "./kit";
import { act, YL, MAMA_MINI, wring, flail, type MoodKey } from "./act";
import { orderSlip, spoolLens, draw, type Fx } from "./fx";
import { droop, FLAT } from "./thread";
import { CAM_C1, cabinetMess } from "./segC";

const S = seg("D");
const BASE = P("office", -2.1, 0, -0.3), BURN = P("office", 1.66, 0, 0.78), SMOKE = P("office", 2.3, 0, 1.0), HEAD = 1.195;
const RUN = [BASE, P("office", -1.2, 0, -0.55), P("office", 0.2, 0, -0.6), P("office", 1.3, 0, 0.25), BURN];
const CAMB: [number, number, number] = [0.95, 1.5, 3.0], CAMS: [number, number, number] = [1.2, 1.5, 2.75];
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0);
    const d01 = startOf("D01"), d02 = startOf("D02"), d03 = startOf("D03"), e03 = endOf("D03"), d04 = startOf("D04"), d05 = startOf("D05"), e05 = endOf("D05");
    const urgent = wordAt("D01", "加急"), thirty = wordAt("D02", "三十"), overtime = wordAt("D02", "天天"), nobody = wordAt("D02", "就是"), notUp = wordAt("D03", "我就"), her = wordAt("D04", "林小满"), tonight = wordAt("D04", "今晚"), must = wordAt("D04", "必须"), follow = wordAt("D05", "跟我");
    const puff = S.from + 8, go = d01 - 9, speed = 3.4, arrive = go + Math.ceil((VERBS.walkTime(RUN, speed)) * 30), fall = e03 + 3, got = fall + 10, thrown = e05 + 2, land = thrown + 12;
    w.set.param("smoke", ky(f, [[puff, 0], [puff + 12, 0.8], [d02 - 8, 1], [e03 - 6, 1], [fall - 2, 1.5], [fall + 4, 1.5], [got, 0.3], [S.to, 0.2]]));   // (it thickens as it takes her and gives the slip)
    // ---------------------------------------------------------------------------------------------- where he is
    const leg = walkAlong(RUN, speed, (f - go) / 30), moving = leg.moving && f >= go;
    const at = f < go ? BASE.clone() : leg.at.clone();
    const headAt = (g: number) => (g < go ? BASE : walkAlong(RUN, speed, (g - go) / 30).at).clone().add(V(0, HEAD, 0));
    // ---------------------------------------------------------------------------------------------- the camera
    const c1 = { pos: wv("office", CAM_C1.pos), look: wv("office", CAM_C1.look), fov: CAM_C1.fov }, s1 = toScreen(c1, [BASE.x, HEAD, BASE.z]);
    const keys: ShotKey[] = [
      { f: S.from, pos: CAM_C1.pos, at: [BASE.x, HEAD, BASE.z], sx: s1.x, sy: s1.y, fov: CAM_C1.fov },
      { f: go, pos: CAM_C1.pos, at: [BASE.x, HEAD, BASE.z], sx: s1.x, sy: s1.y, fov: CAM_C1.fov },
      { f: go + 20, pos: [0.0, 1.5, 2.0], at: headAt, sx: 520, sy: 880, fov: 58 },
      { f: arrive + 4, pos: CAMB, at: headAt, sx: 285, sy: 930, fov: 54 },
      { f: got - 6, pos: CAMB, at: [BURN.x, HEAD, BURN.z], sx: 285, sy: 930, fov: 54 },
      { f: got + 10, pos: CAMS, at: [BURN.x, HEAD, BURN.z], sx: 770, sy: 850, fov: 54 },
      { f: thrown, pos: CAMS, at: [BURN.x, HEAD, BURN.z], sx: 770, sy: 850, fov: 54 },
      { f: land, pos: [1.21, 1.5, 2.81], at: [BURN.x, HEAD, BURN.z], sx: 770, sy: 840, fov: 54 },
    ];
    const camera = shotCam("office", f, keys, { mood: "calm", amp: 0.6, walk: [[S.from, 0], [go, 0], [go + 6, 0.5], [arrive, 0.5], [arrive + 6, 0], [got - 6, 0], [got, 0.3], [got + 10, 0]] });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // ---------------------------------------------------------------------------------------------- 月老
    const front = faceTo(at, camP), atBurner = f >= arrive;
    const listen = ky(f, [[arrive + 2, 0], [arrive + 10, 1], [got - 4, 1], [got + 6, 0]]);     // turned a little to the smoke
    const facing = moving ? leg.facing : turnTo(front, faceTo(BURN, SMOKE), 0.38 * listen);
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z), hangR = hang(at, facing, 0), hangL = hang(at, facing, 1);
    const sag = ky(f, [[S.from, 1], [puff + 2, 1], [puff + 8, 0]]), pointK = ky(f, [[urgent - 5, 0], [urgent + 2, 1], [d02 - 4, 1], [d02 + 6, 0]]);
    const worryK = ky(f, [[d02 + 8, 0], [d02 + 18, 1], [notUp + 6, 1], [notUp + 12, 0]]), alarm = ky(f, [[notUp + 8, 0], [notUp + 14, 1], [fall - 2, 1], [fall + 4, 0]]);
    const lensPt = camP.clone().add(v3(camera.look).sub(camP).normalize().multiplyScalar(0.16)).add(V(0, -0.02, 0));
    const K0: [number, THREE.Vector3][] = [
      [got - 8, hangR], [got, H(-0.08, 0.88, 0.33)], [d04 - 3, H(-0.08, 0.88, 0.33)], [d04 + 4, H(-0.25, 1.2, 0.3)], [her - 1, H(-0.25, 1.2, 0.3)], [her + 3, H(-0.25, 1.23, 0.31)],
      [her + 9, H(-0.25, 1.2, 0.3)], [d05 - 10, H(-0.25, 1.2, 0.3)], [d05 - 3, H(-0.03, 0.8, 0.2)], [d05 + 2, H(-0.03, 0.8, 0.2)],
      [d05 + 11, H(-0.12, 0.96, 0.3)], [follow, H(-0.12, 0.96, 0.3)], [follow + 9, H(-0.22, 0.7, 0.02)], [thrown - 4, H(-0.22, 0.7, 0.02)], [thrown, H(-0.13, 1.0, 0.36)], [thrown + 10, H(-0.1, 0.92, 0.32)],
    ];
    const K1: [number, THREE.Vector3][] = [
      [got - 8, hangL], [got, H(0.08, 0.88, 0.33)], [d04 - 3, H(0.08, 0.88, 0.33)], [d04 + 4, hangL], [her - 8, hangL], [her - 1, H(0.19, 0.96, 0.25)],
      [tonight - 2, H(0.19, 0.96, 0.25)], [tonight + 3, H(0.2, 0.9, 0.2)], [must - 2, H(0.2, 0.9, 0.2)], [must + 2, H(0.21, 1.0 , 0.22)], [must + 7, H(0.2, 0.9, 0.2)], [d05 - 6, H(0.2, 0.9, 0.2)], [d05 + 2, hangL], [follow, hangL], [follow + 8, H(0.24, 0.96, 0.2)], [thrown + 10, H(0.24, 0.96, 0.2)],
    ];
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined = moving ? undefined
      : f >= got - 8 ? [through(f, K0), through(f, K1)]
      : alarm > 0.02 ? flail(w, at, facing, f, alarm, 0.3, 1.0) as [THREE.Vector3, THREE.Vector3]
      : pointK > 0.02 ? [null, hangL.clone().lerp(H(0.31, 0.98, 0.14), smooth(pointK))]
      : worryK > 0.02 ? wring(at, facing, f, worryK, 0.68) as [THREE.Vector3, THREE.Vector3] : undefined;
    const faces: MoodKey[] = [
      [S.from, "lost"], [puff + 5, "wonder", "take", 0.7], [d01 - 2, "shout"], [arrive + 2, "peer"], [urgent - 1, "shout", "take", 0.6], [d02 + 8, "look"],
      [thirty + 6, "worry"], [overtime + 12, "sheepish"], [nobody + 14, "wry"], [d03 + 6, "worry"], [notUp + 12, "panic", "take"], [fall + 2, "peer"],
      [d04 - 2, "resolve"], [her - 4, "peer"], [her + 12, "eager"], [tonight - 2, "shout"], [d05 - 3, "eager"], [follow - 2, "proud"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces, pose: moving ? leg.pose : undefined, hands,
      lookDown: 10 * sag + (f >= her - 6 && f < her + 12 ? 10 : 0) - 8 * ky(f, [[fall, 0], [fall + 4, 1], [got - 2, 1], [got + 2, 0]]),
      gaze: f < puff + 4 ? undefined : f < go ? 1 : atBurner && f < got - 6 && !(f >= d01 - 4 && f < d02 - 6) ? gazeSide(w, at, SMOKE) : f >= her - 6 && f < her + 10 ? 0 : undefined,
      lean: { pitch: 6 * sag - 6 * ky(f, [[follow + 2, 0], [follow + 9, 1], [thrown - 3, 1], [thrown + 2, -1.2], [thrown + 10, 0]]) },
      head: { dy: -0.06 * sag + 0.05 * hit(f, d04, 8) + 0.06 * hit(f, must, 7), tilt: 6 * listen * (f < got - 6 ? 1 : 0) },
    });
    // ---------------------------------------------------------------------------------------------- the vision in the smoke
    // She kneels in her cloud (it hides her shins), palms together before her chest, begging with them (拜拜) and rocking
    // in small bows; on 不起来了 she bows right down, hands to the cloud. Then she is drawn up the smoke and gone: the
    // slip falls out of the same wisp.
    // (She is solved full size and scaled about her feet: the hands' offsets from her are full-size offsets.)
    const seen = f >= d02 - 7 && f < fall + 2, gone = smooth((f - (fall - 7)) / 8);
    let ma: ReturnType<typeof act> | null = null;
    const MS = 0.42, bob = 0.012 * Math.sin(f * 0.11), mAt = SMOKE.clone().add(V(0, 0.98 + bob, 0));
    if (seen) {
      const mFace = faceTo(SMOKE, BURN) * 0.62 + faceTo(SMOKE, camP) * 0.38;
      const down = ky(f, [[notUp + 6, 0], [notUp + 14, 1]]), pray = 0.5 + 0.5 * Math.sin(f * 0.21), beg = Math.sin(f * 0.85), bow = Math.max(down, 0.3 * pray * (f < d03 - 4 ? 1 : 0.3));
      const mh = (dx: number, y: number, z: number) => rel(mAt, mFace, dx, y, z);
      // (the palms meet below her chin, clear of her head's outline: a hand inside that outline is not drawn)
      const palm = (side: number) => mh(0.026 * side, 0.8 + 0.05 * beg * (1 - down) - 0.08 * bow - 0.26 * down, 0.21 + 0.03 * bow + 0.15 * down);
      ma = act(w, f, MAMA_MINI, {
        at: mAt, facing: mFace,
        faces: [[S.from, "beg"], [overtime - 2, "grumble"], [nobody - 2, "wail"], [d03 - 2, "shout"], [notUp + 10, "resolve"]],
        hands: [palm(-1), palm(1)], armFront: [true, true],
        lean: { pitch: 6 + 30 * bow }, lookDown: 26 * bow, talkGaze: 0,
        head: f < d02 - 3 ? VERBS.accent("pop", f, d02 - 7) : undefined,
      });
      w.prop("cloud").put(mAt.clone().add(V(0, 0.115 + 0.3 * gone, 0)), { yaw: 0.3, scale: 1 - 0.92 * gone });
    }
    w.update();
    if (ma && gone > 0.001) {
      // drawn up into the smoke: she shrinks toward a point over her head (the wisp the slip falls from) and rises with it
      const k = MS * (1 - 0.94 * gone), c = mAt.clone().add(V(0, 0.8 * MS + 0.42 * gone, 0)), cl = mAt.clone().add(V(0, 0.8, 0));
      ma.group.scale.setScalar(k); ma.group.position.copy(c.sub(cl.multiplyScalar(k)));
    }
    // ---------------------------------------------------------------------------------------------- the slip, the spool
    if (f >= fall && f < got) {
      const u = (f - fall) / (got - fall), from = SMOKE.clone().add(V(0, 1.5, 0)), to = r.handWorld(0).clone().lerp(r.handWorld(1), 0.5).add(V(0, -0.12, 0)), p = from.lerp(to, smooth(u));
      w.prop("slip").put(p.add(V(0.06 * Math.sin(u * 9), 0, 0)), { yaw: facing, roll: 0.5 * Math.sin(u * 8) * (1 - u), pitch: -0.3 * Math.sin(u * 5) * (1 - u), scale: 0.25 + 0.75 * smooth((f - fall + 1) / 4) });
    } else if (f >= got && f < d05 - 3) {
      // it lands in both hands, then his right hand raises it beside the beard and keeps it up through the line, holding it
      // by its TOP edge (the slip's origin is its foot and its 缘 sits near the foot: a mitten there would cover it; the
      // mitten just overlaps the top edge, clear of 求). The hand-over blends, never jumps.
      const oneK = smooth(ky(f, [[d04 - 3, 0], [d04 + 3, 1]]));
      const tuck = 1 - 0.85 * smooth((f - (d05 - 8)) / 5);   // into the front of his robe: it shrinks up into his fingers
      const two = r.handWorld(0).clone().lerp(r.handWorld(1), 0.5).add(V(0, -0.12, 0)), one = r.handWorld(0).clone().add(V(0, -0.32 * tuck, 0));
      w.prop("slip").put(two.lerp(one, oneK).add(V(Math.sin(facing), 0, Math.cos(facing)).multiplyScalar(0.015)), { yaw: facing, pitch: -0.15, scale: tuck });
    }
    // the spool: out of his robe, shown, thrown underhand at her lens, its thread paying out behind it from his fingers
    if (f >= d05 + 2 && f < thrown) inHand(w, "spool", r, 0, { dy: -0.03, yaw: facing });
    else if (f >= thrown) {
      const u = Math.min(1, (f - thrown) / (land - thrown)), from = r.handWorld(0), p = from.clone().lerp(lensPt, u); p.y += 0.16 * 4 * u * (1 - u);
      w.prop("spool").put(p, { yaw: facing + 7 * u, pitch: 1.3 + 9 * u });
      w.props.thread("pay", droop(from, p, 0.05 + 0.1 * u, FLAT, { n: 8 }), { r: 0.006 });
    }
    cabinetMess(w, f);
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [orderSlip(f, { from: d04 + 6, to: d05 - 4, x: 322, y: 556, s: 0.8 })];
    const cover = ky(f, [[land - 4, 0], [land, 0.85], [land + 2, 1]]);
    return { camera, overlays: [draw(f, FX), spoolLens(cover)], shown: FX, post: { bloom: 0.5 } };
  },
};
/** which way the eyes go to look at a world point (screen side) */
const gazeSide = (w: { project(p: THREE.Vector3): { x: number; y: number } }, at: THREE.Vector3, to: THREE.Vector3) => (w.project(to.clone().setY(1.2)).x > w.project(at.clone().setY(1.2)).x ? 1 : -1);
