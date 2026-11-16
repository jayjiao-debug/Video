// THE PROPS of the Qin film (PLAN 3, bible 2), built with the kit's prop kit (src/kit/props/kit.ts: Part = merged meshes
// + ONE black hull outline, layer NOINK; paint = mip-mapped canvas textures). Each builder fills a prop's group and may
// return a Hook that put() calls with the put's options; origins, axes and grips are those of props/index.ts PROP_INFO.
// WP3. The kit's rules hold (src/kit/props/README.md): a prop never goes through the ink pass (its hull is its line);
// nothing thinner than 1.2 cm; parts overlap by a centimetre (hidden) or stand apart; small pattern is PAINT; colours
// between #2b2630 and #f4f1ea; nothing random (seeded hash only); nothing changes from frame to frame except what a
// put() option drives (the scale's beam, the chart's sheet, the slips' count, the flies).
import * as THREE from "three";
import { V, M4, Part, NOINK, turned, limb, ball, box, prism, ringSeg, roundLoop, paint, bandTex, hash, type Kit } from "../../../kit/props/kit";
import type { PutOpts } from "./index";
import { ROAD_SET } from "../layout/road";

export type Hook = ((o: PutOpts, g: THREE.Group) => void) | void;
const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** the film's prop colours */
export const PC = {
  lac: "#2e2a33", lacHi: "#3d3846", lacRed: "#b8382e", gold: "#e2b03a", goldLo: "#b98a2c", bronze: "#c0903e", bronzeLo: "#8f6a2c",
  steel: "#dfe3e8", steelLo: "#b4bcc6", blade: "#e6e2d4",
  wood: "#8a6040", woodLo: "#6a4a32", woodHi: "#a87c54", bamboo: "#dccb98", bambooLo: "#b8a46c", cord: "#a8382e",
  paper: "#ece2c4", sea: "#5f9aa8", seaLo: "#3f7686", land: "#c9b27a", grip: "#6a2a26",
  clay: "#b48c6a", fish: "#7aa0b8", fishLo: "#557e98", belly: "#efe8d8", leaf: "#4f7a46", leafLo: "#3c6236", bark: "#6a4a32",
  rail: "#3a3840", railHi: "#6a6872", saltFish: "#c8b48a", saltFishLo: "#9a8460", basket: "#a8844e", basketLo: "#7e6036",
  cloth: "#8a2e28", clothHi: "#a8443a", curtain: "#c9a24a", curtainLo: "#9e7c34",
} as const;

// ------------------------------------------------------------------------------------------------- small helpers
// (a turned() profile runs from the BOTTOM up: the other way round its faces point in and it draws as its black hull)
/** a closed cylinder along x, centred on the origin */
const cylX = (r: number, len: number, seg = 16) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
/** a closed cylinder along y from y0 up h (r at the bottom, r1 at the top) */
const cylY = (r: number, h: number, y0: number, seg = 16, r1 = r) => new THREE.CylinderGeometry(r1, r, h, seg).translate(0, y0 + h / 2, 0);
/** a spoked wheel standing in the yz plane (axle along x) at (x, r, z): a rim, a hub and n spokes */
const wheel = (P: Part, K: Kit, r: number, x: number, z: number, o: { n?: number; col?: string; hub?: string; t?: number } = {}) => {
  const n = o.n ?? 12, col = K.flat(o.col ?? PC.woodLo), t = o.t ?? 0.06, rim = Math.max(0.03, r * 0.09);
  P.add(col, ringSeg(roundLoop(r - rim, r, t, Math.min(rim, t) * 0.4), 0, TAU, 48).rotateZ(Math.PI / 2).translate(x, r, z), 0.008);
  P.add(K.flat(o.hub ?? PC.bronzeLo), cylX(r * 0.16, t * 2.2, 16).translate(x, r, z), 0.006);
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; P.add(col, limb(V(x, r, z), V(x, r + Math.cos(a) * (r - rim * 0.6), z + Math.sin(a) * (r - rim * 0.6)), 0.014, 0.012, 6), 0); }
};

// ===================================================================================================== the sword
/** the EMPEROR's long sword at his size (the hilt matches the hilt at his hip, acc/sword.ts swordHilt x 1.08): +y toward
 *  the tip, origin = the middle of the grip, the flat of the blade faces z */
export const SWORD = { blade: 1.3, grip: 0.1, guard: 0.05, tip: 0.075 + 1.3, pommel: -0.075 } as const;
export const sword = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), gold = K.flat(PC.gold, { rough: 0.42 }), blade = K.flat(PC.blade, { rough: 0.3 });
  const gripTex = paint(16, 128, (c, w, h) => { c.fillStyle = PC.grip; c.fillRect(0, 0, w, h); c.fillStyle = "#b9a48a"; for (let y = 6; y < h; y += 14) c.fillRect(0, y, w, 4); });
  P.add(K.flat("#ffffff", { map: gripTex }), new THREE.CylinderGeometry(0.0125, 0.0135, SWORD.grip + 0.01, 14), 0.0045);
  // the disc pommel (剑首) and the lozenge guard (剑格), gold
  P.add(gold, turned([[0, -0.088], [0.021, -0.086], [0.025, -0.075], [0.021, -0.062], [0, -0.058]], 18), 0.0045);
  P.add(gold, turned([[0, 0.046], [0.024, 0.048], [0.056, 0.062], [0.03, 0.076], [0, 0.078]], 18).scale(1, 1, 0.48), 0.0045);
  // the blade: a ridge down the middle (a diamond section), 5.6 cm wide at the guard, tapering to a point
  P.add(blade, prism([[0.07, 0.028, 0.0075], [0.9, 0.024, 0.0068], [1.26, 0.019, 0.006], [SWORD.tip, 0.0008, 0.0006]]), 0.0055);
  P.into(g, "sword");
};
/** the scabbard as a thing of its own (lying beside him when he sits; the one at his hip is acc/sword.ts): black
 *  lacquer with gold fittings, 0.54 m (his hip scabbard at his size), the hilt standing in its mouth unless put({ on:
 *  false }). Origin = the middle of its mouth; it runs down -y from there (the hilt points +y) */
