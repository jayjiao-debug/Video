// THE HALL (place "hall", island x 0): one floor of the Sihang Warehouse, scenes A to G. A concrete box 16 x 13 m under
// a 4.3 m slab on six mushroom columns; the south wall's three windows walled up with grain sacks, a firing slit left in
// each (through them: the creek and the Settlement, sets/common.ts buildBank); the west wall with scene D's window and
// scene G's shell hole; the east wall's hole to the shop next door (scene F's rope); the north wall's back door; grain
// sacks piled to the ceiling (it was a warehouse, and it was full); ammunition crates; kerosene lanterns.
// PARAMS
//   time   "night" | "eve" | "day" | "dawn" | "siege"   the light, the lamps, the south bank's hour
//   lamp   "south" | "desk" | "letter" | "mid" | "east" | "none"   which lantern the one real point light sits in
//   board  0 | 1 | 2      the blackboard the south bank holds up (common.ts BOARDS)
//   cheer  0..1           how hard the south bank waves
//   hole   boolean        the shell hole in the west wall (30 Oct)
//   flash  0..1           gun light from outside (west): the glow, the room's lift
//   dust   0..1           dust coming down from the slab
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { levelQuad, ceilQuad, tileUV, lathe, sunShaft } from "../../romeo/sets/parts/b_common";
import { ISLAND, HALL as D } from "../places";
import { maker, boxG, paint, rng, css, blotch, NOINK, V, CC, concreteTex, sackWallTex, crateTex, stackSacks, sackMats, makeLantern, buildBank, SACK, type Fire, type BankMode } from "./common";

const X0 = ISLAND.hall, WT = 0.5;
export type HallTime = "night" | "eve" | "day" | "dawn" | "siege";
const TIMES: HallTime[] = ["night", "eve", "day", "dawn", "siege"];
/** the lanterns: where each stands (local), and the surface under it */
export const LAMPS = {
  south: [1.55, 0.5, -5.2], desk: [3.95, 0.62, 0.02], letter: [-0.7, 0.3, -4.95], mid: [-2.5, 0.5, -0.2], east: [8.0, 0.4, -2.3],
} as const;
export type LampName = keyof typeof LAMPS | "none";
type TL = {
  key: [number, number, number]; keyCol: string; keyK: number; hemi: [string, string, number]; pointK: number; env: number; tint: string;
  lamps: boolean; shaft: number; bank: BankMode; sky: string; ruins: string; fire: number; cast: Partial<CastLight>;
};
const SUN: [number, number, number] = [0.25, 0.62, -0.74];
const NIGHT_CAST = { tint: [1.0, 0.82, 0.64], tintK: 0.72, gain: 0.86, grad: 0.24, shade: [1.05, 0.92, 1.42], shadeK: 0.46, broad: 0.32, sheen: 0.28 };
const TL_: Record<HallTime, TL> = {
  night: { key: [0.2, 0.7, -0.5], keyCol: "#ffcf9a", keyK: 0.7, hemi: ["#59608c", "#2c2830", 1.5], pointK: 8, env: 0.5, tint: "#b9b6c8", lamps: true, shaft: 0, bank: "night", sky: "#0b1024", ruins: "#07080f", fire: 0.55, cast: NIGHT_CAST as unknown as Partial<CastLight> },
  eve: { key: [0.2, 0.7, -0.5], keyCol: "#ffcf9a", keyK: 0.75, hemi: ["#5f6490", "#2e2a32", 1.6], pointK: 8.5, env: 0.54, tint: "#beb8ca", lamps: true, shaft: 0, bank: "dusk", sky: "#2a3052", ruins: "#0c0d16", fire: 0.5, cast: { ...NIGHT_CAST, gain: 0.9 } as unknown as Partial<CastLight> },
  day: { key: SUN, keyCol: "#fff1dc", keyK: 2.2, hemi: ["#dfe4ea", "#7c756c", 1.05], pointK: 0, env: 0.95, tint: "#ffffff", lamps: false, shaft: 0.2, bank: "day", sky: "#c4cfda", ruins: "#6e7078", fire: 0.12,
    cast: { tint: [0.98, 0.98, 1.0], tintK: 0.4, gain: 0.98, grad: 0.22, shade: [1.02, 0.96, 1.3], shadeK: 0.4, broad: 0.2, sheen: 0.1 } as unknown as Partial<CastLight> },
  dawn: { key: [-0.7, 0.45, -0.25], keyCol: "#b9c8e0", keyK: 1.1, hemi: ["#9ba8c4", "#4a4c56", 1.35], pointK: 0, env: 0.7, tint: "#ccd2e2", lamps: false, shaft: 0.07, bank: "dawn", sky: "#8a97ae", ruins: "#2c3140", fire: 0.3,
    cast: { tint: [0.86, 0.92, 1.0], tintK: 0.6, gain: 0.9, grad: 0.24, shade: [0.98, 0.98, 1.4], shadeK: 0.44, broad: 0.22, sheen: 0.12 } as unknown as Partial<CastLight> },
  siege: { key: [0.2, 0.7, -0.5], keyCol: "#ffc890", keyK: 0.5, hemi: ["#474e78", "#221f28", 1.25], pointK: 6.5, env: 0.36, tint: "#a5a3b8", lamps: true, shaft: 0, bank: "siege", sky: "#070916", ruins: "#04050a", fire: 0.9, cast: { ...NIGHT_CAST, gain: 0.8 } as unknown as Partial<CastLight> },
};
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.28, 0.26]], [0, [0.42, 0.41, 0.4]], [90, [0.5, 0.5, 0.5]]],
  boxes: [{ az: 180, el: 25, rot: 0, w: 40, h: 20, soft: 16, col: [0.9, 0.88, 0.84] }],
};
const LOOK: PlaceLook = {
  bg: "#0c0e16",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.9, color: "#14121a" },
  cast: { key: [0.4, 0.55, -0.6], bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0], wrap: [30, 62], edge: 0.14, bodySat: 0.12, lift: 0.02, contactLen: 0.15, ...NIGHT_CAST, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.55,
};
const PARAMS: Record<string, ParamValue> = { time: "night", lamp: "south", board: 0, cheer: 0, hole: false, flash: 0, dust: 0 };

