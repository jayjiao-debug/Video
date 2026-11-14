// SEGMENT G · 凌晨两点 · the elaboratory, then his room by candle, then the night garden (PLAN 7 G; script scene 7,
// lines 52-55 = G01-G04). WP5-G. The camera moves only because people move (her eyes at 1.6 m); every frame is a pure
// function of f; every time comes from line() / cap() / capWord() / card() / BEAT / the mix's anchors
// (sound/SYNC_POINTS.md and the clips' own onsets: the clock strikes at G01 start - 3.0 s and - 2.2 s; the board's
// first knock 0.17 s into sfx_board at G01 start - 2.35 s, its second 0.57 s in; the sack's thump at G02 end + 1.0 s;
// the fork's clink 0.23 s into sfx_fork at G04 end + 1.2 s; the crickets outside from G end - 2.6 s; the last pluck
// = his window goes dark at G end - 1.77 s).
//   G1  THE BOARD (F's last framing, ELAB_CAMS.push, carries on): the clock strikes; at the first stroke his eyes lift
//       (and hers: she draws back half a step, his whole head comes into the frame, clear of the vlog's timestamp) and
//       his hands slip off the board; it slides off his left knee and knocks on the floor on the second stroke,
//       slaps down flat and skids to her feet. He startles and looks down at it. She crouches to it; her invisible
//       hands take it (its near edge tips up on its far one) and she rises (stepping back) with it held up close to
//       the lens: circles and triangles, his face above it, his eyes on it, not on her. She sniffs; 52 over it. On
//       「学几何」 his eyes come up to her; she lowers the board out of the frame (the focus racks from it to him); he
//       stares (G02's silent beat) while she leans in a little for his answer.
//   G2  THE LAUGH (53): the camera DEAD STILL; it bursts out of him: eyes squeezed shut, mouth open, the round head
//       shaking, his body bobbing, his right hand slapping his knee; "What... use!" over its tail; he wipes an eye.
//   G3  THE WHIP round to the door (the cut in the blur): HUMPHREY, sooty, outside on the threshold with the full sack
//       in his arms, stares past her, aghast, and DROPS it (the thump). CARD 4: NEWTON comes in from the right with his
//       candle, walks to the door, stops and turns, the smile still on him, and wipes an eye; HUMPHREY (dazed, spiral
//       eyes) backs two steps out of his way. 54 "Good night." (her light focus back on him): Humphrey's second beat,
//       his eyes on Newton: wide ring eyes over a small open mouth, then under 55 「晚安，牛顿先生。」 (she bows her head:
//       the camera's small nod) a small smile; Newton nods, turns and goes out.
//   G4  HIS ROOM by candle (the cut on BEAT.G.room): the day's clock, last tick: he stands at the window table with the
//       cold plate in his left hand (framed right), takes a bite with the fork (the clink), lifts it to his mouth
//       unhurried, chews, smiling a little. CARD 5 mid-left over it.
//   G5  OUTSIDE, from the elaboratory's doorway (its firelit jamb down the right edge, the gravel below): his window lit
//       across the blue garden (a second at least); it goes dark (the pluck); black a second later. The camera does
//       not move in this shot (her camera switches off over it: hud/vlog.tsx).
// SHE IS INVISIBLE (Jay, 14 Nov: "get rid of the microphone and arms", "pretend there is an invisible hand"): no mic
// and no hand are put. The board is taken up and held by invisible hands (its pose kept in her frame, so it rises and
// stays with her as one body: segG_parts heldBoard / toCamLocal); where the mic was aimed, the lens keeps the film's
// light focus (segA / segC do the same); G has no aside to the lens.
import * as THREE from "three";
import { SEGMENTS, line, cap, capWord, card, FPS, clamp01, lerp, smooth, easeOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT, laugh } from "../people";
import { ELX, ELAB, ELAB_SET, ELAB_CAMS, EYE, RMX, ROOM, ROOM_SET, GDX, GARDEN, GARDEN_SET, type TaSeat } from "../layout";
import { BOARD, STOOL, SACK } from "../props";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, rel, seated, type Rig, type RigPose } from "./common";
import { endBlack } from "../hud";
import { V, sec, posOf, frameOn, mixCam, stride, quatYZ, eulYZX, rigidAt, fall, forkRot, FORK_TIP, pathAt, GRADE_NIGHT_G5, spill, toCamLocal, fromCamLocal, heldBoard, boxBottom, lightFocus, type RigidKey, type PtKey } from "./segG_parts";
import type { World } from "../world";

const S = SEGMENTS[6];
const L1 = line("G01"), L2 = line("G02"), L3 = line("G03"), L4 = line("G04");
const CARD4 = card("G02"), CARD5 = card("G04");

// ---------------------------------------------------------------------------------------------------- the mix
/** the clock's two strokes */
const T_S1 = L1.from - sec(3.0), T_S2 = L1.from - sec(2.2);
/** the board: its edge knocks on the floor (sfx_board's first knock), then it slaps down flat (its second) */
const T_CLAT = L1.from - sec(2.35) + sec(0.17), T_FLAT = L1.from - sec(2.35) + sec(0.57);
/** the full sack thumps on the threshold (sfx_sack's onset) */
const T_SACK = L2.to + sec(1.0) + 1;
/** the 2 a.m. bite: the fork's clink on the plate (sfx_fork's onset) */
const T_CLINK = L4.to + sec(1.2) + sec(0.23);
/** outside again (the crickets come in) and his window goes dark (the last pluck) */
const T_OUT = S.to - sec(2.6), T_DARK = S.to - sec(1.77);
/** THE CUT OUTSIDE: his lit window holds at least a second before it goes dark (the crickets come in a few frames
 *  later, or earlier once the mix gives the window more room: requests.md WP5-G round 2), never before the 2 a.m. bite
 *  is down (T_CLINK + 30); the end black starts a second after the window goes dark (BEAT.G.black at the earliest) */
const T_GARDEN = Math.max(Math.min(T_OUT, T_DARK - sec(1.0)), T_CLINK + 30);
const T_BLACK = Math.max(BEAT.G.black[0], T_DARK + sec(1.0));
/** the cut to his room */
const T_ROOM = BEAT.G.room;

// ---------------------------------------------------------------------------------------------------- G1-G2 beats
/** his eyes lift at the first stroke; his hands slip off the board */
const T_LIFT = T_S1 + 3, T_LETGO0 = T_S1 + 4, T_LETGO1 = T_S1 + 13;
/** the board slides off his left knee (it knocks on the floor on T_CLAT) */
const T_SLIP = T_CLAT - 12;
/** she crouches to it, her invisible hands take it (T_TAKE0: its near edge tips up), she rises with it (stepping back);
 *  it is held up by T_HELD */
