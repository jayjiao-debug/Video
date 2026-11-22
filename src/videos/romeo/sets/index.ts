// THE PLACES of 采访罗密欧与朱丽叶 through the kit's makeSets (src/kit/day/sets.ts has the contract: lights inside the
// group, the same light kinds everywhere, the BAKED_LIGHT values, walls the camera stands behind hidden by view()).
// One file per place (sets/<place>.ts exports <PLACE>: PlaceDef); places.ts holds the islands and the marks.
import type * as THREE from "three";
import { makeSets, type PlaceDef } from "../../../kit/day/sets";
import { PLACES, type Place } from "../places";
import { GROVE } from "./grove";
import { HALL } from "./hall";
import { BALCONY } from "./balcony";
import { CELL } from "./cell";
import { STREET } from "./street";
import { BEDROOM } from "./bedroom";
import { MANTUA } from "./mantua";
import { TOMB } from "./tomb";

export type { ParamValue } from "../../../kit/day/types";
const DEF: Record<Place, PlaceDef> = { grove: GROVE, hall: HALL, balcony: BALCONY, cell: CELL, street: STREET, bedroom: BEDROOM, mantua: MANTUA, tomb: TOMB };
export const buildSets = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "romeo" });
export type RomeoSet = ReturnType<typeof buildSets>;
