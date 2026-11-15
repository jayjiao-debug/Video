// SEGMENT A · 清晨 05:00 · his door, A02-A06 + card 1 (script v5's A rows; camera plan A.md with its director notes, on
// the v5 voice; rebuilt 15 Nov). ONE TAKE in her eyes (she is never seen: no mic, no hand), her eye 1.5 m (segA_parts
// EYE_A), a breathing bob at rest. No cut: the scene leaves on clock join ① (f701, B's first frame) from a dead-still door.
// Every frame is a lookup (BEAT.A, line(), capWord(), whisperSpan(), TITLE_SPAN), every mark from layout/stairs.ts.
//
// THE TAKE (moves are numbered; everything else is a HOLD)
//   M0 WALK UP 0 .. ARRIVE   THE INTRO (the owner, 15 Nov: "motion of interviewer walking and just making it to the door,
//                            saying finally arrived, then proceeds to knock"). Frame 0: she is already hurrying up the
//                            last two steps of the flight, his door ahead in the right wall, ajar, the candlelight in its
//                            gap the thing she walks at (walkCam: her way W_PATH, a foot down on each of BEAT.A.walkSteps,
//                            the walking bob, slowing); she rounds onto the landing, the gap opens on him writing, and
//                            she stops in the cold open's place with a small overshoot (BEAT.A.arrive), a little out of
//                            breath (hurryBreath). No cut: the walk lands on the gap framing below
//   cold open  ARRIVE .. GOOD   THROUGH THE DOOR GAP (v5 row 1): she says 「终于到了！」 (A01a, BEAT.A.finally) as she
//                            settles; his door ajar, its leaf and the near jamb the foreground on
//                            both sides; through the gap NEWTON writes STANDING at the table end of his room, bent over
//                            the page, three-quarter side-on, about the middle, the candle stub at his elbow, Humphrey
//                            by the front wall behind his master's back with the empty ink bottle (v5 has him in the far
//                            corner: that corner is on her line past Newton's head), TURNED AWAY from her and busy with
//                            the bottle, his face never toward the lens (gate 5 r2, A1: H_BUSY); he darts off toward the
//                            door on the first rap, out of his master's way. HOLD. His STOP 1/5 (BEAT.A.stop): he and
//                            the quill freeze, the eyes slide to the side, chin up, no blink, no sway; a double blink and
//                            a fast burst. The invisible hand raps twice (BEAT.A.knock, knock2): the frame nods forward a
//                            hair on each (rapPush), the leaf shivers, and THE KNOCK MARK pops on the leaf where the hand
//                            lands (skin A's item "knock", hud/ms/knock.tsx: knockAt below gives it the point on the
//                            leaf, frame by frame); on the hinge's creak (doorOpen) it swings wider. 「早上好！」 (A01b).
//                            He finishes the stroke (14 f: a person), puts the quill behind his ear as he turns and walks
//                            to his door in THREE STRIDES, a foot landing on each of the mix's steps (BEAT.A.steps;
//                            gate 5 r2, A2: the walk's phase keyed, nPhase), in it by doorOpen[1]: he walks into a
//                            still frame toward the lens (the door does the reveal, not the lens)
//   M1 SNAP    SNAP0 .. GOOD  "Good night." (LOOK 1/4: eyes open, on the lens): the lens angle drops 26 % (52 to 38.7 deg) in 5 f to
//                            the scene's one EXTREME CLOSE, landing on A02's first sound (BEAT.A.goodNight); held through
//                            "night" and while he takes the door's edge
//   M2 PULL    PULL0 .. THUD  he swings the door shut on her: she pulls back (and the lens opens) with the door swinging
//                            at her, landing square on the shut door ON THE THUD (BEAT.A.doorShut), plus THE ONE JOLT
//   hold       THUD .. A03    the wide of the shut door, no face in frame: the TITLE writes on it (skin A, TITLE_SPAN)
//   M3 whisper A03            悄悄说 「他这是……刚要睡？」: whisperLean on his door (a step in, 3 deg tip); the line of
//                            candlelight under the door goes out on 睡 (BEAT.A.glowOut); the lean releases on the latch
//   M4 FOLLOW  FOL0 .. FOL1   Humphrey slips out yawning (BEAT.A.humphreyOut, the latch), draws the door to (the click,
//                            BEAT.A.humphreyShuts) and dawdles to the stair head: she sidesteps by the window and pans
//                            with him, landing as he stops: Humphrey whole at the stair head (his head right of centre),
//                            a clear 360 x 270 px beside his head for his banner (hud/ms/fit_A.ts); the lens widens a
//                            little while he passes nearest her (1.2 m) so his size holds and he stays whole
//   hold       A04            「助手小哥，他平时笑吗？」 (she asks from where she stands); he listens, eyes on the shut door
//   M5 SNAP    LAUGH - 5 .. LAUGH   "Laugh?" (his one look at her, the shock and the head pop): the lens angle drops 26 % (64 to 47 deg) in
//                            5 f to a close (his head a little left of the middle, the flight on his right), landing on
//                            A05's first sound (BEAT.A.laugh); held through the glance at the
//                            door ("Mr"), back ("Newton") and the slow head shake
//   M6 PAN     PAN0 .. MISSION   he backs a step down the stairs (BEAT.A.humphreyDown) and turns to go on down: she swings
//                            back to Newton's door as he turns away (brisk off him, settling slowly), landing on
//                            好 (BEAT.A.mission) with the A06 whisper lean (悄悄说, the mission said to the door he is
//                            behind); the bed creaks and one snore behind it (sound only); the lean releases
//   hold       card 1 .. end  card 1 mid-left over the shut door; the frame DEAD STILL from the lean's return to the cut
//                            (the REC clock races 663-701 over it: clock join ①)
import * as THREE from "three";
import { SEGMENTS, FPS, capWord, quote, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, easeInOutQuad, type Segment, type CamPose } from "../story";
import { BEAT, TITLE_SPAN } from "../beats";
import * as C from "../cam";
import { NEWTON_INK, NEWTON_HIDE, NEWTON_HIDE_WRITING, NEWTON_LEAN, HUMPHREY, N_EYE, H_EYE } from "../people";
import { STAIRS, STAIRS_SET, FOV } from "../layout";
import { QUILL } from "../props";
import { whisperLean, whisperSpan } from "../whisper";
import type { World } from "../world";
import { V, rel, hang, lid, speak, accent, heads, headPop, walkAlong, yawTo, lerpA, wrapA, rigWalk, type RigState, type RigPose } from "./common";
import { EYE_A, rapPush, shiver, jolt, breath, stepDip, nibAt, lightFocus, keyed, bendPath, walkBob, hurryBreath } from "./segA_parts";

type St = Partial<RigState>;
const S = SEGMENTS[0], BA = BEAT.A;
const sec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;

