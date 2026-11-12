// Headwear of the Hongmen film (late Qin / early Han, storybook-simple), as accessories for the kit's rig3d figures:
//   rc.add(look, { acc: [topknot({ band: "#c8322c", pin: "#e2b03a" })] })
//     topknot      the hair tied up in a knot on the crown (髻), a cloth band round its foot, a hairpin (簪) through
//                  it; headband = a cloth band round the brow (抹额); cloth = the knot wrapped in cloth (巾).
//                  Perched: the look's own hair stays as drawn (give the look hair "buzz": a clean hairline)
//     scholarCap   an adviser's tall cap (高冠): a tall, flat, black tower on the crown that leans back, a band round
//                  its foot, a pin through it, its strings drawn on the face down to a knot under the chin
//     pheasantCap  a general's cap (鹖冠): a close dark cap with a gold rim and a knob, and one big plume that stands
//                  up, sweeps back and falls to one side (the biggest crest of the cast; two feathers read as ears)
//     flatCap      an elder's low flat-topped cap (帻): a short drum on the crown with a band
//     helmet       a soldier's plain helmet (胄): a round skull pulled down, a rim, a knob, a leather neck guard
//     officerCap   a junior officer's low cap (帻): a band round the crown under a little pitched roof whose ridge
//                  runs from front to back and stands higher at the back (the only gable in the cast: the informer's)
//     warHelmet    a commander's helmet with a spike and tassel (round 1's 项羽; viewers read it as Qing: not used)
//     warCrown     a warlord's bound hair (束发冠): a tall knot in a small gold crown with a long pin, a brow band with
//                  a gold boss, loose hair down the back and behind the jaw (项羽; slot "crown" only)
// Every one takes the slots "hat" and "crown", except topknot ("crown" only: it is hair, not a hat). The kit's rules
// hold (group/kit/RIG3D.md): nothing 3D in front of the face (62 degrees each side of the front, below the brows),
// every hidden end is deep inside the head, thin things are at least two ink widths thick. Nothing is random; nothing
// changes from frame to frame.
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { rad, shade, roundBox, hoop } from "../../group/kit/rigacc/shapes";

type ToM = (v: THREE.Vector3) => THREE.Vector3;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const GOLD = "#e2b03a";

/** a geometry from raw arrays, with one normal per position (seams and poles share theirs: an ink hull stays closed) */
const meshOf = (pos: number[], uv: number[], idx: number[]) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** a profile's corners rounded: [radius, height] points, each inner corner replaced by a short curve of `fillet` */
const rounded = (prof: [number, number][], fillet: number) => {
  const out: [number, number][] = [prof[0]], n = prof.length;
  for (let i = 1; i < n - 1; i++) {
    const a = prof[i - 1], b = prof[i], c = prof[i + 1], la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]), f = Math.min(fillet, 0.45 * la, 0.45 * lc);
    const p0 = [b[0] + ((a[0] - b[0]) * f) / la, b[1] + ((a[1] - b[1]) * f) / la], p1 = [b[0] + ((c[0] - b[0]) * f) / lc, b[1] + ((c[1] - b[1]) * f) / lc];
    for (let k = 0; k <= 5; k++) { const t = k / 5, s = 1 - t; out.push([s * s * p0[0] + 2 * s * t * b[0] + t * t * p1[0], s * s * p0[1] + 2 * s * t * b[1] + t * t * p1[1]]); }
  }
  out.push(prof[n - 1]);
  return out;
};
/** a solid turned round the head's own axis, THROUGH the head's shape and the accessory's tilt (toM = PartKit.toM):
 *  prof = [radius, height] in head units, from the bottom up on the outside. uv: u round the head (0.5 = the face
 *  side), v = 0 at the first point .. 1 at the last, by length; vAt[k] = the v of profile point k. An open end has
 *  to be deep inside the head or another part. Use with PartKit.solid("head", ...). */
