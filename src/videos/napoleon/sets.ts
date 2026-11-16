// THE PLACES of the Napoleon film through the kit's makeSets: seven islands, one shown at a time. ARCOLE is dressed
// (the marsh, the water, the wooden bridge, powder smoke); the other six are BLOCK-OUTS until their scenes are built
// (a ground, a sky colour, one or two shapes that say where we are).
import * as THREE from "three";
import type { Kit } from "../../kit/props/kit";
import { lightRig } from "../../kit/sets/okit";
import { makeSets, BAKED_LIGHT, type PlaceDef } from "../../kit/day/sets";
import type { CastLight } from "../../videos/group/kit/cast";
import type { PlaceBuild, PlaceLook } from "../../kit/day/types";
import { PLACES, type Place } from "./story";

/** where each place's island sits on x */
export const ISLAND: Record<Place, number> = { arcole: 0, alps: 60, notredame: 120, tuileries: 180, russia: 240, waterloo: 300, helena: 360 };

type Tone = { bg: string; key: [number, number, number]; tint: [number, number, number]; k: number; hemi: [string, string, number]; keyCol: string; shade?: [number, number, number] };
const look = (t: Tone): PlaceLook => ({
  bg: t.bg,
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.5, color: "#1e1a24" },
  cast: {
    key: t.key, tint: t.tint, tintK: 0.5, gain: 0.98, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.92, 1.0],
    shade: t.shade ?? [1.04, 0.95, 1.34], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.15, sheen: 0.1, lift: 0.04, contactLen: 0.3,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: { frame: "world", stops: [[-90, [0.24, 0.23, 0.24]], [0, [0.36, 0.35, 0.34]], [90, [0.5, 0.48, 0.46]]], boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.92, 0.92, 0.95] }] },
  bloom: 0.3,
});
const TONES: Record<Place, Tone> = {
  arcole:    { bg: "#cdc3a6", key: [-0.5, 0.55, 0.65], tint: [1.0, 0.95, 0.86], k: 1.7, keyCol: "#fff0d8", hemi: ["#e0d8c0", "#5a5a44", 1.25] },
  alps:      { bg: "#cfe0ee", key: [0.5, 0.6, 0.6], tint: [0.96, 0.98, 1.0], k: 2.1, keyCol: "#ffffff", hemi: ["#e8f0f8", "#8a94a4", 1.4] },
  notredame: { bg: "#3a2428", key: [-0.3, 0.7, 0.6], tint: [1.0, 0.9, 0.78], k: 1.6, keyCol: "#ffe2b0", hemi: ["#c8a070", "#4a2a2c", 1.0] },
  tuileries: { bg: "#3c4a3e", key: [-0.55, 0.5, 0.65], tint: [1.0, 0.95, 0.86], k: 1.6, keyCol: "#ffe8c4", hemi: ["#d8cca8", "#4a4a3a", 1.1] },
  russia:    { bg: "#dfe3e8", key: [0.2, 0.7, 0.6], tint: [0.94, 0.96, 1.0], k: 1.5, keyCol: "#f4f6ff", hemi: ["#eef0f4", "#a0a6b0", 1.5] },
  waterloo:  { bg: "#6e5f5a", key: [0.7, 0.25, 0.5], tint: [1.0, 0.8, 0.62], k: 1.3, keyCol: "#ffb070", hemi: ["#a08878", "#3a3438", 0.9] },
  helena:    { bg: "#bcd4dc", key: [-0.5, 0.6, 0.6], tint: [1.0, 0.98, 0.92], k: 1.9, keyCol: "#fff8e8", hemi: ["#dce8e8", "#6a7a5a", 1.3] },
};

