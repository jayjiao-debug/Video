// The Zhao court (sets/zhao.ts) through the film's own World: the six Zhao cameras with the block-out staging of each
// shot (shots/common blockOut on the shot's first frame: exactly its placed list on the layout marks), the empty set
// from the wide cameras, and close views of the dressing. One "frame" = one view (frame i of the page = views[i]):
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_zhao.ts /home/user/wanbi_work/<wp>/ --pick 0,1,2,3,4,5 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_zhao.ts /home/user/wanbi_work/<wp>/w.png --size 540x960 --opts '{"views":["window"]}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views   view names; frame i shows views[i] (default: the six cameras, VIEW_NAMES lists all)
//   cast    false = nobody in any view (the empty set)
//   push    0..1: the camera this far toward its look point (to try a push-in)
//   view    { pos, look, fov }: one free camera on the empty set instead of the list
// Prints  QA: view <i> <name> | hidden walls [...]   (and the block-out's slate)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CAMS, ZHAO_SET as S, type Cam, type CamName } from "../layout";
import { blockOut } from "../shots/common";
import { shot } from "../beats";
import type { Pose } from "../story";

type View = { cam: CamName | Cam; f?: number };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): Cam => ({ pos, look, fov });
const Wn = S.window, Sc = S.screen;
const VIEWS: Record<string, View> = {
  // the film's cameras with the shot's block-out staging (the shot's first frame; zhaoKing = shot 3's last)
  zhaoThrone: { cam: "zhaoThrone", f: shot("3").from }, zhaoKing: { cam: "zhaoKing", f: shot("3").to },
  zhaoWide: { cam: "zhaoWide", f: shot("5a").from }, zhaoPush: { cam: "zhaoPush", f: shot("5b").from },
  zhaoLin: { cam: "zhaoLin", f: shot("6").from }, zhaoCrown: { cam: "zhaoCrown", f: shot("23b").from },
  // the empty set from the wide cameras
  emptyWide: { cam: "zhaoWide" }, emptyCrown: { cam: "zhaoCrown" }, emptyThrone: { cam: "zhaoThrone" },
  // close views of the dressing
  window: { cam: cm([(Wn.x0 + Wn.x1) / 2 - 0.3, 1.55, -2.6], [(Wn.x0 + Wn.x1) / 2, 1.5, S.floor.z0], 40) },
  screen: { cam: cm([40.0, 1.3, -1.2], [40.0, 1.1, Sc.z], 50) },
  dais: { cam: cm([41.6, 1.2, -1.6], [40.0, 0.25, -3.9], 42) },
  room: { cam: cm([40.2, 3.0, 3.6], [40.2, 0.6, -2.5], 60) },
};
export const VIEW_NAMES = Object.keys(VIEWS);
const DEFAULT = ["zhaoThrone", "zhaoKing", "zhaoWide", "zhaoPush", "zhaoLin", "zhaoCrown"];

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.view ? ["free"] : (o.views ?? DEFAULT);
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length];
    const v: View = o.view ? { cam: o.view as Cam } : VIEWS[name];
    if (!v) throw new Error(`set_zhao: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    let cam: Cam = typeof v.cam === "string" ? CAMS[v.cam] : v.cam;
    if (o.push) { const k = +o.push; cam = { ...cam, pos: cam.pos.map((p, a) => p + (cam.look[a] - p) * k) as [number, number, number] }; }
    let P: Pose;
    if (v.f !== undefined && o.cast !== false) {
      w.beginFrame(v.f); P = blockOut(w, v.f);
      if (o.push) { w.setCamera(cam); P = { ...P, camera: cam }; }
    } else { w.beginFrame(0); w.setPlace("zhao"); w.setCamera(cam); P = { camera: cam }; }
    w.endFrame(P);
    const hidden: string[] = [];
    w.set.group.traverse((x) => { if (x.name.startsWith("zhao.wall") && (x as THREE.Group).isGroup && !x.visible) hidden.push(x.name.slice(9)); });
    console.log(`QA: view ${i} ${name}${P.slate ? ` [${P.slate}]` : ""} | hidden walls [${hidden.join(" ")}]`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
