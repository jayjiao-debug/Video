// BLOCK-OUT PLACES (WP1): a plain stand-in for each of the six places, so the World builds and the whole film renders
// before the sets lane (WP2) lands its sets/<place>.ts. sets/index.ts uses a block-out only for a place whose real set
// is not wired yet. Plain shapes in a colour (the props kit's flat toon paint, lit by the place's fill), the same light
// kinds as every place (okit lightRig), the place's param names with WP2's defaults (so a shot's set.param calls keep
// working when the real set replaces the stub). Built round layout/base.ts ISLAND; floors at y 0, the camera side +z.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { lightRig } from "../../../kit/sets/okit";
import type { EnvSpec } from "../../bt/pbr";
import type { CastLight } from "../../group/kit/cast";
import { ISLAND } from "../layout/base";
import type { Place } from "../story";
import type { PlaceBuild, PlaceLook, ParamValue } from "./index";

export type Blk = ReturnType<typeof blockKit>;
/** shapes into `group`: each is a Mesh that casts and receives shadows, named `name` */
export const blockKit = (K: Kit, group: THREE.Group) => {
  const add = (name: string, geo: THREE.BufferGeometry, col: string | THREE.Material, o: { cast?: boolean; rough?: number; into?: THREE.Object3D } = {}) => {
    const m = new THREE.Mesh(geo, typeof col === "string" ? K.flat(col, { rough: o.rough ?? 0.85 }) : col);
    m.name = name; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.into ?? group).add(m);
    return m;
  };
  return {
    add,
    /** a box by its extents */
    box: (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, o: { cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), col, o),
    /** an upright cylinder standing on (x, y0, z) */
    cyl: (name: string, col: string, x: number, z: number, r: number, y0: number, y1: number, o: { seg?: number; r1?: number; cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.CylinderGeometry(o.r1 ?? r, r, y1 - y0, o.seg ?? 24).translate(x, (y0 + y1) / 2, z), col, o),
    /** a level floor quad (y) by its extents: one quad, no seams */
    floor: (name: string, col: string, x0: number, x1: number, z0: number, z1: number, y = 0, o: { into?: THREE.Object3D } = {}) =>
      add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2), col, { cast: false, ...o }),
    /** an unlit glowing shape (a window, the furnace door): not in the ink pass's way (MeshBasicMaterial) */
    glow: (name: string, col: string, geo: THREE.BufferGeometry, o: { into?: THREE.Object3D } = {}) => {
      const m = new THREE.Mesh(geo, K.glow(col)); m.name = name; m.castShadow = false; (o.into ?? group).add(m); return m;
    },
  };
};
/** a fixed pseudo-random sequence 0..1 (never Math.random) */
export const seq = (seed: number) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// ------------------------------------------------------------------------------------------------- the stub places
const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
const cast = (key: [number, number, number], tint: [number, number, number], gain: number, shade: [number, number, number]): CastLight => ({
  key, tint, tintK: 0.55, gain, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0], shade, shadeK: 0.4, wrap: [30, 60], edge: 0.14,
  broad: 0.3, bodySat: 0.15, sheen: 0.1, lift: 0.04, contactLen: 0.3, ...BAKED,
} as unknown as CastLight);
const fill = (lo: [number, number, number], hi: [number, number, number]): EnvSpec => ({
  frame: "world", stops: [[-90, lo], [0, [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2]], [90, hi]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.9, 0.9, 0.95] }],
});
const AO = { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.6, color: "#1e1a24" };
type Stub = { look: PlaceLook; params: Record<string, ParamValue>; build: (K: Kit) => PlaceBuild };

