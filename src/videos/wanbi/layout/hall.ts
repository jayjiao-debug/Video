// THE HALL 章台 (place "hall", island x 0): BIBLE section 3 (the marks and the set's numbers) and section 4 (the 15
// hall cameras). NUMBERS ONLY: sets/hall.ts builds from this file and the shots pose from it; nobody types a mark or a
// camera by hand. Re-exported by layout.ts (HALL, HALL_SET, HALL_CAMS).
// Created by WP1b (block-out); owned by WP2 from then on: WP2 corrects numbers here and writes the holds it measured
// as comments next to each camera.
//
// WP1b CORRECTIONS to BIBLE 3 (the clearance checker found these on the block-out; BIBLE keeps the old numbers):
//   pillar (1.21, 0, -0.74) -> (1.21, 0, -0.60): his head was 4 cm into E1, his robe in E1's plinth
//   ladyB (-0.36, 0.30, -5.12) -> (-0.36, 0.30, -5.22), the screen z -5.35 -> -5.45, the armrest z -4.78 -> -4.72:
//     her robe was 5.5 cm into the cushion and 4.6 cm into the armrest (the 榻 and the screen left her 0.33 m)
//   ladyA x -0.78 -> -0.83, give x 0.78 -> 0.82: their robes were 1.5 cm into the 榻's ends
//   kingMap (-1.05, 0, -3.15) -> (-1.05, 0, -2.65): he stood in the map stand's west post and 10 cm into W2
//   minA (-1.90, 0, -3.10) -> (-1.95, 0, -3.05): robe 1.6 cm into W2's plinth
//   guardC (1.90, 0, -0.90) -> (1.95, 0, -0.45): his halberd went 7 cm into E1 (his mark stays outside hallDoor and
//     hallMid: 133 % and 164 % x)
// The holds of presentTwo, hallWide, map, stageTwo and ministers that name these marks were BIBLE's; WP2 re-measured
// every camera on the real set (the "Measured (WP2)" notes at HALL_CAMS).
//
// WP2 CORRECTIONS (the real set; BIBLE keeps the old numbers):
//   HALL_SET.wallH 3.9 -> 4.5 and pillar.h 3.6 -> 4.5: the north wall's top showed in hook / retreat, W1's / E1's tops
//     in hallWide / retreat
//   HALL_SET.grid, wall, door.frame / proud, mapStand.mat, ceremony: the real set's own numbers (the floor's stone
//     grid, the painted wall, the door frame, the official's straw mat, the banners / runner / drum), added by WP2
//   HALL_CAMS.throne: look (-0.20, 0.75, -4.64) -> (-0.24, 0.89, -4.44) (the king sat at 63/31, BIBLE 63/34)
//   HALL_CAMS.map: new camera (the king was cut at the left edge after kingMap moved)
//   HALL_CAMS.linStage: new camera (the map sheet's edge was in frame at 20 % x)
//   minA (-1.95, 0, -3.05) -> (-2.55, 0, -2.90), minB (-2.45, 0, -3.40) -> (-2.38, 0, -3.84), minC (-1.90, 0, -2.10) ->
//     (-2.66, 0, -1.70): from every camera south of the hall they stood straight behind W1 (hallWide: W1 hid all
//     three); they now line the west aisle, clear of W1 / W2, the banners, the drum and guardL, and still outside every
//     other camera that has them placed (presentTwo, linClose, retreat, throne, linMid, hallMid, hallDoor)
//   HALL_SET.ceremony.drum (-2.4, 0, -4.6) -> (-2.05, 0, -4.83): it stood behind minA's head in hallWide (17a)
//   guardR (2.70, 0, -5.00) -> (3.05, 0, -4.95): in retreat (10a) E1 hid him all but his halberd's blade, which hung
//     in the air at E1's left edge; now his head and right side show at E1's right edge (head 87/35), the halberd
//     behind the pillar. Still outside hallWide (128 %), presentTwo and linClose
//   HALL_CAMS.hallWide: (0.20, 4.80, 4.40) -> (-1.00, 5.55, 6.08), look (-1.03, -0.31, -2.94), fov 43.3 (W1 in line
//     with W2, between the ministers and the throne)
//   HALL_CAMS.ministers: new camera for the new marks (W1 covered minC and minB)
//
// Conventions (group/kit/rig3d): metres, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x; the
// person's LEFT is +x when facing 0. The hall: floor x -3.4..3.4, z -6.0..3.4; north wall z -6.0; east wall x 3.4
// with the east door; the south wall is hidden by setView (the cameras stand there). QIN IS LEFT, ZHAO IS RIGHT: the
// king is always screen-left of the envoy; the envoy comes and goes by the east door (screen right).
import * as THREE from "three";
import type { Cam, TaSeat } from "../layout";

