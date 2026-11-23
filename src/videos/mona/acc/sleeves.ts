// SLEEVES of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026): her full mustard sleeves, gathered in fine folds, in 3D round the
// kit's thin arms from the shoulder to the wrist (the hand stays the kit's ball hand, in her skin). The sleeve builder
// is a COPY of the shared kit's (src/kit/acc/armour.ts limbSleeve, which is not exported): rebuilt from the arm every
// frame, a pure function of the pose.
//   monaSleeves(o)   col = the cloth, deep = its folds' shade, light = their lights, thick = the upper arm's radius (m)
import * as THREE from "three";
import type { Acc, PartKit } from "../../group/kit/rig3d";
import { dimsOf } from "../../group/kit/toon";
import { shade } from "../../group/kit/rigacc/shapes";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const standHip = (b: PartKit) => { const D = dimsOf(b.look), ys = clamp((D.H.b / D.H.a) * 0.95, 0.85, 0.97); return 1.45 - b.R * ys - b.headY; };
const everyFrame = (o: THREE.Object3D, fn: () => void) => {
  const base = o.updateMatrixWorld;
  o.updateMatrixWorld = function (force?: boolean) { fn(); base.call(o, force); };
};
const RING = 14, LIMB_RINGS = 33;
const limbsOf = (root: THREE.Object3D): THREE.BufferGeometry[] | null => {
  const U = root.userData;
  let t = U.monaTubes as THREE.BufferGeometry[] | undefined;
  if (!t) {
    const seen: THREE.BufferGeometry[] = [];
    for (const c of root.children) { const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (g && g.attributes && g.attributes.tangent3 && !seen.includes(g)) seen.push(g); }
    if (seen.length < 4) return null;
    t = U.monaTubes = seen.slice(0, 4);
  }
  return t;
};
const ringMid = (g: THREE.BufferGeometry, i: number, out: THREE.Vector3) => {
  const P = g.attributes.position.array as Float32Array;
  let x = 0, y = 0, z = 0;
  for (let j = 0, q = i * RING * 3; j < RING; j++, q += 3) { x += P[q]; y += P[q + 1]; z += P[q + 2]; }
  return out.set(x / RING, y / RING, z / RING);
};
const limbSleeve = (b: PartKit, o: { limb: number; i0: number; i1: number; rad: (u: number, k: number) => number; map: THREE.Texture; paint?: "prop" | "cloth"; ink?: number; standing?: boolean; ball?: number; ballCol?: string }) => {
  const M = 12, n = o.i1 - o.i0 + 1, NR = n + 2, pos = new Float32Array(NR * (M + 1) * 3), nor = new Float32Array(NR * (M + 1) * 3), uv = new Float32Array(NR * (M + 1) * 2), idx: number[] = [];
  for (let i = 0; i < NR; i++) for (let j = 0; j <= M; j++) { uv[(i * (M + 1) + j) * 2] = j / M; uv[(i * (M + 1) + j) * 2 + 1] = 1 - clamp((i - 1) / (n - 1), 0, 1); }
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < M; j++) { const A = i * (M + 1) + j, B = A + 1, C = A + M + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  geo.userData.hull = () => geo;
  const mesh = b.solid("body", geo, { map: o.map, paint: o.paint ?? "prop", ink: o.ink ?? 0.0075 });
  const torso = mesh.parent!, root = torso.parent!;
  root.add(mesh); mesh.frustumCulled = false;
  const ball = o.ball ? b.solid("body", new THREE.SphereGeometry(o.ball, 18, 12), { col: o.ballCol ?? "#3a3340", ink: 0.007 }) : null;
  if (ball) { root.add(ball); ball.frustumCulled = false; }
  const hip0 = standHip(b), C = Array.from({ length: n }, () => new THREE.Vector3()), T = new THREE.Vector3(), N = new THREE.Vector3(), Bn = new THREE.Vector3();
  let last = NaN;
  const refresh = () => {
    // an arm the rig draws in front of the figure's own head this frame (RigState.armFront): its sleeve goes with it
    // (the rig puts every body part back under the head on each update, and frees the front arm's own materials)
    const am = root.userData.monaArmMats as THREE.Material[][] | undefined;
    if (am && am[o.limb] && am[o.limb][0].stencilFunc === THREE.AlwaysStencilFunc) mesh.traverse((q) => { const mm = (q as THREE.Mesh).material as THREE.Material | undefined; if (mm && !Array.isArray(mm)) mm.stencilFunc = THREE.AlwaysStencilFunc; });
    const limbs = root.visible ? limbsOf(root) : null;
    if (!limbs || limbs[o.limb].attributes.position.count < LIMB_RINGS * RING) return;
    let sig = 0;
    for (let k = 0; k < n; k++) { ringMid(limbs[o.limb], o.i0 + k, C[k]); sig += C[k].x * (1.3 + 0.07 * k) + C[k].y * (2.1 + 0.05 * k) + C[k].z * (3.3 + 0.03 * k); }
    const e = torso.matrix.elements, ground = typeof root.userData.hmGround === "number" ? (root.userData.hmGround as number) : 0;
    const stand = o.standing ? smooth((e[13] - ground - 0.5 * hip0) / (0.3 * hip0)) : 1;
    sig += stand * 17.7 + e[8] * 0.9 + e[10] * 1.9;
    if (ball) ringMid(limbs[o.limb], LIMB_RINGS - 1, ball.position);
    if (sig === last) return;
    last = sig;
    // the first ring's normal: the body's front, kept square to the limb; then carried along it
    N.set(e[8], e[9], e[10]);
    for (let i = 0; i < NR; i++) {
      const k = clamp(i - 1, 0, n - 1), cap = i === 0 ? -1 : i === NR - 1 ? 1 : 0;
      T.copy(C[Math.min(k + 1, n - 1)]).sub(C[Math.max(k - 1, 0)]);
      if (T.lengthSq() < 1e-12) T.set(0, -1, 0); else T.normalize();
      N.addScaledVector(T, -N.dot(T));
      if (N.lengthSq() < 1e-8) { N.set(1, 0, 0).addScaledVector(T, -T.x); if (N.lengthSq() < 1e-6) N.set(0, 0, 1).addScaledVector(T, -T.z); }
      N.normalize(); Bn.crossVectors(T, N);
      const r = cap ? 0.0015 : o.rad(k / (n - 1), stand);
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), q = (i * (M + 1) + j) * 3;
        const nx = N.x * cs + Bn.x * sn, ny = N.y * cs + Bn.y * sn, nz = N.z * cs + Bn.z * sn;
        pos[q] = C[k].x + nx * r; pos[q + 1] = C[k].y + ny * r; pos[q + 2] = C[k].z + nz * r;
        if (cap) { nor[q] = T.x * cap; nor[q + 1] = T.y * cap; nor[q + 2] = T.z * cap; } else { nor[q] = nx; nor[q + 1] = ny; nor[q + 2] = nz; }
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
  };
  everyFrame(mesh, refresh);
  return mesh;
};

