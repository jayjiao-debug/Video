import { rigLab } from "./rig3d_common";
// the capped teammate turning on the spot (brown side-swept hair under a cap): hat seams, hairline ink and streaks in motion
rigLab({ who: "rig", scene: "turn", w: 540, h: 960, frames: 61, t: 1, cam: { pos: [-1.2, 1.1, 2.3], look: [-1.2, 0.76, 0.2], fov: 46 }, turn: { look: "mate", a0: 0, a1: 180, expr: "smug", hat: { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" } } });
