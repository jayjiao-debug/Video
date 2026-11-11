// Sitting at a desk, forearms on the desk top: seen from the seven check angles, at eye height and from above.
import { poseLab, POSE_VIEWS } from "./rig3d_poses_common";
poseLab({ who: [{ look: "researcher", pose: "desk", seat: "desk" }], frames: POSE_VIEWS.length, views: POSE_VIEWS, cam: { lookY: 0.72 } });
