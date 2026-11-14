// HER HAND AND THE RED MIC (PLAN §3; WP3): the film's signature. The reporter is the camera; all we ever see of her is
// her RIGHT hand with the RED MIC (from the lower left) and her LEFT hand that takes things (from the lower right), each
// with its cream-pink cuff and sleeve going off out of the frame toward her shoulder. Both are PROPS (props/her.ts:
// "herMic", "herHand"), so the clearance checker tests them against the figures, the props and the set like anything
// else; this file POSES them from the camera every frame (built once, never left behind when the camera moves).
//
//   putHer(w, cam, f, { mic, hand })   call it AFTER w.update() (it only puts props), with the shot's camera (the same
//                CamPose the shot returns). Returns where things landed (world + screen) for the shot to use: the mic
//                head, her palm, the item in it.
//   mic:  { mode, from?, k?, aim?, reach?, avoid?, dy? }
//         "off"     out of the frame below the lower left (nothing drawn)
//         "in"      swings in from the lower left to "toward" (k 0..1 over ~10 frames, with a small overshoot)
//         "toward"  held out on a diagonal from the lower left, pointing at `aim` (the speaker's mouth, world): the
//                   mic head about 20 % up from the bottom of the frame (below the caption band, never over a face),
//                   left of the speaker, a gentle hand bob. The head's distance from the lens is `reach` (default
//                   micReach(cam, aim): it stops short of him)
//         "lens"    turned round to the lens (the aside to the viewer): the head big in the lower middle, 0.30 m away
//         "low"     drooping out of the bottom of the frame (F after 50)
//   hand: { mode, from?, k?, at?, item?, peeled?, curl?, dy? }
//         "off"     out of the frame below the lower right (keeps its curl and item as it goes)
//         "reach"   open, held out toward `at` (world: what she takes): on the line of sight to it, 6 cm short of it,
//                   0.55 m from the lens at most (her arm), so on screen her fingers reach it; kept in the lower right
//                   quarter (x 0..0.9, y -0.9..-0.1 NDC): stage what she takes there (B07: he holds it INTO frame)
//         "hold"    closed round `item` in the lower right ("lychee": cupped palm-up, the fruit showing; "bone": a fist,
//                   the bone sticking out above and below it)
//         "eat"     lifts the item to the bottom of the lens (a small chewing bob)
//         "catch"   snaps to `at` (the lychee in the air, on the line of sight as reach), half closed; then "hold"
//         "wave"    up at the right, palm out, waving (G: at the boat)
//         item "bone" | "boneClean" | "lychee" shows in the hand once it is closed past half (reach -> hold: the bone
//         appears as the fingers close; hide his own at the same frame)
//   TRANSITIONS: every mode is a target pose; { from, k } blends from the previous mode's pose (k 0..1, eased here:
//   "in" with an overshoot, the rest smooth). herKeys(f, [[frame, mode], ...]) gives { mode, from, k } from key frames
//   (each change takes `len` frames, 10 by default; keep keys at least that far apart).
//     const W = putHer(w, cam, f, { mic: { ...herKeys(f, [[A01.from, "in"], [A02.from, "toward"], [B10.from, "lens"]]), aim: su.mouth } })
//   SCREEN OFFSET (optional, default 0 = as above): mic.dy / hand.dy move the whole mic / hand up (+) or down (-) the
//   screen at its own depth, in NDC (1 = half the frame's height), one number for every mode or one per mode, blended
//   through a transition like the poses. Keeps the mic head / a held lychee under the caption band (y 1190-1498) with
//   no NDC shuffle in the shot:  mic: { ...keys, aim, dy: { toward: -0.16, lens: -0.08 } },  hand: { ..., dy: { hold: -0.26 } }
//   ("in" takes the "toward" value). The returned points (mic head, palm, item) are where they land.
//   micReach(cam, aim)   the longest safe reach for the mic head (m from the lens): 0.45 m short of the speaker's mouth,
//                        0.22..0.55 (his belly / beard come forward of his mouth)
// Rules kept here: pure (f in, poses out: the bob is a sine of f / FPS); the mic head >= 0.20 m from the lens, the hand
// >= 0.22 (the camera near is 0.03); the sleeves always bend off toward her shoulders, out of the frame.
import * as THREE from "three";
import { FPS, W, H, clamp01, lerp, smooth, easeOutBack, easeOutCubic, type CamPose, type V3Like } from "./story";
import type { World } from "./world";

