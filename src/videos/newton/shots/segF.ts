// SEGMENT F · 夜 · the night garden, then the elaboratory: the turn and the quiet scene (script v5 F rows, camplan F.md
// with its director notes round 1; OVERVIEW 14 Nov). ONE TAKE inside one place after one join: whip ⑧ in (E's outgoing
// half pans right; F carries the incoming half), MATCH ⑨ on his candle (the flame at the same place and size in the
// garden's last frame and the elaboratory's first), and F's last frame held still for the clock join ⑩ (no cut: G opens
// on it; segF_parts holds the marks G reads). Every time is a voice or sound anchor (line() / capWord() / card() /
// BEAT.F, which are lookups into the generated timing); every frame is a pure function of f.
//
// HER CAMERA (every move has its reason and lands on its word or sound; everything else HOLDS):
//   G  3020-3051  WHIP ⑧ IN (6 f, panning right as E's half did) onto THE FOLLOW: behind him and 0.6 m to his left,
//                 his candle at (560, 980), the box hedge in the lower left, the outbuilding's glowing door ahead
//                 (the lead walks). A light walk bob, no handheld noise.
//   ⑨    3052     MATCH CUT ON HIS CANDLE: the same offset behind him inside, so the flame keeps its place and size.
//   M1 3052-T_W3  FOLLOW IN: she crosses behind him to the bench's end and turns to him, landing on 炼金 (F01) in the
//                 three-thing (the furnace and its fire door, Newton at the fire, Humphrey at the heap; the empty
//                 sack waits on a second stool behind her, off frame). HOLD over F02 (NO-LOOK).
//   M2 card 3     SNAP TO THE THING (7 f, landing on card 3's first frame): his own handwritten pages on the bench by
//                 the mouldy book; the card beside them. The shovel's two throws are heard under it.
//   M3 F03        TILT BACK UP to him, landing on "Go to bed" (the speaker changes). His two-finger flick, no look.
//   M4 F04        SLOW PUSH over her whole promise (sine in-out), landing on 一天: three-thing -> medium.
//      F05        HOLD: "Nobody stays a whole day." (a held beat first: he could walk away and does not). He turns
//                 away on the line's tail (T_NGO, about 25 f before its end: the candlestick's knock is fixed at 3499).
//   M5 step down  Humphrey takes the sack and goes; Newton walks round the stool to the furnace corner, lifts his board
//                 off its nail on the furnace face,
//                 sets his candle down in its place (the candlestick's knock), turns and sits (the stool's creak): she
//                 follows him and comes down to S', crouched at his seated eye height, level, in one eased move that
//                 lands on 火 of F06 (the TWO: Newton, the fire door, the board on his knee). She stays crouched there.
//      F06-F08    HOLD (the charcoal scratching; the turn: F07; the charcoal stops).
//   M6 F09-F15    THE ONE SLOW PUSH, lens only, from "My mother" to "dressings" (24.5 s, constant in log(tan), soft
//                 starts): TWO -> the scene's one extreme close. The quiet scene's only move.
//      to F's end HOLD the extreme close through F16, the silence and the start of the race ⑩ (G goes on from it).
// THE QUIET (F07 to the end): no snap, no jolt, no sway, no breathing on the lens, no screen effect. The poke and the spit
// are the fire's own 3D sparks and glow in the world (behind his face), on their sound anchors (the poke f3986, the
// spit f4318). No poke after F16 (the sound has none: SYNC_POINTS row 75).
// SHE IS INVISIBLE: no mic, no hand. Nothing of hers is ever in the picture.
import * as THREE from "three";
import { SEGMENTS, line, capWord, card, FPS, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT, N_SCALE, newtonEyes } from "../people";
import { GDX, GARDEN_SET, ELX, ELAB, ELAB_SET, type TaSeat } from "../layout";
import { STOOL, candleTop } from "../props";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, rel, seated, kneel, type Rig, type RigPose } from "./common";
import {
  V, sec, posOf, creepU, fromWalk, sineIO, lagged, quatYZ, shovelPut, stroke, BOARD, POKER, F_SEAT, F_BOARD, F_CANDLE, F_POKER_REST, F_SEAT_EYES, F_EYE_CROUCH, F_S, F_TWO, F_XC,
  F_END_CAM, putStoolUnder, fireF, putSparks, sparksOff, putFlare, flareOff, putCandleLight, candleLightOff, GRADE_BASE, GRADE_NIGHT, GRADE_LATE, mixGrade, type LitQuad,
} from "./segF_parts";
import type { World } from "../world";

const S = SEGMENTS[5], F = BEAT.F;
const L01 = line("F01"), L02 = line("F02"), L03 = line("F03"), L04 = line("F04"), L05 = line("F05"), L06 = line("F06"), L07 = line("F07");
const L08 = line("F08"), L09 = line("F09"), L10 = line("F10"), L11 = line("F11"), L12 = line("F12"), L13 = line("F13"), L14 = line("F14");
const L15 = line("F15"), L16 = line("F16");

// ==================================================================================================== the anchors
/** WHIP ⑧: E's outgoing half starts here (BEAT.E.whipOut, 4 frames to F's first frame); F carries the incoming half */
const T_WHIP = BEAT.E.whipOut, WHIP_OUT = S.from - T_WHIP, WHIP_IN = 6;
/** MATCH ⑨ (the elaboratory's first frame) and the follow in's landing on 炼金 */
const T_IN = F.inside, T_W3 = F.gold + 6;
/** card 3 (nobody speaks): the snap to his pages lands on its first frame */
const CARD3 = card("F02");
const T_SNAP1 = CARD3.from, T_SNAP0 = T_SNAP1 - 7;
/** the tilt back up lands on "Go to bed" */
const T_TILT1 = L03.from, T_TILT0 = T_TILT1 - 12;
/** the slow push over her promise (F04 start .. 一天) */
const [T_PR0, T_PR1] = F.promise;
/** HUMPHREY: his two throws (the shovel under card 3); he leans the shovel on the furnace; the sack (he takes it on
 *  BEAT.F.sackOut, his steps out from F05 end + 0.25) */
const [TH1, TH2] = F.shovel;
const T_FREE = TH2 + 20;
const T_TAKE = F.sackOut, T_GO = T_TAKE + 4;
/** NEWTON: the candlestick's knock on the iron (BEAT.F.candle), the stool (BEAT.F.sit), the scratching (BEAT.F.board) */
const T_SET = F.candle, T_SIT = F.sit, [T_SCR0, T_SCR1] = F.board;
/** the step down: she sets off as he turns away to his stool; it lands on 火 of F06 */
const T_SD1 = F.fire;
/** THE ONE SLOW PUSH */
const [T_PU0, T_PU1] = F.push;
/** the poke and the spit (sound anchors) */
const T_POKE = F.poke, T_SPIT = F.spit;
/** STOP 4/5: the poker stops 12 frames before "Close?" (F11 start) */
const T_STOP = L11.from - 12;
/** her standing eye height (the format: about 1.5 m) */
const EYE_F = 1.5;
/** her breathing while she stands still (a few mm, no turn): only before the quiet */
const breath = (f: number) => 0.004 * Math.sin((2 * Math.PI * 0.24 * f) / 30 + 0.7);

// ==================================================================================================== THE FOLLOW (garden and in)
/** her place behind the walker: back along his way, out to his left, her eye height */
const FOLLOW = { back: 1.4, side: 0.6 };
/** the flame on screen through the follow and on both frames of the match */
const FLAME_PX = { x: 560, y: 1040 }, FOLLOW_FOV = 62;
/** his candle hand while he walks (his left: E handed it to him so), the same in the garden and inside, so the match
 *  holds; the same bob on the same frames */
