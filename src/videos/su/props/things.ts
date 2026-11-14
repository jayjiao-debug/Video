// THE PROPS of the Su film (PLAN section 4; WP3), built with the kit's prop kit (src/kit/props/kit.ts: Part = merged
// meshes + ONE black hull outline, layer NOINK; paint = mip-mapped canvas textures). Each builder fills a prop's group
// and may return a Hook that put() calls with the put's options; origins, axes, grips and sizes are those of
// props/index.ts PROP_INFO. The kit's rules hold (src/kit/props/README.md): a prop never goes through the ink pass (its
// hull is its line); nothing thinner than 1.2 cm with its hull; parts overlap by a centimetre (hidden) or stand apart;
// small pattern is PAINT; colours between #2b2630 and #f4f1ea; nothing random (seeded hash only); nothing changes from
// frame to frame except what a put() option drives (open, lit, lid, steam, ink, clean, peeled, t ...).
// Meshes that are not solid things carry a name the clearance checker leaves out: ".glow", ".flame", ".spill".
import * as THREE from "three";
import { V, M4, Part, NOINK, turned, limb, ball, box, prism, paint, hash, type Kit } from "../../../kit/props/kit";
import type { PutOpts } from "./index";

export type Hook = ((o: PutOpts, g: THREE.Group) => void) | void;
const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

/** the film's prop colours */
export const PC = {
  wood: "#9a7048", woodLo: "#6e4e32", woodHi: "#b88c5e", woodPale: "#c8a678", bamboo: "#dcc896", bambooLo: "#b8a46c",
  rattan: "#d0aa6a", rattanLo: "#a8823e", clay: "#b8754e", clayLo: "#8e5638", clayHi: "#cc8e66", iron: "#4e4a52", ironHi: "#6e6a74",
  steel: "#d8dce2", steelLo: "#a8b0ba", bone: "#e8d9b8", boneLo: "#c8b48e", grilled: "#b8743a", grilledLo: "#8a4e26", char: "#4a3428",
  cleanBone: "#f0e8d8", meat: "#d86a62", lychee: "#c8323a", lycheeLo: "#962a30", flesh: "#f4eee2", leaf: "#4f7a46", leafLo: "#3c6236",
  paper: "#efe4c6", silk: "#e8c860", silkLo: "#c49a3a", ink: "#2e2a33", lac: "#2e2a33", red: "#c8322c", redLo: "#a02a26",
  cloth: "#8a2e28", gold: "#e2b03a", pork: "#b8302a", porkHi: "#e2604a", fat: "#f2dcc8", ash: "#6a625e",
  shell: "#8a8278", shellLo: "#6a645e", pearl: "#ece4dc", oyster: "#d8c8b0", copper: "#b8823e", copperLo: "#8e6230",
  celadon: "#9cbca4", celadonLo: "#7a9a84", wine: "#c89a4a",
  flame: "#f6902a", flameHi: "#ffd866", flameLo: "#c9541c",
} as const;

// ------------------------------------------------------------------------------------------------- small helpers
// (a turned() profile runs from the BOTTOM up: the other way round its faces point in and it draws as its black hull)
/** a closed cylinder along x, centred on the origin */
const cylX = (r: number, len: number, seg = 16) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
/** a closed cylinder along z, centred on the origin */
const cylZ = (r: number, len: number, seg = 16) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
/** a closed cylinder along y from y0 up h (r at the bottom, r1 at the top) */
const cylY = (r: number, h: number, y0: number, seg = 16, r1 = r) => new THREE.CylinderGeometry(r1, r, h, seg).translate(0, y0 + h / 2, 0);
/** a rounded box (a box whose vertices are pulled toward a superellipsoid: soft edges, keeps its hull closed) */
const softBox = (w: number, h: number, d: number, round = 0.25, seg = 6) => {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), P = g.attributes.position, hw = w / 2, hh = h / 2, hd = d / 2;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i) / hw, y = P.getY(i) / hh, z = P.getZ(i) / hd, k = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const nx = x / k, ny = y / k, nz = z / k, l = Math.hypot(nx, ny, nz), s = lerp(1, 1 / l, round) * k;
    P.setXYZ(i, nx * s * hw, ny * s * hh, nz * s * hd);
  }
  g.computeVertexNormals();
  return g;
};

// ===================================================================================================== the market
/** the butcher's cleaver (菜刀): a broad rectangular blade, its edge toward +x, the wooden handle along -y; origin = the
 *  middle of the grip */
export const CLEAVER = { grip: 0.12, blade: [0.07, 0.27] as [number, number], w: 0.1 } as const;
export const cleaver = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), steel = K.flat(PC.steel, { rough: 0.3 }), dark = K.flat(PC.iron, { rough: 0.4 });
  P.add(K.flat(PC.woodLo), cylY(0.014, CLEAVER.grip, -CLEAVER.grip / 2 - 0.005, 12, 0.016), 0.004);
  P.add(dark, cylY(0.018, 0.02, CLEAVER.grip / 2 - 0.01, 12), 0.004);
  // the blade: a wedge in z (thick at the back, thin at the edge), in the xy plane
  const [y0, y1] = CLEAVER.blade, sh = new THREE.Shape([new THREE.Vector2(-0.02, y0), new THREE.Vector2(CLEAVER.w - 0.02, y0 + 0.01), new THREE.Vector2(CLEAVER.w - 0.015, y1), new THREE.Vector2(-0.02, y1)]);
  const bl = new THREE.ExtrudeGeometry(sh, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 }).translate(0, 0, -0.004);
  P.add(steel, bl, 0.004);
  P.add(dark, box(0.012, y1 - y0, 0.011, -0.016, (y0 + y1) / 2, 0), 0);
  P.into(g, "cleaver");
};
/** the butcher's chopping block: a thick round log slab (end grain up, rings and cut marks painted) on three splayed
 *  legs; r 0.34, top 0.8 (layout market.ts MARKET_SET.block); origin = the floor under its middle */
export const BLOCK = { r: 0.34, top: 0.8, slab: 0.26 } as const;
export const block = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), side = K.flat(PC.woodLo, { rough: 0.9 });
  const top = paint(256, 256, (c, w, h) => {
    c.fillStyle = "#c8a070"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#a88052"; c.lineWidth = 3; for (let i = 1; i < 9; i++) { c.beginPath(); c.arc(w / 2 + 3, h / 2 - 2, i * 14, 0, TAU); c.stroke(); }
    c.strokeStyle = "#8a6440"; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = hash(i + 3) * TAU, r = 30 + 60 * hash(i + 11); c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); c.lineTo(w / 2 + Math.cos(a + 0.5) * (r + 30), h / 2 + Math.sin(a + 0.5) * (r + 30)); c.stroke(); }
  });
  const y0 = BLOCK.top - BLOCK.slab;
  P.shell([[K.flat("#ffffff", { map: top, rough: 0.9 }), new THREE.CircleGeometry(BLOCK.r, 40).rotateX(-Math.PI / 2).translate(0, BLOCK.top, 0)], [side, new THREE.CylinderGeometry(BLOCK.r, BLOCK.r * 1.02, BLOCK.slab, 40, 1, true).translate(0, y0 + BLOCK.slab / 2, 0)], [side, new THREE.CircleGeometry(BLOCK.r * 1.02, 40).rotateX(Math.PI / 2).translate(0, y0, 0)]], 0.006);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.3; P.add(side, limb(V(Math.sin(a) * 0.18, y0 + 0.02, Math.cos(a) * 0.18), V(Math.sin(a) * 0.3, 0.02, Math.cos(a) * 0.3), 0.045, 0.04, 10), 0.006); }
  P.into(g, "block");
};
/** a bare lamb spine (羊脊骨): a chain of vertebrae along x with short side wings and a few pink scraps; 0.42 m; origin =
 *  its middle; grip pair = his two hands on its ends (x +-0.15) */
