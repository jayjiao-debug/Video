// HUANGZHOU (place "huangzhou", island x 300): the painted INK-SCROLL flashback (PLAN 1, 8B 9). WP2b's set; the exports
// are the contract of sets/index.ts: HUANGZHOU_LOOK, HUANGZHOU_PARAMS, buildHuangzhou(K) -> { group, view, animate,
// setParam }. Every place number is layout/huangzhou.ts (HUANGZHOU_SET, HUANGZHOU); its header has the plan.
//
// THE LOOK: a Song ink painting made solid. Paper-cream ground and sky, ink greys from pale wash to near black, a muted
// ochre for earth, a grey-green for moss dots; the grade pulls what is left of the colour down toward warm paper. The
// ONLY saturated colour is the pork in the pot (a deep glossy red).
// "slope" (param vignette "slope", round x HX - 10): 东坡, the bare eastern slope he farmed
//   - THE FIELD (flat, y 0) in front: ploughed furrows in ink lines running along his walk (diagonally toward the
//     lens), a darker strip of fresh-turned earth behind the plough's line; a few ink rocks and grass strokes at its
//     edges;
//   - SIX DRY TERRACES climbing behind (-z), their contour lines curving, each riser an ink-wash bank inked along its
//     edges, the tops pale stubble with moss dots (苔点); the ridge behind, falling away to the right;
//   - 雪堂: a small hut with snow-white walls and a pale thatched roof on the upper left terrace;
//   - two BARE INK TREES (crab-claw branches, painted cards: NOINK, turned to the lens), small ones on the ridge;
//   - beyond: ink-wash mountains fading into mist, the Yangtze far off with a sail, a few birds (a NOINK panorama on
//     a paper sky);
// "pot" (param vignette "pot", round x HX + 10): a farmhouse corner at night
//   - a beaten-earth floor, the back and side walls in a grey ink wash (soot above the hearth), timber posts, a lattice
//     window with the moon behind its paper, a straw raincoat (蓑衣) and a bamboo hat on the left wall, firewood in the
//     right corner, a low stool with a bowl and chopsticks;
//   - the low clay hearth ring with its glowing mouth (small flames, embers), THE CLAY POT in its hole (the set draws
//     the pot: WP3's porkPot prop is not used here), its LID (param lid 0 shut .. 1 lifted and laid on the floor at
//     HUANGZHOU.lidAside), STEAM (param steam 0..1), and inside: glossy RED pork cubes (skin, fat and lean layers) in a
//     dark glossy sauce;
//   - the light: the fire (the place's point light) and a little cool moonlight from the window.
// INK / FLICKER: soil, stubble, furrows, wash, plaster, the window and the brush trees are PAINT; inked geometry is
// chunky (terrace risers, the hut, rocks, walls, posts, the hearth); the pot, the lid, the pork, the hat, the wood, the
// stool and the bowl are props-kit Parts / NOINK meshes with their own hull; the trees, grass, steam, flames, glows,
// the panorama and the sky are NOINK. Seeded painting only; animate and setParam are pure functions of their
// arguments.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, skyDome, Batch, makeFlame, glowCard, facesG, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { HUANGZHOU_SET as S, HUANGZHOU, HX } from "../layout/huangzhou";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, boxG, levelQuad, terrainG, rockG, roundBox, tileUV, latticePaint, faceY, wrapBlotch, smooth01, hullGeo, Part, NOINK } from "./parts/common";
import { strandField, type Strand } from "./parts/strands";
import { panoramaRing } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.62, 0.58, 0.52]], [-8, [0.74, 0.7, 0.63]], [5, [0.86, 0.82, 0.74]], [40, [0.84, 0.8, 0.72]], [90, [0.84, 0.8, 0.72]]],
  boxes: [{ az: -40, el: 50, rot: 0, w: 40, h: 18, soft: 14, col: [1.0, 0.96, 0.88] }],
};
/** THE PAINTING's grade: colour pulled down (the red pork, painted at full strength, still reads), warm paper tints,
 *  a soft vignette like an old scroll's darkened edges */
const GRADE: GradeParams = { ky: [0.04, 0.16, 0.33, 0.6, 0.82, 0.93, 1], sat: [0.7, 0.68, 0.72], tintS: [-0.004, 0.012], tintM: [-0.018, 0.014], tintH: [-0.026, 0.014], vig: [0.24, 0.4] };
/** THE INK SCROLL: soft even paper light, everything muted toward a warm grey */
export const HUANGZHOU_LOOK: PlaceLook = {
  bg: "#ece2cc",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.6, color: "#5a5048" },
  cast: {
    key: [0.35, 0.7, 0.6], tint: [1.0, 0.95, 0.86], tintK: 0.7, gain: 0.95, grad: 0.22, bodyGrad: 0.16, sideTint: [0.94, 0.94, 0.96],
    shade: [1.04, 0.97, 1.12], shadeK: 0.32, wrap: [28, 56], edge: 0.13, broad: 0.12, bodySat: 0.1, sheen: 0.06, lift: 0.04, contactLen: 0.4,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.25,
  grade: GRADE,
};
/** the per-frame dressing: vignette "slope" | "pot", lid 0..1 (0 shut .. 1 lifted off and laid aside), steam 0..1 */
export const HUANGZHOU_PARAMS: Record<string, ParamValue> = { vignette: "slope", lid: 0, steam: 1 };

const COL = {
  paper: "#efe5cf", paperLo: "#e0d4b8", ink: "#34302e", inkMid: "#6a6660", inkLight: "#a49e94", wash: "#c6bca8",
  soil: "#bca47e", soilLo: "#8c7656", soilHi: "#dccaa6", turned: "#8a765c", stubble: "#ddd0b2", stubbleLo: "#c4b494", moss: "#7c8470",
  rock: "#9a948a", rockLo: "#7a756e", thatch: "#c2b498", thatchLo: "#968a74", snow: "#f4efe4",
  wall: "#cfc4ae", wallLo: "#a8a090", soot: "#4a4440", floor: "#b6a88e", floorLo: "#98896e", timber: "#5e5650",
  clay: "#8a6a54", clayLo: "#6a4e3e", pot: "#5a4a40", potHi: "#7a685a", glaze: "#3e3430",
  pork: "#c8221a", porkSkin: "#962414", porkFat: "#ecb898", sauce: "#5a140e", straw: "#b4a27e", strawLo: "#8a7a5c", bamboo: "#b8a476",
};
/** the paper sky: warm cream, a little paler toward the zenith */
const SKY: SkyStops = [[-10, "#e2d6bc"], [0, "#ece2ca"], [10, "#efe6d2"], [40, "#f2ead8"], [90, "#f4eddc"]];
const SL = S.slope, TR = SL.terraces, PS = S.pot;
const DIR = new THREE.Vector2(Math.sin(HUANGZHOU.suFacing), Math.cos(HUANGZHOU.suFacing)), PERP = new THREE.Vector2(DIR.y, -DIR.x);
const STEP = (TR.z0 - TR.z1) / TR.n, RW = 0.32;
/** the terraces' contours curve along x (always >= 0: the first riser never comes in front of the field's edge) */
const WAVE = (x: number) => 0.45 + 0.3 * Math.sin((x - HX) * 0.25) + 0.15 * Math.sin((x - HX) * 0.6 + 1);
/** the ridge falls away to the right (where the river shows far off) */
const SIDE = (x: number) => 1 - 0.7 * smooth01(SL.x - 4, SL.x + 12, x);
/** the slope's height: the flat field (z >= terraces.z0), six terraces of `rise`, the ridge behind */
const HT = (x: number, z: number) => {
  const zp = z + WAVE(x);
  if (zp >= TR.z0) return 0;
  const u = (TR.z0 - zp) / STEP;
  if (u < TR.n) { const k = Math.floor(u), f = u - k; return (k + smooth01(0, RW / STEP, f)) * TR.rise; }
  // the ridge: up to its crest at ridge.z (wavering along x), then falling away behind (its silhouette is the crest, never
  // the heightfield's cut edge)
  const top = TR.n * TR.rise, zr = TR.z1 - zp, crest = TR.z1 - SL.ridge.z, ridgeH = (SL.ridge.y - top) * SIDE(x) * (1 + 0.14 * Math.sin((x - HX) * 0.21) + 0.08 * Math.sin((x - HX) * 0.53 + 2));
  return top + ridgeH * (smooth01(0, crest, zr) - 0.9 * smooth01(crest, crest + 7, zr)) + 0.5 * Math.sin(x * 0.3) * Math.cos(z * 0.2) * smooth01(0, 3, zr);
};
/** the flat top of terrace k (1 .. n) at x: [front z, back z] (world) and its height */
const terraceTop = (k: number, x: number) => { const w = WAVE(x); return { zf: TR.z0 - (k - 1) * STEP - RW - w, zb: TR.z0 - k * STEP - w, y: k * TR.rise }; };

