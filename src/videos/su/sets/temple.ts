// THE TEMPLE (place "temple", island x 700): 金山寺, a side hall, four years later (PLAN 1, 8I). WP2b's set; the exports
// are the contract of sets/index.ts: TEMPLE_LOOK, TEMPLE_PARAMS, buildTemple(K) -> { group, view, animate, setParam }.
// Every place number is layout/temple.ts (TEMPLE_SET, TEMPLE); its header has the plan.
//
// WHAT THERE IS
//   - the hall: a warm plank floor (soft window light painted in pools on it), cream plaster walls over a dark wooden
//     dado between timber posts, a dark ceiling with painted beams; four DARK RED PILLARS on stone drum bases carrying
//     lintels and beams painted with blue-green cloud bands (彩画);
//   - the LEFT (west) wall: two lattice windows of warm glowing paper, soft shafts of light slanting in;
//   - THE PORTRAIT on the back wall: a big hanging scroll (silk core in a pale blue-green mounting with two 惊燕
//     ribbons and a brocade border; a dark top stick, a bottom roller with knobs), painted in the film's toon style: the
//     younger, plump 苏东坡 in the tall square 东坡巾, a full black beard, smiling eyes, an ochre robe with a dark crossed
//     collar, his hands joined in his sleeves; a column of (unreadable) inscription and red seals;
//   - a long low altar table under it (two candles with little flames, a plate of red lychees), the bronze incense
//     burner (鼎) on its stand at the left with a slow thread of smoke, a red 木鱼 on its cushion at the right, two
//     straw prayer cushions on the floor, two cream banners (幡) hanging from the beams.
// INK / FLICKER: plaster, timber, planks, lattices, the painting and the 彩画 are PAINT; inked geometry is chunky (pillars
// 40 cm, beams 30 cm, the altar's legs 8 cm); the small things on the altar, the burner, the 木鱼 and the cushions are
// props-kit Parts (NOINK + their own hull); the banners, the smoke, the shafts and the flames are NOINK. The front wall
// is hidden while the lens is inside. Seeded painting only; animate is a pure function of t.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, type G2 } from "../../../kit/sets/okit";
import { TEMPLE_SET as S, TEMPLE, TX } from "../layout/temple";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, quad4, lathe, bar, shade, latticePaint, makeCloth, glowSprite, faceY, Part, NOINK } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.42, 0.33, 0.25]], [-10, [0.52, 0.43, 0.34]], [5, [0.64, 0.57, 0.49]], [40, [0.6, 0.55, 0.5]], [90, [0.5, 0.45, 0.4]]],
  boxes: [{ az: -90, el: 25, rot: 0, w: 34, h: 18, soft: 14, col: [1.0, 0.92, 0.78] }],
};
/** TEMPLE HALL: soft warm window light from the left, a warm wooden fill; calm, readable faces */
export const TEMPLE_LOOK: PlaceLook = {
  bg: "#3a2c28",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#2e2220" },
  cast: {
    key: [-0.6, 0.5, 0.62], tint: [1.0, 0.93, 0.84], tintK: 0.72, gain: 0.95, grad: 0.22, bodyGrad: 0.16, sideTint: [0.94, 0.94, 1.0],
    shade: [1.08, 0.96, 1.18], shadeK: 0.36, wrap: [28, 56], edge: 0.13, broad: 0.16, bodySat: 0.13, sheen: 0.12, lift: 0.03, contactLen: 0.35,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** no dressing */
export const TEMPLE_PARAMS: Record<string, ParamValue> = {};

const COL = {
  floor: "#a8794c", floorLo: "#8a5f3a", plaster: "#e8dcc0", plasterLo: "#d2c2a0", dado: "#6e4632", dadoLo: "#58362a", timber: "#7a4a32", timberLo: "#5c3626",
  pillar: "#8a2e26", pillarHi: "#a63c30", pillarLo: "#6a2420", base: "#a49c8e", baseLo: "#867e72", beam: "#6a3426", ceiling: "#5a3a2e",
  cyan: "#3e7a78", green: "#5a8a5a", blue: "#3a5a86", gold: "#d8b050", paper: "#fff2d2", paperHi: "#fffaea", lattice: "#6a4430",
  lacquer: "#5a2620", lacquerHi: "#74342a", bronze: "#7a6a40", bronzeLo: "#5a4c2e", bronzeHi: "#a08a50", candle: "#efe6d0", flame: "#ffcf70",
  lychee: "#d43a34", plate: "#e6ddc8", muyu: "#a8442e", muyuLo: "#7e3020", straw: "#b89a64", strawLo: "#8a6e44", banner: "#efe2c2", bannerBand: "#c8a24a",
  smoke: "#e8e2da",
};
const F = S.floor, HH = S.wallH, PT = S.portrait, PC = PT.core;

// ---------------------------------------------------------------------------------------------------- the paintings
/** the plank floor (one 2 m tile, boards along z) */
const floorTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(701), n = 8, bw = W / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = shade(COL.floor, (r() - 0.5) * 0.12); g.fillRect(i * bw, 0, bw + 1, H);
    g.strokeStyle = "rgba(110,70,40,0.28)"; g.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const x = i * bw + bw * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.1 * (r() - 0.5), H * 0.33, x + bw * 0.1 * (r() - 0.5), H * 0.66, x, H); g.stroke(); }
    g.fillStyle = "rgba(60,36,24,0.75)"; g.fillRect(i * bw - 1.5, 0, 3, H);
    const e = H * r(); g.fillRect(i * bw, e - 1.5, bw, 3);
  }
}, true);
/** the window light lying on the floor: soft warm pools (a big painting over the hall's floor, multiplied in) */
const lightPoolTex = () => paint(512, 512, (g, W, H) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  const px = (x: number) => ((x - F.x0) / (F.x1 - F.x0)) * W, pz = (z: number) => ((z - F.z0) / (F.z1 - F.z0)) * H;
  // the darker back and corners (the light falls off away from the windows)
  const vg = g.createLinearGradient(0, 0, W, 0); vg.addColorStop(0, "rgba(255,255,255,0)"); vg.addColorStop(1, "rgba(150,120,95,0.35)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the pools: a slanted parallelogram of light from each window (the sun from the west, a little from the front)
  for (const z of S.windows.z) {
    g.save(); g.filter = "blur(14px)";
    g.fillStyle = "rgba(255,236,190,0.0)";
    const x0 = px(F.x0 + 0.3), x1 = px(F.x0 + 2.9), w = (S.windows.w / (F.z1 - F.z0)) * H;
    g.fillStyle = "rgba(255,226,170,1)";
    g.beginPath(); g.moveTo(x0, pz(z) - w / 2); g.lineTo(x1, pz(z) - w / 2 + 30); g.lineTo(x1, pz(z) + w / 2 + 30); g.lineTo(x0, pz(z) + w / 2); g.closePath(); g.fill();
    g.restore();
  }
});
/** a wall (w x h metres): the dark dado with panels, cream plaster above, timber posts every `bay` m, the top beam;
 *  `hang` = paint the scroll's hanging cord and nail at x (m from the wall's left end) */
