// SEGMENT E · 傍晚 · his room, slanting gold evening light (script v5 rows 28-34 = E01-E07 with their two silent rows;
// camplan E with its director notes; the v5 rebuild, 15 Nov). ONE TAKE, no cut inside: in on CLOCK ⑦ (the REC clock
// races over D's held medium and lands 8 frames into E over a still plate), out on WHIP ⑧ after him into the night (E owns
// the outgoing half: the pan right, the smear and the blur, 4 frames up to F's first frame). She is never seen: no mic,
// no hands; what she does moves the lens (she bends over the plate, straightens and turns, steps back out of his way,
// steps in to the plate, walks to his desk, flinches 5 cm). Her eye is 1.52 m over the floor, with a dip on each of her
// footfalls while she walks and nothing in the holds. Still is the default; every move has a reason and lands on its
// anchor (beats.ts BEAT.E on SYNC_POINTS; every frame below is looked up from the timing, never typed):
//   OPEN  HOLD        the cold dinner in the gold light, a fly walking on the chop (the race lands over it)
//   M1    PUSH IN     she bends in to the fly (something has landed on his dinner), landing on 您
//   M2    SWING       25 frames (director note 1: the approved length and its tilt-first HUD fix), landing on 吃: the
//                     culprit, at his desk reading a page in his left hand; NO-LOOK (v5): on 吃 a 4-frame head jolt,
//                     the eyes stay on the page
//   M3    FOLLOW      "Have I not?" (a head jolt, the eyes slit and on the page): he walks to the table, page in hand;
//                     she steps back out of his way to the table's other side and the lens follows him, landing as the
//                     fork goes into his fist; the TWO-THING holds over the bites (two stabs on the clinks, two bites,
//                     eyes on the page): the plate low left in the lunch bar's zone, his face high right
//   M4    STEP IN     he lays the fork down and walks off to his desk; she steps in and bends over the plate (someone
//                     leaves; she looks at the evidence), her two footfalls on the sound's steps 1 and 2, landing on 您
//                     of E03: two bites gone, held under 「您是不是」
//   M5    TURN, WALK  to the front of his desk's left end (the speaker changes; we chase), landing on 朋; the left
//                     pile at the bottom-left corner
//   HOLD              the close: "Friends interrupt." with LOOK 2/4 on "interrupt" (full dots, lids half down, a hair of
//                     a lean: the lens holds, she flinches 5 cm), back to his page on 讨
//   M6    SNAP ZOOM   6 frames to the scene's one EXTREME CLOSE, landing on "Hooke" (the head up, chin +2, eyes to the
//                     side; pop and nod at half strength); then nothing moves: THE CRACK (cool, 12 f, no sound)
//   悄悄说            E07 whisperLean: a 3 deg tip only (the lens is at its closest: no step), held to the end; he
//                     writes on, oblivious; on the line's tail he lays the quill down (its knock), takes his candle and
//                     walks out of the frame to his left (screen right): whip ⑧'s reason
//   WHIP ⑧            the outgoing half after him, panning RIGHT (OVERVIEW F note 6: the geography allows it here)
// Every frame is a pure function of f.
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT, JOINS } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE, NEWTON_HIDE_WRITING, NEWTON_LEAN, newtonEyes, facePoint } from "../people";
import { RMX, ROOM } from "../layout";
import { flyAt } from "../props";
import { whisperLean, whisperSpan } from "../whisper";
import { lid, speak, saying, accent, heads, headPop, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, rel, CHAIR_ASIDE, type Rig, type RigPose, type RigHead, type RigState } from "./common";
import { V, sec, mixCamYP, aimMix, footBob, stride, lagged, nibAt, quillFist, QROT, quillLying, pagePut, forkRot, FORK_TIP, posOf, putMorsel, morselOff } from "./segE_parts";
import type { World } from "../world";

const S = SEGMENTS[4];
const E = BEAT.E;
const L1 = line("E01"), L2 = line("E02"), L3 = line("E03"), L4 = line("E04"), L5 = line("E05"), L6 = line("E06"), L7 = line("E07");
const J7 = JOINS.find((j) => j.n === 7)!, J8 = JOINS.find((j) => j.n === 8)!;
const W7 = whisperSpan("E07");
/** a moment `s` seconds after line id's voice STARTS / ENDS, as the sound writes it (cues.json [id, "start" | "end", s]) */
const startAt = (id: string, s: number) => Math.round((line(id).start + s) * FPS);
const endAt = (id: string, s: number) => Math.round((line(id).end + s) * FPS);
const word = (id: string, w: string) => capWord(id, w).from;

