// SEGMENT F's own helpers (WP5-F): framing, camera mixing, her walking ease, a lagged eye, the mic's aim through keys
// (copies of the generic camera helpers of segE_parts, kept here so segment F never moves when another segment's file
// changes), the constant-speed push, axes -> quaternion, THE SHOVEL by its blade, the charcoal's strokes on the board
// and THE SPARKS (a 2D burst out of the fire door: the fire spits, the shovel's charcoal goes in, the poker stirs).
// Every function is pure: nothing keeps state between frames; all noise from hash().
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeOutCubic, hash, h, type CamPose } from "../story";
import { FOV } from "../layout";
import * as C from "../cam";

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
/** two cameras mixed LINEARLY (k as given, no ease): for a push that runs at its own speed */
export const lerpCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const A = C.camAxes(a), B = C.camAxes(b);
  const pos = A.p.clone().lerp(B.p, k), dir = A.fwd.clone().lerp(B.fwd, k).normalize(), dist = lerp(A.dist, B.dist, k);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, k) };
};
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number, r = 0.25) => {
  const v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** THE SLOW PUSH: 0..1 over [from, to] at a constant speed with soft starts of `ramp` frames (cam.ts creep's profile) */
export const creepU = (f: number, from: number, to: number, ramp = 8) => {
  const n = Math.max(1, to - from), r = Math.min(ramp, n / 3), x = clamp01((f - from) / n) * n, v = 1 / (n - r);
  return clamp01(x < r ? (v * x * x) / (2 * r) : x > n - r ? 1 - (v * (n - x) * (n - x)) / (2 * r) : v * (x - r / 2));
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
/** a world rotation from a thing's local +y and +z given as world directions (z made perpendicular to y) */
export const quatYZ = (y: THREE.Vector3, z: THREE.Vector3) => {
  const yy = y.clone().normalize(); let zz = z.clone().addScaledVector(yy, -z.dot(yy));
  if (zz.lengthSq() < 1e-8) zz = Math.abs(yy.y) < 0.9 ? V(0, 1, 0).addScaledVector(yy, -yy.y) : V(0, 0, 1);
  zz.normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(yy, zz), yy, zz));
};

// ------------------------------------------------------------------------------------------------- the shovel
/** the blade's middle above the shovel's origin (props/things.ts: the blade box sits at y 0.56, tipped 0.25 rad) */
export const BLADE_Y = 0.56;
/** THE SHOVEL put by its blade: the blade's middle `blade` (world) and `handle` = the direction from the blade toward
 *  the T grip; the scoop's open face turned toward `up` (default the sky). -> { at, rot } for put(at, { rot, load }) */
export const shovelPut = (blade: THREE.Vector3, handle: THREE.Vector3, up = V(0, 1, 0)) => {
  const y = handle.clone().normalize().multiplyScalar(-1);
  return { at: blade.clone().addScaledVector(handle.clone().normalize(), BLADE_Y), rot: quatYZ(y, up) };
};

// ------------------------------------------------------------------------------------------------- the board
/** his charcoal's place on the board's face at time t (board units: x across, y up the drawing, metres): circles and
 *  triangles, one stroke at a time; `k` 1 = drawing, 0 = the hand held still just off the board */
export const stroke = (t: number) => {
  const T = 1.6, n = Math.floor(t / T), u = t / T - n, kind = n % 3, cx = -0.07 + 0.05 * (hash(n, 3) - 0.5), cy = 0.01 + 0.06 * (hash(n, 5) - 0.5);
  let x: number, y: number;
  if (kind === 0) { const a = u * Math.PI * 2 * 1.05; x = cx + 0.035 * Math.cos(a); y = cy + 0.03 * Math.sin(a); }
  else { const P = [[0, 0.04], [-0.04, -0.025], [0.04, -0.025], [0, 0.04]], s = Math.min(2.999, u * 3), i = Math.floor(s), e = s - i; x = cx + lerp(P[i][0], P[i + 1][0], e); y = cy + lerp(P[i][1], P[i + 1][1], e); }
  // a lift between strokes (the last 12 % of each)
  const lift = u > 0.88 ? Math.sin(Math.PI * (u - 0.88) / 0.12) : 0;
  return { x, y, lift };
};

// ------------------------------------------------------------------------------------------------- the sparks
/** THE SPARKS: a burst of glowing dots flying up and out from screen point `p` (px) on frame f, `on` = the burst's
 *  first frame; `dir` = the screen direction they mostly fly (deg, 0 = right, -90 = up); `n` sparks, `len` frames,
 *  `speed` px a frame, `size` px. Nothing before `on` or after the last spark dies. */
export const sparks = (f: number, on: number, p: { x: number; y: number }, o: { n?: number; len?: number; speed?: number; size?: number; dir?: number; spread?: number; seed?: number } = {}) => {
  const d = f - on, len = o.len ?? 16;
  if (d < 0 || d > len + 4) return null;
  const n = o.n ?? 14, dots: ReturnType<typeof h>[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((o.dir ?? -70) + (hash(i, 11 + (o.seed ?? 0)) - 0.5) * (o.spread ?? 90)) * (Math.PI / 180);
    const life = len * (0.5 + 0.5 * hash(i, 13 + (o.seed ?? 0))), age = d - 2 * hash(i, 17 + (o.seed ?? 0));
    if (age < 0 || age > life) continue;
    const v = (o.speed ?? 14) * (0.55 + 0.6 * hash(i, 19 + (o.seed ?? 0))), u = age / life;
    const x = p.x + Math.cos(a) * v * age, y = p.y + Math.sin(a) * v * age + 0.35 * age * age;
    const s = (o.size ?? 9) * (0.6 + 0.6 * hash(i, 23 + (o.seed ?? 0))) * (1 - 0.5 * u), al = (1 - easeOutCubic(u)) * 0.95;
    dots.push(h("div", { key: i, style: { position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", opacity: al,
      background: "radial-gradient(circle, #ffffff 0%, #fff0a0 30%, #ffb040 58%, rgba(255,110,30,0) 100%)", boxShadow: `0 0 ${Math.round(s * 1.4)}px ${Math.round(s * 0.45)}px rgba(255,130,40,0.7)` } }));
  }
  return dots.length ? h("div", { key: `sparks${on}`, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" } }, ...dots) : null;
};