export const SPINE = { len: 0.42, hand: 0.15 } as const;
export const spine = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), bone = K.flat(PC.bone, { rough: 0.6 }), lo = K.flat(PC.boneLo, { rough: 0.6 }), meat = K.flat(PC.meat, { rough: 0.7 });
  const n = 9, L = SPINE.len;
  P.add(lo, cylX(0.016, L - 0.02, 10), 0.004);
  for (let i = 0; i < n; i++) {
    const x = -L / 2 + 0.02 + (i * (L - 0.04)) / (n - 1), s = 1 - 0.25 * Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
    P.add(bone, ball(V(x, 0, 0), 0.03 * s, [0.75, 1, 1.1], 12), 0.004);
    P.add(bone, limb(V(x, 0.01, 0), V(x + 0.006, 0.055 * s, -0.004), 0.012, 0.008, 8), 0.0035);                   // the spike on top
    for (const sz of [-1, 1]) P.add(lo, limb(V(x, -0.004, 0), V(x, -0.012, sz * 0.05 * s), 0.011, 0.008, 8), 0.0035);   // the side wings
    if (i % 3 === 1) P.add(meat, ball(V(x + 0.012, 0.012, 0.02), 0.012, [1.4, 0.8, 0.9], 8), 0.003);              // a scrap of meat left on it
  }
  P.into(g, "spine");
};
/** a copper cash coin with a square hole (r 0.016); origin = its middle, its face toward +z; grip hilt (the middle) */
export const coin = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), sh = new THREE.Shape(); sh.absarc(0, 0, 0.016, 0, TAU, false);
  const hole = new THREE.Path(); hole.moveTo(-0.004, -0.004); hole.lineTo(0.004, -0.004); hole.lineTo(0.004, 0.004); hole.lineTo(-0.004, 0.004); hole.lineTo(-0.004, -0.004); sh.holes.push(hole);
  P.add(K.flat(PC.copper, { rough: 0.4 }), new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -0.0015), 0.0025);
  P.into(g, "coin");
};

// ===================================================================================================== the yard: the cooking
/** a grilled lamb bone: a shaft with knobbly ends, golden-brown with char stripes; put({ clean: true }) = picked
 *  spotless white (B09). 0.16 m along y; origin = its middle; grip hilt = one end (y -0.055: the hand holds the lower
 *  end, the other end sticks up) */
export const BONE = { len: 0.16, hilt: -0.055 } as const;
export const bone = (K: Kit, g: THREE.Group): Hook => {
  const make = (clean: boolean) => {
    const grp = new THREE.Group(), P = new Part(K);
    const tex = paint(64, 128, (c, w, h) => {
      c.fillStyle = clean ? PC.cleanBone : PC.grilled; c.fillRect(0, 0, w, h);
      if (!clean) { c.fillStyle = PC.char; for (let i = 0; i < 5; i++) c.fillRect(0, 14 + i * 24, w, 6); c.fillStyle = PC.grilledLo; for (let i = 0; i < 6; i++) c.fillRect(w * hash(i + 4), h * hash(i + 9), 8, 14); }
      else { c.fillStyle = "#ddd2bc"; c.fillRect(0, h * 0.45, w, 4); }
    });
    const m = K.flat("#ffffff", { map: tex, rough: clean ? 0.5 : 0.7 }), end = K.flat(clean ? PC.cleanBone : PC.grilledLo, { rough: 0.6 });
    P.add(m, new THREE.CylinderGeometry(0.0125, 0.014, BONE.len - 0.04, 12), 0.004);
    for (const s of [-1, 1]) for (const x of [-0.011, 0.011]) P.add(end, ball(V(x, s * (BONE.len / 2 - 0.016), 0), 0.017, [1, 0.9, 0.85], 10), 0.004);
    if (!clean) P.add(K.flat(PC.grilledLo, { rough: 0.8 }), ball(V(0, 0.012, 0), 0.02, [1.05, 1.9, 1.05], 12), 0.004);   // the meat still on it
    P.into(grp, "bone");
    g.add(grp);
    return grp;
  };
  const meaty = make(false), white = make(true);
  return (o) => { meaty.visible = !o.clean; white.visible = !!o.clean; };
};
/** the clay stove (泥炉) of the yard: a small double-mouthed clay stove, a dark iron POT on the left hole (its lid off,
 *  broth inside, steam over it: put({ steam: 0..1, t })), the right hole for the grill (props "grill" sits there: see
 *  STOVE.grill); two glowing fire mouths in front (+z). 0.78 x 0.5, top 0.62 (layout yard.ts YARD_SET.stove); origin =
 *  the ground under its middle */
export const STOVE = { w: 0.78, d: 0.5, top: 0.62, pot: V(-0.18, 0.62 + 0.15, 0), potR: 0.15, grill: V(0.2, 0.62, 0) } as const;
export const stove = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), clay = K.flat(PC.clay, { rough: 0.9 }), lo = K.flat(PC.clayLo, { rough: 0.9 }), iron = K.flat(PC.iron, { rough: 0.5 });
  const body = softBox(STOVE.w, STOVE.top - 0.04, STOVE.d, 0.35).translate(0, (STOVE.top - 0.04) / 2, 0);
  P.add(clay, body, 0.007);
  P.add(lo, softBox(STOVE.w + 0.04, 0.05, STOVE.d + 0.04, 0.4).translate(0, STOVE.top - 0.03, 0), 0.006);
  // the fire mouths: dark arches with a glow inside (decals on the front face)
  const mouth = paint(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h * 0.8, 2, w / 2, h * 0.8, w * 0.6); gr.addColorStop(0, "#ffd070"); gr.addColorStop(0.45, "#e0662a"); gr.addColorStop(1, "#3a2420"); c.fillStyle = gr; c.beginPath(); c.moveTo(4, h); c.lineTo(4, h * 0.45); c.arc(w / 2, h * 0.45, w / 2 - 4, Math.PI, 0); c.lineTo(w - 4, h); c.fill(); });
  const glowM = new THREE.MeshBasicMaterial({ map: mouth, transparent: true, depthWrite: false });
  for (const x of [STOVE.pot.x, STOVE.grill.x]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15).translate(x, 0.14, STOVE.d / 2 + 0.006), glowM); m.layers.set(NOINK); m.name = "stove.glow"; g.add(m); }
  // the pot: a dark iron pot with two ears, sitting in the left hole
  const py = STOVE.top - 0.03;
  P.add(iron, turned([[0.09, py], [0.14, py + 0.03], [STOVE.potR, py + 0.09], [STOVE.potR - 0.005, py + 0.15], [STOVE.potR - 0.025, py + 0.15]], 28).translate(STOVE.pot.x, 0, 0), 0.006);
  for (const s of [-1, 1]) P.add(iron, box(0.04, 0.025, 0.025, STOVE.pot.x + s * (STOVE.potR + 0.012), py + 0.13, 0), 0.004);
  P.add(K.flat("#c8a46a", { rough: 0.3 }), new THREE.CircleGeometry(STOVE.potR - 0.025, 28).rotateX(-Math.PI / 2).translate(STOVE.pot.x, py + 0.125, 0), 0);   // the broth
  // the right hole: a dark ring (the grill sits on it)
  P.add(K.flat("#3a2a24", { rough: 0.9 }), new THREE.CircleGeometry(0.12, 24).rotateX(-Math.PI / 2).translate(STOVE.grill.x, STOVE.top + 0.0015, 0), 0);
  P.into(g, "stove");
  // the steam: soft pale puffs rising from the pot (glow-named: not a solid), each on its own clock from t
  const puffTex = paint(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(0.6, "rgba(255,255,255,0.3)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const puffs: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0.6 })); s.layers.set(NOINK); s.name = "stove.glow"; g.add(s); puffs.push(s); }
  return (o) => {
    const k = o.steam ?? 1, t = o.t ?? 0;
    puffs.forEach((s, i) => {
      const life = 2.6, u = (((t + i * (life / puffs.length)) / life) % 1 + 1) % 1, drift = Math.sin(TAU * (u * 0.6 + hash(i + 2)));
      s.visible = k > 0.01;
      s.position.set(STOVE.pot.x + 0.05 * drift, STOVE.top + 0.15 + u * 0.55, 0.03 * Math.cos(TAU * u + i));
      const sz = 0.1 + 0.22 * u; s.scale.set(sz, sz, 1);
      (s.material as THREE.SpriteMaterial).opacity = k * 0.55 * Math.sin(Math.PI * u);
    });
  };
};
/** the small iron grill (烤架) over the stove's right hole: five bars on a frame, four short feet; 0.24 x 0.18, its bars'
 *  top at GRILL.top; origin = under its middle (put it at the stove's grill point: stovePoint(at, rot, "grill")) */
export const GRILL = { w: 0.24, d: 0.18, top: 0.05 } as const;
export const grill = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), iron = K.flat(PC.iron, { rough: 0.5 }), y = GRILL.top - 0.006;
  for (const sz of [-1, 1]) P.add(iron, cylX(0.007, GRILL.w, 8).translate(0, y, sz * GRILL.d / 2), 0.003);
  for (const sx of [-1, 1]) P.add(iron, cylZ(0.007, GRILL.d, 8).translate(sx * GRILL.w / 2, y, 0), 0.003);
  for (let i = 1; i < 6; i++) P.add(iron, cylZ(0.0055, GRILL.d, 6).translate(-GRILL.w / 2 + (i * GRILL.w) / 6, y, 0), 0.0025);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(iron, limb(V(sx * GRILL.w / 2, y, sz * GRILL.d / 2), V(sx * (GRILL.w / 2 + 0.01), 0.004, sz * (GRILL.d / 2 + 0.01)), 0.006, 0.006, 6), 0.003);
  P.into(g, "grill");
};
/** the wine bowl (酒碗): a shallow celadon bowl with amber wine in it, r 0.075, 0.05 high; origin = under its foot */
export const WINE_BOWL = { r: 0.075, h: 0.05 } as const;
export const wineBowl = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), cel = K.flat(PC.celadon, { rough: 0.25 });
  P.add(cel, turned([[0.03, 0], [0.032, 0.008], [0.06, 0.03], [WINE_BOWL.r, WINE_BOWL.h], [WINE_BOWL.r - 0.006, WINE_BOWL.h]], 28), 0.004);
  P.add(K.flat(PC.wine, { rough: 0.15 }), new THREE.CircleGeometry(WINE_BOWL.r - 0.012, 24).rotateX(-Math.PI / 2).translate(0, WINE_BOWL.h - 0.012, 0), 0);
  P.into(g, "wineBowl");
};
/** a low round stool (the wine bowl and the salt stand on it beside the stove): top r 0.17 at STOOL.top; origin = floor */
export const STOOL = { r: 0.17, top: 0.47 } as const;
export const stool = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.wood, { rough: 0.8 });
  P.add(w, cylY(STOOL.r, 0.04, STOOL.top - 0.04, 24), 0.005);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; P.add(K.flat(PC.woodLo), limb(V(Math.sin(a) * 0.1, STOOL.top - 0.03, Math.cos(a) * 0.1), V(Math.sin(a) * 0.15, 0.015, Math.cos(a) * 0.15), 0.017, 0.015, 8), 0.004); }
  P.add(K.flat("#f0ece4", { rough: 0.7 }), turned([[0, STOOL.top], [0.03, STOOL.top], [0.026, STOOL.top + 0.03], [0, STOOL.top + 0.035]], 16).translate(-0.09, 0, 0.04), 0.003);   // the salt in a little dish
  P.into(g, "stool");
};
/** a pair of long cooking chopsticks (长筷), bamboo, 0.36 m along -y from the grip (the tips at -y, 1 cm apart there);
 *  origin = the grip (8 cm from their top ends); grip hilt (the origin) */
