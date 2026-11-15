// SEGMENT B · 上午 · his room (script v5 rows 06-14 = B01-B09; camplan B with its director notes; the v5 rebuild).
// ONE TAKE, no cut: in on JOIN ① (the REC clock races under A's tail, f701 = the bell on the cut), out on WHIP ② (left
// to the window table on the noon strike: B owns the outgoing half, the smear and the blur on its last 6 frames).
// Her eye (the lens) is 1.5 m over the floor and breathes; it steps on her footfalls; it never shows her (no mic, no
// hands). Still is the default; every move below has a reason and lands on its word or its sound:
//   M0  INSERT HOLD (701-)      the covered dinner low left, Humphrey's sleeve, shoulder and face beside it; the cover's
//                               clink (BEAT lid) lifts it inside the still frame: steam. (The day's clock, 11:00.)
//   M1  STEP BACK (after 先生 -> "dinner")   she straightens and steps back to the two-thing in depth: Humphrey left
//                               with the plate, Newton writing right (something changes hands; the speaker changes).
//       HOLD                    "...dinner."; 14 f later THE FLICK (his left hand, two fingers low, without looking).
//   M2  FOLLOW (humphreyGoes -> the doorway)   her head turns after Humphrey as he walks round the open leaf, the lens
//                               narrowing to his whole figure in the jambs (someone leaves).
//       HOLD                    B02 「他说马上来！」: he glances back at NEWTON (script v5), steps out, pulls it shut.
//   M3  TURN AND WALK (door click -> 写)   she turns back from the shut door and walks to the desk's front-right corner,
//                               landing on 写 in the three-quarter two-thing, the drafts stack in the foreground; B03's
//                               last frame (FREEZE.at) is the held frame of his intro card: his first good close view,
//                               writing, eyes on the page, room for the card. f991 is the same picture (sceneF).
//       HOLD (B04, 7 s)         his not looking up is the joke.
//   M4  SNAP TO THE THING (这)   the drafts stack, a hand's breadth thick, him writing on behind it (the punch word).
//   M5  TILT BACK UP ("lost")   to a medium of his face over the page (the speaker changes).
//       HOLD                    the calm look after two fast moves.
//   M6  SLOW PUSH (B07 -> "Not")   she leans in on her cheeky question, to a close of his face.
//       HOLD (B08)              "It fell to the ground. Not on me." NO-LOOK: his face does not move (script v5).
//   M7  悄悄说 B09 「没笑。」  whisperLean: the step in to the EXTREME CLOSE (the scene's one), 3 deg tip, edges dark.
//   M8  EASE BACK (B09's end -> card 2)   back to the desk under card 2; the meter slot clear for tick 1.
//       HOLD under card 2       nobody speaks; the quill scratches on.
//   W   WHIP ② out              on the noon strike she turns to the window: the whip's outgoing half.
// Every frame is a pure function of f; every time comes from line() / capWord() / card() / BEAT.
import * as THREE from "three";
import { SEGMENTS, line, card, capWord, FPS, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_INK, NEWTON_HIDE_WRITING, HUMPHREY, H_EYE, newtonEyes } from "../people";
import { RMX, ROOM, ROOM_SET } from "../layout";
import { PLATE, QUILL } from "../props";
import { V, rel, hang, lid, speak, saying, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, CHAIR_ASIDE, type Rig, type RigPose, type RigHead } from "./common";
import { whisperLean } from "../whisper";
import type { World } from "../world";
import { ntSpeak, lidInside, plateLidGroup, geoPage, sceneF, stride, footBob, breath } from "./segB_parts";

const S = SEGMENTS[1];
const sec = (s: number) => Math.round(s * FPS);
const L1 = line("B01"), L2 = line("B02"), L4 = line("B04"), L9 = line("B09");
const CARD2 = card("B09");
const B = BEAT.B;

// ---------------------------------------------------------------------------------------------------- the beats
/** the cover's clink: Humphrey's fist on its near rim lifts it (steam) */
const T_LID = B.lid;
const T_TILT = T_LID + 7, T_DOWN = T_TILT + 11, T_FREE = T_DOWN + 2;
/** M1 THE STEP BACK: from just after 先生 ("Sir," and its comma) to "dinner" (script v5 row 06) */
const T_DIN = capWord("B01", "dinner").from;
const T_SB0 = capWord("B01", "Sir").from + 9, T_SB1 = T_DIN;
/** Humphrey turns from the table toward Newton and takes his step as she steps back */
const T_TURN0 = T_SB0 - 2, T_TURN1 = T_SB1 - 1;
/** Humphrey sighs, then goes (BEAT) */
const T_SIGH = B.sigh, T_GO = B.humphreyGoes;
/** M2 THE FOLLOW: her head goes after him from his first step, the lens narrowing; on the doorway by the time he turns
 *  in it */
