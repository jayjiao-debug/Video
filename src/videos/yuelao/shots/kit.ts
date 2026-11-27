// THE SHOTS' TOOLS of 采访月老的一天: the kit's verbs with this film's quotes, places and faces, and a few of its own
// (put: one call per figure; loopWalk: the haulers; sit: a man on a sack; salute; rows).
import React from "react";
import * as THREE from "three";
import { makeVerbs } from "../../../kit/day/verbs";
import { FPS, QUOTES, line, type Speaker, type Pose } from "../story";
import { cap, capWord } from "../captions";
import { EYE, FOV, type CamKey } from "../cam";
import { ISLAND, type Place } from "../places";
import { FACES, type Person } from "../people";
import type { World } from "../world";
import type { Rig, RigState, RigPose, RigFace } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";

export const VERBS = makeVerbs({ fps: FPS, EYE, FOV, quotes: QUOTES });
export const { V, v3, yawTo, speak, accent, ky, kv, standing, saying, walkAlong, walkTime, rel, hang, seated, bow, alive, headPx, kick, shake, hopArc } = VERBS;
export const h = React.createElement;
export const frag = (...kids: React.ReactNode[]) => React.createElement(React.Fragment, null, ...kids);
export type Vec3 = [number, number, number];
export const P = (place: Place, x: number, y: number, z: number) => V(ISLAND[place] + x, y, z);
export const wv = (place: Place, v: readonly number[]): Vec3 => [ISLAND[place] + v[0], v[1], v[2]];
export const ck = (place: Place, f: number, pos: readonly number[], look: readonly number[], fov = FOV, o: Partial<CamKey> = {}): CamKey => ({ f, pos: wv(place, pos), look: wv(place, look), fov, ...o });
export const face = (n: string): Expr | RigFace => ((FACES as Record<string, Expr | RigFace>)[n] ?? (n as Expr));
/** step keys of faces by name: [[frame, "bright"], ...] */
export const faceAt = (f: number, keys: [number, string][]): RigState["expr"] => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return face(e) as RigState["expr"]; };
export const talk = (who: Speaker, f: number, id: number, stress?: number[]) => { const q = saying(who, f); return q ? speak(q, f, id, stress) : {}; };
export const wordAt = (id: string, word: string) => capWord(id, word).from;
export const startOf = (id: string) => cap(id, 0).from;
export const screenOf = (id: string, i: number) => cap(id, i).from;
export const endOf = (id: string) => line(id).to;
export const sec = (s: number) => Math.round(s * FPS);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
/** 0..1 up over n frames from `on`, down over m frames to `off` */
export const win = (f: number, on: number, off: number, n = 8, m = n) => Math.min(smooth((f - on) / n), 1 - smooth((f - (off - m)) / m));
/** an impulse at `on` that dies over n frames (1 on the first frame) */
export const hit = (f: number, on: number, n = 10) => (f < on || f >= on + n ? 0 : Math.pow(1 - (f - on) / n, 2));
export type { Pose };

export type Act = {
  at: THREE.Vector3; facing: number; id: number; expr?: string | [number, string][]; who?: Speaker; pose?: RigPose; hands?: RigState["hands"]; turn?: number;
  lookDown?: number; head?: RigState["head"]; lean?: RigState["lean"]; gaze?: number; hide?: string[]; more?: Partial<RigState>;
};
/** ONE FIGURE: standing at `at`, alive, with its face, its words (who = lip sync from the film's quotes) and its pose */
export function put(w: World, f: number, person: Person, a: Act, key = ""): Rig {
  const r = w.actor(person, key);
  const st: Partial<RigState> = { ...standing(a.at, a.facing, f, a.id) };
  if (a.pose) st.pose = a.pose;
  if (a.expr !== undefined) st.expr = (typeof a.expr === "string" ? face(a.expr) : faceAt(f, a.expr)) as RigState["expr"];
  if (a.who) Object.assign(st, talk(a.who, f, a.id));
  if (a.hands) { st.hands = a.hands; if (!a.pose) st.pose = { kind: "hold", t: f / FPS } as RigPose; }
  if (a.turn !== undefined) st.turn = a.turn;
  if (a.lookDown !== undefined) st.lookDown = a.lookDown;
  if (a.head) st.head = a.head;
  if (a.lean) st.lean = a.lean;
  if (a.gaze !== undefined) st.gaze = a.gaze;
  if (a.hide) st.hide = a.hide;
  if (a.more) Object.assign(st, a.more);
  r.set(st);
  return r;
}
/** a man walking a closed loop of floor points for ever (the haulers): where he is t seconds in */
export const loopWalk = (pts: THREE.Vector3[], speed: number, t: number) => {
  const closed = [...pts, pts[0]], T = walkTime(closed, speed), u = ((t % T) + T) % T;
  return walkAlong(closed, speed, u);
};
/** a man sitting on something `top` m high at `at` (his floor point), facing `facing`: spread into put()'s `more` */
export const sit = (at: THREE.Vector3, facing: number, top: number, t: number) => seated({ top: at.clone().setY(top), floor: at.y, back: 0, facing }, t);
/** a soldier's salute: the right hand to the end of the helmet's brim. k 0..1. Returns the hands for put().
 *  `cam` (the camera's world position): the hand is placed for the side the figure SHOWS (the rig turns a figure's
 *  front toward the camera), not for its true facing: without it an officer seen from his left saluted across his own
 *  face. A hand in front of the head is hidden by the rig (rule 4), so the hand sits beside the head. */
