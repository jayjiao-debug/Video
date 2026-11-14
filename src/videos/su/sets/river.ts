// THE RIVER (place "river", island x 500): dawn on the river below 白鹤峰 (PLAN 1, 8G). WP2b's set; the exports are the
// contract of sets/index.ts: RIVER_LOOK, RIVER_PARAMS, buildRiver(K) -> { group, animate, setParam }. Every place
// number is layout/river.ts (RIVER_SET, RIVER); its header has the plan.
//
// WHAT THERE IS (she stands on the bank, her lens looks -z across the water)
//   - THE BANK (camera side): trodden mud, wetter and darker toward its edge, a worn way down to the LANDING in front of
//     her (no reeds there: the boat lies off it), grass on the higher bank behind; the MOORING STAKE with its rope coil
//     at the landing's left, two flat stepping stones; REED BEDS growing out into the shallows left and right of the
//     landing (clear of the boat's way and of the family's marks), their plumes catching the dawn;
//   - THE WATER: a wide calm river at dawn. Its colour is the dawn sky REFLECTED (pink-lavender, lighter far off), with
//     the far hill's soft dark reflection below it and a warm streak under the dawn glow; slow ripple glints drift on
//     it and a calm golden shimmer lies along the glow (smooth: nothing blinks); thin mist bands hang over it;
//   - THE FAR SIDE: 白鹤峰, a green hill across the river with a flat top where THE NEW HOUSE stands small (WP2a's
//     makeFarHouse, its lantern a warm dot), a path zigzagging up to it, trees on its slopes, lower hills beside it,
//     mist at their feet; misty blue-violet ridges behind (a NOINK panorama), the river bending away to the left
//     toward THE DAWN GLOW, low over the hills at the left (the sun itself is still behind them);
//   - param dawn 0..1: how far the dawn has come (the light's strength and warmth, the lantern a little weaker).
// INK / FLICKER: mud, grass, stones, the hill's skin and paths are PAINT; inked geometry: the bank, the stake, the
// stones; the far hill, its trees, the house, the reeds, water, glints, mist, the panorama and the sky are NOINK (no
// ink lines or flicker at 60-150 m). Seeded painting only; animate is a pure function of t.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, skyDome, skyAt, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { RIVER_SET as S, RIVER, VX } from "../layout/river";
import type { PlaceLook, ParamValue } from "./index";
import { maker, bar, terrainG, rockFit, wrapBlotch, smooth01, Part, NOINK } from "./parts/common";
import { strandField, type Strand } from "./parts/strands";
import { blobG, panoramaRing } from "./parts/town";
import { makeFarHouse } from "./parts/farhouse";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.46, 0.4, 0.38]], [-8, [0.66, 0.58, 0.56]], [5, [0.92, 0.78, 0.7]], [40, [0.66, 0.68, 0.86]], [90, [0.6, 0.64, 0.84]]],
  boxes: [{ az: 140, el: 12, rot: 0, w: 40, h: 18, soft: 14, col: [1.0, 0.8, 0.62] }],
};
/** a soft dawn grade: lifted shadows a little violet, warm highlights */
const GRADE: GradeParams = { ky: [0.01, 0.11, 0.28, 0.58, 0.82, 0.935, 1], sat: [0.95, 1.0, 0.96], tintS: [0.012, 0.01], tintM: [-0.004, 0.012], tintH: [-0.02, 0.014], vig: [0.16, 0.42] };
/** DAWN: a low pink-gold light from the left beyond the river (the figures' key a cheat from the lens's left, so faces
 *  read), a soft blue-violet shade */
export const RIVER_LOOK: PlaceLook = {
  bg: "#e8c8b4",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#3a3046" },
  cast: {
    key: [-0.6, 0.42, 0.68], tint: [1.0, 0.86, 0.76], tintK: 0.75, gain: 0.93, grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.9, 1.0],
    shade: [1.0, 0.94, 1.45], shadeK: 0.36, wrap: [28, 56], edge: 0.13, broad: 0.12, bodySat: 0.13, sheen: 0.08, lift: 0.03, contactLen: 0.4,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.4,
  grade: GRADE,
};
/** the per-frame dressing: dawn 0..1 (how far the dawn has come: the sun's strength and warmth) */
export const RIVER_PARAMS: Record<string, ParamValue> = { dawn: 0.6 };

