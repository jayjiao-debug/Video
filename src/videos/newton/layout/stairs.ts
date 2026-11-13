// THE STAIRS (place "stairs", island x 100): the top of a dark oak staircase in Trinity, a small landing and NEWTON's
// panelled door, 5 a.m. in May with the sun well up (PLAN 1, 7A). NUMBERS ONLY (sets/stairs.ts builds from them, the
// shots pose from them). Owner: WP2.
// The camera comes UP the flight looking -z (the flight runs down toward +z behind her); the landing is y 0 (every
// figure stands on y 0 there). HIS DOOR is in the RIGHT wall (x = STX + door.x, its face looking -x onto the landing)
// and opens INWARD into his room (+x) on hinges at its FAR edge (z0), so the gap opens on the near side. The leaded
// stair window is in the BACK wall (straight ahead up the flight): the low morning sun comes through it from the
// back left and lays a slanting slab of light, cut by the leading, across the door. Behind the door: a dim corner of
// his room lit only by his candle (the set's point light = the glow under the door).
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const STX = ISLAND.stairs;
const RISE = 0.18, GO = 0.28, Z1 = 0.5;
/** the tread centre of step k (1 = the first step down from the landing; its top at y -k * rise) */
const step = (k: number, x = -0.15) => V(STX + x, -k * RISE, Z1 + GO * (k - 0.5));
export const STAIRS_SET = {
  /** the stairwell between its side walls (x offsets from STX) and the landing (z: back wall .. stair head) */ well: { x0: -0.95, x1: 0.75 }, landing: { z0: -1.1, z1: Z1 },
  /** the ceiling over landing and flight */ ceil: 2.75,
  /** the flight down toward +z: rise, going, number of steps drawn (the lowest at y -n * rise), the nosing */ steps: { rise: RISE, go: GO, n: 11, nose: 0.025 },
  /** the walls' thickness (the door's and the window's reveals) */ wall: 0.3, backWall: 0.42,
  /** the oak dado on the stairwell walls (its top over the landing; it follows the flight down at the same height) */ dado: 0.95,
  /** HIS DOOR in the right wall: z0 = the hinge (far) edge, z1 = the near edge, its height; it opens inward (+x) to
   *  `swing` radians at door 1 */ door: { x: 0.75, z0: -0.98, z1: -0.08, h: 2.02, t: 0.055, swing: 1.75 },
  /** the architrave round the door on the landing side: its width, how far it stands proud */ arch: { w: 0.12, d: 0.035 },
  /** THE STAIR WINDOW in the back wall: x offsets, sill and head, two lights (one mullion), the glass this far behind
   *  the wall's face */ window: { x0: -0.62, x1: 0.18, y0: 0.95, y1: 2.32, lights: 2, inset: 0.16 },
  /** the sun (direction TOWARD it: low from the back left; about 21 deg up): the slab falls on the door */ sun: [-0.75, 0.36, -0.55] as [number, number, number],
  /** the room behind his door (only seen through the doorway): x offsets from the wall plane's far side, z, height */ room: { x1: 3.4, z0: -2.5, z1: 1.0, h: 2.75 },
  /** the candle glow behind the door (his candle's light leaking under it): the point light's place (x offset, y, z) */ glow: { x: 1.15, y: 0.28, z: -0.53, dist: 2.6 },
  /** the handrail on the left wall: its height over the nosings, its offset from the wall */ rail: { h: 0.86, off: 0.07, r: 0.03 },
};
const D = STAIRS_SET.door, DZ = (D.z0 + D.z1) / 2;
export const STAIRS = {
  /** the doorway's middle on the floor, in the wall plane */ door: V(STX + D.x, 0, DZ),
  /** where NEWTON stands IN the doorway (on the threshold, facing the landing: facing -PI/2) */ doorway: V(STX + D.x + 0.18, 0, DZ), doorwayFacing: -Math.PI / 2,
  /** just inside his room (where he steps back to shut the door) */ inside: V(STX + D.x + 0.75, 0, DZ),
  /** the hinge axis at the floor (the leaf turns about it) and the leaf's width */ hinge: V(STX + D.x + 0.035, 0, D.z0 + 0.01), leafW: D.z1 - D.z0,
  /** the point on the door's face where the mic raps (near the free edge, at her hand's height) */ knock: V(STX + D.x - 0.03, 1.22, D.z1 - 0.22),
  /** under the door: where the glow shows on the sill */ sill: V(STX + D.x - 0.01, 0.006, DZ),
  /** the middle of the landing */ landing: V(STX - 0.15, 0, -0.35),
  /** where HUMPHREY stops on the landing after shutting the door, looking at her (by the window, facing about +z) */ humphrey: V(STX - 0.5, 0, -0.78), humphreyFacing: 0.3,
  /** the top of the flight (the landing's front edge, the middle of the stairs) */ stairHead: V(STX - 0.15, 0, Z1 - 0.05),
  /** the tread centre of step k (k = 1 .. n; top at y -k * rise): Humphrey goes down these */ step,
  /** where her run starts (A01: two steps down) and where it ends on the landing (her floor points) */ runFrom: step(2, -0.2), runTo: V(STX - 0.5, 0, -0.3),
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197); };
/** NAMED CAMERAS (her eyes, EYE over her floor) */
export const STAIRS_CAMS: Record<"run" | "top" | "door" | "down" | "low", Cam> = {
  /** A01 start: two steps down, running up, the door ahead and to the right in its slab of sun */
  run: eyeCam(STX - 0.2, Z1 + GO * 1.5, [STX + D.x + 0.18, third(STX - 0.2, Z1 + GO * 1.5, STX + D.x + 0.18, DZ, EYE - 2 * RISE), DZ], undefined, -2 * RISE),
  /** A01 end: at the head of the flight by the rail, NEWTON in the doorway about 2 m away, a little to one side (his
   *  eyes in the upper third) */
  top: eyeCam(STX - 0.8, 0.3, [STX + D.x + 0.18, third(STX - 0.8, 0.3, STX + D.x + 0.18, DZ), DZ]),
  /** A02: square on to the shut door (the title block lands on it) */
  door: eyeCam(STX - 0.72, DZ, [STX + D.x, 1.15, DZ]),
  /** A05: from the door, looking down the flight (HUMPHREY goes down for ink) */
  down: eyeCam(STX + 0.35, -0.75, [STX - 0.2, -0.5, 2.6]),
  /** a low look up the flight from six steps down: the stair window, the door, the slab of sun */
  low: eyeCam(STX - 0.15, Z1 + GO * 5.5, [STX + 0.25, 1.05, -0.8], undefined, -6 * RISE),
};
/** the stand-in staging: NEWTON in his doorway, HUMPHREY on the landing, her eyes at the top of the flight */
export const STAIRS_STAND: Stand = { cam: STAIRS_CAMS.top, newton: STAIRS.doorway, facing: STAIRS.doorwayFacing, humphrey: STAIRS.humphrey, humphreyFacing: STAIRS.humphreyFacing };
