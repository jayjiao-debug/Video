// WHAT IS PAINTED ON THE CLOTHES of the Su film's cast (PLAN 2; WP3), drawn after the robe (people.ts lists them after
// kit acc/garb.ts robe, so they lie on it). Each is an Acc with no slot and only an `outfit` drawing (rig3d.ts
// OutfitKit: places P(az, t), az degrees round the body from the front centre (+ = the person's left), t = height 0..1
// up the body; the head hides t > chin, the skirt takes over below t = waist).
//   patches()   SU's two darker square patches, sewn on with pale running stitches: one on his belly to his left, one
//               high on his chest to his right (the poor exile's mended robe). Seen from the front and three-quarters.
//   stains()    the butcher's apron: a few soft brown-red blots low on the front (no gore: old, faded marks)
//   apronBib()  the butcher's plain bib apron over the robe: from under the chin to the bottom of the body, wrapping
//               round the sides, a neck strap, a tie at the waist (simpler than the rig's apron: no pocket, no bow)
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";

/** a rectangle on the body: centre (az, t), w x h metres, as a polygon of canvas points, a little skewed so that it
 *  reads as sewn on by hand (small enough that the body's curve does not matter) */
const rectOn = (c: OutfitKit, az: number, t: number, w: number, h: number): P2[] => {
  const [x, y] = c.P(az, t), hw = ((c.az(w, t) / 360) * c.W) / 2, hh = (h * c.pxUp(t)) / 2, k = 0.06;
  return [[x - hw, y - hh + k * hh], [x + hw, y - hh - k * hh], [x + hw + k * hw, y + hh], [x - hw + k * hw, y + hh]];
};
/** a dashed line through the points (canvas px): stitches */
const stitch = (c: OutfitKit, pts: P2[], col: string, lw: number) => {
  const g = c.g; g.save(); g.setLineDash([lw * 2.2, lw * 1.8]); g.lineCap = "round"; g.strokeStyle = col; g.lineWidth = lw;
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); g.restore();
};

/** SU's two patches (see the head of this file). col = the patch cloth, thread = the stitches */
export const patches = (o: { col?: string; thread?: string } = {}): Acc => {
  const col = o.col ?? "#6e4a2a", thread = o.thread ?? "#e8d8b0";
  return {
    name: "patches", slots: [], key: `patches|${col}|${thread}`,
    outfit(c) {
      for (const [az, t, w, h] of [[28, 0.42, 0.11, 0.1], [-42, 0.7, 0.085, 0.08]] as [number, number, number, number][]) {
        const pts = rectOn(c, az, t, w, h);
        c.poly(pts, col, c.shade(col, 0.55), 3);
        stitch(c, rectOn(c, az, t, w * 0.8, h * 0.78), thread, 3);
      }
    },
  };
};

/** the butcher's faded stains (see the head of this file) */
export const stains = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? "rgba(150,74,58,0.55)";
  return {
    name: "stains", slots: [], key: `stains|${col}`,
    outfit(c) {
      const g = c.g;
      for (const [az, t, r] of [[12, 0.3, 0.035], [-22, 0.2, 0.025], [30, 0.16, 0.02], [-8, 0.42, 0.018]] as [number, number, number][]) {
        const [x, y] = c.P(az, t), rx = (c.az(r, t) / 360) * c.W, ry = r * c.pxUp(t);
        g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      }
    },
  };
};

/** the butcher's bib apron (see the head of this file). col = the apron, strap = the neck strap and the waist tie */
export const apronBib = (o: { col?: string; strap?: string } = {}): Acc => {
  const col = o.col ?? "#e4dcc6", strap = o.strap ?? "#8a7a62";
  return {
    name: "apronBib", slots: [], key: `apronBib|${col}|${strap}`,
    outfit(c) {
      const top = c.chin - 0.12, waist = 0.5, ink = c.shade(col, 0.5), P = c.P;
      // the bib from under the chin to the waist, then the skirt wrapping round to the sides down to the bottom
      const pts: P2[] = [P(-20, top), P(20, top), P(24, waist + 0.04), P(92, waist - 0.02), P(96, 0.0), P(-96, 0.0), P(-92, waist - 0.02), P(-24, waist + 0.04)];
      c.poly(pts, col, ink, 4);
      // the neck strap from the bib's top corners up behind the neck, the tie round the waist to the back
      for (const s of [-1, 1]) { c.line([P(s * 18, top), P(s * 30, c.chin + 0.06)], strap, 7); c.line([P(s * 92, waist - 0.02), P(s * 180, waist - 0.02)], strap, 5); }
    },
  };
};