const T_BEND0 = T_FLAT + 3, T_BEND1 = T_BEND0 + 14, T_GRAB = T_BEND1 + 1, T_RISE0 = T_GRAB + 3, T_RISE1 = T_RISE0 + 18;
const T_TAKE0 = T_GRAB - 3, T_HELD = T_RISE1 + 2;
/** she sniffs before she speaks */
const T_SNIFF = L1.from - 8;
/** on 「学几何」 his eyes come up to her; she lowers the board out of the frame (the focus racks to him); the stare */
const T_EYESUP = cap("G01", 1).from + 2, T_LOWER0 = L1.to - 4, T_LOWER1 = L2.preFrom + 5;
/** THE LAUGH bursts out; it eases off over its tail; he wipes an eye (his right hand) */
const T_LAUGH = BEAT.G.laugh, T_EASE0 = capWord("G02", "use").from + 10, T_WIPE0 = L2.to - sec(1.05), T_WIPE1 = L2.to + 4;
/** THE STARE: the board down, she leans in a little for his answer (7 cm, steady, from the lowering to the laugh's
 *  burst, which it stops on: through the laugh the camera is dead still). What her mic coming in used to say. */
const T_LEAN0 = T_LOWER1 - 3, T_LEAN1 = T_LAUGH, LEAN = 0.07;
/** THE WHIP round to the door (4 frames out, 4 in: the cut in the blur) */
const T_WHIP = L2.to - 2, T_DOOR = T_WHIP + 4;

// ---------------------------------------------------------------------------------------------------- G3 beats
/** her 55 「晚安，牛顿先生。」: she bows her head a little (the camera dips 3 deg in 5 frames, back up in 10) */
const T_BOW = L4.from - 1;
/** her light focus comes back onto him as card 4 goes (for 54 and her 55; the mic used to come back up here) */
const T_FOCUS0 = CARD4.to - 10, T_FOCUS1 = CARD4.to + 4;
/** HUMPHREY lets go of the sack (it falls 9 frames to the thump) */
const T_DROP = T_SACK - 9;
/** NEWTON (off the frame, behind her) gets up and fetches his candle from the furnace, then walks to the door */
const T_NUP = T_SACK + 6;
/** he nods on 牛顿, turns and goes out */
const T_NOD = capWord("G04", "牛").from, T_NOUT = L4.to - sec(0.75);

// ---------------------------------------------------------------------------------------------------- the elaboratory: marks
const DR = ELAB_SET.door, WL = ELAB_SET.walls;
/** HIS SEAT (F's): the stool by the fire door, turned a little to the fire */
const FACE = ELAB.stoolFacing;
const SEAT: TaSeat = { top: ELAB.stool.clone().add(V(0, STOOL.seat, 0)), floor: 0, back: 0.03, facing: FACE };
/** THE BOARD on his knees as F leaves it (README: rot [-PI/2 - 0.3, facing, 0]; F's moved centre, requests.md WP5-F) */
const B_ROT = eulYZX(-Math.PI / 2 - 0.3, FACE, 0);
const B_C = rel(SEAT.top, FACE, 0.0, 0.17, 0.24);
const BX = V(1, 0, 0).applyQuaternion(B_ROT), BY = V(0, 1, 0).applyQuaternion(B_ROT), BZ = V(0, 0, 1).applyQuaternion(B_ROT);
const onBoard = (x: number, y: number, up = 0) => B_C.clone().addScaledVector(BX, x).addScaledVector(BY, y).addScaledVector(BZ, up);
/** his hands as F leaves them: the left on the board's left edge, the right resting on it; the charcoal lying on it */
const HAND_L0 = onBoard(BOARD.w / 2 - 0.02, -0.04, 0.03), HAND_R0 = onBoard(-0.12, -0.06, 0.034);
const CH_REST = onBoard(-0.13, 0.06, 0.007);
const CH_REST_ROT = quatYZ(BX.clone().multiplyScalar(-1).add(BY.clone().multiplyScalar(0.4)), BZ);
/** his hands let go: hanging loose beside his thighs */
const SIDE_R = rel(SEAT.top, FACE, -0.25, 0.08, 0.1), SIDE_L = rel(SEAT.top, FACE, 0.25, 0.08, 0.1);
/** his right knee (the laugh's slaps land on it) */
const KNEE_R = rel(SEAT.top, FACE, -0.12, 0.09, 0.3);
/** the poker hanging by its ring on the end of the fire door's lintel bar (F's, requests.md WP5-F) */
const PK_DIR_REST = V(0, -1, 0.05).normalize();
const PK_GRIP_REST = V(ELX - 1.22 + 0.0078, 0.83 + 0.0325, -0.713).addScaledVector(PK_DIR_REST, 0.066);
const PK_ROT_REST = quatYZ(PK_DIR_REST, V(1, 0, 0));
/** his candle, burned down to a stub, on the furnace's top by the corner (F's marks since its round-1 fixes,
 *  requests.md WP5-F: 2 mm up off the top, length 0.12; the same stub goes up to his room) */
const CANDLE_AT = V(ELX - 1.3, ELAB_SET.furnace.h + 0.07 + 0.002, -0.42);
const CANDLE_LEN = 0.12;
/** where she stands: F's push (the start), crouched by the board, and back a step with the board held up */
const PUSH: CamPose = { pos: ELAB_CAMS.push.pos, look: ELAB_CAMS.push.look, fov: ELAB_CAMS.push.fov };
const P_PUSH = posOf(PUSH).setY(0);
/** his head's middle seated (measured: 0.72 over the stool's seat; R 0.244): the eyes sit a little under it */
const N_HEAD = rel(SEAT.top, FACE, 0, 0.72, 0.01);

// ---- THE BOARD FALLS: it slides forward off his knees (its far edge, the drawing's foot, going down), the far edge
// knocks on the brick in front of his feet, the foot skids away toward her while it falls flat on its back (face up,
// the drawing's top toward him), it slaps down flat and skids on to her feet
const LEFT = V(Math.cos(FACE), 0, -Math.sin(FACE)), FWD = V(Math.sin(FACE), 0, Math.cos(FACE));
const TO_HER = P_PUSH.clone().sub(V(B_C.x, 0, B_C.z)).normalize();
/** the board's yaw on the floor: its +y (the drawing's top) toward him, i.e. upright to her once she tips it up */
const YAW_FLOOR = Math.atan2(TO_HER.x, TO_HER.z);
/** a board standing on its far (-y) edge, the bottom point of that edge at `pivot`, tilted `x` (Euler YZX), yaw `y`:
 *  its middle (the far edge's underside stays on the brick) */
