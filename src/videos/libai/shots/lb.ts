// The Li Bai film's own staging helpers (on top of shots/common.ts): the tavern's dressing, a figure at a low table,
// held props (jar, cup) pinned to both hands, the camera aim. Pure functions of their arguments.
import * as THREE from "three";
import { FPS, clamp01, smooth, type CamPose } from "../story";
import { ROOM, RX, FOV } from "../layout";
import { deskSeat, holdPoints, type PropName, type PutOpts } from "../props";
import { DESK } from "../props/things";
import { KEEPER, VILLAGER, VILLAGER2, VILLAGER3, VILLAGER4, type Person } from "../people";
import type { World } from "../world";
import { V, rel, alive, lid, type RigState } from "./common";

export type St = Partial<RigState>;
const RAD = Math.PI / 180;

/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px of 1080 x 1920) */
export const aim = (pos: THREE.Vector3 | [number, number, number], tgt: THREE.Vector3 | [number, number, number], sy = 700, sx = 540, fov = FOV): CamPose => {
  const p = Array.isArray(pos) ? V(...pos) : pos, t = Array.isArray(tgt) ? V(...tgt) : tgt;
  const d = t.clone().sub(p), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = p.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [p.x, p.y, p.z], look: [look.x, look.y, look.z], fov };
};
/** a blend 0..1 from frame a to frame b (smooth) */
export const ramp = (f: number, a: number, b: number) => smooth(clamp01((f - a) / Math.max(1, b - a)));

// ------------------------------------------------------------------------------------------------ the tables
/** a low table (the desk prop) at `at` facing `rot`, a sitter behind it on a cushion: the seat and the table top */
export const table = (at: THREE.Vector3, rot = 0) => {
  const S = deskSeat(at, rot);
  return { ...S, at0: at.clone(), rot, top: at.y + DESK.top, /** a point on the table top in the sitter's frame (x left, z toward the sitter's front) */
    on: (x: number, z: number) => rel(V(at.x, at.y + DESK.top, at.z), rot, x, 0, z) };
};
/** puts the table and its cushion */
export const putTable = (w: World, T: ReturnType<typeof table>, key = "") => {
  w.prop("desk", key).put(T.at0, { rot: T.rot });
  w.prop("cushion", key).put(T.cushion, { rot: T.facing });
};
/** the state of a sitter at a table (the rig's "sit" on the cushion, hands on the table unless given) */
export const atTable = (T: ReturnType<typeof table>, f: number, id: number, extra: St = {}): St => ({
  at: T.at.clone(), facing: T.facing, seat: T.seat, pose: { kind: "sit", t: f / FPS + 0.37 * id }, ...alive(f / FPS, id), visible: true, ...extra,
});

// ------------------------------------------------------------------------------------------------ held props
/** a prop held in both hands (grip pair) with its grip point at `at`: the hands to pin and the put to do after update */
export const held = (name: PropName, at: THREE.Vector3, o: PutOpts = {}) => {
  const opts: PutOpts = { grip: "pair", ...o };
  const hs = holdPoints(name, at, opts);
  return { hands: [hs[0], hs[1]] as [THREE.Vector3, THREE.Vector3], put: (w: World, key?: string) => w.prop(name, key).put(at, opts) };
};

// ------------------------------------------------------------------------------------------------ the tavern
/** THE TAVERN (Su's room set, place "tavern"): his table in the middle (ROOM.desk), two more tables of drinkers, the
 *  keeper by the screen, jars along the wall. n = how many drinkers are there (0..4), lit = the lamps (0..1) */
export const LI_TABLE = table(V(RX + 0.6, 0, -0.45), 0);
export const TABLES = [table(V(RX - 0.6, 0, -2.2), 0.35), table(V(RX + 1.8, 0, -1.95), -0.45)];
export const KEEPER_AT = V(RX - 1.7, 0, -2.75);
const DRINKERS: [Person, number, number][] = [[VILLAGER2, 0, 0], [VILLAGER3, 1, 0], [VILLAGER, 0, 1], [VILLAGER4, 1, 1]];
/** where the extra drinkers sit (two at each side table: the second beside the first, 0.45 m along) */
const drinkerSeat = (k: number) => {
  const [, ti, side] = DRINKERS[k], T = TABLES[ti];
  const off = rel(V(), T.facing, side ? 0.45 : -0.15, 0, 0);
  return { ...T, at: T.at.clone().add(off), seat: { ...T.seat, top: T.seat.top.clone().add(off) } };
};
export type TavernO = { drinkers?: number; keeper?: boolean; lamps?: number; sleepers?: boolean; drinker?: (k: number, s: St) => St };
export const tavern = (w: World, f: number, o: TavernO = {}) => {
  putTable(w, LI_TABLE);
  TABLES.forEach((T, i) => putTable(w, T, `t${i}`));
  // jars along the back wall and by the tables
  [[RX - 2.6, -2.9], [RX - 2.2, -3.0], [RX - 2.4, -2.55], [RX + 1.6, -3.05], [RX - 0.4, -3.05]].forEach(([x, z], i) => w.prop("jar", `wall${i}`).put(V(x, 0, z), { rot: 0.3 * i, scale: 1.15 }));
  w.prop("jar", "t0").put(TABLES[0].on(0.25, 0.05), { rot: 0.4 });
  w.prop("wineBowl", "t0").put(TABLES[0].on(-0.15, 0.12));
  w.prop("wineBowl", "t1").put(TABLES[1].on(0.1, 0.1));
  const n = o.drinkers ?? 0;
  for (let k = 0; k < DRINKERS.length; k++) {
    const r = w.actor(DRINKERS[k][0]);
    if (k >= n) { r.set({ visible: false }); continue; }
    const S = drinkerSeat(k);
    let st = atTable(S as ReturnType<typeof table>, f, 10 + k, { expr: "happy" });
    if (o.sleepers && k === 0) st = { ...st, expr: "sleep", lookDown: 30, head: { dy: -0.18 } };
    if (o.drinker) st = o.drinker(k, st);
    r.set(st);
  }
  if (o.keeper !== false) w.actor(KEEPER).set({ at: KEEPER_AT, facing: 0.5, pose: { kind: "idle", t: f / FPS }, expr: "smile", blink: lid(f / FPS, 31), visible: true });
  else w.actor(KEEPER).set({ visible: false });
  const lit = o.lamps ?? 0;
  [[RX - 0.6, -2.2], [RX + 1.8, -1.95]].forEach(([x, z], i) => w.prop("lantern", `lamp${i}`).put(V(x, 2.55, z), { lit: lit > i * 0.5 ? 1 : 0.15 }));
};
/** the drinkers' Person list (for exits) */
export const DRINKER_PEOPLE = DRINKERS.map((d) => d[0]);