export const saluteHands = (at: THREE.Vector3, facing: number, k: number, scale = 1, cam?: readonly number[]): RigState["hands"] => {
  if (k <= 0.01) return [null, null];
  const shown = cam ? Math.atan2(cam[0] - at.x, cam[2] - at.z) : facing;
  const down = hang(at, facing, 0), up = rel(at, shown, -0.3 * scale, 1.33 * scale, 0.05);
  return [down.lerp(up, smooth(k)), null];
};

// ---- this film's own
import { YUELAO } from "../people";
export const OFFICE_P = (x: number, y: number, z: number) => P("office", x, y, z);
/** a point `d` m from `a` toward `b` */
export const toward = (a: THREE.Vector3, b: THREE.Vector3, d: number) => a.clone().add(b.clone().sub(a).normalize().multiplyScalar(d));
/** the point of a figure's mouth, a little in front of the head toward the camera */
export const mouthOf = (w: World, r: Rig) => { const hd = r.headWorld(); return toward(hd, w.camera.position, 0.2).add(V(0, -0.09, 0)); };
/** the point of a figure's mouth when its head keeps a true facing `yaw` (a profile, a back view: state.turn 1) */
export const mouthAt = (r: Rig, yaw: number) => r.headWorld().add(V(Math.sin(yaw) * 0.215, -0.09, Math.cos(yaw) * 0.215));
/** 月老 standing somewhere with his face and his words: the lead's default acting (a worried resting face) */
export const lead = (w: World, f: number, a: Omit<Act, "id" | "who">, key = "") => put(w, f, YUELAO, { id: 1, who: "yl", ...a }, key);
/** a thread from a to b hanging with `sag`, shown this frame */
export const thread = (w: World, key: string, a: THREE.Vector3, b: THREE.Vector3, sag = 0.12, o: { r?: number; glow?: number; n?: number; cut?: number } = {}) => w.props.thread(key, w.props.hang(a, b, sag, o.n ?? 5), o);
/** a loop of thread round a point (an ankle, a wrist): a closed ring of radius r, tilted a little */
export const ring = (w: World, key: string, c: THREE.Vector3, r = 0.045, tilt = 0.2) => {
  const pts: THREE.Vector3[] = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; pts.push(c.clone().add(V(Math.cos(a) * r, Math.sin(a) * r * tilt, Math.sin(a) * r))); }
  w.props.thread(key, pts, { closed: true, r: 0.008 });
};
/** A SEATED FIGURE'S SHIN (after w.update()): its ankle joint and the unit direction up the shin to the knee. The rig
 *  keeps the seated leg to itself (legW); it is only read here. */
export const seatedShin = (r: Rig, i: 0 | 1): { a: THREE.Vector3; up: THREE.Vector3 } => {
  const W = (r as unknown as { legW?: { k: THREE.Vector3; a: THREE.Vector3 }[] }).legW?.[i];
  return W ? { a: W.a.clone(), up: W.k.clone().sub(W.a).normalize() } : { a: r.footWorld(i), up: V(0, 1, 0) };
};
/** the facing that turns a figure at `at` toward `to` */
export const faceTo = (at: THREE.Vector3, to: THREE.Vector3) => Math.atan2(to.x - at.x, to.z - at.z);
/** a small prop in a figure's hand (after w.update()): hand 0 | 1, lifted dy */
export const inHand = (w: World, name: Parameters<World["prop"]>[0], r: Rig, hand: 0 | 1, o: { dy?: number; yaw?: number; pitch?: number; roll?: number; scale?: number; key?: string } = {}) =>
  w.prop(name, o.key).put(r.handWorld(hand).add(V(0, o.dy ?? 0, 0)), { yaw: o.yaw, pitch: o.pitch, roll: o.roll, scale: o.scale });
