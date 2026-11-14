// THE GEOMETRY of the Newton film: the islands, her eye height, every mark and the stand-in staging (PLAN 1, 4). NUMBERS
// ONLY (no scene building): the sets build from these files and the shots pose from them; nobody types a mark by hand.
// One file per place (WP2), re-exported here as each lands:
//   layout/base.ts         the shared numbers: ISLAND (each place's x), EYE 1.6, FOV 62, eyeCam, Cam, Stand        WP1
//   layout/stairs.ts       STX, STAIRS_SET, STAIRS, STAIRS_CAMS, STAIRS_STAND                                        WP2
//   layout/room.ts         RMX, ROOM_SET, ROOM, ROOM_CAMS, ROOM_STAND                                                WP2
//   layout/garden.ts       GDX, GARDEN_SET, GARDEN, GARDEN_CAMS, GARDEN_STAND                                        WP2
//   layout/street.ts       STRX, STREET_SET, STREET, STREET_CAMS, STREET_STAND                                       WP2
//   layout/schools.ts      SCX, SCHOOLS_SET, SCHOOLS, SCHOOLS_CAMS, SCHOOLS_STAND                                    WP2
//   layout/elaboratory.ts  ELX, ELAB_SET, ELAB, ELAB_CAMS, ELAB_STAND                                                WP2
// This file (WP1): STAND (the stand-in staging per place: WP2's <PLACE>_STAND where it has landed, else WP1's block-out
// staging below), SCREEN, islandOf, camOf, TaSeat, PAD_TOP.
// Conventions (group/kit/rig3d): metres, y up, EVERY FLOOR A FIGURE STANDS ON IS y 0, facing 0 = toward +z (the camera
// side), PI/2 = toward +x; the person's LEFT is +x when facing 0; arm 0 = the person's right hand. The places are
// islands along x (ISLAND); one shows at a time.
import type * as THREE from "three";
import { PLACES, type Place } from "./story";
import { ISLAND, EYE, FOV, V, c, eyeCam, type Vec3, type Cam, type Stand } from "./layout/base";
// THE PLACES' MARKS (WP2): one import + re-export per place as it lands
import { STX, STAIRS_SET, STAIRS, STAIRS_CAMS, STAIRS_STAND } from "./layout/stairs";
import { RMX, ROOM_SET, ROOM, ROOM_CAMS, ROOM_STAND } from "./layout/room";
import { GDX, GARDEN_SET, GARDEN, GARDEN_CAMS, GARDEN_STAND } from "./layout/garden";
import { STRX, STREET_SET, STREET, STREET_CAMS, STREET_STAND } from "./layout/street";
import { SCX, SCHOOLS_SET, SCHOOLS, SCHOOLS_CAMS, SCHOOLS_STAND } from "./layout/schools";
import { ELX, ELAB_SET, ELAB, ELAB_CAMS, ELAB_STAND } from "./layout/elaboratory";

export { ISLAND, EYE, FOV, V, c, eyeCam, type Vec3, type Cam, type Stand };
export { STX, STAIRS_SET, STAIRS, STAIRS_CAMS, STAIRS_STAND };
export { RMX, ROOM_SET, ROOM, ROOM_CAMS, ROOM_STAND };
export { GDX, GARDEN_SET, GARDEN, GARDEN_CAMS, GARDEN_STAND };
export { STRX, STREET_SET, STREET, STREET_CAMS, STREET_STAND };
export { SCX, SCHOOLS_SET, SCHOOLS, SCHOOLS_CAMS, SCHOOLS_STAND };
export { ELX, ELAB_SET, ELAB, ELAB_CAMS, ELAB_STAND };

/** a figure's seat (the rig's RigSeat fields + the way it faces), as Wanbi's layout.ts TaSeat:
 *    top    the centre of the seat's top, where the hip sits;  floor  what the sitter's feet rest on;
 *    back   how far the hip sits behind `top` (rig3d default 0.03);  facing  the way the seat faces (0 = toward +z) */
export type TaSeat = { top: THREE.Vector3; floor: number; back: number; facing: number };
/** a cushion's height above what it lies on (Wanbi's) */
export const PAD_TOP = 0.10;

