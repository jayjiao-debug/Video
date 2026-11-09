// segment B: the lab crew solver. A copy of labcommon.crewPose (labcommon.ts stays untouched), extended for segB:
//  - "walk": a walker enters from an off-frame point on the camera side and walks to the centre of their square
//    (planted feet: the cycle phase comes from the distance walked, foreshortened by the card's angle to the path);
//  - "turn": the front idle drawing at the square for a frame or two (the walk faces -z, the haul faces the gauge: in
//    profile the drawing flips, the front frame sells the turn);
//  - "pick": the newcomer bends down (kit reach pose) to the spare rope where it lies, grips it (from that frame the rope
//    runs through the hand, so it never pops from the floor to the hands) and lifts it to rope height, the slack between
//    them running out as it rises;
//  - the rope's free end lies at ONE fixed floor point the whole time (square 6 + 0.85 m, 0.12 m to the window side: the
//    H2 tail end of crewPose), so the spare rope lies along the empty squares and each newcomer picks it up there
//    (crewPose moves its tail end to the square after the last holder, which would jump with every newcomer);
//  - the researcher takes a full FigState (look / lookUp / faceTurn / any pose).
// With all six holding (pull / stand) and the researcher as H2_RESEARCHER it draws the same ropes as crewPose (the
// segment calls crewPose itself on its last frame, so the hand-off is exact).
import * as THREE from "three";
import type { FigState, FxKind } from "../kit/cast";
import { lidAt } from "../kit/cast";
import { Rope, lieSlack, TAUT } from "../kit/rope";
import type { Expr } from "../kit/toon";
import { SU, WALK_CYCLE_M } from "../kit/toon";
import { LOOK, type World } from "../world";
import { FPS } from "../story";
import type { Crew } from "./labcommon";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export type Fx = { kind: FxKind; t: number };

export type BPuller =
  | { mode: "off" }
  /** k: 0..1 fraction of the path from -> to (already eased by the caller) */
  | { mode: "walk"; from: THREE.Vector3; to: THREE.Vector3; k: number; expr?: Expr; fx?: Fx[]; blink?: number }
  | { mode: "turn"; expr?: Expr; blink?: number }
  /** down: 0..1 the reach toward the rope (grips at 1); lift: 0..1 the gripped rope rising to rope height */
  | { mode: "pick"; down: number; lift: number; expr?: Expr; fx?: Fx[]; blink?: number }
  | { mode: "pull" | "stand"; amount: number; phase: number; expr?: Expr; fx?: Fx[]; blink?: number };

/** the fixed floor point where the rope's free end lies (crewPose's tail end with all six on the rope) */
export const ropeEnd = (w: World) => V(w.lab.A.positions[5].x + 0.85, 0, w.lab.A.ropeZ - 0.12);
/** hide a rope: crewPose parks it at y = -40, but Rope.update clamps every point to the floor, so that leaves a 2 cm
 *  stub with its end caps lying at the world origin (between squares 3 and 4, in shot); hide the mesh as well */
export const hideRope = (rp: Rope) => { rp.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) }); rp.mesh.visible = false; };
/** where the lifted rope is carried to before the haul grip takes over: forward of the root and rope height (m) */
const LIFT_TO = { fwd: 0.2, up: 0.86 };
const tmp = V(), tmpN = V();

export type CrewBInfo = { pickPoint: THREE.Vector3 | null; pickGap: number; holders: number[]; picker: number };

