// 采访月老的一天's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film yuelao
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEGS } from "./Film";
import { W, H, segmentAt } from "./story";

const hooks: FilmHooks<World> = {
  film: "yuelao",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: SEGS,
  shotAt: (f) => String((segmentAt(f) as { id?: string } | null)?.id ?? "?"),
  rigNames: (w) => new Map((w as unknown as { names: Map<unknown, string> }).names),
  skipName: /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|halo|pool|shadow|outside|shaft|sunbeam|beam|dust|motes?|steam|smoke|haze|mist|moon|stars?|card|cards|tracer|fire|dark|glass|neon|crowd|board|sackback)(\.|$)|^glow$|^far$|^sky$|(Shaft|Beam|Pool|Halo|Glow|Mist|Dust)s?(\.|#|\[|$)/,
  out: "/home/user/yuelao_work/film/qa/clearance",
};
export default hooks;
