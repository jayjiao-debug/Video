// THE TABLE (place "table", island x 300): the flashback tableaux on a sand table in a small dark room (PLAN 1, 7C, 7E;
// like Hongmen's card set). WP2's set; the exports are the contract of sets/index.ts: TABLE_LOOK, TABLE_PARAMS,
// buildTable(K) -> { group, view, animate, setParam }. Every place-number is layout/table.ts.
//
// WHAT THERE IS
//   - the room: dark plank floor, deep teal plaster walls between wooden posts, a back wall of shelves with scrolls and
//     slip bundles (painted), a silk map on the west wall, a bronze lamp hanging over the table (its glow and the
//     place's point light make the warm pool the tableau sits in); the rest of the room falls off into the dark;
//   - THE SAND TABLE: a dark wood frame with a raised rim, an apron with painted cloud bands, four chunky legs; on it
//     one of three tableaux (param tableau), each a modelled miniature with painted ground:
//       "sea"       the COAST (之罘): beach, wet sand, rocks, a pine headland on the left, the sea (animated waves) and
//                   the GIANT FISH breaching offshore. bolt 0..1: 0 = no bolt; 0 .. 0.55 the bolt flies from the shore
//                   mark to the fish, 0.55 hit: a cartoon starburst pops, the fish jerks, rolls belly-up (X eyes) and
//                   floats with the bolt stuck in it. (No boat: 史记 has him wait along the coast.)
//       "taishan"   泰山: a mountain with cliffs and the winding stair to the summit gate; the PINE on its ledge (the
//                   tiny emperor shelters under it); grey clouds hung on threads; rain 0..1. hat 0..1: the official's
//                   hat (五大夫) pops onto the pine's crown (0 .. 0.35 the pop with an overshoot and a sparkle).
//       "xiangshan" 湘山: an island mountain in the lake, a forest of little cone trees, the red shrine on the summit,
//                   a boat on the lake; storm 0..1 (dark clouds, slanting rain, the waves and the boat tilting, a small
//                   lightning bolt now and then); bare 0..1: the trees go one by one and the slopes turn red.
//   - rain 0..1 rains on any tableau (the storm brings its own).
// INK / FLICKER: the tableau pieces (fish, pines, hat, bolt, boat, shrine, trees) are props-kit Parts (NOINK + their own
// hull); rain, clouds, the starburst and the lightning are NOINK; the ground and the sea are painted. Seeded painting
// only; animate / setParam are pure functions of their arguments.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, Batch, type G2 } from "../../../kit/sets/okit";
import { TABLE_SET as S, TABLE, BX } from "../layout/table";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, ceilQuad, wallQuad, tileUV, lathe, shade, cloudScroll, rockG, terrainG, bump, smooth01, starTex, makeRain, glowSprite, Part, NOINK, wrapBlotch, boardsTex } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.34, 0.32, 0.32]], [-12, [0.42, 0.4, 0.4]], [6, [0.52, 0.5, 0.5]], [40, [0.56, 0.53, 0.52]], [90, [0.54, 0.5, 0.5]]],
  boxes: [{ az: 90, el: 72, rot: 0, w: 30, h: 20, soft: 14, col: [1.0, 0.88, 0.7] }],
};
/** a dark room, one warm lamp over the table */
export const TABLE_LOOK: PlaceLook = {
  bg: "#17141c",
  ao: { aoRadius: 0.35, distanceFalloff: 1.0, intensity: 1.9, color: "#1a181c" },
  cast: {
    key: [0.1, 0.8, 0.6], tint: [1.0, 0.88, 0.72], tintK: 0.65, gain: 0.9, grad: 0.24, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
    shade: [1.06, 0.9, 1.5], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.14, lift: 0.03, contactLen: 0.3,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.45,
};
/** the per-frame dressing: tableau "sea" | "taishan" | "xiangshan"; bare 0..1 (湘山's trees gone, the earth red); rain
 *  0..1; storm 0..1; bolt 0..1 (the coast: the bolt's flight, the hit at 0.55, the fish belly-up); hat 0..1 (泰山: the
 *  official's hat pops onto the pine); pieces 1 | 0 (0 hides the set's own fish, bolt, hat and boat, for a shot that puts
 *  WP3's props on the tableau instead: never both) */
export const TABLE_PARAMS: Record<string, ParamValue> = { tableau: "sea", bare: 0, rain: 0, storm: 0, bolt: 0, hat: 0, pieces: 1 };

const COL = {
  floor: "#52443c", floorLo: "#40362f", wall: "#3a474c", wallLo: "#30393e", post: "#544036", wood: "#5a4232", woodLo: "#42322a", woodHi: "#70584a", rim: "#3c302a",
  shelf: "#463830", scroll: "#e8d8b0", scrollLo: "#c8b488", slip: "#d8c48c", silk: "#e2cfa0",
  bronze: "#b08a3e", bronzeLo: "#7a5c28", flame: "#ffd27a",
  sand: "#e4d2a8", sandLo: "#d0bc90", wet: "#b8a07c", sea: "#2f86b8", seaLo: "#1f6694", seaHi: "#6ab6dc", foam: "#f2f6f8",
  rock: "#9c948c", rockLo: "#7c746e", grass: "#78a848", grassLo: "#5e8c3a", pine: "#3d7a46", pineLo: "#2e6238", bark: "#6a4a36",
  cliff: "#a49a8e", path: "#efe2c0", gate: "#c8402e",
  fish: "#4a86b8", fishBelly: "#f2e6c8", fin: "#e8693a", eye: "#fbfbf6", pupil: "#1e1a22",
  hat: "#2a2630", hatBand: "#c8322c", boltShaft: "#8a6a44", boltHead: "#c8ccd4", fletch: "#c8322c",
  lake: "#2c6e86", lakeHi: "#5aa0b8", lakeStorm: "#1f4a5e", forest: "#3e8a48", forestLo: "#2f6e3a", red: "#b44a32", redLo: "#8e3624",
  shrine: "#c8402e", shrineRoof: "#3a3640", boat: "#8a5a36", sail: "#f0e2c0", sailBand: "#c8322c",
  cloud: "#cfd4dc", cloudDark: "#5e6470", thread: "#2a2630", bolt: "#fff2a0",
};
const T = S.table, TOP = T.top, IN = 0.06;                     // the board inside the rim
const bx0 = T.x0 + IN, bx1 = T.x1 - IN, bz0 = T.z0 + IN, bz1 = T.z1 - IN;
const W_ = S.water, WL = W_ - TOP;              // the water's height over the board

// ---------------------------------------------------------------------------------------------------- the room's paintings
/** the back wall's shelves (one 2 m bay): three shelves of rolled scrolls and slip bundles, wooden uprights */
const shelfTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(71);
  g.fillStyle = COL.wallLo; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.shelf; g.fillRect(0, 0, W * 0.04, H); g.fillRect(W * 0.96, 0, W * 0.04, H); g.fillRect(W * 0.48, 0, W * 0.04, H);
  for (const y of [0.08, 0.36, 0.64, 0.92]) { g.fillStyle = COL.shelf; g.fillRect(0, H * y - 6, W, 12); g.fillStyle = "rgba(255,230,190,0.18)"; g.fillRect(0, H * y - 6, W, 3); }
  for (let row = 0; row < 3; row++) {
    const yb = H * (0.36 + row * 0.28) - 6, top = yb - H * 0.24;
    for (let x = W * 0.05; x < W * 0.95; ) {
      if (Math.abs(x - W * 0.5) < W * 0.03) { x += W * 0.04; continue; }
      if (r() < 0.55) {                                   // a stack of scrolls seen end-on
        const rr = 9 + 5 * r(), n = 2 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) for (let q = 0; q <= k; q++) { const cx = x + rr + q * rr * 2 + (n - 1 - k) * rr, cy = yb - rr - (n - 1 - k) * rr * 1.7; g.fillStyle = COL.scroll; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); g.strokeStyle = COL.scrollLo; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr * 0.5, 0, 7); g.stroke(); }
        x += rr * 2 * n + 8;
      } else {                                            // a slip bundle standing, tied with a red cord
        const w = 26 + 14 * r(), h = (yb - top) * (0.6 + 0.35 * r());
        g.fillStyle = COL.slip; g.fillRect(x, yb - h, w, h);
        g.strokeStyle = "rgba(120,96,56,0.6)"; g.lineWidth = 1.5; for (let k = 4; k < w; k += 5) { g.beginPath(); g.moveTo(x + k, yb - h); g.lineTo(x + k, yb); g.stroke(); }
        g.fillStyle = "#c8322c"; g.fillRect(x, yb - h * 0.6, w, 4);
        x += w + 6;
      }
    }
  }
}, true);
/** the plaster wall with posts (one 2 m bay along u, the wall's height along v) */
const wallTex = () => paint(256, 384, (g, W, H) => {
  g.fillStyle = COL.wall; g.fillRect(0, 0, W, H);
  const r = rng(73); for (let i = 0; i < 12; i++) wrapBlotch(g, W, H, W * r(), H * r(), 20 + 30 * r(), r() < 0.5 ? COL.wallLo : "#3a5a68", 0.3);
  g.fillStyle = COL.post; g.fillRect(0, 0, W * 0.06, H); g.fillRect(W * 0.94, 0, W * 0.06, H);
  g.fillStyle = COL.post; g.fillRect(0, H * 0.78, W, H * 0.03); g.fillRect(0, 0, W, H * 0.04);
}, true);
/** the silk map on the west wall: a pale silk with rivers, mountains and walls in ink and red */
const mapTex = () => paint(512, 384, (g, W, H) => {
  g.fillStyle = COL.silk; g.fillRect(0, 0, W, H);
  const r = rng(75);
  g.strokeStyle = "rgba(60,110,150,0.8)"; g.lineWidth = 4;
  for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(0, H * (0.3 + 0.35 * k)); for (let x = 0; x <= W; x += 16) g.lineTo(x, H * (0.3 + 0.35 * k) + 22 * Math.sin(x * 0.02 + k * 2)); g.stroke(); }
  g.fillStyle = "rgba(80,70,60,0.7)"; for (let i = 0; i < 14; i++) { const x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x - 12, y + 8); g.lineTo(x, y - 12); g.lineTo(x + 12, y + 8); g.closePath(); g.fill(); }
  g.strokeStyle = "rgba(180,50,40,0.8)"; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(W * 0.1, H * 0.12); g.lineTo(W * 0.9, H * 0.18); g.stroke(); g.setLineDash([]);
  g.strokeStyle = "#6a4a30"; g.lineWidth = 10; g.strokeRect(0, 0, W, H);
});
/** the table's apron (one 1.1 m bay along u): dark wood with a red-and-gold cloud band */
const apronTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = COL.wood; g.fillRect(0, 0, W, H);
  g.fillStyle = "#7c5244"; g.fillRect(0, H * 0.25, W, H * 0.5);
  g.strokeStyle = "#c8a058"; g.lineWidth = 4; g.strokeRect(-4, H * 0.25, W + 8, H * 0.5);
  g.lineWidth = 3.5; for (let i = 0; i < 3; i++) cloudScroll(g, W * (0.18 + 0.32 * i), H * 0.5, H * 0.16, i % 2 ? 1 : -1);
}, true);

