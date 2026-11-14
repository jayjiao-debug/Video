// SEGMENT A, lines A01-A06: 清晨 on the stairs (PLAN 7 A, script scene 1). WP5. ONE take in her eyes, cut only at the
// scene's end (the plate insert of B):
//   run      f0 .. A01   already moving: she takes the last steps at a run, two at a time, up the left of the flight
//                        by the handrail (four footfalls on the mix's stair steps); frame 0 looks up the flight: the
//                        landing's edge across the bottom of the frame, his door centre right in its slab of sun with
//                        its ring handle and the candle line under it, the stair window a sliver at the left edge;
//                        the mic swings in from the lower left and raps the door twice (sfx_knock: the first rap
//                        lands, the second chases the door: it is ALREADY OPENING)
//   doorway  A01 .. A02  she steps back as it swings: NEWTON fills the doorway (NEWTON_INK: ink on the nose, the quill
//                        behind his ear, the bird's nest), a candle stub held under his chin, deadpan with heavy lids;
//                        a slow sleepy blink on her 一天; "Good night." (flat), already backing off on "night"
//   slam     A02 hold    the door swings shut in the mic's face (the thud on the mix's sfx_door_shut; the mic jerks
//                        back); the TITLE BLOCK lands on the shut door (Pose.title follows the door's upper panel);
//                        the candle glow under the door goes out (he has blown it out)
//   aside    A03         the mic swings round to the lens, the shut door soft behind it
//   card 1   A03 hold    the mic lowered; the door opens (sfx_door_crack's latch) and HUMPHREY scurries out yawning
//                        with his empty ink bottle and, walking off along the wall, draws the door to behind him with
//                        his left hand (the latch's click); she steps back by the window from the latch and the
//                        camera tracks him beside the card (face above its top); he heads for the stairs, still half
//                        asleep
//   ask      A04 .. A05  she calls him: he stops at the stair head and turns to her, the mic on him; "Laugh?" (shock,
//                        a head pop), a glance at the door on "Mr Newton?", back at her, a slow head shake
//   down     A05 hold    he goes down the stairs on the mix's footsteps: he BACKS down the first steps still facing
//                        her (the bottle clutched to his chest, a wary eye on her: never the bare back of his head),
//                        and turns to go on down only once she has swung back to the door
//   aside    A06         she swings back to his door, the mic round to the lens: 「好，今天我要让他笑一次。」
// Every frame is looked up (lineId / capWord / card / BEAT / SEGMENTS and the sound anchors from the lines' voice
// times + the clips' own measured offsets); every mark comes from layout/stairs.ts (STAIRS, STAIRS_SET).
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, quote, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, type Segment, type CamPose } from "../story";
import { BEAT, TITLE_SPAN } from "../beats";
import * as C from "../cam";
import { NEWTON_INK, HUMPHREY } from "../people";
import { STAIRS, STAIRS_SET, EYE, FOV } from "../layout";
import type { World } from "../world";
import { V, rel, hang, lid, speak, accent, heads, headPop, walkAlong, yawTo, lerpA, wrapA, asideK, cardLower, rigWalk, type RigState, type RigPose } from "./common";
import { micA } from "./segA_parts";

type St = Partial<RigState>;
const S = SEGMENTS[0];
const ln = (id: string) => lineId(id);
/** a time on the voice track (s) -> the film frame (the mix's anchors are a line's start / end + an offset) */
const atSec = (s: number) => Math.round(s * FPS);
const sec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;
const UP = V(0, 1, 0);

// ------------------------------------------------------------------------------------------------ the sound anchors
/** the mix's hits in scene A (scripts/newton/sound/cues.json, SYNC_POINTS.md), with the clips' own measured onsets:
 *  her four stair steps (sfx_stairs_up from the scene's start: 0.10 / 0.23 / 0.43 / 0.57 s), the two raps of sfx_knock
 *  (at 0.01 and 0.16 s into it), the thud of sfx_door_shut (0.27 s into it), the latch of sfx_door_crack (its start)
 *  and its click shut (1.14 s into it), his first step down (sfx_stairs_down) */
const SND = {
  steps: [0.1, 0.23, 0.43, 0.57].map((s) => S.from + sec(s)),
  rap1: atSec(ln("A01").start + 0.54), rap2: atSec(ln("A01").start + 0.54 + 0.15),
  thud: atSec(ln("A02").end + 0.37 + 0.27),
  latch: atSec(ln("A03").end + 0.6), click: atSec(ln("A03").end + 0.6 + 1.14),
  down: atSec(ln("A05").end + 0.1),
};

