// SEGMENT D · 下午 · the street to the Schools, the empty benches, the lone clap (PLAN 7 D; script scene 4, lines 23-28
// = D01-D06). WP5-D. Her eyes at 1.6 m; the camera moves because HE moves (or she does: the trot, her steps in).
//   D1  THE STREET (trot): out of the college gate (its turreted arch behind him), his gown on, the lecture notes under
//       his arm, ink on his nose; she trots beside him, close, a little ahead on his left; a handkerchief, crumpled in
//       an INVISIBLE hand (Jay, 14 Nov: no hands, no mic, "like the Qin film"), darts in from the lower right and wipes
//       the ink off his nose in TWO strokes (on the mix's two swishes), lifting off between them, his head dragged a
//       little with each; the ink figure swaps under the cloth on each stroke (ink -> smudge -> clean). He walks on,
//       eyes ahead: he has not noticed.
//   D2  THE TALL DOOR / THE WIDE (the cut on the hall's room tone and the door's creak): she steps in from the door
//       (two steps, the echo) and HOLDS one wide on the empty benches, the sunbeam with its dust, one man walking up the
//       aisle to the lectern (his back to us), nobody else.
//   D3  ASIDE 23 「一个学生都没有。」 (the camera's own move): with her line she turns aside to the empty benches beside
//       her, a step toward them, her head tilted, and whispers over them; behind her back he goes round the lectern.
//   D4  THE WHIP back to him (to the left: the swing back from the aside; the cut hides in it): close at the lectern.
//       24 he spreads the sheets as if the hall were full and looks out over the empty rows; 25 (her) he looks at her;
//       26 deadpan, a small nod; ASIDE 27: in the silence after his line she leans in on his unchanged face (他没笑),
//       her eyes shake with a stifled laugh on 笑了; on 我笑了 he turns back to the benches and lectures on (his mouth
//       moves only once her line is over: no words, the music is the muffled lecture); she eases back to listen.
//   D5  THE TIME CUT (on the gathering paper): she has sat down on the front bench; he sweeps the sheets together, taps
//       the sheaf square and tucks it under his arm; she claps alone, twice (the mix's two claps; no hands: her eyes
//       jolt with each clap); at the first his eyes flick up at her and back to his notes, at the second he looks up
//       at her; 28 "Don't." flat.
// Every frame is a pure function of f; every time comes from line() / capWord() / BEAT / the mix's anchors
// (/home/user/newton_work/film/sound/SYNC_POINTS.md). Where BEAT.D (lecture, timeCut, clap) and the mix disagree, the
// mix wins (it is built): the gathering paper at D05 end + 0.05 s, the claps at D06 - 1.3 s and - 0.75 s.
import * as THREE from "three";
import { SEGMENTS, line, capWord, capsOf, FPS, clamp01, smooth, easeOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN, NEWTON_HIDE, newtonAt, type NewtonState } from "../people";
import { STREET, STREET_SET, SCX, SCHOOLS, SCHOOLS_SET, SCHOOLS_CAMS, EYE, FOV } from "../layout";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, lerpA, rel, hang, path, rigSpeak, type Rig, type PathKey } from "./common";
import { frameOn, deskPoint, deskRot, underArm, clapJolt, padPut, padSpeed, NOTES, type PadTimes } from "./segD_parts";
import type { HankyOpts } from "../props/things";
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

// ---------------------------------------------------------------------------------------------------- the beats
/** the cut through the tall door (the hall's room tone starts here in the mix) */
const T_HALL = BEAT.D.schools;
/** ASIDE 23: she turns aside to the benches with her line (A23_LEN frames from just before it) */
const T_A23 = L1.from - 2, A23_LEN = 10;
/** THE WHIP back to him: 4 frames out, 4 in, settled one frame before "The walls..." */
const T_WHIP = L2.from - 9;
/** ASIDE 27: she leans in on his face in the silence after his "students." (landing on her first word 他), the laugh
 *  on 笑了, eased back by her line's end */
const T_A27 = L4.to + 3, T_A27_IN = capWord("D05", "他").from, T_LAUGH = capWord("D05", "笑了").from, T_A27_BACK = L5.to + 2;
/** 我笑了: he turns back to the benches and lectures on */
const T_ME = capWord("D05", "我").from;
/** THE TIME CUT, just ahead of the gathering paper's first rustle */
const T_TC = SND_GATHER + 6;

