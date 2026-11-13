// SEGMENT A (frames 0-512), lines 1-6: THE OWNER'S SAMPLE (STORYBOARD "Segment A"). WP7.
//   shot 1   line 1   THE HOOK (hookPose, shots/hook.ts): the envoy at E1 with the jade raised in one hand, the
//                     half-risen King of Qin waving both hands; the wind-up and THE FEINT on 撞; hud: false
//   shot 2   line 2   the waving King of Qin large against the gold screen; tag 秦王; whip pan RIGHT out
//   shot 3   lines 3-4  the flashback: EARLIER and the sepia rewind; the King of Zhao with the jade; fifteen cities;
//                     the offer toward Qin (arrow 秦); the cities go ghost; he hugs it; the army; one eased move
//                     zhaoThrone -> zhaoKing (233-247) opens the left of the frame for the graphic layer
//   shot 5a  line 5   派谁去? (the 「?」); 没人: both ministers turn their backs (V1); the envoy and the eunuch walk in
//   shot 5b  lines 5-6  推了出来: the eunuch presents him (an open hand, a pat on the back: V7); two tags; 我去 (head
//                     pop, a half step); 城不来 (head shake); the king starts to lift the jade (the cut hides it: V2)
//   shot 6   line 6   on 5b's axis 1.7x: the jade at his chest, lifted to his chin; the stamp 完璧归赵; he turns
//                     toward Qin; whip pan LEFT out
// Every frame number is looked up (beats.ts HIT / TAG / shot(), segA_ov.ts T, cap / capWord); every mark and camera
// is layout.ts's. A shot is a pure function of f. The 2D layer of each shot is segA_ov.ts.
// RIG FIELDS ONLY (BIBLE 5): the storyboard's head movements in metres go through headM (head radii); a wince = blink
// + head down, a coil = tilt + head down, a shrink = head down; hands are pinned points; seated figures turn at most
// 20 deg and never lean.
import * as THREE from "three";
import type { Pose, Segment } from "../story";
import { SEGMENTS, FPS, lerp, lin, smooth, quote } from "../story";
import type { World } from "../world";
import { shot, HIT, type ShotDef } from "../beats";
import { CAMS, ZHAO } from "../layout";
import { holdPoints } from "../props";
import { PEOPLE } from "../people";
import { panic } from "../hud";
import {
  V, rel, lid, at, ky, path, accent, heads, headPx, headM, headPop, speak, frag, seated, walkAlong, alive,
  swaps, lerpA, whip, shotCam, kingShake, type RigState,
} from "./common";
import { hookPose, hookLin, hookKing, waveAmp, FEINT1 } from "./hook";
import { T, ov1, ov2, ov3, ov5a, ov5b, ov6 } from "./segA_ov";

type Extra = Partial<RigState>;
type Pose5 = NonNullable<RigState["pose"]>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[0];
const S1 = shot("1"), S2 = shot("2"), S3 = shot("3"), S5a = shot("5a"), S5b = shot("5b"), S6 = shot("6");
const slate = (s: ShotDef, more = "") => `${s.id} ${s.cam}${more ? " " + more : ""}`;
const px = (w: World, p: THREE.Vector3) => { const q = w.project(p); return { x: q.x, y: q.y }; };

// ====================================================================================================== line 1
/** the King of Qin's face in shot 1: shock (the thumbnail), nervous from the glint on 和氏璧 */
const KING1: [number, Expr][] = [[S1.from, "shock"], [HIT.glint1 + 1, "nervous"]];
/** shot 1 (0-107): THE HOOK. Frame 0 is the thumbnail: the two-row subtitle (Film.tsx), the settled tag, nothing
 *  else animating in; no source tag, no chip (hud: false) */
function shot1(w: World, f: number): Pose {
  const H = hookPose(w, f, S1.from, { feint: FEINT1, kingExpr: KING1 });
  const ov = [...H.overlays, ...ov1(f, { lin: H.linHead, king: H.kingHead, hands: H.hands, jade: H.jadePx })];
  const what = f < FEINT1.wind ? "the hold" : f < FEINT1.strike ? "the wind-up" : f < FEINT1.hit ? "the strike" : "the stop";
  return { camera: H.camera, hud: false, overlays: frag(...ov), slate: slate(S1, what) };
}

