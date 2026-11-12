// The headwear sheet of the Hongmen film: a grid of rig figures, one per accessory of acc/headwear.ts, on a plain
// ground under a choice of light.
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/head_sheet.ts out.png --size 900x600 --opts '{"which":["topknot","scholarCap"],"zoom":"head"}'
// Options (all optional):
//   which   accessory names (default: all five: topknot, scholarCap, pheasantCap, flatCap, helmet); "none" = a bare
//           head. With `each` every name gets a row of its own
//   look    a look index, or a list that the figures run through: 0 YOU, 1-4 classmate 3 / 17 / 42 / 75, 5-10 friend 0..5.
//           Every look is given the film's black "buzz" hair unless keepHair is true
//   each    a list of look indices: every accessory of `which` on each of these looks, one row per accessory
//   facing  radians (0 = toward +z, the camera side), one number or a list;  turn 1 = keep the true facing (a back
//           view with facing 3.1416);  spin = radians per second added (frames with --pick: a turn on the spot)
//   pose    idle | walk | haul | cheer;  expr;  t (pose time);  head = a RigHead (tilt, dy ...);  lookDown
//   cols    figures per row (default 5), gap (0.66 m), rowH (1.9 m: rows are stacked upward)
//   zoom    "body" (default) | "head";  fov;  cam = an explicit camera;  far: metres added to the camera's distance;  camX, camUp
//   args    options for the accessories by name, e.g. {"topknot":{"band":"#6a2f9a"}}
//   light   "lab" (default) | "yard" | "tent"
import * as THREE from "three";
import { preview, SHEET_LIGHTS } from "./sheet_common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigWalk, type Acc, type RigPose } from "../../group/kit/rig3d";
import type { Look } from "../../group/kit/toon";
import { YOU, classmate, friend } from "../../group/kit/cast";
import { HEADWEAR } from "../acc/headwear";
import { trackFace } from "../acc/garb";

const LOOKS = [YOU, classmate(3), classmate(17), classmate(42), classmate(75), friend(0), friend(1), friend(2), friend(3), friend(4), friend(5)];
const han = (L: Look, keep: boolean): Look => (keep ? L : { seed: L.seed, skin: L.skin, part: L.part, width: L.width, top: "tee", topCol: "#8f8a80", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", hair: "buzz", hairCol: "#1f1c22" });

preview({ w: 900, h: 600 }, (c) => {
  const o = c.opts, M = c.mats(), LT = SHEET_LIGHTS[o.light ?? "lab"];
  if (!LT) throw new Error("head_sheet: no light called " + o.light);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: LT.ground }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(LT.sun[0] * 14, LT.sun[1] * 14, LT.sun[2] * 14); sun.intensity *= LT.sunK; sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LT.cast as never });
  trackFace(rc);
  const which: string[] = o.which ?? Object.keys(HEADWEAR), each: number[] | undefined = o.each;
  const lookOf = (i: number) => { const l = o.look ?? [1, 2, 3, 4, 0]; return han(LOOKS[(Array.isArray(l) ? l[i % l.length] : l) % LOOKS.length], !!o.keepHair); };
  const list: { name: string; look: Look }[] = each ? which.flatMap((n) => each.map((l) => ({ name: n, look: han(LOOKS[l % LOOKS.length], !!o.keepHair) }))) : which.map((n, i) => ({ name: n, look: lookOf(i) }));
  const cols: number = o.cols ?? (each ? each.length : 5), gap: number = o.gap ?? 0.66, rowH: number = o.rowH ?? 1.9, rows = Math.ceil(list.length / cols);
  const figs = list.map((f, i) => {
    const mk = HEADWEAR[f.name];
    if (!mk && f.name !== "none") throw new Error(`head_sheet: no accessory "${f.name}" (${Object.keys(HEADWEAR).join(", ")})`);
    const acc: Acc[] = mk ? [mk(o.args?.[f.name])] : [];
    const rig = rc.add(f.look, { acc });
    const col = i % cols, row = Math.floor(i / cols), n = Math.min(cols, list.length - row * cols);
    return { rig, name: f.name, at: new THREE.Vector3((col - (n - 1) / 2) * gap, (rows - 1 - row) * rowH, 0) };
  });
  for (const f of figs) for (const r of f.rig.accRules()) console.log(`QA: RULE ${f.name}: ${r.rule}: ${r.msg}`);
  if (rows > 1) ground.visible = false;
  const head = o.zoom === "head", W = (Math.min(cols, list.length) - 1) * gap + (head ? 0.8 : 0.85), H = (rows - 1) * rowH + (head ? 1.05 : 1.95);
  const cy = head ? (rows - 1) * rowH * 0.5 + 1.34 : H / 2 - 0.02, fov: number = o.fov ?? (head ? 24 : 50), tv = Math.tan((fov * Math.PI) / 360), d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (o.far ?? 0);
  const pose = (t: number): RigPose => (o.pose === "walk" ? rigWalk(0.37 + t, 1.2) : { kind: o.pose ?? "idle", t, amount: 0.85 });
  return {
    cam: { pos: [o.camX ?? 0, cy + (o.camUp ?? 0), d], look: [0, cy, 0], fov }, ao: LT.ao, bg: LT.bg,
    frame: (i, t) => {
      const worst = { reach: 0, clear: 1, held: 1 };
      figs.forEach((f, k) => f.rig.set({ at: f.at, facing: (Array.isArray(o.facing) ? o.facing[k % o.facing.length] : o.facing ?? 0) + (o.spin ?? 0) * t, turn: o.turn, pose: pose(o.t ?? 0.4 + t), expr: o.expr ?? "neutral", head: o.head, lookDown: o.lookDown, visible: true }));
      rc.update(c.camera, c.h);
      for (const f of figs) { worst.reach = Math.max(worst.reach, f.rig.qa.reach); worst.clear = Math.min(worst.clear, f.rig.qa.clear); worst.held = Math.min(worst.held, f.rig.qa.held); }
      if (i === (o.f ?? 0)) console.log(`QA: ${figs.length} figures, pose ${o.pose ?? "idle"}: worst reach ${worst.reach.toFixed(3)} clear ${worst.clear.toFixed(3)} held ${worst.held.toFixed(3)} | ` + figs.map((f) => `${f.name} ${f.rig.qa.reach.toFixed(3)}/${f.rig.qa.clear.toFixed(3)}`).join(" "));
    },
  };
});
