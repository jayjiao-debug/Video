import type { Acc } from "../rig3d";
import { turned } from "./shapes";

/** A top hat, perched on the crown and tipped a little (the banker, the magician, the old-money boss). The look's own
 *  hair stays as drawn. bowler = a low round crown with a narrow brim instead. */
export const topHat = (o: { col?: string; band?: string; bowler?: boolean; tilt?: number } = {}): Acc => {
  const col = o.col ?? "#33313c", band = o.band ?? "#b23a48", bowler = !!o.bowler;
  return {
    name: bowler ? "bowler" : "topHat", slots: ["hat", "crown"], key: `${col}|${band}|${bowler}|${o.tilt ?? 7}`,
    hat: { rim: 36, hair: "keep", shade: false },
    build(b) {
      b.tilt(o.tilt ?? 7, -3);
      const R = b.R, r0 = 0.57 * R, h = (bowler ? 0.5 : 0.92) * R, base = 0.74;                // base: head units up the head
      // the crown: turned on a lathe, its band painted on (v = 0 at the bottom of the wall)
      const prof: [number, number][] = bowler ? [[r0, 0], [r0 * 1.02, h * 0.45], [r0 * 0.72, h * 0.93], [0, h]] : [[r0, 0], [r0 * 1.08, h], [0, h]];
      const map = b.tex(8, 128, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 128); g.fillStyle = band; g.fillRect(0, 128 - 26, 8, 15); }, `tophat|${col}|${band}`);
      b.put(b.solid("head", turned(prof, bowler ? 0.09 * R : 0.035 * R), { map }), 0, base, 0);
      // the brim: thick enough to carry its own ink line
      b.solid("head", b.brim({ rIn: 0.5, y: base + 0.1, out: bowler ? 0.3 : 0.4, droop: -0.04, thick: 0.1, taper: 0.8 }), { col });
    },
  };
};
