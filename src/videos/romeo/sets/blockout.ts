// BLOCK-OUTS of the eight places (22 Nov 2026): grey stand-ins built from places.ts STAGE, so the film runs end to end
// before the real sets exist. A real set replaces its place's file (sets/<place>.ts exports <PLACE>: PlaceDef) and
// stops importing this. Floors at y 0, the camera side +z, everything round ISLAND[place].
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { lightRig } from "../../../kit/sets/okit";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceBuild, PlaceLook } from "../../../kit/day/types";
import { ISLAND, type Place } from "../places";

type Mood = { bg: string; floor: string; wall: string; key: string; k: number; hemi: [string, string, number]; dir: [number, number, number]; point?: { col: string; k: number; at: [number, number, number]; dist: number } };
const MOOD: Record<Place, Mood> = {
  grove: { bg: "#cfe0d6", floor: "#7d9a5c", wall: "#9fb8a4", key: "#ffe2b8", k: 2.0, hemi: ["#e8efe6", "#5e6a44", 1.3], dir: [-0.8, 0.35, 0.5] },
  hall: { bg: "#2a1c18", floor: "#7a5a44", wall: "#5e4434", key: "#ffc890", k: 1.2, hemi: ["#a08a76", "#3a2a22", 1.0], dir: [0.2, 0.7, 0.6], point: { col: "#ff9a40", k: 18, at: [0, 2.6, -1.6], dist: 9 } },
  balcony: { bg: "#1c2440", floor: "#3e4a3a", wall: "#8a7a68", key: "#b8c8ff", k: 1.3, hemi: ["#7080b0", "#202430", 0.9], dir: [-0.5, 0.6, -0.6], point: { col: "#ffb060", k: 8, at: [0, 3.6, -1.8], dist: 5 } },
  cell: { bg: "#d8cfc0", floor: "#8a7a66", wall: "#e8e0d2", key: "#fff0d8", k: 2.2, hemi: ["#f0e8dc", "#6a5a48", 1.2], dir: [0.6, 0.7, 0.4] },
  street: { bg: "#c88a70", floor: "#a08a74", wall: "#d8b890", key: "#ffb070", k: 2.4, hemi: ["#d0a0b0", "#5a4038", 1.1], dir: [0.3, 0.25, -0.9] },
  bedroom: { bg: "#1e1a26", floor: "#6a4e3c", wall: "#5a4a50", key: "#a8b8f0", k: 0.9, hemi: ["#606080", "#2a2024", 0.9], dir: [0.7, 0.5, 0.3], point: { col: "#ffa050", k: 6, at: [-0.9, 1.0, -1.2], dist: 4 } },
  mantua: { bg: "#e8e4dc", floor: "#cfc4b0", wall: "#e0d8c8", key: "#ffffff", k: 2.6, hemi: ["#f4f2ec", "#a09888", 1.5], dir: [0.1, 0.95, 0.2] },
  tomb: { bg: "#0c0a0e", floor: "#4a4440", wall: "#3a3436", key: "#ff9a50", k: 0.5, hemi: ["#403848", "#100c10", 0.6], dir: [0.4, 0.6, 0.6], point: { col: "#ff9040", k: 10, at: [-1.4, 1.9, -1.6], dist: 6 } },
};

/** the figures' light in a block-out (the template's numbers) */
const castOf = (m: Mood): CastLight => ({
  key: [-0.55, 0.5, 0.65], tint: [1.0, 0.97, 0.94], tintK: 0.55, gain: 0.98, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0],
  shade: [1.04, 0.95, 1.34], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.15, sheen: 0.1, lift: 0.04, contactLen: 0.3,
  ...BAKED_LIGHT, ...(m.bg ? {} : {}),
} as unknown as CastLight);

export const stubLook = (p: Place): PlaceLook => {
  const m = MOOD[p];
  return {
    bg: m.bg,
    ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.6, color: "#1e1a24" },
    cast: castOf(m),
    fill: { frame: "world", stops: [[-90, [0.22, 0.2, 0.19]], [0, [0.34, 0.32, 0.3]], [90, [0.46, 0.44, 0.42]]], boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.9, 0.9, 0.95] }] },
    bloom: 0.35,
  };
};

