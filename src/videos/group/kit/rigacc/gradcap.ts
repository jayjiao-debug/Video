import * as THREE from "three";
import type { Acc } from "../rig3d";
import { roundBox, tube } from "./shapes";

/** A graduation cap: a skull cap with a flat square board on it, one corner to the front, and a tassel hanging from
 *  the middle over the board's edge (the graduate, the top student, "the one with the degree"). The look's own hair
 *  stays as drawn. */
export const gradCap = (o: { col?: string; tassel?: string } = {}): Acc => {
  const col = o.col ?? "#2e2c38", tassel = o.tassel ?? "#e8b340";
  return {
    name: "gradCap", slots: ["hat", "crown"], key: `${col}|${tassel}`, hat: { rim: 46, hair: "keep", shade: false },
    build(b) {
      const R = b.R, side = 1.9, top = 1.09;
      b.tilt(0, 9);
      b.shell({ r: 1.07, to: 46, col, rimInk: 0.008 });
      const board = b.put(b.solid("head", roundBox(side * R, 0.09 * R, side * R, 0.22), { col }), 0, top, 0);
      board.rotateY(Math.PI / 4);
      // the tassel: a button in the middle, a cord over the edge, a brush at its end
      const p = (x: number, y: number, z: number) => b.at(x, y, z).toArray() as [number, number, number], e = (side / 2) * Math.SQRT1_2;
      b.put(b.solid("head", new THREE.SphereGeometry(0.075 * R, 12, 10), { col: tassel, ink: b.INK * 0.5 }), 0, top + 0.06, 0);
      b.solid("head", tube([p(0, top + 0.06, 0), p(e * 0.6, top + 0.065, e * 0.6), p(e + 0.045, top + 0.02, e + 0.045), p(e + 0.07, top - 0.3, e + 0.07), p(e + 0.07, top - 0.52, e + 0.07)], 0.011), { col: tassel, ink: 0.0045 });
      b.put(b.solid("head", new THREE.CapsuleGeometry(0.065 * R, 0.2 * R, 6, 12), { col: tassel, ink: b.INK * 0.5 }), e + 0.07, top - 0.66, e + 0.07);
    },
  };
};
