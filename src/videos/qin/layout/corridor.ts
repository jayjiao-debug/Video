// THE CORRIDOR (place "corridor", island x 100): the covered palace walkway at dawn (PLAN 1): red pillars every 2.4 m,
// lattice walls, hanging lanterns, IDENTICAL bays (the joke: every corridor looks the same), a T-junction. NUMBERS ONLY
// (sets/corridor.ts builds from them, the shots pose from them). Owner: the sets lane (WP2).
// The walkway runs along -z from the camera's start; x = CX is its middle. WEST (x < CX, screen left looking -z) is
// the lattice wall with the T-junction; EAST (screen right) is an open colonnade with a bench rail, the low dawn sun
// comes in from there (from the east, a little ahead) and lays the pillars' shadows across the floor, bay after bay.
// The walkway floor is y 0; the courtyard beyond the east colonnade lies 0.36 m lower.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

/** the island's x */
export const CX = ISLAND.corridor;
/** the bay length and the first pillar's z: pillar k (both sides) stands at z = BAY0 - k * BAY */
const BAY = 2.4, BAY0 = 3.6, JK = 10;
const pz = (k: number) => BAY0 - k * BAY;
export const CORRIDOR_SET = {
  /** the walkway's floor (stone): west wall face to the east curb */ floor: { x0: CX - 1.75, x1: CX + 1.62, z0: pz(24) - 0.6, z1: 7.5 },
  /** a bay is this long along z; pillar k stands at z = bay0 - k * bay */ bay: BAY, bay0: BAY0, bays: 24,
  /** the pillars on both sides: x offset from CX, diameter, height (the lintels sit on them) */ pillar: { x: 1.35, d: 0.34, h: 3.1 },
  /** the west lattice wall: its inner face's x offset (CX - x), height (to the ceiling) */ wall: { x: 1.75, h: 3.5 },
  /** the beams' underside (the cross beams run 3.1 .. 3.5, the ceiling is at 3.5) */ roof: 3.1, ceil: 3.5,
  /** the east eave: the soffit slopes from the ceiling at the pillar line + 0.2 down to y at x offset `x` */ eave: { x: 2.4, y: 3.12 },
  /** the east bench rail between the pillars (坐凳栏杆): its top, its depth (centred on the pillar line) */ bench: { top: 0.5, d: 0.34 },
  /** the courtyard east of the colonnade: its level, its far wall's x offset and height */ court: { y: -0.36, wallX: 15, wallH: 3.4 },
  /** the T-junction: the west wall is open between pillar k and k + 1 (z0 > z1); the side corridor runs off to -x,
   *  `len` m long, as wide as the opening */ junction: { k: JK, z0: pz(JK) - 0.17, z1: pz(JK + 1) + 0.17, len: 10 },
  /** the lanterns hang in every `every`-th bay (bay middles), this far out from the middle, their tops at y */ lantern: { x: 0.95, y: 2.78, h: 0.44, every: 2 },
  /** the far end wall (a lattice door) */ end: pz(24) - 0.6,
};
const J = CORRIDOR_SET.junction;
export const CORRIDOR = {
  /** where her creep starts */ start: V(CX, 0, 4.2),
  /** the pillar she stops behind (A02): its centre */ peekPillar: V(CX - 1.35, 0, pz(2)),
  /** where she stands behind it, peeking past its right side (the pillar's edge in the left foreground) */ hide: V(CX - 1.12, 0, pz(2) + 0.62),
  /** where he stands, 6 m ahead of the pillar, stretching (A02 on) */ emperor: V(CX, 0, -6.6),
  /** where he walks off to (A13): on down the walkway */ walkOff: V(CX + 0.1, 0, -16),
  /** the T-junction: the middle of its opening on the walkway, and the side corridor's far end */ junction: V(CX - 0.6, 0, (J.z0 + J.z1) / 2), sideEnd: V(CX - 1.75 - J.len + 0.8, 0, (J.z0 + J.z1) / 2),
  /** the pillar z of bay k (pillar k) */ pillarZ: pz,
};
/** NAMED CAMERAS (her eyes, 1.55 m) */
export const CORRIDOR_CAMS: Record<"creep" | "peek" | "follow" | "junction", Cam> = {
  /** A01: creeping down the walkway from the start, the corridor running to its vanishing point */
  creep: eyeCam(CX + 0.2, 4.2, [CX, 1.35, -10]),
  /** A02: behind the peek pillar (its edge in the left foreground), looking at him 6 m ahead */
  peek: eyeCam(CX - 1.12, pz(2) + 0.62, [CX + 0.3, 1.3, -6.6]),
  /** A13: scrambling after him down the walkway */
  follow: eyeCam(CX + 0.15, -8.5, [CX, 1.3, -20]),
  /** at the T-junction, looking into the side corridor (it looks just the same) */
  junction: eyeCam(CX + 0.4, (J.z0 + J.z1) / 2 + 0.3, [CX - 9, 1.35, (J.z0 + J.z1) / 2]),
};
/** the stand-in staging: the EMPEROR ahead down the walkway, her eyes at the start */
export const CORRIDOR_STAND: Stand = { cam: eyeCam(CX + 0.25, 0.6, [CX, 1.3, -6.6]), emperor: V(CX, 0, -3.8), facing: 0 };
