// THE TERRACE (place "terrace", island x 200): 梁山宫's terrace at noon (PLAN 1, 7D): a covered porch along the front of
// the hall, a waist-high stone parapet, two red pillars and the roof's eave framing the view; far below, a road
// through the fields where the line of tiny carriages travels (many on day 1, few on day 2). NUMBERS ONLY (sets/
// terrace.ts builds from them). Owner: the sets lane (WP2). The view over the parapet is toward -z; the terrace floor is
// y 0, the plain lies `fields.y` below.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

export const TX = ISLAND.terrace;
export const TERRACE_SET = {
  /** the terrace's stone floor (to the hall's front wall at z1) */ floor: { x0: TX - 5, x1: TX + 5, z0: -3.32, z1: 3.2 },
  /** the parapet along the front (its inner face z, its top, its thickness) and round both ends (inner face x
   *  offset `endX`); posts every `post` m */ parapet: { z: -3.0, top: 1.0, t: 0.32, endX: 4.7, post: 1.25 },
  /** the two pillars that frame the view: x offsets from TX, z, diameter, height */ pillars: { x: 1.75, z: -2.55, d: 0.46, h: 3.9 },
  /** the roof: the eave's underside y at its front edge z0, the ceiling over the porch (y) back to the hall's wall at z1 */ eave: { y: 3.9, z0: -3.7, z1: 3.2, ceil: 4.3 },
  /** the hall's front wall behind the camera (doors), its z = floor.z1 */ hall: { z: 3.2 },
  /** the plain far below: its level, its extent (the painted ground) */ fields: { y: -16, x0: TX - 260, x1: TX + 260, z0: -520, z1: -3.4 },
  /** THE ROAD the procession travels: a polyline [x, z] on the plain from near left to far right; the carriages keep
   *  `gap` m apart and move at `speed` m/s; `n` = the long line (day 1), `few` = day 2. Near the terrace the road is
   *  hidden by the parapet from 3.5 m back (it shows beyond ~110 m); from the parapet it shows from ~35 m. */
  road: { pts: [[TX - 60, -40], [TX - 10, -90], [TX + 10, -140], [TX + 5, -200], [TX - 30, -270], [TX - 80, -340]] as [number, number][], w: 6, gap: 11, speed: 1.3, n: 14, few: 3 },
  /** banners on poles at both ends of the parapet (x offsets), their height */ banners: { x: 4.3, z: -2.75, h: 5.2 },
};
export const TERRACE = {
  /** where he stands at the parapet, looking out (back to the camera), and where he turns to her (D04) */ emperor: V(TX - 0.6, 0, -2.25),
  /** the attendants kneel along the east side (D04 pan) */ attendants: [V(TX + 1.6, 0, -1.2), V(TX + 2.4, 0, -0.4), V(TX + 3.2, 0, 0.4), V(TX + 1.6, 0, 0.8), V(TX + 2.4, 0, 1.6)],
  /** the guard who stares into the lens */ guard: V(TX + 3.6, 0, 2.2),
};
/** NAMED CAMERAS (her eyes, 1.55 m) */
export const TERRACE_CAMS: Record<"stand" | "wide" | "parapet" | "attendants", Cam> = {
  /** D01: 3.5 m from the parapet, over it the plain and the far end of the procession */
  stand: eyeCam(TX + 0.5, 0.5, [TX - 0.3, 0.6, -14]),
  /** following him out onto the terrace: both pillars and the eave frame the view */
  wide: eyeCam(TX + 0.2, 2.7, [TX, 1.0, -14]),
  /** at the parapet, looking down at the road and the line of carriages */
  parapet: eyeCam(TX + 0.7, -2.15, [TX - 6, -9, -52]),
  /** D04: the pan across the kneeling attendants (east side) */
  attendants: eyeCam(TX - 0.2, 0.2, [TX + 3.0, 0.6, 0.4]),
};
/** her eyes 3.5 m from the parapet looking out over it, the EMPEROR at the parapet, a little left, turned to her */
export const TERRACE_STAND: Stand = { cam: eyeCam(TX + 0.5, 0.5, [TX - 0.3, 0.6, -14]), emperor: V(TX - 0.11, 0, -2.4), facing: 0.21 };
