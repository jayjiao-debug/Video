// SWAYING STRANDS (WP2 sets): reed blades, grass tufts, willow strands as one NOINK vertex-coloured mesh per field,
// bent each frame by a pure function of t. Used by sets/night.ts and sets/road.ts.
import * as THREE from "three";
import { NOINK } from "./common";
import type { maker } from "./common";

/** A FIELD OF STRANDS (reed blades, cattail stems, grass tufts, willow strands) as one NOINK, double-sided,
 *  vertex-coloured mesh. Each strand is a tapered ribbon from its root (k = 0) to its tip (k = 1); update(t, wind)
 *  bends every strand by a pure function of t (its own phase), the tips most. */
export type Strand = { root: THREE.Vector3; tip: THREE.Vector3; w: number; c0: string; c1: string; ph: number; amp: number; seg?: number; face?: number };
export const strandField = (Mk: ReturnType<typeof maker>, list: Strand[], name: string) => {
  const pos: number[] = [], col: number[] = [], base: number[] = [], kk: number[] = [], ph: number[] = [], am: number[] = [], idx: number[] = [];
  const c = new THREE.Color();
  for (const s of list) {
    const n = s.seg ?? 3, d = s.tip.clone().sub(s.root), f = s.face ?? 0, side = new THREE.Vector3(Math.cos(f), 0, -Math.sin(f));
    const v0 = pos.length / 3;
    for (let i = 0; i <= n; i++) {
      const k = i / n, w = s.w * (1 - k) + 0.002, p = s.root.clone().addScaledVector(d, k);
      c.set(s.c0).lerp(new THREE.Color(s.c1), k);
      for (const sg of [-1, 1]) {
        const q = p.clone().addScaledVector(side, (sg * w) / 2);
        pos.push(q.x, q.y, q.z); base.push(q.x, q.y, q.z); col.push(c.r, c.g, c.b); kk.push(k); ph.push(s.ph); am.push(s.amp);
      }
      if (i < n) { const a = v0 + i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
  g.computeVertexNormals();
  const m = Mk.own("#ffffff", { side: THREE.DoubleSide, rough: 0.9 }); m.vertexColors = true;
  const mesh = new THREE.Mesh(g, m); mesh.name = name; mesh.layers.set(NOINK); mesh.castShadow = false; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const P = g.attributes.position as THREE.BufferAttribute;
  const update = (t: number, wind: number) => {
    for (let i = 0; i < P.count; i++) {
      const k = kk[i], b = k * k * am[i] * wind, p = ph[i];
      const sx = Math.sin(t * 1.3 + p) + 0.4 * Math.sin(t * 2.9 + p * 1.7), sz = Math.sin(t * 1.1 + p * 0.7 + 1.3);
      P.setXYZ(i, base[i * 3] + b * sx, base[i * 3 + 1] - 0.02 * b * Math.abs(sx), base[i * 3 + 2] + 0.5 * b * sz);
    }
    P.needsUpdate = true;
  };
  return { mesh, update };
};

