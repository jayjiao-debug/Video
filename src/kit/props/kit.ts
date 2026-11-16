// SHARED KIT: src/kit/props/kit.ts (KIT.md, props/README.md). Built for Hongmen; any toon film imports it from here.
// THE PROP KIT of the Hongmen film: what every held / carried / thrown thing is built from (props/things.ts,
// props/horse.ts). Rules this kit keeps (each one comes from a rejected picture; hm_notes/w_props.md):
//   - A PROP NEVER GOES THROUGH THE INK PASS. The ink pass draws a line wherever depth or the surface direction jumps:
//     a cup's rim, a sword's edge, a cord are a few pixels wide and sparkle there when the camera moves. Every prop
//     mesh is on layer NOINK and carries ITS OWN outline: a black back-face hull pushed out along welded normals
//     (Part.add(mat, geo, ink)), exactly as the rig draws its figures and what they hold. A hull is geometry: it moves
//     with the prop, has sub-pixel coverage through the multisampled colour pass and cannot pop.
//   - the hull makes every part at least 2 x ink wider: a 1.2 cm cord is a 2 cm line. Nothing is thinner than 1.2 cm.
//   - concave insides (a cup's bowl) get NO hull (a hull's back faces would cover the inside); the outside profile does.
//   - small pattern is PAINT (canvas textures with mip maps), never geometry.
//   - parts of one prop overlap by a centimetre (hidden) or stand clearly apart; no two faces nearer than 2 cm that face the same way.
//   - colours: nothing darker than #2b2630 (the ink must stay the darkest thing), nothing brighter than #f4f1ea
//     (nothing over-exposed under the sets' lights); materials are the sets' own (bt/pbr paint: lit by the place).
// Deterministic: no random numbers at all (painting uses fixed tables or hash()).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Mats } from "../../videos/bt/pbr";
import { NOINK } from "../../videos/vasa/ink";

export { NOINK };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** a fixed pseudo-random number 0..1 of an integer (for painted speckle; never Math.random) */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** the film's colours as the props use them (people.ts COL and sets/okit.ts PAL agree) */
export const C = {
  ink: "#0b0a0d",
  red: "#c8322c", redDeep: "#a82a26", lacRed: "#c23a31", lac: "#2e2a36", lacHi: "#3d3846",
  gold: "#e2b03a", bronze: "#c0903e", bronzeLo: "#8f6a2c",
  steel: "#e6ebf1", steelLo: "#bfc7d2",
  purple: "#5b2a86", purpleHi: "#7a3fa8", charcoal: "#4a4f5e",
  jade: "#62c78a", jadeLo: "#3fae6e", jadeWhite: "#eef1e4", jadeWhiteLo: "#cfd9c4",
  wood: "#9a7046", woodLo: "#6f4e32", bamboo: "#e2d2a2", bambooLo: "#bfa96f", rope: "#d8c190",
  skinPig: "#f6cdc0", meat: "#e2606a", meatLo: "#c9444f", fat: "#fdf0e8", hoof: "#6a5550",
  wine: "#e0b45a", cream: "#eadfb8",
  flame: "#f6902a", flameHi: "#ffd866", flameLo: "#c9541c",
};

