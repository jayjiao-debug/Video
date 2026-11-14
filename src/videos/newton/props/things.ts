// THE PROPS of the Newton film (PLAN 3, 4), built with the kit's prop kit (src/kit/props/kit.ts: Part = merged meshes +
// ONE black hull outline, layer NOINK; paint = mip-mapped canvas textures). Each builder fills a prop's group and may
// return a Hook that put() calls with the put's options; origins, axes and grips are those of props/index.ts PROP_INFO.
// WP3. The kit's rules hold (src/kit/props/README.md): a prop never goes through the ink pass (its hull is its line);
// nothing thinner than 1.2 cm unless it is tiny and seen close (the fly, the wick); parts overlap by a centimetre
// (hidden) or stand apart; small pattern is PAINT; colours between #2b2630 and #f4f1ea; nothing random (seeded hash
// only); nothing changes from frame to frame except what a put() option drives (steam, the fly, the flame, the candle's
// length, the bites, the sack's state, the bellows).
// The FIRST-PERSON things (mic, hand, handR) sit 0.2-0.6 m from her lens: their ink is thin (INK_NEAR) so the line keeps
// the weight of a figure's line on screen.
import * as THREE from "three";
import { V, Part, NOINK, turned, limb, ball, box, paint, hash as kitHash, FONT, type Kit } from "../../../kit/props/kit";
import type { PutOpts } from "./index";

export type Hook = ((o: PutOpts, g: THREE.Group) => void) | void;
const TAU = Math.PI * 2;
/** a fixed pseudo-random number 0..1 of (n, stream k): the kit's hash (never Math.random) */
const hash = (n: number, k = 0) => kitHash(n * 1.37 + k * 17.11);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** the film's prop colours */
export const PC = {
  pewter: "#b7bbc0", pewterLo: "#8f949b", pewterHi: "#d4d7da",
  meat: "#8e5034", meatLo: "#6e3a26", fat: "#e8d6b8", bread: "#d8a463", breadLo: "#b07c40", crumb: "#efdcb0", pea: "#7a9a4a",
  steel: "#d8dce2", steelLo: "#aab2bc", bone: "#e9e1cc",
  feather: "#efe8d8", featherLo: "#d6cdbd", shaft: "#d8c9a8",
  inkBlack: "#2e2b33", paper: "#ece2c4", paperLo: "#d8ccaa", paperEdge: "#cbbd98", script: "#4a4458",
  wood: "#8a6040", woodLo: "#6a4a32", woodHi: "#a87c54", oak: "#7a5638",
  cream: "#efe6cf", creamLo: "#d9ccaa",
  flame: "#f6902a", flameHi: "#ffe08a", flameLo: "#c9541c", glow: "#ffb347",
  linen: "#efebe2", linenLo: "#d6d0c4",
  hessian: "#b39a72", hessianLo: "#8e7652", charcoal: "#3a3638", charcoalHi: "#5a5658",
  iron: "#4a4a52", ironHi: "#6e6e78", clay: "#b07a52", clayLo: "#7e5236", soot: "#4a4040",
  glass: "#bcd8d2", glassLo: "#8fb4ae", glassHi: "#eef4f0", leather: "#7a4a32", leatherLo: "#5a3424", brass: "#c9a24a",
  bookRed: "#8a3a2e", bookGreen: "#4a5e44", bookBrown: "#6e4a30", bookBlue: "#3e4a62", mould: "#8a9a6a",
  fly: "#3a3c48", flyEye: "#a8382e", wing: "#dfe6ee",
  micRed: "#c8322c", micRedLo: "#a02a26", micBlack: "#2e2a27", micRing: "#8a8c94",
  skin: "#f3cfb0", skinLo: "#e2b08e", cuff: "#d39a34", cuffLo: "#a8761f",
} as const;
/** the ink of a first-person thing (mic, hand) 0.2-0.6 m from the lens */
export const INK_NEAR = 0.0016;

// ------------------------------------------------------------------------------------------------- small helpers
/** a closed cylinder along y from y0 up h (r at the bottom, r1 at the top) */
const cylY = (r: number, h: number, y0: number, seg = 16, r1 = r) => new THREE.CylinderGeometry(r1, r, h, seg).translate(0, y0 + h / 2, 0);
/** a mesh of our own on the prop layer (glows, steam, decals) */
const own = <T extends THREE.Mesh>(m: T, name: string, shadow = false): T => { m.name = name; m.layers.set(NOINK); m.castShadow = shadow; m.receiveShadow = false; return m; };
/** an ellipse outline (x, z) with bites taken out of its edge: bites = [angle (rad), radius] circles centred on the edge */
const bitten = (rx: number, rz: number, bites: [number, number][], n = 72): THREE.Vector2[] => {
  const pts: THREE.Vector2[] = [];
  const cs = bites.map(([a, r]) => ({ c: new THREE.Vector2(rx * Math.cos(a), rz * Math.sin(a)), r }));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, u = new THREE.Vector2(Math.cos(a), Math.sin(a));
    let rr = 1 / Math.sqrt((u.x / rx) ** 2 + (u.y / rz) ** 2);
    for (const { c, r } of cs) {
      const b = u.dot(c), d = b * b - c.lengthSq() + r * r;
      if (d >= 0) { const tn = b - Math.sqrt(d); if (tn > 0 && tn < rr) rr = Math.max(tn, 0.004); }
    }
    pts.push(u.multiplyScalar(rr));
  }
  return pts;
};
/** an outline (x, z) extruded up `h` with a soft bevel, lying flat from y0 */
const slab = (pts: THREE.Vector2[], h: number, y0: number, bevel = 0.005) => {
  const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, -p.y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, h - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0 + bevel, 0);
  return g;
};
/** handwriting on a sheet: rows of wavy ink strokes (seeded) */
const scrawl = (c: CanvasRenderingContext2D, w: number, h: number, seed: number, o: { top?: number; rows?: number; col?: string; lw?: number; margin?: number } = {}) => {
  const rows = o.rows ?? 14, top = o.top ?? 0.08, m = o.margin ?? 0.1;
  c.strokeStyle = o.col ?? PC.script; c.lineWidth = o.lw ?? Math.max(1.5, h / 220); c.lineCap = "round";
  for (let r = 0; r < rows; r++) {
    const y = h * (top + (r / rows) * (0.86 - top)), x1 = w * (1 - m - 0.25 * hash(seed + r * 3));
    c.beginPath(); c.moveTo(w * m, y);
    for (let x = w * m; x < x1; x += w * 0.018) c.lineTo(x, y + Math.sin(x * 0.21 + r + seed) * h * 0.004 + (hash(seed + x) - 0.5) * h * 0.005);
    c.stroke();
  }
};
/** a sheet of paper's texture: the paper, a soft darker margin, handwriting */
const paperTex = (seed: number, o: { rows?: number; blank?: boolean } = {}) => paint(256, 360, (c, w, h) => {
  c.fillStyle = PC.paper; c.fillRect(0, 0, w, h);
  c.strokeStyle = PC.paperLo; c.lineWidth = 10; c.strokeRect(0, 0, w, h);
  if (!o.blank) scrawl(c, w, h, seed, { rows: o.rows ?? 16 });
});
/** page edges seen from the side: thin lines along the stack */
const edgeTex = (seed: number) => paint(128, 64, (c, w, h) => {
  c.fillStyle = PC.paper; c.fillRect(0, 0, w, h);
  c.strokeStyle = PC.paperEdge; c.lineWidth = 1.4;
  for (let y = 2; y < h; y += 3 + 2 * hash(seed + y)) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + (hash(seed + y * 7) - 0.5) * 2); c.stroke(); }
});

