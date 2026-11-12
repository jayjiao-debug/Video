// THE GEOMETRY of the Hongmen film: who sits where, the door, the floor marks, the outdoor marks and the CHECKED
// cameras. LINE NUMBERS IN THIS FILE ARE THOSE OF SCRIPT v4 (22 lines); the per-line camera plan is g1_layout.md.
// Marks that script v4 no longer uses are kept and say so ("not used by script v4"). NUMBERS ONLY (no scene building): the set builds from this file and the shots pose from it; nobody else
// types a seat, a mark or a camera by hand. Every interior number here was tried with real rig figures seated at the
// low tables (stills and the reasons: /home/user/hm_notes/g1_layout.md); the outdoor numbers were tried as block-outs.
//
// Conventions (group/kit/rig3d, as arthur/shots/common.ts): metres, floor y 0, facing 0 = toward +z, PI/2 = toward +x;
// the person's LEFT is +x when facing 0; arm 0 = the person's right hand.
// COMPASS of the tent: NORTH = +z, SOUTH = -z, EAST = -x, WEST = +x. The cameras live on the NORTH and the EAST side
// only (never south or west of the ring): from the north cameras Xiang Yu's side (+x) is screen RIGHT and the door /
// Liu Bang's party is screen LEFT / centre; from the east cameras the door (south) is screen LEFT.
//
// A 9:16 frame is NARROW: at fov 46 it is only 0.48 m wide per metre of distance. No camera can hold all six seats
// with readable heads (a rig head is 0.47 m wide): Zhang Liang's seat is outside every north framing on purpose.
import * as THREE from "three";

export type Vec3 = [number, number, number];
/** a camera: structurally a story CamPose */
export type Cam = { pos: Vec3; look: Vec3; fov: number };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const cam = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });

// ------------------------------------------------------------------------------------------------- the seats (floor seating)
/** seat-pad top / low-table top above the floor, and how far the table's near edge is in front of the hip */
export const PAD_TOP = 0.10, DESK_TOP = 0.34, DESK_EDGE = 0.26;
/** a low lacquer table: w across the sitter, d away from him, h = DESK_TOP */
export const TABLE = { w: 0.70, d: 0.36, h: 0.34 };
/** a seat pad: w across the sitter (wider than the table so it shows beside it when the seat is empty), d front to back */
export const PAD = { w: 0.84, d: 0.62, h: 0.10 };

export type Role = "liu" | "zhang" | "fankuai" | "xiangyu" | "uncle" | "fanzeng";
export type Seat = {
  /** the rig's seat.top (the hip sits above this point; y = PAD_TOP) */ top: THREE.Vector3;
  /** which way the sitter faces */ facing: number;
  /** the rig's seat.deskEdge / seat.deskTop */ deskEdge: number; deskTop: number;
  /** the low table: centre of its TOP face, size, yaw */ table: { at: THREE.Vector3; w: number; d: number; h: number; ry: number };
  /** where the cup stands on the table (y = the table top) */ cup: THREE.Vector3;
  /** about where the seated head is (y 0.80): for aiming looks and cameras, not for posing */ head: THREE.Vector3;
};
const seat = (x: number, z: number, facing: number, cupSide = 0.2): Seat => {
  const fx = Math.sin(facing), fz = Math.cos(facing), lx = Math.cos(facing), lz = -Math.sin(facing), c = DESK_EDGE + TABLE.d / 2;
  return {
    top: V(x, PAD_TOP, z), facing, deskEdge: DESK_EDGE, deskTop: DESK_TOP,
    table: { at: V(x + fx * c, DESK_TOP, z + fz * c), w: TABLE.w, d: TABLE.d, h: TABLE.h, ry: facing },
    cup: V(x + fx * c + lx * cupSide, DESK_TOP, z + fz * c + lz * cupSide),
    head: V(x + fx * 0.08, 0.80, z + fz * 0.08),
  };
};
const FACE_N = 0, FACE_S = Math.PI, FACE_E = -Math.PI / 2, FACE_W = Math.PI / 2;
/** THE RING. Seats never change in the film.
 *    Xiang Yu (north end) and his uncle (south end) side by side on the WEST, facing east; the row is slanted (the uncle
 *    0.2 further out and 1.1 m south) so that from the master his face shows beside Xiang Yu's crest;
 *    Fan Zeng on the NORTH facing south (next to Xiang Yu: lines 10-11); Liu Bang on the SOUTH facing north, his
 *    back to the door; Zhang Liang on the EAST facing west, opposite Xiang Yu; Fan Kuai's seat beside Zhang Liang at the
 *    south end of the east row (next to the door and Liu Bang): EMPTY until Fan Kuai sits down (he only does if a shot needs it: in script v4 he
 *    stands or kneels on the floor from line 14 to 16) and at lines 19 and 21.
 *    Liu Bang sits 0.2 west of the axis so that the south-east corner (between his table and Fan Kuai's) is an open
 *    0.38 m gap: the ONLY way from the door onto the floor (ENTER.path). */