const carryHand = (at: THREE.Vector3, facing: number, f: number, moving: boolean) => rel(at, facing, 0.27, 0.74 + (moving ? 0.012 * Math.sin((f / FPS) * Math.PI * 2 * 1.1) : 0), 0.12);
const CANDLE_LEN = F_CANDLE.len;
/** the flame of a candle held by its ring handle at `hand` (rot 0: the candle 7 cm to the -x side of the ring) */
const flameOf = (hand: THREE.Vector3) => hand.clone().add(V(-0.069, candleTop(CANDLE_LEN) - 0.012, 0));
/** her follow position for a walker `lead(g)` (floor point) heading `dir` (unit, xz) */
const followPos = (f: number, lead: (g: number) => THREE.Vector3, dir: THREE.Vector3) => {
  const p = lagged(f, lead, 8), left = V(dir.z, 0, -dir.x);
  return p.addScaledVector(dir, -FOLLOW.back).addScaledVector(left, FOLLOW.side).setY(EYE_F + 0.01 * Math.sin((f / FPS) * Math.PI * 2 * 1.9));
};

// ---- the night garden: he walks north up the east walk toward the outbuilding's glowing door
const GW = GARDEN_SET.walks;
const G_X = GDX + GW.east;
const GPATH = [V(G_X, 0, -4.0), V(G_X, 0, GW.north)];
const gLeg = (f: number) => walkAlong(GPATH, 1.25, (f - S.from) / FPS + 1.28);
const NORTH = V(0, 0, -1);
const gFlame = (g: number) => { const l = gLeg(g); return flameOf(carryHand(l.at, l.facing, g, l.moving)); };
const gardenCam = (f: number): CamPose => C.aimCam(followPos(f, (g) => gLeg(g).at, NORTH), lagged(f, gFlame, 4), FLAME_PX.x, FLAME_PX.y, FOLLOW_FOV);

// ---- inside: in from the doorway (heading north, as in the garden), round the stool's east side to his place by the fire
const N_SPOT = ELAB.newtonFire, N_FIRE = ELAB.newtonFireFacing;
/** where he is on the cut: up the middle of the room (Humphrey at the heap stays out of the match frame, left), far
 *  enough in that her follow (1.4 m behind) is past the open door leaf, which stands into the room from the west jamb
 *  to z 0.94 (the first leg runs on back through the doorway, so her lag behind him is the garden's) */
const IN_P = V(ELX, 0, -0.6);
const NPATH = [V(ELX, 0, 1.5), V(ELX, 0, -0.7), V(ELX - 0.3, 0, -1.08), N_SPOT];
const N_SPEED = 1.25;
const N_T0 = T_IN - ((1.5 - IN_P.z) / N_SPEED) * FPS;
const nLeg = (f: number) => walkAlong(NPATH, N_SPEED, (f - N_T0) / FPS, { endFacing: N_FIRE });
const N_ARRIVE = Math.round(N_T0 + walkTime(NPATH, N_SPEED) * FPS);
const nFlameIn = (g: number) => { const l = nLeg(g); return flameOf(carryHand(l.at, l.facing, g, l.moving)); };
/** his facing at the fire: to it; a little toward her over her promise and his answer (no look: the eyes stay on the fire) */
const nFacing = (f: number) => ky(f, [[L04.from - 6, N_FIRE], [L04.from + 14, N_FIRE + 0.25], [L05.to, N_FIRE + 0.25]]);
const N_EYES = newtonEyes(N_SPOT, N_FIRE);

// ---- his way to the furnace corner (round the stool's east side), the candle set, the sit
/** he stands at the furnace's front, clear of the stool (his coat's hem 0.24 m off its seat), the candle's spot to his
 *  front left (his left hand sets it there, behind his head from her side), his board's nail ahead right */
const C_SPOT = V(ELX - 0.865, 0, -0.47);
const CPATH = [N_SPOT, V(ELX - 0.24, 0, -0.9), V(ELX - 0.38, 0, -0.43), C_SPOT];   // round the stool, his coat 0.4 m clear of it
const C_SPEED = 1.25;
const C_FACE = yawTo(C_SPOT, F_CANDLE.at);
const T_NARR = T_SET - 6;
const T_NGO = Math.round(T_NARR - walkTime(CPATH, C_SPEED) * FPS);
const cLeg = (f: number) => walkAlong(CPATH, C_SPEED, (f - T_NGO) / FPS, { endFacing: C_FACE });
/** the sit: from the candle's knock to the stool's creak he turns and sits (rise 1 -> 0) */
const T_SIT0 = T_SET + 1;
const FACE = F_SEAT.facing;
const sitK = (f: number) => easeInOutCubic(clamp01((f - T_SIT0) / (T_SIT - T_SIT0)));

/** NEWTON's body on frame f: where, facing, pose, seat */
type NB = { at: THREE.Vector3; facing: number; pose: RigPose; seat?: ReturnType<typeof seated>["seat"]; moving: boolean; phase: "garden" | "in" | "corner" | "sit" | "seated" };
const nBody = (f: number): NB => {
  const t = f / FPS;
  if (f < T_IN) { const g = gLeg(f); return { at: g.at, facing: g.facing, pose: g.pose, moving: g.moving, phase: "garden" }; }
  if (f < T_NGO) {
    const g = nLeg(f), arrived = f >= N_ARRIVE;
    const facing = arrived ? lerpA(g.facing, nFacing(f), smooth(clamp01((f - N_ARRIVE) / 8))) : g.facing;
    return { at: g.at, facing, pose: arrived ? { kind: "idle", t: t + 1.3 } : g.pose, moving: g.moving, phase: "in" };
  }
  if (f < T_SIT0) { const g = cLeg(f); return { at: g.at, facing: f < T_NGO + 6 ? lerpA(nFacing(f), g.facing, smooth((f - T_NGO) / 6)) : g.facing, pose: g.pose, moving: g.moving, phase: "corner" }; }
  if (f < T_SIT) {
    const k = sitK(f), top = C_SPOT.clone().lerp(F_SEAT.top, k).setY(F_SEAT.top.y);
    const sd = seated({ ...F_SEAT, top }, t, { rise: 1 - k, hipY: 0.545, scale: N_SCALE, facing: lerpA(C_FACE, FACE, smooth(clamp01((f - T_SIT0) / (T_SIT - T_SIT0 - 2)))) });
    return { at: sd.at as THREE.Vector3, facing: sd.facing as number, pose: sd.pose as NB["pose"], seat: sd.seat, moving: false, phase: "sit" };
  }
  const sd = seated(F_SEAT, t);
  return { at: sd.at as THREE.Vector3, facing: sd.facing as number, pose: sd.pose as NB["pose"], seat: sd.seat, moving: false, phase: "seated" };
};
/** his eyes (the camera's aim point) on frame f */
const nEyesAt = (f: number) => {
  const b = nBody(f);
  if (b.phase === "seated") return F_SEAT_EYES.clone();
  const stand = newtonEyes(b.at, b.facing);
  if (b.phase === "sit") return stand.lerp(F_SEAT_EYES, sitK(f));
  return stand;
};