export const CHOPSTICKS = { len: 0.36, grip: 0.08 } as const;
export const chopsticks = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), b = K.flat(PC.bamboo, { rough: 0.6 }), top = CHOPSTICKS.grip, bot = -(CHOPSTICKS.len - CHOPSTICKS.grip);
  for (const s of [-1, 1]) P.add(b, limb(V(s * 0.009, top, 0), V(s * 0.004, bot, 0), 0.005, 0.0035, 6), 0.003);
  P.add(K.flat(PC.red), limb(V(-0.012, top - 0.02, 0), V(0.012, top - 0.02, 0), 0.006, 0.006, 6), 0.002);
  P.into(g, "chopsticks");
};
/** the clay pot of red-braised pork (东坡肉) with its lid: r 0.16, 0.18 high; put({ lid: 0..1 }): 0 shut, 1 lifted off
 *  and set beside it (+x); glossy red cubes inside; origin = under its middle */
export const PORK_POT = { r: 0.16, h: 0.18 } as const;
export const porkPot = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), clay = K.flat(PC.clayLo, { rough: 0.6 }), H = PORK_POT.h, R = PORK_POT.r;
  P.add(clay, turned([[0.1, 0], [0.14, 0.03], [R, 0.1], [R - 0.01, H], [R - 0.022, H]], 28), 0.006);
  for (const s of [-1, 1]) P.add(clay, ball(V(s * (R + 0.008), H - 0.04, 0), 0.02, [1, 0.6, 0.9], 8), 0.004);
  P.add(K.flat("#6a2620", { rough: 0.2 }), new THREE.CircleGeometry(R - 0.024, 28).rotateX(-Math.PI / 2).translate(0, H - 0.03, 0), 0);
  const pork = K.flat(PC.pork, { rough: 0.15 }), fat = K.flat(PC.fat, { rough: 0.3 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4, r = i === 6 ? 0 : 0.07, x = Math.cos(a) * r, z = Math.sin(a) * r;
    P.add(pork, softBox(0.055, 0.04, 0.055, 0.5, 3).rotateY(a).translate(x, H - 0.022, z), 0.003);
    P.add(fat, softBox(0.057, 0.012, 0.057, 0.5, 3).rotateY(a).translate(x, H - 0.006, z), 0);
  }
  P.into(g, "porkPot");
  const lidG = new THREE.Group(); g.add(lidG);
  const L = new Part(K);
  L.add(clay, turned([[R + 0.008, 0], [R - 0.01, 0.03], [0.06, 0.05], [0.025, 0.055], [0.02, 0.075], [0, 0.078]], 28), 0.005);
  L.into(lidG, "porkPot.lid");
  return (o) => {
    // up off the pot over the first 40 %, then over to the pot's +x side and down onto the same ground
    const k = clamp01(o.lid ?? 0), k1 = smooth(k / 0.4), k2 = smooth((k - 0.4) / 0.6);
    lidG.position.set((2 * R + 0.06) * k2, k < 0.4 ? H + 0.12 * k1 : lerp(H + 0.12, 0, k2), 0);
    lidG.rotation.set(0, 0, -0.5 * Math.sin(Math.PI * k));
  };
};

// ===================================================================================================== the yard: the house
/** a wooden ladder: two rails 2.8 m along +y, 0.42 apart (x), a rung every 0.3 m; origin = the middle of its foot on the
 *  ground. Lean it with put({ rot: ladderRot(foot, top) }) (props/index.ts): its +y then runs from foot to top */
export const LADDER = { len: 2.8, w: 0.42, rung: 0.3 } as const;
export const ladder = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.bamboo, { rough: 0.7 }), lo = K.flat(PC.bambooLo, { rough: 0.7 });
  for (const s of [-1, 1]) P.add(w, cylY(0.024, LADDER.len, 0, 10), 0.005, M4(s * LADDER.w / 2, 0, 0));
  for (let y = 0.25; y < LADDER.len - 0.05; y += LADDER.rung) P.add(lo, cylX(0.016, LADDER.w + 0.03, 8).translate(0, y, 0), 0.004);
  P.into(g, "ladder");
};
/** the lantern's sizes (m, y under its hook; it hangs along -y): the paper's middle, the underside of its bottom cap
 *  (where it stands when set down: put the hook at the ground's y - base), the tassel's tip, the paper's radius */
export const LANTERN = { centre: -0.23, base: -0.405, tassel: -0.53, r: 0.15 } as const;
/** the red paper lantern (灯笼): 0.40 m high with its caps (the tassel to 0.53), r 0.15, red paper on dark ribs, a gold
 *  band; put({ lit: 0..1 }) = lit from inside (0 = a dull red paper, 1 = glowing warm: it is self-lit, the place's
 *  point light is the glow on things round it); put({ rest: true }) = set down on its bottom cap: the tassel is
 *  hidden (it would go through what it stands on). Origin = the hook at its top; grip hook (the origin) */
