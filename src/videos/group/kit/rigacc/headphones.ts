import * as THREE from "three";
import type { Acc } from "../rig3d";
import { hoop, tube, turned } from "./shapes";

/** Headphones: a thick band over the head and a big round cup on each ear (the gamer, the streamer, the student who
 *  is not listening). mic = a headset's boom toward the mouth (customer service, the pilot). col = the band and the
 *  cups' outer discs; cup = the cups. */
export const headphones = (o: { col?: string; cup?: string; mic?: boolean } = {}): Acc => {
  const col = o.col ?? "#c9503f", cup = o.cup ?? "#3c3a46";
  return {
    name: "headphones", slots: ["ears", "crown"], key: `${col}|${cup}|${!!o.mic}`, noHairProps: true,
    build(b) {
      const R = b.R, rc = 0.38 * R, th = 0.3 * R, len = 2 * rc + th;
      // the band stands clear of the head's own outline, so it reads from the front as well as from the side
      b.solid("head", hoop(b.toM, { r: 1.175, a0: -82, a1: 82, deep: 0.13, across: 0.36 }), { col });
      // a cup: a puck turned on a lathe (v runs from the centre of the face on the ear to the centre of the outer face)
      const disc = (0.62 * rc) / len;
      const map = b.tex(8, 256, (g) => {
        g.fillStyle = cup; g.fillRect(0, 0, 8, 256);
        g.fillStyle = "#35323f"; g.fillRect(0, 0, 8, (disc + 0.035) * 256);
        g.fillStyle = col; g.fillRect(0, 0, 8, disc * 256);
      }, `headphones|${col}|${cup}`);
      for (const s of [-1, 1]) {
        const c = b.solid("head", turned([[0, 0], [rc, 0], [rc, th], [0, th]], 0.32 * th), { map });
        b.put(c, s * 0.95, -0.1, 0.02); c.rotation.z = (-s * Math.PI) / 2;
      }
      if (o.mic) {
        const p = (x: number, y: number, z: number) => b.at(x, y, z).toArray() as [number, number, number];
        b.solid("head", tube([p(1.1, -0.34, 0.12), p(1.05, -0.56, 0.5), p(0.66, -0.64, 0.97), p(0.36, -0.6, 1.1)], 0.011), { col: cup, ink: 0.004 });
        b.put(b.solid("head", new THREE.SphereGeometry(0.075 * R, 12, 10), { col: cup, ink: b.INK * 0.5 }), 0.32, -0.6, 1.11);
      }
    },
  };
};
