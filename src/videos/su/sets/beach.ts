// THE BEACH (place "beach", island x 600): 儋州, Hainan, two years later (PLAN 1, 8H). WP2b's set; the exports are the
// contract of sets/index.ts: BEACH_LOOK, BEACH_PARAMS, buildBeach(K) -> { group, view, animate, setParam }. Every place
// number is layout/beach.ts (BEACH_SET, BEACH); its header has the plan.
//
// WHAT THERE IS (her lens looks -z toward the sea; west, the sun, is screen right)
//   - THE SAND: warm pale sand (y 0 round the fire, low dunes far off to the sides and behind the lens) sloping at
//     z ~ -7.5 (wobbling along x) into the sea; a darker wet band along the water's edge, a trail of footprints from the
//     hut's porch to the fire, a scorched patch under the fire;
//   - THE SEA: shallow, see-through turquoise at the edge turning deep blue out to the horizon, slow ripple glints,
//     THREE SURF LINES of white foam that run in up the wet sand and fade, one after the other (a pure function of t);
//     low blue islands, a far junk sail and a bank of toon cumulus on the horizon (a NOINK panorama), a bright sky;
//   - THE HUT 桄榔庵 at the left: woven palm-leaf walls on bamboo posts, a dark doorway with a half-rolled bamboo blind,
//     a barred window, a heavy thatched hip roof with a straw fringe, its porch on a low bamboo platform (four posts, a
//     water jar, coconuts, a fishing net hung to dry, a gourd);
//   - FIVE COCONUT PALMS: curved ringed trunks, crowns of drooping fronds (they sway), coconuts; bushes and beach grass
//     at their feet; a few dark rocks at the water's edge, bleached driftwood on the sand;
//   - THE FIRE RING in the middle: stones round it, crossed driftwood burning, a glowing ember bed, THE FLAMES (the set
//     draws the fire: param fire 0..1 = their size, glow and flicker; the place's point light IS the fire; no fire prop
//     is used here), a thin smoke; the flat oyster stone at its edge with oysters roasting, a basket of oysters, a heap
//     of shells; the two driftwood logs they sit on (top 0.30 = BEACH.seatTop).
// INK / FLICKER: sand grains, weave, thatch, rings and grain are PAINT; inked geometry is chunky (trunks 24-34 cm, posts
// 12-14 cm, the logs 30 cm, the roof); the fire's stones and sticks, the oysters, the basket, the shells, the jar,
// coconuts and the gourd are props-kit Parts (NOINK + their own hull); fronds, grass, the net, foam, water, flames,
// glows, smoke, decals, the panorama and the sky are NOINK. Seeded painting only; animate is a pure function of t.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, skyDome, Batch, makeFlame, glowCard, facesG, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { BEACH_SET as S, BEACH, BX } from "../layout/beach";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, boxG, shade, terrainG, rockG, rockFit, tileUV, wallQuad, makeCloth, faceY, wrapBlotch, smooth01, Part, NOINK } from "./parts/common";
import { strandField, type Strand } from "./parts/strands";
import { blobG, panoramaRing, cloudPuff } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.66, 0.6, 0.5]], [-8, [0.75, 0.75, 0.72]], [5, [0.86, 0.91, 0.94]], [40, [0.6, 0.78, 0.94]], [90, [0.56, 0.74, 0.94]]],
  boxes: [{ az: -60, el: 30, rot: 0, w: 40, h: 18, soft: 14, col: [1.0, 0.86, 0.66] }],
};
/** a warm, saturated tropical grade (a touch more colour in the mids, warm highlights) */
const GRADE: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [1.0, 1.06, 1.0], tintS: [0.004, 0.004], tintM: [-0.012, 0.01], tintH: [-0.02, 0.012], vig: [0.14, 0.45] };
/** TROPICAL LATE AFTERNOON: a strong warm sun from the front right (west), a bright turquoise-blue sky fill */
export const BEACH_LOOK: PlaceLook = {
  bg: "#9fd4ec",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.7, color: "#3a4050" },
  cast: {
    key: [0.68, 0.5, 0.53], tint: [1.0, 0.9, 0.74], tintK: 0.85, gain: 0.94, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.95, 1.0],
    shade: [1.04, 0.95, 1.3], shadeK: 0.36, wrap: [28, 56], edge: 0.13, broad: 0.1, bodySat: 0.14, sheen: 0.1, lift: 0.02, contactLen: 0.45,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
  grade: GRADE,
};
/** the per-frame dressing: fire 0..1 (the fire's flames, glow, flicker and smoke: the SET draws the fire) */
export const BEACH_PARAMS: Record<string, ParamValue> = { fire: 1 };

const COL = {
  sand: "#ecd8a6", sandLo: "#d9c08a", sandHi: "#f6e8c4", grain: "#c2a56e",
  shallow: "#7fdccc", sea: "#3cc0c8", seaMid: "#2aa2c4", deep: "#2482b8", far: "#3c8ec2", foam: "#fbfaf2",
  mat: "#c6a66a", matLo: "#a8884e", matHi: "#dcc088", matLine: "#7e6238", bamboo: "#b89c5c", bambooLo: "#8a7240", thatch: "#bc9452", thatchLo: "#8e6a34", thatchHi: "#dcbc78",
  under: "#6e5432", dark: "#33261a", plank: "#a88a58",
  trunk: "#9c8466", trunkLo: "#6c5a44", trunkHi: "#bca686", frond: "#3e9446", frondHi: "#86c45a", frondLo: "#246a32", rib: "#c8d47a", nut: "#6e7a34", nutLo: "#4e5a24",
  bush: "#3a8240", bushLo: "#2c6834", grass: "#6a9a48", grassTip: "#c8c27a",
  drift: "#bdb2a0", driftLo: "#8e8474", driftHi: "#dcd4c4", char: "#2e2824", stone: "#8e8678", stoneLo: "#6e665a", rock: "#4e4a4a",
  oyster: "#8e8474", oysterHi: "#ece4d4", wicker: "#b48e52", wickerLo: "#86663a", jar: "#a8603c", jarLo: "#7a4028", gourd: "#c8a44c",
  net: "#6e5432", float: "#d8c49a",
};
/** the sky by elevation (degrees): pale and warm at the horizon, a clear tropical blue overhead */
const SKY: SkyStops = [[-10, "#a8d8e8"], [0, "#f4f0e2"], [3, "#dcf0f4"], [12, "#a6d6ee"], [35, "#66b2e6"], [90, "#4090d8"]];
const SD = S.sand, SEA_Y = S.sea.y, FR = S.fireRing, HU = S.hut, LG = S.logs;
/** where the dry sand ends and starts sloping into the sea (wobbling along x round sand.z0) */
const ZS = (x: number) => SD.z0 + 0.45 * Math.sin((x - BX) * 0.23 + 0.5) + 0.25 * Math.sin((x - BX) * 0.61 + 2.0);
/** the sand's height: 0 round the fire and the hut; low dunes far to the sides and behind the lens; the slope into the sea */
const H = (x: number, z: number) => {
  const dd = ZS(x) - z;
  if (dd <= 0) {
    const fade = smooth01(0, 3, -dd), ax = Math.abs(x - BX);
    return fade * (0.22 * smooth01(7, 14, ax) * (0.55 + 0.45 * Math.sin(x * 0.37) * Math.cos(z * 0.41)) + 0.35 * smooth01(5, 16, z) * (0.6 + 0.4 * Math.sin(x * 0.23 + 1)));
  }
  return -0.11 * dd - 0.9 * smooth01(1, 20, dd);
};
/** the shore line (where the sand meets the water: dd at which H = SEA_Y) */
const SHORE_DD = -SEA_Y / 0.11;

