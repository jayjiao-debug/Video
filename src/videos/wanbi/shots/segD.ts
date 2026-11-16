// SEGMENT D (frames 1296-1685), lines 16-19: THE SERVANT, THE REVEAL, THE CAULDRON (STORYBOARD "Segment D"). WP10.
//   16a  roadGate   dusk behind the guesthouse: the envoy walks in from the LEFT EDGE on the walk he left the hall with
//                   (rule 5b), the jade at his chest; 转头: the jade onto his right hand; 让: his left hand beckons the
//                   servant; 随从: the tag; 穿上粗布衣服: he flings a cloth, a brown puff covers the servant and he comes
//                   out as SERVANT_ROUGH (V4, 粗); 揣着玉: THE HAND-OVER (both of the envoy's hands under the disc, the
//                   servant's on its sides; glint, chip 随从怀里), the servant tucks it into his coat (a warm glow stays
//                   at his chest); he turns right and breaks into a run (the cut comes 4 frames into it)
//   16b  roadFar    抄小路溜回赵国: the servant runs left to right along the far ridge, the glow a bright dot at his
//                   chest; the dotted arrow toward Zhao (seal 赵 on 赵国); whip pan LEFT out
//   17a  hallWide   the ceremony dressing on: the whip lands; 五天后: the five suns tick on at the top; the usher walks
//                   in from the right edge with the envoy 0.7 m behind, EMPTY-HANDED; 大礼摆好: the drum (a gold burst,
//                   twice); the usher stops, turns to the throne (a true back view) and bows; the envoy walks on past
//                   him toward mid; from 1456 the usher backs away (out of every frame from 1461)
//   17b  throne     秦王要玉: the King of Qin, upright on his 榻, smiles and holds his left hand out toward screen right
//   18a  linMid     the envoy at mid, deadpan, hands together at the belly; lip-sync; 二十多个国君: 22 crowns pop;
//                   没一个守约的: a red cross ripples over them; he shows two empty hands
//   18b  throne     玉已经到赵国了: the king's hand still out, smile -> shock; 赵: the chip flips to 赵国 (HUD), a gold
//                   「!」; his hand pulls back to his chest
//   19   hallMid    骗了大王: the polite bow; 该死: one slow nod; 把我下锅煮了吧: THE CAULDRON drops in from above the
//                   frame onto HALL.cauldron (V5), squash, dust at its rim, steam; he shows it with an open hand, deadpan;
//                   the king in shock
// ONE STAGING for 17a-19 (hallD): every figure's clock is the film frame and every walk one function of it, so a figure
// in two consecutive shots keeps its pose (rule 12); a shot picks its camera, its placed list (beats.ts) and its 2D
// layer (segD_ov.ts). THE JADE (16a) is one timeline (jade16a): its centre, its turn and the hands on its rim on every
// frame (it never floats: in the envoy's hands, in both men's, in the servant's, then hidden in his coat from 1372).
// Every frame number is looked up (beats.ts HIT / TAG / BEAT, segD_ov.ts T, cap / capWord / quote); every mark and
// camera is layout.ts's. RIG FIELDS ONLY (BIBLE 5): hands are pinned points, the bow is salute's, no seated lean.
// HANDS ARE PINNED IN THE DRAWN TORSO'S FRAME (shownYaw: the rig draws a standing figure's torso turned toward the
// camera, up to 45 deg): the jade and the hands that hold it are placed there, as segment C does, or they stand off
// the drawn chest whenever a figure faces away from the lens (the envoy walking right in 16a, the servant's turn).
import * as THREE from "three";
import type { Pose, Segment, Vec3 } from "../story";
import { SEGMENTS, FPS, lerp, lin, smooth, clamp01, quote } from "../story";
import type { World } from "../world";
import { shot, HIT, type ShotDef } from "../beats";
import { CAMS, HALL, HALL_SET, ROAD } from "../layout";
import { JADE, CAULDRON } from "../props";
import { PEOPLE } from "../people";
import {
  V, rel, lid, at, ky, kv, path, accent, heads, headPx, headM, headPop, speak, frag, seated, lap, walkAlong, walkTime,
  swaps, lerpA, wrapA, yawTo, whip, salute, standing, halberdHand, type Rig, type RigState, type Leg,
} from "./common";
import { T, ov16a, ov16b, ov17a, ov18a, ov18b, ov19, S16a, S16b, S17a, S18a, S18b, S19 } from "./segD_ov";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
type V3 = THREE.Vector3;
type Hands = [V3 | null, V3 | null];
const S = SEGMENTS[3];
const S17B = shot("17b");
const slate = (s: ShotDef, more = "") => `${s.id} ${s.cam}${more ? " " + more : ""}`;
const px = (w: World, p: V3) => { const q = w.project(p); return { x: q.x, y: q.y }; };
const KQ = PEOPLE.qinWang;

