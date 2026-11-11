// Writing at a desk (the pen in the right hand): 48 frames of strokes, camera front left and a little above.
import { poseLab } from "./rig3d_poses_common";
poseLab({ who: [{ look: "friend0", pose: "write", seat: "desk", acc: ["pen"] }], frames: 48, run: true, cam: { yaw: 35, pitch: 20, lookY: 0.74 } });
