/* The wooden puppet of 《身体里的两个人》: an artist's mannequin in three.js.
   Skeleton = CMU subject 14's proportions (scripts/puppet_bake.py), so every pose is a real actor's joint rotations.
   Light wood with grain along each limb, darker walnut ball joints, an egg head with no face, mitten hands. */
import * as THREE from 'three';
import TAKES from './puppet/takes.json';

type Takes = { fps: number; names: string[]; parents: (string | null)[]; offsets: number[][]; ends: Record<string, number[]>;
  meta: { hipsY: number; seatY: number; dur: number; sources: Record<string, string> }; poses: Record<string, number[]>; test: number[][] };
export const TK = TAKES as unknown as Takes;
export type Rig = { root: THREE.Group; bones: Record<string, THREE.Object3D>; meshes: THREE.Mesh[] };

/* ------------------------------------------------------------------ wood */
const rand = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const TEX: Record<string, THREE.CanvasTexture> = {};
/** grain runs along the texture's v axis (= along each limb on lathe geometry) */
export const woodTex = (kind: 'light' | 'dark' | 'chair' | 'floor') => {
  if (TEX[kind]) return TEX[kind];
  const W = 512, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
  const pal = { light: ['#c49c70', '#a47b52', '#d6b38a'], dark: ['#5b3a24', '#3e2616', '#7a5236'], chair: ['#5a4434', '#3d2c20', '#6e5643'], floor: ['#4a4038', '#2f2924', '#5c5249'] }[kind];
  const r = rand(kind.length * 977 + 13);
  g.fillStyle = pal[0]; g.fillRect(0, 0, W, H);
  // broad soft bands
  for (let i = 0; i < 26; i++) { const x = r() * W, w = 10 + r() * 60; const gr = g.createLinearGradient(x - w, 0, x + w, 0);
    const col = r() < 0.5 ? pal[1] : pal[2]; gr.addColorStop(0, col + '00'); gr.addColorStop(0.5, col + (r() < 0.5 ? '40' : '28')); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(x - w, 0, 2 * w, H); }
  // fine grain lines, gently wavy
  for (let i = 0; i < 220; i++) {
    let x = r() * W; const a = 0.05 + r() * 0.22, ph = r() * 6.28, amp = 1 + r() * 5, fr = 0.002 + r() * 0.006;
    g.strokeStyle = `rgba(${kind === 'dark' ? '20,10,4' : '70,40,18'},${a})`; g.lineWidth = 0.6 + r() * 1.6; g.beginPath();
    for (let y = -10; y <= H + 10; y += 8) { const xx = x + Math.sin(y * fr + ph) * amp + Math.sin(y * fr * 3.1 + ph * 2) * amp * 0.3; y < 0 ? g.moveTo(xx, y) : g.lineTo(xx, y); }
    g.stroke();
  }
  // pores
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(40,20,8,${0.05 + r() * 0.12})`; g.fillRect(r() * W, r() * H, 1, 2 + r() * 5); }
  // wear: lighter rubbed patches
  for (let i = 0; i < 10; i++) { const x = r() * W, y = r() * H, rr = 40 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,235,205,.10)'); gr.addColorStop(1, 'rgba(255,235,205,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  TEX[kind] = t; return t;
};
const MAT: Record<string, THREE.Material> = {};
export const woodMat = (kind: 'light' | 'dark' | 'chair' | 'floor', rough = 0.6) => {
  const k = kind + rough; if (MAT[k]) return MAT[k];
  const m = new THREE.MeshStandardMaterial({ map: woodTex(kind), bumpMap: woodTex(kind), bumpScale: 0.35, roughness: rough, metalness: 0 });
  MAT[k] = m; return m;
};

/* ------------------------------------------------------------------ shapes */
/** a lathe along +Y from a (radius, y) profile; closed at both ends */
const lathe = (pts: [number, number][], seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), seg);
/** a tapered limb of length L along +Y, rounded ends, slight muscle bulge */
const limbProfile = (L: number, r0: number, r1: number, bulge: number, at = 0.4): [number, number][] => {
  const pts: [number, number][] = []; const c0 = r0 * 0.55, c1 = r1 * 0.55; const N = 30;
  for (let i = 0; i <= N; i++) {
    const y = (i / N) * L; const u = y / L;
    const f = u < at ? 0.5 * u / at : 0.5 + 0.5 * (u - at) / (1 - at); // the bulge peaks at `at`
    let r = r0 + (r1 - r0) * u + bulge * Math.pow(Math.sin(Math.PI * f), 1.4);
    if (y < c0) r *= Math.sqrt(Math.max(0, 1 - ((c0 - y) / c0) ** 2));
    if (y > L - c1) r *= Math.sqrt(Math.max(0, 1 - ((y - (L - c1)) / c1) ** 2));
    pts.push([r, y]);
  }
  return pts;
};
const UP = new THREE.Vector3(0, 1, 0);
const along = (geo: THREE.BufferGeometry, dir: THREE.Vector3, start: number) => {
  const d = dir.clone().normalize(); geo.translate(0, start, 0); geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d)); return geo;
};
const ellipsoid = (rx: number, ry: number, rz: number) => { const g = new THREE.SphereGeometry(1, 40, 28); g.scale(rx, ry, rz); return g; };

/* joint ball radii */
const BALL: Record<string, number> = {
  Spine: 0.062, Neck: 0.046, LeftArm: 0.05, RightArm: 0.05, LeftForeArm: 0.04, RightForeArm: 0.04, LeftHand: 0.029, RightHand: 0.029,
  LeftUpLeg: 0.058, RightUpLeg: 0.058, LeftLeg: 0.047, RightLeg: 0.047, LeftFoot: 0.035, RightFoot: 0.035, Head: 0.026,
};
/* limbs: [bone, child, r0, r1, bulge, bulgeAt] */
const LIMBS: [string, string, number, number, number, number][] = [
  ['LeftArm', 'LeftForeArm', 0.043, 0.033, 0.008, 0.35], ['RightArm', 'RightForeArm', 0.043, 0.033, 0.008, 0.35],
  ['LeftForeArm', 'LeftHand', 0.035, 0.025, 0.007, 0.3], ['RightForeArm', 'RightHand', 0.035, 0.025, 0.007, 0.3],
  ['LeftUpLeg', 'LeftLeg', 0.068, 0.045, 0.01, 0.35], ['RightUpLeg', 'RightLeg', 0.068, 0.045, 0.01, 0.35],
  ['LeftLeg', 'LeftFoot', 0.044, 0.029, 0.012, 0.28], ['RightLeg', 'RightFoot', 0.044, 0.029, 0.012, 0.28],
  ['Neck', 'Neck1', 0.034, 0.031, 0, 0.5], ['Neck1', 'Head', 0.031, 0.029, 0, 0.5],
];
export const HEAD_TILT = -12 * Math.PI / 180; // CMU head frames sit ~15 deg nose-down at rest (see puppet_bake.py)

export const buildPuppet = (): Rig => {
  const root = new THREE.Group(); const bones: Record<string, THREE.Object3D> = {}; const meshes: THREE.Mesh[] = [];
  TK.names.forEach((n, i) => { const o = new THREE.Object3D(); o.name = n; const off = TK.offsets[i]; o.position.set(off[0], off[1], off[2]); bones[n] = o; });
  TK.names.forEach((n, i) => { const p = TK.parents[i]; (p ? bones[p] : root).add(bones[n]); });
  const light = woodMat('light', 0.58), dark = woodMat('dark', 0.45);
  const add = (bone: string, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number], rot?: THREE.Euler) => {
    const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (rot) m.rotation.copy(rot); m.castShadow = true; m.receiveShadow = true; bones[bone].add(m); meshes.push(m); return m;
  };
  const off = (n: string) => { const v = TK.offsets[TK.names.indexOf(n)]; return new THREE.Vector3(v[0], v[1], v[2]); };
  // balls
  for (const [n, r] of Object.entries(BALL)) add(n, new THREE.SphereGeometry(r, 32, 24), dark);
  // limbs
  for (const [b, c, r0, r1, bu, at] of LIMBS) {
    const d = off(c); const L = d.length(); const g0 = (BALL[b] ?? 0.03) * 0.62, g1 = (BALL[c] ?? 0.03) * 0.62;
    add(b, along(lathe(limbProfile(L - g0 - g1, r0, r1, bu, at)), d, g0), light);
  }
  // pelvis + belly (Hips / LowerBack), chest (Spine1)
  // hip block: one carved piece from the crotch up to the waist ball (widest across the hip joints)
  const hip = lathe([[0.0001, -0.165], [0.07, -0.16], [0.118, -0.13], [0.148, -0.085], [0.152, -0.045], [0.14, 0.0], [0.118, 0.05], [0.1, 0.09], [0.07, 0.112], [0.0001, 0.118]], 40);
  hip.scale(1, 1, 0.74); add('LowerBack', hip, light, [0, 0, 0.012]);
  const chest = lathe([[0, -0.118], [0.08, -0.112], [0.106, -0.075], [0.135, -0.02], [0.16, 0.025], [0.168, 0.052], [0.152, 0.074], [0.1, 0.09], [0.0001, 0.096]], 40);
  chest.scale(1, 1, 0.64); add('Spine1', chest, light, [0, 0, 0.004]);
  // egg head, tilted back on the Head frame
  const egg = lathe(Array.from({ length: 33 }, (_, i) => { const a = Math.PI * (i / 32); const y = -Math.cos(a); const r = Math.sin(a) * (1 + 0.17 * y); /* narrower toward the chin */ return [r, y] as [number, number]; }), 40);
  egg.scale(0.083, 0.126, 0.1);
  const headPivot = new THREE.Group(); headPivot.rotation.x = HEAD_TILT; bones.Head.add(headPivot);
  const eggM = new THREE.Mesh(egg, light); eggM.position.set(0, 0.05, 0.026); eggM.rotation.x = -0.34; /* chin end tipped forward: the head's facing reads without a face */ eggM.castShadow = eggM.receiveShadow = true; headPivot.add(eggM); meshes.push(eggM);
  // mitten hands (left along +X, right along -X): thickness on Y (palm normal), width on Z (thumb side +Z)
  for (const s of [1, -1]) {
    const bone = s > 0 ? 'LeftHand' : 'RightHand';
    const mit = lathe([[0.0001, 0], [0.02, 0.004], [0.026, 0.018], [0.036, 0.05], [0.042, 0.085], [0.041, 0.115], [0.034, 0.142], [0.02, 0.16], [0.0001, 0.166]], 28);
    mit.scale(0.48, 1, 1); mit.rotateZ(-s * Math.PI / 2); // +Y -> ±X; the lathe's X (now ∓Y) becomes the thin axis
    add(bone, mit, light, [s * 0.012, 0, 0]);
    const th = along(lathe(limbProfile(0.058, 0.016, 0.013, 0.002, 0.4), 16), new THREE.Vector3(s * 0.75, -0.3, 0.6), 0);
    add(bone, th, light, [s * 0.032, -0.006, 0.026]);
  }
  // feet: a flattened capsule under/ahead of the ankle (rest: toes along +Z)
  for (const s of ['Left', 'Right']) {
    const f = lathe(limbProfile(0.245, 0.038, 0.034, 0.008, 0.6), 28); f.scale(1, 1, 0.52); // thin axis = Z before turning
    f.rotateX(Math.PI / 2); // +Y -> +Z, the thin axis -> Y
    add(s + 'Foot', f, light, [0, -0.034, -0.06]);
  }
  return { root, bones, meshes };
};

const _q = new THREE.Quaternion();
/** rec = [hipsX, hipsY, hipsZ, then x,y,z,w per joint in TK.names order] */
export const applyRec = (rig: Rig, rec: number[]) => {
  rig.bones.Hips.position.set(rec[0], rec[1], rec[2]);
  TK.names.forEach((n, i) => { const k = 3 + i * 4; _q.set(rec[k], rec[k + 1], rec[k + 2], rec[k + 3]); rig.bones[n].quaternion.copy(_q); });
  // the mitten replaces the CMU finger joints: keep them neutral
  for (const n of ['LeftFingerBase', 'LeftHandIndex1', 'LThumb', 'RightFingerBase', 'RightHandIndex1', 'RThumb']) rig.bones[n].quaternion.identity();
};
/** linear-in-time sample of the baked test take (t in seconds) */
export const takeRec = (t: number) => {
  const fr = TK.test; const x = Math.max(0, Math.min(fr.length - 1, t * TK.fps)); const a = Math.floor(x), b = Math.min(fr.length - 1, a + 1), k = x - a;
  if (k < 1e-4) return fr[a];
  const A = fr[a], B = fr[b], out = A.slice();
  for (let i = 0; i < 3; i++) out[i] = A[i] + (B[i] - A[i]) * k;
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  for (let j = 3; j < A.length; j += 4) { qa.set(A[j], A[j + 1], A[j + 2], A[j + 3]); qb.set(B[j], B[j + 1], B[j + 2], B[j + 3]); qa.slerp(qb, k); out[j] = qa.x; out[j + 1] = qa.y; out[j + 2] = qa.z; out[j + 3] = qa.w; }
  return out;
};
