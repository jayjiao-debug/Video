// The numbers every layout file shares (no imports from the other layout files: layout.ts re-exports them all, so a
// value imported both ways would be a cycle). WP1.
import * as THREE from "three";
import type { Place } from "../story";

export type Vec3 = [number, number, number];
/** a camera: structurally a story.ts CamPose (vertical fov in degrees) */
export type Cam = { pos: Vec3; look: Vec3; fov: number; roll?: number };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });
/** HER EYES: the reporter is short; the camera stands 1.50 m over the floor she stands on (PLAN 5: SU at 1.06 looks
 *  down into her lens) */
export const EYE = 1.5;
/** her phone-vlog lens: vertical fov in degrees on 9:16 (PLAN 5) */
export const FOV = 62;
/** the islands (PLAN 1): each place is built around x = ISLAND[place]; they are far apart so a missed toggle never shows
 *  one place in another. Every floor a figure stands on is at y 0. */
export const ISLAND: Record<Place, number> = { market: 0, yard: 100, room: 200, huangzhou: 300, pines: 400, river: 500, beach: 600, temple: 700 };
/** a camera at her eye height: standing at (x, floorY, z), looking at `look` */
export const eyeCam = (x: number, z: number, look: Vec3, fov = FOV, floorY = 0): Cam => ({ pos: [x, floorY + EYE, z], look, fov });
/** the stand-in staging of a place (the WP1 stubs and the smoke stills): where her eyes are, where SU stands (his mark)
 *  and which way he faces */
export type Stand = { cam: Cam; su: THREE.Vector3; facing: number };
/** a polyline of floor points (a walk, a ride, the boat's way) */
export type Path = THREE.Vector3[];
/** SU's head centre over his floor when he stands (scale 1.06; the rig's head is a ball of radius 0.24 m) */
export const SU_HEAD = 1.3;
/** A CAMERA AT HER EYES IN FRONT OF A FIGURE: her lens `dist` m from the figure at `at` along his facing line (facing 0 =
 *  he faces +z), shifted `side` m to HIS left (+, screen right of him) or right (-), aimed so a head centre at
 *  `headY` (default SU_HEAD; seated about 1.0) lands at screen y `eyesPx` (of 1920, default 600: the upper third), on
 *  the frame's vertical middle line. The block-out cameras of every layout file are made with it. */
export const frontCam = (at: THREE.Vector3, facing: number, dist: number, o: { side?: number; headY?: number; eyesPx?: number; fov?: number; floorY?: number } = {}): Cam => {
  const fov = o.fov ?? FOV, side = o.side ?? 0, headY = o.headY ?? SU_HEAD, eyesPx = o.eyesPx ?? 600, floorY = o.floorY ?? 0;
  const s = Math.sin(facing), k = Math.cos(facing);
  const px = at.x + dist * s + side * k, pz = at.z + dist * k - side * s, py = floorY + EYE;
  const d = Math.hypot(at.x - px, at.z - pz);
  const half = Math.tan((fov * Math.PI) / 360);
  const eyeAng = Math.atan2(at.y + headY - py, d), theta = Math.atan(((960 - eyesPx) / 960) * half);
  const pitch = eyeAng - theta;
  return { pos: [px, py, pz], look: [at.x, py + d * Math.tan(pitch), at.z], fov };
};
