// THE PLACES of a day film behind ONE interface (DaySet). The World builds it once per page; shots only ever talk to
// the DaySet (w.set). Taken from Newton's sets/index.ts (the same machinery in all four day films).
//
// A PLACE BUILDER (sets/<place>.ts in the film) exports three things:
//   <PLACE>_LOOK: PlaceLook                         the figures' light, background, AO, bt/pbr fill (+ bloom, grade)
//   <PLACE>_PARAMS: Record<string, ParamValue>      its per-frame dressing: every name it understands, with its default
//   build<Place>(K: Kit) -> PlaceBuild              { group, view?(camPos), animate?(t, f), setParam?(name, value), cast?(t, f) }
// and keeps the contract:
//   - one THREE.Group per island, its LIGHTS INSIDE the group (a hidden place costs nothing and its lamps cannot leak);
//     built in WORLD coordinates round its island x;
//   - EVERY place has the same light kinds (kit sets/okit.ts lightRig): three.js compiles a material's program per light
//     set-up, so equal set-ups share programs and a place change does not recompile the props;
//   - its figures' light (PlaceLook.cast) has the film's BAKED values (bakedLight: bleach, bodyShadeK, contact): the
//     rig bakes them into a figure when it is first built, and figures are built lazily; makeSets throws if a place
//     disagrees;
//   - THE FIGURE LIGHT FOLLOWS THE PARAMS: cast?(t, f) returns the CastLight fields for the place's CURRENT params and
//     frame; the World lays it over PlaceLook.cast in w.update();
//   - setParam(name, value) is a pure function of its argument, animate(t, f) and cast(t, f) of t / f; seeded painting;
//   - walls the camera stands behind are HIDDEN by view() (never left to culling: a culled wall still inks).
// SET PARAMS: w.set.param(name, value) on the place that shows (after w.setPlace, before w.update(), every frame: the
// World's beginFrame resets EVERY param of every place to its default). An unknown name, or a value of the wrong kind,
// throws.
import * as THREE from "three";
import { makeEnv, mats, type Mats } from "../../videos/bt/pbr";
import type { CastLight } from "../../videos/group/kit/cast";
import { makeKit, type Kit } from "../props/kit";
import type { ParamValue, PlaceBuild, PlaceLook } from "./types";

/** the three CastLight values that are baked into a figure when it is first built: IDENTICAL in every place (every
 *  toon film so far: 秦始皇, 苏东坡, 李白, Newton, 完璧归赵, 鸿门宴) */
export const BAKED_LIGHT = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;
export type BakedLight = { bleach: number; bodyShadeK: number; contact: string };
export type PlaceDef = { look: PlaceLook; params: Record<string, ParamValue>; build: (K: Kit) => PlaceBuild };

export interface DaySet<P extends string> {
  /** every place's group (meshes AND lights), all hidden until setPlace */
  group: THREE.Group;
  /** the place that shows now, or null */
  readonly place: P | null;
  /** shows this place only (idempotent) */
  setPlace(p: P | null): void;
  /** the look of a place: background, AO, the figures' light, the fill, bloom, grade */
  look(p: P): PlaceLook;
  /** bt/pbr materials lit by this place's fill (for a segment's own meshes in that place) */
  mats(p: P): Mats;
  /** hides the walls the camera stands behind; called by the engine (endFrame) with the camera's world position */
  setView(camPos: THREE.Vector3): void;
  /** where the key light's shadow frustum of the place that shows is centred, [x, z] (the engine: endFrame) */
  setFocus(v: [number, number]): void;
  /** THE PER-FRAME DRESSING of the place that shows. Throws before setPlace, on an unknown name, on a wrong kind. */
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

/** the looks and the params of a film's places, for the previews and the README */
export const placeTables = <P extends string>(places: readonly P[], defs: Record<P, PlaceDef>) => ({
  PLACE_LOOKS: Object.fromEntries(places.map((p) => [p, defs[p].look])) as Record<P, PlaceLook>,
  PARAMS: Object.fromEntries(places.map((p) => [p, defs[p].params])) as Record<P, Record<string, ParamValue>>,
});

/** builds every place of the film once: makeSets(gl, PLACES, DEF, { name: "newton" }) */
export function makeSets<P extends string>(gl: THREE.WebGLRenderer, places: readonly P[], defs: Record<P, PlaceDef>, o: { name?: string; baked?: BakedLight } = {}): DaySet<P> {
  const { PLACE_LOOKS, PARAMS } = placeTables(places, defs);
  const baked = o.baked ?? BAKED_LIGHT;
  for (const p of places) {
    const c = PLACE_LOOKS[p].cast as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(baked)) if (c[k] !== v) throw new Error(`sets: the figure light of "${p}" has ${k} = ${String(c[k])}; it must be ${String(v)} in every place (BAKED_LIGHT)`);
  }
  const studio = makeEnv(gl);
  const matsOf = {} as Record<P, Mats>;
  for (const p of places) matsOf[p] = mats(studio, makeEnv(gl, PLACE_LOOKS[p].fill));
  const group = new THREE.Group(); group.name = `${o.name ?? "day"}-sets`;
  const built = {} as Record<P, PlaceBuild>;
  for (const p of places) { built[p] = defs[p].build(makeKit(matsOf[p])); built[p].group.visible = false; group.add(built[p].group); }
  // the params' current values (start: nothing applied, so reset() pushes every default once)
  const cur = {} as Record<string, Record<string, ParamValue | undefined>>;
  for (const p of places) cur[p] = {};
  const apply = (p: P, name: string, v: ParamValue) => {
    if (cur[p][name] === v) return;
    cur[p][name] = v;
    built[p].setParam?.(name, v);
  };
  let place: P | null = null;
  const set: DaySet<P> = {
    group,
    get place() { return place; },
    setPlace(p) {
      place = p;
      for (const k of places) built[k].group.visible = p === k;
    },
    look: (p) => PLACE_LOOKS[p],
    mats: (p) => matsOf[p],
    setView(c) { for (const p of places) built[p].view?.(c); },
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
    reset() { for (const p of places) for (const [k, v] of Object.entries(PARAMS[p])) apply(p, k, v); },
  };
  set.reset();
  return set;
}
