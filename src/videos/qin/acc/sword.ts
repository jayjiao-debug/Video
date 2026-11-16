// THE EMPEROR'S SWORD of the Qin film (PLAN 2-3, bible 2: "long sword + scabbard, blade far too long; REUSE scabbard +
// pullOut from 石中剑, longer blade") and THE DRAW GAG of segment A (PLAN 7 A4: two stuck tugs, then the third pull
// swings it up over his shoulder and out until the tip stops 0.4 m from her lens; a nod to 王负剑 in the 荆轲 story).
//   qinSword()        his accessories: the kit's scabbard at his LEFT hip (kit acc/garb.ts swordBelt, side 1: black
//                     lacquer with gold throat and tip, hanging low and back from a strap) and the hilt standing in its
//                     mouth (kit hilt: gold guard and pommel, a dark red grip). The scabbard is the kit's ordinary size:
//                     the joke is the 1.30 m blade (the world prop "sword", props/index.ts) that comes out of it.
//                     hide: ["hilt"] = the sword is out (its mouth is then a dark opening); hide: ["swordBelt"] = no
//                     scabbard (seated at the desk: props "scabbard" lies on the floor instead)
//   hiltGrip(rig)     where a hand grips the hilt (world; the kit's hiltWorld): read it AFTER w.update()
//   swordDraw(t, o)   the whole gag as a pure function of t (seconds from its start; DRAW has the times): the drawing
//                     hand's target, the body's jerks, whether the hilt is hidden, the sword's rotation, the camera's
//                     shake and the smear's strength
//   swordShoulder(o)  the sword resting on his left shoulder (blade up and back), hand beside his head: he can walk off
//                     with it (A13) or hold it there
//   swordAim(o, k)    k 1 = the tip at her lens (the end of the draw), 0 = lowered (A10: the tip down in front of him)
//   swordRot(dir, toCam)  the prop's rot ([rx, ry, rz], Euler YXZ) that points the blade (+y) along dir with its flat
//                     toward toCam
// THE DRAWING HAND is his LEFT hand (arm 1), the scabbard's side: the rig cannot draw across its body (kit garb.ts).
// Hand targets are world points made for HIS SIZE (o.scale, the EMPEROR's 1.08): addPerson's personalise solves him at
// 1.45 m and draws him scaled about his feet, so an offset in his own frame is multiplied by his scale.
//
// SEGMENT A, the draw (every frame, f = the film frame, T0 = the frame the gag starts; at / facing = his mark; cam =
// this frame's camera; EMP = the figure that plays him):
//   const D = swordDraw((f - T0) / FPS, { at, facing, lens: v3(cam.pos) });
//   const r = w.actor(EMP);
//   r.set({ at: D.at, facing, pose: D.pose, head: D.head, hide: D.hide, expr, visible: true });
//   w.update();                                   // 1st solve: the scabbard (and its hilt) where his body is now
//   const hand = D.handAt(hiltGrip(r));           // the hand's target on this frame (on the hilt, travelling, raised)
//   if (hand) { r.set({ hands: D.arm ? [null, hand] : [hand, null] }); w.update(); }   // 2nd solve with the hand pinned
//   if (D.sword) w.prop("sword").put(r.handWorld(D.arm), { grip: "hilt", rot: D.sword.rot });
//   camera: cam.ts tremble / handheld with D.shake; overlay: a smear of strength D.smear along the hand's path
// (Segment A, v3: the struggle is longer than DRAW's two tugs: shots/segA.ts plays its own four tugs and the haul between
// its tug 1 and the ring (struggle()), and takes the reach, the wind-up's end, the smear, the swing and the point from
// swordDraw with its clock warped onto the mix's hits.)
// The tip at the end stands `tip` (0.4 m) from o.lens only if he stands far enough: put his mark at drawStand(...)
// (about 2.1 m from her lens); swordDraw's `reachShort` says by how much the tip falls short (0 = it reaches).
import * as THREE from "three";
import type { Acc, Rig, RigHead, RigPose } from "../../group/kit/rig3d";
import { turned, roundBox, shade } from "../../group/kit/rigacc/shapes";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const eOut = (x: number) => 1 - (1 - clamp01(x)) ** 3;
const eIn = (x: number) => clamp01(x) ** 3;
/** ease out with a small overshoot (back), 0 -> 1 */
const eBack = (x: number, s = 1.4) => { const t = clamp01(x) - 1; return 1 + (s + 1) * t * t * t + s * t * t; };
const lin = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
type V3 = THREE.Vector3 | [number, number, number];
const toV = (p: V3) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