const COL = {
  mud: "#86725e", mudLo: "#6c5a48", mudHi: "#a08a72", pebble: "#b0a090", grass: "#7c8456", grassLo: "#626a44",
  reed: "#6c7a4a", reedTip: "#c8b07a", plume: "#d8c4a0",
  hill: "#6e8462", hillLo: "#56705a", hillHi: "#8c9a6c", path: "#c2a888", earth: "#b49c7c", tree: ["#5e7a62", "#6a8466", "#56705e"], bamboo: "#6a8a5a",
  stake: "#6a5440", rope: "#b8a074", stone: "#9a9288",
  mist: "#f2dcd6",
};
/** the dawn sky by elevation (degrees): peach at the horizon, rose, lavender, a soft blue-violet overhead */
const SKY: SkyStops = [[-10, "#c8b0b4"], [0, "#f8d4b4"], [3, "#f2c4b0"], [9, "#e0b8bc"], [22, "#bcb2d0"], [50, "#909ccc"], [90, "#7a88c0"]];
const BK = S.bank, WY = S.water.y, HL = S.hill, HS = S.house;
/** her eye on the bank (the water's painted reflection is drawn for it: every river camera stands there) */
const EYE = new THREE.Vector3(VX, 1.5, 2.3);
const SUN_AZ = S.sun.az, SUN_EL = S.sun.el;
/** the bank's edge (wavering left and right of the landing, straight along it) */
const LAND_C = (S.landing.x0 + S.landing.x1) / 2, LAND_HW = (S.landing.x1 - S.landing.x0) / 2;
const ZE = (x: number) => S.edge + smooth01(LAND_HW, LAND_HW + 1.4, Math.abs(x - LAND_C)) * (0.3 * Math.sin((x - VX) * 0.5) + 0.22 * Math.sin((x - VX) * 1.3 + 1));
/** the bank's height: flat round her and the family, rising gently far behind; a muddy lip at the edge, then the bed */
const HB = (x: number, z: number) => {
  const dz = ZE(x) - z;
  if (dz <= 0) return 0.45 * smooth01(5, 20, z) * (0.7 + 0.3 * Math.sin(x * 0.21)) + 0.15 * smooth01(4, 12, Math.abs(x - VX)) * smooth01(1, 3, z) * Math.sin(x * 0.4 + z * 0.3) ** 2;
  return -0.26 * smooth01(0, 0.45, dz) - 0.05 * dz;
};
/** how far past the bank's edge (dz) its slope reaches 5 mm under the water's surface: the waterline */
const DZW = (() => { let a = 0, b = 0.45; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (HB(VX, ZE(VX) - m) > WY - 0.005) a = m; else b = m; } return (a + b) / 2; })();
/** THE FAR HILL: a gaussian hill cut flat at the house's level (its top is the yard), lower hills beside it */
const smin = (a: number, b: number, k: number) => { const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k)); return b + (a - b) * h - k * h * (1 - h); };
const PLAT = { x: HS.x, z: HS.z - 3 };
/** the hilltop under the house: HS.y at the yard's middle, tilted toward the river like the house (RIVER_SET.houseTilt) */
const TT = Math.tan(S.houseTilt), HSY = Math.sin(S.houseYaw), HCY = Math.cos(S.houseYaw);
const TOP = (x: number, z: number) => HS.y - ((x - HS.x) * HSY + (z - HS.z) * HCY) * TT;
/** in front of the yard (z > ZF) the flank falls away faster than her line of sight up to the house: it never hides it */
const ZF = HS.z + 8;
const HH = (x: number, z: number) => {
  const main = (HL.top + 6) * Math.exp(-(((x - HL.x) / (HL.r * 0.85)) ** 2) - (((z - HL.z) / (HL.r * 0.75)) ** 2));
  const q = Math.hypot(Math.max(0, Math.abs(x - PLAT.x) - 8), Math.max(0, Math.abs(z - PLAT.z) - 10)), P = 1 - smooth01(0, 5, q);
  const ridges = 13 * Math.exp(-(((x - (VX - 38)) / 26) ** 2) - (((z + 128) / 22) ** 2)) + 16 * Math.exp(-(((x - (VX + 58)) / 22) ** 2) - (((z + 122) / 26) ** 2));
  const noise = 1.0 * Math.sin(x * 0.13) * Math.cos(z * 0.11) + 0.5 * Math.sin(x * 0.31 + z * 0.23);
  // (the foot is pushed 1.2 m down, under the water; the top is not: the yard's floor is exactly the house's y)
  const top = TOP(x, z);
  let h = smin(main, top, 2.5) + (ridges + noise * smooth01(0.5, 5, main + ridges)) * (1 - P) - 1.2 * (1 - smooth01(2, 10, main + ridges));
  const w = 1 - smooth01(10, 26, Math.abs(x - HS.x));
  if (w > 0 && z > ZF - 3) h += (smin(h, TOP(HS.x, ZF) - 0.3 - 0.32 * (z - ZF), 1.5) - h) * w;
  return P * top + (1 - P) * h;
};
/** the hill's silhouette elevation (degrees) seen from EYE along a bearing az (0 = -z, + toward +x) */
const SIL: number[] = [];
for (let a = -90; a <= 90; a += 0.5) {
  const s = Math.sin((a * Math.PI) / 180), c = -Math.cos((a * Math.PI) / 180);
  let e = -10;
  for (let d = 30; d < 200; d += 1.5) { const x = EYE.x + s * d, z = EYE.z + c * d; if (x < VX - 80 || x > VX + 100 || z < -170 || z > -40) continue; e = Math.max(e, (Math.atan2(HH(x, z) - EYE.y, d) * 180) / Math.PI); }
  SIL.push(e);
}
const silAt = (az: number) => { const k = (Math.max(-90, Math.min(90, az)) + 90) * 2, i = Math.floor(k), f = k - i; return SIL[Math.min(i, SIL.length - 1)] * (1 - f) + SIL[Math.min(i + 1, SIL.length - 1)] * f; };