/** a box room round (x0, 0, 0): floor, back wall at z -d, two side walls, a ceiling; the walls the camera is behind hide */
const room = (K: Kit, g: THREE.Group, x: number, o: { w: number; d: number; h: number; floor: string; wall: string; ceil?: string; front?: number }) => {
  const B = blockKit(K, g), hw = o.w / 2, front = o.front ?? 3;
  B.floor("floor", o.floor, x - hw, x + hw, -o.d, front);
  B.box("wallBack", o.wall, x - hw, x + hw, 0, o.h, -o.d - 0.12, -o.d, { cast: false });
  const L = B.box("wallL", o.wall, x - hw - 0.12, x - hw, 0, o.h, -o.d, front, { cast: false });
  const R = B.box("wallR", o.wall, x + hw, x + hw + 0.12, 0, o.h, -o.d, front, { cast: false });
  if (o.ceil) B.box("ceiling", o.ceil, x - hw, x + hw, o.h, o.h + 0.1, -o.d, front, { cast: false });
  return { B, view: (c: THREE.Vector3) => { L.visible = c.x > x - hw + 0.05; R.visible = c.x < x + hw - 0.05; } };
};

const STAIRS: Stub = {
  look: { bg: "#2a2420", ao: AO, cast: cast([0.7, 0.35, 0.6], [1.0, 0.86, 0.7], 0.95, [1.08, 0.96, 1.16]), fill: fill([0.2, 0.17, 0.15], [0.42, 0.36, 0.3]), bloom: 0.4 },
  params: { door: 0, glow: 0 },
  build(K) {
    const g = new THREE.Group(); g.name = "stub-stairs"; const x = ISLAND.stairs;
    const r = room(K, g, x, { w: 3.2, d: 2.2, h: 3.0, floor: "#6b4a34", wall: "#5a4636", ceil: "#3e3028" });
    for (let i = 0; i < 2; i++) r.B.box(`step${i}`, "#5a3c2a", x - 1.0, x + 1.0, -0.18 * (2 - i), -0.18 * (1 - i), 1.0 + 0.28 * i, 1.28 + 0.28 * i, { cast: false });
    const door = r.B.box("door", "#4a3020", x - 0.45, x + 0.45, 0, 2.05, -2.2, -2.14);
    const gap = r.B.glow("doorGlow", "#ffb860", new THREE.PlaneGeometry(0.88, 0.03).translate(x, 0.015, -2.13));
    r.B.glow("stairWindow", "#fff0c8", new THREE.PlaneGeometry(0.7, 1.0).rotateY(-Math.PI / 2).translate(x + 1.59, 1.9, -0.6));
    const L = lightRig(g, { dir: [0.8, 0.45, 0.3], k: 2.0, col: "#ffd8a8", at: [x, 0, -1], half: 6, hemi: ["#c8b8a8", "#4a3c30", 1.2], point: { col: "#ffb860", k: 0, at: [x, 0.3, -1.9], dist: 3 } });
    return {
      group: g, view: r.view,
      setParam(n, v) {
        if (n === "door") door.visible = Number(v) < 0.5;
        if (n === "glow") { gap.visible = Number(v) > 0.02; L.point.intensity = 1.2 * Number(v); }
      },
    };
  },
};
const ROOM: Stub = {
  look: { bg: "#2c2622", ao: AO, cast: cast([-0.55, 0.5, 0.65], [1.0, 0.97, 0.94], 0.98, [1.04, 0.95, 1.34]), fill: fill([0.22, 0.2, 0.19], [0.46, 0.44, 0.42]), bloom: 0.35 },
  params: { hour: "morning" },
  build(K) {
    const g = new THREE.Group(); g.name = "stub-room"; const x = ISLAND.room;
    const r = room(K, g, x, { w: 5.0, d: 3.2, h: 3.0, floor: "#7a5a40", wall: "#8a7356", ceil: "#5e4c3c" });
    r.B.box("desk", "#5e3e28", x - 0.9, x + 0.5, 0, 0.76, -2.0, -1.2);
    r.B.box("paper", "#efe6cf", x - 0.8, x + 0.4, 0.76, 0.9, -1.95, -1.25);
    r.B.box("windowTable", "#6a4630", x + 1.3, x + 2.1, 0, 0.72, -2.8, -2.1);
    const win = r.B.glow("window", "#f4f0e4", new THREE.PlaneGeometry(1.0, 1.3).translate(x + 1.7, 1.7, -3.19));
    const L = lightRig(g, { dir: [0.3, 0.6, 0.75], k: 1.8, col: "#ffffff", at: [x, 0, -1.5], half: 6, hemi: ["#d8d4cc", "#5a4a3c", 1.2], point: { col: "#ff9a40", k: 0, at: [x - 0.2, 1.2, -1.4], dist: 4 } });
    const HOURS: Record<string, { key: string; k: number; win: string; candle: number }> = {
      morning: { key: "#ffffff", k: 1.8, win: "#f4f0e4", candle: 0 }, noon: { key: "#fff6e0", k: 2.3, win: "#fffaf0", candle: 0 },
      evening: { key: "#ffb860", k: 1.6, win: "#ffcf80", candle: 0 }, night: { key: "#6070a0", k: 0.3, win: "#1c2236", candle: 1.6 },
    };
    return {
      group: g, view: r.view,
      setParam(n, v) {
        if (n !== "hour") return;
        const H = HOURS[String(v)] ?? HOURS.morning;
        L.key.color.set(H.key); L.key.intensity = H.k; (win.material as THREE.MeshBasicMaterial).color.set(H.win); L.point.intensity = H.candle;
      },
    };
  },
};
const GARDEN: Stub = {
  look: { bg: "#9cc0dc", ao: AO, cast: cast([-0.4, 0.75, 0.5], [1.0, 0.97, 0.9], 1.0, [1.04, 0.95, 1.34]), fill: fill([0.3, 0.3, 0.28], [0.6, 0.66, 0.72]), bloom: 0.35 },
  params: { time: "noon", glow: 0, window: 0 },
  build(K) {
    const g = new THREE.Group(); g.name = "stub-garden"; const x = ISLAND.garden, B = blockKit(K, g);
    B.floor("gravel", "#c8bca4", x - 8, x + 8, -18, 6);
    for (const s of [-1, 1]) B.box(`hedge${s}`, "#4e7a40", x + s * 1.6 - 0.3, x + s * 1.6 + 0.3, 0, 0.6, -12, 2);
    B.box("wallBack", "#9a5a44", x - 8, x + 8, 0, 3.2, -18.3, -18);
    B.box("college", "#b8a888", x - 8.3, x - 8, 0, 9, -18, 6, { cast: false });
    B.box("elaboratory", "#8a4a38", x + 2, x + 5, 0, 2.8, -16.5, -13.5);
    const door = B.glow("elabDoor", "#ff9a40", new THREE.PlaneGeometry(0.8, 1.8).translate(x + 3.5, 0.9, -13.49));
    const win = B.glow("hisWindow", "#ffc070", new THREE.PlaneGeometry(0.9, 1.2).rotateY(Math.PI / 2).translate(x - 7.99, 5.2, -6));
    const L = lightRig(g, { dir: [-0.4, 0.8, 0.45], k: 2.2, col: "#fff4e0", at: [x, 0, -6], half: 14, hemi: ["#b8d0e8", "#6a6048", 1.3], point: { col: "#ff9a40", k: 0, at: [x + 3.5, 1.2, -12.8], dist: 6 } });
    let glow = 0;
    return {
      group: g,
      setParam(n, v) {
        if (n === "time") { const night = v === "night"; L.key.color.set(night ? "#8aa0d8" : "#fff4e0"); L.key.intensity = night ? 0.9 : 2.2; L.hemi.color.set(night ? "#5a6a9a" : "#b8d0e8"); L.hemi.intensity = night ? 1.0 : 1.3; }
        if (n === "glow") { glow = Number(v); door.visible = glow > 0.02; L.point.intensity = 2.5 * glow; }
        if (n === "window") win.visible = Number(v) > 0.02;
      },
    };
  },
};
const STREET: Stub = {
  look: { bg: "#a8c4dc", ao: AO, cast: cast([-0.5, 0.65, 0.55], [1.0, 0.95, 0.88], 1.0, [1.04, 0.95, 1.34]), fill: fill([0.3, 0.29, 0.27], [0.6, 0.64, 0.7]), bloom: 0.35 },
  params: {},
  build(K) {
    const g = new THREE.Group(); g.name = "stub-street"; const x = ISLAND.street, B = blockKit(K, g);
    B.floor("cobbles", "#9a9086", x - 4, x + 4, -30, 6);
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) B.box(`front${i}${s}`, i % 2 ? "#b49a78" : "#8a5a44", x + s * 3.2 - 0.4, x + s * 3.2 + 0.4, 0, 6 + (i % 3), -4 - 4.4 * i, -0.2 - 4.4 * i, { cast: false });
    lightRig(g, { dir: [-0.5, 0.7, 0.5], k: 2.1, col: "#fff2dc", at: [x, 0, -8], half: 14, hemi: ["#c0d4e8", "#6a6050", 1.3] });
    return { group: g };
  },
};
const SCHOOLS: Stub = {
  look: { bg: "#2e2a28", ao: AO, cast: cast([-0.6, 0.55, 0.55], [1.0, 0.94, 0.86], 0.96, [1.04, 0.95, 1.34]), fill: fill([0.24, 0.22, 0.2], [0.5, 0.48, 0.44]), bloom: 0.4 },
  params: { dust: 1 },
  build(K) {
    const g = new THREE.Group(); g.name = "stub-schools"; const x = ISLAND.schools;
    const r = room(K, g, x, { w: 9, d: 6, h: 6, floor: "#7a6450", wall: "#b0a088", front: 8 });
    for (let i = 0; i < 5; i++) r.B.box(`bench${i}`, "#6a4a32", x - 3.2, x + 3.2, 0, 0.45, -1.8 + 1.4 * i, -1.4 + 1.4 * i);
    r.B.box("lectern", "#5a3c28", x - 0.5, x + 0.5, 0, 1.1, -5.0, -4.4);
    r.B.glow("highWindow", "#fff4d8", new THREE.PlaneGeometry(1.2, 2.2).rotateY(-Math.PI / 2).translate(x + 4.49, 4.2, -2));
    lightRig(g, { dir: [0.7, 0.6, 0.3], k: 2.0, col: "#fff0d0", at: [x, 0, -2], half: 10, hemi: ["#c8c0b0", "#504438", 1.2] });
    return { group: g, view: r.view };
  },
};
const ELAB: Stub = {
  look: { bg: "#1e1612", ao: AO, cast: cast([0.5, 0.3, 0.8], [1.0, 0.72, 0.48], 0.98, [1.08, 0.96, 1.16]), fill: fill([0.22, 0.14, 0.1], [0.42, 0.3, 0.22]), bloom: 0.5 },
  params: { fire: 1, candle: 1 },
  build(K) {
    const g = new THREE.Group(); g.name = "stub-elaboratory"; const x = ISLAND.elaboratory;
    const r = room(K, g, x, { w: 4.2, d: 3.0, h: 2.8, floor: "#5a4434", wall: "#7a4432", ceil: "#3a2a22" });
    r.B.box("furnace", "#8a4a36", x - 1.9, x - 0.7, 0, 1.4, -2.9, -1.8);
    const fd = r.B.glow("fireDoor", "#ff8a30", new THREE.PlaneGeometry(0.4, 0.34).rotateY(Math.PI / 2).translate(x - 0.69, 0.6, -2.35));
    r.B.box("bench", "#5e4030", x + 0.6, x + 2.0, 0, 0.8, -2.9, -2.3);
    r.B.cyl("stool", "#6a4a34", x - 0.3, -1.9, 0.18, 0, 0.45);
    const L = lightRig(g, { dir: [-0.6, 0.35, 0.5], k: 0.35, col: "#7080b0", at: [x, 0, -1.5], half: 6, hemi: ["#8a5a40", "#2a1a14", 0.9], point: { col: "#ff8a40", k: 3.0, at: [x - 0.5, 0.8, -2.2], dist: 6 } });
    let fire = 1;
    return {
      group: g, view: r.view,
      setParam(n, v) { if (n === "fire") { fire = Number(v); (fd.material as THREE.MeshBasicMaterial).color.set(fire > 0.5 ? "#ff8a30" : "#c0401c"); } },
      animate(t) { L.point.intensity = 3.0 * (0.55 + 0.45 * fire) * (0.92 + 0.08 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1)); },
    };
  },
};
/** the six block-out places */
export const STUB: Record<Place, Stub> = { stairs: STAIRS, room: ROOM, garden: GARDEN, street: STREET, schools: SCHOOLS, elaboratory: ELAB };
