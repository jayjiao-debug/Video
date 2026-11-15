// THE PLACES of the Su film behind ONE interface (SuSet). The World (world.ts) builds it once per page. WP1; the place
// builders (sets/market.ts ... sets/temple.ts, WP2a / WP2b) replace their BLOCK-OUTS WITHOUT changing a name or a
// signature here; shots only ever talk to the SuSet (w.set).
//
// A PLACE BUILDER (sets/<place>.ts) exports three things:
//   <PLACE>_LOOK: PlaceLook                         the figures' light, background, AO, bt/pbr fill (+ bloom, grade)
//   <PLACE>_PARAMS: Record<string, ParamValue>      its per-frame dressing: every name it understands, with its default
//   build<Place>(K: Kit) -> PlaceBuild              { group, view?(camPos), animate?(t, f), setParam?(name, value) }
// and keeps the contract (as Qin's / Wanbi's / Hongmen's):
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot leak);
//     built in WORLD coordinates round its island x (layout.ts ISLAND: market 0, yard 100 ... temple 700);
//   - EVERY place has the same light kinds (kit sets/okit.ts lightRig: one shadowed directional key + one hemisphere +
//     one point light, which may be 0): three.js compiles a material's program per light set-up, so equal set-ups
//     share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (BAKED_LIGHT: bleach, bodyShadeK, contact): the
//     rig bakes them into a figure when it is first built, and figures are built lazily; buildSets throws if a place
//     disagrees;
//   - setParam(name, value) is a pure function of its argument and animate(t, f) of t / f; seeded painting only;
//   - walls the camera stands behind are HIDDEN by view() (never left to culling: a culled wall still inks);
//   - what is a PROP is not in the set (PLAN 4: the chopping block, the stove, the bench, the ladder, the rattan bed,
//     the desk, the trunks, the plough, the boat, the fire's logs if WP3 makes them): the set draws the place, its own
//     dressing params and nothing a figure holds or moves.
//
// SET PARAMS (the per-frame dressing): w.set.param(name, value) sets one on the place that shows (call it after
// w.setPlace, every frame you need it: the World's beginFrame resets EVERY param of every place to its default). The
// names: PARAMS below (each place's own list); an unknown name, or a value of the wrong kind, throws. (PLAN 1)
//   market     crowd 0..1 (1)                      the far background extras (flat silhouettes the set draws)
//   yard       sun "morning" | "noon" | "afternoon" ("morning"), lantern 0..1 (0: the red lantern on the eave),
//              shells 0..1 (0: the lychee-shell pile at the bed's foot, 1 = up to his knee)
//   room       sun 0..1 (1: the gold evening light through the window)
//   huangzhou  vignette "slope" | "pot" ("slope"), lid 0..1 (0 shut .. 1 off and aside), steam 0..1 (1)
//   pines      moon 0..1 (1), glow 0..1 (0), glowX / glowY / glowZ (numbers: the world point of the lantern's warm glow:
//              the place's point light IS the lantern's light; default near PINES.su)
//   river      dawn 0..1 (0.6)
//   beach      fire 0..1 (1: the fire's flicker and glow)
//   temple     (none)
import * as THREE from "three";
import { makeEnv, mats, type EnvSpec, type Mats } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { CastLight } from "../../group/kit/cast";
import { makeKit, type Kit } from "../../../kit/props/kit";
import { PLACES, type Place } from "../story";
import { buildMarket, MARKET_LOOK, MARKET_PARAMS } from "./market";
import { buildYard, YARD_LOOK, YARD_PARAMS } from "./yard";
import { buildRoom, ROOM_LOOK, ROOM_PARAMS } from "./room";
import { buildHuangzhou, HUANGZHOU_LOOK, HUANGZHOU_PARAMS } from "./huangzhou";
import { buildPines, PINES_LOOK, PINES_PARAMS } from "./pines";
import { buildRiver, RIVER_LOOK, RIVER_PARAMS } from "./river";
import { buildBeach, BEACH_LOOK, BEACH_PARAMS } from "./beach";
import { buildTemple, TEMPLE_LOOK, TEMPLE_PARAMS } from "./temple";

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
 *  Qin's, Wanbi's and Hongmen's) */
export const BAKED_LIGHT = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;
/** the looks of the eight places (each place file owns its values) */
export const PLACE_LOOKS: Record<Place, PlaceLook> = {
  market: MARKET_LOOK, yard: YARD_LOOK, room: ROOM_LOOK, huangzhou: HUANGZHOU_LOOK, pines: PINES_LOOK, river: RIVER_LOOK, beach: BEACH_LOOK, temple: TEMPLE_LOOK,
};