/** the sword's colours: black lacquer scabbard, gold fittings, a dark red grip (kept off black: the ink is darker) */
export const SWORD_COL = { lacquer: "#2e2a33", gold: "#e2b03a", grip: "#6a2a26" } as const;

// ---------------------------------------------------------------------------------------------- the scabbard + hilt
/** THE MOUNT (body metres from the bottom of the body on its axis: x = the person's left, y up, z forward; the
 *  figure's own unscaled size). Adapted from the kit's swordBelt (src/kit/acc/garb.ts), whose mouth hangs 11.5 cm
 *  under the body's bottom: there the rig's arm cannot reach the grip (it hangs at full stretch 10 cm above it:
 *  measured, /home/user/qin_work/wp3), so the draw gag had no hilt to pull. Here the mouth sits higher and further
 *  back at the hip (9 cm higher, 11 cm further back), the hilt leans forward and up out of it, its grip just behind and
 *  under the resting hand: the hand reaches it (rig.qa.reach 0.004 with the grip target of swordDraw: the hand ball
 *  touches the grip, 3.9 cm from its axis) and a keep-out ball on the hilt keeps the resting and swinging arm clear
 *  (rig.qa.clear 0 in idle and in a walk from five sides; measured headless, /home/user/qin_work/wp3/qa/mount.ts).
 *  The tip hangs 0.27 m above his floor and 0.5 m behind his axis (at his 1.08): keep that clear behind him.
 *    y = the mouth's height from the body's bottom, z = how far forward, out = how far out from the body's side,
 *    deg = the scabbard's angle back from plumb, splay = its lean outward, L = its length (to the tip) */
export const SCABBARD = { y: -0.03, z: -0.12, out: 0.05, deg: 50, splay: 0.16, L: 0.5, kr: 0.018 };
type Mount = { pv: THREE.Group; put: (m: THREE.Object3D, y: number) => void; L: number; grip: THREE.Vector3 };
/** hangs the parts in a pivot at `at` on the torso that keeps them plumb when the torso leans (Arthur's plumb) */
const plumb = (parts: THREE.Object3D[], at: THREE.Vector3, o: { back: number; fwd: number }) => {
  const torso = parts[0].parent!, pv = new THREE.Group();
  pv.position.copy(at); torso.add(pv);
  for (const p of parts) { pv.add(p); p.position.sub(at); }
  const base = pv.updateMatrixWorld;
  pv.updateMatrixWorld = function (force?: boolean) {
    const e = torso.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]) || 1;
    pv.rotation.x = Math.max(-o.fwd, Math.min(o.back, Math.asin(Math.max(-1, Math.min(1, e[9] / l)))));
    base.call(pv, force);
  };
  return pv;
};
/** one normal per position (an ink hull stays closed over seams) */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** THE SCABBARD at the LEFT hip (side 1; 0 = the right): black lacquer with a gold throat, a gold band and a gold tip,
 *  hung from a short strap off the sash (painted strap + a 3D one), plumb when the torso leans. Named "swordBelt" like
 *  the kit's (the clearance checker tests the arms against it by that name). Slot waist. hide: ["swordBelt"] */
