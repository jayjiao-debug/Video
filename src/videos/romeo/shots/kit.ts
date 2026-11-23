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
/** A SOLVED FIGURE CARRIED BY A RIGID MOVE (Juliet sitting up in scene I): turned by q about `pivot` (world: a point
 *  of the figure as it was solved), then shifted by `shift`. As lieDown does it: the figure is solved again for the
 *  camera carried the other way round, so its face, its ink and its layers are right for where it ends up; then its
 *  group and its face's frame are moved. Call after w.update(). keep = the group's own placing stays under the move
 *  (a figure with a size of its own solved where it will stand or sit: people.ts scales it about its ground point);
 *  without it the move replaces the placing (lieDown's way: the lying figure). */
export function carry(w: World, r: Rig, q: THREE.Quaternion, pivot: THREE.Vector3, shift: THREE.Vector3, keep = false) {
  const cam = w.camera as THREE.PerspectiveCamera;
  cam.updateMatrixWorld();
  _cam.copy(cam);
  const inv = q.clone().invert();
  _cam.position.copy(cam.position.clone().sub(pivot).sub(shift).applyQuaternion(inv).add(pivot));
  _cam.quaternion.copy(inv.clone().multiply(cam.quaternion));
  _cam.updateMatrixWorld(true);
  (r as unknown as { _update(c: THREE.Camera): void })._update(_cam);
  _m.makeTranslation(pivot.x + shift.x, pivot.y + shift.y, pivot.z + shift.z).multiply(new THREE.Matrix4().makeRotationFromQuaternion(q)).multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
  if (keep) { r.group.updateMatrix(); r.group.matrix.premultiply(_m); } else r.group.matrix.copy(_m);
  r.group.matrixAutoUpdate = false;
  r.group.matrixWorldNeedsUpdate = true;
  const fu = (r as unknown as { faceU?: { uHead: { value: THREE.Vector4 }; uFF: { value: THREE.Vector3 }; uFR: { value: THREE.Vector3 }; uFU: { value: THREE.Vector3 } } }).faceU;
  if (fu) {
    const h = fu.uHead.value, c = new THREE.Vector3(h.x, h.y, h.z).applyMatrix4(_m);
    h.set(c.x, c.y, c.z, h.w);
    fu.uFF.value.applyQuaternion(q); fu.uFR.value.applyQuaternion(q); fu.uFU.value.applyQuaternion(q);
  }
}
/** the turn lieDown gives a figure (see there): its up to headDir (raised by `lift`), its front up */
export function lieQ(headDir: THREE.Vector3, lift = 0) {
  const hd = headDir.clone().normalize(), Y = V(0, 1, 0);
  const up = hd.clone().multiplyScalar(Math.cos(lift)).addScaledVector(Y, Math.sin(lift)), front = Y.clone().multiplyScalar(Math.cos(lift)).addScaledVector(hd, -Math.sin(lift));
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(up.clone().cross(front).normalize(), up, front));
}
/** undo lieDown (the World calls it for every figure before it solves) */
export function standUp(r: Rig) {
  if (!r.group.matrixAutoUpdate) { r.group.matrixAutoUpdate = true; r.group.position.set(0, 0, 0); r.group.quaternion.identity(); r.group.updateMatrix(); }
}

// ------------------------------------------------------------------------------------------- the drawn face on screen
type FaceUniforms = { uHead: { value: THREE.Vector4 }; uFF: { value: THREE.Vector3 }; uFR: { value: THREE.Vector3 }; uFU: { value: THREE.Vector3 }; uFaceOn: { value: number } };
/** A POINT OF A FIGURE'S DRAWN FACE ON SCREEN (film px), for what comes out of a face (hud/emotes.tsx: tears, hearts).
 *  (x, y) are in the face's own units (rig3d FaceKit: u = 1 % of the head's width, from the middle of the eye line,
 *  x = screen right, y = down; the eyes are at x = -14 and +14, y = 0). The rig projects the drawing flat along the
 *  face's direction onto the head (its shader's uHead / uFF / uFR / uFU, with the same pull toward the camera): this
 *  is that projection run forward, on the ball the head is. Call after w.update() (and after lieDown / carry).
 *  `on` = how much of the face shows (0 = turned away or behind the head's edge). */
export function facePx(w: World, r: Rig, x: number, y: number): { x: number; y: number; on: number } {
  const fu = (r as unknown as { faceU: FaceUniforms }).faceU;
  const H = fu.uHead.value, C = V(H.x, H.y, H.z), R = H.w, F = fu.uFF.value;
  const sx = 1 / fu.uFR.value.length(), sy = 1 / fu.uFU.value.length();
  const rf = fu.uFR.value.clone().multiplyScalar(sx), uf = fu.uFU.value.clone().multiplyScalar(sy);
  const hc = C.clone().sub((w.camera as THREE.PerspectiveCamera).position), d2 = hc.lengthSq();
  // (0.99 = the rig's FACE_FS; the eye line is 1.5u above the drawing's middle)
  const qx = (x * 0.99) / 50, qy = ((1.5 - y) * 0.99) / 50, hp = V(0, 0, 0);
  let k = 1, c = 1;
  for (let i = 0; i < 3; i++) {
    const a = (qx * sx) / k, b = (qy * sy) / k;
    c = Math.sqrt(Math.max(0, 1 - a * a - b * b));
    hp.copy(rf).multiplyScalar(a).addScaledVector(uf, b).addScaledVector(F, c);
    k = d2 / Math.max(d2 + R * hp.dot(hc), 1e-4);
  }
  const p = w.project(C.addScaledVector(hp, R));
  return { x: p.x, y: p.y, on: p.front && c > 0.05 && hp.dot(hc) < 0 ? fu.uFaceOn.value : 0 };
}
/** AN EYE OF A FIGURE ON SCREEN: a point of the face (the eye's middle is (side * 14, 0)) with the face's own axes
 *  there, in film px per u: ex along the face's x (screen right), ey along its y (down). side: -1 = the eye on the
 *  screen's left */
export type EyePt = { x: number; y: number; ex: [number, number]; ey: [number, number]; u: number; side: -1 | 1; on: number };
export function eyePx(w: World, r: Rig, side: -1 | 1, x = 14, y = 0): EyePt {
  const X = side * x, p = facePx(w, r, X, y), px = facePx(w, r, X + 4, y), py = facePx(w, r, X, y + 4);
  const ex: [number, number] = [(px.x - p.x) / 4, (px.y - p.y) / 4], ey: [number, number] = [(py.x - p.x) / 4, (py.y - p.y) / 4];
  return { x: p.x, y: p.y, ex, ey, u: Math.hypot(ey[0], ey[1]), side, on: Math.min(p.on, px.on, py.on) };
}
/** both eyes (screen left, screen right) */
export const eyesPx = (w: World, r: Rig, x = 14, y = 0): EyePt[] => [eyePx(w, r, -1, x, y), eyePx(w, r, 1, x, y)];

/** the reaction delay: a face lands this many frames after the word that caused it (format: within about ten) */
export const REACT = 6;
export const sec = (s: number) => Math.round(s * FPS);
export type { Pose };
