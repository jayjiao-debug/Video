// overlay/freeze.ts: THE FREEZE (shared kit; src/kit/overlay/README.md). The picture stops while an overlay speaks: the
// lead's intro card, a frozen aside. A freeze is planned in the script as a gap in the voice track, and the picture
// holds for that gap. This file is only the arithmetic; what is drawn over the frozen picture is the film's own.
//
//   const CLOCK = clock([{ at: 412, frames: 39 }]);       // the picture stops ON film frame 412 and holds 39 more
//   const z = CLOCK.at(f);                                 // { i, t, n, k } while frozen (t = 0 on frame 412), else null
//
// Two ways to drive the picture; a film uses ONE of them:
//   HOLD   the film's beats are all in film frames and the voice track already has the gap:
//            P = SEG.pose(w, CLOCK.hold(f))               // frame 412 through the gap, f otherwise
//          The action after the gap must start from the held pose (nothing may move across the gap).
//   SHIFT  the shots are written on the picture's own clock (world frames) and the freeze is inserted:
//            P = SEG.pose(w, CLOCK.world(f))              // the freezes taken out
//          CLOCK.film(w) turns a world beat into the film frame that shows it (for a caption or a sound that follows a
//          gesture), and CLOCK.total(worldTotal) is the film's length.
//          With SHIFT the freezes are usually known on the picture's clock ("stop on world frame 412"): worldClock()
//          takes them that way.
import { clamp } from "./time";

export type Freeze = { /** the film frame the picture stops ON */ at: number; /** how many more frames it holds */ frames: number };
/** where film frame f is inside a freeze: the freeze's index, t frames since the picture stopped (0 on `at`), its
 *  length n, and k = t / n */
export type FreezeAt = { i: number; t: number; n: number; k: number };

export const clock = (freezes: readonly Freeze[]) => {
  const fz = [...freezes].sort((a, b) => a.at - b.at);
  fz.forEach((z, i) => {
    if (!(z.frames >= 0) || !Number.isInteger(z.at) || !Number.isInteger(z.frames)) throw new Error(`freeze ${i}: at and frames are whole frames`);
    if (i > 0 && z.at <= fz[i - 1].at + fz[i - 1].frames) throw new Error(`freeze ${i} (frame ${z.at}) starts inside the freeze before it`);
  });
  const held = (f: number) => fz.reduce((s, z) => s + clamp(f - z.at, 0, z.frames), 0);
  return {
    freezes: fz,
    /** the freeze film frame f is in, or null */
    at: (f: number): FreezeAt | null => {
      const i = fz.findIndex((z) => f >= z.at && f <= z.at + z.frames);
      return i < 0 ? null : { i, t: f - fz[i].at, n: fz[i].frames, k: fz[i].frames ? (f - fz[i].at) / fz[i].frames : 1 };
    },
    /** HOLD: the frame to pose the picture at when the voice track already has the gap */
    hold: (f: number) => { const z = fz.find((q) => f > q.at && f <= q.at + q.frames); return z ? z.at : f; },
    /** SHIFT: film frame -> the picture's own frame (the freezes taken out) */
    world: (f: number) => f - held(f),
    /** SHIFT: the picture's frame -> the first film frame that shows it */
    film: (w: number) => { let shift = 0; for (const z of fz) { if (w > z.at - shift) shift += z.frames; else break; } return w + shift; },
    /** SHIFT: the film's length for a picture of `worldTotal` frames */
    total: (worldTotal: number) => worldTotal + fz.reduce((s, z) => s + z.frames, 0),
  };
};
/** SHIFT, with the freezes given on the PICTURE's clock: `at` = the world frame the picture stops on. The same clock;
 *  each freeze is moved later by the freezes before it. */
export const worldClock = (freezes: readonly Freeze[]) => {
  let before = 0;
  return clock([...freezes].sort((a, b) => a.at - b.at).map((z) => { const at = z.at + before; before += z.frames; return { at, frames: z.frames }; }));
};
