// SEGMENT C · 中午 · the noon plate, the garden walk, the whip upstairs, the chair (PLAN 7 C; script scene 3, lines
// 16-22 = C01-C07). WP5-C. The camera moves only because people move (her eyes at 1.6 m); every frame is a pure function
// of f; every time comes from line() / capWord() / BEAT / the mix's anchors (sound/SYNC_POINTS.md).
//   C1  THE PLATE (the day's clock, second tick): close on the window table in hard noon light (ROOM_CAMS.plate, fov
//       50), the lid off and set down beside it (where Humphrey left it in B), no steam, the window bars' short sharp
//       shadows across the cloth; a slow push in.
//   C2  THE GARDEN WALK (one take): NEWTON in his gown comes down the east walk toward her, hands behind his back; she
//       walks BACKWARDS in front of him, the mic in (16 「您从来不出去玩吗？」 17 "I am out." 18 「绕两圈就算玩？」). On
//       19 "Two laps is—" his right hand comes out to lecture, and on the cut-off he STOPS DEAD at the crossing (eyes
//       wide, mouth still open on the word, staring at nothing; the gravel stops with him).
//   C3  he turns on his heel and RUNS west along the cross walk for his staircase door (the gravel run, on the mix's
//       anchor C04 end + 0.25 s); her eyes follow him (20 「诶？他想到什么了？」), she sets off after him and the camera
//       WHIPS UP the range front toward his window: the whip IS the cut (the whoosh: C05 end + 0.1 s).
//   C4  HIS ROOM (one take): the whip arrives from below on him already writing, bent over the desk, STANDING (still in
//       his gown: no time); the chair (it stands out from the wall on his left) is SHOVED BY AN INVISIBLE HAND (the
//       scrape: C06 start - 0.7 s): it lurches, tips onto its leading legs (the near ones lift 3 cm, as a chair does
//       when you push it by the top rail), judders along on the scrape's grain (stick-slip), and drops back onto
//       four legs against the backs of his knees with a little rock; the camera leans after it as she pushes, then
//       steps back: 21 「坐下写嘛。」 He waves it away over his shoulder without looking; 22 "No time." He writes on;
//       her eyes go to the empty chair.
// SHE IS INVISIBLE (Jay, 14 Nov): no mic and no hand are put; the lens keeps the light focus on his mouth that the mic
// used to give.
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN_INK, NEWTON_HIDE } from "../people";
import { RMX, ROOM, ROOM_CAMS, ROOM_SET, GDX, GARDEN, GARDEN_SET, EYE } from "../layout";
import { CHAIR } from "../props";
import { rel, hang, lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, type Rig, type RigPose } from "./common";
import { V, sec, frameOn, mixCam, stride, lagged, whipUp, nibAt, quillFist, quillRot, posOf } from "./segC_parts";
import type { World } from "../world";

const S = SEGMENTS[2];
const L1 = line("C01"), L4 = line("C04"), L5 = line("C05"), L6 = line("C06"), L7 = line("C07");

// ---------------------------------------------------------------------------------------------------- the beats
/** the cut from the noon plate to the garden */
const T_GARDEN = BEAT.C.garden;
/** "Two laps is—": he lifts his chin to lecture on "Two" (hands still behind his back), bobs his head on "laps" */
const T_HAND = L4.from - 4, T_LAPS = capWord("C04", "laps").from;
/** HE STOPS DEAD on the cut-off (the gravel under him fades out with it): his eyes go off her, up and to frame left
 *  (his window, his staircase), held about 0.3 s before he turns */
const T_STOP = BEAT.C.stop;
/** the gravel run (the mix's anchor, C04 end + 0.25 s): he turns on his heel just before it (a quick turn, after the
 *  held stare) */