const onEdge = (pivot: THREE.Vector3, x: number, y: number) => {
  const q = eulYZX(x, y, 0), yb = V(0, 1, 0).applyQuaternion(q), zb = V(0, 0, 1).applyQuaternion(q);
  return { at: pivot.clone().addScaledVector(yb, BOARD.h / 2).addScaledVector(zb, BOARD.t / 2), rot: q };
};
/** where its far edge first knocks, how far it skids while it falls flat, and where it comes to rest */
const PIV1 = V(ELAB.stool.x, 0, ELAB.stool.z).addScaledVector(FWD, 0.62).addScaledVector(LEFT, 0.24);
const PIV2 = PIV1.clone().addScaledVector(TO_HER, 0.16);
const X_KNOCK = -Math.PI / 2 + 0.85, X_FLAT = -Math.PI / 2;
const Y_KNOCK = lerp(FACE, YAW_FLOOR, 0.55), Y_FLAT = lerp(FACE, YAW_FLOOR, 0.9);
const K_KNOCK = onEdge(PIV1, X_KNOCK, Y_KNOCK), K_FLAT = onEdge(PIV2, X_FLAT, Y_FLAT);
const B_REST = onEdge(PIV2.clone().addScaledVector(TO_HER, 0.07), X_FLAT, YAW_FLOOR).at;
const Q_FLOOR = eulYZX(X_FLAT, YAW_FLOOR, 0);
const SLIDE_KEYS: RigidKey[] = [
  [T_SLIP, B_C, B_ROT],
  [T_SLIP + 5, B_C.clone().addScaledVector(FWD, 0.13).addScaledVector(LEFT, 0.05).add(V(0, -0.04, 0)), eulYZX(-Math.PI / 2 + 0.05, lerp(FACE, Y_KNOCK, 0.4), 0)],
  [T_CLAT, K_KNOCK.at, K_KNOCK.rot, (x: number) => 0.3 * x + 0.7 * x * x],
];
/** the board on frame f from the slip until she takes it (pure) */
const boardFall = (f: number): { at: THREE.Vector3; rot: THREE.Quaternion } => {
  if (f <= T_CLAT) return rigidAt(f, SLIDE_KEYS);
  if (f <= T_FLAT) {
    // falling flat round its far edge, which skids toward her; a little bounce of the edge on the knock
    const u = clamp01((f - T_CLAT) / (T_FLAT - T_CLAT)), k = fall(u);
    const piv = PIV1.clone().lerp(PIV2, smooth(u));
    const bump = f - T_CLAT < 4 ? 0.012 * Math.sin(Math.PI * (f - T_CLAT) / 4) : 0;
    const e = onEdge(piv, lerp(X_KNOCK, X_FLAT, k), lerp(Y_KNOCK, Y_FLAT, u));
    return { at: e.at.add(V(0, bump, 0)), rot: e.rot };
  }
  // the slap and the skid on to her feet (a small hop on the slap)
  const u = easeOutCubic(clamp01((f - T_FLAT) / 9)), hop = f - T_FLAT < 3 ? 0.006 * Math.sin(Math.PI * (f - T_FLAT) / 3) : 0;
  return { at: K_FLAT.at.clone().lerp(B_REST, u).add(V(0, hop, 0)), rot: K_FLAT.rot.clone().slerp(Q_FLOOR, u) };
};
/** the charcoal rides the board off his knee, then drops off it (already moving) and rolls on the brick */
const CH_FLOOR = V(PIV1.x, 0.0065, PIV1.z).addScaledVector(TO_HER, -0.12).addScaledVector(LEFT, 0.12);
const CH_LOCAL = CH_REST.clone().sub(B_C).applyQuaternion(B_ROT.clone().invert());
const CH_LOCAL_ROT = B_ROT.clone().invert().multiply(CH_REST_ROT);
const T_CHOFF = T_SLIP + 5;
const chOnBoard = (f: number) => {
  const b = rigidAt(f, SLIDE_KEYS);
  return { at: b.at.clone().add(CH_LOCAL.clone().applyQuaternion(b.rot)), rot: b.rot.clone().multiply(CH_LOCAL_ROT) };
};
const CH_OFF = chOnBoard(T_CHOFF);
const dropOff = (x: number) => 0.35 * x + 0.65 * x * x;
const CH_KEYS: RigidKey[] = [
  [T_CHOFF, CH_OFF.at, CH_OFF.rot],
  [T_CLAT + 1, CH_FLOOR, quatYZ(LEFT.clone().add(V(0, -0.3, 0)), FWD), dropOff],
  [T_CLAT + 12, CH_FLOOR.clone().addScaledVector(TO_HER, 0.09), quatYZ(LEFT.clone().addScaledVector(FWD, 0.4), V(0, 1, 0)), easeOutCubic],
];
const charcoalAt = (f: number) => (f < T_SLIP ? { at: CH_REST, rot: CH_REST_ROT } : f <= T_CHOFF ? chOnBoard(f) : rigidAt(f, CH_KEYS));

// ---- her eyes in the elaboratory
/** crouched by the board, looking down at it (it sits low in the middle of the frame) */
const P_CROUCH = B_REST.clone().addScaledVector(TO_HER, 0.4).setY(0.86);
const CROUCH = frameOn(P_CROUCH, B_REST, 540, 980);
/** up again a step back, the board held up close: his eyes high in the frame, the board in the lower middle */
const P_HOLD = V(ELX + 0.42, EYE, 0.18);
const HOLD = frameOn(P_HOLD, N_HEAD, 540, 500);
/** the held board: its middle on the frame, its depth */
const BH = { px: 540, py: 960, depth: 0.86 };
/** the door, after the whip: two steps further back and turned round; the doorway on the blue night with HUMPHREY
 *  outside on the threshold (left of the middle) and room for NEWTON stopping inside it (right); her eyes a little
 *  higher on the frame so his eyes, when he turns at the door, sit in the upper third */
