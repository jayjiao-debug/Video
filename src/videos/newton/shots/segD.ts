// SEGMENT D · 下午 · the street to the Schools, the empty benches, the lone clap (PLAN 7 D; script scene 4, lines 23-28
// = D01-D06). WP5-D. Her eyes at 1.6 m; the camera moves because HE moves (or she does: the trot, her steps in).
//   D1  THE STREET (trot): out of the college gate (its turreted arch behind him), his gown on, the lecture notes under
//       his arm, ink on his nose; she trots beside him, close, a little ahead on his left; her free hand darts in with
//       a handkerchief and wipes the ink off his nose in TWO strokes (on the mix's two swishes); the ink figure swaps
//       under the cloth on each stroke (ink -> smudge -> clean). He walks on, eyes ahead: he has not noticed.
//   D2  THE TALL DOOR / THE WIDE (the cut on the hall's room tone and the door's creak): she steps in from the door
//       (two steps, the echo) and HOLDS one wide on the empty benches, the sunbeam with its dust, one man walking up the
//       aisle to the lectern (his back to us), nobody else.
//   D3  ASIDE 23 「一个学生都没有。」: the mic swings in and round to the lens, the hall soft behind it; he goes round the
//       lectern, turns to the empty benches and sets his notes down (the paper).
//   D4  THE WHIP back to him (the cut hides in it): close at the lectern. 24 he spreads the sheets as if the hall were
//       full and looks out over the empty rows; 25 (her) he looks at her; 26 deadpan, a small nod; ASIDE 27 the mic to
//       the lens, behind it his face unchanged; on 我笑了 he turns back to the benches and lectures on (his mouth moves
//       only once her line is over: no words, the music is the muffled lecture); she lowers the mic to listen.
//   D5  THE TIME CUT (on the gathering paper): she has sat down on the front bench; he sweeps the sheets together, taps
//       the sheaf square and tucks it under his arm; she claps alone, twice, her open hand on her own mic hand (the
//       mix's two claps); at the second he looks up at her; 28 "Don't." flat; the mic held toward him.
// Every frame is a pure function of f; every time comes from line() / capWord() / BEAT / the mix's anchors
// (/home/user/newton_work/film/sound/SYNC_POINTS.md). Where BEAT.D (lecture, timeCut, clap) and the mix disagree, the
// mix wins (it is built): the gathering paper at D05 end + 0.05 s, the claps at D06 - 1.3 s and - 0.75 s.
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN, NEWTON_HIDE, newtonAt, type NewtonState } from "../people";
import { STREET, SCX, SCHOOLS, SCHOOLS_SET, SCHOOLS_CAMS, EYE, FOV } from "../layout";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, lerpA, rel, hang, path, rigSpeak, type Rig, type PathKey } from "./common";
import { frameOn, deskPoint, deskRot, underArm, clapOnFist, NOTES } from "./segD_parts";
import type { World } from "../world";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const S = SEGMENTS[3];
const sec = (s: number) => Math.round(s * FPS);
const L1 = line("D01"), L2 = line("D02"), L4 = line("D04"), L5 = line("D05"), L6 = line("D06");

// ---------------------------------------------------------------------------------------------------- the mix
/** sfx_wipe: two swishes (the clip's first ~0.2 s and, louder, ~0.43-0.65 s) */
const SND_WIPE = L1.from - sec(2.4);
/** sfx_paper: he lays out his notes (its rustles peak ~0.27 s and ~0.9-1.0 s in) */
const SND_LAY = L1.to - sec(0.3);
/** sfx_paper: the time cut, he gathers his notes */
const SND_GATHER = L5.to + sec(0.05);
/** her two lone claps */
const CLAP1 = L6.from - sec(1.3), CLAP2 = L6.from - sec(0.75);
/** where her mic fist goes for the claps (px): lower middle, so her clapping right arm stays short in the frame */
const CLAP_FIST: [number, number] = [430, 1560];

// ---------------------------------------------------------------------------------------------------- the beats
/** the cut through the tall door (the hall's room tone starts here in the mix) */
const T_HALL = BEAT.D.schools;
/** ASIDE 23: the mic swings in and round to the lens (8 frames before her line) */
const T_A23 = L1.from - 8;
/** THE WHIP back to him: 4 frames out, 4 in, settled one frame before "The walls..." */
const T_WHIP = L2.from - 9;
/** ASIDE 27: the swing to the lens as his "students." ends */
const T_A27 = L4.to - 2;
/** 我笑了: he turns back to the benches and lectures on */
const T_ME = capWord("D05", "我").from;
/** she lowers the mic to listen to the lecture */
const T_LOWER = L5.to - 3;
/** THE TIME CUT, just ahead of the gathering paper's first rustle */
const T_TC = SND_GATHER + 6;

