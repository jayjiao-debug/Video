// THE COMMAND TENT of the Hongmen film (鸿门宴): Xiang Yu's banquet tent, the film's main place (lines 2, 10-16, 19, 21).
// Built in code in the way of sets/privy.ts (bt/pbr materials, ink outlines by vasa/ink, one key light). Every position
// comes from layout.ts (ROOM, DOOR, SEATS, RUG, DANCE); the fixed dressing's own marks are exported as TENT (below).
//
// WHAT THERE IS (compass as layout.ts: NORTH = +z, SOUTH = -z, EAST = -x, WEST = +x; the cameras stand north and east):
//   - the shell: four cloth walls 4.2 m high (sand-coloured cloth with soft seams, a dark hem, a PATTERN BAND at
//     2.56 .. 3.02 m: above every head, above the title and above the source tag: the top 9 % of the master), a dark cloth ceiling,
//     round timber posts in the corners, on the west and south walls and as the door frame;
//   - the DOOR in the south wall (layout DOOR): two posts and a lintel, behind them the flap: a pale cloth that ROLLS UP
//     to the lintel (setFlap 0 = hanging shut, its roller on the ground .. 1 = rolled up: 1.08 m x 1.82 m clear).
//     Outside the door: sunlit ground and a painted view of the camp (flat, unlit, never inked);
//   - the floor: beaten earth, and under the whole ring a teal felt RUG (layout RUG) with an ochre border and a
//     lighter panel for the dance floor (layout DANCE). The rug is CUT INTO the floor (one level, no step, no z-fight);
//   - at every seat a straw seat mat (layout PAD; its binding RED for Liu Bang's party, PURPLE for Xiang Yu's) and a
//     low lacquer table (layout TABLE: black with a red top, open underneath, four legs at the corners);
//   - behind Xiang Yu (west) a three-leaf SCREEN: ochre silk in purple borders and black lacquer frames: the host's
//     backdrop for the east cameras (jade, jadeIn), calm and mid-light behind his head;
//   - on the south wall: left of the door a WEAPON RACK with three halberds (戟) and a bronze WINE VESSEL (壶) on a
//     lacquer stand; right of the door a tall bronze LAMP and Xiang Yu's purple BANNER with a gold 项 (the host's
//     colours for the north cameras: it hangs over his corner of the frame);
//   - four bronze lamps in all (TENT.lamps), their flames breathing (animate).
// Colour: sand walls, teal rug, black-and-red lacquer, bronze; purple on Xiang Yu's side (west / screen right from the
// north cameras), red on Liu Bang's (the mats of the south and east seats).
//
// INK / FLICKER RULES this file keeps (vasa/ink.ts draws a line wherever depth or the surface direction jumps):
//   - nothing thin is geometry on the ink layer. The halberds (3 cm shafts) are on layer NOINK with their own
//     outline (a black back-face hull 6 mm out, like the rig's own halberds); cords, patterns, seams, weave, borders
//     and the camp outside the door are PAINTED (mip-mapped textures do not sparkle);
//   - round things on the ink layer are 9 cm thick or more (posts 12 cm, lamp stems 9 cm);
//   - no two faces nearer than 2 cm that face the same way; parts either overlap by 1 cm (hidden) or stand apart;
//     the rug, the earth and the dance panel are one level; edges of the door hole are hidden inside the posts;
//   - THE DEAD ZONE: the ink pass draws a crease where two surfaces meet at one depth (less than 1 % of the camera's
//     distance apart) and a full silhouette where one is 3 % or more in front of what is behind it. BETWEEN 1 and 3 %
//     (8 .. 23 cm at the master's 7.7 m, 4 .. 13 cm at the door camera's 4.4 m) the line is weak and comes and goes
//     (the shimmer test's hot lines). So an inked thing is either within 2.5 cm of its neighbour in depth (door posts,
//     lintel, flap, roller) or 30 cm clear of the wall behind it (the door lamp's dish); what must hang in between
//     (the banner and its rail, 15 cm off the wall) is on NOINK with its own black outline;
//   - the tables are on NOINK with a hull outline too: an inked table edge is drawn OVER every NOINK thing standing
//     less than about 1.5 % of the camera's distance + 3 cm in front of it (bowls, cups, hands at the table's far side);
//   - a wall the camera stands behind is HIDDEN with everything on it (setView), never left to culling.
// Determinism: seeded painting only; setView / setFlap / animate are pure functions of their argument.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LIGHTS, type EnvSpec, type Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import { rng } from "../../arthur/sets/yard_paint";
import * as L from "../layout";

type V3 = [number, number, number];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// =====================================================================================================================
// marks: where the fixed dressing stands (world metres; for the shot builders: keep figures out of these boxes)
// =====================================================================================================================
const R = L.ROOM, D = L.DOOR;
/** the walls' height (the cameras of layout.ts see the south wall up to 3.15 m) */
const WALL_H = 4.2;
/** the door posts' radius and the flap roller's radius shut / open */
const POST_R = 0.06, ROLL_R0 = 0.055, ROLL_R1 = 0.065;
/** the one real lamp light's strength and the painted halos' opacity (kept low: nothing may blow out) */
const LAMP_K = 0.75, GLOW_K = 0.2, SPILL_K = 0.36;
export const TENT = {
  wallH: WALL_H,
  /** the doorway between the posts and under the rolled-up flap (flap 1) */
  door: { x0: D.x - D.w / 2 + 0.01, x1: D.x + D.w / 2 - 0.01, clearH: D.h + 0.005 - 2 * ROLL_R1, z: D.z },
  /** the pattern band on the walls (metres above the floor) */
  band: { y0: 2.56, y1: 3.02 },
  /** the weapon rack against the south wall (a box round everything, the halberd tips at `top`) */
  rack: { x0: -2.08, x1: -1.5, z0: R.z0, z1: R.z0 + 0.34, top: 2.22 },
  /** the wine vessel on its stand (centre on the floor, radius, height) */
  wine: { at: V(-1.2, 0, R.z0 + 0.33), r: 0.2, h: 0.66 },
  /** the lamp stands (foot centre on the floor); `lampR` = the dish's radius, `flameY` = the flame's middle */
  lamps: [V(0.72, 0, R.z0 + 0.46), V(-2.5, 0, R.z0 + 0.36), V(2.18, 0, 2.52), V(2.22, 0, -1.8)], lampR: 0.16, flameY: 1.47,
  /** Xiang Yu's banner on the south wall (x range, y range; it hangs 0.15 m clear of the wall) */
  banner: { x0: 0.92, x1: 1.5, y0: 0.98, y1: 2.3 },
  /** the screen behind Xiang Yu: the middle leaf's face is at x = `x`, z0 .. z1; the wings (`wing` m long) come
   *  forward `ang` rad; `h` high */
  screen: { x: 2.3, z0: -0.1, z1: 0.9, wing: 0.8, ang: 0.44, h: 1.72 },
};

// =====================================================================================================================
// light and look
// =====================================================================================================================
/** toward the key: the north cameras' upper left front, warm (lamp light through cloth) */
export const TENT_KEY = { dir: [-0.45, 0.62, 0.64] as V3, intensity: 1.55, color: "#ffe6c6" };
/** the diffuse fill for wood / paint: warm from below (the rug's bounce is cool, the lamps warm), a pale cool top */
export const TENT_ENV: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.36, 0.3, 0.26]], [-12, [0.42, 0.36, 0.34]], [6, [0.56, 0.5, 0.5]], [40, [0.52, 0.48, 0.52]], [90, [0.44, 0.42, 0.5]]],
  boxes: [{ az: 125, el: 38, rot: 0, w: 40, h: 22, soft: 14, col: [1.0, 0.86, 0.66] }],
};
export const TENT_AO_REAL = { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 2.0, color: "#241a26" };
/** scene.background: the dark cloth of the ceiling (never seen from a planned camera) */
export const TENT_BG = "#3a3340";

// =====================================================================================================================
// colours (nothing darker than about #2b2530: the ink must stay darker than everything)
// =====================================================================================================================
const C = {
  wall: "#b9aa8c", wallDark: "#8f8370", seam: "rgba(92,78,60,0.30)", hem: "#6a5448", hemLine: "#dccba0",
  band: "#4a586a", bandLine: "#b89c64", bandMotif: "#93896e", bandDag: "#5b4a7a", rope: "#cdb47c", peg: "#8a6238",
  steelHi: "#bcc6d0", steelLo: "#7d8a98", inkSoft: "#3a3046", motif: "#8f3a2a",
  earth: "#8f7b64", rug: "#35605f", rugPanel: "#3f6f6b", rugBind: "#6b3a30", rugOchre: "#b8944e", rugLoz: "#9c7a3c", rugRed: "#a3402f",
  straw: "#c7aa6a", lacquer: "#34313b", red: "#b8352f", gold: "#d8aa42", bronze: "#b58a3c", bronzeDark: "#8c6a30",
  purple: "#5a348c", purpleDeep: "#4a2c74", silk: "#c4a35e", flap: "#e6dcbd", wood: "#7a5536", woodDark: "#62422c",
  steel: "#c9cfd8", shaft: "#7a4a2c", tassel: "#6a2f9a", ink: "#0b0a0d", food: "#e2cc94",
};

