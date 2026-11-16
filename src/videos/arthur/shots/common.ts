// The Arthur film's shared ACTION LIBRARY (engine-owned: segment builders import from it, never edit it; ask for a
// change in your report). Everything here is a pure function of its arguments: nothing keeps state between frames.
// All of it was tried with the real stone, sword and figures (preview/act_test.ts: stills of every recipe).
//
//   basics     V, v3, yawTo, lerpA, lid (blinks), speak (lip-sync of a Quote), accent (head accents by frame)
//   moving     walkAlong (a walker / runner on a floor path, feet planted), hopArc (a jump onto / off the stone)
//   the sword  tug (a two-handed heave that fails), pullOut (Arthur's one-handed draw; reversed = putting it back),
//              raise (the sword held up), carry (the sword in a walking / running hand), offer (held out, point up, to give)
//   bowing     kneel (the rig cannot kneel: this is the film's one way to show it, the same in every segment)
//   staging    SPOT (the marks at the stone), STAGE.putBack (the hook framing, used by A and again by C),
//              STAGE.field (Kay's mark at the tournament, used by B and by E's last shot), crowd() (who stands where in
//              the yard when everybody is there: D's last pull and all of E use the same layout)
//
// Conventions (group/kit/rig3d): metres, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x; the
// person's LEFT is +x when facing 0. arm 0 = the person's right hand (screen left when they face the camera), 1 = left.
import * as THREE from "three";
import { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd, type Rig, type RigState, type RigHead, type RigPose } from "../../group/kit/rig3d";
import { lidAt } from "../../group/kit/cast";
import { STONE } from "../props";
import { PEOPLE, type Person } from "../people";
import type { World } from "../world";
import { FPS, clamp01, lerp, smooth, hash, easeOutCubic, easeInOutCubic, type Quote, type V3Like, type CamPose, type Vec3 } from "../story";

export { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd };
export type { Rig, RigState, RigHead, RigPose };

// ------------------------------------------------------------------------------------------------------------ basics
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const v3 = (p: V3Like | readonly number[]) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));
/** the facing of someone at `from` who looks toward `to` */
export const yawTo = (from: V3Like | readonly number[], to: V3Like | readonly number[]) => { const a = v3(from), b = v3(to); return Math.atan2(b.x - a.x, b.z - a.z); };
const wrapA = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
/** angle a -> b the short way round */
export const lerpA = (a: number, b: number, t: number) => a + wrapA(b - a) * t;
/** eyelid for `blink:` (0 open, 0.5, 1 shut): 4-frame blinks every 2.2-4.4 s, different for every id; `swaps` =
 *  times (s) of expression changes to hide under a blink */
export const lid = (t: number, id: number, swaps: number[] = []) => lidAt(t, id, swaps);
/** A character's own quoted words, lip-synced: { mouth, head, blink } to spread into set({...}). f = the film frame,
 *  id = any number per speaker (it picks the mouth shapes and the lean; give every speaker of a chorus another id),
 *  stress = which syllables hit hardest (0-based). Outside the quote (+- a few frames) it returns {}. */
export const speak = (q: Quote, f: number, id = 0, stress?: number[]): { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } => {
  if (f < q.from - 6 || f > q.to + 10) return {};
  const sp = rigSpeak(f / FPS, { from: q.start, to: q.end, syl: q.syl, stress }, id);
  const out: { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } = {};
  if (sp.mouth) out.mouth = sp.mouth;
  if (sp.head) out.head = sp.head;
  if (sp.blink !== undefined) out.blink = sp.blink;
  return out;
};
/** a head accent that starts on film frame `at`: accent("jolt", f, 120). undefined before it and once it is over.
 *  kinds: pop, squash, nod, jolt, shake, laugh, lean (o.dur seconds for laugh / lean; o.dir 1 = screen right; o.amp) */