export const SEATS: Record<Role, Seat> = {
  liu: seat(0.2, -1.5, FACE_N, -0.2),          // his cup on his right (screen left from the master): the last picture of line 16
  fanzeng: seat(-0.3, 1.5, FACE_S),
  xiangyu: seat(1.15, 0.5, FACE_E),
  uncle: seat(1.35, -0.6, FACE_E),
  zhang: seat(-1.3, 0.5, FACE_W),
  fankuai: seat(-1.15, -0.5, FACE_W),
};
/** the free floor inside the four table fronts (the dance, the pig leg, the tray): 1.06 x 1.76 m */
export const DANCE = { x0: -0.53, x1: 0.53, z0: -0.88, z1: 0.88 };
/** the felt rug under the whole ring (so the lower fifth of the master is not bare floor) */
export const RUG = { x0: -2.0, x1: 2.1, z0: -2.1, z1: 2.5 };
/** the tent's inside walls and eaves height. The north and east walls are never seen (the cameras stand there). */
export const ROOM = { x0: -2.9, x1: 2.6, z0: -2.45, z1: 3.0, eaves: 2.4 };

// ------------------------------------------------------------------------------------------------- the door and the two ways through it
/** the door flap in the SOUTH wall, right behind Liu Bang's seat as the master sees it (x = centre, w wide, h high) */
export const DOOR = { x: -0.15, z: -2.45, w: 1.1, h: 1.95 };
/** LIU BANG'S EXIT (line 16): frames from the start of the move. Cup down 0..riseAt; rise riseLen frames (raise
 *  seat.top.y from PAD_TOP to dim.hipY - 0.028, drop deskEdge on the first frame); then walk the path at `speed` m/s
 *  with `turn` ramping 0 -> 1 over turnLen frames (turn 1 = his true facing: a back view walking away; without it the
 *  rig keeps him facing the camera, the forbidden band). Seat to the flap 1.0 m: he is gone ~1.3 s after he starts. */
export const EXIT = {
  riseAt: 8, riseLen: 6, turnLen: 10, speed: 1.3,
  path: [V(0.2, PAD_TOP, -1.5), V(0.08, 0, -1.85), V(-0.15, 0, -2.45), V(-0.15, 0, -3.1)],
};
/** THE WAY IN (the sword dancer line 12, Fan Kuai lines 14-15, the servant line 15, Zhang Liang line 19): through the east half of the door,
 *  north along the pocket beside Liu Bang's pad, through the south-east corner gap, onto the floor. `stand` = where
 *  Fan Kuai stops inside the flap and glares (line 14: frontal to the north cameras, against the bright doorway). */
export const ENTER = {
  stand: V(-0.48, 0, -2.05),
  path: [V(-0.48, 0, -3.1), V(-0.48, 0, -2.45), V(-0.48, 0, -2.05), V(-0.5, 0, -1.1), V(-0.34, 0, -0.86), V(-0.2, 0, -0.45)],
  /** script v4 line 14, seen from CAMS.door through the open doorway: the two guards stand OUTSIDE the flap with their
   *  backs to the room (`guards`); Fan Kuai rams them from `ramFrom` with the shield; each is knocked sideways to
   *  `guardsFlung` (0.8 m: behind the wall, out of the doorway's view = "fallen" without a lying pose), and he strides
   *  in to `stand` (1.9 m from `ramFrom`) */
  guards: [V(-0.43, 0, -2.95), V(0.13, 0, -2.95)], guardsFlung: [V(-1.25, 0, -3.0), V(0.95, 0, -3.0)], ramFrom: V(-0.2, 0, -3.9),
};
/** Fan Kuai's round shield (radius r): face down beside his pad when he is seated (`atSeat`: not used by script v4);
 *  face down on the floor in front of Xiang Yu's table as his chopping board (line 15) */
export const SHIELD = { r: 0.32, atSeat: V(-0.55, 0, -1.18), onFloor: V(0.17, 0, -0.12) };

