// Shared by segB and segC (engine-owned: builders read, never edit). The lab crew: six pullers, the researcher, the
// rope (hook -> active pullers' hands, a slack piece behind square 1 when the others only pretend, a tail to the
// floor), solved per frame from a plain description of who is where. Recipe from preview/lab_common.ts (checked: rope
// taut and level hook -> square 1, no collider hits, cards clear).
//
//   enter:  crew = acquireCrew(w)            exit: releaseCrew(w, crew)
//   pose:   w.setCamera(cam); crewPose(w, crew, f, { pullers: [...6 PullerState], researcher: {...} }); then overlays
//   H2 (segB's last frame f770 == segC's first frame f771): see H2_CAM / h2Pullers / H2_RESEARCHER below.
import * as THREE from "three";
import type { Figure, FxKind } from "../kit/cast";
import { lidAt, walkPhase } from "../kit/cast";
import { Rope, lieSlack } from "../kit/rope";
import type { Expr, PoseReq } from "../kit/toon";
import { LOOK, type World } from "../world";
import { FPS, clamp01, smooth, type CamPose } from "../story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export type Crew = { pullers: Figure[]; res: Figure; rope: Rope; behind: Rope; tail: Rope };
export const acquireCrew = (w: World): Crew => {
  const L = w.lab;
  const pullers = [0, 1, 2, 3, 4, 5].map((i) => L.actors.acquire(LOOK.puller(i)));
  const res = L.actors.acquire(LOOK.res);
  const o = { radius: 0.016, gold: 0.55 };
  return { pullers, res, rope: L.ropes.acquire({ ...o, seed: 3 }), behind: L.ropes.acquire({ ...o, seed: 4 }), tail: L.ropes.acquire({ ...o, seed: 5 }) };
};
export const releaseCrew = (w: World, c: Crew | null) => {
  if (!c) return;
  for (const f of [...c.pullers, c.res]) w.lab.actors.release(f);
  for (const r of [c.rope, c.behind, c.tail]) w.lab.ropes.release(r);
};

/** one puller's state for this frame */
export type PullerState = {
  /** "off": not in the scene; "walkIn": walking from the camera side to the square (u 0..1); "walkOut": leaving
   *  toward the camera side (u 0..1); "pull": on the rope at the square (really pulling); "pretend": on the rope behind
   *  square 1 but NOT pulling (the rope from square 1's rear hand back to them hangs slack); "stand": at the square
   *  holding the rope, relaxed */
  mode: "off" | "walkIn" | "walkOut" | "pull" | "pretend" | "stand";
  u?: number;
  /** haul effort 0..1 (pull / pretend lean; stand = low) and the haul cycle phase (stagger these for out-of-step) */
  amount?: number; phase?: number;
  expr?: Expr; fx?: { kind: FxKind; t: number }[];
  /** square 1 only: wears the blindfold */
  blind?: boolean;
  /** force a drawing; default "side" (the haul drawing reads as pulling from cams main / side); pos1 close-ups: "front" */
  view?: "front" | "side";
};
export type ResearcherState = {
  at: THREE.Vector3; facing?: number; pose?: PoseReq; expr?: Expr; fx?: { kind: FxKind; t: number }[]; visible?: boolean;
  /** walking: distance travelled so far (m) drives the feet */
  walkDist?: number;
};
/** where walking pullers come from / go to: 1.6 m toward the camera side (+z) of their square */
export const waitSpot = (w: World, i: number) => w.lab.A.positions[i].clone().setZ(w.lab.A.ropeZ + 1.9);

