// Nothing through anything in the seated and phone poses, on a spread of builds, seats, camera angles, head accents
// (RigState.head: the pops, squashes and tilts of talking) and things worn on the head. No picture: it only solves
// the poses and prints one "QA: pose ..." line per case (scripts/rig3d/acc_check.py reads them, step 6).
//   gap   = the smallest of Rig.qa.clear, .seat and .head over the case (m; < 0 = an arm, a hand, a leg or a held
//           thing passes through the body, the head's real shape, the seat, the desk or the chair's back)
//   reach = the largest distance a hand could not reach its place, with the head at rest
//   give  = the same while the head pops or tilts: a hand beside the head gives way to it for those frames (a waving
//           hand by a centimetre or two), which is as it should be, so this is only printed
//   bad   = the number of builds x heads x camera angles where a gap is short by more than TOL (TOL_ACCENT while
//           the head pops) or a resting head's hand is off by more than TOL
import * as THREE from "three";
import { RigCast, type Acc, type RigPoseKind, type RigSeat, type RigHead } from "../kit/rig3d";
import { LAB_CAST_LIGHT } from "../sets/lab";
import { accessories } from "../kit/rigacc/catalog";
import { phone, pen, finger } from "../kit/rigacc/index";
import { lookOf, type LookKey } from "./rig3d_common";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const LOOKS: LookKey[] = ["you", "researcher", "worker", "mate", "friend0", "friend1", "friend2", "friend3", "friend4", "friend5", "class7", "class23", "class61"];
const YAWS = [0, 30, 60, 90, 180, 270, 300, 330];
/** the head layer: at rest; a stressed word at its largest (7 % larger, squashed a tenth, tilted, up), to either
 *  side; a reaction the other way (smaller, taller, shifted) */
const HEADS: (RigHead | undefined)[] = [undefined, { scale: 1.07, squash: 0.1, tilt: 8, dy: 0.15 }, { scale: 1.07, squash: 0.1, tilt: -8, dy: 0.15 }, { scale: 0.95, squash: -0.05, tilt: -10, dx: 0.12 }];
/** what the phone has to stay outside of at the ear (and a hand at the lips, of a brim over the face) */
const WORN: string[][] = [[], ["headphones"], ["cowboyHat"], ["hardHat"]];
/** the seats: the preview's chair, the same at a desk, a classroom seat with its desk further off, none */
const SEATS: Record<string, RigSeat | undefined> = {
  stand: undefined,
  chair: { top: V(0, 0.456, 0), front: 0.21, backrest: 0.208, backrestTop: 0.456 + 0.395 },
  desk: { top: V(0, 0.456, 0), front: 0.21, backrest: 0.208, backrestTop: 0.456 + 0.395, deskEdge: 0.23, deskTop: 0.75 },
  classroom: { top: V(0, 0.472, 0), back: 0, deskEdge: 0.35, deskTop: 0.75 },
};
type Pose = { kind: RigPoseKind; arm?: 0 | 1; amount?: number; things?: "phone" | "pen" | "both" | "finger" };
const calls: Pose[] = ([0, 1] as const).flatMap((arm) => [0, 0.5, 1].map((amount) => ({ kind: "phone" as RigPoseKind, arm, amount, things: "phone" as const })));
/** a finger to the lips: either arm, in front of the chest, half way and at the lips */
const hushes: Pose[] = ([0, 1] as const).flatMap((arm) => [0, 0.5, 1].map((amount) => ({ kind: "shh" as RigPoseKind, arm, amount, things: "finger" as const })));
const CASES: [string, Pose[]][] = [
  ["stand", [...calls, ...hushes]],
  ["chair", [{ kind: "sit" }, { kind: "sit", things: "both" }, { kind: "idle" }, { kind: "wave", arm: 0 }, { kind: "wave", arm: 1 }, { kind: "cheer" }, { kind: "point", arm: 0 }, { kind: "point", arm: 1 }, { kind: "write", arm: 0, things: "pen" }, ...calls, ...hushes]],
  ["desk", [{ kind: "desk" }, { kind: "desk", things: "both" }, { kind: "write", arm: 0, things: "pen" }, { kind: "write", arm: 1, things: "pen" }, { kind: "wave", arm: 1 }, { kind: "cheer" }, { kind: "point", arm: 0 }, ...calls, ...hushes]],
  ["classroom", [{ kind: "desk" }, { kind: "write", arm: 0, things: "pen" }, { kind: "write", arm: 1, things: "pen" }, ...calls, ...hushes]],
];
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, 9 / 16, 0.05, 100);
/** metres a gap may be short or a hand may be off before a case counts (the solvers stop within 0.2 mm), and what
 *  is let through during a head accent: 3 mm, one pixel of a film's full shot under an ink line of 3.5 (an arm at
 *  full stretch cannot follow a head that swells and tilts into it; accents last 3 frames) */
