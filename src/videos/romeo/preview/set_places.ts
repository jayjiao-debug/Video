// THE EIGHT PLACES through the film's own World, from places.ts STAGE: each place's named cameras with the cast standing
// on the place's marks (the first spot whose name starts with romeo / juliet / friar). One "frame" = one view:
//   bash scripts/kit/queue/still.sh src/videos/romeo/preview/set_places.ts /home/user/romeo_work/sets/x.png --size 540x960 \
//     --opts '{"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf","w":540,"h":960,"views":["grove.open"]}'
//   (several views: an out DIRECTORY and --pick 0,1,2 with "views":[...three names...])
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views   "<place>.<camera>" names (default: every camera of every place, VIEW_NAMES)
//   cast    false = nobody;  who  { romeo: "<spot>", juliet: "<spot>", friar: "<spot>" } to pick other marks ("" = leave out)
//   params  { name: value } for set.param;  t  seconds for the place's animate
import * as THREE from "three";
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import { ROMEO, JULIET, FRIAR, type Person } from "../people";
import { standing } from "../shots/common";
import { PLACES, STAGE, ISLAND, type Place, type CamSpot, type Spot } from "../places";
import type { ParamValue } from "../sets";

type View = { place: Place; cam: CamSpot };
const VIEWS: Record<string, View> = {};
for (const place of PLACES) for (const [k, cam] of Object.entries(STAGE[place].cams)) VIEWS[`${place}.${k}`] = { place, cam: cam as CamSpot };
export const VIEW_NAMES = Object.keys(VIEWS);
const WHO: [string, Person][] = [["romeo", ROMEO], ["juliet", JULIET], ["friar", FRIAR]];

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`set_places: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    const t = typeof o.t === "number" ? o.t : 0, f = Math.round(t * 30), x0 = ISLAND[v.place];
    w.beginFrame(f);
    w.setPlace(v.place);
    for (const [k, val] of Object.entries((o.params ?? {}) as Record<string, ParamValue>)) w.set.param(k, val);
    const cam = { pos: [x0 + v.cam.pos[0], v.cam.pos[1], v.cam.pos[2]] as [number, number, number], look: [x0 + v.cam.look[0], v.cam.look[1], v.cam.look[2]] as [number, number, number], fov: v.cam.fov, roll: (v.cam as { roll?: number }).roll };
    w.setCamera(cam);
    let qa = "";
    if (o.cast !== false) {
      const spots = STAGE[v.place].spots as Record<string, Spot>;
      for (const [who, person] of WHO) {
        const want: string | undefined = o.who?.[who];
        if (want === "") continue;
        const key = want ?? Object.keys(spots).find((s) => s.startsWith(who));
        if (!key || !spots[key]) continue;
        const s = spots[key], at = new THREE.Vector3(x0 + s.at[0], s.at[1], s.at[2]);
        const r = w.actor(person);
        r.set(standing(at, s.facing, f, 1));
        qa += ` | ${who}@${key}`;
      }
    }
    w.update();
    w.endFrame({ camera: cam, clock: t });
    console.log(`QA: view ${i} ${name} | place ${v.place}${qa}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
