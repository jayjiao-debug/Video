// SEGMENT C · 中午 · the noon plate, the garden, his room: THE v5 REBUILD (15 Nov), script_v5 scene C (C01-C07) and
// camplan/C.md with its director notes, converted to voice anchors (line(id), capWord, BEAT.C: SYNC_POINTS' frames).
// ONE TAKE PER PLACE, NO CUT INSIDE A PLACE: she is one person with one camera; the view changes only when she moves
// it. Her eye is 1.5 m (EYE_C) with a breathing bob at rest and a dip on each of her footfalls; she is never seen (no
// mic, no hands): the chair moves by an invisible hand, on its sound. Every frame is a pure function of f.
//
// THE JOINS (beats.ts JOINS): ② whip IN on the noon strike (B owns the outgoing half; C lands it on the plate, 6 f,
// the same smear and blur); ③ MATCH on f BEAT.C.garden: the plate's last frame and the dial's first sit at the same
// place and size (the rim's ellipse centred (540, ~1112), about 505 px wide in both); ④ WHIP UP the range front after
// him, out 6 / cut / in 6 (the approved pitch whip, blur only); ⑤ CLOCK (D's cut): the room view is dead still from
// the jolt's settle (BEAT.C.jolt + 6) to the scene's last frame, so the race's 10 outgoing frames are a still frame.
//
// THE MOVES (frames from the timing, f as of 15 Nov in brackets):
//   PLATE  [1596-1625] HOLD on the noon plate (lid off, no steam, the bars' short shadows), its last frame = the match
//   DIAL   [1626-1673] HOLD: the wide with the sundial as foreground; he walks his turn straight at it, small (C01 is
//          asked from where she stands); focus pulls off the dial onto him from 您
//   M1     [1674-1696] PUSH (director note 1: not a crash zoom): 22 f, eased in and out, the lens x2.1, tilting up off
//          the dial to his whole figure, landing on "out" (C02: the speaker changes, the punch word)
//   WALK   [1696-1789] HOLD, locked: he walks into the close (full figure -> close), C03, the chin, C04's lecture
//   M2     [1789-1794] SNAP ZOOM to the scene's one EXTREME CLOSE, 5 f, the angle -28 %, landing on "is"
//   XCU    [1794-1830] HOLD on the frozen face: STOP 2/5 (the gravel stops on BEAT.C.stop, 12 f dead still, a double
//          blink), he turns on his heel to his window (his back three-quarter) and runs (BEAT.C.run), out of the frame
//          left by 1826: 4 frames of the empty frame (the joke)
//   M3     [1830-1849] PULL BACK AND PAN LEFT the way he ran (the lead walks out of frame and we chase): about 60 deg
//          left, the lens x0.33, landing on 诶 (C05) on the wide: Newton (4 m off) at x ~740, his door at x ~160
//   TROT   [1837-1893] she trots after him (the gravel trot from C05's start: her footfalls dip the lens), north past
//          the sundial's west side toward the crossing, the view held on a fixed point of the cross walk, so it turns
//          west with her and he runs into the middle, his door coming to meet him; the whip leaves from here
//   WHIP ④ [1888-1899] up the range front past his window (out 1888-1893, the cut on the whoosh, in from below)
//   PUSH-ALONG [1897-1922] she pushes the chair to the backs of his knees: three pushes on the three scrapes, the
//          lens travelling with the chair (it moves only while the lens moves), landing on the knock (坐)
//   HOLD   [1922-2016] two-thing, high: his face, the page, the chair at his knees; C06 (her line, his non-reaction),
//          C07 FLICK 2/4 at his hip toward the chair, "No time.", his weight back: his calves shove the chair (the skid)
//   JOLT   [2017-2022] the chair skids back along the corridor out of the bottom of the frame into her shins: the knock
//          kicks the lens down and rolls it, she staggers back half a step (0.3 m) and her eyes drop to the chair,
//          which bounces off toward the desk side and stands askew at her feet (拒收 lands on it, hud/ms/fit_C.ts)
//   HOLD   [2023-2033] dead still: the chair across the middle, Newton writing beyond it, the untouched plate behind
//          him on the right (clock join ⑤)
// STAGING (OVERVIEW: approved for C): the sundial at the end of his walk (the set change, prep); she stands her ground
// for his walk (no walking backwards in front of him: flagged for the producer in camplan C.md). The room: he writes
// standing at the desk's back edge (0.25 m west of ROOM.deskWrite), his back to the panelling, his feet square to the
// desk; she comes along the corridor behind the desk from just past the bookcase's end (her lens never enters the
// pocket beside the case), so the chair she pushes comes to his rear-left calf, and his calves send it straight back
// along the corridor into her (the chair comes back the way it came).
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_GOWN_INK, NEWTON_HIDE, NEWTON_HIDE_WRITING, N_EYE, N_SCALE, N_LEAN_FWD } from "../people";
import { RMX, ROOM, ROOM_CAMS, ROOM_SET, GDX, GARDEN, GARDEN_SET } from "../layout";
import { CHAIR, PLATE } from "../props";
import { rel, hang, lid, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, type Rig, type RigPose } from "./common";
import { V, sec, EYE_C, breath, footBob, stride, whipUp, nibAt, quillFist, quillRot, posOf, ntSpeak } from "./segC_parts";
import type { World } from "../world";

