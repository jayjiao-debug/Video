// THE GEOMETRY of the Wanbi film: every mark, the set's numbers and the 23 CHECKED cameras (BIBLE sections 2-4).
// NUMBERS ONLY (no scene building): the sets build from these files and the shots pose from them; nobody types a mark
// or a camera by hand. One file per place, re-exported here:
//   layout/hall.ts   HALL (marks), HALL_SET (what sets/hall.ts builds), HALL_CAMS (15)      owner WP2 (after WP1b)
//   layout/zhao.ts   ZHAO, ZHAO_SET, ZHAO_CAMS (6)                                            owner WP3
//   layout/road.ts   ROAD, ROAD_SET, ROAD_CAMS (2)                                            owner WP3
// This file (WP1b, frozen after it like world.ts): the types, CAMS (all 23, `satisfies Record<CamName, Cam>`: a
// camera missing from a place file, or one too many, is a type error), cam(name), SCREEN, PAD_TOP.
//
// Conventions (group/kit/rig3d): metres, y up, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x;
// the person's LEFT is +x when facing 0; arm 0 = the person's right hand. The places are islands along x: hall 0,
// zhao 40, road 80 (one shows at a time). QIN IS LEFT, ZHAO IS RIGHT (BIBLE 2.1).
import type * as THREE from "three";
import type { CamName } from "./story";
import { HALL, HALL_SET, HALL_CAMS } from "./layout/hall";
import { ZHAO, ZHAO_SET, ZHAO_CAMS, ZX } from "./layout/zhao";
import { ROAD, ROAD_SET, ROAD_CAMS, RX } from "./layout/road";

export { HALL, HALL_SET, ZHAO, ZHAO_SET, ROAD, ROAD_SET, ZX, RX };
export type { CamName };
export type Vec3 = [number, number, number];
/** a camera: structurally a story.ts CamPose (vertical fov in degrees) */
export type Cam = { pos: Vec3; look: Vec3; fov: number };
/** a figure's seat on a low platform seat 榻 (the rig's RigSeat fields + the way it faces):
 *    top    the centre of the cushion's top, where the hip sits (y = the 榻's top + PAD_TOP)
 *    floor  the 榻's top: the sitter's feet rest on it (rig3d RigSeat.floor), and so does the robe round him (the
 *           World sets the robe's ground to it every frame)
 *    back   how far the hip sits behind `top` (rig3d default 0.03; -0.10 = sitting forward for a hand-over)
 *    facing the way the seat faces (0 = toward +z) */
export type TaSeat = { top: THREE.Vector3; floor: number; back: number; facing: number };
/** the cushion's height above the 榻 it lies on: a seat's top is its floor + PAD_TOP (hall 0.40 + 0.10, Zhao 0.30 + 0.10) */
export const PAD_TOP = 0.10;

// ------------------------------------------------------------------------------------------------- the cameras
/** THE 23 CHECKED CAMERAS (BIBLE section 4): the hall's 15, the Zhao court's 6, the road's 2. A camera or a mark that
 *  needs to change is changed in its place file by the place's owner (WP2 hall, WP3 zhao + road). */
export const CAMS = { ...HALL_CAMS, ...ZHAO_CAMS, ...ROAD_CAMS } satisfies Record<CamName, Cam>;
/** the camera with this name (a story.ts CamPose) */
export const cam = (name: CamName): Cam => CAMS[name];

// ------------------------------------------------------------------------------------------------- the screen
/** screen zones in px on the 1080 x 1920 frame (BIBLE 2.1, as Hongmen): nothing that matters above `top`, in the caption
 *  band capTop..capBottom, below `bottom`, or right of `rail.x` below `rail.y` (the app's buttons); the source tag owns
 *  the top-left corner, the jade chip the top-right corner (`chip`, the same box as hud/index.ts CHIP_RECT) */
export const SCREEN = {
  top: 210, capTop: 1190, capBottom: 1498, bottom: 1613,
  rail: { x: 930, y: 900 },
  sourceTag: { corner: "tl" as const, y0: 189, y1: 231 },
  chip: { x0: 780, y0: 215, x1: 984, y1: 310 },
};