const T_F0 = T_GO + 2;
/** THE FLICK (FLICK 1/4, gate 5 note B1: it must read at phone size): his left hand comes up off the page to just below
 *  his chest (759-766), flicks out toward Humphrey and the door (screen left) ON the swish (BEAT flick, 768), holds
 *  there 4 frames, and is back down on the page by the time her head starts after Humphrey (T_F0, 786) */
const T_FL = B.flick;
const T_FL_UP0 = T_FL - 9, T_FL_UP1 = T_FL - 2, T_FL_HOLD = T_FL + 4, T_FL_BACK1 = T_F0;
/** M3 THE TURN AND WALK: from the door's click to 写 (her three steps on BEAT steps) */
const T_CLICK = B.doorClick;
const T_W0 = T_CLICK, T_TURNED = B.steps[2] + 2, T_W1 = B.walk[1];
/** M4 THE SNAP to the stack on 这, 5 frames, ease out (lands on the word) */
const T_DR1 = B.drafts, T_DR0 = T_DR1 - 5;
/** M5 THE TILT BACK UP, landing on "lost": a second on the stack first (the snap's hold: 这 .. 厚 and B05's end), then
 *  back up to the speaker in 5 frames */
const T_UP1 = B.lost, T_UP0 = Math.max(T_DR1 + 30, T_UP1 - 6);
/** M6 THE SLOW PUSH: from her first word of B07 to "Not" (BEAT push) */
const T_PU0 = B.push[0], T_PU1 = B.push[1];
/** M8 THE EASE BACK under card 2: with the whisper's own return (her voice's end + 2), landing on the card's ding (cues.json
 *  cards: the ding at the card's start + 0.1 s): his face up and right of the card as it lands */
const T_EB0 = L9.to + 2, T_EB1 = CARD2.from + sec(0.1);
/** WHIP ② out: its outgoing half (beats.ts whipOut, 6 frames to C's first frame) */
const T_WHIP = B.whipOut;

// ---------------------------------------------------------------------------------------------------- the marks
const T = ROOM_SET.table;
/** a room point: x offset from RMX, z, height */
const P = (x: number, z: number, y = 0) => V(RMX + x, y, z);
/** her eye over the floor (the format: about 1.5 m) */
const EYE_B = 1.5;
/** NEWTON behind the desk, writing standing (his page on ROOM.deskWrite, in reach) */
const N_AT = ROOM.newtonDesk, N_FACING = ROOM.deskFacing;
const N_EYES = newtonEyes(N_AT, N_FACING);
/** HUMPHREY at the window table for the insert: front-right of the plate (his face beside it in the insert) */
const H0 = P(T.x + 0.35, T.z + 0.44);
const H0_FACING = yawTo(H0, ROOM.plate);
/** where he says "Sir, your dinner.": two steps toward the desk, at its left end, turned to Newton and a little toward
 *  her (gate 5 note B1: 0.3 m nearer the desk than the first build, so that W1 can be a closer two-thing in which the
 *  flick reads: both heads fit the 9:15 frame with Newton's head over 330 px) */
const H1 = P(T.x + 1.0, T.z + 0.89);
const H1_FACING = yawTo(H1, N_AT) - 0.35;
/** his way out round the open leaf's free edge (the door stands 0.9 open: he came in with the dinner) ... */
const DOOR_Z = (ROOM_SET.door.z0 + ROOM_SET.door.z1) / 2;
const D1 = P(-2.12, DOOR_Z + 0.13);
const LEG_A = [H1, P(-1.2, -0.02), D1];
/** ... and from the doorway out onto the landing, half a step aside behind the wall beside the latch jamb */
const LEG_B = [D1, P(-2.7, DOOR_Z + 0.1), P(-2.86, DOOR_Z + 0.55)];
/** he reaches the doorway when he did from the first build's mark (P(T.x + 0.7, ..) at 2.2 m/s), so the doorway hold, his
 *  glance back and the door shut on the click keep their frames: the walk from the new mark is 6 % quicker */
const T_DZ = T_GO + Math.round(walkTime([P(T.x + 0.7, T.z + 0.89), P(-1.2, -0.02), D1], 2.2) * FPS);
const SPEED_A = walkTime(LEG_A, 1) / ((T_DZ - T_GO) / FPS), SPEED_B = 2.0;
/** his glance back at NEWTON in the doorway (script v5 row 07), then out */
const T_GOB = T_DZ + 11;
/** the door: open (0.9) until he is through, pulled shut from the landing ON the click */
const DOOR_OPEN = 0.9;
const doorK = (f: number) => ky(f, [[T_CLICK - 8, DOOR_OPEN], [T_CLICK - 3, 0.25], [T_CLICK, 0]]);
const T_GONE = T_CLICK;