const S = SEGMENTS.find((s) => s.id === "C")!;
const BC = BEAT.C;
const L2 = line("C02"), L3 = line("C03"), L4 = line("C04"), L5 = line("C05"), L7 = line("C07");

// ---------------------------------------------------------------------------------------------------- the beats
/** MATCH ③ (C01 starts on it) */
const T_MATCH = BC.garden;
/** the focus pulls off the dial onto him from her first word (您), over 20 frames */
const T_PULL0 = capWord("C01", "您").from, T_PULL1 = T_PULL0 + 20;
/** M1 THE PUSH (director note 1): 22 frames from C02's voice - 4, landing on "out" */
const T_M1_0 = L2.from - 4, T_M1_1 = BC.out;
/** M2 THE SNAP: 5 frames landing on "is" */
const T_M2_1 = BC.is, T_M2_0 = T_M2_1 - 5;
/** his chin comes up at the end of C03 (he is about to lecture); the bob on "laps" */
const T_CHIN = L3.to - 9, T_LAPS = capWord("C04", "laps").from;
/** STOP 2/5: the gravel stops dead (BEAT.C.stop); 12 frames dead still, then a double blink as he turns on his heel;
 *  his first running step is BEAT.C.run (the gravel run, mus_noon back) */
const T_STOP = BC.stop, T_RUN = BC.run;
const T_BLINK = T_RUN - 4, T_TURN0 = T_RUN - 3, T_TURN1 = T_RUN + 4;
/** M3: he is out of the extreme close about 10 frames into his run; 4 frames of the empty frame; the pull back and
 *  pan (19 f) lands on 诶 */
const T_M3_0 = T_RUN + 14, T_M3_1 = capWord("C05", "诶").from;
/** her trot after him: the gravel trot's sound (C05 start .. C05 end + 0.3 s, cues.json) */
const T_TROT0 = L5.from;
/** WHIP ④: the outgoing half from BEAT.C.whipOut, the cut on the whoosh (BEAT.C.whipCut), 6 frames in */
const T_WHIP = BC.whipOut, T_CUT = BC.whipCut, WHIP_OUT = T_CUT - T_WHIP, WHIP_IN = 6;
/** the chair: three pushes on the three scrapes (each runs to the next), the knock on his knees on 坐 */
const PUSHES = BC.pushes, T_KNEE = BC.knee;
/** C07: FLICK 2/4 on "No time."'s first frame; his weight goes back over the 5 frames before the skid */
const T_FLICK = BC.flick, T_SKID = BC.skid, T_SH0 = T_SKID - 5;
/** THE JOLT: the chair knocks into the lens (the 拒收 stamp's thump inside it); settled J_LEN frames later, so the
 *  clock join's 10 outgoing frames (D's race from seg D's cut - 10) are a still frame */
const T_JOLT = BC.jolt, J_LEN = 6;

// ---------------------------------------------------------------------------------------------------- the plate
const TB = ROOM_SET.table;
/** where Humphrey set the lid down in B (the table's right end, dome up), and the plate's turn there */
const LID_DOWN = V(RMX + TB.x + 0.29, ROOM.tableTop + 0.002, TB.z + 0.07);
const PLATE_ROT = yawTo(V(RMX + TB.x + 0.23, 0, TB.z + 0.44), ROOM.plate);
/** the plate's rim centre and THE MATCH POINT: the plate's centre and the dial's centre both go to (540, 1100), so the
 *  two ellipses sit on each other (plate 511 px wide, centred (540, 1115); dial 499 px, (540, 1110)) */
