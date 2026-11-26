// THE PLACES of 采访八百壮士的一天 through the kit's makeSets (src/kit/day/sets.ts has the contract). One file per place;
// places.ts holds the islands and the marks.
import type * as THREE from "three";
import { makeSets, type PlaceDef } from "../../../kit/day/sets";
import { PLACES, type Place } from "../places";
import { HALL_PLACE } from "./hall";
import { ROOF_PLACE } from "./roof";
import { BRIDGE_PLACE } from "./bridge";

export type { ParamValue } from "../../../kit/day/types";
const DEF: Record<Place, PlaceDef> = { hall: HALL_PLACE, roof: ROOF_PLACE, bridge: BRIDGE_PLACE };
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "sihang" });
export type SihangSet = ReturnType<typeof buildSets>;
