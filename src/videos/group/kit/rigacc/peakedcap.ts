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
      // the band wraps the head; the top sits on it like a saucer, tipped back so that it rises over the face
      b.shell({ r, from: 30, to: rim, col: band });
      b.tilt(0, -9);
      b.put(b.solid("head", turned([[0, 0], [0.9 * R, 0], [1.2 * R, 0.2 * R], [1.14 * R, 0.33 * R], [0, 0.4 * R]], 0.06 * R), { col }), 0, 0.66, 0);
      b.tilt(0, 0);
      // the peak grows out from under the band and slopes down; thin, so its ink edge is painted on it
      b.plate("head", b.brim({ rIn: rimR - 0.03, y: rimY + 0.02, out: (az) => 0.36 * Math.max(0, Math.cos(rad((az * 90) / 58))) ** 0.7, from: -58, to: 58, droop: 0.5, thick: 0.05 }), { col: peak });
      b.put(b.solid("head", roundBox(0.2 * R, 0.25 * R, 0.07 * R, 0.6), { col: badge, ink: b.INK * 0.5 }), 0, 0.71, 0.85);
    },
  };
};
