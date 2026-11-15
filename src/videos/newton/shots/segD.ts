// SEGMENT D · 下午 · the street, then the Schools (script v5 rows 22-27 = D01-D06 with the two silent rows before them;
// camplan D with its director notes; the v5 rebuild, 15 Nov). ONE TAKE PER PLACE and one join inside: in on CLOCK ⑤ (the
// REC clock races over C's held chair, f2034 = mus_lecture's first note), WHIP ⑥ after him into the Schools on his first
// stride back (D owns both halves: the smear and the blur), out on CLOCK ⑦ over the held medium after "Don't." (the
// last frames are still for the race). She is never seen: no mic, no hands; her claps are sound only, her body jolts.
// Her eye (the lens) is 1.5 m over the floor. Still is the default; every move has a reason and lands on its anchor:
//   ST  THE STREET, HOLD (D from .. the whip)   a medium-wide (full figure, fov 44) from across the street, 18 deg off
//       square to the gate: the arch's stone side and its open leaf beside him, the college court through it (the
//       street's run either way does not fit a 9:15 frame with a readable figure: noted in rebuild/D/NOTES.md). He strides out of the gate, turns left (the wrong way), two strides ON the two footsteps
//       (BEAT wrong), STOP 3/5 (12 f: sway 0, no blink, eyes to the side, chin up), a double blink, he turns on his heel,
//       eyes dropping to the notes under his arm, and his first hurried stride back lands on its step (BEAT stepBack):
//       he walks into a still frame and the whip is his exit. (Script v5: one gag only, the handkerchief wipe is cut.)
//   W   WHIP ⑥ RIGHT after him (BEAT whipOut .. schools, out 4 / in 4): the cut inside the blur on the door's creak.
//   H   THE SCHOOLS: ONE POSITION at the back of the hall (HALL, back right, 0.8 m from the back wall); her lens does all
//       the travelling, always aimed by his eyes' screen point, every zoom in log(tan(fov/2)) (cam.ts lensCam):
//       WIDE HOLD           the empty benches, the dust in the sunbeam, one small man up the aisle and round the
//                           lectern's left end (screen left: the notes stay on the open side) to his place. 悄悄说 D01: whisperLean (a step, a 3 deg tip; stays on him).
//       M3 ZOOM IN          on 有 (he reaches his place; the speaker changes) to the MEDIUM, landing on "miss" (D02).
//       HOLD                "...miss a lecture." in the music's written rest; the bench backs stacked under him.
//       M4 SLOW PUSH        from her question (D03) to the EXTREME CLOSE (the scene's one), landing on "students".
//       HOLD                "students." with the nod at 0.25; 悄悄说 D05 through 他没笑: only the tip (the lens is at its
//                           closest), his face does not move.
//       M5 PULL BACK        on 我 the lean releases with the pull back to the MEDIUM as he turns to lecture to nobody
//                           (the lead looks away), landing on her line's end, before tick 2.
//       HOLD to the end     the lecture (mouth only, the muffled echo) is cut off by clap 1; he gathers his notes in the
//                           same take; on each clap a small jolt of her body (sound only: the frame dips 34 px, his face
//                           about 50 / 63 px with his own head jolt), his head jolts and
//                           blinks, his eyes stay on the paper; "Don't." with FLICK 3/4, not looking up; still for ⑦.
// Every frame is a pure function of f; every time comes from line() / capWord() / BEAT (beats.ts sits on SYNC_POINTS).
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, LENS_H, H, clamp01, smooth, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN, NEWTON_HIDE, newtonEyes } from "../people";
import { STRX, STREET_SET, SCX, SCHOOLS, SCHOOLS_SET, FOV } from "../layout";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, lerpA, rel, hang, path, rigSpeak, type Rig, type RigPose, type RigHead, type PathKey } from "./common";
import { whisperLean } from "../whisper";
import { deskPoint, deskRot, underArm, clapJolt, clapAmp, stepPose, stepDist, stopPose, breath, NOTES } from "./segD_parts";
import type { World } from "../world";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const S = SEGMENTS[3];
const D = BEAT.D;
const RAD = Math.PI / 180;
const L2 = line("D02"), L3 = line("D03"), L4 = line("D04"), L5 = line("D05"), L6 = line("D06");
/** her eye over the floor (the format: about 1.5 m) */
const EYE_D = 1.5;
/** his DRAWN eye line over people.ts newtonEyes (the aim height): measured with the faces checker (--dump: "eyes y")
 *  at the lectern, 7 cm higher; every framing below aims at the drawn eyes, so the plan's screen points hold */
