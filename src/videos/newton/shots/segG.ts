// SEGMENT G · 凌晨两点 · the elaboratory, then his room by candle (script v5 G rows; camplan G.md with its director notes
// round 1, converted to the v5 voice anchors). ONE TAKE in the elaboratory with NO CUT at either end of it: join ⑩ is
// the REC clock racing over F's held extreme close (G's first frame IS F's last: segF_parts F_END_CAM and F's marks),
// and join ⑪ is the MATCH CUT from the circle drawn on his board (held in her invisible hands) to his 2 a.m. plate
// (same place, same size, same foreshortening: segG_parts matchCircle). Every time is a lookup (line() / capWord() /
// card() / BEAT.G / the mix's anchors in sound/SYNC_POINTS.md); every frame is a pure function of f.
//
// HER CAMERA (every move has its reason and lands on its word or sound; everything else HOLDS, dead still):
//   ⑩   4584-T_CLAT  HOLD F's extreme close (the race lands on 02:00 and the clock's first stroke): on the stroke his
//                 hands go slack, the board slides off his knee; he looks down after it.
//   M1  T_CLAT..T_HELD  DOWN TO THE BOARD AND UP ONTO ONE KNEE (about 1.7 s, from the knock on the second stroke):
//                 she tilts down along his look as the lens eases out of the extreme close and dips to the board at
//                 her feet (it slaps flat and skids in view); a still beat for the invisible take (its near edge tips
//                 up); she comes up onto one knee with it, level with him (eye 1.15 m), the board held up in front of
//                 him (circles and triangles, his face above it).
//      G01a  HOLD (kneeling, level; the board the foreground). Between the halves her hands turn the board round to
//                 face him. G01b HOLD: on 用 he STOPS DEAD; his eyes come up to the lens; she lowers the board out of
//                 the frame (the focus racks to him); the crack, about 10 frames.
//      G02   THE LAUGH in the same frame, DEAD STILL, to G02 end + 1.33 s (the skin's 1/1 + 证毕 plays in the hold;
//                 hud/ms/fit_G.ts). His eyes go past her to the doorway (Humphrey is there).
//   M2  the thump  THE PAN TO THE DOORWAY (20 f, from the sack's thump): she stands and turns to her left (about 100 deg,
//                 angles the short way, the lens in log(tan)); the smear on its fastest 6 frames only; no cut.
//      card 4 HOLD on the door: Humphrey's shock, the sack at his feet; Newton walks into the frame from the right
//                 with his candle, stops inside the door, turns to her. G03 "Good night." HOLD (the lead speaks to the
//                 lens). He goes out through the doorway, straight away from us with his candle, and off to the left;
//                 her G04 to the open door (her bow: 1.5 deg).
//   M3  先 .. T_DR1  THE LENS DROPS TO THE BOARD in her hands (it comes up as she looks down at it): the drawn circle.
//   ⑪   BEAT.G.room  MATCH CUT: the circle becomes his plate, by candle in his room; HOLD to the end: card 5; the bite on
//                 the fork's clink; he sets the plate down and pinches the candle out (the pluck); her camera switches
//                 off (hud/vlog.tsx OFF_AT); the end black.
// SHE IS INVISIBLE: no mic, no hand. The board's pose is kept in her frame (segG_parts heldBoard / toCamLocal).
import * as THREE from "three";
import { SEGMENTS, line, cap, capWord, card, FPS, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT, laugh, newtonEyes, facePoint } from "../people";
import { ELX, ELAB, ELAB_SET, RMX, ROOM, ROOM_SET } from "../layout";
import { BOARD, SACK, PLATE, candleTop } from "../props";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, rel, seated, type Rig, type RigPose } from "./common";
import { endBlack } from "../hud";
import {
  F_SEAT, F_BOARD, F_CANDLE, F_POKER_REST, F_SEAT_EYES, F_END_CAM, putStoolUnder, shovelPut, fireF, putCandleLight, candleLightOff, GRADE_BASE, GRADE_LATE, mixGrade, type LitQuad,
} from "./segF_parts";
import {
  V, sec, posOf, quatYZ, eulYZX, rigidAt, fall, toCamLocal, fromCamLocal, heldBoard, boxBottom, lightFocus, matchCircle, panCam, panSpeed, forkRot, FORK_TIP, pathAt,
  GRADE_OUT, mixGradeG, type RigidKey, type PtKey,
} from "./segG_parts";
import type { World } from "../world";

const S = SEGMENTS[6], G = BEAT.G;
const L1a = line("G01a"), L1b = line("G01b"), L2 = line("G02"), L3 = line("G03"), L4 = line("G04");
const CARD4 = card("G02");

// ==================================================================================================== the anchors
/** the race ⑩ lands on the town clock's first stroke; the second stroke = the board's knock on the brick (one sound) */
const T_S1 = G.strike1, T_CLAT = G.strike2;
/** the board: his hands go slack on the first stroke, it slides off his knee, knocks on the second, slaps flat 0.4 s
 *  later (sfx_board) and skids on to her feet */
const T_LETGO0 = T_S1 + 3, T_LETGO1 = T_S1 + 12, T_SLIP = T_CLAT - 12, T_FLAT = T_CLAT + sec(0.4), T_SKID1 = T_FLAT + 9;
/** M1: the tilt and dip (from the knock), the still take, the rise onto one knee (lands on the hold's first frame) */
const T_DIP0 = T_CLAT, T_DIP1 = T_CLAT + 19;
const T_TAKE0 = T_SKID1, T_RISE0 = T_TAKE0 + 5, T_HELD = G.kneel[1];
/** her sniff (sound): a small dip of her hands, once the board is held */
const T_SNIFF = G.sniff;
/** between G01a and G01b her hands turn the board round to face him */
const T_TURN0 = G.boardTurn[0], T_TURN1 = G.boardTurn[1];
/** on 用 he STOPS DEAD; his eyes come up to the lens; she lowers the board out of the frame; the crack; THE LAUGH */
const T_YONG = capWord("G01b", "用").from;
const T_EYESUP0 = T_YONG + 2, T_EYESUP1 = T_EYESUP0 + 8;
const T_LOWER0 = T_YONG + 4, T_LOWER1 = T_LOWER0 + 16;
const T_LAUGH = L2.from, T_CRACK = T_LAUGH - 10;
/** the laugh eases over its tail (T_WIPE0..1: the camplan's knuckle wipe, not built: from the stool his arm can not
 *  reach in front of his own head, it falls 11 cm short and its fist reads as a third eye); his eyes open and go past
 *  her to the doorway */