const T_RUN = L4.to + sec(0.25);
const T_TURN0 = Math.max(T_RUN - 7, T_STOP + sec(0.3)), T_TURN1 = T_RUN + 3;
/** she sets off after him */
const T_CHASE = L5.to - sec(0.55);
/** THE WHIP UP (the whoosh, C05 end + 0.1 s): 6 frames out of the garden, the cut, 6 frames into the room */
const T_WHIP = L5.to + sec(0.1);
const WHIP_OUT = 6, WHIP_IN = 6;
const T_CUT = T_WHIP + WHIP_OUT;
/** the chair (sfx_chair from C06 start - 0.7 s: its scrape runs from +1 to +20 frames, grain peaks at +2, +5 and
 *  +13..15): the invisible push lurches it on +1, it judders along, and its lifted legs drop back on +17 (the rock to
 *  +23); her body's push ends on +12 (the camera stops leaning after it) */
const T_DRAG0 = L6.from - sec(0.7);
const T_PUSH0 = T_DRAG0 + 1, T_LAND = T_DRAG0 + 17, T_ROCK = T_LAND + 6;
const T_LET = T_DRAG0 + 12;
/** she straightens and steps back while she coaxes (21) */
const T_BACK0 = T_LET + 2, T_BACK1 = L6.from + sec(0.8);
/** he waves the chair away without looking (into 22 "No time.") */
const T_WAVE0 = L7.from - 8, T_WAVE1 = L7.from + sec(0.6);
/** her mic arm relaxes after 22 and her eyes go to the empty chair */
const T_DROOP = L7.to + 8;

// ---------------------------------------------------------------------------------------------------- C1 the plate
const T = ROOM_SET.table;
/** where Humphrey set the lid down in B (the table's right end, dome up), and the plate's turn there */
const LID_DOWN = V(RMX + T.x + 0.29, ROOM.tableTop + 0.002, T.z + 0.07);
const PLATE_ROT = yawTo(V(RMX + T.x + 0.23, 0, T.z + 0.44), ROOM.plate);
const CAM_PLATE: CamPose = { pos: ROOM_CAMS.plate.pos, look: ROOM_CAMS.plate.look, fov: ROOM_CAMS.plate.fov };

// ---------------------------------------------------------------------------------------------------- C2-C3 the garden
const N_EYE = 1.14;
const eyesOf = (p: THREE.Vector3, e = N_EYE) => p.clone().add(V(0, e, 0));
/** his walk down the east walk toward her: he is mid-stride on the cut and reaches the crossing on the stop */
const WALK = [GARDEN.walkFrom, GARDEN.walkTo];
const T_WALK0 = T_GARDEN - sec(0.6);
const WALK_SPEED = walkTime(WALK, 1) / ((T_STOP - T_WALK0) / FPS);
/** his run: west along the cross walk to his staircase door (on its threshold step by the cut) */
const RUN = [GARDEN.cross, GARDEN.runTo];
const RUN_LEN = walkTime(RUN, 1), RAMP = 0.45, T_ARRIVE = T_CUT + 1;
const RUN_V = RUN_LEN / ((T_ARRIVE - T_RUN) / FPS - RAMP / 2);
/** metres run by time t (s): a ramp up over RAMP s, then the top speed */
const runD = (t: number) => (t <= 0 ? 0 : t < RAMP ? (RUN_V * t * t) / (2 * RAMP) : RUN_V * (t - RAMP / 2));
const W_FACING = -Math.PI / 2;
type NState = { at: THREE.Vector3; facing: number; pose: RigPose; moving: boolean };
/** where NEWTON is in the garden on frame f */
const gardenNewton = (f: number): NState => {
  const t = f / FPS;
  if (f < T_STOP) { const g = walkAlong(WALK, WALK_SPEED, (f - T_WALK0) / FPS); return { at: g.at, facing: g.facing, pose: g.pose, moving: true }; }
  const turnK = easeInOutCubic(clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0)));
  const facing = lerpA(0, W_FACING, turnK);
  if (f < T_RUN) return { at: GARDEN.walkTo.clone(), facing, pose: { kind: "idle", t }, moving: false };
  const d = runD((f - T_RUN) / FPS), g = walkAlong(RUN, RUN_V, d / RUN_V);
  return { at: g.at, facing: f < T_TURN1 ? facing : g.facing, pose: g.moving ? g.pose : { kind: "idle", t }, moving: g.moving };
};
/** how far she stands in front of him while she walks backwards (he gains on her a little) */
const DIST = (f: number) => ky(f, [[T_GARDEN, 3.3], [L4.from, 2.55]]);
/** as he bolts she steps back and to her left (west, toward the bed's edge): the clipped cone at the bed's corner
 *  (between her and his run) then wipes across early and leaves at the frame's right edge while he runs */
