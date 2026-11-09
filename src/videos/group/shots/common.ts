// Shared by segA and segD (engine-owned: builders read, never edit). The film LOOPS: segD's last frame must equal
// segA's frame 0, so both use OPEN and teamLoopState() from here.
import type { Figure } from "../kit/cast";
import { lidAt } from "../kit/cast";
import type { Expr } from "../kit/toon";
import { LOOK, type World } from "../world";
import { FPS, TOTAL, type CamPose } from "../story";

/** the four teammates in the back row (row 6) of the classroom, centre block, facing the board (-z); the camera in
 *  front of them looks +z at their faces, the back-wall clock (set.backClock) above their heads.
 *  Seat 77 has a laptop on the desk (the worker types on it); no dressing phones on 76-79 (they hold their own); x: 76 -1.20, 77 -0.56, 78 0.12, 79 0.76 */
export const SEAT = { mate1: 76, worker: 77, you: 78, mate2: 79 } as const;
/** frame 0 == the last frame: the four at eye level (standing height), the clock and notice board above them */
export const OPEN: CamPose = { pos: [-0.22, 1.55, 1.55], look: [-0.22, 0.98, 4.9], fov: 68 };

export type Team = { mate1: Figure; worker: Figure; you: Figure; mate2: Figure };
export const acquireTeam = (w: World): Team => {
  const A = w.classroom.actors;
  return { mate1: A.acquire(LOOK.mate1), worker: A.acquire(LOOK.worker), you: A.acquire(LOOK.you), mate2: A.acquire(LOOK.mate2) };
};
export const releaseTeam = (w: World, T: Team | null) => { if (T) for (const f of Object.values(T)) w.classroom.actors.release(f); };

/** seconds relative to the loop point: 0 at f0 and at f = TOTAL, continuous across the loop (negative near the end) */
export const loopT = (f: number) => (f > TOTAL / 2 ? f - TOTAL : f) / FPS;

/** the scrollers' loop hold: the phone in front of the chest, bottom edge on the desk line, the whole phone shows
 *  (aims solved by segD from the measured shoulders / arm lengths; kit hold pose, arm 1 = canvas right). The body's
 *  total lean is LOOP_LEAN: the kit adds -3 cos(dir) for hold, compensated here exactly as segD does. */
export const LOOP_AIM = { you: { dir: -151.6, reach: 0.52 }, mate1: { dir: -155.7, reach: 0.502 }, mate2: { dir: -146.3, reach: 0.548 } } as const;
export const LOOP_LEAN = 2.6;
const loopHold = (who: keyof typeof LOOP_AIM, t: number) => {
  const a = LOOP_AIM[who];
  return { kind: "hold" as const, t, base: "seat" as const, aim: [null, { dir: a.dir, reach: a.reach }] as [null, { dir: number; reach: number }], props: [null, "phone"] as [null, "phone"], lean: LOOP_LEAN + 3 * Math.cos((a.dir * Math.PI) / 180) };
};
/** the loop state of the four (use it at f0 in segA and on segD's last frames): the worker types at the laptop with a
 *  focused frown, eyes on the screen; the other three hold their phones at chest height and look down at them (you:
 *  smug). All idle cycles run on loopT so the loop is seamless. */
export function teamLoopState(w: World, T: Team, f: number) {
  const t = loopT(f), C = w.classroom, b = (id: number) => lidAt(t + 50, id);
  T.worker.set({ ...C.seatOf(SEAT.worker), pose: { kind: "desk", t }, expr: "stern" as Expr, blink: b(SEAT.worker), lookUp: -0.45, visible: true });
  T.you.set({ ...C.seatOf(SEAT.you), pose: loopHold("you", t), expr: "smug" as Expr, blink: b(SEAT.you), lookUp: -0.85, visible: true });
  T.mate1.set({ ...C.seatOf(SEAT.mate1), pose: loopHold("mate1", t + 0.7), expr: "happy" as Expr, blink: b(SEAT.mate1), lookUp: -0.85, visible: true });
  T.mate2.set({ ...C.seatOf(SEAT.mate2), pose: loopHold("mate2", t + 1.3), expr: "deadpan" as Expr, blink: b(SEAT.mate2), lookUp: -0.85, visible: true });
}
