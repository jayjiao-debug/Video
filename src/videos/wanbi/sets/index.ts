// THE PLACES of the Wanbi film behind ONE interface (WanbiSet). The World (world.ts) builds it once per page.
// FINAL in WP1b (frozen like world.ts): the place builders (sets/hall.ts WP2, sets/zhao.ts + sets/road.ts WP3) replace
// their block-outs WITHOUT changing a name or a signature here; shots only ever talk to the WanbiSet.
//
// The contract a place must keep (as Hongmen's):
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot leak);
//     the islands are far apart along x (hall 0, zhao 40, road 80), so a missed toggle never shows a hall wall in Zhao;
//   - EVERY place has the same light kinds (kit sets/okit.ts lightRig: one shadowed directional key + one hemisphere +
//     one point light, which may be 0): three.js compiles a material's program per light set-up, so equal set-ups
//     share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (BAKED_LIGHT: bleach, bodyShadeK, contact): the
//     rig bakes them into a figure when it is first built, and figures are built lazily, so a different value per
//     place would make a figure look different depending on which frame of a farm chunk built it. buildSets throws if
//     a place disagrees;
//   - every setter is a pure function of its argument; animate(t) is a pure function of t; seeded painting only;
//   - walls the camera stands behind are HIDDEN by setView (never left to culling: a culled wall still inks).
import * as THREE from "three";
import { makeEnv, mats, type EnvSpec, type Mats } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { CastLight } from "../../group/kit/cast";
import { makeKit } from "../../../kit/props/kit";
import { PLACES, type Place } from "../story";
import { buildHall, HALL_LOOK } from "./hall";
import { buildZhao, ZHAO_LOOK } from "./zhao";
import { buildRoad, ROAD_LOOK } from "./road";

export type { Place };

// =====================================================================================================================
// the look of a place
// =====================================================================================================================
export type AO = { aoRadius: number; distanceFalloff: number; intensity: number; color: string };
/** what the engine needs to know about a place besides its meshes */
export type PlaceLook = {
  /** scene.background (a CSS colour) */ bg: string;
  /** N8AO */ ao: AO;
  /** the rig figures' light in this place (group/kit/cast CastLight; BAKED_LIGHT's three values as in every place) */ cast: CastLight;
  /** the bt/pbr fill the place's materials (and its props kit) are lit by */ fill: EnvSpec;
  /** bloom intensity (default Film.tsx 0.35) */ bloom?: number;
  /** the place's grade (default Film.tsx GRADE_FILM) */ grade?: GradeParams;
};
/** the three CastLight values that are baked into a figure when it is first built: IDENTICAL in every place (equal to
 *  Hongmen's) */
export const BAKED_LIGHT = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;
/** the looks of the three places (sets/hall.ts, zhao.ts, road.ts own their values) */
export const PLACE_LOOKS: Record<Place, PlaceLook> = { hall: HALL_LOOK, zhao: ZHAO_LOOK, road: ROAD_LOOK };

// =====================================================================================================================
// the interface
// =====================================================================================================================
export interface WanbiSet {
  /** every place's group (meshes AND lights), all hidden until setPlace */
  group: THREE.Group;
  /** the place that shows now, or null */
  readonly place: Place | null;
  /** shows this place only (idempotent) */
  setPlace(p: Place | null): void;
  /** the look of a place: background, AO, the figures' light, the fill, bloom, grade */
  look(p: Place): PlaceLook;
  /** bt/pbr materials lit by this place's fill (for a segment's own meshes in that place) */
  mats(p: Place): Mats;
  /** hides the walls the camera stands behind; call with the camera's world position (the engine does, every frame,
   *  in endFrame: never a segment) */
  setView(camPos: THREE.Vector3): void;
  /** where the key light's shadow frustum of the place that shows is centred, [x, z] (the engine: endFrame). The
   *  block-outs' frustums are fixed and cover their whole place. */
  setFocus(v: [number, number]): void;
  /** the hall's ceremony dressing (lines 17-22: banners, mat runner, drum): 0 = off .. 1 = on. Reset to 0 by the
   *  World's beginFrame: a shot that wants it says so every frame (beats.ts BEAT.ceremony) */
  setCeremony(k: number): void;
  /** the hall's map stand (12b-15, beats.ts BEAT.mapStand). Reset to off by beginFrame */
  setMapStand(on: boolean): void;
  /** banners, the road's sky: a pure function of t (seconds; Pose.clock ?? f / FPS) */
  animate(t: number): void;
  /** the frame's defaults (ceremony 0, map stand off): the World's beginFrame calls it */
  reset(): void;
}

// =====================================================================================================================
// the builder
// =====================================================================================================================
export function buildSets(gl: THREE.WebGLRenderer): WanbiSet {
  for (const p of PLACES) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(BAKED_LIGHT)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const matsOf = {} as Record<Place, Mats>;
  for (const p of PLACES) matsOf[p] = mats(studio, makeEnv(gl, PLACE_LOOKS[p].fill));
  const group = new THREE.Group(); group.name = "wanbi-sets";
  const hall = buildHall(makeKit(matsOf.hall)), zhao = buildZhao(makeKit(matsOf.zhao)), road = buildRoad(makeKit(matsOf.road));
  const groupOf: Record<Place, THREE.Object3D> = { hall: hall.group, zhao: zhao.group, road: road.group };
  for (const g of Object.values(groupOf)) { g.visible = false; group.add(g); }
  let place: Place | null = null;
  const set: WanbiSet = {
    group,
    get place() { return place; },
    setPlace(p) {
      place = p;
      for (const k of PLACES) groupOf[k].visible = p === k;
    },
    look: (p) => PLACE_LOOKS[p],
    mats: (p) => matsOf[p],
    setView(c) { hall.view(c); zhao.view(c); road.view(c); },
    setFocus(v) { void v; },
    setCeremony(k) { hall.ceremony(k); },
    setMapStand(on) { hall.mapStand(on); },
    animate(t) { road.animate(t); },
    reset() { set.setCeremony(0); set.setMapStand(false); },
  };
  set.reset();
  return set;
}
