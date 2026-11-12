// THE PLACES of the Hongmen film behind ONE interface (HongmenSet). The World (world.ts) builds it once per page.
//
// STATE OF THIS FILE: a STAND-IN by the engine skeleton, with the FINAL exported names. Only the privy is real
// (sets/privy.ts, re-exported from here). Every other place is a block-out built from layout.ts: the tent = a floor,
// a rug, dark walls, a door with its flap, pads and low tables at the layout seats; the other places = a ground and a
// few boxes at the layout marks. The set builder replaces the block-outs place by place WITHOUT changing a name or a
// signature below; shots only ever talk to the HongmenSet.
//
// The contract a real place must keep (07 findings 5, 12; 03 section 3):
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot
//     leak); the islands are far apart along x (layout.ts), so a missed toggle never shows a tent wall in the camp;
//   - EVERY place has the same light kinds (one shadowed directional key + one hemisphere + one point light, the
//     point light may have intensity 0): three.js compiles a material's program per light set-up, so equal set-ups
//     share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (BAKED_LIGHT: bleach, bodyShadeK, contact):
//     the rig bakes them into a figure when it is first built, and figures are built lazily, so a different value
//     per place would make a figure look different depending on which frame of a farm chunk built it. buildSets
//     throws if a place disagrees;
//   - every setter is a pure function of its argument; animate(t) is a pure function of t; seeded painting only;
//   - walls the camera stands behind are HIDDEN by setView (never left to culling: a culled wall still inks).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeEnv, mats, LIGHTS, type EnvSpec, type Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import type { GradeParams } from "../../vasa/grade";
import type { CastLight } from "../../group/kit/cast";
import { YARD_FILL, YARD_AO, YARD_CAST_LIGHT } from "../../arthur/sets/yard";
import * as L from "../layout";
import { PLACES, type Place } from "../story";
import { buildPrivy, PRIVY_FILL, PRIVY_AO, PRIVY_BG, PRIVY_CAST_LIGHT, type PrivySet } from "./privy";
import { buildTent, TENT_ENV, TENT_AO_REAL, TENT_BG } from "./tent";
import { buildGate, buildFacade, buildPath, OUTDOOR_LOOKS } from "./outdoor";
import { buildNightX, buildLiuCamp, NIGHT_LOOKS } from "./night";
import { buildCard, CARD_LOOK } from "./card";

export * from "./privy";
export { TENT } from "./tent";
export type { Place };

type V3 = [number, number, number];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// =====================================================================================================================
// the look of a place
// =====================================================================================================================
export type AO = { aoRadius: number; distanceFalloff: number; intensity: number; color: string };
/** what the engine needs to know about a place besides its meshes */
export type PlaceLook = {
  /** scene.background (a CSS colour) */ bg: string;
  /** N8AO */ ao: AO;
  /** the rig figures' light in this place (group/kit/cast CastLight) */ cast: CastLight;
  /** bloom intensity (default 0.35) */ bloom?: number;
  /** the place's grade (default: Film.tsx GRADE_FILM) */ grade?: GradeParams;
};
/** the three CastLight values that are baked into a figure when it is first built: IDENTICAL in every place */
export const BAKED_LIGHT = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;

const DAY_CAST = { ...YARD_CAST_LIGHT, ...BAKED_LIGHT } as unknown as CastLight;
/** a warm lamp from the upper front left, deep violet shade; gain under 1 so reds and whites do not blow out against
 *  dark walls (the cast sheets' "tent" light, g3) */
const TENT_CAST = {
  key: [-0.45, 0.62, 0.64], tint: [1.0, 0.86, 0.66], tintK: 0.7, gain: 0.9, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
  shade: [1.06, 0.9, 1.5], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.14, lift: 0, contactLen: 0.3, ...BAKED_LIGHT,
} as unknown as CastLight;
const NIGHT_CAST = {
  key: [0.2, 0.5, 0.84], tint: [1.0, 0.86, 0.68], tintK: 0.75, gain: 0.84, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
  shade: [1.05, 0.9, 1.8], shadeK: 0.45, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.1, lift: 0, contactLen: 0.2, ...BAKED_LIGHT,
} as unknown as CastLight;
const TENT_AO: AO = { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 2.4, color: "#1a1024" };
const SKY = "#bfe3f7";
/** (stand-in values except the privy's) */
export const PLACE_LOOKS: Record<Place, PlaceLook> = {
  privy: { bg: PRIVY_BG, ao: PRIVY_AO, cast: PRIVY_CAST_LIGHT as unknown as CastLight },
  tent: { bg: TENT_BG, ao: TENT_AO_REAL, cast: TENT_CAST },
  camp: OUTDOOR_LOOKS.camp,
  gate: OUTDOOR_LOOKS.gate,
  nightX: NIGHT_LOOKS.nightX,
  nightL: NIGHT_LOOKS.nightL,
  dayL: NIGHT_LOOKS.dayL,
  card: CARD_LOOK,
  path: OUTDOOR_LOOKS.path,
};
const TENT_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.22, 0.2]], [-12, [0.36, 0.28, 0.3]], [6, [0.46, 0.4, 0.5]], [40, [0.42, 0.38, 0.54]], [90, [0.36, 0.34, 0.5]]],
  boxes: [{ az: 125, el: 38, rot: 0, w: 40, h: 22, soft: 14, col: [1.0, 0.86, 0.66] }],
};
const NIGHT_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.12, 0.11, 0.16]], [-8, [0.14, 0.13, 0.2]], [6, [0.18, 0.18, 0.3]], [40, [0.16, 0.17, 0.32]], [90, [0.13, 0.15, 0.3]]],
  boxes: [{ az: 160, el: 20, rot: 0, w: 30, h: 16, soft: 12, col: [0.9, 0.62, 0.36] }],
};