// ------------------------------------------------------------------------------------------------- floor marks
/** the small gift table with the jade (lines 19, 21): on the floor in FRONT of Xiang Yu's table, w along x, d along z, top at h */
export const TRAY = { at: V(0.36, 0, 0.58), w: 0.28, d: 0.44, h: 0.20 };
export const MARKS = {
  /** Fan Kuai standing in front of Xiang Yu to be praised (line 15, first half) and kneel-sunk there at his chopping
   *  board (line 15, second half: facing west toward the shield and Xiang Yu); he leaves from here at line 16 */
  eat: V(-0.30, 0, -0.12),
  /** the servant with the pig leg (line 15): he walks ENTER.path and stops here, facing Fan Kuai */
  servant: V(-0.10, 0, 0.50),
  /** Zhang Liang bowing to Xiang Yu behind the tray (line 19): profile to the north cameras, facing west */
  gift: V(0.02, 0, 0.55),
  /** where Zhang Liang steps back to (out of the smash camera): not used by script v4 */
  giftAside: V(-0.40, 0, -0.30),
  /** (not used by script v4: the smashed cups are cut) Fan Zeng kneel-sunk in the gap between his table's west end and Xiang Yu's table corner (0.77 m from
   *  his seat: a seated Fan Zeng cannot reach any floor that a camera sees, his own table is in the way) */
  smash: V(0.30, 0, 1.02),
  /** where he puts the jade cups down and breaks them */
  cupsFloor: V(0.10, 0, 0.78),
};
/** THE DANCE (lines 12-13). The dancer salutes Xiang Yu and draws at `dancer` (facing west: profile to the north
 *  cameras); for line 13 he turns on the spot toward Liu Bang (a back view) and the uncle stands at `uncle`, on the line
 *  from the dancer to Liu Bang, facing north (the camera), arms spread. `unclePath`: he rises and leaves his pad by its
 *  north end, through the 0.4 m gap between his table and Xiang Yu's (the south-west corner is closed), 2.0 m. */
export const DANCE_MARKS = {
  dancer: V(-0.42, 0, 0.38),
  uncle: V(-0.05, 0, -0.55),
  unclePath: [V(1.35, PAD_TOP, -0.6), V(1.25, 0, -0.05), V(0.62, 0, -0.05), V(-0.05, 0, -0.55)],
  /** the uncle's wing hands: this high above the floor, 0.5 m to each side. LOWER than his shoulders, so that the
   *  seated Liu Bang's head shows ABOVE the wing from the dance camera */
  wingY: 0.92,
};

// ------------------------------------------------------------------------------------------------- outside (block-outs)
// Each outdoor place is its own island far from the tent (x 60, 90, 150), all seen from +z looking toward -z, so
// screen right is +x everywhere: Liu Bang's camp and his 100,000 are to the RIGHT, he leaves to the right.
// (All the islands along x: CARD -100, privy -60 (sets/privy.ts), NIGHT_X -30, the tent 0, NIGHT_L 30, tent door 60,
// gate 90, hill 150.)
const CX = 60;
/** OUTSIDE THE COMMAND TENT (line 2 second beat, line 17, line 19 first beat): the facade is a wall at z = facade.z, the door flap in it */
export const CAMP = {
  facade: { x: CX, z: -4, w: 9, eaves: 2.3, ridge: 3.8, ridgeZ: -6.4 },
  door: { at: V(CX, 0, -4), w: 1.2, h: 2.05 },
  /** two banner poles, this far left and right of the door, 0.5 m in front of the wall */
  poleDx: 2.2,
  /** line 17: Liu Bang comes out (liuFrom -> liu, 1.3 m, two steps) and turns; Zhang Liang and Fan Kuai flank him */
  out: { liuFrom: V(CX, 0, -3.0), liu: V(CX, 0, -1.7), zhang: V(CX - 0.75, 0, -1.5), fankuai: V(CX + 0.8, 0, -1.4) },
  /** (not used by script v4) Fan Zeng pulls the dancer aside, left of the door; he points at the door (screen right) */
  aside: { fanzeng: V(CX - 1.0, 0, -2.5), dancer: V(CX - 1.7, 0, -2.3) },
  /** line 19, first beat ("等刘邦到了军营"): Zhang Liang waits well in front of the tent (so that there is sky above the roof), the gift table at
   *  his feet; then he lifts it and starts toward `toDoor` */
  wait: { zhang: V(CX + 0.5, 0, 0.8), tray: V(CX + 0.05, 0, 0.7), toDoor: V(CX, 0, -3.6) },
};
const GX = CX + 30, GZ = -6;
const g = (x: number, z: number) => V(GX + x, 0, GZ + z);
/** THE CAMP GATE (lines 8, 9, 18), seen from INSIDE Xiang Yu's camp looking out through the gate: the palisade runs
 *  along z = GZ to the LEFT of the gate only; right of the gate is open country, where Liu Bang's 100,000 stand far off. */
