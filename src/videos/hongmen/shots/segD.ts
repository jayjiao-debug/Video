// Segment D (lines 14-17): THE BODYGUARD. Fan Kuai rams the two door guards flat with his shield and storms up to
// Xiang Yu (14); Xiang Yu likes him and has a pork leg thrown to him: RAW (15); Liu Bang gets up "for the privy" and
// waves Fan Kuai after him (16); outside the door Liu Bang frets about leaving without a goodbye, Fan Kuai sets him
// straight (17).
// Four shots, three cuts, two moves on one tripod:
//   14   the door, from inside   the guards' backs in the open doorway, Fan Kuai runs up between them (tag), the
//                                shield hits, they fly apart, he runs in past Liu Bang up to the lens      (held; a kick)
//   15   the north tripod        two-shot Fan Kuai / Xiang Yu: the grin and the pointing hand; Fan Kuai kneels and
//                                lays the shield down (the camera tilts down with him); the servant throws the leg
//                                on it and is gone; nothing moves on 生的                                   (tilt, then held)
//   16   the same tripod         pulls back to the master: Liu Bang rises, walks to the door, turns, beckons; Fan Kuai
//                                snatches up the shield and follows; the empty seat                         (pull back, then held)
//   17   outside the door        Liu Bang comes out and stops, a hand up; Fan Kuai plants himself beside him and says
//                                the idiom (push in on "樊哙说")                                            (push in, then held)
// Every frame number is looked up (beats.ts, cap / line / quote): see B below. The shots are pure functions of f.
// Notes: /home/user/hm_notes/seg_D.md.
import * as THREE from "three";
import type { Expr } from "../../group/kit/toon";
import { COL } from "../../group/kit/overlay";
import type { CamPose, Pose, Segment } from "../story";
import { SEGMENTS, cap, quote, lin, smooth, lerp, clamp01, easeInOutCubic, camMix } from "../story";
import type { World } from "../world";
import { HIT, shot, type ShotDef } from "../beats";
import { CAMP, CAMS, PAD_TOP, SEATS } from "../layout";
import { FPS, PEOPLE, V, accent, at, banquet, cam, frag, halberdHand, hang, headPx, heads, hopArc, kick, kneel, lerpA, lid, rel, seated, speak, standing, walkAlong, walkTime, yawTo, type Rig, type RigPose, type RigState } from "./common";
import { stamp, tag as hudTag } from "../hud";
import { burst } from "./segD_ov";

const S = SEGMENTS[3];
type St = Partial<RigState>;
const slate = (s: ShotDef) => `${s.id} ${s.place}/${s.cam}`;
const S14 = shot("14"), S15a = shot("15a"), S15b = shot("15b"), S16 = shot("16"), S17 = shot("17");
const Q17 = quote("fanKuai", 17);

// ====================================================================================================== marks (my own)
// The layout's ENTER.path runs 0.21 m from the east door post (w_tent.md): Fan Kuai and the servant go through the
// MIDDLE of the doorway. The floor between the tables is 1.06 m wide; the shield (0.58 m wide, lying with its long
// side north-south) and the kneeling Fan Kuai (0.54 m) share it: SH is 3 cm from Xiang Yu's table, FKM 0.28 m from
// the table of his own unused seat, his knees reach about 0.1 m over the board's edge (MARKS.eat / SHIELD.onFloor overlap by 0.3 m).
/** line 14: where his run starts (outside, far), where the shield meets the guards, the middle of the doorway */
const FAR = V(-0.15, 0, -7.4), HITP = V(-0.15, 0, -3.5), DOORMID = V(-0.15, 0, -2.5);
/** the way from the door onto the floor (the pocket beside Liu Bang's pad, the south-east corner gap) */
const IN1 = V(-0.45, 0, -1.9), IN2 = V(-0.5, 0, -1.15), GAP = V(-0.34, 0, -0.865);
/** Fan Kuai's place on the floor in front of Xiang Yu (lines 14 end, 15, 16) and where his shield lies.
 *  CLEARANCES (2026-11-12, measured by scripts/hongmen/qa/clearance): his armour skirt is a 0.27 m radius round him
 *  down to 0.29 m above the floor (kneeling: to the floor); the board is the shield's 0.58 x 0.80 superellipse, 7 cm
 *  high. FKM: skirt 4 cm from his own table's front, his scabbard (it hangs 0.38 m out behind his right hip) clear of
 *  Zhang Liang's table. SH: the board's west edge 10 cm east of his kneeling skirt (the board stands on that edge
 *  while he lays it down: 3 cm), its north edge at z 0.15 (south of Xiang Yu's table leg), its east edge at the
 *  uncle's table front, under its top, 1.5 cm short of its leg. */
const FKM = V(-0.22, 0, 0.06), SH = V(0.44, 0, -0.25);
/** where the leg lies on the shield's back (the board: 0.07 m high; the leg's origin 0.103 above what it lies on; it
 *  lies east-west, the cut end toward Fan Kuai, the hoof toward Xiang Yu; its thick end 4 cm from his skirt) and on
 *  the rug afterwards: it slides off the board's SOUTH end when he snatches the board up (line 16) and lies between
 *  the board's place and Liu Bang's empty table, its hoof end under the uncle's table top (clear of every table leg,
 *  and 0.3 m from his way out: his scabbard went 4 cm into it at the old place) */
const BOARD_Y = 0.07, LEG_Y = 0.103, LEG_ON = V(SH.x - 0.04, BOARD_Y + LEG_Y, SH.z), LEG_RUG = V(0.56, LEG_Y, -0.78);
/** the servant carries the leg low in front of him (both hands at its two ends), a little to his LEFT, away from the
 *  kneeling Fan Kuai's head and shoulders (a crosswise carry at chest height went 17 cm through his head) */
const CARRY_Y = 0.62, CARRY_X = 0.1, CARRY_Z = 0.34;
/** the servant: where he comes from (behind the wall east of the door: from the north tripod and from 14b's camera
 *  the wall hides him there; he used to appear out of nothing in the middle of the open doorway, 0.85 m outside it), where he
 *  stops with the leg (between Liu Bang's table and the board's south-west corner), where he disappears to (the same
 *  place behind the wall) */
const SV_FROM = V(-1.25, 0, -2.95), SERVE = V(-0.18, 0, -0.62), SV_TURN = V(-0.15, 0, -2.82), SV_GONE = V(-1.25, 0, -2.95);
/** the door guards (outside, backs to the room): at the posts; stepped together to bar the way; where they land */
const G0 = [V(-0.62, 0, -2.95), V(0.32, 0, -2.95)], G1 = [V(-0.45, 0, -2.95), V(0.15, 0, -2.95)], GF = [V(-1.55, 0, -3.15), V(1.35, 0, -3.15)];
/** line 16: where Liu Bang turns in the doorway and beckons; where the two go (west of the door, behind the wall) */
const BECK = V(-0.15, 0, -2.3), OUT1 = V(-0.15, 0, -3.15), OUT2 = V(1.0, 0, -3.5);
/** line 17 (outside the tent, the island at x 60) */
const O = CAMP.out, L17 = O.liu, F17 = V(O.liu.x + 0.78, 0, O.liu.z - 0.02), Z17 = O.zhang;
const DOOR17 = V(CAMP.door.at.x, 0, CAMP.door.at.z - 0.1);