// ====================================================================================================== line 2
/** the King of Qin's face in shot 2: nervous throughout (the sweat on 直摆手, the stop on 是秦王) */
const KING2: [number, Expr][] = [[S2.from, "nervous"]];
/** shot 2 (108-171): the King of Qin large, on the hook's clock: the same wave and panic strokes (rule 12), a head-shake
 *  accent on 直摆手, the hands stop mid-air on 是秦王 (the tag pops), the gaze to the envoy and a swallow; the whip pan
 *  RIGHT on the last 4 frames. The envoy stands at the pillar as the hook left him (behind this camera). */
function shot2(w: World, f: number): Pose {
  const u = f - S1.from;                                             // THE HOOK'S CLOCK (rule 12)
  const camera = whip(CAMS.kingWave, f, T.whip1[0], T.whip1[1], 1, "out");
  w.setPlace("hall");
  w.setCamera(camera);
  const L = hookLin(f, u, FEINT1);
  w.actor(PEOPLE.linRage).set({ ...L.state, turn: 1 });            // behind this camera: keep his true facing (as in the hook)
  const king = w.actor(PEOPLE.qinWang);
  const amp = waveAmp(f, FEINT1) * (1 - smooth(lin(f, T.stop2 - 1, T.stop2 + 2)));
  const gulp = f >= T.gaze2 && f < T.gaze2 + 6 ? { dy: headM(-0.01) * Math.sin((Math.PI * (f - T.gaze2)) / 6) } : undefined;
  king.set(hookKing(king, f, u, amp, KING2, FEINT1, {
    gaze: f >= T.gaze2 ? 1 : 0,
    head: heads(kingShake(u, amp), accent("shake", f, T.shake2, { amp: 1.2 }), gulp),
  }));
  w.update();
  w.prop("jade").put(L.hand, L.put);
  const hk = headPx(w, king), hands = [0, 1].map((i) => px(w, king.handWorld(i as 0 | 1)));
  const ov = [panic({ f, from: S1.from, out: T.stop2, pts: hands, key: `panic${S1.from}` }), ...ov2(f, { king: hk })];
  return { camera, overlays: frag(...ov), slate: slate(S2, f >= T.whip1[0] ? "whip right" : "") };
}

// ====================================================================================================== lines 3-4
/** the floor point under the Zhao king's seat (his body frame: rel(ZT, facing, x left, y WORLD height, z forward)) */
const ZT = V(ZHAO.seat.top.x, 0, ZHAO.seat.top.z);
/** the jade in shot 3, in his body frame (x, y world, z) with his facing: at rest in both hands (ZHAO.jade), lifted
 *  (这块玉), turned toward Qin (秦王开价), held out to the left (赵国给了), half back (城可能不来), hugged (不给).
 *  12 cm under ZHAO.jade (y 0.80): there, in zhaoKing, the disc covered his mouth and beard (86-139 px into his head) */
const J3: [number, [number, number, number], number][] = [
  [S3.from, [0, 0.68, 0.33], 0],
  [T.lift, [0, 0.68, 0.33], 0], [T.lift + 6, [0, 0.72, 0.33], 0],
  [HIT.chipZhao, [0, 0.72, 0.33], 0], [HIT.chipZhao + 6, [0, 0.72, 0.33], -0.14],
  [HIT.offer, [0, 0.72, 0.33], -0.14], [HIT.offer + 7, [0, 0.75, 0.38], -0.30],
  [HIT.ghost, [0, 0.75, 0.38], -0.30], [HIT.ghost + 6, [0, 0.735, 0.355], -0.15],
  [HIT.hug, [0, 0.735, 0.355], -0.15], [HIT.hug + 6, [0, 0.74, 0.25], 0.12],
];
const zhaoJade3 = (f: number) => {
  const k = (i: number) => ky(f, J3.map(([a, v]) => [a, v[i]] as [number, number]));
  const fc = ky(f, J3.map(([a, , y]) => [a, y] as [number, number]));
  return { c: rel(ZT, fc, k(0), k(1), k(2)), fc };
};
const ZEXPR3: [number, Expr][] = [[S3.from, "smile"], [HIT.chipZhao, "relief_open"], [HIT.offer, "smile"], [HIT.ghost, "nervous"], [HIT.hug, "huff"], [HIT.army, "shock"]];
/** shot 3 (172-325): the King of Zhao on his 榻 with the jade in both hands (pair grip); the camera arrives yawing in
 *  from the left (the whip, 172-175) and makes its one eased move to zhaoKing (233-247) */
