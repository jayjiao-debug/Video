// SEGMENT F · 夜 · the blue garden, then the elaboratory's firelight (PLAN 7 F; script scene 6, lines 36-51 = F01-F16).
// WP5-F. The camera moves only because people move (her eyes at 1.6 m); every frame is a pure function of f; every time
// comes from line() / cap() / capWord() / card() / BEAT / the mix's anchors (sound/SYNC_POINTS.md: the shovel at F02
// end + 0.7 s and F03 start - 1.4 s, the poke at F11 end + 0.15 s, the fire SPITS at F14 end + 0.15 s, the poke after
// 51 at F16 end + 0.6 s).
//   F1  THE NIGHT GARDEN (F01's silent beat): blue moonlight; she follows his candle up the gravel of the east walk, the
//       outbuilding ahead glowing orange at its door and chimney. NEWTON from behind (a back view), his candle held out
//       at his right side.
//   F2  INSIDE (the cut on BEAT.F.inside): from the doorway she follows him in; he walks to his place by the furnace;
//       she takes the room in as she goes (HUMPHREY, sooty, leaning on his shovel by the heap; the bench with the mouldy
//       book, flasks and crucibles), and turns back to him on 「炼金吗？」. She stops in the front-right corner: the
//       furnace's fire door in the middle, NEWTON right of it with his candle, HUMPHREY left by the heap.
//   F3  37 "I'm watching a fire." (to the fire, not to her). CARD 3: he stares at the fire; HUMPHREY turns to the heap,
//       scoops, swings round and throws two loads into the fire door (sparks) on the mix's shovel hits, then leans the
//       shovel on the furnace's side and dozes standing. 38 "Go to bed." (he turns his eyes to her); 39 「不走…」 (she steps in, stubborn); 40 "Nobody stays a
//       whole day." (dry, puzzled: a tilt of the head); HUMPHREY takes the folded empty sack off the stool in his left
//       hand and goes out upstage, round the heap (out of frame left); Newton's eyes follow him, then go back to the
//       fire.
//   F4  TIME PASSES (the cut on BEAT.F.timePass): it opens on his candle burned down to a stub on the furnace top (0.7 s),
//       her eyes drop to the board on his knees, his charcoal scratching circles and triangles, his head bowed over it;
//       the fire has settled to a low bed of red embers (fire 0.13 + the set's embers), the room sunk round him (a
//       grade). She straightens up and steps back as she asks 41: NEWTON on the stool by the fire door, the board on his
//       knee, the poker hung by the door, his candle on the furnace's corner (G finds it there).
//   F5  42-43. THE SLOW PUSH-IN from 44 (BEAT.F.push[0]) to the end of 50 (ELAB_CAMS.stool -> PUSH_END, segF_parts:
//       ELAB_CAMS.push eased back 5 cm and turned 6 deg left and up, his face clear of her camera's UI): 44 at
//       the fire; 46 "Close?" at her (a 0.6 s flash of stern, then deadpan, eyes on the fire); he takes the poker off its
//       hook and POKES the fire (sparks, the flames stirred up); 47-49 bitter, then ashamed, his eyes down; THE FIRE SPITS
//       (a hard burst of sparks up out of the door, never over his face; the flames leap; a warm flash on his near
//       cheek) and he does not look up; 50 sad, cracking; 51 her 「她走了，您却没走。」. Silence: the push has stopped; he
//       pokes the fire again, eyes open on it, and it comes back up to G's fire (the lens's light focus eases off with
//       it: G opens with none); then "sigh".
// SHE IS INVISIBLE (Jay, 14 Nov: "get rid of the microphone and arms"): no mic and no hand are put. F never had an
// aside (to the lens) and her hand never did anything here: the mic only pointed at him while she asked, and every
// question already lands on a move of her own (she turns back to him on 炼金, steps in on 不走, straightens up from the
// board on 41; the push carries 44-50). The lens keeps the light focus on his mouth that the mic used to give, now
// steady from the cut in to the last poke (it no longer jumps with the mic going in and out: card 3, the board rise).
import * as THREE from "three";
import { SEGMENTS, line, cap, capWord, card, FPS, clamp01, lerp, smooth, easeOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE, HUMPHREY_SOOT } from "../people";
import { GDX, GARDEN, GARDEN_SET, ELX, ELAB, ELAB_SET, ELAB_CAMS, EYE, type TaSeat } from "../layout";
import { BOARD, POKER, STOOL, candleTop } from "../props";
import { lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, yawTo, lerpA, rel, seated, kneel, type Rig } from "./common";
import { V, sec, posOf, frameOn, mixCam, lerpCam, stride, creepU, lagged, quatYZ, shovelPut, stroke, sparks, flash, cheekGlow, GRADE_BASE, GRADE_NIGHT, GRADE_LATE, mixGrade, PUSH_END, putStoolUnder, type SparkMask } from "./segF_parts";
import type { World } from "../world";
import type React from "react";

const S = SEGMENTS[5];
const L01 = line("F01"), L02 = line("F02"), L03 = line("F03"), L04 = line("F04"), L05 = line("F05"), L06 = line("F06"), L07 = line("F07");
const L08 = line("F08"), L09 = line("F09"), L10 = line("F10"), L11 = line("F11"), L12 = line("F12"), L13 = line("F13"), L14 = line("F14");
const L15 = line("F15"), L16 = line("F16");

// ---------------------------------------------------------------------------------------------------- the beats
/** the cut inside (BEAT.F.inside) and her question (its first word; 炼 of 炼金) */
const T_IN = BEAT.F.inside, T_ASK = cap("F01", 0).from, T_GOLD = capWord("F01", "炼").from;
/** CARD 3 (nobody speaks) */
const CARD3 = card("F02");
/** HUMPHREY's two loads go into the fire on the mix's shovel hits */
const TH1 = L02.to + sec(0.7), TH2 = L03.from - sec(1.4);
/** he leans the shovel on the furnace; he takes the sack off the stool and goes out (gone before the time cut) */
const T_LEAN = TH2 + 8, T_FREE = TH2 + 20, T_SACK = L05.from + 8;
/** THE TIME CUT: it opens on his candle burned down to a stub on the furnace top (0.7 s), her eyes drop to the board
 *  on his knees; she straightens up from the board and steps back as she asks 41 */