/** Xiang Yu's near hand: where it lies on his table, and stretched out toward Fan Kuai at shoulder height */
const XY_REST = V(0.81, 0.37, 0.58), XY_POINT = V(0.76, 0.6, 0.62);
/** LINE 14, VERSION B (ALT14): the ram is seen from OUTSIDE the command tent (the flap is shut after the dancer's
 *  entrance: segment C), he bursts through the flap; then, inside, a close look at him in the doorway. The dance floor
 *  (where segment C leaves the dancer and the uncle) is in neither picture. */
const ALT14 = true;   // (false until its pictures have been looked at: the old version is the verified one)
const CX = CAMP.door.at.x, DZ = CAMP.door.at.z;
/** where he is (m in front of the flap) when the shield meets the two guards: its face then just touches their chests
 *  at the deepest frame of the thrust (measured: 0.3 cm apart at 1.31, 0.7 cm into a skirt at 1.30, 10 cm at 1.15) */
const HIT_Z = 1.31;
/** outside: his run (from beside the lens to the guards), the guards (at the posts; stepped together; flung out of frame), the way in */
const A_RUN = [V(CX - 0.2, 0, 1.6), V(CX - 0.08, 0, -1.0), V(CX, 0, DZ + HIT_Z)], HITO = A_RUN[2];
const GO0 = [V(CX - 0.62, 0, DZ + 0.65), V(CX + 0.62, 0, DZ + 0.65)], GO1 = [V(CX - 0.34, 0, DZ + 0.7), V(CX + 0.34, 0, DZ + 0.7)], GOF = [V(CX - 2.4, 0, DZ + 0.9), V(CX + 2.4, 0, DZ + 0.9)];
/** the way in: the cut to the inside comes when he is 0.12 m past the flap's plane (the tent's dark inside wall stands
 *  0.52 m behind it: his shield and body would go through it 2 frames later) */
const A_IN = [HITO, V(CX, 0, DZ - 0.12), V(CX, 0, DZ - 1.2)], RUSH_A = 4.0, SEEN_Z = DZ - 0.14;
/** inside: where he stops, just inside the doorway (披帷西向立), and how he gets from there to his mark (line 15).
 *  After the corner gap he bears EAST (P1) before he turns north to his mark: his scabbard, which hangs out behind his
 *  right hip, then passes 8 cm east of his own table's front instead of through its top. */
const P1 = V(-0.08, 0, -0.48);
const DOORSTAND = V(-0.35, 0, -2.05), B_IN = [V(-0.15, 0, -3.2), DOORSTAND], IN15 = [DOORSTAND, IN1, IN2, GAP, P1, FKM];
const FACE_DOOR = 0.47;                                   // toward Xiang Yu from the doorway
/** facings: Fan Kuai at his mark for the door camera (14) and for the north tripod (15, toward Xiang Yu, within 45
 *  degrees of the lens), and kneeling at the board (toward the board and Xiang Yu, a three-quarter view to the tripod) */
const FACE14 = 0.7, FACE15 = 1.0, FACE_SH = 1.4;
/** speeds (m/s) */
const RUN14 = 3.0, RUSH = 3.0, SERV = 2.6, SERV_BACK = 4.0, LIU_WALK = 1.3, LIU_IN = 1.5, LIU_OUT = 1.9, FK_OUT = 3.7, FK_17 = 2.4;
const IN_PATH = [HITP, DOORMID, IN1, IN2, GAP, P1, FKM], SERVE_PATH = [SV_FROM, SV_TURN, DOORMID, IN1, IN2, GAP, SERVE], SERVE_BACK = [SERVE, GAP, IN2, IN1, DOORMID, SV_TURN, SV_GONE];
/** Liu Bang rises pushing back RISE_BACK from his table (his robe's front went 1.4 cm into its edge), walks along his
 *  pad's top to its south edge and steps down off it (walking down a slope from the pad's top, his robe and leg went
 *  through the pad; his long robe hides that he steps off 0.2 m beyond its edge) */
const RISE_BACK = 0.05, LIU_UP = V(SEATS.liu.top.x, PAD_TOP, SEATS.liu.top.z - RISE_BACK);
const LIU_PATH = [LIU_UP, V(0.12, PAD_TOP, -2.03), V(0.11, 0, -2.08), BECK], LIU_OFF = [BECK, OUT1, OUT2];
/** line 16, his way out: back through the corner gap, then down the WEST side of the pocket (X1, X2): going south his
 *  scabbard swings to the east, and down the old way (beside Liu Bang's pad) it went through the pad; then across to
 *  the door's middle (X3) and straight out through it (the shield he carries in front is 0.58 m wide: coming at the
 *  doorway on the slant, it went into the west door post) */
const X0 = V(-0.2, 0, -0.55), X1 = V(-0.68, 0, -1.25), X2 = V(-0.47, 0, -2.02), X3 = V(-0.08, 0, -2.33);
const FK_OFF = [FKM, X0, GAP, X1, X2, X3, DOORMID, OUT1, OUT2];
/** from X1 on he carries the shield at his side (k 0, as he comes out in line 17): square in front of him it is 0.58 m
 *  across his way and went into the west door post */
const SIDE_FROM = walkTime([FKM, X0, GAP, X1], 1);
const LIU_17 = [O.liuFrom, L17], FK_17P = [DOOR17, V(O.liu.x + 0.5, 0, -2.9), F17];
const fr = (path: THREE.Vector3[], v: number) => Math.ceil(walkTime(path, v) * FPS);

// ====================================================================================================== the corner gap
// THE RULE (general, for any walker in this ring): the only way onto the floor is the corner gap between Liu Bang's
// table and Fan Kuai's (0.38 m between the two table corners: layout SEATS). Fan Kuai's armour skirt is 0.54 m across
// and hangs to 0.29 m, the table tops are at 0.30-0.34 m: no path through the gap keeps the skirt out of the two
// corners (it went 5-7 cm into both, every time he passed). So wherever his skirt would reach over a table top he takes
// a running BOUND: his whole figure rises (smoothly, with the distance) so that the skirt's hem passes 2 cm over the
// table tops. `bound(p)` is that lift for a floor point p; zero 0.42 m from every table.
const TABLES = Object.values(SEATS).map((s) => s.table);
/** the plan distance from p to the nearest low table's top (0 = over it) */
const tableDist = (p: THREE.Vector3) => {
  let d = Infinity;
  for (const t of TABLES) {
    const dx = p.x - t.at.x, dz = p.z - t.at.z, a = dx * Math.sin(t.ry) + dz * Math.cos(t.ry), c = dx * Math.cos(t.ry) - dz * Math.sin(t.ry);
    d = Math.min(d, Math.hypot(Math.max(Math.abs(c) - t.w / 2, 0), Math.max(Math.abs(a) - t.d / 2, 0)));
  }
  return d;
};
// The bound is laid along the PATH: wherever the walker's floor point comes within SKIRT_R of a table top, he is up
// BOUND_H, rising over BOUND_RAMP m of path before and coming down over BOUND_RAMP after (running, the hem swings 7 cm
// lower than standing on one side: hence 0.13 m).
const SKIRT_R = 0.31, BOUND_H = 0.13, BOUND_RAMP = 0.22;
const zonesOf = new Map<THREE.Vector3[], [number, number][]>();
/** the stretches [from, to] (m along the path) where the walker would be within SKIRT_R of a table */
const boundZones = (path: THREE.Vector3[]) => {
  let z = zonesOf.get(path);
  if (z) return z;
  z = [];
  const L = walkTime(path, 1);
  let open = -1;
  for (let d = 0; d <= L + 1e-6; d += 0.01) {
    const inside = tableDist(walkAlong(path, 1, Math.max(d, 1e-4)).at) < SKIRT_R;
    if (inside && open < 0) open = d;
    if (!inside && open >= 0) { z.push([open, d]); open = -1; }
  }
  if (open >= 0) z.push([open, L]);
  zonesOf.set(path, z);
  return z;
};
/** the lift at d m along the path */
const boundAt = (path: THREE.Vector3[], d: number) => {
  let k = 0;
  for (const [a, b] of boundZones(path)) k = Math.max(k, Math.min(smooth((d - (a - BOUND_RAMP)) / BOUND_RAMP), 1 - smooth((d - b) / BOUND_RAMP)));
  return BOUND_H * k;
};
/** a walker's place on the path with the bound added (l = walkAlong's result on that path) */
const bounded = (path: THREE.Vector3[], l: { at: THREE.Vector3; d: number }) => l.at.clone().add(V(0, boundAt(path, l.d), 0));
/** his shield hand while he bounds (p = the bounded point, p.y = the lift): the shield goes up a further 0.75 x the
 *  bound (its lower edge then passes over the table tops too, its top edge stays under his beard) and 5 cm out (his
 *  forearm clear of his belly) */
