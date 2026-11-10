import { rigLab } from "./rig3d_common";
import { ACC_SETS } from "../kit/rigacc/catalog";
// one person turning on the spot at film scale (540 x 960), wearing accessories from the catalogue; what is worn is
// given on the command line. Count the single-pixel specks of its frames with scripts/rig3d/specks.py (RIG3D.md):
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_acc_turn.ts outdir --frames 61 --opts '{"turn":{"look":"you","set":["headset","suit"]}}'
rigLab({
  who: "rig", scene: "turn", w: 540, h: 960, frames: 61, t: 1, cam: { pos: [-1.2, 1.1, 2.3], look: [-1.2, 0.76, 0.2], fov: 46 },
  turn: { look: "you", a0: 0, a1: 180, expr: "smile" }, accSets: ACC_SETS,
});
