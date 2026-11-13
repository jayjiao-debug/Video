// THE HALL (place "hall", island x 0): IMPORTED from Wanbi (src/videos/wanbi/layout/hall.ts: HALL marks, HALL_SET, the
// set itself is wanbi/sets/hall.ts buildHall). Wanbi is pinned at this branch's base, so its numbers are stable. This
// file adds the Qin film's own marks in the same hall (PLAN 1: a low desk with slip towers and a steelyard scale in
// front of the dais; Xu Fu's way in by the east door; the wall for the asides). Owner after WP1: the sets / cast lanes.
// The hall: floor x -3.4..3.4, z -6.0..3.4; north wall z -6.0; the east door in x 3.4 at z -2.3; the dais z -5.5..-4.0
// with its step to z -3.75; pillars W1 (-1.41, -1.10), E1 (1.41, -1.10), W2 (-1.41, -3.30), E2 (1.41, -3.30).
import { HALL, HALL_SET, HALL_CAMS } from "../../wanbi/layout/hall";
import { V, eyeCam, type Stand } from "./base";

export { HALL, HALL_SET, HALL_CAMS };
/** the Qin film's marks in the hall */
export const QHALL = {
  /** the low desk in front of the step (the prop "desk": origin = on the floor under its middle, facing +z) */ desk: V(0, 0, -2.85),
  /** the desk's top (the prop's size): its world height and its half sizes */ deskTop: 0.42, deskHalf: { x: 0.65, z: 0.3 },
  /** where he sits behind the desk (on a cushion on the floor, facing the camera side) */ sit: V(0, 0, -3.4),
  /** the steelyard scale on its stand, right of the desk (screen right from the south) */ scale: V(0.95, 0, -2.75),
  /** slip towers on the floor round the desk (the prop "slips" stacked) */ slips: [V(-0.95, 0, -3.0), V(-1.0, 0, -2.45), V(0.95, 0, -3.35)],
  /** the east door (Xu Fu comes in by it) and where he kneels */ door: V(3.0, 0, -2.3), xufuKneel: V(1.0, 0, -2.0),
  /** the west wall she whispers to in the asides (a point 0.35 m off it at her eye height) */ asideWall: V(-3.05, 1.55, -1.6),
};
/** the stand-in staging: the EMPEROR behind the desk, her eyes south of it */
export const HALL_STAND: Stand = { cam: eyeCam(0.45, 0.4, [0, 1.25, -3.4]), emperor: V(0, 0, -3.46), facing: 0 };