// ==================================================================================================== HIS HANDS AND THINGS
// ---- the flick (FLICK 4/4) on "Go to bed": two fingers, low, out to his right, without looking
const T_FLICK = L03.from + 8;
const flickK = (f: number) => smooth(clamp01((f - (T_FLICK - 7)) / 6)) * (1 - smooth(clamp01((f - (T_FLICK + 12)) / 8)));
// ---- THE BOARD: hung on a nail on the furnace's face by the front corner, at his hand's height (the rig's arms are
// short and its head is half a metre wide: anything at the iron top's 1.29 m is at his head). His right fist takes it
// by its +x edge while his left sets the candle on the iron, carries it as he turns and sits, lays it on his knees
// (F_BOARD: the +x edge at his right); then his left hand holds its left edge and his right draws.
const FU = ELAB_SET.furnace, FD = FU.door, TOP_Y = FU.h + 0.07;
const B_WALL = { at: V(ELX + FU.x1 + BOARD.t / 2 - 0.001, 1.06, -0.49), rot: quatYZ(V(0, 1, 0), V(1, 0, 0)) };
/** the board's local axes in the world for a rotation */
const axes = (q: THREE.Quaternion) => ({ x: V(1, 0, 0).applyQuaternion(q), y: V(0, 1, 0).applyQuaternion(q), z: V(0, 0, 1).applyQuaternion(q) });
/** his right fist holds the board's +x edge (2 cm in): the board's middle from the fist */
const B_GRIP = BOARD.w / 2 - 0.02;
const boardMid = (hand: THREE.Vector3, q: THREE.Quaternion) => hand.clone().addScaledVector(axes(q).x, -B_GRIP);
const B_GRAB = B_WALL.at.clone().addScaledVector(axes(B_WALL.rot).x, B_GRIP);
const BA = axes(F_BOARD.rot);
const onBoard = (x: number, y: number, up = 0) => F_BOARD.at.clone().addScaledVector(BA.x, x).addScaledVector(BA.y, y).addScaledVector(BA.z, up);
const B_KNEE_GRIP = onBoard(B_GRIP, 0, 0.012);
/** his left hand on the board's left edge (the board's -x), his right hand's rest, the charcoal's rest (his right side) */
const HAND_L = onBoard(-(BOARD.w / 2 - 0.02), -0.04, 0.03);
const HAND_R_REST = onBoard(0.12, -0.06, 0.034);
const CH_REST = onBoard(0.13, 0.06, 0.007);
const CH_REST_ROT = quatYZ(BA.x.clone().add(BA.y.clone().multiplyScalar(0.4)), BA.z);
/** the charcoal's place on the board (his right half: stroke()'s x mirrored) */
const drawAt = (t: number, up: number) => { const st = stroke(t); return onBoard(-st.x, st.y, up + 0.012 * st.lift); };
/** the board's lift and carry: the right fist up to its edge (T_BR0 .. T_BG), off its nail (.. T_BUP), carried as he
 *  turns and sits, laid on his knees (T_BK0 .. T_BK1) */
const T_BR0 = T_SET - 14, T_BG = T_SET - 7, T_BUP = T_SET - 2, T_BK0 = T_SIT - 4, T_BK1 = T_SIT + 3;
const boardPose = (f: number, b: NB): { hand: THREE.Vector3; rot: THREE.Quaternion } | null => {
  if (f < T_BG) return null;
  if (f >= T_BK1) return { hand: B_KNEE_GRIP.clone(), rot: F_BOARD.rot.clone() };
  const off = B_GRAB.clone().add(V(0.05, -0.14, 0)), carry = rel(b.at, b.facing, -0.24, 0.8, 0.2);
  if (f < T_BUP) return { hand: B_GRAB.clone().lerp(off, smooth((f - T_BG) / (T_BUP - T_BG))), rot: B_WALL.rot.clone() };
  const kr = smooth(clamp01((f - T_BUP) / (T_BK1 - T_BUP)));
  if (f < T_BK0) return { hand: off.lerp(carry, smooth((f - T_BUP) / (T_BK0 - T_BUP))), rot: B_WALL.rot.clone().slerp(F_BOARD.rot, kr) };
  return { hand: carry.lerp(B_KNEE_GRIP, smooth((f - T_BK0) / (T_BK1 - T_BK0))), rot: B_WALL.rot.clone().slerp(F_BOARD.rot, kr) };
};
// ---- THE CANDLE set down: his left fist up over the iron, down onto the spot on the knock, let go
const C_GRIP = F_CANDLE.at.clone().add(V(0.069, 0.012, 0));
const T_CUP = T_SET - 13;
// ---- the charcoal: from his coat's pocket once the board is on his knees; drawing; laid on the board before the poker
const T_POCKET = T_BK1 + 4, T_CH_ON = T_POCKET + 2, T_DRAW = T_SCR0;
const POCKET = rel(F_SEAT.top, FACE, -0.2, 0.12, 0.12);
const T_CH_DOWN = L10.from - 24;
// ---- THE POKER (origin = the grip; the iron rod runs to RL): hung by its ring on the end of the lintel bar; keyed by the
// rod's END and direction; his fist is where the grip then is (end - dir * RL). It only ever enters the furnace through
// the fire door's opening. The poke line keeps his fist 2.5 cm further out from the furnace face (clearance fix).
const RL = POKER.len - 0.08, FACE_X = ELX + FU.x1;
const PK_END_REST = F_POKER_REST.grip.clone().addScaledVector(F_POKER_REST.dir, RL);
const PK_MOUTH = V(FACE_X + 0.025, 0.57, -0.88), PK_DIR = V(-0.42, -0.2, -0.18).normalize();
type PkKey = { f: number; end: THREE.Vector3; dir: THREE.Vector3 };
const along = (d: number): Omit<PkKey, "f"> => ({ end: PK_MOUTH.clone().addScaledVector(PK_DIR, d), dir: PK_DIR });
const PK_LIFT = (() => { const hand = V(ELX - 0.95, 0.95, -0.66), dir = V(0.15, -1, -0.2).normalize(); return { end: hand.clone().addScaledVector(dir, RL), dir }; })();
/** on its hook his fist takes the rod PK_HOLD below the ring, under the lintel bar's end (clearance fix) */
const PK_HOLD = 0.07, PK_TAKE = F_POKER_REST.grip.clone().addScaledVector(F_POKER_REST.dir, PK_HOLD);
/** F10 "the poker in his hand": he takes it off its hook (T_PK0), into the door's mouth, a slow idle stir; STOP 4/5
 *  (still from T_STOP: "Close?" and the whole line), THE POKE on its sound (in hard, twice), and back on its hook */
const T_PK0 = L10.from - 14;
const PK_KEYS: PkKey[] = [
  { f: T_PK0, end: PK_END_REST, dir: F_POKER_REST.dir }, { f: T_PK0 + 8, ...PK_LIFT }, { f: T_PK0 + 16, ...along(-0.02) }, { f: T_STOP, ...along(0.02) },
  { f: T_POKE - 4, ...along(-0.025) }, { f: T_POKE, ...along(0.13) }, { f: T_POKE + 5, ...along(0.03) }, { f: T_POKE + 9, ...along(0.11) }, { f: T_POKE + 14, ...along(0.02) },
  { f: T_POKE + 20, ...along(-0.03) }, { f: T_POKE + 26, ...PK_LIFT }, { f: T_POKE + 34, end: PK_END_REST, dir: F_POKER_REST.dir },
];
/** his idle stir between the mouth and the stop (a few cm in and out, slow) */
const stir = (f: number) => (f > T_PK0 + 16 && f < T_STOP ? 0.035 * Math.sin(((f - T_PK0 - 16) / FPS) * Math.PI * 2 * 0.45) * smooth(clamp01((f - T_PK0 - 16) / 10)) * (1 - smooth(clamp01((f - T_STOP + 10) / 10))) : 0);
const pokeAt = (f: number): { hand: THREE.Vector3; held: { end: THREE.Vector3; dir: THREE.Vector3 } | null; k: number } | null => {
  const a = PK_KEYS[0].f, b = PK_KEYS[PK_KEYS.length - 1].f;
  if (f < a - 7 || f > b + 8) return null;
  if (f < a) return { hand: HAND_R_REST.clone().lerp(PK_TAKE, smooth((f - (a - 7)) / 7)), held: null, k: 0 };
  if (f > b) return { hand: PK_TAKE.clone().lerp(HAND_R_REST, smooth((f - b) / 8)), held: null, k: 0 };
  for (let i = 1; i < PK_KEYS.length; i++) if (f <= PK_KEYS[i].f) {
    const A = PK_KEYS[i - 1], B = PK_KEYS[i], e = smooth(clamp01((f - A.f) / Math.max(1, B.f - A.f)));
    const end = A.end.clone().lerp(B.end, e).addScaledVector(PK_DIR, stir(f)), dir = A.dir.clone().lerp(B.dir, e).normalize();
    const inK = (key: PkKey) => (key.end === PK_END_REST ? 0 : 1);
    const k = lerp(inK(A), inK(B), e);
    return { hand: end.clone().addScaledVector(dir, -RL + PK_HOLD * (1 - k)), held: { end, dir }, k };
  }
  return null;
};
/** his posture's forward lean goes to 0 while his right hand works in front of his chest (the poker: clearance fix) */
const leanPitch = (f: number) => {
  const poker = smooth(clamp01((f - (T_PK0 - 6)) / 8)) * (1 - smooth(clamp01((f - (T_POKE + 36)) / 10)));
  // and while his left hand reaches up to set the candle on the iron (his head is at the iron's height)
  const candle = smooth(clamp01((f - (T_SET - 15)) / 6)) * (1 - smooth(clamp01((f - T_SET) / 10)));
  return 5 * (1 - Math.max(poker, candle));
};

