// 采访蒙娜丽莎的一天's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// (scripts/kit/qa/clearance) imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film mona
// Until the shots exist the "segments" are THE SCENE WALK: every scene of scenes.ts held for a few frames, so that the
// checker sees every room with its cast in place. When shots/segX.ts exist they take the walk's place here.
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { W, H } from "./frame";
import { SCENES, SCENE_KEYS, poseScene } from "./scenes";

/** frames a scene is held for in the walk */
export const HOLD = 4;
const segments = SCENE_KEYS.map((k, i) => ({ id: k, from: i * HOLD, to: i * HOLD + HOLD - 1, enter() {}, exit() {}, pose: (w: World, f: number) => ({ camera: poseScene(w, SCENES[k], (f - i * HOLD) / 30) }) }));
const hooks: FilmHooks<World> = {
  film: "mona",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments,
  shotAt: (f) => SCENE_KEYS[Math.min(SCENE_KEYS.length - 1, Math.floor(f / HOLD))],
  rigNames: (w) => new Map((w as unknown as { names: Map<unknown, string> }).names),
  /** the checker's default skip list plus this film's light and paint: shafts, dust, pools, halos, painted cards, the
   *  night sheet */
  skipName: /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|halo|pool|shadow|outside|shaft|dust|card|cloth|night)(\.|$)|^glow$|^far$|^sky$/,
  out: "/home/user/mona_work/qa/clearance",
};
export default hooks;