// ---------------------------------------------------------------------------------------------------- the beats
/** OPEN: still while clock ⑦ races (it lands RACE_POST frames into E); the PUSH IN to the fly lands on 您 */
const T_PUSH0 = J7.race![1], T_PUSH1 = E.fly[1];
/** M2, THE SWING: 25 frames landing on 吃 (director note 1), straightened by SWING_TILT of it, the turn over all of it */
const T_CULPRIT = E.culprit, T_SWING1 = T_CULPRIT, T_SWING0 = T_CULPRIT - 25;
const SWING_TILT = 0.7;
/** the fly leaves the plate (its buzz fades out at E01's end) */
const T_FLYOFF = L1.to + sec(0.3);
/** "Have I not?": the surprise is a head jolt (3 frames before his first word) and he sets off with it */
const T_JOLT2 = E.step - 3, T_WALK0 = E.step - 3;
/** THE TWO BITES on the mix's fork clinks (the stab) and bites (the fork at his lips); the chewing from E02 end + 0.55 */
const T_CLINK1 = E.clink1, T_BITE1 = E.bite1, T_CLINK2 = E.clink2, T_BITE2 = E.bite2, T_CHEW = endAt("E02", 0.55);
/** the second bite's chewing starts as it reaches his mouth */
const T_CHEW2 = T_BITE2 + 2;
/** he reaches the table and takes up the fork (M3 lands on T_GRAB: the fork goes into his fist) */
const T_ARRIVE = T_CLINK1 - 9, T_GRAB = T_ARRIVE + 3;
/** the fork back down where it lay; he lets go and goes back to his desk */
const T_DOWN = T_BITE2 + 7, T_GO = T_DOWN + 1;
/** M4, THE STEP IN to the plate (BEAT twoBites), landing on 您 of E03; her two footfalls on the sound's steps 1 and 2 */
const T_PLATE0 = E.twoBites, T_PLATE1 = word("E03", "您");
const FALLS_IN = [E.walk[0], startAt("E03", 0.10)];
/** M5, THE TURN AND WALK to his desk, 34 frames (1.66 m, about 1.46 m/s) landing on 朋 (BEAT walk's end); her three
 *  footfalls on the way (the sound's third step, f E03 start + 0.55, falls inside the plate hold: rebuild/E/NOTES.md
 *  asks the sound lane to move it to the first of these and add the other two) */
const T_TURN1 = E.walk[1], T_TURN0 = T_TURN1 - 34;
const FALLS_WALK = [T_TURN0 + 8, T_TURN0 + 20, T_TURN1 - 1];
/** LOOK 2/4: the quill stops and his head comes up landing on "interrupt"; back to his page on 讨 */
const T_LOOK = E.look, T_UP0 = T_LOOK - 5, T_DOWN1 = word("E05", "讨");
/** M6, THE SNAP: from E06's first frame (his head comes up off the page) to "Hooke" (6 frames) */
const T_SNAP0 = E.hooke, T_HOOKE = word("E06", "Hooke");
/** THE CRACK: `cool`, one corner of the mouth, 12 frames, once his word is out (no sound, no camera move); then back to
 *  the page */
const T_CRACK0 = T_HOOKE + 7, T_CRACK1 = T_CRACK0 + 12, T_DOWN2 = T_CRACK1;
/** E07's tail: the quill laid down (its knock, E07 end + 0.05), his candle taken, his two steps out (E07 end + 0.25 /
 *  + 0.60), and WHIP ⑧'s outgoing half (out 4 frames up to F's first frame) */
const T_QDOWN = E.quillDown, T_CANDLE = T_QDOWN + 3, T_STEP1 = E.exit[0], T_STEP2 = E.exit[1];
const T_WHIP = E.whipOut, WHIP_OUT = J8.cut - E.whipOut;
/** his pointed look on "interrupt": the eyes full dots under half lids, held until 讨; she flinches 5 cm */
const T_POINT0 = T_LOOK, T_POINT1 = T_DOWN1;

