// Segment D · f1353-1812 · S11b, S12-S15 (sky -> dorm dawn, REV_LOCK), hand-offs H3 in / H4 out. Builder D owns this file.
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
// PLACEHOLDER (engine): the sky joint fades off f1355-1372 onto the dorm at dawn from the storyboard's REV_LOCK
// (w.dorm.cams.REV_LOCK), YOU asleep in your bunk. Replace with S11b-S15.
import type { Segment } from "../story";
import { FPS, lin, smooth } from "../story";
import { LOOK } from "../world";
import type { Figure } from "../kit/cast";
import { getInputProps } from "remotion";
import { enterProbe, exitProbe, poseProbe } from "./segD_probe";
const PROBE = !!(getInputProps() as { dprobe?: boolean }).dprobe;

let you: Figure | null = null;
export const SEG: Segment = {
  id: "D", from: 1353, to: 1812,
  enter(w) { if (PROBE) { enterProbe(w); return; } you = w.dorm.actors.acquire(LOOK.you); },
  exit(w) { if (PROBE) exitProbe(w); if (you) w.dorm.actors.release(you); you = null; w.dorm.set.setLight("evening"); },
  pose(w, f) {
    if (PROBE) return poseProbe(w, f);
    const D = w.dorm, t = f / FPS, cam = D.cams.REV_LOCK;
    w.setCamera(cam);
    D.set.setLight("dawn"); D.set.animate(t);
    const yb = D.A.youBunk;
    you!.set({ bed: { top: yb.top }, facing: yb.facing, pose: { kind: "curl", amount: 0.2, t, blanket: "#ffd666" }, expr: "sleep", blink: 1, clampYaw: 0.3 });
    D.update(t);
    return { scene: "dorm", camera: cam, sky: 1 - smooth(lin(f, 1355, 1372)) };
  },
};