const T_EASE0 = capWord("G02", "use").from + 10, T_WIPE0 = L2.to - sec(1.05), T_WIPE1 = L2.to + 4, T_LAUGH_END = T_WIPE1 + 14, T_LOOKDOOR = T_LAUGH_END + 2;
/** THE THUMP (Humphrey drops the full sack: G02 end + 1.33 s, the end of the dead hold); the pan rides on it */
const T_SACK = L2.to + sec(1.33), T_DROP = T_SACK - 9;
const T_PAN0 = T_SACK, T_PAN1 = T_SACK + 20;
/** "Good night." (his) and her 「晚安，牛顿先生。」 (her bow, 1.5 deg); on 先 the lens drops to the board */
const T_BOW = L4.from - 1;
const T_DR0 = capWord("G04", "先").from, T_DR1 = T_DR0 + 18, DROP_YAW = 4.5;
/** MATCH ⑪ */
const T_MATCH = G.room;
/** the 2 a.m. bite: the fork's clink on the plate (G04 end + 1.2 s: SYNC row 88) */
const T_CLINK = L4.to + sec(1.2);
/** THE CANDLE GOES OUT on the knock's pluck (SYNC row 89); the end black on the power-down sweep (OFF_AT + 24) */
const T_OUT = G.candleOut, T_BLACK = G.black[0];
/** the last frame of her G04 subtitle (its screen runs 3 frames past the match: hidden in the room) */
const CAP_G04_END = cap("G04", -1).to;

// ==================================================================================================== the elaboratory: F's marks
const FACE = F_SEAT.facing;
const SEAT = F_SEAT;
/** F's board on his knees, its axes, points on it (segF's onBoard: +x at his right) */
const BX = V(1, 0, 0).applyQuaternion(F_BOARD.rot), BY = V(0, 1, 0).applyQuaternion(F_BOARD.rot), BZ = V(0, 0, 1).applyQuaternion(F_BOARD.rot);
const onBoard = (x: number, y: number, up = 0) => F_BOARD.at.clone().addScaledVector(BX, x).addScaledVector(BY, y).addScaledVector(BZ, up);
/** his hands as F leaves them (segF HAND_L / HAND_R_REST) and the charcoal lying on the board (segF CH_REST) */
const HAND_L0 = onBoard(-(BOARD.w / 2 - 0.02), -0.04, 0.03), HAND_R0 = onBoard(0.12, -0.06, 0.034);
const CH_REST = onBoard(0.13, 0.06, 0.007), CH_REST_ROT = quatYZ(BX.clone().add(BY.clone().multiplyScalar(0.4)), BZ);
/** what F leaves standing (segF: the sack's stool, the shovel leaning on the heap, the drafts on the bench) */
/** THE SACK'S STOOL: F leaves it at (ELX + 0.35, 0, 1.3), exactly where he must stop inside the door for G03 (his coat
 *  stood in it): in G it stands 0.5 m east, against the front wall (Humphrey cleared it to fetch the sack), off the
 *  frame in every shot of G (TWO's left edge is about 0.6 m west of it), so nothing on screen jumps. Shared ask: F
 *  could leave it here too */
const ST1 = V(ELX + 0.85, 0, 1.25), DRAFTS_AT = V(ELX + 1.93, ELAB_SET.bench.top, 0.09), DRAFTS_ROT = 1.62;
const SH_LEAN = { blade: V(ELX - 1.36, 0.13, -0.08), handle: V(0.0, 1, -0.2).normalize() };
/** his candle on the furnace top (F's, still tall: no lapse) and its light on the iron (a copy of segF's quads) */
const CANDLE_LEN = F_CANDLE.len;
const FU = ELAB_SET.furnace, FD = FU.door, TOP_Y = FU.h + 0.07;
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

// ---- THE BOARD FALLS (as built in v4, its far edge first): it slides forward off his knees, knocks on the brick in
// front of his feet on the second stroke, falls flat on its back skidding toward her, slaps down and skids to her feet
const LEFT = V(Math.cos(FACE), 0, -Math.sin(FACE)), FWD = V(Math.sin(FACE), 0, Math.cos(FACE));
/** it falls and skids along the line from his head to where she will kneel (HOLD), off his left knee: so from her
 *  crouch over it his head is straight above it (it leaves and comes back through the top's middle) */
const P_HOLD = V(ELX + 0.42, 1.15, 0.18);
const HEAD_FLOOR = V(F_SEAT_EYES.x, 0, F_SEAT_EYES.z);
const TO_HER = V(P_HOLD.x - HEAD_FLOOR.x, 0, P_HOLD.z - HEAD_FLOOR.z).normalize();
const YAW_FLOOR = Math.atan2(TO_HER.x, TO_HER.z);
const onEdge = (pivot: THREE.Vector3, x: number, y: number) => {
  const q = eulYZX(x, y, 0), yb = V(0, 1, 0).applyQuaternion(q), zb = V(0, 0, 1).applyQuaternion(q);
  return { at: pivot.clone().addScaledVector(yb, BOARD.h / 2).addScaledVector(zb, BOARD.t / 2), rot: q };
};
const PIV1 = HEAD_FLOOR.clone().addScaledVector(TO_HER, 0.6);
const PIV2 = PIV1.clone().addScaledVector(TO_HER, 0.18);
const X_KNOCK = -Math.PI / 2 + 0.85, X_FLAT = -Math.PI / 2;
const Y_KNOCK = lerp(FACE, YAW_FLOOR, 0.55), Y_FLAT = lerp(FACE, YAW_FLOOR, 0.9);
const K_KNOCK = onEdge(PIV1, X_KNOCK, Y_KNOCK), K_FLAT = onEdge(PIV2, X_FLAT, Y_FLAT);
const B_REST = onEdge(PIV2.clone().addScaledVector(TO_HER, 0.07), X_FLAT, YAW_FLOOR).at;
const Q_FLOOR = eulYZX(X_FLAT, YAW_FLOOR, 0);
const SLIDE_KEYS: RigidKey[] = [
  [T_SLIP, F_BOARD.at, F_BOARD.rot],
  [T_SLIP + 5, F_BOARD.at.clone().addScaledVector(FWD, 0.13).addScaledVector(LEFT, 0.05).add(V(0, -0.04, 0)), eulYZX(-Math.PI / 2 + 0.05, lerp(FACE, Y_KNOCK, 0.4), 0)],
  [T_CLAT, K_KNOCK.at, K_KNOCK.rot, (x: number) => 0.3 * x + 0.7 * x * x],
];
const boardFall = (f: number): { at: THREE.Vector3; rot: THREE.Quaternion } => {
  if (f <= T_CLAT) return rigidAt(f, SLIDE_KEYS);
  if (f <= T_FLAT) {
    const u = clamp01((f - T_CLAT) / (T_FLAT - T_CLAT)), k = fall(u);
    const piv = PIV1.clone().lerp(PIV2, smooth(u));
    const bump = f - T_CLAT < 4 ? 0.012 * Math.sin(Math.PI * (f - T_CLAT) / 4) : 0;
    const e = onEdge(piv, lerp(X_KNOCK, X_FLAT, k), lerp(Y_KNOCK, Y_FLAT, u));
    return { at: e.at.add(V(0, bump, 0)), rot: e.rot };
  }
  const u = easeOutCubic(clamp01((f - T_FLAT) / (T_SKID1 - T_FLAT))), hop = f - T_FLAT < 3 ? 0.006 * Math.sin(Math.PI * (f - T_FLAT) / 3) : 0;
  return { at: K_FLAT.at.clone().lerp(B_REST, u).add(V(0, hop, 0)), rot: K_FLAT.rot.clone().slerp(Q_FLOOR, u) };
};
/** the charcoal rides the board off his knee, drops off it and rolls on the brick */
const CH_FLOOR = V(PIV1.x, 0.0065, PIV1.z).addScaledVector(TO_HER, -0.12).addScaledVector(LEFT, 0.12);
const CH_LOCAL = CH_REST.clone().sub(F_BOARD.at).applyQuaternion(F_BOARD.rot.clone().invert());
const CH_LOCAL_ROT = F_BOARD.rot.clone().invert().multiply(CH_REST_ROT);
const T_CHOFF = T_SLIP + 5;
const chOnBoard = (f: number) => { const b = rigidAt(f, SLIDE_KEYS); return { at: b.at.clone().add(CH_LOCAL.clone().applyQuaternion(b.rot)), rot: b.rot.clone().multiply(CH_LOCAL_ROT) }; };
const CH_OFF = chOnBoard(T_CHOFF);
const CH_KEYS: RigidKey[] = [
  [T_CHOFF, CH_OFF.at, CH_OFF.rot],
  [T_CLAT + 1, CH_FLOOR, quatYZ(LEFT.clone().add(V(0, -0.3, 0)), FWD), (x: number) => 0.35 * x + 0.65 * x * x],
  [T_CLAT + 12, CH_FLOOR.clone().addScaledVector(TO_HER, 0.09), quatYZ(LEFT.clone().addScaledVector(FWD, 0.4), V(0, 1, 0)), easeOutCubic],
];
const charcoalAt = (f: number) => (f < T_SLIP ? { at: CH_REST, rot: CH_REST_ROT } : f <= T_CHOFF ? chOnBoard(f) : rigidAt(f, CH_KEYS));