export const scabbard = (o: { col?: string; gold?: string; side?: 0 | 1; mount?: Partial<typeof SCABBARD> } = {}): Acc => {
  const col = o.col ?? SWORD_COL.lacquer, gold = o.gold ?? SWORD_COL.gold, side = o.side ?? 1, s = side ? 1 : -1, M = { ...SCABBARD, ...o.mount };
  return {
    name: "swordBelt", slots: ["waist"], key: ["qinScabbard", col, gold, side, M.y, M.z, M.out, M.deg, M.splay, M.L, M.kr].join("|"),
    outfit(c) {
      // the hanger: from the sash at the front down round the hip to where the scabbard hangs
      const P = c.P, pts = [P(s * 34, 0.36), P(s * 60, 0.24), P(s * 84, 0.1)];
      c.line(pts, shade(col, 0.6), 15); c.line(pts, shade(gold, 0.85), 6);
    },
    build(b) {
      const L = M.L, FL = 0.74, parts: THREE.Object3D[] = [], ink = 0.0062, th = (M.deg * Math.PI) / 180;
      // in its own frame the scabbard runs along y from the tip (0) to the mouth (L), an oval (thinner across x); turned to
      // hang down and back `deg` from plumb, splayed out, its mouth facing up and forward
      const dir = new THREE.Vector3(s * M.splay, -Math.cos(th), -Math.sin(th)).normalize(), T = new THREE.Vector3(s * (b.rb + M.out), M.y, M.z);
      const qt = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      const put = (m: THREE.Object3D, y: number) => { m.quaternion.copy(qt); m.position.copy(T).addScaledVector(dir, L - y); parts.push(m); };
      const flat = (g: THREE.BufferGeometry, k: number) => { g.scale(k, 1, 1); return weld(g); };
      put(b.solid("body", flat(turned([[0, 0], [0.014, 0], [0.022, 0.04], [0.03, L], [0, L]], 0.008, 28), FL), { col, ink }), 0);
      // the gold tip, a gold band two thirds up, the gold throat with the dark mouth
      put(b.solid("body", flat(turned([[0, -0.012], [0.02, -0.012], [0.0275, 0.03], [0.0285, 0.08], [0, 0.08]], 0.008, 28), 0.84), { col: gold, ink }), 0);
      put(b.solid("body", flat(turned([[0, 0], [0.0335, 0], [0.0335, 0.022], [0, 0.022]], 0.004, 28), 0.8), { col: gold, ink: 0.005 }), L * 0.62);
      const lg = turned([[0, -0.065], [0.0345, -0.065], [0.0365, 0.006], [0, 0.006]], 0.005, 28);
      put(b.solid("body", flat(lg, 0.8), { col: gold, ink }), L);
      // the strap it hangs from: from inside the body's side down to the throat
      const A = new THREE.Vector3(s * 0.72 * b.rb, 0.075, M.z * 0.5), B = T.clone().addScaledVector(dir, 0.03), strap = b.solid("body", roundBox(0.021, A.distanceTo(B) + 0.02, 0.034, 0.5), { col: shade(col, 1.25), ink: 0.005 });
      strap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), A.clone().sub(B).normalize()); strap.position.copy(A).add(B).multiplyScalar(0.5); parts.push(strap);
      const pv = plumb(parts, A, { back: 0.6, fwd: 0.35 });
      b.keepOut(T.clone().addScaledVector(dir, 0.03), 0.034);
      b.keepOut(T.clone().addScaledVector(dir, 0.13), 0.03);
      const mount: Mount = { pv, L, grip: T.clone().addScaledVector(dir, -0.062).sub(A), put: (m, y) => { m.quaternion.copy(qt); m.position.copy(T).addScaledVector(dir, L - y).sub(A); pv.add(m); } };
      pv.parent!.userData.qinSword = mount;
      // the hilt's keep-out balls (the hilt is its own accessory, but the arms must stay clear of it even before it is built)
      b.keepOut(T.clone().addScaledVector(dir, -0.07), M.kr);
    },
  };
};
/** THE HILT standing in the scabbard's mouth (scabbard() must come before it): a gold lozenge guard, a dark red grip
 *  bound with cord, a gold disc pommel. Its own accessory so that hide: ["hilt"] takes the sword out (the drawn sword is
 *  the world prop "sword"; the mouth is then a dark opening). Named "hilt" like the kit's. No slot. */