// ---------------------------------------------------------------------------------------------------- D1 the street
const N_EYE = 1.14;
const ST_SPEED = 1.45, ST_T0 = 0.45;
/** his walk: from just past the turn out of the gate, straight down the street toward +z */
const ST_PATH = [V(STREET.lineX, 0, STREET.turn.z + 0.2), V(STREET.lineX, 0, STREET.walkTo.z)];
const streetLeg = (f: number) => walkAlong(ST_PATH, ST_SPEED, (f - S.from) / FPS + ST_T0);
/** THE WIPE, timed to the mix: her hand comes in over W_IN frames (the cloth touches his nose on the first swish),
 *  two strokes of W_ST frames, out over W_OUT (gone before the cut). cam.ts wipe() is driven on a warped frame so its
 *  7-frame strokes take W_ST. */
const W_IN = 6, W_ST = 8, W_OUT = 5;
const WIPE_ON = SND_WIPE - W_IN;
const STROKE1 = WIPE_ON + W_IN + W_ST / 2, STROKE2 = STROKE1 + W_ST;
const wipeFrame = (f: number): number | null => {
  const d = f - WIPE_ON, Wp = C.WIPE;
  if (d < 0) return null;
  if (d < W_IN) return WIPE_ON + (d * Wp.inF) / W_IN;
  const e = d - W_IN;
  if (e < 2 * W_ST) return WIPE_ON + Wp.inF + (e * Wp.stroke) / W_ST;
  const o = e - 2 * W_ST;
  // (out: wipe()'s ease-in turned into an ease-out, so the hand leaves at once and his clean nose shows before the cut)
  return o <= W_OUT ? WIPE_ON + Wp.inF + 2 * Wp.stroke + Math.cbrt(easeOutCubic(o / W_OUT)) * Wp.outF : null;
};
/** the ink: on until her first stroke, the ghost after it, clean after the second (each swap under the cloth) */
const KEYS: [number, NewtonState][] = [[S.from, "gownInk"], [Math.round(STROKE1), "gownSmudge"], [Math.round(STROKE2), "gown"]];
/** the handkerchief's long corner swung round toward her wrist (hanging straight down it read as a white beard) */
const CLOTH_TWIST = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), 0.6), CLOTH_SCALE = 1.2;
/** her eyes: trotting beside him on his LEFT (east), a little ahead, looking back at him; she closes in for the wipe */
const camStreet = (f: number): CamPose => {
  const g = streetLeg(f), k = ky(f, [[S.from, 1.3], [WIPE_ON - 1, 1.0]]);
  const pos = g.at.clone().add(V(0.6 * k, EYE, 0.86 * k));
  return C.handheld(frameOn(pos, g.at.clone().add(V(0, N_EYE, 0)), 560, 590), f, { walk: 1.5 });
};

// ---------------------------------------------------------------------------------------------------- D2-D3 the hall
const LZ = SCHOOLS_SET.lectern.z, WZ1 = SCHOOLS_SET.walls.z1;
const N_AT = SCHOOLS.newton.clone();
/** up the aisle (through the sunbeam's patch), round the lectern's right end, in behind it */
const HALL_PATH = [V(SCX + 0.05, 0, -1.6), V(SCX + 0.05, 0, LZ + 1.15), V(SCX + 0.88, 0, LZ + 0.55), V(SCX + 0.88, 0, LZ - 0.52), N_AT.clone()];
const H_SPEED = 1.4;
/** he arrives behind the lectern a little before the paper (laying out) */
const T_ARRIVE = SND_LAY - 6;
const T_SETOFF = T_ARRIVE - Math.round(walkTime(HALL_PATH, H_SPEED) * FPS);
const LAST_YAW = Math.atan2(HALL_PATH[4].x - HALL_PATH[3].x, HALL_PATH[4].z - HALL_PATH[3].z);
/** her eyes in the hall: a step in from the door to the wide (two steps, the echo), then THE WIDE HOLD */
const CAM_WIDE: CamPose = { pos: SCHOOLS_CAMS.wide.pos, look: SCHOOLS_CAMS.wide.look, fov: SCHOOLS_CAMS.wide.fov };
const CAM_DOOR: CamPose = { pos: [SCX + 0.75, EYE, WZ1 - 0.35], look: SCHOOLS_CAMS.wide.look, fov: FOV };
const camHall = (f: number): CamPose =>
  C.handheld(C.keyCam(f, [{ f: T_HALL, ...CAM_DOOR }, { f: T_HALL + 22, ...CAM_WIDE, ease: easeOutCubic }]), f, { walk: [[T_HALL, 0.6], [T_HALL + 16, 0.6], [T_HALL + 24, 0]] });
