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
//       his gown: no time); her right hand on the chair's top rail (it stands out from the wall on his left) shoves
//       it (the scrape: C06 start - 0.7 s), lets go, and it slides on against the backs of his knees; she steps back:
//       21 「坐下写嘛。」 He waves it away over his shoulder without looking; 22 "No time." He writes on; her eyes go
//       to the empty chair.
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN_INK, NEWTON_HIDE } from "../people";
import { RMX, ROOM, ROOM_CAMS, ROOM_SET, GDX, GARDEN, GARDEN_SET, EYE } from "../layout";
import { CHAIR } from "../props";
import { rel, hang, lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, type Rig, type RigPose } from "./common";
import { V, sec, frameOn, mixCam, stride, lagged, whipUp, whipSmearUp, nibAt, quillFist, QROT, posOf } from "./segC_parts";
import type { World } from "../world";

const S = SEGMENTS[2];
const L1 = line("C01"), L4 = line("C04"), L5 = line("C05"), L6 = line("C06"), L7 = line("C07");

// ---------------------------------------------------------------------------------------------------- the beats
/** the cut from the noon plate to the garden */
const T_GARDEN = BEAT.C.garden;
/** "Two laps is—": the lecturing hand comes out on "Two", beats on "laps" */
const T_HAND = L4.from - 4, T_LAPS = capWord("C04", "laps").from;
/** HE STOPS DEAD on the cut-off (the gravel under him fades out with it) */
const T_STOP = BEAT.C.stop;
/** the gravel run (the mix's anchor, C04 end + 0.25 s): he turns on his heel just before it */
const T_RUN = L4.to + sec(0.25);
const T_TURN0 = T_RUN - 7, T_TURN1 = T_RUN + 3;
/** she sets off after him */
const T_CHASE = L5.to - sec(0.55);
/** THE WHIP UP (the whoosh, C05 end + 0.1 s): 6 frames out of the garden, the cut, 6 frames into the room */
const T_WHIP = L5.to + sec(0.1);
const WHIP_OUT = 6, WHIP_IN = 6;
const T_CUT = T_WHIP + WHIP_OUT;
/** the chair (the scrape, C06 start - 0.7 s, loud for 0.65 s): her hand shoves it for a few frames (speeding it up)
 *  and lets go; it slides on by itself, slowing, and stops against the backs of his knees */
const T_DRAG0 = L6.from - sec(0.7), T_DRAG1 = T_DRAG0 + sec(0.68);
const SHOVE = 0.35, T_LET = Math.round(lerp(T_DRAG0, T_DRAG1, SHOVE)), T_GONE = T_LET + 10;
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
/** her floor point in the garden: backwards in front of him (a little late), stopping with him, then after him */
const herGarden = (f: number) => {
  const g = Math.min(f, T_STOP + 6);
  const p = lagged(g, (k) => gardenNewton(Math.min(k, T_STOP)).at, 7).add(V(0.12, 0, DIST(g)));
  if (f <= T_CHASE) return p;
  // the chase: up the east walk toward the crossing, a trot
  const k = stride(clamp01((f - T_CHASE) / (T_CUT + 8 - T_CHASE)), 0.4);
  return p.lerp(V(GDX + GARDEN_SET.walks.east - 0.25, 0, GARDEN_SET.walks.cross + 0.9), k * 0.8);
};
/** her eyes in the garden: on his eyes (a little late), his eyes a little right of the middle and high */
const gardenCam = (f: number): CamPose => {
  const p = herGarden(f), pos = V(p.x, EYE, p.z);
  const eye = lagged(f, (k) => eyesOf(gardenNewton(k).at), f < T_STOP ? 5 : 4);
  // while he runs off, the frame keeps him a little below the middle third (the range front above him)
  const sy = ky(f, [[T_RUN, 600], [T_RUN + sec(0.8), 700]]), sx = ky(f, [[T_RUN, 560], [T_RUN + sec(0.8), 540]]);
  const cam = frameOn(pos, eye, sx, sy);
  return C.handheld(cam, f, { walk: [[T_GARDEN, 0.75], [T_STOP - 2, 0.75], [T_STOP + 8, 0], [T_CHASE, 0], [T_CHASE + 6, 1.3]] });
};
/** NEWTON's expressions in the garden (swaps under blinks): dry on his "I am out.", lecturing on 19, then the idea */
const G_EXPR: [number, "deadpan" | "stern" | "shock" | "focus"][] = [[S.from, "deadpan"], [T_HAND, "stern"], [T_STOP, "shock"], [T_RUN + 4, "focus"]];
/** his hands: behind his back while he walks; the right one out to lecture on 19 (frozen on the stop), both let go
 *  as he turns to run */
