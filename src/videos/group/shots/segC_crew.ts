// segment C: the lab crew solver. A copy of labcommon.crewPose (labcommon.ts stays untouched), with the pick-up logic
// of segB_crew.ts copied in (not imported: that file is segB's), extended for the blindfold experiment:
//  - "pretend": on the rope behind square 1 but NOT pulling. The rope from the last real holder's rear hand through the
//    pretenders' hands is a separate piece with `slack` x its chord length of extra rope (so every gap sags the same,
//    however many pretenders there are); slack 0 = the kit's taut default (continuous with a real holder);
//  - "walk": a walker moves between two floor points (planted feet: phase from the distance along the card axis);
//  - "turn": one or two frames of the idle drawing at the square between the walk (faces -z / +z) and the haul (faces
//    the gauge), so the side drawing does not flip in one frame;
//  - "pick": the newcomer bends down (kit reach pose) to the spare rope where it lies on the floor, grips it (from that
//    frame the rope runs through the hand, so it never pops from the floor into the hands) and lifts it; as a pretender
//    the rope keeps `slack` (it never comes taut);
//  - the rope's free end lies at ONE fixed floor point the whole time (square 6 + 0.85 m, 0.12 m to the window side:
//    crewPose's tail end with all six on the rope, so H2 is drawn identically), so the spare rope lies along the empty
//    squares when people leave and each newcomer picks it up there;
//  - the researcher takes a full FigState; the main rope takes a gold glow (always set, so a frame is a pure function);
//  - the pullers take the extra face / head fields (look, lookUp, faceTurn, headTilt, lean) the acting needs.
import * as THREE from "three";
import type { FigState, FxKind, Figure } from "../kit/cast";
import { lidAt } from "../kit/cast";
import { Rope, lieSlack, TAUT } from "../kit/rope";
import type { Expr } from "../kit/toon";
import { SU, WALK_CYCLE_M } from "../kit/toon";
import { LOOK, type World } from "../world";
import { FPS } from "../story";
import type { Crew } from "./labcommon";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export type Fx = { kind: FxKind; t: number };
type Face = { expr?: Expr; fx?: Fx[]; blink?: number; look?: number; lookUp?: number; faceTurn?: -1 | 0 | 1 };

export type CPuller =
  | { mode: "off" }
  /** k: 0..1 fraction of the path from -> to (already eased by the caller) */
  | ({ mode: "walk"; from: THREE.Vector3; to: THREE.Vector3; k: number } & Face)
  /** the idle drawing at the square, facing `facing` (default: toward the camera) */
  | ({ mode: "turn"; facing?: number } & Face)
  /** down: 0..1 the reach toward the rope (grips at 1); lift: 0..1 the gripped rope rising to rope height */
  | ({ mode: "pick"; down: number; lift: number } & Face)
  | ({ mode: "pull" | "stand" | "pretend"; amount: number; phase: number; blind?: boolean; view?: "front" | "side"; headTilt?: number; lean?: number } & Face);

/** the fixed floor point where the rope's free end lies (crewPose's tail end with all six on the rope) */
export const ropeEnd = (w: World) => V(w.lab.A.positions[5].x + 0.85, 0, w.lab.A.ropeZ - 0.12);
/** where the lifted rope is carried to before the haul grip takes over: forward of the root and rope height (m) */
const LIFT_TO = { fwd: 0.2, up: 0.86 };
const tmp = V(), tmpN = V();

export type CrewCInfo = { holders: number[]; pretenders: number[]; picker: number; pickPoint: THREE.Vector3 | null; pickGap: number };
export type CrewCState = {
  pullers: CPuller[];
  researcher: FigState;
  /** extra rope per metre of chord in the pretenders' piece (0.6-0.8 hangs visibly) */
  slack?: number;
  /** gold glow 0..1 on the main (taut) rope */
  glow?: number;
};

const GOLD = 0.55;
const hide = (rp: Rope) => rp.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) });

