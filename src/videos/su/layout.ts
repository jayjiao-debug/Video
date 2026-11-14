// THE GEOMETRY of the Su film: the islands, her eye height, every mark, the named cameras and the stand-in staging
// (PLAN 1, 5, 8). NUMBERS ONLY (no scene building): the sets build from these files and the shots pose from them;
// nobody types a mark by hand. One file per place, ALL re-exported here (marks, sets, named cameras, stand-ins):
//   layout/base.ts       the shared numbers: ISLAND (each place's x), EYE 1.50, FOV 62, eyeCam, frontCam, Cam, Stand  WP1
//   layout/market.ts     MX, MARKET_SET, MARKET, MARKET_CAMS            layout/yard.ts    YX, YARD_SET, YARD, YARD_CAMS   WP2a
//   layout/room.ts       RX, ROOM_SET, ROOM, ROOM_CAMS                                                                   WP2a
//   layout/huangzhou.ts  HX, HUANGZHOU_SET, HUANGZHOU, HUANGZHOU_CAMS   layout/pines.ts   PX, PINES_SET, PINES, PINES_CAMS WP2b
//   layout/river.ts      VX, RIVER_SET, RIVER, RIVER_CAMS               layout/beach.ts   BX, BEACH_SET, BEACH, BEACH_CAMS WP2b
//   layout/temple.ts     TX, TEMPLE_SET, TEMPLE, TEMPLE_CAMS                                                             WP2b
// (each place file also has <PLACE>_STAND, the WP1 stand-in staging; the numbers are WP1's block-out, the sets lanes
// refine them and KEEP THE NAMES).
// This file (WP1): the types, STAND (the stand-in staging per place), CAMS (every place's named cameras), SCREEN,
// PAD_TOP, TaSeat, islandOf, camOf.
// Conventions (group/kit/rig3d): metres, y up, EVERY FLOOR A FIGURE STANDS ON IS y 0 (water surfaces lie a hair under
// it), facing 0 = toward +z, PI/2 = toward +x; the person's LEFT is +x when facing 0; arm 0 = the person's right
// hand. The places are islands along x (ISLAND); one shows at a time.
import type * as THREE from "three";
import type { Place } from "./story";
import { ISLAND, EYE, FOV, SU_HEAD, V, c, eyeCam, frontCam, type Vec3, type Cam, type Stand, type Path } from "./layout/base";
import { MX, MARKET_SET, MARKET, MARKET_CAMS, MARKET_STAND } from "./layout/market";
import { YX, YARD_SET, YARD, YARD_CAMS, YARD_STAND } from "./layout/yard";
import { RX, ROOM_SET, ROOM, ROOM_CAMS, ROOM_STAND } from "./layout/room";
import { HX, HUANGZHOU_SET, HUANGZHOU, HUANGZHOU_CAMS, HUANGZHOU_STAND } from "./layout/huangzhou";
import { PX, PINES_SET, PINES, PINES_CAMS, PINES_STAND } from "./layout/pines";
import { VX, RIVER_SET, RIVER, RIVER_CAMS, RIVER_STAND } from "./layout/river";
import { BX, BEACH_SET, BEACH, BEACH_CAMS, BEACH_STAND } from "./layout/beach";
import { TX, TEMPLE_SET, TEMPLE, TEMPLE_CAMS, TEMPLE_STAND } from "./layout/temple";

export { ISLAND, EYE, FOV, SU_HEAD, V, c, eyeCam, frontCam, type Vec3, type Cam, type Stand, type Path };
export { MX, MARKET_SET, MARKET, MARKET_CAMS, YX, YARD_SET, YARD, YARD_CAMS, RX, ROOM_SET, ROOM, ROOM_CAMS };
export { HX, HUANGZHOU_SET, HUANGZHOU, HUANGZHOU_CAMS, PX, PINES_SET, PINES, PINES_CAMS, VX, RIVER_SET, RIVER, RIVER_CAMS };
export { BX, BEACH_SET, BEACH, BEACH_CAMS, TX, TEMPLE_SET, TEMPLE, TEMPLE_CAMS };

/** a figure's seat (the rig's RigSeat fields + the way it faces), as Qin's / Wanbi's layout.ts TaSeat:
 *    top    the centre of the seat's top, where the hip sits;  floor  what the sitter's feet (and robe) rest on;
 *    back   how far the hip sits behind `top` (rig3d default 0.03);  facing  the way the seat faces (0 = toward +z) */
export type TaSeat = { top: THREE.Vector3; floor: number; back: number; facing: number };
/** a cushion's height above what it lies on (Wanbi's) */
export const PAD_TOP = 0.10;

/** THE STAND-IN STAGING of every place (the WP1 segment stubs and the smoke stills): her eyes (1.50 m over her floor)
 *  and SU standing on his mark in view, facing her */
export const STAND: Record<Place, Stand> = {
  market: MARKET_STAND, yard: YARD_STAND, room: ROOM_STAND, huangzhou: HUANGZHOU_STAND, pines: PINES_STAND, river: RIVER_STAND, beach: BEACH_STAND, temple: TEMPLE_STAND,
};
/** every place's NAMED CAMERAS (preview/set_places.ts shows them all: "<place>.<name>") */
export const CAMS: Record<Place, Record<string, Cam>> = {
  market: MARKET_CAMS, yard: YARD_CAMS, room: ROOM_CAMS, huangzhou: HUANGZHOU_CAMS, pines: PINES_CAMS, river: RIVER_CAMS, beach: BEACH_CAMS, temple: TEMPLE_CAMS,
};
/** the island a world point is on (by its x), or null between islands */
export const islandOf = (x: number): Place | null => {
  for (const [p, x0] of Object.entries(ISLAND) as [Place, number][]) if (Math.abs(x - x0) < 45) return p;
  return null;
};

// ------------------------------------------------------------------------------------------------- the screen
/** screen zones in px on the 1080 x 1920 frame (PLAN "Hard rules", 6): nothing that matters above `top`, in the
 *  caption band capTop..capBottom (the Chinese rows and the English under them), below `bottom`, or right of `rail.x`
 *  below `rail.y` (the app's buttons); his eyes in the upper third (y < `eyes`); the title block owns `title` for the
 *  first 3 s, a fact card `card` (middle left) while it shows, a stamp `stamp` (top left) at H's and I's start, the
 *  end names `names` in I (hud/index.ts hudRectsAt(f) gives the boxes frame by frame) */
export const SCREEN = {
  top: 210, capTop: 1190, capBottom: 1520, bottom: 1613, eyes: 700,
  rail: { x: 930, y: 900 },
  title: { x0: 90, y0: 220, x1: 990, y1: 430 },
  card: { x0: 56, y0: 780, x1: 760, y1: 1080 },
  stamp: { x0: 60, y0: 230, x1: 560, y1: 430 },
  names: { x0: 60, y0: 640, x1: 1020, y1: 1180 },
};
/** a camera given as a story.ts CamPose with Vec3s (for a mark's camera in a layout file) */
export const camOf = (pos: Vec3, look: Vec3, fov = FOV): Cam => c(pos, look, fov);
