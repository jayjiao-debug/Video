// SEGMENT B (frames 513-924), lines 7-11: the hall, the flaw, the retreat, the hook returns (STORYBOARD "Segment B").
// WP8.
//   7a   hallWide     the whip LEFT lands: he steps up onto the dais and bows with the jade held forward; the
//                     LOUNGING king (facing +0.35, seat.back +0.06, right hand on the 凭几, smug) reaches lazily
//   7b   presentTwo   the take at HALL.meet (533: glint, chip 秦王); he steps back down; 乐坏了: the king laughs with
//                     the jade beside his head; 传给美人们: both hands, then the right one passes it to lady A at
//                     HALL.pass (570: glint, chip 美人); tag 美人
//   8a   hallWide     万岁: lady A raises it one-handed (the frame-0 grip), the king cheers empty-handed, the ministers
//                     and guardL cheer; the 万岁 bursts; tag 秦国大臣; the envoy, ignored, backs off to HALL.mid
//   8b   linClose     deadpan, then cool; the thought bubble with five cities and a 「?」
//   9    presentTwo   他走上前: in from the right edge, the bow; "a flaw": he points, the ring on the jade; lady A gives
//                     it back to the king (730: chip 秦王); the king holds it out; THE HAND-OVER at HALL.meet (750)
//   10a  retreat      the jade held high in his left hand, he scuttles backward to the pillar; the king half-rises;
//                     his back meets E1 (800: shake)
//   10b  pillarClose  怒发冲冠: the swap LIN -> LIN_RAGE with the head pop, the rage strokes, the stamp; 再逼我
//   11   hook         THE OPENING SHOT RETURNS: hookPose(w, f, 852) (852 = frame 0 minus the subtitle and the tag); the
//                     glare and the lip-sync from 853; two taps; the feint again on 碎 with a punch-in; hud: false
// 7b / 9 film through PRESENT2 and 10b through PILLAR2: presentTwo / pillarClose a little wider and panned east, so
// the envoy's head and the raised jade stay inside the right edge ("B's own lenses" below; layout.ts is unchanged).
// ONE STAGING for 7a-10a (hallB): every figure's clock is the film frame and every walk one function of it, so a figure
// in two consecutive shots keeps its pose (rule 12); a shot picks its camera, its placed list (beats.ts) and its 2D
// layer (segB_ov.ts). THE JADE is one timeline (jadeB): its centre, its turn and the hands that hold it on every frame,
// pinned to points on its rim (it never floats: from 513 to 802 it is always in at least one hand).
// Every frame number is looked up (beats.ts HIT / TAG, segB_ov.ts TB, cap / capWord / quote); every mark and camera is
// layout.ts's. RIG FIELDS ONLY (BIBLE 5).
import * as THREE from "three";
import type { CamPose, Pose, Segment } from "../story";
import { SEGMENTS, FPS, lerp, lin, smooth, quote, easeOutCubic } from "../story";
import type { World } from "../world";
import { shot, HIT, type ShotDef, type PlacedCode } from "../beats";
import { CAMS, HALL, HALL_SET } from "../layout";
import { JADE } from "../props";
import { PEOPLE } from "../people";
import {
  V, rel, lid, at, ky, path, accent, heads, headPx, headM, headPop, speak, frag, seated, walkAlong, walkTime, alive,
  swaps, lerpA, wrapA, yawTo, whip, shake, salute, standing, halberdHand, stagger, type Rig, type RigState, type Leg,
} from "./common";
import { hookPose, hookLin, type Feint } from "./hook";
import { TB, SHOTS_B, ov7a, ov7b, ov8a, ov8b, ov9, ov10b } from "./segB_ov";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
type Hands = [THREE.Vector3 | null, THREE.Vector3 | null];
type Pair = [THREE.Vector3, THREE.Vector3];
const S = SEGMENTS[1];
const { S7a, S7b, S8a, S8b, S9, S10a, S10b, S11 } = SHOTS_B;
const slate = (s: ShotDef, more = "") => `${s.id} ${s.cam}${more ? " " + more : ""}`;
const px = (w: World, p: THREE.Vector3) => { const q = w.project(p); return { x: q.x, y: q.y }; };
const vlerp = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);
/** eased progress of f over [a, b] */
const ez = (f: number, a: number, b: number) => smooth(lin(f, a, b));

// ====================================================================================================== B's own lenses
/** 7b and 9: CAMS.presentTwo a little wider (fov 40 -> 43.5) and panned 3 cm east. At 40 the envoy's head and wrap
 *  went past the right edge at give (1077 px), on both walks over the rises (1113) and at the hand-over, while lady
 *  A's head touched the left edge (1 px). Now (edge probe, every frame 531-593 and 673-751) his head's right edge is
 *  <= 1049 px, lady A's left >= 35 px; the king's head 242-257 px tall (7a 141: the cut 7a -> 7b is 1.7x) */
const PRESENT2: CamPose = { ...CAMS.presentTwo, fov: 43.5, look: [CAMS.presentTwo.look[0] + 0.03, CAMS.presentTwo.look[1], CAMS.presentTwo.look[2]] };
/** 10b: CAMS.pillarClose panned 5 cm east and a little wider (fov 28 -> 28.8): at 28 the raised jade's rim was cut by
 *  the right edge (its disc to 1088 px with the tremble). Now its right edge <= 1054 px on every frame; his head's
 *  centre 46.5-48.6 % x (the hook's on 852: 50.4 %, the axial cut keeps it within 4 %) */
const PILLAR2: CamPose = { ...CAMS.pillarClose, fov: 28.8, look: [CAMS.pillarClose.look[0] + 0.05, CAMS.pillarClose.look[1], CAMS.pillarClose.look[2]] };

// ====================================================================================================== the jade's grips
const JR = JADE.r;
/** a point on the jade's rim in its own plane: angle phi (0 = the disc's local +x, PI = -x, -PI/2 = the bottom), rr
 *  from the centre (default 0.12: JADE_HANDS.pair, a hand just inside the rim), the disc turned `rot` (a yaw, as put) */
const rimAt = (c: THREE.Vector3, rot: number, phi: number, rr = 0.12) =>
  c.clone().add(V(Math.cos(rot) * Math.cos(phi) * rr, Math.sin(phi) * rr, -Math.sin(rot) * Math.cos(phi) * rr));
/** the pair grip (hand 0 at local -x = the holder's right when rot = the holder's facing) */
const pairOf = (c: THREE.Vector3, rot: number): Pair => [rimAt(c, rot, Math.PI), rimAt(c, rot, 0)];
/** the pair grip slid `a` rad down the rim (the arms slope down to the hands: segA's lowPair) */
const lowPairOf = (c: THREE.Vector3, rot: number, a = 0.75): Pair => [rimAt(c, rot, Math.PI + a), rimAt(c, rot, -a)];
/** one hand under the disc (the rim grip, the frame-0 grip): `d` rad either side of the bottom */
const under = (c: THREE.Vector3, rot: number, d = 0) => rimAt(c, rot, -Math.PI / 2 + d, JR);
/** the quadratic Bezier a -> b -> c at u (a way round a waypoint without stopping on it) */
const bez = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, u: number) => a.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(c, u * u);
/** a hand that travels from `a` (at f0) to `b` (at f1), eased */
const glide = (f: number, f0: number, f1: number, a: THREE.Vector3, b: THREE.Vector3) => vlerp(a, b, ez(f, f0, f1));

// ====================================================================================================== the marks of B
const KS = HALL.seat;
/** the floor point under the seat's top: the King of Qin's body frame (rel(KT, facing, x left, y WORLD height, z fwd)) */
const KT = V(KS.top.x, 0, KS.top.z);
const KSC = PEOPLE.qinWang.scale ?? 1;
const FG = HALL.giveFacing;
/** where his right hand rests on the 凭几 while he lounges (on its top, toward him) */
const ARMREST_HAND = V(-0.36, 0.655, -4.60);
/** THE TAKE (7b) and THE HAND-OVER (9): the disc's centre between them, face-on to presentTwo's lens (rot 0), its west
 *  rim on HALL.meet (the king's LEFT hand: only his left reaches across, WP1b rig.qa), its east rim in the envoy's right
 *  hand (0.22 m from his right shoulder) */