// ---------------------------------------------------------------------------------------------------- the marks
const TT = ROOM.tableTop;
const P = (x: number, z: number, y = 0) => V(RMX + x, y, z);
/** her standing eye (the format: about 1.5 m) */
const EYE_E = 1.52;
/** the plate as segments B and C leave it: turned as Humphrey set it (the cover lies beside it) */
const PLATE_ROT = yawTo(P(-1.2 + 0.23, -2.27 + 0.44), ROOM.plate);
const LID_DOWN = V(RMX - 1.2 + 0.29, TT + 0.002, -2.27 + 0.07);
const rotY = (p: THREE.Vector3, a: number) => V(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
/** a point on the plate (its own frame) in the world */
const onPlate = (x: number, y: number, z: number) => ROOM.plate.clone().add(rotY(V(x, y, z), PLATE_ROT));
/** the chop's top, where the fork goes in (two spots, one per bite) */
const CHOP1 = onPlate(-0.03, 0.036, -0.012), CHOP2 = onPlate(-0.012, 0.036, -0.026);
/** THE FLY: its place on its walk (it walks, stops, walks on, toward the near rim) and its point in the world */
const flyU = (f: number) => ky(f, [[S.from, 0.1], [S.from + sec(0.9), 0.2], [S.from + sec(1.5), 0.2], [S.from + sec(2.5), 0.29], [S.from + sec(3.0), 0.29], [L1.to, 0.36]]);
const flyPos = (f: number) => { const F = flyAt(flyU(f)); return ROOM.plate.clone().add(rotY(F.p, PLATE_ROT)).add(V(0, 0.006, 0)); };
/** the fork where it lies (on the cloth in front of the plate, tines to the left) and its hilt */
const FORK_HILT = P(-1.2 + 0.11, -2.27 + 0.225, TT + 0.0085);
const FORK_REST = forkRot(V(-1, 0, 0));
/** his fist sits this much above the fork's hilt when it picks it up or lays it down (the ball hand on the cloth) */
const GRAB_UP = 0.017;
/** THE MORSEL on the tines: from just after each stab until it is in his mouth */
const morselOn = (f: number) => (f > T_CLINK1 && f < T_CHEW) || (f > T_CLINK2 && f < T_CHEW2);
/** HIS CANDLE on the desk at his left (the ring handle toward his left hand), lit; he takes it into the night (F's
 *  garden opens on it in his left hand, len 0.8) */
const CANDLE_DESK = P(1.0, -1.70, ROOM.deskTop + 0.044), CANDLE_LEN = 0.8;   // standing on the sheets there (their top 0.79)
/** where the quill lies once he has laid it down: beside his page, the feather toward his right */
const QUILL_DOWN_AT = ROOM.deskWrite.clone().add(V(-0.16, 0.004, 0.02)), QUILL_DOWN_ROT = quillLying(V(-0.85, 0, -0.5));

/** NEWTON: at his desk (reading, then writing), where he stands to eat (in front of the table's right end, turned
 *  toward the room), and his way out of the room at the end (round behind the desk to his left) */
const ND = ROOM.newtonDesk, N_EAT = P(-0.95, -1.77), F_EAT = -0.72;
/** his way round: behind the desk's tall left pile (the head is wide), then in front of the table's right end */
const PATH_TO = [ND, P(0.32, -2.2), P(-0.3, -2.02), P(-0.72, -1.73), N_EAT], PATH_BACK = [...PATH_TO].reverse();
const SPEED_TO = walkTime(PATH_TO, 1) / ((T_ARRIVE - T_WALK0) / FPS);
const SPEED_BACK = 1.7;
const T_DESK = T_GO + Math.round(walkTime(PATH_BACK, SPEED_BACK) * FPS);
/** out: along behind the desk to its right end, then toward the room's front past the bookcase (screen right) */
const PATH_OUT = [ND, P(1.6, -1.96), P(1.74, -1.0), P(1.4, 0.4)];   // between the chair and the desk's back-right pile
const T_OUT0 = T_STEP1 - 4, SPEED_OUT = 1.1;
/** his eyes (the aim height people.ts newtonEyes) at a mark */
const eyesAt = (s: { at: THREE.Vector3; facing: number }) => newtonEyes(s.at, s.facing);

type NState = { at: THREE.Vector3; facing: number; pose: RigPose; moving: boolean; where: "desk" | "walk" | "table" | "out" };
const newtonAt = (f: number): NState => {
  const t = f / FPS;
  if (f < T_WALK0) return { at: ND.clone(), facing: ROOM.deskFacing, pose: { kind: "idle", t: t + 1.7 }, moving: false, where: "desk" };
  if (f < T_ARRIVE) {
    const g = walkAlong(PATH_TO, SPEED_TO, (f - T_WALK0) / FPS, { startFacing: 0, endFacing: F_EAT });
    return { at: g.at, facing: lerpA(0, g.facing, smooth(clamp01((f - T_WALK0) / 7))), pose: g.pose, moving: g.moving, where: "walk" };
  }
  if (f < T_GO) { const k = smooth(clamp01((f - T_ARRIVE) / 6)); return { at: N_EAT.clone(), facing: lerpA(yawTo(PATH_TO[3], N_EAT), F_EAT, k), pose: { kind: "idle", t: t + 0.6 }, moving: false, where: "table" }; }
  if (f < T_DESK) {
    const g = walkAlong(PATH_BACK, SPEED_BACK, (f - T_GO) / FPS, { startFacing: F_EAT, endFacing: 0 });
    return { at: g.at, facing: lerpA(F_EAT, g.facing, smooth(clamp01((f - T_GO) / 7))), pose: g.pose, moving: g.moving, where: "walk" };
  }
  if (f < T_OUT0) {
    const k = smooth(clamp01((f - T_DESK) / 6));
    return { at: ND.clone(), facing: lerpA(yawTo(PATH_TO[1], ND), ROOM.deskFacing, k), pose: { kind: "idle", t: t + 1.7 }, moving: false, where: "desk" };
  }
  // out with his candle: he turns to his left as he sets off
  // the walk's bounce eases in over his first steps (its first low point would drop his head 12 cm in a frame, a pop
  // in the extreme close)
  const g = walkAlong(PATH_OUT, SPEED_OUT, (f - T_OUT0) / FPS, { startFacing: ROOM.deskFacing, bounce: smooth(clamp01((f - T_OUT0) / 10)) });
  // and his first step opens from feet together (the walk's full stride on its first frame drops his hip)
  const kS = smooth(clamp01((f - T_OUT0) / 8));
  if (g.pose.kind === "walk") g.pose = { ...g.pose, stride: lerp(0.05, g.pose.stride ?? 0.25, kS) };
  return { at: g.at, facing: lerpA(ROOM.deskFacing, g.facing, smooth(clamp01((f - T_OUT0) / 7))), pose: g.pose, moving: g.moving, where: "out" };
};

// ---------------------------------------------------------------------------------------------------- her eyes
/** OPEN and M1 (the approved insert): bent over the table's front-left, about 48 deg down; the plate fills ~60 % of the
 *  width at the start, the fly is big at the end (tracked, 6 frames late) */
const FLY_DIR = (() => { const u = P(-1.4, -1.55).sub(ROOM.plate).setY(0).normalize(); return u.multiplyScalar(Math.cos(0.84)).add(V(0, Math.sin(0.84), 0)).normalize(); })();
const insertCam = (f: number): CamPose => {
  const k = stride(clamp01((f - T_PUSH0) / (T_PUSH1 - T_PUSH0)), 0.35);
  const fly = lagged(f, flyPos, 6), target = ROOM.plate.clone().add(V(0, 0.03, 0)).lerp(fly, smooth(Math.min(1, k * 1.4)));
  const pos = target.clone().addScaledVector(FLY_DIR, lerp(0.86, 0.17, k));
  return C.aimCam(pos, target, 540, lerp(860, 800, k), C.zoomFov(50, 44, k));
};
/** S_UP: straightened at the table's front-left, turned to him at his desk (his eyes a little right of the middle,
 *  high: the desk's left end and its paper beside him) */
const P2 = P(-1.40, -1.40, EYE_E), S_UP: [number, number] = [600, 560], FOV_UP = 55;
/** B2, THE TWO-THING over the bites: from the table's left side by the wall, across the plate to him (the plate low
 *  left, its far rim in the lunch bar's zone, x 120-900, y 900-1290; his face high right; the page in his left hand
 *  right of his face) */
const B2 = P(-2.08, -0.52, EYE_E), S_B2: [number, number] = [700, 720], FOV_B2 = 64;
/** P4, THE PLATE CLOSE: she bends over the plate from the front (two bites gone; the fork laid back beside it) */
const P4 = P(-1.40, -1.30, 1.40), PLATE_AIM = ROOM.plate.clone().add(V(0, 0.02, 0)), S_PLATE: [number, number] = [540, 780], FOV_PLATE = 36;
/** D1, THE CLOSE in front of his desk's left end (0.45 m in front of its front edge, 23 deg to his right): the left
 *  pile's three shut books sit 0.87 m from the lens and 0.27 m left of its line to his face, so they fall in the
 *  frame's bottom-left corner and not as a dark block under his face (director note 4: the camplan's spot at the front-left corner, 39 deg,
 *  looks straight across the pile, which then fills the bottom centre from y 1030 down); XC the same spot, the longer
 *  lens (the scene's one extreme close) */
const D1 = P(0.05, -0.50, EYE_E), S_D1: [number, number] = [600, 570], FOV_D1 = 56;
const S_XC: [number, number] = [580, 690], FOV_XC = 41;   // "Hooke": crown y ~120, eyes ~570, chin ~900 (the camplan's XC); his exit right then stays above the phone's button column
/** his eyes at the desk (the aim) */
const EYES_DESK = newtonEyes(ND, ROOM.deskFacing);
/** his eyes wherever he is, 3 frames late (her eyes follow a walker a little late) */
const eyesLag = (f: number, win = 3) => lagged(f, (g) => eyesAt(newtonAt(g)), win);
/** her way back out of his way (M3): from P2 round to B2, eased like a walker */
const herM3 = (f: number) => P2.clone().lerp(B2, stride(clamp01((f - T_WALK0) / (T_GRAB - T_WALK0)), 0.3));
const FALLS_M3 = [T_WALK0 + 9, T_WALK0 + 22, T_WALK0 + 34];

/** the camera of frame f, before the whisper, the flinch and the whip */
const baseCam = (f: number): CamPose => {
  // OPEN + M1: the insert
  if (f < T_SWING0) return insertCam(f);
  // M2: THE SWING, straightened first (SWING_TILT of it), the turn over all of it
  if (f < T_SWING1) {
    const u = (f - T_SWING0) / (T_SWING1 - T_SWING0), k = smooth(u);
    return mixCamYP(insertCam(T_SWING0), C.aimCam(P2, eyesLag(f), S_UP[0], S_UP[1], FOV_UP), k, k, smooth(clamp01(u / SWING_TILT)));
  }
  // the look lands; M3 FOLLOW (she steps back out of his way, the lens on him) landing on T_GRAB; the bites held
  if (f < T_PLATE0) {
    const k = easeInOutCubic(clamp01((f - T_WALK0) / (T_GRAB - T_WALK0)));
    return C.aimCam(herM3(f), eyesLag(f), lerp(S_UP[0], S_B2[0], k), lerp(S_UP[1], S_B2[1], k), C.zoomFov(FOV_UP, FOV_B2, k));
  }
  // M4: THE STEP IN to the plate (the aim from him to the plate over its first 14 frames), landing on 您
  if (f < T_TURN0) {
    const u = clamp01((f - T_PLATE0) / (T_PLATE1 - T_PLATE0));
    const pos = B2.clone().lerp(P4, stride(u, 0.35));
    return aimMix(pos, eyesLag(Math.min(f, T_GO)), PLATE_AIM, smooth(clamp01((f - T_PLATE0) / 14)), S_B2, S_PLATE, FOV_B2, FOV_PLATE, easeInOutCubic(u));
  }
  // M5: THE TURN AND WALK to D1 (the aim from the plate to him over its first 20 frames, so his face comes in from the
  // right edge below the battery; the lens opening early), landing on 朋
  if (f < T_TURN1) {
    const u = clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0));
    const pos = P4.clone().lerp(D1, stride(u, 0.3));
    return aimMix(pos, PLATE_AIM, EYES_DESK, smooth(clamp01((f - T_TURN0) / 20)), S_PLATE, S_D1, FOV_PLATE, FOV_D1, smooth(Math.min(1, u * 1.6)));
  }
  // the close; M6 THE SNAP to the extreme close (6 frames, out-cubic) landing on "Hooke"; held to the end
  return C.lensCam(f, [
    { f: T_SNAP0, pos: D1, at: EYES_DESK, sx: S_D1[0], sy: S_D1[1], fov: FOV_D1 },
    { f: T_HOOKE, pos: D1, at: EYES_DESK, sx: S_XC[0], sy: S_XC[1], fov: FOV_XC, ease: easeOutCubic },
  ]);
};
/** THE CAMERA: the base, her footfalls, the 5 cm flinch on "interrupt", the whisper (held to the cut), the whip */
const camAt = (f: number) => {
  let cam = baseCam(f);
  // her footfalls while she walks (M3 back, M4 in, M5 to the desk); nothing in the holds or on the snap
  const b = footBob(f, [...FALLS_M3, ...FALLS_IN, ...FALLS_WALK]);
  if (b.up !== 0) cam = C.nudge(cam, b);
  // his pointed look into the lens on "interrupt": she shrinks back 5 cm, and gives it back as he looks down again
  const shrink = ky(f, [[T_POINT0 + 1, 0], [T_POINT0 + 9, 1], [T_POINT1, 1], [T_POINT1 + 12, 0]]);
  if (shrink > 0) cam = C.nudge(cam, { fwd: -0.05 * shrink, pitch: 0.6 * shrink });
  // 悄悄说 E07 on the extreme close: the tip only (no step: the lens is at its closest), HELD TO THE CUT (the script:
  // hold to the end of E; he walks out of a still frame)
  if (f >= W7.leanFrom) cam = whisperLean(Math.min(f, W7.backFrom), cam, { at: EYES_DESK, step: 0, tilt: 3 });
  // WHIP ⑧: the outgoing half, panning right after him (F's first frame carries the incoming half)
  const Wh = C.whip(cam, f, T_WHIP, { dir: 1, out: WHIP_OUT });
  return Wh;
};

