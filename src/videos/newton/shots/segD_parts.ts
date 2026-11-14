// SEGMENT D's helpers (WP5-D; only segD.ts imports them): framing, the lectern's sloped top, the notes under his arm,
// her lone clap on her own mic hand. Pure functions of their arguments (no state between frames).
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, type CamPose } from "../story";
import * as C from "../cam";
import { FOV, SCHOOLS, SCHOOLS_SET } from "../layout";
import { NOTES } from "../props";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------- framing
/** a camera at `pos` turned so that the world point `p` lands on screen (sx, sy) px (fov vertical, 9:16) */
export const frameOn = (pos: THREE.Vector3, p: THREE.Vector3, sx: number, sy: number, fov = FOV): CamPose => {
  const tanV = Math.tan((fov * Math.PI) / 360), tanH = tanV * (1080 / 1920);
  const d = p.clone().sub(pos), yawP = Math.atan2(d.x, -d.z), pitchP = Math.atan2(d.y, Math.hypot(d.x, d.z));
  const yaw = yawP - Math.atan(((sx / 1080) * 2 - 1) * tanH), pitch = pitchP - Math.atan((1 - (sy / 1920) * 2) * tanV);
  const L = 3;
  return { pos: [pos.x, pos.y, pos.z], look: [pos.x + Math.sin(yaw) * Math.cos(pitch) * L, pos.y + Math.sin(pitch) * L, pos.z - Math.cos(yaw) * Math.cos(pitch) * L], fov };
};
/** two cameras blended (position, direction, fov), k 0..1 eased */
export const mixCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  const A = C.camAxes(a), B = C.camAxes(b), e = smooth(clamp01(k));
  const pos = A.p.clone().lerp(B.p, e), dir = A.fwd.clone().lerp(B.fwd, e).normalize(), dist = lerp(A.dist, B.dist, e);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, e) };
};

// ---------------------------------------------------------------------------------------------------- the lectern
const LT = SCHOOLS_SET.lectern;
/** the slope of the lectern's desk (rad): low on his side (-z), high toward the benches (+z) */
export const DESK_ANG = Math.atan2(LT.high - LT.low, LT.d);
/** a point ON the desk's sloped top at (x offset from the lectern's middle, z offset), `up` m above the surface
 *  (along the surface's normal) */
export const deskPoint = (dx: number, dz: number, up = 0) => {
  const y = (LT.low + LT.high) / 2 + dz * Math.tan(DESK_ANG) + 0.025 / Math.cos(DESK_ANG);
  const n = V(0, Math.cos(DESK_ANG), -Math.sin(DESK_ANG));
  return V(SCHOOLS.lectern.x + dx, y, SCHOOLS.lectern.z + dz).addScaledVector(n, up);
};
/** a prop lying flat on the slope, turned `yaw` about the surface's normal (Euler YXZ: [rx, ry, rz]) */
export const deskRot = (yaw = 0): [number, number, number] => [-DESK_ANG, yaw, 0];

// ---------------------------------------------------------------------------------------------------- his notes
/** THE NOTES UNDER HIS LEFT ARM: the hand (arm 1) holds the sheaf's +x edge at his left hip, the sheaf standing on
 *  edge along his side (its long side forward, its top under the armpit). Returns the hand's point and the prop's
 *  rotation (put the prop with grip "grip" at the rig's real hand after w.update()). */
export const underArm = (at: THREE.Vector3, facing: number, o: { out?: number; y?: number; fwd?: number } = {}) => {
  const c = Math.cos(facing), s = Math.sin(facing);
  const left = V(c, 0, -s), fwd = V(s, 0, c);
  const hand = at.clone().addScaledVector(left, o.out ?? 0.25).addScaledVector(fwd, o.fwd ?? 0.04).add(V(0, o.y ?? 0.56, 0));
  // local x (the grip edge) down, local y (its thickness) to his left, local z (its long side) forward
  const m = new THREE.Matrix4().makeBasis(V(0, -1, 0), left, fwd);
  return { hand, rot: new THREE.Quaternion().setFromRotationMatrix(m) };
};
/** the notes' size (re-exported for the shot) */
export { NOTES };

// ---------------------------------------------------------------------------------------------------- her lone clap
/** SHE CLAPS ALONE on her own mic hand: her open right hand comes down onto the top of her left fist (the mic held
 *  toward him as always, so the fist is seen from its back, never its palm) on each frame of `ons` (closing over 4
 *  frames, apart again over 5); `kIn` 0..1 brings the right hand in from the lower right (0 = out of frame). `fist` =
 *  the left hand's world point (the mic pose's hand.at). Returns the put for "handR" (pose open). */
export const clapOnFist = (cam: CamPose, f: number, fist: THREE.Vector3, ons: number[], kIn = 1): C.HandPut => {
  const F = C.camFrame(cam);
  let g = 1;
  for (const on of ons) { const d = f - on; g = Math.min(g, d < -4 ? 1 : d <= 0 ? 1 - easeInCubic((d + 4) / 4) : d <= 5 ? easeOutCubic(d / 5) : 1); }
  const q = C.worldToCam(F, fist);
  // the palm's middle: on the fist's top at the strike, 11 cm up and 7 cm to the right of it apart; a small life
  const hit = q.clone().add(V(0.012, 0.045, -0.01)), away = q.clone().add(V(0.07, 0.07, -0.03));
  const t = f / FPS, life = V(0.003 * Math.sin(t * 2.1), 0.003 * Math.sin(t * 1.7 + 1), 0);
  const p = hit.lerp(away, g).add(life);
  // in from (and back out to) the lower right, never up past the fist
  const out = C.fromScreen(F, 1250, 2050, Math.max(0.3, q.z));
  const e = easeOutCubic(clamp01(kIn));
  const pc = out.lerp(p, e);
  const w = C.camToWorld(F, pc.x, pc.y, pc.z);
  // the fingers toward the screen's left and away from her, the palm down onto the fist (a little toward the left)
  const fingers = V().addScaledVector(F.right, -0.62).addScaledVector(F.fwd, 0.7).addScaledVector(F.up, 0.15);
  const palm = V().addScaledVector(F.up, -0.85).addScaledVector(F.right, -0.35).addScaledVector(F.fwd, 0.2);
  return C.freeHand(cam, w, { pose: "open", bar: fingers, palm });
};

