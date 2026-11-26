// THE PLACES of 采访八百壮士的一天 and where things stand in each: the contract between the set builders and the shots.
// Every place is built round its own island (x = ISLAND[place], floors at y = 0 unless said). All positions below are
// LOCAL to the island. Units: metres. The reporter's eye (the camera) is about 1.5 m above whatever she stands on.
//
// THE HALL (one floor of the Sihang Warehouse, 四行仓库, on the north bank of the Suzhou Creek):
//   -z = SOUTH: the wall toward the creek, three windows walled up with grain sacks, a firing slit left in each.
//        Sixty metres beyond: the creek and the International Settlement (neon at night, crowds by day).
//   -x = WEST: the wall the attack comes at (scene D's window, scene G's shell hole).
//   +x = EAST: the hall runs on (columns into the dark); the hole to the shop next door (scene F's rope).
//   +z = NORTH: where she comes in from; the stairs.
export type Place = "hall" | "roof" | "bridge";
export const PLACES: Place[] = ["hall", "roof", "bridge"];
export const ISLAND: Record<Place, number> = { hall: 0, roof: 200, bridge: 400 };

export type V3 = [number, number, number];
export type Spot = { at: V3; facing: number; note: string };
export type CamSpot = { pos: V3; look: V3; fov: number; note: string };

/** the hall's box: the walls' inner faces, the ceiling, the three south windows (centres on x), the west window */
export const HALL = {
  x0: -7.2, x1: 8.8, z0: -6.0, z1: 7.0, h: 4.3,
  /** the south windows: centre x, sill 0.95, head 3.1, 1.9 wide */
  win: [-4.6, 0.0, 4.6], winW: 1.9, sill: 0.95, head: 3.1,
  /** the slit left in each sack wall: its centre height and size */
  slitY: 1.42, slitH: 0.3, slitW: 0.62,
  /** the west window (scene D): centre z, sill, head, width */
  west: { z: -2.6, sill: 0.9, head: 2.9, w: 1.5 },
  /** the west wall's shell hole (scene G): centre z and y, radius */
  hole: { z: 1.2, y: 1.35, r: 0.62 },
  /** the columns (mushroom heads): [x, z] */
  cols: [[-3.2, -1.6], [2.4, -1.6], [8.0, -1.6], [-3.2, 3.4], [2.4, 3.4], [8.0, 3.4]] as [number, number][],
  /** the east wall's rope hole (scene F): centre z and y */
  rope: { z: -3.3, y: 1.0 },
} as const;

export const STAGE = {
  hall: {
    spots: {
      // scene A: the line of men hauling sacks along the south wall (the pan goes left to right)
      haul0: { at: [-5.2, 0, -3.9], facing: 0.3, note: "haulers along the south wall, 1" } as Spot,
      mancangA: { at: [0.9, 0, -3.3], facing: 0.15, note: "满仓 with a sack, by the middle window's sack wall" } as Spot,
      // scene B: the one man sitting: a crate desk and a kerosene lamp by the second column
      xieDesk: { at: [3.9, 0, -0.4], facing: -0.5, note: "谢晋元 on an ammunition box at a crate (top 0.62), writing" } as Spot,
      laoA: { at: [2.2, 0, -3.5], facing: 0.4, note: "老班长 cleaning his rifle on a sack by the middle window" } as Spot,
      // the middle window's slit (B06-B12, C, E): 满仓's place beside it
      slit: { at: [0.75, 0, -5.05], facing: 0.9, note: "满仓 at the middle window's slit, half turned to her" } as Spot,
      // scene D: the west window
      westWin: { at: [-6.55, 0, -2.6], facing: -Math.PI / 2, note: "the young soldier at the west window's sill, back to us" } as Spot,
      // scene E: the back door (east end of the north wall), the assembly in the middle bay, the letter by the lamp
      door: { at: [6.4, 0, 6.2], facing: Math.PI, note: "the back door: the stretchers go out here" } as Spot,
      assembly: { at: [0.6, 0, 1.2], facing: 0, note: "the rows of men face south-west to the two officers" } as Spot,
      officers: { at: [-1.6, 0, -1.0], facing: 0.5, note: "谢晋元 and 杨瑞符 before the rows" } as Spot,
      letter: { at: [-1.4, 0, -4.6], facing: 0.6, note: "满仓 on a sack by a lamp, under the west bay's sack wall: the letter" } as Spot,
    },
  },
  roof: { spots: { rows: { at: [0, 0, -1.2], facing: 0.2, note: "the men in rows on the roof, faces up to the pole" } as Spot } },
  bridge: { spots: { south: { at: [0, 0, 6], facing: 0, note: "the south end: the cordon, the pile of rifles" } as Spot } },
} as const;