// ---------------------------------------------------------------------------------------------------- D1 the street
const N_EYE = 1.14;
const ST_SPEED = 1.45, ST_T0 = 0.1;
/** his walk: just out of the gate's arch, down the street toward +z on the college side, close along the gatehouse
 *  front (about 1.1 m off it at the arch, easing out to clear its south turret by about 0.45 m, then on down the
 *  street): she looks across at him with the gatehouse front close behind him, so its arch, brick and stone fill the
 *  top of the frame and the setts only a band at the bottom (the nearer the wall, the less ground between him and it) */
const ST_X0 = STREET.lineX - 0.9, ST_X1 = STREET.lineX - 0.4, ST_Z0 = STREET.turn.z - 0.4;
const ST_PATH = [V(ST_X0, 0, ST_Z0), V(ST_X1, 0, ST_Z0 + 3.0), V(ST_X1, 0, STREET.walkTo.z)];
const streetLeg = (f: number) => walkAlong(ST_PATH, ST_SPEED, (f - S.from) / FPS + ST_T0);
/** THE WIPE, timed to the mix's two swishes (sfx_wipe: clip frames 0-6 and, louder, 13-19): the pad comes in over 6
 *  frames and lands on the first swish, stroke 1 (7 frames) on it, a lift and a press between, stroke 2 (8 frames) on
 *  the second, out over 5 (gone before the cut; his clean nose shows from about 1890). segD_parts padPut / padTrack. */
const PAD_T: PadTimes = { in: SND_WIPE - 6, s1: [SND_WIPE, SND_WIPE + 7], s2: [SND_WIPE + 12, SND_WIPE + 20], out: SND_WIPE + 25 };
const WIPE_ON = PAD_T.in;
/** the frames the pad crosses the middle of his nose (it covers it): the ink swaps there */
const STROKE1 = Math.round((PAD_T.s1[0] + PAD_T.s1[1]) / 2), STROKE2 = Math.round((PAD_T.s2[0] + PAD_T.s2[1]) / 2);
/** his head dragged a little with the stroke (deg of tilt at full speed) */
const WIPE_TILT = 3.5;
/** the ink: on until her first stroke, the ghost after it, clean after the second (each swap under the cloth) */
const KEYS: [number, NewtonState][] = [[S.from, "gownInk"], [STROKE1, "gownSmudge"], [STROKE2, "gown"]];
/** her eyes: trotting beside him on his LEFT (east), a little ahead (ST_ANG off his line), looking across at him and the
 *  college front close behind him; she closes in for the wipe. Framed on his SOLVED head (pass `head` after w.update():
 *  the walk's own bob does not move his eyes on the frame, the trot's handheld does, lightly): his eyes at
 *  (ST_EYE_PX) in the upper third for the whole trot.
 *  THE TIMESTAMP (hud/vlog.tsx): the whole street shot lies inside the scene's first 2 s, so the stamp's BIG intro box
 *  (stampRect("D", true): x 50..325, y 242..353) is up the whole time, top left. He sits right of the middle (x 615, was
 *  480: the room on the left is the way he walks, screen left) and she closes in to 1.3 m (was 1.1: his head 0.6 of the
 *  width, was 0.7), so his head, wig included, stays 24 px or more clear of that box on every frame (it lay on the
 *  front of his wig and the top of his forehead), and 65 px or more clear of the battery (top right). */
const ST_ANG = 1.25, ST_EYE_PX: [number, number] = [615, 585];
/** the drawn eye line under the solved head's middle (m) at her distance k: nearer, she looks down on him more steeply
 *  and his face (drawn toward her) sits lower on the ball */
