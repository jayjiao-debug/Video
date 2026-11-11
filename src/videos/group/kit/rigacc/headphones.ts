import type { Acc } from "../rig3d";
import { hoop, shade, turned } from "./shapes";

/** Headphones: a thick band over the head and a big round cup on each ear (the gamer, the streamer, the student who
 *  is not listening). mic = a headset's boom toward the mouth (customer service, the pilot). col = the band and the
 *  cups' outer discs; cup = the cups.
 *  The mic is drawn on the face, like glasses: the mouth turns to the camera on its own, away from the head and its
 *  cups (the face zone, RIG3D.md), so a boom built in 3D leaves the mouth, or crosses an eye, as the figure turns. The
 *  drawn boom comes in from the edge of the face on the person's left: on the near side it runs out from under the
 *  cup, on the far side from the head's outline. */
export const headphones = (o: { col?: string; cup?: string; mic?: boolean } = {}): Acc => {
  const col = o.col ?? "#c9503f", cup = o.cup ?? "#64616f";              // (a cup as dark as the ink line runs into the head's outline)
  return {
    name: "headphones", slots: o.mic ? ["ears", "crown", "cheek"] : ["ears", "crown"], key: `${col}|${cup}|${!!o.mic}`, noHairProps: true,
    face: o.mic ? (f) => {
      // the foam ball sits out on the cheek, clear of the widest mouth (a grin's corners reach 20u from the middle)
      const [mx, my] = f.mouth, bx = mx + 24, by = my + 1.5;
      f.line(f.quad([56, 6.5], [46, by + 6], [bx, by + 0.8], 16), 2.5, shade(cup, 0.8));
      f.fill(f.arc(bx, by, 4.5, 4.1), "#3a3744", 1.5);
    } : undefined,
    build(b) {
      const R = b.R, rc = 0.38 * R, out = 1.25, deep = 0.62;                                    // a cup's outer face and its inner end, head units from the middle
      // the band lies on the head, its under side inside the skin (a part that only touches the head lets the head's
      // own outline through between them); it is thick, so it reads as a bar from the front as well as from the side
      b.solid("head", hoop(b.toM, { r: 1.08, a0: -86, a1: 86, deep: 0.2, across: 0.36 }), { col });
      // a cup: a puck turned on a lathe. Its inner end is deep inside the head, so its side wall comes out of the head
      // squarely (an end that sits near the surface shows as a broken line round the cup); the band runs into the flat
      // of the wall. v runs from the centre of the inner end to the centre of the outer face.
      const puck = turned([[0, 0], [rc, 0], [rc, (out - deep) * R], [0, (out - deep) * R]], 0.07 * R), len = puck.userData.len as number;
      const disc = (0.62 * rc) / len, ring = (0.037 * R) / len;
      const map = b.tex(8, 512, (g) => {
        g.fillStyle = cup; g.fillRect(0, 0, 8, 512);
        g.fillStyle = shade(cup, 0.55); g.fillRect(0, 0, 8, (disc + ring) * 512);
        g.fillStyle = col; g.fillRect(0, 0, 8, disc * 512);
      }, `headphones|${col}|${cup}`);
      for (const s of [-1, 1]) {
        const c = b.solid("head", puck, { map });
        b.put(c, s * deep, -0.1, 0.02); c.rotation.z = (-s * Math.PI) / 2;
      }
    },
  };
};