const T_TP = BEAT.F.timePass, T_CANDLE1 = T_TP + sec(0.67), T_BOARD_ON = T_CANDLE1 + 12;
const T_RISE0 = BEAT.F.board[1] + 10, T_RISE1 = L06.from + 38;
/** he stops drawing (42) and lays the charcoal down on the board */
const T_STOP = L07.from + 4;
/** THE PUSH-IN (44 .. the end of 50) */
const [P0, P1] = BEAT.F.push;
/** the pokes and the spit (the mix) */
const T_POKE = L11.to + sec(0.15), T_SPIT = L14.to + sec(0.15), T_POKE2 = L16.to + sec(0.6);
/** the fire comes back up after the last poke over this many frames (the grade lifts and the light focus eases off) */
const REVIVE = 26;

// ---------------------------------------------------------------------------------------------------- F1 the garden
const GW = GARDEN_SET.walks, GE = GARDEN_SET.elab;
/** his night walk: up the east walk, along the north walk, to the outbuilding's door (GARDEN.night's last legs) */
const GPATH = [V(GDX + GW.east, 0, -4.7), V(GDX + GW.east, 0, GW.north), V(GDX + GE.door.x, 0, GW.north + 0.1), GARDEN.elabDoor];
const gLeg = (f: number) => walkAlong(GPATH, 1.3, (f - S.from) / FPS + 0.4);
/** the glowing door she walks toward */
const ELAB_DOOR_GLOW = V(GDX + GE.door.x + 0.35, 1.25, GE.z1);
/** behind him and a little to his left (his candle, held out in his left hand, between him and the door), the door
 *  upper left */
const gardenCam = (f: number): CamPose => {
  const p = lagged(f, (g) => gLeg(g).at, 8), pos = p.clone().add(V(-0.35, EYE, 2.6));
  return C.handheld(frameOn(pos, ELAB_DOOR_GLOW, 400, 700), f, { walk: 1 });
};

// ---------------------------------------------------------------------------------------------------- F2-F3 inside, before the time cut
/** his way in: from the doorway round the stool to his place by the fire */
const NPATH = [V(ELX - 0.3, 0, -0.05), V(ELX - 0.27, 0, -0.72), ELAB.newtonFire];
const N_FIRE = ELAB.newtonFireFacing;
const nLeg = (f: number) => walkAlong(NPATH, 1.15, (f - T_IN) / FPS + 0.2, { endFacing: N_FIRE });
const N_ARRIVE = T_IN + Math.round((1.26 / 1.15 - 0.2) * FPS);
/** his facing once there: to the fire; a little toward her for 38-40; to the fire again */
const nFacing = (f: number) => ky(f, [[L03.from - 8, N_FIRE], [L03.from + 6, N_FIRE + 0.5], [L05.to + 20, N_FIRE + 0.5], [L05.to + 40, N_FIRE + 0.2]]);
/** where SHE stops: the front-right corner (the furnace, the fire door, him and Humphrey in one frame) */
const P_WIDE = V(ELX + 1.65, EYE, 1.3), P_STEP = V(ELX + 1.42, EYE, 1.03);
const N_EYE = 1.14;
/** her eyes on him in the corner: his eyes upper right, the fire door above the card's slot */
const wideCam = (pos: THREE.Vector3, f: number): CamPose => frameOn(pos, lagged(f, (g) => nAt(g).clone().add(V(0, N_EYE, 0)), 6), 850, 560);
const nAt = (f: number) => (f < T_TP ? nLeg(f).at : ELAB.stool.clone());
/** F2: she follows him in from the doorway, looks right along the bench (the mouldy book), back to him on 炼金 */
const E0 = ELAB_CAMS.enter;
const BOOK_LOOK = V(ELX + 1.55, 0.95, -0.25);
const herIn = (f: number) => V(E0.pos[0], EYE, E0.pos[2] + 0.12).lerp(P_WIDE, stride(clamp01((f - T_IN) / (T_GOLD + 8 - T_IN))));
/** how far her eyes are on the bench (in as she comes in, out as she turns back to him on her question) */
const benchK = (f: number) => smooth(clamp01((f - (T_IN + 4)) / 20)) * (1 - smooth(clamp01((f - (T_ASK + 4)) / 26)));
const insideCam = (f: number): CamPose => {
  const pos = f < T_GOLD + 8 ? herIn(f) : f < L04.from ? P_WIDE.clone() : P_WIDE.clone().lerp(P_STEP, stride(clamp01((f - L04.from - 2) / (L04.to - L04.from - 8))));
  const follow = frameOn(pos, lagged(f, (g) => nLeg(g).at.clone().add(V(0, 1.2, 0)), 6), 360, 820);
  const bench = frameOn(pos, BOOK_LOOK, 560, 1000);
  const onHim = wideCam(pos, f);
  const kB = benchK(f);
  const kH = smooth(clamp01((f - (T_ASK + 4)) / 26));
  let cam = mixCam(follow, bench, kB);
  if (kH > 0) cam = mixCam(mixCam(follow, bench, kB), onHim, kH);
  const walking = f < T_GOLD + 8 ? 0.7 : f >= L04.from && f < L04.to ? 0.4 : 0;
  return C.handheld(cam, f, { walk: walking });
};

/** HUMPHREY by the heap: his mark (a step nearer the furnace's front than ELAB.humphreyShovel), his facings */
const H_AT = V(ELX - 0.97, 0, -0.02);
const HEAP_EDGE = V(ELX - 1.3, 0.1, 0.48), FIRE_MOUTH = V(ELX - 1.1, 0.6, -0.76);
/** he turns a little to the right of what he shovels at, so the shaft crosses in front of him to his left fist */
const H_IDLE = yawTo(H_AT, P_WIDE) - 0.35, H_HEAP = yawTo(H_AT, HEAP_EDGE) - 0.3, H_FIRE = yawTo(H_AT, FIRE_MOUTH) - 0.45;
/** half way round between the heap and the fire (his back to her): the shovel is pulled in close and high so that it
 *  clears the furnace's front corner, 0.36 m behind his left shoulder */
