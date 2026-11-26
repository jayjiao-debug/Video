// FILM FRAMES of 采访月老的一天, the 3D picture only (no HUD, no overlays): each page = one film frame through the
// film's own segments.   bash scripts/kit/queue/still.sh src/videos/yuelao/preview/frames.ts <out dir> --pick 0,1,2 \
//   --size 540x960 --opts '{"font":"<abs>/public/bt/sans700.ttf","frames":[30,400,820]}'
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import { SEGS } from "../Film";

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const frames: number[] = Array.isArray(c.opts.frames) ? c.opts.frames : [0];
  const pose = (i: number) => {
    const f = frames[((i % frames.length) + frames.length) % frames.length], s = SEGS.find((x) => f >= x.from && f <= x.to) ?? SEGS[0];
    w.beginFrame(f); const P = s.pose(w, f); w.endFrame(P);
    console.log(`QA: frame ${f} scene ${s.id}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
