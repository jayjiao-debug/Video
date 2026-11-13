// THE NIGHT (place "night", island x 400): a path by the pond 兰池 at night (PLAN 1, 7F): the moon, reeds, a big rock to
// duck behind, two lanterns. NUMBERS ONLY. Owner: WP2. The path runs along -z; the pond lies EAST of it (screen right),
// the reed bed between the path and the water is where the bandits hide; the rock is WEST of the path, near the start.
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

export const NX = ISLAND.night;
export const NIGHT_SET = {
  /** the ground */ ground: { x0: NX - 30, x1: NX + 30, z0: -60, z1: 12 },
  /** the path (paved, pale) along z: its middle x, width, from z1 to z0 */ path: { x: NX - 0.2, w: 2.0, z0: -40, z1: 10 },
  /** the pond (an ellipse, its water `depth` under the ground): centre, radii */ pond: { x: NX + 5.4, z: -11, rx: 4.0, rz: 8.0, depth: 0.22 },
  /** the reed beds: [x, z, radius] patches (no reed within `clear` m of a bandit mark or the path) */ reeds: [[NX + 1.9, -5.4, 1.25], [NX + 1.75, -8.4, 0.85], [NX + 2.9, -3.2, 0.9], [NX + 9.4, -7.5, 1.4], [NX + 2.3, -15.2, 1.2], [NX + 7.6, -19.4, 1.5]] as [number, number, number][], clear: 0.45,
  /** the rock she ducks behind (F06): its middle, its size (w along x, h, d along z) */ rock: { x: NX - 1.95, z: 0.55, w: 1.5, h: 1.18, d: 1.05 },
  /** the two lantern posts: [x, z], the lantern's hook height */ lanterns: [[NX - 1.62, -3.4], [NX + 0.95, -11.5]] as [number, number][], lanternH: 1.95,
  /** the moon: its direction from her eyes at the stand (azimuth from -z toward +x, elevation, degrees), its
   *  distance and angular diameter (degrees; drawn big, as a toon moon): over the pond, inside the stand view */ moon: { az: 8, el: 16, dist: 300, deg: 5.5 },
  /** the willows on the far bank: [x, z] */ willows: [[NX + 10.6, -13.5], [NX + 4.2, -21.5], [NX - 3.6, -10.0]] as [number, number][],
};
export const NIGHT = {
  /** where he walks (the path) */ emperor: V(NX - 0.2, 0, -3.2),
  /** the four guards round him */ guards: [V(NX - 1.0, 0, -2.4), V(NX + 0.7, 0, -2.4), V(NX - 1.0, 0, -4.4), V(NX + 0.7, 0, -4.4)],
  /** where the bandits leap out from (the reed bed between the path and the pond) */ bandits: [V(NX + 1.6, 0, -5.0), V(NX + 2.2, 0, -4.0), V(NX + 1.2, 0, -6.2)],
  /** where she ducks: behind the rock's east shoulder, her eyes 0.95 m up (the rock is 1.18 high) */ duck: V(NX - 1.35, 0, 1.45),
};
/** NAMED CAMERAS (her eyes, 1.55 m; the duck 1.0 m behind the rock) */
export const NIGHT_CAMS: Record<"stand" | "duck" | "pond" | "moon", Cam> = {
  /** F01: on the path, the guards and him ahead, the moon over the pond */
  stand: eyeCam(NX + 0.35, 1.9, [NX - 0.1, 1.25, -5]),
  /** F06: ducked behind the rock (its edge in the left foreground), peeking at the reeds */
  duck: { pos: [NX - 1.35, 0.95, 1.45], look: [NX + 0.6, 0.9, -5.5], fov: 64 },
  /** toward the pond and the reed bed */
  pond: eyeCam(NX - 0.4, -0.6, [NX + 3.0, 0.8, -7]),
  /** the moon over the water */
  moon: eyeCam(NX - 0.2, 2.2, [NX + 1.5, 4.5, -30]),
};
export const NIGHT_STAND: Stand = { cam: eyeCam(NX + 0.35, 1.9, [NX - 0.1, 1.25, -5]), emperor: V(NX - 0.2, 0, -2.6), facing: 0 };
