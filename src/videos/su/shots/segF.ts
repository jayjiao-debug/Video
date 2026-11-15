// SEGMENT F, lines F41-F51: 夜 · 西湖边的松林, the tearjerker (PLAN 8F, script_v1_table 6). WP5 / segF.
// A blue mid-tone night; the lantern is the only warm light and it follows the lantern (pines params glow / glowX-Z
// on the lantern's paper every frame, pinesLight() on him from the same point).
//   walk     pre-F45   he strolls the lake path with the lantern in his LEFT hand (hand 1; screen right of him, clear of
//                      her mic), she walks a step behind him and to his right (the lake side), so the rig half-turns
//                      him to her (no back view: her lens stays about 100 deg off his walk, his torso turns to within
//                      30 deg of it, so the long beard hangs in front of him, clear of his free right arm). He slips
//                      into the riddle (F41, smug), turns his belly to her and pats it on 肚子 (right hand, three taps,
//                      low), shakes his head at both guesses
//                      (F43 grin, F45 happy). Handheld "calm" with her steps; the mic swings in for the riddle.
//   CAMERA PASS (PLAN 12, 2026-11-14): the camera notes below that name REVEAL / STOP / the step-in / the push-in are
//   the old camera; the take is now the one in "her camera" (plan: /home/user/su_work/cam2/F_plan.md): M1-M5 before
//   F46, then STILL (no handheld at all) with ONE slow pull back from the bow on 带不走 to just before F51.
//   stop     F45 after he stops before the pavilion step and turns to the grave at once (AWAY, 4 frames after the stop),
//                      crouches and sets the lantern on the step's front edge (BEAT.F.lantern): the warm glow goes low.
//   F46      back      「只有她猜对了」 to the grave (his back), then on 她说 he turns to her: fond (smile_closed), happy on
//                      不合时宜; the laugh after it.
//   F47-F49  front     her careful 「她是……？」; 朝云 plain, 散了 a little bowed, 只有她 fond; F49 steady, cracking on 病死.
//   F50      grave     he turns to the grave (back three-quarters, the head goes round in two frames: never a profile), his
//                      head bows on 带不走.
//   after    F50 after: he wipes his eyes (right hand), squares up to the step, crouches, picks the lantern up, turns back
//                      to her lens and smiles through it.
//   F51      smile     「走吧，明早还要赶路。」 warm, a small beckon with the free hand. The fade through blue-black to dawn is
//                      the HUD's (TRANSITIONS).
// HIS WARM LIGHT: pinesLight() from the lantern's point moved 0.6 m toward her lens (a DP's cheat: the key keeps the
// lantern's side and height but stays in front of his face, so the face reads warm and never falls into the shade).
// Every frame from BEAT.F / capWord / lineId, every mark from layout/pines.ts (PINES, PINES_SET), her mic from her.ts.
// FACES NEVER IN PROFILE: turn (rig) is 0 while her lens is less than 128 deg off his facing and 1 from there, a one-frame
// switch (turnFor; QA2 2026-11-14: the old 120-136 deg ramp left frames at turn 0.3-0.7, a squeezed near profile); his
// facing passes 128 deg fast on every turn, and during the reveal (where her camera moves round him) he turns with her,
// his facing kept within 112 deg of her lens, until AWAY, when he turns away to the step (facingAt).
import * as THREE from "three";
import { SEGMENTS, FPS, clamp01, smooth, camMix, mix3, capWord, lineId, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU } from "../people";
import { PINES, PINES_SET, SU_HEAD, FOV } from "../layout";
import { pinesLight } from "../sets/pines";
import { LANTERN_CENTRE } from "../props";
import { putHer, herKeys, type MicMode } from "../her";
import { transitionAt } from "../hud";
import { V, standing, says, accent, heads, walkAlong, walkTime, rel, wrapA, yawTo, bow, kneel, at, ky, type Leg, type RigState } from "./common";

const S = SEGMENTS[5], B = BEAT.F, PI = Math.PI, DEG = PI / 180;
const word = (id: string, w: string) => capWord(id, w).from;