const lathe = (toM: ToM, prof: [number, number][], seg = 48) => {
  const n = prof.length, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3(), len = [0];
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
/** A feather or a tail: a tapered leaf along the curve from p0 to p2 bent toward p1 (head units), `wide` across (in
 *  the curve's own plane) and `deep` thick at its fullest, which lies `peak` of the way along (0.5 = the middle);
 *  both ends closed. Through toM. For PartKit.solid("head"). uv: u round it (its two flat faces at 0.25 and 0.75),
 *  v along it. */
const leafGeo = (toM: ToM, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number, peak = 0.5) => {
  const NS = 24, NC = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3(), c = new THREE.Vector3(), T = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3();
  const nrm = new THREE.Vector3().crossVectors(p1.clone().sub(p0), p2.clone().sub(p0)).normalize();
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
  // the winding depends on which way the curve bends: make the normals point away from the middle line
  const P = g.attributes.position, N = g.attributes.normal, m = R(NS >> 1, 0), o = R(NS >> 1, NC >> 1);
  if ((P.getX(m) - P.getX(o)) * N.getX(m) + (P.getY(m) - P.getY(o)) * N.getY(m) + (P.getZ(m) - P.getZ(o)) * N.getZ(m) < 0) {
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    return meshOf(pos, uv, idx);
  }
  return g;
};

/** A wrap: a shell round the crown, the sides and the back of the head that leaves the face open (see the Arthur
 *  film's headwear.ts for the reasons behind every number). Degrees: from the crown it reaches down to `front` over
 *  the face, and from a0 to a1 degrees round from the face side its edge drops to `low` (plus `back` more at the very
 *  back); arch = how much lower the edge is at a0 than in the middle. r = its radius in head units. */
type WrapO = { r: number; front: number; low: number; a0: number; a1: number; back?: number; tuck?: number; arch?: number };
const wrapEdge = (o: WrapO, az: number) => o.front + (o.arch ?? 0) * Math.min(1, Math.abs(az) / o.a0) ** 2 + (o.low - o.front - (o.arch ?? 0)) * smooth((Math.abs(az) - o.a0) / (o.a1 - o.a0)) + (o.back ?? 0) * ((1 - Math.cos(rad(az))) / 2) ** 2;
const wrapGeo = (o: WrapO) => {
  const half = [0];
  for (let a = 0; a < 180 - 1e-6; ) { a = Math.min(180, a + (a > o.a0 - 5 && a < o.a1 + 5 ? 1.5 : 2.5)); half.push(a); }
  const azs = [...half.slice(1).reverse().map((a) => -a), ...half], NT = 36, tuck = o.tuck ?? 9;
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const az of azs) {
    const e = wrapEdge(o, az), sn = Math.sin(rad(az)), cs = Math.cos(rad(az)), tk = 1 - smooth((Math.abs(az) - 86) / 12);
    for (let j = 0; j <= NT; j++) {
      const th = e * (1 - (1 - j / NT) ** 1.5), rho = lerp(o.r, 0.995, tk * smooth((th - (e - tuck)) / tuck)), st = Math.sin(rad(th)), ct = Math.cos(rad(th));
      pos.push(rho * st * sn, rho * ct, rho * st * cs); nor.push(st * sn, ct, st * cs); uv.push((az + 180) / 360, 1 - th / 180);
    }
  }
  for (let c = 0; c < azs.length - 1; c++) for (let j = 0; j < NT; j++) { const A = c * (NT + 1) + j, B = A + 1, C = A + NT + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};
/** paints a wrap's map (1024 x 512: x = azimuth -180..180, y = 0..180 degrees from the crown): the ground colour,
 *  then `under` (a pattern), a band of `trim` along the edge `trimDeg` wide, and the edge's ink line */
const wrapPaint = (g: CanvasRenderingContext2D, o: WrapO, col: string, p: { trim?: string; trimDeg?: number; ink?: string; under?: (g: CanvasRenderingContext2D) => void }) => {
  const X = (az: number) => ((az + 180) / 360) * 1024, Y = (th: number) => (th / 180) * 512;
  g.fillStyle = col; g.fillRect(0, 0, 1024, 512);
  p.under?.(g);
  const edge = (deg: number, c: string) => {
    g.beginPath(); for (let az = -180; az <= 180; az += 0.5) { const x = X(az), y = Y(wrapEdge(o, az)); if (az === -180) g.moveTo(x, y); else g.lineTo(x, y); }
    g.strokeStyle = c; g.lineWidth = 2 * deg * (512 / 180); g.lineJoin = "round"; g.stroke();
  };
  if (p.trim) edge(p.trimDeg ?? 7, p.trim);
  edge(1.6, p.ink ?? shade(col, 0.4));
};

/** a rod along the head's left-right axis, `len` long and `r` thick (head units), with a ball of `knob` at each end */
const pinOn = (b: Parameters<NonNullable<Acc["build"]>>[0], y: number, z: number, len: number, r: number, knob: number, col: string) => {
  const R = b.R, rod = new THREE.CylinderGeometry(r * R, r * R, len * R, 12, 1);
  rod.rotateZ(Math.PI / 2);
  b.put(b.solid("head", rod, { col, ink: 0.004 }), 0, y, z);
  if (knob > 0) for (const s of [-1, 1]) b.put(b.solid("head", new THREE.SphereGeometry(knob * R, 12, 9), { col, ink: 0.004 }), (s * len) / 2, y, z);
};

type TopknotO = {
  /** how big the knot is (1 = a third of the head's width) */ size?: number;
  /** the cloth band round the knot's foot; false = none */ band?: string | false;
  /** a hairpin through the knot; false = none */ pin?: string | false;
  /** how far the pin sticks out each side, in head radii (default 0.5) */ pinLen?: number;
  /** a cloth band round the brow (a fighter's) */ headband?: string;
  /** the knot is wrapped in cloth of this colour */ cloth?: string;
  /** a small cap of this colour over the knot's top (a little guan: a man of rank) */ guan?: string;
  /** degrees it sits back from the top of the head (default 10) */ back?: number;
};
/** The hair tied up in a knot on the crown, as every grown man of the time wore it. The knot is the look's hair
 *  colour (or wrapped in cloth). Perched: the hair is drawn as the look has it. */
export const topknot = (o: TopknotO = {}): Acc => {
  const size = o.size ?? 1, band = o.band === undefined ? "#c8322c" : o.band, pin = o.pin === undefined ? GOLD : o.pin, back = o.back ?? 10, pl = o.pinLen ?? 0.5;
  return {
    name: "topknot", slots: ["crown"], noHairProps: true, key: ["topknot", size, band, pin, pl, o.headband ?? "", o.cloth ?? "", o.guan ?? "", back].join("|"),
    build(b) {
      const s = size, hair = o.cloth ?? b.look.hairCol;
      if (o.headband) {
        // round the brow, just above the hairline's front and well above the face zone; its knot at the back
        b.shell({ r: 1.035, from: 43, to: 57, rings: 5, col: o.headband, paint: "cloth", ink: 0.006, tuck: 4, tuckTop: 4 });
        b.put(b.solid("head", new THREE.SphereGeometry(0.11 * b.R, 12, 9), { col: o.headband, paint: "cloth", ink: 0.005 }), 0, 0.62, -0.86);
      }
      b.tilt(0, -back);
      // the knot: a neck that comes out of the crown and a ball on it, closed on top; its foot is deep in the head
      const prof = rounded([[0.2 * s, 0.6], [0.21 * s, 1.02], [0.31 * s, 1.12 + 0.1 * s], [0.27 * s, 1.12 + 0.32 * s], [0, 1.12 + 0.4 * s]], 0.12 * s);
      b.solid("head", lathe(b.toM, prof, 32), { col: hair, paint: o.cloth ? "cloth" : "hair", ink: 0.008 });
      if (band) b.solid("head", lathe(b.toM, rounded([[0.12 * s, 0.94], [0.285 * s, 0.95], [0.3 * s, 1.07], [0.12 * s, 1.1]], 0.03), 32), { col: band, paint: "cloth", ink: 0.006 });
      if (o.guan) b.solid("head", lathe(b.toM, rounded([[0.1 * s, 1.12 + 0.2 * s], [0.33 * s, 1.12 + 0.22 * s], [0.3 * s, 1.12 + 0.46 * s], [0, 1.12 + 0.5 * s]], 0.05 * s), 32), { col: o.guan, ink: 0.006 });
      if (pin) pinOn(b, 1.12 + 0.2 * s, 0, 2 * (0.3 * s + pl), 0.035, 0.07, pin);
    },
  };
};

/** An adviser's tall cap: a tall, narrow black board that stands on the crown and leans back, wider at its slanted
 *  top than at its foot (no brim, no drum: it must not read as a top hat), a thin band in the camp's colour round its
 *  foot and a pin through it from side to side. strings = its two strings drawn on the face along the jaw to a knot
 *  under the chin (off by default: at the film's sizes they read as a second mouth). Perched: the hair stays as
 *  drawn. It makes its wearer the tallest and narrowest head of the cast. */
export const scholarCap = (o: { col?: string; band?: string; pin?: string | false; strings?: string | false; tall?: number } = {}): Acc => {
  const col = o.col ?? "#2a2630", band = o.band ?? "#c8322c", pin = o.pin === undefined ? GOLD : o.pin, strings = o.strings || false, tall = o.tall ?? 1;
  return {
    name: "scholarCap", slots: ["hat", "crown"], key: ["scholarCap", col, band, pin, strings, tall].join("|"), hat: { rim: 30, hair: "keep", shade: false },
    faceUnder: strings ? (f) => {
      const strap = f.arc(0, -6, 47.6, 47.8, 28, 152, 40);
      f.line(strap, 2.6, shade(strings, 1.6)); f.line(strap, 1.4, strings);
      f.fill(f.arc(0, 41.6, 2.6, 2.2), strings, 0.8);
    } : undefined,
    build(b) {
      const R = b.R, h = 1.12 * tall;
      b.tilt(0, -13);
      // the foot: a short neck out of the crown in the band's colour (its lower end inside the head)
      b.solid("head", lathe(b.toM, rounded([[0.22, 0.6], [0.3, 0.9], [0.3, 1.1], [0, 1.12]], 0.04), 36), { col: band, paint: "cloth", ink: 0.007 });
      // the board: narrow at its foot, wider at its top, whose front corner stands higher than its back
      const tower = roundBox(0.5 * R, h * R, 0.3 * R, 0.3), P = tower.attributes.position;
      for (let i = 0; i < P.count; i++) {
        const t = P.getY(i) / (h * R) + 0.5, z = P.getZ(i) / (0.15 * R);
        P.setX(i, P.getX(i) * (0.74 + 0.5 * t)); P.setY(i, P.getY(i) + 0.1 * R * z * t * t); P.setZ(i, P.getZ(i) * (1.1 - 0.25 * t));
      }
      b.put(b.solid("head", weld(tower), { col, ink: 0.009 }), 0, 1.02 + h / 2, 0);
      if (pin) pinOn(b, 1.2, 0, 1.04, 0.035, 0.07, pin);
    },
  };
};
/** one normal per position on a ready-made geometry (a sphere's seam and poles) */
const weld = (g: THREE.BufferGeometry) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};

