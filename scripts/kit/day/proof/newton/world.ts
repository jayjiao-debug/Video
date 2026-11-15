// PROOF ONLY: Newton's World as the kit's DayWorld (his hair rule through onActor / onUpdate).
import type * as THREE from "three";
import type { Rig, RigState } from "../../group/kit/rig3d";
import { DayWorld } from "../../../kit/day/world";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import { buildProps } from "../props";
import { addPerson, NEWTON_SWAPS, type Person } from "../people";
import { FPS, W, H, lensFov } from "../story";
import { NEWTON_TIDY_FROM } from "../world";
import { buildSetsKit } from "./sets";
const newtons = new WeakSet<Rig>();
export const makeWorldKit = (gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) =>
  new DayWorld(gl, camera, {
    name: "newton", fps: FPS, W, H, lensFov, buildSets: buildSetsKit, buildProps: buildProps as never, addPerson: addPerson as never,
    bakedLight: BAKED_LIGHT, firstPlace: "room",
    onActor: (_w: unknown, p: unknown, r: Rig) => { if (NEWTON_SWAPS.includes(p as Person)) newtons.add(r); },
    onUpdate: (w: unknown, r: Rig, st: RigState) => {
      if ((w as { f: number }).f >= NEWTON_TIDY_FROM && newtons.has(r) && !(st.hide ?? []).includes("nest")) st.hide = [...(st.hide ?? []), "nest"];
    },
  } as never);