const boundHand = (p: THREE.Vector3, facing: number, k = 1) => { const b = p.y; return shieldHand(p, facing, k, 0.1 * (b / BOUND_H), 0.66 + 0.75 * b); };
/** ...and he turns his body as he slips through (k = the bound's fraction): his scabbard, which hangs out behind his
 *  right hip, then points back into the free floor instead of across a table's corner. In: 0.7 rad to his right of
 *  the way he goes; out: 0.78 */
const SIDLE_IN = -0.7, SIDLE_OUT = -0.78;

// ====================================================================================================== the beats
const B = (() => {
  // ---- line 14: he is at the guards on "撞倒" and stands in front of Xiang Yu before the line ends
  const ram = HIT.ram, runGo = ram - fr([FAR, HITP], RUN14), rushGo = ram + 3, fkAt = rushGo + fr(IN_PATH, RUSH);
  const tagAt = cap(14, 0).from + 5, tagOut = ram - 3;
  // ---- line 15
  // version B: outside until he is through the flap, then inside; he walks to his mark over the cut 14 > 15
  const runGoA = ram - fr(A_RUN, RUN14), rushA = ram + 2, cutB = rushA + fr([HITO, A_IN[1]], RUSH_A) + 1, inAt = cutB - 2 + fr(B_IN, RUSH);
  const in15Go = S15a.from - 12, in15At = in15Go + fr(IN15, RUSH);
  const praise = ALT14 ? in15At + 2 : S15a.from + 4;      // Xiang Yu's grin and his hand
  const servAt = HIT.leg - 6, servGo = servAt - fr(SERVE_PATH, SERV);   // the servant stops with the leg
  const toss = HIT.leg, land = toss + 6;                  // "赏他一条猪腿": the leg flies, lands on the shield
  const servBack = toss + 3, servGone = servBack + 3 + fr(SERVE_BACK, SERV_BACK);   // he turns away while it is still in the air
  const tilt = HIT.leg - 16, kneelGo = tilt - 1;          // he kneels and lays the shield down; the camera goes with him
  const raw = HIT.raw, eyes = raw + 9;                    // 生的: the stamp; then only his eyes go up to Xiang Yu
  // ---- line 16
  const riseGo = S16.from + 3, standAt = riseGo + 7, turnGo = standAt + 1, walkGo = turnGo + 5, atDoor = walkGo + fr(LIU_PATH, LIU_IN);   // up; round on the spot; to the door
  const beck = HIT.beckon - 10, offGo = HIT.beckon + 4;   // the beckoning hand comes up 10 frames before the words
  const fkUp = HIT.beckon - 5, fkGo = fkUp + 9;          // Fan Kuai gets up, takes the shield, goes
  // ---- line 17
  const liuGo = S17.from - 9, liuAt = liuGo + fr(LIU_17, LIU_WALK);
  const fkGo17 = S17.from - 2, fkAt17 = fkGo17 + fr(FK_17P, FK_17);
  const wait = liuAt + 2, says = HIT.fanKuaiSays, dao = cap(17, 2).from, yu = cap(17, 3).from, bye = cap(17, 4).from;
  return { ram, runGo, rushGo, fkAt, tagAt, tagOut, runGoA, rushA, cutB, inAt, in15Go, in15At, praise, servAt, servGo, toss, land, servBack, servGone, tilt, kneelGo, raw, eyes, riseGo, standAt, turnGo, walkGo, atDoor, beck, offGo, fkUp, fkGo, liuGo, liuAt, fkGo17, fkAt17, wait, says, dao, yu, bye };
})();

// ====================================================================================================== cameras
/** line 14: the layout's door camera aimed 0.12 m further west, so that Liu Bang's head (lower right) is inside the
 *  button rail and the doorway sits left of centre: doorway 18-72 % x, Fan Kuai's run at 41-44 % */
const D14 = cam([-0.3, 1.45, 1.95], [-0.08, 0.72, -2.0], 44);
const TWO = CAMS.two, MASTER = CAMS.master;
/** line 14 B, inside: from over the south end of Fan Kuai's unused table onto the doorway: his head and the top of
 *  the shield; Liu Bang's seat and the dance floor are outside the frame */
const C14B = cam([-0.95, 1.38, -0.35], [-0.22, 1.08, -2.05], 42);
/** the layout's floor camera with a wider lens (at 35 degrees the kneeling Fan Kuai touches the left edge and the
 *  bigger Xiang Yu is cut by the right one): Fan Kuai 8-28 % x, the shield at 41 / 50, Xiang Yu 67-90 % */
/** 生的: the stamp's centre from the board on screen (px): above it, between the two heads (re-measured for SH 0.44 / -0.25: the
 *  stamp stays at 565, 717 px as before; Fan Kuai's head 253, 618 r 111, Xiang Yu's 876, 718 r 123, the leg's top about 850) */
const RAW_DX = -13, RAW_DY = -185, RAW_SIZE = 100;
const FLOOR = cam([1.3, 2.6, 5.2], [0.42, 0.14, 0.15], 40);
/** line 15: the two-shot, then (from B.tilt, 13 frames) tilted down to the floor; line 16: back out to the master */
const cam15 = (f: number): CamPose => camMix(TWO, FLOOR, easeInOutCubic(lin(f, B.tilt, B.tilt + 13)));
const cam16 = (f: number): CamPose => camMix(FLOOR, MASTER, easeInOutCubic(lin(f, S16.from, S16.from + 14)));
/** line 17: the layout's tentDoor moved 0.12 m to the right (Fan Kuai's head stood in the button rail), then the push
 *  to the layout's two-shot on "樊哙说" */
const W17 = cam([CAMP.door.at.x + 0.22, 1.5, 4.0], [CAMP.door.at.x + 0.12, 1.0, -1.7], 40);
/** the idiom's seal: above the two heads of the close two-shot */
const FISH = { x: 540, y: 420 };
const cam17 = (f: number): CamPose => camMix(W17, CAMS.tentDoorIn, easeInOutCubic(lin(f, B.says, B.says + 15)));

