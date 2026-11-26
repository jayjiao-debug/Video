// THE WORLD of 采访八百壮士的一天: the kit's DayWorld with this film's places, props and cast (src/kit/day/world.ts has
// the contract a shot may call: setPlace first, set.param, setCamera, actor, update, prop, project).
import type * as THREE from "three";
import { DayWorld } from "../../kit/day/world";
import { BAKED_LIGHT } from "../../kit/day/sets";
import { FPS, W, H, lensFov, type Place } from "./story";
import { buildSets, type SihangSet } from "./sets";
import { buildProps, type Props, type Prop, type PropName } from "./props";
import { addPerson, type Person } from "./people";


export class World extends DayWorld<Place, Person, SihangSet, Props, PropName, Prop> {
  constructor(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    super(gl, camera, { name: "sihang", fps: FPS, W, H, lensFov, buildSets, buildProps, addPerson, bakedLight: BAKED_LIGHT, firstPlace: "hall" });
  }
  /** the figures' names (the checker, previews) */
  get figureNames() { return this.names; }
}