// ---------------------------------------------------------------------------------------------------- his hands
/** how far the page he reads is turned toward the lens (0 = only toward his eyes) */
const PAGE_CAM = 0.5;
/** the page in his left hand while he reads (at the desk, walking, eating): low in front of his left side (3 cm more
 *  forward than v4: out of his locks, look/NOTES 3(a)) */
const pageHand = (s: NState, f: number) => {
  const bob = 0.006 * Math.sin(f * 0.05), sway = s.moving ? 0.01 * Math.sin(f * 0.6) : 0;
  const walk = rel(s.at, s.facing, 0.29, 0.84 + bob, 0.31 + sway);
  if (s.where === "desk") return rel(s.at, s.facing, 0.25, 0.85 + bob, 0.2).lerp(walk, smooth(clamp01((f - T_WALK0 + 6) / 6)));
  if (s.where === "table") return walk.lerp(rel(s.at, s.facing, 0.26, 0.88 + bob, 0.33), smooth(clamp01((f - T_ARRIVE) / 6)));
  return walk;
};
/** how much he is writing (1) or holding the quill still (0: he lifts his head for the look and for "Hooke") */
const writeK = (f: number) => 1 - Math.max(
  ky(f, [[T_UP0 - 3, 0], [T_UP0 + 2, 1], [T_DOWN1, 1], [T_DOWN1 + 8, 0]]),
  ky(f, [[T_SNAP0 - 3, 0], [T_SNAP0 + 1, 1], [T_DOWN2, 1], [T_DOWN2 + 8, 0]]),
  ky(f, [[T_QDOWN - 10, 0], [T_QDOWN - 7, 1]]));