// ------------------------------------------------------------------------------------------------ beats (looked up)
const WD = {
  riddle: word("F41", "你猜"), what: word("F41", "装的"), no1: word("F43", "不对"), no2: word("F45", "也不对"),
  said: word("F46", "她说"), outOfStep: word("F46", "不合时宜"), zhaoyun: word("F48", "朝云"), scattered: word("F48", "散了"),
  onlyHer: word("F48", "只有她"), died: word("F49", "病死"), road: word("F51", "赶路"), go: word("F51", "走吧"),
};
const F42 = lineId("F42"), F44 = lineId("F44"), F47 = lineId("F47"), F50 = lineId("F50");
/** the mic swings in for the riddle (8 frames before F41's first syllable) */
const MIC_IN = lineId("F41").from - 8;
/** from here (14 frames before the stop) to 她说 his facing is kept within REV_LIM of her lens (facingAt) */
const REV0 = B.stop - 14;
/** he turns from her to the grave (CAMERA PASS: 4 frames after the stop, was 18, so her lens can come round behind him
 *  on M4 while he is already turning: his facing clamp (facingAt) has opened past 180 deg before her lens crosses his back) */
const AWAY = B.stop + 4;
/** her mic droops while she takes in the place; comes back up when he turns to her on 她说 */
const MIC_DOWN = B.stop + 8, MIC_UP = WD.said + 4;
/** the set-down (crouch, the hand on the step's edge, release) and the pick-up */
const L0 = B.lantern, P0 = B.pickUp;
/** F50: the head bow on 带不走 holds until the pick-up */
const BOW_END = P0 + 4;
/** the wipe: the sleeve is at his eyes on BEAT.F.wipe (it rises 8 frames before), two strokes, down for the pick-up */
const WIPE0 = B.wipe - 8, WIPE1 = P0 - 2;

// ------------------------------------------------------------------------------------------------ marks (layout/pines)
const ST = PINES_SET.steps;
/** the lower step's front edge (z) and its top (y) */
const STEP_FRONT = PINES.step.z + ST.depth / 2, STEP_TOP = PINES.step.y;
/** where he stops: on his mark's line, 0.34 m short of the step's front edge (close enough to set the lantern on it) */
const STOP = V(PINES.su.x, 0, STEP_FRONT + 0.34);
/** his facings: to her lens; square to the step (a hair off PI so the back view never flips sides); to the grave in F50
 *  (back three-quarters: about 137 deg from her lens: we see his back and his right side, the moonlit lake ahead of him) */
const F_HER = PINES.suFacing, F_STEP = PI - 0.15, F_GRAVE = PINES.suGrave - 0.45;
/** the wipe: he turns a little from the grave toward the lake (QA2: about 125 deg from her lens, his true facing kept;
 *  at the old 105 deg the rig drew no face but a bare skin cheek under the hat, WP3-fix's note): his hand going up to
 *  his eyes shows at the right edge of his head (the hand's target at the side of his face, 0.30 m from the head's
 *  middle, not in front of it: the arm no longer goes 10-13 cm through his body, rig qa clear -0.02 at worst; the
 *  clearance checker is clean) */
const F_WIPE = F_GRAVE - 12 * DEG;
/** the lantern (props/things.ts lantern: the bottom cap 0.405 m under the hook, the tassel to 0.53, r 0.15): set down
 *  with its hook over a point 3.5 cm in front of the step's front edge, so the bottom cap rests on the edge (5 mm into
 *  it: the checker sees it supported) and the tassel hangs clear in front of the riser. At his LEFT (-x) as he faces the
 *  step: on screen left of him, low and glowing, in the STOP framing. (Request: WP3 to export the lantern's sizes.) */
const LANT_BASE = 0.405;
const LANT_HOOK = V(STOP.x - 0.3, STEP_TOP + LANT_BASE - 0.005, STEP_FRONT + 0.035);
/** where he carries it: his LEFT hand out to the side (the paper clear of his robe), in his torso's frame (x = his left;
 *  his shoulder is about 0.155 out at 0.99 m, the arm 0.40 long) */
