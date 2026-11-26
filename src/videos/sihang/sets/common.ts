// SHARED BUILDING BLOCKS of the three places of 采访八百壮士的一天: the paintings (concrete, sacks, crates), grain sacks in
// 3D (the walled-up windows, the barricades), kerosene lamps, and THE SOUTH BANK (the International Settlement across
// the Suzhou Creek: the film's other half, seen from the warehouse's slits, from its roof and from the bridge).
// Rules kept (src/kit/sets/okit.ts, src/kit/props/kit.ts, src/kit/fx/README.md): fine detail is paint; architecture is
// plain meshes; small loose things are props-kit Parts; glows and far cards are NOINK and unlit; seeded painting only;
// every animate is a pure function of t.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import { FONT } from "../../../kit/sets/okit";
import { maker, boxG, paint, rng, css, mix, blotch, NOINK, glowCard, makeFire, lightPool, type Mk, type Fire } from "../../romeo/sets/parts/b_common";

export { maker, boxG, paint, rng, css, mix, blotch, NOINK, glowCard, makeFire, lightPool, FONT };
export type { Mk, Fire };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export const CC = {
  concrete: "#8f8b82", concreteLo: "#77736b", concreteHi: "#a6a298", floor: "#6f6a62",
  sack: "#c8b890", sackLo: "#a89870", sackHi: "#d9cba6", wood: "#7a5a3c", woodLo: "#5c432c", woodHi: "#96724c",
  iron: "#3c3a3e", brick: "#8a4f3e", rope: "#b79f72",
} as const;

// ---------------------------------------------------------------------------------------------------- paintings
/** board-formed concrete: stains, a few cracks, form lines */
export const concreteTex = (seed: number, base: string = CC.concrete, s = 512) => paint(s, s, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 44; i++) blotch(g, W * r(), H * r(), W * (0.05 + 0.14 * r()), r() < 0.5 ? CC.concreteLo : CC.concreteHi, 0.13);
  g.strokeStyle = css("#5a564e", 0.22); g.lineWidth = 2;
  for (let y = 0; y < H; y += H / 4) { g.beginPath(); g.moveTo(0, y + 2); g.lineTo(W, y + 2); g.stroke(); }
  g.strokeStyle = css("#4a463e", 0.3); g.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) { let x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += W * 0.05 * (r() - 0.3); y += H * 0.05 * (r() - 0.2); g.lineTo(x, y); } g.stroke(); }
}, true);
/** a wall of stacked grain sacks, painted (for the big piles: `rows` x `cols` sacks to a tile) */
export const sackWallTex = (seed: number, cols = 4, rows = 8, s = 512) => paint(s, s, (g, W, H) => {
  const r = rng(seed), sw = W / cols, sh = H / rows;
  g.fillStyle = "#6e6048"; g.fillRect(0, 0, W, H);
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) {
    const x = (i + (j % 2 ? 0.5 : 0)) * sw, y = j * sh, c = mix(CC.sack, r() < 0.5 ? CC.sackLo : CC.sackHi, 0.2 + 0.5 * r());
    for (const dx of [0, W]) {
      g.fillStyle = css(c); g.beginPath(); g.roundRect(x + dx + 3, y + 2, sw - 6, sh - 4, sh * 0.42); g.fill();
      g.strokeStyle = css("#5a4c34", 0.55); g.lineWidth = 3; g.stroke();
      const gr = g.createLinearGradient(0, y, 0, y + sh); gr.addColorStop(0, "rgba(255,246,220,0.22)"); gr.addColorStop(0.5, "rgba(255,246,220,0)"); gr.addColorStop(1, "rgba(60,44,20,0.28)");
      g.fillStyle = gr; g.beginPath(); g.roundRect(x + dx + 3, y + 2, sw - 6, sh - 4, sh * 0.42); g.fill();
      if ((i + j * 3) % 4 === 0) { g.fillStyle = "rgba(150,60,40,0.4)"; g.fillRect(x + dx + sw * 0.34, y + sh * 0.36, sw * 0.3, sh * 0.1); g.fillRect(x + dx + sw * 0.34, y + sh * 0.56, sw * 0.2, sh * 0.1); }
    }
  }
}, true);
/** planks (crates, ammunition boxes) */
export const crateTex = (seed: number, base: string = CC.wood) => paint(256, 256, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { g.fillStyle = css(mix(base, r() < 0.5 ? CC.woodLo : CC.woodHi, 0.3 * r())); g.fillRect(0, (i * H) / 5 + 2, W, H / 5 - 4); }
  g.strokeStyle = css("#3a2a1c", 0.6); g.lineWidth = 3;
  for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(0, (i * H) / 5); g.lineTo(W, (i * H) / 5); g.stroke(); }
  g.fillStyle = css(CC.woodLo); g.fillRect(W * 0.08, 0, W * 0.1, H); g.fillRect(W * 0.82, 0, W * 0.1, H);
  g.fillStyle = css("#2a2018", 0.5); for (const x of [0.13, 0.87]) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(W * x, (i + 0.5) * (H / 5), 3, 0, 7); g.fill(); }
}, true);

