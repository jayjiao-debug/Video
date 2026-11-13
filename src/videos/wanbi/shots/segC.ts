// SEGMENT C (frames 925-1295), lines 12-15: THE MAP AND THE STAGE (STORYBOARD "Segment C"). WP9.
//   shot 12a  line 12  throne: the King of Qin sinks back from his half-rise onto the 榻; 秦王赶紧道歉: a seated bow
//                      (hands together at the chest, head down), a sweat drop; two claps (召) and he starts to rise
//   shot 12b  line 12  map (MAP_CAM, fix round): the map stand and the official (QIN_MIN_C as 有司, a back view,
//                      kneeling low under the sheet); 摊开地图: the king, turned to us, pulls the bottom roller down
//                      behind him with his left hand and lets go (977), the official bows; 一指: the jab; the 15 dots
//                      light (十五座城); 给赵国: the sweep toward Zhao. The envoy starts from the pillar (1013, not drawn)
//   shot 13   line 13-14  stageTwo: the envoy walks in from the right edge to mid; 在演: THE STAGE on the king's
//                      theatrical point (V3); 也演: the light slides to the envoy, he bows with the jade; lip-sync; the
//                      five suns pop over him (五天才)
//   shot 14   line 14  linStage: the stage stays on him; a small open hand toward the king (大王也得), the suns slide
//                      off toward the king and flash (五天); 大礼: the right arm sweeps out and up, head back, a gold
//                      burst at the hand; 我才交: the jade back to his chest, the stage lifts
//   shot 15   line 15  stageTwo: V11, the king's half step and half reach stop on a glance at his guards; 抢: the rage
//                      swap and the frame-0 raise; the king steps back; 只好答应: calm again, the king's nod; the envoy
//                      turns right and walks out (the cut to 16a comes 4 frames into the walk)
// Every frame number is looked up (beats.ts HIT / BEAT / shot(), segC_ov.ts T, cap / capWord); every mark and camera
// is layout.ts's. A shot is a pure function of f. Figures keep their pose clocks across the cuts (rule 12): the
// envoy's walk (linBody), the king's point (kingMapState), the official's kneel and the map's `open` are one function
// of the film frame each. The 2D layer of each shot is segC_ov.ts.
//
// STAGING NOTES (rig limits measured with rig.qa, /home/user/wanbi_work/wp9/probe*.ts):
//  - THE PULL (12b). From HALL.kingMap the king cannot reach the bottom roller (0.18 m short), and no figure reaches
//    it rolled up (open 0: y 1.50; the king's best is 8 cm short). So the king pulls from KING_PULL, a step east of
//    kingMap at the stand's west end, turned toward the lens (facing 1.05; fix round, was 1.9: in profile his pulling
//    hand was on the far side of his head, f0967), his left hand on the roller behind him, from open 0.40 (y 1.30:
//    reach 0) down to open 1; he stays there for the rest of 12b (the jab and the sweep at facing 1.0)
//    and is back on kingMap on the cut to 13 (a 0.25 m cheat across a 43-degree, 1.7x cut).
//  - THE OFFICIAL (fix round) kneels low, 0.20 m east of and 0.20 m south of HALL.official (still on his mat), and no
//    longer holds the roller (see the official): any kneel that lets his hands reach it puts his cap over the sheet.
//    At this kneel his cap (top 1.23) is 0.17 m under the king's pointing arm in 13 (clearance 0).
//  - 12b's camera is MAP_CAM (not CAMS.map): see there. The envoy is not drawn in 12b (see begin).
import * as THREE from "three";
import type { Pose, Segment, Vec3 } from "../story";
import { SEGMENTS, FPS, lerp, lin, smooth, quote } from "../story";
import type { World } from "../world";
import { shot, HIT, BEAT, type ShotDef } from "../beats";
import { CAMS, HALL, type Cam } from "../layout";
import { JADE, MAP_CITIES, mapDrop, mapCitiesWorld } from "../props";
import { PEOPLE } from "../people";
import {
  V, rel, lid, at, ky, kv, path, accent, heads, headPx, headM, headPop, speak, frag, seated, walkAlong, walkTime, swaps, lerpA,
  kneel, clap, salute, kingWave, linFor, wrapA, type Rig, type RigState,
} from "./common";
import { T, ov12a, ov12b, ov13, ov14, ov15, type Spot } from "./segC_ov";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
type V3 = THREE.Vector3;
const S = SEGMENTS[2];
const S12a = shot("12a"), S12b = shot("12b"), S13 = shot("13"), S14 = shot("14"), S15 = shot("15");
const slate = (s: ShotDef, more = "") => `${s.id} ${s.cam}${more ? " " + more : ""}`;
const KQ = PEOPLE.qinWang, KSC = KQ.scale ?? 1;

// ====================================================================================================== the map
/** how far the map hangs open on frame f (0 rolled .. 1 open): it arrives on the cut at 0.40 (the king's hand reaches
 *  the roller from there, see the header) and drops open under his pull over 963-975 */