const H_TURN = -2.2;
/** the stool before the time cut (the folded empty sack on it), and after (by the fire door) */
const ST1 = V(ELX - 0.05, 0, 0.25);
const SACK_ON_STOOL = ST1.clone().add(V(0, STOOL.seat, 0));
/** the shovel's poses: the T end in his right fist at his right hip, the blade 0.76 m down the shaft toward a target
 *  (his short arms: the left fist only 0.16 m further down the shaft, not on the prop's 0.3 m pair grip) */
const hip = (face: number) => rel(H_AT, face, -0.17, 0.6, 0.04);
type Sh = { blade: THREE.Vector3; handle: THREE.Vector3 };
const shTo = (target: THREE.Vector3, face: number): Sh => { const hp = hip(face), d = target.clone().sub(hp).normalize(); return { blade: hp.clone().addScaledVector(d, 0.76), handle: d.multiplyScalar(-1) }; };
const SH_REST: Sh = { blade: rel(H_AT, H_IDLE, -0.24, 0.1, 0.24), handle: V(0.06, 1, -0.05).normalize() };
const SH_SCOOP_UP = shTo(HEAP_EDGE.clone().add(V(0.02, 0.2, -0.04)), H_HEAP);
const SH_SCOOP = shTo(HEAP_EDGE, H_HEAP);
const SH_CARRY = shTo(rel(H_AT, H_FIRE, -0.1, 0.62, 0.9), H_FIRE);
const SH_THROW = shTo(FIRE_MOUTH, H_FIRE);
/** pulled in: the blade low, 0.3 m in front of his right foot; the shaft steep (its T end at his right shoulder) */
const SH_IN: Sh = { blade: rel(H_AT, H_TURN, -0.1, 0.2, 0.23), handle: rel(V(), H_TURN, -0.15, 0.7, -0.3).normalize() };
/** stood up in front of him, the shaft upright (between the pulled-in turn and the lean) */
const SH_UP: Sh = { blade: rel(H_AT, H_TURN, -0.2, 0.15, 0.25), handle: rel(V(), H_TURN, 0, 1, 0.12).normalize() };
/** leaned on the furnace's side face beside its front corner, blade down (he turns his back to lean it) */
const SH_LEAN: Sh = { blade: V(ELX - 1.36, 0.13, -0.08), handle: V(0.0, 1, -0.2).normalize() };
const H_LEAN = yawTo(H_AT, SH_LEAN.blade) - 0.3;
type ShKey = [number, Sh, number];   // frame, pose, facing
const throwKeys = (th: number): ShKey[] => [
  [th - 22, SH_SCOOP_UP, H_HEAP], [th - 18, SH_SCOOP, H_HEAP], [th - 14, SH_SCOOP_UP, H_HEAP], [th - 9, SH_IN, H_TURN], [th - 4, SH_CARRY, H_FIRE], [th, SH_THROW, H_FIRE], [th + 5, SH_CARRY, H_FIRE],
];
const SH_KEYS: ShKey[] = [
  [T_IN, SH_REST, H_IDLE], [TH1 - 32, SH_REST, H_IDLE],
  ...throwKeys(TH1), [TH1 + 10, SH_IN, H_TURN],
  ...throwKeys(TH2), [TH2 + 10, SH_IN, H_TURN], [TH2 + 14, SH_UP, H_TURN], [T_FREE - 2, SH_LEAN, H_LEAN],
];
/** the shovel's keys are blended in HIS frame (relative to his mark and facing), so a swivel carries the shovel round
 *  with him instead of cutting it through his body */
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
const loaded = (f: number) => (f > TH1 - 18 && f < TH1) || (f > TH2 - 18 && f < TH2);
/** his way out: to the stool for the sack; then back past the heap, upstage (the sack at his side clear of the near
 *  stool; director round 1), and round the heap to the door, the night */
const H_TAKE = ST1.clone().add(V(-0.415, 0, -0.174)), H_PAST = V(ELX - 0.75, 0, -0.25);
const HPATH_OUT = [H_AT, H_TAKE], HPATH_DOOR = [H_TAKE, H_PAST, V(ELX - 0.95, 0, 0.4), V(ELX - 0.6, 0, 1.3), ELAB.doorOut];
const OUT_YAW = yawTo(H_TAKE, H_PAST);
/** THE EMPTY SACK, drawn as cloth: the prop's empty state (two flat boxes) read as an open wooden book (director round
 *  1; WP3 asked for a cloth look), so F shows the FULL sack's lumpy hessian body with its gathered, corded neck, squashed
 *  flat and stretched: an empty bag (the same sack G's full one is). Put by its NECK (world): `up` = from its bottom
 *  toward the neck, `thin` = the flattened axis, `s` = [width, length, thickness] factors of the full sack. */
const NECK_Y = 0.49;
type Limp = { up: THREE.Vector3; thin: THREE.Vector3; s: [number, number, number] };
const putLimpSack = (w: World, neck: THREE.Vector3, rot: THREE.Quaternion, s: [number, number, number]) => {
  const up = V(0, 1, 0).applyQuaternion(rot), P = w.prop("sack");
  P.put(neck.clone().addScaledVector(up, -NECK_Y * s[1]), { full: 1, rot });
  P.group.scale.set(s[0], s[1], s[2]); P.group.updateMatrixWorld(true);
};
/** lying folded on the stool, flat, its gathered neck at the seat's edge toward his LEFT hand (the side he walks out
 *  with); he takes it by the neck and it unfolds as it swings down from his fist to hang at his left side */
const H_TAKE_FACE = yawTo(H_TAKE, ST1);
const SACK_D = rel(H_TAKE, H_TAKE_FACE, 0.16, 0, 0.2).sub(ST1).setY(0).normalize();
const LIMP_LYING: Limp = { up: SACK_D, thin: V(0, 1, 0), s: [0.7, 0.62, 0.16] };
const SACK_GRAB = SACK_ON_STOOL.clone().add(V(0, 0.226 * LIMP_LYING.s[2] + 0.006, 0)).addScaledVector(SACK_D, (NECK_Y - 0.275) * LIMP_LYING.s[1]);
/** hanging from his fist: wider and longer than folded, flat in the plane of his side, its foot swung out */
const limpHanging = (right: THREE.Vector3): Limp => ({ up: V(0, 1, 0).addScaledVector(right, SACK_OUT), thin: right.clone(), s: [1.05, 0.95, 0.2] });
const mixLimp = (a: Limp, b: Limp, k: number): { rot: THREE.Quaternion; s: [number, number, number] } => ({
  rot: quatYZ(a.up, a.thin).slerp(quatYZ(b.up, b.thin), k), s: [lerp(a.s[0], b.s[0], k), lerp(a.s[1], b.s[1], k), lerp(a.s[2], b.s[2], k)] });