const CARRY = { x: 0.45, y: 0.76, z: 0.04 };
/** how far from her lens his torso stays (rig maxBody: the most the body is turned away from the lens before a back
 *  view; default 45 deg). The face is drawn within 12 deg of her lens and his long beard hangs from the face, so with
 *  the default, her lens 100 deg off his walk leaves the beard 33 deg round over his right shoulder, on that arm's
 *  root. On the walk his torso half-turns to her (30 deg: the beard 21 deg round), and on the pat a little more (he
 *  shows her the belly: 18 deg); back to the default once he has stopped */
const maxBodyAt = (f: number) => ky(f, [[S.from, 30 * DEG], [B.pat - 14, 30 * DEG], [B.pat - 5, 18 * DEG], [B.pat + 22, 18 * DEG], [B.pat + 34, 30 * DEG], [B.stop, 30 * DEG], [B.stop + 12, 45 * DEG]]);
/** the crouch for the set-down and the pick-up (common.ts kneel: the films' sink; the checker exempts a sunk figure) */
const CROUCH = 0.5;
/** the pat's belly point (torso frame, right hand): the lower belly, right of the middle, below the beard's tip (0.75) */
const PAT = { x: -0.11, y: 0.68, z: 0.29 };

// ------------------------------------------------------------------------------------------------ his walk
/** the lake path (PINES.path), then the last steps to STOP; he arrives on BEAT.F.stop, already walking at the segment's
 *  first frame (he set off LEN s before the stop) */
const WALK = [...PINES.path, STOP];
const SPEED = 0.95, LEN = walkTime(WALK, SPEED);
const leg = (f: number): Leg => walkAlong(WALK, SPEED, (f - B.stop) / FPS + LEN, { endFacing: F_STEP });
/** his walking position and direction smoothed over a few frames (the camera's anchor; never jitters on the corners) */
const anchor = (f: number) => {
  const p = V(), d = V(); let ws = 0;
  for (let i = 0; i < 12; i++) { const L = leg(f - i), w = 12 - i; p.addScaledVector(L.at, w); d.add(V(Math.sin(L.facing), 0, Math.cos(L.facing)).multiplyScalar(w)); ws += w; }
  return { at: p.divideScalar(ws), yaw: Math.atan2(d.x, d.z) };
};

// ------------------------------------------------------------------------------------------------ her camera
// THE CAMERA PASS (PLAN 12, Jay 2026-11-14; plan table /home/user/su_work/cam2/F_plan.md): ONE TAKE, still between
// moves, each move with a reason. A set-up is a Shot: the lens at pos, the world point tgt on screen (sx, sy) px of
// 1080 x 1920, the lens angle; a move mixes the whole Shot (so the subject stays framed while she moves).
//   M1 4023-4037  she closes in as he turns to her (lands on 你猜)          walk follow 2.9 m -> 2.0 m
//   M2 4063-4068  snap down to the belly he pats (lands on 肚子); back up for 装的 (4084-4094)
//   M3 4242-4247  snap zoom on 也不对 (fov 62 -> 45), held 1.3 s
//   M4 4285-4305  he turns to the grave: she follows his look round behind his left shoulder (his hat in the foreground)
//   M5 4318-4339  she steps back and left to the still frame P1 (lands on F46's first frame)
//   F46-F51 (4339 on): THE EMOTIONAL SCENE (PLAN 12.5): NO handheld, no sway, no effect; ONE slow move:
//   M6 BEAT.F.bow -> 5005  the slow pull back P1 -> P2 (1.2 m back, the frame tips up a little to the roof and moon)
type Shot = { pos: THREE.Vector3; tgt: THREE.Vector3; sx: number; sy: number; fov: number };
/** where a world point lands on screen (px of 1080 x 1920) for a camera at pos looking at look */
const project = (pos: THREE.Vector3, look: THREE.Vector3, fov: number, p: THREE.Vector3) => {
  const c = new THREE.PerspectiveCamera(fov, 9 / 16, 0.05, 500);
  c.position.copy(pos); c.up.set(0, 1, 0); c.lookAt(look); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const q = p.clone().project(c); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960 };
};
/** the camera of a Shot: the look turned (yaw, pitch about the lens) until tgt lands on (sx, sy) */
const shotCam = (s: Shot): CamPose => {
  const tanV = Math.tan((s.fov * DEG) / 2), tanH = tanV * (9 / 16);
  let look = s.tgt.clone();
  for (let i = 0; i < 5; i++) {
    const q = project(s.pos, look, s.fov, s.tgt), d = look.clone().sub(s.pos);
    const yaw = Math.atan2(d.x, d.z) - Math.atan(((q.x - s.sx) / 540) * tanH), pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)) - Math.atan(((q.y - s.sy) / 960) * tanV);
    look = s.pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  }
  return { pos: [s.pos.x, s.pos.y, s.pos.z], look: [look.x, look.y, look.z], fov: s.fov };
};
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;
const mixShot = (a: Shot, b: Shot, t: number): Shot => t <= 0 ? a : t >= 1 ? b :
  { pos: a.pos.clone().lerp(b.pos, t), tgt: a.tgt.clone().lerp(b.tgt, t), sx: lerpN(a.sx, b.sx, t), sy: lerpN(a.sy, b.sy, t), fov: lerpN(a.fov, b.fov, t) };
