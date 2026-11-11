import type { Acc } from "../rig3d";

/** A white coat, drawn on the clothes: open at the neck with the look's own top showing, lapels, buttons, a chest
 *  pocket with pens (the scientist, the lab assistant). stethoscope = one hangs round the neck (the doctor). */
export const labCoat = (o: { col?: string; stethoscope?: boolean; pens?: boolean } = {}): Acc => {
  const col = o.col ?? "#f4f2ec", steth = !!o.stethoscope, pens = o.pens ?? true;
  return {
    name: "labCoat", slots: steth ? ["coat", "neck"] : ["coat"], key: `${col}|${steth}|${pens}`,
    outfit(c) {
      const ink = c.shade(col, 0.36), fold = c.shade(col, 0.86), v0 = 24, vy = 0.44, g = c.g;
      // the coat: all the way round and down over the trousers, leaving a V at the neck
      for (const s of [-1, 1]) c.poly([c.P(s * 180, 1), c.P(s * v0, 1), c.P(0, vy), c.P(0, 0), c.P(s * 180, 0)], col);
      for (const s of [-1, 1]) {
        c.poly([c.P(s * v0, 1), c.P(s * (v0 + 22), 1), c.P(s * 17, 0.66), c.P(s * 5, vy + 0.07), c.P(0, vy)], fold, ink, c.LW - 2);
        c.line([c.P(s * v0, 1), c.P(0, vy)], ink, c.LW - 1);
      }
      c.line([c.P(0, vy), c.P(0, 0.02)], ink, c.LW - 2);
      for (const t of [0.34, 0.24, 0.14]) { const [x, y] = c.P(5, t); g.beginPath(); g.ellipse(x, y, 9, 5, 0, 0, 7); g.fillStyle = c.shade(col, 0.6); g.fill(); }
      // chest pocket on the person's left, two pens in it
      const p0 = 30, p1 = 54, pt = 0.6, pb = 0.47;
      if (pens) for (const [az, pc] of [[36, "#3f6fb5"], [43, "#c9503f"]] as [number, string][]) c.line([c.P(az, pt + 0.045), c.P(az, pt - 0.02)], pc, 9);
      c.poly([c.P(p0, pt), c.P(p1, pt), c.P(p1, pb), c.P(p0, pb)], col, ink, c.LW - 3);
      if (steth) {
        // two tubes down from the neck that join, one tube on to the chest piece
        // (a tube in the ink's own colour reads as a strap or an arm: a blue-grey one with an ink edge)
        const tubeC = "#2c2a3a", yj = 0.5, end: [number, number] = [-34, 0.36];
        for (const w of [[tubeC, 16], ["#6f8fae", 9]] as [string, number][]) {
          for (const s of [-1, 1]) c.line([c.P(s * 19, 1), c.P(s * 20, 0.74), c.P(s * 12, 0.58), c.P(0, yj)], w[0], w[1]);
          c.line([c.P(0, yj), c.P(-10, 0.42), c.P(-24, 0.36), c.P(end[0], end[1])], w[0], w[1]);
        }
        const [x, y] = c.P(end[0] - 7, end[1]);
        g.beginPath(); g.ellipse(x, y, 25, 13, 0, 0, 7); g.fillStyle = "#c9ccd6"; g.fill(); g.lineWidth = 5; g.strokeStyle = tubeC; g.stroke();
      }
    },
  };
};
