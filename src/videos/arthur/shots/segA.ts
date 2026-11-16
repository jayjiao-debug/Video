// Segment A, frames 0-451 (narration lines 1-5): the hook, "wait, what?", the stone drops into the yard, the gold
// letters, the lords queue up, strain and fail. Season 0 (snow) throughout.
//
//   0-82     HOOK      Arthur on the stone holds the shining sword up, brings it down and slides it BACK into the anvil
//                      (home f66: burst + camera kick), lets go and dusts his hands; Ector and Kay behind the stone go
//                      from delight to shock ("!?" over Kay, Ector points at the sword).
//   83-143   WHAT      hard cut closer: "?" over the hilt; Kay and Ector lean in from the frame edges; on 国王 (f112) a
//                      crown pops over Arthur's head and hovers; he looks up at it and shrugs.
//   144-282  YARD      hard cut: the yard WITHOUT the stone; tilt down from the round window; two neighbours walk in from
//                      the back, a third crosses far behind; they wave at each other across the paved circle; the stone
//                      DROPS between them (lands f232: kick, burst, a puff of snow), they jump back; fast push-in to
//                      the sword (one glint), the woman leans in from the edge, eyes wide.
//   283-356  LETTERS   hard cut: the whole stone, the gold letters light up; tilt up + push in to the hilt between the two
//                      neighbours' heads; the crown pops over the pommel (f330), he points at it, she gasps.
//   357-391  QUEUE     hard cut wide: lord 0 heaves at the sword, three lords queue on the right (one points, two hop to see).
//   392-420  RED       three jump cuts, one lord each (1, 3, 2), close on the straining face: flush + sweat.
//   421-435  STILL     close on the hilt: two shaking fists, the sword does not move.
//   436-451  PANT      wide: four lords bent over panting round the stone, the sword glints untouched. Hard cut to B.
//
// Framing note: wherever the stone's front face is in the picture it sits above y 60 % (the cameras look LOW, at about
// y 0.3, so the figures fill the top half and the caption lies on plain snow); in the close shots it is out of frame.
import React from "react";
import * as THREE from "three";
import { SEGMENTS, FPS, h, lin, lerp, smooth, clamp01, spl, camMix, hash, easeOutQuad, easeInQuad, easeOutCubic, easeInOutCubic, easeOutBack, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import { COVER_OV, type World } from "../world";
import { TXT, TAG_X } from "../lang";
import { PEOPLE, type Person } from "../people";
import { V, yawTo, lerpA, lid, accent, heads, walkAlong, walkTime, hopArc, SPOT, STAGE, tug, pullOut, pullOutAfter, bow, cam, type Rig, type RigState, type RigHead } from "./common";
import { Mark, Burst, Crown, Flush } from "../overlay";
import { CornerTag } from "../../group/kit/overlay";
import { Glint, Sweat, Strain } from "./segA_ov";

const S = SEGMENTS[0];

// ============================================================================================================ timing
// captions: 他把刚拔出来的【石中剑】 0 · 又【插了回去】 55 · 等等 83 · 拔出来不就是【国王】吗？ 94 · 名著《亚瑟王之死》里 146 ·
// 伦敦教堂院子里 190 · 多了块【大石头】 228 · 插着把剑 261 · 【金字】写着 284 · 谁拔出来 306 · 谁就是【国王】 328 ·
// 【贵族】排队来拔 357 · 脸都憋红了 392 · 剑【一动不动】 421-449
const T = {
  // HOOK
  lower0: 18, lower1: 46, flip0: 39, flip1: 50, slide0: 55, home: 66, letGo: 68, dust: 72,
  // WHAT
  what: 83, kayIn: 96, ectorIn: 103, crown: 112, shrug: 126,
  // YARD
  yard: 144, tag1: 150, tag2: 192, arriveA: 201, arriveC: 211, fall0: 225, land: 232, push0: 253, push1: 264, glint: 265,
  // LETTERS
  letters: 283, glow: 284, tilt0: 300, tilt1: 310, crown2: 330,
  // LORDS
  queue: 357, red1: 392, red2: 402, red3: 411, still: 421, pant: 436,
};

// ============================================================================================================ helpers
type Expr = NonNullable<RigState["expr"]>;
type Extra = Partial<RigState>;
const arr = (v: CamPose["pos"]): Vec3 => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
/** eased keyframes */
const kf = (f: number, keys: [number, number][]) => spl(keys, f, smooth);
function at<X>(f: number, keys: [number, X][]): X { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; }
/** frames (as seconds) of the expression swaps, for lid() to blink across them */
const swaps = (keys: [number, unknown][]) => keys.slice(1).map(([k]) => k / FPS);
/** a point given in a standing figure's own frame: x = to its left, y up from its feet, z = forward */
const rel = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => p.clone().add(V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z));
/** where an idle figure's hand hangs (measured), to start a pinned gesture from */
const hang = (p: THREE.Vector3, facing: number, arm: 0 | 1) => rel(p, facing, arm ? 0.172 : -0.172, 0.58, 0.035);
const mixV = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);
/** a camera kick: 3 frames, straight down and back (never a roll) */
const kick = (c: CamPose, f: number, on: number, amp = 0.045): CamPose => {
  const k = [1, -0.55, 0.2][f - on];
  if (k === undefined) return c;
  const p = arr(c.pos), l = arr(c.look);
  return { ...c, pos: [p[0], p[1] - amp * k, p[2]], look: [l[0], l[1] - amp * k, l[2]] };
};
const _right = new THREE.Vector3();
/** a head on screen: centre and the px length of 0.2 m at its depth (Flush / Sweat / marks) */
const headPx = (w: World, r: Rig) => {
  const c = r.headWorld(), p = w.project(c);
  _right.setFromMatrixColumn(w.camera.matrixWorld, 0);
  const q = w.project(c.clone().addScaledVector(_right, 0.2));
  return { x: p.x, y: p.y, r: Math.hypot(q.x - p.x, q.y - p.y) };
};
const frag = (...kids: React.ReactNode[]) => h(React.Fragment, null, ...kids);
/** inverse of smoothstep (pullOut eases its own u with smooth(): this undoes it where a move must NOT ease out) */
const invSmooth = (y: number) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);