const out3 = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** the slow move's profile: steady in the middle, long soft ends (cam.ts slowPush's), 0..1 over [a, b] */
const slowK = (f: number, a: number, b: number) => {
  const n = b - a, r = Math.min(30, n / 2.5), x = Math.max(0, Math.min(n, f - a)), v = 1 / (n - r);
  return x < r ? (v * x * x) / (2 * r) : x > n - r ? 1 - (v * (n - x) * (n - x)) / (2 * r) : v * (x - r / 2);
};
/** the moves' frames (from the beats: plan table) */
const M1 = [WD.riddle - 14, WD.riddle], M2 = [B.pat - 5, B.pat], M2B = [WD.what, WD.what + 10], M3 = [WD.no2 - 5, WD.no2];
const M4 = [AWAY, AWAY + 20], M5 = [lineId("F46").preFrom - 21, lineId("F46").preFrom], M6 = [B.bow, B.smile - 6];
/** THE STILL FROM HERE: F46's first frame */
const STILL = lineId("F46").preFrom;
/** the walk: her lens a step behind him and to his right (100 deg off his walking direction), dist m from him */
const SIDE = 100 * DEG;
const EYE_H = 1.5;
const walkPos = (A: { at: THREE.Vector3; yaw: number }, dist: number) => A.at.clone().add(V(Math.sin(A.yaw - SIDE) * dist, EYE_H, Math.cos(A.yaw - SIDE) * dist));
/** the still frames after the stop: P1 (F46-F50) 2.65 m from him, 25 deg to his right, the stele at his right shoulder
 *  (screen left of him), the lantern low at the left; P2 (after the pull back) 1.2 m further back along her view, the
 *  frame tipped up a little (his head lower: the pavilion roof and the moon come in) */