const P_DOOR = V(ELX + 0.85, EYE, -0.22);
const DOOR_LOOK = V(ELX + DR.x + 0.04, 1.12, WL.z1 + 0.1);
const DOOR: CamPose = frameOn(P_DOOR, DOOR_LOOK, 500, 510);
/** THE CLOCK'S FIRST STROKE: she draws back half a step (35 cm, level: her eyes stay at 1.6 m) and her eyes lift with
 *  his (12 deg up, 4 to the left), off F's push, over T_S1 .. T_S1 + 9 (eased in from the still push, so the cut from F
 *  is seamless). It brings his whole head into the frame, his face right of and below the vlog's corner (the big
 *  timestamp intro, 4435-4495: hud/vlog.tsx VLOG_RECT.stampBig; requests.md WP4 vlog UI), his eyes in the upper third
 *  (about y 520), the battery clear, and keeps the board's slide, knock and skid in the frame. */
const levelBack = (c: CamPose, d: number): CamPose => {
  const A = C.camAxes(c), h = V(A.fwd.x, 0, A.fwd.z).normalize().multiplyScalar(-d), p = A.p.add(h), l = A.l.add(h);
  return { ...c, pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z] };
};
const PUSH_BACK = C.nudge(levelBack(PUSH, 0.35), { yaw: -4, pitch: 12 });
const T_BACK1 = T_S1 + 9;
const g1Cam = (f: number): CamPose => {
  if (f < T_BEND0) return mixCam(PUSH, PUSH_BACK, clamp01((f - T_S1) / (T_BACK1 - T_S1)));
  if (f < T_RISE0) return mixCam(PUSH_BACK, CROUCH, stride(clamp01((f - T_BEND0) / (T_BEND1 - T_BEND0))));
  return C.creep(mixCam(CROUCH, HOLD, stride(clamp01((f - T_RISE0) / (T_RISE1 - T_RISE0)))), f, T_LEAN0, T_LEAN1, LEAN);
};
/** the door, with her bow on 55 */
const bowK = (f: number) => { const d = f - T_BOW; return d < 0 || d >= 15 ? 0 : d < 5 ? easeOutCubic(d / 5) : 1 - smooth((d - 5) / 10); };
const doorCam = (f: number): CamPose => { const b = bowK(f); return b > 0 ? C.nudge(DOOR, { pitch: -3 * b }) : DOOR; };

// ---- HUMPHREY outside on the threshold with the full sack in his arms (he stays there, aghast)
const H_AT = V(ELX + DR.x, 0, WL.z1 + DR.wall + 0.22);
const H_FACE = yawTo(H_AT, ELAB.stool);
/** THE SACK (three-quarter size: it clears his coat) by its neck in his two hands in front of his chest, its foot
 *  swung a little out; it drops straight down and lands slumped, its lumps spilling into the room */
const SACK_S = 0.75;
const SACK_NECK = rel(H_AT, H_FACE, 0, 0.95, 0.37);
const SACK_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, H_FACE, 0, "YXZ"));
const SACK_HELD = SACK_NECK.clone().sub(V(0, SACK.neck[1] * SACK_S, 0).applyQuaternion(SACK_ROT));
const SACK_FLOOR = V(SACK_HELD.x, 0, SACK_HELD.z);
/** slumped across the sill, its lumps spilling to her left (clear of NEWTON's way out on her right) */
const SACK_YAW = yawTo(SACK_FLOOR, SACK_FLOOR.clone().add(V(1, 0, -0.15)));

// ---- NEWTON's way: up from the stool, to the furnace corner for his candle, round her right side to the door
const N_UP = rel(ELAB.stool, FACE, 0, 0, 0.3);
const C_SPOT = V(ELX - 0.9, 0, -0.36);
/** where he stops: inside the doorway, clear of the open leaf (his head is half a metre wide), a step short of the
 *  sill so that HUMPHREY, stepping back out of his way, shows between the jamb and his head */
const N_DOOR = V(ELX + DR.x + 0.2, 0, 1.1);
const LEG_A = [N_UP, C_SPOT], LEG_B = [C_SPOT, V(ELX - 0.3, 0, 0.3), V(ELX - 0.14, 0, 0.85), N_DOOR];
const SPEED_A = 0.8, SPEED_B = 1.05;
const T_NA_END = T_NUP + Math.round(walkTime(LEG_A, SPEED_A) * FPS);
const T_CANDLE = T_NA_END + 3, T_NB = T_NA_END + 9;
const T_NARR = T_NB + Math.round(walkTime(LEG_B, SPEED_B) * FPS);
const N_TURNED = yawTo(N_DOOR, P_DOOR);
/** at the end of 55 he turns for the door and takes a step (the cut takes him) */
const LEG_OUT = [N_DOOR, N_DOOR.clone().add(V(-0.03, 0, 0.13))];
/** he wipes an eye at the door (his left hand: the candle is in his right) */
const T_NWIPE0 = T_NARR + 12, T_NWIPE1 = T_NWIPE0 + 18;

/** HUMPHREY MAKES WAY as NEWTON comes to the door: two steps back out onto the path and to his own left (screen right,
 *  into the open middle of the doorway), still facing in, so the jamb and NEWTON's head both leave his face clear */
const H_BACK = H_AT.clone().add(V(-0.33, 0, 0.7));
const H_STEP_V = 0.9, T_HSTEP = T_NARR - 22;
const hmAt = (f: number): { at: THREE.Vector3; pose: RigPose } => {
  const g = walkAlong([H_AT, H_BACK], H_STEP_V, (f - T_HSTEP) / FPS);
  // stepping BACKWARDS: the walk cycle runs the other way so his feet stay planted while he backs away
  return { at: g.at, pose: g.pose.kind === "walk" ? { ...g.pose, phase: (1 - (g.pose.phase ?? 0)) % 1 } : { kind: "idle", t: f / FPS + 0.7 } };
};

type NSt = { at: THREE.Vector3; facing: number; pose: RigPose; turn?: number; seated: boolean };
const newtonDoor = (f: number): NSt => {
  const t = f / FPS;
  if (f < T_NUP) return { at: ELAB.stool.clone(), facing: FACE, pose: { kind: "sit", t }, seated: true };
  if (f < T_NB) {
    const g = walkAlong(LEG_A, SPEED_A, (f - T_NUP) / FPS, { endFacing: -Math.PI / 2 });
    return { at: g.at, facing: g.facing, pose: g.pose, seated: false };
  }
  if (f < T_NOUT) {
    const g = walkAlong(LEG_B, SPEED_B, (f - T_NB) / FPS, { endFacing: N_TURNED });
    const turned = f >= T_NARR;
    return { at: g.at, facing: turned ? lerpA(g.facing, N_TURNED, smooth(clamp01((f - T_NARR) / 10))) : g.facing, pose: g.pose, turn: turned ? undefined : 1, seated: false };
  }
  const g = walkAlong(LEG_OUT, 0.7, (f - T_NOUT - 6) / FPS, { startFacing: N_TURNED });
  return { at: g.at, facing: lerpA(N_TURNED, yawTo(LEG_OUT[0], LEG_OUT[1]), smooth(clamp01((f - T_NOUT) / 9))), pose: g.pose, turn: f >= T_NOUT + 5 ? 1 : undefined, seated: false };
};

