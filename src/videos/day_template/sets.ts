// THE PLACES of the starter film: one block-out room ("study") through the kit's makeSets. A real film gives each place
// its own file (sets/<place>.ts) with <PLACE>_LOOK, <PLACE>_PARAMS and build<Place>(K); the contract is in
// src/kit/day/sets.ts (lights inside the group, the same light kinds everywhere, the BAKED_LIGHT values, walls the
// camera stands behind hidden by view()).
import * as THREE from "three";
import type { Kit } from "../../kit/props/kit";
import { lightRig } from "../../kit/sets/okit";
import { makeSets, BAKED_LIGHT, type PlaceDef } from "../../kit/day/sets";
import type { CastLight } from "../../videos/group/kit/cast";
import type { PlaceBuild, PlaceLook } from "../../kit/day/types";
import { PLACES, type Place } from "./story";

/** where each place's island sits on x (every place is built round its own x, all in one scene, one shown at a time) */
export const ISLAND: Record<Place, number> = { study: 0 };

const STUDY_LOOK: PlaceLook = {
  bg: "#2c2622",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.6, color: "#1e1a24" },
  cast: {
    key: [-0.55, 0.5, 0.65], tint: [1.0, 0.97, 0.94], tintK: 0.55, gain: 0.98, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0],
    shade: [1.04, 0.95, 1.34], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.15, sheen: 0.1, lift: 0.04, contactLen: 0.3,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: { frame: "world", stops: [[-90, [0.22, 0.2, 0.19]], [0, [0.34, 0.32, 0.3]], [90, [0.46, 0.44, 0.42]]], boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.9, 0.9, 0.95] }] },
  bloom: 0.35,
};
/** the study's per-frame dressing: the hour of its window light */
const STUDY_PARAMS = { hour: "morning" };

const buildStudy = (K: Kit): PlaceBuild => {
  const g = new THREE.Group(); g.name = "study"; const x = ISLAND.study;
  const box = (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, cast = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), K.flat(col, { rough: 0.85 }));
    m.name = name; m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
  };
  const w = 5, d = 3.2, h = 3, front = 3;
  box("floor", "#7a5a40", x - w / 2, x + w / 2, -0.05, 0, -d, front, false);
  box("wallBack", "#8a7356", x - w / 2, x + w / 2, 0, h, -d - 0.12, -d, false);
  const wl = box("wallL", "#8a7356", x - w / 2 - 0.12, x - w / 2, 0, h, -d, front, false);
  const wr = box("wallR", "#8a7356", x + w / 2, x + w / 2 + 0.12, 0, h, -d, front, false);
  box("desk", "#5e3e28", x - 0.9, x + 0.5, 0, 0.76, -2.0, -1.2);
  box("paper", "#efe6cf", x - 0.8, x + 0.4, 0.76, 0.8, -1.95, -1.25);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3).translate(x + 1.4, 1.7, -d + 0.01), K.glow("#f4f0e4")); win.name = "window"; g.add(win);
  const Lr = lightRig(g, { dir: [0.3, 0.6, 0.75], k: 1.8, col: "#ffffff", at: [x, 0, -1.5], half: 6, hemi: ["#d8d4cc", "#5a4a3c", 1.2], point: { col: "#ff9a40", k: 0, at: [x - 0.2, 1.2, -1.4], dist: 4 } });
  const HOURS: Record<string, { key: string; k: number; win: string }> = { morning: { key: "#ffffff", k: 1.8, win: "#f4f0e4" }, noon: { key: "#fff6e0", k: 2.3, win: "#fffaf0" } };
  return {
    group: g,
    view: (c) => { wl.visible = c.x > x - w / 2 + 0.05; wr.visible = c.x < x + w / 2 - 0.05; },
    setParam(n, v) {
      if (n !== "hour") return;
      const H = HOURS[String(v)] ?? HOURS.morning;
      Lr.key.color.set(H.key); Lr.key.intensity = H.k; (win.material as THREE.MeshBasicMaterial).color.set(H.win);
    },
  };
};

const DEF: Record<Place, PlaceDef> = { study: { look: STUDY_LOOK, params: STUDY_PARAMS, build: buildStudy } };
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "day_template" });
export type TemplateSet = ReturnType<typeof buildSets>;
