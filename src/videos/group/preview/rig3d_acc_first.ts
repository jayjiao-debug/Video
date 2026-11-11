import { rigLab } from "./rig3d_common";
import { glasses, moustache, topHat, headphones, tie, backpack, briefcase } from "../kit/rigacc";
// the first accessories, one per kind of part, side by side
rigLab({
  who: "rig", scene: "lineup", w: 1280, h: 720, t: 1, cam: { pos: [-1.2, 1.2, 2.5], look: [-1.2, 0.82, 0.2], fov: 50 },
  lineup: { gap: 0.6, who: [
    { look: "you", acc: [glasses({ kind: "round" }), backpack()], facing: -25 },
    { look: "friend3", acc: [topHat(), moustache({ kind: "curl" })], expr: "smug", facing: 15 },
    { look: "friend5", acc: [glasses({ kind: "shades" }), headphones()], expr: "smile", facing: 20 },
    { look: "worker", acc: [tie({ suit: "#2f3f66" }), briefcase(), moustache({ kind: "walrus" })], expr: "neutral", facing: -20 },
    { look: "friend0", acc: [headphones({ mic: true, col: "#3f6fb5" }), tie({ col: "#3f6b8f", stripe: "#e8b340" })], expr: "grin", facing: 30 },
    { look: "friend1", acc: [topHat({ bowler: true, col: "#4a4a55" }), glasses({ kind: "square" }), moustache({ kind: "handlebar" })], expr: "happy", facing: -10 },
  ] },
});