export const swordHilt = (o: { grip?: string; gold?: string } = {}): Acc => ({
  name: "hilt", slots: [], key: ["qinHilt", o.grip ?? "", o.gold ?? ""].join("|"),
  build(b) {
    const gold = o.gold ?? SWORD_COL.gold, ink = 0.0062;
    const pommel = b.solid("body", turned([[0, -0.012], [0.019, -0.012], [0.023, 0], [0.019, 0.012], [0, 0.012]], 0.004, 20), { col: gold, ink });
    const M = pommel.parent!.userData.qinSword as Mount | undefined;
    if (!M) throw new Error('qin sword: "hilt" needs scabbard() before it in the accessory list');
    M.put(pommel, M.L + 0.118);
    const guard = b.solid("body", roundBox(0.026, 0.024, 0.104, 0.45), { col: gold, ink }); M.put(guard, M.L + 0.016);
    const map = b.tex(16, 128, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 16, 128); g.fillStyle = "#b9a48a"; for (let y = 6; y < 128; y += 14) g.fillRect(0, y, 16, 4); }, "qinGripCord");
    const grip = b.solid("body", turned([[0, 0], [0.0125, 0], [0.0115, 0.088], [0, 0.088]], 0.004, 20), { col: o.grip ?? SWORD_COL.grip, map, ink: 0.005 }); M.put(grip, M.L + 0.024);
  },
});
/** the sword at his hip: scabbard + hilt (see the head of this file) */
export const qinSword = (): Acc[] => [scabbard(), swordHilt()];
/** where a hand grips the hilt at his hip (world; the middle of the grip), or null for a figure without the sword.
 *  After w.update(). */
export const hiltGrip = (r: Rig): THREE.Vector3 | null => {
  let M: Mount | undefined;
  for (const c of r.group.children) if (c.userData.qinSword) M = c.userData.qinSword as Mount;
  if (!M) return null;
  M.pv.updateWorldMatrix(true, false);
  return M.pv.localToWorld(M.grip.clone());
};

/** a point in a standing figure's own frame (x = to its LEFT, y up from its feet, z forward), times its size s */
const relS = (at: THREE.Vector3, facing: number, s: number, x: number, y: number, z: number) =>
  at.clone().add(V((Math.cos(facing) * x + Math.sin(facing) * z) * s, y * s, (-Math.sin(facing) * x + Math.cos(facing) * z) * s));
/** a direction in the figure's own frame -> world */
const dirS = (facing: number, x: number, y: number, z: number) => V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z).normalize();

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
/** the rot ([rx, ry, rz], Euler "YXZ", props/index.ts put) that turns the sword's +y (toward the tip) along `dir` and
 *  its flat (+z) as near to `toCam` as it can (the blade shows its broad side to the lens, not its edge) */
export const swordRot = (dir: THREE.Vector3, toCam: THREE.Vector3): [number, number, number] => {
  const y = dir.clone().normalize();
  let z = toCam.clone().addScaledVector(y, -toCam.dot(y));
  if (z.lengthSq() < 1e-8) z = V(0, 1, 0).addScaledVector(y, -y.y);
  if (z.lengthSq() < 1e-8) z = V(0, 0, 1);
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  z.crossVectors(x, y).normalize();
  _m.makeBasis(x, y, z); _q.setFromRotationMatrix(_m); _e.setFromQuaternion(_q, "YXZ");
  return [_e.x, _e.y, _e.z];
};

/** the gag's times (s from its start; PLAN 7 A4: the hand goes to the hilt, two stuck tugs of 0.5 s, the third pull
 *  swings it over the shoulder and out). The sword shows from `shown`; the hilt at the hip hides from `free`. */
