// A try-out (2026-11-11): new faces. A few people side by side (at most two or three: a wider row is stretched at
// its ends), each with a face.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_emotes_try.ts out.png --opts '{"faces":[["speechless",0],["gloom",0]]}'
// faces = [expression, unused] per person.
import { poseLab } from "./rig3d_poses_common";
import { YOU } from "../kit/cast";
import type { Expr } from "../kit/toon";
const o = JSON.parse(decodeURIComponent(location.hash.slice(1)) || "{}") as { faces?: [Expr, number][] };
const faces = o.faces ?? [["speechless", 0], ["gloom", 0]], n = faces.length, gap = 0.74, W = 370 * n, H = 470;
location.hash = "";
poseLab({
  who: faces.map(([expr], k) => ({ look: YOU, expr, pose: "idle", x: (k - (n - 1) / 2) * gap })),
  cam: { yaw: 0, pitch: 2, dist: 2.05, lookY: 1.2, fov: 30 }, w: W, h: H,
});