const wallTex = (seed: number, w: number, h: number, bay: number, hang?: number) => paint(1024, Math.round((1024 * h) / w), (g, W, H) => {
  const r = rng(seed), m = W / w, Yp = (y: number) => H - y * m;
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 50; i++) blotch(g, W * r(), H * r(), 20 + 50 * r(), r() < 0.5 ? "#f6ecd6" : COL.plasterLo, 0.18);
  // the dado: dark boards with framed panels
  g.fillStyle = COL.dado; g.fillRect(0, Yp(0.9), W, 0.9 * m);
  g.fillStyle = COL.dadoLo; g.fillRect(0, Yp(0.9), W, 6); g.fillRect(0, Yp(0.08), W, 0.08 * m);
  for (let x = 0.2; x < w - 0.2; x += 0.62) { g.strokeStyle = "rgba(40,22,16,0.6)"; g.lineWidth = 4; g.strokeRect(x * m, Yp(0.78), 0.5 * m, 0.6 * m); g.strokeStyle = "rgba(150,100,70,0.35)"; g.lineWidth = 2; g.strokeRect(x * m + 5, Yp(0.78) + 5, 0.5 * m - 10, 0.6 * m - 10); }
  // posts and the top beam
  for (let x = 0; x <= w + 0.01; x += bay) { g.fillStyle = COL.timber; g.fillRect(x * m - 0.11 * m, 0, 0.22 * m, H); g.fillStyle = COL.timberLo; g.fillRect(x * m + 0.08 * m, 0, 0.03 * m, H); }
  g.fillStyle = COL.timber; g.fillRect(0, 0, W, 0.34 * m); g.fillStyle = COL.timberLo; g.fillRect(0, 0.3 * m, W, 0.04 * m);
  g.fillStyle = COL.timber; g.fillRect(0, Yp(0.98), W, 0.08 * m);
  if (hang !== undefined) {
    // the cord in an inverted V from a nail down to the scroll's top stick ends
    const nx = hang * m, ny = Yp(PT.y1 + 0.32), half = (PT.w / 2 - 0.05) * m;
    g.strokeStyle = "#3a2a22"; g.lineWidth = 5; g.beginPath(); g.moveTo(nx - half, Yp(PT.y1)); g.lineTo(nx, ny); g.lineTo(nx + half, Yp(PT.y1)); g.stroke();
    g.fillStyle = "#2a2020"; g.beginPath(); g.arc(nx, ny, 9, 0, 7); g.fill();
    blotch(g, nx, Yp((PT.y0 + PT.y1) / 2), 0.9 * m, "#9a8a70", 0.18);   // a faint shadow round the scroll
  }
});
/** a painted beam (w m long): a dark red body with blue-green cloud bands and gold lines at both ends (彩画) */
const beamTex = (seed: number) => paint(1024, 128, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = COL.beam; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.gold; g.fillRect(0, 6, W, 5); g.fillRect(0, H - 11, W, 5);
  const band = (x0: number, x1: number) => {
    g.fillStyle = COL.cyan; g.fillRect(x0, 14, x1 - x0, H - 28);
    g.strokeStyle = COL.gold; g.lineWidth = 3; g.strokeRect(x0 + 4, 18, x1 - x0 - 8, H - 36);
    for (let x = x0 + 30; x < x1 - 20; x += 60) { g.strokeStyle = r() < 0.5 ? "#9ad0c0" : "#e8d090"; g.lineWidth = 4; g.beginPath(); g.arc(x, H / 2, 16, Math.PI * 0.2, Math.PI * 1.8); g.stroke(); g.beginPath(); g.arc(x + 8, H / 2 + 2, 7, 0, Math.PI * 1.5); g.stroke(); }
  };
  band(0, W * 0.24); band(W * 0.76, W);
  g.fillStyle = COL.blue; g.fillRect(W * 0.38, 20, W * 0.24, H - 40); g.strokeStyle = COL.gold; g.lineWidth = 3; g.strokeRect(W * 0.38 + 4, 24, W * 0.24 - 8, H - 48);
  for (let k = 0; k < 4; k++) { const x = W * (0.41 + 0.06 * k); g.strokeStyle = "#e8d090"; g.lineWidth = 4; g.beginPath(); g.arc(x, H / 2, 14, Math.PI * 0.1, Math.PI * 1.6); g.stroke(); g.beginPath(); g.arc(x + 9, H / 2 + 3, 6, 0, Math.PI * 1.5); g.stroke(); }
});
/** the window: warm glowing paper behind a dark step lattice */
const windowTex = () => paint(384, 416, (g, W, H) => { latticePaint(g, 0, 0, W, H, { wood: COL.lattice, woodLo: shade(COL.lattice, -0.3), paper: COL.paper, paperHi: COL.paperHi, cell: 48, frame: 16, kind: "step" }); });
/** the pillar's skin: the red lacquer with a softer highlight band and a few worn streaks (wraps round) */
const pillarTex = () => paint(256, 64, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, COL.pillarLo); gr.addColorStop(0.3, COL.pillar); gr.addColorStop(0.48, COL.pillarHi); gr.addColorStop(0.62, COL.pillar); gr.addColorStop(1, COL.pillarLo);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(707); for (let i = 0; i < 20; i++) { g.fillStyle = "rgba(60,20,16,0.18)"; g.fillRect(W * r(), 0, 2, H); }
}, true);
/** straw coil for the prayer cushions (top: a spiral) */
const strawTex = () => paint(256, 256, (g, W) => {
  g.fillStyle = COL.straw; g.fillRect(0, 0, W, W);
  g.strokeStyle = COL.strawLo; g.lineWidth = 4;
  for (let rr = 8; rr < W / 2; rr += 12) { g.beginPath(); g.arc(W / 2, W / 2, rr, 0, 7); g.stroke(); }
  const r = rng(709); for (let i = 0; i < 300; i++) { const a = r() * 6.28, d = r() * W / 2; g.fillStyle = "rgba(240,220,160,0.5)"; g.fillRect(W / 2 + Math.cos(a) * d, W / 2 + Math.sin(a) * d, 4, 1.5); }
});
/** the smoke thread: a soft wavering ribbon of grey (alpha), repeats along v */
const smokeTex = () => paint(64, 512, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  for (let y = 0; y < H; y += 2) { const x = W / 2 + 9 * Math.sin((y / H) * Math.PI * 4) + 4 * Math.sin((y / H) * Math.PI * 10 + 1); const gr = g.createRadialGradient(x, y, 0, x, y, 16); gr.addColorStop(0, "rgba(236,230,222,0.16)"); gr.addColorStop(1, "rgba(236,230,222,0)"); g.fillStyle = gr; g.fillRect(x - 16, y - 2, 32, 4); }
}, true);
/** a window's shaft of light: a soft gradient that fades along its length and at its edges (additive) */
const shaftTex = () => paint(128, 256, (g, W, H) => {
  const gx = g.createLinearGradient(0, 0, 0, H); gx.addColorStop(0, "rgba(255,240,200,0.9)"); gx.addColorStop(1, "rgba(255,240,200,0)");
  g.fillStyle = gx; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "destination-in";
  const ge = g.createLinearGradient(0, 0, W, 0); ge.addColorStop(0, "rgba(0,0,0,0)"); ge.addColorStop(0.2, "rgba(0,0,0,1)"); ge.addColorStop(0.8, "rgba(0,0,0,1)"); ge.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = ge; g.fillRect(0, 0, W, H);
});

