// THE YARD (place "yard", island x 100): his new house on 白鹤峰 (PLAN 1, 8B-D). WP2a's set; the exports are the contract
// of sets/index.ts: YARD_LOOK, YARD_PARAMS, buildYard(K) -> { group, animate, setParam }. Every place number is
// layout/yard.ts (YARD_SET, YARD); its header has the plan.
//
// WHAT THERE IS
//   - the hilltop PLATEAU (one painted ground: grass, the packed-earth yard inside the fence, the worn path from the gate
//     to the door, stone flags under the veranda, a soot patch by the stove, the vegetable beds, the hill road outside
//     the fence); the hill falling away round it (a heightfield), the river valley, the far hills and the sky (one
//     painted panorama all round + the sky dome);
//   - THE HOUSE: pale fresh timber frame and cream plaster, a grey tiled gable roof out over a VERANDA (four round posts
//     on stone bases, a beam), the plank door with the board 「德有邻堂」 over it, a lattice window either side;
//   - the stove corner's dressing (left of the door: the woodpile, the water jar, a broom, chillies and a straw hat on
//     the wall); baskets and a potted orange right of the bench;
//   - the rail FENCE round the yard and THE GATE (two tall posts under a little tiled lintel, two slatted leaves:
//     param `gate`); THE LYCHEE TREE heavy with red fruit at the plateau's left edge; the bamboo grove behind the house;
//     two chickens; the vegetable beds;
//   - the set's own dressing params: the red LANTERN under the veranda beam (`lantern`), the lychee-SHELL pile at the
//     bed's foot (`shells`), the sun (`sun`).
// INK / FLICKER: plaster, timber frames, planks, tiles, lattices, the ground, the road and the far valley are PAINT; inked
// geometry is chunky (posts 16-18 cm, rails 8 cm, gate slats 9 cm); fruit, the dressing, the lantern, the shells and
// the chickens are props-kit Parts (NOINK + their own hull); the bamboo cards and the panorama are NOINK.
// SET vs PROP: the stove, the stool and wine bowl, the bench, the ladder, the rattan bed, the carried lantern, the dog
// and the horse are WP3's props (PLAN 4): the set leaves their marks clear.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, soft, skyDome, groundTex, Batch, type SkyStops } from "../../../kit/sets/okit";
import { YARD_SET as S, YARD, YX } from "../layout/yard";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, shade, glowSprite, latticePaint, terrainG, addLantern, type LanternMats } from "./parts/common";
import { V3, tileTex, boardTex, boardWordsTex, plasterTex, slabG, boxM, gableG, gableRoof, blobG, bentLimb, makeChicken, cloudPuff, panoramaRing, hillRange, type RoofMats } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.5, 0.46, 0.38]], [-10, [0.62, 0.6, 0.5]], [4, [0.86, 0.87, 0.85]], [30, [0.7, 0.8, 0.92]], [90, [0.6, 0.72, 0.9]]],
  boxes: [{ az: -50, el: 40, rot: 0, w: 40, h: 22, soft: 14, col: [1.0, 0.93, 0.8] }],
};
/** DAYLIGHT on the hill: a warm sun (its direction by `sun`), a clear sky; the figures held under 1 */
export const YARD_LOOK: PlaceLook = {
  bg: "#b8d4ea",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.8, color: "#3a3046" },
  cast: {
    key: [0.55, 0.62, 0.55], tint: [1.0, 0.94, 0.84], tintK: 0.8, gain: 0.94, grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.95, 1.0],
    shade: [1.04, 0.96, 1.32], shadeK: 0.36, wrap: [28, 56], edge: 0.13, broad: 0.1, bodySat: 0.13, sheen: 0.08, lift: 0.015, contactLen: 0.4,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** the per-frame dressing: sun "morning" | "noon" | "afternoon" (the sun's direction and warmth), lantern 0..1 (the red
 *  lantern hung under the veranda beam at YARD.lantern: 0 none, 1 hung and lit), shells 0..1 (the shell pile at
 *  YARD.shells: 1 = up to his knee), gate 0..1 (NEW: the gate's two leaves, 0 shut .. 1 swung wide into the yard) */
export const YARD_PARAMS: Record<string, ParamValue> = { sun: "morning", lantern: 0, shells: 0, gate: 1 };

const COL = {
  grass: "#9cad6a", grassHi: "#b2c07c", grassLo: "#7e9456", earth: "#c9b088", earthHi: "#dac5a0", earthLo: "#ad946c", flag: "#b4aea2", flagLo: "#8e887e",
  soil: "#8a6a4a", soilLo: "#6e5038", plaster: "#f2e8d0", timber: "#d8b07a", timberLo: "#ae8656", timberHi: "#ecd2a2", stone: "#a8a49a",
  tile: "#7a7f8c", trim: "#5c5e6a", under: "#c8a274", door: "#c09060", doorLo: "#946a44", board: "#3a2c22", gold: "#ecc462", boardFrame: "#8a5a34",
  paper: "#f4ead2", fence: "#a88a62", fenceLo: "#866a4a", gateRed: "#9a4a36",
  trunk: "#7a6250", trunkLo: "#5e4a3e", crown: ["#4a8a46", "#5a9c50", "#3f7a40"], fruit: "#d8343a", fruitLo: "#b0262c", stem: "#6a5a2a",
  shell: "#a84a3a", shellLo: "#7e3a30", shellHi: "#c0603e", shellIn: "#e6d4b0", jar: "#8a5a3a", jarLo: "#6a4430", wood: "#b08a5c", woodEnd: "#d8bc8a", basket: "#c8a26a",
  chilli: "#c8322a", straw: "#d8bf7a", leaf: "#5a9a4a", orange: "#f0a030", pot: "#a8603c",
  lantern: "#e0402e", lanternCap: "#2e2a30", tassel: "#e2b03a",
};
const SKY: SkyStops = [[-10, "#dde6ea"], [0, "#f0ece2"], [6, "#dfe9f0"], [18, "#b6d4ee"], [40, "#8cbce6"], [90, "#70a6dc"]];
/** the sun per `sun`: direction (toward the light), colour, strength, the hemisphere's sky / ground and strength */
const SUN: Record<string, { dir: [number, number, number]; col: string; k: number; hemi: [string, string, number] }> = {
  morning: { dir: [0.75, 0.48, 0.45], col: "#ffe2b8", k: 2.2, hemi: ["#d6e4f2", "#a89070", 1.0] },
  noon: { dir: [0.25, 0.9, 0.35], col: "#fff6e8", k: 2.3, hemi: ["#dce8f4", "#ae9876", 1.05] },
  afternoon: { dir: [-0.7, 0.55, 0.45], col: "#ffd9a8", k: 2.2, hemi: ["#d8e2ee", "#b08c68", 1.0] },
};
const X = (x: number) => YX + x;

// ---------------------------------------------------------------------------------------------------- the paintings
/** THE PLATEAU's ground (one painted square round the yard): grass, the packed-earth yard, paths, flags, beds, road */
const GR = { cx: X(3), cz: -2, size: 36 };
const paintPlateau = () => groundTex(GR.cx, GR.cz, GR.size, 2048, COL.grass, (g, k) => {
  const r = rng(301), PX = k.px, PZ = k.pz, s = k.s, Y = S.yard;
  for (let i = 0; i < 160; i++) blotch(g, k.S * (0.04 + 0.92 * r()), k.S * (0.04 + 0.92 * r()), (0.8 + 2.4 * r()) * s, r() < 0.5 ? COL.grassHi : COL.grassLo, 0.22);
  // the hill road on the shelf outside the fence (from the right edge of the painting to the gate)
  const road: [number, number][] = [[X(30), 6.4], ...YARD.road.map((p) => [p.x, p.z] as [number, number]), [YARD.courier.x, YARD.courier.z], [S.gate.x, S.fence.z]];
  const strokePath = (w: number, col: string, a: number) => { g.strokeStyle = css(col, a); g.lineWidth = w * s; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); road.forEach(([x, z], i) => (i ? g.lineTo(PX(x), PZ(z)) : g.moveTo(PX(x), PZ(z)))); g.stroke(); };
  soft(g, 0.5 * s, () => { strokePath(S.road.w + 0.5, COL.earthLo, 0.5); strokePath(S.road.w, COL.earth, 1); });
  soft(g, 0.25 * s, () => { for (const off of [-0.45, 0.45]) { g.save(); g.translate(0, off * s); strokePath(0.35, COL.earthHi, 0.7); g.restore(); } });
  // the yard: packed earth inside the fence (soft-edged), the worn path gate -> door, flags under the veranda
  soft(g, 0.3 * s, () => { g.fillStyle = COL.earth; g.fillRect(PX(Y.x0 + 0.1), PZ(Y.z0 - 0.3), (Y.x1 - Y.x0 - 0.2) * s, (Y.z1 - Y.z0 + 0.15) * s); });
  for (let i = 0; i < 60; i++) blotch(g, PX(Y.x0 + (Y.x1 - Y.x0) * r()), PZ(Y.z0 + (Y.z1 - Y.z0) * r()), (0.6 + 1.6 * r()) * s, r() < 0.5 ? COL.earthHi : COL.earthLo, 0.2);
  soft(g, 0.5 * s, () => { g.strokeStyle = css(COL.earthHi, 0.8); g.lineWidth = 1.1 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(PX(S.gate.x), PZ(S.fence.z)); g.quadraticCurveTo(PX(X(1.4)), PZ(0.2), PX(X(0)), PZ(-3.6)); g.stroke(); });
  { const z0 = S.house.z1, z1 = S.veranda.z + 0.3, x0 = S.house.x0 - 0.2, x1 = S.house.x1 + 0.2;
    g.fillStyle = COL.flag; g.fillRect(PX(x0), PZ(z0), (x1 - x0) * s, (z1 - z0) * s);
    g.fillStyle = COL.flagLo; for (let x = x0; x <= x1; x += 0.55) g.fillRect(PX(x), PZ(z0), 2, (z1 - z0) * s);
    for (let z = z0; z <= z1; z += 0.42) g.fillRect(PX(x0), PZ(z), (x1 - x0) * s, 2);
    g.fillStyle = "rgba(70,62,54,0.35)"; g.fillRect(PX(x0), PZ(z1) - 2, (x1 - x0) * s, 4); }
  // the soot and ash round the stove, the fallen leaves under the lychee tree
  blotch(g, PX(YARD.stove.x), PZ(YARD.stove.z), 0.9 * s, "#8a7a68", 0.35);
  for (let i = 0; i < 220; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * S.lychee.crown, x = PX(S.lychee.x + Math.cos(a) * d), y = PZ(S.lychee.z + Math.sin(a) * d); g.fillStyle = css(r() < 0.6 ? "#7a8a48" : "#a8823e", 0.6); g.beginPath(); g.ellipse(x, y, 3, 1.6, a, 0, 7); g.fill(); }
  // the vegetable beds right of the yard (rows of tilled soil along x)
  for (let j = 0; j < 5; j++) { const z = -0.7 + j * 0.68; g.fillStyle = COL.soil; g.fillRect(PX(X(3.7)), PZ(z), 2.5 * s, 0.42 * s); g.fillStyle = COL.soilLo; g.fillRect(PX(X(3.7)), PZ(z + 0.36), 2.5 * s, 0.06 * s); }
  // grass tufts outside the yard
  for (let i = 0; i < 1400; i++) {
    const x = k.S * (0.04 + 0.92 * r()), y = k.S * (0.04 + 0.92 * r());
    g.strokeStyle = css(r() < 0.5 ? COL.grassLo : COL.grassHi, 0.6); g.lineWidth = 1.5;
    for (let b = 0; b < 3; b++) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (b - 1) * 3 + (r() - 0.5) * 2, y - 5 - 4 * r()); g.stroke(); }
  }
  // straw and chips in the yard
  for (let i = 0; i < 260; i++) { const x = PX(Y.x0 + (Y.x1 - Y.x0) * r()), y = PZ(Y.z0 + (Y.z1 - Y.z0) * r()), a = r() * 3.14, l = 4 + 5 * r(); g.strokeStyle = css(r() < 0.6 ? COL.straw : "#9a845a", 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
});
/** the falling hill round the plateau (top-down over YARD_SET.ground): grass, scrub, darker bushes */
const paintSlope = () => paint(1024, 1024, (g, W, H) => {
  const r = rng(307); g.fillStyle = COL.grass; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) blotch(g, W * r(), H * r(), 8 + 26 * r(), r() < 0.45 ? COL.grassHi : r() < 0.7 ? COL.grassLo : "#6a8448", 0.3);
  for (let i = 0; i < 140; i++) { g.fillStyle = css(r() < 0.5 ? "#5e7a42" : "#6e8a4a", 0.7); g.beginPath(); g.ellipse(W * r(), H * r(), 4 + 6 * r(), 3 + 4 * r(), 0, 0, 7); g.fill(); }
});
/** THE FRONT WALL (8 m x h): cream plaster, a grey stone plinth, the pale timber frame (posts, the rail under the
 *  windows, the top beam, the frieze struts under the eave); the door and the windows are geometry over it */