/** A general's cap: a close dark cap pulled down over the crown, a gold roll round its rim and a gold knob on top,
 *  and out of that knob a big plume that stands up and sweeps back over the head: the biggest crest of the cast, a
 *  head's height above the head. Its tip falls to the wearer's left (side: -1 = to the right), so that from the front it
 *  is a curling plume and not a drum. The brows stay clear of the rim. plume = its colour, tall = its height (1 = default). */
export const pheasantCap = (o: { col?: string; rim?: string; plume?: string; tall?: number; side?: number } = {}): Acc => {
  const col = o.col ?? "#3d4150", rim = o.rim ?? GOLD, plume = o.plume ?? "#6a2f9a", tall = o.tall ?? 1, side = o.side ?? 1;
  return {
    name: "pheasantCap", slots: ["hat", "crown"], key: ["pheasantCap", col, rim, plume, tall, side].join("|"), hat: { rim: 52, shade: false },
    build(b) {
      const R = b.R, r = 1.085, to = 53;
      b.shell({ r, to, col, tuck: 5, rimInk: 0.011 });
      b.shell({ r: r + 0.035, from: to - 11, to: to - 1, rings: 4, col: rim, ink: 0.006, tuck: 4, tuckTop: 4, onR: r });
      // the plume: from inside the crown straight up, then swept back; fullest two thirds of the way up
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      const fmap = b.tex(256, 256, (g) => {
        g.fillStyle = plume; g.fillRect(0, 0, 256, 256);
        // (u runs round it: its two flat faces are at u = 0.25 and 0.75) a quill down each face, barbs off it
        g.strokeStyle = shade(plume, 0.72); g.lineWidth = 8; g.lineCap = "round";
        for (const x of [64, 192]) for (let k = 1; k < 8; k++) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, 250 - k * 30); g.lineTo(x + s * 52, 250 - k * 30 - 24); g.stroke(); }
        g.fillStyle = shade(plume, 1.5); for (const x of [64, 192]) g.fillRect(x - 4, 0, 8, 256);
      }, `plume|${plume}`);
      // (its tip also falls to the wearer's left: seen from the front it is a curling plume, not a tall drum)
      b.solid("head", leafGeo(b.toM, V(0, 0.7, 0.0), V(-0.22 * side, 1.6 + 1.25 * tall, 0.5), V(1.05 * side, 1.3 + 0.95 * tall, -1.2), 0.3, 0.8, 0.6), { map: fmap, ink: 0.0095 });
      b.put(b.solid("head", new THREE.SphereGeometry(0.17 * R, 16, 12), { col: rim, ink: b.INK * 0.6 }), 0, r + 0.07, 0);
    },
  };
};