// ===================================================================================================== the dinner
/** the pewter dinner plate (a 17th-century charger) and its food, the cover, the steam, the fly */
export const PLATE = { r: 0.13, rim: 0.034, h: 0.022, meatTop: 0.039, lidR: 0.122, lidH: 0.085 } as const;
/** where the fly walks: a loop over the rim, the meat and the bread (x, y, z on the plate) */
const FLY_PATH: [number, number, number][] = [
  [-0.108, 0.0215, 0.035], [-0.088, 0.017, 0.016], [-0.064, PLATE.meatTop, 0.0], [-0.03, PLATE.meatTop + 0.001, -0.01], [0.0, PLATE.meatTop, -0.026],
  [0.022, 0.03, -0.06], [0.03, 0.0215, -0.1], [-0.02, 0.0215, -0.112], [-0.075, 0.0215, -0.085], [-0.112, 0.0215, -0.03], [-0.108, 0.0215, 0.035],
];
export const flyAt = (u: number) => {
  const n = FLY_PATH.length - 1, x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), k = x - i, a = FLY_PATH[i], b = FLY_PATH[Math.min(n, i + 1)];
  return { p: V(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)), yaw: Math.atan2(b[0] - a[0], b[2] - a[2]) };
};
/** the fly: 1.6 cm long (a cartoon housefly), +z = its head; legs walk with t */
const buildFly = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), body = K.flat(PC.fly, { rough: 0.4 }), eye = K.flat(PC.flyEye, { rough: 0.4 }), ink = 0.0011;
  P.add(body, ball(V(0, 0.006, -0.002), 0.0065, [0.85, 0.75, 1.25], 14), ink);
  P.add(body, ball(V(0, 0.0065, 0.0075), 0.0045, [1, 0.9, 0.9], 12), ink);
  for (const s of [-1, 1]) P.add(eye, ball(V(s * 0.0032, 0.0075, 0.0095), 0.0028, [1, 1, 1], 10), ink);
  P.into(g, "plate.fly");
  const wingM = new THREE.MeshBasicMaterial({ color: PC.wing, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide });
  const wings: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const w = own(new THREE.Mesh(new THREE.CircleGeometry(0.0068, 14).scale(0.55, 1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.006), wingM), "plate.fly.wing");
    w.position.set(s * 0.0035, 0.0115, 0.0); w.rotation.y = s * 0.45; g.add(w); wings.push(w);
  }
  const legM = K.flat(PC.fly), legs: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1, z = (Math.floor(i / 2) - 1) * 0.0045;
    const m = own(new THREE.Mesh(limb(V(0, 0, 0), V(s * 0.0075, -0.0055, 0.002), 0.0008, 0.0006, 5), legM), "plate.fly.leg");
    m.position.set(s * 0.002, 0.005, z); g.add(m); legs.push(m);
  }
  return (t: number) => {
    for (let i = 0; i < 6; i++) { const ph = (i % 2) ^ (Math.floor(i / 2) % 2) ? 0 : Math.PI; legs[i].rotation.set(0.5 * Math.sin(t * 22 + ph), 0, 0); }
    for (let i = 0; i < 2; i++) wings[i].rotation.z = (i ? 1 : -1) * 0.08 * Math.sin(t * 5);
  };
};
/** THE DINNER: a pewter plate with a mutton chop, a bread roll and a few peas; put({ bites }) 0..3 bites out of the
 *  chop, { lid } 0..1 (0 = off, 1 = the domed cover on it; between = lifted that far toward the viewer side, tilted),
 *  { steam } 0..1 (three wisps rising, with t), { fly } 0..1 = the fly's place along its walk (undefined = no fly) */
export const plate = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), pew = K.flat(PC.pewter, { rough: 0.38 }), pewLo = K.flat(PC.pewterLo, { rough: 0.45 });
  // the plate: a shallow well and a broad flat rim (a turned profile from the foot up the outside, back over the top)
  P.add(pew, turned([[0, 0], [PLATE.r - PLATE.rim - 0.01, 0], [PLATE.r - PLATE.rim, 0.008], [PLATE.r - 0.004, 0.016], [PLATE.r, 0.02], [PLATE.r - 0.006, PLATE.h], [PLATE.r - PLATE.rim, PLATE.h - 0.004], [PLATE.r - PLATE.rim - 0.008, 0.012], [0, 0.011]], 48), 0.004);
  P.add(pewLo, new THREE.TorusGeometry(PLATE.r - PLATE.rim + 0.002, 0.0022, 6, 48).rotateX(Math.PI / 2).translate(0, PLATE.h - 0.004, 0), 0);
  // the bread roll and the peas
  P.add(K.flat(PC.bread), ball(V(0.055, 0.03, 0.035), 0.036, [1, 0.62, 0.86], 18), 0.004);
  P.add(K.flat(PC.breadLo), ball(V(0.058, 0.044, 0.035), 0.012, [2.0, 0.3, 0.35], 10), 0);
  const pea = K.flat(PC.pea);
  for (let i = 0; i < 6; i++) P.add(pea, ball(V(-0.045 + 0.012 * (i % 3) + 0.004 * hash(i), 0.018, 0.058 + 0.011 * Math.floor(i / 3)), 0.0075, [1, 1, 1], 8), 0.0022);
  P.into(g, "plate");
  // the chop: one per bite count (0..3), only one shows
  const BITES: [number, number][] = [[0.5, 0.022], [-0.1, 0.02], [1.1, 0.018]];
  const chops: THREE.Group[] = [];
  for (let n = 0; n <= 3; n++) {
    const cg = new THREE.Group(); cg.name = `plate.chop${n}`; g.add(cg);
    const Q = new Part(K), out = bitten(0.062, 0.042, BITES.slice(0, n));
    Q.add(K.flat(PC.meat), slab(out, 0.026, 0.012, 0.006).translate(-0.028, 0, -0.018), 0.004);
    // the fat along one edge and the browned top
    Q.add(K.flat(PC.fat), slab(bitten(0.03, 0.012, []), 0.012, 0.03, 0.004).translate(-0.06, 0, -0.04), 0);
    Q.into(cg, `plate.chop${n}`);
    chops.push(cg);
  }
  // the cover (lid), a domed pewter cover with a knob
  const lid = new THREE.Group(); lid.name = "plate.lid"; g.add(lid);
  new Part(K).add(pew, turned([[PLATE.lidR, 0], [PLATE.lidR, 0.012], [PLATE.lidR * 0.92, 0.045], [PLATE.lidR * 0.6, 0.075], [0.02, PLATE.lidH - 0.004], [0.012, PLATE.lidH], [0.018, PLATE.lidH + 0.012], [0.014, PLATE.lidH + 0.024], [0, PLATE.lidH + 0.026]], 40), 0.004).into(lid, "plate.lid");
  // the steam: three soft wisps (no hull; the checker skips "steam")
  const wisps: { m: THREE.Mesh; mat: THREE.MeshBasicMaterial; ph: number; x: number; z: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const pts = Array.from({ length: 7 }, (_, k) => V(Math.sin(k * 1.3 + i * 2) * 0.012, k * 0.022, Math.cos(k * 1.1 + i) * 0.008));
    const mat = new THREE.MeshBasicMaterial({ color: "#f4f1ea", transparent: true, opacity: 0, depthWrite: false });
    const m = own(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0055, 6), mat), "plate.steam");
    g.add(m); wisps.push({ m, mat, ph: i / 3, x: -0.03 + 0.035 * i, z: -0.01 + 0.02 * (i % 2) });
  }
  const flyG = new THREE.Group(); flyG.name = "plate.flyG"; g.add(flyG);
  const flyLegs = buildFly(K, flyG);
  return (o) => {
    const t = o.t ?? 0, bites = Math.max(0, Math.min(3, Math.round(o.bites ?? 0)));
    chops.forEach((c, i) => { c.visible = i === bites; });
    const k = clamp01(o.lid ?? 0);
    lid.visible = k > 0;
    // lifted: up and toward +z (the side the person lifting it stands on is the shot's choice: rot the plate), tilted
    lid.position.set(0, PLATE.h - 0.004 + 0.16 * (1 - k), 0.06 * (1 - k)); lid.rotation.set(-0.9 * (1 - k), 0, 0);
    const st = clamp01(o.steam ?? 0);
    for (const w of wisps) {
      const ph = (t / 2.6 + w.ph) % 1;
      w.m.visible = st > 0 && k < 1;
      w.m.position.set(w.x + 0.006 * Math.sin(t * 1.7 + w.ph * 6), PLATE.meatTop + 0.01 + 0.06 * ph, w.z);
      w.m.scale.set(1 + 0.6 * ph, 0.8 + 0.5 * ph, 1 + 0.6 * ph);
      w.mat.opacity = 0.42 * st * Math.sin(Math.PI * ph);
    }
    const fly = o.fly;
    flyG.visible = fly !== undefined && fly >= 0;
    if (flyG.visible) { const F = flyAt(fly!); flyG.position.copy(F.p); flyG.rotation.set(0, F.yaw, 0); flyLegs(t); }
  };
};
/** the cover on its own (Humphrey lifts it): the domed pewter cover; origin = the middle of its rim, grip knob */
export const lid = (K: Kit, g: THREE.Group) => {
  new Part(K).add(K.flat(PC.pewter, { rough: 0.38 }), turned([[PLATE.lidR, 0], [PLATE.lidR, 0.012], [PLATE.lidR * 0.92, 0.045], [PLATE.lidR * 0.6, 0.075], [0.02, PLATE.lidH - 0.004], [0.012, PLATE.lidH], [0.018, PLATE.lidH + 0.012], [0.014, PLATE.lidH + 0.024], [0, PLATE.lidH + 0.026]], 40), 0.004).into(g, "lid");
};
/** a two-tined steel fork with a bone handle: 0.18 m; origin = the middle of the handle, +y toward the tines */
export const fork = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), st = K.flat(PC.steel, { rough: 0.3 });
  P.add(K.flat(PC.bone), limb(V(0, -0.045, 0), V(0, 0.04, 0), 0.0075, 0.0065, 10), 0.0025);
  P.add(st, limb(V(0, 0.038, 0), V(0, 0.075, 0), 0.0035, 0.004, 8), 0.0022);
  for (const s of [-1, 1]) P.add(st, limb(V(s * 0.005, 0.072, 0), V(s * 0.006, 0.13, 0.002), 0.0024, 0.0017, 6), 0.0018);
  P.into(g, "fork");
};
/** a table knife with a bone handle: 0.2 m; origin = the middle of the handle, +y toward the blade's tip */
export const knife = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.bone), limb(V(0, -0.045, 0), V(0, 0.04, 0), 0.0078, 0.0068, 10), 0.0025);
  P.add(K.flat(PC.steel, { rough: 0.3 }), box(0.016, 0.11, 0.004, 0.002, 0.095, 0), 0.002);
  P.into(g, "knife");
};