type Vec3 = [number, number, number];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const c = (pos: Vec3, look: Vec3, fov: number): Cam => ({ pos, look, fov });

// ------------------------------------------------------------------------------------------------- the set's numbers
/** what sets/hall.ts builds (BIBLE 3). x0..x1 / z0..z1 = extents, top = the top face's height */
export const HALL_SET = {
  floor: { x0: -3.4, x1: 3.4, z0: -6.0, z1: 3.4 },
  /** the stone floor's grid (painted, sets/hall.ts floorTex): square stones `size` m with a lighter grout `grout` m
   *  wide; a grout line runs through x = ox and z = oz (so a stone sits centred under the 榻's axis x 0 and a line
   *  runs along the step's front edge) */ grid: { size: 0.6, grout: 0.02, ox: 0.3, oz: -3.75 },
  /** wall height: 4.5 (BIBLE 3.9: the north wall's top showed at the top of hook (y 0-1 %) and retreat (4-5 %); 4.5
   *  is above every frame, and hallWide (4.8 high) does not see it either) */ wallH: 4.5,
  /** the painted wall (charcoal plaster): a dark dado to `dado` m with a gold line on top, a gold frieze band
   *  frieze[0]..frieze[1] m, dark lacquer pilasters `pilaster` m wide every `tile` m (on the side walls in line with the
   *  pillar rows z -1.10 / -3.30, on the north wall at x +-2.45, half way between the screen and the corners) */
  wall: { tile: 2.2, pilaster: 0.18, dado: 0.9, frieze: [2.80, 2.95] as [number, number], thick: 0.2 },
  /** the east door in the east wall x 3.4: centre z, width, height; bright daylight beyond; a black lacquer frame
   *  `frame` m wide standing `proud` m out of the wall (round the opening, never inside it) */
  door: { x: 3.4, z: -2.3, w: 1.3, h: 2.5, frame: 0.16, proud: 0.04 },
  dais: { x0: -1.6, x1: 1.6, z0: -5.5, z1: -4.0, top: 0.30 },
  /** one step in front of the dais, 0.15 high */ step: { x0: -1.2, x1: 1.2, z0: -4.0, z1: -3.75, top: 0.15 },
  /** the king's low platform seat 榻: black lacquer with a gold edge, 0.10 above the dais */ ta: { x0: -0.60, x1: 0.60, z0: -4.95, z1: -4.15, top: 0.40 },
  /** the cushion on the 榻 (the seat's top 0.50 = PAD_TOP above the 榻); its mesh is named "...pad" (the clearance
   *  checker's soft cushion) */ cushion: { x: 0, z: -4.70, w: 0.66, d: 0.58, top: 0.50 },
  /** 凭几, the low curved elbow-rest on the king's right (screen left), standing on the 榻; long along z */ armrest: { x: -0.40, z: -4.72, top: 0.62, len: 0.45 },
  /** the gold screen behind the 榻 (muted gold, black cloud-scroll border), standing on the dais */ screen: { z: -5.45, w: 2.8, h: 2.3, col: "#b8913a" },
  /** the four vermilion pillars: diameter, height, colour, the black stone plinth (w, h), the gold band's height. Height
   *  4.5 = the walls' (BIBLE 3.6: W1's top showed at the top of hallWide (y 3.6 %), E1's in retreat (2.5 %)) */
  pillar: { d: 0.44, h: 4.5, col: "#b8322a", plinth: { w: 0.56, h: 0.12 }, band: 2.6 },
  /** E1 = THE PILLAR (lines 1, 10, 11, 15); W1, E2, W2 */
  pillars: { E1: V(1.41, 0, -1.10), W1: V(-1.41, 0, -1.10), E2: V(1.41, 0, -3.30), W2: V(-1.41, 0, -3.30) },
  /** the map stand (12b-15, setMapStand): a black lacquer frame, its bar at y 1.60, 0.95 wide; the silk hangs from the
   *  bar (the prop mapScroll, put at HALL.mapBar; the bar's underside is 5 mm into the top roller so the scroll hangs
   *  from it); `mat` = the official's spot, a straw kneeling mat flush with the floor round HALL.official (w along x,
   *  d along z) */ mapStand: { x: -0.45, z: -3.30, bar: 1.60, w: 0.95, mat: { x: -0.45, z: -3.00, w: 0.70, d: 0.56 } },
  /** the ceremony dressing (17-22, setCeremony): eight banners at x +-3.15 and these z (clear of the east door
   *  z -1.65..-2.95); the woven mat runner; the bronze drum on its stand */
  //  The banners are the kit's carried banner (src/kit/props/things.ts banner: pole 2.3, cloth 0.38 x 0.96 hanging from
  //  2.19) in a lacquer foot `bannerFoot` m square; each cloth hangs toward the middle of the hall and faces +z. The
  //  runner is LET INTO the floor (one level: it replaces the floor's middle strip while the ceremony is on). The drum
  //  (卧鼓): a barrel `drum.len` long, radius `drum.r` (heads `drum.rh`), its axis `drum.y` high and turned `drum.yaw`
  //  from facing +z toward the middle of the hall, on a lacquer cradle
  ceremony: {
    bannerX: 3.15, bannerZ: [-4.4, -3.4, -1.2, -0.2], bannerFoot: 0.26,
    runner: { x0: -0.6, x1: 0.6, z0: -3.75, z1: 2.0, border: 0.07 },
    drum: V(-2.05, 0, -4.83), drumSize: { r: 0.30, rh: 0.26, len: 0.42, y: 0.86, yaw: 0.55 },
  },
};