const PLATE_TOP = ROOM.plate.clone().add(V(0, PLATE.h, 0));
const MATCH = { sx: 540, sy: 1100 };
const CAM_PLATE = C.aimCam(ROOM_CAMS.plate.pos, PLATE_TOP, MATCH.sx, MATCH.sy, ROOM_CAMS.plate.fov);
/** WHIP ② IN: B's C.whip(cam, f, BEAT.B.whipOut, { dir: -1, out: 6, in: 6, deg: 25 }) continued: C's first 6 frames
 *  arrive on the plate from the right (still panning left), the lens blur and the smear running out */
const plateWhip = (f: number) => C.whip(CAM_PLATE, f, BEAT.B.whipOut, { dir: -1, to: CAM_PLATE, out: S.from - BEAT.B.whipOut, in: 6, deg: 25 });

// ---------------------------------------------------------------------------------------------------- the garden
/** his walk down the east walk toward her: mid-stride on the match, at the crossing on the stop */
const WALK = [GARDEN.walkFrom, GARDEN.walkTo];
const T_WALK0 = T_MATCH - sec(0.6);
const WALK_SPEED = walkTime(WALK, 1) / ((T_STOP - T_WALK0) / FPS);
/** his run: west along the cross walk to his staircase door (on its step by the cut) */
const RUN = [GARDEN.cross, GARDEN.runTo];
const RUN_LEN = walkTime(RUN, 1), RAMP = 0.3, T_ARRIVE = T_CUT + 1;
const RUN_V = RUN_LEN / ((T_ARRIVE - T_RUN) / FPS - RAMP / 2);
const runD = (t: number) => (t <= 0 ? 0 : t < RAMP ? (RUN_V * t * t) / (2 * RAMP) : RUN_V * (t - RAMP / 2));
/** he turns on his heel to his window (north-west, 113 deg off her lens: his back three-quarter, the true facing),
 *  then the run's own facing (west) takes over over 8 frames */
const W_FACING = -Math.PI / 2 - 0.4;
type NState = { at: THREE.Vector3; facing: number; pose: RigPose; moving: boolean };
/** where NEWTON is in the garden on frame f */
const gardenNewton = (f: number): NState => {
  if (f < T_STOP) { const g = walkAlong(WALK, WALK_SPEED, (f - T_WALK0) / FPS); return { at: g.at, facing: g.facing, pose: g.pose, moving: true }; }
  const turnK = easeInOutCubic(clamp01((f - T_TURN0) / (T_TURN1 - T_TURN0)));
  const facing = lerpA(0, W_FACING, turnK);
  // THE FREEZE: the idle's own clock stands still (sway 0) from the stop to the turn
  const tIdle = f < T_TURN0 ? T_STOP / FPS : (T_STOP + f - T_TURN0) / FPS;
  if (f < T_RUN) return { at: GARDEN.walkTo.clone(), facing, pose: { kind: "idle", t: tIdle }, moving: false };
  const d = runD((f - T_RUN) / FPS), g = walkAlong(RUN, RUN_V, d / RUN_V);
  return { at: g.at, facing: f < T_TURN1 ? facing : lerpA(W_FACING, g.facing, smooth(clamp01((f - T_TURN1) / 8))), pose: g.moving ? g.pose : { kind: "idle", t: f / FPS }, moving: g.moving };
};
const eyesOf = (p: THREE.Vector3) => p.clone().add(V(0, N_EYE, 0));

/** HER PLACE: she stands her ground 1.6 m behind the sundial, 0.3 m west of its line (the dial at the plate's place
 *  and size for the match; in the walk and the extreme close it is a soft foreground at the lower right, off his
 *  figure), then trots after him north past the dial's west side (0.34 m off its rim) toward the crossing */
