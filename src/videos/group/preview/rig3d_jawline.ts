// "Not a word. Look at the jaw." (rigJawline in kit/rig3d.ts): 大哥 raises a finger to his lips, holds it, turns his head
// away and runs the finger from under the ear down the jawline to the chin, then lowers the hand. 112 frames at 30 a
// second, a bust shot from in front.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_jawline.ts outdir --frames 112
// Other characters: --opts '{"who":[{"dage":false,"look":"friend3","acc":["finger0"]}]}'
import { poseLab } from "./rig3d_poses_common";
poseLab({
  who: [{ dage: true, pose: "shh", arm: 0, jawline: { start: 12 } }],
  frames: 112, run: true, raise: { start: 2, up: 9, hold: 91, down: 9 },
  cam: { yaw: 0, pitch: 3, dist: 1.3, lookY: 1.14, fov: 30 }, w: 720, h: 900,
});