const STEP_ASIDE = V(-0.52, 0, 0.62);
/** her floor point in the garden: backwards in front of him (a little late), stopping with him, a startled step
 *  aside as he runs, then after him */
const herGarden = (f: number) => {
  const g = Math.min(f, T_STOP + 6);
  const p = lagged(g, (k) => gardenNewton(Math.min(k, T_STOP)).at, 7).add(V(0.12, 0, DIST(g)));
  p.addScaledVector(STEP_ASIDE, stride(clamp01((f - T_TURN0) / (T_RUN + sec(0.7) - T_TURN0))));
  if (f <= T_CHASE) return p;
  // the chase: up the east walk toward the crossing, a trot
  const k = stride(clamp01((f - T_CHASE) / (T_CUT + 8 - T_CHASE)), 0.4);
  return p.lerp(V(GDX + GARDEN_SET.walks.east - 0.25, 0, GARDEN_SET.walks.cross + 0.9), k * 0.8);
};
/** her eyes in the garden: on his eyes (a little late), his eyes a little right of the middle and high */
const gardenCam = (f: number): CamPose => {
  const p = herGarden(f), pos = V(p.x, EYE, p.z);
  const eye = lagged(f, (k) => eyesOf(gardenNewton(k).at), f < T_STOP ? 5 : 4);
  // while he runs off, the frame keeps him a little below the middle third (the range front above him), a little
  // right of the middle (the cone's side stays the frame's edge)
  const sy = ky(f, [[T_RUN, 600], [T_RUN + sec(0.8), 700]]), sx = ky(f, [[T_RUN, 560], [T_RUN + sec(0.8), 600]]);
  const cam = frameOn(pos, eye, sx, sy);
  return C.handheld(cam, f, { walk: [[T_GARDEN, 0.75], [T_STOP - 2, 0.75], [T_STOP + 8, 0], [T_CHASE, 0], [T_CHASE + 6, 1.3]] });
};
/** NEWTON's expressions in the garden (swaps under blinks): dry on his "I am out.", lecturing on 19, then the idea */
const G_EXPR: [number, "deadpan" | "stern" | "shock" | "focus"][] = [[S.from, "deadpan"], [T_HAND, "stern"], [T_STOP, "shock"], [T_RUN + 4, "focus"]];
/** his hands: behind his back all through the walk and the lecture (the script's walk; 19's lecture is his chin and a
 *  head bob); as he turns on his heel they come out to his sides */
const gardenHands = (f: number, s: NState): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  if (f >= T_RUN) return [null, null];
  const back = (side: 1 | -1) => rel(s.at, s.facing, side * 0.11, 0.6, -0.24);
  // as he turns on his heel: both hands to where his arms hang, round his sides (never through the body), so the
  // run's swing takes over without a jump
  const k = smooth(clamp01((f - T_TURN0 + 3) / (T_RUN - T_TURN0 + 3)));
  const hand = (side: 1 | -1, arm: 0 | 1) => {
    const mid = rel(s.at, s.facing, side * 0.24, 0.6, -0.08);
    return k < 0.5 ? back(side).lerp(mid, smooth(k * 2)) : mid.lerp(hang(s.at, s.facing, arm), smooth(k * 2 - 1));
  };
  return [hand(-1, 0), hand(1, 1)];
};
/** his head in the garden: the chin up to lecture on 19 (a bob on "laps"), then THE STARE: the head up a little
 *  more, eyes off her toward frame left, held until the turn, level again as he turns */
