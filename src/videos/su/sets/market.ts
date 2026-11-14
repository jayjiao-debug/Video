// THE MARKET (place "market", island x 0): 惠州's morning market street (PLAN 1, 8A). WP2a's set; the exports are the
// contract of sets/index.ts: MARKET_LOOK, MARKET_PARAMS, buildMarket(K) -> { group, animate, setParam }. Every place
// number is layout/market.ts (MARKET_SET, MARKET); its header has the plan.
//
// WHAT THERE IS (her camera walks down lane A toward -z)
//   - packed-earth lanes (one painted ground: worn lighter tracks, grey stone gutters along the shop fronts, straw);
//   - SHOP UNITS along both sides of lane A and lane B: a timber-and-plaster body, an open painted shop front (the
//     goods inside), a grey tiled gable roof, a counter with the goods on it (greens, radishes, baskets, cloth bolts,
//     pots, steamers, rice sacks, bananas), a striped awning on two poles, a one-character hanging sign (菜 布 陶 茶 米 果),
//     a red paper lantern on some;
//   - THE BUTCHER'S STALL closing the T: the counter (leaf-wrapped cuts on it), the awning, the hook rack with iron
//     hooks and ONE stylised lamb carcass (pale, ribbed, no head, no gore: param `carcass`), the 肉 sign, crates;
//   - the BANYAN on the corner square (buttressed trunk, a few aerial roots, a big lumpy crown) in a stone ring;
//   - two chickens pecking by the banyan, a market gate arch at lane A's far end (behind her walk);
//   - the far crowd: low-detail villagers down lane B and at lane A's far end (param `crowd`), bobbing;
//   - the town behind: painted far cards (roofs, the pagoda on the West Lake hill, green hills, a morning sky).
// INK / FLICKER: shop fronts, goods inside, roof tiles, planks, gutters, stripes and signs are PAINT; inked geometry is
// chunky (poles 10 cm, fascia 7 cm, the rack bar 9 cm); goods, hooks, carcass, lanterns, signs, chickens and the crowd
// are props-kit Parts (NOINK + their own hull); the far town is NOINK. Seeded painting only; animate / setParam are
// pure functions of their arguments.
// SET vs PROP: the chopping block and the cleaver are WP3's props (MARKET.block, MARKET.cleaver); the set leaves the
// block's mark clear. The carcass is the set's (`carcass`, default true).
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, soft, skyDome, groundG, groundTex, farCard, Batch, NOINK, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { MARKET_SET as S, MARKET, MX } from "../layout/market";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, shade, addLantern, type LanternMats } from "./parts/common";
import { V3, at, FACE, tileTex, boardTex, awningTex, signTex, plasterTex, slabG, boxM, gableG, gableRoof, blobG, bentLimb, makeVillager, makeChicken, cloudPuff, type RoofMats } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.5, 0.43, 0.36]], [-10, [0.62, 0.55, 0.48]], [4, [0.86, 0.84, 0.82]], [30, [0.7, 0.78, 0.9]], [90, [0.6, 0.7, 0.88]]],
  boxes: [{ az: -60, el: 22, rot: 0, w: 42, h: 18, soft: 14, col: [1.0, 0.86, 0.66] }],
};
/** MORNING: a low warm sun from the east (+x) and a little from her side; a clear pale sky; the figures held under 1 */
export const MARKET_LOOK: PlaceLook = {
  bg: "#c4dbec",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.8, color: "#3e3248" },
  cast: {
    key: [0.62, 0.46, 0.64], tint: [1.0, 0.9, 0.76], tintK: 0.8, gain: 0.94, grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.94, 1.0],
    shade: [1.04, 0.95, 1.34], shadeK: 0.36, wrap: [28, 56], edge: 0.13, broad: 0.1, bodySat: 0.13, sheen: 0.08, lift: 0.015, contactLen: 0.4,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** the per-frame dressing: crowd 0..1 (how many far villagers the set shows), carcass (NEW: the set's carcass on the
 *  hook, default true) */
export const MARKET_PARAMS: Record<string, ParamValue> = { crowd: 1, carcass: true };

const COL = {
  earth: "#bba27c", earthHi: "#cdb894", earthLo: "#a58d68", gutter: "#a7a29a", gutterLo: "#8a857e", straw: "#d8bf7a",
  plaster: "#ecdfc6", timber: "#8c6a48", timberLo: "#6c5038", timberHi: "#a8825a", interior: "#5e4838", shelf: "#9a7a58",
  tile: "#7e828e", trim: "#5c5866", under: "#8a6e52",
  counter: "#a88460", counterLo: "#86664a", pole: "#7a5c40", rack: "#5a4434", iron: "#4c4a56",
  awn: [["#d8c08a", "#efe4c8"], ["#7f9f78", "#e6e2c8"], ["#c06a4c", "#f0dcc2"], ["#6f8cb0", "#e8e4d4"], ["#c99a52", "#f2e6c8"], ["#9a7cae", "#ece2d6"]] as [string, string][],
  green: "#5e9a4c", greenLo: "#4a7e3c", greenHi: "#7cb45e", radish: "#f2ecdc", radishTop: "#6aa04e", pumpkin: "#e09a3c", basket: "#c8a26a", basketLo: "#a8824e",
  cloth: ["#c8463a", "#3f6fa8", "#e2b04a", "#5a9a6a", "#e8e0cc"], pot: "#9a5e3c", potLo: "#7a4a30", potGreen: "#6a8a6a", steam: "#d8c49a", sack: "#e0d0aa", rice: "#f6f2e6",
  banana: "#ecc844", bananaLo: "#c8a232", leaf: "#5c9a4a", meat: "#e6907e", fat: "#f6ead8",
  carcass: "#f0c8b8", carcassLo: "#dca898", bone: "#f6eee0", lanternRed: "#d8463a", lanternCap: "#3a3236", tassel: "#e2b03a",
  signBg: "#3a2e2a", signFg: "#e8c45a", signRed: "#b8382e",
  trunk: "#8a7462", trunkLo: "#6e5c4e", crown: ["#4e8a46", "#5f9c50", "#3f7a3e"], root: "#8a7866", ring: "#a8a096", ringTop: "#8e7a5c",
  crowd: ["#7a6f86", "#8a7a6a", "#6f7f8a", "#8a6f6a", "#6a8070", "#9a8a6a", "#7e6a7a"],
};
const SKY: SkyStops = [[-10, "#d8e2e8"], [0, "#f2e6d4"], [5, "#e2e8ec"], [16, "#bcd6ec"], [40, "#8ebce4"], [90, "#74a8dc"]];