// ===================================================================================================== writing
/** a goose quill: origin = where the fingers hold it, +y up the feather: the nib at y QUILL.nib, the vane to QUILL.top */
export const QUILL = { nib: -0.05, top: 0.24 } as const;
export const quill = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  const vane = paint(64, 256, (c, w, h) => {
    c.fillStyle = PC.feather; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.featherLo; c.fillRect(w / 2 - 3, 0, 6, h);
    c.strokeStyle = PC.featherLo; c.lineWidth = 2;
    for (let y = 16; y < h; y += 14) { c.beginPath(); c.moveTo(w / 2, y); c.lineTo(4, y - 12); c.moveTo(w / 2, y); c.lineTo(w - 4, y - 12); c.stroke(); }
  });
  // the vane: a flat leaf (a squashed turned shape) from y 0.02 to the top, curving a little
  const v = turned([[0, 0.02], [0.012, 0.05], [0.017, 0.12], [0.014, 0.19], [0.006, QUILL.top - 0.005], [0, QUILL.top]], 14).scale(1, 1, 0.3);
  v.rotateZ(-0.06);
  P.add(K.flat("#ffffff", { map: vane }), v, 0.0022);
  P.add(K.flat(PC.shaft), limb(V(0, QUILL.nib, 0), V(0, 0.05, 0), 0.0028, 0.0042, 8), 0.0018);
  P.add(K.flat(PC.inkBlack), limb(V(0, QUILL.nib, 0), V(0, QUILL.nib + 0.012, 0), 0.0016, 0.0028, 6), 0.0012);
  P.into(g, "quill");
};
/** the inkwell: a squat pewter well with black ink in its mouth; origin = on the desk under its middle */
export const inkwell = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.pewterLo, { rough: 0.45 }), turned([[0, 0], [0.045, 0], [0.047, 0.006], [0.04, 0.03], [0.022, 0.038], [0.02, 0.046], [0.014, 0.046], [0.014, 0.04], [0, 0.04]], 28), 0.003);
  P.add(K.flat(PC.inkBlack, { rough: 0.2 }), cylY(0.0135, 0.004, 0.039, 16), 0);
  P.into(g, "inkwell");
};
/** Humphrey's ink bottle (empty): brown stoneware, a short neck, a cork; origin = under its middle, grip grip = its body */
export const INK_BOTTLE = { h: 0.13, grip: 0.055 } as const;
export const inkBottle = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat("#7a5a3c", { rough: 0.35 }), turned([[0, 0], [0.03, 0], [0.034, 0.012], [0.034, 0.07], [0.028, 0.09], [0.013, 0.1], [0.012, 0.115], [0, 0.115]], 24), 0.003);
  P.add(K.flat("#c9a878"), cylY(0.011, 0.018, 0.112, 12, 0.012), 0.0025);
  P.into(g, "inkBottle");
};
/** loose sheets: `n` (1..6, default 3) written sheets fanned on the desk; origin = on the desk under the middle */
export const SHEET = { w: 0.2, d: 0.29 } as const;
export const sheets = (K: Kit, g: THREE.Group): Hook => {
  const subs: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const sg = new THREE.Group(); sg.name = `sheets.${i}`; g.add(sg);
    new Part(K).add(K.flat("#ffffff", { map: paperTex(40 + i) }), box(SHEET.w, 0.004, SHEET.d, 0, 0.002, 0), 0.0018).into(sg, "sheets");
    sg.position.set(0.05 * (hash(i, 3) - 0.5) + 0.03 * i, 0.0045 * i, 0.04 * (hash(i, 5) - 0.5));
    sg.rotation.y = 0.5 * (hash(i, 7) - 0.5);
    subs.push(sg);
  }
  return (o) => { const n = Math.max(1, Math.min(6, Math.round(o.n ?? 3))); subs.forEach((s, i) => { s.visible = i < n; }); };
};
/** THE DRAFTS: the stack of written drafts a hand's breadth thick (0.09 m), a little ragged; origin = on the desk under
 *  its middle; the top sheet is written */
export const DRAFTS = { w: 0.21, d: 0.3, h: 0.09 } as const;
export const drafts = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), side = K.flat("#ffffff", { map: edgeTex(5) }), top = K.flat("#ffffff", { map: paperTex(77) });
  let y = 0;
  for (let i = 0; i < 4; i++) {
    const h = [0.024, 0.021, 0.026, 0.019][i], dx = 0.008 * (hash(i, 9) - 0.5), dz = 0.01 * (hash(i, 11) - 0.5), ry = 0.05 * (hash(i, 13) - 0.5);
    const geo = box(DRAFTS.w, h, DRAFTS.d, 0, h / 2, 0).rotateY(ry).translate(dx, y, dz);
    // the box's faces: sides show the page edges, the top (the last block only) the written page
    const mats = i === 3 ? top : side;
    P.add(mats, geo, 0.0025);
    y += h;
  }
  P.into(g, "drafts");
};
/** the sheaf of lecture notes: about 40 sheets (0.022 m) folded once along y, a red tape round it; origin = its middle,
 *  grip grip = its edge (x +0.1: under his arm or in one hand) */
export const NOTES = { w: 0.2, d: 0.3, h: 0.022 } as const;
export const notes = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  const top = K.flat("#ffffff", { map: paperTex(91, { rows: 12 }) });
  P.add(top, box(NOTES.w, NOTES.h, NOTES.d, 0, 0, 0), 0.0028);
  P.add(K.flat("#a8382e"), box(0.03, NOTES.h + 0.004, NOTES.d + 0.004, -0.04, 0, 0), 0);
  P.into(g, "notes");
};
/** books: `n` (1..4, default 3) closed leather books stacked a little askew; origin = under the stack's middle */
export const BOOK = { w: 0.17, d: 0.24, h: 0.045 } as const;
export const books = (K: Kit, g: THREE.Group): Hook => {
  const cols = [PC.bookBrown, PC.bookRed, PC.bookGreen, PC.bookBlue], subs: THREE.Group[] = [];
  let y = 0;
  for (let i = 0; i < 4; i++) {
    const sg = new THREE.Group(); sg.name = `books.${i}`; g.add(sg);
    const h = BOOK.h * (0.8 + 0.4 * hash(i, 17)), P = new Part(K), cov = K.flat(cols[i], { rough: 0.6 });
    P.add(cov, box(BOOK.w, h, BOOK.d, 0, h / 2, 0), 0.003);
    P.add(K.flat(PC.paper), box(BOOK.w - 0.012, h - 0.012, 0.012, 0.004, h / 2, BOOK.d / 2 - 0.003), 0);   // the page block's edge
    P.into(sg, "books");
    sg.position.set(0.012 * (hash(i, 19) - 0.5), y, 0.014 * (hash(i, 23) - 0.5)); sg.rotation.y = 0.35 * (hash(i, 29) - 0.5);
    y += h; subs.push(sg);
  }
  return (o) => { const n = Math.max(1, Math.min(4, Math.round(o.n ?? 3))); subs.forEach((s, i) => { s.visible = i < n; }); };
};
/** THE MOULDY OLD BOOK, open: two page blocks with written columns, a cracked brown cover, green-grey mould spots;
 *  0.34 x 0.24 open; origin = on the bench under its spine */