// ---------------------------------------------------------------------------------------------------- framing
/** her lens positions (room offsets, her eye) and lenses (CamPose fov, 1920-reference vertical) */
const W1 = P(-0.45, 0.8, EYE_B + 0.02);
/** P0 (gate 5 note B3): the insert, 10 cm forward and 5 cm right of the first build's, on a longer lens (48 -> 40):
 *  the plate 1.3x bigger (its rim 315 px; with the lifted cover and the steam over 400), still left of his body and
 *  clear of it, his face beside it at the right with his eyes down on it. From her eye height the plate is 2 m off, so
 *  the look down stays about 16 deg: a steeper one needs the lens over the table, where his face, 1.8 plates wide,
 *  covers the plate or leaves the frame.
 *  9:16 (15 Nov): 12 cm to her right of the gate-5 place (x -0.9 -> -0.78), same height, lens and aim (the plate stays
 *  on (226, 1160), its rim 329 px): the parallax carries his face about 40 px left, so his cheek and chin clear the
 *  app's button column (x >= 890 from y 1000; skin right edge 940 -> 884 at worst). */
const P0 = P(-0.78, -0.15, EYE_B);
/** W1 is a closer two-thing than the first build's (76; note B1's fallback): Newton's head 330+ px, Humphrey's 400 px with
 *  its left edge clear of x 70; the follow then opens a little (54 -> 62) to keep his whole figure as he comes nearer */
const INS_FOV = 38, W1_FOV = 54, DOOR_FOV = 62;
/** the insert: the plate (+5 cm, the dome) low left, above the subtitle row; his face upper right, eyes down on it */
const PLATE_AIM = ROOM.plate.clone().add(V(0, 0.05, 0));
const INS_SX = 226, INS_SY = 1160;
/** the two-thing: the middle between their eyes (Humphrey at H1, Newton) */
const hEyesAt = (p: THREE.Vector3) => p.clone().add(V(0, H_EYE, 0));
const PAIR = hEyesAt(H1).lerp(N_EYES, 0.5);
const PAIR_SX = 590, PAIR_SY = 680;
/** the doorway: Humphrey's eyes standing in it */
const DOOR_PT = hEyesAt(D1);
const DOOR_SX = 560, DOOR_SY = 700;
/** M2's middle: Humphrey's head while he walks (room ahead of him, to the left) */
const FOLLOW_SX = 640, FOLLOW_SY = 820;
/** I2: the desk's front-right corner (three-quarter, 26 deg off his facing). His eyes sit at x 345: the card's lifted cut-out
 *  (his right wig locks are its right edge, at x 680 with the paper margin) stays left of the seal box (x 690), and its
 *  left edge stays out of the 54 px margin.
 *  9:16 (15 Nov): 抖音 cuts x < 58 off a 9:16 film, and at gate 5's lens (58, eyes at x 345) the lifted sticker's paper
 *  margin reached x 19 (its matte x 58: his wig curl on the visible edge, the margin cut) and its quill's margin touched
 *  the name 艾 (0 px). The lens is 7 % looser (58 -> 61.7) and his eyes 22 px right (345 -> 367), the smallest change
 *  that keeps the whole sticker on the phone with its right edge where it was: footprint x 61-680 (matte 98-662), the
 *  seal still 10 px clear, 艾 28 px clear. Same place, same aim point, same landing on 写 and the same 7 s hold. */
const I2 = P(1.62, -0.1, EYE_B + 0.02);
const I2_FOV = 61.7, I2_SX = 367, I2_SY = 578;
/** THE EVIDENCE (gate 5 note B2): the paper tower at the desk's right end (sets/room.ts, the 0.27 m pile behind the drafts
 *  corner), three hands thick. From the corner it stands right behind the hand's-breadth drafts stack, so no frame of
 *  the drafts can leave it out (or whole) without a step of half a metre; the snap therefore lands on the tower itself:
 *  whole, the biggest paper in the frame, above the subtitle band and inside x 120-900, with the drafts stack low left
 *  in front of it (cut by the frame: it is thinner) and Newton's head gone out at the top left (he writes on, unseen).
 *  PILE_MID: the middle of its height over its spot (sets/room.ts spots [0.6, -0.25, 0.27]) */
const PILE_MID = V(RMX + ROOM_SET.desk.x + 0.6, ROOM.deskTop + 0.135, ROOM_SET.desk.z - 0.25);
/** DR: she leans 27 cm to her left (and 5 cm in) and turns to the tower; the lens tightens (58 -> 38). The lean is what
 *  takes Newton's head and wig locks out by the left edge (from the corner they stand 120 px left of the tower at
 *  most); on the way out his head stays below y 360, never under REC or the stamp */
const DR = P(1.35, -0.05, EYE_B + 0.02);
const DR_FOV = 38, DR_SX = 384, DR_SY = 1040;
/** C1: the first build's DRAFTS lean (0.12 m toward the stack, 3 cm down, lens 51.6): the medium of his face over the
 *  page that the tilt back up lands on (unchanged) */
