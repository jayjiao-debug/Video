import type { Acc } from "../rig3d";
import { rad, shade } from "./shapes";

/** A hard hat: a tall round shell pulled down over the hair, a lip all round that grows into a short peak over the
 *  face, and a ridge from front to back (the builder, the engineer, the site foreman). */
export const hardHat = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? "#f2c230";
  return {
    name: "hardHat", slots: ["hat", "crown"], key: col, hat: { rim: 56 },
    build(b) {
      const r = 1.1, sq = 1.1, to = 58, rimR = r * Math.sin(rad(to)), rimY = r * Math.cos(rad(to)) * sq, rIn = 0.76, droop = 0.12;
      const m = b.paint("head", { col });
      b.shell({ r, to, squash: sq, mat: m });
      // the ridge follows the shell a little outside it; its two long edges are inked by its map (v runs across it)
      const ridge = b.tex(8, 64, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 64); g.fillStyle = "#3d3d3d"; g.fillRect(0, 0, 8, 9); g.fillRect(0, 55, 8, 9); }, "hardHat-ridge");
      b.shell({ geo: b.band({ r: r + 0.035, a0: -62, a1: 62, half: 0.115, yaw: 90 }), squash: sq, col: shade(col, 0.93), map: ridge, ink: b.INK });
      // the brim starts inside the shell (its root is hidden there) and passes just over the shell's rim
      const past = (az: number) => 0.05 + 0.27 * Math.max(0, Math.cos(rad(az))) ** 3;       // how far it shows beyond the shell
      b.solid("head", b.brim({ rIn, y: rimY + droop * (rimR - rIn) + 0.012, out: (az) => rimR - rIn + past(az), droop, thick: 0.1, taper: 0.7 }), { mat: m });
    },
  };
};
