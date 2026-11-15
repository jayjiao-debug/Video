// Harness smoke test (no World, no input props; WP1b, a copy of Hongmen's): a ground, a board with the title drawn in
// the film's font, the sun and two of the cast (the envoy and the King of Qin at his 1.08 scale) under the hall's figure
// light. If this renders, the harness, the font and the cast work. It also prints the shot table's check
// (beats.ts shotCheck(): "QA: SHOTS ok" or one line per problem).
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/smoke.ts /home/user/wanbi_work/<wp>/smoke.png --size 540x960
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast } from "../../group/kit/rig3d";
import { FONT_STACK } from "../../group/kit/phone";
import { PLACE_LOOKS, BAKED_LIGHT } from "../sets";
import { addPerson, LIN, QIN_WANG } from "../people";
import { shotCheck } from "../beats";
import { TITLE } from "../story";

preview({ w: 540, h: 960 }, (c) => {
  const bad = shotCheck();
  console.log(bad.length ? bad.map((m) => `QA: SHOTS ${m}`).join("\n") : "QA: SHOTS ok (shotCheck() = [])");
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.paint({ color: "#4d4853" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = "#2e2a33"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#c9a24a"; g.font = `700 84px ${FONT_STACK}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(TITLE, 512, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.06), M.paint({ map: tex }));
  board.position.set(0, 2.0, -0.8); board.castShadow = board.receiveShadow = true; c.scene.add(board);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: { ...PLACE_LOOKS.hall.cast, ...BAKED_LIGHT } });
  const a = addPerson(rc, LIN), b = addPerson(rc, QIN_WANG);
  return {
    cam: { pos: [0, 1.3, 4.6], look: [0, 0.95, 0], fov: 46 },
    bg: PLACE_LOOKS.hall.bg,
    frame: (_i, t) => {
      a.set({ at: new THREE.Vector3(0.5, 0, 0), facing: -0.25, pose: { kind: "idle", t } });
      b.set({ at: new THREE.Vector3(-0.55, 0, -0.1), facing: 0.25, pose: { kind: "idle", t } });
      rc.update(c.camera, c.h);
      console.log(`QA: smoke reach ${a.qa.reach.toFixed(3)} / ${b.qa.reach.toFixed(3)} clear ${a.qa.clear.toFixed(3)} / ${b.qa.clear.toFixed(3)}`);
    },
  };
});
