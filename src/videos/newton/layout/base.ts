// The numbers every layout file shares (no imports from the other layout files: layout.ts re-exports them all, so a
// value imported both ways would be a cycle). WP1.
import * as THREE from "three";
import type { Place } from "../story";

export type Vec3 = [number, number, number];
/** a camera: structurally a story.ts CamPose (vertical fov in degrees) */
export type Cam = { pos: Vec3; look: Vec3; fov: number; roll?: number };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });
/** HER EYES: she IS the camera; the lens stands 1.6 m over the floor she stands on (PLAN 4) */
export const EYE = 1.6;
/** her lens: vertical fov in degrees on 9:16 (PLAN 4: about 60-64) */
export const FOV = 62;
/** the islands: each place is built around x = ISLAND[place] (WP2's layout files define the same x as STX, RMX, GDX,
 *  STRX, SCX, ELX); they are far apart so a missed toggle never shows one place in another. Every floor a figure
 *  stands on is y 0 (the stairs: the landing at his door). */
export const ISLAND: Record<Place, number> = { stairs: 100, room: 200, garden: 300, street: 400, schools: 500, elaboratory: 600 };
/** a camera at her eye height: standing at (x, floorY, z), looking at `look` */
export const eyeCam = (x: number, z: number, look: Vec3, fov = FOV, floorY = 0): Cam => ({ pos: [x, floorY + EYE, z], look, fov });
/** the stand-in staging of a place (the WP1 stubs and the smoke stills): her eyes, NEWTON's mark and facing, and
 *  HUMPHREY's where the place has him. `emperor` is the same mark as `newton` (an old name some layout files still set). */
export type Stand = { cam: Cam; newton: THREE.Vector3; facing: number; humphrey?: THREE.Vector3; humphreyFacing?: number; emperor?: THREE.Vector3 };
