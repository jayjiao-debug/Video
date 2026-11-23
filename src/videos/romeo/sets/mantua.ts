// THE MANTUA (place "mantua", island x = ISLAND.mantua): scene 7, Wednesday noon. Set builder C. Marks and cameras:
// places.ts STAGE.mantua. The opposite of Verona's warmth: a bare, bleached street under a flat white noon light.
//
// WHAT THERE IS (the cameras look down the street toward -z)
//   - a long straight street 5.2 m wide (house fronts at x -2.6 and +2.6) of packed pale dust, two worn wheel ruts
//     down it, a few stones;
//   - low pale houses (one and two storeys, 3.4 to 5 m) of bleached lime plaster, flat tops behind low parapets or a
//     low pale-tiled roof, FEW windows (small, shut with grey boards, or dark), plank doors; a stretch of bare wall;
//   - a DEAD TREE leaning out of a gap on the left (z -6.8), bare grey limbs;
//   - a WELL on the right near the camera (z -2.8): a round stone curb, a wooden frame, a bucket;
//   - THE TOWN GATE closing the far end (z -31): a squat crenellated tower with an arched passage, the bright empty
//     country seen through it (a painted card); where the rider leaves (the shots add the horse: prop horseRider);
//   - pale dust drifting low over the street (animate, a pure function of t);
//   - (v5, the owner on the v4 cut: "Add more details to this scene") WHAT A TOWN LEAVES OUT AT ITS NOON REST, all of
//     it bleached: a handcart with a wheel off (the wheel lies beside it), barrels (one on its side), a fallen jar,
//     sacks and crates at a door, a bench, a dry trough, the apothecary's sign (a mortar) on its iron arm, a ladder, a
//     faded awning, a market stall stripped to its poles, dry pots, door steps. All at the wall feet: Romeo's way down
//     the middle and the rider's down the right are clear.
// THE LIGHT: the sun nearly overhead, white; the hemisphere strong and pale: almost no shadow, short ones straight down.
// Nothing warm, nothing red. Seeded painting.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, mix, toHex, blotch, skyDome, farCard, limb, NOINK, type SkyStops } from "../../../kit/sets/okit";
import { maker } from "../../newton/sets/parts/common";
import { ISLAND } from "../places";
import { Batch, boxG, house, houseAt, frontTex, tilesTex, raftersTex, softCard, holedWall, type FrontPal, type Win } from "./parts/c_town";
import { gridLines, patchG, metrePaint } from "./parts/ground";
import { dresser, MANTUA_DRESS } from "./parts/d_dress";

const X0 = ISLAND.mantua;
/** the Mantua street's numbers (local to the island) */
export const MANTUA_SET = { fxL: -2.6, fxR: 2.6, gateZ: -31, tree: [-1.95, -6.8] as [number, number], well: [1.5, -3.1] as [number, number], bush: [-0.95, -2.3] as [number, number] };
const S = MANTUA_SET;

const CAST = {
  key: [0.15, 0.95, 0.28], tint: [1.0, 1.0, 0.98], tintK: 0.5, gain: 0.97, grad: 0.2, bodyGrad: 0.14, sideTint: [0.95, 0.95, 1.0],
  shade: [1.02, 0.98, 1.14], shadeK: 0.26, wrap: [30, 58], edge: 0.14, broad: 0.05, bodySat: 0.08, sheen: 0.05, lift: 0.03, contactLen: 0,
} as unknown as Partial<CastLight>;
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.8, 0.77, 0.72]], [-10, [0.86, 0.83, 0.78]], [4, [0.96, 0.95, 0.93]], [40, [0.94, 0.95, 0.96]], [90, [0.95, 0.96, 0.97]]],
  boxes: [{ az: 70, el: 80, rot: 0, w: 40, h: 30, soft: 20, col: [1.1, 1.08, 1.04] }],
};
const LOOK: PlaceLook = {
  bg: "#ecebe6",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 0.85, color: "#7a7680" },
  cast: { ...CAST, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.25,
};
const PARAMS: Record<string, ParamValue> = {};
const SKY: SkyStops = [[-10, "#dcd8ce"], [0, "#f2f0ea"], [12, "#eeefea"], [40, "#e6e9e8"], [90, "#dde2e3"]];
const PAL = (wall: string, o: Partial<FrontPal> = {}): FrontPal => ({
  wall, wallLo: toHex(mix(wall, "#bdb6aa", 0.35)), wallHi: toHex(mix(wall, "#ffffff", 0.5)), trim: toHex(mix(wall, "#d8d0c2", 0.5)), shutter: "#a29c92", plinth: "#cbc2b2", line: "#6a6258",
  brick: "#bca896", dark: "#5e5856", ...o,
});
const WALLS = [PAL("#f2eee4"), PAL("#ece6da"), PAL("#f4f0e8"), PAL("#e8e3d8"), PAL("#f0eade")];