const gardenHands = (f: number, s: NState): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  if (f >= T_RUN) return [null, null];
  const back = (side: 1 | -1) => rel(s.at, s.facing, side * 0.11, 0.6, -0.24);
  const lect = rel(s.at, s.facing, -0.34, 1.04 + 0.035 * Math.sin(Math.PI * clamp01((f - T_LAPS + 2) / 6)), 0.16);
  // out from behind his back round his side (never through the body), up in front of his chest
  const u = clamp01((f - T_HAND) / 10), side = rel(s.at, s.facing, -0.34, 0.66, 0.0);
  let right = u < 0.5 ? back(-1).lerp(side, smooth(u * 2)) : side.lerp(lect, smooth(u * 2 - 1));
  let left = back(1);
  // as he turns on his heel: both hands to where his arms hang, so the run's swing takes over without a jump
  const k = smooth(clamp01((f - T_TURN0) / (T_RUN - T_TURN0)));
  if (k > 0) { right = right.lerp(hang(s.at, s.facing, 0), k); left = left.lerp(hang(s.at, s.facing, 1), k); }
  return [right, left];
};

// ---------------------------------------------------------------------------------------------------- C4 the room
// She is on his LEFT, in the corner past the bookcase, looking along the back wall: his face at the upper left (the
// window and its table far behind him), the chair at the lower right, out from the wall where he pushed it when he got
// up; her RIGHT hand (in from the lower right) drags it back to the wall and shoves it in behind his knees; her mic stays
// at the lower left on him, clear of the chair.
/** he stands 10 cm nearer the desk than his morning mark and 3 cm to his right (bent over the page: his gown's hem
 *  clear of the chair's front legs at the backs of his knees, his front clear of the papers at the desk's edge), the
 *  sheets 6 cm further onto the desk with him */
const N_AT = ROOM.newtonDesk.clone().add(V(-0.03, 0, 0.1)), N_FACING = ROOM.deskFacing;
/** his head's middle while he leans over the page (the lean carries it forward of his floor mark) */
const N_HEAD = N_AT.clone().add(V(0, 1.19, 0.12));
/** the chair: on the cut out from the wall on his left, a little askew; it ends square behind him, its back a few
 *  millimetres off the skirting */
const CH0 = ROOM.chair.clone().add(V(0.6, 0, 0.32)), CH1 = ROOM.chair.clone().add(V(-0.03, 0, -0.006)), ROT0 = -0.2;
/** 0..1 along its way: speeding up under her hand (to SHOVE), then sliding on, slowed by the floor */
const dragK = (f: number) => {
  const t = clamp01((f - T_DRAG0) / (T_DRAG1 - T_DRAG0)), r = SHOVE;
  return t < r ? (t * t) / r : r + 2 * (t - r) - ((t - r) * (t - r)) / (1 - r);
};
/** it heads back toward the wall faster than along it (its front legs never sweep through his gown) */
const chairAt = (f: number) => {
  const k = dragK(f), kz = 1 - (1 - k) ** 2.5, jud = 0.005 * Math.sin(Math.PI * k) * Math.sin((f - T_DRAG0) * 2.1);
  return V(lerp(CH0.x, CH1.x, k) + jud, 0, lerp(CH0.z, CH1.z, kz));
};
const chairRot = (f: number) => ROT0 * (1 - dragK(f)) ** 2;
/** her grip on the top rail: a hand's width off its middle toward her */
const GRIP_ALONG = 0.07;
const railGrip = (p: THREE.Vector3, yaw: number) => {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), r = CHAIR.rail, s = r[0] + GRIP_ALONG;
  return { at: V(p.x + s * cy + r[2] * sy, r[1] + 0.06, p.z - s * sy + r[2] * cy), along: V(cy, 0, -sy) };
};
/** her eyes in the room: A = on the cut (his face at the upper left, the chair and her hand at the lower right);
 *  B = leaning after the chair as she shoves it; M = straightened, back in the corner (his face, the chair at his
 *  knees) for 21 and 22; E = her eyes drifting right onto the empty chair */
