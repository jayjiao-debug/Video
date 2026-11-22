// FACES of 采访罗密欧与朱丽叶 (design stage). Everything here is DRAWN on the face (the kit's "face" rule), in u = 1 % of
// the head's width from the middle of the eye line (x = screen right, y = down). Nothing random, nothing per frame.
//   lashes(o)     Juliet: three lash flicks at the outer end of each eye. They are read off the drawing, so they sit on
//                 a lid line (the half-lid faces), on a dot eye's upper curve (smile) or on a shut eye's arc.
//   lips(o)       a soft lower lip under the mouth (drawn before the mouth, so the mouth's own line stays on top)
//   cheeks(o)     a round blush under each eye (behind the face's lines)
//   shine(o)      a white catch-light in each open eye (dot eyes and half-lid pupils); shut eyes are let be
//   jewel(o)      Juliet's ferronnière: a fine gold chain across the forehead with a red drop at its middle
//   freckles(o)   Romeo: a few soft freckles over each cheek
//   tears(o)      Romeo at dawn: a stream of tears down each cheek from under the eye (a figure either has them or
//                 not: swap ROMEO <-> ROMEO_CRY under a blink)
//   softBrows(o)  the rig's own brows repainted in the hair's colour and a little heavier (young, soft faces)
//   bushyBrows(o) the Friar: thick pale brows with an ink outline laid over the rig's own, drooping at the outer ends
//   ageLines(o)   the Friar: a bag under each eye, a crow's foot at each outer corner, a line beside the mouth
//   nose(o)       the Friar: a small round nose with a warm tint (nobody else in the film has one)
//   fullBeard(o)  the Friar: a soft full beard drawn on the lower face, with NO sideburn strip (the kit's full beard
//                 runs up the temple to the hair: on a tonsured head that strip read as an eye patch)
import * as THREE from "three";
import type { Acc, FaceKit, P2 } from "../../group/kit/rig3d";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const shadeHex = (col: string, k: number) => { const c = new THREE.Color(col); c.multiplyScalar(k); return "#" + c.getHexString(); };
const rgbOf = (col: string) => { const c = new THREE.Color(col).convertLinearToSRGB(); return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)] as const; };

/** the first drawn pixel in the column x (u) between y0 and y1 (u, top down); null = none */
const firstInk = (f: FaceKit, x: number, y0: number, y1: number): number | null => {
  const [px, pa] = f.px(x, y0), [, pb] = f.px(x, y1), h = Math.max(1, Math.round(pb - pa));
  const d = f.g.getImageData(Math.round(px), Math.round(pa), 1, h).data;
  for (let i = 0; i < h; i++) if (d[i * 4 + 3] > 150) return y0 + ((y1 - y0) * i) / h;
  return null;
};
/** how many u of drawing there are in the column x from y down */
const inkRun = (f: FaceKit, x: number, y: number, max: number): number => {
  const [px, pa] = f.px(x, y), [, pb] = f.px(x, y + max), h = Math.max(1, Math.round(pb - pa));
  const d = f.g.getImageData(Math.round(px), Math.round(pa), 1, h).data;
  for (let i = 0; i < h; i++) if (d[i * 4 + 3] < 150) return (max * i) / h;
  return max;
};
/** what one eye looks like on the drawing: the ink's box round the eye's middle and its kind */
type Eye = { kind: "dot" | "lid" | "arc" | "none"; x0: number; left: number; right: number; top: number; bottom: number; cx: number; cy: number };
const eyeOf = (f: FaceKit, s: number): Eye => {
  const x0 = s * f.sp, u = f.u, [pxa, pya] = f.px(x0 - 12, -9), [pxb, pyb] = f.px(x0 + 12, 12);
  const X = Math.round(pxa), Y = Math.round(pya), Wd = Math.max(1, Math.round(pxb - pxa)), Hd = Math.max(1, Math.round(pyb - pya)), d = f.g.getImageData(X, Y, Wd, Hd).data;
  let l = Wd, r = -1, t = Hd, b = -1, n = 0, sx = 0, sy = 0;
  for (let yy = 0; yy < Hd; yy++) for (let xx = 0; xx < Wd; xx++) {
    const k = (yy * Wd + xx) * 4;
    if (d[k + 3] < 150 || d[k] + d[k + 1] + d[k + 2] > 330) continue;
    if (xx < l) l = xx; if (xx > r) r = xx; if (yy < t) t = yy; if (yy > b) b = yy; n++; sx += xx; sy += yy;
  }
  if (!n) return { kind: "none", x0, left: 0, right: 0, top: 0, bottom: 0, cx: x0, cy: 0 };
  const e: Eye = { kind: "arc", x0, left: x0 - 12 + l / u, right: x0 - 12 + r / u, top: -9 + t / u, bottom: -9 + b / u, cx: x0 - 12 + sx / n / u, cy: -9 + sy / n / u };
  const w = e.right - e.left, h = e.bottom - e.top, fill = n / Math.max(1, (r - l + 1) * (b - t + 1));
  if (w < 10.5 && h > 6 && fill > 0.55) e.kind = "dot";
  else if (w >= 12 && h > 6.5) e.kind = "lid";
  return e;
};