// ---------------------------------------------------------------------------------------------------- the paintings
/** paper fibre and a soft mottle under everything (adds the scroll's grain) */
const grain = (g: G2, W: number, Hh: number, seed: number, a = 0.18) => {
  const r = rng(seed);
  for (let i = 0; i < 28; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 30 + 60 * r(), r() < 0.5 ? "#ffffff" : COL.inkLight, a * 0.6);
  g.strokeStyle = css(COL.inkLight, a); g.lineWidth = 0.8;
  for (let i = 0; i < 300; i++) { const x = W * r(), y = Hh * r(), a2 = r() * 6.28, l = 3 + 8 * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a2) * l, y + Math.sin(a2) * l); g.stroke(); }
};
/** the ploughed field (a 3 m tile; u across the furrows, v along them): ochre soil in a soft wash, fourteen furrows of
 *  uneven width (a soft shaded trough with a broken dry-ink line, a lit ridge), clods and darker turned lumps all over,
 *  soft blotches on top so that the rows do not read as boards; everything repeats in u and v */
const fieldTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(301);
  g.fillStyle = COL.soil; g.fillRect(0, 0, W, Hh);
  grain(g, W, Hh, 302, 0.2);
  for (let i = 0; i < 24; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 40 + 70 * r(), r() < 0.5 ? COL.soilLo : COL.soilHi, 0.2);
  const n = 14, ws = Array.from({ length: n }, () => 0.75 + 0.5 * r()), sum = ws.reduce((a, b) => a + b, 0);
  g.lineCap = "round";
  let x = 0;
  for (let i = 0; i < n; i++) {
    const s = (ws[i] / sum) * W, ph = r() * 6.28, wob = (y: number) => 1.8 * Math.sin((y / Hh) * 4 * Math.PI + ph) + 0.8 * Math.sin((y / Hh) * 10 * Math.PI + ph * 2);
    // the trough's soft shade (at x + 0.15 s) and the ridge's light (x + 0.55 s)
    for (let y = 0; y < Hh; y += 4) {
      const o = wob(y), gr = g.createLinearGradient(x + o, 0, x + o + s, 0);
      gr.addColorStop(0, css(COL.soilLo, 0.1)); gr.addColorStop(0.15, css(COL.soilLo, 0.42)); gr.addColorStop(0.35, css(COL.soilLo, 0.06));
      gr.addColorStop(0.58, css(COL.soilHi, 0.3)); gr.addColorStop(0.85, css(COL.soilHi, 0.04)); gr.addColorStop(1, css(COL.soilLo, 0.1));
      g.fillStyle = gr; g.fillRect(x + o - 2, y, s + 4, 4);
    }
    // the trough's dry-ink line: broken strokes of uneven weight
    const tx = x + 0.15 * s;
    for (let y = -40 * r(); y < Hh; ) {
      const l = 18 + 60 * r();
      if (r() < 0.6) { g.strokeStyle = css(COL.ink, 0.12 + 0.2 * r()); g.lineWidth = 0.8 + 1.8 * r(); g.beginPath(); g.moveTo(tx + wob(y), y); g.quadraticCurveTo(tx + wob(y + l / 2) + (r() - 0.5) * 3, y + l / 2, tx + wob(y + l) + (r() - 0.5) * 2, y + l); g.stroke(); }
      y += l + 4 + 16 * r();
    }
    x += s;
  }
  // clods and darker turned lumps everywhere (more in the troughs' shade), then soft blotches over the rows
  for (let k = 0; k < 520; k++) {
    const cx = W * r(), cy = Hh * r(), rr = 1 + 2.6 * r() ** 2 * 1.6;
    for (const [dx, dy] of [[0, 0], [W, 0], [-W, 0], [0, Hh], [0, -Hh]]) {
      g.fillStyle = css(COL.soilLo, 0.55); g.beginPath(); g.ellipse(cx + dx + 0.8, cy + dy + 0.8, rr, rr * 0.7, k, 0, 7); g.fill();
      g.fillStyle = css(r() < 0.75 ? COL.soilHi : COL.turned, 0.55); g.beginPath(); g.ellipse(cx + dx, cy + dy, rr * 0.75, rr * 0.5, k, 0, 7); g.fill();
    }
  }
  for (let i = 0; i < 26; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 30 + 80 * r(), r() < 0.55 ? COL.turned : COL.soilHi, 0.16);
}, true);
/** the terraces' stubble (a 4 m tile, multiplied by the terrain's wash colours): pale dry grass strokes, moss dots */
const stubbleTex = () => paint(512, 512, (g, W, Hh) => {
  const r = rng(303);
  g.fillStyle = COL.stubble; g.fillRect(0, 0, W, Hh);
  grain(g, W, Hh, 304, 0.22);
  for (let i = 0; i < 26; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 26 + 50 * r(), COL.stubbleLo, 0.35);
  g.lineCap = "round";
  for (let i = 0; i < 700; i++) { const x = W * r(), y = Hh * r(), l = 4 + 6 * r(); g.strokeStyle = css(r() < 0.5 ? COL.stubbleLo : COL.inkLight, 0.5); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - l); g.stroke(); }
  for (let i = 0; i < 60; i++) { const x = W * r(), y = Hh * r(); for (let k = 0; k < 3; k++) { g.fillStyle = css(k ? COL.moss : COL.ink, k ? 0.6 : 0.5); g.beginPath(); g.ellipse(x + (r() - 0.5) * 10, y + (r() - 0.5) * 6, 2.5 + 2 * r(), 1.8 + r(), r() * 3, 0, 7); g.fill(); } }
}, true);
/** the hut's walls (one face: u along, v up, 2.2 x 1.9 m): snow-white plaster, an ink-framed door and window */
const hutTex = (door: boolean) => paint(256, 220, (g, W, Hh) => {
  g.fillStyle = COL.snow; g.fillRect(0, 0, W, Hh); grain(g, W, Hh, 305, 0.12);
  const lw = 5; g.strokeStyle = COL.ink; g.lineWidth = lw; g.strokeRect(lw / 2, lw / 2, W - lw, Hh - lw);
  g.fillStyle = css(COL.wash, 0.5); g.fillRect(0, Hh - 22, W, 22);
  if (door) { g.fillStyle = COL.inkMid; g.fillRect(W * 0.38, Hh * 0.28, W * 0.24, Hh * 0.72); g.strokeStyle = COL.ink; g.lineWidth = 4; g.strokeRect(W * 0.38, Hh * 0.28, W * 0.24, Hh * 0.72); }
  latticePaint(g, W * (door ? 0.72 : 0.36), Hh * 0.3, W * 0.2, Hh * 0.28, { wood: COL.ink, woodLo: COL.inkMid, paper: COL.paperLo, cell: 9, frame: 4 });
});
/** thatch in ink (u along the eave, v up the slope) */
const thatchTex = () => paint(256, 256, (g, W, Hh) => {
  const r = rng(307);
  g.fillStyle = COL.thatch; g.fillRect(0, 0, W, Hh);
  g.lineCap = "round";
  for (let i = 0; i < 500; i++) { const x = W * r(), y = Hh * r(), l = 10 + 16 * r(); g.strokeStyle = css(r() < 0.5 ? COL.thatchLo : COL.paper, 0.5); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y + l); g.stroke(); }
  for (let y = 0; y < Hh; y += 64) { g.fillStyle = css(COL.inkMid, 0.4); g.fillRect(0, y + 60, W, 4); }
}, true);
/** A BARE INK TREE on a transparent card (canvas bottom middle = its foot): a leaning trunk in dry ink, branches
 *  forking upward to crab-claw twigs, ink dots of moss on the trunk */