/** pose the crew and the ropes for this frame (call after w.setCamera). pick = an extra rope the segment acquired. */
export function crewC(w: World, c: Crew, pick: Rope, f: number, s: CrewCState): CrewCInfo {
  const L = w.lab, A = L.A, t = f / FPS, E = ropeEnd(w), slackK = s.slack ?? 0.7;
  const holders: number[] = [], pretenders: number[] = [], pickers: number[] = [];
  s.pullers.forEach((p, i) => {
    if (p.mode === "pull" || p.mode === "stand") holders.push(i);
    if (p.mode === "pretend") pretenders.push(i);
    if (p.mode === "pick") pickers.push(i);
  });
  const camP = tmp.setFromMatrixPosition(w.camera.matrixWorld).clone();
  const targets = new Map<number, [number, number]>();
  const setAll = () => {
    s.pullers.forEach((p, i) => {
      const fig = c.pullers[i], sq = A.positions[i];
      fig.look = i === 0 && "blind" in p && p.blind ? LOOK.puller0Blind : LOOK.puller(i);
      if (p.mode === "off") { fig.set({ at: sq, visible: false, pose: { kind: "idle", t } }); return; }
      const blink = p.blink ?? lidAt(t + 30, 100 + i);
      const face = { expr: p.expr ?? "neutral", blink, fx: p.fx, look: p.look, lookUp: p.lookUp, faceTurn: p.faceTurn };
      if (p.mode === "walk") {
        const at = p.from.clone().lerp(p.to, p.k), dir = p.to.clone().sub(p.from), len = dir.length();
        dir.normalize();
        // planted feet: the card shows the stride along its own axis (perpendicular to the view), so the drawn foot
        // keeps still on the floor when the phase advances by (distance along the card axis) / cycle length
        const toCam = Math.atan2(camP.x - at.x, camP.z - at.z), axis = tmpN.set(Math.cos(toCam), 0, -Math.sin(toCam));
        const cosA = Math.max(0.35, Math.abs(axis.dot(dir)));
        const phase = (((len * p.k * cosA) / WALK_CYCLE_M) % 1 + 1) % 1;
        fig.set({ at, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase }, ...face, visible: true });
        return;
      }
      if (p.mode === "turn") {
        const toCam = Math.atan2(camP.x - sq.x, camP.z - sq.z);
        fig.set({ at: sq, facing: p.facing ?? toCam, pose: { kind: "idle", t }, ...face, visible: true });
        return;
      }
      if (p.mode === "pick") {
        fig.set({ at: sq, facing: A.facing, view: "side", pose: { kind: "reach", t, target: targets.get(i) ?? [60, 30], amount: Math.max(0.001, p.down) }, ...face, visible: true });
        return;
      }
      fig.set({
        at: sq, facing: A.facing, view: p.view ?? "side",
        pose: { kind: "haul", t: t + i * 0.37, phase: p.phase, amount: p.amount, grip: true, headTilt: p.headTilt, lean: p.lean },
        aimAt: [null, V(sq.x - 1.2, A.ropeY, A.ropeZ)],
        ...face, expr: p.expr ?? (p.mode === "pull" ? "huff" : p.mode === "pretend" ? "smug" : "neutral"), visible: true,
      });
    });
    c.res.set(s.researcher);
  };
  const tie = { kind: "knot" as const, axis: A.hookTie.axis, postR: A.hookTie.postR };
  const info: CrewCInfo = { holders, pretenders, picker: pickers.length ? pickers[0] : -1, pickPoint: null, pickGap: 0 };
  const handsOf = (i: number) => [c.pullers[i].handWorld(1), c.pullers[i].handWorld(0)];
  /** main + behind; returns the last attached point */
  const drawFront = (): THREE.Vector3 => {
    let last: THREE.Vector3;
    if (holders.length) {
      const via: THREE.Vector3[] = []; for (const i of holders) via.push(...handsOf(i));
      last = via[via.length - 1];
      c.rope.update({ a: A.hook, b: last, via: via.slice(0, -1), attachA: tie, attachB: { kind: "hand", tail: 0 }, gold: GOLD, glow: s.glow ?? 0 });
    } else { last = A.hook; hide(c.rope); c.rope.setGold(GOLD, 0); }
    if (pretenders.length) {
      const via: THREE.Vector3[] = []; for (const i of pretenders) via.push(...handsOf(i));
      const end = via[via.length - 1];
      let chord = 0, prev = last; for (const q of via) { chord += prev.distanceTo(q); prev = q; }
      c.behind.update({ a: last, b: end, via: via.slice(0, -1), length: chord * (1 + TAUT + slackK), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "hand", tail: 0 } });
      last = end;
    } else hide(c.behind);
    return last;
  };
  // the gripped picker (at most one: the segment staggers the lifts) and the length of rope it picked up
  let gripped = -1, pickLen = 0;
  // passes: one, plus one per picker (each picker's reach target needs the rope as it lies in front of it, which
  // depends on the pickers ahead of it), then the final solve
  for (let pass = 0; ; pass++) {
    setAll();
    L.update(t);
    if (pass >= pickers.length) break;
    let lastP = drawFront();
    gripped = -1;
    for (const k of pickers) {
      const p = s.pullers[k] as Extract<CPuller, { mode: "pick" }>, fig = c.pullers[k], root = A.positions[k];
      // the rope as it lies before this picker grips it: the last attached point -> the floor end
      c.tail.update({ a: lastP, b: E, slack: lieSlack(lastP, E, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
      // the grip point: where that rope crosses the picker's card plane (low, near the square)
      const m = fig.mesh, n = V(Math.sin(m.rotation.y), 0, Math.cos(m.rotation.y));
      let best = -1, bestD = Infinity;
      c.tail.points.forEach((q, j) => {
        if (q.y > 0.6 || Math.hypot(q.x - root.x, q.z - root.z) > 0.7) return;
        const d = Math.abs(tmpN.copy(q).sub(root).dot(n));
        if (d < bestD) { bestD = d; best = j; }
      });
      if (best < 0) continue;
      const P = c.tail.points[best].clone(), loc = m.worldToLocal(P.clone());
      const tgDown: [number, number] = [loc.x / SU, Math.max(8, loc.y / SU)];
      const tgUp: [number, number] = [LIFT_TO.fwd / SU, LIFT_TO.up / SU];
      const e = p.lift * p.lift * (3 - 2 * p.lift);
      targets.set(k, [tgDown[0] + (tgUp[0] - tgDown[0]) * e, tgDown[1] + (tgUp[1] - tgDown[1]) * e]);
      if (p.down >= 1 && gripped < 0) {
        gripped = k; pickLen = c.tail.s[best] ?? 0; info.pickPoint = P; info.pickGap = bestD; info.picker = k;
        lastP = fig.handWorld(1);
      }
    }
  }
  let last = drawFront();
  if (gripped >= 0) {
    // gripped: last attached point -> the picker's hand (a pretender's rope keeps its slack) -> the floor end
    const pp = s.pullers[gripped] as Extract<CPuller, { mode: "pick" }>;
    const ph = c.pullers[gripped].handWorld(1), chord = last.distanceTo(ph), e = pp.lift * pp.lift * (3 - 2 * pp.lift);
    const endLen = chord * (1 + TAUT + slackK);
    pick.update({ a: last, b: ph, length: Math.max(chord * (1 + TAUT), pickLen + (endLen - pickLen) * e), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "hand", tail: 0 } });
    last = ph;
  } else hide(pick);
  c.tail.update({ a: last, b: E, slack: lieSlack(last, E, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
  return info;
}

/** the floor y of a figure's lower ankle (standing figures: ~0 = on the floor) */
export const footY = (fig: Figure) => Math.min(fig.ankleWorld(0).y, fig.ankleWorld(1).y);