// ==================================================================================================== HUMPHREY
const H_AT = V(ELX - 1.03, 0, -0.02);
const HEAP_EDGE = V(ELX - 1.3, 0.1, 0.48), FIRE_MOUTH = V(ELX - 1.1, 0.6, -0.76);
const P_WIDE = V(ELX + 1.65, EYE_F, 1.3), P_STEP = V(ELX + 1.42, EYE_F, 1.03);
const H_IDLE = yawTo(H_AT, P_WIDE) - 0.35, H_HEAP = yawTo(H_AT, HEAP_EDGE) - 0.3, H_FIRE = yawTo(H_AT, FIRE_MOUTH) - 0.45;
const H_TURN = -2.2;
/** the second stool (the folded empty sack on it) by the front wall, east of the door: out of every view after the follow
 *  in, so Humphrey goes for the sack and out of the door off the frame (heard: the sack, his steps), never between her
 *  and Newton as he sets his candle down; it stays where it is */
const ST1 = V(ELX + 0.35, 0, 1.3);
const SACK_ON_STOOL = ST1.clone().add(V(0, STOOL.seat, 0));
const hip = (face: number) => rel(H_AT, face, -0.17, 0.6, 0.04);
type Sh = { blade: THREE.Vector3; handle: THREE.Vector3 };
const shTo = (target: THREE.Vector3, face: number): Sh => { const hp = hip(face), d = target.clone().sub(hp).normalize(); return { blade: hp.clone().addScaledVector(d, 0.76), handle: d.multiplyScalar(-1) }; };
const SH_SCOOP_UP = shTo(HEAP_EDGE.clone().add(V(0.02, 0.2, -0.04)), H_HEAP);
const SH_SCOOP = shTo(HEAP_EDGE, H_HEAP);
const SH_CARRY = shTo(rel(H_AT, H_FIRE, -0.1, 0.62, 0.9), H_FIRE);
const SH_THROW = shTo(FIRE_MOUTH, H_FIRE);
const SH_IN: Sh = { blade: rel(H_AT, H_TURN, -0.1, 0.2, 0.23), handle: rel(V(), H_TURN, -0.15, 0.7, -0.3).normalize() };
const SH_UP: Sh = { blade: rel(H_AT, H_TURN, -0.2, 0.15, 0.25), handle: rel(V(), H_TURN, 0, 1, 0.12).normalize() };
const SH_LEAN: Sh = { blade: V(ELX - 1.36, 0.13, -0.08), handle: V(0.0, 1, -0.2).normalize() };
const H_LEAN = yawTo(H_AT, SH_LEAN.blade) - 0.3;
type ShKey = [number, Sh, number];
const throwKeys = (th: number): ShKey[] => [
  [th - 22, SH_SCOOP_UP, H_HEAP], [th - 18, SH_SCOOP, H_HEAP], [th - 14, SH_SCOOP_UP, H_HEAP], [th - 9, SH_IN, H_TURN], [th - 4, SH_CARRY, H_FIRE], [th, SH_THROW, H_FIRE], [th + 5, SH_CARRY, H_FIRE],
];
/** on the match cut his shovel bites the heap (the first shovel's sound is on the cut); he rests on it, yawning; the two
 *  throws; the shovel leaned on the furnace's side */
const SH_KEYS: ShKey[] = [
  [T_IN - 8, SH_SCOOP_UP, H_HEAP], [T_IN, SH_SCOOP, H_HEAP], [TH1 - 26, SH_SCOOP, H_HEAP],
  ...throwKeys(TH1), [TH1 + 10, SH_IN, H_TURN],
  ...throwKeys(TH2), [TH2 + 10, SH_IN, H_TURN], [TH2 + 14, SH_UP, H_TURN], [T_FREE - 2, SH_LEAN, H_LEAN],
];
const Y = V(0, 1, 0);
const toLocal = (sh: Sh, face: number): Sh => ({ blade: sh.blade.clone().sub(H_AT).applyAxisAngle(Y, -face), handle: sh.handle.clone().applyAxisAngle(Y, -face) });
const SH_LOCAL = SH_KEYS.map(([fk, sh, face]) => [fk, toLocal(sh, face), face] as ShKey);
const shovelAt = (f: number): { sh: Sh; face: number } => {
  let A = SH_LOCAL[0], B = SH_LOCAL[0], k = 0;
  if (f > SH_LOCAL[SH_LOCAL.length - 1][0]) A = B = SH_LOCAL[SH_LOCAL.length - 1];
  else for (let i = 1; i < SH_LOCAL.length; i++) if (f <= SH_LOCAL[i][0]) { A = SH_LOCAL[i - 1]; B = SH_LOCAL[i]; k = smooth(clamp01((f - A[0]) / Math.max(1, B[0] - A[0]))); break; }
  if (f <= SH_LOCAL[0][0]) { A = B = SH_LOCAL[0]; k = 0; }
  const face = lerpA(A[2], B[2], k);
  const bl = A[1].blade.clone().lerp(B[1].blade, k), hd = A[1].handle.clone().lerp(B[1].handle, k).normalize();
  return { sh: { blade: bl.applyAxisAngle(Y, face).add(H_AT), handle: hd.applyAxisAngle(Y, face) }, face };
};
const loaded = (f: number) => (f >= T_IN && f < TH1 - 18) || (f > TH1 - 18 && f < TH1) || (f > TH2 - 18 && f < TH2);
/** YAWN 2/2 (about 1 s) while she lands on 炼金 */
const T_YAWN0 = F.gold - 12, T_YAWN1 = T_YAWN0 + sec(1.0);
const yawnK = (f: number) => clamp01((f - T_YAWN0) / 5) * (1 - clamp01((f - T_YAWN1) / 6));
/** his way out: to the stool for the sack; then out through the door WITHOUT the old upstage loop (camplan staging 2) */
const H_TAKE = ST1.clone().add(V(-0.415, 0, -0.174));
const HPATH_OUT = [H_AT, V(ELX - 0.75, 0, 0.6), H_TAKE], HPATH_DOOR = [H_TAKE, V(ELX - 0.32, 0, 1.6), ELAB.doorOut];
const H_SPEED_OUT = 0.9, H_SPEED_DOOR = 1.05;
const T_HWALK = Math.round(T_TAKE - 8 - walkTime(HPATH_OUT, H_SPEED_OUT) * FPS);
const T_HGONE = Math.round(T_GO + walkTime(HPATH_DOOR, H_SPEED_DOOR) * FPS);
const H_TAKE_FACE = yawTo(H_TAKE, ST1), OUT_YAW = yawTo(H_TAKE, HPATH_DOOR[1]);
/** THE EMPTY SACK as cloth (the full sack's body squashed flat: an empty bag), put by its neck */
const NECK_Y = 0.49;
type Limp = { up: THREE.Vector3; thin: THREE.Vector3; s: [number, number, number] };
const putLimpSack = (w: World, neck: THREE.Vector3, rot: THREE.Quaternion, s: [number, number, number]) => {
  const up = V(0, 1, 0).applyQuaternion(rot), P = w.prop("sack");
  P.put(neck.clone().addScaledVector(up, -NECK_Y * s[1]), { full: 1, rot });
  P.group.scale.set(s[0], s[1], s[2]); P.group.updateMatrixWorld(true);
};
const SACK_D = rel(H_TAKE, H_TAKE_FACE, 0.16, 0, 0.2).sub(ST1).setY(0).normalize();
const LIMP_LYING: Limp = { up: SACK_D, thin: V(0, 1, 0), s: [0.7, 0.62, 0.16] };
const SACK_GRAB = SACK_ON_STOOL.clone().add(V(0, 0.226 * LIMP_LYING.s[2] + 0.006, 0)).addScaledVector(SACK_D, (NECK_Y - 0.275) * LIMP_LYING.s[1]);
const SACK_OUT = 0.55;
const limpHanging = (right: THREE.Vector3): Limp => ({ up: V(0, 1, 0).addScaledVector(right, SACK_OUT), thin: right.clone(), s: [1.05, 0.95, 0.2] });
const mixLimp = (a: Limp, b: Limp, k: number) => ({ rot: quatYZ(a.up, a.thin).slerp(quatYZ(b.up, b.thin), k), s: [lerp(a.s[0], b.s[0], k), lerp(a.s[1], b.s[1], k), lerp(a.s[2], b.s[2], k)] as [number, number, number] });
const SACK_CARRY = (p: THREE.Vector3, face: number) => rel(p, face, 0.31, 0.72, 0.07);