// ------------------------------------------------------------------------------------------------------- the beats
const WSTEPS = BA.walkSteps;                            // THE INTRO: her four footfalls up to his door (the last = her stop)
const ARRIVE = BA.arrive;                               // she stands still in the cold open's place from here
const STOP0 = BA.stop[0], STOP1 = BA.stop[1];          // his STOP 1/5: frozen STOP0..STOP1
const BURST1 = BA.burst[1];                             // the fast burst after it, to here
const RAPS = [BA.knock, BA.knock2];                     // the invisible hand's two raps
const OPEN0 = BA.doorOpen[0], OPEN1 = OPEN0 + sec(0.8); // the hinge creaks: the leaf swings wider
const N_TURN0 = BA.knock + 14;                          // 14 f after the knock (a person): the stroke finished, he turns
const N_EAR = N_TURN0 + 6;                              // the quill behind his ear
const H_BACK0 = BA.knock;                               // Humphrey scurries off toward the door on the first rap
const N_WALK0 = N_TURN0 + 3, N_WALK1 = BA.doorOpen[1];  // to his door: there on doorOpen[1] (his last step BA.steps[2])
const GOOD = BA.goodNight;                              // "Good night.": the snap lands on A02's first sound
const SNAP0 = GOOD - 5;
const N_LOOK = GOOD - 5;                                // LOOK 1/4: his eyes open and come to the lens
const THUD = BA.doorShut;                               // THE THUD: the door is shut on this frame
const SHUT0 = BA.doorSwing - 8;                         // the leaf starts to swing (the air on doorSwing)
const N_REACH = SHUT0 - 9;                              // his hand goes to the door's edge
const PULL0 = SHUT0 - 1;                                // M2 starts with the swing
const TITLE1 = TITLE_SPAN[1];
const A03 = whisperSpan("A03"), A06 = whisperSpan("A06");
const LATCH = BA.humphreyOut, CLICK = BA.humphreyShuts; // Humphrey's door: the latch; the click as he draws it shut
const H_OUT0 = LATCH + 5;                               // he slips out, yawning, once the leaf has swung past him
const H_PULL0 = CLICK - 9;                              // his left hand draws the door to
const H_YAWN1 = LATCH + sec(1.0);                       // the yawn ends (YAWN 1/2: about 1 s)
const H_TURN2_Q = BA.micHumphrey;                       // she asks (A04 - 6): he turns back toward the shut door as he arrives
const H_REACT = word("A04", "笑") + 4;                  // he reacts 4 f after 笑
const LAUGH = BA.laugh;                                 // "Laugh?": his one look at her; the snap lands on A05's first sound
const H_MR = word("A05", "Mr"), H_NW = word("A05", "Newton");
const H_SHAKE = BA.headShake;                           // the slow head shake
const H_DOWN = BA.humphreyDown;                         // he goes down the stairs, backing down the first steps ..
const H_TURN3 = H_DOWN + 12;                            // .. a step, and turns to go on down (his back to her)
const MISSION = BA.mission;                             // 好: the pan back lands with the A06 lean
const PAN0 = H_TURN3 - 2;                               // she lets him go as he turns away, and swings back ..
const STILL0 = A06.to;                                  // dead still from the A06 lean's return to the cut (clock join ①)
const GLOW_OUT = BA.glowOut;

/** a brisk move: up to speed in its first quarter, then easing out over the rest (a triangle of speed). Humphrey's dart
 *  off on the knock; M6, her swing back to the door as he turns away (settling slowly onto it for 好) */
const swing = (t: number) => (t < 0.25 ? (t * t) / 0.25 : 1 - ((1 - t) * (1 - t)) / 0.75);

// ------------------------------------------------------------------------------------------------------- the marks
const STX = STAIRS.landing.x + 0.15;                    // the island's x (layout/stairs.ts STX)
const D = STAIRS_SET.door, ST = STAIRS_SET.steps;
/** the leaf's pivot (sets/stairs.ts puts the leaf at the hinge + 2 cm) */
const PIVOT = V(STAIRS.hinge.x + 0.02, 0, STAIRS.hinge.z);
/** a point on the leaf at door param `door`: `along` m from the pivot toward the free edge, `face` m toward the landing
 *  (at door 0; negative = his room's side), y up */
const leafPt = (door: number, along: number, y: number, face: number) => {
  const a = clamp01(door) * D.swing;
  return V(PIVOT.x + along * Math.sin(a) - face * Math.cos(a), y, PIVOT.z + along * Math.cos(a) + face * Math.sin(a));
};
/** the door's params: ajar a forearm's width at the cold open, wider once the knock has swung it, held open while he
 *  stands in it */
const AJAR = 0.58, OPEN = 0.68;
/** HIS ROOM behind the door (sets/stairs.ts: the table heaped with paper at the far end, its top 0.75 m, x 3.25-3.95,
 *  z -1.0..0.2 off STX; the paper stacks end at z -0.02): THE PAGE he writes on lies across the table's free end (its
 *  long side across in front of him), the candle stub on the table's corner at his left elbow */
const TABLE_TOP = 0.75;
const PAGE = V(STX + 3.64, TABLE_TOP + 0.004, 0.06);
/** HER EYES: the cold open's place by the door (the knock's arm's reach, the gap looking into the room's front corner),
 *  the title's place square on to the door (the approved title's framing: the old P_HOLD, at her 1.5 m eye), the sidestep
 *  by the window for Humphrey (the camera plan's P_STEP, 0.2 m off both walls) */
const P_GAP = V(STX + 0.1, EYE_A, -0.62);
const P_DOOR = V(STX - 0.68, EYE_A, STAIRS.door.z + 0.06);
const P_STEP = V(STX - 0.75, EYE_A, STAIRS.door.z - 0.36);
/** THE INTRO, HER WAY UP (floor points): from the flight's second step down, on its left by the rail (W_FROM: where she
 *  is two strides before the film's first frame; on frame 0 she is on the last step under the landing; from that side
 *  his door, in the right wall, shows nearly whole and the gap's candlelight comes into sight past the near jamb within
 *  her first stride), up over the stair head and across the landing, bending right
 *  round W_BEND into the cold open's place P_GAP in front of his door's gap (0.3 m and more off every wall) */
const W_FROM = V(STX - 0.62, 0, STAIRS.stairHead.z + 0.57), W_BEND = V(STX - 0.3, 0, -0.1);
const W_PATH = bendPath(W_FROM, W_BEND, P_GAP);
/** the floor under her on the flight (her eye rides the flight's slope up to the landing, the kink at the stair head
 *  eased over about 6 cm): metres under the landing at floor point z */
const W_HEAD_Z = STAIRS.stairHead.z - 0.05;
const flightY = (z: number) => -(ST.rise / ST.go) * 0.5 * (Math.hypot(z - W_HEAD_Z, 0.06) + (z - W_HEAD_Z));
/** NEWTON at the table: three-quarter to her lens (about 55 deg off it), the page 0.34 m in front of him; at his door
 *  (1.6 m from her lens, just inside his room, clear of the leaf's sweep, its inner ring in his right hand's reach),
 *  facing her; his way there goes round the table's corner.
 *  9:16 (15 Nov): his door mark is 4 cm further toward the doorway's middle (z -0.16; it was -0.12): standing in his
 *  door in the held gap framing (f118-133) his jaw crossed the top corner of the app's button column (x >= 890 from
 *  y 1000; 9:15's x 940 / y 950 cleared it), and 4 cm puts his face 47 px left (clear). The gap framing is unchanged;
 *  M1's extreme close is aimed by his face's screen point, so it lands with his face where and as big as before (the
 *  room behind him 1.4 deg over) */
