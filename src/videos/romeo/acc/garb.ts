// GARB of 采访罗密欧与朱丽叶 (design stage): what the three wear on the body. Accessories for the rig3d figures of
// group/kit (imported, never edited). Painted garments go on the body's wrap (OutfitKit: az = degrees round the body,
// 0 = the front; t = height, 0 = the body's bottom .. 1 = its top; the head hides what is above t = chin).
//   doublet(o)    ROMEO: a fitted doublet: a small white ruff at the throat, a gold-buttoned front, slashes on the
//                 chest that show the shirt, a belt with a gold buckle, the skirt tabs below it. slot coat
//   peplum(o)     ROMEO: the doublet's short flared skirt in 3D round the hips (it covers the tops of the legs)
//   puffs(o)      puffed sleeve heads in 3D on both shoulders, paned (stripes of a second colour). slot shoulder
//   gown(o)       JULIET: painted OVER the kit robe (which gives the 3D skirt): a square neck with the white chemise in
//                 it, a gold band with pearls round the neck, a laced front, a jewelled girdle at the high waist
//   habit(o)      THE FRIAR: painted OVER the kit robe: a plain habit, the white rope round the waist with its knot
//   ropeEnd(o)    THE FRIAR: the rope's hanging end with its three knots, in 3D down his right side
//   cowl(o)       THE FRIAR: the hood down: a thick roll of cloth round the neck and shoulders, its point down the back
import * as THREE from "three";
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";
import { turned, shade } from "../../group/kit/rigacc/shapes";
import { leafGeo, weld } from "../../wanbi/acc/envoy";
import { cape } from "../../../kit/acc/garb";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);
const hoopLine = (c: OutfitKit, t: number, col: string, lw: number) => c.line([c.P(-180, t), c.P(180, t)], col, lw);
const disc = (c: OutfitKit, az: number, t: number, rm: number, col: string, stroke?: string, lw = 4, tall = 1) => {
  const [x, y] = c.P(az, t), rx = (c.az(rm, t) / 360) * c.W, ry = rm * c.pxUp(t) * tall, g = c.g;
  for (const dx of [0, -c.W, c.W]) {
    if (x + dx + rx < 0 || x + dx - rx > c.W) continue;
    g.beginPath(); g.ellipse(x + dx, y, rx, ry, 0, 0, 7); g.fillStyle = col; g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
};
/** where the kit robe's sash sits (kit garb.ts SASH_T): the skirt takes over just below it */
const WAIST = 0.385;

// ------------------------------------------------------------------------------------------------------- Romeo
export type DoubletO = { col?: string; trim?: string; shirt?: string; belt?: string; skirt?: string };
/** ROMEO'S DOUBLET (see the head of this file) */
export const doublet = (o: DoubletO = {}): Acc => {
  const trim = o.trim ?? "#e2b03a", shirt = o.shirt ?? "#f7f1e3", belt = o.belt ?? "#5b3a22";
  return {
    name: "doublet", slots: ["coat"], key: ["rjDoublet", o.col ?? "", trim, shirt, belt, o.skirt ?? ""].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, skirt = o.skirt ?? c.shade(col, 0.82), ink = c.shade(col, 0.4), P = c.P, ch = c.chin, bt = 0.27;
      ring(c, 0, 1, col);
      // the side seams and a soft fold each side of the front
      for (const az of [-92, 92]) c.line([P(az, ch), P(az, bt)], c.shade(col, 0.78), 5);
      // slashes on the chest: three slanted cuts each side, the shirt showing through
      for (const s of [-1, 1]) for (const [t, a] of [[0.66, 30], [0.555, 33], [0.45, 30]] as number[][]) {
        const cut = [P(s * (a - 9), t + 0.045), P(s * (a + 7), t + 0.012), P(s * (a + 9), t - 0.045), P(s * (a - 7), t - 0.012)];
        c.poly(cut, shirt, ink, 4);
      }
      // the front: a gold edge down the middle and a row of round gold buttons
      c.line([P(-5, ch + 0.02), P(-5, bt + 0.03)], c.shade(trim, 0.5), 7); c.line([P(-5, ch + 0.02), P(-5, bt + 0.03)], trim, 4);
      c.line([P(5, ch + 0.02), P(5, bt + 0.03)], c.shade(trim, 0.5), 7); c.line([P(5, ch + 0.02), P(5, bt + 0.03)], trim, 4);
      for (const t of [0.69, 0.6, 0.51, 0.42, 0.335]) { disc(c, 0, t, 0.0125, trim, c.shade(trim, 0.45), 4); disc(c, -1.2, t + 0.006, 0.004, "#fff6d8"); }
      // the ruff: a ring of small white scallops under the chin
      const top: P2[] = [], low: P2[] = [];
      for (let az = -180; az <= 180; az += 4) { top.push(P(az, 1)); low.push(P(az, ch - 0.035 - 0.022 * Math.abs(Math.sin(rad(az * 4.5))))); }
      c.poly([...top, ...low.slice().reverse()], shirt);
      c.line(low, c.shade(shirt, 0.55), 4);
      for (let az = -160; az <= 160; az += 20) c.line([P(az, ch + 0.02), P(az, ch - 0.03)], c.shade(shirt, 0.8), 3);
      // the skirt tabs below the belt: a darker blue, split into tabs
      ring(c, 0, bt, skirt);
      for (let az = -165; az <= 180; az += 30) c.line([P(az, bt), P(az, 0.02)], c.shade(skirt, 0.55), 5);
      hoopLine(c, 0.035, trim, 5);
      // the belt and its buckle
      const h = 0.034, bi = c.shade(belt, 0.45);
      ring(c, bt - h, bt + h, belt); hoopLine(c, bt + h, bi, 4); hoopLine(c, bt - h, bi, 4);
      const a = c.az(0.03, bt), bq = c.az(0.014, bt);
      c.poly([P(-a, bt + 0.058), P(a, bt + 0.058), P(a, bt - 0.058), P(-a, bt - 0.058)], trim, c.shade(trim, 0.42), 5);
      c.poly([P(-bq, bt + 0.024), P(bq, bt + 0.024), P(bq, bt - 0.024), P(-bq, bt - 0.024)], c.shade(belt, 0.8));
    },
  };
};
/** THE DOUBLET'S SHORT SKIRT in 3D: a flared ring from the belt down over the hips (see the head of this file) */
export const peplum = (o: { col?: string; trim?: string; flare?: number; drop?: number } = {}): Acc => {
  const trim = o.trim ?? "#e2b03a", flare = o.flare ?? 1.32, drop = o.drop ?? 0.055;
  return {
    name: "peplum", slots: [], key: ["rjPeplum", o.col ?? "", trim, flare, drop].join("|"),
    build(b) {
      const col = o.col ?? shade(b.look.topCol, 0.82), Ht = b.Ht, y1 = 0.25 * Ht, r1 = b.bodyR(0.25) + 0.004, r0 = b.rb * flare;
      const g = turned([[0, -drop + 0.03], [r0 - 0.014, -drop + 0.004], [r0, -drop + 0.012], [r1, y1], [0, y1]], 0.006, 40), v = g.userData.v as number[];
      const map = b.tex(256, 128, (cg) => {
        const Y = (t: number) => 128 * (1 - t);
        cg.fillStyle = col; cg.fillRect(0, 0, 256, 128);
        cg.fillStyle = shade(col, 0.6); for (let x = 0; x < 256; x += 32) cg.fillRect(x, Y(v[3]), 3.5, Y(v[2]) - Y(v[3]));          // the tabs' splits
        cg.fillStyle = trim; cg.fillRect(0, Y(v[2]) - 10, 256, 10);                                                               // a gold edge along the hem
        cg.fillStyle = shade(col, 0.55); cg.fillRect(0, Y(v[2]), 256, 128);                                                        // the underside
      }, `rjPeplum|${col}|${trim}`);
      b.solid("body", g, { map, paint: "cloth", ink: 0.0075 });
    },
  };
};
/** PUFFED SLEEVE HEADS (see the head of this file): col = the cloth, pane = the stripes (the lining pulled through),
 *  size = the puff's radius in metres */