// ==================================================================================================== HER CAMERA
/** the three-thing (W3): from the bench's end, his eyes upper right, the fire door in the middle, Humphrey at the heap */
const W3 = { sx: 850, sy: 640, fov: 61 };
/** his own pages on the bench by the mouldy book (the set's written papers), card 3 beside them (lower left) */
const DRAFTS_AT = V(ELX + 1.93, ELAB_SET.bench.top, 0.09), DRAFTS_ROT = 1.62;   // between the old book's spread and the crucibles
const PAGES = DRAFTS_AT.clone().add(V(0, 0.09, 0));
const PG = { sx: 760, sy: 620, fov: 44 };
/** the medium at the end of the push over her promise (she has stepped in 0.36 m) */
const MED = { sx: 720, sy: 622, fov: 44 };
const CROUCH = V(F_S.x, F_EYE_CROUCH, F_S.z);
const W3_CAM = (eyes = N_EYES) => C.aimCam(P_WIDE, eyes, W3.sx, W3.sy, W3.fov);
const PAGE_CAM = C.aimCam(P_WIDE, PAGES, PG.sx, PG.sy, PG.fov);
const MED_CAM = C.aimCam(P_STEP, N_EYES, MED.sx, MED.sy, MED.fov);
const TWO_CAM = C.aimCam(CROUCH, F_SEAT_EYES, F_TWO.sx, F_TWO.sy, F_TWO.fov);
/** the step down starts as he turns away from the fire for his stool */
const T_SD0 = T_NGO + 4;
/** the follow in: from her follow behind him (the match frame) across to the bench's end, landing on 炼金; the aim goes
 *  from his candle to his eyes, the lens from the follow's to the three-thing's */
const IN_DIR = NORTH;
const followIn = (f: number): CamPose => {
  const u = clamp01((f - T_IN) / (T_W3 - T_IN)), e = fromWalk(0.55)(u);
  const pos = followPos(f, (g) => nLeg(g).at, IN_DIR).lerp(P_WIDE, e);
  pos.y += 0.008 * Math.sin((f / FPS) * Math.PI * 2 * 1.9) * (1 - u);
  const k = smooth(clamp01((u - 0.08) / 0.75));
  const aimP = lagged(f, nFlameIn, 4).lerp(lagged(f, nEyesAt, 6), k);
  return C.aimCam(pos, aimP, lerp(FLAME_PX.x, W3.sx, k), lerp(FLAME_PX.y, W3.sy, k), C.zoomFov(FOLLOW_FOV, W3.fov, k));
};
/** a lens move between two poses given as {pos, at, sx, sy, fov}, eased by `e` */
type LP = { pos: THREE.Vector3; at: THREE.Vector3; sx: number; sy: number; fov: number };
const lensMix = (a: LP, b: LP, e: number) => C.aimCam(a.pos.clone().lerp(b.pos, e), a.at.clone().lerp(b.at, e), lerp(a.sx, b.sx, e), lerp(a.sy, b.sy, e), C.zoomFov(a.fov, b.fov, e));
const LP_W3: LP = { pos: P_WIDE, at: N_EYES, ...W3 };
const LP_PG: LP = { pos: P_WIDE, at: PAGES, ...PG };
const LP_MED: LP = { pos: P_STEP, at: N_EYES, ...MED };
const LP_TWO: LP = { pos: CROUCH, at: F_SEAT_EYES, ...F_TWO };
const LP_XC: LP = { pos: CROUCH, at: F_SEAT_EYES, ...F_XC };
/** the step down: she follows his head (a little late) as he goes to the corner and sits, and comes down to the crouch */
const stepDown = (f: number): CamPose => {
  const u = clamp01((f - T_SD0) / (T_SD1 - T_SD0)), e = sineIO(u);
  const pos = P_STEP.clone().lerp(CROUCH, e);
  pos.y += 0.008 * Math.sin(((f - T_SD0) / FPS) * Math.PI * 2 * 1.7) * Math.sin(Math.PI * clamp01(u / 0.8)) * (u < 0.8 ? 1 : 0);
  const head = lagged(f, nEyesAt, 8);
  // the aim: his head while he moves, settling on his seated eyes
  const k = smooth(clamp01((u - 0.55) / 0.45));
  const aimP = head.lerp(F_SEAT_EYES, k);
  return C.aimCam(pos, aimP, lerp(MED.sx, F_TWO.sx, e), lerp(MED.sy, F_TWO.sy, e), C.zoomFov(MED.fov, F_TWO.fov, e));
};
const camIn = (f: number): CamPose => {
  if (f < T_W3) return followIn(f);
  let c: CamPose;
  if (f < T_SNAP0) c = W3_CAM();
  else if (f < T_SNAP1) c = lensMix(LP_W3, LP_PG, easeInOutCubic((f - T_SNAP0) / (T_SNAP1 - T_SNAP0)));
  else if (f < T_TILT0) c = PAGE_CAM;
  else if (f < T_TILT1) c = lensMix(LP_PG, LP_W3, easeInOutCubic((f - T_TILT0) / (T_TILT1 - T_TILT0)));
  else if (f < T_PR0) c = W3_CAM();
  else if (f < T_PR1) c = lensMix(LP_W3, LP_MED, sineIO((f - T_PR0) / (T_PR1 - T_PR0)));
  else if (f < T_SD0) c = MED_CAM;
  else if (f < T_SD1) return stepDown(f);
  else if (f < T_PU0) return TWO_CAM;
  else if (f < T_PU1) return lensMix(LP_TWO, LP_XC, creepU(f, T_PU0, T_PU1, 10));
  else return F_END_CAM;
  // her breathing in the standing holds (never on a move's frames, never in the quiet)
  return C.nudge(c, { up: breath(f) });
};