export const lantern = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), cap = K.flat("#2e2a30");
  P.add(cap, cylY(0.006, 0.06, -0.06, 6), 0.0025);
  P.add(cap, cylY(0.07, 0.035, -0.09, 16, 0.06), 0.003);
  const prof: [number, number][] = [[0.065, -0.38], [0.12, -0.34], [0.15, -0.26], [0.15, -0.2], [0.12, -0.12], [0.065, -0.08]];
  const ribs = paint(256, 128, (c, w, h) => { c.fillStyle = "#f07a52"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8402e"; for (let i = 0; i < 12; i++) c.fillRect((w * i) / 12, 0, 4, h); c.fillStyle = "#f6c66a"; c.fillRect(0, h * 0.44, w, h * 0.12); });
  const glowM = new THREE.MeshBasicMaterial({ color: "#ffffff", map: ribs });
  P.add(glowM, turned(prof, 24, 24), 0.004);
  P.add(cap, cylY(0.06, 0.03, LANTERN.base, 16, 0.07), 0.003);
  P.into(g, "lantern");
  // the tassel hangs under the bottom cap: its own mesh, hidden by put({ rest: true }) (the lantern set down on its cap)
  const tassel = new THREE.Group(); g.add(tassel);
  new Part(K).add(K.flat(PC.red), turned([[0, LANTERN.tassel], [0.03, LANTERN.tassel + 0.01], [0.02, -0.43], [0, -0.41]], 10), 0.003).into(tassel, "lantern.tassel");
  const dim = new THREE.Color("#7a3a30"), hot = new THREE.Color("#ffffff");
  return (o) => { glowM.color.copy(dim).lerp(hot, clamp01(o.lit ?? 1)); tassel.visible = !o.rest; };
};
/** a rustic bench (长凳): a thick plank 1.5 x 0.36 at 0.45 m (layout yard.ts YARD_SET.bench) on four splayed legs, its
 *  long side along x; origin = the floor under its middle. A sitter: props/index.ts benchSeat */
export const BENCH = { len: 1.5, d: 0.36, top: 0.45, board: 0.06 } as const;
export const bench = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.wood, { rough: 0.85 }), lo = K.flat(PC.woodLo, { rough: 0.85 }), y0 = BENCH.top - BENCH.board;
  P.add(w, softBox(BENCH.len, BENCH.board, BENCH.d, 0.15).translate(0, y0 + BENCH.board / 2, 0), 0.006);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(lo, limb(V(sx * (BENCH.len / 2 - 0.14), y0 + 0.01, sz * 0.09), V(sx * (BENCH.len / 2 - 0.08), 0.02, sz * 0.15), 0.028, 0.025, 8), 0.005);
  for (const sx of [-1, 1]) P.add(lo, cylZ(0.016, 0.3, 8).translate(sx * (BENCH.len / 2 - 0.11), 0.2, 0), 0.004);
  P.into(g, "bench");
};

// ===================================================================================================== C: the lychee tree
/** one lychee (荔枝): a red bumpy fruit r 0.02 (a touch big, so it reads); put({ peeled: 0..1 }): its shell splits and
 *  falls away from the white flesh (1 = the white fruit with the shell's lower half under it). Origin = its middle;
 *  grip hilt (the middle: a hand holds it) */
export const LYCHEE = { r: 0.02 } as const;
const lycheeTex = () => paint(64, 64, (c, w, h) => { c.fillStyle = PC.lychee; c.fillRect(0, 0, w, h); c.fillStyle = PC.lycheeLo; for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < w; x += 8) c.fillRect(x, y, 3, 3); });
export const lychee = (K: Kit, g: THREE.Group): Hook => {
  const r = LYCHEE.r, tex = lycheeTex(), red = K.flat("#ffffff", { map: tex, rough: 0.7 }), flesh = K.flat(PC.flesh, { rough: 0.2 });
  const whole = new THREE.Group(), peeled = new THREE.Group(), top = new THREE.Group(); g.add(whole, peeled);
  new Part(K).add(red, ball(V(0, 0, 0), r, [1, 1.08, 1], 14), 0.0025).add(K.flat(PC.leafLo), limb(V(0, r, 0), V(0.002, r + 0.008, 0), 0.0025, 0.002, 5), 0.0015).into(whole, "lychee");
  new Part(K).add(flesh, ball(V(0, 0.002, 0), r * 0.86, [1, 1.1, 1], 14), 0.0025).into(peeled, "lychee.flesh");
  // the shell's lower half (a cup) under the white fruit, its upper half (the lid) lifts off and away
  new Part(K).add(red, new THREE.SphereGeometry(r * 1.02, 14, 8, 0, TAU, Math.PI * 0.55, Math.PI * 0.45), 0.0025).into(peeled, "lychee.cup");
  peeled.add(top); new Part(K).add(red, new THREE.SphereGeometry(r * 1.02, 14, 6, 0, TAU, 0, Math.PI * 0.4), 0.0025).into(top, "lychee.top");
  return (o) => {
    const k = clamp01(o.peeled ?? 0);
    whole.visible = k <= 0.02; peeled.visible = k > 0.02;
    top.visible = k < 0.98; top.position.set(0.03 * smooth(k), 0.02 * Math.sin(Math.PI * k), 0); top.rotation.set(0, 0, -1.4 * smooth(k));
  };
};
/** a bunch of lychees on a twig: eight fruits round a short woody stem with three leaves, 0.16 m; origin = the stem's
 *  top; grip hook (the origin: hung from a hand or the tree) */
export const lycheeBunch = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), red = K.flat("#ffffff", { map: lycheeTex(), rough: 0.7 }), stem = K.flat(PC.woodLo), leaf = K.flat(PC.leaf, { rough: 0.6 });
  P.add(stem, limb(V(0, 0, 0), V(0.01, -0.07, 0), 0.006, 0.005, 6), 0.0025);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.3, rr = i < 5 ? 0.034 : 0.016, y = i < 5 ? -0.1 : -0.13, p = V(Math.cos(a) * rr + 0.01, y - 0.01 * hash(i), Math.sin(a) * rr);
    P.add(stem, limb(V(0.01, -0.07, 0), p.clone().add(V(0, LYCHEE.r * 0.8, 0)), 0.003, 0.0025, 5), 0.0015);
    P.add(red, ball(p, LYCHEE.r, [1, 1.08, 1], 12), 0.0025);
  }
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; P.add(leaf, ball(V(Math.cos(a) * 0.05, -0.03, Math.sin(a) * 0.05), 0.045, [1, 0.12, 0.42], 10).rotateY(-a), 0.003); }
  P.into(g, "lycheeBunch");
};
/** one empty lychee shell half (a red cup, r 0.021): the one on his sleeping belly (C26). Origin = its middle; its
 *  open side up (+y) */
export const shell = (K: Kit, g: THREE.Group) => {
  new Part(K).add(K.flat("#ffffff", { map: lycheeTex(), rough: 0.7 }), new THREE.SphereGeometry(LYCHEE.r * 1.05, 14, 8, 0, TAU, Math.PI * 0.5, Math.PI * 0.5).scale(1, 0.8, 1), 0.0025).into(g, "shell");
};
/** the rattan day bed (藤榻) under the lychee tree: a low frame 1.9 long (along z) x 0.72 wide, its woven top at 0.42 m
 *  (layout yard.ts YARD_SET.bed), a slanted woven BACKREST at the head end (-z) rising 0.55 m above the top, short legs.
 *  Origin = the MIDDLE OF ITS TOP (layout yard.ts YARD.bed is that point); the sitter faces +z (props/index.ts bedSeat) */
export const BED = { len: 1.9, w: 0.72, top: 0.42, back: { z: -0.62, h: 0.55, lean: 0.55 } } as const;
export const rattanBed = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), frame = K.flat(PC.rattanLo, { rough: 0.8 });
  const weave = paint(128, 128, (c, w, h) => { c.fillStyle = PC.rattan; c.fillRect(0, 0, w, h); c.strokeStyle = PC.rattanLo; c.lineWidth = 3; for (let i = -h; i < w; i += 12) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i + h, 0); c.lineTo(i, h); c.stroke(); } }, true);
  weave.repeat.set(3, 6);
  const T = BED.top, L = BED.len, W = BED.w;
  // the woven top (a thin slab with the frame round it), the legs, a stretcher between them
  P.add(K.flat("#ffffff", { map: weave, rough: 0.85 }), box(W - 0.06, 0.03, L - 0.06, 0, -0.02, 0), 0.004);
  for (const sx of [-1, 1]) P.add(frame, cylZ(0.024, L, 10).translate(sx * (W / 2 - 0.02), -0.02, 0), 0.005);
  for (const sz of [-1, 1]) P.add(frame, cylX(0.024, W, 10).translate(0, -0.02, sz * (L / 2 - 0.02)), 0.005);
  for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) P.add(frame, cylY(0.022, T - 0.04, -T, 8), 0.005, M4(sx * (W / 2 - 0.03), 0, sz * (L / 2 - 0.05)));
  for (const sx of [-1, 1]) P.add(frame, cylZ(0.014, L - 0.1, 8).translate(sx * (W / 2 - 0.03), -T + 0.12, 0), 0.004);
  // the backrest: a woven panel leaning back from the top at the head end, a rail along its top
  const bk = BED.back, ang = bk.lean, panelH = bk.h / Math.cos(ang);
  const panel = box(W - 0.08, panelH, 0.03, 0, panelH / 2, 0).rotateX(-ang).translate(0, -0.01, bk.z);
  P.add(K.flat("#ffffff", { map: weave, rough: 0.85 }), panel, 0.004);
  const topRail = V(0, -0.01 + bk.h, bk.z - Math.sin(ang) * panelH);
  P.add(frame, cylX(0.026, W, 10).translate(topRail.x, topRail.y, topRail.z), 0.005);
  for (const sx of [-1, 1]) P.add(frame, limb(V(sx * (W / 2 - 0.03), -0.02, bk.z), V(sx * (W / 2 - 0.03), topRail.y, topRail.z), 0.022, 0.022, 8), 0.005);
  P.into(g, "rattanBed");
};
/** the BAMBOO ARMCHAIR (竹椅) under the lychee tree (C; C-chair lane, 2026-11-14: Jay found him on the day bed "very
 *  off"): a Song-style chair of pale green-yellow bamboo poles with node rings (painted), a seat of split-bamboo slats
 *  (painted on one slab) in a pole frame, LOW ARMRESTS on the front posts with a spindle under each, a slat BACKREST
 *  reclined `back.lean` (15.5 deg) on the bent rear posts up to a top rail (搭脑) with knobbed ends `back.h` above the seat,
 *  stretchers low between the legs. Sizes: CHAIR (top = the seat's top, 0.35: a low lounging chair, so SU's short rig
 *  legs reach the ground from it (0.40 leaves his feet 4 cm in the air); w = between the side poles' centres, 0.58: room
 *  for his round body between the armrests; d = from the seat's front edge back to the rear posts' line, 0.38: with his
 *  back on the backrest his short thighs still reach past the front edge and the shins hang to the ground). ORIGIN = THE GROUND UNDER THE MIDDLE OF THE SEAT'S FRONT EDGE; the seat runs back
 *  toward -z and the sitter faces +z (props/index.ts chairSeat(at, rot): his feet on the ground in front of it) */