const EYE_LIFT = 0.07;
/** a CamPose fov (the 1920 reference) for a REAL vertical angle on the 1800 frame (the plan's 9:15 numbers) */
const camFov = (real: number) => (2 * Math.atan(Math.tan((real * RAD) / 2) * (LENS_H / H))) / RAD;
const sineInOut = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));

// ---------------------------------------------------------------------------------------------------- the beats
/** the street: his two steps the wrong way (the footfalls), the stop, the hurried step back, whip ⑥ */
const STEP_A = D.wrong[0], STEP_B = D.wrong[1], STEP_PER = STEP_B - STEP_A;
/** the trailing foot comes up beside the planted one; the footsteps are dead from BEAT stop */
const T_SETTLE = Math.min(STEP_B + 7, D.stop[0]);
/** STOP 3/5: 12 frames dead still (sway 0, no blink, eyes 0.5 to the side, chin up 3 deg) from the first silent frame */
const T_FREEZE0 = D.stop[0], T_FREEZE1 = D.stop[0] + 12;
/** the double blink right after it */
const T_BLINK = [T_FREEZE1 + 1, T_FREEZE1 + 6];
/** he turns on his heel (toward her side), eyes dropping to the notes under his arm, done 2 frames before his step */
const T_TURN0 = T_BLINK[1] + 3, T_TURN1 = D.stepBack - 2;
/** his first hurried stride back: the foot lands ON BEAT stepBack (the walk sets off 4 frames before) */
const T_BACK = D.stepBack, T_BACK0 = T_BACK - 4;
/** WHIP ⑥: its outgoing half (BEAT whipOut) and THE CUT (BEAT schools: the whoosh peak, the door's creak) */
const T_WHIP = D.whipOut, T_CUT = D.schools, WHIP_IN = 4;
/** the hall: he arrives at his mark with the paper (BEAT paper = the rustle: the sheaf swung onto the desk, flat on its
 *  first peak 8 frames later), deals three sheets on the rustle's second peak */
const T_ARRIVE = D.paper - 2;
const T_PUT0 = T_ARRIVE, T_PUT1 = D.paper + 8;
const DEAL = [T_PUT1 + 6, T_PUT1 + 12, T_PUT1 + 18];
/** M3 THE ZOOM IN: from 有 (D01's last word: he reaches his place) to "miss" (BEAT miss) */
const T_M3_0 = capWord("D01", "有").from, T_M3_1 = D.miss;
/** M4 THE SLOW PUSH: from her question to "students" (BEAT push) */
const T_M4_0 = D.push[0], T_M4_1 = D.push[1];
/** the nod on "students" (staging change 4: 0.25, so the extreme close does not wobble) */
const T_NOD = capWord("D04", "students").from, NOD_AMP = 0.25;
/** M5 THE PULL BACK: on 我 (BEAT release) to her line's end (before tick 2's slip, BEAT tick2) */
const T_ME = D.release, T_M5_1 = Math.min(L5.to + 1, D.tick2 - 2);
/** the claps (sound only: her body jolts; his head jolts and blinks) and "Don't." (FLICK 3/4) */
const C1 = D.clap1, C2 = D.clap2, T_FL = D.dont;
/** the gather, in the same take (staging change 1): clap 1 cuts the lecture off; the right hand comes down to the
 *  spread sheets over 8 frames; the sweep, the lift; clap 2 lands with the sheaf lifted; two taps; the tuck */
const G_SWEEP0 = C1 + 8, G_SWEEP1 = C1 + 17, G_LIFT = C1 + 21, G_TAPS = [C2 + 4, C2 + 8], G_TUCK0 = C2 + 10, G_TUCK1 = C2 + 20;

// ---------------------------------------------------------------------------------------------------- ST the street
const G = STREET_SET.gate;
/** his way: just out of the gate's arch mouth on the cut, turning left onto the footway's edge, on along it the wrong
 *  way (+z: screen left from her side of the street) */
