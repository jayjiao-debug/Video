// harness smoke test: a stone-ish box with Chinese gold letters, a ground plane, the sun and two rig figures
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast } from "../../group/kit/rig3d";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YOU, classmate } from "../../group/kit/cast";
import { topHat } from "../../group/kit/rigacc";
import { FONT_STACK } from "../../group/kit/phone";

preview({ w: 540, h: 960 }, (c) => {
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.paint({ color: "#e9eef5" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = "#b9b6ae"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#e9b53a"; g.font = `700 90px ${FONT_STACK}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("拔出此剑者", 512, 70); g.fillText("即为英格兰之王", 512, 180);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.36, 1.0), M.paint({ map: tex }));
  box.position.set(0, 0.18, 0); box.castShadow = box.receiveShadow = true; c.scene.add(box);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never });
  const a = rc.add(YOU), b = rc.add(classmate(42), { acc: [topHat()] });
  a.group.scale.setScalar(0.86);
  return {
    cam: { pos: [0, 1.3, 4.2], look: [0, 0.9, 0], fov: 50 },
    frame: (i, t) => {
      a.set({ at: new THREE.Vector3(0.26, 0.36, 0.0), facing: -Math.PI / 2, pose: { kind: "haul", t, amount: 0.8 }, hands: [new THREE.Vector3(0.0, 0.96, 0), new THREE.Vector3(0.0, 1.0, 0)], twist: 0, expr: "huff" });
      b.set({ at: new THREE.Vector3(-1.2, 0, -0.4), facing: 0.4, pose: { kind: "idle", t }, expr: "smug" });
      rc.update(c.camera, c.h);
      console.log(`QA: reach ${a.qa.reach.toFixed(3)} clear ${a.qa.clear.toFixed(3)}`);
    },
  };
});
