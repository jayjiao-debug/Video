// THE SIX PLACES (sets/stairs.ts ... sets/elaboratory.ts, WP2), every named camera of every place (layout/<place>.ts
// <PLACE>_CAMS), with NEWTON (and HUMPHREY where the place has him) standing on the place's stand-in marks. It builds
// ONLY the places its views need, straight from the place files (its own env / mats / kit per place, the World's
// figure light: look.cast + build.cast() + BAKED_LIGHT), so it works whether or not sets/index.ts has wired them yet.
// One "frame" = one view, so several views render in one page:
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/set_places.ts /home/user/newton_work/film/wp2/ --pick 0,1,2 --size 540x960 --opts '{"views":["stairs.run","stairs.top","stairs.door"]}'
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/set_places.ts /home/user/newton_work/film/wp2/x.png --size 540x960 --opts '{"views":["room.plate"],"params":{"hour":"noon"}}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views    "<place>.<camera>" names (or "<place>.<camera>@<preset>", a preset of that place's PRESETS below); frame i
//            shows views[i % n] (default: every camera of every place, VIEW_NAMES)
//   place    "<place>": every camera of that place (instead of views)
//   cast     false = nobody (the empty set);  at  [x, y, z] / facing: NEWTON elsewhere than the stand mark
//   params   { name: value } set on every view after the view's own preset;  t  seconds for the place's animate
//   hide     ["name prefix", ...]: hides the set's objects whose name starts so (debugging)
// Prints  QA: view <i> <name> | place <p> | params ...
import * as THREE from "three";
import { preview, type Cam as PCam } from "./common";
import { makeEnv, mats } from "../../bt/pbr";
import { makeKit } from "../../../kit/props/kit";
import { RigCast, type Rig } from "../../group/kit/rig3d";
import type { CastLight } from "../../group/kit/cast";
import { PEOPLE, addPerson, type Person } from "../people";
import { BAKED_LIGHT, type PlaceLook, type PlaceBuild, type ParamValue } from "../sets";
import type { Cam, Stand } from "../layout/base";
import type { Place } from "../story";
import { STAIRS_LOOK, STAIRS_PARAMS, buildStairs } from "../sets/stairs";
import { STAIRS_CAMS, STAIRS_STAND } from "../layout/stairs";
import { ROOM_LOOK, ROOM_PARAMS, buildRoom } from "../sets/room";
import { ROOM_CAMS, ROOM_STAND } from "../layout/room";
import { GARDEN_LOOK, GARDEN_PARAMS, buildGarden } from "../sets/garden";
import { GARDEN_CAMS, GARDEN_STAND } from "../layout/garden";
import { STREET_LOOK, STREET_PARAMS, buildStreet } from "../sets/street";
import { STREET_CAMS, STREET_STAND } from "../layout/street";
import { SCHOOLS_LOOK, SCHOOLS_PARAMS, buildSchools } from "../sets/schools";
import { SCHOOLS_CAMS, SCHOOLS_STAND } from "../layout/schools";
import { ELAB_LOOK, ELAB_PARAMS, buildElaboratory } from "../sets/elaboratory";
import { ELAB, ELAB_CAMS, ELAB_STAND } from "../layout/elaboratory";

type PlaceDef = { look: PlaceLook; params: Record<string, ParamValue>; build: (K: ReturnType<typeof makeKit>) => PlaceBuild; cams: Record<string, Cam>; stand: Stand;
  /** named dressings: "<place>.<cam>@<preset>" */ presets?: Record<string, Record<string, ParamValue>>;
  /** per-camera defaults (the dressing a camera is meant for) */ camParams?: Record<string, Record<string, ParamValue>>;
  /** cameras shown without the stand-in figures */ noCast?: string[];
  /** per-camera staging (NEWTON / HUMPHREY elsewhere than the stand marks for that camera) */ camStand?: Record<string, Partial<Stand>> };
