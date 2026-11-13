// THE CORRIDOR (place "corridor", island x 100): a covered palace walkway at DAWN (PLAN 1, 7A). WP2's set; the exports
// are the contract of sets/index.ts: CORRIDOR_LOOK, CORRIDOR_PARAMS, buildCorridor(K) -> { group, view, animate, setParam }.
// Every place-number is layout/corridor.ts CORRIDOR_SET (colours, painting and small proportions live here).
//
// WHAT THERE IS (the camera looks -z down the walkway; west = screen left)
//   - THE JOKE: every bay is the same. Pillar k stands at z = bay0 - k * bay on both sides; the floor, the wall, the
//     ceiling, the lintel and the bench are ONE painted tile per bay, so bay 3 and bay 17 are pixel for pixel alike,
//     and the side corridor at the T-junction is built from the very same tiles;
//   - the floor: warm grey flags, a paler central lane, a threshold band under every pillar pair, a dark border at
//     the wall and a pale curb stone on the east edge (one texture per bay);
//   - the west wall: a red-brown dado with a gold lozenge, a step-pattern lattice window over warm paper, a small
//     lattice transom, a teal-and-gold frieze (one tile per bay, its posts behind the pillars);
//   - vermilion pillars (painted lacquer streaks, a gold band) on round stone plinths, black lacquer cross beams with
//     a painted band (teal, red, gold meander and clouds), a coffered ceiling (teal coffers, gold rings, red flowers);
//   - the east colonnade: a lacquer lintel, a lattice valance (挂落) under it, a bench rail (坐凳栏杆) between the
//     pillars, the eave soffit with painted rafters and round tile ends; beyond, a courtyard 0.36 m down (gravel,
//     lawn, round shrubs, blossoming plum trees) and its red wall; the dawn sky (peach to blue-violet, the sun's glow
//     in the east, far palace roofs painted on the dome);
//   - paper lanterns (a props-kit Part: glowing paper, own hull outline) in every second bay on both sides;
//   - THE T-JUNCTION: the west wall opens at bay `junction.k`; a side corridor of the same tiles runs off to -x and
//     ends at a lattice door; the walkway ends far away at another lattice door.
//   - the low warm sun from the east (a little ahead) lays the pillars' and the bench's shadows across the floor and
//     the west wall bay after bay; the shadow box covers the first 20 bays.
// INK / FLICKER: the lattice, the coffers, the rafters, the tile ends, the flags are PAINT; inked geometry is chunky
// (pillars 34 cm, beams 24 x 40 cm, the valance board 6 cm, the bench 10 cm); lanterns and plum blossoms are Parts
// (NOINK + hull) or NOINK. Seeded painting only; animate / setParam are pure functions of their arguments.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, Batch, type SkyStops } from "../../../kit/sets/okit";
import { CORRIDOR_SET as S, CX } from "../layout/corridor";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, ceilQuad, wallQuad, quad4, tileUV, lathe, shade, latticePaint, cloudScroll, tileEnds, addLantern, rockG, Part, wrapBlotch } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.32, 0.29, 0.31]], [-10, [0.4, 0.37, 0.41]], [6, [0.56, 0.5, 0.58]], [40, [0.5, 0.52, 0.68]], [90, [0.42, 0.46, 0.64]]],
  boxes: [{ az: -27, el: 20, rot: 0, w: 44, h: 18, soft: 14, col: [1.0, 0.8, 0.58] }],
};
/** DAWN: a low warm key from the east (screen right), blue-violet shade; the figures' gain under 1 */
export const CORRIDOR_LOOK: PlaceLook = {
  bg: "#3a3550",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 2.0, color: "#1e1a2c" },
  cast: {
    key: [0.62, 0.42, 0.66], tint: [1.0, 0.86, 0.7], tintK: 0.65, gain: 0.94, grad: 0.22, bodyGrad: 0.16, sideTint: [0.88, 0.9, 1.0],
    shade: [1.0, 0.94, 1.5], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.15, sheen: 0.12, lift: 0.03, contactLen: 0.3,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.4,
};
/** the per-frame dressing: dawn 0..1 (how far the dawn has come: the sun's strength and warmth) */
export const CORRIDOR_PARAMS: Record<string, ParamValue> = { dawn: 0.5 };