const frontWallTex = (h: number) => paint(1024, Math.round((1024 * h) / 8), (g, W, H) => {
  const r = rng(311), m = W / 8, X0 = (x: number) => (x + 4) * m, Yp = (y: number) => H - y * m;
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), 20 + 40 * r(), r() < 0.5 ? "#fffaf0" : "#d8ccb0", 0.12);
  // the plinth
  g.fillStyle = COL.stone; g.fillRect(0, Yp(0.32), W, 0.32 * m);
  g.fillStyle = shade(COL.stone, -0.22); for (let x = 0; x < W; x += 0.5 * m) g.fillRect(x + (Math.floor(x / (0.5 * m)) % 2) * 0.25 * m, Yp(0.32), 3, 0.32 * m);
  g.fillRect(0, Yp(0.16), W, 3); g.fillRect(0, Yp(0.32), W, 4);
  const beam = (y0: number, y1: number, x0 = -4, x1 = 4) => { g.fillStyle = COL.timber; g.fillRect(X0(x0), Yp(y1), (x1 - x0) * m, (y1 - y0) * m); g.fillStyle = COL.timberHi; g.fillRect(X0(x0), Yp(y1), (x1 - x0) * m, 3); g.fillStyle = COL.timberLo; g.fillRect(X0(x0), Yp(y0) - 4, (x1 - x0) * m, 4); };
  const post = (x: number, y0: number, y1: number, w = 0.17) => { g.fillStyle = COL.timber; g.fillRect(X0(x - w / 2), Yp(y1), w * m, (y1 - y0) * m); g.fillStyle = COL.timberHi; g.fillRect(X0(x - w / 2), Yp(y1), 3, (y1 - y0) * m); g.fillStyle = COL.timberLo; g.fillRect(X0(x + w / 2) - 4, Yp(y1), 4, (y1 - y0) * m); };
  // the rail under the windows, the top beam, the frieze with its struts, the top plate
  beam(0.8, 0.92, -4, -0.8); beam(0.8, 0.92, 0.8, 4);
  beam(2.72, 2.9);
  for (let x = -3.6; x <= 3.65; x += 0.9) if (Math.abs(x) > 0.85) post(x, 2.9, h, 0.09);
  beam(h - 0.14, h);
  for (const x of [-3.92, -3.0, -1.02, 1.02, 3.0, 3.92]) post(x, 0.32, h);
  // grain streaks on the timber (pale fresh wood)
  g.strokeStyle = "rgba(170,128,80,0.25)"; g.lineWidth = 1.5;
  for (let i = 0; i < 90; i++) { const x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + 30 * r(), y + (r() - 0.5) * 2); g.stroke(); }
});
/** a plank door leaf (pale boards, two battens, an iron ring) */
const doorTex = () => paint(256, 512, (g, W, H) => {
  const r = rng(313); g.fillStyle = COL.door; g.fillRect(0, 0, W, H);
  for (let i = 1; i < 4; i++) { g.fillStyle = COL.doorLo; g.fillRect((W * i) / 4 - 2, 0, 4, H); }
  for (let i = 0; i < 30; i++) { g.strokeStyle = "rgba(120,80,50,0.25)"; g.lineWidth = 1.5; const x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y + 30 + 40 * r()); g.stroke(); }
  for (const y of [0.16, 0.84]) { g.fillStyle = shade(COL.door, 0.08); g.fillRect(0, H * y - 12, W, 24); g.fillStyle = COL.doorLo; g.fillRect(0, H * y + 10, W, 3); }
  g.strokeStyle = "#3a3236"; g.lineWidth = 6; g.beginPath(); g.arc(W * 0.86, H * 0.5, 16, 0, 7); g.stroke();
  g.fillStyle = "#3a3236"; g.beginPath(); g.arc(W * 0.86, H * 0.5 - 16, 7, 0, 7); g.fill();
});
/** a lattice window (warm paper behind a pale step lattice) */
const windowTex = () => paint(512, 464, (g, W, H) => { latticePaint(g, 0, 0, W, H, { wood: COL.timberLo, woodLo: shade(COL.timberLo, -0.25), paper: COL.paper, paperHi: "#fbf4e2", cell: 60, frame: 14, kind: "step" }); });
/** the woodpile's face: log ends stacked */
const logEndsTex = () => paint(512, 256, (g, W, H) => {
  const r = rng(317); g.fillStyle = "#6a5040"; g.fillRect(0, 0, W, H);
  for (let y = H - 18; y > 0; y -= 30) for (let x = 14 + ((y / 30) % 2) * 15; x < W; x += 31) {
    const rr = 13 + 3 * r(); g.fillStyle = COL.wood; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    g.fillStyle = COL.woodEnd; g.beginPath(); g.arc(x, y, rr - 3, 0, 7); g.fill();
    g.strokeStyle = "rgba(140,100,60,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, rr * 0.5, 0, 7); g.stroke();
  }
});
/** the bamboo grove (an alpha card): culms with nodes, leaf sprays above, a dark undergrowth at the foot */
const bambooTex = (seed: number) => paint(1024, 1024, (g, W, H) => {
  const r = rng(seed), greens = ["#6f9c58", "#5f8c4c", "#7caa62", "#86b06a"];
  for (let i = 0; i < 46; i++) {
    const x = W * r(), w = 7 + 9 * r(), top = H * (0.02 + 0.3 * r()), lean = (r() - 0.5) * 40, col = greens[Math.floor(r() * greens.length)];
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, H); g.quadraticCurveTo(x + lean * 0.3, (H + top) / 2, x + lean, top); g.stroke();
    g.strokeStyle = shade(col, -0.3); g.lineWidth = w + 2;
    for (let y = H - 40; y > top + 20; y -= 46 + 20 * r()) { const u = (H - y) / (H - top), xx = x + lean * u * u; g.beginPath(); g.moveTo(xx - w / 2 - 1, y); g.lineTo(xx + w / 2 + 1, y); g.lineWidth = 3; g.stroke(); }
  }
  // leaf sprays in clumps (gaps between them: the sky shows through)
  for (let c = 0; c < 70; c++) {
    const cx = W * r(), cy = H * (0.06 + 0.55 * Math.pow(r(), 1.2)), rad = 40 + 60 * r();
    for (let i = 0; i < 40; i++) {
      const q = r() * 6.28, d = rad * Math.sqrt(r()), x = cx + Math.cos(q) * d, y = cy + Math.sin(q) * d * 0.7, a = (r() - 0.5) * 1.4 + (r() < 0.5 ? 0.5 : -0.5), l = 14 + 14 * r();
      g.fillStyle = r() < 0.35 ? "#4e7e3e" : r() < 0.7 ? "#5f9248" : "#7eae5e"; g.beginPath(); g.ellipse(x, y, l, 3.4, a, 0, 7); g.fill();
    }
  }
  const ug = g.createLinearGradient(0, H * 0.78, 0, H); ug.addColorStop(0, "rgba(72,104,60,0)"); ug.addColorStop(0.35, "rgba(72,104,60,1)"); ug.addColorStop(1, "rgba(60,88,52,1)");
  g.fillStyle = ug; for (let i = 0; i < 40; i++) { const x = W * r(); g.beginPath(); g.ellipse(x, H * 0.95, 40 + 50 * r(), H * (0.12 + 0.08 * r()), 0, 0, 7); g.fill(); }
});
/** the shell pile's skin (a 1 m tile): red-brown knobbly half shells, their white insides here and there */
const shellTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(319); g.fillStyle = shade(COL.shellLo, -0.15); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const x = W * r(), y = H * r(), rr = 6 + 5 * r(), inside = r() < 0.1;
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) {
      g.fillStyle = inside ? shade(COL.shellIn, -0.1) : r() < 0.5 ? COL.shell : COL.shellHi; g.beginPath(); g.ellipse(x + dx, y + dy, rr, rr * 0.8, r() * 3, 0, 7); g.fill();
      if (!inside) { g.fillStyle = "rgba(90,30,24,0.35)"; g.beginPath(); g.arc(x + dx + 2, y + dy + 1, 1.6, 0, 7); g.fill(); }
    }
  }
}, true);

