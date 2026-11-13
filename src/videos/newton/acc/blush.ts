// THE BLUSH of the Qin film (PLAN 2; bible 5.2: "skin-only blush with adjustable strength", the core of the 傲娇).
//   blush(k)    a skin-only blush, k 0..1: two soft pink radial ellipses on the cheeks under the eyes, drawn ON the
//               face (Acc.face, slot "cheek") behind the face's own lines, exactly where the rig draws its own blush
//               (group/kit/rig3d.ts F.blush: x +-20.5u, y +9.6u under the eye line), a little wider as k grows.
//               Peak alpha = k: BLUSH.light 0.45 (EMPEROR_BLUSH1), BLUSH.strong 0.9 (EMPEROR_BLUSH2).
// It is part of the face drawing (cached per figure by its key), so it cannot fade frame by frame: a rising blush is a
// SWAP of figures with the same Look (people.ts EMPEROR -> EMPEROR_BLUSH1 -> EMPEROR_BLUSH2), each swap hidden under a
// blink (shots/common.ts swapTo + lid). people.ts emperorAt(f, keys) gives the figure of a frame; the notes on which
// level goes where are in people.ts ("BLUSH SWAPS").
// Rules (group/kit/RIG3D.md, Acc / FaceKit): units u = 1 % of the head's width from the middle of the eye line, y down;
// nothing random; nothing 3D. The rig's expressions smile_closed / relief draw their own blush (F.blush): on those
// faces this one adds to it, so give smile_closed with BLUSH1 at most.
import type { Acc } from "../../group/kit/rig3d";

/** the two strengths the film uses (PLAN 2): light = pleased / flattered, strong = flustered */
export const BLUSH = { light: 0.45, strong: 0.9 } as const;
/** the blush's pink (the rig's own: rgb 238 118 140) */
const PINK = [238, 118, 140] as const;

/** a skin-only blush, k 0..1 (peak alpha); see the head of this file. Slot "cheek"; hide it by swapping figures. */
export const blush = (k: number): Acc => {
  const a = Math.max(0, Math.min(1, k)), rgb = PINK.join(",");
  return {
    name: "blush", slots: ["cheek"], key: `qinBlush|${a.toFixed(3)}`,
    face(fk) {
      const g = fk.g, u = fk.u, r = (6.8 + 2.4 * a) * u;
      for (const s of [-1, 1]) {
        const [bx, by] = fk.px(s * 20.5, 9.8), gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
        gr.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`);
        gr.addColorStop(0.5, `rgba(${rgb},${(0.62 * a).toFixed(3)})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        // behind the face's lines (the eyes, the brows, a beard drawn over the chin stay on top), squashed to an ellipse
        g.save(); g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.6);
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
      }
    },
  };
};