// ------------------------------------------------------------------------------------------------------- the beats
const ARRIVE = SND.steps[3];                       // her last footfall: at the door
const OPEN0 = SND.rap1 + 2, OPEN1 = BEAT.A.doorOpen[1];   // the door swings open (already, by the second rap)
const BACK0 = SND.rap2 + 3, BACK1 = BACK0 + sec(0.8);      // she steps back as it swings
const SLEEPY = word("A01", "一");                   // his slow sleepy blink on her 一天
const N_COME0 = OPEN0 + sec(0.3), N_COME1 = N_COME0 + sec(0.6);      // he steps up into the doorway behind the leaf
const N_GO = word("A02", "night") - 2, N_IN = SND.thud - sec(0.4);   // he backs off on "night" ..
const SHUT0 = SND.thud - sec(0.55);               // .. and swings the door shut: the thud
const GLOW_OUT = BEAT.A.glowOut;                  // the candle glow under the door goes out
const H_OUT0 = SND.latch + 4;                     // Humphrey scurries out, yawning, eyes shut, and along the wall
const H_PULL0 = SND.latch + sec(0.8);             // .. drawing the door shut behind him with his left hand: the click
const H_BACK = SND.click + sec(0.9);              // .. the yawn ends (he dawdles to the stair head)
const H_TURN2 = BEAT.A.micHumphrey + 4;           // her question stops him: he turns to her
const H_LAUGH = word("A05", "Laugh"), H_MR = word("A05", "Mr"), H_NEWTON = word("A05", "Newton");
const H_SHAKE = ln("A05").to - sec(0.35);         // the slow head shake
const H_DOWN = SND.down;                          // he goes down on the footsteps, backing down the first steps ..
const H_TURN3 = H_DOWN + sec(1.05);               // .. and turns to go on down (her camera is on the door by then)
const H_BACKV = 0.75, H_DOWNV = 1.35;             // m/s along his way: backing down, then going on down
const SWING0 = BEAT.A.aside06[0] - 4;             // she swings back to the door for the aside
const STEP2_0 = SND.latch + 2, STEP2_1 = SND.latch + sec(1.7);   // she steps back by the window to give him room

// ------------------------------------------------------------------------------------------------------- the marks
const D = STAIRS_SET.door, ST = STAIRS_SET.steps;
/** the leaf's pivot (sets/stairs.ts puts the leaf at the hinge + 2 cm) */
const PIVOT = V(STAIRS.hinge.x + 0.02, 0, STAIRS.hinge.z);
/** a point on the leaf at door param `door`: `along` m from the pivot toward the free edge, `face` m toward the landing
 *  (at door 0), y up */
const leafPt = (door: number, along: number, y: number, face: number) => {
  const a = clamp01(door) * D.swing;
  return V(PIVOT.x + along * Math.sin(a) - face * Math.cos(a), y, PIVOT.z + along * Math.cos(a) + face * Math.sin(a));
};
const KNOCK_ALONG = STAIRS.knock.z - PIVOT.z, KNOCK_FACE = PIVOT.x - STAIRS.knock.x;
/** the outer ring handle, where Humphrey draws the door shut */
const HANDLE_ALONG = D.z1 - D.z0 - 0.12, HANDLE_Y = 1.0, HANDLE_FACE = 0.07;
/** NEWTON: in his room 1.1 m back from the door (out of the leaf's sweep: it swings into the room 0.9 m from its
 *  pivot) as it opens; in his doorway; backed off into the room again before it swings shut */
const N_AT = STAIRS.doorway.clone(), N_FACE = STAIRS.doorwayFacing;
const N_IN0 = V(STAIRS.door.x + 1.1, 0, D.z1 - 0.17);
const N_BACK = V(STAIRS.door.x + 1.15, 0, D.z1 - 0.17);
/** NEWTON's and HUMPHREY's eyes over their floor (README 4: 1.14 m on the scale-1 figure; Humphrey is 0.95) */
const N_EYE = 1.14, H_EYE = 1.14 * 0.95;
/** HUMPHREY: waiting in the room 1.1 m back from the door (out of the leaf's sweep), the doorway, the landing (clear
 *  of the architrave), along the wall to the stair head; fast out of the door, dawdling on */
