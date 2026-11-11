// Headwear of the Arthur film (medieval, storybook-simple), as accessories for the kit's rig3d figures:
//   rc.add(look, { acc: [crown()] })
//     coronet     a lord's coronet: a gold ring with short rounded teeth and painted gems (perched, the hair stays)
//     crown       THE king's crown: a broad flared gold ring, tall points with ball tips, a crimson cap inside
//     kettleHelm  a guard's kettle helmet: a steel skull with a wide sloping brim all round (pulled down)
//     openHelm    a young knight's open-faced helmet: a steel skull cap with a ridge over a mail coif
//     hood        a commoner's hood: cloth round the head with the face open, a soft point at the back, a cape-let
//     linenCap    a close off-white linen cap over the crown and the ears, its ties drawn under the chin
//     strawHat    a peasant's straw hat: a low crown and a wide brim that droops a little
//     plumedHat   a rich man's flat velvet bonnet with one bold feather sweeping back
// Every one takes the slots "hat" and "crown". The kit's rules hold (group/kit/RIG3D.md): nothing 3D in front of the
// face (the wraps leave the face zone open: 62 degrees each side of the front, below the brows), every hidden end is
// deep inside the head, thin things are painted. Nothing is random; nothing changes from frame to frame.
// What hood and openHelm paint on the clothes (a cape-let, a mail mantle) is NOT guarded by a slot: list them after a
// coat-like accessory to keep it on top, or switch it off (cape: false / mantle: false).
// Checked by the costume lead (people.ts is the cast that uses them): the hood is painted as cloth; the mail's rings
// are two close tones (they broke into dots at the head's outline); the coif's opening comes down over the temples
// (cut hair showed between the helmet's rim and the mail); the wraps are finely tessellated (coarse triangles seen
// edge on let single pixels of the outline through: count with scripts/rig3d/specks.py on a turn, see people_lineup
// `spin`). Give wrapped heads (hood, linenCap, openHelm with a coif) short hair: a ponytail or long hair comes out.
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { rad, shade } from "../../group/kit/rigacc/shapes";

type ToM = (v: THREE.Vector3) => THREE.Vector3;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };

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
 *  prof = [radius, height] in head units, from the bottom up on the outside (then, if it comes back down, on the
 *  inside). uv: u round the head (0.5 = the face side), v = 0 at the first point .. 1 at the last, by length; vAt[k]
 *  = the v of profile point k. An open end has to be deep inside the head. Use with PartKit.solid("head", ...). */
