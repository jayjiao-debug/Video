// THE VERBS of this film's shots: the kit's action library (src/kit/day/verbs.ts) with this film's quotes, plus the
// few stagings every scene here uses.
import * as THREE from "three";
import { makeVerbs } from "../../../kit/day/verbs";
import { FPS, QUOTES, line, type Speaker } from "../story";
import { EYE, FOV } from "../cam";
import type { World } from "../world";
import type { Person } from "../people";

export const VERBS = makeVerbs({ fps: FPS, EYE, FOV, quotes: QUOTES });
export const { V, v3, yawTo, speak, accent, ky, at: step, standing, saying, walkAlong, seated, eye, alive, bow, kneel } = VERBS;

/** frames: the first / last frame of a line */
export const L0 = (id: string) => line(id).from, L1 = (id: string) => line(id).to;
/** 0..1 eased between two frames */
export const ramp = (f: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a))); return t * t * (3 - 2 * t); };
export const mix = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);
/** a standing figure that speaks when it is `who`'s line */
export const fig = (w: World, p: Person, key: string, at: THREE.Vector3, facing: number, f: number, id: number, who?: Speaker, extra: Record<string, unknown> = {}) => {
  const q = who ? saying(who, f) : null;
  const r = w.actor(p, key);
  r.set({ ...standing(at, facing, f, id), ...(q ? speak(q, f, id) : {}), ...extra } as never);
  return r;
};
