// Segment A, dorm half: S01 (f0-124, the hook: 10 ropes, 3 drops) and S02 (f125-224, "我的朋友不会": the knot).
// Builder A's helper file (owned with shots/segA.ts). Pure functions of the frame; see story.ts "HOW TO BUILD A SEGMENT".
//
// S01  camera: TIGHT (behind + above YOU, roll 10 deg) -> WIDE, easeOutCubic f0-48 (fastest on f0), then a slow linear
//      push that keeps drifting through S02's first beat (f148). YOU at you0, back to camera, fists out, 10 gold ropes
//      coiled on the forearms fanning out to F1-F10. f0: every rope ~30 % into its snap -> twang (3 cycles / 10 f),
//      glint f6-18. One-way ropes rest unheld: S1 on the sill by F8 (back to you), S2 on bunk 4's first rung by F7,
//      S3 on F5's lap. Drops: S1 f60, S2 f70, S3 f80 (slide off, gravity, 2 bounces, grey f+0..4), YOUR head snaps toward
//      each, huff f100. Elsewhere ropes (thin gold, the friends' own): F8 -> out of the window, F7 -> F2, F5 -> F3.
//      Overlays: 你 tag (exits f112-118), rope counter 10 -> 7 (f63 / f73 / f83, red x on the slack ropes), exits f112.
// S02  f125-130 YOU turns to the camera, stern, huff f128; hauls the 3 slack ropes hand over hand (pulls ~f128, f140),
//      their ends slithering in over the floor; f146-160 steps to the ladder (side view); the camera swings down and
//      left to the ladder f148-162 (easeInOutQuad); tie: loop f164, loop f172, pull tight f184 (knot mesh); f186-192 a
//      step back, the 3 ropes snap taut and go gold again (twang f190); f194 / f202 dust-off claps, smug; the knot's
//      free tail lies over desk 1's end, slides off f205 and falls out of the frame bottom by f223 while the camera
//      tilts down after it (easeInQuad) -> match cut to S03's rope end falling onto the classroom desk.
import React from "react";
import * as THREE from "three";
import { getInputProps } from "remotion";
import type { CamPose, Pose, Vec3 } from "../story";
import { FPS, h, camMix, easeOutCubic, easeInOutQuad, easeInQuad, easeInOutCubic, lin, hash, add3, mix3, clamp01, smooth, lerp, between } from "../story";
import { LOOK, youTag, type World } from "../world";
import { lidAt, walkPhase, type Figure, type FigState } from "../kit/cast";
import { ropeMotion, ropeRadius, lieLength, freeEndAt, TAUT, type Rope, type RopePose } from "../kit/rope";
import type { Expr } from "../kit/toon";
import { RopeCounter } from "../kit/overlay";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const DBG = !!(getInputProps() as { dbg?: boolean }).dbg;

// ===================================================================================================================
// numbers
// ===================================================================================================================
const YOU0 = V(-0.3, 0.012, 0.8); // on the rug (top 0.012)
/** nominal fists (storyboard: you0.x +- 0.38, 1.15, 0.65); the arms aim at them, ropes start at the drawn hand tips */
const FIST: [THREE.Vector3, THREE.Vector3] = [V(-0.68, 1.12, 0.62), V(0.08, 1.12, 0.62)];
/** S01 cameras re-fitted for the 1.45 m cards: TIGHT behind + above YOU (roll +10 deg), WIDE from the door end with
 *  its look yawed right so YOU sits left of centre (storyboard: head x 40 %) and the right-hand friends clear the
 *  Douyin button column (x < 86 %) */
export const TIGHT: CamPose = { pos: [-0.3, 1.72, 2.1], look: [-0.27, 1.12, 0.5], fov: 68, roll: (10 * Math.PI) / 180 };
export const WIDE: CamPose = { pos: [-0.2, 2.2, 2.85], look: [0.1, 0.12, -1.8], fov: 70 };
/** S02's ladder camera: from the door end of the aisle at knot height, square to the YOU-post line, so the knot sits
 *  left of centre (x 23 %, y 49 %) and YOU (side view) right of it with the tying hand on the post */
export const LADDER: CamPose = { pos: [0.45, 1.05, 2.65], look: [-0.58, 0.92, 1.36], fov: 50 };
/** where the camera's look ends after the falling tail (f224): a short tilt, so the tail falls out of the bottom */
const TILT_LOOK: Vec3 = [-0.6, 0.86, 1.38];
/** where YOU stands to tie (aisle side of the post), the post, the three knot heights (between rungs .724-1.051) */
const TIE = V(-0.55, 0.012, 1.12);
const KNOT_Y = [0.79, 0.875, 0.96];
const POST_R = 0.018;