// ----------------------------------------------------------------------------------------------------- painting
export type G2 = CanvasRenderingContext2D;
export const FONT = `FrSans, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
/** a painted texture (sRGB, mip-mapped): fn draws on a w x h canvas. The canvas' TOP row is v = 1. */
export const paint = (w: number, h: number, fn: (g: G2, w: number, h: number) => void, repeat = false) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  fn(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** horizontal bands for a turned thing: [v0, v1, colour] from the foot (v 0) to the top (v 1), over a base colour */
export const bandTex = (base: string, bands: [number, number, string][], extra?: (g: G2, w: number, h: number) => void) =>
  paint(64, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (const [v0, v1, col] of bands) { g.fillStyle = col; g.fillRect(0, h * (1 - v1), w, h * (v1 - v0)); }
    extra?.(g, w, h);
  }, true);

// ----------------------------------------------------------------------------------------------------- materials
export type Kit = ReturnType<typeof makeKit>;
export const makeKit = (M: Mats) => {
  const cache = new Map<string, THREE.Material>();
  /** a flat toon surface lit by the place (the sets' paint material; the daylight fill is turned down so that a prop
   *  in the tent is not brighter than the tent's own ware) */
  const flat = (color: string, o: { map?: THREE.Texture | null; rough?: number; side?: THREE.Side } = {}): THREE.Material => {
    const key = o.map ? "" : `${color}|${o.rough ?? 0.7}|${o.side ?? 0}`, got = key ? cache.get(key) : undefined;
    if (got) return got;
    const m = M.paint({ color, map: o.map ?? null, roughness: o.rough ?? 0.7, specular: 0.25, envMapIntensity: 0.55, side: o.side ?? THREE.FrontSide });
    if (key) cache.set(key, m);
    return m;
  };
  /** unlit (flames) */
  const glow = (color: string) => new THREE.MeshBasicMaterial({ color });
  /** the outline: back faces of a pushed-out hull */
  const ink = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
  const hullOf = (color: string) => new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  return { M, flat, glow, ink, hullOf };
};

// ----------------------------------------------------------------------------------------------------- geometry
export const M4 = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s: number | [number, number, number] = 1) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), typeof s === "number" ? V(s, s, s) : V(s[0], s[1], s[2]));
/** a turned shape: the profile [radius, height] swept round y. The profile is resampled to `n` points evenly along
 *  its length, so the texture's v is the fraction of the profile's LENGTH (0 = its first point). n 0 = as given. */
export const turned = (pts: [number, number][], seg = 24, n = 0) => {
  let v = pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y));
  if (n > 0) {
    const len = [0]; for (let i = 1; i < v.length; i++) len.push(len[i - 1] + v[i].distanceTo(v[i - 1]));
    const out: THREE.Vector2[] = [], L = len[len.length - 1];
    for (let k = 0; k < n; k++) { const s = (L * k) / (n - 1); let i = 1; while (i < v.length - 1 && len[i] < s) i++; const u = clamp((s - len[i - 1]) / Math.max(len[i] - len[i - 1], 1e-9)); out.push(v[i - 1].clone().lerp(v[i], u)); }
    v = out;
  }
  return new THREE.LatheGeometry(v, seg);
};
/** the fraction of a profile's length at each of its points (for bandTex) */
export const lenAt = (pts: [number, number][]) => {
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return len.map((l) => l / len[len.length - 1]);
};
const _up = V(0, 1, 0), _q = new THREE.Quaternion();
/** a round bar from a to b (radius ra at a, rb at b), closed */
export const limb = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra, seg = 12) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  g.applyQuaternion(_q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** a ball (scaled) at p */
export const ball = (p: THREE.Vector3, r: number, s: [number, number, number] = [1, 1, 1], seg = 14) => new THREE.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.7))).scale(s[0], s[1], s[2]).translate(p.x, p.y, p.z);
export const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
/** a blade / slat: a four-sided (diamond) section along y. rows: [y, half width (x), half thickness (z)] */
export const prism = (rows: [number, number, number][]) => {
  const pos: number[] = [], tri = (a: number[], b: number[], c: number[]) => pos.push(...a, ...b, ...c);
  const ring = ([y, w, t]: [number, number, number]) => [[w, y, 0], [0, y, t], [-w, y, 0], [0, y, -t]];
  for (let k = 0; k < rows.length - 1; k++) {
    const A = ring(rows[k]), B = ring(rows[k + 1]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri(A[i], B[i], B[j]); tri(A[i], B[j], A[j]); }
  }
  const A = ring(rows[0]), Z = ring(rows[rows.length - 1]);
  tri(A[0], A[1], A[2]); tri(A[0], A[2], A[3]); tri(Z[0], Z[2], Z[1]); tri(Z[0], Z[3], Z[2]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
};
/** part of a ring: the closed section `loop` ([radius, height] points, counter-clockwise seen with the axis on the
 *  left) swept round y from angle a0 over `sweep` (rad), with flat end caps. sweep 2 PI = a whole ring. */
export const ringSeg = (loop: [number, number][], a0: number, sweep: number, seg = 40) => {
  const n = loop.length, pos: number[] = [], idx: number[] = [], whole = sweep >= Math.PI * 2 - 1e-6;
  for (let i = 0; i <= seg; i++) { const a = a0 + (sweep * i) / seg, s = Math.sin(a), c = Math.cos(a); for (const [r, y] of loop) pos.push(r * s, y, r * c); }
  for (let i = 0; i < seg; i++) for (let k = 0; k < n; k++) { const A = i * n + k, B = i * n + ((k + 1) % n), Cc = A + n, D = B + n; idx.push(A, Cc, B, B, Cc, D); }
  if (!whole) for (const [i, flip] of [[0, false], [seg, true]] as [number, boolean][]) {
    const base = pos.length / 3, a = a0 + (sweep * i) / seg, s = Math.sin(a), c = Math.cos(a);
    let mr = 0, my = 0; for (const [r, y] of loop) { mr += r / n; my += y / n; pos.push(r * s, y, r * c); }
    pos.push(mr * s, my, mr * c);
    for (let k = 0; k < n; k++) { const A = base + k, B = base + ((k + 1) % n), O = base + n; if (flip) idx.push(O, B, A); else idx.push(O, A, B); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** a rounded rectangle as a closed [radius, height] loop for ringSeg: r0..r1 wide, t thick, corner radius c */
export const roundLoop = (r0: number, r1: number, t: number, c: number, k = 3): [number, number][] => {
  const out: [number, number][] = [], corner = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= k; i++) { const a = a0 + (Math.PI / 2) * (i / k); out.push([cx + c * Math.cos(a), cy + c * Math.sin(a)]); } };
  // counter-clockwise in the (radius, height) plane swept as ringSeg does gives outward faces
  corner(r1 - c, t / 2 - c, 0); corner(r0 + c, t / 2 - c, Math.PI / 2); corner(r0 + c, -t / 2 + c, Math.PI); corner(r1 - c, -t / 2 + c, Math.PI * 1.5);
  return out;
};
/** a flat sheet in the xy plane (facing +z): nx x ny cells, w wide (x 0..w), h high (y -h..0), uv 0..1 (v 1 at the top) */
export const sheet = (w: number, h: number, nx: number, ny: number) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { pos.push((w * i) / nx, (-h * j) / ny, 0); uv.push(i / nx, 1 - j / ny); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const A = j * (nx + 1) + i, B = A + 1, Cc = A + nx + 1, D = Cc + 1; idx.push(A, Cc, B, B, Cc, D); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};

/** the geometry pushed out by t along ONE normal per position (the mean of the faces that meet there): a closed hull
 *  over hard edges and seams. Position only. */
export const hullGeo = (g: THREE.BufferGeometry, t: number) => {
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 2e4)},${Math.round(P.getY(i) * 2e4)},${Math.round(P.getZ(i) * 2e4)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  const out = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = P.getX(i) + (a[0] / l) * t; out[i * 3 + 1] = P.getY(i) + (a[1] / l) * t; out[i * 3 + 2] = P.getZ(i) + (a[2] / l) * t; }
  const h = new THREE.BufferGeometry(); h.setAttribute("position", new THREE.BufferAttribute(out, 3));
  return h;
};

/** the pieces of one rigid part of a prop, merged per material into one mesh each + ONE hull mesh, all on NOINK */
export class Part {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private hulls = new Map<THREE.Material, THREE.BufferGeometry[]>();
  tris = 0;
  constructor(private K: Kit) {}
  /** adds a piece. ink = the outline's width in m (0 = none: insides, decals, things drawn on a surface);
   *  m = where it goes; hull = another outline material than the black ink (flames) */
  add(mat: THREE.Material, g: THREE.BufferGeometry, ink = 0.006, m?: THREE.Matrix4, hull?: THREE.Material) {
    const q = g.index ? g.toNonIndexed() : g.clone();
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") q.deleteAttribute(k);
    if (!q.attributes.normal) q.computeVertexNormals();
    if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2));
    if (m) q.applyMatrix4(m);
    q.clearGroups(); q.morphAttributes = {};
    let l = this.map.get(mat); if (!l) this.map.set(mat, (l = []));
    l.push(q);
    if (ink > 0) { const hm = hull ?? this.K.ink; let hl = this.hulls.get(hm); if (!hl) this.hulls.set(hm, (hl = [])); hl.push(hullGeo(q, ink)); }
    return this;
  }
  /** adds the pieces of ONE closed shell that has several materials (a shield's face, rim and back; a roll and its
   *  two ends): the outline is ONE hull welded over all of them, so it stays closed along the edges where they meet */
  shell(pieces: [THREE.Material, THREE.BufferGeometry][], ink = 0.006, m?: THREE.Matrix4) {
    const qs: THREE.BufferGeometry[] = [];
    for (const [mat, g] of pieces) {
      this.add(mat, g, 0, m);
      const l = this.map.get(mat)!, q = l[l.length - 1], h = new THREE.BufferGeometry();
      h.setAttribute("position", q.attributes.position.clone()); h.setAttribute("normal", q.attributes.normal.clone());
      qs.push(h);
    }
    let hl = this.hulls.get(this.K.ink); if (!hl) this.hulls.set(this.K.ink, (hl = []));
    hl.push(hullGeo(mergeGeometries(qs, false), ink));
    return this;
  }
  /** builds the meshes into `into` */
  into<T extends THREE.Object3D>(into: T, name: string, o: { cast?: boolean; receive?: boolean } = {}): T {
    for (const [mat, list] of this.map) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = o.cast ?? true; m.receiveShadow = o.receive ?? true; m.name = name; m.layers.set(NOINK);
      this.tris += m.geometry.attributes.position.count / 3; into.add(m);
    }
    for (const [mat, list] of this.hulls) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = m.receiveShadow = false; m.name = name + ".ink"; m.layers.set(NOINK);
      this.tris += m.geometry.attributes.position.count / 3; into.add(m);
    }
    this.map.clear(); this.hulls.clear();
    return into;
  }
}