export const SCABBARD_LEN = 0.54;
export const scabbardProp = (K: Kit, g: THREE.Group): Hook => {
  const L = SCABBARD_LEN, P = new Part(K), lac = K.flat(PC.lac, { rough: 0.35 }), gold = K.flat(PC.gold, { rough: 0.42 });
  const flat = (geo: THREE.BufferGeometry) => geo.scale(0.74, 1, 1);
  P.add(lac, flat(turned([[0, -L], [0.015, -L], [0.024, -L + 0.043], [0.032, 0], [0, 0]], 28)), 0.0065);
  P.add(gold, flat(turned([[0, -L - 0.013], [0.022, -L - 0.013], [0.03, -L + 0.032], [0.031, -L + 0.086], [0, -L + 0.086]], 28)), 0.0065);
  P.add(gold, flat(turned([[0, -L * 0.38 - 0.012], [0.036, -L * 0.38 - 0.012], [0.036, -L * 0.38 + 0.012], [0, -L * 0.38 + 0.012]], 28)), 0.005);
  P.add(gold, flat(turned([[0, -0.07], [0.037, -0.07], [0.039, 0.006], [0, 0.006]], 28)), 0.0065);
  P.into(g, "scabbard");
  const hiltG = new THREE.Group(); hiltG.name = "scabbard.hilt"; g.add(hiltG);
  const H = new Part(K), gripTex = paint(16, 128, (c, w, h) => { c.fillStyle = PC.grip; c.fillRect(0, 0, w, h); c.fillStyle = "#b9a48a"; for (let y = 6; y < h; y += 14) c.fillRect(0, y, w, 4); });
  H.add(gold, turned([[0, 0.006], [0.028, 0.008], [0.06, 0.02], [0.03, 0.032], [0, 0.034]], 18).scale(1, 1, 0.46), 0.0045);
  H.add(K.flat("#ffffff", { map: gripTex }), cylY(0.0135, 0.1, 0.03, 14, 0.0125), 0.0045);
  H.add(gold, turned([[0, 0.126], [0.021, 0.128], [0.025, 0.14], [0.021, 0.152], [0, 0.155]], 18), 0.0045);
  H.into(hiltG, "scabbard.hilt");
  return (o) => { hiltG.visible = o.on !== false; };
};

// ===================================================================================================== the bamboo slips
/** a bundle of slips (竹简), rolled and tied: 0.30 long along x, r 0.07; how a tower of them is laid (log-cabin
 *  layers of two, each layer crosswise to the one below, an odd last one in the middle) */
export const SLIPS = { len: 0.3, r: 0.07, step: 0.13, max: 12 } as const;
/** where bundle k (0 = the lowest) lies in a tower of n, in the tower's frame: its middle and whether it runs along z */
export const slipSpot = (k: number, n: number): { p: THREE.Vector3; alongZ: boolean } => {
  if (n <= 1) return { p: V(0, SLIPS.r, 0), alongZ: false };
  const layer = Math.floor(k / 2), alongZ = layer % 2 === 1, y = SLIPS.r + layer * SLIPS.step;
  const alone = k === n - 1 && n % 2 === 1, off = alone ? 0 : (k % 2 ? 1 : -1) * 0.074;
  const j = (hash(k * 7.3 + 1.1) - 0.5) * 0.012;                                  // a centimetre of untidiness, fixed
  return { p: alongZ ? V(off, y, j) : V(j, y, off), alongZ };
};
export const slips = (K: Kit, g: THREE.Group): Hook => {
  // the roll's skin: the slips' edges along it, two red-brown cords round it; the ends: the slips' darker end grain in rings
  const side = paint(256, 128, (c, w, h) => {
    c.fillStyle = PC.bamboo; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.bambooLo; for (let i = 0; i < 20; i++) c.fillRect((w * i) / 20, 0, 3, h);
    c.fillStyle = PC.cord; for (const u of [0.26, 0.74]) c.fillRect(w * u - 7, 0, 14, h);
  });
  const end = paint(64, 64, (c, w, h) => {
    c.fillStyle = PC.bambooLo; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#9a8656"; c.lineWidth = 3; for (const r of [8, 16, 24]) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke(); }
  });
  const sideM = K.flat("#ffffff", { map: side, rough: 0.7 }), endM = K.flat("#ffffff", { map: end, rough: 0.7 });
  const P = new Part(K), R = SLIPS.r, Lh = SLIPS.len / 2;
  for (let k = 0; k < SLIPS.max; k++) {
    const { p, alongZ } = slipSpot(k, SLIPS.max), m = M4(p.x, p.y, p.z, 0, alongZ ? Math.PI / 2 : 0, 0);
    // (the tower of 12; a tower of n shows its first n bundles: the layout of the first n of 12 is the layout of n, except
    // an odd last one, which the hook moves to the middle)
    P.shell([[sideM, new THREE.CylinderGeometry(R, R, SLIPS.len, 18, 1, true).rotateZ(Math.PI / 2)],
      [endM, new THREE.CircleGeometry(R, 18).rotateY(Math.PI / 2).translate(Lh, 0, 0)], [endM, new THREE.CircleGeometry(R, 18).rotateY(-Math.PI / 2).translate(-Lh, 0, 0)]], 0.0055, m);
  }
  // ONE pair of meshes for all twelve (+ the hull): put({ n }) draws the first n bundles (drawRange); the odd last bundle of
  // a tower is drawn by a separate single bundle in the middle of its layer
  const all = new THREE.Group(); all.name = "slips.tower"; g.add(all);
  P.into(all, "slips");
  const one = new THREE.Group(); one.name = "slips.top"; g.add(one);
  const Q = new Part(K);
  Q.shell([[sideM, new THREE.CylinderGeometry(R, R, SLIPS.len, 18, 1, true).rotateZ(Math.PI / 2)],
    [endM, new THREE.CircleGeometry(R, 18).rotateY(Math.PI / 2).translate(Lh, 0, 0)], [endM, new THREE.CircleGeometry(R, 18).rotateY(-Math.PI / 2).translate(-Lh, 0, 0)]], 0.0055);
  Q.into(one, "slips");
  const meshes = all.children as THREE.Mesh[], per = meshes.map((m) => m.geometry.attributes.position.count / SLIPS.max);
  return (o) => {
    const n = Math.max(1, Math.min(SLIPS.max, Math.round(o.n ?? 1))), pairs = n % 2 === 1 ? n - 1 : n;
    meshes.forEach((m, i) => m.geometry.setDrawRange(0, per[i] * pairs));
    all.visible = pairs > 0;
    one.visible = n % 2 === 1;
    if (n % 2 === 1) { const s = slipSpot(n - 1, n); one.position.copy(s.p); one.rotation.set(0, s.alongZ ? Math.PI / 2 : 0, 0); }
  };
};

// ===================================================================================================== the scale (衡)
/** the steelyard balance on its stand: a post on a lacquer base, the beam pivoting at its top, a bronze pan hanging from
 *  the +x end (the bundles go in it), a bronze bell weight (权) from the -x end; tilt + = the +x end (the pan) down. The
 *  pan and the weight hang plumb whatever the tilt. */
