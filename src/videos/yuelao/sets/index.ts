// THE PLACES of 采访月老的一天 through the kit's makeSets (src/kit/day/sets.ts has the contract). One file per place;
// places.ts holds the islands and the marks.
import type * as THREE from "three";
import { makeSets, type PlaceDef } from "../../../kit/day/sets";
import { PLACES, type Place } from "../places";
import { OFFICE_PLACE } from "./office";
import { WORK_PLACE } from "./work";
import { STREET_PLACE } from "./street";

export type { ParamValue } from "../../../kit/day/types";
const DEF: Record<Place, PlaceDef> = { office: OFFICE_PLACE, work: WORK_PLACE, street: STREET_PLACE };
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "yuelao" });
export type YuelaoSet = ReturnType<typeof buildSets>;