const CAM_A = frameOn(V(RMX + 1.95, 1.48, -2.45), N_HEAD, 270, 410);
const CAM_B = frameOn(V(RMX + 1.88, 1.44, -2.44), N_HEAD, 205, 420);
const CAM_M = frameOn(V(RMX + 2.03, EYE, -2.45), N_HEAD, 330, 470);
const CAM_E = frameOn(V(RMX + 2.03, EYE, -2.45), N_HEAD, 250, 450);
const roomCam = (f: number): CamPose => {
  const lean = stride(clamp01((f - T_DRAG0 + 2) / (T_LET + 2 - T_DRAG0)));
  const back = stride(clamp01((f - T_BACK0) / (T_BACK1 - T_BACK0)));
  const drift = stride(clamp01((f - T_DROOP) / sec(1.1)));
  const cam = mixCam(mixCam(mixCam(CAM_A, CAM_B, lean), CAM_M, back), CAM_E, drift);
  return C.handheld(cam, f, { walk: [[T_DRAG0, 0], [T_DRAG0 + 3, 0.3], [T_LET + 2, 0.3], [T_BACK0 + 3, 0.3], [T_BACK1 - 3, 0.3], [T_BACK1, 0]] });
};
/** NEWTON bent over the desk: the "haul" pose run backwards leans him forward over the page (the rig's only forward
 *  lean), breathing a little (its heave) */
const LEAN = 0.18;
const leanPose = (f: number): RigPose => ({ kind: "haul", t: 0, phase: 0.03 * Math.sin((2 * Math.PI * 0.23 * f) / FPS), amount: -LEAN });
/** where his nib writes: on the sheets, toward their right (his right arm reaches out beside him, not across him) */
const PAGE = ROOM.deskWrite.clone().add(V(-0.04, 0, 0.03));
const quillHand = (f: number) => quillFist(nibAt(f, PAGE, 1));
/** THE WAVE: his left hand (her side) comes off the page and flaps back over his shoulder toward the chair twice, his
 *  eyes on the page; 0..1 how far it is out */
const waveK = (f: number) => (f < T_WAVE0 || f > T_WAVE1 ? 0 : Math.sin(Math.PI * clamp01((f - T_WAVE0) / (T_WAVE1 - T_WAVE0))) ** 0.6);
const leftHand = (f: number) => {
  const rest = ROOM.deskWrite.clone().add(V(0.21 + 0.004 * Math.sin(f * 0.031), 0.06, 0.01 + 0.003 * Math.sin(f * 0.023 + 1)));
  const k = waveK(f);
  if (k <= 0) return rest;
  const u = clamp01((f - T_WAVE0) / (T_WAVE1 - T_WAVE0)), flick = Math.max(0, Math.sin(2 * Math.PI * 2 * clamp01((u - 0.15) / 0.7)));
  return rest.lerp(rel(N_AT, N_FACING, 0.3, 1.0 + 0.03 * flick, -0.2 - 0.14 * flick), k);
};
/** absorbed on the page all through (his eyes never leave it) */
const R_EXPR: [number, "focus"][] = [[S.from, "focus"]];

// ---------------------------------------------------------------------------------------------------- the shot
const mouthOf = (r: Rig) => r.headWorld().add(V(0, -0.1, 0));

const posePlate = (w: World, f: number): Pose => {
  w.setPlace("room");
  w.set.param("hour", "noon");
  const cam = C.creep(CAM_PLATE, f, S.from, T_GARDEN, 0.07);
  w.setCamera(cam);
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, t: f / FPS });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: 3 });
  w.prop("chair").put(CH0, { rot: ROT0 });
  w.update();
  return { camera: cam, post: { dof: { focus: posOf(cam).distanceTo(ROOM.plate), amount: 4 } }, slate: "C1 plate" };
};