export const SCALE = { post: 1.1, pivot: 1.13, arm: 0.42, cord: 0.3, panR: 0.13 } as const;
/** the pan's top middle in the scale's own frame (origin on the floor under the post), for a tilt: a slip bundle put
 *  here (its origin) lies across the pan's rim (it is longer than the pan is wide) */
export const scalePanLocal = (tilt: number) => V(SCALE.arm * Math.cos(tilt), SCALE.pivot - SCALE.arm * Math.sin(tilt) - SCALE.cord + 0.022, 0);
export const scale = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), lac = K.flat(PC.lac, { rough: 0.4 }), wood = K.flat(PC.woodLo), bronze = K.flat(PC.bronze, { rough: 0.45 }), bronzeLo = K.flat(PC.bronzeLo, { rough: 0.45 });
  P.add(lac, turned([[0, 0], [0.2, 0], [0.2, 0.035], [0.15, 0.06], [0, 0.06]], 32), 0.006);
  P.add(wood, cylY(0.028, SCALE.post - 0.06, 0.06, 14, 0.022), 0.0055);
  P.add(bronze, box(0.05, 0.07, 0.05, 0, SCALE.post + 0.015, 0), 0.005);               // the fork at the top
  P.into(g, "scale.stand");
  const beam = new THREE.Group(); beam.name = "scale.beam"; beam.position.y = SCALE.pivot; g.add(beam);
  const B = new Part(K);
  B.add(K.flat(PC.woodHi), cylX(0.014, 2 * SCALE.arm + 0.06, 12), 0.0045);
  const markTex = bandTex(PC.woodHi, [[0.2, 0.22, PC.lac], [0.32, 0.34, PC.lac], [0.44, 0.46, PC.lac], [0.56, 0.58, PC.lac]]);
  B.add(K.flat("#ffffff", { map: markTex }), cylX(0.0145, 0.3, 12).translate(-0.2, 0, 0), 0);
  B.add(bronze, ball(V(0, 0, 0), 0.022), 0.004);
  B.into(beam, "scale.beam");
  const hang = (x: number, name: string, build: (Q: Part) => void) => {
    const h = new THREE.Group(); h.name = name; h.position.x = x; beam.add(h);
    const Q = new Part(K);
    for (const [dx, dz] of [[0.07, 0], [-0.035, 0.06], [-0.035, -0.06]]) Q.add(bronzeLo, limb(V(0, 0, 0), V(dx, -SCALE.cord + 0.02, dz), 0.006, 0.006, 6), 0.003);
    build(Q); Q.into(h, name);
    return h;
  };
  const pan = hang(SCALE.arm, "scale.pan", (Q) => Q.add(bronze, turned([[0, -SCALE.cord - 0.02], [0.05, -SCALE.cord - 0.02], [SCALE.panR, -SCALE.cord + 0.01], [SCALE.panR + 0.012, -SCALE.cord + 0.02], [SCALE.panR - 0.01, -SCALE.cord + 0.012], [0, -SCALE.cord - 0.006]], 32), 0.005));
  const wt = hang(-SCALE.arm, "scale.weight", (Q) => Q.add(bronze, turned([[0, -SCALE.cord - 0.06], [0.05, -SCALE.cord - 0.06], [0.055, -SCALE.cord - 0.045], [0.042, -SCALE.cord], [0.018, -SCALE.cord + 0.02], [0, -SCALE.cord + 0.03]], 24), 0.005));
  return (o) => { const t = o.tilt ?? 0; beam.rotation.z = -t; pan.rotation.z = t; wt.rotation.z = t; };
};

// ===================================================================================================== the desk, the cushion
/** the low desk (案): a black lacquer top with a red-lacquer inner panel and gold corner fittings, four short curved
 *  legs on two floor bars (the rig's write pose sits behind it on a cushion: props/index.ts deskSeat) */
export const DESK = { w: 1.3, d: 0.6, top: 0.42, board: 0.045 } as const;
export const desk = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), lac = K.flat(PC.lac, { rough: 0.35 }), gold = K.flat(PC.gold, { rough: 0.42 });
  const topTex = paint(256, 128, (c, w, h) => {
    c.fillStyle = PC.lac; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.lacRed; c.fillRect(14, 14, w - 28, h - 28);
    c.strokeStyle = PC.gold; c.lineWidth = 3; c.strokeRect(22, 22, w - 44, h - 44);
    c.strokeStyle = "#8e2a24"; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(w / 2, h / 2, 12 + i * 9, 0, TAU); c.stroke(); }
  });
  const D = DESK, y0 = D.top - D.board;
  // the top: lacquer box with the painted top face
  P.shell([[K.flat("#ffffff", { map: topTex, rough: 0.35 }), new THREE.PlaneGeometry(D.w, D.d).rotateX(-Math.PI / 2).translate(0, D.top, 0)], [lac, box(D.w, D.board, D.d, 0, y0 + D.board / 2 - 0.0005, 0)]], 0.006);
  for (const sx of [-1, 1]) {
    // a pair of legs each side: curved outward a little, standing on a floor bar
    for (const sz of [-1, 1]) P.add(lac, limb(V(sx * (D.w / 2 - 0.1), y0 + 0.01, sz * (D.d / 2 - 0.09)), V(sx * (D.w / 2 - 0.06), 0.035, sz * (D.d / 2 - 0.06)), 0.024, 0.02, 10), 0.0055);
    P.add(lac, box(0.06, 0.035, D.d - 0.04, sx * (D.w / 2 - 0.06), 0.0175, 0), 0.0055);
    for (const sz of [-1, 1]) P.add(gold, box(0.07, D.board + 0.008, 0.07, sx * (D.w / 2 - 0.03), y0 + D.board / 2, sz * (D.d / 2 - 0.03)), 0.004);
  }
  P.into(g, "desk");
};
/** a square floor cushion (坐垫): 0.62 x 0.62, PAD 0.10 high, dark red cloth with a gold edge */
export const CUSHION = { w: 0.62, h: 0.1 } as const;
export const cushion = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), tex = paint(128, 128, (c, w, h) => { c.fillStyle = PC.cloth; c.fillRect(0, 0, w, h); c.strokeStyle = PC.gold; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = PC.clothHi; c.beginPath(); c.arc(w / 2, h / 2, 14, 0, TAU); c.fill(); });
  const geo = new THREE.BoxGeometry(CUSHION.w, CUSHION.h, CUSHION.w, 6, 2, 6), pos = geo.attributes.position;
  // soften it: the corners and the top's middle puffed
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.max(Math.abs(x), Math.abs(z)) / (CUSHION.w / 2);
    pos.setY(i, y > 0 ? y + 0.018 * (1 - r * r) : y);
    const k = 1 - 0.06 * (y > 0 ? 1 : 0.4) * (r > 0.9 ? 1 : 0); pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  geo.translate(0, CUSHION.h / 2, 0); geo.computeVertexNormals();
  P.add(K.flat("#ffffff", { map: tex, rough: 0.85 }), geo, 0.006);
  P.into(g, "cushion");
};

