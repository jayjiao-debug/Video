// TOWN DRESSING of 采访罗密欧与朱丽叶 (v5; the owner on the v4 cut, of Verona's street: "Make this background more complete
// and high quality", of Mantua's: "Add more details to this scene"). What a lived-in street has at its wall feet and on
// its fronts: barrels, crates, sacks, a handcart, a bench, pots, door steps, a trough, a ladder, awnings, shop signs,
// lanterns, a market stall, baskets, jars. Chunky closed shapes into the set's Batch (the ink pass outlines them).
// One palette per town (VERONA warm, MANTUA bleached). Seeded.
// Rules kept here: NOTHING READS AS A CROSS (a wheel is a plank disc with no spokes, boards nailed across a door lie
// level, a sign's bracket has no cross-bar); no two faces lie in one plane over one another (a batten stands 4 mm or
// more proud of its board, a painted board is its own six faces: sheets a millimetre apart flicker, parts/ground.ts).
import * as THREE from "three";
import { paint, rng, facesG, glowCard, Batch } from "../../../../kit/sets/okit";
import { boxG, quad4, type Mk } from "../../../newton/sets/parts/common";
import { bar, lathe } from "./b_common";

export type DressPal = {
  wood: string; woodLo: string; iron: string; stone: string; stoneLo: string; clay: string; leaf: string; leafLo: string; bloom: string;
  clothA: string; clothB: string; sack: string; straw: string; water: string; signField: string; signInk: string; glow: string;
};
/** Verona at dusk: warm wood, terracotta, olive leaves, cream and ochre cloth (no red, no blue: the leads own those) */
export const VERONA_DRESS: DressPal = {
  wood: "#8e6c50", woodLo: "#624a3a", iron: "#4c4248", stone: "#d4c2aa", stoneLo: "#b8a48e", clay: "#b97c5c", leaf: "#727c50", leafLo: "#525c40", bloom: "#f0e2bc",
  clothA: "#e8d8b6", clothB: "#c99c64", sack: "#c9b690", straw: "#d6bc7e", water: "#66726c", signField: "#e8dcc0", signInk: "#4a3434", glow: "#ffcf8a",
};
/** Mantua at noon: everything bleached by the sun and the dust; nothing warm, nothing red */
export const MANTUA_DRESS: DressPal = {
  wood: "#b6a890", woodLo: "#928672", iron: "#7c7772", stone: "#e2dccf", stoneLo: "#c9c2b3", clay: "#cdbca8", leaf: "#b5af96", leafLo: "#9b957e", bloom: "#e8e2d2",
  clothA: "#e6e1d4", clothB: "#c4bcaa", sack: "#d5cdb9", straw: "#ddd2ae", water: "#aeb0a6", signField: "#e8e2d2", signInk: "#6e665e", glow: "#ffffff",
};