const gardenLook = (f: number) => {
  const chin = ky(f, [[T_HAND, 0], [T_HAND + 8, -14], [T_STOP, -14], [T_STOP + 3, -22], [T_TURN0, -22], [T_TURN1, 0]]);
  const gaze = f >= T_STOP && f < T_TURN1 ? -1 : 0;
  return { lookDown: chin, gaze, head: heads(accent("nod", f, T_LAPS, { amp: 1.3 }), accent("jolt", f, T_STOP, { amp: 0.6 }), f >= T_STOP + 2 && f < T_TURN0 + 2 ? { dy: 0.06 } : undefined) };
};

// ---------------------------------------------------------------------------------------------------- C4 the room
// She is on his LEFT, in the corner past the bookcase, looking along the back wall: he stands turned a little toward
// her (his left), so his face is a 3/4 and THE PAGE he writes on lies on her side of him (the loose sheet on the set's
// open book, in front of his left shoulder), the white quill standing up off it at the frame's left; the window and its
// table far behind him; the chair at the lower right, out from the wall where he pushed it when he got up; her RIGHT
// hand (in from the lower right) shoves it back in behind his knees; her mic is DOWN while nobody speaks (from the
// whip until just before 21), up on him for 21 and 22, then down again. A WIDER LENS here (C4_FOV): from the only
// corner where her hand reaches the chair she cannot stand further back, so the lens keeps his big toon head inside
// the frame and the chair's top rail in shot at the end.
const C4_FOV = 70;
/** he stands 10 cm nearer the desk than his morning mark and 8 cm to his right (his gown's hem clear of the chair's
 *  front legs at the backs of his knees, his belly clear of the open book's corner), turned N_TURN toward his left
 *  (toward her): the page in front of him */
const N_TURN = 0.6;
const N_AT = ROOM.newtonDesk.clone().add(V(-0.08, 0, 0.1)), N_FACING = ROOM.deskFacing + N_TURN;
/** his head's middle while he leans over the page (the lean carries it forward of his floor mark) */
const N_HEAD = rel(N_AT, N_FACING, 0, 1.19, 0.12);
/** the set's open book on the desk's back band (sets/room.ts: desk middle + (0.2, -0.32), yaw 0.1, its pages 3.65 cm
 *  up): THE LOOSE SHEET lies on it, along it, a little toward him; the nib writes on that sheet */
const BOOK = V(RMX + ROOM_SET.desk.x + 0.2, ROOM.deskTop + 0.0365, ROOM_SET.desk.z - 0.32), BOOK_YAW = 0.1;
const SHEET_AT = BOOK.clone().add(V(-0.03 * Math.cos(BOOK_YAW), 0.0003, 0.03 * Math.sin(BOOK_YAW)));
/** the sheets prop's first sheet sits turned -0.166 in it (props/things.ts sheets' fan): this puts it square along
 *  the book */
const SHEET_ROT = Math.PI / 2 + BOOK_YAW + 0.166;
/** where his nib writes (nibAt's page point: lines run 5 cm either side of it, rows from 6 cm toward her to 3.6 cm
 *  away): the middle of the sheet's half on his side */
const PAGE = SHEET_AT.clone().add(V(-0.04, 0.004, -0.012));
/** the chair: on the cut out from the wall on his left, a little askew; it ends square behind him, its back a few
 *  millimetres off the skirting */
const CH0 = ROOM.chair.clone().add(V(0.6, 0, 0.32)), CH1 = ROOM.chair.clone().add(V(-0.08, 0, -0.006)), ROT0 = -0.2;
/** THE STICK-SLIP: the push's speed over its way (a swell from the lurch to the landing) times a judder at the
 *  scrape's grain (3.6 frames a stutter); integrated in quarter frames once (a table: pure), 0..1 along the way */