const C1P = I2.clone().add(ROOM.drafts.clone().sub(I2).setY(0).normalize().multiplyScalar(0.12)).add(V(0, -0.03, 0));
const C1_FOV = 51.6, C1_SX = 470, C1_SY = 660;
/** CLOSE: the end of the slow push */
const CL = P(1.3, -0.62, EYE_B - 0.02);
const CL_FOV = 52, CL_SX = 492, CL_SY = 895;
/** C2: back at the corner under card 2: his face up and right of the card, the stack right of it.
 *  9:16 (15 Nov): the meter's slot is now x 696-970, y 340-494 (the frame's REC display moved in and down: relative to
 *  the picture the slot sits 134 px lower and 56 px further left than in 9:15), and at gate 5's aim (640, 660) his
 *  head's crown and wig were under tick 1's slip for the whole hold (the ball 105 px into the slot). The aim is 92 px
 *  left and 95 px down (same place, same lens, same landing on card 2's ding): his head ball (559, 701) r 223 stays
 *  25 px off the slot's corner from f1475 to the end of the tick (f1497), and its bottom (y 923) 53 px above card 2
 *  (x 113-714, y 976-1221). The ease back from the whisper's extreme close starts on f1466, so on the tick's first
 *  frames (f1469-1473, the slip arriving, the lens moving) the slip still passes over the top of his wig (no face). */
const C2 = P(1.62, -0.15, EYE_B + 0.02);
const C2_FOV = 58, C2_SX = 548, C2_SY = 755;
/** the whisper: a step in to the extreme close (the scene's one) */
const WHISPER_STEP = 0.3, WHISPER_TILT = 3;

// ---------------------------------------------------------------------------------------------------- HUMPHREY
type HState = { at: THREE.Vector3; aim?: THREE.Vector3; facing: number; pose: RigPose; walking: boolean };
/** HIS STEP FROM THE TABLE: the rig's walk pose leans the head forward in one frame; his feet set off STEP_LEAN behind
 *  the head's path and catch up (the old take's fix, kept) */
const STEP_LEAN = 0.048, STEP_IN = 8, STEP_OUT = 6, STEP_S0 = 0.06;
const humphreyAt = (f: number): HState | null => {
  const t = f / FPS;
  if (f >= T_GONE) return null;
  if (f < T_TURN0) return { at: H0.clone(), facing: H0_FACING, pose: { kind: "idle", t: t + 0.8 }, walking: false };
  if (f < T_GO) {
    const k = smooth(clamp01((f - T_TURN0) / Math.max(1, T_TURN1 - T_TURN0)));
    const path = H0.clone().lerp(H1, k), mv = k > 0 && k < 1;
    const facing = lerpA(H0_FACING, H1_FACING, smooth(clamp01((f - T_TURN0) / 10)));
    if (!mv) return { at: path, facing, pose: { kind: "idle", t: t + 0.8 }, walking: false };
    const open = smooth(clamp01((f - T_TURN0 - 1) / STEP_IN)) * (1 - smooth(clamp01((f - (T_TURN1 - 1 - STEP_OUT)) / STEP_OUT)));
    const atP = path.clone().addScaledVector(V(Math.sin(facing), 0, Math.cos(facing)), -STEP_LEAN * (1 - open));
    return { at: atP, aim: path, facing, pose: { kind: "walk", phase: (k * H0.distanceTo(H1)) / 0.8, stride: lerp(STEP_S0, 0.16, open), amount: 0.6 * open }, walking: true };
  }
  if (f < T_GOB) {
    const g = walkAlong(LEG_A, SPEED_A, (f - T_GO) / FPS, { startFacing: H1_FACING, endFacing: -Math.PI / 2 });
    const facing0 = lerpA(H1_FACING, g.facing, smooth(clamp01((f - T_GO) / 7)));
    // in the doorway: a glance back at NEWTON over his shoulder (script v5 row 07: not at her), then he turns to go
    const back = ky(f, [[T_DZ - 3, 0], [T_DZ + 3, 0.85], [T_GOB - 4, 0.85], [T_GOB, 0]]);
    // he sets off from the passing pose (the walk's phase 0 is its widest stride: from the new W1 his first frame dropped
    // 6 cm with both feet thrown apart)
    const pose: RigPose = g.pose.kind === "walk" ? { ...g.pose, phase: ((g.pose.phase ?? 0) + 0.3) % 1 } : g.pose;
    return { at: g.at, facing: lerpA(facing0, yawTo(g.at, N_AT), back), pose, walking: g.moving };
  }
  const g = walkAlong(LEG_B, SPEED_B, (f - T_GOB) / FPS, { startFacing: -Math.PI / 2, endFacing: -Math.PI / 2 });
  return { at: g.at, facing: g.facing, pose: g.pose, walking: g.moving };
};
/** THE COVER, handled by its NEAR rim: it tilts up on its far edge (the steam out), he lifts it off and sets it down
 *  on the table's right end, dome up */
