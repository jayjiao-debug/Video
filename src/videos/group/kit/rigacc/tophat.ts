import type { Acc } from "../rig3d";
import { turned } from "./shapes";

/** A top hat, perched on the crown and tipped a little (the banker, the magician, the old-money boss). The look's own
 *  hair stays as drawn. bowler = a low round crown with a narrow brim instead. */
export const topHat = (o: { col?: string; band?: string; bowler?: boolean; tilt?: number } = {}): Acc => {
  const col = o.col ?? "#33313c", band = o.band ?? "#b23a48", bowler = !!o.bowler;
  return {
    name: bowler ? "bowler" : "topHat", slots: ["hat", "crown"], key: `${col}|${band}|${bowler}|${o.tilt ?? 7}`,
    hat: { rim: bowler ? 47 : 40, hair: "keep", shade: false },
    build(b) {
      b.tilt(o.tilt ?? 7, -3);
      // a hat that is much narrower than the head reads as a toy hat: the bowler's crown is three quarters of the
      // head's width and its brim as wide as the head, the top hat a little narrower and taller
      const R = b.R, k0 = bowler ? 0.75 : 0.63, r0 = k0 * R, h = (bowler ? 0.7 : 0.95) * R, base = bowler ? 0.6 : 0.71;   // base: head units up the head
      // the crown: turned on a lathe. It goes on down into the head (sink), so its open end is never near the surface,
      // whichever way the hat is tipped
      const sink = 0.3 * R, flare = bowler ? 0 : 0.08, r1 = r0 * (1 - (flare * sink) / h);
      const prof: [number, number][] = bowler ? [[r1, -sink], [r0, h * 0.4], [r0 * 0.9, h * 0.74], [r0 * 0.56, h * 0.97], [0, h]] : [[r1, -sink], [r0 * 1.08, h], [0, h]];
      const crown = turned(prof, bowler ? 0.16 * R : 0.035 * R), len = crown.userData.len as number, v0 = Math.hypot(r0 - r1, sink) / len;
      // its band painted on, just above the brim (v = 0 at the bottom of the wall; v0 = at the base)
      const map = b.tex(8, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 8, 256);
        const lo = v0 + ((bowler ? 0.2 : 0.13) * R) / len, hi = v0 + ((bowler ? 0.36 : 0.31) * R) / len;
        g.fillStyle = band; g.fillRect(0, (1 - hi) * 256, 8, (hi - lo) * 256);
      }, `tophat|${col}|${band}|${bowler}`);
      b.put(b.solid("head", crown, { map }), 0, base, 0);
      // the brim: thick enough to carry its own ink line. Its root is inside the crown; join = where it comes out
      const rIn = k0 - 0.15, wide = bowler ? 1.02 : 1;
      b.solid("head", b.brim({ rIn, y: base + (bowler ? 0.15 : 0.1), out: wide - rIn, droop: -0.04, thick: 0.1, taper: 0.8, join: k0 + 0.015 }), { col });
    },
  };
};