const F_DESK = yawTo(PAGE, P_GAP) - (58 * Math.PI) / 180;
const N_DESK = PAGE.clone().add(V(-0.34 * Math.sin(F_DESK), 0, -0.34 * Math.cos(F_DESK))).setY(0);
const N_MID = V(STX + 3.05, 0, 0.42);
const N_DOOR = V(STX + 1.7, 0, -0.16);
const F_DOOR = yawTo(N_DOOR, P_GAP);
const N_PATH = [N_DESK, N_MID, N_DOOR], N_LEN = N_DESK.distanceTo(N_MID) + N_MID.distanceTo(N_DOOR);
const CANDLE_AT = V(STX + 3.4, TABLE_TOP, 0.12);
/** HUMPHREY: by the front wall behind his master's back with the empty ink bottle (the cold open: he would be in the
 *  far corner, but the corner is on her line through Newton's head and the locks of Newton's hair reach it); behind
 *  his door (out of the leaf's sweep) at the latch; round the leaf, through the doorway, along the wall to the stair
 *  head; fast out of the door, dawdling on */
const H_CORNER = V(STX + 3.36, 0, 0.74);
/** GATE 5 r2 (director A1): through the cold open he must not steal the frame. No place in the room makes his head 65 %
 *  of Newton's (measured: the deepest corner the gap shows is 4.1 m from her lens against Newton's head at 3.6 m, 0.82 at
 *  best, and every deep spot puts him behind Newton's head), so he keeps this spot and turns AWAY: his true facing 52 deg
 *  off her lens toward the jamb side (away from his master), busy with the empty bottle at his chest, lids lowered on
 *  it: his face is a profile at the edge of his head, never toward the lens (his one look at her stays A05 "Laugh?").
 *  A true three-quarter back (135 deg) was tried: this rig fades the face out past about 72 deg off the camera, so his
 *  back reads as a blank white face looking at us (r2/try/A1_try135deg_backview_f0_52_68_71.png). The rig is told to
 *  keep his true facing (RigState.turn 1) until the knock, so it does not turn him to the camera */
const H_BUSY = yawTo(H_CORNER, P_GAP) + (52 * Math.PI) / 180;
/** his hands on the bottle in the corner (his frame: x his left, z ahead): at his chest in front of him (his front is
 *  half toward her, so the bottle shows against his coat), turning it slowly in his fingers (1 cm, about 0.6 Hz) */
const busyHand = (at: THREE.Vector3, facing: number, arm: 0 | 1, f: number) => {
  const w = (2 * Math.PI * 0.6 * f) / FPS, x = -0.02 + (arm ? 0.05 : -0.05);
  return rel(at, facing, x + 0.01 * Math.sin(w + arm * 1.4), 0.82 + 0.008 * Math.sin(w * 0.5 + 0.7), 0.21 + 0.01 * Math.cos(w + arm * 1.4));
};
/** .. and on the knock he scurries off along the front wall toward the door, out of his master's way, behind the near
 *  jamb (out of her view) by the time Newton sets off: so he is by the door, inside, when he slips out at the latch */
const H_HIDE = V(STX + 2.0, 0, 0.7);
const H_SCURRY = 13;
/** the dart's turn from the bottle to the door: a startle, fast at first (37 deg in 5 frames, half of it in the first:
 *  his face comes round before his head reaches the frame's edge; the build's turn was 52 deg in the same 5 frames) */
const H_WHIRL = 5;
const whirl = (f: number) => easeOutCubic(clamp01((f - H_BACK0) / H_WHIRL));
//   (the leaf opens inward on its far hinge: he waits on the open side of it, 1.17 m from the pivot so the opening leaf
//   clears him, comes round the leaf through the middle of the doorway, 0.33 m off the near jamb and the leaf, steps out
//   onto the landing 0.25 m off the wall and goes along it to the stair head)
const H_IN = V(STX + 1.4, 0, 0.05);
const H_IN2 = V(STX + 1.3, 0, -0.35);
const H_GAP = V(STX + 0.95, 0, -0.45);
const H_OUT = V(STX + 0.44, 0, -0.33);
const H_TOP = V(STX + 0.32, 0, 0.32);
const H_PATH = [H_IN, H_IN2, H_GAP, H_OUT, H_TOP], H_FAST = 2.1, H_SLOW = 0.9;
const H_L1 = H_IN.distanceTo(H_IN2) + H_IN2.distanceTo(H_GAP) + H_GAP.distanceTo(H_OUT), H_L = H_L1 + H_OUT.distanceTo(H_TOP);
/** how wide he opens the door to slip out (he draws it to behind him by the click) */
const H_DOOR = 0.65;
const H_ARRIVE = H_OUT0 + Math.round((H_L1 / H_FAST + (H_L - H_L1) / H_SLOW) * FPS);
const H_TURN2 = Math.max(H_TURN2_Q, H_ARRIVE - 3);
/** where both his hands clutch the bottle from her question on */
const CLUTCH = { x: 0.07, w: 0.1, y: 0.79, z: 0.24 };
/** his way down the right of the flight: tread k at y -k * rise */
const H_STEPS = [H_TOP, V(H_TOP.x - 0.03, 0, STAIRS.step(1).z), V(H_TOP.x - 0.05, 0, STAIRS.step(4).z), V(H_TOP.x - 0.07, 0, STAIRS.step(9).z)];
const stairY = (z: number) => -ST.rise * Math.max(0, Math.min(ST.n, (z - STAIRS.stairHead.z - 0.05) / ST.go + 0.35));
const H_BACKV = 0.55, H_DOWNV = 1.35;

// ------------------------------------------------------------------------------------------------------ the people
/** NEWTON's WALK TO HIS DOOR (gate 5 r2, director A2): THREE STRIDES ON THE MIX'S THREE STEPS (BEAT.A.steps: f92,
 *  f105, f118, bare boards). The rig's walk phase is KEYED, not taken from the distance: his right foot lands at phase 0
 *  (f92) and 1 (f118), his left at 0.5 (f105); his first foot lifts as he sets off (N_WALK0, phase -0.4: the start of its
 *  swing) and the trailing foot closes beside the last by CLOSE (phase 1.5), so he is in his door, both feet down, by
 *  N_WALK1 (f123: never stopped mid-stride). The stride (half a step, rig3d's longest is 0.3 m) opens from 6 cm as he
 *  turns from the page and closes to 5 cm for the closing step. His body's way along the path is a monotone curve
 *  through keys at the three plants (from rest at N_WALK0 to rest at N_WALK1). Three planted steps of the rig cover
 *  0.5 m each, his way round the table is 2.17 m, so the feet must slide somewhat: the keys put that slide in the turn
 *  away from the page (a pivot) and in the last stride, where his feet have left the bottom of the frame (measured in
 *  rebuild/A/NOTES.md, gate 5 r2) */
const WALK_STEPS = BA.steps;
const CLOSE = N_WALK1 - 1;
const PH_KEYS: [number, number][] = [[N_WALK0, -0.4], [WALK_STEPS[0], 0], [WALK_STEPS[1], 0.5], [WALK_STEPS[2], 1], [CLOSE, 1.5]];
const STRIDE_KEYS: [number, number][] = [[N_WALK0, 0.06], [N_WALK0 + 7, 0.3], [WALK_STEPS[2] - 8, 0.3], [WALK_STEPS[2], 0.14], [CLOSE, 0.05]];
/** his way along the path at the plants (m): 0.38 by the first (the turn from the page: his standing foot pivots), 1.02
 *  by the second (the first stride nearly planted), 2.03 by the third (the long stride, its slide below the frame's
 *  text strip), the last 0.14 m slowing into his door (head speed 4, 3, 2.7, 2.5, 1.8 cm a frame over f118-122) */