export const CHAIR = { top: 0.35, w: 0.58, d: 0.38, arm: 0.21, r: 0.02, back: { h: 0.52, lean: 0.27 } } as const;
export const bambooChair = (K: Kit, g: THREE.Group) => {
  const C = CHAIR, R: number = C.r, xs = C.w / 2, NODE = 0.17, tl = Math.tan(C.back.lean);
  // the bamboo's skin: one internode per tile of a repeating paint (a dark node ring with its pale ridge, faint streaks);
  // each pole's v is scaled to its length, so the nodes keep their spacing (NODE m) on every pole
  const skin = paint(32, 128, (c, w, h) => {
    c.fillStyle = "#d3cb84"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#c6bd74"; for (let i = 0; i < 5; i++) c.fillRect(Math.round(w * hash(i + 31)), 0, 2, h);
    c.fillStyle = "#e3dba0"; c.fillRect(0, 14, w, 8);
    c.fillStyle = "#958c4a"; c.fillRect(0, 8, w, 6);
  }, true);
  const pole = K.flat("#ffffff", { map: skin, rough: 0.55 }), knob = K.flat("#b9b066", { rough: 0.6 });
  let seed = 0;
  /** a bamboo pole from a to b (radius r) with its nodes NODE apart */
  const bam = (a: THREE.Vector3, b: THREE.Vector3, r = R) => {
    const geo = limb(a, b, r, r, 12), uv = geo.attributes.uv as THREE.BufferAttribute, k = a.distanceTo(b) / NODE, o = hash(++seed + 40);
    for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * k + o);
    return geo;
  };
  const P = new Part(K), ink = 0.004;
  const T = C.top, yF = T - 0.03, yA = T + C.arm, yT = T + C.back.h, zF = -R, zB = -C.d + R;
  /** a rear post's centre at height y (vertical up to the seat frame, then leaning back) */
  const rear = (sx: number, y: number) => V(sx * xs, y, y <= yF ? zB : zB - (y - yF) * tl);
  for (const sx of [-1, 1]) {
    P.add(pole, bam(V(sx * xs, 0, zF), V(sx * xs, yA, zF), 0.021), ink);                          // the front post (up to the arm)
    P.add(pole, bam(rear(sx, 0), rear(sx, yF)), ink);                                             // the rear leg
    P.add(pole, bam(rear(sx, yF), rear(sx, yT + 0.01)), ink);                                     // bent back: the backrest post
    P.add(knob, ball(rear(sx, yF), R * 1.12, [1, 1, 1], 12), ink);                                // the bend (a node)
    P.add(pole, bam(V(sx * xs, yA, 0.04), rear(sx, yA).add(V(0, 0, -0.02)), 0.02), ink);         // the armrest
    P.add(knob, ball(V(sx * xs, yA, 0.04), 0.024, [1, 1, 1], 12), ink);                           // its rounded front end
    P.add(pole, bam(V(sx * xs, yF, -C.d * 0.5), V(sx * xs, yA, -C.d * 0.5 + 0.005), 0.013), ink); // the spindle under it
    P.add(pole, bam(V(sx * xs, yF, zF + 0.03), V(sx * xs, yF, zB - 0.03)), ink);                  // the seat frame's side
    P.add(pole, bam(V(sx * xs, 0.19, zF), V(sx * xs, 0.19, zB), 0.014), ink);                     // the side stretcher
  }
  P.add(pole, bam(V(-xs - 0.03, yF, zF), V(xs + 0.03, yF, zF)), ink);                             // the seat frame's front
  P.add(pole, bam(V(-xs - 0.03, yF, zB), V(xs + 0.03, yF, zB)), ink);                             // ...and back
  P.add(pole, bam(V(-xs, 0.12, zF), V(xs, 0.12, zF), 0.014), ink);                                // the front stretcher
  P.add(pole, bam(V(-xs, 0.12, zB), V(xs, 0.12, zB), 0.014), ink);                                // the back stretcher
  // the seat: split-bamboo slats front to back (painted on one slab), its top at CHAIR.top, inside the pole frame
  const slats = (n: number) => paint(128, 128, (c, w, h) => {
    c.fillStyle = "#e0d49a"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { const x = (w * i) / n; c.fillStyle = "#9c9050"; c.fillRect(x, 0, 2, h); c.fillStyle = "#ece2b0"; c.fillRect(x + 3, 0, 3, h); }
    c.fillStyle = "#cdbf80"; for (let i = 0; i < 6; i++) c.fillRect(0, Math.round(h * hash(i + 61)), w, 1);
  });
  P.add(K.flat("#ffffff", { map: slats(10), rough: 0.6 }), box(C.w - 0.01, 0.024, C.d - 0.02, 0, T - 0.012, -C.d / 2), 0.003);
  // the backrest: a lower rail, a slat panel leaning back with the posts, the top rail (搭脑) with knobbed ends
  const lo = rear(1, T + 0.1), hi = rear(1, yT);
  P.add(pole, bam(V(-xs, lo.y, lo.z), V(xs, lo.y, lo.z), 0.016), ink);
  P.add(pole, bam(V(-xs - 0.05, hi.y, hi.z), V(xs + 0.05, hi.y, hi.z), 0.022), ink);
  for (const sx of [-1, 1]) P.add(knob, ball(V(sx * (xs + 0.05), hi.y, hi.z), 0.026, [1, 1, 1], 12), ink);
  const ph = (hi.y - lo.y) / Math.cos(C.back.lean);
  P.add(K.flat("#ffffff", { map: slats(7), rough: 0.6 }), box(C.w - 0.03, ph, 0.016, 0, ph / 2, 0).rotateX(-C.back.lean).translate(0, lo.y, lo.z), 0.003);
  P.into(g, "bambooChair");
};

// ===================================================================================================== D: the order
/** the order (圣旨-like scroll): a dark roller 0.42 m along x (knobs 0.46 overall), a yellow silk sheet 0.36 x 0.30 with
 *  columns of ink that unrolls down from it with put({ open: 0..1 }), a second roller at its foot. Origin = the middle of
 *  the top roller; grip pair (the roller's ends, x +-0.19) */
