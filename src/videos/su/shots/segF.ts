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
//   reveal   F45 after he stops before the pavilion step, still smiling at her; she drifts back and left onto the path
//                      behind him (the walk camera blends into REVEAL: the pavilion, the grave mound, the big moon over its
//                      right shoulder); he turns to the grave (back view) once she is behind him, crouches and sets the
//                      lantern on the step's front edge (BEAT.F.lantern): the warm glow goes low. Her mic droops.
//   F46      back      「只有她猜对了」 to the grave (his back, the pavilion, the moon), then on 她说 he turns to her and she
//                      steps in to the STOP framing: fond (smile_closed), happy on 不合时宜; the laugh after it.
//   F47-F48  stop      her careful 「她是……？」 (mic up again); 朝云 plain, 散了 a little bowed, 只有她 fond.
//   push     F48-F50   THE SLOW PUSH-IN (BEAT.F.push), no sway at all, STOP -> CLOSE. F49 steady, cracking on 病死 (sad);
//                      F50 he turns to the grave (back three-quarters, the body turned first with his face to her, the
//                      head goes round in two frames: never a profile), his head bows on 带不走.
//   after    F50 after the push has stopped; the mic hand drops out of frame (low); he wipes his eyes (right hand), squares
//                      up to the step, crouches, picks the lantern up, turns back to her lens and smiles through it.
//   F51      smile     「走吧，明早还要赶路。」 warm, a small beckon with the free hand; her breathing comes back. The fade
//                      through blue-black to dawn is the HUD's (TRANSITIONS).
// HIS WARM LIGHT: pinesLight() from the lantern's point moved 0.6 m toward her lens (a DP's cheat: the key keeps the
// lantern's side and height but stays in front of his face, so the face reads warm and never falls into the shade).
// Every frame from BEAT.F / capWord / lineId, every mark from layout/pines.ts (PINES, PINES_SET), her mic from her.ts.
// FACES NEVER IN PROFILE: turn (rig) is 0 while her lens is less than 120 deg off his facing and 1 past 136 deg (turnFor);
// his facing moves fast through that window on every turn, and during the reveal (where her camera moves round him
// instead) the turn is a 5-frame ramp on a frame when she is already well behind him (AWAY).
import * as THREE from "three";
import { SEGMENTS, FPS, clamp01, smooth, camMix, mix3, capWord, lineId, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU } from "../people";
import { PINES, PINES_SET, SU_HEAD, FOV, frontCam } from "../layout";
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
/** the walk camera starts drifting back onto the path behind him (the reveal), and has arrived */
const REV0 = B.stop - 14, REV1 = B.lantern + 12;
/** he turns from her to the grave (a 5-frame turn ramp: her camera is past 140 deg behind him by then) */
const AWAY = B.stop + 18;
/** her mic droops while she takes in the place; comes back up when he turns to her on 她说 */
const MIC_DOWN = B.stop + 8, MIC_UP = WD.said + 4;
/** she steps in from the reveal to the STOP framing as he turns to her */
const IN0 = WD.said - 4, IN1 = WD.said + 50;
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
/** the wipe: he turns a little from the grave toward the lake (about 105 deg from her lens, his true facing kept: a lost
 *  profile, the face drawing is gone past 72 deg): his sleeve going up to his eyes then shows beside his head (at
 *  F_GRAVE the arm is all behind the head) */
const F_WIPE = F_GRAVE - 30 * DEG;
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
/** WALK: a step behind him and to his right (100 deg off his walking direction), 2.1 m from him (his hat fits), his head
 *  at y 600 */
const SIDE = 100 * DEG;
const camWalk = (f: number): CamPose => { const A = anchor(Math.min(f, B.stop + 12)); return frontCam(A.at, A.yaw - SIDE, 2.1, { eyesPx: 600 }); };
/** REVEAL: on the path 3.2 m behind his stop, aimed past him at the pavilion, a little to its right so the big moon sits
 *  over its right shoulder (layout PINES_SET.moon az 24), slightly down so he stays in the frame's middle */
const REVEAL: CamPose = (() => {
  const pos = STOP.clone().add(V(-0.25, 1.5, 3.2)), yaw = yawTo(pos, PINES.pavilion) - 8.5 * DEG, pitch = -2 * DEG;
  const look = pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(5));
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: FOV };
})();
/** STOP (F46 on, she has stepped in) and CLOSE (the push's end, F50): in front of him, the pavilion behind him */
const STOP_CAM: CamPose = frontCam(STOP, F_HER, 2.35, { side: -0.22, eyesPx: 610 });
const CLOSE_CAM: CamPose = frontCam(STOP, F_HER, 1.75, { side: -0.12, eyesPx: 580 });
/** her step in from the reveal to STOP as he turns to her on 她说: her lens tips down onto him first (from 8 frames
 *  before IN0, done 18 frames after it, as his face comes round), her feet follow (IN0..IN1): his face is in the upper
 *  part of the frame from the moment it shows (a plain mix of the two poses left it low until the end) */
