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
//                 angles the short way, the lens in log(tan)); the smear on its first 6 frames only (5058-5063, gone
//                 before card 4 at 5064: gate 5 r2 G3); no cut.
//      card 4 HOLD on the door: Humphrey's shock, the sack at his feet; Newton walks into the frame from the right
//                 with his candle, stops inside the door, turns to her. G03 "Good night." HOLD (the lead speaks to the
//                 lens). He goes out through the doorway, straight away from us with his candle, and off to the left;
//                 her G04 to the open door (her bow: 1.5 deg).
//   M3  先 .. T_DR1  THE LENS DROPS TO THE BOARD in her hands (it comes up as she looks down at it): the drawn circle,
//                 composed on the frame where the plate will be (gate 5 r2 G1), the glow and the light focus on it.
//   ⑪   BEAT.G.room  MATCH CUT: the circle becomes the plate IN HER HANDS (the same place, size and tilt), by candle in
//                 his room; HOLD to the end: card 5; she holds it out, he takes it in his left hand; the bite on the
//                 fork's clink; he lays the fork on it, turns to the candle at his right hand and pinches it out (the
//                 pluck); her camera switches off (hud/vlog.tsx OFF_AT); the end black. His eyes never on the lens
//                 (lids at rest, a closed smile; facing 35 deg off: G2).
// SHE IS INVISIBLE: no mic, no hand. The board's pose is kept in her frame (segG_parts heldBoard / toCamLocal).
import * as THREE from "three";
import { SEGMENTS, line, cap, capWord, card, FPS, W, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
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
  GRADE_OUT, mixGradeG, spill, type RigidKey, type PtKey,
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
/** the pan's smeared frames: its first SMEAR_N (5058-5063), all before card 4 (in at 5064) */
const SMEAR_N = 6;
/** the light focus on the round thing on both sides of match ⑪ */
const MATCH_DOF = 2.4;
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
// GATE 5 r2 (director notes G1 + G2): MATCH ⑪ IS COMPOSED ON THE ROUND THING. The circle on the board in her invisible
// hands becomes his plate IN HER INVISIBLE HANDS: the same hands, the same place on the frame, the same size and the
// same tilt (segG_parts matchCircle), the brightest round shape on both sides of the cut. Why her hands and not his (the
// note's "workable target" had him holding it out): the rig's head ball is 0.518 m across, twice the plate (0.26 m), and
// his arm brings the plate at most about 0.4 m nearer the lens than his head, so a plate of 350 px or more in HIS hand
// always stands beside a head of 640 px or more, crossing card 5's box or the frame's edge (probe of every reachable
// hold, 15 Nov). Held out by her at arm's length the plate is about 420 px and he, a step beyond it at the window table,
// is about 400 px: the frame the note asks for. She kneels (her eye 1.15 m), so his look at the plate goes DOWN (G2) and
// the plate and his head sit close together on the frame. He leans in and eats a bite from it on the fork's clink, then
// turns to the candle and pinches it out.
const T = ROOM_SET.table, TT = ROOM.tableTop;
/** NEWTON just right of the window table's right end (where he stands to eat, layout ROOM.tableStand, a little further
 *  back: the table and its candle at his right hand); HER EYE kneeling in front of him (1.15 m), a little to his left */
const N_ROOM = V(RMX + T.x + 0.72, 0, T.z + 0.28);
const P_ROOM = V(N_ROOM.x + 0.12, 1.15, N_ROOM.z + 1.9);
/** his facing: N_OFF off the lens, turned to her right (screen right, toward the plate): never front-on (G2) */
const N_OFF = 35 * Math.PI / 180;
const F_ROOM = Math.atan2(P_ROOM.x - N_ROOM.x, P_ROOM.z - N_ROOM.z) + N_OFF;
const ROOM_FOV = 74;
/** his eyes on (400, 580): the head three-quarter in the frame's left half, about a third down. GATE 5 r2 note G4 (his
 *  ear-quill in the REC row): at y 520 the quill's tip rose to (128, 141) and touched the 凌晨 02:00 glyphs. He now sits
 *  60 px lower: the tip's y is 214 or more on every frame 5279-5396 (36 px or more under the glyphs; 232 or more on the
 *  hold from 5294), his head's bottom at y 737 at most (card 5's paper from 5283: the note's line is y 740), the candle's
 *  flame on 5385 at y 767. Clearing the whole REC box (y 240) needs y 604, which puts his head's bottom at y 761 (probe,
 *  15 Nov). The plate stays where it is: PLATE_SP is in this camera's screen and MATCH_L is solved from it, so match ⑪
 *  stays exact */
const ROOM_CAM: CamPose = C.aimCam(P_ROOM, newtonEyes(N_ROOM, F_ROOM), 400, 580, ROOM_FOV);
/** THE PLATE IN HER HANDS: its rim's middle on (sx, sy), w px across, its face tilted `tilt` deg toward her (so the
 *  food and the round of the plate read, and the board's face on the other side of the cut is not edge-on) */
const PLATE_SP = { sx: 790, sy: 625, w: 410, tilt: 30 };
const RF = C.camFrame(ROOM_CAM);
const PLATE_DEPTH = (2 * PLATE.r * W) / (2 * RF.tanH * PLATE_SP.w);
const RIM_C = (() => { const q = C.fromScreen(RF, PLATE_SP.sx, PLATE_SP.sy, PLATE_DEPTH); return C.camToWorld(RF, q.x, q.y, q.z); })();
const PLATE_TO_HER = V(P_ROOM.x - RIM_C.x, 0, P_ROOM.z - RIM_C.z).normalize();
const PLATE_N = V(0, Math.cos(PLATE_SP.tilt * Math.PI / 180), 0).addScaledVector(PLATE_TO_HER, Math.sin(PLATE_SP.tilt * Math.PI / 180));
/** its food toward her (+z), the bitten chop on his side */
const PLATE_Q = quatYZ(PLATE_N, PLATE_TO_HER);
const PLATE_AT = RIM_C.clone().addScaledVector(PLATE_N, -PLATE.h);
/** her hands' life (millimetres in her frame, zero on the match frame so the match is exact) */
const handsLife = (f: number) => { const g = (x: number) => V(0.0016 * Math.sin(x * 0.061 + 2), 0.0013 * Math.sin(x * 0.047 + 3.3), 0.0009 * Math.sin(x * 0.037 + 4.1)); const d = g(f).sub(g(T_MATCH)); return RF.right.clone().multiplyScalar(d.x).addScaledVector(RF.up, d.y).addScaledVector(RF.fwd, d.z); };
/** SHE HOLDS IT OUT TO HIM (her arms reach a little: OFFER_D toward him) and he takes it in his left hand */
const OFFER_D = 0.38;
const PLATE_TO_HIM = V(N_ROOM.x - RIM_C.x, 0, N_ROOM.z - RIM_C.z).normalize();
/** the candle he brought up from the elaboratory, on the table's right end at his right hand (screen left of him, its
 *  flame above card 5's box), where the room's night light stands */
const CANDLE_R = V(RMX + T.x + 0.33, TT, T.z + 0.13);
/** THE MATCH: the plate's rim on the match frame -> the board's drawn circle (board-local middle, radius), upright for
 *  her (spin 0): the circle near the board's top left corner, the orbit and its triangles off to the right and below,
 *  out of the frame or at its edge, so the circle is the drawing on the match frame */
const B_CIRC = { x: (0.14 - 0.5) * (BOARD.w - 0.006), y: (0.5 - 0.2) * (BOARD.h - 0.006), r: 0.1 * (BOARD.h - 0.006) };
const MATCH_SPIN = 0;
const MATCH_L = matchCircle(ROOM_CAM, RIM_C, PLATE_N, PLATE.r, B_CIRC, B_CIRC.r, BOARD.t / 2 + 0.0008, MATCH_SPIN);
/** THE MATCH GLOW: a warm spill on the round thing, on the same place on both sides of the cut (the board's circle as
 *  the lens comes down onto it, the plate on the room's first frames), so the eye is on it as it changes */
const MATCH_GLOW = { x: PLATE_SP.sx, y: PLATE_SP.sy, r: 330 };
const matchK = (f: number) => (f < T_MATCH ? smooth(clamp01((f - (T_DR1 - 8)) / 8)) : 1 - smooth(clamp01((f - (T_MATCH + 4)) / 18)));
/** the glow (a warm screen spill on it; an overlay darkening the rest was tried and dims the REC row: not used) */
const matchLight = (f: number) => { const k = matchK(f); return k > 0.01 ? [spill("matchGlow", MATCH_GLOW, MATCH_GLOW.r, 0.42 * k)] : null; };
/** the elaboratory's last camera: TWO's spot looking down into her hands, with the room's lens (the match needs the same
 *  fov and roll). DROP_PITCH (gate 5 r2): steep enough that the frame's top is the floor at her feet, not the doorway
 *  (Humphrey has gone out of it at the top by then), so the board and its circle are all the match frame holds */
const DROP_PITCH = -75;
const DROP_END: CamPose = (() => {
  const yp = C.camAxes(TWO), yaw = Math.atan2(yp.fwd.x, -yp.fwd.z), pitch = DROP_PITCH * Math.PI / 180;
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
  { const P = shovelPut(SH_LEAN.blade, SH_LEAN.handle, V(0, 0, -1)); w.prop("shovel").put(P.at, { rot: P.rot }); }
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
  else {
    // the drop: on the board, then (as it settles) on its drawn circle, a little stronger, so the circle is the frame's
    // one sharp thing on the match frame (the room's first frames focus on the plate the same way)
    const cw = B ? B.at.clone().add(V(B_CIRC.x, B_CIRC.y, BOARD.t / 2).applyQuaternion(B.rot)) : H_EYE;
    const k = smooth(clamp01((f - (T_DR1 - 8)) / 8));
    dof = { focus: Math.max(0.2, lerp(posOf(cam).distanceTo(B ? B.at : H_EYE), posOf(cam).distanceTo(cw), k)), amount: lerp(1.5, MATCH_DOF, k) };
  }
  // THE PAN's smear and a touch of lens blur (gate 5 r2, note G3): only on the pan's first 6 frames, T_PAN0 .. +5
  // (5058-5063), riding the pan's speed and gone two frames before card 4 comes in (5064): nothing streaks behind the
  // card. The 20-frame sine pan and its start on the thump are as they were.
  let overlays: Pose["overlays"];
  if (f >= T_PAN0 && f < T_PAN0 + SMEAR_N) {
    const u = (f - T_PAN0 + 0.5) / (T_PAN1 - T_PAN0), tail = 1 - smooth(clamp01((f - (T_PAN0 + SMEAR_N - 2.5)) / 2.5));
    const k = panSpeed(u) * tail * 1.6;
    if (k > 0.05) { overlays = C.whipSmear(0.55 * Math.min(1, k), -1); dof = { focus: 0.05, amount: 9 * Math.min(1, k) }; }
  }
  const glow = matchLight(f);
  if (glow) overlays = overlays ? [overlays, ...glow] : glow;
  const post: Pose["post"] = { dof: dof && dof.amount > 0.05 ? dof : undefined, grade: mixGrade(GRADE_BASE, GRADE_LATE, fs.late) };
  const slate = f < T_DIP0 ? "G extreme close (F's)" : f < T_HELD ? "G M1 down and up" : f < T_LAUGH ? "G held board" : f < T_PAN0 ? "G laugh" : f < T_PAN1 ? "G M2 pan" : f < T_DR0 ? "G door" : "G M3 drop";
  return { camera: cam, post, overlays, slate };
};

// ==================================================================================================== HIS ROOM
/** THE ROOM, one hold (gate 5 r2, notes G1 + G2). The match frame is the plate in her hands where the circle was, the
 *  glow and the light focus on it. Then something changes hands again (as the board did in M1): she holds the plate out
 *  a little, he takes a half step in and takes it in his LEFT hand, and draws it in to his chest on his left (screen
 *  right). The fork in his right stabs the chop on the clink, the bite to his lips (the tine tip on his real mouth), he
 *  chews; he lays the fork on the plate, turns to the candle at his right hand on the table and pinches it out on the
 *  pluck. EYES (G2): never the lens. On the plate (lookDown 14-18 deg, the pupils toward it), on the bite, then on the
 *  candle; the lids at rest all through (expr smile with the half lid: never the full dots), the smile's closed mouth;
 *  his facing 35 deg off the lens until he turns to the candle */
const T_OFFER0 = T_MATCH + 4, T_TAKE = T_MATCH + 15, T_IN1 = T_CLINK - 6;
const T_STEP0 = T_MATCH + 6, T_STEP1 = T_TAKE;
const T_AT_MOUTH = T_CLINK + 12, T_CHEW = T_CLINK + 18, T_FORK_DOWN = T_CLINK + 28, T_FORK_LET = T_FORK_DOWN + 3;
const T_RTURN0 = T_FORK_LET + 4, T_RTURN1 = T_RTURN0 + 20, T_REACH0 = T_OUT - 16;
/** HIS HALF STEP IN toward her as she holds the plate out */
const N_STEP = N_ROOM.clone().addScaledVector(V(RIM_C.x - N_ROOM.x, 0, RIM_C.z - N_ROOM.z).normalize(), 0.2);
const STEP_V = N_ROOM.distanceTo(N_STEP) / ((T_STEP1 - T_STEP0) / FPS);
/** facing the candle at his right hand (a little short of square to it, so the body stays three-quarter to her) */
const F_PINCH = yawTo(N_STEP, CANDLE_R) + 0.3;
const roomN = (f: number) => {
  const g = walkAlong([N_ROOM, N_STEP], STEP_V, (f - T_STEP0) / FPS, { startFacing: F_ROOM, endFacing: F_ROOM, bounce: 0.4 });
  const turn = smooth(clamp01((f - T_RTURN0) / (T_RTURN1 - T_RTURN0)));
  return { at: g.at, facing: lerpA(F_ROOM, F_PINCH, turn), pose: g.moving ? g.pose : ({ kind: "idle", t: f / FPS + 0.4 } as RigPose), turn };
};
/** the plate in her hands: the match, then held out to him */
const offerK = (f: number) => smooth(clamp01((f - T_OFFER0) / (T_TAKE - T_OFFER0)));
const herPlate = (f: number) => PLATE_AT.clone().add(handsLife(f)).addScaledVector(PLATE_TO_HIM, OFFER_D * offerK(f)).add(V(0, -0.09 * offerK(f), 0));
/** HIS GRIP: his left thumb on the plate's near rim (toward him at the take); in his hand the plate keeps that grip and
 *  turns with him, and turns its face up to her (25 deg) as he draws it in */
const GRIP_DIR0 = V(N_STEP.x - herPlate(T_TAKE).x, 0, N_STEP.z - herPlate(T_TAKE).z).normalize();
const GRIP_R = PLATE.r - 0.012;
const gripOf = (centre: THREE.Vector3, dir: THREE.Vector3) => centre.clone().addScaledVector(dir, GRIP_R).add(V(0, PLATE.h - 0.004, 0));
const HELD_Q = quatYZ(V(0, Math.cos(0.44), 0).addScaledVector(PLATE_TO_HER, Math.sin(0.44)), PLATE_TO_HER);
const levelK = (f: number) => smooth(clamp01((f - T_TAKE) / (T_IN1 - T_TAKE)));
const turnQ = (f: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), roomN(f).facing - F_ROOM);
const plateQ = (f: number) => (f < T_TAKE ? PLATE_Q.clone() : turnQ(f).multiply(PLATE_Q.clone().slerp(HELD_Q, levelK(f))));
const gripDir = (f: number) => GRIP_DIR0.clone().applyQuaternion(turnQ(f));
/** the plate held in to his chest on his left (its middle), from where he stands; as he turns to the candle it goes
 *  down to his left side (it turns with him) */
const heldAt = (f: number) => { const r = roomN(f); return rel(r.at, r.facing, 0.05, 0.93, 0.44).lerp(rel(r.at, r.facing, 0.26, 0.8, 0.14), r.turn); };
/** the plate's middle, planned (the take, then drawn in): the left hand's target is its grip; the plate itself is put
 *  on his real hand (it rides the fist) */
const plannedPlate = (f: number) => (f < T_TAKE ? herPlate(f) : herPlate(T_TAKE).lerp(heldAt(f), levelK(f)));
/** where the chop sits on the plate (plate-local, as props/things.ts lays it), the fork's stab (down into it, a little
 *  away from him) */
const chopOf = (centre: THREE.Vector3, q: THREE.Quaternion) => centre.clone().add(V(-0.02, 0.036, -0.02).applyQuaternion(q));
const FORK_DIR_STAB = V(0, -0.72, 0).addScaledVector(V(Math.sin(F_ROOM), 0, Math.cos(F_ROOM)), 0.7).normalize();
/** the fork laid on the plate (plate-local: across its rim, tines in) */
const FORK_ON_L = V(0.04, 0.05, 0.05), FORK_ON_DIR_L = V(-0.75, 0.0, -0.66).normalize();
/** his hands at rest: the fork in his right by his side, the left by his side */
const forkRest = (a: THREE.Vector3, facing: number) => rel(a, facing, -0.17, 0.8, 0.18);
const leftRest = (a: THREE.Vector3, facing: number) => rel(a, facing, 0.2, 0.7, 0.08);
const WICK = CANDLE_R.clone().add(V(0, candleTop(CANDLE_LEN) + 0.012, 0));
/** his eyes: on the plate (screen right of him) as it comes and in his hand, on the bite, then on the candle (screen
 *  left) */
const R_GAZE: [number, number][] = [[T_MATCH, 0.5], [T_CLINK + 4, 0], [T_FORK_DOWN - 6, 0.5], [T_RTURN0, -0.5], [T_OUT + 10, -0.5]];
const rLookDown = (f: number) => ky(f, [[T_MATCH, 16], [T_TAKE, 18], [T_CLINK + 4, 16], [T_AT_MOUTH, 12], [T_CHEW, 13], [T_FORK_DOWN, 18], [T_RTURN1, 16], [T_OUT, 18]]);
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
  const chew = f >= T_CHEW && f < T_RTURN1 ? { dy: -0.03 * (0.5 + 0.5 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3 - Math.PI / 2)), squash: 0.012 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3) } : undefined;
  const out = f > T_OUT;
  // HIS LEFT HAND: by his side, out to the plate's near rim for the take, then holding it in to his chest
  const leftHand = f < T_TAKE
    ? leftRest(r.at, r.facing).lerp(gripOf(herPlate(T_TAKE), GRIP_DIR0), easeInOutCubic(clamp01((f - (T_OFFER0 + 2)) / (T_TAKE - T_OFFER0 - 2))))
    : gripOf(plannedPlate(f), gripDir(f));
  // the chop where it will be at the clink (planned plate; the real plate rides his fist, within a centimetre)
  const chopAt = chopOf(plannedPlate(T_CLINK), plateQ(T_CLINK));
  // THE FORK in his right: first solve with a guess; at his lips it uses his real mouth (people facePoint), solve again
  const forkKeysAt = (mouth: THREE.Vector3): PtKey[] => {
    const toCam = posOf(cam).sub(mouth).setY(0).normalize();
    const atLips = mouth.clone().addScaledVector(toCam.clone().multiplyScalar(0.6).add(V(0, -0.6, 0)).normalize(), FORK_TIP);
    const stab = chopAt.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP);
    const onPlate = plannedPlate(T_FORK_LET).add(FORK_ON_L.clone().applyQuaternion(plateQ(T_FORK_LET))).addScaledVector(FORK_ON_DIR_L.clone().applyQuaternion(plateQ(T_FORK_LET)), -0.1).add(V(0, 0.025, 0));
    return [
      [T_MATCH, forkRest(N_ROOM, F_ROOM)],
      [T_IN1 - 6, forkRest(N_STEP, F_ROOM)],
      [T_CLINK - 5, stab.clone().add(V(0, 0.07, 0))],
      [T_CLINK, stab.clone(), easeOutCubic],
      [T_CLINK + 3, stab.clone().add(V(0, 0.035, 0))],
      [T_AT_MOUTH - 3, atLips.clone().addScaledVector(toCam, 0.08).add(V(0, -0.05, 0))],
      [T_AT_MOUTH, atLips.clone(), easeOutCubic],
      [T_CHEW, atLips.clone()],
      [T_FORK_DOWN, onPlate.clone().add(V(0, 0.05, 0))],
      [T_FORK_LET, onPlate.clone()],
      [T_FORK_LET + 8, forkRest(N_STEP, F_ROOM)],
    ];
  };
  // his right hand after the fork: by his side, then to the candle's wick: the pinch on the pluck, then down
  const rightAt = (mouth: THREE.Vector3 | null) => {
    const k = (mouth ? pathAt(f, forkKeysAt(mouth)) : forkRest(r.at, r.facing));
    if (f < T_FORK_LET + 8) return k;
    const rest = forkRest(r.at, r.facing), pinch = WICK.clone().add(V(0.004, 0.006, 0));
    const reach = smooth(clamp01((f - T_REACH0) / (T_OUT - 2 - T_REACH0))) * (1 - smooth(clamp01((f - (T_OUT + 6)) / 14)));
    return rest.lerp(pinch, reach);
  };
  const set = (mouth: THREE.Vector3 | null) => n.set({
    at: r.at, facing: r.facing, pose: r.pose, expr: "smile", gaze: at(f, R_GAZE), blink: Math.max(0.5, lid(t, 1)),
    lookDown: rLookDown(f), head: chew, hide: NEWTON_HIDE, visible: true, lean: { pitch: 5 },
    hands: [rightAt(mouth), leftHand], armFront: [true, true], seat: undefined, twist: 0,
  });
  set(null);
  w.prop("lid").put(V(RMX + T.x - 0.05, TT + 0.002, T.z - 0.08));
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: 3 });
  w.prop("candle").put(CANDLE_R, { len: CANDLE_LEN, lit: !out, t });
  w.update();
  const mouth = facePoint(n, 0, -0.35, 0.012);
  set(mouth);
  w.update();
  // THE PLATE: in her invisible hands (exactly where the board's circle was on the match frame), then on his left fist
  const pq = plateQ(f);
  const plateC = f < T_TAKE ? herPlate(f) : n.handWorld(1).addScaledVector(gripDir(f), -GRIP_R).sub(V(0, PLATE.h - 0.004, 0));
  w.prop("plate").put(plateC, { rot: pq, lid: 0, steam: 0, bites: f >= T_CLINK + 4 ? 3 : 2, t });
  // THE FORK: in his right fist; laid on the plate from T_FORK_LET (it rides the plate)
  if (f < T_FORK_LET) {
    const fh = n.handWorld(0);
    const REST_DIR = V(0.15, -0.6, 0.5).normalize(), toMouth = mouth.clone().sub(fh).normalize();
    const up = smooth(clamp01((f - T_CLINK - 2) / 6)) * (1 - smooth(clamp01((f - T_CHEW) / (T_FORK_DOWN - T_CHEW))));
    const toPlate = smooth(clamp01((f - (T_FORK_DOWN - 6)) / 6));
    const base = f < T_CLINK ? REST_DIR.clone().lerp(FORK_DIR_STAB, smooth(clamp01((f - (T_CLINK - 8)) / 4))).normalize() : f < T_CHEW ? FORK_DIR_STAB : REST_DIR.clone().lerp(FORK_ON_DIR_L.clone().applyQuaternion(pq), toPlate).normalize();
    w.prop("fork").put(fh, { grip: "hilt", rot: forkRot(base.clone().lerp(toMouth, up).normalize()) });
  } else {
    w.prop("fork").put(plateC.clone().add(FORK_ON_L.clone().applyQuaternion(pq)), { grip: "hilt", rot: forkRot(FORK_ON_DIR_L.clone().applyQuaternion(pq)) });
  }
  // THE CANDLE OUT: the dark comes in over 3 frames from the snuff (the room's own candle light has no switch: a grade,
  // from the film's grade, GRADE_BASE = Film.tsx GRADE_FILM, which the room uses)
  const k = smooth(clamp01((f - T_OUT) / 3));
  // the light focus: on the plate (the match's subject, as the board's circle was) until she holds it out, then on him
  const fk = smooth(clamp01((f - T_OFFER0) / 12)), dPlate = posOf(cam).distanceTo(plateC), dHead = posOf(cam).distanceTo(n.headWorld());
  const post: Pose["post"] = { dof: { focus: Math.max(0.2, lerp(dPlate, dHead, fk)), amount: lerp(MATCH_DOF, 1.2, fk) }, ...(k > 0 ? { grade: mixGradeG(GRADE_BASE, GRADE_OUT, k) } : {}) };
  const glow = matchLight(f);
  return { camera: cam, post, ...(glow ? { overlays: glow } : {}), ...(f <= CAP_G04_END ? { captions: false } : {}), top: f >= T_BLACK ? endBlack(f, T_BLACK) : undefined, slate: out ? "G room, candle out" : "G room" };
};

const pose = (w: World, f: number): Pose => (f >= T_MATCH ? room(w, f) : elab(w, f));

export const SEG: Segment = { id: "G", from: S.from, to: S.to, enter() {}, exit() {}, pose };
