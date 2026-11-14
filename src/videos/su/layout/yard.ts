// THE YARD (place "yard", island x 100): his new house on 白鹤峰 (PLAN 1, 8B-D). NUMBERS ONLY. Owner WP2a (the names
// are WP1's: keep them).
//
// THE PLAN (+z toward her usual side, the river valley beyond the front fence):
//   - The hilltop is a flat PLATEAU (y 0) from x -7.4 to +30 and z -16 to 7.6 (the yard, the house, the road shelf);
//     beyond its edges the hill falls away: to the LEFT (-x) the slope with the lychee tree, to the FRONT (+z) down to
//     the river; behind the house (-z) a bamboo grove on the crest. The river, the far hills and the sky are one painted
//     panorama all round.
//   - THE HOUSE across the back (x -4..4, front wall z -4.6): pale fresh timber frame, cream plaster, a grey tiled
//     gable roof (ridge 5.0, its front edge out at z -3.3, 3.0 up), a VERANDA beam on four posts at z -3.85 (x -4, -2.6, 2.6, 4),
//     the door in the middle with the board 「德有邻堂」 over it, a lattice window either side.
//   - Everything her B framings need sits within about 2.5 m of the door (her 9:16 lens sees a narrow strip): left of
//     the door the clay STOVE in the yard (SU squats behind it, facing her), the woodpile and the water jar at the wall;
//     right of the door the BENCH against the wall, the DOG lying in front of it, the LADDER leaning on the veranda
//     beam (MAI on it), the red LANTERN's hook on the beam between the board and the ladder. The kids chase round a
//     loop in the open yard right of the middle.
//   - THE LYCHEE TREE at the plateau's left edge (x -6.1), its crown spreading over the RATTAN BED (along z, his head to
//     the tree, his feet toward her) and the SHELL PILE at the bed's foot.
//   - The FENCE along the front (z 4) with the GATE right of the middle; outside it the HILL ROAD runs along the level
//     shelf from +x to the gate (the courier rides it; everything a figure stands on is y 0).
// Every mark stands clear of the set (the rig figure is about 0.5 m across; SU 1.06 with a belly about 0.6 m).
import { ISLAND, V, c, eyeCam, frontCam, type Stand, type Cam, type Path } from "./base";

