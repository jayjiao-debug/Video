// THE STREET (place "street", island x 400): out of the college gate along a Cambridge street, a May afternoon, 1686
// (PLAN 1, 7D start). Short and compact: he walks, the camera trots beside him. NUMBERS ONLY (sets/street.ts builds
// from them, the shots pose from them). Owner: WP2.
// Plan (x offsets from STRX): the street runs along z between two building lines. NEWTON comes out of the GATE on the
// WEST side (its arch faces +x onto the street), turns right and walks DOWN the street toward +z, toward the camera:
// the camera mostly looks back up the street (-z) at him, so his face is lit and three-quarter to her, never profile.
//   WEST  the college: the GATEHOUSE (brick with stone dressings, four corner turrets with battlements, a big
//         four-centred arch with the great timber gates folded open and a sunny court seen through the passage), the
//         college's brick range running on both sides of it, then a pair of town houses toward the camera;
//   EAST  a row of town houses: timber-framed and jettied (oak studs on pale plaster) with gables to the street, two of
//         brick with shaped gables; shop fronts with shutters and doors, leaded casements, hanging signs on irons;
//   the carriageway: cobbles with a central stone kennel (gutter), stone flag footways along both fronts, a few oak
//   posts guarding the footway.
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const STRX = ISLAND.street;
const WX = -3.6, EX = 3.6, LINE = -1.35;          // the building lines (west, east) and his walking line
export const STREET_SET = {
  /** the building lines (x offsets) and the street's z extent */ x0: WX, x1: EX, z0: -26, z1: 16,
  /** the stone flag footways' width along each front, the kennel's width (at x 0) */ foot: 0.95, kennel: 0.42,
  /** THE GATEHOUSE on the west side: its front's x (it stands proud of the range), z span, depth, height to the parapet;
   *  the turrets (radius, height, how far they stand proud of the front); THE ARCH (z middle, width, spring height, rise) */
  gate: { x: WX + 0.25, z0: -13.2, z1: -5.6, depth: 7.0, h: 11.5, turret: { r: 0.85, h: 14.2, out: 0.35 }, arch: { z: -9.4, w: 3.5, h: 4.0, rise: 0.9 } },
  /** the college range either side of the gate: height to the parapet, ground and first floor window heights; it
   *  runs north of the gate to z0 and south of it to `rangeTo`, then two town houses to z1 */
  range: { h: 7.4, gy0: 0.95, gy1: 2.35, fy0: 4.1, fy1: 5.6, w: 1.1, rangeTo: 3.2 },
  /** the houses: [z0, z1, kind, storeys' heights (ground, upper), jetty, gable] along the east line (and the two west
   *  houses after the range). kind: "timber" | "brick" | "plaster" */
  east: [
    [-26, -20.6, "brick", 3.0, 2.9, 0, 3.4], [-20.6, -15.8, "timber", 2.8, 2.6, 0.45, 2.6], [-15.8, -10.4, "timber", 2.8, 2.6, 0.45, 3.0],
    [-10.4, -5.6, "plaster", 2.9, 2.7, 0.4, 0], [-5.6, -0.2, "timber", 2.8, 2.6, 0.45, 2.8], [-0.2, 5.4, "brick", 3.0, 2.9, 0, 3.2],
    [5.4, 10.6, "timber", 2.8, 2.6, 0.45, 2.7], [10.6, 16, "plaster", 2.9, 2.7, 0.4, 0],
  ] as [number, number, "timber" | "brick" | "plaster", number, number, number, number][],
  west: [[3.2, 9.0, "timber", 2.8, 2.6, 0.45, 2.8], [9.0, 16, "brick", 3.0, 2.9, 0, 3.2]] as [number, number, "timber" | "brick" | "plaster", number, number, number, number][],
  /** the oak posts along the footways: x offset, z list, height */ posts: { x: EX - 1.05, z: [-14, -8, -2.5, 3.5, 9.5], h: 0.95 },
  /** the hanging signs (on irons over the east footway): z list, the height of the iron */ signs: { z: [-13.1, -2.9, 8.0], y: 3.15 },
  /** the sun (direction TOWARD it: an afternoon sun behind her left shoulder, the gate's front lit) */ sun: [0.55, 0.62, 0.56] as [number, number, number],
};
const G = STREET_SET.gate;
export const STREET = {
  /** under the gate's arch, in the passage (he comes out from here) and the arch's mouth on the street line */ gateIn: V(STRX + G.x - 2.6, 0, G.arch.z), gate: V(STRX + G.x + 0.4, 0, G.arch.z),
  /** where he turns down the street (on his walking line) and where the street part ends */ turn: V(STRX + LINE, 0, G.arch.z + 1.4), walkTo: V(STRX + LINE, 0, 12),
  /** HIS WALK: gate passage -> the arch -> the turn -> down the street toward the camera (facing about 0) */ path: [V(STRX + G.x - 2.6, 0, G.arch.z), V(STRX + G.x + 0.4, 0, G.arch.z), V(STRX + LINE, 0, G.arch.z + 1.4), V(STRX + LINE, 0, 12)],
  /** his walking line's x (a little west of the kennel, on the cobbles) */ lineX: STRX + LINE,
  /** the kennel (gutter) centre line's x; the footways' inner edges */ kennelX: STRX, footW: STRX + WX + STREET_SET.foot, footE: STRX + EX - STREET_SET.foot,
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197); };
/** NAMED CAMERAS (her eyes, EYE over the cobbles) */
export const STREET_CAMS: Record<"gate" | "trot" | "wipe" | "street" | "back", Cam> = {
  /** D start: across the street, looking at the gate's arch as he comes out of it */
  gate: eyeCam(STRX + 2.4, G.arch.z + 7.6, [STRX + G.x - 0.4, 3.3, G.arch.z - 0.6]),
  /** D: trotting beside him on the college side, a little ahead (three-quarter front), looking across the street:
   *  the timber fronts and the shop signs behind him */
  trot: eyeCam(STRX + LINE - 1.3, 1.75, [STRX + LINE, third(STRX + LINE - 1.3, 1.75, STRX + LINE, -0.5), -0.5]),
  /** D: close beside him for the handkerchief (his face about 0.9 m away), the timber fronts behind */
  wipe: eyeCam(STRX + LINE - 0.65, 0.45, [STRX + LINE, third(STRX + LINE - 0.65, 0.45, STRX + LINE, -0.5), -0.5]),
  /** the street down from the camera's end: the cobbles, the fronts and the gate's turrets at the far end */
  street: eyeCam(STRX + 1.0, 13.5, [STRX - 1.2, 3.0, -10]),
  /** looking down the street the way he goes (the far end toward +z) */
  back: eyeCam(STRX - 0.6, -5.0, [STRX + 0.4, 2.2, 12]),
};
/** the stand-in staging: NEWTON walking down the street toward her */
export const STREET_STAND: Stand = { cam: STREET_CAMS.trot, newton: V(STRX + LINE, 0, -0.5), facing: 0 };