function shot3(w: World, f: number): Pose {
  const camera = whip(shotCam(S3, f), f, T.whip1[2], T.whip1[3], 1, "in");
  w.setPlace("zhao");
  w.setCamera(camera);
  const J = zhaoJade3(f), t = f / FPS, king = w.actor(PEOPLE.zhaoWang);
  const hands = holdPoints("jade", J.c, { grip: "pair", rot: J.fc });
  king.set({
    ...seated(ZHAO.seat, t, { facing: J.fc }), hands: [hands[0], hands[1]],
    expr: at(f, ZEXPR3), blink: lid(t, 11, swaps(ZEXPR3)),
    gaze: at(f, [[S3.from, 0], [HIT.chipZhao, -1], [HIT.ghost, 0], [HIT.hug, 1], [HIT.army, 0]]),
    lookDown: ky(f, [[S3.from, 14], [HIT.chipZhao - 2, 14], [HIT.chipZhao + 2, 0]]),
    head: heads(accent("pop", f, HIT.chipZhao, { amp: 0.7 }), accent("nod", f, HIT.offer),
      { tilt: ky(f, [[HIT.hug, 0], [HIT.hug + 5, 6], [HIT.army, 6], [HIT.army + 4, 2]]), dy: headM(-0.03) * smooth(lin(f, HIT.army, HIT.army + 4)) }),
    visible: true,
  });
  w.update();
  w.prop("jade").put(J.c, { grip: "pair", rot: J.fc });
  const ov = ov3(f, { king: headPx(w, king), jade: px(w, J.c) });
  const what = f < S3.move![1] ? "zhaoThrone" : f <= S3.move![2] ? "move" : "zhaoKing";
  return { camera, overlays: frag(...ov), slate: slate(S3, what) };
}

// ====================================================================================================== line 5
/** the envoy's walk in (5a) and his step forward (5b) on one clock (rule 12): from the right edge to linStop on the
 *  downstage lane (1.24 m/s, 363-404: his head a row under the ministers', so he never covers a face), a beat, then
 *  from linStep on to ZHAO.lin as the eunuch puts him forward (407-411; the cut cheats him upstage: the ministers are
 *  not in 5b); 我去: a half step (0.12 m) toward the king (443) */
const LIN_IN = [ZHAO.linFrom, ZHAO.linStop], LIN_V = 1.24;
const STEP_V = 1.31, LIN_FACE = -0.35, LIN_KING = -0.75;
/** the half step of 我去: 0.12 m forward, toward the front of the stage along zhaoPush's axis (he stays on 5b's and 6's
 *  shared axis, so the axial cut keeps his head x: rule 3), his facing still toward the king */
const PUSH_AXIS = V(CAMS.zhaoPush.pos[0] - CAMS.zhaoPush.look[0], 0, CAMS.zhaoPush.pos[2] - CAMS.zhaoPush.look[2]).normalize();
const LIN_HALF = ZHAO.lin.clone().addScaledVector(PUSH_AXIS, 0.12);
const linLeg = (f: number) => {
  if (f < HIT.present) return walkAlong(LIN_IN, LIN_V, (f - HIT.walkIn) / FPS, { startFacing: -Math.PI / 2 });
  if (f < HIT.iGo) {
    const leg = walkAlong([ZHAO.linStep, ZHAO.lin], STEP_V, (f - HIT.present) / FPS, { endFacing: LIN_FACE });
    if (leg.arrived) leg.facing = lerpA(leg.facing, LIN_KING, smooth(lin(f, T.turnKing, T.turnKing + 6)));
    return leg;
  }
  return walkAlong([ZHAO.lin, LIN_HALF], 1.0, (f - HIT.iGo) / FPS, { startFacing: LIN_KING, endFacing: LIN_KING });
};
/** the eunuch beside him, a step behind on the way in (0.58 m: their big heads are 0.47 m across), at his pace on
 *  the same lane (ZHAO.miaoFrom -> miaoWait), so he waits beside him when the envoy stops; in 5b he stands on
 *  ZHAO.miao from 407 (his head inside the frame: walking up to it he faced along the step and was 20 % out) */
const MIAO_FACE = -0.6;
const miaoLeg = (f: number): { at: THREE.Vector3; facing: number; pose: Pose5 } => f < HIT.present
  ? walkAlong([ZHAO.miaoFrom, ZHAO.miaoWait], LIN_V, (f - HIT.walkIn) / FPS, { startFacing: -Math.PI / 2, endFacing: MIAO_FACE })
  : { at: ZHAO.miao.clone(), facing: MIAO_FACE, pose: { kind: "idle", t: (f - HIT.present) / FPS + 0.3 } };
