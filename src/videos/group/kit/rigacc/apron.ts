import type { Acc, OutfitKit, P2 } from "../rig3d";

/** a line that is w metres wide on the body whichever way it runs. (A canvas pixel is about half as wide as it is
 *  tall on the body: a plain canvas line comes out twice as heavy running round the body as running up it.) */
const even = (c: OutfitKit, pts: P2[], col: string, w: number) => {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0) || 1, dx = (x1 - x0) / l, dy = (y1 - y0) / l;
    const t = (1 - Math.cos(Math.PI * (1 - (y0 + y1) / 2 / c.H))) / 2, round = (c.az(1, t) * c.W) / 360, up = c.pxUp(t);   // canvas px per metre round / up the body
    c.line([pts[i - 1], pts[i]], col, Math.min(w * Math.hypot(dy * round, dx * up), 3 * w * up));
  }
};
/** points of the curve from a to b bent toward k */
const bend = (a: P2, k: P2, b: P2, n = 8): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });

/** A bib apron, drawn on the clothes (the cook, the barista, the shop assistant): a strap round the neck, a bib over
 *  the chest, a skirt that wraps round the sides and reaches the bottom of the body, ties round the waist to a bow at
 *  the back, one pocket. The look's own top shows at the shoulders and on the back.
 *  col: left out, the apron is cream, or denim blue on clothes that are themselves near white (a pale top, a white
 *  coat under it): an apron in the colour of the clothes would only be an outline. Give col to fix the colour. */
export const apron = (o: { col?: string; pocket?: string } = {}): Acc => {
  const CREAM = "#f3ead8", DENIM = "#4f6d9a";
  return {
    name: "apron", slots: ["neck", "chest", "waist"], key: `${o.col ?? ""}|${o.pocket ?? ""}`,
    outfit(c) {
      // what the apron lies on: the clothes as drawn so far, read at three places beside the bib where no top and no
      // coat draws a detail; two of the three decide
      const cr = parseInt(CREAM.slice(1), 16);
      const near = ([az, t]: P2) => { const [x, y] = c.P(az, t), u = c.g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return Math.hypot(u[0] - (cr >> 16), u[1] - ((cr >> 8) & 255), u[2] - (cr & 255)) < 70; };
      const pale = ([[47, 0.66], [-47, 0.66], [-56, 0.54]] as P2[]).filter(near).length >= 2;
      const col = o.col ?? (pale ? DENIM : CREAM), ink = c.shade(col, 0.36), pocket = o.pocket ?? c.shade(col, 0.9), LINE = 0.008;
      const top = c.chin - 0.13, waist = 0.53, tie = waist - 0.022, bib = 15, hip = 31, wrap = 96;      // heights (t) and degrees round the body
      const strap = (pts: P2[]) => { even(c, pts, ink, 0.023); even(c, pts, col, 0.012); };
      // the ties: from the skirt's top corners round the waist to the back seam
      for (const s of [-1, 1]) strap([c.P(s * (wrap - 4), tie), c.P(s * 140, tie), c.P(s * 180, tie)]);
      // the bow on the back seam, in metres from its knot (x = toward the person's left, y = up)
      const [kx, ky] = c.P(180, tie), round = (c.az(1, tie) * c.W) / 360, up = c.pxUp(tie), B = (x: number, y: number): P2 => [kx + x * round, ky - y * up];
      const patch = (pts: P2[], fill = col) => { c.poly(pts, fill); even(c, [...pts, pts[0]], ink, LINE * 0.8); };
      for (const s of [-1, 1]) patch([B(s * 0.004, -0.006), B(s * 0.024, -0.004), B(s * 0.05, -0.07), B(s * 0.024, -0.062)]);                       // two tails
      for (const s of [-1, 1]) patch(Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return B(s * 0.027 * (1 - Math.cos(a)), 0.006 + 0.03 * Math.sin(a) * Math.sin(a / 2)); }));   // two loops
      patch(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return B(0.011 * Math.cos(a), 0.014 * Math.sin(a)); }), c.shade(col, 0.93));   // the knot
      // the neck strap: up from the bib's corners and under the chin
      for (const s of [-1, 1]) strap([c.P(s * (bib - 3), top - 0.02), c.P(s * (bib + 1), (top + 1) / 2), c.P(s * (bib + 9), 1)]);
      // the apron itself: the bib, its sides sweeping out to the waist, the skirt round to the sides and down
      const edge = (s: number): P2[] => [...bend(c.P(s * bib, top), c.P(s * (bib + 1.5), waist + 0.012), c.P(s * hip, waist)), c.P(s * wrap, waist)];
      const [xl, yb] = c.P(-wrap, 0), [xr] = c.P(wrap, 0);
      c.poly([...edge(-1).reverse(), ...edge(1), [xr, yb + 40], [xl, yb + 40]], col);
      even(c, [c.P(-bib, top), c.P(bib, top)], ink, LINE);
      for (const s of [-1, 1]) even(c, [...edge(s), c.P(s * wrap, 0.3), c.P(s * wrap, 0.12), c.P(s * wrap, 0.02)], ink, LINE);
      // one wide pocket in the middle of the skirt
      const pk: P2[] = [c.P(-24, 0.43), c.P(24, 0.43), c.P(24, 0.27), c.P(19, 0.235), c.P(-19, 0.235), c.P(-24, 0.27)];
      c.poly(pk, pocket); even(c, [...pk, pk[0]], ink, LINE * 0.85);
    },
  };
};
