import type { Acc } from "../rig3d";
import { turned } from "./shapes";

/** A takeaway coffee cup held in one hand: a white cup that tapers down, a brown sleeve round it, a dark lid (the
 *  office worker, the student up late). hand 0 = the person's right. Sizes in metres. */
export const coffeeCup = (o: { hand?: 0 | 1; col?: string; sleeve?: string; lid?: string } = {}): Acc => {
  const hand = o.hand ?? 0, col = o.col ?? "#fbfaf6", sleeve = o.sleeve ?? "#9a6a40", lid = o.lid ?? "#3c3a46";
  return {
    name: "coffeeCup", slots: [hand ? "hand1" : "hand0"], key: `${col}|${sleeve}|${lid}|${hand}`,
    build(b) {
      // the cup's origin is its bottom centre; the hand holds it at the sleeve's middle (about 0.05 up). The cup is
      // on the hand's outer side and a little forward: the hand shows on the body's side of it. (On the inner side it
      // went 16 mm into the hip of a wide build as the arm swings in a walk: acc_check, "held".)
      const g = b.held(hand, { offset: [hand ? 0.03 : -0.03, -0.05, 0.02] });
      const H = 0.1, rb = 0.024, rt = 0.036, rAt = (y: number) => rb + ((rt - rb) * y) / H;
      // the cup: solid, narrower at the bottom
      b.solid(g, turned([[0, 0], [rb, 0], [rt, H], [0, H]], 0.003, 32), { col });
      // the sleeve: a solid brown frustum round the middle, a little wider than the cup under it
      const y0 = 0.034, y1 = 0.07, gap = 0.0035;
      b.solid(g, turned([[0, y0], [rAt(y0) + gap, y0], [rAt(y1) + gap, y1], [0, y1]], 0.003, 32), { col: sleeve });
      // the lid: a low dome with a rim, sitting on the top edge
      b.solid(g, turned([[0, H - 0.002], [rt + 0.004, H - 0.002], [rt + 0.005, H + 0.01], [rt - 0.008, H + 0.02], [0, H + 0.02]], 0.003, 32), { col: lid });
    },
  };
};
