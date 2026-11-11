// the stone, the anvil and the sword, with two rig figures to prove the handling
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/props_view.ts out.png --size 540x960 --opts '{"mode":"tug"}'
// options: mode "stuck" | "tug" | "draw" | "front" | "held" | "carry";  k (draw, 0..1);  season 0..3;  glow, shine 0..1;
//          wobble (rad);  stand [x, z] overrides the stand point;  twist (rad);  amount (haul);  side "L" | "R"
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigWalk } from "../../group/kit/rig3d";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YOU, classmate } from "../../group/kit/cast";
import { buildStone, STONE } from "../props";

preview({ w: 540, h: 960, mode: "stuck", season: 0 }, (c) => {
  const o = c.opts, mode: string = o.mode ?? "stuck";
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: o.season >= 2 ? "#9fcf6a" : "#eaf1fa" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(-5, 5.5, 6.7); sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const S = buildStone(M); c.scene.add(S.group, S.sword);
  S.setSeason((o.season ?? 0) as 0 | 1 | 2 | 3); S.setGlow(o.glow ?? 0); S.setShine(o.shine ?? 0);
  console.log(`QA: triangles ${S.group.userData.triangles}`);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never });
  const a = rc.add(YOU), b = rc.add(classmate(42));
  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  return {
    // (the figure of "held" / "carry" stands beside the stone, out of the portrait frame of the stone's own camera)
    cam: mode === "held" || mode === "carry" ? { pos: [1.15, 1.35, 4.6], look: [1.15, 1.0, 0.6], fov: 50 } : { pos: [0, 1.35, 4.0], look: [0, 1.0, 0], fov: 50 },
    frame: (i, t) => {
      a.set({ visible: false }); b.set({ visible: false });
      const left = o.side === "L", standSide = V(mode === "draw" ? (left ? STONE.drawL : STONE.drawR) : left ? STONE.standL : STONE.standR);
      if (o.stand) { standSide.x = o.stand[0]; standSide.z = o.stand[1]; }
      const twist: number = o.twist ?? (mode === "tug" ? (left ? STONE.twistL : STONE.twistR) : 0);
      const facing = left ? Math.PI / 2 : -Math.PI / 2;
      let who = a;
      if (mode === "stuck") S.setStuck(0, 0);
      if (mode === "tug") {
        const wob = o.wobble ?? 0.025; S.setStuck(0, wob);
        const g = S.grip(0, wob), up = new THREE.Vector3(-Math.sin(wob), Math.cos(wob), 0);
        a.set({ visible: true, at: standSide, facing, pose: { kind: "haul", t, amount: o.amount ?? 0.85 }, twist, turn: o.turn, expr: "huff",
          hands: [g.clone().addScaledVector(up, -0.018), g.clone().addScaledVector(up, 0.018)] });
      }
      if (mode === "draw") {
        const k = o.k ?? 0.6; S.setStuck(k, 0);
        const arm = left ? 1 : 0, hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null]; hands[o.arm ?? arm] = S.grip(k);
        a.set({ visible: true, at: standSide, facing, pose: { kind: "idle", t }, twist, expr: "focus", hands });
      }
      if (mode === "front") {
        S.setStuck(0, 0);
        const at = V(STONE.standBack); if (o.stand) { at.x = o.stand[0]; at.z = o.stand[1]; }
        const g = S.grip(0);
        a.set({ visible: true, at, facing: 0, pose: { kind: "idle", t }, expr: "huff", hands: [g.clone().add(new THREE.Vector3(0, -0.018, 0)), g.clone().add(new THREE.Vector3(0, 0.018, 0))] });
      }
      if (mode === "held") {
        who = b; S.setStuck(1, 0); // (placed for real after the update)
        const at = new THREE.Vector3(1.4, 0, 0.6);
        b.set({ visible: true, at, facing: 0, pose: { kind: "cheer", t, amount: 0 }, expr: "grin", hands: [null, o.pin === false ? null : at.clone().add(new THREE.Vector3(0.34, 1.25, 0.08))] });
      }
      if (mode === "carry") {
        who = b;
        const d = o.dist ?? 0.7;
        b.set({ visible: true, at: new THREE.Vector3(0.9 + d, 0, 1.0), facing: Math.PI / 2, pose: rigWalk(d, 1.6), expr: "smile" });
      }
      rc.update(c.camera, c.h);
      if (mode === "held") S.setFree(b.handWorld(1), new THREE.Vector3(o.lean ?? -0.27, -1, 0));
      if (mode === "carry") S.setFree(b.handWorld(0), new THREE.Vector3(0.82, 0.57, 0));
      const tip = S.tip();
      console.log(`QA: mode ${mode} reach ${who.qa.reach.toFixed(3)} clear ${who.qa.clear.toFixed(3)} tip ${tip.x.toFixed(3)},${tip.y.toFixed(3)},${tip.z.toFixed(3)} feet ${[0, 1].map((k) => { const f = who.footWorld(k as 0 | 1); return `${f.x.toFixed(2)},${f.y.toFixed(2)},${f.z.toFixed(2)}`; }).join(" | ")} head ${who.headWorld().toArray().map((v) => v.toFixed(2)).join(",")}`);
    },
  };
});
