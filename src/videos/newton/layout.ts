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
/** THE PHONE-SAFE FRAME (9:16, 1080 x 1920; Jay 15 Nov: "continue in 9x16, but the rec and batter need to go in a tad
 *  bit"): the kit's FRAME_9x16 (src/kit/overlay/frame.ts, measured on one phone, 14 Nov) with the film's one override
 *  (hud/style.ts FRAME, the same numbers as the 李白 film's). The app FILLS the screen; its own things on the picture:
 *    cut      the outer 58 px of each side are CUT OFF (x < 58, x > 1024): nothing that matters there
 *    side     words, cards and effects keep 110 px from each side
 *    icons    the back icon x 58-150 and the search icon x 920-1024, y 143-222
 *    buttons  the button column covers x >= 890 from y 1000 down: below y 1000 words and effects stay left of x 890
 *    post     the post's own text covers x 58-805 from y 1505 down (to 1790): subtitles end by y 1460, nothing that
 *             matters sits below y 1490
 *  The film's mask for review cuts draws exactly these (hud/phone.tsx, input prop mask: true). This file may not import
 *  hud/ (kit.json domOnly), so these are COPIES of hud/style.ts FRAME / SAFE: change both together. */
export const PHONE = {
  W: 1080, H: 1920, margin: 58,
  icons: { y0: 143, y1: 222, left: { x0: 58, x1: 150 }, right: { x0: 920, x1: 1024 } },
  buttons: { x0: 890, y0: 1000 },
  post: { x0: 58, y0: 1505, x1: 805, y1: 1790 },
  /** words, cards and effects: x 110..970 above y 1000, x 110..890 below it, y 340..1490 (subtitles end at 1460) */
  words: { x0: 110, x1: 970, x1Low: 890, yLow: 1000, capBottom: 1460, bottom: 1490, top: 340 },
} as const;
/** screen zones in px on the 1080 x 1920 frame, set to the HUD's real boxes (hud/: per frame hudRectsAt(f)):
 *  nothing that matters above `top` (under the REC display), below `bottom` (the post's text), or right of `rail.x`
 *  below `rail.y` (the app's buttons); the subtitle band capTop..capBottom (hud CAP_BAND, inside the kit's caption
 *  band x 110-890, y 1270-1460: the rows are anchored on their bottom, y 1458: one Chinese row about y 1375-1458, two
 *  rows from about 1295, one Chinese + two English rows from 1285, the English row (English speech only) under the
 *  Chinese, the Chinese moving up for it); faces between a quarter and half of the way down (eyes above `eyes`, the
 *  upper third); the fact card's slot MID-LEFT (`card` = hud FACT_SLOT while a card shows: keep faces out of it); the
 *  old title block's default place (`title` = hud TITLE_RECT; not mounted: skin A's MsTitle replaces it); HER CAMERA'S
 *  RECORDING UI (hud/vlog.tsx, style.ts FRAME.rec x 110-970, y 225-330) owns the two top corners under the icons:
 *  `rec` = the REC lamp's row (centre y 250) and the scene's timestamp under it (centre y 308) (hud VLOG_RECT.rec +
 *  .stamp; for the first 2 s of every scene the timestamp holds 1.5x bigger: VLOG_RECT.stampBig, about x 110-350,
 *  y 289-344; each scene's own box: hud stampRect(id, big)), `battery` = the battery and its % top right (to x 970).
 *  The mic and her hands are never drawn (props INVISIBLE); `mic` / `micRest` / `micTop` are where the invisible mic
 *  still rests (cam.ts MIC_FRAME). Every picture-tied number is the 9:15 one + 60 (the lens kept its width of view). */
export const SCREEN = {
  W: 1080, H: 1920, cx: 540, cy: 960,
  top: 340, capTop: 1280, capBottom: 1460, bottom: 1490, eyes: 660, mic: 1190, micRest: { x: 335, y: 1048 },
  /** LEGACY name (= the top of the mic's resting head): the mic's head lives in micTop..mic */
  micTop: 950,
  rail: { x: 890, y: 1000 },
  card: { x0: 110, y0: 817, x1: 732, y1: 1221 },
  title: { x0: 156, y0: 796, x1: 924, y1: 1044 },
  /** the vlog UI's corners (hud VLOG_RECT): REC + the small timestamp top left (the widest scene's, A's), its big intro
   *  for a scene's first 2 s, the battery + its % top right. The REC lamp starts on x 110 and the battery ends on x 970
   *  (style.ts FRAME.rec). */
  rec: { x0: 110, y0: 231, x1: 274, y1: 327 },
  stampBig: { x0: 110, y0: 289, x1: 354, y1: 344 },
  battery: { x0: 787, y0: 229, x1: 970, y1: 271 },
};
/** a camera given as a story.ts CamPose with Vec3s (for a mark's camera in a layout file) */
export const camOf = (pos: Vec3, look: Vec3, fov = FOV): Cam => c(pos, look, fov);
