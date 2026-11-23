// THE SHOTS' OWN HELPERS: places and marks in world space (places.ts STAGE is local to each island), the camera spots,
// the cast's faces and the little acts every scene repeats (a line said with a face, a reaction landing after a word,
// a head box for the name tabs, Juliet lying on her bier).
import * as THREE from "three";
import { ISLAND, STAGE, type Place, type Spot, type CamSpot, type V3 } from "../places";
import { FACES } from "../people";
import type { Rig, RigState, RigFace } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { V, speak, saying, accent, ky } from "./common";
import { VERBS } from "./common";
import { FPS, quote, line, type Speaker, type Pose } from "../story";
import { cap, capWord } from "../captions";
import type { CamKey } from "../cam";
import type { World } from "../world";
import type { Rect } from "../../../kit/day/hud/style";

export type Vec3 = [number, number, number];
/** a local point of a place, in world space */
export const P = (place: Place, x: number, y: number, z: number) => V(ISLAND[place] + x, y, z);
export const wv = (place: Place, v: readonly number[]): Vec3 => [ISLAND[place] + v[0], v[1], v[2]];
/** a named mark of a place: its floor point (world) and facing */
export const spot = (place: Place, name: string) => {
  const s = (STAGE[place].spots as Record<string, Spot>)[name];
  if (!s) throw new Error(`spot(${place}, ${name}): no such mark`);
  return { at: P(place, s.at[0], s.at[1], s.at[2]), facing: s.facing };
};
/** a named camera spot of a place as a camera key (world) */
export const camAt = (place: Place, name: string, f: number, o: Partial<CamKey> = {}): CamKey => {
  const c = (STAGE[place].cams as Record<string, CamSpot & { roll?: number }>)[name];
  if (!c) throw new Error(`camAt(${place}, ${name}): no such camera`);
  return { f, pos: wv(place, c.pos), look: wv(place, c.look), fov: c.fov, roll: c.roll ? (c.roll * 180) / Math.PI : undefined, ...o };
};
/** a camera key from local numbers */
export const ck = (place: Place, f: number, pos: V3 | Vec3, look: V3 | Vec3, fov: number, o: Partial<CamKey> = {}): CamKey => ({ f, pos: wv(place, pos), look: wv(place, look), fov, ...o });

/** a face by name (people.ts FACES: puppy, dreamy, wail, blank, hollow / sure, bossy, swoon, caught, brave / weary, dry,
 *  worried, warn) or a rig expression */
export const face = (n: string): Expr | RigFace => ((FACES as Record<string, Expr | RigFace>)[n] ?? (n as Expr));
/** step keys of faces: the last key at or before f */
export const faceAt = (f: number, keys: [number, string][]): RigState["expr"] => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return face(e) as RigState["expr"]; };

/** the lip-sync of whatever `who` is saying at f (speak()'s window), or {} */
export const talk = (who: Speaker, f: number, id: number, stress?: number[]) => { const q = saying(who, f); return q ? speak(q, f, id, stress) : {}; };
/** the first frame of a word of a line (its screen's token) */
export const wordAt = (id: string, word: string) => capWord(id, word).from;
/** the first spoken frame of line id */
export const startOf = (id: string) => cap(id, 0).from;
export const endOf = (id: string) => line(id).to;
export const L = line;
export const Q = quote;
export { accent, ky };

/** THE HEAD BOX of a figure on screen (after w.update, with the frame's camera set): head and shoulders, film px */
export function headBox(w: World, r: Rig, k = 1): Rect | null {
  const h = VERBS.headPx(w, r);
  if (!isFinite(h.x) || !isFinite(h.y) || h.r <= 0) return null;
  const R = h.r * k;
  return { x0: h.x - 1.6 * R, x1: h.x + 1.6 * R, y0: h.y - 1.25 * R, y1: h.y + 2.6 * R };
}

/** a hand target in a figure's own frame: x to ITS left, y up from its feet, z forward */
export const rel = VERBS.rel;

