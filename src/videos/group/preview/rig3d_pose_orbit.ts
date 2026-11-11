// A full turn of the camera round a seated figure (hands on the lap), in 72 frames (5 degrees a frame).
// --opts '{"who":[{"look":"you","pose":"desk","seat":"desk"}]}' = the same round a figure at a desk.
import { poseLab } from "./rig3d_poses_common";
poseLab({ who: [{ look: "you", pose: "sit", seat: "chair" }], frames: 72, orbit: [0, 360], cam: { pitch: 14, lookY: 0.72 } });