// ===================================================================================================== writing
/** a writing brush, 0.25 m: a bamboo shaft with a dark band, a black hair tip; +y toward the tip */
export const brush = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.bamboo), cylY(0.0075, 0.2, -0.125, 10), 0.0035);
  P.add(K.flat(PC.lac), cylY(0.008, 0.02, -0.13, 10), 0.0035);
  P.add(K.flat("#2e2a33"), turned([[0, 0.075], [0.0085, 0.075], [0.009, 0.085], [0, 0.125]], 12), 0.0035);
  P.into(g, "brush");
};
/** an ink stone (砚) with a black ink pool: 0.16 x 0.10, 0.03 high */
export const inkstone = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat("#4a4652", { rough: 0.6 }), box(0.16, 0.03, 0.1, 0, 0.015, 0), 0.004);
  P.add(K.flat("#2b2630", { rough: 0.2 }), new THREE.CircleGeometry(0.032, 20).rotateX(-Math.PI / 2).translate(-0.03, 0.0305, 0), 0);
  P.into(g, "inkstone");
};

// ===================================================================================================== the crossbow
/** the repeating crossbow (连弩): a chunky wooden stock along +z, a lacquered box magazine on top with bolt tails
 *  sticking out of it, a short recurved bow across x at the front with its string, a bronze trigger; origin = the
 *  rear grip under the stock */
export const crossbow = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), wood = K.flat(PC.wood), woodLo = K.flat(PC.woodLo), lac = K.flat(PC.lac, { rough: 0.35 }), bronze = K.flat(PC.bronze, { rough: 0.45 });
  P.add(wood, box(0.06, 0.07, 0.72, 0, 0.065, 0.24), 0.0055);                         // the stock
  P.add(woodLo, limb(V(0, 0.04, 0.02), V(0, -0.06, -0.03), 0.024, 0.02, 10), 0.0055); // the grip
  P.add(bronze, box(0.03, 0.05, 0.05, 0, 0.02, 0.07), 0.004);                         // the trigger box
  // the magazine: a lacquer box with red edging, the bolts' tails out of its top
  const magTex = paint(64, 64, (c, w, h) => { c.fillStyle = PC.lac; c.fillRect(0, 0, w, h); c.strokeStyle = PC.lacRed; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10); });
  P.add(K.flat("#ffffff", { map: magTex, rough: 0.35 }), box(0.09, 0.14, 0.3, 0, 0.17, 0.3), 0.0055);
  for (let i = 0; i < 4; i++) P.add(K.flat(PC.woodHi), cylY(0.008, 0.06, 0.23, 8).translate(-0.027 + i * 0.018, 0, 0.2 + (i % 2) * 0.04), 0.003);
  // the bow: a flattened recurved arc across x at the front, and the string back to the nut
  const arc = new THREE.CurvePath<THREE.Vector3>();
  const pts = [V(-0.38, 0.07, 0.5), V(-0.2, 0.07, 0.6), V(0, 0.07, 0.64), V(0.2, 0.07, 0.6), V(0.38, 0.07, 0.5)];
  arc.add(new THREE.CatmullRomCurve3(pts));
  P.add(woodLo, new THREE.TubeGeometry(arc.curves[0] as THREE.CatmullRomCurve3, 24, 0.016, 8, false), 0.005);
  for (const s of [-1, 1]) P.add(K.flat(PC.paper), limb(V(s * 0.38, 0.07, 0.5), V(s * 0.03, 0.08, 0.33), 0.006, 0.006, 5), 0.003);
  P.into(g, "crossbow");
};
/** one crossbow bolt (the fish flashback): 0.36 m, a bronze head, two pale vanes; +y toward the head, origin = middle */
export const bolt = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.woodHi), cylY(0.0065, 0.32, -0.18, 8), 0.003);
  P.add(K.flat(PC.bronze), turned([[0, 0.125], [0.009, 0.125], [0.014, 0.14], [0, 0.18]], 10), 0.003);
  for (const a of [0, Math.PI / 2]) P.add(K.flat(PC.paper, { side: THREE.DoubleSide }), box(0.03, 0.06, 0.002, 0, -0.14, 0).rotateY(a), 0.0);
  P.into(g, "bolt");
};

// ===================================================================================================== the sea chart
/** 徐福's sea chart: a wooden roller 0.50 along x with gold knobs; open 0..1 unrolls a painted sheet 0.40 m down from it
 *  (sea, islands of the immortals with a little palace, a red route, a cartoon fish) with a second roller at its foot.
 *  The sheet shows its TOP part while it unrolls (its texture is cropped, never squashed). Origin = the middle of the
 *  top roller */