const DEFS: Partial<Record<Place, PlaceDef>> = {
  stairs: { look: STAIRS_LOOK, params: STAIRS_PARAMS, build: buildStairs, cams: STAIRS_CAMS, stand: STAIRS_STAND,
    presets: { shut: { door: 0, glow: 1 }, open: { door: 1, glow: 1 }, ajar: { door: 0.25, glow: 1 }, out: { door: 0, glow: 0 } },
    camParams: { top: { door: 1, glow: 1 }, run: { door: 0.7, glow: 1 }, low: { door: 0, glow: 1 } }, noCast: ["down", "door"] },
  room: { look: ROOM_LOOK, params: ROOM_PARAMS, build: buildRoom, cams: ROOM_CAMS, stand: ROOM_STAND,
    presets: { morning: { hour: "morning" }, noon: { hour: "noon" }, evening: { hour: "evening" }, night: { hour: "night" }, open: { door: 1 } },
    noCast: ["plate", "drafts"] },
  garden: { look: GARDEN_LOOK, params: GARDEN_PARAMS, build: buildGarden, cams: GARDEN_CAMS, stand: GARDEN_STAND,
    presets: { noon: { time: "noon" }, night: { time: "night", glow: 1, window: 1 }, dark: { time: "night", glow: 1, window: 0 } },
    camParams: { follow: { time: "night", glow: 1, window: 1 }, elab: { time: "night", glow: 1 }, window: { time: "night", glow: 1, window: 1 } },
    noCast: ["wide", "window", "elab"] },
  street: { look: STREET_LOOK, params: STREET_PARAMS, build: buildStreet, cams: STREET_CAMS, stand: STREET_STAND, noCast: ["street", "back", "gate"] },
  schools: { look: SCHOOLS_LOOK, params: SCHOOLS_PARAMS, build: buildSchools, cams: SCHOOLS_CAMS, stand: SCHOOLS_STAND, presets: { still: { dust: 0 } }, noCast: ["beam", "door"] },
  elaboratory: { look: ELAB_LOOK, params: ELAB_PARAMS, build: buildElaboratory, cams: ELAB_CAMS, stand: ELAB_STAND,
    presets: { red: { fire: 0, candle: 0.35 }, roar: { fire: 1, candle: 1 }, gone: { fire: 0.3, candle: -1 } },
    camParams: { stool: { fire: 0.25, candle: 0.4 }, push: { fire: 0.2, candle: 0.35 }, board: { fire: 0.2, candle: 0.35 } }, noCast: ["fire", "bench", "door"],
    camStand: Object.fromEntries(["stool", "push", "board"].map((k) => [k, { newton: ELAB.stool, facing: ELAB.stoolFacing, humphrey: undefined }])) },
};
export const VIEW_NAMES = (Object.entries(DEFS) as [Place, PlaceDef][]).flatMap(([p, d]) => Object.keys(d.cams).map((k) => `${p}.${k}`));

