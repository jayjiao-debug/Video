// THE MARKET (place "market", island x 0): 惠州's morning market street (PLAN 1, 8A). NUMBERS ONLY (sets/market.ts
// builds from them, the shots pose from them). Owner WP2a (the names are WP1's: keep them).
//
// THE PLAN (seen from above, +z toward the walking camera):
//   - LANE A runs along z (x -2.6..2.6): she walks down it toward -z (start -> stop). Shops with stalls line both
//     sides (counters at x +-2.7, shop fronts at +-3.55, awnings over the counters).
//   - At z -4.0 lane A ends in a T: LANE B turns off to the LEFT (-x) between z -4.0 and z -0.4.
//   - THE BUTCHER'S STALL closes the T, facing her (+z): its counter (x -1.2..2.4, front z -3.05), the shop behind
//     it, the awning on two poles, THE HOOK RACK across its left front (a bar at 2.15 m from the left awning pole to a
//     post; ONE stylised lamb carcass on a hook, left of where SU stands), the chopping block in front of the counter
//     (WP3's prop on MARKET.block) with the butcher between block and counter. SU stands in front of the block, a
//     little to its left, facing her: in her stall framing the carcass hangs at his right (screen left), the block
//     and the butcher at his left (screen right), the counter and the shop front behind him.
//   - The BANYAN stands on a little square at the inner corner of the T (x -4.6, z 1.2): a stone ring round its trunk,
//     its crown over the junction. Low tiled roofs behind every row, the town's far roofs and hills painted.
//   - The morning sun is low and warm from the east (+x) and a little from her side (+z): the butcher's front and the
//     left row are lit, the right row is in its own shade, long shadows run back to the left.
// Every mark stands clear of the set (the rig figure is about 0.5 m across; SU 1.06 with a belly about 0.6 m).
import { ISLAND, V, c, eyeCam, frontCam, type Stand, type Cam, type Path } from "./base";

