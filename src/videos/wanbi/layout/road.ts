// THE ROAD 传舍后门 (place "road", island x 80): DUSK behind the guesthouse. BIBLE section 3 (marks, the set's
// numbers) and section 4 (the two road cameras). NUMBERS ONLY: sets/road.ts builds from this file and the shots pose
// from it. Re-exported by layout.ts (ROAD, ROAD_SET, ROAD_CAMS). Created by WP1b (block-out); owned by WP3 (this state).
// A rammed-earth wall with a small wooden gate at the left (no lantern), a path leaving to the right over a low ridge;
// an orange sky low at the LEFT (west), deep violet at the top right with a pale moon. The servant runs to the RIGHT
// (toward Zhao).
//
// WP3 CORRECTIONS to BIBLE 3-4 (measured headless, WP3 scratch qa.ts; BIBLE keeps the old numbers):
//   ROAD.servant x 80.05 -> 80.00: he stood at 74/40 in roadGate (BIBLE 70/40); now 70.5/40, 0.55 m from the envoy
//   the gate x 78.95 -> 78.45: at BIBLE's x the 1 m gate filled the left 40 % of roadGate (the frame is 1.8 m wide at
//     the wall) and its hood reached over the envoy's head; the wall showed only as a 1 cm sliver. Now its right leaf
//     and post stand at the left edge (0-19 %, the centre at -15 %), the rammed-earth wall behind the envoy (19-47 %)
//   roadFar look y 1.30 -> 0.57: the ridge path was at 55 % y (BIBLE 46 %); now 46 %, the servant 31-46 % y
//   roadFar pos and look x 80.50 -> 81.50 (and ROAD.ridgeFrom / ridgeTo +1.0 x with it): from x 80.5 the guesthouse
//     wall (24 m in front of the lens, x <= 79.67 with its coping) filled the left 21 % of the frame from 22 % to 67 %
//     y, over the setting sun and the start of the run; now the frame's left edge passes 0.29 m clear of it
//   the sun and the moon are placed FROM roadFar's frame (ROAD_SET.sun / moon: screen points of that camera), so they
//   are where BIBLE puts them whatever the lens; the sun shows only to the far camera (sets/road.ts view(): in
//   roadGate it would stand between the two heads, brighter than the jade)
import * as THREE from "three";
import type { Cam } from "../layout";

type Vec3 = [number, number, number];
/** the island's x */
export const RX = 80;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });

// ------------------------------------------------------------------------------------------------- the set's numbers
export const ROAD_SET = {
  /** the guesthouse wall (rammed earth, 夯土) along z (its front face), from x0 to x1; height, thickness; the tiled
   *  coping on top (overhang each side, height) */
  wall: { z: -2.0, x0: 76.0, x1: 79.6, h: 2.3, t: 0.4, cap: { over: 0.07, h: 0.15 } },
  /** the small wooden gate in the wall: centre x, width, height; its posts and lintel (`post` m square, 2 cm proud of
   *  the wall); a little tiled hood over it (`hood`: width, how far it reaches out, its ridge height). No lantern. Both
   *  leaves shut: the envoy comes in from the left frame edge, not through the gate (BIBLE 9.5b) */
  gate: { x: 78.45, w: 1.0, h: 1.9, post: 0.14, hood: { w: 1.7, out: 0.42, y: 2.24, ridge: 2.62 } },
  /** the path (painted on the ground): from the gate past the figures' feet, out of roadGate's right edge, on toward
   *  the ridge; w = its width */
  path: { pts: [V(78.45, 0, -1.95), V(79.2, 0, -1.4), V(80.4, 0, -1.3), V(82.0, 0, -1.9), V(83.8, 0, -3.6), V(85.2, 0, -6.5), V(86.2, 0, -9.6), V(86.6, 0, -11.0)], w: 0.9 },
  /** the painted ground: a square of `size` m round (cx, cz) (its edge colour runs on); the ground mesh ends at z
   *  `zFar` (in front of the hills card, so no far ground shows over the ridge) */
  ground: { cx: 80.5, cz: -6.0, size: 28, zFar: -58 },
  /** the low ridge of the long shot: a long mound (x mx0..mx1, outside both frames) with a flat top at y from zTop0 to
   *  zTop1, its path along z (y 0.9, x 74..88 in BIBLE); front foot zFoot0, back foot zFoot1 */
  ridge: { z: -14.0, y: 0.9, x0: 74.0, x1: 88.0, mx0: 60, mx1: 100, zTop0: -13.4, zTop1: -14.6, zFoot0: -9.4, zFoot1: -19.5, pathW: 0.8 },
  /** painted far hills (violet, blue) on a card at this z, x0..x1, y0..y1 (low: their tops 1.4-2.4 deg above the ridge
   *  line in roadFar, under the moon); `dip` = the hills sink to a plain round this x (the setting sun sits there) */
  hills: { z: -60, x0: 50, x1: 110, y0: -2, y1: 8 },
  /** the high-resolution sky card behind everything the two cameras see (the dome behind it for the whip pans): at z,
   *  x0..x1, y0..y1; painted in angle space from (RX, eye, 0) */
  skyCard: { z: -400, x0: RX - 130, x1: RX + 90, y0: -20, y1: 110, eye: 1.4 },
  /** the sky by elevation (degrees): orange at the horizon, rose, mauve, deep violet by 6 deg (roadFar's frame top is
   *  at about 5 deg, roadGate's at 12) */
  sky: [[-6, "#d9906a"], [-1, "#f2a05a"], [0.4, "#f4a862"], [1.4, "#eea27a"], [2.4, "#d98e8c"], [3.4, "#b67f9c"], [4.6, "#8f6c9f"], [6.2, "#6c5893"], [9, "#544884"], [14, "#433a74"], [30, "#332d63"], [90, "#272457"]] as [number, string][],
  /** THE SUN, setting at the left horizon of roadFar: its centre at the screen point (sx, sy) of roadFar, radius
   *  `deg`, `dist` m out; only cameras farther than `farZ` south see it (sets/road.ts view) */
  sun: { sx: 0.06, sy: 0.44, deg: 0.5, dist: 300, farZ: 10 },
  /** THE MOON: pale, at the screen point (sx, sy) of roadFar (BIBLE 80/18), `deg` across, `dist` m out (both cameras) */
  moon: { sx: 0.80, sy: 0.18, deg: 1.0, dist: 320 },
};

