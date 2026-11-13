// THE TERRACE (place "terrace", island x 200): 梁山宫's terrace at NOON (PLAN 1, 7D: the serious scene). WP2's set; the
// exports are the contract of sets/index.ts: TERRACE_LOOK, TERRACE_PARAMS, buildTerrace(K) -> { group, view, animate,
// setParam }. Every place-number is layout/terrace.ts TERRACE_SET.
//
// WHAT THERE IS (the camera looks -z out over the parapet)
//   - the porch: pale warm stone flags with a carved central band (clouds, a key fret), the waist-high stone PARAPET
//     (a plinth, panels with painted cloud reliefs, a rounded top rail, square posts with lotus caps every 1.25 m) along
//     the front and round both ends; two vermilion PILLARS (gold band) on stone drums framing the view and two more at
//     the corners; the lacquer lintel with its painted band, the bracket frieze over it, the EAVE: teal soffit with red
//     rafters, round tile ends, the tiled roof; a red silk valance with a scalloped hem under the lintel (it moves in
//     the wind); the hall's red lattice doors behind the camera;
//   - beyond and FAR BELOW (fields.y): the plain painted as one ground (a patchwork of green, gold and ochre fields,
//     hedgerows, a river, villages, the pale ROAD); rows of round trees along the road and the field edges (NOINK
//     blobs: parallax); far blue hills and the noon sky with toon clouds on one painted card; the sky dome above;
//   - THE PROCESSION: tiny carriages (black box, red wheels, a gold canopy, two white horses, a red pennant on every
//     third) travelling the road at walking pace: `carriages` 1 = the long line (day 1), 0 = three (day 2);
//   - two tall black-and-red banners outside the terrace's corners flapping in the WIND (`wind` 0..1), and the valance;
//   - the platform's stone face dropping to the plain under the parapet (seen from the parapet camera).
// INK / FLICKER: the reliefs, flags, rafters, tile ends, fields and far things are PAINT (the far view and the plain are
// NOINK or too large for the checker); inked pieces are chunky (posts 20 cm, the rail 24 cm); the carriages and trees
// are NOINK Parts / blobs. Seeded painting only; animate / setParam are pure functions of their arguments.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, skyAt, farCard, soft, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { TERRACE_SET as S, TX } from "../layout/terrace";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, ceilQuad, wallQuad, quad4, tileUV, lathe, shade, cloudScroll, tileEnds, rockG, roundBox, makeCloth, latticePaint, Part, NOINK, wrapBlotch } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.52, 0.48, 0.44]], [-25, [0.58, 0.55, 0.54]], [-3, [0.68, 0.7, 0.74]], [4, [0.84, 0.88, 0.96]], [30, [0.72, 0.8, 0.96]], [90, [0.6, 0.7, 0.96]]],
  boxes: [{ az: -130, el: 52, rot: 0, w: 36, h: 18, soft: 14, col: [1.0, 0.96, 0.88] }],
};
/** NOON: a high white sun from beyond the parapet (front left), a cool blue sky fill; the figures held under 1 */
export const TERRACE_LOOK: PlaceLook = {
  bg: "#a9cbe9",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.8, color: "#3a3550" },
  cast: {
    key: [-0.32, 0.78, 0.55], tint: [1.0, 0.98, 0.94], tintK: 0.9, gain: 0.93, grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.94, 1.0],
    shade: [1.04, 0.95, 1.34], shadeK: 0.34, wrap: [26, 52], edge: 0.13, broad: 0, bodySat: 0.13, sheen: 0.08, lift: 0, contactLen: 0.5,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** the per-frame dressing: carriages 0..1 (1 = the long line of day 1, 0 = the three of day 2; between = between);
 *  wind 0..1 (the banners and the valance) */
export const TERRACE_PARAMS: Record<string, ParamValue> = { carriages: 1, wind: 1 };

const COL = {
  stone: "#d4bc98", stoneLo: "#b8a07e", grout: "#a08a6e", band: "#c4aa84", relief: "#8c7458",
  para: "#d8c4a2", paraLo: "#baa482", paraHi: "#e6d6ba", paraLine: "#8c7a5e",
  pillar: "#c23b2c", gold: "#dcaa44", goldDim: "#a8802e", lac: "#2e2a34", teal: "#2c8a84", red: "#c43a2e", green: "#3d9656", blue: "#3c6fb2",
  soffit: "#2c7a74", rafter: "#8a3428", tile: "#5e5a68", tileLo: "#46424f",
  silk: "#c8322c", silkLo: "#9c2420", door: "#a8382c", paper: "#efd8a8", wood: "#7e3226", woodLo: "#5e241c",
  face: "#b9ab92", faceLo: "#9e9078",
  field: "#84b844", field2: "#d4b444", field3: "#9cc852", field4: "#e0a244", fieldLo: "#64983c", hedge: "#3f8432", earth: "#cca46c", river: "#58a0d0",
  road: "#e2cfa0", roadLo: "#c9b384", village: "#b98c68", roof: "#6c6474",
  tree: "#4f8a40", treeLo: "#3f7234", treeHi: "#68a04c",
  hill1: "#7ea8cc", hill2: "#6290c0", hill3: "#4c80b0",
  car: "#2e2a34", carTrim: "#c8322c", canopy: "#e2b03a", wheel: "#b8342a", horse: "#efe8dc", horseLo: "#c8bca8", pennant: "#d23a2e",
};
const SKY: SkyStops = [[-10, "#c4d6ea"], [0, "#d4e6f8"], [4, "#b8d6f4"], [14, "#8cbeec"], [35, "#5e9ee0"], [90, "#4284d2"]];
const Pp = S.parapet, F = S.floor, Fd = S.fields, EV = S.eave;

