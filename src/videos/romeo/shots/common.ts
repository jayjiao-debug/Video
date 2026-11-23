// THE VERBS of this film's shots: the kit's action library (src/kit/day/verbs.ts) with this film's quotes.
import { makeVerbs } from "../../../kit/day/verbs";
import { FPS, QUOTES } from "../story";
import { EYE, FOV } from "../cam";

export const VERBS = makeVerbs({ fps: FPS, EYE, FOV, quotes: QUOTES });
export const { V, v3, yawTo, speak, accent, ky, standing, saying, seated, eye } = VERBS;

/** how long a walker takes to reach its speed, and to stop (s) */
const WALK_EASE = 0.2;
type WalkO = NonNullable<Parameters<typeof VERBS.walkAlong>[3]> & { easeIn?: number; easeOut?: number };
/** THE KIT'S WALKER WITH A START AND A STOP. The kit's walks at full speed and in full stride from its first frame to
 *  its last: at both ends the feet jump 20 cm apart, the body tips 4 degrees and the head moves 8 to 10 cm in one
 *  frame (measured over the whole film, 23 Nov). This one speeds up over the first WALK_EASE seconds and slows over the
 *  last, and ARRIVES ON THE SAME FRAME as the kit's (the shots time their beats by path length / speed). Its stride
 *  and bounce grow and shrink with its speed, its last steps bring both feet to the ground, and pose.ease (0 = standing
 *  .. 1 = walking) tells the World how much of the walk's forward tip to give (ease.ts walkTip).
 *    easeIn / easeOut   seconds (default WALK_EASE); 0 for a walker who comes in already walking, or walks out of sight */
export const walkAlong = (pts: Parameters<typeof VERBS.walkAlong>[0], speed: number, t: number, o: WalkO = {}) => {
  const T = VERBS.walkTime(pts, speed);
  if (!(t > 0 && t < T)) return VERBS.walkAlong(pts, speed, t, o);
  const ta = Math.min(o.easeIn ?? WALK_EASE, T / 2.5), te = Math.min(o.easeOut ?? WALK_EASE, T / 2.5);
  const vm = 1 / (T - ta / 2 - te / 2);                      // the speed in the middle, in paths per second
  const u = t < ta ? (vm * t * t) / (2 * ta) : t > T - te ? 1 - (vm * (T - t) * (T - t)) / (2 * te) : vm * (t - ta / 2);
  const k = Math.min(ta > 0 ? t / ta : 1, te > 0 ? (T - t) / te : 1, 1);
  const leg = VERBS.walkAlong(pts, speed, Math.min(u * T, T - 1e-6), o);
  if (!leg.moving || k >= 1) return leg;
  let phase = leg.pose.phase ?? 0;
  if (te > 0 && t > T - te) {
    // the last steps: the cycle slides to the nearest point where both feet are down (0.05 or 0.55), so no foot is
    // in the air when the walker stands
    const end = VERBS.walkAlong(pts, speed, T - 1e-6, o).pose.phase ?? 0;
    const want = [0.05, 0.55, 1.05].reduce((a, b) => (Math.abs(b - end) < Math.abs(a - end) ? b : a));
    phase = (((phase + (want - end) * (1 - k) * (1 - k)) % 1) + 1) % 1;
  }
  return { ...leg, pose: { ...leg.pose, phase, stride: (leg.pose.stride ?? 0.2) * k, amount: (leg.pose.amount ?? 1) * k, ease: k } as typeof leg.pose };
};