/** where the eunuch's right hand hangs when he stands idle (measured, his body frame): a pinned gesture starts and
 *  ends here, so nothing jumps when the pin is let go (hang() is Hongmen's slimmer cast: inside his round robe) */
const MIAO_HANG: [number, number, number] = [-0.236, 0.605, 0.035];
/** the eunuch's right hand (hand 0; the whisk is in his left): it lifts open toward his retainer (404), pats his back
 *  (407-408: the back's right side, which follows him as he steps away), then opens toward the king, low and in front
 *  of his own chest (V7, 413-424: at head height behind the envoy it read as an arm round his shoulder), and drops
 *  to his side (free from 430) */
const miaoHand = (f: number, lin: { at: THREE.Vector3; facing: number }, me: { at: THREE.Vector3 }): THREE.Vector3 | null => {
  // let go a frame before it lands on MIAO_HANG (pinned exactly there, the arm found no clear swivel: 5.5 mm into his
  // robe; the free arm, 2 cm on, clears)
  if (f < T.handUp || f >= T.presentOut + 6) return null;
  const p = me.at, hangP = rel(p, MIAO_FACE, ...MIAO_HANG);
  const patOn = (l: { at: THREE.Vector3; facing: number }) => rel(l.at, l.facing, -0.1, 1.0, -0.1);
  const open = p.clone().add(V(-0.24, 0.9, 0.14));
  const toLin = p.clone().add(V(-0.24, 0.98, 0.08));
  if (f < HIT.present) return path(f, [[T.handUp, hangP], [HIT.present - 1, toLin]]);
  // the pat: on his back for 2 frames as he sets off (beyond that he steps out of the eunuch's reach), then away
  if (f <= HIT.present + 1) return patOn(lin);
  if (f > T.presentOut) return path(f, [[T.presentOut, open], [T.presentOut + 6, hangP]]);
  return path(f, [[HIT.present + 1, patOn(linLeg(HIT.present + 1))], [HIT.present + 6, open]]);
};
/** the King of Zhao in 5a: turned to the ministers (facing +0.3), his LEFT hand out toward them (派谁去), the jade
 *  standing on his right hand at his lap; the hand drops on 没人 (face deadpan) */
const Z5A = 0.3;
const zhao5a = (f: number) => {
  const lapR = rel(ZT, Z5A, -0.1, 0.65, 0.2), lapL = rel(ZT, Z5A, 0.096, 0.65, 0.195), out = rel(ZT, Z5A, 0.3, 0.85, 0.3);
  const left = f < HIT.noOne ? lapL.clone().lerp(out, smooth(lin(f, S5a.from, S5a.from + 6))) : out.clone().lerp(lapL, smooth(lin(f, HIT.noOne, HIT.noOne + 5)));
  return { hands: [lapR, left] as [THREE.Vector3, THREE.Vector3], jadeHand: lapR };
};
/** a Zhao minister in 5a: facing the king; 没人: a 2-frame snap to a true back view (turn: 1) landing on the word (V1);
 *  he turns round again to look, 3 frames before 门客, face nervous, eyes on the newcomers (screen left) */