const C_TAKE = HALL.meet.clone().add(V(0.12, 0, 0));
/** beside the laughing king's head, on his left (screen right): his left hand under it. 9 cm further out and 11 cm
 *  lower than first built (0.40, 1.37): the crown's rightmost bead fringe crossed the disc's upper-left rim, and at
 *  (0.44, 1.34) it still touched it as the laugh tipped his head. Here the disc's rim stays 19-45 px (1080 frame)
 *  from his whole head group on 538-560 (WP8 fringe probe); his hand is in reach on every frame */
const R_LAUGH = (fc: number) => rel(KT, fc, 0.49, 1.26, 0.08);
/** in front of his chest, both hands under it (the change of hands) */
const C_CHEST = (fc: number) => rel(KT, fc, 0, 0.93, 0.33);
/** the way down from beside his head to his chest passes out in front of his left shoulder (straight, the disc's rim
 *  went 6 cm into his chin) */
const C_LAUGH_OUT = (fc: number) => rel(KT, fc, 0.38, 1.06, 0.36);
/** lady A's side of HALL.pass: the disc's centre as she takes it (her hands under it, the king's right hand on its
 *  east side). Low enough to clear her bowed head */
const C_PASS = V(-0.50, 1.12, -4.50);
/** lady A: her facing at rest (between the lens and the king), her bow toward the king, her chest hold and the
 *  one-handed raise of 8a (her right hand, screen left, the frame-0 grip) in her own frame */
const LA_F = 0.7, LA_BOW = Math.PI / 2, LA_CHEST: [number, number, number] = [0, 0.90, 0.22];
const LA_RAISE_F = 0.35, LA_RAISE_HAND: [number, number, number] = [-0.325, 1.255, 0.15];
/** the raised disc's turn: face-on to hallWide's lens (rot 0; at her facing + 0.8 it showed edge-on, a grey sliver) */
const LA_RAISE_ROT = 0;
/** the raise goes up round her right side (straight up from her chest the disc passed 12 cm through her face) */
const LA_RAISE_SIDE: [number, number, number] = [-0.36, 1.00, 0.30];
const laChest = (fc: number) => rel(HALL.ladyA, fc, ...LA_CHEST);
/** the envoy's hold of the disc in front of him while he walks, bows and backs away (his own frame) */
const LIN_CARRY: [number, number, number] = [0, 0.93, 0.26], LIN_OFFER: [number, number, number] = [0, 0.90, 0.36];
/** walking his head tips forward 11-15 deg on each step and met the top of the carry (segC's WALK_DROP): 6 cm lower
 *  and 3 cm further out */
const LIN_CARRY_W: [number, number, number] = [0, 0.87, 0.29];
/** the frame-0 grip in his own frame (from HALL.jadeHand0 at the pillar): carried high through the scuttle */
const HIGH_REL = (() => {
  const d = HALL.jadeHand0.clone().sub(HALL.pillar), f = HALL.pillarFacing;
  return [d.x * Math.cos(f) - d.z * Math.sin(f), d.y, d.x * Math.sin(f) + d.z * Math.cos(f)] as [number, number, number];
})();
/** the way up into the high grip bends out round his left side, clear of his face (the Bezier's middle point: the
 *  disc's centre passes about half way to it; his own frame) */
const HIGH_SIDE: [number, number, number] = [0.50, 1.08, 0.22];
/** THE HANGING HANDS of this cast, measured (rig idle, hands free; own frame x left, y up, z fwd: WP8 probe): a pinned
 *  hand lets go by travelling here first, so nothing jumps when the pin is dropped (common.hang is Hongmen's cast,
 *  1.5-2.6 cm off) */
const REST = {
  lin: [[-0.156, 0.606, 0.054], [0.164, 0.600, 0.026]] as [number, number, number][],
  ladyA: [[-0.159, 0.586, 0.036], [0.158, 0.580, 0.044]] as [number, number, number][],
};
const linRest = (L: { at: THREE.Vector3; facing: number }, i: 0 | 1) => rel(L.at, L.facing, ...REST.lin[i]);
const laRest = (fc: number, i: 0 | 1) => rel(HALL.ladyA, fc, ...REST.ladyA[i]);
/** the scuttle's grip: the frame-0 grip brought 11 cm forward and 2 cm in, so it stays in reach at the low point of
 *  every step (at the frame-0 grip the left hand fell 5 cm short there); it eases into the frame-0 grip as he stops */
const HIGH_WALK: [number, number, number] = [HIGH_REL[0], HIGH_REL[1] - 0.02, HIGH_REL[2] + 0.14];
/** his right hand out for balance while he scuttles (his own frame) */
const BALANCE: [number, number, number] = [-0.33, 0.96, 0.09];

// ====================================================================================================== the envoy's way
/** HIS MARK ON THE DAIS: HALL.give 3 cm further east (his robe hangs 0.20 m round him: on give itself his hem met the
 *  榻's east edge as he bowed and his leg its corner at the hand-over, 1.2-2.4 cm; clearance). 5 cm also clears but put
 *  his head on presentTwo's right edge (90 % x) */
const GIVE = HALL.give.clone().add(V(0.03, 0, 0));
/** THE RISES (HALL_SET): the dais and the step in front of it. His robe is a bell 0.20 m round him (over a striding
 *  leg 0.29 m) and the rig plants his feet at at.y, so a walk over an edge put the hem and a foot into the higher stone
 *  (clearance 13.5 cm). So near an edge he takes short steps (half stride STAIR_S: hem and feet within HEM_R of him;
 *  WP8 hem probe) and stands at the height of the highest stone within that reach (eased in over HEM_D before it): the
 *  hem never enters the higher stone; for a few frames one foot is over the lower one */
const RISES = [HALL_SET.dais, HALL_SET.step];
const HEM_R = 0.205, HEM_D = 0.06, STAIR_S = 0.13;
type Box = { x0: number; x1: number; z0: number; z1: number; top: number };
/** the xz distance from p to a rise (0 on it) */
const boxDist = (p: THREE.Vector3, b: Box) => Math.hypot(Math.max(b.x0 - p.x, 0, p.x - b.x1), Math.max(b.z0 - p.z, 0, p.z - b.z1));
/** the distance from p to the nearest edge where the floor's height changes */
const edgeDist = (p: THREE.Vector3) => {
  let d = 9;
  for (const b of RISES) { const o = boxDist(p, b); d = Math.min(d, o > 0 ? o : Math.min(p.x - b.x0, b.x1 - p.x, p.z - b.z0, b.z1 - p.z)); }
  return d;
};
/** the height he stands at: the highest stone within r of him (eased over HEM_D beyond r) */
const floorUnder = (p: THREE.Vector3, r: number) => RISES.reduce((y, b) => Math.max(y, b.top * (1 - smooth((boxDist(p, b) - r) / HEM_D))), 0);
/** his half stride at p (the walk's own, sNat, away from the edges; STAIR_S within 0.22 m of one) and the reach of his
 *  hem and feet at that stride (the front foot reaches 0.065 m beyond the half stride: hem probe) */
const strideAt = (p: THREE.Vector3, sNat: number) => lerp(STAIR_S, sNat, smooth((edgeDist(p) - 0.22) / 0.30));
const hemR = (s: number) => Math.max(HEM_R, s + 0.075);
/** A WALK OVER THE RISES: walkAlong's way and facing, d metres along pts (the caller's clock: steady or eased), the
 *  floor under his hem, the stride shortened near the edges and the walk's phase integrated along the path (so the
 *  feet stay planted when the steps change length); `look` = walk backward facing that point (phase reversed) */
const stairLeg = (pts: THREE.Vector3[], d: number, sNat: number, o: { bounce?: number; look?: THREE.Vector3 } = {}): LinLeg => {
  const L = walkAlong(pts, 1, Math.max(1e-4, d)), Lt = L.d + L.left;
  // THE ENDS OF A WALK: shorter steps and no bounce over the first and the last 0.3 m. A long stride carries the hip
  // lower than idle (legs apart) and the bounce's low point could fall on the last frame: on arrival the head snapped
  // up to idle's height in one frame (25-40 px in presentTwo). The stride shortens to ENDS_S of its own at the very end
  const endK = (dd: number) => smooth(Math.min(dd, Lt - dd) / 0.3);
  const strideOf = (p: THREE.Vector3, dd: number) => strideAt(p, sNat) * lerp(ENDS_S, 1, endK(dd));
  const s = strideOf(L.at, d), at = L.at.clone();
  at.y = floorUnder(at, hemR(s));
  const n = Math.max(1, Math.ceil(d / 0.01)), ds = d / n;
  let ph = 0;
  for (let i = 0; i < n; i++) ph += (0.3 * ds) / strideOf(walkAlong(pts, 1, (i + 0.5) * ds).at, (i + 0.5) * ds);
  ph %= 1;
  const facing = o.look ? yawTo(at, o.look) : L.facing;
  return { ...L, at, facing, pose: { kind: "walk", phase: o.look ? (1 - ph) % 1 : ph, stride: s, amount: (o.bounce ?? 1) * endK(d) } };
};
const ENDS_S = 0.5;
/** a steady walk over the rises (walkAlong's clock: t seconds after setting off; idle before and after, on the floor
 *  under his hem) */
