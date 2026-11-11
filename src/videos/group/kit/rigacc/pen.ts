import type { Acc } from "../rig3d";
import { turned, shade } from "./shapes";

/** A pen in one hand (hand 0 = the person's right, the default): a short barrel with a dark tip and a cap band. The
 *  poses know it (PartKit.held, `posed`): "write" leans it over the paper with its tip on the desk top; a resting
 *  hand lays it flat; in any other pose it is carried in the fist, tip down and back. state.hide = ["pen"] puts it
 *  away. */
export const pen = (o: { col?: string; hand?: 0 | 1 } = {}): Acc => {
  const col = o.col ?? "#2f57c9", hand = o.hand ?? 0, R = 0.0058, TIP = -0.037, TOP = 0.068;
  return {
    name: "pen", slots: [hand ? "hand1" : "hand0"], key: `${col}|${hand}`,
    build(b) {
      // its length along +y, the tip at the -y end; the origin (the hand) a third of the way up from the tip
      const g = b.held(hand, { posed: true, rot: [1.15, 0, 0] });
      const map = b.tex(8, 128, (c) => {
        c.fillStyle = col; c.fillRect(0, 0, 8, 128);
        c.fillStyle = "#2a2733"; c.fillRect(0, 128 - 17, 8, 17);             // the tip (v = 0 at the tip: the canvas' bottom)
        c.fillStyle = shade(col, 0.55); c.fillRect(0, 0, 8, 26);              // the cap
      }, `pen|${col}`);
      b.solid(g, turned([[0, TIP], [R * 0.3, TIP + 0.002], [R, TIP + 0.016], [R, TOP - 0.004], [R * 0.6, TOP], [0, TOP]], 0.0015, 14), { map, ink: 0.0026 });
    },
  };
};