// ------------------------------------------------------------------------------------------------ lying down
/** JULIET ON HER BIER. The rig cannot lie down, so she is solved STANDING for a camera turned the other way round her
 *  feet, then her whole figure is turned onto her back about her feet (`pivot`). The camera then sees her exactly as
 *  that turned camera saw the standing figure: a toon figure lying down, her face toward us. Call after w.update()
 *  (with the frame's camera set). The World resets every figure's turn before it solves (world.ts onUpdate).
 *    pivot  her feet on the bier (world);  headDir  the way her head lies (world, horizontal unit: (-1, 0, 0) on the bier)
 *    k      0 = standing .. 1 = lying (sitting up in between: she rises about her hips) */
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _cam = new THREE.PerspectiveCamera();
export function lieDown(w: World, r: Rig, pivot: THREE.Vector3, headDir: THREE.Vector3, k = 1, lift = 0) {
  if (k <= 0) return;
  // R: the figure's up (+y) goes to headDir, its front (+z) goes up (+y); a sit-up turns it back about the hip axis.
  // lift (rad): the head end raised about the feet (v3: the sculpted hair is 3.6 cm thick at the back of the head and
  // went into the bier's cloth; it lies on the hair as on a pillow)
  const hd = headDir.clone().normalize(), Y = V(0, 1, 0);
  const up = hd.clone().multiplyScalar(Math.cos(lift)).addScaledVector(Y, Math.sin(lift)), front = Y.clone().multiplyScalar(Math.cos(lift)).addScaledVector(hd, -Math.sin(lift));
  const side = up.clone().cross(front).normalize();
  const full = new THREE.Matrix4().makeBasis(side, up, front);   // columns: images of x, y, z
  const qFull = new THREE.Quaternion().setFromRotationMatrix(full);
  _q.identity().slerp(qFull, k);
  // the turned camera: the real one carried round the pivot by the inverse turn
  const cam = w.camera as THREE.PerspectiveCamera;
  cam.updateMatrixWorld();
  _cam.copy(cam);
  const inv = _q.clone().invert();
  const p = cam.position.clone().sub(pivot).applyQuaternion(inv).add(pivot);
  _cam.position.copy(p);
  _cam.quaternion.copy(inv.clone().multiply(cam.quaternion));
  _cam.updateMatrixWorld(true);
  (r as unknown as { _update(c: THREE.Camera): void })._update(_cam);
  // turn the solved figure about the pivot
  _m.makeTranslation(pivot.x, pivot.y, pivot.z).multiply(new THREE.Matrix4().makeRotationFromQuaternion(_q)).multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
  r.group.matrixAutoUpdate = false;
  r.group.matrix.copy(_m);
  r.group.matrixWorldNeedsUpdate = true;
  // the face drawing is projected in WORLD space (rig3d's head shader: uHead = the head's centre, uFF / uFR / uFU = the
  // face's frame, all set by the solve above for the standing figure). Turn them with her, or the drawing stays where
  // her standing head would be and the lying head shows blank skin (stills v4, 22 Nov).
  const fu = (r as unknown as { faceU?: { uHead: { value: THREE.Vector4 }; uFF: { value: THREE.Vector3 }; uFR: { value: THREE.Vector3 }; uFU: { value: THREE.Vector3 } } }).faceU;
  if (fu) {
    const h = fu.uHead.value, c = new THREE.Vector3(h.x, h.y, h.z).applyMatrix4(_m);
    h.set(c.x, c.y, c.z, h.w);
    fu.uFF.value.applyQuaternion(_q); fu.uFR.value.applyQuaternion(_q); fu.uFU.value.applyQuaternion(_q);
  }
}
/** undo lieDown (the World calls it for every figure before it solves) */
export function standUp(r: Rig) {
  if (!r.group.matrixAutoUpdate) { r.group.matrixAutoUpdate = true; r.group.position.set(0, 0, 0); r.group.quaternion.identity(); r.group.updateMatrix(); }
}

/** the reaction delay: a face lands this many frames after the word that caused it (format: within about ten) */
export const REACT = 6;
export const sec = (s: number) => Math.round(s * FPS);
export type { Pose };