const inkTreeTex = (seed: number) => paint(512, 640, (g, W, Hh) => {
  const r = rng(seed);
  g.clearRect(0, 0, W, Hh);
  g.lineCap = "round"; g.lineJoin = "round";
  const stroke = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bend: number) => {
    const n = 6, mx = (x0 + x1) / 2 + bend * (y1 - y0) * 0.2, my = (y0 + y1) / 2 + bend * (x0 - x1) * 0.2;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, P = (t: number) => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1];
      const [ax, ay] = P(t0), [bx, by] = P(t1);
      g.strokeStyle = css(COL.ink, 0.82 + 0.1 * r()); g.lineWidth = w0 + (w1 - w0) * t0; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      if (w0 > 6) { g.strokeStyle = css(COL.paper, 0.35); g.lineWidth = Math.max(1, (w0 + (w1 - w0) * t0) * 0.18); g.beginPath(); g.moveTo(ax + 2, ay); g.lineTo(bx + 2, by); g.stroke(); }  // a dry-brush streak
    }
  };
  const branch = (x: number, y: number, a: number, len: number, w: number, d: number) => {
    const x1 = x + Math.sin(a) * len, y1 = y - Math.cos(a) * len;
    stroke(x, y, x1, y1, w, w * 0.62, (r() - 0.5) * 1.2);
    if (d <= 0 || len < 14) {
      for (let k = 0; k < 3; k++) { const b = a + (r() - 0.5) * 2.2, l = 8 + 10 * r(); g.strokeStyle = css(COL.ink, 0.85); g.lineWidth = Math.max(1.2, w * 0.5); g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(x1 + Math.sin(b) * l * 0.6, y1 - Math.cos(b) * l * 0.6, x1 + Math.sin(b + 0.6) * l, y1 - Math.cos(b + 0.6) * l); g.stroke(); }
      return;
    }
    const n = 2 + (r() < 0.4 ? 1 : 0);
    for (let k = 0; k < n; k++) branch(x1, y1, a + (k - (n - 1) / 2) * (0.55 + 0.3 * r()) + (r() - 0.5) * 0.3, len * (0.66 + 0.14 * r()), w * 0.62, d - 1);
  };
  branch(W * 0.5, Hh - 4, (r() - 0.5) * 0.25, Hh * 0.3, 26, 6);
  for (let i = 0; i < 14; i++) { const y = Hh * (0.6 + 0.35 * r()), x = W * 0.5 + (r() - 0.5) * 22; g.fillStyle = css(COL.ink, 0.8); g.beginPath(); g.ellipse(x, y, 3 + 2 * r(), 2, 0, 0, 7); g.fill(); }
});
/** the walls of the farmhouse corner (u along, v up; w x h metres at 128 px / m): grey ink wash, soot, cracks, and on the
 *  back wall the lattice window with the moon behind its paper */
const roomWallTex = (seed: number, w: number, h: number, o: { window?: [number, number, number, number]; soot?: number } = {}) => paint(Math.round(w * 128), Math.round(h * 128), (g, W, Hh) => {
  const r = rng(seed), m = W / w;
  g.fillStyle = COL.wall; g.fillRect(0, 0, W, Hh); grain(g, W, Hh, seed + 1, 0.2);
  const fl = g.createLinearGradient(0, Hh * 0.6, 0, Hh); fl.addColorStop(0, "rgba(0,0,0,0)"); fl.addColorStop(1, css(COL.wallLo, 0.7)); g.fillStyle = fl; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 14; i++) blotch(g, W * r(), Hh * r(), 40 + 80 * r(), COL.wallLo, 0.25);
  if (o.soot !== undefined) { blotch(g, o.soot * m, Hh * 0.55, 140, COL.soot, 0.35); blotch(g, o.soot * m, Hh * 0.7, 90, COL.soot, 0.3); }
  g.strokeStyle = css(COL.inkMid, 0.5); g.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { let x = W * r(), y = Hh * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 30; y += 10 + 14 * r(); g.lineTo(x, y); } g.stroke(); }
  if (o.window) {
    const [x0, x1, y0, y1] = o.window, X0 = x0 * m, X1 = x1 * m, Y0 = Hh - y1 * m, Y1 = Hh - y0 * m;
    g.fillStyle = "#e8e2d2"; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    const mx = X0 + (X1 - X0) * 0.62, my = Y0 + (Y1 - Y0) * 0.38, mr = (X1 - X0) * 0.24;
    blotch(g, mx, my, mr * 2.4, "#ffffff", 0.7); g.fillStyle = "#fbf6e6"; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
    latticePaint(g, X0, Y0, X1 - X0, Y1 - Y0, { wood: COL.timber, woodLo: COL.ink, paper: "rgba(0,0,0,0)", cell: 14, frame: 8 });
    g.fillStyle = css(COL.ink, 0.25); g.fillRect(X0, Y1, X1 - X0, 8);
  }
});
/** the earth floor (a 2 m tile): beaten earth in ink wash, straw bits */
const floorTex = () => paint(256, 256, (g, W, Hh) => {
  const r = rng(311);
  g.fillStyle = COL.floor; g.fillRect(0, 0, W, Hh); grain(g, W, Hh, 312, 0.25);
  for (let i = 0; i < 20; i++) wrapBlotch(g, W, Hh, W * r(), Hh * r(), 20 + 40 * r(), COL.floorLo, 0.3);
  g.lineCap = "round"; for (let i = 0; i < 40; i++) { const x = W * r(), y = Hh * r(), a = r() * 6.28; g.strokeStyle = css(COL.straw, 0.7); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); g.stroke(); }
}, true);
/** the straw raincoat (蓑衣) on a transparent card: layered straw tiers, a collar */
const raincoatTex = () => paint(256, 352, (g, W, Hh) => {
  const r = rng(313);
  g.clearRect(0, 0, W, Hh);
  g.lineCap = "round";
  for (let t = 0; t < 5; t++) {
    const y0 = 40 + t * 58, half = 40 + t * 18;
    for (let i = 0; i < 70; i++) { const x = W / 2 + (r() - 0.5) * 2 * half, l = 50 + 30 * r(); g.strokeStyle = r() < 0.5 ? COL.strawLo : COL.straw; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (x - W / 2) * 0.12, y0 + l); g.stroke(); }
    g.strokeStyle = css(COL.ink, 0.7); g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - half, y0); g.lineTo(W / 2 + half, y0); g.stroke();
  }
  g.fillStyle = COL.strawLo; g.beginPath(); g.ellipse(W / 2, 40, 46, 16, 0, 0, 7); g.fill(); g.strokeStyle = COL.ink; g.lineWidth = 3; g.stroke();
});
/** the pork's sides (canvas top = the skin): skin, fat, lean, fat, lean */
const porkTex = () => paint(128, 128, (g, W, Hh) => {
  const r = rng(311);
  // top down: the glossy skin, fat, lean, fat, lean (v up the cube's side: canvas top = its top)
  const bands: [number, string][] = [[0.13, COL.porkSkin], [0.2, COL.porkFat], [0.25, COL.pork], [0.12, COL.porkFat], [0.3, "#a81a12"]];
  let y = 0; for (const [h, c] of bands) { g.fillStyle = c; g.fillRect(0, y, W, h * Hh + 1); y += h * Hh; }
  // the fat's lower edge soaked in sauce, a few fibres in the lean
  g.fillStyle = "rgba(160,40,24,0.35)"; g.fillRect(0, 0.29 * Hh, W, 0.04 * Hh); g.fillRect(0, 0.66 * Hh, W, 0.04 * Hh);
  g.strokeStyle = "rgba(110,14,10,0.35)"; g.lineWidth = 1;
  for (let i = 0; i < 26; i++) { const x = W * r(), y0 = (r() < 0.5 ? 0.35 : 0.72) * Hh + 0.2 * Hh * r(); g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 6 * (r() - 0.5), y0 + 6 + 8 * r()); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(0, 0, W, 3);
});
/** a pork cube's uv from its positions (roundBox's own uv crowds the texture into its rounded edges): v up its
 *  height on the four sides (so the bands run round it level), u across each side */