// =====================================================================================================================
// painting (seeded; a canvas per texture)
// =====================================================================================================================
type G = CanvasRenderingContext2D;
const canvasOf = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const texOf = (c: HTMLCanvasElement, repS = false, repT = false) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = repS ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.wrapT = repT ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** soft blotches of `col` (alpha a), wrapped across x and y when `wrap` */
const blotch = (g: G, r: () => number, W: number, H: number, n: number, col: string, a: number, wrap = true) => {
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, rad = Math.min(W, H) * (0.08 + 0.16 * r());
    for (const dx of wrap ? [-W, 0, W] : [0]) for (const dy of wrap ? [-H, 0, H] : [0]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
      gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0"));
      g.fillStyle = gr; g.fillRect(x + dx - rad, y + dy - rad, 2 * rad, 2 * rad);
    }
  }
};
/** the wall cloth: one tile is WALL_TILE m wide (repeats along the wall) and WALL_H high */
const WALL_TILE = 2.2;
const wallTex = () => {
  const W = 1024, H = 2048, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(11);
  const Y = (m: number) => H * (1 - m / WALL_H), PX = W / WALL_TILE;
  g.fillStyle = C.wall; g.fillRect(0, 0, W, H);
  blotch(g, r, W, H, 40, "rgba(150,132,104,A)", 0.1);
  blotch(g, r, W, H, 30, "rgba(214,202,176,A)", 0.1);
  // the cloth above the band: darker, the lamps do not reach it
  const up = g.createLinearGradient(0, Y(TENT.band.y1), 0, Y(TENT.band.y1 + 0.9));
  up.addColorStop(0, "rgba(112,100,88,0.45)"); up.addColorStop(1, "rgba(70,62,66,0.9)");
  g.fillStyle = up; g.fillRect(0, 0, W, Y(TENT.band.y1));
  // HUNG CLOTH (a tent, not a plastered room): soft upright folds from the valance to the ground, a dark flank and a
  // pale one each, wrapped across the tile's edge. Low contrast: the wall stays calm behind a head
  const fold = (x: number, w: number, col: string, a: number) => {
    for (const dx of [-W, 0, W]) {
      const gr = g.createLinearGradient(x + dx - w, 0, x + dx + w, 0);
      gr.addColorStop(0, col.replace("A", "0")); gr.addColorStop(0.5, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0"));
      g.fillStyle = gr; g.fillRect(x + dx - w, Y(TENT.band.y0), 2 * w, H - Y(TENT.band.y0));
    }
  };
  for (let i = 0; i < 8; i++) {
    const x = ((i + 0.25 + 0.5 * r()) / 8) * W, w = (0.06 + 0.05 * r()) * PX;
    fold(x, w, "rgba(112,94,70,A)", 0.2); fold(x + w * 0.95, w * 0.7, "rgba(240,228,200,A)", 0.18);
  }
  // two seams per tile: a soft dark line with a pale flank (the widths of cloth)
  for (const u of [0.25, 0.75]) {
    const x = u * W, gr = g.createLinearGradient(x - 26, 0, x + 26, 0);
    gr.addColorStop(0, "rgba(255,246,224,0)"); gr.addColorStop(0.42, "rgba(255,246,224,0.10)"); gr.addColorStop(0.5, C.seam); gr.addColorStop(0.58, "rgba(96,80,60,0.08)"); gr.addColorStop(1, "rgba(96,80,60,0)");
    g.fillStyle = gr; g.fillRect(x - 26, 0, 52, H);
  }
  // THE FOOT OF THE CLOTH: a brown felt binding pegged to the ground every 0.55 m. Its top edge sags between the
  // pegs; big pale running stitches along it; at every peg a rope loop and a wooden peg
  const pw = W / 4, hemY = (x: number) => Y(0.19 + 0.035 * Math.cos((x / pw) * 2 * Math.PI));
  g.fillStyle = C.hem; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, hemY(x));
  g.lineTo(W, H); g.closePath(); g.fill();
  g.strokeStyle = C.hemLine; g.lineWidth = 0.016 * PX; g.lineCap = "butt"; g.setLineDash([W / 48, W / 48]);
  g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = hemY(x) + 0.045 * PX; if (x) g.lineTo(x, y); else g.moveTo(x, y); }
  g.stroke(); g.setLineDash([]);
  for (let k = 0; k <= 4; k++) {
    const x = k * pw, yt = hemY(x);
    g.strokeStyle = C.rope; g.lineWidth = 0.018 * PX; g.beginPath(); g.ellipse(x, (yt + H) / 2 + 0.02 * PX, 0.035 * PX, (H - yt) / 2 - 0.03 * PX, 0, 0, 2 * Math.PI); g.stroke();
    g.fillStyle = C.peg; g.beginPath(); g.moveTo(x - 0.03 * PX, H - 0.1 * PX); g.lineTo(x + 0.03 * PX, H - 0.1 * PX); g.lineTo(x + 0.012 * PX, H); g.lineTo(x - 0.012 * PX, H); g.closePath(); g.fill();
  }
  // THE VALANCE: a pattern band with hanging tongues: a dark ground, an ochre line above and below, a row of squared
  // spirals (雷纹) between; under it eight pointed tongues per tile (slate and muted purple by turns, an ochre edge)
  const b0 = Y(TENT.band.y1), b1 = Y(TENT.band.y0), bh = b1 - b0, ln = 0.04 * PX;
  {
    const nd = 8, dw = W / nd, dd = 0.16 * PX;
    for (let i = 0; i < nd; i++) {
      g.beginPath(); g.moveTo(i * dw, b1 - 2); g.lineTo((i + 1) * dw, b1 - 2); g.lineTo((i + 0.5) * dw, b1 + dd); g.closePath();
      g.fillStyle = i % 2 ? C.bandDag : C.band; g.fill();
      g.strokeStyle = C.bandLine; g.lineWidth = 0.02 * PX; g.lineJoin = "round"; g.beginPath(); g.moveTo(i * dw, b1); g.lineTo((i + 0.5) * dw, b1 + dd); g.lineTo((i + 1) * dw, b1); g.stroke();
    }
  }
  g.fillStyle = C.band; g.fillRect(0, b0, W, bh);
  g.fillStyle = C.bandLine; g.fillRect(0, b0, W, ln); g.fillRect(0, b1 - ln, W, ln);
  const n = 8, cw = W / n, m0 = b0 + ln + 0.05 * PX, mh = bh - 2 * ln - 0.1 * PX;
  g.strokeStyle = C.bandMotif; g.lineWidth = 0.028 * PX; g.lineJoin = "miter"; g.lineCap = "butt";
  for (let i = 0; i < n; i++) {
    const fl = i % 2 === 1, px = (u: number) => i * cw + cw * (fl ? 1 - u : u), py = (v: number) => m0 + mh * (fl ? 1 - v : v);
    g.beginPath();
    const pts: [number, number][] = [[0.14, 1], [0.14, 0.08], [0.86, 0.08], [0.86, 0.92], [0.38, 0.92], [0.38, 0.36], [0.62, 0.36], [0.62, 0.64]];
    pts.forEach(([u, v], k) => (k ? g.lineTo(px(u), py(v)) : g.moveTo(px(u), py(v))));
    g.stroke();
  }
  return texOf(c, true, false);
};
/** beaten earth: a quiet mottle (tile 2 m) */
const earthTex = () => {
  const S = 256, c = canvasOf(S, S), g = c.getContext("2d")!, r = rng(5);
  g.fillStyle = C.earth; g.fillRect(0, 0, S, S);
  blotch(g, r, S, S, 22, "rgba(112,94,74,A)", 0.14); blotch(g, r, S, S, 16, "rgba(170,150,122,A)", 0.12);
  return texOf(c, true, true);
};
/** THE RUG, painted in metres: X / Z map layout RUG onto the canvas (canvas y grows with z, i.e. toward the north) */
const rugTex = () => {
  const W = 2048, H = 2048, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(23), rg = L.RUG, dn = L.DANCE;
  const sx = W / (rg.x1 - rg.x0), sz = H / (rg.z1 - rg.z0);
  const X = (x: number) => (x - rg.x0) * sx, Z = (z: number) => (z - rg.z0) * sz;
  const rect = (x0: number, z0: number, x1: number, z1: number) => g.fillRect(X(x0), Z(z0), X(x1) - X(x0), Z(z1) - Z(z0));
  const inset = (d: number) => rect(rg.x0 + d, rg.z0 + d, rg.x1 - d, rg.z1 - d);
  g.fillStyle = C.rugBind; inset(0);
  g.fillStyle = C.rugOchre; inset(0.05);
  // a row of small lozenges in the ochre border, tone on tone (the border crosses the caption band in the door camera)
  g.fillStyle = C.rugLoz;
  const loz = (x: number, z: number) => { g.beginPath(); g.moveTo(X(x - 0.045), Z(z)); g.lineTo(X(x), Z(z - 0.03)); g.lineTo(X(x + 0.045), Z(z)); g.lineTo(X(x), Z(z + 0.03)); g.closePath(); g.fill(); };
  const row = (a: number, b: number, f: (t: number) => void) => { const k = Math.round((b - a) / 0.2); for (let i = 0; i <= k; i++) f(a + ((b - a) * i) / k); };
  row(rg.x0 + 0.3, rg.x1 - 0.3, (x) => { loz(x, rg.z0 + 0.11); loz(x, rg.z1 - 0.11); });
  row(rg.z0 + 0.3, rg.z1 - 0.3, (z) => { g.save(); g.translate(X(rg.x0 + 0.11), Z(z)); g.rotate(Math.PI / 2); g.translate(-X(rg.x0 + 0.11), -Z(z)); loz(rg.x0 + 0.11, z); g.restore(); g.save(); g.translate(X(rg.x1 - 0.11), Z(z)); g.rotate(Math.PI / 2); g.translate(-X(rg.x1 - 0.11), -Z(z)); loz(rg.x1 - 0.11, z); g.restore(); });
  g.fillStyle = C.rugRed; inset(0.17);
  g.fillStyle = C.rug; inset(0.2);
  // felt: a quiet mottle over the field
  g.save(); g.beginPath(); g.rect(X(rg.x0 + 0.2), Z(rg.z0 + 0.2), X(rg.x1 - 0.2) - X(rg.x0 + 0.2), Z(rg.z1 - 0.2) - Z(rg.z0 + 0.2)); g.clip();
  blotch(g, r, W, H, 60, "rgba(36,72,72,A)", 0.16, false); blotch(g, r, W, H, 50, "rgba(84,130,124,A)", 0.1, false);
  // a woven lozenge lattice over the field, tone on tone (felt with a pattern, not a fitted carpet; quiet enough
  // for the captions that lie over the floor), a small knot where the lines cross
  g.strokeStyle = "rgba(98,146,138,0.34)"; g.lineWidth = 0.022 * sx; g.beginPath();
  const LP = 0.46, span = (rg.x1 - rg.x0) + (rg.z1 - rg.z0);
  for (let d = -span; d <= span; d += LP) { g.moveTo(X(rg.x0 + d), Z(rg.z0)); g.lineTo(X(rg.x0 + d + span), Z(rg.z0 + span)); g.moveTo(X(rg.x0 + d), Z(rg.z0)); g.lineTo(X(rg.x0 + d - span), Z(rg.z0 + span)); }
  g.stroke();
  g.fillStyle = "rgba(176,150,84,0.5)";
  for (let i = 0; i * LP / 2 <= rg.x1 - rg.x0; i++) for (let j = 0; j * LP / 2 <= rg.z1 - rg.z0; j++) if ((i + j) % 2 === 0) { g.beginPath(); g.arc(X(rg.x0 + (i * LP) / 2), Z(rg.z0 + (j * LP) / 2), 0.018 * sx, 0, 2 * Math.PI); g.fill(); }
  g.restore();
  // the dance floor: a lighter panel inside an ochre line
  g.fillStyle = C.rugOchre; rect(dn.x0 - 0.03, dn.z0 - 0.03, dn.x1 + 0.03, dn.z1 + 0.03);
  g.fillStyle = C.rugPanel; rect(dn.x0, dn.z0, dn.x1, dn.z1);
  g.save(); g.beginPath(); g.rect(X(dn.x0), Z(dn.z0), X(dn.x1) - X(dn.x0), Z(dn.z1) - Z(dn.z0)); g.clip();
  blotch(g, r, W, H, 40, "rgba(48,92,88,A)", 0.14, false);
  g.restore();
  return texOf(c);
};
/** a seat mat's top: woven straw inside a cloth binding of the camp's colour */
const padTex = (seed: number, bind: string) => {
  const W = 336, H = 248, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(seed), q = 14;
  g.fillStyle = C.straw; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H / q; y++) for (let x = 0; x < W / q; x++) {
    const v = 0.92 + 0.14 * r();
    g.fillStyle = `rgba(${Math.round(199 * v)},${Math.round(170 * v)},${Math.round(106 * v)},1)`; g.fillRect(x * q, y * q, q, q);
    g.strokeStyle = "rgba(126,98,56,0.45)"; g.lineWidth = 1.4; g.beginPath();
    if ((x + y) % 2) { g.moveTo(x * q, y * q + q / 2); g.lineTo(x * q + q, y * q + q / 2); } else { g.moveTo(x * q + q / 2, y * q); g.lineTo(x * q + q / 2, y * q + q); }
    g.stroke();
  }
  g.strokeStyle = bind; g.lineWidth = 44; g.strokeRect(0, 0, W, H);
  g.strokeStyle = "rgba(232,200,120,0.9)"; g.lineWidth = 4; g.strokeRect(27, 27, W - 54, H - 54);
  return texOf(c);
};
/** a table top: red lacquer inside a black edge, one gold line and two small cloud curls */
const tableTex = (w: number, d: number) => {
  const S = 640, W = S, H = Math.round((S * d) / w), c = canvasOf(W, H), g = c.getContext("2d")!, e = 0.045 * (W / w);
  g.fillStyle = C.lacquer; g.fillRect(0, 0, W, H);
  g.fillStyle = C.red; g.fillRect(e, e, W - 2 * e, H - 2 * e);
  g.strokeStyle = C.gold; g.lineWidth = 0.012 * (W / w); g.strokeRect(e + 14, e + 14, W - 2 * e - 28, H - 2 * e - 28);
  return texOf(c);
};
/** one leaf of the screen: ochre silk in a purple border, a gold line, a black lacquer frame. No emblem: Xiang Yu's
 *  head stands in front of it (and the source tag above him) */
