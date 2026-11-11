import { rigLab } from "./rig3d_common";
import { hardHat, chefHat, gradCap, peakedCap, labCoat, glasses, moustache } from "../kit/rigacc";
// the second batch of accessories: more hats, a coat drawn on the clothes
rigLab({
  who: "rig", scene: "lineup", w: 1280, h: 720, t: 1, cam: { pos: [-1.2, 1.2, 2.5], look: [-1.2, 0.82, 0.2], fov: 50 },
  lineup: { gap: 0.6, who: [
    { look: "worker", acc: [hardHat()], facing: -25 },
    { look: "friend1", acc: [chefHat(), moustache({ kind: "curl" })], expr: "happy", facing: 15 },
    { look: "you", acc: [gradCap()], expr: "smile", facing: 20 },
    { look: "friend3", acc: [peakedCap()], expr: "neutral", facing: -20 },
    { look: "researcher", acc: [labCoat(), glasses({ kind: "round" })], expr: "smug", facing: 25 },
    { look: "friend2", acc: [labCoat({ stethoscope: true }), peakedCap({ col: "#f4f2ec", band: "#22242e" })], expr: "grin", facing: -10 },
  ] },
});