// ---------------------------------------------------------------------------------------------------- the wipe
/** THE WIPE's handkerchief: TWO instances of the cloth make one handkerchief that reads: `wad` = its crumpled middle
 *  pressed on his nose (its long corner squashed short and turned into her fist, out of sight), `tail` = its end bunched
 *  in her fist with the long corner hanging down in FRONT of her knuckles toward the lens, white over his dark gown.
 *  s = scale (cam.ts WIPE.cloth is 1.5), sy = a squash along the prop's own y (the shot applies it to the group after
 *  put) */
export const WIPE_CLOTH = { wad: { s: 1.9, sy: 0.45 }, tail: { s: 1.6, sy: 0.75 } };
/** a rotation from camera-space y and z axes (z made perpendicular to y) */
const quatYZ = (F: C.CamFrame, yc: THREE.Vector3, zc: THREE.Vector3) => {
  const toW = (c: THREE.Vector3) => V().addScaledVector(F.right, c.x).addScaledVector(F.up, c.y).addScaledVector(F.fwd, c.z);
  const y = toW(yc).normalize(), z = toW(zc);
  z.addScaledVector(y, -z.dot(y)).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(y, z), y, z));
};
export type ClothPut = { at: THREE.Vector3; rot: THREE.Quaternion; s: number; sy: number };
/** THE HANDKERCHIEF placed so that the white cloth reads in one glance: cam.ts wipe() gives the path (its cloth point:
 *  pass `clothAt`, 4 cm out from his nose during the strokes) and the timing; this re-places the hand and the cloth on
 *  it. The white wad is pressed on his nose; her fist holds it from its lower right, BESIDE it (his face is drawn
 *  toward the lens, so a fist on the nose hides the cloth); the tail hangs from her fist down over the front of her
 *  knuckles toward the lens. The cloth's flat faces turn partly from the lens toward the sun (`sun`: world, toward it).
 *  Returns the puts: "handR" (pose grip, at its scale), "handkerchief" (wad) and "handkerchief" key "tail". Pure. */
export const wipePut = (cam: CamPose, clothAt: THREE.Vector3, o: { fist?: [number, number, number]; tail?: [number, number, number]; sun?: readonly number[]; face?: number; spin?: number } = {}) => {
  const F = C.camFrame(cam), q = C.worldToCam(F, clothAt).add(V(0, -0.02, 0)), toCam = q.clone().normalize().multiplyScalar(-1);
  const sunC = o.sun ? C.worldToCam(F, V(o.sun[0], o.sun[1], o.sun[2]).normalize().add(F.p)) : toCam.clone();
  const zc = toCam.clone().lerp(sunC, o.face ?? 0.6);
  const A = WIPE_CLOTH.wad, B = WIPE_CLOTH.tail, rW = 0.032 * A.s * 0.95;
  // the wad's middle: on the path's point, pulled back so its own (squashed, turned) surface just meets his nose
  const wc = q.clone().addScaledVector(toCam, rW - 0.022);
  // the fist: at the wad's lower right, a little nearer the lens, round a bar leaning like cam.ts wipe()'s
  const fo = o.fist ?? [0.075, -0.035, 0.01], g = wc.clone().add(V(fo[0], fo[1], 0)).addScaledVector(toCam, fo[2]);
  const bar = V().addScaledVector(F.right, 0.25).addScaledVector(F.up, 1).addScaledVector(F.fwd, -0.2);
  const H = C.freeHand(cam, C.camToWorld(F, g.x, g.y, g.z), { bar, pose: "grip" });
  // the wad: its (short-squashed) long corner runs from the wad into the fist; turned (`spin` about that line) so its
  // short corner folds down under the wad, never up over his eyes
  const yA = wc.clone().sub(g).normalize(), oA = wc.clone().addScaledVector(yA, 0.014 * A.s * A.sy);
  // the tail: bunched in the fist's front, its long corner hanging down (and a little toward the lens)
  const to = o.tail ?? [0.15, -1, 0.6], yB = V(to[0], to[1], 0).addScaledVector(toCam, to[2]).normalize().multiplyScalar(-1);
  const oB = g.clone().add(V(-0.005, -0.012, 0)).addScaledVector(toCam, 0.045);
  const put = (p: THREE.Vector3, y: THREE.Vector3, c: { s: number; sy: number }, spin = 0): ClothPut => ({ at: C.camToWorld(F, p.x, p.y, p.z), rot: quatYZ(F, y, zc).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), spin)), s: c.s, sy: c.sy });
  return { hand: { ...H, scale: C.WIPE.hand }, wad: put(oA, yA, A, o.spin ?? 2.4), tail: put(oB, yB, B) };
};