// ==================================================================================================== her eyes in the elaboratory
/** F's extreme close (G opens on it: no cut) */
/** CROUCHED over the board at her feet (her eye 0.86 m), looking down at it: it sits low in the middle */
const P_CROUCH = B_REST.clone().addScaledVector(TO_HER, 0.42).setY(0.86);
const CROUCH_SP = { sx: 540, sy: 960, fov: 58.8 };
/** HELD: ON ONE KNEE (her eye 1.15 m: level with his seated eyes; P_HOLD above), a step back with the board held up in
 *  front of him, the held board below his mouth line. His wig's right locks reach x 940 at this size, so the slot
 *  (x 740-1026, y 146-416) cannot be kept clear of his hair: the meter's 1/1 goes to the low-left place (fit_G.ts).
 *  meter.tsx moves it there on each frame his head box (centre +- r + 8) meets the slot (752-1026, 155-300), so his
 *  eyes sit a little higher and right than a plain third: the head box's top stays above y 270 and its right edge
 *  past x 775 through the whole hold (f5019-5057), and the 1/1 never jumps between the two places */
const HOLD_SP = { sx: 490, sy: 560, fov: 60 };
const HOLD: CamPose = C.aimCam(P_HOLD, F_SEAT_EYES, HOLD_SP.sx, HOLD_SP.sy, HOLD_SP.fov);
/** the held board: its middle on the frame, its depth */
const BH = { px: 540, py: 1095, depth: 0.86 };
/** TWO: standing (her eye 1.6 m), turned round to the door: HUMPHREY outside in the doorway (right of the middle; card 4
 *  beside him), room on the left for NEWTON stopping inside by the door's east jamb (he walks in from the right) */
const DR = ELAB_SET.door, WL = ELAB_SET.walls;
const P_TWO = V(ELX + 0.75, 1.6, -0.32);
const H_AT = V(ELX + DR.x - 0.18, 0, WL.z1 + DR.wall + 0.42);
const H_EYE = H_AT.clone().add(V(0, 1.38, 0));
const TWO: CamPose = C.aimCam(P_TWO, H_EYE, 640, 400, 58.8);

/** M1: the extreme close -> the board at her feet (her dip, the lens widening ahead of the tilt) -> the still take -> up
 *  onto one knee with it. Angles, not look points (panCam). His head is wider than the gap between the REC block and the
 *  battery, so where it leaves and comes back through the top is steered (a small turn to her left at the crossing:
 *  a sine bump with nothing at either end) to the right of the REC block, its eyes clear of the battery */
const CROUCH_CAM0 = C.aimCam(P_CROUCH, B_REST, CROUCH_SP.sx, CROUCH_SP.sy, CROUCH_SP.fov);
const EXIT_YAW = -4, EXIT_BUMP = [0.15, 0.5], ENTRY_YAW = -5, ENTRY_BUMP = [0.3, 0.55];
const bump = (u: number, b: number[]) => Math.sin(Math.PI * clamp01((u - b[0]) / b[1]));
const g1Cam = (f: number): CamPose => {
  if (f < T_DIP0) return F_END_CAM;
  if (f < T_RISE0) {
    const u = clamp01((f - T_DIP0) / (T_DIP1 - T_DIP0)), c = panCam(F_END_CAM, CROUCH_CAM0, easeInOutCubic(u), easeInOutCubic(u), easeOutCubic(u));
    const y = EXIT_YAW * bump(u, EXIT_BUMP);
    return y ? C.nudge(c, { yaw: y }) : c;
  }
  if (f < T_HELD) {
    const u = clamp01((f - T_RISE0) / (T_HELD - T_RISE0)), c = panCam(CROUCH_CAM0, HOLD, easeInOutCubic(u));
    const y = ENTRY_YAW * bump(u, ENTRY_BUMP);
    return y ? C.nudge(c, { yaw: y }) : c;
  }
  return HOLD;
};
/** her bow on her 55 (1.5 deg: 5 frames down, 10 back up) */
const bowK = (f: number) => { const d = f - T_BOW; return d < 0 || d >= 15 ? 0 : d < 5 ? easeOutCubic(d / 5) : 1 - smooth((d - 5) / 10); };
/** M3: the lens drops to the board in her hands (it lands on the match's picture) */
const elabCam = (f: number): CamPose => {
  if (f < T_PAN0) return g1Cam(f);
  if (f < T_PAN1) { const u = (f - T_PAN0) / (T_PAN1 - T_PAN0); return panCam(HOLD, TWO, smooth(u), smooth(clamp01((u - 0.25) / 0.75))); }
  if (f < T_DR0) { const b = bowK(f); return b > 0 ? C.nudge(TWO, { pitch: -1.5 * b }) : TWO; }
  // a small turn to her right on the way down (a sine bump, nothing at either end): Humphrey, aside by the jamb, leaves
  // through the top between the REC block and the battery
  const u = clamp01((f - T_DR0) / (T_DR1 - T_DR0)), c = panCam(TWO, DROP_END, easeInOutCubic(u));
  return C.nudge(c, { yaw: DROP_YAW * Math.sin(Math.PI * u) });
};