export const CHART = { w: 0.44, h: 0.4, r: 0.03 } as const;
export const seaChart = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), wood = K.flat(PC.woodLo), gold = K.flat(PC.gold, { rough: 0.42 });
  const roller = (Q: Part) => { Q.add(wood, cylX(CHART.r, 0.48, 16), 0.0045); for (const s of [-1, 1]) Q.add(gold, ball(V(s * 0.255, 0, 0), 0.026), 0.004); };
  roller(P); P.into(g, "seaChart.roller");
  const map = paint(256, 256, (c, w, h) => {
    c.fillStyle = PC.paper; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.sea; c.fillRect(10, 10, w - 20, h - 20);
    c.strokeStyle = PC.seaLo; c.lineWidth = 3;
    for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) { const x = 22 + i * 40 + (j % 2) * 20, y = 26 + j * 26; c.beginPath(); c.arc(x, y, 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // the coast along the left edge, three islands of the immortals with peaks, a tiny palace on the biggest
    c.fillStyle = PC.land; c.beginPath(); c.moveTo(10, 10); c.lineTo(52, 10); c.quadraticCurveTo(40, 90, 64, 150); c.quadraticCurveTo(30, 200, 46, 246); c.lineTo(10, 246); c.fill();
    for (const [x, y, r] of [[170, 70, 30], [205, 150, 20], [140, 190, 16]]) {
      c.fillStyle = PC.land; c.beginPath(); c.ellipse(x, y, r, r * 0.6, 0, 0, TAU); c.fill();
      c.fillStyle = "#7a9a5a"; c.beginPath(); c.moveTo(x - r * 0.6, y); c.lineTo(x - r * 0.15, y - r * 0.9); c.lineTo(x + r * 0.3, y - r * 0.2); c.lineTo(x + r * 0.55, y - r * 0.7); c.lineTo(x + r * 0.8, y); c.fill();
    }
    c.fillStyle = PC.lacRed; c.fillRect(160, 46, 18, 10); c.fillStyle = PC.lac; c.fillRect(156, 40, 26, 6);
    // the route: a dashed red line from the coast out to the big island, and the fish in the way
    c.strokeStyle = PC.lacRed; c.lineWidth = 4; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(60, 120); c.quadraticCurveTo(110, 60, 150, 76); c.stroke(); c.setLineDash([]);
    c.fillStyle = PC.fishLo; c.beginPath(); c.ellipse(108, 118, 22, 10, -0.2, 0, TAU); c.fill(); c.beginPath(); c.moveTo(84, 122); c.lineTo(72, 110); c.lineTo(72, 134); c.fill();
    c.fillStyle = PC.belly; c.beginPath(); c.arc(120, 114, 3.5, 0, TAU); c.fill();
    c.strokeStyle = "#8a7a5a"; c.lineWidth = 4; c.strokeRect(10, 10, w - 20, h - 20);
  });
  map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  const sheetGeo = new THREE.PlaneGeometry(CHART.w, 1, 1, 1).translate(0, -0.5, 0);
  const tex = map.clone(); tex.needsUpdate = true;
  const sheet = new THREE.Mesh(sheetGeo, K.flat("#ffffff", { map: tex, side: THREE.DoubleSide, rough: 0.8 }));
  sheet.name = "seaChart.sheet"; sheet.position.z = 0.004; sheet.layers.set(NOINK); g.add(sheet);
  const foot = new THREE.Group(); foot.name = "seaChart.foot"; g.add(foot);
  const F = new Part(K); roller(F); F.into(foot, "seaChart.foot");
  return (o) => {
    const k = clamp01(o.open ?? 0), hgt = Math.max(0.001, CHART.h * k);
    sheet.visible = k > 0.01; sheet.scale.y = hgt;
    // the top part of the map shows: v from 1 down to 1 - k
    tex.repeat.set(1, Math.max(0.0025, k)); tex.offset.set(0, 1 - Math.max(0.0025, k));
    foot.position.y = -hgt - (k > 0.01 ? CHART.r * 0.7 : 0);
    foot.visible = k > 0.01;
  };
};

// ===================================================================================================== the sand-table things
/** the giant cartoon fish (sand-table scale, 0.42 long, swims along +x): a fat blue body with a pale belly, a big round
 *  eye with a pupil, a forked tail, a dorsal fin, a painted smile and gill line. Origin = the middle of its belly at the
 *  waterline */
export const fish = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), body = K.flat(PC.fish, { rough: 0.5 }), fin = K.flat(PC.fishLo, { rough: 0.5 });
  const skin = paint(256, 128, (c, w, h) => {
    c.fillStyle = PC.fish; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.belly; c.fillRect(0, h * 0.62, w, h * 0.38);
    c.fillStyle = PC.fishLo; for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(30 + i * 24 + (j % 2) * 12, 14 + j * 16, 6, 0, Math.PI); c.fill(); }
  });
  P.add(K.flat("#ffffff", { map: skin, rough: 0.5 }), ball(V(0, 0.07, 0), 0.21, [1, 0.5, 0.36], 24).rotateZ(0), 0.0055);
  P.add(fin, new THREE.ConeGeometry(0.075, 0.14, 4).rotateZ(Math.PI / 2).scale(1, 1.2, 0.25).translate(-0.255, 0.1, 0), 0.005);
  P.add(fin, new THREE.ConeGeometry(0.075, 0.14, 4).rotateZ(Math.PI / 2).scale(1, 1.2, 0.25).translate(-0.255, 0.04, 0).rotateZ(0), 0.005);
  P.add(fin, new THREE.ConeGeometry(0.05, 0.12, 4).scale(1.4, 1, 0.2).translate(-0.02, 0.2, 0), 0.005);
  for (const s of [-1, 1]) {
    P.add(K.flat(PC.belly), ball(V(0.12, 0.1, s * 0.058), 0.034, [1, 1, 0.6]), 0.004);
    P.add(K.flat("#2b2630"), ball(V(0.13, 0.1, s * 0.074), 0.016, [1, 1, 0.5]), 0);
    P.add(K.flat("#f4f1ea"), ball(V(0.137, 0.108, s * 0.08), 0.005, [1, 1, 0.5]), 0);
    P.add(fin, new THREE.ConeGeometry(0.03, 0.07, 4).rotateZ(Math.PI * 0.7).scale(1, 1, 0.3).translate(0.03, 0.04, s * 0.07), 0.004);
  }
  P.into(g, "fish");
};
/** the tiny boat (sand table): 0.26 long, bow toward +z, a hull, a cabin, a mast with a square sail */
export const boat = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), wood = K.flat(PC.wood), woodLo = K.flat(PC.woodLo);
  P.add(wood, prism([[-0.13, 0.03, 0.035], [-0.05, 0.045, 0.045], [0.06, 0.042, 0.042], [0.13, 0.006, 0.02]]).rotateX(Math.PI / 2).scale(1, 1, 0.6).translate(0, 0.02, 0), 0.003);
  P.add(woodLo, box(0.05, 0.03, 0.06, 0, 0.05, -0.05), 0.003);
  P.add(woodLo, cylY(0.004, 0.17, 0.03, 6), 0.0025);
  P.add(K.flat(PC.paper, { side: THREE.DoubleSide }), box(0.11, 0.09, 0.004, 0, 0.14, 0.01), 0.0025);
  P.into(g, "boat");
};
/** the pine of 泰山 (made 五大夫): 0.36 high, a crooked trunk and three flat tiers of needles. Origin = its foot */
export const tree = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), bark = K.flat(PC.bark), leaf = K.flat(PC.leaf, { rough: 0.8 }), leafLo = K.flat(PC.leafLo, { rough: 0.8 });
  P.add(bark, limb(V(0, 0, 0), V(0.02, 0.14, 0), 0.02, 0.016, 8), 0.003);
  P.add(bark, limb(V(0.02, 0.14, 0), V(-0.01, 0.3, 0), 0.016, 0.01, 8), 0.003);
  P.add(bark, limb(V(0.015, 0.17, 0), V(0.09, 0.22, 0.02), 0.009, 0.006, 6), 0.003);
  for (const [x, y, z, r, m] of [[0.0, 0.2, 0, 0.12, 0], [0.09, 0.24, 0.02, 0.075, 1], [-0.015, 0.3, 0, 0.085, 0], [-0.005, 0.355, 0, 0.05, 1]] as [number, number, number, number, number][]) {
    P.add(m ? leafLo : leaf, ball(V(x, y, z), r, [1.2, 0.36, 1.0], 16), 0.004);
  }
  P.into(g, "tree");
};
/** the official's hat (五大夫) that pops onto the tree: 0.07 high, a black cap with a red band and a little gable on
 *  top. Origin = the middle of its foot */
