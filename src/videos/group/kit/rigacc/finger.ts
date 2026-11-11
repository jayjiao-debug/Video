import * as THREE from "three";
import { LIMB_COL } from "../rig3d";
import type { Acc } from "../rig3d";

/** A raised forefinger on one hand (hand 1 = the person's left, the default): a short round stick in the hand's own
 *  colour that grows out of the middle of the hand ball. The "shh" pose knows it (PartKit.held, `posed`): the hand
 *  comes up under the mouth and the finger stands across the lips (len = its length from the hand's centre, in
 *  metres; the default reaches from under the mouth to where a nose would be, on any head).
 *  In every other pose it points down from the hand: leave it out of those frames with state.hide = ["finger"]. */
export const finger = (o: { hand?: 0 | 1; len?: number; col?: string } = {}): Acc => {
  const hand = o.hand ?? 1, col = o.col ?? LIMB_COL;
  return {
    name: "finger", slots: [hand ? "hand1" : "hand0"], key: `${hand}|${o.len ?? ""}|${col}`,
    build(b) {
      const g = b.held(hand, { posed: true, rot: [Math.PI, 0, 0] });
      const r = 0.42 * b.handR, L = o.len ?? 0.26 * b.R + b.handR;
      b.solid(g, new THREE.CapsuleGeometry(r, L - 2 * r, 6, 14), { col, ink: 0.0037 }).position.set(0, L / 2, 0);
    },
  };
};