/** D4: close at the lectern (about 2.4 m), his eyes in the upper third */
const N_EYES = N_AT.clone().add(V(0, N_EYE, 0));
const LECT_POS = V(SCX + 0.45, EYE, LZ + 1.5);
const CAM_LECT = frameOn(LECT_POS, N_EYES, 520, 600);
/** D5: she sits on the front bench (row 0, by the aisle), her eyes at about 1.22 m */
const SEAT = V(SCX + 0.95, 1.22, SCHOOLS.rows[0] + 0.08);
const CAM_SEAT = frameOn(SEAT, N_EYES, 560, 640);
const FACE_LECT = Math.atan2(LECT_POS.x - N_AT.x, LECT_POS.z - N_AT.z);
const FACE_SEAT = Math.atan2(SEAT.x - N_AT.x, SEAT.z - N_AT.z);

// ---------------------------------------------------------------------------------------------------- the lectern
/** the sheaf's place (his left, screen right) and the spread sheets' (his right, screen left) on the sloped desk */
const SHEAF = { dx: 0.15, dz: 0.02, yaw: 0.1 }, SPREAD = { dx: -0.14, dz: 0.03, yaw: -0.12 };
const qOf = (e: [number, number, number]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2], "YXZ"));
const SHEAF_AT = deskPoint(SHEAF.dx, SHEAF.dz, NOTES.h / 2), SHEAF_Q = qOf(deskRot(SHEAF.yaw));
const SPREAD_AT = deskPoint(SPREAD.dx, SPREAD.dz, 0), SPREAD_Q = qOf(deskRot(SPREAD.yaw));
/** the sheaf's grip edge (its +x edge: the left hand) for an origin and a rotation */
const gripOf = (o: THREE.Vector3, q: THREE.Quaternion) => o.clone().add(V(NOTES.w / 2, 0, 0).applyQuaternion(q));
/** where his hands rest: left on the sheaf, right on the spread sheets */
const REST_L = deskPoint(SHEAF.dx + 0.03, SHEAF.dz - 0.07, NOTES.h + 0.024);
const REST_R = deskPoint(SPREAD.dx - 0.01, SPREAD.dz - 0.07, 0.03);
const SHEAF_TOP_R = deskPoint(SHEAF.dx - 0.06, SHEAF.dz - 0.04, NOTES.h + 0.026);
/** a hand lifted clear of the desk's near edge (left / right), on its way onto the desk or off it */
const sideL = (facing: number) => rel(N_AT, facing, 0.42, 0.86, 0.06);
const liftL = (facing: number) => rel(N_AT, facing, 0.4, 1.02, 0.36);
const liftR = (facing: number) => rel(N_AT, facing, -0.3, 0.98, 0.3);
/** laying out: the sheaf from under his arm onto the desk, then three sheets dealt from it to his right */
const T_PUT0 = T_ARRIVE + 4, T_PUT1 = T_PUT0 + 10;
const DEAL = [T_PUT1 + 6, T_PUT1 + 12, T_PUT1 + 18];
/** gathering (after the time cut): the sheets swept onto the sheaf, the sheaf lifted, tapped square twice, tucked */
const G_SWEEP0 = T_TC + 2, G_SWEEP1 = T_TC + 11, G_LIFT = T_TC + 15, G_TAPS = [T_TC + 20, T_TC + 24], G_TUCK0 = T_TC + 27, G_TUCK1 = T_TC + 37;
/** at her second clap he looks up at her */
const T_LOOK = CLAP2 + 2;