/** An elder's low cap: a short drum that sits on the crown, a little wider at its flat top, with a band round its
 *  foot. Perched: the hair (grey, for the uncle) stays as drawn all round it. */
export const flatCap = (o: { col?: string; band?: string } = {}): Acc => {
  const col = o.col ?? "#4b4560", band = o.band ?? "#8f86a8";
  return {
    name: "flatCap", slots: ["hat", "crown"], key: ["flatCap", col, band].join("|"), hat: { rim: 42, hair: "keep", shade: false },
    build(b) {
      b.tilt(0, -6);
      const prof = rounded([[0.5, 0.5], [0.66, 0.8], [0.7, 1.24], [0, 1.27]], 0.07), g = lathe(b.toM, prof, 44), vAt = g.userData.vAt as number[];
      // (the band: the drum's lowest third, up from where it leaves the head)
      const map = b.tex(8, 256, (cg) => { cg.fillStyle = col; cg.fillRect(0, 0, 8, 256); cg.fillStyle = band; const y0 = 256 * (1 - (vAt[1] + 0.3 * (vAt[7] - vAt[1]))); cg.fillRect(0, y0, 8, 256 - y0); cg.fillStyle = shade(band, 0.5); cg.fillRect(0, y0 - 3, 8, 6); }, `flat|${col}|${band}`);
      b.solid("head", g, { map, ink: 0.009 });
    },
  };
};

