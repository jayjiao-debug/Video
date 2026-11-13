// THE SOFT CLOTH HEADWEAR of the Wanbi film (完璧归赵, BIBLE 5; BUILD_PLAN WP4), as accessories for the rig3d figures
// (group/kit/rig3d Acc; the kit's own headwear is src/kit/acc/headwear.ts, read only: the shape helpers below are
// copies of its private ones, so these follow the head's lumpy shape the same way).
//   envoyCap({ lift, tilt })   蔺相如's soft black cloth head-wrap (帻) tied over his topknot: a soft dome over the crown
//                              with the knot's bump in it, a rolled edge, fold lines, and at the back a small knot with
//                              two short LIMP ends hanging down (never stiff paddles). lift = metres it stands off the
//                              head (LIN_RAGE: 0.13, held up by rageHair), tilt = degrees it is cocked to the side
//   rageHair({ lift, tilt })   怒发冲冠: his hair standing up under the lifted wrap: a column of hair from the crown up
//                              into the wrap and seven spiky tufts round it, pointing out and up. Worn WITH
//                              envoyCap({ lift, tilt }) of the same numbers (people.ts LIN_RAGE)
//   roundCap()                 the eunuch's soft black round cap: a smooth dome, a little taller than the wrap, a band
//                              round its edge, no knot, no ends
//   clothWrap(name, o)         the builder all three use (and acc/bundle.ts headCloth, the servant's brown cloth)
// The kit's rules hold (group/kit/RIG3D.md): nothing 3D in front of the face (62 deg each side of the front, below the
// brows: rig.accRules() checks it), hidden ends deep inside the head, thin things at least two ink widths thick,
// nothing random, nothing that changes from frame to frame. Slots: envoyCap / roundCap / headCloth take "hat" +
// "crown" (hair "keep": the look's own hairline stays as drawn); rageHair takes none.
import * as THREE from "three";
import type { Acc, PartKit } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";

export type ToM = (v: THREE.Vector3) => THREE.Vector3;
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rad = (d: number) => (d * Math.PI) / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** a geometry from raw arrays, with one normal per position (seams and poles share theirs: an ink hull stays closed)
 *  (copy of the kit headwear.ts meshOf) */
export const meshOf = (pos: number[], uv: number[], idx: number[]) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return weld(g);
};
/** one normal per position (the mean of the faces that meet there) */
export const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** a profile's inner corners rounded with a short curve of `fillet` ([radius, height] points; copy of the kit's) */
export const rounded = (prof: [number, number][], fillet: number) => {
  const out: [number, number][] = [prof[0]], n = prof.length;
  for (let i = 1; i < n - 1; i++) {
    const a = prof[i - 1], b = prof[i], c = prof[i + 1], la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]), f = Math.min(fillet, 0.45 * la, 0.45 * lc);
    const p0 = [b[0] + ((a[0] - b[0]) * f) / la, b[1] + ((a[1] - b[1]) * f) / la], p1 = [b[0] + ((c[0] - b[0]) * f) / lc, b[1] + ((c[1] - b[1]) * f) / lc];
    for (let k = 0; k <= 5; k++) { const t = k / 5, s = 1 - t; out.push([s * s * p0[0] + 2 * s * t * b[0] + t * t * p1[0], s * s * p0[1] + 2 * s * t * b[1] + t * t * p1[1]]); }
  }
  out.push(prof[n - 1]);
  return out;
};
/** a solid turned round the head's own axis THROUGH the head's shape and the accessory's tilt (toM = PartKit.toM):
 *  prof = [radius, height] in head units from the bottom up on the outside. uv: u round (0.5 = the face side), v = 0
 *  at the first point .. 1 at the last, by length; userData.vAt[k] = the v of profile point k (copy of the kit's) */
export const lathe = (toM: ToM, prof: [number, number][], seg = 48) => {
  const n = prof.length, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), len = [0];
  for (let k = 1; k < n; k++) len.push(len[k - 1] + Math.hypot(prof[k][0] - prof[k - 1][0], prof[k][1] - prof[k - 1][1]));
  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI + (2 * Math.PI * i) / seg, sn = Math.sin(a), cs = Math.cos(a);
    for (let k = 0; k < n; k++) { toM(v.set(Math.max(prof[k][0], 0) * sn, prof[k][1], Math.max(prof[k][0], 0) * cs)); pos.push(v.x, v.y, v.z); uv.push(i / seg, len[k] / len[n - 1]); }
  }
  for (let i = 0; i < seg; i++) for (let k = 0; k < n - 1; k++) { const A = i * n + k, B = A + 1, C = A + n, D = C + 1; idx.push(A, C, B, B, C, D); }
  const g = meshOf(pos, uv, idx);
  g.userData.vAt = len.map((l) => l / len[n - 1]);
  return g;
};
/** a tapered leaf along the curve p0 -> p2 bent toward p1 (head units, through toM), `wide` across and `deep` thick at
 *  its fullest (at `peak` of its length), both ends closed (copy of the kit's leafGeo: a feather, a lock, a tuft) */