const OPEN0 = 0.40;
const mapOpen = (f: number) => ky(f, [[T.pull[0], OPEN0], [T.pull[1], 1]]);
/** the middle of the bottom roller's axis at `open` (props mapScroll: origin HALL.mapBar, the roller mapDrop below) */
const roller = (open: number, dx = 0) => V(HALL.mapBar.x + dx, HALL.mapBar.y - mapDrop(open), HALL.mapBar.z);
/** the cities' middle and the Zhao side of the sheet, in the world (the map at open 1): where the king points */
const CITIES_MID = (() => { const c = V(); for (const p of MAP_CITIES) c.add(V(p[0], p[1], p[2])); return c.multiplyScalar(1 / MAP_CITIES.length).add(HALL.mapBar); })();
/** the map's Zhao (u 0.74, v 0.24: teal, north-east of the river; props/map.ts painting coordinates) */
const ZHAO_ON_MAP = V(HALL.mapBar.x + (0.74 - 0.5) * 0.85, HALL.mapBar.y - 0.24 * 0.6, HALL.mapBar.z + 0.01);

// ====================================================================================================== the official
/** the official (QIN_MIN_C as 有司) KNEELS LOW (a full kneel) on his mat by HALL.official, a back view, his hands
 *  together at his chest (拱手), head bowed: he has brought the map and hung it in the cut. FIX ROUND: he no longer
 *  holds the bottom roller. Holding it, his cap hid the sheet from every camera: the rig's arms enter its head as soon
 *  as the hands rise above the head's centre (rig.qa.clear -1 .. -7 cm for any kneel deeper than 0.5, probe5), so his
 *  hands on the roller (y 1.00) put his head centre at >= 1.0 and his tall cap's top (0.39 m above it) at >= 1.40, a
 *  quarter metre in front of a sheet that ends at 1.00: to see past it a camera must look down 57 deg. Kneeling low
 *  (head 0.82, cap top 1.23) he is under the sheet; the bottom roller hangs by its own weight once the king lets go.
 *  The kneel's head sink is halved (dy -0.10): at the kneel's -0.20 his arms touched his head (clear -0.5 cm) */
const OFFICIAL = HALL.official.clone().add(V(0.20, 0, 0.20)), OFFICIAL_K = 1;
/** his hands together at his chest (his frame from OFFICIAL, y from the floor with the kneel's sink): clear 0 */
const OFFICIAL_HANDS: [Vec3, Vec3] = [[-0.035, 0.42, 0.24], [0.035, 0.42, 0.24]];
/** the official on frame f (12b-15): kneeling, bowing a little deeper as the map drops open (HIT.roller) */
const officialState = (f: number): Extra => {
  const t = f / FPS, k = kneel(OFFICIAL_K, OFFICIAL, 14);
  const hands = OFFICIAL_HANDS.map((p) => rel(OFFICIAL, Math.PI, ...p)) as [V3, V3];
  // a still pose (no breathing): the idle's breath moved his arms 4-6 mm into his robe (rig.qa.clear)
  return { at: k.at, facing: Math.PI, pose: { kind: "idle", t: 0 }, lookDown: k.lookDown, head: heads({ dy: -0.10 }, accent("nod", f, HIT.roller, { amp: 0.6 })), turn: 1, hands, expr: "neutral", blink: lid(t, 7), visible: true };
};

// ====================================================================================================== the King of Qin
/** the floor point under the king's seat (his body frame from it: x left, y WORLD height, z forward) */
const SEAT = HALL.seat, ST = V(SEAT.top.x, 0, SEAT.top.z);
/** how high the seat's top has risen at rise k (seated(): from the cushion to standing hip height) */
const riseLift = (r: Rig, k: number) => (SEAT.floor + (r.dim.hipY - 0.028) * KSC - SEAT.top.y) * k;
/** the seated bow's hands: together in front of his chest, where clap() closes them (y world, z forward) */
const BOW = { y: 0.95, z: 0.30 };
/** 12a: the rise on frame f: 0.45 on the cut (as 11 leaves him), sunk back by 931; after the second clap he starts up
 *  again (959-963: the cut to 12b comes on it) */
const rise12a = (f: number) => (f < T.rise ? 0.45 * (1 - smooth(lin(f, S12a.from, T.sunk))) : 0.4 * smooth(lin(f, T.rise, S12a.to + 1)));
const KX12a: [number, Expr][] = [[S12a.from, "nervous"]];
/** the King of Qin in 12a on his 榻: sinks back, the seated bow (927-950, a nod on 道歉), two claps, the start of a rise */
const king12a = (r: Rig, f: number): Extra => {
  const t = f / FPS, k = rise12a(f), lift = riseLift(r, k);
  // from 11's frozen hands (the hook's wave at amplitude 0) to the bow, then out to the claps
  const hook = kingWave(0, 0);
  const bowH = [rel(ST, 0, -0.025, BOW.y + lift, BOW.z), rel(ST, 0, 0.025, BOW.y + lift, BOW.z)];
  const clapH = clap(f, HIT.clap, ST, 0, BOW.y + lift, BOW.z, 0.16);
  const kIn = smooth(lin(f, S12a.from, T.sunk + 2)), kClap = smooth(lin(f, T.sorry, T.unbow + 1));
  const hands = [0, 1].map((i) => hook[i].clone().lerp(bowH[i], kIn).lerp(clapH[i], kClap)) as [V3, V3];
  const bowK = ky(f, [[T.bow, 0], [T.bow + 4, 1], [T.sorry + 1, 1], [T.unbow + 2, 0]]);
  return {
    ...seated(SEAT, t, { rise: k, hipY: r.dim.hipY, scale: KSC }), hands,
    expr: at(f, KX12a), blink: lid(t, 2, swaps(KX12a)),
    gaze: at(f, [[S12a.from, 1], [HIT.clap[0] - 2, -1], [T.rise + 1, 1]]),
    lookDown: 18 * bowK,
    head: heads({ dy: headM(-0.03) * bowK }, accent("nod", f, T.sorry, { amp: 0.8 }), accent("pop", f, HIT.clap[0], { amp: 0.4 })),
    visible: true,
  };
};

