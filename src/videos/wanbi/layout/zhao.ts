// THE ZHAO COURT 赵廷 (place "zhao", island x 40): BIBLE section 3 (marks, the set's numbers) and section 4 (the six
// Zhao cameras). NUMBERS ONLY: sets/zhao.ts builds from this file and the shots pose from it. Re-exported by layout.ts
// (ZHAO, ZHAO_SET, ZHAO_CAMS). Created by WP1b (block-out); owned by WP3 (this state).
// PALE: cream plaster walls, pale wood floor, TEAL hangings, a teal-and-gold screen behind the king's 榻, a lattice
// window (直棂窗) right of the dais, daylight from the east (screen right). The king sits centre-left; the envoy and
// the eunuch come in from the right (the east door).
//
// WP3 CORRECTIONS to BIBLE 3 (measured headless on the block-out staging, WP3 scratch qa.ts; BIBLE keeps the old numbers):
//   minA (41.55, 0, -3.15) -> (41.50, 0, -3.30), minB (42.05, 0, -2.75) -> (41.95, 0, -3.55): in zhaoWide minB's robe
//     reached 93 % x below y 47 % (the app rail starts at 86 %); now 85.6 %. The camera stays as BIBLE (the other 5a holds
//     do not move); minB's head moves 85/36 -> 78/35, minA's 68/36 -> 66/36 (both under the window, as designed)
//   23b: kingStand x 39.80 -> 39.75, kneel x 40.35 -> 40.30, capPass x 40.08 -> 40.03 (all three by the same -0.05,
//     so the cap's reach is unchanged), jadeStand x 40.70 -> 40.76: in zhaoCrown the kneeling envoy's robe covered the
//     left 30 % of the jade disc (disc 55.8-64.8 % x, his silhouette to 58.5 %). Now the disc is at 57.9-66.9 %, the
//     envoy's silhouette at the disc's height ends at 56.3 % kneeling / 53.1 % risen, the eunuch's starts at 67.9 %
//   wallH 3.4 -> 3.9: the top of the back wall showed at 1.5 % (zhaoWide) and 0.7 % (zhaoCrown) of the frame height
//   the two hangings (x 38.2 / 42.85, outside every frame but zhaoWide's right edge) -> a teal VALANCE along the top of
//     the back wall and two tied-back teal DRAPES either side of the window (seen in zhaoWide, zhaoPush, zhaoLin,
//     zhaoCrown)
//
// WP7 FIX ROUND (the director's 5a note: "a stack of four heads"; measured headless, WP7 scratch crowd.ts / camsearch.ts):
//   zhaoWide pos y 1.85 -> 2.65 (look unchanged): from 1.85 the walkers' heads and the ministers' sat at the same
//     height on screen (37 % / 36 %) wherever the pair stopped (best stop: 37 px of head over head); from 2.65 depth
//     becomes height. The king stays 22/36, 13 %; the window 58-77 % x, 20-31 % y; the valance in the top 6 %
//   minA (41.50, -3.30) -> (41.46, -4.00), minB (41.95, -3.55) -> (42.06, -4.50): upstage, toward the window, so their
//     heads sit a row above the walkers' (62/33 and 77/32, 13 %; 20 px apart, where they overlapped by 20 px); minA's
//     robe 4 cm clear of the dais's east end (x 41.2); minB's robe ends at 84 % x (rail at 86 %)
//   linFrom / linStop / miaoFrom move downstage to the lane z -1.20 (the walkers' heads 101 px under the ministers'
//     chins, so the walk never crosses a face) and the eunuch stops beside him (miaoWait, +0.58 x); 5b starts the
//     envoy at linStep and the eunuch already on miao (the cut cheats them 0.75 m upstage: the ministers are not in
//     5b): the eunuch's head clears the right edge from 407 (was 20 % out while he walked to his mark)
import * as THREE from "three";
import type { Cam, TaSeat } from "../layout";

type Vec3 = [number, number, number];
/** the island's x */
export const ZX = 40;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });

// ------------------------------------------------------------------------------------------------- the set's numbers
/** what sets/zhao.ts builds. x0..x1 / z0..z1 = extents, top = the top face's height. The north wall's FRONT face is
 *  floor.z0 (it is `wall.thick` deep behind it); the east and west walls stand at floor.x1 / floor.x0 */