/** the island's x */
export const YX = ISLAND.yard;
export const YARD_SET = {
  /** the ground (the hill round the place) and the packed-earth yard inside the fence */ ground: { x0: YX - 40, x1: YX + 40, z0: -45, z1: 35 }, yard: { x0: YX - 7.2, x1: YX + 6.5, z0: -4.6, z1: 4.0 },
  /** NEW: the flat hilltop (y 0); outside it the hill falls away */ plateau: { x0: YX - 7.4, x1: YX + 30, z0: -16, z1: 7.6 },
  /** the house: its footprint, wall height, ridge; the roof's front edge (z, y) */ house: { x0: YX - 4.0, x1: YX + 4.0, z0: -9.6, z1: -4.6, wall: 2.7, ridge: 5.0, eave: { z: -3.3, y: 3.0 } },
  /** NEW: the veranda: its posts' line (z), their x, the beam's underside and top */ veranda: { z: -3.85, posts: [YX - 4.0, YX - 2.6, YX + 2.6, YX + 4.0], beam: [2.6, 2.95] as [number, number] },
  /** the door (in the front wall, centred on x) and the board over it 「德有邻堂」 */ door: { x: YX, w: 1.3, h: 2.1 }, board: { x: YX, y: 2.45, w: 1.5, h: 0.44 },
  /** NEW: the two lattice windows of the front wall (middles x, width, sill, top) */ windows: { x: [YX - 2.05, YX + 2.05], w: 1.1, y0: 0.95, y1: 1.95 },
  /** the fence along the front and the gate opening in it */ fence: { z: 4.0, x0: YX - 7.2, x1: YX + 6.5, h: 1.1 }, gate: { x: YX + 2.6, w: 1.7 },
  /** the lychee tree's trunk, its crown (radius, height of its middle) */ lychee: { x: YX - 6.1, z: -1.2, crown: 2.8, crownY: 3.5 },
  /** the rattan bed (along z: head end at z0, foot at z1), its top */ bed: { x: YX - 4.9, z0: -0.4, z1: 1.5, w: 0.72, top: 0.42 },
  /** the clay stove: footprint radius, top */ stove: { r: 0.38, top: 0.62 },
  /** the bench (along x) */ bench: { len: 1.5, d: 0.36, top: 0.45 },
  /** NEW: the ladder: the width between its rails, its rung spacing */ ladder: { w: 0.7, rung: 0.35 },
  /** NEW: the hill road's width (a level shelf outside the fence) */ road: { w: 2.6 },
  /** the backdrop: the river valley and hills (the painted panorama's radius `z`, its foot y0 and top y1) */ view: { z: 60, y0: -14, y1: 22 },
};
export const YARD = {
  /** in front of the door */ door: V(YX, 0, -4.15),
  /** the clay stove (its foot centre) and where SU squats behind it, facing her */ stove: V(YX - 1.3, 0, -2.4), suSquat: V(YX - 1.3, 0, -3.05),
  /** SU's standing mark in the yard, right of the stove (B07-B18) */ su: V(YX - 0.55, 0, -2.1), suFacing: 0.15,
  /** the wine bowl beside the stove (on a stool at his right hand when he squats) */ wine: V(YX - 1.95, 0.45, -2.55),
  /** the bench against the front wall right of the door (the ground under its middle) and the dog lying in front of it */
  bench: V(YX + 1.65, 0, -4.2), dog: V(YX + 1.25, 0, -3.5),
  /** the ladder's foot (between its rails), its top on the veranda beam, and where MAI stands on it (the 1.05 m rung,
   *  facing the house: back to us; his body behind the rungs) */ ladder: V(YX + 2.05, 0, -2.9), ladderTop: V(YX + 2.05, 2.7, -3.72), mai: V(YX + 2.05, 1.05, -3.05),
  /** the lantern's hook under the veranda beam */ lantern: V(YX + 1.35, 2.55, -3.85),
  /** the kids' chase: a closed loop in the open yard right of the middle */
  kids: [V(YX + 0.3, 0, -0.9), V(YX + 1.3, 0, -0.6), V(YX + 1.65, 0, -1.5), V(YX + 0.95, 0, -2.3), V(YX + 0.2, 0, -1.8), V(YX + 0.3, 0, -0.9)] as Path,
  /** the lychee tree (its trunk), the rattan bed (the middle of its top: he lies on it facing +z), the shell pile at its foot */
  lychee: V(YX - 6.1, 0, -1.2), bed: V(YX - 4.9, 0.42, 0.55), shells: V(YX - 4.9, 0, 1.95),
  /** NEW: where the set's two chickens peck (clear of every walk) */ hens: [V(YX + 4.4, 0, 0.6), V(YX - 3.3, 0, -1.6)],
  /** the gate (the middle of its opening), just inside it, the hill road up to it (along the shelf), where the courier
   *  reins in (outside) */
  gate: V(YX + 2.6, 0, 4.0), gateIn: V(YX + 2.5, 0, 3.0), road: [V(YX + 14, 0, 6.3), V(YX + 7.5, 0, 6.0), V(YX + 3.6, 0, 5.3)] as Path, courier: V(YX + 2.8, 0, 5.4),
  /** D: the family at the gate, framed round the courier in YARD_CAMS.gate (MAI with a kid left of him, GUO right, SU in
   *  front at the left, near enough for his face to read) */ family: { mai: V(YX + 0.6, 0, 2.1), kid: V(YX + 0.95, 0, 2.5), guo: V(YX + 2.0, 0, 1.6), su: V(YX - 0.1, 0, 0.9) },
};
/** NAMED CAMERAS (her eyes, 1.50 m) */
export const YARD_CAMS: Record<"land" | "stove" | "su" | "dog" | "house" | "bed" | "shells" | "gate" | "wide" | "tree" | "road", Cam> = {
  /** B pre: the whip lands: the house and its roof, the board, the lantern, MAI on the ladder, SU at the stove, the kids */
  land: eyeCam(YX + 0.3, 3.7, [YX + 0.2, 1.2, -4.6]),
  /** B06: SU squatting at the stove, close enough for the four actions */
  stove: frontCam(YARD.suSquat, 0.1, 2.3, { side: 0.25, headY: 1.0, eyesPx: 640 }),
  /** B07-B18: SU standing in the yard (the door behind him) */
  su: frontCam(YARD.su, YARD.suFacing, 2.2, { side: 0.15 }),
  /** B09 after: low, the dog in front of the bench (her camera 0.5 m over the ground) */
  dog: { pos: [YX + 1.0, 0.5, -2.3], look: [YX + 1.25, 0.22, -3.5], fov: 62 },
  /** B11: the house, the kids, the son on the ladder (the pan's far end) */
  house: eyeCam(YX - 0.4, 0.2, [YX + 1.3, 1.7, -4.2]),
  /** C: the lychee tree and SU on the rattan bed (from her side of its foot) */
  bed: eyeCam(YX - 3.5, 3.4, [YX - 5.0, 1.0, 0.0]),
  /** C after C20: tilted down to the shell pile at the bed's foot */
  shells: eyeCam(YX - 3.6, 3.4, [YX - 4.9, 0.25, 1.8]),
  /** D (STILL): from the yard toward the gate, the courier on the horse outside, the family coming out, the valley */
  gate: eyeCam(YX - 0.6, -1.4, [YX + 2.4, 0.2, 4.6]),
  /** NEW: establishing, from the hill road outside the gate: the gate on the left half (a frame in the frame), the yard
   *  and the house with its board and lantern through and right of it */
  wide: c([YX + 6.2, 1.5, 7.2], [YX - 1.8, 2.0, -3.0], 62),
  /** NEW: C pre: the lychee tree heavy with fruit, the bed in its shade, the valley falling away on the left */
  tree: eyeCam(YX - 1.9, 2.4, [YX - 5.4, 1.7, -0.6]),
  /** NEW: D pre: from the gate, out along the hill road (the courier riding up from the right, the valley beyond) */
  road: eyeCam(YX + 2.6, 4.5, [YX + 9.0, 1.2, 6.9]),
};
/** the stand-in staging (the WP1 stubs): SU at his yard mark, her eyes at `su` */
export const YARD_STAND: Stand = { cam: YARD_CAMS.su, su: YARD.su, facing: YARD.suFacing };