const JUD_P = 3.6, JUD_K = 0.65;
const DRAG_TAB = (() => {
  const n = (T_LAND - T_PUSH0) * 4, v: number[] = [0];
  for (let i = 1; i <= n; i++) {
    const g = i / 4, u = g / (T_LAND - T_PUSH0), base = Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.04)), 0.7);
    v.push(v[i - 1] + base * Math.max(0, 1 + JUD_K * Math.sin((2 * Math.PI * g) / JUD_P - 0.6)));
  }
  return v.map((x) => x / v[n]);
})();
const dragK = (f: number) => {
  if (f <= T_PUSH0) return 0;
  if (f >= T_LAND) return 1;
  const x = (f - T_PUSH0) * 4, i = Math.floor(x);
  return lerp(DRAG_TAB[i], DRAG_TAB[Math.min(i + 1, DRAG_TAB.length - 1)], x - i);
};
/** its floor point: it heads back toward the wall faster than along it (its front legs never sweep through his gown) */
const pathAt = (k: number) => V(lerp(CH0.x, CH1.x, k), 0, lerp(CH0.z, CH1.z, 1 - (1 - k) ** 2.5));
/** its yaw: squared up as it goes, with a small wobble on the judder */
const chairRot = (f: number) => {
  const k = dragK(f), wob = f > T_PUSH0 && f < T_LAND ? 0.025 * Math.sin((2 * Math.PI * (f - T_PUSH0)) / JUD_P) * Math.sin(Math.PI * k) : 0;
  return ROT0 * (1 - k) ** 2 + wob;
};
/** THE TIP (deg): onto the leading legs as the push lurches it (in 3 frames to 5.5), rocking +-1.2 against the judder
 *  (when it sticks the top runs on), easing off before it lands, the drop on T_LAND; then the rock: it tips back
 *  onto the trailing legs (-1.3) and settles */
const tipAt = (f: number) => {
  if (f <= T_PUSH0) return 0;
  if (f < T_LAND) {
    const up = easeOutCubic(clamp01((f - T_PUSH0) / 3)), off = 1 - easeInCubic(clamp01((f - (T_LAND - 4)) / 4));
    return (5.5 * up - 1.2 * Math.sin((2 * Math.PI * (f - T_PUSH0)) / JUD_P - 0.6) * up) * off;
  }
  if (f < T_ROCK) return -1.3 * Math.sin((Math.PI * (f - T_LAND)) / (T_ROCK - T_LAND));
  return 0;
};
/** where the chair is and how it stands on frame f: the tip turns it about the floor line under its leading legs
 *  (tip > 0: the way it travels) or its trailing legs (tip < 0, the rock), so two feet always stay on the boards */
const LEGS = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => V(sx * (CHAIR.w / 2 - 0.025 + 0.017), 0, sz * (CHAIR.d / 2 - 0.025 + 0.017)));
const chairPut = (f: number) => {
  const k = dragK(f), yaw = chairRot(f), base = pathAt(k);
  const qYaw = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw);
  const tip = tipAt(f);
  if (Math.abs(tip) < 1e-4) return { at: base, rot: qYaw as THREE.Quaternion | number };
  // the way it travels here (the path's tangent; at the landing the last stretch's)
  const kk = Math.min(Math.max(k, 0.02), 0.98), dir = pathAt(kk + 0.02).sub(pathAt(kk - 0.02)).setY(0).normalize();
  const side = tip > 0 ? 1 : -1, ext = Math.max(...LEGS.map((l) => side * l.clone().applyQuaternion(qYaw).dot(dir)));
  const pivot = base.clone().addScaledVector(dir, side * ext);
  const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0).cross(dir).normalize(), (tip * Math.PI) / 180);
  return { at: pivot.clone().add(base.clone().sub(pivot).applyQuaternion(q)), rot: q.multiply(qYaw) as THREE.Quaternion | number };
};
/** her eyes in the room (lens C4_FOV): A = on the cut, bent toward the chair (his face left of the middle, the quill
 *  at the left, the chair and her hand at the lower right); B = leaning after the chair as she shoves it; M =
 *  straightened, back in the corner (his face, the quill, the chair at his knees) for 21 and 22; E = her eyes drifting
 *  right onto the empty chair */