export const ZHAO_SET = {
  floor: { x0: 37.0, x1: 43.4, z0: -5.0, z1: 3.0 },
  /** wall height (the back wall's top is outside zhaoWide and zhaoCrown at 3.9) */ wallH: 3.9,
  /** the painted plaster: a pale wood dado to `dado` m with a moulding line, a timber beam band from `beam` m to the top */
  wall: { thick: 0.2, dado: 0.48, beam: 3.38 },
  /** the floor's boards (painted, running along z toward the camera): `w` m wide, butt joints every len[0]..len[1] m */
  boards: { w: 0.24, len: [1.4, 2.6] as [number, number] },
  /** a woven mat (席) painted INTO the floor in front of the dais (one level, no geometry): cream with a teal border
   *  `border` m wide and a gold line; the envoy walks onto it in 5a, kneels on it in 23b */
  rug: { x0: 39.2, x1: 41.85, z0: -3.3, z1: -0.9, border: 0.14 },
  dais: { x0: 38.8, x1: 41.2, z0: -4.4, z1: -3.4, top: 0.20 },
  /** the king's 榻: teal lacquer (lighter than his deep-teal robe) with a gold edge */ ta: { x0: 39.45, x1: 40.55, z0: -4.35, z1: -3.48, top: 0.30 },
  /** the cushion on it (mesh "zhao.pad": the clearance checker's sitter's cushion) */ cushion: { x: 40.0, z: -4.03, w: 0.62, d: 0.56, top: 0.40 },
  /** the teal-and-gold screen behind the 榻, standing on the floor just behind the dais: the silk panel's face at z,
   *  x0..x1 (its teal frame inside that), up to h; `foot` = the two feet's depth (z) */
  screen: { x0: 38.9, x1: 41.1, z: -4.55, h: 2.3, frame: 0.07, foot: 0.32 },
  /** the lattice window on the back wall, right of the dais (outside zhaoThrone and zhaoKing; behind the ministers in
   *  zhaoWide; top right in zhaoCrown): the opening; its frame is `frame` m wide round it */
  window: { x0: 41.35, x1: 42.15, y0: 1.2, y1: 2.0, z: -4.95, frame: 0.08, bars: 9 },
  /** the teal valance along the top of the back wall (y0..y1, the whole width) and the two tied-back drapes either
   *  side of the window (x0..x1 at the bottom, from the valance down to `bottom`, gathered at the tie `tie`) */
  valance: { y0: 2.95, y1: 3.35 },
  drapes: [{ x0: 41.13, x1: 41.37 }, { x0: 42.13, x1: 42.37 }], drapeBottom: 0.85, drapeTie: 1.45,
  /** the east door (the envoy's entrance) and the west door (toward Qin): x of the wall, centre z, w, h. Neither is in
   *  any Zhao frame (the side walls are outside them all) */
  doorE: { x: 43.4, z: -2.0, w: 1.3, h: 2.5 }, doorW: { x: 37.0, z: -1.8, w: 1.3, h: 2.5 },
};

/** the Zhao king's seat on his 榻: seated head about (40, 1.05, -4.00) */
const SEAT: TaSeat = { top: V(40.00, 0.40, -4.05), floor: 0.30, back: 0.03, facing: 0 };

// ------------------------------------------------------------------------------------------------- the marks
export const ZHAO = {
  seat: SEAT,
  /** about where the seated king's head is */ kingHead: V(40.0, 1.05, -4.00),
  /** the jade in the seated king's two hands (pair grip: hands at +-0.12 on the rim) */ jade: V(40.00, 0.80, -3.72),
  /** the Zhao ministers, facing minFacing (toward the king); WP3 moved both back (see the top) */
  minA: V(41.46, 0, -4.00), minB: V(42.06, 0, -4.50), minFacing: -0.9,
  // ---- line 5: 5a, the envoy from linFrom to linStop (363-404, 1.24 m/s), the eunuch beside him from miaoFrom to
  //      miaoWait (WP7: on the downstage lane z -1.20, see the top); 5b, the envoy steps from linStep to lin
  //      (407-411), the eunuch stands on miao (0.54 m from linStep)
  linFrom: V(42.45, 0, -1.20), linStop: V(40.75, 0, -1.20), lin: V(40.65, 0, -1.95),
  miaoFrom: V(43.03, 0, -1.20), miaoWait: V(41.33, 0, -1.20),
  linStep: V(40.85, 0, -1.95), miao: V(41.30, 0, -2.25),
  // ---- line 23: the king has stepped down, facing east; the envoy kneels facing west (sink 0.38); the cap passes at
  //      capPass (reach 0.34-0.37 m from both); the eunuch; the jade upright on its stand on the dais (disc centre y
  //      0.20 + props JADE_STAND.disc = 0.77). WP3 moved the first three by -0.05 x and the stand by +0.06 x (see the top)
  kingStand: V(39.75, 0, -2.65), kingStandFacing: Math.PI / 2,
  kneel: V(40.30, 0, -2.60), kneelFacing: -Math.PI / 2,
  capPass: V(40.03, 0.97, -2.62), miao23: V(41.00, 0, -2.45),
  jadeStand: V(40.76, 0.20, -3.75),
};

