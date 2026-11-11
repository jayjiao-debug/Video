// Shared core of the film previews: runs the real World and the given segments through the preview harness (the 3D
// picture only: no overlays, no captions, no lens blur / bloom / grade).
//   film.ts        all five segments           --opts '{"f":120}'  or  --pick 0,15,30   (absolute film frames)
//   filmA.ts .. filmE.ts   ONE segment only (the other four are not even imported, so a half-written sibling cannot
//                  break your stills). Frames are still ABSOLUTE film frames.
// Options: f (the frame of a single still), cam (override the picture's camera: the figures are still solved for the
// segment's own camera).
// Prints "QA: f<frame> seg <id> | #<figure> <pose> reach r clear c" for figures whose pinned hands do not arrive
// (reach > 0.012) or whose arms pass through the body (clear < -0.0005), and "QA: f<frame> ok" otherwise.
import * as THREE from "three";
import { preview, type Cam } from "./common";
import { World } from "../world";
import { SEGMENTS, type Pose, type Segment, type V3Like } from "../story";
import { YARD_AO } from "../sets/yard";

const arr = (v: V3Like): [number, number, number] => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
const blank = (id: string, from: number, to: number): Segment => ({
  id, from, to, enter() {}, exit() {},
  pose(w) { const cam = { pos: [0.2, 1.4, 5.6] as [number, number, number], look: [0, 1.0, 0] as [number, number, number], fov: 45 }; w.setCamera(cam); return { camera: cam }; },
});
export function runFilm(given: Segment[]) {
  preview({ w: 540, h: 960 }, (c) => {
    const w = new World(c.renderer, c.camera);
    c.scene.add(w.root);
    const SEGS: Segment[] = SEGMENTS.map((s) => {
      const g = given.find((x) => x.id === s.id);
      if (!g) return blank(s.id, s.from, s.to);
      if (g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} }`);
      return g;
    });
    let cur: Segment | null = null, P: Pose | null = null, last = -1;
    const bg = new THREE.Color();
    const pose = (i: number) => {
      const f = i;
      const s = SEGS.find((g) => f >= g.from && f <= g.to) ?? SEGS[SEGS.length - 1];
      if (s !== cur) { cur?.exit(w); s.enter(w); cur = s; }
      w.beginFrame(f); P = s.pose(w, f); w.endFrame(P);
      c.scene.background = bg.set(w.bg());
      if (f !== last) {
        last = f;
        const bad = w.rc.figures.map((r, k) => ({ r, k })).filter(({ r }) => r.group.visible && (r.qa.reach > 0.012 || r.qa.clear < -0.0005));
        console.log(bad.length ? `QA: f${f} seg ${s.id} | ` + bad.map(({ r, k }) => `#${k} ${r.state.pose.kind} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`).join("  ") : `QA: f${f} ok`);
      }
      const k = P.camera;
      return { pos: arr(k.pos), look: arr(k.look), fov: k.fov, near: k.near, far: k.far } as Cam;
    };
    return { cam: (i) => pose(i), ao: YARD_AO, bg: "#bfe3f7" };
  });
}