// ---------------------------------------------------------------------------------------------------- the tableaux' grounds
/** a top-down painting of a tableau's ground over the board (canvas top = bz0, the far side) */
const groundPaint = (fn: (g: G2, k: { W: number; H: number; px: (x: number) => number; pz: (z: number) => number; s: number }) => void) => {
  const W = 1024, H = Math.round(1024 * (bz1 - bz0) / (bx1 - bx0));
  return paint(W, H, (g) => fn(g, { W, H, px: (x) => ((x - bx0) / (bx1 - bx0)) * W, pz: (z) => ((z - bz0) / (bz1 - bz0)) * H, s: W / (bx1 - bx0) }));
};
// ---- the coast: the shoreline runs across the board (z of the shore at x), a headland on the left
const shoreZ = (x: number) => -0.14 + 0.07 * Math.sin((x - BX) * 3.1 + 0.6) + 0.04 * Math.sin((x - BX) * 7.3);
const coastH = (x: number, z: number) => {
  const d = z - shoreZ(x);                                                  // > 0: on land (toward the camera)
  let h = -0.014 + 0.05 * smooth01(-0.05, 0.22, d) + 0.012 * Math.sin(x * 9) * smooth01(0.1, 0.3, d);
  h += bump(x, z, BX - 0.82, -0.38, 0.16, 0.24, 0.3, 2.2);                  // the headland
  h += bump(x, z, BX - 0.6, 0.3, 0.03, 0.3, 0.12);                          // a dune
  return Math.max(-0.02, h);
};
const coastTex = () => groundPaint((g, k) => {
  const r = rng(81);
  for (let py = 0; py < k.H; py += 2) for (let px = 0; px < k.W; px += 2) {
    const x = bx0 + (px / k.W) * (bx1 - bx0), z = bz0 + (py / k.H) * (bz1 - bz0), h = coastH(x, z), d = z - shoreZ(x);
    // by height over the board: under the water (never seen), the foam line, the wet band, sand, grass on the heights
    const wl = h - WL, rgb = (c: [number, number, number]) => `rgb(${c.map((v) => v | 0).join(",")})`;
    void d;
    let c: string;
    if (h > 0.09) c = h > 0.13 ? COL.grassLo : COL.grass;
    else if (wl < -0.002) c = COL.wet; else if (wl < 0.004) c = COL.foam; else if (wl < 0.012) c = COL.wet;
    else if (wl < 0.022) c = rgb(mix(COL.wet, COL.sand, (wl - 0.012) / 0.01)); else c = COL.sand;
    g.fillStyle = c; g.fillRect(px, py, 2, 2);
  }
  for (let i = 0; i < 90; i++) blotch(g, k.W * r(), k.H * r(), 6 + 16 * r(), r() < 0.5 ? COL.sandLo : "#f2e0ae", 0.2);
  for (let i = 0; i < 160; i++) { g.fillStyle = css(COL.rockLo, 0.5); g.beginPath(); g.arc(k.W * r(), k.H * (0.4 + 0.6 * r()), 1 + 1.5 * r(), 0, 7); g.fill(); }
});
/** the sea's surface (repeats; scrolled toward the shore by animate): blue with paler wave lines and white crests */
const seaTex = (base: string, lo: string, hi: string) => paint(512, 512, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, lo); gr.addColorStop(0.5, base); gr.addColorStop(1, lo); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(83);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
    const x = (i + (j % 2) * 0.5) * W / 4, y = (j + 0.5) * H / 8, w = W / 4 * 0.7;
    g.strokeStyle = css(hi, 0.8); g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - 14, x + w / 2, y); g.stroke();
    if (r() < 0.5) { g.strokeStyle = css(COL.foam, 0.9); g.lineWidth = 4; g.beginPath(); g.arc(x + w * 0.2, y - 8, 7, Math.PI, Math.PI * 1.9); g.stroke(); }
    for (const dx of [-W, W]) { g.strokeStyle = css(hi, 0.8); g.lineWidth = 5; g.beginPath(); g.moveTo(x + dx - w / 2, y); g.quadraticCurveTo(x + dx, y - 14, x + dx + w / 2, y); g.stroke(); }
  }
}, true);
// ---- 泰山
const taiH = (x: number, z: number) =>
  bump(x, z, BX + 0.1, -0.58, 0.34, 0.4, 0.26, 1.6) + bump(x, z, BX + 0.52, -0.6, 0.2, 0.26, 0.22, 1.7) + bump(x, z, BX - 0.34, -0.62, 0.18, 0.26, 0.2, 1.7)
  + bump(x, z, BX - 0.26, 0.06, 0.11, 0.17, 0.13, 3.0) + bump(x, z, BX + 0.62, 0.18, 0.05, 0.28, 0.18) + 0.006 * Math.sin(x * 23) * Math.sin(z * 19);
