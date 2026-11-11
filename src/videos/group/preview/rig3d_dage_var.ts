import { rigLab } from "./rig3d_common";
import { DAGE, dage } from "../kit/rigacc/dage";
// 大哥 close up, front and three quarters (pass --opts '{"mask":true}' for the same figures alone on magenta: with
// the two pictures a cut-out of him can be made, the colours from the one and the edge from the other)
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_dage_var.ts outdir --pick 0
rigLab({
  who: "rig", scene: "lineup", w: 1200, h: 1200, frames: 1, t: 1,
  cam: { pos: [-1.2, 0.85, 5.0], look: [-1.2, 0.76, 0.2], fov: 19, near: 2.9 } as never,
  lineup: {
    gap: 0.72,
    who: [
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 0 },
      { look: DAGE, acc: dage(), expr: "cool" as never, facing: 35 },
    ],
  },
});
