// FRIAR LAURENCE'S CELL (place "cell", island x 360): scenes 4 (Monday afternoon) and 6a (Tuesday). Set builder B.
// The herbalist's room: small, whitewashed, low beamed ceiling; a sun beam from a small high window in the back wall;
// a bright open doorway in the left wall; the herb bench along the back wall with shelves of bottles and jars over it;
// bunches of drying herbs from the beam; a mortar, baskets, a stool, a narrow bed in the back-left corner, a standing
// writing desk (quill, ink, red wax) on the right, a bell rope by the door, pots of herbs. NO cross, NO altar, NO
// religious picture anywhere: the room is the Friar's personality (a herb nerd).
//
// WHERE THINGS ARE (local to the island; places.ts STAGE.cell has the marks and cameras; the camera side is +z)
//   walls: left x -2.3 (the doorway z -1.6 .. -0.6), right x 2.1, back z -2.4, front z 3.2; ceiling 2.7, the herb beam
//   along x at z -1.7 (its underside y 2.27)
//   the herb bench: x -0.2 .. 1.75, z -2.4 .. -1.85 (front edge), top 0.86; the Friar (0.7, -1.5) stands in front of it
//   the window: back wall x 1.18 .. 1.62, y 1.72 .. 2.3; the beam of sun lands on the floor round (0.5, -0.6)
//   the bed: x -2.25 .. -0.45, z -2.4 .. -1.68; the desk: x 0.85 .. 1.15, z -0.85 .. -0.35 (the writer at (1.5, -0.6))
// PARAM day: "monday" (warm afternoon sun, the shaft and dust) | "tuesday" (greyer and cooler, a thin sun).
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { ISLAND } from "../places";
import { CAST_BASE, maker, boxG, levelQuad, ceilQuad, tileUV, lathe, bar, archWallG, plasterTex, boardsTex, paint, rng, css, mix, blotch, Part, lightPool, sunShaft, dustMotes } from "./parts/b_common";
import { bottle, jar, herbBunch, book, jug } from "./parts/b_props";

const X0 = ISLAND.cell;
const XL = -2.3, XR = 2.1, ZB = -2.4, ZF = 3.2, YC = 2.7, WT = 0.42;
const DOOR = { z0: -1.6, z1: -0.6, spring: 1.6 };
const WIN = { x0: 1.18, x1: 1.62, y0: 1.72, spring: 2.08 };   // the back wall's little window (sky only)
const HWIN = { z0: -2.2, z1: -1.78, y0: 1.75, spring: 2.04 };   // THE HIGH WINDOW in the left wall over the bed: the sun beam
const BENCH = { x0: -0.2, x1: 1.75, z0: ZB, z1: -1.85, top: 0.86 };
const BEAM_Z = -1.7, BEAM_Y = 2.27;

type Day = "monday" | "tuesday";
const DAYS: Day[] = ["monday", "tuesday"];
const CC = {
  wash: "#e2d8c4", washLo: "#c9bca4", stone: "#b4a690", wood: "#7a5a3e", woodLo: "#5e4430", woodDark: "#4a3628", rope: "#cdb48a",
  cotto: "#b8866a", cottoLo: "#9e6e54",
};
/** the two days' light: the sun (toward it), its colour and strength, the shaft, the hemisphere, the doorway light,
 *  the outside card's tint, the environment share */
type DayLight = { sun: [number, number, number]; col: string; k: number; shaft: number; shaftCol: string; dust: number; hemi: [string, string, number]; door: string; doorK: number; out: string; env: number; pool: number; tint: string };
const SUN: [number, number, number] = [-0.906, 0.423, 0.0];   // toward the sun: low from the left (west), through the doorway and the high window
const DL: Record<Day, DayLight> = {
  monday: { sun: SUN, col: "#ffe0b0", k: 3.6, shaft: 0.28, shaftCol: "#ffe6b8", dust: 1, hemi: ["#f0e4d2", "#8a7460", 0.75], door: "#ffe8c8", doorK: 5.5, out: "#fff4e0", env: 1.0, pool: 0.32, tint: "#ffffff" },
  tuesday: { sun: SUN, col: "#dfe6f0", k: 0.55, shaft: 0.05, shaftCol: "#dfe6ee", dust: 0.25, hemi: ["#c4ccd6", "#5e6064", 0.95], door: "#d8e0ea", doorK: 4.0, out: "#d6dce2", env: 0.5, pool: 0.1, tint: "#d4dae2" },
};
const CELL_CAST: Record<Day, Partial<CastLight>> = {
  monday: { key: [-0.75, 0.42, 0.5], tint: [1.0, 0.95, 0.88], tintK: 0.55, gain: 1.0, shade: [1.06, 0.95, 1.25], broad: 0.15, sheen: 0.12 },
  tuesday: { key: [-0.7, 0.45, 0.55], tint: [0.96, 0.98, 1.0], tintK: 0.45, gain: 0.95, shade: [1.02, 0.96, 1.32], broad: 0.18, sheen: 0.08 },
} as unknown as Record<Day, Partial<CastLight>>;

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.26, 0.22]], [0, [0.42, 0.38, 0.34]], [90, [0.52, 0.5, 0.47]]],
  boxes: [{ az: -90, el: 15, rot: 0, w: 30, h: 26, soft: 16, col: [1.0, 0.95, 0.86] }],
};
const LOOK: PlaceLook = {
  bg: "#d8cfc0",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.8, color: "#3a2e26" },
  cast: { ...CAST_BASE, ...CELL_CAST.monday } as unknown as CastLight,
  fill: FILL,
  bloom: 0.35,
};
const PARAMS: Record<string, ParamValue> = { day: "monday" };