const U = H0.clone().sub(ROOM.plate).setY(0).normalize();
const LID_AXIS = V().crossVectors(U, V(0, 1, 0)).normalize();
const LID_BASE = ROOM.plate.clone().add(V(0, PLATE.h - 0.004, 0));
const LID_RIM = V(U.x * (PLATE.lidR - 0.006), 0.012, U.z * (PLATE.lidR - 0.006));
const LID_PIVOT = LID_BASE.clone().addScaledVector(U, -PLATE.lidR).add(V(0, 0.008, 0));
const LID_DOWN = V(RMX + T.x + 0.3, ROOM.tableTop + 0.002, T.z + 0.07);
const GRIP = V(0, 0.024, 0);
const qAxis = (a: THREE.Vector3, r: number) => new THREE.Quaternion().setFromAxisAngle(a, r);
const Q0 = new THREE.Quaternion();
const lidPose = (f: number): { o: THREE.Vector3; q: THREE.Quaternion; hand: THREE.Vector3 | null } => {
  const tilted = (k: number) => { const q = qAxis(LID_AXIS, 1.2 * k); return { o: LID_PIVOT.clone().add(LID_BASE.clone().sub(LID_PIVOT).applyQuaternion(q)).add(V(0, 0.048 * k, 0)), q }; };
  const withHand = (o: THREE.Vector3, q: THREE.Quaternion) => ({ o, q, hand: o.clone().add(LID_RIM.clone().applyQuaternion(q)).add(GRIP) });
  if (f < T_TILT) { const A = tilted(easeOutCubic(clamp01((f - T_LID) / (T_TILT - T_LID)))); return withHand(A.o, A.q); }
  if (f < T_DOWN) {
    const A = tilted(1), k = clamp01((f - T_TILT) / (T_DOWN - T_TILT)), e = smooth(k);
    const o = A.o.clone().lerp(LID_DOWN, e).add(V(0, 0.09 * Math.sin(Math.PI * Math.min(1, k * 1.15)), 0));
    return withHand(o, A.q.clone().slerp(Q0, smooth(Math.min(1, k * 1.25))));
  }
  return f < T_FREE ? withHand(LID_DOWN.clone(), Q0) : { o: LID_DOWN.clone(), q: Q0, hand: null };
};
const PLATE_RIM = ROOM.plate.clone().add(U.clone().multiplyScalar(PLATE.r - 0.005)).add(V(0, 0.02, 0)).add(GRIP);
const LID_RIM_ON = LID_BASE.clone().add(LID_RIM).add(GRIP);

// ---------------------------------------------------------------------------------------------------- NEWTON's hands
/** the nib on the page at scene frame g: lines of small loops from his left to his right, a carriage return every
 *  line, a lift between words. The quill NEVER stops in B (script v5: the cold open owns the stop) */
const nibAt = (g: number) => {
  const t = g / FPS, LT = 2.4, RT = 0.38, CY = LT + RT;
  const n = Math.floor(t / CY), u = t - n * CY, row = ((n % 9) + 9) % 9, z0 = 0.06 - row * 0.012;
  let x: number, z: number, y: number;
  if (u < LT) {
    const p = u / LT, w = 2 * Math.PI * 4.6 * t;
    x = 0.05 - 0.1 * p + 0.0032 * Math.sin(w);
    z = z0 + 0.0045 * Math.max(0, Math.cos(w)) - 0.001;
    y = 0.003 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.45 * t)), 10);
  } else {
    const p = smooth((u - LT) / RT);
    x = -0.05 + 0.1 * p; z = z0 - 0.012 * p; y = 0.012 * Math.sin(Math.PI * p);
  }
  return ROOM.deskWrite.clone().add(V(x, 0.004 + y, z));
};
const QDIR = V(-0.36, 0.84, -0.4).normalize();
const QROT = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), QDIR);
const quillHand = (g: number) => nibAt(g).addScaledVector(QDIR, -QUILL.nib);
/** his left hand: flat on the page beside the quill. THE FLICK (gate 5 note B1): up off the page to just under his
 *  chin, a hand's width to his left of the middle (HAND_COCK, (899, 734) in W1); on the swish the back of the fingers
 *  flicks out across the white of his jabot to his right, toward Humphrey and the door (HAND_OUT, screen left: 188 px
 *  in W1, the torso turning with it, see flickTwist: the arms are short), the wrist snapping up 2 cm and back, held
 *  still, then back down to the page by f784. HAND_OUT is in reach and clear of his chest (rig qa: reach 0, clear 0) */