const leftOnPage = (f: number) => ROOM.deskWrite.clone().add(V(0.15 + 0.004 * Math.sin(f * 0.031), 0.06, 0.01 + 0.003 * Math.sin(f * 0.023 + 1)));
/** the fork's hand at the table: to the fork, up, in (clink), to his mouth (bite), hovering while he chews, in again, to
 *  his mouth, down where it lay. `mouth` = the point his lips are (people.ts facePoint, after a first update), `away` =
 *  the way the fork's handle leaves his lips (toward the lens, down and to his right) */
type ForkKey = [number, THREE.Vector3, ((x: number) => number)?];
const forkKeys = (s: NState, mouth: THREE.Vector3, toCam: THREE.Vector3): ForkKey[] => {
  const hang = rel(s.at, s.facing, -0.16, 0.6, 0.06);
  const rightDir = V(-Math.cos(s.facing), 0, Math.sin(s.facing));
  // his fist in front of his chin, low and to his right: the tine tip on his lips
  const away = toCam.clone().multiplyScalar(0.6).add(V(0, -0.6, 0)).addScaledVector(rightDir, 0.45).normalize();
  const atLips = mouth.clone().addScaledVector(away, FORK_TIP);
  const stabDir = (c: THREE.Vector3) => V(-0.25, -0.85, -0.45).normalize().add(c.clone().sub(rel(s.at, s.facing, -0.13, 0.97, 0.04)).normalize()).normalize();
  const stab = (c: THREE.Vector3) => c.clone().addScaledVector(stabDir(c), -FORK_TIP);
  const over = (c: THREE.Vector3) => stab(c).add(V(0, 0.06, 0.02));
  const hover = atLips.clone().add(V(0, -0.12, 0)).addScaledVector(toCam, 0.04);
  // on the way up the fist comes out in front of his chin first (the tines never pass under it)
  const front = atLips.clone().addScaledVector(toCam, 0.09).add(V(0, -0.05, 0));
  // over the table's edge (never through the cloth's drop)
  const edge = FORK_HILT.clone().add(V(0, 0.08, 0.08));
  return [
    [T_ARRIVE - 4, hang], [T_ARRIVE + 1, edge], [T_GRAB, FORK_HILT.clone().add(V(0, GRAB_UP, 0)), easeOutCubic],
    [T_CLINK1 - 3, over(CHOP1)], [T_CLINK1, stab(CHOP1)],
    [T_CLINK1 + 3, front], [T_BITE1, atLips.clone(), easeOutCubic], [T_BITE1 + 4, atLips.clone()], [T_BITE1 + 11, hover], [T_CLINK2 - 8, hover],
    [T_CLINK2 - 3, over(CHOP2)], [T_CLINK2, stab(CHOP2)],
    [T_CLINK2 + 3, front], [T_BITE2, atLips.clone(), easeOutCubic], [T_BITE2 + 2, atLips.clone()], [T_BITE2 + 4, front], [T_DOWN - 2, edge], [T_DOWN, FORK_HILT.clone().add(V(0, GRAB_UP, 0))],
  ];
};
const pathAt = (f: number, keys: ForkKey[]) => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1].clone().lerp(keys[i][1], (keys[i][2] ?? smooth)(clamp01((f - keys[i - 1][0]) / Math.max(1, keys[i][0] - keys[i - 1][0]))));
  return keys[keys.length - 1][1].clone();
};
/** 0..1: the fork pointing at his mouth (while it is up) rather than at the chop */
const forkUpK = (f: number) => ky(f, [[T_CLINK1, 0], [T_CLINK1 + 3, 1], [T_BITE1 + 4, 1], [T_BITE1 + 11, 0.45], [T_CLINK2 - 8, 0.45], [T_CLINK2 - 3, 0], [T_CLINK2, 0], [T_CLINK2 + 3, 1], [T_BITE2 + 2, 1], [T_DOWN - 1, 0]]);
/** his right hand at E07's tail: the quill from the page to where it lies (landing on its knock), then down to his side */
const quillHandOut = (f: number, s: NState) => {
  // the fist lands where it would be writing with the nib on the spot the quill then lies (the nib never dips into
  // the desk; the quill drops flat on the knock)
  const from = quillFist(nibAt(T_QDOWN - 7, ROOM.deskWrite, 0)), laid = quillFist(QUILL_DOWN_AT.clone().add(V(0, 0.006, 0)));
  if (f <= T_QDOWN) return from.lerp(laid, smooth(clamp01((f - (T_QDOWN - 7)) / 7)));
  const side = rel(s.at, s.facing, -0.24, 0.66, -0.02), k = smooth(clamp01((f - T_QDOWN) / 7));
  return laid.lerp(side, k).add(V(0, 0.07 * Math.sin(Math.PI * Math.min(1, k * 1.25)), 0));   // up over the desk's back edge
};
/** his left hand at E07's tail: off the page to the candle's ring handle (landing on T_CANDLE), then it carries the
 *  candle out in front of his left side */