export const OLD_BOOK = { w: 0.34, d: 0.24 } as const;
export const oldBook = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.leatherLo, { rough: 0.8 }), box(OLD_BOOK.w + 0.02, 0.012, OLD_BOOK.d + 0.016, 0, 0.006, 0), 0.003);
  const page = (seed: number) => paint(256, 360, (c, w, h) => {
    c.fillStyle = "#e4d6b0"; c.fillRect(0, 0, w, h);
    scrawl(c, w, h, seed, { rows: 18, col: "#5a4a3a" });
    for (let i = 0; i < 14; i++) { const r = 4 + 14 * hash(seed + i, 3); c.fillStyle = `rgba(110,130,80,${0.25 + 0.3 * hash(seed + i, 5)})`; c.beginPath(); c.arc(w * hash(seed + i, 7), h * hash(seed + i, 11), r, 0, TAU); c.fill(); }
    c.fillStyle = "rgba(120,90,50,0.25)"; c.fillRect(0, 0, w, 24); c.fillRect(0, h - 30, w, 30);
  });
  for (const s of [-1, 1]) {
    // each page block slopes up toward the spine (a book lying open)
    const geo = box(OLD_BOOK.w / 2 - 0.008, 0.022, OLD_BOOK.d - 0.012, s * (OLD_BOOK.w / 4), 0.023, 0).rotateZ(-s * 0.06);
    P.add(K.flat("#ffffff", { map: page(s > 0 ? 13 : 31) }), geo, 0.0025);
  }
  P.into(g, "oldBook");
};

// ===================================================================================================== light
/** THE CANDLE in a pewter chamberstick (a saucer with a ring handle): origin = under the saucer's middle; grip grip =
 *  the ring handle (+x); put({ len }) 0..1 (0 = a stub 2.5 cm, 1 = a new candle 20 cm), { lit } (default true: the
 *  flame, which flickers with t) */
export const CANDLE = { saucer: 0.065, socket: 0.03, min: 0.025, max: 0.2, handle: 0.085 } as const;
/** the flame's world point for a candlestick put at `at` (no rot) with length len */
export const candleTop = (len: number) => CANDLE.socket + 0.004 + lerp(CANDLE.min, CANDLE.max, clamp01(len));
export const candle = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), pew = K.flat(PC.pewter, { rough: 0.38 });
  P.add(pew, turned([[0, 0], [CANDLE.saucer - 0.004, 0], [CANDLE.saucer, 0.006], [CANDLE.saucer - 0.002, 0.016], [CANDLE.saucer - 0.008, 0.012], [0.02, 0.01], [0.019, CANDLE.socket], [0.017, CANDLE.socket + 0.004], [0, CANDLE.socket + 0.004]], 32), 0.0035);
  P.add(pew, new THREE.TorusGeometry(0.016, 0.0055, 8, 18).translate(CANDLE.handle - 0.016, 0.012, 0), 0.003);
  P.into(g, "candle");
  // the candle (unit height, scaled to its length) and its wick + flame group (moved to its top)
  const cg = new THREE.Group(); cg.name = "candle.wax"; cg.position.y = CANDLE.socket; g.add(cg);
  const wax = paint(32, 128, (c, w, h) => { c.fillStyle = PC.cream; c.fillRect(0, 0, w, h); c.fillStyle = PC.creamLo; for (let i = 0; i < 4; i++) c.fillRect(i * 8 + 2, 0, 3, 18 + 30 * hash(i, 3)); });
  new Part(K).add(K.flat("#ffffff", { map: wax }), cylY(0.0115, 1, 0, 16, 0.0108), 0.003).into(cg, "candle.wax");
  const top = new THREE.Group(); top.name = "candle.top"; g.add(top);
  new Part(K).add(K.flat(PC.inkBlack), limb(V(0, -0.002, 0), V(0.0008, 0.009, 0), 0.0012, 0.001, 5), 0).into(top, "candle.wick");
  const fl = new THREE.Group(); fl.name = "candle.flame"; fl.position.y = 0.006; top.add(fl);
  const tex = paint(8, 64, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#ffd27a"); gr.addColorStop(0.15, PC.flameHi); gr.addColorStop(0.7, PC.flameHi); gr.addColorStop(1, PC.flame); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  new Part(K).add(new THREE.MeshBasicMaterial({ map: tex }), turned([[0, 0], [0.0055, 0.006], [0.0072, 0.014], [0.005, 0.026], [0.0018, 0.036], [0, 0.04]], 12, 14), 0.0016, undefined, K.hullOf(PC.flameLo)).into(fl, "candle.flame", { cast: false, receive: false });
  return (o) => {
    const t = o.t ?? 0, L = lerp(CANDLE.min, CANDLE.max, clamp01(o.len ?? 1));
    cg.scale.set(1, L, 1);
    top.position.y = CANDLE.socket + L;
    fl.visible = o.lit !== false;
    // the flame: a deterministic flicker (sums of sines of t) in height and a small sway; always upright
    fl.scale.set(1 + 0.05 * Math.sin(t * 13.1), 1 + 0.1 * Math.sin(t * 9.7) + 0.06 * Math.sin(t * 23.3 + 1.3), 1 + 0.05 * Math.sin(t * 13.1));
    fl.rotation.set(0.07 * Math.sin(t * 5.3), 0, 0.07 * Math.sin(t * 6.1 + 0.7));
  };
};

// ===================================================================================================== furniture
/** a plain wooden chair (rush-less: a board seat, four square legs, two back posts with a top rail and a middle rail):
 *  seat 0.42 x 0.4 at 0.45 m, back to 0.95 m; origin = on the floor under the seat's middle; the sitter faces +z (the
 *  back is at -z); grip rail = the top rail's middle (where her hand drags it) */
export const CHAIR = { seat: 0.45, w: 0.42, d: 0.4, back: 0.95, rail: [0, 0.92, -0.185] as [number, number, number] } as const;
export const chair = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.oak, { rough: 0.6 }), lo = K.flat(PC.woodLo, { rough: 0.6 }), hx = CHAIR.w / 2 - 0.025, hz = CHAIR.d / 2 - 0.025;
  P.add(w, box(CHAIR.w, 0.035, CHAIR.d, 0, CHAIR.seat - 0.0175, 0), 0.004);
  for (const sx of [-1, 1]) {
    P.add(lo, box(0.034, CHAIR.seat - 0.035, 0.034, sx * hx, (CHAIR.seat - 0.035) / 2, hz), 0.004);                 // front legs
    P.add(lo, box(0.036, CHAIR.back, 0.036, sx * hx, CHAIR.back / 2, -hz).rotateX(0).translate(0, 0, 0), 0.004);      // back posts
    P.add(lo, box(0.024, 0.024, CHAIR.d - 0.05, sx * hx, 0.14, 0), 0.0035);                                            // side stretchers
  }
  P.add(w, box(CHAIR.w - 0.02, 0.07, 0.03, 0, CHAIR.rail[1], CHAIR.rail[2]), 0.004);                                  // the top rail
  P.add(w, box(CHAIR.w - 0.04, 0.05, 0.026, 0, 0.68, CHAIR.rail[2]), 0.0035);                                         // the middle rail
  P.add(lo, box(CHAIR.w - 0.05, 0.024, 0.024, 0, 0.16, hz), 0.0035);                                                  // front stretcher
  P.into(g, "chair");
};
/** a three-legged stool: a round seat r 0.16 at 0.42 m, splayed legs; origin = on the floor under the seat's middle */
export const STOOL = { seat: 0.42, r: 0.16 } as const;
export const stool = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.wood, { rough: 0.6 });
  P.add(w, cylY(STOOL.r, 0.04, STOOL.seat - 0.04, 28, STOOL.r - 0.006), 0.004);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.5; P.add(K.flat(PC.woodLo), limb(V(Math.sin(a) * 0.08, STOOL.seat - 0.03, Math.cos(a) * 0.08), V(Math.sin(a) * 0.16, 0.0, Math.cos(a) * 0.16), 0.017, 0.015, 8), 0.0035); }
  P.into(g, "stool");
};