const D_KEYS: [number, number][] = [[N_WALK0, 0], [WALK_STEPS[0], 0.38], [WALK_STEPS[1], 1.02], [WALK_STEPS[2], 2.03], [N_WALK1, N_LEN]];
/** metres along N_PATH on frame f */
const nDist = (f: number) => keyed(f, D_KEYS);
/** the walk's phase and stride on frame f */
const nPhase = (f: number) => keyed(f, PH_KEYS, true);
const nStride = (f: number) => keyed(f, STRIDE_KEYS);
/** the walk opens over 6 frames and closes over the last 10 (the head stays on its path when walk and idle hand over:
 *  the walk pose leans the body 4 deg, so the feet are set N_LEAN behind the head's path while it is closed) */
const N_LEAN = 0.05;
const walkOpen = (f: number) => smooth(clamp01((f - N_WALK0) / 6)) * (1 - smooth(clamp01((f - (N_WALK1 - 10)) / 10)));
/** his idle's own time (s) on "Good night." (cut v5: frame 138, less the stop's 15 frames, at 30 fps, + 0.4) */
const N_IDLE_GOOD = 4.5;
/** NEWTON on frame f: at the table, turning, walking, in his door */
const newtonStage = (f: number): { at: THREE.Vector3; facing: number; pose: RigPose } => {
  // the idle's own time stands still through the STOP (sway 0). 15 Nov (the intro): it is counted from "Good night."
  // (N_IDLE_GOOD s there, as in the approved cut v5), not from the film's first frame, so a longer or shorter intro does
  // not shift his sway: standing in his door he sways exactly as approved (his jaw clear of the app's button column,
  // the 9:16 fit above; with the sway 42 frames out of step it brushed the column's corner on f165-186: faces, low)
  const it = ((f < STOP0 ? f : f <= STOP1 ? STOP0 : f - (STOP1 - STOP0 + 1)) - (GOOD - (STOP1 - STOP0 + 1))) / FPS + N_IDLE_GOOD;
  const idle: RigPose = { kind: "idle", t: it };
  // his heading along the two legs (round the table's corner), the corner taken over half a metre
  const y1 = yawTo(N_DESK, N_MID), y2 = yawTo(N_MID, N_DOOR), L1 = N_DESK.distanceTo(N_MID);
  const heading = (d: number) => lerpA(y1, y2, smooth((d - (L1 - 0.25)) / 0.5));
  const turn = smooth((f - N_TURN0) / 9), arrive = smooth((f - N_WALK1 + 10) / 12);
  if (f < N_WALK0) return { at: N_DESK.clone(), facing: lerpA(F_DESK, y1, turn), pose: idle };
  if (f >= N_WALK1) return { at: N_DOOR.clone(), facing: lerpA(y2, F_DOOR, arrive), pose: idle };
  const d = nDist(f), L = walkAlong(N_PATH, 1, d), open = walkOpen(f);
  const facing = lerpA(lerpA(F_DESK, heading(d), turn), F_DOOR, arrive);
  const at = L.at.clone().addScaledVector(V(Math.sin(facing), 0, Math.cos(facing)), -N_LEAN * (1 - open));
  const ph = nPhase(f);
  return { at, facing, pose: { kind: "walk", phase: ((ph % 1) + 1) % 1, stride: nStride(f), amount: 0.75 * open } };
};
/** the quill's direction from the nib up the feather, in his frame (x his left, z away from him): toward his right
 *  shoulder, a little back (segB's QDIR), turned to the world by his facing */
const QLOCAL = V(-0.36, 0.84, -0.4).normalize();
const toWorld = (v: THREE.Vector3, facing: number) => V(Math.cos(facing) * v.x + Math.sin(facing) * v.z, v.y, -Math.sin(facing) * v.x + Math.cos(facing) * v.z);
const QDIR = toWorld(QLOCAL, F_DESK);
const QROT = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), QDIR);
/** the nib's time: frozen through the STOP (the quill in the air), the burst after it 1.6 x as fast */
const nibT = (f: number) => {
  const a = STOP0 / FPS;
  if (f < STOP0) return f / FPS;
  if (f <= STOP1) return a;
  if (f <= BURST1) return a + (1.6 * (f - STOP1)) / FPS;
  return a + (1.6 * (BURST1 - STOP1) + (f - BURST1)) / FPS;
};
/** the nib on the page on frame f (world); the quill lifts 3 cm off it for the STOP */
const nibWorld = (f: number) => {
  const n = nibAt(nibT(f));
  const lift = f >= STOP0 - 2 && f <= STOP1 + 2 ? 0.03 * smooth((f - STOP0 + 2) / 3) * (1 - smooth((f - STOP1) / 3)) : 0;
  return rel(PAGE, F_DESK, n.x, n.y + lift, n.z);
};
const quillHand = (f: number) => nibWorld(f).addScaledVector(QDIR, -QUILL.nib);
const leftHand = (f: number) => rel(PAGE, F_DESK, 0.15 + 0.004 * Math.sin(f * 0.031), 0.06, 0.01);
/** the double blink after the STOP (two 3-frame blinks) and none through it */
const stopBlink = (f: number, base: number) => {
  if (f >= STOP0 && f <= STOP1) return 0;
  const d = f - STOP1 - 1;
  if (d >= 0 && d < 3) return d === 1 ? 1 : 0.6;
  if (d >= 4 && d < 7) return d === 5 ? 1 : 0.6;
  return base;
};
/** a walk backwards (the steps run the other way) */
const backWalk = (d: number, speed: number): RigPose => { const p = rigWalk(d, speed); return { ...p, phase: 1 - (p.phase ?? 0) }; };
/** HUMPHREY on frame f: the corner, out of the door, the pull, the stair head, down the stairs */
const humphreyStage = (f: number): { at: THREE.Vector3; facing: number; pose: RigPose } => {
  const idle = (t: number): RigPose => ({ kind: "idle", t: t + 1.3 });
  const camYaw = (p: THREE.Vector3) => yawTo(p, P_STEP);
  const doorYaw = yawTo(H_TOP, V(STAIRS.door.x, 0, STAIRS.door.z));
  if (f < LATCH) {
    const k = swing(clamp01((f - H_BACK0) / H_SCURRY)), dd = k * H_CORNER.distanceTo(H_HIDE), at = H_CORNER.clone().lerp(H_HIDE, k);
    const fc = lerpA(H_BUSY, yawTo(H_CORNER, H_HIDE), whirl(f));
    // (gate 5 r2: from the busy stance turned away from her, the rap's first frame is the whirl alone; the scurry's walk
    // starts on the next, its bounce coming in over 3 frames)
    return { at, facing: fc, pose: f > H_BACK0 + 1 && k < 1 ? rigWalk(dd, 1.5, smooth((f - H_BACK0 - 1) / 3)) : idle(f / FPS) };
  }
  if (f < H_DOWN) {
    const t = Math.max(0, (f - H_OUT0) / FPS), t1 = H_L1 / H_FAST;
    const dAt = (t: number) => (t < t1 ? H_FAST * t : Math.min(H_L, H_L1 + H_SLOW * (t - t1)));
    const d = dAt(t), L = walkAlong(H_PATH, 1, d);
    const arrived = d >= H_L - 1e-6;
    // his heading eases round the path's corners (the way from 0.15 m behind to 0.15 m ahead)
    const a = walkAlong(H_PATH, 1, Math.max(0, d - 0.15)).at, b = walkAlong(H_PATH, 1, Math.min(H_L, d + 0.15)).at;
    const head = b.distanceTo(a) > 0.05 ? yawTo(a, b) : yawTo(walkAlong(H_PATH, 1, H_L - 0.3).at, H_TOP);
    // at the stair head he turns back toward the shut door (her question), a little toward her so his face reads; on
    // "Laugh?" he turns to her lens
    const listen = lerpA(doorYaw, camYaw(H_TOP), 0.45);
    let facing = f < H_TURN2 ? head : lerpA(head, listen, smooth((f - H_TURN2) / 9));
    if (f >= LAUGH - 3) facing = lerpA(facing, camYaw(H_TOP), smooth((f - LAUGH + 3) / 5));
    return { at: L.at, facing, pose: arrived ? idle((f - H_ARRIVE) / FPS) : rigWalk(d, d < H_L1 ? H_FAST : H_SLOW) };
  }
  // backing down facing her (the walk run backwards), then round and on down
  const tB = (Math.min(f, H_TURN3) - H_DOWN) / FPS, d = H_BACKV * tB + (f > H_TURN3 ? (H_DOWNV * (f - H_TURN3)) / FPS : 0);
  const L = walkAlong(H_STEPS, 1, d), at = L.at.clone();
  at.y = stairY(at.z);
  if (f <= H_TURN3) return { at, facing: camYaw(at), pose: d > 0 ? backWalk(d, H_BACKV) : idle(0) };
  return { at, facing: lerpA(camYaw(at), L.facing, smooth((f - H_TURN3) / 6)), pose: rigWalk(d, H_DOWNV) };
};
/** Humphrey's eyes over his floor path (the camera's follow target: averaged over the frames round f, no walk bounce) */
const hmEyeAvg = (f: number, half = 5) => {
  const p = V(); let ws = 0;
  for (let i = -half; i <= half; i++) { const w = half + 1 - Math.abs(i), q = humphreyStage(f + i).at; p.add(q.clone().setY(q.y + H_EYE).multiplyScalar(w)); ws += w; }
  return p.divideScalar(ws);
};