// ---------------------------------------------------------------------------------------------------- the paintings
/** THE FLOOR (the whole porch on one texture: x0..x1 across, z0..z1 down the canvas): 1 m flags in rows, the carved
 *  central band (1.3 m: a key-fret border, cloud scrolls), a kerb along the parapet */
const FWX = 2 * Pp.endX, FWZ = F.z1 - Pp.z;
const floorTex = () => paint(2048, Math.round(2048 * FWZ / FWX), (g, W, H) => {
  const m = W / FWX, X = (x: number) => (x - (TX - Pp.endX)) * m, Z = (z: number) => (z - Pp.z) * m, r = rng(31);
  g.fillStyle = COL.grout; g.fillRect(0, 0, W, H);
  const fs = 1.0 * m, gr = 3;
  for (let j = 0; j * fs < H; j++) for (let i = -1; i * fs < W + fs; i++) {
    const off = j % 2 ? fs * 0.5 : 0, x = i * fs + off, y = j * fs;
    g.fillStyle = shade(COL.stone, (r() - 0.5) * 0.1); g.fillRect(x + gr / 2, y + gr / 2, fs - gr, fs - gr);
    g.save(); g.beginPath(); g.rect(x, y, fs, fs); g.clip();
    for (let b = 0; b < 4; b++) blotch(g, x + r() * fs, y + r() * fs, fs * (0.15 + 0.3 * r()), r() < 0.5 ? "#fffaf0" : "#7a6a58", 0.07);
    g.fillStyle = "rgba(255,250,240,0.12)"; g.fillRect(x, y, fs, gr * 1.5);
    g.restore();
  }
  // the central band (御路): a slab 1.3 m wide along z, a key-fret border, cloud scrolls carved (shadowed lines)
  const bx0 = X(TX - 0.65), bw = 1.3 * m;
  g.fillStyle = COL.band; g.fillRect(bx0, 0, bw, H);
  g.strokeStyle = css(COL.relief, 0.55); g.lineWidth = 4; g.strokeRect(bx0 + 0.06 * m, -10, bw - 0.12 * m, H + 20);
  const fret = 0.11 * m;
  g.lineWidth = 3;
  for (const x0 of [bx0 + 0.09 * m, bx0 + bw - 0.09 * m - fret]) for (let y = 0; y < H; y += fret * 1.4) {
    g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + fret, y); g.lineTo(x0 + fret, y + fret); g.lineTo(x0 + fret * 0.3, y + fret); g.lineTo(x0 + fret * 0.3, y + fret * 0.4); g.lineTo(x0 + fret * 0.65, y + fret * 0.4); g.stroke();
  }
  g.lineWidth = 4.5;
  for (let y = 0.5 * m, i = 0; y < H; y += 0.85 * m, i++) {
    g.strokeStyle = "rgba(255,250,240,0.35)"; cloudScroll(g, bx0 + bw / 2 + 2, y + 2, 0.2 * m, i % 2 ? 1 : -1);
    g.strokeStyle = css(COL.relief, 0.6); cloudScroll(g, bx0 + bw / 2, y, 0.2 * m, i % 2 ? 1 : -1);
  }
  // the kerb along the parapet and a line where the porch meets the hall
  g.fillStyle = COL.stoneLo; g.fillRect(0, 0, W, 0.18 * m);
  g.fillStyle = "rgba(70,60,50,0.35)"; g.fillRect(0, 0.18 * m, W, 3);
  void Z;
}, false);
/** the rail's stone (repeats, 0.9 m): pale marble, soft grey mottling, fine veins and speckles */
const railTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(77);
  g.fillStyle = COL.paraHi; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) wrapBlotch(g, W, H, W * r(), H * r(), 18 + 40 * r(), r() < 0.5 ? COL.para : "#fffdf6", 0.35);
  g.strokeStyle = css(COL.paraLo, 0.35); g.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) { let x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += 30 * (r() - 0.3); y += 20 * (r() - 0.5); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 260; i++) { g.fillStyle = css(COL.paraLo, 0.3 + 0.3 * r()); g.fillRect(W * r(), H * r(), 1.5, 1.5); }
}, true);
/** THE PARAPET PANEL (one post bay, `post` m along u, from the plinth to the rail along v): a framed panel with a
 *  carved cloud relief (light above, shadow below the stroke) */
