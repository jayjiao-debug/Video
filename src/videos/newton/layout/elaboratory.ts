// THE ELABORATORY (place "elaboratory", island x 600): inside Newton's small brick outbuilding against the chapel, at
// night, 1686 (PLAN 1, 7F, G start). The garden's lean-to seen from inside (layout/garden.ts GARDEN_SET.elab: the
// furnace and its chimney at the WEST end, the door and the little window in the SOUTH front), a little roomier than
// its outside, as films are. NUMBERS ONLY (sets/elaboratory.ts builds from them, the shots pose from them). Owner: WP2.
// Plan (x offsets from ELX; the camera mostly looks NORTH, -z, from the door's side):
//   LEFT (west) wall: THE FURNACE, a brick mass with its iron FIRE DOOR facing into the room (+x): the room's KEY
//        LIGHT (warm orange, flickering); its brick hood goes up to the ceiling; beside it in the back corner a round
//        brick ATHANOR (tower furnace) with a glass alembic on top; bellows against the furnace; the CHARCOAL HEAP on
//        the floor in the front-left corner, between the furnace and the door (Humphrey shovels from it);
//   RIGHT (east) wall: the BENCH: the big mouldy old book lying open, glass vessels, crucibles, a mortar, papers and
//        the set's CANDLE; shelves of jars and bottles above it;
//   BACK (north) wall: a shelf of vessels; the pent roof's rafters slope down from the back (high) to the front (low);
//   FRONT (south) wall: the plank DOOR (standing open inward) on the BLUE NIGHT GARDEN, and the little leaded window.
// Figures stand on the brick floor, y 0. THE STOOL (WP3's prop) goes on ELAB.stool, by the fire door.
import { ISLAND, V, EYE, eyeCam, type Stand, type Cam } from "./base";

export const ELX = ISLAND.elaboratory;
const FD = { z: -0.95, y0: 0.42, y1: 0.78, w: 0.38 };       // the fire door's opening on the furnace's face
export const ELAB_SET = {
  /** the walls' inner faces (x offsets; z) and the ceiling (a pent roof: high at the back wall, low at the front) */ walls: { x0: -2.2, x1: 2.2, z0: -1.8, z1: 1.8 }, ceilBack: 3.35, ceilFront: 2.45,
  /** THE FURNACE against the left wall: its face's x, z span, height; its fire door (z middle, sill, head, width) and
   *  the ash pit under it; the hood (width, depth) up to the ceiling */ furnace: { x1: -1.22, z0: -1.79, z1: -0.28, h: 1.22, door: FD, ash: { y0: 0.08, y1: 0.26, w: 0.3 }, hood: { w: 1.1, d: 0.62 } },
  /** the athanor (a round brick tower furnace) in the back-left corner: its middle (x, z), radius, height */ athanor: { x: 0.12, z: -1.47, r: 0.27, h: 1.12 },
  /** THE BENCH along the right wall: x span, z span, top height */ bench: { x0: 1.42, x1: 2.14, z0: -1.55, z1: 1.05, top: 0.86 },
  /** the shelves on the right wall over the bench (heights) and on the back wall (x span, height) */ shelves: { right: [1.42, 1.86], back: { x0: 0.5, x1: 1.36, y: 1.55 } },
  /** the big open book on the bench (its middle: x, z; open size w x d) */ book: { x: 1.76, z: -0.32, w: 0.56, d: 0.38 },
  /** the set candle on the bench (x, z; param candle = its length 0..1 of `len`) */ candle: { x: 1.66, z: 0.38, len: 0.24 },
  /** THE CHARCOAL HEAP on the floor (middle x, z; radius, height) */ charcoal: { x: -1.62, z: 0.92, r: 0.52, h: 0.36 },
  /** THE DOOR in the front wall: x middle, width, height, the wall's thickness; the leaf stands open inward */ door: { x: -0.42, w: 0.9, h: 1.95, wall: 0.26, open: 1.25 },
  /** the little window in the front wall: x middle, width, sill, head */ win: { x: 1.3, w: 0.52, y0: 1.0, y1: 1.56 },
};
const F = ELAB_SET.furnace, B = ELAB_SET.bench, DR = ELAB_SET.door, W = ELAB_SET.walls;
export const ELAB = {
  /** THE FIRE DOOR: the middle of its glowing opening (the light comes from here) */ furnaceDoor: V(ELX + F.x1, (FD.y0 + FD.y1) / 2, FD.z), fire: V(ELX + F.x1 - 0.2, (FD.y0 + FD.y1) / 2, FD.z),
  /** THE STOOL (WP3's prop): the floor under its seat, level with the fire door so the fire is at his left; he sits
   *  facing the room, turned a little toward the fire (facing) */ stool: V(ELX - 0.66, 0, FD.z + 0.1), stoolFacing: -0.3,
  /** NEWTON standing by the furnace (F, CARD 3), beside and behind the fire door: his spot, and the facing that stares
   *  into it (near profile to a camera at the front-right); the stand-in turns him to her instead */ newtonFire: V(ELX - 0.55, 0, -1.25), newtonFireFacing: -1.15,
  /** HUMPHREY shovelling: between the heap and the furnace's front corner, turned toward the fire door */ humphreyShovel: V(ELX - 1.0, 0, 0.0), humphreyFacing: -2.4,
  /** the charcoal heap (its middle on the floor) and where the shovel bites into it */ charcoal: V(ELX + ELAB_SET.charcoal.x, 0, ELAB_SET.charcoal.z), charcoalBite: V(ELX + ELAB_SET.charcoal.x + 0.3, 0.12, ELAB_SET.charcoal.z - 0.2),
  /** THE BENCH: the floor under its middle and its top height */ bench: V(ELX + (B.x0 + B.x1) / 2, 0, (B.z0 + B.z1) / 2), benchTop: B.top,
  /** the open book's middle (on its pages) */ book: V(ELX + ELAB_SET.book.x, B.top + 0.07, ELAB_SET.book.z),
  /** the set candle's foot on the bench */ candle: V(ELX + ELAB_SET.candle.x, B.top, ELAB_SET.candle.z),
  /** the doorway: its middle on the floor, a step inside, a step outside (HUMPHREY in the doorway with the sack) */ door: V(ELX + DR.x, 0, W.z1), doorIn: V(ELX + DR.x, 0, W.z1 - 0.55), doorOut: V(ELX + DR.x, 0, W.z1 + DR.wall + 0.25), doorFacing: Math.PI,
  /** the middle of the room (her floor point) */ middle: V(ELX + 0.3, 0, 0.3),
};
/** the look height, at a figure's floor point (x, z), that puts NEWTON's eyes (1.14 m over his floor) in the frame's
 *  upper third (layout.ts SCREEN.eyes) when her eyes stand at (cx, cz), `eye` over the same floor (seated on the stool
 *  his eyes are about 0.35 lower: pass EYE + 0.35) */