export type Emblem = "boot" | "loaf" | "mortar" | "key" | "jug";
type G2 = CanvasRenderingContext2D;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** the six faces of a box, each its own quad (so that two of them can carry a painting and four the wood) */
const boxFaces = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
  px: [V(x1, y0, z1), V(x1, y0, z0), V(x1, y1, z0), V(x1, y1, z1)], nx: [V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0)],
  pz: [V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1)], nz: [V(x1, y0, z0), V(x0, y0, z0), V(x0, y1, z0), V(x1, y1, z0)],
  py: [V(x0, y1, z1), V(x1, y1, z1), V(x1, y1, z0), V(x0, y1, z0)], ny: [V(x0, y0, z0), V(x1, y0, z0), V(x1, y0, z1), V(x0, y0, z1)],
});
/** a shop sign's painting: a cream board, a dark rim, the trade's thing as one dark shape */
const signTex = (pal: DressPal, e: Emblem) => paint(160, 176, (g: G2, W, H) => {
  g.fillStyle = pal.signField; g.fillRect(0, 0, W, H);
  g.strokeStyle = pal.signInk; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
  g.fillStyle = pal.signInk; g.strokeStyle = pal.signInk; g.lineCap = "round"; g.lineJoin = "round";
  const cx = W / 2, cy = H / 2 + 4;
  if (e === "boot") {
    g.beginPath(); g.moveTo(cx - 26, cy - 46); g.lineTo(cx + 6, cy - 46); g.lineTo(cx + 8, cy + 6); g.quadraticCurveTo(cx + 44, cy + 10, cx + 46, cy + 34); g.lineTo(cx + 46, cy + 44); g.lineTo(cx - 28, cy + 44); g.closePath(); g.fill();
    g.fillRect(cx - 32, cy + 44, 82, 9);
  } else if (e === "loaf") {
    g.beginPath(); g.ellipse(cx, cy + 6, 50, 30, 0, 0, 7); g.fill();
    g.strokeStyle = pal.signField; g.lineWidth = 6; for (const dx of [-24, 0, 24]) { g.beginPath(); g.moveTo(cx + dx - 8, cy - 12); g.lineTo(cx + dx + 8, cy + 18); g.stroke(); }
  } else if (e === "mortar") {
    // the apothecary's mortar and pestle
    g.beginPath(); g.moveTo(cx - 44, cy - 8); g.lineTo(cx + 44, cy - 8); g.quadraticCurveTo(cx + 40, cy + 40, cx + 18, cy + 44); g.lineTo(cx - 18, cy + 44); g.quadraticCurveTo(cx - 40, cy + 40, cx - 44, cy - 8); g.fill();
    g.fillRect(cx - 28, cy + 44, 56, 9);
    g.lineWidth = 13; g.beginPath(); g.moveTo(cx + 2, cy - 12); g.lineTo(cx + 34, cy - 56); g.stroke();
  } else if (e === "key") {
    g.lineWidth = 12; g.beginPath(); g.arc(cx - 26, cy, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - 6, cy); g.lineTo(cx + 50, cy); g.stroke();
    g.lineWidth = 10; for (const dx of [30, 46]) { g.beginPath(); g.moveTo(cx + dx, cy); g.lineTo(cx + dx, cy + 20); g.stroke(); }
  } else {
    g.beginPath(); g.moveTo(cx - 12, cy - 50); g.lineTo(cx + 12, cy - 50); g.lineTo(cx + 12, cy - 30); g.quadraticCurveTo(cx + 40, cy - 6, cx + 34, cy + 30); g.quadraticCurveTo(cx + 30, cy + 48, cx, cy + 48);
    g.quadraticCurveTo(cx - 30, cy + 48, cx - 34, cy + 30); g.quadraticCurveTo(cx - 40, cy - 6, cx - 12, cy - 30); g.closePath(); g.fill();
    g.lineWidth = 8; g.beginPath(); g.arc(cx + 30, cy - 22, 16, -1.6, 1.3); g.stroke();
  }
});
/** an awning's cloth: stripes down the slope (they repeat along u) */
const stripeTex = (a: string, b: string) => paint(64, 64, (g: G2, W, H) => {
  g.fillStyle = a; g.fillRect(0, 0, W, H); g.fillStyle = b; g.fillRect(W * 0.5, 0, W * 0.5, H);
  g.fillStyle = "rgba(60,44,40,0.1)"; g.fillRect(0, 0, W, 5); g.fillRect(W * 0.5 - 1, 0, 2, H); g.fillRect(0, 0, 2, H);
}, true);

/** THE DRESSER of one set: `d.barrel(x, z)` and the rest add their shapes to the set's batch in the town's palette.
 *  Places are world x, z (and y for a thing that stands on something); a thing on a front takes the front's matrix
 *  (c_town houseAt) and u along it, y up, k out from it. */
