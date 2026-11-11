import type { Acc, OutfitKit, P2 } from "../rig3d";

/** A necktie, drawn on the clothes (the office worker, the salesman). suit = a jacket with lapels and a white shirt
 *  front drawn over the look's top as well (the boss, the lawyer, the banker). */
export const tie = (o: { col?: string; stripe?: string; suit?: string; shirt?: string } = {}): Acc => {
  const col = o.col ?? "#b23a48", stripe = o.stripe, suit = o.suit, shirt = o.shirt ?? "#f6f4ee";
  const draw = (c: OutfitKit) => {
    const top = c.chin + 0.05, tip = suit ? 0.26 : 0.4, ink = c.shade(suit ?? col, 0.36), g = c.g;
    const hw = (m: number, t: number) => c.az(m, t), k = 0.64;                 // (a real tie is a fifth of the chest wide)
    const knot: P2[] = [c.P(-hw(0.03 * k, top), top), c.P(hw(0.03 * k, top), top), c.P(hw(0.02 * k, top - 0.1), top - 0.1), c.P(-hw(0.02 * k, top - 0.1), top - 0.1)];
    const blade: P2[] = [c.P(-hw(0.018 * k, top - 0.1), top - 0.1), c.P(hw(0.018 * k, top - 0.1), top - 0.1), c.P(hw(0.04 * k, tip + 0.07), tip + 0.07), c.P(0, tip), c.P(-hw(0.04 * k, tip + 0.07), tip + 0.07)];
    // the tie: a knot under the chin, a blade that widens and ends in a point
    const necktie = () => {
      c.poly(blade, col, ink, c.LW - 2);
      if (stripe) {
        g.save(); g.beginPath(); blade.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
        for (let n = -2; n < 9; n++) { const t = top - 0.06 - n * 0.07; c.line([c.P(-12, t), c.P(12, t - 0.09)], stripe, 9); }
        g.restore();
        c.poly(blade, "rgba(0,0,0,0)", ink, c.LW - 2);
      }
      c.poly(knot, c.shade(col, 0.86), ink, c.LW - 2);
    };
    if (!suit) return necktie();
    // the jacket all the way round; an open V with the shirt and the tie in it (the tie goes on down behind the
    // jacket's front); two lapels in a lighter tone, so that they read on a dark suit; two buttons
    c.poly([c.P(-180, 1), c.P(180, 1), c.P(180, c.waist), c.P(-180, c.waist)], suit);
    const v0 = 40, vy = 0.34, V: P2[] = [c.P(-v0, 1), c.P(v0, 1), c.P(0, vy)], light = c.shade(suit, 1.32);
    c.poly(V, shirt);
    g.save(); g.beginPath(); V.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); necktie(); g.restore();
    for (const s of [-1, 1]) {
      c.poly([c.P(s * v0, 1), c.P(s * (v0 + 24), 1), c.P(s * 19, 0.55), c.P(s * 5, vy + 0.07), c.P(0, vy)], light, ink, c.LW - 2);
      c.line([c.P(s * v0, 1), c.P(0, vy)], ink, c.LW - 1);
    }
    c.line([c.P(0, vy), c.P(0, c.waist)], ink, c.LW - 2);
    for (const t of [0.27, 0.18]) { const [x, y] = c.P(5, t); g.beginPath(); g.ellipse(x, y, 9, 5, 0, 0, 7); g.fillStyle = c.shade(suit, 1.7); g.fill(); }
  };
  // a plain tie is worn under a coat (a white coat over it leaves the knot and the top of the blade showing); the suit
  // is a coat itself and draws its own tie inside its opening
  return { name: suit ? "suit" : "tie", slots: suit ? ["neck", "coat"] : ["neck"], key: `${col}|${stripe ?? ""}|${suit ?? ""}|${shirt}`, ...(suit ? { outfit: draw } : { outfitUnder: draw }) };
};
