// HIS ROOM (place "room", island x 200): Newton's study-bedroom on the first floor (PLAN 1, 7B, C end, E, G end). ONE
// set lit four ways by the param `hour` (morning white, noon hard, evening slanting gold, night candle-orange with the
// window dark). NUMBERS ONLY (sets/room.ts builds from them, the shots pose from them). Owner: WP2.
// The camera side is +z. THE WINDOW is in the BACK wall (z0), on the left; THE WINDOW TABLE (the day's clock: the
// dinner plate) stands right under it, so the window's bars throw their shadows across its cloth; THE DESK (buried in
// paper) stands to the right, NEWTON behind it facing the camera (facing 0), the back wall 0.6 m behind him (room for
// WP3's chair); THE DOOR to the stairs is in the LEFT wall (it opens inward, hinged at its back end, as on the stairs).
// A tall bookcase on the right wall, a stone fireplace further forward on the right, a plaster frieze over the panels.
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const RMX = ISLAND.room;
export const ROOM_SET = {
  /** the walls' inner faces (x offsets from RMX; z) and the ceiling */ walls: { x0: -2.3, x1: 2.3, z0: -2.6, z1: 2.2 }, ceil: 2.75,
  /** the panelling's top (a plaster frieze above it to the ceiling) */ panel: 2.3,
  /** THE WINDOW in the back wall: x offsets, sill, head, two lights + a transom (a cross window), iron bars inside the
   *  glass, the wall's thickness and how far behind the face the glass sits */ window: { x0: -1.75, x1: -0.65, y0: 0.8, y1: 2.22, lights: 2, transom: 1.78, bars: 5, wall: 0.45, inset: 0.3 },
  /** THE WINDOW TABLE (set furniture with a linen cloth): its middle (x offset, z), top size, top height, the cloth's
   *  drop */ table: { x: -1.2, z: -2.27, w: 0.86, d: 0.54, top: 0.72, cloth: 0.006, drop: 0.2 },
  /** THE DESK: its middle (x offset, z), top size, top height */ desk: { x: 0.75, z: -1.35, w: 1.45, d: 0.8, top: 0.76 },
  /** THE DOOR in the left wall (x0): z0 = the hinge (back) edge, z1, height, leaf thickness; it opens inward (+x) */ door: { z0: -0.4, z1: 0.5, h: 2.02, t: 0.055, swing: 1.6, wall: 0.3 },
  /** the bookcase on the right wall: z span, height, depth, shelf heights */ books: { z0: -2.35, z1: -0.75, h: 2.1, d: 0.32, shelves: [0.42, 0.82, 1.22, 1.62, 2.02] },
  /** the fireplace on the right wall: z span, opening height, surround */ fire: { z0: 0.35, z1: 1.55, h: 1.15 },
  /** where the night candle stands (the place's point light at hour "night"; WP3's candle prop goes here too) */ candle: { x: -0.88, z: -2.2 },
};
const T = ROOM_SET.table, D = ROOM_SET.desk, DR = ROOM_SET.door, TT = T.top + T.cloth;
export const ROOM = {
  /** THE WINDOW TABLE: the middle of its top (on the cloth): the plate goes here */ windowTable: V(RMX + T.x, TT, T.z), tableTop: TT,
  /** the dinner plate's spot (a little forward of the table's middle, in the noon bar shadows) */ plate: V(RMX + T.x - 0.02, TT, T.z + 0.06),
  /** the candle's spot on the window table (night) */ candle: V(RMX + ROOM_SET.candle.x, TT, ROOM_SET.candle.z),
  /** where HUMPHREY stands to set the dinner (in front of the table, his back to the camera: facing PI) */ humphreyTable: V(RMX + T.x + 0.05, 0, T.z + 0.68), humphreyFacing: Math.PI,
  /** where NEWTON stands to eat at the table (E, G end: right of it, turned toward her) */ tableStand: V(RMX + T.x + 0.72, 0, T.z + 0.42), tableFacing: -0.55,
  /** THE DESK: the floor under its middle, its top height */ desk: V(RMX + D.x, 0, D.z), deskTop: D.top,
  /** where NEWTON stands (or sits) to write: behind the desk, facing her (facing 0) */ newtonDesk: V(RMX + D.x - 0.05, 0, D.z - D.d / 2 - 0.27), deskFacing: 0,
  /** his page on the desk (where the quill writes: on his side, a little left of the middle, on the desk's back band
   *  within his reach from newtonDesk: 0.36 m in front of him) */ deskWrite: V(RMX + D.x - 0.12, D.top, D.z - D.d / 2 + 0.09),
  /** WP3's drafts stack (a hand's breadth thick): the desk's front-right corner, toward her */ drafts: V(RMX + D.x + 0.48, D.top, D.z + 0.2),
  /** WP3's inkwell (in front of the set's open book, right of his page) */ inkwell: V(RMX + D.x + 0.22, D.top, D.z - 0.08),
  /** WP3's chair: the floor under the chair's middle, behind him (facing 0, toward the desk) */ chair: V(RMX + D.x - 0.05, 0, D.z - D.d / 2 - 0.62), chairFacing: 0,
  /** the doorway's middle on the floor (left wall) and a step inside it */ door: V(RMX + ROOM_SET.walls.x0, 0, (DR.z0 + DR.z1) / 2), doorIn: V(RMX + ROOM_SET.walls.x0 + 0.5, 0, (DR.z0 + DR.z1) / 2),
  /** the door's hinge axis on the floor and the leaf's width */ hinge: V(RMX + ROOM_SET.walls.x0 - 0.06, 0, DR.z0 + 0.01), leafW: DR.z1 - DR.z0,
  /** the middle of the room (her usual floor point) */ middle: V(RMX + 0.1, 0, 0.3),
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197); };
/** NAMED CAMERAS (her eyes, EYE over the floor; `plate` is the plate insert, closer and lower) */
export const ROOM_CAMS: Record<"plate" | "desk" | "wide" | "door" | "window" | "drafts" | "chair", Cam> = {
  /** B, C, E, G: the day's clock: close on the plate on the window table (the window's light falls across it) */
  plate: { pos: [RMX + T.x - 0.02, 1.32, T.z + 0.95], look: [RMX + T.x - 0.02, TT + 0.06, T.z + 0.02], fov: 50 },
  /** B: in front of the desk, NEWTON writing behind it (about 2 m) */
  desk: eyeCam(RMX + 0.55, 0.3, [RMX + D.x - 0.05, third(RMX + 0.55, 0.3, RMX + D.x - 0.05, D.z - D.d / 2 - 0.27), D.z - D.d / 2 - 0.27]),
  /** B: pull back: the window table (left) and the desk (right) in one frame: "three steps from his elbow" */
  wide: eyeCam(RMX - 0.2, 2.0, [RMX - 0.15, 0.95, -2.2]),
  /** B08: the mic swings after HUMPHREY to the door (left wall) */
  door: eyeCam(RMX + 0.35, -0.3, [RMX + ROOM_SET.walls.x0, 1.05, (DR.z0 + DR.z1) / 2 + 0.1]),
  /** E, G end: at the window table (NEWTON eating standing; the plate framed right in G) */
  window: eyeCam(RMX - 0.2, -0.55, [RMX + T.x + 0.3, third(RMX - 0.2, -0.55, RMX + T.x + 0.72, T.z + 0.42), T.z + 0.3]),
  /** B11: the mic tilts toward the drafts stack on the desk */
  drafts: eyeCam(RMX + 0.45, -0.35, [RMX + D.x + 0.45, 0.82, D.z + 0.05]),
  /** C06: her hand drags the chair to the backs of his knees: from the corner by the bookcase, bending (lens 1.45 m),
   *  looking down at ROOM.chair, NEWTON at the frame's left edge (WP3's camera: cam.ts chairDrag reaches the rail) */
  chair: { pos: [RMX + 1.7, 1.45, -2.43], look: [RMX + 0.9, 0.5, -2.32], fov: 62 },
};
/** the stand-in staging: NEWTON behind the desk, HUMPHREY at the window table */
export const ROOM_STAND: Stand = { cam: ROOM_CAMS.desk, newton: ROOM.newtonDesk, facing: 0, humphrey: ROOM.humphreyTable, humphreyFacing: ROOM.humphreyFacing };