const COL = {
  stone: "#a99d92", stoneLo: "#8f847c", grout: "#7a706c", lane: "#bdb09c", border: "#7e7272", curb: "#c4b9a8", band: "#958a80",
  pillar: "#c23b2c", pillarLo: "#9a2c22", pillarHi: "#d65540", plinth: "#8e8884", plinthLo: "#76716e",
  lac: "#2e2a34", lacHi: "#3c3744", gold: "#dcaa44", goldDim: "#a8802e", teal: "#3a807a", tealLo: "#2c5e5a", green: "#3d9656", blue: "#3c6fb2", red: "#c43a2e",
  wood: "#8c3a2a", woodLo: "#6a2b20", paper: "#f2d9a8", paperHi: "#f8e6bf", dado: "#7c3426", plaster: "#d7c3a0",
  coffer: "#38726e", cofferFrame: "#2a3230", flower: "#d2463a",
  rafter: "#8a3428", soffit: "#386a66", tile: "#6a6672", tileLo: "#4e4a56",
  gravel: "#cbbd9f", gravelLo: "#b7a98a", lawn: "#7ea24e", lawnLo: "#6a8c40", path: "#d8ccb4", court: "#b8473a", courtLo: "#9c3a30", coping: "#5c5864",
  shrub: "#4f8a46", shrubLo: "#3e7038", bark: "#5a3e32", blossom: "#f0a0b8", blossomHi: "#fbc8d6",
  lantern: "#ffcf7c", lanternCap: "#2e2a30", tassel: "#c8322c",
};
/** the dawn sky by elevation (degrees) */
const SKY: SkyStops = [[-10, "#c9a890"], [0, "#f6c49a"], [6, "#f2b9a0"], [14, "#d7a8b8"], [30, "#9d9cc8"], [60, "#6f7ab8"], [90, "#5a64a6"]];
const BAY = S.bay, P = S.pillar, F = S.floor;
const pz = (k: number) => S.bay0 - k * BAY;
const KMIN = -3;                                         // pillars from k = -3 (behind the start) to S.bays

// ---------------------------------------------------------------------------------------------------- the paintings
/** THE FLOOR, one bay (u across the walkway x0 .. x1, v along one bay; the tile's top / bottom edges = the pillar
 *  lines): the wall border, square flags, the central lane of paler slabs in a running bond, the threshold band, the
 *  east curb */
const FW = F.x1 - F.x0;
const floorTex = () => paint(1024, Math.round(1024 * BAY / FW), (g, W, H) => {
  const mx = W / FW, X = (x: number) => (x - F.x0) * mx, r = rng(11), gr = 3;
  const flags = (x0: number, x1: number, y0: number, y1: number, nx: number, ny: number, base: string, bond = false) => {
    const sx = (x1 - x0) / nx, sy = (y1 - y0) / ny;
    for (let j = 0; j < ny; j++) for (let i = -1; i <= nx; i++) {
      const off = bond && j % 2 ? sx / 2 : 0, x = x0 + i * sx + off, y = y0 + j * sy;
      const xa = Math.max(x0, x), xb = Math.min(x1, x + sx); if (xb <= xa) continue;
      g.fillStyle = COL.grout; g.fillRect(xa, y, xb - xa, sy);
      g.fillStyle = shade(base, (r() - 0.5) * 0.12); g.fillRect(xa + gr / 2, y + gr / 2, xb - xa - gr, sy - gr);
      g.save(); g.beginPath(); g.rect(xa, y, xb - xa, sy); g.clip();
      for (let b = 0; b < 3; b++) blotch(g, xa + r() * (xb - xa), y + r() * sy, sx * (0.2 + 0.25 * r()), r() < 0.5 ? "#fff6ea" : "#3a3036", 0.07);
      g.fillStyle = "rgba(255,248,236,0.08)"; g.fillRect(xa, y, xb - xa, gr * 1.2);
      g.restore();
    }
  };
  const band = 0.22 * mx;                                   // the threshold band (half at each tile edge)
  g.fillStyle = COL.grout; g.fillRect(0, 0, W, H);
  flags(X(F.x0 + 0.26), X(CX - 0.62), band / 2 + 2, H - band / 2 - 2, 2, 4, COL.stone);
  flags(X(CX + 0.62), X(F.x1 - 0.28), band / 2 + 2, H - band / 2 - 2, 2, 4, COL.stone);
  flags(X(CX - 0.6), X(CX + 0.6), band / 2 + 2, H - band / 2 - 2, 2, 6, COL.lane, true);
  // the lane's edge lines (a darker stone kerb, 4 cm)
  g.fillStyle = COL.stoneLo; g.fillRect(X(CX - 0.64), 0, 0.04 * mx, H); g.fillRect(X(CX + 0.6), 0, 0.04 * mx, H);
  // the threshold band under the pillar line, a long slab with a carved meander, half at the top and half at the bottom
  for (const y0 of [-band / 2, H - band / 2]) {
    g.fillStyle = COL.band; g.fillRect(0, y0, W, band);
    g.strokeStyle = "rgba(60,48,50,0.35)"; g.lineWidth = 2.5;
    const s = band * 0.5;
    for (let x = X(CX - 0.6); x < X(CX + 0.6) - s; x += s * 1.25) { g.strokeRect(x, y0 + band * 0.25, s, band * 0.5); }
  }
  // the dark border at the wall and the pale curb on the east
  g.fillStyle = COL.border; g.fillRect(0, 0, X(F.x0 + 0.24), H);
  g.fillStyle = "rgba(255,240,220,0.12)"; g.fillRect(X(F.x0 + 0.2), 0, 3, H);
  g.fillStyle = COL.curb; g.fillRect(X(F.x1 - 0.26), 0, W - X(F.x1 - 0.26), H);
  g.fillStyle = "rgba(70,56,60,0.35)"; g.fillRect(X(F.x1 - 0.26), 0, 3, H);
  for (let y = 0; y < H; y += H / 3) { g.fillStyle = "rgba(70,56,60,0.3)"; g.fillRect(X(F.x1 - 0.26), y, W, 2.5); }
}, true);
/** THE WEST WALL, one bay (2.4 m) x S.wall.h: the posts at the tile's edges, the dado with a gold lozenge, the lattice
 *  window over warm paper, the small transom, the frieze */