// ---------------------------------------------------------------------------------------------------- the paintings
/** the sand (a 4 m tile, multiplied by the terrain's wet / dry colours): grains, soft mottle, wind ripples, tiny shells */
const sandTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(601);
  g.fillStyle = COL.sand; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 36; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 40 + 80 * r(), r() < 0.5 ? COL.sandLo : COL.sandHi, 0.3);
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = W * r(), y = Hh * r(), w = 30 + 60 * r();
    for (const dx of [-W, 0, W]) for (const dy of [-Hh, 0, Hh]) { g.strokeStyle = css(COL.sandLo, 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 6, x + dx + w / 2, y + dy + 2); g.stroke(); g.strokeStyle = css(COL.sandHi, 0.4); g.beginPath(); g.moveTo(x + dx - w / 2, y + dy - 3); g.quadraticCurveTo(x + dx, y + dy - 9, x + dx + w / 2, y + dy - 1); g.stroke(); }
  }
  for (let i = 0; i < 2400; i++) { g.fillStyle = css(r() < 0.6 ? COL.grain : COL.sandHi, 0.5); g.fillRect(W * r(), Hh * r(), 1.6, 1.6); }
  for (let i = 0; i < 26; i++) { const x = W * r(), y = Hh * r(), rr = 2 + 3 * r(); g.fillStyle = r() < 0.5 ? "#fff6ec" : "#f2c8bc"; g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, r() * 3, 0, 7); g.fill(); g.fillStyle = css(COL.grain, 0.6); g.fillRect(x - rr, y + rr * 0.6, rr * 2, 1.5); }
}, true);
/** the woven palm-leaf walls (a 1 m tile): basket-weave strips, darker joints, a few lighter streaks */
const matTex = () => paint(256, 256, (g, W, Hh) => {
  const r = rng(603), n = 12, s = W / n;
  g.fillStyle = COL.mat; g.fillRect(0, 0, W, Hh);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const across = (i + j) % 2 === 0;
    g.fillStyle = shade(across ? COL.mat : COL.matLo, (r() - 0.5) * 0.12); g.fillRect(i * s, j * s, s, s);
    g.strokeStyle = css(across ? COL.matHi : COL.matLine, 0.45); g.lineWidth = 1;
    for (let k = 1; k < 4; k++) { g.beginPath(); if (across) { g.moveTo(i * s, j * s + (k * s) / 4); g.lineTo(i * s + s, j * s + (k * s) / 4); } else { g.moveTo(i * s + (k * s) / 4, j * s); g.lineTo(i * s + (k * s) / 4, j * s + s); } g.stroke(); }
  }
  g.strokeStyle = css(COL.matLine, 0.7); g.lineWidth = 1.5;
  for (let k = 0; k <= n; k++) { g.beginPath(); g.moveTo(0, k * s); g.lineTo(W, k * s); g.stroke(); g.beginPath(); g.moveTo(k * s, 0); g.lineTo(k * s, Hh); g.stroke(); }
}, true);
/** thatch (u along the eave, v up the slope; a 0.6 m tile): straw strokes in courses, each course's lower edge shaded */
const thatchTex = () => paint(256, 256, (g, W, Hh) => {
  const r = rng(605);
  g.fillStyle = COL.thatch; g.fillRect(0, 0, W, Hh);
  const rows = 4, rh = Hh / rows;
  for (let k = 0; k < rows; k++) {
    const y0 = k * rh;
    const gr = g.createLinearGradient(0, y0, 0, y0 + rh); gr.addColorStop(0, css(COL.thatchHi, 0.3)); gr.addColorStop(0.75, "rgba(0,0,0,0)"); gr.addColorStop(1, css(COL.thatchLo, 0.6));
    g.fillStyle = gr; g.fillRect(0, y0, W, rh);
    for (let i = 0; i < 160; i++) { const x = W * r(), y = y0 + rh * r(), l = 10 + 18 * r(); g.strokeStyle = css(r() < 0.5 ? COL.thatchHi : COL.thatchLo, 0.55); g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y + l); g.stroke(); }
  }
}, true);
/** the straw fringe under the eaves (transparent; canvas top = the eave): strands hanging, ragged ends */
const fringeTex = () => paint(256, 64, (g, W, Hh) => {
  const r = rng(607);
  g.clearRect(0, 0, W, Hh);
  g.fillStyle = COL.thatchLo; g.fillRect(0, 0, W, 8);
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const x = W * r(), l = Hh * (0.35 + 0.65 * r()); g.strokeStyle = r() < 0.4 ? COL.thatchLo : r() < 0.7 ? COL.thatch : COL.thatchHi; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 4, l); g.stroke(); }
}, true);
/** bamboo (u round, v along a 0.5 m tile): a node ring with a lighter band above it */
const bambooTex = () => paint(64, 128, (g, W, Hh) => {
  g.fillStyle = COL.bamboo; g.fillRect(0, 0, W, Hh);
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(0,0,0,0.12)"); gr.addColorStop(0.5, "rgba(255,255,255,0.1)"); gr.addColorStop(1, "rgba(0,0,0,0.12)"); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
  g.fillStyle = COL.bambooLo; g.fillRect(0, Hh * 0.48, W, 5); g.fillStyle = "rgba(255,240,200,0.35)"; g.fillRect(0, Hh * 0.48 - 4, W, 4);
}, true);
/** a palm trunk (u round, v along: one ring per tile): a ring scar, plated bark, fibres */
const trunkTex = () => paint(128, 64, (g, W, Hh) => {
  const r = rng(609);
  g.fillStyle = COL.trunk; g.fillRect(0, 0, W, Hh);
  g.fillStyle = css(COL.trunkHi, 0.5); g.fillRect(0, Hh * 0.18, W, Hh * 0.3);
  g.fillStyle = COL.trunkLo; g.fillRect(0, Hh * 0.82, W, Hh * 0.12);
  for (let i = 0; i < 40; i++) { const x = W * r(); g.strokeStyle = css(COL.trunkLo, 0.35); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, Hh * 0.1); g.lineTo(x + 2, Hh * 0.8); g.stroke(); }
}, true);
/** one frond (transparent; u across with the rib in the middle, v along: canvas top = the tip): leaflets slanting to the tip */
const frondTex = () => paint(128, 512, (g, W, Hh) => {
  g.clearRect(0, 0, W, Hh);
  g.lineCap = "round";
  for (let y = Hh - 6; y > 6; y -= 7) {
    const k = 1 - y / Hh, dy = 26 + 10 * k;
    for (const sg of [-1, 1]) {
      const ex = W / 2 + sg * (W / 2 - 3), ey = y - dy;
      g.strokeStyle = COL.frondLo; g.lineWidth = 6.5; g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W / 2 + sg * W * 0.3, y - dy * 0.3, ex, ey); g.stroke();
      g.strokeStyle = (y / 7) % 3 < 1 ? COL.frondHi : COL.frond; g.lineWidth = 3.6; g.beginPath(); g.moveTo(W / 2, y); g.quadraticCurveTo(W / 2 + sg * W * 0.3, y - dy * 0.3, ex, ey); g.stroke();
    }
  }
  g.strokeStyle = COL.frondLo; g.lineWidth = 7; g.beginPath(); g.moveTo(W / 2, Hh); g.lineTo(W / 2, 0); g.stroke();
  g.strokeStyle = COL.rib; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, Hh); g.lineTo(W / 2, 0); g.stroke();
});
/** bleached driftwood (u along, v round: put it on a bar with alongUV): long, nearly straight grain lines that share
 *  one slow wave (they never cross), a few dark cracks, small knots */