type Desk = { hands: [THREE.Vector3 | null, THREE.Vector3 | null]; notes: { mode: "arm" } | { mode: "desk"; o: THREE.Vector3; q: THREE.Quaternion } | { mode: "hand"; q: THREE.Quaternion }; spread: number; moving: THREE.Vector3 | null; sweep: THREE.Vector3 | null };
/** the lecture gesture: his right hand up in front of his chest, beating gently (from 我笑了 to the time cut) */
const lectureHand = (f: number, facing: number) => rel(N_AT, facing, -0.36 - 0.04 * Math.sin((f / FPS) * 2.3), 1.16 + 0.05 * Math.sin((f / FPS) * 5.2), 0.22);
/** his hands and the paper at the lectern on frame f (from his arrival on) */
const deskAt = (f: number, facing: number): Desk => {
  const arm = underArm(N_AT, facing);
  if (f < T_TC) {
    // laying out
    if (f < T_PUT0) return { hands: [null, arm.hand], notes: { mode: "arm" }, spread: 0, moving: null, sweep: null };
    if (f < T_PUT1) {
      // up from his side first (clear of the desk's near edge), turning flat, then forward and down onto the desk
      // (out to his side and up on edge, over the desk's near edge, then laid flat: never past his big head)
      const q = arm.rot.clone().slerp(SHEAF_Q, smooth(clamp01((f - T_PUT0 - 6) / (T_PUT1 - T_PUT0 - 7))));
      const g = path(f, [[T_PUT0, arm.hand], [T_PUT0 + 4, sideL(facing)], [T_PUT0 + 7, liftL(facing)], [T_PUT1, gripOf(SHEAF_AT, SHEAF_Q)]]);
      return { hands: [null, g], notes: { mode: "hand", q }, spread: 0, moving: null, sweep: null };
    }
    const spread = DEAL.filter((s) => f >= s).length;
    // the right hand deals: to the sheaf's top, out to the spread with a sheet, back
    const rk: PathKey[] = [[T_PUT1 - 4, hang(N_AT, facing, 0)], [T_PUT1 + 1, liftR(facing)], [DEAL[0] - 5, SHEAF_TOP_R]];
    for (let i = 0; i < DEAL.length; i++) { rk.push([DEAL[i], REST_R.clone().add(V(0, 0.0045 * i, 0))]); if (i + 1 < DEAL.length) rk.push([DEAL[i + 1] - 5, SHEAF_TOP_R]); }
    const carrying = DEAL.some((s) => f > s - 5 && f < s);
    let right = path(f, rk);
    const left = f < T_PUT1 + 5 ? gripOf(SHEAF_AT, SHEAF_Q).lerp(REST_L, smooth((f - T_PUT1) / 5)) : REST_L.clone();
    // the lecture (from 我笑了): the right hand leaves the sheets and gestures
    if (f >= T_ME) right = REST_R.clone().lerp(lectureHand(f, facing), smooth((f - T_ME) / 9));
    const life = V(0.004 * Math.sin(f * 0.07), 0.003 * Math.sin(f * 0.05 + 1), 0);
    return { hands: [right.add(f > DEAL[2] + 6 && f < T_ME ? life : V()), left.add(life.clone().multiplyScalar(0.7))], notes: { mode: "desk", o: SHEAF_AT.clone(), q: SHEAF_Q.clone() }, spread, moving: carrying ? right.clone().add(V(0, -0.012, 0)) : null, sweep: null };
  }
  // gathering
  if (f < G_SWEEP1) {
    const k = smooth(clamp01((f - G_SWEEP0) / (G_SWEEP1 - G_SWEEP0)));
    const sw = SPREAD_AT.clone().lerp(deskPoint(SHEAF.dx, SHEAF.dz, NOTES.h + 0.004), k).add(V(0, 0.012 * Math.sin(Math.PI * k), 0));
    return { hands: [sw.clone().add(V(-0.02, 0.03, -0.06)), REST_L.clone()], notes: { mode: "desk", o: SHEAF_AT.clone(), q: SHEAF_Q.clone() }, spread: 0, moving: null, sweep: sw };
  }
  if (f < G_TUCK0) {
    // both hands on its edges, lift it, tap it on the desk twice
    // (a small lift: from her low seat the sheaf only peeks over the desk lip, below his chin)
    const lift = 0.035 * smooth(clamp01((f - G_SWEEP1) / (G_LIFT - G_SWEEP1)));
    let tap = 0; for (const t of G_TAPS) { const d = f - t; if (d >= -2 && d <= 2) tap = Math.max(tap, 1 - Math.abs(d) / 2); }
    const o = SHEAF_AT.clone().add(V(0, lift * (1 - tap), 0));
    const q = SHEAF_Q.clone();
    const edgeR = o.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(q));
    const toEdges = smooth(clamp01((f - G_SWEEP1) / 4));
    return { hands: [REST_R.clone().lerp(edgeR, toEdges), REST_L.clone().lerp(gripOf(o, q), toEdges)], notes: { mode: "desk", o, q }, spread: 0, moving: null, sweep: null };
  }
  // tucked under his left arm; the right hand goes back to his side
  // up off the desk first (still flat), then turning on edge down to his side; the right hand up, back and down
  const o0 = SHEAF_AT.clone().add(V(0, 0.08, 0));
  const q = SHEAF_Q.clone().slerp(arm.rot, smooth(clamp01((f - G_TUCK0 - 1) / 4)));
  const g = path(f, [[G_TUCK0, gripOf(o0, SHEAF_Q)], [G_TUCK0 + 4, liftL(facing)], [G_TUCK0 + 7, sideL(facing)], [G_TUCK1, arm.hand]]);
  const rr = f < G_TUCK0 + 9 ? path(f, [[G_TUCK0, o0.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(SHEAF_Q))], [G_TUCK0 + 4, liftR(facing)], [G_TUCK0 + 9, hang(N_AT, facing, 0)]]) : null;
  return { hands: [rr, g], notes: f < G_TUCK1 ? { mode: "hand", q } : { mode: "arm" }, spread: 0, moving: null, sweep: null };
};