export const hat = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), black = K.flat("#2e2a33");
  P.add(black, turned([[0, 0], [0.032, 0], [0.033, 0.03], [0.028, 0.034], [0, 0.034]], 18), 0.0025);
  P.add(K.flat(PC.lacRed), turned([[0, 0.002], [0.0335, 0.002], [0.0335, 0.012], [0, 0.012]], 18), 0);
  P.add(black, prism([[-0.03, 0.03, 0.012], [0.03, 0.03, 0.012]]).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).scale(1, 1.2, 1).translate(0, 0.045, 0), 0.0025);
  P.into(g, "hat");
};

// ===================================================================================================== the carriages
/** a horse in the props' style, very plain (seen far, in front of the small carriages): body, neck, head, four legs,
 *  a tail; along -z (it walks toward -z) from `z0`, standing on y 0 */
const plainHorse = (P: Part, K: Kit, x: number, z0: number, col = "#8a6a50") => {
  const m = K.flat(col), dark = K.flat("#4a3a30");
  P.add(m, ball(V(x, 0.95, z0 - 0.55), 0.3, [0.75, 0.8, 1.7], 14), 0.008);
  P.add(m, limb(V(x, 1.05, z0 - 0.95), V(x, 1.4, z0 - 1.15), 0.12, 0.09, 10), 0.008);
  P.add(m, ball(V(x, 1.45, z0 - 1.28), 0.1, [0.8, 0.8, 1.6], 12), 0.007);
  for (const [dx, dz] of [[-0.12, -0.9], [0.12, -0.9], [-0.12, -0.2], [0.12, -0.2]]) P.add(m, limb(V(x + dx, 0.85, z0 + dz), V(x + dx, 0.02, z0 + dz), 0.05, 0.04, 8), 0.006);
  P.add(dark, limb(V(x, 1.0, z0 - 0.06), V(x, 0.6, z0 + 0.08), 0.05, 0.02, 8), 0.006);
  P.add(dark, box(0.06, 0.25, 0.4, x, 1.45, z0 - 1.05), 0.005);
};
/** a small carriage of the procession (far, on the terrace's road / behind the big one): a lacquer box on two spoked
 *  wheels under a round parasol canopy, a horse in front; 2.2 m long (the box), the horse 1.4 m more toward -z */
export const carriage = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), lac = K.flat(PC.lac, { rough: 0.4 }), red = K.flat(PC.cloth);
  P.add(lac, box(1.3, 0.75, 1.6, 0, 0.95, 0.1), 0.01);
  P.add(K.flat(PC.gold), box(1.34, 0.08, 1.64, 0, 1.3, 0.1), 0.008);
  P.add(K.flat(PC.woodLo), cylY(0.03, 0.9, 1.3, 8), 0.006);
  P.add(red, turned([[0, 2.0], [1.05, 2.12], [1.1, 2.08], [0.15, 2.32], [0, 2.34]], 24), 0.01);
  wheel(P, K, 0.62, -0.72, 0.1); wheel(P, K, 0.62, 0.72, 0.1);
  for (const s of [-1, 1]) P.add(K.flat(PC.woodLo), limb(V(s * 0.3, 0.8, -0.7), V(s * 0.3, 0.95, -1.9), 0.035, 0.03, 8), 0.006);
  plainHorse(P, K, 0, -1.0);
  P.into(g, "carriage");
};
/** the closed ornate carriage (辒凉车) at the sizes of the road set (layout/road.ts ROAD_SET.carriage, WP2's numbers: the
 *  shots stage the curtain and the rack from them): a box with a curtained window on each side (gold curtains, a red
 *  and gold band), a low hipped roof with a gold ridge and upturned corners, two big spoked wheels toward the front,
 *  shafts forward, a rack out at the back (the baskets of salted fish go on it). put({ open }) 0..1 parts the +x
 *  window's curtain (the hands pass the slips through it). Origin = on the ground under its middle; faces -z */