// ============================================================================================================ own props
// a puff of snow where the stone lands: a ring of soft white blobs that roll outward and shrink
const PUFFS = 12;
let puffs: THREE.Group | null = null;
function buildPuffs(w: World) {
  if (puffs) return;
  puffs = new THREE.Group(); puffs.name = "segA-puffs"; puffs.visible = false;
  const geo = new THREE.IcosahedronGeometry(1, 2), mat = w.M.paint({ color: "#f3f7ff", roughness: 0.95 });
  for (let i = 0; i < PUFFS; i++) { const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.receiveShadow = false; puffs.add(m); }
  w.root.add(puffs);
}
/** t = seconds since the landing; hidden before it and after 0.6 s */
function posePuffs(t: number) {
  if (!puffs) return;
  if (t < 0 || t > 0.62) { puffs.visible = false; return; }
  puffs.visible = true;
  const u = t / 0.62, out = 1 - Math.pow(1 - u, 2.2);
  puffs.children.forEach((m, i) => {
    // start points round the foot of the block (1.5 x 1.0), mostly along the front and the two ends
    const sd = i % 2 ? 1 : -1, a = (sd > 0 ? 0 : Math.PI) + (((i >> 1) + 0.5) / (PUFFS / 2) - 0.5) * 1.9, c = Math.cos(a), s = Math.sin(a);
    const ex = 0.8 / Math.max(1e-3, Math.abs(c)), ez = 0.56 / Math.max(1e-3, Math.abs(s)), r0 = Math.min(ex, ez);
    const r = r0 + (0.2 + 0.45 * hash(i, 5)) * out, size = (0.07 + 0.06 * hash(i, 7)) * Math.sin(Math.PI * Math.pow(u, 0.6)) * (1 - 0.35 * u);
    m.position.set(c * r, 0.04 + size * 0.6 + 0.3 * out * hash(i, 11), s * r);
    m.scale.set(size * 1.35, size, size * 1.35);
    m.visible = size > 0.01;
  });
}

