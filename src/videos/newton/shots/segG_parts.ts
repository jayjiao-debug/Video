// SEGMENT G's own helpers (WP5-G): framing, camera mixing, her walking ease, the mic's aim through keys, axes ->
// quaternion, keyed rigid poses (the falling board), her invisible hands (poses in the camera's frame, the held board,
// the light focus), the fork, the night garden's grade and the doorway's warm spill.
// Copies of the generic camera helpers of segE_parts /
// segF_parts, kept here so segment G never moves when another segment's file changes. Every function is pure.
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeOutCubic, h, type CamPose } from "../story";
import { FOV } from "../layout";
import * as C from "../cam";
import type { GradeParams } from "../../vasa/grade";

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const sec = (s: number) => Math.round(s * FPS);
const v3 = (p: CamPose["pos"]) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));
/** a camera's position as a Vector3 */
export const posOf = (c: CamPose) => v3(c.pos);

/** a camera at `pos` turned so that the world point `p` lands on screen (sx, sy) px (vertical fov, 9:16) */
export const frameOn = (pos: THREE.Vector3, p: THREE.Vector3, sx: number, sy: number, fov = FOV): CamPose => {
  const tanV = Math.tan((fov * Math.PI) / 360), tanH = tanV * (1080 / 1920);
  const d = p.clone().sub(pos), yawP = Math.atan2(d.x, -d.z), pitchP = Math.atan2(d.y, Math.hypot(d.x, d.z));
  const yaw = yawP - Math.atan(((sx / 1080) * 2 - 1) * tanH), pitch = pitchP - Math.atan((1 - (sy / 1920) * 2) * tanV);
  const L = 3;
  return { pos: [pos.x, pos.y, pos.z], look: [pos.x + Math.sin(yaw) * Math.cos(pitch) * L, pos.y + Math.sin(pitch) * L, pos.z - Math.cos(yaw) * Math.cos(pitch) * L], fov };
};
/** two cameras mixed: position, view direction and fov (k 0..1, eased) */
export const mixCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const A = C.camAxes(a), B = C.camAxes(b), e = smooth(k);
  const pos = A.p.clone().lerp(B.p, e), dir = A.fwd.clone().lerp(B.fwd, e).normalize(), dist = lerp(A.dist, B.dist, e);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, e) };
};
/** two cameras blended at `e` as given (NOT eased here: the caller's ease, which may run a hair past 1 for an
 *  overshoot): position, view direction, fov and ROLL (mixCam drops roll; this keeps it) */
export const blendCam = (a: CamPose, b: CamPose, e: number): CamPose => {
  const A = C.camAxes(a), B = C.camAxes(b);
  const pos = A.p.clone().lerp(B.p, e), dir = A.fwd.clone().lerp(B.fwd, e).normalize(), dist = lerp(A.dist, B.dist, e);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, e), roll: lerp(a.roll ?? 0, b.roll ?? 0, e) };
};
/** a startle's ease: fast off the mark, a hair past the end (s = how far: 0.6 = about 2 %), settled at 1 */
export const startle = (x: number, s = 0.6) => { const u = clamp01(x) - 1; return 1 + (s + 1) * u * u * u + s * u * u; };
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number, r = 0.25) => {
  const v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** the mic's aim through step keys [frame, aim(f)], each change eased over `len` frames */
export const aimThrough = (f: number, keys: [number, (g: number) => THREE.Vector3][], len = 9) => {
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  const cur = keys[i][1](f);
  if (i === 0) return cur;
  const k = smooth(clamp01((f - keys[i][0]) / len));
  return k >= 1 ? cur : keys[i - 1][1](f).lerp(cur, k);
};
/** a world rotation from a thing's local +y and +z given as world directions (z made perpendicular to y) */
export const quatYZ = (y: THREE.Vector3, z: THREE.Vector3) => {
  const yy = y.clone().normalize(); let zz = z.clone().addScaledVector(yy, -z.dot(yy));
  if (zz.lengthSq() < 1e-8) zz = Math.abs(yy.y) < 0.9 ? V(0, 1, 0).addScaledVector(yy, -yy.y) : V(0, 0, 1);
  zz.normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(yy, zz), yy, zz));
};
/** a quaternion from Euler angles in the order YZX: yaw y, then a roll z about the yawed forward axis, then a tilt x
 *  (applied first): the board's tilt on his knee, its roll off his knee, its yaw on the floor */