// ====================================================================================================== the shield
// The real shield is TALL (0.58 wide, 0.80 high; origin = the middle of its back, +y out of its front): upright it is
// put with { up: the way it faces, face: straight up }. His hand holds it a little above the middle of the back, so
// its top edge stays under his chin (0.98 m).
const UPV = V(0, 1, 0), SH_DROP = 0.08;
/** where Fan Kuai's LEFT hand holds the shield, in his own frame: k 0 = carried at his left side, 1 = square in
 *  front of him; `push` = thrust forward (m); y = the height of the hand */
const shieldHand = (p: THREE.Vector3, facing: number, k: number, push = 0, y = 0.66) => rel(p, facing, lerp(0.25, 0.08, k), y, lerp(0.15, 0.23, k) + push);
/** the way the shield's front looks: straight ahead when it is in front of him, out to his left when carried */
const shieldN = (facing: number, k: number) => { const a = facing + lerp(0.95, 0, k); return V(Math.sin(a), 0, Math.cos(a)); };
/** the shield's origin for a hand that holds it upright */
const shieldAt = (hand: THREE.Vector3, n: THREE.Vector3, drop = SH_DROP) => hand.clone().addScaledVector(n, 0.035).add(V(0, -drop, 0));
/** the shield on his arm (after w.update) */
const shieldOnArm = (w: World, r: Rig, facing: number, k: number, drop = SH_DROP) => { const n = shieldN(facing, k); w.prop("shield").put(shieldAt(r.handWorld(1), n, drop), { up: n, face: UPV }); };
// ---- the shield's poses: { o: the middle of its back, u: out of its front (prop +y), f: toward its top (prop +z) }.
// Every move between the arm and the floor is built from these, and `putShield` draws a pose: face-down poses
// (front facing down) as `shieldDown` (it has no boss), and NEVER under the floor (its outline and boss are tested).
type SP = { o: THREE.Vector3; u: THREE.Vector3; f: THREE.Vector3 };
const SD = { a: 0.29, b: 0.4, t: 0.07, boss: 0.103 };
/** its outline (superellipse n 3.2, as props/things.ts) on the back (y 0) and on the front rim (y 0.07), and the boss */
const SH_PTS = (() => {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < 32; i++) {
    const th = (Math.PI * 2 * i) / 32, c = Math.abs(Math.cos(th)) / SD.a, s = Math.abs(Math.sin(th)) / SD.b, r = Math.pow(Math.pow(c, 3.2) + Math.pow(s, 3.2), -1 / 3.2);
    out.push(V(Math.cos(th) * r, 0, Math.sin(th) * r), V(Math.cos(th) * r, SD.t, Math.sin(th) * r));
  }
  return out;
})();
const basis = (q: SP) => { const Y = q.u.clone().normalize(), Z = q.f.clone().addScaledVector(Y, -q.f.dot(Y)).normalize(), X = Y.clone().cross(Z); return { X, Y, Z }; };
/** a point given in the shield's own frame, in the world */
const spWorld = (q: SP, l: THREE.Vector3) => { const { X, Y, Z } = basis(q); return q.o.clone().addScaledVector(X, l.x).addScaledVector(Y, l.y).addScaledVector(Z, l.z); };
const isDown = (q: SP) => q.u.y < -0.35;
/** the lowest point of the shield as drawn (the boss only when it is drawn) */
const spLow = (q: SP) => { let m = Infinity; for (const p of SH_PTS) m = Math.min(m, spWorld(q, p).y); if (!isDown(q)) m = Math.min(m, spWorld(q, V(0, SD.boss, 0)).y); return m; };
const putShield = (w: World, q: SP) => {
  const lift = Math.max(0, 0.001 - spLow(q)), o = q.o.clone().add(V(0, lift, 0));
  if (isDown(q)) w.prop("shieldDown").put(o.addScaledVector(q.u.clone().normalize(), SD.t), { up: q.u.clone().negate(), face: q.f.clone().negate() });
  else w.prop("shield").put(o, { up: q.u, face: q.f });
};
const spMix = (a: SP, b: SP, k: number): SP => {
  const qa = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(basis(a).X, basis(a).Y, basis(a).Z));
  const qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(basis(b).X, basis(b).Y, basis(b).Z));
  const q = qa.slerp(qb, k);
  return { o: a.o.clone().lerp(b.o, k), u: V(0, 1, 0).applyQuaternion(q), f: V(0, 0, 1).applyQuaternion(q) };
};
/** held upright: the hand target, the way he faces (k as shieldN) */
const spArm = (hand: THREE.Vector3, facing: number, k = 1): SP => { const n = shieldN(facing, k); return { o: shieldAt(hand, n), u: n, f: UPV.clone() }; };
/** where the hand holds it in the arm pose, in the shield's own frame (shieldAt backwards) */
const GRIP_ARM = V(0, -0.035, SH_DROP);
/** THE BOARD, at rest: face down at SH, its top (+z) to the north */
const SP_REST: SP = { o: V(SH.x, SD.t, SH.z), u: V(0, -1, 0), f: V(0, 0, 1) };
// ---- line 15, laying it down: he turns it on its side (its long side level, north-south) and stands it on its long
// lower edge just in front of his knees (the edge the board's west edge will be), holding its top edge; lets go; it
// falls over away from him, face down, pivoting on that edge (always touching the floor). He can hold it there: the
// sunk kneeling figure cannot reach the floor itself, 0.6 m out.
const PIV_X = SH.x - SD.a;                                                         // the board's west edge = the pivot line
/** the board fallen by psi (0 = standing on its edge, PI/2 = at rest) */
const spFall = (psi: number): SP => {
  const c = Math.cos(psi), s = Math.sin(psi), ex = -SD.t, ey = SD.a;               // the edge pose's back middle, from the pivot
  return { o: V(PIV_X + ex * c + ey * s, -ex * s + ey * c, SH.z), u: V(c, -s, 0), f: V(0, 0, 1) };
};
/** where his hand holds it standing on its edge: the middle of its top edge, on the back */
const GRIP_EDGE = V(-0.25, -0.03, 0.05);
/** the lay-down at u (0 = on his arm, as spArm(hand, facing); 1 = at rest). The first LAY_HOLD of it he guides it
 *  (returns the hand target), then it falls by itself */
const LAY_HOLD = 0.55;
const spLay = (hand: THREE.Vector3, facing: number, u: number): { q: SP; grip: THREE.Vector3 | null } => {
  if (u >= 1) return { q: SP_REST, grip: null };
  if (u <= LAY_HOLD) {
    const k = easeInOutCubic(u / LAY_HOLD), q = spMix(spArm(hand, facing), spFall(0), k);
    return { q, grip: spWorld(q, GRIP_ARM.clone().lerp(GRIP_EDGE, k)) };
  }
  const s = (u - LAY_HOLD) / (1 - LAY_HOLD);
  return { q: spFall((Math.PI / 2) * s * s), grip: null };
};
// ---- line 16, snatching it up: his hand goes to its north-west corner, he lifts that end (the board pivots on its
// SOUTH end, so the raw leg slides off that end onto the rug, away from him), and swings it up onto his arm.
const PIV_S = V(SH.x, 0, SH.z - SD.b);
/** the board's north end lifted by th about its south end */
const spTip = (th: number): SP => {
  const c = Math.cos(th), s = Math.sin(th), oy = SD.t, oz = SD.b;
  return { o: V(PIV_S.x, oy * c + oz * s, PIV_S.z - oy * s + oz * c), u: V(0, -c, s), f: V(0, s, c) };
};
const GRIP_NW = V(0.2, -0.02, 0.3), TIP_TH = 0.9;
/** the snatch's phases (u over B.fkUp - 3 .. B.fkUp + 8): his hand goes out to the corner (still kneeling: his arm
 *  is longest from there), he yanks that end up (U_TIP0..U_TIP1), swings it onto his arm. (The sunk kneeling figure's
 *  hand stops about 0.2 m short of the floor: for the first 2 frames of the yank the corner comes up to his hand.) */
