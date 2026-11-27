// SCENE I · 22:55, the same step (no cut from H: fifteen silent minutes run off the clock). THE FIX HE DID NOT MAKE.
// He reaches for the knot he dropped, and under it lies another thread: old, faded, dusty, not one of his. He lifts it;
// she gets up and follows it with her lens: off the step, across the pavement, to the ankle of the delivery rider by
// his scooter. 「我急什么呢。」 The door opens behind him: 小满 is going home. The rider comes over (又加班啊？ 今天给你
// 多加了个蛋), and she asks his name. The old thread lights up gold from her ankle to his, the target is met, its
// slack runs in until it is one line between two ankles. He leaps off his step, his knot flies over his shoulder, and
// he RUNS UP TO HER LENS to claim it; the reporter points out it was there already; he leans in: file it as 缘分已到.
// CAMERA PLAN (her eyes, one take; 30 s, eight moves; from his leap on she does not move at all: he comes to her):
//   等等         LOOK AT him glancing down beside him              H's frame                                 still (the clock runs)
//   这根线       the knot lifted, the old thread under it          close, down on the step                   a snap down with his look
//   早就在这儿   the thread, then whose ankle it ends on           she stands up and FOLLOWS it              ONE continuous follow, a tilt up to the rider
//   我急什么呢   him, easy now; the door opening behind him        medium, him left, the door right          back to him: the speaker
//   又加班啊     her coming down the steps, the rider coming over  medium two-shot from the kerb             she backs off with 小满: someone arrives
//   你叫什么     her face, his                                     close two-shot (snap, 0.72)               lands on 你叫
//   (gold)       the thread between two ankles: alight, drawn in   close on their feet (a tilt down, 0.64)    the thing changes: her lens goes to it
//   成了         him leaping off his step, the knot in the air     WIDE: all three, the pavement empty       back wide: the place does it
//   快记…已到    HIM, running up to the lens; the two behind       the same WIDE, held                       none: the lead comes to the lens
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, hit, win, shotCam, through, turnTo, faceTo, VERBS, type ShotKey } from "./kit";
import { act, YL, XM, QS, type MoodKey } from "./act";
import { stamp, draw, type Fx } from "./fx";
import { anklet, knotAt, bowKnot } from "./thread";
import { STAND_AT, stepSeat, STEP, WAY_OUT, COIL_AT, BY_SCOOTER, stairs, oldLine, oldCol } from "./night";
import { CAM_H, HEAD_H, END_H } from "./segH";

