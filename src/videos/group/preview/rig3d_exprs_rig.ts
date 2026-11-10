import { rigLab } from "./rig3d_common";
// one head, close: frame i = expression i (the order of EXPRS below); rig3d_frames.sh <this> <out> 23 480 480
export const EXPRS = ["neutral", "smile", "happy", "grin", "laugh", "smile_closed", "relief", "relief_open", "smug", "deadpan", "focus", "stern", "huff", "sad", "sigh", "nervous", "shock", "dazed", "pained", "wince", "whistle", "lick", "sleep"] as const;
rigLab({ who: "rig", scene: "turn", w: 480, h: 480, t: 1, frames: EXPRS.length, cam: { pos: [-1.2, 1.2, 2.25], look: [-1.2, 1.2, 0.2], fov: 17 }, turn: { look: "you", a0: 0, a1: 0, pose: "idle", exprs: [...EXPRS] } });
