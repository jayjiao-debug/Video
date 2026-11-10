// Geometry helpers for accessories (kit/rigacc/*.ts). Metres unless said. Everything here is smooth (one normal per
// point), so it can carry an ink hull: use it with PartKit.solid.
import * as THREE from "three";

/** a box with rounded edges and corners, w x h x d round its centre: a superellipsoid. e = how round: 1 = an
 *  ellipsoid, 0.5 = a soft pillow (the default), 0.25 = nearly a box */
export const roundBox = (w: number, h: number, d: number, e = 0.5, seg = 24) => {
  // (a coordinate that should be 0 comes out of the sphere as 1e-16; raised to a small power that is a tenth of a
  //  millimetre, and the seam and the bottom pole stand open: snap it to 0 first)
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), P = g.attributes.position, pw = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.sign(x) * Math.abs(x) ** e);
  for (let i = 0; i < P.count; i++) P.setXYZ(i, (pw(P.getX(i)) * w) / 2, (pw(P.getY(i)) * h) / 2, (pw(P.getZ(i)) * d) / 2);
  g.computeVertexNormals();
  // the sphere's seam and poles share positions: give them one normal each, or the hull opens along the seam
  const N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};

/** a solid turned on a lathe round the y axis: profile = [radius, y] corners from the bottom up; each inner corner is
 *  rounded with a fillet of `fillet` (never more than 45 % of the shorter side). Start or end at radius 0 to close an
 *  end; an end left open has to be hidden well inside the head or another part (see RIG3D.md). uv: u = round, v = 0
 *  at the first point .. 1 at the last, by length along the profile. To paint a map on it, ask the geometry where
 *  things are: userData.v[i] = the v of profile corner i (the middle of its fillet), userData.len = the profile's
 *  length in metres. */
export const turned = (profile: [number, number][], fillet = 0.01, seg = 40) => {
  const pts: THREE.Vector2[] = [], n = profile.length, mark = [0];
  const V2 = (p: [number, number]) => new THREE.Vector2(Math.max(p[0], 0), p[1]);
  pts.push(V2(profile[0]));
  for (let i = 1; i < n - 1; i++) {
    const a = V2(profile[i - 1]), b = V2(profile[i]), c = V2(profile[i + 1]);
    const f = Math.min(fillet, 0.45 * a.distanceTo(b), 0.45 * b.distanceTo(c));
    const p0 = b.clone().add(a.clone().sub(b).setLength(f)), p1 = b.clone().add(c.clone().sub(b).setLength(f));
    mark.push(pts.length + 3);
    for (let k = 0; k <= 6; k++) { const t = k / 6, s = 1 - t; pts.push(new THREE.Vector2(s * s * p0.x + 2 * s * t * b.x + t * t * p1.x, s * s * p0.y + 2 * s * t * b.y + t * t * p1.y)); }
  }
  pts.push(V2(profile[n - 1])); mark.push(pts.length - 1);
  const g = new THREE.LatheGeometry(pts, seg), len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const U = g.attributes.uv, total = len[pts.length - 1];
  for (let i = 0; i <= seg; i++) for (let j = 0; j < pts.length; j++) U.setY(i * pts.length + j, len[j] / total);
  // one normal per position (the lathe's seam, and the points on the axis)
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  g.userData.v = mark.map((m) => len[m] / total); g.userData.len = total;
  return g;
};

/** a bar bent over the head: a smooth, closed strip whose middle line runs on the ball of radius r (head units) from
 *  a0 to a1 degrees from the crown, along the great circle from ear to ear (yaw 0; - = the person's right; yaw 90 =
 *  from the back of the head over the crown to the face). `deep` thick (away from the head) and `across` wide, both
 *  head units; e = how square its cross-section is (1 = an ellipse, 0.5 = a soft slab, the default). toM =
 *  PartKit.toM, so it follows the head's shape and the accessory's tilt. Its two ends are flat: hide them inside
 *  other parts. Use it with PartKit.solid("head", ...), left at the head's origin. */
export const hoop = (toM: (v: THREE.Vector3) => THREE.Vector3, o: { r: number; a0: number; a1: number; deep: number; across: number; yaw?: number; e?: number; seg?: number }) => {
  const NA = o.seg ?? 44, NC = 20, e = o.e ?? 0.5, yw = ((o.yaw ?? 0) * Math.PI) / 180, cy = Math.cos(yw), sy = Math.sin(yw);
  const pos: number[] = [], idx: number[] = [], v = new THREE.Vector3(), pw = (x: number) => Math.sign(x) * Math.abs(x) ** e;
  for (let i = 0; i <= NA; i++) {
    const a = ((o.a0 + ((o.a1 - o.a0) * i) / NA) * Math.PI) / 180, sa = Math.sin(a), ca = Math.cos(a);
    for (let j = 0; j < NC; j++) {
      const p = (j / NC) * Math.PI * 2, rr = o.r + (o.deep / 2) * pw(Math.cos(p)), w = (o.across / 2) * pw(Math.sin(p));
      toM(v.set(sa * rr * cy - w * sy, ca * rr, sa * rr * sy + w * cy));
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NC; j++) { const j1 = (j + 1) % NC, A = i * NC + j, B = i * NC + j1, C = A + NC, D = B + NC; idx.push(A, B, C, C, B, D); }
  for (let m = 1; m < NC - 1; m++) idx.push(0, m + 1, m, NA * NC, NA * NC + m, NA * NC + m + 1);          // the two flat ends
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
};

/** a round tube through the points (a smooth curve), radius r; its ends are open: hide them inside other parts */
export const tube = (pts: [number, number, number][], r: number, seg = 24) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, 10, false);

/** degrees to radians */
export const rad = (d: number) => (d * Math.PI) / 180;

/** a colour made darker (k < 1) or lighter (k > 1) */
export const shade = (col: string, k: number) => { const c = new THREE.Color(col); c.multiplyScalar(k); return "#" + c.getHexString(); };
