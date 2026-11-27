// THE STREET AT NIGHT (scenes G to J): the marks the four scenes share, and the two threads on the steps.
import * as THREE from "three";
import { P, V, SEATS } from "./kit";
import { lay, droop, part, STREET_FLOOR } from "./thread";
import type { World } from "../world";

/** the rider by his scooter */
export const BY_SCOOTER = P("street", 2.3, 0, -1.0);
/** where she stands with her camera at night (street local) */
export const CAMN: [number, number, number] = [-0.3, 1.5, 2.4];
/** the lowest step, left of the door: his seat; where he stands in front of it before he sits */
export const STEP = SEATS.step, STAND_AT = P("street", -0.85, 0, -1.75);   // his hem (26 cm) clear of the step's face
/** the seat with its top moved out over the pavement while he is on his feet (k 1 = standing in front of the step) */
export const stepSeat = (k: number) => (k > 0 ? { ...STEP, top: STEP.top.clone().add(V(0, 0, 0.43 * k)) } : STEP);
/** at the door: where she takes her order, where the rider stands, her way out of the lobby */
export const DOOR_HER = P("street", -0.25, 0.51, -3.3), DOOR_RIDER = P("street", 0.42, 0.51, -3.15);
export const WAY_OUT = [P("street", -1.15, 0.51, -4.5), P("street", -0.3, 0.51, -4.1), DOOR_HER];
/** up the three steps from x0 to x1: a walker's path. The body is as high as the HIGHER of its two feet stands (the
 *  foot nearer the door, a stride of 0.2 m into the stairs), so a leg never passes through a tread: the other foot is in the air */
export const stairs = (x0: number, x1: number): THREE.Vector3[] => {
  const out: THREE.Vector3[] = [];
  for (let k = 0; k < 3; k++) { const z = -2.0 - 0.36 * k, x = x0 + ((x1 - x0) * k) / 2; out.push(P("street", x, 0.17 * k, z + 0.36), P("street", x, 0.17 * (k + 1), z + 0.2)); }
  return out;
};
/** the rider's way from his scooter up to the door */
export const RIDER_UP = [BY_SCOOTER, P("street", 1.4, 0, -1.6), ...stairs(1.05, 0.92), P("street", 0.86, 0.51, -2.98), DOOR_RIDER];
/** where his tangle lies once he has dropped it: on the tread beside him, ON the old thread */
export const COIL_AT = P("street", -0.42, 0.17, -2.2);
/** THE OLD THREAD on the ground: from under her door, down the steps beside his seat, across the pavement to the kerb
 *  where the rider waits by his scooter. her = her ankle when she is outside; his = the rider's way from the kerb to
 *  where he stands (the kerb first) when he has left his scooter. k 0 = faint, dusty .. 1 = gold and glowing. */