export const DRAW = { reach: 0.3, tug1: 0.3, tug2: 0.8, wind: 1.3, free: 1.42, shown: 1.5, swing: 1.5, point: 1.82, end: 1.82 } as const;
/** the sword's length from the middle of its grip to its tip (props/index.ts SWORD.tip; kept here so acc/ does not
 *  import the props) */
export const SWORD_REACH = 1.375;
/** where his drawing (left) hand rests on his left shoulder, the sword over it: beside the head, out past the crown's
 *  board (in his own frame, unscaled: x left, y up, z forward) */
const SHOULDER: [number, number, number] = [0.34, 1.2, 0.0];
/** the blade over the shoulder: up and back, a little outward (his frame) */
const OVER: [number, number, number] = [0.16, 0.62, -0.77];
/** where the hand holds the sword out at the lens (his frame, unscaled): in front of his left chest */
const POINT: [number, number, number] = [0.14, 1.0, 0.3];
/** where the hand hangs at rest on his left (shots/common.ts hang, unscaled) */
const HANG: [number, number, number] = [0.172, 0.58, 0.035];
/** the hand's target on the grip: the grip's middle moved this far toward his shoulder (his frame, unscaled), so the
 *  hand ball lies against the grip's near side (it reaches: the grip is at the end of his arm) */
const ON_GRIP: [number, number, number] = [-0.3 * 0.04 / 0.989, 0.9 * 0.04 / 0.989, 0.25 * 0.04 / 0.989];

export type DrawO = {
  /** his floor point and facing (his mark) */ at: V3; facing: number;
  /** the lens (the camera's position at the end of the draw): the tip points at it */ lens: V3;
  /** his size (the EMPEROR's Person.scale, 1.08) */ scale?: number;
  /** how far from the lens the tip stops (m, PLAN: 0.4) */ tip?: number;
  /** where on screen the tip aims, as an offset from the lens's axis toward him (m at the tip; default a little low
   *  and to his left: the blade reads as a diagonal, not as a dot) */ aim?: [number, number, number];
};
export type DrawPose = {
  /** what part of the gag this is */ phase: "rest" | "reach" | "tug" | "wind" | "smear" | "swing" | "point";
  /** the drawing hand (1 = his left) */ arm: 0 | 1;
  /** his floor point this frame (the mark plus the tugs' jerks) */ at: THREE.Vector3;
  pose: RigPose;
  /** head accents for the tugs (add your speak() head with shots/common.ts heads()) */ head?: RigHead;
  /** accessories to hide: ["hilt"] once the sword is out of the scabbard */ hide: string[];
  /** the hand's target, given the hilt's grip read after the first solve (null = leave the hand free) */
  handAt: (hilt: THREE.Vector3 | null) => THREE.Vector3 | null;
  /** the world prop "sword": put it in the solved hand with grip "hilt" and this rot; null = not shown */
  sword: { rot: [number, number, number]; dir: THREE.Vector3 } | null;
  /** the camera's shake 0..1 (cam.ts): flinches on the tugs, a jolt when the tip arrives, then her tremble */
  shake: number;
  /** 0..1: the smear's strength on the frames the hand flies from the hip to the shoulder (the sword is hidden) */
  smear: number;
  /** metres the tip falls short of `tip` from the lens at the end (0 = it reaches): move his mark (drawStand) */
  reachShort: number;
};