export const dresser = (Mk: Mk, BT: Batch, pal: DressPal, seed = 77) => {
  const r = rng(seed);
  const m = {
    wood: Mk.flat(pal.wood, 0.85), woodLo: Mk.flat(pal.woodLo, 0.85), iron: Mk.flat(pal.iron, 0.6), stone: Mk.flat(pal.stone, 0.9), stoneLo: Mk.flat(pal.stoneLo, 0.9),
    clay: Mk.flat(pal.clay, 0.85), leaf: Mk.flat(pal.leaf, 0.9), leafLo: Mk.flat(pal.leafLo, 0.9), bloom: Mk.flat(pal.bloom, 0.9), sack: Mk.flat(pal.sack, 0.95), straw: Mk.flat(pal.straw, 0.95),
    water: Mk.flat(pal.water, 0.4), cloth: Mk.tex(stripeTex(pal.clothA, pal.clothB), 0.95, THREE.DoubleSide), glass: Mk.basic(pal.glow),
  };
  const signs = new Map<Emblem, THREE.Material>();
  const signMat = (e: Emblem) => { if (!signs.has(e)) signs.set(e, Mk.tex(signTex(pal, e), 0.85)); return signs.get(e)!; };
  type Piece = [THREE.Material, THREE.BufferGeometry];
  /** pieces built round the origin, turned by yaw and set down at (x, y, z) */
  const set = (ps: Piece[], x: number, y: number, z: number, yaw = 0) => { for (const [mat, g] of ps) BT.add(mat, g.rotateY(yaw).translate(x, y, z)); };
  const on = (M: THREE.Matrix4) => (u: number, y: number, k: number) => V(u, y, k).applyMatrix4(M);

  // ------------------------------------------------------------------------------------------------ on the ground
  const barrelP = (h: number, R: number): Piece[] => {
    const ps: Piece[] = [[m.wood, lathe([[0, 0], [R * 0.8, 0], [R * 0.95, h * 0.22], [R, h * 0.5], [R * 0.95, h * 0.78], [R * 0.8, h], [R * 0.7, h], [R * 0.7, h - 0.035], [0, h - 0.035]], 18)]];
    for (const [k, rr] of [[0.1, 0.875], [0.36, 0.985], [0.64, 0.985], [0.9, 0.875]]) ps.push([m.iron, new THREE.CylinderGeometry(R * rr + 0.009, R * rr + 0.009, 0.045, 18, 1, true).translate(0, h * k, 0)]);
    return ps;
  };
  /** a barrel standing (or lying on its side, `lying` = the yaw of its axis) */
  const barrel = (x: number, z: number, o: { h?: number; r?: number; y?: number; lying?: number } = {}) => {
    const h = o.h ?? 0.86, R = o.r ?? 0.29, ps = barrelP(h, R);
    if (o.lying === undefined) set(ps, x, o.y ?? 0, z);
    else set(ps.map(([mat, g]) => [mat, g.translate(0, -h / 2, 0).rotateZ(Math.PI / 2)] as Piece), x, (o.y ?? 0) + R, z, o.lying);
  };
  const crateP = (w: number, h: number, d: number): Piece[] => {
    const t = 0.035, ps: Piece[] = [[m.wood, new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)]];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) ps.push([m.woodLo, new THREE.BoxGeometry(t * 1.6, h + 0.012, t * 1.6).translate(sx * (w / 2 - t * 0.5), h / 2, sz * (d / 2 - t * 0.5))]);
    for (const sy of [0.14, 0.86]) ps.push([m.woodLo, new THREE.BoxGeometry(w + 0.008, t, d + 0.008).translate(0, h * sy, 0)]);
    return ps;
  };
  const crate = (x: number, y: number, z: number, w = 0.5, h = 0.34, d = 0.4, yaw = 0) => set(crateP(w, h, d), x, y, z, yaw);
  const sackP = (s: number): Piece[] => [[m.sack, lathe([[0, 0], [0.2, 0.01], [0.27, 0.13], [0.275, 0.3], [0.22, 0.46], [0.09, 0.55], [0.065, 0.58], [0.1, 0.64], [0, 0.64]], 14).scale(s, s, s * 0.78)]];
  const sack = (x: number, z: number, s = 1, yaw = 0, y = 0) => set(sackP(s), x, y, z, yaw);
  /** a plank bench: its length along local x */
  const bench = (x: number, z: number, yaw = 0, w = 1.4) => {
    const ps: Piece[] = [[m.wood, boxG(-w / 2, w / 2, 0.4, 0.46, -0.17, 0.17)]];
    for (const s of [-1, 1]) ps.push([m.woodLo, boxG(s * (w / 2 - 0.16) - 0.03, s * (w / 2 - 0.16) + 0.03, 0, 0.4, -0.14, 0.14)]);
    set(ps, x, 0, z, yaw);
  };
  /** a lumpy ball of leaves */
  const bushG = (rad: number, seed0: number, squash = 0.9) => {
    const g = new THREE.IcosahedronGeometry(rad, 1), p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const a = p.getX(i) / rad, b = p.getY(i) / rad, c = p.getZ(i) / rad, k = 0.84 + 0.32 * (0.5 + 0.5 * Math.sin(a * 5.1 + b * 3.7 + c * 6.3 + seed0)); p.setXYZ(i, a * rad * k, b * rad * k * squash, c * rad * k); }
    g.computeVertexNormals(); return g;
  };
  const bush = (x: number, y: number, z: number, rad: number, lo = false) => BT.add(lo ? m.leafLo : m.leaf, bushG(rad, r() * 50).translate(x, y, z));
  /** a terracotta pot: with a bush, a small cypress ("tall"), dry twigs, or empty */
  const pot = (x: number, z: number, o: { r?: number; y?: number; plant?: "bush" | "tall" | "dry" | "none" } = {}) => {
    const R = o.r ?? 0.17, h = R * 1.5, y = o.y ?? 0, plant = o.plant ?? "bush";
    BT.add(m.clay, lathe([[0, 0], [R * 0.62, 0], [R, h], [R * 1.1, h], [R * 1.1, h + 0.035], [R * 0.84, h + 0.035], [R * 0.84, h - 0.02], [0, h - 0.02]], 16).translate(x, y, z));
    if (plant === "bush") bush(x, y + h + R * 0.75, z, R * 1.25);
    else if (plant === "tall") BT.add(m.leafLo, lathe([[0, 0], [R * 0.75, R * 0.5], [R * 0.85, R * 2.2], [R * 0.5, R * 4.6], [0, R * 6]], 10).translate(x, y + h - 0.02, z));
    else if (plant === "dry") for (let i = 0; i < 5; i++) { const a = r() * 6.28, l = R * (1.6 + 1.6 * r()); BT.add(m.straw, bar(V(x, y + h - 0.02, z), V(x + Math.cos(a) * l * 0.45, y + h + l, z + Math.sin(a) * l * 0.45), 0.008, 0.004, 5)); }
  };
  /** a stone trough on two feet, its length along local x (dry: no water) */
  const trough = (x: number, z: number, yaw = 0, w = 1.5, water = true) => {
    const d = 0.56, h = 0.52, t = 0.08, y0 = 0.1, ps: Piece[] = [[m.stone, boxG(-w / 2, w / 2, y0, y0 + 0.1, -d / 2, d / 2)]];
    for (const s of [-1, 1]) {
      ps.push([m.stone, boxG(-w / 2, w / 2, y0 + 0.1, h, s > 0 ? d / 2 - t : -d / 2, s > 0 ? d / 2 : -d / 2 + t)]);
      ps.push([m.stone, boxG(s > 0 ? w / 2 - t : -w / 2, s > 0 ? w / 2 : -w / 2 + t, y0 + 0.1, h, -d / 2 + t, d / 2 - t)]);
      ps.push([m.stoneLo, boxG(s * (w / 2 - 0.25) - 0.1, s * (w / 2 - 0.25) + 0.1, 0, y0, -d / 2 + 0.04, d / 2 - 0.04)]);
    }
    if (water) ps.push([m.water, boxG(-w / 2 + t, w / 2 - t, y0 + 0.1, h - 0.1, -d / 2 + t, d / 2 - t)]);
    set(ps, x, 0, z, yaw);
  };
  const bucket = (x: number, y: number, z: number, s = 1) => {
    const ps: Piece[] = [[m.wood, lathe([[0, 0], [0.105 * s, 0], [0.135 * s, 0.24 * s], [0.118 * s, 0.24 * s], [0.095 * s, 0.03 * s], [0, 0.03 * s]], 14)]];
    for (const k of [0.25, 0.8]) ps.push([m.iron, new THREE.CylinderGeometry((0.105 + 0.03 * k) * s + 0.006, (0.105 + 0.03 * k) * s + 0.006, 0.026 * s, 14, 1, true).translate(0, 0.24 * s * k, 0)]);
    ps.push([m.iron, new THREE.TorusGeometry(0.13 * s, 0.007, 5, 12, Math.PI).translate(0, 0.24 * s, 0)]);
    set(ps, x, y, z, r() * 3);
  };
  /** a wicker basket heaped with something (leaves or pale fruit) */
  const basket = (x: number, y: number, z: number, R = 0.2, fill: "leaf" | "bloom" | "straw" | "none" = "leaf") => {
    BT.add(m.straw, lathe([[0, 0], [R * 0.72, 0], [R, R * 0.75], [R * 0.9, R * 0.75], [R * 0.66, 0.03], [0, 0.03]], 14).translate(x, y, z));
    if (fill !== "none") BT.add(fill === "leaf" ? m.leafLo : fill === "bloom" ? m.bloom : m.sack, bushG(R * 0.86, r() * 50, 0.5).translate(x, y + R * 0.66, z));
  };
  const jar = (x: number, y: number, z: number, s = 1, lying?: number) => {
    const g = lathe([[0, 0], [0.07, 0], [0.13, 0.14], [0.14, 0.26], [0.09, 0.36], [0.055, 0.4], [0.07, 0.44], [0.05, 0.44], [0.045, 0.4], [0, 0.4]], 14).scale(s, s, s);
    if (lying === undefined) BT.add(m.clay, g.translate(x, y, z)); else BT.add(m.clay, g.translate(0, -0.2 * s, 0).rotateZ(Math.PI / 2).rotateY(lying).translate(x, y + 0.14 * s, z));
  };
  /** a plank wheel (a disc, an iron tyre, a hub: NO spokes), its axis along local z */
  const wheelP = (R: number): Piece[] => [
    [m.wood, new THREE.CylinderGeometry(R, R, 0.06, 22).rotateX(Math.PI / 2)], [m.iron, new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.076, 22, 1, true).rotateX(Math.PI / 2)],
    [m.woodLo, new THREE.CylinderGeometry(0.1, 0.1, 0.15, 12).rotateX(Math.PI / 2)],
  ];
  /** a wheel lying on the ground */
  const wheelDown = (x: number, z: number, R = 0.44) => set(wheelP(R).map(([mat, g]) => [mat, g.rotateX(Math.PI / 2)] as Piece), x, 0.04, z);
  /** A TWO-WHEELED HANDCART, its shafts toward local +x, resting on them. `load`: sacks and a crate in it.
   *  `broken`: one wheel is off (lay it beside with wheelDown) and the cart has sunk onto that axle end */
  const cart = (x: number, z: number, yaw: number, o: { load?: boolean; broken?: boolean } = {}) => {
    const L = 1.5, W = 0.82, yb = 0.56, R = 0.44, ps: Piece[] = [[m.wood, boxG(-L / 2, L / 2, yb, yb + 0.05, -W / 2, W / 2)]];
    for (const s of [-1, 1]) ps.push([m.wood, boxG(-L / 2, L / 2, yb + 0.05, yb + 0.3, s > 0 ? W / 2 - 0.04 : -W / 2, s > 0 ? W / 2 : -W / 2 + 0.04)]);
    ps.push([m.wood, boxG(-L / 2, -L / 2 + 0.04, yb + 0.05, yb + 0.3, -W / 2 + 0.04, W / 2 - 0.04)]);
    ps.push([m.woodLo, boxG(-0.05, 0.05, yb - 0.11, yb, -W / 2 - 0.03, W / 2 + 0.03)]);
    for (const s of [-1, 1]) ps.push([m.woodLo, bar(V(L / 2 - 0.1, yb + 0.02, s * (W / 2 - 0.06)), V(L / 2 + 1.05, yb + 0.02, s * (W / 2 - 0.06)), 0.03, 0.024, 6)]);
    for (const s of o.broken ? [-1] : [-1, 1]) for (const [mat, g] of wheelP(R)) ps.push([mat, g.translate(0, R, s * (W / 2 + 0.07))]);
    if (o.load) { for (const [mat, g] of sackP(0.9)) ps.push([mat, g.translate(-0.35, yb + 0.05, 0.08)]); for (const [mat, g] of sackP(0.8)) ps.push([mat, g.rotateY(1).translate(0.05, yb + 0.05, -0.1)]); for (const [mat, g] of crateP(0.42, 0.3, 0.36)) ps.push([mat, g.translate(0.48, yb + 0.05, 0.05)]); }
    // it rests on its shafts: tipped about the axle until their ends touch the ground
    const tip = o.broken ? 0.1 : Math.asin((R - 0.03) / Math.hypot(L / 2 + 1.05, yb + 0.02 - R)) + Math.atan2(yb + 0.02 - R, L / 2 + 1.05);
    for (const p of ps) p[1].translate(0, -R, 0).rotateZ(-tip).translate(0, R, 0);
    // broken: rolled about the remaining wheel's foot until the bare axle end is on the ground
    if (o.broken) { const z0 = -(W / 2 + 0.07), roll = Math.atan2(yb - 0.11, W / 2 + 0.03 - z0); for (const p of ps) p[1].translate(0, 0, -z0).rotateX(roll).translate(0, 0, z0); }
    set(ps, x, 0, z, yaw);
  };
  /** A MARKET STALL: a plank table on trestles under a striped canopy on four poles, its front toward local +z */
  const stall = (x: number, z: number, yaw: number, o: { w?: number; cloth?: boolean; goods?: boolean } = {}) => {
    const w = o.w ?? 1.9, d = 0.85, hF = 2.0, hB = 2.3, ps: Piece[] = [[m.wood, boxG(-w / 2, w / 2, 0.78, 0.83, -d / 2, d / 2)]];
    for (const s of [-1, 1]) for (const k of [-1, 1]) ps.push([m.woodLo, bar(V(s * (w / 2 - 0.25), 0.78, k * 0.1), V(s * (w / 2 - 0.25), 0, k * 0.36), 0.026, 0.026, 6)]);
    for (const s of [-1, 1]) { ps.push([m.woodLo, bar(V(s * (w / 2 + 0.04), 0, d / 2 + 0.06), V(s * (w / 2 + 0.04), hF, d / 2 + 0.06), 0.024, 0.024, 6)]); ps.push([m.woodLo, bar(V(s * (w / 2 + 0.04), 0, -d / 2 - 0.06), V(s * (w / 2 + 0.04), hB, -d / 2 - 0.06), 0.024, 0.024, 6)]); }
    if (o.cloth !== false) {
      const a = V(-w / 2 - 0.14, hB + 0.03, -d / 2 - 0.16), b = V(w / 2 + 0.14, hB + 0.03, -d / 2 - 0.16), c = V(w / 2 + 0.14, hF - 0.02, d / 2 + 0.34), e = V(-w / 2 - 0.14, hF - 0.02, d / 2 + 0.34);
      ps.push([m.cloth, quad4(e, c, b, a, (w + 0.28) / 0.44, 1)]);
      ps.push([m.cloth, quad4(e.clone().setY(e.y - 0.17), c.clone().setY(c.y - 0.17), c, e, (w + 0.28) / 0.44, 0.25)]);
    }
    set(ps, x, 0, z, yaw);
    if (o.goods !== false) {
      const c = Math.cos(yaw), s = Math.sin(yaw), at = (lx: number, lz: number): [number, number] => [x + lx * c + lz * s, z - lx * s + lz * c];
      { const [bx, bz] = at(-w * 0.3, 0.02); basket(bx, 0.83, bz, 0.19, "leaf"); }
      { const [bx, bz] = at(-w * 0.02, -0.05); basket(bx, 0.83, bz, 0.17, "bloom"); }
      { const [bx, bz] = at(w * 0.28, 0.06); crate(bx, 0.83, bz, 0.4, 0.2, 0.32, yaw + 0.2); }
      { const [bx, bz] = at(w * 0.12, 0.2); jar(bx, 0.83, bz, 0.8); }
    }
  };

  // ------------------------------------------------------------------------------------------------ on a house front
  /** a stone door step */
  const step = (M: THREE.Matrix4, u: number, w: number, d = 0.34, h = 0.15) => BT.add(m.stone, boxG(u - w / 2, u + w / 2, 0, h, 0, d).applyMatrix4(M));
  /** a ladder leaning on the front */
  const ladder = (M: THREE.Matrix4, u: number, top = 3.1, foot = 0.85, w = 0.42) => {
    const P = on(M);
    for (const s of [-1, 1]) BT.add(m.wood, bar(P(u + (s * w) / 2, 0, foot), P(u + (s * w) / 2, top, 0.06), 0.028, 0.028, 6));
    const n = Math.floor(top / 0.3);
    for (let i = 1; i < n; i++) { const t = i / n, k = foot + (0.06 - foot) * t; BT.add(m.woodLo, bar(P(u - w / 2, top * t, k), P(u + w / 2, top * t, k), 0.018, 0.018, 5)); }
  };
  /** a striped awning over a shop window: from the front at height y down and out, on two iron stays */
  const awning = (M: THREE.Matrix4, u: number, y: number, w: number, o: { out?: number; drop?: number } = {}) => {
    const out = o.out ?? 1.1, drop = o.drop ?? 0.5, P = on(M);
    const a = P(u - w / 2, y, 0.03), b = P(u + w / 2, y, 0.03), c = P(u + w / 2, y - drop, out), e = P(u - w / 2, y - drop, out);
    BT.add(m.cloth, quad4(e, c, b, a, w / 0.44, 1));
    BT.add(m.cloth, quad4(e.clone().setY(e.y - 0.16), c.clone().setY(c.y - 0.16), c, e, w / 0.44, 0.25));
    BT.add(m.iron, bar(e, c, 0.013, 0.013, 6));
    for (const s of [-1, 1]) BT.add(m.iron, bar(P(u + (s * w) / 2, y - drop, out), P(u + (s * w) / 2, y - drop - 0.75, 0.03), 0.011, 0.011, 6));
  };
  /** a shop sign: an iron arm out from the front, a painted board hanging under it (seen from along the street) */
  const sign = (M: THREE.Matrix4, u: number, y: number, e: Emblem, o: { out?: number } = {}) => {
    const out = o.out ?? 0.82, P = on(M), bw = 0.46, bh = 0.5, k1 = out - 0.05, k0 = k1 - bw, y1 = y - 0.1, y0 = y1 - bh;
    BT.add(m.iron, bar(P(u, y, 0), P(u, y, out), 0.016, 0.014, 6));
    BT.add(m.iron, bar(P(u, y - 0.34, 0), P(u, y, out * 0.55), 0.012, 0.012, 6));
    for (const k of [k0 + 0.07, k1 - 0.07]) BT.add(m.iron, bar(P(u, y, k), P(u, y1, k), 0.007, 0.007, 5));
    const F = boxFaces(u - 0.018, u + 0.018, y0, y1, k0, k1);
    BT.add(signMat(e), facesG([F.px, F.nx]).applyMatrix4(M));
    BT.add(m.woodLo, facesG([F.pz, F.nz, F.py, F.ny]).applyMatrix4(M));
  };
  /** a lantern on an iron bracket; give `lit` (a group that is shown at dusk) for its glow */
  const lantern = (M: THREE.Matrix4, u: number, y: number, o: { out?: number; lit?: THREE.Object3D } = {}) => {
    const out = o.out ?? 0.42, P = on(M), c = P(u, y - 0.21, out);
    BT.add(m.iron, bar(P(u, y, 0), P(u, y, out), 0.014, 0.012, 6));
    BT.add(m.iron, bar(P(u, y - 0.26, 0), P(u, y, out * 0.6), 0.01, 0.01, 6));
    BT.add(m.iron, bar(P(u, y, out), P(u, y - 0.06, out), 0.006, 0.006, 5));
    BT.add(m.iron, new THREE.ConeGeometry(0.105, 0.09, 4).rotateY(Math.PI / 4).translate(c.x, c.y + 0.15, c.z));
    BT.add(m.iron, new THREE.BoxGeometry(0.14, 0.022, 0.14).translate(c.x, c.y - 0.115, c.z));
    BT.add(m.glass, new THREE.BoxGeometry(0.112, 0.208, 0.112).translate(c.x, c.y, c.z));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) BT.add(m.iron, new THREE.BoxGeometry(0.014, 0.21, 0.014).translate(c.x + sx * 0.06, c.y, c.z + sz * 0.06));
    if (o.lit) { const g = glowCard(0.5, pal.glow, 0.42); g.position.copy(c); o.lit.add(g); }
  };
  /** a flower box on a sill: leaves and a few pale blooms */
  const flowerBox = (M: THREE.Matrix4, u: number, y: number, w = 0.8) => {
    const P = on(M);
    BT.add(m.clay, boxG(u - w / 2, u + w / 2, y, y + 0.15, 0.02, 0.22).applyMatrix4(M));
    const n = Math.max(2, Math.round(w / 0.24));
    for (let i = 0; i < n; i++) { const p = P(u - w / 2 + (w * (i + 0.5)) / n, y + 0.2, 0.13); BT.add(i % 2 ? m.leafLo : m.leaf, bushG(0.13, r() * 50, 0.8).translate(p.x, p.y, p.z)); }
    for (let i = 0; i < n + 1; i++) { const p = P(u - w / 2 + w * r(), y + 0.26 + 0.05 * r(), 0.2 + 0.05 * r()); BT.add(m.bloom, new THREE.IcosahedronGeometry(0.03, 0).translate(p.x, p.y, p.z)); }
  };
  /** a rain pipe down the front */
  const pipe = (M: THREE.Matrix4, u: number, top: number) => {
    const P = on(M);
    BT.add(m.iron, bar(P(u, 0.1, 0.06), P(u, top, 0.06), 0.035, 0.035, 8));
    for (let y = 0.7; y < top; y += 1.5) BT.add(m.iron, boxG(u - 0.06, u + 0.06, y, y + 0.05, 0, 0.1).applyMatrix4(M));
  };
  /** planks nailed LEVEL across a shut door or window (never crossed) */
  const boards = (M: THREE.Matrix4, u: number, w: number, ys: number[]) => {
    ys.forEach((y, i) => BT.add(i % 2 ? m.woodLo : m.wood, boxG(u - w / 2 - 0.02 * (i % 2), u + w / 2 + 0.03 * ((i + 1) % 2), y, y + 0.15, 0.012 + 0.006 * (i % 2), 0.045 + 0.006 * (i % 2)).applyMatrix4(M)));
  };
  return { m, barrel, crate, sack, bench, bush, pot, trough, bucket, basket, jar, wheelDown, cart, stall, step, ladder, awning, sign, lantern, flowerBox, pipe, boards };
};
export type Dresser = ReturnType<typeof dresser>;
