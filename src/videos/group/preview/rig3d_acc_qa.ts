// Arm clearance and reach of every catalogue accessory on a spread of builds, poses and camera angles. No picture:
// it only solves the poses and prints one "QA: acc ..." line per accessory (scripts/rig3d/acc_check.py reads them).
//   clear = the smallest gap between an arm and the body, the head or an accessory's keep-out, in metres (< 0 = the
//           arm passes through), over the camera angles a film may use (a facing within 105 deg of the camera, or a
//           back view; 115 to 170 deg is the turn-away transition, which staging keeps out of)
//   drop  = how much smaller the smallest gap of a build is than that build's smallest gap without the accessory,
//           at the worst build. (Per build, not per case: an accessory may change a pose. An arm that carries a
//           case hangs beside the body where the free arm would be up in the air; that is as near the body as the
//           same arm is when it just hangs, not worse.)
//   new   = the number of cases that clip with the accessory and do not without it
//   reach = the largest distance a hand could not reach its place
//   held  = the smallest gap between a thing in the hand (PartKit.held) and the figure's own body and head (< 0 = it
//           passes through them)
// and one "QA: rule ..." line for every rule of RIG3D.md an accessory's geometry breaks (Rig.accRules).
import * as THREE from "three";
import { RigCast, type Acc, type RigPoseKind } from "../kit/rig3d";
import { LAB_CAST_LIGHT } from "../sets/lab";
import { ACCESSORIES } from "../kit/rigacc/catalog";
import { lookOf, type LookKey } from "./rig3d_common";

const LOOKS: LookKey[] = ["you", "researcher", "worker", "mate", "friend0", "friend1", "friend2", "friend3", "friend4", "friend5", "class7", "class23", "class61"];
const POSES: RigPoseKind[] = ["idle", "walk", "wave", "cheer", "point"];
const YAWS = [0, 15, 30, 45, 60, 75, 90, 105, 180, 255, 270, 285, 300, 315, 330, 345];
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, 9 / 16, 0.05, 100);
type Case = { where: string; clear: number; reach: number; held: number };
type Rules = Map<string, { looks: string[]; msg: string }>;
const run = (make: (() => Acc[]) | null, rules?: Rules): Case[] => {
  const out: Case[] = [];
  for (const lk of LOOKS) {
    const rc = new RigCast(scene, { light: LAB_CAST_LIGHT as never }), f = rc.add(lookOf(lk), make ? { acc: make() } : {});
    for (const kind of POSES) for (const arm of [0, 1] as const) for (let ph = 0; ph < 4; ph++) for (const yaw of YAWS) for (const camY of [1.2, 2.6]) {
      if (arm === 0 && (kind === "idle" || kind === "walk" || kind === "cheer")) continue;
      const a = (yaw * Math.PI) / 180;
      cam.position.set(3 * Math.sin(a), camY, 3 * Math.cos(a)); cam.lookAt(0, 0.8, 0); cam.updateMatrixWorld();
      f.set({ at: new THREE.Vector3(0, 0, 0), facing: 0, pose: { kind, t: ph * 0.37, phase: ph / 4, arm }, expr: "neutral", blink: 0 });
      rc.update(cam, 960);
      out.push({ where: `${typeof lk === "string" ? lk : "look"}/${kind}${arm}/ph${ph}/yaw${yaw}/y${camY}`, clear: f.qa.clear, reach: f.qa.reach, held: f.qa.held });
    }
    if (rules) for (const r of f.accRules()) { const e = rules.get(r.rule) ?? { looks: [], msg: r.msg }; e.looks.push(String(lk)); rules.set(r.rule, e); }
    scene.clear();
  }
  return out;
};
const bare = run(null), b0 = bare.reduce((m, c) => (c.clear < m.clear ? c : m));
const bareLeast = new Map<string, number>();
for (const c of bare) { const lk = c.where.split("/")[0]; bareLeast.set(lk, Math.min(bareLeast.get(lk) ?? 1, c.clear)); }
console.log(`QA: acc (none) clear ${b0.clear.toFixed(4)} at ${b0.where} reach ${Math.max(...bare.map((c) => c.reach)).toFixed(4)} cases ${bare.length}`);
for (const [name, e] of Object.entries(ACCESSORIES)) {
  const rules: Rules = new Map(), w = run(e.make, rules);
  let min = w[0], drop = 0, dropAt = "", fresh = 0;
  const held = w.reduce((m, c) => (c.held < m.held ? c : m));
  const least = new Map<string, Case>();                                     // per build: the case with the smallest gap
  w.forEach((c, i) => {
    if (c.clear < min.clear) min = c;
    const lk = c.where.split("/")[0], m = least.get(lk);
    if (!m || c.clear < m.clear) least.set(lk, c);
    if (c.clear < 0 && bare[i].clear >= 0) fresh++;
  });
  for (const [lk, c] of least) if (bareLeast.get(lk)! - c.clear > drop) { drop = bareLeast.get(lk)! - c.clear; dropAt = c.where; }
  console.log(`QA: acc ${name} clear ${min.clear.toFixed(4)} at ${min.where} drop ${drop.toFixed(4)}${dropAt ? " at " + dropAt : ""} new ${fresh} reach ${Math.max(...w.map((c) => c.reach)).toFixed(4)} held ${held.held.toFixed(4)} at ${held.where} | ${e.zh} | ${e.role}`);
  for (const [rule, r] of rules) console.log(`QA: rule ${name} ${rule} on ${r.looks.length} of ${LOOKS.length} looks (${r.looks.join(",")}): ${r.msg}`);
}
const c = document.createElement("canvas"); c.width = c.height = 8; document.body.appendChild(c);
(window as any).__done = true;
