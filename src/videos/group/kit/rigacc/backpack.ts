import * as THREE from "three";
import type { Acc } from "../rig3d";
import { roundBox, shade } from "./shapes";

/** A backpack: a soft pack on the back and two straps drawn over the shoulders (the student, the hiker, the tourist). */
export const backpack = (o: { col?: string; pocket?: string } = {}): Acc => {
  const col = o.col ?? "#e8b340", pocket = o.pocket ?? shade(col, 0.82);
  return {
    name: "backpack", slots: ["back"], key: `${col}|${pocket}`,
    outfit(c) {
      // straps: over each shoulder and down the front to the side seam
      for (const s of [-1, 1]) c.line([c.P(s * 30, 1), c.P(s * 33, 0.62), c.P(s * 44, 0.3), c.P(s * 70, 0.22)], c.shade(col, 0.36), 26);
      for (const s of [-1, 1]) c.line([c.P(s * 30, 1), c.P(s * 33, 0.62), c.P(s * 44, 0.3), c.P(s * 70, 0.22)], shade(col, 0.9), 16);
    },
    build(b) {
      const w = 1.5 * b.rt, h = 0.62 * b.Ht, dp = 0.12, y = 0.5 * b.Ht, back = b.bodyR(0.5, 180), z = -(back + dp / 2 - 0.02);
      b.solid("body", roundBox(w, h, dp, 0.45), { col, paint: "cloth" }).position.set(0, y, z);
      b.solid("body", roundBox(w * 0.7, h * 0.42, 0.05, 0.45), { col: pocket, paint: "cloth", ink: b.INK * 0.6 }).position.set(0, y - h * 0.16, z - dp / 2 - 0.006);
      for (const sy of [-1, 1]) for (const sx of [-1, 1]) b.keepOut(new THREE.Vector3(sx * w * 0.22, y + sy * h * 0.24, z), dp * 0.62);
    },
  };
};