export type MicMode = "off" | "in" | "toward" | "lens" | "low";
export type HandMode = "off" | "reach" | "hold" | "eat" | "catch" | "wave";
export type HerItem = "bone" | "boneClean" | "lychee";
export type MicO = {
  mode: MicMode; from?: MicMode; k?: number;
  /** the speaker's mouth (world): "toward" points at it */ aim?: V3Like;
  /** the mic head's distance from the lens (m); default micReach(cam, aim) */ reach?: number;
  /** faces (world) the mic head must stay well below on screen */ avoid?: V3Like[];
  /** a screen offset of the whole mic (NDC: + up, - down; -0.16 = 8 % of the frame's height lower), for every mode or
   *  one per mode (a transition blends them like the poses; "in" takes the "toward" one). Default 0: unchanged */
  dy?: HerDy<MicMode>;
};
export type HandO = {
  mode: HandMode; from?: HandMode; k?: number;
  /** reach / catch: the point (world) */ at?: V3Like;
  item?: HerItem; /** lychee: 0 whole .. 1 peeled */ peeled?: number; /** overrides the mode's curl */ curl?: number;
  /** a screen offset of the whole hand (NDC, as MicO.dy; per mode, e.g. { hold: -0.26 }: a number moves "reach" /
   *  "catch" off their target too). The returned palm / item points are where it lands. Default 0: unchanged */
  dy?: HerDy<HandMode>;
};
/** a screen offset in NDC (+ up): one number for every mode, or one per mode (the modes not named: 0) */
export type HerDy<M extends string> = number | Partial<Record<M, number>>;
export type HerO = { mic?: MicO; hand?: HandO };
export type HerOut = {
  mic: { head: THREE.Vector3; x: number; y: number } | null;
  hand: { palm: THREE.Vector3; item: THREE.Vector3; x: number; y: number } | null;
};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const ASPECT = W / H, RAD = Math.PI / 180;
/** the mic's lean on screen in "toward" (rad from upright, toward the speaker) */
const DIAG = 40 * RAD;
/** the mic head's nearest distance from the lens; the palm's */
export const MIC_NEAR = 0.2, HAND_NEAR = 0.22;
/** her shoulders in camera space (x right, y up, -z ahead): where the sleeves go off to */
const SHOULDER = { mic: V(-0.2, -0.36, 0.1), hand: V(0.21, -0.36, 0.1) };

// ------------------------------------------------------------------------------------------------ camera space
/** a scratch camera with the CamPose's frame (World.setCamera's way: up, lookAt, then the roll) */
const _cam = new THREE.PerspectiveCamera();
const frameOf = (c: CamPose) => {
  _cam.up.set(...(c.up ?? [0, 1, 0]));
  _cam.position.copy(toV(c.pos)); _cam.lookAt(toV(c.look)); _cam.rotateZ(c.roll ?? 0);
  _cam.updateMatrixWorld(true);
  return { m: _cam.matrixWorld.clone(), inv: _cam.matrixWorld.clone().invert(), q: _cam.quaternion.clone(), tan: Math.tan((c.fov * RAD) / 2) };
};
type Frame = ReturnType<typeof frameOf>;
/** the camera-space point at depth d (m ahead) that shows at NDC (nx, ny) */
const atNdc = (F: Frame, nx: number, ny: number, d: number) => V(nx * d * F.tan * ASPECT, ny * d * F.tan, -d);
/** a camera-space point's NDC and depth */
const ndcOf = (F: Frame, p: THREE.Vector3) => { const d = Math.max(1e-4, -p.z); return { x: p.x / (d * F.tan * ASPECT), y: p.y / (d * F.tan), d }; };
/** a rotation whose +y is `y` and whose +z is as near `z` as it can be (x = y cross z) */
const basis = (y: THREE.Vector3, z: THREE.Vector3) => {
  const Y = y.clone().normalize(), X = Y.clone().cross(z); if (X.lengthSq() < 1e-8) X.set(1, 0, 0); X.normalize();
  const Z = X.clone().cross(Y).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
};
/** a pose in camera space: the origin (the mic's ball / her palm), the rotation, the hand's curl */
type CPose = { p: THREE.Vector3; q: THREE.Quaternion; curl: number };
const mix = (a: CPose, b: CPose, t: number, tq = clamp01(t)): CPose =>
  ({ p: a.p.clone().lerp(b.p, t), q: a.q.clone().slerp(b.q, tq), curl: lerp(a.curl, b.curl, clamp01(t)) });
