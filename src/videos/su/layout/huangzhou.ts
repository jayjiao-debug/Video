// HUANGZHOU (place "huangzhou", island x 300): the painted INK-SCROLL flashback (PLAN 1, 8B 9). NUMBERS ONLY. Owner
// WP2b (WP1's names kept; marks and cameras added).
// Two small dioramas on the one island, side by side (the param `vignette` shows one), both painted like a Song ink
// scroll (paper-cream, ink-grey, very few colours):
//   "slope" round x HX - 10: the bare terraced hillside 东坡: a ploughed field in front (flat, y 0: the furrows run along
//           his walk, diagonally toward the lens), dry terraces climbing behind (-z) to a ridge, a small thatched hut
//           (雪堂) on the upper left terrace, two bare ink trees, ink mountains in the mist and the river far off. SU walks
//           behind the plough (WP3's prop: ploughFor(su, suFacing)) along `furrow`, the camera drifts sideways
//           (slope -> slopeEnd).
//   "pot"   round x HX + 10: a farmhouse corner at night (earth floor, two walls in an ink wash, a lattice window with
//           the moon, a straw raincoat and a hat on the wall, firewood), a low clay fire ring with a small fire, the clay
//           pot on it (lid: param `lid`; steam: `steam`), glossy RED pork cubes inside: the only saturated colour.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

/** the island's x */
export const HX = ISLAND.huangzhou;
export const HUANGZHOU_SET = {
  /** the slope vignette: its middle x, the field (flat, y 0) and the terraces climbing behind it (-z: from z0 back to z1,
   *  n steps of `rise`), the ridge behind them (height, z) */ slope: { x: HX - 10, field: { x0: HX - 22, x1: HX + 2, z0: -4.2, z1: 9 }, terraces: { z0: -4.2, z1: -16, rise: 0.75, n: 6 }, ridge: { y: 7.5, z: -30 } },
  /** the pot vignette: its middle x, the corner's two walls (back z, left x; the right wall at `right`), wall height,
   *  the fire ring (radius, height), the pot (radius at its belly, height from the ring's top to the lid's top) */
  pot: { x: HX + 10, back: -2.2, left: HX + 8.6, right: HX + 12.4, wallH: 2.5, hearth: { r: 0.42, h: 0.18 }, pot: { r: 0.26, h: 0.42 } },
};
const SU_AT = V(HX - 10.4, 0, -1.4), SU_FACING = 0.45, DIR = V(Math.sin(SU_FACING), 0, Math.cos(SU_FACING));
export const HUANGZHOU = {
  /** "slope": SU walks behind the plough along the field's furrow (from, to: along his facing, diagonally toward the
   *  lens), facing the lens three-quarters; `plough` = the plough prop's origin for him on `su` (props
   *  ploughFor(HUANGZHOU.su, HUANGZHOU.suFacing).at: the ground under its handle, 0.32 m ahead of him) */
  slope: V(HX - 10, 0, 0), su: SU_AT, suFacing: SU_FACING, plough: SU_AT.clone().addScaledVector(DIR, 0.32),
  furrow: [SU_AT.clone().addScaledVector(DIR, -1.0), SU_AT.clone().addScaledVector(DIR, 0.8)],
  /** "pot": the pot on the fire ring (the ground under it), the lid's top (world point: the knob), where the lid lies
   *  when it is off (the ground under its middle, right of the ring) */
  pot: V(HX + 10, 0, -1.0), potTop: V(HX + 10, 0.62, -1.0), lidAside: V(HX + 10.66, 0, -0.74),
  /** NEW: the pork's top in the open pot (the middle of the glossy cubes) */ pork: V(HX + 10, 0.5, -1.0),
};
/** NAMED CAMERAS (her eyes, 1.50 m; the pot shots lower: she bends over it) */
export const HUANGZHOU_CAMS: Record<"slope" | "slopeEnd" | "pot" | "potClose" | "lid" | "pork", Cam> = {
  /** B15: the hillside, SU behind the plough (the lateral drift starts here ...) */
  slope: eyeCam(HX - 11.6, 3.6, [HX - 10.2, 0.8, -1.4]),
  /** ... and ends here */
  slopeEnd: eyeCam(HX - 9.4, 3.6, [HX - 10.0, 0.8, -1.3]),
  /** B16: the pot on the little fire, steam (the slow push starts here) */
  pot: { pos: [HX + 10.35, 1.15, 1.25], look: [HX + 10, 0.42, -1.0], fov: 62 },
  /** B16 end of the push */
  potClose: { pos: [HX + 10.2, 0.98, 0.15], look: [HX + 10, 0.45, -1.0], fov: 62 },
  /** B16 after: the lid lifts: close on the red pork (looking down into the pot) */
  lid: { pos: [HX + 10.12, 1.22, -0.32], look: [HX + 10.02, 0.42, -1.0], fov: 62 },
  /** NEW: B17 「这就是东坡肉！」: the glossy red cubes fill the frame */
  pork: { pos: [HX + 10.06, 1.0, -0.62], look: [HX + 10.0, 0.44, -1.0], fov: 52 },
};
/** the stand-in staging (the WP1 stubs): SU behind the plough, her eyes at `slope` */
export const HUANGZHOU_STAND: Stand = { cam: HUANGZHOU_CAMS.slope, su: HUANGZHOU.su, facing: HUANGZHOU.suFacing };
