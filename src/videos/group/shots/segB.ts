// segment B, frames 266-770 (lines 03-06): the 1974 rope experiment (Ingham et al.), literal and at eye level.
// f266 (segA's phone thumbnail, rendered without captions, is this frame): a framing on the side camera's side of
// the room, tighter on the gauge: the dial upper left, puller 1 on square 1 already hauling on the rope from the
// shackle, the researcher with her clipboard by window 1 (R0, clear to the right of puller 1). One slow eased pull-back
// (f266 -> f598) widens it
// to exactly cams.side while the others join; the camera then holds to the H2 hand-off.
// Line 03: puller 1 hauls hard (huff), the needle trembles at 16 (one person's full pull = 16 dial units); the
//   researcher reads the dial and writes. 测力气 (f371): the label card 每人出力 enters with 1人 100%.
// Line 04: puller 2 walks in from the camera side, turns, bends, grips the spare rope where it hangs down from puller
//   1's rear hand (it lies flat on the floor from just short of square 2 on), lifts it over 10 f, hauls; the needle eases to 29 (2 x 16 x 0.91). 每人只出【91%】 (f434): 2人 91%.
// Line 05: puller 3 joins (needle 39 = 3 x 16 x 0.82, bar 3人 82% as he hauls), pullers 4, 5, 6 join one by one
//   (needle up to 75 = 6 x 16 x 0.78 as each grips), 只剩【78%】 (f590): 6人 78%. The card leaves f636-644.
//   Each puller's lean eases down a little as the group grows (each pulls less), while the total rises.
// Line 06: the objection "they are just out of step": the six heave clearly out of step (each on their own rhythm:
//   one leans back while the next relaxes), the needle wobbles irregularly round 70. 大家使劲【不同步】 (f706): a
//   small "?" pops over the researcher (she watches from S2, behind squares 5-6, where her face shows between the
//   heads of pullers 5 and 6), she tilts her head, puzzled, then walks off along the window side toward puller 1 to
//   look into it (the "?" leaves f720-726, before she turns away; from about f750 she is behind puller 2's head, as in H2). All relax to the
//   H2 state (stand, dial 20) over f735-762; f770 = labcommon's H2 exactly (crewPose itself).
// Everything is a pure function of f. Checks (IP='{"dbg":true}'): framing (heads, dial, card), rope clearance against
// the set's colliders and the bodies, feet on the floor, walk paths against the rope and the other figures, camera
// distance to heads and props.
import type React from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import type { Segment, CamPose, Vec3 } from "../story";
import { SEGMENTS, FPS, h, lerp, mix3, smooth, clamp01, spring, easeInOutCubic, spl } from "../story";
import type { World } from "../world";
import type { FigState } from "../kit/cast";
import { lidAt, cardClearance } from "../kit/cast";
import type { Expr } from "../kit/toon";
import { WALK_CYCLE_M } from "../kit/toon";
import type { Rope } from "../kit/rope";
import { acquireCrew, releaseCrew, crewPose, h2Pullers, H2_RESEARCHER, H2_DIAL, type Crew } from "./labcommon";
import { crewB, ropeEnd, hideRope, type BPuller, type Fx } from "./segB_crew";
import { PctCard, Puzzle, pctCardBottom, pctRowOpen, PCT_CARD } from "./segB_card";

const S = SEGMENTS.find((s) => s.id === "B")!;
const IP = getInputProps() as { dbg?: boolean };
const F0 = S.from, F1 = S.to;

// ---------------------------------------------------------------------------------------------------- beats (frames)
/** card: enters on 测力气, rows on the narration, leaves before the heave */
const CARD_IN = 371, CARD_OUT = 636;
/** the pick-up after each arrival: the front "turn" drawing (TURN f), the bend to the rope (DOWN f, gripped at its
 *  end), the lift to rope height (LIFT f, eased: no one-frame snap upright); the haul starts at arrival + the sum.
 *  Pullers 4-6 (small in the wide framing, arriving one by one) a little quicker. */