/** gentle hand bob (m), pure: two slow sines of the time */
const bob = (f: number, seed: number, amt = 1) => {
  const t = f / FPS;
  return V(0.003 * Math.sin(2 * Math.PI * 0.43 * t + seed) * amt, 0.004 * Math.sin(2 * Math.PI * 0.57 * t + 1.7 * seed) * amt, 0);
};

/** THE MIC'S SAFE REACH: the mic head's distance from the lens for "toward" (m): 0.45 m short of the speaker's mouth
 *  (his belly and beard stand forward of it), never nearer than 0.22 nor farther than 0.55 (her arm). Pure.
 *    putHer(w, cam, f, { mic: { mode: "toward", aim: mouth, reach: micReach(cam, mouth) - 0.05 } }) */
export const micReach = (cam: CamPose, aim: V3Like, margin = 0.45) => {
  const F = frameOf(cam), a = toV(aim).applyMatrix4(F.inv), d = -a.z;
  return Math.max(0.22, Math.min(0.55, d - margin));
};

// ---------------------------------------------------------------------------------------------------- the mic
const micPose = (F: Frame, f: number, mode: Exclude<MicMode, "in">, o: MicO): CPose => {
  if (mode === "off") return { p: atNdc(F, -1.4, -1.6, 0.5), q: basis(V(0.55, 0.8, -0.2), V(-0.4, 0.2, 1)), curl: 1 };
  if (mode === "low") return { p: atNdc(F, -0.5, -1.5, 0.5), q: basis(V(0.25, 0.3, -0.92), V(-0.3, 0.9, 0.2)), curl: 1 };
  if (mode === "lens") {
    const p = atNdc(F, 0.06, -0.66, 0.32).add(bob(f, 2.1, 0.7));
    return { p, q: basis(V(0.2, 0.7, 0.68), V(-0.3, 0.5, -1)), curl: 1 };
  }
  // toward: lower left of the speaker, 20 % up from the bottom, pointing at the mouth
  const a = o.aim ? toV(o.aim).applyMatrix4(F.inv) : atNdc(F, 0, 0.35, 2);
  if (-a.z < 0.3) a.copy(atNdc(F, 0, 0.35, 2));                         // the aim behind the lens: a neutral point
  const A = ndcOf(F, a), d = Math.max(MIC_NEAR + 0.02, Math.min(0.55, o.reach ?? Math.max(0.22, Math.min(0.55, A.d - 0.45))));
  let hy = -0.6;
  const hx = Math.max(-0.6, Math.min(-0.05, A.x - 0.38));
  for (const fc of o.avoid ?? []) {                                      // keep 0.45 (NDC) below any face near it
    const c = ndcOf(F, toV(fc).applyMatrix4(F.inv));
    if (c.d > 0.1 && Math.abs(c.x - hx) < 0.4) hy = Math.min(hy, c.y - 0.45);
  }
  hy = Math.max(-0.8, hy);
  const p = atNdc(F, hx, hy, d).add(bob(f, 0.6));
  // the axis: toward the mouth, leaned over on screen to a reporter's diagonal (DIAG from upright, toward him), so the
  // body and her fist come in from the lower left instead of standing straight up
  const toAim = a.clone().sub(p).normalize(), scr = V(toAim.x, toAim.y, 0);
  if (scr.lengthSq() < 1e-6) scr.set(0.3, 1, 0);
  scr.normalize().lerp(V(Math.sin(DIAG), Math.cos(DIAG), 0), 0.85).normalize();
  const axis = toAim.multiplyScalar(0.3).add(scr.multiplyScalar(0.7));
  if (axis.y < 0.25) axis.y = 0.25;                                      // the head always above her fist
  return { p, q: basis(axis, V(-0.5, 0.2, 1)), curl: 1 };
};