// ====================================================================================================== helpers
/** the yaw the rig DRAWS a standing figure's torso at (rig3d's "show yaw", step 1 of its solve, copied as segment C
 *  does): the body turns toward the camera, softly up to 45 deg; a figure turned far away (or given `turn`) goes over to
 *  its true back view. Hands and held things are placed in this frame */
const shownYaw = (cam: V3, p: V3, facing: number, turn?: number): number => {
  const sm = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
  const hz = Math.hypot(cam.x - p.x, cam.z - p.z), vt = Math.max(Math.abs(cam.y - (p.y + 1)), 1e-3);
  const follow = sm((hz / vt - 0.35) / 0.6), camYaw = Math.atan2(cam.x - p.x, cam.z - p.z);
  const off = wrapA(facing - camYaw), aOff = Math.abs(off), maxB = Math.PI / 4, knee = 0.7 * maxB;
  const soft = aOff < knee ? aOff : knee + (maxB - knee) * (1 - Math.exp(-(aOff - knee) / (maxB - knee)));
  const wB = turn !== undefined ? clamp01(turn) : sm((aOff - (115 * Math.PI) / 180) / ((55 * Math.PI) / 180));
  return facing + follow * wrapA(camYaw + Math.sign(off) * lerp(soft, aOff, wB) - facing);
};
/** a walk backward along pts, facing `look` all the way; the steps run backward (segment B's backAlong) */
const backAlong = (pts: V3[], speed: number, t: number, look: V3): Leg => {
  const L = walkAlong(pts, speed, t);
  const facing = yawTo(L.at, look);
  if (!L.moving) return { ...L, facing };
  return { ...L, facing, pose: { ...L.pose, phase: (1 - (L.pose.phase ?? 0)) % 1 } };
};
/** a point on the jade's rim: `side` +1 = the disc's +x (the holder's left when the disc faces his way), -1 = -x; `a`
 *  rad below the horizontal (negative = above); `r` from the centre; the disc turned `rot` (a yaw, as put) */
const rimPt = (c: V3, rot: number, side: 1 | -1, a: number, r: number) => rel(c, rot, side * r * Math.cos(a), -r * Math.sin(a), 0);
/** a point in a figure's drawn frame (x to its left, y up from its feet, z forward) */
const loc = (p: V3, yaw: number, q: Vec3) => rel(p, yaw, q[0], q[1], q[2]);
const ez = (f: number, a: number, b: number) => smooth(lin(f, a, b));

// ====================================================================================================== 16a: the road
// ---- the envoy
/** his facing at ROAD.envoy: 0.58 rad off roadGate's lens toward the servant (a 3/4 view, eyes to screen right) */
const E_F = 0.7;
/** the walk in from the left edge (from envoyFrom, -27 %) at 1.2 m/s on 15's clock (set off at 1292), so he steps into
 *  the frame on the cut and stands on ROAD.envoy from 1313 */
const LIN_ROAD = [ROAD.envoyFrom, ROAD.envoy], ROAD_V = 1.2;
const linRoad = (f: number) => walkAlong(LIN_ROAD, ROAD_V, (f - T.walk15) / FPS, { endFacing: E_F });
/** THE JADE'S HOLDS (his drawn frame). WALK = the hold he walks out of 15 with (segment C's chin hold carried 6 cm
 *  lower and 3 cm out while walking: his head tips forward on each step); CHEST = shot 6's chest hold (the pair grip
 *  GRIP rad down the rim); ONE_R = standing on his RIGHT hand by its bottom edge, a little right of his middle (his
 *  left hand, the servant's side, beckons and flings) */
const WALK: Vec3 = [0, 0.915, 0.28], CHEST: Vec3 = [0, 0.905, 0.24], ONE_R: Vec3 = [-0.07, 0.95, 0.27];
const GRIP = 0.75, PAIR_R = 0.12;
/** his left hand's beckon (two flicks toward himself), the wind-up low at his side and the fling toward the servant's
 *  head (his frame: the servant stands 0.56 m off at his left front) */
const BK0: Vec3 = [0.19, 1.00, 0.30], BK1: Vec3 = [0.17, 1.07, 0.22], WIND: Vec3 = [0.15, 0.80, 0.14], FLING: Vec3 = [0.23, 1.10, 0.24];
/** his idle hands (segment C's measure, his frame): the hands go back here once the jade is given */
const LIN_REST: [Vec3, Vec3] = [[-0.161, 0.604, 0.035], [0.161, 0.604, 0.035]], LIN_DROP: [Vec3, Vec3] = [[-0.22, 0.80, 0.24], [0.22, 0.80, 0.24]];
// ---- the servant
/** his facing at ROAD.servant: toward the envoy (0.89 rad off the lens; the rig draws him 45 deg round) */
const S_F = -0.9;
/** the jade in his hands (his drawn frame: at his chest, his hands on its sides SV_A above the horizontal) and the
 *  tuck (into his coat, hidden from tuck[1] + 1) */
const SV_HOLD: Vec3 = [0, 0.92, 0.25], SV_TUCK: Vec3 = [0, 0.88, 0.215], SV_A = -0.35;
/** his idle hands and the hands flat on his chest over the hidden jade (his frame) */
const SV_REST: [Vec3, Vec3] = [[-0.155, 0.60, 0.035], [0.155, 0.60, 0.035]], SV_PRESS: [Vec3, Vec3] = [[-0.06, 0.88, 0.215], [0.06, 0.88, 0.215]];
/** where the envoy offers it (world): between the two men, a little toward the lens, turned to face it */
const OFFER = ROAD.envoy.clone().lerp(ROAD.servant, 0.55).add(V(0, 0.96, 0.14)), ROT_OFFER = 0.1;
/** the run: right along the path out of the frame (a 3/4 back view at most: straight up the path he would face 116
 *  deg from the lens) */
const RUN = [ROAD.servant, V(80.7, 0, -1.2), V(82.6, 0, -1.6)], RUN_V = 2.8;
const RUN_YAW = yawTo(RUN[0], RUN[1]);
const servantLeg16 = (f: number): { at: V3; facing: number; pose: RigState["pose"]; moving: boolean } => {
  if (f < T.run) return { at: ROAD.servant.clone(), facing: lerpA(S_F, RUN_YAW, ez(f, T.turn, T.run)), pose: { kind: "idle", t: f / FPS + 0.7 }, moving: false };
  const L = walkAlong(RUN, RUN_V, (f - T.run) / FPS);
  return { at: L.at, facing: L.facing, pose: L.pose, moving: L.moving };
};

/** THE JADE IN 16a on frame f: its centre and turn, the envoy's two hands and the servant's (null = free), whether it
 *  shows (hidden in the coat from tuck[1] + 1), and who has it for the glint. `cam` = the camera's position */
const jade16a = (f: number, cam: V3) => {
  const E = linRoad(f), Ye = shownYaw(cam, E.at, E.facing), Sv = servantLeg16(f), Ys = shownYaw(cam, Sv.at, Sv.facing);
  // ---- the envoy's own hold until the offer: walk -> one hand (beckon, fling) -> both hands at the chest
  const c0 = kv(f, [[T.oneHand, WALK], [T.beckon - 1, ONE_R], [T.both - 4, ONE_R], [T.both, CHEST]]);
  const a0 = ky(f, [[T.oneHand, GRIP], [T.beckon - 1, Math.PI / 2], [T.both - 4, Math.PI / 2], [T.both, GRIP]]);
  const ownC = (g: number) => loc(linRoad(g).at, shownYaw(cam, linRoad(g).at, linRoad(g).facing), kv(g, [[T.oneHand, WALK], [T.beckon - 1, ONE_R], [T.both - 4, ONE_R], [T.both, CHEST]]));
  // ---- the world path of the disc from the offer on
  const svC = (g: number, q: Vec3) => { const s = servantLeg16(g); return loc(s.at, shownYaw(cam, s.at, s.facing), q); };
  let c: V3, rot: number;
  if (f < T.offer) { c = loc(E.at, Ye, c0); rot = Ye; }
  else if (f < T.give[0]) { const k = ez(f, T.offer, T.give[0]); c = ownC(T.offer).lerp(OFFER, k); rot = lerpA(Ye, ROT_OFFER, k); }
  else if (f < T.tuck[0]) { const k = ez(f, T.give[0], T.tuck[0]); c = OFFER.clone().lerp(svC(T.tuck[0], SV_HOLD), k); c.y += 0.02 * 4 * k * (1 - k); rot = lerpA(ROT_OFFER, Ys, k); }
  else { const k = ez(f, T.tuck[0], T.tuck[1]); c = svC(f, SV_HOLD).lerp(svC(f, SV_TUCK), k); rot = Ys; }
  const shows = f <= T.tuck[1];
  // ---- the envoy's hands
  const r0 = lerp(PAIR_R, JADE.r, (a0 - GRIP) / (Math.PI / 2 - GRIP));
  const pair = (cc: V3, rr: number): [V3, V3] => [rimPt(cc, rr, -1, GRIP, PAIR_R), rimPt(cc, rr, 1, GRIP, PAIR_R)];
  const restE = LIN_REST.map((q) => loc(E.at, Ye, q)) as [V3, V3];
  let e0: V3 | null, e1: V3 | null;
  const letGo = T.give[0] + 3, free = T.tuck[1];
  if (f < T.offer) {
    e0 = rimPt(c, rot, -1, a0, r0);
    const p1 = (g: number) => pair(ownC(g), shownYaw(cam, linRoad(g).at, linRoad(g).facing))[1];
    const L = (q: Vec3) => loc(E.at, Ye, q);
    if (f < T.oneHand) e1 = rimPt(c, rot, 1, GRIP, PAIR_R);
    else if (f < T.beckon) e1 = path(f, [[T.oneHand, p1(T.oneHand)], [T.beckon - 1, L(BK0)]]);
    else if (f < T.beckon + 12) { const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * (f - T.beckon)) / 6); e1 = L(BK0).lerp(L(BK1), u); }
    else if (f < T.fling) e1 = L(BK0);
    else if (f <= T.puff + 2) e1 = path(f, [[T.fling, L(BK0)], [T.fling + 3, L(WIND)], [T.puff, L(FLING), (x) => 1 - (1 - x) * (1 - x)], [T.puff + 2, L(FLING)]]);
    else e1 = path(f, [[T.puff + 2, L(FLING)], [T.both, p1(T.both)]]);
    if (f >= T.both) e1 = rimPt(c, rot, 1, GRIP, PAIR_R);
  } else if (f < letGo) [e0, e1] = pair(c, rot);
  else if (f < free) {
    // down by way of a point out in front (straight down from the rim the arms passed through his robe, 2 cm)
    const g = pair(jadeAt(letGo - 1, cam), rotAt(letGo - 1, cam)), drop = LIN_DROP.map((q) => loc(E.at, Ye, q)), mid = Math.round((letGo + free) / 2);
    e0 = path(f, [[letGo - 1, g[0]], [mid, drop[0]], [free - 1, restE[0]]]); e1 = path(f, [[letGo - 1, g[1]], [mid, drop[1]], [free - 1, restE[1]]]);
  } else { e0 = null; e1 = null; }
  // ---- the servant's hands: up to the disc's sides (1358-1362), on them (to the tuck's end), flat on his chest
  //      (to the run), free
  const restS = SV_REST.map((q) => loc(Sv.at, Ys, q)) as [V3, V3], pressS = SV_PRESS.map((q) => loc(Sv.at, Ys, q)) as [V3, V3];
  const sides = (cc: V3, rr: number): [V3, V3] => [rimPt(cc, rr, -1, SV_A, PAIR_R), rimPt(cc, rr, 1, SV_A, PAIR_R)];
  let s0: V3 | null = null, s1: V3 | null = null;
  const reachS = T.give[0] - 4;
  if (f >= reachS && f < T.give[0]) { const g = sides(jadeAt(T.give[0], cam), ROT_OFFER); s0 = path(f, [[reachS, restS[0]], [T.give[0], g[0]]]); s1 = path(f, [[reachS, restS[1]], [T.give[0], g[1]]]); }
  else if (f >= T.give[0] && f <= T.tuck[1]) [s0, s1] = sides(c, rot);
  else if (f > T.tuck[1] && f < T.run) { const g = sides(jadeAt(T.tuck[1], cam), rotAt(T.tuck[1], cam)); s0 = path(f, [[T.tuck[1], g[0]], [T.tuck[1] + 2, pressS[0]]]); s1 = path(f, [[T.tuck[1], g[1]], [T.tuck[1] + 2, pressS[1]]]); }
  return { c, rot, shows, lin: [e0, e1] as Hands, servant: [s0, s1] as Hands, E, Ye, Sv, Ys };
};
/** the disc's centre and turn on another frame (the starts and ends of the hand paths) */
const jadeAt = (f: number, cam: V3) => jade16a(f, cam).c;
const rotAt = (f: number, cam: V3) => jade16a(f, cam).rot;

/** the envoy's faces in 16a: cool; focus on 转头 (the jade onto one hand, the beckon); cool again from the fling, kept
 *  through the puff and the quiet hand-over to the end (no smile, no scowl at his own servant: two swaps in 85 frames) */