const lathe = (toM: ToM, prof: [number, number][], seg = 56) => {
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

/** A crown's ring as one smooth solid: a wall that stands in the head (it goes `sink` below y0, where it leaves the
 *  skin), leans out by `flare` per unit of height, is `band` high all round and rises to `pts` points of `ptH` more
 *  (one over the face); shape(w) = how much of ptH at w = 1 on a point .. 0 between two. `th` thick, its top edge
 *  rounded. Head units. uv: u round the head (0.5 = the face side); on the outside v = 0 at y0 .. 0.85 at the tips;
 *  the inside is all v = 0.97 (paint the top of the map as the inside's colour). */
type RingO = { r0: number; y0: number; sink: number; flare: number; band: number; pts: number; ptH: number; th: number; shape: (w: number) => number; seg?: number };
const ringGeo = (toM: ToM, o: RingO) => {
  const NA = o.pts * (o.seg ?? 16), NP = 4, NC = 5, H = (o.band + o.ptH + o.th / 2) / 0.85;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3();
  let M = 0;
  for (let i = 0; i <= NA; i++) {
    const a = -Math.PI + (2 * Math.PI * i) / NA, sn = Math.sin(a), cs = Math.cos(a), x = (a * o.pts) / (2 * Math.PI), w = 1 - 2 * Math.abs(x - Math.round(x));
    const bt = o.y0 + o.band, top = bt + Math.max(o.ptH * o.shape(w), 0.004), rO = (y: number) => o.r0 + o.flare * (y - o.y0);
    const ys = [o.y0 - o.sink, o.y0, o.y0 + o.band / 2, bt];
    for (let k = 1; k <= NP; k++) ys.push(bt + ((top - bt) * k) / NP);
    const put = (r: number, y: number, tv: number) => { toM(v.set(r * sn, y, r * cs)); pos.push(v.x, v.y, v.z); uv.push(i / NA, tv); };
    const n0 = pos.length / 3;
    for (const y of ys) put(rO(y), y, clamp((y - o.y0) / H, 0, 0.85));
    for (let j = 1; j < NC; j++) { const an = (Math.PI * j) / NC; put(rO(top) - o.th / 2 + (o.th / 2) * Math.cos(an), top + (o.th / 2) * Math.sin(an), j < NC / 2 ? 0.85 : 0.97); }
    for (let k = ys.length - 1; k >= 0; k--) put(rO(ys[k]) - o.th, ys[k], 0.97);
    M = pos.length / 3 - n0;
  }
  for (let i = 0; i < NA; i++) for (let m = 0; m < M - 1; m++) { const A = i * M + m, B = A + 1, C = A + M, D = C + 1; idx.push(A, C, B, B, C, D); }
  return meshOf(pos, uv, idx);
};

/** A plume: a fat tapered leaf along the curve from p0 to p2 bent toward p1 (head units), `wide` across (in the
 *  curve's own plane) and `deep` thick at its fullest; both ends closed. Through toM. For PartKit.solid("head"). */
const plumeGeo = (toM: ToM, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number) => {
  const NS = 22, NC = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3(), c = new THREE.Vector3(), T = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3();
  // the curve's plane: A = across the feather in that plane, B = square to the plane
  const nrm = new THREE.Vector3().crossVectors(p1.clone().sub(p0), p2.clone().sub(p0)).normalize();
  const at = (t: number) => { const s = 1 - t; return c.set(0, 0, 0).addScaledVector(p0, s * s).addScaledVector(p1, 2 * s * t).addScaledVector(p2, t * t); };
  toM(v.copy(p0)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, s = 1 - t;
    T.set(0, 0, 0).addScaledVector(p0, -2 * s).addScaledVector(p1, 2 * s - 2 * t).addScaledVector(p2, 2 * t).normalize();
    B.copy(nrm); A.crossVectors(B, T).normalize();
    const k = Math.sin(Math.PI * t ** 0.8) ** 0.6, w = (wide / 2) * k * (1 + 0.07 * Math.sin(t * 9 * Math.PI) * smooth((t - 0.15) / 0.2)), d = (deep / 2) * (0.45 + 0.55 * k);
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

/** A wrap: a shell round the crown, the sides and the back of the head that leaves the face open. In degrees: from
 *  the crown it reaches down to `front` over the face (above the brows), and from a0 to a1 degrees round from the
 *  face side its edge drops to `low` (plus `back` more at the very back); arch = how much lower the edge over the
 *  face is at a0 than in the middle (the opening's rounded upper corners). r = its radius in head units. Its edge
 *  turns in to the skin over the last `tuck` degrees, but only round the face (up to 86 degrees from the face side,
 *  gone by 98): behind that the edge is low on the head, and a ledge that turns in there faces down and forward, so
 *  a camera at head height would see it THROUGH the chin (a shell is drawn before the skin, which skips its pixels).
 *  There the edge just ends, hidden against the top of the body. */
type WrapO = { r: number; front: number; low: number; a0: number; a1: number; back?: number; tuck?: number; arch?: number };
const wrapEdge = (o: WrapO, az: number) => o.front + (o.arch ?? 0) * Math.min(1, Math.abs(az) / o.a0) ** 2 + (o.low - o.front - (o.arch ?? 0)) * smooth((Math.abs(az) - o.a0) / (o.a1 - o.a0)) + (o.back ?? 0) * ((1 - Math.cos(rad(az))) / 2) ** 2;
/** the wrap's geometry round the unit ball, for PartKit.shell({ geo }): the normals are the ball's; u = round the head
 *  (0.5 = the face side), v = 1 at the crown .. 0 at 180 degrees from it (so a map is a plain chart of the head:
 *  x = azimuth, y = degrees from the crown; see wrapTex) */
const wrapGeo = (o: WrapO) => {
  const half = [0];
  // (no needle-thin triangles: seen edge on at the head's outline they let single pixels of what is behind through)
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
  // (stroked along the edge, so the band is as wide where the edge runs down the cheek as where it runs level)
  const edge = (deg: number, c: string) => {
    g.beginPath(); for (let az = -180; az <= 180; az += 0.5) { const x = X(az), y = Y(wrapEdge(o, az)); if (az === -180) g.moveTo(x, y); else g.lineTo(x, y); }
    g.strokeStyle = c; g.lineWidth = 2 * deg * (512 / 180); g.lineJoin = "round"; g.stroke();
  };
  if (p.trim) edge(p.trimDeg ?? 7, p.trim);
  edge(1.6, p.ink ?? shade(col, 0.4));
};

const GOLD = "#edb92e";
/** the map of a crown's ring (see ringGeo): gold, a darker line along the band's two edges, one gem under each point */
const ringPaint = (g: CanvasRenderingContext2D, W: number, Hh: number, col: string, gems: string[], pts: number, vBand: number, gemW: number, gemH: number) => {
  const Y = (v: number) => (1 - v) * Hh, line = shade(col, 0.62);
  g.fillStyle = col; g.fillRect(0, 0, W, Hh);
  g.fillStyle = shade(col, 0.74); g.fillRect(0, 0, W, Y(0.91));                                   // the inside of the ring
  g.fillStyle = line; g.fillRect(0, Y(vBand) - Hh * 0.016, W, Hh * 0.032); g.fillRect(0, Y(0.05), W, Hh * 0.06);
  for (let k = 0; k <= pts; k++) {
    const x = ((k + (pts % 2 ? 0.5 : 0)) / pts) * W, y = Y(vBand * 0.52), c = gems[k % gems.length];
    g.beginPath(); g.ellipse(x, y, gemW * W, gemH * Hh, 0, 0, 7); g.fillStyle = c; g.fill(); g.lineWidth = Math.max(2, gemW * W * 0.28); g.strokeStyle = shade(c, 0.5); g.stroke();
    g.beginPath(); g.ellipse(x - gemW * W * 0.3, y - gemH * Hh * 0.3, gemW * W * 0.24, gemH * Hh * 0.22, 0, 0, 7); g.fillStyle = "#ffffff"; g.globalAlpha = 0.75; g.fill(); g.globalAlpha = 1;
  }
};

/** A lord's coronet: a gold ring round the crown of the head with short rounded teeth and a gem painted under each.
 *  Perched: the look's own hair stays as drawn. points = 5 to 7 teeth; tilt = degrees toward the person's left. */
export const coronet = (o: { col?: string; gem?: string; points?: number; tilt?: number } = {}): Acc => {
  const col = o.col ?? GOLD, gem = o.gem ?? "#c9283e", pts = clamp(Math.round(o.points ?? 6), 5, 7), tilt = o.tilt ?? 0;
  return {
    name: "coronet", slots: ["hat", "crown"], key: `${col}|${gem}|${pts}|${tilt}`, hat: { rim: 46, hair: "keep", shade: false },
    build(b) {
      b.tilt(tilt, -3);
      const band = 0.25, ptH = 0.2, th = 0.11, vBand = (band / (band + ptH + th / 2)) * 0.85;
      // (one tooth stands over the middle of the face, whatever the count)
      const geo = ringGeo(b.toM, { r0: 0.72, y0: 0.68, sink: 0.34, flare: 0.1, band, pts, ptH, th, shape: (w) => smooth((w - 0.22) / 0.6) });
      const map = b.tex(1024, 256, (g) => ringPaint(g, 1024, 256, col, [gem], pts, vBand, 0.019, 0.085), `${col}|${gem}|${pts}`);
      b.solid("head", geo, { map });
    },
  };
};

/** THE king's crown: a broad gold ring that leans out, eight tall points with a ball on each, a crimson velvet cap
 *  that shows between the points, big gems painted on the band. Perched: the hair stays as drawn. Much bigger than a
 *  coronet: as wide as the head at its tips and half a head high. */
export const crown = (o: { col?: string; cap?: string; gem?: string } = {}): Acc => {
  const col = o.col ?? GOLD, cap = o.cap ?? "#c2203a", gem = o.gem ?? "#2f7fe0";
  return {
    name: "crown", slots: ["hat", "crown"], key: `${col}|${cap}|${gem}`, hat: { rim: 53, hair: "keep", shade: false },
    build(b) {
      b.tilt(0, -4);
      const R = b.R, PTS = 8, r0 = 0.8, y0 = 0.6, flare = 0.2, band = 0.34, ptH = 0.46, th = 0.12, bt = y0 + band, vBand = (band / (band + ptH + th / 2)) * 0.85;
      const rO = (y: number) => r0 + flare * (y - y0);
      // the cap first: its wall runs inside the ring's own wall (half way through it), so the ring's inside never
      // shows beside it; above the band it turns in to a dome that stands between the points
      const rc = rO(bt) - th * 0.5, dome: [number, number][] = [[rO(0.22) - th * 0.5, 0.22], [rc, bt]];
      for (let k = 1; k <= 9; k++) { const t = (k / 10) * (Math.PI / 2); dome.push([rc * Math.cos(t), bt + 0.52 * Math.sin(t)]); }
      dome.push([0, bt + 0.52]);
      b.solid("head", lathe(b.toM, dome), { col: cap });
      const geo = ringGeo(b.toM, { r0, y0, sink: 0.36, flare, band, pts: PTS, ptH, th, shape: (w) => w ** 1.25 });
      const map = b.tex(1024, 256, (g) => ringPaint(g, 1024, 256, col, [gem, "#d8283e"], PTS, vBand, 0.026, 0.1), `${col}|${gem}`);
      b.solid("head", geo, { map });
      // a ball on every point (its lower half is the point's own tip) and one on the cap's top
      const ball = new THREE.SphereGeometry(0.105 * R, 14, 10), tipY = bt + ptH + 0.05, tipR = rO(tipY) - th / 2;
      for (let k = 0; k < PTS; k++) { const a = (k / PTS) * Math.PI * 2; b.put(b.solid("head", ball, { col, ink: b.INK * 0.6 }), tipR * Math.sin(a), tipY, tipR * Math.cos(a)); }
      b.put(b.solid("head", new THREE.SphereGeometry(0.14 * R, 16, 12), { col, ink: b.INK * 0.6 }), 0, bt + 0.56, 0);
    },
  };
};

/** A guard's kettle helmet (an iron hat): a round steel skull pulled down over the hair, a ridge from front to back
 *  and a wide brim that slopes down all round and shades the brow. */
export const kettleHelm = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? "#aeb7c4";
  return {
    name: "kettleHelm", slots: ["hat", "crown"], key: col, hat: { rim: 56 },
    build(b) {
      const r = 1.1, sq = 1.1, to = 58, rimR = r * Math.sin(rad(to)), rimY = r * Math.cos(rad(to)) * sq, rIn = 0.6, droop = 0.3;
      const m = b.paint("head", { col });
      b.shell({ r, to, squash: sq, mat: m });
      const ridge = b.tex(8, 64, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 64); g.fillStyle = "#4a4c55"; g.fillRect(0, 0, 8, 9); g.fillRect(0, 55, 8, 9); }, "ridge");
      b.shell({ geo: b.band({ r: r + 0.04, a0: -60, a1: 60, half: 0.1, yaw: 90 }), squash: sq, col: shade(col, 0.9), map: ridge, ink: b.INK });
      // the brim starts inside the head, passes just over the skull's rim and comes out of it at join
      b.solid("head", b.brim({ rIn, y: rimY + droop * (rimR - rIn) + 0.012, out: rimR - rIn + 0.5, droop, thick: 0.12, taper: 0.75, join: rimR + 0.003 }), { mat: m });
    },
  };
};