/** the doors of the street: [side, z of its middle, width] (the HOUSES table below, by hand: the thresholds) */
const DOORS: [number, number, number][] = [[-1, 2.6, 1.0], [-1, -3.0, 1.0], [-1, -11.0, 1.05], [-1, -16.4, 1.0], [-1, -26.0, 1.0], [1, -25.4, 1.0], [1, -19.0, 1.05], [1, -10.9, 1.0], [1, -7.6, 1.0], [1, 5.0, 1.0]];
type G2 = CanvasRenderingContext2D;
/** THE STREET'S FLOOR, painted in METRES (x across, from the island's middle; z along; parts/ground.ts metrePaint):
 *  packed pale earth with two worn wheel ruts and the hoof prints of the rider who just left, a footway of worn
 *  flagstones under each row of houses, a stone threshold at every door, two cross drains of small setts, a damp
 *  ring round the well, cracks, pebbles, straw. Bleached: nothing warm, nothing red. `px` = one pixel in metres. */
const streetPaint = (g: G2, px: number) => {
  const r = rng(72), X = S.fxR, Z0 = S.gateZ - 3.2, Z1 = 12.2, FW = 0.66;        // FW = the footways' width
  const line = (pts: [number, number][], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = Math.max(w, px * 0.8); g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z))); g.stroke(); };
  g.fillStyle = "#ddd2bc"; g.fillRect(-X - 0.1, Z0, 2 * X + 0.2, Z1 - Z0);
  // uneven tone
  for (let i = 0; i < 1500; i++) blotch(g, -X + 2 * X * r(), Z0 + (Z1 - Z0) * r(), 0.22 + 0.5 * r(), r() < 0.5 ? "#e8e0cc" : "#cbbfa6", 0.22);
  // the cartway is trodden a little darker than the footways
  { const gr = g.createLinearGradient(-X, 0, X, 0), c = "198,186,160"; for (const [t, a] of [[0, 0], [0.16, 0], [0.26, 0.2], [0.74, 0.2], [0.84, 0], [1, 0]]) gr.addColorStop(t, `rgba(${c},${a})`); g.fillStyle = gr; g.fillRect(-X, Z0, 2 * X, Z1 - Z0); }
  // fine grain
  for (let i = 0; i < 26000; i++) { g.fillStyle = r() < 0.5 ? "rgba(150,136,116,0.22)" : "rgba(250,246,236,0.22)"; g.fillRect(-X + 2 * X * r(), Z0 + (Z1 - Z0) * r(), 0.012 + 0.03 * r(), 0.012 + 0.022 * r()); }
  // THE WHEEL RUTS: a soft trodden band, a darker groove in it, a pale raised lip on its outer side
  for (const [x0, ph] of [[-0.66, 0.4], [0.66, 2.1]] as [number, number][]) {
    const way = (z: number) => x0 + 0.05 * Math.sin(z * 0.33 + ph) + 0.025 * Math.sin(z * 1.07 + ph * 2);
    const pts: [number, number][] = []; for (let z = Z1; z >= Z0; z -= 0.2) pts.push([way(z), z]);
    line(pts, 0.34, "rgba(170,154,128,0.28)"); line(pts, 0.15, "rgba(150,134,108,0.42)"); line(pts, 0.05, "rgba(128,112,90,0.4)");
    line(pts.map(([x, z]) => [x + Math.sign(x0) * 0.13, z]), 0.045, "rgba(244,238,224,0.6)");
    line(pts.map(([x, z]) => [x - Math.sign(x0) * 0.11, z]), 0.03, "rgba(240,234,220,0.4)");
  }
  // an older pair of ruts, half worn away, that wanders across the first
  for (const [x0, ph] of [[-0.3, 1.3], [1.0, 2.9]] as [number, number][]) {
    for (let z = Z1; z > Z0; z -= 2.6 + 3 * r()) {
      const len = 1.2 + 2.2 * r(), pts: [number, number][] = []; for (let q = 0; q <= len; q += 0.2) pts.push([x0 + 0.18 * Math.sin((z - q) * 0.21 + ph), z - q]);
      line(pts, 0.1, "rgba(160,144,118,0.22)");
    }
  }
  // THE RIDER'S HOOF PRINTS: down the right of the street and in to the middle at the gate (shots/segG.ts RIDE), fresh
  for (let z = 6, k = 0; z > Z0; z -= 0.62 + 0.1 * r(), k++) {
    const t = Math.min(1, Math.max(0, (-6 - z) / 20)), cx = 1.1 - 0.82 * t * t * (3 - 2 * t) + (k % 2 ? 0.11 : -0.11);
    for (const dz of [0, 0.17]) {
      g.strokeStyle = "rgba(120,104,84,0.5)"; g.lineWidth = Math.max(0.02, px); g.lineCap = "round";
      g.beginPath(); g.arc(cx + 0.03 * (r() - 0.5), z + dz, 0.055, Math.PI * 0.12, Math.PI * 0.88, false); g.stroke();
      g.fillStyle = "rgba(246,240,226,0.5)"; g.beginPath(); g.ellipse(cx, z + dz - 0.06, 0.05, 0.022, 0, 0, 7); g.fill();     // the dust it threw back
    }
  }
  // cracks in the dry earth
  for (let i = 0; i < 70; i++) {
    let x = (-X + FW + 0.1) + (2 * X - 2 * FW - 0.2) * r(), z = Z0 + (Z1 - Z0) * r(), a = r() * 6.28; const pts: [number, number][] = [[x, z]];
    for (let k = 0, n = 3 + Math.floor(5 * r()); k < n; k++) { a += (r() - 0.5) * 1.5; const l = 0.1 + 0.28 * r(); x += Math.cos(a) * l; z += Math.sin(a) * l; pts.push([x, z]); }
    line(pts, 0.012, "rgba(126,110,90,0.42)");
    if (r() < 0.5) { const [bx, bz] = pts[1 + Math.floor(r() * (pts.length - 2))], b = a + 1.3; line([[bx, bz], [bx + Math.cos(b) * 0.16, bz + Math.sin(b) * 0.16]], 0.009, "rgba(126,110,90,0.36)"); }
  }
  // THE FOOTWAYS: two rows of worn flagstones under each row of houses
  const stone = (x0: number, z0: number, w: number, d: number) => {
    const j = 0.014, c = 0.03 + 0.03 * r(), tone = r();
    g.fillStyle = tone < 0.33 ? "#d9d2c3" : tone < 0.66 ? "#cfc8b8" : "#c8c0af";
    g.beginPath(); g.moveTo(x0 + j + c, z0 + j); g.lineTo(x0 + w - j - c * r(), z0 + j + 0.01 * r()); g.lineTo(x0 + w - j, z0 + d - j - c * r()); g.lineTo(x0 + j + c * r(), z0 + d - j); g.lineTo(x0 + j, z0 + j + c); g.closePath(); g.fill();
    g.strokeStyle = "rgba(128,118,100,0.55)"; g.lineWidth = Math.max(0.012, px); g.lineJoin = "round"; g.stroke();
    blotch(g, x0 + w * (0.3 + 0.4 * r()), z0 + d * (0.3 + 0.4 * r()), Math.min(w, d) * 0.45, r() < 0.5 ? "#e6e0d2" : "#bdb4a2", 0.3);
    if (r() < 0.3) line([[x0 + w * r(), z0 + j], [x0 + w * (0.3 + 0.4 * r()), z0 + d * (0.4 + 0.3 * r())], [x0 + w * r(), z0 + d - j]], 0.008, "rgba(120,110,94,0.45)");      // a cracked one
  };
  for (const sx of [-1, 1]) {
    g.fillStyle = "#b7ad99"; g.fillRect(sx > 0 ? X - FW : -X, Z0, FW, Z1 - Z0);                                       // the joints' bed
    for (let col = 0; col < 2; col++) for (let z = Z0 - r() * 0.4; z < Z1;) {
      const d = 0.36 + 0.42 * r(), xa = sx > 0 ? X - FW + col * (FW / 2) : -X + col * (FW / 2);
      stone(xa, z, FW / 2, d); z += d;
    }
    // the kerb line: where the flags end and the earth begins, a worn edge with dust swept against it
    const ex = sx * (X - FW), pts: [number, number][] = []; for (let z = Z1; z >= Z0; z -= 0.25) pts.push([ex - sx * (0.02 + 0.02 * Math.sin(z * 2.1 + sx)), z]);
    line(pts, 0.05, "rgba(238,232,218,0.55)"); line(pts.map(([x, z]) => [x + sx * 0.035, z]), 0.016, "rgba(120,110,92,0.5)");
  }
  // a stone threshold at every door
  for (const [sx, dz, dw] of DOORS) {
    const w = dw + 0.3, d = 0.46, x0 = sx > 0 ? X - d : -X;
    g.fillStyle = "#e2dccf"; g.fillRect(x0, dz - w / 2, d, w); g.strokeStyle = "rgba(118,108,92,0.6)"; g.lineWidth = Math.max(0.014, px); g.strokeRect(x0, dz - w / 2, d, w);
    blotch(g, x0 + d / 2, dz, 0.3, "#b9af9c", 0.4);                                                                   // worn in its middle
  }
  // TWO CROSS DRAINS of small setts, kerb to kerb
  for (const dz of [-8.9, -21.4]) {
    g.fillStyle = "#b3a995"; g.fillRect(-X + FW, dz - 0.19, 2 * (X - FW), 0.38);
    for (let row = 0; row < 2; row++) for (let x = -X + FW + (row ? 0.07 : 0); x < X - FW - 0.05;) {
      const w = 0.13 + 0.07 * r(); g.fillStyle = r() < 0.5 ? "#d3ccbc" : "#c6beac";
      g.beginPath(); g.roundRect(x + 0.008, dz - 0.18 + row * 0.185 + 0.008, Math.min(w, X - FW - x) - 0.016, 0.17, 0.02); g.fill(); x += w;
    }
    line([[-X + FW, dz], [X - FW, dz]], 0.02, "rgba(110,100,84,0.5)");
  }
  // damp round the well, and the splashes its bucket left
  { const [wx, wz] = S.well; blotch(g, wx, wz, 1.25, "#a89c86", 0.5); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 0.75 + 0.5 * r(); g.fillStyle = "rgba(150,138,118,0.4)"; g.beginPath(); g.ellipse(wx + Math.cos(a) * d, wz + Math.sin(a) * d, 0.03 + 0.05 * r(), 0.02 + 0.03 * r(), a, 0, 7); g.fill(); } }
  // pebbles: a pale top over a dark foot
  for (let i = 0; i < 900; i++) {
    const x = -X + 2 * X * r(), z = Z0 + (Z1 - Z0) * r(), rr = 0.012 + 0.026 * r() * r();
    g.fillStyle = "rgba(118,106,88,0.55)"; g.beginPath(); g.ellipse(x + rr * 0.25, z + rr * 0.3, rr, rr * 0.75, 0, 0, 7); g.fill();
    g.fillStyle = r() < 0.5 ? "#e9e3d4" : "#cdc5b3"; g.beginPath(); g.ellipse(x, z, rr, rr * 0.75, 0, 0, 7); g.fill();
  }
  // wisps of old straw
  for (let i = 0; i < 520; i++) { const x = -X + 2 * X * r(), z = Z0 + (Z1 - Z0) * r(), a = r() * 3.14, l = 0.04 + 0.09 * r(); line([[x, z], [x + Math.cos(a) * l, z + Math.sin(a) * l]], 0.007, r() < 0.5 ? "rgba(206,196,160,0.75)" : "rgba(168,158,128,0.6)"); }
};

