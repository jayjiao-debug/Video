// the set alone, with stand-ins for scale (a grey block where the stone goes, a few 1.45 m capsules):
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/yard_view.ts out.png --size 540x960 \
//     --opts '{"season":0,"t":2,"focus":[0,0],"cam":{"pos":[0,1.35,5.2],"look":[0,1.0,0],"fov":50}}'
// options: season 0..3, t (seconds; default f / fps), focus [x, z], people false (no stand-ins), marks true (anchors)
import * as THREE from "three";
import { preview } from "./common";
import { YARD_FILL, YARD_AO, buildYard, type Season } from "../sets/yard";

preview({ w: 540, h: 960, season: 0, focus: [0, 0] }, (c) => {
  const M = c.mats(YARD_FILL);
  const k = (c.opts.season ?? 0) as Season;
  const set = buildYard(M);
  c.scene.add(set.group, ...set.lights);
  set.setSeason(k); set.setFocus(c.opts.focus[0], c.opts.focus[1]);
  console.log(`QA: tris ${Math.round(set.group.userData.tris)} colliders ${set.colliders.length}`);
  if (c.opts.people !== false) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.36, 1.0), M.paint({ color: "#9a9ca4" }));
    block.position.set(0, 0.18, 0); block.castShadow = block.receiveShadow = true; c.scene.add(block);
    const man = (p: THREE.Vector3, col: string) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 6, 14), M.paint({ color: col })); body.position.y = 0.5;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 14), M.paint({ color: "#f6d9c2" })); head.position.y = 1.2;
      g.add(body, head); g.position.copy(p); g.traverse((o) => { o.castShadow = true; }); c.scene.add(g);
    };
    const A = set.anchors;
    [0, 3, 5, 6, 8, 11].forEach((i, n) => man(A.yardRing[i], ["#7d4fb0", "#c23b3b", "#d9a62e", "#3c3c46", "#8a5a2c", "#5f8f4a"][n]));
    man(new THREE.Vector3(0.9, 0, 0.9), "#3d7fd6");
    man(A.kay, "#c23b3b"); A.fieldCrowd.forEach((p, i) => man(p, ["#b98a3c", "#7a5a3c", "#6f8a4a", "#a8563a"][i % 4]));
    man(A.doorMark, "#3d7fd6"); man(A.portal, "#888888"); man(A.gateW, "#b98a3c"); man(A.gateE, "#6f8a4a");
  }
  if (c.opts.marks) {
    const mk = (p: THREE.Vector3, col: string) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: col })); m.position.copy(p); c.scene.add(m); };
    mk(set.anchors.door, "#ff00ff");
  }
  return {
    cam: { pos: [0, 1.35, 5.2], look: [0, 1.0, 0], fov: 50 }, ao: YARD_AO, bg: set.bg(k),
    frame: (i, t) => { set.animate(c.opts.t ?? t); },
  };
});