type G = THREE.Group;
const mk = (g: G, K: Kit) => {
  const box = (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, cast = true, rough = 0.9) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), K.flat(col, { rough }));
    m.name = name; m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
  };
  const ball = (name: string, col: string, x: number, y: number, z: number, r: number, sy = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14).scale(1, sy, 1).translate(x, y, z), K.flat(col, { rough: 1 }));
    m.name = name; m.receiveShadow = true; g.add(m); return m;
  };
  const cone = (name: string, col: string, x: number, y: number, z: number, r: number, h: number) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 14).translate(x, y + h / 2, z), K.flat(col, { rough: 1 }));
    m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  return { box, ball, cone };
};
const lights = (g: G, p: Place, x: number) => {
  const t = TONES[p];
  return lightRig(g, { dir: t.key, k: t.k, col: t.keyCol, at: [x, 0, -1.5], half: 9, hemi: t.hemi, point: { col: "#ff9a40", k: 0, at: [x, 1.2, -1.4], dist: 4 } });
};

/** ARCOLE, 15 Nov 1796: a dike beside a marsh; the Alpone's water in front (she stands on the near bank, he is hauled up
 *  the far bank out of it at z about -1.6); the wooden bridge crosses behind him, left to right, on trestles; reeds,
 *  bare poplars, powder smoke rolling over the far end. Water level y -0.05; the banks at y 0. */
export const ARCOLE = { water: -0.06, bankZ: -1.15, bridgeZ: -5.2, bridgeY: 1.25 };
const buildArcole = (K: Kit): PlaceBuild => {
  const g = new THREE.Group(); g.name = "arcole"; const x = ISLAND.arcole, { box, ball, cone } = mk(g, K);
  box("farBank", "#7c7a52", x - 30, x + 30, -0.6, 0, -40, ARCOLE.bankZ, false);
  box("nearBank", "#84805a", x - 30, x + 30, -0.6, 0, 1.4, 12, false);
  box("mud", "#6a6248", x - 30, x + 30, -0.6, -0.02, ARCOLE.bankZ, ARCOLE.bankZ + 0.35, false);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 4).rotateX(-Math.PI / 2).translate(x, ARCOLE.water, 0.2), K.flat("#6f8580", { rough: 0.35 }));
  water.name = "water"; water.receiveShadow = true; g.add(water);
  // the bridge: a plank deck on trestles with a rail, running across the frame behind him and up over the water to her right
  const bz = ARCOLE.bridgeZ, by = ARCOLE.bridgeY;
  box("deck", "#7a5c3e", x - 9, x + 9, by - 0.12, by, bz - 0.9, bz + 0.9);
  for (let i = -4; i <= 4; i++) { box(`post${i}`, "#5e452e", x + i * 2 - 0.09, x + i * 2 + 0.09, -0.3, by + 0.75, bz + 0.78, bz + 0.96); box(`postB${i}`, "#5e452e", x + i * 2 - 0.09, x + i * 2 + 0.09, -0.3, by + 0.75, bz - 0.96, bz - 0.78); }
  box("rail", "#6a4e34", x - 9, x + 9, by + 0.62, by + 0.72, bz + 0.8, bz + 0.94);
  box("railB", "#6a4e34", x - 9, x + 9, by + 0.62, by + 0.72, bz - 0.94, bz - 0.8);
  // reeds along both banks (seeded)
  const h = (n: number, k = 0) => { const s = Math.sin(n * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; i < 46; i++) { const rx = x - 7 + 14 * h(i, 1), far = i % 3 !== 0, rz = far ? ARCOLE.bankZ - 0.05 - 0.5 * h(i, 2) : 1.45 + 0.4 * h(i, 2); if (far && Math.abs(rx - x) < 1.5) continue; const m = box(`reed${i}`, i % 2 ? "#8a8a4e" : "#a09a5a", rx - 0.012, rx + 0.012, -0.1, 0.55 + 0.5 * h(i, 3), rz - 0.012, rz + 0.012, false); m.rotation.z = (h(i, 4) - 0.5) * 0.25; }
  // bare poplars and a farm roof on the far side, in haze
  for (let i = 0; i < 9; i++) cone(`poplar${i}`, "#8c8a66", x - 16 + i * 4 + 1.5 * h(i, 6), 0, -14 - 6 * h(i, 7), 0.5, 5 + 2 * h(i, 8));
  box("farm", "#a89878", x + 6, x + 9, 0, 1.6, -18, -16); cone("roof", "#8a5a48", x + 7.5, 1.6, -17, 2.4, 1.2);
  // powder smoke: soft pale balls over the far end of the bridge and behind it
  for (let i = 0; i < 12; i++) ball(`smoke${i}`, i % 2 ? "#e2dccb" : "#d6cfbd", x - 8 + 16 * h(i, 9), 1.2 + 2.2 * h(i, 10), bz - 1.5 - 4 * h(i, 11), 1.0 + 1.3 * h(i, 12), 0.7);
  lights(g, "arcole", x);
  return { group: g };
};