const U_TIP0 = 0.27, U_TIP1 = 0.55;
/** the snatch at u (0 = at rest .. 1 = on his arm at spArm(hand, facing)): returns the pose, the hand target (null =
 *  his hand is still on its way), and the leg's place */
const spSnatch = (hand: THREE.Vector3, facing: number, u: number): { q: SP; grip: THREE.Vector3 | null } => {
  if (u <= U_TIP0) return { q: SP_REST, grip: null };
  if (u <= U_TIP1) { const q = spTip(TIP_TH * smooth((u - U_TIP0) / (U_TIP1 - U_TIP0))); return { q, grip: spWorld(q, GRIP_NW) }; }
  const k = easeInOutCubic((u - U_TIP1) / (1 - U_TIP1)), q = spMix(spTip(TIP_TH), spArm(hand, facing), k);
  q.o.add(V(Math.sin(facing), 0, Math.cos(facing)).multiplyScalar(0.12 * Math.sin(Math.PI * k)));   // (swung out round his skirt, not through it)
  return { q, grip: spWorld(q, GRIP_NW.clone().lerp(GRIP_ARM, k)) };
};
/** the raw leg over the snatch: it rides on the board, slides down it to its south end (faster and faster) and drops
 *  off that end onto the rug at LEG_RUG */
const LEG_SLIDE = SD.b + 0.02, V_OFF = 1 / Math.sqrt(1.6);
const legOnTip = (v: number) => {
  const q = spTip(TIP_TH * smooth(Math.min(v, 1))), { Y, Z } = basis(q);
  return { at: spWorld(q, V(SH.x - LEG_ON.x, -LEG_Y, -LEG_SLIDE * Math.min(1, v * v * 1.6))), up: Y.clone().negate(), face: Z };
};
const legSnatch = (u: number): { at: THREE.Vector3; up: THREE.Vector3; face: THREE.Vector3 } => {
  if (u <= U_TIP0) return { at: LEG_ON.clone(), up: V(0, 1, 0), face: V(0, 0, 1) };
  const v = (u - U_TIP0) / (U_TIP1 - U_TIP0);                                      // 0..1 over the tip
  if (v < V_OFF) return legOnTip(v);
  const e = legOnTip(V_OFF), d = smooth((v - V_OFF) / 0.35);                     // off the end: it drops onto the rug
  const at = e.at.clone().lerp(LEG_RUG, d); at.y += 0.03 * Math.sin(Math.PI * d);
  return { at, up: e.up.clone().lerp(V(0, 1, 0), d).normalize(), face: e.face.clone().lerp(V(0, 0, 1), d).normalize() };
};

// ====================================================================================================== line 14
/** Fan Kuai over line 14 (and the frames of 15 before the cut is over): the run up to the guards, the blow, the run
 *  in to his mark */
const fk14 = (f: number): { p: THREE.Vector3; facing: number; pose: RigPose; k: number; push: number } => {
  if (f < B.rushGo) {
    const leg = walkAlong([FAR, HITP], RUN14, (f - B.runGo) / FPS, { endFacing: 0 });
    const push = f >= B.ram - 2 ? 0.12 * [0.5, 0.9, 1, 0.7, 0.35][f - (B.ram - 2)] : 0;
    return { p: leg.at, facing: leg.facing, pose: leg.pose, k: 1, push };
  }
  const leg = walkAlong(IN_PATH, RUSH, (f - B.rushGo) / FPS, { endFacing: FACE14 });
  return { p: bounded(IN_PATH, leg), facing: leg.facing, pose: leg.pose, k: 1, push: 0 };
};
/** version B, outside: the two guards at the shut flap; he runs in past the lens, rams them apart, goes through the flap */
function shot14a(w: World, f: number): Pose {
  const t = f / FPS, c = kick(W17, f, B.ram, 0.05);
  w.setPlace("camp"); w.setCamera(c);
  w.set.setFlap(smooth(lin(f, B.ram + 5, B.ram + 9)));                                   // it flies up as he reaches it
  const stepIn = smooth(lin(f, B.ram - 11, B.ram - 4)), fl = lin(f, B.ram, B.ram + 10), fk = Math.pow(fl, 0.85);
  const gKeys: [number, Expr][] = [[S.from, "neutral"], [B.ram - 15, "stern"], [B.ram - 2, "shock"]];
  for (let i = 0; i < 2; i++) {
    if (fl >= 1) break;                                                                  // out of the frame by then
    const p = fl > 0 ? hopArc(GO1[i], GOF[i], fk, 0.45) : GO0[i].clone().lerp(GO1[i], stepIn);
    if (fl <= 0) p.y += 0.035 * Math.sin(Math.PI * stepIn);
    const side = i ? 1 : -1;
    // (facing us, GUARD_B (halberd in his right hand) stands on the left: both halberds are on the OUTSIDE; the other
    //  way round they were between the two men and crossed through each other as they stepped together)
    // (the halberd hand is pinned out at the hip (common.ts halberdHand): hanging, the shaft went 2 cm into the skirt.
    //  PEOPLE.guard holds it in hand 1, guardB in hand 0)
    const hb = halberdHand(p, 0, i ? 1 : 0), gh: [THREE.Vector3 | null, THREE.Vector3 | null] = i ? [null, hb] : [hb, null];
    w.actor(i ? PEOPLE.guard : PEOPLE.guardB).set(standing(p, 0, f, 21 + i, { hands: gh, expr: at(f, gKeys), gaze: 0, blink: lid(t, 5 + i, gKeys.slice(1).map(([k]) => k / FPS)), head: heads(accent("jolt", f, B.ram - 15 + i), fl > 0 ? { tilt: -side * 50 * fk } : undefined) }));   // (the head lags: it tips toward the blow, away from his halberd)
  }
  const r = w.actor(PEOPLE.fanKuai);
  const run = f < B.rushA, leg = run ? walkAlong(A_RUN, RUN14, (f - B.runGoA) / FPS, { endFacing: Math.PI }) : walkAlong(A_IN, RUSH_A, (f - B.rushA) / FPS);
  const k = smooth(lin(f, B.ram - 10, B.ram - 4)), push = run && f >= B.ram - 2 ? 0.12 * [0.5, 0.9, 1, 0.7][f - (B.ram - 2)] : 0;
  const seen = leg.at.z > SEEN_Z;                                                        // (the cut comes before he is further in)
  if (seen) r.set({ at: leg.at, facing: leg.facing, pose: leg.pose, hands: [null, shieldHand(leg.at, leg.facing, k, push)], expr: "stern", gaze: 0, blink: lid(t, 3), visible: true });
  w.update();
  if (seen) shieldOnArm(w, r, leg.facing, k);
  const hitPx = w.project(V(CX, 0.8, DZ + 0.85));
  const ov = frag(
    seen ? hudTag({ f, who: "fanKuai", at: headPx(w, r), from: B.tagAt, out: B.tagOut, side: "up" }) : null,
    burst(f, { at: B.ram, x: hitPx.x, y: hitPx.y, r: 210, n: 12, color: COL.white }),
  );
  return { camera: c, overlays: ov, slate: slate(S14) };
}
/** version B, Fan Kuai inside (14b and the start of 15a: ONE walk over the cut, so he is never in two places): in
 *  through the doorway, stops just inside and glares (DOORSTAND); from B.in15Go he strides on to his mark (IN15) */