// ---------------------------------------------------------------------------------------------------- the paintings
/** mud (a 4 m tile): mottle, footprints, pebbles, little cracks */
const mudTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(501);
  g.fillStyle = COL.mud; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 30 + 70 * r(), r() < 0.5 ? COL.mudLo : COL.mudHi, 0.3);
  for (let i = 0; i < 14; i++) { const x = W * r(), y = Hh * r(), a = r() * 6.28; for (const sg of [-1, 1]) { g.fillStyle = css(COL.mudLo, 0.55); g.beginPath(); g.ellipse(x + Math.cos(a + 1.57) * 7 * sg, y + Math.sin(a + 1.57) * 7 * sg, 5, 11, a + 1.57, 0, 7); g.fill(); } }
  for (let i = 0; i < 120; i++) { const x = W * r(), y = Hh * r(), rr = 1.5 + 3 * r(); g.fillStyle = css(COL.pebble, 0.85); g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, r() * 3, 0, 7); g.fill(); g.fillStyle = css(COL.mudLo, 0.6); g.fillRect(x - rr, y + rr * 0.55, rr * 2, 1.4); }
  g.strokeStyle = css(COL.mudLo, 0.4); g.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) { let x = W * r(), y = Hh * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 20; y += (r() - 0.5) * 20; g.lineTo(x, y); } g.stroke(); }
}, true);
/** the far hill's skin, top down over its rectangle (x VX-80..VX+100, z -170..-40; canvas top = z -170): grass and
 *  scrub, the path zigzagging up from the water to the yard, the yard's packed earth */
