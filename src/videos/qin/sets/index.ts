// THE PLACES of the Qin film behind ONE interface (QinSet). The World (world.ts) builds it once per page. WP1; the place
// builders (sets/corridor.ts ... sets/museum.ts, WP2) replace their block-outs WITHOUT changing a name or a signature
// here; shots only ever talk to the QinSet (w.set). The hall is IMPORTED from Wanbi (src/videos/wanbi/sets/hall.ts).
//
// A PLACE BUILDER (sets/<place>.ts) exports three things:
//   <PLACE>_LOOK: PlaceLook                         the figures' light, background, AO, bt/pbr fill (+ bloom, grade)
//   <PLACE>_PARAMS: Record<string, ParamValue>      its per-frame dressing: every name it understands, with its default
//   build<Place>(K: Kit) -> PlaceBuild              { group, view?(camPos), animate?(t, f), setParam?(name, value) }
// and keeps the contract (as Wanbi's / Hongmen's):
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot leak);
//     built in WORLD coordinates round its island x (layout.ts ISLAND: hall 0, corridor 100 ... museum 600);
//   - EVERY place has the same light kinds (kit sets/okit.ts lightRig: one shadowed directional key + one hemisphere +
//     one point light, which may be 0): three.js compiles a material's program per light set-up, so equal set-ups
//     share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (BAKED_LIGHT: bleach, bodyShadeK, contact): the
//     rig bakes them into a figure when it is first built, and figures are built lazily; buildSets throws if a place
//     disagrees;
//   - setParam(name, value) is a pure function of its argument and animate(t, f) of t / f; seeded painting only;
//   - walls the camera stands behind are HIDDEN by view() (never left to culling: a culled wall still inks).
//
// SET PARAMS (the per-frame dressing): w.set.param(name, value) sets one on the place that shows (call it after
// w.setPlace, every frame you need it: the World's beginFrame resets EVERY param of every place to its default). The
// names: PARAMS below (each place's own list); an unknown name, or a value of the wrong kind, throws.
//   corridor  dawn 0..1                     hall      ceremony 0..1, mapStand on/off (Wanbi's hall dressing)
//   terrace   carriages 0..1, wind 0..1     table     tableau "sea" | "taishan" | "xiangshan", bare 0..1, rain 0..1, storm 0..1
//   night     moon 0..1                     road      flies on/off, heat 0..1          museum    light 0..1
import * as THREE from "three";
import { makeEnv, mats, type EnvSpec, type Mats } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { CastLight } from "../../group/kit/cast";
import { makeKit, type Kit } from "../../../kit/props/kit";
import { buildHall, HALL_LOOK as WANBI_HALL_LOOK } from "../../wanbi/sets/hall";
import { PLACES, type Place } from "../story";
import { buildCorridor, CORRIDOR_LOOK, CORRIDOR_PARAMS } from "./corridor";
import { buildTerrace, TERRACE_LOOK, TERRACE_PARAMS } from "./terrace";
import { buildTable, TABLE_LOOK, TABLE_PARAMS } from "./table";
import { buildNight, NIGHT_LOOK, NIGHT_PARAMS } from "./night";
import { buildRoad, ROAD_LOOK, ROAD_PARAMS } from "./road";
import { buildMuseum, MUSEUM_LOOK, MUSEUM_PARAMS } from "./museum";

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
 *  Wanbi's and Hongmen's) */
export const BAKED_LIGHT = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;
/** the hall's look: Wanbi's (black and gold, a warm key from the upper left front) */
export const HALL_LOOK: PlaceLook = WANBI_HALL_LOOK as PlaceLook;
/** the looks of the seven places (each place file owns its values) */
export const PLACE_LOOKS: Record<Place, PlaceLook> = {
  corridor: CORRIDOR_LOOK, hall: HALL_LOOK, terrace: TERRACE_LOOK, table: TABLE_LOOK, night: NIGHT_LOOK, road: ROAD_LOOK, museum: MUSEUM_LOOK,
};

// =====================================================================================================================
// the per-frame dressing
// =====================================================================================================================
export type ParamValue = number | string | boolean;
/** the hall's dressing: Wanbi's ceremony (banners, mat runner, drum) and map stand, both off by default */
export const HALL_PARAMS: Record<string, ParamValue> = { ceremony: 0, mapStand: false };
/** every place's param names with their defaults (the place files own their lists) */
export const PARAMS: Record<Place, Record<string, ParamValue>> = {
  corridor: CORRIDOR_PARAMS, hall: HALL_PARAMS, terrace: TERRACE_PARAMS, table: TABLE_PARAMS, night: NIGHT_PARAMS, road: ROAD_PARAMS, museum: MUSEUM_PARAMS,
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
export interface QinSet {
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
  /** THE PER-FRAME DRESSING of the place that shows: set.param("carriages", 0.2). Call after w.setPlace, every frame:
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
/** Wanbi's hall as a place build of this film */
const hallPlace = (K: Kit): PlaceBuild => {
  const h = buildHall(K);
  return {
    group: h.group,
    view: (c) => h.view(c),
    animate: (t) => h.animate(t),
    setParam(name, v) { if (name === "ceremony") h.ceremony(Number(v)); else if (name === "mapStand") h.mapStand(Boolean(v)); },
  };
};
const BUILD: Record<Place, (K: Kit) => PlaceBuild> = {
  corridor: buildCorridor, hall: hallPlace, terrace: buildTerrace, table: buildTable, night: buildNight, road: buildRoad, museum: buildMuseum,
};

export function buildSets(gl: THREE.WebGLRenderer): QinSet {
  for (const p of PLACES) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(BAKED_LIGHT)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const matsOf = {} as Record<Place, Mats>;
  for (const p of PLACES) matsOf[p] = mats(studio, makeEnv(gl, PLACE_LOOKS[p].fill));
  const group = new THREE.Group(); group.name = "qin-sets";
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
  const set: QinSet = {
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