const STOP_HEAD = STOP.clone().add(V(0, SU_HEAD, 0));
const P1: Shot = { pos: STOP.clone().add(V(-1.0, EYE_H, 2.1)), tgt: STOP_HEAD, sx: 600, sy: 650, fov: FOV };
const P2: Shot = (() => {
  const back = STOP_HEAD.clone().sub(P1.pos).setY(0).normalize().multiplyScalar(-1.2);
  return { pos: P1.pos.clone().add(back), tgt: STOP_HEAD, sx: 585, sy: 790, fov: FOV };
})();
/** OTS (the set-down): behind his left shoulder, on the grave: his hat brim and shoulder in the right foreground */
const OTS: Shot = { pos: STOP.clone().add(V(-0.75, EYE_H, 1.5)), tgt: PINES.stele.clone(), sx: 470, sy: 820, fov: 52 };
/** M4 goes round him on an arc about his mark (radius and bearing eased), never through the space just behind his head */
const orbit = (a: Shot, b: Shot, t: number): Shot => {
  const m = mixShot(a, b, t); if (t <= 0 || t >= 1) return m;
  const ra = a.pos.clone().sub(STOP).setY(0), rb = b.pos.clone().sub(STOP).setY(0);
  const ang = lerpN(Math.atan2(ra.x, ra.z), Math.atan2(rb.x, rb.z), t), r = lerpN(ra.length(), rb.length(), t);
  m.pos.set(STOP.x + Math.sin(ang) * r, m.pos.y, STOP.z + Math.cos(ang) * r);
  return m;
};
/** her steps (walk bob) and her calm breathing: walking while he walks and while she moves round him; from F46 on NONE */
const WALKING: [number, number][] = [[S.from, 1], [B.stop, 1], [B.stop + 10, 0.2], [M4[0], 0.7], [M4[1], 0.2], [M5[0], 0.5], [STILL, 0]];
const ampAt = (f: number) => (f >= STILL ? 0 : ky(f, [[S.from, 0.8], [M5[0], 0.8], [STILL, 0]]));
export const camF = (f: number): CamPose => {
  const A = anchor(Math.min(f, B.stop + 12)), him = f < B.stop ? leg(f).at : STOP, head = him.clone().add(V(0, SU_HEAD, 0));
  const near = walkPos(A, 2.0), toLens = near.clone().sub(A.at).setY(0).normalize();
  const W0: Shot = { pos: walkPos(A, 2.9), tgt: head, sx: 400, sy: 760, fov: FOV };
  const W1: Shot = { pos: near, tgt: head, sx: 530, sy: 660, fov: FOV };
  const BELLY: Shot = { pos: near, tgt: him.clone().add(V(0, 0.68, 0)).addScaledVector(toLens, 0.22), sx: 550, sy: 740, fov: 34 };   // whole-film QA: 860 -> 740, his chin off the top edge
  const CLOSE: Shot = { pos: near, tgt: head, sx: 540, sy: 690, fov: 45 };
  let s = W0;
  const go = (m: number[], to: Shot, e: (x: number) => number = smooth, mix = mixShot) => { if (f >= m[0]) s = mix(s, to, e((f - m[0]) / (m[1] - m[0]))); };
  go(M1, W1);            // M1 he turns to her: she closes in (lands on 你猜)
  go(M2, BELLY, out3);   // M2 snap down to the belly he pats (lands on 肚子)
  go(M2B, W1);           //    back up to his face for 装的是什么
  go(M3, CLOSE, out3);   // M3 snap zoom on 也不对
  go(M4, OTS, smooth, orbit);   // M4 he turns to the grave: she follows his look round behind his left shoulder
  go(M5, P1);            // M5 she steps back to the still frame (lands on F46)
  if (f >= M6[0]) s = mixShot(P1, P2, slowK(f, M6[0], M6[1]));   // M6 THE ONE SLOW MOVE: the pull back
  const base = shotCam(s), amp = ampAt(f);
  return amp > 0 ? C.handheld(base, f, { mood: "calm", walk: WALKING, amp }) : base;
};
const camAt = camF;

// ------------------------------------------------------------------------------------------------ his facing and turn
/** his facing after the stop (eased keys; the walk gives it before): square to the step, to her on 她说, to the grave
 *  in F50, square to the step again for the pick-up, to her for F51 (each a 16-frame turn, the short way round) */
const facingKeys = (f: number, L: Leg) => f < B.stop + 6 ? L.facing : ky(f, [
  [B.stop + 6, F_STEP], [WD.said, F_STEP], [WD.said + 16, F_HER], [B.turn, F_HER], [B.turn + 16, F_GRAVE],
  [B.wipe - 16, F_GRAVE], [B.wipe - 4, F_WIPE], [P0 - 8, F_WIPE], [P0, F_STEP], [B.smile, F_STEP], [B.smile + 16, F_HER],
]);
/** her lens seen from where he stands (yaw) */
const lensYaw = (at: THREE.Vector3, cam: CamPose) => { const c = cam.pos as [number, number, number]; return Math.atan2(c[0] - at.x, c[2] - at.z); };
/** THE REVEAL (QA2): while she drifts round behind him he still smiles at her: his facing is kept within REV_LIM of her
 *  lens (he turns with her, the face stays on her); on AWAY he turns away to the step, his facing sweeping 8 deg a
 *  frame, and the back view switches on the way (TURN_AT) */