const ST_P0 = V(STRX + G.x + 0.15, 0, G.arch.z - 0.2);
const ST_P1 = ST_P0.clone().add(V(0.32, 0, 0.14));
const ST_PATH = [ST_P0, ST_P1, ST_P1.clone().add(V(0.06, 0, 1.6))];
/** his half stride: the rig's longest (a brisk stride: a step every 12 frames on the sound) */
const ST_S = 0.3, BACK_PER = 9, BACK_S = 0.3;
const stAlong = (d: number) => walkAlong(ST_PATH, 1, Math.max(1e-4, d));
const D_STEP_B = stepDist(STEP_B, S.from, STEP_PER, ST_S);
const D_STOP = D_STEP_B + stopPose(T_SETTLE, STEP_B, T_SETTLE - STEP_B, ST_S).drift;
const ST_STOP = stAlong(D_STOP).at, ST_STOP_FACE = stAlong(D_STOP).facing;
/** his hurried way back (-z, screen right): metres from the stop, easing off over the first 4 frames */
const backDist = (f: number) => {
  const v = (2 * BACK_S) / 0.6 / (2 * BACK_PER), u = Math.max(0, f - T_BACK0);
  return v * (u < 4 ? (u * u) / 8 : u - 2);
};
/** HER PLACE across the street (on the cobbles by the east footway, a little south of the gate, so his wrong way comes
 *  three-quarter toward her and his way back goes three-quarter away), the lens, his stop's eyes on (ST_SX, ST_SY) */
const ST_BEAR = 18 * RAD, ST_DIST = 4.4;
const ST_POS = ST_STOP.clone().add(V(Math.cos(ST_BEAR) * ST_DIST, EYE_D, Math.sin(ST_BEAR) * ST_DIST));
const ST_FOV = 44, ST_SX = 450, ST_SY = 800;
const ST_EYES = newtonEyes(ST_STOP, ST_STOP_FACE).add(V(0, EYE_LIFT, 0));
const CAM_ST = C.aimCam(ST_POS, ST_EYES, ST_SX, ST_SY, ST_FOV);
const camStreet = (f: number): CamPose => C.nudge(CAM_ST, { up: breath(f) });

// ---------------------------------------------------------------------------------------------------- H the hall
const LZ = SCHOOLS_SET.lectern.z, WZ1 = SCHOOLS_SET.walls.z1;
/** ONE MARK for him at the lectern (staging change 2: N_B, 0.1 m nearer the desk than the layout's mark, so his hands
 *  reach the paper where it lies from the laying out to the tuck) */
const N_B = SCHOOLS.newton.clone().add(V(0, 0, 0.1));
const N_EYES = newtonEyes(N_B, 0).add(V(0, EYE_LIFT, 0));
/** his walk: up the aisle (through the sunbeam's patch), round the lectern's LEFT end (screen left, -x: the lectern
 *  stays on his free right side, the notes under his left arm on the open side; round the right end the clearance
 *  tool had his head and the sheaf 2-2.6 cm into the desk), in behind it to N_B; brisk (he is late from his wrong
 *  turn) */
const HALL_PATH = [V(SCX + 0.05, 0, 2.0), V(SCX + 0.05, 0, LZ + 0.8), V(SCX - 0.88, 0, LZ + 0.3), V(SCX - 0.88, 0, N_B.z), N_B.clone()];
const H_SPEED = 1.7;
const T_SETOFF = T_ARRIVE - Math.round(walkTime(HALL_PATH, H_SPEED) * FPS);
const LAST_YAW = Math.atan2(HALL_PATH[4].x - HALL_PATH[3].x, HALL_PATH[4].z - HALL_PATH[3].z);
/** HER ONE POSITION in the hall (staging change 3: she stays at the back): 2.6 m right of the aisle, 0.8 m in from the
 *  back wall, behind the last row; her eye 1.5 m. The lenses (CamPose fov) and his eyes' screen points:
 *    WIDE  the base lens: the whole hall, him small at the front, the rows stacked under him
 *    MED   10.42 deg (the plan's 9:15 number): his head about 410 px, the lectern's edge under his mouth, the empty
 *          bench backs stacked under the lectern
 *    XC    5.5 deg: the director's fallback (D note 1), taken because at the plan's 4.18 deg his 1.06-scale head is
 *          about 1020 px and the face's skin runs into the 54 px margin and under the button column; at 5.5 deg the
 *          head is about 780 px and M4 is still x1.9 */
const HALL = V(SCX + 2.6, EYE_D, WZ1 - 0.8);
const WIDE_FOV = FOV, WIDE_SX = 430, WIDE_SY = 780;
const MED_FOV = camFov(10.42), MED_SX = 470, MED_SY = 560;
const XC_FOV = camFov(5.5), XC_SX = 500, XC_SY = 640;
const hallKeys: C.LensKey[] = [
  { f: T_CUT, pos: HALL, at: N_EYES, sx: WIDE_SX, sy: WIDE_SY, fov: WIDE_FOV },
  { f: T_M3_0, pos: HALL, at: N_EYES, sx: WIDE_SX, sy: WIDE_SY, fov: WIDE_FOV },
  { f: T_M3_1, pos: HALL, at: N_EYES, sx: MED_SX, sy: MED_SY, fov: MED_FOV },
  { f: T_M4_0, pos: HALL, at: N_EYES, sx: MED_SX, sy: MED_SY, fov: MED_FOV },
  { f: T_M4_1, pos: HALL, at: N_EYES, sx: XC_SX, sy: XC_SY, fov: XC_FOV, ease: sineInOut },
  { f: T_ME, pos: HALL, at: N_EYES, sx: XC_SX, sy: XC_SY, fov: XC_FOV },
  { f: T_M5_1, pos: HALL, at: N_EYES, sx: MED_SX, sy: MED_SY, fov: MED_FOV },
];
/** the whisper's lean: D01 a step (0.4 m: she stays behind the last row) and the tip; D05 on the extreme close only the
 *  tip (the lens is at its closest: script v5 risk 6), and its lean releases ON 我 with the pull back */
