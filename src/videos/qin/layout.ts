// THE GEOMETRY of the Qin film: the islands, her eye height, every mark and the stand-in staging (PLAN 1, 4). NUMBERS
// ONLY (no scene building): the sets build from these files and the shots pose from them; nobody types a mark by hand.
// One file per place, re-exported here:
//   layout/base.ts      the shared numbers: ISLAND (each place's x), EYE 1.55, FOV 64, eyeCam, Cam, Stand    WP1
//   layout/hall.ts      Wanbi's HALL / HALL_SET / HALL_CAMS (imported) + QHALL (the desk, the scale, the door) WP1 -> sets/cast
//   layout/corridor.ts  CORRIDOR_SET, CORRIDOR      layout/terrace.ts TERRACE_SET, TERRACE                  WP1 block-out -> WP2
//   layout/table.ts     TABLE_SET, TABLE            layout/night.ts   NIGHT_SET, NIGHT                      WP1 block-out -> WP2
//   layout/road.ts      ROAD_SET, ROAD              layout/museum.ts  MUSEUM_SET, MUSEUM                    WP1 block-out -> WP2
// This file (WP1): the types, STAND (the stand-in staging per place), SCREEN, PAD_TOP, TaSeat.
// Conventions (group/kit/rig3d): metres, y up, EVERY FLOOR A FIGURE STANDS ON IS y 0 (the museum's walkway, where the
// camera stands, is raised instead), facing 0 = toward +z, PI/2 = toward +x; the person's LEFT is +x when facing 0;
// arm 0 = the person's right hand. The places are islands along x (ISLAND); one shows at a time.
import type * as THREE from "three";
import type { Place } from "./story";
import { ISLAND, EYE, FOV, V, c, eyeCam, type Vec3, type Cam, type Stand } from "./layout/base";
import { HALL, HALL_SET, HALL_CAMS, QHALL, HALL_STAND } from "./layout/hall";
import { CX, CORRIDOR_SET, CORRIDOR, CORRIDOR_STAND } from "./layout/corridor";
import { TX, TERRACE_SET, TERRACE, TERRACE_STAND } from "./layout/terrace";
import { BX, TABLE_SET, TABLE, TABLE_STAND } from "./layout/table";
import { NX, NIGHT_SET, NIGHT, NIGHT_STAND } from "./layout/night";
import { RX, ROAD_SET, ROAD, ROAD_STAND } from "./layout/road";
import { MX, MUSEUM_SET, MUSEUM, MUSEUM_STAND } from "./layout/museum";

export { ISLAND, EYE, FOV, V, c, eyeCam, type Vec3, type Cam, type Stand };
export { HALL, HALL_SET, HALL_CAMS, QHALL, CX, CORRIDOR_SET, CORRIDOR, TX, TERRACE_SET, TERRACE, BX, TABLE_SET, TABLE };
export { NX, NIGHT_SET, NIGHT, RX, ROAD_SET, ROAD, MX, MUSEUM_SET, MUSEUM };

/** a figure's seat (the rig's RigSeat fields + the way it faces), as Wanbi's layout.ts TaSeat:
 *    top    the centre of the seat's top, where the hip sits;  floor  what the sitter's feet (and robe) rest on;
 *    back   how far the hip sits behind `top` (rig3d default 0.03);  facing  the way the seat faces (0 = toward +z) */
export type TaSeat = { top: THREE.Vector3; floor: number; back: number; facing: number };
/** a cushion's height above what it lies on (Wanbi's) */
export const PAD_TOP = 0.10;

/** THE STAND-IN STAGING of every place (the segment stubs and the smoke stills): her eyes (1.55 m over her floor) and
 *  the EMPEROR standing in view, facing her */
export const STAND: Record<Place, Stand> = {
  corridor: CORRIDOR_STAND, hall: HALL_STAND, terrace: TERRACE_STAND, table: TABLE_STAND, night: NIGHT_STAND, road: ROAD_STAND, museum: MUSEUM_STAND,
};
/** the island a world point is on (by its x), or null between islands */
export const islandOf = (x: number): Place | null => {
  for (const [p, x0] of Object.entries(ISLAND) as [Place, number][]) if (Math.abs(x - x0) < 45) return p;
  return null;
};

// ------------------------------------------------------------------------------------------------- the screen
/** screen zones in px on the 1080 x 1920 frame (PLAN 4, 5): nothing that matters above `top`, in the caption band
 *  capTop..capBottom, below `bottom`, or right of `rail.x` below `rail.y` (the app's buttons); his eyes in the upper
 *  third (y < `eyes`); the vlog UI owns the top row (REC + the 时辰 timestamp beside it: `rec`) and the top right (the battery:
 *  `battery`); the fact card the upper middle (`card`) while it shows */
export const SCREEN = {
  top: 210, capTop: 1190, capBottom: 1498, bottom: 1613, eyes: 640,
  rail: { x: 930, y: 900 },
  rec: { x0: 40, y0: 205, x1: 820, y1: 255 },
  battery: { x0: 880, y0: 205, x1: 1040, y1: 255 },
  card: { x0: 90, y0: 300, x1: 990, y1: 560 },
};
/** a camera given as a story.ts CamPose with Vec3s (for a mark's camera in a layout file) */
export const camOf = (pos: Vec3, look: Vec3, fov = FOV): Cam => c(pos, look, fov);
