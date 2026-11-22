// 采访罗密欧与朱丽叶's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// (scripts/kit/qa/clearance) imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film romeo
// Modelled on Newton's. The figures' names come from the DayWorld's own table (World.names).
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEG as SA } from "./shots/segA";
import { SEG as SB } from "./shots/segB";
import { SEG as SC } from "./shots/segC";
import { SEG as SD } from "./shots/segD";
import { SEG as SE } from "./shots/segE";
import { SEG as SF } from "./shots/segF";
import { SEG as SG } from "./shots/segG";
import { SEG as SH } from "./shots/segH";
import { SEG as SI } from "./shots/segI";
import { W, H, segmentAt } from "./story";

const hooks: FilmHooks<World> = {
  film: "romeo",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: [SA, SB, SC, SD, SE, SF, SG, SH, SI],
  shotAt: (f) => String((segmentAt(f) as { id?: string } | null)?.id ?? "?"),
  /** "romeo", "friarVial" ...: the person's name (+ the rig's key) from the World's own table */
  rigNames: (w) => new Map((w as unknown as { names: Map<unknown, string> }).names),
  /** the checker's default skip list plus this film's light volumes and paint: sun shafts, dust, mist, moon and stars,
   *  flames and their halos, light pools, painted cards */
  skipName: /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|halo|pool|shadow|outside|shaft|sunbeam|beam|dust|motes?|steam|smoke|haze|mist|moon|stars?|card|cards)(\.|$)|^glow$|^far$|^sky$|(Shaft|Beam|Pool|Halo|Glow|Mist|Dust)s?(\.|#|\[|$)/,
  out: "/home/user/romeo_work/film/qa/clearance",
};
export default hooks;