// ============================================================================================================ 0-82 HOOK
const HOOK0 = cam([0.1, 1.45, 6.0], [0.05, 0.34, 0], 40), HOOK1 = cam([0.1, 1.4, 4.8], [0.05, 0.22, 0], 40);
function shotHook(w: World, f: number): Pose {
  const t = f / FPS, P = STAGE.putBack;
  const c = kick(camMix(HOOK0, HOOK1, easeOutQuad(lin(f, -8, 80))), f, T.home, 0.05);
  w.setCamera(c);
  const A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector), K = w.actor(PEOPLE.kay);

  // ---- Arthur: sword up -> down beside him (u 1 -> 0.55) -> a breath over the slot -> slides home (f66) -> lets go, dusts his hands
  const aKeys: [number, Expr][] = [[0, "grin"], [T.lower0 + 4, "smile"], [T.lower1 - 2, "focus"], [T.home + 1, "smile"], [T.dust + 2, "smug"]];
  const blink = lid(t, 1, swaps(aKeys));
  let u = 1;
  if (f >= T.lower0) u = lerp(1, 0.55, easeInOutCubic(lin(f, T.lower0, T.lower1)));
  if (f >= T.slide0) u = 0.55 * invSmooth(1 - easeInQuad(lin(f, T.slide0, T.home)));
  const pulling = f < T.letGo;
  if (pulling) {
    pullOut(w, A, u, { t, extra: { expr: at(f, aKeys), blink, head: heads(accent("nod", f, T.home, { amp: 1.3 }), f < T.lower0 ? { dy: 0.04 * Math.sin(t * 9) } : undefined) } });
  } else {
    const p = SPOT.drawR.clone(), facing = lerpA(-Math.PI / 2, 0, smooth((f - T.letGo) / 8));
    const k = smooth((f - T.letGo) / 4), ph = ((f - T.dust) / 5) * Math.PI * 2, rub = f >= T.dust ? 0.07 * Math.sin(ph) : 0;
    const d0 = rel(p, facing, -0.05, 0.8 - rub, 0.24), d1 = rel(p, facing, 0.05, 0.8 + rub, 0.24);
    A.set({
      at: p, facing, pose: { kind: "idle", t }, hands: [mixV(w.stone.grip(0), d0, k), mixV(hang(p, facing, 1), d1, k)],
      expr: at(f, aKeys), blink, head: heads(accent("nod", f, T.home, { amp: 1.3 }), accent("pop", f, T.dust + 6)), visible: true,
    });
  }
  // ---- Ector (screen left) and Kay (screen right): delighted while the sword is up, then: he put it BACK?!
  const up = 1 - smooth((f - T.lower0) / 24);                          // they look up at the raised blade
  const eKeys: [number, Expr][] = [[0, "happy"], [T.slide0 + 5, "nervous"], [T.home + 1, "shock"]];
  const kKeys: [number, Expr][] = [[0, "shock"], [26, "grin"], [T.slide0 + 3, "nervous"], [T.home + 2, "shock"]];
  const ePoint = f >= T.home + 5;
  E.set({
    at: P.ector.at, facing: P.ector.facing, pose: ePoint ? { kind: "point", t, arm: 1 } : { kind: "idle", t }, hands: ePoint ? [null, V(0, 0.75, 0)] : undefined,
    expr: at(f, eKeys), blink: lid(t, 2, swaps(eKeys)), gaze: 1, lookDown: -9 * up, head: heads(accent("jolt", f, T.home + 1), accent("shake", f, T.home + 9), accent("lean", f, T.flip0 + 3, { dir: -1, dur: 0.3, amp: 0.8 })), visible: true,
  });
  K.set({
    at: P.kay.at, facing: P.kay.facing, pose: { kind: "idle", t: t + 0.7 }, expr: at(f, kKeys), blink: lid(t, 3, swaps(kKeys)), gaze: -1, lookDown: -9 * up,
    head: heads(accent("pop", f, 26), accent("jolt", f, T.home + 2, { amp: 1.2 })), visible: true,
  });
  w.update();
  if (pulling) {
    pullOutAfter(w, A, u);
    // The recipe holds the raised sword point UP and the stuck sword point DOWN and jumps between the two at u 0.55.
    // Here that is a move of its own: he turns the sword over in his hand, the point swinging down past his far side
    // (screen left, tilted a little away from the camera so the pommel clears his tunic), and only then lines it up.
    const th = Math.PI * easeInOutCubic(lin(f, T.flip0, T.flip1));
    if (th > 0 && th < Math.PI) {
      const v = easeInOutCubic(clamp01((u - 0.55) / 0.45)), b = V(0.27 * v, -1, 0).normalize(), c0 = Math.cos(th), s0 = Math.sin(th);
      const dir = V(b.x * c0 - b.y * s0, b.x * s0 + b.y * c0, 0.45 * s0).normalize();
      w.stone.setFree(v > 0 ? A.handWorld(0) : w.stone.grip(smooth(u / 0.55)), dir, V(0, 0, 1));
    }
  }
  // the blade: bright while it is up, a flash as it goes home
  w.stone.setShine(f < T.slide0 ? lerp(1, 0.25, smooth((f - T.lower0) / 30)) + 0.12 * Math.sin(t * 11) : 0.8 * (1 - smooth((f - T.home) / 8)) * (f >= T.home ? 1 : 0.3));

  // ---- overlays
  const tip = w.stone.tip(), grip = pulling ? A.handWorld(0) : w.stone.grip(0);
  const g1 = w.project(mixV(grip, tip, 0.85)), g2 = w.project(mixV(grip, tip, 0.45)), slot = w.project([0, 0.57, 0.02]);
  const kh = headPx(w, K);
  return {
    camera: c, season: 0, focus: [0, -0.3],
    overlays: frag(
      h(Glint, { key: "g1", at: -3, dur: 12, x: g1.x + 14, y: g1.y, size: 150, frame: f }),
      h(Glint, { key: "g2", at: 8, dur: 10, x: g2.x - 10, y: g2.y, size: 110, frame: f }),
      h(Burst, { key: "b", at: T.home, x: slot.x, y: slot.y, r: 120, n: 10, frame: f }),
      h(Mark, { key: "m", kind: "!?", at: T.home + 2, x: kh.x - 10, y: kh.y - kh.r * 1.2 - 95, size: 150, frame: f }),
      ...(pulling ? [] : [T.dust + 1, T.dust + 6].map((on, i) => { const q = w.project(mixV(A.handWorld(0), A.handWorld(1), 0.5)); return h(Burst, { key: `d${i}`, at: on, x: q.x, y: q.y, r: 62, n: 7, color: "#ffffff", frame: f }); })),
    ),
  };
}