/** 12b: the king pulls from here (a step east of kingMap at the stand's west end: the header), turned toward the lens;
 *  his left hand takes the roller PULL_DX from its middle, 10 cm inside the sheet's west edge: on the cream roller,
 *  clear of his head and of his crown's fringe (at the roller's end it sat in the fringe's shadow) */
const KING_PULL = V(-0.90, 0, -2.87), PULL_F = 1.05, JAB_F = 1.0, PULL_DX = -0.32;
/** at kingMap (13, 15) he faces the envoy's side of the hall, the map behind his left hand */
const KING_F = 1.1;
/** his left hand's idle rest (measured, his frame): a reach starts and ends here */
const KING_REST1: Vec3 = [0.210, 0.634, 0.118];
/** where his left hand cocks between letting go of the roller and the jab (his frame) */
const KING_COCK: Vec3 = [0.18, 1.12, 0.16];
const KX12b: [number, Expr][] = [[S12b.from, "smile"], [T.jab, "grin"]];
/** the King of Qin in 12b at KING_PULL: the pull (left hand on the roller's west end, 963-977), the jab (980, pose
 *  "point": the arm straightens toward the world target), the sweep to Zhao (1018-1026), lip-sync 992-1036 */
const king12b = (f: number): Extra => {
  const t = f / FPS, facing = ky(f, [[T.pull[0], PULL_F], [T.pull[1], PULL_F], [T.jab, JAB_F]]);
  const sp = speak(quote("qinWang", 12), f, 2);
  const base = { at: KING_PULL.clone(), facing, expr: at(f, KX12b), blink: sp.blink ?? lid(t, 2, swaps(KX12b)), mouth: sp.mouth, gaze: 1, visible: true };
  const head = heads(sp.head, accent("pop", f, T.jab, { amp: 0.8 }), accent("nod", f, T.give, { amp: 0.7 }));
  if (f <= T.release) return { ...base, pose: { kind: "idle", t }, hands: [null, roller(mapOpen(f), PULL_DX)], head };
  if (f < T.jab) return { ...base, pose: { kind: "idle", t }, hands: [null, path(f, [[T.release, roller(1, PULL_DX)], [T.jab - 1, rel(KING_PULL, facing, ...KING_COCK)]])], head };
  const aim = path(f, [[T.give, CITIES_MID], [T.give + 8, ZHAO_ON_MAP]]);
  return { ...base, pose: { kind: "point", t, arm: 1 }, hands: [null, aim], head };
};

const KX13: [number, Expr][] = [[S13.from, "grin"], [T.slide[0], "smug"]];
/** the point's target under the light (在演): lifted 12 cm, the chin up, the head tilted, no blinks (1077-1093) */
const ACT_LIFT = V(0, 0.12, 0);
/** the King of Qin at kingMap (13, 14): still pointing at Zhao on the map with the fake grin; the theatrical freeze
 *  under the light (1077-1093); then the arm comes down (1094-1104) and he watches the envoy, smug */
const kingMapState = (f: number): Extra => {
  const t = f / FPS, p = HALL.kingMap.clone();
  const act = smooth(lin(f, T.act, T.act + 4)) * (1 - smooth(lin(f, T.slide[0], T.slide[0] + 4)));
  const base = {
    at: p, facing: KING_F, expr: at(f, KX13), gaze: 1, visible: true,
    blink: f >= T.act && f < T.slide[0] ? 0 : lid(t, 2, swaps(KX13)),
    lookDown: -6 * act, head: { tilt: 6 * act },
  };
  // the arm comes down in FRONT of him (forward, then low): straight down from the map it swept through the official
  const fwd = rel(p, KING_F, 0.22, 1.15, 0.60), low = rel(p, KING_F, 0.22, 0.45, 0.32);
  if (f < T.slide[0] + 10) {
    const aim = f < T.slide[0] ? ZHAO_ON_MAP.clone().addScaledVector(ACT_LIFT, act) : path(f, [[T.slide[0], ZHAO_ON_MAP], [T.slide[0] + 5, fwd], [T.slide[0] + 10, low]]);
    return { ...base, pose: { kind: "point", t, arm: 1 }, hands: [null, aim] };
  }
  return { ...base, pose: { kind: "idle", t } };
};