const fkIn = (f: number): { at: THREE.Vector3; facing: number; pose: RigPose; arrived: boolean; walking: boolean } => {
  if (f < B.in15Go) { const l = walkAlong(B_IN, RUSH, (f - (B.cutB - 2)) / FPS, { endFacing: FACE_DOOR }); return { at: l.at, facing: l.facing, pose: l.pose, arrived: l.arrived, walking: false }; }
  const l = walkAlong(IN15, RUSH, (f - B.in15Go) / FPS, { startFacing: FACE_DOOR, endFacing: FACE15 });
  const p = bounded(IN15, l);
  return { at: p, facing: lerpA(FACE_DOOR, l.facing, smooth((f - B.in15Go) / 4)) + SIDLE_IN * (p.y / BOUND_H), pose: l.pose, arrived: l.arrived, walking: true };
};
/** version B, inside: he comes through the doorway under the rolled-up flap, stops, glares at Xiang Yu (screen right),
 *  then sets off toward the floor (into the lens) */
function shot14b(w: World, f: number): Pose {
  const t = f / FPS, c = C14B;
  w.setPlace("tent"); w.setCamera(c);
  w.set.setFlap(1);
  banquet(w, f, { extra: { liu: { expr: "shock", gaze: -1 } } });
  const r = w.actor(PEOPLE.fanKuai), leg = fkIn(f);
  r.set({ at: leg.at, facing: leg.facing, pose: leg.pose, hands: [null, boundHand(leg.at, leg.facing)], expr: "stern", gaze: leg.arrived || leg.walking ? 1 : 0, blink: lid(t, 3), head: accent("pop", f, B.inAt), visible: true });
  w.update();
  shieldOnArm(w, r, leg.facing, 1);
  return { camera: c, slate: slate(S14) };
}
function shot14(w: World, f: number): Pose {
  if (ALT14) return f < B.cutB ? shot14a(w, f) : shot14b(w, f);
  const t = f / FPS, c = kick(D14, f, B.ram, 0.05);
  w.setPlace("tent"); w.setCamera(c);
  w.set.setFlap(1);
  // ---- the table: only Liu Bang is in this frame; he starts at the noise behind him, then knows the footsteps
  const liuKeys: [number, Expr][] = [[S.from, "nervous"], [B.ram, "shock"], [HIT.burstIn + 6, "relief"]];
  banquet(w, f, { extra: { liu: { expr: at(f, liuKeys), gaze: at(f, [[S.from, 0], [B.ram, -1], [B.fkAt - 4, 0]]), blink: lid(t, 1, liuKeys.slice(1).map(([k]) => k / FPS)), head: accent("jolt", f, B.ram) } } });
  // ---- the guards: they close the gap as he comes, and fly apart
  const stepIn = smooth(lin(f, B.ram - 11, B.ram - 4)), fl = lin(f, B.ram, B.ram + 11), fk = Math.pow(fl, 0.85);   // (they stay in the doorway for 4 frames of the fall)
  for (let i = 0; i < 2; i++) {
    if (f >= B.ram + 12) break;                                                          // behind the wall by then
    const p = fl > 0 ? hopArc(G1[i], GF[i], fk, 0.32) : G0[i].clone().lerp(G1[i], stepIn);
    if (fl <= 0) p.y += 0.035 * Math.sin(Math.PI * stepIn);
    p.y -= 0.75 * smooth(lin(f, B.ram + 4, B.ram + 11));                                  // down they go (behind the wall)
    const side = i ? 1 : -1;
    const hb = halberdHand(p, Math.PI, i ? 0 : 1), gh: [THREE.Vector3 | null, THREE.Vector3 | null] = i ? [hb, null] : [null, hb];   // (pinned: see shot14a)
    w.actor(i ? PEOPLE.guardB : PEOPLE.guard).set(standing(p, Math.PI, f, 21 + i, { hands: gh, turn: 1, gaze: 0, head: heads(accent("jolt", f, B.ram - 12 + i), fl > 0 ? { tilt: side * 50 * fk } : undefined) }));
  }
  // ---- Fan Kuai
  const A = fk14(f), r = w.actor(PEOPLE.fanKuai), stopped = f >= B.fkAt;
  r.set({ at: A.p, facing: A.facing, pose: A.pose, hands: [null, shieldHand(A.p, A.facing, A.k, A.push)], expr: "stern", gaze: stopped ? 1 : 0, blink: lid(t, 3), head: accent("pop", f, B.fkAt), visible: true });
  w.update();
  shieldOnArm(w, r, A.facing, A.k);
  // ---- overlays: his tag in the doorway above his head while he runs up; the blow
  const hitPx = w.project(V(HITP.x, 0.75, HITP.z + 0.4));
  const ov = frag(
    hudTag({ f, who: "fanKuai", at: headPx(w, r), from: B.tagAt, out: B.tagOut, side: "up" }),
    burst(f, { at: B.ram, x: hitPx.x, y: hitPx.y, r: 210, n: 12, color: COL.white }),
  );
  return { camera: c, overlays: ov, slate: slate(S14) };
}

// ====================================================================================================== line 15
/** his left hand at rest while he kneels: on his thigh, in front of him above the skirt (hanging, it went into the
 *  skirt and the arm into his side) */
const restL = (p: THREE.Vector3, facing: number) => rel(p, facing, 0.14, 0.8, 0.26);
/** kneeling at his mark: k 0 standing (facing FACE15) .. 1 down (facing FACE_SH) */
const fkKneel = (k: number) => { const K = kneel(k, FKM, 16); return { K, p: K.at as THREE.Vector3, facing: lerpA(FACE15, FACE_SH, k) }; };
const LAY0 = () => B.kneelGo + 1, LAY_N = 10, k01 = (k: number) => clamp01(k * 3);
/** line 15: he kneels (B.kneelGo, 9 frames) and lays the shield down (spLay over LAY_N frames): his pose, his left
 *  hand's target, and the shield's pose (null = still on his arm: draw it from the hand) */