const WH = S.wall.h;
const wallTex = () => paint(512, Math.round(512 * WH / BAY), (g, W, H) => {
  const m = W / BAY, py = (y: number) => (1 - y / WH) * H, r = rng(13);
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) wrapBlotch(g, W, H, r() * W, r() * H, 20 + 40 * r(), r() < 0.5 ? "#fff4e0" : "#a08a70", 0.08);
  // the frame: posts at both edges (behind the pillars), a sill rail and head rail
  const post = 0.16 * m, wd = COL.wood;
  g.fillStyle = wd; g.fillRect(0, 0, post / 2, H); g.fillRect(W - post / 2, 0, post / 2, H);
  // the dado: a red-brown panel with a recessed field and a gold lozenge
  g.fillStyle = COL.dado; g.fillRect(0, py(0.82), W, H - py(0.82));
  g.fillStyle = shade(COL.dado, -0.2); g.fillRect(post * 0.9, py(0.68), W - 1.8 * post, py(0.12) - py(0.68));
  g.strokeStyle = COL.goldDim; g.lineWidth = 3; g.strokeRect(post * 0.9, py(0.68), W - 1.8 * post, py(0.12) - py(0.68));
  const cx = W / 2, cy = (py(0.68) + py(0.12)) / 2, lw = 0.42 * m, lh = (py(0.12) - py(0.68)) * 0.36;
  g.fillStyle = COL.gold; g.beginPath(); g.moveTo(cx, cy - lh); g.lineTo(cx + lw / 2, cy); g.lineTo(cx, cy + lh); g.lineTo(cx - lw / 2, cy); g.closePath(); g.fill();
  g.fillStyle = COL.dado; g.beginPath(); g.moveTo(cx, cy - lh * 0.5); g.lineTo(cx + lw * 0.25, cy); g.lineTo(cx, cy + lh * 0.5); g.lineTo(cx - lw * 0.25, cy); g.closePath(); g.fill();
  g.fillStyle = wd; g.fillRect(0, py(0.9), W, py(0.82) - py(0.9));                                         // the sill rail
  // the window: the step lattice over warm paper, framed
  const wx0 = post * 0.95, wx1 = W - post * 0.95, wy0 = py(2.42), wy1 = py(0.94);
  latticePaint(g, wx0, wy0, wx1 - wx0, wy1 - wy0, { wood: COL.wood, woodLo: COL.woodLo, paper: COL.paper, paperHi: COL.paperHi, cell: 0.2 * m, frame: 0.05 * m, kind: "step" });
  g.fillStyle = wd; g.fillRect(0, py(2.52), W, py(2.42) - py(2.52));                                      // the head rail
  // the transom: a small diamond lattice
  latticePaint(g, wx0, py(2.92), wx1 - wx0, py(2.54) - py(2.92), { wood: COL.wood, woodLo: COL.woodLo, paper: COL.paper, cell: 0.13 * m, frame: 0.03 * m, kind: "diamond" });
  g.fillStyle = wd; g.fillRect(0, py(3.0), W, py(2.92) - py(3.0));
  // the frieze: teal with a gold line and gold cloud scrolls
  g.fillStyle = COL.teal; g.fillRect(0, 0, W, py(3.0));
  g.fillStyle = COL.gold; g.fillRect(0, py(3.0) - 4, W, 4); g.fillRect(0, py(3.44), W, 3);
  g.strokeStyle = COL.gold; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) cloudScroll(g, W * (0.14 + 0.24 * i), py(3.22), 0.08 * m, i % 2 ? 1 : -1);
}, true);
/** a PILLAR's skin (u round, v up from the plinth's top to its top): vermilion with lacquer streaks, a gold band */
const pillarTex = () => paint(128, 1024, (g, W, H) => {
  const y0 = 0.16, y1 = P.h, py = (y: number) => (1 - (y - y0) / (y1 - y0)) * H, r = rng(41);
  g.fillStyle = COL.pillar; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const x = r() * W, w = 3 + 9 * r(); g.fillStyle = r() < 0.5 ? "rgba(150,40,32,0.4)" : "rgba(222,92,70,0.22)"; g.fillRect(x, 0, w, H); g.fillRect(x - W, 0, w, H); }
  const b0 = py(2.74), b1 = py(2.6);
  g.fillStyle = COL.gold; g.fillRect(0, b0, W, b1 - b0);
  g.fillStyle = "#6e5222"; g.fillRect(0, b0, W, 3); g.fillRect(0, b1 - 3, W, 3);
  g.fillStyle = "rgba(255,236,180,0.35)"; g.fillRect(0, (b0 + b1) / 2 - 2, W, 4);
  g.fillStyle = "rgba(60,20,16,0.25)"; g.fillRect(0, py(0.4), W, H - py(0.4));                               // a darker foot (wear)
}, true);
/** a CROSS BEAM's front (3.35 m x 0.4 m): black lacquer, a painted band: teal field, a red-gold meander, gold clouds,
 *  green and blue lozenges at the ends (彩画) */