const H_IN = V(STAIRS.door.x + 1.1, 0, D.z1 - 0.07);
const H_GAP = V(STAIRS.door.x + 0.2, 0, D.z1 - 0.25);
const H_OUT = V(STAIRS.door.x - 0.33, 0, D.z1 - 0.17);
const H_TOP = V(STAIRS.stairHead.x + 0.47, 0, STAIRS.stairHead.z - 0.17);
const H_PATH = [H_IN, H_GAP, H_OUT, H_TOP], H_FAST = 1.8, H_SLOW = 0.55;
const H_L1 = H_IN.distanceTo(H_GAP) + H_GAP.distanceTo(H_OUT), H_L = H_L1 + H_OUT.distanceTo(H_TOP);
/** metres along his way out on frame f */
const hDist = (f: number) => { const t = Math.max(0, (f - H_OUT0) / FPS), t1 = H_L1 / H_FAST; return t < t1 ? H_FAST * t : Math.min(H_L, H_L1 + H_SLOW * (t - t1)); };
/** where both his hands clutch the bottle from her question on (rel to him: centre x to his left, the hands w apart,
 *  height, forward) */
const CLUTCH = { x: 0.07, w: 0.1, y: 0.79, z: 0.24 };
/** his way down the right of the flight: tread k at y -k * rise */
const H_STEPS = [H_TOP, V(H_TOP.x - 0.03, 0, STAIRS.step(1).z), V(H_TOP.x - 0.05, 0, STAIRS.step(4).z), V(H_TOP.x - 0.07, 0, STAIRS.step(9).z)];
const stairY = (z: number) => -ST.rise * Math.max(0, Math.min(ST.n, (z - STAIRS.stairHead.z - 0.05) / ST.go + 0.35));

// ------------------------------------------------------------------------------------------------------ her camera
/** HER EYES (1.6 m over the floor she stands on): at the door to knock (about 0.7 m from the knock point: the mic
 *  reaches it), back where she holds on him (square on to the door, 0.25 m off the left wall), then a step back by
 *  the window when Humphrey comes out */
const P_KNOCK = V(STAIRS.knock.x - 0.6, EYE, STAIRS.knock.z + 0.04);
const P_HOLD = V(STAIRS.landing.x - 0.53, EYE, STAIRS.door.z + 0.06);
const P_STEP = V(STAIRS.landing.x - 0.6, EYE, STAIRS.door.z - 0.36);
/** her run: [frame, x, floor y, z] at the footfalls: two steps at a time up the left of the flight (by the handrail,
 *  so the door is seen more square on), from mid-stride over the fifth step down, onto the third, the first, the
 *  landing, and to the door */
