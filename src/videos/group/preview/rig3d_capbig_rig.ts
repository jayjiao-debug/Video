import { rigLab } from "./rig3d_common";
// the capped teammate turning on the spot at 2160x3840, for pixel-level checks of the hat (one frame at a time:
// bash rig3d_pick.sh preview/rig3d_capbig_rig.ts outdir 2160 3840 4 6)
rigLab({ who: "rig", scene: "turn", w: 2160, h: 3840, frames: 61, t: 1, cam: { pos: [-1.2, 1.1, 2.3], look: [-1.2, 0.76, 0.2], fov: 46 }, turn: { look: "mate", a0: 0, a1: 180, expr: "smug", hat: { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" } } });