const SD = GARDEN_SET.sundial;
const P_G = V(GDX + SD.x - 0.3, EYE_C, SD.z + 1.6);
const TROT_PTS = [P_G, V(GDX + SD.x - 0.6, EYE_C, SD.z), V(GDX + SD.x - 0.35, EYE_C, GARDEN_SET.walks.cross + 0.3)];
const T_TROT1 = T_CUT + 2;
const bez = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, u: number) => a.clone().multiplyScalar((1 - u) ** 2).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(c, u * u);
const herG = (f: number) => bez(TROT_PTS[0], TROT_PTS[1], TROT_PTS[2], stride(clamp01((f - T_TROT0) / (T_TROT1 - T_TROT0)), 0.3));
/** her trot's footfalls (about 3 a second, the trot loop's pace) */
const TROT_FALLS = Array.from({ length: 6 }, (_, i) => T_TROT0 + 3 + 10 * i).filter((x) => x < T_CUT);
/** THE SET-UPS (every subject a FIXED world point, so a held view is truly still while he moves inside it):
 *  DIAL  the sundial's dial centre on the match point, lens 62 (58.8 deg seen on 9:15)
 *  WALK  his eyes where they are on "out" (6.5 m up the walk) at (500, 600), lens 31.7: he walks into it, full figure
 *        to close (head 135 -> 258 px), drifting right and down a little as he comes
 *  XCU   his eyes on his stop mark at (545, 700), lens 23.1 (a 28 % drop from WALK): head about 800 px wide, the skin
 *        clear of the button column and the REC row
 *  LB    a fixed point on the cross walk 4.6 m short of his door (1.2 m up) at (540, 760), lens 70: on 诶 Newton
 *        (4.2 m off) runs at x ~740 with his door at x ~160; as she trots after him the point turns her view west,
 *        so he runs into the middle (x 430-460) and his door comes to meet him there by the whip */
const DIAL_AT = GARDEN.dial.clone();
const WALK_AT = eyesOf(walkAlong(WALK, WALK_SPEED, (T_M1_1 - T_WALK0) / FPS).at);
const XCU_AT = eyesOf(GARDEN.walkTo);
const LB_AT = V(GDX - 1.0, 1.2, GARDEN_SET.walks.cross);
const FOV_DIAL = 62, FOV_WALK = 31.7, FOV_XCU = 23.1, FOV_LB = 70;
const GKEYS: C.LensKey[] = [
  { f: T_M1_0, pos: herG, at: DIAL_AT, sx: MATCH.sx, sy: MATCH.sy, fov: FOV_DIAL },
  { f: T_M1_1, pos: herG, at: WALK_AT, sx: 500, sy: 600, fov: FOV_WALK },
  { f: T_M2_0, pos: herG, at: WALK_AT, sx: 500, sy: 600, fov: FOV_WALK },
  { f: T_M2_1, pos: herG, at: XCU_AT, sx: 545, sy: 700, fov: FOV_XCU, ease: easeOutCubic },
  { f: T_M3_0, pos: herG, at: XCU_AT, sx: 545, sy: 700, fov: FOV_XCU },
  { f: T_M3_1, pos: herG, at: LB_AT, sx: 540, sy: 760, fov: FOV_LB },
];
/** her eyes in the garden: the lens keys, her breathing while she stands, her footfalls while she trots */
const gardenCam = (f: number): CamPose => {
  const fb = footBob(f, TROT_FALLS, 0.016);
  return C.nudge(C.lensCam(f, GKEYS), { up: fb.up + breath(f, f < T_TROT0 ? 1 : 0), right: fb.right, roll: fb.roll });
};
/** NEWTON's faces in the garden (swaps under blinks): dry through the walk and "I am out.", lecturing on C04 (and
 *  frozen so through the stop: only his eyes move), absorbed as he runs */
const G_EXPR: [number, "deadpan" | "stern" | "focus"][] = [[S.from, "deadpan"], [L4.from - 3, "stern"], [T_RUN, "focus"]];
/** his hands: behind his back all through the walk, the lecture and the freeze; as he turns on his heel they come out
 *  to his sides round his body, so the run's swing takes over without a jump */
const gardenHands = (f: number, s: NState): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  if (f >= T_RUN) return [null, null];
  const back = (side: 1 | -1) => rel(s.at, s.facing, side * 0.11, 0.6, -0.24);
  const k = smooth(clamp01((f - T_TURN0 + 2) / (T_RUN - T_TURN0 + 2)));
  const hand = (side: 1 | -1, arm: 0 | 1) => {
    const mid = rel(s.at, s.facing, side * 0.24, 0.6, -0.08);
    return k < 0.5 ? back(side).lerp(mid, smooth(k * 2)) : mid.lerp(hang(s.at, s.facing, arm), smooth(k * 2 - 1));
  };
  return [hand(-1, 0), hand(1, 1)];
};
/** his head: eyes ahead (lookDown 4) on his walk, the chin up at the end of C03 and through C04 (a bob on "laps"),
 *  STOP: the chin up 3 deg more, the eyes 0.5 to frame left (where the idea is: his window), no blink, no sway; a
 *  small jolt of the head on the stop (director note 5: half the old one, so it never reads as the camera hit) */