// ---------------------------------------------------------------------------------------------------- the hand
const handPose = (F: Frame, f: number, mode: HandMode, o: HandO, prevCurl: number): CPose => {
  const t = f / FPS;
  // reach / catch: the palm ON THE LINE OF SIGHT to the target (so on screen it reaches it), as far out as her arm
  // goes (0.55 m from the lens) and 6 cm short of it, a little below and right of it (the fingers get there first);
  // the fingers point from her shoulder through it
  // (kept in the lower right: x 0..0.9, y -0.9..-0.1 NDC, so the sleeve never crosses the frame: stage what she takes
  // there, as PLAN B07 does: "he holds a grilled bone INTO frame")
  const reachTo = (curl: number, palmOut: boolean): CPose => {
    const a = o.at ? toV(o.at).applyMatrix4(F.inv) : atNdc(F, 0.25, -0.2, 0.7);
    const len = a.length(), d = Math.max(HAND_NEAR, Math.min(0.55, len - 0.06)), A = ndcOf(F, a);
    const p = atNdc(F, Math.max(0, Math.min(0.9, A.x)), Math.max(-0.9, Math.min(-0.1, A.y)), d).add(V(0.015, -0.03, 0));
    const fingers = p.clone().sub(SHOULDER.hand).normalize().add(V(-0.05, 0.3, 0)).normalize();
    return { p, q: basis(fingers, palmOut ? V(0.1, 0.3, 1) : V(0.5, 0.8, 0.3)), curl };
  };
  switch (mode) {
    case "off": return { p: atNdc(F, 1.4, -1.6, 0.45), q: basis(V(-0.4, 0.9, -0.2), V(0.4, 0.2, 1)), curl: prevCurl };
    case "reach": return reachTo(0, false);
    case "catch": return reachTo(0.55, true);
    case "hold":
      return o.item === "lychee"
        ? { p: atNdc(F, 0.42, -0.62, 0.36).add(bob(f, 3.3)), q: basis(V(-0.35, 0.35, -0.87), V(0.2, -0.85, -0.45)), curl: 0.45 }
        : { p: atNdc(F, 0.5, -0.55, 0.42).add(bob(f, 3.3)), q: basis(V(-0.55, 0.15, -0.82), V(-0.75, -0.2, 0.6)), curl: 1 };
    case "eat": {
      const chew = V(0, 0.006 * Math.abs(Math.sin(2 * Math.PI * 1.6 * t)), 0);
      return o.item === "lychee"
        ? { p: atNdc(F, 0.1, -0.9, 0.26).add(chew), q: basis(V(-0.3, 0.45, -0.84), V(0.2, -0.85, -0.45)), curl: 0.45 }
        : { p: atNdc(F, 0.12, -0.88, 0.27).add(chew), q: basis(V(-0.7, 0.35, -0.6), V(-0.6, -0.2, 0.75)), curl: 1 };
    }
    case "wave": {
      const sw = 0.38 * Math.sin(2 * Math.PI * 1.7 * t), up = V(Math.sin(sw), Math.cos(sw), 0.1);
      return { p: atNdc(F, 0.5, -0.28, 0.5).add(V(0.012 * Math.sin(2 * Math.PI * 1.7 * t), 0, 0)), q: basis(up, V(0, 0, 1)), curl: 0.05 };
    }
  }
};

// ---------------------------------------------------------------------------------------------------- the put
/** the offset of mode `m` (NDC) */
const dyOf = <M extends string>(dy: HerDy<M> | undefined, m: M) => (dy === undefined ? 0 : typeof dy === "number" ? dy : dy[m] ?? 0);
/** a camera-space pose moved `dy` NDC up the screen at its own depth (dy 0: the same pose) */
const shiftY = (F: Frame, P: CPose, dy: number): CPose => (dy ? { ...P, p: P.p.clone().add(V(0, dy * Math.max(1e-4, -P.p.z) * F.tan, 0)) } : P);
/** the forearm's bend: the sleeve's -y (prop axes) turned toward her shoulder, at most 1.1 rad */
const wristOf = (P: CPose, shoulder: THREE.Vector3, wristY: number): [number, number, number] => {
  const wrist = V(0, wristY, 0).applyQuaternion(P.q).add(P.p);
  const want = shoulder.clone().sub(wrist).normalize().applyQuaternion(P.q.clone().invert());
  const r = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), want);
  const ang = 2 * Math.acos(Math.min(1, Math.abs(r.w)));
  if (ang > 1.1) r.slerp(new THREE.Quaternion(), 1 - 1.1 / ang);
  const e = new THREE.Euler().setFromQuaternion(r, "YXZ");
  return [e.x, e.y, e.z];
};
const _e = new THREE.Euler();
/** a camera-space pose -> the world point and the put's rot (Euler YXZ) */
const toWorld = (F: Frame, P: CPose) => {
  const at = P.p.clone().applyMatrix4(F.m), q = F.q.clone().multiply(P.q);
  _e.setFromQuaternion(q, "YXZ");
  return { at, rot: [_e.x, _e.y, _e.z] as [number, number, number] };
};
const screen = (F: Frame, p: THREE.Vector3) => { const n = ndcOf(F, p); return { x: (n.x * 0.5 + 0.5) * W, y: (0.5 - n.y * 0.5) * H }; };