export const accent = (kind: Parameters<typeof rigHeadAccent>[0], f: number, at: number, o: Parameters<typeof rigHeadAccent>[2] = {}) => (f < at ? undefined : rigHeadAccent(kind, (f - at) / FPS, o));
/** several accents / heads added up (undefined ones are skipped) */
export const heads = (...hs: (RigHead | undefined)[]): RigHead | undefined => { const k = hs.filter(Boolean) as RigHead[]; return k.length ? rigHeadAdd(...k) : undefined; };

// ------------------------------------------------------------------------------------------------------------ moving
export type Leg = {
  /** where the walker is (floor point; y from the path) */ at: THREE.Vector3;
  /** which way it faces */ facing: number;
  /** the pose: walk while moving, idle before and after */ pose: RigPose;
  moving: boolean; arrived: boolean;
  /** metres walked, metres left */ d: number; left: number;
};
/** A walker (speed about 1.3) or a runner (2.6 - 3.6) on a path of floor points, t seconds after setting off. Feet
 *  stay planted (rigWalk). Before t = 0 it stands at the first point, after the last point it stands there (idle) and
 *  turns to o.endFacing within 5 frames. Corners are rounded over 0.25 m. o.startFacing = the facing while waiting. */
export const walkAlong = (pts: (V3Like | readonly number[])[], speed: number, t: number, o: { endFacing?: number; startFacing?: number; bounce?: number } = {}): Leg => {
  const P = pts.map(v3), seg: number[] = [], yaw: number[] = [];
  let L = 0;
  for (let i = 0; i + 1 < P.length; i++) { const d = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z); seg.push(d); L += d; yaw.push(Math.atan2(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z)); }
  const first = yaw[0] ?? 0, lastYaw = yaw[yaw.length - 1] ?? 0;
  if (t <= 0 || L === 0) return { at: P[0].clone(), facing: o.startFacing ?? first, pose: { kind: "idle", t }, moving: false, arrived: false, d: 0, left: L };
  const d = Math.min(L, speed * t);
  if (d >= L) {
    const ta = t - L / speed, end = o.endFacing ?? lastYaw;
    return { at: P[P.length - 1].clone(), facing: lerpA(lastYaw, end, smooth(ta / (5 / FPS))), pose: { kind: "idle", t: ta }, moving: false, arrived: true, d: L, left: 0 };
  }
  let acc = 0, i = 0;
  while (i < seg.length - 1 && acc + seg[i] < d) { acc += seg[i]; i++; }
  const u = seg[i] > 0 ? (d - acc) / seg[i] : 0, at = P[i].clone().lerp(P[i + 1], u);
  let facing = yaw[i];
  const R = 0.25;
  if (i > 0 && d - acc < R) facing = lerpA(yaw[i - 1], yaw[i], 0.5 + 0.5 * ((d - acc) / R));
  else if (i < seg.length - 1 && acc + seg[i] - d < R) facing = lerpA(yaw[i], yaw[i + 1], 0.5 - 0.5 * ((acc + seg[i] - d) / R));
  return { at, facing, pose: rigWalk(d, speed, o.bounce ?? 1), moving: true, arrived: false, d, left: L - d };
};
/** how long walkAlong needs for this path at this speed (s) */
export const walkTime = (pts: (V3Like | readonly number[])[], speed: number) => { const P = pts.map(v3); let L = 0; for (let i = 0; i + 1 < P.length; i++) L += Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z); return L / speed; };
/** a jump from a to b (u 0..1): the point on the arc, `hgt` above the straight line at the top. Use it for the step up
 *  onto the stone (0.36 high: hgt 0.22, about 7 frames) and the jump down. */
export const hopArc = (a: V3Like | readonly number[], b: V3Like | readonly number[], u: number, hgt = 0.22) => { const k = clamp01(u), p = v3(a).lerp(v3(b), k); p.y += hgt * 4 * k * (1 - k); return p; };