const gardenLook = (f: number) => {
  const chin = ky(f, [[T_CHIN, 4], [L3.to, -5], [T_STOP, -5], [T_STOP + 3, -8], [T_TURN0, -8], [T_TURN1, 0]]);
  const gaze = f >= T_STOP + 1 && f < T_TURN1 ? -0.5 : 0;
  return { lookDown: chin, gaze, head: heads(accent("nod", f, T_LAPS, { amp: 1.0 }), accent("jolt", f, T_STOP, { amp: 0.3 })) };
};
/** THE DOUBLE BLINK that ends the freeze (two quick blinks), none in the 12 frames before it */
const freezeBlink = (f: number) => {
  const d = f - T_BLINK;
  return [0.5, 1, 0.5, 0, 1, 0.5][d] ?? 0;
};

// ---------------------------------------------------------------------------------------------------- the room
/** NEWTON writing standing at the desk's back edge, 0.25 m west of ROOM.deskWrite (so her corner can stay clear of the
 *  bookcase's end and the chair still reaches his calves), 0.29 m behind the edge (his belly over it as he leans), his
 *  feet square to the desk (N_LEGS 0), his back to the panelling, his left side to her. The rig turns his body and
 *  face to her lens on its own (rule 2: from her place he is 100-110 deg off his feet, inside the 115 deg where the
 *  torso still turns), so his face reads in three-quarter while his calves are toward the chair. */
const N_X = -0.25;
const N_AT = V(ROOM.deskWrite.x + N_X, 0, -1.95), N_LEGS = 0;
/** his head's middle while he leans over the page (look rev2: the lean carries it N_LEAN_FWD forward) */
const N_HEAD = rel(N_AT, N_LEGS, 0, 1.19 * N_SCALE, 0.12 * N_SCALE + N_LEAN_FWD);
/** THE PAGE: one loose sheet square in front of him on his writing place; its lines run from his left to his right */
const N_LEFT = V(Math.cos(N_LEGS), 0, -Math.sin(N_LEGS)), N_FWD = V(Math.sin(N_LEGS), 0, Math.cos(N_LEGS)), N_BACK = N_FWD.clone().negate();
const SHEET_AT = V(ROOM.deskWrite.x + N_X - 0.01, ROOM.deskTop + 0.0005, ROOM.deskWrite.z + 0.03);
/** the sheets prop's first sheet sits turned -0.166 in it (props/things.ts sheets' fan): this lays it square to him */
const SHEET_ROT = N_LEGS + 0.166;
const PAGE = SHEET_AT.clone().add(V(0, 0.004, 0)).addScaledVector(N_FWD, -0.02);
/** THE CHAIR (props CHAIR: its back at local -z): seat front to the west (yaw -PI/2), its back to her lens.
 *  START  where it stood pushed out of his way along the corridor (the whip lands behind it)
 *  LAND   its seat front against his rear-left calf (the knock on 坐)
 *  KNOCK  where it is as it knocks into her lens: its top rail 13 cm in front of her eye's floor point (under the
 *         frame's bottom edge: it has rushed out of the picture into her)
 *  REST   where it bounces back to off her shins (toward the desk side) and stands askew (21 deg): at her feet, its
 *         back across the middle of the frame (rail x ~290-800, y ~1020), its seat in the stamp's box */
const CH_YAW = -Math.PI / 2;
const D_PUSH = 0.32, D_RAIL = 0.62;
/** her lens's floor x at the start: 2 cm short of the bookcase's end (x 1.98), so the case is beside her, never in the frame */
const L_X0 = RMX + 1.94;
const CH_LAND = V(L_X0 - D_PUSH - D_RAIL + CHAIR.rail[2], 0, -2.22);
const CH_START = CH_LAND.clone().add(V(D_PUSH, 0, -0.01));
/** HER LENS in the room (eye 1.5 m): she pushes the chair's top rail from D_RAIL behind it (START: just past the
 *  bookcase's end), travels with it, holds where the push lands (END), and is knocked back where she began (FINAL) */