/** The body of the officer's cap in head units through toM (PartKit.toM on a head; for a world prop of the cap alone
 *  give e.g. (v) => v.multiplyScalar(0.2): the head's radius): a band round the crown (a rounded square, narrower
 *  than the head) and on it a pitched roof with short eaves that stand out past the band all round: its two sides
 *  lean in to a ridge that runs from front to back and stands `rise` higher at the back than at the front. Its foot
 *  is deep inside the head. uv: u round the head, v = 0 at the foot .. 1 at the ridge; userData.vBand = [v where it
 *  leaves the head, v of the band's top]. */
export const officerCapGeo = (toM: ToM, o: { wide?: number; tall?: number; rise?: number; eave?: number } = {}) => {
  const wide = o.wide ?? 1, tall = o.tall ?? 1, rise = o.rise ?? 0.16, eave = o.eave ?? 0.27, y1 = 1.08, y2 = y1 + 0.125, top = y2 + 0.56 * tall, we = (0.47 + eave) * wide, de = 0.53 + 0.8 * eave;
  // rows from the foot up: [half width, half depth, height, how much of the ridge's slope it takes]
  const rows: [number, number, number, number][] = [[0.38, 0.42, 0.5, 0], [0.46 * wide, 0.52, 0.8, 0], [0.47 * wide, 0.53, y1, 0], [we - 0.02, de - 0.02, y1 + 0.03, 0.03], [we, de, y1 + 0.065, 0.05], [we - 0.02, de - 0.01, y2, 0.08]];
  for (const [k, w] of [[0.3, 0.7], [0.6, 0.4], [0.84, 0.16], [0.95, 0.06], [1, 0]] as [number, number][]) rows.push([w * (we - 0.02), lerp(de - 0.01, 0.6, k), lerp(y2, top, k ** 0.9), lerp(0.08, 1, k)]);
  const n = rows.length, seg = 48, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3(), len = [0];
  for (let k = 1; k < n; k++) len.push(len[k - 1] + Math.hypot(rows[k][0] - rows[k - 1][0], rows[k][2] - rows[k - 1][2]));
  // (a rounded square round the axis: the unit circle's point with both coordinates raised to the power 0.5)
  const sq = (c: number) => Math.sign(c) * Math.sqrt(Math.abs(c));
  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI + (2 * Math.PI * (i % seg)) / seg, cx = sq(Math.sin(a)), cz = sq(Math.cos(a));
    for (let k = 0; k < n; k++) { const [hx, hz, y, sl] = rows[k]; toM(v.set(hx * cx, y - rise * sl * cz, hz * cz)); pos.push(v.x, v.y, v.z); uv.push(i / seg, len[k] / len[n - 1]); }
  }
  for (let i = 0; i < seg; i++) for (let k = 0; k < n - 1; k++) { const A = i * n + k, B = A + 1, C = A + n, D = C + 1; idx.push(A, C, B, B, C, D); }
  const g = meshOf(pos, uv, idx);
  g.userData.vBand = [len[1] / len[n - 1], len[2] / len[n - 1]];
  return g;
};
/** A junior officer's low cap (帻): a cloth band round the crown and a little pitched roof on it with short eaves,
 *  its ridge running from front to back and standing higher at the back. Low (it adds a third of a head), pointed on
 *  top, with a notch under the eaves each side: from the front a little gable roof, from the side a wedge. No pin,
 *  no knob, no plume: plain. Perched: the hair stays as drawn all round it. The only gable of the cast (曹无伤's). */