const stairWalk = (pts: THREE.Vector3[], v: number, t: number, o: { endFacing?: number; startFacing?: number } = {}): LinLeg => {
  const Lt = walkTime(pts, 1);
  if (t <= 0 || v * t >= Lt) { const L = walkAlong(pts, v, t, o); L.at.y = floorUnder(L.at, HEM_R); return L; }
  return stairLeg(pts, v * t, Math.min(0.27, Math.max(0.1, 0.225 * v)));
};
/** up from the floor onto the step and the dais to GIVE (7a), east of the 榻's corner */
const LIN_UP = [V(0.66, 0, -3.56), V(0.80, 0, -3.90), GIVE];
/** THE WAY ROUND THE 榻's SOUTH-EAST CORNER (0.60, -4.15) between GIVE and HALL.present in presentTwo (7b, 9): the two
 *  tangent points of a circle 0.215 m round the corner (his hem reaches HEM_R 0.205 at the short stride there). The
 *  straight line GIVE -> present is nearly on one of presentTwo's rays (both 88 % x) but passes 0.163 m from the
 *  corner; the old waypoint (0.80, -3.90) bent 0.10 m east of it, toward the lens and frame right, and took his head
 *  past the right edge mid-walk (93 % x); these bend 0.05 m */
const CORNER_WAY = [V(0.815, 0, -4.12), V(0.80, 0, -4.07)];
/** HIS MARK IN FRONT OF THE STEP IN B (7b's end, 8a's start, 9's bow and point): HALL.present 0.15 m west and 0.15 m
 *  south. HALL.present is 0.30 m from the step: his hem reached it within his first stride, so the floor height rose
 *  (or, coming down, settled) while he stood; from here he takes 3-4 strides on the flat first. It is also on a
 *  presentTwo ray 1.3 deg further left (88 -> 83 % x). The leg from CORNER_WAY to it passes 0.214 m from the corner */
const PRESENT_B = V(0.40, 0, -3.30);
/** from PRESENT_B up to GIVE again (9) */
const LIN_UP2 = [PRESENT_B, CORNER_WAY[1], CORNER_WAY[0], GIVE];
/** back down from GIVE to PRESENT_B (7b) */
const LIN_DOWN = [GIVE, CORNER_WAY[0], CORNER_WAY[1], PRESENT_B];
/** THE SCUTTLE (10a): backward from GIVE down the step to HALL.retreatTurn, east of the middle (clear of E2), bent
 *  west past E1 (his balancing right hand met its west face, 10 cm, on the straight line) */
const LIN_SCUTTLE = [GIVE, V(0.92, 0, -3.80), V(0.80, 0, -1.45), V(0.82, 0, -0.85), HALL.retreatTurn];
/** 7a slower than a stride's natural pace (short steps up the rises); 7b down at 1.2 (1.2 m: he stands at PRESENT_B
 *  from 566, long before 8a); 9 up from the end of the point to the hand-over */
const UP_V = 1.2, DOWN_V = 1.2, IN_V = 1.65;
const UP2_V = walkTime(LIN_UP2, 1) / ((TB.stepUp2[1] - TB.stepUp2[0]) / FPS);
/** he set off before the whip landed (the walk is under way on 513) and stands on GIVE on 520 */
const T_UP0 = TB.stepUp[1] - walkTime(LIN_UP, UP_V) * FPS;
/** his facing at present after the step down (within 45 deg of presentTwo's lens, eyes to the king); in 8b (to
 *  linClose's lens); his bow at present in 9 (112 deg off presentTwo's lens: clear of the forbidden band) */
const PRESENT_F = -0.9, F8B = 0.12, BOW_F = -2.25;
/** the backward walks: 8a present -> mid (arrives 4 frames before the cut, then turns to the lens), 10a the scuttle */
const BACK_V = PRESENT_B.distanceTo(HALL.mid) / ((S8a.to - 4 - TB.backOff) / FPS);
/** THE SCUTTLE'S CLOCK: metres done u (0..1) of the way through it: careful backward steps down the rises (SC_V0),
 *  quicker on the floor (the top speed solved so he stops on retreatTurn on TB.spin[0]), slowing into the stop */
const SC_L = walkTime(LIN_SCUTTLE, 1), SC_T = (TB.scuttle[1] - TB.scuttle[0]) / FPS, SC_V0 = 1.2, SC_V1 = 1.0, SC_A = 0.35, SC_B = 0.8;
const SC_VM = (SC_L / SC_T - (SC_A / 2) * SC_V0 - ((1 - SC_B) / 2) * SC_V1) / (SC_A / 2 + (SC_B - SC_A) + (1 - SC_B) / 2);
const scuttleD = (u: number) => {
  const k = Math.min(1, Math.max(0, u)), T = SC_T;
  if (k < SC_A) return T * (SC_V0 * k + ((SC_VM - SC_V0) * k * k) / (2 * SC_A));
  const dA = T * SC_A * (SC_V0 + SC_VM) / 2;
  if (k < SC_B) return dA + T * SC_VM * (k - SC_A);
  const dB = dA + T * SC_VM * (SC_B - SC_A), q = k - SC_B;
  return dB + T * (SC_VM * q + ((SC_V1 - SC_VM) * q * q) / (2 * (1 - SC_B)));
};
/** a walk backward along pts, facing `look` (a point) all the way; the steps run backward (the phase reversed, so the
 *  feet stay planted) */
const backAlong = (pts: THREE.Vector3[], speed: number, t: number, look: THREE.Vector3, bounce = 1): Leg => {
  const L = walkAlong(pts, speed, t, { bounce });
  const facing = yawTo(L.at, look);
  if (!L.moving) return { ...L, facing };
  return { ...L, facing, pose: { ...L.pose, phase: (1 - (L.pose.phase ?? 0)) % 1 } };
};
type LinLeg = Leg & { turn?: number };
/** WHERE THE ENVOY IS on frame f (513-802): one function, so every cut keeps his walk (rule 12). The floor height
 *  here is the one his hem asks for (it steps by a whole stone in about 2 frames: linLeg smooths it in time) */