// ------------------------------------------------------------------------------------------------------ her camera
/** the framings (each aimed by its subject's screen point: cam.ts aimCam):
 *    GAP     the cold open: his head at the table (bent over the page) right of the middle, a little above the
 *            middle; the leaf left, the jamb right; FOV_GAP so he is over 40 % of the frame's height
 *    XC      M1's extreme close: his face at his door, eyes about 40 % down
 *    DOOR    the title's framing (the approved title was fitted to it: hud/ms/title.tsx REF_DOOR)
 *    HUM     Humphrey whole at the stair head, his head right of centre, the banner's room to its left
 *    LAUGH   M5's close of Humphrey
 *    DOOR2   A06 and card 1: his door, oblique, from the window corner */
const FOV_GAP = 52, XC_K = 0.72, FOV_H = 64, LAUGH_K = 0.70;
/** the Laugh close's head x: left of the middle, the room on his right for where he goes (down the stairs, screen right) */
const LAUGH_SX = 500;
const N_HEAD_DESK = rel(N_DESK, F_DESK, 0, 1.04, 0.22);
const N_FACE_DOOR = N_DOOR.clone().setY(N_EYE + 0.02);
const DOOR_AT = V(STAIRS.door.x + 0.18, 1.14, STAIRS.door.z);
const DOOR2_AT = V(STAIRS.door.x - 0.03, 1.1, STAIRS.door.z);
const H_HEAD = H_TOP.clone().setY(H_EYE);
const GAP_CAM = C.aimCam(P_GAP, N_HEAD_DESK, 530, 760, FOV_GAP);
/** his face at his door as the gap framing shows it (M1 starts from there) */
const FACE0 = C.toScreen(GAP_CAM, N_FACE_DOOR);
/** M4: she turns to the door as its latch goes (someone is coming out) and follows Humphrey; her sidestep lands with
 *  him at the stair head (FOL1), the aim settles on his resting head over the next 6 frames (FOL2) */
const FOL0 = LATCH, FOL1 = H_ARRIVE, FOL2 = FOL1 + 6;
const LENS: C.LensKey[] = [
  // the cold open is ONE held frame (the gap framing, written as where his door mark sits in it, so the snap starts from
  // it); her walk up (walkCam, f < ARRIVE) lands on exactly this key
  { f: S.from, pos: P_GAP, at: N_FACE_DOOR, sx: FACE0.x, sy: FACE0.y, fov: FOV_GAP },
  { f: SNAP0, pos: P_GAP, at: N_FACE_DOOR, sx: FACE0.x, sy: FACE0.y, fov: FOV_GAP },
  { f: GOOD, pos: P_GAP, at: N_FACE_DOOR, sx: 520, sy: 760, fov: C.zoomBy(FOV_GAP, XC_K), ease: easeOutCubic },
  { f: PULL0, pos: P_GAP, at: N_FACE_DOOR, sx: 520, sy: 760, fov: C.zoomBy(FOV_GAP, XC_K) },
  { f: THUD, pos: P_DOOR, at: DOOR_AT, sx: 540, sy: 680, fov: FOV, ease: smooth },
  { f: FOL0, pos: P_DOOR, at: DOOR_AT, sx: 540, sy: 680, fov: FOV },
  { f: FOL2, pos: P_STEP, at: H_HEAD, sx: 700, sy: 620, fov: FOV_H },
  { f: LAUGH - 5, pos: P_STEP, at: H_HEAD, sx: 700, sy: 620, fov: FOV_H },
  { f: LAUGH, pos: P_STEP, at: H_HEAD, sx: LAUGH_SX, sy: 700, fov: C.zoomBy(FOV_H, LAUGH_K), ease: easeOutCubic },
  { f: PAN0, pos: P_STEP, at: H_HEAD, sx: LAUGH_SX, sy: 700, fov: C.zoomBy(FOV_H, LAUGH_K) },
  { f: MISSION, pos: P_STEP, at: DOOR2_AT, sx: 540, sy: 760, fov: FOV, ease: swing },
];
/** her sidestep's footfalls (the walking bob) */
const SIDESTEPS = [FOL0 + 6, FOL0 + 15, FOL0 + 24];
/** M4's camera (FOL0 < f < FOL2): her eye glides from the title's place to the sidestep (landing on FOL1) while the aim
 *  takes Humphrey over 7 frames (from where he already is in her frame, so the pan starts from rest) and glides his
 *  head to its A04 place (700, 620) */