// ===================================================================================================== the elaboratory
/** a white linen handkerchief, crumpled in a wad with two corners hanging (big enough to read in her fist at arm's
 *  length): origin = the pinch (the top of the wad), grip pinch (the origin); the long corner hangs down -y (a little
 *  toward +z), the short one off to +x */
export const handkerchief = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), lin = K.flat(PC.linen, { rough: 0.85 }), lo = K.flat(PC.linenLo, { rough: 0.85 });
  const wad = new THREE.Group(); wad.name = "handkerchief.wad"; g.add(wad);
  P.add(lin, ball(V(0, -0.014, 0), 0.032, [1.15, 0.9, 1.0], 14), 0.0022);
  P.add(lo, ball(V(0.016, -0.004, 0.016), 0.017, [1, 0.8, 1], 10), 0.0018);
  P.add(lin, ball(V(-0.018, -0.02, 0.012), 0.016, [1, 0.85, 1], 10), 0.0018);
  // the long corner: a flattened cone hanging from the wad (wide at the top, to a point), swinging a little forward
  P.add(lin, turned([[0, -0.16], [0.01, -0.14], [0.026, -0.1], [0.038, -0.06], [0.036, -0.03], [0, -0.016]], 12).scale(1, 1, 0.28).rotateZ(0.12).rotateX(-0.18), 0.002);
  // the short corner off to the side
  P.add(lo, turned([[0, -0.085], [0.014, -0.06], [0.022, -0.035], [0, -0.012]], 10).scale(1, 1, 0.3).rotateZ(1.0).translate(0.012, 0, 0.004), 0.0018);
  P.into(wad, "handkerchief");
  // THE PAD (put({ pad: true }): HankyOpts): the same cloth crumpled into a small pad in an INVISIBLE hand (D's wipe:
  // the owner's "invisible hand, like the Qin film"). Origin = the middle of its pressing face; +z = the way it presses
  // (into what it wipes), -z = its back (toward the lens); +y up. A crumpled white pad with three cloth points round
  // its rim, the biggest at its lower -x side (with +z away from the lens, -x is SCREEN RIGHT: where the hand would
  // be), and a short corner hanging from there (flap rad swings it about z: + = toward +x). Its white is lifted a
  // little (emissive) so it reads as white linen next to his bleached toon face, never as a grey part of it.
  const pad = new THREE.Group(); pad.name = "handkerchief.pad"; g.add(pad);
  const white = (K.flat("#f4f1ea", { rough: 0.85 }) as THREE.MeshPhysicalMaterial).clone(); white.emissive.set("#aca79e");
  const fold = (K.flat(PC.linen, { rough: 0.85 }) as THREE.MeshPhysicalMaterial).clone(); fold.emissive.set("#78746c");
  /** a ball crumpled: every vertex pushed in or out by a few crossed ripples (fixed: no randomness) */
  const crumple = (geo: THREE.BufferGeometry, amt: number, seed: number) => {
    const P = geo.getAttribute("position") as THREE.BufferAttribute, c = new THREE.Vector3();
    geo.computeBoundingBox(); geo.boundingBox!.getCenter(c);
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i) - c.x, y = P.getY(i) - c.y, z = P.getZ(i) - c.z, r = Math.hypot(x, y, z) || 1, u = x / r, v = y / r, w = z / r;
      const k = 1 + amt * (0.55 * Math.sin(6 * u + 2.1 * seed) * Math.sin(5 * v + 1.3) + 0.3 * Math.sin(9 * v + 4 * w + seed) + 0.15 * Math.sin(13 * u - 7 * v + 2 * seed));
      P.setXYZ(i, c.x + x * k, c.y + y * k, c.z + z * k);
    }
    P.needsUpdate = true; geo.computeVertexNormals();
    return geo;
  };
  /** a flattened cloth point: from `at`, `len` long toward `dir`, `w` wide at its root, flattened across `flat` */
  const corner = (at: THREE.Vector3, dir: THREE.Vector3, len: number, w: number, flat = 0.32, twist = 0) => {
    const geo = turned([[0, -len], [w * 0.35, -len * 0.82], [w * 0.8, -len * 0.5], [w, -len * 0.2], [w * 0.7, -len * 0.04], [0, 0]], 10).scale(1, 1, flat).rotateY(twist);
    return geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), dir.clone().normalize())).translate(at.x, at.y, at.z);
  };
  const Q = new Part(K);
  Q.add(white, crumple(ball(V(0, 0, -0.015), 0.032, [1.0, 0.86, 0.5], 18), 0.13, 1), 0.002);          // the pressed pad
  Q.add(fold, crumple(ball(V(0.012, 0.01, -0.026), 0.013, [1.1, 0.8, 0.6], 10), 0.15, 2), 0.0015);    // crumples on its back
  Q.add(white, crumple(ball(V(-0.01, -0.007, -0.028), 0.014, [1.15, 0.85, 0.6], 10), 0.15, 3), 0.0015);
  Q.add(white, corner(V(-0.024, -0.017, -0.02), V(-0.8, -0.55, -0.22), 0.03, 0.012, 0.32, 0.25), 0.0015);   // the points
  Q.add(fold, corner(V(-0.027, 0.012, -0.02), V(-0.95, 0.3, -0.18), 0.021, 0.009, 0.32, -0.3), 0.0015);
  Q.add(white, corner(V(0.026, 0.004, -0.02), V(0.95, -0.25, -0.2), 0.017, 0.008, 0.32, 0.3), 0.0015);
  Q.into(pad, "handkerchief");
  const flapG = new THREE.Group(); flapG.name = "handkerchief.flap"; flapG.position.set(-0.02, -0.022, -0.022); pad.add(flapG);
  const Fp = new Part(K);
  Fp.add(white, corner(V(0, 0, 0), V(-0.35, -1, -0.15), 0.04, 0.013, 0.3, 0.2), 0.0016);
  Fp.into(flapG, "handkerchief");
  return (o) => { const q = o as HankyOpts; wad.visible = !q.pad; pad.visible = !!q.pad; flapG.rotation.set(0, 0, q.flap ?? 0); };
};
/** the handkerchief's own put options (pass a HankyOpts variable to put): pad = the crumpled pad of an invisible hand
 *  (default: the wad with its long corner); flap = the pad's hanging corner swung (rad about its z, + toward +x) */
export type HankyOpts = PutOpts & { pad?: boolean; flap?: number };
/** THE SACK (hessian): put({ full }) 0 = empty (a limp folded sack lying flat), 1 = full of charcoal, its neck gathered
 *  with a cord and lumps at the mouth; { slump: true } = the full sack dropped, slumped on its side with a few lumps
 *  spilled toward +z. Origin = on the floor under its middle; grip neck = the gathered neck of the full sack */
export const SACK = { h: 0.52, r: 0.2, neck: [0, 0.5, 0] as [number, number, number] } as const;
/** a lathe made lumpy (a sack of charcoal, not a vase): every vertex pushed in or out round the axis by a few
 *  ripples of angle and height; above `frill` (the gathered mouth) the cloth ruffles in folds */