const REV_LIM = 112 * DEG;
const revLim = (f: number) => (f < AWAY ? REV_LIM : Math.min(PI, REV_LIM + (f - AWAY) * 8 * DEG));
const facingAt = (f: number, L: Leg, at: THREE.Vector3, cam: CamPose) => {
  const raw = facingKeys(f, L);
  if (f < REV0 || f >= WD.said) return raw;
  const lens = lensYaw(at, cam), d = wrapA(raw - lens), lim = revLim(f);
  return Math.abs(d) <= lim ? raw : lens + Math.sign(d) * lim;
};
/** THE BACK VIEW (rig `turn`): 0 = his body and face turned to her lens (the face stays within 12 deg of the lens),
 *  1 = his true facing (a back view). A CLEAN SWITCH with no in-between (QA2, segI's finding: a rig turn of 0.3-0.7
 *  draws the face squeezed against the side of the head, a near profile): 1 once his facing is TURN_AT or more off her
 *  lens; his facing passes that at 8-15 deg a frame on every turn (the reveal's included, facingAt), so the switch is
 *  one frame of a quick turn. Held at 1 from the end of F50's turn to the grave until he turns back to her (the wipe) */
const TURN_AT = 128 * DEG;
const turnFor = (f: number, facing: number, at: THREE.Vector3, cam: CamPose) => {
  if (f >= B.turn + 16 && f < B.smile) return 1;
  return Math.abs(wrapA(facing - lensYaw(at, cam))) >= TURN_AT ? 1 : 0;
};

// ------------------------------------------------------------------------------------------------ the lantern
/** the crouch 0..1 (kneel's sink), for the set-down and the pick-up */
const crouchAt = (f: number) => CROUCH * (ky(f, [[L0, 0], [L0 + 9, 1], [L0 + 15, 1], [L0 + 25, 0]]) + ky(f, [[P0, 0], [P0 + 8, 1], [P0 + 13, 1], [P0 + 22, 0]]));
/** the lantern is on the step between the release and the grab */
const onStep = (f: number) => f >= L0 + 12 && f < P0 + 10;
/** how far his left hand is from its carry point toward the step's edge (0 = carrying, 1 = on the lantern's hook) */
const reachK = (f: number) => f < P0 - 2 ? ky(f, [[L0, 0], [L0 + 9, 1], [L0 + 13, 1], [L0 + 22, 0]]) : ky(f, [[P0, 0], [P0 + 8, 1], [P0 + 11, 1], [P0 + 21, 0]]);
/** the carry point of his left hand (world), in the frame of his torso (bodyYaw), sunk with him */
const carryAt = (at: THREE.Vector3, yaw: number, f: number, L: Leg) => {
  const sw = L.moving ? 0.015 * Math.sin((PI * L.d) / 0.4) : 0.006 * Math.sin((2 * PI * f) / (FPS * 3.1));   // the swing of his steps / a breath
  return rel(at, yaw, CARRY.x, CARRY.y, CARRY.z + sw);
};
/** an estimate of the lantern's paper middle before the solve (for his warm light: setPlace must come first), and the
 *  point his warm key comes from: that, moved 0.6 m toward her lens (see the header) */
const lanternEst = (f: number, at: THREE.Vector3, facing: number, L: Leg) =>
  (onStep(f) ? LANT_HOOK.clone() : carryAt(at, facing, f, L).lerp(LANT_HOOK, reachK(f))).add(V(0, LANTERN_CENTRE, 0));
const keyFrom = (p: THREE.Vector3, cam: CamPose) => { const c = cam.pos as [number, number, number], d = V(c[0] - p.x, 0, c[2] - p.z); return p.clone().addScaledVector(d.normalize(), 0.6); };

// ------------------------------------------------------------------------------------------------ his face
/** expressions on the words (capWord / lineId / BEAT). SU's "neutral" is his resting smile (people.ts), so the plain
 *  beats are explicit (QA2): a soft smile on 朝云, a sigh on 散了 and on F49's 去年夏天 (steady, then sad on 病死) */
const EXPR: [number, NonNullable<RigState["expr"]>][] = [
  [S.from, "smile"], [WD.riddle - 14, "smug"], [B.pat, "grin"], [WD.what, "happy"], [F42.from, "smug"], [WD.no1, "grin"],
  [F44.from, "smug"], [WD.no2, "happy"], [B.stop + 10, "smile"], [AWAY, "smile_closed"], [WD.outOfStep, "happy"],
  [B.laugh, "laugh"], [B.laugh + 22, "smile_closed"], [F47.from + 20, "smile"], [WD.scattered, "sigh"],
  [WD.onlyHer, "smile_closed"], [lineId("F49").from, "sigh"], [WD.died, "sad"], [F50.from + 30, "pained"], [F50.to + 8, "sad"],
  [B.smile, "smile_closed"], [WD.road, "smile"],
];
/** the gaze (pupils: -1 screen left .. 1 screen right): ahead on the walk (screen right) between the lines, to her
 *  on the lines; to the grave behind him (screen right of him) on F46's start; down-ish elsewhere is the lookDown */
