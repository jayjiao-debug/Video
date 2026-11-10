import type { Acc } from "../rig3d";
import { turned } from "./shapes";

/** A chef's hat: a straight band with a puffed top, perched on the crown and tipped (the cook, the baker). The look's
 *  own hair stays as drawn. */
export const chefHat = (o: { col?: string; tilt?: number } = {}): Acc => {
  const col = o.col ?? "#fbfaf6", tilt = o.tilt ?? -8;
  return {
    name: "chefHat", slots: ["hat", "crown"], key: `${col}|${tilt}`, hat: { rim: 38, hair: "keep", shade: false },
    build(b) {
      b.tilt(tilt, -4);
      const R = b.R, r0 = 0.6 * R, hb = 0.42 * R, rx = 0.86 * R, ry = 0.45 * R;
      // the puff: part of an ellipse that meets the band's top edge
      const t0 = -Math.acos(r0 / rx), cy = hb - ry * Math.sin(t0), prof: [number, number][] = [[r0, 0], [r0, hb]];
      for (let k = 1; k < 10; k++) { const t = t0 + ((Math.PI / 2 - t0) * k) / 10; prof.push([rx * Math.cos(t), cy + ry * Math.sin(t)]); }
      prof.push([0, cy + ry]);
      let len = 0; const at: number[] = [0];
      for (let i = 1; i < prof.length; i++) at.push((len += Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1])));
      const vBand = at[1] / len;
      // drawn on it: the line where the puff sits on the band, and a few pleats rising from it (v = 0 at the bottom)
      const map = b.tex(512, 256, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 512, 256);
        g.fillStyle = "#4a4852"; g.fillRect(0, (1 - vBand) * 256 - 3, 512, 6);
        g.strokeStyle = "#8d8a96"; g.lineWidth = 4; g.lineCap = "round";
        for (let k = 0; k < 9; k++) {
          const x = ((k + 0.5) / 9) * 512, y0 = (1 - vBand) * 256 - 8, y1 = (1 - vBand - (k % 2 ? 0.2 : 0.3)) * 256;
          g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 6 * Math.sin(k * 2.4), y1); g.stroke();
        }
      }, "chefHat");
      b.put(b.solid("head", turned(prof, 0.012 * R), { col, map }), 0, 0.72, 0);
    },
  };
};
