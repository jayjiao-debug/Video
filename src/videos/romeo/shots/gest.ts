// HANDS AND BODIES THAT MOVE WITH THE WORDS (v5, the owner on the v4 cut: "Make their body or hands move as they speak
// to make things more interesting"). Until v4 a speaker took one pose per line and held it: an arm went up on the first
// word and stood there for three seconds while only the mouth moved.
// A line is acted in STROKES: the frame each of its screens starts on (a phrase) and the words a shot names. A stroke
// is a small fast move that lands on its frame and settles slowly (the hand taps, the body dips). Three tools:
//   lineBody(f, id, o)   the speaker's body over a line, for RigState.lean (degrees): a lean toward the listener held
//                        through the line, a dip and a tip to one side and the other on each stroke, a slow sway
//   talkHead(who, f, n)  the speaker's head: the rig's own speaking head (a tilt held through the line, a nod on its
//                        first syllable) and a nod on every later stroke, with the shot's own accents added.
//                        (Until v4 most shots wrote `head: accent(...) ?? undefined` after talk(): that threw the
//                        rig's speaking head away, and a speaker's head stood still on his shoulders.)
//   reach(p, k)          a hand on its way: p taken k of the way (0..1) from wherever the pose puts that free hand
//                        (it hangs, it swings with a walk). The World finds that place by solving the figure once
//                        without the hand (world.ts update, partHands below), so a gesture starts and ends exactly
//                        where the arm hangs: nothing jumps, and no shot has to know where a hanging hand is
//   over / beat / strokes   the timing: how much of a gesture is up during a line, and its strokes
// How much: by character (the format: the lead owns the movement, side characters get less). Romeo is all sweep,
// Juliet is precise (she counts, she points), the Friar is tired (one hand, small). The quiet scene (H) has none.
// Every function here is a pure function of the frame.
import * as THREE from "three";
import type { Rig, RigState } from "../../group/kit/rig3d";
import type { RigHead } from "../../group/kit/rig3d";
import { capsOf, capWord } from "../captions";
import { line, type Speaker } from "../story";
import { VERBS, speak, saying, accent } from "./common";

type V3 = THREE.Vector3;
const sm = (k: number) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };

// ------------------------------------------------------------------------------------------------------- timing
/** the strokes of a line: the first frame of each of its screens, and of the words given (as capWord takes them) */
export const strokes = (id: string, ...words: string[]): number[] => [...capsOf(id).map((c) => c.from), ...words.map((w) => capWord(id, w).from)].sort((a, b) => a - b);
/** 0..1 between two frames: up over `rise` frames ending on `a`, down over `fall` frames starting on `b` */
export const span = (f: number, a: number, b: number, rise = 7, fall = 10) => Math.min(sm((f - (a - rise)) / rise), 1 - sm((f - b) / fall));
/** how much of a line's gesture is up: there by the line's first word (it starts `rise` frames ahead: a gesture leads
 *  the voice), going down `hold` frames after its last */
export const over = (f: number, id: string, o: { rise?: number; fall?: number; hold?: number; lead?: number } = {}) => {
  const l = line(id);
  return span(f, l.from - (o.lead ?? 0), l.to + (o.hold ?? 2), o.rise ?? 7, o.fall ?? 10);
};
/** the strokes' pulse: 1 on a stroke's frame, there in `lead` frames, gone after `len` (the largest of them) */
export const beat = (f: number, ats: number[], lead = 3, len = 9) => {
  let b = 0;
  for (const at of ats) b = Math.max(b, f <= at ? sm((f - (at - lead)) / lead) : 1 - sm((f - at) / len));
  return b;
};
/** one stroke */
export const hit = (f: number, at: number, lead = 3, len = 9) => beat(f, [at], lead, len);

// --------------------------------------------------------------------------------------------------------- body
export type BodyO = { lean?: number; dip?: number; tip?: number; sway?: number; words?: string[]; rate?: number; rise?: number; fall?: number; hold?: number };
/** A SPEAKER'S BODY over line `id`, for RigState.lean (degrees; pitch + = toward what the figure faces): `lean` held
 *  through the line (3), `dip` more on each stroke (2.2) with a `tip` to one side and then the other (1.5: a body that
 *  faces the lens leans along the lens, which hardly shows; a tip to the side does), and a sway of `sway` each way
 *  (0), `rate` radians a frame (0.11: once in two seconds), which starts from upright with the line */