const linLegRaw = (f: number): LinLeg => {
  const t = f / FPS;
  if (f < TB.stepDown[0]) return stairWalk(LIN_UP, UP_V, (f - T_UP0) / FPS, { endFacing: FG });
  if (f < TB.backOff) return stairWalk(LIN_DOWN, DOWN_V, (f - TB.stepDown[0]) / FPS, { endFacing: PRESENT_F });
  if (f < S8b.from) {
    const L = backAlong([PRESENT_B, HALL.mid], BACK_V, (f - TB.backOff) / FPS, KT, 0.6);
    if (!L.arrived) return { ...L, turn: 1 };
    const k = ez(f, S8a.to - 4, S8a.to);                              // he turns to the lens at the end of 8a
    return { ...L, facing: lerpA(L.facing, F8B, k), turn: 1 - k };
  }
  if (f < TB.walkUp[0]) return { at: HALL.mid.clone(), facing: F8B, pose: { kind: "idle", t: t + 0.4 }, moving: false, arrived: true, d: 0, left: 0 };
  if (f < TB.stepUp2[0]) return stairWalk([HALL.mid, PRESENT_B], IN_V, (f - TB.walkUp[0]) / FPS, { startFacing: Math.PI + 0.1, endFacing: BOW_F });
  if (f < TB.scuttle[0]) return stairWalk(LIN_UP2, UP2_V, (f - TB.stepUp2[0]) / FPS, { startFacing: BOW_F, endFacing: FG });
  // a low scuttle (bounce 0.3: at the full walk bounce the body dropped 6-9 cm and the raised hand fell out of reach)
  // His first steps back from the hand-over (750, 751: still in 9) keep his face to the lens and turn him from
  // giveFacing to face the king over 4 frames; the back view (turn 1) starts on the cut to 10a. (He snapped from a
  // three-quarter face on 749 to the back of his head on 750, the glint frame, and 50 deg of facing in one frame.)
  if (f < TB.spin[0]) {
    const L = stairLeg(LIN_SCUTTLE, scuttleD((f - TB.scuttle[0]) / (TB.scuttle[1] - TB.scuttle[0])), 0.27, { bounce: 0.3, look: KT });
    return { ...L, facing: lerpA(FG, L.facing, ez(f, TB.scuttle[0], TB.scuttle[0] + 4)), turn: f < S10a.from ? 0 : 1 };
  }
  // the spin to face front at retreatTurn (794-797), the step back onto the pillar (797-800), then the pillar
  const back = yawTo(HALL.retreatTurn, KT);
  if (f < TB.spin[1]) {
    const k = ez(f, TB.spin[0], TB.spin[1]);
    return { at: HALL.retreatTurn.clone(), facing: back + wrapA(HALL.pillarFacing - back) * k, pose: { kind: "idle", t: t + 0.4 }, moving: false, arrived: true, d: 0, left: 0, turn: 1 - k };
  }
  const k = easeOutCubic(lin(f, TB.spin[1], TB.bump));
  return { at: vlerp(HALL.retreatTurn, HALL.pillar, k), facing: HALL.pillarFacing, pose: { kind: "idle", t: t + 0.4 }, moving: false, arrived: true, d: 0, left: 0, turn: 0 };
};
/** THE STEPS IN TIME: the height his hem asks for (linLegRaw) changes by a whole stone (0.15 m, about 100 px in
 *  presentTwo) in about 2 frames, which read as a hop. Here it is dilated by STEP_K frames each side and then averaged
 *  over the same window: never below what the hem needs (no clipping), and each change takes 2 STEP_K + 1 frames
 *  (it starts when the hem leaves a stone, or ends as it reaches one; 2 x 0.15 m in a row run together) */
const STEP_K = 2;
const rawCache = new Map<number, LinLeg>();
const legRaw = (f: number) => {
  let L = rawCache.get(f);
  if (!L) { if (rawCache.size > 128) rawCache.clear(); L = linLegRaw(f); rawCache.set(f, L); }
  return L;
};
const linLeg = (f: number): LinLeg => {
  const L = legRaw(f);
  let sum = 0;
  for (let j = -STEP_K; j <= STEP_K; j++) { let m = 0; for (let i = -STEP_K; i <= STEP_K; i++) m = Math.max(m, legRaw(f + j + i).at.y); sum += m; }
  return { ...L, at: L.at.clone().setY(sum / (2 * STEP_K + 1)) };
};

// ====================================================================================================== the King of Qin
/** his facing on the 榻 (eased keys): lounging toward the envoy's side for the take, toward lady A for the pass */
const K_FACE: [number, number][] = [
  [S7a.from, 0.35], [TB.meet[1] + 3, 0.35], [TB.lift[1], 0.15], [TB.toChest[0], 0.15], [TB.pass[0] + 2, -0.12], [TB.ladyUp[1], 0],
  [TB.giveBack[0] - 4, 0], [TB.giveBack[0] + 2, -0.12], [TB.chest2[1], 0.1], [TB.handBack[0] - 4, 0.35], [TB.rise[0], 0.35], [TB.rise[1], 0], [S10a.to, 0],
];
/** how far back he sits (seat.back): lounging +0.06, forward for every hand-over (-0.10, HALL.meet) */
const K_BACK: [number, number][] = [
  [S7a.from, 0.06], [HIT.reach, 0.06], [TB.meet[0], -0.10], [TB.meet[1] + 3, -0.10], [TB.lift[1] + 2, 0.03],
  [TB.chest2[1], 0.03], [TB.handBack[0] - 2, -0.10], [TB.handBack[1] + 2, -0.10], [TB.rise[0], 0.03], [S10a.to, 0.03],
];
/** the king's empty-handed cheer (8a): his hands out and up beside his head (x either side, y world, z forward, in his
 *  body frame); at +-0.25, 1.30, 0.24 they sat on the edges of his own big head and only the face said 'cheer'. His
 *  arms are short: +-0.38 at 1.40 was 9 cm out of reach, so the hands go wide at about the head's centre height and
 *  only 0.10 forward (WP8 grid: the widest pins with reach <= 4 mm and clear >= 0 at y 1.30-1.34) */
const K_CHEER: [number, number, number] = [0.38, 1.31, 0.10];
/** the king's two lap rests at this facing and back (the measured rests, moved with the hip) */
const kLap = (fc: number, back: number, dy = 0): Pair => {
  const z = 0.20 + (0.03 - back) * 0.9;
  return [rel(KS.top, fc, -0.11, 0.26 + dy, z), rel(KS.top, fc, 0.11, 0.26 + dy, z)];
};
const KEXPR: [number, Expr][] = [
  [S7a.from, "smug"], [HIT.take, "grin"], [HIT.laugh, "laugh"], [TB.laughEnd, "happy"], [HIT.cheer, "laugh"], [S8b.to - 6, "happy"],
  [TB.flaw, "focus"], [TB.giveBack[0], "smile"], [TB.handBack[1] + 3, "nervous"], [HIT.jadeBack + 6, "shock"],
];

// ====================================================================================================== lady A's facing
/** lady A's facing on frame f: at rest LA_F; turned to the king for the two passes (565-570, 724-730); a little
 *  toward the lens for the raise of 8a (lowered again in 8b, off screen) */
const laFacing = (f: number) => {
  if (f < TB.pass[0] - 2) return LA_F;
  if (f < TB.ladyUp[0]) return lerpA(LA_F, LA_BOW, ez(f, TB.pass[0] - 2, TB.pass[0] + 2));
  if (f < S8a.from) return lerpA(LA_BOW, LA_F, ez(f, TB.ladyUp[0], TB.ladyUp[1]));
  if (f < S9.from) return lerpA(LA_F, LA_RAISE_F, laRaise(f));
  if (f < TB.giveBack[0]) return LA_F;
  return lerpA(lerpA(LA_F, LA_BOW, ez(f, TB.giveBack[0], TB.giveBack[0] + 4)), LA_F, ez(f, TB.giveBack[1] + 1, TB.giveBack[1] + 7));
};
/** how far up lady A's raise is (8a: up on 万岁; down again inside 8b, where she is not placed) */
const laRaise = (f: number) => (f >= HIT.cheer && f < S9.from ? ez(f, TB.raise[0], TB.raise[1]) * (1 - ez(f, S8b.from + 6, S8b.to - 6)) : 0);
/** lady A's bow (salute) for the two passes, 0..1 */
const laBow = (f: number) =>
  f >= TB.pass[0] && f < S8a.from ? ez(f, TB.pass[0], TB.pass[1]) * (1 - ez(f, TB.ladyUp[0], TB.ladyUp[1]))
    : f >= TB.giveBack[0] && f < TB.giveBack[1] + 8 ? ez(f, TB.giveBack[0], TB.giveBack[0] + 4) * (1 - ez(f, TB.giveBack[1] + 2, TB.giveBack[1] + 8)) : 0;

// ====================================================================================================== THE JADE
type JadeB = { c: THREE.Vector3; rot: number; lin: Hands; king: Hands; ladyA: Hands };
const N: Hands = [null, null];
/** THE JADE on frame f (513-802): its centre, its turn (a yaw), the hands that hold it (null = that hand is free).
 *  `L` = the envoy's leg on f, `kfc` / `kback` = the king's facing and back on f. At THE TAKE and THE HAND-OVER the disc
 *  stands face-on to presentTwo's lens (rot 0) between the two: the envoy's right hand on its east rim, the king's left
 *  on its west rim (= HALL.meet, the one point both reach: WP1b rig.qa); a hand that changes grip slides along the rim */