/** the burnt quarter to the west (Zhabei): a ragged roof line with chimneys and gutted gables, smoke standing over it */
const ruinsTex = () => paint(1024, 256, (g, W, H) => {
  const r = rng(27); g.clearRect(0, 0, W, H); g.fillStyle = "#ffffff";
  let x = 0;
  while (x < W) {
    const w = 30 + 70 * r(), h = H * (0.22 + 0.4 * r());
    g.beginPath(); g.moveTo(x, H); g.lineTo(x, H - h);
    if (r() < 0.5) { g.lineTo(x + w * 0.5, H - h - w * 0.35 * r()); g.lineTo(x + w, H - h); } else { for (let k = 1; k <= 4; k++) g.lineTo(x + (w * k) / 4, H - h * (0.6 + 0.4 * r())); }
    g.lineTo(x + w, H); g.fill();
    if (r() < 0.35) g.fillRect(x + w * 0.3, H - h - 26, 9, 30);
    x += w - 4;
  }
});
const glowTex = () => paint(8, 128, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.75, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
const floorTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(41); g.fillStyle = CC.floor; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) blotch(g, W * r(), H * r(), W * (0.04 + 0.12 * r()), r() < 0.6 ? "#59554e" : "#85807a", 0.14);
  g.strokeStyle = css("#3e3a34", 0.35); g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
  for (let i = 0; i < 26; i++) { g.fillStyle = css("#c8b890", 0.25); g.beginPath(); g.ellipse(W * r(), H * r(), 3 + 3 * r(), 2, r() * 3, 0, 7); g.fill(); }   // spilt grain
}, true);