/** pose the whole crew and the ropes for this frame. Call AFTER w.setCamera (cards and hands depend on the camera). */
export function crewPose(w: World, c: Crew, f: number, s: { pullers: PullerState[]; researcher: ResearcherState; slackBehind?: number }) {
  const L = w.lab, A = L.A, t = f / FPS;
  const onRope: number[] = [];
  s.pullers.forEach((p, i) => {
    const fig = c.pullers[i], sq = A.positions[i];
    fig.look = i === 0 && p.blind ? LOOK.puller0Blind : LOOK.puller(i);
    if (p.mode === "off") { fig.set({ at: sq, visible: false, pose: { kind: "idle", t } }); return; }
    const blink = lidAt(t + 30, 100 + i), view = p.view ?? "side";
    if (p.mode === "walkIn" || p.mode === "walkOut") {
      const u = smooth(clamp01(p.u ?? 0)), from = p.mode === "walkIn" ? waitSpot(w, i) : sq, to = p.mode === "walkIn" ? sq : waitSpot(w, i);
      const at = from.clone().lerp(to, u), dist = from.distanceTo(to) * u, dir = to.clone().sub(from);
      fig.set({ at, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase: walkPhase(dist) }, expr: p.expr ?? "neutral", blink, fx: p.fx, visible: true, view: undefined });
      return;
    }
    onRope.push(i);
    const amount = p.amount ?? (p.mode === "pull" ? 0.85 : p.mode === "pretend" ? 0.5 : 0.15);
    fig.set({
      at: sq, facing: A.facing, view,
      pose: { kind: "haul", t: t + i * 0.37, phase: p.phase ?? (0.15 + i * 0.23) % 1, amount, grip: true },
      aimAt: [null, V(sq.x - 1.2, A.ropeY, A.ropeZ)],
      expr: p.expr ?? (p.mode === "pull" ? "huff" : p.mode === "pretend" ? "smug" : "neutral"), blink, fx: p.fx, visible: true,
    });
  });
  const r = s.researcher;
  if (r.visible === false) c.res.set({ at: r.at, visible: false, pose: { kind: "idle", t } });
  else c.res.set({
    at: r.at, facing: r.facing ?? Math.atan2(A.positions[0].x - r.at.x, A.positions[0].z - r.at.z),
    pose: r.walkDist !== undefined ? { kind: "walk", phase: walkPhase(r.walkDist) } : (r.pose ?? { kind: "idle", t, props: [null, "clipboard"] }),
    expr: r.expr ?? "neutral", blink: lidAt(t + 30, 109), fx: r.fx, visible: true,
  });
  L.update(t);
  // ropes: hook -> every rope holder's hands (lead then rear). Pretenders hold a separate slack piece from square 1's
  // rear hand. Tail from the last holder's rear hand to the floor.
  const tie = { kind: "knot" as const, axis: A.hookTie.axis, postR: A.hookTie.postR };
  const hands = onRope.map((i) => [c.pullers[i].handWorld(1), c.pullers[i].handWorld(0)]);
  const pretenders = onRope.filter((i) => s.pullers[i].mode === "pretend");
  const hide = (rp: Rope) => rp.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) });
  if (!hands.length) {
    // nobody on the rope: it lies on the floor along the line from the hook
    const end = V(A.positions[2].x, 0, A.ropeZ);
    c.rope.update({ a: A.hook, b: end, slack: lieSlack(A.hook, end, 0, 0.016), attachA: tie, attachB: { kind: "end" } });
    hide(c.behind); hide(c.tail); return;
  }
  const realIdx = onRope.filter((i) => s.pullers[i].mode !== "pretend");
  const realHands = realIdx.map((i) => [c.pullers[i].handWorld(1), c.pullers[i].handWorld(0)]);
  let last: THREE.Vector3;
  if (realHands.length) {
    const via: THREE.Vector3[] = []; for (const h of realHands) via.push(h[0], h[1]);
    last = via[via.length - 1];
    c.rope.update({ a: A.hook, b: last, via: via.slice(0, -1), attachA: tie, attachB: { kind: "hand", tail: 0 } });
  } else { last = A.hook; hide(c.rope); }
  if (pretenders.length) {
    const ph = pretenders.map((i) => [c.pullers[i].handWorld(1), c.pullers[i].handWorld(0)]);
    const via: THREE.Vector3[] = []; for (const h of ph) via.push(h[0], h[1]);
    const end = via[via.length - 1];
    c.behind.update({ a: last, b: end, via: via.slice(0, -1), slack: s.slackBehind ?? 0.6, attachA: { kind: "hand", tail: 0 }, attachB: { kind: "hand", tail: 0 } });
    last = end;
  } else hide(c.behind);
  const lastSq = A.positions[onRope[onRope.length - 1]];
  const floorEnd = V(lastSq.x + 0.85, 0, A.ropeZ - 0.12);
  c.tail.update({ a: last, b: floorEnd, slack: lieSlack(last, floorEnd, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
}

// ---------------------------------------------------------------------------------------------------- hand-off H2
/** segB's last frame (f770) == segC's first frame (f771): the establishing side camera, all six standing on the rope,
 *  relaxed after the out-of-step heave, the researcher at her spot with the clipboard, dial at 20, no overlays */
export const H2_CAM = (w: World): CamPose => w.lab.set.cams.side;
export const h2Pullers = (): PullerState[] => [0, 1, 2, 3, 4, 5].map((i) => ({ mode: "stand", amount: 0.15, phase: (0.15 + i * 0.23) % 1, expr: "neutral" }));
export const H2_RESEARCHER = (w: World): ResearcherState => ({ at: w.lab.A.researcher.clone(), pose: { kind: "idle", t: 0, props: [null, "clipboard"] }, expr: "neutral" });
export const H2_DIAL = 20;
