// THE WORLD of 采访罗密欧与朱丽叶: the kit's DayWorld with this film's places, props and cast (src/kit/day/world.ts has
// the contract a shot may call: setPlace first, set.param, setCamera, actor, update, prop, project).
import type * as THREE from "three";
import { DayWorld } from "../../kit/day/world";
import { BAKED_LIGHT } from "../../kit/day/sets";
import { FPS, W, H, lensFov, type Place } from "./story";
import { buildSets, type RomeoSet } from "./sets";
import { buildProps, type Props, type Prop, type PropName } from "./props";
import { addPerson, type Person } from "./people";
import { standUp } from "./shots/kit";

export class World extends DayWorld<Place, Person, RomeoSet, Props, PropName, Prop> {
  constructor(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    super(gl, camera, { name: "romeo", fps: FPS, W, H, lensFov, buildSets, buildProps, addPerson, bakedLight: BAKED_LIGHT, firstPlace: "grove",
      // a figure laid down on a frame (shots/kit.ts lieDown) stands up again before every solve
      onUpdate: (_w, r) => standUp(r) });
  }
}
