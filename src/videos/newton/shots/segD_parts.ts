// SEGMENT D's helpers (the v5 rebuild, 15 Nov; only segD.ts imports them): the lectern's sloped top, the notes under
// his arm, his steps on the street on their sounds, her lone clap (her eyes jolt: no hands), her breathing. Pure
// functions of their arguments (no state between frames). (The old take's handkerchief pad and frameOn / mixCam are
// gone: script v5 cut the wipe, and every framing now goes through cam.ts aimCam / lensCam.)
import * as THREE from "three";
import { clamp01, lerp, smooth, H_915, Y_915, type CamPose } from "../story";
import * as C from "../cam";
import { SCHOOLS, SCHOOLS_SET } from "../layout";
import { NOTES } from "../props";
import type { RigPose } from "./common";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

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
/** where the hand holds the sheaf at his hip (m: out to his left, up, forward), for his 1.06-scale figure (the scale-1
 *  numbers 0.25 / 0.56 left the pinned hand 2-3 cm short of its mark: the preview's reach) */
export const UNDER_ARM = { out: 0.265, y: 0.6, fwd: 0.04 };
/** THE NOTES UNDER HIS LEFT ARM: the hand (arm 1) holds the sheaf's +x edge at his left hip, the sheaf standing on
 *  edge along his side (its long side forward, its top under the armpit). Returns the hand's point and the prop's
 *  rotation (put the prop with grip "grip" at the rig's real hand after w.update()). */
export const underArm = (at: THREE.Vector3, facing: number, o: { out?: number; y?: number; fwd?: number; tilt?: number } = {}) => {
  const c = Math.cos(facing), s = Math.sin(facing);
  const left = V(c, 0, -s), fwd = V(s, 0, c);
  const hand = at.clone().addScaledVector(left, o.out ?? UNDER_ARM.out).addScaledVector(fwd, o.fwd ?? UNDER_ARM.fwd).add(V(0, o.y ?? UNDER_ARM.y, 0));
  // local x (the grip edge) down, local y (its thickness) to his left, local z (its long side) forward; `tilt` (rad)
  // leans its top out from his side (about the long side), for a stride whose sway brings the body to it
  const k = o.tilt ?? 0, down = V(0, -Math.cos(k), 0).addScaledVector(left, -Math.sin(k)), out = V(0, -Math.sin(k), 0).addScaledVector(left, Math.cos(k));
  const m = new THREE.Matrix4().makeBasis(down, out, fwd);
  return { hand, rot: new THREE.Quaternion().setFromRotationMatrix(m) };
};
/** the notes' size (re-exported for the shot) */
export { NOTES };

// ---------------------------------------------------------------------------------------------------- his steps
/** THE RIG'S WALK ON GIVEN FOOTFALLS (rig3d: a foot lands at phase 0 and 0.5; the stance is 0.6 of a cycle; a half
 *  stride `s` m makes a cycle of 2 s / 0.6 m): the phase that puts a footfall ON frame `fall` with `per` frames
 *  between footfalls, and the metres his body has travelled since frame `from` at that cadence. Pure. */
export const STANCE = 0.6;
export const stepPhase = (f: number, fall: number, per: number) => ((((f - fall) / (2 * per)) % 1) + 1) % 1;
export const stepDist = (f: number, from: number, per: number, s: number) => ((f - from) / (2 * per)) * ((2 * s) / STANCE);
/** a walk pose on those footfalls (amount 0..1: 0 = a glide with the legs still stepping, used to ease in and out) */
export const stepPose = (f: number, fall: number, per: number, s: number, amount = 1): RigPose => ({ kind: "walk", phase: stepPhase(f, fall, per), stride: s, amount });
/** HIS STOP after the last footfall `fall`: over `len` frames the trailing foot comes up beside the planted one (the
 *  phase runs on from 0.5 toward 0.8, where both feet pass under the body, the half stride shrinking to the rig's
 *  least so the swing foot only just lifts) and the bounce dies; returns the pose and how far (m) the body still
 *  drifts on (a part of one step). From the end of it the shot stands him in the idle pose. */
export const stopPose = (f: number, fall: number, len: number, s: number): { pose: RigPose; drift: number } => {
  const k = clamp01((f - fall) / len), e = smooth(k);
  return { pose: { kind: "walk", phase: 0.5 + 0.3 * e, stride: lerp(s, 0.05, e), amount: 1 - e }, drift: (s / STANCE) * 0.45 * (1 - (1 - k) * (1 - k)) };
};

// ---------------------------------------------------------------------------------------------------- her lone clap
/** HER LONE CLAP, carried by her eyes (Jay, 14 Nov: no hands drawn): on each frame of `ons` (the mix's claps) the
 *  camera gives a small jolt with the clap, a dip and a tip of the head (a frame ahead of the sound, the peak on it,
 *  settled 4 frames after), the second clap a little firmer. `amp` scales the dip (its pitch) to the lens: 1 = 1.15
 *  deg at the peak (the old 45 px at fov 45); at the long lens give clapAmp(fov) so the frame dips CLAP_DIP_PX;
 *  the roll stays (a roll does not grow with the lens). Pure. */
export const CLAP_JOLT = [0.55, 1, 0.5, 0.22, 0.08] as const;
/** the dip the frame makes at a clap (px; measured on the 9:15 frame, the same px on 1920: the lens keeps its scale): 34, because his own head jolt on the clap (segD: accent
 *  "jolt", amp 0.3 / 0.4) lifts the face another 15-20 px, so the face moves about 50 px at the first clap (the faces
 *  checker: head top y 344 -> 282 with a 45 px dip, too big for "a small jolt") */
export const CLAP_DIP_PX = 34;
/** the pitch scale that gives CLAP_DIP_PX at CamPose fov `fov` (the dip in degrees = px / (1800 / the vertical angle
 *  of the 9:15 frame the jolt was approved on: rows 60-1860 of the 1920 frame, so the number is unchanged)) */
export const clapAmp = (fov: number) => {
  const vfov = (2 * Math.atan(C.screenTan(540, Y_915, fov).y) * 180) / Math.PI;
  return ((CLAP_DIP_PX / H_915) * vfov) / 1.15;
};
export const clapJolt = (c: CamPose, f: number, ons: number[], amp = 1): CamPose => {
  let k = 0;
  ons.forEach((on, i) => { const v = CLAP_JOLT[f - on + 1]; if (v !== undefined) k += (i ? 1.2 : 1) * v; });
  return k ? C.nudge(c, { pitch: -1.15 * amp * k, up: -0.006 * k, roll: 0.55 * k }) : c;
};

// ---------------------------------------------------------------------------------------------------- her breathing
/** her breathing while she stands (the format: her eye about 1.5 m with a breathing bob): a slow rise and fall of the
 *  lens, a few millimetres, no turn and no roll. The street only: in the hall the director's D note 2 rules out any
 *  breathing or handheld on the long lens. */
export const breath = (f: number, amp = 0.004) => amp * Math.sin((2 * Math.PI * 0.24 * f) / 30 + 0.7);
