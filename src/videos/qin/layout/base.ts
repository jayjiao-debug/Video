// The numbers every layout file shares (no imports from the other layout files: layout.ts re-exports them all, so a
// value imported both ways would be a cycle). WP1.
import * as THREE from "three";
import type { Place } from "../story";

export type Vec3 = [number, number, number];
/** a camera: structurally a story.ts CamPose (vertical fov in degrees) */
export type Cam = { pos: Vec3; look: Vec3; fov: number; roll?: number };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });
/** HER EYES: the interviewer is short; the camera stands 1.55 m over the floor she stands on (PLAN 4) */
export const EYE = 1.55;
/** the vlog's wide lens: vertical fov in degrees on 9:16 (about 26 mm equivalent; PLAN 4 says 62-66) */
export const FOV = 64;
/** the islands: each place is built around x = ISLAND[place] (the hall at 0 is Wanbi's); they are far apart so a
 *  missed toggle never shows one place in another. Every floor a figure stands on is at y 0. */
export const ISLAND: Record<Place, number> = { hall: 0, corridor: 100, terrace: 200, table: 300, night: 400, road: 500, museum: 600 };
/** a camera at her eye height: standing at (x, floorY, z), looking at `look` */
export const eyeCam = (x: number, z: number, look: Vec3, fov = FOV, floorY = 0): Cam => ({ pos: [x, floorY + EYE, z], look, fov });
/** the stand-in staging of a place (the stubs and the smoke stills): where her eyes are, where the EMPEROR stands */
export type Stand = { cam: Cam; emperor: THREE.Vector3; facing: number };