/** the mail of a coif, painted at low contrast on a wrap's map: rows of rings, each row set half a ring along */
const mailRings = (g: CanvasRenderingContext2D, col: string) => {
  // (two tones close together and a soft line: at the edge of the head, where the pattern is squeezed to single
  // pixels, a stronger ring breaks into dark dots that come and go as the head turns)
  g.strokeStyle = shade(col, 0.88); g.lineWidth = 5; g.lineCap = "round";
  const N = 40, dx = 1024 / N, dy = 512 / 20;
  for (let r = 0; r <= 20; r++) for (let k = 0; k <= N; k++) { g.beginPath(); g.arc((k + (r % 2) * 0.5) * dx, r * dy, dx * 0.36, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
};
// (arch: the opening's upper corners come down over the temples, where cut hair would show between the rim and the mail)
const COIF: WrapO = { r: 1.075, front: 60, arch: 10, low: 144, a0: 63, a1: 78, back: 16, tuck: 9 };

/** A young knight's open-faced helmet: a rounded steel skull cap with a ridge from front to back, over a mail coif
 *  that wraps the sides and the back of the head down to the shoulders; the whole face stays open. coif = the
 *  mail's colour, false = no coif (a plain skull cap, the hair comes out below it). mantle (default: with a coif) =
 *  the mail goes on over the shoulders, painted on the clothes. */
export const openHelm = (o: { col?: string; coif?: string | false; mantle?: boolean } = {}): Acc => {
  const col = o.col ?? "#b8c1cd", coif = o.coif === false ? null : o.coif ?? "#8b94a3", mantle = !!coif && (o.mantle ?? true);
  return {
    name: "openHelm", slots: ["hat", "crown"], key: `${col}|${coif}|${mantle}`, hat: { rim: 60 },
    outfit: mantle ? (c) => {
      const lo = (az: number) => 0.665 - 0.02 * Math.cos(rad(az * 6)), top: [number, number][] = [], low: [number, number][] = [];
      for (let az = -180; az <= 180; az += 6) { top.push(c.P(az, 1)); low.push(c.P(az, lo(az))); }
      c.poly([...top, ...low.slice().reverse()], coif!);
      const g = c.g, ring = c.shade(coif!, 0.88);
      g.strokeStyle = ring; g.lineWidth = 5; g.lineCap = "round";
      for (let r = 0; r < 4; r++) for (let k = 0; k < 26; k++) { const [x, y] = c.P(-180 + ((k + (r % 2) * 0.5) / 26) * 360, 0.95 - r * 0.075); g.beginPath(); g.arc(x, y, 13, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
      c.line(low, c.shade(coif!, 0.4), c.LW * 0.55);
    } : undefined,
    build(b) {
      const r = 1.14, to = 61;
      if (coif) b.shell({ geo: wrapGeo(COIF), map: b.tex(1024, 512, (g) => wrapPaint(g, COIF, coif, { under: (g2) => mailRings(g2, coif) }), `coif|${coif}`) });
      b.shell({ r, to, col, tuck: 5, rimInk: 0.011 });
      const ridge = b.tex(8, 64, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 64); g.fillStyle = "#4a4c55"; g.fillRect(0, 0, 8, 9); g.fillRect(0, 55, 8, 9); }, "ridge");
      b.shell({ geo: b.band({ r: r + 0.04, a0: -57, a1: 57, half: 0.1, yaw: 90 }), col: shade(col, 0.9), map: ridge, ink: b.INK });
    },
  };
};

const HOOD: WrapO = { r: 1.12, front: 57, arch: 12, low: 146, a0: 63, a1: 82, back: 4, tuck: 10 };
/** A commoner's hood: cloth that wraps the crown, the sides and the back of the head with the face open, a soft short
 *  point at the back of the crown, and a cape-let over the shoulders (painted on the clothes; cape: false = none).
 *  trim = the band along the face opening and the cape-let's hem. */
export const hood = (o: { col?: string; trim?: string; cape?: boolean } = {}): Acc => {
  const col = o.col ?? "#a9573a", trim = o.trim ?? shade(col, 0.74), cape = o.cape ?? true;
  return {
    name: "hood", slots: ["hat", "crown"], key: `${col}|${trim}|${cape}`, hat: { rim: 60 },
    outfit: cape ? (c) => {
      const lo = (az: number) => 0.6 - 0.035 * Math.cos(rad(az)) ** 2, top: [number, number][] = [], low: [number, number][] = [], hem: [number, number][] = [];
      for (let az = -180; az <= 180; az += 6) { top.push(c.P(az, 1)); low.push(c.P(az, lo(az))); hem.push(c.P(az, lo(az) + 0.045)); }
      c.poly([...top, ...low.slice().reverse()], col);
      c.poly([...hem, ...low.slice().reverse()], trim);
      c.line(low, c.shade(col, 0.4), c.LW * 0.55);
    } : undefined,
    build(b) {
      const R = b.R, m = b.paint("head", { paint: "cloth", map: b.tex(1024, 512, (g) => wrapPaint(g, HOOD, col, { trim, trimDeg: 8 }), `hood|${col}|${trim}`) });
      b.shell({ geo: wrapGeo(HOOD), mat: m });
      // the point: a soft closed teardrop whose fat end is inside the back of the crown; it points back and droops
      const tip = rounded([[0, -0.36 * R], [0.46 * R, 0], [0.2 * R, 0.52 * R], [0, 0.7 * R]], 0.18 * R), pts = tip.map(([x, y]) => new THREE.Vector2(x, y));
      const pm = b.put(b.solid("head", weld(new THREE.LatheGeometry(pts, 28)), { col, paint: "cloth" }), 0, 0.55, -0.7);
      pm.rotateX(-rad(100));
    },
  };
};
/** one normal per position on a ready-made geometry (a lathe's seam and its pole) */
const weld = (g: THREE.BufferGeometry) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  return g;
};

const CAP: WrapO = { r: 1.06, front: 58, arch: 5, low: 118, a0: 63, a1: 79, back: 24, tuck: 9 };
/** A close-fitting linen cap (a coif): off-white cloth over the crown and the ears, a seam over the top, and its
 *  ties drawn on the face along the jaw to a knot under the chin (ties: false = none). */
export const linenCap = (o: { col?: string; ties?: boolean } = {}): Acc => {
  const col = o.col ?? "#f1ead9", ties = o.ties ?? true;
  return {
    name: "linenCap", slots: ["hat", "crown"], key: `${col}|${ties}`, hat: { rim: 59 },
    // the ties follow the face's outline from under the cap's edge (the cap covers their upper ends) to the chin
    faceUnder: ties ? (f) => {
      const strap = f.arc(0, -6, 46.6, 46.8, 8, 172, 40);
      f.line(strap, 5.2, shade(col, 0.42)); f.line(strap, 2.9, col);
      f.fill(f.arc(0, 41.2, 3.6, 3), col, 1.3);
    } : undefined,
    build(b) {
      const seam = shade(col, 0.72);
      b.shell({ geo: wrapGeo(CAP), map: b.tex(1024, 512, (g) => wrapPaint(g, CAP, col, { ink: shade(col, 0.45), under: (g2) => { g2.fillStyle = seam; g2.fillRect(0, 0, 4, 512); g2.fillRect(1020, 0, 4, 512); g2.fillRect(509, 0, 6, 512); } }), `cap|${col}`) });
    },
  };
};

/** A peasant's straw hat: a low round crown with a darker band, a wide brim that droops a little and waves, straw
 *  yellow with woven rings painted at low contrast. Perched: the look's own hair stays as drawn. */
export const strawHat = (o: { col?: string; band?: string } = {}): Acc => {
  const col = o.col ?? "#e6c765", band = o.band ?? "#8a5a34";
  return {
    name: "strawHat", slots: ["hat", "crown"], key: `${col}|${band}`, hat: { rim: 50, hair: "keep", shade: false },
    build(b) {
      b.tilt(0, -5);
      const weave = shade(col, 0.84), r0 = 0.78, base = 0.5, h = 0.74;
      // the crown: turned through the head's shape; it goes on down into the head
      const prof = rounded([[r0 * 0.94, base - 0.3], [r0, base + 0.2], [r0 * 0.93, base + h * 0.66], [r0 * 0.5, base + h], [0, base + h]], 0.24);
      const crownG = lathe(b.toM, prof), len = prof.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - prof[i][0], p[1] - prof[i][1]), 0);
      // v runs up the profile by length: the band sits just above the brim (which leaves the crown 0.19 above base)
      const v0 = (0.3 + 0.2) / len, vb = 0.2 / len;
      const cmap = b.tex(8, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 8, 256);
        g.fillStyle = weave; for (let k = 0; k < 9; k++) g.fillRect(0, 256 * (1 - v0 - vb - (k + 0.6) * 0.075), 8, 5);
        g.fillStyle = band; g.fillRect(0, 256 * (1 - v0 - vb), 8, 256 * vb);
      }, `crown|${col}|${band}`);
      b.solid("head", crownG, { map: cmap });
      // the brim: rings of weave (its v falls by 1 for every 0.24 head units from the edge inward, so the map repeats)
      const bmap = b.tex(8, 64, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 64); g.fillStyle = weave; g.fillRect(0, 26, 8, 7); g.fillRect(0, 56, 8, 5); }, `brim|${col}`);
      bmap.wrapT = THREE.RepeatWrapping; bmap.needsUpdate = true;
      const rIn = 0.6;
      b.solid("head", b.brim({ rIn, y: base + 0.26, out: (az) => 0.98 + 0.05 * Math.sin(rad(az * 3 + 40)), droop: 0.2, thick: 0.1, taper: 0.8, join: r0 + 0.015 }), { map: bmap });
    },
  };
};