// ==================================================================================================== HIS ROOM by candle
const T = ROOM_SET.table, TT = ROOM.tableTop;
/** he stands in front of the window table, turned toward her, the plate in his left hand (framed right) */
const N_ROOM = V(RMX + T.x + 0.1, 0, T.z + 0.51), F_ROOM = 0.5;
const ROOM_FOV = 52;
const ROOM_CAM: CamPose = C.aimCam(V(RMX - 0.1, 1.6, -0.3), newtonEyes(N_ROOM, F_ROOM), 560, 520, ROOM_FOV);
/** the plate on his left palm at chest height, out to his left (a hair of life); its rim's middle */
const PLATE_HAND = rel(N_ROOM, F_ROOM, 0.25, 0.9, 0.26);
const plateAt = (f: number) => PLATE_HAND.clone().add(V(0, 0.024 + 0.003 * Math.sin((f / FPS) * 1.3), 0));
const PLATE_YAW = F_ROOM + 0.5;
/** the candle he brought up from the elaboratory, on the table's front right, by the room's night light */
const CANDLE_R = V(RMX + T.x + 0.33, TT, T.z + 0.19);
/** THE MATCH: the plate's rim on the match frame -> the board's drawn circle (board-local middle, radius) */
const RIM_C = plateAt(T_MATCH).add(V(0, PLATE.h, 0));
const B_CIRC = { x: (0.14 - 0.5) * (BOARD.w - 0.006), y: (0.5 - 0.2) * (BOARD.h - 0.006), r: 0.1 * (BOARD.h - 0.006) };
const MATCH_SPIN = Math.PI;
const MATCH_L = matchCircle(ROOM_CAM, RIM_C, V(0, 1, 0), PLATE.r, B_CIRC, B_CIRC.r, BOARD.t / 2 + 0.0008, MATCH_SPIN);
/** the elaboratory's last camera: TWO's spot looking down into her hands, with the room's lens (the match needs the same
 *  fov and roll) */
const DROP_END: CamPose = (() => {
  const yp = C.camAxes(TWO), yaw = Math.atan2(yp.fwd.x, -yp.fwd.z), pitch = -52 * Math.PI / 180;
  const p = P_TWO, l = p.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(2));
  return { pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z], fov: ROOM_FOV, roll: ROOM_CAM.roll ?? 0 };
})();
const BOARD_END = fromCamLocal(DROP_END, MATCH_L);

// ==================================================================================================== the board in her hands
/** THE TAKE: her invisible fingers get under its near edge: it tips up on its far edge and gives a centimetre her way */
const TAKE_DEG = 8, FAR_EDGE = V(0, BOARD.h / 2, -BOARD.t / 2);
const takenAt = (f: number) => {
  const k = easeOutCubic(clamp01((f - T_TAKE0) / (T_RISE0 - T_TAKE0)));
  const rot = Q_FLOOR.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), (-TAKE_DEG * Math.PI / 180) * k));
  const pivot = B_REST.clone().add(FAR_EDGE.clone().applyQuaternion(Q_FLOOR)).addScaledVector(TO_HER, 0.01 * k);
  return { at: pivot.sub(FAR_EDGE.clone().applyQuaternion(rot)), rot };
};
/** the firelight on its face as it rises and turns to her lens (props board `warm`) */
const boardWarm = (f: number) => (f < T_RISE0 ? 0 : 0.45 * smooth(clamp01((f - T_RISE0) / (T_HELD - T_RISE0))));
const CROUCH_CAM = g1Cam(T_RISE0);
const TAKEN = takenAt(T_RISE0), TAKEN_L = toCamLocal(CROUCH_CAM, TAKEN.at, TAKEN.rot);
/** the turn to him: pi over the board-turn beat (eased), held */
const spinAt = (f: number) => Math.PI * easeInOutCubic(clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0)));
const held = (cam: CamPose, f: number, k = 1, dy = 0) => heldBoard(cam, f, { k, px: BH.px, py: BH.py + dy, depth: BH.depth, spin: spinAt(f) });
const boardAt = (cam: CamPose, f: number): { at: THREE.Vector3; rot: THREE.Quaternion } | null => {
  if (f < T_SLIP) return { at: F_BOARD.at.clone(), rot: F_BOARD.rot.clone() };
  if (f < T_TAKE0) return boardFall(f);
  if (f <= T_RISE0) return takenAt(f);
  if (f < T_HELD) {
    // up she comes with it: the board in her frame from where she took it to held up (one body with her); a little
    // behind her eyes on the way (its weight); never through the brick
    const u = smooth(clamp01((f - T_RISE0) / (T_HELD - T_RISE0)));
    const Hb = held(HOLD, f), HL = toCamLocal(HOLD, Hb.at, Hb.rot);
    const p = TAKEN_L.p.clone().lerp(HL.p, u); p.y -= 0.06 * Math.sin(Math.PI * u);
    const b = fromCamLocal(cam, { p, q: TAKEN_L.q.clone().slerp(HL.q, u) });
    const lo = boxBottom(b.at, b.rot, BOARD.w / 2, BOARD.h / 2, BOARD.t / 2);
    if (lo < 0) b.at.y -= lo;
    return b;
  }
  if (f <= T_LOWER1 + 2) {
    const sniff = f >= T_SNIFF && f < T_SNIFF + 8 ? 12 * Math.sin(Math.PI * (f - T_SNIFF) / 8) : 0;
    return held(cam, f, 1 - smooth(clamp01((f - T_LOWER0) / (T_LOWER1 - T_LOWER0))), sniff);
  }
  if (f < T_DR0 - 2) return null;    // in her lap, below the frame (the pan, the door)
  // THE LOOK DOWN: she lifts it a little toward her as the lens drops to it (from below the frame onto the match's place)
  const e = easeInOutCubic(clamp01((f - (T_DR0 - 2)) / (T_DR1 - T_DR0 + 2)));
  const Fm = C.camAxes(DROP_END);
  return { at: BOARD_END.at.clone().add(V(0, -0.28 * (1 - e), 0)).addScaledVector(V(Fm.fwd.x, 0, Fm.fwd.z).normalize(), -0.08 * (1 - e)), rot: BOARD_END.rot.clone() };
};

