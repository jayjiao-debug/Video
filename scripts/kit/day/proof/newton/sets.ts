// PROOF ONLY (copied into src/videos/newton/_kitproof/ by render_compare.sh, never committed there): Newton's places
// through the kit's makeSets.
import type * as THREE from "three";
import { makeSets, type PlaceDef } from "../../../kit/day/sets";
import { PLACES, type Place } from "../story";
import { buildStairs, STAIRS_LOOK, STAIRS_PARAMS } from "../sets/stairs";
import { buildRoom, ROOM_LOOK, ROOM_PARAMS } from "../sets/room";
import { buildGarden, GARDEN_LOOK, GARDEN_PARAMS } from "../sets/garden";
import { buildStreet, STREET_LOOK, STREET_PARAMS } from "../sets/street";
import { buildSchools, SCHOOLS_LOOK, SCHOOLS_PARAMS } from "../sets/schools";
import { buildElaboratory, ELAB_LOOK, ELAB_PARAMS } from "../sets/elaboratory";
const DEF = {
  stairs: { look: STAIRS_LOOK, params: STAIRS_PARAMS, build: buildStairs },
  room: { look: ROOM_LOOK, params: ROOM_PARAMS, build: buildRoom },
  garden: { look: GARDEN_LOOK, params: GARDEN_PARAMS, build: buildGarden },
  street: { look: STREET_LOOK, params: STREET_PARAMS, build: buildStreet },
  schools: { look: SCHOOLS_LOOK, params: SCHOOLS_PARAMS, build: buildSchools },
  elaboratory: { look: ELAB_LOOK, params: ELAB_PARAMS, build: buildElaboratory },
} as unknown as Record<Place, PlaceDef>;
export const buildSetsKit = (gl: THREE.WebGLRenderer) => makeSets(gl, PLACES, DEF, { name: "newton" });