const dirOf = (c: CamPose) => { const p = mix3(c.pos, c.pos, 0), l = mix3(c.look, c.look, 0); return V(l[0] - p[0], l[1] - p[1], l[2] - p[2]).normalize(); };
const stepIn = (f: number): CamPose => {
  const a = C.creep(REVEAL, f, REV1 + 8, IN0, 0.22), kp = smooth(clamp01((f - IN0) / (IN1 - IN0))), kd = smooth(clamp01((f - (IN0 - 8)) / 26));
  const p = mix3(a.pos, STOP_CAM.pos, kp), d = dirOf(a).lerp(dirOf(STOP_CAM), kd).normalize();
  return { ...a, pos: p, look: [p[0] + d.x * 3, p[1] + d.y * 3, p[2] + d.z * 3], fov: a.fov + (STOP_CAM.fov - a.fov) * kp };
};
/** the push's progress 0..1: steady in the middle, long soft ends (cam.ts slowPush's profile), on BEAT.F.push */
const pushK = (f: number) => {
  const [a, b] = B.push, n = b - a, r = Math.min(30, n / 2.5), x = Math.max(0, Math.min(n, f - a)), v = 1 / (n - r);
  return x < r ? (v * x * x) / (2 * r) : x > n - r ? 1 - (v * (n - x) * (n - x)) / (2 * r) : v * (x - r / 2);
};
/** her steps and her breathing: walking while he walks and while she moves; STILL from the push on (no sway), the
 *  breath comes back softly when he smiles at her again */
const WALKING: [number, number][] = [[S.from, 1], [B.stop, 1], [REV1, 0], [IN0, 0], [IN0 + 10, 0.55], [IN1, 0]];
const ampAt = (f: number) => ky(f, [[S.from, 0.8], [B.stop, 0.8], [REV1, 0.5], [B.push[0], 0.5], [B.push[0] + 10, 0], [B.smile, 0], [B.smile + 24, 0.3]]);
const camF = (f: number): CamPose => {
  let base: CamPose;
  if (f < REV0) base = camWalk(f);
  else if (f < REV1) base = camMix(camWalk(f), REVEAL, smooth((f - REV0) / (REV1 - REV0)));
  else if (f < IN0 - 8) base = C.creep(REVEAL, f, REV1 + 8, IN0, 0.22);
  else if (f < IN1) base = stepIn(f);
  else base = camMix(STOP_CAM, CLOSE_CAM, pushK(f));
  const amp = ampAt(f);
  return amp > 0 ? C.handheld(base, f, { mood: "calm", walk: WALKING, amp }) : base;
};

// ------------------------------------------------------------------------------------------------ his facing and turn
/** his facing after the stop (eased keys; the walk gives it before): square to the step, to her on 她说, to the grave
 *  in F50, square to the step again for the pick-up, to her for F51 (each a 16-frame turn, the short way round) */
const facingAt = (f: number, L: Leg) => f < B.stop + 6 ? L.facing : ky(f, [
  [B.stop + 6, F_STEP], [WD.said, F_STEP], [WD.said + 16, F_HER], [B.turn, F_HER], [B.turn + 16, F_GRAVE],
  [B.wipe - 16, F_GRAVE], [B.wipe - 4, F_WIPE], [P0 - 8, F_WIPE], [P0, F_STEP], [B.smile, F_STEP], [B.smile + 16, F_HER],
]);
/** THE BACK VIEW (rig `turn`): 0 = his body and face turned to her lens (the face stays within 12 deg of the lens),
 *  1 = his true facing (a back view). From the angle between his facing and her lens: 0 up to 120 deg, 1 from 136 deg
 *  (his facing crosses that in a few frames on every turn); during the reveal a time ramp on AWAY (see the header);
 *  held at 1 from the end of F50's turn to the grave until he turns back to her (the wipe at 115 deg included) */
const turnFor = (f: number, facing: number, at: THREE.Vector3, cam: CamPose) => {
  if (f >= B.stop - 20 && f < WD.said) return smooth(clamp01((f - AWAY) / 5));
  if (f >= B.turn + 16 && f < B.smile) return 1;
  const c = cam.pos as [number, number, number], off = Math.abs(wrapA(facing - Math.atan2(c[0] - at.x, c[2] - at.z)));
  return clamp01((off - 120 * DEG) / (16 * DEG));
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
/** expressions on the words (capWord / lineId / BEAT) */
const EXPR: [number, NonNullable<RigState["expr"]>][] = [
  [S.from, "smile"], [WD.riddle - 14, "smug"], [B.pat, "grin"], [WD.what, "happy"], [F42.from, "smug"], [WD.no1, "grin"],
  [F44.from, "smug"], [WD.no2, "happy"], [B.stop + 10, "smile"], [AWAY, "smile_closed"], [WD.outOfStep, "happy"],
  [B.laugh, "laugh"], [B.laugh + 22, "smile_closed"], [F47.from + 20, "neutral"], [WD.onlyHer, "smile_closed"],
  [lineId("F49").from, "neutral"], [WD.died, "sad"], [F50.from + 30, "pained"], [F50.to + 8, "sad"],
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
    const L = leg(f), cam = camF(f);
    const sink = crouchAt(f), at0 = f < B.stop ? L.at : STOP.clone();
    const facing = facingAt(f, L), turn = turnFor(f, facing, at0, cam);
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
      const eyes = hd.clone().add(V(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(0.28)).add(V(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(-0.11 + across)).add(V(0, -0.03, 0));
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

    const shot = f < B.stop ? "walk" : f < WD.said ? "reveal" : f < B.push[0] ? "stop" : f <= B.push[1] ? "push" : f < B.smile ? "after" : "smile";
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: `F ${shot} turn ${turn.toFixed(2)}` };
  },
};