// ---------------------------------------------------------------------------------------------------- paintings
/** cotto floor tiles: 0.32 m squares, each its own warm tone, soft joints, worn paler in the middle */
const cottoTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(301), n = 4, s = W / n, j = 6;
  g.fillStyle = "#8a6450"; g.fillRect(0, 0, W, H);
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    g.fillStyle = css(mix(CC.cotto, r() < 0.5 ? CC.cottoLo : "#c89a7a", 0.15 + 0.4 * r())); g.fillRect(a * s + j / 2, b * s + j / 2, s - j, s - j);
    blotch(g, a * s + s * r(), b * s + s * r(), s * 0.5, r() < 0.5 ? "#d4ab8a" : "#8e5e48", 0.12);
  }
}, true);
/** whitewash over stone: the wash, a darker damp foot, a few patches where the stone shows */
const washTex = (seed: number) => paint(512, 512, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = CC.wash; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), W * (0.05 + 0.12 * r()), r() < 0.55 ? CC.washLo : "#f2ead8", 0.14);
  for (let i = 0; i < 6; i++) { const x = W * r(), y = H * r(), w = W * (0.05 + 0.06 * r()); g.fillStyle = css("#b0a088", 0.25); g.fillRect(x, y, w, w * 0.5); g.strokeStyle = css("#9a8a72", 0.35); g.lineWidth = 3; g.strokeRect(x, y, w, w * 0.5); }
}, true);
/** the world outside the doorway, very bright: a cloister garden, a low wall, a tree, sky (unlit card) */
const outsideTex = () => paint(512, 768, (g, W, H) => {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.55); sky.addColorStop(0, "#f4f0e6"); sky.addColorStop(1, "#f6eedc");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // a far tree and hedge (soft, pale greens)
  g.fillStyle = "#c8d0a8"; g.beginPath(); g.ellipse(W * 0.7, H * 0.36, W * 0.28, H * 0.16, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#b8c498"; g.beginPath(); g.ellipse(W * 0.25, H * 0.48, W * 0.35, H * 0.09, 0, 0, Math.PI * 2); g.fill();
  // the low cloister wall, the path
  g.fillStyle = "#efe2c8"; g.fillRect(0, H * 0.5, W, H * 0.12);
  g.fillStyle = "#e0cfb0"; g.fillRect(0, H * 0.6, W, H * 0.02);
  g.fillStyle = "#f2e8d4"; g.fillRect(0, H * 0.62, W, H * 0.38);
  g.fillStyle = "#c4cc98"; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(W * (0.06 + 0.13 * i), H * 0.64, W * 0.07, H * 0.025, 0, 0, Math.PI * 2); g.fill(); }
});
/** a label for jars (a cream square with a few brown strokes of writing) painted round a jar via its texture */
const labelJarTex = (base: string, seed: number) => paint(128, 128, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  g.fillStyle = "#efe4c8"; g.fillRect(W * 0.2, H * 0.38, W * 0.3, H * 0.26); g.fillRect(W * 0.7, H * 0.38, W * 0.3, H * 0.26);
  g.strokeStyle = "#6a4a36"; g.lineWidth = 2;
  for (const x0 of [0.22, 0.72]) for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(W * (x0 + 0.02), H * (0.46 + k * 0.08)); g.lineTo(W * (x0 + 0.1 + 0.12 * r()), H * (0.46 + k * 0.08)); g.stroke(); }
});
const pageTex = () => paint(128, 160, (g, W, H) => {
  g.fillStyle = "#efe6cf"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#5a4636"; g.lineWidth = 2;
  for (let k = 0; k < 9; k++) { const y = H * (0.14 + k * 0.08); g.beginPath(); g.moveTo(W * 0.12, y); g.lineTo(W * (0.6 + 0.28 * Math.abs(Math.sin(k * 2.3))), y); g.stroke(); }
});