/** 15: the half step toward the envoy (V11) and back */
const TO_LIN = V(HALL.mid.x - HALL.kingMap.x, 0, HALL.mid.z - HALL.kingMap.z).normalize();
const KING_STEP = HALL.kingMap.clone().addScaledVector(TO_LIN, 0.12), KING15_F = Math.atan2(TO_LIN.x, TO_LIN.z);
/** his left hand out for the jade, stopped short on the glance (his frame at KING_STEP, facing KING15_F). FIX ROUND: at
 *  (0.12, 1.02, 0.36) the hand was lost against the official's head and the map (f1251); now at shoulder height and
 *  long, toward the envoy, against the gold screen; his face eager (grin) through the reach and the glance */
const KING_REACH: Vec3 = [0.10, 1.27, 0.46];
const KX15: [number, Expr][] = [[S15.from, "grin"], [HIT.rage2, "shock"], [T.agree, "sigh"]];
/** the King of Qin in 15: the half step and the half reach (1244-1250), the glance at his guards off-screen left
 *  (1250-1253: the hand stops), the shock and the half step back as the envoy raises the jade (1256-1264), the sigh,
 *  the nod (1280); he watches the envoy go */
const king15 = (f: number): Extra => {
  const t = f / FPS;
  let p: V3, facing: number, pose: RigState["pose"];
  if (f < T.withdraw) {
    const leg = walkAlong([HALL.kingMap, KING_STEP], 0.9, (f - HIT.reach15) / FPS, { startFacing: KING_F, endFacing: KING15_F });
    p = leg.at; facing = leg.moving ? KING15_F : leg.facing; pose = leg.pose;
    if (!leg.moving && !leg.arrived) facing = KING_F;
  } else {
    // the half step back: a short slide keeping his face to the envoy (a walk would turn him round)
    const k = smooth(lin(f, T.withdraw, T.withdraw + 8));
    p = KING_STEP.clone().lerp(HALL.kingMap, k); facing = lerpA(KING15_F, KING_F, k); pose = { kind: "idle", t };
  }
  const rest = rel(p, facing, ...KING_REST1), reach = rel(KING_STEP, KING15_F, ...KING_REACH);
  const hand1 = f > T.withdraw + 7 ? null : path(f, [[HIT.reach15, rest], [HIT.glance, reach], [T.withdraw, reach], [T.withdraw + 7, rest]]);
  const glance = f >= HIT.glance && f < HIT.rage2;
  return {
    at: p, facing, pose, hands: [null, hand1], expr: at(f, KX15), blink: lid(t, 2, swaps(KX15)),
    gaze: glance ? -1 : 1,
    head: heads(glance ? { dx: -0.06, tilt: -4 } : undefined, accent("jolt", f, HIT.rage2 + 1, { amp: 0.8 }), accent("nod", f, HIT.nod, { amp: 1.3 })),
    visible: true,
  };
};

// ====================================================================================================== the envoy
/** his facing at mid (13-15): turned toward the king (screen left), 0.5 rad off the stageTwo lens */
const LIN_F = -0.7;
/** the walk in (12b-13, one clock): from the pillar straight to mid at 1.24 m/s from 1013 (HIT.linWalk + 2: from
 *  1011 his head reached 121 % x in map on 1039, its edge 1 % off the frame), so he is at 97 % x in stageTwo on 1040
 *  and arrives on 1058 */
const LIN_PATH = [HALL.pillar, HALL.mid], LIN_V = 1.24, LIN_GO = HIT.linWalk + 2;
/** in 15 he turns to face the king's reach (1244-1250): at LIN_F the frame-0 raise stood at 93 % x, by the edge */
const LIN_F15 = -1.0;
/** the exit (15): turned right, he walks east toward the door */
const LIN_EXIT = [HALL.mid, HALL.mid.clone().add(V(2.0, 0, 0))];
const linBody = (f: number): { at: V3; facing: number; pose: RigState["pose"]; moving: boolean } => {
  if (f < LIN_GO) return { at: HALL.pillar.clone(), facing: HALL.pillarFacing, pose: { kind: "idle", t: f / FPS + 0.4 }, moving: false };
  if (f < HIT.reach15) {
    const leg = walkAlong(LIN_PATH, LIN_V, (f - LIN_GO) / FPS, { startFacing: HALL.pillarFacing, endFacing: LIN_F });
    return { at: leg.at, facing: leg.facing, pose: leg.pose, moving: leg.moving };
  }
  if (f < T.walk) {
    const fc = lerpA(LIN_F, LIN_F15, smooth(lin(f, HIT.reach15, HIT.glance)));
    return { at: HALL.mid.clone(), facing: lerpA(fc, Math.PI / 2, smooth(lin(f, T.turn, T.turn + 5))), pose: { kind: "idle", t: f / FPS + 0.4 }, moving: false };
  }
  const leg = walkAlong(LIN_EXIT, 1.3, (f - T.walk) / FPS);
  return { at: leg.at, facing: leg.facing, pose: leg.pose, moving: leg.moving };
};
/** the jade's centre in his frame (x left, y up from his feet, z forward):
 *    CHEST  both hands, the pair grip GRIP down the rim (shot 6's hold: the hole on his middle, the arms slope down)
 *    BOWED  the same in the bow (salute leans him 19 deg), low and out: higher, his bowed head met it (12.6 cm)
 *    CHIN   the same lifted to his chin (shot 6's chin hold: the disc's top under his lower lip). From his quote
 *           (1112) on: in linStage (14) his head is 53 % of the frame wide and the chest hold's disc would reach
 *           1278 px, deep into the caption band (1190-1498); at the chin it ends on 1191
 *    ONE    standing on his left hand by its bottom edge, under his chin (14: his right hand is free)
 *    OUT    the same a little out and up (14, 大礼): his right arm opens wide and low; the left stays in: out wide
 *           (BIBLE's +-0.40) the disc would stand at 1001 px x below y 900 (the app's button column) or, raised,
 *           over his face (probe4)
 *    RAISE  THE FRAME-0 GRIP (15, 抢): his left hand up beside his head under the disc (the hook's HALL.jade0 in his
 *           frame at the pillar, 1 cm low as hook.ts holds it) */