// ==================================================================================================== HUMPHREY at the door
/** he stands outside the open door with the full sack in his arms (three-quarter size), aghast; he drops it (its thump
 *  is the pan's reason) and it lands slumped at his feet, on the west half outside the sill; as Newton comes to the door
 *  he backs two steps away to the west (screen right), clear of Newton's way out, still facing in */
const H_FACE = yawTo(H_AT, ELAB.stool);
const SACK_S = 0.75;
const SACK_NECK = rel(H_AT, H_FACE, 0.12, 0.95, 0.3);
const SACK_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, H_FACE, 0, "YXZ"));
const SACK_HELD = SACK_NECK.clone().sub(V(0, SACK.neck[1] * SACK_S, 0).applyQuaternion(SACK_ROT));
/** it lands a little out on the gravel (clear of the west jamb's reveal) */
const SACK_FLOOR = V(SACK_HELD.x + 0.03, 0, SACK_HELD.z + 0.09);
const SACK_YAW = yawTo(SACK_FLOOR, SACK_FLOOR.clone().add(V(-1, 0, 0.1)));
/** he steps back and aside to the west (screen right, by the jamb) so Newton's way out is clear of him on screen */
const H_BACK = V(ELX + DR.x - 0.8, 0, WL.z1 + DR.wall + 0.7);
const T_HIN = T_LOOKDOOR - 8;

// ==================================================================================================== NEWTON's way to the door and out
/** up from the stool (off the frame, behind her), to the furnace corner for his candle, round to the door (into her
 *  frame from the right); he stops inside by its east jamb, turns to her, says good night, turns and goes out: across
 *  the sill, straight away from her with his candle, and off to the left behind the jamb (the gravel) */
const C_SPOT = V(ELX - 0.92, 0, -0.34);
const N_DOOR = V(ELX + 0.3, 0, 1.38);
const T_NUP = T_SACK + 8;
const LEG_A = [V(ELAB.stool.x, 0, ELAB.stool.z + 0.3), C_SPOT], SPEED_A = 0.8;
const T_NA_END = T_NUP + Math.round(walkTime(LEG_A, SPEED_A) * FPS);
const T_CANDLE = T_NA_END + 3, T_NB = T_NA_END + 9;
const LEG_B = [C_SPOT, V(ELX - 0.4, 0, 0.5), V(ELX + 0.1, 0, 1.1), N_DOOR];
/** he reaches the door 30 frames before "Good night." (under card 4) */
const T_NARR = L3.from - 30;
const SPEED_B = walkTime(LEG_B, 1) / ((T_NARR - T_NB) / FPS);
const N_TURNED = yawTo(N_DOOR, P_TWO);
/** out: on the line's tail he turns to the door and walks; the gravel (G03 end + 0.2 s) is his first step outside */
const T_NOUT = L3.to - 8;
/** a side step to the line through the door's east half (clear of the sack on its west half), then straight out across
 *  the sill: his head never meets the east jamb or the wall beside it */
const OUT_X = ELX + DR.x + 0.12;
const LEG_OUT = [N_DOOR, V(OUT_X, 0, 1.44), V(OUT_X, 0, WL.z1 + DR.wall + 0.5), V(ELX + DR.x + 0.95, 0, WL.z1 + DR.wall + 0.85)];
const SPEED_OUT = 1.0;

type NSt = { at: THREE.Vector3; facing: number; pose: RigPose; turn?: number; seated: boolean };
const newtonDoor = (f: number): NSt => {
  const t = f / FPS;
  if (f < T_NUP) return { at: ELAB.stool.clone(), facing: FACE, pose: { kind: "sit", t }, seated: true };
  if (f < T_NB) { const g = walkAlong(LEG_A, SPEED_A, (f - T_NUP) / FPS, { endFacing: -Math.PI / 2 }); return { at: g.at, facing: g.facing, pose: g.pose, seated: false }; }
  if (f < T_NOUT) {
    const g = walkAlong(LEG_B, SPEED_B, (f - T_NB) / FPS, { endFacing: N_TURNED });
    const turned = f >= T_NARR;
    return { at: g.at, facing: turned ? lerpA(g.facing, N_TURNED, smooth(clamp01((f - T_NARR) / 10))) : g.facing, pose: g.pose, turn: turned ? undefined : 1, seated: false };
  }
  const g = walkAlong(LEG_OUT, SPEED_OUT, (f - T_NOUT - 5) / FPS, { startFacing: N_TURNED });
  const out = yawTo(LEG_OUT[0], LEG_OUT[1]);
  return { at: g.at, facing: f < T_NOUT + 5 ? lerpA(N_TURNED, out, smooth(clamp01((f - T_NOUT) / 7))) : g.facing, pose: g.pose, turn: f >= T_NOUT + 5 ? 1 : undefined, seated: false };
};
/** HUMPHREY steps back as Newton comes to the door */
const T_HSTEP = T_NARR - 26, H_STEP_V = 0.8;
const hmAt = (f: number): { at: THREE.Vector3; pose: RigPose } => {
  const g = walkAlong([H_AT, H_BACK], H_STEP_V, (f - T_HSTEP) / FPS);
  return { at: g.at, pose: g.pose.kind === "walk" ? { ...g.pose, phase: (1 - (g.pose.phase ?? 0)) % 1 } : { kind: "idle", t: f / FPS + 0.7 } };
};
const hmHands = (f: number, p: THREE.Vector3, face: number): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  const k = smooth(clamp01((f - (T_SACK + 14)) / 26));
  if (k >= 1) return [null, null];
  const side = V(Math.cos(H_FACE), 0, -Math.sin(H_FACE));
  const r = SACK_NECK.clone().addScaledVector(side, -0.055), l = SACK_NECK.clone().addScaledVector(side, 0.055);
  const g = smooth(clamp01((f - T_DROP) / 5));
  r.add(V(0, 0.05 * g, 0)).addScaledVector(side, -0.06 * g);
  l.add(V(0, 0.05 * g, 0)).addScaledVector(side, 0.06 * g);
  if (k <= 0) return [r, l];
  return [r.lerp(rel(p, face, -0.17, 0.58, 0.04), k), l.lerp(rel(p, face, 0.17, 0.58, 0.04), k)];
};

// ==================================================================================================== faces
type Ex = "sad" | "deadpan" | "smile";
/** sad as F leaves him; snapped out of it on the first stroke; the crack (a held flicker of a smile); the laugh (people
 *  laugh()); the smile after it */