// ---------------------------------------------------------------------------------------------------- sacks in 3D
let _sackGeo: THREE.BufferGeometry | null = null;
/** one full sack lying along x: 0.62 x 0.17 x 0.36 (a squashed ball, flat enough to stack) */
export const sackGeo = () => (_sackGeo ??= (() => { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(0.335, 0.098, 0.2); return g; })());
export const SACK = { len: 0.63, h: 0.15, deep: 0.36 } as const;
/** STACKS SACKS into a Part: rows from y0 up, along x (or along z when `alongZ`), each row offset half a sack. `skip(row, i)`
 *  leaves a sack out (the slit). Three sack tones by position. */
export const stackSacks = (P: Part, mats: THREE.Material[], o: { x0: number; x1: number; y0: number; rows: number; z: number; alongZ?: boolean; skip?: (row: number, i: number, cx: number) => boolean; seed?: number; jit?: number }) => {
  const r = rng(o.seed ?? 7), n = Math.max(1, Math.round((o.x1 - o.x0) / SACK.len)), step = (o.x1 - o.x0) / n, jit = o.jit ?? 0.02;
  for (let row = 0; row < o.rows; row++) {
    const off = row % 2 ? 0.5 : 0;
    for (let i = -1; i <= n; i++) {
      const cx = o.x0 + (i + 0.5 + off) * step;
      if (cx < o.x0 + step * 0.2 || cx > o.x1 - step * 0.2) continue;
      if (o.skip?.(row, i, cx)) { r(); r(); r(); continue; }
      const m = new THREE.Matrix4().makeRotationY((o.alongZ ? Math.PI / 2 : 0) + (r() - 0.5) * 0.08);
      const y = o.y0 + (row + 0.5) * SACK.h, a = cx + (r() - 0.5) * jit, b = o.z + (r() - 0.5) * jit;
      m.setPosition(o.alongZ ? b : a, y, o.alongZ ? a : b);
      const sc = new THREE.Matrix4().makeScale(step / SACK.len * 1.02, 1, 1);
      P.add(mats[(row * 3 + i * 5 + 100) % mats.length], sackGeo(), 0.007, m.multiply(sc));
    }
  }
};
export const sackMats = (K: Kit) => [CC.sack, CC.sackLo, CC.sackHi, "#bfae84"].map((c) => K.flat(c, { rough: 0.95 }));

// ---------------------------------------------------------------------------------------------------- lamps
/** A KEROSENE LANTERN (hurricane lamp) standing at `at`: a tin base, a glass chimney with the flame, a cap and a wire
 *  handle; its halo and the pool it throws on the floor / crate. animate(t) flickers; face(cam) turns the cards. */