/** pose the crew and the ropes for this frame (after w.setCamera). pick = an extra rope acquired by the segment. */
export function crewB(w: World, c: Crew, pick: Rope, f: number, s: { pullers: BPuller[]; researcher: FigState }): CrewBInfo {
  const L = w.lab, A = L.A, t = f / FPS, E = ropeEnd(w);
  const holders: number[] = [];
  let picker = -1;
  s.pullers.forEach((p, i) => { if (p.mode === "pull" || p.mode === "stand") holders.push(i); if (p.mode === "pick") picker = i; });
  const camP = tmp.setFromMatrixPosition(w.camera.matrixWorld).clone();
  const setAll = (target: [number, number]) => {
    s.pullers.forEach((p, i) => {
      const fig = c.pullers[i], sq = A.positions[i];
      fig.look = LOOK.puller(i);
      const blink = (p as { blink?: number }).blink ?? lidAt(t + 30, 100 + i);
      if (p.mode === "off") { fig.set({ at: sq, visible: false, pose: { kind: "idle", t } }); return; }
      if (p.mode === "walk") {
        const at = p.from.clone().lerp(p.to, p.k), dir = p.to.clone().sub(p.from), len = dir.length();
        dir.normalize();
        // planted feet: the card shows the stride along its own axis (perpendicular to the view), so the drawn foot
        // keeps still on the floor when the phase advances by (distance along the card axis) / cycle length
        const toCam = Math.atan2(camP.x - at.x, camP.z - at.z), axis = tmpN.set(Math.cos(toCam), 0, -Math.sin(toCam));
        const cosA = Math.max(0.35, Math.abs(axis.dot(dir)));
        const phase = (((len * p.k * cosA) / WALK_CYCLE_M) % 1 + 1) % 1;
        fig.set({ at, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase }, expr: p.expr ?? "neutral", blink, fx: p.fx, visible: true });
        return;
      }
      if (p.mode === "turn") {
        const toCam = Math.atan2(camP.x - sq.x, camP.z - sq.z);
        fig.set({ at: sq, facing: toCam, view: "front", pose: { kind: "idle", t }, expr: p.expr ?? "neutral", blink, visible: true });
        return;
      }
      if (p.mode === "pick") {
        fig.set({ at: sq, facing: A.facing, view: "side", pose: { kind: "reach", t, target: target, amount: Math.max(0.001, p.down) }, expr: p.expr ?? "neutral", blink, fx: p.fx, visible: true });
        return;
      }
      fig.set({
        at: sq, facing: A.facing, view: "side",
        pose: { kind: "haul", t: t + i * 0.37, phase: p.phase, amount: p.amount, grip: true },
        aimAt: [null, V(sq.x - 1.2, A.ropeY, A.ropeZ)],
        expr: p.expr ?? (p.mode === "pull" ? "huff" : "neutral"), blink, fx: p.fx, visible: true,
      });
    });
    c.res.set(s.researcher);
  };
  // pass 1 (the picker's reach target is refined in pass 2, once the previous holder's hand is known)
  setAll([60, 30]);
  L.update(t);
  const tie = { kind: "knot" as const, axis: A.hookTie.axis, postR: A.hookTie.postR };
  const hide = (rp: Rope) => hideRope(rp);
  const info: CrewBInfo = { pickPoint: null, pickGap: 0, holders, picker };
  let pickLen = 0;
  if (picker >= 0 && holders.length) {
    const p = s.pullers[picker] as Extract<BPuller, { mode: "pick" }>, fig = c.pullers[picker], root = A.positions[picker];
    // the rope as it lies before the grip: last holder's rear hand -> the floor end
    const last0 = c.pullers[holders[holders.length - 1]].handWorld(0);
    c.tail.update({ a: last0, b: E, slack: lieSlack(last0, E, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
    // the grip point: where that rope crosses the picker's card plane (low, near the square)
    const m = fig.mesh, n = V(Math.sin(m.rotation.y), 0, Math.cos(m.rotation.y));
    let best = -1, bestD = Infinity;
    c.tail.points.forEach((q, k) => {
      if (q.y > 0.6 || Math.hypot(q.x - root.x, q.z - root.z) > 0.7) return;
      const d = Math.abs(tmpN.copy(q).sub(root).dot(n));
      if (d < bestD) { bestD = d; best = k; }
    });
    if (best >= 0) {
      const P = c.tail.points[best].clone(), loc = m.worldToLocal(P.clone());
      info.pickPoint = P; info.pickGap = bestD;
      const tgDown: [number, number] = [loc.x / SU, Math.max(8, loc.y / SU)];
      const tgUp: [number, number] = [LIFT_TO.fwd / SU, LIFT_TO.up / SU];
      const e = p.lift * p.lift * (3 - 2 * p.lift);
      setAll([tgDown[0] + (tgUp[0] - tgDown[0]) * e, tgDown[1] + (tgUp[1] - tgDown[1]) * e]);
      L.update(t);
      pickLen = c.tail.s[best] ?? 0;
    }
  }
  // ropes: hook -> every holder's hands (lead then rear), taut
  const hands = holders.map((i) => [c.pullers[i].handWorld(1), c.pullers[i].handWorld(0)]);
  hide(c.behind);
  if (!hands.length) {
    c.rope.update({ a: A.hook, b: E, slack: lieSlack(A.hook, E, 0, 0.016), attachA: tie, attachB: { kind: "end" } });
    hide(c.tail); hide(pick); return info;
  }
  const via: THREE.Vector3[] = []; for (const hd of hands) via.push(hd[0], hd[1]);
  let last = via[via.length - 1];
  c.rope.update({ a: A.hook, b: last, via: via.slice(0, -1), attachA: tie, attachB: { kind: "hand", tail: 0 } });
  const pp = picker >= 0 ? (s.pullers[picker] as Extract<BPuller, { mode: "pick" }>) : null;
  if (pp && pp.down >= 1 && info.pickPoint) {
    // gripped: last holder's rear hand -> the picker's hand (its slack runs out as the rope rises) -> the floor end
    const ph = c.pullers[picker].handWorld(1), chord = last.distanceTo(ph) * (1 + TAUT), e = pp.lift * pp.lift * (3 - 2 * pp.lift);
    pick.update({ a: last, b: ph, length: Math.max(chord, pickLen + (chord - pickLen) * e), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "hand", tail: 0 } });
    last = ph;
  } else hide(pick);
  c.tail.update({ a: last, b: E, slack: lieSlack(last, E, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
  return info;
}