const HILL_R = { x0: VX - 80, x1: VX + 100, z0: -170, z1: -40 };
const hillTex = () => paint(1024, 740, (g, W, Hh) => {
  const r = rng(503), X = (x: number) => ((x - HILL_R.x0) / (HILL_R.x1 - HILL_R.x0)) * W, Y = (z: number) => ((z - HILL_R.z0) / (HILL_R.z1 - HILL_R.z0)) * Hh;
  g.fillStyle = COL.hill; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 160; i++) blotch(g, W * r(), Hh * r(), 10 + 40 * r(), r() < 0.5 ? COL.hillLo : COL.hillHi, 0.3);
  // terraced strips on the lower slopes (the village's fields)
  g.strokeStyle = css(COL.hillHi, 0.5); g.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const rr = 46 - i * 2.4; g.beginPath(); g.ellipse(X(HL.x), Y(HL.z), (rr / (HILL_R.x1 - HILL_R.x0)) * W, (rr * 0.85 / (HILL_R.z1 - HILL_R.z0)) * Hh, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
  // the yard on the flat top
  g.fillStyle = COL.earth; g.fillRect(X(HS.x - 8), Y(HS.z - 6), X(HS.x + 7.5) - X(HS.x - 8), Y(HS.z + 5) - Y(HS.z - 6));
  // the path: from the landing at the water's edge up the slope in zigzags to the gate
  const pts: [number, number][] = [[HS.x + 2.6, HS.z + 5], [HS.x - 6, HS.z + 11], [HS.x + 10, HS.z + 18], [HS.x - 4, HS.z + 26], [HS.x + 12, HS.z + 33], [HS.x + 3, HS.z + 42], [HS.x + 6, HS.z + 50]];
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = css(COL.hillLo, 0.6); g.lineWidth = 14; g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z)))); g.stroke();
  g.strokeStyle = COL.path; g.lineWidth = 9; g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z)))); g.stroke();
});
/** glints on calm water (transparent, an 8 m tile): long thin pale strokes, a few darker ones */
const glintTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(505);
  g.clearRect(0, 0, W, Hh);
  g.lineCap = "round";
  for (let i = 0; i < 90; i++) { const x = W * r(), y = Hh * r(), w = 20 + 60 * r(); g.strokeStyle = r() < 0.7 ? "rgba(255,240,230,0.7)" : "rgba(110,100,140,0.4)"; g.lineWidth = 2; for (const dx of [-W, 0, W]) for (const dy of [-Hh, 0, Hh]) { g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 2.5, x + dx + w / 2, y + dy); g.stroke(); } }
}, true);
/** the golden shimmer along the dawn glow (u across, v along; repeats in v) */
const shimmerTex = () => paint(256, 512, (g, W, Hh) => {
  const r = rng(507);
  g.clearRect(0, 0, W, Hh);
  for (let i = 0; i < 150; i++) { const u = 0.5 + (r() + r() + r() - 1.5) * 0.45, y = Hh * r(), w = (10 + 40 * r()) * (1 - Math.abs(u - 0.5) * 1.3); g.fillStyle = css(r() < 0.8 ? "#ffe2b0" : "#ffc890", 0.55 + 0.4 * r()); g.fillRect(W * u - w / 2, y, w, 2.5); }
}, true);
/** a mist band (transparent; soft in y, patchy along x, repeats in x) */
const mistTex = () => paint(512, 128, (g, W, Hh) => {
  const r = rng(509);
  g.clearRect(0, 0, W, Hh);
  for (let i = 0; i < 40; i++) { const x = W * r(), y = Hh * (0.5 + 0.2 * (r() - 0.5)); for (const dx of [-W, 0, W]) blotch(g, x + dx, y, 24 + 30 * r(), COL.mist, 0.3); }
  // fade out toward the top and the bottom edges (no straight cut)
  g.globalCompositeOperation = "destination-in";
  const fade = g.createLinearGradient(0, 0, 0, Hh); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(0.3, "rgba(0,0,0,1)"); fade.addColorStop(0.7, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade; g.fillRect(0, 0, W, Hh); g.globalCompositeOperation = "source-over";
}, true);

// ---------------------------------------------------------------------------------------------------- geometry
/** a grid in x / z (rows toward -z), RGBA vertex colours from fn */
const gridG = (xs: number[], zs: number[], y: number, fn: (x: number, z: number) => [number, number, number, number]) => {
  const pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const z of zs) for (const x of xs) { pos.push(x, y, z); col.push(...fn(x, z)); uv.push(x / 8, -z / 8); }
  for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < xs.length; i++) { const a = j * xs.length + i, b = a + 1, c = a + xs.length, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
};
const steps = (a: number, b: number, s: number) => { const out: number[] = []; for (let v = a; s > 0 ? v <= b + 1e-6 : v >= b - 1e-6; v += s) out.push(v); return out; };
const lin = (c: string) => { const q = new THREE.Color(c); return [q.r, q.g, q.b]; };
const linRGB = (rgb: number[]) => new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).convertSRGBToLinear();

