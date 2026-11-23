// THE BACKS OF THEIR HEADS (v3b, 23 Nov 2026). The owner: "the hair from back needs to be appealing as well". From
// behind, v3 showed a smooth helmet of hair (hers blonde, his brown under the beret) with nothing to look at. The way
// 拉的女儿 did her back (costume.ts locks(), read on the Drive on 23 Nov): the long hair down the back is a part of the
// BODY, not of the head, so a nod or a turn of the head does not swing it through the back; its top is hidden inside
// the head. Here, in this film's own folder (the rig is only used, never edited):
//   backFall(o)   JULIET: her long hair down her back, from under the shell's edge at the nape to the waist, in
//                 pointed locks (the middle ones longest), each lock swelling a little (creases between them), a
//                 shine band across it at the shoulders and fine strands. On the body. name "backFall"
//   backBow(o)    JULIET: a big Capulet-red bow on the back of her head (the hair half up, tied with it), its loops
//                 turned in to follow the head and two ribbon ends down the back of the hair. name "backBow"
//   napeLocks(o)  ROMEO: layered pointed locks at the back of his head under the beret, flicking out at the nape,
//                 so his hair ends in points instead of a bowl's rim. name "napeLocks"
// Head units: the head's radius = 1; x = the person's left, y = up, z = the face side, from the head's centre.
// Body: metres from the bottom of the body on its axis, the same axes (y = Ht at its top).
import * as THREE from "three";
import type { Acc, PartKit } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { meshOf, weld } from "../../wanbi/acc/envoy";
import { shellPoint, type ShellO } from "./hair";

type V3 = THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

/** faces turned so the normal at vertex m points away from `from` (a closed solid's normals must point out) */
const outFrom = (pos: number[], uv: number[], idx: number[], m: number, from: V3) => {
  const g = meshOf(pos, uv, idx), P = g.attributes.position, N = g.attributes.normal;
  if ((P.getX(m) - from.x) * N.getX(m) + (P.getY(m) - from.y) * N.getY(m) + (P.getZ(m) - from.z) * N.getZ(m) >= 0) return g;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  return meshOf(pos, uv, idx);
};

/** A POINTED LOCK along the curve p0 -> p1 -> p2 (head units, mapped to metres by toM): `wide` across the direction
 *  `side` (made square to the curve: a lock lies flat ON the head, where the kit's leaf stands out of it as a fin),
 *  `deep` thick the other way, widest at `peak` of its length, coming to a point at p2 and to nothing at p0 (the
 *  root, buried in the shell). Closed. */
