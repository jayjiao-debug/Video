// THE EIGHT PLACES (sets/market.ts ... sets/temple.ts: WP1's block-outs, WP2a / WP2b's real sets) through the film's
// own World: each place's named cameras (layout/<place>.ts <PLACE>_CAMS, all in layout.ts CAMS) with the SU stand-in
// standing on the place's stand-in mark (layout.ts STAND), the dressing set by the view (set.param). One "frame" = one
// view, so several views render in one page:
//   bash scripts/kit/queue/still.sh src/videos/libai/preview/set_places.ts /home/user/libai_work/wp2a/ --pick 0,1 --size 540x960 --opts '{"views":["market.walk","market.stall"]}'
//   bash scripts/kit/queue/still.sh src/videos/libai/preview/set_places.ts /home/user/libai_work/wp2a/x.png --size 540x960 --opts '{"views":["yard.land"],"params":{"lantern":1,"sun":"noon"}}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views    "<place>.<camera>" names, or "<place>.stand" (the stand-in camera); frame i shows views[i % n] (default:
//            every camera of every place, VIEW_NAMES)
//   cast     false = nobody (the empty set);  at  [x, y, z] / facing: SU elsewhere than the place's stand mark
//   params   { name: value } set on every view after the view's own dressing;  t  seconds for the place's animate
// Prints  QA: view <i> <name> | place <p> | params ... | rig reach / clear
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { STAND, CAMS, type Cam } from "../layout";
import { LI as SU } from "../people";
import { standing } from "../shots/common";
import { PLACES, type Place } from "../story";
import type { ParamValue } from "../sets";

type View = { place: Place; cam: Cam; params?: Record<string, ParamValue>; cast?: boolean };
const VIEWS: Record<string, View> = {};
/** the dressing a view shows by default (the scene it is for) */
const DRESS: Partial<Record<string, Record<string, ParamValue>>> = {
  "yard.bed": { sun: "noon", lantern: 1, shells: 1 }, "yard.shells": { sun: "noon", lantern: 1, shells: 1 }, "yard.gate": { sun: "afternoon", lantern: 1 },
  "huangzhou.pot": { vignette: "pot" }, "huangzhou.potClose": { vignette: "pot" }, "huangzhou.lid": { vignette: "pot", lid: 1, steam: 0.25 }, "huangzhou.pork": { vignette: "pot", lid: 1, steam: 0.25 },
  "pines.stand": { glow: 1 }, "pines.stop": { glow: 1 }, "pines.push": { glow: 1 }, "pines.close": { glow: 1 }, "pines.reveal": { glow: 1 }, "pines.wide": { glow: 1 },
};
for (const place of PLACES) {
  VIEWS[`${place}.stand`] = { place, cam: STAND[place].cam, params: DRESS[`${place}.stand`] };
  for (const [k, cam] of Object.entries(CAMS[place])) VIEWS[`${place}.${k}`] = { place, cam, params: DRESS[`${place}.${k}`] };
}
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
    let qa = "";
    if (o.cast !== false && v.cast !== false) {
      const S = STAND[v.place], at = o.at ? new THREE.Vector3(o.at[0], o.at[1], o.at[2]) : S.su.clone();
      const r = w.actor(SU);
      r.set(standing(at, typeof o.facing === "number" ? o.facing : S.facing, f, 1));
      w.update();
      qa = ` | reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`;
    } else w.update();
    w.endFrame({ camera: v.cam, clock: t });
    console.log(`QA: view ${i} ${name} | place ${v.place} | params ${JSON.stringify(params)}${qa}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