const CANDLE_GRIP = CANDLE_DESK.clone().add(V(0.07, 0.012, 0));
const candleHand = (f: number, s: NState) => {
  if (f <= T_CANDLE) {
    const k = smooth(clamp01((f - (T_QDOWN - 2)) / (T_CANDLE - T_QDOWN + 2)));
    return leftOnPage(T_QDOWN - 2).lerp(CANDLE_GRIP, k).add(V(0, 0.04 * Math.sin(Math.PI * k), 0));   // up over the sheets
  }
  // carried out in front of him, a little to his left (he turns to his left as he sets off: in front, the hand never
  // crosses his coat, and the flame stays clear of his head's underside)
  return CANDLE_GRIP.clone().lerp(rel(s.at, s.facing, 0.16, 0.82, 0.4), smooth(clamp01((f - T_CANDLE) / 6)));
};

// ---------------------------------------------------------------------------------------------------- his face
type Ex = NonNullable<RigState["expr"]>;
/** N rest is `focus` (slit lids, eyes on the work); LOOK 2/4 `neutral` (full dots under half lids); "Hooke." deadpan;
 *  THE CRACK `cool` (one corner of the mouth, 12 frames) */
const NEWTON_EXPR: [number, Ex][] = [
  [S.from, "focus"], [T_UP0, "neutral"], [T_DOWN1, "focus"], [T_SNAP0, "deadpan"], [T_CRACK0, "cool"], [T_DOWN2, "focus"],
];
/** "Hooke." has its own mouth set (speak id): its first open mouth is the O of the "oo", held through the head pop; on
 *  the deadpan face no talking mouth shows teeth (the small mouth's top teeth and the closing strip become the pill) */
const HOOKE_ID = 2;
const NO_TEETH: Record<string, "pill" | "round"> = { strip: "pill", half: "round", wide: "round", tongue: "pill", small: "pill" };
/** a head move scaled (N rest: head with words 0.3) */
const scaleHead = (h: RigHead | undefined, k: number): RigHead | undefined => h && { dx: (h.dx ?? 0) * k, dy: (h.dy ?? 0) * k, tilt: (h.tilt ?? 0) * k, scale: 1 + ((h.scale ?? 1) - 1) * k, squash: (h.squash ?? 0) * k };
type Spoken = { mouth?: RigState["mouth"]; head?: RigHead; blink?: number };
const speakNt = (f: number): Spoken => {
  const q = saying("nt", f);
  if (!q) return {};
  // THE CRACK: no talking mouth (the face's own smirk)
  if (q.id === "E06" && f >= T_CRACK0) return {};
  if (q.id !== "E06") { const sp = speak(q, f, 1); return { ...sp, head: scaleHead(sp.head, 0.3) }; }
  const sp = speak(q, f, HOOKE_ID);
  if (!sp.mouth || !NO_TEETH[sp.mouth]) return { ...sp, head: undefined };
  return { ...sp, head: undefined, mouth: sp.mouth === "small" && f < T_HOOKE + 5 ? "round" as const : NO_TEETH[sp.mouth] };
};
/** a head jolt of 4 frames (E01's 吃: he hears her and does not look up) */
const jolt4 = (f: number, on: number, amp = 0.3): RigHead | undefined => {
  const i = f - on;
  return i < 0 || i >= 4 ? undefined : { dy: 0.2 * amp * [0.6, 1, 0.5, 0.15][i], squash: -0.04 * amp * [1, 1, 0.4, 0][i] };
};
/** how far his head is bowed (deg): over the page while he reads, walks and eats; over the desk while he writes (32 at
 *  most once the extreme close is on: camplan staging change 2, his eyes stay in the frame); up for the look and
 *  for "Hooke" (chin +2) */
