import * as THREE from "three";
import type { Acc } from "../rig3d";
import { roundBox, shade } from "./shapes";

/** A briefcase hanging from one hand (the office worker, the salesman, the lawyer). hand 0 = the person's right. It
 *  hangs (held hang): that arm stays down, and a wave or a point goes to the other arm. */
export const briefcase = (o: { col?: string; hand?: 0 | 1 } = {}): Acc => {
  const col = o.col ?? "#7a5236", hand = o.hand ?? 0;
  return {
    name: "briefcase", slots: [hand ? "hand1" : "hand0"], key: `${col}|${hand}`,
    build(b) {
      // carried broadside: its flat face to the front (seen end on, as a real one hangs, it is a narrow slab that
      // nobody reads as a briefcase). The hand is on the handle; the case's inner end stays clear of the legs
      const g = b.held(hand, { offset: [hand ? 0.02 : -0.02, -0.142, 0], rot: [0, Math.PI / 2, 0], hang: true });
      b.solid(g, roundBox(0.085, 0.2, 0.27, 0.3), { col });
      const handle = b.solid(g, new THREE.TorusGeometry(0.036, 0.009, 8, 18, Math.PI), { col: shade(col, 0.55), ink: 0.004 });
      handle.rotation.y = Math.PI / 2; handle.position.set(0, 0.098, 0);
      // (the clasps stand 7 mm clear of the case's face: a part that is only a few millimetres proud of what it lies on
      //  loses single pixels to it as the case turns)
      for (const s of [-1, 1]) b.solid(g, roundBox(0.099, 0.03, 0.03, 0.4), { col: "#d9b45a", ink: 0.003 }).position.set(0, 0.07, s * 0.082);
    },
  };
};