// ---------------------------------------------------------------------------------------------------- faces
type Ex = "sigh" | "deadpan" | "sad" | "laugh" | "smile" | "smile_closed";
const N_EXPR: [number, Ex][] = [
  [S.from, "sigh"], [T_CLAT, "deadpan"], [L1.from + 6, "sad"], [T_EYESUP, "deadpan"], [T_LAUGH, "laugh"], [T_WIPE1, "smile_closed"], [T_NUP, "smile"],
];
/** his eyes: on the fire (F's), lifting at the clock, down at the board as it falls, at the board she holds, up at her */
const N_GAZE: [number, number][] = [[S.from, -0.5], [T_LIFT, 0], [T_CLAT + 2, 0.5], [T_RISE0 + 6, 0], [T_EYESUP, 0]];
const nLookDown = (f: number) => ky(f, [[S.from, 8], [T_LIFT + 6, 2], [T_CLAT, 2], [T_CLAT + 6, 30], [T_RISE0, 30], [T_RISE1, 10], [T_EYESUP, 10], [T_EYESUP + 8, 0], [T_LAUGH, 0], [T_LAUGH + 6, -4], [T_WIPE1, -4], [T_WIPE1 + 10, 2]]);
/** HUMPHREY: aghast at the drop, dazed (spiral eyes) through card 4, then the second beat of his reaction, his eyes
 *  on NEWTON: on "Good night." his eyes go wide (the rig's ring eyes, brows up) over a small open mouth (amazed: the
 *  man said good night), and under her 55 a small smile comes up (the rig has no face with ring eyes AND a smile, so
 *  the two come one after the other; the open mouth bends up with the smile for its first frames) */
type HEx = "shock" | "dazed" | "smile";
const T_HSMILE = L4.from + 4;
const H_EXPR: [number, HEx][] = [[S.from, "shock"], [T_SACK + 40, "dazed"], [L3.from, "shock"], [T_HSMILE, "smile"]];
/** his mouth: round (aghast) at the drop; small and open on "Good night." and as the smile comes up; else his face's */
const hMouth = (f: number) => (f < T_SACK + 60 ? "round" as const : f >= L3.from && f < T_HSMILE + 10 ? "small" as const : undefined);

