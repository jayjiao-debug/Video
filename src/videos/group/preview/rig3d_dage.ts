import { rigLab } from "./rig3d_common";
import { DAGE, dage } from "../kit/rigacc/dage";
// 大哥, the cameo figure: front, three quarters, side and back beside a standard figure (YOU), for the design sheet.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_dage.ts outdir --pick 0
rigLab({
  who: "rig", scene: "lineup", w: 1280, h: 800, frames: 1, t: 1,
  // the camera stands outside the room and looks in through the wall (near)
  cam: { pos: [-1.2, 1.0, 5.0], look: [-1.2, 0.8, 0.2], fov: 26, near: 2.9 } as never,
  lineup: {
    gap: 0.62,
    who: [
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 0 },
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 40 },
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 90 },
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 180 },
      { look: "you", expr: "smile", facing: 0 },
    ],
  },
});
