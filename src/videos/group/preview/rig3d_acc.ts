import { rigLab } from "./rig3d_common";
import { ACC_SETS } from "../kit/rigacc/catalog";
// one person with accessories from the catalogue, turning from the front to the back in 61 frames:
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_acc.ts out --pick 0,24,60 --opts '{"turn":{"set":"topHat","look":"friend3"}}'
rigLab({ who: "rig", scene: "turn", w: 540, h: 960, frames: 61, t: 1, cam: { pos: [-1.2, 1.1, 2.3], look: [-1.2, 0.76, 0.2], fov: 46 }, turn: { look: "you", a0: 0, a1: 180 }, accSets: ACC_SETS });
