// Volumes for the headless clearance checker (see README.md). Everything works on REAL geometry: the triangles of the
// meshes the World built, in their own frame, placed by their world matrices.
//
//   TriSolid      any triangle soup as a solid. Inside test = parity of ray crossings along the six axis directions
//                 (+x -x +y -y +z -z) through a 2D grid per axis; a point is inside when at least 4 of the 6 rays cross
//                 the surface an odd number of times (so a closed mesh is exact, and a mesh with one opening, a skirt
//                 open at the waist or a hat open under the rim, still works). Depth = the shortest of the odd rays'
//                 distances to the surface (an upper bound of the true distance; exact on axis-aligned faces).
//   Capsules      a chain of capsules (the rig's limb tubes, read back from their rings), exact distance.
//   Sphere        a ball (the rig's hands and shoulder caps), exact.
// Sample points: the vertices of a mesh (thinned to a cap) plus, on triangles longer than the spacing, points on a
// barycentric grid, so a box with 8 corners still has points all over its faces.
import * as THREE from "three";

export type V3 = THREE.Vector3;
type Grid = { u: number; v: number; a: number; u0: number; v0: number; cs: number; csv: number; nu: number; nv: number; off: Int32Array; ids: Int32Array };

/** triangles of a geometry (local frame), optionally only those of one component */
export const trisOf = (g: THREE.BufferGeometry): Float32Array => {
  const P = g.attributes.position as THREE.BufferAttribute, idx = g.index;
  const n = idx ? idx.count : P.count, out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const k = idx ? idx.getX(i) : i; out[i * 3] = P.getX(k); out[i * 3 + 1] = P.getY(k); out[i * 3 + 2] = P.getZ(k); }
  return out;
};

/** welded connected components of a triangle soup: an array of triangle soups */
export const componentsOf = (tri: Float32Array, weld = 2e-4): Float32Array[] => {
  const nv = tri.length / 3, nt = nv / 3, key = new Map<string, number>(), rep = new Int32Array(nv);
  for (let i = 0; i < nv; i++) {
    const k = `${Math.round(tri[i * 3] / weld)},${Math.round(tri[i * 3 + 1] / weld)},${Math.round(tri[i * 3 + 2] / weld)}`;
    let r = key.get(k); if (r === undefined) { r = key.size; key.set(k, r); } rep[i] = r;
  }
  const par = Int32Array.from({ length: key.size }, (_, i) => i);
  const find = (x: number): number => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  const union = (a: number, b: number) => { a = find(a); b = find(b); if (a !== b) par[a] = b; };
  for (let t = 0; t < nt; t++) { union(rep[t * 3], rep[t * 3 + 1]); union(rep[t * 3 + 1], rep[t * 3 + 2]); }
  const groups = new Map<number, number[]>();
  for (let t = 0; t < nt; t++) { const r = find(rep[t * 3]); let a = groups.get(r); if (!a) groups.set(r, (a = [])); a.push(t); }
  return [...groups.values()].map((ts) => { const o = new Float32Array(ts.length * 9); ts.forEach((t, i) => o.set(tri.subarray(t * 9, t * 9 + 9), i * 9)); return o; });
};

export const bboxOf = (pts: ArrayLike<number>) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pts.length; i += 3) for (let a = 0; a < 3; a++) { const x = pts[i + a]; if (x < mn[a]) mn[a] = x; if (x > mx[a]) mx[a] = x; }
  return { mn, mx };
};

/** flat within `tol`: the triangle soup lies in one plane (returns its normal) or null */
export const planarOf = (tri: Float32Array, tol = 0.004): V3 | null => {
  let best = 0, n = new THREE.Vector3(), o = new THREE.Vector3();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < tri.length; t += 9) {
    a.fromArray(tri, t); b.fromArray(tri, t + 3).sub(a); c.fromArray(tri, t + 6).sub(a);
    const cr = new THREE.Vector3().crossVectors(b, c), l = cr.length();
    if (l > best) { best = l; n = cr.multiplyScalar(1 / l); o.copy(a); }
  }
  if (best === 0) return null;
  for (let i = 0; i < tri.length; i += 3) if (Math.abs((tri[i] - o.x) * n.x + (tri[i + 1] - o.y) * n.y + (tri[i + 2] - o.z) * n.z) > tol) return null;
  return n;
};