// ---------------------------------------------------------------------------------------------------- G1-G3 the elaboratory
const elab = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("elaboratory");
  w.set.param("fire", 0.3);
  w.set.param("candle", 0.42);
  const door = f >= T_DOOR;
  const Wp = C.whip(g1Cam(f), f, T_WHIP, { dir: -1, to: doorCam(f), deg: 32 });
  const cam = Wp.cam;
  w.setCamera(cam);

  // ---- NEWTON
  const n: Rig = w.actor(NEWTON);
  // his mouth: his own lines (54); the laugh (53) has its own mouth (people.ts laugh)
  const nq = saying("nt", f), ns: ReturnType<typeof speak> = nq && (f < T_LAUGH - 4 || f > T_WIPE1) ? speak(nq, f, 1) : {};
  // his dry talking mouth (segB's ntSpeak, requests.md WP5-B): no full row of teeth, smaller open shapes
  if (ns.mouth === "strip") ns.mouth = "pill"; else if (ns.mouth === "wide") ns.mouth = "half";
  const expr = at(f, N_EXPR);
  const ns2 = newtonDoor(f);
  let right: THREE.Vector3 | null = null, left: THREE.Vector3 | null = null;
  let laughS: ReturnType<typeof laugh> | null = null, bob = 0;
  if (ns2.seated) {
    // the hands: on the board (F's), slipping off at the clock, loose beside his thighs; the laugh's knee slaps; the wipe
    const u = smooth(clamp01((f - T_LETGO0) / (T_LETGO1 - T_LETGO0)));
    const life = (k: number) => V(0.004 * Math.sin(t * 1.1 + k), 0.003 * Math.sin(t * 0.9 + k), 0);
    right = HAND_R0.clone().lerp(SIDE_R, u).add(life(0));
    left = HAND_L0.clone().lerp(SIDE_L, u).add(life(2));
    if (f >= T_LAUGH) {
      const tl = (f - T_LAUGH) / FPS;
      laughS = laugh(tl, { fade: 0.55 * smooth(clamp01((f - T_EASE0) / (T_WIPE1 - T_EASE0))) + 0.45 * smooth(clamp01((f - T_WIPE1) / 14)) });
      const ha = Math.floor(tl * 30 + 1e-6), on = clamp01((f - T_LAUGH - 4) / 6) * (1 - smooth(clamp01((f - (T_WIPE0 - 10)) / 10)));
      bob = 0.009 * on * (ha % 7 < 3 ? 1 : 0.3);
      // the slaps: every other "ha" his right hand comes down on his knee
      const p = ((f - T_LAUGH) % 14) / 14, up = p < 0.5 ? smooth(p * 2) : 1 - smooth((p - 0.5) * 2);
      const slap = KNEE_R.clone().add(V(0, 0.08 * up, 0));
      right = right.lerp(slap, on);
    }
  }
  const head = heads(ns.head, laughS?.head, accent("jolt", f, T_CLAT, { amp: 0.6 }), accent("jolt", f, T_LAUGH - 1, { amp: 0.5 }),
    accent("nod", f, T_NOD, { amp: 0.7 }), f >= L1.from + 6 && f < T_EYESUP ? { tilt: 3 * smooth(clamp01((f - L1.from - 6) / 20)) } : undefined);
  const stare = f >= T_EYESUP + 10 && f < T_LAUGH;
  const nState = {
    expr: laughS ? laughS.expr : expr, ...(laughS?.mouth ? { mouth: laughS.mouth } : {}), ...(ns.mouth ? { mouth: ns.mouth } : {}),
    gaze: at(f, N_GAZE), blink: stare || laughS ? 0 : ns.blink ?? lid(t, 1, swaps(N_EXPR)), head, lookDown: nLookDown(f), hide: NEWTON_HIDE, visible: true,
  };
  if (ns2.seated) {
    const seat = bob ? { ...SEAT, top: SEAT.top.clone().add(V(0, bob, 0)) } : SEAT;
    n.set({ ...seated(seat, t), twist: 0, ...nState, hands: [right, left], armFront: [f >= T_WIPE0 - 4 && f < T_WIPE1 + 10, false], turn: undefined });
  } else {
    // the candle in his right hand, held out in front; at the door his left knuckle wipes an eye
    const cHand = f >= T_CANDLE - 4 ? rel(ns2.at, ns2.facing, -0.2, 0.76 + (ns2.pose.kind === "walk" ? 0.008 * Math.sin(t * 9) : 0.003 * Math.sin(t * 1.2)), 0.25) : null;
    const wk = smooth(clamp01((f - T_NWIPE0) / 6)) * (1 - smooth(clamp01((f - (T_NWIPE1 - 6)) / 6)));
    const toCam = posOf(cam).sub(ns2.at).setY(0).normalize(), lft = V(Math.cos(ns2.facing), 0, -Math.sin(ns2.facing));
    const eyeL = ns2.at.clone().add(V(0, 1.19 + 0.012 * Math.sin((f - T_NWIPE0) * 0.9), 0)).addScaledVector(toCam, 0.25).addScaledVector(lft, 0.09);
    const lHand = wk > 0.001 ? rel(ns2.at, ns2.facing, 0.17, 0.6, 0.05).lerp(eyeL, wk) : null;
    n.set({ at: ns2.at, facing: ns2.facing, pose: ns2.pose, seat: undefined, twist: 0, ...nState, turn: ns2.turn, hands: [cHand, lHand], armFront: [false, wk > 0.001] });
  }

  // ---- HUMPHREY (after the whip: he stands outside on the threshold)
  let hm: Rig | null = null;
  const holding = f < T_DROP;
  if (door) {
    hm = w.actor(HUMPHREY_SOOT);
    // he steps back out of Newton's way, turning a little after him as Newton comes to the door
    const hs = hmAt(f);
    const hFace = lerpA(H_FACE, yawTo(H_BACK, N_DOOR), 0.6 * smooth(clamp01((f - (T_NARR - 20)) / 24)));
    // his eyes: on Newton (past her, screen right), following him to the door; at her once (did you see that?); on him
    const hGaze = at(f, [[S.from, 0.5], [T_NARR - 16, 0.25], [L3.to + 4, 0], [T_NOD, 0.25]]);
    hm.set({ at: hs.at, facing: hFace, pose: hs.pose, expr: at(f, H_EXPR), mouth: hMouth(f), gaze: hGaze,
      blink: f > T_DROP - 4 && f < T_SACK + 24 ? 0 : lid(t, 2, swaps(H_EXPR)), visible: true,
      head: heads(f >= T_SACK && f < T_SACK + 40 ? { tilt: 2.2 * Math.sin((f - T_SACK) * 0.9) * (1 - (f - T_SACK) / 40) } : undefined, accent("jolt", f, T_DROP - 2, { amp: 0.5 }),
        accent("pop", f, L3.from, { amp: 0.5 })),
      hands: hmHands(f, hs.at, hFace) });
  }

  // ---- props before the solve
  w.prop("stool").put(ELAB.stool, { rot: FACE });
  w.prop("poker").put(PK_GRIP_REST, { rot: PK_ROT_REST, hot: 0 });
  if (f < T_CANDLE) w.prop("candle").put(CANDLE_AT, { len: CANDLE_LEN, lit: true, t });
  const ch = charcoalAt(f);
  w.prop("charcoal").put(ch.at, { rot: ch.rot });
  if (door && !holding) {
    if (f < T_SACK) {
      // it drops straight down, its foot swinging under it
      const k = fall(clamp01((f - T_DROP) / (T_SACK - T_DROP)));
      w.prop("sack").put(SACK_HELD.clone().lerp(SACK_FLOOR, k), { full: 1, scale: SACK_S, rot: SACK_ROT.clone().slerp(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), H_FACE), k) });
    } else w.prop("sack").put(SACK_FLOOR, { full: 1, slump: true, scale: SACK_S, rot: SACK_YAW });
  }

  w.update();

  // ---- held things (from where the fists really are)
  if (!ns2.seated && f >= T_CANDLE) w.prop("candle").put(n.handWorld(0), { grip: "grip", len: CANDLE_LEN, lit: true, t });
  if (hm && holding) w.prop("sack").put(SACK_HELD, { full: 1, scale: SACK_S, rot: SACK_ROT });

  // ---- THE BOARD (her invisible hands: no hand is put)
  const B = boardAt(cam, f);
  if (B) w.prop("board").put(B.at, { rot: B.rot });

  // ---- the lens (no mic: Jay, 14 Nov): a light focus on the board while she holds it up, racking to him as she
  // lowers it; on him for the stare and the laugh; none in the whip and under card 4 (she is as stunned as Humphrey);
  // back on him as card 4 goes, for 54 and her 55; the whip's blur
  const mouth = n.headWorld().add(V(0, -0.1, 0));
  let dof: { focus: number; amount: number } | undefined;
  if (!door) {
    if (B && f >= T_RISE0) {
      const r = smooth(clamp01((f - T_LOWER0) / (T_LOWER1 + 2 - T_LOWER0)));
      dof = { focus: lerp(posOf(cam).distanceTo(B.at), posOf(cam).distanceTo(mouth), r), amount: lerp(1.6 * smooth(clamp01((f - T_RISE0) / 10)), 3, r) };
    } else if (f >= T_LOWER1 + 2) dof = lightFocus(cam, mouth);
  } else {
    const a = ky(f, [[T_FOCUS0, 0], [T_FOCUS1, 3]]);
    if (a > 0.05) dof = lightFocus(cam, mouth, a);
  }
  if (Wp.post?.dof) dof = Wp.post.dof;
  return { camera: cam, post: dof && dof.amount > 0.05 ? { dof } : undefined, overlays: Wp.smear > 0.01 ? C.whipSmear(Wp.smear, -1) : undefined, slate: door ? "G3 door" : f >= T_LAUGH ? "G2 laugh" : "G1 board" };
};