const CHEST: Vec3 = [0, 0.905, 0.24], BOWED: Vec3 = [0, 0.74, 0.40], CHIN: Vec3 = [0, 0.975, 0.25];
/** WALKING the head tips forward 11-15 deg on each step (rig3d's walk) and met the chest hold's top (clearance 4.7
 *  cm): walking he carries it 6 cm lower and 3 cm further out (eased in and out round each walk) */
const WALK_DROP: Vec3 = [0, -0.06, 0.03];
/** the whip up to the raise and back goes OUT round his head (straight, the disc passed 11-18 cm through it): low at
 *  his left (LOWSIDE), then up beside it (SIDE) */
const LOWSIDE: Vec3 = [0.34, 0.98, 0.18], SIDE: Vec3 = [0.42, 1.22, 0.02];
const ONE: Vec3 = [0.06, 0.99, 0.27], OUT: Vec3 = [0.12, 1.00, 0.28];
const RAISE: Vec3 = (() => {
  const d = HALL.jade0.clone().sub(HALL.pillar), f = HALL.pillarFacing;
  return [Math.cos(f) * d.x - Math.sin(f) * d.z, d.y - 0.01, Math.sin(f) * d.x + Math.cos(f) * d.z];
})();
/** the pair grip: GRIP rad down the rim from the horizontal, at 0.12 m (segA shot 6); the rim grip: straight under */
const GRIP = 0.75, PAIR_R = 0.12;
/** his right hand's points in 14 (his frame). FIX ROUND: the two read as one picture (f1190 / f1210: the arm out to
 *  screen left both times), so they are now two shapes. OPEN_R (大王也得, 1163): small, the elbow bent, the palm toward
 *  the king at chest height. WIDE_R (大礼, 1205): a big arc out and UP, high and wide, his head tipped back (GRAND_CHIN)
 *  and a gold burst at the open hand on the bell (segC_ov ov14); the jade stays in his left hand at his chin (OUT) */
const OPEN_R: Vec3 = [-0.22, 1.05, 0.30], WIDE_R: Vec3 = [-0.38, 1.22, 0.10];
/** the head tipped back on 大礼 (lookDown, eased in with the arm, out on 我才交) */
const GRAND_CHIN = -14;
const grandK = (f: number) => ky(f, [[HIT.grand, 0], [HIT.grand + 6, 1], [T.hand, 1], [T.hand + 6, 0]]);
/** his idle hands (measured, his frame): the right hand drops here when it lets go of the jade (15), by way of a
 *  point out in front (straight down from the rim it passed through his robe: rig.qa.clear -34 mm) */
