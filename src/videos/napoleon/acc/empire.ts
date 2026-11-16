// THE WARDROBE of the Napoleon film: accessories for the rig3d figures of group/kit (imported, never edited).
// Each function returns an Acc (group/kit/RIG3D.md "角色道具"); people.ts puts them on the figures.
//   uniform(o)    a French coat of 1796-1815 painted on the body: the cloth, two LAPELS buttoned back down the chest
//                 (the plastron), a standing collar, a white waistcoat showing in the cut-away below the waist, gold
//                 buttons; options: gold EPAULETTES, a tricolour SASH round the waist (a general of 1796), the star of
//                 the Légion d'honneur, gold oak-leaf embroidery on collar and lapels (a general), `wet` = soaked
//                 (darker below, drips). name "uniform"
//   greatcoat(o)  the grey redingote: plain grey cloth to the knees (3D skirt: the kit's short robe), broad lapels, two
//                 rows of buttons. name "coat"
//   sacre(o)      the coronation robe: crimson velvet sewn with gold bees over a white satin tunic, an ermine cape on
//                 the shoulders; long 3D skirt. name "coat"
//   gownLoose(o)  the loose white gown of Saint Helena (a long plain robe, open collar). name "coat"
//   bicorne(o)    HIS HAT, worn side to side (en bataille): a low black crown with the brim turned up front and back
//                 into one wide crescent whose two points stand out past the head; a tricolour cockade on the front
//                 flap. slots hat + crown. name "bicorne"
//   laurel(o)     the gold laurel wreath of the coronation: a band of leaves round the head, open at the brow. name "laurel"
//   strawHat(o)   the wide straw hat of the Longwood garden: a low crown and a broad drooping brim. name "strawHat"
// Rules (RIG3D.md): nothing random; nothing 3D in front of the face; colours between #2b2630 and #f4f1ea.
import * as THREE from "three";
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";
import { robe } from "../../../kit/acc/garb";

const hash = (n: number, k = 0) => { const s = Math.sin(n * 127.1 + k * 311.7 + 74.7) * 43758.5453; return s - Math.floor(s); };
const shadeHex = (col: string, k: number) => { const c = new THREE.Color(col); c.multiplyScalar(k); return "#" + c.getHexString(); };
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);
const disc = (c: OutfitKit, az: number, t: number, rm: number, col: string, stroke?: string, lw = 4) => {
  const [x, y] = c.P(az, t), rx = (c.az(rm, t) / 360) * c.W, ry = rm * c.pxUp(t), g = c.g;
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = col; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
};
export const EMPIRE = {
  green: "#3f6a4a", greenDeep: "#2f5239", blue: "#33466e", red: "#b23a36", white: "#f1ede2", gold: "#dcae4a", goldDeep: "#a87a28",
  grey: "#8d8b88", crimson: "#a02c3a", ermine: "#f2efe6", black: "#2e2a32", straw: "#d9c07c", cream: "#ebe4d2",
} as const;