const GAZE: [number, number][] = [
  [S.from, 0.5], [WD.riddle - 16, 0], [lineId("F41").to + 4, 0.25], [F42.from, 0], [lineId("F43").to + 2, 0.5], [F44.from, 0],
  [lineId("F45").to, 0], [B.stop + 6, 0.5], [WD.said + 8, 0], [F47.from, 0], [WD.scattered, -0.25], [WD.onlyHer, 0],
];
/** looking down a little: F47's careful question, 散了, F49's crack (the bow of F50 adds to it) */
const lookDownAt = (f: number) => ky(f, [[F47.from - 4, 0], [F47.from + 10, 6], [WD.zhaoyun, 3], [WD.scattered, 9], [WD.onlyHer + 6, 2], [WD.died, 2], [WD.died + 12, 9], [B.turn, 6]]);

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    const L = leg(f), cam = camAt(f);
    const sink = crouchAt(f), at0 = f < B.stop ? L.at : STOP.clone();
    const facing = facingAt(f, L, at0, cam), turn = turnFor(f, facing, at0, cam);
    const head0 = at0.clone().add(V(0, SU_HEAD - 0.38 * sink, 0));
    // the place and his light: the lantern's warm light on him (pinesLight), from an estimate of where the lantern is
    w.setPlace("pines", { light: pinesLight({ glow: 1, lantern: keyFrom(lanternEst(f, at0, facing, L), cam), head: head0 }) });
    w.set.param("moon", 1);
    w.set.param("glow", 1);
    w.setCamera(cam);

    // ---- HIM: walking, then standing on STOP (crouching for the lantern)
    const r = w.actor(SU), t = f / FPS;
    const sp = says("su", ["F41", "F43", "F45", "F46", "F48", "F49", "F50", "F51"], f, 1);
    const bowK = f >= B.bow ? clamp01((f - B.bow) / 14) * (1 - clamp01((f - BOW_END) / 10)) : 0;
    const B_ = bowK > 0 ? bow(bowK, 24) : {};
    const K_ = sink > 0 ? kneel(sink, at0, 0) : {};
    const head = heads(
      sp.head,
      accent("shake", f, WD.no1, { amp: 0.9 }), accent("shake", f, WD.no2, { amp: 0.7 }),
      accent("nod", f, B.pat, { amp: 0.5 }), accent("laugh", f, B.laugh, { dur: 0.8 }), accent("nod", f, WD.road, { amp: 0.5 }),
      accent("lean", f, WD.riddle, { dur: 0.7, dir: -1, amp: 0.6 }),
      B_.head, K_.head,
      // a held tilt for the riddle (playful), a small one listening, the shoulders' sob on 带不走 (a tremble of the head)
      { tilt: ky(f, [[WD.riddle - 10, 0], [WD.riddle, 5], [lineId("F45").to, 4], [B.stop + 20, 0]]), dy: f >= B.bow && f < F50.to + 20 ? 0.012 * Math.sin(t * 9) * bowK : 0 },
    );
    r.set({
      ...standing(at0, facing, f, 1, {
        pose: L.moving && f < B.stop ? L.pose : { kind: "idle", t: t + 0.41 },
        turn, maxBody: maxBodyAt(f), expr: at(f, EXPR), gaze: at(f, GAZE),
        lookDown: lookDownAt(f) + (B_.lookDown ?? 0) + 18 * sink / CROUCH,
      }),
      ...(sink > 0 ? { at: K_.at } : {}),
      ...(sp.mouth ? { mouth: sp.mouth } : {}),
      ...(sp.blink !== undefined ? { blink: sp.blink } : {}),
      head, hands: [null, null],
    });
    w.update();

    // ---- his hands, in his torso's frame (bodyYaw from the first solve): the lantern (left), the pat, the wipe and
    //      the beckon (right)
    const yaw = r.bodyYaw, atS = (sink > 0 ? K_.at! : at0).clone(), hd = r.headWorld();
    const rest = onStep(f) ? r.handWorld(1) : carryAt(atS, yaw, f, L);          // the natural hang while it is on the step
    const left = onStep(f) && reachK(f) <= 0 ? null : rest.lerp(LANT_HOOK, reachK(f));
    let right: THREE.Vector3 | null = null;
    // the pat on 肚子: three taps on the belly's front, low (under the beard's tip; right hand), in and out
    const patU = (f - (B.pat - 6)) / 30;
    if (patU > 0 && patU < 1) {
      const up = smooth(clamp01(patU / 0.2)) * (1 - smooth(clamp01((patU - 0.8) / 0.2))), tap = 0.035 * Math.abs(Math.sin(patU * 3 * PI));
      const belly = rel(atS, yaw, PAT.x, PAT.y, PAT.z + tap), wide = rel(atS, yaw, -0.34, 0.68, 0.16);   // via a point out at his side
      const k = 1 - up, nat = r.handWorld(0);                                        // a curve belly -> side -> hang
      right = belly.multiplyScalar((1 - k) * (1 - k)).addScaledVector(wide, 2 * k * (1 - k)).addScaledVector(nat, k * k);
    }
    // the wipe: the right hand up to his right eye (the side toward her lens: drawn at its true depth, armFront, so the
    // sleeve shows over his cheek), two strokes across, down again
    const wipeU = (f - WIPE0) / (WIPE1 - WIPE0), wiping = wipeU > 0 && wipeU < 1;
    if (wiping) {
      const up = smooth(clamp01(wipeU / 0.25)) * (1 - smooth(clamp01((wipeU - 0.8) / 0.2))), across = 0.04 * Math.sin(clamp01((wipeU - 0.25) / 0.55) * 2 * PI);
      const eyes = hd.clone().add(V(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(0.2)).add(V(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(-0.225 + across)).add(V(0, -0.03, 0));
      right = r.handWorld(0).lerp(eyes, up);
    }
    // the beckon on 走吧: the free hand lifts a little toward her, palm in, and drops
    const bkU = (f - WD.go) / 40;
    if (bkU > 0 && bkU < 1) {
      const up = smooth(clamp01(bkU / 0.25)) * (1 - smooth(clamp01((bkU - 0.7) / 0.3))), flick = 0.03 * Math.sin(clamp01((bkU - 0.2) / 0.5) * 4 * PI);
      right = r.handWorld(0).lerp(rel(atS, yaw, -0.28, 0.92 + flick, 0.26), up);
    }
    r.set({ hands: [right, left], ...(wiping ? { armFront: [true, undefined] as [boolean, undefined] } : {}) });
    w.update();

    // ---- the lantern: in his left hand, or on the step's edge; its glow on its paper (the set's one point light)
    const hook = onStep(f) ? LANT_HOOK.clone() : r.handWorld(1);
    w.prop("lantern").put(hook, { grip: "hook", lit: 1 });
    const glow = hook.clone().add(V(0, LANTERN_CENTRE, 0));
    w.set.param("glowX", glow.x); w.set.param("glowY", glow.y); w.set.param("glowZ", glow.z);

    // ---- her red mic: in for the riddle, toward him; droops while she takes in the place; up again on 她说; drops out
    //      of the frame after F50 and stays down
    const mic = herKeys<MicMode>(f, [[MIC_IN, "in"], [MIC_DOWN, "low", 20], [MIC_UP, "toward", 16], [B.low, "low", 36]], "off");
    putHer(w, cam, f, { mic: { ...mic, aim: hd.clone().add(V(0, -0.08, 0)) } });

    const shot = f < M1[0] ? "open" : f < M2[0] ? "M1 medium" : f < M2B[1] ? "M2 belly" : f < M3[0] ? "medium" : f < M4[0] ? "M3 close" : f < M5[0] ? "M4 ots" : f < M6[0] ? "P1 still" : "M6 pull back";
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: `F ${shot} turn ${turn.toFixed(2)}` };
  },
};
