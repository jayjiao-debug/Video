// THE TEMPLE (place "temple", island x 700): 金山寺 hall, four years later (PLAN 1, 8I). NUMBERS ONLY. Owner WP2b
// (WP1's names kept; marks and cameras added).
// A side hall of the temple seen from its front (+z) looking -z: a wooden plank floor, cream plaster walls over a dark
// wooden dado between timber posts, four dark red pillars on stone bases carrying a painted beam, lattice windows in
// the LEFT (west) wall with soft light coming in (warm shafts on the floor), a long low altar table under the portrait
// (two candles, a vase), the bronze incense burner on its stand at the left with a thread of smoke, a 木鱼 on a stand
// and two straw prayer cushions; and on the back wall (z -4.2) THE PORTRAIT: a big hanging scroll of 苏东坡 painted
// years ago (younger, plump, a full beard, the tall square 东坡巾, flat toon colours on silk, a brocade mounting, two
// rollers). SU_OLD stands before it (1.75 m in front of the altar), leaning on his stick; he turns to look up at it
// (back three-quarters) and back to her lens.
// The front wall (z 4.4) is hidden by the set's view() while her lens is inside.
import { ISLAND, V, eyeCam, frontCam, type Stand, type Cam } from "./base";

/** the island's x */
export const TX = ISLAND.temple;
export const TEMPLE_SET = {
  /** the floor (wood) inside the walls; the back wall's z; wall height */ floor: { x0: TX - 4.2, x1: TX + 4.2, z0: -4.2, z1: 4.4 }, back: -4.2, wallH: 4.4,
  /** the four pillars (feet) and their radius (stone bases r 0.3, 0.16 high) */ pillars: [[TX - 2.4, -2.9], [TX + 2.4, -2.9], [TX - 2.4, 0.9], [TX + 2.4, 0.9]] as [number, number][], pillarR: 0.2,
  /** THE PORTRAIT: the whole hanging scroll on the back wall: its middle x, the bottom roller's and the top stick's
   *  heights, its width, its face's z (a hair proud of the wall); `core` = the painting inside the mounting (y0..y1,
   *  width) */ portrait: { x: TX, y0: 0.95, y1: 3.75, w: 1.5, z: -4.12, core: { y0: 1.35, y1: 3.15, w: 1.18 } },
  /** the incense burner (a bronze 鼎 on a low stand): its foot middle, height (the smoke rises from its top) */ burner: { x: TX - 1.45, z: -2.75, h: 0.92 },
  /** the windows in the left wall (light comes in through them): their middles along z, sill and head heights, width */ windows: { x: TX - 4.2, z: [-2.2, 1.2], y0: 1.15, y1: 2.75, w: 1.5 },
  /** the altar table under the portrait: middle x, z range, top height, width */ altar: { x: TX, z0: -4.08, z1: -3.5, top: 0.8, w: 2.2 },
  /** the 木鱼 on its stand (right of the altar) and the two prayer cushions (蒲团: middle, radius, height) */ muyu: { x: TX + 1.6, z: -3.5 }, cushions: [[TX - 0.7, -2.65], [TX + 1.5, -2.7]] as [number, number][], cushion: { r: 0.3, h: 0.14 },
};
export const TEMPLE = {
  /** the middle of the portrait (on the wall) */ portrait: V(TX, 2.35, -4.15),
  /** the portrait's painted FACE (the young Su's eyes, on the wall: aim a camera here for the painting close-up) */ portraitFace: V(TX, 2.74, -4.15),
  /** where SU_OLD stands before it, facing her (0) or turned to the painting (PI: back three-quarters) */ su: V(TX + 0.45, 0, -1.7), suFacing: 0.05,
  /** his facing when he looks up at the portrait (back three-quarters to the lens at TEMPLE_CAMS.stand) */ suLook: Math.PI - 0.35,
  /** the incense burner */ burner: V(TX - 1.45, 0, -2.75),
  /** the burner's mouth (where the smoke starts) */ smoke: V(TX - 1.45, 0.92, -2.75),
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const TEMPLE_CAMS: Record<"stand" | "portrait" | "ease" | "wide" | "face", Cam> = {
  /** I pre-I56: SU_OLD before the portrait, the mic beside him (the painting behind and above him) */
  stand: frontCam(TEMPLE.su, TEMPLE.suFacing, 2.5, { side: -0.3, eyesPx: 640 }),
  /** I after I56: over his right shoulder, the portrait big (he stands in the lower left, turned to it) */
  portrait: eyeCam(TX + 1.1, 1.2, [TX + 0.05, 1.8, -4.15]),
  /** I57: eased in a little on him, his face ABOVE the end names (hud NAMES_RECT starts at y 690) */
  ease: frontCam(TEMPLE.su, TEMPLE.suFacing, 1.9, { side: -0.2, eyesPx: 460 }),
  /** NEW: the wipe lands (the stamp top left): the hall, the portrait on the back wall, him small before it */
  wide: eyeCam(TX + 0.9, 3.4, [TX + 0.1, 1.55, -3.6]),
  /** NEW: the portrait's face close (a cutaway: the young Su looking down at the old one) */
  face: { pos: [TX - 0.6, 1.62, -1.0], look: [TEMPLE.portraitFace.x, TEMPLE.portraitFace.y - 0.25, TEMPLE.portraitFace.z], fov: 50 },
};
/** the stand-in staging (the WP1 stubs): SU_OLD before the portrait, her eyes at `stand` */
export const TEMPLE_STAND: Stand = { cam: TEMPLE_CAMS.stand, su: TEMPLE.su, facing: TEMPLE.suFacing };
