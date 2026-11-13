// THE GARDEN (place "garden", island x 300): the small walled garden below Newton's window, Trinity, 1686 (PLAN 1, 7C,
// F start, G end). Day (noon) and night (blue moonlight, a mid-tone: never black). NUMBERS ONLY (sets/garden.ts builds
// from them, the shots pose from them). Owner: WP2.
// Plan (x offsets from GDX; the camera mostly looks NORTH, -z):
//   WEST   the college range (his building): a brick front with stone dressings at x = range.x, facing +x: his
//          staircase door (a four-centred stone arch) and, up on the first floor, HIS WINDOW;
//   NORTH  the chapel's flank: a tall pale ashlar wall with buttresses and big traceried windows (z = chapel.z);
//          against it, between two buttresses, his ELABORATORY: a small brick lean-to with a tiled pent roof, a brick
//          chimney, a plank door (facing the garden, south) and a little leaded window;
//   EAST   a brick garden wall with a stone coping (trees beyond); SOUTH another, with a gate.
//   Raked gravel walks round two lawn beds edged with low box hedges and clipped cones; a cross walk from his staircase
//   door to the east walk; a sundial on a stone pillar in the south bed.
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const GDX = ISLAND.garden;
const EW = 3.6, WW = -5.2, NW = -10.0, SW = 6.6, XW = -3.0;           // the walks' centre lines (east, west, north, south, cross)
export const GARDEN_SET = {
  /** the garden's bounds: the range front (x0), the east wall (x1), the chapel's face (z0), the south wall (z1) */ bounds: { x0: -6.0, x1: 5.6, z0: -15.5, z1: 8.0 },
  /** the walks: centre lines and width (gravel, raked along their length) */ walks: { east: EW, west: WW, north: NW, south: SW, cross: XW, w: 1.6 },
  /** the two lawn beds (x0, x1, z0, z1), edged with box (height, thickness), clipped cones at the corners */
  beds: [[-4.4, 2.8, -9.2, -3.8], [-4.4, 2.8, -2.2, 5.8]] as [number, number, number, number][], box: { h: 0.42, t: 0.34 }, cone: { h: 1.05, r: 0.34 },
  /** the sundial in the south bed (its pillar's foot) */ sundial: { x: -0.8, z: 1.8 },
  /** THE RANGE: its front's x, height to the parapet, the floor heights; its staircase door (z middle, width, height,
   *  arch rise); HIS WINDOW (first floor: z middle, width, sill, head, lights); the other windows' z middles */
  range: { x: -6.0, h: 8.6, floor1: 3.4, door: { z: XW, w: 1.1, h: 2.35, arch: 0.35 }, his: { z: -4.6, w: 1.5, y0: 4.15, y1: 5.75, lights: 3 },
    ground: [-8.6, 0.6, 4.4], first: [-8.6, -0.2, 3.4, 6.6], gw: 1.15, gy0: 1.0, gy1: 2.45 },
  /** THE CHAPEL's flank: its face's z, height to the parapet, the buttresses' x middles (width, projection), the big
   *  windows (x0, x1, sill, head) */
  chapel: { z: -15.5, h: 13.5, buttress: { x: [-4.4, -0.2, 5.0], w: 1.1, d: 1.25 }, windows: [[-3.55, -1.05, 4.2, 11.4], [1.0, 3.9, 5.6, 11.4]] as [number, number, number, number][] },
  /** THE ELABORATORY (outside): its footprint (x0, x1, back z = against the chapel's buttress line, front z), the pent
   *  roof's eaves (back high, front low), its door (x middle, width, height), its window (x middle, width, sill,
   *  head), the chimney (x, z, width, top) */
  elab: { x0: 0.6, x1: 4.6, z0: -14.25, z1: -11.0, eaveBack: 3.5, eaveFront: 2.45, door: { x: 2.2, w: 0.9, h: 1.95 }, win: { x: 3.75, w: 0.5, y0: 1.0, y1: 1.55 }, chimney: { x: 1.15, z: -13.4, w: 0.62, top: 5.4 } },
  /** the garden walls: height, coping */ wall: { h: 2.8, cope: 0.16 },
  /** the sun at noon and the moon at night (directions TOWARD them) */ sun: [-0.45, 0.78, 0.45] as [number, number, number], moon: [0.42, 0.62, 0.66] as [number, number, number],
};
const G = GARDEN_SET, E = G.elab;
export const GARDEN = {
  /** his staircase door: the gravel just outside it (facing +x into the garden) and just inside the doorway */ stairDoor: V(GDX + G.range.x + 0.45, 0, XW), stairDoorIn: V(GDX + G.range.x - 0.3, 0, XW), stairFacing: Math.PI / 2,
  /** the middle of HIS WINDOW's glass (first floor) */ window: V(GDX + G.range.x - 0.12, (G.range.his.y0 + G.range.his.y1) / 2, G.range.his.z),
  /** the elaboratory's door: the gravel in front of it, and inside the doorway */ elabDoor: V(GDX + E.door.x, 0, E.z1 + 0.55), elabIn: V(GDX + E.door.x, 0, E.z1 - 0.35),
  /** the crossing of the cross walk and the east walk (C19: he stops dead here, then runs west for the door) */ cross: V(GDX + EW, 0, XW),
  /** THE WALK (C): the perimeter walk's centre line as a closed loop, corner by corner (north-east first, clockwise
   *  seen from above: down the east walk toward her, along the south walk, up the west walk, back along the north) */
  loop: [V(GDX + EW, 0, NW), V(GDX + EW, 0, SW), V(GDX + WW, 0, SW), V(GDX + WW, 0, NW)],
  /** his turn down the east walk toward the camera (C16-19): from / to */ walkFrom: V(GDX + EW, 0, NW + 0.6), walkTo: V(GDX + EW, 0, XW),
  /** his run (C19-20): from the crossing west along the cross walk to his door */ runFrom: V(GDX + EW, 0, XW), runTo: V(GDX + G.range.x + 0.45, 0, XW),
  /** THE NIGHT WALK (F): his door -> along the cross walk -> up the east walk -> the elaboratory's door */
  night: [V(GDX + G.range.x + 0.45, 0, XW), V(GDX + EW, 0, XW), V(GDX + EW, 0, NW), V(GDX + E.door.x, 0, NW + 0.1), V(GDX + E.door.x, 0, E.z1 + 0.55)],
  /** the sundial's pillar (its foot) */ sundial: V(GDX + G.sundial.x, 0, G.sundial.z),
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197); };
/** NAMED CAMERAS (her eyes, EYE over the gravel) */
export const GARDEN_CAMS: Record<"walk" | "turn" | "stairDoor" | "follow" | "elab" | "window" | "wide", Cam> = {
  /** C16-18: walking backwards in front of him down the east walk (the elaboratory and the chapel behind him) */
  walk: eyeCam(GDX + EW + 0.1, XW + 3.8, [GDX + EW - 0.05, third(GDX + EW + 0.1, XW + 3.8, GDX + EW, XW + 0.4), XW + 0.4]),
  /** C19: at the crossing, looking west along the cross walk to the range and his staircase door */
  turn: eyeCam(GDX + EW + 0.3, XW + 1.6, [GDX + G.range.x, 1.9, XW - 0.4]),
  /** C20: nearer his door (the range's front, his window above) */
  stairDoor: eyeCam(GDX - 1.4, XW + 0.6, [GDX + G.range.x, 2.6, XW - 0.6]),
  /** F01: behind his candle on the east walk at night, the glowing elaboratory ahead under the chapel */
  follow: eyeCam(GDX + EW - 0.2, -4.6, [GDX + E.door.x + 0.3, 1.6, E.z1 - 1]),
  /** F01 end: close on the elaboratory's door */
  elab: eyeCam(GDX + E.door.x + 0.5, E.z1 + 3.0, [GDX + E.door.x, 1.45, E.z1]),
  /** G end: from the elaboratory's door, back across the garden to HIS WINDOW (it goes dark) */
  window: eyeCam(GDX + E.door.x - 0.3, E.z1 + 0.9, [GDX + G.range.x, 4.4, G.range.his.z]),
  /** the whole garden from the south-east corner: the walks, the beds, the range, the chapel and the elaboratory */
  wide: eyeCam(GDX + 4.7, 7.3, [GDX - 0.6, 2.4, -12]),
};
/** the stand-in staging: NEWTON coming down the east walk toward her */
export const GARDEN_STAND: Stand = { cam: GARDEN_CAMS.walk, newton: V(GDX + EW, 0, XW + 0.4), facing: 0 };