// ------------------------------------------------------------------------------------------------------ uniform
export type UniformO = {
  /** the coat's cloth */ col: string;
  /** the lapels (default: the cloth) and their piping */ lapel?: string; piping?: string;
  /** the standing collar and the cuffs' colour (default: the cloth) */ collar?: string;
  /** the waistcoat and breeches showing below the cut-away */ vest?: string;
  button?: string;
  /** gold epaulettes with fringe */ epaulettes?: boolean;
  /** a tricolour sash round the waist */ sash?: boolean;
  /** gold oak-leaf embroidery along the collar and the lapels' edges */ embroidery?: boolean;
  /** the silver star on his left breast */ star?: boolean;
  /** soaked: 0..1 */ wet?: number;
};
export const uniform = (o: UniformO): Acc => {
  const lapel = o.lapel ?? o.col, piping = o.piping ?? EMPIRE.red, collar = o.collar ?? o.col, vest = o.vest ?? EMPIRE.white, button = o.button ?? EMPIRE.gold;
  const wet = Math.max(0, Math.min(1, o.wet ?? 0));
  const key = ["npUniform", o.col, lapel, piping, collar, vest, button, +!!o.epaulettes, +!!o.sash, +!!o.embroidery, +!!o.star, wet.toFixed(2)].join("|");
  return {
    name: "uniform", slots: ["coat"], key,
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(o.col, 0.42), g = c.g, wz = 0.36;      // wz = the waist: the coat is cut away below it
      ring(c, 0, 1, o.col);
      for (const az of [-150, -112, 110, 150]) c.line([P(az, 0.55), P(az + 3, 0.05)], c.shade(o.col, 0.84), 5);
      // the cut-away: the white waistcoat and breeches below the waist in front, the coat's edges sweeping back to the tails
      const L = bend(P(-7, wz), P(-30, wz * 0.55), P(-62, 0), 12), R = bend(P(7, wz), P(30, wz * 0.55), P(62, 0), 12);
      c.poly([...L, ...R.slice().reverse()], vest);
      for (let i = 0; i < 3; i++) disc(c, 0, wz - 0.06 - i * 0.085, 0.008, button, c.shade(button, 0.5), 3);
      for (const s of [L, R]) { c.line(s, c.shade(o.col, 1.25), 11); c.line(s, ink, 5); }
      // the lapels: two panels buttoned back from the throat to the waist, narrower at the waist
      for (const s of [-1, 1]) {
        const a0 = s * 2.5, top = ch - 0.02;
        const pts: P2[] = [P(a0, top), P(s * 30, top), ...bend(P(s * 31, top - 0.08), P(s * 27, wz + 0.16), P(s * 10, wz), 8), P(a0, wz)];
        c.poly(pts, lapel, ink, 5);
        c.line([P(s * 30, top), ...bend(P(s * 31, top - 0.08), P(s * 27, wz + 0.16), P(s * 10, wz), 8)], piping, 7);
        if (o.embroidery) for (let i = 0; i < 6; i++) { const t = top - 0.05 - i * 0.075, a = s * (25 - i * 2.4); c.line([P(a - s * 4, t + 0.015), P(a, t), P(a - s * 4, t - 0.015)], button, 5); }
        for (let i = 0; i < 5; i++) { const t = top - 0.06 - i * 0.085; disc(c, s * (24 - i * 2.6), t, 0.0085, button, c.shade(button, 0.5), 3); }
      }
      c.line([P(0, ch - 0.02), P(0, wz)], ink, 4);
      // the sash of a general of the Republic: three bands round the waist, a knot on his left hip with two ends
      if (o.sash) {
        const bands: [number, number, string][] = [[wz - 0.02, wz + 0.035, EMPIRE.red], [wz + 0.035, wz + 0.09, EMPIRE.white], [wz + 0.09, wz + 0.145, EMPIRE.blue]];
        for (const [t0, t1, col] of bands) ring(c, t0, t1, col);
        c.line([P(-180, wz - 0.02), P(180, wz - 0.02)], ink, 4); c.line([P(-180, wz + 0.145), P(180, wz + 0.145)], ink, 4);
        c.poly([P(52, wz + 0.1), P(64, wz + 0.1), P(70, wz - 0.2), P(60, wz - 0.22), P(56, wz - 0.03)], EMPIRE.red, ink, 4);
        c.poly([P(46, wz + 0.1), P(54, wz + 0.1), P(52, wz - 0.16), P(43, wz - 0.14)], EMPIRE.white, ink, 4);
        for (let i = 0; i < 5; i++) c.line([P(44 + i * 2, wz - 0.15), P(44 + i * 2, wz - 0.19)], button, 4);
      }
      // the standing collar
      c.poly([P(-64, ch + 0.07), P(64, ch + 0.07), P(60, ch - 0.035), P(4, ch - 0.02), P(0, ch - 0.06), P(-4, ch - 0.02), P(-60, ch - 0.035)], collar, ink, 5);
      if (o.embroidery) for (let i = 0; i < 7; i++) { const a = -48 + i * 16; if (Math.abs(a) > 6) c.line([P(a - 4, ch + 0.035), P(a, ch + 0.012), P(a + 4, ch + 0.035)], button, 5); }
      // epaulettes: a gold strap on each shoulder with a fringe
      if (o.epaulettes) for (const s of [-1, 1]) {
        c.poly([P(s * 64, ch + 0.05), P(s * 112, ch + 0.05), P(s * 116, ch - 0.035), P(s * 62, ch - 0.035)], button, c.shade(button, 0.5), 4);
        for (let i = 0; i < 7; i++) c.line([P(s * (84 + i * 5), ch - 0.035), P(s * (85 + i * 5.2), ch - 0.105)], i % 2 ? button : c.shade(button, 0.78), 6);
      }
      if (o.star) { const [x, y] = P(19, ch - 0.2); g.save(); g.translate(x, y); g.fillStyle = "#e6e3da"; g.strokeStyle = c.shade("#e6e3da", 0.5); g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 0.45 : 1) * 0.021 * c.pxUp(ch - 0.2), a = (i / 16) * Math.PI * 2; g.lineTo(Math.sin(a) * r, -Math.cos(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); disc(c, 19, ch - 0.2, 0.007, EMPIRE.red); }
      if (wet > 0) {
        g.save(); g.globalAlpha = 0.34 * wet; g.fillStyle = "#1e2630";
        const [, y0] = P(0, 0.62), [, y1] = P(0, 0); g.fillRect(0, Math.min(y0, y1), c.W, Math.abs(y1 - y0));
        g.globalAlpha = 0.5 * wet;
        for (let i = 0; i < 14; i++) { const az = -170 + i * 25 + 10 * hash(i, 1), t = 0.62 + 0.25 * hash(i, 2); c.line([P(az, t), P(az + 1, t - 0.1 - 0.12 * hash(i, 3))], "#1e2630", 6); }
        g.restore();
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------- greatcoat
/** THE GREY REDINGOTE: plain, to the knees, broad lapels and two rows of buttons. */
export const greatcoat = (o: { col?: string; button?: string; snow?: number } = {}): Acc => {
  const col = o.col ?? EMPIRE.grey, button = o.button ?? "#b9b2a2", snow = Math.max(0, Math.min(1, o.snow ?? 0));
  const skirt = robe({ col, band: shadeHex(col, 0.88), sash: false, skirt: "short", knot: false });
  return {
    name: "coat", slots: ["coat"], key: ["npGreat", col, button, snow.toFixed(2)].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(col, 0.42), g = c.g;
      ring(c, 0, 1, col);
      for (const az of [-150, -110, -70, 72, 110, 150]) c.line([P(az, 0.5), P(az + 3, 0.04)], c.shade(col, 0.84), 5);
      // the broad lapels: a notch each side, turned back to the chest
      for (const s of [-1, 1]) {
        c.poly([P(s * 2, ch - 0.02), P(s * 36, ch + 0.02), P(s * 40, ch - 0.12), P(s * 30, ch - 0.15), P(s * 33, ch - 0.2), P(s * 3, ch - 0.42)], c.shade(col, 1.1), ink, 5);
        for (let i = 0; i < 4; i++) disc(c, s * 15, ch - 0.47 - i * 0.11, 0.011, button, c.shade(button, 0.5), 3);
      }
      c.line([P(3, ch - 0.42), P(5, 0)], ink, 5);
      // the turned-down collar and a glimpse of the white stock at the throat
      c.poly([P(-60, ch + 0.07), P(60, ch + 0.07), P(56, ch - 0.02), P(-56, ch - 0.02)], c.shade(col, 0.9), ink, 5);
      c.poly([P(-7, ch + 0.05), P(7, ch + 0.05), P(4, ch - 0.05), P(-4, ch - 0.05)], EMPIRE.white, c.shade(EMPIRE.white, 0.6), 3);
      if (snow > 0) { g.save(); g.globalAlpha = 0.9 * snow; for (const s of [-1, 1]) c.poly([P(s * 58, ch + 0.075), P(s * 120, ch + 0.075), P(s * 124, ch + 0.01), P(s * 96, ch - 0.02), P(s * 60, ch + 0.02)], "#f4f1ea"); for (let i = 0; i < 26; i++) disc(c, -175 + 350 * hash(i, 4), 0.1 + 0.75 * hash(i, 5), 0.006 + 0.006 * hash(i, 6), "#f4f1ea"); g.restore(); }
    },
    build: skirt.build,
  };
};

// -------------------------------------------------------------------------------------------------------- sacre
/** a small gold BEE at (az, t), s = its size in metres */
const bee = (c: OutfitKit, az: number, t: number, s: number, col: string) => {
  disc(c, az, t, s * 0.55, col); disc(c, az, t + s * 0.9, s * 0.4, col);
  const [x, y] = c.P(az, t + s * 0.3), k = s * c.pxUp(t), g = c.g;
  g.save(); g.fillStyle = col; g.globalAlpha = 0.85;
  for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * k * 1.0, y, k * 0.9, k * 0.42, d * 0.5, 0, 7); g.fill(); }
  g.restore();
};
/** THE CORONATION ROBE (2 Dec 1804): crimson velvet sewn with gold bees, an ermine cape, a white satin tunic in front. */
export const sacre = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? EMPIRE.crimson, gold = EMPIRE.gold;
  const skirt = robe({ col, band: gold, sash: false, skirt: "long", knot: false });
  return {
    name: "coat", slots: ["coat"], key: ["npSacre", col].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(col, 0.42);
      ring(c, 0, 1, col);
      // the white tunic down the front between the robe's edges, a gold fringe along each edge
      const L = bend(P(-10, ch), P(-17, ch - 0.4), P(-30, 0), 10), R = bend(P(10, ch), P(17, ch - 0.4), P(30, 0), 10);
      c.poly([...L, ...R.slice().reverse()], EMPIRE.white);
      for (let i = 0; i < 4; i++) c.line([P(-9, 0.12 + i * 0.13), P(0, 0.08 + i * 0.13), P(9, 0.12 + i * 0.13)], gold, 5);
      for (const s of [L, R]) { c.line(s, gold, 14); c.line(s, ink, 4); }
      // bees, in staggered rows (seeded: the same every time)
      for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) { const az = -170 + k * 40 + (r % 2 ? 20 : 0), t = 0.08 + r * 0.115; if (Math.abs(az) > 36) bee(c, az, t, 0.014, gold); }
      // the ermine cape over the shoulders: white with black tails
      c.poly([P(-180, ch + 0.08), P(180, ch + 0.08), P(180, ch - 0.2), P(60, ch - 0.22), P(22, ch - 0.3), P(0, ch - 0.16), P(-22, ch - 0.3), P(-60, ch - 0.22), P(-180, ch - 0.2)], EMPIRE.ermine, c.shade(EMPIRE.ermine, 0.55), 5);
      for (let i = 0; i < 16; i++) { const az = -172 + i * 23, t = ch - 0.05 - 0.09 * (i % 2); if (Math.abs(az) > 8) c.line([P(az, t), P(az + 0.5, t - 0.035)], EMPIRE.black, 6); }
      // the collar of the Légion d'honneur: a gold chain across the ermine
      c.line(bend(P(-40, ch + 0.02), P(0, ch - 0.2), P(40, ch + 0.02), 12), gold, 9);
    },
    build: skirt.build,
  };
};
/** THE LOOSE WHITE GOWN of Saint Helena: long, plain, an open collar. */
export const gownLoose = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? EMPIRE.cream;
  const skirt = robe({ col, band: shadeHex(col, 0.9), sash: false, skirt: "long", knot: false });
  return {
    name: "coat", slots: ["coat"], key: ["npGown", col].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(col, 0.5);
      ring(c, 0, 1, col);
      for (const az of [-150, -105, -60, -24, 26, 62, 105, 150]) c.line([P(az, 0.7), P(az + 3, 0.03)], c.shade(col, 0.86), 5);
      c.poly([P(-2, ch + 0.02), P(-34, ch + 0.04), P(-30, ch - 0.1), P(-3, ch - 0.3)], c.shade(col, 1.04), ink, 4);
      c.poly([P(2, ch + 0.02), P(34, ch + 0.04), P(30, ch - 0.1), P(3, ch - 0.3)], c.shade(col, 1.04), ink, 4);
      c.line([P(0, ch - 0.3), P(1, 0)], ink, 4);
      // a cloth belt tied loosely
      ring(c, c.waist - 0.03, c.waist + 0.025, c.shade(col, 0.8));
    },
    build: skirt.build,
  };
};

