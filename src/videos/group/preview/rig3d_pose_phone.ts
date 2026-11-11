// The phone, standing: looking at it, raised to the ear over 12 frames, held, lowered (48 frames).
import { poseLab } from "./rig3d_poses_common";
poseLab({ who: [{ look: "friend4", pose: "phone", acc: ["phone"] }], frames: 48, run: true, raise: { start: 6, up: 12, hold: 12, down: 12 }, cam: { yaw: 20 } });