export const makeLantern = (P: Part, K: Kit, group: THREE.Group, at: THREE.Vector3, ph: number, o: { pool?: number; poolAt?: number; hang?: boolean } = {}) => {
  const tin = K.flat("#5c6a66", { rough: 0.5 }), glass = new THREE.MeshBasicMaterial({ color: "#ffd9a0", transparent: true, opacity: 0.42, depthWrite: false });
  const m = new THREE.Matrix4().setPosition(at.x, at.y, at.z);
  P.add(tin, new THREE.CylinderGeometry(0.055, 0.065, 0.05, 12).translate(0, 0.025, 0), 0.005, m);
  P.add(tin, new THREE.CylinderGeometry(0.03, 0.045, 0.03, 12).translate(0, 0.19, 0), 0.005, m);
  P.add(tin, new THREE.TorusGeometry(0.075, 0.006, 6, 16).translate(0, 0.16, 0), 0.003, m);
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.045, 0.13, 12).translate(at.x, at.y + 0.115, at.z), glass); ch.layers.set(NOINK); ch.name = "lamp.glass"; ch.renderOrder = 3; group.add(ch);
  const fire = makeFire(V(at.x, at.y + 0.075, at.z), 0.06, ph, { halo: 0.5, haloA: 0.5, col: "#ffb45a" }); fire.group.name = "lamp.flame"; group.add(fire.group);
  const poolY = o.poolAt ?? 0.002;
  const pool = lightPool(V(at.x, poolY, at.z), V(0, 1, 0), o.pool ?? 3.4, o.pool ?? 3.4, "#ffb060", 0.26); pool.name = "lamp.pool"; group.add(pool); fire.pools.push(pool);
  return fire;
};