export const puffs = (o: { col?: string; pane?: string; size?: number; band?: string | false } = {}): Acc => {
  const pane = o.pane ?? "#f7f1e3", size = o.size ?? 0.05, band = o.band === undefined ? "#e2b03a" : o.band;
  return {
    name: "puffs", slots: ["shoulder"], key: ["rjPuffs", o.col ?? "", pane, size, band].join("|"),
    build(b) {
      const col = o.col ?? b.look.topCol, Ht = b.Ht;
      const map = b.tex(256, 128, (cg) => {
        // (u round the puff's own axis, which points out along the arm; v from its outer pole to the body)
        cg.fillStyle = col; cg.fillRect(0, 0, 256, 128);
        for (let i = 0; i < 8; i++) {
          const x = i * 32 + 16;
          cg.beginPath(); cg.ellipse(x, 64, 6.5, 44, 0, 0, 7); cg.fillStyle = pane; cg.fill(); cg.lineWidth = 3; cg.strokeStyle = shade(col, 0.5); cg.stroke();
        }
        if (band) { cg.fillStyle = band; cg.fillRect(0, 0, 256, 13); cg.fillStyle = shade(band, 0.5); cg.fillRect(0, 13, 256, 3); }
      }, `rjPuff|${col}|${pane}|${band}`);
      for (const s of [-1, 1]) {
        const r = b.bodyR(0.84, s * 72), x = s * Math.sin(rad(72)) * (r + size * 0.42), z = Math.cos(rad(72)) * (r + size * 0.42);
        const geo = new THREE.SphereGeometry(size, 24, 16); geo.scale(1.0, 1.12, 1.0);
        const m = b.solid("body", weld(geo), { map, paint: "cloth", ink: 0.0075 });
        // the ball's own axis (its poles) along the arm at rest: down and a little out
        m.position.set(x, 0.835 * Ht, z); m.rotation.z = s * rad(-158);
      }
    },
  };
};