const LIN_REST0: Vec3 = [-0.161, 0.604, 0.035], LIN_DROP0: Vec3 = [-0.22, 0.80, 0.24];
/** the head while the jade is raised beside it (hook.ts: tilt toward the pillar side, shifted away from the disc) */
const RAISE_HEAD = { tilt: 8, dx: -0.19 };
/** his quote (line 14): he lifts the jade from his chest to his chin as it starts (1112-1120) */
const Q14 = quote("lin", 14);
/** where the jade's centre is in his frame on frame f, and the angle of his left hand down its rim */
const linHoldLocal = (f: number): { c: Vec3; a: number } => {
  const c = kv(f, [
    [Q14.from, CHEST], [Q14.from + 8, CHIN],
    [T.ask, CHIN], [T.ask + 6, ONE], [HIT.grand, ONE], [HIT.grand + 6, OUT], [T.hand, OUT], [T.hand + 6, CHIN],
    [HIT.rage2, CHIN], [HIT.rage2 + 1, LOWSIDE], [HIT.rage2 + 3, SIDE], [HIT.rage2 + 4, RAISE],
    [T.agree, RAISE], [T.agree + 3, SIDE], [T.agree + 6, LOWSIDE], [T.agree + 9, CHIN],
  ]);
  const a = ky(f, [[T.ask, GRIP], [T.ask + 6, Math.PI / 2], [T.hand, Math.PI / 2], [T.hand + 6, GRIP], [HIT.rage2, GRIP], [HIT.rage2 + 2, Math.PI / 2], [T.agree + 6, Math.PI / 2], [T.agree + 9, GRIP]]);
  const b = bowK(f), wk = walkK(f);
  const held = b > 0 ? (CHEST.map((v, i) => lerp(v, BOWED[i], b)) as Vec3) : c;
  const ex = exitK(f);
  return { c: held.map((v, i) => v + WALK_DROP[i] * wk + EXIT_LIFT[i] * ex) as Vec3, a };
};
/** how much of WALK_DROP is on: the walk in (eased over its first 6 frames and round its arrival) and the exit */
const ARRIVE = LIN_GO + walkTime(LIN_PATH, LIN_V) * FPS;
const walkInK = (f: number) => smooth(lin(f, LIN_GO, LIN_GO + 6)) * (1 - smooth(lin(f, ARRIVE - 3, ARRIVE + 4)));
const walkK = (f: number) => Math.max(walkInK(f), smooth(lin(f, T.turn, T.walk)));
/** THE EXIT CARRY (fix round): from the turn (1286) he carries the disc 1.5 cm higher and 3 cm closer in than
 *  WALK_DROP (f1294: its lower right stood at x 1036, y 947, inside the app's button column; now 1027, 940). Higher or
 *  closer, his head's walking nod went 3.9-4.1 cm into it (clearance, 1293-1295): the last 3 frames keep a 40 px corner
 *  of the disc below y 900 right of x 930 */
const EXIT_LIFT: Vec3 = [0, 0.015, -0.03];
const exitK = (f: number) => smooth(lin(f, T.turn, T.walk));
/** THE DISC'S FACE ON THE WALK IN (fix round): walking away at an angle the disc stood edge-on to the lens (f1050: |cos|
 *  0.11, a thin white blade). While he walks it turns in his hands toward the camera, FACE_K of the way (at most
 *  FACE_MAX) to the nearer of its two faces; the pair grip turns round its centre with it */
const FACE_K = 0.75, FACE_MAX = 0.96;
/** the bow of 也演 (1094-1111): down over 5 frames, held, up before his quote (1112) */
const bowK = (f: number) => ky(f, [[T.slide[0], 0], [T.slide[0] + 5, 1], [T.slide[0] + 11, 1], [HIT.swing + 17, 0]]);
const LX: [number, Expr][] = [[S12a.from, "stern"], [T.walkIn, "cool"], [T.slide[0], "focus"], [HIT.grand, "smile"], [T.hand, "smug"], [HIT.reach15, "stern"], [HIT.rage2, "huff"], [T.agree, "cool"]];
/** the yaw the rig DRAWS a standing figure's torso at (rig3d's "show yaw", step 1 of its solve, copied: the body turns
 *  toward the camera, softly up to 45 deg, and a figure turned far away goes over to its true back view). The jade
 *  and the hands that hold it are placed in this frame: in the true facing's frame they stood off the drawn chest
 *  on the walk in (walking away, 155 deg off the camera: the body is drawn 24 deg round) and on the exit turn
 *  (clearance: his arms 1.3-3.4 cm into his robe, the disc 2 cm into his head) */
const shownYaw = (cam: V3, at: V3, facing: number): number => {
  const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
  const hz = Math.hypot(cam.x - at.x, cam.z - at.z), vt = Math.max(Math.abs(cam.y - (at.y + 1)), 1e-3);
  const follow = sm((hz / vt - 0.35) / 0.6), camYaw = Math.atan2(cam.x - at.x, cam.z - at.z);
  const off = wrapA(facing - camYaw), aOff = Math.abs(off), maxB = Math.PI / 4, knee = 0.7 * maxB;
  const soft = aOff < knee ? aOff : knee + (maxB - knee) * (1 - Math.exp(-(aOff - knee) / (maxB - knee)));
  const wB = sm((aOff - (115 * Math.PI) / 180) / ((55 * Math.PI) / 180));
  return facing + follow * wrapA(camYaw + Math.sign(off) * lerp(soft, aOff, wB) - facing);
};
/** the envoy on frame f (12a-15) seen from `cam`: body, jade, hands, face. Returns the state and the jade's centre
 *  and turn */