// ---------------------------------------------------------------------------------------------------- the builder
export function buildYard(K: Kit) {
  const group = new THREE.Group(); group.name = "set-yard";
  const Mk = maker(K, group), B = new Batch(), Pd = new Part(K), fl = (c: string, rough = 0.8) => K.flat(c, { rough });
  const mPlaster = Mk.tex(plasterTex(321, COL.plaster), 0.9), mTile = Mk.tex(tileTex(323, { base: COL.tile }), 0.85), mTrim = Mk.flat(COL.trim, 0.8);
  const mUnder = Mk.tex(boardTex(325, { base: COL.under, n: 4, lying: true }), 0.9), mTimber = Mk.tex(boardTex(327, { base: COL.timber, n: 2 }), 0.85), mStone = Mk.flat(COL.stone, 0.9);
  const roofM: RoofMats = { tile: mTile, under: mUnder, trim: mTrim };
  const Hs = S.house;

  // =================================================================================================== the ground
  {
    const P = S.plateau, geo = new THREE.PlaneGeometry(P.x1 - P.x0, P.z1 - P.z0, 1, 1).rotateX(-Math.PI / 2).translate((P.x0 + P.x1) / 2, 0, (P.z0 + P.z1) / 2);
    const pp = geo.attributes.position as THREE.BufferAttribute, uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) - GR.cx) / GR.size + 0.5, 0.5 - (pp.getZ(i) - GR.cz) / GR.size);
    Mk.mesh("yard.ground", geo, Mk.tex(paintPlateau(), 0.95), { cast: false });
    // the hill falling away outside the plateau (a heightfield 4 cm under it inside)
    const G = S.ground, drop = (x: number, z: number) => { const d = Math.max(0, P.x0 - x, x - P.x1, P.z0 - z, z - P.z1); return -0.04 - (0.55 * d * d) / (d + 3); };
    Mk.mesh("yard.hill", terrainG(G.x0, G.x1, G.z0, G.z1, 80, 80, 0, drop), Mk.tex(paintSlope(), 0.95), { cast: false });
  }

  // =================================================================================================== THE HOUSE
  // the roof first (its underside sets the walls' tops): front edge (eave z, y), ridge over the footprint's middle
  const zB = Hs.z0 - (Hs.eave.z - Hs.z1), zM = (Hs.eave.z + zB) / 2;
  const under = gableRoof((m, g) => B.add(m, g), roofM, { x0: Hs.x0, x1: Hs.x1, zF: Hs.eave.z, zB, yE: Hs.eave.y, yR: Hs.ridge, over: 0.45, t: 0.12, tile: 1 });
  const wallH = under(Hs.z1), apex = under(zM) + 0.02;
  // the soffit under the front slope (veranda ceiling boards) from the wall to the eave
  B.add(mUnder, slabG(V3(Hs.x1 + 0.45, under(Hs.eave.z + 0.05) - 0.01, Hs.eave.z + 0.05), V3(Hs.x0 - 0.45, under(Hs.eave.z + 0.05) - 0.01, Hs.eave.z + 0.05), V3(Hs.x0 - 0.45, wallH - 0.01, Hs.z1), V3(Hs.x1 + 0.45, wallH - 0.01, Hs.z1), 0.02, 1));
  // the body (plaster), the painted front, the gable ends, corner posts and the top band on the sides
  B.add(mPlaster, boxM(Hs.x0, Hs.x1, 0, wallH, Hs.z0, Hs.z1 - 0.01, 1));
  B.add(Mk.tex(frontWallTex(wallH), 0.9), new THREE.PlaneGeometry(Hs.x1 - Hs.x0, wallH).translate((Hs.x0 + Hs.x1) / 2, wallH / 2, Hs.z1));
  B.add(mPlaster, gableG(Hs.x0, Hs.z0, Hs.z1, wallH - 0.01, zM, apex, false)); B.add(mPlaster, gableG(Hs.x1, Hs.z0, Hs.z1, wallH - 0.01, zM, apex, true));
  for (const x of [Hs.x0, Hs.x1]) {
    for (const z of [Hs.z0, Hs.z1]) B.add(mTimber, boxM(x - 0.09, x + 0.09, 0.3, wallH, z - 0.09, z + 0.09));
    B.add(mTimber, boxM(x - 0.05, x + 0.05, wallH - 0.14, wallH, Hs.z0, Hs.z1)); B.add(mTimber, boxM(x - 0.05, x + 0.05, 0.85, 0.95, Hs.z0, Hs.z1));
    B.add(mStone, boxM(x - 0.04, x + 0.04, 0, 0.32, Hs.z0, Hs.z1));
  }
  // the door: the frame (jambs, lintel, threshold) and two plank leaves a little ajar
  const D = S.door, dz = Hs.z1, dx0 = D.x - D.w / 2, dx1 = D.x + D.w / 2;
  for (const x of [dx0 - 0.07, dx1 + 0.07]) B.add(mTimber, boxM(x - 0.07, x + 0.07, 0, D.h + 0.12, dz - 0.02, dz + 0.1));
  B.add(mTimber, boxM(dx0 - 0.14, dx1 + 0.14, D.h, D.h + 0.14, dz - 0.02, dz + 0.11));
  B.add(mStone, boxM(dx0 - 0.1, dx1 + 0.1, 0, 0.09, dz - 0.02, dz + 0.14));
  const mDoor = Mk.tex(doorTex(), 0.85), mDark = Mk.flat("#3a2e2a", 0.9);
  B.add(mDark, new THREE.PlaneGeometry(D.w, D.h).translate(D.x, D.h / 2, dz + 0.004));
  for (const [hx, k] of [[dx0, 1], [dx1, -1]] as [number, number][]) {
    const leaf = new THREE.PlaneGeometry(D.w / 2 - 0.01, D.h - 0.1).translate((k * (D.w / 2 - 0.01)) / 2, (D.h - 0.1) / 2 + 0.09, 0);
    B.add(mDoor, leaf.rotateY(-k * 0.12).translate(hx, 0, dz + 0.012));
  }
  // the board 「德有邻堂」 over the door (painted words on its front)
  { const Bd = S.board, side = Mk.flat(COL.boardFrame, 0.8);
    Mk.mesh("yard.board", new THREE.BoxGeometry(Bd.w, Bd.h, 0.07).translate(Bd.x, Bd.y, dz + 0.06), [side, side, side, side, Mk.tex(boardWordsTex("德有邻堂", { bg: COL.board, fg: COL.gold, frame: COL.boardFrame, w: 1024, h: 300 }), 0.7), side], { cast: false }); }
  // the windows: a lattice over warm paper, a chunky frame
  const mWin = Mk.tex(windowTex(), 0.9), Wn = S.windows;
  for (const wx of Wn.x) {
    const x0 = wx - Wn.w / 2, x1 = wx + Wn.w / 2;
    B.add(mWin, new THREE.PlaneGeometry(Wn.w, Wn.y1 - Wn.y0).translate(wx, (Wn.y0 + Wn.y1) / 2, dz + 0.01));
    B.add(mTimber, boxM(x0 - 0.08, x1 + 0.08, Wn.y0 - 0.1, Wn.y0, dz - 0.02, dz + 0.1)); B.add(mTimber, boxM(x0 - 0.08, x1 + 0.08, Wn.y1, Wn.y1 + 0.09, dz - 0.02, dz + 0.08));
    for (const x of [x0 - 0.04, x1 + 0.04]) B.add(mTimber, boxM(x - 0.04, x + 0.04, Wn.y0, Wn.y1, dz - 0.02, dz + 0.07));
  }
  // the veranda: four round posts on stone bases, the beam
  const Vr = S.veranda;
  for (const x of Vr.posts) {
    B.add(mTimber, new THREE.CylinderGeometry(0.085, 0.09, Vr.beam[1], 14).translate(x, Vr.beam[1] / 2, Vr.z));
    B.add(mStone, new THREE.CylinderGeometry(0.13, 0.16, 0.14, 14).translate(x, 0.07, Vr.z));
  }
  B.add(mTimber, boxM(Hs.x0 - 0.3, Hs.x1 + 0.3, Vr.beam[0], Vr.beam[1], Vr.z - 0.08, Vr.z + 0.08));
  for (const x of Vr.posts) B.add(mTimber, boxM(x - 0.05, x + 0.05, Vr.beam[1] - 0.02, under(Vr.z) - 0.005, Vr.z - 0.06, Vr.z + 0.06));
  // the back wall's window (seen from nowhere much: plain) — none; the back is plaster

  // =================================================================================================== the stove corner and the right of the door (dressing)
  {
    // the woodpile under the left window: a stack (log ends painted) with a few loose logs on top
    const wz0 = Hs.z1 - 0.02, wz1 = Hs.z1 + 0.42, wx0 = X(-3.85), wx1 = X(-2.85), wh = 0.72;
    const ends = Mk.tex(logEndsTex(), 0.9), bark = Mk.flat("#7a5c44", 0.9);
    Mk.mesh("yard.woodpile", new THREE.BoxGeometry(wx1 - wx0, wh, wz1 - wz0).translate((wx0 + wx1) / 2, wh / 2, (wz0 + wz1) / 2), [ends, ends, bark, bark, ends, bark]);
    for (let k = 0; k < 3; k++) Pd.add(fl(k === 1 ? "#8a6a4e" : "#7a5c44", 0.9), new THREE.CylinderGeometry(0.075, 0.075, 0.42, 10).rotateX(Math.PI / 2).translate(wx0 + 0.22 + k * 0.28, wh + 0.075, (wz0 + wz1) / 2), 0.006);
    // the water jar by the door, its wooden lid and a ladle
    const jx = X(-1.2), jz = Hs.z1 + 0.32;
    Pd.add(fl(COL.jar, 0.6), lathe([[0.0, 0.0], [0.17, 0.0], [0.25, 0.18], [0.27, 0.36], [0.22, 0.56], [0.2, 0.6], [0.0, 0.6]], 20).translate(jx, 0, jz), 0.008);
    Pd.add(fl(COL.wood, 0.8), new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20).translate(jx, 0.615, jz), 0.006);
    Pd.add(fl("#8a6a44", 0.8), bar(V3(jx - 0.05, 0.64, jz + 0.02), V3(jx + 0.2, 0.7, jz + 0.12), 0.012, 0.012, 6), 0.004);
    // a broom leaning on the left veranda post's wall side, chillies and a straw hat on the wall
    const bx = X(-2.35), bzz = Hs.z1 + 0.1;
    Pd.add(fl("#a8824e", 0.8), bar(V3(bx, 0.35, bzz + 0.12), V3(bx + 0.05, 1.45, bzz), 0.015, 0.015, 6), 0.004);
    Pd.add(fl(COL.straw, 0.9), new THREE.ConeGeometry(0.15, 0.42, 12).scale(1, 1, 0.4).rotateX(-0.1).translate(bx, 0.21, bzz + 0.15), 0.006);
    for (let k = 0; k < 7; k++) Pd.add(fl(COL.chilli, 0.6), new THREE.ConeGeometry(0.022, 0.12, 8).rotateX(Math.PI).translate(X(-0.94) + (k % 2) * 0.03, 1.95 - k * 0.07, Hs.z1 + 0.035), 0.003);
    Pd.add(fl("#8a6a44", 0.8), new THREE.CylinderGeometry(0.006, 0.006, 0.55, 5).translate(X(-0.93), 1.75, Hs.z1 + 0.03), 0);
    Pd.add(fl(COL.straw, 0.9), new THREE.ConeGeometry(0.3, 0.14, 18).rotateX(Math.PI / 2).translate(X(-3.45), 1.78, Hs.z1 + 0.08), 0.006);
    // right of the bench: stacked baskets, a potted orange tree by the corner post
    Pd.add(fl(COL.basket, 0.9), lathe([[0.0, 0.0], [0.2, 0.0], [0.24, 0.28], [0.0, 0.28]], 16).translate(X(3.3), 0, Hs.z1 + 0.3), 0.007);
    Pd.add(fl(shade(COL.basket, -0.1), 0.9), lathe([[0.0, 0.0], [0.17, 0.0], [0.21, 0.24], [0.0, 0.24]], 16).translate(X(3.32), 0.28, Hs.z1 + 0.3), 0.007);
    const ox = X(3.55), oz = Vr.z + 0.35;
    Pd.add(fl(COL.pot, 0.7), lathe([[0.0, 0.0], [0.15, 0.0], [0.2, 0.3], [0.0, 0.3]], 16).translate(ox, 0, oz), 0.007);
    Pd.add(fl("#6a5040", 0.9), bar(V3(ox, 0.28, oz), V3(ox, 0.62, oz), 0.025, 0.02, 6), 0.004);
    Pd.add(fl(COL.leaf, 0.85), blobG(331, 1, 0.2).scale(0.3, 0.26, 0.3).translate(ox, 0.82, oz), 0.007);
    for (let k = 0; k < 6; k++) { const a = k * 1.1; Pd.add(fl(COL.orange, 0.6), new THREE.SphereGeometry(0.04, 8, 6).translate(ox + Math.cos(a) * 0.26, 0.76 + 0.08 * Math.sin(k * 2.3), oz + Math.sin(a) * 0.24 + 0.04), 0.004); }
  }

  // =================================================================================================== the fence and THE GATE
  const gateLeaves: THREE.Group[] = [];
  {
    const F = S.fence, mF = Mk.tex(boardTex(335, { base: COL.fence, n: 1 }), 0.9), g0 = S.gate.x - S.gate.w / 2, g1 = S.gate.x + S.gate.w / 2;
    const run = (ax: number, az: number, bx: number, bz: number) => {
      const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 1.6)), yaw = Math.atan2(bx - ax, bz - az) - Math.PI / 2;
      for (let i = 0; i <= n; i++) { const u = i / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u; B.add(mF, boxM(x - 0.06, x + 0.06, 0, F.h + 0.08, z - 0.06, z + 0.06)); }
      for (const y of [0.32, 0.68, F.h - 0.04]) B.add(mF, new THREE.BoxGeometry(len, 0.08, 0.05).rotateY(yaw).translate((ax + bx) / 2, y, (az + bz) / 2));
    };
    run(F.x0, F.z, g0 - 0.1, F.z); run(g1 + 0.1, F.z, F.x1, F.z);
    run(F.x0, Hs.z1, F.x0, F.z); run(F.x1, Hs.z1, F.x1, F.z);
    run(F.x0, Hs.z1, Hs.x0 - 0.1, Hs.z1); run(Hs.x1 + 0.1, Hs.z1, F.x1, Hs.z1);
    // the gate posts and their little tiled lintel
    const mG = Mk.flat(COL.gateRed, 0.75), top = 2.25;
    for (const x of [g0 - 0.09, g1 + 0.09]) { B.add(mG, boxM(x - 0.08, x + 0.08, 0, top, F.z - 0.08, F.z + 0.08)); B.add(mStone, boxM(x - 0.13, x + 0.13, 0, 0.16, F.z - 0.13, F.z + 0.13)); }
    B.add(mG, boxM(g0 - 0.35, g1 + 0.35, top - 0.2, top, F.z - 0.07, F.z + 0.07));
    gableRoof((m, g) => B.add(m, g), roofM, { x0: g0 - 0.35, x1: g1 + 0.35, zF: F.z + 0.42, zB: F.z - 0.42, yE: top + 0.08, yR: top + 0.36, over: 0.12, t: 0.07, tile: 1, curl: false });
    // the two slatted leaves, hinged at the posts (param gate: they swing into the yard, -z)
    const lw = S.gate.w / 2 - 0.02;
    for (const [hx, k] of [[g0, 1], [g1, -1]] as [number, number][]) {
      const leaf = new THREE.Group(); leaf.name = "yard.gateLeaf"; leaf.position.set(hx, 0, F.z); group.add(leaf); gateLeaves.push(leaf);
      const LB = new Batch(), x = (u: number) => k * u;
      for (let i = 0; i < 5; i++) { const u = 0.08 + (i * (lw - 0.16)) / 4; LB.add(mF, boxM(Math.min(x(u - 0.045), x(u + 0.045)), Math.max(x(u - 0.045), x(u + 0.045)), 0.1, 1.22, -0.025, 0.025)); }
      for (const y of [0.26, 1.0]) LB.add(mF, boxM(Math.min(x(0.02), x(lw)), Math.max(x(0.02), x(lw)), y - 0.045, y + 0.045, -0.05, -0.02));
      LB.add(mF, new THREE.BoxGeometry(Math.hypot(lw - 0.1, 0.74), 0.07, 0.03).rotateZ(k * Math.atan2(0.74, lw - 0.1)).translate(x(lw / 2), 0.63, -0.05));
      LB.flush(leaf, "yard.gateLeaf");
      leaf.userData.k = k;
    }
  }

  // =================================================================================================== THE LYCHEE TREE
  {
    const L = S.lychee, base = V3(L.x, 0, L.z), bark = fl(COL.trunk, 0.9), barkLo = fl(COL.trunkLo, 0.9), r = rng(341);
    const fork = V3(L.x + 0.1, 1.9, L.z + 0.05);
    for (const g of bentLimb(base.clone().add(V3(0, -0.05, 0)), fork, 0.24, 0.17, V3(0.12, 0, 0.06))) Pd.add(bark, g, 0.012);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * 6.28 + 0.5; Pd.add(barkLo, bar(V3(L.x + Math.cos(a) * 0.36, 0, L.z + Math.sin(a) * 0.36), V3(L.x + Math.cos(a) * 0.08, 0.55, L.z + Math.sin(a) * 0.08), 0.07, 0.12, 8), 0.01); }
    const lumps: [number, number, number, number][] = [[0.0, 4.5, 0.0, 1.7], [1.3, 3.95, 0.9, 1.3], [-1.2, 4.0, 0.8, 1.35], [0.9, 4.0, -1.2, 1.3], [-1.1, 4.2, -1.0, 1.35], [0.4, 5.2, 0.5, 1.2], [1.9, 3.7, -0.1, 1.05], [-0.3, 3.75, 1.7, 1.1], [-1.9, 3.8, 0.1, 1.0]];
    for (const [dx, y, dz] of lumps.slice(1, 6)) for (const g of bentLimb(fork, V3(L.x + dx * 0.7, y - 0.5, L.z + dz * 0.7), 0.12, 0.06, V3(0, 0.25, 0))) Pd.add(bark, g, 0.01);
    const BC = new Batch(), mC = COL.crown.map((cc) => Mk.flat(cc, 0.9));
    lumps.forEach(([dx, y, dz, rr], i) => BC.add(mC[i % 3], blobG(343 + i, 2, 0.2).scale(rr * 1.12, rr * 0.74, rr * 1.12).translate(L.x + dx, y, L.z + dz)));
    BC.flush(group, "yard.lychee.crown", true, true);
    // the fruit: clusters of red lychees on the crown's outside (mostly toward the yard and the camera sides), a few hanging low
    const red = fl(COL.fruit, 0.55), redLo = fl(COL.fruitLo, 0.6), stem = fl(COL.stem, 0.8);
    for (let c = 0; c < 64; c++) {
      const [dx, y, dz, rr] = lumps[c % lumps.length];
      let a = r() * 6.28; if (r() < 0.65) a = 0.2 + r() * 2.2;               // the +x / +z side (toward the yard)
      const el = 0.1 - r() * 1.1, d = V3(Math.cos(a) * Math.cos(el), Math.sin(el) * 0.8, Math.sin(a) * Math.cos(el));
      const p = V3(L.x + dx + d.x * rr * 1.22, y + d.y * rr * 1.05, L.z + dz + d.z * rr * 1.22);
      Pd.add(stem, bar(p.clone().add(V3(0, 0.14, 0)), p.clone().add(V3(0, 0.02, 0)), 0.008, 0.008, 5), 0);
      const n = 4 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) Pd.add(i % 3 ? red : redLo, new THREE.SphereGeometry(0.05, 9, 7).translate(p.x + (r() - 0.5) * 0.14, p.y - 0.02 - r() * 0.1, p.z + (r() - 0.5) * 0.14), 0.004);
    }
  }

  // =================================================================================================== the bamboo grove behind the house, the far shrubs
  {
    const cards: [number, number, number, number, number][] = [[X(-5.5), -12.4, 13, 8.6, 351], [X(5.5), -13.0, 13, 9.0, 353], [X(0), -14.6, 20, 9.6, 355], [X(12), -11.6, 9, 7.0, 359]];
    for (const [x, z, w, h, seed] of cards) {
      const m = Mk.own("#ffffff", { map: bambooTex(seed), rough: 0.9, side: THREE.DoubleSide }); m.alphaTest = 0.5;
      const card = Mk.mesh("yard.bamboo", new THREE.PlaneGeometry(w, h).translate(x, h / 2 - 0.1, z), m, { cast: false, receive: false, noink: true });
      card.renderOrder = -10;
    }
  }

  // =================================================================================================== the vegetable beds' greens, the chickens
  {
    const greens = [fl("#5e9a4c", 0.85), fl("#74ae5a", 0.85), fl("#4e8a40", 0.85)];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) Pd.add(greens[(i + j) % 3], blobG(361 + i * 7 + j, 1, 0.25).scale(0.2, 0.13, 0.2).translate(X(3.95 + i * 0.5), 0.09, -0.49 + j * 0.68), 0.006);
  }
  const hens = [makeChicken(K, true), makeChicken(K, false)];
  YARD.hens.forEach((p, i) => { hens[i].group.position.copy(p); hens[i].group.rotation.y = i ? -2.2 : 0.9; group.add(hens[i].group); });

  // =================================================================================================== THE LANTERN under the veranda beam (param lantern), THE SHELL PILE (param shells)
  const lan = new THREE.Group(); lan.name = "yard.lantern"; group.add(lan);
  const Lp = YARD.lantern, lanPaper = Mk.own(COL.lantern, { rough: 0.7 });
  {
    const P = new Part(K), mats: LanternMats = { paper: lanPaper, cap: fl(COL.lanternCap, 0.6), tassel: fl(COL.tassel, 0.6) };
    addLantern(P, mats, 0, -0.05, 0, 0.42, 0.05);
    P.into(lan, "yard.lantern", { cast: true, receive: false });
    const glow = glowSprite(0.55, "#ffb070", 0.0); glow.position.set(0, -0.28, 0.12); glow.name = "yard.lantern.glow"; lan.add(glow);
    lan.position.copy(Lp);
  }
  const pile = new THREE.Group(); pile.name = "yard.shells"; group.add(pile);
  {
    // a low mound (a lathe heap, bumped) under a crust of separate shells: its outline is lumpy, it reads as shells
    const P = new Part(K), skin = K.flat("#ffffff", { map: shellTex(), rough: 0.7 }), r = rng(371);
    const prof: [number, number][] = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12; prof.push([0.46 * Math.pow(1 - u, 0.8) + 0.01, 0.42 * (1 - Math.pow(1 - u, 1.6))]); }
    const mound = lathe(prof, 18);
    P.add(skin, mound, 0.006);
    const red = fl(COL.shell, 0.75), redLo = fl(COL.shellLo, 0.8), redHi = fl(COL.shellHi, 0.75), white = fl(COL.shellIn, 0.7);
    for (let k = 0; k < 70; k++) {
      const a = r() * 6.28, u = Math.sqrt(r()) * 1.12, rr = Math.min(0.47, 0.46 * u), hgt = u < 1 ? 0.42 * (1 - Math.pow(u, 1.6)) : 0.0, s = 0.05 + 0.025 * r();
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr, open = r() < 0.15;
      P.add([red, redLo, redHi][k % 3], new THREE.SphereGeometry(s, 9, 6).scale(1, 0.5, 0.85).rotateZ((r() - 0.5) * 0.8).rotateY(r() * 3).translate(x, hgt + s * 0.15, z), 0.003);
      if (open) P.add(white, new THREE.CircleGeometry(s * 0.72, 10).rotateX(-Math.PI / 2).translate(x, hgt + s * 0.52 + 0.002, z), 0);
    }
    P.into(pile, "yard.shells", { cast: true, receive: true });
    pile.position.set(YARD.shells.x, 0, YARD.shells.z);
  }

  // =================================================================================================== the valley panorama, the sky
  group.add(panoramaRing(YX, 0, S.view.z, S.view.y0, S.view.y1, 4096, 640, 1.5, (g, k) => {
    const r = rng(381), hz = k.row(0);
    const sg = g.createLinearGradient(0, 0, 0, hz); sg.addColorStop(0, "#9cc4e6"); sg.addColorStop(0.7, "#cfe0ec"); sg.addColorStop(1, "#eef0e8");
    g.fillStyle = sg; g.fillRect(0, 0, k.W, hz + 2);
    for (let i = 0; i < 16; i++) cloudPuff(g, k.W * r(), k.row(7 + 9 * r()), 90 + 150 * r(), r);
    // the valley floor (below the horizon): hazy fields near the horizon, greener nearer (lower)
    const fg = g.createLinearGradient(0, hz, 0, k.H); fg.addColorStop(0, "#c4d0c4"); fg.addColorStop(0.25, "#a8bc98"); fg.addColorStop(1, "#86a070");
    g.fillStyle = fg; g.fillRect(0, hz, k.W, k.H - hz);
    for (let i = 0; i < 200; i++) { const x = k.W * r(), y = k.row(-1 - 13 * Math.pow(r(), 1.4)), w = 20 + 60 * r(); g.fillStyle = css(r() < 0.5 ? "#b8c88e" : "#94ae78", 0.45); g.fillRect(x, y, w, 4 + 6 * r()); }
    // THE RIVER (东江) winding across the valley in front and to the left: a silver-blue band, wider where nearer
    const riverAt = (az: number) => -3.0 - 2.6 * Math.sin(((az - 120) / 220) * Math.PI) + 0.8 * Math.sin(az / 23);
    g.fillStyle = "#b4d0e2"; g.beginPath();
    const a0 = 95, a1 = 330, pts: [number, number, number][] = [];
    for (let az = a0; az <= a1; az += 2) { const e = riverAt(az), wdt = 0.6 + 0.12 * -e; pts.push([k.col(az), k.row(e + wdt / 2), k.row(e - wdt / 2)]); }
    pts.forEach(([x, y0], i) => (i ? g.lineTo(x, y0) : g.moveTo(x, y0))); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][2]); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2; for (let i = 0; i < 70; i++) { const p = pts[Math.floor(r() * pts.length)], y = p[1] + (p[2] - p[1]) * r(); g.beginPath(); g.moveTo(p[0], y); g.lineTo(p[0] + 10 + 18 * r(), y); g.stroke(); }
    // boats on the river (dark slivers with a pale sail), the far town's roofs across it (惠州)
    for (let i = 0; i < 7; i++) { const p = pts[Math.floor(8 + r() * (pts.length - 16))], y = (p[1] + p[2]) / 2; g.fillStyle = "#4a4440"; g.fillRect(p[0], y, 14, 3); g.fillStyle = "#efe6d4"; g.beginPath(); g.moveTo(p[0] + 6, y); g.lineTo(p[0] + 6, y - 12); g.lineTo(p[0] + 13, y - 1); g.closePath(); g.fill(); }
    for (let i = 0; i < 70; i++) { const x = k.col(195 + 55 * r()), y = k.row(-0.6 - 0.9 * r()), w = 6 + 8 * r(); g.fillStyle = "#ece4d4"; g.fillRect(x, y - 5, w, 5); g.fillStyle = "#7c808c"; g.fillRect(x - 1, y - 7, w + 2, 3); }
    // the far hills all round (two hazy ranges), the nearer crest behind the house (bearings round 0)
    hillRange(g, k.W, hz + 1, hz, hz - k.row(4.5), 3, 1.3, "#a9bccb");
    hillRange(g, k.W, hz + 1, hz + 1, hz - k.row(2.2), 5, 4.1, "#8fa9b4");
    // (a column's bearing folded to -180..180: the crest rises only within 70 deg of -z)
    g.fillStyle = "#7c9a7a"; g.beginPath(); g.moveTo(0, hz + 2);
    for (let x = 0; x <= k.W; x += 4) { const a = ((k.az(x) + 180) % 360) - 180, e = Math.abs(a) < 70 ? 2.5 + 4.5 * Math.cos((a / 70) * (Math.PI / 2)) + 0.6 * Math.sin(a / 7) : -1; g.lineTo(x, k.row(e)); }
    g.lineTo(k.W, hz + 2); g.closePath(); g.fill();
    const hzg = g.createLinearGradient(0, k.row(3), 0, k.row(-2)); hzg.addColorStop(0, "rgba(236,238,232,0)"); hzg.addColorStop(0.5, "rgba(236,238,232,0.45)"); hzg.addColorStop(1, "rgba(236,238,232,0)");
    g.fillStyle = hzg; g.fillRect(0, k.row(3), k.W, k.row(-2) - k.row(3));
  }));
  group.add(skyDome(new THREE.Vector3(YX, 0, 0), SKY));

  B.flush(group, "yard.build");
  Pd.into(group, "yard.dressing", { cast: true, receive: false });

  // =================================================================================================== the light
  const L0 = lightRig(group, { dir: SUN.morning.dir, k: SUN.morning.k, col: SUN.morning.col, at: [X(-0.5), 0, -1.0], half: 11, hemi: SUN.morning.hemi, point: { col: "#ff9a5a", k: 0, at: [Lp.x, Lp.y - 0.3, Lp.z + 0.25], dist: 3.5 } });
  const setSun = (s: string) => {
    const q = SUN[s] ?? SUN.morning;
    L0.key.position.copy(L0.key.target.position).addScaledVector(new THREE.Vector3(...q.dir).normalize(), 30); L0.key.color.set(q.col); L0.key.intensity = q.k;
    L0.hemi.color.set(q.hemi[0]); L0.hemi.groundColor.set(q.hemi[1]); L0.hemi.intensity = q.hemi[2];
  };
  let lanK = 0, gateK = 1;
  const glowMat = (lan.getObjectByName("yard.lantern.glow") as THREE.Mesh).material as THREE.MeshBasicMaterial;
  const pose = (t: number) => {
    hens.forEach((hn, i) => hn.animate(t, i * 1.3));
    lan.rotation.z = 0.03 * Math.sin(t * 1.3); lan.rotation.x = 0.02 * Math.sin(t * 0.9 + 1);
  };
  const setLantern = (k: number) => {
    lanK = Math.max(0, Math.min(1, k)); lan.visible = lanK > 0.01;
    lanPaper.emissive.set(COL.lantern); lanPaper.emissiveIntensity = 0.55 * lanK; glowMat.opacity = 0.5 * lanK; L0.point.intensity = 0.7 * lanK;
  };
  const setGate = (k: number) => { gateK = Math.max(0, Math.min(1, k)); for (const lf of gateLeaves) lf.rotation.y = (lf.userData.k as number) * 1.75 * gateK; };
  setSun("morning"); setLantern(0); setGate(1); pile.visible = false; pose(0);
  return {
    group,
    animate(t: number) { pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "sun") setSun(String(v));
      else if (name === "lantern") setLantern(Number(v));
      else if (name === "shells") { const k = Math.max(0, Math.min(1, Number(v))); pile.visible = k > 0.01; pile.scale.set(0.45 + 0.55 * k, Math.max(0.04, k), 0.45 + 0.55 * k); }
      else if (name === "gate") setGate(Number(v));
    },
  };
}
