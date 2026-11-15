// The Wanbi film's code hooks for the shared tools (src/kit/film/contract.ts FilmHooks; KIT.md). The clearance checker
// (scripts/kit/qa/clearance) imports this through a generated entry: bash scripts/kit/qa/clearance/run.sh --film wanbi
// A copy of Hongmen's (WP1b); the seeds are the Wanbi film's own (BUILD_PLAN WP1b).
import type { FilmHooks } from "../../kit/film/contract";
import { World } from "./world";
import { SEG as SA } from "./shots/segA";
import { SEG as SB } from "./shots/segB";
import { SEG as SC } from "./shots/segC";
import { SEG as SD } from "./shots/segD";
import { SEG as SE } from "./shots/segE";
import { shotAt } from "./beats";
import { HALL, HALL_SET } from "./layout";
import { QIN_WANG } from "./people";
import { W, H } from "./story";

const hooks: FilmHooks<World> = {
  film: "wanbi",
  W, H,
  makeWorld: (canvas, camera) => new World(canvas, camera),
  segments: [SA, SB, SC, SD, SE],
  shotAt: (f) => shotAt(f).id,
  /** "lin", "qinGuard:2" ...: the person's name (+ the rig's key) from the World's private tables */
  rigNames: (w) => {
    const W_ = w as any, byId = new Map<number, string>(), out = new Map<unknown, string>();
    for (const [p, id] of W_.ids as Map<any, number>) byId.set(id, p.name);
    for (const [k, r] of W_.rigs as Map<string, any>) { const [id, key] = k.split("|"); out.set(r, byId.get(Number(id)) + (key ? ":" + key : "")); }
    return out;
  },
  // Each seed only where it is in frame (the checker skips what is outside the frustum), on a keyed instance of the
  // prop so that the film's own prop is untouched.
  seeds: (w, f, log) => {
    if (w.place !== "hall") return;
    const king = w.actor(QIN_WANG), shown = king.group.visible && king.state.visible !== false;
    // W1. the jade through the King of Qin's head (the disc's centre on the head's centre)
    if (shown) {
      const hd = king.headWorld();
      if (w.project(hd).on) { w.prop("jade", "seedHead").put(hd, { rot: king.state.facing ?? 0 }); log(`f${f}: jade:seedHead centred on the King of Qin's head (expect prop-fig jade x head, about 22 cm: the head's radius less the disc's hole)`); }
    }
    // W2. the jade standing 8 cm above the EMPTY 榻's cushion (nobody holds it, nothing under it)
    const C = HALL_SET.cushion;
    if ((!shown || !king.state.seat) && w.project([C.x, C.top, C.z]).on) {
      w.prop("jade", "seedPad").put([C.x, C.top + 0.08, C.z], { grip: "rim" });
      log(`f${f}: jade:seedPad 8.0 cm above the empty 榻 cushion (expect float 8 cm)`);
    }
    // W3. the cauldron 5 cm into the floor at its mark (only while the film's own cauldron is not there)
    const c = HALL.cauldron;
    if (!w.prop("cauldron").group.visible && w.project([c.x, 0.3, c.z]).on) {
      w.prop("cauldron", "seed").put([c.x, -0.05, c.z]);
      log(`f${f}: cauldron:seed 5.0 cm into the floor at HALL.cauldron (expect floor 5 cm)`);
    }
  },
  out: "/home/user/wanbi_work/qa/clearance",
};
export default hooks;