/** ROMEO'S SHORT CAPE: the kit cape's cloth in 3D down his back, but painted on the shoulders and the back only (the
 *  kit's cape paints a closed front): the doublet's front stays open to view, and a gold cord with a round clasp
 *  runs across the chest from shoulder to shoulder. List it AFTER the doublet. */
export const shortCape = (o: { col?: string; lining?: string; len?: number; cord?: string } = {}): Acc => {
  const col = o.col ?? "#1f3f86", lining = o.lining ?? "#e2b03a", cord = o.cord ?? "#e2b03a", k = cape({ col, lining, len: o.len ?? 0.14, clasp: cord });
  return {
    ...k, key: ["rjShortCape", k.key, cord].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(col, 0.4), lo = 0.5;
      // the cloth over each shoulder and all the way round the back, its front edges turned out to show the lining
      for (const s of [-1, 1]) {
        const edge = bend(P(s * 50, 1), P(s * 60, ch - 0.12), P(s * 84, lo), 10);
        c.poly([P(s * 180, 1), ...edge.slice().reverse(), P(s * 180, lo)], col);
        c.poly([P(s * 180, lo), P(s * 84, lo), P(s * 92, lo - 0.1), P(s * 180, lo - 0.1)], col);
        c.line(edge, ink, 19); c.line(edge, lining, 11);
      }
      // the cord: a shallow curve across the chest just under the ruff, a clasp at each end
      const cd = bend(P(-56, ch - 0.07), P(0, ch - 0.115), P(56, ch - 0.07), 14);
      c.line(cd, c.shade(cord, 0.45), 9); c.line(cd, cord, 5);
      for (const s of [-1, 1]) disc(c, s * 56, ch - 0.07, 0.016, cord, c.shade(cord, 0.45), 4);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- Juliet
export type GownO = { col?: string; trim?: string; chemise?: string; pearl?: string; lace?: string; panel?: string };
/** JULIET'S GOWN, painted over the kit robe (list it AFTER robe(): it covers the robe's collar and sash) */
export const gown = (o: GownO = {}): Acc => {
  const trim = o.trim ?? "#e2b03a", chem = o.chemise ?? "#f8f2e6", pearl = o.pearl ?? "#fbf6ea";
  return {
    name: "gown", slots: [], key: ["rjGown", o.col ?? "", trim, chem, pearl, o.lace ?? "", o.panel ?? ""].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, panel = o.panel ?? c.shade(col, 0.74), lace = o.lace ?? trim, ink = c.shade(col, 0.4), ti = c.shade(trim, 0.48), P = c.P, ch = c.chin, nk = ch - 0.115, w = 40, wt = WAIST;
      ring(c, 0, 1, col);
      // soft folds under the bust at the sides
      for (const az of [-150, -105, 105, 150]) c.line([P(az, wt + 0.3), P(az + 2, wt + 0.06)], c.shade(col, 0.82), 5);
      // the front panel (a darker red) from the neckline down to the waist, narrowing
      c.poly([P(-17, nk), P(17, nk), P(10, wt + 0.03), P(-10, wt + 0.03)], panel, ink, 4);
      // its lacing: gold crosses
      for (let k = 0; k < 4; k++) {
        const t1 = nk - 0.035 - k * 0.062, t0 = t1 - 0.05, a1 = 13 - k * 1.4, a0 = 12 - k * 1.4;
        c.line([P(-a1, t1), P(a0, t0)], lace, 4); c.line([P(a1, t1), P(-a0, t0)], lace, 4);
      }
      // the square neck: the chemise shows in it (gathered: fine lines), a gold band with pearls runs round it
      const neck: P2[] = [P(-w, 1), P(-w, nk), P(w, nk), P(w, 1)];
      c.poly(neck, chem);
      for (let az = -w + 6; az < w; az += 6.5) c.line([P(az, ch + 0.03), P(az * 0.96, nk + 0.012)], c.shade(chem, 0.86), 3);
      // the shoulder straps go on round the back of the neck
      c.line([P(-w, 1), P(-w, nk), P(w, nk), P(w, 1)], ti, 23); c.line([P(-w, 1), P(-w, nk), P(w, nk), P(w, 1)], trim, 15);
      for (let az = -w + 8; az <= w - 8; az += 8) disc(c, az, nk, 0.0075, pearl, c.shade(pearl, 0.55), 2.5);
      for (const s of [-1, 1]) for (const t of [nk + 0.05, nk + 0.1]) disc(c, s * w, t, 0.0075, pearl, c.shade(pearl, 0.55), 2.5);
      // the girdle at the high waist: a gold band, darker edges, red and pearl stones
      const h = 0.036;
      ring(c, wt - h, wt + h, trim); hoopLine(c, wt + h, ti, 4); hoopLine(c, wt - h, ti, 4);
      for (let az = -168; az <= 180; az += 24) disc(c, az, wt, 0.0095, az % 48 === 0 ? "#c4202e" : pearl, ti, 3);
    },
  };
};
/** THE GIRDLE'S END: a short chain down the front of the skirt from the girdle with a gold pomander on it */
export const girdleEnd = (o: { col?: string; len?: number } = {}): Acc => {
  const col = o.col ?? "#e2b03a", len = o.len ?? 0.11;
  return {
    name: "girdleEnd", slots: [], key: ["rjGirdleEnd", col, len].join("|"),
    build(b) {
      const Ht = b.Ht, y0 = (WAIST - 0.03) * Ht, r = b.bodyR(WAIST - 0.03, 0) + 0.018;
      const chain = new THREE.CylinderGeometry(0.0085, 0.0085, len, 10, 1);
      b.solid("body", weld(chain), { col, ink: 0.005 }).position.set(0, y0 - len / 2, r + 0.004);
      const ball = new THREE.SphereGeometry(0.021, 16, 12);
      b.solid("body", weld(ball), { col, ink: 0.006 }).position.set(0, y0 - len - 0.012, r + 0.008);
      const gem = new THREE.SphereGeometry(0.0105, 12, 10);
      b.solid("body", weld(gem), { col: "#c4202e", ink: 0.004 }).position.set(0, y0 - len - 0.012, r + 0.026);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- the Friar
/** THE FRIAR'S HABIT, painted over the kit robe (list it AFTER robe()): plain cloth, the rope and its knot */
export const habit = (o: { col?: string; rope?: string; knotAz?: number } = {}): Acc => {
  const rope = o.rope ?? "#efe6d0", ka = o.knotAz ?? -34;
  return {
    name: "habit", slots: [], key: ["rjHabit", o.col ?? "", rope, ka].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, P = c.P, ch = c.chin, wt = WAIST, ri = c.shade(rope, 0.5);
      ring(c, 0, 1, col);
      // heavy folds down the cloth
      for (const az of [-150, -112, -70, -22, 26, 74, 116, 152]) c.line([P(az, ch - 0.12), P(az + 3, wt + 0.07)], c.shade(col, 0.8), 6);
      for (const az of [-130, -48, 50, 134]) c.line([P(az, wt - 0.06), P(az + 2, 0.1)], c.shade(col, 0.8), 6);
      // the front seam
      c.line([P(0, ch), P(0, wt + 0.05)], c.shade(col, 0.62), 4);
      // the rope: two cords, the twist drawn as short slanted strokes
      const h = 0.03;
      ring(c, wt - h, wt + h, rope); hoopLine(c, wt + h, ri, 4); hoopLine(c, wt - h, ri, 4); hoopLine(c, wt, c.shade(rope, 0.78), 3);
      for (let az = -176; az < 180; az += 9) c.line([P(az, wt - h * 0.8), P(az + 4, wt + h * 0.8)], c.shade(rope, 0.7), 2.5);
      // the knot, at the front of his right hip
      disc(c, ka, wt, 0.026, rope, ri, 4, 1.0); disc(c, ka - 1.5, wt + 0.006, 0.009, c.shade(rope, 0.78));
    },
  };
};
/** THE ROPE'S END: it hangs from the knot down his right side with three knots on it */
export const ropeEnd = (o: { col?: string; len?: number; az?: number; out?: number } = {}): Acc => {
  const col = o.col ?? "#efe6d0", len = o.len ?? 0.3, az = rad(o.az ?? -34), out = o.out ?? 0.03;
  return {
    name: "ropeEnd", slots: [], key: ["rjRopeEnd", col, len, az, out].join("|"),
    build(b) {
      const Ht = b.Ht, y0 = (WAIST - 0.02) * Ht, sn = Math.sin(az), cs = Math.cos(az);
      // the skirt flares out below the waist: the rope leans out with it
      const at = (d: number) => { const r = b.bodyR(WAIST, (az * 180) / Math.PI) + out + d * 0.2; return V(sn * r, y0 - d, cs * r); };
      const p0 = at(0), p1 = at(len), mid = p0.clone().lerp(p1, 0.5), dir = p1.clone().sub(p0).normalize();
      const cord = new THREE.CylinderGeometry(0.0095, 0.0095, len, 10, 1), m = b.solid("body", weld(cord), { col, ink: 0.005 });
      m.position.copy(mid); m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().negate());
      for (const t of [0.42, 0.66, 0.9]) { const k = new THREE.SphereGeometry(0.0185, 14, 10); b.solid("body", weld(k), { col, ink: 0.0055 }).position.copy(p0.clone().lerp(p1, t)); }
      // the frayed end
      const tip = new THREE.ConeGeometry(0.017, 0.04, 12); const tm = b.solid("body", weld(tip), { col: shade(col, 0.9), ink: 0.005 }); tm.position.copy(at(len + 0.02)); tm.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().negate());
    },
  };
};
/** THE COWL (see the head of this file): roll = the roll's thickness (m); point = the hood's point down the back */
export const cowl = (o: { col?: string; roll?: number; point?: boolean } = {}): Acc => {
  const rt = o.roll ?? 0.052, point = o.point ?? true;
  return {
    name: "cowl", slots: ["neck"], key: ["rjCowl", o.col ?? "", rt, point].join("|"),
    build(b) {
      const col = o.col ?? shade(b.look.topCol, 0.88), Ht = b.Ht, yc = 0.8 * Ht, NS = 48, NC = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [];
      // a fat ring round the body at the collar bone: lower in front (the throat shows), thicker at the back
      for (let i = 0; i <= NS; i++) {
        const a = (i / NS) * Math.PI * 2, azd = (a * 180) / Math.PI, sn = Math.sin(a), cs = Math.cos(a), back = 0.5 - 0.5 * cs, R0 = b.bodyR(0.8, azd) + 0.02 + 0.012 * back, dy = -0.03 * cs, th = rt * (0.86 + 0.34 * back);
        for (let j = 0; j < NC; j++) {
          const p = (j / NC) * Math.PI * 2, rr = R0 + th * 0.86 * Math.cos(p), y = yc + dy + th * Math.sin(p);
          pos.push(rr * sn, y, rr * cs); uv.push(i / NS, j / NC);
        }
      }
      for (let i = 0; i < NS; i++) for (let j = 0; j < NC; j++) { const A = i * NC + j, Bq = i * NC + ((j + 1) % NC), C = A + NC, D = Bq + NC; idx.push(A, C, Bq, Bq, C, D); }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      const map = b.tex(256, 64, (cg) => {
        cg.fillStyle = col; cg.fillRect(0, 0, 256, 64);
        cg.fillStyle = shade(col, 0.8); for (let x = 10; x < 256; x += 32) cg.fillRect(x, 0, 4, 64);            // folds across the roll
      }, `rjCowl|${col}`);
      b.solid("body", weld(g), { map, paint: "cloth", ink: 0.0085 });
      if (point) {
        // the hood's bag: a soft drop from the back of the roll down between the shoulder blades
        const rb0 = b.bodyR(0.78, 180) + 0.03, rb1 = b.bodyR(0.5, 180) + 0.045;
        b.solid("body", leafGeo((v) => v, V(0, yc + 0.03, -rb0), V(0, 0.66 * Ht, -rb0 - 0.07), V(0, 0.42 * Ht, -rb1), 0.17, 0.085, 0.4), { col, paint: "cloth", ink: 0.0085 });
      }
      b.keepOut(V(0, yc, 0), 0.02);
    },
  };
};