const stEyeDy = (k: number) => 0.074 - 0.093 * (k - 1.05);
/** her distance from him (m, level): from the gate, closing in for the wipe (by WIPE_ON) */
const ST_K: [number, number] = [1.5, 1.3];
const camStreet = (f: number, head?: THREE.Vector3): CamPose => {
  const g = streetLeg(f), k = ky(f, [[S.from, ST_K[0]], [WIPE_ON - 1, ST_K[1]]]);
  const pos = g.at.clone().add(V(Math.sin(ST_ANG) * k, EYE, Math.cos(ST_ANG) * k));
  const eyes = head ? head.clone().add(V(0, -stEyeDy(k), 0)) : g.at.clone().add(V(0, N_EYE, 0));
  // (stEyeDy lands his drawn eyes on their mark at the wipe's distance; further off, before she closes in, they landed
  // about 50 px low (fix1 f1855 / f1862: 0.33 of the height): aim them that much higher there)
  return C.handheld(frameOn(pos, eyes, ST_EYE_PX[0], ST_EYE_PX[1] - 50 * clamp01((k - ST_K[1]) / 0.15)), f, { walk: 1.5 });
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
/** ASIDE 23 (the camera's own move, like E's turn to the bookcase): where she turns her eyes, the empty benches beside
 *  her on the right (rows 6-7, a metre or two off: their seats and backs fill the frame, the rows going off to the
 *  far wall); a step (0.3 m) toward them, a tilt of the head held (1.5 deg), and a slow drift on toward them (8 cm)
 *  while she whispers; the whip (to the left) takes her back to him */
const A23_AT = V(SCX + 2.6, 1.0, 3.6);
const a23K = (f: number) => smooth(clamp01((f - T_A23) / A23_LEN));
const camAside23 = (f: number): CamPose => {
  const k = a23K(f);
  if (!k) return camHall(f);
  const c = C.aside(camHall(f), f, T_A23, undefined, A23_AT, { len: A23_LEN, push: 0.3, roll: 2 });
  return C.creep(C.nudge(c, { roll: -1.5 * k }), f, T_A23 + A23_LEN, T_WHIP + 4, 0.08);
};
/** D4: close at the lectern (about 2.4 m), his eyes in the upper third */
const N_EYES = N_AT.clone().add(V(0, N_EYE, 0));
const LECT_POS = V(SCX + 0.45, EYE, LZ + 1.5);
const CAM_LECT = frameOn(LECT_POS, N_EYES, 520, 600);
/** ASIDE 27 (the camera's own move; his deadpan IS the joke, so he stays in frame and sharp): she leans in on his
 *  unchanged face, 0.4 m nearer along her line to him (his eyes kept on their mark), her head tilted 2.5 deg, from the
 *  silence after his line to her first word; on 笑了 her eyes shake with a stifled laugh (three small bobs, dying
 *  away); she eases back as he lectures on, settled by her line's end (before the time cut) */
const LEAN_POS = LECT_POS.clone().add(V(N_EYES.x - LECT_POS.x, 0, N_EYES.z - LECT_POS.z).setLength(0.4));
const camLectern = (f: number): CamPose => {
  const k = ky(f, [[T_A27, 0], [T_A27_IN, 1], [T_LAUGH + 10, 1], [T_A27_BACK, 0]]);
  if (!k) return CAM_LECT;
  const c = C.nudge(frameOn(LECT_POS.clone().lerp(LEAN_POS, k), N_EYES, 520, 600), { roll: -2.5 * k });
  const d = f - T_LAUGH, b = d >= 0 && d < 18 ? Math.sin((2 * Math.PI * d) / 6) * (1 - d / 18) : 0;
  return b ? C.nudge(c, { up: 0.006 * b, pitch: 0.7 * b, roll: 0.35 * b }) : c;
};
/** D5: she sits on the front bench (row 0, half a metre along it from the aisle end), her eyes at about 1.22 m: about
 *  28 deg off his axis, so the gather, the lifted sheaf and the tuck rise beside his face, not under it */
const SEAT = V(SCX + 1.45, 1.22, SCHOOLS.rows[0] + 0.08);
/** D5 (after the time cut: a new shot, so he may stand elsewhere): he has stepped up to the desk, N_B (0.1 m nearer
 *  it), and gathers the paper on the desk's near half (SHEAF_B / SPREAD_B), so his hands REACH it: from N_AT the
 *  desk's middle is 0.1-0.2 m beyond his arms (hidden behind the desk from the lectern camera, but from her low seat
 *  the lifted, tapped sheaf floated beside his face with no hands on it) */
const N_B = N_AT.clone().add(V(0, 0, 0.1));
/** (fov 48, not 62: with no mic and no clapping hands in the lower frame any more, the claps live on his face, so it
 *  is a third bigger, the lectern filling the lower frame instead of the empty boards) */
const CAM_SEAT = frameOn(SEAT, N_B.clone().add(V(0, N_EYE, 0)), 560, 640, 48);
/** her eyes on the bench: still, but for the jolt of each of her two claps (no hands: segD_parts clapJolt) */
const camBench = (f: number): CamPose => clapJolt(CAM_SEAT, f, [CLAP1, CLAP2]);
const FACE_LECT = Math.atan2(LECT_POS.x - N_AT.x, LECT_POS.z - N_AT.z);
const FACE_SEAT = Math.atan2(SEAT.x - N_B.x, SEAT.z - N_B.z);

// ---------------------------------------------------------------------------------------------------- the lectern
/** the sheaf's place (his left, screen right) and the spread sheets' (his right, screen left) on the sloped desk */
const SHEAF = { dx: 0.15, dz: 0.02, yaw: 0.1 }, SPREAD = { dx: -0.14, dz: 0.03, yaw: -0.12 };
const qOf = (e: [number, number, number]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2], "YXZ"));
const SHEAF_AT = deskPoint(SHEAF.dx, SHEAF.dz, NOTES.h / 2), SHEAF_Q = qOf(deskRot(SHEAF.yaw));
const SPREAD_AT = deskPoint(SPREAD.dx, SPREAD.dz, 0), SPREAD_Q = qOf(deskRot(SPREAD.yaw));
/** after the time cut: the paper on the desk's near half (the sheaf's near end 2 cm inside the book lip) */
const SHEAF_B = { dx: 0.04, dz: -0.05, yaw: 0.1 }, SPREAD_B = { dx: -0.24, dz: -0.03, yaw: -0.12 };
const SHEAF_B_AT = deskPoint(SHEAF_B.dx, SHEAF_B.dz, NOTES.h / 2), SHEAF_B_Q = qOf(deskRot(SHEAF_B.yaw));
const SPREAD_B_AT = deskPoint(SPREAD_B.dx, SPREAD_B.dz, 0), SPREAD_B_Q = qOf(deskRot(SPREAD_B.yaw));
/** the sheaf's grip edge (its +x edge: the left hand) for an origin and a rotation */
const gripOf = (o: THREE.Vector3, q: THREE.Quaternion) => o.clone().add(V(NOTES.w / 2, 0, 0).applyQuaternion(q));
/** where his hands rest: left on the sheaf, right on the spread sheets */
const REST_L = deskPoint(SHEAF.dx + 0.03, SHEAF.dz - 0.07, NOTES.h + 0.024);
const REST_R = deskPoint(SPREAD.dx - 0.01, SPREAD.dz - 0.07, 0.03);
const SHEAF_TOP_R = deskPoint(SHEAF.dx - 0.06, SHEAF.dz - 0.04, NOTES.h + 0.026);
const REST_LB = deskPoint(SHEAF_B.dx + 0.03, SHEAF_B.dz - 0.07, NOTES.h + 0.024);
const REST_RB = deskPoint(SPREAD_B.dx - 0.01, SPREAD_B.dz - 0.07, 0.03);
/** a hand lifted clear of the desk's near edge (left / right), on its way onto the desk or off it */
const sideL = (facing: number, at = N_AT) => rel(at, facing, 0.42, 0.86, 0.06);
const liftL = (facing: number, at = N_AT) => rel(at, facing, 0.4, 1.02, 0.36);
const liftR = (facing: number, at = N_AT) => rel(at, facing, -0.3, 0.98, 0.3);
/** the tuck's way off the desk (the left hand at the sheaf's grip edge): first down onto the desk's near half, still
 *  flat (TUCK_OVER: the sheaf's middle, 3 cm over the surface, inside the near edge's book lip), then back over the lip
 *  toward him (tuckL: the sheaf's bottom about 4 cm over the lip), low: from her seat 28 deg off his axis the sheaf
 *  crosses under his chin, never his face */