// ============================================================================================================ 83-143 WHAT
const WHAT0 = cam([0.3, 1.25, 2.76], [0.14, 1.13, 0], 40), WHAT1 = cam([0.26, 1.25, 2.6], [0.14, 1.13, 0], 40), WHAT2 = cam([0.24, 1.25, 2.48], [0.14, 1.13, 0], 40);
function shotWhat(w: World, f: number): Pose {
  const t = f / FPS, P = STAGE.putBack;
  const c0 = f < 100 ? camMix(WHAT0, WHAT1, easeOutCubic(lin(f, T.what - 1, 100))) : camMix(WHAT1, WHAT2, lin(f, 100, 143));
  const rise = 0.04 * smooth((f - T.crown + 5) / 8), l0 = arr(c0.look);          // a small tilt up makes room for the crown
  const c: CamPose = { ...c0, look: [l0[0], l0[1] + rise, l0[2]] };
  w.setCamera(c);
  const A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector), K = w.actor(PEOPLE.kay);
  // ---- Arthur, facing us beside the sword: looks at the "?" over the hilt, at us, up at the crown, shrugs
  const p = SPOT.drawR.clone();
  const aKeys: [number, Expr][] = [[0, "smug"], [T.what + 3, "neutral"], [95, "smile"], [T.crown + 2, "neutral"], [T.shrug, "deadpan"]];
  const lookUp = smooth((f - T.crown - 1) / 4) * (1 - smooth((f - T.shrug + 3) / 4));
  // the shrug: both hands up beside the shoulders, a small drop at the end (the head only tilts: sinking it into the
  // shoulders brings the arms too close to it)
  const sh = easeOutBack(lin(f, T.shrug, T.shrug + 6), 1.2) - 0.07 * smooth((f - T.shrug - 10) / 5);
  const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = f >= T.shrug ? [mixV(hang(p, 0, 0), rel(p, 0, -0.3, 1.05, 0.18), sh), mixV(hang(p, 0, 1), rel(p, 0, 0.3, 1.05, 0.18), sh)] : [null, null];
  A.set({
    at: p, facing: 0, pose: { kind: "idle", t }, hands, expr: at(f, aKeys), blink: lid(t, 1, swaps(aKeys)),
    gaze: at(f, [[0, 0], [T.what + 2, -1], [95, 0]] as [number, number][]), lookDown: -20 * lookUp,
    head: heads(
      { tilt: -6 * smooth((f - T.what - 1) / 3) * (1 - smooth((f - 93) / 4)), dy: 0.1 * lookUp },
      f >= T.shrug ? { tilt: 7 * sh } : undefined, accent("pop", f, T.crown + 2),
    ), visible: true,
  });
  // ---- Kay and Ector lean in from the frame edges, mouths open
  const kin = easeOutBack(lin(f, T.kayIn, T.kayIn + 7)), ein = easeOutBack(lin(f, T.ectorIn, T.ectorIn + 7));
  K.set({
    at: P.kay.at.clone().add(V(-0.16 * kin, 0, 0.05 * kin)), facing: P.kay.facing, pose: { kind: "idle", t: t + 0.7 }, expr: "shock", blink: lid(t, 3), gaze: -1,
    head: heads({ tilt: -9 * kin, dx: -0.12 * kin }, accent("jolt", f, T.crown + 2), accent("jolt", f, T.shrug + 1, { amp: 0.8 })), visible: true,
  });
  E.set({
    at: P.ector.at.clone().add(V(0.2 * ein, 0, 0)), facing: P.ector.facing, pose: { kind: "idle", t }, expr: at(f, [[0, "shock"], [T.shrug + 4, "stern"]] as [number, Expr][]), blink: lid(t, 2), gaze: 1,
    head: heads({ tilt: 9 * ein, dx: 0.12 * ein }, accent("jolt", f, T.crown + 3), accent("shake", f, T.shrug + 5)), visible: true,
  });
  w.update();

  // ---- overlays: "?" over the hilt; on 国王 the crown pops over Arthur's head and the "?" goes to sit beside it
  const hd = headPx(w, A), q0 = w.project([-0.2, 1.5, 0]);
  const go = smooth((f - T.crown) / 7), bob = Math.sin((f - T.crown) * 0.42) * 9;
  const ov = COVER_OV;                                    // 1 in the film; a cover still that zooms out makes the icons smaller
  const cx = hd.x - 20 * ov, cy = Math.max(100 * ov, hd.y - hd.r * 1.2 - 112 * ov) + bob * ov;
  return {
    camera: c, season: 0, focus: [0, -0.3],
    overlays: frag(
      h(Mark, { key: "q", kind: "?", at: T.what, x: lerp(q0.x, cx + 150 * ov, go), y: lerp(q0.y, cy - 4 * ov, go), size: lerp(170, 150, go) * ov, frame: f }),
      h(Crown, { key: "c", at: T.crown, x: cx, y: cy, size: 165 * ov, frame: f }),
    ),
  };
}