const HAND_REST = (g: number) => ROOM.deskWrite.clone().add(V(0.15 + 0.004 * Math.sin(g * 0.031), 0.06, 0.01 + 0.003 * Math.sin(g * 0.023 + 1)));
const HAND_COCK = rel(N_AT, N_FACING, 0.04, 0.95, 0.3);
const HAND_OUT = rel(N_AT, N_FACING, -0.26, 0.98, 0.32);
const leftHand = (f: number, g: number) => {
  if (f < T_FL_UP0 || f >= T_FL_BACK1) return HAND_REST(g);
  if (f < T_FL_UP1) return HAND_REST(g).lerp(HAND_COCK, smooth((f - T_FL_UP0) / (T_FL_UP1 - T_FL_UP0)));
  if (f <= T_FL_UP1) return HAND_COCK.clone();
  // the flick: out in 2 frames (it lands on the swish), the wrist snaps up 2 cm on the next frame, back onto the mark, held
  if (f <= T_FL) return HAND_COCK.clone().lerp(HAND_OUT, easeOutCubic((f - T_FL_UP1) / (T_FL - T_FL_UP1)));
  if (f <= T_FL_HOLD) return f === T_FL + 1 ? HAND_OUT.clone().add(V(0, 0.018, 0)) : HAND_OUT.clone();
  return HAND_OUT.clone().lerp(HAND_REST(g), easeInOutCubic((f - T_FL_HOLD) / (T_FL_BACK1 - T_FL_HOLD)));
};
/** the flick's shoulder: the torso winds a little to his left as the hand comes up, then turns to his right with the
 *  flick (toward the door), which carries the left hand across in reach and clear of his chest; his head stays down */
const TW_COCK = 0.08, TW_OUT = -0.3;
const flickTwist = (f: number) => {
  if (f < T_FL_UP0 || f >= T_FL_BACK1) return 0;
  if (f <= T_FL_UP1) return TW_COCK * smooth((f - T_FL_UP0) / (T_FL_UP1 - T_FL_UP0));
  if (f <= T_FL) return TW_COCK + (TW_OUT - TW_COCK) * easeOutCubic((f - T_FL_UP1) / (T_FL - T_FL_UP1));
  if (f <= T_FL_HOLD) return TW_OUT;
  return TW_OUT * (1 - easeInOutCubic((f - T_FL_HOLD) / (T_FL_BACK1 - T_FL_HOLD)));
};

// ---------------------------------------------------------------------------------------------------- the camera
/** a smoothed point of Humphrey's head (her head follows him a little late) */
const hHead = (f: number) => {
  const p = V(); let ws = 0;
  for (let i = 0; i < 6; i++) {
    const h = humphreyAt(Math.min(f - i, T_GONE - 1));
    const q = h ? hEyesAt(h.aim ?? h.at) : DOOR_PT;
    const wgt = 6 - i; p.addScaledVector(q, wgt); ws += wgt;
  }
  return p.divideScalar(ws);
};
const CAM_W1 = C.aimCam(W1, PAIR, PAIR_SX, PAIR_SY, W1_FOV);
/** where the hold before each one-point move already has its point (M4: the tower on I2; M5: his eyes on DR) */
const PILE_ON_I2 = C.toScreen(C.aimCam(I2, N_EYES, I2_SX, I2_SY, I2_FOV), PILE_MID);
const EYES_ON_DR = C.toScreen(C.aimCam(DR, PILE_MID, DR_SX, DR_SY, DR_FOV), N_EYES);
const CAM_DOOR = C.aimCam(W1, DOOR_PT, DOOR_SX, DOOR_SY, DOOR_FOV);
/** M2: from the pair to Humphrey (kept where he is in the two-shot, then led into the middle with room ahead of him),
 *  and onto the doorway as he arrives in it; the lens narrows to his whole figure (log tan) */