/** surface samples: the welded vertices plus a barycentric grid on long triangles; thinned to `cap` by a fixed stride */
export const samplesOf = (tri: Float32Array, sp: number, cap: number): Float32Array => {
  const out: number[] = [], seen = new Set<string>(), q = sp / 3;
  const push = (x: number, y: number, z: number) => { const k = `${Math.round(x / q)},${Math.round(y / q)},${Math.round(z / q)}`; if (seen.has(k)) return; seen.add(k); out.push(x, y, z); };
  for (let t = 0; t < tri.length; t += 9) {
    const ax = tri[t], ay = tri[t + 1], az = tri[t + 2], bx = tri[t + 3], by = tri[t + 4], bz = tri[t + 5], cx = tri[t + 6], cy = tri[t + 7], cz = tri[t + 8];
    push(ax, ay, az); push(bx, by, bz); push(cx, cy, cz);
    const e = Math.max(Math.hypot(bx - ax, by - ay, bz - az), Math.hypot(cx - bx, cy - by, cz - bz), Math.hypot(ax - cx, ay - cy, az - cz));
    if (e > sp * 1.4) {
      const k = Math.min(60, Math.ceil(e / sp));
      for (let i = 0; i <= k; i++) for (let j = 0; i + j <= k; j++) { const u = i / k, v = j / k, w = 1 - u - v; push(ax * w + bx * u + cx * v, ay * w + by * u + cy * v, az * w + bz * u + cz * v); }
    }
  }
  if (out.length / 3 <= cap) return Float32Array.from(out);
  const n = out.length / 3, step = n / cap, r = new Float32Array(cap * 3);
  for (let i = 0; i < cap; i++) { const k = Math.floor(i * step); r[i * 3] = out[k * 3]; r[i * 3 + 1] = out[k * 3 + 1]; r[i * 3 + 2] = out[k * 3 + 2]; }
  return r;
};