const PICKT = [0, 1, 2, 3, 4, 5].map((i) => (i < 3 ? { turn: 4, down: 6, lift: 10 } : { turn: 3, down: 4, lift: 7 }));
/** pull start for pullers 2..6 (index 1..5): puller 2 as 两个人一起拉 ends (row 2 on 91%), puller 3 as row 3 pops in
 *  三个人【82%】 (then ~14 f of a clear three-person pull before puller 4 walks in over the group), 4-6 one by one in
 *  六个人, puller 6 on 只剩【78%】. Two picks never overlap (crewB drives one picker and one pick rope): each pull
 *  start is at least down + lift after the previous one. */
const PULL = [0, 433, 513, 568, 579, 590];
/** arrival frame at the square */
const ARR = PULL.map((p, i) => (i === 0 ? 0 : p - PICKT[i].turn - PICKT[i].down - PICKT[i].lift));
const pullStart = (i: number) => (i === 0 ? F0 - 60 : PULL[i]);
const ROWS = [
  { label: "1人", value: 100, at: CARD_IN },
  { label: "2人", value: 91, at: 434 },
  { label: "3人", value: 82, at: pullStart(2) },
  { label: "6人", value: 78, at: 590 },
];
/** heave (line 06) and the relax into H2 */
const HEAVE0 = 645, HEAVE_FULL = 662, RELAX0 = 735, RELAX1 = 758;
/** the "?" over the researcher on 不同步 */
const Q_IN = 706, Q_OUT = 720;

// ---------------------------------------------------------------------------------------------------- camera
/** the opening framing: from the door end on the camera side (the side camera's side of the room), closer in and a
 *  little tighter, aimed between the dial and square 1. Eye level, untilted. */
const OPEN_B: CamPose = { pos: [1.15, 1.38, 0.36], look: [-2.45, 1.08, -1.1], fov: 62 };
const CAM_END = 598;
/** trapezoid-velocity progress 0..1 over [f0, f1]: smooth ramps of `a` frames in and `d` frames out */
const trap = (f: number, f0: number, f1: number, a: number, d: number) => {
  const T = f1 - f0, x = Math.max(0, Math.min(T, f - f0));
  const vmax = 1 / (T - a / 2 - d / 2);
  if (x <= a) return vmax * (x * x) / (2 * a);
  if (x <= T - d) return vmax * (a / 2 + (x - a));
  const y = T - x;
  return 1 - vmax * (y * y) / (2 * d);
};
const camAt = (w: World, f: number): CamPose => {
  const side = w.lab.set.cams.side;
  if (f >= CAM_END) return { pos: [...side.pos] as Vec3, look: [...side.look] as Vec3, fov: side.fov };
  const p = trap(f, F0, CAM_END, 24, 96);
  return { pos: mix3(OPEN_B.pos, side.pos, p), look: mix3(OPEN_B.look, side.look, p), fov: lerp(OPEN_B.fov, side.fov, p) };
};
/** a camera of our own for the walk-start solve (never the film camera) */
const probe = new THREE.PerspectiveCamera(60, 1080 / 1920, 0.03, 600);
const probeCam = (c: CamPose) => {
  probe.position.set(...(c.pos as Vec3)); probe.up.set(0, 1, 0); probe.lookAt(...(c.look as Vec3)); probe.fov = c.fov;
  probe.updateProjectionMatrix(); probe.updateMatrixWorld(true);
};
const sx = (p: THREE.Vector3) => (p.clone().project(probe).x * 0.5 + 0.5) * 1080;

// ---------------------------------------------------------------------------------------------------- walks
/** walking pace (m/s average; 4-6 brisker, so puller 4 enters only after the three-person pull has read) and the
 *  arrival ease: constant speed, then a soft stop over the last 45 % */
const PACE = [1.5, 1.5, 1.5, 1.7, 1.7, 1.7];
const walkK = (s: number) => { const s1 = 0.55, A = s1 + (1 - s1) / 2, x = clamp01(s); if (x <= s1) return x / A; const y = x - s1; return (s1 + y - (y * y) / (2 * (1 - s1))) / A; };
type WalkPlan = { from: THREE.Vector3; to: THREE.Vector3; f0: number; f1: number };
let plans: WalkPlan[] | null = null;
/** each walker starts just outside the left frame edge of the camera at their start frame (the card's mid-height at
 *  x < -120 px) on the line of their square, and arrives at the square's centre at ARR[i] */