// ===================================================================================================================
// the ten friends
// ===================================================================================================================
type OneWay = { rest: Vec3 | "lap"; drop: number; floor: Vec3 };
type FriendSpec = {
  name: string; at?: Vec3; perch?: string; seat?: "desk4"; bed?: Vec3; facing?: number; seatAt?: Vec3;
  score: 3 | 4 | 5; expr: Expr; view?: "back" | "side" | "front";
  /** a one-way rope: its end rests here unheld, then drops at `drop` to `floor` */
  oneWay?: OneWay;
  /** force the hand that holds YOUR rope */
  arm?: 0 | 1;
};
const FRIENDS: FriendSpec[] = [
  { name: "F1", at: [-0.05, 0, -2.75], score: 5, expr: "smile" },
  { name: "F2", bed: [1.06, 1.775, -1.25], facing: Math.PI, arm: 1, score: 5, expr: "smile" },
  { name: "F3", at: [0.05, 0, -1.1], score: 4, expr: "smile" },
  { name: "F4", perch: "desk2Chair", score: 5, expr: "grin" },
  // F5 on desk 4's office chair, turned away from you to her desk (the chair back is on the aisle side), holding
  // F7's rope; YOUR rope's end rests on her lap
  { name: "F5", seat: "desk4", facing: Math.PI / 2 + 0.25, score: 3, expr: "neutral", oneWay: { rest: "lap", drop: 80, floor: [0.42, 0, -0.42] } },
  { name: "F6", at: [-0.62, 0, -1.5], arm: 1, score: 4, expr: "smile" },
  // F7 in front of bunk 4's ladder, facing it (looking up at F2); YOUR rope's end hangs over the 4th rung by the far
  // stile, above F5's head (from your fist that line clears desk 4's chair and the hoodie on it)
  { name: "F7", at: [0.55, 0, -1.65], facing: Math.PI / 2 - 0.25, view: "side", score: 3, expr: "neutral", oneWay: { rest: [0.8, 1.437, -1.93], drop: 70, floor: [0.5, 0, -2.0] } },
  // F8 on the sill (moved right, out from behind bunk 2's curtain), back to you, holding a rope out of the open window;
  // YOUR rope's end lies on the sill beside him
  { name: "F8", perch: "sill", seatAt: [-0.68, 0.9, -2.86], facing: Math.PI, view: "back", score: 4, expr: "neutral", oneWay: { rest: [-0.44, 0.9, -2.8], drop: 60, floor: [-0.4, 0, -2.42] } },
  { name: "F9", at: [0.45, 0, -2.8], score: 3, expr: "smile" },
  { name: "F10", at: [-0.26, 0, -1.9], score: 4, expr: "grin" },
];
const IDX = (n: string) => FRIENDS.findIndex((s) => s.name === n);

// ===================================================================================================================
// acquired state
// ===================================================================================================================
/** side = YOUR fist (0 = screen-left), k = index in that fist's bundle (coil offset), arm = the friend's hand on your rope */
type Held = { spec: FriendSpec; fig: Figure; rope: Rope; side: 0 | 1; k: number; gi: number; arm: 0 | 1 };
let you: Figure | null = null;
let held: Held[] = [];
/** elsewhere ropes: F8 -> outside, F7 -> F2, F5 -> F3 */
let eOut: Rope | null = null, eF7: Rope | null = null, eF5: Rope | null = null;
/** the knot's free tail (S02) */
let tail: Rope | null = null;
let SOLID: THREE.Box3[] = [];
let SOLID_N: { name: string; box: THREE.Box3 }[] = [];

const yawTo = (a: THREE.Vector3, b: THREE.Vector3) => Math.atan2(b.x - a.x, b.z - a.z);

/** a taut rope that grazes a thin member rests over it instead: one via on the box top for every solid box the
 *  straight a-b line passes through whose top is at most 0.15 m above the line (from the engine's worked example) */
function drape(a: THREE.Vector3, b: THREE.Vector3, r: number, boxes: THREE.Box3[]): THREE.Vector3[] {
  const out: { u: number; p: THREE.Vector3 }[] = [], ray = new THREE.Ray(), hit = V(), d = b.clone().sub(a), L = d.length();
  ray.set(a, d.clone().normalize());
  for (const bx of boxes) {
    const e = bx.clone().expandByScalar(r);
    if (!ray.intersectBox(e, hit)) continue;
    const u = hit.distanceTo(a) / L; if (u <= 0.02 || u >= 0.98) continue;
    const top = bx.max.y + r + 0.004, ly = a.y + d.y * u;
    if (top - ly > 0.15 || top < ly) continue;
    out.push({ u, p: V(hit.x, top, hit.z) });
  }
  return out.sort((x, y) => x.u - y.u).map((o) => o.p);
}
/** a rope into bunk 4 (R2, rail line x .85-.9) passes over the mattress frame's top edge / under the lower rail bar */
function intoBunk(a: THREE.Vector3, b: THREE.Vector3, r: number): THREE.Vector3[] {
  const x = 0.85 - r - 0.003, u = (x - a.x) / (b.x - a.x); if (!(u > 0 && u < 1)) return [];
  const p = a.clone().lerp(b, u), lo = 1.775 + r + 0.004;
  if (p.y < lo) return [V(x, lo, p.z)];
  if (p.y > 1.95 - r - 0.004 && p.y < 1.99 + r + 0.004) return [V(x, 1.95 - r - 0.006, p.z)];
  return [];
}