const BEAM_L = S.floor.x1 - S.floor.x0 + 0.01;
const beamTex = () => paint(1024, 128, (g, W, H) => {
  g.fillStyle = COL.lac; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.teal; g.fillRect(W * 0.18, H * 0.16, W * 0.64, H * 0.68);
  g.strokeStyle = COL.gold; g.lineWidth = 4; g.strokeRect(W * 0.18, H * 0.16, W * 0.64, H * 0.68);
  g.strokeStyle = COL.gold; g.lineWidth = 3.5;
  for (let i = 0; i < 6; i++) cloudScroll(g, W * (0.24 + 0.105 * i), H * 0.5, H * 0.18, i % 2 ? 1 : -1);
  // the ends: a red field with a green and a blue lozenge
  for (const [x0, x1] of [[0.02, 0.17], [0.83, 0.98]]) {
    g.fillStyle = COL.red; g.fillRect(W * x0, H * 0.16, W * (x1 - x0), H * 0.68);
    const cx = W * (x0 + x1) / 2, cy = H / 2, s = H * 0.3;
    for (const [dx, col] of [[-1, COL.green], [1, COL.blue]] as [number, string][]) { g.fillStyle = col; g.beginPath(); g.moveTo(cx + dx * s * 0.9, cy - s); g.lineTo(cx + dx * s * 0.9 + s, cy); g.lineTo(cx + dx * s * 0.9, cy + s); g.lineTo(cx + dx * s * 0.9 - s, cy); g.closePath(); g.fill(); }
    g.strokeStyle = COL.gold; g.lineWidth = 3; g.strokeRect(W * x0, H * 0.16, W * (x1 - x0), H * 0.68);
  }
  g.fillStyle = COL.goldDim; g.fillRect(0, H * 0.06, W, 3); g.fillRect(0, H * 0.92, W, 3);
});
/** the LINTEL along the east pillar tops (one bay along u, its height along v): lacquer with a red-and-teal band */
const lintelTex = () => paint(512, 64, (g, W, H) => {
  g.fillStyle = COL.lac; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.red; g.fillRect(W * 0.12, H * 0.22, W * 0.76, H * 0.56);
  g.fillStyle = COL.teal; g.fillRect(W * 0.3, H * 0.22, W * 0.4, H * 0.56);
  g.strokeStyle = COL.gold; g.lineWidth = 3; g.strokeRect(W * 0.12, H * 0.22, W * 0.76, H * 0.56); g.strokeRect(W * 0.3, H * 0.22, W * 0.4, H * 0.56);
  cloudScroll(g, W * 0.5, H * 0.5, H * 0.18, 1);
}, true);
/** the VALANCE (挂落) under the lintel, one bay along u: a fine lattice over the open air (painted dark-on-sky: the
 *  board is solid, its lattice is paint), a scalloped lower border */