const taiTex = () => groundPaint((g, k) => {
  const r = rng(85), e = 0.01;
  for (let py = 0; py < k.H; py += 2) for (let px = 0; px < k.W; px += 2) {
    const x = bx0 + (px / k.W) * (bx1 - bx0), z = bz0 + (py / k.H) * (bz1 - bz0), h = taiH(x, z);
    const sl = Math.hypot(taiH(x + e, z) - taiH(x - e, z), taiH(x, z + e) - taiH(x, z - e)) / (2 * e);
    const c = h < 0.012 ? COL.sand : sl > 1.25 ? COL.cliff : h > 0.27 ? "#8fa86a" : (Math.sin(x * 40 + z * 30) > 0.6 ? COL.grassLo : COL.grass);
    g.fillStyle = c; g.fillRect(px, py, 2, 2);
  }
  for (let i = 0; i < 120; i++) blotch(g, k.W * r(), k.H * r(), 5 + 14 * r(), r() < 0.5 ? COL.pineLo : "#9cc66a", 0.25);
  // the stair to the summit: a pale zigzag line from the foot (near) to the gate (the peak)
  g.strokeStyle = COL.path; g.lineWidth = 0.012 * k.s; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath();
  const pts: [number, number][] = [[BX + 0.25, 0.3], [BX + 0.12, 0.08], [BX + 0.3, -0.1], [BX + 0.08, -0.26], [BX + 0.22, -0.4], [BX + 0.1, -0.54]];
  pts.forEach(([x, z], i) => (i ? g.lineTo(k.px(x), k.pz(z)) : g.moveTo(k.px(x), k.pz(z)))); g.stroke();
  g.strokeStyle = "rgba(150,130,100,0.6)"; g.lineWidth = 0.004 * k.s; g.setLineDash([3, 5]); g.stroke(); g.setLineDash([]);
  g.fillStyle = COL.gate; g.fillRect(k.px(BX + 0.085), k.pz(-0.57), 0.035 * k.s, 0.02 * k.s);
});
// ---- 湘山
const xiangH = (x: number, z: number) => {
  const isl = bump(x, z, BX - 0.08, -0.38, 0.26, 0.44, 0.3, 1.9) + bump(x, z, BX + 0.28, -0.24, 0.1, 0.26, 0.22, 2) + 0.008 * Math.sin(x * 21) * Math.sin(z * 17);
  return isl - 0.02;
};
/** the island's ground in GREYS (light and dark strokes): the material's colour makes it green or red */
const xiangTex = () => groundPaint((g, k) => {
  const r = rng(87);
  for (let py = 0; py < k.H; py += 2) for (let px = 0; px < k.W; px += 2) {
    const x = bx0 + (px / k.W) * (bx1 - bx0), z = bz0 + (py / k.H) * (bz1 - bz0), h = xiangH(x, z), v = 210 + 30 * Math.sin(x * 37 + z * 23) * Math.sin(x * 11 - z * 29);
    g.fillStyle = h < 0.02 ? "#e8e0d0" : `rgb(${v | 0},${v | 0},${v | 0})`; g.fillRect(px, py, 2, 2);
  }
  for (let i = 0; i < 200; i++) blotch(g, k.W * r(), k.H * r(), 4 + 10 * r(), r() < 0.5 ? "#b8b8b8" : "#ffffff", 0.3);
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildTable(K: Kit) {
  const group = new THREE.Group(); group.name = "table";
  const Mk = maker(K, group), R = S.room;

  // =================================================================================================== the room
  Mk.mesh("table.floor", levelQuad(R.x0, R.x1, R.z0, R.z1, 0, (x, z) => [x / 1.6, z / 1.6]), Mk.tex(boardsTex({ seed: 77, n: 6, base: COL.floor, lo: COL.floorLo, joint: "#2e1e18", ends: 2 }), 0.8), { cast: false });
  const mWall = Mk.tex(wallTex(), 0.9);
  Mk.mesh("table.wallN", wallQuad([R.x0, R.z0], [R.x1, R.z0], 0, R.h, { u0: 0, tileU: 2 }), Mk.tex(shelfTex(), 0.9), { cast: false });
  Mk.mesh("table.wallW", wallQuad([R.x0, R.z1], [R.x0, R.z0], 0, R.h, { u0: 0, tileU: 2 }), mWall, { cast: false });
  Mk.mesh("table.wallE", wallQuad([R.x1, R.z0], [R.x1, R.z1], 0, R.h, { u0: 0, tileU: 2 }), mWall, { cast: false });
  Mk.mesh("table.wallS", wallQuad([R.x1, R.z1], [R.x0, R.z1], 0, R.h, { u0: 0, tileU: 2 }), mWall, { cast: false });
  Mk.mesh("table.ceiling", ceilQuad(R.x0, R.x1, R.z0, R.z1, R.h, (x, z) => [x / 2, z / 2]), Mk.flat("#2a2026", 0.9), { cast: false });
  for (let z = R.z0 + 1.2; z < R.z1; z += 1.6) Mk.mesh("table.beam", boxG(R.x0, R.x1, R.h - 0.22, R.h + 0.01, z - 0.1, z + 0.1), Mk.flat(COL.post, 0.7), { cast: false });
  // the silk map on the west wall (a hanging scroll: the silk and two rollers)
  {
    const P = new Part(K), mx = R.x0 + 0.03, mz = -0.8;
    P.add(Mk.tex(mapTex(), 0.9), boxG(mx - 0.008, mx + 0.008, 0.95, 1.95, mz - 0.7, mz + 0.7), 0);
    for (const y of [0.93, 1.97]) P.add(Mk.flat(COL.woodLo, 0.6), new THREE.CylinderGeometry(0.025, 0.025, 1.56, 12).rotateX(Math.PI / 2).translate(mx + 0.02, y, mz), 0.005);
    P.into(group, "table.map");
  }
  // the lamp: a bronze bowl on three chains, its flame glowing (the point light hangs in it)
  const Lm = S.lamp;
  {
    const P = new Part(K), br = Mk.flat(COL.bronze, 0.45), brLo = Mk.flat(COL.bronzeLo, 0.5);
    P.add(br, lathe([[0, -0.06], [0.14, -0.05], [0.2, 0.0], [0.22, 0.04], [0.2, 0.05], [0.12, 0.0], [0, -0.01]], 24).translate(Lm.x, Lm.y, Lm.z), 0.006);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2, p = new THREE.Vector3(Lm.x + Math.cos(a) * 0.19, Lm.y + 0.04, Lm.z + Math.sin(a) * 0.19); P.add(brLo, barGeo(p, new THREE.Vector3(Lm.x, R.h - 0.22, Lm.z), 0.008), 0.004); }
    P.add(Mk.basic(COL.flame), new THREE.SphereGeometry(0.05, 12, 10).scale(1, 1.5, 1).translate(Lm.x, Lm.y + 0.08, Lm.z), 0);
    P.into(group, "table.lamp", { cast: false });
    const glow = glowSprite(0.5, "#ffc878", 0.45); glow.position.set(Lm.x, Lm.y + 0.08, Lm.z + 0.05); glow.name = "table.lamp.glow"; group.add(glow);
  }

  // =================================================================================================== the sand table
  {
    const wood = Mk.flat(COL.wood, 0.6), rim = Mk.flat(COL.rim, 0.55), mApron = Mk.tex(apronTex(), 0.6);
    const ap0 = TOP - 0.2;
    Mk.mesh("table.apron", tileUV(boxG(T.x0, T.x1, ap0, TOP - 0.005, T.z0, T.z1), 1.1, 0.195, T.x0, ap0), mApron);
    for (const [x, z] of [[T.x0 + 0.1, T.z0 + 0.1], [T.x1 - 0.1, T.z0 + 0.1], [T.x0 + 0.1, T.z1 - 0.1], [T.x1 - 0.1, T.z1 - 0.1]]) {
      Mk.mesh("table.leg", boxG(x - 0.07, x + 0.07, 0, ap0 + 0.01, z - 0.07, z + 0.07), wood);
      Mk.mesh("table.foot", boxG(x - 0.1, x + 0.1, 0, 0.05, z - 0.1, z + 0.1), rim);
    }
    // the rim round the board: four bars standing `rim` proud of the top
    const rh = TOP + T.rim;
    Mk.mesh("table.rim", boxG(T.x0 - 0.02, T.x1 + 0.02, TOP - 0.03, rh, T.z0 - 0.02, T.z0 + IN), rim);
    Mk.mesh("table.rim", boxG(T.x0 - 0.02, T.x1 + 0.02, TOP - 0.03, rh, T.z1 - IN, T.z1 + 0.02), rim);
    Mk.mesh("table.rim", boxG(T.x0 - 0.02, T.x0 + IN, TOP - 0.03, rh, T.z0 + IN - 0.001, T.z1 - IN + 0.001), rim);
    Mk.mesh("table.rim", boxG(T.x1 - IN, T.x1 + 0.02, TOP - 0.03, rh, T.z0 + IN - 0.001, T.z1 - IN + 0.001), rim);
    Mk.mesh("table.board", levelQuad(bx0, bx1, bz0, bz1, TOP - 0.025), Mk.flat(COL.sandLo, 0.95), { cast: false });
  }

  // =================================================================================================== THE COAST
  const sea = new THREE.Group(); sea.name = "table.sea"; group.add(sea);
  const seaMap = seaTex(COL.sea, COL.seaLo, COL.seaHi); seaMap.repeat.set(3, 2);
  {
    Mk.mesh("table.coast", terrainG(bx0, bx1, bz0, bz1, 140, 100, TOP, coastH), Mk.tex(coastTex(), 0.95), { into: sea });
    Mk.mesh("table.sea.water", levelQuad(bx0, bx1, bz0, bz1, W_, (x, z) => [(x - bx0) / (bx1 - bx0), (z - bz0) / (bz1 - bz0)]), Mk.tex(seaMap, 0.4), { into: sea, cast: false });
    const P = new Part(K), mRock = Mk.flat(COL.rock, 0.9), mRockLo = Mk.flat(COL.rockLo, 0.9);
    const rocks: [number, number, number][] = [[BX - 0.7, -0.22, 0.09], [BX - 0.58, -0.28, 0.06], [BX + 0.62, -0.26, 0.07], [BX + 0.75, -0.2, 0.05], [BX - 0.05, -0.27, 0.045], [BX - 0.9, -0.05, 0.07]];
    rocks.forEach(([x, z, s], i) => P.add(i % 2 ? mRockLo : mRock, rockG(90 + i, s * 1.6, s * 1.1, s * 1.3, 1, 0.02).translate(x, TOP + coastH(x, z), z), 0.004));
    // two pines on the headland
    for (const [x, z, s] of [[BX - 0.86, -0.42, 1], [BX - 0.74, -0.5, 0.8]] as [number, number, number][]) addPine(P, Mk, x, TOP + coastH(x, z) - 0.01, z, 0.22 * s);
    // the camp on the shore (lower half of the frame): tents, black Qin flags, a block of toy soldiers, the stele
    const on = (x: number, z: number) => TOP + coastH(x, z);
    const tentM = [Mk.flat("#e8dcc0", 0.8), Mk.flat("#c8423a", 0.8)], blk = Mk.flat("#25222a", 0.7), red = Mk.flat("#c8322c", 0.7), pole = Mk.flat(COL.boltShaft, 0.7);
    const tents: [number, number, number][] = [[BX + 0.32, 0.3, 0.05], [BX + 0.46, 0.36, 0.045], [BX + 0.6, 0.28, 0.05], [BX + 0.74, 0.38, 0.042], [BX - 0.78, 0.36, 0.045], [BX + 0.18, 0.44, 0.04]];
    tents.forEach(([x, z, r], i) => {
      P.add(tentM[i % 2], new THREE.ConeGeometry(r, r * 1.25, 4, 1).rotateY(Math.PI / 4 + 0.2 * i).translate(x, on(x, z) + r * 0.6, z), 0.003);
      P.add(blk, new THREE.BoxGeometry(r * 0.35, r * 0.5, 0.004).rotateY(0.2 * i).translate(x + 0.2 * r, on(x, z) + r * 0.25, z + r * 0.62), 0);
    });
    for (const [x, z] of [[BX + 0.26, 0.22], [BX + 0.68, 0.2], [BX - 0.7, 0.28], [BX + 0.84, 0.3]] as [number, number][]) {
      P.add(pole, new THREE.CylinderGeometry(0.0025, 0.0025, 0.16, 5).translate(x, on(x, z) + 0.08, z), 0.002);
      P.add(blk, new THREE.BoxGeometry(0.05, 0.034, 0.003).translate(x + 0.026, on(x, z) + 0.14, z), 0.002);
      P.add(red, new THREE.BoxGeometry(0.052, 0.006, 0.0035).translate(x + 0.026, on(x, z) + 0.12, z), 0);
    }
    // a block of toy soldiers (black capsules, red heads-bands), 3 ranks of 5, facing the sea
    for (let ri = 0; ri < 3; ri++) for (let fi = 0; fi < 5; fi++) {
      const x = BX + 0.36 + fi * 0.04, z = 0.13 + ri * 0.042, y = on(x, z);
      P.add(blk, new THREE.CapsuleGeometry(0.009, 0.022, 3, 6).translate(x, y + 0.02, z), 0.002);
      P.add(Mk.flat("#e8c8a0", 0.6), new THREE.SphereGeometry(0.009, 8, 6).translate(x, y + 0.045, z), 0.002);
      P.add(red, new THREE.CylinderGeometry(0.0095, 0.0095, 0.004, 8).translate(x, y + 0.048, z), 0);
    }
    // 之罘刻石: the stele on the dune
    { const x = BX - 0.6, z = 0.3, y = on(x, z) - 0.004;
      P.add(Mk.flat(COL.rockLo, 0.9), boxG(x - 0.03, x + 0.03, y, y + 0.012, z - 0.016, z + 0.016), 0.003);
      P.add(Mk.flat("#b8b0a4", 0.9), boxG(x - 0.018, x + 0.018, y + 0.012, y + 0.085, z - 0.007, z + 0.007), 0.003); }
    // tufts of dune grass
    { const r = rng(88), tuft = Mk.flat(COL.grass, 0.9), tuftLo = Mk.flat(COL.grassLo, 0.9);
      for (let i = 0; i < 34; i++) {
        const x = bx0 + 0.05 + (bx1 - bx0 - 0.1) * r(), z = 0.05 + 0.45 * r(), y = on(x, z);
        if (Math.abs(x - TABLE.shore.x) < 0.1 && Math.abs(z - TABLE.shore.z) < 0.1) continue;
        if (x > BX + 0.14 && x < BX + 0.9 && z > 0.1 && z < 0.48) continue;           // keep the camp clear
        if (y - TOP < WL + 0.01) continue;
        for (let b = 0; b < 3; b++) P.add(i % 2 ? tuft : tuftLo, new THREE.ConeGeometry(0.0035, 0.022 + 0.008 * b, 4).rotateZ(0.35 * (b - 1)).translate(x + 0.005 * (b - 1), y + 0.009, z + 0.003 * b), 0);
      } }
    P.into(sea, "table.coast.pieces");
  }
  // THE FISH (its own group: it bobs, is hit, rolls belly-up)
  const fish = new THREE.Group(); fish.name = "table.fish"; sea.add(fish);
  /** the fish is modelled 62 cm long and shown at FS: a big fish for the board, never bigger than a third of the sea */
  const FS = 0.55;
  const eyesAlive = new THREE.Group(), eyesDead = new THREE.Group();
  {
    const P = new Part(K), L = 0.62;
    const bodyTex = paint(256, 128, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, W, 0);
      gr.addColorStop(0, COL.fishBelly); gr.addColorStop(0.42, COL.fishBelly); gr.addColorStop(0.55, COL.fish); gr.addColorStop(0.95, COL.fish); gr.addColorStop(1, COL.fishBelly);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(30,60,100,0.25)"; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(W * (0.6 + 0.3 * ((i * 7) % 10) / 10), H * ((i * 13) % 17) / 17, 6, 0, 7); g.fill(); }
    });
    // the body: a fat lathe along x (head at +x), the top (u 0.75) dark
    const prof: [number, number][] = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, rr = 0.15 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.75) * (1 - 0.35 * u * u); prof.push([Math.max(0.006, rr), -L / 2 + u * L]); }
    prof[0][0] = 0; prof[16][0] = 0;
    const body = lathe(prof, 24).rotateZ(-Math.PI / 2).scale(1, 1, 0.8);
    P.add(Mk.tex(bodyTex, 0.5), body, 0.006);
    const fin = Mk.flat(COL.fin, 0.6);
    const tailS = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-0.2, 0.16), new THREE.Vector2(-0.15, 0), new THREE.Vector2(-0.2, -0.16)]);
    P.add(fin, new THREE.ExtrudeGeometry(tailS, { depth: 0.03, bevelEnabled: false }).translate(-L / 2 + 0.03, 0, -0.015), 0.005);
    const dors = new THREE.Shape([new THREE.Vector2(-0.12, 0), new THREE.Vector2(0.02, 0.12), new THREE.Vector2(0.1, 0)]);
    P.add(fin, new THREE.ExtrudeGeometry(dors, { depth: 0.025, bevelEnabled: false }).translate(-0.02, 0.12, -0.0125), 0.005);
    for (const s of [-1, 1]) P.add(fin, new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-0.1, -0.05), new THREE.Vector2(-0.08, 0.02)]), { depth: 0.015, bevelEnabled: false }).translate(0.08, -0.04, s * 0.1 - 0.0075), 0.004);
    P.into(fish, "table.fish.body");
    const Pe = new Part(K), Pd = new Part(K), eyeW = Mk.flat(COL.eye, 0.4), pup = Mk.flat(COL.pupil, 0.4);
    for (const s of [-1, 1]) {
      Pe.add(eyeW, new THREE.SphereGeometry(0.038, 14, 10).translate(0.19, 0.045, s * 0.088), 0.004);
      Pe.add(pup, new THREE.SphereGeometry(0.018, 10, 8).translate(0.21, 0.05, s * 0.118), 0);
      Pd.add(eyeW, new THREE.SphereGeometry(0.036, 14, 10).translate(0.19, 0.045, s * 0.088), 0.004);
      for (const a of [0.78, -0.78]) Pd.add(pup, new THREE.BoxGeometry(0.006, 0.05, 0.008).rotateX(a).translate(0.19, 0.045, s * 0.124), 0);
    }
    Pe.into(eyesAlive, "table.fish.eyes"); Pd.into(eyesDead, "table.fish.eyesX");
    fish.add(eyesAlive, eyesDead);
    fish.scale.setScalar(FS);
  }
  const splash = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.3, 32).rotateX(-Math.PI / 2), Mk.basic(COL.foam, { transparent: true, opacity: 0.7 }));
  splash.name = "table.fish.splash"; splash.layers.set(NOINK); splash.position.set(TABLE.fish.x, W_ + 0.002, TABLE.fish.z); sea.add(splash);
  // the bolt (a shaft, a steel head, red fletching) and the starburst
  const bolt = new THREE.Group(); bolt.name = "table.bolt"; sea.add(bolt);
  {
    const P = new Part(K);
    P.add(Mk.flat(COL.boltShaft, 0.6), new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6).rotateZ(-Math.PI / 2), 0.003);
    P.add(Mk.flat(COL.boltHead, 0.3), new THREE.ConeGeometry(0.009, 0.025, 8).rotateZ(-Math.PI / 2).translate(0.07, 0, 0), 0.003);
    P.add(Mk.flat(COL.fletch, 0.7), new THREE.BoxGeometry(0.03, 0.016, 0.003).translate(-0.05, 0, 0), 0.002);
    P.into(bolt, "table.bolt");
  }
  const star = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: starTex(), transparent: true, depthWrite: false, fog: false }));
  star.name = "table.pop"; star.layers.set(NOINK); star.renderOrder = 6; sea.add(star);

  // =================================================================================================== 泰山
  const tai = new THREE.Group(); tai.name = "table.taishan"; group.add(tai);
  const hat = new THREE.Group(); hat.name = "table.hat";
  const sparkle = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: starTex("#fff3a0", "#ffffff"), transparent: true, depthWrite: false, fog: false }));
  sparkle.layers.set(NOINK); sparkle.renderOrder = 6; sparkle.name = "table.hat.sparkle";
  const crownTop = new THREE.Vector3();
  {
    Mk.mesh("table.taishan.ground", terrainG(bx0, bx1, bz0, bz1, 140, 100, TOP, taiH), Mk.tex(taiTex(), 0.95), { into: tai });
    const P = new Part(K), tr = TABLE.tree;
    const top = addPine(P, Mk, tr.x, TOP + taiH(tr.x, tr.z) - 0.01, tr.z, 0.36, true);
    crownTop.copy(top);
    // a few more small pines on the slopes and rocks
    const r = rng(95);
    for (let i = 0; i < 16; i++) { const x = BX - 0.7 + 1.4 * r(), z = -0.75 + 0.6 * r(), h = taiH(x, z); if (h < 0.05 || h > 0.4 || Math.hypot(x - tr.x, z - tr.z) < 0.15) continue; addPine(P, Mk, x, TOP + h - 0.01, z, 0.07 + 0.05 * r()); }
    P.into(tai, "table.taishan.pieces");
    const Ph = new Part(K);
    Ph.add(Mk.flat(COL.hat, 0.6), lathe([[0, 0], [0.045, 0], [0.05, 0.01], [0.042, 0.02], [0.036, 0.055], [0.02, 0.072], [0, 0.074]], 18), 0.004);
    Ph.add(Mk.flat(COL.hatBand, 0.6), new THREE.CylinderGeometry(0.044, 0.047, 0.014, 18).translate(0, 0.016, 0), 0);
    Ph.add(Mk.flat(COL.hat, 0.6), new THREE.BoxGeometry(0.11, 0.008, 0.02).translate(0, 0.06, 0), 0.003);
    Ph.into(hat, "table.hat");
    tai.add(hat, sparkle);
  }

  // =================================================================================================== 湘山
  const xiang = new THREE.Group(); xiang.name = "table.xiangshan"; group.add(xiang);
  const islandMat = Mk.own("#5fa050", { map: xiangTex(), rough: 0.95 });
  const lakeMap = seaTex(COL.lake, COL.lakeStorm, COL.lakeHi); lakeMap.repeat.set(3, 2);
  const trees: { g: THREE.Group; at: number }[] = [];
  const boat = new THREE.Group(); boat.name = "table.boat";
  {
    Mk.mesh("table.xiangshan.ground", terrainG(bx0, bx1, bz0, bz1, 140, 100, TOP, xiangH), islandMat, { into: xiang });
    Mk.mesh("table.xiangshan.lake", levelQuad(bx0, bx1, bz0, bz1, W_, (x, z) => [(x - bx0) / (bx1 - bx0), (z - bz0) / (bz1 - bz0)]), Mk.tex(lakeMap, 0.4), { into: xiang, cast: false });
    // the shrine: a red hall on a stone base with a dark hip roof
    const P = new Part(K), sh = TABLE.shrine, sy = TOP + xiangH(sh.x, sh.z) - 0.01;
    P.add(Mk.flat("#b8ab98", 0.9), boxG(sh.x - 0.07, sh.x + 0.07, sy, sy + 0.025, sh.z - 0.055, sh.z + 0.055), 0.004);
    P.add(Mk.flat(COL.shrine, 0.7), boxG(sh.x - 0.055, sh.x + 0.055, sy + 0.024, sy + 0.08, sh.z - 0.04, sh.z + 0.04), 0.004);
    P.add(Mk.flat(COL.shrineRoof, 0.6), new THREE.ConeGeometry(0.1, 0.06, 4, 1).rotateY(Math.PI / 4).scale(1.1, 1, 0.8).translate(sh.x, sy + 0.108, sh.z), 0.004);
    P.into(xiang, "table.shrine");
    // the forest: little cone trees (each its own group: they go one by one)
    const tp = new Part(K); addTree(tp, Mk, 0, 0, 0, 1);
    const proto = new THREE.Group(); tp.into(proto, "table.forest.tree");
    const r = rng(97);
    for (let i = 0; i < 160 && trees.length < 46; i++) {
      const x = BX - 0.55 + 1.05 * r(), z = -0.72 + 0.62 * r(), h = xiangH(x, z);
      if (h < 0.04 || Math.hypot(x - sh.x, z - sh.z) < 0.1) continue;
      const g = proto.clone(); g.position.set(x, TOP + h - 0.006, z); const s = 0.06 + 0.03 * r(); g.scale.setScalar(s); g.userData.s = s;
      xiang.add(g); trees.push({ g, at: r() * 0.85 });
    }
    // the boat: a hull, a mast and a sail
    const Pb = new Part(K);
    Pb.add(Mk.flat(COL.boat, 0.7), lathe([[0, -0.02], [0.03, -0.018], [0.045, 0.0], [0.05, 0.018], [0, 0.018]], 12).scale(1, 1, 3).translate(0, 0, 0), 0.004);
    Pb.add(Mk.flat(COL.boat, 0.7), new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6).translate(0, 0.09, 0.01), 0.003);
    const sailT = paint(64, 64, (g, W, H) => { g.fillStyle = COL.sail; g.fillRect(0, 0, W, H); g.fillStyle = COL.sailBand; g.fillRect(0, H * 0.4, W, H * 0.16); });
    Pb.add(Mk.tex(sailT, 0.8, THREE.DoubleSide), new THREE.BoxGeometry(0.004, 0.11, 0.09).translate(0, 0.1, 0.01), 0.003);
    Pb.into(boat, "table.boat");
    xiang.add(boat);
  }
  // the storm clouds and the lightning (xiangshan), the rain clouds (taishan): cotton puffs on threads
  /** cotton clouds hung on threads over the board's LEFT and RIGHT thirds (the middle stays clear: he stands behind it) */
  const cloudsOf = (into: THREE.Group, col: string, seed: number, xs: number[]) => {
    const P = new Part(K), m = Mk.flat(col, 0.95), th = Mk.flat(COL.thread, 0.8), r = rng(seed);
    for (const dx of xs) {
      const cx = BX + dx + 0.04 * (r() - 0.5), cz = -0.7 + 0.15 * r(), cy = TOP + 0.74 + 0.08 * r();
      for (let k = 0; k < 4; k++) P.add(m, new THREE.IcosahedronGeometry(0.07 + 0.04 * r(), 2).scale(1.3, 0.8, 1).translate(cx + (k - 1.5) * 0.07, cy + 0.02 * Math.sin(k * 2), cz + 0.03 * (r() - 0.5)), 0.004);
      P.add(th, new THREE.CylinderGeometry(0.0025, 0.0025, R.h - cy, 4).translate(cx, (R.h + cy) / 2, cz), 0);
    }
    P.into(into, "table.clouds", { cast: false });
  };
  cloudsOf(tai, COL.cloud, 101, [-0.78, -0.52, 0.5, 0.76]); cloudsOf(xiang, COL.cloudDark, 103, [-0.8, -0.56, -0.34, 0.46, 0.72]);
  const lightning = new THREE.Mesh(zigzagG(), Mk.basic(COL.bolt)); lightning.name = "table.lightning"; lightning.layers.set(NOINK); lightning.position.set(BX + 0.58, TOP + 0.68, -0.62); xiang.add(lightning);
  // the rain over the whole board
  const rain = makeRain(360, { x0: bx0 - 0.1, x1: bx1, y0: TOP - 0.01, y1: TOP + 0.85, z0: bz0, z1: bz1 }, { seed: 9 });
  rain.mesh.name = "table.rain"; group.add(rain.mesh);

  // =================================================================================================== the light
  lightRig(group, { dir: [0.15, 0.9, 0.45], k: 1.25, col: "#fff0dc", at: [BX, TOP, -0.2], half: 2.8, hemi: ["#6a6478", "#3a3236", 1.0], point: { col: "#ffe4c0", k: 3.2, at: [Lm.x, Lm.y - 0.05, Lm.z], dist: 5.5 } });

  // =================================================================================================== the dressing
  const st = { tableau: "sea", bare: 0, rain: 0, storm: 0, bolt: 0, hat: 0, pieces: 1 }, green = new THREE.Color("#68a850"), red = new THREE.Color(COL.red);
  let clock = 0;
  const fishAt = TABLE.fish, shore = TABLE.shore.clone().add(new THREE.Vector3(0.03, 0.11, -0.02));
  const pose = (t: number) => {
    sea.visible = st.tableau === "sea"; tai.visible = st.tableau === "taishan"; xiang.visible = st.tableau === "xiangshan";
    // the coast: the waves roll in; the fish alive, hit, belly-up
    seaMap.offset.set(0.02 * Math.sin(t * 0.3), -t * 0.05);
    const k = st.bolt, hit = 0.55, dead = k >= hit;
    const bob = Math.sin(t * 2.1), fy = fishAt.y + 0.012 + 0.02 * (bob * 0.5 + 0.5);
    if (!dead) {
      fish.position.set(fishAt.x, fy, fishAt.z); fish.rotation.set(0, Math.PI * 0.92, 0.32 * Math.sin(t * 2.1 + 1.2));
      eyesAlive.visible = true; eyesDead.visible = false;
    } else {
      const u = Math.min(1, (k - hit) / 0.22), jump = 0.06 * Math.sin(Math.min(1, u * 1.4) * Math.PI);
      fish.position.set(fishAt.x, fishAt.y + 0.03 + jump + 0.008 * Math.sin(t * 1.3), fishAt.z);
      fish.rotation.set(Math.PI * smooth01(0.2, 1, u), Math.PI * 0.92, 0.1 * (1 - u));
      eyesAlive.visible = u < 0.5; eyesDead.visible = u >= 0.5;
    }
    splash.scale.setScalar(FS * (dead ? 1.3 : 0.85 + 0.25 * (bob * 0.5 + 0.5))); (splash.material as THREE.MeshBasicMaterial).opacity = dead ? 0.35 : 0.5 + 0.3 * (0.5 - 0.5 * bob);
    bolt.visible = k > 0.001 && st.pieces > 0.5; fish.visible = splash.visible = st.pieces > 0.5;
    if (k > 0.001 && !dead) {
      const u = k / hit, tgt = new THREE.Vector3(fishAt.x, fy + 0.02, fishAt.z), p = shore.clone().lerp(tgt, u); p.y += 0.12 * 4 * u * (1 - u);
      const v = tgt.clone().sub(shore); v.y += 0.12 * 4 * (1 - 2 * u);
      bolt.position.copy(p); bolt.rotation.set(0, Math.atan2(-v.z, v.x), Math.atan2(v.y, Math.hypot(v.x, v.z)));
    } else if (dead) {
      // stuck in the fish's flank: a child-like placement in the fish's frame
      const m = new THREE.Vector3(0.02, 0.08, 0.09).multiplyScalar(FS).applyEuler(fish.rotation).add(fish.position);
      bolt.position.copy(m); bolt.rotation.set(fish.rotation.x, Math.atan2(-(fishAt.z - shore.z), fishAt.x - shore.x), -0.3);
    }
    const sp = (k - hit) / 0.25;
    star.visible = sp > 0 && sp < 1; if (star.visible) { const s = 0.4 + 1.1 * Math.sin(Math.min(1, sp * 1.6) * Math.PI / 2); star.scale.setScalar(s); (star.material as THREE.MeshBasicMaterial).opacity = 1 - smooth01(0.6, 1, sp); star.position.set(fishAt.x, fishAt.y + 0.1, fishAt.z + 0.05); }
    // 泰山: the hat pops onto the crown
    const h = st.hat; hat.visible = h > 0.001 && st.pieces > 0.5;
    if (hat.visible) { const u = Math.min(1, h / 0.35), s = u < 1 ? (1 - Math.cos(u * Math.PI * 2.5) * Math.exp(-u * 4)) * u : 1; hat.position.copy(crownTop).add(new THREE.Vector3(0, -0.004 + 0.05 * (1 - u) * (1 - u), 0)); hat.scale.setScalar(Math.max(0.001, s * 1.15)); hat.rotation.set(0, 0.3 + 2 * (1 - u), 0.08 * Math.sin(u * 9) * (1 - u)); }
    sparkle.visible = h > 0.25 && h < 0.6; if (sparkle.visible) { const u = (h - 0.25) / 0.35; sparkle.position.copy(crownTop).add(new THREE.Vector3(0.05, 0.08, 0.04)); sparkle.scale.setScalar(0.5 + 0.8 * Math.sin(u * Math.PI)); (sparkle.material as THREE.MeshBasicMaterial).opacity = Math.sin(u * Math.PI); sparkle.rotation.z = u * 1.5; }
    // 湘山: the storm, the boat, the trees, the red earth
    const sm = st.storm;
    lakeMap.offset.set(0.03 * Math.sin(t * 0.4) * (1 + sm), -t * (0.04 + 0.08 * sm));
    boat.visible = st.pieces > 0.5;
    const bt = TABLE.boat; boat.position.set(bt.x + 0.02 * Math.sin(t * 0.7), W_ + 0.004 + 0.012 * sm * Math.sin(t * 2.3), bt.z); boat.rotation.set(0.25 * sm * Math.sin(t * 1.9 + 0.5), 0.6, 0.38 * sm * Math.sin(t * 1.7) + 0.05 * Math.sin(t));
    for (const tr of trees) { const u = smooth01(tr.at, tr.at + 0.12, st.bare); tr.g.visible = u < 0.999; tr.g.scale.setScalar(Math.max(0.001, tr.g.userData.s * (1 - u))); }
    islandMat.color.copy(green).lerp(red, smooth01(0.1, 0.95, st.bare));
    const lt = (t % 3.3) / 3.3; lightning.visible = xiang.visible && sm > 0.5 && lt < 0.035; lightning.rotation.z = 0.2 * Math.sin(Math.floor(t / 3.3) * 2.1);
    // the rain (its own, or the storm's)
    const rk = Math.max(st.rain, st.tableau === "xiangshan" ? sm : 0);
    rain.update(t, rk, st.tableau === "xiangshan" ? 0.35 * sm + 0.1 : 0.12);
  };
  pose(0);
  return {
    group,
    view(cam: THREE.Vector3) {
      group.getObjectByName("table.wallS")!.visible = cam.z < R.z1 - 0.05;
      const gl = group.getObjectByName("table.lamp.glow"); if (gl) gl.rotation.y = Math.atan2(cam.x - Lm.x, cam.z - Lm.z);
      star.lookAt(cam); sparkle.lookAt(cam);
    },
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "tableau") st.tableau = String(v);
      else if (name in st) (st as Record<string, number | string>)[name] = Math.max(0, Math.min(1, Number(v)));
      pose(clock);
    },
  };
}