export const lineBody = (f: number, id: string, o: BodyO = {}): { pitch: number; roll: number } => {
  const l = line(id), k = over(f, id, o), ats = strokes(id, ...(o.words ?? []));
  let tip = 0;
  ats.forEach((at, i) => { tip += (i % 2 ? -1 : 1) * hit(f, at, 3, 11); });
  return { pitch: k * (o.lean ?? 3) + (o.dip ?? 2.2) * beat(f, ats), roll: k * (o.sway ?? 0) * Math.sin((f - l.from) * (o.rate ?? 0.11)) + (o.tip ?? 1.5) * tip };
};
/** A SPEAKER'S HEAD: what the rig's speaking gives for the line `who` is saying on frame f (a tilt held through it, a
 *  nod on its first syllable), a nod on each later stroke of the line (`nod`: how deep, 0.85), and the shot's own
 *  accents added (undefined ones are skipped). `n` = the speaker's number, as talk() takes it. undefined when there
 *  is nothing: give it as RigState.head AFTER ...talk(). */
export const talkHead = (who: Speaker, f: number, n: number, ...own: (RigHead | undefined)[]): RigHead | undefined => {
  const q = saying(who, f);
  if (!q) return VERBS.heads(...own);
  return VERBS.heads(speak(q, f, n).head, ...strokes(q.id).slice(1).map((at) => accent("nod", f, at - 2, { amp: 0.85 })), ...own);
};
/** leans added up (undefined ones are skipped) */
export const leans = (...ls: ({ pitch?: number; roll?: number } | undefined)[]): { pitch: number; roll: number } => {
  const o = { pitch: 0, roll: 0 };
  for (const l of ls) if (l) { o.pitch += l.pitch ?? 0; o.roll += l.roll ?? 0; }
  return o;
};
/** a sway that is not a line's (a listener rocking on his heels, a couple swaying): `amp` degrees each way, on between
 *  two frames */
export const rock = (f: number, a: number, b: number, amp: number, rate: number, rise = 10, fall = 12) => span(f, a, b, rise, fall) * amp * Math.sin((f - a) * rate);

// -------------------------------------------------------------------------------------------------------- hands
type Part = V3 & { partK?: number };
/** A HAND ON ITS WAY: `p` (world) taken `k` of the way from where that hand is when it is free. null at k = 0 (the
 *  hand is free), p itself at k = 1; in between the World blends (round the shoulder: an arm swings, it does not
 *  slide). Give it as a hand of RigState.hands. */
export const reach = (p: V3, k: number): V3 | null => {
  if (k <= 0.002) return null;
  if (k >= 0.998) return p;
  const q = p.clone() as Part; q.partK = k;
  return q;
};
const partK = (h: V3 | null | undefined): number | undefined => (h ? (h as Part).partK : undefined);

type Solved = { torsoM: THREE.Matrix4; dim: { sh: [V3, V3] }; out: { hand: [V3, V3] } };
/** from -> to round the shoulder (all three in the torso's frame): the direction turns, the reach changes evenly */
function swing(sh: V3, from: V3, to: V3, k: number): V3 {
  const a = from.clone().sub(sh), b = to.clone().sub(sh), la = a.length(), lb = b.length();
  if (la < 1e-4 || lb < 1e-4) return from.clone().lerp(to, k);
  a.divideScalar(la); b.divideScalar(lb);
  const ang = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
  if (ang < 1e-3 || ang > Math.PI - 0.1) return from.clone().lerp(to, k);
  const s = Math.sin(ang), dir = a.multiplyScalar(Math.sin((1 - k) * ang) / s).addScaledVector(b, Math.sin(k * ang) / s);
  return sh.clone().addScaledVector(dir, la + (lb - la) * k);
}
/** THE WORLD'S PART (world.ts update): the hands given by reach() with 0 < k < 1 are taken off (the figure is solved
 *  with those hands free), then `pin()` puts each where it is on its way and the figure is solved again; `undo()`
 *  gives the shot's own state back. null when no figure has such a hand this frame (the usual case: one solve). */
export function partHands(rigs: Iterable<Rig>): { pin(): void; undo(): void } | null {
  const jobs: { r: Rig; st: RigState; hands0: RigState["hands"] }[] = [];
  for (const r of rigs) {
    const st = r.state, h = st.hands;
    if (st.visible === false || !h || (partK(h[0]) === undefined && partK(h[1]) === undefined)) continue;
    jobs.push({ r, st, hands0: h });
    st.hands = [partK(h[0]) === undefined ? h[0] : null, partK(h[1]) === undefined ? h[1] : null];
  }
  if (!jobs.length) return null;
  return {
    pin() {
      for (const j of jobs) {
        const S = j.r as unknown as Solved, inv = S.torsoM.clone().invert(), hands: [V3 | null, V3 | null] = [j.st.hands?.[0] ?? null, j.st.hands?.[1] ?? null];
        for (const i of [0, 1] as const) {
          const t = j.hands0?.[i], k = partK(t);
          if (!t || k === undefined) continue;
          hands[i] = swing(S.dim.sh[i], S.out.hand[i].clone().applyMatrix4(inv), t.clone().applyMatrix4(inv), k).applyMatrix4(S.torsoM);
        }
        j.st.hands = hands as RigState["hands"];
      }
    },
    undo() { for (const j of jobs) j.st.hands = j.hands0; },
  };
}
