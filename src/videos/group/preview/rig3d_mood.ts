// A change of expression, cut and acted out, side by side (rigMood in kit/rig3d.ts): the same character twice, going
// through the same nine faces at the same moments. On the left the faces are simply exchanged on their frames (what
// the films did); on the right every change is acted out. 236 frames at 30 a second, a bust shot from in front.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_mood.ts outdir --frames 236
// Other characters and faces: --opts '{"who":[{"look":"friend3"},{"look":"friend3"}]}'
import { poseLab, type PoseWho } from "./rig3d_poses_common";
const keys: NonNullable<PoseWho["mood"]>["keys"] = [
  [0, "neutral"], [0.9, "smile"], [1.7, "shock"], [2.6, "nervous"], [3.5, "sad"], [4.5, "stern"], [5.3, "laugh"], [6.2, "smug"], [7.0, "neutral"],
];
poseLab({
  who: [
    { look: "you", pose: "idle", x: -0.36, mood: { keys, cut: true, idle: [70, 95] } },
    { look: "you", pose: "idle", x: 0.36, mood: { keys, idle: [70, 95] } },
  ],
  frames: 236, run: true,
  cam: { yaw: 0, pitch: 3, dist: 1.75, lookY: 1.12, fov: 30 }, w: 1100, h: 620,
});
