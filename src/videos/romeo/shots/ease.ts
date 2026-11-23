// MOVES THAT WOULD HAPPEN IN ONE FRAME, EASED (the Fable review of 23 Nov: "the ending animation where she wakes is
// now just teleport"; measured over the whole film, hands did the same in 54 places).
// A shot picks a figure's pose and its hand targets with plain conditions (flung = f >= a03), and the rig is a pure
// function of the frame: when the condition flips, the hand is somewhere else on the next frame, 15 to 75 cm away.
// Two fixes, both applied by the World around the kit's solve (world.ts update), so no shot changes:
//   easeHands   a hand that jumps travels there instead, over 4 to 8 frames, on an arc round its shoulder. The jumps
//               are found by measuring the film (scripts/romeo/ease/run.sh writes ease.data.ts: run it again after any
//               change to a shot). The solve runs once as the shot posed it, then again with the eased hands pinned.
//   easeBodies  a facing that jumps (a turn to the lens, a walker snapping to its path: 30 to 170 degrees) turns there
//               over 4 to 10 frames; and a walk's forward tip (4 degrees in the rig from a walk's first frame to its
//               last) comes and goes with the walker's speed (common.ts walkAlong gives the walk pose its `ease`).
import * as THREE from "three";
import type { Rig, RigPose, RigState } from "../../group/kit/rig3d";
import { HAND_EASE, TURN_EASE } from "./ease.data";

type V3 = THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const smooth = (k: number) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };
/** the measuring tool runs the film once without the easing, to find the jumps (scripts/romeo/ease/motion.ts --raw) */
const raw = () => !!(globalThis as { __ROMEO_RAW?: boolean }).__ROMEO_RAW;
/** the tables go by person: every figure of one character ("friarQuill" is "friar": the name continues with a capital) */
const isOf = (name: string, who: string) => name === who || (name.startsWith(who) && /^[A-Z]/.test(name.slice(who.length)));
/** what the easing reads of a solved rig (private there): the torso's frame, the shoulders in it, the solved hands */
type Solved = { torsoM: THREE.Matrix4; dim: { sh: [V3, V3] }; out: { hand: [V3, V3] } };

/** the walk pose's forward tip in the rig (degrees) */
const WALK_TIP = 4;
/** how far a hand swings out from the body in the middle of a long move (m): a hand that goes from the hip to the
 *  front of the belly goes round the belly, not through it */
const BULGE = 0.05;

/** from -> to round the shoulder: the direction turns, the reach changes evenly, and the path swings out a little */
function arc(sh: V3, from: V3, to: V3, k: number): V3 {
  const a = from.clone().sub(sh), b = to.clone().sub(sh), la = a.length(), lb = b.length();
  let p: V3;
  if (la < 1e-4 || lb < 1e-4) p = from.clone().lerp(to, k);
  else {
    a.divideScalar(la); b.divideScalar(lb);
    const ang = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
    let dir: V3;
    if (ang < 1e-3) dir = a.clone().lerp(b, k).normalize();
    else if (ang > Math.PI - 0.1) {            // straight across the shoulder: by way of straight out to the side
      const m = V(Math.sign(sh.x) || 1, 0, 0.3).normalize();
      dir = k < 0.5 ? a.clone().lerp(m, k * 2).normalize() : m.clone().lerp(b, k * 2 - 1).normalize();
    } else { const s = Math.sin(ang); dir = a.clone().multiplyScalar(Math.sin((1 - k) * ang) / s).addScaledVector(b, Math.sin(k * ang) / s); }
    p = sh.clone().addScaledVector(dir, la + (lb - la) * k);
  }
  const far = from.distanceTo(to), r = Math.hypot(p.x, p.z);
  if (r > 1e-4) { const push = BULGE * Math.min(1, far / 0.3) * Math.sin(Math.PI * k); p.x += (p.x / r) * push; p.z += (p.z / r) * push; }
  return p;
}