/** where friend s sits / stands */
function place(w: World, s: FriendSpec): { seat: { top: THREE.Vector3; front: number; back?: number } | null; facing: number; at: THREE.Vector3 | null; bed?: THREE.Vector3 } {
  const D = w.dorm;
  if (s.bed) return { seat: null, facing: s.facing ?? 0, at: null, bed: V(...s.bed) };
  if (s.seat === "desk4") {
    const top = D.A.desk4.clone().setY(0.48), f3 = D.perch("aisleR").pos;
    return { seat: { top, front: 0.27, back: 0 }, facing: s.facing ?? yawTo(top, f3), at: null };
  }
  if (s.perch) {
    const p = D.perch(s.perch);
    const facing = s.facing ?? (p.pose === "stand" ? yawTo(p.pos, YOU0) : p.facing);
    if (p.pose === "sit") return { seat: { top: s.seatAt ? V(...s.seatAt) : p.pos.clone(), front: p.front ?? 0.2, back: 0.03 }, facing, at: null };
    return { seat: null, facing, at: p.pos.clone() };
  }
  const at = V(...s.at!);
  return { seat: null, facing: s.facing ?? yawTo(at, YOU0), at };
}

// ===================================================================================================================
// camera
// ===================================================================================================================
const pushAt = (f: number): CamPose => {
  // after the pull-back: 0.25 m forward and 0.10 m down per 76 frames (storyboard f48-124), still drifting to f148
  const u = (Math.min(f, 148) - 48) / 76, p = WIDE.pos as Vec3, l = WIDE.look as Vec3;
  const fwd = V(l[0] - p[0], 0, l[2] - p[2]).normalize().multiplyScalar(0.25 * u);
  // the look drifts left as the camera closes in, so YOU hold x ~37 % instead of sliding toward the left edge
  return { pos: add3(p, [fwd.x, -0.1 * u, fwd.z]), look: add3(l, [fwd.x - 0.12 * u, -0.1 * u, fwd.z]), fov: WIDE.fov };
};
export const dormCam = (f: number): CamPose => {
  if (f <= 48) return camMix(TIGHT, WIDE, easeOutCubic(f / 48));
  if (f <= 148) return pushAt(f);
  if (f <= 162) return camMix(pushAt(148), LADDER, easeInOutQuad(lin(f, 148, 162)));
  if (f <= 205) {
    // a hair of drift so the hold is alive (2 cm toward the post)
    const u = lin(f, 162, 205);
    return { ...LADDER, pos: mix3(LADDER.pos, add3(LADDER.pos as Vec3, [-0.012, -0.004, -0.016]), u) };
  }
  const base = { ...LADDER, pos: add3(LADDER.pos as Vec3, [-0.012, -0.004, -0.016]) };
  const u = easeInQuad(lin(f, 205, 224));
  return { ...base, look: mix3(LADDER.look, TILT_LOOK, u), pos: add3(base.pos as Vec3, [0, -0.02 * u, 0]), fov: lerp(50, 46, u) };
};