/** group/kit/rig3d applyLight (as world.ts): the four uniforms a RigCast's figures are lit by */
const applyLight = (rc: RigCast, L: CastLight) => {
  const U = rc.U;
  U.uKey.value.set(...L.key).normalize();
  const t = U.uTint.value.set(1 - L.tintK + L.tint[0] * L.tintK, 1 - L.tintK + L.tint[1] * L.tintK, 1 - L.tintK + L.tint[2] * L.tintK);
  t.multiplyScalar(1 / Math.max(0.2126 * t.x + 0.7152 * t.y + 0.0722 * t.z, 0.05));
  U.uGain.value = L.gain;
  const s = U.uShade.value.set(...(L.shade ?? [1.04, 0.95, 1.34]));
  s.multiplyScalar(1 / Math.max(0.2126 * s.x + 0.7152 * s.y + 0.0722 * s.z, 0.05));
  rc.light = L;
};

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts;
  const names: string[] = o.views ?? (o.place ? VIEW_NAMES.filter((n) => n.startsWith(o.place + ".")) : VIEW_NAMES);
  const parse = (n: string) => { const [pc, preset] = n.split("@"); const [p, cam] = pc.split(".") as [Place, string]; return { p, cam, preset }; };
  const need = new Set(names.map((n) => parse(n).p));
  const studio = makeEnv(c.renderer);
  const built = new Map<Place, PlaceBuild>();
  for (const p of need) {
    const d = DEFS[p];
    if (!d) throw new Error(`set_places: no place "${p}" yet (there are: ${Object.keys(DEFS).join(", ")})`);
    const t0 = performance.now();
    const b = d.build(makeKit(mats(studio, makeEnv(c.renderer, d.look.fill))));
    b.group.visible = false; c.scene.add(b.group); built.set(p, b);
    console.log(`QA: built ${p} in ${Math.round(performance.now() - t0)} ms`);
  }
  const people = new THREE.Group(); c.scene.add(people);
  const first = DEFS[[...need][0]]!;
  const rc = new RigCast(people, { light: { ...first.look.cast, ...BAKED_LIGHT } });
  const P = PEOPLE as unknown as Record<string, Person>;
  const NEWTON = P.newton ?? P.emperor ?? Object.values(P)[0], HUMPHREY = P.humphrey ?? P.xufu ?? Object.values(P)[1];
  const rigs: Rig[] = [];
  const fig = (p: Person) => { const r = addPerson(rc, p); rigs.push(r); return r; };
  let rN: Rig | null = null, rH: Rig | null = null;
  const view = (i: number) => {
    const n = names[((i % names.length) + names.length) % names.length], { p, cam, preset } = parse(n), d = DEFS[p]!;
    if (!d.cams[cam]) throw new Error(`set_places: no view "${n}" (there are: ${VIEW_NAMES.join(", ")})`);
    return { n, p, cam, preset, d, k: d.cams[cam] };
  };
  return {
    cam: (i: number): PCam => { const v = view(i).k; return { pos: v.pos, look: v.look, fov: v.fov }; },
    frame: (i: number) => {
      const { n, p, cam, preset, d } = view(i), b = built.get(p)!;
      const t = typeof o.t === "number" ? o.t : 0, f = Math.round(t * 30);
      for (const [q, bb] of built) bb.group.visible = q === p;
      const params = { ...d.params, ...(d.camParams?.[cam] ?? {}), ...(preset ? d.presets?.[preset] ?? {} : {}), ...(o.params ?? {}) } as Record<string, ParamValue>;
      for (const [k, v] of Object.entries(params)) {
        if (!(k in d.params)) throw new Error(`set_places: the ${p} has no param "${k}"`);
        b.setParam?.(k, v);
      }
      b.view?.(c.camera.position);
      if (o.hide) b.group.traverse((q) => { if ((o.hide as string[]).some((h) => q.name.startsWith(h))) q.visible = false; });
      b.animate?.(t, f);
      applyLight(rc, { ...d.look.cast, ...(b.cast?.(t, f) ?? {}), ...BAKED_LIGHT } as CastLight);
      for (const r of rigs) r.state.visible = false;
      if (o.cast !== false && !d.noCast?.includes(cam)) {
        const st: Stand = { ...d.stand, ...(d.camStand?.[cam] ?? {}) };
        rN ??= fig(NEWTON);
        const at = o.at ? new THREE.Vector3(o.at[0], o.at[1], o.at[2]) : st.newton.clone();
        rN.set({ at, facing: typeof o.facing === "number" ? o.facing : st.facing, pose: { kind: "idle", t: t + 0.4 }, expr: "neutral", visible: true });
        if (st.humphrey && o.humphrey !== false) {
          rH ??= fig(HUMPHREY);
          rH.set({ at: st.humphrey.clone(), facing: st.humphreyFacing ?? 0, pose: { kind: "idle", t: t + 1.3 }, expr: "neutral", visible: true });
        }
      }
      rc.update(c.camera, c.h);
      console.log(`QA: view ${i} ${n} | place ${p} | params ${JSON.stringify(params)}`);
    },
    ao: (i: number) => view(i).d.look.ao,
    bg: (i: number) => view(i).d.look.bg,
  };
});