const RUN_X = STAIRS.stairHead.x - 0.47;
const RUN: [number, THREE.Vector3][] = [
  [S.from, V(RUN_X, STAIRS.step(4).y + 0.04, STAIRS.step(4).z + 0.1)],
  [SND.steps[0], V(RUN_X + 0.06, STAIRS.step(3).y, STAIRS.step(3).z)],
  [SND.steps[1], V(RUN_X + 0.16, STAIRS.step(1).y, STAIRS.step(1).z)],
  [SND.steps[2], V(lerp(RUN_X + 0.16, P_KNOCK.x, 0.45), 0, lerp(STAIRS.stairHead.z, P_KNOCK.z, 0.62))],
  [ARRIVE, V(P_KNOCK.x, 0, P_KNOCK.z)],
];
/** the direction that puts world point `target` on screen at (px, py) from `pos` (fov vertical, 9:16) */
const aimDir = (pos: THREE.Vector3, target: THREE.Vector3, px: number, py: number, fov = FOV) => {
  const tanV = Math.tan((fov * Math.PI) / 360), tanH = (tanV * 9) / 16, nx = (px / 540 - 1) * tanH, ny = (1 - py / 960) * tanV;
  const d = target.clone().sub(pos).normalize(), n = Math.hypot(1, nx, ny);
  let fwd = d.clone();
  for (let i = 0; i < 8; i++) {
    const right = fwd.clone().cross(UP).normalize(), up = right.clone().cross(fwd).normalize();
    fwd = d.clone().multiplyScalar(n).addScaledVector(right, -nx).addScaledVector(up, -ny).normalize();
  }
  return fwd;
};
const nl = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, clamp01(k)).normalize();
/** a Catmull-Rom (Hermite) way through timed keys: moving at the first key (the film starts mid-run), stopped at the last */
const hermite = (f: number, keys: [number, THREE.Vector3][]) => {
  if (f <= keys[0][0]) return keys[0][1].clone().add(keys[1][1].clone().sub(keys[0][1]).multiplyScalar((f - keys[0][0]) / (keys[1][0] - keys[0][0])));
  const n = keys.length;
  if (f >= keys[n - 1][0]) return keys[n - 1][1].clone();
  let i = 0; while (keys[i + 1][0] < f) i++;
  const [t0, p0] = keys[i], [t1, p1] = keys[i + 1], dt = t1 - t0, u = (f - t0) / dt;
  const tan = (k: number) => k === 0 ? keys[1][1].clone().sub(keys[0][1]).multiplyScalar(1 / (keys[1][0] - keys[0][0])) : k === n - 1 ? V() : keys[k + 1][1].clone().sub(keys[k - 1][1]).multiplyScalar(1 / (keys[k + 1][0] - keys[k - 1][0]));
  const m0 = tan(i).multiplyScalar(dt), m1 = tan(i + 1).multiplyScalar(dt);
  const u2 = u * u, u3 = u2 * u;
  return p0.clone().multiplyScalar(2 * u3 - 3 * u2 + 1).addScaledVector(m0, u3 - 2 * u2 + u).addScaledVector(p1, -2 * u3 + 3 * u2).addScaledVector(m1, u3 - u2);
};
/** the run's footfalls: the lens dips 2 cm on each landing and comes back up, a little roll from side to side */
const stepBob = (f: number) => {
  let dip = 0, roll = 0;
  SND.steps.forEach((s, i) => { const d = f - s; if (d >= 0 && d < 6) { const k = Math.sin((Math.PI * d) / 6); dip = Math.max(dip, 0.02 * k); roll += (i % 2 ? -1 : 1) * 0.9 * k; } });
  return { dip: f <= ARRIVE + 6 ? dip : 0, roll };
};
/** her floor point and the lens at frame f (before the direction) */
const camPos = (f: number) => {
  let p: THREE.Vector3;
  if (f <= ARRIVE) { const q = hermite(f, RUN); p = V(q.x, EYE + q.y, q.z); }
  else if (f < BACK0) p = P_KNOCK.clone();
  else p = P_KNOCK.clone().lerp(P_HOLD, easeInOutCubic(clamp01((f - BACK0) / (BACK1 - BACK0))));
  if (f >= STEP2_0) p.lerp(P_STEP, easeInOutCubic(clamp01((f - STEP2_0) / (STEP2_1 - STEP2_0))));
  p.y -= stepBob(f).dip;
  return p;
};
/** framings: the run looks up the flight at the sunlit door (its ring handle right of centre, the landing's edge low
 *  across the frame, the window a sliver at the left edge); at the door the knock point sits right of centre
 *  (the mic's jab reads across the frame); on him his eyes in the upper third; the shut door for the aside */