const cubeUV = (g: THREE.BufferGeometry, w: number, h: number, d: number) => {
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute, per = p.count / 6;
  for (let i = 0; i < p.count; i++) { const f = Math.floor(i / per), x = p.getX(i) / w + 0.5, y = p.getY(i) / h + 0.5, z = p.getZ(i) / d + 0.5; uv.setXY(i, f < 2 ? z : x, f === 2 || f === 3 ? z : y); }
  return g;
};
/** a wisp of steam (transparent; repeats in v) */
const steamTex = () => paint(128, 256, (g, W, Hh) => {
  const r = rng(315);
  g.clearRect(0, 0, W, Hh);
  g.filter = "blur(6px)";
  for (let i = 0; i < 40; i++) { const y = Hh * r(), x = W / 2 + Math.sin(y * 0.04) * W * 0.18; for (const dy of [-Hh, 0, Hh]) blotch(g, x, y + dy, 18 + 14 * r(), "#fbf8f0", 0.2); }
  g.filter = "none";
}, true);
/** the hearth's skin: clay with ink-wash streaks, and (emissive map) its fire mouth at the front (u 0.5) */
const clayTex = () => paint(256, 64, (g, W, Hh) => {
  const r = rng(317);
  g.fillStyle = COL.clay; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 30; i++) blotch(g, W * r(), Hh * r(), 6 + 12 * r(), r() < 0.5 ? COL.clayLo : "#a08068", 0.35);
  g.fillStyle = "#2a1c16"; g.beginPath(); g.ellipse(W * 0.5, Hh * 0.86, W * 0.045, Hh * 0.24, 0, Math.PI, 0); g.fill();
}, true);
const mouthTex = () => paint(256, 64, (g, W, Hh) => {
  g.fillStyle = "#000000"; g.fillRect(0, 0, W, Hh);
  const gr = g.createRadialGradient(W * 0.5, Hh * 0.86, 1, W * 0.5, Hh * 0.86, Hh * 0.26); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#ff9a40"); gr.addColorStop(1, "#401000");
  g.fillStyle = gr; g.beginPath(); g.ellipse(W * 0.5, Hh * 0.86, W * 0.04, Hh * 0.22, 0, Math.PI, 0); g.fill();
}, true);