// ============================================================================================================ 144-282 YARD
const YARD_UP = cam([0.1, 1.5, 4.7], [0, 5.6, -9], 48), YARD = cam([0.1, 1.5, 4.4], [0, 0.18, 0], 48), YARD_IN = cam([0.1, 1.5, 4.2], [0, 0.18, 0], 48);
const SWORD_CU = cam([0.35, 1.02, 2.0], [0.17, 0.8, 0], 38), SWORD_CU2 = cam([0.33, 1.02, 1.88], [0.17, 0.81, 0], 38);
// the three townsfolk: A (hooded man) and C (woman in a linen cap) come down from the back to the two sides of the paved
// circle; B (straw hat) sets off from the church door, straight down the middle, far behind them
const FOLK = {
  A: { who: () => PEOPLE.commoner(0), from: V(-1.25, 0, -5.4), mark: V(-0.98, 0, -0.85), back: V(-1.04, 0, -1.27), lean: V(-0.52, 0, -0.86), id: 11 },
  C: { who: () => PEOPLE.commoner(1), from: V(1.75, 0, -6.0), mark: V(0.98, 0, -0.85), back: V(1.04, 0, -1.27), lean: V(0.5, 0, -0.82), id: 12 },
  B: { who: () => PEOPLE.commoner(2), from: V(0.2, 0, -7.7), mark: V(0.45, 0, -4.7), flee: V(3.6, 0, -5.4), id: 13 },
};
const STONE0 = V(0, 0.5, 0);
/** the townsfolk for frames 144-356 (two shots share them) */
function folk(w: World, f: number) {
  const t = f / FPS, landed = f >= T.land;
  const A = w.actor(FOLK.A.who()), C = w.actor(FOLK.C.who()), B = w.actor(FOLK.B.who());
  const side = (who: "A" | "C", r: Rig, arrive: number, lag: number) => {
    const F = FOLK[who], sgn = who === "A" ? 1 : -1, id = F.id, tt = t + id;
    const jolt = T.land + 1 + lag, leanAt = who === "C" ? T.push0 - 3 : T.push0 + 6;
    if (f < jolt) {
      // walking down the yard, then standing at the circle, turning to the neighbour and waving
      const speed = who === "A" ? 1.3 : 1.15, start = arrive - walkTime([F.from, F.mark], speed) * FPS;
      const leg = walkAlong([F.from, F.mark], speed, (f - start) / FPS, { endFacing: sgn * 1.05 });
      const wave = leg.arrived && f >= arrive + 4;
      r.set({
        at: leg.at, facing: leg.facing, pose: wave ? { kind: "wave", t: tt, arm: who === "A" ? 1 : 0 } : leg.pose,
        expr: wave ? "happy" : "smile", blink: lid(t, id), gaze: leg.arrived ? sgn : at(f, [[0, 0], [170, sgn * 0.5], [186, 0]] as [number, number][]),
        head: accent("pop", f, arrive + 5), visible: true,
      });
      return;
    }
    if (f < leanAt) {
      // the stone has landed: a jolt, a hop back, staring at it
      const p = hopArc(F.mark, F.back, (f - jolt) / 6, 0.16);
      r.set({
        at: p, facing: lerpA(sgn * 1.05, yawTo(F.back, STONE0), smooth((f - jolt) / 6)), pose: { kind: "idle", t: tt },
        expr: at(f, [[0, "shock"], [jolt + 16, "nervous"]] as [number, Expr][]), blink: lid(t, id, [(jolt + 16) / FPS]), gaze: sgn,
        head: heads(accent("jolt", f, jolt, { amp: 1.3 }), accent("squash", f, jolt + 6)), lookDown: 8 * smooth((f - jolt - 6) / 6), visible: true,
      });
      return;
    }
    // creeping up to the stone to look at the sword
    const end = yawTo(F.lean, [0, 0, 0.3]);
    const leg = walkAlong([F.back, F.lean], 1.5, (f - leanAt) / FPS, { endFacing: end, bounce: 0.6 });
    const letters = f >= T.letters && f < T.tilt0 + 4, crown = f >= T.crown2;
    const pointing = who === "A" && f >= T.crown2 + 2;
    r.set({
      at: leg.at, facing: leg.facing, pose: pointing ? { kind: "point", t: tt, arm: 1 } : leg.moving ? leg.pose : { kind: "idle", t: tt },
      hands: pointing ? [null, V(0.45, 1.5, -0.86)] : undefined,       // (in the screen plane and not too steep: an arm aimed at the camera or straight up hides behind his own head)
      expr: who === "A" ? at(f, [[0, "nervous"], [T.glow + 2, "shock"], [T.tilt1, "focus"], [T.crown2 + 1, "grin"]] as [number, Expr][])
        : at(f, [[0, "shock"], [T.tilt1 + 2, "nervous"], [T.crown2 + 2, "shock"], [T.crown2 + 14, "happy"]] as [number, Expr][]),
      blink: lid(t, id, [T.tilt1 / FPS, (T.crown2 + 1) / FPS, (T.crown2 + 14) / FPS]), gaze: sgn,
      lookDown: letters ? 14 : crown ? -8 : 4,
      head: heads(
        leg.arrived ? { tilt: sgn * 7, dx: sgn * 0.1 } : undefined, accent("jolt", f, T.glow + 1 + lag), accent(who === "A" ? "pop" : "jolt", f, T.crown2 + 1 + lag, { amp: 1.2 }),
        who === "C" ? accent("jolt", f, T.glint + 1) : undefined, accent(who === "C" ? "nod" : "pop", f, T.crown2 + (who === "C" ? 15 : 19)),
      ), visible: true,
    });
  };
  side("A", A, T.arriveA, 0);
  side("C", C, T.arriveC, 2);
  // B: far behind, down the middle; stops dead when the stone lands, then runs for it
  {
    const F = FOLK.B, speed = 1.3, arrive = T.land - 3, start = arrive - walkTime([F.from, F.mark], speed) * FPS;
    const fleeAt = T.land + 11;
    const leg = f < fleeAt ? walkAlong([F.from, F.mark], speed, (f - start) / FPS, { endFacing: 0.2 }) : walkAlong([F.mark, F.flee], 3.3, (f - fleeAt) / FPS, { startFacing: 0.2 });
    if (!(f >= fleeAt && leg.arrived)) B.set({
      at: leg.at, facing: leg.facing, pose: leg.pose, expr: landed ? "shock" : "neutral", blink: lid(t, F.id), gaze: f >= fleeAt ? 0 : landed ? -0.5 : 0,
      head: accent("jolt", f, T.land + 4, { amp: 1.3 }), visible: true,
    });
  }
  return { A, B, C };
}
function shotYard(w: World, f: number): Pose {
  // ---- camera: tilt down from the round window (already moving on the cut), settle on the paved circle; the stone
  //      lands (kick); fast push-in to the sword
  let c: CamPose;
  if (f < T.push0) {
    c = camMix(YARD_UP, YARD, easeInOutCubic(lin(f, T.yard - 9, 184)));
    if (f >= 184) c = camMix(YARD, YARD_IN, smooth(lin(f, 184, T.push0)));
    c = kick(c, f, T.land, 0.07);
  } else c = f < T.push1 ? camMix(YARD_IN, SWORD_CU, easeInOutCubic(lin(f, T.push0, T.push1))) : camMix(SWORD_CU, SWORD_CU2, lin(f, T.push1, T.letters));
  w.setCamera(c);
  // ---- the stone: not there, then out of the sky
  const lift = f < T.fall0 ? null : f < T.land ? 9 * Math.pow((T.land - f) / (T.land - T.fall0), 1.6) : 0;
  w.liftStone(lift);
  posePuffs((f - T.land) / FPS);
  const { C } = folk(w, f);
  w.update();
  // one glint as the camera arrives on the sword
  const sweep = Math.max(0, 1 - Math.abs(f - (T.glint + 3)) / 5);
  w.stone.setShine(f >= T.land ? 0.2 + 0.9 * sweep : 0);

  // ---- overlays
  const ov: React.ReactNode[] = [
    h(CornerTag, { key: "t1", at: T.tag1, out: T.tag2 - 6, text: TXT.book, icon: "none", tone: "white", x: TAG_X, y: 120, frame: f }),
    h(CornerTag, { key: "t2", at: T.tag2, out: T.push0 - 2, text: TXT.london, icon: "none", tone: "white", x: TAG_X, y: 120, frame: f }),
  ];
  if (f >= T.land && f < T.land + 9) {
    const l = w.project([-0.8, 0.05, 0.5]), r = w.project([0.8, 0.05, 0.5]);
    ov.push(h(Burst, { key: "bl", at: T.land, x: l.x - 30, y: l.y, r: 110, n: 8, color: "#ffffff", frame: f }), h(Burst, { key: "br", at: T.land, x: r.x + 30, y: r.y, r: 110, n: 8, color: "#ffffff", frame: f }));
  }
  if (f >= T.land + 3 && f < T.push0 + 4) {
    const ch = headPx(w, C);
    ov.push(h(Mark, { key: "m", kind: "!", at: T.land + 3, out: T.push0 - 3, x: ch.x + 10, y: ch.y - ch.r * 1.2 - 80, size: 130, frame: f }));
  }
  if (f >= T.glint) {
    const g = w.project([0, 0.82, 0.02]);
    ov.push(h(Glint, { key: "g", at: T.glint, dur: 11, x: g.x + 8, y: g.y, size: 170, frame: f }));
  }
  return { camera: c, season: 0, focus: [0, -1.2], overlays: frag(...ov) };
}