// ---------------------------------------------------------------------------------------------------- small pieces
const barGeo = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(r, r, len, 6);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** a toon PINE into a Part: a leaning trunk and three flat umbrella crowns; (x, y, z) = its foot, h = its height.
 *  Returns the top of its crown (where a hat sits) when `top` */
const addPine = (P: Part, Mk: ReturnType<typeof maker>, x: number, y: number, z: number, h: number, big = false) => {
  const bark = Mk.flat(COL.bark, 0.85), nd = Mk.flat(COL.pine, 0.85), ndLo = Mk.flat(COL.pineLo, 0.85);
  const lean = new THREE.Vector3(h * 0.18, h * 0.62, -h * 0.05), top = new THREE.Vector3(x, y, z).add(lean);
  P.add(bark, barGeo(new THREE.Vector3(x, y, z), top, h * 0.045), big ? 0.004 : 0.003);
  P.add(bark, barGeo(top.clone().add(new THREE.Vector3(-h * 0.02, -h * 0.15, 0)), top.clone().add(new THREE.Vector3(-h * 0.3, h * 0.05, h * 0.05)), h * 0.025), big ? 0.004 : 0.003);
  const layers: [number, number, number, number][] = [[0, 0, 0.32, 0.09], [-0.26, -0.02, 0.22, 0.07], [0.04, 0.16, 0.2, 0.07]];
  layers.forEach(([dx, dy, rr, hh], i) => P.add(i % 2 ? ndLo : nd, new THREE.CylinderGeometry(rr * h * 0.55, rr * h, hh * h, 14).translate(top.x + dx * h, top.y + dy * h + hh * h * 0.4, top.z), big ? 0.004 : 0.003));
  return top.clone().add(new THREE.Vector3(0.04 * h, 0.16 * h + 0.07 * h * 0.9, 0));
};
/** a little cone tree (the 湘山 forest) at unit size into a Part (scaled per tree) */
const addTree = (P: Part, Mk: ReturnType<typeof maker>, x: number, y: number, z: number, h: number) => {
  P.add(Mk.flat(COL.bark, 0.85), new THREE.CylinderGeometry(0.06 * h, 0.08 * h, 0.4 * h, 6).translate(x, y + 0.2 * h, z), 0.05);
  P.add(Mk.flat(COL.forest, 0.85), new THREE.ConeGeometry(0.32 * h, 0.9 * h, 10).translate(x, y + 0.75 * h, z), 0.05);
  P.add(Mk.flat(COL.forestLo, 0.85), new THREE.ConeGeometry(0.24 * h, 0.6 * h, 10).translate(x, y + 1.15 * h, z), 0.05);
};
/** a small zigzag lightning bolt (a flat strip facing +z) */
const zigzagG = () => {
  const pts = [[0, 0], [-0.05, -0.1], [0.0, -0.11], [-0.06, -0.24], [0.06, -0.08], [0.01, -0.07], [0.06, 0]];
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.ShapeGeometry(sh);
};
void shade;