const poseGarden = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("garden");
  w.set.param("time", "noon");
  const base = gardenCam(f);
  const Wh = whipUp(base, f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  const s = gardenNewton(f);
  const n = w.actor(NEWTON_GOWN_INK);
  const q = f < T_STOP ? saying("nt", f) : null, sp = q ? speak(q, f, 1) : {};
  const turnBack = ky(f, [[T_TURN0 + 3, 0], [T_RUN + 12, 1]]);
  n.set({
    at: s.at, facing: s.facing, pose: s.pose, expr: at(f, G_EXPR), blink: lid(t, 1, swaps(G_EXPR)), ...sp,
    head: heads(sp.head, accent("jolt", f, T_STOP, { amp: 0.6 })),
    gaze: f >= T_STOP && f < T_RUN ? -0.5 : 0, turn: turnBack > 0 ? turnBack : undefined,
    hands: gardenHands(f, s), hide: NEWTON_HIDE, visible: true,
  });
  w.update();
  // HER MIC: in from the cut, held toward his mouth all the way (it follows him as he runs off)
  const M = C.putMic(w, cam, f, { aim: mouthOf(n) });
  const post = Wh.post ?? (M.dof ? { dof: M.dof } : undefined);
  return { camera: cam, post, overlays: whipSmearUp(Wh.smear), slate: f < T_STOP ? "C2 walk" : "C3 run" };
};

const poseRoom = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "noon");
  const Wh = whipUp(gardenCam(f), f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  // NEWTON: bent over the desk, writing standing; the wave; "No time." (his mouth only on his own line)
  const n = w.actor(NEWTON_GOWN_INK);
  const q = saying("nt", f), sp = q ? speak(q, f, 1) : {};
  n.set({
    at: N_AT.clone(), facing: N_FACING, pose: leanPose(f), expr: at(f, R_EXPR), blink: lid(t, 1), ...sp,
    head: heads(sp.head, accent("shake", f, L7.from, { amp: 0.45 })),
    lookDown: 36, gaze: 0, hands: [quillHand(f), leftHand(f)], hide: NEWTON_HIDE, visible: true,
  });
  // the room's things: the plate and its lid, the desk's paper, THE CHAIR
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, t });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite.clone().add(V(0, 0, 0.06)), { n: 3 });
  const ch = chairAt(f), rot = chairRot(f);
  w.prop("chair").put(ch, { rot });
  w.update();
  w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT });

  // HER RIGHT HAND on the chair's top rail from the cut: it drags, shoves, lets go and goes out at the lower right
  if (f < T_GONE) {
    const g = railGrip(ch, rot);
    let H = C.freeHand(cam, g.at, { bar: g.along });
    if (f > T_LET) {
      // let go where it shoved (still carried a little by its swing), then off the frame's lower right corner
      // (its follow-through: a few centimetres on after the chair, which runs away from it)
      const F = C.camFrame(cam), k = smooth((f - T_LET) / (T_GONE - T_LET)), g0 = railGrip(chairAt(T_LET), chairRot(T_LET));
      const q0 = C.fromScreen(F, 1320, 1900, 0.42), out = C.camToWorld(F, q0.x, q0.y, q0.z), fol = smooth(Math.min(1, k * 3));
      H = C.freeHand(cam, g0.at.clone().add(V(-0.03 * fol, 0.06 * smooth(Math.min(1, k * 10)), 0)).lerp(out, easeInCubic(k)), { bar: g0.along });
    }
    w.prop("handR").put(H.at, { rot: H.rot, pose: H.pose });
  }
  // HER MIC toward his mouth; her arm relaxes once he has said "No time." (it sinks out at the lower left)
  const enter = ky(f, [[T_DROOP, 1], [T_DROOP + 22, 0]]);
  const M = C.putMic(w, cam, f, { aim: mouthOf(n), enter });
  const post = Wh.post ?? (M.dof ? { dof: M.dof } : undefined);
  return { camera: cam, post, overlays: whipSmearUp(Wh.smear), slate: "C4 room" };
};

const pose = (w: World, f: number): Pose => (f < T_GARDEN ? posePlate(w, f) : f < T_CUT ? poseGarden(w, f) : poseRoom(w, f));

export const SEG: Segment = { id: "C", from: S.from, to: S.to, enter() {}, exit() {}, pose };
