// Harness smoke test (no World, no input props; WP1, a copy of Wanbi's): a ground, a board with the title drawn in the
// film's font, the sun and three of the cast (the SU stand-in at his 1.06 scale between GUO and MAI) under the yard's
// figure light. If this renders, the harness, the font and the cast work. It also prints the beat table's check
// (beats.ts beatCheck(): "QA: BEATS ok" or one line per problem).
//   bash scripts/kit/queue/still.sh src/videos/libai/preview/smoke.ts /home/user/libai_work/<lane>/smoke.png --size 540x960
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast } from "../../group/kit/rig3d";
import { FONT_STACK } from "../../group/kit/phone";
import { PLACE_LOOKS, BAKED_LIGHT } from "../sets";
import { addPerson, LI as SU, HUAN as GUO, GAO as MAI } from "../people";
import { beatCheck } from "../beats";
import { TITLE } from "../story";

preview({ w: 540, h: 960 }, (c) => {
  const bad = beatCheck();
  console.log(bad.length ? bad.map((m) => `QA: BEATS ${m}`).join("\n") : "QA: BEATS ok (beatCheck() = [])");
  const M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.paint({ color: "#4d4853" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = "#2e2a33"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#c9a24a"; g.font = `700 84px ${FONT_STACK}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(TITLE, 512, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.06), M.paint({ map: tex }));
  board.position.set(0, 2.15, -1.0); board.castShadow = board.receiveShadow = true; c.scene.add(board);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: { ...PLACE_LOOKS.tavern.cast, ...BAKED_LIGHT } });
  const a = addPerson(rc, GUO), b = addPerson(rc, SU), d = addPerson(rc, MAI);
  return {
    cam: { pos: [0, 1.4, 5.0], look: [0, 0.95, 0], fov: 46 },
    bg: PLACE_LOOKS.tavern.bg,
    frame: (_i, t) => {
      a.set({ at: new THREE.Vector3(-0.85, 0, 0.1), facing: 0.25, pose: { kind: "idle", t } });
      b.set({ at: new THREE.Vector3(0, 0, -0.1), facing: 0, pose: { kind: "idle", t: t + 0.4 } });
      d.set({ at: new THREE.Vector3(0.9, 0, 0.05), facing: -0.25, pose: { kind: "idle", t: t + 0.8 } });
      rc.update(c.camera, c.h);
      console.log(`QA: smoke reach ${[a, b, d].map((r) => r.qa.reach.toFixed(3)).join(" / ")} clear ${[a, b, d].map((r) => r.qa.clear.toFixed(3)).join(" / ")}`);
    },
  };
});
