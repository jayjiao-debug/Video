// SEGMENT E's own helpers (WP5-E): framing, camera mixing, her walking ease, a lagged eye, the mic's aim through keys,
// his quill on the page, the page held in his hand and the fork. Copies of the generic camera helpers of segC_parts
// (kept here so segment E never moves when another segment's file changes). Every function is pure: nothing keeps
// state between frames.
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, type CamPose } from "../story";
import { FOV } from "../layout";
import * as C from "../cam";
import { QUILL, SHEET } from "../props";
import { hash as kitHash } from "../../../kit/props/kit";

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
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number, r = 0.25) => {
  const v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** a point averaged over the `win` frames up to f (weights falling off: her eyes follow a little late). Pure. */
export const lagged = (f: number, at: (g: number) => THREE.Vector3, win = 6) => {
  const p = V(); let ws = 0;
  for (let i = 0; i < win; i++) { const wg = win - i; p.addScaledVector(at(f - i), wg); ws += wg; }
  return p.divideScalar(ws);
};
/** the mic's aim through step keys [frame, aim(f)], each change eased over `len` frames */
export const aimThrough = (f: number, keys: [number, (g: number) => THREE.Vector3][], len = 9) => {
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  const cur = keys[i][1](f);
  if (i === 0) return cur;
  const k = smooth(clamp01((f - keys[i][0]) / len));
  return k >= 1 ? cur : keys[i - 1][1](f).lerp(cur, k);
};

// ------------------------------------------------------------------------------------------------- his quill
/** the nib on the page (world) at frame f: lines of small loops from his left to his right, a carriage return every
 *  line, a lift between words (all from t). `page` = the page's point (ROOM.deskWrite). `k` 1 = writing, 0 = the nib
 *  held still just over the page. */
export const nibAt = (f: number, page: THREE.Vector3, k = 1) => {
  const t = f / FPS, LT = 2.2, RT = 0.36, CY = LT + RT;
  const n = Math.floor(t / CY), u = t - n * CY, row = ((n % 9) + 9) % 9, z0 = 0.06 - row * 0.012;
  let x: number, z: number, y: number;
  if (u < LT) {
    const p = u / LT, w = 2 * Math.PI * 4.9 * t;
    x = 0.05 - 0.1 * p + 0.0033 * Math.sin(w);
    z = z0 + 0.0046 * Math.max(0, Math.cos(w)) - 0.001;
    y = 0.003 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.5 * t)), 10);
  } else {
    const p = smooth((u - LT) / RT);
    x = -0.05 + 0.1 * p; z = z0 - 0.012 * p; y = 0.012 * Math.sin(Math.PI * p);
  }
  const nib = V(x, 0.004 + y, z), still = V(x, 0.02 + 0.002 * Math.sin(t * 1.3), z);
  return page.clone().add(nib.lerp(still, 1 - clamp01(k)));
};
/** the quill's direction from the nib up the feather (toward his right shoulder, a little back) */
export const QDIR = V(-0.36, 0.84, -0.4).normalize();
export const QROT = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), QDIR);
/** his writing fist for a nib point */
export const quillFist = (nib: THREE.Vector3) => nib.clone().addScaledVector(QDIR, -QUILL.nib);

// ------------------------------------------------------------------------------------------------- the page in his hand
/** the first sheet of the `sheets` prop sits a little off the prop's origin and turned (props/things.ts: the kit's hash
 *  of the sheet's index): these undo it, so that the ONE sheet (n 1) is placed exactly */
const sh = (n: number, k = 0) => kitHash(n * 1.37 + k * 17.11);
const SUB0 = { x: 0.05 * (sh(0, 3) - 0.5), z: 0.04 * (sh(0, 5) - 0.5), ry: 0.5 * (sh(0, 7) - 0.5) };
/** THE PAGE HE READS (props "sheets", key "page", n 1): its bottom edge in his fist at `hand`, its face turned up toward
 *  his eyes (`eyes`), `lean` (0..1) how far it lies back from upright toward flat. `cam` + `camK` (0..1): the face
 *  turned that far toward the lens as well (a cheat, so the page never goes edge-on). Returns the prop's origin and
 *  rotation for put(at, { rot, n: 1 }). */
export const pagePut = (hand: THREE.Vector3, eyes: THREE.Vector3, lean = 0.45, cam?: THREE.Vector3, camK = 0) => {
  // the page's face, level: toward his eyes (and `camK` toward the lens)
  const flat = (v: THREE.Vector3) => v.clone().setY(0).normalize();
  const toEye = flat(eyes.clone().sub(hand));
  if (cam && camK > 0) toEye.lerp(flat(cam.clone().sub(hand)), camK).normalize();
  // ... laid back by `lean` x 90 deg toward the sky (the top edge tilts away from him, the page stays upright on screen)
  const a = (lean * Math.PI) / 2, n = toEye.multiplyScalar(Math.cos(a)).add(V(0, Math.sin(a), 0)).normalize();
  // down the page (the sheet's local +z, toward the hand's edge): world down made perpendicular to the face
  const down = V(0, -1, 0).addScaledVector(n, n.y).normalize();
  const x = new THREE.Vector3().crossVectors(n, down).normalize();
  const qs = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, down));
  // the sheet's middle: half a page up from the fist (the fist 1.2 cm inside the bottom edge)
  const mid = hand.clone().addScaledVector(down, -(SHEET.d / 2 - 0.012));
  // undo the sheet's own offset in the prop: group = sheet * inverse(sub)
  const qg = qs.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -SUB0.ry));
  const at = mid.clone().sub(V(SUB0.x, 0, SUB0.z).applyQuaternion(qg));
  return { at, rot: qg };
};

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