// ============================================================================================================ 283-356 LETTERS
const INS0 = cam([0, 0.5, 3.45], [0, 0.25, 0.5], 40), INS1 = cam([0, 0.5, 3.2], [0, 0.25, 0.5], 40);
const HILT = cam([0.05, 1.12, 2.3], [0, 0.985, 0], 40), HILT2 = cam([0.05, 1.12, 2.14], [0, 0.99, 0], 40);
function shotLetters(w: World, f: number): Pose {
  const ins = camMix(INS0, INS1, easeOutQuad(lin(f, T.letters - 2, T.tilt0 + 4)));
  const c = f < T.tilt0 ? ins : f < T.tilt1 ? camMix(ins, HILT, easeInOutCubic(lin(f, T.tilt0, T.tilt1))) : camMix(HILT, HILT2, easeOutQuad(lin(f, T.tilt1, S.to)));
  w.setCamera(c);
  folk(w, f);
  w.update();
  const g = easeOutCubic(lin(f, T.glow - 1, T.glow + 7));
  w.stone.setGlow(g * (0.68 + 0.14 * Math.sin((f - T.glow) * 0.55)) * (1 - 0.6 * smooth((f - T.tilt0) / 10)));
  w.stone.setShine(0.25 + 0.6 * Math.max(0, 1 - Math.abs(f - (T.tilt1 + 2)) / 5));
  const ov: React.ReactNode[] = [];
  if (f < T.tilt0) {
    const a = w.project([-0.52, 0.3, 0.52]), b = w.project([0.5, 0.1, 0.52]);
    ov.push(h(Glint, { key: "a", at: T.glow, dur: 10, x: a.x, y: a.y, size: 120, color: "#fff3c4", frame: f }), h(Glint, { key: "b", at: T.glow + 6, dur: 10, x: b.x, y: b.y, size: 100, color: "#fff3c4", frame: f }));
  }
  if (f >= T.crown2) {
    const p = w.project([0, 1.17, 0]), bob = Math.sin((f - T.crown2) * 0.45) * 10;
    ov.push(h(Crown, { key: "c", at: T.crown2, x: p.x, y: p.y - 200 + bob, size: 230, frame: f }), h(Burst, { key: "cb", at: T.crown2 + 1, x: p.x, y: p.y - 200, r: 200, n: 12, frame: f }));
  }
  return { camera: c, season: 0, focus: [0, -1.2], overlays: frag(...ov) };
}

