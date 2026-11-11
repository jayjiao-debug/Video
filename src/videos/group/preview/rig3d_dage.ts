import { rigLab } from "./rig3d_common";
import { DAGE, dage } from "../kit/rigacc/dage";
// 大哥, the cameo figure: front, three quarters, side and back beside a standard figure (YOU), for the design sheet.
// (He turns to his right here: his left hand is the one at his lips, and from behind his right shoulder that arm
// cannot come round his jaw. See kit/rigacc/dage.ts.)
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_dage.ts outdir --pick 0
const who = (facing: number) => ({ look: DAGE, acc: dage(), expr: "hush" as never, pose: "shh" as never, facing });
rigLab({
  who: "rig", scene: "lineup", w: 1280, h: 800, frames: 1, t: 1,
  // the camera stands outside the room and looks in through the wall (near)
  cam: { pos: [-1.2, 1.0, 5.0], look: [-1.2, 0.8, 0.2], fov: 26, near: 2.9 } as never,
  lineup: { gap: 0.62, who: [who(0), who(-40), who(-90), who(180), { look: "you", expr: "smile", facing: 0 }] },
});