/** WP1's block-out staging (sets/blockout.ts STUB): her eyes and the figures' marks in each block-out place */
const BLOCK_STAND: Record<Place, Stand> = {
  stairs: { cam: eyeCam(ISLAND.stairs + 0.1, 0.5, [ISLAND.stairs, 1.05, -2.0]), newton: V(ISLAND.stairs, 0, -1.95), facing: 0, humphrey: V(ISLAND.stairs + 0.55, 0, -1.6), humphreyFacing: -0.4 },
  room: { cam: eyeCam(ISLAND.room + 0.35, 1.7, [ISLAND.room - 0.1, 0.9, -0.9]), newton: V(ISLAND.room - 0.2, 0, -0.85), facing: 0.15, humphrey: V(ISLAND.room + 1.1, 0, -1.3), humphreyFacing: -0.5 },
  garden: { cam: eyeCam(ISLAND.garden, -0.4, [ISLAND.garden, 0.95, -3.0]), newton: V(ISLAND.garden, 0, -3.0), facing: 0 },
  street: { cam: eyeCam(ISLAND.street - 0.5, -0.6, [ISLAND.street + 0.2, 0.95, -3.2]), newton: V(ISLAND.street + 0.3, 0, -3.2), facing: -0.2 },
  schools: { cam: eyeCam(ISLAND.schools + 0.5, -1.2, [ISLAND.schools, 0.95, -3.9]), newton: V(ISLAND.schools, 0, -3.9), facing: 0.1 },
  elaboratory: { cam: eyeCam(ISLAND.elaboratory + 0.35, 1.0, [ISLAND.elaboratory - 0.05, 0.88, -1.5]), newton: V(ISLAND.elaboratory - 0.2, 0, -1.5), facing: 0.25, humphrey: V(ISLAND.elaboratory + 0.9, 0, -1.9), humphreyFacing: -0.5 },
};
/** THE STAND-IN STAGING of every place (the WP1 segment stubs and the smoke stills): her eyes (1.6 m over her floor),
 *  NEWTON standing in view facing her, HUMPHREY where the place has him. A block-out, not a shot camera. */
const LANDED: Partial<Record<Place, Stand>> = { stairs: STAIRS_STAND, room: ROOM_STAND, garden: GARDEN_STAND, street: STREET_STAND, schools: SCHOOLS_STAND, elaboratory: ELAB_STAND };
export const STAND: Record<Place, Stand> = Object.fromEntries(PLACES.map((p) => [p, LANDED[p] ?? BLOCK_STAND[p]])) as Record<Place, Stand>;
/** the island a world point is on (by its x), or null between islands */
export const islandOf = (x: number): Place | null => {
  for (const [p, x0] of Object.entries(ISLAND) as [Place, number][]) if (Math.abs(x - x0) < 45) return p;
  return null;
};

// ------------------------------------------------------------------------------------------------- the screen
/** screen zones in px on the 1080 x 1920 frame (PLAN 5), set to the HUD's real boxes (hud/: per frame hudRectsAt(f)):
 *  nothing that matters above `top` (the phone's status bar and the app's top row), in the subtitle band
 *  capTop..capBottom (hud CAP_BAND: Chinese large centred on y 1318, English small under it, text inside y 1277-1455),
 *  below `bottom`, or right of `rail.x` below `rail.y` (the app's buttons); faces in the upper third (eyes y < `eyes`);
 *  the fact card's slot MID-LEFT (`card` = hud FACT_SLOT, the tallest slip with its tilt and shadow, while a card
 *  shows: keep faces out of it); the title block at its default place (`title` = hud TITLE_RECT, over TITLE_SPAN; segA
 *  moves it onto the door); HER CAMERA'S RECORDING UI (hud/vlog.tsx, PLAN 5) owns the two top corners below `top`:
 *  `rec` = the REC lamp's row (centre y 204) and the scene's timestamp at rest under it (hud VLOG_RECT.rec + .stamp;
 *  for the first 2 s of every scene the timestamp holds 1.5x bigger: VLOG_RECT.stampBig, x 50..394, y 242..353 at
 *  most; each scene's own box: hud stampRect(id, big)),
 *  `battery` = the battery and its % top right. The mic and her hands are never drawn (props INVISIBLE); `mic` /
 *  `micRest` / `micTop` are where the invisible mic still rests (cam.ts MIC_FRAME.band) */
export const SCREEN = {
  top: 150, capTop: 1250, capBottom: 1500, bottom: 1640, eyes: 640, mic: 1190, micRest: { x: 335, y: 1048 },
  /** LEGACY name (= the top of the mic's resting head): the mic's head lives in micTop..mic */
  micTop: 950,
  rail: { x: 930, y: 900 },
  card: { x0: 35, y0: 811, x1: 677, y1: 1216 },
  title: { x0: 125, y0: 796, x1: 955, y1: 1086 },
  /** the vlog UI's corners (hud VLOG_RECT): REC + the small timestamp top left, the battery + its % top right */
  rec: { x0: 50, y0: 184, x1: 284, y1: 310 },
  battery: { x0: 845, y0: 182, x1: 1040, y1: 226 },
};
/** a camera given as a story.ts CamPose with Vec3s (for a mark's camera in a layout file) */
export const camOf = (pos: Vec3, look: Vec3, fov = FOV): Cam => c(pos, look, fov);