const LX16: [number, Expr][] = [[S16a.from, "cool"], [T.oneHand, "focus"], [T.fling, "cool"]];
const SX16: [number, Expr][] = [[S16a.from, "neutral"], [T.beckon, "focus"], [HIT.puff, "nervous"], [HIT.puff + 13, "stern"], [T.give[0] - 4, "focus"], [T.turn, "stern"]];
/** shot 16a (1296-1380, roadGate, static) */
function shot16a(w: World, f: number): Pose {
  const camera = CAMS.roadGate;
  w.setPlace("road");
  w.setCamera(camera);
  const t = f / FPS, J = jade16a(f, w.camera.position);
  // ---- the envoy
  const lin = w.actor(PEOPLE.lin);
  lin.set({
    at: J.E.at, facing: J.E.facing, pose: J.E.pose, hands: J.lin, expr: at(f, LX16), blink: lid(t, 1, swaps(LX16)),
    gaze: f < T.oneHand ? 0 : 1,
    head: heads(accent("nod", f, T.beckon, { amp: 0.5 }), accent("nod", f, T.turn + 1, { amp: 0.7 })),
    visible: true,
  });
  // ---- the servant (SERVANT, SERVANT_ROUGH from 粗 under the puff)
  const sv = w.actor(f >= HIT.puff ? PEOPLE.servantRough : PEOPLE.servant);
  sv.set({
    at: J.Sv.at, facing: J.Sv.facing, pose: J.Sv.pose, hands: J.servant, expr: at(f, SX16), blink: lid(t, 15, swaps(SX16)),
    gaze: J.Sv.moving || f >= T.turn ? 0 : -1,
    lookDown: ky(f, [[HIT.puff + 1, 0], [HIT.puff + 4, 18], [HIT.puff + 10, 18], [HIT.puff + 13, 0], [T.tuck[0], 0], [T.tuck[0] + 2, 12], [T.tuck[1] + 2, 12], [T.turn, 0]]),
    head: heads(headPop(f, HIT.puff)),
    visible: true,
  });
  w.update();
  if (J.shows) w.prop("jade").put(J.c, { grip: "pair", rot: J.rot });
  const chest = px(w, loc(J.Sv.at, J.Ys, [0, 0.88, 0.22]));
  const jc = px(w, J.c), jadeR = Math.abs(px(w, J.c.clone().add(V(0, JADE.r, 0))).y - jc.y);
  const ov = ov16a(f, { lin: headPx(w, lin), servant: headPx(w, sv), jade: J.shows ? jc : null, jadeR, chest });
  const what = f < T.beckon ? "walk in" : f < T.fling ? "beckon" : f < T.offer ? "the cloth" : f <= T.tuck[1] ? "the jade" : "run";
  return { camera, overlays: frag(...ov), slate: slate(S16a, what) };
}

// ====================================================================================================== 16b: the ridge
/** the run along the ridge path (ROAD.ridgeFrom -> ridgeTo, both outside roadFar) at 2.6 m/s, timed so he is at x 80.1
 *  (20 % of the frame) on the cut and at 85 % on 1416 */
const RIDGE_V = 2.6, RIDGE_IN = 1.1;
const RIDGE0 = S16b.from - (RIDGE_IN / RIDGE_V) * FPS;
const ridgeLeg = (f: number) => walkAlong([ROAD.ridgeFrom, ROAD.ridgeTo], RIDGE_V, (f - RIDGE0) / FPS);
/** the arrow's tail (world, off his feet where he is on T.arrow): 0.48 m over his head (1.16 m up, 0.10 m ahead of his
 *  feet while running) and 0.24 m ahead of it, a fixed point (roadFar holds still while the arrow shows, 1395-1412) */
const ARROW_TAIL = V(0.34, 1.64, 0);
/** shot 16b (1381-1419, roadFar; whip pan LEFT out on 1414-1419) */
function shot16b(w: World, f: number): Pose {
  const camera = whip(CAMS.roadFar, f, T.whip3[0], T.whip3[1], -1, "out");
  w.setPlace("road");
  w.setCamera(camera);
  const L = ridgeLeg(f), sv = w.actor(PEOPLE.servantRough);
  sv.set({ at: L.at, facing: L.facing, pose: L.pose, expr: "stern", blink: lid(f / FPS, 15), visible: true });
  w.update();
  const Y = shownYaw(w.camera.position, L.at, L.facing);
  const ov = ov16b(f, { tail: px(w, ridgeLeg(T.arrow).at.clone().add(ARROW_TAIL)), chest: px(w, loc(L.at, Y, [0, 0.88, 0.22])) });
  return { camera, overlays: frag(...ov), slate: slate(S16b, f >= T.whip3[0] ? "whip left" : "the ridge") };
}

// ====================================================================================================== 17a-19: the hall
// ---- the usher
/** the usher walks from inside the east door to his mark at 0.85 m/s, arriving on 1446 (in at the right edge about
 *  1424); he faces the throne there (a true back view: facing it he is 146 deg from hallWide's lens) and bows */