const CAM_A = frameOn(V(RMX + 1.95, 1.42, -2.45), N_HEAD, 430, 560, C4_FOV);
const CAM_B = frameOn(V(RMX + 1.88, 1.38, -2.44), N_HEAD, 380, 560, C4_FOV);
const CAM_M = frameOn(V(RMX + 2.03, EYE, -2.45), N_HEAD, 450, 580, C4_FOV);
const CAM_E = frameOn(V(RMX + 2.02, EYE, -2.5), N_HEAD, 290, 500, C4_FOV);
const roomCam = (f: number): CamPose => {
  const lean = stride(clamp01((f - T_DRAG0 + 2) / (T_LET + 2 - T_DRAG0)));
  const back = stride(clamp01((f - T_BACK0) / (T_BACK1 - T_BACK0)));
  const drift = stride(clamp01((f - T_DROOP) / sec(1.1)));
  const cam = mixCam(mixCam(mixCam(CAM_A, CAM_B, lean), CAM_M, back), CAM_E, drift);
  return C.handheld(cam, f, { walk: [[T_DRAG0, 0], [T_DRAG0 + 3, 0.3], [T_LET + 2, 0.3], [T_BACK0 + 3, 0.3], [T_BACK1 - 3, 0.3], [T_BACK1, 0]] });
};
/** NEWTON bent over the desk: the "haul" pose run backwards leans him forward over the page (the rig's only forward
 *  lean), breathing a little (its heave); his head pitched only a little down (LOOK_DOWN), so from her corner above
 *  him she sees his face, not his crown */
const LEAN = 0.25, LOOK_DOWN = 10;
const leanPose = (f: number): RigPose => ({ kind: "haul", t: 0, phase: 0.03 * Math.sin((2 * Math.PI * 0.23 * f) / FPS), amount: -LEAN });
/** THE QUILL: the feather up and forward off the page, over the desk, on her side of his head (never behind it), its
 *  broad vane turned to her */
const QDIR_C4 = V(-0.3, 0.72, 0.62).normalize();
const QROT_C4 = quillRot(QDIR_C4, posOf(CAM_M).sub(PAGE));
const quillHand = (f: number) => quillFist(nibAt(f, PAGE, 1), QDIR_C4);
/** THE WAVE: his left hand (her side) comes off the sheet's far corner and flaps back over his shoulder toward the
 *  chair twice, his eyes on the page; 0..1 how far it is out */
const waveK = (f: number) => (f < T_WAVE0 || f > T_WAVE1 ? 0 : Math.sin(Math.PI * clamp01((f - T_WAVE0) / (T_WAVE1 - T_WAVE0))) ** 0.6);
/** his left hand holds the sheet down at its far end (toward the wall: frame right of the quill, never in front of it) */
const SHEET_HOLD = SHEET_AT.clone().add(V(0.05, 0.026, -0.075));
const leftHand = (f: number) => {
  const rest = SHEET_HOLD.clone().add(V(0.003 * Math.sin(f * 0.031), 0, 0.003 * Math.sin(f * 0.023 + 1)));
  const k = waveK(f);
  if (k <= 0) return rest;
  const u = clamp01((f - T_WAVE0) / (T_WAVE1 - T_WAVE0)), flick = Math.max(0, Math.sin(2 * Math.PI * 2 * clamp01((u - 0.15) / 0.7)));
  return rest.lerp(rel(N_AT, N_FACING, 0.3, 1.0 + 0.03 * flick, -0.2 - 0.14 * flick), k);
};
/** absorbed on the page all through (his eyes never leave it); flat and dismissive for 22 "No time." (deadpan: level
 *  brows, not the frown of "focus" over a talking mouth, which read angry), the swaps under blinks */
const R_EXPR: [number, "focus" | "deadpan"][] = [[S.from, "focus"], [L7.from - 3, "deadpan"], [L7.to + 6, "focus"]];

// ---------------------------------------------------------------------------------------------------- the shot
const mouthOf = (r: Rig) => r.headWorld().add(V(0, -0.1, 0));
/** the film's light focus (amount 3) on a world point: what the mic's aim used to give */
const lightFocus = (cam: CamPose, p: THREE.Vector3) => ({ focus: Math.max(0.2, posOf(cam).distanceTo(p)), amount: 3 });