const lookDownAt = (f: number) => {
  if (f < T_DESK) return ky(f, [[T_WALK0, 26], [T_WALK0 + 8, 22]]);
  if (f >= T_OUT0) return lerp(32, 14, smooth(clamp01((f - T_OUT0) / 6)));
  const bow = f >= T_SNAP0 ? 32 : 44;
  const up = Math.max(ky(f, [[T_UP0, 0], [T_LOOK, 1], [T_DOWN1, 1], [T_DOWN1 + 6, 0]]), ky(f, [[T_SNAP0, 0], [T_HOOKE, 1], [T_DOWN2, 1], [T_DOWN2 + 6, 0]]));
  const top = f >= T_SNAP0 - 1 && f < T_DOWN2 + 6 ? -2 : 3;
  return lerp(bow, top, up);
};
/** his eyes: on the page in his left hand (screen right) while he reads and eats; down on his writing at the desk; into
 *  the lens for the look; to the side for "Hooke" */
const gazeAt = (f: number) => at(f, [[S.from, 0.5], [T_DESK, 0], [T_LOOK - 2, 0], [T_DOWN1, 0], [T_SNAP0, 0.5], [T_DOWN2, 0], [T_OUT0, 0.5]]);
/** his pointed look into the lens on "interrupt": 0..1 (the hair of a lean) */
const pointK = (f: number) => ky(f, [[T_POINT0 - 2, 0], [T_POINT0 + 3, 1], [T_POINT1 - 2, 1], [T_POINT1 + 4, 0]]);
/** chewing (his mouth stays shut: the head bobs a little, the jaw's work), after each bite */
const chewAt = (f: number) => {
  const on = (a: number, b: number) => f >= a && f < b ? Math.sin(Math.PI * clamp01((f - a) / 4)) * Math.sin(Math.PI * clamp01((b - f) / 4)) : 0;
  const k = Math.max(on(T_CHEW - 2, T_CLINK2 - 8), on(T_CHEW2, T_CHEW2 + sec(1.6)));
  return k > 0 ? { dy: -0.035 * k * (0.5 + 0.5 * Math.sin((f / FPS) * 2 * Math.PI * 2.4)), squash: 0.015 * k * Math.sin((f / FPS) * 2 * Math.PI * 2.4) } : undefined;
};