// ------------------------------------------------------------------------------------------------- the marks
export const ROAD = {
  /** WP3: x 78.95 -> 78.45 (see the top) */ gate: V(78.45, 0, -2.0),
  /** the envoy comes in from outside the left edge to `envoy` */ envoyFrom: V(78.60, 0, -0.90), envoy: V(79.45, 0, -1.00),
  /** WP3: x 80.05 -> 80.00 (see the top) */ servant: V(80.00, 0, -1.10),
  /** the servant's run on the ridge (16b): left to right along the ridge path at its height; both ends are outside
   *  roadFar (-4 % / 104 %); BIBLE's run 20 % -> 85 % is x 80.1 -> 83.1. WP3: both +1.0 x with the camera */
  ridgeFrom: V(79.0, 0.9, -14.0), ridgeTo: V(84.0, 0.9, -14.0),
};

// ------------------------------------------------------------------------------------------------- the cameras
/** "Measured" = head centre x / y % and head width % of the frame, measured headless (WP3 scratch qa.ts, the block-out
 *  staging of shots/common blockOut on the shot's first frame) */
export const ROAD_CAMS = {
  /** 16a. Gate 12 % x; envoy at ROAD.envoy 32/40, 32 % (from envoyFrom at -27 %: in from the left edge); servant
   *  70/40, 31 %; sky in the top 35 %.
   *  Measured: gate at the left edge (right leaf and post 0-19 % x, centre -15 %: WP3 moved it, see the top); envoy 33/40, 32 %; envoyFrom -27 %; servant 70.5/40, 31.5 %
   *  (his robe to 84 % x below y 47 %: clear of the rail); the wall's end 47-49 % x; the far horizon 35 % y, the
   *  ridge line 39 %; the moon 77/28 (under the servant's tag, which sits about 70/23) */
  roadGate: c([79.95, 1.35, 3.00], [79.70, 0.94, -1.19], 36),
  /** 16b. The ridge path across the frame at 46 % y; the servant 10 % wide running left to right; the sun at the left
   *  horizon, the moon 80/18.
   *  Measured: path 46 % y; the servant (rough) 10 % wide, head 31 % y, feet 46 %; the run 20 % -> 85 % = x 80.1 ->
   *  83.1; the sun's disc at 6/44, 147 px, setting into the ridge; the moon 80/18, 148 px; the wall and the gate
   *  outside the left edge */
  roadFar: c([81.50, 1.60, 22.0], [81.50, 0.57, -14.0], 13),
};