/** a triangle soup as a solid (local frame of its mesh) */
export class TriSolid {
  readonly n: number; readonly mn: number[]; readonly mx: number[];
  private grids: Grid[];
  constructor(readonly tri: Float32Array) {
    this.n = tri.length / 9;
    const b = bboxOf(tri); this.mn = b.mn; this.mx = b.mx;
    this.grids = [0, 1, 2].map((a) => this.grid(a));
  }
  private grid(a: number): Grid {
    const u = (a + 1) % 3, v = (a + 2) % 3, T = this.tri, n = this.n;
    const u0 = this.mn[u] - 1e-4, v0 = this.mn[v] - 1e-4, eu = this.mx[u] - u0 + 2e-4, ev = this.mx[v] - v0 + 2e-4;
    const cs = Math.max(0.004, Math.sqrt((eu * ev) / Math.max(1, Math.min(n / 2, 6000))));
    const nu = Math.max(1, Math.min(160, Math.ceil(eu / cs))), nv = Math.max(1, Math.min(160, Math.ceil(ev / cs)));
    const csu = eu / nu, csv = ev / nv, cnt = new Int32Array(nu * nv + 1);
    const range = (t: number) => {
      const p = t * 9, a0 = T[p + u], a1 = T[p + 3 + u], a2 = T[p + 6 + u], b0 = T[p + v], b1 = T[p + 3 + v], b2 = T[p + 6 + v];
      const area = (a1 - a0) * (b2 - b0) - (a2 - a0) * (b1 - b0);
      if (Math.abs(area) < 1e-12) return null;
      return [Math.max(0, Math.floor((Math.min(a0, a1, a2) - u0) / csu)), Math.min(nu - 1, Math.floor((Math.max(a0, a1, a2) - u0) / csu)),
        Math.max(0, Math.floor((Math.min(b0, b1, b2) - v0) / csv)), Math.min(nv - 1, Math.floor((Math.max(b0, b1, b2) - v0) / csv))];
    };
    const rs: (number[] | null)[] = [];
    for (let t = 0; t < n; t++) { const r = range(t); rs.push(r); if (r) for (let i = r[0]; i <= r[1]; i++) for (let j = r[2]; j <= r[3]; j++) cnt[i * nv + j + 1]++; }
    for (let k = 1; k <= nu * nv; k++) cnt[k] += cnt[k - 1];
    const ids = new Int32Array(cnt[nu * nv]), fill = cnt.slice(0, nu * nv);
    for (let t = 0; t < n; t++) { const r = rs[t]; if (r) for (let i = r[0]; i <= r[1]; i++) for (let j = r[2]; j <= r[3]; j++) ids[fill[i * nv + j]++] = t; }
    return { u, v, a, u0, v0, cs: csu, csv, nu, nv, off: cnt, ids };
  }
  /** crossings of the line through p along axis a: [count above, count below, nearest above, nearest below] */
  private ray(g: Grid, p: number[], out: number[]) {
    out[0] = 0; out[1] = 0; out[2] = Infinity; out[3] = Infinity;
    const pu = p[g.u] + 1.37e-6, pv = p[g.v] + 2.91e-6, pa = p[g.a];
    const i = Math.floor((pu - g.u0) / g.cs), j = Math.floor((pv - g.v0) / g.csv);
    if (i < 0 || j < 0 || i >= g.nu || j >= g.nv) return;
    const T = this.tri, c = i * g.nv + j, u = g.u, v = g.v, a = g.a;
    for (let k = g.off[c]; k < g.off[c + 1]; k++) {
      const q = g.ids[k] * 9;
      const au = T[q + u], av = T[q + v], bu = T[q + 3 + u], bv = T[q + 3 + v], cu = T[q + 6 + u], cv = T[q + 6 + v];
      const d = (bu - au) * (cv - av) - (cu - au) * (bv - av);
      const l1 = ((pu - au) * (cv - av) - (cu - au) * (pv - av)) / d;
      if (l1 < 0 || l1 > 1) continue;
      const l2 = ((bu - au) * (pv - av) - (pu - au) * (bv - av)) / d;
      if (l2 < 0 || l1 + l2 > 1) continue;
      const t = T[q + a] * (1 - l1 - l2) + T[q + 3 + a] * l1 + T[q + 6 + a] * l2;
      if (t > pa) { out[0]++; if (t - pa < out[2]) out[2] = t - pa; } else { out[1]++; if (pa - t < out[3]) out[3] = pa - t; }
    }
  }
  private _p = [0, 0, 0]; private _r = [0, 0, 0, 0];
  /** inside depth at a local point (> 0 inside; 0 outside) */
  depthLocal(x: number, y: number, z: number): number {
    const mn = this.mn, mx = this.mx;
    if (x < mn[0] || y < mn[1] || z < mn[2] || x > mx[0] || y > mx[1] || z > mx[2]) return 0;
    const p = this._p, r = this._r; p[0] = x; p[1] = y; p[2] = z;
    let votes = 0, d = Infinity, miss = 0;
    for (let a = 0; a < 3; a++) {
      this.ray(this.grids[a], p, r);
      if (r[0] & 1) { votes++; if (r[2] < d) d = r[2]; } else miss++;
      if (r[1] & 1) { votes++; if (r[3] < d) d = r[3]; } else miss++;
      if (miss > 2) return 0;
    }
    return votes >= 4 ? d : 0;
  }
  /** the nearest surface below a local point along -y (its y), or -Infinity */
  belowY(x: number, y: number, z: number): number {
    const p = this._p, r = this._r; p[0] = x; p[1] = y; p[2] = z;
    if (x < this.mn[0] || z < this.mn[2] || x > this.mx[0] || z > this.mx[2] || y < this.mn[1]) return -Infinity;
    this.ray(this.grids[1], p, r);
    return r[1] ? y - r[3] : -Infinity;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Solids placed in the world for one frame
// ---------------------------------------------------------------------------------------------------------------------
export interface Solid {
  /** world AABB */ mn: number[]; mx: number[];
  /** inside depth (m) at a world point, > 0 inside */
  depth(x: number, y: number, z: number): number;
}
/** a TriSolid under a world matrix (uniform scale assumed; the depth is scaled back to metres) */
export class PlacedTri implements Solid {
  mn: number[]; mx: number[]; private inv = new THREE.Matrix4(); private s = 1; private e: number[] = [];
  constructor(readonly ts: TriSolid, m: THREE.Matrix4) {
    this.inv.copy(m).invert(); this.e = this.inv.elements as unknown as number[];
    this.s = Math.cbrt(Math.abs(m.determinant())) || 1;
    // world AABB of the local box
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity], v = new THREE.Vector3();
    for (let k = 0; k < 8; k++) {
      v.set(k & 1 ? ts.mx[0] : ts.mn[0], k & 2 ? ts.mx[1] : ts.mn[1], k & 4 ? ts.mx[2] : ts.mn[2]).applyMatrix4(m);
      for (let a = 0; a < 3; a++) { const x = v.getComponent(a); if (x < mn[a]) mn[a] = x; if (x > mx[a]) mx[a] = x; }
    }
    this.mn = mn; this.mx = mx;
  }
  depth(x: number, y: number, z: number) {
    if (x < this.mn[0] || y < this.mn[1] || z < this.mn[2] || x > this.mx[0] || y > this.mx[1] || z > this.mx[2]) return 0;
    const e = this.e;
    const lx = e[0] * x + e[4] * y + e[8] * z + e[12], ly = e[1] * x + e[5] * y + e[9] * z + e[13], lz = e[2] * x + e[6] * y + e[10] * z + e[14];
    return this.ts.depthLocal(lx, ly, lz) * this.s;
  }
  /** nearest surface below a world point along world -y, when the mesh's own y is the world's y (else -Infinity) */
  belowY(x: number, y: number, z: number) {
    const e = this.e;
    if (Math.abs(e[5] * this.s - 1) > 1e-3) return -Infinity;           // (rotated about x or z: not supported)
    const lx = e[0] * x + e[4] * y + e[8] * z + e[12], ly = e[1] * x + e[5] * y + e[9] * z + e[13], lz = e[2] * x + e[6] * y + e[10] * z + e[14];
    const b = this.ts.belowY(lx, ly, lz);
    return b === -Infinity ? b : y - (ly - b) * this.s;
  }
}
/** a chain of capsules: centres c (xyz...) and radii r per ring */
export class Capsules implements Solid {
  mn: number[]; mx: number[];
  constructor(readonly c: Float32Array, readonly r: Float32Array) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < r.length; i++) for (let a = 0; a < 3; a++) { const x = c[i * 3 + a]; if (x - r[i] < mn[a]) mn[a] = x - r[i]; if (x + r[i] > mx[a]) mx[a] = x + r[i]; }
    this.mn = mn; this.mx = mx;
  }
  depth(x: number, y: number, z: number) {
    if (x < this.mn[0] || y < this.mn[1] || z < this.mn[2] || x > this.mx[0] || y > this.mx[1] || z > this.mx[2]) return 0;
    const c = this.c, r = this.r; let best = 0;
    for (let i = 0; i + 1 < r.length; i++) {
      const ax = c[i * 3], ay = c[i * 3 + 1], az = c[i * 3 + 2], bx = c[i * 3 + 3] - ax, by = c[i * 3 + 4] - ay, bz = c[i * 3 + 5] - az;
      const l2 = bx * bx + by * by + bz * bz, t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * bx + (y - ay) * by + (z - az) * bz) / l2)) : 0;
      const dx = x - ax - bx * t, dy = y - ay - by * t, dz = z - az - bz * t, rr = r[i] + (r[i + 1] - r[i]) * t;
      const d = rr - Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > best) best = d;
    }
    return best;
  }
}
export class Sphere implements Solid {
  mn: number[]; mx: number[];
  constructor(readonly cx: number, readonly cy: number, readonly cz: number, readonly r: number) {
    this.mn = [cx - r, cy - r, cz - r]; this.mx = [cx + r, cy + r, cz + r];
  }
  depth(x: number, y: number, z: number) { const d = this.r - Math.hypot(x - this.cx, y - this.cy, z - this.cz); return d > 0 ? d : 0; }
}
/** 26 directions on a ball (sample points of a sphere) */
export const BALL_DIRS: number[][] = (() => {
  const o: number[][] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) { const l = Math.hypot(x, y, z); o.push([x / l, y / l, z / l]); }
  return o;
})();
