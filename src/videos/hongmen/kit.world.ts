// Hongmen's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// (scripts/kit/qa/clearance) imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film hongmen
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEG as SA } from "./shots/segA";
import { SEG as SB } from "./shots/segB";
import { SEG as SC } from "./shots/segC";
import { SEG as SD } from "./shots/segD";
import { SEG as SE } from "./shots/segE";
import { shotAt } from "./beats";
import { SEATS } from "./layout";
import { W, H } from "./story";

const hooks: FilmHooks<World> = {
  film: "hongmen",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: [SA, SB, SC, SD, SE],
  shotAt: (f) => shotAt(f).id,
  /** "liu", "guard:2" ...: the person's name (+ the rig's key) from the World's private tables */
  rigNames: (w) => {
    const W_ = w as any, byId = new Map<number, string>(), out = new Map<unknown, string>();
    for (const [p, id] of W_.ids as Map<any, number>) byId.set(id, p.name);
    for (const [k, r] of W_.rigs as Map<string, any>) { const [id, key] = k.split("|"); out.set(r, byId.get(Number(id)) + (key ? ":" + key : "")); }
    return out;
  },
  seeds: (w, f, log) => {
    if (w.place === "tent") {
      // S4. a cup floating 8 cm over Liu Bang's table; S5. the pork leg through the middle of Fan Kuai's table top
      const c = SEATS.liu.cup; w.prop("cup:liu").put([c.x, c.y + 0.08, c.z]); log(`f${f}: cup:liu 8.0 cm above Liu Bang's table (expect float 8 cm)`);
      // S2. the wine vessel standing 5 cm into the floor beside Liu Bang's table
      const c2 = SEATS.liu.table.at; w.prop("wineJar").put([c2.x + 0.5, -0.05, c2.z]); log(`f${f}: wineJar 5.0 cm into the floor (expect floor 5 cm)`);
      const t = SEATS.fankuai.table.at; w.prop("pigLeg").put([t.x, 0.32, t.z]); log(`f${f}: pigLeg centred on Fan Kuai's table top (expect prop-set: the 4 cm slab passes through the 21 cm thick leg: several cm)`);
    }
  },
  out: "/home/user/hm_work/qa/clearance",
};
export default hooks;