const FOL_WIDE = 12;
/** 9:16 (15 Nov): THE LEAD THROUGH HIS CORNER. His banner's slip may not go left of x 110 now (9:15: x 66), so its right
 *  edge sits at x 505 at the least, while on f314-321 his cheek swung to x 484-513 (the follow aims at his path averaged
 *  over 7 frames, and that cuts the corner of his way out round the leaf, H_IN2 on f315): the follow leads him to the
 *  right by up to FOL_LEAD px over f306-326 (a sine-squared bump peaking on f316, 1.45 deg of pan at its top, gone 4
 *  frames before the gate-5 frame f330), so his cheek keeps 18 px or more clear of the slip's box (the live slip may
 *  stray 6 px from the track's: banner.tsx HOLD). Same follow, same landing (FOL1, FOL2); f330 on is unchanged */
const FOL_LEAD = 40;
const folLead = (f: number) => FOL_LEAD * Math.pow(Math.sin(Math.PI * clamp01((f - FOL0 - 2) / 20)), 2);
const followCam = (f: number): CamPose => {
  const u = smooth((f - FOL0) / (FOL1 - FOL0)), k = smooth((f - FOL0) / 7), v = smooth((f - FOL0 - 8) / (FOL1 - FOL0 - 8));
  // the lens widens while he passes nearest her (1.2 m: the corner of his way out), so he stays whole and his size
  // holds through the follow; it is back to FOV_H as he stops
  const near = Math.pow(Math.sin(Math.PI * clamp01((f - FOL0 - 6) / (FOL1 - FOL0 - 6))), 2);
  const pos = P_DOOR.clone().lerp(P_STEP, u), fov = C.zoomFov(FOV, FOV_H, u) + FOL_WIDE * near, him = hmEyeAvg(f, 3);
  const s0 = C.toScreen(C.aimCam(pos, DOOR_AT, 540, 680, fov), him);
  const tx = lerp(720, 700, v) + folLead(f), ty = lerp(700, 620, v);
  return C.aimCam(pos, him, lerp(s0.x, tx, k), lerp(s0.y, ty, k), fov);
};
/** M0, THE INTRO: HER WALK UP TO HIS DOOR (f < ARRIVE).
 *  HER WAY: metres still to go along W_PATH at each footfall (W_KEYS: a monotone curve through them, so she is at walking
 *  pace on frame 0, two strides already behind her: 0.83, 0.93, 0.70 m/s between the four footfalls as measured, the
 *  long stride the one off the top step onto the landing, the last one her slowing to the stop). Her last foot lands
 *  5 cm short (WSTEPS[3], her stop), her weight carries her 2.2 cm past the place (W_OVER) and she is back on it,
 *  still, on ARRIVE.
 *  HER EYE: EYE_A over the floor under her (the flight's slope up to the stair head: flightY), plus the walking bob
 *  (segA_parts walkBob: down on each footfall, the sway, the nod), dying out from her stop to ARRIVE.
 *  HER LOOK: at his door from the first frame: the leaf's free edge (W_GOAL, the bright line of the gap) held right of
 *  the middle (W_SX, W_SY) while she climbs; from her second footfall (she is on the landing) the look goes over, eased,
 *  to the cold open's own aim (his door mark at FACE0), so the gap opens on him writing as she rounds to it and the
 *  walk lands on LENS[0] without a step. THE LENS: the film's own angle (FOV) while she climbs (the whole door, the
 *  stair window's light beside it), closing to the gap framing's (FOV_GAP) with the same ease as her look: she closes in
 *  on the gap to peek, lens and feet arriving together. */
const W_STEP = WSTEPS[1] - WSTEPS[0];
const W_OVER = WSTEPS[3] + Math.round((ARRIVE - WSTEPS[3]) * 0.45);
const W_KEYS: [number, number][] = [[WSTEPS[0] - 2 * W_STEP, 1.88], [WSTEPS[0] - W_STEP, 1.52], [WSTEPS[0], 1.16], [WSTEPS[1], 0.8], [WSTEPS[2], 0.4], [WSTEPS[3], 0.05], [W_OVER, -0.022], [ARRIVE, 0]];
/** her eye on frame f of the walk (no bob) */
const walkEye = (f: number) => {
  const p = W_PATH.at(W_PATH.len - keyed(f, W_KEYS));
  return p.setY(EYE_A + flightY(p.z) - flightY(P_GAP.z));
};
const W_GOAL = leafPt(AJAR, D.z1 - D.z0 - 0.02, 1.3, 0);
const W_SX = 790, W_SY = 860, W_LOOK0 = WSTEPS[1];
const walkCam = (f: number): CamPose => {
  const k = smooth((f - W_LOOK0) / (ARRIVE - W_LOOK0));
  const cam = C.aimCam(walkEye(f), W_GOAL.clone().lerp(N_FACE_DOOR, k), lerp(W_SX, FACE0.x, k), lerp(W_SY, FACE0.y, k), C.zoomFov(FOV, FOV_GAP, k));
  // the stop: her weight tips the lens down a hair as her last foot lands and it comes back up as she settles
  const tip = -0.5 * Math.pow(Math.sin(Math.PI * clamp01((f - WSTEPS[3]) / (ARRIVE - WSTEPS[3]))), 2);
  const b = walkBob(f, WSTEPS, ARRIVE);
  return C.nudge(cam, { up: b.up, right: b.right, roll: b.roll, pitch: b.pitch + tip });
};
/** HER BREATH through the cold open: she hurried up the stairs (segA_parts hurryBreath: quicker and deeper, calming
 *  until the snap), coming in over the 8 frames after she stops; the resting breath (breath) from the title on */
const HURRY_T = (SNAP0 - 6 - ARRIVE) / FPS, BREATH_GOOD = 4.6;
const hurry = (f: number) => hurryBreath((f - ARRIVE) / FPS, HURRY_T, smooth((f - ARRIVE) / 8) * breathK(f));
/** the breathing's strength: none from the snap to the title's end (the extreme close, the pull back, the jolt, the
 *  title read on a still door), none from the A06 lean on (the clock join's outgoing view is dead still) */
const breathK = (f: number) => {
  if (f >= SNAP0 - 6 && f <= TITLE1) return smooth((SNAP0 - f) / 6);
  if (f > TITLE1 && f < TITLE1 + 20) return smooth((f - TITLE1) / 20);
  return 1 - smooth((f - (A06.leanFrom - 10)) / 10);
};
/** 9:16 (15 Nov): THE SWING'S TIP. The button column now starts at x 890 / y 1000 (9:15: x 940 / y 950); as she swings
 *  off Humphrey (M6) his chin crossed its top corner on f479 (he is going down the step as the frame leaves him), so the
 *  swing's first frames tip the lens down a hair: up to PAN_TIP deg over PAN0 .. PAN0 + 12 (a sine-squared bump, about
 *  25 px at f479, gone before the A06 lean starts). Same swing, same landing on 好 */