const linState = (f: number, cam: V3): { state: Extra; c: V3; rot: number; wide: V3 } => {
  const t = f / FPS, B = linBody(f), H = linHoldLocal(f), Y = shownYaw(cam, B.at, B.facing);
  const c = rel(B.at, Y, ...H.c);
  // the disc's own yaw: the drawn torso's, turned toward the lens on the walk in (FACE_K)
  let gap = wrapA(Math.atan2(cam.x - c.x, cam.z - c.z) - Y);
  if (Math.abs(gap) > Math.PI / 2) gap = wrapA(gap - Math.PI * Math.sign(gap));
  const rotD = Y + Math.sign(gap) * Math.min(Math.abs(gap) * FACE_K, FACE_MAX) * walkInK(f);
  const r1 = lerp(PAIR_R, JADE.r, (H.a - GRIP) / (Math.PI / 2 - GRIP));
  const hand1 = rel(c, rotD, r1 * Math.cos(H.a), -r1 * Math.sin(H.a), 0);
  const pair0 = rel(c, rotD, -PAIR_R * Math.cos(GRIP), -PAIR_R * Math.sin(GRIP), 0);
  const L = (p: Vec3) => rel(B.at, Y, ...p);
  let hand0: V3 | null = pair0;
  if (f >= T.ask && f < HIT.rage2) hand0 = path(f, [[T.ask, pair0], [T.ask + 6, L(OPEN_R)], [HIT.grand, L(OPEN_R)], [HIT.grand + 6, L(WIDE_R)], [T.hand, L(WIDE_R)], [T.hand + 6, pair0]]);
  else if (f >= HIT.rage2 && f < T.agree + 3) hand0 = f < HIT.rage2 + 5 ? path(f, [[HIT.rage2, pair0], [HIT.rage2 + 2, L(LIN_DROP0)], [HIT.rage2 + 5, L(LIN_REST0)]]) : null;
  else if (f >= T.agree) hand0 = path(f, [[T.agree + 3, L(LIN_REST0)], [T.agree + 6, L(LIN_DROP0)], [T.agree + 9, pair0]]);
  // the face and the head
  const sp = speak(Q14, f, 1);
  const b = bowK(f), sal = b > 0 ? salute(b, B.at, B.facing, t) : {};
  const raise = smooth(lin(f, HIT.rage2, HIT.rage2 + 3)) * (1 - smooth(lin(f, T.agree, T.agree + 8)));
  const arrived = f >= LIN_GO && !B.moving && f < T.turn;
  const slow = ky(f, [[T.slowBlink, 0], [T.slowBlink + 3, 1], [T.slowBlink + 5, 1], [T.slowBlink + 8, 0]]);
  const gk = grandK(f);
  const state: Extra = {
    at: B.at, facing: B.facing, pose: B.pose, ...sal, ...(gk > 0 ? { lookDown: GRAND_CHIN * gk } : {}), hands: [hand0, hand1],
    expr: at(f, LX), mouth: sp.mouth,
    blink: slow > 0 ? slow : sp.blink ?? lid(t, 1, swaps(LX)),
    gaze: f < LIN_GO ? -1 : B.moving ? 0 : arrived ? -1 : 0,
    head: heads(sp.head, (sal as Extra).head, raise > 0 ? { tilt: RAISE_HEAD.tilt * raise, dx: RAISE_HEAD.dx * raise } : undefined,
      headPop(f, HIT.rage2), headPop(f, T.agree, [1.06, 1.03, 1.01])),
    visible: true,
  };
  return { state, c, rot: rotD, wide: L(WIDE_R) };
};

// ====================================================================================================== the shots
/** the stage's spot on a figure: its chest-and-head centre (0.25 m under the head's centre) and 0.55 m projected */
const spotOf = (w: World, r: Rig): Spot => {
  const hd = r.headWorld(), right = V().setFromMatrixColumn(w.camera.matrixWorld, 0).normalize();
  const c = w.project(hd.clone().add(V(0, -0.25, 0))), e = w.project(hd.clone().add(V(0, -0.25, 0)).addScaledVector(right, 0.55));
  return { x: c.x, y: c.y, r: Math.hypot(e.x - c.x, e.y - c.y) };
};
/** the stage's spot in the close-up (14). The stage's light cone ends in a straight edge across the frame at the spot's
 *  centre, ±r wide: on a 53 % head (r 0.55 m = 750 px) that edge crossed the whole frame through the jade (still
 *  f1190). In the close-up we stand inside the spot: its centre goes just under the frame and its clear circle
 *  reaches over his head (the cone's edge is off the frame, no darkness falls on him or the jade) */
const closeSpot = (w: World, r: Rig): Spot => {
  const h = headPx(w, r), y = 1925;
  return { x: h.x, y, r: (y - (h.y - 1.3 * h.r)) / 0.82 + 40 };
};
/** the king's head and crown on screen (12b): the head circle (headPx) widened to the crown's board and fringe, which
 *  stand out 0.30 m round his head's centre (mianCrown) and reach 0.22 m above it: the cities HUD leaves out a city
 *  whose point falls inside (the map is behind him) */
const crownPx = (w: World, r: Rig) => {
  const hd = r.headWorld(), c = w.project(hd), right = V().setFromMatrixColumn(w.camera.matrixWorld, 0).normalize();
  const e = w.project(hd.clone().addScaledVector(right, 0.30)), t = w.project(hd.clone().add(V(0, 0.22, 0)));
  return { x: c.x, y: c.y, rx: Math.abs(e.x - c.x), top: t.y };
};
/** 12b's CAMERA (fix round; CAMS.map, which only 12b used, stays as WP2 left it). CAMS.map stood low (1.58) and 22 deg
 *  east of the sheet's axis: the official's head and cap hid the sheet's lower right third and the king's crown its
 *  upper left (occ.ts: 27 % and 7 % of the sheet). This one stands 36 deg east of the axis and looks down 24 deg at the
 *  stand, 3.9 m off (camsearch.ts, a ray from the lens to 560 points of the sheet per frame): from 963 to 1039 the
 *  official hides 0 % of the sheet and the bottom roller shows (he kneels low under it, see the official), the king's
 *  crown fringe and his arm hide 2-4 % (the sheet's top-left corner, west of the cities), no city and no part of Zhao
 *  is hidden, and the king's hand on the roller is seen on every frame of the pull. E1 and E2 stay outside; W2 stands
 *  behind the king as before. The sheet 485-960 px x, 384-860 px y (under the chip, above the button column) */