// =====================================================================================================================
// the interface
// =====================================================================================================================
export type HongmenSet = {
  /** every place's group (meshes AND lights), all hidden until setPlace */
  group: THREE.Group;
  /** the real privy (its seat, cameras and anchors: sets/privy.ts) */
  privy: PrivySet;
  /** the place that shows now, or null */
  readonly place: Place | null;
  /** shows this place only (idempotent). "nightL" and "dayL" are the same island with the night / day light. */
  setPlace(p: Place | null): void;
  /** the look of a place: background, AO, the figures' light, bloom, grade */
  look(p: Place): PlaceLook;
  /** bt/pbr materials lit by this place's fill (for a segment's own meshes in that place) */
  mats(p: Place): Mats;
  /** hides the tent walls (and roof) the camera stands behind; call with the camera's world position (the engine does,
   *  every frame, in endFrame) */
  setView(camPos: THREE.Vector3): void;
  /** where the key light's shadow frustum of the place that shows is centred (the engine: endFrame) */
  setFocus(x: number, z: number): void;
  /** the command tent's door flap, seen from inside (tent) and outside (camp): 0 = hanging shut .. 1 = lifted open.
   *  Reset to 0 by the World's beginFrame: a shot that wants it open says so every frame. */
  setFlap(k: number): void;
  /** the sun disc in the sky of "camp" (line 19: time passes): u 0..1 across the sky, null = no disc (the default) */
  setSun(u: number | null): void;
  /** the pawn blocks on the sand table ("card", line 4): how many ROWS stand, front row first (rows of the 40 block
   *  0..10, rows of the 10 block 0..5); a fraction = the newest row falling in from 0.5 m; null = the whole block
   *  stands. Reset to (null, null) by the World's beginFrame: both blocks stand unless the shot says otherwise. */
  setArmies(rows40: number | null, rows10: number | null): void;
  /** flames, banners: a pure function of t (seconds) */
  animate(t: number): void;
  /** the frame's defaults (flap shut, no sun disc): the World's beginFrame calls it */
  reset(): void;
};

// =====================================================================================================================
// block-out helpers
// =====================================================================================================================
const box = (g: THREE.Object3D, mat: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, cast = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = cast; m.receiveShadow = true; g.add(m);
  return m;
};
const cyl = (g: THREE.Object3D, mat: THREE.Material, r0: number, r1: number, h: number, x: number, y: number, z: number, seg = 16) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m);
  return m;
};
const ground = (g: THREE.Object3D, mat: THREE.Material, w: number, d: number, x: number, z: number, y = 0) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat);
  m.position.set(x, y, z); m.receiveShadow = true; g.add(m);
  return m;
};
/** one merged mesh of many copies (pawn crowds, a palisade): the copies never move */
const merged = (g: THREE.Object3D, mat: THREE.Material, geos: THREE.BufferGeometry[]) => {
  const m = new THREE.Mesh(mergeGeometries(geos.map((q) => (q.index ? q.toNonIndexed() : q)), false), mat);
  m.castShadow = m.receiveShadow = true; g.add(m);
  return m;
};
type Crowd = { at: THREE.Vector3; cols: number; rows: number; dx: number; dz: number };
/** a block of pawns (a body and a head each), front-row centre at c.at, rows going back (-z) */
const pawns = (g: THREE.Object3D, body: THREE.Material, skin: THREE.Material, c: Crowd, s = 1) => {
  const b: THREE.BufferGeometry[] = [], hd: THREE.BufferGeometry[] = [];
  for (let i = 0; i < c.cols * c.rows; i++) {
    const x = c.at.x + ((i % c.cols) - (c.cols - 1) / 2) * c.dx, z = c.at.z - Math.floor(i / c.cols) * c.dz;
    b.push(new THREE.CylinderGeometry(0.13 * s, 0.17 * s, 0.8 * s, 10).translate(x, 0.4 * s, z));
    hd.push(new THREE.SphereGeometry(0.17 * s, 12, 10).translate(x, 0.98 * s, z));
  }
  merged(g, body, b); merged(g, skin, hd);
};
/** the three lights every place has (see the contract at the top): a shadowed key toward `dir` over a square of
 *  +-half metres round `at`, a hemisphere, a point light (off unless given) */
