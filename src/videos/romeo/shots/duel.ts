// THE DUEL'S TOOLS (scene E, v5: the owner asked for "a sequence of them fighting and someone lying on the ground").
// The rapiers are world props on the solved hands (as Hongmen's sword dance did it): after w.update() a blade is laid
// through its fencer's hand toward a point it aims at, so two blades meet where both aim at the same point.
//   swordPose(hand, dir, bow)   the prop's place and turn for a rapier held with the middle of its grip at `hand`
//   swordRest(at, yaw)          the same prop lying on the stones (props/index.ts: origin under the cup, blade along yaw)
//   swordMix(a, b, k, drop)     a rapier on its way from a hand to the stones (it falls: `drop` = its fall so far, 0..1)
//   blend(f, keys)              eased keys of world points that are themselves functions of the frame (a hand that
//                               follows a moving body, an aim that follows a moving opponent)
import * as THREE from "three";
import { V } from "./common";
import { SWORD } from "../props";

const smooth = (k: number) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };
/** the rapier as props/things.ts builds it: along +y (the tip), the knuckle bow toward +x, then laid down along +x on
 *  its cup and its tip by this turn and this lift */
const TILT = Math.atan2(SWORD.cup - 0.004, SWORD.tip);
const R_IN = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, Math.PI / 2, -TILT, "ZYX"));
const R_IN_INV = R_IN.clone().invert(), IN_AT = V(0, SWORD.cup + 0.002, 0);
/** the middle of the grip in the built rapier's frame, and from there to the tip (m) */
const GRIP = V(0, -0.06, 0);
export const GRIP_TO_TIP = SWORD.tip + 0.06;

export type SwordPose = { at: THREE.Vector3; q: THREE.Quaternion };
/** A RAPIER IN A HAND: the middle of its grip at `hand`, its blade along `dir`, its knuckle bow toward `bow` (as near
 *  as a bow at right angles to the blade can be: give "down" for a blade held forward) */
export function swordPose(hand: THREE.Vector3, dir: THREE.Vector3, bow: THREE.Vector3 = V(0, -1, 0)): SwordPose & { tip: THREE.Vector3 } {
  const y = dir.clone().normalize(), x = bow.clone().addScaledVector(y, -bow.dot(y));
  if (x.lengthSq() < 1e-6) x.set(1, 0, 0).addScaledVector(y, -y.x);
  x.normalize();
  const qw = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, x.clone().cross(y)));   // the built rapier's axes in the world
  const q = qw.clone().multiply(R_IN_INV);
  return { q, at: hand.clone().sub(GRIP.clone().applyQuaternion(R_IN).add(IN_AT).applyQuaternion(q)), tip: hand.clone().addScaledVector(y, GRIP_TO_TIP) };
}
/** the rapier lying on the stones: its origin (on the ground under the cup) at `at`, its blade toward (cos yaw, 0, -sin yaw) */
export const swordRest = (at: THREE.Vector3, yaw: number): SwordPose => ({ at: at.clone(), q: new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw) });
/** from the hand to the stones: the turn goes evenly, the place falls (k = how far along, 0..1; the height falls as k^2:
 *  it drops, it is not put down), and `hop` lifts it again for a moment after it lands (a bounce: give 0..1 and a height) */
export function swordMix(a: SwordPose, b: SwordPose, k: number, hop = 0, hopH = 0.02): SwordPose {
  const x = Math.min(1, Math.max(0, k)), at = a.at.clone().lerp(b.at, x);
  at.y = a.at.y + (b.at.y - a.at.y) * x * x + hopH * Math.sin(Math.PI * Math.min(1, Math.max(0, hop)));
  return { at, q: a.q.clone().slerp(b.q, x) };
}
/** where a rapier's tip is (for the checks) */
export const tipOf = (p: SwordPose) => V(0, SWORD.tip, 0).applyQuaternion(R_IN).add(IN_AT).applyQuaternion(p.q).add(p.at);

/** eased keys [frame, point(frame)]: before the first and after the last it is that key's point; between two keys the
 *  two points OF THIS FRAME are mixed, so a key that follows something keeps following it */
export type PtKey = [number, (f: number) => THREE.Vector3];
export function blend(f: number, keys: PtKey[]): THREE.Vector3 {
  if (f <= keys[0][0]) return keys[0][1](f);
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return keys[i][1](f).lerp(keys[i + 1][1](f), smooth((f - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1](f);
}
