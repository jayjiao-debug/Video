// Harness smoke test (no World, no input props): a ground, a board with Chinese text drawn in the film's font, the sun
// and two of the cast under the day light. If this renders, the harness, the font and the cast work.
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/smoke.ts /home/user/hm_work/e/smoke.png --size 540x960
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast } from "../../group/kit/rig3d";
import { FONT_STACK } from "../../group/kit/phone";
import { PLACE_LOOKS } from "../sets";
import { addPerson, LIU_BANG, XIANG_YU } from "../people";
import { TITLE } from "../story";

preview({ w: 540, h: 960 }, (c) => {
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.paint({ color: "#d9c9a0" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = "#3b3350"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#e2b03a"; g.font = `700 84px ${FONT_STACK}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(TITLE, 512, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.06), M.paint({ map: tex }));
  board.position.set(0, 2.0, -0.8); board.castShadow = board.receiveShadow = true; c.scene.add(board);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: PLACE_LOOKS.gate.cast });
  const a = addPerson(rc, LIU_BANG), b = addPerson(rc, XIANG_YU);
  return {
    cam: { pos: [0, 1.3, 4.6], look: [0, 0.95, 0], fov: 46 },
    frame: (_i, t) => {
      a.set({ at: new THREE.Vector3(0.5, 0, 0), facing: -0.25, pose: { kind: "idle", t }, expr: "smug" });
      b.set({ at: new THREE.Vector3(-0.55, 0, -0.1), facing: 0.25, pose: { kind: "idle", t }, expr: "stern" });
      rc.update(c.camera, c.h);
      console.log(`QA: smoke reach ${a.qa.reach.toFixed(3)} / ${b.qa.reach.toFixed(3)} clear ${a.qa.clear.toFixed(3)} / ${b.qa.clear.toFixed(3)}`);
    },
  };
});