// ===================================================================================================================
// YOU
// ===================================================================================================================
/** S01 head snaps toward each dropping rope (headTilt, back view: + = top toward canvas right) */
function headSnap(f: number): number {
  const hit = (at: number, deg: number) => { if (f < at) return 0; const t = (f - at) / FPS; return deg * Math.min(1, t / 0.07) * (0.55 + 0.45 * Math.exp(-t / 0.25)); };
  // S1 is screen-left (sill), S2 / S3 screen-right; each snap replaces the previous one
  if (f < 70) return hit(60, -16);
  if (f < 80) return lerp(-16 * 0.55, 0, clamp01((f - 70) / 3)) + hit(70, 15);
  if (f < 100) return lerp(15 * 0.55, 0, clamp01((f - 80) / 3)) + hit(80, 17);
  return lerp(17 * 0.55, 0, clamp01((f - 100) / 4));
}
/** S02's step back: straight away from the ladder camera, so YOU stay where they are in the frame */
const stepAway = () => TIE.clone().sub(V(...(LADDER.pos as Vec3))).setY(0).normalize();
type YouPlan = { st: FigState; coilArm: [0 | 1, 0 | 1]; view: "back" | "front" | "side" };
/** YOUR full state for frame f (S01 + S02). coilArm maps the bundle side (screen-left / right) to the arm index */
function youPlan(w: World, f: number, slackEnds: THREE.Vector3[]): YouPlan {
  const t = f / FPS, blink = lidAt(t, 1);
  if (f < 127) {
    // S01 + the start of the turn: back to camera, fists out
    const turn = f >= 125 ? (f - 125) / 2 : 0;
    const expr: Expr = f >= 100 ? "stern" : f >= 60 ? "shock" : "smug";
    const fx = f >= 100 && f < 124 ? [{ kind: "huff" as const, t: (f - 100) / FPS }] : [];
    return {
      st: { at: YOU0, floor: YOU0.y, facing: Math.PI + 0.25 * turn, pose: { kind: "hold", t, headTilt: headSnap(f), lean: -0.3 * headSnap(f) }, aimAt: [FIST[0], FIST[1]], expr, blink, view: "back", fx },
      coilArm: [0, 1], view: "back",
    };
  }
  if (f < 146) {
    // facing the camera, hauling the three slack ropes in (they trail behind you)
    const fx = f < 156 ? [{ kind: "huff" as const, t: (f - 128) / FPS }] : [];
    // hand over hand in front of the chest (two pulls, f128 and f140): one hand reaches up while the other pulls down
    const s = 0.5 - 0.5 * Math.cos(2 * Math.PI * clamp01((f - 127) / 24) * 2);
    const camYaw = yawTo(YOU0, V(...(WIDE.pos as Vec3)));
    const side = V(Math.cos(camYaw), 0, -Math.sin(camYaw)), fwd = V(Math.sin(camYaw), 0, Math.cos(camYaw));
    const hi = (k: number) => YOU0.clone().addScaledVector(side, k * 0.1).addScaledVector(fwd, 0.22).setY(1.12);
    const lo = (k: number) => YOU0.clone().addScaledVector(side, k * 0.2).addScaledVector(fwd, 0.12).setY(0.66);
    const hL = hi(-1).lerp(lo(-1), s), hR = lo(1).lerp(hi(1), s);
    return {
      st: { at: YOU0, floor: YOU0.y, facing: camYaw, pose: { kind: "hold", t, lean: -3 }, aimAt: [hL, hR], expr: "stern", blink, view: "front", fx },
      coilArm: [0, 1], view: "front",
    };
  }
  if (f < 160) {
    // one step to the ladder (side view)
    const u = smooth(lin(f, 146, 160)), at = YOU0.clone().lerp(TIE, u), dist = YOU0.distanceTo(TIE) * u;
    return {
      st: { at, floor: 0.012, facing: yawTo(YOU0, TIE), pose: { kind: "walk", phase: walkPhase(dist), t }, expr: "stern", blink, view: "side" },
      coilArm: [0, 1], view: "side",
    };
  }
  const post = w.dorm.marks.ladderPost.pos, facePost = yawTo(TIE, post);
  if (f < 192) {
    // tying (two loops round the post, pull tight), then a 0.2 m step back
    const back = smooth(lin(f, 186, 192)), away = stepAway();
    const at = TIE.clone().addScaledVector(away, 0.12 * back);
    const loopPh = f < 172 ? lin(f, 164, 172) : lin(f, 172, 180);
    const kn = V(post.x, KNOT_Y[1], post.z);
    const circ = f >= 164 && f < 180 ? V(Math.cos(loopPh * 2 * Math.PI) * 0.07, 0.03 * Math.sin(loopPh * 2 * Math.PI), Math.sin(loopPh * 2 * Math.PI) * 0.07) : V(0.05, 0, 0.02);
    const pull = f >= 180 ? smooth(lin(f, 180, 186)) : 0;
    const tieHand = kn.clone().add(circ).add(V(0.12 * pull, -0.05 * pull, -0.1 * pull));
    const coilAim = at.clone().add(V(Math.sin(facePost) * 0.25 - 0.05, 1.0, Math.cos(facePost) * 0.25 + 0.12));
    return {
      st: { at, floor: 0.012, facing: facePost, pose: { kind: "hold", t, lean: 4 }, aimAt: [coilAim, tieHand], expr: f >= 184 ? "stern" : "deadpan", blink, view: "side" },
      coilArm: [0, 0], view: "side",
    };
  }
  // dust-off claps (front view), smug
  const at = TIE.clone().addScaledVector(stepAway(), 0.12);
  return {
    st: { at, floor: 0.012, facing: yawTo(at, V(-0.12, 0, 2.5)), pose: { kind: "dust", t: (f - 192) / FPS + 0.2 }, expr: f >= 195 ? "smug" : "stern", blink, view: "front" },
    coilArm: [0, 1], view: "front",
  };
}

// ===================================================================================================================
// pose
// ===================================================================================================================
const coilOf = (Y: Figure, arm: 0 | 1, k: number) => ({ kind: "coil" as const, axis: Y.handWorld(arm).sub(Y.shoulderWorld(arm)).normalize(), offset: 0.02 * k, turns: 1.05, limbR: 0.011 });