const RC = ROAD_SET.carriage;
export const BIG_CARRIAGE = {
  w: RC.w, l: RC.len, floor: RC.floor, roof: RC.roof, top: RC.top,
  /** the window on each side: its middle (x on the +x side, y, z), width (along z) and height */
  window: { x: RC.w / 2, y: (RC.win.y0 + RC.win.y1) / 2, z: RC.win.dz, w: RC.win.w, h: RC.win.y1 - RC.win.y0 },
  /** the rack: its top, the middle of its depth (z), its width and depth */
  rack: { y: RC.rack.y, z: RC.len / 2 + RC.rack.out / 2 - 0.055, w: 1.3, d: RC.rack.out },
} as const;
export const bigCarriage = (K: Kit, g: THREE.Group): Hook => {
  const B = BIG_CARRIAGE, P = new Part(K), lac = K.flat(PC.lac, { rough: 0.35 }), gold = K.flat(PC.gold, { rough: 0.42 }), wood = K.flat(PC.woodLo);
  const boxH = B.roof - B.floor, y0 = B.floor;
  const wallTex = paint(256, 128, (c, w, h) => {
    c.fillStyle = PC.lac; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.cloth; c.fillRect(0, h * 0.8, w, h * 0.11);
    c.strokeStyle = PC.gold; c.lineWidth = 3; c.strokeRect(6, 6, w - 12, h * 0.72);
    c.strokeStyle = "#8a6a2a"; c.lineWidth = 2; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(14 + i * 25, h * 0.855, 5, 0, TAU); c.stroke(); }
  });
  P.add(K.flat("#ffffff", { map: wallTex, rough: 0.35 }), box(B.w, boxH, B.l, 0, y0 + boxH / 2, 0), 0.012);
  // the windows: a gold frame, the -x curtain painted shut; the +x one: the dark opening (its curtain is the parting part)
  for (const s of [-1, 1]) P.add(gold, box(0.03, B.window.h + 0.08, B.window.w + 0.08, s * (B.w / 2 + 0.006), B.window.y, B.window.z), 0.004);
  P.add(K.flat(PC.curtain), box(0.03, B.window.h, B.window.w, -(B.w / 2 + 0.012), B.window.y, B.window.z), 0);
  P.add(K.flat("#2b2630"), box(0.03, B.window.h, B.window.w, B.w / 2 + 0.012, B.window.y, B.window.z), 0);
  // the roof: a low hip from the eaves (just over the body's roof) to a ridge at `top`
  const roof = new THREE.BufferGeometry(), rw = B.w / 2 + 0.22, rl = B.l / 2 + 0.22, ry = B.top - B.roof - 0.04, ridge = B.l / 2 - 0.45, ey = B.roof + 0.04;
  const vs = [[-rw, 0, -rl], [rw, 0, -rl], [rw, 0, rl], [-rw, 0, rl], [0, ry, -ridge], [0, ry, ridge]];
  const tri = [[0, 4, 1], [1, 4, 5], [1, 5, 2], [2, 5, 3], [3, 5, 4], [3, 4, 0], [0, 1, 2], [0, 2, 3]];
  const pos: number[] = []; for (const t of tri) for (const i of t) pos.push(vs[i][0], vs[i][1] + ey, vs[i][2]);
  roof.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); roof.computeVertexNormals();
  P.add(K.flat("#7a3a2e", { rough: 0.6 }), roof, 0.012);
  P.add(lac, box(B.w + 0.08, 0.08, B.l + 0.08, 0, B.roof, 0), 0.008);
  P.add(gold, limb(V(0, ey + ry, -ridge - 0.04), V(0, ey + ry, ridge + 0.04), 0.03, 0.03, 8), 0.006);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(gold, ball(V(sx * rw, ey + 0.06, sz * rl), 0.05, [1, 1, 1], 10), 0.005);
  // the floor beam, the wheels (toward the front), the axle, the shafts, the rack out at the back on two bearers
  P.add(wood, box(B.w + 0.06, 0.12, B.l + 0.06, 0, y0 - 0.05, 0), 0.008);
  for (const s of [-1, 1]) wheel(P, K, RC.wheel.r, s * RC.wheel.track / 2, RC.wheel.dz, { n: 14, t: 0.07 });
  P.add(wood, cylX(0.04, RC.wheel.track, 10).translate(0, RC.wheel.r, RC.wheel.dz), 0.005);
  for (const s of [-1, 1]) P.add(wood, limb(V(s * 0.45, y0 - 0.06, -B.l / 2 + 0.2), V(s * 0.45, 1.0, -B.l / 2 - 1.6), 0.045, 0.035, 8), 0.007);
  P.add(wood, box(B.rack.w, 0.05, B.rack.d, 0, B.rack.y - 0.025, B.rack.z), 0.007);
  for (const s of [-1, 1]) P.add(wood, box(0.06, 0.08, B.rack.d + 0.12, s * (B.rack.w / 2 - 0.08), B.rack.y - 0.09, B.rack.z - 0.06), 0.005);
  P.into(g, "bigCarriage");
  // the +x curtain: two halves that slide apart with open
  const cur = new THREE.Group(); cur.name = "bigCarriage.curtain"; g.add(cur);
  const halves: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const hg = new THREE.Group(); cur.add(hg); halves.push(hg);
    hg.position.set(B.w / 2 + 0.03, B.window.y, B.window.z + (s * B.window.w) / 2);
    const Q = new Part(K);
    Q.add(K.flat(PC.curtain), box(0.024, B.window.h, B.window.w / 2, 0, 0, (-s * B.window.w) / 4), 0.004);
    Q.into(hg, "bigCarriage.curtain");
  }
  // each half is hung from its outer edge: it gathers toward it as the curtain opens
  return (o) => { const k = clamp01(o.open ?? 0); halves.forEach((hg) => { hg.scale.z = 1 - 0.75 * k; }); };
};
/** a basket of salted fish (dried whole fish heaped in a round wicker basket; G05): 0.5 across, 0.34 high with the
 *  heap; put({ on }) = a few flies circling over it (a fixed swarm, seeded; the flies' animation is the shot's: rot) */
export const FISH_BASKET = { r: 0.25, h: 0.34 } as const;
export const fishBasket = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), weave = paint(128, 64, (c, w, h) => { c.fillStyle = PC.basket; c.fillRect(0, 0, w, h); c.strokeStyle = PC.basketLo; c.lineWidth = 3; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 8 + 4, h); c.stroke(); } for (let j = 0; j < 6; j++) c.fillRect(0, j * 11, w, 2); });
  P.add(K.flat("#ffffff", { map: weave, rough: 0.85 }), turned([[0, 0], [0.18, 0], [0.24, 0.12], [0.26, 0.24], [0.27, 0.25], [0, 0.25]], 28), 0.006);
  // the fish: flattened whole fish heaped on top, heads out, in two layers, pale ochre with darker backs
  const fishM = K.flat(PC.saltFish, { rough: 0.6 }), backM = K.flat(PC.saltFishLo, { rough: 0.6 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + hash(i + 3) * 0.3, r = i < 6 ? 0.12 : 0.04, y = 0.27 + (i < 6 ? 0 : 0.045), len = 0.22;
    const m = M4(Math.cos(a) * r, y, Math.sin(a) * r, 0, -a + Math.PI / 2, 0.15);
    P.add(i % 2 ? fishM : backM, ball(V(0, 0, 0), len / 2, [1, 0.18, 0.36], 12), 0.004, m);
    P.add(backM, new THREE.ConeGeometry(0.03, 0.05, 4).rotateZ(-Math.PI / 2).scale(1, 0.4, 1).translate(-len / 2 - 0.015, 0, 0), 0.003, m);
  }
  P.into(g, "fishBasket");
  const flies = new THREE.Group(); flies.name = "fishBasket.flies"; g.add(flies);
  const F = new Part(K);
  for (let i = 0; i < 6; i++) { const a = i * 2.4, r = 0.18 + 0.12 * hash(i + 11); F.add(K.flat("#2b2630"), ball(V(Math.cos(a) * r, 0.5 + 0.18 * hash(i + 21), Math.sin(a) * r), 0.012, [1, 0.8, 1], 6), 0); }
  F.into(flies, "fishBasket.fly");
  return (o) => { flies.visible = !!o.on; };
};
/** the baggage cart of salted fish at the road set's sizes (layout/road.ts ROAD_SET.cart): a bed on two wheels with
 *  low side boards, shafts toward -z, three baskets of fish on it; put({ on }) = the flies. Origin = on the ground
 *  under its middle; faces -z */
