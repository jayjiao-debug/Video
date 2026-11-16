// THE PLACES of the Napoleon film through the kit's makeSets: eight islands, one shown at a time (script_v2: the Alps,
// Notre-Dame, the camp before Austerlitz, the Tuileries, Russia, Laffrey, Waterloo, Saint Helena). Each is a few plain
// shapes that say where we are; she stands near (X, 1.5, +2) looking toward -z, the action is around z -1.5 .. -3.
import * as THREE from "three";
import type { Kit } from "../../kit/props/kit";
import { lightRig } from "../../kit/sets/okit";
import { makeSets, BAKED_LIGHT, type PlaceDef } from "../../kit/day/sets";
import type { CastLight } from "../../videos/group/kit/cast";
import type { PlaceBuild, PlaceLook } from "../../kit/day/types";
import { PLACES, type Place } from "./story";

/** where each place's island sits on x */
export const ISLAND: Record<Place, number> = { alps: 0, notredame: 60, camp: 120, tuileries: 180, russia: 240, laffrey: 300, waterloo: 360, helena: 420 };

type Tone = { bg: string; key: [number, number, number]; tint: [number, number, number]; k: number; hemi: [string, string, number]; keyCol: string; shade?: [number, number, number]; fire?: number; bloom?: number };
const look = (t: Tone): PlaceLook => ({
  bg: t.bg,
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.5, color: "#1e1a24" },
  cast: {
    key: t.key, tint: t.tint, tintK: 0.5, gain: 0.98, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.92, 1.0],
    shade: t.shade ?? [1.04, 0.95, 1.34], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.15, sheen: 0.1, lift: 0.04, contactLen: 0.3,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: { frame: "world", stops: [[-90, [0.24, 0.23, 0.24]], [0, [0.36, 0.35, 0.34]], [90, [0.5, 0.48, 0.46]]], boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.92, 0.92, 0.95] }] },
  bloom: t.bloom ?? 0.3,
});
const TONES: Record<Place, Tone> = {
  alps:      { bg: "#c4d6e6", key: [0.5, 0.6, 0.6], tint: [0.96, 0.98, 1.0], k: 2.0, keyCol: "#ffffff", hemi: ["#e8f0f8", "#8a94a4", 1.4] },
  notredame: { bg: "#241418", key: [-0.3, 0.7, 0.6], tint: [1.0, 0.88, 0.72], k: 1.5, keyCol: "#ffdca0", hemi: ["#c89a68", "#3a2024", 0.95], fire: 5, bloom: 0.55 },
  camp:      { bg: "#10182c", key: [-0.4, 0.5, 0.7], tint: [1.0, 0.82, 0.62], k: 0.9, keyCol: "#ffb468", hemi: ["#56669a", "#1a1c2c", 0.85], fire: 9, bloom: 0.7, shade: [0.8, 0.9, 1.5] },
  tuileries: { bg: "#2c3a30", key: [-0.55, 0.5, 0.65], tint: [1.0, 0.95, 0.86], k: 1.6, keyCol: "#ffe8c4", hemi: ["#d8cca8", "#4a4a3a", 1.1] },
  russia:    { bg: "#d9dde3", key: [0.2, 0.7, 0.6], tint: [0.94, 0.96, 1.0], k: 1.3, keyCol: "#f4f6ff", hemi: ["#eef0f4", "#a0a6b0", 1.5] },
  laffrey:   { bg: "#bcd2e2", key: [-0.5, 0.6, 0.6], tint: [1.0, 0.98, 0.92], k: 1.9, keyCol: "#fff6e0", hemi: ["#dce8f0", "#6a7a5a", 1.3] },
  waterloo:  { bg: "#7a5a4e", key: [0.7, 0.22, 0.5], tint: [1.0, 0.78, 0.6], k: 1.4, keyCol: "#ffa868", hemi: ["#a88474", "#3a3034", 0.9] },
  helena:    { bg: "#b8d2dc", key: [-0.5, 0.6, 0.6], tint: [1.0, 0.98, 0.92], k: 1.9, keyCol: "#fff8e8", hemi: ["#dce8e8", "#6a7a5a", 1.3] },
};