export function poseDorm(w: World, f: number): Pose {
  const D = w.dorm, t = f / FPS;
  // a. camera first
  const cam = dormCam(f);
  w.setCamera(cam);
  // b. set state: evening default, balcony window slid open (rope routes need u >= .6)
  D.set.setLight("evening"); D.set.setWindowOpen(0.72); D.set.animate(t);
  const Y = you!;
  // the three slack ropes' far ends on the floor (S01 after the drops, hauled in S02)
  const slack = held.filter((hd) => hd.spec.oneWay).sort((a, b) => a.spec.oneWay!.drop - b.spec.oneWay!.drop);
  const slackEnds = slack.map((hd) => V(...hd.spec.oneWay!.floor));
  // c. people
  const plan = youPlan(w, f, slackEnds);
  Y.set(plan.st);
  const setFriends = (aim: (hd: Held) => THREE.Vector3) => {
    for (const hd of held) {
      const s = hd.spec, pl = place(w, s), a = aim(hd), blink = lidAt(t, 10 + hd.gi);
      let aimAt: [THREE.Vector3 | null, THREE.Vector3 | null] = s.oneWay ? [null, null] : hd.arm === 0 ? [a, null] : [null, a];
      // friends holding their own (elsewhere) ropes
      if (s.name === "F8") aimAt = [null, V(-0.42, 1.55, -3.2)];
      // F2 (lying, near arm 1 on your rope) reaches the far arm down to F7's rope
      if (s.name === "F2") aimAt = [V(0.62, 1.45, -1.6), a];
      // F5 <-> F7 (F7's far hand, F5's near hand): low, behind desk 4's chair
      if (s.name === "F5") aimAt = [null, V(0.6, 1.0, -1.45)];
      if (s.name === "F7") aimAt = [V(0.8, 1.0, -1.2), V(0.86, 1.95, -1.62)];
      const pose = { kind: (aimAt[0] || aimAt[1] ? "hold" : "idle") as "hold" | "idle", t: t + hash(hd.gi, 1) * 4, base: (pl.seat ? "seat" : "stand") as "seat" | "stand" };
      if (pl.bed) { hd.fig.set({ bed: { top: pl.bed }, facing: pl.facing, pose: { kind: "curl", amount: 0.35, t: t + hash(hd.gi, 1) * 4 }, aimAt, expr: s.expr, blink, clampYaw: 0.45 }); continue; }
      hd.fig.set({ ...(pl.seat ? { seat: pl.seat } : { at: pl.at! }), facing: pl.facing, pose, aimAt, expr: s.expr, blink, view: s.view, clampYaw: pl.seat ? 0.5 : undefined });
    }
  };
  setFriends((hd) => FIST[hd.side]);
  D.update(t);
  // which arm takes YOUR rope: the one on YOUR side of the screen (front views: arm 0 = canvas-left)
  const handOf = (side: 0 | 1) => Y.handWorld(plan.coilArm[side]);
  const fistScr = [w.project(handOf(0)), w.project(handOf(1))];
  for (const hd of held) { const hp = w.project(hd.fig.headWorld()); hd.arm = hd.spec.arm ?? (fistScr[hd.side].x < hp.x ? 0 : 1); }
  setFriends((hd) => handOf(hd.side));
  D.update(t);

  // e. ropes
  const post = D.marks.ladderPost.pos;
  const tied = f >= 160; // S02: the three slack ropes go to the knot post
  for (const hd of held) {
    const s = hd.spec, arm = plan.coilArm[hd.side], a = Y.handWorld(arm), r = hd.rope.r;
    const coil = coilOf(Y, arm, hd.k);
    const lag = Math.round(hash(hd.gi, 7) * 2);
    if (!s.oneWay) {
      // two-way: taut gold, twang on f0 (30 % into the snap), glint f6-18
      const b = hd.fig.handWorld(hd.arm), span = a.distanceTo(b);
      // F2's rope passes over desk 4's chair: a smaller snap so its sag never reaches the chair back
      const k0 = s.name === "F2" ? 0.025 : 0.06;
      const tw = ropeMotion.twang((f - lag) / FPS + 0.045, { from: k0 * span, pull: 0.15, amp: 0.022 * span, freq: 9, decay: 0.12 });
      const gp = (f - 6 - lag) / 12;
      const via = s.bed ? [...drape(a, b, r, SOLID), ...intoBunk(a, b, r)].sort((p, q) => q.z - p.z) : drape(a, b, r, SOLID);
      hd.rope.update({ a, b, via, slack: tw.slack, vib: tw.vib, vib2: tw.vib2, gold: 1,
        glint: gp >= 0 && gp <= 1 ? gp : -1, glintAmt: gp >= 0 && gp <= 1 ? Math.sin(Math.PI * gp) ** 0.5 : 0,
        attachA: coil, attachB: { kind: "hand", tail: 0.04 } });
      continue;
    }
    const ow = s.oneWay, floorPt = V(...ow.floor);
    const restPt = ow.rest === "lap" ? lapOf(hd.fig, r) : V(...ow.rest).add(V(0, r, 0));
    if (f < ow.drop) {
      // resting unheld (gold: you think it is held); twangs with the others on f0
      const span = a.distanceTo(restPt), tw = ropeMotion.twang((f - lag) / FPS + 0.045, { from: 0.06 * span, pull: 0.15, amp: 0.018 * span, freq: 9, decay: 0.12 });
      const gp = (f - 6 - lag) / 12;
      hd.rope.update({ a, b: restPt, via: drape(a, restPt, r, SOLID), slack: tw.slack, vib: tw.vib, vib2: tw.vib2, gold: 1,
        glint: gp >= 0 && gp <= 1 ? gp : -1, glintAmt: gp >= 0 && gp <= 1 ? Math.sin(Math.PI * gp) ** 0.5 : 0, attachA: coil, attachB: { kind: "end" } });
      continue;
    }
    const k = slack.indexOf(hd);
    if (!tied) {
      // the drop: slides off, falls under gravity, two bounces, lies on the floor; grey over 4 frames
      const td = (f - ow.drop) / FPS;
      const L0 = a.distanceTo(restPt) * (1 + TAUT), Llie = lieLength(a, floorPt, 0, r, 0.3);
      const bo = ropeMotion.boing(td, { to: Llie - L0, freq: 2.6, zeta: 0.3 }), dr = ropeMotion.drop(td, { dur: 0.28, bounce: 0.03 });
      let len = L0 + bo.slack, b = floorPt;
      if (f >= 126) {
        // S02 haul: the end slithers in over the floor toward you
        const hl = ropeMotion.haul((f - 126) / FPS, { dist: 1.0, pulls: 2, dur: 0.8 });
        len = Llie - hl.pulled * (0.9 + 0.1 * k);
        b = freeEndAt(a, floorPt, len, 0, r, 0.3);
      }
      const p: RopePose = f >= 126 ? { a, b, length: len, attachA: coil, attachB: { kind: "end" }, gold: 0 }
        : { a, b, bFrom: restPt, endT: dr.endT, endLift: dr.endLift, length: len, vib2: bo.vib2, attachA: coil, attachB: { kind: "end" }, gold: 1 - clamp01((f - ow.drop) / 4) };
      if (f >= 146) {
        // walking to the ladder: the ends drag behind you
        const lenW = Llie - 1.0 * (0.9 + 0.1 * k);
        p.b = freeEndAt(a, V(a.x, 0, a.z).add(V(0.25 - 0.2 * k, 0, -0.6)), lenW, 0, r, 0.3); p.length = lenW;
      }
      // S1's floor line passes the bucket by desk 2 until the haul drags the end past it
      // (it used to drape over the rim, but a slack rope across the open top sags into the bucket: it now touches down
      // on the floor right of the bucket, clear of the slippers beside it, and runs past it)
      if (s.name === "F8" && p.b.z < -0.3) p.via = [V(-0.33, r + 0.002, -0.17)];
      hd.rope.update(p);
      continue;
    }
    // tied to the ladder post: wraps grow f164-172 / f172-180, pulled tight f184, taut + gold again f186-190
    const kn = V(post.x, KNOT_Y[k], post.z);
    const toward = a.clone().sub(kn).setY(0).normalize();
    const turns = f < 164 ? 0.35 : f < 172 ? 0.35 + 0.65 * lin(f, 164, 172) : f < 180 ? 1 + lin(f, 172, 180) : 2;
    const sl = f < 184 ? 0.35 - 0.1 * lin(f, 164, 184) : 0.25 * (1 - smooth(lin(f, 184, 188)));
    const tw = f >= 188 ? ropeMotion.twang((f - 188) / FPS, { from: 0, amp: 0.015, freq: 8, decay: 0.12 }) : { slack: 0, vib: 0, vib2: 0, glint: -1, glintAmt: 0 };
    const gold = smooth(lin(f, 186, 190));
    hd.rope.update({ a, b: kn, slack: sl + tw.slack, vib: tw.vib, vib2: tw.vib2, glint: tw.glint, glintAmt: tw.glintAmt * gold, gold,
      attachA: coil, attachB: { kind: "knot", postR: POST_R, turns, tail: 0.03, front: toward.clone().add(V(0.3, 0, 0.5)).normalize() } });
  }

  // the elsewhere ropes (thin, gold, held at both ends by the friends)
  const F = (n: string) => held[IDX(n)];
  {
    const f8 = F("F8").fig, hnd = f8.handWorld(1);
    const win = D.A.window, [ox0, ox1] = win.openX(0.72), ap = V((ox0 + ox1) / 2 + 0.04, 1.62, win.z);
    eOut!.update({ a: hnd, b: V(ap.x + 0.5, 2.3, win.z - 4.5), via: [ap], gold: 1, attachA: { kind: "hand", tail: 0.035 }, attachB: { kind: "end" } });
    const f7 = F("F7").fig, f2 = F("F2").fig, h7 = f7.handWorld(1), h2 = f2.handWorld(0);
    eF7!.update({ a: h7, b: h2, via: intoBunk(h7, h2, eF7!.r), gold: 1, attachA: { kind: "hand", tail: 0.035 }, attachB: { kind: "hand", tail: 0.02 } });
    const f5 = F("F5").fig, h5 = f5.handWorld(1), h7b = f7.handWorld(0);
    eF5!.update({ a: h5, b: h7b, gold: 1, attachA: { kind: "hand", tail: 0.035 }, attachB: { kind: "hand", tail: 0.035 } });
  }

  // the knot's free tail (S02): over desk 1's end, slides off f205, falls out of the frame bottom
  if (f >= 180) {
    const kn = V(post.x - 0.012, KNOT_Y[0] - 0.035, post.z - 0.02);
    const corner = V(-0.872, 0.765 + tail!.r + 0.002, 1.418), tipOn = V(-1.06, 0.765 + tail!.r + 0.002, 1.2);
    const hang = V(-0.84, 0.035, 1.445);
    if (f < 205) {
      tail!.update({ a: kn, b: tipOn, via: [corner], gold: 1, attachA: { kind: "end" }, attachB: { kind: "end" } });
    } else {
      const sl = easeInQuad(lin(f, 205, 212)); // slides along the desk to the room-side edge
      const edge = V(-0.86, corner.y, 1.33);
      if (f < 212) {
        const tip = tipOn.clone().lerp(edge, sl);
        tail!.update({ a: kn, b: tip, via: [corner], gold: 1, attachA: { kind: "end" }, attachB: { kind: "end" } });
      } else {
        const td = (f - 212) / FPS, fall = clamp01(td / 0.36);
        const tip = V(lerp(edge.x, hang.x, easeOutCubic(fall)), lerp(edge.y, hang.y, fall * fall), lerp(edge.z, hang.z, easeOutCubic(fall)));
        tail!.update({ a: kn, b: tip, length: 0.72, vib2: 0.03 * Math.sin(td * 18) * Math.exp(-td * 4), gold: 1, attachA: { kind: "end" }, attachB: { kind: "end" } });
      }
    }
    tail!.mesh.visible = true;
  } else tail!.mesh.visible = false;

  // f. overlays: the 你 tag and the rope counter (0.35 m left of the tag), both leave f112-118
  const nodes: React.ReactNode[] = [];
  if (f < 124) {
    // the tag sits low over the hair in the tight opening (0.3 m would float it among the friends), 0.3 m in the wide
    const lift = lerp(0.06, 0.1, easeOutCubic(clamp01(f / 48)));
    nodes.push(youTag(w, Y, { f, out: 112, lift }));
    // the counter sits high on the left (storyboard f0 spot, 30 %, 12 %) and stays there: lower down it would cover
    // F8 on the sill / the faces round your head
    const cx = 0.3 * 1080, cy = 0.12 * 1920;
    // the red x on the visible part of each slack rope: clear of YOUR body and inside the frame
    const hs = w.project(Y.headWorld());
    // the three x's are placed together: each near 0.55 H on its own rope, at least 95 px apart (two of the slack ropes
    // run side by side right of you), never into the caption band (y > 61.5 %), never on you
    const cands = slack.map((hd) => {
      const out: { x: number; y: number; c: number }[] = [];
      for (let u = 0.04; u <= 0.7; u += 0.02) {
        const q = w.project(hd.rope.spanPointAt(u));
        const bad = (q.x < 0.08 * 1080 || q.x > 0.86 * 1080 ? 1e5 : 0) + (Math.abs(q.x - hs.x) < 150 && q.y > hs.y - 60 ? 1e5 : 0) + (q.y > 0.615 * 1920 ? 1e5 : 0);
        out.push({ x: q.x, y: q.y, c: bad + Math.abs(q.y - 0.55 * 1920) });
      }
      return out;
    });
    const clash = (a: { x: number; y: number }, b: { x: number; y: number }) => (Math.hypot(a.x - b.x, a.y - b.y) < 95 ? 1e4 : 0);
    let marks: { x: number; y: number }[] = [], bs = 1e12;
    const A0 = cands[0] ?? [], A1 = cands[1] ?? [{ x: -999, y: -999, c: 0 }], A2 = cands[2] ?? [{ x: -1999, y: -1999, c: 0 }];
    for (const a of A0) for (const b of A1) { const ab = a.c + b.c + clash(a, b); if (ab >= bs) continue;
      for (const c of A2) { const sc = ab + c.c + clash(a, c) + clash(b, c); if (sc < bs) { bs = sc; marks = [a, b, c].slice(0, slack.length).map((m) => ({ x: m.x, y: m.y })); } } }
    if (DBG && f === 90) console.log(`[segA f90] x marks ${marks.map((m) => `${Math.round(m.x)},${Math.round(m.y)}`).join(" | ")} score ${Math.round(bs)}`);
    nodes.push(h(RopeCounter, { key: "rc", at: -20, out: 112, drops: [63, 73, 83], x: cx, y: cy, scale: 0.72, marks }));
  }
  if (DBG && [0, 15, 48, 59, 62, 75, 90, 124, 140, 155, 170, 186, 200, 215, 224].includes(f)) debugDorm(w, f);
  return { scene: "dorm", camera: cam, overlays: h(React.Fragment, null, ...nodes.map((n, i) => (n ? h(React.Fragment, { key: i }, n) : null))),
    post: f >= 160 ? { dof: { focus: Math.max(0.6, w.camera.position.distanceTo(V(post.x, 0.87, post.z))), amount: 5 } } : undefined };
}