export const SCROLL = { w: 0.36, h: 0.3, r: 0.017, hand: 0.19 } as const;
export const scroll = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), rod = K.flat(PC.woodLo, { rough: 0.5 }), knob = K.flat(PC.gold, { rough: 0.4 }), silkM = K.flat(PC.silkLo, { rough: 0.6 });
  const top = () => { const Q = new Part(K); Q.add(rod, cylX(SCROLL.r, SCROLL.w + 0.04, 12), 0.004); for (const s of [-1, 1]) Q.add(knob, ball(V(s * (SCROLL.w / 2 + 0.03), 0, 0), 0.013, [1.2, 1, 1], 10), 0.003); Q.add(silkM, cylX(SCROLL.r + 0.012, SCROLL.w - 0.01, 14), 0.004); return Q; };
  top().into(g, "scroll");
  const sheetTex = paint(256, 224, (c, w, h) => {
    c.fillStyle = PC.silk; c.fillRect(0, 0, w, h); c.strokeStyle = PC.silkLo; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12);
    // seven columns of brush characters (three or four short strokes each), right to left, the last column short;
    // a red square seal low on the left with a pale mark in it
    c.strokeStyle = PC.ink; c.lineCap = "round"; c.lineWidth = 3.4;
    for (let col = 0; col < 7; col++) for (let k = 0; k < (col === 6 ? 3 : 7); k++) {
      const x0 = w - 42 - col * 30, y0 = 20 + k * 27, n = 3 + Math.floor(hash(col * 13 + k) * 2);
      for (let st = 0; st < n; st++) {
        const a = hash(col * 71 + k * 7 + st), b = hash(col * 37 + k * 11 + st + 3), horiz = (st + col + k) % 3 !== 1;
        c.beginPath();
        if (horiz) { c.moveTo(x0 + 2 + 6 * a, y0 + 3 + st * 5); c.lineTo(x0 + 16 + 4 * b, y0 + 4 + st * 5 + 2 * a); }
        else { c.moveTo(x0 + 4 + 10 * a, y0 + 1); c.lineTo(x0 + 3 + 10 * b, y0 + 18); }
        c.stroke();
      }
    }
    c.fillStyle = PC.red; c.fillRect(28, h - 66, 36, 36);
    c.strokeStyle = PC.silk; c.lineWidth = 3; c.strokeRect(34, h - 60, 24, 24); c.beginPath(); c.moveTo(46, h - 60); c.lineTo(46, h - 36); c.stroke();
  });
  const sheetM = K.flat("#ffffff", { map: sheetTex, rough: 0.6, side: THREE.DoubleSide });
  const sheetG = new THREE.Group(); g.add(sheetG);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(SCROLL.w, 1, 0.004).translate(0, -0.5, 0), sheetM); sheet.layers.set(NOINK); sheet.name = "scroll.sheet"; sheetG.add(sheet);
  const foot = new THREE.Group(); sheetG.add(foot); top().into(foot, "scroll.foot");
  const uv = sheet.geometry.attributes.uv as THREE.BufferAttribute, uv0 = Float32Array.from(uv.array as Float32Array);
  return (o) => {
    const k = clamp01(o.open ?? 1), hgt = Math.max(0.001, SCROLL.h * k);
    sheet.visible = k > 0.02; sheet.scale.set(1, hgt, 1);
    // the texture shows its top part only (it unrolls from the top)
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - (1 - uv0[i * 2 + 1]) * Math.max(k, 0.02));
    uv.needsUpdate = true;
    foot.position.set(0, -hgt - SCROLL.r * 0.5, 0); foot.visible = k > 0.08;
  };
};

// ===================================================================================================== E: the room
/** his writing desk (书案): plain pale wood, top 1.2 x 0.56 at 0.42 m, four square legs (layout room.ts ROOM_SET.desk:
 *  hx 0.6, hz 0.28; WP3's desk is 0.42 high, the height the rig's write pose was checked at); origin = the floor under
 *  its middle; its long side along x, the sitter behind it at -z faces +z (props/index.ts deskSeat) */
export const DESK = { w: 1.2, d: 0.56, top: 0.42, board: 0.04 } as const;
export const desk = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.woodPale, { rough: 0.6 }), lo = K.flat(PC.wood, { rough: 0.7 }), D = DESK, y0 = D.top - D.board;
  const grain = paint(256, 128, (c, ww, h) => { c.fillStyle = PC.woodPale; c.fillRect(0, 0, ww, h); c.strokeStyle = "#b8945e"; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, 8 + i * 14); c.bezierCurveTo(ww * 0.3, 12 + i * 14, ww * 0.6, 2 + i * 14, ww, 8 + i * 14); c.stroke(); } });
  P.shell([[K.flat("#ffffff", { map: grain, rough: 0.6 }), new THREE.PlaneGeometry(D.w, D.d).rotateX(-Math.PI / 2).translate(0, D.top, 0)], [w, box(D.w, D.board, D.d, 0, y0 + D.board / 2 - 0.0005, 0)]], 0.006);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(lo, box(0.045, y0, 0.045, sx * (D.w / 2 - 0.06), y0 / 2, sz * (D.d / 2 - 0.05)), 0.005);
  for (const sx of [-1, 1]) P.add(lo, box(0.03, 0.04, D.d - 0.12, sx * (D.w / 2 - 0.06), y0 - 0.03, 0), 0.004);
  P.into(g, "desk");
};
/** a square floor cushion (坐垫): 0.62 x 0.62, 0.10 high (0.12 puffed), indigo cloth with a pale edge; origin = floor */
export const CUSHION = { w: 0.62, h: 0.1 } as const;
export const cushion = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), tex = paint(128, 128, (c, w, h) => { c.fillStyle = "#3e5272"; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8c0a8"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); });
  const geo = new THREE.BoxGeometry(CUSHION.w, CUSHION.h, CUSHION.w, 6, 2, 6), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.max(Math.abs(x), Math.abs(z)) / (CUSHION.w / 2);
    pos.setY(i, y > 0 ? y + 0.018 * (1 - r * r) : y);
    const k = 1 - 0.06 * (y > 0 ? 1 : 0.4) * (r > 0.9 ? 1 : 0); pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  geo.translate(0, CUSHION.h / 2, 0); geo.computeVertexNormals();
  P.add(K.flat("#ffffff", { map: tex, rough: 0.85 }), geo, 0.006);
  P.into(g, "cushion");
};
/** a writing brush, 0.25 m: bamboo shaft, black hair tip; +y toward the tip; origin = the middle of the shaft; grip hilt
 *  (3 cm from the middle away from the tip) */
export const brush = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat(PC.bamboo), cylY(0.0075, 0.2, -0.125, 10), 0.0035);
  P.add(K.flat(PC.lac), cylY(0.008, 0.02, -0.13, 10), 0.0035);
  P.add(K.flat("#2e2a33"), turned([[0, 0.075], [0.0085, 0.075], [0.009, 0.085], [0, 0.125]], 12), 0.0035);
  P.into(g, "brush");
};
/** an ink stone (砚) with a black ink pool: 0.16 x 0.10, 0.03 high; origin = on the desk under its middle */
export const inkstone = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  P.add(K.flat("#4a4652", { rough: 0.6 }), box(0.16, 0.03, 0.1, 0, 0.015, 0), 0.004);
  P.add(K.flat("#2b2630", { rough: 0.2 }), new THREE.CircleGeometry(0.032, 20).rotateX(-Math.PI / 2).translate(-0.03, 0.0305, 0), 0);
  P.into(g, "inkstone");
};
/** the letter he writes: a sheet 0.30 x 0.22 lying on the desk (a paperweight bar along its top), columns of writing
 *  appear right to left, top to bottom, cell by cell with put({ ink: 0..1 }) (0 = blank, 1 = 8 full columns). Origin =
 *  the middle of the sheet on the desk top; the writing reads from the +z side (the desk's front): rot 0 faces the
 *  writer at -z the other way round, as on a desk seen from the front */