const third = (cx: number, cz: number, x: number, z: number, eye = EYE) => { const d = Math.hypot(x - cx, z - cz); return eye - d * Math.tan(Math.atan((eye - 1.14) / d) + 0.197) - (eye - EYE); };
/** NAMED CAMERAS (her eyes, EYE over the brick floor) */
export const ELAB_CAMS: Record<"enter" | "wide" | "stool" | "push" | "board" | "fire" | "door" | "bench", Cam> = {
  /** F: in the doorway, following his candle in: the glowing furnace ahead left, the bench right */
  enter: eyeCam(ELX + DR.x + 0.15, W.z1 - 0.2, [ELX - 0.6, 1.0, -1.2]),
  /** the whole room from the front-right corner by the window: furnace, heap, stool, bench */
  wide: eyeCam(ELX + 1.5, 1.0, [ELX - 0.99, third(ELX + 1.5, 1.0, ELX - 0.99, -0.745), -0.745]),
  /** F 41-44: NEWTON on the stool by the fire door, three-quarter front, lit by the fire (the push-in starts here) */
  stool: eyeCam(ELX + 0.7, 0.55, [ELX - 0.66, third(ELX + 0.7, 0.55, ELX - 0.66, FD.z + 0.1, EYE + 0.35), FD.z + 0.1]),
  /** F 50: where the slow push-in stops (his face, the fire's light on it) */
  push: eyeCam(ELX + 0.02, 0.05, [ELX - 0.66, third(ELX + 0.02, 0.05, ELX - 0.66, FD.z + 0.1, EYE + 0.35), FD.z + 0.1]),
  /** F: close on the board on his knee (looking down over it) */
  board: { pos: [ELX - 0.3, 1.45, FD.z + 0.45], look: [ELX - 0.6, 0.55, FD.z + 0.2], fov: 50 },
  /** close on the fire door: the coals, the flames, the glow on the brick */
  fire: eyeCam(ELX - 0.1, 0.0, [ELX + F.x1, 0.62, FD.z], 50),
  /** G: the reverse, from the furnace side: the open door on the blue night (HUMPHREY in it with the sack) */
  door: eyeCam(ELX - 0.9, -0.95, [ELX + DR.x + 0.1, 1.15, W.z1]),
  /** the bench: the mouldy open book, the vessels, the candle */
  bench: eyeCam(ELX + 0.6, 0.55, [ELX + ELAB_SET.book.x, B.top + 0.05, ELAB_SET.book.z]),
};
/** the stand-in staging: NEWTON by the fire, HUMPHREY shovelling */
export const ELAB_STAND: Stand = { cam: ELAB_CAMS.wide, newton: ELAB.newtonFire, facing: 0.6, humphrey: ELAB.humphreyShovel, humphreyFacing: ELAB.humphreyFacing };