const layDown = (f: number) => {
  const kn = easeInOutCubic(lin(f, B.kneelGo, B.kneelGo + 9)), u = lin(f, LAY0(), LAY0() + LAY_N), { K, p, facing } = fkKneel(kn);
  const carry = shieldHand(p, facing, 1, 0.08 * k01(kn));                          // (held 8 cm further out as he goes down: his skirt)
  if (u <= 0) return { K, facing, hand: carry, q: null as SP | null };
  const L = spLay(carry, facing, u);
  if (L.grip) return { K, facing, hand: L.grip, q: L.q };
  // let go: the hand goes from where it let go to his thigh
  const fr0 = LAY0() + LAY_HOLD * LAY_N, k0 = fkKneel(easeInOutCubic(lin(fr0, B.kneelGo, B.kneelGo + 9)));
  const kk = easeInOutCubic(lin(fr0, B.kneelGo, B.kneelGo + 9)), g0 = spLay(shieldHand(k0.p, k0.facing, 1, 0.08 * k01(kk)), k0.facing, LAY_HOLD).grip!;
  return { K, facing, hand: g0.lerp(restL(p, facing), smooth((u - LAY_HOLD) / (1 - LAY_HOLD))), q: L.q };
};
function shot15(w: World, f: number): Pose {
  const t = f / FPS, c = cam15(f), s = f >= S15b.from ? S15b : S15a;
  w.setPlace("tent"); w.setCamera(c);
  w.set.setFlap(1);
  const held = f >= B.raw - 3;                                                           // nothing wanders on 生的
  // ---- the table
  const xyKeys: [number, Expr][] = [[S15a.from, "stern"], [B.praise, "grin"]];
  // his near hand comes off the table and points at Fan Kuai (a pinned hand: a seated figure keeps its arms otherwise)
  const pk = smooth(lin(f, B.praise, B.praise + 5)) * (1 - smooth(lin(f, B.praise + 20, B.praise + 26)));
  banquet(w, f, { extra: {
    xiangyu: { expr: at(f, xyKeys), gaze: -1, blink: held ? 0 : lid(t, 4, [B.praise / FPS]), head: accent("nod", f, B.praise + 3), ...(pk > 0 ? { hands: [null, XY_REST.clone().lerp(XY_POINT, pk)] as St["hands"] } : {}) },
    uncle: { gaze: -1, ...(held ? { blink: 0 } : {}) },
    liu: { expr: "nervous", gaze: f >= B.servAt ? 0 : -1, ...(held ? { blink: 0 } : {}) },
    fanzeng: held ? { blink: 0, gaze: 0 } : {},
  } });
  // ---- the servant: in through the door with the leg in both hands (one at each end), up to the board; throws it; out again
  const sv = w.actor(PEOPLE.servant), faceSh = yawTo(SERVE, SH);
  let legAt: THREE.Vector3 | null = null, legFace = 0;
  if (f >= B.servGo && f < B.servGone) {
    const back = f >= B.servBack;
    const leg = back ? walkAlong(SERVE_BACK, SERV_BACK, (f - B.servBack - 3) / FPS) : walkAlong(SERVE_PATH, SERV, (f - B.servGo) / FPS, { endFacing: faceSh });
    const facing = back && f <= B.servBack + 3 ? lerpA(faceSh, yawTo(SERVE, GAP), smooth(lin(f, B.servBack - 1, B.servBack + 3))) : leg.facing;
    const thr = f >= B.toss - 1 && f < B.toss + 3 ? 0.1 * Math.sin((Math.PI * (f - B.toss + 2)) / 5) : 0;   // the hands go with the throw
    const hands: St["hands"] = f < B.toss + 3 ? [rel(leg.at, facing, CARRY_X - 0.29, CARRY_Y, CARRY_Z + thr), rel(leg.at, facing, CARRY_X + 0.27, CARRY_Y, CARRY_Z + 0.1 + thr)] : [null, null];
    sv.set({ at: leg.at, facing, pose: leg.pose, hands, expr: "neutral", gaze: 0, blink: lid(t, 9), visible: true });
    if (f < B.toss) { legAt = rel(leg.at, facing, CARRY_X, CARRY_Y, CARRY_Z); legFace = facing; }
  }
  // ---- Fan Kuai: walks in to his mark (version B), stands and glares; kneels and lays his shield down; looks at what he was given
  const r = w.actor(PEOPLE.fanKuai), fkKeys: [number, Expr][] = [[S15a.from, "stern"], [B.land + 3, "deadpan"]];
  const walkIn = ALT14 && f < B.in15At + 5 ? fkIn(f) : null;                              // (version B: the last steps from the door, and the 5-frame turn to FACE15 on the mark)
  if (walkIn) {
    r.set({ at: walkIn.at, facing: walkIn.facing, pose: walkIn.pose, hands: [null, boundHand(walkIn.at, walkIn.facing)], expr: "stern", gaze: 1, blink: lid(t, 3), visible: true });
    w.update();
    shieldOnArm(w, r, walkIn.facing, 1);
  } else {
    const L = layDown(f);
    r.set({ ...L.K, facing: L.facing, pose: { kind: "idle", t: t + 1.23 }, hands: [null, L.hand], expr: at(f, fkKeys), gaze: f >= B.eyes ? 1 : f >= B.kneelGo ? 0 : 1, blink: held ? 0 : lid(t, 3, [(B.land + 3) / FPS]), head: ALT14 ? accent("pop", f, B.in15At) : undefined, visible: true });
    w.update();
    if (L.q) putShield(w, L.q); else shieldOnArm(w, r, L.facing, 1);
  }
  // ---- the leg
  if (f >= B.toss) {
    const from = rel(SERVE, faceSh, CARRY_X, CARRY_Y, CARRY_Z), u = lin(f, B.toss, B.land);
    legAt = u < 1 ? hopArc(from, LEG_ON, u, 0.2) : LEG_ON.clone();                       // (a raw leg lands with a thud: no bounce)
    legFace = lerpA(faceSh, 0, u);
  }
  if (legAt) w.prop("pigLeg").put(legAt, { facing: legFace });
  // ---- overlays
  const sh = w.project(V(SH.x, 0.1, SH.z));
  const ov = frag(stamp({ f, id: "raw", from: B.raw, out: S15b.to - 4, x: sh.x + RAW_DX, y: sh.y + RAW_DY, size: RAW_SIZE }));
  return { camera: c, overlays: ov, slate: slate(s) };
}