// ------------------------------------------------------------------------------------------------- THE PORTRAIT
const INK = "#2e2626";
/** pseudo-calligraphy: n abstract characters down a column at (x, y), each about s px, ink strokes (unreadable) */
const scribble = (g: G2, r: () => number, x: number, y: number, s: number, n: number) => {
  g.strokeStyle = "rgba(52,40,36,0.85)"; g.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const cy = y + i * s * 1.15, k = 3 + Math.floor(r() * 4);
    for (let j = 0; j < k; j++) {
      g.lineWidth = s * (0.08 + 0.06 * r());
      const a = r() < 0.5 ? 0 : r() < 0.5 ? Math.PI / 2 : (r() - 0.5) * 1.6, l = s * (0.3 + 0.4 * r()), ox = (r() - 0.5) * s * 0.5, oy = (r() - 0.5) * s * 0.5;
      g.beginPath(); g.moveTo(x + ox - Math.cos(a) * l / 2, cy + oy - Math.sin(a) * l / 2); g.lineTo(x + ox + Math.cos(a) * l / 2, cy + oy + Math.sin(a) * l / 2); g.stroke();
    }
  }
};
/** a red seal: a square (or round) of red with white abstract marks */
const seal = (g: G2, r: () => number, x: number, y: number, s: number, round = false) => {
  g.fillStyle = "#b4322a"; if (round) { g.beginPath(); g.ellipse(x + s / 2, y + s / 2, s / 2, s * 0.55, 0, 0, 7); g.fill(); } else g.fillRect(x, y, s, s);
  g.strokeStyle = "rgba(248,236,220,0.9)"; g.lineWidth = s * 0.08;
  for (let i = 0; i < 5; i++) { const a = r() < 0.5 ? 0 : Math.PI / 2, cx = x + s * (0.25 + 0.5 * r()), cy = y + s * (0.25 + 0.5 * r()), l = s * (0.2 + 0.25 * r()); g.beginPath(); g.moveTo(cx - Math.cos(a) * l / 2, cy - Math.sin(a) * l / 2); g.lineTo(cx + Math.cos(a) * l / 2, cy + Math.sin(a) * l / 2); g.stroke(); }
  if (!round) { g.strokeStyle = "rgba(248,236,220,0.9)"; g.lineWidth = s * 0.07; g.strokeRect(x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84); }
};
/** THE HANGING SCROLL: the whole mounting with the portrait in its core, 1024 px across PT.w metres */
const portraitTex = () => {
  const W = 1024, m = W / PT.w, H = Math.round((PT.y1 - PT.y0) * m);
  return paint(W, H, (g) => {
    const r = rng(733), Yw = (y: number) => (PT.y1 - y) * m;                         // world height -> canvas row
    const cx0 = (W - PC.w * m) / 2, cx1 = W - cx0, cy0 = Yw(PC.y1), cy1 = Yw(PC.y0), cw = cx1 - cx0, ch = cy1 - cy0;
    // the mounting silk (pale blue-green) with a faint damask of small cloud scrolls
    g.fillStyle = "#b8c6be"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(230,240,232,0.35)"; g.lineWidth = 3;
    for (let y = 20; y < H; y += 64) for (let x = 20 + ((y / 64) % 2) * 32; x < W; x += 64) { g.beginPath(); g.arc(x, y, 9, Math.PI * 0.2, Math.PI * 1.7); g.stroke(); }
    // the top stick band, the 惊燕 ribbons, the brocade frame round the core
    g.fillStyle = "#4a3428"; g.fillRect(0, 0, W, 16);
    for (const u of [0.36, 0.64]) { g.fillStyle = "#a2b2aa"; g.fillRect(W * u - 16, 16, 32, cy0 * 0.72); g.strokeStyle = "rgba(90,104,98,0.6)"; g.lineWidth = 2; g.strokeRect(W * u - 16, 16, 32, cy0 * 0.72); }
    g.fillStyle = "#7a5a34"; g.fillRect(cx0 - 16, cy0 - 16, cw + 32, ch + 32);
    g.fillStyle = "#c8a45a"; g.fillRect(cx0 - 9, cy0 - 9, cw + 18, ch + 18);
    g.fillStyle = "#7a5a34"; g.fillRect(cx0 - 5, cy0 - 5, cw + 10, ch + 10);
    // the core: old silk, darker toward its edges, a few soft stains
    g.fillStyle = "#e4d3ac"; g.fillRect(cx0, cy0, cw, ch);
    for (let i = 0; i < 30; i++) blotch(g, cx0 + cw * r(), cy0 + ch * r(), 30 + 80 * r(), r() < 0.6 ? "#d4c094" : "#eee2c4", 0.25);
    const eg = g.createRadialGradient(cx0 + cw / 2, cy0 + ch / 2, ch * 0.3, cx0 + cw / 2, cy0 + ch / 2, ch * 0.75); eg.addColorStop(0, "rgba(160,130,80,0)"); eg.addColorStop(1, "rgba(150,118,70,0.32)");
    g.fillStyle = eg; g.fillRect(cx0, cy0, cw, ch);
    g.save(); g.beginPath(); g.rect(cx0, cy0, cw, ch); g.clip();
    // ---- the figure (toon, flat colours, ink outline): he stands, turned a little to his left, smiling
    const X = cx0 + cw * 0.5, hy = Yw(TEMPLE.portraitFace.y) + 22;                  // the face's middle (the eyes a little above)
    const fr = 122, line = (w: number) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; };
    const fill = (col: string, path: () => void, w = 6) => { g.beginPath(); path(); g.fillStyle = col; g.fill(); line(w); g.stroke(); };
    // the robe: wide shoulders, a round belly, the body flaring down past the core's bottom
    const sh = hy + 150, robe = "#b8823f", robeLo = "#96662e", collar = "#5e4028";
    fill(robe, () => { g.moveTo(X - 120, sh - 10); g.bezierCurveTo(X - 250, sh + 10, X - 300, sh + 220, X - 290, sh + 420); g.lineTo(X - 330, cy1 + 40); g.lineTo(X + 330, cy1 + 40); g.lineTo(X + 290, sh + 420); g.bezierCurveTo(X + 300, sh + 220, X + 250, sh + 10, X + 120, sh - 10); g.closePath(); }, 7);
    // folds: soft darker strokes
    g.strokeStyle = robeLo; g.lineWidth = 7;
    for (const [x0, x1] of [[-200, -230], [-120, -150], [130, 170], [210, 240]]) { g.beginPath(); g.moveTo(X + x0, sh + 480); g.quadraticCurveTo(X + (x0 + x1) / 2 + 10, sh + 600, X + x1, cy1 + 10); g.stroke(); }
    // the belly's curve and the sash
    g.strokeStyle = robeLo; g.lineWidth = 6; g.beginPath(); g.arc(X, sh + 300, 210, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    fill("#5a3e2a", () => { g.moveTo(X - 220, sh + 380); g.quadraticCurveTo(X, sh + 420, X + 220, sh + 380); g.lineTo(X + 225, sh + 418); g.quadraticCurveTo(X, sh + 458, X - 225, sh + 418); g.closePath(); }, 5);
    fill("#5a3e2a", () => { g.moveTo(X + 30, sh + 430); g.lineTo(X + 60, sh + 640); g.lineTo(X + 88, sh + 636); g.lineTo(X + 62, sh + 430); g.closePath(); }, 4);
    fill("#5a3e2a", () => { g.moveTo(X + 10, sh + 430); g.lineTo(X + 0, sh + 610); g.lineTo(X + 26, sh + 612); g.lineTo(X + 36, sh + 430); g.closePath(); }, 4);
    // the crossed collar (left over right): a dark band with a white inner edge
    fill("#f2ead8", () => { g.moveTo(X - 70, sh - 20); g.lineTo(X + 10, sh + 150); g.lineTo(X + 70, sh - 20); g.closePath(); }, 4);
    fill(collar, () => { g.moveTo(X - 92, sh - 24); g.lineTo(X - 58, sh - 28); g.lineTo(X + 70, sh + 250); g.lineTo(X + 40, sh + 262); g.closePath(); }, 5);
    fill(collar, () => { g.moveTo(X + 92, sh - 24); g.lineTo(X + 60, sh - 28); g.lineTo(X + 4, sh + 150); g.lineTo(X + 26, sh + 168); g.closePath(); }, 5);
    // the big sleeves meeting in front, the hands joined inside them (a little skin showing)
    fill(robe, () => { g.moveTo(X - 250, sh + 60); g.bezierCurveTo(X - 300, sh + 260, X - 250, sh + 420, X - 40, sh + 470); g.lineTo(X - 30, sh + 330); g.bezierCurveTo(X - 120, sh + 300, X - 170, sh + 200, X - 190, sh + 80); g.closePath(); }, 6);
    fill(robe, () => { g.moveTo(X + 250, sh + 60); g.bezierCurveTo(X + 300, sh + 260, X + 250, sh + 420, X + 40, sh + 470); g.lineTo(X + 30, sh + 330); g.bezierCurveTo(X + 120, sh + 300, X + 170, sh + 200, X + 190, sh + 80); g.closePath(); }, 6);
    fill(collar, () => { g.moveTo(X - 40, sh + 470); g.lineTo(X - 30, sh + 330); g.lineTo(X - 6, sh + 334); g.lineTo(X - 14, sh + 474); g.closePath(); }, 4);
    fill(collar, () => { g.moveTo(X + 40, sh + 470); g.lineTo(X + 30, sh + 330); g.lineTo(X + 6, sh + 334); g.lineTo(X + 14, sh + 474); g.closePath(); }, 4);
    fill("#f0c49c", () => { g.ellipse(X - 16, sh + 392, 30, 26, -0.3, 0, 7); }, 4);
    fill("#f0c49c", () => { g.ellipse(X + 14, sh + 404, 30, 26, 0.3, 0, 7); }, 4);
    line(3); g.beginPath(); g.moveTo(X + 2, sh + 396); g.lineTo(X + 26, sh + 392); g.moveTo(X + 4, sh + 408); g.lineTo(X + 28, sh + 404); g.stroke();
    // the neck, the ears, the face (round and plump), rosy cheeks
    const skin = "#f2c6a0", skinLo = "#dca27e";
    fill(skin, () => { g.rect(X - 46, hy + 60, 92, 90); }, 5);
    fill(skin, () => { g.ellipse(X - fr * 0.98, hy + 4, 22, 34, 0.2, 0, 7); }, 5);
    fill(skin, () => { g.ellipse(X + fr * 0.98, hy + 4, 22, 34, -0.2, 0, 7); }, 5);
    fill(skin, () => { g.ellipse(X, hy, fr, fr * 1.08, 0, 0, 7); }, 7);
    blotch(g, X - fr * 0.55, hy + 30, 34, "#e8786a", 0.45); blotch(g, X + fr * 0.55, hy + 30, 34, "#e8786a", 0.45);
    // THE BEARD: full and black, from the jaw down over the chest, strands painted lighter
    const beard = "#2c2830";
    fill(beard, () => { g.moveTo(X - fr * 0.92, hy + 20); g.bezierCurveTo(X - fr * 1.0, hy + 120, X - 90, hy + 260, X - 10, hy + 360); g.lineTo(X + 4, hy + 380); g.lineTo(X + 16, hy + 356); g.bezierCurveTo(X + 92, hy + 260, X + fr * 1.0, hy + 120, X + fr * 0.92, hy + 20); g.bezierCurveTo(X + fr * 0.7, hy + 80, X + 40, hy + 92, X, hy + 92); g.bezierCurveTo(X - 40, hy + 92, X - fr * 0.7, hy + 80, X - fr * 0.92, hy + 20); g.closePath(); }, 5);
    g.strokeStyle = "rgba(120,112,124,0.6)"; g.lineWidth = 2.5;
    for (let i = 0; i < 16; i++) { const u = (i / 15 - 0.5) * 1.6, x0 = X + u * 70; g.beginPath(); g.moveTo(x0, hy + 110); g.quadraticCurveTo(x0 + u * 14, hy + 220, X + u * 20, hy + 330); g.stroke(); }
    // the moustache, the smiling mouth
    fill(beard, () => { g.moveTo(X, hy + 44); g.bezierCurveTo(X - 30, hy + 36, X - 66, hy + 50, X - 84, hy + 92); g.bezierCurveTo(X - 56, hy + 70, X - 30, hy + 66, X, hy + 62); g.bezierCurveTo(X + 30, hy + 66, X + 56, hy + 70, X + 84, hy + 92); g.bezierCurveTo(X + 66, hy + 50, X + 30, hy + 36, X, hy + 44); g.closePath(); }, 4);
    fill("#9a3a32", () => { g.moveTo(X - 26, hy + 70); g.quadraticCurveTo(X, hy + 90, X + 26, hy + 70); g.quadraticCurveTo(X, hy + 78, X - 26, hy + 70); g.closePath(); }, 3);
    // the nose, the eyes (warm, smiling), the brows
    line(5); g.beginPath(); g.moveTo(X - 6, hy - 20); g.quadraticCurveTo(X - 18, hy + 18, X - 4, hy + 26); g.quadraticCurveTo(X + 10, hy + 30, X + 18, hy + 20); g.stroke();
    blotch(g, X + 4, hy + 18, 14, skinLo, 0.5);
    for (const s of [-1, 1]) {
      const ex = X + s * 50, ey = hy - 30;
      g.fillStyle = INK; g.beginPath(); g.ellipse(ex, ey, 15, 17, 0, 0, 7); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(ex - 4, ey - 6, 5.5, 0, 7); g.fill();
      line(6); g.beginPath(); g.arc(ex, ey + 26, 28, Math.PI * 1.2, Math.PI * 1.8); g.stroke();                            // the smiling lower lid
      line(11); g.beginPath(); g.moveTo(ex - s * 32, ey - 34); g.quadraticCurveTo(ex + s * 2, ey - 58, ex + s * 40, ey - 46); g.stroke();   // the brow
    }
    // THE 东坡巾: the tall square black cap (a little wider at the top, flat top), its band and the seam a third up;
    // the side wall seen in three-quarter view a shade darker
    const capB = hy - fr * 0.6, capT = hy - fr * 0.6 - 205, capCol = "#36323c", capSide = "#28252e"; const ck = fr / 100;
    fill(capCol, () => { g.moveTo(X - 92 * ck, capB); g.lineTo(X - 106 * ck, capT + 8); g.quadraticCurveTo(X - 106 * ck, capT, X - 96 * ck, capT); g.lineTo(X + 70 * ck, capT); g.lineTo(X + 74 * ck, capB); g.closePath(); }, 7);
    fill(capSide, () => { g.moveTo(X + 74 * ck, capB); g.lineTo(X + 70 * ck, capT); g.lineTo(X + 104 * ck, capT + 14); g.quadraticCurveTo(X + 112 * ck, capT + 18, X + 110 * ck, capT + 26); g.lineTo(X + 104 * ck, capB - 6); g.closePath(); }, 7);
    g.strokeStyle = "rgba(150,144,160,0.7)"; g.lineWidth = 4; g.beginPath(); g.moveTo(X - 100 * ck, capB - 84); g.lineTo(X + 72 * ck, capB - 84); g.lineTo(X + 106 * ck, capB - 90); g.stroke();
    fill("#211e26", () => { g.moveTo(X - 96 * ck, capB + 6); g.lineTo(X - 94 * ck, capB - 26); g.lineTo(X + 74 * ck, capB - 26); g.lineTo(X + 106 * ck, capB - 32); g.lineTo(X + 106 * ck, capB + 2); g.lineTo(X + 74 * ck, capB + 8); g.closePath(); }, 5);
    // the hair at the temples under the cap
    fill(beard, () => { g.moveTo(X - fr * 0.98, hy - 30); g.quadraticCurveTo(X - fr * 0.96, capB + 2, X - 70, capB + 4); g.lineTo(X - fr * 0.84, hy - 8); g.closePath(); }, 3);
    fill(beard, () => { g.moveTo(X + fr * 0.98, hy - 30); g.quadraticCurveTo(X + fr * 0.96, capB + 2, X + 70, capB + 4); g.lineTo(X + fr * 0.84, hy - 8); g.closePath(); }, 3);
    // a few rocks and an orchid at his feet (light ink)
    g.fillStyle = "rgba(120,110,96,0.35)"; g.beginPath(); g.ellipse(cx0 + cw * 0.14, cy1 - 30, 70, 40, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(70,90,60,0.6)"; g.lineWidth = 4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx0 + cw * 0.12, cy1 - 40); g.quadraticCurveTo(cx0 + cw * (0.05 + 0.04 * i), cy1 - 140 - 20 * i, cx0 + cw * (0.02 + 0.05 * i), cy1 - 90 - 30 * r()); g.stroke(); }
    g.restore();
    // ---- the inscription (two columns, top right of the core) with its seal; collectors' seals bottom left
    scribble(g, r, cx1 - 70, cy0 + 70, 46, 9); scribble(g, r, cx1 - 130, cy0 + 70, 46, 6);
    seal(g, r, cx1 - 150, cy0 + 70 + 6 * 53, 40); seal(g, r, cx1 - 94, cy0 + 70 + 9 * 53, 34, true);
    seal(g, r, cx0 + 28, cy1 - 88, 46); seal(g, r, cx0 + 84, cy1 - 72, 34);
    // the bottom mounting's shading toward the roller
    const bg = g.createLinearGradient(0, H - 60, 0, H); bg.addColorStop(0, "rgba(60,70,64,0)"); bg.addColorStop(1, "rgba(60,70,64,0.25)"); g.fillStyle = bg; g.fillRect(0, H - 60, W, 60);
  });
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildTemple(K: Kit) {
  const group = new THREE.Group(); group.name = "set-temple";
  const Mk = maker(K, group);

  // ===================================================================================================== the room
  const floorMap = floorTex(); floorMap.repeat.set(0.5, 0.5);
  Mk.mesh("temple.floor", levelQuad(F.x0, F.x1, F.z0, F.z1, 0), Mk.tex(floorMap, 0.75), { cast: false });
  // the light pools: a second sheet multiplied over the floor, a hair above it (well under the figures' contact blob)
  const pool = new THREE.Mesh(levelQuad(F.x0, F.x1, F.z0, F.z1, 0.0006, (x, z) => [(x - F.x0) / (F.x1 - F.x0), 1 - (z - F.z0) / (F.z1 - F.z0)]), new THREE.MeshBasicMaterial({ map: lightPoolTex(), blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, premultipliedAlpha: true }));
  pool.name = "temple.floor.light"; pool.layers.set(NOINK); pool.renderOrder = 2; group.add(pool);
  const back = Mk.mesh("temple.back", boxG(F.x0 - 0.2, F.x1 + 0.2, 0, HH, S.back - 0.25, S.back), [Mk.flat(COL.plaster), Mk.flat(COL.plaster), Mk.flat(COL.timber), Mk.flat(COL.plaster), Mk.tex(wallTex(711, F.x1 - F.x0 + 0.4, HH, 2.4, PT.x - (F.x0 - 0.2))), Mk.flat(COL.plaster)]);
  void back;
  const sideTex = wallTex(713, F.z1 - F.z0, HH, 2.15);
  Mk.mesh("temple.right", new THREE.BoxGeometry(0.25, HH, F.z1 - F.z0).translate(F.x1 + 0.125, HH / 2, (F.z0 + F.z1) / 2), [Mk.flat(COL.plaster), Mk.tex(sideTex), Mk.flat(COL.timber), Mk.flat(COL.plaster), Mk.flat(COL.plaster), Mk.flat(COL.plaster)]);
  // the left wall: below / above the windows and the piers between them (one painted texture across all pieces)
  {
    const Wn = S.windows, lx0 = F.x0 - 0.25, lx1 = F.x0, mat = Mk.tex(wallTex(715, F.z1 - F.z0, HH, 2.15));
    const piece = (z0: number, z1: number, y0: number, y1: number, name: string) => {
      const g = new THREE.BoxGeometry(lx1 - lx0, y1 - y0, z1 - z0).translate((lx0 + lx1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      // the inner face (+x) shows the wall painting at its true place (u along z from z1 to z0: the room's left wall read from inside)
      const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) if (n.getX(i) > 0.5) uv.setXY(i, (F.z1 - p.getZ(i)) / (F.z1 - F.z0), p.getY(i) / HH); else uv.setXY(i, 0.02, 0.5);
      Mk.mesh(name, g, mat);
    };
    piece(F.z0, F.z1, 0, Wn.y0, "temple.left.low"); piece(F.z0, F.z1, Wn.y1, HH, "temple.left.high");
    const zs = [F.z0, ...Wn.z.flatMap((z) => [z - Wn.w / 2, z + Wn.w / 2]), F.z1];
    for (let i = 0; i + 1 < zs.length; i += 2) piece(zs[i], zs[i + 1], Wn.y0, Wn.y1, `temple.left.pier${i}`);
    const wt = windowTex(), wm = new THREE.MeshBasicMaterial({ map: wt, fog: false });
    Wn.z.forEach((z, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(Wn.w, Wn.y1 - Wn.y0).rotateY(Math.PI / 2).translate(F.x0 - 0.12, (Wn.y0 + Wn.y1) / 2, z), wm); m.name = `temple.window${k}`; group.add(m); });
  }
  const front = Mk.mesh("temple.front", boxG(F.x0 - 0.25, F.x1 + 0.25, 0, HH, F.z1, F.z1 + 0.25), Mk.flat(COL.timber));
  // the ceiling: dark boards with beams painted across
  Mk.mesh("temple.ceiling", boxG(F.x0 - 0.25, F.x1 + 0.25, HH, HH + 0.12, F.z0 - 0.25, F.z1 + 0.25), Mk.flat(COL.ceiling), { cast: false });

  // ===================================================================================================== pillars, beams
  {
    const pm = Mk.tex(pillarTex(), 0.55), bm = Mk.flat(COL.base, 0.85), beamM = Mk.tex(beamTex(717), 0.8), beamSide = Mk.flat(COL.beam, 0.8);
    for (const [k, [x, z]] of S.pillars.entries()) {
      const pg = new THREE.CylinderGeometry(S.pillarR, S.pillarR * 1.05, HH - 0.1, 24, 1, true).translate(x, 0.1 + (HH - 0.1) / 2, z);
      Mk.mesh(`temple.pillar${k}`, pg, pm);
      Mk.mesh(`temple.pillar${k}.base`, lathe([[0.0, 0], [0.3, 0], [0.31, 0.05], [0.28, 0.14], [0.22, 0.17], [0.0, 0.17]], 24).translate(x, 0, z), bm);
    }
    // lintels along x over each row of pillars, beams along z over each side; painted
    for (const z of [S.pillars[0][1], S.pillars[2][1]]) {
      const g = new THREE.BoxGeometry(F.x1 - F.x0, 0.32, 0.26).translate(TX, HH - 0.62, z);
      Mk.mesh("temple.lintel", g, [beamSide, beamSide, beamSide, beamSide, beamM, beamM], { cast: false });
    }
    for (const x of [S.pillars[0][0], S.pillars[1][0]]) Mk.mesh("temple.beam", boxG(x - 0.15, x + 0.15, HH - 0.3, HH, F.z0, F.z1), beamSide, { cast: false });
  }

  // ===================================================================================================== THE PORTRAIT
  {
    const pz = PT.z, d = 0.015, h = PT.y1 - PT.y0;
    const face = Mk.tex(portraitTex(), 0.9), edge = Mk.flat("#9aaaa2", 0.9);
    Mk.mesh("temple.portrait", new THREE.BoxGeometry(PT.w, h, d).translate(PT.x, (PT.y0 + PT.y1) / 2, pz - d / 2), [edge, edge, edge, edge, face, edge], { cast: false });
    const wood = Mk.flat("#4a3428", 0.6), knob = Mk.flat("#c8b48a", 0.4);
    Mk.mesh("temple.portrait.stick", new THREE.BoxGeometry(PT.w + 0.04, 0.05, 0.04).translate(PT.x, PT.y1 - 0.01, pz - 0.012), wood);
    Mk.mesh("temple.portrait.roller", new THREE.CylinderGeometry(0.04, 0.04, PT.w + 0.06, 16).rotateZ(Math.PI / 2).translate(PT.x, PT.y0, pz - 0.02), wood);
    for (const s of [-1, 1]) Mk.mesh("temple.portrait.knob", new THREE.CylinderGeometry(0.06, 0.06, 0.07, 16).rotateZ(Math.PI / 2).translate(PT.x + s * (PT.w / 2 + 0.065), PT.y0, pz - 0.02), knob);
  }

  // ===================================================================================================== the altar
  {
    const A = S.altar, P = new Part(K), lac = Mk.flat(COL.lacquer, 0.45), lacHi = Mk.flat(COL.lacquerHi, 0.45);
    const ax0 = A.x - A.w / 2, ax1 = A.x + A.w / 2;
    Mk.mesh("temple.altar.top", boxG(ax0 - 0.06, ax1 + 0.06, A.top - 0.07, A.top, A.z0 - 0.03, A.z1 + 0.03), lacHi);
    Mk.mesh("temple.altar.apron", boxG(ax0, ax1, A.top - 0.26, A.top - 0.07, A.z1 - 0.06, A.z1 - 0.01), lac);
    for (const x of [ax0 + 0.06, ax1 - 0.06]) for (const z of [A.z0 + 0.05, A.z1 - 0.05]) Mk.mesh("temple.altar.leg", boxG(x - 0.045, x + 0.045, 0, A.top - 0.07, z - 0.045, z + 0.045), lac);
    // candles in their holders, a plate of lychees, a small incense holder
    const brass = Mk.flat(COL.bronzeHi, 0.4), wax = Mk.flat(COL.candle, 0.6), plate = Mk.flat(COL.plate, 0.5), fruit = Mk.flat(COL.lychee, 0.6);
    for (const s of [-1, 1]) {
      const cx = A.x + s * 0.78, cz = (A.z0 + A.z1) / 2;
      P.add(brass, lathe([[0.0, 0], [0.08, 0], [0.08, 0.02], [0.03, 0.04], [0.025, 0.16], [0.06, 0.18], [0.06, 0.2], [0.0, 0.2]], 16).translate(cx, A.top, cz), 0.006);
      P.add(wax, new THREE.CylinderGeometry(0.025, 0.025, 0.2, 12).translate(cx, A.top + 0.3, cz), 0.005);
    }
    P.add(plate, lathe([[0, 0], [0.09, 0], [0.16, 0.03], [0.17, 0.045], [0.0, 0.03]], 24).translate(A.x - 0.35, A.top, (A.z0 + A.z1) / 2 + 0.05), 0.005);
    const r = rng(719);
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = i < 6 ? 0.08 : 0.02, y = i < 6 ? 0.07 : 0.12; P.add(fruit, new THREE.IcosahedronGeometry(0.035, 1).translate(A.x - 0.35 + Math.cos(a) * d, A.top + y, (A.z0 + A.z1) / 2 + 0.05 + Math.sin(a) * d), 0.004); }
    P.add(brass, lathe([[0, 0], [0.07, 0], [0.09, 0.07], [0.08, 0.09], [0.0, 0.08]], 16).translate(A.x + 0.3, A.top, (A.z0 + A.z1) / 2), 0.005);
    P.into(group, "temple.altar.things");
    for (const s of [-1, 1]) {
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 8).translate(0, 0.03, 0), Mk.basic(COL.flame)); fl.position.set(A.x + s * 0.78, A.top + 0.4, (A.z0 + A.z1) / 2); fl.layers.set(NOINK); fl.name = "temple.candle.flame"; group.add(fl);
      const gl = glowSprite(0.14, "#ffc070", 0.5); gl.position.set(A.x + s * 0.78, A.top + 0.43, (A.z0 + A.z1) / 2 + 0.03); gl.name = "temple.candle.glow"; group.add(gl);
    }
  }

  // ===================================================================================================== burner, 木鱼, cushions
  let smoke: THREE.Mesh;
  const glows: THREE.Mesh[] = [];
  {
    const Bu = S.burner, P = new Part(K), stand = Mk.flat(COL.lacquer, 0.5), bronze = Mk.flat(COL.bronze, 0.45), bronzeLo = Mk.flat(COL.bronzeLo, 0.5);
    P.add(stand, new THREE.BoxGeometry(0.72, 0.06, 0.72).translate(Bu.x, 0.3, Bu.z), 0.006);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(stand, new THREE.BoxGeometry(0.07, 0.27, 0.07).translate(Bu.x + sx * 0.3, 0.135, Bu.z + sz * 0.3), 0.005);
    const y0 = 0.33;
    P.add(bronze, lathe([[0.0, 0.14], [0.2, 0.14], [0.27, 0.24], [0.28, 0.36], [0.24, 0.46], [0.25, 0.5], [0.0, 0.48]], 24).translate(Bu.x, y0, Bu.z), 0.007);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + Math.PI / 2; P.add(bronzeLo, bar(new THREE.Vector3(Bu.x + Math.cos(a) * 0.16, y0 + 0.18, Bu.z + Math.sin(a) * 0.16), new THREE.Vector3(Bu.x + Math.cos(a) * 0.2, y0, Bu.z + Math.sin(a) * 0.2), 0.035, 0.03, 10), 0.006); }
    for (const s of [-1, 1]) P.add(bronze, new THREE.TorusGeometry(0.07, 0.022, 8, 16, Math.PI).translate(Bu.x + s * 0.2, y0 + 0.5, Bu.z), 0.005);
    // the incense sticks (three, standing in the ash)
    for (let k = 0; k < 3; k++) P.add(Mk.flat("#9a5a3a", 0.8), new THREE.CylinderGeometry(0.008, 0.008, 0.28, 6).translate(Bu.x - 0.05 + k * 0.05, y0 + 0.6, Bu.z), 0.004);
    P.into(group, "temple.burner");
    const tip = new THREE.Vector3(Bu.x, y0 + 0.75, Bu.z);
    for (let k = 0; k < 3; k++) { const gl = glowSprite(0.025, "#ff8a40", 0.9); gl.position.set(tip.x - 0.05 + k * 0.05, tip.y, tip.z + 0.01); gl.name = "temple.incense.tip"; group.add(gl); glows.push(gl); }
    const st = smokeTex(); st.repeat.set(1, 1);
    smoke = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.7).translate(0, 0.85, 0), Mk.basic("#ffffff", { map: st, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    smoke.position.copy(tip); smoke.layers.set(NOINK); smoke.name = "temple.smoke"; smoke.renderOrder = 6; group.add(smoke);
    // the 木鱼 on its cushion stand
    const Mu = S.muyu, Q = new Part(K), red = Mk.flat(COL.muyu, 0.45), redLo = Mk.flat(COL.muyuLo, 0.5), cloth = Mk.flat("#c8a44e", 0.8);
    Q.add(stand, new THREE.BoxGeometry(0.46, 0.5, 0.46).translate(Mu.x, 0.25, Mu.z), 0.006);
    Q.add(cloth, new THREE.CylinderGeometry(0.2, 0.22, 0.08, 20).translate(Mu.x, 0.54, Mu.z), 0.005);
    Q.add(red, new THREE.SphereGeometry(0.17, 20, 14).scale(1.1, 0.85, 1).translate(Mu.x, 0.72, Mu.z), 0.006);
    Q.add(redLo, new THREE.BoxGeometry(0.2, 0.025, 0.05).translate(Mu.x, 0.72, Mu.z + 0.165), 0);
    Q.add(Mk.flat("#6a4a34", 0.6), bar(new THREE.Vector3(Mu.x + 0.1, 0.59, Mu.z + 0.14), new THREE.Vector3(Mu.x + 0.3, 0.6, Mu.z + 0.2), 0.012, 0.012, 8), 0.004);
    Q.add(Mk.flat("#6a4a34", 0.6), new THREE.SphereGeometry(0.03, 10, 8).translate(Mu.x + 0.1, 0.59, Mu.z + 0.14), 0.004);
    Q.into(group, "temple.muyu");
    // the prayer cushions
    const cm = Mk.tex(strawTex(), 0.95), cs = Mk.flat(COL.strawLo, 0.95), C = S.cushion;
    for (const [k, [x, z]] of S.cushions.entries()) Mk.mesh(`temple.cushion${k}`, new THREE.CylinderGeometry(C.r, C.r * 1.04, C.h, 28).translate(x, C.h / 2, z), [cs, cm, cs]);
  }

  // ===================================================================================================== banners, shafts
  const banners: ReturnType<typeof makeCloth>[] = [];
  {
    const bt = paint(128, 512, (g, W, H) => {
      g.fillStyle = COL.banner; g.fillRect(0, 0, W, H);
      g.fillStyle = COL.bannerBand; g.fillRect(0, 0, W, 26); g.fillRect(0, H - 60, W, 18);
      g.strokeStyle = "rgba(170,130,60,0.6)"; g.lineWidth = 4; g.strokeRect(12, 34, W - 24, H - 110);
      for (let y = 80; y < H - 120; y += 70) { g.beginPath(); g.arc(W / 2, y, 18, 0, 7); g.stroke(); }
      g.strokeStyle = "#5a3a2a"; g.lineWidth = 6; g.strokeRect(0, 0, W, H + 10);
    });
    const bm = Mk.K.flat("#ffffff", { map: bt, rough: 0.9, side: THREE.DoubleSide });
    for (const [k, x] of [[0, TX - 3.3], [1, TX + 3.3]] as [number, number][]) {
      const c = makeCloth(bm, 0.5, 2.2, { nx: 4, ny: 8, ph: k * 2.1, tails: 0.12, freq: 0.5 });
      c.mesh.position.set(x, HH - 0.32, -3.4); c.mesh.name = `temple.banner${k}`; group.add(c.mesh); banners.push(c);
    }
    const sh = shaftTex();
    for (const z of S.windows.z) {
      const Wn = S.windows, ym = Wn.y0 + 0.62 * (Wn.y1 - Wn.y0), hw = Wn.w * 0.46, fx = F.x0 + 2.6, dz = 0.25;
      const g = quad4(new THREE.Vector3(fx, 0.02, z - hw + dz), new THREE.Vector3(fx, 0.02, z + hw + dz), new THREE.Vector3(F.x0 + 0.02, ym, z + hw), new THREE.Vector3(F.x0 + 0.02, ym, z - hw));
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: sh, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      m.layers.set(NOINK); m.renderOrder = 7; m.name = "temple.shaft"; group.add(m);
    }
  }

  // ===================================================================================================== light
  lightRig(group, { dir: [-0.8, 0.5, 0.3], k: 1.5, col: "#fff0d6", at: [TX, 0, -1.2], half: 6, hemi: ["#f2e4cc", "#8a6446", 1.35], point: { col: "#ffdcae", k: 0.9, at: [TX + 0.4, 2.7, -2.4], dist: 6 } });

  const pose = (t: number) => {
    const sm = smoke.material as THREE.MeshBasicMaterial;
    sm.map!.offset.set(0.04 * Math.sin(t * 0.7), -t * 0.08);
    smoke.rotation.z = 0.04 * Math.sin(t * 0.5);
    glows.forEach((gl, i) => { (gl.material as THREE.MeshBasicMaterial).opacity = 0.75 + 0.15 * Math.sin(t * 1.3 + i * 2); });
    banners.forEach((b) => b.sway(t, 0.025));
  };
  pose(0);
  return {
    group,
    view(cam: THREE.Vector3) {
      front.visible = !(cam.z < F.z1 + 0.25 && cam.x > F.x0 - 0.25 && cam.x < F.x1 + 0.25);
      faceY(smoke, cam);
      for (const gl of glows) faceY(gl, cam);
    },
    animate(t: number) { pose(t); },
    setParam(_name: string, _v: ParamValue) { /* no dressing */ },
  };
}