/** the draw gag at t seconds from its start; see the head of this file for how a segment uses it */
export const swordDraw = (t: number, o: DrawO): DrawPose => {
  const at0 = toV(o.at), F = o.facing, s = o.scale ?? 1.08, lens = toV(o.lens), arm: 0 | 1 = 1;
  const D = DRAW;
  const shoulder = relS(at0, F, s, ...SHOULDER), point = relS(at0, F, s, ...POINT), hang = relS(at0, F, s, ...HANG);
  const onGrip = relS(V(), F, s, ...ON_GRIP);
  // the blade's end direction: from the hand to a point `tip` short of the lens, nudged by `aim`
  const aim = o.aim ?? [0.06, -0.05, 0];
  const camR = V(Math.cos(F), 0, -Math.sin(F));                                   // his left = the camera's right
  const target = lens.clone().add(camR.clone().multiplyScalar(aim[0])).add(V(0, aim[1], 0));
  const toLens = target.clone().sub(point), dEnd = toLens.clone().normalize(), dOver = dirS(F, ...OVER);
  const reachShort = Math.max(0, toLens.length() - SWORD_REACH - (o.tip ?? 0.4));
  const rotFor = (d: THREE.Vector3, hand: THREE.Vector3) => ({ rot: swordRot(d, lens.clone().sub(hand)), dir: d.clone() });
  const idle: RigPose = { kind: "idle", t };
  const base = { arm, sword: null, shake: 0, smear: 0, reachShort } as const;
  if (t < 0) return { ...base, phase: "rest", at: at0, pose: idle, hide: [], handAt: () => null };
  // ---- reach: the hand goes to the hilt
  if (t < D.reach) {
    const k = smooth(t / D.reach);
    return { ...base, phase: "reach", at: at0, pose: idle, hide: [], handAt: (h) => (h ? hang.clone().lerp(h.clone().add(onGrip), k) : null) };
  }
  // ---- the two stuck tugs, then the wind-up: the hand stays on the grip; the BODY jerks (back and down, a twist), the
  // head jolts; the hand pulls 2-3 cm up the scabbard's line and snaps back
  if (t < D.free) {
    const tug = t < D.tug2 ? 0 : t < D.wind ? 1 : 2, t0 = tug === 0 ? D.tug1 : tug === 1 ? D.tug2 : D.wind, u = t - t0;
    const amp = [0.6, 1.0, 0.8][tug];
    // a yank: fast out (0.07 s), held a beat, back (0.2 s); the wind-up (tug 2) just crouches and stays
    const yank = tug === 2 ? smooth(u / 0.1) : u < 0.07 ? eOut(u / 0.07) : u < 0.16 ? 1 : 1 - smooth((u - 0.16) / 0.2);
    const back = 0.035 * amp * yank, down = (tug === 2 ? 0.035 : 0.018 * amp) * yank;
    const at = relS(at0, F, 1, 0, -down, -back);
    const head: RigHead | undefined = tug === 2 ? { dy: -0.06 * yank, squash: 0.05 * yank } : yank > 0.01 ? { dy: -0.05 * amp * yank, squash: 0.07 * amp * yank, tilt: (tug ? -6 : 4) * yank } : undefined;
    const pull = dirS(F, -0.1, 0.64, 0.77).multiplyScalar(0.022 * amp * yank * s).add(onGrip);
    return { ...base, phase: tug === 2 ? "wind" : "tug", at, pose: idle, head, hide: [], shake: tug === 2 ? 0 : 0.35 * yank, handAt: (h) => (h ? h.clone().add(pull) : null) };
  }
  // ---- the smear: the hand flies up from the hip to beside his head; the sword is out (hilt hidden) but not drawn
  if (t < D.shown) {
    const k = eOut((t - D.free) / (D.shown - D.free));
    const at = relS(at0, F, 1, 0, -0.035 * (1 - k), 0);
    return { ...base, phase: "smear", at, pose: idle, hide: ["hilt"], smear: 1 - 0.4 * k, handAt: (h) => (h ? h.clone().add(onGrip).lerp(shoulder, k) : shoulder.clone()) };
  }
  // ---- the swing: from over the shoulder (blade up and back) over the top and down to the lens, with a small overshoot
  if (t < D.point) {
    const u = lin(t, D.swing, D.point), k = eBack(u, 1.1), kh = smooth(u);
    const hand = shoulder.clone().lerp(point, kh);
    hand.y += 0.07 * s * Math.sin(Math.PI * kh);                                    // the hand rises a little over the top
    const d = slerpDir(dOver, dEnd, k);
    return { ...base, phase: "swing", at: at0, pose: idle, hide: ["hilt"], sword: rotFor(d, hand), shake: u > 0.85 ? 1 : 0, smear: u < 0.5 ? 0.35 * (1 - u * 2) : 0, handAt: () => hand };
  }
  // ---- the point: held; the camera trembles (her), a jolt as it arrives
  const since = t - D.point, shake = since < 0.12 ? 1 : 0.55;
  return { ...base, phase: "point", at: at0, pose: idle, hide: ["hilt"], sword: rotFor(dEnd, point), shake, handAt: () => point.clone() };
};
/** a direction between a and b (unit vectors) along the great circle, k may run past 1 (an overshoot) */
const slerpDir = (a: THREE.Vector3, b: THREE.Vector3, k: number) => {
  const qa = new THREE.Quaternion().setFromUnitVectors(a, b), id = new THREE.Quaternion();
  const q = k <= 1 ? id.clone().slerp(qa, k) : id.clone().slerp(qa, 1).multiply(id.clone().slerp(qa, k - 1));
  return a.clone().applyQuaternion(q).normalize();
};

