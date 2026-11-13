// THE MUSEUM (place "museum", island x 600): today: pit no. 1 of the terracotta army under its hall roof, dim museum
// light, a railing in the foreground (PLAN 1, 7G). NUMBERS ONLY. Owner: WP2.
// The pit's floor is y 0 (the figures stand on it, as on every floor of the film); the visitors' walkway is RAISED
// (walk.top) and the camera stands on it: her eyes at walk.top + EYE, looking down over the railing into the pit.
// The pit runs along -z: earthen partition walls (隔墙) divide it into corridors (过洞); the middle corridor holds THE
// GRID (4 files x 6 ranks of marks for rig figures, added by the segments); behind the grid and in the side corridors
// the set's own clay statues carry the rows on into the dark.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

export const MX = ISLAND.museum;
const WALK = 2.2;
/** the grid of marks: files across x, ranks along -z */
const FILES = [-1.2, -0.4, 0.4, 1.2], RANK0 = -1.0, DRANK = 1.3, RANKS = 6;
export const MUSEUM_SET = {
  /** the pit floor */ pit: { x0: MX - 11, x1: MX + 11, z0: -30, z1: 2.2 },
  /** the raised walkway the camera stands on: x / z extents and its top */ walk: { x0: MX - 11, x1: MX + 11, z0: 2.2, z1: 8, top: WALK },
  /** the railing along the walkway's front edge: its z, its top above the walkway, post spacing */ rail: { z: 2.45, h: 1.0, post: 1.6 },
  /** the earthen partition walls: their x offsets from MX, width, height, from z0 (far) to z1 (near) */ walls: { x: [-6.35, -2.25, 2.25, 6.35], w: 0.7, h: 1.6, z0: -28, z1: -0.2 },
  /** the corridors between the walls (their middle x offsets): the middle one holds the grid */ corridors: [-4.3, 0, 4.3],
  /** the grid of rig-figure marks (files, the first rank's z, the rank spacing, the number of ranks) and the set's
   *  own statues carrying the rows on (from rank `RANKS` to `statueRanks`; files in the side corridors) */ rows: { files: FILES, z0: RANK0, dz: DRANK, ranks: RANKS, statueRanks: 18 },
  /** the hall roof over the pit: its springing height, its crown (a shallow arch along x), skylight strips */ roof: { y0: 9, y1: 13, span: 24 },
  /** the far end wall of the pit (earth), and the back wall of the hall above it */ end: -30,
};
/** THE GRID: mark (file f 0..3, rank r 0..5) of the 4 x 6 rig figures, facing +z (toward the camera) */
export const museumMark = (f: number, r: number) => V(MX + FILES[f], 0, RANK0 - r * DRANK);
export const MUSEUM = {
  /** the walkway's top: the camera's floor */ walkTop: WALK,
  /** the 24 marks of the grid, rank by rank (front rank first), file by file (left to right) */ grid: Array.from({ length: RANKS * 4 }, (_, i) => museumMark(i % 4, Math.floor(i / 4))),
  /** the way the warriors face */ facing: 0,
  /** 大哥 in clay hides once among them: small, at the edge (the left file, third rank, a third of a step out toward
   *  the wall: 0.08 m between his robe and the wall's face) */ dage: V(MX - 1.5, 0, RANK0 - 2 * DRANK - 0.35),
};
/** NAMED CAMERAS (her eyes 1.55 m over the walkway) */
export const MUSEUM_CAMS: Record<"rail" | "rows" | "wide", Cam> = {
  /** G07: at the railing (0.6 m behind it: the rail in the lower third), looking down the rows (the first perfectly
   *  still frame) */
  rail: eyeCam(MX + 0.3, 3.05, [MX, 0.8, -5], 64, WALK),
  /** closer to the rail (0.5 m: the rail low in the frame, under the front ranks' feet), the front ranks' faces */
  rows: eyeCam(MX + 0.15, 2.95, [MX, 0.9, -3.0], 64, WALK),
  /** further back, the railing (glass panels: the pit shows through) and the walkway in the foreground, the hall's roof */
  wide: eyeCam(MX - 0.6, 6.6, [MX, 1.4, -8], 64, WALK),
};
export const MUSEUM_STAND: Stand = { cam: eyeCam(MX + 0.3, 4.6, [MX, 0.9, -4], 64, WALK), emperor: V(MX, 0, -2.0), facing: 0 };