const TUCK_OVER = deskPoint(SHEAF_B.dx + 0.02, SHEAF_B.dz - 0.02, NOTES.h / 2 + 0.03);
const tuckL = (facing: number) => rel(N_B, facing, 0.36, 0.98, 0.2);
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
  const arm = underArm(f < T_TC ? N_AT : N_B, facing);
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
  // gathering (he stands at N_B, the paper on the desk's near half: SHEAF_B / SPREAD_B, in his reach)
  if (f < G_SWEEP1) {
    const k = smooth(clamp01((f - G_SWEEP0) / (G_SWEEP1 - G_SWEEP0)));
    const sw = SPREAD_B_AT.clone().lerp(deskPoint(SHEAF_B.dx, SHEAF_B.dz, NOTES.h + 0.004), k).add(V(0, 0.03 * Math.sin(Math.PI * k), 0));
    return { hands: [sw.clone().add(V(-0.02, 0.03, -0.06)), REST_LB.clone()], notes: { mode: "desk", o: SHEAF_B_AT.clone(), q: SHEAF_B_Q.clone() }, spread: 0, moving: null, sweep: sw };
  }
  if (f < G_TUCK0) {
    // both hands on its edges, lift it, tap it on the desk twice
    const lift = 0.08 * smooth(clamp01((f - G_SWEEP1) / (G_LIFT - G_SWEEP1)));
    let tap = 0; for (const t of G_TAPS) { const d = f - t; if (d >= -2 && d <= 2) tap = Math.max(tap, 1 - Math.abs(d) / 2); }
    const o = SHEAF_B_AT.clone().add(V(0, lift * (1 - tap), 0));
    const q = SHEAF_B_Q.clone();
    const edgeR = o.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(q));
    const toEdges = smooth(clamp01((f - G_SWEEP1) / 4));
    // (the hands ride on the edges' top, so on the taps they meet the desk without sinking into it)
    const up = V(0, 0.02, 0);
    return { hands: [REST_RB.clone().lerp(edgeR.add(up), toEdges), REST_LB.clone().lerp(gripOf(o, q).add(up), toEdges)], notes: { mode: "desk", o, q }, spread: 0, moving: null, sweep: null };
  }
  // tucked under his left arm; the right hand goes back to his side
  // from the 8 cm lift the sheaf comes DOWN onto the desk's near half and back over the book lip toward his left side,
  // still FLAT (a thin sliver from her seat, at his chin line, never across his face), turning on edge only as it
  // drops at his side below the desk top, then up under the arm; the right hand up, back and down
  const o0 = SHEAF_B_AT.clone().add(V(0, 0.08, 0));
  const q = SHEAF_B_Q.clone().slerp(arm.rot, smooth(clamp01((f - G_TUCK0 - 5) / 4)));
  const g = path(f, [[G_TUCK0, gripOf(o0, SHEAF_B_Q)], [G_TUCK0 + 3, gripOf(TUCK_OVER, SHEAF_B_Q)], [G_TUCK0 + 5, tuckL(facing)], [G_TUCK0 + 8, sideL(facing, N_B).add(V(0, -0.1, 0))], [G_TUCK1, arm.hand]]);
  const rr = f < G_TUCK0 + 9 ? path(f, [[G_TUCK0, o0.clone().add(V(-NOTES.w / 2, 0, 0).applyQuaternion(SHEAF_B_Q))], [G_TUCK0 + 4, rel(N_B, facing, -0.3, 1.0, 0.17)], [G_TUCK0 + 9, hang(N_B, facing, 0)]]) : null;
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
    // her first clap: his eyes flick up at her (head half up) and back down to his notes, tapping on; the second: up
    lookDown = ky(f, [[T_TC, 28], [CLAP1, 28], [CLAP1 + 3, 11], [CLAP1 + 8, 11], [CLAP1 + 12, 28], [T_LOOK, 28], [T_LOOK + 6, 0]]);
  }
  return { who: NEWTON_GOWN, at: (f < T_TC ? N_AT : N_B).clone(), facing, pose: { kind: "idle", t: t + 2.3 }, desk: deskAt(f, facing), expr, gaze, lookDown };
};

