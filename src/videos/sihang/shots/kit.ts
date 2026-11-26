// THE SHOTS' TOOLS of 采访八百壮士的一天: the kit's verbs with this film's quotes, places and faces, and a few of its own
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
