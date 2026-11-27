// THE STREET AT NIGHT (scenes G to J): the marks the four scenes share, and the two threads on the steps.
import * as THREE from "three";
import { P, V, SEATS } from "./kit";
import { lay, STREET_FLOOR } from "./thread";
import type { World } from "../world";

/** where 月老 sits: the lowest step, left of the door (seat top 0.17) */
export const SEAT = P("street", -0.85, 0.17, -2.3), SEAT_TOP = 0.38, SEAT_FACING = 0.12;
/** the landing in front of the door, where she takes her order */
export const LANDING = P("street", 0.15, 0.51, -3.3), INSIDE = P("street", 0.1, 0.51, -4.3);
/** the rider by his scooter, and where she stops in front of him */
export const BY_SCOOTER = P("street", 2.3, 0, -1.0), HER_STOP = P("street", 1.45, 0, -1.3);
/** the rider's way up the steps to the landing */
export const UP = [BY_SCOOTER, P("street", 1.05, 0, -1.75), P("street", 0.95, 0.17, -2.18), P("street", 0.9, 0.34, -2.54), P("street", 0.85, 0.51, -3.0)];
/** her way down the steps to him */
export const DOWN = [LANDING, P("street", 0.45, 0.51, -2.95), P("street", 0.5, 0.34, -2.54), P("street", 0.6, 0.17, -2.18), P("street", 0.8, 0, -1.8), HER_STOP];
/** THE OLD THREAD: from her door down the steps and across the pavement to his scooter */
const OLD: [number, number, number][] = [[0.2, 0.525, -3.25], [0.33, 0.525, -2.76], [0.36, 0.355, -2.7], [0.42, 0.355, -2.4], [0.45, 0.185, -2.34], [0.52, 0.185, -2.04], [0.56, 0.02, -1.98], [0.9, 0.02, -1.7], [1.6, 0.02, -1.25], [2.25, 0.02, -1.02]];
const pts = (dy: number, dx = 0) => OLD.map(([x, y, z]) => P("street", x + dx, y + dy, z));
/** the old thread: faint and dusty (k 0) to gold and glowing (k 1) */
export const oldThread = (w: World, k: number) => w.props.thread("old", pts(0), { r: 0.006 + 0.002 * k, glow: 0.15 + 0.85 * k, col: k > 0.5 ? "#ffcf6a" : k > 0.2 ? "#e2a070" : "#a8746a" });
/** 月老's own red thread lying on top of it; lift 0..1 = he picks it up by the middle (toward `to`), cut = how much is left */
export const hisThread = (w: World, lift = 0, to?: THREE.Vector3, cut = 1) => {
  const p = pts(0.014, 0.012);
  if (lift > 0 && to) for (let i = 2; i < 8; i++) { const u = 1 - Math.abs(i - 5) / 3.2; p[i].lerp(to, Math.max(0, u) * lift); }
  w.props.thread("his", p, { r: 0.008, glow: 0.35, cut });
};

// ---------------------------------------------------------------------------------------------- the reshoot's marks
/** where she stands with her camera at night (street local) */
export const CAMN: [number, number, number] = [-0.3, 1.5, 2.4];
/** the lowest step, left of the door: his seat; where he stands in front of it before he sits */
export const STEP = SEATS.step, STAND_AT = P("street", -0.85, 0, -1.84);
/** the seat with its top moved out over the pavement while he is on his feet (k 1 = standing in front of the step) */
export const stepSeat = (k: number) => (k > 0 ? { ...STEP, top: STEP.top.clone().add(V(0, 0, 0.34 * k)) } : STEP);
/** at the door: where she takes her order, where the rider stands, her way out of the lobby */
export const DOOR_HER = P("street", -0.25, 0.51, -3.3), DOOR_RIDER = P("street", 0.42, 0.51, -3.15);
export const WAY_OUT = [P("street", -1.15, 0.51, -4.5), P("street", -0.3, 0.51, -4.1), DOOR_HER];
/** up the three steps from x0 to x1: a walker's path that lifts the foot before each riser (never through a tread) */
export const stairs = (x0: number, x1: number): THREE.Vector3[] => {
  const out: THREE.Vector3[] = [];
  for (let k = 0; k < 3; k++) { const z = -2.0 - 0.36 * k, x = x0 + ((x1 - x0) * k) / 2; out.push(P("street", x, 0.17 * k, z + 0.15), P("street", x, 0.17 * (k + 1), z - 0.01)); }
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
const DUST = new THREE.Color("#8a5f58"), GOLD = new THREE.Color("#ffcf6a");
export const oldLine = (w: World, k: number, o: { her?: THREE.Vector3; his?: THREE.Vector3[] } = {}) => {
  const q = Math.round(Math.max(0, Math.min(1, k)) * 20) / 20, col = `#${DUST.clone().lerp(GOLD, q).getHexString()}`;
  const pts = lay([o.her ?? SILL, ...ROUTE, ...(o.his ?? [KERB])], STREET_FLOOR, { wander: 0.02, seed: 7, r: 0.0055 });
  w.props.thread("old", pts, { r: 0.005 + 0.003 * q, glow: 0.02 + 0.98 * q, col });
  return pts;
};
