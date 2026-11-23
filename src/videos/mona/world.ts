// THE WORLD of 采访蒙娜丽莎的一天: the kit's DayWorld with this film's one place (the stage) and its cast
// (src/kit/day/world.ts has the contract a shot may call: setPlace first, set.param, setCamera, actor, update, project).
import * as THREE from "three";
import { DayWorld, type DayProps } from "../../kit/day/world";
import type { Mats } from "../bt/pbr";
import { FPS, W, H, lensFov, type Place } from "./frame";
import { buildSets, BAKED, type MonaSet } from "./sets";
import { addPerson, type Person } from "./people";

/** (the film's things are part of the stage's rooms; nothing is carried about yet) */
export type PropName = "none";
export type Prop = { put(): void };
export type Props = DayProps<PropName, Prop>;
const buildProps = (_M: Mats): Props => { const group = new THREE.Group(); group.name = "props"; return { group, prop: (n) => { throw new Error(`mona: no prop "${n}"`); }, begin() {} }; };

export class World extends DayWorld<Place, Person, MonaSet, Props, PropName, Prop> {
  constructor(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    super(gl, camera, { name: "mona", fps: FPS, W, H, lensFov, buildSets, buildProps, addPerson, bakedLight: BAKED, firstPlace: "stage" });
  }
}