export const officerCap = (o: { col?: string; band?: string; tall?: number; wide?: number } = {}): Acc => {
  const col = o.col ?? "#2a2630", band = o.band ?? "#c8322c", tall = o.tall ?? 1, wide = o.wide ?? 1;
  return {
    name: "officerCap", slots: ["hat", "crown"], key: ["officerCap", col, band, tall, wide].join("|"), hat: { rim: 42, hair: "keep", shade: false },
    build(b) {
      b.tilt(0, -7);
      const g = officerCapGeo(b.toM, { tall, wide }), [v0, v1] = g.userData.vBand as number[];
      // the band from where the cap leaves the head up to the roof's foot, an ink line where the roof starts
      const map = b.tex(8, 256, (cg) => { cg.fillStyle = col; cg.fillRect(0, 0, 8, 256); cg.fillStyle = band; const yb = 256 * (1 - v1); cg.fillRect(0, yb, 8, 256 - yb); cg.fillStyle = shade(band, 0.5); cg.fillRect(0, yb - 3, 8, 6); void v0; }, `officer|${col}|${band}|${tall}|${wide}`);
      b.solid("head", g, { map, ink: 0.009 });
    },
  };
};

const NECK: WrapO = { r: 1.07, front: 58, arch: 8, low: 132, a0: 64, a1: 80, back: 14, tuck: 9 };
/** A soldier's plain helmet: a round dark skull pulled down over the hair with a lighter rim and a knob on top, and
 *  a leather guard that covers the sides and the back of the head down to the neck; the whole face stays open. */
export const helmet = (o: { col?: string; rim?: string; guard?: string | false } = {}): Acc => {
  const col = o.col ?? "#565b6b", rim = o.rim ?? "#8a8fa0", guard = o.guard === false ? null : o.guard ?? "#5b4636";
  return {
    name: "helmet", slots: ["hat", "crown"], key: ["helmet", col, rim, guard].join("|"), hat: { rim: 60 },
    build(b) {
      const R = b.R, r = 1.13, to = 60;
      if (guard) b.shell({ geo: wrapGeo(NECK), paint: "cloth", map: b.tex(1024, 512, (g) => wrapPaint(g, NECK, guard, { under: (g2) => { g2.fillStyle = shade(guard, 0.84); for (let k = 0; k < 18; k++) g2.fillRect(k * 57 + 4, 150, 5, 362); } }), `neck|${guard}`) });
      b.shell({ r, to, col, tuck: 5, rimInk: 0.011 });
      b.shell({ r: r + 0.035, from: to - 9, to: to - 1, rings: 4, col: rim, ink: 0.006, tuck: 4, tuckTop: 4, onR: r });
      b.put(b.solid("head", new THREE.SphereGeometry(0.13 * R, 14, 10), { col: rim, ink: b.INK * 0.6 }), 0, r + 0.05, 0);
    },
  };
};

const WAR_NECK: WrapO = { r: 1.075, front: 57, arch: 9, low: 136, a0: 60, a1: 78, back: 16, tuck: 9 };
/** A commander's WAR HELMET (兜鍪) with its tassel (盔缨): a dark iron skull pulled down to the brows with a gold roll
 *  round its rim, a gold comb over the crown from front to back and a gold boss on the brow; a guard of small plates
 *  (顿项) with a gold edge over the sides and the back of the head down to the neck (the whole face stays open); and
 *  on top a tall gold spike that carries a tassel of horsehair, which springs up round the spike and falls outward,
 *  with the spike's point standing out above it. Nothing feathered, no brim. Upright and the same from every side (it
 *  is turned on a lathe): the tallest thing in the cast, and it does not read as a plume. tassel = its colour, tall =
 *  the height of spike and tassel (1 = the tassel's top 1.5 head radii above the crown), full = how wide the tassel is.
 *  The beard's sideburns run up under the guard. Slots hat + crown; hide: ["warHelmet"]. */