const buildStub = (p: Place) => (K: Kit): PlaceBuild => {
  const g = new THREE.Group(); g.name = `stub-${p}`; const x0 = ISLAND[p], m = MOOD[p];
  const box = (name: string, col: string, x: number, y: number, z: number, w: number, h: number, d: number, cast = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(x0 + x, y + h / 2, z), K.flat(col, { rough: 0.85 }));
    mesh.name = name; mesh.castShadow = cast; mesh.receiveShadow = true; g.add(mesh); return mesh;
  };
  const cyl = (name: string, col: string, x: number, z: number, r: number, h: number) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 16).translate(x0 + x, h / 2, z), K.flat(col, { rough: 0.9 }));
    mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh;
  };
  box("floor", m.floor, 0, -0.05, -2, 14, 0.05, 16, false);
  box("back", m.wall, 0, 0, -6.5, 14, 6, 0.2, false);
  if (p === "grove") { cyl("sycamore", "#7a6450", 0, -1.2, 0.36, 5); cyl("trunk2", "#8a7460", -2.2, -3.4, 0.25, 5); cyl("trunk3", "#8a7460", 2.4, -4.2, 0.28, 5); }
  if (p === "hall") for (const z of [-0.4, -2.4, -4.4]) { cyl(`pillarL${z}`, "#8a7058", -2.2, z, 0.22, 4); cyl(`pillarR${z}`, "#8a7058", 3.0, z, 0.22, 4); }
  if (p === "balcony") { box("houseWall", m.wall, 0, 0, -1.9, 8, 6, 0.4, false); box("balconyFloor", "#9a8a78", 0, 2.45, -1.15, 2.4, 0.15, 1.3); box("rail", "#b0a090", 0, 2.6, -0.55, 2.4, 0.95, 0.12); box("bush", "#2e4a2e", 0.3, 0, 0.9, 1.6, 0.7, 0.8); }
  if (p === "cell") { box("bench", "#6a4a30", 0.9, 0, -1.6, 1.6, 0.86, 0.9); box("wallL", m.wall, -2.6, 0, -1.5, 0.2, 3.2, 6, false); box("desk", "#5e3e28", 1.6, 0, -0.6, 0.6, 1.0, 0.5); }
  if (p === "street") { box("houseL", m.wall, -3.6, 0, -2.5, 3, 5, 8, false); box("houseR", m.wall, 3.6, 0, -2.5, 3, 5, 8, false); }
  if (p === "bedroom") { box("bed", "#7a3a3a", 0, 0, -1.65, 1.6, 0.42, 2.0); box("chest", "#5e3e28", -1.1, 0, -1.3, 0.6, 0.6, 0.45); }
  if (p === "mantua") { box("houseL", m.wall, -4.2, 0, -5, 3, 4, 14, false); box("houseR", m.wall, 4.2, 0, -5, 3, 4, 14, false); }
  if (p === "tomb") { box("bier", "#8a8278", 0, 0, -1.2, 2.0, 0.62, 0.8); box("wallL", m.wall, -3, 0, -2, 0.3, 3.4, 8, false); box("wallR", m.wall, 3, 0, -2, 0.3, 3.4, 8, false); }
  const at: [number, number, number] = [x0, 0, -1.5];
  const pt = m.point ? { ...m.point, at: [x0 + m.point.at[0], m.point.at[1], m.point.at[2]] as [number, number, number] } : undefined;
  lightRig(g, { dir: m.dir, k: m.k, col: m.key, at, half: 7, hemi: m.hemi, point: pt });
  return { group: g };
};

/** a block-out place: grey boxes round the place's marks, its time of day's light */
export const stubPlace = (p: Place): PlaceDef => ({ look: stubLook(p), params: {}, build: buildStub(p) });
