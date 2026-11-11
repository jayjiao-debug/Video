// The headwear sheet: a grid of rig figures, one per accessory (acc/headwear.ts), on a plain light ground with the
// film's sun and the kit's cast light.
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/head_sheet.ts out.png --size 540x960 --opts '{"which":["crown","coronet"],"look":[0,3],"facing":0.7}'
// Options (all optional):
//   which   accessory names (default: all eight); "none" = a bare head. With `each` every name gets a row of its own
//   look    a look index, or a list that the figures run through: 0 YOU, 1-4 classmate 3 / 17 / 42 / 75, 5-10 friend 0..5
//           (ponytail, curls, bob, side part, long, buzz)
//   each    a list of look indices: every accessory of `which` on each of these looks, one row per accessory
//   facing  radians (0 = toward +z, the camera side);  turn 1 = keep the true facing (a back view with facing 3.1416)
//   pose    idle | walk | haul | cheer;  expr;  t (pose time)
//   cols    figures per row (default 4), gap (0.66 m), rowH (1.72 m: rows are stacked upward)
//   zoom    "body" (default) | "head";  fov;  cam = an explicit camera;  far: metres added to the camera's distance;  camX, camUp
//   args    options for the accessories by name, e.g. {"hood":{"col":"#5d7a3a"}}
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigWalk, type Acc, type RigPose } from "../../group/kit/rig3d";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YOU, classmate, friend } from "../../group/kit/cast";
import { coronet, crown, kettleHelm, openHelm, hood, linenCap, strawHat, plumedHat } from "../acc/headwear";

const MAKE: Record<string, (a?: any) => Acc> = { coronet, crown, kettleHelm, openHelm, hood, linenCap, strawHat, plumedHat };
const LOOKS = [YOU, classmate(3), classmate(17), classmate(42), classmate(75), friend(0), friend(1), friend(2), friend(3), friend(4), friend(5)];

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: "#e9eef5" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(-5, 5.5, 6.7); sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never });
  const which: string[] = o.which ?? Object.keys(MAKE), each: number[] | undefined = o.each;
  const lookOf = (i: number) => { const l = o.look ?? 0; return LOOKS[(Array.isArray(l) ? l[i % l.length] : l) % LOOKS.length]; };
  const list: { name: string; look: (typeof LOOKS)[number] }[] = each ? which.flatMap((n) => each.map((l) => ({ name: n, look: LOOKS[l % LOOKS.length] }))) : which.map((n, i) => ({ name: n, look: lookOf(i) }));
  const cols: number = o.cols ?? (each ? each.length : 4), gap: number = o.gap ?? 0.66, rowH: number = o.rowH ?? 1.72, rows = Math.ceil(list.length / cols);
  const figs = list.map((f, i) => {
    const mk = MAKE[f.name];
    if (!mk && f.name !== "none") throw new Error(`head_sheet: no accessory "${f.name}" (${Object.keys(MAKE).join(", ")})`);
    const rig = rc.add(f.look, { acc: mk ? [mk(o.args?.[f.name])] : [] });
    const col = i % cols, row = Math.floor(i / cols), n = Math.min(cols, list.length - row * cols);
    return { rig, name: f.name, at: new THREE.Vector3((col - (n - 1) / 2) * gap, (rows - 1 - row) * rowH, 0) };
  });
  for (const f of figs) for (const r of f.rig.accRules()) console.log(`QA: RULE ${f.name}: ${r.rule}: ${r.msg}`);
  const head = o.zoom === "head", W = (Math.min(cols, list.length) - 1) * gap + (head ? 0.75 : 0.85), H = (rows - 1) * rowH + (head ? 0.85 : 1.75);
  const cy = head ? (rows - 1) * rowH * 0.5 + 1.24 : H / 2 - 0.02, fov: number = o.fov ?? (head ? 24 : 50), tv = Math.tan((fov * Math.PI) / 360), d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (o.far ?? 0);
  const pose = (t: number): RigPose => (o.pose === "walk" ? rigWalk(0.37 + t, 1.2) : { kind: o.pose ?? "idle", t, amount: 0.85 });
  return {
    cam: { pos: [o.camX ?? 0, cy + (o.camUp ?? 0), d], look: [0, cy, 0], fov },
    frame: (i, t) => {
      const worst = { reach: 0, clear: 1, held: 1 };
      for (const f of figs) f.rig.set({ at: f.at, facing: o.facing ?? 0, turn: o.turn, pose: pose(o.t ?? 0.4 + t), expr: o.expr ?? "neutral" });
      rc.update(c.camera, c.h);
      for (const f of figs) { worst.reach = Math.max(worst.reach, f.rig.qa.reach); worst.clear = Math.min(worst.clear, f.rig.qa.clear); worst.held = Math.min(worst.held, f.rig.qa.held); }
      if (i === (o.f ?? 0)) console.log(`QA: ${figs.length} figures, pose ${o.pose ?? "idle"}: worst reach ${worst.reach.toFixed(3)} clear ${worst.clear.toFixed(3)} held ${worst.held.toFixed(3)} | ` + figs.map((f) => `${f.name} ${f.rig.qa.reach.toFixed(3)}/${f.rig.qa.clear.toFixed(3)}`).join(" "));
    },
  };
});