type G = THREE.Group;
const glow = (col: [number, number, number]) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(col[0], col[1], col[2]) }); m.toneMapped = false; return m; };
const mk = (g: G, K: Kit) => {
  const box = (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, cast = true, rough = 0.9) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), K.flat(col, { rough }));
    m.name = name; m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
  };
  const ball = (name: string, col: string, x: number, y: number, z: number, r: number, sy = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14).scale(1, sy, 1).translate(x, y, z), K.flat(col, { rough: 1 }));
    m.name = name; m.receiveShadow = true; g.add(m); return m;
  };
  const cone = (name: string, col: string, x: number, y: number, z: number, r: number, h: number, seg = 14) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg).translate(x, y + h / 2, z), K.flat(col, { rough: 1 }));
    m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  const cyl = (name: string, col: string, x: number, y0: number, y1: number, z: number, r: number, seg = 16) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, seg).translate(x, (y0 + y1) / 2, z), K.flat(col, { rough: 0.9 }));
    m.name = name; m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  /** a flame (unlit, bright enough to bloom) */
  const flame = (name: string, x: number, y: number, z: number, r: number) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.6, 8).translate(x, y + r * 1.3, z), glow([2.4, 1.3, 0.35])); m.name = name; g.add(m);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, r * 1.5, 8).translate(x, y + r * 0.8, z), glow([2.6, 2.2, 1.2])); c.name = name + "c"; g.add(c);
    return m;
  };
  return { box, ball, cone, cyl, flame };
};
const h01 = (n: number, k = 0) => { const s = Math.sin(n * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
const lights = (g: G, p: Place, x: number, fireAt: [number, number, number] = [0, 1.2, -1.4]) => {
  const t = TONES[p];
  return lightRig(g, { dir: t.key, k: t.k, col: t.keyCol, at: [x, 0, -1.5], half: 9, hemi: t.hemi, point: { col: "#ff9a40", k: t.fire ?? 0, at: [x + fireAt[0], fireAt[1], fireAt[2]], dist: 9 } });
};
const place = (p: Place, dress: (g: G, K: Kit, x: number, m: ReturnType<typeof mk>) => [number, number, number] | void) => (K: Kit): PlaceBuild => {
  const g = new THREE.Group(); g.name = p; const x = ISLAND[p];
  const fire = dress(g, K, x, mk(g, K));
  lights(g, p, x, fire ?? undefined);
  return { group: g };
};

/** THE ALPS, May 1800: a snow path along a rock wall (the wall behind him, z < -3.4), the drop on her side; peaks. He
 *  rides along z = ALPS.pathZ from her left to her right. */
export const ALPS = { pathZ: -1.7 };
/** NOTRE-DAME: the carpet runs toward her; the altar steps at z -4; candles both sides */
export const NOTREDAME = { stepZ: -3.4, top: 0.48 };
/** THE CAMP: the fire at (X - 1.6, -2.6); the hill of bivouacs behind, where the torches light */
export const CAMP = { fire: [-1.7, 0, -2.7] as [number, number, number], torches: 46 };
/** THE TUILERIES: his desk mid-room, three clerks' desks along the back wall, the card table at her right */
export const TUILERIES = { desk: [-0.2, -2.6] as [number, number], clerks: [[-2.6, -4.2], [0, -4.6], [2.6, -4.2]] as [number, number][], table: [1.3, -0.9] as [number, number], tableTop: 0.74 };
export const HELENA = { beans: [0.9, -1.5] as [number, number] };

const BUILD: Record<Place, (K: Kit) => PlaceBuild> = {
  alps: place("alps", (g, K, x, { box, cone, ball }) => {
    box("path", "#eef2f6", x - 40, x + 40, -0.6, 0, -3.4, 12, false);
    box("wall", "#77818e", x - 40, x + 40, 0, 14, -9, -4.1, false);
    for (let i = 0; i < 16; i++) { const bx = x - 30 + i * 4 + 2 * h01(i, 1); const m = box(`rock${i}`, ["#7f8996", "#99a3af", "#8a94a0"][i % 3], bx, bx + 2.2 + 1.6 * h01(i, 2), 0, 3 + 6 * h01(i, 3), -4.4 - 0.4 * h01(i, 4), -3.3 - 0.5 * h01(i, 5)); m.rotation.z = (h01(i, 12) - 0.5) * 0.16; ball(`cap${i}`, "#f4f7fa", bx + 1.3, 3.1 + 6 * h01(i, 3), -3.8, 1.3, 0.25); }
    for (let i = 0; i < 9; i++) ball(`drift${i}`, "#f4f7fa", x - 16 + i * 4 + h01(i, 6), 0, -5.0, 0.9 + 0.4 * h01(i, 7), 0.32);
    for (let i = 0; i < 7; i++) cone(`peak${i}`, i % 2 ? "#dfe6ee" : "#c3cfdc", x - 36 + i * 12, 4, -40 - (i % 2) * 10, 13, 20 + (i % 3) * 6, 6);
    for (let i = 0; i < 14; i++) ball(`edge${i}`, "#e4eaf0", x - 14 + i * 2.1, -0.02, 2.9 + 0.3 * h01(i, 8), 0.5 + 0.3 * h01(i, 9), 0.3);
  }),
  notredame: place("notredame", (g, K, x, { box, cyl, flame }) => {
    box("floor", "#4a3a3a", x - 14, x + 14, -0.5, 0, -16, 10, false);
    box("carpet", "#8a2030", x - 1.5, x + 1.5, 0, 0.02, -16, 10, false);
    box("carpetEdgeL", "#dcae4a", x - 1.6, x - 1.5, 0, 0.025, -16, 10, false); box("carpetEdgeR", "#dcae4a", x + 1.5, x + 1.6, 0, 0.025, -16, 10, false);
    for (let i = 0; i < 3; i++) box(`step${i}`, "#8a2030", x - 4.2 + i * 0.35, x + 4.2 - i * 0.35, i * 0.16, (i + 1) * 0.16, -9, NOTREDAME.stepZ - i * 0.4, false);
    box("wall", "#3a2a2c", x - 14, x + 14, 0, 22, -12.3, -12, false);
    box("drape", "#7a1c2c", x - 3, x + 3, 0.5, 13, -11.95, -11.8, false); box("drapeGold", "#dcae4a", x - 3.2, x + 3.2, 12.6, 13.4, -11.9, -11.7, false);
    for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { cyl(`pillar${sd}${i}`, "#6a5650", x + sd * 5.2, 0, 22, -10 + i * 4.4, 0.7); box(`base${sd}${i}`, "#57443f", x + sd * 5.2 - 0.9, x + sd * 5.2 + 0.9, 0, 0.5, -10.9 + i * 4.4, -9.1 + i * 4.4); }
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const cx = x + sd * (2.6 + (i % 2) * 0.7), cz = -1.2 - i * 1.5; cyl(`stand${sd}${i}`, "#b8923a", cx, 0, 1.25, cz, 0.04, 8); cyl(`candle${sd}${i}`, "#f1ead8", cx, 1.25, 1.5, cz, 0.035, 8); flame(`fl${sd}${i}`, cx, 1.5, cz, 0.05); }
    box("window", "#6a88c8", x - 1.2, x + 1.2, 14, 20, -11.98, -11.9, false);
    return [0, 2.2, -1.5];
  }),
  camp: place("camp", (g, K, x, { box, cone, ball, flame, cyl }) => {
    box("ground", "#2c3040", x - 40, x + 40, -0.5, 0, -12, 12, false);
    const hill = new THREE.Mesh(new THREE.SphereGeometry(40, 40, 16).scale(1, 0.2, 0.5).translate(x, -1.5, -34), K.flat("#222838", { rough: 1 })); hill.name = "hill"; hill.receiveShadow = true; g.add(hill);
    const [fx, , fz] = CAMP.fire;
    for (let i = 0; i < 5; i++) { const m = box(`log${i}`, "#3a2a20", x + fx - 0.3, x + fx + 0.3, 0, 0.09, fz - 0.045, fz + 0.045); m.geometry.translate(-(x + fx), 0, -fz); m.rotation.y = i * 1.25; m.position.set(x + fx, 0, fz); }
    flame("fire", x + fx, 0.05, fz, 0.2); flame("fire2", x + fx + 0.12, 0.05, fz + 0.06, 0.13);
    for (let i = 0; i < 7; i++) { const tx = x - 9 + i * 3.1 + h01(i, 1), tz = -6.5 - 2.5 * h01(i, 2); cone(`tent${i}`, i % 2 ? "#585c68" : "#4c505c", tx, 0, tz, 1.3, 1.7, 4); }
    for (let i = 0; i < 3; i++) { const sx = x + 2.4 + i * 0.5; cyl(`stack${i}`, "#3a2c22", sx, 0, 1.5, -3.6, 0.02, 6).rotation.z = (i - 1) * 0.14; }
    for (let i = 0; i < 60; i++) { const m = ball(`star${i}`, "#ffffff", x - 40 + 80 * h01(i, 3), 12 + 22 * h01(i, 4), -60, 0.09 + 0.08 * h01(i, 5)); m.material = glow([1.5, 1.5, 1.7]); }
    return [fx, 0.9, fz + 0.4];
  }),
  tuileries: place("tuileries", (g, K, x, { box, cyl, flame }) => {
    box("floor", "#6a4a34", x - 8, x + 8, -0.5, 0, -6, 8, false);
    for (let i = -7; i < 8; i += 2) box(`parq${i}`, "#5c3f2c", x + i, x + i + 1, 0, 0.004, -6, 8, false);
    box("wall", "#2f5a40", x - 8, x + 8, 0, 6, -6.2, -6, false); box("dado", "#e8dcc0", x - 8, x + 8, 0, 0.95, -6.02, -5.96, false); box("rail", "#dcae4a", x - 8, x + 8, 0.95, 1.02, -6.03, -5.95, false);
    box("wallL", "#2a5139", x - 8.2, x - 8, 0, 6, -6, 8, false); box("wallR", "#2a5139", x + 8, x + 8.2, 0, 6, -6, 8, false);
    for (const wx of [-4.6, 4.6]) { box(`win${wx}`, "#f0ead2", x + wx - 0.8, x + wx + 0.8, 1.1, 4.6, -6.0, -5.94, false); box(`cur${wx}a`, "#8a2030", x + wx - 1.15, x + wx - 0.75, 0.3, 4.9, -5.94, -5.84, false); box(`cur${wx}b`, "#8a2030", x + wx + 0.75, x + wx + 1.15, 0.3, 4.9, -5.94, -5.84, false); }
    box("nframe", "#dcae4a", x - 0.75, x + 0.75, 2.2, 4.3, -5.98, -5.9, false); box("npic", "#2f5a40", x - 0.6, x + 0.6, 2.35, 4.15, -5.92, -5.88, false);
    const [dx, dz] = TUILERIES.desk;
    box("desk", "#5e3a24", x + dx - 1.0, x + dx + 1.0, 0.7, 0.78, dz - 0.5, dz + 0.5); for (const [a, b] of [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]]) box(`dleg${a}${b}`, "#4a2c1a", x + dx + a - 0.05, x + dx + a + 0.05, 0, 0.7, dz + b - 0.05, dz + b + 0.05);
    box("deskTop", "#2f5a40", x + dx - 0.9, x + dx + 0.9, 0.78, 0.785, dz - 0.42, dz + 0.42, false);
    for (let i = 0; i < 4; i++) box(`paper${i}`, "#f1ead8", x + dx - 0.8 + i * 0.4, x + dx - 0.55 + i * 0.4, 0.786, 0.79 + i * 0.012, dz - 0.2 - 0.05 * (i % 2), dz + 0.12, false);
    TUILERIES.clerks.forEach(([cx, cz], i) => { box(`cdesk${i}`, "#5e3a24", x + cx - 0.55, x + cx + 0.55, 0.66, 0.72, cz + 0.25, cz + 0.85); box(`cfront${i}`, "#4a2c1a", x + cx - 0.55, x + cx + 0.55, 0, 0.66, cz + 0.8, cz + 0.85); box(`csheet${i}`, "#f1ead8", x + cx - 0.2, x + cx + 0.2, 0.72, 0.726, cz + 0.35, cz + 0.7, false); });
    const [tx, tz] = TUILERIES.table; cyl("ttop", "#2f5a40", x + tx, TUILERIES.tableTop - 0.04, TUILERIES.tableTop, tz, 0.5, 24); cyl("tleg", "#4a2c1a", x + tx, 0, TUILERIES.tableTop - 0.04, tz, 0.06);
    cyl("cstand", "#b8923a", x + dx + 0.8, 0.785, 1.05, dz - 0.3, 0.02, 8); flame("cfl", x + dx + 0.8, 1.05, dz - 0.3, 0.035);
  }),
  russia: place("russia", (g, K, x, { box, cone, ball }) => {
    box("ground", "#eef0f3", x - 60, x + 60, -0.5, 0, -60, 12, false);
    for (let i = 0; i < 16; i++) cone(`fir${i}`, "#55655e", x - 30 + i * 4 + 2 * h01(i, 1), 0, -15 - 9 * h01(i, 2), 1.3, 5 + 2 * h01(i, 3), 7);
    for (let i = 0; i < 10; i++) ball(`drift${i}`, "#f6f7f9", x - 14 + i * 3 + h01(i, 4), 0, -5 - 3 * h01(i, 5), 1.4, 0.22);
    // what the retreat leaves: a wheel, a cannon barrel in the snow, crosses
    box("barrel", "#3c3e44", x + 2.2, x + 3.6, 0.02, 0.24, -4.3, -4.06).rotation.y = 0.2;
  }),
  laffrey: place("laffrey", (g, K, x, { box, cone, ball }) => {
    box("ground", "#7f9a58", x - 60, x + 60, -0.5, 0, -60, 12, false);
    box("road", "#c2b48c", x - 2.2, x + 2.2, 0, 0.012, -60, 12, false);
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(40, 14).rotateX(-Math.PI / 2).translate(x + 26, 0.02, -24), K.flat("#6f9ab8", { rough: 0.3 })); lake.name = "lake"; g.add(lake);
    for (let i = 0; i < 6; i++) cone(`mt${i}`, i % 2 ? "#8ea4a8" : "#7a9498", x - 40 + i * 16, 0, -52 - (i % 2) * 8, 16, 14 + (i % 3) * 5, 6);
    for (let i = 0; i < 12; i++) { const tx = x + (i % 2 ? 1 : -1) * (5 + 9 * h01(i, 1)), tz = -6 - 30 * h01(i, 2); cone(`tree${i}`, "#4f7440", tx, 0.6, tz, 1.1, 3, 8); box(`trunk${i}`, "#5a4030", tx - 0.1, tx + 0.1, 0, 0.7, tz - 0.1, tz + 0.1); }
    void ball;
  }),
  waterloo: place("waterloo", (g, K, x, { box, ball }) => {
    box("ground", "#5a5040", x - 60, x + 60, -0.5, 0, -60, 12, false);
    const ridge = new THREE.Mesh(new THREE.SphereGeometry(40, 40, 12).scale(1, 0.1, 0.4).translate(x, -1.2, -28), K.flat("#4a4236", { rough: 1 })); ridge.name = "ridge"; g.add(ridge);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(4.5, 24, 16).translate(x + 12, 5, -70), glow([2.2, 0.9, 0.4])); sun.name = "sun"; g.add(sun);
    for (let i = 0; i < 9; i++) ball(`smoke${i}`, i % 2 ? "#806258" : "#866a5e", x - 26 + 52 * h01(i, 1), 1.2 + 1.6 * h01(i, 2), -30 - 10 * h01(i, 3), 2.2 + 1.5 * h01(i, 4), 0.4);
    box("broken", "#3a3028", x - 3.4, x - 2.0, 0, 0.5, -4.2, -3.9).rotation.z = 0.2;
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 20).rotateY(0.6).translate(x - 2.4, 0.5, -4.4), K.flat("#3a3028", { rough: 1 })); wheel.name = "wheel"; g.add(wheel);
  }),
  helena: place("helena", (g, K, x, { box, cone, cyl }) => {
    box("ground", "#7f8f58", x - 30, x + 30, -0.5, 0, -22, 12, false);
    box("soil", "#6a4e38", x - 0.4, x + 3.4, 0, 0.03, -2.6, -0.6, false);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 200).rotateX(-Math.PI / 2).translate(x, -3, -120), K.flat("#5f8ea6", { rough: 0.35 })); sea.name = "sea"; g.add(sea);
    box("house", "#d8ccb0", x - 9, x - 2.2, 0, 3.0, -8, -4.4); box("roof", "#6a6660", x - 9.3, x - 1.9, 3.0, 3.5, -8.3, -4.1); box("door", "#5a6a4a", x - 4.4, x - 3.5, 0, 2.1, -4.4, -4.36, false);
    for (const wx of [-7.6, -6]) box(`hw${wx}`, "#f0ead2", x + wx, x + wx + 0.9, 1.0, 2.1, -4.4, -4.37, false);
    const [bx, bz] = HELENA.beans;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const px = x + bx - 1 + i * 0.5, pz = bz - 0.7 + r * 0.9; cyl(`pole${r}${i}`, "#8a6a48", px, 0, 1.25, pz, 0.012, 6); cone(`bean${r}${i}`, "#5c8a3e", px, 0.05, pz, 0.14, 0.95, 7); }
    for (let i = 0; i < 9; i++) { const px = x - 22 + i * 5.5; box(`fence${i}`, "#8a7a62", px, px + 0.1, 0, 0.9, -11, -10.9); }
    box("fenceRail", "#8a7a62", x - 22, x + 22, 0.6, 0.68, -10.98, -10.92);
    void cone;
  }),
};
const DEF = Object.fromEntries(PLACES.map((p) => [p, { look: look(TONES[p]), params: {}, build: BUILD[p] }])) as Record<Place, PlaceDef>;
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "napoleon" });
export type NapoleonSet = ReturnType<typeof buildSets>;
