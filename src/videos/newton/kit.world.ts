// The Newton film's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// (scripts/kit/qa/clearance) imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film newton
// A copy of Qin's (WP1). No film-specific seeds yet (the checker's generic ones run); the segment builders may add
// seeds here through requests.md once the real props stand on their marks.
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEG as SA } from "./shots/segA";
import { SEG as SB } from "./shots/segB";
import { SEG as SC } from "./shots/segC";
import { SEG as SD } from "./shots/segD";
import { SEG as SE } from "./shots/segE";
import { SEG as SF } from "./shots/segF";
import { SEG as SG } from "./shots/segG";
import { shotAt } from "./beats";
import { W, H } from "./story";

const hooks: FilmHooks<World> = {
  film: "newton",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: [SA, SB, SC, SD, SE, SF, SG],
  shotAt: (f) => shotAt(f).id,
  /** "newton", "humphrey:2" ...: the person's name (+ the rig's key) from the World's private tables */
  rigNames: (w) => {
    const W_ = w as any, byId = new Map<number, string>(), out = new Map<unknown, string>();
    for (const [p, id] of W_.ids as Map<any, number>) byId.set(id, p.name);
    for (const [k, r] of W_.rigs as Map<string, any>) { const [id, key] = k.split("|"); out.set(r, byId.get(Number(id)) + (key ? ":" + key : "")); }
    return out;
  },
  /** the checker's default skip list (ink hulls, sky, glows, lights, flames, shadows ...) plus this film's light
   *  volumes, which are not solid: the sun shafts, dust motes, steam, smoke, haze. (Her fist, props hand / handR, is
   *  NOT skipped although it closes round what she holds: the contact is what keeps the mic, the board and the
   *  handkerchief "supported" for the float check. So prop:mic x prop:hand, prop:board x prop:hand / handR and
   *  prop:handkerchief x prop:handR at <= 2.5 cm are EXPECTED reports: README 12.) */
  skipName: /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|shadow|outside|shaft|sunbeam|dust|motes?|steam|smoke|haze)(\.|$)|^glow$|^far$|^sky$/,
  out: "/home/user/newton_work/film/qa/clearance",
};
export default hooks;