// ------------------------------------------------------------------------------------------------------- lashes
/** JULIET'S LASHES: three flicks at the outer end of each eye (see the head of this file) */
export const lashes = (o: { col?: string; len?: number } = {}): Acc => {
  const len = o.len ?? 1;
  return {
    name: "lashes", slots: [], key: `rjLashes|${o.col ?? ""}|${len}`,
    face(f) {
      const col = o.col ?? f.INK;
      for (const s of [-1, 1]) {
        const e = eyeOf(f, s);
        if (e.kind === "none") continue;
        const flick = (x: number, y: number, dx: number, dy: number, w: number) => f.line(f.quad([x, y], [x + s * dx * 0.45, y + dy * 0.75], [x + s * dx, y + dy], 5), w, col);
        if (e.kind === "dot") {
          // on the dot's upper outer curve
          const ox = s > 0 ? e.right : e.left, mx = (e.left + e.right) / 2;
          flick(lerp(mx, ox, 0.62), e.top + 1.6, 3.4 * len, -3.6 * len, 2.2);
          flick(lerp(mx, ox, 0.98), e.top + 4.2, 4.4 * len, -2.0 * len, 2.2);
        } else {
          // at the outer end of the lid line (or of a shut eye's arc)
          const ox = s > 0 ? e.right : e.left, yo = firstInk(f, ox - s * 1.2, -9, 12) ?? e.top;
          flick(ox - s * 3.0, yo - 0.6, 3.0 * len, -4.0 * len, 2.2);
          flick(ox - s * 0.4, yo + 0.2, 4.6 * len, -2.4 * len, 2.2);
        }
      }
    },
  };
};

// ------------------------------------------------------------------------------------------------------- lips, cheeks
/** a soft lower lip under the mouth */
export const lips = (o: { col?: string; w?: number } = {}): Acc => {
  const col = o.col ?? "#e0717f", w = o.w ?? 5.2;
  return {
    name: "lips", slots: [], key: `rjLips|${col}|${w}`,
    faceUnder(f) { const [mx, my] = f.mouth; f.fill(f.arc(mx, my + 1.9, w, 2.7, 0, 360, 20), col, 0); },
  };
};
/** a round blush under each eye, k 0..1 (peak alpha) */
export const cheeks = (o: { k?: number; col?: string; r?: number; y?: number; x?: number } = {}): Acc => {
  const a = Math.max(0, Math.min(1, o.k ?? 0.5)), rgb = rgbOf(o.col ?? "#ee768c").join(","), R = o.r ?? 7.6, y = o.y ?? 10.4, x = o.x ?? 21.5;
  return {
    name: "cheeks", slots: ["cheek"], key: `rjCheeks|${a.toFixed(3)}|${rgb}|${R}|${y}|${x}`,
    face(fk) {
      const g = fk.g, u = fk.u, r = R * u;
      for (const s of [-1, 1]) {
        const [bx, by] = fk.px(s * x, y), gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
        gr.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`);
        gr.addColorStop(0.55, `rgba(${rgb},${(0.6 * a).toFixed(3)})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        g.save(); g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.62);
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
      }
    },
  };
};

// ------------------------------------------------------------------------------------------------------- shine
/** A CATCH-LIGHT in each open eye: a white dot high on the side of the light (screen left) and a smaller one low on the
 *  other side. Dot eyes and the pupil under a half lid take it; a slit, a shut eye, an arc are let be. */
