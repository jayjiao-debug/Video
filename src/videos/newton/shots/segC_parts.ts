// SEGMENT C's own helpers (WP5-C): framing, camera mixing, THE PITCH WHIP (up the stairs: the whip IS the cut: a lens
// blur ramp, no overlay), and his quill on the page. Every function is pure (frame in, pose out); nothing keeps state.
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, type CamPose } from "../story";
import { FOV } from "../layout";
import * as C from "../cam";
import { QUILL } from "../props";

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const sec = (s: number) => Math.round(s * FPS);
const v3 = (p: CamPose["pos"]) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));

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

// ------------------------------------------------------------------------------------------------- THE PITCH WHIP
/** WHIP UP: from `on`, `out` frames pitching up away from `c` (ease-in, `deg`), then `in` frames arriving into `to`
 *  from below (ease-out): the view keeps travelling UP through the cut (after him up the stairs). The cut is on
 *  on + out (`inDeg`: how far below `to` it arrives from, default `deg`). Returns the camera, the lens blur (the film's DOF at focus 0.05 m, all depths alike), smear 0..1 and cut. */
export const whipUp = (c: CamPose, f: number, on: number, o: { to: CamPose; deg?: number; inDeg?: number; out?: number; in?: number; blur?: number; yaw?: number }) => {
  const out = o.out ?? 6, inn = o.in ?? 6, deg = o.deg ?? 42, inDeg = o.inDeg ?? deg, yaw = o.yaw ?? 0, end = on + out + inn;
  if (f < on) return { cam: c, post: undefined, smear: 0, cut: false };
  if (f >= end) return { cam: o.to, post: undefined, smear: 0, cut: true };
  const leaving = f < on + out, u = leaving ? (f - on + 1) / out : (f - on - out) / inn;
  const k = leaving ? easeInCubic(u) : 1 - easeOutCubic(u);
  const cam = leaving ? C.nudge(c, { pitch: deg * k, yaw: yaw * k }) : C.nudge(o.to, { pitch: -inDeg * k, yaw: -yaw * k });
  return { cam, post: { dof: { focus: 0.05, amount: (o.blur ?? 24) * k } }, smear: k, cut: !leaving };
};
// (no overlay on the whip: the lens blur ramp alone carries it; r3's pale streaks read as rain / a glitch)

// ------------------------------------------------------------------------------------------------- his quill
/** the nib on the page (world) at frame f: lines of small loops from his left to his right, a carriage return every
 *  line, a lift between words (all from t). `page` = the page's point (ROOM.deskWrite). `k` 1 = writing, 0 = the nib
 *  held still just over the page. */
export const nibAt = (f: number, page: THREE.Vector3, k = 1) => {
  const t = f / FPS, LT = 2.1, RT = 0.34, CY = LT + RT;
  const n = Math.floor(t / CY), u = t - n * CY, row = ((n % 9) + 9) % 9, z0 = 0.06 - row * 0.012;
  let x: number, z: number, y: number;
  if (u < LT) {
    const p = u / LT, w = 2 * Math.PI * 5.2 * t;
    x = 0.05 - 0.1 * p + 0.0034 * Math.sin(w);
    z = z0 + 0.0048 * Math.max(0, Math.cos(w)) - 0.001;
    y = 0.003 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.6 * t)), 10);
  } else {
    const p = smooth((u - LT) / RT);
    x = -0.05 + 0.1 * p; z = z0 - 0.012 * p; y = 0.012 * Math.sin(Math.PI * p);
  }
  const nib = V(x, 0.004 + y, z), still = V(x, 0.016 + 0.002 * Math.sin(t * 1.3), z);
  return page.clone().add(nib.lerp(still, 1 - clamp01(k)));
};
/** the quill's direction from the nib up the feather (out toward his right, a little back) */
export const QDIR = V(-0.62, 0.76, -0.18).normalize();
export const QROT = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), QDIR);
/** the quill's turn for a feather direction `dir` (its +y) with its broad vane facing `toward` (a world direction, e.g.
 *  to her eyes): the quill's thin axis (+z) points as near to `toward` as it can */
export const quillRot = (dir: THREE.Vector3, toward: THREE.Vector3) => {
  const y = dir.clone().normalize(), z = toward.clone().addScaledVector(y, -toward.dot(y)).normalize(), x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
};
/** his writing fist for a nib point (the quill along `dir`) */
export const quillFist = (nib: THREE.Vector3, dir = QDIR) => nib.clone().addScaledVector(dir, -QUILL.nib);
/** a camera's position as a Vector3 */
export const posOf = (c: CamPose) => v3(c.pos);