export const lockGeo = (toM: (v: V3) => V3, p0: V3, p1: V3, p2: V3, side: V3, wide: number, deep: number, peak = 0.45) => {
  const NS = 26, NCl = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), c = V(), T = V(), A = V(), B = V();
  const at = (t: number) => { const s = 1 - t; return c.set(0, 0, 0).addScaledVector(p0, s * s).addScaledVector(p1, 2 * s * t).addScaledVector(p2, t * t); };
  const e = Math.log(0.5) / Math.log(clamp(peak, 0.1, 0.9));
  toM(v.copy(p0)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, s = 1 - t;
    T.set(0, 0, 0).addScaledVector(p0, -2 * s).addScaledVector(p1, 2 * s - 2 * t).addScaledVector(p2, 2 * t).normalize();
    A.copy(side).addScaledVector(T, -side.dot(T)).normalize(); B.crossVectors(T, A).normalize();
    const k = Math.sin(Math.PI * t ** e) ** 0.6, w = (wide / 2) * k, d = (deep / 2) * (0.4 + 0.6 * k);
    at(t);
    for (let j = 0; j < NCl; j++) { const p = (j / NCl) * Math.PI * 2; toM(v.copy(c).addScaledVector(A, w * Math.cos(p)).addScaledVector(B, d * Math.sin(p))); pos.push(v.x, v.y, v.z); uv.push(j / NCl, t); }
  }
  toM(v.copy(p2)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * NCl + (j % NCl), end = 1 + (NS - 1) * NCl;
  for (let j = 0; j < NCl; j++) { idx.push(0, R(1, j), R(1, j + 1)); idx.push(end, R(NS - 1, j + 1), R(NS - 1, j)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NCl; j++) idx.push(R(i, j), R(i + 1, j), R(i, j + 1), R(i, j + 1), R(i + 1, j), R(i + 1, j + 1));
  // (the normal at the edge of the middle section must point away from the section's other edge)
  const m = R(NS >> 1, 0), o = R(NS >> 1, NCl >> 1);
  return outFrom(pos, uv, idx, m, V(pos[3 * o], pos[3 * o + 1], pos[3 * o + 2]));
};

// ------------------------------------------------------------------------------------------------------- Juliet
export type FallO = {
  col: string; light?: string; deep?: string; ring?: string;
  /** the locks across it (odd: one in the middle), the half-width round the back at its top and at its foot (deg) */
  n?: number; span0?: number; span1?: number;
  /** where it ends, in head radii below the head's centre: the notches between the locks in the middle and at the
   *  sides, and how much further each lock's point reaches (middle first, out to the side) */
  notchMid?: number; notchSide?: number; tips?: number[];
  /** thickness, the swell down each lock's middle, the flick out at the foot (head radii); the air over the back (m) */
  thick?: number; relief?: number; flare?: number; gap?: number;
  /** the least distance of its inner side from the body's axis (head radii): under the shell's edge at the nape */
  r0?: number;
};
/** the fall's paint: per lock a lit band down its middle and a dark crease up from each notch, fine strands, the
 *  shine band across it at the shoulders (its lower edge in one broad point per lock), the tips a shade deeper */
const fallMap = (b: PartKit, o: FallO, n: number, key: string) => b.tex(512, 1024, (g) => {
  const W = 512, H = 1024, light = o.light ?? shade(o.col, 1.3), deep = o.deep ?? shade(o.col, 0.66), ring = o.ring ?? shade(o.col, 1.5);
  g.fillStyle = o.col; g.fillRect(0, 0, W, H);
  for (let c = 0; c < n; c++) {
    const x0 = (c / n) * W, x1 = ((c + 1) / n) * W, xm = (x0 + x1) / 2, w = (x1 - x0) * 0.36;
    const gr = g.createLinearGradient(xm - w, 0, xm + w, 0);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, light); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 0.5; g.fillStyle = gr; g.fillRect(xm - w, H * 0.1, 2 * w, H * 0.9);
    if (c) {
      g.globalAlpha = 0.42; g.strokeStyle = deep; g.lineWidth = 5; g.lineCap = "round";
      g.beginPath(); g.moveTo(x0 + 2, H * 0.3); g.quadraticCurveTo(x0 - 3, H * 0.7, x0, H); g.stroke();
    }
  }
  // fine strands, long and gently waved
  for (let i = 0; i < 70; i++) {
    const x = W * hash(i, 21), y0 = H * (0.08 + 0.3 * hash(i, 22)), y1 = Math.min(H, y0 + H * (0.35 + 0.45 * hash(i, 23))), wv = (hash(i, 24) - 0.5) * 18;
    g.strokeStyle = hash(i, 25) < 0.5 ? deep : light; g.globalAlpha = 0.12 + 0.16 * hash(i, 26); g.lineWidth = 1.5 + 2 * hash(i, 27);
    g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + wv, (y0 + y1) / 2, x + wv * 0.3, y1); g.stroke();
  }
  // the shine band (天使环 of long hair): one band across at the shoulders, its lower edge in a point down each lock
  g.globalAlpha = 0.72; g.fillStyle = ring;
  g.beginPath(); g.moveTo(0, H * 0.135);
  for (let c = 0; c <= n; c++) g.lineTo((c / n) * W, H * (0.13 + 0.012 * Math.sin(c * 2.1)));
  for (let c = n - 1; c >= 0; c--) { const x0 = (c / n) * W, x1 = ((c + 1) / n) * W; g.lineTo(x1 - (x1 - x0) * 0.12, H * 0.19); g.lineTo((x0 + x1) / 2, H * (0.235 + 0.02 * hash(c, 28))); g.lineTo(x0 + (x1 - x0) * 0.12, H * 0.19); }
  g.closePath(); g.fill();
  // the tips a shade deeper (the point of each lock reads against the gown)
  const tg = g.createLinearGradient(0, H * 0.82, 0, H);
  tg.addColorStop(0, "rgba(0,0,0,0)"); tg.addColorStop(1, deep);
  g.globalAlpha = 0.35; g.fillStyle = tg; g.fillRect(0, H * 0.82, W, H * 0.18);
  g.globalAlpha = 1;
}, key);
/** JULIET'S FALL (see the head of this file) */
export const backFall = (o: FallO): Acc => {
  const n = o.n ?? 7, key = ["rjBackFall", JSON.stringify(o)].join("|");
  return {
    name: "backFall", slots: [], key,
    build(b) {
      const R = b.R, Ht = b.Ht, hy = b.headY, s0 = o.span0 ?? 46, s1 = o.span1 ?? 56, tips = o.tips ?? [0.34, 0.3, 0.24, 0.18];
      const T0 = (o.thick ?? 0.13) * R, rel = (o.relief ?? 0.035) * R, fl = (o.flare ?? 0.1) * R, gap = o.gap ?? 0.022, r0 = (o.r0 ?? 0.57) * R;
      const yTop = hy - 0.42 * R;
      // where each column ends: the notch line (a soft V: longest in the middle) and each lock's point
      const lockOf = (s: number) => { const q = clamp(((s + 1) / 2) * n, 0, n - 1e-6), c = Math.floor(q); return { c, x: q - c - 0.5 }; };
      const yEnd = (s: number) => {
        const { c, x } = lockOf(s), mid = (n - 1) / 2, tip = tips[Math.min(tips.length - 1, Math.round(Math.abs(c - mid)))] ?? 0.15;
        return hy - R * (lerp(o.notchMid ?? 1.95, o.notchSide ?? 1.62, Math.pow(Math.abs(s), 1.4)) + tip * Math.pow(1 - Math.abs(2 * x), 0.85));
      };
      const NJ = 8 * n, NI = 46, pos: number[] = [], uv: number[] = [], idx: number[] = [], LOOP = 2 * (NJ + 1);
      for (let i = 0; i <= NI; i++) {
        const v = i / NI;
        const row: number[][] = [], rowIn: number[][] = [];
        for (let j = 0; j <= NJ; j++) {
          const s = -1 + (2 * j) / NJ, az = rad(180 + s * lerp(s0, s1, v)), y = lerp(yTop, yEnd(s), v);
          const t = clamp(y / Ht, 0.02, 0.98), azD = 180 + s * lerp(s0, s1, v);
          const ri = Math.max(r0, b.bodyR(t, azD > 180 ? azD - 360 : azD) + gap) + fl * Math.pow(v, 2.5);
          // thickness: none at its top (inside the head), at its two sides and at each lock's point
          const w = Math.pow(Math.max(0, 1 - s * s), 0.35), cap = sm(v / 0.05), tk = Math.pow(Math.sin(Math.min(1, (1 - v) / 0.16) * (Math.PI / 2)), 0.7);
          const th = T0 * w * cap * tk, { x } = lockOf(s), sw = rel * (0.5 + 0.5 * Math.cos(2 * Math.PI * x)) * w * cap * tk;
          const rm = ri + th / 2, ro = rm + th / 2 + sw, rin = rm - th / 2, sa = Math.sin(az), ca = Math.cos(az);
          row.push([sa * ro, y, ca * ro]); rowIn.push([sa * rin, y, ca * rin]);
        }
        // the loop round its section: the outer side left to right, then the inner side back
        for (let j = 0; j <= NJ; j++) { pos.push(...row[j]); uv.push(j / NJ, 1 - v); }
        for (let j = NJ; j >= 0; j--) { pos.push(...rowIn[j]); uv.push(j / NJ, 1 - v); }
      }
      for (let i = 0; i < NI; i++) for (let k = 0; k < LOOP; k++) {
        const a = i * LOOP + k, bq = i * LOOP + ((k + 1) % LOOP), c2 = a + LOOP, d = bq + LOOP;
        idx.push(a, c2, bq, bq, c2, d);
      }
      // (the outer side's middle must face away from the body's axis)
      const m = Math.round(NI * 0.5) * LOOP + (NJ >> 1);
      const geo = outFrom(pos, uv, idx, m, V(0, pos[3 * m + 1], 0));
      b.solid("body", geo, { col: "#ffffff", map: fallMap(b, o, n, key), paint: "hair", ink: 0.0075 });
      // the arms keep clear of its two edges over the shoulder blades
      for (const s of [-1, 1]) for (const tt of [0.86, 0.72, 0.58]) {
        const azD = 180 + s * s0, y = tt * Ht, r = Math.max(r0, b.bodyR(tt, azD > 180 ? azD - 360 : azD) + gap) + T0 * 0.4;
        b.keepOut(V(Math.sin(rad(azD)) * r, y, Math.cos(rad(azD)) * r), 0.03);
      }
    },
  };
};
/** JULIET'S BACK BOW (see the head of this file): on the shell `on`, `el` deg up from the head's middle at the back,
 *  k = its size (1 = the drills' bows) */