// ---- HUMPHREY's hands: round the sack's neck in front of his chest; frozen up after he lets go; slowly down
const hmHands = (f: number, p: THREE.Vector3, face: number): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  const k = smooth(clamp01((f - (T_SACK + 14)) / 26));
  if (k >= 1) return [null, null];
  const side = V(Math.cos(H_FACE), 0, -Math.sin(H_FACE));
  const r = SACK_NECK.clone().addScaledVector(side, -0.055), l = SACK_NECK.clone().addScaledVector(side, 0.055);
  // after letting go the fingers spring open: the hands a little apart and up, and stay there, frozen
  const g = smooth(clamp01((f - T_DROP) / 5));
  r.add(V(0, 0.05 * g, 0)).addScaledVector(side, -0.06 * g);
  l.add(V(0, 0.05 * g, 0)).addScaledVector(side, 0.06 * g);
  if (k <= 0) return [r, l];
  return [r.lerp(rel(p, face, -0.17, 0.58, 0.04), k), l.lerp(rel(p, face, 0.17, 0.58, 0.04), k)];
};

// ---- the board: on his knee; falling; on the floor; taken up by her invisible hands; held up close; lowered out
/** THE TAKE: her invisible fingers get under its near edge (her side, the drawing's foot): it tips up TAKE_DEG on its
 *  far edge, which stays on the brick, and gives a centimetre her way (T_TAKE0 .. T_RISE0) */
const TAKE_DEG = 8, FAR_EDGE = V(0, BOARD.h / 2, -BOARD.t / 2);
const takenAt = (f: number) => {
  const k = easeOutCubic(clamp01((f - T_TAKE0) / (T_RISE0 - T_TAKE0)));
  const rot = Q_FLOOR.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), (-TAKE_DEG * Math.PI / 180) * k));
  const pivot = B_REST.clone().add(FAR_EDGE.clone().applyQuaternion(Q_FLOOR)).addScaledVector(TO_HER, 0.01 * k);
  return { at: pivot.sub(FAR_EDGE.clone().applyQuaternion(rot)), rot };
};
/** where she took it, in her frame (the crouch's camera) */
const TAKEN = takenAt(T_RISE0), TAKEN_L = toCamLocal(CROUCH, TAKEN.at, TAKEN.rot);
const held = (cam: CamPose, f: number, k = 1, dy = 0) => heldBoard(cam, f, { k, px: BH.px, py: BH.py + dy, depth: BH.depth });
const boardAt = (cam: CamPose, f: number): { at: THREE.Vector3; rot: THREE.Quaternion } | null => {
  if (f < T_SLIP) return { at: B_C.clone(), rot: B_ROT.clone() };
  if (f >= T_LOWER1 + 2 || f >= T_DOOR) return null;
  if (f < T_TAKE0) return boardFall(f);
  if (f <= T_RISE0) return takenAt(f);
  if (f < T_HELD) {
    // UP SHE COMES WITH IT: the board in her frame, from where she took it to held up in front of her eyes (it rises
    // and turns with her as one body; its turn spread evenly over the rise, so the firelight leaves its face gently);
    // a little behind her eyes on the way (its weight: up to 6 cm low in her frame mid-way); never through the brick
    const u = smooth(clamp01((f - T_RISE0) / (T_HELD - T_RISE0)));
    const H = held(HOLD, f), HL = toCamLocal(HOLD, H.at, H.rot);
    const p = TAKEN_L.p.clone().lerp(HL.p, u); p.y -= 0.06 * Math.sin(Math.PI * u);
    const b = fromCamLocal(cam, { p, q: TAKEN_L.q.clone().slerp(HL.q, u) });
    const lo = boxBottom(b.at, b.rot, BOARD.w / 2, BOARD.h / 2, BOARD.t / 2);
    if (lo < 0) b.at.y -= lo;
    return b;
  }
  // held up close (her sniff: a small dip of her hands); then lowered out of the frame
  const sniff = f >= T_SNIFF && f < T_SNIFF + 8 ? 12 * Math.sin(Math.PI * (f - T_SNIFF) / 8) : 0;
  const k = 1 - smooth(clamp01((f - T_LOWER0) / (T_LOWER1 - T_LOWER0)));
  return held(cam, f, k, sniff);
};