const followCam = (f: number): CamPose => {
  const k = easeInOutCubic(clamp01((f - T_F0) / Math.max(1, T_DZ + 2 - T_F0)));
  const hp = hHead(f), h0 = C.toScreen(CAM_W1, hHead(T_F0));
  // the aim: Humphrey's head through the move, handed to the doorway's fixed point as he arrives in it
  const toDoor = smooth(clamp01((f - (T_DZ - 8)) / 10));
  const aimP = hp.clone().lerp(DOOR_PT, toDoor);
  // his head: brought in from where the two-shot had it to the frame's middle over his first steps (he passes her
  // lens at about 1.1 m: kept whole, room ahead of him on the left), then onto the doorway's place as he arrives
  const lead = easeInOutCubic(clamp01((f - T_F0) / 14)), land = smooth(clamp01((f - (T_DZ - 10)) / 12));
  const sx = lerp(lerp(h0.x, FOLLOW_SX, lead), DOOR_SX, land), sy = lerp(lerp(h0.y, FOLLOW_SY, lead), DOOR_SY, land);
  return C.aimCam(W1, aimP, sx, sy, C.zoomFov(W1_FOV, DOOR_FOV, k));
};
/** M3: she turns back from the door (done by her third step) and walks to the corner, landing on 写 */
const walkCam = (f: number): CamPose => {
  const u = stride((f - T_W0) / (T_W1 - T_W0)), kt = easeInOutCubic(clamp01((f - T_W0) / (T_TURNED - T_W0)));
  const pos = W1.clone().lerp(I2, u);
  const aimP = DOOR_PT.clone().lerp(N_EYES, kt);
  return C.aimCam(pos, aimP, lerp(DOOR_SX, I2_SX, kt), lerp(DOOR_SY, I2_SY, kt), C.zoomFov(DOOR_FOV, I2_FOV, smooth(clamp01((f - T_W0) / (T_W1 - T_W0)))));
};
/** the take's lens before the whisper, the footfalls and the whip */
const baseCam = (f: number): CamPose => {
  if (f < T_SB0) return C.aimCam(P0, PLATE_AIM, INS_SX, INS_SY, INS_FOV);
  if (f < T_SB1) return C.lensCam(f, [
    { f: T_SB0, pos: P0, at: PLATE_AIM, sx: INS_SX, sy: INS_SY, fov: INS_FOV },
    { f: T_SB1, pos: W1, at: PAIR, sx: PAIR_SX, sy: PAIR_SY, fov: W1_FOV, ease: stride }]);
  if (f < T_F0) return CAM_W1;
  if (f < T_DZ + 2) return followCam(f);
  if (f < T_W0) return CAM_DOOR;
  if (f < T_W1) return walkCam(f);
  return C.lensCam(f, [
    { f: T_W1, pos: I2, at: N_EYES, sx: I2_SX, sy: I2_SY, fov: I2_FOV },
    { f: T_DR0, pos: I2, at: N_EYES, sx: I2_SX, sy: I2_SY, fov: I2_FOV },
    // M4 and M5 each aim at ONE world point for the whole move (note B2: no aim swap inside a move, so nothing bounces):
    // the snap carries the tower from where I2 has it straight to its landing; the tilt carries his eyes from where
    // DR has them (out of the frame, top left) straight to C1. Each move's first key is the same picture as the hold
    // before it (the same lens, the same place, the point where that lens already has it).
    { f: T_DR0, pos: I2, at: PILE_MID, sx: PILE_ON_I2.x, sy: PILE_ON_I2.y, fov: I2_FOV },
    { f: T_DR1, pos: DR, at: PILE_MID, sx: DR_SX, sy: DR_SY, fov: DR_FOV, ease: easeOutCubic },
    { f: T_UP0, pos: DR, at: PILE_MID, sx: DR_SX, sy: DR_SY, fov: DR_FOV },
    { f: T_UP0, pos: DR, at: N_EYES, sx: EYES_ON_DR.x, sy: EYES_ON_DR.y, fov: DR_FOV },
    { f: T_UP1, pos: C1P, at: N_EYES, sx: C1_SX, sy: C1_SY, fov: C1_FOV, ease: easeOutCubic },
    { f: T_PU0, pos: C1P, at: N_EYES, sx: C1_SX, sy: C1_SY, fov: C1_FOV },
    { f: T_PU1, pos: CL, at: N_EYES, sx: CL_SX, sy: CL_SY, fov: CL_FOV },
    { f: T_EB0, pos: CL, at: N_EYES, sx: CL_SX, sy: CL_SY, fov: CL_FOV },
    { f: T_EB1, pos: C2, at: N_EYES, sx: C2_SX, sy: C2_SY, fov: C2_FOV }]);
};
/** her footfalls (the step back's two, the walk's three on BEAT steps) */
const FALLS = [T_SB0 + 5, T_SB1 - 3, ...B.steps];
const camAt = (f: number, g: number): CamPose => {
  let cam = baseCam(f);
  // 悄悄说 B09: the step in to the extreme close, on his eyes (the whisper's own timing: lands on 没, back after)
  cam = whisperLean(f, cam, { at: N_EYES, step: WHISPER_STEP, tilt: WHISPER_TILT });
  const fb = footBob(f, FALLS);
  return C.nudge(cam, { up: fb.up + breath(g), right: fb.right, roll: fb.roll });
};

// ---------------------------------------------------------------------------------------------------- the shot
/** Newton (scene clock g): "focus" while he writes in silence, the flat deadpan from his first line on (B04 to the end:
 *  "N writing on, unchanged"); the swap hides under a blink after the freeze (g > FREEZE.at) */
const NEWTON_EXPR: [number, "focus" | "deadpan"][] = [[S.from, "focus"], [sceneF(L4.from + 6), "deadpan"]];
/** Humphrey: smile (polite) for his line; the sigh; the smile again for his glance back (script v5 row 07) */
const HUMPHREY_EXPR: [number, "neutral" | "smile" | "sigh" | "deadpan"][] = [[S.from, "smile"], [T_SIGH, "sigh"], [T_DZ - 2, "smile"]];
/** his blinks run on the scene clock with this offset (no blink across the held frame FREEZE.at) */
const N_BLINK_T = 1.3;
/** a head move scaled (B04 "head with words 0.3") */
const scaleHead = (h: RigHead | undefined, k: number): RigHead | undefined => h && { dx: (h.dx ?? 0) * k, dy: (h.dy ?? 0) * k, tilt: (h.tilt ?? 0) * k, scale: 1 + ((h.scale ?? 1) - 1) * k, squash: (h.squash ?? 0) * k };