export const GATE = {
  at: g(0, 0), w: 3.2, postDx: 1.8,
  palisade: { x0: GX - 16, x1: GX - 1.8 },
  /** line 8: Xiang Yu near, left; Liu Bang walks 2.2 m from the cart to him and bows; line 9: they stay there */
  xiangyu: g(0.0, 7.3), liuFrom: g(1.05, 4.95), liuTo: g(0.8, 7.1),
  /** the one horse (a silhouette behind the cart: its head shows above the cart; it leaves in line 18) and the retinue pawns */
  horse: g(1.2, 1.9), retinue: { at: g(2.2, 2.6), cols: 2, rows: 4, dx: 0.5, dz: 0.55 },
  /** "40万": pawns in front of the gate's left half, behind Xiang Yu (front-row centre; rows go back toward the gate);
   *  NOT USED by script v4 (the armies are on the CARD, line 4): keep them hidden at the gate */
  army40: { at: g(-0.6, 5.2), cols: 5, rows: 9, dx: 0.45, dz: 0.5 },
  /** "10万": far right, beyond the gate (front-row centre) */
  army10: { at: g(10.2, -30), cols: 4, rows: 7, dx: 0.5, dz: 0.6 },
  /** (not used by script v4: line 14 plays at the tent door, ENTER.guards) two guards in the gateway facing out */
  guards: [g(-0.85, 0.9), g(0.25, 0.9)], fanKuaiFrom: g(-0.3, -0.8), fanKuaiTo: g(-0.3, 2.0),
};
/** the cart, parked end-on to the camera from the first frame of line 8 and never moved (line 18: "丢下车队"): a box on an axle */
export const CART = { at: g(1.2, 3.4), w: 1.0, d: 1.8, h: 0.7, axle: 0.45 };
const HX = CX + 90, HZ = -60;
/** THE HILL PATH (line 18, second beat): a long-lens far shot; they run toward +x (screen right): the horse first, the four
 *  runners `gap0` + i * `gap` metres behind it along the path */
export const HILL = {
  path: [V(HX - 9, 0, HZ + 0.6), V(HX + 9, 0, HZ - 0.6)], len: 18, gap0: 2.2, gap: 1.5,
  hill: { at: V(HX + 5, 0, HZ - 28), rx: 40, rz: 22, h: 7 },
};

// ------------------------------------------------------------------------------------------------- script v4: line 2
/** LINE 2, first beat: the banquet FROZEN mid sword dance, seen from CAMS.master (the story moment of lines 12-13:
 *  Fan Kuai is not in yet, his seat is empty and there is no shield; the uncle's seat is empty, he is on the floor).
 *  Not DANCE_MARKS: from the master the uncle on DANCE_MARKS.uncle stands exactly in front of Liu Bang (rendered:
 *  Liu Bang was hidden). Here the three heads stand in a row, left to right: the dancer (18 % x), the uncle (38 %),
 *  Liu Bang seated (56 %), then Xiang Yu (79 %): blade, shield of a body, target, host. `cross` = the world point
 *  where the two blades cross (above and between the dancer and the uncle): each blade runs from its hand toward it. */
export const FREEZE = {
  dancer: V(-0.48, 0, 0.30), dancerFacing: 0.5,
  uncle: V(-0.15, 0, -0.45), uncleFacing: 0.1,
  cross: V(-0.34, 1.62, -0.1),
};
/** LINE 2, second beat ("还不在席上"): OUTSIDE the command tent, the black silhouette with the "?" (曹无伤's build and
 *  cap) stands beside the door flap, on the informer's side of the screen (RIGHT). CAMS.outside. Keep the wall from
 *  CX + 0.6 to CX + 2.2 free of dressing (no brazier, no rack: the gable cap must be the only shape there). */
export const SHADOW = { at: V(CX + 0.95, 0, -2.75), facing: -0.25 };

