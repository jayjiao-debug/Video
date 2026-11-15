// THE SIX NEW PLACES (sets/corridor.ts ... sets/museum.ts, WP2) through the film's own World: each place's named
// cameras (layout/<place>.ts <PLACE>_CAMS) with the EMPEROR standing on the place's stand-in mark, the dressing set by
// the view (set.param). One "frame" = one view, so several views render in one page:
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/set_places.ts /home/user/qin_work/wp2/ --pick 0,1 --size 540x960 --opts '{"views":["corridor.creep","corridor.peek"]}'
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/set_places.ts /home/user/qin_work/wp2/x.png --size 540x960 --opts '{"views":["table.over"],"params":{"tableau":"taishan","rain":1}}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views    "<place>.<camera>" names; frame i shows views[i % n] (default: every camera of every place, VIEW_NAMES)
//   cast     false = nobody (the empty set);  at  [x, y, z] / facing: the EMPEROR elsewhere than the place's stand mark
//   params   { name: value } set on every view after the view's own dressing;  t  seconds for the place's animate
//   props    false = the road without WP3's props (default: the closed carriage at ROAD.carriage, curtain `open`, and
//            the fish cart at ROAD.fishCart, as the shots will put them)
// Prints  QA: view <i> <name> | place <p> | params ... | rig reach / clear
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { STAND, type Cam } from "../layout";
import { CORRIDOR_CAMS } from "../layout/corridor";
import { TERRACE_CAMS } from "../layout/terrace";
import { TABLE_CAMS } from "../layout/table";
import { NIGHT_CAMS } from "../layout/night";
import { ROAD_CAMS } from "../layout/road";
import { MUSEUM_CAMS } from "../layout/museum";
import { ROAD } from "../layout/road";
import { PEOPLE } from "../people";
import { standing } from "../shots/common";
import type { Place } from "../story";
import type { ParamValue } from "../sets";

type View = { place: Place; cam: Cam; params?: Record<string, ParamValue>; emperor?: boolean };
const VIEWS: Record<string, View> = {};
const add = (place: Place, cams: Record<string, Cam>, extra: Record<string, Partial<View>> = {}) => {
  for (const [k, cam] of Object.entries(cams)) VIEWS[`${place}.${k}`] = { place, cam, ...(extra[k] ?? {}) };
};
add("corridor", CORRIDOR_CAMS);
add("terrace", TERRACE_CAMS);
add("table", TABLE_CAMS);
add("night", NIGHT_CAMS);
add("road", ROAD_CAMS);
add("museum", MUSEUM_CAMS);
export const VIEW_NAMES = Object.keys(VIEWS);

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`set_places: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    const t = typeof o.t === "number" ? o.t : 0, f = Math.round(t * 30);
    w.beginFrame(f);
    w.setPlace(v.place);
    const params = { ...(v.params ?? {}), ...(o.params ?? {}) } as Record<string, ParamValue>;
    for (const [k, val] of Object.entries(params)) w.set.param(k, val);
    w.setCamera(v.cam);
    if (v.place === "road" && o.props !== false) {
      w.prop("bigCarriage").put(ROAD.carriage, { open: typeof o.open === "number" ? o.open : 0 });
      w.prop("fishCart").put(ROAD.fishCart, { on: true });
    }
    let qa = "";
    if (o.cast !== false && v.emperor !== false) {
      const S = STAND[v.place], at = o.at ? new THREE.Vector3(o.at[0], o.at[1], o.at[2]) : S.emperor.clone();
      const r = w.actor(PEOPLE.emperor);
      r.set(standing(at, typeof o.facing === "number" ? o.facing : S.facing, f, 1));
      w.update();
      qa = ` | reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`;
    } else w.update();
    w.endFrame({ camera: v.cam, clock: t });
    console.log(`QA: view ${i} ${name} | place ${v.place} | params ${JSON.stringify(params)}${qa}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
