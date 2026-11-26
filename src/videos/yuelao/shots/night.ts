// THE STREET AT NIGHT (scenes G to J): the marks the four scenes share, and the two threads on the steps.
import * as THREE from "three";
import { P, V } from "./kit";
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
void V;