const minister5a = (p: THREE.Vector3, f: number, id: number): Extra => {
  const back = Math.atan2(CAMS.zhaoWide.pos[0] - p.x, CAMS.zhaoWide.pos[2] - p.z) + Math.PI;
  const k = f < HIT.noOne - 2 ? 0 : f < HIT.noOne ? (f - (HIT.noOne - 2)) / 2 : f < T.lookBack - 2 ? 1 : f < T.lookBack ? 1 - (f - (T.lookBack - 2)) / 2 : 0;
  const t = f / FPS, after = f >= T.lookBack;
  return {
    at: p.clone(), facing: lerpA(ZHAO.minFacing, back, k), turn: k, pose: { kind: "idle", t: t + 0.41 * id },
    expr: after ? "nervous" : "neutral", blink: lid(t, id, [T.lookBack / FPS]), gaze: after ? -1 : 0, visible: true,
  };
};
/** shot 5a (326-406, zhaoWide, static): who will go? */
function shot5a(w: World, f: number): Pose {
  const camera = CAMS.zhaoWide;
  w.setPlace("zhao");
  w.setCamera(camera);
  const t = f / FPS, king = w.actor(PEOPLE.zhaoWang), Z = zhao5a(f);
  const kx: [number, Expr][] = [[S5a.from, "nervous"], [HIT.noOne, "deadpan"]];
  king.set({ ...seated(ZHAO.seat, t, { facing: Z5A }), hands: Z.hands, expr: at(f, kx), blink: lid(t, 11, swaps(kx)), gaze: 1, visible: true });
  const mA = w.actor(PEOPLE.zhaoMinA), mB = w.actor(PEOPLE.zhaoMinB);
  mA.set(minister5a(ZHAO.minA, f, 13));
  mB.set(minister5a(ZHAO.minB, f, 14));
  // the walkers wait off the right edge until 最后; hidden till then (from the lane their shadows fell into the frame)
  const L = linLeg(f), M = miaoLeg(f), on = f >= HIT.walkIn;
  const env = w.actor(PEOPLE.lin), miao = w.actor(PEOPLE.miaoXian);
  env.set({ at: L.at, facing: L.facing, pose: L.pose, expr: "cool", ...alive(t, 1), gaze: L.moving ? 0 : -1, visible: on });
  miao.set({ at: M.at, facing: M.facing, pose: M.pose, ...alive(t, 12), hands: [miaoHand(f, L, M), null], visible: on });
  w.update();
  w.prop("jade").put(Z.jadeHand, { grip: "rim", rot: Z5A });
  const ov = ov5a(f, { king: headPx(w, king), minA: headPx(w, mA), minB: headPx(w, mB) });
  return { camera, overlays: frag(...ov), slate: slate(S5a, f < HIT.noOne ? "who?" : f < HIT.walkIn ? "nobody" : "walk in") };
}

/** the King of Zhao in 5b: turned toward the envoy, the jade in both hands at his lap; relief on 我去; from 466 he
 *  lifts it toward the envoy (the cut hides the hand-over: V2) */
const Z5B = 0.25;
const zhaoJade5b = (f: number) => rel(ZT, Z5B, 0, lerp(0.74, 0.84, smooth(lin(f, T.kingLift, S5b.to + 2))), lerp(0.28, 0.36, smooth(lin(f, T.kingLift, S5b.to + 2))));
/** shot 5b (407-471, zhaoPush, static): 推了出来 and 我去 */
function shot5b(w: World, f: number): Pose {
  const camera = CAMS.zhaoPush;
  w.setPlace("zhao");
  w.setCamera(camera);
  const t = f / FPS;
  // ---- the King of Zhao
  const king = w.actor(PEOPLE.zhaoWang), jc = zhaoJade5b(f), jh = holdPoints("jade", jc, { grip: "pair", rot: Z5B });
  const kx: [number, Expr][] = [[S5b.from, "nervous"], [T.happy, "relief"]];
  king.set({ ...seated(ZHAO.seat, t, { facing: Z5B }), hands: [jh[0], jh[1]], expr: at(f, kx), blink: lid(t, 11, swaps(kx)), gaze: 1, visible: true });
  // ---- the envoy: steps forward, turns to the king, 我去, 城不来
  const L = linLeg(f), env = w.actor(PEOPLE.lin);
  const no = f >= T.shakeNo && f < T.shakeNo + 14 ? { tilt: 6 * Math.sin((2 * Math.PI * 2 * (f - T.shakeNo)) / 14) * (1 - (f - T.shakeNo) / 14) } : undefined;
  const sp = speak(quote("lin", 6), f, 1);
  env.set({
    at: L.at, facing: L.facing, pose: L.pose, expr: "stern",
    gaze: f >= T.turnKing ? -1 : 0, blink: sp.blink ?? lid(t, 1), mouth: sp.mouth,
    lookDown: -8 * smooth(lin(f, HIT.iGo, HIT.iGo + 3)),
    head: heads(sp.head, headPop(f, HIT.iGo), no),
    visible: true,
  });
  // ---- the eunuch: the pat and the open hand; smile -> happy
  const M = miaoLeg(f), miao = w.actor(PEOPLE.miaoXian);
  const mx: [number, Expr][] = [[S5b.from, "smile"], [T.happy, "happy"]];
  miao.set({ at: M.at, facing: M.facing, pose: M.pose, expr: at(f, mx), blink: lid(t, 12, swaps(mx)), gaze: -1, hands: [miaoHand(f, L, M), null], visible: true });
  w.update();
  w.prop("jade").put(jc, { grip: "pair", rot: Z5B });
  const ov = ov5b(f, { lin: headPx(w, env), miao: headPx(w, miao), king: headPx(w, king) });
  return { camera, overlays: frag(...ov), slate: slate(S5b, f < HIT.iGo ? "presented" : "I'll go") };
}