// ---------------------------------------------------------------------------------------------------- the south bank
export type BankMode = "night" | "day" | "dawn" | "dusk" | "siege";
const BANK: Record<BankMode, { sky: [string, string]; build: string; water: string; lit: number; neon: number; crowd: number; quay: string }> = {
  night: { sky: ["#0b1024", "#1c2440"], build: "#232a44", water: "#0c1222", lit: 1, neon: 1, crowd: 0.25, quay: "#1e2338" },
  dusk: { sky: ["#2a3052", "#8a5f5a"], build: "#4a4a62", water: "#262c44", lit: 0.7, neon: 0.8, crowd: 0.6, quay: "#3a3c52" },
  day: { sky: ["#b9c6d4", "#e2e0d6"], build: "#ffffff", water: "#7a8a8e", lit: 0, neon: 0, crowd: 1, quay: "#b9b4a6" },
  dawn: { sky: ["#5d6a82", "#d9b79a"], build: "#9aa3b4", water: "#4a566a", lit: 0.15, neon: 0, crowd: 0.7, quay: "#7f8494" },
  siege: { sky: ["#07091a", "#191c30"], build: "#161a2c", water: "#080c18", lit: 0.25, neon: 0.15, crowd: 0, quay: "#141826" },
};
/** the blackboards the people of the south bank held up for the defenders (chalk on black) */
export const BOARDS = ["", "敌在北站以东集结", "同胞与你们同在"] as const;
const SIGNS: { text: string; col: [number, number, number]; x: number; y: number; h: number; horiz?: boolean }[] = [
  { text: "大饭店", col: [2.6, 0.5, 0.35], x: -16.5, y: 7.4, h: 7.5 }, { text: "百货公司", col: [0.45, 1.5, 2.6], x: -4.2, y: 9.5, h: 9 },
  { text: "茶楼", col: [2.4, 1.6, 0.4], x: 3.4, y: 5.2, h: 4.6 }, { text: "药房", col: [0.5, 2.3, 1.1], x: 9.6, y: 6.2, h: 4.6 },
  { text: "舞厅", col: [2.6, 0.45, 1.3], x: 17.5, y: 8.2, h: 5.2 }, { text: "旅社", col: [2.5, 0.7, 0.3], x: 26, y: 6, h: 4.4 }, { text: "电影", col: [0.5, 1.4, 2.6], x: -27, y: 6.6, h: 4.6 },
];
const facadeTex = (seed: number, floors: number, bays: number, base: string, trim: string) => paint(512, 512, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 20; i++) blotch(g, W * r(), H * r(), W * 0.2, r() < 0.5 ? "#8a8474" : "#efe8d8", 0.1);
  const fh = (H * 0.9) / floors, bw = W / bays;
  for (let j = 0; j < floors; j++) {
    const y = H * 0.04 + j * fh;
    g.fillStyle = css(trim, 0.8); g.fillRect(0, y + fh * 0.92, W, fh * 0.08);
    for (let i = 0; i < bays; i++) {
      const x = i * bw + bw * 0.22, ww = bw * 0.56, wh = fh * 0.56;
      g.fillStyle = "#3a4250"; g.fillRect(x, y + fh * 0.2, ww, wh);
      g.strokeStyle = css(trim); g.lineWidth = 3; g.strokeRect(x, y + fh * 0.2, ww, wh);
      g.beginPath(); g.moveTo(x + ww / 2, y + fh * 0.2); g.lineTo(x + ww / 2, y + fh * 0.2 + wh); g.stroke();
      if (j === floors - 1 || (j + i) % 3 === 0) { g.fillStyle = css(trim, 0.9); g.fillRect(x - 4, y + fh * 0.76, ww + 8, fh * 0.07); }     // a balcony slab
    }
  }
  g.fillStyle = css(trim); g.fillRect(0, 0, W, H * 0.035);
});
/** the same facade's lit windows at night (additive): warm panes, some dark */
const litTex = (seed: number, floors: number, bays: number) => paint(256, 256, (g, W, H) => {
  const r = rng(seed + 50);
  g.clearRect(0, 0, W, H); g.fillStyle = "#000000"; g.fillRect(0, 0, W, H);
  const fh = (H * 0.9) / floors, bw = W / bays;
  for (let j = 0; j < floors; j++) for (let i = 0; i < bays; i++) {
    if (r() < 0.42) continue;
    const x = i * bw + bw * 0.22, y = H * 0.04 + j * fh;
    g.fillStyle = css(r() < 0.75 ? "#ffcf86" : "#cfe2ff", 0.55 + 0.4 * r()); g.fillRect(x, y + fh * 0.2, bw * 0.56, fh * 0.56);
  }
});
const crowdTex = (seed: number, n: number, w = 1024, h = 96) => paint(w, h, (g, W, H) => {
  const r = rng(seed);
  g.clearRect(0, 0, W, H);
  const cols = ["#3a3f4a", "#56493e", "#6e6a62", "#2e3440", "#7c5a4a", "#4a5648", "#8a8272", "#404a5e", "#9a8f7e"];
  for (let k = 0; k < n; k++) {
    const x = W * r(), hgt = H * (0.5 + 0.22 * r()), bw = H * (0.2 + 0.07 * r()), y = H - hgt * (0.72 + 0.28 * r());
    g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.roundRect(x - bw / 2, y + bw * 0.5, bw, H, bw * 0.4); g.fill();
    g.fillStyle = ["#e9c9a4", "#dcb891", "#f0d2b0"][(r() * 3) | 0]; g.beginPath(); g.arc(x, y + bw * 0.28, bw * 0.34, 0, 7); g.fill();
    if (r() < 0.55) { g.fillStyle = ["#2a2622", "#5a5046", "#8a7f6c", "#d9d2c0"][(r() * 4) | 0]; g.beginPath(); g.ellipse(x, y + bw * 0.08, bw * 0.46, bw * 0.16, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x, y + bw * 0.02, bw * 0.28, Math.PI, 0); g.fill(); }
  }
});
const boardTex = (text: string) => paint(1024, 256, (g, W, H) => {
  g.fillStyle = "#1d2422"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#7a5a3c"; g.lineWidth = 22; g.strokeRect(11, 11, W - 22, H - 22);
  g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % H, 120, 6);
  g.fillStyle = "#f2efe6"; g.textAlign = "center"; g.textBaseline = "middle";
  const px = Math.min(H * 0.62, (W * 0.88) / Math.max(1, text.length));
  g.font = `700 ${px}px ${FONT}`; g.fillText(text, W / 2, H / 2 + px * 0.04);
});
const signTex = (text: string) => paint(128, 128 * Math.max(1, text.length), (g, W, H) => {
  g.clearRect(0, 0, W, H); g.fillStyle = "#000000"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12);
  g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${W * 0.74}px ${FONT}`;
  [...text].forEach((ch, i) => g.fillText(ch, W / 2, (i + 0.5) * (H / text.length) + W * 0.03));
});
const streakTex = () => paint(32, 256, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  for (let y = 0; y < H; y += 6) { const k = 1 - y / H; g.fillStyle = `rgba(255,255,255,${(0.8 * k * k * (0.55 + 0.45 * Math.sin(y * 0.9))).toFixed(3)})`; g.fillRect(W * 0.15 * (1 - k), y, W * (0.7 + 0.3 * (1 - k)), 4); }
});
const skyTex = () => paint(8, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#000000"); gr.addColorStop(1, "#ffffff"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });

export type Bank = { group: THREE.Group; setMode(m: BankMode): void; setBoard(n: number): void; setCheer(k: number): void; animate(t: number): void; skyCol(m: BankMode): string };
/** THE SOUTH BANK, built round x = ox with the warehouse's south face at z = zs (everything further south is at smaller
 *  z). Ground level y = base (the roof looks down on it: base = -(the roof's height)). Unlit cards and boxes, all NOINK. */
export const buildBank = (ox: number, zs: number, base = 0, o: { gap?: number } = {}): Bank => {
  const gap = o.gap ?? 0;
  const group = new THREE.Group(); group.name = "bank.far";
  const basic = (c: string, o: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color: c, fog: false, ...o });
  const add = <T extends THREE.Object3D>(m: T, name: string) => { m.name = name; m.traverse((q) => q.layers.set(NOINK)); (m as unknown as THREE.Mesh).castShadow = false; (m as unknown as THREE.Mesh).receiveShadow = false; group.add(m); return m; };
  const zq = zs - 56, zb = zs - 63;     // the far quay's face, the buildings' fronts
  // the near road (光复路) and its kerb, the water, the far quay and its road
  const mRoad = basic("#4a4a4c"), mWater = basic("#0c1222"), mQuay = basic("#1e2338");
  add(new THREE.Mesh(new THREE.PlaneGeometry(160, 6).rotateX(-Math.PI / 2).translate(ox, base - 0.02, zs - 3), mRoad), "bank.road");
  add(new THREE.Mesh(boxG(ox - 80, ox + 80, base - 3, base + 0.35, zs - 6.3, zs - 6), mQuay), "bank.kerb");
  add(new THREE.Mesh(new THREE.PlaneGeometry(200, 52).rotateX(-Math.PI / 2).translate(ox, base - 2.6, zs - 31), mWater), "bank.water");
  add(new THREE.Mesh(boxG(ox - 90, ox + 90, base - 3, base + 0.15, zq - 7, zq), mQuay), "bank.quay");
  // the sky behind everything
  const mSky = new THREE.ShaderMaterial({
    uniforms: { uA: { value: new THREE.Color("#0b1024") }, uB: { value: new THREE.Color("#1c2440") } }, fog: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 uA; uniform vec3 uB; varying vec2 vUv; void main(){ gl_FragColor = vec4(mix(uB, uA, smoothstep(0.0, 0.75, vUv.y)), 1.0); }",
  });
  void skyTex;
  add(new THREE.Mesh(new THREE.PlaneGeometry(1600, 150).translate(ox, base + 55, zb - 40), mSky), "bank.sky");
  // the buildings: a row of blocks of different heights (their fronts painted), a gas holder at the east end
  const r = rng(1937), builds: { m: THREE.MeshBasicMaterial; lit: THREE.MeshBasicMaterial }[] = [];
  let x = -64;
  const tops: [number, number, number][] = [];
  for (let k = 0; x < 64; k++) {
    const w = 8 + 9 * r(), hgt = 9 + 16 * r(), floors = Math.max(3, Math.round(hgt / 3.4)), bays = Math.max(3, Math.round(w / 2.6));
    if (gap && x < gap && x + w > -gap) { x = gap; continue; }     // the street the bridge runs into stays open
    const base0 = ["#cfc6b2", "#b9ad98", "#d8ccb4", "#a89c8c", "#c2b6a6"][k % 5], trim = ["#8a7f6e", "#6e665a", "#9a8e7a"][k % 3];
    const m = basic("#ffffff", { map: facadeTex(100 + k, floors, bays, base0, trim) });
    add(new THREE.Mesh(new THREE.PlaneGeometry(w, hgt).translate(ox + x + w / 2, base + hgt / 2 + 0.15, zb), m), "bank.building");
    const side = basic(base0); add(new THREE.Mesh(boxG(ox + x, ox + x + w, base + 0.15, base + hgt + 0.15, zb - 9, zb - 0.02), side), "bank.block");
    const lit = basic("#ffffff", { map: litTex(100 + k, floors, bays), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 1 });
    const lm = add(new THREE.Mesh(new THREE.PlaneGeometry(w, hgt).translate(ox + x + w / 2, base + hgt / 2 + 0.15, zb + 0.03), lit), "bank.lit"); lm.renderOrder = 2;
    builds.push({ m, lit }); builds.push({ m: side, lit });
    tops.push([x + w / 2, hgt, w]);
    x += w + (r() < 0.25 ? 2.5 : 0.15);
  }
  // the gas holder (the big tank that stood on the south bank, the reason heavy guns were not turned on the warehouse)
  const mTank = basic("#5c6068");
  add(new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 20, 28, 1, true).translate(ox + 47, base + 10, zb - 16), mTank), "bank.tank");
  // neon signs: a board, the lit letters (HDR colour: they bloom), a halo, and their streak on the water
  const neon: { m: THREE.MeshBasicMaterial; col: [number, number, number]; halo: THREE.MeshBasicMaterial; streak: THREE.MeshBasicMaterial; ph: number }[] = [];
  const stk = streakTex(), signboards: THREE.MeshBasicMaterial[] = [];
  SIGNS.forEach((s, i) => {
    const n = s.text.length, w = s.h / n;
    const m = basic("#ffffff", { map: signTex(s.text), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const sm = add(new THREE.Mesh(new THREE.PlaneGeometry(w, s.h).translate(ox + s.x, base + s.y + s.h / 2, zb + 0.5), m), "bank.neon"); sm.renderOrder = 3;
    const sb = basic("#20222a", { map: m.map }); signboards.push(sb);
    add(new THREE.Mesh(new THREE.PlaneGeometry(w * 1.1, s.h * 1.03).translate(ox + s.x, base + s.y + s.h / 2, zb + 0.45), sb), "bank.signboard");
    const halo = basic("#ffffff", { map: (glowCard(1, "#ffffff", 1).material as THREE.MeshBasicMaterial).map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4 });
    const hm = add(new THREE.Mesh(new THREE.PlaneGeometry(w * 5, s.h * 1.7).translate(ox + s.x, base + s.y + s.h / 2, zb + 0.55), halo), "bank.neonglow"); hm.renderOrder = 3;
    const streak = basic("#ffffff", { map: stk, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 });
    const st = add(new THREE.Mesh(new THREE.PlaneGeometry(w * 1.3, 30).rotateX(-Math.PI / 2).translate(ox + s.x, base - 2.55, zq + 15.5), streak), "bank.streak"); st.renderOrder = 3;
    neon.push({ m, col: s.col, halo, streak, ph: i * 1.7 });
  });
  // the crowd: a painted strip along the far quay's rail, strips on three low roofs, and wavers (hats, handkerchiefs)
  const crowdMats: THREE.MeshBasicMaterial[] = [];
  const strip = (cx: number, y: number, z: number, w: number, h: number, seed: number, n: number) => {
    const m = basic("#ffffff", { map: crowdTex(seed, n), transparent: true, alphaTest: 0.3 });
    add(new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(ox + cx, base + y + h / 2, z), m), "bank.crowd"); crowdMats.push(m);
  };
  // (a bridge lands on the quay: `gap` m either side of x 0 stay clear of the rail and the crowd)
  for (const sgn of [-1, 1]) add(new THREE.Mesh(boxG(ox + (sgn < 0 ? -90 : gap), ox + (sgn < 0 ? -gap : 90), base + 0.15, base + 1.15, zq - 0.25, zq - 0.1), basic("#3a3c44")), "bank.rail");
  strip(-29 - gap, 0.15, zq - 0.4, 56, 2.3, 11, 170); strip(29 + gap, 0.15, zq - 0.4, 56, 2.3, 12, 170);
  strip(-29 - gap, 0.15, zq - 1.6, 56, 2.6, 13, 150); strip(29 + gap, 0.15, zq - 1.6, 56, 2.6, 14, 150);
  const lowRoofs = tops.filter(([, h]) => h < 17).slice(0, 5);
  lowRoofs.forEach(([cx, h, w], i) => strip(cx, h + 0.15, zb - 0.6, w * 0.92, 1.9, 20 + i, Math.round(w * 2.4)));
  // the wavers: small cards over the crowd that bob and tip (white handkerchiefs, dark hats, straw hats)
  const NW = 90, wav = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 0.34), basic("#ffffff", { side: THREE.DoubleSide }), NW);
  const wr = rng(77), wb: { x: number; y: number; z: number; ph: number; sp: number; amp: number }[] = [];
  for (let i = 0; i < NW; i++) {
    const onRoof = i % 6 === 0 && lowRoofs.length > 0, lr = lowRoofs[i % Math.max(1, lowRoofs.length)];
    wb.push(onRoof ? { x: lr[0] + (wr() - 0.5) * lr[2] * 0.8, y: lr[1] + 2.0, z: zb - 0.5, ph: wr() * 7, sp: 5 + 4 * wr(), amp: 0.3 + 0.3 * wr() }
      : { x: ((q) => (gap && Math.abs(q) < gap + 1 ? Math.sign(q || 1) * (gap + 1 + Math.abs(q)) : q))((wr() - 0.5) * 110), y: 2.35 + 0.5 * wr(), z: zq - 0.35 - 1.2 * (i % 2), ph: wr() * 7, sp: 5 + 4 * wr(), amp: 0.3 + 0.35 * wr() });
    wav.setColorAt(i, new THREE.Color(["#f4f0e6", "#f4f0e6", "#2e2a28", "#cdb98a", "#ffffff"][i % 5]));
  }
  wav.instanceMatrix.setUsage(THREE.DynamicDrawUsage); add(wav, "bank.wavers"); wav.frustumCulled = false;
  // THE PEOPLE STRAIGHT ACROSS (the lens punches in on them): a sharper strip in front of the long ones
  { const m = basic("#ffffff", { map: crowdTex(31, 46, 2048, 256), transparent: true, alphaTest: 0.3 }); add(new THREE.Mesh(new THREE.PlaneGeometry(18, 2.5).translate(ox + (gap ? gap + 10 : 0), base + 0.15 + 1.25, zq - 0.3), m), "bank.crowd"); crowdMats.push(m); }
  // THE BLACKBOARD: held up over the heads on the quay, straight across from the warehouse
  const bx = gap ? gap + 10 : 0;
  const boardMats = BOARDS.map((t) => (t ? basic("#ffffff", { map: boardTex(t) }) : null));
  const board = add(new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.4).translate(ox + bx, base + 0.15 + 4.1, zq - 0.9), boardMats[1]!), "bank.board");
  const legs = [-1, 1].map((sg) => add(new THREE.Mesh(boxG(ox + bx + sg * 4.2 - 0.08, ox + bx + sg * 4.2 + 0.08, base + 0.15, base + 0.15 + 2.9, zq - 1.0, zq - 0.9), basic("#5c432c")), "bank.boardleg"));
  board.visible = false; for (const l of legs) l.visible = false;
  let mode: BankMode = "night", cheer = 0;
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  const api: Bank = {
    group,
    skyCol: (m) => BANK[m].sky[1],
    setMode(m) {
      mode = m; const B = BANK[m];
      (mSky.uniforms.uA.value as THREE.Color).set(B.sky[0]); (mSky.uniforms.uB.value as THREE.Color).set(B.sky[1]);
      mWater.color.set(B.water); mQuay.color.set(B.quay); mRoad.color.set(B.quay).multiplyScalar(1.15);
      for (const b of builds) { b.m.color.set(B.build); b.lit.opacity = B.lit; b.lit.visible = B.lit > 0.01; }
      mTank.color.set(B.build).multiplyScalar(0.55);
      for (const n of neon) { n.m.visible = n.halo.visible = n.streak.visible = B.neon > 0.01; }
      for (const sb of signboards) sb.color.set(m === "day" ? "#b4ada0" : m === "dawn" ? "#6e7078" : "#22242c");
      for (const c of crowdMats) { c.visible = B.crowd > 0.01; c.color.set(col.set(B.build).lerp(new THREE.Color("#ffffff"), m === "day" ? 1 : 0.35)); }
      wav.visible = B.crowd > 0.5;
      (boardMats.filter(Boolean) as THREE.MeshBasicMaterial[]).forEach((bm) => bm.color.set(m === "day" ? "#ffffff" : m === "dawn" ? "#c9cfdb" : "#8a90a4"));
    },
    setBoard(n) { const bm = boardMats[n]; board.visible = !!bm; for (const l of legs) l.visible = !!bm; if (bm) board.material = bm; },
    setCheer(k) { cheer = k; },
    animate(t) {
      const B = BANK[mode];
      for (const n of neon) {
        const fl = 0.9 + 0.1 * Math.sin(t * 7.3 + n.ph) * Math.sin(t * 1.9 + n.ph * 2.1), k = B.neon * fl;
        n.m.color.setRGB(n.col[0] * k, n.col[1] * k, n.col[2] * k);
        n.halo.color.setRGB(n.col[0] * 0.4, n.col[1] * 0.4, n.col[2] * 0.4); n.halo.opacity = 0.42 * k;
        n.streak.color.setRGB(n.col[0] * 0.5, n.col[1] * 0.5, n.col[2] * 0.5); n.streak.opacity = 0.5 * k * (0.85 + 0.15 * Math.sin(t * 2.3 + n.ph));
      }
      if (wav.visible) {
        const live = 0.35 + 0.65 * cheer;
        for (let i = 0; i < NW; i++) {
          const w = wb[i], s = Math.sin(t * w.sp * (0.6 + 0.6 * live) + w.ph);
          dummy.position.set(ox + w.x + 0.25 * s * w.amp, base + w.y + 0.15 + 0.35 * Math.abs(s) * w.amp * (0.4 + live), w.z);
          dummy.rotation.set(0, 0, 0.7 * s); dummy.scale.setScalar(i % 9 < live * 9 ? 1 : 0.001); dummy.updateMatrix(); wav.setMatrixAt(i, dummy.matrix);
        }
        wav.instanceMatrix.needsUpdate = true;
      }
    },
  };
  api.setMode("night");
  return api;
};