/** a block-out place: a ground, and a few shapes */
const blockOut = (p: Place, ground: string, dress: (g: G, K: Kit, x: number) => void) => (K: Kit): PlaceBuild => {
  const g = new THREE.Group(); g.name = p; const x = ISLAND[p], { box } = mk(g, K);
  box("ground", ground, x - 30, x + 30, -0.5, 0, -40, 12, false);
  dress(g, K, x);
  lights(g, p, x);
  return { group: g };
};
const BUILD: Record<Place, (K: Kit) => PlaceBuild> = {
  arcole: buildArcole,
  alps: blockOut("alps", "#eef2f6", (g, K, x) => { const { cone, box } = mk(g, K); for (let i = 0; i < 5; i++) cone(`peak${i}`, i % 2 ? "#dfe6ee" : "#c9d4e0", x - 16 + i * 8, 0, -22 - (i % 2) * 6, 9, 13 + (i % 3) * 3); box("cliff", "#9aa2ac", x - 30, x - 2.2, 0, 6, -30, 6, false); }),
  notredame: blockOut("notredame", "#5a3038", (g, K, x) => { const { box } = mk(g, K); box("wall", "#6a4a40", x - 12, x + 12, 0, 14, -12.2, -12, false); for (let i = -2; i <= 2; i++) box(`pillar${i}`, "#8a6a58", x + i * 4 - 0.4, x + i * 4 + 0.4, 0, 14, -11.6, -10.8); for (let i = 0; i < 4; i++) box(`step${i}`, "#8a2c38", x - 4 + i * 0.3, x + 4 - i * 0.3, i * 0.2, (i + 1) * 0.2, -5 - i * 0.5, -2.2 + 0, false); }),
  tuileries: blockOut("tuileries", "#6a4a34", (g, K, x) => { const { box } = mk(g, K); box("wall", "#3f5a48", x - 8, x + 8, 0, 5, -4.2, -4, false); box("desk", "#5e3e28", x - 1.1, x + 1.1, 0, 0.78, -2.3, -1.4); box("window", "#e8e4d0", x + 2.4, x + 3.8, 0.9, 3.6, -4.02, -3.98, false); }),
  russia: blockOut("russia", "#eef0f3", (g, K, x) => { const { cone } = mk(g, K); for (let i = 0; i < 12; i++) cone(`fir${i}`, "#5a6a62", x - 22 + i * 4, 0, -16 - (i % 3) * 5, 1.4, 6); }),
  waterloo: blockOut("waterloo", "#5a5244", (g, K, x) => { const { box } = mk(g, K); box("ridge", "#4a4438", x - 30, x + 30, 0, 1.6, -30, -18, false); }),
  helena: blockOut("helena", "#7a8a58", (g, K, x) => { const { box } = mk(g, K); box("house", "#d8ccb0", x - 6, x + 1.5, 0, 3.2, -6, -3.4); box("door", "#7a5a40", x - 1.6, x - 0.6, 0, 2.1, -3.4, -3.36, false); box("sea", "#6a94a8", x - 60, x + 60, -0.4, -0.3, -80, -30, false); for (let i = 0; i < 6; i++) box(`bean${i}`, "#5a7a3e", x + 1.2 + i * 0.45, x + 1.3 + i * 0.45, 0, 0.9, -1.7, -1.6); }),
};
const DEF = Object.fromEntries(PLACES.map((p) => [p, { look: look(TONES[p]), params: {}, build: BUILD[p] }])) as Record<Place, PlaceDef>;
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "napoleon" });
export type NapoleonSet = ReturnType<typeof buildSets>;