const screenTex = (seed: number, w: number, h: number) => {
  const PX = 360, W = Math.round(w * PX), H = Math.round(h * PX), c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = C.lacquer; g.fillRect(0, 0, W, H);
  // the border: purple with a chain of lozenges (菱纹), a red lacquer line inside the black frame
  const a = 0.05 * PX; g.fillStyle = C.red; g.fillRect(a - 4, a - 4, W - 2 * a + 8, H - 2 * a + 8);
  g.fillStyle = C.purple; g.fillRect(a, a, W - 2 * a, H - 2 * a);
  const b = 0.15 * PX, bm = (a + b) / 2, lz = (b - a) * 0.3;
  g.fillStyle = "#8d6cc0";
  const loz = (x: number, y: number) => { g.beginPath(); g.moveTo(x - lz * 1.5, y); g.lineTo(x, y - lz); g.lineTo(x + lz * 1.5, y); g.lineTo(x, y + lz); g.closePath(); g.fill(); };
  const lozV = (x: number, y: number) => { g.beginPath(); g.moveTo(x, y - lz * 1.5); g.lineTo(x + lz, y); g.lineTo(x, y + lz * 1.5); g.lineTo(x - lz, y); g.closePath(); g.fill(); };
  const nx = Math.round((W - 2 * b) / (0.14 * PX)), ny = Math.round((H - 2 * b) / (0.14 * PX));
  for (let i = 0; i <= nx; i++) { const x = b + ((W - 2 * b) * i) / nx; loz(x, bm); loz(x, H - bm); }
  for (let i = 0; i <= ny; i++) { const y = b + ((H - 2 * b) * i) / ny; lozV(bm, y); lozV(W - bm, y); }
  g.fillStyle = C.gold; g.fillRect(b - 5, b - 5, W - 2 * b + 10, H - 2 * b + 10);
  g.fillStyle = C.silk; g.fillRect(b, b, W - 2 * b, H - 2 * b);
  g.save(); g.beginPath(); g.rect(b, b, W - 2 * b, H - 2 * b); g.clip();
  blotch(g, r, W, H, 14, "rgba(170,134,70,A)", 0.14, false); blotch(g, r, W, H, 10, "rgba(226,200,140,A)", 0.14, false);
  // THE PAINTING: a frieze of running cloud scrolls (云纹) in red lacquer across the TOP of the panel (1.2 m and
  // higher: above Xiang Yu's seated knot), and a quiet row of ochre scrolls along the foot. The middle, where the
  // heads are, stays plain silk
  const scroll = (x: number, y: number, s: number, flip: number, up: number) => {
    g.beginPath();
    for (let i = 0; i <= 44; i++) {
      const t = i / 44, an = t * 2.5 * Math.PI, rr = s * (1 - 0.8 * t), px = x + flip * rr * Math.cos(an), py = y - up * rr * Math.sin(an);
      if (i) g.lineTo(px, py); else g.moveTo(px, py);
    }
    g.stroke();
    // the tail: from the scroll's outer end it sweeps under the scroll to the next one
    g.beginPath(); g.moveTo(x + flip * s, y); g.quadraticCurveTo(x + flip * s * 1.1, y + up * s * 1.25, x - flip * s * 1.35, y + up * s * 1.15); g.stroke();
  };
  const frieze = (y: number, s: number, col: string, lw: number, up: number) => {
    const x0 = b + s * 1.9, x1 = W - b - s * 1.9, n = Math.max(1, Math.round((x1 - x0) / (s * 2.7)));
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i <= n; i++) scroll(x0 + ((x1 - x0) * i) / n, y, s, i % 2 ? -1 : 1, up);
  };
  frieze(H - 1.42 * PX, 0.085 * PX, C.motif, 0.022 * PX, 1);
  frieze(H - 0.3 * PX, 0.06 * PX, "rgba(150,112,52,0.75)", 0.016 * PX, 1);
  g.restore();
  return texOf(c);
};
/** Xiang Yu's banner: deep purple, a gold edge line and a gold 项 (the film's font FrSans must be loaded) */
const bannerTex = (w: number, h: number) => {
  const PX = 420, W = Math.round(w * PX), H = Math.round(h * PX), c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(41);
  g.fillStyle = C.purple; g.fillRect(0, 0, W, H);
  blotch(g, r, W, H, 12, "rgba(60,30,104,A)", 0.3, false);
  g.strokeStyle = C.gold; g.lineWidth = 0.022 * PX; g.strokeRect(0.05 * PX, 0.05 * PX, W - 0.1 * PX, H * 2);
  g.fillStyle = C.gold; g.font = `700 ${Math.round(0.36 * PX)}px FrSans, "Noto Sans SC", "Noto Sans CJK SC", sans-serif`;
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("项", W / 2, 0.36 * PX);
  // two gold bars under the character (a rank mark), then plain cloth down to the tails
  g.fillRect(W / 2 - 0.13 * PX, 0.64 * PX, 0.26 * PX, 0.028 * PX); g.fillRect(W / 2 - 0.13 * PX, 0.71 * PX, 0.26 * PX, 0.028 * PX);
  return texOf(c);
};
/** the door flap, seen from inside: pale cloth lit from behind, three widths of cloth, a bound edge */
const FLAP_H = D.h + 0.02;
const flapTex = () => {
  const W = 512, H = 1024, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(53), FW = D.w + 0.06;
  const X = (m: number) => (m / FW) * W, Y = (m: number) => H * (1 - m / FLAP_H), sx = W / FW;
  g.fillStyle = C.flap; g.fillRect(0, 0, W, H);
  blotch(g, r, W, H, 14, "rgba(196,180,140,A)", 0.16, false); blotch(g, r, W, H, 10, "rgba(255,250,232,A)", 0.3, false);
  // hanging folds: a dark flank and a pale one each (stronger than the walls': the flap is the door camera's backdrop)
  for (const [u, a] of [[0.17, 0.3], [0.4, 0.2], [0.62, 0.3], [0.85, 0.2]] as [number, number][]) {
    for (const [dx, col] of [[0, "rgba(150,126,86,A)"], [0.055, "rgba(255,250,232,A)"]] as [number, string][]) {
      const x = u * W + X(dx), w = X(0.06), gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, col.replace("A", "0")); gr.addColorStop(0.5, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0"));
      g.fillStyle = gr; g.fillRect(x - w, 0, 2 * w, H);
    }
  }
  // the seams of its three widths
  for (const u of [1 / 3, 2 / 3]) { const x = u * W, gr = g.createLinearGradient(x - 9, 0, x + 9, 0); gr.addColorStop(0, "rgba(140,120,84,0)"); gr.addColorStop(0.5, "rgba(140,120,84,0.5)"); gr.addColorStop(1, "rgba(140,120,84,0)"); g.fillStyle = gr; g.fillRect(x - 9, 0, 18, H); }
  // a band: purple between two gold lines, a row of gold lozenges in it
  const band = (y0: number, y1: number) => {
    g.fillStyle = C.gold; g.fillRect(0, Y(y1 + 0.035), W, Y(y0 - 0.035) - Y(y1 + 0.035));
    g.fillStyle = C.flap; g.fillRect(0, Y(y1 + 0.018), W, Y(y0 - 0.018) - Y(y1 + 0.018));
    g.fillStyle = C.purple; g.fillRect(0, Y(y1), W, Y(y0) - Y(y1));
    g.fillStyle = C.gold;
    const ym = (Y(y0) + Y(y1)) / 2, hh = (Y(y0) - Y(y1)) * 0.3, n = 9;
    for (let i = 0; i < n; i++) { const x = ((i + 0.5) / n) * W; g.beginPath(); g.moveTo(x - hh * 1.5, ym); g.lineTo(x, ym - hh); g.lineTo(x + hh * 1.5, ym); g.lineTo(x, ym + hh); g.closePath(); g.fill(); }
  };
  // near the hem (under every seated head) and under the lintel. The hem band goes into the roll first: the eye sees
  // the cloth travel when the flap opens
  band(0.2, 0.32); band(1.66, 1.78);
  // THE EMBLEM in the upper middle (above every seated head from the door camera and the master): a four-petal
  // calyx (柿蒂纹) in a ring, Xiang Yu's purple
  {
    const cx = W / 2, cy = Y(1.34), R0 = 0.17 * sx;
    g.strokeStyle = C.purple; g.lineWidth = 0.03 * sx; g.beginPath(); g.arc(cx, cy, R0, 0, 2 * Math.PI); g.stroke();
    g.fillStyle = C.purple;
    for (let k = 0; k < 4; k++) {
      g.save(); g.translate(cx, cy); g.rotate((k * Math.PI) / 2);
      g.beginPath(); g.moveTo(0, -0.015 * sx); g.quadraticCurveTo(0.05 * sx, -0.07 * sx, 0, -0.135 * sx); g.quadraticCurveTo(-0.05 * sx, -0.07 * sx, 0, -0.015 * sx); g.fill();
      g.restore();
    }
    g.fillStyle = C.gold; g.beginPath(); g.arc(cx, cy, 0.022 * sx, 0, 2 * Math.PI); g.fill();
  }
  // bound sides (4 cm of each edge are inside the door posts): a purple binding with a gold line, and three cord
  // ties with toggles on each side
  for (const s of [0, 1]) {
    g.fillStyle = C.purple; g.fillRect(s ? W - X(0.115) : 0, 0, X(0.115), H);
    g.fillStyle = C.gold; g.fillRect(s ? W - X(0.135) : X(0.115), 0, X(0.02), H);
    for (const y of [0.62, 1.05, 1.48]) {
      const x0 = s ? W - X(0.135) : X(0.135), dir = s ? -1 : 1;
      g.strokeStyle = C.woodDark; g.lineWidth = 0.016 * sx; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, Y(y)); g.lineTo(x0 + dir * X(0.075), Y(y)); g.stroke();
      g.fillStyle = C.woodDark; g.fillRect(x0 + dir * X(0.075) - X(0.013), Y(y + 0.035), X(0.026), Y(y - 0.035) - Y(y + 0.035));
    }
  }
  return texOf(c);
};
/** round timber, v along the post: a soft grain, and pale rope lashings at the heights `ropes` (0 = foot .. 1 = top),
 *  each `lash` of the post's length high */