// ==================================================================================================== THE FIRE, ITS LIGHT
const SPIT_UP = 6, SPIT_HOLD = 3, SPIT_DOWN = 14;
/** THE SPIT'S RISE: the first light on the sync frame, full on its 6th, held, dying down over SPIT_DOWN (never a frame flash) */
const spitK = (f: number, on: number) => {
  const d = f - on, full = SPIT_UP - 1;
  return d < 0 || d > full + SPIT_HOLD + SPIT_DOWN ? 0 : d < full ? smooth((d + 1) / SPIT_UP) : d <= full + SPIT_HOLD ? 1 : 1 - smooth((d - full - SPIT_HOLD) / SPIT_DOWN);
};
/** how much of the spit reaches the ROOM's light (row 8: the room +13 % at most); the rest is the 3D glow in the door */
const SPIT_ROOM = 0.12;
/** a flare of the fire on a hit: up in 2 frames, down over `len` */
const flareK = (f: number, on: number, len: number) => { const d = f - on; return d < -2 || d > len ? 0 : d < 0 ? (d + 2) / 2 : 1 - easeOutCubic(d / len); };
const fireAt = (f: number) => {
  const base = fireF(f), sp = spitK(f, T_SPIT), th = Math.max(flareK(f, TH1, 14), flareK(f, TH2, 14)), pk = flareK(f, T_POKE, 12);
  return { fire: Math.min(1, base.fire + SPIT_ROOM * sp + 0.25 * th + 0.3 * pk * (1 - base.fire)), embers: clamp01(base.embers * (1 - 0.85 * sp) * (1 - 0.55 * pk)), late: base.late, spit: sp, poke: pk };
};
/** the fire door's mouth (the top of its opening, a hair out of the face) and its normal: the sparks come out here */
const MOUTH = V(FACE_X + 0.03, FD.y1 - 0.07, FD.z), OUT = V(1, 0, 0);
const GLOW_AT = V(FACE_X, (FD.y0 + FD.y1) / 2, FD.z);
/** HIS CANDLE'S LIGHT on the furnace's iron top once he has set it there (review v2 row 11): the pool round the
 *  candlestick, the plate's front and side edges, and the sand bath's front face (it looks at the flame) */
const TX0 = ELX + ELAB_SET.walls.x0, TX1 = ELX + FU.x1 + 0.04, TZ0 = FU.z0, TZ1 = FU.z1 + 0.04;
const FLAME_SET = F_CANDLE.at.clone().add(V(0, candleTop(CANDLE_LEN), 0));
const CL_AX = Math.max(TX0, FLAME_SET.x - 0.45), CL_AZ = Math.max(TZ0, FLAME_SET.z - 0.45), CL_RIM = 0.012, CL_BAND = 0.05;
const CANDLE_LIGHT: LitQuad[] = [
  { a: V(CL_AX, TOP_Y + 0.0012, CL_AZ), u: V(TX1 - CL_AX, 0, 0), v: V(0, 0, TZ1 - CL_AZ), nu: 40, nv: 40, gain: 0.3 },
  { a: V(CL_AX, TOP_Y + 0.0018, TZ1 - CL_RIM), u: V(TX1 - CL_AX, 0, 0), v: V(0, 0, CL_RIM), nu: 40, nv: 1, gain: 0.22 },
  { a: V(TX1 - CL_RIM, TOP_Y + 0.0018, CL_AZ), u: V(CL_RIM, 0, 0), v: V(0, 0, TZ1 - CL_AZ), nu: 1, nv: 40, gain: 0.22 },
  { a: V(CL_AX, TOP_Y - CL_BAND, TZ1 + 0.0015), u: V(TX1 - CL_AX, 0, 0), v: V(0, CL_BAND, 0), nu: 40, nv: 1, gain: 0.2, fade: true },
  { a: V(TX1 + 0.0015, TOP_Y - CL_BAND, CL_AZ), u: V(0, 0, TZ1 - CL_AZ), v: V(0, CL_BAND, 0), nu: 40, nv: 1, gain: 0.2, fade: true },
  { a: V(ELX + FU.x1 - 0.42, TOP_Y, FD.z + 0.25 + 0.0015), u: V(0.38, 0, 0), v: V(0, 0.08, 0), nu: 24, nv: 4, gain: 0.7, n: V(0, 0, 1) },
];
const candleGlow = (t: number) => 1 + 0.05 * Math.sin(t * 9.1) + 0.03 * Math.sin(t * 13.7 + 0.4);

// ==================================================================================================== FACES
type Ex = "deadpan" | "focus" | "sad";
/** deadpan (NO-LOOK, the flick, "Nobody stays": all flat); focus while he draws; plain on F07; from F09 his face may
 *  melt (each change under a blink); sad on "left me", plain again for her "Three?", sad from "boy" to the end (both eyes
 *  alike: never the one-eyed `pained`, which read as a wink) */
const N_EXPR: [number, Ex][] = [
  [S.from, "deadpan"], [T_DRAW + 4, "focus"], [L07.from, "deadpan"],
  [capWord("F12", "left").from, "sad"], [L13.from, "deadpan"], [capWord("F14", "boy").from + 4, "sad"], [capWord("F14", "burn").from + 10, "sad"],
];
/** his eyes (screen: -1 left .. 1 right; the fire is on his screen left in every view inside) */
const N_GAZE: [number, number][] = [
  [S.from, 0], [N_ARRIVE - 4, -0.5], [T_NGO, 0], [T_SIT, 0], [T_DRAW, 0], [L09.from + 6, -0.5], [T_PK0, -0.25],
  [T_STOP, 0.5], [L11.from + 6, -0.5], [L13.from + 2, -0.25], [L14.from + 6, -0.5], [L16.from, -0.5],
];
/** how far his head is bowed (deg): over the fire standing; over the board drawing; plain on F07; on the fire through the
 *  story, a little lower on the shameful lines, never so low the extreme close loses his eyes */
const nLook = (f: number) => ky(f, [
  [N_ARRIVE, 0], [N_ARRIVE + 10, 14], [T_NGO, 14], [T_NGO + 8, 4], [T_SIT, 10], [T_DRAW, 36], [L07.from, 36], [L07.from + 12, 24], [L09.from, 24], [L09.from + 14, 10],
  [T_STOP - 2, 10], [T_STOP + 4, 7], [L11.from + 4, 10], [L14.from + 4, 10], [L14.from + 16, 15], [L15.from + 10, 15], [L15.from + 22, 9],
]);
const HM_EXPR: [number, "sleep" | "neutral"][] = [[S.from, "neutral"], [T_FREE + 8, "sleep"], [T_HWALK, "neutral"]];