/** he takes it; he straightens up turning to his way out (14 frames), and goes */
const T_TAKE = T_SACK + Math.round((0.75 / 0.9) * FPS) + 8, T_GO = T_TAKE + 14;
/** his left fist carrying the sack, out from his side and a little forward; the sack hangs from it with its foot swung
 *  out (SACK_OUT), clear of his coat's flared skirt */
const SACK_CARRY = (p: THREE.Vector3, face: number) => rel(p, face, 0.31, 0.72, 0.07), SACK_OUT = 0.55;

// ---------------------------------------------------------------------------------------------------- F4-F5 the stool, the board, the poker
const SEAT: TaSeat = { top: ELAB.stool.clone().add(V(0, STOOL.seat, 0)), floor: 0, back: 0.03, facing: ELAB.stoolFacing };
const FACE = ELAB.stoolFacing;
/** THE BOARD on his knees, tilted toward him (README: rot [-PI/2 - 0.3, facing, 0]) */
const B_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 - 0.3, FACE, 0, "YXZ"));
const B_C = rel(SEAT.top, FACE, 0.0, 0.17, 0.24);
const BX = V(1, 0, 0).applyQuaternion(B_ROT), BY = V(0, 1, 0).applyQuaternion(B_ROT), BZ = V(0, 0, 1).applyQuaternion(B_ROT);
const onBoard = (x: number, y: number, up = 0) => B_C.clone().addScaledVector(BX, x).addScaledVector(BY, y).addScaledVector(BZ, up);
/** his left hand on the board's left edge (his left = the board's +x) */
const HAND_L = onBoard(BOARD.w / 2 - 0.02, -0.04, 0.03);
/** the charcoal: in his fist while he draws (the tip on the board), then lying on the board */
const CH_REST = onBoard(-0.13, 0.06, 0.007);
const CH_REST_ROT = quatYZ(BX.clone().multiplyScalar(-1).add(BY.clone().multiplyScalar(0.4)), BZ);
const HAND_R_REST = onBoard(-0.12, -0.06, 0.034);
/** THE POKER (origin = the grip; the iron rod runs to RL; its glowing tip to RL + 0.04): at rest it hangs by its ring on
 *  the end of the fire door's iron lintel bar (the ring flat on the bricks, the rod just past the sill bar's end), where
 *  his right hand reaches it from the stool. A poke is keyed by the rod's END and its direction; his fist is where the
 *  grip then is (end - dir * RL). The end only ever enters the furnace through the fire door's opening, sliding along
 *  the poke's line: down from his raised right fist (over the board's right edge) into the opening's middle. */
const RL = POKER.len - 0.08;
const FACE_X = ELX - 1.22;
const PK_DIR_REST = V(0, -1, 0.05).normalize();
const PK_GRIP_REST = V(FACE_X + 0.0078, 0.83 + 0.0325, -0.713).addScaledVector(PK_DIR_REST, 0.066);
const PK_END_REST = PK_GRIP_REST.clone().addScaledVector(PK_DIR_REST, RL);
/** the poke's line: in through the opening's middle (a little low, toward the coals) */
const PK_MOUTH = V(FACE_X, 0.57, -0.88), PK_DIR = V(-0.42, -0.2, -0.18).normalize();
type PkKey = { f: number; end: THREE.Vector3; dir: THREE.Vector3 };
const along = (d: number): Omit<PkKey, "f"> => ({ end: PK_MOUTH.clone().addScaledVector(PK_DIR, d), dir: PK_DIR });
/** lifted off its hook, its end swung out into the room and toward the door's mouth (outside the furnace) */
const PK_LIFT = (() => { const hand = V(ELX - 0.95, 0.95, -0.66), dir = V(0.15, -1, -0.2).normalize(); return { end: hand.clone().addScaledVector(dir, RL), dir }; })();
const pokeKeys = (on: number, big: boolean): PkKey[] => [
  { f: on - 10, end: PK_END_REST, dir: PK_DIR_REST }, { f: on - 6, ...PK_LIFT }, { f: on - 3, ...along(-0.025) }, { f: on, ...along(0.13) }, { f: on + 5, ...along(0.03) },
  ...(big ? [{ f: on + 9, ...along(0.11) }, { f: on + 14, ...along(0.02) }] : []),
  { f: on + (big ? 18 : 9), ...along(-0.03) }, { f: on + (big ? 22 : 13), ...PK_LIFT }, { f: on + (big ? 26 : 17), end: PK_END_REST, dir: PK_DIR_REST },
];
const POKES = [{ on: T_POKE, K: pokeKeys(T_POKE, true) }, { on: T_POKE2, K: pokeKeys(T_POKE2, false) }];
/** his right hand and the poker during a poke (null outside it): he reaches for the grip over 7 frames, holds the poker
 *  through the keys, lets go and puts his hand back on the board over 8 */
const pokeAt = (f: number): { hand: THREE.Vector3; held: { end: THREE.Vector3; dir: THREE.Vector3 } | null; k: number } | null => {
  for (const { K } of POKES) {
    const a = K[0].f, b = K[K.length - 1].f;
    if (f < a - 7 || f > b + 8) continue;
    if (f < a) return { hand: HAND_R_REST.clone().lerp(PK_GRIP_REST, smooth((f - (a - 7)) / 7)), held: null, k: 0 };
    if (f > b) return { hand: PK_GRIP_REST.clone().lerp(HAND_R_REST, smooth((f - b) / 8)), held: null, k: 0 };
    for (let i = 1; i < K.length; i++) if (f <= K[i].f) {
      const A = K[i - 1], B = K[i], e = smooth(clamp01((f - A.f) / Math.max(1, B.f - A.f)));
      const end = A.end.clone().lerp(B.end, e), dir = A.dir.clone().lerp(B.dir, e).normalize();
      const inK = (key: PkKey) => (key.end === PK_END_REST ? 0 : 1);
      return { hand: end.clone().addScaledVector(dir, -RL), held: { end, dir }, k: lerp(inK(A), inK(B), e) };
    }
  }
  return null;
};
/** the poker's rotation at rest: +y down the rod, its ring flat against the furnace's face (+z = the face's normal) */
const PK_ROT_REST = quatYZ(PK_DIR_REST, V(1, 0, 0));
/** his candle, burned down to a stub (it was a new candle in his hand at the cut in: len 0.75), on the furnace's top by
 *  the corner (where G finds it; lifted 2 mm off the plate) */