export const leafGeo = (toM: ToM, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number, peak = 0.5) => {
  const NS = 24, NC = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), c = V(), T = V(), A = V(), B = V();
  const nrm = V().crossVectors(p1.clone().sub(p0), p2.clone().sub(p0)).normalize();
  if (nrm.lengthSq() < 1e-9) nrm.set(1, 0, 0);
  const at = (t: number) => { const s = 1 - t; return c.set(0, 0, 0).addScaledVector(p0, s * s).addScaledVector(p1, 2 * s * t).addScaledVector(p2, t * t); };
  const e = Math.log(0.5) / Math.log(clamp(peak, 0.1, 0.9));
  toM(v.copy(p0)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, s = 1 - t;
    T.set(0, 0, 0).addScaledVector(p0, -2 * s).addScaledVector(p1, 2 * s - 2 * t).addScaledVector(p2, 2 * t).normalize();
    B.copy(nrm); A.crossVectors(B, T).normalize();
    const k = Math.sin(Math.PI * t ** e) ** 0.6, w = (wide / 2) * k, d = (deep / 2) * (0.45 + 0.55 * k);
    at(t);
    for (let j = 0; j < NC; j++) { const p = (j / NC) * Math.PI * 2; toM(v.copy(c).addScaledVector(A, w * Math.cos(p)).addScaledVector(B, d * Math.sin(p))); pos.push(v.x, v.y, v.z); uv.push(j / NC, t); }
  }
  toM(v.copy(p2)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * NC + (j % NC), end = 1 + (NS - 1) * NC;
  for (let j = 0; j < NC; j++) { idx.push(0, R(1, j), R(1, j + 1)); idx.push(end, R(NS - 1, j + 1), R(NS - 1, j)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NC; j++) idx.push(R(i, j), R(i + 1, j), R(i, j + 1), R(i, j + 1), R(i + 1, j), R(i + 1, j + 1));
  const g = meshOf(pos, uv, idx);
  // (the winding depends on which way the curve bends: the normals must point away from the middle line)
  const P = g.attributes.position, N = g.attributes.normal, m = R(NS >> 1, 0), o = R(NS >> 1, NC >> 1);
  if ((P.getX(m) - P.getX(o)) * N.getX(m) + (P.getY(m) - P.getY(o)) * N.getY(m) + (P.getZ(m) - P.getZ(o)) * N.getZ(m) < 0) {
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    return meshOf(pos, uv, idx);
  }
  return g;
};

// ===== the cloth wrap =====
export type ClothO = {
  /** the cloth */ col: string;
  /** the band along its edge (default: the cloth a shade lighter: a rolled hem) */ band?: string;
  /** the knot's bump on the crown (the topknot under the cloth): 0 = none, 1 = the envoy's */ bump?: number;
  /** length of the two hanging ends at the back, in head radii (0 = none; the envoy's 0.62) */ ends?: number;
  /** degrees from the crown its edge sits, in its own frame (before `back`; default 58) */ rim?: number;
  /** degrees it is tilted back (the edge rides higher on the brow than on the nape; default 16) */ back?: number;
  /** how far out it stands from the skin (head units: the cap's ball radius; default 1.05) */ r?: number;
  /** the dome's top above the head's middle when there is no bump (head units; default 1.05: a round dome) */ crown?: number;
  /** metres it stands off the head, straight up (rage: 0.13); degrees it is cocked toward the person's RIGHT (screen
   *  left from the front: away from E1 and the jade he raises in his left hand, against his head's tilt toward the
   *  pillar, so on screen it sits askew on the tilted head) */ lift?: number; tilt?: number;
  /** soft fold lines on the dome (default true) */ folds?: boolean;
  /** how far the rolled edge stands out (head units, default 0.025; 0 = a plain cloth edge that hugs the head) */ roll?: number;
};
/** builds a soft cloth wrap on the head. The geometry goes through the head's shape (toM) and is then moved up by
 *  `lift` metres, so a lifted wrap keeps exactly its shape. Its bottom is closed (a shallow dish inside the head,
 *  which shows only when it is lifted: then it is the wrap's underside). */
const buildWrap = (b: PartKit, o: ClothO) => {
  const R = b.R, r = o.r ?? 1.05, rim = o.rim ?? 58, back = o.back ?? 16, bump = o.bump ?? 0, top = o.crown ?? 1.05, lift = o.lift ?? 0, ends = o.ends ?? 0;
  const col = o.col, band = o.band ?? shade(col, 1.35), ink = shade(col, 0.5);
  b.tilt(-(o.tilt ?? 0), -back);
  const up = <T extends THREE.BufferGeometry>(g: T) => { if (lift) g.translate(0, lift, 0); return g; };
  // the profile: the closed dish inside the head, out through the skin to a rolled edge, over the dome; with a bump
  // the dome rises into the knot's rounded lump on the crown
  const th = rad(rim), roll = o.roll ?? 0.025, prof: [number, number][] = [[0, 0.46], [0.74, 0.44], [r * Math.sin(th) - 0.01, r * Math.cos(th) - 0.035], [r * Math.sin(th) + roll, r * Math.cos(th) + 0.02]];
  // (the dome: the cap's ball, its height raised smoothly toward `top` at the crown when there is no bump)
  const dome = (d: number) => { const a = rad(d), k = 1 + 0.012 * Math.sin(a * 3), u = 1 - d / rim; return [r * Math.sin(a) * k, r * Math.cos(a) * k * (bump > 0 ? 1 : 1 + (top / r - 1) * u * u)] as [number, number]; };
  for (const d of bump > 0 ? [rim - 9, rim - 21, 34, 24] : [rim - 9, rim - 21, rim - 33, 18, 8]) prof.push(dome(d));
  if (bump > 0) {
    const s = bump;
    prof.push([0.33 * s + 0.03, r * Math.cos(rad(24)) + 0.1 * s], [0.36 * s, r * Math.cos(rad(24)) + 0.27 * s], [0.26 * s, r * Math.cos(rad(24)) + 0.41 * s], [0, r * Math.cos(rad(24)) + 0.45 * s]);
  } else prof.push([0, top]);
  const geo = up(lathe(b.toM, rounded(prof, 0.06), 48)), vR = geo.userData.vAt as number[];
  // (the v of the profile's own corners: rounded() puts six points round each inner corner)
  const vAt = prof.map((_, i) => (i === 0 ? vR[0] : i === prof.length - 1 ? vR[vR.length - 1] : vR[1 + 6 * (i - 1) + 3]));
  // its map (it carries the colours; the part's own colour is white): the cloth, a lighter rolled band along the
  // edge with an ink line under it, and soft fold lines from the edge up toward the crown
  const map = b.tex(256, 256, (g) => {
    const Y = (v: number) => 256 * (1 - v);
    g.fillStyle = col; g.fillRect(0, 0, 256, 256);
    g.fillStyle = band; g.fillRect(0, Y(vAt[4] + 0.02), 256, Y(vAt[2]) - Y(vAt[4] + 0.02));
    g.fillStyle = ink; g.fillRect(0, Y(vAt[2]) - 3, 256, 7); g.fillRect(0, Y(vAt[4] + 0.02) - 2, 256, 3);
    if (o.folds !== false) {
      g.strokeStyle = shade(col, 1.6); g.lineWidth = 4; g.lineCap = "round";
      for (let k = 0; k < 7; k++) { const x = (k + 0.3) * (256 / 7); g.beginPath(); g.moveTo(x, Y(vAt[4] + 0.03)); g.quadraticCurveTo(x + 9, Y((vAt[4] + vAt[7]) / 2), x + 4, Y(vAt[7])); g.stroke(); }
    }
  }, `wanbiWrap|${col}|${band}|${rim}|${bump}|${o.folds !== false}|${o.roll ?? 0.025}|${top}`);
  b.solid("head", geo, { col: "#ffffff", map, paint: "cloth", ink: 0.008 });
  if (ends > 0) {
    // the knot at the back, just above the edge, and its two limp ends: they fall from it, splay a little and hang
    const ka = rad(rim + 6), K = V(0, r * Math.cos(ka) + 0.02, -r * Math.sin(ka) - 0.04);
    const knot = new THREE.SphereGeometry(0.14 * R, 14, 10); knot.scale(1.25, 0.85, 0.8);
    const km = b.put(b.solid("head", weld(knot), { col, paint: "cloth", ink: 0.006 }), K.x, K.y, K.z);
    km.position.y += lift;
    for (const s of [-1, 1]) {
      const L = ends * (s > 0 ? 1 : 0.86);
      const g = leafGeo(b.toM, V(s * 0.03, K.y + 0.02, K.z + 0.05), V(s * 0.17, K.y - 0.3 * L, K.z - 0.2), V(s * 0.24, K.y - 0.95 * L, K.z - 0.14), 0.22, 0.085, 0.42);
      b.solid("head", up(g), { col, paint: "cloth", ink: 0.006 });
    }
  }
};
/** a soft cloth wrap on the head (the builder of envoyCap, roundCap and bundle.ts headCloth). Slots hat + crown, hair
 *  "keep" (the look's hairline is drawn as it is under it). hide: [name]. */
export const clothWrap = (name: string, o: ClothO): Acc => ({
  name, slots: ["hat", "crown"], noHairProps: true, hat: { rim: Math.max(30, (o.rim ?? 58) - (o.back ?? 16)), hair: "keep", shade: false },
  key: [name, o.col, o.band ?? "", o.bump ?? 0, o.ends ?? 0, o.rim ?? 58, o.back ?? 16, o.r ?? 1.05, o.crown ?? 1.05, o.lift ?? 0, o.tilt ?? 0, o.folds !== false, o.roll ?? 0.025].join("|"),
  build: (b) => buildWrap(b, o),
});

/** the colours of the envoy's head: the black cloth of his wrap (never pure black: the ink stays the darkest thing) */
export const WRAP_BLACK = "#2a2630";
/** the rage numbers (BIBLE 5: the wrap lifted 0.13 m, tilted 8 deg): LIN_RAGE wears envoyCap and rageHair with these */
export const RAGE = { lift: 0.13, tilt: 8 } as const;
/** how far the rage tufts' points stand out from the head's axis (head radii): just past the head and the wrap's edge,
 *  never further (the hook: his back is 8.6 cm from E1 and the jade is raised 0.21 m from his head's axis) */
const TIP_R = 0.95;

/** 蔺相如's soft black head-wrap (帻) tied over his topknot, with the knot's bump on the crown and two short limp ends
 *  at the back. lift / tilt: the rage version (RAGE), worn with rageHair of the same numbers. hide: ["envoyCap"] */
export const envoyCap = (o: { lift?: number; tilt?: number; col?: string } = {}): Acc =>
  clothWrap("envoyCap", { col: o.col ?? WRAP_BLACK, bump: 1, ends: 0.62, lift: o.lift ?? 0, tilt: o.tilt ?? 0 });

/** the eunuch's soft black round cap: a smooth dome a little taller than the wrap, a band round its edge, no knot, no
 *  ends. hide: ["roundCap"] */
export const roundCap = (o: { col?: string; band?: string } = {}): Acc =>
  clothWrap("roundCap", { col: o.col ?? WRAP_BLACK, band: o.band ?? "#4a4452", bump: 0, ends: 0, rim: 60, back: 10, r: 1.06, crown: 1.3, folds: false });

/** 怒发冲冠: the hair standing up under the lifted wrap. A column of the look's hair from the crown up into the wrap,
 *  and seven spiky tufts round it that point out and up from under the wrap's edge (one over the brow, above the face
 *  zone). Worn with envoyCap({ lift, tilt }) of the SAME numbers: the column ends inside the lifted wrap. No slot;
 *  hide: ["rageHair"]. */
export const rageHair = (o: { lift?: number; tilt?: number } = {}): Acc => {
  const lift = o.lift ?? RAGE.lift, tilt = o.tilt ?? RAGE.tilt;
  return {
    name: "rageHair", slots: [], noHairProps: true, key: ["rageHair", lift, tilt].join("|"),
    build(b) {
      const hair = b.look.hairCol, L = lift / b.R, back = 16;
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.strokeStyle = "#6a6470"; g.lineWidth = 3; g.lineCap = "round";
        for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(8 + k * 16, 240); g.lineTo(10 + k * 16, 40); g.stroke(); }
      }, "wanbiRage");
      b.tilt(-tilt, -back);
      // the column: out of the crown, up into the lifted wrap (whose closed dish lies at about 0.45 + L)
      const col = rounded([[0.5, 0.45], [0.62, 0.78], [0.64, 0.6 + 0.75 * L], [0.56, 0.62 + L], [0, 0.66 + L]], 0.06);
      b.solid("head", lathe(b.toM, col, 36), { col: hair, map, paint: "hair", ink: 0.008 });
      // the tufts: seven, round the column, rooted inside it, their points out past the wrap's edge and up
      for (let k = 0; k < 7; k++) {
        const az = rad(-180 + (k + 0.5) * (360 / 7)), sn = Math.sin(az), cs = Math.cos(az), hi = k % 2 ? 1 : 0, y0 = 0.62 + 0.35 * L;
        const P = (rr: number, y: number) => V(rr * sn, y, rr * cs);
        b.solid("head", leafGeo(b.toM, P(0.3, y0 - 0.1), P(0.66, y0 + 0.2 + 0.06 * hi), P(TIP_R + 0.06 * hi, y0 + 0.5 + 0.25 * L + 0.1 * hi), 0.34, 0.25, 0.3), { col: hair, map, paint: "hair", ink: 0.008 });
      }
    },
  };
};
