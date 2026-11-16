// THE BEACH (place "beach", island x 600): 儋州, Hainan, two years later (PLAN 1, 8H). NUMBERS ONLY. Owner WP2b (WP1's
// names kept; marks and cameras added).
// Sand toward the lens (+z), the turquoise sea behind (-z: the sand slopes down into it, surf lines run up the wet
// sand), the thatched hut (桄榔庵) at the left with its porch, coconut palms, a driftwood fire ring on the sand in the
// middle: SU_DAN sits low on a driftwood log at its far side (facing her), GUO on a second log at its right, both
// grilling oysters; a flat stone at the fire's edge with oysters roasting, a basket of oysters and a heap of shells.
// The fire's flames, embers, glow and flicker are the SET's (param fire); the oyster in a hand is WP3's prop.
// Bright tropical late-afternoon light from the right (west).
import { ISLAND, V, frontCam, eyeCam, type Stand, type Cam } from "./base";

/** the island's x */
export const BX = ISLAND.beach;
export const BEACH_SET = {
  /** the dry sand (y 0) down to z0 where the wet sand starts sloping into the sea (surface y); the sea's far edge */
  sand: { x0: BX - 40, x1: BX + 40, z0: -7.5, z1: 25 }, sea: { z1: -7.5, z0: -300, y: -0.05 },
  /** the thatched hut: footprint, wall height, the thatch's top (its porch toward +z, posts at porch.z) */ hut: { x0: BX - 5.0, x1: BX - 2.2, z0: -5.6, z1: -3.2, wall: 1.9, top: 3.3, porch: { z: -2.35, x0: BX - 5.2, x1: BX - 2.0 } },
  /** the fire ring: middle, radius (stones round it, driftwood logs in it) */ fireRing: { x: BX + 0.15, z: -1.25, r: 0.42 },
  /** the coconut palms (trunk feet), each leaning and how tall */ palms: [[BX - 6.2, -1.6, 6.4], [BX + 3.9, -5.0, 7.2], [BX + 5.8, -1.2, 5.6], [BX - 1.0, -6.9, 6.8], [BX + 9.5, -6.5, 7.6]] as [number, number, number][],
  /** the driftwood logs they sit on: middle, length, radius (the top = BEACH.seatTop), yaw */ logs: { su: { x: BX - 0.147, z: -2.413, len: 1.0, r: 0.15, yaw: 0.25 }, guo: { x: BX + 1.085, z: -1.919, len: 0.95, r: 0.15, yaw: -0.95 } },
  /** the oyster stone at the fire's edge (flat, top `top`), the basket of oysters and the shell heap */ stone: { x: BX + 0.42, z: -0.98, r: 0.2, top: 0.07 }, basket: V(BX + 1.25, 0, -0.62), heap: V(BX - 1.15, 0, -1.05),
};
const LG = BEACH_SET.logs;
/** the ground under his seat on the log (the crouched cameras frame his head there, about 1.0 m up) */
const SEAT = V(LG.su.x, 0, LG.su.z);
export const BEACH = {
  /** the hut (the ground under its middle) */ hut: V(BX - 3.6, 0, -4.4),
  /** the fire (the ground under its middle) */ fire: V(BX + 0.15, 0, -1.25),
  /** SU_DAN at the fire's far side, facing her: STANDING here (0.4 m in front of his log); sitting low on the log =
   *  suSeat (its top `seatTop`) */ su: V(LG.su.x + 0.4 * Math.sin(LG.su.yaw), 0, LG.su.z + 0.4 * Math.cos(LG.su.yaw)), suFacing: 0.25, seatTop: 0.3,
  /** GUO at the fire's right, turned to it: standing here (0.4 m in front of his log); sitting = guoSeat */ guo: V(LG.guo.x + 0.4 * Math.sin(LG.guo.yaw), 0, LG.guo.z + 0.4 * Math.cos(LG.guo.yaw)), guoFacing: -0.95,
  /** NEW: the seats on the logs (rig3d RigSeat fields: the hip on `top`, the feet on the sand): rig.set({ at:
   *  V(top.x, 0, top.z), facing: suFacing, seat: BEACH.suSeat, pose: { kind: "sit", t } }) */
  suSeat: { top: V(LG.su.x, 0.3, LG.su.z), floor: 0, back: 0.03, front: 0.12 }, guoSeat: { top: V(LG.guo.x, 0.3, LG.guo.z), floor: 0, back: 0.03, front: 0.12 },
  /** NEW: the oysters roasting on the stone at the fire's edge (the middle of the stone's top) */ stone: V(BEACH_SET.stone.x, BEACH_SET.stone.top, BEACH_SET.stone.z),
  /** NEW: the flames' foot (where a held oyster goes to grill: over the embers) */ embers: V(BX + 0.15, 0.08, -1.25),
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const BEACH_CAMS: Record<"fire" | "su" | "lean" | "pair" | "wide", Cam> = {
  /** H pre: the wipe lands: the beach, the hut, the sea, the two at the fire */
  fire: frontCam(SEAT, BEACH.suFacing, 3.4, { side: 0.6, headY: 1.0, eyesPx: 680 }),
  /** H53-H55: on SU_DAN at the fire */
  su: frontCam(SEAT, BEACH.suFacing, 2.2, { side: 0.25, headY: 1.0, eyesPx: 620 }),
  /** H53 on 千万别让北方人知道: he leans to the lens (her lens beside the fire, at its left) */
  lean: frontCam(SEAT, BEACH.suFacing, 1.55, { side: -0.55, headY: 1.0, eyesPx: 560 }),
  /** NEW: card 4: the two of them at the fire (GUO laughing at the right) */
  pair: { pos: [BX + 0.55, 1.5, 1.35], look: [BX + 0.4, 0.62, -1.75], fov: 62 },
  /** NEW: establishing, wider: the hut, the palms, the sea and the two small at the fire */
  wide: eyeCam(BX + 1.6, 5.2, [BX - 0.6, 1.2, -3.0]),
};
/** the stand-in staging (the WP1 stubs): SU_DAN standing at his mark by the fire, her eyes at `su` */
export const BEACH_STAND: Stand = { cam: frontCam(BEACH.su, BEACH.suFacing, 2.6, { side: 0.25 }), su: BEACH.su, facing: BEACH.suFacing };
