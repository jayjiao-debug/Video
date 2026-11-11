// The cast line-up: the people of people.ts on a plain pale ground under the film's sun and the kit's cast light.
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/people_lineup.ts out.png --size 540x960 --opts '{"who":["arthur","kay","ector"],"facing":0.7}'
// Options (all optional):
//   who     names or indices into ALL_PEOPLE, or groups: "arthur", "arthurKing", "kay", "ector", "lord3", "guard0",
//           "commoner12", "principals" (arthur, kay, ector), "lords", "guards", "commoners", "all" (the default)
//   facing  radians (0 = toward +z, the camera side), one number or a list used in turn
//   turn    state.turn (1 = keep the true facing: a back view with facing 3.1416)
//   spin    radians per second added to the facing (frames with --pick: a turn on the spot, for the speck count)
//   pose    idle | walk | haul | cheer | wave | point (one or a list);  phase (walk / haul), amount, stride, t
//   expr    one expression or a list used in turn
//   hide    accessory names whose 3D parts are hidden;  bare: true = no accessories at all (the rig.qa baseline)
//   layout  "row" (one row on the ground) | "sheet" (rows stacked upward, no ground) | "crowd" (rows behind one
//           another on the ground, staggered). Default: row up to `cols` figures, else sheet
//   cols    figures per row (default 4), gap (m between figures, default 0.66), rowH (sheet, 1.72), depth (crowd, 0.75)
//   zoom    "body" (default) | "head";  fov (default 40);  far = metres added to the camera's distance;  camUp, camX
//   cam     { pos, look, fov }: an explicit camera (preview/common.ts)
//   scale   a number: sets every figure's group scale (to see what scaling a rig does)
// Prints one QA line per figure: reach / clear / held (rig.qa) and every accRules violation.
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigWalk, type RigPose } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { PEOPLE, ALL_PEOPLE, addPerson, type Person } from "../people";

const GROUPS: Record<string, () => Person[]> = {
  all: () => ALL_PEOPLE,
  principals: () => [PEOPLE.arthur, PEOPLE.kay, PEOPLE.ector],
  lords: () => [0, 1, 2, 3, 4, 5, 6, 7].map(PEOPLE.lord),
  guards: () => [0, 1, 2, 3].map(PEOPLE.guard),
  commoners: () => Array.from({ length: 16 }, (_, i) => PEOPLE.commoner(i)),
};
const find = (w: string | number): Person[] => {
  if (typeof w === "number") return [ALL_PEOPLE[((w % ALL_PEOPLE.length) + ALL_PEOPLE.length) % ALL_PEOPLE.length]];
  if (GROUPS[w]) return GROUPS[w]();
  const p = ALL_PEOPLE.find((q) => q.name === w);
  if (!p) throw new Error(`people_lineup: nobody called "${w}" (${ALL_PEOPLE.map((q) => q.name).join(", ")}, ${Object.keys(GROUPS).join(", ")})`);
  return [p];
};
const pickOf = <T,>(v: T | T[] | undefined, i: number, d: T): T => (v === undefined ? d : Array.isArray(v) ? v[i % v.length] : v);

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, M = c.mats();
  const who: (string | number)[] = o.who === undefined ? ["all"] : Array.isArray(o.who) ? o.who : [o.who];
  const list = who.flatMap(find);
  const cols: number = o.cols ?? 4, layout: string = o.layout ?? (list.length <= cols ? "row" : "sheet"), per = layout === "row" ? list.length : cols;
  const gap: number = o.gap ?? 0.66, rowH: number = o.rowH ?? 1.72, depth: number = o.depth ?? 0.75, rows = Math.ceil(list.length / per);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.paint({ color: o.ground ?? "#e9eef5" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.visible = layout !== "sheet"; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(-0.5 * 14, 0.55 * 14, 0.67 * 14); sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never });
  const figs = list.map((p, i) => {
    const col = i % per, row = Math.floor(i / per), n = Math.min(per, list.length - row * per);
    const at = layout === "sheet" ? new THREE.Vector3((col - (n - 1) / 2) * gap, (rows - 1 - row) * rowH, 0)
      : new THREE.Vector3((col - (n - 1) / 2) * gap + (layout === "crowd" && row % 2 ? gap * 0.5 : 0), 0, -row * depth);
    const rig = o.bare ? rc.add(p.look) : addPerson(rc, p);
    if (typeof o.scale === "number") rig.group.scale.setScalar(o.scale);
    for (const r of rig.accRules()) console.log(`QA: RULE ${p.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
    return { p, rig, at };
  });
  const head = o.zoom === "head", fov: number = o.fov ?? 40, tv = Math.tan((fov * Math.PI) / 360);
  const W = (Math.min(per, list.length) - 1) * gap + (head ? 0.7 : 0.95);
  const H = layout === "sheet" ? (rows - 1) * rowH + 1.78 : head ? 0.8 : 1.9;
  const cy = layout === "sheet" ? H / 2 - 0.06 : head ? 1.2 : 0.82;
  const d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (o.far ?? 0) + (layout === "crowd" ? 0.4 : 0);
  const poseOf = (i: number, t: number): RigPose => {
    const kind = pickOf<string>(o.pose, i, "idle");
    if (kind === "walk") return rigWalk(o.phase !== undefined ? o.phase : 0.12 + 0.19 * i + t, o.stride ?? 1.2);
    if (kind === "haul") return { kind: "haul", phase: o.phase ?? 0.25, amount: o.amount ?? 0.9 } as RigPose;
    return { kind, t: (o.t ?? 0.4) + t + i * 0.13 } as RigPose;
  };
  return {
    cam: layout === "crowd" ? { pos: [o.camX ?? 0, 1.45 + (o.camUp ?? 0), d], look: [0, 0.8, -((rows - 1) * depth) / 2], fov }
      : { pos: [o.camX ?? 0, (layout === "sheet" ? cy : head ? 1.25 : 1.3) + (o.camUp ?? 0), d], look: [0, cy, 0], fov },
    frame: (fi, t) => {
      figs.forEach((f, i) => f.rig.set({ at: f.at, facing: pickOf<number>(o.facing, i, 0) + (o.spin ?? 0) * t, turn: o.turn, pose: poseOf(i, t), expr: pickOf<string>(o.expr, i, "neutral") as Expr, hide: o.hide, twist: o.twist }));
      rc.update(c.camera, c.h);
      if (fi === (o.f ?? 0)) figs.forEach((f, i) => console.log(`QA: ${i} ${f.p.name} ${pickOf<string>(o.pose, i, "idle")} reach ${f.rig.qa.reach.toFixed(3)} clear ${f.rig.qa.clear.toFixed(3)} held ${f.rig.qa.held.toFixed(3)}`));
    },
  };
});