const walkPlans = (w: World): WalkPlan[] => {
  if (plans) return plans;
  const A = w.lab.A;
  plans = A.positions.map((sq, i) => {
    if (i === 0) return { from: sq.clone(), to: sq.clone(), f0: 0, f1: 0 };
    let f0 = ARR[i] - 26, z = A.ropeZ;
    for (let it = 0; it < 3; it++) {
      probeCam(camAt(w, f0));
      z = A.ropeZ + 0.6;
      while (z < 2.3 && sx(new THREE.Vector3(sq.x, 0.75, z)) > -120) z += 0.02;
      f0 = Math.round(ARR[i] - ((z - A.ropeZ) / PACE[i]) * FPS);
    }
    return { from: new THREE.Vector3(sq.x, 0, z), to: sq.clone(), f0, f1: ARR[i] };
  });
  return plans;
};

// ---------------------------------------------------------------------------------------------------- the pull
/** H2 haul phases (labcommon h2Pullers) */
const H2PH = [0, 1, 2, 3, 4, 5].map((i) => (0.15 + i * 0.23) % 1);
/** haul cycle rate (cycles / s) while pulling; each person their own */
const RATE = [0.62, 0.7, 0.57, 0.74, 0.66, 0.6];
/** heave (line 06): each person's own rhythm and offset: neighbours roughly opposite */
const HFQ = [0.6, 0.71, 0.53, 0.77, 0.64, 0.45], HPH = [0.0, 0.5, 0.2, 0.82, 0.28, 0.17];
// (pullers 5 and 6 are timed so that around the "?" puller 5 is in a slack phase and puller 6 leans far back (his
// peak at f717, heaveSig >= .5 over f706-728): their heads then leave the gap where the researcher's face shows)
const heaveW = (f: number) => smooth((f - HEAVE0) / (HEAVE_FULL - HEAVE0)) * (1 - smooth((f - (RELAX0 - 6)) / 14));
const relaxW = (f: number) => smooth((f - RELAX0) / (RELAX1 - RELAX0));
/** heave swing of each person's effort (the haul lean is 14 + 16 x effort deg) */
const HEAVE_AMP = 0.68;
const heaveSig = (i: number, f: number) => Math.sin(2 * Math.PI * (HFQ[i] * (f - HEAVE0) / FPS + HPH[i]));
/** how many people really pull at f (for the per-person level) */
const groupLevel = (f: number) => {
  // each newcomer eases the others' lean down over 20 frames: alone .95, two .88, three .82, six .76
  const k = (at: number) => smooth((f - at) / 20);
  return 0.95 - 0.07 * k(pullStart(1)) - 0.06 * k(pullStart(2)) - 0.02 * k(pullStart(3)) - 0.02 * k(pullStart(4)) - 0.02 * k(pullStart(5));
};
const rateAt = (i: number, f: number) => (f < pullStart(i) ? 0 : RATE[i] * (1 - relaxW(f)));
/** haul phase: integrates the rate backwards from f770 so it lands exactly on the H2 phase */
const phaseAt = (i: number, f: number) => {
  let p = 0;
  for (let s = Math.max(f, pullStart(i)); s < F1; s++) p -= rateAt(i, s + 0.5) / FPS;
  return ((H2PH[i] + p) % 1 + 1) % 1;
};
const amountAt = (i: number, f: number) => {
  const ps = pullStart(i), ramp = smooth((f - ps) / 8);
  const steady = (0.4 + (groupLevel(f) - 0.4) * ramp) + 0.03 * Math.sin(f * 0.21 + i * 1.7);
  // the heave reads at phone size: a wide swing (lean ~11-33 deg, +-11 deg round the mean) and a shaped wave that dwells
  // near its ends (clearly forward or clearly back, quick through the middle), so neighbours read as out of step
  const sg = heaveSig(i, f), heave = 0.5 + HEAVE_AMP * Math.sign(sg) * Math.pow(Math.abs(sg), 0.7);
  return lerp(lerp(steady, heave, heaveW(f)), 0.15, relaxW(f));
};