export const LETTER = { w: 0.3, d: 0.22, cols: 8, rows: 7 } as const;
export const letter = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K);
  P.add(K.flat(PC.paper, { rough: 0.8 }), box(LETTER.w, 0.003, LETTER.d, 0, 0.0015, 0), 0.0025);
  P.add(K.flat(PC.woodLo, { rough: 0.5 }), box(LETTER.w + 0.02, 0.014, 0.022, 0, 0.007 + 0.003, -LETTER.d / 2 + 0.014), 0.003);
  P.into(g, "letter");
  // the writing: one quad per cell (a short stroke cluster), in writing order; drawRange shows the first n
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], cw = (LETTER.w - 0.05) / LETTER.cols, ch = (LETTER.d - 0.06) / LETTER.rows;
  let q = 0;
  for (let c = 0; c < LETTER.cols; c++) for (let r = 0; r < LETTER.rows; r++) {
    // the writer sits at -z: his columns run from his top (+z far side? no: his top is the far side from him, +z) down to -z; his first column is on his right (-x)
    const x = -LETTER.w / 2 + 0.025 + (c + 0.5) * cw, z = LETTER.d / 2 - 0.035 - (r + 0.5) * ch, sx = cw * 0.32, sz = ch * 0.4, s = hash(c * 31 + r) * 0.5 + 0.5;
    const tu = (q % 8) / 8, tv = Math.floor(q / 8) % 8 / 8;
    pos.push(x - sx, 0.0032, z - sz * s, x + sx, 0.0032, z - sz * s, x + sx, 0.0032, z + sz, x - sx, 0.0032, z + sz);
    uv.push(tu, tv, tu + 0.125, tv, tu + 0.125, tv + 0.125, tu, tv + 0.125);
    idx.push(q * 4, q * 4 + 2, q * 4 + 1, q * 4, q * 4 + 3, q * 4 + 2); q++;
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const glyphs = paint(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = PC.ink; c.lineCap = "round"; c.lineWidth = 5; for (let k = 0; k < 64; k++) { const x0 = (k % 8) * 32, y0 = Math.floor(k / 8) * 32; for (let s = 0; s < 3; s++) { const a = hash(k * 7 + s), b = hash(k * 11 + s + 1); c.beginPath(); c.moveTo(x0 + 6 + 20 * a, y0 + 6 + 8 * s); c.lineTo(x0 + 26 - 18 * b, y0 + 12 + 8 * s + 6 * a); c.stroke(); } } });
  const ink = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: glyphs, transparent: true, depthWrite: false, color: "#ffffff" }));
  ink.layers.set(NOINK); ink.name = "letter.spill"; ink.renderOrder = 2; g.add(ink);
  const N = LETTER.cols * LETTER.rows;
  return (o) => { const n = Math.round(clamp01(o.ink ?? 1) * N); ink.visible = n > 0; geo.setDrawRange(0, n * 6); };
};
/** a wooden travel trunk (箱笼): 0.7 x 0.42 x 0.4 high, dark wood with iron corners; put({ open: 0..1 }) swings its lid
 *  up about the back edge to 105 deg (folded cloth shows inside). Origin = the floor under its middle; its front +z */
export const TRUNK = { w: 0.7, d: 0.42, h: 0.4, lid: 0.08 } as const;
export const trunk = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), w = K.flat(PC.woodLo, { rough: 0.7 }), iron = K.flat(PC.iron, { rough: 0.5 }), T = TRUNK, hb = T.h - T.lid;
  P.add(w, box(T.w, hb, T.d, 0, hb / 2, 0), 0.006);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(iron, box(0.05, hb + 0.004, 0.05, sx * (T.w / 2 - 0.022), hb / 2, sz * (T.d / 2 - 0.022)), 0);
  P.add(K.flat("#c8b48a", { rough: 0.9 }), box(T.w - 0.06, 0.02, T.d - 0.06, 0, hb - 0.03, 0), 0);
  P.add(K.flat("#7a8ea0", { rough: 0.9 }), softBox(0.3, 0.05, 0.26, 0.4, 3).translate(-0.12, hb - 0.012, 0), 0.003);
  P.into(g, "trunk");
  const lidG = new THREE.Group(); lidG.position.set(0, hb, -T.d / 2); g.add(lidG);
  const L = new Part(K); L.add(w, softBox(T.w, T.lid, T.d, 0.2).translate(0, T.lid / 2, T.d / 2), 0.006); L.add(iron, box(0.08, 0.04, 0.02, 0, T.lid / 2, T.d + 0.006), 0.003);
  L.into(lidG, "trunk.lid");
  return (o) => { lidG.rotation.set(-1.83 * smooth(o.open ?? 0), 0, 0); };
};
/** a stack of folded robes (three: ochre, blue-grey, rose), 0.4 x 0.3, 0.15 high; origin = under its middle */
export const robes = (K: Kit, g: THREE.Group) => {
  const P = new Part(K);
  ["#b07a42", "#7b8fa0", "#c08a8e"].forEach((c, i) => P.add(K.flat(c, { rough: 0.9 }), softBox(0.4 - i * 0.02, 0.048, 0.3 - i * 0.015, 0.5, 4).translate(0.01 * i, 0.025 + i * 0.05, -0.005 * i), 0.004));
  P.into(g, "robes");
};

// ===================================================================================================== B: 黄州
/** a wooden plough (犁): the share at the front (+z) in the ground, the curved beam up and back to the handle the
 *  ploughman holds at 0.85 m; origin = the ground under the handle's grip (where he stands in front of... behind it at
 *  -z, facing +z); grip grip (the handle, hand 1) and pair (both hands on the handle's crossbar, x +-0.12) */
export const PLOUGH = { grip: V(0, 0.85, 0), share: V(0, 0.02, 1.3), end: V(0, 0.56, 1.55) } as const;
export const plough = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat(PC.wood, { rough: 0.85 }), wLo = K.flat(PC.woodLo, { rough: 0.85 }), iron = K.flat(PC.iron, { rough: 0.45 });
  // the handle (stilt) from the grip down and forward to the sole, with its crossbar
  P.add(w, limb(V(0, 0.85, 0), V(0, 0.45, 0.16), 0.03, 0.034, 10), 0.006);
  P.add(w, limb(V(0, 0.45, 0.16), V(0, 0.1, 0.38), 0.034, 0.04, 10), 0.006);
  P.add(w, cylX(0.022, 0.3, 8).translate(0, 0.85, 0), 0.005);
  // the sole: a heavy wooden runner along the ground
  P.add(wLo, box(0.09, 0.08, 0.72, 0, 0.05, 0.68), 0.006);
  // the curved beam: up from the handle's foot, forward and up to the draught end (where the ox's trace would tie)
  P.add(w, limb(V(0, 0.22, 0.3), V(0, 0.46, 0.75), 0.032, 0.03, 10), 0.006);
  P.add(w, limb(V(0, 0.46, 0.75), V(0, 0.56, 1.55), 0.03, 0.026, 10), 0.006);
  P.add(wLo, limb(V(0, 0.08, 0.82), V(0, 0.47, 0.8), 0.022, 0.022, 8), 0.005);                 // the brace (sole to beam)
  // the iron share: a broad pointed blade at the sole's front, its tip in the ground
  P.add(iron, prism([[0, 0.075, 0.016], [0.18, 0.06, 0.012], [0.32, 0.004, 0.004]]).rotateX(Math.PI / 2 - 0.22).translate(0, 0.1, 0.98), 0.005);
  P.into(g, "plough");
};

// ===================================================================================================== G: the river
/** the river boat (乌篷船): a low wooden hull 3.6 m long x 1.0 wide (its bottom ON y 0: the water is 4 cm below), a
 *  woven black awning over the middle (z -1.0..0.1), a plank seat at the stern (BOAT.seat), a STERN OAR (橹) on a pivot
 *  on the +x rail near the stern (BOAT.oar) trailing back to the water, its handle forward (BOAT.oar + BOAT.handle) at
 *  the hands of the oarsman standing just behind the awning on the +x side (BOAT.stand); bow toward -z (it travels away
 *  from the camera side at rot 0), the stern (+z) toward her. The oar swings BOAT.swing rad about its pivot with t.
 *  Origin = the middle of its bottom at y 0. Seats: props/index.ts boatSeat (SU on the stern seat facing the stern,
 *  GUO standing at the oar behind him and to his left as we see it) */
