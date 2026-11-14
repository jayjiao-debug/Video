// SEGMENT A's helpers (WP5-A): THE INVISIBLE REPORTER (Jay, 14 Nov: no mic, no hand; "pretend there is an invisible
// hand like 秦始皇"). Every function is pure (the frame in, a number or a pose out).
//   rapPush(f, ons, amp)   the camera's small push on each rap (her weight behind the knuckles): in over 2 frames,
//                          back over 5; amp[i] metres for rap i
//   shiver(f, ons)         the leaf's answer to each rap: a damped rattle in its frame (door param units, inward only:
//                          it rattles against its stop), every other frame, over 7 frames
//   lightFocus(cam, p)     the film's light focus (amount 3) on a world point: what the mic used to give
//   doorTitle(cam, p, ref, scale)  the title block PAINTED on the door: its centre at world point p on screen, its
//                          tilt from the door's vertical on screen (the camera's roll), its size from the distance
//                          (scale at the distance from `ref`)
import * as THREE from "three";
import * as C from "../cam";
import { clamp01, easeInCubic, easeOutCubic, type CamPose } from "../story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const posOf = (c: CamPose) => (c.pos instanceof THREE.Vector3 ? c.pos.clone() : V(c.pos[0], c.pos[1], c.pos[2]));

/** the camera's push on each rap (m): in over 2 frames (ease-in), back over 5 (ease-out) */
export const rapPush = (f: number, ons: number[], amp: number[]) => {
  let k = 0;
  ons.forEach((on, i) => {
    const d = f - on, a = amp[i] ?? amp[amp.length - 1];
    if (d >= -2 && d <= 0) k = Math.max(k, a * easeInCubic((d + 2) / 2));
    else if (d > 0 && d <= 5) k = Math.max(k, a * (1 - easeOutCubic(d / 5)));
  });
  return k;
};
/** the leaf's rattle after each rap (door param units: 0.006 = 0.6 deg, about 9 mm at its free edge) */
export const SHIVER = 0.006;
export const shiver = (f: number, ons: number[]) => {
  let s = 0;
  for (const on of ons) { const d = f - on; if (d >= 0 && d <= 7) s += SHIVER * Math.exp(-d / 2.2) * (d % 2 === 0 ? 1 : 0.25); }
  return s;
};
/** the light focus on a world point (the film's dof at amount 3: the subject crisp, the far wall a touch soft) */
export const lightFocus = (cam: CamPose, p: THREE.Vector3) => ({ focus: Math.max(0.2, posOf(cam).distanceTo(p)), amount: 3 });
/** the title block painted on the door (see the head of the file) */
export const doorTitle = (cam: CamPose, p: THREE.Vector3, ref: THREE.Vector3, scale: number) => {
  const c = C.toScreen(cam, p), top = C.toScreen(cam, p.clone().add(V(0, 0.3, 0))), bot = C.toScreen(cam, p.clone().add(V(0, -0.3, 0)));
  const rot = (Math.atan2(top.x - bot.x, bot.y - top.y) * 180) / Math.PI;
  const k = ref.distanceTo(p) / Math.max(0.3, posOf(cam).distanceTo(p));
  return { x: Math.round(c.x), y: Math.round(c.y), scale: +(scale * clamp01(k / 1.5) * 1.5).toFixed(4), rot: +rot.toFixed(2) };
};