// ---------------------------------------------------------------------------------------------------- the dial
/** total real force on the rope in dial units (one person's full solo pull = 16) */
const sp = (f: number, at: number) => spring((f - at) / FPS, { freq: 1.5, zeta: 0.7 });
const dialAt = (f: number) => {
  if (f >= F1) return H2_DIAL;
  const steady = 16 + 13 * sp(f, pullStart(1)) + 10 * sp(f, pullStart(2)) + 12 * sp(f, pullStart(3)) + 12 * sp(f, pullStart(4)) + 12 * sp(f, pullStart(5));
  // heave: the needle follows the six efforts (16 per full pull, mean .73 each -> ~70), relax: eased down to 20
  let heave = 0;
  for (let i = 0; i < 6; i++) heave += 16 * (0.73 + 0.24 * heaveSig(i, f));
  const v = lerp(steady, heave, heaveW(f));
  const end = easeInOutCubic(clamp01((f - RELAX0) / (762 - RELAX0)));
  const tremAmp = (1 - smooth((f - RELAX0) / 25)) * 1;
  const trem = tremAmp * (0.22 * Math.sin((2 * Math.PI * f) / 7.3) + 0.14 * Math.sin((2 * Math.PI * f) / 3.1 + 1.3) + 0.08 * Math.sin((2 * Math.PI * f) / 2.3 + 0.4));
  return lerp(v, H2_DIAL, end) + trem;
};

// ---------------------------------------------------------------------------------------------------- acting helpers
const exprAt = (f: number, keys: [number, Expr][]) => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** blink lid on crewPose's clock (t + 30) plus a blink across every swap in `keys` (none after f760, so the H2 frame
 *  blinks exactly like crewPose) */
const lid = (f: number, id: number, swaps: number[]) => lidAt(f / FPS + 30, id, swaps.filter((k) => k <= 760).map((k) => k / FPS + 30));
/** huff puffs at the given frames (each shows ~0.9 s) */
const huffAt = (f: number, times: number[]): Fx[] => {
  let last = -1e9; for (const k of times) if (k <= f) last = Math.max(last, k);
  return f - last < 27 ? [{ kind: "huff", t: (f - last) / FPS }] : [];
};
/** huff times: puller 1 alone every ~38 f, everyone every 40-55 f once they pull, and on heave peaks */
const HUFFS: number[][] = [0, 1, 2, 3, 4, 5].map((i) => {
  const out: number[] = [];
  let k = i === 0 ? 270 : pullStart(i) + 10;
  while (k < HEAVE0 - 10) { out.push(k); k += i === 0 && k < 430 ? 38 : 44 + ((i * 7) % 13); }
  // heave peaks of this person's rhythm (sin = 1), every other one
  for (let n = 0; n < 6; n++) { const pk = Math.round(HEAVE0 + ((n + 0.25 - HPH[i] + 1) % 6) / HFQ[i] * FPS); if (pk > HEAVE_FULL && pk < RELAX0 - 8 && (n + i) % 2 === 0) out.push(pk - 3); }
  return out.sort((a, b) => a - b);
});

function pullerState(w: World, i: number, f: number): BPuller {
  const P = walkPlans(w)[i];
  const ps = pullStart(i);
  // swaps (frames) for the blink bridge
  const swaps: number[] = [];
  if (i === 0) swaps.push(344, 372);
  else swaps.push(P.f1, ps);
  swaps.push(742 + ((i * 3) % 9));
  const blink = lid(f, 100 + i, swaps);
  if (i > 0) {
    if (f < P.f0) return { mode: "off" };
    if (f < P.f1) {
      const k = walkK((f - P.f0) / (P.f1 - P.f0));
      return { mode: "walk", from: P.from, to: P.to, k, expr: "neutral", blink };
    }
    const { turn: TURN, down: DOWN, lift: LIFT } = PICKT[i];
    if (f < P.f1 + TURN) return { mode: "turn", expr: "stern", blink };
    if (f < ps) {
      const down = smooth((f - (P.f1 + TURN - 1)) / DOWN), lift = smooth((f - (P.f1 + TURN + DOWN)) / LIFT);
      return { mode: "pick", down, lift, expr: "stern", blink };
    }
  }
  const amount = amountAt(i, f);
  const relaxed = f >= 742 + ((i * 3) % 9);
  let expr: Expr;
  if (relaxed) expr = "neutral";
  else if (heaveW(f) > 0.5) expr = amount > 0.62 ? "huff" : "stern";
  else if (i === 0) expr = exprAt(f, [[0, "huff"], [344, "pained"], [372, "huff"]]);
  else expr = "huff";
  return { mode: relaxW(f) > 0.5 ? "stand" : "pull", amount, phase: phaseAt(i, f), expr, fx: relaxed ? [] : huffAt(f, HUFFS[i]), blink };
}