const jadeB = (f: number, L: LinLeg, kfc: number, kback: number): JadeB => {
  const lapK = kLap(kfc, kback), linHold = (o: [number, number, number]) => rel(L.at, L.facing, ...o);
  const W_ = Math.PI, E_ = 0, B_ = -Math.PI / 2;                    // rim angles at rot 0: west, east, bottom
  // ---- 7a: he carries it up, bows with it held forward in both hands; 527 the king's lazy reach: the disc goes out
  //      to C_TAKE and turns face-on, his left hand lets go, his right slides round under it to the east rim
  if (f < TB.meet[0]) {
    const bk = ez(f, TB.bow[0], TB.bow[1]), o = LIN_CARRY_W.map((v, i) => lerp(v, LIN_OFFER[i], bk)) as [number, number, number];
    const off = linHold(o);
    if (f < HIT.reach) return { c: off, rot: L.facing, lin: pairOf(off, L.facing), king: N, ladyA: N };
    const k = ez(f, HIT.reach, TB.meet[0]), c = vlerp(off, C_TAKE, k), rot = lerpA(L.facing, 0, k), p = pairOf(c, rot);
    const lin: Hands = [rimAt(c, rot, lerp(Math.PI, 2 * Math.PI, k)), glide(f, HIT.reach, TB.meet[0] - 1, p[1], linRest(L, 1))];
    return { c, rot, lin, king: [null, glide(f, HIT.reach, TB.meet[1], lapK[1], rimAt(C_TAKE, 0, W_))], ladyA: N };
  }
  if (f < TB.lift[0]) {
    const c = C_TAKE.clone(), e = rimAt(c, 0, E_);
    const lin: Hands = [f <= HIT.take ? e : f < TB.letGo ? glide(f, HIT.take, TB.letGo, e, linRest(L, 0)) : null, null];
    return { c, rot: 0, lin, king: [null, f <= HIT.take ? glide(f, HIT.reach, TB.meet[1], lapK[1], rimAt(c, 0, W_)) : rimAt(c, 0, W_)], ladyA: N };
  }
  // ---- 7b: up beside his head (his left hand slides under it: the frame-0 grip), the laugh (it bounces with him),
  //      down to his chest where the right hand joins under it, the right hand carries it to lady A at HALL.pass
  if (f < TB.toChest[0]) {
    const k = ez(f, TB.lift[0], TB.lift[1]);
    const bounce = f >= HIT.laugh && f < TB.laughEnd ? 0.018 * Math.abs(Math.sin((Math.PI * 3 * (f - HIT.laugh)) / (TB.laughEnd - HIT.laugh))) : 0;
    const c = vlerp(C_TAKE, R_LAUGH(kfc), k).add(V(0, bounce, 0));
    return { c, rot: 0, lin: N, king: [null, rimAt(c, 0, lerp(W_, 1.5 * Math.PI, k), lerp(0.12, JR, k))], ladyA: N };
  }
  if (f < TB.pass[0]) {
    const k = ez(f, TB.toChest[0], TB.toChest[1]), c = bez(R_LAUGH(kfc), C_LAUGH_OUT(kfc), C_CHEST(kfc), k);
    return { c, rot: 0, lin: N, king: [glide(f, TB.toChest[0], TB.toChest[1], lapK[0], under(c, 0, -0.36)), under(c, 0, 0.36 * k)], ladyA: N };
  }
  const ladyTake = (c: THREE.Vector3, rot: number): Pair => [under(c, rot, -0.42), under(c, rot, 0.42)];
  if (f < TB.ladyUp[0]) {
    const k = ez(f, TB.pass[0], TB.pass[1]), c = vlerp(C_CHEST(kfc), C_PASS, k);
    const kh0 = rimAt(c, 0, lerp(B_ - 0.36, E_, k), lerp(JR, 0.12, k));
    const kh1 = f < TB.pass[0] + 4 ? glide(f, TB.pass[0], TB.pass[0] + 4, under(c, 0, 0.36), lapK[1]) : null;
    // her hands rise to where the disc will be (C_PASS), not after it: it comes into her reach as they arrive
    const fc = laFacing(f), tk = ladyTake(C_PASS, 0);
    const lady: Hands = [glide(f, TB.pass[0], TB.pass[1], laRest(fc, 0), tk[0]), glide(f, TB.pass[0], TB.pass[1], laRest(fc, 1), tk[1])];
    return { c, rot: 0, lin: N, king: [kh0, kh1], ladyA: lady };
  }
  if (f < S8a.from) {
    const k = ez(f, TB.ladyUp[0], TB.ladyUp[1]), fc = laFacing(f);
    const c = vlerp(C_PASS, laChest(fc), k), rot = lerpA(0, fc, k), a = ladyTake(c, rot), b = lowPairOf(c, rot);
    const kh: THREE.Vector3 | null = f <= TB.kingFree ? rimAt(c, rot, E_) : f < TB.kingFree + 5 ? glide(f, TB.kingFree, TB.kingFree + 5, rimAt(C_PASS, 0, E_), lapK[0]) : null;
    return { c, rot, lin: N, king: [kh, null], ladyA: [vlerp(a[0], b[0], k), vlerp(a[1], b[1], k)] };
  }
  // ---- 8a: lady A raises it one-handed (her right hand: screen left); 8b: she lowers it to her chest (not placed)
  if (f < S9.from) {
    const up = laRaise(f), fc = laFacing(f), chest = laChest(fc), hand = rel(HALL.ladyA, fc, ...LA_RAISE_HAND);
    const rot = lerpA(fc, LA_RAISE_ROT, up), c = bez(chest, rel(HALL.ladyA, fc, ...LA_RAISE_SIDE), hand.clone().add(V(0, JR, 0)), up), lp = lowPairOf(c, rot);
    const h0 = vlerp(lp[0], under(c, rot), up);
    const h1 = up <= 0 ? lp[1] : up < 0.35 ? vlerp(lp[1], laRest(fc, 1), up / 0.35) : null;
    return { c, rot, lin: N, king: N, ladyA: [h0, h1] };
  }
  // ---- 9: at her chest; 瑕 the ring; she gives it back at HALL.pass; the king's change of hands; THE HAND-OVER
  if (f < TB.giveBack[0]) { const c = laChest(LA_F); return { c, rot: LA_F, lin: N, king: N, ladyA: lowPairOf(c, LA_F) }; }
  // she lets go into her own hands held out in front (while still bowed), then they drop to her sides as she
  // straightens (g1 .. g1 + 8: over the next two branches too)
  const g1 = TB.giveBack[1];
  const ladyFree = (): Hands => {
    const lf = laFacing(f), b = ladyTake(C_PASS, 0);
    const fr = [rel(HALL.ladyA, lf, -0.08, 0.88, 0.33), rel(HALL.ladyA, lf, 0.08, 0.88, 0.33)];
    return f < g1 + 3 ? [glide(f, g1, g1 + 3, b[0], fr[0]), glide(f, g1, g1 + 3, b[1], fr[1])]
      : f < g1 + 8 ? [glide(f, g1 + 3, g1 + 8, fr[0], laRest(lf, 0)), glide(f, g1 + 3, g1 + 8, fr[1], laRest(lf, 1))] : N;
  };
  if (f < TB.chest2[0]) {
    const k = ez(f, TB.giveBack[0], TB.giveBack[0] + 4), fc = laFacing(Math.min(f, g1));
    const c = vlerp(laChest(fc), C_PASS, k), rot = lerpA(fc, 0, k), a = lowPairOf(c, rot), b = ladyTake(c, rot);
    const lady: Hands = f < g1 ? [vlerp(a[0], b[0], k), vlerp(a[1], b[1], k)] : ladyFree();
    return { c, rot, lin: N, king: [glide(f, TB.giveBack[0], TB.giveBack[0] + 4, lapK[0], rimAt(C_PASS, 0, E_)), null], ladyA: lady };
  }
  if (f < TB.chest2[1]) {
    const k = ez(f, TB.chest2[0], TB.chest2[1]), c = vlerp(C_PASS, C_CHEST(kfc), k);
    return { c, rot: 0, lin: N, king: [rimAt(c, 0, lerp(E_, B_ - 0.36, k), lerp(0.12, JR, k)), glide(f, TB.chest2[0], TB.chest2[1], lapK[1], under(C_CHEST(kfc), 0, 0.36))], ladyA: ladyFree() };
  }
  if (f < TB.handBack[1]) {
    const k = ez(f, TB.chest2[1], TB.handBack[0] - 1), c = vlerp(C_CHEST(kfc), C_TAKE, k);
    const r0 = f < TB.chest2[1] + 5 ? glide(f, TB.chest2[1], TB.chest2[1] + 5, under(C_CHEST(kfc), 0, -0.36), lapK[0]) : null;
    const reach = TB.handBack[0] - 4, e = rimAt(C_TAKE, 0, E_);
    const lin: Hands = [f < reach ? null : glide(f, reach, TB.handBack[0], linRest(L, 0), e), null];
    return { c, rot: 0, lin, king: [r0, rimAt(c, 0, lerp(B_ + 0.36, -Math.PI, k), lerp(JR, 0.12, k))], ladyA: ladyFree() };
  }
  // ---- 9 / 10a: his now. He draws it in as he steps back (his right hand slides round under it, his left comes to
  //      it), then up and out round his side into the frame-0 grip (his left hand under it, high beside his head) for
  //      the scuttle; from the bump he stands as the hook has him (hookLin on the hook's clock)
  const kingOff: Hands = [null, f < TB.handBack[1] + 4 ? glide(f, TB.handBack[1], TB.handBack[1] + 4, rimAt(C_TAKE, 0, W_), lapK[1]) : null];
  if (f < TB.high[0]) {
    const k = ez(f, TB.handBack[1], TB.high[0]), c = vlerp(C_TAKE, linHold(LIN_CARRY_W), k), rot = lerpA(0, L.facing, k);
    return { c, rot, lin: [rimAt(c, rot, lerp(2 * Math.PI, Math.PI, k)), glide(f, TB.handBack[1], TB.high[0], linRest(L, 1), rimAt(c, rot, 0))], king: kingOff, ladyA: N };
  }
  if (f < TB.bump) {
    const k = ez(f, TB.high[0], TB.high[1]), stop = ez(f, TB.spin[0], TB.bump - 1), hrot = L.facing - HALL.pillarFacing;
    const hand = linHold(HIGH_WALK.map((v, i) => lerp(v, HIGH_REL[i], stop)) as [number, number, number]);
    // the way up: from the carry out to his left side (clear of his face), then up beside his head; his right hand
    // leaves it at once and goes out for balance (carried across with the disc, the right arm crossed his chest)
    const side = linHold(HIGH_SIDE), hi = hand.clone().add(V(0, JR, 0)), c0 = linHold(LIN_CARRY_W);
    const c = bez(c0, side, hi, k);
    const rot = lerpA(L.facing, hrot, k), p0 = pairOf(c0, L.facing);
    // ... and comes back to his side as he spins at retreatTurn (the hook leaves it free from the bump)
    const right = f < TB.spin[0] ? glide(f, TB.high[0], TB.high[0] + 5, p0[0], linHold(BALANCE)) : glide(f, TB.spin[0], TB.bump - 1, linHold(BALANCE), linRest(L, 0));
    return { c, rot, lin: [right, rimAt(c, rot, lerp(0, -Math.PI / 2, k), lerp(0.12, JR, k))], king: kingOff, ladyA: N };
  }
  const H = hookLin(f, f - HIT.hookBack);
  return { c: H.jade.c, rot: 0, lin: [null, H.hand], king: N, ladyA: N };
};