// ============================================================================================================ 357-391 QUEUE
const QUEUE0 = cam([0.62, 1.5, 6.3], [0.62, 0.3, 0], 47), QUEUE1 = cam([0.7, 1.5, 6.0], [0.68, 0.3, 0], 47);
const LINE: Vec3[] = [[1.06, 0, 0.3], [1.5, 0, -0.14], [1.92, 0, -0.6]];
function shotQueue(w: World, f: number): Pose {
  const t = f / FPS;
  const c = camMix(QUEUE0, QUEUE1, easeOutQuad(lin(f, T.queue - 6, T.red1)));
  w.setCamera(c);
  // lord 0 heaves, harder and harder
  const e = lerp(0.6, 1, lin(f, T.queue, T.red1 - 4));
  const xKeys: [number, Expr][] = [[0, "focus"], [366, "huff"], [379, "pained"]];
  tug(w, w.actor(PEOPLE.lord(0)), { side: "R", t: (f - 330) / FPS, effort: e, extra: { expr: at(f, xKeys), blink: at(f, [[0, 0], [379, 0]] as [number, number][]) } });
  // the queue: 1 points "get on with it", 2 and 3 behind him hop (out of step) to see over the heads in front
  const q1 = w.actor(PEOPLE.lord(1)), q2 = w.actor(PEOPLE.lord(2)), q3 = w.actor(PEOPLE.lord(3));
  const p1 = V(...LINE[0]), p2 = V(...LINE[1]), p3 = V(...LINE[2]);
  const point = f >= 368 && f < 386;
  q1.set({
    at: p1, facing: -1.25, pose: point ? { kind: "point", t, arm: 1 } : { kind: "idle", t: t + 1 }, hands: point ? [null, V(0.2, 1.2, 0.8)] : undefined,     // (aimed a little toward the camera: straight at the sword the arm cuts through his own cloak)
    expr: at(f, [[0, "stern"], [368, "huff"]] as [number, Expr][]), blink: lid(t, 21, [368 / FPS]), gaze: -1,
    head: heads(accent("nod", f, 369), accent("nod", f, 377)), visible: true,
  });
  // (in this wide shot only up-and-down reads: a lean toward the stone hides the head behind the man in front)
  const hop2 = Math.abs(Math.sin(((f - 350) / 13) * Math.PI)), hop3 = Math.abs(Math.sin(((f - 359) / 10) * Math.PI));
  q2.set({
    at: p2.clone().add(V(0, Math.pow(hop2, 0.7) * 0.15, 0)), facing: -1.1, pose: { kind: "idle", t: t + 2 }, expr: at(f, [[0, "huff"], [379, "stern"]] as [number, Expr][]), blink: lid(t, 22, [379 / FPS]), gaze: -1,
    head: { squash: 0.07 * (1 - hop2) * (1 - hop2) }, visible: true,
  });
  q3.set({
    at: p3.clone().add(V(0, Math.pow(hop3, 0.7) * 0.19, 0)), facing: -1.0, pose: { kind: "idle", t: t + 3 }, expr: "stern", blink: lid(t, 23), gaze: -1,
    head: { squash: 0.07 * (1 - hop3) * (1 - hop3) }, visible: true,
  });
  w.update();
  w.stone.setShine(0.25);
  return { camera: c, season: 0, focus: [0.6, -0.3] };
}

// ============================================================================================================ 392-420 RED
const RED: { who: number; side: "R" | "back"; from: number; to: number; c0: CamPose; c1: CamPose; t0: number }[] = [
  { who: 1, side: "R", from: T.red1, to: T.red2 - 1, c0: cam([-0.3, 1.3, 2.5], [0.24, 1.05, 0], 40), c1: cam([-0.26, 1.3, 2.25], [0.24, 1.05, 0], 40), t0: 0.2 },
  { who: 3, side: "R", from: T.red2, to: T.red3 - 1, c0: cam([0.72, 1.32, 2.35], [0.22, 1.13, 0], 40), c1: cam([0.66, 1.32, 2.1], [0.22, 1.13, 0], 40), t0: 0.9 },
  { who: 2, side: "back", from: T.red3, to: T.still - 1, c0: cam([0.12, 1.32, 2.55], [0, 1.12, -0.1], 40), c1: cam([0.1, 1.32, 2.3], [0, 1.12, -0.1], 40), t0: 0.5 },
];
/** behind the sword the wide lords stand 2.5 cm nearer than SPOT.back, or their short arms end 1 mm short of the grip */
const BACK = SPOT.back.clone().add(V(0, 0, 0.025));
function shotRed(w: World, f: number): Pose {
  const R = RED.find((r) => f >= r.from && f <= r.to) ?? RED[2];
  const k = lin(f, R.from, R.to), c = camMix(R.c0, R.c1, easeOutQuad(k));
  w.setCamera(c);
  const r = w.actor(PEOPLE.lord(R.who)), tt = R.t0 + (f - R.from) / FPS;
  const expr: Expr = k < 0.45 ? "huff" : R.who === 2 ? "wince" : "pained";
  tug(w, r, { side: R.side, t: tt, effort: 1, extra: R.side === "back" ? { expr, at: BACK.clone() } : { expr } });
  w.update();
  w.stone.setShine(0.25);
  const hp = headPx(w, r), a = 0.55 + 0.45 * k;
  return {
    camera: c, season: 0, focus: [0, -0.3],
    overlays: frag(h(Flush, { key: "fl", x: hp.x, y: hp.y, r: hp.r * 1.2, a }), h(Sweat, { key: "sw", x: hp.x, y: hp.y, r: hp.r * 1.2, a, seed: R.who, frame: f })),
  };
}