// ====================================================================================================== line 16
function shot16(w: World, f: number): Pose {
  const t = f / FPS, c = cam16(f);
  w.setPlace("tent"); w.setCamera(c);
  w.set.setFlap(1);
  banquet(w, f, { in: ["zhang", "xiangyu", "uncle", "fanzeng"], extra: { xiangyu: { expr: f >= B.standAt ? "smile" : "grin", gaze: -1, blink: lid(t, 4, [B.standAt / FPS]) }, uncle: { gaze: -1 } } });
  // ---- Liu Bang: rises, walks to the door (a back view), turns, beckons, goes
  const liu = w.actor(PEOPLE.liuBang), faceRoom = yawTo(BECK, FKM);
  const liuKeys: [number, Expr][] = [[S16.from, "nervous"], [B.riseGo, "smile"], [B.atDoor, "focus"]];
  const face: St = { expr: at(f, liuKeys), blink: lid(t, 1, liuKeys.slice(1).map(([k]) => k / FPS)), gaze: 0 };
  if (f < B.standAt) {
    // rising, his hands push off the table top and come to his sides (left to the rig, they sank into his lap: the robe)
    const lp = V(LIU_UP.x, 0, LIU_UP.z), hk = smooth(lin(f, B.riseGo + 1, B.standAt));
    const hands: St["hands"] = f >= B.riseGo ? [rel(lp, 0, -0.062, 0.37, 0.36).lerp(hang(lp, 0, 0), hk), rel(lp, 0, 0.062, 0.37, 0.36).lerp(hang(lp, 0, 1), hk)] : undefined;
    const rise = lin(f, B.riseGo, B.standAt), st = { ...SEATS.liu, top: SEATS.liu.top.clone().add(V(0, 0, -RISE_BACK * smooth(rise))) };
    liu.set({ ...seated(st, t + 0.37, f >= B.riseGo ? { rise, hipY: liu.dim.hipY } : {}), ...(hands ? { hands } : {}), ...face, visible: true });
  }
  else if (f < B.offGo) {
    const leg = walkAlong(LIU_PATH, LIU_IN, (f - B.walkGo) / FPS, { startFacing: 0, endFacing: faceRoom });
    const facing = f <= B.walkGo ? lerpA(0, yawTo(LIU_PATH[0], LIU_PATH[1]), smooth(lin(f, B.turnGo, B.walkGo + 1))) : leg.facing;
    const wave = f >= B.beck && leg.arrived;
    liu.set({ at: leg.at, facing, pose: wave ? { kind: "wave", t: (f - B.beck) / FPS, arm: 0 } : leg.pose, ...face, visible: true });
  } else {
    const leg = walkAlong(LIU_OFF, LIU_OUT, (f - B.offGo - 2) / FPS);
    const facing = lerpA(faceRoom, leg.facing, smooth(lin(f, B.offGo, B.offGo + 6)));
    if (!leg.arrived) liu.set({ at: leg.at, facing, pose: leg.pose, ...face, visible: true });
  }
  // ---- Fan Kuai: kneeling at his meal; looks up at the hand; up, snatches the shield up (the leg slides off it), out
  const r = w.actor(PEOPLE.fanKuai);
  const kn = 1 - easeInOutCubic(lin(f, B.fkUp, B.fkUp + 7)), u = lin(f, B.fkUp - 3, B.fkUp + 8);
  if (f < B.fkGo) {
    const K = kneel(kn, FKM, 16), fkP = K.at as THREE.Vector3, front = shieldHand(fkP, FACE_SH, 1), rest = restL(fkP, FACE_SH);
    const S_ = spSnatch(front, FACE_SH, u);
    const hand = u >= 1 ? front : S_.grip ?? rest.clone().lerp(spWorld(SP_REST, GRIP_NW), smooth(u / U_TIP0));
    r.set({ ...K, facing: FACE_SH, pose: { kind: "idle", t: t + 1.23 }, hands: [null, hand], expr: f >= B.beck + 4 ? "focus" : "deadpan", gaze: 1, blink: lid(t, 3, [(B.beck + 4) / FPS]), visible: true });
    w.update();
    if (u >= 1) shieldOnArm(w, r, FACE_SH, 1); else putShield(w, S_.q);
  } else {
    const leg = walkAlong(FK_OFF, FK_OUT, (f - B.fkGo) / FPS), p = bounded(FK_OFF, leg);
    const facing = lerpA(FACE_SH, leg.facing, smooth(lin(f, B.fkGo - 1, B.fkGo + 5))) + SIDLE_OUT * (p.y / BOUND_H);
    if (!leg.arrived) {
      // (turn 1 = his true facing, a back view: left to the rig's turn toward the camera, his body turned away from the
      //  shield, which follows the true facing, and his forearm went through it)
      const k = 1 - smooth((leg.d - SIDE_FROM) / 0.45);
      r.set({ at: p, facing, turn: smooth(lin(f, B.fkGo, B.fkGo + 8)), pose: leg.pose, hands: [null, boundHand(p, facing, k)], expr: "focus", gaze: 0, blink: lid(t, 3), visible: true });
      w.update();
      shieldOnArm(w, r, facing, k);
    }
  }
  // ---- the leg stays: on the board, then (the snatch) down its south end onto the rug
  const lg = legSnatch(u);
  w.prop("pigLeg").put(lg.at, { up: lg.up, face: lg.face });
  return { camera: c, slate: slate(S16) };
}

// ====================================================================================================== line 17
function shot17(w: World, f: number): Pose {
  const t = f / FPS, c = cam17(f);
  w.setPlace("camp"); w.setCamera(c);
  w.set.setFlap(1 - smooth(lin(f, B.fkGo17 + 12, B.fkGo17 + 24)));                        // it falls shut behind Fan Kuai (shut in line 19)
  // ---- Zhang Liang waits outside (he stays behind: line 19)
  w.actor(PEOPLE.zhangLiang).set(standing(Z17, 1.15, f, 2, { gaze: 1 }));
  // ---- Liu Bang: out of the door toward us, stops, a hand up ("wait: I have not taken my leave"), turns to Fan Kuai
  const liu = w.actor(PEOPLE.liuBang);
  const lg = walkAlong(LIU_17, LIU_WALK, (f - B.liuGo) / FPS, { endFacing: 0 });
  const liuFace = lg.arrived ? lerpA(0, 1.05, smooth(lin(f, B.fkAt17 - 4, B.fkAt17 + 4))) : lg.facing;
  const liuKeys: [number, Expr][] = [[S17.from, "nervous"], [B.yu + 4, "shock"], [B.bye + 6, "sad"]];
  const waving = f >= B.wait && f < B.says - 2;
  liu.set({ at: lg.at, facing: liuFace, pose: waving ? { kind: "wave", t: (f - B.wait) / FPS, arm: 0 } : lg.pose, expr: at(f, liuKeys), gaze: f >= B.fkAt17 ? 1 : lg.arrived ? -1 : 0,
    blink: lid(t, 1, liuKeys.slice(1).map(([k]) => k / FPS)), head: heads(accent("jolt", f, B.yu + 4), accent("nod", f, B.bye + 8)), visible: true });
  // ---- Fan Kuai: out of the door behind him, round him, plants himself; the answer
  const r = w.actor(PEOPLE.fanKuai);
  const fg = walkAlong(FK_17P, FK_17, (f - B.fkGo17) / FPS, { endFacing: -1.05 });
  const sp = speak(Q17, f, 3, [2, 3, 6, 7, 9]);
  const bye = f >= B.bye && f < B.bye + 18;
  // he plants the tall shield on the ground at his side, his hand on its top edge (it hides his legs, not his chest)
  const plant = smooth(lin(f, B.fkAt17 + 1, B.fkAt17 + 6));
  r.set({ at: fg.at, facing: fg.facing, pose: bye && fg.arrived ? { kind: "wave", t: (f - B.bye) / FPS, arm: 0 } : fg.pose, hands: [null, shieldHand(fg.at, fg.facing, 0, 0, lerp(0.66, 0.84, plant))], expr: "stern", gaze: fg.arrived ? -1 : 0,
    ...sp, blink: sp.blink ?? lid(t, 3), head: heads(sp.head, accent("shake", f, B.bye + 2)), visible: true });
  w.update();
  shieldOnArm(w, r, fg.facing, 0, lerp(SH_DROP, 0.43, plant));
  // ---- overlays: the idiom
  const ov = frag(stamp({ f, id: "fish", from: HIT.daozu, out: S.to - 4, x: FISH.x, y: FISH.y }));
  return { camera: c, overlays: ov, slate: slate(S17) };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[S14, shot14], [S15a, shot15], [S15b, shot15], [S16, shot16], [S17, shot17]];
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) { let fn = TABLE[0][1]; for (const [s, g] of TABLE) if (f >= s.from) fn = g; return fn(w, f); },
};