// ====================================================================================================== the staging
/** the rigs hallB set, for the overlays */
type Cast = { lin?: Rig; king?: Rig; ladyA?: Rig; ladyB?: Rig; minA?: Rig; minB?: Rig; minC?: Rig; guardL?: Rig; guardR?: Rig; jade?: THREE.Vector3; jadeRot?: number };
/** the envoy's faces: 9 the polite scheme with open eyes (smile_closed with lip-sync read as a big laugh), sly on the
 *  flaw */
const LIN_EXPR: [number, Expr][] = [[S7a.from, "cool"], [HIT.take + 2, "deadpan"], [HIT.bubble, "cool"], [S9.from, "smile"], [TB.flaw, "cool"], [TB.handBack[1], "stern"], [HIT.jadeBack + 4, "huff"]];
const LIN_GAZE: [number, number][] = [[S7a.from, 0], [HIT.take, -1], [S8a.from, 0], [S8b.from, -1], [S9.from, 0], [TB.flaw, -1], [TB.giveBack[0], 0], [TB.bump, 1]];
const LA_EXPR: [number, Expr][] = [[S7a.from, "smile_closed"], [TB.ladyUp[0], "happy"], [S9.from, "smile_closed"], [HIT.jadeBack + 4, "shock"]];
const LB_EXPR: [number, Expr][] = [[S7a.from, "smile_closed"], [HIT.cheer, "happy"], [S9.from, "smile_closed"], [HIT.jadeBack + 6, "shock"]];
/** THE HALL IN SEGMENT B (7a-10a) on frame f: the place (no ceremony, no map stand), the camera, exactly the shot's
 *  placed list on their marks, the jade on its timeline; w.update(); the jade put. One clock for every shot. */