const lightRig = (g: THREE.Group, o: { dir: V3; k: number; col: string; at: V3; half: number; hemi: [string, string, number]; point?: { col: string; k: number; at: V3; dist: number } }) => {
  const key = new THREE.DirectionalLight(o.col, o.k), d = V(...o.dir).normalize(), at = V(...o.at);
  key.position.copy(at).addScaledVector(d, 30); key.target.position.copy(at);
  key.castShadow = true; key.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  key.shadow.radius = LIGHTS.shadow.radius; key.shadow.bias = LIGHTS.shadow.bias; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -o.half, right: o.half, bottom: -o.half, top: o.half, near: 1, far: 80 }); key.shadow.camera.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight(o.hemi[0], o.hemi[1], o.hemi[2]);
  const p = o.point, point = new THREE.PointLight(p?.col ?? "#ffffff", p?.k ?? 0, p?.dist ?? 4, 2);
  point.position.set(...(p?.at ?? o.at));
  g.add(key, key.target, hemi, point);
  return { key, hemi, point };
};
const SUN_DIR: V3 = [-0.4997, 0.5496, 0.6695];

// =====================================================================================================================
// the builder
// =====================================================================================================================
export function buildSets(gl: THREE.WebGLRenderer): HongmenSet {
  for (const p of PLACES) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(BAKED_LIGHT)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const MP = mats(studio, makeEnv(gl, PRIVY_FILL)), MT = mats(studio, makeEnv(gl, TENT_ENV)), MD = mats(studio, makeEnv(gl, YARD_FILL)), MN = mats(studio, makeEnv(gl, NIGHT_FILL));
  const group = new THREE.Group(); group.name = "hongmen-sets";
  const island = (name: string) => { const g = new THREE.Group(); g.name = name; g.visible = false; group.add(g); return g; };
  const basic = (col: string | THREE.Color) => new THREE.MeshBasicMaterial({ color: col });

  // ---------------------------------------------------------------------------------------------------- the privy (real)
  const privy = buildPrivy(MP, { variant: "B" });
  privy.group.visible = false; group.add(privy.group);

  // ---------------------------------------------------------------------------------------------------- the tent (REAL: sets/tent.ts)
  const tentSet = buildTent(MT), tent = tentSet.group;
  tent.visible = false; group.add(tent);

  // ---------------------------------------------------------------------------------------------------- outside the tent door (sets/outdoor.ts)
  const campB = buildFacade(MD), camp = campB.group; group.add(camp);

  // ---------------------------------------------------------------------------------------------------- the camp gate (sets/outdoor.ts)
  const gateB = buildGate(MD), gate = gateB.group; group.add(gate);

  // ---------------------------------------------------------------------------------------------------- Xiang Yu's quarters at night; Liu Bang's camp by night and by day (sets/night.ts)
  const nightXB = buildNightX(MN), nightX = nightXB.group; group.add(nightX);
  const campLN = buildLiuCamp(MN, true), campLD = buildLiuCamp(MD, false); group.add(campLN.group, campLD.group);

  // ---------------------------------------------------------------------------------------------------- the sand table (sets/card.ts)
  const cardB = buildCard(MD), card = cardB.group; group.add(card);

  // ---------------------------------------------------------------------------------------------------- the hill road (sets/outdoor.ts)
  const pathB = buildPath(MD), path = pathB.group; group.add(path);

  // ---------------------------------------------------------------------------------------------------- the interface
  const groupOf: Record<Place, THREE.Object3D> = { privy: privy.group, tent, camp, gate, nightX, nightL: campLN.group, dayL: campLD.group, card, path };
  const matsOf: Record<Place, Mats> = { privy: MP, tent: MT, camp: MD, gate: MD, nightX: MN, nightL: MN, dayL: MD, card: MD, path: MD };
  let place: Place | null = null;
  const set: HongmenSet = {
    group, privy,
    get place() { return place; },
    setPlace(p) {
      place = p;
      for (const g of new Set(Object.values(groupOf))) g.visible = p !== null && groupOf[p] === g;
    },
    look: (p) => PLACE_LOOKS[p],
    mats: (p) => matsOf[p],
    setView(c) { tentSet.setView(c); },
    setFocus() { /* the block-outs' shadow frustums are fixed and cover their whole place */ },
    setFlap(k) { tentSet.setFlap(k); campB.setFlap(k); },
    setSun(u) { campB.setSun(u); },
    setArmies(a, b) { cardB.setArmies(a, b); },
    animate(t) {
      privy.animate(t);
      tentSet.animate(t);
      gateB.animate(t); nightXB.animate(t); campLN.animate(t); campLD.animate(t); campB.animate(t); cardB.animate(t); pathB.animate(t);
    },
    reset() { set.setFlap(0); set.setSun(null); set.setArmies(null, null); },
  };
  set.reset();
  return set;
}