export const shine = (o: { k?: number } = {}): Acc => {
  const k = o.k ?? 1;
  return {
    name: "shine", slots: [], key: `rjShine|${k}`,
    face(f) {
      for (const s of [-1, 1]) {
        const e = eyeOf(f, s);
        const dot = (x: number, y: number, r: number) => f.fill(f.arc(x, y, r, r * 1.08, 0, 360, 14), "#ffffff", 0);
        if (e.kind === "dot") {
          const mx = (e.left + e.right) / 2, w = e.right - e.left, h = e.bottom - e.top;
          dot(mx - 0.2 * w, e.top + 0.27 * h, 0.2 * w * k); dot(mx + 0.2 * w, e.top + 0.7 * h, 0.09 * w * k);
        } else if (e.kind === "lid") {
          // the pupil hangs under the lid line: find it in the lower rows
          const yl = firstInk(f, e.x0, -9, 6);
          if (yl === null) continue;
          let best = 0, bx = e.x0;
          for (let x = e.left + 2; x <= e.right - 2; x += 0.5) { const run = inkRun(f, x, yl + 0.2, 12); if (run > best) { best = run; bx = x; } }
          if (best < 6.2) continue;
          // the widest stretch of that depth is the pupil: take its middle
          let a = bx, b = bx;
          while (a > e.left && inkRun(f, a - 0.5, yl + 0.2, 12) > best * 0.72) a -= 0.5;
          while (b < e.right && inkRun(f, b + 0.5, yl + 0.2, 12) > best * 0.72) b += 0.5;
          const mx = (a + b) / 2, w = Math.max(4, b - a);
          dot(mx - 0.18 * w, yl + 3.4 + 0.12 * best, 0.19 * w * k); dot(mx + 0.2 * w, yl + 0.74 * best, 0.085 * w * k);
        }
      }
    },
  };
};

// ------------------------------------------------------------------------------------------------------- jewel
/** JULIET'S FERRONNIÈRE: a fine chain across the forehead (it runs up under the hair at both sides) and a drop at its
 *  middle. y = the drop's height (u above the eye line; the brows end near 21). */