const valanceTex = () => paint(512, 64, (g, W, H) => {
  g.fillStyle = "#e9c9a0"; g.fillRect(0, 0, W, H);
  latticePaint(g, 0, 0, W, H * 0.78, { wood: COL.wood, woodLo: COL.woodLo, paper: "#d8b890", paperHi: "#ecd2ac", cell: H * 0.26, frame: 4, kind: "step" });
  g.fillStyle = COL.wood; g.fillRect(0, H * 0.78, W, H * 0.22);
  g.fillStyle = COL.gold; for (let x = W / 16; x < W; x += W / 8) { g.beginPath(); g.arc(x, H * 0.89, H * 0.07, 0, 7); g.fill(); }
}, true);
/** the BENCH RAIL's face (one bay along u, 0..top along v): balusters between two rails, a lacquer panel below */
const benchTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = COL.wood; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.paper; g.fillRect(0, H * 0.22, W, H * 0.46);
  g.fillStyle = COL.wood; const n = 16; for (let i = 0; i < n; i++) g.fillRect((W * (i + 0.5)) / n - 5, H * 0.22, 10, H * 0.46);
  g.fillStyle = COL.woodLo; g.fillRect(0, H * 0.18, W, 5); g.fillRect(0, H * 0.68, W, 5);
  g.fillStyle = COL.dado; g.fillRect(0, H * 0.74, W, H * 0.26);
  g.strokeStyle = COL.goldDim; g.lineWidth = 2.5; for (let x = 0; x < W; x += W / 4) g.strokeRect(x + 10, H * 0.78, W / 4 - 20, H * 0.18);
}, true);
/** the COFFERED CEILING (one 0.6 m coffer per tile): a dark frame, a teal field, a gold ring, a red four-petal flower */
const cofferTex = () => paint(256, 256, (g, W) => {
  g.fillStyle = COL.cofferFrame; g.fillRect(0, 0, W, W);
  const f = W * 0.09; g.fillStyle = COL.coffer; g.fillRect(f, f, W - 2 * f, W - 2 * f);
  g.strokeStyle = COL.gold; g.lineWidth = 4; g.strokeRect(f + 6, f + 6, W - 2 * f - 12, W - 2 * f - 12);
  const c = W / 2; g.beginPath(); g.arc(c, c, W * 0.27, 0, 7); g.stroke();
  g.fillStyle = COL.flower;
  for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + Math.PI / 4; g.beginPath(); g.ellipse(c + Math.cos(a) * W * 0.1, c + Math.sin(a) * W * 0.1, W * 0.11, W * 0.06, a, 0, 7); g.fill(); }
  g.fillStyle = COL.gold; g.beginPath(); g.arc(c, c, W * 0.05, 0, 7); g.fill();
  for (const [x, y] of [[f, f], [W - f, f], [f, W - f], [W - f, W - f]]) { g.fillStyle = COL.gold; g.beginPath(); g.arc(x, y, W * 0.035, 0, 7); g.fill(); }
}, true);
/** the EAVE SOFFIT (u along the eave, one bay; v from the pillar line out): teal boards between red rafters */
const soffitTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = COL.soffit; g.fillRect(0, 0, W, H);
  const n = 12; for (let i = 0; i < n; i++) { const x = (W * (i + 0.5)) / n; g.fillStyle = COL.rafter; g.fillRect(x - 9, 0, 18, H); g.fillStyle = "rgba(255,220,180,0.25)"; g.fillRect(x - 9, 0, 4, H); }
}, true);
/** the FASCIA (u along the eave, one bay): round tile ends (瓦当) with cloud marks */
const fasciaTex = () => paint(512, 64, (g, W, H) => tileEnds(g, 0, 0, W, H, { n: 12, tile: "#8a8694", tileLo: "#4e4a56", mark: "#5e5a68" }), true);
/** the ROOF tiles seen from the courtyard (u along, v up the slope): ribs of round tiles */
const roofTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = COL.tile; g.fillRect(0, 0, W, H);
  const n = 8; for (let i = 0; i < n; i++) { const x = (W * (i + 0.5)) / n, gr = g.createLinearGradient(x - W / n / 2, 0, x + W / n / 2, 0); gr.addColorStop(0, css(COL.tileLo, 0.9)); gr.addColorStop(0.35, css("#8a8694", 0.6)); gr.addColorStop(0.7, css(COL.tile, 0)); gr.addColorStop(1, css(COL.tileLo, 0.8)); g.fillStyle = gr; g.fillRect(x - W / n / 2, 0, W / n, H); }
}, true);
/** the courtyard, one 4.8 m tile along z (u across from the curb to the wall, v along z): gravel by the curb, a
 *  stone path, lawn with soft tone, gravel at the far wall */
const CW = S.court.wallX - (F.x1 - CX);
const courtTex = () => paint(1024, Math.round(1024 * 4.8 / CW), (g, W, H) => {
  const m = W / CW, r = rng(17);
  g.fillStyle = COL.lawn; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), 0.4 * m * (0.5 + r()), r() < 0.5 ? COL.lawnLo : "#9cbc66", 0.3);
  g.fillStyle = COL.gravel; g.fillRect(0, 0, 1.3 * m, H); g.fillRect(W - 1.0 * m, 0, 1.0 * m, H);
  for (let i = 0; i < 500; i++) { g.fillStyle = css(r() < 0.5 ? COL.gravelLo : "#ddd1b6", 0.8); g.beginPath(); g.arc(1.3 * m * r(), H * r(), 1.5 + 2 * r(), 0, 7); g.fill(); }
  // the stone path along z, 1.1 m wide, of square slabs
  const px0 = 3.4 * m, pw = 1.1 * m, n = 4;
  for (let j = 0; j < n; j++) { g.fillStyle = shade(COL.path, (r() - 0.5) * 0.1); g.fillRect(px0 + 3, (H * j) / n + 3, pw - 6, H / n - 6); }
}, true);
/** the courtyard wall (one 4.8 m tile along, its height along v): red plaster, a grey plinth band */
const courtWallTex = () => paint(512, 256, (g, W, H) => {
  g.fillStyle = COL.court; g.fillRect(0, 0, W, H);
  const r = rng(19); for (let i = 0; i < 16; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 40 * r(), r() < 0.5 ? COL.courtLo : "#cc5a48", 0.25);
  g.fillStyle = "#7d7680"; g.fillRect(0, H * 0.84, W, H * 0.16);
  g.fillStyle = "rgba(40,30,40,0.3)"; g.fillRect(0, H * 0.84, W, 3);
}, true);