/** the island's x */
export const MX = ISLAND.market;
export const MARKET_SET = {
  /** the ground (packed earth) */ ground: { x0: MX - 40, x1: MX + 40, z0: -50, z1: 25 },
  /** LANE A (her walk) between the stall rows, from the T at z0 to z1 */ lane: { x0: MX - 2.6, x1: MX + 2.6, z0: -4.0, z1: 18 },
  /** LANE B: off to the left (-x) from the T, between z0 (the butcher row's counters) and z1 */ laneB: { x0: MX - 30, z0: -4.0, z1: -0.4 },
  /** lane A's stall rows: the counters' lane-side x offset from MX (each side), a shop unit's length along z, the counter's
   *  depth, its top, the awning's front edge height; the units' middles at z (both sides); the shop fronts stand at
   *  x +-(x + front) */ stalls: { x: 2.7, len: 3.4, d: 0.6, counter: 0.85, awning: 2.25, front: 0.85, z: [1.3, 4.7, 8.1, 11.5, 14.9] },
  /** THE BUTCHER'S STALL, facing +z at the end of lane A: the counter's middle x, its FRONT z, its length (along x) and
   *  depth (z); the shop front behind it (z) and the shop's x extent */ butcher: { x: MX + 0.6, z: -3.05, len: 3.6, d: 0.7, front: -4.0, x0: MX - 1.4, x1: MX + 2.7 },
  /** the awning over the butcher's counter: its poles' x and z, its front edge height */ awning: { x0: MX - 1.55, x1: MX + 2.55, z: -2.75, y: 2.3 },
  /** the chopping block: a thick round block on legs (WP3's prop) */ block: { r: 0.34, top: 0.8 },
  /** THE HOOK RACK: a bar at height y along x from the left awning pole (x0) to its own post (x1) at z (x = its middle;
   *  z0 = z1 = z: the block-out's names) */ rack: { x: MX - 1.0, y: 2.06, z0: -2.75, z1: -2.75, x0: MX - 1.55, x1: MX - 0.45, z: -2.75 },
  /** the far roofs (the town behind, painted) and the banyan (its trunk on the corner square, crown radius and top) */
  roofs: { z: -16, h: 3.4 }, banyan: { x: MX - 4.6, z: 1.2, r: 4.2, h: 8.6 },
};
export const MARKET = {
  /** where her walk starts (f 0, already moving) and where she stops, about 2.4 m in front of him */ start: V(MX - 0.3, 0, 6.5), stop: V(MX - 0.4, 0, 1.75),
  /** the chopping block (on the ground under its middle) */ block: V(MX + 0.3, 0, -1.35),
  /** the butcher, between the block and his counter, facing +z (a little toward SU) */ butcher: V(MX + 0.65, 0, -2.25),
  /** SU, in front of the block a little to its left (the block at his left hand), facing her */ su: V(MX - 0.35, 0, -0.7), suFacing: 0.1,
  /** the hook rack (the ground under its bar's middle) and the hook the set's carcass hangs from (its top) */ rack: V(MX - 1.0, 0, -2.75), carcass: V(MX - 1.0, 2.02, -2.75),
  /** the cleaver's resting place on the block top */ cleaver: V(MX + 0.42, 0.8, -1.42),
  /** the two servants carry the last good cuts away past her LEFT: from the butcher's counter, past SU's right, up lane A
   *  behind her (clear of the rack, the block and SU) */
  servantPath: [V(MX + 0.05, 0, -2.45), V(MX - 1.15, 0, -0.95), V(MX - 1.75, 0, 2.4), V(MX - 1.9, 0, 8.5)] as Path,
  /** the background villagers (extras the shots may stand there, each in front of a stall, clear of the paths; the SET
   *  draws its own far silhouettes): two at the stalls left of the butcher, two at lane A's first counters, two in lane B */
  villagers: [V(MX - 2.45, 0, -2.5), V(MX + 2.05, 0, 1.55), V(MX - 2.05, 0, 3.7), V(MX - 6.2, 0, -2.3), V(MX + 2.1, 0, -1.6), V(MX - 8.8, 0, -2.6)],
  /** where he beckons her to (A's end): the mouth of lane B, his way home */ beckon: V(MX - 2.4, 0, -2.0),
  /** NEW (WP2a): the banyan's trunk (the ground under it) and the stone ring's radius round it (a seat 0.45 high) */ banyan: V(MX - 4.6, 0, 1.2), banyanRing: 1.05,
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const MARKET_CAMS: Record<"walk" | "stall" | "close" | "wide" | "servants" | "butcher" | "lane", Cam> = {
  /** A pre: walking down lane A toward the stall (he is small ahead at the block, the carcass, the butcher; the stalls'
   *  awnings frame the edges; lane B opens on the left) */
  walk: eyeCam(MX - 0.3, 6.5, [MX + 0.05, 1.0, -1.6]),
  /** A01-A04: in front of him at the block, about 2.4 m: the carcass at his right (screen left), the block and the
   *  butcher at his left (screen right), the counter and the shop front behind him */
  stall: frontCam(MARKET.su, MARKET.suFacing, 2.4, { side: -0.3 }),
  /** A05: close, the bone held up to the lens (his face above it) */
  close: frontCam(MARKET.su, MARKET.suFacing, 1.25, { side: -0.1, eyesPx: 520 }),
  /** the stall from further back and to the left (him, the block, the butcher, the rack and the carcass, the awning) */
  wide: c([MX - 1.25, 1.5, 3.55], [MX + 0.15, 1.05, -2.4], 62),
  /** NEW: from her stop, over her left shoulder, up lane A: the servants carrying the meat away (A02 当官的) */
  servants: c([MARKET.stop.x, 1.5, MARKET.stop.z], [MX - 1.7, 1.15, 7.5], 62),
  /** NEW: from her stop toward the butcher at the block (the cleaver thunk, his pay on card 1) */
  butcher: c([MARKET.stop.x, 1.5, MARKET.stop.z], [MX + 0.6, 1.0, -2.3], 62),
  /** NEW: down lane B from the T (where he beckons her: the stalls, the far crowd) */
  lane: c([MX - 0.6, 1.5, -1.6], [MX - 9.0, 1.1, -2.6], 62),
};
/** the stand-in staging (the WP1 stub): SU at his mark, her eyes at `stall` */
export const MARKET_STAND: Stand = { cam: MARKET_CAMS.stall, su: MARKET.su, facing: MARKET.suFacing };
