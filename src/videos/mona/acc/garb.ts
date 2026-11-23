// GARB of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026): what she wears on the panel, painted OVER the kit robe (which gives
// the 3D skirt). Painted garments go on the body's wrap (OutfitKit: az = degrees round the body, 0 = the front, + = her
// left; t = height, 0 = the body's bottom .. 1 = its top; the head hides what is above t = chin).
//   monaGown(o)   a dark green gown with a low round neck: her chest shows in it; along the neck a gold braid of small
//                 knots; under the braid the cloth is gathered in fine pleats; a dark mantle lies over both shoulders
//                 and comes down from her left shoulder across her chest as one twisted roll. List it AFTER robe().
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";

const bend = (a: P2, k: P2, b: P2, n = 12): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);

export type MonaGownO = { col?: string; skin?: string; braid?: string; mantle?: string; /** how far under the chin the neck's lowest point is (share of the body's height) */ low?: number };
export const monaGown = (o: MonaGownO = {}): Acc => {
  const skin = o.skin ?? "#f1dcae", braid = o.braid ?? "#c79a3c", mantle = o.mantle ?? "#2f3326", low = o.low ?? 0.2;
  return {
    name: "monaGown", slots: [], key: ["monaGown3", o.col ?? "", skin, braid, mantle, low].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, P = c.P, ch = c.chin, g = c.g, nk = ch - low, HALF = 64;
      /** the neckline's height at az: lowest in front, rising to the shoulders */
      const neck = (az: number) => nk + (1.02 - nk) * Math.pow(Math.min(1, Math.abs(az) / HALF), 2.3);
      const along = (dt: number, a0 = -HALF, a1 = HALF, step = 2): P2[] => { const a: P2[] = []; for (let az = a0; az <= a1 + 1e-6; az += step) a.push(P(az, neck(az) + dt)); return a; };
      ring(c, 0, 1, col);
      // soft folds down the bodice at the sides and the back
      for (const az of [-150, -108, -72, 74, 110, 150]) c.line([P(az, 0.78), P(az + 2, 0.14)], c.shade(col, 0.8), 5);
      // the pleats: the cloth gathered under the braid, fine lines fanning down from it
      for (let az = -56; az <= 56; az += 3.6) {
        const t0 = neck(az) - 0.02, len = 0.16 * (1 - 0.35 * Math.abs(az) / 56);
        c.line([P(az, t0), P(az * 1.03, t0 - len)], c.shade(col, az % 7.2 === 0 ? 1.5 : 0.66), 2.6);
      }
      // her chest in the round neck, with the shade the chin throws on it
      const chest: P2[] = [...along(0), P(HALF, 1.03), P(-HALF, 1.03)];
      c.poly(chest, skin);
      g.save(); g.beginPath(); chest.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
      const y0 = P(0, ch + 0.03)[1], y1 = P(0, ch - 0.1)[1], gr = g.createLinearGradient(0, y0, 0, y1);
      gr.addColorStop(0, "rgba(118,74,30,0.62)"); gr.addColorStop(1, "rgba(118,74,30,0)");
      g.fillStyle = gr; g.fillRect(0, 0, c.W, c.H);
      g.restore();
      // the braid along the neck: a dark edge, the gold, a row of small knots
      const ti = c.shade(braid, 0.42);
      c.line(along(-0.006), ti, 23); c.line(along(-0.006), braid, 15);
      for (let az = -58; az <= 58; az += 5.8) {
        const [x, y] = P(az, neck(az) - 0.006);
        g.strokeStyle = ti; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, y, 5.2, 3.6, 0, 0, 7); g.stroke();
      }
      c.line(along(0.005), c.shade(braid, 1.35), 2.2);
      // the mantle over both shoulders (behind the neck's ends), and its roll from her left shoulder across the chest
      for (const s of [-1, 1]) c.poly([P(s * 58, 1.03), ...bend(P(s * 58, 1.03), P(s * 70, 0.86), P(s * 96, 0.74), 8), P(s * 180, 0.7), P(s * 180, 1.03)], mantle);
      const roll = bend(P(74, 1.0), P(44, 0.7), P(-6, 0.45), 16), hi = c.shade(mantle, 1.7), lo = c.shade(mantle, 0.55);
      c.line(roll, lo, 58); c.line(roll, mantle, 48);
      // its twist: short slanted lights along it
      for (let i = 1; i < roll.length - 1; i += 2) {
        const a = roll[i], b = roll[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        c.line([[a[0] + nx * 17, a[1] + ny * 17], [b[0] - nx * 15 + dx * 0.4, b[1] - ny * 15 + dy * 0.4]], hi, 4.5);
      }
    },
  };
};