const W_STEP_D01 = 0.4, W_TILT = 3;
const camHall = (f: number): CamPose => {
  const cam = C.lensCam(f, hallKeys);
  const d05 = f >= L5.preFrom - 12;
  const k = d05 ? 1 - smooth(clamp01((f - T_ME) / 10)) : 1;
  const leant = whisperLean(f, cam, { at: N_EYES, step: d05 ? 0 : W_STEP_D01, tilt: W_TILT, k });
  // her two claps: the frame dips about 45 px at the medium (sound only: no hands)
  return clapJolt(leant, f, [C1, C2], clapAmp(MED_FOV));
};
/** 0..1: how far the lens has zoomed from the wide to the medium (log tan): the light focus comes with it */
const zoomK = (fov: number) => clamp01(Math.log(C.zoomFactor(WIDE_FOV, fov)) / Math.log(C.zoomFactor(WIDE_FOV, MED_FOV)));

// ---------------------------------------------------------------------------------------------------- the lectern
/** ONE PLACE for the paper (staging change 2): the sheaf (his left, screen right) and the spread sheets (his right) on
 *  the desk's near half, in his reach from N_B, from the laying out to the gather */
const SHEAF = { dx: 0.04, dz: -0.05, yaw: 0.1 }, SPREAD = { dx: -0.24, dz: -0.03, yaw: -0.12 };
const qOf = (e: [number, number, number]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2], "YXZ"));
const SHEAF_AT = deskPoint(SHEAF.dx, SHEAF.dz, NOTES.h / 2), SHEAF_Q = qOf(deskRot(SHEAF.yaw));
const SPREAD_AT = deskPoint(SPREAD.dx, SPREAD.dz, 0), SPREAD_Q = qOf(deskRot(SPREAD.yaw));
/** the sheaf's grip edge (its +x edge: the left hand) for an origin and a rotation */
const gripOf = (o: THREE.Vector3, q: THREE.Quaternion) => o.clone().add(V(NOTES.w / 2, 0, 0).applyQuaternion(q));
/** where his hands rest: left on the sheaf, right on the spread sheets; the sheaf's top (the right hand deals from it) */
const REST_L = deskPoint(SHEAF.dx + 0.03, SHEAF.dz - 0.07, NOTES.h + 0.024);
const REST_R = deskPoint(SPREAD.dx - 0.01, SPREAD.dz - 0.07, 0.03);
const SHEAF_TOP_R = deskPoint(SHEAF.dx - 0.06, SHEAF.dz - 0.04, NOTES.h + 0.026);
/** a hand lifted clear of the desk's near edge (left / right), on its way onto the desk or off it */
const sideL = (facing: number) => rel(N_B, facing, 0.42, 0.86, 0.06);
const liftL = (facing: number) => rel(N_B, facing, 0.4, 1.02, 0.36);
const liftR = (facing: number) => rel(N_B, facing, -0.3, 0.98, 0.3);
/** the tuck's way off the desk: down onto the desk's near half, still flat, then back over the book lip toward him */
const TUCK_OVER = deskPoint(SHEAF.dx + 0.02, SHEAF.dz - 0.02, NOTES.h / 2 + 0.03);
const tuckL = (facing: number) => rel(N_B, facing, 0.36, 0.98, 0.2);
/** the lecture gesture: his right hand up in front of his chest, beating gently (from 我 to clap 1) */
const lectureHand = (f: number, facing: number) => rel(N_B, facing, -0.36 - 0.04 * Math.sin((f / FPS) * 2.3), 1.16 + 0.05 * Math.sin((f / FPS) * 5.2), 0.22);
/** FLICK 3/4 (two fingers low, without looking): his right hand just over the desk's near edge, out to his right, so it
 *  shows over the lectern from the back of the hall */
