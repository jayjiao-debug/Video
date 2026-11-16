// shots/match.ts: THE MATCH CUT from the evening tavern (E) to the night under the tree (F). Jay, 16 Nov: "Lets do a
// camera movement here such that libai and the latern reflects the moon and libai respectively": E's last frame and F's
// first frame are the same picture: 李白's head on the same spot of the screen, and the last lantern exactly where the
// moon will be. E's side is a plain aim from where she stands; F's side is solved: her camera starts a little to the
// left of its place (that brings him in under the moon) with the lens that makes the two distances equal, and glides to
// its own place while the scene opens.
import * as THREE from "three";
import { NX, NIGHT_SET, RX } from "../layout";
import { NIGHT_STAND } from "../../qin/layout/night";
import { type CamPose } from "../story";
import { V, rel } from "./common";
import { aim, LI_TABLE } from "./lb";

const RAD = Math.PI / 180;
/** where a world point lands on the 1080 x 1920 frame for a camera without roll */
export const proj = (c: CamPose, P: THREE.Vector3) => {
  const p = V(...(c.pos as [number, number, number])), f = V(...(c.look as [number, number, number])).sub(p).normalize();
  const r = f.clone().cross(V(0, 1, 0)).normalize(), u = r.clone().cross(f), d = P.clone().sub(p), z = d.dot(f);
  const tv = Math.tan((c.fov * RAD) / 2), th = (tv * 9) / 16;
  return { sx: 540 + (540 * d.dot(r)) / z / th, sy: 960 - (960 * d.dot(u)) / z / tv };
};
/** aim(), corrected until the target lands on (sx, sy) to a tenth of a pixel */
export const aimExact = (pos: THREE.Vector3, tgt: THREE.Vector3, sy: number, sx: number, fov?: number): CamPose => {
  let ax = sx, ay = sy, c = aim(pos, tgt, ay, ax, fov);
  for (let i = 0; i < 6; i++) { const q = proj(c, tgt); ax += sx - q.sx; ay += sy - q.sy; c = aim(pos, tgt, ay, ax, fov); }
  return c;
};

// ---- E: the tavern (shots/segE.ts)
const T = LI_TABLE;
/** his head's middle as he sits there, sighing (head probe), and the last lantern's body (lb.ts lamp1 hangs from 2.55) */
const LI_E = rel(T.at, T.facing, 0, 0.84, 0), LAMP = V(RX + 1.25, 2.55 - 0.2, -1.25);
/** where his head sits on the screen at the cut */
export const MATCH_LI = { sx: 470, sy: 1220 };
export const E_END: CamPose = aimExact(V(T.at.x - 0.2, 1.38, T.at.z + 2.3), LI_E, MATCH_LI.sy, MATCH_LI.sx);
/** where the lantern's body is on E's last frame = where the moon is on F's first */
export const MATCH_LAMP = proj(E_END, LAMP);

// ---- F: the night (shots/segF.ts)
export const STONE_AT = V(NX - 0.35, 0, -4.2);
/** her place in F: 0.6 m left of where it was, so the moon sits inside the phone's frame (Jay, 16 Nov: "The moon is gonna
 *  get cut out") */
export const F_CAM0 = V(NX - 0.1, 1.25, -1.0);
/** the moon's disc, exactly where the night set draws it (qin/sets/night.ts: the stand's eye + its direction x dist) */
export const MOON = (() => {
  const m = NIGHT_SET.moon, az = (m.az * Math.PI) / 180, el = (m.el * Math.PI) / 180, e = NIGHT_STAND.cam.pos;
  return V(e[0], e[1], e[2]).add(V(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(m.dist));
})();
/** his head's middle on the stone (head probe: 0.2 under segF's HEAD mark) */
const LI_F = V(STONE_AT.x, 1.18, STONE_AT.z);
/** a point a head's radius above his head's middle in each scene: its distance on screen from the middle = his head's size */
const R = 0.2, LI_E_TOP = LI_E.clone().add(V(0, R, 0)), LI_F_TOP = LI_F.clone().add(V(0, R, 0));
export const MATCH_HEAD = MATCH_LI.sy - proj(E_END, LI_E_TOP).sy;
const fOpen = (x: number, z: number, fov: number) => aimExact(F_CAM0.clone().add(V(x, 0, z)), LI_F, MATCH_LI.sy, MATCH_LI.sx, fov);
/** F's first frame: [metres right of F_CAM0, metres back, lens] solved (Newton, numeric slopes) so the moon lands on
 *  MATCH_LAMP and his head is as big as it was in E */
export const F_OPEN: CamPose = (() => {
  let u = [-0.5, 1.5, 40];
  const err = (v: number[]) => { const c = fOpen(v[0], v[1], v[2]), q = proj(c, MOON); return [q.sx - MATCH_LAMP.sx, q.sy - MATCH_LAMP.sy, (MATCH_LI.sy - proj(c, LI_F_TOP).sy) - MATCH_HEAD]; };
  const hs = [0.01, 0.01, 0.1];
  for (let it = 0; it < 40; it++) {
    const e = err(u);
    if (Math.hypot(...e) < 0.1) break;
    const J = [0, 1, 2].map((k) => { const v = [...u]; v[k] += hs[k]; const ek = err(v); return ek.map((x, i) => (x - e[i]) / hs[k]); });   // J[k][i] = d e_i / d u_k
    const M = [0, 1, 2].map((i) => [0, 1, 2].map((k) => J[k][i]));
    const det3 = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det3(M); if (Math.abs(D) < 1e-12) break;
    const d = [0, 1, 2].map((k) => { const m = M.map((r, i) => r.map((x, j) => (j === k ? -e[i] : x))); return det3(m) / D; });
    const lim = [0.4, 0.8, 5];
    u = u.map((x, k) => x + Math.max(-lim[k], Math.min(lim[k], d[k])));
    u[2] = Math.max(15, Math.min(80, u[2]));
  }
  return fOpen(u[0], u[1], u[2]);
})();