export const backBow = (o: { on: ShellO; col?: string; el?: number; k?: number; tails?: boolean; out?: number }): Acc => {
  const col = o.col ?? "#c4202e", el = o.el ?? 14, k = o.k ?? 1.9;
  return {
    name: "backBow", slots: [], key: ["rjBackBow", JSON.stringify(o.on), col, el, k, o.tails ?? true, o.out ?? 0.12].join("|"),
    build(b) {
      const R = b.R, at = shellPoint(o.on, 180, rad(el), o.out ?? 0.12), f = at.clone().normalize(), up = V(0, 1, 0);
      const side = V().crossVectors(up, f).normalize(), u2 = V().crossVectors(f, side).normalize();
      const put = (geo: THREE.BufferGeometry, p: V3, X: V3, Y: V3, c: string, ink: number) => {
        const m = b.solid("head", weld(geo), { col: c, ink });
        const Z = V().crossVectors(X, Y).normalize(), Y2 = V().crossVectors(Z, X).normalize();
        m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y2, Z));
        m.position.copy(b.toM(p.clone()));
        return m;
      };
      for (const s of [-1, 1]) {
        // a loop: out to the side and up a little, its outer end turned in toward the head
        const X = side.clone().multiplyScalar(s).multiplyScalar(Math.cos(0.26)).addScaledVector(f, -Math.sin(0.26)).addScaledVector(u2, 0.36).normalize();
        const loop = new THREE.SphereGeometry(R * 0.15 * k, 20, 14); loop.scale(1.3, 0.76, 0.6);
        put(loop, at.clone().addScaledVector(X, 0.2 * k).addScaledVector(f, -0.02 * k), X, u2, col, 0.0065);
        // the ribbon's end: from under the knot down the back of the hair and a little out
        if (o.tails ?? true) {
          const r0 = shellPoint(o.on, 180 + s * 3, rad(el - 4), (o.out ?? 0.12) - 0.02), r1 = shellPoint(o.on, 180 + s * 11, rad(el - 30), 0.06), r2 = shellPoint(o.on, 180 + s * 18, rad(el - 54), 0.06);
          const tside = V(Math.cos(rad(180 + s * 11)), 0, -Math.sin(rad(180 + s * 11)));
          b.solid("head", lockGeo(b.toM, r0, r1, r2, tside, 0.2 * (k / 1.9), 0.05, 0.62), { col: shade(col, 0.9), ink: 0.0055 });
        }
      }
      const knot = new THREE.SphereGeometry(R * 0.078 * k, 16, 12); knot.scale(1, 1.05, 0.72);
      put(knot, at.clone().addScaledVector(f, 0.03 * k), side, u2, shade(col, 0.9), 0.006);
    },
  };
};