const N_EXPR: [number, Ex][] = [[S.from, "sad"], [T_S1 + 3, "deadpan"], [T_CRACK, "smile"], [T_LOOKDOOR, "smile"]];
/** his eyes: at the fire (F's), then front; past her to the doorway (screen left) before the thump */
const N_GAZE: [number, number][] = [[S.from, -0.5], [T_S1 + 3, 0], [T_LOOKDOOR, -0.7], [T_NUP, 0]];
/** his head's bow (deg): F's 9; down after the board; up with it; on it; the eyes up on 用; the laugh's own */
const nLookDown = (f: number) => ky(f, [[S.from, 9], [T_SLIP, 9], [T_CLAT + 4, 26], [T_RISE0, 28], [T_HELD, 11], [T_TURN0, 11], [T_TURN1, 7], [T_EYESUP0, 7], [T_EYESUP1, 0], [T_LAUGH, 0], [T_LAUGH + 6, -4], [T_WIPE1, -4], [T_WIPE1 + 10, 1]]);
type HEx = "shock" | "dazed" | "smile";
const H_EXPR: [number, HEx][] = [[S.from, "shock"], [T_SACK + 40, "dazed"], [L3.from, "shock"], [L4.from + 4, "smile"]];
const hMouth = (f: number) => (f < T_SACK + 60 ? "round" as const : f >= L3.from && f < L4.from + 14 ? "small" as const : undefined);

// ==================================================================================================== THE ELABORATORY
const elab = (w: World, f: number): Pose => {
  const t = f / FPS;
  candleLightOff(w);
  w.setPlace("elaboratory");
  const fs = fireF(f);
  w.set.param("fire", fs.fire);
  w.set.param("embers", fs.embers);
  w.set.param("candle", 1);
  const cam = elabCam(f);
  w.setCamera(cam);

  // ---- NEWTON
  const n: Rig = w.actor(NEWTON);
  const nq = saying("nt", f), laughing = f >= T_LAUGH && f <= T_WIPE1;
  const ns: ReturnType<typeof speak> = nq && !laughing ? speak(nq, f, 1) : {};
  if (ns.mouth === "strip") ns.mouth = "pill"; else if (ns.mouth === "wide") ns.mouth = "half";
  const g03 = f >= L3.from - 6 && f <= L3.to + 10;
  // "Good night." WARM, STILL SMILING (LOOK 4/4): his closed talking shapes give way to the smile's own mouth, so it
  // never reads as the flat deadpan bar; the open shapes stay small
  if (g03 && (f > L3.to || ns.mouth === "pill" || ns.mouth === "line")) delete ns.mouth;
  else if (g03 && ns.mouth === "half") ns.mouth = "small";
  const st = newtonDoor(f);
  const stopped = f >= T_YONG && f < T_LAUGH;
  let laughS: ReturnType<typeof laugh> | null = null, bob = 0;
  let right: THREE.Vector3 | null = null, left: THREE.Vector3 | null = null;
  if (st.seated) {
    // his hands: on the board (F's), slack at the first stroke, loose on his thighs; the laugh's knee slaps
    const u = smooth(clamp01((f - T_LETGO0) / (T_LETGO1 - T_LETGO0)));
    const life = (k: number) => (stopped ? V() : V(0.004 * Math.sin(t * 1.1 + k), 0.003 * Math.sin(t * 0.9 + k), 0));
    right = HAND_R0.clone().lerp(rel(SEAT.top, FACE, -0.2, 0.1, 0.16), u).add(life(0));
    left = HAND_L0.clone().lerp(rel(SEAT.top, FACE, 0.2, 0.1, 0.16), u).add(life(2));
    if (f >= T_LAUGH && f < T_LAUGH_END) {
      const tl = (f - T_LAUGH) / FPS;
      laughS = laugh(tl, { fade: 0.55 * smooth(clamp01((f - T_EASE0) / (T_WIPE1 - T_EASE0))) + 0.45 * smooth(clamp01((f - T_WIPE1) / 14)) });
      const on = clamp01((f - T_LAUGH - 4) / 6) * (1 - smooth(clamp01((f - (T_WIPE0 - 10)) / 10)));
      const ha = Math.floor(tl * 30 + 1e-6);
      bob = 0.009 * on * (ha % 7 < 3 ? 1 : 0.3);
      const p = ((f - T_LAUGH) % 14) / 14, up = p < 0.5 ? smooth(p * 2) : 1 - smooth((p - 0.5) * 2);
      right = right.lerp(rel(SEAT.top, FACE, -0.12, 0.1 + 0.05 * up, 0.3), on);
    }
  }
  const expr = at(f, N_EXPR);
  const head = heads(ns.head, laughS?.head, accent("jolt", f, T_S1 + 2, { amp: 0.45 }), accent("jolt", f, T_CLAT, { amp: 0.5 }),
    f >= T_TURN0 && f < T_YONG ? { tilt: 2.5 * smooth(clamp01((f - T_TURN0) / 20)) } : undefined,
    st.seated && f >= T_SACK ? accent("jolt", f, T_SACK, { amp: 0.4 }) : undefined);
  const nState = {
    expr: laughS ? laughS.expr : expr, ...(laughS?.mouth ? { mouth: laughS.mouth } : {}), ...(ns.mouth ? { mouth: ns.mouth } : {}),
    gaze: at(f, N_GAZE), blink: stopped || laughS || g03 ? 0 : ns.blink ?? lid(t, 1, swaps(N_EXPR)), head, lookDown: st.seated ? nLookDown(f) : 0, hide: NEWTON_HIDE, visible: true,
  };
  if (st.seated) {
    // he STOPS DEAD on 用: his body's own life freezes with him (the sit pose's clock held) until the laugh bursts
    const tSit = stopped ? T_YONG / FPS : t;
    const sd = seated(bob ? { ...SEAT, top: SEAT.top.clone().add(V(0, bob, 0)) } : SEAT, tSit);
    n.set({ ...sd, twist: 0, lean: { pitch: 5 }, ...nState, hands: [right, left], turn: undefined });
  } else {
    // his candle in his right hand, low in front of his chest (look NOTES: lower, clear of his face; no lean while held)
    // going out he carries it a little out to his side once he is past the door's leaf (in the doorway), so from behind
    // the flame shows past his coat (the script: his candle going away)
    const side = smooth(clamp01((f - (T_NOUT + 30)) / 10));
    const cHand = f >= T_CANDLE - 4 ? rel(st.at, st.facing, lerp(-0.18, -0.3, side), lerp(0.72, 0.8, side) + (st.pose.kind === "walk" ? 0.008 * Math.sin(t * 9) : 0.003 * Math.sin(t * 1.2)), lerp(0.26, 0.12, side)) : null;
    n.set({ at: st.at, facing: st.facing, pose: st.pose, seat: undefined, twist: 0, lean: { pitch: 0 }, ...nState, turn: st.turn, hands: [cHand, null], armFront: [false, false] });
  }

  // ---- HUMPHREY (in the doorway from before Newton looks there; off the frame until the pan)
  let hm: Rig | null = null;
  const hmA = w.actor(HUMPHREY_SOOT);
  const holding = f < T_DROP;
  if (f >= T_HIN) {
    hm = hmA;
    const hs = hmAt(f);
    const hFace = lerpA(H_FACE, yawTo(H_BACK, N_DOOR), 0.6 * smooth(clamp01((f - (T_NARR - 20)) / 24)));
    const watch = f >= T_NOUT ? lerpA(hFace, yawTo(hs.at, LEG_OUT[2]), smooth(clamp01((f - T_NOUT - 10) / 14))) : hFace;
    const hGaze = at(f, [[S.from, 0.5], [T_NARR - 16, 0.25], [L3.to + 4, 0], [T_NOUT + 12, -0.4]]);
    hm.set({ at: hs.at, facing: watch, pose: hs.pose, expr: at(f, H_EXPR), mouth: hMouth(f), gaze: hGaze, seat: undefined,
      blink: f > T_DROP - 4 && f < T_SACK + 24 ? 0 : lid(t, 2, swaps(H_EXPR)), visible: true,
      head: heads(f >= T_SACK && f < T_SACK + 40 ? { tilt: 2.2 * Math.sin((f - T_SACK) * 0.9) * (1 - (f - T_SACK) / 40) } : undefined, accent("jolt", f, T_DROP - 2, { amp: 0.5 }), accent("pop", f, L3.from, { amp: 0.5 })),
      hands: hmHands(f, hs.at, watch) });
  } else hmA.set({ visible: false });

  // ---- props before the solve (F's room as it leaves it)
  w.prop("poker").put(F_POKER_REST.grip, { rot: F_POKER_REST.rot, hot: 0 });
  w.prop("stool", "sack").put(ST1, { rot: 0.4 });
  { const P = shovelPut(SH_LEAN.blade, SH_LEAN.handle, V(0, 0, 1)); w.prop("shovel").put(P.at, { rot: P.rot }); }
  putStoolUnder(w, ELAB.stool, FACE);
  w.prop("drafts").put(DRAFTS_AT, { rot: DRAFTS_ROT });
  if (f < T_CANDLE) { w.prop("candle").put(F_CANDLE.at, { len: CANDLE_LEN, lit: true, t }); putCandleLight(w, FLAME_SET, CANDLE_LIGHT, candleGlow(t)); }
  const ch = charcoalAt(f);
  w.prop("charcoal").put(ch.at, { rot: ch.rot });
  if (hm && !holding) {
    if (f < T_SACK) {
      const k = fall(clamp01((f - T_DROP) / (T_SACK - T_DROP)));
      w.prop("sack").put(SACK_HELD.clone().lerp(SACK_FLOOR, k), { full: 1, scale: SACK_S, rot: SACK_ROT.clone().slerp(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), H_FACE), k) });
    } else w.prop("sack").put(SACK_FLOOR, { full: 1, slump: true, scale: SACK_S, rot: SACK_YAW });
  }

  w.update();

  // ---- held things (from where the fists really are)
  if (!st.seated && f >= T_CANDLE) w.prop("candle").put(n.handWorld(0), { grip: "grip", len: CANDLE_LEN, lit: true, t });
  if (hm && holding) w.prop("sack").put(SACK_HELD, { full: 1, scale: SACK_S, rot: SACK_ROT });

  // ---- THE BOARD (her invisible hands: no hand is put)
  const B = boardAt(cam, f);
  if (B) w.prop("board").put(B.at, { rot: B.rot, warm: f >= T_DR0 - 2 ? 0.3 : boardWarm(f) });

  // ---- the lens: F's light focus on his face through the race; on the board while it is held up (racking to him as she
  // lowers it); on him through the laugh; on the door (Newton, then the doorway); on the board's circle as it comes up
  const face = n.headWorld();
  let dof: { focus: number; amount: number } | undefined;
  if (f < T_DIP0) dof = { focus: Math.max(0.2, posOf(cam).distanceTo(face)), amount: 2.5 };
  else if (f < T_HELD) dof = { focus: Math.max(0.2, posOf(cam).distanceTo(B ? B.at : B_REST)), amount: 1.6 };
  else if (f < T_PAN0) {
    const r = smooth(clamp01((f - T_LOWER0) / (T_LOWER1 + 2 - T_LOWER0)));
    dof = { focus: Math.max(0.2, lerp(B && f <= T_LOWER1 + 2 ? posOf(cam).distanceTo(B.at) : posOf(cam).distanceTo(face), posOf(cam).distanceTo(face), r)), amount: lerp(1.6, 2.5, r) };
  } else if (f < T_DR0) dof = lightFocus(cam, f >= T_NB ? face : H_EYE, 2);
  else dof = lightFocus(cam, B ? B.at : H_EYE, 1.5);
  // THE PAN's smear and a touch of lens blur on its fastest 6 frames only (the middle of an in-out cubic)
  let overlays: Pose["overlays"];
  if (f >= T_PAN0 && f < T_PAN1) {
    const u = (f - T_PAN0 + 0.5) / (T_PAN1 - T_PAN0), mid = (T_PAN0 + T_PAN1) / 2;
    const k = Math.abs(f + 0.5 - mid) <= 3 ? panSpeed(u) : 0;
    if (k > 0.05) { overlays = C.whipSmear(0.55 * k, -1); dof = { focus: 0.05, amount: 9 * k }; }
  }
  const post: Pose["post"] = { dof: dof && dof.amount > 0.05 ? dof : undefined, grade: mixGrade(GRADE_BASE, GRADE_LATE, fs.late) };
  const slate = f < T_DIP0 ? "G extreme close (F's)" : f < T_HELD ? "G M1 down and up" : f < T_LAUGH ? "G held board" : f < T_PAN0 ? "G laugh" : f < T_PAN1 ? "G M2 pan" : f < T_DR0 ? "G door" : "G M3 drop";
  return { camera: cam, post, overlays, slate };
};

