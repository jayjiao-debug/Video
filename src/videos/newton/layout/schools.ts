// THE SCHOOLS (place "schools", island x 500): the university lecture room, a May afternoon, 1686 (PLAN 1, 7D). A tall
// stone hall with an open timber roof: rows of EMPTY oak benches either side of a middle aisle, a LECTERN at the front,
// high leaded windows down both sides, ONE SUNBEAM slanting down from a south window with dust turning in it, the tall
// door at the back standing open on the daylight. NUMBERS ONLY (sets/schools.ts builds from them, the shots pose from
// them). Owner: WP2.
// Plan (x offsets from SCX): the camera mostly looks -z, from the door (back, +z) toward the lectern (front, -z).
// NEWTON stands behind the lectern facing the benches (facing 0, toward +z). The SOUTH wall is the LEFT one (x0): the
// sun comes in through its middle window high on the left and lays its patch on the aisle in front of the first rows.
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const SCX = ISLAND.schools;
const ROWS = [-3.5, -2.4, -1.3, -0.2, 0.9, 2.0, 3.1, 4.2];
export const SCHOOLS_SET = {
  /** the walls' inner faces (x offsets; z: the front wall z0, the back wall z1), the wall plate, the ridge */ walls: { x0: -4.3, x1: 4.3, z0: -7.2, z1: 6.8 }, plate: 6.2, ridge: 9.0,
  /** the oak wainscot's top round the walls */ panel: 2.4,
  /** the windows (both side walls): z middles, width, sill, head, transom; the SUN comes through `sunWin` of the left
   *  (south) wall only (the others are shaded outside) */ windows: { z: [-4.0, 0.2, 4.0], w: 1.7, y0: 3.3, y1: 5.5, transom: 4.55, sunWin: 1 },
  /** the benches: rows' z (front edge of the seat), the aisle's half width, the seat (height, depth), the back (top),
   *  the benches' outer ends (x offsets) */ benches: { rows: ROWS, aisle: 0.65, seat: 0.45, depth: 0.36, back: 0.92, outer: 3.95 },
  /** THE LECTERN: the floor point under its desk (x, z), the desk's height at its low (reader's) and high edge, its
   *  width and depth */ lectern: { x: 0, z: -5.55, low: 0.88, high: 0.99, w: 0.74, d: 0.46 },
  /** THE TALL DOOR in the back wall: x middle, width, height (to the arch's top), arch rise; the left leaf stands open */
  door: { x: 0, w: 1.9, h: 3.9, rise: 0.5, wall: 0.6 },
  /** the sun (direction TOWARD it: high on the left, a little behind her) */ sun: [-0.62, 0.62, 0.48] as [number, number, number],
};
const L = SCHOOLS_SET.lectern, D = SCHOOLS_SET.door, W = SCHOOLS_SET.walls;
export const SCHOOLS = {
  /** THE LECTERN: the floor point under the desk, and the middle of its sloped top (his notes go here) */ lectern: V(SCX + L.x, 0, L.z), lecternTop: V(SCX + L.x, (L.low + L.high) / 2, L.z),
  /** where NEWTON stands to lecture: behind the lectern, facing the benches (facing 0) */ newton: V(SCX + L.x, 0, L.z - 0.6), newtonFacing: 0,
  /** the tall door: the doorway's middle on the floor (back wall) and a step inside it (where they come in) */ door: V(SCX + D.x, 0, W.z1), entry: V(SCX + D.x + 0.3, 0, W.z1 - 1.0),
  /** the aisle's middle line (x) and the rows' z (seat front edges); the end of row k nearest the aisle on the left /
   *  right */ aisleX: SCX, rows: ROWS, rowL: (k: number) => V(SCX - SCHOOLS_SET.benches.aisle, 0, ROWS[k] + 0.2), rowR: (k: number) => V(SCX + SCHOOLS_SET.benches.aisle, 0, ROWS[k] + 0.2),
  /** the sun's patch on the floor (the sunbeam lands here) */ beamFloor: V(SCX + 0.2, 0, -2.9),
  /** where SHE stands to clap (in the aisle by the third row, the lectern ahead) */ clap: V(SCX + 0.15, 0, -0.9),
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197); };
/** NAMED CAMERAS (her eyes, EYE over the boards) */
export const SCHOOLS_CAMS: Record<"wide" | "door" | "lectern" | "benches" | "beam" | "clap", Cam> = {
  /** D: THE WIDE HOLD from the back by the door: the empty benches, the sunbeam, one man at the lectern */
  wide: eyeCam(SCX + 1.35, W.z1 - 0.8, [SCX - 0.1, 1.5, L.z - 0.5]),
  /** D: on the threshold of the tall door, looking in */
  door: eyeCam(SCX + D.x - 0.2, W.z1 - 0.15, [SCX + 0.2, 1.7, -2]),
  /** D: in front of the lectern (about 2.2 m): NEWTON laying out his notes, lecturing */
  lectern: eyeCam(SCX + 0.55, L.z + 1.75, [SCX + L.x, third(SCX + 0.55, L.z + 1.75, SCX + L.x, L.z - 0.6), L.z - 0.6]),
  /** D 27: from the right-hand benches, looking across the empty rows to him at the lectern */
  benches: eyeCam(SCX + 2.6, -0.2, [SCX + L.x, third(SCX + 2.6, -0.2, SCX + L.x, L.z - 0.6), L.z - 0.6]),
  /** the sunbeam: looking across the hall into the beam and its dust, the window high on the left */
  beam: eyeCam(SCX + 2.4, 1.6, [SCX - 0.9, 2.2, -2.2]),
  /** D 28: where she claps (the aisle by the third row), the lectern ahead */
  clap: eyeCam(SCX + 0.15, -0.9, [SCX + L.x, third(SCX + 0.15, -0.9, SCX + L.x, L.z - 0.6), L.z - 0.6]),
};
/** the stand-in staging: NEWTON at the lectern */
export const SCHOOLS_STAND: Stand = { cam: SCHOOLS_CAMS.lectern, newton: SCHOOLS.newton, facing: 0 };
