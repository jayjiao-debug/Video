// THE FEAST'S DANCERS (scene B; v3, Jay: "there is less moving around"). The script always had dancers in the hall; v2
// left it empty. Two masked couples promenade round the dance floor in a pavane: side by side, his right hand and her
// left joined and raised in front of them, a slow walk, half a round apart, so the ball goes on behind Romeo and the
// tilt across the hall to Juliet passes them.
//   the round: an oval on the dance floor (local hall coordinates), left of the line from Romeo's wall to Juliet's
//   pillar (the tilt along his look never has a dancer in front of her) and clear of Romeo's wall
import * as THREE from "three";
import { rigWalk } from "../../../kit/day/verbs";
import { V, standing } from "./common";
import { P, face } from "./kit";
import { FPS } from "../story";
import { GUEST_LADY_A, GUEST_MAN_A, GUEST_LADY_B, GUEST_MAN_B, type Person } from "../people";
import type { World } from "../world";

/** the round: centre, half-axes (m, local hall x / z), the walk's speed (m/s) and half the gap between partners */
export const ROUND = { x: -0.6, z: -3.0, ax: 0.7, az: 1.2, speed: 0.42, half: 0.25 };
const N = 360;
const LOOP = (() => {
  const pts: { x: number; z: number; s: number }[] = [];
  let s = 0;
  for (let i = 0; i <= N; i++) {
    const a = (2 * Math.PI * i) / N, x = ROUND.x + ROUND.ax * Math.cos(a), z = ROUND.z + ROUND.az * Math.sin(a);
    if (i) s += Math.hypot(x - pts[i - 1].x, z - pts[i - 1].z);
    pts.push({ x, z, s });
  }
  return { pts, len: s };
})();
/** the point d metres round the oval (from its right-hand end, going toward the camera side first), the way it heads
 *  (facing, the rig's atan2(dx, dz)) and the outward normal */
const onLoop = (d: number) => {
  const L = LOOP.len, u = ((d % L) + L) % L, P0 = LOOP.pts;
  let i = 0;
  while (i < N - 1 && P0[i + 1].s < u) i++;
  const a = P0[i], b = P0[i + 1], k = (u - a.s) / Math.max(1e-6, b.s - a.s), x = a.x + (b.x - a.x) * k, z = a.z + (b.z - a.z) * k;
  const dx = b.x - a.x, dz = b.z - a.z, n = Math.hypot(dx, dz) || 1;
  // the outward normal: the walkers' left, (dz, -dx) (the oval's centre is on their right)
  return { x, z, facing: Math.atan2(dx, dz), nx: dz / n, nz: -dx / n };
};
type Couple = { man: Person; lady: Person; start: number; id: number };
const COUPLES: Couple[] = [
  { man: GUEST_MAN_A, lady: GUEST_LADY_A, start: 0.2, id: 11 },
  { man: GUEST_MAN_B, lady: GUEST_LADY_B, start: 0.2 + LOOP.len / 2, id: 13 },
];
/** the dancers at film frame f of scene B (from = the scene's first frame): call before w.update() */
export function dancers(w: World, f: number, from: number) {
  const t = (f - from) / FPS;
  for (const c of COUPLES) {
    const d = c.start + ROUND.speed * t, p = onLoop(d);
    // she walks on the inside (his right), he on the outside; their joined hands between them, a forearm in front
    const outside = { x: p.x + p.nx * ROUND.half, z: p.z + p.nz * ROUND.half }, inside = { x: p.x - p.nx * ROUND.half, z: p.z - p.nz * ROUND.half };
    const fx = Math.sin(p.facing), fz = Math.cos(p.facing);
    const grip = P("hall", p.x + fx * 0.2, 0.8, p.z + fz * 0.2);
    for (const [who, at, hand, dir] of [[c.man, outside, 0, 1], [c.lady, inside, 1, -1]] as const) {
      const r = w.actor(who), foot = P("hall", at.x, 0, at.z);
      // the two hands meet 2.5 cm either side of the grip (touching, not one inside the other)
      const hp = grip.clone().add(V(p.nx * 0.025 * dir, 0, p.nz * 0.025 * dir));
      const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = hand === 0 ? [hp, null] : [null, hp];
      r.set({
        ...standing(foot, p.facing, f, c.id + (hand === 0 ? 0 : 1), { expr: face("sure") }),
        pose: rigWalk(ROUND.speed * t + 2, ROUND.speed, 0.6),
        hands,
        // now and then a look at the partner (never at the lens: they are not in the interview)
        gaze: Math.sin(t * 0.7 + c.id) > 0.55 ? (hand === 0 ? 0.6 : -0.6) : 0,
      });
    }
  }
}