// --------------------------------------------------------------------------------------------------------- the stone
/** the marks at the stone (world; the stone stands at the origin, its top at y 0.36) */
export const SPOT = {
  /** two-handed heave from the right of the anvil (facing -PI/2 = toward -x), twist STONE.twistR */
  tugR: v3(STONE.standR), /** from the left (facing +PI/2), twist STONE.twistL */ tugL: v3(STONE.standL),
  /** one-handed draw, standing right of the sword (facing -PI/2, arm 0) / left of it (facing +PI/2, arm 1) */
  drawR: v3(STONE.drawR), drawL: v3(STONE.drawL),
  /** behind the sword, facing the camera, both hands on the grip */
  back: v3(STONE.standBack),
  /** where a puller waits before stepping up / lands after jumping down: on the paving right / left of the stone */
  stepR: V(1.25, 0, 0.25), stepL: V(-1.25, 0, 0.25),
};
type Extra = Partial<RigState>;
/** A two-handed heave at the sword that FAILS: the figure leans back in the haul pose with both hands pinned on the
 *  grip, the sword quivers a little and stays in. Sets the figure AND the sword (call before w.update()).
 *    side   "R" (default: right of the anvil, leaning right) | "L" (left of the anvil, leaning left) | "back" (behind
 *           the sword, facing the camera). All three show the face. Clean from cameras within about 25 degrees of
 *           straight on (x within about +-2 m at 4.5 m distance); from further round, check the still.
 *    t      seconds since this tug began (the heave cycle runs on it)
 *    effort 0..1 how hard (0.5 a try, 1 = everything: deeper lean, faster shake)
 *    extra  the rest of the state (expr, blink, head, gaze ...)
 *  Returns the wobble it used. Suggested faces: "focus" -> "huff" -> "pained" / "wince"; "dazed" when giving up.
 *  Known and accepted: the wide lords (cloak + belly) report qa.clear of about -0.02 .. -0.035 in this pose (the forearm
 *  brushes the belly); it does not show. Kay, Ector, Arthur and the commons are clean. */
export const tug = (w: World, r: Rig, o: { side?: "R" | "L" | "back"; t: number; effort?: number; extra?: Extra; twist?: number; out?: number }) => {
  const side = o.side ?? "R", e = clamp01(o.effort ?? 0.8), t = o.t;
  const shake = Math.sin(t * 38) * 0.012 * e + Math.sin(t * 61 + 1.3) * 0.006 * e;      // the grip quivers under the strain
  const heave = 0.5 + 0.5 * Math.sin(t * (5 + 4 * e));                                    // the body pumps
  const wob = side === "back" ? 0 : (side === "R" ? 1 : -1) * (0.012 * e * heave) + shake;
  w.stone.setStuck(0, wob);
  const g = w.stone.grip(0, wob), up = V(-Math.sin(wob), Math.cos(wob), 0);
  const hands: [THREE.Vector3, THREE.Vector3] = [g.clone().addScaledVector(up, -0.018), g.clone().addScaledVector(up, 0.018)];
  if (side === "back") r.set({ at: SPOT.back.clone(), facing: 0, pose: { kind: "idle", t }, hands, expr: "huff", head: { dy: -0.05 * e * heave, squash: 0.04 * e * heave }, visible: true, ...o.extra });
  else r.set({ at: (side === "R" ? SPOT.tugR : SPOT.tugL).clone().add(V((side === "R" ? 1 : -1) * (o.out ?? 0), 0, 0)), facing: side === "R" ? -Math.PI / 2 : Math.PI / 2, pose: { kind: "haul", t, amount: 0.55 + 0.3 * e + 0.05 * e * heave }, twist: o.twist ?? (side === "R" ? STONE.twistR : STONE.twistL), hands, expr: "huff", visible: true, ...o.extra });
  return wob;
};
/** where the raised sword's hand is for a figure standing at `at` (facing the camera): beside the head, arm 0 = screen
 *  left of the head, arm 1 = screen right */