export function buildRiver(K: Kit) {
  const group = new THREE.Group(); group.name = "set-river";
  const Mk = maker(K, group), r = rng(511), B = new Batch();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const family = [RIVER.mai, ...RIVER.kids, RIVER.dog, RIVER.bank];
  const boatLine = (x: number, z: number) => {
    let best = Infinity; const P = RIVER.boatPath;
    for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1], dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / L2)); best = Math.min(best, Math.hypot(x - a.x - u * dx, z - a.z - u * dz)); }
    return Math.min(best, Math.hypot(x - P[0].x, z - (P[0].z + 1.8)));
  };

  // ===================================================================================================== the bank
  {
    const map = mudTex(); map.repeat.set(80 / 4, (BK.z1 + 8) / 4);
    // (the inked bank ends exactly at the waterline, its front rows pulled onto it; the river bed under the water is
    // NOINK: the ink pass draws over the transparent water, so an inked edge under it would draw a line across it)
    const g = terrainG(BK.x0, BK.x1, -1.8, BK.z1, 160, Math.round((BK.z1 + 1.8) * 2), 0, HB);
    const p = g.attributes.position as THREE.BufferAttribute, cols = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), zw = ZE(x) - DZW; if (p.getZ(i) < zw) { p.setZ(i, zw); p.setY(i, HB(x, zw)); } }
    g.computeVertexNormals();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), dz = ZE(x) - z, wet = smooth01(-1.6, 0.1, dz), grassK = smooth01(2.5, 6, z) * (0.6 + 0.4 * Math.sin(x * 0.7) * Math.sin(z * 0.9));
      const way = 1 - smooth01(0.5, 1.4, Math.abs(x - (VX + 0.1 * (z - 2.3))));        // the worn way down to the landing: lighter
      const c = [1 - 0.2 * wet + 0.06 * way, 1 - 0.22 * wet + 0.05 * way, 1 - 0.2 * wet + 0.04 * way];
      c[0] -= 0.1 * grassK; c[1] += 0.02 * grassK; c[2] -= 0.16 * grassK;
      cols.set(c, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const m = Mk.own("#ffffff", { map, rough: 0.92 }); m.vertexColors = true;
    Mk.mesh("river.bank", g, m, { cast: false });
    const bed = terrainG(BK.x0, BK.x1, -46, 0.3, 80, 62, 0, (x, z) => Math.min(HB(x, z), WY - 0.012) - 0.002);
    { const pb = bed.attributes.position as THREE.BufferAttribute, cb = new Float32Array(pb.count * 3); for (let i = 0; i < pb.count; i++) cb.set([0.78, 0.76, 0.78], i * 3); bed.setAttribute("color", new THREE.BufferAttribute(cb, 3)); }
    Mk.mesh("river.bed", bed, m, { cast: false, noink: true });
    // the mooring stake with its rope coil, two flat stepping stones at the landing
    const st = RIVER.stake, wood = Mk.flat(COL.stake, 0.9), rope = Mk.flat(COL.rope, 0.85);
    B.add(wood, bar(V(st.x, -0.3, st.z), V(st.x + 0.04, 1.05, st.z - 0.06), 0.065, 0.055, 10));
    const P = new Part(K);
    for (let i = 0; i < 3; i++) P.add(rope, new THREE.TorusGeometry(0.085, 0.016, 6, 16).rotateX(Math.PI / 2).translate(st.x + 0.01 * i, 0.55 + 0.04 * i, st.z - 0.025 * i), 0.003);
    P.add(rope, bar(V(st.x + 0.06, 0.58, st.z), V(st.x + 0.2, 0.02, st.z + 0.18), 0.014, 0.014, 6), 0.003);
    P.into(group, "river.stakeRope");
    for (const [x, z, s] of [[VX - 0.7, S.edge + 0.1, 0.5], [VX + 0.65, S.edge + 0.05, 0.42]] as [number, number, number][]) B.add(Mk.flat(COL.stone, 0.9), rockFit(520 + Math.round(x * 3), s, 0.06, s * 0.8, 2, 0.08).translate(x, 0, z));
    // bank tufts of grass behind, along the edge away from the landing
    const tufts: Strand[] = [];
    for (let i = 0; i < 90; i++) {
      const x = VX - 14 + 28 * r(), z = 0.4 + 9 * r();
      if (family.some((f) => Math.hypot(f.x - x, f.z - z) < 0.8) || Math.abs(x - (VX + 0.1 * (z - 2.3))) < 1.2) continue;
      for (let k = 0; k < 8; k++) { const bx = x + (r() - 0.5) * 0.3, bz = z + (r() - 0.5) * 0.3, y = HB(bx, bz), hh = 0.18 + 0.2 * r(); tufts.push({ root: V(bx, y - 0.02, bz), tip: V(bx + (r() - 0.5) * 0.2, y + hh, bz + (r() - 0.5) * 0.2), w: 0.025, c0: COL.grassLo, c1: COL.grass, ph: r() * 6, amp: 0.04, face: r() * 3 }); }
    }
    const tf = strandField(Mk, tufts, "river.tufts"); group.add(tf.mesh);
    (group.userData as { tufts?: typeof tf }).tufts = tf;
  }

  // ===================================================================================================== the reeds
  const reeds: Strand[] = [];
  {
    const clump = (x: number, z: number, n: number, hgt: number) => {
      for (let k = 0; k < n; k++) {
        const bx = x + (r() - 0.5) * 0.5, bz = z + (r() - 0.5) * 0.5, y = Math.max(WY, HB(bx, bz)), hh = hgt * (0.7 + 0.5 * r());
        reeds.push({ root: V(bx, y - 0.05, bz), tip: V(bx + (r() - 0.5) * 0.35, y + hh, bz + (r() - 0.5) * 0.25), w: 0.035, c0: COL.reed, c1: r() < 0.3 ? COL.plume : COL.reedTip, ph: r() * 6, amp: 0.06, seg: 4, face: r() * 3 });
      }
    };
    for (let i = 0; i < 150; i++) {
      const side = i % 2 ? 1 : -1, x = LAND_C + side * (LAND_HW + 0.3 + 9 * r() * r()), z = ZE(x) + 0.3 - (0.3 + 5.5 * r()) * (1 - Math.min(0.8, Math.abs(x - LAND_C) / 30));
      if (boatLine(x, z) < 1.9 || family.some((f) => Math.hypot(f.x - x, f.z - z) < 0.7) || z > 0.6) continue;
      clump(x, z, 10, 1.25 + 0.4 * r());
    }
    const rf = strandField(Mk, reeds, "river.reeds"); group.add(rf.mesh);
    (group.userData as { reeds?: typeof rf }).reeds = rf;
  }

  // ===================================================================================================== the water
  const glow = { az: SUN_AZ, el: SUN_EL };
  const hillRefl = lin("#6a7a6c"), hillReflLo = lin("#5c6a62");
  const waterCol = (x: number, z: number): [number, number, number, number] => {
    const dx = x - EYE.x, dz = z - EYE.z, d = Math.hypot(dx, dz), az = (Math.atan2(dx, -dz) * 180) / Math.PI, dep = (Math.atan2(EYE.y - WY, d) * 180) / Math.PI;
    // the sky it mirrors (a touch darker and bluer than the sky itself)
    const sky = linRGB(skyAt(SKY, dep)); let c = [sky.r * 0.86, sky.g * 0.86, sky.b * 0.92];
    // the warm streak under the dawn glow
    const gw = Math.exp(-(((az - glow.az) / 7) ** 2)) * (0.4 + 0.6 * smooth01(1, 12, d)); c = c.map((v, i) => v + ([0.42, 0.22, 0.08][i] - v * 0.2) * gw * 0.5);
    // the far hill's reflection: under its silhouette (soft edge), darker near the far shore
    const sil = Math.abs(az) <= 90 ? silAt(az) : -10, k = smooth01(-0.8, 0.8, sil - dep);
    if (k > 0) { const lo = smooth01(30, 55, d), hc = hillRefl.map((v, i) => v + (hillReflLo[i] - v) * lo); c = c.map((v, i) => v + (hc[i] - v) * k * 0.72); }
    // shallow and see-through at the bank's edge
    const a = 0.72 + 0.28 * smooth01(0.2, 3.0, ZE(x) - z);
    return [c[0], c[1], c[2], a];
  };
  const xsW = [...steps(VX - 250, VX - 60, 19), ...steps(VX - 50, VX + 50, 0.75), ...steps(VX + 60, VX + 250, 19)];
  const zsW = [...steps(0.4, -40, -0.75), ...steps(-42, -70, -2), ...steps(-80, -260, -20)];
  const waterMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const water = Mk.mesh("river.water", gridG(xsW, zsW, WY, waterCol), waterMat, { cast: false, receive: false, noink: true }); water.renderOrder = 1;
  // slow glints drifting over the water (fading near the bank and far off)
  const gl = glintTex(), glMat = new THREE.MeshBasicMaterial({ map: gl, vertexColors: true, transparent: true, depthWrite: false, fog: false, opacity: 0.5, side: THREE.DoubleSide });
  const glints = Mk.mesh("river.glints", gridG(steps(VX - 40, VX + 40, 2), [...steps(-1, -40, -1), ...steps(-43, -70, -3)], WY + 0.002, (x, z) => { const d = Math.hypot(x - EYE.x, z - EYE.z); return [1, 1, 1, smooth01(2, 6, d) * (1 - smooth01(35, 68, d)) * (1 - smooth01(26, 40, Math.abs(x - VX)))]; }), glMat, { cast: false, receive: false, noink: true });
  glints.renderOrder = 2;
  // the calm golden shimmer along the dawn glow: a long strip from near the bank out toward the glow
  const sh = shimmerTex(), shMat = new THREE.MeshBasicMaterial({ map: sh, transparent: true, depthWrite: false, fog: false, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  {
    const a = (glow.az * Math.PI) / 180, dir = V(Math.sin(a), 0, -Math.cos(a)), side = V(Math.cos(a), 0, Math.sin(a)), n = 20, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const d = 4 + 130 * (i / n) ** 1.6, w = 0.5 + d * 0.11, c = EYE.clone().setY(WY + 0.004).addScaledVector(dir, d);
      pos.push(c.x - side.x * w, c.y, c.z - side.z * w, c.x + side.x * w, c.y, c.z + side.z * w); uv.push(0, d / 9, 1, d / 9);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    Mk.mesh("river.shimmer", g, shMat, { cast: false, receive: false, noink: true }).renderOrder = 3;
  }
  // thin mist bands over the water and at the far hill's foot
  const mist = mistTex(), mists: THREE.Mesh[] = [];
  for (const [z, y0, y1, w, op] of [[-22, -0.2, 1.6, 120, 0.45], [-38, -0.2, 3.0, 160, 0.5], [-52, 0.0, 6.0, 220, 0.6], [-70, 2.0, 12.0, 260, 0.45]] as [number, number, number, number, number][]) {
    const t = mist.clone(); t.needsUpdate = true; t.repeat.set(w / 40, 1);
    // (vertex alpha fades the band out where the far hill rises through it: no hard line where the hill cuts the plane)
    const pg = new THREE.PlaneGeometry(w, y1 - y0, Math.round(w / 2), 12).translate(VX, (y0 + y1) / 2, z), pp = pg.attributes.position as THREE.BufferAttribute, ca = new Float32Array(pp.count * 4);
    for (let i = 0; i < pp.count; i++) ca.set([1, 1, 1, smooth01(0.3, 3.0, pp.getY(i) - HH(pp.getX(i), z))], i * 4);
    pg.setAttribute("color", new THREE.BufferAttribute(ca, 4));
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, fog: false, vertexColors: true }));
    m.name = "river.mist"; m.layers.set(NOINK); m.renderOrder = 4; m.castShadow = false; m.receiveShadow = false; group.add(m); mists.push(m);
  }

  // ===================================================================================================== the far side
  const far = new THREE.Group(); far.name = "river.far"; group.add(far);
  const noink = (o: THREE.Object3D) => o.traverse((c) => { c.layers.set(NOINK); c.castShadow = false; });
  {
    const hm = Mk.tex(hillTex(), 0.95);
    Mk.mesh("river.hill", terrainG(HILL_R.x0, HILL_R.x1, HILL_R.z0, HILL_R.z1, 180, 130, 0, HH), hm, { into: far, cast: false, noink: true });
    // trees on the slopes (avoiding the yard and the path's line), bamboo clumps at the plateau's back
    const TB = new Batch(), trees = COL.tree.map((c) => Mk.flat(c, 0.9));
    for (let i = 0; i < 420; i++) {
      const x = HILL_R.x0 + 8 + (HILL_R.x1 - HILL_R.x0 - 16) * r(), z = HILL_R.z0 + 8 + (HILL_R.z1 - HILL_R.z0 - 14) * r(), y = HH(x, z);
      if (y < 1.0) continue;
      if (Math.abs(x - PLAT.x) < 11 && Math.abs(z - PLAT.z) < 13) continue;
      if (Math.abs(x - (HS.x + 3)) < 9 && z > HS.z + 4 && z < HS.z + 52 && r() < 0.8) continue;
      if (r() < 0.25 && y > 8) continue;
      const s = 1.6 + 2.2 * r();
      // (none whose crown would rise into her line of sight up to the house)
      if (Math.abs(x - HS.x) < 12 && z > HS.z && y + 1.5 * s > EYE.y + ((HS.y - EYE.y) * (EYE.z - z)) / (EYE.z - HS.z) - 0.5) continue;
      TB.add(trees[i % 3], blobG(530 + i, 2, 0.22).scale(s, s * (0.8 + 0.4 * r()), s).translate(x, y + s * 0.6, z));
    }
    TB.flush(far, "river.trees", false, true); noink(far);
    // THE NEW HOUSE on the flat top (WP2a's low-detail copy), its lantern a warm dot
    const house = makeFarHouse(K);
    house.group.position.copy(HS); house.group.rotation.set(S.houseTilt, S.houseYaw, 0, "YXZ"); house.group.scale.setScalar(S.houseScale);
    far.add(house.group);
    (group.userData as { house?: typeof house }).house = house;
    // the misty ridges behind, the river bending away left toward the dawn glow (a NOINK panorama)
    const ring = panoramaRing(VX, -2, 300, -3, 70, 4096, 768, EYE.y, (g: G2, k) => {
      const rr = rng(541), row = k.row;
      g.clearRect(0, 0, k.W, k.H);
      // the water below the horizon (far off: pale rose)
      const wg = g.createLinearGradient(0, row(0), 0, k.H); wg.addColorStop(0, "#e8c4bc"); wg.addColorStop(1, "#c8aab4"); g.fillStyle = wg; g.fillRect(0, row(0), k.W, k.H - row(0));
      const ridge = (a0: number, a1: number, base: number, amp: number, col: string, f: number, ph: number) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(k.col(a0), row(-0.05));
        for (let a = a0; a <= a1; a += 0.5) { const u = (a - a0) / (a1 - a0), env = Math.pow(Math.sin(Math.PI * u), 0.4), e = env * (base + amp * (0.55 + 0.3 * Math.sin(a * f + ph) + 0.15 * Math.sin(a * f * 2.9 + ph * 1.7))); g.lineTo(k.col(a), row(e)); }
        g.lineTo(k.col(a1), row(-0.05)); g.closePath(); g.fill();
      };
      // far ridges all round except where the river runs off to the left (az -60 .. -15)
      ridge(-14, 200, 3.4, 3.0, "#c9b4cc", 0.05, 1.0); ridge(205, 300, 3.0, 2.4, "#c4b0c8", 0.06, 2.0);
      ridge(-8, 160, 1.8, 2.2, "#ad9fc0", 0.08, 0.4); ridge(210, 296, 1.6, 2.0, "#a99cbc", 0.09, 1.4);
      // low far banks along the river's bend with a few tree tops
      ridge(-75, -10, 0.45, 0.4, "#9c90ae", 0.3, 0.2); ridge(-140, -70, 0.9, 0.8, "#a294b4", 0.2, 0.8);
      for (let i = 0; i < 60; i++) { const a = -140 + 130 * rr(), x = k.col(a), e = 0.5 + 0.9 * rr(), w = 4 + 6 * rr(); g.fillStyle = "#968aa8"; g.beginPath(); g.ellipse(x, row(e), w, row(0) - row(e) + 2, 0, Math.PI, 0); g.fill(); }
      // haze along the horizon, warmest under the glow
      const hz = g.createLinearGradient(0, row(3), 0, row(0)); hz.addColorStop(0, "rgba(248,212,180,0)"); hz.addColorStop(1, "rgba(248,212,180,0.55)"); g.fillStyle = hz; g.fillRect(0, row(3), k.W, row(0) - row(3));
      blotch(g, k.col(SUN_AZ), row(0.5), 220, "#ffe2b8", 0.5);
    });
    ring.name = "river.ridges"; (ring.material as THREE.MeshBasicMaterial).transparent = true; group.add(ring);
    // the dawn sky: the glow low at the left, a few lit cloud streaks
    group.add(skyDome(V(VX, 0, -2), SKY, (g, W, Hh) => {
      const rr = rng(543), elY = (el: number) => (Hh * (90 - el)) / 180, azX = (az: number) => W * ((((0.75 - az / 360) % 1) + 1) % 1);
      blotch(g, azX(SUN_AZ), elY(SUN_EL), 260, "#ffd8a8", 0.55); blotch(g, azX(SUN_AZ), elY(SUN_EL), 120, "#fff0d0", 0.6); blotch(g, azX(SUN_AZ), elY(SUN_EL), 40, "#fffaf0", 0.7);
      for (let i = 0; i < 16; i++) { const az = -120 + 220 * rr(), el = 8 + 22 * rr(), x = azX(az), y = elY(el), w = 60 + 140 * rr(), near = Math.exp(-(((az - SUN_AZ) / 50) ** 2)); g.fillStyle = css(near > 0.4 ? "#ffd8b8" : "#e8c0c8", 0.45 + 0.3 * near); g.beginPath(); g.ellipse(x, y, w, 4 + 4 * rr(), 0, 0, 7); g.fill(); g.fillStyle = css("#a898b8", 0.35); g.beginPath(); g.ellipse(x + 6, y + 4, w * 0.9, 2.5, 0, 0, 7); g.fill(); }
    }));
  }

  B.flush(group, "river.static");

  // ===================================================================================================== the light
  const L = lightRig(group, { dir: [-0.62, 0.32, -0.45], k: 1.7, col: "#ffd0a8", at: [VX, 0, -1], half: 9, hemi: ["#c8c4e0", "#8a7466", 1.25], point: { col: "#ffffff", k: 0, at: [VX, 2, 0], dist: 4 } });
  const warm = new THREE.Color("#ffd0a8"), cool = new THREE.Color("#c8c8f0");
  const ud = group.userData as { tufts?: { update: (t: number, w: number) => void }; reeds?: { update: (t: number, w: number) => void }; house?: { setLantern: (k: number) => void } };
  let dawn = 0.6;
  const setDawn = (k: number) => { dawn = k; L.key.intensity = 0.8 + 1.3 * k; L.key.color.copy(cool).lerp(warm, k); L.hemi.intensity = 1.1 + 0.3 * k; ud.house?.setLantern(1 - 0.35 * k); shMat.opacity = 0.25 + 0.5 * k; };
  const pose = (t: number) => {
    ud.reeds?.update(t, 1); ud.tufts?.update(t, 0.8);
    gl.offset.set(t * 0.004, t * 0.012);
    sh.offset.set(0, -t * 0.03);
    mists.forEach((m, i) => { const map = (m.material as THREE.MeshBasicMaterial).map!; map.offset.x = t * (0.002 + 0.001 * i); });
  };
  setDawn(dawn); pose(0);
  return {
    group,
    animate(t: number) { pose(t); },
    setParam(name: string, v: ParamValue) { if (name === "dawn") setDawn(Math.max(0, Math.min(1, Number(v)))); },
  };
}