// ------------------------------------------------------------------------------------------------- the cameras
/** BIBLE section 4, unchanged by WP3. "Measured" = head centre x / y % and head width % of the frame, measured headless
 *  (WP3 scratch qa.ts: the block-out staging of shots/common blockOut on the shot's first frame, the WP3 marks); every
 *  hold is within 3 % of BIBLE 4 unless a note says why. */
export const ZHAO_CAMS = {
  /** 3 (start), 23a. King seated 50/37, 34 %; the jade 50/48, 20 %; window outside.
   *  Measured: king 51/37, 34 %; jade 50/48 (disc 40-60 % x, in front of his robe, the celadon screen behind his
   *  head); the screen fills the background edge to edge (its frame is outside), dais front edge 77 % y */
  zhaoThrone: c([40.00, 0.98, 0.05], [40.00, 0.75, -3.72], 34),
  /** 3 (the end of the move 233-247). King 62/31, 33 %; jade 63/42; the left 45 % free for the graphic layer.
   *  Measured: king 62/30, 32 %; jade 63/42; the screen's left frame just outside the left edge */
  zhaoKing: c([39.75, 1.10, -0.05], [39.83, 0.56, -4.00], 36),
  /** 5a. King 22/37, 13 %; minA 68/36, minB 85/36; lin 40/38, 17 %; miao 63/37; linFrom 114 %; window 68/28.
   *  WP7 fix round: raised 1.85 -> 2.65 (see the top). Measured: king 22/36, 13 %; minA 62/33, minB 77/32, 13 %
   *  (minB's robe to 84 % x); at the stop lin 42/44, 19 %; miao 65/44, 19 % (two rows: no head over a head);
   *  window 58-77 % x, 20-31 % y; the valance in the top 6 %; the back wall's top outside */
  zhaoWide: c([40.70, 2.65, 4.40], [40.95, 0.55, -2.50], 42),
  /** 5b. Envoy at lin 42/34, 28 %; eunuch at miao 76/33, 25 %; king 12/35, 18 %.
   *  Measured: envoy 42/34, 28 %; eunuch 76/33, 25 % (his robe reaches 90 % x below y 47 %, as BIBLE's 76 % implies:
   *  robe only, the head and the tag stay clear); king 11/34, 18 %; window 59-85 % x, 15-30 % y */
  zhaoPush: c([40.40, 1.50, 2.00], [40.80, 0.70, -2.10], 42),
  /** 6. 5b's axis, 1.7x: envoy 42/34, 47 % (head x kept); jade at the chest 44/49, at the chin 44/43. Placed: envoy only.
   *  Measured: envoy 43/34, 47 %; jade at the chest 46/50 (shots/common CHEST); window 65-98 % x, 9-29 % y (under the
   *  chip and the 完璧归赵 stamp: the red seal lands on the pale window), the right drape at its right edge */
  zhaoLin: c([40.50, 1.38, 0.37], [40.90, 0.58, -3.73], 42),
  /** 23b. King standing 24/42, 20.5 %; envoy kneeling 48/51, 20.5 % (risen 48/42); eunuch at miao23 77/42, 21 %;
   *  capPass 36/48; the jade on its stand 60/49; window 78-90 % top right.
   *  Measured: king 22/41, 20.5 %; envoy kneeling 46/52, 20.5 % (risen 46/43); eunuch 78/42, 21 % (robe to 90 % x below
   *  y 47 %, as BIBLE's 77 % implies); capPass 34/48; the jade 62/49 on its stand (62/60), disc 58-67 % x, clear of both
   *  neighbours; window 78-100 % x, 26-39 % y; the valance in the top 8 %; the screen's top-left corner 1/20 */
  zhaoCrown: c([40.35, 1.55, 2.40], [40.40, 0.85, -2.80], 44),
};
