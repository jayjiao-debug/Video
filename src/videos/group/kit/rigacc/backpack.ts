import * as THREE from "three";
import type { Acc } from "../rig3d";
import { roundBox, shade } from "./shapes";

/** A backpack: a soft pack on the back and two straps drawn over the shoulders (the student, the hiker, the tourist). */
export const backpack = (o: { col?: string; pocket?: string } = {}): Acc => {
  const col = o.col ?? "#e8b340", pocket = o.pocket ?? shade(col, 0.82);
  return {
    name: "backpack", slots: ["back"], key: `${col}|${pocket}`,
    outfit(c) {
      // a strap on each side: from the pack's top over the shoulder (inside the arm), down the chest, and back under
      // the arm to the pack's lower corner. It stays outside az 44, clear of a tag or a lanyard on the chest. A
      // smooth curve through the corners (Catmull-Rom), drawn twice: the ink, then the strap inside it.
      const K: [number, number][] = [[150, 0.8], [104, 0.9], [66, 0.93], [51, 0.8], [47, 0.56], [53, 0.39], [76, 0.3], [112, 0.27], [150, 0.28]];
      const at = (i: number) => K[Math.min(Math.max(i, 0), K.length - 1)], pts: [number, number][] = [];
      for (let i = 0; i < K.length - 1; i++) for (let n = 0; n < 8; n++) {
        const t = n / 8, [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
        const cr = (k: 0 | 1) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t);
        pts.push([cr(0), cr(1)]);
      }
      pts.push(K[K.length - 1]);
      for (const [colr, w] of [[c.shade(col, 0.36), 26], [shade(col, 0.9), 16]] as [string, number][]) for (const s of [-1, 1]) c.line(pts.map(([az, t]) => c.P(s * az, t)), colr, w);
    },
    build(b) {
      // as wide as the body: from the front only the straps show, from a quarter turn on the pack shows behind
      const w = 2.3 * b.rt, h = 0.64 * b.Ht, dp = 0.12, y = 0.5 * b.Ht, back = b.bodyR(0.5, 180), z = -(back + dp / 2 - 0.02);
      b.solid("body", roundBox(w, h, dp, 0.45), { col, paint: "cloth" }).position.set(0, y, z);
      b.solid("body", roundBox(w * 0.7, h * 0.42, 0.05, 0.45), { col: pocket, paint: "cloth", ink: b.INK * 0.6 }).position.set(0, y - h * 0.16, z - dp / 2 - 0.006);
      for (const sy of [-1, 1]) for (const sx of [-1, 1]) b.keepOut(new THREE.Vector3(sx * w * 0.28, y + sy * h * 0.24, z), dp * 0.62);
    },
  };
};
