import { rigLab } from "./rig3d_common";
import { ACC_SETS } from "../kit/rigacc/catalog";
// a row of people with accessories from the catalogue; give the row on the command line:
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_acc_row.ts out.png --opts '{"lineup":{"who":[{"look":"you","set":"gradCap"},{"look":"friend1","set":["chefHat","moustache.curl"]}]}}'
// with --frames N and lineup.sweep [a0, a1] the whole row turns
rigLab({
  who: "rig", scene: "lineup", w: 1280, h: 720, t: 1, cam: { pos: [-1.2, 1.2, 2.5], look: [-1.2, 0.82, 0.2], fov: 50 },
  lineup: { gap: 0.6, who: [{ look: "you" }] }, accSets: ACC_SETS,
});
