// SHARED BUILDING BLOCKS of the places of 采访月老的一天 (re-exports of the house set tools; a place file keeps its own
// paintings and furniture in itself).
import * as THREE from "three";
export { maker, boxG, paint, rng, css, mix, blotch, NOINK, glowCard, makeFire, lightPool, type Mk, type Fire } from "../../romeo/sets/parts/b_common";
export { levelQuad, tileUV, bar } from "../../romeo/sets/parts/b_common";
export { FONT, lightRig } from "../../../kit/sets/okit";
export { concreteTex, crateTex } from "../../sihang/sets/common";
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
