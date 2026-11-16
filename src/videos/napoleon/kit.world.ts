// The Napoleon film's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md):
//   bash scripts/kit/qa/clearance/run.sh --film napoleon
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEG as SA } from "./shots/segA";
import { SEG as SB } from "./shots/segB";
import { SEG as SC } from "./shots/segC";
import { SEG as SD } from "./shots/segD";
import { SEG as SE } from "./shots/segE";
import { SEG as SF } from "./shots/segF";
import { SEG as SG } from "./shots/segG";
import { W, H } from "./story";

const SEGS = [SA, SB, SC, SD, SE, SF, SG];
const hooks: FilmHooks<World> = {
  film: "napoleon",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: SEGS,
  shotAt: (f) => (SEGS.find((s) => f >= s.from && f <= s.to) ?? SG).id,
  rigNames: (w) => {
    const W_ = w as any, byId = new Map<number, string>(), out = new Map<unknown, string>();
    for (const [p, id] of W_.ids as Map<any, number>) byId.set(id, p.name);
    for (const [k, r] of W_.rigs as Map<string, any>) { const [id, key] = k.split("|"); out.set(r, byId.get(Number(id)) + (key ? ":" + key : "")); }
    return out;
  },
  /** not solid: sky, glows, lights, flames, shadows, snow, smoke, haze, the sea */
  skipName: /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|shadow|outside|shaft|dust|smoke|haze|snow|sea|fire)(\.|$)|^glow$|^far$|^sky$/,
  out: "/home/user/napoleon_work/qa/clearance",
};
export default hooks;