function hallB(w: World, f: number, s: ShotDef, camera: Pose["camera"]): Cast {
  const t = f / FPS, placed = new Set<PlacedCode>(s.placed), out: Cast = {};
  w.setPlace("hall");
  w.setCamera(camera);
  const L = linLeg(f), kfc = ky(f, K_FACE), kback = ky(f, K_BACK), J = jadeB(f, L, kfc, kback), lapK = kLap(kfc, kback);
  // ---- the envoy
  if (placed.has("L")) {
    const r = (out.lin = w.actor(PEOPLE.lin)), sp = speak(quote("lin", 9), f, 1);
    let st: Extra;
    if (f >= TB.bump) {
      const H = hookLin(f, f - HIT.hookBack);
      st = { ...H.state, at: L.at, hands: J.lin };
    } else {
      st = {
        at: L.at, facing: L.facing, pose: L.pose, turn: L.turn, expr: at(f, LIN_EXPR), gaze: at(f, LIN_GAZE),
        blink: sp.blink ?? lid(t, 1, swaps(LIN_EXPR)), mouth: sp.mouth,
        head: heads(sp.head, f >= TB.follow && f < S8a.from ? { dx: -0.06 * ez(f, TB.follow, TB.follow + 4) } : undefined),
        hands: J.lin, visible: true,
      };
      // the bows: 7a with the jade held forward (his hands stay on it), 9 the 拱手 (salute's own hands)
      const kb = f < S8a.from ? BOW7 * ez(f, TB.bow[0], TB.bow[1]) * (1 - ez(f, HIT.reach, TB.meet[0]))
        : f >= S9.from && f < TB.stepUp2[0] ? ez(f, TB.bow9[0], TB.bow9[1]) * (1 - ez(f, TB.bowUp9[0], TB.bowUp9[1])) : 0;
      if (kb > 0) { Object.assign(st, bowWith(kb, L.at, L.facing, t)); if (J.lin[0] || J.lin[1]) st.hands = J.lin; }
      // 瑕: he points at the jade in lady A's hands (his right arm; he faces her)
      if (f >= TB.flaw && f < TB.pointOut) Object.assign(st, { pose: { kind: "point", t: (f - TB.flaw) / FPS, arm: 0 }, hands: N });
      // the last steps onto the pillar: his head eases into the hook's tilt
      if (f >= TB.spin[1]) st.head = heads(st.head, ...scaleHead(hookLin(f, f - HIT.hookBack).state.head, ez(f, TB.spin[1], TB.bump)));
    }
    r.set(st);
  }
  // ---- the King of Qin
  if (placed.has("Q")) {
    const r = (out.king = w.actor(PEOPLE.qinWang)), rise = ez(f, TB.rise[0], TB.rise[1]);
    const seat = seated(KS, t, { facing: kfc, back: kback, rise: 0.45 * rise, hipY: r.dim.hipY, scale: KSC });
    const lapR = rise > 0 ? kLap(kfc, kback, seat.seat!.top.y - KS.top.y) : lapK;
    // his right hand: on the 凭几 while he lounges, to his lap with the reach; his left on the lap
    let h0: THREE.Vector3 = J.king[0] ?? (f < HIT.reach ? ARMREST_HAND.clone() : f < HIT.reach + 6 ? glide(f, HIT.reach, HIT.reach + 6, ARMREST_HAND, lapK[0]) : lapK[0]);
    let h1: THREE.Vector3 = J.king[1] ?? lapK[1];
    // 8a: the cheer, empty-handed (the hook pose in joy: both hands up and out, bobbing); down again inside 8b
    const cheer = f >= HIT.cheer && f < S9.from ? ez(f, HIT.cheer, HIT.cheer + 4) * (1 - ez(f, S8b.from + 8, S8b.to - 4)) : 0;
    if (cheer > 0) {
      const b = 0.02 * Math.sin((2 * Math.PI * 3 * (f - HIT.cheer)) / FPS), [cx, cy, cz] = K_CHEER;
      h0 = vlerp(h0, rel(KT, kfc, -cx, cy + b, cz), cheer);
      h1 = vlerp(h1, rel(KT, kfc, cx, cy - b, cz), cheer);
    }
    // 10a: he half-rises with his left hand out toward the envoy (it starts out as he scuttles off)
    if (f >= TB.handBack[1] + 4) {
      // at full rise: HALL.kingHookHand 2 cm lower (the hook's left hand, proven held: WP1b / WP7 rig.qa)
      const kh = HALL.kingHookHand, out1 = rel(KT, kfc, kh.x, lerp(1.0, kh.y - 0.02, rise), lerp(0.22, kh.z, rise));
      h1 = vlerp(lapR[1], out1, Math.max(rise, 0.5 * ez(f, HIT.jadeBack + 4, HIT.jadeBack + 10)));
      h0 = lapR[0];
    }
    const laugh = f >= HIT.laugh && f < TB.laughEnd + 4, lounge = 1 - ez(f, HIT.reach, HIT.reach + 4);
    r.set({
      ...seat, hands: [h0, h1], expr: at(f, KEXPR),
      blink: lid(t, 2, swaps(KEXPR)), gaze: f >= TB.flaw && f < TB.giveBack[1] ? -1 : f >= HIT.jadeBack ? 1 : 0,
      lookDown: laugh ? -10 * ez(f, HIT.laugh, HIT.laugh + 3) * (1 - ez(f, TB.laughEnd, TB.laughEnd + 4)) : 0,
      head: heads(
        lounge > 0 ? { tilt: 6 * lounge } : undefined,
        laugh ? accent("laugh", f, HIT.laugh, { dur: (TB.laughEnd - HIT.laugh) / FPS }) : undefined,
        cheer > 0 ? accent("laugh", f, HIT.cheer, { dur: 0.9 }) : undefined,
        f >= HIT.jadeBack + 6 ? accent("jolt", f, HIT.jadeBack + 6) : undefined,
      ),
      visible: true,
    });
  }
  // ---- the ladies (not placed from 803: V9)
  if (placed.has("A")) {
    const r = (out.ladyA = w.actor(PEOPLE.ladyA)), fc = laFacing(f), bw = laBow(f);
    const st: Extra = { at: HALL.ladyA.clone(), facing: fc, pose: { kind: "idle", t: t + 1.23 }, expr: at(f, LA_EXPR), blink: lid(t, 3, swaps(LA_EXPR)), gaze: 0, hands: J.ladyA, visible: true };
    if (bw > 0) Object.assign(st, salute(0.55 * bw, HALL.ladyA, fc, t), { hands: J.ladyA });
    r.set(st);
  }
  if (placed.has("B")) {
    const r = (out.ladyB = w.actor(PEOPLE.ladyB));
    r.set({ ...standing(HALL.ladyB, 0.4, f, 4), expr: at(f, LB_EXPR), blink: lid(t, 4, swaps(LB_EXPR)), gaze: f >= TB.follow && f < S8b.from ? -1 : 0,
      head: { tilt: -7 * ez(f, TB.kingFree, TB.kingFree + 5) * (1 - ez(f, S8b.from, S8b.from + 6)) } });
  }
  // ---- the ministers down the west aisle (in frame only in hallWide); 8a: the cheer, laughing (staggered)
  if (placed.has("M")) {
    const mins: ["minA" | "minB" | "minC", typeof PEOPLE.qinMinA, THREE.Vector3, number][] = [["minA", PEOPLE.qinMinA, HALL.minA, 5], ["minB", PEOPLE.qinMinB, HALL.minB, 6], ["minC", PEOPLE.qinMinC, HALL.minC, 7]];
    for (const [key, who, p, id] of mins) {
      const r = w.actor(who), on = HIT.cheer + stagger(id, 4), cheering = f >= on && f < S8b.from + 6;
      r.set({ ...standing(p, HALL.minFacing, f, id), expr: cheering ? "laugh" : f >= HIT.jadeBack + 6 ? "shock" : "neutral", ...(cheering ? { pose: { kind: "cheer" as const, t: (f - on) / FPS } } : {}) });
      out[key] = r;
    }
  }
  // ---- guardL / guardR (segment B only); guardL cheers in 8a (his halberd hand stays pinned: common.halberdHand)
  if (placed.has("G")) {
    const on = HIT.cheer + 3, cheering = f >= on && f < S8b.from + 6;
    out.guardL = w.actor(PEOPLE.qinGuard);
    out.guardL.set({ ...standing(HALL.guardL, 0.6, f, 8), expr: cheering ? "laugh" : "neutral", hands: [null, halberdHand(HALL.guardL, 0.6, 1)], ...(cheering ? { pose: { kind: "cheer" as const, t: (f - on) / FPS } } : {}) });
    out.guardR = w.actor(PEOPLE.qinGuardB);
    out.guardR.set({ ...standing(HALL.guardR, -0.6, f, 9), expr: f >= HIT.jadeBack + 6 ? "shock" : "neutral", hands: [halberdHand(HALL.guardR, -0.6, 0), null] });
  }
  w.update();
  // the jade shows only in the hand of a placed figure (8b: lady A is not placed, so it is not either)
  const held = ((J.lin[0] || J.lin[1]) && placed.has("L")) || ((J.king[0] || J.king[1]) && placed.has("Q")) || ((J.ladyA[0] || J.ladyA[1]) && placed.has("A"));
  if (held) { w.prop("jade").put(J.c, { grip: "pair", rot: J.rot }); out.jade = J.c; out.jadeRot = J.rot; }
  return out;
}
/** 7a's bow with the jade held forward: half a 拱手 bow (deeper, his head came down onto the disc: 18 cm) */
const BOW7 = 0.5;
/** THE ENVOY'S 拱手 BOW with its hands eased in: common.salute pins the hands 0.36 m in front of the chest at any k,
 *  which is out of reach for an upright figure (rig.qa 6 cm as the bow came up); here they travel from his measured
 *  hanging hands (REST) to that point with k */
const bowWith = (k: number, p: THREE.Vector3, facing: number, t: number): Extra => {
  const s = salute(k, p, facing, t), L = { at: p, facing };
  if (!s.hands) return s;
  // on the way the hands pass 6 cm further forward (straight, the forearm went 1.5 cm into his belly)
  const e = smooth(k), out = rel(V(), facing, 0, 0, 0.06 * Math.sin(Math.PI * e));
  return { ...s, hands: [vlerp(linRest(L, 0), s.hands[0]!, e).add(out), vlerp(linRest(L, 1), s.hands[1]!, e).add(out)] };
};
/** a head accent scaled by k (the hook's tilt eased in), as a list for heads(...) */
const scaleHead = (hd: RigState["head"] | undefined, k: number): (RigState["head"] | undefined)[] =>
  hd ? [{ tilt: (hd.tilt ?? 0) * k, dx: (hd.dx ?? 0) * k, dy: (hd.dy ?? 0) * k }] : [];

// ====================================================================================================== the shots
/** 7a (513-530, hallWide): the whip LEFT lands (513-516); he steps up and bows; the lounging king reaches */
function shot7a(w: World, f: number): Pose {
  const camera = whip(CAMS.hallWide, f, TB.whipIn[0], TB.whipIn[1], -1, "in");
  hallB(w, f, S7a, camera);
  return { camera, overlays: frag(...ov7a(f)), slate: slate(S7a, f < TB.stepUp[1] ? "step up" : f < HIT.reach ? "bow" : "reach") };
}
/** 7b (531-593, presentTwo): the take, the laugh, the pass to lady A */
function shot7b(w: World, f: number): Pose {
  const camera = PRESENT2, C = hallB(w, f, S7b, camera);
  const jp = C.jade ? px(w, C.jade) : { x: -999, y: -999 };
  const ov = ov7b(f, { jade: jp, ladyA: headPx(w, C.ladyA!), ladyB: headPx(w, C.ladyB!), king: headPx(w, C.king!), lin: headPx(w, C.lin!) });
  return { camera, overlays: frag(...ov), slate: slate(S7b, f < TB.lift[0] ? "take" : f < TB.pass[0] ? "laugh" : "to lady A") };
}
/** 8a (594-628, hallWide): 万岁 */
function shot8a(w: World, f: number): Pose {
  const camera = CAMS.hallWide, C = hallB(w, f, S8a, camera);
  const others = [C.king!, C.ladyA!, C.ladyB!, C.lin!, C.guardL!].map((r) => headPx(w, r));
  const ov = ov8a(f, { minA: headPx(w, C.minA!), minB: headPx(w, C.minB!), minC: headPx(w, C.minC!), others });
  return { camera, overlays: frag(...ov), slate: slate(S8a, "cheer") };
}
/** 8b drawn without the king: in linClose he sits hidden behind the envoy except his crown board, which peeked out
 *  behind the wrap (a gold-edged black board: a strange ornament on the hat) */