const flickHand = (facing: number) => rel(N_B, facing, -0.27, 1.07, 0.2);

type Notes = { mode: "arm"; tilt?: number } | { mode: "desk"; o: THREE.Vector3; q: THREE.Quaternion } | { mode: "hand"; q: THREE.Quaternion };
type Desk = { hands: [THREE.Vector3 | null, THREE.Vector3 | null]; notes: Notes; spread: number; moving: THREE.Vector3 | null; sweep: THREE.Vector3 | null };
/** his hands and the paper at the lectern on frame f (from his arrival on) */
const deskAt = (f: number, facing: number): Desk => {
  const arm = underArm(N_B, facing);
  const deskNotes: Notes = { mode: "desk", o: SHEAF_AT.clone(), q: SHEAF_Q.clone() };
  if (f < C1) {
    // laying out: the sheaf from under his arm onto the desk, up from his side first (clear of the desk's near edge),
    // turning flat, then forward and down
    if (f < T_PUT1) {
      const q = arm.rot.clone().slerp(SHEAF_Q, smooth(clamp01((f - T_PUT0 - 6) / (T_PUT1 - T_PUT0 - 7))));
      const g = path(f, [[T_PUT0, arm.hand], [T_PUT0 + 4, sideL(facing)], [T_PUT0 + 7, liftL(facing)], [T_PUT1, gripOf(SHEAF_AT, SHEAF_Q)]]);
      return { hands: [null, g], notes: { mode: "hand", q }, spread: 0, moving: null, sweep: null };
    }
    const spread = DEAL.filter((s) => f >= s).length;
    // the right hand deals: to the sheaf's top, out to the spread with a sheet, back
    const rk: PathKey[] = [[T_PUT1 - 4, hang(N_B, facing, 0)], [T_PUT1 + 1, liftR(facing)], [DEAL[0] - 5, SHEAF_TOP_R]];
    for (let i = 0; i < DEAL.length; i++) { rk.push([DEAL[i], REST_R.clone().add(V(0, 0.0045 * i, 0))]); if (i + 1 < DEAL.length) rk.push([DEAL[i + 1] - 5, SHEAF_TOP_R]); }
    const carrying = DEAL.some((s) => f > s - 5 && f < s);
    let right = path(f, rk);
    const left = f < T_PUT1 + 5 ? gripOf(SHEAF_AT, SHEAF_Q).lerp(REST_L, smooth((f - T_PUT1) / 5)) : REST_L.clone();
    // the lecture (from 我): the right hand leaves the sheets and beats
    if (f >= T_ME) right = REST_R.clone().lerp(lectureHand(f, facing), smooth((f - T_ME) / 9));
    const life = V(0.004 * Math.sin(f * 0.07), 0.003 * Math.sin(f * 0.05 + 1), 0);
    return { hands: [right.add(f > DEAL[2] + 6 && f < T_ME ? life : V()), left.add(life.clone().multiplyScalar(0.7))], notes: deskNotes, spread, moving: carrying ? right.clone().add(V(0, -0.012, 0)) : null, sweep: null };
  }
  // THE GATHER (clap 1 cut the lecture off): the right hand comes down from the beat to the spread sheets (8 frames)
  const sweepFrom = SPREAD_AT.clone().add(V(-0.02, 0.03, -0.06));
  if (f < G_SWEEP0) {
    const right = lectureHand(C1, facing).lerp(sweepFrom, smooth((f - C1) / (G_SWEEP0 - C1)));
    return { hands: [right, REST_L.clone()], notes: deskNotes, spread: 3, moving: null, sweep: null };
  }
  // the sheets swept onto the sheaf
  if (f < G_SWEEP1) {
    const k = smooth(clamp01((f - G_SWEEP0) / (G_SWEEP1 - G_SWEEP0)));
    const sw = SPREAD_AT.clone().lerp(deskPoint(SHEAF.dx, SHEAF.dz, NOTES.h + 0.004), k).add(V(0, 0.03 * Math.sin(Math.PI * k), 0));
    return { hands: [sw.clone().add(V(-0.02, 0.03, -0.06)), REST_L.clone()], notes: deskNotes, spread: 0, moving: null, sweep: sw };
  }
  // both hands on its edges, lift it, tap it on the desk twice
  if (f < G_TUCK0) {
    const lift = 0.08 * smooth(clamp01((f - G_SWEEP1) / (G_LIFT - G_SWEEP1)));
    let tap = 0; for (const t of G_TAPS) { const d = f - t; if (d >= -2 && d <= 2) tap = Math.max(tap, 1 - Math.abs(d) / 2); }
    const o = SHEAF_AT.clone().add(V(0, lift * (1 - tap), 0));
    const edgeR = o.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(SHEAF_Q));
    const toEdges = smooth(clamp01((f - G_SWEEP1) / 4));
    const up = V(0, 0.02, 0);
    return { hands: [REST_R.clone().lerp(edgeR.add(up), toEdges), REST_L.clone().lerp(gripOf(o, SHEAF_Q).add(up), toEdges)], notes: { mode: "desk", o, q: SHEAF_Q.clone() }, spread: 0, moving: null, sweep: null };
  }
  // tucked under his left arm (down onto the desk's near half and back over the lip, still flat, on edge only as it drops
  // at his side); the right hand lifts off the sheaf and comes up for FLICK 3/4 on "Don't.", holds, and goes down
  const o0 = SHEAF_AT.clone().add(V(0, 0.08, 0));
  const q = SHEAF_Q.clone().slerp(arm.rot, smooth(clamp01((f - G_TUCK0 - 5) / 4)));
  const g = path(f, [[G_TUCK0, gripOf(o0, SHEAF_Q)], [G_TUCK0 + 3, gripOf(TUCK_OVER, SHEAF_Q)], [G_TUCK0 + 5, tuckL(facing)], [G_TUCK0 + 8, sideL(facing).add(V(0, -0.1, 0))], [G_TUCK1, arm.hand]]);
  const fl = f >= T_FL && f < T_FL + 7 ? Math.sin((Math.PI * (f - T_FL)) / 7) : 0;
  const flick = flickHand(facing).add(rel(V(), facing, -0.1 * fl, 0.04 * fl, 0.05 * fl));
  const rr = path(f, [[G_TUCK0, o0.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(SHEAF_Q))], [G_TUCK0 + 4, rel(N_B, facing, -0.3, 1.0, 0.17)], [T_FL - 1, flickHand(facing)], [T_FL + 9, flickHand(facing)], [T_FL + 17, hang(N_B, facing, 0)]]);
  return { hands: [fl > 0 ? flick : rr, g], notes: f < G_TUCK1 ? { mode: "hand", q } : { mode: "arm" }, spread: 0, moving: null, sweep: null };
};