// ------------------------------------------------------------------------------------------------- script v4: the new places
// SCREEN SIDES outside the tent, in every place below: Xiang Yu's camp is to the LEFT, Liu Bang's camp to the RIGHT
// (as at the gate). Xiang Yu stands / sits screen LEFT; Liu Bang screen RIGHT; the uncle rides left -> right to Liu
// Bang's camp; Liu Bang comes home from the left. THE INFORMER LIVES ON THE RIGHT (lines 2, 5, 6, 9, 20): his figure,
// his name tag and his inset are always in the right half, the tag in the upper right.
const NX = -30;
/** NIGHT_X (lines 5-6): a corner of Xiang Yu's quarters at night. Two walls only: the back wall (z = wallZ) and the
 *  LEFT wall (x = wallX); the right side is open and dark (the informer came from there). Xiang Yu sits at a low
 *  table FACING THE CAMERA (+z), the table between him and us; a small oil lamp stands on the table's right end,
 *  low between the two faces (the only light: it is why the red officer reads red in a purple room).
 *  The informer kneels at his left ear (screen right), a little behind his shoulder line. */
export const NIGHT_X = {
  at: V(NX, 0, 0), wallZ: -1.35, wallX: NX - 1.75, wallH: 2.7, rug: { x0: NX - 1.6, x1: NX + 1.9, z0: -1.2, z1: 1.6 },
  /** Xiang Yu's seat (pad + table as in the banquet; his cup on his right = screen left) */
  seat: seat(NX - 0.34, 0, FACE_N, -0.24),
  /** the oil lamp on the table: its foot on the table top, the flame `flame` m above it */
  lamp: { at: V(NX - 0.06, DESK_TOP, 0.47), flame: 0.2 },
  /** a dark purple banner on the back wall behind the informer's head (dressing: darker than his red, no pattern
   *  between the two heads) */
  banner: { x: NX + 0.75, w: 0.6, y0: 0.9, y1: 2.3 },
  /** the informer: comes in from the right (`from` -> `at`, 1.2 m), sinks to a kneel (`sink` m: at.y = -sink) facing
   *  Xiang Yu, his head beside Xiang Yu's ear; line 6: he flinches back to `flinch` (still kneeling, 0.08 m:
   *  more puts his head off the frame) */
  informer: { from: V(NX + 1.5, 0, 0.1), at: V(NX + 0.33, 0, -0.1), facing: -0.9, sink: 0.38, flinch: V(NX + 0.41, 0, -0.12) },
  /** line 6: where Xiang Yu's right fist lands on the table (the cup beside it jumps) */
  slam: V(NX - 0.44, DESK_TOP, 0.42),
};
const LX = 30;
/** NIGHT_L (line 7 by night, line 20 by day): in front of Liu Bang's own tent: a RED tent front along z = tent.z, its
 *  door behind Liu Bang's night mark, a fire basket between the two men's marks (behind them), a red banner pole.
 *  NIGHT (line 7): the uncle walks in from the left (`uncleFrom` -> `uncle`, 1.7 m); Liu Bang stands at `liu`; the cup
 *  is raised at `toast` (between their heads, over the fire's glow), then the hands clasp at `clasp`.
 *  DAY (line 20): Liu Bang, just home, stands LEFT at `liuDay` and points right; the informer stands at `informer`
 *  between two red guards (`guards`, half a step behind him); the three march right along `exit` (2.2 m, out of
 *  frame); his cap rolls back in from `capFrom` and comes to rest at `cap` (1.3 m; on the ground BEHIND the feet line
 *  so that it lands above the caption band from CAMS.campDay). */