const TOL = 0.0005, TOL_ACCENT = 0.003;
let total = 0;
for (const [seatName, poses] of CASES) for (const P of poses) {
  const seat = SEATS[seatName], worn = P.kind === "phone" || P.kind === "shh" ? WORN : [[]];
  let gap = 1, gap0 = 1, at = "-", reach = 0, reachAt = "-", give = 0, n = 0, fails = 0;
  const failAt: string[] = [];
  for (const w of worn) for (const lk of LOOKS) {
    const acc: Acc[] = [...accessories(...w)];
    if (P.things === "phone") acc.push(phone({ hand: P.arm ?? 1 }));
    if (P.things === "pen") acc.push(pen({ hand: P.arm ?? 0 }));
    if (P.things === "both") acc.push(pen({ hand: 0 }), phone({ hand: 1 }));
    if (P.things === "finger") acc.push(finger({ hand: P.arm ?? 1 }));
    const rc = new RigCast(scene, { light: LAB_CAST_LIGHT as never }), f = rc.add(lookOf(lk), { acc });
    for (let hi = 0; hi < HEADS.length; hi++) for (const yaw of YAWS) for (const camY of [1.1, 2.4]) {
      const a = (yaw * Math.PI) / 180;
      cam.position.set(2.6 * Math.sin(a), camY, 2.6 * Math.cos(a)); cam.lookAt(0, 0.8, 0); cam.updateMatrixWorld();
      f.set({ at: V(), facing: 0, ...(seat ? { seat } : {}), pose: { kind: P.kind, t: 0.4 + 0.37 * hi, ...(P.arm !== undefined ? { arm: P.arm } : {}), ...(P.amount !== undefined ? { amount: P.amount } : {}) }, expr: "neutral", blink: 0, ...(HEADS[hi] ? { head: HEADS[hi] } : {}) });
      rc.update(cam, 960);
      const g = Math.min(f.qa.clear, f.qa.seat, f.qa.head), where = `${String(lk)}/${w.join("+") || "bare"}/head${hi}/yaw${yaw}/y${camY}`;
      if (g < gap) { gap = g; at = (g === f.qa.head ? "head:" : g === f.qa.seat ? "seat:" : "clear:") + where; }
      // "shh" from the far side of its arm (the camera at the other hand's side): the hand stays behind, beside the
      // lips, as it is meant to (rig3d.ts SHH_FAR; Rig.qa.reach says by how much): only the gaps count there
      const farSide = P.kind === "shh" && (P.arm ?? 1 ? yaw > 180 : yaw > 0 && yaw < 180);
      if (hi === 0 && !farSide && f.qa.reach > reach) { reach = f.qa.reach; reachAt = where; }
      if (hi > 0 || farSide) give = Math.max(give, f.qa.reach);
      if (g < gap0 && hi === 0) gap0 = g;
      if (g < -(hi ? TOL_ACCENT : TOL) || (hi === 0 && !farSide && f.qa.reach > TOL)) { fails++; const k = `${String(lk)}/${w.join("+") || "bare"}/head${hi}`; if (!failAt.includes(k) && failAt.length < 6) failAt.push(k); }
      n++;
    }
    scene.clear();
  }
  total += n;
  const name = `${seatName}.${P.kind}${P.arm ?? ""}${P.amount !== undefined ? "@" + P.amount : ""}${P.things === "both" ? "+things" : ""}`;
  console.log(`QA: pose ${name} gap ${gap.toFixed(4)} at ${at} reach ${reach.toFixed(4)} at ${reachAt} give ${give.toFixed(4)} cases ${n} bad ${fails}${fails ? " (" + failAt.join(", ") + ")" : ""}${P.kind === "shh" ? " rest " + gap0.toFixed(4) : ""}`);
}
console.log(`QA: poses done ${total}`);
const c = document.createElement("canvas"); c.width = c.height = 8; document.body.appendChild(c);
(window as any).__done = true;