// ====================================================================================================== line 6
/** shot 6's floor point: where 5b left him (after the half step), so the axial cut keeps his head x (rule 3) */
const P6 = LIN_HALF;
/** facing the lens with the jade at his chest; it reads just right of his head (zhaoLin) */
const F6 = 0.05;
/** the chest hold and the chin hold in his body frame (x left, y up from his feet, z forward). His shoulders are at
 *  0.975, x +-0.11 (probe6): with the hands there the arms ran level from his neck like a rod, and with the disc 12 cm
 *  to one side that arm crossed the hole. Now the hole stays on his middle (x 0: both arms start outside it, 100+ px
 *  from its centre) and the pair grip sits GRIP6 down the rim, so the arms slope down to the hands. Chest: 7 cm under
 *  the shoulders. Chin: up to them, the disc's top under his lower lip (at 1.02 it covered his mouth) */
const CHEST6: [number, number, number] = [0, 0.905, 0.24], CHIN6: [number, number, number] = [0, 0.975, 0.25];
const GRIP6 = 0.75;
/** the pair grip GRIP6 rad down the rim from the horizontal (hand 0, his right, at the disc's -x) */
const lowPair = (c: THREE.Vector3, facing: number, a: number): [THREE.Vector3, THREE.Vector3] => {
  const r = 0.12, x = r * Math.cos(a), y = -r * Math.sin(a);
  return [rel(c, facing, -x, y, 0), rel(c, facing, x, y, 0)];
};
/** his turn toward Qin (screen left) with one step at 带回来 */
const STEP6 = P6.clone().add(V(-0.06, 0, 0.03)), F6_QIN = -0.6;
/** shot 6 (472-512, zhaoLin, static, whip LEFT out): the jade at his chest (V2), lifted to his chin, eyes on the lens;
 *  the stamp; he turns toward Qin */
function shot6(w: World, f: number): Pose {
  const camera = whip(CAMS.zhaoLin, f, T.whip2[0], T.whip2[1], -1, "out");
  w.setPlace("zhao");
  w.setCamera(camera);
  const t = f / FPS, env = w.actor(PEOPLE.lin);
  // the turn and its small step (7 frames): an idle body that slides 7 cm and turns (his feet are far below this
  // frame). A walk cycle here (walkAlong) lasted 2 frames, faced him along the step (70 deg off the lens: the rig
  // shows 45 at most) and pitched his head into the jade held at his true facing (clearance: 6.6 cm)
  const tk = smooth(lin(f, T.turnQin, T.turnQin + 7));
  const leg = { at: P6.clone().lerp(STEP6, tk), facing: lerp(F6, F6_QIN, tk), pose: { kind: "idle" as const, t: t + 0.4 } };
  // straight up (472-480), held; on the turn it sinks most of the way back (turned, his right shoulder comes behind
  // the hole at the chin hold's height), so it goes up, then down and left with him: one path
  const k = smooth(lin(f, T.chin[0], T.chin[0] + 8)) * (1 - 0.8 * smooth(lin(f, T.turnQin, T.turnQin + 7)));
  const hold = CHEST6.map((v, i) => lerp(v, CHIN6[i], k)) as [number, number, number];
  const jc = rel(leg.at, leg.facing, hold[0], hold[1], hold[2]), jh = lowPair(jc, leg.facing, GRIP6);
  const sp = speak(quote("lin", 6), f, 1);
  env.set({
    at: leg.at, facing: leg.facing, pose: leg.pose, hands: [jh[0], jh[1]], expr: "stern",
    gaze: f >= T.turnQin ? -1 : 0, blink: sp.blink ?? lid(t, 1), mouth: sp.mouth, head: sp.head, visible: true,
  });
  w.update();
  w.prop("jade").put(jc, { grip: "pair", rot: leg.facing });
  const ov = ov6(f, { jade: px(w, jc) });
  return { camera, overlays: frag(...ov), slate: slate(S6, f >= T.whip2[0] ? "whip left" : "") };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[S1, shot1], [S2, shot2], [S3, shot3], [S5a, shot5a], [S5b, shot5b], [S6, shot6]];
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};
