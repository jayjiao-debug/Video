// THE WHOLE FILM's 3D picture through the preview harness (the World and the nine segments as the film runs them;
// the harness draws N8AO and the ink, not the film's lens blur, bloom and grade). Frames are absolute film frames:
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/film.ts /home/user/mona_work/<dir>/ --pick 0,15,30 --size 540x960
// The cut lays the film's own HUD, captions and overlays (Remotion with the input prop ovonly) over these pictures.
// Prints per frame: QA: f<frame> seg <id> [<slate>] ok, or the figures whose pinned hands miss or whose arms pass
// through the body.
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import type { Pose, Segment } from "../story";
import { SEGS } from "../shots/segs";

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  let cur: Segment | null = null, P: Pose | null = null, last = -1;
  const pose = (f: number) => {
    const s = SEGS.find((g) => f >= g.from && f <= g.to) ?? (f < 0 ? SEGS[0] : SEGS[SEGS.length - 1]);
    if (s !== cur) { cur?.exit(w); s.enter(w); cur = s; }
    w.beginFrame(f); P = s.pose(w, f); w.endFrame(P);
    if (f !== last) {
      last = f;
      const bad = w.rc.figures.map((r, k) => ({ r, k })).filter(({ r }) => r.group.visible && (r.qa.reach > 0.012 || r.qa.clear < -0.0005));
      const head = `QA: f${f} seg ${s.id}${P.slate ? ` [${P.slate}]` : ""}`;
      console.log(bad.length ? `${head} | ` + bad.map(({ r, k }) => `#${k} ${r.state.pose.kind} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`).join("  ") : `${head} ok`);
    }
  };
  return { cam: null, frame: (i: number) => pose(i), ao: () => w.look().ao, bg: () => P?.post?.bg ?? w.look().bg };
});