const SILL = P("street", -0.25, 0, -3.56), KERB = P("street", 2.28, 0, -1.02);
const ROUTE = [P("street", -0.3, 0, -3.1), P("street", -0.42, 0, -2.62), P("street", -0.42, 0, -2.2), P("street", -0.36, 0, -1.86), P("street", 0.0, 0, -1.5), P("street", 1.0, 0, -1.25), P("street", 1.8, 0, -1.08)];
const DUST = new THREE.Color("#8a5f58"), FADED = new THREE.Color("#b9564a"), GOLD = new THREE.Color("#ffcf6a");
/** n + 1 points evenly spaced along a run of points */
const resample = (pts: THREE.Vector3[], n: number): THREE.Vector3[] => {
  const ds = [0];
  for (let i = 1; i < pts.length; i++) ds.push(ds[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const L = ds[ds.length - 1] || 1, out: THREE.Vector3[] = [];
  let j = 1;
  for (let i = 0; i <= n; i++) { const d = (L * i) / n; while (j < pts.length - 1 && ds[j] < d) j++; out.push(pts[j - 1].clone().lerp(pts[j], (d - ds[j - 1]) / Math.max(1e-6, ds[j] - ds[j - 1]))); }
  return out;
};
/** its old way on the ground, her end first, with the length run at each point */
const WAY = [SILL, ...ROUTE, KERB], WAY_S = WAY.reduce<number[]>((s, p, i) => (i ? [...s, s[i - 1] + Math.hypot(p.x - WAY[i - 1].x, p.z - WAY[i - 1].z)] : [0]), []), WAY_L = WAY_S[WAY_S.length - 1];
/** how far along its old way (m) the thread passes nearest to a point on the ground */
const nearWay = (p: THREE.Vector3): number => {
  let best = Infinity, at = 0;
  for (let i = 1; i < WAY.length; i++) {
    const a = WAY[i - 1], b = WAY[i], dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / l2)), d = Math.hypot(p.x - a.x - dx * u, p.z - a.z - dz * u);
    if (d < best) { best = d; at = WAY_S[i - 1] + u * Math.sqrt(l2); }
  }
  return at;
};
const wayAt = (s: number): THREE.Vector3 => {
  const d = Math.max(0, Math.min(WAY_L, s));
  let j = 1; while (j < WAY.length - 1 && WAY_S[j] < d) j++;
  return WAY[j - 1].clone().lerp(WAY[j], (d - WAY_S[j - 1]) / Math.max(1e-6, WAY_S[j] - WAY_S[j - 1]));
};
/** the old thread's colour: dusty (0) .. gold (1); clean = the dust shaken off it, its faded red showing */
export const oldCol = (k: number, clean = 0) => `#${DUST.clone().lerp(FADED, 0.8 * Math.round(Math.max(0, Math.min(1, clean)) * 10) / 10).lerp(GOLD, Math.round(Math.max(0, Math.min(1, k)) * 20) / 20).getHexString()}`;
export type OldO = {
  /** scene G: her ankle at the door; the rider's walked way from the kerb to his ankle (the thread trails behind him) */
  her?: THREE.Vector3; his?: THREE.Vector3[];
  /** scenes I and J: the two ankles it is tied to. It is a thread of fate, as long as it has to be: from each ankle it
   *  runs to its old way on the ground a step ahead, and lies along that way between the two. */
  ends?: { her?: THREE.Vector3; his?: THREE.Vector3 };
  /** someone pinches it at `at` and lifts it h m: it comes off the ground in a small tent */
  lift?: { at: THREE.Vector3; h: number };
  /** k 0..1: its slack runs in until it is one line between the two ankles a and b (the moment it comes true) */
  tight?: { a: THREE.Vector3; b: THREE.Vector3; k: number };
  /** 0..1: how much of its length has lit up gold, from her end */
  lit?: number;
  /** 0..1: the dust shaken off it */
  clean?: number;
};
export const oldLine = (w: World, k: number, o: OldO = {}) => {
  const q = Math.round(Math.max(0, Math.min(1, k)) * 20) / 20, clean = o.clean ?? 0;
  let path: THREE.Vector3[];
  if (o.ends) {
    // from each knot the thread comes down to the ground a few centimetres on, toward where it is going
    const E = o.ends, sH = E.her ? nearWay(E.her) : 0, sR = E.his ? nearWay(E.his) : WAY_L, mid = (sH + sR) / 2;
    const a = E.her ? Math.min(sH + 0.3, mid) : 0, b = E.his ? Math.max(sR - 0.3, mid) : WAY_L;
    const down = (k: THREE.Vector3, to: THREE.Vector3) => { const d = V(to.x - k.x, 0, to.z - k.z); return V(k.x, 0, k.z).addScaledVector(d.lengthSq() > 1e-6 ? d.normalize() : d, 0.07); };
    path = E.her ? [down(E.her, wayAt(a)), wayAt(a)] : [wayAt(a)];
    for (let i = 0; i < WAY.length; i++) if (WAY_S[i] > a + 0.12 && WAY_S[i] < b - 0.12) path.push(WAY[i]);
    if (b > a + 0.05) path.push(wayAt(b));
    if (E.his) path.push(down(E.his, wayAt(b)));
  } else path = [o.her ?? SILL, ...ROUTE, ...(o.his ?? [KERB])];
  let pts = lay(path, STREET_FLOOR, { wander: 0.02, seed: 7, r: 0.0055 });
  if (o.ends?.her) pts.unshift(o.ends.her.clone());
  if (o.ends?.his) pts.push(o.ends.his.clone());
  if (o.lift && o.lift.h > 0.001) { const L = o.lift; for (const p of pts) { const d = Math.hypot(p.x - L.at.x, p.z - L.at.z); if (d < 0.42) p.y += L.h * (1 - d / 0.42) ** 1.6; } }
  if (o.tight && o.tight.k > 0.001) {
    const T = o.tight, e = Math.max(0, Math.min(1, T.k)), N = 60, from = resample(pts, N), to = resample(droop(T.a, T.b, 0.05, STREET_FLOOR, { n: 16 }), N);
    pts = from.map((p, i) => p.lerp(to[i], e));
  }
  const lit = o.lit ?? (q > 0 ? 1 : 0);
  if (lit <= 0.001) w.props.thread("old", pts, { r: 0.005 + 0.0012 * clean, glow: 0.02 + 0.1 * clean, col: oldCol(0, clean) });
  else if (lit >= 0.999) w.props.thread("oldLit", pts, { r: 0.0065, glow: 1, col: oldCol(Math.max(q, 0.85)) });
  else {
    // the gold runs along it from her end: the lit part and the rest are two pieces that meet (never one inside the other)
    const rs = resample(pts, 80);
    w.props.thread("oldLit", part(rs, lit), { r: 0.0065, glow: 1, col: oldCol(Math.max(q, 0.85)) });
    w.props.thread("old", part([...rs].reverse(), 1 - lit), { r: 0.005 + 0.0012 * clean, glow: 0.02 + 0.1 * clean, col: oldCol(0, clean) });
  }
  return pts;
};
