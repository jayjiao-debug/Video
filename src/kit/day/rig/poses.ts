// THE POSE LIBRARY: named body attitudes a shot asks for by name, built from the rig's pose kinds and its posture
// fields (lean, lookDown, twist, gaze, turn). One place for "thinking", "proud", "shy", so every film and every shot
// means the same thing by them. Each entry is a pure function (t in seconds, options) -> a partial RigState; lay the
// figure's own fields (at, facing, a persona's idle or talk) round it:
//   r.set({ at, facing, ...POSES.think(t), ...NT.idle(f, 2) })
// Poses that need a seat take one (seats.ts seatOn) and those that need a hand target take a point.
import type * as THREE from "three";
import type { RigSeat, RigState } from "../../../videos/group/kit/rig3d";

export type PoseO = { arm?: 0 | 1; k?: number };
type S = Partial<RigState>;
const k1 = (o: PoseO = {}) => Math.max(0, Math.min(1, o.k ?? 1));

export const POSES = {
  /** standing at ease (the rig's idle, breathing) */
  stand: (t: number): S => ({ pose: { kind: "idle", t } }),
  /** listening: weight forward a little, head tipped toward the speaker */
  listen: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lean: { pitch: 4 * k1(o), roll: 2 * k1(o) }, head: { tilt: 4 * k1(o) } }),
  /** thinking: chin down, eyes up and away, a slight turn of the torso */
  think: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lookDown: 8 * k1(o), gaze: 0.5, twist: 0.15 * k1(o), head: { tilt: -5 * k1(o) } }),
  /** proud: chest out, chin up (a lean back) */
  proud: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lean: { pitch: -6 * k1(o) }, lookDown: -6 * k1(o) }),
  /** shy: shoulders in (a lean forward), eyes down and away */
  shy: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lean: { pitch: 6 * k1(o), roll: -3 * k1(o) }, lookDown: 14 * k1(o), gaze: -0.5 }),
  /** tired: a stoop, head hanging */
  tired: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lean: { pitch: 10 * k1(o) }, lookDown: 18 * k1(o), head: { dy: -0.08 * k1(o) } }),
  /** eager: up on the front foot, leaning in */
  eager: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, lean: { pitch: 8 * k1(o) }, head: { dy: 0.04 * k1(o) } }),
  /** sulking: turned half away (back toward the camera side), head down */
  sulk: (t: number, o: PoseO = {}): S => ({ pose: { kind: "idle", t }, twist: -0.35 * k1(o), lookDown: 12 * k1(o), lean: { roll: -3 * k1(o) } }),
  /** explaining: pointing with one arm */
  explain: (t: number, o: PoseO = {}): S => ({ pose: { kind: "point", t, arm: o.arm ?? 0 }, lean: { pitch: 3 * k1(o) } }),
  /** greeting: a wave */
  greet: (t: number, o: PoseO = {}): S => ({ pose: { kind: "wave", t, arm: o.arm ?? 0 } }),
  /** cheering: both arms up */
  cheer: (t: number): S => ({ pose: { kind: "cheer", t } }),
  /** hush: a finger at the lips */
  hush: (t: number, o: PoseO = {}): S => ({ pose: { kind: "shh", t, arm: o.arm ?? 0 }, expr: "hush" }),
  /** on the phone (amount 0 = looking at it .. 1 = at the ear) */
  phone: (t: number, o: PoseO & { ear?: number } = {}): S => ({ pose: { kind: "phone", t, arm: o.arm ?? 1, amount: o.ear ?? 1 } }),
  /** holding something out in front with both hands (the hands' targets: the shot's points) */
  offer: (t: number, hands: [THREE.Vector3 | null, THREE.Vector3 | null]): S => ({ pose: { kind: "hold", t }, hands }),
  /** sitting on a seat (seats.ts seatOn), hands on the lap */
  sit: (t: number, seat: RigSeat): S => ({ pose: { kind: "sit", t }, seat }),
  /** at a desk (a seat with deskEdge / deskTop), hands on the desk */
  desk: (t: number, seat: RigSeat): S => ({ pose: { kind: "desk", t }, seat }),
  /** writing at a desk */
  write: (t: number, seat: RigSeat, o: PoseO = {}): S => ({ pose: { kind: "write", t, arm: o.arm ?? 0 }, seat, lookDown: 20 }),
} as const;
export type PoseName = keyof typeof POSES;