export const raisePoint = (at: THREE.Vector3, arm: 0 | 1 = 0) => at.clone().add(V(arm ? 0.34 : -0.34, 1.25, 0.08));
/** Arthur's pull: ONE hand, no effort. u 0 -> 1 runs the whole move from the mark SPOT.drawR (or drawL):
 *    u 0 .. 0.55   the hand closes on the grip and the sword slides up out of the anvil (side-on, looking at it)
 *    u 0.55 .. 1   he turns to the camera and swings it up beside his head (the pose of raise())
 *  Run u backwards (1 -> 0) to PUT IT BACK. Sets the figure AND the sword; call it before w.update() and call
 *  pullOutAfter(w, r, u, side) after w.update() (the free sword follows the solved hand).
 *    side "R" (default; arm 0, the far hand) | "L" (arm 1).  extra = expr, blink, head ...  t = seconds for the idle sway. */
export const pullOut = (w: World, r: Rig, u: number, o: { side?: "R" | "L"; t?: number; extra?: Extra } = {}) => {
  const side = o.side ?? "R", arm: 0 | 1 = side === "R" ? 0 : 1, at = (side === "R" ? SPOT.drawR : SPOT.drawL).clone();
  const k = clamp01(u / 0.55), v = easeInOutCubic(clamp01((u - 0.55) / 0.45)), ks = smooth(k);
  const f0 = side === "R" ? -Math.PI / 2 : Math.PI / 2;
  const hand = w.stone.grip(ks).lerp(raisePoint(at, arm), v);
  const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null]; hands[arm] = hand;
  r.set({ at, facing: lerpA(f0, 0, v), pose: v > 0.02 ? { kind: "cheer", t: o.t ?? 0, amount: 0 } : { kind: "idle", t: o.t ?? 0 }, hands, visible: true, ...o.extra });
  if (v <= 0) w.stone.setStuck(ks, 0);
};
/** second half of pullOut: after w.update(), puts the free sword into the solved hand (nothing to do while u <= 0.55) */
export const pullOutAfter = (w: World, r: Rig, u: number, side: "R" | "L" = "R") => {
  const v = easeInOutCubic(clamp01((u - 0.55) / 0.45));
  if (v <= 0) return;
  const arm: 0 | 1 = side === "R" ? 0 : 1, lean = (arm ? -0.27 : 0.27) * v;
  w.stone.setFree(r.handWorld(arm), V(lean, -1, 0));
};
/** The sword held up in triumph (figure facing the camera, pose cheer amount 0, one hand beside the head). Sets the
 *  figure; call raiseAfter after w.update(). pump 0..1 lifts the hand a little more (a beat on a word). */
export const raise = (r: Rig, at: THREE.Vector3, o: { arm?: 0 | 1; t?: number; facing?: number; pump?: number; extra?: Extra } = {}) => {
  const arm = o.arm ?? 0, hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
  hands[arm] = raisePoint(at, arm).add(V(0, 0.05 * (o.pump ?? 0), 0));
  r.set({ at: at.clone(), facing: o.facing ?? 0, pose: { kind: "cheer", t: o.t ?? 0, amount: 0 }, hands, expr: "grin", visible: true, ...o.extra });
};
export const raiseAfter = (w: World, r: Rig, arm: 0 | 1 = 0, lean?: number) => w.stone.setFree(r.handWorld(arm), V(lean ?? (arm ? -0.27 : 0.27), -1, 0));
/** The sword in the hand of someone who walks / runs / stands (the hand is NOT pinned: it swings with the walk).
 *  Call after w.update(). The blade trails back and down behind the hand, clear of the ground. arm 0 by default.
 *  facing = the carrier's facing (the blade trails opposite to it). */
export const carry = (w: World, r: Rig, facing: number, arm: 0 | 1 = 0, droop = 0.57) => {
  const fx = Math.sin(facing), fz = Math.cos(facing);
  w.stone.setFree(r.handWorld(arm), V(fx * 0.82, droop, fz * 0.82), V(-fz, 0, fx).multiplyScalar(arm ? -1 : 1).add(V(0, 0, 0.4)));
};
/** The sword held out to someone, point UP, hilt at chest height (figure roughly facing the taker or the camera).
 *  Before w.update(): pin the hand yourself, e.g. hands[arm] = offerPoint(at, dir). After w.update(): offer(w, r, arm, dir).
 *  dir = which way the taker is on screen-x (1 = +x, -1 = -x): the blade leans a little that way. The taker then
 *  closes a hand on the same grip (pin the taker's hand at r.handWorld(arm) on the hand-over frame) and from the next
 *  frame the sword follows the taker's hand (raiseAfter / carry). */
export const offerPoint = (at: THREE.Vector3, dir: 1 | -1) => at.clone().add(V(dir * 0.3, 0.95, 0.16));
export const offer = (w: World, r: Rig, arm: 0 | 1, dir: 1 | -1, lean = 0.22) => w.stone.setFree(r.handWorld(arm), V(-dir * lean, -1, 0), V(0, 0, 1));

// ------------------------------------------------------------------------------------------------------------ bowing
/** KNEELING, the film's way (the rig has no kneel pose): the figure sinks straight down by `k` x KNEEL_DROP so the shins
 *  disappear into the snow / grass, the head bows. k 0 = standing .. 1 = down. Spread the result over your state:
 *      r.set({ at, facing, pose: { kind: "idle", t }, ...kneel(k, at), visible: true })   (it replaces `at`)
 *  It reads as kneeling in medium and wide shots (tried on the whole crowd from STAGE.yardWide); do not show the feet
 *  of a kneeler in close-up. Add your own face (eyes shut: blink 1, or "relief") on the way down. */
export const KNEEL_DROP = 0.38;
export const kneel = (k: number, at: THREE.Vector3, bow = 30): Extra => {
  const e = clamp01(k);
  return { at: at.clone().add(V(0, -KNEEL_DROP * e, 0)), lookDown: bow * e, head: e > 0 ? { dy: -0.2 * e } : undefined };
};
/** a standing bow of the head (Ector and Kay to Arthur): spread over the state. k 0..1 */
export const bow = (k: number, deg = 26): Extra => ({ lookDown: deg * clamp01(k), head: { dy: -0.12 * clamp01(k) } });

// ----------------------------------------------------------------------------------------------------------- staging
export const cam = (pos: Vec3, look: Vec3, fov: number): CamPose => ({ pos, look, fov });
/** shared framings and marks, so that shots built by different people match */
export const STAGE = {
  /** THE HOOK: Arthur on the stone at SPOT.drawR sliding the sword back in; Ector (screen left) and Kay (screen right)
   *  stand just BEHIND the stone, watching (a 9:16 frame is only about 2 m wide at the stone: beside it they would be
   *  out of frame). Segment A opens on exactly this; segment C arrives at it again (line 12-13) for the real moment. */
  putBack: {
    cam: cam([0.1, 1.38, 4.6], [0.05, 0.98, 0], 40),
    ector: { at: V(-0.86, 0, -0.95), facing: 0.35 },
    kay: { at: V(0.95, 0, -1.0), facing: -0.3 },
  },
  /** the tournament edge: Kay on his mark with Arthur beside him (B opens here; E's last shot snaps back to it) */
  field: {
    cam: cam([-17.55, 1.35, 6.1], [-17.6, 1.0, 2.6], 40),
    kay: { at: V(-18.0, 0, 2.6), facing: 0.15 },
    arthur: { at: V(-17.05, 0, 2.75), facing: -0.25 },
  },
  /** the wide view of the yard for everybody-is-here shots (crowd()) */
  yardWide: cam([0.1, 2.5, 8.4], [0, 1.0, -0.9], 40),
};
export type Spot = { who: Person; key: string; at: THREE.Vector3; facing: number; row: number; id: number; kind: "lord" | "commoner" | "ector" | "kay" | "guard" };
/** WHO STANDS WHERE when the whole town is in the yard (D's sixth pull, all of E). Nobody stands between the camera
 *  and the stone: Ector and Kay beside the stone on the LEFT (screen left), the lords in rows behind them, the commons
 *  on the RIGHT and along the back, two guards at the far back. Everybody faces the stone. The layout is fixed (no
 *  randomness): the same figure is on the same mark in every shot. row 0 = nearest the stone .. 5 = the far back (use
 *  it to run a wave outward). lords / commons / guards limit how many come (8 / 16 / 2). */
export const crowd = (o: { lords?: number; commons?: number; guards?: number } = {}): Spot[] => {
  const out: Spot[] = [], stone = V(0, 0, 0);
  const put = (who: Person, key: string, x: number, z: number, row: number, kind: Spot["kind"]) => { const at = V(x, 0, z); out.push({ who, key, at, facing: yawTo(at, stone) * 0.55, row, id: out.length + 3, kind }); };
  const nl = o.lords ?? 8, nc = o.commons ?? 16, ng = o.guards ?? 2;
  // A 9:16 frame is narrow: from STAGE.yardWide the picture is only +-1.6 m wide at the stone and +-2.4 m at the back
  // row, so the crowd stands in staggered rows BEHIND and beside the stone, lords on the left, commons on the right,
  // and nobody directly behind Arthur (|x| < 0.6 stays free in the first rows).
  put(PEOPLE.ector, "", -1.3, 0.45, 0, "ector");
  put(PEOPLE.kay, "", -1.5, -0.45, 0, "kay");
  const LX: [number, number][] = [[-1.15, -1.3], [-1.85, -1.3], [-0.75, -2.1], [-1.4, -2.1], [-2.05, -2.1], [-0.9, -2.9], [-1.55, -2.9], [-2.2, -2.9]];
  for (let i = 0; i < Math.min(nl, LX.length); i++) put(PEOPLE.lord(i), "", LX[i][0], LX[i][1], LX[i][1] < -1.7 ? (LX[i][1] < -2.5 ? 3 : 2) : 1, "lord");
  const CX: [number, number][] = [[1.3, 0.45], [1.5, -0.45], [1.15, -1.3], [1.85, -1.3], [0.75, -2.1], [1.4, -2.1], [2.05, -2.1], [0.9, -2.9], [1.55, -2.9], [2.2, -2.9],
    [0.7, -3.7], [1.35, -3.7], [2.0, -3.7], [-0.6, -3.7], [-1.25, -3.7], [-1.9, -3.7]];
  for (let i = 0; i < Math.min(nc, CX.length); i++) put(PEOPLE.commoner(i), "", CX[i][0], CX[i][1], CX[i][1] > -0.9 ? 0 : CX[i][1] > -1.7 ? 1 : CX[i][1] > -2.5 ? 2 : CX[i][1] > -3.3 ? 3 : 4, "commoner");
  const GX: [number, number][] = [[-2.55, -4.4], [2.65, -4.4]];
  for (let i = 0; i < Math.min(ng, GX.length); i++) put(PEOPLE.guard(i), "", GX[i][0], GX[i][1], 5, "guard");
  return out;
};
/** a per-figure delay in frames so a crowd does not move as one block: spread 0 .. `max`, fixed per id */
export const stagger = (id: number, max = 6, k = 0) => Math.floor(hash(id, 17 + k) * (max + 1));
/** a crowd member's idle life: a little sway of the gaze and a blink, different per id. Spread over the state. */
export const alive = (t: number, id: number): Extra => ({ blink: lid(t, id), gaze: [0, 0, 0.5, 0, -0.5, 0][Math.floor(t * 0.9 + hash(id, 3) * 6) % 6] });

export { STONE, PEOPLE, FPS, lerp, clamp01, smooth, easeOutCubic };