const lumpy = (geo: THREE.BufferGeometry, frill = 99, seed = 0) => {
  const P = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const a = Math.atan2(z, x);
    let k = 1 + 0.075 * Math.sin(3 * a + 1.3 + seed + y * 7) + 0.05 * Math.sin(5 * a + seed * 2 + y * 13) + 0.028 * Math.sin(8 * a + y * 21);
    if (y > frill) k *= 1 + 0.28 * Math.sin(9 * a + seed);
    P.setX(i, x * k); P.setZ(i, z * k);
  }
  P.needsUpdate = true; geo.computeVertexNormals();
  return geo;
};
export const sack = (K: Kit, g: THREE.Group): Hook => {
  const weave = paint(128, 128, (c, w, h) => { c.fillStyle = PC.hessian; c.fillRect(0, 0, w, h); c.strokeStyle = PC.hessianLo; c.lineWidth = 1; for (let i = 0; i < w; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, true);
  weave.repeat.set(3, 3);
  const hes = K.flat("#ffffff", { map: weave, rough: 0.95 }), coal = K.flat(PC.charcoal, { rough: 0.9 }), cord = K.flat("#c9b088");
  const full = new THREE.Group(); full.name = "sack.full"; g.add(full);
  const F = new Part(K);
  F.add(hes, lumpy(turned([[0, 0], [0.17, 0.0], [0.215, 0.04], [0.226, 0.14], [0.212, 0.27], [0.19, 0.36], [0.14, 0.43], [0.062, 0.468], [0.046, 0.49], [0.068, 0.525], [0.084, 0.552], [0, 0.545]], 36, 22), 0.47), 0.005);
  F.add(cord, new THREE.TorusGeometry(0.05, 0.0065, 6, 18).rotateX(Math.PI / 2).translate(0, 0.47, 0), 0.003);
  for (let i = 0; i < 4; i++) F.add(coal, ball(V(0.03 * Math.cos(i * 1.7), 0.53, 0.03 * Math.sin(i * 1.7)), 0.018, [1, 0.8, 1.1], 7), 0.003);
  F.into(full, "sack.full");
  const slumped = new THREE.Group(); slumped.name = "sack.slump"; g.add(slumped);
  const S = new Part(K);
  S.add(hes, lumpy(turned([[0, 0], [0.16, 0.0], [0.2, 0.05], [0.218, 0.18], [0.205, 0.32], [0.16, 0.41], [0.115, 0.47], [0.105, 0.5], [0, 0.5]], 36, 18), 0.46, 3).scale(1.08, 1, 0.8).rotateX(Math.PI / 2 - 0.1).scale(1, 0.78, 1).translate(0, 0.135, -0.22), 0.005);
  for (let i = 0; i < 7; i++) S.add(coal, ball(V(0.12 * (hash(i, 3) - 0.5), 0.02, 0.3 + 0.14 * hash(i, 5)), 0.02 + 0.008 * hash(i, 7), [1, 0.7, 1.2], 7), 0.003);
  S.into(slumped, "sack.slump");
  const empty = new THREE.Group(); empty.name = "sack.empty"; g.add(empty);
  const E = new Part(K);
  E.add(hes, box(0.34, 0.03, 0.5, 0, 0.015, 0).rotateY(0.1), 0.004);
  E.add(hes, box(0.3, 0.025, 0.2, 0.01, 0.042, -0.13).rotateY(0.14), 0.0035);
  E.into(empty, "sack.empty");
  return (o) => { const isFull = (o.full ?? 1) >= 0.5; full.visible = isFull && !o.slump; slumped.visible = isFull && !!o.slump; empty.visible = !isFull; };
};
/** the charcoal shovel: a short iron scoop on a wooden handle, 0.95 m; origin = the grip (the handle's middle), +y toward
 *  the blade; grips grip (the origin) and pair (hand 0 near the T end, hand 1 lower on the shaft: 0.3 m apart, for
 *  the rig's short arms); put({ load }) =
 *  charcoal heaped on the blade */
export const SHOVEL = { len: 0.95, blade: 0.6 } as const;
export const shovel = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), iron = K.flat(PC.iron, { rough: 0.5 });
  P.add(K.flat(PC.wood), limb(V(0, -0.3, 0), V(0, 0.3, 0), 0.016, 0.015, 10), 0.004);
  P.add(K.flat(PC.woodLo), box(0.09, 0.03, 0.03, 0, -0.31, 0), 0.0035);                       // the T grip at the end
  P.add(iron, limb(V(0, 0.29, 0), V(0, 0.45, 0.01), 0.012, 0.01, 8), 0.0035);
  P.add(iron, box(0.17, 0.2, 0.012, 0, SHOVEL.blade - 0.04, 0.035).rotateX(0.25), 0.0035);    // the blade, tipped up
  for (const s of [-1, 1]) P.add(iron, box(0.012, 0.18, 0.03, s * 0.082, SHOVEL.blade - 0.04, 0.045).rotateX(0.25), 0.003);
  P.into(g, "shovel");
  const ld = new THREE.Group(); ld.name = "shovel.load"; g.add(ld);
  const L = new Part(K), coal = K.flat(PC.charcoal, { rough: 0.9 });
  for (let i = 0; i < 6; i++) L.add(coal, ball(V(0.1 * (hash(i, 31) - 0.5), SHOVEL.blade - 0.08 + 0.12 * hash(i, 37), 0.06 + 0.02 * hash(i, 41)), 0.022, [1, 0.8, 1.1], 7), 0.003);
  L.into(ld, "shovel.load");
  return (o) => { ld.visible = !!o.load; };
};
/** the poker: an iron rod 0.72 m with a ring handle; origin = the grip under the ring, +y toward the tip; put({ hot })
 *  0..1 = the tip glows */
export const POKER = { len: 0.72 } as const;
export const poker = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), iron = K.flat(PC.iron, { rough: 0.5 });
  P.add(iron, limb(V(0, -0.04, 0), V(0, POKER.len - 0.08, 0), 0.0075, 0.007, 8), 0.003);
  P.add(iron, new THREE.TorusGeometry(0.026, 0.0065, 8, 18).translate(0, -0.066, 0), 0.003);
  P.into(g, "poker");
  const tipM = new THREE.MeshBasicMaterial({ color: PC.glow });
  const tip = own(new THREE.Mesh(limb(V(0, POKER.len - 0.1, 0), V(0, POKER.len - 0.04, 0), 0.0078, 0.006, 8), tipM), "poker.glow");
  g.add(tip);
  return (o) => { const k = clamp01(o.hot ?? 0); tip.visible = k > 0; tipM.color.set(PC.iron).lerp(new THREE.Color(PC.glow), k); };
};
/** THE BOARD (F/G): a plank 0.42 x 0.31, 1.6 cm thick, with Newton's charcoal figures on its face: an ellipse round a
 *  point S, the triangles S-A-B, S-B-C, S-C-D swept from it, a tangent, two circles, the letters; readable close up.
 *  Origin = its middle; the drawn face faces +z (lay it on his knee with rot [-PI/2, yaw, 0]); grips edge (the middle of
 *  its right edge, +x) and pair (left and right edges) */