/** A rich man's soft cap: a wide flat velvet bonnet on a narrow band, tipped to the person's right, with one bold
 *  feather that rises from a gold clasp at the left temple and sweeps back over the head. Perched: the hair stays. */
export const plumedHat = (o: { col?: string; plume?: string } = {}): Acc => {
  const col = o.col ?? "#7b3193", plume = o.plume ?? "#f6f1e4";
  return {
    name: "plumedHat", slots: ["hat", "crown"], key: `${col}|${plume}`, hat: { rim: 46, hair: "keep", shade: false },
    build(b) {
      b.tilt(-9, -4);
      const R = b.R, r0 = 0.72, base = 0.64, hb = 0.2, rx = 1.04, ry = 0.3, t0 = -Math.acos(r0 / rx), cy = base + hb - ry * Math.sin(t0);
      const prof: [number, number][] = [[r0 * 0.96, base - 0.32], [r0, base + hb]];
      for (let k = 1; k < 12; k++) { const t = t0 + ((Math.PI / 2 - t0) * k) / 12; prof.push([rx * Math.cos(t), cy + ry * Math.sin(t)]); }
      prof.push([0, cy + ry]);
      const hat = lathe(b.toM, prof), vAt = hat.userData.vAt as number[];
      const map = b.tex(8, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 256); g.fillStyle = shade(col, 0.66); g.fillRect(0, 256 * (1 - vAt[1]), 8, 256 * vAt[1] + 1); }, `bonnet|${col}`);
      b.solid("head", hat, { map });
      // the feather: from the band at the left temple (well above the brows) up and back over the bonnet
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      // (u runs round it: its two flat faces are at u = 0.25 and 0.75; v along it) a quill down the middle of each face, barbs off it
      const fmap = b.tex(256, 256, (g) => {
        g.fillStyle = plume; g.fillRect(0, 0, 256, 256);
        g.strokeStyle = shade(plume, 0.84); g.lineWidth = 7; g.lineCap = "round";
        for (const x of [64, 192]) for (let k = 1; k < 9; k++) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, 256 - k * 27); g.lineTo(x + s * 50, 256 - k * 27 - 22); g.stroke(); }
        g.fillStyle = shade(plume, 0.66); for (const x of [64, 192]) g.fillRect(x - 5, 0, 10, 256);
      }, `plume|${plume}`);
      b.solid("head", plumeGeo(b.toM, V(0.62, base + 0.12, 0.36), V(1.55, 2.25, 0.0), V(0.25, 1.72, -1.3), 0.54, 0.28), { map: fmap });
      b.put(b.solid("head", new THREE.SphereGeometry(0.12 * R, 14, 10), { col: GOLD, ink: b.INK * 0.6 }), 0.66, base + 0.13, 0.4);
    },
  };
};

/** all eight by name, with their defaults (sheets and checks) */
export const HEADWEAR: Record<string, () => Acc> = { coronet: () => coronet(), crown: () => crown(), kettleHelm: () => kettleHelm(), openHelm: () => openHelm(), hood: () => hood(), linenCap: () => linenCap(), strawHat: () => strawHat(), plumedHat: () => plumedHat() };