// ============================================================================================================ 421-435 STILL
const STILL0 = cam([0.08, 1.0, 1.7], [0, 0.78, 0], 36), STILL1 = cam([0.06, 1.0, 1.5], [0, 0.79, 0], 36);
function shotStill(w: World, f: number): Pose {
  const c = camMix(STILL0, STILL1, easeOutQuad(lin(f, T.still - 1, T.pant)));
  w.setCamera(c);
  // the same lord as the last jump cut, the camera cuts in on his fists: they shake on the grip, the sword stands still
  const r = w.actor(PEOPLE.lord(2)), g0 = w.stone.grip(0), sx = 0.005 * Math.sin(f * 2.7) + 0.003 * Math.sin(f * 4.3 + 1);
  tug(w, r, { side: "back", t: 0.5 + (f - T.red3) / FPS, effort: 1, extra: { expr: "wince", at: BACK.clone(), hands: [g0.clone().add(V(sx, -0.018, 0)), g0.clone().add(V(-0.8 * sx, 0.018, 0))] } });
  w.update();
  w.stone.setShine(0.3);
  const g = w.project(w.stone.grip(0));
  return { camera: c, season: 0, focus: [0, -0.3], overlays: h(Strain, { x: g.x, y: g.y, w: 150, a: 1, frame: f }) };
}

// ============================================================================================================ 436-451 PANT
const PANT0 = cam([0.03, 1.5, 5.75], [0, 0.3, -0.1], 46), PANT1 = cam([0.05, 1.5, 5.45], [0, 0.3, -0.1], 46);
// the two at the ends of the stone stand side-on, doubled over with their hands on their thighs; the two behind hang their heads
const SPENT: { who: number; at: Vec3; id: number; side: -1 | 0 | 1 }[] = [
  { who: 2, at: [1.12, 0, -0.42], id: 33, side: 1 }, { who: 3, at: [-1.12, 0, -0.3], id: 32, side: -1 }, { who: 1, at: [0.48, 0, -1.5], id: 31, side: 0 }, { who: 0, at: [-0.46, 0, -1.55], id: 30, side: 0 },
];
function shotPant(w: World, f: number): Pose {
  const t = f / FPS;
  const c = camMix(PANT0, PANT1, easeOutQuad(lin(f, T.pant - 2, S.to + 6)));
  w.setCamera(c);
  for (const sp of SPENT) {
    const p = V(...sp.at), r = w.actor(PEOPLE.lord(sp.who)), ph = t * 16 + sp.id * 1.7, pant = 0.5 + 0.5 * Math.sin(ph);
    const b = bow(0.75 + 0.25 * pant, 24);
    if (sp.side) {
      const facing = -sp.side * (Math.PI / 2 - 0.25);
      r.set({
        at: p, facing, pose: { kind: "haul", t, phase: (t * 2.6 + sp.id * 0.37) % 1, amount: -0.85 },
        hands: [rel(p, facing, -0.22, 0.6 + 0.015 * pant, 0.2), rel(p, facing, 0.22, 0.6 + 0.015 * pant, 0.2)],   // (on the outside of the thighs: nearer the middle the arms cut through the belly)
        expr: sp.who % 2 ? "dazed" : "sigh", blink: lid(t, sp.id), lookDown: 16 + 6 * pant, head: { dy: -0.1 - 0.05 * pant, squash: 0.035 * pant }, visible: true,
      });
    } else r.set({
      at: p, facing: yawTo(p, [0, 0, 0.6]) * 0.6, pose: { kind: "idle", t: t * 2.2 + sp.id }, expr: sp.who % 2 ? "dazed" : "sigh", blink: lid(t, sp.id), gaze: p.x > 0 ? -0.5 : 0.5,
      lookDown: b.lookDown, head: heads(b.head as RigHead, { squash: 0.035 * pant }), visible: true,
    });
  }
  w.update();
  const sweep = Math.max(0, 1 - Math.abs(f - (T.pant + 6)) / 5);
  w.stone.setShine(0.35 + 0.65 * sweep);
  const g = w.project([0, 0.84, 0.02]);
  return { camera: c, season: 0, focus: [0, -0.5], overlays: h(Glint, { at: T.pant + 2, dur: 11, x: g.x + 6, y: g.y, size: 150, frame: f }) };
}

// ============================================================================================================ the segment
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter(w) { buildPuffs(w); },
  exit() { if (puffs) puffs.visible = false; },
  pose(w, f) {
    if (puffs) puffs.visible = false;
    if (f < T.what) return shotHook(w, f);
    if (f < T.yard) return shotWhat(w, f);
    if (f < T.letters) return shotYard(w, f);
    if (f < T.queue) return shotLetters(w, f);
    if (f < T.red1) return shotQueue(w, f);
    if (f < T.still) return shotRed(w, f);
    if (f < T.pant) return shotStill(w, f);
    return shotPant(w, f);
  },
};