// ---------------------------------------------------------------------------------------------------- the builder
export function buildCorridor(K: Kit) {
  const group = new THREE.Group(); group.name = "corridor";
  const Mk = maker(K, group), B = new Batch();
  const mFloor = Mk.tex(floorTex(), 0.85), mWall = Mk.tex(wallTex(), 0.9), mPillar = Mk.tex(pillarTex(), 0.5);
  const mPlinth = Mk.flat(COL.plinth, 0.85), mLac = Mk.flat(COL.lac, 0.45), mBeam = Mk.tex(beamTex(), 0.5), mLintel = Mk.tex(lintelTex(), 0.5);
  const mValance = Mk.tex(valanceTex(), 0.8), mBench = Mk.tex(benchTex(), 0.75), mBenchTop = Mk.flat(COL.wood, 0.55), mCoffer = Mk.tex(cofferTex(), 0.85);
  const mSoffit = Mk.tex(soffitTex(), 0.85), mFascia = Mk.tex(fasciaTex(), 0.8), mRoof = Mk.tex(roofTex(), 0.85), mCurb = Mk.flat(COL.curb, 0.9);
  const zN = pz(KMIN) + 1.2, zS = S.end;                                         // the walkway's two ends (north far, south behind)
  const zA = Math.max(F.z1, zN);
  const uvFloor = (x: number, z: number): [number, number] => [(x - F.x0) / FW, (z - S.bay0) / BAY];
  const J = S.junction, jx1 = F.x0, jx0 = F.x0 - J.len;

  // =================================================================================================== floor, curb
  Mk.mesh("corridor.floor", levelQuad(F.x0, F.x1, zS, zA, 0, uvFloor), mFloor, { cast: false });
  Mk.mesh("corridor.curb", wallQuad([F.x1, zA], [F.x1, zS], S.court.y - 0.01, 0, { tileU: 0.6 }), mCurb, { cast: false });

  // =================================================================================================== the west wall
  const wallU = (z: number) => (S.bay0 - z) / BAY;
  const wx = CX - S.wall.x;
  Mk.mesh("corridor.wall.w", wallQuad([wx, zA], [wx, J.z0], 0, WH, { u0: wallU(zA), tileU: BAY }), mWall, { cast: false });
  Mk.mesh("corridor.wall.w", wallQuad([wx, J.z1], [wx, zS], 0, WH, { u0: wallU(J.z1), tileU: BAY }), mWall, { cast: false });
  // the end wall far away and the side corridor's end (the same wall tile: a lattice bay)
  Mk.mesh("corridor.wall.end", wallQuad([F.x0, zS], [F.x1, zS], 0, WH, { u0: 0, tileU: BAY }), mWall, { cast: false });

  // =================================================================================================== pillars, plinths, beams
  const plinth = lathe([[0, 0], [0.27, 0], [0.27, 0.05], [0.25, 0.1], [0.215, 0.15], [0.19, 0.165], [0, 0.165]], 28);
  for (let k = KMIN; k <= S.bays; k++) {
    const z = pz(k);
    for (const s of [-1, 1]) {
      const x = CX + s * P.x;
      B.add(mPlinth, plinth.clone().translate(x, 0, z));
      B.add(mPillar, new THREE.CylinderGeometry(P.d / 2, P.d / 2, P.h - 0.15, 32, 1, false).translate(x, 0.15 + (P.h - 0.15) / 2, z));
    }
    // the cross beam: lacquer, the painted band on both faces
    const beam = new THREE.Mesh(boxG(F.x0 - 0.005, F.x1 + 0.005, S.roof, S.ceil + 0.005, z - 0.12, z + 0.12), [mLac, mLac, mLac, mLac, mBeam, mBeam]);
    beam.name = "corridor.beam"; beam.castShadow = true; beam.receiveShadow = true; group.add(beam);
  }
  B.flush(group, "corridor.pillar");
  // the east lintel, the valance under it, the bench rail (long pieces, one tile per bay)
  const ex = CX + P.x;
  Mk.mesh("corridor.lintel", tileUV(boxG(ex - 0.12, ex + 0.12, 2.84, S.roof, zS, zA), BAY, S.roof - 2.84, 0, 2.84), mLintel);
  Mk.mesh("corridor.valance", tileUV(boxG(ex - 0.03, ex + 0.03, 2.54, 2.84, zS, zA), BAY, 0.3, 0, 2.54), mValance);
  const Bt = S.bench.top, Bd = S.bench.d;
  Mk.mesh("corridor.bench", tileUV(boxG(ex - 0.05, ex + 0.05, 0, Bt - 0.06, zS, zA), BAY, Bt - 0.06, 0, 0), mBench);
  Mk.mesh("corridor.bench.top", boxG(ex - Bd / 2, ex + Bd / 2, Bt - 0.065, Bt, zS, zA), mBenchTop);

  // =================================================================================================== ceiling, eave, roof
  Mk.mesh("corridor.ceiling", ceilQuad(F.x0, ex + 0.2, zS, zA, S.ceil, (x, z) => [x / 0.6, z / 0.6]), mCoffer, { cast: false });
  const E = S.eave, eX = CX + E.x;
  Mk.mesh("corridor.soffit", quad4(new THREE.Vector3(ex + 0.2, S.ceil, zA), new THREE.Vector3(ex + 0.2, S.ceil, zS), new THREE.Vector3(eX, E.y, zS), new THREE.Vector3(eX, E.y, zA), (zA - zS) / BAY, 1), mSoffit, { cast: false });
  Mk.mesh("corridor.fascia", tileUV(boxG(eX - 0.04, eX + 0.04, E.y - 0.16, E.y + 0.06, zS, zA), BAY, 0.22, 0, E.y - 0.16), [mFascia, mLac, mLac, mLac, mLac, mLac]);
  // the roof's top (seen from the courtyard), up to the ridge over the west wall
  Mk.mesh("corridor.roof", quad4(new THREE.Vector3(eX + 0.06, E.y + 0.06, zA), new THREE.Vector3(eX + 0.06, E.y + 0.06, zS), new THREE.Vector3(wx - 0.3, S.ceil + 1.4, zS), new THREE.Vector3(wx - 0.3, S.ceil + 1.4, zA), (zA - zS) / 1.2, 3), mRoof, { cast: true });

  // =================================================================================================== the side corridor (T-junction)
  {
    const zc0 = J.z0, zc1 = J.z1, xs = jx0, xe = jx1;
    const uvSide = (x: number, z: number): [number, number] => [(z - zc1) / (zc0 - zc1) * 0.62 + 0.19, (x - xe) / BAY];
    Mk.mesh("corridor.side.floor", levelQuad(xs, xe, zc1, zc0, 0, uvSide), mFloor, { cast: false });
    Mk.mesh("corridor.side.wallN", wallQuad([xe, zc0], [xs, zc0], 0, WH, { u0: 0, tileU: BAY }), mWall, { cast: false });    // faces -z
    Mk.mesh("corridor.side.wallS", wallQuad([xs, zc1], [xe, zc1], 0, WH, { u0: 0, tileU: BAY }), mWall, { cast: false });    // faces +z
    Mk.mesh("corridor.side.end", wallQuad([xs, zc0], [xs, zc1], 0, WH, { u0: 0.04, tileU: BAY * 1.16 }), mWall, { cast: false }); // faces +x
    Mk.mesh("corridor.side.ceiling", ceilQuad(xs, xe, zc1, zc0, S.ceil, (x, z) => [x / 0.6, z / 0.6]), mCoffer, { cast: false });
    for (let x = xe - BAY; x > xs + 0.3; x -= BAY) {
      const bm = new THREE.Mesh(boxG(x - 0.12, x + 0.12, S.roof, S.ceil + 0.005, zc1, zc0), [mBeam, mBeam, mLac, mLac, mLac, mLac]);
      bm.name = "corridor.side.beam"; bm.castShadow = bm.receiveShadow = true; group.add(bm);
    }
  }

  // =================================================================================================== the lanterns
  {
    const Lp = new Part(K), lm = { paper: Mk.basic(COL.lantern), cap: Mk.flat(COL.lanternCap, 0.5), tassel: Mk.flat(COL.tassel, 0.8) };
    const Ln = S.lantern;
    for (let k = KMIN; k < S.bays; k++) {
      if (((k % Ln.every) + Ln.every) % Ln.every !== 0 || k < 4 || k === S.junction.k) continue;      // none over the creep's start or the peek pillar (a cut-off lantern in the frame's corner)
      const z = pz(k) - BAY / 2;
      for (const s of [-1, 1]) addLantern(Lp, lm, CX + s * Ln.x, Ln.y, z, Ln.h, S.ceil - Ln.y);
    }
    // the side corridor's two
    for (const x of [jx1 - BAY * 0.5, jx1 - BAY * 2.5]) addLantern(Lp, lm, x, Ln.y, (J.z0 + J.z1) / 2, Ln.h, S.ceil - Ln.y);
    Lp.into(group, "corridor.lanterns", { cast: false });
  }

  // =================================================================================================== the courtyard
  const C = S.court, cy = C.y, cwx = CX + C.wallX;
  {
    const uvC = (x: number, z: number): [number, number] => [(x - F.x1) / CW, z / 4.8];
    Mk.mesh("corridor.court", levelQuad(F.x1, cwx, zS - 6, zA + 6, cy, uvC), Mk.tex(courtTex(), 0.95), { cast: false });
    Mk.mesh("corridor.court.wall", wallQuad([cwx, zS - 6], [cwx, zA + 6], cy, cy + C.wallH, { u0: 0, tileU: 4.8 }), Mk.tex(courtWallTex(), 0.9), { cast: false });
    Mk.mesh("corridor.court.coping", tileUV(boxG(cwx - 0.25, cwx + 0.3, cy + C.wallH - 0.02, cy + C.wallH + 0.22, zS - 6, zA + 6), 0.6, 0.24), Mk.tex(roofTex(), 0.85));
    // round shrubs along the lawn (one per bay, the same in every bay) and a plum tree in blossom every fourth bay
    const mShrub = Mk.flat(COL.shrub, 0.9), mBark = Mk.flat(COL.bark, 0.85), BS = new Batch();
    const shrub = rockG(23, 0.9, 0.7, 0.8, 2, 0.05);
    const blossom = Mk.flat(COL.blossom, 0.8), blossomHi = Mk.flat(COL.blossomHi, 0.8);
    for (let k = KMIN; k <= S.bays; k++) {
      const z = pz(k) - BAY / 2;
      BS.add(mShrub, shrub.clone().translate(CX + 3.1, cy, z));
      if (k % 4 === 1) {
        const x = CX + 6.2, t0 = new THREE.Vector3(x, cy, z);
        const pts = [t0, new THREE.Vector3(x + 0.15, cy + 1.2, z - 0.1), new THREE.Vector3(x - 0.2, cy + 2.1, z + 0.15)];
        for (let i = 0; i + 1 < pts.length; i++) BS.add(mBark, barG(pts[i], pts[i + 1], 0.13 - i * 0.04, 0.09 - i * 0.03));
        BS.add(mBark, barG(pts[1], new THREE.Vector3(x + 0.9, cy + 2.0, z - 0.3), 0.07, 0.04));
        const r = rng(100 + k);
        for (let i = 0; i < 7; i++) {
          const c = new THREE.Vector3(x - 0.6 + 1.5 * r(), cy + 1.9 + 0.9 * r(), z - 0.6 + 1.2 * r());
          BS.add(i % 2 ? blossom : blossomHi, rockG(200 + k * 7 + i, 0.8 + 0.4 * r(), 0.6 + 0.3 * r(), 0.8 + 0.4 * r(), 1, 0).translate(c.x, c.y, c.z));
        }
      }
    }
    BS.flush(group, "corridor.court.plants");
  }

  // =================================================================================================== the sky
  group.add(skyDome(new THREE.Vector3(CX, 0, -20), SKY, (g, W, H) => {
    // the sun's glow in the east (azimuth of the key light: u 0.576), far palace roofs along the horizon
    const elY = (el: number) => ((90 - el) / 180) * H, uSun = 0.576;
    for (const dx of [0, -W, W]) { const x = uSun * W + dx; g.save(); g.translate(x, elY(20)); g.scale(2.2, 1); const R = H * 0.12, gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, "rgba(255,236,190,0.95)"); gr.addColorStop(0.3, "rgba(255,206,150,0.5)"); gr.addColorStop(1, "rgba(255,190,150,0)"); g.fillStyle = gr; g.fillRect(-R, -R, 2 * R, 2 * R); g.restore(); }
    const r = rng(29);
    for (let i = 0; i < 40; i++) {
      const x = W * r(), w = W * (0.015 + 0.03 * r()), h = H * (0.012 + 0.02 * r()), y0 = elY(0.5 + 2.5 * r());
      g.fillStyle = css(mix("#6c5a78", "#b88c94", r() * 0.5), 0.9);
      g.fillRect(x - w * 0.4, y0 - h, w * 0.8, h);
      g.beginPath(); g.moveTo(x - w * 0.75, y0 - h); g.quadraticCurveTo(x - w * 0.3, y0 - h * 1.25, x, y0 - h * 1.9); g.quadraticCurveTo(x + w * 0.3, y0 - h * 1.25, x + w * 0.75, y0 - h); g.closePath(); g.fill();
    }
  }));

  // =================================================================================================== the light
  const L = lightRig(group, { dir: [0.82, 0.38, -0.42], k: 2.0, col: "#ffcf9a", at: [CX, 0, -14], half: 22, hemi: ["#a8aac4", "#7a6862", 1.3], point: { col: "#ffc070", k: 0.8, at: [CX + 0.95, 2.3, pz(4) - 1.2], dist: 4 } });
  const warm = new THREE.Color("#ffcf9a"), pale = new THREE.Color("#ffe6cc"), deep = new THREE.Color("#ffad70");

  // the walls the camera stands behind: the end walls and the side corridor's walls are seen from inside only
  // (the ink pass draws back faces too: a one-sided wall seen from behind must be hidden, never left to culling)
  const hideable: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "corridor.side.wallN") hideable.push([o, (p) => p.z > J.z0 + 0.05]);
    if (o.name === "corridor.side.wallS") hideable.push([o, (p) => p.z < J.z1 - 0.05]);
    if (o.name === "corridor.side.end") hideable.push([o, (p) => p.x < jx0 - 0.05]);
    if (o.name === "corridor.wall.w") hideable.push([o, (p) => p.x < wx - 0.05]);
    if (o.name === "corridor.wall.end") hideable.push([o, (p) => p.z < zS - 0.05]);
    if (o.name === "corridor.court.wall") hideable.push([o, (p) => p.x > cwx + 0.05]);
  });
  return {
    group,
    view(cam: THREE.Vector3) { for (const [o, behind] of hideable) o.visible = !behind(cam); },
    animate(t: number) { void t; },
    setParam(name: string, v: ParamValue) {
      if (name === "dawn") {
        const k = Math.max(0, Math.min(1, Number(v)));
        L.key.intensity = 1.6 + 1.6 * k;
        L.key.color.copy(deep).lerp(k < 0.5 ? warm : pale, k < 0.5 ? k * 2 : (k - 0.5) * 2);
        L.hemi.intensity = 1.1 + 0.4 * k;
      }
    },
  };
}
/** a tapered round bar (a branch) */
const barG = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, 10, 1, false);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