/** the floor point to stand on so that the tip of the drawn sword ends `tip` m from the lens: along the line from the
 *  lens toward `toward` (his mark as planned), at the distance the blade needs */
export const drawStand = (lens: V3, toward: V3, o: { scale?: number; tip?: number } = {}) => {
  const L = toV(lens), T = toV(toward), s = o.scale ?? 1.08, d = V(T.x - L.x, 0, T.z - L.z).normalize();
  // hand ~0.3 m in front of his body at chest height; the hand-to-lens distance must be the blade + the tip gap
  const handY = POINT[1] * s, need = SWORD_REACH + (o.tip ?? 0.4), dy = L.y - handY, flat = Math.sqrt(Math.max(0.01, need * need - dy * dy));
  return V(L.x, T.y, L.z).addScaledVector(d, flat + POINT[2] * s);
};

/** the sword resting on his left shoulder (blade up and back over it): the hand's target and the prop's rot. Walking
 *  with it is fine (the hand is pinned in his frame, so it rides along). lens = the camera's position (the flat faces it) */
export const swordShoulder = (o: { at: V3; facing: number; lens: V3; scale?: number }) => {
  const at = toV(o.at), s = o.scale ?? 1.08, hand = relS(at, o.facing, s, ...SHOULDER), d = dirS(o.facing, ...OVER);
  return { arm: 1 as const, hand, rot: swordRot(d, toV(o.lens).sub(hand)), dir: d };
};
/** the drawn sword held out: k 1 = the tip at her lens (the end of the draw), 0 = lowered in front of him, the tip down
 *  and forward 0.15 m above the floor (A10). Pure; the hand's target and the prop's rot. */
export const swordAim = (o: DrawO, k: number) => {
  const at = toV(o.at), F = o.facing, s = o.scale ?? 1.08, lens = toV(o.lens), e = smooth(k);
  const point = relS(at, F, s, ...POINT), low = relS(at, F, s, 0.16, 0.66, 0.22), hand = low.clone().lerp(point, e);
  const aim = o.aim ?? [0.06, -0.05, 0], camR = V(Math.cos(F), 0, -Math.sin(F));
  const dUp = lens.clone().add(camR.multiplyScalar(aim[0])).add(V(0, aim[1], 0)).sub(point).normalize();
  // lowered: the tip forward and down to 0.15 m above his floor
  const fwd = dirS(F, 0.05, 0, 1), drop = Math.max(0.05, low.y - at.y - 0.15), run = Math.sqrt(Math.max(0.01, SWORD_REACH ** 2 - drop * drop));
  const dLow = fwd.multiplyScalar(run).add(V(0, -drop, 0)).normalize();
  const d = slerpDir(dLow, dUp, e);
  return { arm: 1 as const, hand, rot: swordRot(d, lens.clone().sub(hand)), dir: d };
};