// ---------------------------------------------------------------------------------------------------- NEWTON
type Expr = "focus" | "deadpan";
type NState = { at: THREE.Vector3; facing: number; turn?: number; pose: RigPose; desk: Desk; expr: Expr; gaze: number; lookDown: number; blink?: number; head?: RigHead };
/** walking away from her (more than ~80 deg off the lens) he shows his BACK: 0..1 for RigState.turn */
const awayK = (p: THREE.Vector3, facing: number, lens: THREE.Vector3) => {
  const off = Math.abs(Math.atan2(Math.sin(facing - Math.atan2(lens.x - p.x, lens.z - p.z)), Math.cos(facing - Math.atan2(lens.x - p.x, lens.z - p.z))));
  return smooth(clamp01((off - 1.4) / 0.5));
};
/** his expression: focus on the street and with the paper, the flat deadpan in the hall and for his lines (each change
 *  under a blink: the clap blinks carry the last two) */
const EXPR: [number, Expr][] = [[S.from, "focus"], [T_CUT, "deadpan"], [T_PUT0, "focus"], [DEAL[2] + 4, "deadpan"], [C1 + 1, "focus"], [C2 + 1, "deadpan"]];
/** the notes under his arm (segD_parts underArm: o.out / y / fwd move the hand, o.tilt leans the sheaf's top out) */
const armNotes = (p: THREE.Vector3, facing: number, o: { out?: number; y?: number; fwd?: number; tilt?: number } = {}): Desk => ({ hands: [null, underArm(p, facing, o).hand], notes: { mode: "arm", tilt: o.tilt ?? ARM_TILT }, spread: 0, moving: null, sweep: null });
/** the sheaf's top out from his side as he walks, 0.25 rad (clear of his upper arm: the clearance tool found the arm
 *  1.1-1.3 cm into an upright sheaf, still 1.2 cm at 0.1 rad) */
const ARM_TILT = 0.25;
/** the double blink after the stop (lid 0..1 over 5 frames each) */
const dblBlink = (f: number) => { for (const b of T_BLINK) { const d = f - b; if (d >= 0 && d < 5) return [0.5, 1, 1, 0.6, 0.2][d]; } return 0; };
/** the hurried stride back leans him forward and swings the gown: the hand on the sheaf rides higher and further
 *  forward (in his reach) */