const postTex = (ropes: number[], lash: number) => {
  const W = 64, H = 1024, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(31);
  g.fillStyle = C.wood; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "rgba(84,54,30,0.22)" : "rgba(168,122,80,0.2)"; g.fillRect(4 + r() * (W - 14), 0, 3 + 4 * r(), H); }
  for (const v of ropes) {
    const hh = H * lash, y0 = H * (1 - v) - hh / 2, n = Math.max(3, Math.round(hh / 9));
    g.fillStyle = C.rope; g.fillRect(0, y0, W, hh);
    g.fillStyle = "rgba(104,78,44,0.85)";
    for (let k = 0; k <= n; k++) g.fillRect(0, y0 + (hh * k) / n - 1.5, W, 3);
  }
  return texOf(c, true, false);
};
/** bronze with two raised bands (a vessel's belly), v along the profile */
const bronzeBandTex = () => {
  // (u round the vessel, v along its profile from the foot (0) to the lid's knob (1); canvas y = H (1 - v))
  const W = 512, H = 512, c = canvasOf(W, H), g = c.getContext("2d")!, Y = (v: number) => H * (1 - v);
  g.fillStyle = C.bronze; g.fillRect(0, 0, W, H);
  g.fillStyle = "#c79a48"; g.fillRect(0, Y(0.52), W, Y(0.3) - Y(0.52));                               // the belly: a lighter shoulder
  // three cast bands: a dark ground between two raised lines; in the two belly bands a row of triangles (锯齿纹)
  const band = (v0: number, v1: number, teeth: number) => {
    g.fillStyle = "#6e5326"; g.fillRect(0, Y(v1), W, Y(v0) - Y(v1));
    g.fillStyle = "#e0bb62"; g.fillRect(0, Y(v1) - 3, W, 5); g.fillRect(0, Y(v0) - 2, W, 5);
    if (!teeth) return;
    g.fillStyle = "#cfa24c";
    for (let i = 0; i < teeth; i++) { const x0 = (i / teeth) * W, x1 = ((i + 1) / teeth) * W; g.beginPath(); g.moveTo(x0 + 3, Y(v0) - 3); g.lineTo(x1 - 3, Y(v0) - 3); g.lineTo((x0 + x1) / 2, Y(v1) + 5); g.closePath(); g.fill(); }
  };
  band(0.1, 0.135, 0); band(0.27, 0.36, 16); band(0.5, 0.57, 16); band(0.8, 0.83, 0);
  return texOf(c, true, false);
};
/** OUTSIDE THE DOOR. The ground runs CAMP_D m out to a plate CAMP_W x CAMP_H m with the camp painted on it (sky, the
 *  horizon at eye height, tents in Xiang Yu's colours, banner poles: flat, bright, a little hazy). The plate is far,
 *  so that the line where it meets the ground lies on the painted horizon. */
const GROUND_X = 9, CAMP_W = 44, CAMP_H = 22, CAMP_D = 30, CAMP_HORIZON = 1.5, OUT_TEX_D = 12, OUT_TEX_W = 10, OUT_COL = "#d6c595", SILL = 0.06, CAMP_DROP = 6;
/** the camp painting covers the plate's lowest CAMP_TEX_H m (above it: its top row, plain sky) */
const CAMP_TEX_H = 11;
const campTex = () => {
  const W = 4096, H = 1024, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(61), PX = W / CAMP_W, hz = H - CAMP_HORIZON * PX;
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, "#8fc6ee"); sky.addColorStop(1, "#e2f0f6");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // far hills, hazy
  g.fillStyle = "#b7c8da"; g.beginPath(); g.moveTo(0, hz);
  for (let x = 0; x <= W; x += 16) g.lineTo(x, hz - PX * (1.5 + 0.8 * Math.sin(x / (PX * 5.3)) + 0.45 * Math.sin(x / (PX * 2.1) + 1.7)));
  g.lineTo(W, hz); g.closePath(); g.fill();
  g.fillStyle = OUT_COL; g.fillRect(0, hz, W, H - hz);                                              // the ground, as the plane in front of it
  // PAINTED IN THE FILM'S LINE: every near thing has a dark outline LW wide (5 cm: about the ink pass's line at the
  // door camera's distance), drawn here because the plate is never inked
  const LW = 0.05 * PX;
  g.lineJoin = "round"; g.lineCap = "round";
  /** an army tent of cloth on poles: walls a little wider at the foot, a roof that SAGS to a peak, a scalloped
   *  valance, a dark door slit, a ball on the peak, two guy ropes to the ground */
  const tent = (x: number, base: number, w: number, h: number, body: string, roof: string, ink: boolean) => {
    const eave = base - h * 0.42, top = base - h, hw = w / 2, ew = hw * 1.18, rise = eave - top;
    g.strokeStyle = C.inkSoft;
    if (ink) { g.lineWidth = LW * 0.6; g.beginPath(); for (const s of [-1, 1]) { g.moveTo(x + s * ew, eave); g.lineTo(x + s * (ew + h * 0.28), base); } g.stroke(); }
    g.lineWidth = LW;
    g.beginPath(); g.moveTo(x - hw, eave - 2); g.lineTo(x + hw, eave - 2); g.lineTo(x + hw * 1.07, base); g.lineTo(x - hw * 1.07, base); g.closePath();
    g.fillStyle = body; g.fill(); if (ink) g.stroke();
    g.beginPath(); g.moveTo(x, eave + h * 0.07); g.lineTo(x + hw * 0.3, base); g.lineTo(x - hw * 0.3, base); g.closePath();
    g.fillStyle = ink ? "#4d4266" : roof; g.fill();
    g.beginPath(); g.moveTo(x - ew, eave); g.quadraticCurveTo(x - hw * 0.42, eave - rise * 0.34, x, top); g.quadraticCurveTo(x + hw * 0.42, eave - rise * 0.34, x + ew, eave);
    const ns = 6;
    for (let i = 0; i < ns; i++) { const xa = x + ew - (2 * ew * i) / ns, xb = x + ew - (2 * ew * (i + 1)) / ns; g.quadraticCurveTo((xa + xb) / 2, eave + h * 0.085, xb, eave); }
    g.closePath(); g.fillStyle = roof; g.fill(); if (ink) g.stroke();
    if (ink) { g.beginPath(); g.arc(x, top - h * 0.02, h * 0.035, 0, 2 * Math.PI); g.fillStyle = "#d0a84a"; g.fill(); g.stroke(); }
  };
  // the far row: small, pale, no line (haze)
  for (let i = 0; i < 20; i++) tent(W * (0.02 + 0.05 * i + 0.01 * r()), hz + 2, PX * (2.0 + 0.5 * r()), PX * (1.9 + 0.4 * r()), "#c9c6d6", "#aaa4c2", false);
  // a palisade of pointed stakes behind the near row
  {
    const sw = 0.32 * PX, top = hz - 1.25 * PX;
    g.beginPath(); g.moveTo(0, hz + 0.1 * PX);
    for (let x = 0; x <= W + sw; x += sw) { g.lineTo(x, top + 0.22 * PX); g.lineTo(x + sw / 2, top); g.lineTo(x + sw, top + 0.22 * PX); }
    g.lineTo(W, hz + 0.1 * PX); g.closePath(); g.fillStyle = "#c4ab7a"; g.fill();
    g.strokeStyle = "rgba(92,72,52,0.75)"; g.lineWidth = LW * 0.6; g.stroke();
    g.beginPath(); for (let x = sw; x < W; x += sw) { g.moveTo(x, top + 0.22 * PX); g.lineTo(x, hz + 0.1 * PX); } g.lineWidth = LW * 0.35; g.stroke();
  }
  // the near row: big tents in Xiang Yu's purple-grey, a banner pole with a flying swallow-tailed flag beside each
  for (let i = 0; i < 9; i++) {
    const x = W * (0.045 + 0.115 * i + 0.012 * r()), tw = PX * (3.6 + 0.5 * r()), th = PX * (3.3 + 0.4 * r());
    const bx = x + PX * 2.6, py0 = hz - 5.7 * PX, py1 = hz + 0.45 * PX, pw = 0.11 * PX;
    g.strokeStyle = C.inkSoft; g.lineWidth = LW;
    g.fillStyle = "#8a6a48"; g.beginPath(); g.rect(bx - pw / 2, py0, pw, py1 - py0); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(bx + pw / 2, py0 + 0.15 * PX); g.quadraticCurveTo(bx + 0.8 * PX, py0 - 0.05 * PX, bx + 1.7 * PX, py0 + 0.3 * PX);
    g.lineTo(bx + 1.25 * PX, py0 + 0.75 * PX); g.lineTo(bx + 1.75 * PX, py0 + 1.3 * PX); g.quadraticCurveTo(bx + 0.8 * PX, py0 + 0.95 * PX, bx + pw / 2, py0 + 1.25 * PX); g.closePath();
    g.fillStyle = "#6f45a4"; g.fill(); g.stroke();
    g.fillStyle = "#d0a84a"; g.beginPath(); g.arc(bx + 0.62 * PX, py0 + 0.62 * PX, 0.2 * PX, 0, 2 * Math.PI); g.fill();
    tent(x, hz + 0.5 * PX, tw, th, "#a9a1c0", "#6f6392", true);
  }
  return texOf(c);
};
/** the sunlit ground outside the door: 2 * GROUND_X m wide, the first OUT_TEX_D m from the sill (beyond, its last row:
 *  plain). A trodden path straight out from the door and the long shadows of two banner poles: "sun" at a glance,
 *  also from the high cameras, which see only ground through the doorway */
const outsideTex = () => {
  // (OUT_TEX_W m wide round the door's axis, OUT_TEX_D m out from the sill; beyond: its edge rows, kept plain)
  const W = 2048, H = 2048, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(67), sx = W / OUT_TEX_W, sz = H / OUT_TEX_D;
  const X = (x: number) => (x - D.x + OUT_TEX_W / 2) * sx, Z = (d: number) => d * sz;               // d = metres out from the sill (canvas y)
  g.fillStyle = OUT_COL; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.rect(W * 0.08, 0, W * 0.84, H * 0.86); g.clip();
  blotch(g, r, W, H * 0.9, 30, "rgba(196,176,128,A)", 0.2, false); blotch(g, r, W, H * 0.9, 24, "rgba(232,220,180,A)", 0.25, false);
  g.restore();
  // the path: paler, trodden, widening a little
  const pg = g.createLinearGradient(0, 0, 0, Z(10)); pg.addColorStop(0, "rgba(242,232,200,0.95)"); pg.addColorStop(1, "rgba(242,232,200,0)");
  g.fillStyle = pg; g.beginPath(); g.moveTo(X(D.x - 0.62), 0); g.lineTo(X(D.x + 0.62), 0); g.lineTo(X(D.x + 1.3), Z(10)); g.lineTo(X(D.x - 1.3), Z(10)); g.closePath(); g.fill();
  // two wheel ruts of the carts along the path (they fade with the distance)
  g.lineCap = "round";
  for (const s of [-1, 1]) {
    const rg = g.createLinearGradient(0, Z(0.3), 0, Z(10)); rg.addColorStop(0, "rgba(168,144,100,0.85)"); rg.addColorStop(1, "rgba(168,144,100,0)");
    g.strokeStyle = rg; g.lineWidth = 0.075 * sx; g.beginPath(); g.moveTo(X(D.x + s * 0.36), Z(0.35)); g.bezierCurveTo(X(D.x + s * 0.4), Z(3), X(D.x + s * 0.5 + 0.5), Z(6), X(D.x + s * 0.62 + 1.6), Z(10)); g.stroke();
  }
  // dry grass tufts and pebbles beside the path (seen from above: a small star of blades; a stone with a dark foot)
  const tuft = (x: number, d: number, s: number) => {
    g.strokeStyle = "#8e9254"; g.lineWidth = 0.03 * sx * s;
    for (let k = 0; k < 6; k++) { const an = (k / 6) * 2 * Math.PI + 0.3, l = 0.1 * s * (0.7 + 0.6 * r()); g.beginPath(); g.moveTo(X(x), Z(d)); g.lineTo(X(x) + Math.cos(an) * l * sx, Z(d) + Math.sin(an) * l * sz * 0.7); g.stroke(); }
    g.fillStyle = "#6f7440"; g.beginPath(); g.arc(X(x), Z(d), 0.022 * sx * s, 0, 2 * Math.PI); g.fill();
  };
  const stone = (x: number, d: number, s: number) => {
    g.fillStyle = "rgba(128,106,76,0.85)"; g.beginPath(); g.ellipse(X(x), Z(d) - 0.012 * sz * s, 0.06 * sx * s, 0.045 * sz * s, 0, 0, 2 * Math.PI); g.fill();
    g.fillStyle = "#c4b28c"; g.beginPath(); g.ellipse(X(x), Z(d), 0.05 * sx * s, 0.034 * sz * s, 0, 0, 2 * Math.PI); g.fill();
  };
  for (let i = 0; i < 26; i++) {
    const d = 0.5 + 9 * r(), side = r() < 0.5 ? -1 : 1, off = 0.85 + 0.12 * d + 2.6 * r() * r(), x = D.x + side * off + (side > 0 ? 0.16 * d : 0);
    if (Math.abs(x - D.x) > OUT_TEX_W * 0.4) continue;
    if (i % 3 === 0) stone(x, d, 0.8 + 0.8 * r()); else tuft(x, d, 0.8 + 0.7 * r());
  }
  return texOf(c);
};
/** a soft round glow (for the lamps' halos) */
const glowTex = () => {
  const S = 128, c = canvasOf(S, S), g = c.getContext("2d")!, gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, "rgba(255,214,150,1)"); gr.addColorStop(0.35, "rgba(255,190,110,0.42)"); gr.addColorStop(1, "rgba(255,170,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return texOf(c);
};