// ---------------------------------------------------------------------------------------------------- the researcher
// She starts at R0, by window 1 between the gauge and square 1, 1.3 m back from the rope (from the opening camera her
// head sits clear to the right of puller 1's: at anchors.researcher, 0.38 m behind square 1, his leaning head covered
// hers from every camera-side view), reading the dial and writing. As the group grows she steps back along the window
// (never near the rope) to S2 (behind squares 4-5, near the window), the one place where the side camera sees her face
// between the heads of pullers 5 and 6, and watches the group from there (dial, notes, the out-of-step heave, the
// "?"). On the "?" she walks back to puller 1's side (anchors.researcher, the H2 spot: segC blindfolds puller 1 next)
// and stands there relaxed, facing square 1, by f766 (hidden behind puller 2's head from about f750, as in H2).
const R0: Vec3 = [-2.6, 0, -1.95];
const S2: Vec3 = [0.6, 0, -1.95];
/** her walks: R0 -> S2 (3.2 m along the window, ~1.3 m/s) and S2 -> anchor (frames) */
const W1: [number, number] = [446, 520], W2: [number, number] = [726, 768];
/** front drawing (clipboard and face read) facing the camera side at each spot */
const FACE_R0 = 1.0, FACE_S2 = 0.72;
type Gaze = "dial" | "write" | "left" | "crew" | "line" | "think";
const GAZE: [number, Gaze][] = [
  [0, "dial"], [300, "write"], [338, "dial"], [371, "write"], [400, "left"], [433, "dial"], [441, "write"],
  [W1[1], "left"], [536, "dial"], [546, "write"], [562, "left"], [590, "dial"], [598, "write"], [622, "crew"], [662, "line"], [684, "crew"], [Q_IN, "think"],
];
const GZ: Record<Gaze, { turn: -1 | 0 | 1; look: number; up: number }> = {
  dial: { turn: -1, look: -1, up: 0.55 }, write: { turn: 0, look: 0.15, up: -0.95 }, left: { turn: -1, look: -1, up: -0.25 },
  crew: { turn: -1, look: -0.9, up: -0.05 }, line: { turn: -1, look: -0.45, up: -0.15 }, think: { turn: 0, look: 0.35, up: 0.45 },
};
const RES_EX: [number, Expr][] = [[0, "neutral"], [300, "stern"], [338, "neutral"], [371, "stern"], [400, "neutral"], [441, "stern"], [W1[0], "neutral"],
  [546, "stern"], [562, "neutral"], [598, "stern"], [622, "neutral"], [662, "stern"], [Q_IN, "nervous"], [W2[0] + 14, "neutral"]];
/** view swaps (front <-> walk) also get a blink */
const RES_SWAPS = [...RES_EX.slice(1).map(([k]) => k), W1[1], W2[0]];
const gazeAt = (f: number) => { let g: Gaze = "dial", k0 = 0; for (const [k, x] of GAZE) if (f >= k) { g = x; k0 = k; } return { g, k0 }; };