/** a point on the seated friend's drawn lap for a resting rope end: in the card plane, 60 % of the way from the hip
 *  toward the knee (above the ankle in a side view) and ON the thigh (hip height + the rope's radius + 2.5 cm), so the
 *  end rests above the chair seat instead of in it */
function lapOf(fig: Figure, r: number) {
  const hip = fig.hipWorld(), ank = fig.ankleWorld(1);
  return V(lerp(hip.x, ank.x, 0.6), hip.y + r + 0.025, lerp(hip.z, ank.z, 0.6));
}

/** dbg: projections of the key points and the 穿模 checks (ropes vs the dorm's solid colliders) */
function debugDorm(w: World, f: number) {
  const Y = you!, P = (v: THREE.Vector3) => { const q = w.project(v); return `(${Math.round((q.x / 1080) * 100)}%,${Math.round((q.y / 1920) * 100)}%)`; };
  console.log(`[segA f${f}] cam ${w.camera.position.toArray().map((v) => v.toFixed(2))} you head ${P(Y.headWorld())} hands ${P(Y.handWorld(0))} ${P(Y.handWorld(1))} view ${Y.sv?.view}`);
  const ropes: [string, Rope][] = [...held.map((hd) => [hd.spec.name, hd.rope] as [string, Rope]), ["eOut", eOut!], ["eF7", eF7!], ["eF5", eF5!], ["tail", tail!]];
  for (const [name, rp] of ropes) {
    if (!rp.mesh.visible) continue;
    const c = rp.clearance(SOLID), names = new Set<string>();
    if (c.hits) for (const q of rp.points) for (const k of SOLID_N) if (k.box.clone().expandByScalar(rp.r).containsPoint(q)) names.add(`${k.name}[${k.box.min.toArray().map((v) => v.toFixed(2))}..${k.box.max.toArray().map((v) => v.toFixed(2))}]`);
    const hd = held.find((x) => x.spec.name === name);
    console.log(`[segA f${f}] ${name}${hd ? ` head ${P(hd.fig.headWorld())} view ${hd.fig.sv?.view} arm ${hd.arm}` : ""} hits ${c.hits} worst ${(c.worst * 100).toFixed(1)}cm ${[...names].slice(0, 4).join(" ")}`);
  }
  // elsewhere ropes vs your ropes: closest approach (storyboard: never within 0.10 m)
  const mine = held.map((hd) => hd.rope);
  for (const [name, e] of [["eOut", eOut!], ["eF7", eF7!], ["eF5", eF5!]] as [string, Rope][]) {
    let best = 9, who = "";
    for (const m of mine) for (let i = 0; i < e.points.length; i += 3) for (let j = 0; j < m.points.length; j += 3) { const d = e.points[i].distanceTo(m.points[j]); if (d < best) { best = d; who = held[mine.indexOf(m)].spec.name; } }
    console.log(`[segA f${f}] ${name} closest to your rope ${who}: ${(best * 100).toFixed(1)} cm`);
  }
  if (f === 0) {
    const pts: [string, THREE.Vector3][] = [["post", w.dorm.marks.ladderPost.pos], ["desk1", w.dorm.A.desk1], ["desk4", w.dorm.A.desk4], ["TIE", TIE]];
    for (const [n, p] of pts) console.log(`[segA probe] ${n} ${p.toArray().map((v) => v.toFixed(3))}`);
    const near = (p: THREE.Vector3, r: number) => SOLID_N.filter((c) => c.box.distanceToPoint(p) < r).map((c) => `${c.name}[${c.box.min.toArray().map((v) => v.toFixed(2))}..${c.box.max.toArray().map((v) => v.toFixed(2))}]`);
    console.log(`[segA probe] near rung ${near(V(0.81, 0.37, -1.7), 0.12).join(" ")}`);
    console.log(`[segA probe] near TIE ${near(V(TIE.x, 0.6, TIE.z), 0.35).join(" ")}`);
    console.log(`[segA probe] near desk1 end ${near(V(-0.9, 0.76, 1.4), 0.12).join(" ")}`);
    console.log(`[segA probe] near LADDER cam ${near(V(...(LADDER.pos as Vec3)), 0.4).join(" ")}`);
    const zone = new THREE.Box3(V(-0.2, 0, -2.3), V(1.2, 0.5, 0.7));
    console.log(`[segA probe] low colliders right half ${SOLID_N.filter((c) => c.box.intersectsBox(zone)).map((c) => `${c.name}[${c.box.min.toArray().map((v) => v.toFixed(2))}..${c.box.max.toArray().map((v) => v.toFixed(2))}]`).join(" ")}`);
    console.log(`[segA probe] near desk1 chair / TIE path ${near(V(-0.45, 0.5, 1.0), 0.4).join(" ")}`);
  }
}