const PAN_H = 0.66;
const panelTex = () => paint(512, Math.round(512 * PAN_H / Pp.post), (g, W, H) => {
  g.fillStyle = COL.para; g.fillRect(0, 0, W, H);
  const r = rng(37); for (let i = 0; i < 10; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 40 * r(), r() < 0.5 ? COL.paraHi : COL.paraLo, 0.18);
  const f = H * 0.12;
  g.fillStyle = COL.paraLo; g.fillRect(f, f, W - 2 * f, H - 2 * f);
  g.fillStyle = COL.para; g.fillRect(f + 5, f + 5, W - 2 * f - 10, H - 2 * f - 10);
  g.lineWidth = 6; g.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const x = W * (0.25 + 0.25 * i), y = H * (0.5 + (i % 2 ? 0.06 : -0.06));
    g.strokeStyle = css(COL.paraHi, 0.9); cloudScroll(g, x - 2, y - 2, H * 0.17, i % 2 ? 1 : -1);
    g.strokeStyle = css(COL.paraLine, 0.75); cloudScroll(g, x + 1.5, y + 1.5, H * 0.17, i % 2 ? 1 : -1);
  }
}, true);
/** the platform's outer face (one 3 m tile): stone courses, weathering */
const faceTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(39); g.fillStyle = COL.face; g.fillRect(0, 0, W, H);
  const n = 8, ch = H / n;
  for (let j = 0; j < n; j++) for (let i = -1; i < 4; i++) { const x = (i + (j % 2) * 0.5) * W / 3; g.fillStyle = shade(COL.face, (r() - 0.5) * 0.12); g.fillRect(x + 2, j * ch + 2, W / 3 - 4, ch - 4); }
  for (let i = 0; i < 20; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 60 * r(), r() < 0.5 ? COL.faceLo : "#d0c4ac", 0.2);
}, true);
/** a PILLAR's skin (v from the drum's top to the pillar's top) */
const pillarTex = (h: number) => paint(128, 1024, (g, W, Hh) => {
  const y0 = 0.22, py = (y: number) => (1 - (y - y0) / (h - y0)) * Hh, r = rng(43);
  g.fillStyle = COL.pillar; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 14; i++) { const x = r() * W, w = 3 + 9 * r(); g.fillStyle = r() < 0.5 ? "rgba(150,40,32,0.4)" : "rgba(222,92,70,0.22)"; g.fillRect(x, 0, w, Hh); g.fillRect(x - W, 0, w, Hh); }
  const b0 = py(h - 0.55), b1 = py(h - 0.7);
  g.fillStyle = COL.gold; g.fillRect(0, b0, W, b1 - b0); g.fillStyle = "#6e5222"; g.fillRect(0, b0, W, 3); g.fillRect(0, b1 - 3, W, 3);
}, true);
/** the LINTEL's face (along x, v up): lacquer with a painted band (彩画) */
const lintelTex = () => paint(1024, 96, (g, W, H) => {
  g.fillStyle = COL.lac; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.teal; g.fillRect(W * 0.16, H * 0.18, W * 0.68, H * 0.64);
  g.strokeStyle = COL.gold; g.lineWidth = 4; g.strokeRect(W * 0.16, H * 0.18, W * 0.68, H * 0.64); g.lineWidth = 3.5;
  for (let i = 0; i < 7; i++) cloudScroll(g, W * (0.21 + 0.096 * i), H * 0.5, H * 0.2, i % 2 ? 1 : -1);
  for (const [x0, x1] of [[0.02, 0.15], [0.85, 0.98]]) {
    g.fillStyle = COL.red; g.fillRect(W * x0, H * 0.18, W * (x1 - x0), H * 0.64);
    const cx = W * (x0 + x1) / 2, cy = H / 2, s = H * 0.26;
    for (const [dx, col] of [[-1, COL.green], [1, COL.blue]] as [number, string][]) { g.fillStyle = col; g.beginPath(); g.moveTo(cx + dx * s, cy - s); g.lineTo(cx + dx * s + s, cy); g.lineTo(cx + dx * s, cy + s); g.lineTo(cx + dx * s - s, cy); g.closePath(); g.fill(); }
  }
});
/** the BRACKET FRIEZE over the lintel (one 1.25 m bay along u): painted 斗拱 (blocks and arms) on a dark ground */
const bracketTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = "#24302e"; g.fillRect(0, 0, W, H);
  const c = W / 2, b = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x - w / 2, y - h / 2, w, h); g.strokeStyle = COL.gold; g.lineWidth = 2; g.strokeRect(x - w / 2, y - h / 2, w, h); };
  b(c, H * 0.85, W * 0.22, H * 0.22, COL.teal);
  b(c, H * 0.6, W * 0.62, H * 0.12, COL.green);
  for (const s of [-1, 1]) b(c + s * W * 0.28, H * 0.45, W * 0.14, H * 0.16, COL.teal);
  b(c, H * 0.45, W * 0.16, H * 0.16, COL.teal);
  b(c, H * 0.24, W * 0.9, H * 0.12, COL.blue);
  b(c, H * 0.08, W, H * 0.12, COL.red);
}, true);
/** the eave's soffit (u along the eave, 1.25 m; v out): teal boards between red rafters */
const soffitTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = COL.soffit; g.fillRect(0, 0, W, H);
  const n = 8; for (let i = 0; i < n; i++) { const x = (W * (i + 0.5)) / n; g.fillStyle = COL.rafter; g.fillRect(x - 12, 0, 24, H); g.fillStyle = "rgba(255,220,180,0.25)"; g.fillRect(x - 12, 0, 5, H); }
}, true);
const fasciaTex = () => paint(512, 64, (g, W, H) => tileEnds(g, 0, 0, W, H, { n: 8, tile: "#8a8694", tileLo: "#4e4a56", mark: "#5e5a68" }), true);
const roofTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = COL.tile; g.fillRect(0, 0, W, H);
  const n = 6; for (let i = 0; i < n; i++) { const x = (W * (i + 0.5)) / n, gr = g.createLinearGradient(x - W / n / 2, 0, x + W / n / 2, 0); gr.addColorStop(0, css(COL.tileLo, 0.9)); gr.addColorStop(0.35, css("#8a8694", 0.6)); gr.addColorStop(0.7, css(COL.tile, 0)); gr.addColorStop(1, css(COL.tileLo, 0.8)); g.fillStyle = gr; g.fillRect(x - W / n / 2, 0, W / n, H); }
}, true);
/** the coffered ceiling of the porch (one 0.62 m coffer) */
const cofferTex = () => paint(256, 256, (g, W) => {
  g.fillStyle = "#24302e"; g.fillRect(0, 0, W, W);
  const f = W * 0.09; g.fillStyle = COL.soffit; g.fillRect(f, f, W - 2 * f, W - 2 * f);
  g.strokeStyle = COL.gold; g.lineWidth = 4; const c = W / 2; g.beginPath(); g.arc(c, c, W * 0.27, 0, 7); g.stroke();
  g.fillStyle = COL.red; for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + Math.PI / 4; g.beginPath(); g.ellipse(c + Math.cos(a) * W * 0.1, c + Math.sin(a) * W * 0.1, W * 0.11, W * 0.06, a, 0, 7); g.fill(); }
}, true);
/** the hall's front (one 2 m door bay): red lattice doors over paper, a dado */
const doorTex = () => paint(512, 1024, (g, W, H) => {
  g.fillStyle = COL.wood; g.fillRect(0, 0, W, H);
  for (const x0 of [0.06, 0.53]) {
    latticePaint(g, W * x0, H * 0.06, W * 0.41, H * 0.5, { wood: COL.door, woodLo: COL.woodLo, paper: COL.paper, cell: W * 0.08, frame: 6, kind: "step" });
    g.fillStyle = shade(COL.wood, -0.15); g.fillRect(W * x0, H * 0.62, W * 0.41, H * 0.3);
    g.strokeStyle = COL.goldDim; g.lineWidth = 4; g.strokeRect(W * x0 + 10, H * 0.64, W * 0.41 - 20, H * 0.26);
  }
}, true);
/** the valance silk: red with a gold band and a black border, scalloped hem drawn in (the mesh is plain) */
const silkTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = COL.silk; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.gold; g.fillRect(0, H * 0.14, W, H * 0.08);
  g.fillStyle = "#2a2630"; g.fillRect(0, 0, W, H * 0.1);
  g.fillStyle = COL.silkLo; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc((W * (i + 0.5)) / 8, H, W / 16, Math.PI, 0); g.fill(); }
}, true);
/** a long banner: black field, red border, 秦 in red on a gold disc */
const bannerTex = () => paint(256, 768, (g, W, H) => {
  g.fillStyle = "#2a2630"; g.fillRect(0, 0, W, H);
  g.strokeStyle = COL.red; g.lineWidth = W * 0.1; g.strokeRect(0, 0, W, H);
  g.strokeStyle = COL.gold; g.lineWidth = W * 0.025; g.strokeRect(W * 0.12, W * 0.12, W * 0.76, H - W * 0.24);
  g.fillStyle = COL.gold; g.beginPath(); g.arc(W / 2, H * 0.24, W * 0.3, 0, 7); g.fill();
  g.fillStyle = COL.red; g.font = `700 ${Math.round(W * 0.42)}px FrSans, "Noto Sans SC", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("秦", W / 2, H * 0.245);
  g.strokeStyle = "#1a171e"; g.lineWidth = W * 0.03; g.strokeRect(0, 0, W, H);
});

/** THE PLAIN (one painted square round (cx, cz) of `size` m): field patchwork in strips, hedgerows, the river, the
 *  villages, the road (the layout's polyline) */
const PL = { cx: TX + 40, cz: -250, size: 560 };
const plainTex = () => paint(2048, 2048, (g, Wp) => {
  const s = Wp / PL.size, px = (x: number) => (x - PL.cx) * s + Wp / 2, pz = (z: number) => (z - PL.cz) * s + Wp / 2, r = rng(51);
  g.fillStyle = COL.field; g.fillRect(0, 0, Wp, Wp);
  // the patchwork: rotated strips of fields in four colours
  const cols = [COL.field, COL.field2, COL.field3, COL.field4, COL.fieldLo, COL.field3];
  g.save(); g.translate(Wp / 2, Wp / 2); g.rotate(0.35);
  for (let j = -14; j < 14; j++) for (let i = -14; i < 14; i++) {
    const w = (16 + 22 * r()) * s, h = (10 + 14 * r()) * s, x = i * 36 * s + (j % 2) * 12 * s, y = j * 22 * s;
    g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y, w, h);
    g.strokeStyle = css(COL.fieldLo, 0.4); g.lineWidth = 1.5; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x, y + (h * k) / 5); g.lineTo(x + w, y + (h * k) / 5); g.stroke(); }
    g.strokeStyle = css(COL.hedge, 0.85); g.lineWidth = 3; g.strokeRect(x, y, w, h);
  }
  g.restore();
  for (let i = 0; i < 80; i++) blotch(g, Wp * r(), Wp * r(), (10 + 30 * r()) * s, r() < 0.5 ? "#ffffff" : "#3a5a2a", 0.08);
  // the river: a broad soft blue band from far left to near right
  soft(g, 4, () => {
    g.strokeStyle = COL.river; g.lineWidth = 14 * s; g.lineCap = "round"; g.beginPath();
    g.moveTo(px(TX - 280), pz(-430)); g.bezierCurveTo(px(TX - 120), pz(-330), px(TX - 160), pz(-200), px(TX - 60), pz(-140)); g.bezierCurveTo(px(TX + 40), pz(-80), px(TX + 160), pz(-60), px(TX + 300), pz(-20)); g.stroke();
    g.strokeStyle = "rgba(220,240,255,0.5)"; g.lineWidth = 4 * s; g.stroke();
  });
  // villages: clusters of little roofs
  for (const [vx, vz] of [[TX - 110, -210], [TX + 130, -150], [TX - 30, -330], [TX + 210, -390], [TX + 60, -60]] as [number, number][]) {
    for (let k = 0; k < 9; k++) { const x = px(vx + (r() - 0.5) * 30), y = pz(vz + (r() - 0.5) * 20), w = (4 + 3 * r()) * s; g.fillStyle = COL.village; g.fillRect(x - w / 2, y - w * 0.3, w, w * 0.6); g.fillStyle = COL.roof; g.fillRect(x - w / 2 - 1, y - w * 0.5, w + 2, w * 0.3); }
  }
  // THE ROAD: a pale band with darker edges and ruts
  const R = S.road.pts, line = (w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w * s; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); R.forEach(([x, z], i) => (i ? g.lineTo(px(x), pz(z)) : g.moveTo(px(x), pz(z)))); g.stroke(); };
  line(S.road.w + 2, css(COL.roadLo, 0.9)); line(S.road.w, COL.road); line(S.road.w * 0.35, css(COL.roadLo, 0.5));
  // a soft haze toward the far edge
  const hz = g.createLinearGradient(0, pz(-260), 0, 0); hz.addColorStop(0, "rgba(200,220,236,0)"); hz.addColorStop(1, "rgba(200,220,236,0.55)"); g.fillStyle = hz; g.fillRect(0, 0, Wp, pz(-260));
});

// ---------------------------------------------------------------------------------------------------- the road
/** the road polyline as an arc-length lookup: point and heading at s metres from its first point */
const roadPath = () => {
  const P = S.road.pts.map(([x, z]) => new THREE.Vector2(x, z)), cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + P[i].distanceTo(P[i - 1]));
  const L = cum[cum.length - 1];
  const at = (s: number) => {
    const c = Math.max(0, Math.min(L, s)); let i = 1; while (i < P.length - 1 && cum[i] < c) i++;
    const u = (c - cum[i - 1]) / (cum[i] - cum[i - 1]), p = P[i - 1].clone().lerp(P[i], u), d = P[i].clone().sub(P[i - 1]).normalize();
    return { x: p.x, z: p.y, yaw: Math.atan2(d.x, d.y) };
  };
  return { at, L };
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildTerrace(K: Kit) {
  const group = new THREE.Group(); group.name = "terrace";
  const Mk = maker(K, group), B = new Batch();
  const zp = Pp.z, zo = Pp.z - Pp.t, ex = Pp.endX, xL = TX - ex, xR = TX + ex;

  // =================================================================================================== the porch floor
  Mk.mesh("terrace.floor", levelQuad(xL, xR, zp, F.z1, 0, (x, z) => [(x - xL) / FWX, 1 - (z - zp) / FWZ]), Mk.tex(floorTex(), 0.85), { cast: false });

  // =================================================================================================== the parapet
  {
    const mPan = Mk.tex(panelTex(), 0.9), mStone = Mk.flat(COL.para, 0.9), mStoneLo = Mk.flat(COL.paraLo, 0.9), mRail = Mk.tex(railTex(), 0.85);
    const plinthH = 0.12, railY0 = plinthH + PAN_H, top = Pp.top, post = 0.2;
    // runs: the front (along x), the two ends (along z), each as [a, b] on the parapet's middle line
    const runs: { a: THREE.Vector2; b: THREE.Vector2; alongX: boolean }[] = [
      { a: new THREE.Vector2(xL - Pp.t / 2, zp - Pp.t / 2), b: new THREE.Vector2(xR + Pp.t / 2, zp - Pp.t / 2), alongX: true },
      { a: new THREE.Vector2(xL - Pp.t / 2, zp - Pp.t / 2), b: new THREE.Vector2(xL - Pp.t / 2, F.z1 - 0.3), alongX: false },
      { a: new THREE.Vector2(xR + Pp.t / 2, zp - Pp.t / 2), b: new THREE.Vector2(xR + Pp.t / 2, F.z1 - 0.3), alongX: false },
    ];
    for (const R of runs) {
      const t2 = Pp.t / 2, x0 = Math.min(R.a.x, R.b.x) - (R.alongX ? 0 : t2), x1 = Math.max(R.a.x, R.b.x) + (R.alongX ? 0 : t2);
      const z0 = Math.min(R.a.y, R.b.y) - (R.alongX ? t2 : 0), z1 = Math.max(R.a.y, R.b.y) + (R.alongX ? t2 : 0);
      Mk.mesh("terrace.parapet.plinth", boxG(x0 - 0.03, x1 + 0.03, 0, plinthH, z0 - 0.03, z1 + 0.03), mStoneLo);
      const len = R.a.distanceTo(R.b), n = Math.round(len / Pp.post), step = len / n;
      const pan = tileUV(boxG(x0 + 0.01, x1 - 0.01, plinthH - 0.01, railY0 + 0.01, z0 + 0.04, z1 - 0.04), step, PAN_H + 0.02, R.alongX ? R.a.x : R.a.y, plinthH - 0.01);
      Mk.mesh("terrace.parapet", pan, mPan);
      Mk.mesh("terrace.parapet.rail", tileUV(roundBox(x1 - x0 + 0.04, top - railY0, z1 - z0 + 0.04, 0.05).translate((x0 + x1) / 2, (railY0 + top) / 2, (z0 + z1) / 2), 0.9), mRail);
      // the posts with lotus caps
      for (let i = 0; i <= n; i++) {
        const p = R.a.clone().lerp(R.b, i / n);
        B.add(mStone, boxG(p.x - post / 2, p.x + post / 2, 0, top + 0.1, p.y - post / 2, p.y + post / 2));
        B.add(mStoneLo, lathe([[0, top + 0.08], [0.13, top + 0.09], [0.15, top + 0.14], [0.12, top + 0.2], [0.06, top + 0.25], [0, top + 0.27]], 16).translate(p.x, 0, p.y));
      }
    }
  }

  // =================================================================================================== pillars, lintel, eave, roof
  const Pl = S.pillars, mPillar = Mk.tex(pillarTex(Pl.h), 0.5), mDrum = Mk.flat(COL.paraLo, 0.85);
  const pillarXs = [-Pl.x, Pl.x, -(ex - 0.32), ex - 0.32];
  for (const dx of pillarXs) {
    const x = TX + dx;
    B.add(mDrum, lathe([[0, 0], [0.36, 0], [0.36, 0.08], [0.33, 0.16], [0.28, 0.22], [0, 0.22]], 28).translate(x, 0, Pl.z));
    B.add(mPillar, new THREE.CylinderGeometry(Pl.d / 2, Pl.d / 2, Pl.h - 0.2, 32).translate(x, 0.2 + (Pl.h - 0.2) / 2, Pl.z));
  }
  B.flush(group, "terrace.pillar");
  const lac = Mk.flat(COL.lac, 0.45), lintelY0 = Pl.h - 0.38;
  Mk.mesh("terrace.lintel", boxG(xL - 0.3, xR + 0.3, lintelY0, Pl.h, Pl.z - 0.16, Pl.z + 0.16), [lac, lac, lac, lac, Mk.tex(lintelTex(), 0.5), Mk.tex(lintelTex(), 0.5)]);
  Mk.mesh("terrace.brackets", tileUV(boxG(xL - 0.3, xR + 0.3, Pl.h, EV.ceil, Pl.z - 0.1, Pl.z + 0.1), Pp.post, EV.ceil - Pl.h, TX - Pp.post / 2, Pl.h), Mk.tex(bracketTex(), 0.7));
  // the soffit from the lintel's front out to the eave (u along x, v out), the fascia, the roof over all
  const mSoff = Mk.tex(soffitTex(), 0.85), eY = EV.y, fz = EV.z0;
  Mk.mesh("terrace.soffit", quad4(new THREE.Vector3(xR + 0.6, Pl.h + 0.02, Pl.z - 0.16), new THREE.Vector3(xL - 0.6, Pl.h + 0.02, Pl.z - 0.16), new THREE.Vector3(xL - 0.6, eY + 0.12, fz), new THREE.Vector3(xR + 0.6, eY + 0.12, fz), (xR - xL + 1.2) / Pp.post, 1), mSoff, { cast: false });
  Mk.mesh("terrace.fascia", tileUV(boxG(xL - 0.65, xR + 0.65, eY - 0.06, eY + 0.2, fz - 0.08, fz), Pp.post, 0.26, TX - Pp.post / 2, eY - 0.06), [lac, lac, lac, lac, lac, Mk.tex(fasciaTex(), 0.8)]);
  Mk.mesh("terrace.roof", quad4(new THREE.Vector3(xR + 0.65, eY + 0.2, fz - 0.08), new THREE.Vector3(xL - 0.65, eY + 0.2, fz - 0.08), new THREE.Vector3(xL - 0.65, EV.ceil + 1.6, F.z1), new THREE.Vector3(xR + 0.65, EV.ceil + 1.6, F.z1), (xR - xL) / 1.2, 5), Mk.tex(roofTex(), 0.85));
  Mk.mesh("terrace.ceiling", ceilQuad(xL - 0.6, xR + 0.6, Pl.z + 0.1, F.z1, EV.ceil, (x, z) => [x / 0.62, z / 0.62]), Mk.tex(cofferTex(), 0.85), { cast: false });
  // the hall's front wall (doors) behind the camera, and the end walls under the roof's gables
  Mk.mesh("terrace.hall", wallQuad([xR + 0.6, F.z1], [xL - 0.6, F.z1], 0, EV.ceil, { u0: 0, tileU: 2.0 }), Mk.tex(doorTex(), 0.8), { cast: false });

  // =================================================================================================== the valance (moves in the wind)
  const silk = Mk.tex(silkTex(), 0.85, THREE.DoubleSide);
  const valance = makeCloth(silk, 2 * Pl.x - Pl.d, 0.42, { nx: 14, ny: 3, ph: 0.4, freq: 1.4 });
  valance.mesh.name = "terrace.valance"; valance.mesh.position.set(TX, lintelY0 + 0.01, Pl.z + 0.18); group.add(valance.mesh);

  // =================================================================================================== the banners outside the corners
  const banners: { sway: (t: number, a: number) => void }[] = [];
  {
    const mPole = Mk.flat(COL.lac, 0.5), mB = Mk.tex(bannerTex(), 0.85, THREE.DoubleSide), Bn = S.banners;
    const P = new Part(K);
    for (const s of [-1, 1]) {
      const x = TX + s * (ex + 1.1), z = Bn.z - 1.4;
      P.add(mPole, new THREE.CylinderGeometry(0.09, 0.12, Bn.h - Fd.y, 12).translate(x, (Bn.h + Fd.y) / 2, z), 0.012);
      P.add(Mk.flat(COL.gold, 0.4), new THREE.SphereGeometry(0.12, 14, 10).translate(x, Bn.h + 0.05, z), 0.01);
      P.add(mPole, new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8).rotateZ(Math.PI / 2).translate(x - s * 0.62, Bn.h - 0.25, z), 0.008);
      const c = makeCloth(mB, 1.1, 3.3, { nx: 6, ny: 12, ph: s * 1.3, tails: 0.35, freq: 1.2 });
      c.mesh.name = "terrace.banner"; c.mesh.position.set(x - s * 0.62, Bn.h - 0.27, z); c.mesh.rotation.y = s > 0 ? 0.25 : -0.25; group.add(c.mesh);
      banners.push(c);
    }
    P.into(group, "terrace.bannerPoles");
  }

  // =================================================================================================== the platform's face and the plain
  const mFace = Mk.tex(faceTex(), 0.9);
  Mk.mesh("terrace.platform", tileUV(boxG(xL - 1.5, xR + 1.5, Fd.y - 0.5, -0.005, zo - 0.6, zo), 3, 3), mFace, { cast: false });
  {
    const g = new THREE.PlaneGeometry(Fd.x1 - Fd.x0, Fd.z1 - Fd.z0).rotateX(-Math.PI / 2).translate((Fd.x0 + Fd.x1) / 2, Fd.y, (Fd.z0 + Fd.z1) / 2);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - PL.cx) / PL.size + 0.5, 0.5 - (p.getZ(i) - PL.cz) / PL.size);
    const t = plainTex(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    const m = Mk.mesh("terrace.plain", g, Mk.tex(t, 0.95), { cast: false, noink: true }); m.receiveShadow = false;
  }
  // trees: round crowns on short trunks along the road and in rows over the plain (NOINK; flat, never inked)
  {
    const mT = [Mk.flat(COL.tree, 0.9), Mk.flat(COL.treeLo, 0.9), Mk.flat(COL.treeHi, 0.9)], mTrunk = Mk.flat("#6a5040", 0.9), BT = new Batch(), r = rng(57), road = roadPath();
    const crown = rockG(61, 1, 1, 1, 1, 0);
    const tree = (x: number, z: number, h: number) => {
      BT.add(mTrunk, new THREE.CylinderGeometry(0.18 * h / 5, 0.24 * h / 5, h * 0.45, 6).translate(x, Fd.y + h * 0.22, z));
      BT.add(mT[Math.floor(r() * 3)], crown.clone().scale(h * 0.7, h * 0.75, h * 0.7).translate(x, Fd.y + h * 0.42, z));
    };
    for (let s = 30; s < road.L; s += 9 + 6 * r()) { const p = road.at(s), side = r() < 0.5 ? -1 : 1, nx = Math.cos(p.yaw), nz = -Math.sin(p.yaw); tree(p.x + side * nx * (S.road.w / 2 + 2.5), p.z + side * nz * (S.road.w / 2 + 2.5), 4 + 2 * r()); }
    for (let i = 0; i < 140; i++) { const x = TX - 240 + 480 * r(), z = -60 - 380 * r(); if (Math.abs(x - TX) < 30 && z > -90) continue; tree(x, z, 5 + 3 * r()); }
    BT.flush(group, "terrace.trees", false, false);
    group.traverse((o) => { if (o.name === "terrace.trees") o.layers.set(NOINK); });
  }
  // the far hills and the noon sky (one painted card, NOINK) in front of the dome
  {
    const Z = -500, x0 = TX - 360, x1 = TX + 360, y0 = Fd.y - 2, y1 = 300, eye = 1.55, D = 0.5 - Z;
    const card = farCard(x0, x1, y0, y1, Z, 2048, Math.round(2048 * (y1 - y0) / (x1 - x0)), (g: G2, k) => {
      for (let y = 0; y < k.H; y++) { const wy = y1 - ((y + 0.5) / k.H) * (y1 - y0), el = (Math.atan2(wy - eye, D) * 180) / Math.PI; g.fillStyle = css(skyAt(SKY, el)); g.fillRect(0, y, k.W, 1); }
      // toon clouds
      const r = rng(63);
      for (let i = 0; i < 9; i++) cloudToon(g, k.px(x0 + (x1 - x0) * r()), k.py(60 + 180 * r()), (60 + 90 * r()) * k.s, r);
      // three ranges of hills, nearer = deeper blue-green, each with a hazy foot
      const range = (base: number, amp: number, f: number, ph: number, col: string) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(0, k.H);
        for (let px = 0; px <= k.W; px += 4) { const x = x0 + (px / k.W) * (x1 - x0), h = base + amp * (0.5 + 0.3 * Math.sin(x * f + ph) + 0.2 * Math.sin(x * f * 2.7 + ph * 1.7)); g.lineTo(px, k.py(h)); }
        g.lineTo(k.W, k.H); g.closePath(); g.fill();
      };
      range(Fd.y + 18, 46, 0.012, 1.1, COL.hill1); range(Fd.y + 6, 30, 0.02, 3.3, COL.hill2); range(Fd.y - 1, 16, 0.031, 5.1, COL.hill3);
      const hz = g.createLinearGradient(0, k.py(Fd.y + 30), 0, k.py(Fd.y)); hz.addColorStop(0, "rgba(220,234,246,0)"); hz.addColorStop(1, "rgba(220,234,246,0.7)"); g.fillStyle = hz; g.fillRect(0, k.py(Fd.y + 30), k.W, k.py(Fd.y) - k.py(Fd.y + 30) + 2);
    });
    card.name = "terrace.far"; group.add(card);
  }
  group.add(skyDome(new THREE.Vector3(TX, 0, 0), SKY));

  // =================================================================================================== THE PROCESSION
  /** the carriages are drawn twice life size: at 120-220 m they still read as carriages (12-20 px) on a phone */
  const CAR_SCALE = 2;
  const road = roadPath(), cars: THREE.Group[] = [];
  {
    const P = new Part(K), black = Mk.flat(COL.car, 0.5), trim = Mk.flat(COL.carTrim, 0.6), gold = Mk.flat(COL.canopy, 0.5), wheel = Mk.flat(COL.wheel, 0.6), horse = Mk.flat(COL.horse, 0.8), horseLo = Mk.flat(COL.horseLo, 0.8), pen = Mk.flat(COL.pennant, 0.7);
    const ink = 0.05;
    // the carriage (it travels toward +z of its own frame: the group's yaw turns it onto the road)
    P.add(black, boxG(-0.7, 0.7, 0.75, 1.75, -0.8, 0.8), ink);
    P.add(trim, boxG(-0.72, 0.72, 0.72, 0.85, -0.82, 0.82), ink);
    P.add(gold, lathe([[0, 2.35], [1.15, 2.05], [1.2, 1.98], [0, 2.02]].reverse() as [number, number][], 16), ink);
    P.add(black, new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6).translate(0, 1.95, 0), ink);
    for (const s of [-1, 1]) P.add(wheel, new THREE.CylinderGeometry(0.62, 0.62, 0.12, 16).rotateZ(Math.PI / 2).translate(s * 0.85, 0.62, -0.1), ink);
    P.add(black, boxG(-0.06, 0.06, 0.55, 0.65, 0.8, 2.6), ink);                                       // the pole
    for (const s of [-0.38, 0.38]) {                                                                  // two horses
      P.add(horse, new THREE.CapsuleGeometry(0.26, 0.9, 4, 8).rotateX(Math.PI / 2).translate(s, 1.05, 2.5), ink);
      P.add(horse, new THREE.CapsuleGeometry(0.13, 0.42, 4, 8).rotateX(-0.6).translate(s, 1.48, 3.1), ink);
      P.add(horse, new THREE.CapsuleGeometry(0.12, 0.3, 4, 8).rotateX(Math.PI / 2 - 0.3).translate(s, 1.72, 3.32), ink);
      for (const [lx, lz] of [[-0.12, 2.15], [0.12, 2.15], [-0.12, 2.85], [0.12, 2.85]]) P.add(horseLo, new THREE.CylinderGeometry(0.06, 0.05, 0.85, 6).translate(s + lx, 0.42, lz), ink);
    }
    const base = new THREE.Group(); P.into(base, "terrace.carriage", { cast: false, receive: false });
    const Pn = new Part(K);
    Pn.add(black, new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6).translate(0.6, 2.2, -0.7), ink);
    Pn.add(pen, new THREE.BoxGeometry(0.04, 0.7, 1.1).translate(0.6, 3.5, -1.25), ink);
    const pennant = new THREE.Group(); Pn.into(pennant, "terrace.pennant", { cast: false, receive: false });
    for (let i = 0; i < S.road.n; i++) {
      const c = base.clone(); if (i % 3 === 0) c.add(pennant.clone());
      c.name = "terrace.car"; c.scale.setScalar(CAR_SCALE); group.add(c); cars.push(c);
    }
  }
  let share = 1, clock = 0, wind = 1;
  /** the head of the line at film time t: s = 215 m along the road at t = 85 s (the middle of segment D): the line climbs
   *  through the middle of the stand and parapet views */
  const place = (t: number) => {
    const n = Math.round(S.road.few + (S.road.n - S.road.few) * share), head = 215 + S.road.speed * (t - 85);
    cars.forEach((c, i) => {
      const s = head - i * S.road.gap;
      c.visible = i < n && s > 0 && s < road.L;
      const p = road.at(s), bob = 0.04 * CAR_SCALE * Math.sin(t * 5 + i * 1.7);
      c.position.set(p.x, Fd.y + bob, p.z); c.rotation.y = p.yaw;
    });
  };
  place(0);

  // =================================================================================================== the light
  lightRig(group, { dir: [-0.4, 0.78, -0.48], k: 2.5, col: "#fff6e8", at: [TX, 0, -0.5], half: 7.5, hemi: ["#dce8f8", "#b0a088", 0.95], point: { col: "#ffffff", k: 0, at: [TX, 3, 0], dist: 4 } });
  const swayAll = (t: number) => { const a = 0.35 * wind; for (const b of banners) b.sway(t * (0.6 + 0.6 * wind), a); valance.sway(t * (0.7 + 0.5 * wind), 0.06 * wind); };
  swayAll(0);

  // walls the camera stands behind: the hall's front (seen from inside the porch only)
  const hall = group.getObjectByName("terrace.hall")!;
  return {
    group,
    view(cam: THREE.Vector3) { hall.visible = cam.z < F.z1 - 0.05; },
    animate(t: number) { clock = t; place(t); swayAll(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "carriages") { share = Math.max(0, Math.min(1, Number(v))); place(clock); }
      else if (name === "wind") { wind = Math.max(0, Math.min(1, Number(v))); swayAll(clock); }
    },
  };
}
/** a toon cloud on a painted card: a flat-bottomed white heap with a pale blue underside */
const cloudToon = (g: G2, x: number, y: number, w: number, r: () => number) => {
  const n = 5, h = w * 0.3;
  g.save(); g.beginPath(); g.rect(x - w, y - h * 3, 2 * w, h * 3.4); g.clip();
  g.fillStyle = "rgba(186,212,238,0.95)"; g.beginPath();
  for (let i = 0; i < n; i++) { const u = i / (n - 1), rr = h * (0.55 + 0.45 * Math.sin(Math.PI * u) + 0.12 * r()); g.moveTo(x + w * (u - 0.5) + rr, y + h * 0.1); g.arc(x + w * (u - 0.5), y + h * 0.1, rr, 0, 7); }
  g.fill();
  g.fillStyle = "#ffffff"; g.beginPath();
  for (let i = 0; i < n; i++) { const u = i / (n - 1), rr = h * (0.5 + 0.45 * Math.sin(Math.PI * u) + 0.12 * r()); g.moveTo(x + w * (u - 0.5) + rr, y - h * 0.08); g.arc(x + w * (u - 0.5), y - h * 0.08, rr, 0, 7); }
  g.fill(); g.restore();
};
void mix;