const CANDLE_AT = V(ELX - 1.3, ELAB_SET.furnace.h + 0.07 + 0.002, -0.42), CANDLE_LEN = 0.12;
/** her eyes: close over the board (she leans in over his knees: the drawing big in the lower half, his bowed head
 *  above it; his 0.5 m head is too near the board for an insert without it), then back to the stool framing
 *  (ELAB_CAMS.stool's place, his eyes high in the middle); the push ends on PUSH_END (ELAB_CAMS.push eased back a
 *  little and turned so that his face stays clear of her camera's UI in the top corners; G opens on it) */
const BOARD_POS = B_C.clone().add(rel(V(), FACE, 0.1, 1.0, 1.1));
const BOARD_CAM: CamPose = frameOn(BOARD_POS, B_C, 540, 1300, 48);
const SEAT_EYES = SEAT.top.clone().add(V(0.005, 0.64, 0));
const STOOL_POS = V(...ELAB_CAMS.stool.pos);
const STOOL_CAM: CamPose = frameOn(STOOL_POS, SEAT_EYES, 545, 480);
const PUSH_CAM: CamPose = PUSH_END;
/** THE TIME CUT opens on his candle, burned down to a stub on the furnace top (she is leaning in toward it, by the
 *  board; her head eases in a little over the hold), then her eyes drop to the board */
const CANDLE_LOOK = CANDLE_AT.clone().add(V(0, candleTop(CANDLE_LEN) * 0.55, 0));
const candleCam = (f: number): CamPose => frameOn(BOARD_POS.clone().lerp(CANDLE_LOOK, 0.3 + 0.04 * smooth(clamp01((f - T_TP) / (T_CANDLE1 - T_TP)))), CANDLE_LOOK, 560, 960, 44);
/** she straightens up from the board to the stool framing for 41. Straight, his head went up through the top LEFT
 *  corner on the way and his forehead crossed under the small stamp 「夜 23:00 / NIGHT」 for 7 frames (3385-3391; faces
 *  checker, skin up to 3289 px2): her eyes lift a hair more on the way up (RISE_LIFT deg at most, frames ~3384-3395,
 *  nothing at either end), which keeps his skin at least 13 px under the stamp's box; the rise's frames and ends unchanged */
const RISE_LIFT = 1.5;
const riseCam = (f: number): CamPose => {
  const u = clamp01((f - T_RISE0) / (T_RISE1 - T_RISE0)), c = mixCam(BOARD_CAM, STOOL_CAM, stride(u));
  const b = clamp01((u - 0.35) / 0.42);
  return b > 0 && b < 1 ? C.nudge(c, { pitch: RISE_LIFT * Math.sin(Math.PI * b) }) : c;
};
const laterCam = (f: number): CamPose => {
  if (f < T_CANDLE1) return candleCam(f);
  if (f < T_BOARD_ON) return mixCam(candleCam(T_CANDLE1), BOARD_CAM, stride(clamp01((f - T_CANDLE1) / (T_BOARD_ON - T_CANDLE1))));
  if (f < T_RISE0) return BOARD_CAM;
  if (f < T_RISE1) return riseCam(f);
  return lerpCam(STOOL_CAM, PUSH_CAM, creepU(f, P0, P1, 10));
};

/** THE FIRE after the time cut, hours later: settled to a low bed of red embers (fire 0.13 + the set's embers: no
 *  standing flames, the room dimmer, the faces still lit). The pokes stir flames up for a moment; THE SPIT throws them up
 *  hard for about 6 frames; the poke after 51 brings the fire back up to what G opens on (fire 0.3, no embers, the
 *  film's own grade), so the cut to G matches. `late` = how much of the hours-later grade, `spit` = the spit's flare. */
const FIRE_LOW = 0.13, FIRE_G = 0.3;
const fireLate = (f: number) => {
  const rv = smooth(clamp01((f - T_POKE2) / REVIVE));
  const sp = holdK(f, T_SPIT, 4, 6), p1 = flareK(f, T_POKE, 12), p2 = flareK(f, T_POKE2, 10);
  const fire = Math.min(1, lerp(FIRE_LOW, FIRE_G, rv) + 0.75 * sp + 0.3 * p1 + 0.15 * p2);
  const embers = clamp01((1 - rv) * (1 - 0.85 * sp) * (1 - 0.55 * p1) - 0.3 * p2);
  return { fire, embers, late: 1 - rv, spit: sp, poke: Math.max(p1, p2) };
};
/** the fire door's opening on the furnace's face (its top edge throws the sparks) */
const FDR = ELAB_SET.furnace.door, FD_X = ELX + ELAB_SET.furnace.x1;

// ---------------------------------------------------------------------------------------------------- faces
type Ex = "deadpan" | "focus" | "stern" | "sad" | "sigh" | "pained";
/** deadpan until the cracks (47 on): "stern" only as a 0.6 s flash on "Close?" (director round 1: held, it read as
 *  cartoon anger), "dying" deadpan with his head bowed a little (nLook); "sigh" only once the second poke is done */