export const NIGHT_L = {
  at: V(LX, 0, 0),
  tent: { x: LX + 0.3, z: -2.3, w: 6.4, eaves: 2.2, ridge: 3.5, ridgeZ: -4.4 },
  door: { at: V(LX + 0.75, 0, -2.3), w: 1.1, h: 2.0 },
  fire: { at: V(LX - 0.12, 0, -1.45), r: 0.24, h: 0.62 },
  pole: { at: V(LX - 1.45, 0, -1.9), h: 4.2 },
  liu: V(LX + 0.42, 0, -0.45), uncleFrom: V(LX - 2.1, 0, -0.25), uncle: V(LX - 0.45, 0, -0.5),
  toast: V(LX - 0.02, 1.08, -0.4), clasp: V(LX - 0.02, 0.86, -0.4),
  liuDay: V(LX - 0.78, 0, -0.35),
  informer: V(LX + 0.5, 0, -0.7), guards: [V(LX - 0.05, 0, -1.0), V(LX + 1.05, 0, -1.0)],
  exit: [V(LX + 0.5, 0, -0.7), V(LX + 2.7, 0, -0.6)],
  capFrom: V(LX + 2.2, 0, -1.25), cap: V(LX + 0.8, 0, -1.25),
};
const KX = -100;
/** CARD (lines 3-4): DECISION: a 3D block-out, not a flat 2D card. One pale "sand table" board (沙盘) with the real
 *  figures standing on it as giant pieces, so Liu Bang and Xiang Yu are learned as the figures they are in the film.
 *  Two tableaux 6 m apart on the same board; the numbers are 2D overlay labels (CARD_LABELS).
 *  LINE 3 (`city`): a chest-high model of the capital's gate (a wall piece with an arch and a tower); Liu Bang stands
 *  at its right end and plants a RED flag in `socket` on the wall top. One red thing on one grey thing.
 *  LINE 4 (`versus`): seen from above, two columns of pawns side by side, ONE PAWN = 10,000 MEN: 40 charcoal pawns
 *  (cols x rows) behind Xiang Yu on the left, 10 red ones behind Liu Bang on the right: a bar chart made of soldiers. */
export const CARD = {
  board: { x0: KX - 7, x1: KX + 13, z0: -22, z1: 6 },
  city: {
    /** the wall piece: its centre on the ground, w along x, d along z; the tower sits on its middle */
    wall: { at: V(KX + 5.35, 0, -1.0), w: 1.7, d: 0.5, h: 1.0 }, tower: { w: 0.9, d: 0.56, h: 0.5, roof: 0.3 }, arch: { w: 0.46, h: 0.62 },
    /** the flag pole's foot on the wall top (the right end of the wall) and the pole's length; the flag flies to the right */
    socket: V(KX + 6.08, 1.0, -0.92), pole: 1.15, flag: { w: 0.62, h: 0.4 },
    /** he may walk in from the right (liuFrom -> liu, 1.15 m) with the flag, or stand there from the first frame */
    liu: V(KX + 6.47, 0, -0.74), liuFrom: V(KX + 7.6, 0, -0.5),
  },
  versus: {
    xiangyu: V(KX - 0.72, 0, 0), liu: V(KX + 0.74, 0, 0),
    /** front-row centre, columns across x, rows going back (-z) */
    army40: { at: V(KX - 0.72, 0, -1.0), cols: 4, rows: 10, dx: 0.4, dz: 0.46 },
    army10: { at: V(KX + 0.74, 0, -1.0), cols: 2, rows: 5, dx: 0.4, dz: 0.46 },
  },
};
/** the 2D overlays of line 4 on the 1080 x 1920 frame (centre x, centre y, text height in px): each number stands on
 *  the pale board just above its own block, in its block's colour (charcoal / red) with a white edge */
export const CARD_LABELS = {
  n40: { x: 335, y: 405, size: 130, text: "40万" }, n10: { x: 745, y: 548, size: 110, text: "10万" },
  /** Xiang Yu's name tag: beside his head on its right (over the dark front pawns; left of him the frame ends) */
  tagXiangyu: { x: 486, y: 850, text: "项羽" },
};
/** LINE 21: the picture-in-picture replay of line 9 (Xiang Yu at the gate, the speech bubble "曹无伤"), on the
 *  1080 x 1920 frame, over CAMS.two: above Xiang Yu's own head (he is at 77 % x / 54 % y) like a memory, clear of the
 *  top corner tag (top left, y < 240), of the caption band (1190-1498), of his plume and of the uncle's cap (y 730).
 *  `tail` = the tip of the pointer toward his head. `src` = the part of line 9's 1080 x 1920 frame (CAMS.gateXY) that it shows. */
export const INSET21 = { x: 330, y: 240, w: 690, h: 490, r: 28, tail: [790, 800] as [number, number], src: { x: 0, y: 590, w: 650, h: 462 } };
/** where the other fixed overlays live (px on 1080 x 1920): the source tag top LEFT from line 3 on; the informer's
 *  tag / inset in the upper RIGHT every time; captions 62-78 %; nothing that matters below 84 % or above 11 % */
