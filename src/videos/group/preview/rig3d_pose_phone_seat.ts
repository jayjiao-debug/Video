// The phone, seated at a desk, in the right hand, a cap on: looking at it, raised to the ear, held, lowered (48 frames).
import { poseLab } from "./rig3d_poses_common";
poseLab({ who: [{ look: "class7", hat: { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" }, pose: "phone", arm: 0, seat: "desk", acc: ["phone"] }], frames: 48, run: true, raise: { start: 6, up: 12, hold: 12, down: 12 }, cam: { yaw: -25, pitch: 14, lookY: 0.74 } });