// ---------------------------------------------------------------------------------------------------- the builder
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "cell";
  const Mk = maker(K, group), X = (x: number) => X0 + x;
  const mWash = Mk.tex(washTex(302), 0.95), mWash2 = Mk.tex(washTex(303), 0.95), mFloor = Mk.tex(cottoTex(), 0.85);
  const mWood = Mk.flat(CC.wood, 0.75), mWoodLo = Mk.flat(CC.woodLo, 0.8), mWoodDark = Mk.flat(CC.woodDark, 0.8), mStone = Mk.flat(CC.stone, 0.9);
  const mCeil = Mk.tex(boardsTex({ seed: 304, n: 5, base: "#8a6a4c", lo: "#6a4e38" }), 0.9), mIron = Mk.flat("#3c3640", 0.55);

  // ============================================================================================ floor, ceiling, beams
  Mk.mesh("cell.floor", levelQuad(X(XL), X(XR), ZB, ZF, 0, (x, z) => [x / 1.28, -z / 1.28]), mFloor, { cast: false });
  Mk.mesh("cell.ceiling", ceilQuad(X(XL), X(XR), ZB, ZF, YC, (x, z) => [x / 1.4, z / 1.4]), mCeil);
  Mk.mesh("cell.beam", boxG(X(XL), X(XR), BEAM_Y, YC + 0.01, BEAM_Z - 0.11, BEAM_Z + 0.11), mWoodDark);
  for (const z of [-0.4, 0.9, 2.2]) Mk.mesh("cell.joist", boxG(X(XL), X(XR), YC - 0.14, YC + 0.01, z - 0.07, z + 0.07), mWoodDark);

  // ============================================================================================ walls
  Mk.mesh("cell.wall.back", archWallG({ axis: "x", at: ZB - WT / 2, u0: X(XL - WT), u1: X(XR + WT), y0: 0, y1: YC + 0.01, thick: WT, holes: [{ c: X((WIN.x0 + WIN.x1) / 2), w: WIN.x1 - WIN.x0, y0: WIN.y0, spring: WIN.spring }], tile: 1.6 }), mWash);
  Mk.mesh("cell.wall.left", archWallG({ axis: "z", at: X(XL - WT / 2), u0: ZB - WT, u1: ZF + WT, y0: 0, y1: YC + 0.01, thick: WT, notches: [{ c: (DOOR.z0 + DOOR.z1) / 2, w: DOOR.z1 - DOOR.z0, y0: 0, spring: DOOR.spring }], holes: [{ c: (HWIN.z0 + HWIN.z1) / 2, w: HWIN.z1 - HWIN.z0, y0: HWIN.y0, spring: HWIN.spring }], tile: 1.6 }), mWash2);
  Mk.mesh("cell.hsill", boxG(X(XL - WT), X(XL + 0.05), HWIN.y0 - 0.05, HWIN.y0, HWIN.z0 - 0.04, HWIN.z1 + 0.04), mStone);
  Mk.mesh("cell.wall.right", tileUV(boxG(X(XR), X(XR + WT), 0, YC + 0.01, ZB - WT, ZF + WT), 1.6), mWash2);
  Mk.mesh("cell.wall.front", tileUV(boxG(X(XL - WT), X(XR + WT), 0, YC + 0.01, ZF, ZF + WT), 1.6), mWash);
  // a stone threshold and a sill
  Mk.mesh("cell.threshold", boxG(X(XL - WT - 0.02), X(XL + 0.02), 0, 0.025, DOOR.z0 + 0.02, DOOR.z1 - 0.02), mStone, { cast: false });
  Mk.mesh("cell.sill", boxG(X(WIN.x0 - 0.04), X(WIN.x1 + 0.04), WIN.y0 - 0.05, WIN.y0, ZB - WT, ZB + 0.05), mStone);
  // two upright iron bars in the window (no glazing bars: nothing that could read as a cross)
  for (const k of [1 / 3, 2 / 3]) Mk.mesh("cell.window.bar", new THREE.CylinderGeometry(0.012, 0.012, WIN.spring + (WIN.x1 - WIN.x0) * 0.45 - WIN.y0, 8).translate(X(WIN.x0 + (WIN.x1 - WIN.x0) * k), (WIN.y0 + WIN.spring + (WIN.x1 - WIN.x0) * 0.45) / 2, ZB - WT * 0.5), mIron, { noink: true });
  // the sky in the window (unlit) and the world outside the door (an unlit card, very bright)
  const mSky = Mk.basic(DL.monday.out);
  Mk.mesh("cell.window.sky", new THREE.PlaneGeometry(0.7, 0.9).translate(X((WIN.x0 + WIN.x1) / 2), WIN.y0 + 0.4, ZB - WT - 0.05), mSky, { cast: false, receive: false, noink: true });
  const mOut = Mk.basic(DL.monday.out, { map: outsideTex() });
  Mk.mesh("cell.outside", new THREE.PlaneGeometry(4.2, 4.2).rotateY(Math.PI / 2).translate(X(XL - WT - 1.4), 1.4, (DOOR.z0 + DOOR.z1) / 2 - 0.4), mOut, { cast: false, receive: false, noink: true });
  Mk.mesh("cell.outside.ground", levelQuad(X(XL - WT - 1.4), X(XL - WT), DOOR.z0 - 1.5, DOOR.z1 + 1.5, -0.002), Mk.basic("#efe4cc"), { cast: false, receive: false, noink: true });
  // the light the doorway throws on the floor and the far wall
  const doorPool = lightPool(new THREE.Vector3(X(XL + 1.0), 0.0015, (DOOR.z0 + DOOR.z1) / 2 + 0.15), new THREE.Vector3(0, 1, 0), 2.4, 1.3, "#fff0d8", DL.monday.pool);
  group.add(doorPool);

  // ============================================================================================ the herb bench and its shelves
  const P = new Part(K);
  {
    const B = BENCH, x0 = X(B.x0), x1 = X(B.x1);
    P.add(mWood, boxG(x0 - 0.03, x1 + 0.03, B.top - 0.06, B.top, B.z0 + 0.02, B.z1 + 0.03), 0.006);                 // the thick top
    for (const x of [x0 + 0.06, (x0 + x1) / 2, x1 - 0.06]) P.add(mWoodLo, boxG(x - 0.05, x + 0.05, 0, B.top - 0.06, B.z1 - 0.12, B.z1 - 0.02), 0.005);
    P.add(mWoodLo, boxG(x0, x1, 0.22, 0.27, B.z0 + 0.04, B.z1 - 0.02), 0.005);                                       // the low shelf
    // shelves on the back wall over it (left of the window), on iron brackets
    for (const y of [1.28, 1.62]) {
      P.add(mWood, boxG(x0 - 0.1, X(1.02), y - 0.035, y, ZB, ZB + 0.24), 0.005);
      for (const x of [x0, X(0.9)]) P.add(mIron, boxG(x - 0.012, x + 0.012, y - 0.2, y - 0.035, ZB, ZB + 0.18), 0.003);
    }
    // a small shelf under the window too
    P.add(mWood, boxG(X(1.12), X(1.72), 1.3, 1.335, ZB, ZB + 0.2), 0.005);
  }
  // the glass: bottles of many colours (muted: amber, sage, rose, smoke, honey), jars with labels
  {
    const glass = ["#c49a52", "#9aa878", "#b88078", "#a8a49a", "#d0b06a", "#8a9a8a", "#c6a090", "#7e8e6a"].map((c) => Mk.flat(c, 0.25));
    const mCork = Mk.flat("#a88058", 0.8), lid = Mk.flat("#8a6a4a", 0.7);
    const jars = [labelJarTex("#c0aa88", 1), labelJarTex("#a8b090", 2), labelJarTex("#c89a80", 3), labelJarTex("#d4c4a0", 4)].map((t) => Mk.tex(t, 0.6));
    const r = rng(310);
    // the bench top: a row of bottles at the back, a few jars, the mortar, a bundle of herbs lying, an open book
    let x = BENCH.x0 + 0.08;
    while (x < BENCH.x1 - 0.06) {
      const h = 0.12 + 0.12 * r(), rad = 0.03 + 0.02 * r();
      if (x > 0.25 && x < 0.62) { x += 0.08; continue; }
      bottle(P, { glass: glass[Math.floor(r() * glass.length)], cork: mCork }, X(x), BENCH.top, ZB + 0.11 + 0.05 * r(), h, rad, Math.floor(r() * 3));
      x += rad * 2 + 0.035 + 0.03 * r();
    }
    for (const [jx, jz, h, rr, t] of [[0.32, -2.1, 0.17, 0.065, 0], [0.5, -2.05, 0.13, 0.055, 1], [1.45, -2.05, 0.15, 0.06, 2]] as number[][]) jar(P, { body: jars[t], lid }, X(jx), BENCH.top, jz, h, rr);
    // the shelves: bottles and jars in rows
    for (const [y, seed] of [[1.28, 7], [1.62, 9]] as [number, number][]) {
      const q = rng(seed); let sx = BENCH.x0 - 0.04;
      while (sx < 0.95) {
        if (q() < 0.3) { const rr = 0.05 + 0.015 * q(); jar(P, { body: jars[Math.floor(q() * 4)], lid }, X(sx + rr), y, ZB + 0.12, 0.12 + 0.05 * q(), rr); sx += rr * 2 + 0.03; }
        else { const rad = 0.025 + 0.018 * q(); bottle(P, { glass: glass[Math.floor(q() * glass.length)], cork: mCork }, X(sx + rad), y, ZB + 0.12, 0.1 + 0.1 * q(), rad, Math.floor(q() * 3)); sx += rad * 2 + 0.028; }
      }
    }
    for (const sx of [1.2, 1.31, 1.42, 1.55, 1.64]) bottle(P, { glass: glass[Math.floor(r() * glass.length)], cork: mCork }, X(sx), 1.335, ZB + 0.1, 0.09 + 0.06 * r(), 0.025, Math.floor(r() * 3));
    // the mortar and pestle (front left of the bench top), a herb bundle lying, a small brass scale, a book
    const mMortar = Mk.flat("#a89c8a", 0.85);
    P.add(mMortar, lathe([[0.001, 0], [0.07, 0], [0.085, 0.03], [0.095, 0.09], [0.088, 0.11], [0.001, 0.07]], 18).translate(X(0.05), BENCH.top, -1.98), 0.005);
    P.add(Mk.flat("#bcae96", 0.8), bar(new THREE.Vector3(X(0.04), BENCH.top + 0.07, -1.98), new THREE.Vector3(X(0.12), BENCH.top + 0.22, -1.94), 0.016, 0.022, 8), 0.004);
    const mLeaf = Mk.flat("#7a8a52", 0.85), mLeaf2 = Mk.flat("#9a9a5e", 0.85), mStem = Mk.flat("#8a7a4a", 0.85), mBloom = Mk.flat("#9a7aa0", 0.8), mBloom2 = Mk.flat("#d8c070", 0.8);
    P.add(mLeaf, new THREE.ConeGeometry(0.05, 0.3, 9).rotateZ(Math.PI / 2).translate(X(0.95), BENCH.top + 0.04, -1.98), 0.004);
    P.add(mStem, new THREE.CylinderGeometry(0.016, 0.016, 0.1, 8).rotateZ(Math.PI / 2).translate(X(1.13), BENCH.top + 0.03, -1.98), 0.003);
    const mBrass = Mk.flat("#b8964e", 0.45);
    P.add(mBrass, new THREE.CylinderGeometry(0.012, 0.016, 0.26, 8).translate(X(1.25), BENCH.top + 0.13, -2.2), 0.003);
    P.add(mBrass, boxG(-0.16, 0.16, -0.008, 0.008, -0.008, 0.008).translate(X(1.25), BENCH.top + 0.26, -2.2), 0.003);
    for (const s of [-1, 1]) P.add(mBrass, lathe([[0.001, 0], [0.06, 0.004], [0.065, 0.025], [0.001, 0.015]], 14).translate(X(1.25 + s * 0.15), BENCH.top + 0.14, -2.2), 0.003);
    book(P, { cover: Mk.flat("#6a3a2e", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, X(0.72), BENCH.top, -2.08, 0.26, 0.2, 0.05, 0.15);
    // the low shelf: baskets and big jars
    const mBasket = Mk.flat("#b08a58", 0.85);
    for (const [bx, w] of [[0.05, 0.3], [0.95, 0.34]] as number[][]) P.add(mBasket, lathe([[0.001, 0], [w * 0.4, 0], [w * 0.5, 0.16], [w * 0.47, 0.17], [0.001, 0.12]], 16).translate(X(bx), 0.27, -2.12), 0.005);
    jar(P, { body: Mk.flat("#9a7a5a", 0.7), lid }, X(0.5), 0.27, -2.12, 0.28, 0.11);
    jar(P, { body: Mk.flat("#7e8a6e", 0.7), lid }, X(1.42), 0.27, -2.12, 0.24, 0.1);
    // THE DRYING HERBS on the beam: bunches of different greens, some flowering (lavender, tansy)
    const leafs = [mLeaf, mLeaf2, Mk.flat("#6a7a4a", 0.85), Mk.flat("#8a9466", 0.85)];
    const mStr = Mk.flat(CC.rope, 0.85);
    let k = 0;
    for (let hx = XL + 0.35; hx < XR - 0.15; hx += 0.27 + 0.06 * Math.sin(hx * 7)) {
      herbBunch(P, { leaf: leafs[k % 4], stem: mStem, string: mStr, bloom: k % 3 === 0 ? mBloom : k % 3 === 1 ? mBloom2 : undefined }, X(hx), BEAM_Y, BEAM_Z + 0.04 * Math.sin(k * 2.1), 0.22 + 0.1 * Math.abs(Math.sin(k * 1.7)), 400 + k);
      k++;
    }
    // a garlic plait / onion string on the back wall by the window
    const mGarlic = Mk.flat("#e6dcc4", 0.8);
    for (let i = 0; i < 6; i++) P.add(mGarlic, new THREE.SphereGeometry(0.04, 10, 8).scale(1, 0.85, 1).translate(X(1.85 + (i % 2) * 0.05), 1.95 - i * 0.07, ZB + 0.06), 0.004);
    P.add(mStr, new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6).translate(X(1.87), 1.85, ZB + 0.04), 0.003);
  }

  // ============================================================================================ furniture
  {
    // a three-legged stool (left of the bench)
    const sx = X(-0.62), sz = -1.92;
    P.add(mWood, lathe([[0.001, 0.42], [0.17, 0.42], [0.17, 0.46], [0.001, 0.46]], 18).translate(sx, 0, sz), 0.005);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.3; P.add(mWoodLo, bar(new THREE.Vector3(sx + Math.cos(a) * 0.17, 0, sz + Math.sin(a) * 0.17), new THREE.Vector3(sx + Math.cos(a) * 0.09, 0.43, sz + Math.sin(a) * 0.09), 0.022, 0.022, 8), 0.004); }
    // a basket of fresh-picked herbs on the floor in front of the bench's right end
    const mBasket = Mk.flat("#b88e5a", 0.85);
    P.add(mBasket, lathe([[0.001, 0], [0.13, 0], [0.18, 0.16], [0.17, 0.17], [0.001, 0.12]], 18).translate(X(1.6), 0, -1.55), 0.005);
    P.add(mBasket, new THREE.TorusGeometry(0.14, 0.014, 6, 16, Math.PI).translate(X(1.6), 0.17, -1.55), 0.004);
    const greens = [Mk.flat("#7a8a52", 0.85), Mk.flat("#8e9a5a", 0.85), Mk.flat("#9a7aa0", 0.8)];
    for (let i = 0; i < 6; i++) { const a = i * 1.1; P.add(greens[i % 3], new THREE.SphereGeometry(0.06, 9, 7).translate(X(1.6 + Math.cos(a) * 0.07), 0.17, -1.55 + Math.sin(a) * 0.07), 0.004); }
    // THE NARROW BED (back-left corner): a plain frame, a straw mattress with a rough blanket, a bolster
    const bx0 = X(-2.25), bx1 = X(-0.45), bz0 = ZB + 0.02, bz1 = -1.68;
    P.add(mWoodLo, boxG(bx0, bx1, 0.12, 0.34, bz0, bz1), 0.006);
    for (const x of [bx0 + 0.04, bx1 - 0.04]) for (const z of [bz0 + 0.04, bz1 - 0.04]) P.add(mWoodLo, boxG(x - 0.04, x + 0.04, 0, 0.14, z - 0.04, z + 0.04), 0.004);
    P.add(mWoodLo, boxG(bx0, bx0 + 0.06, 0.12, 0.72, bz0, bz1), 0.006);                     // the head board (at the wall end)
    P.add(Mk.flat("#c8b48c", 0.95), boxG(bx0 + 0.07, bx1 - 0.03, 0.34, 0.45, bz0 + 0.03, bz1 - 0.03), 0.005);             // the mattress
    P.add(Mk.flat("#8a7a62", 0.95), boxG(bx0 + 0.55, bx1 - 0.02, 0.36, 0.475, bz0 + 0.01, bz1 + 0.02), 0.005);            // the blanket
    P.add(Mk.flat("#ddd2bc", 0.95), new THREE.CylinderGeometry(0.09, 0.09, 0.6, 12).rotateX(Math.PI / 2).translate(bx0 + 0.25, 0.53, (bz0 + bz1) / 2), 0.005);
    // a pair of sandals under the bed's foot and a satchel on the wall peg
    // THE WRITING DESK (standing, its sloped top facing the writer at x 1.5): quill, ink, red wax, a sheet.
    // v5 (23 Nov 2026, the owner on the v4 cut: "This prop here I dont think its designed as how its supposed to be?"):
    // it was a sloped board and a ledge on two bare posts, and the lens (by the bench, looking past it at the writer)
    // saw the board's underside over the posts: a stack of planks. It is now a slant-top desk the way a scriptorium's
    // stands: two shaped END PANELS whose top edge carries the slope (the end toward the lens shows the desk in profile:
    // ledge, slope, lip), each with a pointed blind arch sunk into it and a sled foot; a framed back board toward the
    // room; a shelf with books between the ends. The slope, the lip and the ledge are where they were (the shots' marks
    // are on them).
    const dx0 = X(0.85), dx1 = X(1.15), dz0 = -0.85, dz1 = -0.35;
    const slope = new THREE.Matrix4().makeRotationZ(-0.35), SL = Math.tan(0.35), dxm = (dx0 + dx1) / 2;
    /** the slope's underside at x (its face passes through (dxm, 1.0); the board is 25 mm thick) */
    const under = (x: number) => 1.0 - (x - dxm) * SL - 0.025 / Math.cos(0.35);
    const mDeskHi = Mk.flat("#8c6a48", 0.8), mDeskDark = Mk.flat(CC.woodDark, 0.85);
    {
      // an end panel in (x, y), 34 mm thick: the back edge up to under the ledge, the top edge under the slope, the
      // writer's edge, a sled foot fore and aft, and a pointed arch cut through it
      const xb = dx0 - 0.01, xw = dx1 - 0.02, endG = (z0: number) => {
        const sh = new THREE.Shape();
        sh.moveTo(xb - 0.05, 0); sh.lineTo(xb - 0.05, 0.05); sh.quadraticCurveTo(xb - 0.045, 0.1, xb, 0.12);
        sh.lineTo(xb, 1.06); sh.lineTo(xb + 0.1, 1.06); sh.lineTo(xb + 0.1, under(xb + 0.1)); sh.lineTo(xw, under(xw));
        sh.lineTo(xw, 0.12); sh.quadraticCurveTo(xw + 0.045, 0.1, xw + 0.05, 0.05); sh.lineTo(xw + 0.05, 0);
        // (the foot is cut away between its two toes: the desk stands on four points)
        sh.lineTo(xw - 0.03, 0); sh.quadraticCurveTo((xb + xw) / 2, 0.075, xb + 0.03, 0); sh.closePath();
        const xa = (xb + xw) / 2, hw = 0.062, y0 = 0.2, ys = 0.56, yt = 0.7, hole = new THREE.Path();   // (the same xa as the arch's board below)
        hole.moveTo(xa - hw, y0); hole.lineTo(xa - hw, ys); hole.quadraticCurveTo(xa - hw, yt - 0.04, xa, yt); hole.quadraticCurveTo(xa + hw, yt - 0.04, xa + hw, ys); hole.lineTo(xa + hw, y0); hole.closePath();
        sh.holes.push(hole);
        return new THREE.ExtrudeGeometry(sh, { depth: 0.034, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, z0);
      };
      P.add(mWood, endG(dz0), 0.005); P.add(mWood, endG(dz1 - 0.034), 0.005);
      // each arch is BLIND: a dark board closes it 26 mm in (through an open arch the lens saw the Friar's rope tassel
      // hanging behind the desk, a white cone in the dark: first stills of v5)
      const xa = (xb + xw) / 2;
      P.add(mDeskDark, boxG(xa - 0.075, xa + 0.075, 0.19, 0.71, dz1 - 0.042, dz1 - 0.026), 0.003);
      P.add(mDeskDark, boxG(xa - 0.075, xa + 0.075, 0.19, 0.71, dz0 + 0.026, dz0 + 0.042), 0.003);
      // the back board toward the room (between the ends), framed: a stile at each end and three rails stand 8 mm
      // proud of it (the lens sees this back at a slant, a third of the frame wide: bare, it was one dark slab);
      // a rail across its foot, the shelf and its books
      P.add(mWoodLo, boxG(xb + 0.004, xb + 0.026, 0.16, 1.06, dz0 + 0.034, dz1 - 0.034), 0.004);
      for (const [za, zb] of [[dz0 + 0.034, dz0 + 0.09], [dz1 - 0.09, dz1 - 0.034]]) P.add(mWood, boxG(xb - 0.004, xb + 0.004, 0.19, 1.02, za, zb), 0.003);
      for (const [ya, yb] of [[0.19, 0.26], [0.6, 0.655], [0.955, 1.02]]) P.add(mWood, boxG(xb - 0.004, xb + 0.004, ya, yb, dz0 + 0.09, dz1 - 0.09), 0.003);
      P.add(mWood, boxG(xb + 0.004, xb + 0.05, 0.12, 0.19, dz0 + 0.034, dz1 - 0.034), 0.004);
      P.add(mWoodLo, boxG(xb + 0.026, xw - 0.01, 0.4, 0.425, dz0 + 0.034, dz1 - 0.034), 0.004);
      book(P, { cover: Mk.flat("#6e3f34", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, (xb + xw) / 2 + 0.01, 0.425, (dz0 + dz1) / 2 + 0.04, 0.2, 0.15, 0.045, 0.1);
      book(P, { cover: Mk.flat("#4f5a3e", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, (xb + xw) / 2 + 0.005, 0.47, (dz0 + dz1) / 2 + 0.03, 0.17, 0.13, 0.035, -0.2);
      // a moulding under the ledge, toward the room
      P.add(mDeskDark, boxG(xb - 0.012, xb + 0.004, 1.02, 1.06, dz0 - 0.004, dz1 + 0.004), 0.003);
    }
    const top = boxG(-0.2, 0.2, -0.025, 0.0, (dz0 - dz1) / 2 - 0.02, (dz1 - dz0) / 2 + 0.02).applyMatrix4(slope).translate(dxm, 1.0, (dz0 + dz1) / 2);
    P.add(mDeskHi, top, 0.005);
    P.add(mWoodLo, boxG(dx1 - 0.01, dx1 + 0.04, 0.88, 0.95, dz0 - 0.02, dz1 + 0.02), 0.004);   // the lip that holds the sheet
    P.add(mWood, boxG(dx0 - 0.03, dx0 + 0.09, 1.06, 1.1, dz0 - 0.02, dz1 + 0.02), 0.004);      // the flat ledge at the top
    // the sheet on the slope (a thin sheet laid on the top's face)
    const sheet = new THREE.PlaneGeometry(0.22, 0.28).rotateX(-Math.PI / 2).applyMatrix4(slope).translate((dx0 + dx1) / 2 + 0.02, 1.0 + 0.004, (dz0 + dz1) / 2 + 0.02);
    Mk.mesh("cell.desk.sheet", sheet, Mk.tex(pageTex(), 0.9), { cast: false, noink: true });
    // the inkwell and the red wax stick on the ledge (no quill standing in the well: the Friar carries his own, and a
    // standing one sat right in front of his face in Monday's close)
    P.add(Mk.flat("#3e3a40", 0.4), lathe([[0.001, 0], [0.035, 0], [0.04, 0.03], [0.02, 0.05], [0.015, 0.06], [0.001, 0.06]], 12).translate(dx0 + 0.03, 1.1, dz0 + 0.1), 0.004);
    P.add(Mk.flat("#9a2a26", 0.5), new THREE.CylinderGeometry(0.012, 0.012, 0.11, 8).rotateX(Math.PI / 2).translate(dx0 + 0.03, 1.114, dz1 - 0.12), 0.003);
    P.add(Mk.flat("#9a2a26", 0.5), new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12).translate(dx0 + 0.04, 1.106, dz1 - 0.04), 0.003);   // a dropped wax seal
    // a candle stub on the desk ledge (unlit by day)
    P.add(Mk.flat("#e6dcc4", 0.7), new THREE.CylinderGeometry(0.018, 0.02, 0.07, 10).translate(dx0 + 0.04, 1.135, dz0 + 0.025), 0.003);
    // a few books stacked on the floor by the desk (back by the right wall, out of the Friar's walk to the desk)
    book(P, { cover: Mk.flat("#5a4a36", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, dx1 + 0.7, 0, -1.5, 0.3, 0.22, 0.06, 0.2);
    book(P, { cover: Mk.flat("#6e4a3a", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, dx1 + 0.7, 0.06, -1.5, 0.26, 0.2, 0.05, -0.15);
    // a jug and a cup on the window shelf side of the bench end? (a water jug on the floor by the bed)
    jug(P, Mk.flat("#a8845e", 0.65), X(-0.3), 0, -1.55, 0.3, 0.09, 2.2);
  }
  // THE BELL ROPE by the door (the bell hangs outside, over the door): through the ceiling, a knotted end
  {
    const rx = X(XL + 0.14), rz = DOOR.z1 + 0.18, mRope = Mk.flat(CC.rope, 0.85);
    P.add(mRope, new THREE.CylinderGeometry(0.014, 0.014, YC - 0.95, 8).translate(rx, (YC + 0.95) / 2, rz), 0.004);
    P.add(mRope, new THREE.SphereGeometry(0.035, 10, 8).translate(rx, 0.95, rz), 0.004);
    P.add(Mk.flat("#9a6a4a", 0.8), lathe([[0.001, 0], [0.03, 0.02], [0.045, 0.1], [0.02, 0.16], [0.001, 0.17]], 10).translate(rx, 0.75, rz), 0.004);   // the tassel
    P.add(mIron, new THREE.TorusGeometry(0.035, 0.008, 6, 12).rotateX(Math.PI / 2).translate(rx, YC - 0.01, rz), 0.002);
  }
  // pots of herbs by the doorway (growing: rosemary, sage, a little flowering one)
  {
    const mPot = Mk.flat("#b0704e", 0.85), mPotLo = Mk.flat("#9a5e42", 0.85), greens = [Mk.flat("#6e7e48", 0.85), Mk.flat("#8a9a62", 0.85), Mk.flat("#7a8a56", 0.85)];
    for (const [px, pz, s, i] of [[XL + 0.2, DOOR.z1 + 0.42, 1.0, 0], [XL + 0.42, DOOR.z1 + 0.62, 0.8, 1], [XL + 0.2, DOOR.z0 - 0.25, 0.85, 2]] as number[][]) {
      P.add(mPot, lathe([[0.001, 0], [0.08 * s, 0], [0.11 * s, 0.17 * s], [0.125 * s, 0.18 * s], [0.12 * s, 0.21 * s], [0.001, 0.2 * s]], 16).translate(X(px), 0, pz), 0.005);
      for (let k2 = 0; k2 < 5; k2++) { const a = k2 * 1.3 + i; P.add(greens[(k2 + i) % 3], new THREE.SphereGeometry(0.075 * s, 9, 7).scale(1, 1.3, 1).translate(X(px) + Math.cos(a) * 0.05 * s, (0.3 + 0.06 * (k2 % 2)) * s, pz + Math.sin(a) * 0.05 * s), 0.004); }
      if (i === 1) for (let k2 = 0; k2 < 4; k2++) P.add(Mk.flat("#c8a0b8", 0.8), new THREE.SphereGeometry(0.022, 8, 6).translate(X(px) + Math.cos(k2 * 1.6) * 0.06, 0.36 * s + 0.04, pz + Math.sin(k2 * 1.6) * 0.06), 0.003);
    }
    P.add(mPotLo, boxG(X(XL + 0.03), X(XL + 0.33), 0, 0.03, DOOR.z1 + 0.3, DOOR.z1 + 0.55), 0.003);
  }
  P.into(group, "cell.dressing", { cast: true });
  // a round rush mat in the middle of the floor (a sheet at 1 mm: under the figures' contact shadow, FLOOR_SHEET_MAX)
  {
    const t = paint(256, 256, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.save(); g.beginPath(); g.ellipse(W / 2, H / 2, W / 2 - 4, H / 2 - 4, 0, 0, Math.PI * 2); g.clip();
      g.fillStyle = "#c4b07e"; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 14; k++) { g.strokeStyle = css(k % 2 ? "#a8945e" : "#d4c48e", 0.8); g.lineWidth = 6; g.beginPath(); g.ellipse(W / 2, H / 2, (W / 2) * (1 - k / 14), (H / 2) * (1 - k / 14), 0, 0, Math.PI * 2); g.stroke(); }
      g.restore();
      g.strokeStyle = "#7e6a44"; g.lineWidth = 6; g.beginPath(); g.ellipse(W / 2, H / 2, W / 2 - 6, H / 2 - 6, 0, 0, Math.PI * 2); g.stroke();
    });
    const mat = Mk.own("#ffffff", { map: t, rough: 0.95 }); mat.alphaTest = 0.5;
    Mk.mesh("cell.mat", new THREE.PlaneGeometry(1.7, 1.15).rotateX(-Math.PI / 2).translate(X(-0.25), 0.001, -0.75), mat, { cast: false, noink: true });
  }

  // ============================================================================================ the sun: shaft, dust, light
  // the beam from the high window (the same sun that comes in at the door: it lands on the bench's left end)
  const wy1 = HWIN.spring + (HWIN.z1 - HWIN.z0) * 0.4, gx = X(XL + 0.01);
  const corners = [new THREE.Vector3(gx, HWIN.y0, HWIN.z1), new THREE.Vector3(gx, HWIN.y0, HWIN.z0), new THREE.Vector3(gx, wy1, HWIN.z0), new THREE.Vector3(gx, wy1, HWIN.z1)];
  const sdir = new THREE.Vector3(...SUN).normalize().negate();
  const shaft = sunShaft(corners, sdir, 2.7, DL.monday.shaftCol, DL.monday.shaft); shaft.name = "cell.shaft"; group.add(shaft);
  const dust = dustMotes(40, corners, sdir, 2.5, 311); group.add(dust.points);
  // the doorway's beam too (a fainter volume: the door is big)
  const dc = [new THREE.Vector3(gx, 0.05, DOOR.z1), new THREE.Vector3(gx, 0.05, DOOR.z0), new THREE.Vector3(gx, DOOR.spring + 0.3, DOOR.z0 + 0.15), new THREE.Vector3(gx, DOOR.spring + 0.3, DOOR.z1 - 0.15)];
  const doorShaft = sunShaft(dc, sdir, 1.6, DL.monday.shaftCol, DL.monday.shaft * 0.35); doorShaft.name = "cell.doorShaft"; group.add(doorShaft);
  const keyAt: [number, number, number] = [X(0), 0, -0.9];
  const Lr = lightRig(group, { dir: SUN, k: DL.monday.k, col: DL.monday.col, at: keyAt, half: 4.2, hemi: DL.monday.hemi, point: { col: DL.monday.door, k: DL.monday.doorK, at: [X(XL + 0.35), 1.3, (DOOR.z0 + DOOR.z1) / 2], dist: 5.5 } });
  Lr.key.shadow.bias = -0.0004;
  // every lit material's own env share and colour (Tuesday turns them all a little greyer and cooler)
  const envMats: [THREE.MeshStandardMaterial, number, THREE.Color][] = [];
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const q of m ? (Array.isArray(m) ? m : [m]) : []) if ((q as THREE.MeshStandardMaterial).isMeshStandardMaterial && !envMats.some(([e]) => e === q)) envMats.push([q as THREE.MeshStandardMaterial, (q as THREE.MeshStandardMaterial).envMapIntensity, (q as THREE.MeshStandardMaterial).color.clone()]);
  });
  const tint = new THREE.Color();

  let day: Day = "monday";
  const apply = (d: Day) => {
    day = d; const L = DL[d];
    Lr.key.color.set(L.col); Lr.key.intensity = L.k;
    Lr.hemi.color.set(L.hemi[0]); Lr.hemi.groundColor.set(L.hemi[1]); Lr.hemi.intensity = L.hemi[2];
    Lr.point.color.set(L.door); Lr.point.intensity = L.doorK;
    (shaft.material as THREE.MeshBasicMaterial).color.set(L.shaftCol); (shaft.material as THREE.MeshBasicMaterial).opacity = L.shaft;
    (doorShaft.material as THREE.MeshBasicMaterial).color.set(L.shaftCol); (doorShaft.material as THREE.MeshBasicMaterial).opacity = L.shaft * 0.35;
    mSky.color.set(L.out); mOut.color.set(L.out);
    (doorPool.material as THREE.MeshBasicMaterial).opacity = L.pool;
    tint.set(L.tint);
    for (const [m, e, c] of envMats) { m.envMapIntensity = e * L.env; m.color.copy(c).multiply(tint); }
  };
  apply("monday");

  const hide: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "cell.wall.left") hide.push([o, (p) => p.x < X(XL) - 0.02]);
    if (o.name === "cell.wall.right") hide.push([o, (p) => p.x > X(XR) + 0.02]);
    if (o.name === "cell.wall.back") hide.push([o, (p) => p.z < ZB - 0.02]);
    if (o.name === "cell.wall.front") hide.push([o, (p) => p.z > ZF + 0.02]);
  });
  return {
    group,
    view(cam: THREE.Vector3) { for (const [o, behind] of hide) o.visible = !behind(cam); },
    animate(t: number) { dust.update(t, DL[day].dust); },
    setParam(name: string, v: ParamValue) { if (name === "day") apply((DAYS as string[]).includes(String(v)) ? (v as Day) : "monday"); },
    cast(): Partial<CastLight> { return CELL_CAST[day]; },
  };
};

export const CELL: PlaceDef = { look: LOOK, params: PARAMS, build };