// ===================================================================================================================
// enter / exit
// ===================================================================================================================
export function enterDorm(w: World) {
  const D = w.dorm;
  SOLID_N = D.set.colliders.filter((c) => c.kind === "solid").map((c) => ({ name: c.name, box: c.box }));
  SOLID = SOLID_N.map((c) => c.box);
  you = D.actors.acquire(LOOK.you);
  let nl = 0, nr = 0;
  held = FRIENDS.map((s, k) => {
    const fig = D.actors.acquire(LOOK.friends[k]);
    const rope = D.ropes.acquire({ score: s.score, gold: 1, seed: 11 + k });
    const x = s.at ? s.at[0] : s.bed ? s.bed[0] : s.perch ? D.perch(s.perch).pos.x : s.seat === "desk4" ? D.A.desk4.x : 0;
    const side: 0 | 1 = x < YOU0.x ? 0 : 1;
    return { spec: s, fig, rope, side, k: side === 0 ? nl++ : nr++, gi: k, arm: 1 as 0 | 1 };
  });
  eOut = D.ropes.acquire({ score: 3, gold: 1, seed: 41 });
  eF7 = D.ropes.acquire({ score: 3, gold: 1, seed: 42 });
  eF5 = D.ropes.acquire({ score: 3, gold: 1, seed: 43 });
  tail = D.ropes.acquire({ score: 4, gold: 1, seed: 44 });
}
export function exitDorm(w: World) {
  const D = w.dorm;
  for (const hd of held) { D.actors.release(hd.fig); D.ropes.release(hd.rope); }
  if (you) D.actors.release(you);
  for (const r of [eOut, eF7, eF5, tail]) if (r) D.ropes.release(r);
  held = []; you = null; eOut = eF7 = eF5 = tail = null;
  D.set.setWindowOpen(0.385);
}
void ropeRadius; void between; void easeInOutCubic;