// =====================================================================================================================
// the per-frame dressing
// =====================================================================================================================
export type ParamValue = number | string | boolean;
/** every place's param names with their defaults (the place files own their lists) */
export const PARAMS: Record<Place, Record<string, ParamValue>> = {
  market: MARKET_PARAMS, yard: YARD_PARAMS, room: ROOM_PARAMS, huangzhou: HUANGZHOU_PARAMS, pines: PINES_PARAMS, river: RIVER_PARAMS, beach: BEACH_PARAMS, temple: TEMPLE_PARAMS,
};
/** what a place builder returns */
export type PlaceBuild = {
  group: THREE.Group;
  /** hides what the camera stands behind (the camera's world position) */
  view?(camPos: THREE.Vector3): void;
  /** the place's own motion: a pure function of t (seconds: Pose.clock ?? f / FPS) and the frame f */
  animate?(t: number, f: number): void;
  /** one param of PARAMS[place] (the set calls it only with a known name and a value of the default's kind) */
  setParam?(name: string, value: ParamValue): void;
};

// =====================================================================================================================
// the interface
// =====================================================================================================================
export interface SuSet {
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
  /** hides the walls the camera stands behind; called by the engine (endFrame) with the camera's world position */
  setView(camPos: THREE.Vector3): void;
  /** where the key light's shadow frustum of the place that shows is centred, [x, z] (the engine: endFrame). The
   *  block-outs' frustums are fixed and cover the stand-in staging. */
  setFocus(v: [number, number]): void;
  /** THE PER-FRAME DRESSING of the place that shows: set.param("lantern", 1). Call after w.setPlace, every frame:
   *  beginFrame resets every param to its default. Throws before setPlace, on a name the place does not have (PARAMS)
   *  and on a value of the wrong kind. */
  param(name: string, value: ParamValue): void;
  /** the value a param of the place that shows has now (its default unless a shot set it this frame) */
  getParam(name: string): ParamValue;
  /** the place's own motion: a pure function of t (seconds; Pose.clock ?? f / FPS) and f */
  animate(t: number, f: number): void;
  /** every param of every place back to its default: the World's beginFrame calls it */
  reset(): void;
}

// =====================================================================================================================
// the builder
// =====================================================================================================================
const BUILD: Record<Place, (K: Kit) => PlaceBuild> = {
  market: buildMarket, yard: buildYard, room: buildRoom, huangzhou: buildHuangzhou, pines: buildPines, river: buildRiver, beach: buildBeach, temple: buildTemple,
};

export function buildSets(gl: THREE.WebGLRenderer): SuSet {
  for (const p of PLACES) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(BAKED_LIGHT)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const matsOf = {} as Record<Place, Mats>;
  for (const p of PLACES) matsOf[p] = mats(studio, makeEnv(gl, PLACE_LOOKS[p].fill));
  const group = new THREE.Group(); group.name = "su-sets";
  const built = {} as Record<Place, PlaceBuild>;
  for (const p of PLACES) { built[p] = BUILD[p](makeKit(matsOf[p])); built[p].group.visible = false; group.add(built[p].group); }
  // the params' current values (start: nothing applied, so reset() pushes every default once)
  const cur = {} as Record<Place, Record<string, ParamValue | undefined>>;
  for (const p of PLACES) cur[p] = {};
  const apply = (p: Place, name: string, v: ParamValue) => {
    if (cur[p][name] === v) return;
    cur[p][name] = v;
    built[p].setParam?.(name, v);
  };
  let place: Place | null = null;
  const set: SuSet = {
    group,
    get place() { return place; },
    setPlace(p) {
      place = p;
      for (const k of PLACES) built[k].group.visible = p === k;
    },
    look: (p) => PLACE_LOOKS[p],
    mats: (p) => matsOf[p],
    setView(c) { for (const p of PLACES) built[p].view?.(c); },
    setFocus(v) { void v; },
    param(name, v) {
      if (!place) throw new Error(`set.param("${name}") before w.setPlace(place)`);
      const def = PARAMS[place];
      if (!(name in def)) throw new Error(`set.param: the ${place} has no param "${name}" (it has: ${Object.keys(def).join(", ") || "none"})`);
      if (typeof v !== typeof def[name]) throw new Error(`set.param("${name}", ${JSON.stringify(v)}): the ${place}'s "${name}" is a ${typeof def[name]}`);
      apply(place, name, v);
    },
    getParam(name) {
      if (!place) throw new Error(`set.getParam("${name}") before w.setPlace(place)`);
      if (!(name in PARAMS[place])) throw new Error(`set.getParam: the ${place} has no param "${name}"`);
      return cur[place][name] ?? PARAMS[place][name];
    },
    animate(t, f) { if (place) built[place].animate?.(t, f); },
    reset() { for (const p of PLACES) for (const [k, v] of Object.entries(PARAMS[p])) apply(p, k, v); },
  };
  set.reset();
  return set;
}