export function buildHuangzhou(K: Kit) {
  const group = new THREE.Group(); group.name = "set-huangzhou";
  const Mk = maker(K, group), r = rng(331);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const slope = new THREE.Group(); slope.name = "huangzhou.slope"; group.add(slope);
  const pot = new THREE.Group(); pot.name = "huangzhou.pot"; group.add(pot);
  const cards: THREE.Object3D[] = [];

  // ===================================================================================================== "slope"
  {
    const B = new Batch(), F = SL.field;
    // THE FIELD (y 0): the furrows along his walk (uv turned to DIR)
    const fmap = fieldTex(), tile = 3;
    const fg = levelQuad(F.x0 - 10, F.x1 + 10, F.z0, F.z1, 0, (x, z) => [(x * PERP.x + z * PERP.y) / tile, (x * DIR.x + z * DIR.y) / tile]);
    Mk.mesh("huangzhou.field", fg, Mk.tex(fmap, 0.95), { into: slope, cast: false });
    // the strip of fresh-turned earth behind the plough's line
    {
      const a = HUANGZHOU.furrow[0], len = 7, mid = V(a.x - DIR.x * len / 2, 0.0006, a.z - DIR.y * len / 2), yaw = Math.atan2(DIR.x, DIR.y);
      const tm = paint(64, 256, (g, W, Hh) => { const rr = rng(333); g.clearRect(0, 0, W, Hh); for (let i = 0; i < 50; i++) blotch(g, W / 2 + (rr() - 0.5) * W * 0.4, Hh * rr(), 10 + 10 * rr(), COL.turned, 0.35); g.globalCompositeOperation = "destination-in"; const f = g.createLinearGradient(0, 0, 0, Hh); f.addColorStop(0, "rgba(0,0,0,0)"); f.addColorStop(0.3, "rgba(0,0,0,1)"); f.addColorStop(1, "rgba(0,0,0,1)"); g.fillStyle = f; g.fillRect(0, 0, W, Hh); });
      const q = Mk.own("#ffffff", { map: tm, rough: 0.95 }); q.transparent = true; q.depthWrite = false; q.polygonOffset = true; q.polygonOffsetFactor = -1; q.polygonOffsetUnits = -1;
      Mk.mesh("huangzhou.turned", new THREE.PlaneGeometry(0.62, len).rotateX(-Math.PI / 2).rotateY(yaw).translate(mid.x, mid.y, mid.z), q, { into: slope, cast: false, noink: true });
    }
    // THE TERRACES and the ridge: one heightfield, ink-wash risers darker than the stubble tops
    {
      const map = stubbleTex(), x0 = F.x0 - 12, x1 = F.x1 + 16, z0 = SL.ridge.z - 8, z1 = TR.z0;
      map.repeat.set((x1 - x0) / 4, (z1 - z0) / 4);
      const g = terrainG(x0, x1, z0, z1, Math.round((x1 - x0) * 3), Math.round((z1 - z0) * 4), 0, HT);
      const n = g.attributes.normal as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute, cols = new Float32Array(n.count * 3);
      for (let i = 0; i < n.count; i++) {
        const far = smooth01(TR.z1, SL.ridge.z, p.getZ(i)), steep = (1 - smooth01(0.55, 0.92, n.getY(i))) * (1 - 0.7 * far);
        const c = [1 - 0.42 * steep - 0.1 * far, 1 - 0.42 * steep - 0.09 * far, 1 - 0.38 * steep - 0.05 * far];
        cols.set(c, i * 3);
      }
      g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
      const m = Mk.own("#ffffff", { map, rough: 0.95 }); m.vertexColors = true;
      Mk.mesh("huangzhou.terraces", g, m, { into: slope, cast: true });
    }
    // 雪堂: the hut on terrace 5 (upper left)
    {
      const hx = SL.x - 0.5, T5 = terraceTop(5, hx), w = 2.2, d = 1.25, wallH = 1.75, zc = (T5.zf + T5.zb) / 2, y0 = T5.y;
      const front = Mk.tex(hutTex(true), 0.9), side = Mk.tex(hutTex(false), 0.9), thatch = Mk.tex(thatchTex(), 0.95), ink = Mk.flat(COL.inkMid, 0.9);
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, wallH + 0.45, d).translate(hx, y0 + (wallH - 0.45) / 2, zc), [side, side, side, side, front, side]);
      box.name = "huangzhou.hut"; box.castShadow = box.receiveShadow = true; slope.add(box);
      const ex = 0.35, a = V(hx - w / 2 - ex, y0 + wallH, zc + d / 2 + ex), b = V(hx + w / 2 + ex, y0 + wallH, zc + d / 2 + ex), c = V(hx + w / 2 + ex, y0 + wallH, zc - d / 2 - ex), dd = V(hx - w / 2 - ex, y0 + wallH, zc - d / 2 - ex);
      const e = V(hx - w * 0.28, y0 + wallH + 1.05, zc), f = V(hx + w * 0.28, y0 + wallH + 1.05, zc), lo = (v: THREE.Vector3) => v.clone().setY(v.y - 0.12);
      const roof = facesG([[a, b, f, e], [b, c, f], [c, dd, e, f], [dd, a, e], [lo(a), lo(b), b, a], [lo(b), lo(c), c, b], [lo(c), lo(dd), dd, c], [lo(dd), lo(a), a, dd]]);
      const ru = roof.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < ru.count; i++) ru.setXY(i, ru.getX(i) * 3, ru.getY(i) * 2);
      B.add(thatch, roof); B.add(ink, facesG([[lo(a), lo(dd), lo(c), lo(b)]]));
      B.add(ink, bar(e.clone().add(V(-0.15, 0, 0)), f.clone().add(V(0.15, 0, 0)), 0.06));
      // a bamboo fence along the terrace's edge beside it
      const bam = Mk.flat(COL.bamboo, 0.8);
      for (let i = 0; i < 7; i++) { const x = hx + w / 2 + 0.4 + i * 0.32, tt = terraceTop(5, x); B.add(bam, new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6).translate(x, tt.y + 0.3, tt.zf - 0.12)); }
      { const xa = hx + w / 2 + 0.4, xb = xa + 6 * 0.32, ta = terraceTop(5, xa), tb = terraceTop(5, xb); for (const hh of [0.3, 0.55]) B.add(bam, bar(V(xa, ta.y + hh, ta.zf - 0.12), V(xb, tb.y + hh, tb.zf - 0.12), 0.02)); }
    }
    // ink rocks at the field's edges
    const rock = Mk.flat(COL.rock, 0.9), rockLo = Mk.flat(COL.rockLo, 0.9);
    for (const [x, z, s, k] of [[SL.x - 8.6, -3.7, 0.9, 0], [SL.x + 8.0, 1.6, 0.7, 1], [SL.x + 4.6, -3.8, 0.55, 0], [SL.x - 6.4, 4.8, 0.6, 1]] as [number, number, number, number][]) B.add(k ? rockLo : rock, rockG(340 + Math.round(x * 2), 1.3 * s, 0.75 * s, 1.0 * s, 2, 0.08).translate(x, 0, z));
    B.flush(slope, "huangzhou.slopeStatic");
    // grass strokes in ink along the field's back edge and on the terrace tops
    const blades: Strand[] = [];
    const tuft = (x: number, z: number, nb: number) => { for (let i = 0; i < nb; i++) { const bx = x + (r() - 0.5) * 0.4, bz = z + (r() - 0.5) * 0.3, y = HT(bx, bz), hh = 0.16 + 0.22 * r(); blades.push({ root: V(bx, y - 0.02, bz), tip: V(bx + (r() - 0.5) * 0.25, y + hh, bz + (r() - 0.5) * 0.15), w: 0.02, c0: COL.ink, c1: COL.inkMid, ph: r() * 6, amp: 0.03, face: r() * 3 }); } };
    for (let i = 0; i < 46; i++) { const x = SL.x - 14 + 26 * r(); if (Math.abs(x - HUANGZHOU.su.x) < 1.5) continue; tuft(x, TR.z0 - WAVE(x) - 0.05 + 0.25 * r(), 7); }
    for (let k = 1; k <= TR.n; k++) for (let i = 0; i < 10; i++) { const x = SL.x - 14 + 26 * r(), t = terraceTop(k, x); tuft(x, t.zf - 0.1 - 0.2 * r(), 6); }
    const gf = strandField(Mk, blades, "huangzhou.grass"); slope.add(gf.mesh);
    (group.userData as { grass?: typeof gf }).grass = gf;
    // THE BARE INK TREES (painted cards, NOINK, turned to the lens)
    const tree = (seed: number, x: number, z: number, h: number, w: number, y?: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2 - 0.05, 0), new THREE.MeshBasicMaterial({ map: inkTreeTex(seed), transparent: true, alphaTest: 0.04, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      m.position.set(x, y ?? HT(x, z), z); m.name = "huangzhou.tree"; m.layers.set(NOINK); m.renderOrder = 6; slope.add(m); cards.push(m);
    };
    tree(351, SL.x - 2.2, -3.95, 5.4, 4.6, 0);
    { const x = SL.x + 3.4, t = terraceTop(1, x); tree(352, x, (t.zf + t.zb) / 2, 4.3, 3.8, t.y); }
    { const x = SL.x - 5.6, t = terraceTop(6, x); tree(353, x, (t.zf + t.zb) / 2, 3.2, 2.8, t.y); }
    tree(354, SL.x - 12, -22, 3.6, 3.2); tree(355, SL.x + 6, -24, 3.0, 2.6); tree(356, SL.x - 1, -26, 2.6, 2.2);
    // THE FAR VIEW: ink-wash mountains in mist, the river far off with a sail, birds (a NOINK panorama on paper)
    const ring = panoramaRing(SL.x, -2, 200, -4, 110, 4096, 1024, 1.5, (g: G2, k) => {
      const rr = rng(361), row = k.row;
      g.clearRect(0, 0, k.W, k.H);
      const mountain = (a0: number, a1: number, peak: number, col: string, ph: number, cun: number) => {
        // a wash silhouette: dark along its crest, fading into the mist (paper) toward its foot
        const pts: [number, number][] = [];
        for (let a = a0; a <= a1; a += 0.25) { const u = (a - a0) / (a1 - a0) * 2 - 1, env = Math.pow(Math.cos((u * Math.PI) / 2), 0.75), e = peak * env * (0.88 + 0.07 * Math.sin(a * 0.9 + ph) + 0.05 * Math.sin(a * 2.3 + ph * 2.1)); pts.push([k.col(a), row(e)]); }
        const top = Math.min(...pts.map((p) => p[1])), foot = row(peak * 0.3);
        const gr = g.createLinearGradient(0, top, 0, foot); gr.addColorStop(0, css(col, 0.92)); gr.addColorStop(0.55, css(col, 0.45)); gr.addColorStop(1, css(col, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(pts[0][0], foot); for (const p of pts) g.lineTo(p[0], p[1]); g.lineTo(pts[pts.length - 1][0], foot); g.closePath(); g.fill();
        // 披麻皴: long hemp-fibre strokes down from the crest; moss dots on it
        g.lineCap = "round";
        for (let i = 0; i < cun; i++) { const q = Math.floor(rr() * pts.length), p = pts[q], side = q < pts.length / 2 ? -1 : 1, l = (foot - p[1]) * (0.06 + 0.14 * rr()); g.strokeStyle = css(COL.ink, 0.18 + 0.1 * rr()); g.lineWidth = 1.2 + rr(); g.beginPath(); g.moveTo(p[0], p[1] + 2); g.quadraticCurveTo(p[0] + side * l * 0.15, p[1] + l * 0.5, p[0] + side * l * 0.4, p[1] + l); g.stroke(); }
        for (let i = 0; i < cun / 3; i++) { const p = pts[Math.floor(rr() * pts.length)]; g.fillStyle = css(COL.ink, 0.6); g.beginPath(); g.ellipse(p[0] + (rr() - 0.5) * 6, p[1] + 2 + rr() * 4, 2.5, 1.6, 0, 0, 7); g.fill(); }
      };
      // far, pale peaks; then nearer, darker ones; tallest in the middle of the slope's view (az 0 .. 40)
      const peak = (a: number, w: number, h: number, col: string, ph: number, cun: number) => mountain(a - w / 2, a + w / 2, h, col, ph, cun);
      for (const [a, w, h] of [[-48, 44, 14], [-20, 38, 17], [6, 32, 21], [24, 30, 19], [44, 40, 16], [70, 46, 13], [-86, 60, 12], [110, 70, 11], [170, 80, 10], [230, 80, 11], [290, 70, 10]] as [number, number, number][]) peak(a, w, h, "#b4aea4", a * 0.1, Math.round(w * 3));
      for (const [a, w, h] of [[-32, 28, 13], [-8, 24, 15], [14, 22, 14], [32, 30, 12], [56, 28, 10]] as [number, number, number][]) peak(a, w, h, "#8c867e", a * 0.13 + 1, Math.round(w * 4));
      // THE RIVER far off at the right: a pale band winding between the nearer hills, a sail on it
      g.fillStyle = "rgba(244,238,224,0.95)"; g.beginPath(); g.moveTo(k.col(24), row(8.4)); for (let a = 24; a <= 80; a += 1) g.lineTo(k.col(a), row(8.4 - 1.6 * Math.sin((a - 24) * 0.05) + 0.3 * Math.sin(a * 0.4))); for (let a = 80; a >= 24; a -= 1) g.lineTo(k.col(a), row(7.2 - 1.6 * Math.sin((a - 24) * 0.05) + 0.3 * Math.sin(a * 0.4 + 1))); g.closePath(); g.fill();
      g.strokeStyle = css(COL.inkMid, 0.5); g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const a = 30 + 44 * rr(), y = row(7.8 - 1.6 * Math.sin((a - 24) * 0.05)); g.beginPath(); g.moveTo(k.col(a), y); g.lineTo(k.col(a + 2 + 3 * rr()), y); g.stroke(); }
      { const x = k.col(47), y = row(7.9 - 1.6 * Math.sin(23 * 0.05)); g.fillStyle = COL.inkMid; g.fillRect(x - 6, y - 2, 12, 2); g.beginPath(); g.moveTo(x - 1, y - 2); g.lineTo(x - 1, y - 16); g.lineTo(x + 6, y - 13); g.lineTo(x + 5, y - 2); g.closePath(); g.fill(); }
      // mist bands between the layers (paper)
      for (const [e, h] of [[4, 3], [9, 2.5], [13, 2]] as [number, number][]) { const gr = g.createLinearGradient(0, row(e + h), 0, row(e - h)); gr.addColorStop(0, "rgba(239,229,207,0)"); gr.addColorStop(0.5, "rgba(239,229,207,0.7)"); gr.addColorStop(1, "rgba(239,229,207,0)"); g.fillStyle = gr; g.fillRect(0, row(e + h), k.W, row(e - h) - row(e + h)); }
      // birds
      g.strokeStyle = css(COL.ink, 0.75); g.lineWidth = 1.6;
      for (let i = 0; i < 7; i++) { const x = k.col(-10 + 50 * rr()), y = row(22 + 8 * rr()), s = 4 + 3 * rr(); g.beginPath(); g.moveTo(x - s, y - s * 0.4); g.quadraticCurveTo(x - s * 0.4, y - s * 0.5, x, y); g.quadraticCurveTo(x + s * 0.4, y - s * 0.5, x + s, y - s * 0.4); g.stroke(); }
    });
    ring.name = "huangzhou.far"; (ring.material as THREE.MeshBasicMaterial).transparent = true; slope.add(ring);
    slope.add(skyDome(V(SL.x, 0, -2), SKY, (g, W, Hh) => { grain(g, W, Hh, 371, 0.12); }));
  }

  // ===================================================================================================== "pot"
  const P0 = HUANGZHOU.pot, LIDK = { top: PS.hearth.h + PS.pot.h - 0.08 };
  const flames = [makeFlame(0.13, 0.4), makeFlame(0.09, 2.2)];
  const fireGlow = glowCard(0.32, "#ffa050", 0.3);
  const steamMap = steamTex(), steamMat = new THREE.MeshBasicMaterial({ map: steamMap, transparent: true, opacity: 0.5, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const steams: THREE.Mesh[] = [];
  const lid = new THREE.Group(); lid.name = "huangzhou.lid";
  let hearthMat: THREE.MeshPhysicalMaterial | null = null;
  {
    const B = new Batch(), xL = PS.left, xR = PS.right, zB = PS.back, zF = 2.6, hW = PS.wallH, T = 0.12;
    // the floor and the walls (the back wall with the window and the soot over the hearth)
    const fm = floorTex(); fm.repeat.set((xR - xL) / 2, (zF - zB) / 2);
    Mk.mesh("huangzhou.floor", levelQuad(xL, xR, zB, zF, 0, (x, z) => [(x - xL) / (xR - xL), (zF - z) / (zF - zB)]), Mk.tex(fm, 0.95), { into: pot, cast: false });
    const back = Mk.tex(roomWallTex(381, xR - xL, hW, { window: [0.45, 1.2, 1.05, 1.75], soot: P0.x - xL }), 0.95);
    const sideL = Mk.tex(roomWallTex(383, zF - zB, hW), 0.95), sideR = Mk.tex(roomWallTex(385, zF - zB, hW), 0.95), plain = Mk.flat(COL.wallLo, 0.95);
    const wall = (name: string, g: THREE.BufferGeometry, face: THREE.Material, fi: number) => { const mats = [plain, plain, plain, plain, plain, plain]; mats[fi] = face; const m = new THREE.Mesh(g, mats); m.name = name; m.castShadow = m.receiveShadow = true; pot.add(m); };
    wall("huangzhou.backWall", new THREE.BoxGeometry(xR - xL + 2 * T, hW, T).translate((xL + xR) / 2, hW / 2, zB - T / 2), back, 4);
    wall("huangzhou.leftWall", new THREE.BoxGeometry(T, hW, zF - zB).translate(xL - T / 2, hW / 2, (zB + zF) / 2), sideL, 0);
    wall("huangzhou.rightWall", new THREE.BoxGeometry(T, hW, zF - zB).translate(xR + T / 2, hW / 2, (zB + zF) / 2), sideR, 1);
    const timber = Mk.flat(COL.timber, 0.9);
    for (const x of [xL + 0.07, xR - 0.07]) B.add(timber, boxG(x - 0.08, x + 0.08, 0, hW, zB, zB + 0.14));
    B.add(timber, boxG(xL, xR, hW - 0.16, hW, zB, zB + 0.16));
    // THE HEARTH: a squat clay ring with a hole the pot sits in, its fire mouth glowing at the front
    {
      const prof: [number, number][] = [[0.22, 0], [0.42, 0], [0.44, 0.1], [0.41, 0.17], [0.36, 0.185], [0.21, PS.hearth.h], [0.2, 0.12], [0.22, 0]];
      const g = lathe(prof, 32).rotateY(Math.PI).translate(P0.x, 0, P0.z);
      const m = Mk.own("#ffffff", { map: clayTex(), rough: 0.9 }); m.emissiveMap = mouthTex(); m.emissive = new THREE.Color("#ff8a3a"); m.emissiveIntensity = 1.2; hearthMat = m;
      Mk.mesh("huangzhou.hearth", g, m, { into: pot });
      // firewood poking out of the mouth, glowing at the tips
      const Pw = new Part(K), wood = Mk.flat("#6e5a48", 0.9), ember = new THREE.MeshBasicMaterial({ color: "#ff8a40", fog: false });
      for (const [dx, a] of [[-0.05, -0.25], [0.04, 0.1], [0.09, 0.32]] as [number, number][]) { const s = V(P0.x + dx, 0.04, P0.z + 0.3), e = V(P0.x + dx + Math.sin(a) * 0.42, 0.06, P0.z + 0.3 + Math.cos(a) * 0.42); Pw.add(wood, bar(s, e, 0.028, 0.03, 8), 0.004); Pw.add(ember, new THREE.SphereGeometry(0.03, 8, 6).translate(s.x, s.y, s.z), 0); }
      Pw.into(pot, "huangzhou.hearthWood");
      flames[0].group.position.set(P0.x, 0.03, P0.z + 0.36); flames[1].group.position.set(P0.x + 0.05, 0.03, P0.z + 0.38);
      for (const f of flames) pot.add(f.group);
      fireGlow.position.set(P0.x, 0.12, P0.z + 0.42); pot.add(fireGlow); cards.push(fireGlow);
    }
    // THE POT: glazed dark clay, open (its inside visible when the lid is off), sitting in the hearth's hole
    {
      const Pp = new Part(K), body = Mk.own(COL.pot, { rough: 0.55 }), rim = Mk.own(COL.glaze, { rough: 0.35 });
      const prof: [number, number][] = [[0, 0.08], [0.12, 0.08], [0.2, 0.17], [0.25, 0.27], [PS.pot.r, 0.33], [0.25, 0.41], [0.21, 0.48], [0.18, 0.515], [0.195, 0.535], [0.19, 0.548], [0.168, 0.54], [0.172, 0.5], [0.205, 0.44], [0.22, 0.36], [0.2, 0.28], [0.12, 0.2], [0, 0.19]];
      Pp.add(body, lathe(prof, 32).translate(P0.x, 0, P0.z), 0.005);
      Pp.add(rim, new THREE.TorusGeometry(0.188, 0.012, 8, 32).rotateX(Math.PI / 2).translate(P0.x, 0.545, P0.z), 0.003);
      for (const s of [-1, 1]) Pp.add(rim, new THREE.TorusGeometry(0.035, 0.011, 6, 12).translate(P0.x + s * 0.255, 0.43, P0.z), 0.003);       // two little lugs
      Pp.into(pot, "huangzhou.potBody");
      // the sauce and THE PORK: glossy red cubes (skin, fat, lean), layered in the sauce
      const sauce = Mk.own(COL.sauce, { rough: 0.2 }); sauce.clearcoat = 1; sauce.clearcoatRoughness = 0.1;
      const sm = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32).rotateX(-Math.PI / 2).translate(P0.x, 0.445, P0.z), sauce); sm.name = "huangzhou.sauce"; sm.layers.set(NOINK); pot.add(sm);
      const side = Mk.own("#ffffff", { map: porkTex(), rough: 0.3 }), top = Mk.own(COL.porkSkin, { rough: 0.25 });
      for (const q of [side, top]) { q.clearcoat = 0.8; q.clearcoatRoughness = 0.22; }
      const mats = [side, side, top, side, side, side];
      const cubes: [number, number, number, number][] = [[0, 0, 0.455, 0.2], [0.09, 0.03, 0.452, -0.3], [-0.085, 0.045, 0.454, 0.5], [0.02, -0.095, 0.45, 0.1], [-0.06, -0.075, 0.452, -0.4], [0.075, -0.07, 0.451, 0.7], [0.03, 0.06, 0.49, -0.2], [-0.04, -0.02, 0.492, 0.35], [0.05, -0.03, 0.488, 0.9]];
      for (const [dx, dz, y, yaw] of cubes) {
        const s = 0.066 + 0.008 * r(), g = cubeUV(roundBox(s, s * 0.9, s, 0.012, 2), s, s * 0.9, s).rotateY(yaw).rotateX((r() - 0.5) * 0.25).translate(P0.x + dx, y, P0.z + dz);
        const m = new THREE.Mesh(g, mats); m.name = "huangzhou.pork"; m.layers.set(NOINK); m.castShadow = false; pot.add(m);
        const nh = g.toNonIndexed(); nh.computeVertexNormals();
        const h = new THREE.Mesh(hullGeo(nh, 0.0025), K.ink); h.name = "huangzhou.pork.ink"; h.layers.set(NOINK); pot.add(h);
      }
      // THE LID (its own group: origin = the middle of its rim, on the pot's rim when shut)
      const Pl = new Part(K), lm = Mk.own(COL.potHi, { rough: 0.5 });
      Pl.add(lm, lathe([[0.205, 0], [0.2, 0.025], [0.15, 0.06], [0.06, 0.075], [0.035, 0.078], [0.03, 0.09], [0.04, 0.1], [0, 0.102]], 32), 0.005);
      Pl.add(Mk.own(COL.pot, { rough: 0.6 }), new THREE.CylinderGeometry(0.17, 0.17, 0.012, 32).translate(0, -0.004, 0), 0);
      Pl.into(lid, "huangzhou.lidPart");
      pot.add(lid);
      // steam: three soft wisps rising over the pot
      for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.9).translate(0, 0.45, 0), steamMat); m.name = "huangzhou.steam"; m.layers.set(NOINK); m.renderOrder = 7; m.position.set(P0.x + (i - 1) * 0.07, LIDK.top, P0.z + (i - 1) * 0.03); pot.add(m); steams.push(m); cards.push(m); }
    }
    // the straw raincoat and the bamboo hat on the left wall, firewood in the right corner, a stool with a bowl
    {
      const coatLit = Mk.own("#ffffff", { map: raincoatTex(), rough: 0.95 }); coatLit.alphaTest = 0.3;
      const coat = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.08), coatLit);
      coat.rotation.y = Math.PI / 2; coat.position.set(PS.left + 0.02, 1.25, -1.15); coat.name = "huangzhou.raincoat"; coat.layers.set(NOINK); pot.add(coat);
      const Ph = new Part(K), straw = Mk.flat(COL.straw, 0.85), strawLo = Mk.flat(COL.strawLo, 0.85), wood = Mk.flat("#7a6650", 0.9), bowl = Mk.flat("#d8d0c0", 0.5), ink = Mk.flat(COL.ink, 0.6);
      Ph.add(straw, new THREE.ConeGeometry(0.3, 0.16, 24, 1, true).rotateZ(-Math.PI / 2).translate(PS.left + 0.1, 1.95, -0.25), 0.004);
      Ph.add(strawLo, new THREE.CylinderGeometry(0.008, 0.008, 0.1, 5).rotateZ(Math.PI / 2).translate(PS.left + 0.04, 1.95, -0.25), 0.002);
      // firewood: three rows of split logs along x in the right back corner
      for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) Ph.add(i % 2 ? wood : Mk.flat("#8a7660", 0.9), new THREE.CylinderGeometry(0.055, 0.055, 0.62, 8).rotateZ(Math.PI / 2).translate(PS.right - 0.42, 0.055 + row * 0.1, PS.back + 0.2 + i * 0.115 + row * 0.055), 0.004);
      // the stool, its bowl and chopsticks
      const sx = P0.x + 0.95, sz = P0.z + 0.85;
      Ph.add(wood, boxG(sx - 0.16, sx + 0.16, 0.22, 0.26, sz - 0.12, sz + 0.12), 0.004);
      for (const [ox, oz] of [[-0.12, -0.08], [0.12, -0.08], [-0.12, 0.08], [0.12, 0.08]]) Ph.add(wood, boxG(sx + ox - 0.02, sx + ox + 0.02, 0, 0.22, sz + oz - 0.02, sz + oz + 0.02), 0.003);
      Ph.add(bowl, lathe([[0, 0.26], [0.035, 0.26], [0.07, 0.3], [0.075, 0.32], [0.068, 0.32], [0.062, 0.3], [0.03, 0.272], [0, 0.272]], 20).translate(sx - 0.04, 0, sz), 0.003);
      for (const dz of [-0.01, 0.012]) Ph.add(ink, bar(V(sx + 0.03, 0.272, sz + dz), V(sx + 0.15, 0.27, sz + dz + 0.02), 0.004, 0.003, 5), 0);
      Ph.into(pot, "huangzhou.potThings");
    }
    B.flush(pot, "huangzhou.potStatic");
  }

  // ===================================================================================================== the light
  const L = lightRig(group, { dir: [0.4, 0.75, 0.55], k: 1.6, col: "#fff4e0", at: [SL.x, 0, -3], half: 16, hemi: ["#f4ecd8", "#b8a888", 1.3], point: { col: "#ffa050", k: 0, at: [P0.x, 0.13, P0.z + 0.62], dist: 3.2 } });
  const keyAt = (dir: [number, number, number], at: [number, number, number], half: number) => {
    const d = new THREE.Vector3(...dir).normalize(), a = new THREE.Vector3(...at);
    L.key.position.copy(a).addScaledVector(d, 30); L.key.target.position.copy(a); L.key.target.updateMatrixWorld();
    const c = L.key.shadow.camera; if (c.right !== half) { c.left = -half; c.right = half; c.bottom = -half; c.top = half; c.updateProjectionMatrix(); }
  };
  const ud = group.userData as { grass?: { update: (t: number, w: number) => void } };
  let vig = "slope", lidK = 0, steamK = 1, clock = 0;
  const layLid = () => {
    // shut: on the rim; 0 .. 0.35: straight up 0.2 m; 0.3 .. 1: an arc over to the floor at lidAside, tipping as it goes
    const up = smooth01(0, 0.35, lidK), over = smooth01(0.3, 1, lidK), shut = V(P0.x, 0.545, P0.z), lifted = shut.clone().add(V(0, 0.2, 0)), aside = V(HUANGZHOU.lidAside.x, 0.004, HUANGZHOU.lidAside.z);
    const p = shut.clone().lerp(lifted, up).lerp(aside, over); p.y += 0.25 * Math.sin(Math.PI * over) * up;
    lid.position.copy(p); lid.rotation.set(0, 0.6 * over, -0.5 * Math.sin(Math.PI * over));
  };
  const pose = (t: number) => {
    for (const f of flames) f.animate(t);
    const lvl = flames[0].level(t);
    if (vig === "pot") L.point.intensity = 0.75 * lvl;
    if (hearthMat) hearthMat.emissiveIntensity = 1.1 * lvl;
    (fireGlow.material as THREE.MeshBasicMaterial).opacity = 0.3 * lvl;
    steamMap.offset.set(0, -t * 0.18);
    // the steam: a thin thread from under the shut lid, a fuller column when it is off (times the param)
    const open = smooth01(0, 0.4, lidK);
    steams.forEach((m, i) => { m.position.y = LIDK.top + 0.02 - 0.06 * open; m.scale.set(0.6 + 0.6 * open, 0.7 + 0.5 * open, 1); m.rotation.z = 0.08 * Math.sin(t * 0.7 + i * 2); });
    steamMat.opacity = 0.55 * steamK;
    ud.grass?.update(t, 1);
  };
  const setVig = (v: string) => {
    vig = v === "pot" ? "pot" : "slope";
    slope.visible = vig === "slope"; pot.visible = vig === "pot";
    if (vig === "slope") { keyAt([0.4, 0.75, 0.55], [SL.x, 0, -3], 16); L.key.intensity = 1.6; L.key.color.set("#fff4e0"); L.hemi.intensity = 1.3; L.hemi.color.set("#f4ecd8"); L.hemi.groundColor.set("#b8a888"); L.point.intensity = 0; }
    else { keyAt([-0.35, 0.6, -0.72], [P0.x, 0, P0.z], 3); L.key.intensity = 0.55; L.key.color.set("#c8d0e4"); L.hemi.intensity = 0.95; L.hemi.color.set("#a49c8e"); L.hemi.groundColor.set("#5a5046"); }
  };
  setVig("slope"); layLid(); pose(0);
  return {
    group,
    view(cam: THREE.Vector3) { for (const c of cards) faceY(c, cam); },
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "vignette") { setVig(String(v)); pose(clock); }
      else if (name === "lid") { lidK = Math.max(0, Math.min(1, Number(v))); layLid(); pose(clock); }
      else if (name === "steam") { steamK = Math.max(0, Math.min(1, Number(v))); steamMat.opacity = 0.55 * steamK; }
    },
  };
}