// =====================================================================================================================
// geometry helpers
// =====================================================================================================================
/** static pieces collected per material, merged into one mesh each */
class Batch {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  tris = 0;
  add(mat: THREE.Material, g: THREE.BufferGeometry, m?: THREE.Matrix4) {
    const q = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") q.deleteAttribute(k);
    if (m) q.applyMatrix4(m);
    let l = this.map.get(mat); if (!l) this.map.set(mat, (l = []));
    l.push(q);
  }
  flush(into: THREE.Object3D, name: string, o: { cast?: boolean; receive?: boolean; layer?: number; order?: number } = {}) {
    for (const [mat, list] of this.map) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = o.cast ?? true; m.receiveShadow = o.receive ?? true; m.name = name;
      if (o.layer !== undefined) m.layers.set(o.layer);
      if (o.order !== undefined) m.renderOrder = o.order;
      this.tris += m.geometry.attributes.position.count / 3;
      into.add(m);
    }
    this.map.clear();
  }
}
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a level quad at height y with its uv from `uv(x, z)`, facing up (or down) */
const levelQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number], down = false) => {
  const g = new THREE.BufferGeometry(), P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], pos: number[] = [], uvs: number[] = [];
  for (const [x, z] of P) { pos.push(x, y, z); uvs.push(...uv(x, z)); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(down ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
  return g;
};
/** an upright wall piece from floor point a to floor point b (a = its LEFT end as seen from inside the room), from
 *  height y0 to y1, facing the room; uv = (metres along the wall from u0) / WALL_TILE, height / WALL_H */
const wallQuad = (a: THREE.Vector3, b: THREE.Vector3, y0: number, y1: number, u0 = 0) => {
  const g = new THREE.BufferGeometry(), len = a.distanceTo(b), ua = u0 / WALL_TILE, ub = (u0 + len) / WALL_TILE;
  g.setAttribute("position", new THREE.Float32BufferAttribute([a.x, y0, a.z, b.x, y0, b.z, b.x, y1, b.z, a.x, y1, a.z], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([ua, y0 / WALL_H, ub, y0 / WALL_H, ub, y1 / WALL_H, ua, y1 / WALL_H], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
};
/** a turned shape: the profile [radius, height] swept round y (smooth: one silhouette, no small steps) */
const turned = (pts: [number, number][], seg = 28, smooth = 0) => {
  const v = pts.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(smooth ? new THREE.SplineCurve(v).getPoints(smooth).map((q) => new THREE.Vector2(Math.max(q.x, 0), q.y)) : v, seg);
};
/** the geometry pushed out along its normals by t: the back-face hull that draws a thin thing's own outline */
const hullOf = (g: THREE.BufferGeometry, t: number) => {
  const h = g.clone(), p = h.attributes.position as THREE.BufferAttribute, n = h.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
  return h;
};
/** a polygon grown by t (mitred, the mitre capped at sharp points): the contour of a flat thing's black outline */
const grow = (pts: [number, number][], t: number): [number, number][] => {
  const n = pts.length; let area = 0;
  for (let i = 0; i < n; i++) { const a = pts[i], c = pts[(i + 1) % n]; area += a[0] * c[1] - c[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  return pts.map((c, i) => {
    const a = pts[(i + n - 1) % n], d = pts[(i + 1) % n], l1 = Math.hypot(c[0] - a[0], c[1] - a[1]), l2 = Math.hypot(d[0] - c[0], d[1] - c[1]);
    const n1 = [sg * (c[1] - a[1]) / l1, -sg * (c[0] - a[0]) / l1], n2 = [sg * (d[1] - c[1]) / l2, -sg * (d[0] - c[0]) / l2], k = t / Math.max(0.35, 1 + n1[0] * n2[0] + n1[1] * n2[1]);
    return [c[0] + (n1[0] + n2[0]) * k, c[1] + (n1[1] + n2[1]) * k] as [number, number];
  });
};
const M4 = (x: number, y: number, z: number, ry = 0, rz = 0, rx = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), V(1, 1, 1));

// =====================================================================================================================
// the set
// =====================================================================================================================
export type TentSet = {
  /** meshes AND lights: hide the group and the place is off */
  group: THREE.Group;
  /** hides the walls (with their posts) the camera stands behind */
  setView(camPos: THREE.Vector3): void;
  /** the door flap: 0 = hanging shut .. 1 = rolled up to the lintel */
  setFlap(k: number): void;
  /** the lamps' flames: a pure function of t (seconds) */
  animate(t: number): void;
  /** world points: the lamps' flames, the banner's middle, the screen's middle, the door's middle on the ground */
  anchors: { flames: THREE.Vector3[]; banner: THREE.Vector3; screen: THREE.Vector3; door: THREE.Vector3 };
  tris: number;
};

export function buildTent(M: Mats): TentSet {
  const group = new THREE.Group(); group.name = "tent";
  const flat = (color: string, map: THREE.Texture | null = null, rough = 0.9) => M.paint({ color, map, roughness: rough });
  const basic = (o: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial(o);
  const B = new Batch(), NC = new Batch(), OUT = new Batch();               // B casts and receives; NC receives only; OUT: outside the door
  // (the outside writes no depth: the AO pass would draw a dark seam where the ground meets the plate, 30 m away)
  const mOutside = basic({ map: outsideTex(), depthWrite: false });
  let tris = 0;
  const add = <T extends THREE.Object3D>(o: T, into: THREE.Object3D = group) => { into.add(o); return o; };

  // ---- materials
  const mWall = flat("#ffffff", wallTex(), 0.95), mCeil = flat("#4a4250", null, 0.95);
  const tEarth = earthTex(), mEarth = flat("#ffffff", tEarth, 0.95), mRug = flat("#ffffff", rugTex(), 0.95);
  const mLac = flat(C.lacquer, null, 0.45), mRed = flat(C.red, null, 0.45), mBronze = flat(C.bronze, null, 0.5), mGold = flat(C.gold, null, 0.5);
  // round timber: a painted grain, and rope lashings where the cloth is tied on (tall posts: at 0.85, 1.6 and 2.36 m;
  // door posts: under the lintel and at half height). The lintel: grain only
  const mPost = flat("#ffffff", postTex([0.2, 0.38, 0.56], 0.022)), mDoorPost = flat("#ffffff", postTex([0.5, 0.9], 0.05)), mLintel = flat("#ffffff", postTex([], 0)), mWoodDark = flat(C.woodDark);
  const mStrawRed = flat("#ffffff", padTex(71, C.red)), mStrawPurple = flat("#ffffff", padTex(73, C.purple));
  const mBindRed = flat("#a8322d"), mBindPurple = flat(C.purpleDeep);

  // =================================================================================================== the floor
  // a 3 x 3 grid of level quads with shared corners: the middle one is the rug (cut INTO the floor: one level)
  {
    // (the beaten earth runs SILL m out under the door: the shut flap's roller lies on EARTH, not on a sunlit sliver)
    const rg = L.RUG, xs = [-GROUND_X, rg.x0, rg.x1, GROUND_X], zs = [R.z0 - SILL, rg.z0, rg.z1, 9];
    const uvEarth = (x: number, z: number): [number, number] => [x / 2, z / 2];
    const uvRug = (x: number, z: number): [number, number] => [(x - rg.x0) / (rg.x1 - rg.x0), 1 - (z - rg.z0) / (rg.z1 - rg.z0)];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const mid = i === 1 && j === 1;
      NC.add(mid ? mRug : mEarth, levelQuad(xs[i], xs[i + 1], zs[j], zs[j + 1], 0, mid ? uvRug : uvEarth));
    }
    NC.add(mCeil, levelQuad(R.x0 - 0.5, R.x1 + 0.5, R.z0 - 0.5, R.z1 + 0.5, WALL_H, uvEarth, true));
    // outside the door: sunlit ground on the same grid lines (shared corners along the sill: no cracks), unlit, on NOINK
    const uvOut = (x: number, z: number): [number, number] => [(x - D.x + OUT_TEX_W / 2) / OUT_TEX_W, 1 - (R.z0 - z) / OUT_TEX_D];
    for (let i = 0; i < 3; i++) OUT.add(mOutside, levelQuad(xs[i], xs[i + 1], R.z0 - CAMP_D, R.z0 - SILL, 0, uvOut));
  }

  // =================================================================================================== the walls
  // one group per wall (the wall, its posts, what hangs on it): setView hides the ones the camera stands behind
  const wall = { n: new THREE.Group(), e: new THREE.Group(), w: new THREE.Group(), s: new THREE.Group() };
  for (const k of ["n", "e", "w", "s"] as const) { wall[k].name = `tent.wall.${k}`; group.add(wall[k]); }
  const WB = { n: new Batch(), e: new Batch(), w: new Batch(), s: new Batch() };               // walls: receive only
  const PB = { n: new Batch(), e: new Batch(), w: new Batch(), s: new Batch() };               // posts and dressing on a wall
  WB.n.add(mWall, wallQuad(V(R.x1, 0, R.z1), V(R.x0, 0, R.z1), 0, WALL_H));
  WB.e.add(mWall, wallQuad(V(R.x0, 0, R.z1), V(R.x0, 0, R.z0), 0, WALL_H, 0.4));
  WB.w.add(mWall, wallQuad(V(R.x1, 0, R.z0), V(R.x1, 0, R.z1), 0, WALL_H, 0.55));
  // the south wall round the door hole: three pieces that share the hole's corners (u from the wall's east end)
  const dx0 = D.x - D.w / 2, dx1 = D.x + D.w / 2, SZ = R.z0;
  // (five pieces whose corners coincide: a T-junction on the hole's corner leaks single dark pixels)
  for (const [y0, y1] of [[0, D.h], [D.h, WALL_H]] as [number, number][]) {
    WB.s.add(mWall, wallQuad(V(R.x0, 0, SZ), V(dx0, 0, SZ), y0, y1, 0));
    WB.s.add(mWall, wallQuad(V(dx1, 0, SZ), V(R.x1, 0, SZ), y0, y1, dx1 - R.x0));
  }
  WB.s.add(mWall, wallQuad(V(dx0, 0, SZ), V(dx1, 0, SZ), D.h, WALL_H, dx0 - R.x0));
  // posts: round timber, 12 cm, half sunk into the cloth (their axis 3 cm inside the room). Corner posts belong to
  // the two walls they join; a corner is hidden when either of its walls is.
  const post = (x: number, z: number, h = WALL_H + 0.02) => new THREE.CylinderGeometry(POST_R, POST_R, h, 16, 1, true).translate(x, h / 2, z);
  const IN = 0.03, corner = { ne: new THREE.Group(), nw: new THREE.Group(), se: new THREE.Group(), sw: new THREE.Group() };
  for (const [k, x, z] of [["ne", R.x0 + IN, R.z1 - IN], ["nw", R.x1 - IN, R.z1 - IN], ["se", R.x0 + IN, R.z0 + IN], ["sw", R.x1 - IN, R.z0 + IN]] as ["ne" | "nw" | "se" | "sw", number, number][]) {
    const m = new THREE.Mesh(post(x, z), mPost); m.castShadow = false; m.receiveShadow = true; m.name = `tent.post.${k}`; corner[k].add(m); group.add(corner[k]); tris += 32;
  }
  PB.w.add(mPost, post(R.x1 - IN, -1.3));                       // (none north of the screen: Fan Zeng's head is in front of that wall in jadeIn)
  for (const x of [-2.32, 1.78]) PB.s.add(mPost, post(x, SZ + IN));
  // the door frame: two posts whose inner side is the doorway's edge (the hole's edges are inside them), a lintel
  const DOOR_POST_H = D.h + POST_R;                                // the posts end inside the lintel
  // INK: the posts have their axes 3 cm inside the room, the lintel 1 cm more (it covers the posts' tops: two round
  // timbers of one size on one plane touch along a line and leave a speck), and the flap hangs 1 cm behind the posts'
  // axes (FZ below), 2 cm in FRONT of the wall's plane, its edges inside the posts and the lintel. In the first version
  // the flap hung 6.5 cm behind the posts: 1 % of the master's distance, where the ink line comes and goes (header).
  const DOOR_Z = SZ + IN;
  for (const x of [dx0 - POST_R + 0.01, dx1 + POST_R - 0.01]) PB.s.add(mDoorPost, new THREE.CylinderGeometry(POST_R, POST_R, DOOR_POST_H, 16).translate(x, DOOR_POST_H / 2, DOOR_Z));
  PB.s.add(mLintel, new THREE.CylinderGeometry(POST_R, POST_R, D.w + 0.5, 16).rotateZ(Math.PI / 2).translate(D.x, D.h + POST_R - 0.01, DOOR_Z + 0.01));

  // =================================================================================================== outside the door
  // the painted camp far behind the sunlit ground (both unlit, layer NOINK): seen only through the open doorway
  {
    // (the plate goes CAMP_DROP m below the ground in the ground's colour, its bottom texel row: no crack where the
    //  ground ends on it, no void beside the ground's far corners)
    const cg = new THREE.PlaneGeometry(CAMP_W, CAMP_H + CAMP_DROP).translate(D.x, (CAMP_H - CAMP_DROP) / 2, SZ - CAMP_D), cuv = cg.getAttribute("uv"), cpos = cg.getAttribute("position");
    for (let i = 0; i < cuv.count; i++) cuv.setY(i, cpos.getY(i) / CAMP_TEX_H);
    const camp = add(new THREE.Mesh(cg, basic({ map: campTex(), depthWrite: false })), wall.s); camp.layers.set(NOINK); camp.renderOrder = -2; camp.name = "tent.outside.camp";
    tris += 2;
  }

  // =================================================================================================== the flap
  // a pale cloth in the door frame, hung from the lintel, on a roller: it rolls UP (setFlap). The cloth's edges are
  // inside the posts, its top inside the lintel.
  const FZ = SZ + 0.02, tFlap = flapTex();
  const flap = add(new THREE.Mesh(new THREE.PlaneGeometry(D.w + 0.06, 1).translate(0, -0.5, 0), flat("#ffffff", tFlap, 0.95)), wall.s);
  flap.position.set(D.x, D.h + 0.02, FZ); flap.receiveShadow = false; flap.name = "tent.flap";
  (flap.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color("#43361f"); (flap.material as THREE.MeshPhysicalMaterial).emissiveMap = tFlap;
  const roll = add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, D.w + 0.1, 20).rotateZ(Math.PI / 2), flat("#d9cca6", null, 0.95)), wall.s);
  roll.receiveShadow = true; roll.name = "tent.flap.roll"; tris += 2 + 80;
  // daylight on the floor inside the doorway, as far as the flap is open: an additive sheet 2 mm over the floor
  // (no depth written, never inked), fading away from the sill
  const spillTex = (() => {
    // a patch of SUN with a clear edge (a flat shape of light, as the film draws things; only 4 % of soft rim), warm:
    // on the teal rug it reads as lit felt, not as a grey wash
    const W = 256, H = 256, c = canvasOf(W, H), g = c.getContext("2d")!;
    g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, W, H);
    g.filter = "blur(4px)"; g.fillStyle = "rgba(255,216,130,1)";
    g.beginPath(); g.moveTo(W * 0.1, H - 2); g.lineTo(W * 0.9, H - 2); g.lineTo(W * 0.86, H * 0.2); g.lineTo(W * 0.14, H * 0.2); g.closePath(); g.fill();
    g.filter = "none";
    return texOf(c);
  })();
  // THE SILL: a timber board let into the ground across the doorway, flush with the floor (painted: feet walk over
  // it, nothing to trip on or sink into), its ends under the posts. The shut flap's roller lies on it. 1 mm over the
  // floor, NOT 3 mm: the rig's contact shadow lies at 3 mm with the same polygon offset (flicker_fix.md section 5)
  {
    const W = 512, H = 96, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(91);
    g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
    g.fillStyle = C.wood; g.fillRect(0, 7, W, H - 14);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "rgba(84,54,30,0.3)" : "rgba(170,124,82,0.28)"; g.fillRect(0, 12 + r() * (H - 30), W, 3 + 3 * r()); }
    for (const u of [0.12, 0.5, 0.88]) { g.fillStyle = C.bronzeDark; g.beginPath(); g.arc(u * W, H / 2, 11, 0, 2 * Math.PI); g.fill(); g.fillStyle = C.gold; g.beginPath(); g.arc(u * W - 2, H / 2 - 2, 6, 0, 2 * Math.PI); g.fill(); }
    const z0 = SZ - 0.09, z1 = SZ + 0.13, x0 = dx0 - POST_R, x1 = dx1 + POST_R;
    const sill = add(new THREE.Mesh(levelQuad(x0, x1, z0, z1, 0.001, (x, z) => [(x - x0) / (x1 - x0), (z - z0) / (z1 - z0)]), flat("#ffffff", texOf(c), 0.8)), wall.s);
    const sm = sill.material as THREE.Material; sm.polygonOffset = true; sm.polygonOffsetFactor = -2; sm.polygonOffsetUnits = -2;
    sill.receiveShadow = true; sill.name = "tent.door.sill"; tris += 2;
  }
  const spillG = new THREE.BufferGeometry(), sy = 0.001, sd = 1.35;
  // (the patch leans to the west: the sun stands south-east, as the key light of the camp outside)
  spillG.setAttribute("position", new THREE.Float32BufferAttribute([dx0 - 0.1, sy, SZ + 0.01, dx1 + 0.1, sy, SZ + 0.01, dx1 + 0.42, sy, SZ + sd, dx0 + 0.12, sy, SZ + sd], 3));
  spillG.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); spillG.setIndex([0, 2, 1, 0, 3, 2]);
  const mSpill = basic({ map: spillTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const spill = add(new THREE.Mesh(spillG, mSpill), wall.s); spill.layers.set(NOINK); spill.name = "tent.door.light"; spill.visible = false;
  const setFlap = (k: number) => {
    const u = clamp01(k), rr = ROLL_R0 + (ROLL_R1 - ROLL_R0) * u;
    const yShut = rr, yOpen = D.h + 0.005 - rr, yc = yShut + (yOpen - yShut) * u, len = D.h + 0.02 - yc;      // the roller's axis; the cloth above it
    flap.scale.y = len; tFlap.repeat.y = len / (D.h + 0.02); tFlap.offset.y = 1 - tFlap.repeat.y;
    roll.position.set(D.x, yc, FZ); roll.scale.set(1, rr, rr);
    mSpill.opacity = SPILL_K * u; spill.visible = u > 0.001;
  };

  // =================================================================================================== seats: mats and tables
  const tTable = tableTex(L.TABLE.w, L.TABLE.d), mTableTop = flat("#ffffff", tTable, 0.4);
  const LEG = 0.05, TABLE_INK = 0.007;
  const WARE = new Batch(), WAREINK = new Batch(), mInkHull = basic({ color: C.ink, side: THREE.BackSide }), mWareRed = flat("#c23a31", null, 0.4), mFood = flat(C.food, null, 0.9);
  /** a piece of lacquer ware on a table: `side` m to the sitter's left of the table's middle, `fwd` m away from him.
   *  ITS OUTLINE is a second turned shape WARE_INK wider that ends level with the rim (never over the top): a hull
   *  pushed out along the normals stood over the rim and showed its underside as black wedges inside the dish, and
   *  recomputed normals cut a notch into every rim at the lathe's seam (both seen in the close view, round 2) */
  const WARE_INK = 0.0045;
  const ware = (table: THREE.Matrix4, side: number, fwd: number, ear: boolean, food: THREE.Material | null) => {
    const at = M4(side, L.TABLE.h, fwd, ear ? 0.25 : 0), put = (mat: THREE.Material, g: THREE.BufferGeometry, into: Batch = WARE) => {
      if (ear) g.scale(1.4, 1, 1);
      g.applyMatrix4(at); into.add(mat, g, table);
    };
    const r = ear ? 0.058 : 0.08, h = ear ? 0.05 : 0.04, t = WARE_INK;
    put(mLac, turned([[0, 0], [r * 0.62, 0], [r * 0.95, h * 0.6], [r, h], [r * 0.8, h]], 28));                         // the black outside and the rim
    put(mInkHull, turned([[0, 0.001], [r * 0.62 + t, 0.001], [r * 0.95 + t, h * 0.6], [r + t, h - 0.001]], 28), WAREINK);
    put(mWareRed, turned([[r * 0.8, h], [r * 0.6, h * 0.45], [0, h * 0.45]], 28));                                     // the red inside
    // the round dish is served: one smooth dome, 1.5 cm over the rim, its foot inside the dish's wall. No outline of
    // its own: the dish's black rim is its outline
    if (food) put(food, turned([[r * 0.72, h * 0.72], [r * 0.62, h * 0.98], [r * 0.44, h * 1.2], [r * 0.24, h * 1.33], [r * 0.1, h * 1.37], [0, h * 1.37]], 28));
    // the two ears on the long sides: flat lugs level with the rim, their outline a wider lug of the same height
    if (ear) for (const s of [-1, 1]) {
      put(mLac, new THREE.CylinderGeometry(0.03, 0.03, 0.014, 20, 1).scale(1, 1, 0.55).translate(0, h - 0.007, s * (r + 0.004)));
      put(mInkHull, new THREE.CylinderGeometry(0.03 + t, 0.03 + t, 0.012, 20, 1).scale(1, 1, (0.03 * 0.55 + t) / (0.03 + t)).translate(0, h - 0.0075, s * (r + 0.004)), WAREINK);
    }
  };
  /** the foods of the feast, by seat: steamed millet, a dark meat stew, greens */
  const mFoods = [mFood, flat("#a8603c", null, 0.8), flat("#93a65c", null, 0.9)];
  /** a table leg's outline: a box TABLE_INK wider that narrows to the leg's own foot over its lowest 5 cm (a plain
   *  wider box stood on the rug as a black spike round every foot) */
  const legInk = (lx0: number, lz0: number, top: number) => {
    const g = new THREE.BoxGeometry(LEG + 2 * TABLE_INK, top, LEG + 2 * TABLE_INK, 1, 2, 1).translate(0, top / 2, 0), p = g.attributes.position as THREE.BufferAttribute, k = LEG / (LEG + 2 * TABLE_INK);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0.001) p.setXYZ(i, p.getX(i) * k, 0.001, p.getZ(i) * k); else if (y < top - 0.001) p.setY(i, 0.05); }
    g.computeVertexNormals();
    return g.translate(lx0, 0, lz0);
  };
  let seatNo = 0;
  for (const k of Object.keys(L.SEATS) as L.Role[]) {
    const st = L.SEATS[k], T = st.table, xiang = k === "xiangyu" || k === "uncle" || k === "fanzeng";
    // the seat mat: a stack of straw 10 cm high, its top woven, its sides bound in the camp's colour
    const side = xiang ? mBindPurple : mBindRed, top = xiang ? mStrawPurple : mStrawRed;
    const pad = add(new THREE.Mesh(new THREE.BoxGeometry(L.PAD.w, L.PAD.h, L.PAD.d), [side, side, top, side, side, side]));
    pad.position.set(st.top.x, L.PAD.h / 2, st.top.z); pad.rotation.y = st.facing; pad.castShadow = pad.receiveShadow = true; pad.name = `tent.pad.${k}`; tris += 12;
    // the table: a 4 cm top (red inside a black edge), four legs under its corners (open underneath for the robe)
    const m = M4(T.at.x, 0, T.at.z, T.ry);
    const slab = add(new THREE.Mesh(new THREE.BoxGeometry(T.w, 0.04, T.d), [mLac, mLac, mTableTop, mLac, mLac, mLac]));
    slab.position.set(T.at.x, T.h - 0.02, T.at.z); slab.rotation.y = T.ry; slab.castShadow = slab.receiveShadow = true; slab.name = `tent.table.${k}`; tris += 12;
    // INK: the tables are on NOINK with a hull outline (TABLE_INK), like what stands on them. The ink pass draws its
    // lines OVER anything on NOINK that is less than about 1.5 % of the camera's distance + 3 cm in front of the line:
    // a table edge in the ink pass ran as a ragged black line through every bowl, cup and hand at the table's far side.
    slab.layers.set(NOINK);
    WAREINK.add(mInkHull, boxG(-T.w / 2 - TABLE_INK, T.w / 2 + TABLE_INK, T.h - 0.04 - TABLE_INK, T.h + TABLE_INK, -T.d / 2 - TABLE_INK, T.d / 2 + TABLE_INK), m);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const lx0 = sx * (T.w / 2 - 0.0375), lz0 = sz * (T.d / 2 - 0.0375);
      WARE.add(mLac, boxG(-LEG / 2, LEG / 2, 0, T.h - 0.03, -LEG / 2, LEG / 2).translate(lx0, 0, lz0), m);
      WAREINK.add(mInkHull, legInk(lx0, lz0, T.h - 0.03), m);
    }
    // the fixed lacquer ware (black outside, red inside; layer NOINK with its own hull outline: small rims would
    // sparkle in the ink pass): an EAR CUP (耳杯) on the far corner away from the wine cup, a round dish at the far
    // middle. The near half of the table (the hands) and the cup's side (layout Seat.cup) stay free.
    const lx = Math.cos(st.facing), lz = -Math.sin(st.facing), cupSide = Math.sign((st.cup.x - T.at.x) * lx + (st.cup.z - T.at.z) * lz) || 1;
    ware(m, -cupSide * 0.2, 0.05, true, null); ware(m, -cupSide * 0.01, 0.085, false, mFoods[seatNo++ % 3]);
  }
  WARE.flush(group, "tent.ware", { layer: NOINK }); WAREINK.flush(group, "tent.ware.ink", { cast: false, receive: false, layer: NOINK });
  tris += WARE.tris + WAREINK.tris;

  // =================================================================================================== the lamps
  // a bronze stand turned in one piece: a spreading foot, a 9 cm stem with one knot, a dish; the flame on NOINK
  const lampG = turned([[0, 0], [0.15, 0], [0.15, 0.035], [0.075, 0.11], [0.045, 0.2], [0.045, 0.62], [0.075, 0.68], [0.045, 0.74], [0.045, 1.22], [0.085, 1.3], [0.16, 1.36], [0.16, 1.4], [0.12, 1.4], [0, 1.37]], 24);
  const flames: { m: THREE.Mesh; core: THREE.Mesh; glow: THREE.Sprite; y: number; ph: number }[] = [];
  const mFlame = basic({ color: new THREE.Color(2.5, 1.45, 0.5) }), mCore = basic({ color: new THREE.Color(3.1, 2.8, 1.8) }), tGlow = glowTex();
  TENT.lamps.forEach((p, i) => {
    B.add(mBronze, lampG.clone(), M4(p.x, 0, p.z));
    const fy = TENT.flameY, m = add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10).scale(0.85, 1.7, 0.85), mFlame));
    m.position.set(p.x, fy, p.z); m.layers.set(NOINK); m.name = "tent.flame";
    const core = add(new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8).scale(0.85, 1.6, 0.85), mCore));
    core.position.set(p.x, fy - 0.02, p.z); core.layers.set(NOINK);
    const glow = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: tGlow, color: "#ffb060", transparent: true, opacity: GLOW_K, blending: THREE.AdditiveBlending, depthWrite: false })));
    glow.position.set(p.x, fy + 0.02, p.z); glow.scale.setScalar(0.95); glow.layers.set(NOINK); glow.name = "tent.glow";
    flames.push({ m, core, glow, y: fy, ph: i * 1.7 }); tris += 300;
  });

  // =================================================================================================== the screen behind Xiang Yu
  {
    const S = TENT.screen, TH = 0.05, wMid = S.z1 - S.z0, mEdge = mLac;
    const leaf = (w: number, seed: number) => {
      const m = flat("#ffffff", screenTex(seed, w, S.h), 0.7);
      // a box whose -x face (toward the room) carries the painting
      const g = new THREE.Mesh(new THREE.BoxGeometry(TH, S.h, w), [mEdge, m, mEdge, mEdge, mEdge, mEdge]);
      g.castShadow = g.receiveShadow = true; g.name = "tent.screen"; tris += 12;
      return g;
    };
    const mid = add(leaf(wMid, 81), wall.w); mid.position.set(S.x + TH / 2, S.h / 2, (S.z0 + S.z1) / 2);
    // the wings: hinged on the middle leaf's ends, turned toward the room; they overlap the middle leaf by 1 cm
    for (const s of [-1, 1]) {
      const hinge = new THREE.Group(); hinge.position.set(S.x + TH / 2, 0, s > 0 ? S.z1 - 0.01 : S.z0 + 0.01); hinge.rotation.y = -s * S.ang; wall.w.add(hinge);
      const w = leaf(S.wing, 83 + s); w.position.set(0, S.h / 2, s * S.wing / 2); hinge.add(w);
    }
  }

  // =================================================================================================== the banner (south wall, Xiang Yu's side)
  {
    const b = TENT.banner, w = b.x1 - b.x0, h = b.y1 - b.y0, zc = SZ + 0.15;
    // a lacquer rail fixed to the wall (1 cm into it), 17 cm deep: the cloth hangs from its front, 15 cm clear of the wall
    // INK: rail and cloth are on NOINK with their own black outline (BAN_INK): 15 cm off the wall is 2 % of the master's
    // distance, where the ink pass's line comes and goes (the rail's top edge was the hottest line of the shimmer test)
    const BAN_INK = 0.008, rx0 = b.x0 - 0.07, rx1 = b.x1 + 0.07, ry0 = b.y1 - 0.01, ry1 = b.y1 + 0.08;
    const rail = add(new THREE.Mesh(boxG(rx0, rx1, ry0, ry1, SZ - 0.01, SZ + 0.17), mLac), wall.s); rail.layers.set(NOINK); rail.castShadow = rail.receiveShadow = true; rail.name = "tent.banner.rail";
    const railInk = add(new THREE.Mesh(boxG(rx0 - BAN_INK, rx1 + BAN_INK, ry0 - BAN_INK, ry1 + BAN_INK, SZ - 0.01, SZ + 0.17 + BAN_INK), mInkHull), wall.s); railInk.layers.set(NOINK); railInk.name = "tent.banner.rail.ink"; tris += 24;
    // the cloth: two tails at the bottom (its outline is geometry, so the ink follows it); uv = the painting
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, -h); sh.lineTo(0, -h + 0.2); sh.lineTo(-w / 2, -h); sh.closePath();
    const g = new THREE.ShapeGeometry(sh), p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, 1 + p.getY(i) / h);
    const cloth = add(new THREE.Mesh(g, M.paint({ color: "#ffffff", map: bannerTex(w, h), roughness: 0.9, side: THREE.DoubleSide })), wall.s);
    cloth.position.set((b.x0 + b.x1) / 2, b.y1 + 0.01, zc); cloth.castShadow = cloth.receiveShadow = true; cloth.name = "tent.banner"; cloth.layers.set(NOINK); tris += 3;
    // its outline: the same shape BAN_INK larger (mitred), black, 6 mm behind the cloth
    const pts: [number, number][] = [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [0, -h + 0.2], [-w / 2, -h]], n = pts.length, osh = new THREE.Shape();
    let area = 0; for (let i = 0; i < n; i++) { const a = pts[i], c = pts[(i + 1) % n]; area += a[0] * c[1] - c[0] * a[1]; }
    const sg = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const a = pts[(i + n - 1) % n], c = pts[i], d = pts[(i + 1) % n];
      const l1 = Math.hypot(c[0] - a[0], c[1] - a[1]), l2 = Math.hypot(d[0] - c[0], d[1] - c[1]);
      const n1 = [sg * (c[1] - a[1]) / l1, -sg * (c[0] - a[0]) / l1], n2 = [sg * (d[1] - c[1]) / l2, -sg * (d[0] - c[0]) / l2], k = BAN_INK / Math.max(0.35, 1 + n1[0] * n2[0] + n1[1] * n2[1]);
      const x = c[0] + (n1[0] + n2[0]) * k, y = c[1] + (n1[1] + n2[1]) * k;
      if (i === 0) osh.moveTo(x, y); else osh.lineTo(x, y);
    }
    osh.closePath();
    const clothInk = add(new THREE.Mesh(new THREE.ShapeGeometry(osh), basic({ color: C.ink, side: THREE.DoubleSide })), wall.s);
    clothInk.position.set((b.x0 + b.x1) / 2, b.y1 + 0.01, zc - 0.006); clothInk.layers.set(NOINK); clothInk.name = "tent.banner.ink"; tris += 3;
  }

  // =================================================================================================== the weapon rack
  // a lacquer plinth against the wall (its front painted), two posts and a rail, a foot rail in front of the butts;
  // two halberds (戟) and a spear (矛) stand in it, leaning on the rail's front
  {
    const k = TENT.rack, zf = k.z1, zb = SZ - 0.01, px = 0.09;
    // the plinth's front: black lacquer, a red line frame, three red lozenges with gold hearts
    const fw = k.x1 - k.x0, FP = 600, ct = canvasOf(Math.round(fw * FP), Math.round(0.4 * FP)), cg = ct.getContext("2d")!;
    cg.fillStyle = C.lacquer; cg.fillRect(0, 0, ct.width, ct.height);
    cg.strokeStyle = C.red; cg.lineWidth = 0.018 * FP; cg.strokeRect(0.05 * FP, 0.05 * FP, ct.width - 0.1 * FP, ct.height - 0.1 * FP);
    for (const u of [0.25, 0.5, 0.75]) {
      const x = u * ct.width, y = ct.height / 2, a = 0.075 * FP;
      cg.fillStyle = C.red; cg.beginPath(); cg.moveTo(x - a, y); cg.lineTo(x, y - a * 1.25); cg.lineTo(x + a, y); cg.lineTo(x, y + a * 1.25); cg.closePath(); cg.fill();
      cg.fillStyle = C.gold; cg.beginPath(); cg.arc(x, y, a * 0.28, 0, 2 * Math.PI); cg.fill();
    }
    const plinth = add(new THREE.Mesh(boxG(k.x0, k.x1, 0, 0.4, zb, zf), [mLac, mLac, mLac, mLac, flat("#ffffff", texOf(ct), 0.45), mLac]), wall.s);
    plinth.castShadow = plinth.receiveShadow = true; plinth.name = "tent.rack.plinth"; tris += 12;
    PB.s.add(mRed, boxG(k.x0 + 0.02, k.x1 - 0.02, 0.4 - 0.01, 0.425, zb, zf - 0.02));                                   // a red top board, set back 2 cm all round
    for (const x of [k.x0 + 0.02, k.x1 - 0.02 - px]) PB.s.add(mLac, boxG(x, x + px, 0.415, 1.34, zf - 0.13 - px, zf - 0.13));   // (their tops 1.5 cm under the tassels)
    // the weapons (layer NOINK, their own outlines): built along +y from the butt, then leant back
    const HB = new Batch(), HULL = new Batch(), mShaft = flat(C.shaft), mSteelHi = flat(C.steelHi, null, 0.4), mSteelLo = flat(C.steelLo, null, 0.4), mTassel = flat(C.tassel), mInk = basic({ color: C.ink, side: THREE.BackSide }), mInkFlat = basic({ color: C.ink, side: THREE.DoubleSide });
    const INK = 0.006, LEN = 1.6;
    // the rail between the posts (its ends inside them) and the foot rail on the top board that hides the butts: on
    // NOINK with a wider black box behind each, like the weapons that stand between them. (As an inked box the rail's
    // two edge lines were drawn OVER the three shafts: the ink pass draws over NOINK things that are nearer than
    // 1.5 % + 3 cm in front of an inked edge)
    {
      const rz0 = zf - 0.13 - px + 0.01, rz1 = zf - 0.13 - 0.01;
      HB.add(mLac, boxG(k.x0 + 0.03, k.x1 - 0.03, 1.2, 1.29, rz0, rz1)); HULL.add(mInk, boxG(k.x0 + 0.03, k.x1 - 0.03, 1.2 - INK, 1.29 + INK, rz0 - INK, rz1 + INK));
      HB.add(mLac, boxG(k.x0 + 0.05, k.x1 - 0.05, 0.42, 0.5, zf - 0.05, zf - 0.025)); HULL.add(mInk, boxG(k.x0 + 0.05 - INK, k.x1 - 0.05 + INK, 0.42, 0.5 + INK, zf - 0.05 - INK, zf - 0.025 + INK));
    }
    /** a round part and its outline: the same turned profile, INK wider (smooth: the lathe's own normals are kept) */
    const round = (mat: THREE.Material, pts: [number, number][], m: THREE.Matrix4, seg = 20) => {
      HB.add(mat, turned(pts, seg), m);
      HULL.add(mInk, turned(pts.map(([r, y], i) => [r > 0 ? r + INK : 0, y + (i === 0 ? -INK : i === pts.length - 1 ? INK : 0)] as [number, number]), seg), m);
    };
    /** a flat blade, 12 mm thick, in two tones along its midrib (`hi` the lit half, `lo` the shaded one: flat metal,
     *  no white), and its outline: the whole blade's contour INK wider, black, behind it */
    const blade = (hi: [number, number][], lo: [number, number][], contour: [number, number][], m: THREE.Matrix4, dz = 0) => {
      const ext = (pts: [number, number][]) => new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.012, bevelEnabled: false }).translate(0, 0, -0.006 + dz);
      HB.add(mSteelHi, ext(hi), m); HB.add(mSteelLo, ext(lo), m);
      HULL.add(mInkFlat, new THREE.ShapeGeometry(new THREE.Shape(grow(contour, INK).map(([x, y]) => new THREE.Vector2(x, y)))).translate(0, 0, -0.009 + dz), m);
    };
    // left and right: halberds (戟: a long point and ONE side blade like a dagger-axe, with its lobe down the shaft,
    // the blades outward); the middle one a spear (矛), 0.2 m longer: no head is beside another head, nothing touches
    const xm = (k.x0 + k.x1) / 2;
    [xm - 0.135, xm, xm + 0.135].forEach((x, i) => {
      const len = i === 1 ? LEN + 0.2 : LEN, d = i - 1;
      const zButt = zf - 0.07, yButt = 0.415, zRail = zf - 0.13 + 0.024, lean = Math.atan2(zButt - zRail, 1.245 - yButt);
      const m = M4(x, yButt, zButt, 0, 0, -lean), y0 = len - 0.36;                                            // y0 = where the steel begins
      round(mShaft, [[0.016, 0], [0.016, y0 - 0.04]], m, 14);
      round(mBronze, [[0.023, y0 - 0.1], [0.021, y0 + 0.02]], m);                                              // the bronze socket
      // the point: a long leaf with a midrib
      const tip = y0 + (d ? 0.36 : 0.42), wd = d ? 0.03 : 0.036, sh = y0 + 0.1;
      blade([[0, y0], [-0.017, y0], [-wd, sh], [0, tip]], [[0, y0], [0, tip], [wd, sh], [0.017, y0]], [[-0.017, y0], [-wd, sh], [0, tip], [wd, sh], [0.017, y0]], m);
      // the side blade (援) with its lobe (胡) down the shaft: it rises a little toward its point
      if (d) {
        const ys = y0 + 0.07, P = (px2: number, py: number): [number, number] => [d * px2, py];
        const up = [P(0.012, ys), P(0.012, ys + 0.034), P(0.15, ys + 0.058), P(0.27, ys + 0.05)], dn = [P(0.012, ys), P(0.27, ys + 0.05), P(0.13, ys - 0.006), P(0.06, ys - 0.03), P(0.034, ys - 0.11), P(0.012, ys - 0.11)];
        const ct2 = [P(0.012, ys + 0.034), P(0.15, ys + 0.058), P(0.27, ys + 0.05), P(0.13, ys - 0.006), P(0.06, ys - 0.03), P(0.034, ys - 0.11), P(0.012, ys - 0.11)];
        blade(up, dn, ct2, m, -0.008);                                                                      // (8 mm behind the point: where they overlap the point is in front, no two faces in one plane)
      }
      // the tassel (缨) under the socket: a bound tuft that hangs and spreads, purple, with a gold binding
      round(mTassel, [[0, y0 - 0.3], [0.03, y0 - 0.3], [0.05, y0 - 0.27], [0.036, y0 - 0.17], [0.022, y0 - 0.12]], m);
      round(mGold, [[0.024, y0 - 0.125], [0.024, y0 - 0.1]], m);
    });
    HB.flush(wall.s, "tent.halberds", { layer: NOINK }); HULL.flush(wall.s, "tent.halberds.ink", { cast: false, receive: false, layer: NOINK });
    tris += HB.tris + HULL.tris;
  }

  // =================================================================================================== the wine vessel on its stand
  {
    const p = TENT.wine.at, SH = 0.26, sw = 0.38;
    const top = add(new THREE.Mesh(new THREE.BoxGeometry(sw, 0.04, sw), [mLac, mLac, mRed, mLac, mLac, mLac]), wall.s);
    top.position.set(p.x, SH - 0.02, p.z); top.castShadow = top.receiveShadow = true; top.name = "tent.wine.stand"; tris += 12;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) PB.s.add(mLac, boxG(-LEG / 2, LEG / 2, 0, SH - 0.03, -LEG / 2, LEG / 2).translate(p.x + sx * (sw / 2 - 0.04), 0, p.z + sz * (sw / 2 - 0.04)));
    // a bronze 壶: a spreading ring foot that STANDS on the board, a round belly with cast bands, a neck, a lid with a
    // knob: one profile
    const hu = turned([[0, 0], [0.112, 0], [0.112, 0.022], [0.08, 0.05], [0.125, 0.105], [0.155, 0.17], [0.14, 0.24], [0.085, 0.3], [0.072, 0.335], [0.095, 0.355], [0.07, 0.375], [0.03, 0.388], [0.034, 0.402], [0, 0.41]], 32, 70);
    const m = new THREE.Mesh(hu.translate(p.x, SH - 0.005, p.z), flat("#ffffff", bronzeBandTex(), 0.5)); m.castShadow = m.receiveShadow = true; m.name = "tent.wine"; wall.s.add(m); tris += 700;
  }

  // ---- flush
  NC.flush(group, "tent.floor", { cast: false }); OUT.flush(wall.s, "tent.outside.ground", { cast: false, receive: false, layer: NOINK, order: -1 });
  B.flush(group, "tent.static");
  // (the cloth takes NO cast shadows: a soft grey blob of a lamp or a halberd on the wall behind a head is noise in a
  //  flat picture; the contact shade of the AO pass still seats everything against the wall)
  for (const k of ["n", "e", "w", "s"] as const) { WB[k].flush(wall[k], `tent.wall.${k}`, { cast: false, receive: false }); PB[k].flush(wall[k], `tent.dress.${k}`); tris += WB[k].tris + PB[k].tris; }
  tris += NC.tris + B.tris + OUT.tris;
  void mGold; void mWoodDark;

  // =================================================================================================== light
  // the film's light set-up for every place: one shadowed key, one hemisphere, one point light (sets/index.ts)
  const key = new THREE.DirectionalLight(TENT_KEY.color, TENT_KEY.intensity), kd = V(...TENT_KEY.dir).normalize();
  key.position.copy(kd).multiplyScalar(30); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  key.shadow.radius = LIGHTS.shadow.radius; key.shadow.bias = LIGHTS.shadow.bias; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5.5, right: 5.5, bottom: -5.5, top: 5.5, near: 1, far: 80 }); key.shadow.camera.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight("#d6d0e4", "#7a6250", 0.5);
  // the lamp beside the door lights the wall, the banner and the doorway (the other lamps have painted halos only)
  const lp = TENT.lamps[0], lamp = new THREE.PointLight("#ffb46a", LAMP_K, 4.5, 2); lamp.position.set(lp.x, TENT.flameY + 0.1, lp.z + 0.25);
  group.add(key, key.target, hemi, lamp);

  const set: TentSet = {
    group,
    setView(c) {
      const n = c.z < R.z1 - 0.02, e = c.x > R.x0 + 0.02, w = c.x < R.x1 - 0.02, s = c.z > R.z0 + 0.02;
      wall.n.visible = n; wall.e.visible = e; wall.w.visible = w; wall.s.visible = s;
      corner.ne.visible = n && e; corner.nw.visible = n && w; corner.se.visible = s && e; corner.sw.visible = s && w;
    },
    setFlap,
    animate(t) {
      // a slow breath, at most 6 %: sums of sines of t only
      for (const f of flames) {
        const k = 1 + 0.035 * Math.sin(t * 5.1 + f.ph) + 0.025 * Math.sin(t * 8.7 + 1.3 * f.ph);
        f.m.scale.set(1, k, 1); f.m.position.y = f.y + 0.04 * (k - 1); f.core.position.y = f.y - 0.02 + 0.02 * (k - 1);
        (f.glow.material as THREE.SpriteMaterial).opacity = GLOW_K * (0.5 + 0.5 * k);
      }
      lamp.intensity = LAMP_K * (1 + 0.035 * Math.sin(t * 5.1) + 0.025 * Math.sin(t * 8.7));
    },
    anchors: {
      flames: TENT.lamps.map((p) => V(p.x, TENT.flameY, p.z)),
      banner: V((TENT.banner.x0 + TENT.banner.x1) / 2, (TENT.banner.y0 + TENT.banner.y1) / 2, SZ + 0.15),
      screen: V(TENT.screen.x, TENT.screen.h / 2, (TENT.screen.z0 + TENT.screen.z1) / 2),
      door: V(D.x, 0, D.z),
    },
    tris: Math.round(tris),
  };
  set.setFlap(0); set.animate(0);
  return set;
}