// ---------------------------------------------------------------------------------------------------- the shot
type ShotId = "street" | "hall" | "lectern" | "bench";
const shotOf = (f: number): ShotId => (f < T_HALL ? "street" : f < T_WHIP + 4 ? "hall" : f < T_TC ? "lectern" : "bench");
/** the last frame of line 27's caption (it runs on past her voice) */
const CAP27_END = capsOf("D05")[capsOf("D05").length - 1].to;
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
    // (from the aside's turn to the benches, the whip swings back LEFT to him: the cut hides in it)
    const W = C.whip(camAside23(f), f, T_WHIP, { dir: -1, to: CAM_LECT });
    cam = W.cam;
    if (W.smear > 0) { post = W.post; overlays = C.whipSmear(W.smear, -1); }
  } else cam = shot === "lectern" ? camLectern(f) : camBench(f);
  w.setCamera(cam);

  // NEWTON
  const ns = newtonState(f), n: Rig = w.actor(ns.who);
  const q = saying("nt", f), sp = q ? speak(q, f, 1) : f > L5.to && f < T_TC ? rigSpeak(t, LECTURE, 1) : {};
  // "Don't." [flat]: the rounded o through its middle (the teeth-together strip reads as a grimace at phone size)
  if (q && q.id === "D06" && (sp.mouth === "strip" || (sp.mouth === "small" && f >= q.from + 2 && f <= q.to - 6))) sp.mouth = "round";
  const nodOn = capWord("D04", "students").from;
  // the wipe drags his head a little with each stroke (the invisible hand's pressure); the claps: a start (a blink and
  // a small jolt of the head on the first, a jolt on the second as he looks up)
  const drag: { tilt: number } | undefined = shot === "street" ? { tilt: WIPE_TILT * Math.max(-1, Math.min(1, padSpeed(f, PAD_T) / 0.4)) } : undefined;
  n.set({
    at: ns.at, facing: ns.facing, pose: ns.pose, expr: ns.expr, blink: lid(t, 1, [...swaps(EXPR), (CLAP1 + 3) / FPS]), ...sp,
    head: heads(sp.head, drag, accent("nod", f, nodOn, { amp: 0.5 }), accent("jolt", f, CLAP1, { amp: 0.3 }), accent("jolt", f, CLAP2, { amp: 0.4 }), accent("nod", f, L6.from, { amp: 0.35 })),
    turn: ns.turn, gaze: ns.gaze, lookDown: ns.lookDown, hands: ns.desk ? ns.desk.hands : [null, null], hide: NEWTON_HIDE, visible: true,
  });

  // the paper on the desk (before update: it is not in anyone's hand)
  const d = ns.desk;
  if (d && d.notes.mode === "desk") w.prop("notes").put(d.notes.o, { rot: d.notes.q });
  if (d && d.spread > 0) w.prop("sheets").put(SPREAD_AT, { rot: SPREAD_Q, n: d.spread });
  if (d && d.moving) w.prop("sheets", "dealt").put(d.moving, { rot: SPREAD_Q, n: 1 });
  if (d && d.sweep) w.prop("sheets").put(d.sweep, { rot: SPREAD_B_Q, n: 3 });

  w.update();
  // (the street: framed again on his solved head; only the turn of the lens changes, so the solve stands)
  if (shot === "street") { cam = camStreet(f, n.headWorld()); w.setCamera(cam); }

  // the notes in his hand / under his arm (at the rig's real hand)
  if (d && d.notes.mode !== "desk") w.prop("notes").put(n.handWorld(1), { grip: "grip", rot: d.notes.mode === "arm" ? underArm(ns.at, ns.facing).rot : d.notes.q });

  // THE WIPE (the street): the handkerchief pad in an invisible hand (no hand drawn: segD_parts padPut)
  if (shot === "street") {
    const P = padPut(cam, f, PAD_T, n.headWorld(), C.noseOf(n), { sun: STREET_SET.sun });
    if (P) { const o: HankyOpts = { rot: P.rot, scale: P.scale, pad: true, flap: P.flap }; w.prop("handkerchief").put(P.at, o); }
    return { camera: cam, slate: "D1 street" };
  }

  // THE LENS (no mic any more, so no focus pull onto one): on the lectern and the bench a light focus on him; in aside
  // 23 on the benches she turns to (the far hall a little soft)
  const lens = C.camAxes(cam).p, mouth = n.headWorld().add(V(0, -0.1, 0));
  const dof = shot === "hall" ? (a23K(f) > 0 ? { focus: lens.distanceTo(A23_AT), amount: 2.5 * a23K(f) } : undefined)
    : { focus: lens.distanceTo(mouth), amount: shot === "lectern" ? 3 : 1.2 };
  // her line 27's caption goes as his silent lecture mouth starts (it would sit under his moving mouth and cross the
  // time cut: the captions owner is asked to end it there, requests.md)
  const captions = f > L5.to && f <= CAP27_END ? false : undefined;
  return { camera: cam, post: post ?? (dof ? { dof } : undefined), overlays, captions, slate: `D ${shot}` };
};

export const SEG: Segment = { id: "D", from: S.from, to: S.to, enter() {}, exit() {}, pose };