const PAN_TIP = 0.7;
const panTip = (f: number) => -PAN_TIP * Math.pow(Math.sin(Math.PI * clamp01((f - PAN0) / 12)), 2);
/** THE CAMERA of frame f: pure */
const camAt = (f: number): CamPose => {
  // M0: her walk up to his door lands on the cold open's held frame (LENS[0]) on ARRIVE
  if (f < ARRIVE) return walkCam(f);
  let cam = f > FOL0 && f < FOL2 ? followCam(f) : C.lensCam(f, LENS);
  // the knock: the frame nods forward a hair on each rap (the second a little more: the door gives under it)
  const rp = rapPush(f, RAPS, [0.022, 0.034]);
  // her breath: out of breath from the stairs until the snap (hurry), her resting breath from the title on (counted
  // from "Good night." as in the approved cut v5, BREATH_GOOD s there, so the intro's length does not shift it: the
  // frame of every later hold is the approved one)
  const j = jolt(f, THUD), b = f < SNAP0 ? hurry(f) : breath(f - GOOD + Math.round(BREATH_GOOD * FPS), breathK(f));
  cam = C.nudge(cam, { fwd: rp + j.fwd, pitch: -18 * rp + j.pitch + b.pitch + panTip(f), roll: j.roll, up: b.up - stepDip(f, SIDESTEPS) });
  // the asides: the whisper lean on the door he is behind (A03; A06 lands with the pan back)
  if (f >= A03.from && f <= A03.to) cam = whisperLean(f, cam, { at: DOOR_AT });
  if (f >= A06.from) cam = whisperLean(f, cam, { at: DOOR2_AT });
  return cam;
};

// ------------------------------------------------------------------------------------------------------- the door
/** the door: ajar (a forearm's width) at the cold open; each rap's shiver; swung wider on the creak; held while he
 *  stands in it; swung shut by him ON the thud; opened by Humphrey on the latch and drawn to on the click.
 *  15 Nov (the knock mark): the swing on the creak starts from rest and gathers (easeInOutQuad; it was easeOutCubic,
 *  fastest on its first frame): the leaf gives slowly as the hinge starts to creak, one frame after rap 2, so rap 2's
 *  mark, which rides the leaf, stays inside the frame's words zone while it shows (the knock point moves 6 px by the
 *  mark's 5th frame and 30 px by its last, fading one; with the old curve it was 90 px out by then). Same first frame
 *  (the creak, OPEN0), same last (OPEN1), same angles */
const doorAt = (f: number) => {
  if (f < SHUT0) return AJAR + (OPEN - AJAR) * easeInOutQuad(clamp01((f - OPEN0) / (OPEN1 - OPEN0))) + shiver(f, RAPS);
  if (f < THUD) return OPEN * (1 - easeInCubic((f - SHUT0) / (THUD - SHUT0)));
  if (f < LATCH) return 0;
  if (f < H_PULL0) return H_DOOR * smooth((f - LATCH) / 7);
  if (f < CLICK) return H_DOOR * (1 - easeInOutCubic((f - H_PULL0) / (CLICK - H_PULL0)));
  return 0;
};
/** the leaf's ring handles: inside (his side, where he swings it shut) and outside (where Humphrey draws it to) */
const HANDLE_ALONG = D.z1 - D.z0 - 0.12, HANDLE_Y = 1.0;
/** THE KNOCK POINT, where the invisible hand raps: on the leaf's landing face (KNOCK_FACE off the pivot's plane), from
 *  layout/stairs.ts STAIRS.knock (on the shut door: 0.67 m from the hinge, 1.22 m up), a hand's width nearer the free
 *  edge and above the lock plate (0.77 m from the hinge, 1.34 m up: on the bare panel, on the part of the leaf the gap
 *  framing shows inside the frame's words zone), riding the leaf */
const KNOCK_ALONG = STAIRS.knock.z - PIVOT.z + 0.1, KNOCK_Y = STAIRS.knock.y + 0.12, KNOCK_FACE = 0.03;
/** THE KNOCK ON SCREEN on frame f (film px), for skin A's knock mark (hud/ms/knock.tsx; pure, so the mark and the
 *  checkers' boxes come from the same numbers: hud/ms/when.ts): c = the knock point; u, v = where the points 10 cm
 *  further along the leaf (toward its free edge) and 10 cm up land, so the mark can lie IN the leaf's plane; it follows
 *  the frame's nod on each rap, the leaf's shiver and its swing on the creak */
export const knockAt = (f: number) => {
  const cam = camAt(f), door = doorAt(f), px = (p: THREE.Vector3) => { const q = C.toScreen(cam, p); return { x: q.x, y: q.y }; };
  return { c: px(leafPt(door, KNOCK_ALONG, KNOCK_Y, KNOCK_FACE)), u: px(leafPt(door, KNOCK_ALONG + 0.1, KNOCK_Y, KNOCK_FACE)), v: px(leafPt(door, KNOCK_ALONG, KNOCK_Y + 0.1, KNOCK_FACE)) };
};

