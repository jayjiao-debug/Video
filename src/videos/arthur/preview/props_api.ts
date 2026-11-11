// API check of props.ts (prints QA lines; the still shows the stone moved and turned, the sword under a foreign parent)
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/props_api.ts /tmp/x.png
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { buildStone, STONE } from "../props";

preview({ w: 540, h: 960 }, (c) => {
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: "#eaf1fa" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(-5, 5.5, 6.7); c.scene.add(sun, sun.target);
  const S = buildStone(M);
  const f = (v: THREE.Vector3) => v.toArray().map((x) => x.toFixed(4)).join(",");
  const ok = (name: string, err: number, tol = 1e-4) => console.log(`QA: ${err <= tol ? "ok  " : "FAIL"} ${name} (err ${err.toExponential(2)})`);
  // 1. at the origin, no parents: the STONE numbers
  c.scene.add(S.group, S.sword);
  S.setStuck();
  ok("grip(0) = (0, gripY, 0)", S.grip().distanceTo(new THREE.Vector3(0, STONE.gripY, 0)));
  ok("tip at anvilTop - insert", S.tip().distanceTo(new THREE.Vector3(0, STONE.anvilTop - STONE.insert, 0)));
  ok("swordLen: pommel top - tip", Math.abs(STONE.pommelY - S.tip().y - STONE.swordLen));
  S.setStuck(1); ok("k 1: tip at the anvil's face", S.tip().distanceTo(new THREE.Vector3(0, STONE.anvilTop, 0)));
  ok("k 1: grip(1)", S.grip(1).distanceTo(new THREE.Vector3(0, STONE.gripY + STONE.insert, 0)));
  S.setStuck(2); ok("k clamps at 1", S.tip().distanceTo(new THREE.Vector3(0, STONE.anvilTop, 0)));
  S.setStuck(-1); ok("k clamps at 0", S.tip().distanceTo(new THREE.Vector3(0, STONE.anvilTop - STONE.insert, 0)));
  const bb = new THREE.Box3().setFromObject(S.sword.getObjectByName("sword.blade")!), hb = new THREE.Box3().setFromObject(S.sword.getObjectByName("sword.hilt")!);
  console.log(`QA: blade box ${f(bb.min)} .. ${f(bb.max)}  hilt box ${f(hb.min)} .. ${f(hb.max)}`);
  const gb = new THREE.Box3(); for (const n of ["stone.block", "stone.inscription", "anvil"]) gb.union(new THREE.Box3().setFromObject(S.group.getObjectByName(n)!));
  console.log(`QA: block + anvil box ${f(gb.min)} .. ${f(gb.max)}  colliders ${JSON.stringify(S.colliders)}`);
  // 2. the stone moved and turned, the sword under a foreign, turned and scaled parent
  S.group.position.set(0.4, 0.2, -0.5); S.group.rotation.set(0, 0.6, 0);
  const holder = new THREE.Group(); holder.position.set(-1, 0.3, 2); holder.rotation.set(0.3, -1.1, 0.5); holder.scale.setScalar(1.3); c.scene.add(holder); holder.add(S.sword);
  const world = () => { S.sword.updateWorldMatrix(true, false); const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); S.sword.matrixWorld.decompose(p, q, s); return { p, q, s }; };
  S.setStuck(0.5, 0.1);
  let w = world();
  ok("moved: sword origin = grip(0.5, 0.1)", w.p.distanceTo(S.grip(0.5, 0.1)));
  ok("moved: world scale 1", w.s.distanceTo(new THREE.Vector3(1, 1, 1)));
  const slot = S.group.localToWorld(new THREE.Vector3(0, STONE.anvilTop, 0)), axis = new THREE.Vector3(0, 1, 0).applyQuaternion(w.q);
  ok("moved: the blade's axis passes through the slot", new THREE.Vector3().subVectors(slot, w.p).cross(axis).length());
  ok("moved: lean = wobble", Math.abs(axis.angleTo(new THREE.Vector3(0, 1, 0)) - 0.1));
  ok("moved: tip() on the axis, 0.71 below the grip", S.tip().distanceTo(w.p.clone().addScaledVector(axis, -0.71)));
  // 3. free
  const p = new THREE.Vector3(1.2, 1.5, 0.7), up = new THREE.Vector3(-0.5, -2, 0.3), face = new THREE.Vector3(0.2, 0.1, 1);
  S.setFree(p, up, face); w = world();
  ok("free: origin at p", w.p.distanceTo(p));
  ok("free: pommel along up", new THREE.Vector3(0, 1, 0).applyQuaternion(w.q).angleTo(up));
  const z = new THREE.Vector3(0, 0, 1).applyQuaternion(w.q), fz = face.clone().addScaledVector(up.clone().normalize(), -face.dot(up.clone().normalize())).normalize();
  ok("free: flat toward face (perpendicular to up)", z.angleTo(fz));
  ok("free: world scale 1", w.s.distanceTo(new THREE.Vector3(1, 1, 1)));
  ok("free: tip", S.tip().distanceTo(p.clone().addScaledVector(up.clone().normalize(), -0.71)));
  S.setFree(p, new THREE.Vector3(0, 0, 3)); w = world();
  ok("free: up along +z with the default face still gives a rotation", Math.abs(w.q.length() - 1) + new THREE.Vector3(0, 1, 0).applyQuaternion(w.q).angleTo(new THREE.Vector3(0, 0, 1)));
  S.setFree(p, new THREE.Vector3(0, 0, 0)); w = world();
  ok("free: a zero up does not break", Number.isFinite(w.q.x + w.p.x) ? 0 : 1);
  // 4. seasons, glow, shine
  for (const k of [0, 1, 2, 3] as const) { S.setSeason(k); console.log(`QA: season ${k}: ${["stone.snow", "stone.snowRemnants", "stone.moss"].map((n) => `${n} ${S.group.getObjectByName(n)!.visible ? "on" : "off"}`).join(", ")}`); }
  const em = (n: string, root: THREE.Object3D) => ((root.getObjectByName(n) as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity;
  S.setGlow(0); S.setShine(0); const g0 = em("stone.inscription", S.group), s0 = em("sword.blade", S.sword);
  S.setGlow(1); S.setShine(1); console.log(`QA: glow 0 -> ${g0.toFixed(2)}, 1 -> ${em("stone.inscription", S.group).toFixed(2)};  shine 0 -> ${s0.toFixed(2)}, 1 -> ${em("sword.blade", S.sword).toFixed(2)}`);
  S.setGlow(0); S.setShine(0); S.setSeason(0);
  console.log(`QA: triangles ${S.group.userData.triangles}`);
  S.setStuck(0.5, 0.1);
  return { cam: { pos: [0, 1.4, 4.5], look: [0.3, 0.8, -0.3], fov: 50 } };
});
