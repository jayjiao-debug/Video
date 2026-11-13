// THE ZHAO COURT 赵廷 (place "zhao", island x 40), by day. WP3's set (it replaced the WP1b block-out with the same
// exports: buildZhao(K) -> { group, view(camPos) } and ZHAO_LOOK). Every number is layout/zhao.ts ZHAO_SET.
//
// WHAT THERE IS (the cameras all look north, -z; the king sits centre-left, the east door is screen right):
//   - the floor: pale wooden boards running toward the camera, and in front of the dais a woven mat (席) with a teal
//     border, all PAINTED into one floor texture (one level: no step, no z-fight, nothing for the ink pass);
//   - the walls: cream plaster with a pale wood dado and a timber beam band at the top, painted; the north wall has the
//     lattice window's opening (a real hole: its reveal shows the wall's depth). The side and south walls are outside
//     every Zhao frame and are hidden by view() whenever the camera stands behind them;
//   - the dais (pale wood, a mat on top), the king's 榻 (teal lacquer, lighter than his deep-teal robe, gold edge
//     painted) with its cushion "zhao.pad", and behind it the TEAL-AND-GOLD SCREEN: a teal lacquer frame on two feet
//     round a CELADON silk panel with a teal border and gold cloud scrolls (the middle, behind the king's head, calm).
//     It fills zhaoThrone / zhaoKing edge to edge: the king's deep-teal robe, black hair and gold crown read against it,
//     and the white jade in front of his robe stays the brightest thing in the frame;
//   - the lattice window (直棂窗) right of the dais: a pale wood frame round the opening, behind it ONE painted card of
//     pale sky with the upright bars painted on it (unlit, NOINK: nine bars of 3 cm would sparkle as geometry);
//   - TEAL HANGINGS: a valance along the top of the back wall (2.95-3.35 m: the top 2-8 % of the wide frames, above
//     every head and the HUD) and two tied-back drapes either side of the window;
//   - daylight from the EAST (screen right, the camera's upper right front): one shadowed key, a bright hemisphere.
//     The walls, the valance, the drapes and the window frame cast NO shadow (a 3.9 m east wall put the whole right
//     half of the room in shade in the block-out); the screen, the dais, the 榻 and the figures do. The screen
//     RECEIVES none (the king's shadow on it read as a second figure and filled zhaoKing's graphic side).
// Colour: cream, pale wood, celadon, teal, a little gold. Nothing black, nothing red (BIBLE 8.5).
// INK / FLICKER RULES (sets/okit.ts, Hongmen tent.ts): small pattern is paint; inked pieces are chunky (the frame
// members 7-8 cm) and either within 2.5 cm of their neighbour in depth or well clear; flat pieces on the wall stand
// 3-6 cm proud and overlap it by a centimetre; the window's card and bars are NOINK. Seeded painting only (rng).
// Mesh names: "zhao.<piece>"; the cushion is "zhao.pad" (the clearance checker treats "pad" as the sitter's cushion).
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { lightRig, paint, blotch, rng, css, mix, NOINK, type G2 } from "../../../kit/sets/okit";
import { ZHAO_SET as S, ZX } from "../layout/zhao";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceLook } from "./index";

// ---------------------------------------------------------------------------------------------------- the look
const ZHAO_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.52, 0.5, 0.5]], [-25, [0.56, 0.55, 0.58]], [-3, [0.64, 0.66, 0.72]], [4, [0.86, 0.9, 0.98]], [30, [0.7, 0.78, 0.95]], [90, [0.58, 0.68, 0.95]]],
  boxes: [{ az: -127, el: 33, rot: 0, w: 36, h: 18, soft: 14, col: [1.0, 0.96, 0.88] }],
};
/** PALE, by day: clean daylight from the EAST (screen right, the camera's upper right front), lavender shade */
export const ZHAO_LOOK: PlaceLook = {
  bg: "#e9e2d2",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.8, color: "#3a3550" },
  cast: {
    key: [0.5, 0.55, 0.67], tint: [1.0, 0.99, 0.96], tintK: 1, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.93, 0.94, 0.98],
    shade: [1.04, 0.95, 1.32], shadeK: 0.3, wrap: [26, 52], edge: 0.13, broad: 0, bodySat: 0.12, sheen: 0.08, lift: 0, contactLen: 0.5,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: ZHAO_FILL,
};

