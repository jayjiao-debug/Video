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
/** THE PHONE-SAFE FRAME (9:15, 1080 x 1800; Jay's measure on his phone, 14 Nov; the bible's "phone-safe frame"). The
 *  app fits the film to the phone's width (black bars above and below); its own things sit on the picture here:
 *    margin   the outer 54 px of each side are PICTURE ONLY (a screen of another shape may trim a sliver)
 *    icons    the back and search icons cover the top corners down to y 60
 *    buttons  the button column covers x > 940 from y 950 down: below y 950 words and effects stay left of x 930
 *    post     the post's own text covers the left from y 1510 down: subtitles end above y 1490, nothing that matters
 *             sits below y 1500
 *  The film's mask for review cuts draws exactly these (hud/phone.tsx, input prop mask: true). */
export const PHONE = {
  W: 1080, H: 1800, margin: 54,
  icons: { y1: 60, w: 150 },
  buttons: { x0: 940, y0: 950 },
  post: { y0: 1510, x1: 900 },
  /** words and effects: x 54..1026 above y 950, x 54..930 below it, nothing below y 1500 (subtitles end at 1490) */
  words: { x0: 54, x1: 1026, x1Low: 930, yLow: 950, capBottom: 1490, bottom: 1500, top: 60 },
} as const;
/** screen zones in px on the 1080 x 1800 frame, set to the HUD's real boxes (hud/: per frame hudRectsAt(f)):
 *  nothing that matters above `top` (the app's icons), below `bottom` (the post's text), or right of `rail.x` below
 *  `rail.y` (the app's buttons); the subtitle band capTop..capBottom (hud CAP_BAND: the rows are anchored on their
 *  bottom, y 1490: one Chinese row about y 1405-1490, two rows from about 1325, the English row (English speech only)
 *  under the Chinese, the Chinese moving up for it); faces between a quarter and half of the way down (eyes above
 *  `eyes`, the upper third); the fact card's slot MID-LEFT (`card` = hud FACT_SLOT while a card shows: keep faces out
 *  of it); the title block at its default place (`title` = hud TITLE_RECT, over TITLE_SPAN; segA moves it onto the
 *  door); HER CAMERA'S RECORDING UI (hud/vlog.tsx) owns the two top corners under the icons: `rec` = the REC lamp's
 *  row (centre y 116) and the scene's timestamp under it (centre about y 176) (hud VLOG_RECT.rec + .stamp; for the first
 *  2 s of every scene the timestamp holds 1.5x bigger: VLOG_RECT.stampBig, about x 54-400, y 140-235; each scene's own
 *  box: hud stampRect(id, big)), `battery` = the battery and its % top right. The mic and her hands are never drawn
 *  (props INVISIBLE); `mic` / `micRest` / `micTop` are where the invisible mic still rests (cam.ts MIC_FRAME). */
export const SCREEN = {
  W: 1080, H: 1800, cx: 540, cy: 900,
  top: 60, capTop: 1325, capBottom: 1490, bottom: 1500, eyes: 600, mic: 1130, micRest: { x: 335, y: 988 },
  /** LEGACY name (= the top of the mic's resting head): the mic's head lives in micTop..mic */
  micTop: 890,
  rail: { x: 930, y: 950 },
  card: { x0: 54, y0: 758, x1: 676, y1: 1161 },
  title: { x0: 125, y0: 736, x1: 955, y1: 1026 },
  /** the vlog UI's corners (hud VLOG_RECT): REC + the small timestamp top left (the widest scene's, A's), its big intro
   *  for a scene's first 2 s, the battery + its % top right. The camera plans assumed x 54-330, y 95-205 (REC and the
   *  stamp), the big stamp to about y 290 and the battery x 820-1026: these are inside. */
  rec: { x0: 54, y0: 97, x1: 267, y1: 204 },
  stampBig: { x0: 54, y0: 140, x1: 372, y1: 234 },
  battery: { x0: 843, y0: 95, x1: 1026, y1: 137 },
};
/** a camera given as a story.ts CamPose with Vec3s (for a mark's camera in a layout file) */
export const camOf = (pos: Vec3, look: Vec3, fov = FOV): Cam => c(pos, look, fov);