// ---------------------------------------------------------------------------------------------------- the shot
const pose = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "evening");
  const Wh = camAt(f), cam = Wh.cam;
  w.setCamera(cam);

  // NEWTON
  const s = newtonAt(f);
  const n: Rig = w.actor(NEWTON);
  const ns = speakNt(f);
  const atDesk = f >= T_DESK;
  const writing = atDesk && f < T_QDOWN;
  const toCam = posOf(cam).sub(s.at.clone().setY(0)).setY(0).normalize();
  // his hands: the page (left) until he is back at the desk; the fork (right) at the table; the quill at the desk; at
  // the end the quill laid down and the candle taken
  const hands = (mouth: THREE.Vector3 | null): [THREE.Vector3 | null, THREE.Vector3 | null] => {
    if (atDesk) {
      if (f < T_QDOWN - 7) return [quillFist(nibAt(f, ROOM.deskWrite, writeK(f))), leftOnPage(f)];
      return [quillHandOut(f, s), f < T_QDOWN - 2 ? leftOnPage(f) : candleHand(f, s)];
    }
    const left = pageHand(s, f);
    if (s.where === "table" || (f >= T_GO && f < T_DOWN + 6)) {
      if (!mouth) return [rel(s.at, s.facing, -0.16, 0.6, 0.06), left];
      const lift = FORK_HILT.clone().add(V(0, 0.09, 0.1)), grab = FORK_HILT.clone().add(V(0, GRAB_UP, 0));
      return [f < T_DOWN ? pathAt(f, forkKeys(s, mouth, toCam)) : f < T_DOWN + 4 ? grab.lerp(lift, smooth((f - T_DOWN) / 4)) : null, left];
    }
    return [null, left];
  };
  const upToMouth = f >= T_CLINK1 + 2 && f < T_DOWN;
  n.set({
    at: s.at, facing: s.facing, pose: s.pose, expr: at(f, NEWTON_EXPR), ...ns,
    // LOOK 2/4: the full dots under half lids, no blink through it; the deadpan mouth when he is not speaking
    ...(pointK(f) > 0 && !ns.mouth ? { mouth: "line" as const } : {}),
    blink: pointK(f) > 0.5 || (f >= T_CRACK0 && f < T_CRACK1) ? 0 : ns.blink ?? lid(t, 1, swaps(NEWTON_EXPR)),
    head: heads(ns.head, chewAt(f),
      // E01's 吃: a 4-frame jolt (he hears her, the eyes stay on the page); E02's surprise: a head jolt
      jolt4(f, T_CULPRIT), accent("jolt", f, T_JOLT2, { amp: 0.35 }),
      // "Hooke": the pop and the nod at half strength (camplan staging change 1)
      accent("nod", f, T_HOOKE, { amp: 0.35 }), headPop(f, T_HOOKE, [1.06, 1.03, 1.01]),
      // the pointed look: a hair of a lean toward her (the head a touch bigger to the lens), the chin a little down
      pointK(f) > 0 ? { scale: 1 + 0.035 * pointK(f), dy: -0.01 * pointK(f) } : undefined),
    lookDown: lookDownAt(f), gaze: gazeAt(f), hands: hands(null), armFront: [upToMouth, false],
    hide: atDesk ? NEWTON_HIDE_WRITING : NEWTON_HIDE, visible: true,
    // his resting posture (people.ts NEWTON_LEAN) on every frame; setting off, the walk pose adds 4 deg forward on its
    // first frame: take it back and let it come in over 8 frames (in the extreme close it would throw his head 5 cm
    // forward and down in one frame)
    lean: { pitch: (NEWTON_LEAN.pitch ?? 0) - (s.where === "out" && f > T_OUT0 ? 4 * (1 - smooth(clamp01((f - T_OUT0) / 8))) : 0) },
  });

  // the room: the plate (cold, the fly, then two bites), the cover, the fork, the desk's things, his candle, the chair
  const bites = f > T_CLINK2 ? 2 : f > T_CLINK1 ? 1 : 0;
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, bites, fly: f < T_FLYOFF ? flyU(f) : undefined, t });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: atDesk ? 3 : 2 });
  w.prop("chair").put(CHAIR_ASIDE, { rot: ROOM.chairFacing });
  if (f <= T_CANDLE) w.prop("candle").put(CANDLE_DESK, { len: CANDLE_LEN, lit: true, t });

  w.update();
  // THE FORK AT HIS LIPS (look/NOTES 3(b)): the tine tip on his real mouth (facePoint after the first solve), then solve
  // again with the corrected hand
  const head = n.headWorld();
  const mouth = facePoint(n, 0, -0.35, 0.012);
  if (s.where === "table" || (f >= T_GO && f < T_DOWN + 6)) { n.set({ hands: hands(mouth) }); w.update(); }

  // the held things: the page, the fork, the quill, the candle (from where his fists really are)
  if (!atDesk) { const pg = pagePut(n.handWorld(1), eyesAt(s).add(V(0, 0.02, 0)), 0.3, posOf(cam), PAGE_CAM); w.prop("sheets", "page").put(pg.at, { rot: pg.rot, n: 1 }); }
  if (writing || (atDesk && f < T_QDOWN)) w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT });
  else if (atDesk) w.prop("quill").put(QUILL_DOWN_AT, { rot: QUILL_DOWN_ROT });
  if (f > T_CANDLE) w.prop("candle").put(n.handWorld(1), { grip: "grip", len: CANDLE_LEN, lit: true, t });
  const held = f >= T_GRAB && f < T_DOWN;
  if (held) {
    const hand = n.handWorld(0);
    // the fork points from his fist at the chop while it goes in, at his mouth while it is up, level as it goes down
    const toChop = (c: THREE.Vector3) => c.clone().sub(hand).normalize();
    const chopDir = f < T_CLINK2 - 6 ? toChop(CHOP1) : f < T_BITE2 + 2 ? toChop(CHOP2) : V(-1, 0, 0);
    const kGrab = smooth(clamp01((f - T_GRAB) / 5));
    const dir = V(-1, 0, 0).lerp(chopDir, kGrab).lerp(mouth.clone().sub(hand).normalize(), forkUpK(f)).normalize();
    // the fork in his fist (it sits GRAB_UP under the fist's middle while it leaves the cloth and while it goes back)
    const low = Math.max(1 - clamp01((f - T_GRAB) / 4), 1 - clamp01((T_DOWN - 1 - f) / 4));
    const forkAt = hand.clone().add(V(0, -GRAB_UP * low, 0)), forkQ = forkRot(dir);
    w.prop("fork").put(forkAt, { grip: "hilt", rot: forkQ });
    putMorsel(w, morselOn(f) ? forkAt : null, forkQ);
  } else { w.prop("fork").put(FORK_HILT, { rot: FORK_REST }); putMorsel(w, null); }

  // THE LENS: the whip's blur; the insert focused on the fly (the plate soft round it); the plate close on the plate;
  // a light focus on him everywhere else (his mouth: the pile soft in front of the close)
  const camPos = posOf(cam);
  const mouthPt = head.clone().add(V(0, -0.1, 0));
  let dof: { focus: number; amount: number } | undefined;
  if (f < T_SWING1) {
    const k = 1 - smooth(clamp01((f - T_SWING0) / (T_SWING1 - T_SWING0)));
    dof = { focus: camPos.distanceTo(lagged(f, flyPos, 6)), amount: lerp(2, 9, smooth(clamp01((f - T_PUSH0) / (T_PUSH1 - T_PUSH0)))) * k };
  } else if (f >= T_PLATE0 && f < T_TURN0 + 12) {
    const k = smooth(clamp01((f - T_PLATE0 - 8) / 10)) * (1 - smooth(clamp01((f - T_TURN0) / 12)));
    dof = { focus: lerp(camPos.distanceTo(mouthPt), camPos.distanceTo(ROOM.plate), k), amount: lerp(2, 4, k) };
  } else dof = { focus: Math.max(0.2, camPos.distanceTo(mouthPt)), amount: f >= T_TURN1 ? 3 : 2 };
  const post = Wh.post ?? (dof.amount > 0.05 ? { dof } : undefined);
  return { camera: cam, post, overlays: Wh.smear > 0 ? C.whipSmear(Wh.smear, 1) : undefined, slate: f < T_WHIP ? "E" : "E whip out" };
};

export const SEG: Segment = { id: "E", from: S.from, to: S.to, enter() {}, exit(w) { morselOff(w); }, pose };