const L_START = V(L_X0, EYE_C, -2.42);
const L_END = L_START.clone().add(V(-D_PUSH, 0, 0.02));
const RECOIL = 0.3;
const L_FINAL = L_END.clone().add(V(RECOIL, 0, -0.02));
const CH_KNOCK = V(L_END.x - 0.13 + CHAIR.rail[2], 0, -2.3);
const CH_REST = V(CH_KNOCK.x - 0.28, 0, -2.15);
const CH_SKID_MID = V(lerp(CH_LAND.x, CH_KNOCK.x, 0.4), 0, -2.3);
/** the push's progress 0..1: three shoves, each a quick push that runs out on its scrape, the last landing on the knock */
const PUSH_SEG: [number, number][] = [[PUSHES[0], PUSHES[1]], [PUSHES[1], PUSHES[2]], [PUSHES[2], T_KNEE]];
const pushK = (f: number) => PUSH_SEG.reduce((k, [a, b]) => k + (1 - Math.pow(1 - clamp01((f - a) / (b - a)), 2.2)) / 3, 0);
/** the skid's progress 0..1 (T_SKID .. T_JOLT): a hard shove that friction slows, still moving when it hits */
const skidK = (f: number) => { const u = clamp01((f - T_SKID) / (T_JOLT - T_SKID)); return u * (1.6 - 0.6 * u); };
/** the bounce off her (T_JOLT .. + J_LEN) */
const bounceK = (f: number) => easeOutCubic(clamp01((f - T_JOLT) / (J_LEN - 1)));
const chairAt = (f: number): { at: THREE.Vector3; yaw: number; tip: number } => {
  if (f < T_SKID) {
    const k = pushK(f), p = CH_START.clone().lerp(CH_LAND, k);
    // a little rock as it knocks his calves
    const tip = f >= T_KNEE && f < T_KNEE + 6 ? -1.2 * Math.sin((Math.PI * (f - T_KNEE)) / 6) : f > PUSHES[0] && f < T_KNEE ? 1.5 * Math.sin(Math.PI * k) : 0;
    return { at: p, yaw: CH_YAW, tip };
  }
  if (f < T_JOLT) {
    const k = skidK(f);
    return { at: CH_LAND.clone().multiplyScalar((1 - k) ** 2).addScaledVector(CH_SKID_MID, 2 * k * (1 - k)).addScaledVector(CH_KNOCK, k * k), yaw: CH_YAW + 0.25 * smooth(k), tip: 2.2 * Math.sin(Math.PI * k) };
  }
  const k = bounceK(f);
  return { at: CH_KNOCK.clone().lerp(CH_REST, k), yaw: CH_YAW + 0.25 + 0.12 * k, tip: f < T_JOLT + J_LEN ? -2.5 * Math.sin(Math.PI * k) : 0 };
};
/** the chair's put: its yaw, and the tip (deg) about the floor line under its leading legs (tip > 0: toward its back,
 *  the way it travels on the skid; < 0 the other way), so two feet always stay on the boards */
const chairPut = (f: number) => {
  const c = chairAt(f), qYaw = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), c.yaw);
  if (Math.abs(c.tip) < 1e-3) return { at: c.at, rot: qYaw as THREE.Quaternion | number };
  const back = V(0, 0, -1).applyQuaternion(qYaw), side = c.tip > 0 ? 1 : -1;
  const pivot = c.at.clone().addScaledVector(back, side * (CHAIR.d / 2 - 0.01));
  const axis = V(0, 1, 0).cross(back).normalize();
  const q = new THREE.Quaternion().setFromAxisAngle(axis, (c.tip * Math.PI) / 180);   // (+: the far feet rise off the boards)
  return { at: pivot.clone().add(c.at.clone().sub(pivot).applyQuaternion(q)), rot: q.multiply(qYaw) as THREE.Quaternion | number };
};
/** her lens's floor point and eye in the room on frame f */
const lensAt = (f: number) => {
  if (f < T_JOLT) return L_START.clone().lerp(L_END, pushK(f));
  return L_END.clone().lerp(L_FINAL, easeOutCubic(clamp01((f - T_JOLT) / 4)));
};
/** THE JOLT: the chair rams her shins: the lens kicks down and rolls (her body jerks over it), settling in J_LEN frames
 *  while she staggers back half a step (lensAt) and her eyes drop to the chair at her feet (the last lens key) */