// ---------------------------------------------------------------------------------------------------- NEWTON
type NState = { who: ReturnType<typeof newtonAt>; at: THREE.Vector3; facing: number; turn?: number; pose: { kind: "idle"; t: number } | ReturnType<typeof walkAlong>["pose"]; desk: Desk | null; expr: "focus" | "deadpan"; gaze: number; lookDown: number };
/** walking away from her (more than ~80 deg off the lens) he shows his BACK (the rig would turn him to the lens up to
 *  115 deg): 0..1 for RigState.turn */
const awayK = (p: THREE.Vector3, facing: number, cam: CamPose) => {
  const c = C.camAxes(cam).p, off = Math.abs(Math.atan2(Math.sin(facing - Math.atan2(c.x - p.x, c.z - p.z)), Math.cos(facing - Math.atan2(c.x - p.x, c.z - p.z))));
  return smooth(clamp01((off - 1.4) / 0.5));
};
/** his expression: focus while he walks and handles paper, the flat deadpan when he faces her or the hall */
const EXPR: [number, "focus" | "deadpan"][] = [[S.from, "focus"], [T_HALL, "deadpan"], [T_PUT0, "focus"], [DEAL[2] + 4, "deadpan"], [T_TC, "focus"], [T_LOOK, "deadpan"]];
const newtonState = (f: number): NState => {
  const t = f / FPS, expr = at(f, EXPR);
  if (f < T_HALL) {
    const g = streetLeg(f);
    return { who: newtonAt(f, KEYS), at: g.at, facing: g.facing, pose: g.pose, desk: { hands: [null, underArm(g.at, g.facing).hand], notes: { mode: "arm" }, spread: 0, moving: null, sweep: null }, expr, gaze: -0.5, lookDown: 0 };
  }
  if (f < T_ARRIVE) {
    const g = walkAlong(HALL_PATH, H_SPEED, (f - T_SETOFF) / FPS);
    return { who: NEWTON_GOWN, at: g.at, facing: g.facing, pose: g.pose, turn: awayK(g.at, g.facing, camHall(f)), desk: { hands: [null, underArm(g.at, g.facing).hand], notes: { mode: "arm" }, spread: 0, moving: null, sweep: null }, expr, gaze: 0, lookDown: 0 };
  }
  // at the lectern: he turns to the benches; looks out over them (24), at her (25, 26, the aside), back to the benches
  // to lecture (我笑了); after the time cut, down at his notes, up at her on the second clap
  let facing: number, gaze = 0, lookDown = 0;
  if (f < T_TC) {
    facing = lerpA(LAST_YAW, 0, smooth((f - T_ARRIVE) / 10));
    const out = ky(f, [[DEAL[2] + 2, 0], [DEAL[2] + 10, 1], [L2.to, 1], [L2.to + 8, 0]]);
    const sweep = Math.sin(((f - DEAL[2]) / FPS) * 1.6);
    facing += out * 0.28 * sweep + ky(f, [[L2.to, 0], [L2.to + 8, 1], [T_ME, 1], [T_ME + 10, 0]]) * FACE_LECT;
    gaze = out > 0.5 ? (sweep > 0.35 ? 0.5 : sweep < -0.35 ? -0.5 : 0) : 0;
    lookDown = ky(f, [[T_PUT0, 0], [T_PUT0 + 6, 30], [DEAL[2] + 2, 30], [DEAL[2] + 10, 4]]);
    if (f >= T_ME) {
      const lec = smooth((f - T_ME) / 10), sw = Math.sin(((f - T_ME) / FPS) * 1.3 + 0.6);
      facing += lec * (-0.05 + 0.22 * sw);
      gaze = lec > 0.5 ? (sw > 0.3 ? 0.5 : sw < -0.3 ? -0.5 : 0) : 0;
    }
  } else {
    facing = lerpA(0.05, FACE_SEAT, smooth((f - T_LOOK) / 8));
    lookDown = ky(f, [[T_TC, 28], [T_LOOK, 28], [T_LOOK + 6, 0]]);
  }
  return { who: NEWTON_GOWN, at: N_AT.clone(), facing, pose: { kind: "idle", t: t + 2.3 }, desk: deskAt(f, facing), expr, gaze, lookDown };
};