const S8B_DRAWN: ShotDef = { ...S8b, placed: S8b.placed.filter((c) => c !== "Q") };
/** 8b (629-662, linClose): nobody mentions the cities */
function shot8b(w: World, f: number): Pose {
  const camera = CAMS.linClose, C = hallB(w, f, S8B_DRAWN, camera);
  return { camera, overlays: frag(...ov8b(f, { lin: headPx(w, C.lin!) })), slate: slate(S8b, f < HIT.bubble ? "deadpan" : "the cities?") };
}
/** 9 (663-751, presentTwo): the flaw; the jade comes back to him */
function shot9(w: World, f: number): Pose {
  const camera = PRESENT2, C = hallB(w, f, S9, camera);
  const c = C.jade ?? HALL.meet, jp = w.project(c), je = w.project(c.clone().add(V(0, JR, 0)));
  const spot = px(w, rimAt(c, C.jadeRot ?? 0, 0.7, 0.085));
  const ov = ov9(f, { jade: { x: jp.x, y: jp.y }, jadeR: Math.abs(jp.y - je.y), spot });
  return { camera, overlays: frag(...ov), slate: slate(S9, f < TB.walkUp[1] ? "walk up" : f < TB.giveBack[0] ? "the flaw" : f < TB.handBack[0] ? "give back" : "hand-over") };
}
/** 10a (752-802, retreat): the scuttle to the pillar; the bump (800: a 3 px shake) */
function shot10a(w: World, f: number): Pose {
  const camera = shake(CAMS.retreat, f, TB.bump, 3, 7.5, 5);
  hallB(w, f, S10a, camera);
  return { camera, slate: slate(S10a, f < TB.spin[0] ? "scuttle" : f < TB.bump ? "spin" : "bump") };
}
/** 10b (803-851, pillarClose): 怒发冲冠; 再逼我. LIN_RAGE at the pillar on the hook's clock (u = f - 852), so the axial
 *  cut to 11 keeps everything but the lens */
function shot10b(w: World, f: number): Pose {
  const camera = PILLAR2;
  w.setPlace("hall");
  w.setCamera(camera);
  const t = f / FPS, H = hookLin(f, f - HIT.hookBack);
  // the threat: the jade shakes once (0.03 m sideways, 6 frames) on 再逼我
  const sh = f >= TB.threat && f < TB.threat + 6 ? 0.03 * Math.sin((Math.PI * 2 * (f - TB.threat)) / 6) * (1 - (f - TB.threat) / 6) : 0;
  const hand = H.hand.clone().add(V(0.8, 0.2, 0.55).multiplyScalar(Math.abs(sh))), sp = speak(quote("lin", 11), f, 1);
  const r = w.actor(PEOPLE.linRage);
  r.set({ ...H.state, hands: [null, hand], gaze: f >= TB.threat ? -1 : 1, mouth: sp.mouth, blink: sp.blink ?? (f < HIT.rage + 3 ? 0 : lid(t, 1)),
    head: heads(H.state.head, headPop(f, HIT.rage), ...scaleHead(sp.head, SPEAK_HEAD)), visible: true });
  w.update();
  w.prop("jade").put(hand, H.put);
  const jc = H.jade.c.clone().add(hand).sub(H.hand), jp = w.project(jc), je = w.project(jc.clone().add(V(0, JR, 0)));
  const jade = { x: jp.x, y: jp.y, r: Math.hypot(je.x - jp.x, je.y - jp.y) };
  return { camera, overlays: frag(...ov10b(f, { lin: headPx(w, r), jade })), slate: slate(S10b, f < TB.threat ? "rage" : "threat") };
}
/** the speaking head's lean and pops at the pillar, scaled down: the disc stands 2-3 cm from his temple in the hook's
 *  grip and the full lean took his head into it (clearance 3.2 cm) */
const SPEAK_HEAD = 0.35;
/** shot 11's feint: the wind-up 2 frames before 一起 (884), the strike leaves on 894 and stops on 碎 (896); the king's
 *  hands freeze with the wind-up and never wave again (rewave after the shot) */
const FEINT2: Feint = { wind: TB.wind2, strike: TB.strike2, hit: HIT.smash2, rewave: S11.to + 30 };
const KING11: [number, Expr][] = [[S11.from, "shock"], [TB.dazed, "dazed"]];
/** the hook camera's lens in 11: 28 on 852 (as frame 0), a slow push to 27 until 一起, the punch-in to 25 (886-896) */
const fov11 = (f: number) => (f < TB.punch[0] ? lerp(28, 27, smooth(lin(f, S11.from, TB.punch[0]))) : lerp(27, 25, smooth(lin(f, TB.punch[0], TB.punch[1]))));
/** 11 (852-924, hook, hud: false): THE OPENING SHOT RETURNS. hookPose(w, f, 852) does the place, the camera, both
 *  figures, the wave, the panic strokes and the feint; 852 is left exactly as it gives it (= frame 0); from 853 the
 *  envoy glares at the king (gaze -1), speaks (line 11), tips his head a little and taps the jade twice */
function shot11(w: World, f: number): Pose {
  const H = hookPose(w, f, S11.from, { feint: FEINT2, kingExpr: KING11, camera: (c) => ({ ...c, fov: fov11(f) }) });
  if (f > S11.from) {
    const L = hookLin(f, f - S11.from, FEINT2), t = (f - S11.from) / FPS, sp = speak(quote("lin", 11), f, 1);
    // the taps: the disc dips toward the lens and comes back (5 frames each), before the wind-up
    let tap = 0;
    for (const on of TB.taps) { const d = f - on; if (d >= 0 && d < 5) tap = Math.max(tap, Math.sin((Math.PI * d) / 5)); }
    const hand = L.hand.clone().add(V(0, -0.012, 0.03).multiplyScalar(tap));
    // the second wind-up is quicker than the first (4 frames, not 17): half way the disc's rim met his temple (1.3 cm)
    // where the tremble was at its height; it swings 2 cm wide of his head on the way (none at either end)
    const wb = Math.sin(Math.PI * L.jade.wind) * (1 - L.jade.k);
    if (wb > 0) { const a = hand.clone().sub(H.lin.headWorld()).setY(0).normalize(); hand.addScaledVector(a, 0.02 * wb); }
    const still = 1 - ez(f, FEINT2.wind - 4, FEINT2.wind) * (1 - ez(f, HIT.smash2 + 8, HIT.smash2 + 14));
    H.lin.set({ hands: [null, hand], gaze: -1, mouth: sp.mouth, blink: sp.blink ?? (t < 0.3 ? 0 : lid(t, 1)), head: heads(L.state.head, ...scaleHead(sp.head, SPEAK_HEAD * still)) });
    // the king keeps his eyes wide through the 碎 freeze (shock, then dazed on 900): the hook's wince blink fell on
    // 896-897 and with shock's open mouth the held frame read as a laugh
    if (f >= HIT.smash2 && f < TB.dazed) H.king.set({ blink: 0 });
    w.update();
    w.prop("jade").put(hand, L.put);
  }
  return { camera: H.camera, hud: false, overlays: frag(...H.overlays), slate: slate(S11, f < FEINT2.wind ? "the threat" : f < HIT.smash2 ? "wind-up" : "碎") };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [
  [S7a, shot7a], [S7b, shot7b], [S8a, shot8a], [S8b, shot8b], [S9, shot9], [S10a, shot10a], [S10b, shot10b], [S11, shot11],
];
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};
