// THE RIVER (place "river", island x 500): dawn on the river below 白鹤峰 (PLAN 1, 8G). NUMBERS ONLY. Owner WP2b (WP1's
// names kept; marks and cameras added).
// She stands on the muddy bank (+z) looking -z across the wide water; reeds along the bank's edge left and right (a
// clear landing in front of her: the boat lies there), a mooring stake; the boat pulls away from the landing out toward
// the far hill, where the new house sits small at the top (sets/parts/farhouse.ts, WP2a) with its lantern a warm dot;
// misty hills behind, the dawn glow low at the left. The water's surface is a hair under y 0 (the boat prop rests ON
// y 0, so nothing it carries goes under the clearance checker's floor).
import { ISLAND, V, eyeCam, frontCam, type Stand, type Cam, type Path } from "./base";

/** the island's x */
export const VX = ISLAND.river;
/** the far house's turn about y: toward her eye on the bank (WP2a's advice) */
const HOUSE_YAW = Math.atan2(-9, 94.3), CY = Math.cos(HOUSE_YAW), SY = Math.sin(HOUSE_YAW);
/** the far house's tilt toward the river (its front down, about its own x; then the yaw): seen from the bank 20 m
 *  below and 95 m off, a level yard in front of it would hide its walls; tilted 9 degrees (the hilltop under it tilts
 *  the same: sets/river.ts) its walls show over the yard's edge (a lean in depth only: on screen it stays upright) */
const HOUSE_TILT = (9 * Math.PI) / 180, CT = Math.cos(HOUSE_TILT), ST = Math.sin(HOUSE_TILT);
/** the house's lantern in its own frame (WP2a's farhouse: YARD.lantern from the yard's middle) turned into the world */
const LANT = { x: 1.35, y: 2.3, z: -3.75 }, LZ = LANT.y * ST + LANT.z * CT;
export const RIVER_SET = {
  /** the bank (mud, reeds) down to its edge at z `edge` (the edge wavers a little left and right of the landing); the
   *  water beyond, its surface y */ bank: { x0: VX - 40, x1: VX + 40, z0: -0.6, z1: 25 }, edge: -0.6, water: { z0: -260, y: -0.04 },
  /** the far hill (白鹤峰 across the bend) and the house at its top (low detail, WP2a's makeFarHouse; its origin = the
   *  yard's middle, turned to face `faceTo`), its scale */ hill: { x: VX + 9, z: -95, r: 40, top: 22 }, house: V(VX + 9, 21, -92), houseScale: 1.0,
  /** NEW: the house's turn about y (toward her eye on the bank) and its tilt toward the river (rotation order YXZ) */ houseYaw: HOUSE_YAW, houseTilt: HOUSE_TILT,
  /** the landing in front of her (no reeds within it): x range */ landing: { x0: VX - 2.2, x1: VX + 2.4 },
  /** the low dawn sun (behind the hills at the left): azimuth (degrees from -z toward +x) and elevation */ sun: { az: -16, el: 4 },
};
export const RIVER = {
  /** where she stands on the bank */ bank: V(VX, 0, 2.3),
  /** the boat's way out (the boat's origin on y 0, its bottom; 3.6 m long along z: the first point leaves 0.6 m of
   *  water between its stern and the bank's edge), then out and small */ boatPath: [V(VX - 0.5, 0, -3.0), V(VX + 0.3, 0, -9), V(VX + 1.8, 0, -22), V(VX + 3.8, 0, -45)] as Path,
  /** the family on the bank round her (foreground edges): MAI, the two kids, the dog */ mai: V(VX - 1.35, 0, 1.1), kids: [V(VX + 1.05, 0, 1.05), V(VX + 1.55, 0, 1.65)], dog: V(VX + 0.55, 0, 0.45),
  /** SU's mark for the stub (at the bank's edge, before the boat) */ su: V(VX - 0.2, 0, -0.1), suFacing: 0,
  /** NEW: the mooring stake at the landing's left (a rope from it to the boat's bow is the shot's business) */ stake: V(VX - 1.7, 0, -0.45),
  /** NEW: the far house's lantern (a warm dot: world point; WP2a's farhouse puts it at YARD.lantern from the yard's
   *  middle, here at RIVER_SET.house) */ houseLantern: V(VX + 9 + LANT.x * CY + LZ * SY, 21 + LANT.y * CT - LANT.z * ST, -92 - LANT.x * SY + LZ * CY),
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const RIVER_CAMS: Record<"bank" | "far" | "wave" | "shout" | "house", Cam> = {
  /** G pre-G52: from the bank, the boat near (SU and GUO in the stern), the family at the frame's edges */
  bank: eyeCam(VX, 2.3, [VX + 0.1, 0.75, -4.0]),
  /** G after G52: the boat small on the river, the far hill and the house */
  far: eyeCam(VX + 0.2, 2.3, [VX + 1.6, 1.4, -24]),
  /** her hand waving (hand "wave"): a little lower and wider */
  wave: eyeCam(VX - 0.2, 2.6, [VX + 0.4, 0.9, -6]),
  /** NEW: G52, her phone zoomed in on him shouting back from the stern (the boat about boatPath[1]) */
  shout: { pos: [VX + 0.1, 1.5, 2.3], look: [VX + 0.25, 0.95, -8.0], fov: 34 },
  /** NEW: the far hill and the house with its lantern (a cutaway up the hill) */
  house: { pos: [VX + 0.2, 1.5, 2.3], look: [VX + 9.5, 19.0, -95], fov: 30 },
};
/** the stand-in staging (the WP1 stubs): SU at the bank's edge, her eyes on the bank */
export const RIVER_STAND: Stand = { cam: frontCam(RIVER.su, RIVER.suFacing, 2.4, { side: 0.2 }), su: RIVER.su, facing: RIVER.suFacing };