// ==================================================================================================== THE SHOT
const pose = (w: World, f: number): Pose => {
  const t = f / FPS;

  // ============================================================ THE NIGHT GARDEN (whip ⑧ in, the follow)
  if (f < T_IN) {
    candleLightOff(w); sparksOff(w); flareOff(w);
    w.setPlace("garden");
    w.set.param("time", "night");
    w.set.param("glow", 1);
    w.set.param("gravel", "rough");
    const base = gardenCam(f);
    const Wh = C.whip(base, f, T_WHIP, { dir: 1, out: WHIP_OUT, in: WHIP_IN });
    const cam = Wh.cam;
    w.setCamera(cam);
    const g = gLeg(f), n: Rig = w.actor(NEWTON);
    n.set({ at: g.at, facing: g.facing, pose: g.pose, turn: 1, expr: "deadpan", blink: lid(t, 1), hide: NEWTON_HIDE, visible: true, seat: undefined,
      hands: [null, carryHand(g.at, g.facing, f, g.moving)] });
    w.update();
    w.prop("candle").put(n.handWorld(1), { grip: "grip", len: CANDLE_LEN, lit: true, t });
    const post: Pose["post"] = Wh.post ?? { dof: { focus: posOf(cam).distanceTo(n.headWorld()), amount: 2 } };
    return { camera: cam, post: { ...post, grade: GRADE_NIGHT }, overlays: Wh.smear > 0 ? C.whipSmear(Wh.smear, 1) : undefined, slate: f < S.from + WHIP_IN ? "F whip in" : "F garden" };
  }

  // ============================================================ THE ELABORATORY (one take)
  w.setPlace("elaboratory");
  const fs = fireAt(f);
  w.set.param("fire", fs.fire);
  w.set.param("embers", fs.embers);
  w.set.param("candle", 1);
  const cam = camIn(f);
  w.setCamera(cam);

  // ---- NEWTON
  const n: Rig = w.actor(NEWTON);
  const b = nBody(f);
  const nq = saying("nt", f), ns = nq ? speak(nq, f, 1) : {};
  const expr = at(f, N_EXPR);
  const stopped = f >= T_STOP && f < L11.from + 2;
  const tilt = accent("lean", f, capWord("F05", "whole").from, { dur: 1.4, dir: 1, amp: 0.7 });
  const dress = capWord("F15", "dressings").from;
  const tremble = f >= dress && f < L15.to + 12 ? { tilt: 0.6 * Math.sin(t * 2 * Math.PI * 5.5) * smooth(clamp01((f - dress) / 8)) * (1 - smooth(clamp01((f - L15.to) / 12))) } : undefined;
  const chinUp = stopped ? { tilt: 0 } : undefined;
  const head = heads(ns.head, tilt, tremble, accent("jolt", f, capWord("F11", "Close").from, { amp: 0.4 }), chinUp);
  // hands
  let right: THREE.Vector3 | null = null, left: THREE.Vector3 | null = null;
  const bp = boardPose(f, b);
  const poke = b.phase === "seated" ? pokeAt(f) : null;
  if (b.phase === "garden" || b.phase === "in" || b.phase === "corner") {
    // the candle in his left fist: carried as in the garden; lower and still once he stands at the fire
    const settle = b.phase === "in" ? smooth(clamp01((f - N_ARRIVE) / 10)) : b.phase === "corner" ? 1 - smooth(clamp01((f - T_NGO) / 8)) : 0;
    left = carryHand(b.at, b.facing, f, b.moving).lerp(rel(b.at, b.facing, 0.21, 0.68 + 0.003 * Math.sin(t * 1.3), 0.15), settle);
    if (b.phase === "corner" && f >= T_CUP) {
      // up in front of the plate's edge, over it, down onto the spot on the knock
      // (beside his head on the left, never through it; the rise leads, so the saucer clears the plate's edge)
      const pre = C_GRIP.clone().add(V(0.08, 0.06, 0.1)), up = C_GRIP.clone().add(V(0.01, 0.03, 0));
      const k1 = smooth(clamp01((f - T_CUP) / 8)), k1y = smooth(clamp01((f - T_CUP) / 5)), k2 = smooth(clamp01((f - T_CUP - 8) / 3)), k3 = smooth(clamp01((f - T_CUP - 11) / (T_SET - T_CUP - 11)));
      const y0 = left.y;
      left.lerp(pre, k1).setY(lerp(y0, pre.y, k1y));
      left.lerp(up, k2).lerp(C_GRIP, k3);
    }
    if (flickK(f) > 0) {
      const fl = f >= T_FLICK - 1 && f < T_FLICK + 6 ? Math.sin((Math.PI * (f - T_FLICK + 1)) / 7) : 0;
      right = rel(b.at, b.facing, -0.27, 0.62, 0.08).lerp(rel(b.at, b.facing, -0.3 - 0.1 * fl, 0.84 + 0.04 * fl, 0.24), flickK(f));
    }
    if (b.phase === "corner" && f >= T_BR0) right = rel(b.at, b.facing, -0.25, 0.66, 0.1).lerp(B_GRAB, smooth(clamp01((f - T_BR0) / (T_BG - T_BR0))));
  }
  if (b.phase === "sit") left = f < T_SET + 2 ? C_GRIP.clone() : null;
  if (bp && f < T_BK1 + 2) right = bp.hand;
  if (b.phase === "seated") {
    const lOn = smooth(clamp01((f - T_SIT) / 6));
    left = rel(F_SEAT.top, FACE, 0.18, 0.12, 0.12).lerp(HAND_L.clone().add(V(0, 0.002 * Math.sin(t * 0.9), 0)), lOn);
    if (f >= T_BK1 + 2) {
      const drawing = f >= T_DRAW && f < T_SCR1 + 1;
      if (f < T_CH_ON) right = B_KNEE_GRIP.clone().lerp(POCKET, smooth((f - T_BK1 - 2) / (T_CH_ON - T_BK1 - 2)));
      else if (f < T_DRAW) right = POCKET.clone().lerp(drawAt(T_DRAW / FPS, 0.046), smooth((f - T_CH_ON) / (T_DRAW - T_CH_ON)));
      else if (drawing) right = drawAt(t, 0.034);
      else {
        // the charcoal stops (F07): his fist rests on the board; it lays the charcoal down before the poker
        const stopAt = drawAt(T_SCR1 / FPS, 0.04);
        right = stopAt.lerp(HAND_R_REST.clone().add(V(0, 0.003 * Math.sin(t * 1.1), 0)), smooth(clamp01((f - T_SCR1) / 14)));
        if (f >= T_CH_DOWN - 10 && f < T_CH_DOWN + 6) right = right.lerp(CH_REST.clone().add(V(0, 0.03, 0)), Math.sin(Math.PI * clamp01((f - (T_CH_DOWN - 10)) / 16)));
      }
      if (poke) right = poke.hand;
    }
  }
  const twist = poke ? -0.2 * smooth(clamp01(poke.k * 1.4)) : 0;
  const gaze = stopped ? 0.5 : at(f, N_GAZE);
  const common = {
    expr, gaze, blink: stopped ? 0 : ns.blink ?? lid(t, 1, swaps(N_EXPR)), ...(ns.mouth ? { mouth: ns.mouth } : {}), head, lookDown: nLook(f) - (stopped ? 3 : 0),
    hide: NEWTON_HIDE, visible: true, hands: [right, left] as [THREE.Vector3 | null, THREE.Vector3 | null],
  };
  if (b.seat) n.set({ at: b.at, facing: b.facing, pose: b.pose, seat: b.seat, twist, lean: { pitch: leanPitch(f) }, turn: undefined, ...common });
  else n.set({ at: b.at, facing: b.facing, pose: b.pose, seat: undefined, twist: 0, lean: { pitch: leanPitch(f) }, turn: (b.phase === "in" && f < N_ARRIVE) || (b.phase === "corner" && f >= T_NARR - 10) ? 1 : undefined, ...common });

  // ---- HUMPHREY (until he is out of the door)
  let hm: Rig | null = null;
  const sh = shovelAt(f);
  const hmA = w.actor(HUMPHREY_SOOT);
  if (f < T_HGONE) {
    hm = hmA;
    const hExpr = at(f, HM_EXPR), yk = yawnK(f);
    if (f < T_HWALK) {
      const holding = f < T_FREE;
      const tEnd = sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.87);
      const pair = [sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.76), sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.58)];
      const twoHands = (f >= TH1 - 4 && f <= TH1 + 5) || (f >= TH2 - 4 && f <= TH2 + 5);   // the bite on the cut is one-handed: he is a sliver at the frame's edge
      const face = holding ? sh.face : lerpA(H_LEAN, H_IDLE, smooth(clamp01((f - T_FREE) / 12)));
      hm.set({ at: H_AT.clone(), facing: face, pose: { kind: "idle", t: t + 0.7 }, expr: yk > 0.4 ? "sleep" : hExpr, gaze: 0, blink: yk > 0.4 ? 0 : lid(t, 2), visible: true, seat: undefined,
        lookDown: twoHands ? 14 : 0, hands: holding ? (twoHands ? [pair[0], pair[1]] : [tEnd, null]) : [null, null],
        head: yk > 0 ? { dy: 0.08 * yk, squash: -0.06 * yk, tilt: -4 * yk } : undefined, ...(yk > 0.4 ? { mouth: "round" as const } : {}) });
    } else {
      const walk1 = walkAlong(HPATH_OUT, H_SPEED_OUT, (f - T_HWALK) / FPS, { endFacing: H_TAKE_FACE });
      const out = f >= T_GO ? walkAlong(HPATH_DOOR, H_SPEED_DOOR, (f - T_GO) / FPS) : null;
      const s = out ?? walk1;
      const face = out ? lerpA(OUT_YAW, s.facing, smooth(clamp01((f - T_GO) / 6))) : f >= T_TAKE ? lerpA(H_TAKE_FACE, OUT_YAW, smooth(clamp01((f - T_TAKE) / (T_GO - T_TAKE)))) : s.facing;
      const dip = Math.sin(Math.PI * clamp01((f - (T_TAKE - 10)) / 20));
      const handL = f < T_TAKE ? (f >= T_TAKE - 5 ? SACK_GRAB.clone() : null) : f < T_TAKE + 9 ? SACK_GRAB.clone().lerp(SACK_CARRY(s.at, face), easeOutCubic((f - T_TAKE) / 9)) : SACK_CARRY(s.at, face);
      hm.set({ at: s.at, facing: face, pose: s.pose, expr: "neutral", gaze: 0, blink: lid(t, 2), visible: true, seat: undefined, head: undefined, ...kneel(0.45 * dip, s.at, 20),
        hands: [null, handL], turn: f >= T_TAKE ? undefined : 0 });
    }
  } else hmA.set({ visible: false });

  // ---- props before the solve
  if (!poke || !poke.held) w.prop("poker").put(F_POKER_REST.grip, { rot: F_POKER_REST.rot, hot: 0 });
  w.prop("stool", "sack").put(ST1, { rot: 0.4 });
  if (f < T_TAKE) putLimpSack(w, SACK_GRAB, quatYZ(LIMP_LYING.up, LIMP_LYING.thin), LIMP_LYING.s);
  if (f >= T_FREE) { const P = shovelPut(SH_LEAN.blade, SH_LEAN.handle, V(0, 0, -1)); w.prop("shovel").put(P.at, { rot: P.rot }); }
  putStoolUnder(w, ELAB.stool, FACE);
  w.prop("drafts").put(DRAFTS_AT, { rot: DRAFTS_ROT });
  if (!bp) w.prop("board").put(B_WALL.at, { rot: B_WALL.rot });
  if (f >= T_SET) { w.prop("candle").put(F_CANDLE.at, { len: CANDLE_LEN, lit: true, t }); putCandleLight(w, FLAME_SET, CANDLE_LIGHT, smooth(clamp01((f - T_SET) / 8)) * candleGlow(t)); }
  else candleLightOff(w);
  if (f >= T_CH_DOWN + 2) w.prop("charcoal").put(CH_REST, { rot: CH_REST_ROT });

  w.update();

  // ---- held things (from where the fists really are)
  if (f < T_SET) w.prop("candle").put(n.handWorld(1), { grip: "grip", len: CANDLE_LEN, lit: true, t });
  if (bp) { const q = bp.rot; w.prop("board").put(f >= T_BK1 + 2 ? F_BOARD.at : boardMid(n.handWorld(0), q), { rot: q }); }
  if (f >= T_CH_ON && f < T_CH_DOWN + 2) {
    const hand = n.handWorld(0), tip = f >= T_DRAW && f < T_SCR1 + 1 ? drawAt(t, 0) : hand.clone().addScaledVector(BA.z, -0.05).addScaledVector(BA.y, 0.03);
    w.prop("charcoal").put(hand, { grip: "hilt", rot: quatYZ(tip.clone().sub(hand), BA.y) });
  }
  if (poke && poke.held) w.prop("poker").put(poke.held.end.clone().addScaledVector(poke.held.dir, -RL), { rot: quatYZ(poke.held.dir, V(1, 0, 0)), hot: 0.15 + 0.55 * poke.k });
  if (hm && f < T_FREE) { const P = shovelPut(sh.sh.blade, sh.sh.handle); w.prop("shovel").put(P.at, { rot: P.rot, load: loaded(f) }); }
  if (hm && f >= T_TAKE) {
    const hand = hm.handWorld(1), rgt = V(-Math.cos(hm.bodyYaw), 0, Math.sin(hm.bodyYaw));
    const kR = smooth(clamp01((f - T_TAKE - 3) / 7)), kL = smooth(clamp01((f - T_TAKE - 9) / 8)), L = mixLimp(LIMP_LYING, limpHanging(rgt), kR);
    putLimpSack(w, hand, L.rot, [L.s[0], lerp(LIMP_LYING.s[1], limpHanging(rgt).s[1], kL), L.s[2]]);
  }

  // ---- THE FIRE's own sparks and glow (3D, in the world, depth-tested behind his face): the throws, the poke, THE SPIT
  putSparks(w, "th1", f, TH1, MOUTH, OUT, { n: 16, len: 16, speed: 1.3, size: 0.03, seed: 1, up: 1.2 });
  putSparks(w, "th2", f, TH2, MOUTH, OUT, { n: 16, len: 16, speed: 1.3, size: 0.03, seed: 2, up: 1.2 });
  putSparks(w, "poke", f, T_POKE, MOUTH, OUT, { n: 12, len: 14, speed: 1.0, size: 0.028, seed: 3, up: 1.4, spread: 0.4 });
  putSparks(w, "spit", f, T_SPIT, MOUTH, OUT, { n: 60, len: 24, speed: 1.6, size: 0.034, seed: 5, stagger: 4, up: 1.5, spread: 0.6 });
  putFlare(w, GLOW_AT, Math.max(fs.spit, 0.35 * fs.poke, 0.3 * Math.max(flareK(f, TH1, 14), flareK(f, TH2, 14))));

  // ---- the lens's light focus: steady on his face (on his pages while she looks at them); the grade: the room sinks round
  // him as the fire dies (done before F07: nothing changes in the quiet stretch)
  const lens = posOf(cam), dHim = lens.distanceTo(n.headWorld()), pk = f >= T_SNAP0 && f < T_TILT1 ? (f < T_SNAP1 ? (f - T_SNAP0) / (T_SNAP1 - T_SNAP0) : f < T_TILT0 ? 1 : 1 - (f - T_TILT0) / (T_TILT1 - T_TILT0)) : 0;
  const post: Pose["post"] = { dof: { focus: Math.max(0.2, lerp(dHim, lens.distanceTo(PAGES), smooth(pk))), amount: 2.5 } };
  if (fs.late > 0.001) post.grade = mixGrade(GRADE_BASE, GRADE_LATE, fs.late);
  const slate = f < T_W3 ? "F follow in" : f < T_SD0 ? "F three-thing" : f < T_SD1 ? "F step down" : f < T_PU0 ? "F two" : f < T_PU1 ? "F push" : "F extreme close";
  return { camera: cam, post, slate };
};

export const SEG: Segment = { id: "F", from: S.from, to: S.to, enter() {}, exit(w) { candleLightOff(w); sparksOff(w); flareOff(w); }, pose };

/** (read by the notes and checks) the frames of F's moves */
export const F_MOVES = { whipIn: [S.from, S.from + WHIP_IN - 1], follow: [S.from, T_IN - 1], followIn: [T_IN, T_W3], snap: [T_SNAP0, T_SNAP1], tilt: [T_TILT0, T_TILT1], promise: [T_PR0, T_PR1], stepDown: [T_SD0, T_SD1], push: [T_PU0, T_PU1], hold: [T_PU1, S.to] } as const;