export const BOARD = { w: 0.42, h: 0.31, t: 0.016 } as const;
/** the board's drawing (a canvas: also for an insert drawn flat) */
export const boardDrawing = (c: CanvasRenderingContext2D, w: number, h: number) => {
  c.fillStyle = "#c9a878"; c.fillRect(0, 0, w, h);
  // grain
  c.strokeStyle = "rgba(120,84,48,0.35)"; c.lineWidth = 2;
  for (let y = 10; y < h; y += 18 + 10 * hash(y, 3)) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 40) c.lineTo(x, y + 6 * Math.sin(x * 0.01 + y)); c.stroke(); }
  // old rubbed-out marks (grey smudges)
  for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(70,64,64,${0.08 + 0.08 * hash(i, 5)})`; c.beginPath(); c.ellipse(w * hash(i, 7), h * hash(i, 11), 40 + 60 * hash(i, 13), 14 + 20 * hash(i, 17), hash(i, 19) * 3, 0, TAU); c.fill(); }
  const ch = (lw: number) => { c.strokeStyle = "#2e2b30"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; };
  /** a hand-drawn line: slightly wobbly, drawn twice */
  const wob = (pts: [number, number][], lw: number, seed: number) => {
    ch(lw);
    for (let pass = 0; pass < 2; pass++) {
      c.beginPath();
      pts.forEach(([x, y], i) => { const dx = (hash(seed + i * 3 + pass, 1) - 0.5) * lw * 0.8, dy = (hash(seed + i * 5 + pass, 2) - 0.5) * lw * 0.8; if (i) c.lineTo(x + dx, y + dy); else c.moveTo(x + dx, y + dy); });
      c.stroke(); c.globalAlpha = 0.55;
    }
    c.globalAlpha = 1;
  };
  const S: [number, number] = [w * 0.38, h * 0.55];
  // the ellipse (the orbit), S at a focus
  const ex = w * 0.3, ey = h * 0.3, ecx = w * 0.47, ecy = h * 0.53;
  const ell: [number, number][] = Array.from({ length: 73 }, (_, i) => { const a = (i / 72) * TAU; return [ecx + ex * Math.cos(a), ecy + ey * Math.sin(a)]; });
  wob(ell, w * 0.008, 3);
  // points A, B, C, D on it and the triangles from S
  const on = (a: number): [number, number] => [ecx + ex * Math.cos(a), ecy + ey * Math.sin(a)];
  const A = on(-0.35), B = on(0.25), Cc = on(0.95), D = on(1.75);
  for (const [p, q] of [[A, B], [B, Cc], [Cc, D]] as [[number, number], [number, number]][]) { wob([S, p], w * 0.006, 7 + p[0]); wob([p, q], w * 0.006, 9 + q[1]); }
  wob([S, D], w * 0.006, 11);
  // shade one triangle with hatching
  c.save(); c.beginPath(); c.moveTo(...S); c.lineTo(...B); c.lineTo(...Cc); c.closePath(); c.clip(); ch(w * 0.003);
  for (let x = -h; x < w; x += w * 0.018) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + h, 0); c.stroke(); }
  c.restore();
  // the tangent at A
  const tA: [number, number] = [-ex * Math.sin(-0.35), ey * Math.cos(-0.35)], tl = Math.hypot(...tA);
  wob([[A[0] - (tA[0] / tl) * w * 0.14, A[1] - (tA[1] / tl) * w * 0.14], [A[0] + (tA[0] / tl) * w * 0.14, A[1] + (tA[1] / tl) * w * 0.14]], w * 0.005, 13);
  // two small circles (top left) and a triangle (bottom right)
  const circ = (cx: number, cy: number, r: number, seed: number) => wob(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * TAU; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]; }), w * 0.006, seed);
  circ(w * 0.14, h * 0.2, h * 0.1, 17); circ(w * 0.2, h * 0.24, h * 0.055, 19);
  wob([[w * 0.78, h * 0.86], [w * 0.95, h * 0.86], [w * 0.86, h * 0.66], [w * 0.78, h * 0.86]], w * 0.006, 23);
  // S at the focus: a dot
  c.fillStyle = "#2e2b30"; c.beginPath(); c.arc(S[0], S[1], w * 0.011, 0, TAU); c.fill();
  // letters
  c.fillStyle = "#2e2b30"; c.font = `italic 700 ${Math.round(h * 0.075)}px Georgia, "Times New Roman", serif`; c.textAlign = "center"; c.textBaseline = "middle";
  const lab = (t: string, p: [number, number], dx: number, dy: number) => c.fillText(t, p[0] + dx * w, p[1] + dy * h);
  lab("S", S, -0.035, 0.04); lab("A", A, 0.035, -0.02); lab("B", B, 0.035, 0.035); lab("C", Cc, -0.01, 0.05); lab("D", D, -0.04, 0.0);
  void FONT;
};
/** the firelight's colour on the board's drawn face (put({ warm })) */
export const BOARD_WARM = "#ff8a3c";
/** put({ warm }) 0..1 (default 0 = the place's light alone, as before): firelight added to the drawn face, scaled by
 *  the drawing itself (its emissive map is its own picture, so the charcoal lines stay dark). For G (WP5-G, review v2
 *  row 11): held up to her lens the face is turned from the fire door and the place's light left it flat olive-grey,
 *  while on the floor and on his knee it is firelit orange */
export const board = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K);
  P.add(K.flat(PC.woodHi, { rough: 0.7 }), box(BOARD.w, BOARD.h, BOARD.t, 0, 0, 0), 0.004);
  P.into(g, "board");
  const tex = paint(1024, 768, (c, w, h) => boardDrawing(c, w, h));
  const fm = K.flat("#ffffff", { map: tex, rough: 0.85 }) as THREE.MeshStandardMaterial;
  fm.emissive = new THREE.Color(0, 0, 0); fm.emissiveMap = tex;
  const face = own(new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w - 0.006, BOARD.h - 0.006), fm), "board.face");
  face.position.z = BOARD.t / 2 + 0.0008; face.receiveShadow = true; g.add(face);
  const warm = new THREE.Color(BOARD_WARM);
  return (o) => { fm.emissive.copy(warm).multiplyScalar(clamp01(o.warm ?? 0)); };
};
/** a stick of charcoal: 7 cm, 1.3 cm thick; origin = its middle, +y toward the worn tip; grip hilt (the origin) */
export const charcoal = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.charcoal, { rough: 0.95 }), limb(V(0, -0.035, 0), V(0, 0.03, 0), 0.0065, 0.006, 7), 0.0016);
  P.add(K.flat(PC.charcoalHi, { rough: 0.95 }), ball(V(0, 0.032, 0), 0.0055, [1, 0.7, 1], 7), 0.0014);
  P.into(g, "charcoal");
};
/** a clay crucible (a tapered pot, sooty below): 0.11 high; origin = under its middle; put({ hot }) 0..1 = molten metal
 *  glowing in its mouth */
export const CRUCIBLE = { h: 0.11, r: 0.05 } as const;
export const crucible = (K: Kit, g: THREE.Group): Hook => {
  const tex = paint(32, 128, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, PC.soot); gr.addColorStop(0.45, PC.clayLo); gr.addColorStop(0.75, PC.clay); gr.addColorStop(1, PC.clay); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  new Part(K).add(K.flat("#ffffff", { map: tex, rough: 0.9 }), turned([[0, 0], [0.028, 0], [0.032, 0.01], [CRUCIBLE.r, CRUCIBLE.h - 0.006], [CRUCIBLE.r + 0.004, CRUCIBLE.h], [CRUCIBLE.r - 0.008, CRUCIBLE.h], [0.026, 0.02], [0, 0.02]], 24), 0.003).into(g, "crucible");
  const mM = new THREE.MeshBasicMaterial({ color: PC.glow });
  const molten = own(new THREE.Mesh(new THREE.CircleGeometry(CRUCIBLE.r - 0.012, 20).rotateX(-Math.PI / 2).translate(0, CRUCIBLE.h - 0.02, 0), mM), "crucible.glow");
  g.add(molten);
  return (o) => { const k = clamp01(o.hot ?? 0); molten.visible = k > 0; mM.color.set(PC.flameLo).lerp(new THREE.Color(PC.flameHi), k); };
};
/** a glass flask (a round body and a long neck), pale green glass with a painted highlight, a little dark liquid in it:
 *  0.24 high; origin = under its middle */
export const FLASK = { h: 0.24, r: 0.065 } as const;
export const flask = (K: Kit, g: THREE.Group) => {
  const tex = paint(64, 128, (c, w, h) => {
    c.fillStyle = PC.glass; c.fillRect(0, 0, w, h);
    c.fillStyle = "#5a4a3a"; c.fillRect(0, h * 0.8, w, h * 0.2);
    c.fillStyle = PC.glassHi; c.fillRect(w * 0.18, h * 0.15, w * 0.07, h * 0.55); c.fillRect(w * 0.68, h * 0.4, w * 0.04, h * 0.25);
  });
  const prof: [number, number][] = [[0, 0], [0.03, 0.002], [0.055, 0.025], [FLASK.r, 0.065], [0.055, 0.105], [0.03, 0.125], [0.016, 0.14], [0.014, FLASK.h - 0.012], [0.019, FLASK.h - 0.004], [0.017, FLASK.h], [0, FLASK.h]];
  new Part(K).add(K.flat("#ffffff", { map: tex, rough: 0.15 }), turned(prof, 28, 30), 0.003).into(g, "flask");
};
/** the bellows: two pear-shaped boards with leather between and a brass nozzle toward +z; 0.55 long; origin = its
 *  middle; put({ open }) 0..1 = the upper board lifted (pumping); grip pair = the two handles at the back (-z) */
export const BELLOWS = { len: 0.55 } as const;
export const bellows = (K: Kit, g: THREE.Group): Hook => {
  const pear = () => { const s = new THREE.Shape(); s.moveTo(0, 0.2); s.bezierCurveTo(0.14, 0.18, 0.15, -0.08, 0.05, -0.14); s.lineTo(-0.05, -0.14); s.bezierCurveTo(-0.15, -0.08, -0.14, 0.18, 0, 0.2); return s; };
  const plank = () => { const geo = new THREE.ExtrudeGeometry(pear(), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2); geo.rotateY(Math.PI); return geo; };
  const lower = new Part(K), wood = K.flat(PC.wood, { rough: 0.6 });
  lower.add(wood, plank().translate(0, -0.03, 0), 0.0035);
  lower.add(K.flat(PC.brass, { rough: 0.4 }), limb(V(0, -0.012, 0.13), V(0, -0.012, 0.3), 0.022, 0.009, 12), 0.0035);
  for (const s of [-1, 1]) lower.add(K.flat(PC.woodLo), box(0.03, 0.02, 0.08, s * 0.04, -0.025, -0.2), 0.003);
  lower.into(g, "bellows");
  const top = new THREE.Group(); top.name = "bellows.top"; top.position.set(0, -0.012, 0.13); g.add(top);
  new Part(K).add(wood, plank().translate(0, 0.01, -0.13), 0.0035).add(K.flat(PC.woodLo), box(0.03, 0.02, 0.08, 0, 0.02, -0.33), 0.003).into(top, "bellows.top");
  const leather = new THREE.Group(); leather.name = "bellows.leather"; leather.position.set(0, -0.012, 0); g.add(leather);
  new Part(K).add(K.flat(PC.leather, { rough: 0.8 }), ball(V(0, 0, -0.01), 0.13, [0.95, 0.12, 1.25], 18), 0.003).into(leather, "bellows.leather");
  return (o) => { const k = clamp01(o.open ?? 0.4); top.rotation.x = -0.32 * k; leather.scale.set(1, 0.4 + 1.6 * k, 1); };
};

// ===================================================================================================== first person
/** HER MICROPHONE: a handheld reporter's mic, a black handle and a RED FOAM windscreen, no logo. Origin = the grip
 *  (where her fist closes, 7 cm from the handle's end); +y toward the head; the foam ball's centre at y MIC.head */
export const MIC = { head: 0.15, r: 0.033, end: -0.075, top: 0.112 } as const;
export const mic = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), blk = K.flat(PC.micBlack, { rough: 0.35 });
  P.add(blk, turned([[0, MIC.end - 0.004], [0.0145, MIC.end], [0.0155, MIC.end + 0.01], [0.0175, 0.06], [0.0205, MIC.top - 0.006], [0.021, MIC.top], [0, MIC.top]], 28), INK_NEAR);
  P.add(K.flat(PC.micRing, { rough: 0.3 }), cylY(0.0215, 0.012, MIC.top - 0.002, 28, 0.0225), INK_NEAR * 0.8);
  const foam = paint(128, 128, (c, w, h) => {
    c.fillStyle = PC.micRed; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const x = w * hash(i, 3), y = h * hash(i, 5), r = 0.8 + 1.6 * hash(i, 7); c.fillStyle = hash(i, 11) < 0.55 ? "rgba(140,30,28,0.55)" : "rgba(232,90,80,0.45)"; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  }, true);
  P.add(K.flat("#ffffff", { map: foam, rough: 0.95 }), ball(V(0, MIC.head, 0), MIC.r, [1, 1.05, 1], 28), INK_NEAR);
  P.into(g, "mic");
};
/** HER HAND (a young woman's) with the cuff of her mustard jacket sleeve, LEFT hand ("hand", the mic hand) or RIGHT
 *  ("handR", the free hand: mirrored). put({ pose }):
 *    "grip" (default)  a fist round a bar along +y through the origin (the mic's handle, the chair's rail, the board's
 *                      edge, the handkerchief's wad): knuckles toward -x (the back of a left hand), the thumb up the
 *                      bar on the +x side, the fingers round its front (+z)
 *    "open"            a flat hand: the palm's middle at the origin facing -y, the fingers toward +z, the thumb out to +x
 *  In both the wrist is behind (-z) and the sleeve runs back along -z (HAND.sleeve long: it leaves the frame). */
export const HAND = { bar: 0.019, wrist: -0.06, sleeve: 0.5 } as const;
const buildHand = (K: Kit, g: THREE.Group, side: 1 | -1): Hook => {
  const inner = new THREE.Group(); inner.name = side > 0 ? "hand.L" : "hand.R"; inner.scale.x = side; g.add(inner);
  const skin = K.flat(PC.skin, { rough: 0.7 }), skinLo = K.flat(PC.skinLo, { rough: 0.7 }), ink = INK_NEAR;
  // the sleeve and the wrist (shared by both poses)
  const cuffTex = paint(64, 256, (c, w, h) => {
    c.fillStyle = PC.cuff; c.fillRect(0, 0, w, h);
    c.fillStyle = PC.cuffLo; for (let x = 2; x < w; x += 8) c.fillRect(x, 0, 3, h * 0.12);              // the ribbed knit band at its edge
    c.fillStyle = PC.cuffLo; c.fillRect(0, h * 0.12, w, 5);
    c.strokeStyle = "rgba(150,100,30,0.4)"; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, h * (0.35 + 0.15 * i)); c.lineTo(w, h * (0.32 + 0.15 * i)); c.stroke(); }
  });
  const S = new Part(K);
  // the sleeve opens toward +z (its cuff around the wrist) and runs back: a lathe along y, turned to lie along -z
  S.add(K.flat("#ffffff", { map: cuffTex, rough: 0.9 }), turned([[0, -HAND.sleeve], [0.044, -HAND.sleeve], [0.042, -0.2], [0.037, -0.04], [0.034, 0], [0.027, 0.002], [0.0, 0.002]], 24, 24).rotateX(Math.PI).rotateX(-Math.PI / 2).translate(0, -0.006, HAND.wrist - 0.02), ink);
  S.add(skin, limb(V(0, -0.004, HAND.wrist - 0.04), V(0, -0.003, HAND.wrist + 0.025), 0.021, 0.02, 12), ink);
  S.into(inner, "hand.sleeve");
  // GRIP: the back of the hand, the four fingers round the bar, the thumb up its side
  const grip = new THREE.Group(); grip.name = "hand.grip"; inner.add(grip);
  const G = new Part(K), R = HAND.bar + 0.008;
  G.add(skin, ball(V(-0.02, -0.004, -0.018), 0.03, [0.85, 1.05, 1.2], 16), ink);                                      // back of the hand / palm
  for (let i = 0; i < 4; i++) {
    const y = 0.026 - i * 0.0175, rr = R + 0.001 - 0.0008 * i, tube = 0.0088 - 0.0007 * i;
    // a curled finger: a torus arc round the bar from the knuckle (front-left) round the front to the right side
    const arc = rad(175), start = rad(-25);
    G.add(skin, new THREE.TorusGeometry(rr, tube, 8, 14, arc).rotateX(Math.PI / 2).rotateY(-start).translate(0, y, 0), ink);
    G.add(skinLo, ball(V(rr * Math.cos(rad(150)), y, rr * Math.sin(rad(150))), tube * 1.08, [1, 1, 1], 8), ink * 0.8);   // the knuckle
  }
  G.add(skin, limb(V(0.016, -0.024, -0.022), V(0.024, 0.006, -0.012), 0.0105, 0.0095, 10), ink);                      // the thumb's root
  G.add(skin, limb(V(0.024, 0.006, -0.012), V(0.02, 0.04, -0.004), 0.0095, 0.0085, 10), ink);                         // the thumb up the bar
  G.into(grip, "hand.grip");
  // OPEN: a flat hand, palm down (-y), fingers toward +z
  const open = new THREE.Group(); open.name = "hand.open"; inner.add(open);
  const O = new Part(K);
  O.add(skin, ball(V(0, 0, 0), 0.04, [1, 0.32, 1.1], 18), ink);
  for (let i = 0; i < 4; i++) {
    const x = -0.027 + 0.018 * i, L = [0.07, 0.078, 0.072, 0.058][i], sp = (i - 1.5) * 0.05;
    O.add(skin, limb(V(x * 0.9, 0, 0.03), V(x + Math.sin(sp) * L, -0.006, 0.03 + Math.cos(sp) * L), 0.0092, 0.0078, 10), ink);
  }
  O.add(skin, limb(V(0.03, -0.004, -0.012), V(0.064, -0.01, 0.03), 0.011, 0.009, 10), ink);
  O.into(open, "hand.open");
  return (o) => { const p = o.pose ?? "grip"; grip.visible = p === "grip"; open.visible = p === "open"; };
};
const rad = (d: number) => (d * Math.PI) / 180;
/** her LEFT hand (the mic hand) */
export const hand = (K: Kit, g: THREE.Group): Hook => buildHand(K, g, 1);
/** her RIGHT hand (the free hand: the chair, the handkerchief, the board, the clap) */
export const handR = (K: Kit, g: THREE.Group): Hook => buildHand(K, g, -1);
