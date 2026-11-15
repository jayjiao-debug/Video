// The road at dusk (sets/road.ts) through the film's own World: the two road cameras with the block-out staging of
// each shot (shots/common blockOut on the shot's first frame), the empty set, and close views. One "frame" = one view:
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_road.ts /home/user/wanbi_work/<wp>/ --pick 0,1 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_road.ts /home/user/wanbi_work/<wp>/g.png --size 540x960 --opts '{"views":["gate"]}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views   view names; frame i shows views[i] (default: the two cameras, VIEW_NAMES lists all)
//   cast    false = nobody in any view (the empty set)
//   push    0..1: the camera this far toward its look point
//   view    { pos, look, fov }: one free camera on the empty set instead of the list
// Prints  QA: view <i> <name> | sun shown: yes/no
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CAMS, ROAD_SET as S, type Cam, type CamName } from "../layout";
import { blockOut } from "../shots/common";
import { shot } from "../beats";
import type { Pose } from "../story";

type View = { cam: CamName | Cam; f?: number };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): Cam => ({ pos, look, fov });
const G = S.gate;
const VIEWS: Record<string, View> = {
  roadGate: { cam: "roadGate", f: shot("16a").from }, roadFar: { cam: "roadFar", f: shot("16b").from },
  emptyGate: { cam: "roadGate" }, emptyFar: { cam: "roadFar" },
  // close views: the gate, the whole place from high in front, the sky over the ridge
  gate: { cam: cm([G.x + 0.4, 1.4, 1.6], [G.x, 1.2, S.wall.z], 50) },
  place: { cam: cm([80.5, 4.0, 9.0], [80.5, 0.6, -6.0], 55) },
  sky: { cam: cm([80.5, 1.6, 3.0], [80.0, 3.0, -60], 50) },
};
export const VIEW_NAMES = Object.keys(VIEWS);
const DEFAULT = ["roadGate", "roadFar"];

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.view ? ["free"] : (o.views ?? DEFAULT);
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length];
    const v: View = o.view ? { cam: o.view as Cam } : VIEWS[name];
    if (!v) throw new Error(`set_road: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    let cam: Cam = typeof v.cam === "string" ? CAMS[v.cam] : v.cam;
    if (o.push) { const k = +o.push; cam = { ...cam, pos: cam.pos.map((p, a) => p + (cam.look[a] - p) * k) as [number, number, number] }; }
    let P: Pose;
    if (v.f !== undefined && o.cast !== false) {
      w.beginFrame(v.f); P = blockOut(w, v.f);
      if (o.push) { w.setCamera(cam); P = { ...P, camera: cam }; }
    } else { w.beginFrame(0); w.setPlace("road"); w.setCamera(cam); P = { camera: cam }; }
    w.endFrame(P);
    let sun = false;
    w.set.group.traverse((x) => { if (x.name === "road.sky.sun") sun = (x as THREE.Group).visible; });
    console.log(`QA: view ${i} ${name}${P.slate ? ` [${P.slate}]` : ""} | sun shown: ${sun ? "yes" : "no"}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