const driftTex = () => paint(512, 128, (g, W, Hh) => {
  const r = rng(611), wave = (x: number) => 1.4 * Math.sin((x / W) * 4 * Math.PI);
  g.fillStyle = COL.drift; g.fillRect(0, 0, W, Hh);
  g.lineCap = "round";
  const line = (y: number, x0: number, x1: number) => { g.beginPath(); g.moveTo(x0, y + wave(x0)); for (let x = x0; x <= x1; x += 8) g.lineTo(x, y + wave(x)); g.stroke(); };
  for (let i = 0; i < 22; i++) { g.strokeStyle = css(r() < 0.65 ? COL.driftLo : COL.driftHi, 0.3 + 0.3 * r()); g.lineWidth = 1 + 1.5 * r(); line((Hh * (i + 0.2 + 0.6 * r())) / 22, 0, W); }
  for (let i = 0; i < 3; i++) { g.strokeStyle = css(COL.driftLo, 0.75); g.lineWidth = 2; const x0 = W * r() * 0.5; line(Hh * r(), x0, x0 + W * (0.25 + 0.2 * r())); }
  for (let i = 0; i < 4; i++) { const x = 20 + (W - 40) * r(), y = 10 + (Hh - 20) * r(); g.strokeStyle = css(COL.driftLo, 0.85); g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, 9, 3.5, 0, 0, 7); g.stroke(); g.fillStyle = css(COL.driftLo, 0.8); g.beginPath(); g.ellipse(x, y, 3, 1.2, 0, 0, 7); g.fill(); }
}, true);
/** turn a bar's uv so that u runs along it (k tiles over its length) and v round it (for driftTex) */
const alongUV = (g: THREE.BufferGeometry, k = 1) => { const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i) * k, uv.getX(i)); return g; };
/** wicker (the basket) */
const wickerTex = () => paint(128, 64, (g, W, Hh) => {
  g.fillStyle = COL.wicker; g.fillRect(0, 0, W, Hh);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 16; i++) { g.fillStyle = (i + j) % 2 ? COL.wickerLo : shade(COL.wicker, 0.12); g.fillRect(i * 8 + 1, j * 8 + 1, 6, 6); }
}, true);
/** the foam of one surf line (transparent; u along a 4 m tile, canvas top = its front edge toward the shore) */
const foamTex = () => paint(256, 64, (g, W, Hh) => {
  const r = rng(613);
  g.clearRect(0, 0, W, Hh);
  const gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.25, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 90; i++) { const x = W * r(), y = Hh * (0.25 + 0.75 * r()), rr = 3 + 7 * r(); for (const dx of [-W, 0, W]) { g.fillStyle = "rgba(0,0,0,0.9)"; g.beginPath(); g.ellipse(x + dx, y, rr * 1.6, rr, 0, 0, 7); g.fill(); } }
  g.globalCompositeOperation = "source-over";
}, true);
/** glints on the water (transparent, a 6 m tile): short bright arcs */
const rippleTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(615);
  g.clearRect(0, 0, W, Hh);
  g.lineCap = "round";
  for (let i = 0; i < 120; i++) { const x = W * r(), y = Hh * r(), w = 14 + 30 * r(); g.strokeStyle = r() < 0.75 ? "rgba(255,255,255,0.7)" : "rgba(20,90,140,0.45)"; g.lineWidth = 2.4; for (const dx of [-W, 0, W]) for (const dy of [-Hh, 0, Hh]) { g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 4, x + dx + w / 2, y + dy); g.stroke(); } }
}, true);
/** the ember bed (top down): dark coals with orange cracks, a hot middle */
const emberTex = () => paint(256, 256, (g, W) => {
  const r = rng(617), c = W / 2;
  g.fillStyle = "#2a1c18"; g.fillRect(0, 0, W, W);
  const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, "rgba(255,170,60,0.9)"); gr.addColorStop(0.5, "rgba(220,80,20,0.6)"); gr.addColorStop(1, "rgba(60,30,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 60; i++) { const x = W * r(), y = W * r(), rr = 6 + 12 * r(); g.fillStyle = r() < 0.5 ? "#3a2a24" : "#1e1614"; g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, r() * 3, 0, 7); g.fill(); g.strokeStyle = "rgba(255,150,50,0.8)"; g.lineWidth = 1.5; g.stroke(); }
});
/** the scorch and ash under the fire (transparent decal) */
const scorchTex = () => paint(256, 256, (g, W) => {
  const r = rng(619), c = W / 2;
  g.clearRect(0, 0, W, W);
  const gr = g.createRadialGradient(c, c, W * 0.1, c, c, c); gr.addColorStop(0, "rgba(60,48,40,0.85)"); gr.addColorStop(0.55, "rgba(90,74,60,0.5)"); gr.addColorStop(1, "rgba(120,100,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 40; i++) blotch(g, c + (r() - 0.5) * W * 0.7, c + (r() - 0.5) * W * 0.7, 6 + 12 * r(), r() < 0.5 ? "#8a8278" : "#4a3e36", 0.4);
});
/** footprints (transparent decal; u across the trail, v along it, 1 m a tile): left / right dents with a lit rim */
const stepsTex = () => paint(128, 256, (g, W, Hh) => {
  g.clearRect(0, 0, W, Hh);
  for (let k = 0; k < 2; k++) {
    const x = W * (k ? 0.68 : 0.32), y = Hh * (k ? 0.72 : 0.25);
    g.fillStyle = "rgba(150,120,70,0.5)"; g.beginPath(); g.ellipse(x, y, 11, 26, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(255,246,220,0.45)"; g.beginPath(); g.ellipse(x + 3, y - 4, 9, 22, 0, Math.PI * 1.1, Math.PI * 1.9); g.fill();
  }
}, true);
/** the drying net (transparent): a diamond mesh, corks along the top */
const netTex = () => paint(256, 256, (g, W, Hh) => {
  g.clearRect(0, 0, W, Hh);
  g.strokeStyle = css(COL.net, 0.95); g.lineWidth = 2;
  for (let k = -16; k <= 16; k++) { g.beginPath(); g.moveTo(k * 16, 0); g.lineTo(k * 16 + Hh, Hh); g.stroke(); g.beginPath(); g.moveTo(k * 16 + Hh, 0); g.lineTo(k * 16, Hh); g.stroke(); }
  g.lineWidth = 4; g.beginPath(); g.moveTo(0, 4); g.lineTo(W, 4); g.stroke();
  for (let x = 12; x < W; x += 36) { g.fillStyle = COL.float; g.beginPath(); g.ellipse(x, 8, 9, 6, 0, 0, 7); g.fill(); g.strokeStyle = COL.net; g.lineWidth = 1.5; g.stroke(); }
});

// ---------------------------------------------------------------------------------------------------- geometry
/** a tapered tube along points (rings of `seg`), uv: u = 0..3 round, v = metres along / `ring` */
const taperTube = (pts: THREE.Vector3[], r0: number, r1: number, ring: number, seg = 12) => {
  const curve = new THREE.CatmullRomCurve3(pts), n = 24, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const frames = curve.computeFrenetFrames(n, false), len = curve.getLength();
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPointAt(t), N = frames.normals[i], B = frames.binormals[i], rr = r0 + (r1 - r0) * t;
    for (let j = 0; j <= seg; j++) { const a = (j / seg) * Math.PI * 2; pos.push(p.x + rr * (Math.cos(a) * N.x + Math.sin(a) * B.x), p.y + rr * (Math.cos(a) * N.y + Math.sin(a) * B.y), p.z + rr * (Math.cos(a) * N.z + Math.sin(a) * B.z)); uv.push((j / seg) * 3, (t * len) / ring); }
    if (i < n) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** one frond: an inverted-V strip (left edge, rib, right edge) from the crown out along +z, rising then drooping;
 *  uv u across (rib 0.5), v along (tip 1) */
const frondG = (L: number, Wd: number, rise: number, droop: number, n = 10) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, z = L * s * (1 - 0.18 * s * s), y = L * (rise * s - droop * s * s), w = Wd * Math.pow(Math.sin(Math.PI * (0.06 + 0.9 * s)), 0.6), fold = 0.45 * w;
    pos.push(-w, y - fold, z, 0, y, z, w, y - fold, z); uv.push(0, s, 0.5, s, 1, s);
    if (i < n) { const a = i * 3, b = a + 3; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** a grid in x / z (the given rows and columns), each vertex coloured (RGBA) by fn */
const gridG = (xs: number[], zs: number[], y: number, fn: (x: number, z: number) => [number, number, number, number], clampR?: { cx: number; cz: number; r: number }) => {
  const pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j < zs.length; j++) for (let i = 0; i < xs.length; i++) {
    let x = xs[i], z = zs[j];
    if (clampR) { const dx = x - clampR.cx, dz = z - clampR.cz, d = Math.hypot(dx, dz); if (d > clampR.r) { x = clampR.cx + (dx * clampR.r) / d; z = clampR.cz + (dz * clampR.r) / d; } }
    pos.push(x, y, z); col.push(...fn(x, z)); uv.push(x / 6, -z / 6);
  }
  // (the rows run toward -z: this winding faces up)
  for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < xs.length; i++) { const a = j * xs.length + i, b = a + 1, c = a + xs.length, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const n = g.attributes.position.count; g.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(n * 3).map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
  return g;
};
const steps = (a: number, b: number, s: number) => { const out: number[] = []; for (let v = a; s > 0 ? v <= b + 1e-6 : v >= b - 1e-6; v += s) out.push(v); return out; };
const rgbOf = (hexc: string) => { const c = new THREE.Color(hexc); return [c.r, c.g, c.b] as [number, number, number]; };

export function buildBeach(K: Kit) {
  const group = new THREE.Group(); group.name = "set-beach";
  const Mk = maker(K, group), r = rng(631), B = new Batch();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ===================================================================================================== the sand
  {
    const map = sandTex(); map.repeat.set((80) / 4, (SD.z1 + 30) / 4);
    const g = terrainG(BX - 40, BX + 40, -30, SD.z1, 160, Math.round((SD.z1 + 30) * 2), 0, H);
    const p = g.attributes.position as THREE.BufferAttribute, cols = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), dd = ZS(x) - z;
      const wet = smooth01(-0.9, SHORE_DD, dd), under = smooth01(SHORE_DD, SHORE_DD + 1.5, dd);
      const c = [1 - 0.17 * wet - 0.08 * under, 1 - 0.21 * wet - 0.06 * under, 1 - 0.28 * wet - 0.02 * under];
      cols.set(c, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const m = Mk.own("#ffffff", { map, rough: 0.95 }); m.vertexColors = true;
    Mk.mesh("beach.sand", g, m, { cast: false });
    // decals: the scorch under the fire, the footprints from the porch to the fire
    const dm = (map2: THREE.Texture) => { const q = Mk.own("#ffffff", { map: map2, rough: 0.95 }); q.transparent = true; q.depthWrite = false; q.polygonOffset = true; q.polygonOffsetFactor = -1; q.polygonOffsetUnits = -1; return q; };
    Mk.mesh("beach.scorch", new THREE.PlaneGeometry(1.5, 1.5).rotateX(-Math.PI / 2).translate(FR.x, 0.0006, FR.z), dm(scorchTex()), { cast: false, noink: true });
    const trail = [V(HU.x0 + 1.2, 0, HU.porch.z + 0.3), V(BX - 2.2, 0, -1.2), V(BX - 0.9, 0, -1.6)], st = stepsTex();
    for (let i = 0; i + 1 < trail.length; i++) {
      const a = trail[i], b = trail[i + 1], len = a.distanceTo(b), mid = a.clone().lerp(b, 0.5), yaw = Math.atan2(b.x - a.x, b.z - a.z);
      const t2 = st.clone(); t2.needsUpdate = true; t2.repeat.set(1, len / 0.9);
      const q = new THREE.PlaneGeometry(0.42, len).rotateX(-Math.PI / 2).rotateY(yaw).translate(mid.x, 0.0006, mid.z);
      Mk.mesh(`beach.steps${i}`, q, dm(t2), { cast: false, noink: true });
    }
  }

  // ===================================================================================================== the sea
  const seaY = SEA_Y;
  const shallow = rgbOf(COL.shallow), sea = rgbOf(COL.sea), mid = rgbOf(COL.seaMid), deep = rgbOf(COL.deep), far = rgbOf(COL.far);
  const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
  const seaCol = (x: number, z: number): [number, number, number, number] => {
    const d = ZS(x) - z - SHORE_DD;
    let c: number[], a: number;
    if (d < 2.5) { const k = smooth01(0, 2.5, d); c = lerp3(shallow, sea, k); a = 0.42 + 0.4 * k; }
    else if (d < 14) { const k = smooth01(2.5, 14, d); c = lerp3(sea, mid, k); a = 0.82 + 0.16 * k; }
    else if (d < 60) { c = lerp3(mid, deep, smooth01(14, 60, d)); a = 1; }
    else { c = lerp3(deep, far, smooth01(60, 240, d)); a = 1; }
    return [c[0], c[1], c[2], a];
  };
  const xsSea = [...steps(BX - 240, BX - 60, 20), ...steps(BX - 45, BX + 45, 1), ...steps(BX + 60, BX + 240, 20)];
  const zsSea = [...steps(-4, -24, -0.5), ...steps(-26, -60, -2), ...steps(-75, -240, -15)];
  const seaMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const seaMesh = Mk.mesh("beach.sea", gridG(xsSea, zsSea, seaY, seaCol, { cx: BX, cz: -2, r: 244 }), seaMat, { cast: false, receive: false, noink: true });
  seaMesh.renderOrder = 1;
  // glints on the water, fading out near the shore and far off
  const ripMap = rippleTex();
  const ripMat = new THREE.MeshBasicMaterial({ map: ripMap, vertexColors: true, transparent: true, depthWrite: false, fog: false, opacity: 0.55, side: THREE.DoubleSide });
  const rip = Mk.mesh("beach.glints", gridG(steps(BX - 45, BX + 45, 1.5), [...steps(-6, -30, -0.75), ...steps(-32, -80, -3)], seaY + 0.002, (x, z) => {
    const d = ZS(x) - z - SHORE_DD; return [1, 1, 1, smooth01(0.8, 3.5, d) * (1 - smooth01(30, 75, d)) * (1 - smooth01(30, 44, Math.abs(x - BX)))];
  }), ripMat, { cast: false, receive: false, noink: true });
  rip.renderOrder = 2;
  // THE SURF: three foam lines that run in up the slope and fade, one after the other; and the lap at the water's edge
  const NXS = 160, SX0 = BX - 40, SX1 = BX + 40, foam = foamTex();
  const band = (name: string, ph: number) => {
    const pos = new Float32Array((NXS + 1) * 2 * 3), uv = new Float32Array((NXS + 1) * 2 * 2), idx: number[] = [];
    for (let i = 0; i <= NXS; i++) { const x = SX0 + ((SX1 - SX0) * i) / NXS; uv.set([x / 4 + ph, 1, x / 4 + ph, 0], i * 4); if (i < NXS) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array((NXS + 1) * 2 * 3).map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
    const m = new THREE.MeshBasicMaterial({ color: COL.foam, map: foam, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const mesh = Mk.mesh(name, g, m, { cast: false, receive: false, noink: true }); mesh.renderOrder = 3; mesh.frustumCulled = false;
    const P = g.attributes.position as THREE.BufferAttribute;
    /** lay the line `d` m out from the shore line (negative: up the wet sand), `w` m wide, at `op` opacity */
    const lay = (d: number, w: number, op: number, wob: number) => {
      for (let i = 0; i <= NXS; i++) {
        const x = SX0 + ((SX1 - SX0) * i) / NXS, dd = d + 0.22 * Math.sin(x * 0.35 + wob) + 0.12 * Math.sin(x * 0.9 + wob * 1.7);
        const zf = ZS(x) - SHORE_DD - dd, zb = zf - w;
        P.setXYZ(i * 2, x, Math.max(seaY, H(x, zf)) + 0.006, zf); P.setXYZ(i * 2 + 1, x, Math.max(seaY, H(x, zb)) + 0.006, zb);
      }
      P.needsUpdate = true; m.opacity = op;
    };
    return { mesh, lay };
  };
  const surf = [0, 1, 2].map((k) => band(`beach.surf${k}`, k * 0.37));
  const lap = band("beach.lap", 0.6);

  // ===================================================================================================== the far view
  {
    const ring = panoramaRing(BX, -2, 250, -3, 60, 4096, 768, 1.5, (g: G2, k) => {
      const rr = rng(641), row = k.row;
      g.clearRect(0, 0, k.W, k.H);
      // the far sea below the horizon, a pale haze above it
      const sg = g.createLinearGradient(0, row(0), 0, k.H); sg.addColorStop(0, css(COL.far)); sg.addColorStop(1, css(COL.deep)); g.fillStyle = sg; g.fillRect(0, row(0), k.W, k.H - row(0));
      const hz = g.createLinearGradient(0, row(2.2), 0, row(0)); hz.addColorStop(0, "rgba(244,240,226,0)"); hz.addColorStop(1, "rgba(244,240,226,0.85)"); g.fillStyle = hz; g.fillRect(0, row(2.2), k.W, row(0) - row(2.2));
      // a bank of cumulus over the horizon (behind the islands)
      for (let i = 0; i < 26; i++) { const az = -150 + 300 * rr(), w = 120 + 300 * rr(); cloudPuff(g, k.col(az), row(1.2 + 6 * rr()), w, rr, "#ffffff", "rgba(200,222,236,0.96)"); }
      // low blue islands
      const isl = (a0: number, a1: number, h: number, col: string, ph: number) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(k.col(a0), row(-0.1));
        for (let a = a0; a <= a1; a += 0.5) { const u = (a - a0) / (a1 - a0), e = h * Math.pow(Math.sin(Math.PI * u), 0.7) * (0.8 + 0.2 * Math.sin(a * 0.9 + ph)); g.lineTo(k.col(a), row(e)); }
        g.lineTo(k.col(a1), row(-0.1)); g.closePath(); g.fill();
      };
      isl(-78, -58, 1.5, "#86aec4", 1); isl(-64, -50, 0.8, "#78a2bc", 2); isl(28, 44, 1.1, "#8ab2c6", 3); isl(70, 96, 1.8, "#82aac2", 4); isl(88, 100, 0.9, "#7aa2ba", 5);
      // a far junk with its batten sail (az 14)
      const jx = k.col(14), jy = row(0.05);
      g.fillStyle = "#5a4636"; g.fillRect(jx - 9, jy - 3, 18, 3);
      g.fillStyle = "#a85a3c"; g.beginPath(); g.moveTo(jx - 2, jy - 3); g.lineTo(jx - 2, row(0.85)); g.lineTo(jx + 7, row(0.75)); g.lineTo(jx + 6, jy - 3); g.closePath(); g.fill();
      g.strokeStyle = "rgba(80,50,40,0.8)"; g.lineWidth = 1; for (let s = 1; s < 4; s++) { const y = jy - 3 + ((row(0.8) - jy + 3) * s) / 4; g.beginPath(); g.moveTo(jx - 2, y); g.lineTo(jx + 6.5, y); g.stroke(); }
    });
    ring.name = "beach.far"; (ring.material as THREE.MeshBasicMaterial).transparent = true; ring.renderOrder = -60; group.add(ring);
    group.add(skyDome(V(BX, 0, -2), SKY, (g, W, Hh) => {
      const rr = rng(643), elY = (el: number) => (Hh * (90 - el)) / 180, azX = (az: number) => W * ((((0.75 - az / 360) % 1) + 1) % 1);
      for (let i = 0; i < 9; i++) { const az = -120 + 240 * rr(), el = 16 + 22 * rr(); cloudPuff(g, azX(az), elY(el), 50 + 70 * rr(), rr, "#ffffff", "rgba(206,226,240,0.9)"); }
    }));
  }

  // ===================================================================================================== the hut 桄榔庵
  {
    const mat = Mk.tex(matTex(), 0.9), bam = bambooTex(), bamM = Mk.tex(bam, 0.7), thatch = Mk.tex(thatchTex(), 0.95), dark = Mk.flat(COL.dark, 0.95), under = Mk.flat(COL.under, 0.95);
    const x0 = HU.x0, x1 = HU.x1, z0 = HU.z0, z1 = HU.z1, top = 2.1, T = 0.06;
    const dx0 = BX - 3.95, dx1 = BX - 3.15, dh = 1.62, wx0 = BX - 2.95, wx1 = BX - 2.45, wy0 = 0.95, wy1 = 1.45;
    const wall = (g: THREE.BufferGeometry) => B.add(mat, tileUV(g, 1));
    wall(boxG(x0, x1, 0, top, z0, z0 + T)); wall(boxG(x0, x0 + T, 0, top, z0, z1)); wall(boxG(x1 - T, x1, 0, top, z0, z1));
    wall(boxG(x0, dx0, 0, top, z1 - T, z1)); wall(boxG(dx0, dx1, dh, top, z1 - T, z1));
    wall(boxG(dx1, wx0, 0, top, z1 - T, z1)); wall(boxG(wx1, x1, 0, top, z1 - T, z1)); wall(boxG(wx0, wx1, 0, wy0, z1 - T, z1)); wall(boxG(wx0, wx1, wy1, top, z1 - T, z1));
    B.add(dark, boxG(x0 + T, x1 - T, 0, top - 0.05, z0 + T, z1 - 0.4));                                  // the dark inside, seen through the door
    // bamboo: corner posts, door posts, the window's bars, a rail along the wall's top
    const post = (x: number, z: number, h: number, rp: number) => { const q = new THREE.CylinderGeometry(rp, rp * 1.05, h, 12).translate(x, h / 2, z); const uv = q.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setY(i, (uv.getY(i) * h) / 0.5); return q; };
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as [number, number][]) B.add(bamM, post(x, z, top, 0.07));
    for (const x of [dx0, dx1]) B.add(bamM, post(x, z1 + 0.01, dh + 0.05, 0.05));
    B.add(bamM, bar(V(x0, 1.74, z1 + 0.04), V(x1, 1.74, z1 + 0.04), 0.045));
    const P = new Part(K);
    for (let i = 0; i < 3; i++) { const x = wx0 + ((wx1 - wx0) * (i + 1)) / 4; P.add(bamM, new THREE.CylinderGeometry(0.018, 0.018, wy1 - wy0, 8).translate(x, (wy0 + wy1) / 2, z1 - T / 2), 0.004); }
    P.add(dark, boxG(wx0, wx1, wy0, wy1, z1 - T - 0.02, z1 - T - 0.01), 0);
    // the half-rolled bamboo blind over the door
    P.add(bamM, new THREE.CylinderGeometry(0.05, 0.05, dx1 - dx0 + 0.08, 12).rotateZ(Math.PI / 2).translate((dx0 + dx1) / 2, dh - 0.12, z1 + 0.06), 0.005);
    P.add(Mk.flat("#8a6a3a"), boxG(dx0 + 0.02, dx1 - 0.02, dh - 0.48, dh - 0.12, z1 + 0.03, z1 + 0.04), 0.004);
    // THE PORCH: a low bamboo platform, four posts, a log step
    const pl = Mk.tex(bam, 0.8), ph = 0.18, pz0 = z1, pz1 = HU.porch.z + 0.15;
    B.add(pl, tileUV(boxG(HU.porch.x0 - 0.05, HU.porch.x1 + 0.05, 0, ph, pz0, pz1), 0.5));
    const zp = HU.porch.z, eave = 1.95;
    for (let i = 0; i < 4; i++) B.add(bamM, post(HU.porch.x0 + ((HU.porch.x1 - HU.porch.x0) * i) / 3, zp, eave - 0.12, 0.065));
    B.add(Mk.tex(driftTex(), 0.9), alongUV(bar(V(dx0, 0.07, pz1 + 0.12), V(dx1, 0.07, pz1 + 0.12), 0.075), 2));
    // THE ROOF: a thick thatched hip roof over the hut and its porch, its underside dark, a straw fringe, a ridge roll
    const rx0 = x0 - 0.45, rx1 = x1 + 0.45, rz0 = z0 - 0.45, rz1 = zp + 0.3, y0 = eave, y1 = HU.top, th = 0.14, rz = (rz0 + rz1) / 2, rA = x0 + 0.4, rB = x1 - 0.4;
    const a = V(rx0, y0, rz1), b = V(rx1, y0, rz1), c = V(rx1, y0, rz0), d = V(rx0, y0, rz0), e = V(rA, y1, rz), f = V(rB, y1, rz);
    const lo = (v: THREE.Vector3) => v.clone().setY(y0 - th), a2 = lo(a), b2 = lo(b), c2 = lo(c), d2 = lo(d);
    const slopes = facesG([[a, b, f, e], [b, c, f], [c, d, e, f], [d, a, e], [a2, b2, b, a], [b2, c2, c, b], [c2, d2, d, c], [d2, a2, a, d]]);
    const sUV = slopes.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < sUV.count; i++) sUV.setXY(i, sUV.getX(i) * 6, sUV.getY(i) * 5);
    B.add(thatch, slopes); B.add(under, facesG([[a2, d2, c2, b2]]));
    B.add(Mk.flat(COL.thatchLo, 0.95), bar(e.clone().add(V(-0.25, -0.02, 0)), f.clone().add(V(0.25, -0.02, 0)), 0.1));
    for (let i = 0; i < 4; i++) { const x = rA + ((rB - rA) * (i + 0.5)) / 4; B.add(Mk.flat("#6e5428"), new THREE.TorusGeometry(0.105, 0.025, 6, 14).rotateY(Math.PI / 2).translate(x, y1 - 0.02, rz)); }
    const fr = fringeTex(), fm = Mk.own("#ffffff", { map: fr, side: THREE.DoubleSide, rough: 0.95 }); fm.alphaTest = 0.45;
    const fy0 = y0 - th - 0.2, fy1 = y0 - th + 0.02;
    const fq = (p0: [number, number], p1: [number, number], name: string) => { const g = wallQuad(p0, p1, fy0, fy1, { tileU: 1.2 }); Mk.mesh(name, g, fm, { cast: false, noink: true }); };
    fq([rx0, rz1 + 0.01], [rx1, rz1 + 0.01], "beach.fringeF"); fq([rx1 + 0.01, rz1], [rx1 + 0.01, rz0], "beach.fringeR"); fq([rx1, rz0 - 0.01], [rx0, rz0 - 0.01], "beach.fringeB"); fq([rx0 - 0.01, rz0], [rx0 - 0.01, rz1], "beach.fringeL");
    // porch things: the water jar, coconuts, a gourd, the drying net
    const jar = Mk.flat(COL.jar, 0.7), nut = Mk.flat(COL.nut, 0.7);
    const jx = HU.porch.x0 + 0.45, jz = z1 + 0.42;
    P.add(jar, lathe([[0, 0], [0.16, 0], [0.24, 0.2], [0.25, 0.32], [0.2, 0.48], [0.13, 0.55], [0.15, 0.6], [0.12, 0.6], [0.1, 0.56], [0, 0.52]], 20).translate(jx, ph, jz), 0.005);
    for (const [ox, oz, oy] of [[0.45, 0.05, 0], [0.62, -0.08, 0], [0.55, 0.16, 0], [0.54, 0.04, 0.15]]) P.add(nut, new THREE.SphereGeometry(0.1, 14, 10).scale(1, 0.9, 1).translate(jx + ox, ph + 0.09 + oy, jz + oz), 0.004);
    const gx = HU.porch.x1 - 0.45, gy = eave - 0.12;
    P.add(Mk.flat(COL.gourd, 0.6), lathe([[0, 0], [0.09, 0.05], [0.1, 0.11], [0.05, 0.19], [0.06, 0.24], [0.045, 0.3], [0, 0.32]], 16).translate(gx, gy - 0.75, zp + 0.02), 0.004);
    P.add(Mk.flat("#5a4026"), new THREE.CylinderGeometry(0.006, 0.006, 0.45, 5).translate(gx, gy - 0.22, zp + 0.02), 0.002);
    P.into(group, "beach.hutThings");
    const netMat = Mk.own("#ffffff", { map: netTex(), side: THREE.DoubleSide, rough: 0.9 }); netMat.alphaTest = 0.35;
    const net = makeCloth(netMat, 0.82, 1.15, { nx: 8, ny: 8, ph: 1.3, pin: 0.3 });
    net.mesh.name = "beach.net"; net.mesh.position.set((HU.porch.x0 + HU.porch.x0 + (HU.porch.x1 - HU.porch.x0) / 3) / 2, eave - 0.16, zp + 0.12); group.add(net.mesh);
    (group.userData as { net?: typeof net }).net = net;
  }

  // ===================================================================================================== the palms
  const fronds: { pivot: THREE.Object3D; pitch: number; ph: number }[] = [];
  {
    const tm = trunkTex(), trunk = Mk.tex(tm, 0.85), fm = Mk.own("#ffffff", { map: frondTex(), side: THREE.DoubleSide, rough: 0.8 }); fm.alphaTest = 0.5;
    const nutM = Mk.flat(COL.nut, 0.7), nutLo = Mk.flat(COL.nutLo, 0.8), boss = Mk.flat("#7a6040", 0.9);
    const leans: [number, number][] = [[-0.55, 0.25], [0.45, -0.35], [0.6, 0.1], [-0.15, -0.6], [0.3, -0.45]];
    const Pn = new Part(K);
    S.palms.forEach(([x, z, h], k) => {
      const [lx, lz] = leans[k % leans.length], lean = V(lx, 0, lz).normalize().multiplyScalar(h * 0.32);
      const foot = V(x, -0.3, z), topP = V(x, h, z).add(lean);
      const pts = [0, 0.3, 0.6, 0.85, 1].map((u) => foot.clone().lerp(topP, u).add(lean.clone().multiplyScalar(-0.22 * Math.sin(Math.PI * u) - 0.12 * u * (1 - u))));
      B.add(trunk, taperTube(pts, 0.17, 0.115, 0.24));
      // the crown: the frond boss, coconuts under it, ten fronds
      B.add(boss, blobG(650 + k, 1, 0.2).scale(0.24, 0.2, 0.24).translate(topP.x, topP.y + 0.05, topP.z));
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + k, rr = 0.17; Pn.add(i % 2 ? nutM : nutLo, new THREE.SphereGeometry(0.095, 12, 9).translate(topP.x + Math.cos(a) * rr, topP.y - 0.14 - 0.04 * (i % 2), topP.z + Math.sin(a) * rr), 0.004); }
      const n = 10;
      for (let i = 0; i < n; i++) {
        const yaw = (i / n) * Math.PI * 2 + k * 0.7 + (r() - 0.5) * 0.3, up = i % 2 === 0, L = 2.3 + 0.7 * r() + (h - 6) * 0.15;
        const g = frondG(L, 0.34 + 0.06 * r(), up ? 0.55 : 0.25, up ? 1.0 : 0.9);
        const pivot = new THREE.Object3D(); pivot.position.copy(topP).add(V(0, 0.08, 0)); pivot.rotation.order = "YXZ"; pivot.rotation.y = yaw;
        const pitch = up ? -0.25 : 0.12; pivot.rotation.x = pitch;
        const m = new THREE.Mesh(g, fm); m.name = `beach.frond${k}_${i}`; m.layers.set(NOINK); m.castShadow = false; m.receiveShadow = true;
        pivot.add(m); group.add(pivot); fronds.push({ pivot, pitch, ph: k * 1.7 + i * 0.9 });
      }
    });
    Pn.into(group, "beach.coconuts");
    // bushes and beach grass at their feet and round the hut
    const bush = Mk.flat(COL.bush, 0.85), bushLo = Mk.flat(COL.bushLo, 0.85);
    const bushes: [number, number, number][] = [[BX - 6.6, -4.6, 0.8], [BX - 7.4, -3.0, 0.6], [BX - 5.6, -6.2, 0.7], [BX - 1.9, -5.9, 0.5], [BX + 5.3, -1.9, 0.6], [BX + 3.3, -4.4, 0.5], [BX + 6.6, -0.6, 0.7], [BX + 9.0, -5.6, 0.8], [BX - 8.6, 0.6, 0.9], [BX + 8.2, 2.4, 0.8]];
    bushes.forEach(([x, z, s], i) => B.add(i % 2 ? bush : bushLo, blobG(660 + i, 1, 0.28).scale(s * 1.2, s * 0.55, s).translate(x, s * 0.25 + H(x, z), z)));
    const blades: Strand[] = [];
    const tuft = (x: number, z: number, n: number) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, rr = 0.25 * r(), bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr, y = H(bx, bz), hh = 0.22 + 0.25 * r(); blades.push({ root: V(bx, y - 0.02, bz), tip: V(bx + (r() - 0.5) * 0.25, y + hh, bz + (r() - 0.5) * 0.25), w: 0.03, c0: COL.grass, c1: COL.grassTip, ph: r() * 6, amp: 0.05, face: r() * 3 }); } };
    for (const [x, z] of [[BX - 6.0, -3.0], [BX - 5.4, -1.4], [BX - 2.0, -2.0], [BX - 1.4, -6.2], [BX + 4.4, -4.6], [BX + 5.2, -0.6], [BX + 2.6, -6.0], [BX - 3.4, 1.8], [BX + 3.6, 1.4], [BX - 7.8, -1.0], [BX + 7.4, -3.2]] as [number, number][]) tuft(x, z, 14);
    const grass = strandField(Mk, blades, "beach.grass"); group.add(grass.mesh);
    (group.userData as { grass?: typeof grass }).grass = grass;
    // dark rocks at the water's edge, bleached driftwood on the sand
    const rock = Mk.flat(COL.rock, 0.9);
    for (const [x, z, s] of [[BX - 9.2, -8.4, 1.1], [BX - 7.8, -9.0, 0.7], [BX - 10.6, -7.9, 0.8], [BX + 7.4, -9.2, 0.9], [BX + 8.4, -8.6, 0.6]] as [number, number, number][]) B.add(rock, rockG(670 + Math.round(x), 1.4 * s, 0.7 * s, 1.1 * s, 2, 0.1).translate(x, H(x, z) - 0.05, z));
    const dw = Mk.tex(driftTex(), 0.9);
    for (const [ax, az, bx, bz, rr] of [[BX + 2.2, 1.0, BX + 3.6, 0.4, 0.08], [BX - 3.0, 1.6, BX - 1.9, 2.3, 0.06], [BX + 4.6, -6.4, BX + 6.2, -6.8, 0.1]] as [number, number, number, number, number][]) B.add(dw, alongUV(bar(V(ax, rr * 0.8, az), V(bx, rr * 0.8, bz), rr, rr * 0.8, 10)));
  }

  // ===================================================================================================== the fire ring, the logs, the oysters
  let fireK = 1;
  const flames = [makeFlame(0.5, 0), makeFlame(0.32, 1.7), makeFlame(0.28, 3.1)];
  const fireGroup = new THREE.Group(); fireGroup.name = "beach.fire"; group.add(fireGroup);
  const emberMat = new THREE.MeshBasicMaterial({ map: emberTex(), fog: false });
  const glow = glowCard(0.45, "#ffa040", 0.22); glow.name = "beach.fireGlow";
  {
    const P = new Part(K), stone = Mk.flat(COL.stone, 0.85), stoneLo = Mk.flat(COL.stoneLo, 0.85), drift = Mk.tex(driftTex(), 0.9), charM = Mk.flat(COL.char, 0.95);
    // stones round the ring, leaving room on the sides where they stand and where the oyster stone is
    const avoid = [BEACH.su, BEACH.guo, V(S.stone.x, 0, S.stone.z)].map((p) => Math.atan2(p.x - FR.x, p.z - FR.z));
    const angDist = (a: number, b: number) => Math.abs(((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      if (avoid.some((b, j) => angDist(a, b) < (j < 2 ? 0.42 : 0.5))) continue;
      const g = rockFit(680 + i, 0.15 + 0.04 * r(), 0.09 + 0.03 * r(), 0.12 + 0.03 * r(), 1, 0.02).rotateY(r() * 3).translate(FR.x + Math.sin(a) * FR.r, 0, FR.z + Math.cos(a) * FR.r);
      P.add(i % 2 ? stone : stoneLo, g, 0.004);
    }
    // the burning driftwood: four sticks leaning in, charred at the middle; the ember bed
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4, o = V(FR.x + Math.sin(a) * 0.3, 0.03, FR.z + Math.cos(a) * 0.3), c = V(FR.x + Math.sin(a) * 0.04, 0.24, FR.z + Math.cos(a) * 0.04);
      P.add(drift, alongUV(bar(o, o.clone().lerp(c, 0.55), 0.035, 0.032, 8), 0.5), 0.004);
      P.add(charM, bar(o.clone().lerp(c, 0.55), c, 0.032, 0.026, 8), 0.004);
    }
    // THE OYSTER STONE (flat, top `S.stone.top`) with oysters roasting on it
    const os = rockFit(690, S.stone.r * 2.1, S.stone.top, S.stone.r * 1.8, 2, 0.02).translate(S.stone.x, 0, S.stone.z);
    B.add(Mk.flat(COL.stoneLo, 0.9), os);
    const oy = Mk.flat(COL.oyster, 0.9), oyHi = Mk.flat(COL.oysterHi, 0.5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3, ox = S.stone.x + Math.cos(a) * 0.1, oz = S.stone.z + Math.sin(a) * 0.08;
      P.add(oy, new THREE.SphereGeometry(1, 12, 8).scale(0.055, 0.022, 0.042).rotateY(a).translate(ox, S.stone.top + 0.016, oz), 0.003);
      if (i % 2 === 0) P.add(oyHi, new THREE.SphereGeometry(1, 10, 6).scale(0.04, 0.008, 0.03).rotateY(a).translate(ox, S.stone.top + 0.036, oz), 0);
    }
    // the basket of oysters
    const bk = S.basket, wick = Mk.tex(wickerTex(), 0.9);
    const bg = lathe([[0, 0], [0.15, 0], [0.2, 0.1], [0.21, 0.18], [0.19, 0.18], [0.18, 0.1], [0.13, 0.02], [0, 0.02]], 20);
    { const uv = bg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 2); }
    P.add(wick, bg.translate(bk.x, 0, bk.z), 0.005);
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, rr = 0.13 * Math.sqrt(r()); P.add(i % 3 ? oy : Mk.flat("#7a7062", 0.9), new THREE.SphereGeometry(1, 10, 7).scale(0.06, 0.026, 0.045).rotateY(r() * 3).rotateX((r() - 0.5) * 0.6).translate(bk.x + Math.cos(a) * rr, 0.15 + 0.04 * (1 - rr / 0.13), bk.z + Math.sin(a) * rr), 0.003); }
    // the heap of shells
    const hp = S.heap;
    for (let i = 0; i < 30; i++) { const a = r() * 6.28, rr = 0.32 * Math.sqrt(r()), y = 0.11 * (1 - (rr / 0.34) ** 2); P.add(i % 3 === 0 ? oyHi : oy, new THREE.SphereGeometry(1, 10, 6).scale(0.055, 0.018, 0.042).rotateZ((r() - 0.5) * 0.9).rotateY(r() * 6).translate(hp.x + Math.cos(a) * rr, y + 0.012, hp.z + Math.sin(a) * rr), 0.003); }
    P.into(group, "beach.fireThings");
    // the ember bed (unlit), the flames, the glow behind them, the smoke
    const eg = lathe([[0.27, 0], [0.22, 0.025], [0.12, 0.042], [0, 0.048]], 24);
    { const p = eg.attributes.position as THREE.BufferAttribute, uv = eg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 0.54 + 0.5, p.getZ(i) / 0.54 + 0.5); }
    Mk.mesh("beach.embers", eg.translate(FR.x, 0.005, FR.z), emberMat, { cast: false, receive: false, noink: true, into: fireGroup });
    flames[0].group.position.set(FR.x, 0.04, FR.z); flames[1].group.position.set(FR.x + 0.09, 0.03, FR.z + 0.05); flames[2].group.position.set(FR.x - 0.08, 0.03, FR.z - 0.04);
    for (const f of flames) fireGroup.add(f.group);
    glow.position.set(FR.x, 0.25, FR.z); fireGroup.add(glow);
    // THE SEATS: two bleached driftwood logs (their top = BEACH.seatTop)
    const lm = Mk.tex(driftTex(), 0.9), BL = new Batch();
    for (const L of [LG.su, LG.guo]) {
      const ax = V(Math.cos(L.yaw), 0, -Math.sin(L.yaw)), c = V(L.x, L.r, L.z), a = c.clone().addScaledVector(ax, -L.len / 2), b = c.clone().addScaledVector(ax, L.len / 2);
      BL.add(lm, alongUV(bar(a, b, L.r, L.r * 0.94, 16)));
    }
    BL.flush(group, "beach.logs", true, false);                                                          // (they cast, but take no shadow: no acne on the round logs)
  }

  B.flush(group, "beach.static");

  // ===================================================================================================== the light
  const L = lightRig(group, { dir: [0.75, 0.48, 0.45], k: 2.2, col: "#ffe4be", at: [BX - 1, 0, -2.5], half: 11, hemi: ["#d2ecf8", "#d8bf8c", 1.0], point: { col: "#ff9a4a", k: 1.2, at: [FR.x, 0.55, FR.z], dist: 4 } });
  const ud = group.userData as { net?: { sway: (t: number, a: number) => void }; grass?: { update: (t: number, w: number) => void } };
  let clock = 0;
  const pose = (t: number) => {
    for (const f of flames) f.animate(t);
    const lvl = flames[0].level(t);
    L.point.intensity = 1.2 * fireK * lvl;
    emberMat.color.setScalar(0.4 + 0.6 * fireK * (0.92 + 0.08 * lvl));
    for (const f of flames) f.group.scale.set(0.5 + 0.5 * fireK, fireK, 0.5 + 0.5 * fireK);
    for (const f of flames) f.group.visible = fireK > 0.02;
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.22 * fireK * lvl;
    // the surf: each line runs in from 3.6 m out to 0.35 m up the wet sand in 7.5 s, widening, and fades
    surf.forEach((s, k) => {
      const ph = (((t / 7.5 + k / 3) % 1) + 1) % 1, run = 1 - Math.pow(1 - ph, 2.2);
      s.lay(3.6 - 3.95 * run, 0.16 + 0.42 * ph, 0.92 * smooth01(0, 0.12, ph) * (1 - smooth01(0.72, 1, ph)), k * 2.1 + Math.floor(t / 7.5 + k / 3) * 0.9);
    });
    lap.lay(0.05 + 0.12 * Math.sin(t * 0.8), 0.22, 0.75, 0.4);
    ripMap.offset.set(0.02 * Math.sin(t * 0.15), t * 0.015);
    for (const f of fronds) { f.pivot.rotation.x = f.pitch + 0.035 * Math.sin(t * 1.2 + f.ph) + 0.015 * Math.sin(t * 2.3 + f.ph * 1.3); f.pivot.rotation.z = 0.025 * Math.sin(t * 0.9 + f.ph * 0.7); }
    ud.net?.sway(t, 0.025); ud.grass?.update(t, 1);
  };
  pose(0);
  return {
    group,
    view(cam: THREE.Vector3) { faceY(glow, cam); },
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) { if (name === "fire") { fireK = Math.max(0, Math.min(1, Number(v))); pose(clock); } },
  };
}
