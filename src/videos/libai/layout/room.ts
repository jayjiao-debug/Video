// THE ROOM (place "room", island x 200): inside the new house at evening (PLAN 1, 8E). NUMBERS ONLY. Owner WP2a (the
// names are WP1's: keep them).
//
// THE PLAN (seen from its front, +z, looking -z): a timber room (pale fresh boards, a waist rail, posts, a beamed
// ceiling). THE BIG LATTICE WINDOW in the back wall right of the middle: the GOLD low sun streams in through it (warm
// shafts, the lattice's shadow on the floor). His low writing DESK stands in front of the window (he sits behind it on
// a cushion, facing her, the glowing lattice behind and above his head). Left of the window along the back wall the
// BENCH where the two kids sit very still (a hanging scroll over them). The open travel TRUNKS on the left: one in the
// middle-left with the folded robes (the WIFE stands right of it folding), one nearer by the left wall. Packed bundles
// and baskets along the left wall; the BED SCREEN in the back right corner; the DOORWAY in the right wall. The front
// wall (behind her) is hidden while the lens is inside.
// The desk, cushion, trunks, robes and bench are WP3's props (the set draws stand-ins only when a param asks).
import { ISLAND, V, c, eyeCam, frontCam, type Stand, type Cam } from "./base";

/** the island's x */
export const RX = ISLAND.tavern;
export const ROOM_SET = {
  /** the floor (timber) inside the walls; wall height; the ceiling (not shadowing) */ floor: { x0: RX - 3.3, x1: RX + 3.3, z0: -3.4, z1: 3.6 }, wallH: 2.9,
  /** the big lattice window in the back wall (behind the desk) */ window: { x0: RX + 0.0, x1: RX + 1.9, y0: 0.85, y1: 2.25, z: -3.4 },
  /** NEW: the small high window in the left wall (a second shaft of gold) */ window2: { x: RX - 3.3, z0: -2.3, z1: -1.3, y0: 1.45, y1: 2.15 },
  /** the doorway in the right wall */ door: { x: RX + 3.3, z0: 0.3, z1: 1.4, h: 2.15 },
  /** the low desk: its top, its half sizes (WP3's desk prop: 1.20 x 0.56, top 0.42) */ desk: { top: 0.42, hx: 0.6, hz: 0.28 },
  /** the bed screen at the back right */ screen: { x0: RX + 2.15, x1: RX + 3.15, z: -2.85, h: 1.7 },
  /** NEW: the kids' bench (along x, against the back wall): length, depth, top */ bench: { len: 1.5, d: 0.36, top: 0.42 },
  /** NEW: a travel trunk: length (x), depth (z), height of its box */ trunk: { len: 0.8, d: 0.5, h: 0.42 },
};
export const ROOM = {
  /** the desk (on the floor under its middle, long side along x) and where he sits behind it (the cushion: props deskSeat
   *  puts it 0.55 m behind the desk's middle), facing +z */
  desk: V(RX + 0.95, 0, -1.75), sit: V(RX + 0.95, 0, -2.3), suFacing: 0,
  /** the two open trunks (the floor under their middles) and the folded robes on the first */ trunks: [V(RX - 1.75, 0, -1.55), V(RX - 2.4, 0, -0.15)], robes: V(RX - 1.75, 0.46, -1.55),
  /** the bench at the back left (the floor under its middle, along x) and the kids' seats on it */ bench: V(RX - 1.3, 0, -2.95), kids: [V(RX - 1.7, 0.42, -2.95), V(RX - 0.95, 0.42, -2.95)],
  /** where the WIFE stands folding robes (right of the first trunk) */ wife: V(RX - 0.9, 0, -1.25),
  /** the doorway (inside it) and the big window's middle */ door: V(RX + 2.95, 0, 0.85), window: V(RX + 0.95, 1.55, -3.4),
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const ROOM_CAMS: Record<"desk" | "wide" | "family" | "close" | "window", Cam> = {
  /** E: SU at the desk, writing (seated: his head about 1.0 m), the glowing lattice behind and above him */
  desk: frontCam(ROOM.sit, 0, 3.0, { side: -0.4, headY: 1.0, eyesPx: 620 }),
  /** E pre: the room from the front right: the wife at the trunk, the kids on the bench, the window light, him at the desk */
  wide: c([RX + 2.3, 1.5, 3.1], [RX - 0.55, 0.85, -2.2], 62),
  /** E33 on 给他们住: the family side (the wife, the kids on the bench, the open trunk) */
  family: c([RX + 0.5, 1.5, 1.0], [RX - 1.3, 0.8, -2.4], 62),
  /** E39 / card 3: closer on him */
  close: frontCam(ROOM.sit, 0, 1.9, { side: -0.2, headY: 1.0, eyesPx: 560 }),
  /** NEW: E pre's first beat: the gold light through the window, the shafts over the desk */
  window: eyeCam(RX - 0.6, 1.2, [RX + 1.1, 1.0, -3.0]),
};
/** the stand-in staging (the WP1 stubs): SU seated at the desk (the stub stands him there), her eyes at `desk` */
export const ROOM_STAND: Stand = { cam: frontCam(V(RX + 0.95, 0, -2.3), 0, 3.0, { side: -0.35 }), su: V(RX + 0.95, 0, -2.3), facing: 0 };