/** the king's seat on the 榻 (rig3d RigSeat fields + facing): seated head (0.01, 1.26, -4.71) (measured, WP1b); for a
 *  hand-over he sits forward (back -0.10) and gives / takes with his LEFT hand (hand 1) at HALL.meet (rig.qa reach 0;
 *  his right hand cannot cross to it); half-risen (seated(.., { rise: 0.45 }), held: the hook and 10a) head
 *  (0.01, 1.47, -4.71) */
const SEAT: TaSeat = { top: V(0, 0.50, -4.72), floor: 0.40, back: 0.03, facing: 0 };

// ------------------------------------------------------------------------------------------------- the marks
export const HALL = {
  seat: SEAT,
  /** about where the seated king's head is (for aiming, not posing) */ kingHead: V(0.01, 1.26, -4.71),
  /** the half-risen king's head (the hook, 10a) */ kingHeadRisen: V(0.01, 1.47, -4.71),
  /** the king's hook hands (frame 0, shot 11): x, z in his body frame (from the seat's top point, facing 0), y world
   *  height; one hand each side */ kingHookHand: { x: 0.22, y: 1.50, z: 0.25 },
  /** the 凭几's top centre (a lounging hand rests on it) */ armrestTop: V(-0.40, 0.62, -4.72),
  // ---- the ladies: on the dais WEST of the king (the jade goes left, away from Zhao)
  ladyA: V(-0.83, 0.30, -4.50), ladyB: V(-0.36, 0.30, -5.22),
  /** lady A takes and returns the jade here: the hands of her salute bow (shots/common salute(1, ladyA, PI / 2):
   *  0.36 in front of her, +-0.05) and the king's right hand (hand 0) both reach it (rig.qa reach 0) */ pass: V(-0.47, 1.10, -4.50),
  // ---- the Qin ministers down the west aisle, facing 0.9 (in frame only in hallWide and ministers; WP2 moved them out
  //      from behind W1, see the header)
  minA: V(-2.55, 0, -2.90), minB: V(-2.38, 0, -3.84), minC: V(-2.66, 0, -1.70), minFacing: 0.9,
  // ---- guards: guardL / guardR in segment B; ONE guard guardC (QIN_GUARD_B) in the ceremony, striding to guardGrab
  guardL: V(-2.95, 0, -4.55), guardR: V(3.05, 0, -4.95), guardC: V(1.95, 0, -0.45), guardGrab: V(0.85, 0, -1.95),
  /** the usher (17a): from off-screen right to here, then back out by the east door */ usher: V(0.80, 0, -2.85),
  // ---- the envoy
  enter: V(2.20, 0, -2.60), present: V(0.55, 0, -3.45),
  /** ON the dais east of the 榻, facing giveFacing; hand-overs meet at HALL.meet (the king sitting forward) */
  give: V(0.82, 0.30, -4.40), giveFacing: -1.06, meet: V(0.40, 1.10, -4.50),
  mid: V(0.45, 0, -2.30), retreatTurn: V(0.95, 0, -0.45),
  /** back and left shoulder against E1's south-west face, facing pillarFacing; head (1.22, 1.23, -0.60) */
  pillar: V(1.21, 0, -0.60), pillarFacing: -0.45, exit: V(2.70, 0, -2.30),
  // ---- the jade at the pillar (frame 0): hand 1 (his left, screen right) grips the disc's bottom edge
  //  WP1b: BIBLE's marks were out of his reach (a rig arm is 0.39 m from a shoulder at y 1.0: rig.qa reach 0.06, the
  //  strike 0.15): slid toward the hook camera along its ray (the same screen point) and 0.08 m down (2 % of the
  //  frame), then 0.04 m south with him. Edge to the lacquer 0.18 m in depth; on screen the disc still overlaps E1.
  jadeHand0: V(1.56, 1.2325, -0.59),
  /** the disc's centre at frame 0 (hook 71/37) */ jade0: V(1.56, 1.36, -0.59),
  /** the wind-up (up and toward screen LEFT; hook 65/35; reach 0 at any facing -0.45..0) */ jadeWind: V(1.46, 1.41, -0.46),
  /** the strike (toward E1; hook 76/39, at E1's right edge; edge to the lacquer 0.185 m in depth): the hand reaches
   *  it once he turns to facing -0.30 or more (rig.qa reach 0.005; at pillarFacing -0.45 it is 0.017) */ jadeHit: V(1.64, 1.30, -0.62),
  // ---- the map (12b-15)
  /** the middle of the map stand's bar: the mapScroll's origin */ mapBar: V(-0.45, 1.60, -3.30),
  /** the official (QIN_MIN_C as 有司) kneels here in a back view, holding the bottom roller at (+-0.25, 1.00) */ official: V(-0.45, 0, -3.00),
  /** the king stands here at the map (south of W2 and of the stand's west post) */ kingMap: V(-1.05, 0, -2.65),
  /** the cauldron (19-22): left of mid, between him and the ministers */ cauldron: V(-0.35, 0, -2.25),
};