/** both hands in front of the chest (holding something up): k 0..1 raises them from the sides */
export const holdUp = (at: THREE.Vector3, facing: number, k: number, y = 0.92, dx = 0.11, z = 0.24): RigState["hands"] => k <= 0.01 ? undefined : [hang(at, facing, 0).lerp(rel(at, facing, -dx, y, z), smooth(k)), hang(at, facing, 1).lerp(rel(at, facing, dx, y, z), smooth(k))];

// ---- THE SEATS of the film's furniture (rig/seats.ts): a sitter's hip, knees and desk always match what is built.
// Each is the Seat act({ seat }) takes; the robe is told about it there (garb.setSeat).
import { chairSeat, stoolSeat, seatOn } from "../../../kit/day/rig/seats";
import { OFFICE, WORK, STREET } from "../places";
const STOOL_SPEC = stoolSeat({ seat: OFFICE.stool.top, d: 0.34 }), NOODLE_SPEC = stoolSeat({ seat: 0.34, d: 0.31 });
const CHAIR_SPEC = chairSeat({ seat: WORK.chair.top, d: 0.34, backZ: -0.175, backTop: WORK.chair.top + 0.41 });
export const SEATS = {
  /** 月老's stool behind his desk, facing the door (+z): the desk's near edge is 0.32 in front of the seat's centre */
  stool: seatOn(STOOL_SPEC, P("office", OFFICE.stool.x, 0, OFFICE.stool.z), 0, { floor: 0, desk: { edge: OFFICE.desk.z - OFFICE.desk.d / 2 - 0.03 - OFFICE.stool.z, top: OFFICE.desk.top } }),
  /** 小满's office chair behind her desk, facing the lens */
  chair: seatOn(CHAIR_SPEC, P("work", WORK.chair.x, 0, WORK.chair.z), 0, { floor: 0, desk: { edge: WORK.desk.z - WORK.desk.d / 2 - WORK.chair.z, top: WORK.desk.top } }),
  /** the noodle table's two stools, each facing the table */
  noodleL: seatOn(NOODLE_SPEC, P("street", STREET.stools[0].x, 0, STREET.stools[0].z), Math.PI / 2, { floor: 0, desk: { edge: STREET.table.x - STREET.table.r - STREET.stools[0].x, top: STREET.table.top } }),
  noodleR: seatOn(NOODLE_SPEC, P("street", STREET.stools[1].x, 0, STREET.stools[1].z), -Math.PI / 2, { floor: 0, desk: { edge: STREET.stools[1].x - STREET.table.x - STREET.table.r, top: STREET.table.top } }),
  /** the lowest step in front of the tower's door, left part: he sits on its tread, feet on the pavement */
  step: seatOn(stoolSeat({ seat: STREET.steps.rise, d: STREET.steps.run }), P("street", STREET.sit.x, 0, STREET.steps.front - STREET.steps.run / 2), 0, { floor: 0 }),
} as const;

/** a point eased through keys [frame, point] (a smooth ease inside each interval; holds before the first and after the last) */
export const through = (f: number, keys: [number, THREE.Vector3][]): THREE.Vector3 => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return keys[i][1].clone().lerp(keys[i + 1][1], smooth((f - keys[i][0]) / Math.max(1, keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1].clone();
};
/** the shortest turn from angle a to b, k of the way */
export const turnTo = (a: number, b: number, k: number) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };

// ---- A SHOT'S CAMERA BY WHAT IS WHERE ON THE FRAME (cam.ts lensCam): each key says where the lens is and which world
// point sits on which px of the 1080 x 1920 frame; her hand's breathing goes on top (mood, amp, walk).
import { lensCam, handheld } from "../cam";
import type { LensKey, HandO } from "../../../kit/day/cam";
export type ShotKey = { f: number; pos: readonly number[] | ((f: number) => readonly number[]); at: readonly number[] | THREE.Vector3 | ((f: number) => THREE.Vector3 | readonly number[]); sx: number; sy: number; fov: number; roll?: number };
export const shotCam = (place: Place, f: number, keys: ShotKey[], o: HandO = {}) => {
  const off = ISLAND[place];
  const pt = (p: readonly number[] | THREE.Vector3, local: boolean): [number, number, number] => p instanceof THREE.Vector3 ? [p.x, p.y, p.z] : [p[0] + (local ? off : 0), p[1], p[2]];
  const ks: LensKey[] = keys.map((k) => ({
    f: k.f, sx: k.sx, sy: k.sy, fov: k.fov, roll: k.roll,
    pos: typeof k.pos === "function" ? (g: number) => pt((k.pos as (f: number) => readonly number[])(g), true) : pt(k.pos, true),
    at: typeof k.at === "function" ? (g: number) => pt((k.at as (f: number) => THREE.Vector3 | readonly number[])(g), true) : pt(k.at, true),
  }));
  return handheld(lensCam(f, ks), f, o);
};
