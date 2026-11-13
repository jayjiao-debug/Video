// Harness smoke test (no World, no input props; WP1, a copy of Qin's): a ground, a board with the title drawn in the
// film's font, the sun and the two figures of the stand-in cast (shots/common.ts STAND_IN: NEWTON and HUMPHREY once
// people.ts exports them) under the room's figure light. If this renders, the harness, the font and the cast work. It
// also prints the beat table's check (beats.ts beatCheck(): "QA: BEATS ok" or one line per problem).
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/smoke.ts /home/user/newton_work/film/<lane>/smoke.png --size 540x960
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast } from "../../group/kit/rig3d";
import { FONT_STACK } from "../../group/kit/phone";
import { PLACE_LOOKS, BAKED_LIGHT } from "../sets";
import { addPerson } from "../people";
import { STAND_IN } from "../shots/common";
import { beatCheck } from "../beats";
import { TITLE } from "../story";

preview({ w: 540, h: 960 }, (c) => {
  const bad = beatCheck();
  console.log(bad.length ? bad.map((m) => `QA: BEATS ${m}`).join("\n") : "QA: BEATS ok (beatCheck() = [])");
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.paint({ color: "#6b5a48" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = "#efe6cf"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#2a2018"; g.font = `700 84px ${FONT_STACK}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(TITLE, 512, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.06), M.paint({ map: tex }));
  board.position.set(0, 2.15, -1.0); board.castShadow = board.receiveShadow = true; c.scene.add(board);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: { ...PLACE_LOOKS.room.cast, ...BAKED_LIGHT } });
  const a = addPerson(rc, STAND_IN.newton), b = addPerson(rc, STAND_IN.humphrey);
  return {
    cam: { pos: [0, 1.5, 5.0], look: [0, 0.95, 0], fov: 46 },
    bg: PLACE_LOOKS.room.bg,
    frame: (_i, t) => {
      a.set({ at: new THREE.Vector3(-0.45, 0, -0.1), facing: 0.15, pose: { kind: "idle", t } });
      b.set({ at: new THREE.Vector3(0.5, 0, 0.05), facing: -0.2, pose: { kind: "idle", t: t + 0.4 } });
      rc.update(c.camera, c.h);
      console.log(`QA: smoke reach ${[a, b].map((r) => r.qa.reach.toFixed(3)).join(" / ")} clear ${[a, b].map((r) => r.qa.clear.toFixed(3)).join(" / ")}`);
    },
  };
});