function build(K: Kit): PlaceBuild {
  const group = new THREE.Group(); group.name = "mantua";
  const Mk = maker(K, group), BT = new Batch();
  const L = (x: number) => X0 + x;
  const roof = { tile: Mk.tex(tilesTex(71, "#cfc4b4", "#b0a696", "#e2dacc"), 0.95), under: Mk.tex(raftersTex("#9a9286", "#7a746c"), 0.95), fascia: Mk.flat("#a8a096", 0.9), end: Mk.flat("#ddd6c8", 0.92) };
  const mDoorBack = Mk.tex(paint(128, 256, (g, W, H) => { g.fillStyle = "#a49c90"; g.fillRect(0, 0, W, H); g.strokeStyle = "#7e776e"; g.lineWidth = 4; for (let x = 0; x < W; x += W / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.fillStyle = "#8a8378"; g.fillRect(0, H * 0.22, W, 12); g.fillRect(0, H * 0.72, W, 12); }), 0.92), mReveal = Mk.flat("#d6cebe", 0.92);

  // ---------------------------------------------------------------------------------------------- the ground
  // (v5, the owner on the v4 cut: "Add more details to this scene, also the ground(walking path) keeps clipping with
  // each other and causing issues". The ground was ONE quad of 100 x 120 m with the wheel ruts as a transparent sheet
  // 0.6 mm over it: at 15 to 30 m the depth buffer cannot hold the two apart and they fought on every frame. Now the
  // street's floor is one painting, in metres, with everything that lies on it painted INTO it, on a grid:
  // parts/ground.ts.)
  const dust = Mk.tex(paint(512, 512, (g, W, H) => {
    const r = rng(72); g.fillStyle = "#ddd2bc"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const x = W * r(), y = H * r(), rr = 30 + 70 * r(); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, rr, r() < 0.5 ? "#e8e0cc" : "#cbbfa6", 0.22); }
    for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? "rgba(150,136,116,0.22)" : "rgba(250,246,236,0.2)"; g.fillRect(W * r(), H * r(), 2 + 4 * r(), 2 + 3 * r()); }
  }, true), 0.97);
  {
    // the grid's lines: 1 m cells where her lens is (it stands at x 0.6, z 1.8, 2.6 m up), the street's edges and the
    // seams of its two paintings as lines of their own
    const ZA = S.gateZ - 3, ZM = -12, ZC = 12;
    const xs = gridLines(L(-50), L(50), L(-7), L(7), 1, [L(S.fxL), L(S.fxR)]), zs = gridLines(-90, 30, -16, 8, 1, [ZA, ZM, ZC]);
    const tile = (x: number, z: number): [number, number] => [(x - X0) / 3.6, -z / 3.6];
    Mk.mesh("mantua.ground", patchG(xs, zs, L(-50), L(S.fxL), -90, 30, 0, tile), dust, { cast: false });
    Mk.mesh("mantua.ground", patchG(xs, zs, L(S.fxR), L(50), -90, 30, 0, tile), dust, { cast: false });
    Mk.mesh("mantua.ground", patchG(xs, zs, L(S.fxL), L(S.fxR), -90, ZA, 0, tile), dust, { cast: false });
    Mk.mesh("mantua.ground", patchG(xs, zs, L(S.fxL), L(S.fxR), ZC, 30, 0, tile), dust, { cast: false });
    // the street between the house fronts: near her lens at 168 px a metre, the far end at 96
    for (const [z0, z1, ppm] of [[ZM, ZC, 168], [ZA, ZM, 96]] as [number, number, number][]) {
      const MP = metrePaint(S.fxL, S.fxR, z0, z1, ppm);
      const tex = paint(MP.W, MP.H, (g) => { MP.begin(g); streetPaint(g, 1 / ppm); });
      Mk.mesh("mantua.street", patchG(xs, zs, L(S.fxL), L(S.fxR), z0, z1, 0, (x, z) => MP.uvOf(x - X0, z)), Mk.tex(tex, 0.97), { cast: false });
    }
  }

  // ---------------------------------------------------------------------------------------------- the houses
  type HS = { side: "L" | "R"; z0: number; z1: number; h: number; wins: Win[]; roof: "flat" | "eaves"; door?: { u: number; w: number; h: number; arch?: number } };
  const HOUSES: HS[] = [
    { side: "L", z0: 7, z1: 0.6, h: 4.6, roof: "eaves", wins: [{ u: 1.6, y0: 2.75, y1: 3.45, w: 0.55, kind: "plank" }], door: { u: 4.4, w: 1.0, h: 2.1 } },
    { side: "L", z0: 0.6, z1: -5.6, h: 3.6, roof: "flat", wins: [{ u: 1.2, y0: 1.3, y1: 1.85, w: 0.5, kind: "dark" }], door: { u: 3.6, w: 1.0, h: 2.05, arch: 0.4 } },
    { side: "L", z0: -8.0, z1: -14.5, h: 4.9, roof: "eaves", wins: [{ u: 1.5, y0: 3.0, y1: 3.65, w: 0.55, kind: "plank" }, { u: 4.6, y0: 3.0, y1: 3.65, w: 0.55, kind: "dark" }], door: { u: 3.0, w: 1.05, h: 2.15 } },
    { side: "L", z0: -14.5, z1: -21, h: 3.5, roof: "flat", wins: [{ u: 4.8, y0: 1.35, y1: 1.85, w: 0.45, kind: "plank" }], door: { u: 1.9, w: 1.0, h: 2.0 } },
    { side: "L", z0: -21, z1: -31, h: 4.4, roof: "eaves", wins: [{ u: 2.0, y0: 2.8, y1: 3.4, w: 0.5, kind: "plank" }, { u: 7.5, y0: 2.8, y1: 3.4, w: 0.5, kind: "plank" }], door: { u: 5.0, w: 1.0, h: 2.1 } },
    { side: "R", z0: -31, z1: -22.5, h: 3.8, roof: "flat", wins: [{ u: 2.5, y0: 1.4, y1: 1.9, w: 0.45, kind: "dark" }], door: { u: 5.6, w: 1.0, h: 2.05 } },
    { side: "R", z0: -22.5, z1: -15.5, h: 5.0, roof: "eaves", wins: [{ u: 1.8, y0: 3.05, y1: 3.7, w: 0.55, kind: "plank" }, { u: 5.2, y0: 3.05, y1: 3.7, w: 0.55, kind: "plank" }], door: { u: 3.5, w: 1.05, h: 2.15, arch: 0.45 } },
    { side: "R", z0: -15.5, z1: -9.2, h: 3.4, roof: "flat", wins: [], door: { u: 4.6, w: 1.0, h: 2.0 } },
    { side: "R", z0: -9.2, z1: -3.6, h: 4.3, roof: "eaves", wins: [{ u: 3.9, y0: 2.6, y1: 3.2, w: 0.5, kind: "plank" }], door: { u: 1.6, w: 1.0, h: 2.1 } },
    { side: "R", z0: -3.6, z1: 7, h: 3.7, roof: "flat", wins: [{ u: 6.2, y0: 1.3, y1: 1.85, w: 0.5, kind: "dark" }], door: { u: 8.6, w: 1.0, h: 2.05 } },
  ];
  /** each house's placement, by its row in the table (the dressing stands on the fronts) */
  const HM: THREE.Matrix4[] = [];
  HOUSES.forEach((hs, i) => {
    const w = Math.abs(hs.z1 - hs.z0), M = hs.side === "L" ? houseAt(L(S.fxL), hs.z0, Math.PI / 2) : houseAt(L(S.fxR), hs.z0, -Math.PI / 2), pal = WALLS[i % WALLS.length];
    HM[i] = M;
    const d = hs.door, holes = d ? [{ u0: d.u - d.w / 2, u1: d.u + d.w / 2, y0: 0, y1: d.h, arch: d.arch, surround: 0.1 }] : [];
    const tex = frontTex({ seed: 900 + i, w, h: hs.h, ppm: 44, pal, wins: hs.wins, courses: [], cornice: false, plinth: 0.4, holes, brickPatches: i % 3 === 0 ? 1 : 0, cracks: 3 });
    house(Mk, BT, M, { w, h: hs.h, D: 5, face: Mk.tex(tex, 0.95), side: Mk.flat(toHex(mix(pal.wall, "#b0a898", 0.15)), 0.95), holes, back: mDoorBack, recess: 0.22, reveal: mReveal, roof: { kind: hs.roof, rise: 0.8, over: 0.35, m: roof }, cast: true }, `mantua.house${i}`);
  });
  // the stretch of bare wall with the gap the dead tree leans out of (left, z -5.6 .. -8.0)
  const mWall = Mk.tex(frontTex({ seed: 960, w: 2.4, h: 2.3, ppm: 44, pal: WALLS[2], wins: [], plinth: 0.3, cracks: 2 }), 0.95);
  Mk.mesh("mantua.wall", new THREE.BoxGeometry(0.4, 2.3, 0.7).translate(L(S.fxL - 0.2), 1.15, -5.95), [mWall, mWall, Mk.flat("#ddd6c8", 0.92), mWall, mWall, mWall], { cast: true });
  Mk.mesh("mantua.wall2", new THREE.BoxGeometry(0.4, 2.3, 0.6).translate(L(S.fxL - 0.2), 1.15, -7.7), [mWall, mWall, Mk.flat("#ddd6c8", 0.92), mWall, mWall, mWall], { cast: true });

  // ---------------------------------------------------------------------------------------------- the gate
  {
    const gz = S.gateZ, gw = 9.0, gh = 7.2, a: [number, number] = [L(-gw / 2), gz], b: [number, number] = [L(gw / 2), gz];
    const hole = { u0: gw / 2 - 1.25, u1: gw / 2 + 1.25, y0: 0, y1: 3.8, arch: 1.2 };
    const mGate = Mk.tex(frontTex({ seed: 980, w: gw, h: gh, ppm: 36, pal: PAL("#e2dccd"), wins: [{ u: gw / 2, y0: 5.0, y1: 5.7, w: 0.4, kind: "dark" }], plinth: 0.6, holes: [{ ...hole, surround: 0.3 }], courses: [4.6], brickPatches: 2, cracks: 4 }), 0.95);
    Mk.mesh("mantua.gate.front", holedWall(a, b, 0, gh, [hole], gw, gh), mGate, { cast: true });
    const deep = 1.6, mSide = Mk.flat("#d2cabb", 0.95);
    // (v5: no reveal mesh. Its jambs lay in the planes of the masses either side of the passage and its sill in the
    // ground's, and each pair flickered: the masses' own inner faces are the passage's walls, the ground its floor)
    // the arched soffit through the passage
    const n = 12, pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = hole.u1 - (hole.u1 - hole.u0) * t, y = hole.y1 - hole.arch + hole.arch * Math.sin(Math.PI * t) ** 0.6; pts.push(new THREE.Vector3(L(-gw / 2) + x, Math.min(hole.y1, y), gz)); }
    const pos: number[] = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[i + 1], P2 = q.clone().setZ(gz - deep), P3 = p.clone().setZ(gz - deep); for (const v of [p, q, P2, p, P2, P3]) pos.push(v.x, v.y, v.z); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.computeVertexNormals();
    Mk.mesh("mantua.gate.soffit", sg, mReveal, { cast: false });
    // the masses either side of and over the passage, the crenellations, the back face
    BT.add(mSide, boxG(L(-gw / 2), L(hole.u0 - gw / 2), 0, gh, gz - deep, gz - 0.01));
    BT.add(mSide, boxG(L(hole.u1 - gw / 2), L(gw / 2), 0, gh, gz - deep, gz - 0.01));
    BT.add(mSide, boxG(L(hole.u0 - gw / 2), L(hole.u1 - gw / 2), hole.y1, gh, gz - deep, gz - 0.01));
    for (let x = -gw / 2; x < gw / 2 - 0.2; x += 1.1) BT.add(mSide, boxG(L(x), L(x + 0.62), gh - 0.01, gh + 0.75, gz - deep, gz + 0.02));
    BT.add(mSide, boxG(L(-gw / 2 - 0.05), L(gw / 2 + 0.05), gh - 0.25, gh, gz - deep - 0.05, gz + 0.06));
  }
  // ---------------------------------------------------------------------------------------------- the dead tree
  {
    const [tx, tz] = S.tree, mBark = Mk.tex(paint(64, 256, (g, W, H) => { g.fillStyle = "#9a948c"; g.fillRect(0, 0, W, H); g.strokeStyle = "rgba(90,84,78,0.5)"; g.lineWidth = 3; for (let x = 6; x < W; x += 12) { g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 5, H * 0.3, x - 5, H * 0.6, x + 2, H); g.stroke(); } }, true), 0.95);
    const V = (x: number, y: number, z: number) => new THREE.Vector3(L(tx + x), y, tz + z);
    const limbs: [THREE.Vector3, THREE.Vector3, number, number][] = [
      [V(0, -0.1, 0), V(0.25, 1.6, 0.05), 0.2, 0.15], [V(0.25, 1.6, 0.05), V(0.62, 2.7, 0.1), 0.15, 0.1],
      [V(0.62, 2.7, 0.1), V(1.25, 3.5, 0.0), 0.1, 0.06], [V(0.62, 2.7, 0.1), V(0.45, 3.7, -0.1), 0.09, 0.05],
      [V(0.25, 1.6, 0.05), V(1.0, 2.2, 0.25), 0.1, 0.06], [V(1.0, 2.2, 0.25), V(1.55, 2.35, 0.3), 0.06, 0.045],
      [V(0.25, 1.6, 0.05), V(-0.35, 2.6, -0.2), 0.09, 0.055], [V(-0.35, 2.6, -0.2), V(-0.55, 3.2, -0.2), 0.055, 0.045],
      [V(1.25, 3.5, 0.0), V(1.7, 3.75, 0.05), 0.06, 0.045], [V(0.45, 3.7, -0.1), V(0.6, 4.2, -0.12), 0.05, 0.045],
    ];
    for (const [a, b, ra, rb] of limbs) BT.add(mBark, limb(a, b, ra, rb, 12));
    for (const [a, , ra] of limbs) BT.add(mBark, new THREE.SphereGeometry(ra * 1.02, 12, 8).translate(a.x, a.y, a.z));
    BT.add(mBark, new THREE.ConeGeometry(0.34, 0.3, 12).translate(L(tx), 0.1, tz));   // the root flare
  }
  // ---------------------------------------------------------------------------------------------- the well
  {
    const [wx, wz] = S.well, x = L(wx), mStone = Mk.flat("#d8d0c2", 0.92), mStoneLo = Mk.flat("#bfb6a6", 0.92), mWood = Mk.flat("#8e867a", 0.9);
    BT.add(mStone, new THREE.LatheGeometry([[0, 0], [0.62, 0], [0.62, 0.1], [0.56, 0.14], [0.56, 0.66], [0.63, 0.7], [0.63, 0.8], [0.44, 0.8], [0.44, 0.6], [0, 0.6]].map(([a, b]) => new THREE.Vector2(a, b)), 24).translate(x, 0, wz));
    for (const s of [-1, 1]) BT.add(mWood, boxG(x + s * 0.56 - 0.07, x + s * 0.56 + 0.07, 0.7, 1.85, wz - 0.07, wz + 0.07));
    BT.add(mWood, boxG(x - 0.7, x + 0.7, 1.82, 1.95, wz - 0.06, wz + 0.06));
    BT.add(mStoneLo, new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16).rotateX(Math.PI / 2).translate(x, 1.72, wz));
    // the bucket on the curb
    const P = new Part(K); P.add(K.flat("#9a9082", { rough: 0.9 }), new THREE.CylinderGeometry(0.13, 0.1, 0.24, 16).translate(x - 0.3, 0.92, wz + 0.42), 0.006); P.into(group, "mantua.bucket");
  }
  // stones and a few dry tufts along the wall feet (props-kit parts: no ink pass)
  {
    const r = rng(74), P = new Part(K), mSt = K.flat("#c8bea8", { rough: 0.95 }), mTuft = K.flat("#b4aa86", { rough: 0.95 });
    for (let i = 0; i < 14; i++) { const x = (r() < 0.5 ? -1 : 1) * (1.2 + 1.2 * r()), z = 2 - 26 * r(); P.add(mSt, new THREE.SphereGeometry(0.06 + 0.06 * r(), 10, 7).scale(1.3, 0.55, 1).translate(L(x), 0.02, z), 0.006); }
    for (let i = 0; i < 9; i++) {
      const sx = r() < 0.5 ? -1 : 1, x = sx * (S.fxR - 0.12), z = 3 - 25 * r();
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + r(); P.add(mTuft, new THREE.ConeGeometry(0.03, 0.22 + 0.1 * r(), 6).rotateZ(Math.cos(a) * 0.5).rotateX(Math.sin(a) * 0.5).translate(L(x) + Math.cos(a) * 0.04, 0.1, z + Math.sin(a) * 0.04), 0.005); }
    }
    // a dry thorn bush and two big stones near the camera (the lower part of the frame from "above")
    const [bx, bz] = S.bush, mTwig = K.flat("#a69c84", { rough: 0.95 });
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + 0.3 * r(), l = 0.32 + 0.18 * r(); P.add(mTwig, limb(new THREE.Vector3(L(bx), 0.02, bz), new THREE.Vector3(L(bx) + Math.cos(a) * l * 0.8, 0.18 + 0.25 * r(), bz + Math.sin(a) * l * 0.8), 0.022, 0.012, 6), 0.005); }
    P.add(mSt, new THREE.SphereGeometry(0.2, 14, 10).scale(1.4, 0.7, 1.1).translate(L(bx + 0.45), 0.06, bz + 0.35), 0.008);
    P.add(mSt, new THREE.SphereGeometry(0.14, 12, 9).scale(1.2, 0.8, 1).translate(L(-1.9), 0.05, -3.4), 0.008);
    P.into(group, "mantua.bits");
  }
  // ---------------------------------------------------------------------------------------------- what the street holds (v5)
  {
    const d = dresser(Mk, BT, MANTUA_DRESS, 7272);
    // ---- the left row (fronts face +x; u runs toward -z): houses 1 (z 0.6), 2 (z -8.0), 3 (z -14.5)
    d.barrel(L(-2.12), -4.35); d.barrel(L(-1.72), -5.02, { lying: 0.5 }); d.jar(L(-1.3), 0, -4.05, 0.95, 0.4);   // (clear of the dry bush at -0.95, -2.3: beside it the two read as one thing)
    d.cart(L(-1.72), -9.4, Math.PI / 2, { broken: true }); d.wheelDown(L(-1.0), -7.9);
    d.sign(HM[2], 1.3, 2.75, "mortar"); d.step(HM[2], 3.0, 1.35, 0.4, 0.12); d.pot(L(-2.36), -10.2, { plant: "dry" }); d.pot(L(-2.38), -11.85, { plant: "none", r: 0.14 });
    d.trough(L(-2.2), -13.3, Math.PI / 2, 1.4, false); d.ladder(HM[3], 1.2, 3.0); d.barrel(L(-2.2), -17.6); d.crate(L(-2.2), 0, -18.5, 0.5, 0.36, 0.42, 0.2);
    // ---- the right row (fronts face -x; u runs toward +z): houses 8 (z -9.2), 7 (z -15.5), 6 (z -22.5)
    d.bench(L(2.36), -5.0, Math.PI / 2, 1.2);
    d.step(HM[8], 1.6, 1.3, 0.4, 0.12); d.sack(L(2.28), -6.75, 0.95, 0.4); d.sack(L(2.3), -6.2, 0.8, 1.9); d.crate(L(2.28), 0, -8.5, 0.5, 0.34, 0.4, -0.1); d.crate(L(2.3), 0.34, -8.48, 0.36, 0.24, 0.3, 0.3);
    d.awning(HM[7], 4.6, 2.45, 1.5, { out: 0.7, drop: 0.35 }); d.step(HM[7], 4.6, 1.3, 0.4, 0.12); d.pot(L(2.38), -12.2, { plant: "dry" });
    d.stall(L(2.02), -17.6, -Math.PI / 2, { w: 1.7, cloth: false, goods: false }); d.barrel(L(2.25), -20.4, { h: 0.74, r: 0.26 });
  }
  BT.flush(group, "mantua.parts");

  // ---------------------------------------------------------------------------------------------- the sky and the country beyond the gate
  group.add(skyDome(new THREE.Vector3(L(0), 0, -10), SKY));
  const far = farCard(L(-30), L(30), -0.5, 12, -70, 1536, 384, (g, k0) => {
    const k = { ...k0, px: (x: number) => k0.px(L(x)) };
    const r = rng(75);
    g.fillStyle = "#e4dccb"; g.fillRect(0, k.py(1.2), k.W, k.py(-0.5) - k.py(1.2));
    g.fillStyle = "#d6d3c8"; g.beginPath(); g.moveTo(0, k.py(1.2)); for (let x = -30; x <= 30; x += 2) g.lineTo(k.px(x), k.py(1.2 + 1.6 * (0.5 + 0.5 * Math.sin(x * 0.21 + 1)) * r() + 0.4)); g.lineTo(k.W, k.py(1.2)); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const x = -26 + 52 * r(); g.fillStyle = "#b8b4a8"; g.fillRect(k.px(x), k.py(1.9), 0.12 * k.s, 0.8 * k.s); g.beginPath(); g.ellipse(k.px(x + 0.06), k.py(2.2), 0.45 * k.s, 0.3 * k.s, 0, 0, 7); g.fill(); }
  });
  (far.material as THREE.MeshBasicMaterial).alphaTest = 0.5; group.add(far);

  // ---------------------------------------------------------------------------------------------- drifting dust
  const veils: { m: THREE.Mesh; x0: number; z: number; sp: number; ph: number; y: number }[] = [];
  [[-0.5, -12, 0.35, 0.0, 0.5], [1.2, -20, 0.25, 0.4, 0.7], [-1.4, -6, 0.3, 0.7, 0.4], [0.4, -26, 0.22, 0.2, 0.9]].forEach(([x, z, sp, ph, y], i) => {
    const m = softCard(3.2 + i * 0.4, 1.0, "#f4ecdc", 0.4); m.layers.set(NOINK); m.renderOrder = 3; m.name = "mantua.dust"; group.add(m);
    veils.push({ m, x0: x, z, sp, ph, y });
  });
  const animate = (t: number) => {
    for (const v of veils) {
      const u = ((t * v.sp * 0.25 + v.ph) % 1 + 1) % 1, k = Math.sin(Math.PI * u);
      v.m.position.set(L(v.x0 - 2 + 4 * u), v.y + 0.1 * Math.sin(t * 0.7 + v.ph * 6), v.z);
      (v.m.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
    }
  };
  animate(0);
  // (v5: the shadow box reaches the gate, z -36 to 8: the rider now rides the whole street and his shadow must not
  // stop at z -22)
  lightRig(group, { dir: [0.38, 1, 0.22], k: 1.3, col: "#fffaf2", at: [L(0), 0, -14], half: 22, hemi: ["#fbfaf6", "#efe6d6", 2.9] });
  return { group, animate, cast() { return CAST; } };
}

/** scene 7's Mantua street at noon: no params */
export const MANTUA: PlaceDef = { look: LOOK, params: PARAMS, build };