const joltK = (f: number) => { const d = f - T_JOLT; return d < 0 || d >= J_LEN ? 0 : d < 1 ? 1 : 1 - smooth((d - 1) / (J_LEN - 1)); };
const FOV_ROOM = 80;
const RKEYS: C.LensKey[] = [
  { f: T_CUT, pos: lensAt, at: N_HEAD, sx: 470, sy: 470, fov: FOV_ROOM },
  { f: T_KNEE, pos: lensAt, at: N_HEAD, sx: 470, sy: 460, fov: FOV_ROOM },
  { f: T_JOLT, pos: lensAt, at: N_HEAD, sx: 470, sy: 460, fov: FOV_ROOM },
  { f: T_JOLT + 5, pos: lensAt, at: N_HEAD, sx: 390, sy: 400, fov: FOV_ROOM, ease: easeOutCubic },
];
const roomCam = (f: number): CamPose => {
  const fb = footBob(f, PUSHES, 0.012), j = joltK(f);
  const still = f >= T_JOLT + J_LEN;
  return C.nudge(C.lensCam(f, RKEYS), { up: fb.up + (still ? 0 : breath(f, f < PUSHES[0] || f >= T_KNEE ? 1 : 0)), right: fb.right, roll: fb.roll - 2 * j, pitch: -6 * j });
};
/** NEWTON bent over the desk: the "haul" pose run backwards leans him forward over the page (the rig's only forward
 *  lean), breathing a little; on the shove his weight goes back (the lean eases off) and comes forward again */
const LEAN = 0.25, LOOK_DOWN = 10;
const shoveK = (f: number) => (f < T_SH0 ? 0 : f < T_SKID ? easeInCubic((f - T_SH0) / (T_SKID - T_SH0)) : 1 - smooth(clamp01((f - T_SKID) / 12)));
const leanPose = (f: number): RigPose => ({ kind: "haul", t: 0, phase: 0.03 * Math.sin((2 * Math.PI * 0.23 * f) / FPS), amount: -LEAN * (1 - 0.7 * shoveK(f)) });
/** THE QUILL: the feather up and forward off the page, over the desk, on the near side of his head (only a little to
 *  his right: the set's tall paper stacks stand 0.1 m west of his page) */
const QDIR_C4 = V(-0.1, 0.75, 0.62).normalize();
const QROT_C4 = quillRot(QDIR_C4, posOf({ pos: L_END, look: N_HEAD, fov: FOV_ROOM }).sub(PAGE));
const quillHand = (f: number) => quillFist(nibAt(f, PAGE, 1, N_LEFT, N_FWD), QDIR_C4);
/** his left hand (her side) leans flat on the desk just left of the page, 0.2 m out from his middle so the arm stays
 *  clear of his body; FLICK 2/4: it drops to his left hip and two fingers flick back at the chair twice without a
 *  look, then it goes back to the desk */
const SHEET_HOLD = SHEET_AT.clone().addScaledVector(N_LEFT, 0.19).addScaledVector(N_FWD, 0.04).add(V(0, 0.026, 0));
const HIP = rel(N_AT, N_LEGS, 0.24, 0.82, -0.04), FLICK_OUT = rel(N_AT, N_LEGS, 0.3, 0.8, -0.17);
const leftHand = (f: number) => {
  const rest = SHEET_HOLD.clone().add(V(0.003 * Math.sin(f * 0.031), 0, 0.003 * Math.sin(f * 0.023 + 1)));
  const down = smooth(clamp01((f - (T_FLICK - 6)) / 6)) * (1 - smooth(clamp01((f - (T_FLICK + 12)) / 10)));
  if (down <= 0) return rest;
  const fl = (on: number) => Math.max(0, Math.sin(Math.PI * clamp01((f - on) / 4)));
  return rest.lerp(HIP.clone().lerp(FLICK_OUT, Math.max(fl(T_FLICK), fl(T_FLICK + 5))), down);
};
/** absorbed on the page all through (his eyes never leave it); flat and dismissive for "No time." (deadpan: level
 *  brows), the swaps under blinks */
const R_EXPR: [number, "focus" | "deadpan"][] = [[S.from, "focus"], [L7.from - 3, "deadpan"], [L7.to + 6, "focus"]];

// ---------------------------------------------------------------------------------------------------- the shot
const mouthOf = (r: Rig) => r.headWorld().add(V(0, -0.1, 0));
/** the film's light focus (amount 3) on a world point (his mouth) */
const lightFocus = (cam: CamPose, p: THREE.Vector3, amount = 3) => ({ focus: Math.max(0.2, posOf(cam).distanceTo(p)), amount });

const putRoomThings = (w: World, f: number) => {
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, t: f / FPS });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(SHEET_AT, { n: 1, rot: SHEET_ROT });
};

