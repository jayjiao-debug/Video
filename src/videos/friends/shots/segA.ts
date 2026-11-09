// Segment A · f0-535 · S01-S04 (dorm evening -> classroom day), hand-off out H1. Builder A owns this file.
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
// S01-S02 (dorm, f0-224) live in shots/segA_dorm.ts, S03-S04 (classroom, f225-535, hand-off H1) in shots/segA_class.ts,
// the hero rating sheet (printed headers + the ink written in S04, shared with segment B for H1) in shots/segA_sheet.ts.
// Set dbg: true in the input props to log projections and the 穿模 checks on the key frames.
import type { Segment } from "../story";
import { enterDorm, exitDorm, poseDorm } from "./segA_dorm";
import { enterClass, exitClass, poseClass } from "./segA_class";

export const SEG: Segment = {
  id: "A", from: 0, to: 535,
  enter(w) { enterDorm(w); enterClass(w); },
  exit(w) { exitDorm(w); exitClass(w); },
  pose(w, f) {
    if (f <= 224) return poseDorm(w, f);
    return poseClass(w, f);
  },
};