function researcherState(w: World, f: number): FigState {
  const A = w.lab.A, t = f / FPS, anchor = A.researcher.clone(), s2 = new THREE.Vector3(...S2), r0 = new THREE.Vector3(...R0);
  const blink = lidAt(t + 30, 109, RES_SWAPS.filter((k) => k <= 760).map((k) => k / FPS + 30));
  const expr = exprAt(f, RES_EX);
  const think = spl([[Q_IN, 0], [Q_IN + 4, 15], [Q_IN + 8, 11], [W2[0] + 4, 9], [W2[0] + 14, 0]], f) * (f >= Q_IN ? 1 : 0);
  const walk = (from: THREE.Vector3, to: THREE.Vector3, w0: number, w1: number, ra = 0.25, rd = 0.32): FigState => {
    const T = w1 - w0, k = trap(f, w0, w1, Math.round(T * ra), Math.round(T * rd)), at = from.clone().lerp(to, k), dir = to.clone().sub(from), len = dir.length();
    dir.normalize();
    const cp = new THREE.Vector3().setFromMatrixPosition(w.camera.matrixWorld), toCam = Math.atan2(cp.x - at.x, cp.z - at.z);
    const cosA = Math.max(0.35, Math.abs(Math.cos(toCam) * dir.x - Math.sin(toCam) * dir.z));
    const phase = (((len * k * cosA) / WALK_CYCLE_M) % 1 + 1) % 1;
    return { at, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase, props: [null, "clipboard"], headTilt: think }, expr, blink, visible: true };
  };
  if (f >= W2[1]) {
    // H2: idle side drawing facing square 1, the clipboard at her side; the idle clock lands on t = 0 at f770
    return { at: anchor, facing: Math.atan2(A.positions[0].x - anchor.x, A.positions[0].z - anchor.z), pose: { kind: "idle", t: (f - F1) / FPS, props: [null, "clipboard"] }, expr, blink, visible: true };
  }
  if (f >= W2[0]) return walk(s2, anchor, W2[0], W2[1], 0.15, 0.2);
  if (f >= W1[0] && f < W1[1]) return walk(r0, s2, W1[0], W1[1]);
  const atS2 = f >= W1[1], at = atS2 ? s2 : r0;
  const { g, k0 } = gazeAt(f), G = GZ[g];
  // gaze eases over 5 frames from the previous key's values (pupils), the face turn switches at the key
  const prev = GAZE.filter(([k]) => k < k0).pop(), Gp = prev ? GZ[prev[1]] : G, e = smooth((f - k0) / 5);
  const look = lerp(Gp.look, G.look, e), lookUp = lerp(Gp.up, G.up, e);
  const writing = g === "write";
  // life: a slow head sway, a small nod per line she writes, the puzzled tilt on the "?"
  const sway = 1.4 * Math.sin(t * 1.3) + 0.6 * Math.sin(t * 2.9 + 1);
  const nod = writing ? 2.5 * Math.max(0, Math.sin((2 * Math.PI * 0.9 * (f - k0)) / FPS)) : 0;
  // arms (front view, on-card degrees): hand 1 (canvas right) holds the clipboard up in front of her, hand 0 the pen
  const sc = writing ? smooth((f - k0) / 4) : 0;
  const penDir = lerp(-78, -38, sc) + sc * 5 * Math.sin(2 * Math.PI * 2.6 * t);
  const penReach = lerp(0.5, 0.74, sc) + sc * 0.03 * Math.sin(2 * Math.PI * 1.9 * t + 1);
  const clipDir = -128 + 4 * sc + 2 * Math.sin(t * 1.7), clipReach = 0.62;
  return {
    at, facing: atS2 ? FACE_S2 : FACE_R0, view: "front",
    pose: { kind: "hold", t, aim: [{ dir: penDir, reach: penReach }, { dir: clipDir, reach: clipReach }], props: ["pen", "clipboard"], headTilt: sway - nod + think },
    expr, blink, look, lookUp, faceTurn: G.turn, visible: true,
  };
}

// ---------------------------------------------------------------------------------------------------- segment
let crew: Crew | null = null;
let pickRope: Rope | null = null;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter(w) {
    crew = acquireCrew(w);
    pickRope = w.lab.ropes.acquire({ radius: 0.016, gold: 0.55, seed: 6 });
  },
  exit(w) {
    releaseCrew(w, crew); crew = null;
    if (pickRope) w.lab.ropes.release(pickRope); pickRope = null;
  },
  pose(w, f) {
    const cam = camAt(w, f);
    w.setCamera(cam);
    const L = w.lab, A = L.A, c = crew!;
    L.set.setDial(dialAt(f));
    L.set.animate(f / FPS);
    L.set.setLight({ sun: 1, lamp: 1 });
    if (f >= F1) {
      // the H2 hand-off, drawn by labcommon itself
      crewPose(w, c, f, { pullers: h2Pullers(), researcher: H2_RESEARCHER(w) });
      hideRope(pickRope!); hideRope(c.behind);
      if (IP.dbg) debug(w, f, cam, null);
      return { scene: "lab", camera: cam };
    }
    const pullers = [0, 1, 2, 3, 4, 5].map((i) => pullerState(w, i, f));
    const info = crewB(w, c, pickRope!, f, { pullers, researcher: researcherState(w, f) });
    // overlays: the label card in the top band, the "?" over the researcher
    const ov: React.ReactNode[] = [];
    if (f >= CARD_IN && f <= CARD_OUT + 8) ov.push(h(PctCard, { key: "card", f, at: CARD_IN, out: CARD_OUT, title: "每人出力", rows: ROWS }));
    if (f >= Q_IN && f <= Q_OUT + 6) {
      const hw = c.res.headWorld(), q = w.project(V(hw.x, hw.y + c.res.headR + 0.2, hw.z));
      ov.push(h(Puzzle, { key: "q", f, at: Q_IN, out: Q_OUT, x: q.x + 18, y: q.y - 40 }));
    }
    if (IP.dbg) debug(w, f, cam, info);
    return { scene: "lab", camera: cam, overlays: ov.length ? ov : undefined };
  },
};