const posePlate = (w: World, f: number): Pose => {
  w.setPlace("room");
  w.set.param("hour", "noon");
  const Wp = plateWhip(f);
  const cam = C.nudge(Wp.cam, { up: breath(f, 0.35) });
  w.setCamera(cam);
  putRoomThings(w, f);
  const ch = chairPut(S.from);
  w.prop("chair").put(ch.at, { rot: ch.rot });
  w.update();
  const post = Wp.post ?? { dof: { focus: posOf(cam).distanceTo(PLATE_TOP), amount: 4 } };
  return { camera: cam, post, overlays: Wp.smear > 0 ? C.whipSmear(Wp.smear, -1) : undefined, slate: "C plate" };
};

const poseGarden = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("garden");
  w.set.param("time", "noon");
  w.set.param("gravel", "rough");      // the rough raked gravel (sets/garden.ts option, WP5-C): never cream planks
  const Wh = whipUp(gardenCam(f), f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  const s = gardenNewton(f);
  const n = w.actor(NEWTON_GOWN_INK);
  const q = f < T_STOP ? saying("nt", f) : null, sp = q ? ntSpeak(q, f, 1) : {};
  const frozen = f >= T_STOP && f < T_TURN0 + 2;
  const turnBack = ky(f, [[T_TURN0, 0], [T_TURN1, 1]]);
  const gl = gardenLook(f);
  n.set({
    at: s.at, facing: s.facing, pose: s.pose, expr: at(f, G_EXPR), ...sp,
    // STOP: the mouth frozen open on "is", no blink until the double blink that ends it
    ...(frozen ? { mouth: "half" as const } : {}),
    blink: f >= T_STOP && f < T_TURN1 ? freezeBlink(f) : sp.blink ?? lid(t, 1, swaps(G_EXPR)),
    head: frozen ? gl.head : heads(sp.head, gl.head), lookDown: gl.lookDown,
    gaze: gl.gaze, turn: turnBack > 0 ? turnBack : undefined,
    hands: gardenHands(f, s), hide: NEWTON_HIDE, visible: true,
  });
  w.update();
  // the focus: on the dial for the match, pulled onto him from 您; then the light focus on his mouth
  const dialD = posOf(cam).distanceTo(DIAL_AT), mouthD = posOf(cam).distanceTo(mouthOf(n));
  const pk = smooth(clamp01((f - T_PULL0) / (T_PULL1 - T_PULL0)));
  const post = Wh.post ?? { dof: { focus: Math.max(0.2, lerp(dialD, mouthD, pk)), amount: lerp(4, 3, pk) } };
  return { camera: cam, post, slate: f < T_STOP ? "C walk" : "C run" };
};

const poseRoom = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "noon");
  w.set.param("shaftSoft", 1);         // the noon sun shaft as a soft volume (owner rule: no hard-edged wedge; WP5-B's param)
  const Wh = whipUp(gardenCam(f), f, T_WHIP, { to: roomCam(f), out: WHIP_OUT, in: WHIP_IN, deg: 44, inDeg: 30, yaw: -4 });
  const cam = Wh.cam;
  w.setCamera(cam);

  // NEWTON: bent over the desk, writing standing; the flick; "No time."; his weight back on the shove
  const n = w.actor(NEWTON_GOWN_INK);
  const q = saying("nt", f), sp = q ? ntSpeak(q, f, 1) : {};
  n.set({
    at: N_AT.clone().addScaledVector(N_BACK, 0.05 * shoveK(f)), facing: N_LEGS, pose: leanPose(f), expr: at(f, R_EXPR), blink: lid(t, 1, swaps(R_EXPR)), ...sp,
    head: heads(sp.head, accent("shake", f, L7.from + 4, { amp: 0.3 })),
    lookDown: LOOK_DOWN, gaze: 0, hands: [quillHand(f), leftHand(f)], hide: NEWTON_HIDE_WRITING, visible: true,
  });
  putRoomThings(w, f);
  const ch = chairPut(f);
  w.prop("chair").put(ch.at, { rot: ch.rot });
  w.update();
  w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT_C4 });

  const post = Wh.post ?? { dof: lightFocus(cam, mouthOf(n)) };
  return { camera: cam, post, slate: f < T_SKID ? "C room" : "C chair" };
};

const pose = (w: World, f: number): Pose => (f < T_MATCH ? posePlate(w, f) : f < T_CUT ? poseGarden(w, f) : poseRoom(w, f));

export const SEG: Segment = { id: "C", from: S.from, to: S.to, enter() {}, exit() {}, pose };