export const eulYZX = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "YZX"));

/** A RIGID THING'S WAY THROUGH KEYS [frame, centre, rotation, ease?]: centre lerped, rotation slerped (the ease shapes
 *  the leg that arrives at its key; default smooth). Holds before the first and after the last key. */
export type RigidKey = [number, THREE.Vector3, THREE.Quaternion, ((x: number) => number)?];
export const rigidAt = (f: number, keys: RigidKey[]): { at: THREE.Vector3; rot: THREE.Quaternion } => {
  if (f <= keys[0][0]) return { at: keys[0][1].clone(), rot: keys[0][2].clone() };
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) {
    const [a, pa, qa] = keys[i - 1], [b, pb, qb, e] = keys[i], u = (e ?? smooth)(clamp01((f - a) / Math.max(1, b - a)));
    return { at: pa.clone().lerp(pb, u), rot: qa.clone().slerp(qb, u) };
  }
  const k = keys[keys.length - 1];
  return { at: k[1].clone(), rot: k[2].clone() };
};
/** a falling thing's ease (gravity: slow at first, fast at the end) */
export const fall = (x: number) => x * x;

// ------------------------------------------------------------------------------------------------- her invisible hands
// SHE IS INVISIBLE (Jay, 14 Nov): no mic and no hand are drawn. What her hands hold is placed in HER frame (the
// camera's), so it moves with her as one body: an invisible pair of hands. A pose in the camera's frame: p = metres
// (x right, y up, z BACK toward her, three.js camera axes), q = the rotation relative to the camera's axes.
export type CamLocal = { p: THREE.Vector3; q: THREE.Quaternion };
const camQuat = (F: C.CamFrame) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.right, F.up, F.fwd.clone().negate()));
/** a world pose -> the camera's frame */
export const toCamLocal = (cam: CamPose, at: THREE.Vector3, rot: THREE.Quaternion): CamLocal => {
  const F = C.camFrame(cam), d = at.clone().sub(F.p);
  return { p: V(d.dot(F.right), d.dot(F.up), -d.dot(F.fwd)), q: camQuat(F).invert().multiply(rot) };
};
/** a pose in the camera's frame -> world */
export const fromCamLocal = (cam: CamPose, L: CamLocal): { at: THREE.Vector3; rot: THREE.Quaternion } => {
  const F = C.camFrame(cam);
  return { at: F.p.clone().addScaledVector(F.right, L.p.x).addScaledVector(F.up, L.p.y).addScaledVector(F.fwd, -L.p.z), rot: camQuat(F).multiply(L.q) };
};
/** THE BOARD HELD UP BY HER INVISIBLE HANDS (a steady copy of cam.ts boardHold, without the hands): k 0..1 = it comes
 *  up into the frame from below (lowered out: its top tips away from her as it goes down, as two hands lower a board
 *  to the lap); its face to the lens tilted back `tilt` deg (6), the drawing upright (a slow roll of half a degree,
 *  millimetres of life: held, never frozen, never swaying), its middle at (px, py) on the frame at `depth` m */