const T_CLOSE = capWord("F11", "Close").from;
const N_EXPR: [number, Ex][] = [
  [S.from, "deadpan"], [T_TP, "focus"], [T_STOP, "deadpan"],
  [T_CLOSE - 2, "stern"], [T_CLOSE + sec(0.6) - 2, "deadpan"], [capWord("F12", "left").from, "sad"], [L13.from, "deadpan"], [capWord("F14", "boy").from + 4, "pained"],
  [capWord("F14", "burn").from + 10, "sad"], [T_POKE2 + 22, "sigh"],
];
/** his eyes (screen: -0.5 = toward the fire on his screen-left, 0 = at her) */
const N_GAZE: [number, number][] = [
  [T_IN, 0], [N_ARRIVE, -0.5], [T_GOLD, 0], [L02.from + 8, -0.5], [L03.from - 2, 0], [T_SACK + 4, -0.5], [T_SACK + 30, -0.5],
  [T_TP, 0], [T_STOP + 4, -0.5], [L10.from + 10, 0], [T_CLOSE + sec(0.6), -0.5], [L13.from + 4, 0], [L14.from + 6, -0.5], [L16.from + 10, 0], [L16.to + 6, -0.5],
];
/** how far his head is bowed (deg) */
const nLook = (f: number) => (f < T_TP ? ky(f, [[L05.from, 4], [capWord("F05", "Nobody").from + 6, 0]]) :
  ky(f, [[T_RISE0, 44], [T_RISE1, 28], [T_STOP - 2, 28], [T_STOP + 8, 6], [capWord("F09", "dying").from - 4, 6], [capWord("F09", "dying").from + 8, 13], [L09.to + 4, 13], [L09.to + 16, 6], [L14.from + 4, 6], [L14.from + 16, 16], [L15.from + 10, 16], [L15.from + 22, 8]]));
const HM_EXPR: [number, "sleep" | "neutral"][] = [[S.from, "neutral"], [T_FREE + 8, "sleep"], [T_SACK, "neutral"]];