export const warHelmet = (o: { col?: string; rim?: string; tassel?: string; guard?: string; tall?: number; full?: number } = {}): Acc => {
  const col = o.col ?? "#565c70", rim = o.rim ?? GOLD, tassel = o.tassel ?? "#6f37a0", guard = o.guard ?? "#474c5e", tall = o.tall ?? 1, full = o.full ?? 1;
  return {
    name: "warHelmet", slots: ["hat", "crown"], key: ["warHelmet", col, rim, tassel, guard, tall, full].join("|"), hat: { rim: 57, shade: false },
    build(b) {
      const R = b.R, r = 1.135, to = 57;
      // the guard: rows of small plates, a gold edge along its rim
      b.shell({ geo: wrapGeo(WAR_NECK), paint: "cloth", map: b.tex(1024, 512, (g) => wrapPaint(g, WAR_NECK, guard, { trim: rim, trimDeg: 4.5, under: (g2) => {
        g2.fillStyle = shade(guard, 0.72);
        for (let j = 0; j < 9; j++) { g2.fillRect(0, 150 + j * 40, 1024, 4); for (let k = 0; k < 26; k++) g2.fillRect(k * 39.4 + (j % 2) * 19.7, 150 + j * 40, 4, 40); }
      } }), `warneck|${guard}|${rim}`) });
      // the skull, its rim roll, the comb over the crown, the brow boss
      b.shell({ r, to, col, tuck: 5, rimInk: 0.011 });
      b.shell({ r: r + 0.04, from: to - 10, to: to - 1, rings: 4, col: rim, ink: 0.006, tuck: 4, tuckTop: 4, onR: r });
      b.solid("head", hoop(b.toM, { r: r + 0.02, a0: -74, a1: 50, deep: 0.1, across: 0.2, yaw: 90, e: 0.6 }), { col: rim, ink: 0.006 });
      b.put(b.solid("head", roundBox(0.3 * R, 0.3 * R, 0.14 * R, 0.62), { col: rim, ink: 0.006 }), 0, (r + 0.03) * Math.cos(rad(to - 9)), (r + 0.03) * Math.sin(rad(to - 9)));
      // the spike: a socket on the crown, a tall stem, a spear point above the tassel
      const y0 = r - 0.06, top = y0 + 1.36 * tall, bind = y0 + 0.5 * tall, w = 0.4 * full;
      b.solid("head", lathe(b.toM, rounded([[0.2, y0 - 0.3], [0.2, y0 + 0.02], [0.13, y0 + 0.1], [0.065, y0 + 0.2], [0.06, top - 0.02], [0.105, top + 0.07], [0.02, top + 0.4], [0, top + 0.41]], 0.02), 24), { col: rim, ink: 0.006 });
      // the tassel: tied to the stem just under the spear point, the horsehair falls down and outward round the stem
      // to a fringe at `bind` (the stem shows bare between the fringe and the helmet); hollow underneath
      const prof = rounded([[0.05, bind + 0.3 * tall], [0.16 * full, bind + 0.05 * tall], [w * 0.86, bind - 0.02 * tall], [w, bind + 0.1 * tall], [w * 0.82, bind + 0.36 * tall], [w * 0.52, bind + 0.62 * tall], [w * 0.3, top - 0.16 * tall], [0.1, top - 0.03], [0.03, top]], 0.05);
      const tg = lathe(b.toM, prof, 28), tmap = b.tex(256, 256, (g) => {
        g.fillStyle = tassel; g.fillRect(0, 0, 256, 256);
        // strands of horsehair down it (u runs round it), darker at the fringe
        g.strokeStyle = shade(tassel, 0.7); g.lineWidth = 5; g.lineCap = "round";
        for (let k = 0; k < 16; k++) { g.beginPath(); g.moveTo(k * 16 + 6, 20 + (k % 3) * 22); g.lineTo(k * 16 + 6, 236); g.stroke(); }
        g.strokeStyle = shade(tassel, 1.45); g.lineWidth = 3;
        for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(k * 32 + 20, 40 + (k % 2) * 30); g.lineTo(k * 32 + 20, 150); g.stroke(); }
      }, `tassel|${tassel}`);
      b.solid("head", tg, { map: tmap, paint: "hair", ink: 0.009 });
    },
  };
};

/** WILD HAIR for a bare-headed fighter (worn with `topknot`, after it in the list): loose locks of the look's hair
 *  that stand out from the back and the sides of the head behind the brow band, swept back and down, and a long tail
 *  of hair that falls from the knot down the back of the head. All behind the face zone. No slot; hide: ["mane"]. */
export const mane = (o: { tail?: number; locks?: number } = {}): Acc => {
  const tail = o.tail ?? 1, locks = o.locks ?? 1;
  return {
    name: "mane", slots: [], key: ["mane", tail, locks].join("|"),
    build(b) {
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z), hair = b.look.hairCol;
      const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, 0.38), { col: hair, paint: "hair", ink: 0.008 });
      // the side and back locks: from inside the head out past the outline, pointing back and down
      if (locks > 0) for (const s of [-1, 1]) {
        lock(V(s * 0.6, 0.2, -0.5), V(s * 1.12, 0.12, -0.72), V(s * (1.22 + 0.14 * locks), -0.34, -0.86), 0.42, 0.34);
        lock(V(s * 0.5, -0.1, -0.6), V(s * 0.98, -0.3, -0.86), V(s * (0.98 + 0.12 * locks), -0.82, -0.9), 0.4, 0.34);
        lock(V(s * 0.3, 0.4, -0.7), V(s * 0.62, 0.36, -1.14), V(s * 0.7, -0.2, -1.3 - 0.1 * locks), 0.42, 0.34);
      }
      // the tail: from the knot back over the crown and down behind the head
      if (tail > 0) lock(V(0, 1.15, -0.1), V(0, 1.75, -1.25), V(0, 0.1 - 0.5 * tail, -1.5 - 0.12 * tail), 0.46, 0.4);
    },
  };
};

