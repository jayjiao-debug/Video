// THE PINES (place "pines", island x 400): night on the lake path through the pine wood (惠州西湖), the grave under the
// six-pillared pavilion (六如亭) (PLAN 1, 8F). NUMBERS ONLY. Owner WP2b (WP1's names kept; marks and cameras added).
// The path runs from the lens side (+z) toward -z through the pines; the lake lies to the right (+x) beyond a stony
// bank, the big moon over it (above the pavilion's right shoulder seen from the path); at the path's end, a little right
// of it, the small grave mound with its stele under the pavilion: a hexagonal stone platform (a step up toward the
// path), six slim red pillars, a hexagonal roof with up-turned corners. He walks the path with the lantern, stops on
// `su` before the step, sets the lantern down on it at his left (`lantern`), and later turns to the grave (back
// three-quarters to her lens).
// NIGHT IS A BLUE MID-TONE, NEVER BLACK. The lake's surface is 0.3 m under the bank (nobody stands in it).
import { ISLAND, V, eyeCam, frontCam, type Stand, type Cam, type Path } from "./base";

/** the island's x */
export const PX = ISLAND.pines;
export const PINES_SET = {
  /** the ground (pine needles, y 0) up to the bank at x1, and the path's width */ ground: { x0: PX - 40, x1: PX + 3.4, z0: -45, z1: 25 }, pathW: 1.4,
  /** the lake (its surface, below the bank) */ lake: { x0: PX + 3.4, x1: PX + 160, z0: -160, z1: 40, y: -0.3 },
  /** the pavilion: its middle, radius to the pillars, pillar radius, the eave height and the roof's top (the finial
   *  goes 0.3 m higher); `plat` = the hexagonal stone platform (radius to its corners, top height; a flat side faces
   *  +z), `roofR` = the eave's radius to its corners */
  pavilion: { x: PX + 0.95, z: -9.1, r: 1.42, pillarR: 0.085, eave: 2.4, top: 3.4, plat: { r: 1.8, top: 0.3 }, roofR: 2.15 },
  /** the grave mound on the platform: radius, height above the platform; the stele in front of it (width, height,
   *  thickness); the steps in front of the platform (toward +z): count, rise, depth, width */
  mound: { r: 0.72, h: 0.52 }, stele: { w: 0.46, h: 0.72, d: 0.12 }, steps: { n: 1, rise: 0.15, depth: 0.42, w: 1.7 },
  /** the moon (a disc in the sky over the lake): azimuth (degrees from -z toward +x), elevation, its apparent
   *  diameter (degrees: big on purpose), distance */ moon: { az: 24, el: 15, deg: 7.5, dist: 170, dir: [0.393, 0.259, -0.882] as [number, number, number], r: 11.1 },
  /** the shore line of the lake (x, z): the land is on its -x / +z side; beyond the pavilion the lake wraps round behind
   *  it (the pavilion stands on a low point with the moonlit water behind) */ shore: [[PX + 3.4, 30], [PX + 3.4, -7.4], [PX + 3.0, -10.6], [PX + 1.6, -12.6], [PX - 1.2, -13.4], [PX - 4.4, -13.6], [PX - 7.2, -15.5], [PX - 9.0, -22], [PX - 10.5, -48]] as [number, number][],
};
const ST = PINES_SET.steps, PV = PINES_SET.pavilion;
/** the platform's front edge (the flat side facing +z) and the lower step's front edge */
const PLAT_FRONT = PV.z + PV.plat.r * Math.cos(Math.PI / 6), STEP_FRONT = PLAT_FRONT + ST.depth;
export const PINES = {
  /** his walk along the lake path (a polyline: she follows a step behind and to the side) */
  path: [V(PX + 0.35, 0, 8.0), V(PX, 0, 4.0), V(PX - 0.3, 0, 0.5), V(PX - 0.05, 0, -2.8), V(PX + 0.45, 0, -5.4)] as Path,
  /** where the path ends and he stops (F after F45): the last point of `path` */ stop: V(PX + 0.45, 0, -5.4),
  /** the pavilion's middle and the grave mound (the ground under its top: the platform is 0.3 m up) */ pavilion: V(PV.x, 0, PV.z), grave: V(PV.x, PV.plat.top, PV.z),
  /** the lower step's top middle */ step: V(PV.x, ST.rise, (PLAT_FRONT + STEP_FRONT) / 2),
  /** NEW: where he sets the lantern down: on the lower step's top at his left (the lantern prop's hook goes 0.40 m over
   *  it: props LANTERN_CENTRE); glow it at y + 0.2 */ lantern: V(PV.x + 0.4, ST.rise, STEP_FRONT - 0.14),
  /** where he stands before the grave (F46-F51): facing the lens (0) or turned to the grave (suGrave) */ su: V(PX + 0.85, 0, STEP_FRONT + 0.48), suFacing: 0.1,
  /** NEW: his facing when he turns to the grave (back three-quarters to the lens at PINES_CAMS.stop / close) */ suGrave: Math.PI - 0.3,
  /** NEW: the stele's face middle (where his eyes go when he looks at the grave) */ stele: V(PV.x, PV.plat.top + 0.42, PV.z + PINES_SET.mound.r + 0.08),
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const PINES_CAMS: Record<"walk" | "stop" | "push" | "close" | "reveal" | "wide", Cam> = {
  /** F pre-F45: walking a step behind and to the side of him on the path (the follow's resting framing) */
  walk: eyeCam(PX + 0.9, 3.0, [PX - 0.2, 1.1, -0.6]),
  /** F after F45: he has stopped; the pavilion's pillars and the mound behind him, the lake and the moon at the right */
  stop: frontCam(PINES.su, PINES.suFacing, 2.6, { side: -0.25, eyesPx: 640 }),
  /** F48 after: the slow push-in starts here ... */
  push: frontCam(PINES.su, PINES.suFacing, 2.3, { side: -0.2, eyesPx: 620 }),
  /** ... and ends here (F50's end) */
  close: frontCam(PINES.su, PINES.suFacing, 1.35, { side: -0.1, eyesPx: 560 }),
  /** NEW: F after F45, the reveal: from behind his right shoulder as he stops, the whole pavilion ahead, the moon over
   *  the lake at the right */
  reveal: eyeCam(PX - 0.35, -2.2, [PX + 1.1, 1.75, -9.1]),
  /** NEW: F pre, establishing: the path through the pines, the moonlit lake and the moon */
  wide: eyeCam(PX + 0.2, 8.5, [PX + 1.6, 1.7, -4.0]),
};
/** the stand-in staging (the WP1 stubs): SU before the grave, her eyes at `stop` */
export const PINES_STAND: Stand = { cam: PINES_CAMS.stop, su: PINES.su, facing: PINES.suFacing };