// ==================================================================================================== HIS ROOM
/** the bite, unhurried: the stab on the clink, the lift to his mouth (the tine tip on his real lips), the chew, the fork
 *  back down; then he turns to the table, sets the plate down and pinches the candle out on the pluck */
const T_AT_MOUTH = T_CLINK + 12, T_CHEW = T_CLINK + 18, T_FORK_DOWN = T_CLINK + 30;
const T_NTURN0 = T_FORK_DOWN + 8, T_NTURN1 = T_NTURN0 + 16, T_PLATE_DOWN = T_NTURN1 + 6, T_REACH0 = T_PLATE_DOWN + 4;
const F_TABLE = F_ROOM + 1.05;
/** the plate set down on the table's front, by the candle */
const PLATE_TABLE = V(RMX + T.x - 0.12, TT, T.z + 0.12);
const PLATE_ROT_T = PLATE_YAW + (F_TABLE - F_ROOM);
/** where the chop sits on the plate, the fork's stab direction */
const rotY = (p: THREE.Vector3, a: number) => V(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
const chopOn = (f: number) => plateAt(f).add(rotY(V(-0.02, 0.036, -0.02), PLATE_YAW));
const FORK_DIR_STAB = V(0.1, -0.85, -0.25).normalize();
const FORK_REST = rel(N_ROOM, F_ROOM, -0.13, 0.84, 0.25);
const roomN = (f: number) => {
  const turn = smooth(clamp01((f - T_NTURN0) / (T_NTURN1 - T_NTURN0)));
  return { at: N_ROOM, facing: lerpA(F_ROOM, F_TABLE, turn), turn };
};
const room = (w: World, f: number): Pose => {
  const t = f / FPS;
  candleLightOff(w);
  w.setPlace("room");
  w.set.param("hour", "night");
  w.set.param("door", 1);
  const cam = ROOM_CAM;
  w.setCamera(cam);
  const n: Rig = w.actor(NEWTON);
  const hmA = w.actor(HUMPHREY_SOOT); hmA.set({ visible: false });
  const r = roomN(f);
  const chew = f >= T_CHEW && f < T_NTURN0 + 10 ? { dy: -0.03 * (0.5 + 0.5 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3 - Math.PI / 2)), squash: 0.012 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3) } : undefined;
  const out = f > T_OUT;
  // first solve with a guess for the fork; THE FORK AT HIS LIPS then uses his real mouth (people facePoint) and solves again
  // the plate rides on his palm round the turn to the table (turned about his feet with him), then is set down
  const dA = r.facing - F_ROOM, carried = (p: THREE.Vector3) => N_ROOM.clone().add(rotY(p.clone().sub(N_ROOM), dA));
  const plateHand = f < T_PLATE_DOWN - 6 ? carried(plateAt(f)) : carried(plateAt(T_PLATE_DOWN - 6)).lerp(PLATE_TABLE.clone().add(V(0, 0.03, 0)), smooth(clamp01((f - (T_PLATE_DOWN - 6)) / 6)));
  // after the plate is down his left hand goes to the candle's wick and pinches it out on the pluck, and stays a moment
  const WICK = CANDLE_R.clone().add(V(0, candleTop(CANDLE_LEN) + 0.01, 0));
  const leftHand = f < T_PLATE_DOWN + 2 ? plateHand : PLATE_TABLE.clone().add(V(0, 0.05, 0)).lerp(WICK, smooth(clamp01((f - T_REACH0) / (T_OUT - T_REACH0))));
  const forkKeysAt = (mouth: THREE.Vector3): PtKey[] => {
    const chop = chopOn(T_CLINK), toCam = posOf(cam).sub(mouth).setY(0).normalize();
    const atLips = mouth.clone().addScaledVector(toCam.clone().multiplyScalar(0.6).add(V(0, -0.6, 0)).normalize(), FORK_TIP);
    return [
      [T_MATCH, FORK_REST],
      [T_CLINK - 5, chop.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP).add(V(0, 0.06, 0))],
      [T_CLINK, chop.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP), easeOutCubic],
      [T_CLINK + 3, chop.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP).add(V(0, 0.035, 0))],
      [T_AT_MOUTH - 3, atLips.clone().addScaledVector(toCam, 0.08).add(V(0, -0.05, 0))],
      [T_AT_MOUTH, atLips.clone(), easeOutCubic],
      [T_CHEW, atLips.clone()],
      [T_FORK_DOWN, FORK_REST],
      [T_NTURN1, rel(N_ROOM, F_TABLE, -0.17, 0.62, 0.08)],
    ];
  };
  const set = (mouth: THREE.Vector3 | null) => n.set({
    at: r.at, facing: r.facing, pose: { kind: "idle", t: t + 0.4 }, expr: "smile", gaze: f >= T_CLINK + 8 && f < T_CHEW ? 0 : 0.4, blink: lid(t, 1),
    lookDown: ky(f, [[T_MATCH, 20], [T_CLINK + 4, 22], [T_AT_MOUTH, 8], [T_CHEW, 8], [T_FORK_DOWN, 16], [T_NTURN1, 22], [T_OUT, 22]]), head: chew, hide: NEWTON_HIDE, visible: true,
    hands: [mouth ? pathAt(f, forkKeysAt(mouth)) : FORK_REST, leftHand], armFront: [true, false], seat: undefined, twist: 0,
  });
  set(null);
  w.prop("lid").put(V(RMX + T.x + 0.22, TT + 0.002, T.z - 0.01));
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: 3 });
  w.prop("candle").put(CANDLE_R, { len: CANDLE_LEN, lit: !out, t });
  w.update();
  const mouth = facePoint(n, 0, -0.35, 0.012);
  set(mouth);
  w.update();
  // the plate on his palm (at the hand's own place on the match frame: the match is exact), the fork in his right fist
  const onTable = f >= T_PLATE_DOWN;
  w.prop("plate").put(onTable ? PLATE_TABLE : plateHand, { rot: onTable ? PLATE_ROT_T : PLATE_YAW + dA, lid: 0, steam: 0, bites: f >= T_CLINK + 4 ? 3 : 2, t });
  const fh = n.handWorld(0);
  const REST_DIR = V(0.15, -0.6, 0.5).normalize(), toMouth = mouth.clone().sub(fh).normalize();
  const up = smooth(clamp01((f - T_CLINK - 2) / 6)) * (1 - smooth(clamp01((f - T_CHEW) / (T_FORK_DOWN - T_CHEW))));
  const base = f < T_CLINK ? REST_DIR.clone().lerp(FORK_DIR_STAB, smooth(clamp01((f - (T_CLINK - 8)) / 4))).normalize() : f < T_CHEW ? FORK_DIR_STAB : REST_DIR;
  w.prop("fork").put(fh, { grip: "hilt", rot: forkRot(base.clone().lerp(toMouth, up).normalize()) });
  // THE CANDLE OUT: the dark comes in over 3 frames from the snuff (the room's own candle light has no switch: a grade,
  // from the film's grade, GRADE_BASE = Film.tsx GRADE_FILM, which the room uses)
  const k = smooth(clamp01((f - T_OUT) / 3));
  const post: Pose["post"] = { dof: lightFocus(cam, f < T_NTURN0 ? plateAt(f) : n.headWorld(), 1.2), ...(k > 0 ? { grade: mixGradeG(GRADE_BASE, GRADE_OUT, k) } : {}) };
  return { camera: cam, post, ...(f <= CAP_G04_END ? { captions: false } : {}), top: f >= T_BLACK ? endBlack(f, T_BLACK) : undefined, slate: out ? "G room, candle out" : "G room" };
};

const pose = (w: World, f: number): Pose => (f >= T_MATCH ? room(w, f) : elab(w, f));

export const SEG: Segment = { id: "G", from: S.from, to: S.to, enter() {}, exit() {}, pose };