// ---------------------------------------------------------------------------------------------------- colours
const COL = {
  plaster: "#ede3cd", plasterLo: "#dfd2b6", dado: "#cdb48a", dadoLine: "#a98b60", beam: "#c4a67a", beamLo: "#a5875c",
  board: "#dcc8a2", boardLo: "#c9b28a", seam: "#a88d66",
  mat: "#ece2c4", matLine: "#d9cba4", teal: "#3c8f89", tealDeep: "#2f7a75", tealPale: "#6fb0a6", gold: "#c9a24a", goldHi: "#dcb95e",
  wood: "#c8ad82", woodLo: "#a98d63", ta: "#3a918a", cushion: "#dac78f",
  celadon: "#b2d0bf", celadonLo: "#a0c2af", frame: "#2f7a75",
  sky: "#dcecf2", skyLo: "#f2f4ec", bar: "#9a7e57", barHi: "#bea47a", winFrame: "#b89c70",
  valance: "#3a8e88", drape: "#3f938c", daylight: "#fffaf0",
};

// ---------------------------------------------------------------------------------------------------- helpers
/** uv = a world-coordinate projection of every vertex: on the x-y plane (faces looking along z), the z-y plane or the
 *  x-z plane; [a0, a1] x [b0, b1] maps to [0, 1] (the canvas' top row is v = 1) */