/** A WARLORD'S BOUND HAIR (束发冠, round 2: what 项羽 wears): no helmet. The hair is drawn up into a big knot on
 *  the crown that stands in a small gold crown (a cup with a flared rim round the knot's foot), a long gold pin
 *  through the crown from side to side; a cloth band round the brow (抹额) with a gold boss in front; and LOOSE
 *  HAIR: a heavy tail that falls from the knot down the back of the head, and locks that hang down behind the head
 *  to below it (their ends show beside the neck from the front; side locks that stand out at ear height read as
 *  ears). Everything is behind or above the face zone. It is hair, not a hat:
 *  slot "crown" only, the look's own hairline stays as drawn. hide: ["warCrown"]. */
export const warCrown = (o: { gold?: string; band?: string; size?: number; hair?: number } = {}): Acc => {
  const gold = o.gold ?? GOLD, band = o.band ?? "#7a3fa8", s = o.size ?? 1.3, loose = o.hair ?? 1;
  return {
    name: "warCrown", slots: ["crown"], noHairProps: true, key: ["warCrown", gold, band, s, loose].join("|"),
    build(b) {
      const R = b.R, hair = b.look.hairCol, V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      // the brow band, its knot behind, the boss in front (above the brows: 50 degrees from the crown)
      b.shell({ r: 1.04, from: 42, to: 57, rings: 5, col: band, paint: "cloth", ink: 0.006, tuck: 4, tuckTop: 4 });
      b.put(b.solid("head", new THREE.SphereGeometry(0.11 * R, 12, 9), { col: band, paint: "cloth", ink: 0.005 }), 0, 0.62, -0.87);
      b.put(b.solid("head", roundBox(0.2 * R, 0.17 * R, 0.09 * R, 0.6), { col: gold, ink: 0.0055 }), 0, 1.05 * Math.cos(rad(49.5)), 1.05 * Math.sin(rad(49.5)));
      // the loose hair (before the tilt: it hangs plumb from the head): all of it BEHIND the head. From the front only
      // the ends show, under the head beside the neck (locks beside the head at ear height read as ears or a wig)
      if (loose > 0) {
        const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number, peak = 0.4) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, peak), { col: hair, paint: "hair", ink: 0.008 });
        for (const sg of [-1, 1]) {
          lock(V(sg * 0.45, 0.1, -0.7), V(sg * 0.95, -0.5, -0.95), V(sg * (0.72 + 0.1 * loose), -1.2 - 0.22 * loose, -0.78), 0.4, 0.34, 0.5);
          lock(V(sg * 0.2, 0.3, -0.8), V(sg * 0.42, -0.4, -1.3), V(sg * 0.3, -1.25 - 0.3 * loose, -1.08), 0.46, 0.38, 0.5);
        }
        // the tail: from the knot back over the crown and down behind the head
        lock(V(0, 1.2, -0.1), V(0, 1.7, -1.35), V(0, -0.5 - 0.7 * loose, -1.42), 0.6, 0.44, 0.42);
      }
      b.tilt(0, -8);
      // the knot: a neck out of the crown and a big ball of hair on it; round its foot the crown: a gold cup with a
      // flared, notched rim (lower than the ball: it must read as hair IN a crown, not as a gold hat)
      const prof = rounded([[0.2 * s, 0.6], [0.2 * s, 1.1], [0.36 * s, 1.16 + 0.2 * s], [0.33 * s, 1.16 + 0.5 * s], [0, 1.16 + 0.6 * s]], 0.14 * s);
      b.solid("head", lathe(b.toM, prof, 32), { col: hair, paint: "hair", ink: 0.008 });
      b.solid("head", lathe(b.toM, rounded([[0.12 * s, 0.92], [0.25 * s, 0.94], [0.27 * s, 1.08], [0.37 * s, 1.16 + 0.1 * s], [0.31 * s, 1.16 + 0.12 * s], [0.12 * s, 1.16 + 0.04 * s]], 0.03), 32), { col: gold, ink: 0.006 });
      pinOn(b, 1.16 + 0.06 * s, 0, 2 * (0.3 * s + 0.4), 0.038, 0.075, gold);
    },
  };
};

/** all by name, with their defaults (sheets and checks) */
export const HEADWEAR: Record<string, (a?: any) => Acc> = { topknot, scholarCap, pheasantCap, flatCap, helmet, officerCap, warHelmet, warCrown };