export type MonaSleevesO = { col?: string; deep?: string; light?: string; thick?: number; /** the hand: its colour (her skin) and its size as a multiple of the kit's ball hand; false = the kit's own hand */ hand?: string | false; handK?: number };
export const monaSleeves = (o: MonaSleevesO = {}): Acc => {
  const col = o.col ?? "#b8873a", deep = o.deep ?? shade(col, 0.62), light = o.light ?? shade(col, 1.28), thick = o.thick ?? 0.046, hand = o.hand ?? false, handK = o.handK ?? 1.32;
  const key = ["monaSleeves4", col, deep, light, thick, hand, handK].join("|");
  return {
    name: "monaSleeves", slots: [], key,
    build(b) {
      // (u round the arm, v = 1 at the shoulder .. 0 at the wrist): the cloth gathered in many fine rings of folds
      const map = b.tex(128, 512, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 128, 512);
        for (let i = 0; i < 21; i++) {
          const y = 16 + i * 23.4 + 7 * Math.sin(i * 2.4), ph = i * 1.9;
          g.globalAlpha = thick < 0.02 ? 0.85 : 0.55; g.lineWidth = thick < 0.02 ? 4.5 : 3; g.strokeStyle = deep; g.beginPath();
          for (let x = 0; x <= 128; x += 8) { const yy = y + 3.2 * Math.sin((x / 128) * Math.PI * 2 + ph); if (x) g.lineTo(x, yy); else g.moveTo(x, yy); }
          g.stroke();
          g.globalAlpha = thick < 0.02 ? 0.75 : 0.5; g.lineWidth = thick < 0.02 ? 3.4 : 2.4; g.strokeStyle = light; g.beginPath();
          for (let x = 0; x <= 128; x += 8) { const yy = y + 6.4 + 3.2 * Math.sin((x / 128) * Math.PI * 2 + ph); if (x) g.lineTo(x, yy); else g.moveTo(x, yy); }
          g.stroke();
        }
        // the wrist: a narrow dark edge
        g.globalAlpha = 1; g.fillStyle = deep; g.fillRect(0, 502, 128, 10);
      }, key);
      // full at the upper arm, a little in at the elbow, full again on the forearm, drawn in to the wrist
      // (stick: the kit's own thin arm, the same thickness all the way, only dressed in her cloth)
      const full = (u: number) => u < 0.12 ? lerp(thick * 0.8, thick, u / 0.12) : u < 0.45 ? lerp(thick, thick * 0.9, (u - 0.12) / 0.33) : u < 0.8 ? lerp(thick * 0.9, thick * 0.84, (u - 0.45) / 0.35) : lerp(thick * 0.84, thick * 0.52, smooth((u - 0.8) / 0.2));
      const stick = thick < 0.02, rad = stick ? () => thick : full;
      for (let i = 0; i < 2; i++) limbSleeve(b, { limb: i, i0: 1, i1: stick ? 31 : 30, rad, map, paint: "cloth", ink: stick ? Math.min(0.0062, thick * 0.46) : 0.0072, ball: hand ? b.handR * handK : 0, ballCol: hand || undefined });
    },
  };
};
