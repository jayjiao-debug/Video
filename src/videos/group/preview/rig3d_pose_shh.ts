// A finger to the lips ("shh", with finger() and the expression "hush"): raised over 10 frames, held, lowered, while
// the camera goes round. A bare head, a cap, and long hair seated at a desk (40 frames).
import { poseLab } from "./rig3d_poses_common";
poseLab({
  who: [
    { look: "you", pose: "shh", acc: ["finger"], expr: "hush" },
    { look: "class7", hat: { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" }, pose: "shh", acc: ["finger"], expr: "hush" },
    { look: "friend4", pose: "shh", acc: ["finger"], expr: "hush", seat: "desk" },
  ],
  frames: 40, run: true, raise: { start: 4, up: 10, hold: 14, down: 10 }, orbit: [-60, 60], w: 1100, h: 700,
});