// ---------------------------------------------------------------------------------------------------- G4 his room by candle
const T = ROOM_SET.table, TT = ROOM.tableTop;
/** he stands at the window table's right end, turned toward her, the plate in his left hand (framed right) */
const N_ROOM = V(RMX + T.x + 0.12, 0, T.z + 0.5), F_ROOM = 0.42;
const ROOM_CAM: CamPose = frameOn(V(RMX - 0.1, EYE, -0.3), N_ROOM.clone().add(V(0, 1.14, 0)), 470, 600);
/** the plate in his left hand (his palm under it), at chest height, out to his left */
const PLATE_HAND = rel(N_ROOM, F_ROOM, 0.24, 0.86, 0.24);
const PLATE_AT = PLATE_HAND.clone().add(V(0, 0.024, 0));
const PLATE_YAW = F_ROOM + 0.5;
const rotY = (p: THREE.Vector3, a: number) => V(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
const onPlate = (x: number, y: number, z: number) => PLATE_AT.clone().add(rotY(V(x, y, z), PLATE_YAW));
const CHOP = onPlate(-0.02, 0.036, -0.02);
/** the lid where Humphrey left it at supper (E), the drafts, the inkwell, the sheets, the chair aside */
const LID_DOWN = V(RMX + T.x + 0.29, TT + 0.002, T.z + 0.07);
const N_HEAD_R = N_ROOM.clone().add(V(0.01, 1.22, 0.01));
const toCamR = posOf(ROOM_CAM).sub(N_HEAD_R).setY(0).normalize();
const MOUTH_R = N_HEAD_R.clone().addScaledVector(toCamR, 0.235).add(V(0, -0.13, 0));
const FORK_DIR_STAB = V(0.1, -0.85, -0.25).normalize();
/** the bite, unhurried: the stab on the clink, a little pull off the plate, the lift to his mouth over 12 frames
 *  (there on T_AT_MOUTH), held while he takes it, the chew from T_CHEW, the fork back down by T_FORK_DOWN */
const T_AT_MOUTH = T_CLINK + 12, T_CHEW = T_CLINK + 18, T_FORK_DOWN = T_CLINK + 28;
const FORK_KEYS: PtKey[] = [
  [T_ROOM, rel(N_ROOM, F_ROOM, -0.12, 0.84, 0.26)],
  [T_CLINK - 5, CHOP.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP).add(V(0, 0.06, 0))],
  [T_CLINK, CHOP.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP), easeOutCubic],
  [T_CLINK + 3, CHOP.clone().addScaledVector(FORK_DIR_STAB, -FORK_TIP).add(V(0, 0.035, 0))],
  [T_AT_MOUTH - 3, MOUTH_R.clone().addScaledVector(toCamR, 0.08).add(V(0, -0.09, 0))],
  [T_AT_MOUTH, MOUTH_R.clone().addScaledVector(toCamR, 0.02).add(V(0, -0.06, 0)), easeOutCubic],
  [T_CHEW, MOUTH_R.clone().addScaledVector(toCamR, 0.02).add(V(0, -0.06, 0))],
  [T_FORK_DOWN, rel(N_ROOM, F_ROOM, -0.1, 0.86, 0.24)],
];
const room = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "night");
  const cam = ROOM_CAM;
  w.setCamera(cam);
  const n: Rig = w.actor(NEWTON);
  const chew = f >= T_CHEW ? { dy: -0.03 * (0.5 + 0.5 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3 - Math.PI / 2)), squash: 0.012 * Math.sin((f - T_CHEW) / FPS * 2 * Math.PI * 2.3) } : undefined;
  const hand = pathAt(f, FORK_KEYS);
  n.set({ at: N_ROOM, facing: F_ROOM, pose: { kind: "idle", t: t + 0.4 }, expr: "smile", gaze: f >= T_CLINK + 8 && f < T_CHEW ? 0 : 0.5, blink: lid(t, 1),
    lookDown: ky(f, [[T_ROOM, 20], [T_CLINK + 4, 22], [T_AT_MOUTH, 8], [T_CHEW, 8], [T_FORK_DOWN, 16]]), head: chew, hide: NEWTON_HIDE, visible: true,
    hands: [hand, PLATE_HAND.clone().add(V(0, 0.003 * Math.sin(t * 1.3), 0))], armFront: [true, false] });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: 3 });
  // his candle, brought up from the elaboratory, on the table's far right corner (clear of the lid; seen past him)
  w.prop("candle").put(V(RMX + T.x + 0.34, TT, T.z - 0.15), { len: CANDLE_LEN, lit: true, t });
  w.update();
  // the plate on his palm (it follows his real hand), the fork in his right fist
  const ph = n.handWorld(1);
  w.prop("plate").put(ph.clone().add(V(0, 0.024, 0)), { rot: PLATE_YAW, lid: 0, steam: 0, bites: f >= T_CLINK + 4 ? 3 : 2, t });
  const fh = n.handWorld(0);
  // the fork's tines: down into the meat on the stab, turning up toward his mouth as it rises, held there, then
  // turning back down as the hand comes down (eased, no snap)
  const REST_DIR = V(0.15, -0.6, 0.5).normalize(), toMouth = MOUTH_R.clone().sub(fh).normalize();
  const up = smooth(clamp01((f - T_CLINK - 2) / 6)) * (1 - smooth(clamp01((f - T_CHEW) / (T_FORK_DOWN - T_CHEW))));
  const base = f < T_CLINK ? REST_DIR.clone().lerp(FORK_DIR_STAB, smooth(clamp01((f - (T_CLINK - 8)) / 4))).normalize() : f < T_CHEW ? FORK_DIR_STAB : REST_DIR;
  const dir = base.clone().lerp(toMouth, up).normalize();
  w.prop("fork").put(fh, { grip: "hilt", rot: forkRot(dir) });
  return { camera: cam, slate: "G4 room" };
};

// ---------------------------------------------------------------------------------------------------- G5 the garden
const GE = GARDEN_SET.elab;
/** OUTSIDE, FROM THE ELABORATORY'S DOOR: her eyes on the threshold (EYE), a step in from the wall's face by the east
 *  half of the opening (the set hides the outbuilding's front wall from in there; the jambs stay), looking out across
 *  the blue garden to his window: upper third, right of the middle (card 5 is mid-left). The west jamb's firelit edge
 *  runs down the right edge; a wide lens (72) and the window high in the frame put the north walk's moonlit gravel in
 *  the bottom third, its edge (the bed's box hedge) leading off toward his range and his staircase door under the
 *  window */
const G_EYE = V(GDX + GE.door.x + 0.08, EYE, GE.z1 - 0.3);
const GARDEN_CAM: CamPose = frameOn(G_EYE, GARDEN.window, 780, 285, 72);
/** where the firelight from behind her lands: on the west jamb's reveal (at her eye height, the right edge) and on the
 *  gravel in front of the door (just off the frame's lower-left corner: the pool's rim comes into the bottom-left) */
const G_JAMB = V(GDX + GE.door.x - GE.door.w / 2, 1.45, GE.z1 - 0.06), G_POOL = V(GDX + GE.door.x - 0.2, 0, GE.z1 + 0.9);
const garden = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("garden");
  w.set.param("time", "night");
  // the outbuilding's glow: from in its doorway the set's warm door light sits right at her feet; at full strength it
  // turns the moonlit gravel and the box in front of her lilac and olive, so it burns low here (the jamb and the pool
  // in front of the door get the 2D spill below, so the walk further out stays moon-blue)
  w.set.param("glow", 0.2);
  w.set.param("gravel", "rough");
  // his window lit warm (param window 1) until the last pluck, then dark
  w.set.param("window", f >= T_DARK ? 0 : 1);
  w.setCamera(GARDEN_CAM);
  w.update();
  // the outbuilding still glows behind her: the fire's light on the jamb and spilling out over the sill onto the gravel
  // (the set's own flicker, so it lives)
  const fl = 1 + 0.08 * Math.sin(t * 6.3) + 0.05 * Math.sin(t * 11.1 + 0.7) + 0.03 * Math.sin(t * 17.3 + 1.9);
  const pj = w.project(G_JAMB), pp = w.project(G_POOL);
  const glow = [spill("jambGlow", { x: pj.x + 80, y: pj.y - 120 }, 460, 1.0 * fl), spill("sillSpill", { x: Math.max(pp.x, -60), y: Math.min(pp.y, 2120) }, 720, 0.8 * fl)].filter(Boolean);
  return { camera: GARDEN_CAM, post: { grade: GRADE_NIGHT_G5 }, overlays: glow.length ? glow : undefined, top: f >= T_BLACK ? endBlack(f, T_BLACK) : undefined, slate: "G5 garden" };
};

const pose = (w: World, f: number): Pose => (f >= T_GARDEN ? garden(w, f) : f >= T_ROOM ? room(w, f) : elab(w, f));

export const SEG: Segment = { id: "G", from: S.from, to: S.to, enter() {}, exit() {}, pose };