const S = seg("I"), HALF = Math.PI / 2;
/** where she stands once she has got up to follow the thread; where she backs off to, at the kerb */
export const CF: [number, number, number] = [0.3, 1.3, 0.2], C2: [number, number, number] = [0.25, 1.5, 3.2];
/** where the rider comes to, where she stops at the foot of the steps, where 月老 comes up to the lens, where his knot lands */
export const MEET_R = P("street", 1.33, 0, -1.5), HER_FOOT = P("street", 0.58, 0, -1.7), FRONT = P("street", 0.05, 0, 1.1), KNOT_END = P("street", -0.55, 0.51, -3.1);
/** the wide frame the scene ends on (and scene J begins in) */
export const TAB = { pos: C2, at: [0.33, 1.0, -1.75] as [number, number, number], sx: 540, sy: 755, fov: 62 };
const HER_DOWN = [...WAY_OUT, P("street", 0.45, 0.51, -3.0), ...stairs(0.55, 0.5).reverse(), HER_FOOT], HER_PACE = 1.25, RUN = 3.2;
const RIDER_FACE = -1.3, TO_HER = [BY_SCOOTER, MEET_R], TO_LENS = [STAND_AT, FRONT];
/** the old thread from the knot to the rider's ankle, as her lens follows it */
const TRACE = [COIL_AT.clone().add(V(0, 0.03, 0)), P("street", -0.36, 0, -1.86), P("street", 0.0, 0, -1.5), P("street", 1.0, 0, -1.25), P("street", 1.8, 0, -1.08), P("street", 2.24, 0.07, -0.95)];
/** a point u (0..1) of the way along a run of points, by length */
const along = (pts: THREE.Vector3[], u: number): THREE.Vector3 => {
  const ds = [0];
  for (let i = 1; i < pts.length; i++) ds.push(ds[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const d = Math.max(0, Math.min(1, u)) * ds[ds.length - 1];
  let j = 1; while (j < pts.length - 1 && ds[j] < d) j++;
  return pts[j - 1].clone().lerp(pts[j], (d - ds[j - 1]) / Math.max(1e-6, ds[j] - ds[j - 1]));
};
const lerp3 = (a: readonly number[], b: readonly number[], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const SEG: Segment = {
  id: "I", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    const i01 = startOf("I01"), thisOne = wordAt("I01", "这"), notMine = wordAt("I01", "不"), x01 = endOf("I01"), i02 = startOf("I02"), x02 = endOf("I02"), i03 = startOf("I03"), x03 = endOf("I03");
    const i04 = startOf("I04"), today = wordAt("I04", "今"), egg = wordAt("I04", "蛋"), x04 = endOf("I04"), ask = wordAt("I05", "你"), x05 = endOf("I05");
    const i06 = startOf("I06"), quick = wordAt("I06", "快"), mineA = wordAt("I06", "全") - 29, mineB = wordAt("I06", "全"), x06 = endOf("I06"), i07 = startOf("I07"), i08 = startOf("I08"), thisLine = wordAt("I08", "这"), fate = wordAt("I08", "缘"), come = wordAt("I08", "到"), x08 = endOf("I08");
    // the business on the step: he looks; lifts the knot; hands it to his other hand; pinches the old thread and lifts it
    const see = i01 - 4, reach0 = i01 + 8, atKnot = i01 + 22, lifted = thisOne + 8, passed = lifted + 10, pinch0 = notMine - 8, pinched = notMine + 2, raised = pinched + 12, letGo = x02 + 10;
    // her lens follows the thread; she comes back to him; the door; her way down; the rider's way over
    const fol0 = i02 - 2, fol1 = fol0 + 64, doorOpen = x03 - 18, out0 = x03 - 24, out1 = out0 + Math.ceil(VERBS.walkTime(HER_DOWN, HER_PACE) * 30);
    const rgo = i04 - 8, rthere = rgo + Math.ceil(VERBS.walkTime(TO_HER, 1.4) * 30);
    // gold: it lights from her ankle to his; its slack runs in; he leaps, his knot flies; he runs to the lens
    const gold0 = x05 + 10, gold1 = gold0 + 12, pull0 = gold1 + 1, pull1 = pull0 + 12, leap0 = pull1 + 8, up = leap0 + 8, run0 = up + 2, arrive = run0 + Math.ceil(VERBS.walkTime(TO_LENS, RUN) * 30);
    const caught = i07 + 14, hug0 = i04 + 16;
    const doorK = ky(f, [[doorOpen, 0], [doorOpen + 12, 1], [out0 + 74, 1], [out0 + 88, 0]]);
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", doorK); w.set.param("lit", 0.35); w.set.param("moon", 0.8);
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- the camera
    const fu = smooth((f - fol0) / (fol1 - fol0)), posF = () => lerp3(CAM_H, CF, smooth((f - fol0) / (fol1 - fol0 - 16))), atF = () => along(TRACE, fu);
    const FIND = { pos: CAM_H, at: [-0.42, 0.2, -2.2], sx: 540, sy: 1000, fov: 34 }, RIDER = { pos: CF, at: [2.3, 0.95, -1.0], sx: 560, sy: 860, fov: 46 }, EASY = { pos: CF, at: HEAD_H, sx: 400, sy: 840, fov: 44 };
    const TWO = { pos: C2, at: [0.96, 1.18, -1.6], sx: 540, sy: 760, fov: 46 }, SNAP = { pos: C2, at: [0.96, 1.2, -1.6], sx: 540, sy: 760, fov: 33 }, FEET = { pos: C2, at: [0.975, 0.1, -1.6], sx: 540, sy: 990, fov: 21 };
    const keys: ShotKey[] = [
      { f: S.from, ...END_H }, { f: i01 + 14, ...END_H }, { f: i01 + 24, ...FIND },
      { f: fol0, pos: posF, at: atF, sx: 540, sy: 1000, fov: 34 }, { f: fol1, pos: posF, at: atF, sx: 540, sy: 1060, fov: 46 },
      { f: fol1 + 14, ...RIDER }, { f: x02 + 6, ...RIDER }, { f: i03 - 8, ...EASY }, { f: x03 + 4, ...EASY },
      { f: i04 + 8, ...TWO }, { f: ask - 5, ...TWO }, { f: ask, ...SNAP }, { f: x05 + 2, ...SNAP }, { f: x05 + 9, ...FEET }, { f: pull1 - 2, ...FEET }, { f: pull1 + 5, ...TAB }, { f: S.to, ...TAB },
    ];
    const camera = shotCam("street", f, keys, { mood: "calm", amp: ky(f, [[S.from, 0.22], [i01 + 14, 0.22], [fol0, 0.4]]), walk: [[fol0, 0], [fol0 + 10, 0.4], [fol1 - 20, 0.4], [fol1 - 8, 0], [x03 + 4, 0], [x03 + 12, 0.5], [i04 - 2, 0.5], [i04 + 8, 0]] });
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    const seatAt = STEP.top.clone().setY(0), SH = (dx: number, y: number, z: number) => rel(seatAt, 0, dx, y, z);
    const leapK = smooth((f - leap0) / 8), seated = f < up, run = walkAlong(TO_LENS, RUN, (f - run0) / 30), lensYaw = faceTo(FRONT, P("street", C2[0], 0, C2[2]));
    const running = !seated && f >= run0 && run.moving;
    const at = seated ? seatAt : f < run0 ? STAND_AT : run.at, facing = seated ? 0 : f < run0 ? faceTo(STAND_AT, FRONT) : running ? run.facing : lensYaw;
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z);
    // his head and shoulders: to the knot beside him; along the thread; easy; over his shoulder at the door; on the two
    const twist = seated ? ky(f, [[S.from, 0.35], [see, 0.35], [see + 10, 0.7], [x02, 0.7], [i03 - 14, 0.35], [doorOpen + 6, 0.35], [doorOpen + 18, 1.0], [out0 + 70, 1.0], [i04 + 10, 0.85], [leap0, 0.85]]) : undefined;
    const lookDown = seated ? ky(f, [[S.from, 13], [see, 13], [see + 10, 19], [x01, 19], [x02, 10], [i03 - 10, 2], [doorOpen, 0], [leap0, 0]]) : f >= arrive - 6 ? -8 * smooth((f - (arrive - 6)) / 8) : 0;
    const PINCH = COIL_AT.clone().add(V(0, 0.012, 0)), knee = (s: number) => SH(0.1 * s, 0.42, 0.26), pinchH = 0.14 * smooth((f - pinched) / (raised - pinched)) * (1 - smooth((f - letGo) / 12));
    // SEATED. his left hand: to the knot; up with it; across to his right hand; back down to the thread; lifts it; then to his
    // beard (easy now); then both hands hold the knot to his chest while he watches the two
    const strokeK = win(f, i03 - 12, doorOpen + 10, 10, 10), su = (f % 38) / 38, down = su < 0.62 ? smooth(su / 0.62) : 1 - smooth((su - 0.62) / 0.38);
    const hugK = smooth((f - hug0) / 12), tremble = 0.006 * Math.sin(f * 1.3) * smooth((f - ask) / 10);
    const seatL = through(f, [[reach0, knee(1)], [atKnot, COIL_AT.clone().add(V(0, 0.09, 0))], [thisOne - 2, COIL_AT.clone().add(V(0, 0.09, 0))], [lifted, SH(0.24, 0.5, 0.16)], [passed, SH(0.04, 0.5, 0.25)], [pinch0, SH(0.22, 0.46, 0.14)], [pinched, PINCH.clone().add(V(0, 0.02, 0))], [letGo, PINCH.clone().add(V(0, 0.02, 0))], [letGo + 14, knee(1)]])
      .add(V(0, pinchH, 0)).lerp(SH(0.135, 0.63 - 0.11 * down, 0.2), strokeK).lerp(SH(0.075, 0.53 + tremble, 0.27), hugK);
    const seatR = through(f, [[lifted, knee(-1)], [passed, SH(-0.05, 0.5, 0.25)], [passed + 10, SH(-0.06, 0.46, 0.27)]]).lerp(SH(-0.075, 0.53 - tremble, 0.27), hugK);
    // ON HIS FEET. arms flung up as he leaps and runs (成了！快记！); 我绑的！ fists on his hips; 全是我绑的！ his right fist at
    // the sky, twice; caught: it sinks; 咳…这句: a hand cupped beside his mouth, on the side of the two (they must not hear)
    const shake = (0.05 + 0.04 * win(f, quick - 2, quick + 14, 3, 6)) * Math.sin(f * 0.9), upY = 0.93 + 0.37 * leapK;
    const hip = (s: number) => H(0.21 * s, 0.73, 0.05), cup = H(0.21, 1.04, 0.2), sky = H(-0.26, 1.3 + 0.06 * (hit(f, mineB, 7) + hit(f, mineB + 13, 7)), 0.1);
    const standL = through(f, [[leap0, seatL], [leap0 + 6, H(0.3, upY + shake, 0.1)], [arrive - 2, H(0.3, upY + shake, 0.1)], [mineA - 1, hip(1)], [caught + 12, hip(1)], [caught + 28, hang(at, facing, 1)], [thisLine - 9, hang(at, facing, 1)], [thisLine - 1, cup], [x08 + 4, cup], [x08 + 16, hang(at, facing, 1)]]);
    const standR = through(f, [[leap0, seatR], [leap0 + 6, H(-0.3, upY - shake, 0.1)], [arrive - 2, H(-0.3, upY - shake, 0.1)], [mineA - 1, hip(-1)], [mineB - 6, hip(-1)], [mineB, sky], [caught + 4, sky], [caught + 30, hang(at, facing, 0)]]);
    // (as they fly up the hands swing OUT round his head, not up through it)
    const flingOut = f >= leap0 && f <= leap0 + 6 ? 0.15 * Math.sin(Math.PI * smooth((f - leap0) / 6)) : 0;
    const hands: [THREE.Vector3, THREE.Vector3] = f < leap0 ? [seatR, seatL] : [standR.add(V(-flingOut, 0, 0)), standL.add(V(flingOut, 0, 0))];
    const faces: MoodKey[] = [
      [S.from, "quiet"], [see + 4, "look", "take", 0.5], [notMine - 3, "intent"], [i02 - 2, "wonder"], [i03 - 6, "wry"], [x03 + 2, "warm"], [doorOpen + 14, "look"], [hug0 + 4, "hope"], [today + 20, "eager"],
      [gold0 + 5, "joy", "take", 0.8], [quick - 3, "thrill"], [mineA - 4, "proud"], [caught, "caught", "take", 0.8], [i08 - 5, "ahem"], [thisLine - 4, "coax"], [x08 + 6, "fawn"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces, hands, lookDown, twist, turn: seated ? 1 : undefined, still: f < i03 - 10,
      seat: f < up ? stepSeat(leapK) : undefined, rise: f < up ? leapK : undefined,
      pose: running ? run.pose : undefined,
      gaze: seated ? (f < see ? -0.5 : f < i03 - 14 ? 0.5 : f < doorOpen + 6 ? 0 : 1) : f >= caught + 4 && f < i08 - 6 ? ky(f, [[caught + 4, 0], [caught + 10, -0.8], [caught + 20, -0.8], [caught + 26, 0.8], [i08 - 12, 0.8], [i08 - 6, 0]]) : 0,
      talkGaze: seated && f < i03 - 14 ? 0.5 : 0,
      lean: {
        pitch: seated ? ky(f, [[S.from, 6.6], [see, 6.6], [see + 10, 5], [i03 - 12, 5], [i03, 0], [hug0, 0], [hug0 + 12, 7], [leap0, 7]]) * (1 - leapK)
          : ky(f, [[run0, 7], [arrive - 4, 7], [arrive + 2, 0], [mineA - 2, 0], [mineA + 3, -5], [caught, -5], [caught + 8, 0], [i08 - 2, 0], [i08 + 4, 5], [i08 + 16, 1], [thisLine - 8, 1], [thisLine, 8], [x08 + 2, 8], [x08 + 14, 2]]),
        roll: seated ? 9 * win(f, reach0 + 4, lifted + 4, 8, 8) + 9 * win(f, pinch0, letGo + 8, 8, 10) : 0,
      },
      head: { dy: -0.028 * (1 - smooth((f - see) / 10)) + 0.035 * hit(f, quick, 8) + 0.03 * hit(f, mineB, 8) - 0.03 * hit(f, i08 + 3, 10) - 0.02 * hit(f, come, 8), tilt: 4 * win(f, thisLine - 2, x08 + 2, 8, 8) },
    });
    // ---------------------------------------------------------------------------------------------- the rider
    const legR = walkAlong(TO_HER, 1.4, (f - rgo) / 30), tugK = smooth((f - (pull1 - 9)) / 7), nearer = HER_FOOT.clone().sub(MEET_R).normalize().multiplyScalar(0.035 * tugK);
    const rAt = legR.at.clone().add(f >= rthere ? nearer : V()), rFace = legR.moving ? legR.facing : f < rgo ? RIDER_FACE : -HALF;
    const phoneK = 1 - smooth((f - (doorOpen + 16)) / 8), shyK = win(f, today - 4, x04 + 10, 8, 10) + win(f, x05 + 44, x05 + 96, 8, 12);
    const RH = (dx: number, y: number, z: number) => rel(rAt, rFace, dx, y, z);
    const rd = act(w, f, QS, {
      at: rAt, facing: rFace, pose: legR.moving ? legR.pose : phoneK > 0.5 ? { kind: "phone", t, amount: 0, arm: 1 } : undefined,
      hands: !legR.moving && phoneK <= 0.5 && shyK > 0.01 ? [null, hang(rAt, rFace, 1).lerp(RH(0.1, 1.1 + 0.012 * Math.sin(f * 0.9), -0.3), smooth(shyK))] : undefined,
      faces: [[S.from, "calm"], [doorOpen + 22, "look"], [i04 - 3, "smile"], [today - 3, "shy"], [x04 + 6, "smile"], [ask + 8, "look", "take", 0.5], [x05 + 8, "beam"]],
      talkGaze: 0, gaze: f >= rthere ? -1 : phoneK > 0.5 ? 0 : -0.5, lookDown: 11 * phoneK + 4 * smooth(shyK), turn: f >= rgo ? 0.55 : 0.75,
      lean: { pitch: 3 * tugK }, head: { tilt: 3 * smooth(shyK), dy: f > x05 + 30 ? 0.012 * Math.sin(f * 0.21) : 0 },
    });
    // ---------------------------------------------------------------------------------------------- 林小满
    let xm = null as ReturnType<typeof act> | null;
    if (f >= out0) {
      const legX = walkAlong(HER_DOWN, HER_PACE, (f - out0) / 30), xAt = legX.at.clone().sub(f >= out1 ? nearer : V()), xFace = legX.moving ? legX.facing : turnTo(legX.facing, HALF, smooth((f - out1) / 7));
      xm = act(w, f, XM, {
        at: xAt, facing: xFace, pose: legX.moving ? legX.pose : undefined,
        faces: [[out0, "tired"], [i04 + 8, "look"], [egg + 6, "shy", "take", 0.4], [ask - 3, "smile"], [x05 + 26, "beam"]],
        talkGaze: 0, gaze: f >= i04 + 8 ? 1 : undefined, lookDown: 9 * win(f, x04 + 4, ask - 6, 6, 6), turn: f >= out1 ? 0.4 * smooth((f - out1) / 7) : undefined,
        lean: { pitch: 3 * tugK }, head: { tilt: -2 * win(f, ask, x05 + 10, 5, 8), dy: f > x05 + 30 ? 0.012 * Math.sin(f * 0.17 + 1) : 0 },
      });
    }
    w.update();
    // ---------------------------------------------------------------------------------------------- the knot
    // on the old thread; in his left hand; in his right, in his lap; held to his chest; flung over his shoulder as he leaps
    {
      const inL = r.handWorld(1).add(V(0, -0.085, 0)), inR = r.handWorld(0).add(V(0, -0.07, 0)), both = r.handWorld(0).add(r.handWorld(1)).multiplyScalar(0.5).add(V(0, -0.05, 0.02));
      // (it goes up in his LEFT hand as his arms fly up, leaves that hand beside his head and sails back past his ear: never through him)
      const k1 = smooth((f - (thisOne - 2)) / 5), k2 = smooth((f - (passed - 3)) / 6), REL0 = leap0 + 5, fly = (f - REL0) / 23, REL = SH(0.3, 1.2, 0.11);
      if (fly <= 0) w.prop("tangle", "his").put(COIL_AT.clone().lerp(inL, k1).lerp(inR, k2).lerp(both, hugK).lerp(r.handWorld(1).add(V(0.02, 0.07, 0)), smooth((f - leap0) / 3)), { yaw: 1.5 + 0.8 * k2 });
      else {
        const u = Math.min(1, fly), bounce = fly > 1 && fly < 1.3 ? 0.06 * Math.sin(((fly - 1) / 0.3) * Math.PI) : 0;
        w.prop("tangle", "his").put(REL.clone().lerp(KNOT_END, u).add(V(0.1 * Math.sin(Math.PI * Math.min(1, u / 0.45)), 4 * 1.0 * u * (1 - u) + bounce, 0)), { yaw: 2.3 + 9 * u, roll: 6 * u });
      }
    }
    if (phoneK > 0.5) w.prop("phone", "rider").put(rd.handWorld(1).add(V(0, 0.035, 0)), { yaw: rFace, pitch: -0.5 });
    // ---------------------------------------------------------------------------------------------- the old thread
    const gold = ky(f, [[gold0, 0], [gold1, 1]]), tightK = smooth((f - pull0) / (pull1 - pull0)), clean = smooth((f - pinched) / 14);
    const ankHis = rd.footWorld(1).add(V(0, 0.07, 0)), ankHer = xm ? xm.footWorld(0).add(V(0, 0.07, 0)) : null, outside = !!xm && xm.group.position.z > -3.55;
    const inHis = V(-1, 0, 0.3), inHer = V(1, 0, 0.3), knotHis = knotAt(ankHis, inHis, 0.026), knotHer = ankHer && outside ? knotAt(ankHer, inHer, 0.026) : undefined;
    oldLine(w, gold, { ends: { her: knotHer, his: knotHis }, lit: gold, clean, lift: pinchH > 0.001 ? { at: PINCH, h: pinchH } : undefined, tight: knotHer && tightK > 0 ? { a: knotHer, b: knotHis, k: tightK } : undefined });
    const tie = (key: string, ank: THREE.Vector3, inward: THREE.Vector3, g: number) => {
      const o = { r: 0.0055 + 0.001 * g, closed: true, col: oldCol(g, clean), glow: 0.02 + 0.1 * clean + 0.88 * g };
      w.props.thread(key + "a", anklet(ank, 0.026, 0.25, 0.4), o); w.props.thread(key + "b", bowKnot(knotAt(ank, inward, 0.026), inward, 0.026), o);
    };
    tie("oh", ankHis, inHis, smooth((f - (gold1 - 3)) / 4)); if (ankHer && outside) tie("os", ankHer, inHer, smooth((f - gold0) / 4));
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [stamp(f, { from: x08 + 2, to: S.to - 3, x: 752, y: 490, px: 80, ok: true })];
    void x06; void rthere;
    return { camera, overlays: draw(f, FX), shown: FX, post: { bloom: ky(f, [[S.from, 0.35], [i01, 0.35], [fol0, 0.45]]) + 0.35 * gold } };
  },
};