const U_PATH = [HALL.enter, HALL.usher], U_V = 0.85;
const U0 = T.usherStop - walkTime(U_PATH, U_V) * FPS;
const U_THRONE = yawTo(HALL.usher, HALL.seat.top), U_WALK = yawTo(HALL.enter, HALL.usher);
/** from 1456 he backs away 0.5 m toward the door, turns round (5 frames) and walks out of it (out of every frame from
 *  1461: linMid's right edge is x 1.0 at his depth by 18a; out of the door about 1540) */
const U_BACK = [HALL.usher, V(1.30, 0, -2.95)], U_BACK_V = 0.8;
const U_OUT = [V(1.30, 0, -2.95), V(2.20, 0, -2.62), V(3.75, 0, -2.30)], U_OUT_V = 1.1;
const U_BACKED = T.bow[3] + walkTime(U_BACK, U_BACK_V) * FPS;
const usherState = (f: number): Extra => {
  const t = f / FPS, base = { blink: lid(t, 10), visible: true };
  if (f < T.usherStop) { const L = walkAlong(U_PATH, U_V, (f - U0) / FPS); return { ...base, at: L.at, facing: L.facing, pose: L.pose }; }
  if (f < T.bow[3]) {
    const k = ez(f, T.usherStop, T.bow[0]), b = ky(f, [[T.bow[0], 0], [T.bow[1], 1], [T.bow[2], 1], [T.bow[3], 0]]);
    const facing = lerpA(U_WALK, U_THRONE, k);
    return { ...base, at: HALL.usher.clone(), facing, turn: k, ...(b > 0 ? salute(b, HALL.usher, U_THRONE, t) : { pose: { kind: "idle", t } }) };
  }
  if (f < U_BACKED) { const L = backAlong(U_BACK, U_BACK_V, (f - T.bow[3]) / FPS, HALL.seat.top); return { ...base, at: L.at, facing: L.facing, pose: L.pose, turn: 1 }; }
  const out = yawTo(U_OUT[0], U_OUT[1]), k = ez(f, U_BACKED, U_BACKED + 5);
  if (k < 1) return { ...base, at: U_OUT[0].clone(), facing: lerpA(U_THRONE, out, k), pose: { kind: "idle", t }, turn: 1 - k };
  const L = walkAlong(U_OUT, U_OUT_V, (f - U_BACKED - 5) / FPS);
  return { ...base, at: L.at, facing: L.facing, pose: L.pose };
};

// ---- the envoy
/** the envoy follows the usher 0.55 m behind on a line 0.25 m nearer the lens (their heads never come nearer than
 *  0.5 m), a little quicker (1.0 m/s), so he is in view from 1446 and passes in front of the bowing usher about 1457
 *  (the storyboard's 0.7 m at 0.85 m/s would keep him outside hallWide's right edge, x 1.14, for all of 17a); he walks
 *  on to mid (arrives about 1468, off-screen in 17b), empty-handed */
const LIN_IN = [HALL.enter.clone().add(V(0, 0, 0.25)), V(1.35, 0, -2.22), HALL.mid], LIN_V = 1.0;
const LIN0 = U0 + (0.55 / U_V) * FPS;
/** his facings at mid: 18a toward linMid's lens (the king hidden behind him), 19 turned toward the king's side and the
 *  cauldron (screen left; the king himself is 165 deg from hallMid's lens, a forbidden back view) */
const F18 = 0.0, F19 = -0.75;
/** his hands (drawn frame): together at the belly (18a), apart and empty (1570-1576: low and forward, "nothing here",
 *  not out at the shoulders), the bow's hands together at the
 *  chest (salute's points), the open hand toward the cauldron (19, his right; the cauldron's wall stays 5 cm off it) */
