// Segment C · f1013-1352 · S09, S10, S11a (classroom, ceiling off -> sky), hand-offs H2 in / H3 out. Builder C owns this file.
//
// ---------------------------------------------------------------------------------------------- segment interface
// (copied from story.ts "HOW TO BUILD A SEGMENT"; read that section in full)
//   export const SEG: Segment = { id, from, to, enter(w), exit(w), pose(w, f) }       from / to = SEGMENTS (checked)
//   engine per frame f:  on a segment change: old.exit(w); w.reset(); SEG.enter(w)
//                        w.beginFrame(f); P = SEG.pose(w, f); w.endFrame(P); draw 3D, P.overlays, caption, P.top
//   enter(w)  acquire pooled figures / ropes (w.dorm.actors.acquire(LOOK.you), w.dorm.ropes.acquire({ score })),
//             build your own cached things once (module-level, guarded)
//   exit(w)   release everything you acquired, restore every shared thing you changed
//   pose(w, f) -> Pose: a PURE function of f (any frame can be the first one of a page). Order:
//             a. w.setCamera(cam) FIRST   b. set state (light, windows, ceiling, animate)   c. fig.set({...}) for every
//             figure, crowd.state   d. w.dorm.update() / w.classroom.update() (+ re-aim, update again for two-person
//             ropes)   e. rope.update({...}) every frame   f. overlays from w.project(p) with h(...)
//             g. return { scene: "dorm" | "classroom" | "sky" | "phone2d", camera: cam, overlays?, top?, post?, sky?, captions? }
//   post: { dof: { focus, amount }, bloom, grade, gradeAmount, ink, ao }; omit for the set's defaults.
//   No Math.random / Date / wall time; no per-frame geometry builds except rope / ghost updates.
// -----------------------------------------------------------------------------------------------------------------
//
// PLACEHOLDER (engine): the classroom from the set's top72 camera (S09's TOP intent) with the ceiling lifted off and
// the 775-rope web (w.classroom.web, built once per page for this FIXED camera; the crowd takes the web's holdState so
// the drawn hands sit on the rope ends), gold + grey ropes revealed over f1013-1060; then the H3 joint: the SKY_H3
// gradient fades over the picture f1336-1350 and holds as scene "sky" to f1352. Replace with S09-S11a.
import type { Segment, CamPose } from "../story";
import { FPS, lin, smooth } from "../story";
import type { WebKit } from "../world";

let kit: WebKit | null = null;
const TOP = (w: Parameters<Segment["pose"]>[0]) => w.classroom.set.cams.top72 as CamPose;

export const SEG: Segment = {
  id: "C", from: 1013, to: 1352,
  enter(w) { kit = w.classroom.web("C-top72", TOP(w)); },
  exit(w) { w.classroom.set.setCeilingOpen(0); if (kit) kit.web.mesh.visible = false; kit = null; },
  pose(w, f) {
    const C = w.classroom, t = f / FPS, cam = TOP(w);
    w.setCamera(cam);
    C.set.setCeilingOpen(smooth(lin(f, 1013, 1040)));
    C.set.animate(t);
    C.crowd.state = kit!.holdState;
    const rev = smooth(lin(f, 1013, 1060));
    kit!.web.set({ gold: rev, grey: rev });
    kit!.web.mesh.visible = true;
    C.update(t);
    if (f > 1350) return { scene: "sky", camera: cam };
    return { scene: "classroom", camera: cam, sky: smooth(lin(f, 1336, 1350)) };
  },
};