export const heldBoard = (cam: CamPose, f: number, o: { k?: number; px?: number; py?: number; depth?: number; tilt?: number } = {}) => {
  const F = C.camFrame(cam), k = easeOutCubic(clamp01(o.k ?? 1)), depth = o.depth ?? 0.72;
  const life = V(0.0018 * Math.sin(f * 0.061 + 2), 0.0015 * Math.sin(f * 0.047 + 3.3), 0.001 * Math.sin(f * 0.037 + 4.1));
  const mid = C.fromScreen(F, o.px ?? 540, (o.py ?? 820) + (1 - k) * 1300, depth).add(life);
  const tilt = ((o.tilt ?? 6) + 26 * (1 - k)) * Math.PI / 180, roll = 0.009 * Math.sin(f * 0.043) + 0.05 * (1 - k);
  // its axes in camera space (x right, y up, z forward): its face (+z) toward the lens, its +y up the frame
  const zb = V(0, Math.sin(tilt), -Math.cos(tilt)), up0 = V(-Math.sin(roll), Math.cos(roll), 0), yb = up0.addScaledVector(zb, -up0.dot(zb)).normalize();
  const w = (c: THREE.Vector3) => F.right.clone().multiplyScalar(c.x).addScaledVector(F.up, c.y).addScaledVector(F.fwd, c.z);
  return { at: C.camToWorld(F, mid.x, mid.y, mid.z), rot: quatYZ(w(yb), w(zb)) };
};
/** the lowest point of a box (half sizes hx, hy, hz) put at `at` with `rot`: world y */
export const boxBottom = (at: THREE.Vector3, rot: THREE.Quaternion, hx: number, hy: number, hz: number) => {
  let lo = Infinity;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) lo = Math.min(lo, at.y + V(sx * hx, sy * hy, sz * hz).applyQuaternion(rot).y);
  return lo;
};
/** the film's light focus (amount 3) on a world point: what the mic's aim used to give (segA / segC do the same) */
export const lightFocus = (cam: CamPose, p: THREE.Vector3, amount = 3) => ({ focus: Math.max(0.2, posOf(cam).distanceTo(p)), amount });

// ------------------------------------------------------------------------------------------------- the fork
/** the fork's tines' tip above its hilt (the origin), along its +y */
export const FORK_TIP = 0.128;
/** the fork's rotation with its +y (toward the tines) along `dir` (world), the tines spread level (local x level) */
export const forkRot = (dir: THREE.Vector3) => {
  const y = dir.clone().normalize();
  let x = new THREE.Vector3().crossVectors(y, V(0, 1, 0));
  if (x.lengthSq() < 1e-6) x = V(1, 0, 0); else x.normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
};
/** a point's way through [frame, point, ease?] keys (a hand that travels) */
export type PtKey = [number, THREE.Vector3, ((x: number) => number)?];
export const pathAt = (f: number, keys: PtKey[]) => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1].clone().lerp(keys[i][1], (keys[i][2] ?? smooth)(clamp01((f - keys[i - 1][0]) / Math.max(1, keys[i][0] - keys[i - 1][0]))));
  return keys[keys.length - 1][1].clone();
};

// ------------------------------------------------------------------------------------------------- the night garden
/** F1's night-garden grade (a COPY of segF_parts GRADE_NIGHT, so G's last shot of the garden matches F's first): the
 *  moonlit colours pulled toward a desaturated blue, the highlights (the lit window, the firelight) left warm */
export const GRADE_NIGHT: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.66, 0.74, 1.0], tintS: [0.034, -0.016], tintM: [0.024, -0.012], tintH: [-0.018, 0.022], vig: [0.22, 0.4] };
/** the same grade with the low end and the mids lifted a step (the last shot: a blue MID-TONE, owner's "too dark") */
export const GRADE_NIGHT_LIFT: GradeParams = { ...GRADE_NIGHT, ky: [0.02, 0.135, 0.32, 0.625, 0.845, 0.945, 1] };
/** the last shot's grade: the lift, with the highlights' warm tint taken down so the moonlit gravel of the walk (a
 *  highlight here, close to the lens) stays blue-grey as in F1 instead of going lilac; the lit window and the
 *  firelight are warm by themselves */
export const GRADE_NIGHT_G5: GradeParams = { ...GRADE_NIGHT_LIFT, tintH: [-0.004, 0.008] };
/** A WARM SPILL of firelight (a soft radial glow, screen-blended) centred at (x, y) px on the 1080 x 1920 frame,
 *  radius r px, strength k 0..1 (the same look as segF_parts flash) */
export const spill = (key: string, p: { x: number; y: number }, r: number, k: number) => k <= 0.01 ? null :
  h("div", { key, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", mixBlendMode: "screen", opacity: Math.min(1, k),
    background: `radial-gradient(circle ${Math.round(r)}px at ${Math.round(p.x)}px ${Math.round(p.y)}px, rgba(255,170,90,0.62) 0%, rgba(255,130,60,0.34) 42%, rgba(255,110,40,0) 100%)` } });