const DIR_RUN0 = aimDir(camPos(S.from), V(STAIRS.door.x, 1.0, D.z1 - 0.12), 740, 680);
const DIR_KNOCK = aimDir(P_KNOCK, STAIRS.knock, 690, 990);
const DIR_NEWTON = aimDir(P_HOLD, N_AT.clone().setY(N_EYE), 540, 620);
const DIR_DOOR = aimDir(P_STEP, V(STAIRS.door.x, 1.2, STAIRS.door.z + 0.05), 560, 780);
/** where Humphrey is on frame f (pure: the tracking camera averages it over the frames before) */
const hmAt = (f: number) => humphreyStage(f).at;
const hmEyeAvg = (f: number, half: number) => {
  const p = V(); let ws = 0;
  for (let i = -half; i <= half; i++) { const w = half + 1 - Math.abs(i), q = hmAt(f + i); p.add(q.clone().setY(q.y + H_EYE).multiplyScalar(w)); ws += w; }
  return p.divideScalar(ws);
};
/** THE CAMERA of frame f: pure */
const camAt = (f: number): CamPose => {
  const pos = camPos(f);
  let d = f <= ARRIVE ? nl(DIR_RUN0, DIR_KNOCK, smooth(f / Math.max(1, ARRIVE))) : DIR_KNOCK.clone();
  d = nl(d, DIR_NEWTON, easeInOutCubic(clamp01((f - BACK0) / (BACK1 - BACK0 + 4))));
  if (f >= H_OUT0) {
    // she follows Humphrey: right of the card while it shows, a little left of centre for the questions (the mic
    // comes in from the left); his head sinking away as he goes down
    const k = smooth((f - BEAT.A.card1[1] + 10) / 20), px = lerp(680, 600, k), py = lerp(520, 630, k);
    const tgt = hmEyeAvg(f, f > H_DOWN ? 8 : 5);
    if (f > H_DOWN) tgt.y = lerp(tgt.y, H_TOP.y + H_EYE - 0.25, 0.6);
    d = nl(d, aimDir(pos, tgt, px, py), smooth((f - H_OUT0) / 16));
  }
  if (f >= SWING0) d = nl(d, DIR_DOOR, easeInOutCubic((f - SWING0) / 18));
  const roll = f <= ARRIVE + 6 ? stepBob(f).roll : 0;
  return C.nudge({ pos: [pos.x, pos.y, pos.z], look: [pos.x + 2 * d.x, pos.y + 2 * d.y, pos.z + 2 * d.z], fov: FOV }, { roll });
};

// ------------------------------------------------------------------------------------------------------- the door
/** the door: opens as she raps (already opening by the second rap), held while he stands in it, swung shut on the
 *  thud; opened for Humphrey on the latch and drawn shut on the click */
const doorAt = (f: number) => {
  if (f < OPEN0) return 0;
  if (f < SHUT0) return 0.8 * easeOutCubic(clamp01((f - OPEN0) / (OPEN1 - OPEN0)));
  if (f < SND.thud) return 0.8 * (1 - easeInCubic((f - SHUT0) / (SND.thud - SHUT0)));
  if (f < SND.latch) return 0;
  if (f < H_PULL0) return 0.62 * smooth((f - SND.latch) / 7);
  if (f < SND.click) return 0.62 * (1 - easeInOutCubic((f - H_PULL0) / (SND.click - H_PULL0)));
  return 0;
};

// ------------------------------------------------------------------------------------------------------ the people
/** a walk backwards (the steps run the other way) */
const backWalk = (d: number, speed: number): RigPose => { const p = rigWalk(d, speed); return { ...p, phase: 1 - (p.phase ?? 0) }; };
/** NEWTON on frame f: in the doorway with his candle, backing off from "night" */
const newtonStage = (f: number) => {
  const idle: RigPose = { kind: "idle", t: f / FPS + 0.4 };
  if (f < N_GO) {
    const u = clamp01((f - N_COME0) / (N_COME1 - N_COME0)), k = easeInOutCubic(u), at = N_IN0.clone().lerp(N_AT, k);
    return { at, facing: N_FACE, pose: u > 0 && u < 1 ? rigWalk(N_IN0.distanceTo(N_AT) * k, 1.3) : idle };
  }
  const u = clamp01((f - N_GO) / (N_IN - N_GO)), k = smooth(u), at = N_AT.clone().lerp(N_BACK, k);
  return { at, facing: N_FACE, pose: u > 0 && u < 1 ? backWalk(N_AT.distanceTo(N_BACK) * k, 1.0) : idle };
};
/** HUMPHREY on frame f: out of the door, the pull, the stair head, down the stairs */
const humphreyStage = (f: number): { at: THREE.Vector3; facing: number; pose: RigPose; turn?: number } => {
  const idle = (t: number): RigPose => ({ kind: "idle", t: t + 1.3 });
  const camYaw = (p: THREE.Vector3) => yawTo(p, P_STEP);
  if (f < H_OUT0) return { at: H_IN.clone(), facing: yawTo(H_IN, H_GAP), pose: idle(f / FPS) };
  if (f < H_DOWN) {
    const d = hDist(f), L = walkAlong(H_PATH, 1, d), arrived = d >= H_L - 1e-6;
    const tA = H_OUT0 + Math.round(((H_L1 / H_FAST) + (H_L - H_L1) / H_SLOW) * FPS);    // the frame he gets there
    const k = smooth((f - H_TURN2) / 9), facing = lerpA(L.facing, camYaw(H_TOP), k);
    return { at: L.at, facing, pose: arrived ? idle((f - tA) / FPS) : rigWalk(d, d < H_L1 ? H_FAST : H_SLOW) };
  }
  // backing down facing her (the walk run backwards), then round and on down
  const tB = (Math.min(f, H_TURN3) - H_DOWN) / FPS, d = H_BACKV * tB + (f > H_TURN3 ? H_DOWNV * (f - H_TURN3) / FPS : 0);
  const L = walkAlong(H_STEPS, 1, d);
  const at = L.at.clone(); at.y = stairY(at.z);
  if (f <= H_TURN3) return { at, facing: camYaw(at), pose: d > 0 ? backWalk(d, H_BACKV) : idle(0) };
  return { at, facing: lerpA(camYaw(at), L.facing, smooth((f - H_TURN3) / 6)), pose: rigWalk(d, H_DOWNV) };
};