const pose = (w: World, f: number): Pose => {
  const g = sceneF(f), t = g / FPS;
  w.setPlace("room");
  w.set.param("hour", "morning");
  w.set.param("door", f < T_GONE ? doorK(f) : 0);
  w.set.param("shaftSoft", 1);
  let cam = camAt(f, g);
  // WHIP ② out: on the noon strike she turns left to the window table (the outgoing half: C lands it)
  const wp = C.whip(cam, f, T_WHIP, { dir: -1, out: 6, in: 6, deg: 25 });
  cam = wp.cam;
  w.setCamera(cam);

  // NEWTON: writing standing at the paper-buried desk; never looks up in B (NO-LOOK B01-B08)
  const n: Rig = w.actor(NEWTON_INK);
  const nq = saying("nt", f);
  const ns = nq && f >= nq.from - 1 ? ntSpeak(nq, f, 1) : {};
  n.set({
    at: N_AT.clone(), facing: N_FACING, pose: { kind: "idle", t: t + 1.7 }, expr: at(g, NEWTON_EXPR), ...ns,
    // (his own blinks only, on the scene clock: the talking blink of speak() would land on 没, the whisper's XC)
    blink: lid(t + N_BLINK_T, 1, swaps(NEWTON_EXPR).map((s) => s + N_BLINK_T)),
    head: scaleHead(ns.head, 0.3),
    lookDown: 40, gaze: 0, hands: [quillHand(g), leftHand(f, g)], twist: flickTwist(f), hide: NEWTON_HIDE_WRITING, visible: true,
  });

  // HUMPHREY: the lid, "Sir, your dinner.", the sigh, out of the door
  const hs = humphreyAt(f);
  let hm: Rig | null = null;
  if (hs) {
    hm = w.actor(HUMPHREY);
    const hq = saying("hm", f);
    const toLid = smooth(clamp01((f - S.from) / Math.max(1, T_LID - S.from)));
    const lp = f < T_LID ? null : lidPose(f);
    let right = f < T_LID ? PLATE_RIM.clone().lerp(LID_RIM_ON, toLid) : lp?.hand ?? null;
    // letting go: the fist comes back off the rim low over the table's edge and drops to his side
    if (f >= T_FREE && f < T_FREE + 8) {
      const k = (f - T_FREE) / 8, back = rel(hs.at, hs.facing, -0.15, 0.77, 0.14);
      right = k < 0.5 ? LID_DOWN.clone().add(LID_RIM).add(GRIP).lerp(back, smooth(k * 2)) : back.lerp(hang(hs.at, hs.facing, 0), smooth(k * 2 - 1));
    }
    const hsp = hq ? speak(hq, f, 2) : {};
    hm.set({
      at: hs.at, facing: hs.facing, pose: hs.pose, expr: at(f, HUMPHREY_EXPR), blink: lid(t, 2, swaps(HUMPHREY_EXPR)), ...hsp,
      head: heads(hsp.head, f >= T_SIGH && f < T_SIGH + sec(0.6) ? { dy: -0.06 * Math.sin(Math.PI * (f - T_SIGH) / sec(0.6)) } : undefined),
      // in the insert his eyes are on the plate (down and to screen left), then on Newton as he turns (note B3)
      lookDown: f < T_TURN0 ? 24 : 0, gaze: f < T_TURN0 - 1 ? -1 : f < T_TURN0 + 1 ? -0.5 : 0, hands: [right, null], visible: true,
    });
  }

  // the room: B's plate (cover lifted on the clink: steam), the desk's things, his figured page, the chair aside
  const plate = w.prop("plate", "B"), plateLid = plateLidGroup(plate.group);
  if (plateLid) lidInside(w, plateLid);
  plate.put(ROOM.plate.clone(), { rot: H0_FACING, lid: f < T_LID ? 1 : f === T_LID ? 0.82 : 0, steam: 1, t });
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  const sheets = w.prop("sheets");
  geoPage(w, sheets.group);
  sheets.put(ROOM.deskWrite, { n: 3 });
  w.prop("chair").put(CHAIR_ASIDE, { rot: ROOM.chairFacing });

  w.update();

  // the held things: his quill, Humphrey's cover (where his fist really is, so it never floats off it)
  w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT });
  if (f > T_LID) {
    const L = lidPose(f), o = hm && L.hand && f < T_DOWN ? L.o.clone().add(hm.handWorld(0).sub(L.hand)) : L.o;
    const cover = w.prop("lid", "B");
    lidInside(w, cover.group);
    cover.put(o, { rot: L.q });
  }

  // the insert's light focus on the plate (Humphrey beside it), easing out over the step back
  const soft = 1 - smooth(clamp01((f - T_SB0) / (T_SB1 - T_SB0)));
  const lens = C.camAxes(cam).p;
  const dof = soft > 0.02 ? { focus: lens.distanceTo(ROOM.plate), amount: 3 * soft } : undefined;
  const post = wp.post ?? (dof ? { dof } : undefined);
  return { camera: cam, clock: t, post, overlays: wp.smear > 0 ? C.whipSmear(wp.smear, -1) : undefined, slate: "B" };
};

export const SEG: Segment = { id: "B", from: S.from, to: S.to, enter() {}, exit() {}, pose };