const worldUV = <T extends THREE.BufferGeometry>(g: T, plane: "xy" | "zy" | "xz", a0: number, a1: number, b0: number, b1: number): T => {
  const p = g.attributes.position as THREE.BufferAttribute, n = p.count, uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = plane === "zy" ? z : x, b = plane === "xz" ? z : y;
    uv[2 * i] = (a - a0) / (a1 - a0); uv[2 * i + 1] = plane === "xz" ? 1 - (b - b0) / (b1 - b0) : (b - b0) / (b1 - b0);
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a gold cloud scroll (云纹): a spiral with a tail, centred (x, y), size r px, turning `dir` (1 / -1) */
const cloud = (g: G2, x: number, y: number, r: number, dir: number, col: string, lw: number) => {
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round";
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const t = i / 40, a = dir * t * Math.PI * 2.6, rr = r * (0.18 + 0.82 * t); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  const ae = dir * Math.PI * 2.6;
  g.quadraticCurveTo(x + Math.cos(ae) * r * 1.6 + dir * r * 0.6, y + Math.sin(ae) * r * 1.2, x + dir * r * 2.4, y + r * 0.9);
  g.stroke();
};

// ---------------------------------------------------------------------------------------------------- the paintings
const F = S.floor, H = S.wallH;
/** the north wall's face: plaster, dado, beam band (x F.x0..F.x1, y 0..H) */
const wallTex = () => paint(1024, 640, (g, W, Ht) => {
  const r = rng(41), py = (y: number) => Ht * (1 - y / H);
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, Ht);
  for (let i = 0; i < 70; i++) blotch(g, W * r(), Ht * r(), 30 + 70 * r(), r() < 0.5 ? COL.plasterLo : "#f6eedc", 0.16);
  // the pale wood dado with a moulding line and a skirting
  g.fillStyle = COL.dado; g.fillRect(0, py(S.wall.dado), W, Ht - py(S.wall.dado));
  for (let i = 0; i < 30; i++) blotch(g, W * r(), py(S.wall.dado * r()), 20 + 30 * r(), COL.woodLo, 0.08);
  g.fillStyle = COL.dadoLine; g.fillRect(0, py(S.wall.dado) - 3, W, 6); g.fillRect(0, py(0.07), W, Ht - py(0.07));
  // the timber beam band at the top, a teal-and-gold painted band (彩画) along its middle
  g.fillStyle = COL.beam; g.fillRect(0, 0, W, py(S.wall.beam));
  g.fillStyle = COL.beamLo; g.fillRect(0, py(S.wall.beam) - 4, W, 5); g.fillRect(0, 0, W, 4);
  const b0 = py(S.wall.beam + 0.12), b1 = py(H - 0.12);
  g.fillStyle = COL.tealDeep; g.fillRect(0, b1, W, b0 - b1);
  g.fillStyle = COL.gold; g.fillRect(0, b1 - 3, W, 3); g.fillRect(0, b0, W, 3);
});
/** the floor: boards along z, the woven mat in front of the dais (x F.x0..F.x1, z F.z0..F.z1; canvas top = F.z0) */
const floorTex = () => paint(2048, 2048, (g, W, Ht) => {
  const r = rng(43), px = (x: number) => ((x - F.x0) / (F.x1 - F.x0)) * W, pz = (z: number) => ((z - F.z0) / (F.z1 - F.z0)) * Ht;
  const B = S.boards, bw = px(F.x0 + B.w);
  for (let i = 0; i * bw < W; i++) {
    const x = i * bw;
    let z = F.z0 - B.len[0] * r();
    while (z < F.z1) {
      const len = B.len[0] + (B.len[1] - B.len[0]) * r(), k = r();
      g.fillStyle = css(mix(COL.board, COL.boardLo, 0.15 + 0.6 * k)); g.fillRect(x, pz(z), bw, pz(z + len) - pz(z));
      // grain: two soft lines along the board
      g.strokeStyle = css(COL.boardLo, 0.35); g.lineWidth = 2;
      for (let q = 0; q < 2; q++) { const gx = x + bw * (0.25 + 0.5 * r()); g.beginPath(); g.moveTo(gx, pz(z)); g.bezierCurveTo(gx + 6 * (r() - 0.5), pz(z + len * 0.4), gx + 6 * (r() - 0.5), pz(z + len * 0.7), gx, pz(z + len)); g.stroke(); }
      // the butt joint
      g.fillStyle = css(COL.seam, 0.75); g.fillRect(x, pz(z + len) - 1.5, bw, 3);
      z += len;
    }
    g.fillStyle = css(COL.seam, 0.85); g.fillRect(x - 1.5, 0, 3, Ht);
  }
  // the woven mat (席): cream weave, a teal border with a gold line inside it
  const R = S.rug, x0 = px(R.x0), x1 = px(R.x1), z0 = pz(R.z0), z1 = pz(R.z1), bd = px(F.x0 + R.border);
  g.fillStyle = "rgba(90,70,50,0.18)"; g.fillRect(x0 + 4, z0 + 6, x1 - x0, z1 - z0);     // a soft contact shadow line
  g.fillStyle = COL.mat; g.fillRect(x0, z0, x1 - x0, z1 - z0);
  g.strokeStyle = css(COL.matLine, 0.7); g.lineWidth = 2;
  for (let y = z0 + 6; y < z1; y += 9) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  g.fillStyle = COL.teal; g.fillRect(x0, z0, x1 - x0, bd); g.fillRect(x0, z1 - bd, x1 - x0, bd); g.fillRect(x0, z0, bd, z1 - z0); g.fillRect(x1 - bd, z0, bd, z1 - z0);
  g.strokeStyle = COL.gold; g.lineWidth = 5; g.strokeRect(x0 + bd + 8, z0 + bd + 8, x1 - x0 - 2 * bd - 16, z1 - z0 - 2 * bd - 16);
  g.strokeStyle = COL.tealDeep; g.lineWidth = 3; g.strokeRect(x0 + 1.5, z0 + 1.5, x1 - x0 - 3, z1 - z0 - 3);
});
/** the screen's silk panel: celadon, a teal border, gold cloud scrolls round a calm middle (canvas = the panel face) */
const screenTex = (w: number, h: number) => paint(1024, Math.round(1024 * h / w), (g, W, Ht) => {
  const s = W / w, r = rng(47);
  const gr = g.createLinearGradient(0, 0, 0, Ht); gr.addColorStop(0, "#bad6c6"); gr.addColorStop(1, COL.celadonLo);
  g.fillStyle = gr; g.fillRect(0, 0, W, Ht);
  for (let i = 0; i < 40; i++) blotch(g, W * r(), Ht * r(), 40 + 60 * r(), r() < 0.5 ? "#c4dccf" : "#98baa6", 0.12);
  // the teal border with gold lines either side
  const b = 0.11 * s;
  g.fillStyle = COL.teal; g.fillRect(0, 0, W, b); g.fillRect(0, Ht - b, W, b); g.fillRect(0, 0, b, Ht); g.fillRect(W - b, 0, b, Ht);
  g.strokeStyle = COL.gold; g.lineWidth = 6; g.strokeRect(b + 10, b + 10, W - 2 * b - 20, Ht - 2 * b - 20);
  g.lineWidth = 4; g.strokeRect(6, 6, W - 12, Ht - 12);
  // a row of small cloud scrolls along the border (gold, soft), on the teal band
  for (let x = b * 1.2; x < W - b; x += 0.26 * s) { cloud(g, x, b / 2, b * 0.26, 1, css(COL.goldHi, 0.8), 3); cloud(g, x + 0.13 * s, Ht - b / 2, b * 0.26, -1, css(COL.goldHi, 0.8), 3); }
  // big cloud clusters in the four corners of the field (the middle, where the king's head and body are, stays calm)
  const ink = css(COL.gold, 0.62);
  for (const [cx, cy, d] of [[0.2, 0.17, 1], [0.8, 0.17, -1], [0.16, 0.78, 1], [0.84, 0.78, -1]] as [number, number, number][]) {
    cloud(g, W * cx, Ht * cy, 0.075 * s, d, ink, 7);
    cloud(g, W * cx + d * 0.17 * s, Ht * cy + 0.07 * s, 0.05 * s, -d, ink, 6);
    cloud(g, W * cx - d * 0.06 * s, Ht * cy + 0.15 * s, 0.04 * s, d, ink, 5);
  }
  // a band of waves (水纹) along the foot, under the 榻 (hidden by the dais from the low cameras, seen from zhaoWide)
  g.strokeStyle = css(COL.gold, 0.45); g.lineWidth = 4;
  for (let k = 0; k < 3; k++) { const y = Ht - b - (0.06 + 0.07 * k) * s; g.beginPath(); for (let x = b; x <= W - b; x += 4) g.lineTo(x, y + 0.018 * s * Math.sin((x / s) * 18 + k)); g.stroke(); }
});
/** the window card: pale sky, the upright bars painted on it (canvas = the opening) */
const windowTex = () => {
  const Wn = S.window, w = Wn.x1 - Wn.x0, h = Wn.y1 - Wn.y0;
  return paint(512, Math.round(512 * h / w), (g, W, Ht) => {
    const gr = g.createLinearGradient(0, 0, 0, Ht); gr.addColorStop(0, COL.sky); gr.addColorStop(1, COL.skyLo);
    g.fillStyle = gr; g.fillRect(0, 0, W, Ht);
    blotch(g, W * 0.7, Ht * 0.35, W * 0.5, "#ffffff", 0.35);
    // a far pale tree branch, very soft (a day outside)
    g.strokeStyle = "rgba(150,170,160,0.35)"; g.lineWidth = 5; g.beginPath(); g.moveTo(W, Ht * 0.55); g.bezierCurveTo(W * 0.75, Ht * 0.5, W * 0.6, Ht * 0.6, W * 0.45, Ht * 0.48); g.stroke();
    const n = Wn.bars, bw = W / n * 0.42;
    for (let i = 0; i < n; i++) {
      const x = (W / n) * (i + 0.5);
      g.fillStyle = COL.bar; g.fillRect(x - bw / 2, 0, bw, Ht);
      g.fillStyle = COL.barHi; g.fillRect(x - bw / 2, 0, bw * 0.38, Ht);            // the lit face of the diagonal bar
      g.fillStyle = "rgba(60,46,34,0.55)"; g.fillRect(x + bw / 2 - 2, 0, 2, Ht); g.fillRect(x - bw / 2, 0, 2, Ht);
    }
    // the rails top and bottom inside the frame
    g.fillStyle = COL.bar; g.fillRect(0, 0, W, Ht * 0.05); g.fillRect(0, Ht * 0.95, W, Ht * 0.05);
  });
};
/** teal cloth (valance or drape): `folds` vertical folds, a gold line / hem; canvas = the piece's x-y extent */
const clothTex = (w: number, h: number, o: { folds: number; swags?: number; tie?: number; hem?: boolean; seed: number }) => paint(o.swags ? 2048 : 256, Math.max(64, Math.round((o.swags ? 2048 : 256) * h / w)), (g, W, Ht) => {
  const r = rng(o.seed), base = o.swags ? COL.valance : COL.drape;
  g.fillStyle = base; g.fillRect(0, 0, W, Ht);
  for (let i = 0; i < o.folds; i++) {
    const x = (W / o.folds) * (i + 0.3 + 0.4 * r()), fw = (W / o.folds) * 0.35;
    const gr = g.createLinearGradient(x - fw, 0, x + fw, 0); gr.addColorStop(0, css(COL.tealDeep, 0)); gr.addColorStop(0.5, css(COL.tealDeep, 0.55)); gr.addColorStop(1, css(COL.tealDeep, 0));
    g.fillStyle = gr; g.fillRect(x - fw, 0, 2 * fw, Ht);
    const gh = g.createLinearGradient(x + fw * 0.6, 0, x + fw * 1.6, 0); gh.addColorStop(0, css(COL.tealPale, 0)); gh.addColorStop(0.5, css(COL.tealPale, 0.4)); gh.addColorStop(1, css(COL.tealPale, 0));
    g.fillStyle = gh; g.fillRect(x + fw * 0.6, 0, fw, Ht);
  }
  if (o.swags) {   // the valance: swags (darker arcs), a cream piping on top, a gold fringe line at the bottom
    const sw = W / o.swags;
    for (let i = 0; i < o.swags; i++) { g.strokeStyle = css(COL.tealDeep, 0.7); g.lineWidth = 5; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(sw * (i + 0.5), Ht * (0.05 + 0.18 * k), sw * 0.48, Ht * 0.62, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); } }
    g.fillStyle = COL.mat; g.fillRect(0, 0, W, Ht * 0.1);
    g.fillStyle = COL.gold; g.fillRect(0, Ht * 0.86, W, Ht * 0.06);
    for (let x = 2; x < W; x += 6) g.fillRect(x, Ht * 0.92, 3, Ht * 0.08);
  }
  if (o.tie !== undefined) { const y = Ht * (1 - o.tie); g.fillStyle = COL.gold; g.fillRect(0, y - 7, W, 14); g.fillStyle = COL.goldHi; g.fillRect(0, y - 7, W, 4); }
  if (o.hem) { g.fillStyle = COL.gold; g.fillRect(0, Ht - 12, W, 6); }
});
/** the dais top: the mat with a teal border (x dais, z dais; canvas top = the dais' back edge) */
const daisTopTex = () => {
  const D = S.dais;
  return paint(1024, Math.round(1024 * (D.z1 - D.z0) / (D.x1 - D.x0)), (g, W, Ht) => {
    g.fillStyle = COL.wood; g.fillRect(0, 0, W, Ht);
    const m = 0.06 * W / (D.x1 - D.x0);
    g.fillStyle = COL.mat; g.fillRect(m, m, W - 2 * m, Ht - 2 * m);
    g.strokeStyle = css(COL.matLine, 0.7); g.lineWidth = 2;
    for (let y = m + 5; y < Ht - m; y += 8) { g.beginPath(); g.moveTo(m, y); g.lineTo(W - m, y); g.stroke(); }
    const b = 0.08 * W / (D.x1 - D.x0);
    g.strokeStyle = COL.teal; g.lineWidth = b; g.strokeRect(m + b / 2, m + b / 2, W - 2 * m - b, Ht - 2 * m - b);
    g.strokeStyle = COL.gold; g.lineWidth = 4; g.strokeRect(m + b + 6, m + b + 6, W - 2 * m - 2 * b - 12, Ht - 2 * m - 2 * b - 12);
  });
};
/** a wood side (the dais' front and ends): grain, a darker foot, a teal line under the top edge (canvas = 2.4 x 0.2 m) */
const daisSideTex = () => paint(1024, 96, (g, W, Ht) => {
  const r = rng(53);
  g.fillStyle = COL.wood; g.fillRect(0, 0, W, Ht);
  g.strokeStyle = css(COL.woodLo, 0.35); g.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = Ht * (0.25 + 0.6 * r()); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 3 * (r() - 0.5), W * 0.7, y + 3 * (r() - 0.5), W, y); g.stroke(); }
  g.fillStyle = COL.tealDeep; g.fillRect(0, Ht * 0.12, W, Ht * 0.1);
  g.fillStyle = COL.gold; g.fillRect(0, Ht * 0.22, W, 3);
  g.fillStyle = COL.woodLo; g.fillRect(0, Ht * 0.86, W, Ht * 0.14);
});
/** the 榻's sides: teal lacquer, a gold edge along the top, a gold line along the foot */
const taSideTex = () => paint(512, 48, (g, W, Ht) => {
  g.fillStyle = COL.ta; g.fillRect(0, 0, W, Ht);
  g.fillStyle = COL.gold; g.fillRect(0, 0, W, Ht * 0.18); g.fillRect(0, Ht * 0.84, W, Ht * 0.08);
  g.fillStyle = COL.goldHi; g.fillRect(0, 0, W, Ht * 0.06);
  g.strokeStyle = css(COL.gold, 0.7); g.lineWidth = 3;
  for (let x = W / 12; x < W; x += W / 6) { g.beginPath(); g.ellipse(x, Ht * 0.84, W / 30, Ht * 0.42, 0, Math.PI, 2 * Math.PI); g.stroke(); }   // 壸门 arches
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildZhao(K: Kit) {
  const group = new THREE.Group(); group.name = "zhao";
  const mat = (c: string, map: THREE.Texture | null = null) => K.flat(map ? "#ffffff" : c, { rough: 0.8, map });
  const mesh = (name: string, geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], into: THREE.Object3D = group, cast = true) => {
    const o = new THREE.Mesh(geo, m); o.name = name; o.castShadow = cast; o.receiveShadow = true; into.add(o); return o;
  };
  const box = (name: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: THREE.Material | THREE.Material[], into: THREE.Object3D = group, cast = true) =>
    mesh(name, boxG(x0, x1, y0, y1, z0, z1), m, into, cast);

  // ---- the floor (one painted plane; it runs on under the cameras south of the room, the boards continuing)
  const tFloor = floorTex();
  mesh("zhao.floor", worldUV(new THREE.PlaneGeometry(F.x1 - F.x0, F.z1 - F.z0 + 4).rotateX(-Math.PI / 2).translate((F.x0 + F.x1) / 2, 0, (F.z0 + F.z1 + 4) / 2), "xz", F.x0, F.x1, F.z0, F.z1), mat("", tFloor), group, false);

  // ---- the walls: north (painted, with the window's hole), east and west (with the doors), south. No shadows.
  const tWall = wallTex(), mWall = mat("", tWall), mPlaster = mat(COL.plaster);
  const north = new THREE.Group(), east = new THREE.Group(), west = new THREE.Group(), south = new THREE.Group();
  north.name = "zhao.wallN"; east.name = "zhao.wallE"; west.name = "zhao.wallW"; south.name = "zhao.wallS";
  group.add(north, east, west, south);
  const T = S.wall.thick, Wn = S.window;
  {
    const sh = new THREE.Shape([new THREE.Vector2(F.x0, 0), new THREE.Vector2(F.x1, 0), new THREE.Vector2(F.x1, H), new THREE.Vector2(F.x0, H)]);
    sh.holes.push(new THREE.Path([new THREE.Vector2(Wn.x0, Wn.y0), new THREE.Vector2(Wn.x0, Wn.y1), new THREE.Vector2(Wn.x1, Wn.y1), new THREE.Vector2(Wn.x1, Wn.y0)]));
    const g = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false }).translate(0, 0, F.z0 - T);
    mesh("zhao.wall.n", worldUV(g, "xy", F.x0, F.x1, 0, H), [mWall, mPlaster], north, false);
  }
  const sideWall = (into: THREE.Object3D, name: string, x: number, sx: number, d: { z: number; w: number; h: number }) => {
    const z0 = d.z - d.w / 2, z1 = d.z + d.w / 2, xa = sx > 0 ? x : x - T, xb = sx > 0 ? x + T : x;
    const piece = (k: string, y0: number, y1: number, za: number, zb: number) => mesh(name + k, worldUV(boxG(xa, xb, y0, y1, za, zb), "zy", F.z0, F.z0 + (F.x1 - F.x0), 0, H), mWall, into, false);
    piece("", 0, H, F.z0 - T, z0); piece("[2]", 0, H, z1, F.z1 + T); piece("[3]", d.h, H, z0, z1);
    // daylight beyond the door (unlit)
    mesh("zhao.door.light", new THREE.PlaneGeometry(d.w + 0.6, d.h + 0.4).rotateY(sx > 0 ? -Math.PI / 2 : Math.PI / 2).translate(x + sx * 0.6, (d.h + 0.4) / 2, d.z), new THREE.MeshBasicMaterial({ color: COL.daylight }), into, false);
  };
  sideWall(east, "zhao.wall.e", S.doorE.x, 1, S.doorE);
  sideWall(west, "zhao.wall.w", S.doorW.x, -1, S.doorW);
  mesh("zhao.wall.s", worldUV(boxG(F.x0 - T, F.x1 + T, 0, H, F.z1, F.z1 + T), "xy", F.x0, F.x1, 0, H), mWall, south, false);

  // ---- the lattice window: a pale wood frame round the opening (3 cm proud of the wall), the painted card inside
  {
    const f = Wn.frame, mF = mat(COL.winFrame), z0 = F.z0 - 0.01, z1 = F.z0 + 0.03;
    box("zhao.window.frame", Wn.x0 - f, Wn.x1 + f, Wn.y1, Wn.y1 + f, z0, z1, mF, north, false);
    box("zhao.window.frame[2]", Wn.x0 - f - 0.03, Wn.x1 + f + 0.03, Wn.y0 - f, Wn.y0, z0, z1 + 0.02, mF, north, false);   // the sill, 2 cm further out
    box("zhao.window.frame[3]", Wn.x0 - f, Wn.x0, Wn.y0, Wn.y1, z0, z1, mF, north, false);
    box("zhao.window.frame[4]", Wn.x1, Wn.x1 + f, Wn.y0, Wn.y1, z0, z1, mF, north, false);
    const card = mesh("zhao.window.light", new THREE.PlaneGeometry(Wn.x1 - Wn.x0 + 0.02, Wn.y1 - Wn.y0 + 0.02).translate((Wn.x0 + Wn.x1) / 2, (Wn.y0 + Wn.y1) / 2, F.z0 - 0.12), new THREE.MeshBasicMaterial({ map: windowTex() }), north, false);
    card.layers.set(NOINK); card.receiveShadow = false;
  }

  // ---- the teal valance along the top of the back wall and the two tied-back drapes
  {
    const V0 = S.valance, w = F.x1 - F.x0, h = V0.y1 - V0.y0;
    mesh("zhao.valance", worldUV(boxG(F.x0, F.x1, V0.y0, V0.y1, F.z0 - 0.01, F.z0 + 0.06), "xy", F.x0, F.x1, V0.y0, V0.y1), mat("", clothTex(w, h, { folds: 0, swags: 12, seed: 61 })), north, false);
    const top = V0.y0 + 0.05, bot = S.drapeBottom, tie = S.drapeTie;
    S.drapes.forEach((d, i) => {
      // the outer side (away from the window) stays straight; the inner side is gathered to the tie
      const outer = i === 0 ? d.x0 : d.x1, inner = i === 0 ? d.x1 : d.x0, s = i === 0 ? 1 : -1, tw = 0.10;
      const pts: [number, number][] = [[outer, bot], [inner, bot], [outer + s * (tw + 0.04), tie - 0.18], [outer + s * tw, tie], [outer + s * (tw + 0.03), tie + 0.3], [inner + s * 0.02, top - 0.5], [inner + s * 0.03, top], [outer, top]];
      if (i === 1) pts.reverse();
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.05, bevelEnabled: false }).translate(0, 0, F.z0 - 0.005);
      const x0 = Math.min(d.x0, d.x1), x1 = Math.max(d.x0, d.x1);
      mesh(`zhao.drape${i ? "[2]" : ""}`, worldUV(g, "xy", x0, x1, bot, top), mat("", clothTex(x1 - x0, top - bot, { folds: 3, tie: (tie - bot) / (top - bot), hem: true, seed: 63 + i })), north, false);
    });
  }

  // ---- the dais (a mat on top), the 榻 with its cushion, the screen
  const D = S.dais, TA = S.ta, C = S.cushion, Sc = S.screen;
  {
    const mSide = mat("", daisSideTex()), mTop = mat("", daisTopTex()), mBot = mat(COL.woodLo);
    const g = worldUV(boxG(D.x0, D.x1, 0, D.top, D.z0, D.z1), "xy", D.x0, D.x1, 0, D.top);
    // the top face gets the mat (its own uv: x across, z down the canvas), the ends the side painting along z
    const uv = g.attributes.uv as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (n.getY(i) > 0.5) uv.setXY(i, (p.getX(i) - D.x0) / (D.x1 - D.x0), 1 - (p.getZ(i) - D.z0) / (D.z1 - D.z0));
      else if (Math.abs(n.getX(i)) > 0.5) uv.setXY(i, (p.getZ(i) - D.z0) / (D.x1 - D.x0), p.getY(i) / D.top);
    }
    mesh("zhao.dais", g, [mSide, mSide, mTop, mBot, mSide, mSide]);
  }
  {
    const mSide = mat("", taSideTex()), mTop = mat(COL.ta);
    const g = boxG(TA.x0, TA.x1, D.top, TA.top, TA.z0, TA.z1);
    mesh("zhao.ta", g, [mSide, mSide, mTop, mTop, mSide, mSide]);
    box("zhao.pad", C.x - C.w / 2, C.x + C.w / 2, TA.top, C.top, C.z - C.d / 2, C.z + C.d / 2, mat(COL.cushion));
  }
  {
    const f = Sc.frame, mFr = mat(COL.frame), mGold = mat(COL.gold), zf0 = Sc.z - 0.045, zf1 = Sc.z + 0.012, yb = 0.18;
    // the silk panel: painted front, celadon back
    const pw = Sc.x1 - Sc.x0 - 2 * f + 0.02, ph = Sc.h - f - yb + 0.02;
    const panel = mesh("zhao.screen", new THREE.BoxGeometry(pw, ph, 0.03).translate((Sc.x0 + Sc.x1) / 2, yb - 0.01 + ph / 2, Sc.z - 0.015), [mat(COL.celadonLo), mat(COL.celadonLo), mat(COL.celadonLo), mat(COL.celadonLo), mat("", screenTex(pw, ph)), mat(COL.celadonLo)]);
    // no shadow falls on the screen: the seated king's shadow there read as a second dark figure in zhaoThrone and
    // filled the left 45 % of zhaoKing that the graphic layer needs (the cities, the arrow, the army)
    panel.receiveShadow = false;
    // the teal lacquer frame: two posts, a top rail and a bottom rail; gold caps on the posts
    for (const fr of [
      box("zhao.screen.frame", Sc.x0, Sc.x0 + f, 0, Sc.h + 0.04, zf0, zf1, mFr),
      box("zhao.screen.frame[2]", Sc.x1 - f, Sc.x1, 0, Sc.h + 0.04, zf0, zf1, mFr),
      box("zhao.screen.frame[3]", Sc.x0 + f - 0.01, Sc.x1 - f + 0.01, Sc.h - f, Sc.h, zf0 + 0.005, zf1 - 0.005, mFr),
      box("zhao.screen.frame[4]", Sc.x0 + f - 0.01, Sc.x1 - f + 0.01, yb - 0.08, yb, zf0 + 0.005, zf1 - 0.005, mFr),
    ]) fr.receiveShadow = false;
    for (const [k, x] of [["", Sc.x0 + f / 2], ["[2]", Sc.x1 - f / 2]] as [string, number][]) {
      box("zhao.screen.cap" + k, x - 0.05, x + 0.05, Sc.h + 0.04, Sc.h + 0.10, Sc.z - 0.065, Sc.z + 0.032, mGold);
      box("zhao.screen.foot" + k, x - 0.07, x + 0.07, 0, 0.12, Sc.z - Sc.foot / 2, Sc.z + Sc.foot / 2 - 0.02, mFr);
    }
  }

  // ---- daylight from the east: the key from the upper right front, a bright hemisphere
  lightRig(group, { dir: [0.55, 0.6, 0.55], k: 2.3, col: "#fff2dc", at: [ZX + 0.3, 0, -1.5], half: 5.5, hemi: ["#dfe6f4", "#a89a80", 1.0] });

  const walls: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [
    [north, (p) => p.z < F.z0 - 0.05], [east, (p) => p.x > F.x1 + 0.05], [west, (p) => p.x < F.x0 - 0.05], [south, (p) => p.z > F.z1 - 0.3],
  ];
  return {
    group,
    /** hides every wall (with everything on it) the camera stands behind */
    view(camPos: THREE.Vector3) { for (const [g, behind] of walls) g.visible = !behind(camPos); },
  };
}
export type ZhaoSet = ReturnType<typeof buildZhao>;
