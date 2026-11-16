// Shared core of the film previews (a copy of Wanbi's, WP1): runs the real World and the given segments through the
// preview harness (the 3D picture only: no HUD, no overlays, no captions, no lens blur / bloom / grade; the place's
// background and AO are applied per frame, as the film does).
//   film.ts                all nine segments         --opts '{"f":120}'  or  --pick 0,15,30   (ABSOLUTE film frames)
//   filmA.ts .. filmI.ts   ONE segment only (the other eight are not even imported, so a half-written sibling cannot
//                          break your stills): frames outside it show a blank card
// Options: f (the frame of a single still), cam (override the PICTURE's camera: the figures stay solved for the
// shot's own camera), font, ink / ao: false, raw: true.
// Prints once:             QA: BEATS ok   (or one line per problem of beats.ts beatCheck())
// Prints per new frame:    QA: f<frame> seg <id> <place> [<slate>] ok
//                     or:  QA: f<frame> seg <id> <place> [<slate>] | #<figure> <pose> reach r clear c   for figures whose
// pinned hands do not arrive (reach > 0.012) or whose arms pass through the body (clear < -0.0005).
import { preview } from "./common";
import { World } from "../world";
import { SEGMENTS, type Pose, type Segment } from "../story";
import { beatCheck } from "../beats";

/** a segment that is not given: the yard's background from a camera that looks at nothing (far off every island) */
const blank = (id: string, from: number, to: number): Segment => ({
  id, from, to, enter() {}, exit() {},
  pose(w) { const cam = { pos: [-100, 1.4, 5.6] as [number, number, number], look: [-100, 1.0, 0] as [number, number, number], fov: 45 }; w.setPlace("yard"); w.setCamera(cam); return { camera: cam, slate: `segment ${id} is not in this preview` }; },
});
export function runFilm(given: Segment[]) {
  preview({ w: 540, h: 960 }, (c) => {
    const w = new World(c.renderer, c.camera);
    c.scene.add(w.root);
    const bad = beatCheck();
    console.log(bad.length ? bad.map((m) => `QA: BEATS ${m}`).join("\n") : "QA: BEATS ok");
    const SEGS: Segment[] = SEGMENTS.map((s) => {
      const g = given.find((x) => x.id === s.id);
      if (!g) return blank(s.id, s.from, s.to);
      if (g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} }`);
      return g;
    });
    let cur: Segment | null = null, P: Pose | null = null, last = -1;
    const pose = (f: number) => {
      const s = SEGS.find((g) => f >= g.from && f <= g.to) ?? (f < 0 ? SEGS[0] : SEGS[SEGS.length - 1]);
      if (s !== cur) { cur?.exit(w); s.enter(w); cur = s; }
      w.beginFrame(f); P = s.pose(w, f); w.endFrame(P);
      if (f !== last) {
        last = f;
        const bad = w.rc.figures.map((r, k) => ({ r, k })).filter(({ r }) => r.group.visible && (r.qa.reach > 0.012 || r.qa.clear < -0.0005));
        const head = `QA: f${f} seg ${s.id} ${w.place}${P.slate ? ` [${P.slate}]` : ""}`;
        console.log(bad.length ? `${head} | ` + bad.map(({ r, k }) => `#${k} ${r.state.pose.kind} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`).join("  ") : `${head} ok`);
      }
    };
    return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => P?.post?.bg ?? w.look().bg };
  });
}