// --------------------------------------------------------------------------------------------------------- the shot
/** the yawn: Humphrey's head back, the mouth round, the eyes shut (from the latch, about 1 s) */
const yawnK = (f: number) => clamp01((f - LATCH - 2) / 5) * (1 - clamp01((f - H_YAWN1) / 6));

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w: World, f: number) => {
    const t = f / FPS;
    w.setPlace("stairs");
    const door = doorAt(f);
    w.set.param("door", door);
    // his candle: its light in his room and as a line under the shut door, out on 睡 (he has gone to bed)
    w.set.param("glow", f < GLOW_OUT ? 1 : 1 - clamp01((f - GLOW_OUT) / 4));
    w.set.param("gapLine", 1);
    // the day round his shutters while his door is open (the room's only daylight), shut tight after
    w.set.param("leak", f < THUD ? 1 : 0);
    const cam = camAt(f);
    w.setCamera(cam);

    // NEWTON: writing at the table, to his door, "Good night.", swinging it shut (seen until it is shut)
    const nOn = f < THUD;
    const N = newtonStage(f);
    const nt = w.actor(NEWTON_INK);
    const writing = f < N_EAR;
    if (nOn) {
      const sp = speak(quote("nt", "A02"), f, 1);
      const stop = f >= STOP0 && f <= STOP1;
      // LOOK 1/4: his eyes open to full dots on the lens for this line only (the rig's dots are "smile"'s), the mouth
      // kept deadpan (a flat line) whenever he is not speaking; the lids drop back to slits as the door closes
      const look = f >= N_LOOK && f < SHUT0 + 2;
      const expr: RigState["expr"] = f < STOP0 ? "focus" : stop ? "deadpan" : f < N_TURN0 ? "focus" : look ? "smile" : "deadpan";
      // his hands: the quill on the page and his left on its corner; the quill up to his ear as he turns; his right
      // hand on the door's inner ring as he swings it shut (while it is in reach)
      let hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
      if (f < N_TURN0) hands = [quillHand(f), leftHand(f)];
      else if (f < N_EAR + 4) {
        const ear = rel(N.at, N.facing, -0.27, 1.28, 0.08), k = smooth((f - N_TURN0) / (N_EAR - N_TURN0));
        hands = [quillHand(N_TURN0).lerp(ear, k), null];
      } else if (f >= N_REACH && f < BA.doorSwing) {
        const hd = leafPt(door, HANDLE_ALONG, HANDLE_Y, -0.07), sh = rel(N.at, N.facing, -0.17, 1.05, 0);
        if (hd.distanceTo(sh) < 0.52) hands = [sh.clone().lerp(hd, smooth((f - N_REACH) / 5)), null];
      }
      const st: St = {
        at: N.at, facing: N.facing, pose: N.pose, expr, visible: true,
        blink: f >= N_LOOK && f < SHUT0 ? 0 : stopBlink(f, lid(t, 11)),
        // eyes down on the page (lookDown); for the STOP the chin comes up 3 deg and the eyes slide to the side
        lookDown: f < N_TURN0 ? (stop ? 37 : 40) : lerp(40, 4, smooth((f - N_TURN0) / 10)),
        gaze: stop ? 0.5 : 0,
        hands, hide: writing ? NEWTON_HIDE_WRITING : NEWTON_HIDE,
        // bent over the page (the torso 16 deg toward the work), up to his resting 5 deg as he sets off for the door
        lean: { pitch: lerp(16, NEWTON_LEAN.pitch ?? 5, smooth((f - N_WALK0 - 5) / 12)) },
        head: heads(sp.head, accent("nod", f, GOOD + 2, { amp: 0.4 })),
        ...(sp.mouth ? { mouth: sp.mouth } : look ? { mouth: "line" as const } : {}),
      };
      nt.set(st);
    }

    // HUMPHREY: in the corner (while his master's door is open), then from the latch until he is down the stairs
    const hOn = f < THUD || (f >= LATCH && f < H_DOWN + sec(1.4));
    const H = humphreyStage(f);
    const hm = w.actor(HUMPHREY);
    if (hOn) {
      const sp = speak(quote("hm", "A05"), f, 2);
      const yk = yawnK(f);
      const out = f >= LATCH;
      const expr: RigState["expr"] = !out ? "smile" : yk > 0.4 ? "sleep" : f >= LAUGH - 3 && f < H_SHAKE ? "shock" : "smile";
      // his eyes: on the shut door through A04 (Newton's side: screen left), on her from "Laugh", to the door on "Mr",
      // back on "Newton"
      const gaze = !out ? 0 : f < LAUGH - 3 ? (f >= H_TURN2 ? -0.5 : 0) : f >= H_MR && f < H_NW + 2 ? -1 : 0;
      // his left hand on the outer ring handle as the door swings to (once in reach)
      let hL: THREE.Vector3 | null = null;
      if (out && f >= H_PULL0 && f < CLICK + 5) {
        const hd = leafPt(door, HANDLE_ALONG, HANDLE_Y, 0.07), sh = rel(H.at, H.facing, 0.15, 0.92, 0);
        if (hd.distanceTo(sh) < 0.5) hL = hd;
      }
      // the empty bottle: held low in both hands in the corner; in his right hand going out; both hands from her question
      const both = out ? smooth((f - H_TURN2 - 3) / 8) : 1;
      const up = out ? smooth((f - H_TURN2) / 10) : 1;
      const low = { y: out ? CLUTCH.y : 0.72, z: out ? CLUTCH.z : 0.2 };
      let hR = (out ? rel(H.at, H.facing, -0.23, 0.62, 0.15) : rel(H.at, H.facing, CLUTCH.x - CLUTCH.w / 2, low.y, low.z)).lerp(rel(H.at, H.facing, CLUTCH.x - CLUTCH.w / 2, low.y, low.z), up);
      if (!out || f >= H_TURN2) hL = hang(H.at, H.facing, 1).lerp(rel(H.at, H.facing, CLUTCH.x + CLUTCH.w / 2, low.y, low.z), both);
      // the cold open (gate 5 r2, A1): turned away from her, busy with the bottle at his chest, lids on it; on the
      // knock the whirl to the door brings the bottle down to his scurrying clutch and hands his body back to the rig's
      // own turn toward the camera (exactly the build's from the whirl's end)
      const busy = !out ? 1 - whirl(f) : 0;
      if (busy > 0) { hR = hR.lerp(busyHand(H.at, H.facing, 0, f), busy); hL = (hL ?? hR).clone().lerp(busyHand(H.at, H.facing, 1, f), busy); }
      let turn: number | undefined;
      if (busy > 0) {
        const cp = cam.pos instanceof THREE.Vector3 ? cam.pos : V(cam.pos[0], cam.pos[1], cam.pos[2]);
        const off = Math.abs(wrapA(H.facing - Math.atan2(cp.x - H.at.x, cp.z - H.at.z)));
        turn = lerp(smooth((off - (115 * Math.PI) / 180) / ((55 * Math.PI) / 180)), 1, busy);   // the rig's own value at busy 0
      }
      const st: St = {
        at: H.at, facing: H.facing, pose: H.pose, visible: true, expr,
        // (busy: the lids lowered on the bottle, his own blinks on top)
        blink: yk > 0.4 ? 0 : f >= LAUGH - 3 && f < LAUGH + 12 ? 0 : Math.max(lid(t, 12), 0.4 * busy),
        gaze, hands: [hR, hL], lookDown: !out ? lerp(25, 34, busy) : 0, turn,
        head: heads(sp.head, yk > 0 ? { dy: 0.08 * yk, squash: -0.06 * yk, tilt: -4 * yk } : undefined,
          out && f >= H_YAWN1 && f < LAUGH - 3 ? { tilt: 4 * smooth((f - H_YAWN1) / 8) } : undefined,
          headPop(f, LAUGH), accent("nod", f, H_REACT, { amp: 0.35 }), accent("shake", f, H_SHAKE, { amp: 0.8 })),
        ...(yk > 0.4 ? { mouth: "round" as const } : sp.mouth ? { mouth: sp.mouth } : {}),
      };
      hm.set(st);
    }

    // his room's things: the page, the candle stub at his elbow
    w.prop("sheets").put(PAGE.clone().setY(TABLE_TOP), { n: 2, rot: F_DESK + Math.PI / 2 });
    w.prop("candle").put(CANDLE_AT, { len: 0.06, lit: true, t });
    w.update();

    // the held things: his quill (in his hand until it goes behind his ear), Humphrey's empty ink bottle
    if (nOn && writing) w.prop("quill").put(nt.handWorld(0), { grip: "hilt", rot: QROT });
    if (hOn) {
      const g = hm.handWorld(0).lerp(hm.handWorld(1), f < LATCH ? 0.5 : 0.5 * smooth((f - H_TURN2 - 9) / 4));
      w.prop("inkBottle").put(g, { grip: "grip", rot: H.facing });
    }

    // the lens's light focus on what she looks at: him at the table, his face at the door, the shut door, Humphrey
    const shutPt = V(STAIRS.door.x - 0.03, 1.05, STAIRS.door.z + 0.1);
    let aim = nOn ? nt.headWorld() : shutPt;
    // (the walk up: on his door's edge, going over to him as the gap opens on him)
    if (f < ARRIVE) aim = W_GOAL.clone().lerp(aim, smooth((f - W_LOOK0) / (ARRIVE - W_LOOK0)));
    if (f >= LATCH && hOn && f < PAN0 + 10) aim = hm.headWorld();
    const dof = lightFocus(cam, aim);
    return {
      camera: cam,
      post: { dof },
      slate: f < ARRIVE ? "A M0 her walk up" : f < OPEN0 ? "A cold open (the gap)" : f < SNAP0 ? "A his door" : f < PULL0 ? "A M1 extreme close" : f < THUD ? "A M2 pull back" : f < A03.from ? "A title" : f < FOL0 ? "A M3 A03 whisper" : f < LAUGH - 5 ? "A M4 Humphrey" : f < PAN0 ? "A M5 Laugh" : f < BEAT.A.card1[0] ? "A M6 A06 whisper" : "A card 1",
    };
  },
};
