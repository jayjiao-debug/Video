// The command tent (sets/tent.ts) seen through the film's own World, from every tent camera of layout.ts CAMS and from
// close views of its dressing. One "frame" = one view, so several views render in one page:
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/set_tent.ts /home/user/hm_work/w/tent/cams --pick 0,1,2,3,4,5,6,7,8 --size 540x960
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/set_tent.ts out.png --size 540x960 --opts '{"views":["rack"],"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf"}'
// Options:
//   views   the list of view names; frame i shows views[i] (default: the nine tent cameras, VIEW_NAMES below lists all)
//   cast    false = nobody (default: the skeleton's blank banquet, shots/common.ts banquet; close views have nobody)
//   flap    0..1 over every view (default: the view's own; the tent cameras show it shut)
//   t       seconds for the flames (default 0)
//   push    0..1: the camera this far along the line from its position to its look point (to try a push-in)
//   view    { pos, look, fov }: one free camera instead of the list (the walls are culled for it as in the film)
// Prints  QA: view <i> <name> | hidden walls ... | tris
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CAMS, SEATS, DOOR, ROOM, type Cam } from "../layout";
import { banquet } from "../shots/common";
import { TENT } from "../sets";

type View = { cam: Cam; flap?: number; cast?: boolean };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): Cam => ({ pos, look, fov });
const T = SEATS.liu.table.at, K = TENT.rack, WN = TENT.wine.at, LP = TENT.lamps[0], S = TENT.screen, BN = TENT.banner;
const VIEWS: Record<string, View> = {
  // the film's tent cameras, the cast seated
  master: { cam: CAMS.master }, two: { cam: CAMS.two }, floor: { cam: CAMS.floor }, dance: { cam: CAMS.dance }, door: { cam: CAMS.door },
  jade: { cam: CAMS.jade }, jadeIn: { cam: CAMS.jadeIn }, xy: { cam: CAMS.xy }, smash: { cam: CAMS.smash },
  // the flap open from the cameras that see the door
  masterOpen: { cam: CAMS.master, flap: 1 }, doorOpen: { cam: CAMS.door, flap: 1 }, doorHalf: { cam: CAMS.door, flap: 0.5 }, danceOpen: { cam: CAMS.dance, flap: 1 },
  // close views of the dressing (nobody in the room)
  table: { cam: cm([T.x + 0.9, 1.15, T.z + 1.9], [T.x, 0.25, T.z - 0.15], 34), cast: false },
  ware: { cam: cm([T.x + 0.25, 0.75, T.z + 0.75], [T.x - 0.08, 0.36, T.z], 30), cast: false },
  lamp: { cam: cm([LP.x - 0.7, 1.2, LP.z + 3.3], [LP.x, 0.8, LP.z], 36), cast: false },
  rack: { cam: cm([(K.x0 + K.x1) / 2 + 0.8, 1.3, K.z1 + 3.3], [(K.x0 + K.x1) / 2 + 0.3, 1.1, K.z0], 40), cast: false },
  wine: { cam: cm([WN.x + 0.5, 0.8, WN.z + 1.5], [WN.x, 0.36, WN.z], 34), cast: false },
  flapShut: { cam: cm([DOOR.x + 0.5, 1.3, DOOR.z + 3.4], [DOOR.x, 1.05, DOOR.z], 40), flap: 0, cast: false },
  flapHalf: { cam: cm([DOOR.x + 0.5, 1.3, DOOR.z + 3.4], [DOOR.x, 1.05, DOOR.z], 40), flap: 0.5, cast: false },
  flapOpen: { cam: cm([DOOR.x + 0.5, 1.3, DOOR.z + 3.4], [DOOR.x, 1.05, DOOR.z], 40), flap: 1, cast: false },
  screen: { cam: cm([S.x - 3.6, 1.35, (S.z0 + S.z1) / 2 + 0.5], [S.x, 0.85, (S.z0 + S.z1) / 2], 40), cast: false },
  banner: { cam: cm([(BN.x0 + BN.x1) / 2 - 0.9, 1.5, ROOM.z0 + 3.2], [(BN.x0 + BN.x1) / 2 - 0.2, 1.35, ROOM.z0], 40), cast: false },
  seats: { cam: cm([0.4, 3.6, 3.4], [0.1, 0.0, -0.3], 50), cast: false },
  south: { cam: cm([-0.15, 1.5, 2.9], [-0.15, 1.25, ROOM.z0], 58), cast: false },
  west: { cam: cm([-2.6, 1.5, 0.4], [ROOM.x1, 1.1, 0.4], 58), cast: false },
};
export const VIEW_NAMES = Object.keys(VIEWS);
const DEFAULT = ["master", "two", "floor", "dance", "door", "jade", "jadeIn", "xy", "smash"];

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.view ? ["free"] : (o.views ?? DEFAULT);
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length];
    const v: View = o.view ? { cam: o.view as Cam } : VIEWS[name];
    if (!v) throw new Error(`set_tent: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    let cam = v.cam;
    if (o.push) { const k = +o.push; cam = { ...cam, pos: cam.pos.map((p, a) => p + (cam.look[a] - p) * k) as [number, number, number] }; }
    w.beginFrame(0);
    w.setPlace("tent"); w.setCamera(cam);
    if (o.cast !== false && v.cast !== false) banquet(w, 0);
    w.set.setFlap(o.flap ?? v.flap ?? 0);
    w.endFrame({ camera: cam, clock: +(o.t ?? 0) });
    const hidden: string[] = [];
    w.set.group.traverse((x) => { if (x.name.startsWith("tent.wall.") && (x as THREE.Group).isGroup && !x.visible) hidden.push(x.name.slice(10)); });
    console.log(`QA: view ${i} ${name} | hidden walls [${hidden.join(" ")}]`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
