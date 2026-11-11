// Four people in a row, one pose each: writing at a desk, a call on a chair (a cap on), sitting at a desk, looking at a
// phone standing. Seen from the front left, a little above. A still; with --frames N and --opts '{"views":[[yaw,pitch],...]}'
// the same row from other angles.
import { poseLab } from "./rig3d_poses_common";
poseLab({
  who: [
    { look: "friend0", pose: "write", seat: "desk", acc: ["pen"], x: -1.05 },
    { look: "class7", hat: { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" }, pose: "phone", amount: 1, seat: "chair", acc: ["phone"], x: -0.1 },
    { look: "researcher", pose: "desk", seat: "desk", x: 0.85 },
    { look: "you", pose: "phone", amount: 0, acc: ["phone"], x: 1.75 },
  ],
  cam: { yaw: -40, pitch: 18, dist: 3.4, lookY: 0.7 },
});