const BELLY: [Vec3, Vec3] = [[-0.04, 0.85, 0.20], [0.04, 0.85, 0.20]], EMPTY: [Vec3, Vec3] = [[-0.22, 0.86, 0.36], [0.22, 0.86, 0.36]];
const BOWH: [Vec3, Vec3] = [[-0.05, 0.80, 0.36], [0.05, 0.80, 0.36]], OPEN0: Vec3 = [-0.20, 0.88, 0.18];
const Q18 = quote("lin", 18), Q19 = quote("lin", 19);
const linHall = (f: number, cam: V3): Extra => {
  const t = f / FPS;
  if (f < S18a.from) {
    const L = walkAlong(LIN_IN, LIN_V, (f - LIN0) / FPS, { startFacing: U_WALK, endFacing: F18 });
    return { at: L.at, facing: L.facing, pose: L.pose, expr: "cool", blink: lid(t, 1), gaze: L.moving ? 0 : -1, visible: true };
  }
  const p = HALL.mid.clone(), facing = lerpA(F18, F19, ez(f, T.turn19[0], T.turn19[1])), Y = shownYaw(cam, p, facing);
  const Lc = (q: Vec3) => loc(p, Y, q);
  const belly = BELLY.map(Lc) as [V3, V3];
  let hands: Hands = belly, more: Extra = { pose: { kind: "idle", t: t + 0.4 } };
  const head: (RigState["head"] | undefined)[] = [];
  if (f < S18b.from) {
    const k = ez(f, T.empty, T.empty + 4);
    hands = [belly[0].lerp(Lc(EMPTY[0]), k), belly[1].lerp(Lc(EMPTY[1]), k)];
  } else if (f < S19.from) {
    const k = 1 - ez(f, S18b.from, S18b.from + 7);
    hands = [belly[0].lerp(Lc(EMPTY[0]), k), belly[1].lerp(Lc(EMPTY[1]), k)];
  } else {
    // 骗了大王: the bow (salute's lean and its hands, eased from the belly); 该死: the nod; the open hand
    const b = ky(f, [[T.bow19[0], 0], [T.bow19[1], 1], [T.bow19[2], 1], [T.bow19[3], 0]]);
    if (b > 0) { const s = salute(b, p, facing, t); more = { pose: s.pose, lookDown: s.lookDown }; head.push(s.head); }
    const bh = BOWH.map(Lc);
    hands = [belly[0].lerp(bh[0], b), belly[1].lerp(bh[1], b)];
    const nod = ky(f, [[T.nod[0], 0], [T.nod[1], 1], [T.nod[2], 0]]);
    if (nod > 0) { more = { ...more, lookDown: 16 * nod }; head.push({ dy: headM(-0.03) * nod }); }
    if (f >= T.show) hands = [path(f, [[T.show, belly[0]], [T.show + 6, Lc(OPEN0), (x) => 1 - (1 - x) * (1 - x)]]), f < T.show + 6 ? path(f, [[T.show, belly[1]], [T.show + 5, Lc(LIN_REST[1])]]) : null];
  }
  const sp = f < S19.from - 1 ? speak(Q18, f, 1) : speak(Q19, f, 1);
  return {
    at: p, facing, ...more, hands, expr: "deadpan", mouth: sp.mouth, blink: sp.blink ?? lid(t, 1),
    gaze: f >= T.show ? -1 : 0, head: heads(sp.head, ...head), visible: true,
  };
};

// ---- the King of Qin
const SEAT = HALL.seat, ST = V(SEAT.top.x, 0, SEAT.top.z);
/** his left hand out toward screen right (秦王要玉: STORYBOARD (0.30, 0.95, 0.35) of his body: x to his left, y world,
 *  z forward from the seat), and pulled back to his chest on the reveal */
const K_OUT = rel(ST, 0, 0.30, 0.95, 0.35), K_CHEST = rel(ST, 0, 0.13, 0.95, 0.24);
const KX: [number, Expr][] = [[S17a.from, "smug"], [T.ask, "smile"], [T.shock, "shock"]];
const kingD = (f: number): Extra => {
  const t = f / FPS, L = lap(SEAT, 0.11, 0.26, 0.20).hands as [V3, V3];
  const h1 = f < T.ask ? L[1] : f < T.recoil[0] ? path(f, [[T.ask, L[1]], [T.ask + 6, K_OUT]]) : path(f, [[T.recoil[0], K_OUT], [T.recoil[1], K_CHEST]]);
  return {
    ...seated(SEAT, t), hands: [L[0], h1], expr: at(f, KX), blink: lid(t, 2, swaps(KX)),
    gaze: f >= T.fall[1] ? -1 : 1,
    head: heads(accent("pop", f, T.ask, { amp: 0.5 }), accent("jolt", f, HIT.reveal, { amp: 1 }), accent("jolt", f, T.fall[1], { amp: 0.8 })),
    visible: true,
  };
};

/** the drum's middle (17a: its boom) */
const DRUM = HALL_SET.ceremony.drum.clone().add(V(0, HALL_SET.ceremony.drumSize.y, 0));
/** the cauldron: from above the frame (its foot 2.9 m up: hallMid's top edge is 2.66 m up at its depth) it falls with
 *  gravity onto HALL.cauldron (1654-1660) and lands with a squash of the PROP (1.06 / 0.97 / 1 wide, the height the
 *  other way) */
const FALL_Y = 2.9, SQUASH = [1.06, 0.97];
const putCauldron = (w: World, f: number) => {
  if (f < T.fall[0]) return;
  const k = lin(f, T.fall[0], T.fall[1]), y = FALL_Y * (1 - k * k);
  const p = w.prop("cauldron").put(V(HALL.cauldron.x, y, HALL.cauldron.z)), sx = SQUASH[f - T.fall[1]];
  if (sx !== undefined) { const s = p.group.scale.x; p.group.scale.set(s * sx, s / (sx * sx), s * sx); p.group.updateMatrixWorld(true); }
};