// ---------------------------------------------------------------------------------------------------- the paintings
type Kind = "veg" | "cloth" | "pots" | "tea" | "rice" | "fruit" | "butcher" | "house";
/** A SHOP FRONT (the body's +z face, W x H m): timber posts and a top beam, the open front with the shop inside (dark
 *  warm interior, shelves with the goods of its kind painted), a stone sill; a house unit is a closed front (plaster
 *  panels, a lattice window, a door) */
const frontTex = (kind: Kind, Wm: number, Hm: number, seed: number) => paint(512, Math.round((512 * Hm) / Wm), (g, W, H) => {
  const r = rng(seed), m = W / Wm, post = 0.16 * m, beam = 0.32 * m;
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  if (kind === "house") {
    g.fillStyle = COL.timber; g.fillRect(0, 0, post, H); g.fillRect(W - post, 0, post, H); g.fillRect(0, 0, W, beam * 0.6); g.fillRect(0, H * 0.62, W, 0.1 * m);
    // a lattice window left and a plank door right
    const wx = W * 0.14, wy = H * 0.3, ww = W * 0.34, wh = H * 0.26;
    g.fillStyle = "#e8d6a6"; g.fillRect(wx, wy, ww, wh); g.strokeStyle = COL.timberLo; g.lineWidth = 5;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(wx + (ww * i) / 6, wy); g.lineTo(wx + (ww * i) / 6, wy + wh); g.stroke(); }
    for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(wx, wy + (wh * j) / 4); g.lineTo(wx + ww, wy + (wh * j) / 4); g.stroke(); }
    g.lineWidth = 8; g.strokeRect(wx, wy, ww, wh);
    g.fillStyle = COL.timberHi; g.fillRect(W * 0.58, H * 0.22, W * 0.28, H * 0.78);
    g.fillStyle = COL.timberLo; g.fillRect(W * 0.72 - 2, H * 0.22, 4, H * 0.78); g.strokeStyle = COL.timberLo; g.lineWidth = 6; g.strokeRect(W * 0.58, H * 0.22, W * 0.28, H * 0.78);
    return;
  }
  // the open front: the interior
  const x0 = post, x1 = W - post, y0 = beam, gr = g.createLinearGradient(0, y0, 0, H);
  gr.addColorStop(0, shade(COL.interior, -0.25)); gr.addColorStop(1, shade(COL.interior, 0.08));
  g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, H - y0);
  // shelves and goods
  const rows = [0.36, 0.56], sh = 0.05 * m;
  for (const ry of rows) {
    const y = H * ry;
    g.fillStyle = COL.shelf; g.fillRect(x0 + 6, y, x1 - x0 - 12, sh);
    for (let x = x0 + 14; x < x1 - 30; x += 22 + 16 * r()) {
      const w = (0.14 + 0.1 * r()) * m, h = (0.16 + 0.14 * r()) * m;
      if (kind === "cloth") { g.fillStyle = COL.cloth[Math.floor(r() * COL.cloth.length)]; g.fillRect(x, y - h * 0.7, w, h * 0.7); g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x, y - h * 0.7, w, 3); }
      else if (kind === "pots" || kind === "tea") { g.fillStyle = r() < 0.5 ? COL.pot : COL.potGreen; g.beginPath(); g.ellipse(x + w / 2, y - h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,240,220,0.25)"; g.beginPath(); g.ellipse(x + w * 0.35, y - h * 0.62, w * 0.1, h * 0.16, 0, 0, 7); g.fill(); }
      else if (kind === "rice") { g.fillStyle = COL.sack; g.beginPath(); g.ellipse(x + w / 2, y - h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.fillStyle = COL.rice; g.beginPath(); g.ellipse(x + w / 2, y - h * 0.86, w * 0.35, h * 0.12, 0, 0, 7); g.fill(); }
      else if (kind === "butcher") { g.fillStyle = r() < 0.5 ? "#c9b49a" : "#8a6a52"; g.fillRect(x, y - h * 0.6, w * 0.8, h * 0.6); }
      else { g.fillStyle = COL.basket; g.fillRect(x, y - h * 0.45, w, h * 0.45); g.fillStyle = r() < 0.5 ? COL.green : COL.pumpkin; g.beginPath(); g.ellipse(x + w / 2, y - h * 0.45, w * 0.45, h * 0.2, 0, Math.PI, 0); g.fill(); }
    }
  }
  if (kind === "butcher") {
    // a steelyard hanging on the back wall, a stack of crates, a hanging bunch of dried chillies
    g.strokeStyle = "#3a3236"; g.lineWidth = 4; g.beginPath(); g.moveTo(W * 0.62, H * 0.2); g.lineTo(W * 0.62, H * 0.3); g.moveTo(W * 0.5, H * 0.3); g.lineTo(W * 0.78, H * 0.28); g.stroke();
    g.fillStyle = "#b8342a"; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(W * 0.2 + k * 5, H * 0.3 + k * 9, 6, 16, 0.3, 0, 7); g.fill(); }
  }
  // the frame: posts, the top beam (with a small name board), the sill
  g.fillStyle = COL.timber; g.fillRect(0, 0, post, H); g.fillRect(W - post, 0, post, H); g.fillRect(0, 0, W, beam);
  g.fillStyle = COL.timberHi; g.fillRect(0, beam - 8, W, 8);
  g.fillStyle = COL.timberLo; g.fillRect(post - 5, beam, 5, H - beam); g.fillRect(W - post, beam, 5, H - beam);
  g.fillStyle = COL.signBg; g.fillRect(W * 0.34, beam * 0.16, W * 0.32, beam * 0.62);
  g.strokeStyle = COL.signFg; g.lineWidth = 3; g.strokeRect(W * 0.34 + 5, beam * 0.16 + 5, W * 0.32 - 10, beam * 0.62 - 10);
  g.fillStyle = "#9a948c"; g.fillRect(0, H - 0.1 * m, W, 0.1 * m);
});
/** the shop's sides and back (one 1 m tile): plaster with a timber post band */
const sideTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(71); g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) { const x = W * r(), y = H * r(); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, 30 + 40 * r(), r() < 0.5 ? "#fff8ea" : "#b8a888", 0.1); }
  g.fillStyle = COL.timber; g.fillRect(0, 0, 18, H); g.fillStyle = COL.timberLo; g.fillRect(14, 0, 4, H);
}, true);
/** the soffit under the eaves (one 1 m tile, u along the eave): rafters on boards */
const underTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = COL.under; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { const x = (W * (i + 0.5)) / 5; g.fillStyle = shade(COL.under, -0.3); g.fillRect(x - 8, 0, 16, H); g.fillStyle = shade(COL.under, 0.15); g.fillRect(x - 8, 0, 4, H); }
}, true);
/** the carcass skin (u round, v down its length: v 1 = the hind end at the hook): pale pink, the ribs as bone-white
 *  bands across the middle, a fat cap at the shoulder end; a toon, no blood */