export const BOAT = { len: 3.6, w: 1.0, deck: 0.14, rail: 0.42, seat: V(0, 0.36, 0.95), oar: V(0.45, 0.48, 1.5), handle: V(-0.03, 0.47, -0.88), stand: V(0.3, 0.14, 0.38), swing: 0.12 } as const;
/** the stern oar's swing (rad about its pivot's vertical) at time t (s); on false = still */
export const boatSwing = (t: number, on?: boolean) => (on === false ? 0 : BOAT.swing * Math.sin(TAU * 0.4 * t));
export const boat = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), hull = K.flat("#7a5a3e", { rough: 0.8 }), lo = K.flat("#5a4230", { rough: 0.8 }), deck = K.flat(PC.woodHi, { rough: 0.8 });
  // the hull: a lathe-like swept shape: rows across, pointed at both ends (more at the bow)
  const rows = 16, cols = 10, pos: number[] = [], idx: number[] = [], L = BOAT.len, Wd = BOAT.w;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows, z = -L / 2 + u * L, end = u < 0.5 ? Math.sin(Math.PI * u) ** 0.6 : Math.sin(Math.PI * u) ** 0.45, half = (Wd / 2) * end, sheer = BOAT.rail + 0.12 * (1 - Math.sin(Math.PI * u)) ** 2;
    for (let j = 0; j <= cols; j++) { const a = Math.PI * (j / cols), x = -Math.cos(a) * half, y = Math.max(0.004, sheer - Math.sin(a) * sheer * 0.98); pos.push(x, y, z); }
  }
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const A = i * (cols + 1) + j, B = A + 1, C = A + cols + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  hg.computeVertexNormals();
  P.add(hull, hg, 0);
  // the gunwales (they carry the outline), the deck boards, the stern seat
  for (const s of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= rows; i++) { const u = i / rows, end = u < 0.5 ? Math.sin(Math.PI * u) ** 0.6 : Math.sin(Math.PI * u) ** 0.45; pts.push(V(s * (Wd / 2) * end, BOAT.rail + 0.12 * (1 - Math.sin(Math.PI * u)) ** 2, -L / 2 + u * L)); }
    for (let i = 0; i < rows; i++) P.add(lo, limb(pts[i], pts[i + 1], 0.024, 0.024, 8), 0.006);
  }
  P.add(deck, box(Wd * 0.78, 0.03, L * 0.72, 0, BOAT.deck - 0.015, 0.05), 0.004);
  P.add(deck, box(Wd * 0.8, 0.05, 0.26, BOAT.seat.x, BOAT.seat.y - 0.025, BOAT.seat.z), 0.005);
  for (const sx of [-1, 1]) P.add(lo, box(0.05, BOAT.seat.y - BOAT.deck, 0.05, sx * 0.3, (BOAT.seat.y + BOAT.deck) / 2, BOAT.seat.z), 0.004);
  // the awning: a half barrel of woven black bamboo over the middle
  const aw = new THREE.CylinderGeometry(Wd * 0.46, Wd * 0.46, 1.1, 18, 1, true, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, BOAT.rail, -0.45);
  const awT = paint(64, 64, (c, w, h) => { c.fillStyle = "#3a3632"; c.fillRect(0, 0, w, h); c.fillStyle = "#4e4a44"; for (let i = 0; i < 8; i++) c.fillRect(0, i * 8, w, 3); }, true);
  P.add(K.flat("#ffffff", { map: awT, rough: 0.9, side: THREE.DoubleSide }), aw, 0.006);
  P.into(g, "boat");
  // the stern oar: a long sweep on a pivot at the stern, trailing back and down to the water, swinging with t
  const oarG = new THREE.Group(); oarG.position.copy(BOAT.oar); g.add(oarG);
  const O = new Part(K);
  O.add(lo, limb(V(0, 0, 0), V(0.02, -0.5, 1.3), 0.022, 0.02, 8), 0.005);
  O.add(K.flat(PC.woodHi), box(0.02, 0.08, 0.42, 0.02, -0.46, 1.24).rotateX(0.3), 0.004);
  O.add(lo, limb(V(0, 0, 0), BOAT.handle, 0.02, 0.018, 8), 0.005);
  O.add(lo, limb(BOAT.handle, BOAT.handle.clone().add(V(-0.1, 0, 0.02)), 0.018, 0.018, 8), 0.004);   // the grip crossbar
  O.into(oarG, "boat.oar");
  return (o) => { oarG.rotation.set(0, boatSwing(o.t ?? 0, o.on), 0); };
};

// ===================================================================================================== H: 儋州
/** a small driftwood fire: four crossed grey logs, an ember bed, flames that flicker from t (put({ t, lit })), lit
 *  0..1 = the flames' size (0 = embers only). Origin = the ground under its middle. The flames and the embers' glow are
 *  named ".flame" / ".glow" (no solid). (BEACH draws its own fire ring: this is for a fire that is a prop) */
export const FIRE = { r: 0.28, flame: 0.4 } as const;
export const fire = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), log = K.flat("#8a7e70", { rough: 0.9 }), char = K.flat("#4a3a34", { rough: 0.9 });
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.4; P.add(i % 2 ? log : char, limb(V(Math.cos(a) * FIRE.r, 0.03, Math.sin(a) * FIRE.r), V(-Math.cos(a) * 0.04, 0.13, -Math.sin(a) * 0.04), 0.035, 0.03, 8), 0.005); }
  P.into(g, "fire");
  const ember = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20).rotateX(-Math.PI / 2).translate(0, 0.012, 0), new THREE.MeshBasicMaterial({ color: "#f2702a" }));
  ember.layers.set(NOINK); ember.name = "fire.glow"; g.add(ember);
  const flames: THREE.Mesh[] = [], fm = [new THREE.MeshBasicMaterial({ color: PC.flame }), new THREE.MeshBasicMaterial({ color: PC.flameHi })];
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.ConeGeometry(0.07 - (i % 2) * 0.025, 1, 10).translate(0, 0.5, 0);
    const m = new THREE.Mesh(geo, fm[i % 2]); m.layers.set(NOINK); m.name = "fire.flame"; m.renderOrder = 3; g.add(m); flames.push(m);
  }
  return (o) => {
    const t = o.t ?? 0, k = clamp01(o.lit ?? 1);
    flames.forEach((m, i) => {
      const a = (i / 5) * TAU, wob = 0.5 + 0.5 * Math.sin(TAU * (2.3 + 0.37 * i) * t + i * 1.7), hgt = FIRE.flame * k * (0.55 + 0.45 * wob) * (i % 2 ? 0.7 : 1);
      m.visible = hgt > 0.02; m.position.set(Math.cos(a) * 0.05 * (i ? 1 : 0), 0.06, Math.sin(a) * 0.05 * (i ? 1 : 0));
      m.scale.set(1, Math.max(0.01, hgt), 1); m.rotation.set(0.12 * Math.sin(TAU * 1.3 * t + i), 0, 0.12 * Math.cos(TAU * 1.1 * t + i));
    });
  };
};
/** an oyster (生蚝): a rough grey-brown top shell over a pearly cup with the plump oyster in it, 0.11 long (along z);
 *  put({ open: 0..1 }) lifts the top shell about the hinge (-z end) to 100 deg. Origin = the hinge; grip hilt (the hinge:
 *  his hand holds that end, the cup out toward +z) */
export const OYSTER = { len: 0.11, w: 0.075 } as const;
export const oyster = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K), rough = K.flat(PC.shell, { rough: 0.95 }), pearl = K.flat(PC.pearl, { rough: 0.25 }), meat = K.flat(PC.oyster, { rough: 0.3 });
  P.add(rough, ball(V(0, -0.006, OYSTER.len / 2), 0.055, [OYSTER.w / 0.11, 0.3, 1], 16), 0.004);
  P.add(pearl, ball(V(0, 0.006, OYSTER.len / 2), 0.046, [OYSTER.w / 0.11 * 0.95, 0.12, 0.92], 16), 0);
  P.add(meat, ball(V(0, 0.011, OYSTER.len / 2 + 0.004), 0.028, [1.2, 0.35, 1.5], 12), 0.002);
  P.into(g, "oyster");
  const lidG = new THREE.Group(); g.add(lidG);
  new Part(K).add(rough, ball(V(0, 0.016, OYSTER.len / 2), 0.052, [OYSTER.w / 0.11, 0.2, 1], 16), 0.004).into(lidG, "oyster.lid");
  return (o) => { lidG.rotation.set(-1.75 * smooth(o.open ?? 0), 0, 0); };
};

// ===================================================================================================== I: 金山
/** his walking stick (拐杖): a gnarled pale-brown stick 0.9 m with a crook at the top; origin = the grip at its top; it
 *  runs down -y to its foot at -0.9 (SU_OLD's hand at about 0.85 m puts its foot on the ground); grip hilt (origin) */
export const STICK = { len: 0.9 } as const;
export const stick = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), w = K.flat("#9a7a52", { rough: 0.85 }), lo = K.flat("#7a5a3a", { rough: 0.85 });
  const pts = [V(0, 0.04, 0), V(0.005, -0.2, 0.004), V(-0.004, -0.45, -0.003), V(0.006, -0.7, 0.002), V(0, -STICK.len, 0)];
  for (let i = 0; i < pts.length - 1; i++) P.add(w, limb(pts[i], pts[i + 1], 0.014, 0.013, 8), 0.004);
  for (let i = 1; i < pts.length - 1; i++) P.add(lo, ball(pts[i], 0.016, [1, 1, 1], 8), 0.003);
  P.add(w, limb(V(0, 0.04, 0), V(0.06, 0.07, 0), 0.016, 0.014, 8), 0.004);
  P.add(lo, ball(V(0.065, 0.065, 0), 0.018, [1, 1, 1], 8), 0.004);
  P.into(g, "stick");
};

// ===================================================================================================== thrown / small
export { softBox, cylY, cylX, cylZ };