/** THE HALL IN D (17a-19): the hall with the ceremony dressing, the camera, and exactly the shot's placed list on
 *  their marks; every figure on its one clock */
const hallD = (w: World, f: number, s: ShotDef, camera: Pose["camera"]) => {
  w.setPlace("hall");
  w.set.setCeremony(1);
  w.setCamera(camera);
  const t = f / FPS, placed = new Set(s.placed), cam = w.camera.position;
  const lin = w.actor(PEOPLE.lin);
  lin.set(linHall(f, cam));
  // the king is not drawn in 18a: linMid hides him behind the envoy by design, but the edges of his crown board showed
  // on both sides of the envoy's bun (a mortarboard); nothing visible blinks, only his shadow on the screen goes
  const king = w.actor(KQ);
  king.set({ ...kingD(f), visible: s.id !== "18a" });
  const mins = [[PEOPLE.qinMinA, HALL.minA, 5], [PEOPLE.qinMinB, HALL.minB, 6], [PEOPLE.qinMinC, HALL.minC, 7]] as const;
  const M = mins.map(([p, at0, id]) => { const r = w.actor(p); r.set({ ...standing(at0, HALL.minFacing, f, id), gaze: f < S17B.from ? 1 : 0 }); return r; });
  w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardC, -0.8, f, 9), hands: [halberdHand(HALL.guardC, -0.8, 0), null] });
  let usher: Rig | null = null;
  if (placed.has("U")) { usher = w.actor(PEOPLE.qinUsher); usher.set(usherState(f)); }
  if (s.id === "19") putCauldron(w, f);
  w.update();
  void t;
  return { lin, king, usher, M };
};

/** shot 17a (1420-1460, hallWide; the whip LEFT lands on 1420-1423) */
function shot17a(w: World, f: number): Pose {
  const camera = whip(CAMS.hallWide, f, T.whip3[2], T.whip3[3], -1, "in");
  hallD(w, f, S17a, camera);
  return { camera, overlays: frag(...ov17a(f, { drum: px(w, DRUM) })), slate: slate(S17a, f < T.usherStop ? "walk in" : f < T.bow[3] ? "the usher bows" : "backs away") };
}
/** shot 17b (1461-1484, throne): 秦王要玉 */
function shot17b(w: World, f: number): Pose {
  const camera = CAMS.throne;
  hallD(w, f, S17B, camera);
  return { camera, slate: slate(S17B, "the hand") };
}
/** shot 18a (1485-1576, linMid): twenty-odd rulers */
function shot18a(w: World, f: number): Pose {
  const camera = CAMS.linMid;
  hallD(w, f, S18a, camera);
  return { camera, overlays: frag(...ov18a(f)), slate: slate(S18a, f < HIT.crowns ? "he says" : f < T.cross ? "crowns" : f < T.empty ? "crossed" : "empty hands") };
}
/** shot 18b (1577-1611, throne): the jade is in Zhao */
function shot18b(w: World, f: number): Pose {
  const camera = CAMS.throne, C = hallD(w, f, S18b, camera);
  return { camera, overlays: frag(...ov18b(f, { king: headPx(w, C.king) })), slate: slate(S18b, f < T.shock ? "smile" : "shock") };
}
/** the cauldron's rim on screen (landed) and its width */
const rimOf = (w: World) => {
  const c = V(HALL.cauldron.x, CAULDRON.h, HALL.cauldron.z), right = V().setFromMatrixColumn(w.camera.matrixWorld, 0).normalize();
  const a = w.project(c.clone().addScaledVector(right, -CAULDRON.r)), b = w.project(c.clone().addScaledVector(right, CAULDRON.r)), m = w.project(c);
  return { rim: { x: m.x, y: m.y }, rimW: Math.abs(b.x - a.x) };
};
/** shot 19 (1612-1685, hallMid): throw me in the pot */
function shot19(w: World, f: number): Pose {
  const camera = CAMS.hallMid;
  hallD(w, f, S19, camera);
  return { camera, overlays: frag(...ov19(f, rimOf(w))), slate: slate(S19, f < T.nod[0] ? "the bow" : f < T.fall[0] ? "nod" : f < T.show ? "the cauldron" : "the open hand") };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[S16a, shot16a], [S16b, shot16b], [S17a, shot17a], [S17B, shot17b], [S18a, shot18a], [S18b, shot18b], [S19, shot19]];
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};