const posePlate = (w: World, f: number): Pose => {
  w.setPlace("room");
  w.set.param("hour", "noon");
  const cam = C.creep(CAM_PLATE, f, S.from, T_GARDEN, 0.07);
  w.setCamera(cam);
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, t: f / FPS });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(SHEET_AT, { n: 1, rot: SHEET_ROT });
  w.prop("chair").put(CH0, { rot: ROT0 });
  w.update();
  return { camera: cam, post: { dof: { focus: posOf(cam).distanceTo(ROOM.plate), amount: 4 } }, slate: "C1 plate" };
};

const poseGarden = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("garden");
  w.set.param("time", "noon");
  w.set.param("gravel", "rough");      // the rough raked gravel (sets/garden.ts option, WP5-C): never cream planks
  const base = gardenCam(f);
  const Wh = whipUp(base, f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  const s = gardenNewton(f);
  const n = w.actor(NEWTON_GOWN_INK);
  const q = f < T_STOP ? saying("nt", f) : null, sp = q ? speak(q, f, 1) : {};
  const turnBack = ky(f, [[T_TURN0 + 2, 0], [T_RUN + 12, 1]]);
  const gl = gardenLook(f);
  n.set({
    at: s.at, facing: s.facing, pose: s.pose, expr: at(f, G_EXPR), ...sp,
    // eyes wide through the stare (no blink between the stop's swap and the turn)
    blink: f > T_STOP + 2 && f < T_TURN1 ? 0 : sp.blink ?? lid(t, 1, swaps(G_EXPR)),
    head: heads(sp.head, gl.head), lookDown: gl.lookDown,
    gaze: gl.gaze, turn: turnBack > 0 ? turnBack : undefined,
    hands: gardenHands(f, s), hide: NEWTON_HIDE, visible: true,
  });
  w.update();
  // (no mic: the light focus stays on his mouth as he runs off)
  const post = Wh.post ?? { dof: lightFocus(cam, mouthOf(n)) };
  return { camera: cam, post, slate: f < T_STOP ? "C2 walk" : "C3 run" };
};

const poseRoom = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "noon");
  w.set.param("shaftSoft", 1);         // the noon sun shaft as a soft volume (owner rule: no hard-edged wedge; WP5-B's param)
  const Wh = whipUp(gardenCam(f), f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  // NEWTON: bent over the desk, writing standing; the wave; "No time." (his mouth only on his own line)
  const n = w.actor(NEWTON_GOWN_INK);
  const q = saying("nt", f), sp = q ? speak(q, f, 1) : {};
  // 22 is flat, not angry: the teeth-together shape ("t") becomes the closed slot, so no gritted teeth on "No time."
  if (sp.mouth === "strip") sp.mouth = "pill";
  n.set({
    at: N_AT.clone(), facing: N_FACING, pose: leanPose(f), expr: at(f, R_EXPR), blink: lid(t, 1, swaps(R_EXPR)), ...sp,
    head: heads(sp.head, accent("shake", f, L7.from, { amp: 0.45 })),
    lookDown: LOOK_DOWN, gaze: 0, hands: [quillHand(f), leftHand(f)], hide: NEWTON_HIDE, visible: true,
  });
  // the room's things: the plate and its lid, the desk's paper, THE CHAIR
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, t });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(SHEET_AT, { n: 1, rot: SHEET_ROT });
  const ch = chairPut(f);
  w.prop("chair").put(ch.at, { rot: ch.rot });
  w.update();
  w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT_C4 });

  // (no hand, no mic: the light focus on his mouth)
  const post = Wh.post ?? { dof: lightFocus(cam, mouthOf(n)) };
  return { camera: cam, post, slate: "C4 room" };
};

const pose = (w: World, f: number): Pose => (f < T_GARDEN ? posePlate(w, f) : f < T_CUT ? poseGarden(w, f) : poseRoom(w, f));

export const SEG: Segment = { id: "C", from: S.from, to: S.to, enter() {}, exit() {}, pose };