// ---------------------------------------------------------------------------------------------------- the shot
const pose = (w: World, f: number): Pose => {
  const t = f / FPS;
  const overlays: React.ReactNode[] = [];

  // ================================================================ F1 THE NIGHT GARDEN
  if (f < T_IN) {
    w.setPlace("garden");
    w.set.param("time", "night");
    w.set.param("glow", 1);
    w.set.param("gravel", "rough");   // WP5-C's rough gravel (C and G's garden use it; the raked lines read as planks)
    const cam = gardenCam(f);
    w.setCamera(cam);
    const g = gLeg(f), n: Rig = w.actor(NEWTON);
    const bob = g.moving ? 0.012 * Math.sin(t * Math.PI * 2 * 1.1) : 0;
    n.set({ at: g.at, facing: g.facing, pose: g.pose, turn: 1, expr: "deadpan", blink: lid(t, 1), hide: NEWTON_HIDE, visible: true,
      hands: [null, rel(g.at, g.facing, 0.27, 0.74 + bob, 0.12)] });
    w.update();
    w.prop("candle").put(n.handWorld(1), { grip: "grip", len: 0.8, lit: true, t });
    // the outbuilding's firelight: a warm spill on the gravel at its door and on the door itself (the night grade cools
    // everything else; the set's own door gap and chimney glow: requests.md WP2)
    const sill = V(GDX + GE.door.x, 0.02, GE.z1 + 0.4), sp = w.project(sill), sr = w.project(sill.clone().add(V(1.1, 0, 0)));
    const dm = w.project(V(GDX + GE.door.x, 0.9, GE.z1 + 0.02)), rr = Math.hypot(sr.x - sp.x, sr.y - sp.y);
    const glow = sp.front ? [flash("doorSpill", sp, rr, 0.5), flash("doorGlow", dm, rr * 0.75, 0.32)].filter(Boolean) : [];
    return { camera: cam, post: { dof: { focus: posOf(cam).distanceTo(n.headWorld()), amount: 2 }, grade: GRADE_NIGHT }, overlays: glow.length ? glow : undefined, slate: "F1 garden" };
  }

  // ================================================================ THE ELABORATORY
  const later = f >= T_TP;
  w.setPlace("elaboratory");
  const fs = later ? fireLate(f) : null;
  w.set.param("fire", fs ? fs.fire : 1);
  w.set.param("embers", fs ? fs.embers : 0);
  w.set.param("candle", later ? 0.42 : 1);
  const cam = later ? laterCam(f) : insideCam(f);
  w.setCamera(cam);

  // ---- NEWTON
  const n: Rig = w.actor(NEWTON);
  const nq = saying("nt", f), ns = nq ? speak(nq, f, 1) : {};
  const expr = at(f, N_EXPR), gaze = at(f, N_GAZE);
  let poke: ReturnType<typeof pokeAt> = null;
  if (!later) {
    const g = nLeg(f), arrived = f >= N_ARRIVE;
    const facing = arrived ? lerpA(g.facing, nFacing(f), smooth(clamp01((f - N_ARRIVE) / 6))) : g.facing;
    const tilt = accent("lean", f, capWord("F05", "whole").from, { dur: 1.4, dir: 1, amp: 0.7 });
    n.set({ at: g.at, facing, pose: arrived ? { kind: "idle", t: t + 1.3 } : g.pose, turn: undefined, expr, gaze, blink: lid(t, 1, swaps(N_EXPR)), ...ns,
      head: heads(ns.head, tilt), lookDown: nLook(f), hide: NEWTON_HIDE, visible: true, seat: undefined,
      hands: [null, rel(g.at, facing, 0.21, 0.66 + (g.moving ? 0.01 * Math.sin(t * 7) : 0.004 * Math.sin(t * 1.3)), 0.12)] });
  } else {
    poke = pokeAt(f);
    const drawing = f < T_STOP;
    const st = stroke(t), right = poke ? poke.hand : drawing ? onBoard(st.x, st.y, 0.034 + 0.012 * st.lift) : HAND_R_REST.clone().add(V(0, 0.003 * Math.sin(t * 1.1), 0));
    const twist = poke ? -0.2 * smooth(clamp01(poke.k * 1.4)) : 0;
    const shake = f >= capWord("F15", "dressings").from && f < L15.to + 12 ? { tilt: 1.2 * Math.sin(t * 2 * Math.PI * 5.5) * smooth(clamp01((f - capWord("F15", "dressings").from) / 8)) } : undefined;
    n.set({ ...seated(SEAT, t), twist, expr, gaze: drawing ? 0 : gaze, blink: lid(t, 1, swaps(N_EXPR)), ...ns,
      head: heads(ns.head, shake, accent("jolt", f, capWord("F11", "Close").from, { amp: 0.4 })), lookDown: nLook(f), hide: NEWTON_HIDE, visible: true,
      hands: [right, HAND_L.clone().add(V(0, 0.002 * Math.sin(t * 0.9), 0))], turn: undefined });
  }

  // ---- HUMPHREY (until he goes out for charcoal)
  let hm: Rig | null = null;
  const sh = shovelAt(f);
  if (!later) {
    hm = w.actor(HUMPHREY_SOOT);
    const hExpr = at(f, HM_EXPR);
    if (f < T_SACK) {
      const holding = f < T_FREE;
      const tEnd = sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.87);
      const pair = [sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.76), sh.sh.blade.clone().addScaledVector(sh.sh.handle, 0.58)];
      const twoHands = (f >= TH1 - 4 && f <= TH1 + 5) || (f >= TH2 - 4 && f <= TH2 + 5);
      const face = holding ? sh.face : lerpA(H_LEAN, H_IDLE, smooth(clamp01((f - T_FREE) / 12)));
      hm.set({ at: H_AT.clone(), facing: face, pose: { kind: "idle", t: t + 0.7 }, expr: hExpr, gaze: f < N_ARRIVE + 20 ? 0.5 : 0, blink: lid(t, 2), visible: true,
        lookDown: twoHands ? 14 : 0, hands: holding ? (twoHands ? [pair[0], pair[1]] : [tEnd, null]) : [null, null] });
    } else {
      const walk1 = walkAlong(HPATH_OUT, 0.9, (f - T_SACK) / FPS, { endFacing: H_TAKE_FACE });
      const out = f >= T_GO ? walkAlong(HPATH_DOOR, 1.05, (f - T_GO) / FPS) : null;
      const s = out ?? walk1;
      // he straightens up with it turning from the stool to his way out (round through her side), then walks
      const face = out ? s.facing : f >= T_TAKE ? lerpA(H_TAKE_FACE, OUT_YAW, smooth(clamp01((f - T_TAKE - 6) / (T_GO - T_TAKE - 6)))) : s.facing;
      const dip = Math.sin(Math.PI * clamp01((f - (T_TAKE - 10)) / 20));
      const handL = f < T_TAKE ? (f >= T_TAKE - 5 ? SACK_GRAB.clone() : null) : f < T_TAKE + 9 ? SACK_GRAB.clone().lerp(SACK_CARRY(s.at, face), easeOutCubic((f - T_TAKE) / 9)) : SACK_CARRY(s.at, face);
      hm.set({ at: s.at, facing: face, pose: s.pose, expr: hExpr, gaze: 0, blink: lid(t, 2), visible: true, ...kneel(0.45 * dip, s.at, 20),
        hands: [null, handL], turn: f >= T_TAKE ? undefined : 0 });
    }
  }

  // ---- props before the solve
  w.prop("poker").put(PK_GRIP_REST, { rot: PK_ROT_REST, hot: 0 });
  if (!later) {
    w.prop("stool").put(ST1, { rot: 0.4 });
    if (f < T_TAKE) putLimpSack(w, SACK_GRAB, quatYZ(LIMP_LYING.up, LIMP_LYING.thin), LIMP_LYING.s);
    if (f >= T_FREE) { const P = shovelPut(SH_LEAN.blade, SH_LEAN.handle, V(0, 0, 1)); w.prop("shovel").put(P.at, { rot: P.rot }); }
  } else {
    putStoolUnder(w, ELAB.stool, FACE);   // a little shorter, its seat hidden inside his coat (segF_parts STOOL_SY)
    w.prop("board").put(B_C, { rot: B_ROT });
    w.prop("candle").put(CANDLE_AT, { len: CANDLE_LEN, lit: true, t });
  }

  w.update();

  // ---- held things (from where the fists really are)
  if (!later) {
    w.prop("candle").put(n.handWorld(1), { grip: "grip", len: 0.75, lit: true, t });
    if (hm && f < T_FREE) { const P = shovelPut(sh.sh.blade, sh.sh.handle); w.prop("shovel").put(P.at, { rot: P.rot, load: loaded(f) }); }
    if (hm && f >= T_TAKE) {
      // lifted off the stool by its neck (his fist rises fast), it swings down from his fist only once it is clear of the
      // seat (kR), and unfolds to its full length once it hangs (kL), as he turns away
      const hand = hm.handWorld(1), right = V(-Math.cos(hm.bodyYaw), 0, Math.sin(hm.bodyYaw));
      const kR = smooth(clamp01((f - T_TAKE - 3) / 7)), kL = smooth(clamp01((f - T_TAKE - 9) / 8)), L = mixLimp(LIMP_LYING, limpHanging(right), kR);
      putLimpSack(w, hand, L.rot, [L.s[0], lerp(LIMP_LYING.s[1], limpHanging(right).s[1], kL), L.s[2]]);
    }
  } else {
    // held: put on its keyed line (his fist is on the grip within 3.5 cm), so the rod's end keeps to the door's opening
    if (poke && poke.held) w.prop("poker").put(poke.held.end.clone().addScaledVector(poke.held.dir, -RL), { rot: quatYZ(poke.held.dir, V(1, 0, 0)), hot: 0.15 + 0.55 * poke.k });
    if (f < T_STOP) {
      const hand = n.handWorld(0), tip = onBoard(stroke(t).x, stroke(t).y, 0.0);
      w.prop("charcoal").put(hand, { grip: "hilt", rot: quatYZ(tip.clone().sub(hand), BY) });
    } else w.prop("charcoal").put(CH_REST, { rot: CH_REST_ROT });
  }

  // ---- HER MIC: none (she is invisible, Jay 14 Nov); it only ever pointed at his mouth, which the lens still focuses on
  const mouth = n.headWorld().add(V(0, -0.1, 0));

  // ---- the sparks: the shovel's charcoal, the poker, THE SPIT: out of the fire door's top edge on screen, up and away
  // from his face; the heads in front of the fire are masked out (a spark never crosses a face)
  const door = w.project(ELAB.furnaceDoor);
  if (door.front) {
    const A = C.camAxes(cam);
    const disc = (p: THREE.Vector3, r: number) => { const c = w.project(p), e = w.project(p.clone().addScaledVector(A.right, r)); return { x: c.x, y: c.y, r: Math.hypot(e.x - c.x, e.y - c.y) }; };
    const mask: SparkMask = [disc(n.headWorld(), 0.31)];
    if (hm) mask.push(disc(hm.headWorld(), 0.28));
    const e0 = w.project(V(FD_X, FDR.y1, FDR.z - FDR.w / 2)), e1 = w.project(V(FD_X, FDR.y1, FDR.z + FDR.w / 2)), b0 = w.project(V(FD_X, FDR.y0, FDR.z - FDR.w / 2)), b1 = w.project(V(FD_X, FDR.y0, FDR.z + FDR.w / 2));
    const [eL, eR] = e0.x < e1.x ? [e0, e1] : [e1, e0], bL = e0.x < e1.x ? b0 : b1;
    const top = (k: number) => ({ x: lerp(eL.x, eR.x, k), y: lerp(eL.y, eR.y, k) + 8 }), wTop = Math.abs(eR.x - eL.x);
    if (!later) {
      overlays.push(sparks(f, TH1, top(0.5), { n: 18, len: 16, speed: 12, size: 13, dir: -88, spread: 50, seed: 1, jitter: wTop * 0.6 }, mask),
        sparks(f, TH2, top(0.5), { n: 18, len: 16, speed: 12, size: 13, dir: -88, spread: 50, seed: 2, jitter: wTop * 0.6 }, mask));
    } else {
      overlays.push(sparks(f, T_POKE, top(0.35), { n: 18, len: 14, speed: 15, size: 13, dir: -104, spread: 40, seed: 3, streak: 0.8, jitter: wTop * 0.5 }, mask),
        sparks(f, T_POKE2, top(0.35), { n: 14, len: 13, speed: 13, size: 12, dir: -104, spread: 40, seed: 4, streak: 0.8, jitter: wTop * 0.5 }, mask));
      // THE SPIT: a hard burst up out of the top edge and out of the left edge, brighter, many more sparks
      overlays.push(sparks(f, T_SPIT, top(0.4), { n: 140, len: 26, speed: 40, size: 24, dir: -100, spread: 46, seed: 5, stagger: 4, streak: 1.4, glow: 1.5, jitter: wTop * 0.9 }, mask),
        sparks(f, T_SPIT, { x: lerp(eL.x, bL.x, 0.35), y: lerp(eL.y, bL.y, 0.35) }, { n: 40, len: 18, speed: 34, size: 20, dir: -150, spread: 40, seed: 6, stagger: 3, streak: 1.3, glow: 1.4, jitter: 50 }, mask));
    }
    // the flare's warm flash out of the door (the spit; a little on a poke); the cheek nearest the fire takes a warm glow
    if (fs) {
      const hd = mask[0], side = Math.sign((eL.x + eR.x) / 2 - hd.x) || -1;
      // the screen-blended flash stays round the door's mouth (spread over his face it lifted his drawn lines to a haze)
      overlays.push(flash("flash", { x: (eL.x + eR.x) / 2, y: lerp(eL.y, bL.y, 0.45) }, wTop * 0.8, 0.9 * fs.spit + 0.25 * fs.poke),
        cheekGlow("cheek", { x: hd.x + side * 0.5 * hd.r, y: hd.y + 0.3 * hd.r }, hd.r * 0.6, fs.spit + 0.3 * fs.poke));
    }
  }

  // ---- the lens: the film's light focus on his mouth (cInf 3, what the mic's aim gave; with no hand near the lens the
  // wide 3-shot no longer needs its lighter cap), steady from the cut in; over the time cut on the candle, then on the
  // board, racked back onto him as she straightens up for 41; eased off as the fire comes back up after the last poke,
  // so F ends with no lens blur, as G opens
  // (while her eyes go along the bench on the way in, the focus goes with them: the book and the candle crisp)
  const dHim = posOf(cam).distanceTo(mouth), kBench = later ? 0 : benchK(f);
  const onHim = { focus: Math.max(0.2, kBench > 0 ? lerp(dHim, posOf(cam).distanceTo(BOOK_LOOK), kBench) : dHim), amount: 3 };
  let dof: { focus: number; amount: number } = onHim;
  if (later && f < T_RISE1) {
    const kb = f < T_CANDLE1 ? 0 : clamp01((f - T_CANDLE1) / (T_BOARD_ON - T_CANDLE1));
    const close = { focus: posOf(cam).distanceTo(CANDLE_LOOK.clone().lerp(B_C, smooth(kb))), amount: lerp(2.2, 3, kb) };
    const kr = smooth(clamp01((f - T_RISE0) / (T_RISE1 - T_RISE0)));
    dof = { focus: lerp(close.focus, onHim.focus, kr), amount: lerp(close.amount, onHim.amount, kr) };
  }
  if (later) dof = { ...dof, amount: dof.amount * (1 - smooth(clamp01((f - T_POKE2) / REVIVE))) };
  // the grade: hours later the room sinks round him (until the poke after 51 brings the fire back up)
  const post: Pose["post"] = {};
  if (dof.amount > 0.05) post.dof = dof;
  if (fs && fs.late > 0.001) post.grade = mixGrade(GRADE_BASE, GRADE_LATE, fs.late);
  const ov = overlays.filter(Boolean);
  return { camera: cam, post: post.dof || post.grade ? post : undefined, overlays: ov.length ? ov : undefined, slate: later ? "F4-5 stool" : "F2-3 inside" };
};
/** a held flare (the spit): up in 2 frames, full for `hold`, down over `len` */
const holdK = (f: number, on: number, hold: number, len: number) => { const d = f - on; return d < -2 || d > hold + len ? 0 : d < 0 ? (d + 2) / 2 : d <= hold ? 1 : 1 - smooth((d - hold) / len); };
/** a flare of the fire on a hit: up in 2 frames, down over `len` */
const flareK = (f: number, on: number, len: number) => { const d = f - on; return d < -2 || d > len ? 0 : d < 0 ? (d + 2) / 2 : 1 - easeOutCubic(d / len); };

export const SEG: Segment = { id: "F", from: S.from, to: S.to, enter() {}, exit() {}, pose };
