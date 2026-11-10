import { rigLab } from "./rig3d_common";
// the researcher (glasses, long hair) turning on the spot: glasses, parting and streaks in motion
rigLab({ who: "rig", scene: "turn", w: 540, h: 960, frames: 61, t: 1, cam: { pos: [-1.2, 1.1, 2.3], look: [-1.2, 0.76, 0.2], fov: 46 }, turn: { look: "researcher", a0: 0, a1: 180, expr: "neutral" } });
