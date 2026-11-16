// QA table: which stand points on the stone let the kit rig's hands arrive at the grip (prints QA lines, the still is unimportant)
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/props_reach.ts /tmp/x.png --opts '{"what":"tug"}'
// The rig turns its torso toward the camera, so reach and clear change with the camera: pass "cam" (as every entry)
// and check from the shot's own camera. Options: what "tug" | "draw" | "front"; xs, zs, tws, ts, ams, ks, arms, sides; scale.
import * as THREE from "three";
import { preview } from "./common";
import { RigCast } from "../../group/kit/rig3d";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YOU } from "../../group/kit/cast";
import { buildStone } from "../props";

preview({ w: 270, h: 480, what: "tug" }, (c) => {
  const o = c.opts, S = buildStone(c.mats()); c.scene.add(S.group, S.sword);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never }), a = rc.add(YOU);
  if (o.scale) a.group.scale.setScalar(o.scale);   // a smaller figure (the boy Arthur: 0.86)
  let done = false;
  return {
    cam: { pos: [0, 1.35, 4.0], look: [0, 1.0, 0], fov: 50 },
    frame: () => {
      if (done) return; done = true;
      const g = S.grip(0), row = (tag: string) => `QA: ${tag} reach ${a.qa.reach.toFixed(3)} clear ${a.qa.clear.toFixed(3)} feet ${[0, 1].map((k) => { const f = a.footWorld(k as 0 | 1); return `${f.x.toFixed(2)},${f.z.toFixed(2)}`; }).join(" | ")} head ${a.headWorld().toArray().map((v) => v.toFixed(2)).join(",")}`;
      const xs: number[] = o.xs ?? [0.1, 0.14, 0.18, 0.22, 0.26, 0.3], zs: number[] = o.zs ?? [0], tws: number[] = o.tws ?? [0], ams: number[] = o.ams ?? [0.85], sides: number[] = o.sides ?? [1];
      if (o.what === "tug") for (const sd of sides) for (const am of ams) for (const z of zs) for (const x of xs) for (const tw of tws) for (const t of (o.ts ?? [0]) as number[]) {
        a.set({ at: new THREE.Vector3(sd * x, 0.36, z), facing: -sd * Math.PI / 2, pose: { kind: "haul", t, amount: am }, twist: tw, hands: [g.clone().setY(g.y - 0.018), g.clone().setY(g.y + 0.018)] });
        rc.update(c.camera, c.h); console.log(row(`tug side ${sd} am ${am} x ${x} z ${z} tw ${tw} t ${t}`));
      }
      if (o.what === "draw") for (const sd of sides) for (const z of zs) for (const x of xs) for (const tw of tws) for (const k of (o.ks ?? [0, 0.5, 1]) as number[]) for (const arm of (o.arms ?? [0, 1]) as number[]) {
        const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null]; hands[arm] = S.grip(k);
        a.set({ at: new THREE.Vector3(sd * x, 0.36, z), facing: -sd * Math.PI / 2, pose: { kind: "idle", t: 0 }, twist: tw, hands });
        rc.update(c.camera, c.h); console.log(row(`draw side ${sd} x ${x} z ${z} tw ${tw} k ${k} arm ${arm}`));
      }
      if (o.what === "front") for (const z of zs) for (const k of (o.ks ?? [0]) as number[]) {
        const gk = S.grip(k);
        a.set({ at: new THREE.Vector3(0, 0.36, z), facing: 0, pose: { kind: "idle", t: 0 }, twist: 0, hands: [gk.clone().setY(gk.y - 0.018), gk.clone().setY(gk.y + 0.018)] });
        rc.update(c.camera, c.h); console.log(row(`front z ${z} k ${k}`));
      }
    },
  };
});
