import type { Acc, P2 } from "../rig3d";

/** A necktie, drawn on the clothes (the office worker, the salesman). suit = a jacket with lapels and a white shirt
 *  front drawn over the look's top as well (the boss, the lawyer, the banker). */
export const tie = (o: { col?: string; stripe?: string; suit?: string; shirt?: string } = {}): Acc => {
  const col = o.col ?? "#b23a48", stripe = o.stripe, suit = o.suit, shirt = o.shirt ?? "#f6f4ee";
  return {
    name: suit ? "suit" : "tie", slots: suit ? ["neck", "coat"] : ["neck"], key: `${col}|${stripe ?? ""}|${suit ?? ""}|${shirt}`,
    outfit(c) {
      const top = c.chin + 0.05, tip = 0.4, ink = c.shade(suit ?? col, 0.36);
      if (suit) {
        // the jacket all the way round, an open V with the shirt in it, two lapels, two buttons
        c.poly([c.P(-180, 1), c.P(180, 1), c.P(180, c.waist), c.P(-180, c.waist)], suit);
        const v0 = 26, vy = 0.3;
        c.poly([c.P(-v0, 1), c.P(v0, 1), c.P(0, vy)], shirt);
        for (const s of [-1, 1]) {
          c.poly([c.P(s * v0, 1), c.P(s * (v0 + 20), 1), c.P(s * 15, 0.56), c.P(s * 4, vy + 0.06), c.P(0, vy)], c.shade(suit, 0.84), ink, c.LW - 2);
          c.line([c.P(s * v0, 1), c.P(0, vy)], ink, c.LW - 1);
        }
        c.line([c.P(0, vy), c.P(0, c.waist)], ink, c.LW - 2);
        for (const t of [0.24, 0.16]) { const [x, y] = c.P(5, t); c.g.beginPath(); c.g.ellipse(x, y, 9, 5, 0, 0, 7); c.g.fillStyle = c.shade(suit, 0.6); c.g.fill(); }
      }
      // the tie: a knot under the chin, a blade that widens and ends in a point
      const hw = (m: number, t: number) => c.az(m, t), g = c.g;
      const knot: P2[] = [c.P(-hw(0.03, top), top), c.P(hw(0.03, top), top), c.P(hw(0.02, top - 0.1), top - 0.1), c.P(-hw(0.02, top - 0.1), top - 0.1)];
      const blade: P2[] = [c.P(-hw(0.018, top - 0.1), top - 0.1), c.P(hw(0.018, top - 0.1), top - 0.1), c.P(hw(0.04, tip + 0.07), tip + 0.07), c.P(0, tip), c.P(-hw(0.04, tip + 0.07), tip + 0.07)];
      c.poly(blade, col, ink, c.LW - 2);
      if (stripe) {
        g.save(); g.beginPath(); blade.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
        for (let k = -2; k < 9; k++) { const t = top - 0.06 - k * 0.07; c.line([c.P(-12, t), c.P(12, t - 0.09)], stripe, 9); }
        g.restore();
        c.poly(blade, "rgba(0,0,0,0)", ink, c.LW - 2);
      }
      c.poly(knot, c.shade(col, 0.86), ink, c.LW - 2);
    },
  };
};