// ------------------------------------------------------------------------------------------------------- Romeo
/** ROMEO'S NAPE LOCKS (see the head of this file), on the shell `on`. Each: azimuth (deg from the face, + = his left;
 *  the back is 180), how far below the shell's back edge its point reaches, how far it fans out round the head
 *  (deg), its layer (0 under, 1 over: out further) and its width (head units) */
export const napeLocks = (o: { on: ShellO; col: string; locks?: [number, number, number, number, number][]; flick?: number }): Acc => {
  const locks = o.locks ?? [
    [180, 0.24, 0, 0, 0.36], [154, 0.2, 9, 0, 0.34], [-154, 0.21, -9, 0, 0.34], [128, 0.13, 14, 0, 0.28], [-128, 0.13, -14, 0, 0.28],
    [167, 0.12, 5, 1, 0.26], [-167, 0.13, -5, 1, 0.26],
  ];
  return {
    name: "napeLocks", slots: [], key: ["rjNapeLocks", o.col, JSON.stringify(o.on), JSON.stringify(locks), o.flick ?? 0.22].join("|"),
    build(b) {
      const back = o.on.back, hR = (1 + o.on.thB) * Math.cos(Math.asin(clamp(back, -0.97, 0.97)));
      for (const [aD, len, spl, layer, wide] of locks) {
        // from the hair's surface at the middle of the back of the head, out over it, past its edge and out
        const a2 = rad(aD + spl), out = 0.1 + 0.035 * layer;
        const p0 = shellPoint(o.on, aD, rad(-2), 0), p1 = shellPoint(o.on, aD + spl * 0.4, rad(-34), out);
        const rt = hR + (o.flick ?? 0.22) + 0.03 * layer, p2 = V(Math.sin(a2) * rt, back - len, Math.cos(a2) * rt);
        const side = V(Math.cos(rad(aD + spl * 0.5)), 0, -Math.sin(rad(aD + spl * 0.5)));
        b.solid("head", lockGeo(b.toM, p0, p1, p2, side, wide, 0.09, 0.6), { col: o.col, paint: "hair", ink: 0.0065 });
      }
    },
  };
};