// ---------------------------------------------------------------------------------------------------- checks
function debug(w: World, f: number, cam: CamPose, info: ReturnType<typeof crewB> | null) {
  const L = w.lab, A = L.A, c = crew!, cols = L.set.objects.colliders;
  const pc = (v: THREE.Vector3) => { const q = w.project(v); return `${(q.x / 10.8).toFixed(0)}%,${(q.y / 19.2).toFixed(0)}%`; };
  const figs = [...c.pullers.map((p, i) => [`p${i + 1}`, p] as const), ["res", c.res] as const].filter(([, F]) => F.st.visible !== false);
  const heads = figs.map(([n, F]) => {
    const hw = F.headWorld(), q = w.project(hw), rpx = (F.headR / Math.max(0.01, q.z)) * 1920 / (2 * Math.tan((cam.fov * Math.PI) / 360));
    return { n, x: q.x, y: q.y, r: rpx, F };
  });
  const camPos = new THREE.Vector3(...(cam.pos as Vec3));
  const dHead = Math.min(...figs.map(([, F]) => F.headWorld().distanceTo(camPos)));
  const dProp = Math.min(...cols.map((b) => b.distanceToPoint(camPos)));
  // dial bezel top / sides on screen
  const bez = [...Array(16)].map((_, k) => { const a = (k / 16) * Math.PI * 2; return w.project(A.dialCentre.clone().add(V(0.03, A.dialBezelRadius * Math.sin(a), A.dialBezelRadius * Math.cos(a)))); });
  const bTop = Math.min(...bez.map((q) => q.y)), bL = Math.min(...bez.map((q) => q.x)), bR = Math.max(...bez.map((q) => q.x)), bBot = Math.max(...bez.map((q) => q.y));
  // card bottom (rows open)
  let cardB = -1;
  if (f >= CARD_IN && f <= CARD_OUT + 8) {
    const nOpen = ROWS.reduce((a, r) => a + pctRowOpen(f, r.at), 0);
    cardB = pctCardBottom(122, nOpen) + 12;
  }
  const overFace = cardB > 0 ? heads.filter((hd) => hd.y - hd.r < cardB && hd.x > PCT_CARD.x0 - hd.r && hd.x < PCT_CARD.x1 + hd.r).map((hd) => hd.n) : [];
  // ropes against the set and the bodies
  const ropes: [string, Rope][] = [["rope", c.rope], ["tail", c.tail], ["pick", pickRope!]];
  const rc = ropes.filter(([, r]) => r.points.length && r.points[0].y > -10).map(([n, r]) => { const k = r.clearance(cols); return `${n} ${r.length.toFixed(2)}m hits ${k.hits}`; });
  const rb = new THREE.Box3().setFromPoints(c.rope.points.filter((p) => p.x < A.positions[1].x + 0.1)).expandByScalar(0.016);
  const resRope = cardClearance(c.res, [rb], 48).hits;
  // the rope between two holders must not pass through a third body: min distance of rope points to each head
  let ropeHead = 9;
  for (const [, F] of figs) { const hw = F.headWorld(); for (const p of [...c.rope.points, ...c.tail.points]) ropeHead = Math.min(ropeHead, p.distanceTo(hw) - F.headR); }
  // feet on the floor
  const ank = figs.map(([, F]) => Math.min(F.ankleWorld(0).y, F.ankleWorld(1).y));
  // walkers: distance to the other figures (plan) and to the rope lying on the floor
  const walk = c.pullers.map((p, i) => [i, p] as const).filter(([, p]) => p.st.visible !== false && p.st.pose.kind === "walk").map(([i, p]) => {
    const at = p.st.at!;
    const dFig = Math.min(...figs.filter(([, F]) => F !== p).map(([, F]) => Math.hypot(F.st.at!.x - at.x, F.st.at!.z - at.z)));
    const dRope = Math.min(...c.tail.points.map((q) => Math.hypot(q.x - at.x, q.z - at.z)));
    return `w${i + 1} z ${at.z.toFixed(2)} dFig ${dFig.toFixed(2)} dRope ${dRope.toFixed(2)} x ${(w.project(V(at.x, 0.75, at.z)).x).toFixed(0)}px`;
  });
  // the researcher's face: clearance (px) of her head disc against the nearer pullers' head discs; her plan distance
  // to every holder's square and to the rope
  const rh = heads.find((hd) => hd.n === "res")!, rq = w.project(c.res.headWorld());
  const resGap = Math.min(...heads.filter((hd) => hd.n !== "res" && w.project(hd.F.headWorld()).z < rq.z).map((hd) => Math.hypot(hd.x - rh.x, hd.y - rh.y) - hd.r - rh.r));
  const ra = c.res.st.at!;
  const resSq = Math.min(...A.positions.map((q, i) => (c.pullers[i].st.visible === false ? 9 : Math.hypot(q.x - ra.x, q.z - ra.z))));
  const resRp = Math.min(...[...c.rope.points, ...c.tail.points].map((q) => Math.hypot(q.x - ra.x, q.z - ra.z)));
  const handZ = c.pullers.filter((p) => p.st.pose.kind === "haul").map((p) => `${(p.handWorld(1).z - A.ropeZ).toFixed(2)}/${(p.handWorld(0).z - A.ropeZ).toFixed(2)}@${p.handWorld(0).y.toFixed(2)}`);
  console.log(`[segB] f${f} cam (${(cam.pos as Vec3).map((v) => v.toFixed(2)).join(",")}) fov ${cam.fov.toFixed(1)} dHead ${dHead.toFixed(2)} dProp ${dProp.toFixed(2)} dial ${dialAt(f).toFixed(1)}`
    + ` | bezel top ${(bTop / 19.2).toFixed(1)}% x ${(bL / 10.8).toFixed(0)}-${(bR / 10.8).toFixed(0)}% bot ${(bBot / 19.2).toFixed(0)}% card bottom ${cardB > 0 ? (cardB / 19.2).toFixed(1) + "%" : "-"} overFace [${overFace.join(",")}]`
    + ` | heads ${heads.map((hd) => `${hd.n} ${(hd.x / 10.8).toFixed(0)},${(hd.y / 19.2).toFixed(0)} r${hd.r.toFixed(0)}`).join(" ")}`
  );
  console.log(`[segB2] f${f} ${rc.join("; ")} resVsRope ${resRope} ropeHeadGap ${ropeHead.toFixed(2)} ankles ${ank.map((a) => a.toFixed(2)).join(",")}`
  );
  console.log(`[segB3] f${f} handZ ${handZ.join(" ")} | ${walk.join("; ")}${info && info.picker >= 0 ? ` | pick p${info.picker + 1} gap ${info.pickGap.toFixed(3)} at ${info.pickPoint ? pc(info.pickPoint) + " y" + info.pickPoint.y.toFixed(2) : "-"}` : ""}`
    + ` | E ${pc(ropeEnd(w))}`);
  if (f < 300) console.log(`[segB4] plans ${walkPlans(w).slice(1).map((P, i) => `p${i + 2} z ${P.from.z.toFixed(2)} f${P.f0}-${P.f1}`).join("; ")}`);
  // every visible card against the set's solid boxes (穿模), and the researcher's head in world space
  const cardHits = figs.map(([n, F]) => { const k = cardClearance(F, cols, 32); return k.hits ? `${n}:${k.hits}(${k.worst.toFixed(3)})` : ""; }).filter(Boolean);
  const rhw = c.res.headWorld();
  console.log(`[segB5] f${f} res at ${ra.x.toFixed(2)},${ra.z.toFixed(2)} head (${rhw.x.toFixed(2)},${rhw.y.toFixed(2)},${rhw.z.toFixed(2)}) faceGap ${resGap.toFixed(0)}px dSq ${resSq.toFixed(2)} dRope ${resRp.toFixed(2)} cardHits [${cardHits.join(" ")}]`);
}
