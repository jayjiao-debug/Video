// THE PLACES of the Newton film behind ONE interface (NewtonSet). The World (world.ts) builds it once per page. WP1; the
// place builders (sets/stairs.ts ... sets/elaboratory.ts, WP2) write their places WITHOUT changing a name or a signature
// here; shots only ever talk to the NewtonSet (w.set). Until a place's real set is wired below (REAL), the place is
// WP1's block-out (sets/blockout.ts STUB) with the same param names.
//
// A PLACE BUILDER (sets/<place>.ts) exports three things:
//   <PLACE>_LOOK: PlaceLook                         the figures' light, background, AO, bt/pbr fill (+ bloom, grade)
//   <PLACE>_PARAMS: Record<string, ParamValue>      its per-frame dressing: every name it understands, with its default
//   build<Place>(K: Kit) -> PlaceBuild              { group, view?(camPos), animate?(t, f), setParam?(name, value), cast?(t, f) }
// and keeps the contract (as Qin's / Wanbi's / Hongmen's):
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot leak);
//     built in WORLD coordinates round its island x (layout/base.ts ISLAND: stairs 100, room 200 ... elaboratory 600);
//   - EVERY place has the same light kinds (kit sets/okit.ts lightRig: one shadowed directional key + one hemisphere +
//     one point light, which may be 0): three.js compiles a material's program per light set-up, so equal set-ups
//     share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (BAKED_LIGHT: bleach, bodyShadeK, contact): the
//     rig bakes them into a figure when it is first built, and figures are built lazily; buildSets throws if a place
//     disagrees;
//   - THE FIGURE LIGHT FOLLOWS THE PARAMS: cast?(t, f) returns the CastLight fields for the place's CURRENT params and
//     frame (the room's hour, the garden's time, the elaboratory's fire flicker); the World lays it over PlaceLook.cast
//     in w.update() (after the shot's set.param calls): { ...look.cast, ...build.cast(t, f), ...setPlace's light, ...BAKED_LIGHT };
//   - setParam(name, value) is a pure function of its argument, animate(t, f) and cast(t, f) of t / f; seeded painting only;
//   - walls the camera stands behind are HIDDEN by view() (never left to culling: a culled wall still inks).
//
// SET PARAMS (the per-frame dressing): w.set.param(name, value) sets one on the place that shows (call it after
// w.setPlace and before w.update(), every frame you need it: the World's beginFrame resets EVERY param of every place
// to its default). The names: PARAMS below (each place's own list); an unknown name, or a value of the wrong kind, throws.
//   stairs   door 0..1 (open), glow 0..1 (the candle light under the door)
//   room     hour "morning" | "noon" | "evening" | "night"
//   garden   time "noon" | "night", glow 0..1 (the elaboratory's door + chimney), window 0..1 (his window lit)
//   street   (none)          schools  dust 0..1          elaboratory  fire 0..1, candle 0..1 (its length)
import * as THREE from "three";
import { makeEnv, mats, type EnvSpec, type Mats } from "../../bt/pbr";
import type { GradeParams } from "../../vasa/grade";
import type { CastLight } from "../../group/kit/cast";
import { makeKit, type Kit } from "../../../kit/props/kit";
import { PLACES, type Place } from "../story";
import { STUB } from "./blockout";
// THE REAL PLACES (WP2): one import per place as it lands (the rest stay block-outs)
import { buildStairs, STAIRS_LOOK, STAIRS_PARAMS } from "./stairs";
import { buildRoom, ROOM_LOOK, ROOM_PARAMS } from "./room";
import { buildGarden, GARDEN_LOOK, GARDEN_PARAMS } from "./garden";
import { buildStreet, STREET_LOOK, STREET_PARAMS } from "./street";
import { buildSchools, SCHOOLS_LOOK, SCHOOLS_PARAMS } from "./schools";
import { buildElaboratory, ELAB_LOOK, ELAB_PARAMS } from "./elaboratory";

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
export type ParamValue = number | string | boolean;
/** what a place builder returns */
export type PlaceBuild = {
  group: THREE.Group;
  /** hides what the camera stands behind (the camera's world position) */
  view?(camPos: THREE.Vector3): void;
  /** the place's own motion: a pure function of t (seconds: Pose.clock ?? f / FPS) and the frame f */
  animate?(t: number, f: number): void;
  /** one param of PARAMS[place] (the set calls it only with a known name and a value of the default's kind) */
  setParam?(name: string, value: ParamValue): void;
  /** the figures' light for the CURRENT params and frame (laid over PlaceLook.cast by the World in w.update()) */
  cast?(t: number, f: number): Partial<CastLight>;
};
type PlaceDef = { look: PlaceLook; params: Record<string, ParamValue>; build: (K: Kit) => PlaceBuild };