const BACK_ARM = { out: 0.28, y: 0.64, fwd: 0.08 };
const streetState = (f: number): NState => {
  const t = f / FPS;
  if (f <= STEP_B) {
    const g = stAlong(stepDist(f, S.from, STEP_PER, ST_S));
    return { at: g.at, facing: g.facing, pose: stepPose(f, STEP_A, STEP_PER, ST_S), desk: armNotes(g.at, g.facing), expr: "focus", gaze: 0, lookDown: 0 };
  }
  if (f < T_SETTLE) {
    const s = stopPose(f, STEP_B, T_SETTLE - STEP_B, ST_S), g = stAlong(D_STEP_B + s.drift);
    return { at: g.at, facing: g.facing, pose: s.pose, desk: armNotes(g.at, g.facing), expr: "focus", gaze: 0, lookDown: 0 };
  }
  if (f < T_BACK0) {
    // STOP 3/5: the idle clock frozen through the 12 frames (sway 0), then on from where it stopped
    const ti = f < T_FREEZE1 ? T_SETTLE / FPS : (f - (T_FREEZE1 - T_SETTLE)) / FPS;
    const turn = smooth(clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0)));
    const facing = ST_STOP_FACE + Math.PI * turn;
    const frozen = f >= T_FREEZE0 && f < T_TURN0;
    const lookDown = ky(f, [[T_FREEZE0 - 2, 0], [T_FREEZE0, -3], [T_TURN0, -3], [T_TURN1, 22]]);
    return { at: ST_STOP.clone(), facing, pose: { kind: "idle", t: ti }, desk: armNotes(ST_STOP, facing), expr: "focus", gaze: frozen ? -0.5 : 0, lookDown, blink: f >= T_FREEZE0 && f < T_BLINK[0] ? 0 : f < T_TURN0 ? dblBlink(f) : undefined };
  }
  // the hurried stride back (-z, screen right): his foot lands on BEAT stepBack
  const facing = ST_STOP_FACE + Math.PI * smooth(clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0)));
  const p = ST_STOP.clone().add(V(0, 0, -backDist(f)));
  return { at: p, facing, pose: stepPose(f, T_BACK, BACK_PER, BACK_S, smooth(clamp01((f - T_BACK0) / 4))), desk: armNotes(p, facing, BACK_ARM), expr: "focus", gaze: 0, lookDown: ky(f, [[T_TURN1, 22], [T_BACK + 4, 14]]) };
};
const newtonState = (f: number): NState => {
  if (f < T_CUT) return streetState(f);
  const expr = at(f, EXPR);
  if (f < T_ARRIVE) {
    const g = walkAlong(HALL_PATH, H_SPEED, (f - T_SETOFF) / FPS);
    return { at: g.at, facing: g.facing, pose: g.pose, turn: awayK(g.at, g.facing, HALL), desk: armNotes(g.at, g.facing), expr, gaze: 0, lookDown: 0 };
  }
  // at the lectern: he turns to the benches and lays out his notes; looks out over the empty rows (D02); eyes on his
  // notes (D03); over the rows again for "students" (D04, the nod); dead still through 他没笑; on 我 he lectures to
  // nobody (mouth only after her line); clap 1 cuts him off: down to the paper, the gather; "Don't." without looking up
  let facing = lerpA(LAST_YAW, 0, smooth((f - T_ARRIVE) / 10)), gaze = 0;
  const out = ky(f, [[DEAL[2] + 2, 0], [DEAL[2] + 10, 1], [L2.to, 1], [L2.to + 8, 0]]);
  const sweep = Math.sin(((f - DEAL[2]) / FPS) * 1.6);
  facing += out * 0.28 * sweep;
  if (out > 0.5) gaze = sweep > 0.35 ? 0.5 : sweep < -0.35 ? -0.5 : 0;
  if (f >= T_ME) {
    const lec = smooth((f - T_ME) / 10) * (1 - smooth((f - C1) / 8)), sw = Math.sin(((f - T_ME) / FPS) * 1.3 + 0.6);
    facing += lec * (-0.05 + 0.22 * sw) + smooth((f - C1) / 8) * 0.05;
    if (lec > 0.5) gaze = sw > 0.3 ? 0.5 : sw < -0.3 ? -0.5 : 0;
  }
  const lookDown = ky(f, [[T_PUT0, 0], [T_PUT0 + 6, 30], [DEAL[2] + 2, 30], [DEAL[2] + 10, 4], [L3.from, 4], [L3.from + 8, 26], [L4.from, 26], [L4.from + 8, 5], [T_ME, 5], [T_ME + 8, 0], [C1, 0], [C1 + 8, 28], [T_FL, 28], [T_FL + 4, 24]]);
  // dead still on the extreme close (his face IS the joke): no blink from the push's landing to 我
  const still = f >= T_M4_1 - 6 && f < T_ME;
  return { at: N_B.clone(), facing, pose: { kind: "idle", t: f / FPS + 2.3 }, desk: deskAt(f, facing), expr, gaze, lookDown, blink: still ? 0 : undefined };
};

