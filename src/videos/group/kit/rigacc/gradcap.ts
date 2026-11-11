import * as THREE from "three";
import type { Acc } from "../rig3d";
import { roundBox, tube } from "./shapes";

/** A graduation cap: a skull cap with a flat square board on it, one corner to the front, and a tassel hanging from
 *  the middle over the board's edge (the graduate, the top student, "the one with the degree"). The look's own hair
 *  stays as drawn. The tassel hangs beside the face, by the person's left temple: a part in front of the face would
 *  cross an eye as the figure turns, because the face turns to the camera on its own (the face zone, RIG3D.md). */
export const gradCap = (o: { col?: string; tassel?: string } = {}): Acc => {
  const col = o.col ?? "#2e2c38", tassel = o.tassel ?? "#e8b340";
  return {
    name: "gradCap", slots: ["hat", "crown"], key: `${col}|${tassel}`, hat: { rim: 46, hair: "keep", shade: false },
    build(b) {
      const R = b.R, side = 1.9, top = 1.09;
      b.tilt(0, 9);
      b.shell({ r: 1.07, to: 48, col, tuck: 9 });
      const board = b.put(b.solid("head", roundBox(side * R, 0.09 * R, side * R, 0.22), { col }), 0, top, 0);
      board.rotateY(Math.PI / 4);
      // the tassel: a button in the middle, a cord over the edge, a brush at its end
      // it leaves the board on its front-left edge, four fifths of the way from the front corner to the left one: 76
      // degrees round from the middle of the face. (ex, ez) = that point; (ux, uz) = the way out from the middle
      const p = (x: number, y: number, z: number) => b.at(x, y, z).toArray() as [number, number, number];
      const c = side * Math.SQRT1_2, ex = 0.8 * c, ez = 0.2 * c, l = Math.hypot(ex, ez), ux = ex / l, uz = ez / l;
      const q = (k: number, y: number) => p(ex + k * ux, y, ez + k * uz);
      b.put(b.solid("head", new THREE.SphereGeometry(0.075 * R, 12, 10), { col: tassel, ink: b.INK * 0.5 }), 0, top + 0.06, 0);
      // (a thin cord: a thick one reads as a pipe)
      b.solid("head", tube([p(0, top + 0.06, 0), p(ex * 0.6, top + 0.06, ez * 0.6), q(0.035, top + 0.03), q(0.08, top - 0.14), q(0.085, top - 0.34), q(0.085, top - 0.5)], 0.0065, 32), { col: tassel, ink: 0.0035 });
      b.put(b.solid("head", new THREE.CapsuleGeometry(0.075 * R, 0.2 * R, 6, 12), { col: tassel, ink: b.INK * 0.5 }), ex + 0.085 * ux, top - 0.64, ez + 0.085 * uz);
    },
  };
};