// ---------------------------------------------------------------------------------------------------- the shot
type ShotId = "street" | "hall" | "lectern" | "bench";
const shotOf = (f: number): ShotId => (f < T_HALL ? "street" : f < T_WHIP + 4 ? "hall" : f < T_TC ? "lectern" : "bench");
/** the lecture's silent mouth (no words: the music is the muffled lecture), only once her line is over */
const LECTURE = { from: (L5.to + 1) / FPS, to: (T_TC - 1) / FPS, syl: Math.max(2, Math.round(((T_TC - L5.to) / FPS) * 5.5)) };

const pose = (w: World, f: number): Pose => {
  const t = f / FPS, shot = shotOf(f);
  w.setPlace(shot === "street" ? "street" : "schools");
  if (shot !== "street") w.set.param("dust", 1);

  // HER EYES
  let cam: CamPose, post: Pose["post"] | undefined, overlays: Pose["overlays"] | undefined;
  if (shot === "street") cam = camStreet(f);
  else if (f < T_WHIP + 8) {
    const W = C.whip(camHall(f), f, T_WHIP, { dir: 1, to: CAM_LECT });
    cam = W.cam;
    if (W.smear > 0) { post = W.post; overlays = C.whipSmear(W.smear, 1); }
  } else cam = shot === "lectern" ? CAM_LECT : CAM_SEAT;
  w.setCamera(cam);

  // NEWTON
  const ns = newtonState(f), n: Rig = w.actor(ns.who);
  const q = saying("nt", f), sp = q ? speak(q, f, 1) : f > L5.to && f < T_TC ? rigSpeak(t, LECTURE, 1) : {};
  const nodOn = capWord("D04", "students").from;
  n.set({
    at: ns.at, facing: ns.facing, pose: ns.pose, expr: ns.expr, blink: lid(t, 1, swaps(EXPR)), ...sp,
    head: heads(sp.head, accent("nod", f, nodOn, { amp: 0.5 }), accent("nod", f, L6.from, { amp: 0.35 })),
    turn: ns.turn, gaze: ns.gaze, lookDown: ns.lookDown, hands: ns.desk ? ns.desk.hands : [null, null], hide: NEWTON_HIDE, visible: true,
  });

  // the paper on the desk (before update: it is not in anyone's hand)
  const d = ns.desk;
  if (d && d.notes.mode === "desk") w.prop("notes").put(d.notes.o, { rot: d.notes.q });
  if (d && d.spread > 0) w.prop("sheets").put(SPREAD_AT, { rot: SPREAD_Q, n: d.spread });
  if (d && d.moving) w.prop("sheets", "dealt").put(d.moving, { rot: SPREAD_Q, n: 1 });
  if (d && d.sweep) w.prop("sheets").put(d.sweep, { rot: SPREAD_Q, n: 3 });

  w.update();

  // the notes in his hand / under his arm (at the rig's real hand)
  if (d && d.notes.mode !== "desk") w.prop("notes").put(n.handWorld(1), { grip: "grip", rot: d.notes.mode === "arm" ? underArm(ns.at, ns.facing).rot : d.notes.q });

  // HER HAND: the wipe (the street)
  if (shot === "street") {
    const fw = wipeFrame(f);
    const Wp = fw === null ? null : C.wipe(cam, fw, C.noseOf(n), WIPE_ON);
    if (Wp) {
      // (both 2.5 cm nearer her: the corner swung round to her wrist clears his cheek)
      const toLens = C.camAxes(cam).p.sub(Wp.cloth.at).normalize().multiplyScalar(0.025);
      w.prop("handR").put(Wp.hand.at.clone().add(toLens), { rot: Wp.hand.rot, pose: "grip", scale: Wp.hand.scale });
      w.prop("handkerchief").put(Wp.cloth.at.clone().add(toLens), { rot: Wp.cloth.rot.clone().multiply(CLOTH_TWIST), scale: CLOTH_SCALE });
    }
    return { camera: cam, slate: "D1 street" };
  }

  // HER MIC (and the clapping hand)
  const mouth = n.headWorld().add(V(0, -0.1, 0));
  let lens = 0, enter = 1;
  if (shot === "hall") {
    // out for the wide; in and round to the lens for aside 23; back toward him through the whip
    enter = ky(f, [[T_A23, 0], [T_A23 + 8, 1]]);
    lens = ky(f, [[T_A23, 0], [T_A23 + 8, 1], [T_WHIP, 1], [T_WHIP + 6, 0]]);
  } else if (shot === "lectern") {
    lens = ky(f, [[T_WHIP, 1], [T_WHIP + 6, 0], [T_A27, 0], [T_A27 + 8, 1]]);
    enter = ky(f, [[T_LOWER, 1], [T_LOWER + 9, 0]]);
  } else {
    enter = ky(f, [[T_TC + 1, 0], [T_TC + 10, 1]]);
  }
  let dof: { focus: number; amount: number } | undefined;
  if (enter > 0.001) {
    const M = C.micPose(cam, f, { aim: mouth, lens, enter });
    dof = M.dof;
    let micAt = M.mic.at, handAt = M.hand.at;
    if (shot === "bench") {
      // THE CLAPS: she brings the mic hand down to the lower middle (no subtitle until "Don't.") and claps her open
      // right hand onto it, twice; then the right hand goes and the mic comes back up toward him
      const low = ky(f, [[T_TC + 3, 0], [CLAP1 - 7, 1], [CLAP2 + 7, 1], [CLAP2 + 17, 0]]);
      if (low > 0) {
        const F = C.camFrame(cam), g = C.worldToCam(F, M.hand.at), to = C.fromScreen(F, CLAP_FIST[0], CLAP_FIST[1], g.z);
        const dW = C.camToWorld(F, to.x, to.y, to.z).sub(M.hand.at).multiplyScalar(low);
        micAt = micAt.clone().add(dW); handAt = handAt.clone().add(dW);
      }
      const kIn = ky(f, [[T_TC + 4, 0], [CLAP1 - 5, 1], [CLAP2 + 6, 1], [CLAP2 + 15, 0]]);
      if (kIn > 0.001) { const H = clapOnFist(cam, f, handAt, [CLAP1, CLAP2], kIn); w.prop("handR").put(H.at, { rot: H.rot, pose: "open" }); }
    }
    if (M.visible) { w.prop("mic").put(micAt, { rot: M.mic.rot }); w.prop("hand").put(handAt, { rot: M.hand.rot, pose: "grip" }); }
  }
  // (the mic drops away after aside 27: the focus racks back onto him for the lecture glimpse)
  if (dof && shot === "lectern" && f > T_LOWER) {
    const r = smooth(clamp01((f - T_LOWER) / 6)), dN = C.camAxes(cam).p.distanceTo(mouth);
    dof = { focus: lerp(dof.focus, dN, r), amount: lerp(dof.amount, 0, r) };
  }
  // (on the bench her hands are near the lens: a lighter focus pull than the mic's default, so the claps read)
  if (dof && shot === "bench") dof = { focus: dof.focus, amount: Math.min(dof.amount, 1.2) };
  return { camera: cam, post: post ?? (dof ? { dof } : undefined), overlays, slate: `D ${shot}` };
};

export const SEG: Segment = { id: "D", from: S.from, to: S.to, enter() {}, exit() {}, pose };