const MAP_CAM: Cam = { pos: [1.534, 2.386, -0.118], look: [-0.56, 0.80, -3.0], fov: 40.7 };
/** every shot of C: the hall, the map stand from 12b on, the camera, the envoy (placed in all five). In 12b the envoy is
 *  set but NOT DRAWN: MAP_CAM looks across the floor his walk to mid crosses (1013-1039: he would come up from the
 *  frame's bottom right edge, 1022 on, and stand in it by 1039). He is outside 12b's story (the storyboard keeps him
 *  outside the frame); his clock runs on, so he is at 97 % x in 13 on 1040 as before */
const begin = (w: World, f: number, s: ShotDef, cam?: Cam) => {
  w.setPlace("hall");
  w.set.setMapStand(f >= BEAT.mapStand[0] && f <= BEAT.mapStand[1]);
  const camera = cam ?? CAMS[s.cam];
  w.setCamera(camera);
  const L = linState(f, w.camera.position), lin = w.actor(linFor(f));
  lin.set(s === S12b ? { ...L.state, visible: false } : L.state);
  return { camera, L, lin };
};
const putJade = (w: World, L: { c: V3; rot: number }) => w.prop("jade").put(L.c, { grip: "pair", rot: L.rot });
const putMap = (w: World, f: number) => w.prop("mapScroll").put(HALL.mapBar, { open: mapOpen(f) });

/** shot 12a (925-962, throne): the apology and the claps */
function shot12a(w: World, f: number): Pose {
  const { camera, L } = begin(w, f, S12a);
  const king = w.actor(KQ);
  king.set(king12a(king, f));
  w.update();
  putJade(w, L);
  return { camera, overlays: frag(...ov12a(f, { king: headPx(w, king) })), slate: slate(S12a, f < T.bow ? "sink" : f < T.unbow ? "bow" : "claps") };
}
/** shot 12b (963-1039, map): the map opens, the jab, the cities, the sweep toward Zhao */
function shot12b(w: World, f: number): Pose {
  const { camera } = begin(w, f, S12b, MAP_CAM);
  const king = w.actor(KQ);
  king.set(king12b(f));
  w.actor(PEOPLE.qinMinC).set(officialState(f));
  w.update();
  putMap(w, f);
  const pts = mapCitiesWorld(w.prop("mapScroll")).map((p) => { const q = w.project(p); return { x: q.x, y: q.y }; });
  return { camera, overlays: frag(...ov12b(f, { pts, king: crownPx(w, king) })), slate: slate(S12b, f <= T.release ? "pull" : f < T.give ? "point" : "to Zhao") };
}
/** shot 13 (1040-1162, stageTwo): he walks in; the stage; the bow; the suns */
function shot13(w: World, f: number): Pose {
  const { camera, L, lin } = begin(w, f, S13);
  const king = w.actor(KQ);
  king.set(kingMapState(f));
  w.actor(PEOPLE.qinMinC).set(officialState(f));
  w.update();
  putJade(w, L);
  putMap(w, f);
  const ov = ov13(f, { king: spotOf(w, king), lin: spotOf(w, lin), linHead: headPx(w, lin) });
  return { camera, overlays: frag(...ov), slate: slate(S13, f < T.act ? "walk in" : f < T.slide[0] ? "the king acts" : "he acts") };
}
/** shot 14 (1163-1243, linStage): his terms; the stage lifts */
function shot14(w: World, f: number): Pose {
  const { camera, L, lin } = begin(w, f, S14);
  w.actor(KQ).set(kingMapState(f));
  w.actor(PEOPLE.qinMinC).set(officialState(f));
  w.update();
  putJade(w, L);
  putMap(w, f);
  const wq = w.project(L.wide);
  return { camera, overlays: frag(...ov14(f, { lin: closeSpot(w, lin), hand: { x: wq.x, y: wq.y } })), slate: slate(S14, f < HIT.grand ? "five days" : f < T.hand ? "the ceremony" : "then I hand it over") };
}
/** shot 15 (1244-1295, stageTwo): the half reach, the rage raise, he agrees, the envoy leaves right */
function shot15(w: World, f: number): Pose {
  const { camera, L } = begin(w, f, S15);
  w.actor(KQ).set(king15(f));
  w.actor(PEOPLE.qinMinC).set(officialState(f));
  w.update();
  putJade(w, L);
  putMap(w, f);
  return { camera, overlays: frag(...ov15(f)), slate: slate(S15, f < HIT.rage2 ? "reach" : f < T.agree ? "raise" : f < T.turn ? "agrees" : "exit") };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[S12a, shot12a], [S12b, shot12b], [S13, shot13], [S14, shot14], [S15, shot15]];
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};