const RK = ROAD_SET.cart;
export const fishCart = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), wood = K.flat(PC.wood), woodLo = K.flat(PC.woodLo);
  P.add(wood, box(RK.w, 0.1, RK.len, 0, RK.bed - 0.05, 0), 0.008);
  for (const s of [-1, 1]) P.add(wood, box(0.06, RK.side, RK.len, s * (RK.w / 2 - 0.03), RK.bed + RK.side / 2, 0), 0.006);
  for (const s of [-1, 1]) P.add(wood, box(RK.w, RK.side, 0.06, 0, RK.bed + RK.side / 2, s * (RK.len / 2 - 0.03)), 0.006);
  for (const s of [-1, 1]) wheel(P, K, RK.wheel, s * (RK.w / 2 + 0.1), 0);
  P.add(woodLo, cylX(0.035, RK.w + 0.2, 10).translate(0, RK.wheel, 0), 0.005);
  for (const s of [-1, 1]) P.add(woodLo, limb(V(s * 0.4, RK.bed - 0.08, -RK.len / 2 + 0.2), V(s * 0.4, 0.75, -RK.len / 2 - 1.1), 0.035, 0.03, 8), 0.006);
  P.into(g, "fishCart");
  const hooks: ((o: PutOpts) => void)[] = [];
  for (const z of [-0.62, 0.05, 0.68]) {
    const bg = new THREE.Group(); bg.position.set(0, RK.bed, z); g.add(bg);
    const h = fishBasket(K, bg); if (h) hooks.push((o) => h(o, bg));
  }
  return (o) => hooks.forEach((h) => h(o));
};

// ===================================================================================================== arms
/** a guard's halberd (戟) as a thing of its own: a 2.4 m wooden pole, a bronze spear point and a dagger-axe blade (戈)
 *  out to the side, a red tassel; origin = the grip 0.95 m from the foot, +y = up the pole, the blade toward +x */
export const halberd = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), bronze = K.flat(PC.bronze, { rough: 0.45 });
  P.add(K.flat(PC.wood), cylY(0.016, 2.32, -0.95, 10, 0.015), 0.0045);
  P.add(bronze, cylY(0.02, 0.06, -0.97, 10), 0.004);
  P.add(bronze, prism([[1.36, 0.022, 0.009], [1.5, 0.026, 0.009], [1.66, 0.0008, 0.0008]]), 0.0045);
  P.add(bronze, prism([[0.0, 0.025, 0.008], [0.12, 0.02, 0.007], [0.22, 0.0008, 0.0008]]).rotateZ(-Math.PI / 2 + 0.12).translate(0.012, 1.34, 0), 0.0045);
  P.add(bronze, cylY(0.022, 0.1, 1.28, 10), 0.004);
  P.add(K.flat(PC.lacRed), turned([[0, 1.12], [0.045, 1.14], [0.03, 1.24], [0, 1.23]], 12), 0.004);
  P.into(g, "halberd");
};
/** a bandit's knife (环首刀): 0.62 m, a slightly curved single-edged blade, a wrapped grip, a ring pommel. Origin = the
 *  middle of the grip; +y toward the tip; the edge toward +x */
export const knife = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), steel = K.flat(PC.steelLo, { rough: 0.35 });
  P.add(K.flat(PC.woodLo), cylY(0.014, 0.15, -0.075, 10), 0.004);
  P.add(K.flat(PC.bronzeLo), ringSeg(roundLoop(0.022, 0.034, 0.012, 0.004), 0, TAU, 20).rotateX(Math.PI / 2).translate(0, -0.105, 0), 0.0035);
  P.add(K.flat(PC.bronzeLo), box(0.06, 0.014, 0.03, 0, 0.08, 0), 0.0035);
  const blade = prism([[0.085, 0.022, 0.0065], [0.3, 0.023, 0.006], [0.47, 0.018, 0.005], [0.545, 0.0008, 0.0008]]), bp = blade.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) { const y = bp.getY(i), u = (y - 0.085) / 0.46; bp.setX(i, bp.getX(i) + 0.03 * u * u); }
  blade.computeVertexNormals();
  P.add(steel, blade, 0.0045);
  P.into(g, "knife");
};

// ===================================================================================================== the museum, the corridor
/** a museum railing section: 2.0 m along x, its top rail 1.0 m high, two posts with round caps on heavy feet, a lower
 *  rail; dark metal. Origin = on the floor under its middle */
export const railing = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), m = K.flat(PC.rail, { rough: 0.45 }), hi = K.flat(PC.railHi, { rough: 0.35 });
  P.add(hi, cylX(0.022, 2.0, 12).translate(0, 0.97, 0), 0.005);
  P.add(m, cylX(0.014, 2.0, 10).translate(0, 0.5, 0), 0.004);
  for (const x of [-0.94, 0.94]) {
    P.add(m, cylY(0.024, 0.95, 0.03, 12), 0.005, M4(x, 0, 0));
    P.add(m, turned([[0, 0], [0.11, 0], [0.11, 0.02], [0.05, 0.035], [0, 0.035]], 20), 0.005, M4(x, 0, 0));
    P.add(hi, ball(V(x, 1.0, 0), 0.032), 0.004);
  }
  P.into(g, "railing");
};
/** a hanging paper lantern: 0.34 high, r 0.15, red paper with dark ribs and a gold band, lit from inside (it glows),
 *  black caps, a red tassel; hung from its hook. Origin = the hook at its top */
export const lantern = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), cap = K.flat("#2e2a30");
  P.add(cap, cylY(0.006, 0.06, -0.06, 6), 0.0025);
  P.add(cap, cylY(0.07, 0.035, -0.09, 16, 0.06), 0.003);
  const prof: [number, number][] = [[0.065, -0.38], [0.12, -0.34], [0.15, -0.26], [0.15, -0.2], [0.12, -0.12], [0.065, -0.08]];   // bottom to top: faces out
  const ribs = paint(256, 128, (c, w, h) => { c.fillStyle = "#f2a24e"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8662e"; for (let i = 0; i < 12; i++) c.fillRect((w * i) / 12, 0, 4, h); c.fillStyle = "#f6d07a"; c.fillRect(0, h * 0.44, w, h * 0.12); });
  const glowM = new THREE.MeshBasicMaterial({ color: "#ffffff", map: ribs });
  P.add(glowM, turned(prof, 24, 24), 0.004);
  P.add(cap, cylY(0.06, 0.03, -0.405, 16, 0.07), 0.003);
  P.add(K.flat(PC.lacRed), turned([[0, -0.53], [0.03, -0.52], [0.02, -0.43], [0, -0.41]], 10), 0.003);
  P.into(g, "lantern");
};
