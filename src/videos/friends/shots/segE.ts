// Segment E · f1813-2285 · S16-S19 + end card (dorm dawn -> evening, exterior night), hand-off H4 in. Builder E owns this file.
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
// PLACEHOLDER (engine): the dorm from the storyboard's DESK_SIDE (= END_FRAME), YOU at your desk; the end card
// (kit EndCard) builds from f2226 in `top` (above the captions). Replace with S16-S19.
import type { Segment } from "../story";
import { FPS, h } from "../story";
import { LOOK } from "../world";
import type { Figure } from "../kit/cast";
import { lidAt } from "../kit/cast";
import { EndCard } from "../kit/overlay";

let you: Figure | null = null;
export const SEG: Segment = {
  id: "E", from: 1813, to: 2285,
  enter(w) { you = w.dorm.actors.acquire(LOOK.you); },
  exit(w) { if (you) w.dorm.actors.release(you); you = null; },
  pose(w, f) {
    const D = w.dorm, t = f / FPS, cam = D.cams.DESK_SIDE;
    w.setCamera(cam);
    D.set.setLight("evening"); D.set.animate(t);
    const yd = D.A.youDesk;
    you!.set({ seat: { top: yd.seat, deskEdge: yd.deskEdge, deskTop: yd.deskTop }, facing: yd.facing, pose: { kind: "phone", t, base: "seat" }, expr: "smile", blink: lidAt(t, 1) });
    D.update(t);
    return { scene: "dorm", camera: cam, top: f >= 2226 ? h(EndCard, { at: 2226 }) : undefined };
  },
};