// ------------------------------------------------------------------------------------------------------ headwear
type ToM = (v: THREE.Vector3) => THREE.Vector3;
/** a closed surface from rows of [half width x, half depth z, height y, droop]: each row an ellipse round the head's
 *  axis (pointed a little at the sides by `sharp`), its points lowered by droop x (how far toward the side)^2. uv: u
 *  round the head (0.5 = the face side), v by length up the rows. */
const rowsGeo = (toM: ToM, rows: [number, number, number, number][], sharp = 1, seg = 56) => {
  const n = rows.length, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3(), len = [0];
  for (let k = 1; k < n; k++) len.push(len[k - 1] + Math.hypot(rows[k][0] - rows[k - 1][0], rows[k][2] - rows[k - 1][2]) + Math.abs(rows[k][1] - rows[k - 1][1]) * 0.5);
  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI + (2 * Math.PI * (i % seg)) / seg, sx = Math.sin(a), cz0 = Math.cos(a), cz = Math.sign(cz0) * Math.abs(cz0) ** sharp;
    for (let k = 0; k < n; k++) { const [hx, hz, y, dr] = rows[k]; toM(v.set(hx * sx, y - dr * sx * sx, hz * cz)); pos.push(v.x, v.y, v.z); uv.push(i / seg, len[k] / len[n - 1]); }
  }
  for (let i = 0; i < seg; i++) for (let k = 0; k < n - 1; k++) { const A = i * n + k, B = A + 1, C = A + n, D = C + 1; idx.push(A, C, B, B, C, D); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // one normal per position (the seam and the poles share theirs: an ink hull stays closed)
  const Pn = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(Pn.getX(i) * 1e5)},${Math.round(Pn.getY(i) * 1e5)},${Math.round(Pn.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < Pn.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < Pn.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere(); g.userData.vAt = len.map((l) => l / len[n - 1]);
  return g;
};
/** HIS HAT (see the head of this file). wide = how far the points stand out (1 = 1.5 head radii from the axis), tall =
 *  the crescent's height. */
export const bicorne = (o: { col?: string; wide?: number; tall?: number; cockade?: boolean; snow?: number } = {}): Acc => {
  const col = o.col ?? EMPIRE.black, wide = o.wide ?? 1, tall = o.tall ?? 1, cockade = o.cockade ?? true, snow = Math.max(0, Math.min(1, o.snow ?? 0));
  return {
    name: "bicorne", slots: ["hat", "crown"], key: ["bicorne", col, wide, tall, +cockade, snow.toFixed(2)].join("|"), hat: { rim: 40, hair: "keep", shade: false },
    build(b) {
      b.tilt(0, -5);
      const W = 1.42 * wide, top = 0.8 + 0.95 * tall;
      const rows: [number, number, number, number][] = [
        [0.4, 0.42, 0.5, 0], [0.64, 0.66, 0.78, 0],
        [W, 0.72, 0.8, 0.1], [W + 0.02, 0.62, 0.9, 0.16],
        [W - 0.05, 0.44, 0.8 + 0.4 * (top - 0.8), 0.1 + 0.4 * (top - 0.88)], [W - 0.12, 0.27, 0.8 + 0.7 * (top - 0.8), 0.1 + 0.7 * (top - 0.88)],
        [W - 0.2, 0.13, 0.8 + 0.92 * (top - 0.8), 0.1 + 0.92 * (top - 0.88)], [W - 0.25, 0.03, top, 0.1 + (top - 0.88)], [0, 0, top - 0.01, 0],
      ];
      const g = rowsGeo(b.toM, rows, 1.25);
      const map = b.tex(512, 256, (cg) => {
        cg.fillStyle = col; cg.fillRect(0, 0, 512, 256);
        // a gold braid along the crescent's top edge
        cg.fillStyle = "#c9a04a"; cg.fillRect(0, 256 * 0.1, 512, 5);
        if (cockade) {   // on the front flap, toward his left: blue, white, red, and a gold loop down to the brim
          const x = 512 * 0.56, y = 256 * (1 - 0.5);
          cg.strokeStyle = "#f0c860"; cg.lineWidth = 7; cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x - 4, y + 70); cg.stroke();
          for (const [r, c2] of [[24, "#e04a44"], [16, "#f4f1ea"], [8.5, "#5a78c8"]] as [number, string][]) { cg.fillStyle = c2; cg.beginPath(); cg.ellipse(x, y, r * 0.8, r, 0, 0, 7); cg.fill(); }
        }
        if (snow > 0) { cg.fillStyle = `rgba(244,241,234,${0.95 * snow})`; cg.fillRect(0, 0, 512, 256 * 0.13); }
      }, `bicorne|${+cockade}|${snow.toFixed(2)}`);
      b.solid("head", g, { col: "#ffffff", map, ink: 0.01 });
      b.shadow({ y: 0.78, r: 0.95, rSide: 1.2 });
    },
  };
};
/** THE LAUREL WREATH: a gold band of leaves round the head above the ears, open over the brow. */
export const laurel = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? EMPIRE.gold;
  return {
    name: "laurel", slots: ["crown"], key: ["laurel", col].join("|"), noHairProps: true,
    build(b) {
      b.tilt(0, -14);
      const leaf = new THREE.SphereGeometry(1, 10, 8).scale(0.2 * b.R, 0.085 * b.R, 0.05 * b.R);
      const mat = { col, ink: 0.006 };
      for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
        const a = ((22 + i * 23) * Math.PI) / 180 * s, y = 0.5, r = Math.sqrt(1 - y * y) * 1.07;
        for (const up of [-1, 1]) {
          const m = b.put(b.solid("head", leaf, mat), Math.sin(a) * r, y + up * 0.07, Math.cos(a) * r);
          m.rotation.set(0, a + (s * Math.PI) / 2, up * 0.45 * -s, "YXZ");
        }
      }
    },
  };
};
/** THE STRAW HAT of the Longwood garden: a low round crown, a ribbon, a broad brim that droops a little. */
export const strawHat = (o: { col?: string; band?: string } = {}): Acc => {
  const col = o.col ?? EMPIRE.straw, band = o.band ?? "#6a5a48";
  return {
    name: "strawHat", slots: ["hat", "crown"], key: ["strawHat", col, band].join("|"), hat: { rim: 46, hair: "keep", shade: true },
    build(b) {
      b.tilt(0, -8);
      const rows: [number, number, number, number][] = [[0.42, 0.44, 0.5, 0], [0.72, 0.74, 0.7, 0], [0.76, 0.78, 0.9, 0], [0.74, 0.76, 1.12, 0], [0.56, 0.58, 1.26, 0], [0, 0, 1.3, 0]];
      const g = rowsGeo(b.toM, rows, 1, 44), vAt = g.userData.vAt as number[];
      const map = b.tex(256, 256, (cg) => {
        cg.fillStyle = "#ffffff"; cg.fillRect(0, 0, 256, 256);
        cg.strokeStyle = "rgba(120,90,40,0.28)"; cg.lineWidth = 2; for (let y = 4; y < 256; y += 11) { cg.beginPath(); cg.moveTo(0, y); cg.lineTo(256, y); cg.stroke(); }
        const y0 = 256 * (1 - vAt[2]), y1 = 256 * (1 - vAt[1]); cg.fillStyle = band; cg.fillRect(0, y0 - 2, 256, y1 - y0 - 8);
      }, `straw|${band}`);
      b.solid("head", g, { col, map, ink: 0.009 });
      b.solid("head", b.brim({ rIn: 0.5, y: 0.7, out: 0.95, droop: 0.16, thick: 0.09, join: 0.74 } as never), { col, ink: 0.008 });
    },
  };
};
