import type { Acc } from "../rig3d";
import { rad, roundBox, turned } from "./shapes";

/** A peaked cap: a band round the head, a wide flat top that rises at the front, a short dark peak and a badge (the
 *  police officer, the pilot, the ship's captain, the doorman). Pulled down over the hair like a baseball cap. */
export const peakedCap = (o: { col?: string; band?: string; peak?: string; badge?: string } = {}): Acc => {
  const col = o.col ?? "#2c3e63", band = o.band ?? "#1d2233", peak = o.peak ?? "#1d1d24", badge = o.badge ?? "#e8b340";
  return {
    name: "peakedCap", slots: ["hat", "crown"], key: `${col}|${band}|${peak}|${badge}`, hat: { rim: 62 },
    build(b) {
      const R = b.R, r = 1.075, rim = 62, rimR = r * Math.sin(rad(rim)), rimY = r * Math.cos(rad(rim));
      // the band wraps the head; the top sits on it like a saucer, tipped back so that it rises over the face. Under
      // the saucer a cone goes on down through the band into the head: no flat underside, no open end near the
      // surface; it is painted the band's colour, so whatever shows of it under the band's rim reads as band
      b.shell({ r, from: 30, to: rim + 3, col: band, tuck: 9 });
      b.tilt(0, -9);
      const top = turned([[0.62 * R, -0.3 * R], [0.9 * R, 0], [1.2 * R, 0.2 * R], [1.14 * R, 0.33 * R], [0, 0.4 * R]], 0.06 * R), v1 = (top.userData.v as number[])[1];
      const map = b.tex(8, 128, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 128); g.fillStyle = band; g.fillRect(0, (1 - v1) * 128, 8, v1 * 128 + 1); }, `peakedCap|${col}|${band}`);
      b.put(b.solid("head", top, { map }), 0, 0.66, 0);
      b.tilt(0, 0);
      // the peak starts inside the head, comes out under the band and slopes down; thin, so its ink edge is painted on
      // it. show = how far it shows beyond the band at each azimuth; its thickness dies away with it at the two ends
      const dIn = rimR - 0.03 - 0.76, show = (az: number) => 0.36 * Math.max(0, Math.cos(rad((az * 90) / 50))) ** 0.7;
      b.plate("head", b.brim({ rIn: 0.76, y: rimY + 0.02 + 0.5 * dIn, out: (az) => dIn + show(az), from: -50, to: 50, droop: 0.5, thick: (az) => { const x = Math.min(1, show(az) / 0.1); return 0.05 * x * x * (3 - 2 * x); } }), { col: peak });
      b.put(b.solid("head", roundBox(0.2 * R, 0.25 * R, 0.07 * R, 0.6), { col: badge, ink: b.INK * 0.5 }), 0, 0.71, 0.85);
    },
  };
};