export const jewel = (o: { gold?: string; gem?: string; y?: number } = {}): Acc => {
  const gold = o.gold ?? "#e2b03a", gem = o.gem ?? "#c4202e", y0 = -(o.y ?? 27.5);
  return {
    name: "jewel", slots: [], key: `rjJewel|${gold}|${gem}|${y0}`,
    face(f) {
      const ink = shadeHex(gold, 0.5);
      for (const s of [-1, 1]) {
        const pts = f.quad([0, y0 - 1.2], [s * 20, y0 - 2.2], [s * 41, y0 - 13], 14);
        f.line(pts, 2.3, ink); f.line(pts, 1.3, gold);
        // two small pearls on the chain
        for (const t of [5, 10]) { const [x, y] = pts[t]; f.fill(f.arc(x, y, 1.5, 1.5, 0, 360, 10), "#fbf6ea", 0.7); }
      }
      // the setting and the drop
      f.fill(f.arc(0, y0 - 0.6, 2.4, 2.1, 0, 360, 12), gold, 0.9);
      const drop: P2[] = [[0, y0 + 0.6], ...f.quad([0, y0 + 0.6], [3.9, y0 + 5.2], [0, y0 + 8.4], 8).slice(1), ...f.quad([0, y0 + 8.4], [-3.9, y0 + 5.2], [0, y0 + 0.6], 8).slice(1)];
      f.fill(drop, gem, 1.0);
      f.fill(f.arc(-0.8, y0 + 4.2, 0.8, 1.2, 0, 360, 8), "#ffd9de", 0);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- freckles
/** a few soft freckles over each cheek */
export const freckles = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? "#c98a66";
  return {
    name: "freckles", slots: [], key: `rjFreckles|${col}`,
    faceUnder(f) {
      for (const s of [-1, 1]) for (const [x, y, r] of [[16.5, 9.2, 0.75], [20.5, 8.2, 0.85], [24.2, 9.6, 0.7], [19, 11.4, 0.7], [22.8, 12.2, 0.75]] as number[][])
        f.fill(f.arc(s * x + f.jit(100 + x, 0.3), y, r, r, 0, 360, 8), col, 0);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- brows
/** the two brows as the rig drew them: for each, the top edge at three places (inner, middle, outer) */
const browEdge = (f: FaceKit, s: number, D = 6.2) => {
  const x0 = s * f.sp, yi = firstInk(f, x0 - s * D, -36, -3), ym = firstInk(f, x0, -36, -3), yo = firstInk(f, x0 + s * D, -36, -3);
  if (yi === null || ym === null || yo === null) return null;
  const b1 = (yo - yi) / 2, b2 = (yo + yi - 2 * ym) / 2;
  return { x0, D, edge: (t: number) => (Math.abs(t) <= 1 ? ym + b1 * t + b2 * t * t : (t > 0 ? yo : yi) + (b1 + 2 * b2 * Math.sign(t)) * (t - Math.sign(t)) * 0.5) };
};
/** SOFT BROWS: the rig's brows painted over in a colour (the hair's) and `weight` u thick, tapered to the outer end */
export const softBrows = (o: { col?: string; weight?: number; len?: number } = {}): Acc => {
  const weight = o.weight ?? 3.6, len = o.len ?? 1;
  return {
    name: "softBrows", slots: [], key: `rjSoftBrows|${o.col ?? ""}|${weight}|${len}`,
    face(f) {
      const col = o.col ?? f.look.hairCol;
      for (const s of [-1, 1]) {
        const B = browEdge(f, s);
        if (!B) continue;
        const X = (t: number) => B.x0 + s * B.D * t, tIn = -1.25 * len, tEnd = 1.4 * len, upper: P2[] = [], lower: P2[] = [];
        for (let k = 0; k <= 16; k++) {
          const t = lerp(tIn, tEnd, k / 16), e = B.edge(Math.max(Math.min(t, 1.45), -1.45)), u = k / 16;
          upper.push([X(t), e - 0.5]); lower.push([X(t), e - 0.5 + lerp(weight, weight * 0.42, u ** 1.3)]);
        }
        f.fill([...upper, ...lower.reverse()], col, 0);
      }
    },
  };
};
/** THE FRIAR'S BROWS: thick, pale, outlined, a little long at the outer ends where they droop */
export const bushyBrows = (o: { col?: string; weight?: number; droop?: number } = {}): Acc => {
  const weight = o.weight ?? 5.4, droop = o.droop ?? 3.2;
  return {
    name: "bushyBrows", slots: [], key: `rjBushyBrows|${o.col ?? ""}|${weight}|${droop}`,
    face(f) {
      const col = o.col ?? f.look.hairCol;
      for (const s of [-1, 1]) {
        const B = browEdge(f, s);
        if (!B) continue;
        const X = (t: number) => B.x0 + s * B.D * t, tIn = -1.3, tEnd = 1.75, upper: P2[] = [], lower: P2[] = [];
        for (let k = 0; k <= 18; k++) {
          const t = lerp(tIn, tEnd, k / 18), u = k / 18, e = B.edge(Math.max(Math.min(t, 1.45), -1.45)) + droop * Math.max(0, u - 0.62) ** 2 * 7;
          // a bushy upper edge: three small tufts
          upper.push([X(t), e - 1.4 - 1.1 * Math.abs(Math.sin(u * Math.PI * 3))]);
          lower.push([X(t), e - 0.6 + lerp(weight, weight * 0.55, u ** 1.2)]);
        }
        f.fill([...upper, ...lower.reverse()], col, 1.25);
      }
    },
  };
};

// ------------------------------------------------------------------------------------------------------- age, nose
/** THE FRIAR'S YEARS: a bag under each eye, a crow's foot at each outer corner, a line from beside the nose down */
export const ageLines = (o: { col?: string; k?: number } = {}): Acc => {
  const col = o.col ?? "#b98f78", k = o.k ?? 1;
  return {
    name: "ageLines", slots: [], key: `rjAge|${col}|${k}`,
    faceUnder(f) {
      for (const s of [-1, 1]) {
        const x = s * f.sp;
        f.line(f.quad([x - s * 6, 9.4], [x + s * 0.5, 12.6], [x + s * 7.4, 9.8], 7), 1.6 * k, col);
        f.line(f.quad([x + s * 11.6, -0.6], [x + s * 14.2, -1.4], [x + s * 16.4, -3.4], 5), 1.4 * k, col);
        f.line(f.quad([x + s * 11.9, 1.6], [x + s * 14.4, 2.2], [x + s * 16.6, 2.0], 5), 1.4 * k, col);
      }
    },
  };
};
/** a small round nose with a warm tint: the bridge is not drawn, only the tip's under-curve */
export const nose = (o: { col?: string; tint?: string; y?: number } = {}): Acc => {
  const tint = o.tint ?? "#e8a08c", y = o.y ?? 8.6;
  return {
    name: "nose", slots: [], key: `rjNose|${o.col ?? ""}|${tint}|${y}`,
    faceUnder(f) {
      const g = f.g, [bx, by] = f.px(0, y), r = 5.2 * f.u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r), rgb = rgbOf(tint).join(",");
      gr.addColorStop(0, `rgba(${rgb},0.85)`); gr.addColorStop(0.6, `rgba(${rgb},0.5)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.save(); g.translate(bx, by); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
      f.line(f.arc(0, y - 0.4, 3.6, 3.2, 20, 160, 12), 2.1, o.col ?? f.INK);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- beard
/** THE FRIAR'S BEARD: everything below a soft line from cheek to cheek that dips under the nose; the mouth is drawn on
 *  it. Pale colours take an ink outline along that line. Wear the kit's walrus moustache over it. */
export const fullBeard = (o: { col?: string; top?: number } = {}): Acc => {
  const col = o.col ?? "#c4c1c3", top = o.top ?? 0;
  return {
    name: "fullBeard", slots: ["chin"], key: `rjFullBeard2|${col}|${top}`,
    faceUnder(f) {
      // v2 (22 Nov): it starts LOW at the sides (along the jaw, below the cheeks, so the blush and the cheeks stay bare)
      // and rises to the mouth corners, where the walrus moustache takes over; the cheek part of its edge is a row of
      // soft tufts. v1 ran ear to ear at cheek level and read as a face mask.
      const [, my] = f.mouth, q = f.quad, strand = shadeHex(col, 0.78);
      const half = (s: number): P2[] => {
        const cheek = [...q([s * 58, 11 + top], [s * 49, 22 + top], [s * 35, 25 + top], 40), ...q([s * 35, 25 + top], [s * 23, 27 + top], [s * 13, my + 1.5 + top], 30).slice(1)];
        // the tufts: soft round bumps along the cheek part of the edge (a sine's upper halves: round tops, narrow notches)
        const tufted = cheek.map(([x, y], i): P2 => { const t = i / (cheek.length - 1); return [x, y - 2.0 * Math.sqrt(Math.abs(Math.sin(t * Math.PI * 5.5))) * (1 - t * 0.55)]; });
        return [...tufted, ...q([s * 13, my + 1.5 + top], [s * 6, my - 1.2 + top], [0, my - 0.6 + top], 5).slice(1)];
      };
      const upper = [...half(-1), ...half(1).reverse().slice(1)];
      f.fill([...upper, [64, 14], [56, 74], [-56, 74], [-64, 14]], col, 1.3);
      // a few soft strands, following the jaw
      for (const [x, y, dx] of [[-42, 30, 2.2], [-28, my + 13, 1.4], [-12, my + 17, 0.6], [12, my + 17, -0.6], [28, my + 13, -1.4], [42, 30, -2.2]] as number[][]) f.line(q([x, y], [x + dx, y + 4], [x + dx * 1.6, y + 7.5], 5), 1.4, strand);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- tears
/** TEARS: a pale blue stream from under each eye down the cheek to the jaw, a drop at its end */
export const tears = (o: { col?: string; w?: number } = {}): Acc => {
  const col = o.col ?? "#9fd8f4", w = o.w ?? 4.6;
  return {
    name: "tears", slots: [], key: `rjTears|${col}|${w}`,
    face(f) {
      const ink = shadeHex(col, 0.55);
      for (const s of [-1, 1]) {
        const e = eyeOf(f, s), x = e.kind === "none" ? s * f.sp : (e.left + e.right) / 2 + s * 1.2, y0 = (e.kind === "none" ? 2 : e.bottom) + 1.6;
        const mid = f.quad([x, y0], [x + s * 1.6, y0 + 12], [x + s * 4.2, y0 + 24], 10);
        f.line(mid, w + 1.6, ink); f.line(mid, w, col);
        const [dx, dy] = mid[mid.length - 1];
        f.fill(f.arc(dx + s * 0.4, dy + 1.4, w * 0.72, w * 0.86, 0, 360, 12), col, 0.8);
        f.line(f.quad([x - 0.9, y0 + 2], [x + s * 0.4, y0 + 9], [x + s * 2.2, y0 + 17], 6), 1.1, "#ffffff");
      }
    },
  };
};