// ------------------------------------------------------------------------------------------------- the cameras
/** BIBLE section 4. Holds = head centre x % / y % / head width % of the frame (a rig head is 0.47 m wide). The holds
 *  measured on the WP1b block-out (segment A only: hook, kingWave) are written after "measured". */
// Measured (WP2) = the hold measured headless on the real set (sets/hall.ts) with the block-out figures on their marks
// (preview/set_hall.ts stageHall; the qa projects head / feet / landmarks): x/y = % of the frame, then the figure's
// height as % of the frame. Every camera: no wall top and no pillar top in frame (wallH / pillar.h 4.5).
export const HALL_CAMS = {
  /** shots 1, 11 (push fov 28 -> 26). Envoy at pillar 51/42, 27 %; king half-risen 15/42, 18 % (hands 2-26 % x); jade
   *  71/35, wind-up 65/33, strike 78/37 (141 px across); E1 51-75 % x, just right of his head; dais step 68 % y.
   *  Placed: envoy, king only. Measured (WP2): envoy 51/42, 27.5 %; king 16/41, 17.6 %; jade 71/37; E1 51-75 % x, E2
   *  behind it (55-73); the gold screen -26..64 % x behind the king; dais step 68.5 % y; north wall top -9 % (off). */
  hook: c([1.50, 0.90, 5.50], [1.00, 1.02, -4.60], 28),
  /** shot 2. King half-risen 38/44, 39 %; the gold screen fills the back. Measured (WP2): king 39/42, 38 %; the screen
   *  -46..129 % x, y 3-84 % (fills the back); no pillar in frame */
  kingWave: c([0.25, 1.38, -1.07], [0.16, 1.28, -4.64], 36),
  /** 7a, 8a, 17a. High, frontal: king 72/27, 12 %; give 91/24, 11 %; ladyA 54/23, ladyB 65/20; minA 21/33, minB 9/31,
   *  minC 14/40; guardL 5/25 (guardR out); drum 18/30; envoy at present 85/33, at mid 82/41, 14 %; usher 92/37.
   *  WP2: BIBLE's camera (0.20, 4.80, 4.40) -> (-0.70, 0.30, -2.60), fov 44 put W1 (13-28 % x) in front of all three
   *  ministers (no camera south of the hall clears them: they stood 1-2.3 m straight behind W1). The ministers moved
   *  down the west aisle (HALL.minA / minB / minC) and the camera moved 1.2 m west and back, in line with the west
   *  pillars: W1 and W2 now stand as ONE red column in the middle of the frame, Qin's ministers left of it, the throne
   *  right of it. Measured (WP2): king 71/25, 10 %; give 88/23; ladyA 54/23, ladyB 63/20 (9-9.5 %); minA 15/34, minB
   *  22/29, minC 9/41 (10-12 %); guardL 12/26; guardR 122 % (out); envoy at present 84/31, 10 %, at mid 85/37, 11 %;
   *  usher 92/34; enter 125 % (out); W1 34-46 % x, W2 37-47 % (one band); E1 / E2 99-121 % (out); the gold screen
   *  43-94 % x, y 8-31 %; the door 144-172 % (out); pillar tops 8 % and the north wall top 17 % above the frame.
   *  Ceremony (17a): the drum 31/28 (between minB and the pillar band); banners W z -4.4 11/21 and W z -3.4 7/26 at
   *  the left edge above the ministers, the others outside; the runner down the middle */
  hallWide: c([-1.00, 5.55, 6.08], [-1.03, -0.31, -2.94], 43.3),
  /** 7b, 9. King 50/44, 22 %; ladyA 15/36; ladyB 32/37; envoy at give 86/37, at present 88/45; meet 68/47; pass 31/47.
   *  Measured (WP2): king 50/43, 22 %; ladyA 13/37, 22 %; ladyB 32/37, 19 %; envoy at give 88/36, 21 %; present
   *  88/45; meet 68/47; pass 29/47; mid 105 % (out); W2 -37..-10 % (out), E2 124-148 % (out) */
  presentTwo: c([-0.75, 1.45, 0.90], [0.00, 0.98, -4.55], 40),
  /** 8b. Envoy at mid 50/38, 47 % (the king hidden behind him). Measured (WP2): envoy 51/38, 47 %; the seated king
   *  51/35 is behind him (hidden); E1 / E2 beyond the right edge (123 %+) */
  linClose: c([1.05, 1.30, 0.95], [0.45, 1.01, -2.29], 30),
  /** 10a. High from the south-west: king half-risen 29/34, 10.5 %; give 46/33; envoy at pillar 76/46, 14.5 %.
   *  Measured (WP2): king 29/33, 10.5 %; give 47/33; envoy at pillar 78/46, 14.7 %; jade 88/44; ladies 12/33, 21/32;
   *  guardR 87/35, 9 % (his head and right side at E1's right edge, the halberd behind E1); E1 72-85 % x, E2 59-69 %;
   *  W1 / W2 at the left edge (-13..3 %); the ministers outside (-24 % and less); the door 108-128 % (out); north wall
   *  top -1.4 % (off, 27 px above the frame) */
  retreat: c([-0.80, 2.80, 6.00], [0.60, 0.60, -2.20], 44),
  /** 10b. ON THE HOOK'S AXIS, 1.7x: envoy 51/42, 46 %; the raised jade 85/29 in front of E1. Placed: envoy only.
   *  Measured (WP2): envoy 52/41, 47.5 %; the jade at jadeHand0 86/34 (WP1b's corrected jade marks; 5 points lower
   *  than BIBLE) in front of E1 51-90 % x */
  pillarClose: c([1.38, 1.03, 2.93], [0.88, 1.15, -7.17], 28),
  /** 12a, 17b, 18b, 21a. High from the south-west: king seated 63/34, 34 %; cauldron rim 79/84 (21a).
   *  WP2: the look point was (-0.20, 0.75, -4.64) (BIBLE): the king sat at 63/31; lowered to y 0.89 and moved to x
   *  -0.24, z -4.44 (pos and fov kept). Measured (WP2): king seated 63/34, 33 %; the empty 榻 63/44; ladies' spots 8/27,
   *  35/23; cauldron rim 79/87 (21a); envoy at mid 168/66 (out); W2 / E2 outside; the screen fills the back */
  throne: c([-1.00, 2.30, 0.20], [-0.24, 0.89, -4.44], 30),
  /** 12b. King at kingMap 28/33, 33 %; the sheet x 42-95 %, y 23-46 %; the official (back view) 60/53.
   *  WP2: BIBLE's camera (1.00, 1.60, 0.60) -> (-0.74, 0.85, -3.29), fov 36 cut the king at the left edge (11/35)
   *  after WP1b moved kingMap to z -2.65; it now stands further back and longer (fov 30), 31 deg off the throne axis.
   *  Measured (WP2): king at kingMap 23/35, 31 %; the sheet x 47-94 %, y 24-44 %; the official (back view) 64/51,
   *  28 %; W2 9-33 % x behind the king; the screen 61-182 % x behind the sheet; the drum 8/43 (ceremony off: unseen);
   *  envoy at pillar 158 % (out) */
  map: c([1.41, 1.58, 2.21], [-0.75, 0.81, -3.12], 30),
  /** 13, 15. King at kingMap 22/37, 18 %; the map 28-57 % x; official 43/46; envoy at mid 79/39, 18 %; empty 榻 53/38.
   *  Measured (WP2): king at kingMap 22/37, 19 %; the sheet 28-57 % x, y 31-43 %; official 43.5/47, 16.5 %; envoy at
   *  mid 80/39, 18 %; empty 榻 53/41; W1 / W2 at the left edge (-6..17 %), E2 97-111 % (a sliver at the right edge) */
  stageTwo: c([-1.00, 1.50, 4.75], [-0.28, 0.68, -2.70], 36),
  /** 14. Envoy at mid 56/36, 53 %.
   *  WP2: BIBLE's camera (0.55, 1.30, 0.45) -> (0.40, 1.00, -2.28), fov 32 showed the map sheet's right edge at 20 % x
   *  (the storyboard keeps the map and the official outside): moved west and longer, 17 deg off the throne axis.
   *  Measured (WP2): envoy at mid 56/36, 53 %; the sheet's right edge -14 %, its post -5 % (out); the official -52 %
   *  (out); the king -122 % (out); E2 88-125 % x (a vermilion strip at the right edge, behind him) */
  linStage: c([-0.63, 1.31, 1.18], [0.54, 0.97, -2.75], 24.5),
  /** 18a. Envoy at mid 55/36, 52 %. Measured (WP2): envoy 56/36, 52.5 %; the seated king 55/33 hidden behind him; the
   *  usher's mark 97/35 is in frame: he must be gone by 18a (shots/seg owner) */
  linMid: c([0.95, 1.30, 0.45], [0.41, 1.00, -2.28], 32),
  /** 19, 20b, 21b. Envoy at mid 61/36, 19 %; king seated 42/30, 15 %; cauldron rim 28/42; guardGrab 79/37.
   *  Measured (WP2): envoy at mid 61/36, 19 % (feet 62 %); king seated 42/29, 15 %; cauldron rim 28/42, base 63 %;
   *  guardGrab 79/37, 21 %; guardC's mark 161 % (out); E2 83-99 % x; banners outside (W -49 %, E 131 %) */
  hallMid: c([0.00, 2.10, 3.00], [0.20, 0.50, -2.60], 44),
  /** 20a. minC 30/47, 48 %; minB 38/27, 35 %; minA 68/32, 39 %.
   *  WP2: BIBLE's camera (-0.40, 2.40, 0.80) -> (-2.00, 0.90, -2.80), fov 28 looked through W1 at minC and minB; the
   *  ministers' new marks (see hallWide) take a new camera: high from the south-east of them, looking up the west
   *  aisle past W1 (W1, W2 outside the frame). Faces 36-45 deg off the lens (minFacing 0.9: 3/4 views). Measured
   *  (WP2): minC 29/50, 38 % (front left; feet 96 %); minA 58/32, 32 %; minB 79/21, 28 %; banners W z -4.4 54/0 and
   *  W z -3.4 40/8 at the top edge (ceremony on); the drum 105 % (out); the king, the envoy, guardC outside */
  ministers: c([-1.39, 3.32, 2.74], [-2.66, 0.72, -2.81], 24.3),
  /** 22. From the WEST: envoy from mid (8/46, 26 %) to exit (66/41, 18 %), a back view; the bright door 57-99 % x.
   *  Measured (WP2): envoy at mid 8/46, at exit 65/41, 18 %; the door 57-100 % x, y 13-63 %; E1 79-102 %; E2 -7..12 %;
   *  banners E z -4.4 9/31 and z -3.4 36/31 (BIBLE 13/33, 40/33); the cauldron only a sliver at the left edge (its
   *  centre -24/58); W1 at the left edge (-51..-2 %, out) */
  hallDoor: c([-2.90, 1.70, 0.60], [2.55, 0.81, -2.68], 40),
};