const carcassTex = () => paint(256, 512, (g, W, H) => {
  g.fillStyle = COL.carcass; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(220,160,150,0.35)"); gr.addColorStop(0.5, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(220,160,150,0.35)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 9; k++) {
    const y = H * (0.28 + k * 0.055);
    g.fillStyle = COL.bone; g.fillRect(0, y, W, H * 0.026);
    g.fillStyle = "rgba(200,140,130,0.5)"; g.fillRect(0, y + H * 0.026, W, 3);
  }
  g.fillStyle = COL.fat; g.fillRect(0, H * 0.88, W, H * 0.12);
  g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(0, H * 0.06, W, H * 0.05);
});
/** THE GROUND (one painted square): packed earth, the lanes worn lighter, stone gutters along every shop front, straw */
const GROUND = { cx: MX - 4, cz: -2, size: 64 };
const paintGround = () => groundTex(GROUND.cx, GROUND.cz, GROUND.size, 2048, COL.earth, (g, k) => {
  const r = rng(81), X = k.px, Z = k.pz, s = k.s;
  for (let i = 0; i < 70; i++) blotch(g, k.S * (0.05 + 0.9 * r()), k.S * (0.05 + 0.9 * r()), (1.5 + 3 * r()) * s, r() < 0.5 ? COL.earthHi : COL.earthLo, 0.2);
  // the worn lanes (lighter, soft-edged)
  soft(g, 1.2 * s, () => {
    g.fillStyle = css(COL.earthHi, 0.75);
    g.fillRect(X(MX - 2.2), Z(S.lane.z0 + 0.3), 4.4 * s, (S.lane.z1 - S.lane.z0) * s);
    g.fillRect(X(MX - 30), Z(S.laneB.z0 + 0.4), (MX + 2.2 - (MX - 30)) * s, (S.laneB.z1 - S.laneB.z0 - 0.8) * s);
  });
  soft(g, 0.6 * s, () => { g.fillStyle = css("#d8c6a2", 0.5); g.fillRect(X(MX - 0.9), Z(S.lane.z0 + 0.5), 1.6 * s, (S.lane.z1 - S.lane.z0) * s); });
  // stone gutters along the shop fronts: a band of grey flags with joints
  const gutter = (x0: number, x1: number, z0: number, z1: number, alongX: boolean) => {
    g.fillStyle = COL.gutter; g.fillRect(X(x0), Z(z0), (x1 - x0) * s, (z1 - z0) * s);
    g.fillStyle = COL.gutterLo;
    if (alongX) for (let x = x0; x < x1; x += 0.6) g.fillRect(X(x), Z(z0), 2, (z1 - z0) * s);
    else for (let z = z0; z < z1; z += 0.6) g.fillRect(X(x0), Z(z), (x1 - x0) * s, 2);
    g.fillStyle = "rgba(60,54,50,0.35)"; if (alongX) g.fillRect(X(x0), Z(z1) - 2, (x1 - x0) * s, 3); else g.fillRect(X(x0) - 2, Z(z0), 3, (z1 - z0) * s);
  };
  gutter(MX + S.stalls.x - 0.45, MX + S.stalls.x - 0.1, S.lane.z0 + 0.1, S.lane.z1, false);
  gutter(MX - S.stalls.x + 0.1, MX - S.stalls.x + 0.45, S.stalls.z[0] + 1.75, S.lane.z1, false);
  gutter(MX - 30, MX + 2.6, S.butcher.z + 0.1, S.butcher.z + 0.45, true);
  // straw, leaves, a few dark damp patches (by the butcher's: wet earth, no blood)
  for (let i = 0; i < 900; i++) { const x = k.S * (0.06 + 0.88 * r()), y = k.S * (0.06 + 0.88 * r()), a = r() * 3.14, l = 4 + 6 * r(); g.strokeStyle = css(r() < 0.6 ? COL.straw : "#8a7a52", 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (const [x, z, rr] of [[MX + 0.9, -2.4, 0.9], [MX + 2.0, -1.0, 0.6], [MX - 1.6, 4.2, 0.7]] as [number, number, number][]) blotch(g, X(x), Z(z), rr * s, "#8e7656", 0.35);
  // the banyan square: fallen leaves under the crown
  for (let i = 0; i < 260; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 4.2, x = X(S.banyan.x + Math.cos(a) * d), y = Z(S.banyan.z + Math.sin(a) * d); g.fillStyle = css(r() < 0.5 ? "#7a8a48" : "#a88a4a", 0.6); g.beginPath(); g.ellipse(x, y, 3, 1.6, a, 0, 7); g.fill(); }
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildMarket(K: Kit) {
  const group = new THREE.Group(); group.name = "set-market";
  const Mk = maker(K, group), B = new Batch();
  const mPlaster = Mk.tex(sideTex(), 0.9), mTile = Mk.tex(tileTex(73), 0.85), mTrim = Mk.flat(COL.trim, 0.8), mUnder = Mk.tex(underTex(), 0.9);
  const roofM: RoofMats = { tile: mTile, under: mUnder, trim: mTrim };
  const mCounter = Mk.tex(boardTex(75, { base: COL.counter, n: 3, lying: true }), 0.85), mPole = Mk.flat(COL.pole, 0.8), mTimber = Mk.flat(COL.timber, 0.8);
  const Pd = new Part(K);                                        // the dressing (goods, signs, lanterns, hooks, crates)
  const lanternM: LanternMats = { paper: K.flat(COL.lanternRed, { rough: 0.7 }), cap: K.flat(COL.lanternCap, { rough: 0.6 }), tassel: K.flat(COL.tassel, { rough: 0.6 }) };
  const fl = (c: string, rough = 0.8) => K.flat(c, { rough });
  const fronts = new Map<string, THREE.Material>();
  const frontMat = (kind: Kind, w: number, h: number) => {
    const key = `${kind}|${w}|${h}`; let m = fronts.get(key);
    if (!m) { m = Mk.tex(frontTex(kind, w, h, 91 + fronts.size * 7), 0.9); fronts.set(key, m); }
    return m;
  };

  // =================================================================================================== the ground
  { const t = paintGround(); const m = Mk.mesh("market.ground", groundG(GROUND.cx, GROUND.cz, GROUND.size), Mk.tex(t, 0.95), { cast: false }); m.receiveShadow = true; }

  // =================================================================================================== the goods (local, on a counter top at y = top, z middle zc, x across +-w/2)
  const goods = (kind: Kind, M: THREE.Matrix4, w: number, top: number, zc: number, seed: number) => {
    const r = rng(seed), n = Math.max(2, Math.floor(w / 0.75));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (w * (i + 0.5)) / n + (r() - 0.5) * 0.12, z = zc + (r() - 0.5) * 0.12;
      if (kind === "veg" || kind === "fruit") {
        Pd.add(fl(COL.basket), lathe([[0.0, 0.0], [0.2, 0.0], [0.27, 0.12], [0.0, 0.12]].map(([a, b]) => [a, b] as [number, number]), 16).translate(x, top, z), 0.008, M);
        if (kind === "fruit") for (let k = 0; k < 3; k++) Pd.add(fl(k % 2 ? COL.bananaLo : COL.banana), blobG(seed + i * 5 + k, 1, 0.1).scale(0.16, 0.07, 0.07).rotateY(r() * 3).translate(x + (r() - 0.5) * 0.18, top + 0.14 + 0.05 * k, z + (r() - 0.5) * 0.14), 0.006, M);
        else if (i % 3 === 1) for (let k = 0; k < 4; k++) { const a = (k / 4) * 6.28; Pd.add(fl(COL.radish), new THREE.ConeGeometry(0.035, 0.24, 8).rotateZ(Math.PI / 2).rotateY(a).translate(x + Math.cos(a) * 0.08, top + 0.15, z + Math.sin(a) * 0.08), 0.005, M); Pd.add(fl(COL.radishTop), new THREE.SphereGeometry(0.05, 8, 6).translate(x + Math.cos(a) * 0.18, top + 0.16, z + Math.sin(a) * 0.18), 0.005, M); }
        else if (i % 3 === 2) for (let k = 0; k < 2; k++) Pd.add(fl(COL.pumpkin), new THREE.SphereGeometry(0.1, 12, 9).scale(1, 0.75, 1).translate(x + (k - 0.5) * 0.18, top + 0.18, z), 0.007, M);
        else Pd.add(fl(r() < 0.5 ? COL.green : COL.greenHi), blobG(seed + i, 1, 0.22).scale(0.22, 0.12, 0.2).translate(x, top + 0.17, z), 0.007, M);
      } else if (kind === "cloth") {
        for (let k = 0; k < 3; k++) Pd.add(fl(COL.cloth[(i + k) % COL.cloth.length]), new THREE.CylinderGeometry(0.08, 0.08, 0.55, 14).rotateX(Math.PI / 2).translate(x + (k - 1) * 0.17, top + 0.08, z), 0.007, M);
        Pd.add(fl(COL.cloth[(i + 3) % COL.cloth.length]), new THREE.CylinderGeometry(0.08, 0.08, 0.5, 14).rotateX(Math.PI / 2).translate(x, top + 0.23, z), 0.007, M);
      } else if (kind === "pots") {
        const h = 0.18 + 0.14 * r(), rr = 0.1 + 0.05 * r();
        Pd.add(fl(r() < 0.5 ? COL.pot : COL.potGreen), lathe([[0.0, 0.0], [rr * 0.8, 0.0], [rr, h * 0.45], [rr * 0.7, h * 0.85], [rr * 0.55, h], [0.0, h]], 16).translate(x, top, z), 0.007, M);
        Pd.add(fl(COL.potLo), lathe([[0.0, 0.0], [0.08, 0.0], [0.1, 0.08], [0.0, 0.08]], 14).translate(x + 0.2, top, z + 0.05), 0.006, M);
      } else if (kind === "tea") {
        for (let k = 0; k < 3; k++) Pd.add(fl(k === 2 ? shade(COL.steam, 0.1) : COL.steam), new THREE.CylinderGeometry(0.17, 0.17, 0.09, 18).translate(x, top + 0.05 + k * 0.095, z), 0.007, M);
      } else if (kind === "rice") {
        Pd.add(fl(COL.sack), blobG(seed + i, 1, 0.12).scale(0.2, 0.17, 0.18).translate(x, top + 0.15, z), 0.008, M);
        Pd.add(fl(COL.rice), new THREE.SphereGeometry(0.15, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1).translate(x, top + 0.27, z), 0.006, M);
      }
    }
  };

  // =================================================================================================== a shop unit
  type Unit = { cx: number; cz: number; yaw: number; w: number; d?: number; h?: number; kind: Kind; front?: number; awn?: number; sign?: string; lantern?: number; seed: number };
  const unit = (u: Unit) => {
    const M = at(u.cx, u.cz, u.yaw), d = u.d ?? 3.0, h = u.h ?? 2.7, w = u.w, x0 = -w / 2, x1 = w / 2;
    const put = (m: THREE.Material, g: THREE.BufferGeometry) => B.add(m, g.applyMatrix4(M));
    // the body: front face painted, the rest plaster (front = local +z at z 0)
    put(mPlaster, boxM(x0, x1, 0, h, -d, -0.01, 1));
    const fq = new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0);
    put(frontMat(u.kind, w, h), fq);
    // the roof (its underside meets the wall top at z 0)
    const s = 0.6, over = 0.55, t = 0.1, half = (d + 2 * over) / 2, yR = h + t / Math.cos(Math.atan(s)) + s * (half - over);
    gableRoof(put, roofM, { x0, x1, zF: over, zB: -d - over, yE: yR - s * half, yR, over: 0.25, t, tile: 1 });
    const zM = -d / 2, apex = yR - t / Math.cos(Math.atan(s)) + 0.02;
    put(mPlaster, gableG(x0, -d, 0, h - 0.01, zM, apex, false)); put(mPlaster, gableG(x1, -d, 0, h - 0.01, zM, apex, true));
    if (u.kind === "house") return;
    // the counter, the awning on two poles, the goods
    const fr = u.front ?? 0.85, cd = 0.6, top = S.stalls.counter;
    put(mCounter, boxM(x0 + 0.15, x1 - 0.15, 0, top, fr - cd, fr, 0.9));
    const yA0 = h - 0.32, yA1 = S.stalls.awning, za = fr + 0.12;
    const [ca, cb] = COL.awn[(u.awn ?? 0) % COL.awn.length];
    const aw = slabG(V3(x0 + 0.08, yA1, za), V3(x1 - 0.08, yA1, za), V3(x1 - 0.08, yA0, 0.06), V3(x0 + 0.08, yA0, 0.06), 0.04, w - 0.16);
    put(Mk.tex(awningTex(ca, cb), 0.9), aw);
    for (const px of [x0 + 0.16, x1 - 0.16]) put(mPole, new THREE.CylinderGeometry(0.05, 0.055, yA1 - 0.03, 10).translate(px, (yA1 - 0.03) / 2, fr + 0.06));
    goods(u.kind, M, w - 0.5, top, fr - cd / 2, u.seed);
    // the hanging sign and the lantern (Parts: their own outline)
    if (u.sign) {
      const sm = K.flat("#ffffff", { map: signTex(u.sign, { bg: COL.signBg, fg: COL.signFg }), rough: 0.8 }), side = fl(COL.signBg, 0.7);
      const sx = x1 - 0.42, sz = fr + 0.16, sy1 = yA1 - 0.06;
      const face = new THREE.PlaneGeometry(0.3, 0.78);
      Pd.shell([[side, new THREE.BoxGeometry(0.3, 0.78, 0.04).translate(sx, sy1 - 0.47, sz)]], 0.006, M);
      Pd.add(sm, face.clone().translate(sx, sy1 - 0.47, sz + 0.021), 0, M);
      Pd.add(sm, face.clone().rotateY(Math.PI).translate(sx, sy1 - 0.47, sz - 0.021), 0, M);
      for (const dx of [-0.1, 0.1]) Pd.add(fl(COL.lanternCap, 0.7), new THREE.CylinderGeometry(0.009, 0.009, 0.09, 6).translate(sx + dx, sy1 - 0.04, sz), 0.004, M);
    }
    if (u.lantern !== undefined) { const q = V3(x0 + 0.45 + u.lantern, yA1 - 0.04, fr + 0.16).applyMatrix4(M); addLantern(Pd, lanternM, q.x, q.y, q.z, 0.4, 0.04); }
  };

  // =================================================================================================== the rows
  const St = S.stalls, fA = St.x + St.front;                            // lane A's shop fronts at x = MX +- fA
  const kindsA: Kind[] = ["veg", "cloth", "tea", "pots", "fruit", "rice"], signs: Record<string, string> = { veg: "菜", cloth: "布", pots: "陶", tea: "茶", rice: "米", fruit: "果" };
  // lane A right row (fronts face -x): the corner unit by the T, then the row
  unit({ cx: MX + fA, cz: (S.butcher.front + S.laneB.z1) / 2, yaw: FACE.nx, w: S.laneB.z1 - S.butcher.front, kind: "veg", awn: 1, sign: "菜", lantern: 0, seed: 11 });
  St.z.forEach((z, i) => { const kind = kindsA[(i + 1) % kindsA.length]; unit({ cx: MX + fA, cz: z, yaw: FACE.nx, w: St.len, kind, awn: i + 2, sign: i % 2 === 0 ? signs[kind] : undefined, lantern: i % 2 ? 0.2 : undefined, seed: 21 + i }); });
  // lane A left row (fronts face +x), from the banyan square on
  St.z.slice(1).forEach((z, i) => { const kind = kindsA[(i + 3) % kindsA.length]; unit({ cx: MX - fA, cz: z, yaw: FACE.px, w: St.len, kind, awn: i + 4, sign: i % 2 ? signs[kind] : undefined, lantern: i % 2 ? undefined : 0.3, seed: 31 + i }); });
  // lane B far row (fronts face +z at the butcher's front line), left of the butcher
  const fB = S.butcher.z - S.butcher.front;                           // the counters' front distance from the shop front
  [-3.1, -6.5, -9.9, -13.3, -16.7].forEach((x, i) => unit({ cx: MX + x, cz: S.butcher.front, yaw: FACE.pz, w: 3.4, kind: (["cloth", "veg", "pots", "rice", "tea"] as Kind[])[i], front: fB, awn: i, sign: i === 0 ? "布" : i === 2 ? "陶" : undefined, lantern: i === 1 ? 0.6 : undefined, seed: 41 + i }));
  // lane B near row (fronts face -z), left of the banyan square
  [-8.2, -11.6, -15.0, -18.4].forEach((x, i) => unit({ cx: MX + x, cz: S.laneB.z1, yaw: FACE.nz, w: 3.4, kind: (["fruit", "house", "veg", "house"] as Kind[])[i], front: 0.95, awn: i + 3, sign: i === 0 ? "果" : undefined, seed: 51 + i }));
  // houses behind the rows (so no bare ground shows over the roofs), the corner house behind the right corner unit
  unit({ cx: MX + S.butcher.x1, cz: S.butcher.front - 1.5, yaw: FACE.nx, w: 3.0, d: 3.0, h: 3.2, kind: "house", seed: 61 });
  for (const [x, z, yaw, w, hh] of [[-3.1, -7.0, 0, 3.4, 3.6], [-7.0, -7.0, 0, 4.2, 3.2], [-11.4, -7.0, 0, 4.4, 3.8], [1.1, -7.0, 0, 4.9, 3.4], [-7.3, 3.0 + 3.4, FACE.px, 3.4, 3.1]] as [number, number, number, number, number][])
    unit({ cx: MX + x, cz: z, yaw, w, d: 3.2, h: hh, kind: "house", seed: 63 + Math.round(x) });

  // =================================================================================================== THE BUTCHER'S STALL
  {
    const Bu = S.butcher, x0 = Bu.x0, x1 = Bu.x1, w = x1 - x0, cx = (x0 + x1) / 2, h = 2.7, d = 3.0, M = at(cx, Bu.front, 0);
    const put = (m: THREE.Material, g: THREE.BufferGeometry) => B.add(m, g.applyMatrix4(M));
    put(mPlaster, boxM(-w / 2, w / 2, 0, h, -d, -0.01, 1));
    put(frontMat("butcher", w, h), new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0));
    const s = 0.6, over = 0.55, t = 0.1, half = (d + 2 * over) / 2, yR = h + t / Math.cos(Math.atan(s)) + s * (half - over);
    gableRoof(put, roofM, { x0: -w / 2, x1: w / 2, zF: over, zB: -d - over, yE: yR - s * half, yR, over: 0.25, t, tile: 1 });
    const apex = yR - t / Math.cos(Math.atan(s)) + 0.02;
    put(mPlaster, gableG(-w / 2, -d, 0, h - 0.01, -d / 2, apex, false)); put(mPlaster, gableG(w / 2, -d, 0, h - 0.01, -d / 2, apex, true));
    // the counter (world numbers from here on)
    const cx0 = Bu.x - Bu.len / 2, cx1 = Bu.x + Bu.len / 2, top = S.stalls.counter;
    B.add(mCounter, boxM(cx0, cx1, 0, top, Bu.z - Bu.d, Bu.z, 0.9));
    // the awning on its two poles; the hook rack: the bar from the left pole to the rack post
    const A = S.awning, yA0 = h - 0.42;
    B.add(Mk.tex(awningTex("#b8463a", "#f0e2cc", { n: 8 }), 0.9), slabG(V3(A.x0 - 0.05, A.y - 0.08, A.z + 0.05), V3(A.x1 + 0.05, A.y - 0.08, A.z + 0.05), V3(A.x1 + 0.05, yA0, Bu.front + 0.06), V3(A.x0 - 0.05, yA0, Bu.front + 0.06), 0.04, A.x1 - A.x0 + 0.1));
    for (const px of [A.x0, A.x1]) B.add(mPole, new THREE.CylinderGeometry(0.052, 0.058, A.y - 0.1, 10).translate(px, (A.y - 0.1) / 2, A.z));
    const R = S.rack;
    B.add(mPole, new THREE.CylinderGeometry(0.05, 0.056, R.y + 0.08, 10).translate(R.x1, (R.y + 0.08) / 2, R.z));
    B.add(mTimber, new THREE.CylinderGeometry(0.045, 0.045, R.x1 - R.x0 + 0.06, 10).rotateZ(Math.PI / 2).translate((R.x0 + R.x1) / 2, R.y, R.z));
    // iron S-hooks on the bar (Parts), one holding the carcass
    const iron = fl(COL.iron, 0.5);
    for (const hx of [R.x0 + 0.2, MARKET.carcass.x, R.x1 - 0.22]) {
      Pd.add(iron, new THREE.TorusGeometry(0.035, 0.011, 6, 12, Math.PI * 1.3).rotateZ(-0.3).translate(hx, R.y - 0.02, R.z), 0.004);
      if (hx !== MARKET.carcass.x) Pd.add(iron, new THREE.CylinderGeometry(0.011, 0.011, 0.12, 6).translate(hx, R.y - 0.11, R.z), 0.004);
      if (hx !== MARKET.carcass.x) Pd.add(iron, new THREE.TorusGeometry(0.03, 0.011, 6, 12, Math.PI * 1.2).rotateZ(Math.PI * 0.9).translate(hx, R.y - 0.19, R.z), 0.004);
    }
    // the cuts on the counter: wrapped in banana leaves (toon: pink and white blocks on green), a wooden tray
    const leaf = fl(COL.leaf, 0.7), meat = fl(COL.meat, 0.7), fat = fl(COL.fat, 0.7);
    for (const [x, z] of [[1.2, -3.4], [1.85, -3.55], [0.55, -3.5]] as [number, number][]) {
      Pd.add(leaf, new THREE.BoxGeometry(0.42, 0.015, 0.32).translate(MX + x, top + 0.008, z), 0.004);
      Pd.add(meat, new THREE.BoxGeometry(0.22, 0.08, 0.14).translate(MX + x - 0.03, top + 0.055, z), 0.006);
      Pd.add(fat, new THREE.BoxGeometry(0.22, 0.03, 0.14).translate(MX + x - 0.03, top + 0.11, z), 0.005);
    }
    Pd.add(fl(COL.counterLo, 0.8), new THREE.BoxGeometry(0.5, 0.05, 0.34).translate(MX - 0.4, top + 0.025, -3.45), 0.006);
    // the 肉 sign on the awning's right front, crates and a basket at the shop's right
    const sm = K.flat("#ffffff", { map: signTex("肉", { bg: COL.signRed, fg: "#f6e8c8", border: "#7a2420" }), rough: 0.8 }), side = fl(COL.signRed, 0.7);
    const sx = A.x1 - 0.32, sz = A.z + 0.1, sy = A.y - 0.62;
    Pd.shell([[side, new THREE.BoxGeometry(0.34, 0.86, 0.04).translate(sx, sy, sz)]], 0.006);
    Pd.add(sm, new THREE.PlaneGeometry(0.34, 0.86).translate(sx, sy, sz + 0.021), 0);
    Pd.add(sm, new THREE.PlaneGeometry(0.34, 0.86).rotateY(Math.PI).translate(sx, sy, sz - 0.021), 0);
    const crate = fl("#9a7a52", 0.85);
    Pd.add(crate, new THREE.BoxGeometry(0.6, 0.45, 0.5).translate(MX + 3.0, 0.225, -3.6), 0.008);
    Pd.add(crate, new THREE.BoxGeometry(0.5, 0.4, 0.45).rotateY(0.3).translate(MX + 3.05, 0.65, -3.62), 0.008);
    Pd.add(fl(COL.basket), lathe([[0.0, 0.0], [0.2, 0.0], [0.24, 0.3], [0.0, 0.3]], 16).translate(MX + 2.75, 0, -2.6), 0.008);
    // a wooden bucket under the counter's left end
    Pd.add(fl("#8a6a48", 0.8), lathe([[0.0, 0.0], [0.15, 0.0], [0.17, 0.3], [0.0, 0.3]], 16).translate(MX - 1.0, 0, -3.05 + 0.18), 0.008);
  }
  B.flush(group, "market.build");

  // =================================================================================================== THE CARCASS (param carcass)
  const carcass = new THREE.Group(); carcass.name = "market.carcass"; group.add(carcass);
  {
    const P = new Part(K), c = MARKET.carcass, skin = K.flat("#ffffff", { map: carcassTex(), rough: 0.6 }), bone = fl(COL.bone, 0.6);
    // the body: a teardrop hanging hind end up (lathe profile running UP: outward normals), squashed front to back
    const L = 0.92, prof: [number, number][] = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, rr = 0.2 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.75) * (1 - 0.25 * u) + 0.012; prof.push([rr, -L - 0.12 + u * L]); }
    P.add(skin, lathe(prof, 18).scale(1, 1, 0.66).translate(c.x, c.y, c.z), 0.007);
    // the two hind legs up to the hook (bones), the hock knobs
    for (const dx of [-0.07, 0.07]) {
      P.add(bone, bar(V3(c.x + dx, c.y - 0.2, c.z), V3(c.x + dx * 0.4, c.y - 0.04, c.z), 0.026, 0.02, 8), 0.005);
      P.add(bone, new THREE.SphereGeometry(0.034, 8, 6).translate(c.x + dx * 0.4, c.y - 0.04, c.z), 0.005);
    }
    P.into(carcass, "market.carcass", { cast: true, receive: false });
  }

  // =================================================================================================== THE BANYAN on the corner square
  {
    const Bn = S.banyan, P = new Part(K), bark = fl(COL.trunk, 0.9), barkLo = fl(COL.trunkLo, 0.9), root = fl(COL.root, 0.9), r = rng(97);
    const ringR = MARKET.banyanRing, base = V3(Bn.x, 0.45, Bn.z);
    // the stone ring (a low drum, its top earth) — set geometry, inked
    Mk.mesh("market.banyan.ring", new THREE.CylinderGeometry(ringR, ringR + 0.05, 0.45, 32).translate(Bn.x, 0.225, Bn.z), Mk.tex(paint(512, 64, (g, W, H) => { g.fillStyle = COL.ring; g.fillRect(0, 0, W, H); g.fillStyle = shade(COL.ring, -0.25); for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 3, H); g.fillRect(0, H * 0.5, W, 3); }, true), 0.9));
    Mk.mesh("market.banyan.ringTop", new THREE.CircleGeometry(ringR - 0.02, 32).rotateX(-Math.PI / 2).translate(Bn.x, 0.452, Bn.z), Mk.flat(COL.ringTop, 0.95), { cast: false });
    // the trunk: three fused stems leaning out, buttresses at the foot
    const top = V3(Bn.x, 3.4, Bn.z);
    for (const [dx, dz, rr] of [[0.18, 0.1, 0.42], [-0.2, 0.12, 0.36], [0.02, -0.2, 0.38]] as [number, number, number][])
      for (const g of bentLimb(base.clone().add(V3(dx, -0.05, dz)), top.clone().add(V3(dx * 0.8, 0, dz * 0.8)), rr, rr * 0.7, V3(dx, 0, dz))) Pd.add(bark, g, 0.016);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.28 + 0.3; Pd.add(barkLo, bar(V3(Bn.x + Math.cos(a) * 0.62, 0.43, Bn.z + Math.sin(a) * 0.62), V3(Bn.x + Math.cos(a) * 0.15, 1.3, Bn.z + Math.sin(a) * 0.15), 0.12, 0.2, 8), 0.012); }
    // the big limbs out to the crown
    const limbs: THREE.Vector3[] = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * 6.28 + 0.4, e = V3(Bn.x + Math.cos(a) * 3.0, 5.6 + 0.9 * r(), Bn.z + Math.sin(a) * 3.0);
      for (const g of bentLimb(top.clone().add(V3(0, -0.3, 0)), e, 0.24, 0.1, V3(0, 0.5, 0))) Pd.add(bark, g, 0.012);
      limbs.push(e);
    }
    // aerial roots hanging from the limbs (a few, chunky enough for the hull)
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * 6.28 + 0.2, d = 1.4 + 1.4 * r(), x = Bn.x + Math.cos(a) * d, z = Bn.z + Math.sin(a) * d, y0 = 4.6 + 0.6 * r(), y1 = 1.9 + 1.0 * r();
      if (Math.hypot(x - MX, z - 0) < 0.5) continue;
      P.add(root, bar(V3(x, y0, z), V3(x + 0.05, y1, z + 0.04), 0.03, 0.022, 6), 0.006);
    }
    P.into(group, "market.banyan.roots", { cast: false, receive: false });
    // the crown: lumpy blobs in three greens (set geometry, inked: big and smooth)
    const BC = new Batch(), mC = COL.crown.map((cc) => Mk.flat(cc, 0.9));
    const lumps: [number, number, number, number][] = [[0, 7.0, 0, 2.6], [2.4, 6.4, 0.6, 2.0], [-2.3, 6.5, 0.8, 2.1], [0.6, 6.3, -2.4, 2.0], [-1.0, 6.2, 2.5, 2.0], [1.8, 7.4, 2.0, 1.7], [-1.9, 7.5, -1.6, 1.8], [2.9, 5.9, -1.4, 1.6], [3.3, 6.0, 2.4, 1.5]];
    lumps.forEach(([dx, y, dz, rr], i) => BC.add(mC[i % 3], blobG(101 + i, 2, 0.2).scale(rr * 1.15, rr * 0.72, rr * 1.15).translate(Bn.x + dx, y, Bn.z + dz)));
    BC.flush(group, "market.banyan.crown", true, true);
    void limbs;
  }

  // =================================================================================================== the market gate arch at lane A's far end
  {
    const z = S.lane.z1, mG = Mk.flat("#8a3a2e", 0.7), BG = new Batch();
    for (const x of [-2.3, 2.3]) BG.add(mG, new THREE.CylinderGeometry(0.14, 0.16, 4.0, 14).translate(MX + x, 2.0, z));
    BG.add(mG, boxM(MX - 2.9, MX + 2.9, 3.35, 3.7, z - 0.16, z + 0.16));
    gableRoof((m, g) => BG.add(m, g), roofM, { x0: MX - 2.9, x1: MX + 2.9, zF: z + 0.55, zB: z - 0.55, yE: 3.8, yR: 4.3, over: 0.2, t: 0.08 });
    const plaque = Mk.tex(paint(512, 160, (g, W, H) => { g.fillStyle = "#2e3a4a"; g.fillRect(0, 0, W, H); g.strokeStyle = "#e2b03a"; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = "#e8c45a"; g.font = `700 ${Math.round(H * 0.56)}px FrSans, "Noto Sans SC", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("惠州", W / 2, H / 2 + 4); }), 0.8);
    BG.add(plaque, new THREE.PlaneGeometry(1.6, 0.5).rotateY(Math.PI).translate(MX, 2.95, z - 0.17));
    BG.flush(group, "market.gate");
  }

  // =================================================================================================== chickens, the far crowd
  const hens = [makeChicken(K, true), makeChicken(K, false)];
  hens[0].group.position.set(MX - 3.1, 0, 2.85); hens[0].group.rotation.y = 0.6;
  hens[1].group.position.set(MX - 3.35, 0, -0.05); hens[1].group.rotation.y = -0.8;
  for (const hn of hens) group.add(hn.group);
  const crowdG = new THREE.Group(); crowdG.name = "market.crowd"; group.add(crowdG);
  const crowd: { g: THREE.Group; yaw: number; ph: number }[] = [];
  {
    const spots: [number, number, number][] = [[-10.5, -1.3, -1.4], [-11.8, -3.0, 0.4], [-12.9, -1.8, -1.7], [-14.2, -2.9, 1.2], [-15.5, -1.2, -1.5], [-17.0, -2.4, 1.6], [-18.6, -3.1, -1.2], [-20.2, -1.6, 1.5],
      [-1.2, 16.4, 3.0], [1.4, 17.2, 2.8], [0.2, 19.6, 3.3], [-5.7, 2.9, 0.8], [-6.2, -0.95, 1.9], [-22.0, -2.6, 1.4]];
    const r = rng(111);
    spots.forEach(([x, z, yaw], i) => {
      const g = makeVillager(K, 200 + i, { robe: COL.crowd[i % COL.crowd.length], hat: r() < 0.45, basket: r() < 0.4, s: 0.96 + 0.08 * r() });
      g.position.set(MX + x, 0, z); g.rotation.y = yaw; crowdG.add(g); crowd.push({ g, yaw, ph: r() * 6.28 });
    });
  }
  Pd.into(group, "market.dressing", { cast: true, receive: false });

  // =================================================================================================== the far town (painted cards), the sky
  const townCard = (len: number, seed: number, pagoda: number | null) => farCard(-len / 2, len / 2, -1, 26, 0, 2048, Math.round((2048 * 27) / len), (g: G2, k) => {
    const r = rng(seed);
    // the sky: a vertical gradient (warm near the horizon)
    const sg = g.createLinearGradient(0, 0, 0, k.py(0)); sg.addColorStop(0, "#86b6e0"); sg.addColorStop(0.55, "#bcd6ea"); sg.addColorStop(1, "#f0e4d0");
    g.fillStyle = sg; g.fillRect(0, 0, k.W, k.H);
    for (let i = 0; i < 6; i++) cloudPuff(g, k.W * r(), k.py(13 + 7 * r()), (4 + 5 * r()) * k.s, r);
    // far green hills (two ranges) with a soft haze foot
    const range = (base: number, amp: number, f: number, ph: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, k.H); for (let px = 0; px <= k.W; px += 4) { const x = px / k.W; g.lineTo(px, k.py(base + amp * (0.5 + 0.3 * Math.sin(x * f + ph) + 0.2 * Math.sin(x * f * 2.6 + ph * 1.3)))); } g.lineTo(k.W, k.H); g.closePath(); g.fill(); };
    range(6, 7, 7, seed, "#9cb8b4"); range(3.5, 5, 11, seed * 1.7, "#86a89a");
    if (pagoda !== null) {
      // the pagoda on its hill (泗洲塔 on the West Lake hill): a pale tiered tower
      const px = k.px(pagoda), base = k.py(6.4), tw = 0.85 * k.s, ts = 0.66;
      g.fillStyle = "#7c9e8c"; g.beginPath(); g.ellipse(px, k.py(4.5), 9 * k.s, 4 * k.s, 0, Math.PI, 0); g.fill();
      for (let i = 0; i < 7; i++) { const y0 = base - i * 1.25 * ts * k.s, w = tw * (1 - i * 0.08); g.fillStyle = "#e2e0d6"; g.fillRect(px - w / 2, y0 - 1.0 * ts * k.s, w, 1.0 * ts * k.s); g.fillStyle = "#8a8c98"; g.fillRect(px - w * 0.75, y0 - 1.05 * ts * k.s, w * 1.5, 0.22 * ts * k.s); }
      g.fillStyle = "#8a8c98"; g.beginPath(); g.moveTo(px, base - 9.6 * ts * k.s); g.lineTo(px - 0.5 * ts * k.s, base - 8.6 * ts * k.s); g.lineTo(px + 0.5 * ts * k.s, base - 8.6 * ts * k.s); g.closePath(); g.fill();
    }
    // the town's roofs: rows of grey gables over white walls, nearer rows bigger and lower
    for (const [yb, sc, n] of [[3.2, 0.7, 26], [2.0, 0.95, 20], [0.6, 1.25, 15]] as [number, number, number][]) {
      for (let i = 0; i < n; i++) {
        const cx = k.W * ((i + 0.3 * r()) / n), w = (2.6 + 1.6 * r()) * sc * k.s, hw = (1.4 + 0.8 * r()) * sc * k.s, rh = 1.0 * sc * k.s, y = k.py(yb + 0.6 * r());
        g.fillStyle = r() < 0.8 ? "#ece2cc" : "#d8c8a8"; g.fillRect(cx - w / 2, y - hw, w, hw + 30);
        g.fillStyle = r() < 0.5 ? "#6e7280" : "#7c808c"; g.beginPath(); g.moveTo(cx - w / 2 - 0.3 * k.s, y - hw); g.lineTo(cx, y - hw - rh); g.lineTo(cx + w / 2 + 0.3 * k.s, y - hw); g.closePath(); g.fill();
        g.fillStyle = "rgba(70,60,60,0.35)"; g.fillRect(cx - w / 2, y - hw, w, 0.15 * sc * k.s);
      }
      for (let i = 0; i < n / 3; i++) { g.fillStyle = r() < 0.5 ? "#6a9a5a" : "#5a8a52"; g.beginPath(); g.ellipse(k.W * r(), k.py(yb + 1.2), (1.5 + r()) * sc * k.s, (1.3 + r()) * sc * k.s, 0, 0, 7); g.fill(); }
    }
    const hz = g.createLinearGradient(0, k.py(8), 0, k.py(-1)); hz.addColorStop(0, "rgba(240,232,216,0)"); hz.addColorStop(1, "rgba(240,232,216,0.35)"); g.fillStyle = hz; g.fillRect(0, k.py(8), k.W, k.py(-1) - k.py(8));
  });
  const cards: [number, number, number, number, number, number | null][] = [[MX - 6, -27, 0, 96, 131, 12], [MX - 34, -2, FACE.px, 70, 133, null], [MX, 32, FACE.nz, 80, 137, -18]];
  for (const [x, z, yaw, len, seed, pg] of cards) { const m = townCard(len, seed, pg); m.position.set(x, 0, z); m.rotation.y = yaw; m.name = "market.far"; group.add(m); }
  group.add(skyDome(new THREE.Vector3(MX, 0, 0), SKY));

  // =================================================================================================== the light
  lightRig(group, { dir: [0.72, 0.42, 0.55], k: 2.35, col: "#ffdcae", at: [MX - 1, 0, -1], half: 13, hemi: ["#d4e4f4", "#b8966e", 1.05], point: { col: "#ffffff", k: 0, at: [MX, 2, 0], dist: 4 } });

  let crowdK = 1;
  const pose = (t: number) => {
    crowd.forEach((c, i) => { c.g.position.y = 0.025 * Math.abs(Math.sin(t * 2.4 + c.ph)); c.g.rotation.y = c.yaw + 0.12 * Math.sin(t * 0.7 + c.ph); c.g.visible = i < Math.round(crowdK * crowd.length); });
    hens.forEach((hn, i) => hn.animate(t, i * 1.1));
  };
  pose(0);
  return {
    group,
    animate(t: number) { pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "crowd") { crowdK = Math.max(0, Math.min(1, Number(v))); crowd.forEach((c, i) => { c.g.visible = i < Math.round(crowdK * crowd.length); }); }
      else if (name === "carcass") carcass.visible = v === true;
    },
  };
}
void NOINK;