export const SCREEN = {
  top: 210, capTop: 1190, capBottom: 1498, bottom: 1613,
  sourceTag: { corner: "tl" as const, y: 210 },
  /** line 9: the inset of the red officer that pops up at the gate (upper right, above the bowing Liu Bang, whose hat
   *  starts at y 720). Its content is a BUST of the informer rendered alone (cap top at 4 % of the inset's height, chin
   *  at 79 %, head 51 % of its width); the name tag slams across its lower edge like a name plate: name centred at
   *  `tag`, the role line 78 px lower */
  informerInset: { x: 620, y: 215, w: 400, h: 400, r: 28, tag: [820, 612] as [number, number] },
};

// ------------------------------------------------------------------------------------------------- the checked cameras
/** One tripod on the north side (master / two / floor share a position: only the aim and the lens change), two closer
 *  north set-ups (dance, door) and three east set-ups (jade, xy, smash). Captions sit at 62-78 % of the frame height:
 *  in every camera below the heads that matter are above 62 % and nothing that matters is below 84 %. */
export const CAMS = {
  /** THE MASTER (line 2 frozen with FREEZE, line 10 first beat, line 12 first beat, line 16 the exit).
   *  Liu Bang centre (head 14 % of the width) with the door behind him, Fan Kuai's seat far left, Xiang Yu right with
   *  his uncle behind him, Fan Zeng a low back view bottom left; Zhang Liang is out of frame. It does not move while Liu Bang
   *  leaves (line 16). */
  master: cam([1.3, 2.6, 5.2], [0.05, 0.3, -1.25], 46),
  /** the same tripod, tighter on Xiang Yu's corner: the TWO-SHOTS of line 15 (Fan Kuai standing at MARKS.eat, left;
   *  Xiang Yu right), of line 19 and, with INSET21, of line 21 (Zhang Liang bowing at MARKS.gift, left;
   *  Liu Bang's empty seat between them) */
  two: cam([1.3, 2.6, 5.2], [0.45, 0.75, 0.1], 40),
  /** the same tripod tilted down 24 degrees: THE FLOOR in front of Xiang Yu at mid-frame. Line 15, second half (the shield and
   *  the raw pig leg) */
  floor: cam([1.3, 2.6, 5.2], [0.42, 0.12, 0.15], 35),
  /** line 12 second beat and line 13: the dancer (left), the uncle (centre, facing us, wings), Liu Bang seated behind the wing (right) */
  dance: cam([0.95, 2.25, 2.9], [-0.35, 0.75, -0.9], 50),
  /** line 14 (ENTER.guards, then ENTER.stand): Fan Kuai in the doorway against the daylight, Liu Bang seated lower right */
  door: cam([-0.3, 1.45, 1.95], [-0.2, 0.72, -2.0], 44),
  /** line 11 (and the end of line 10, after jadeIn): from the east, Xiang Yu far left (frontal), Fan Zeng near right; the jade is held up between them */
  jade: cam([-3.6, 1.6, 1.6], [0.3, 0.5, 1.15], 40),
  /** (not used by script v4) Xiang Yu alone, frontal, from above Zhang Liang's head: the hand on the hilt (his right hip = screen left) */
  xy: cam([-1.75, 1.5, 0.1], [1.15, 0.75, 0.42], 40),
  /** (not used by script v4) from the east, high: Xiang Yu behind left, Fan Zeng kneeling right, the gift table and the cups on the
   *  floor at mid-frame (Zhang Liang's seat in the foreground is empty: he stands at MARKS.giftAside, out of frame) */
  smash: cam([-3.9, 2.0, 0.95], [0.12, 0.1, 0.8], 38),
  // ---- outside
  /** line 17: three standing in front of the tent wall (no sky: a plain backdrop for the dialogue) */
  tentDoor: cam([CX + 0.1, 1.5, 4.0], [CX, 1.0, -1.7], 40),
  /** (not used by script v4) the two-shot beside the door */
  aside: cam([CX - 1.2, 1.45, 2.0], [CX - 1.25, 1.05, -2.4], 40),
  /** line 19, first beat: a wide, level shot from low down: Zhang Liang small, the tent behind him, the top third is sky for the sun */
  tentSky: cam([CX + 0.9, 0.9, 10.5], [CX + 0.45, 0.95, 0], 46),
  /** line 8 and line 18 first beat: eye level, so every head is on the horizon line and the ground under the captions is empty */
  gate: cam([GX + 0.7, 1.3, GZ + 11.5], [GX + 0.95, 1.05, GZ], 50),
  /** (not used by script v4) close on the gateway (the cart is out of frame to the right) */
  gate9: cam([GX - 0.2, 1.4, GZ + 4.4], [GX - 0.3, 1.1, GZ + 0.3], 40),
  /** line 18, second beat */
  hill: cam([HX, 2.5, HZ + 35], [HX, 0.8, HZ], 24),
  /** line 17: the END of an eased push-in from tentDoor on Fan Kuai's answer: Liu Bang left, Fan Kuai right (Zhang
   *  Liang leaves the frame on the left) */
  tentDoorIn: cam([CX + 0.45, 1.45, 2.6], [CX + 0.4, 1.0, -1.6], 40),
  // ---- script v4: the new places (block-outs with the real cast; /home/user/hm_work/g1/sheet_v4.png)
  /** line 2, second beat: the silhouette beside the tent door: figure 65 % x, head 43 % y, 26 % wide; the "?" above it
   *  at (702, 470) px; the lit door flap fills the left 45 % */
  outside: cam([CX + 0.75, 1.45, 1.6], [CX + 0.7, 1.0, -2.6], 40),
  /** line 3: the capital's gate (left, runs out of the frame), the red flag above the middle, Liu Bang right
   *  (66 % x, head 42 % y, 26 % wide) */
  card3: cam([KX + 6.2, 1.5, 3.6], [KX + 6.2, 0.95, -0.9], 40),
  /** line 4: from above (27 degrees down): Xiang Yu 27 % x and Liu Bang 74 % x (heads 46 % y, 15 % wide), the 40
   *  pawns behind him up to 27 % y, the 10 red ones up to 34 % y */
  card4: cam([KX, 4.0, 7.2], [KX, 0.25, -1.8], 40),
  /** lines 5-6: the two-shot: Xiang Yu 29 % x / 44 % y, the informer 69 % x / 40 % y, both heads 31 % wide; the table
   *  top and the lamp end at 61 % y (above the captions) */
  nightX: cam([NX + 0.2, 2.0, 3.9], [NX - 0.02, 0.56, -0.1], 36),
  /** line 6: the END of an eased push-in on the slam (from nightX, 8-10 frames): never a cut from nightX */
  nightXin: cam([NX + 0.2, 1.92, 3.5], [NX + 0.04, 0.58, -0.1], 36),
  /** line 7: eye level: the uncle 31 % x, Liu Bang 70 % x (heads 45 % y, 21 % wide), the fire between them, the
   *  clasped hands at 54 % y; the uncle walks in from outside the left edge */
  campNight: cam([LX - 0.02, 1.35, 4.9], [LX - 0.02, 1.02, -0.5], 40),
  /** line 20: raised (16 degrees down) so that the ground behind the feet is above the captions: Liu Bang 14 % x,
   *  guard 44 %, the informer 65 %, guard 84 % (heads 40 % y, 17-19 % wide); the cap comes to rest at 73 % x / 59 % y */
  campDay: cam([LX + 0.12, 2.5, 5.6], [LX + 0.12, 0.75, -0.7], 40),
  /** line 20, the END of an eased push-in (from campDay, >= 24 frames, after the three have left the frame): the cap
   *  alone on the ground in front of the red tent's door flap */
  campDayIn: cam([LX + 0.53, 2.1, 3.4], [LX + 0.56, 0.27, -1.2], 40),
  /** line 9 (and the source of line 21's inset): the long lens from the gate camera's place: Xiang Yu 25 % x / 44 % y
   *  (33 % wide), the bowing Liu Bang's head lower right (79 % x / 52 % y); the upper right is free for the inset */
  gateXY: cam([GX + 0.6, 1.4, GZ + 11.6], [GX + 0.36, 1.1, GZ + 7.3], 32),
  /** line 10, second half: the START of an eased pull-back to `jade`: Fan Zeng alone, glaring screen left (at Liu
   *  Bang), head 44 % x / 51 % y, 50 % wide */
  jadeIn: cam([-2.5, 1.35, 1.2], [-0.3, 0.78, 1.5], 40),
} satisfies Record<string, Cam>;
export type CamName = keyof typeof CAMS;

/** shared framings, as arthur STAGE: Liu Bang's exit seen from the master and what must be left in the picture */
export const STAGE = {
  /** line 16: `cam` does not move while he leaves; at the end the frame holds his table with the cup
   *  (SEATS.liu.cup), his empty pad and the closed flap. (The key is still called `hook`: it was the old opening.) */
  hook: { cam: CAMS.master, exit: EXIT, seat: SEATS.liu },
};
