// THE WORLD of the Napoleon film: the kit's DayWorld with this film's places, props and cast (src/kit/day/world.ts has
// the contract a shot may call: setPlace first, set.param, setCamera, actor, update, prop, project).
import type * as THREE from "three";
import { DayWorld } from "../../kit/day/world";
import { BAKED_LIGHT } from "../../kit/day/sets";
import { FPS, W, H, lensFov, type Place } from "./story";
import { buildSets, type NapoleonSet } from "./sets";
import { buildProps, type Props, type Prop, type PropName } from "./props";
import { addPerson, type Person } from "./people";

export class World extends DayWorld<Place, Person, NapoleonSet, Props, PropName, Prop> {
  constructor(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    super(gl, camera, { name: "napoleon", fps: FPS, W, H, lensFov, buildSets, buildProps, addPerson, bakedLight: BAKED_LIGHT, firstPlace: "alps" });
  }
}
