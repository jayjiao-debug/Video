// SHARED BUILDING BLOCKS of the places of 采访月老的一天 (re-exports of the house set tools; a place file keeps its own
// paintings and furniture in itself).
import * as THREE from "three";
export { maker, boxG, paint, rng, css, mix, blotch, NOINK, glowCard, makeFire, lightPool, type Mk, type Fire } from "../../romeo/sets/parts/b_common";
export { levelQuad, tileUV, bar } from "../../romeo/sets/parts/b_common";
export { FONT, lightRig } from "../../../kit/sets/okit";
export { concreteTex, crateTex } from "../../sihang/sets/common";
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** v6 (owner's note 3 on v5: "his face should be normal lighting"): faces are lit evenly in every set. The set's key keeps
 *  its direction and colour for the room and the bodies, but a face loses the hard shadow side, the broad fall-off and
 *  the shine: spread this LAST into a place's cast. */
export const FLAT_FACE = { shadeK: 0.16, broad: 0, sheen: 0.05, edge: 0.08, tintK: 0.32 };
/** a place's cast with FLAT_FACE laid over it (night and late light keep a little more: `more` adds to shadeK and tintK) */
export const flatFace = <T extends object>(cast: T, more = 0): T => ({ ...cast, ...FLAT_FACE, shadeK: FLAT_FACE.shadeK + more * 0.5, tintK: FLAT_FACE.tintK + more });