/** each place: WP2's real set where it is wired, else WP1's block-out */
const DEF: Record<Place, PlaceDef> = {
  stairs: { look: STAIRS_LOOK, params: STAIRS_PARAMS, build: buildStairs },
  room: { look: ROOM_LOOK, params: ROOM_PARAMS, build: buildRoom },
  garden: { look: GARDEN_LOOK, params: GARDEN_PARAMS, build: buildGarden },
  street: { look: STREET_LOOK, params: STREET_PARAMS, build: buildStreet },
  schools: { look: SCHOOLS_LOOK, params: SCHOOLS_PARAMS, build: buildSchools },
  elaboratory: { look: ELAB_LOOK, params: ELAB_PARAMS, build: buildElaboratory },
};
/** which places are still block-outs (the previews and the README say so) */
export const STUBBED: Place[] = PLACES.filter((p) => DEF[p] === STUB[p]);
/** the looks of the six places (each place file owns its values) */
export const PLACE_LOOKS = Object.fromEntries(PLACES.map((p) => [p, DEF[p].look])) as Record<Place, PlaceLook>;
/** every place's param names with their defaults (the place files own their lists) */
export const PARAMS = Object.fromEntries(PLACES.map((p) => [p, DEF[p].params])) as Record<Place, Record<string, ParamValue>>;

// =====================================================================================================================
// the interface
// =====================================================================================================================
export interface NewtonSet {
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
  /** where the key light's shadow frustum of the place that shows is centred, [x, z] (the engine: endFrame) */
  setFocus(v: [number, number]): void;
  /** THE PER-FRAME DRESSING of the place that shows: set.param("hour", "noon"). Call after w.setPlace, every frame:
   *  beginFrame resets every param to its default. Throws before setPlace, on a name the place does not have (PARAMS)
   *  and on a value of the wrong kind. */
  param(name: string, value: ParamValue): void;
  /** the value a param of the place that shows has now (its default unless a shot set it this frame) */
  getParam(name: string): ParamValue;
  /** the figures' light of the place that shows for its current params and frame (its build's cast(), or {}) */
  cast(t: number, f: number): Partial<CastLight>;
  /** the place's own motion: a pure function of t (seconds; Pose.clock ?? f / FPS) and f */
  animate(t: number, f: number): void;
  /** every param of every place back to its default: the World's beginFrame calls it */
  reset(): void;
}

// =====================================================================================================================
// the builder
// =====================================================================================================================
export function buildSets(gl: THREE.WebGLRenderer): NewtonSet {
  for (const p of PLACES) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(BAKED_LIGHT)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const matsOf = {} as Record<Place, Mats>;
  for (const p of PLACES) matsOf[p] = mats(studio, makeEnv(gl, PLACE_LOOKS[p].fill));
  const group = new THREE.Group(); group.name = "newton-sets";
  const built = {} as Record<Place, PlaceBuild>;
  for (const p of PLACES) { built[p] = DEF[p].build(makeKit(matsOf[p])); built[p].group.visible = false; group.add(built[p].group); }
  // the params' current values (start: nothing applied, so reset() pushes every default once)
  const cur = {} as Record<Place, Record<string, ParamValue | undefined>>;
  for (const p of PLACES) cur[p] = {};
  const apply = (p: Place, name: string, v: ParamValue) => {
    if (cur[p][name] === v) return;
    cur[p][name] = v;
    built[p].setParam?.(name, v);
  };
  let place: Place | null = null;
  const set: NewtonSet = {
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
    cast(t, f) { return place ? built[place].cast?.(t, f) ?? {} : {}; },
    animate(t, f) { if (place) built[place].animate?.(t, f); },
    reset() { for (const p of PLACES) for (const [k, v] of Object.entries(PARAMS[p])) apply(p, k, v); },
  };
  set.reset();
  return set;
}