/** over something (a row's `over`): up to the level of the higher end plus `over`, then across (or across, then down):
 *  a hand that comes up onto a desk, or off it, does not pass through its top */
function overArc(from: V3, to: V3, k: number, over: number): V3 {
  const hi = Math.max(from.y, to.y) + over, c = to.y > from.y ? V(from.x, hi, from.z) : V(to.x, hi, to.z), u = 1 - k;
  return V().addScaledVector(from, u * u).addScaledVector(c, 2 * u * k).addScaledVector(to, k * k);
}

/** THE HANDS OF THIS FRAME'S EASED MOVES, pinned (state.hands) where they are on their way. Call after a solve; solve
 *  again when it returns an undo, then call the undo (the shot's own state comes back: a shot may solve twice). */
export function easeHands(names: Map<Rig, string>, f: number): (() => void) | null {
  if (raw()) return null;
  const act = HAND_EASE.filter((e) => f >= e.a && f <= e.b);
  if (!act.length) return null;
  const undo: (() => void)[] = [];
  for (const [r, name] of names) {
    const es = act.filter((e) => isOf(name, e.who)), st = r.state;
    if (!es.length || st.visible === false || !r.group.visible) continue;
    const S = r as unknown as Solved, inv = S.torsoM.clone().invert();
    const hands0 = st.hands, pose0 = st.pose, hands: [V3 | null, V3 | null] = [hands0?.[0] ?? null, hands0?.[1] ?? null];
    for (const e of es) {
      const live = S.out.hand[e.i].clone().applyMatrix4(inv);
      const from = f < e.j0 ? live : V(...e.A), to = f >= e.j1 ? live : V(...e.B);
      const k = smooth((f - e.a + 1) / (e.b - e.a + 2));
      hands[e.i] = (e.over !== undefined ? overArc(from, to, k, e.over) : arc(S.dim.sh[e.i], from, to, k)).applyMatrix4(S.torsoM);
    }
    // "point" stretches a pinned pointing arm to its full length toward the target. An eased hand is where it is: the
    // body is solved as "cheer" (the same body as "point": no sway, no lean), with both hands pinned.
    if (pose0.kind === "point" && es.some((e) => e.i === (pose0.arm ?? 1))) {
      st.pose = { ...pose0, kind: "cheer" } as RigPose;
      for (const i of [0, 1] as const) if (!hands[i]) hands[i] = S.out.hand[i].clone();
    }
    st.hands = hands as RigState["hands"];
    undo.push(() => { st.hands = hands0; st.pose = pose0; });
  }
  return undo.length ? () => { for (const u of undo) u(); } : null;
}

/** THE BODIES, before the solve: a walk's forward tip by how much the walker walks (pose.ease: 0 = standing .. 1 =
 *  walking; common.ts walkAlong), and this frame's eased turns (TURN_EASE: a facing that jumps turns there instead,
 *  half of the way before the jump's frame and half after it). Returns the undo. */
export function easeBodies(names: Map<Rig, string>, f: number): () => void {
  const undo: (() => void)[] = [], turns = raw() ? [] : TURN_EASE.filter((e) => f >= e.a && f <= e.b);
  for (const [r, name] of names) {
    const st = r.state;
    if (st.visible === false) continue;
    const k = (st.pose as RigPose & { ease?: number }).ease;
    if (st.pose.kind === "walk" && k !== undefined && k < 1) {
      const lean0 = st.lean;
      st.lean = { ...lean0, pitch: (lean0?.pitch ?? 0) - WALK_TIP * (1 - k) };
      undo.push(() => { st.lean = lean0; });
    }
    for (const e of turns) if (isOf(name, e.who)) {
      const facing0 = st.facing, x = smooth((f - e.a + 1) / (e.b - e.a + 2));
      st.facing = facing0 + (f < e.j ? e.d * x : -e.d * (1 - x));
      undo.push(() => { st.facing = facing0; });
    }
  }
  return () => { for (let i = undo.length - 1; i >= 0; i--) undo[i](); };
}
