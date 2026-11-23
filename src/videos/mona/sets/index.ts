// THE PLACE of 采访蒙娜丽莎的一天 through the kit's makeSets (src/kit/day/sets.ts has the contract). There is ONE place,
// "stage" (sets/stage.ts): her picture at the reporter's eye height, and round it a room that is swapped by params.
//   w.setPlace("stage"); w.set.param("room", "cloux"); w.set.param("mount", "easel"); ...
// PARAMS (every one is reset to its default at the start of each frame):
//   room    studio | cloux | palace0 | palace1 | palace2 | bedroom | salon | louvre
//   mount   easel | frame        state  head | body | done (how much of her is painted)
//   cracks, glass, crowd, stone, cake, soup   0 .. 1
//   plateA, plateB   the two lines on the brass plate under the frame
//   night   0 .. 1 how dark the room is; -1 = the room's own (MOODS)
//   torchX, torchY, torchR, torchK   a disc of light on her (world x, y; radius; strength); torchK -1 = the room's own glow
//   gone    1 = the picture is off the wall (1911)
// THE LIGHT follows the room (stage.ts LIGHT): the key, the sky fill, ONE lamp (the candles; the torch at night), and
// the figures' own light. The night dims the key and turns it blue.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { makeSets, type PlaceDef } from "../../../kit/day/sets";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import type { CastLight } from "../../group/kit/cast";
import { ENV_FILL } from "../../bt/pbr";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { lightRig } from "../../../kit/sets/okit";
import { PLACES, type Place } from "../frame";
import { stageSet, LIGHT, MOODS, ROOMS, type Room, type Mount, type PanelState } from "./stage";

/** the three values a figure bakes when it is first built: the look the owner approved for her (23 Nov) */
export const BAKED = { bleach: 0, bodyShadeK: 0.4, contact: "#5a4a3a" } as const;
const CAST: CastLight = { ...LAB_CAST_LIGHT, ...BAKED } as unknown as CastLight;
export const STAGE_LOOK: PlaceLook = {
  bg: MOODS.louvre.bg,
  ao: { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 1.5, color: "#2a1a10" },
  cast: CAST, fill: ENV_FILL, bloom: 0.45,
};
export const STAGE_PARAMS = {
  room: "louvre" as string, mount: "frame" as string, state: "done" as string,
  cracks: 0, glass: 0, crowd: 0, stone: 0, cake: 0, soup: 0, plateA: "", plateB: "",
  night: -1, torchX: 0, torchY: 0, torchR: 0.4, torchK: -1, gone: 0,
};
export type StageParams = typeof STAGE_PARAMS;

const NIGHT_KEY = new THREE.Color("#8ea4dc");
const buildStage = (K: Kit): PlaceBuild => {
  const S = stageSet(K.M), group = S.group; group.name = "stage";
  const L0 = LIGHT.louvre;
  const Lr = lightRig(group, { dir: L0.dir, k: L0.k, col: L0.col, at: [0, 0, 1.2], half: 4, hemi: L0.hemi, point: L0.lamp });
  const cur: Record<string, ParamValue> = { ...STAGE_PARAMS }, at = new THREE.Vector3(0, 0, 1.2), d = new THREE.Vector3(), col = new THREE.Color();
  let plateNow = "\u0000";
  const apply = () => {
    const room = (ROOMS as readonly string[]).includes(String(cur.room)) ? (cur.room as Room) : "louvre", mood = MOODS[room], L = LIGHT[room];
    S.room(room); S.mount(cur.mount as Mount); S.state(cur.state as PanelState); S.gone(Number(cur.gone));
    S.cracks(Number(cur.cracks)); S.glass(Number(cur.glass)); S.crowd(Number(cur.crowd));
    S.stain("stone", Number(cur.stone)); S.stain("cake", Number(cur.cake)); S.stain("soup", Number(cur.soup));
    const pl = `${cur.plateA}\n${cur.plateB}`; if (pl !== plateNow) { plateNow = pl; S.plate(String(cur.plateA), String(cur.plateB)); }
    const night = Number(cur.night) < 0 ? mood.night : Number(cur.night);
    const glow = mood.glow ?? [0, 0, 0.4, 0], tk = Number(cur.torchK) < 0 ? glow[3] : Number(cur.torchK);
    const tx = Number(cur.torchK) < 0 ? glow[0] : Number(cur.torchX), ty = Number(cur.torchK) < 0 ? glow[1] : Number(cur.torchY), tr = Number(cur.torchK) < 0 ? glow[2] : Number(cur.torchR);
    S.dim(1 - night); S.torch(tx, ty, tr, tk);
    // the light: the room's key, dimmed and turned blue by the night (a room that is dark by itself keeps its own key)
    const n = Number(cur.night) < 0 ? 0 : night;
    d.set(...L.dir).normalize(); Lr.key.position.copy(at).addScaledVector(d, 30);
    Lr.key.color.set(L.col).lerp(NIGHT_KEY, 0.85 * n); Lr.key.intensity = L.k * (1 - 0.78 * n);
    Lr.hemi.color.set(L.hemi[0]); Lr.hemi.groundColor.set(L.hemi[1]); Lr.hemi.intensity = L.hemi[2] * (1 - 0.5 * n);
    // the lamp: the room's candles; in the Louvre at night, the torch
    const torch = room === "louvre" && Number(cur.torchK) > 0.8;
    Lr.point.color.set(L.lamp.col); Lr.point.distance = L.lamp.dist;
    if (torch) { Lr.point.position.set(tx, ty, 2.8); Lr.point.intensity = 1.1 * tk; } else { Lr.point.position.set(...L.lamp.at); Lr.point.intensity = L.lamp.k; }
    void col;
  };
  apply();
  return {
    group,
    view: (c) => S.view(c),
    animate: (t) => S.animate(t),
    setParam(name, v) { cur[name] = v; apply(); },
    cast() { const room = (ROOMS as readonly string[]).includes(String(cur.room)) ? (cur.room as Room) : "louvre", c = LIGHT[room].cast; return { key: c.key, tint: c.tint, tintK: c.tintK, gain: c.gain } as Partial<CastLight>; },
  };
};

export const STAGE: PlaceDef = { look: STAGE_LOOK, params: STAGE_PARAMS as unknown as Record<string, ParamValue>, build: buildStage };
const DEF: Record<Place, PlaceDef> = { stage: STAGE };
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "mona", baked: BAKED });
export type MonaSet = ReturnType<typeof buildSets>;
export type { ParamValue };