// ---------------------------------------------------------------------------------------------------- the shot
/** the lecture's silent mouth (no words: the music and the muffled echo are the lecture), from her line's end until
 *  clap 1 cuts him off */
const LECTURE = { from: (L5.to + 1) / FPS, to: (C1 - 1) / FPS, syl: Math.max(2, Math.round(((C1 - L5.to) / FPS) * 5.5)) };
/** a head move scaled (N rest: head with words 0.3) */
const scaleHead = (h: RigHead | undefined, k: number): RigHead | undefined => h && { dx: (h.dx ?? 0) * k, dy: (h.dy ?? 0) * k, tilt: (h.tilt ?? 0) * k, scale: 1 + ((h.scale ?? 1) - 1) * k, squash: (h.squash ?? 0) * k };

const pose = (w: World, f: number): Pose => {
  const t = f / FPS, inHall = f >= T_CUT;
  w.setPlace(inHall ? "schools" : "street");
  if (inHall) w.set.param("dust", 1);

  // HER EYES: the street hold, whip ⑥ (out over the street, in over the hall), the hall's one position
  const W = C.whip(camStreet(f), f, T_WHIP, { dir: 1, out: T_CUT - T_WHIP, in: WHIP_IN, to: inHall ? camHall(f) : undefined });
  const cam = W.cam;
  w.setCamera(cam);

  // NEWTON
  const ns = newtonState(f), n: Rig = w.actor(NEWTON_GOWN);
  const q = saying("nt", f), sp = q ? speak(q, f, 1) : f > L5.to && f < C1 ? rigSpeak(t, LECTURE, 1) : {};
  // "Don't." [flat]: the rounded o through its middle (the teeth-together strip reads as a grimace at phone size)
  if (q && q.id === "D06" && (sp.mouth === "strip" || (sp.mouth === "small" && f >= q.from + 2 && f <= q.to - 6))) sp.mouth = "round";
  n.set({
    at: ns.at, facing: ns.facing, pose: ns.pose, expr: ns.expr, ...sp,
    blink: ns.blink ?? lid(t, 1, swaps(EXPR)),
    head: heads(scaleHead(sp.head, 0.3), accent("nod", f, T_NOD, { amp: NOD_AMP }), accent("jolt", f, C1, { amp: 0.3 }), accent("jolt", f, C2, { amp: 0.4 })),
    turn: ns.turn, gaze: ns.gaze, lookDown: ns.lookDown, hands: ns.desk.hands, hide: NEWTON_HIDE, visible: true,
  });

  // the paper on the desk (before update: it is not in anyone's hand)
  const d = ns.desk;
  if (d.notes.mode === "desk") w.prop("notes").put(d.notes.o, { rot: d.notes.q });
  if (d.spread > 0) w.prop("sheets").put(SPREAD_AT, { rot: SPREAD_Q, n: d.spread });
  if (d.moving) w.prop("sheets", "dealt").put(d.moving, { rot: SPREAD_Q, n: 1 });
  if (d.sweep) w.prop("sheets").put(d.sweep, { rot: SPREAD_Q, n: 3 });

  w.update();
  // the notes in his hand / under his arm (at the rig's real hand)
  if (d.notes.mode !== "desk") w.prop("notes").put(n.handWorld(1), { grip: "grip", rot: d.notes.mode === "arm" ? underArm(ns.at, ns.facing, { tilt: d.notes.tilt }).rot : d.notes.q });

  // THE LENS: the whip's blur; in the hall a light focus on him that comes in with the zoom (none in the wide)
  const lens = C.camAxes(cam).p;
  const zk = inHall ? zoomK(cam.fov) : 0;
  const post = W.post ?? (zk > 0.02 ? { dof: { focus: lens.distanceTo(n.headWorld().add(V(0, -0.1, 0))), amount: 2 * zk } } : undefined);
  return { camera: cam, post, overlays: W.smear > 0 ? C.whipSmear(W.smear, 1) : undefined, slate: !inHall ? (f < T_WHIP ? "D street" : "D whip out") : f < T_CUT + WHIP_IN ? "D whip in" : "D hall" };
};

export const SEG: Segment = { id: "D", from: S.from, to: S.to, enter() {}, exit() {}, pose };