const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "hall";
  const Mk = maker(K, group), X = (x: number) => X0 + x;
  const mWall = Mk.tex(concreteTex(11), 0.95), mWall2 = Mk.tex(concreteTex(12, "#86827a"), 0.95), mCeil = Mk.tex(concreteTex(13, "#7d7971"), 0.95), mFloor = Mk.tex(floorTex(), 0.9);
  const mCol = Mk.tex(concreteTex(14, "#99958c"), 0.95);
  const wall = (name: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: THREE.Material = mWall) => Mk.mesh(name, tileUV(boxG(X(x0), X(x1), y0, y1, z0, z1), 3), m);

  // ============================================================================================ the shell
  Mk.mesh("hall.floor", levelQuad(X(D.x0 - WT), X(D.x1 + WT), D.z0 - WT, D.z1 + WT, 0, (x, z) => [x / 3, -z / 3]), mFloor, { cast: false });
  Mk.mesh("hall.ceiling", ceilQuad(X(D.x0 - WT), X(D.x1 + WT), D.z0 - WT, D.z1 + WT, D.h, (x, z) => [x / 3, z / 3]), mCeil);
  // (the slab's top, so that the sun does not come through the ceiling)
  Mk.mesh("hall.slab", boxG(X(D.x0 - WT), X(D.x1 + WT), D.h + 0.02, D.h + 0.3, D.z0 - WT, D.z1 + WT), mCeil, { noink: true });
  // the south wall: under the sills, over the heads, the piers between the three windows
  const zo = D.z0 - WT, hw = D.winW / 2;
  wall("hall.south", D.x0 - WT, D.x1 + WT, 0, D.sill, zo, D.z0); wall("hall.south", D.x0 - WT, D.x1 + WT, D.head, D.h, zo, D.z0);
  { const e = [D.x0 - WT, ...D.win.flatMap((c) => [c - hw, c + hw]), D.x1 + WT]; for (let i = 0; i < e.length; i += 2) wall("hall.south", e[i], e[i + 1], D.sill, D.head, zo, D.z0); }
  // the west wall: scene D's window (sacks to the chest, open above), and the bay the shell goes through
  const xo = D.x0 - WT, Wz = D.west, HB = [0.2, 2.2];
  wall("hall.west", xo, D.x0, 0, Wz.sill, D.z0 - WT, HB[0], mWall2); wall("hall.west", xo, D.x0, Wz.head, D.h, D.z0 - WT, HB[0], mWall2);
  wall("hall.west", xo, D.x0, Wz.sill, Wz.head, D.z0 - WT, Wz.z - Wz.w / 2, mWall2); wall("hall.west", xo, D.x0, Wz.sill, Wz.head, Wz.z + Wz.w / 2, HB[0], mWall2);
  wall("hall.west", xo, D.x0, 0, D.h, HB[1], D.z1 + WT, mWall2);
  const bayWhole = wall("hall.west.bay", xo, D.x0, 0, D.h, HB[0], HB[1], mWall2);
  const bayHoled = (() => {
    const sh = new THREE.Shape(); sh.moveTo(HB[0], 0); sh.lineTo(HB[1], 0); sh.lineTo(HB[1], D.h); sh.lineTo(HB[0], D.h); sh.closePath();
    const r = rng(1030), hole = new THREE.Path(), n = 15;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, q = D.hole.r * (0.82 + 0.36 * r()); const z = D.hole.z + Math.cos(a) * q * 1.08, y = D.hole.y + Math.sin(a) * q; if (i) hole.lineTo(z, y); else hole.moveTo(z, y); }
    hole.closePath(); sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(X(D.x0), 0, 0);
    return Mk.mesh("hall.west.holed", tileUV(g, 3), mWall2);
  })();
  const rubble = new THREE.Group(); rubble.name = "hall.rubble"; group.add(rubble);
  {
    const P = new Part(K), r = rng(1031), m = Mk.flat("#8a867d", 0.95), m2 = Mk.flat("#6f6b63", 0.95);
    for (let i = 0; i < 16; i++) {
      const s = 0.07 + 0.16 * r(), mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
      mat.setPosition(X(D.x0 + 0.15 + 1.25 * r() * r()), s * 0.4, D.hole.z + (r() - 0.5) * 1.7);
      P.add(i % 3 ? m : m2, new THREE.BoxGeometry(s * 1.5, s * 0.8, s), 0.005, mat);
    }
    P.into(rubble, "hall.rubble.bits", { cast: true, receive: true });
  }
  // the east wall: the hole knocked through to the shop next door (z -3.3: scene F's rope comes in here)
  const Rz = D.rope, xe = D.x1 + WT;
  wall("hall.east", D.x1, xe, 0, Rz.y - 0.55, D.z0 - WT, D.z1 + WT, mWall2); wall("hall.east", D.x1, xe, Rz.y + 0.55, D.h, D.z0 - WT, D.z1 + WT, mWall2);
  wall("hall.east", D.x1, xe, Rz.y - 0.55, Rz.y + 0.55, D.z0 - WT, Rz.z - 0.5, mWall2); wall("hall.east", D.x1, xe, Rz.y - 0.55, Rz.y + 0.55, Rz.z + 0.5, D.z1 + WT, mWall2);
  Mk.mesh("hall.east.dark", new THREE.PlaneGeometry(1.6, 1.6).rotateY(-Math.PI / 2).translate(X(xe + 0.4), Rz.y, Rz.z), Mk.basic("#05060a"), { cast: false, receive: false, noink: true });
  // the north wall: the back door (x 6.4), dark stairs behind it
  const DOOR = { x: 6.4, w: 1.4, h: 2.25 };
  wall("hall.north", D.x0 - WT, DOOR.x - DOOR.w / 2, 0, D.h, D.z1, D.z1 + WT); wall("hall.north", DOOR.x + DOOR.w / 2, D.x1 + WT, 0, D.h, D.z1, D.z1 + WT);
  wall("hall.north", DOOR.x - DOOR.w / 2, DOOR.x + DOOR.w / 2, DOOR.h, D.h, D.z1, D.z1 + WT);
  Mk.mesh("hall.north.dark", new THREE.PlaneGeometry(2.2, 3).translate(X(DOOR.x), 1.4, D.z1 + WT + 0.5).rotateY(0), Mk.basic("#06070b", { side: THREE.DoubleSide }), { cast: false, receive: false, noink: true });
  // the mushroom columns
  for (const [cx, cz] of D.cols) {
    Mk.mesh("hall.col", new THREE.CylinderGeometry(0.3, 0.32, 3.4, 20).translate(X(cx), 1.7, cz), mCol);
    Mk.mesh("hall.col.head", lathe([[0.3, 3.35], [0.36, 3.5], [0.62, 3.82], [0.9, 4.02], [0.9, 4.06]], 24).translate(X(cx), 0, cz), mCol);
    Mk.mesh("hall.col.drop", boxG(X(cx - 1.05), X(cx + 1.05), 4.06, D.h + 0.01, cz - 1.05, cz + 1.05), mCeil);
    Mk.mesh("hall.col.foot", boxG(X(cx - 0.42), X(cx + 0.42), 0, 0.12, cz - 0.42, cz + 0.42), mCol);
  }

  // ============================================================================================ the grain: painted piles
  {
    const pile = (x0: number, x1: number, z0: number, z1: number, h: number, seed: number) => {
      const t = sackWallTex(seed, 4, 8), m = Mk.tex(t, 0.95);
      const g = boxG(X(x0), X(x1), 0, h, z0, z1), q = tileUV(g, SACK.len * 4, SACK.h * 8);
      Mk.mesh("hall.pile", q, m);
    };
    pile(-7.2, -3.4, 4.9, 7.0, 3.6, 51); pile(-3.4, 0.2, 5.2, 7.0, 3.0, 52); pile(0.2, 3.6, 4.9, 7.0, 3.75, 53); pile(3.6, 5.4, 5.6, 7.0, 2.4, 54);
    pile(-7.2, -5.6, 2.6, 4.9, 2.7, 55); pile(-5.6, -4.3, 4.0, 4.9, 1.35, 56); pile(-1.0, 1.6, 4.3, 5.2, 1.5, 57);
    pile(7.2, 8.8, -0.6, 4.6, 3.3, 58); pile(6.5, 7.2, 1.0, 3.6, 1.8, 59); pile(7.6, 8.8, -6.0, -4.4, 2.1, 60);
  }
  // ============================================================================================ sacks in 3D
  const P = new Part(K), sm = sackMats(K);
  // the three south windows walled up: 13 rows from the sill (a hand of sky left under the head), the slit two rows high
  const slitRow = Math.round((D.slitY - D.sill) / SACK.h) - 1;
  D.win.forEach((c, i) => stackSacks(P, sm, { x0: X(c - hw), x1: X(c + hw), y0: D.sill, rows: 13, z: D.z0 - 0.2, seed: 70 + i, skip: (row, _i, cx) => (row === slitRow || row === slitRow + 1) && Math.abs(cx - X(c)) < 0.36 }));
  // (a second, dark layer behind each stack: the gaps between the sacks do not show the far bank)
  {
    const mBack = Mk.flat("#5a4e38", 0.95), y0 = D.sill + slitRow * SACK.h, y1 = y0 + 2 * SACK.h, yt = D.sill + 13 * SACK.h - 0.04, zb0 = D.z0 - 0.4, zb1 = D.z0 - 0.33;
    for (const c of D.win) {
      Mk.mesh("hall.sackback", boxG(X(c - hw), X(c + hw), D.sill, y0, zb0, zb1), mBack, { noink: true }); Mk.mesh("hall.sackback", boxG(X(c - hw), X(c + hw), y1, yt, zb0, zb1), mBack, { noink: true });
      Mk.mesh("hall.sackback", boxG(X(c - hw), X(c - 0.4), y0, y1, zb0, zb1), mBack, { noink: true }); Mk.mesh("hall.sackback", boxG(X(c + 0.4), X(c + hw), y0, y1, zb0, zb1), mBack, { noink: true });
    }
  }
  // the west window: sacks to the chest (two rows on the sill)
  stackSacks(P, sm, { x0: Wz.z - Wz.w / 2, x1: Wz.z + Wz.w / 2, y0: Wz.sill, rows: 2, z: X(D.x0 - 0.22), alongZ: true, seed: 75 });
  // a breastwork under each south window (the men stand behind it), seats, a low wall by the west window
  D.win.forEach((c, i) => stackSacks(P, sm, { x0: X(c - 1.5), x1: X(c + 1.5), y0: 0, rows: 3, z: D.z0 + 0.24, seed: 80 + i, skip: (row, _i, cx) => row === 2 && Math.abs(cx - X(c)) < 0.5 }));
  stackSacks(P, sm, { x0: X(1.6), x1: X(2.86), y0: 0, rows: 3, z: -3.5, seed: 85 });                     // 老班长's seat (laoA)
  stackSacks(P, sm, { x0: X(-2.05), x1: X(-0.79), y0: 0, rows: 3, z: -4.6, seed: 86 });                  // the letter's seat
  stackSacks(P, sm, { x0: -4.6, x1: -1.0, y0: 0, rows: 5, z: X(D.x0 + 0.26), alongZ: true, seed: 87, skip: (row, _i, cz) => row >= 3 && Math.abs(cz - Wz.z) < 0.9 });
  stackSacks(P, sm, { x0: X(-6.6), x1: X(-4.7), y0: 0, rows: 4, z: 0.2, seed: 88 });
  // crates: 谢晋元's desk (top 0.62) and his seat, the lanterns' stands, ammunition boxes about
  {
    const mCr = Mk.tex(crateTex(91), 0.85), mCr2 = Mk.tex(crateTex(92, "#6a6f52"), 0.85), mCr3 = Mk.tex(crateTex(93, "#8a6a44"), 0.85);
    const crate = (m: THREE.Material, x0: number, x1: number, h: number, z0: number, z1: number, y0 = 0, yaw = 0) => {
      const g = tileUV(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), 0.5), mat = new THREE.Matrix4().makeRotationY(yaw); mat.setPosition(X((x0 + x1) / 2), y0 + h / 2, (z0 + z1) / 2);
      P.add(m, g, 0.006, mat);
    };
    crate(mCr, 3.2, 4.15, 0.62, -0.2, 0.4, 0, 0.5);                       // the desk
    crate(mCr2, 3.68, 4.14, 0.4, -0.66, -0.22, 0, 0.5);                   // his seat (the spot xieDesk)
    crate(mCr3, 1.3, 1.8, 0.5, -5.45, -4.95);                             // the south lantern's stand
    crate(mCr2, -0.95, -0.45, 0.3, -5.2, -4.72, 0, 0.2);                  // the letter lantern's box
    crate(mCr, -2.85, -2.15, 0.5, -0.5, 0.1, 0, -0.3);                    // the middle lantern's
    crate(mCr2, 7.7, 8.3, 0.4, -2.6, -2.0);                               // by the rope hole
    crate(mCr3, 4.6, 5.4, 0.42, -5.3, -4.7, 0, 0.15); crate(mCr2, 4.7, 5.3, 0.3, -5.25, -4.75, 0.42, -0.2);
    crate(mCr, -6.6, -5.9, 0.45, 1.0, 1.6, 0, 0.3); crate(mCr3, 5.0, 5.9, 0.5, 2.6, 3.3, 0, 0.6); crate(mCr2, 5.1, 5.8, 0.36, 2.7, 3.2, 0.5, 0.35);
    // a sheet of paper, an ink bottle and a pen tray on the desk
    P.add(Mk.flat("#2a2c34", 0.4), new THREE.CylinderGeometry(0.028, 0.032, 0.05, 10).translate(X(3.45), 0.645, 0.22), 0.004);
  }
  // the lanterns
  const fires: Record<string, Fire> = {};
  let ph = 0.3;
  for (const [name, at] of Object.entries(LAMPS)) { fires[name] = makeLantern(P, K, group, V(X(at[0]), at[1], at[2]), (ph += 1.7), { pool: name === "desk" ? 2.6 : 3.6, poolAt: at[1] < 0.35 ? 0.0025 : 0.0025 }); }
  // the lamp light on the surface it stands on (a small warm disc on the crate top)
  P.into(group, "hall.dressing", { cast: true, receive: true });

  // ============================================================================================ outside
  const bank = buildBank(X0, D.z0 - WT); group.add(bank.group);
  const mSkyW = Mk.basic("#0b1024"), mRuins = Mk.basic("#07080f", { map: ruinsTex(), transparent: true });
  mRuins.alphaTest = 0.4; mRuins.depthWrite = true;
  Mk.mesh("hall.west.sky", new THREE.PlaneGeometry(120, 60).rotateY(Math.PI / 2).translate(X(D.x0 - 44), 20, 0), mSkyW, { cast: false, receive: false, noink: true });
  Mk.mesh("hall.west.ruins", new THREE.PlaneGeometry(90, 9).rotateY(Math.PI / 2).translate(X(D.x0 - 30), 0.2, 0), mRuins, { cast: false, receive: false, noink: true });
  const mFire = Mk.basic("#ff7a2a", { map: glowTex(), additive: true, opacity: 0.5 });
  const fireCard = Mk.mesh("hall.west.fire", new THREE.PlaneGeometry(110, 16).rotateY(Math.PI / 2).translate(X(D.x0 - 31), 5.5, 0), mFire, { cast: false, receive: false, noink: true }); fireCard.renderOrder = 2;
  Mk.mesh("hall.west.ground", new THREE.PlaneGeometry(40, 90).rotateX(-Math.PI / 2).translate(X(D.x0 - 20.5), -4.5, 0), Mk.basic("#090a10"), { cast: false, receive: false, noink: true });

  // ============================================================================================ light
  const sdir = V(...SUN).normalize().negate(), shafts: THREE.Mesh[] = [];
  // each shaft's axis (start, length, half width): a lens standing inside one would see only its veil, so a shaft
  // thins out as the lens comes into it (see view)
  const shaftAx: { a: THREE.Vector3; len: number; r: number }[] = [];
  for (const c of D.win) {
    const z = D.z0 - 0.02, y0 = D.sill + slitRow * SACK.h, y1 = y0 + 2 * SACK.h;
    shafts.push(sunShaft([V(X(c + 0.3), y0, z), V(X(c - 0.3), y0, z), V(X(c - 0.3), y1, z), V(X(c + 0.3), y1, z)], sdir, 3.2, "#fff2d8", 0.2));
    shaftAx.push({ a: V(X(c), (y0 + y1) / 2, z), len: 3.2, r: 0.42 });
    const t0 = D.sill + 13 * SACK.h;
    shafts.push(sunShaft([V(X(c + hw), t0, z), V(X(c - hw), t0, z), V(X(c - hw), D.head, z), V(X(c + hw), D.head, z)], sdir, 5.2, "#fff2d8", 0.2));
    shaftAx.push({ a: V(X(c), (t0 + D.head) / 2, z), len: 5.2, r: hw + 0.1 });
  }
  for (const s of shafts) { s.name = "hall.shaft"; group.add(s); }
  const Lr = lightRig(group, { dir: TL_.night.key, k: TL_.night.keyK, col: TL_.night.keyCol, at: [X(0.5), 0, -1.5], half: 10, hemi: TL_.night.hemi, point: { col: "#ffb676", k: 7, at: [X(LAMPS.south[0]), LAMPS.south[1] + 0.35, LAMPS.south[2]], dist: 9 } });
  Lr.point.decay = 1.6; Lr.key.shadow.bias = -0.0006;
  // dust from the slab
  const ND = 150, dustGeo = new THREE.BufferGeometry(), dpos = new Float32Array(ND * 3), dr = rng(99), dseed = Array.from({ length: ND }, () => [dr(), dr(), dr(), 0.5 + dr()]);
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dustTex = paint(32, 32, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S); });
  const mDust = new THREE.PointsMaterial({ map: dustTex, color: "#cfc8b8", size: 0.05, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true, fog: false });
  const dust = new THREE.Points(dustGeo, mDust); dust.layers.set(NOINK); dust.frustumCulled = false; dust.name = "hall.dust"; dust.renderOrder = 5; group.add(dust);

  // every lit material's env share and colour follow the hour
  const envMats: [THREE.MeshStandardMaterial, number, THREE.Color][] = [];
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const q of m ? (Array.isArray(m) ? m : [m]) : []) if ((q as THREE.MeshStandardMaterial).isMeshStandardMaterial && !envMats.some(([e]) => e === q)) envMats.push([q as THREE.MeshStandardMaterial, (q as THREE.MeshStandardMaterial).envMapIntensity, (q as THREE.MeshStandardMaterial).color.clone()]);
  });
  const tint = new THREE.Color(), hemiSky = new THREE.Color(), flashCol = new THREE.Color("#ffd9a8");
  let time: HallTime = "night", lamp: LampName = "south", flash = 0, dustK = 0, fk = 1;
  const applyTime = (tm: HallTime) => {
    time = tm; const L = TL_[tm];
    Lr.key.color.set(L.keyCol); Lr.key.intensity = L.keyK;
    const d = V(...L.key).normalize(), at = V(X(0.5), 0, -1.5); Lr.key.position.copy(at).addScaledVector(d, 30);
    Lr.hemi.groundColor.set(L.hemi[1]);
    tint.set(L.tint);
    for (const [m, e, c] of envMats) { m.envMapIntensity = e * L.env; m.color.copy(c).multiply(tint); }
    for (const f of Object.values(fires)) { f.group.visible = L.lamps; for (const p of f.pools) p.visible = L.lamps; }
    for (const s of shafts) { s.visible = L.shaft > 0.001; (s.material as THREE.MeshBasicMaterial).opacity = L.shaft; (s.material as THREE.MeshBasicMaterial).color.set(tm === "dawn" ? "#c9d6ec" : "#fff2d8"); }
    bank.setMode(L.bank); mSkyW.color.set(L.sky); mRuins.color.set(L.ruins);
    applyLive();
  };
  const applyLive = () => {
    const L = TL_[time];
    hemiSky.set(L.hemi[0]).lerp(flashCol, 0.6 * flash); Lr.hemi.color.copy(hemiSky); Lr.hemi.intensity = L.hemi[2] + 1.9 * flash;
    mFire.opacity = Math.min(1, L.fire * (0.9 + 0.1 * fk) + 0.9 * flash);
    const on = L.lamps && lamp !== "none";
    Lr.point.intensity = on ? L.pointK * fk : 0;
    if (on) { const a = LAMPS[lamp as keyof typeof LAMPS]; Lr.point.position.set(X(a[0]), a[1] + 0.35, a[2]); }
    mDust.opacity = 0.55 * dustK;
    dust.visible = dustK > 0.01;
  };
  applyTime("night");

  const camP = new THREE.Vector3(), tmpV = new THREE.Vector3();
  return {
    group,
    view(c: THREE.Vector3) {
      camP.copy(c); for (const f of Object.values(fires)) f.face(c);
      const L = TL_[time];
      if (L.shaft > 0.001) shafts.forEach((sh, i) => {
        const ax = shaftAx[i], t = Math.max(0, Math.min(ax.len, tmpV.copy(c).sub(ax.a).dot(sdir))), d = tmpV.copy(ax.a).addScaledVector(sdir, t).distanceTo(c);
        const q = Math.max(0, Math.min(1, (d - ax.r * 0.7) / (ax.r * 0.9))), k = q * q * (3 - 2 * q);
        (sh.material as THREE.MeshBasicMaterial).opacity = L.shaft * (0.12 + 0.88 * k);
      });
    },
    animate(t: number) {
      for (const f of Object.values(fires)) f.animate(t);
      fk = lamp !== "none" ? fires[lamp].level(t) : 1;
      bank.animate(t);
      if (dustK > 0.01) {
        for (let i = 0; i < ND; i++) {
          const s = dseed[i], y = D.h - ((t * 0.55 * s[3] + s[1] * D.h) % D.h);
          dpos[3 * i] = X(-5.5 + 12 * s[0]) + 0.08 * Math.sin(t * 1.3 + i); dpos[3 * i + 1] = y; dpos[3 * i + 2] = -5.6 + 8.5 * s[2] + 0.08 * Math.cos(t * 1.1 + i * 2);
        }
        (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
      applyLive();
    },
    setParam(name: string, v: ParamValue) {
      if (name === "time") applyTime((TIMES as string[]).includes(String(v)) ? (v as HallTime) : "night");
      else if (name === "lamp") { lamp = (String(v) in LAMPS ? v : "none") as LampName; applyLive(); }
      else if (name === "board") bank.setBoard(Number(v) | 0);
      else if (name === "cheer") bank.setCheer(Number(v));
      else if (name === "hole") { const on = !!v; bayWhole.visible = !on; bayHoled.visible = on; rubble.visible = on; }
      else if (name === "flash") { flash = Math.max(0, Math.min(1, Number(v))); applyLive(); }
      else if (name === "dust") { dustK = Math.max(0, Math.min(1, Number(v))); applyLive(); }
    },
    cast(): Partial<CastLight> {
      const L = TL_[time], c = { ...L.cast } as Record<string, unknown>;
      if (L.lamps && lamp !== "none") {
        // the figures' key comes from the lantern (seen from the middle of the action, lifted)
        const a = LAMPS[lamp as keyof typeof LAMPS], d = V(a[0] - 0.8, 0, a[2] + 2.2); const n = Math.max(0.001, Math.hypot(d.x, d.z));
        c.key = [(d.x / n) * 0.75, 0.5, (d.z / n) * 0.75];
      } else c.key = [L.key[0], Math.max(0.4, L.key[1]), L.key[2]];
      c.gain = (Number(c.gain) || 0.9) * (0.98 + 0.02 * fk) + 0.45 * flash;
      return c as Partial<CastLight>;
    },
  };
};

export const HALL_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };
