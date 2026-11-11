// Sitting on a chair without a desk, hands on the lap: seen from the seven check angles, at eye height and from above.
import { poseLab, POSE_VIEWS } from "./rig3d_poses_common";
poseLab({ who: [{ look: "you", pose: "sit", seat: "chair" }], frames: POSE_VIEWS.length, views: POSE_VIEWS, cam: { lookY: 0.72 } });