// --------------------------------------------------------------------------------------------------------- the shot
/** his heavy-lidded blink on her 一天: the lids sink over 4 frames, stay shut 5, come up over 5 */
const sleepyLid = (f: number) => { const d = f - SLEEPY; return d < 0 || d > 14 ? 0 : d < 4 ? 0.5 : d < 9 ? 1 : 0.5; };
/** the yawn: Humphrey's head back, the mouth round, the eyes shut (from the latch to the turn round) */
const yawnK = (f: number) => clamp01((f - SND.latch - 2) / 6) * (1 - clamp01((f - H_BACK) / 8));

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w: World, f: number) => {
    const t = f / FPS;
    w.setPlace("stairs");
    const door = doorAt(f);
    w.set.param("door", door);
    w.set.param("glow", f < GLOW_OUT ? 1 : 1 - clamp01((f - GLOW_OUT) / 4));
    // his candle as a bright line in the gap under the shut door (seen from her eye height), and his room's shutters
    // shut tight (their day seams hung as white strings over the heads in the doorway)
    w.set.param("gapLine", 1);
    w.set.param("leak", 0);
    const cam = camAt(f);
    w.setCamera(cam);

    // NEWTON in his doorway (until the door is shut on him)
    const nOn = f >= OPEN0 - 1 && f < SND.thud;
    const N = newtonStage(f);
    const nt = w.actor(NEWTON_INK);
    const nHand = rel(N.at, N.facing, -0.1, 0.98, 0.37);      // the candle stub up under his chin, out in front of it
    if (nOn) {
      const sp = speak(quote("nt", "A02"), f, 1);
      const st: St = {
        at: N.at, facing: N.facing, pose: N.pose, expr: "deadpan", visible: true,
        blink: Math.max(lid(t, 11), sleepyLid(f)), hands: [nHand, null],
        head: heads(sp.head, accent("nod", f, ln("A02").from + 2, { amp: 0.6 })),
        ...(sp.mouth ? { mouth: sp.mouth } : {}),
        gaze: 0,
      };
      nt.set(st);
    }

    // HUMPHREY from the latch until he is down the stairs
    const hOn = f >= SND.latch && f < H_DOWN + sec(1.4);
    const H = humphreyStage(f);
    const hm = w.actor(HUMPHREY);
    if (hOn) {
      const sp = speak(quote("hm", "A05"), f, 2);
      const yk = yawnK(f);
      const expr: RigState["expr"] = yk > 0.4 ? "sleep" : f >= H_LAUGH - 3 && f < H_SHAKE ? "shock" : "neutral";
      const gaze = f >= H_MR && f < H_NEWTON + 2 ? -1 : 0;
      // his left hand (the wall side as he walks off) on the outer ring handle as the door swings to (once in reach)
      let hL: THREE.Vector3 | null = null;
      if (f >= H_PULL0 && f < SND.click + 5) {
        const hd = leafPt(door, HANDLE_ALONG, HANDLE_Y, HANDLE_FACE), sh = rel(H.at, H.facing, 0.15, 0.92, 0);
        if (hd.distanceTo(sh) < 0.46) hL = hd;
      }
      // the empty bottle in his right hand; from her question on BOTH hands clutch it to his chest, a little to his
      // left (screen right: clear of her mic's head, which comes in from the left)
      const up = smooth((f - H_TURN2) / 10), both = smooth((f - H_TURN2 - 3) / 8);
      const hR = rel(H.at, H.facing, -0.23, 0.62, 0.15).lerp(rel(H.at, H.facing, CLUTCH.x - CLUTCH.w / 2, CLUTCH.y, CLUTCH.z), up);
      if (f >= H_TURN2) hL = hang(H.at, H.facing, 1).lerp(rel(H.at, H.facing, CLUTCH.x + CLUTCH.w / 2, CLUTCH.y, CLUTCH.z), both);
      const st: St = {
        at: H.at, facing: H.facing, pose: H.pose, visible: true, expr,
        blink: yk > 0.4 ? 0 : f < H_TURN2 + 4 ? Math.max(0.5, lid(t, 12)) : lid(t, 12),
        gaze, hands: [hR, hL],
        head: heads(sp.head, yk > 0 ? { dy: 0.08 * yk, squash: -0.06 * yk, tilt: -4 * yk } : undefined, headPop(f, H_LAUGH),
          accent("shake", f, H_SHAKE, { amp: 0.8 }), accent("nod", f, H_TURN2 + 6, { amp: 0.5 })),
        ...(yk > 0.4 ? { mouth: "round" as const } : sp.mouth ? { mouth: sp.mouth } : {}),
        ...(H.turn !== undefined ? { turn: H.turn } : {}),
      };
      hm.set(st);
    }
    w.update();

    // the props held: his candle stub under his chin, Humphrey's empty ink bottle
    if (nOn) w.prop("candle").put(nt.handWorld(0), { grip: "grip", rot: N.facing + Math.PI, len: 0.1, lit: true, t });
    if (hOn) {
      // in the right hand; once both hands have it, held between them
      const g = hm.handWorld(0).lerp(hm.handWorld(1), 0.5 * smooth((f - H_TURN2 - 9) / 4));
      w.prop("inkBottle").put(g, { grip: "grip", rot: H.facing });
    }

    // HER MIC: in from the lower left on the run, the raps, on him; the slam in its face; round to the lens on the
    // asides; lowered under the card; on Humphrey
    const knock = leafPt(door, KNOCK_ALONG, STAIRS.knock.y, KNOCK_FACE);
    const nMouth = nOn ? nt.headWorld().add(V(0, -0.1, 0)) : V(STAIRS.door.x, 1.0, STAIRS.door.z);
    const shutPt = V(STAIRS.door.x - 0.03, 1.05, STAIRS.door.z + 0.1);
    let aim = knock;
    aim = aim.clone().lerp(nMouth, smooth((f - BACK0) / 14));
    aim.lerp(shutPt, smooth((f - SHUT0) / (SND.thud - SHUT0)));
    if (f >= SND.latch) aim = hOn ? hm.headWorld().add(V(0, -0.11, 0)) : shutPt;
    const flinch = f >= SND.thud && f < SND.thud + 7 ? Math.sin((Math.PI * (f - SND.thud + 1)) / 8) : 0;
    const enter = Math.min(smooth((f - SND.steps[0] + 1) / 11), 1 - cardLower(f)) * (1 - 0.35 * flinch);
    // (segA_parts micA = putMic with segA's own aside pose: the handle leaning to the lower left, the fist's curls to
    // the lens)
    const M = micA(w, cam, f, { aim, lens: asideK(f), rap: C.rapK(f, [SND.rap1, SND.rap2]), enter });

    // the title block on the shut door's upper panel; it lands ON the thud (TITLE_SPAN starts a few frames before it:
    // held back until the door is shut, requests.md WP5-A -> WP1)
    const tp = C.toScreen(cam, V(STAIRS.door.x - 0.03, 1.36, STAIRS.door.z + 0.02));
    const titleOn = f >= TITLE_SPAN[0] - 2 && f <= TITLE_SPAN[1] + 2;
    const titleHeld = f >= TITLE_SPAN[0] && f < SND.thud;
    return {
      camera: cam,
      ...(M.dof ? { post: { dof: M.dof } } : {}),
      ...(titleHeld ? { cards: false } : {}),
      ...(titleOn ? { title: { x: Math.round(tp.x), y: Math.round(tp.y), scale: 0.9 } } : {}),
      slate: f <= ARRIVE ? "A1 run" : f < SND.thud ? "A1 doorway" : f < BEAT.A.card1[0] ? "A2 title / aside" : f < BEAT.A.micHumphrey ? "A2 card 1" : f < H_DOWN ? "A3 Humphrey" : "A3 aside 06",
    };
  },
};
void wrapA; void easeOutCubic;