/** PUT HER HAND AND MIC for this frame (after w.update(); see the head of this file). Pure in (cam, f, o). */
export const putHer = (w: World, cam: CamPose, f: number, o: HerO): HerOut => {
  const F = frameOf(cam), out: HerOut = { mic: null, hand: null };
  const gone = (x: { mode: string; from?: string; k?: number }) => x.mode === "off" && ((x.from ?? "off") === "off" || (x.k ?? 1) >= 1);
  if (o.mic && !gone(o.mic)) {
    const m = o.mic, k = clamp01(m.k ?? 1);
    const target = m.mode === "in" ? "toward" : m.mode, from = m.mode === "in" ? m.from === undefined || m.from === "in" ? "off" : m.from : m.from;
    const B = shiftY(F, micPose(F, f, target, m), dyOf(m.dy, target));
    let P = B;
    if (from !== undefined && from !== target && k < 1) {
      const fm = from === "in" ? "toward" : from, A = shiftY(F, micPose(F, f, fm, m), dyOf(m.dy, fm));
      P = m.mode === "in" ? mix(A, B, easeOutBack(k, 1.4), smooth(k * 1.15)) : mix(A, B, smooth(k));
    }
    if (P.p.length() < MIC_NEAR) P.p.setLength(MIC_NEAR);
    const W_ = toWorld(F, P);
    w.prop("herMic").put(W_.at, { rot: W_.rot, wrist: wristOf(P, SHOULDER.mic, -0.18) });
    const s = screen(F, P.p);
    out.mic = { head: W_.at, x: s.x, y: s.y };
  }
  if (o.hand && !gone(o.hand)) {
    const h = o.hand, k = clamp01(h.k ?? 1);
    const B0 = handPose(F, f, h.from ?? h.mode, h, 0), B = shiftY(F, handPose(F, f, h.mode, h, B0.curl), dyOf(h.dy, h.mode));
    let P = B;
    if (h.from !== undefined && h.from !== h.mode && k < 1) {
      const A = shiftY(F, handPose(F, f, h.from, h, B.curl), dyOf(h.dy, h.from));
      P = mix(A, B, h.mode === "catch" ? easeOutCubic(k) : smooth(k));
    }
    if (-P.p.z < HAND_NEAR && P.p.length() < 0.4) P.p.z = -HAND_NEAR;
    const curl = clamp01(h.curl ?? P.curl), W_ = toWorld(F, P);
    const item = h.item && curl >= 0.42 ? h.item : undefined;              // (props/her.ts peels the lychee from `peeled`)
    w.prop("herHand").put(W_.at, { rot: W_.rot, curl, item, peeled: h.peeled, wrist: wristOf(P, SHOULDER.hand, -0.067) });
    const itemAt = V(0.01, 0.024, -0.032).applyQuaternion(P.q).add(P.p), s = screen(F, P.p);
    out.hand = { palm: W_.at, item: itemAt.applyMatrix4(F.m), x: s.x, y: s.y };
  }
  return out;
};

/** KEYS -> { mode, from, k }: the mode of the last key at or before f, the one before it, and the progress (0..1,
 *  linear: putHer eases it) through `len` frames (a key's own third value, else `len`, default 10). Before the first
 *  key: { mode: first, k: 1 }.  herKeys(f, [[line("A01").from, "in"], [line("A02").from, "toward"]]) */
export const herKeys = <M extends string>(f: number, keys: [number, M, number?][], first = "off" as M, len = 10): { mode: M; from: M; k: number } => {
  let i = -1; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  if (i < 0) return { mode: first, from: first, k: 1 };
  const [at, mode, l] = keys[i];
  return { mode, from: i > 0 ? keys[i - 1][1] : first, k: clamp01((f - at) / Math.max(1, l ?? len)) };
};
