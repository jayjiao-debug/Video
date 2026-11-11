// 《石中剑》 props: the stone, the anvil on it and THE sword (BIBLE.md, "The sword and the pull").
//   const S = buildStone(M); scene.add(S.group, S.sword);
//   S.setStuck(k, wobble)        the sword in the anvil (k 0 = stuck .. 1 = the point just clear of the anvil's face)
//   S.setFree(p, up, face)       the sword anywhere: grip centre at p, pommel along up, the flat toward face
//   S.grip(k), S.tip()           where to pin a hand / where the point is
//   S.setSeason(0..3), S.setGlow(a) (the gold letters), S.setShine(a) (the blade)
// The sword's meshes are on layer NOINK with their own ink hull (see SWORD_INK): the camera must see that layer, as
// it does for the rig figures.
// Metres, y up, the block centred on the origin with its bottom on the ground; the camera is on +z. Everything is
// static geometry built once from a seeded RNG (no Math.random / Date): nothing here changes with time.
// Layout (world, when the group sits at the origin):
//   block    x -0.75 .. 0.75, y 0 .. 0.36, z -0.5 .. 0.5, edges rounded 2.5 cm, the top flat
//   letters  on the +z face: row 1 "拔出此剑者", row 2 "即为英格兰之王", characters 0.11 m, gold with a dark carved edge
//   anvil    y 0.36 .. 0.56: foot x -0.11 .. 0.10, face (heel) x -0.17 .. 0.10, horn to x 0.25; 0.16 deep; slot at (0, 0.56, 0)
//   sword    local frame: origin = the grip's centre, +y = toward the pommel, the guard along x, flats toward +-z:
//            point y -0.71, blade's shoulder -0.09, guard -0.09 .. -0.06 (0.24 wide), grip -0.06 .. 0.06, pommel 0.06 .. 0.15
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Mats } from "../bt/pbr";
import { FONT_STACK } from "../group/kit/phone";
import { NOINK } from "../vasa/ink";

/** the numbers of what is built (metres, in the group's frame; the sword's are for the stuck pose).
 *  Where the kit rig (1.45 m, arms 0.40 m) can stand ON the stone and really hold the grip (measured in
 *  preview/props_reach.ts, hands pinned at grip(k) -+ 0.018 along the grip). The rig turns its torso toward the
 *  camera, so reach / clear change with the camera: these points hold (reach 0, clear >= -0.012) from cameras within
 *  about 25 degrees of straight on; check rig.qa from the shot's own camera when it is further round.
 *    standR / standL  the two-handed pull, pose haul (amount up to 0.85: the lean takes the shoulders 0.2 m back, so
 *                     the feet are close and straddle the anvil): at standR facing -PI/2 with state.twist = twistR,
 *                     at standL facing +PI/2 with twist = twistL. Both stand BEHIND the sword's plane (z -0.1): the
 *                     whole sword is in front of the figure, its face shows, and the cross-guard stays out of its belly.
 *    drawR / drawL    the one-handed draw, pose idle (upright), grip(0) .. grip(1): drawR facing -PI/2 with arm 0,
 *                     drawL facing +PI/2 with arm 1 (the far arm in both cases; no twist). Holds to 50 degrees round.
 *    standBack        behind the sword facing the camera (facing 0), pose idle, both hands on the grip */
export const STONE = {
  size: [1.5, 0.36, 1.0], top: 0.36, anvilTop: 0.56, gripY: 1.01, guardY: 0.935, pommelY: 1.16, insert: 0.26,
  swordLen: 0.86, bladeLen: 0.62,
  standL: [-0.06, 0.36, -0.1], standR: [0.06, 0.36, -0.1], twistL: 0.5, twistR: -0.5,
  drawL: [-0.22, 0.36, 0], drawR: [0.22, 0.36, 0], standBack: [0, 0.36, -0.22],
} as const;

export type StoneRig = {
  /** stone + anvil + inscription + season dressing (NOT the sword) */
  group: THREE.Group;
  /** THE sword (add both group and sword to the scene; the rig keeps the sword's matrix) */
  sword: THREE.Group;
  /** the sword in the anvil. k = 0: fully in (the stuck pose) .. 1: drawn straight up until the point is just clear
   *  of the anvil's face. wobble = a small lean in radians about the slot (a failed tug makes it quiver), default 0 */
  setStuck(k?: number, wobble?: number): void;
  /** the sword anywhere: the grip's centre at p, the pommel pointing along up (need not be normalised), the flat's
   *  normal toward face (default: toward +z; made perpendicular to up) */
  setFree(p: THREE.Vector3, up: THREE.Vector3, face?: THREE.Vector3): void;
  /** world position of the grip's centre in the stuck pose at draw k (to pin a figure's hands): a new Vector3.
   *  wobble (optional) = the same lean as setStuck's, so pinned hands can follow a quivering grip */
  grip(k?: number, wobble?: number): THREE.Vector3;
  /** world position of the sword's point right now */
  tip(): THREE.Vector3;
  setSeason(k: 0 | 1 | 2 | 3): void;
  /** the gold letters: 0 = plain gilding, 1 = glowing (emissive above 1 so the film's bloom catches it) */
  setGlow(a: number): void;
  /** the blade: 0 = plain steel, 1 = a bright glint (emissive) for the moment it comes out */
  setShine(a: number): void;
  /** the block and the anvil as boxes */
  colliders: { min: [number, number, number]; max: [number, number, number]; name: string }[];
};

// ---------------- small helpers ----------------
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** mulberry32 (as group/story.ts rng): rng(seed)() -> 0..1 */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
/** smooth seeded 1D noise, 0..1, period n cells (wraps: good for closed loops) */
const noise1 = (seed: number, n: number) => {
  const R = rng(seed), g = Array.from({ length: n }, () => R());
  return (x: number) => { const f = ((x % n) + n) % n, i = Math.floor(f), t = smooth(f - i); return g[i % n] + (g[(i + 1) % n] - g[i % n]) * t; };
};
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = false) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => {
  const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; o.name = name; return o;
};

/** a skin over rings of points (all rings the same length): smooth across rings and round them; give a ring twice
 *  for a hard edge. closed = each ring is a loop; caps = flat fans over the first / last ring. */
function loft(rings: THREE.Vector3[][], o: { closed?: boolean; capStart?: boolean; capEnd?: boolean; flip?: boolean; uv?: (ring: number, i: number) => [number, number] } = {}) {
  const closed = o.closed ?? true, n = rings[0].length, pos: number[] = [], uv: number[] = [];
  let idx: number[] = [];
  const cols = closed ? n + 1 : n; // a seam column so that uvs can wrap
  rings.forEach((r, k) => { for (let i = 0; i < cols; i++) { const p = r[i % n]; pos.push(p.x, p.y, p.z); const q = o.uv ? o.uv(k, i) : [i / (cols - 1), k / Math.max(1, rings.length - 1)]; uv.push(q[0], q[1]); } });
  const tri = (a: number, b: number, c: number) => (o.flip ? idx.push(a, c, b) : idx.push(a, b, c));
  const P = (i: number) => V(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  for (let k = 0; k + 1 < rings.length; k++) for (let i = 0; i + 1 < cols; i++) {
    const a = k * cols + i, b = a + 1, c = a + cols, d = c + 1;
    tri(a, c, b); tri(b, c, d);
  }
  const cap = (k: number, rev: boolean) => {
    const r = rings[k], c = r.reduce((s, p) => s.add(p), V()).multiplyScalar(1 / n), base = pos.length / 3;
    pos.push(c.x, c.y, c.z); uv.push(0.5, 0.5);
    for (const p of r) { pos.push(p.x, p.y, p.z); uv.push(0.5, 0.5); }
    for (let i = 0; i < n; i++) { const a = base + 1 + i, b = base + 1 + ((i + 1) % n); if (rev) tri(base, b, a); else tri(base, a, b); }
  };
  if (o.capStart) cap(0, false);
  if (o.capEnd) cap(rings.length - 1, true);
  if (closed && o.flip === undefined) {   // loops: face outward whichever way the rings run (signed volume about the centroid)
    const c = V(); for (let i = 0; i < pos.length / 3; i++) c.add(P(i)); c.multiplyScalar(3 / pos.length);
    let vol = 0; for (let t = 0; t < idx.length; t += 3) vol += P(idx[t]).sub(c).dot(P(idx[t + 1]).sub(c).cross(P(idx[t + 2]).sub(c)));
    if (vol < 0) { const f: number[] = []; for (let t = 0; t < idx.length; t += 3) f.push(idx[t], idx[t + 2], idx[t + 1]); idx = f; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  weldNormals(g);
  return g;
}
/** vertex normals averaged over every vertex at the same place (so seams and doubled rings of the same smooth
 *  surface shade as one), except across a `hard` angle (deg): a triangle only takes neighbours within that angle */
function weldNormals(g: THREE.BufferGeometry, hard = 50) {
  const P = g.getAttribute("position") as THREE.BufferAttribute, I = g.getIndex();
  const nT = (I ? I.count : P.count) / 3, vi = (t: number, c: number) => (I ? I.getX(t * 3 + c) : t * 3 + c);
  const key = (i: number) => `${Math.round(P.getX(i) * 20000)},${Math.round(P.getY(i) * 20000)},${Math.round(P.getZ(i) * 20000)}`;
  const fn: THREE.Vector3[] = [], at = new Map<string, number[]>(), a = V(), b = V(), c = V();
  for (let t = 0; t < nT; t++) {
    a.fromBufferAttribute(P, vi(t, 0)); b.fromBufferAttribute(P, vi(t, 1)); c.fromBufferAttribute(P, vi(t, 2));
    const n = b.clone().sub(a).cross(c.clone().sub(a)); fn.push(n); // length = 2 x area: area weighting
    if (n.lengthSq() < 1e-16) continue;
    for (let k = 0; k < 3; k++) { const q = key(vi(t, k)); let l = at.get(q); if (!l) at.set(q, (l = [])); l.push(t); }
  }
  const N = new Float32Array(P.count * 3), cnt = new Uint8Array(P.count), cosH = hard >= 180 ? -2 : Math.cos((hard * Math.PI) / 180), s = V(), u = V(), w = V();
  for (let t = 0; t < nT; t++) {
    if (fn[t].lengthSq() < 1e-16) continue;
    u.copy(fn[t]).normalize();
    for (let k = 0; k < 3; k++) {
      const i = vi(t, k); s.set(0, 0, 0);
      for (const t2 of at.get(key(i))!) { w.copy(fn[t2]).normalize(); if (w.dot(u) >= cosH) s.add(fn[t2]); }
      s.normalize(); N[i * 3] += s.x; N[i * 3 + 1] += s.y; N[i * 3 + 2] += s.z; cnt[i]++;
    }
  }
  for (let i = 0; i < P.count; i++) { s.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]); if (cnt[i]) s.normalize(); else s.set(0, 1, 0); N[i * 3] = s.x; N[i * 3 + 1] = s.y; N[i * 3 + 2] = s.z; }
  g.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  return g;
}
const tris = (o: THREE.Object3D) => { let n = 0; o.traverse((m) => { const g = (m as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if ((m as THREE.Mesh).isMesh && g) n += (g.getIndex() ? g.getIndex()!.count : g.getAttribute("position").count) / 3; }); return Math.round(n); };

// ---------------- the block ----------------
const SX = 1.5, SY = 0.36, SZ = 1.0, HX = SX / 2, HZ = SZ / 2, BEV = 0.025;
/** the inscription texture: 2048 px across the 1.5 m face; the face's 0.36 m takes the top FACE_PX rows of 512 */
const PPM = 2048 / SX, FACE_PX = SY * PPM;
/** shallow chips knocked out of the edges: centre (on an edge or corner), radius, depth */
const CHIPS: { c: [number, number, number]; R: number; d: number }[] = [
  { c: [-0.56, SY, HZ], R: 0.075, d: 0.02 }, { c: [0.63, SY, HZ], R: 0.06, d: 0.016 },
  { c: [HX, SY, 0.22], R: 0.07, d: 0.018 }, { c: [-HX, SY, -0.1], R: 0.065, d: 0.016 }, { c: [-HX, SY, HZ], R: 0.085, d: 0.022 },
  { c: [HX, 0.15, HZ], R: 0.07, d: 0.016 }, { c: [0.2, SY, -HZ], R: 0.08, d: 0.02 }, { c: [-HX, 0.22, -HZ], R: 0.07, d: 0.016 },
];
function blockGeo() {
  const r = BEV, TAN = [Math.tan(Math.PI / 8), 1];           // two bevel steps: 22.5 and 45 degrees
  const breaks = (a: number, b: number, step: number, roundA: boolean, extra: number[]) => {
    const lo = roundA ? a + r : a, hi = b - r, pts: number[] = [];
    if (roundA) for (const t of TAN) pts.push(lo - r * t);
    const n = Math.max(1, Math.round((hi - lo) / step));
    for (let i = 0; i <= n; i++) pts.push(lo + ((hi - lo) * i) / n);
    for (const t of TAN) pts.push(hi + r * t);
    for (const e of extra) if (e > lo + 0.012 && e < hi - 0.012 && pts.every((p) => Math.abs(p - e) > 0.018)) pts.push(e);
    return pts.sort((p, q) => p - q);
  };
  const near = (axis: 0 | 1 | 2) => CHIPS.flatMap((ch) => [-1, -0.5, 0, 0.5, 1].map((k) => ch.c[axis] + k * ch.R));
  const bx = breaks(-HX, HX, 0.09, true, near(0)), bz = breaks(-HZ, HZ, 0.09, true, near(2)), by = breaks(0, SY, 0.09, false, near(1));
  const inner = (p: THREE.Vector3) => V(Math.max(-HX + r, Math.min(HX - r, p.x)), Math.min(SY - r, p.y), Math.max(-HZ + r, Math.min(HZ - r, p.z)));
  type Face = { us: number[]; vs: number[]; at: (u: number, v: number) => THREE.Vector3; uv: (p: THREE.Vector3) => [number, number]; flip: boolean };
  const T = 1.5; // metres per tile of the marble texture
  const faces: Record<string, Face> = {
    front: { us: bx, vs: by, at: (u, v) => V(u, v, HZ), uv: (p) => [(p.x + HX) / SX, 1 - ((SY - p.y) * PPM) / 512], flip: false },
    back: { us: bx, vs: by, at: (u, v) => V(u, v, -HZ), uv: (p) => [0.5 - p.x / T, p.y / T + 0.62], flip: true },
    right: { us: bz, vs: by, at: (u, v) => V(HX, v, u), uv: (p) => [0.5 - p.z / T, p.y / T + 0.08], flip: true },
    left: { us: bz, vs: by, at: (u, v) => V(-HX, v, u), uv: (p) => [0.5 + p.z / T, p.y / T + 0.34], flip: false },
    top: { us: bx, vs: bz, at: (u, v) => V(u, SY, v), uv: (p) => [p.x / T + 0.5, p.z / T + 0.5], flip: true },
  };
  const build = (names: string[]) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (const nm of names) {
      const f = faces[nm], base = pos.length / 3, nu = f.us.length, nv = f.vs.length;
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
        const p = f.at(f.us[i], f.vs[j]), q = inner(p), d = p.clone().sub(q);
        const w = d.lengthSq() > 1e-12 ? q.addScaledVector(d.normalize(), r) : p.clone();
        for (const ch of CHIPS) {   // a chip: pushed in along the edge's inward diagonal, a smooth dish
          const c = V(...ch.c), dist = w.distanceTo(c);
          if (dist >= ch.R) continue;
          const dir = V(Math.abs(c.x) > HX - 1e-6 ? -Math.sign(c.x) : 0, c.y > SY - 1e-6 ? -1 : 0, Math.abs(c.z) > HZ - 1e-6 ? -Math.sign(c.z) : 0).normalize();
          const k = 1 - (dist / ch.R) ** 2; w.addScaledVector(dir, ch.d * k * k);
        }
        pos.push(w.x, w.y, w.z); const t = f.uv(p); uv.push(t[0], t[1]);
      }
      for (let j = 0; j + 1 < nv; j++) for (let i = 0; i + 1 < nu; i++) {
        const a = base + j * nu + i, b = a + 1, c = a + nu, d = c + 1;
        if (f.flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };
  // normals: welded over the whole block (front + rest together), so the rounded edges shade as one surface
  const front = build(["front"]), rest = build(["back", "right", "left", "top"]);
  const all = mergeGeometries([front, rest], false)!; weldNormals(all, 60);
  const N = all.getAttribute("normal") as THREE.BufferAttribute, nf = front.getAttribute("position").count;
  front.setAttribute("normal", new THREE.BufferAttribute((N.array as Float32Array).slice(0, nf * 3), 3));
  rest.setAttribute("normal", new THREE.BufferAttribute((N.array as Float32Array).slice(nf * 3), 3));
  return { front, rest };
}

/** pale warm-grey marble, low contrast: soft blotches, a few wandering veins, fine speckle. ppm = pixels per metre */
function drawMarble(g: CanvasRenderingContext2D, W: number, H: number, ppm: number, seed: number) {
  const R = rng(seed);
  g.fillStyle = "#e6e3dd"; g.fillRect(0, 0, W, H);
  const blot = ["#f6f3ec", "#cbc6bd", "#e6dccb", "#cfd4d8", "#f0ece4", "#c3beb6"];
  const nb = Math.round((W * H) / (ppm * ppm) * 46);
  for (let i = 0; i < nb; i++) {
    const x = R() * W, y = R() * H, rad = (0.05 + 0.2 * R()) * ppm, col = blot[Math.floor(R() * blot.length)];
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    g.globalAlpha = 0.1 + 0.16 * R(); gr.addColorStop(0, col); gr.addColorStop(1, col + "00");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (0.45 + 0.5 * R()), R() * Math.PI, 0, 2 * Math.PI); g.fill();
  }
  const nv = Math.max(4, Math.round((W * H) / (ppm * ppm) * 5.5));
  for (let i = 0; i < nv; i++) {       // veins: a slow random walk, drawn soft and wide, then thin
    let x = R() * W, y = R() * H, a = R() * Math.PI * 2;
    const pts: [number, number][] = [[x, y]], len = 20 + Math.floor(40 * R());
    for (let k = 0; k < len; k++) { a += (R() - 0.5) * 0.9; x += Math.cos(a) * 0.03 * ppm; y += Math.sin(a) * 0.03 * ppm; pts.push([x, y]); }
    const light = R() < 0.4;
    for (const [lw, al] of [[0.016 * ppm, 0.09], [0.005 * ppm, 0.16]] as [number, number][]) {
      g.globalAlpha = al * (0.6 + 0.6 * R()); g.strokeStyle = light ? "#fbf9f3" : "#a7a199"; g.lineWidth = lw; g.lineJoin = g.lineCap = "round";
      g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    }
  }
  const ns = Math.round((W * H) / (ppm * ppm) * 900);
  for (let i = 0; i < ns; i++) { g.globalAlpha = 0.05 + 0.08 * R(); g.fillStyle = R() < 0.5 ? "#8a8378" : "#f4f0e8"; const s = (0.002 + 0.004 * R()) * ppm; g.fillRect(R() * W, R() * H, s, s); }
  g.globalAlpha = 1;
}

const ROWS: { text: string; y: number }[] = [{ text: "拔出此剑者", y: 0.105 }, { text: "即为英格兰之王", y: 0.243 }]; // y = row centre below the top edge (m)
const CHAR = 0.11, PITCH = 0.128;
/** the inscription's characters, each at its place (canvas px); draw(ch, x, y) is called per character */
const eachChar = (fn: (ch: string, x: number, y: number) => void) => {
  for (const row of ROWS) {
    const cs = Array.from(row.text);
    cs.forEach((ch, i) => fn(ch, (SX / 2 + (i - (cs.length - 1) / 2) * PITCH) * PPM, row.y * PPM));
  }
};
function inscriptionTex() {
  const font = `700 ${Math.round(CHAR * PPM)}px ${FONT_STACK}`;
  const setup = (g: CanvasRenderingContext2D) => { g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; };
  const map = canvasTex(2048, 512, (g) => {
    drawMarble(g, 2048, 512, PPM, 4107);
    // weathering toward the ground, so the face is not one flat tone
    const gr = g.createLinearGradient(0, 0, 0, FACE_PX); gr.addColorStop(0, "rgba(255,250,240,0.10)"); gr.addColorStop(0.55, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(120,108,96,0.16)");
    g.fillStyle = gr; g.fillRect(0, 0, 2048, 512);
    setup(g);
    // the chiselled cut: a dark edge all round, darker and wider on the upper left (the wall of the cut in shade),
    // a pale lip on the lower right (the wall that takes the light), then the gilding
    eachChar((ch, x, y) => { g.fillStyle = "rgba(40,26,10,0.55)"; g.fillText(ch, x - 4, y - 4); });
    eachChar((ch, x, y) => { g.strokeStyle = "rgba(255,248,226,0.8)"; g.lineWidth = 5; g.strokeText(ch, x + 3, y + 3); });
    eachChar((ch, x, y) => { g.strokeStyle = "#3a2710"; g.lineWidth = 7; g.strokeText(ch, x, y); });
    const gold = g.createLinearGradient(0, 0, 0, 512);
    for (const row of ROWS) { const c = (row.y * PPM) / 512, h = (CHAR * PPM) / 1024; gold.addColorStop(Math.max(0, c - h), "#fbe07c"); gold.addColorStop(c, "#f2c245"); gold.addColorStop(Math.min(1, c + h), "#dd9f24"); }
    eachChar((ch, x, y) => { g.fillStyle = gold; g.fillText(ch, x, y); });
  });
  const glow = canvasTex(2048, 512, (g) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, 2048, 512); setup(g);
    eachChar((ch, x, y) => { g.fillStyle = "#fff"; g.fillText(ch, x, y); });
  });
  return { map, glow };
}

// ---------------- the anvil ----------------
const ANVIL = { y0: SY, top: SY + 0.2, zh: 0.08, x0: -0.17, x1: 0.1, horn: 0.25, slot: [0.062, 0.016] as [number, number] };
/** a rounded rectangle ring in the x-z plane at height y */
const rrect = (x0: number, x1: number, zh: number, y: number, rc: number, seg = 3) => {
  const out: THREE.Vector3[] = [], cs: [number, number, number][] = [[x1 - rc, zh - rc, 0], [x0 + rc, zh - rc, 1], [x0 + rc, -zh + rc, 2], [x1 - rc, -zh + rc, 3]];
  for (const [cx, cz, q] of cs) for (let i = 0; i <= seg; i++) { const a = (q + i / seg) * (Math.PI / 2); out.push(V(cx + rc * Math.cos(a), y, cz + rc * Math.sin(a))); }
  return out;
};
function anvilGeo() {
  const A = ANVIL, y = (h: number) => A.y0 + h;
  // [height, x0, x1, half depth, corner radius]; a level given twice = a hard edge
  const L: [number, number, number, number, number][] = [
    [0, -0.112, 0.102, 0.08, 0.012], [0.03, -0.112, 0.102, 0.08, 0.012], [0.03, -0.112, 0.102, 0.08, 0.012],
    [0.045, -0.092, 0.082, 0.064, 0.014], [0.065, -0.07, 0.06, 0.049, 0.016], [0.09, -0.062, 0.052, 0.044, 0.016], [0.115, -0.068, 0.058, 0.047, 0.016],
    [0.134, -0.1, 0.072, 0.058, 0.014], [0.142, A.x0, A.x1, A.zh, 0.01], [0.142, A.x0, A.x1, A.zh, 0.01],
    [0.193, A.x0, A.x1, A.zh, 0.01], [0.2, A.x0 + 0.006, A.x1 - 0.006, A.zh - 0.006, 0.008],
  ];
  const body = loft(L.map(([h, x0, x1, zh, rc]) => rrect(x0, x1, zh, y(h), rc)), {});
  // the face: flat, with the slot cut through it
  const sh = new THREE.Shape(), top = rrect(A.x0 + 0.006, A.x1 - 0.006, A.zh - 0.006, 0, 0.008);
  top.forEach((p, i) => (i ? sh.lineTo(p.x, -p.z) : sh.moveTo(p.x, -p.z)));
  const [sw, sd] = A.slot, hole = new THREE.Path();
  hole.moveTo(-sw / 2, -sd / 2); hole.lineTo(-sw / 2, sd / 2); hole.lineTo(sw / 2, sd / 2); hole.lineTo(sw / 2, -sd / 2); hole.closePath();
  sh.holes.push(hole);
  const face = new THREE.ShapeGeometry(sh); face.rotateX(-Math.PI / 2); face.translate(0, A.top, 0);
  if ((face.getAttribute("normal") as THREE.BufferAttribute).getY(0) < 0) face.scale(1, 1, -1);
  // the horn: a flattened cone toward +x, its top line level just under the face
  const rings: THREE.Vector3[][] = [], NH = 10, x0 = A.x1 - 0.02, len = A.horn - x0;
  for (let k = 0; k <= NH + 2; k++) {
    const cap = Math.max(0, k - NH) / 2, t = Math.min(1, k / NH), s = Math.cos((cap * Math.PI) / 2) * 0.999 + 0.001;
    const ry = (0.026 * (1 - t) ** 0.85 + 0.0055) * s, rz = (0.07 * (1 - t) ** 0.95 + 0.007) * s, cy = A.top - 0.004 - (0.026 * (1 - t) ** 0.85 + 0.0055);
    const x = x0 + len * t * (1 - 0.006 / len) + 0.006 * Math.sin((cap * Math.PI) / 2);
    rings.push(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return V(x, cy + ry * Math.cos(a), rz * Math.sin(a)); }));
  }
  const horn = loft(rings);
  const g = mergeGeometries([body, face, horn].map((q) => (q.index ? q.toNonIndexed() : q.clone())), false)!;
  // the slot's inside: dark walls, seen when the sword is out
  const slot = new THREE.BoxGeometry(sw, 0.05, sd); slot.translate(0, A.top - 0.025, 0);
  return { g, slot };
}

// ---------------- the sword (local frame: origin = the grip's centre, +y = toward the pommel) ----------------
const SW = { tip: -0.71, shoulder: -0.09, guardY: -0.075, guardW: 0.24, gripR: 0.017, pommelC: 0.097, pommelR: 0.0375, top: 0.15, bladeW: 0.05, bladeT: 0.01 };
function bladeGeo() {
  const hw = SW.bladeW / 2, ht = SW.bladeT / 2, L = SW.shoulder - SW.tip;
  // stations down the blade: [distance from the shoulder, width factor, thickness factor]; the last = the point
  const st: [number, number, number][] = [[-0.012, 1, 1], [0.3 * L, 0.96, 0.96], [0.82 * L, 0.88, 0.9], [0.9 * L, 0.72, 0.8], [0.955 * L, 0.44, 0.6], [L, 0, 0]];
  // the section: edge, shoulder of the flat, the fuller's bottom, ... (diamond with a shallow groove), 8 points
  const sec = (w: number, t: number, fuller: number) => [[w, 0], [0.3 * w, t], [0, t * (1 - 0.45 * fuller)], [-0.3 * w, t], [-w, 0], [-0.3 * w, -t], [0, -t * (1 - 0.45 * fuller)], [0.3 * w, -t]];
  const rings = st.map(([d, kw, kt]) => sec(hw * kw, ht * kt, d < 0.75 * L ? 1 : 0).map(([x, z]) => V(x, SW.shoulder - d, z)));
  const g = loft(rings, { uv: (k, i) => { const p = rings[k][i % 8]; return [0.5 + p.x / SW.bladeW, (SW.shoulder - p.y) / L]; } }).toNonIndexed();
  g.computeVertexNormals(); // flat facets: the bevels and the fuller catch the light as planes
  return g;
}
const bladeTex = () => canvasTex(64, 512, (g) => {
  // u across the blade, v from the shoulder (top of the canvas = v 1 = the point... flipY: canvas top = v 1)
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 512);
  const e = g.createLinearGradient(0, 0, 64, 0); // bright bevels, a slightly greyer flat
  e.addColorStop(0, "#ffffff"); e.addColorStop(0.3, "#f6f9fd"); e.addColorStop(0.5, "#f0f4fa"); e.addColorStop(0.7, "#f6f9fd"); e.addColorStop(1, "#ffffff");
  g.fillStyle = e; g.fillRect(0, 0, 64, 512);
  // the fuller: from the shoulder (v 0 = canvas bottom) three quarters of the way down the blade
  const y1 = 512, y0 = 512 * (1 - 0.74);
  g.fillStyle = "#c2cee2"; g.beginPath(); g.moveTo(25, y1); g.lineTo(25, y0 + 30); g.quadraticCurveTo(32, y0 - 20, 39, y0 + 30); g.lineTo(39, y1); g.closePath(); g.fill();
  g.fillStyle = "#f4f7fb"; g.fillRect(36.5, y0 + 34, 2.5, y1 - y0 - 34);
  g.fillStyle = "#8f9db6"; g.fillRect(25, y0 + 34, 2.5, y1 - y0 - 34);
  // the line where the blade leaves the guard (the sword's own ink hull draws no line between its parts)
  g.fillStyle = "#1b1820"; g.fillRect(0, 512 - 7, 64, 7);
});
/** the sword's own ink line. The world's ink pass draws its ~5 px line INSIDE a silhouette: on a 5 cm blade seen from
 *  9 m that leaves nothing of the steel, and THE sword turns into a black stick. So the sword is off the ink pass
 *  (layer NOINK, like the rig figures that hold it) and carries an inverted hull instead: its own shape drawn
 *  back-side-only, pushed OUT along smooth normals by w metres and never less than minPx pixels of a 1080 x 1920
 *  picture (an angle, so it is the same at any render size). The steel and the gold keep their full width at any
 *  distance. A pure function of the camera: nothing boils. */
const SWORD_INK = { w: 0.0042, minPx: 3.1, color: "#15131a" };
function inkHullGeo(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts.map((q) => { const s = q.index ? q.toNonIndexed() : q, c = new THREE.BufferGeometry(); c.setAttribute("position", s.getAttribute("position").clone()); return c; }), false)!;
  return weldNormals(g, 180); // one normal per place: the hull stays closed along every hard edge
}
function inkHullMat() {
  const m = new THREE.MeshBasicMaterial({ color: SWORD_INK.color, side: THREE.BackSide });
  const U = { uInkW: { value: SWORD_INK.w }, uInkMinPx: { value: SWORD_INK.minPx } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uInkW; uniform float uInkMinPx;")
      .replace("#include <project_vertex>", /* glsl */ `
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
{
  vec3 nv = normalize( normalMatrix * normal );
  float px = 2.0 * ( -mvPosition.z ) / ( projectionMatrix[ 1 ][ 1 ] * 1920.0 );   // one pixel of a 1080 x 1920 picture, in metres at this depth
  mvPosition.xyz += nv * max( uInkW, uInkMinPx * px );
}
gl_Position = projectionMatrix * mvPosition;`);
  };
  m.customProgramCacheKey = () => "arthur-sword-ink";
  return m;
}
/** a round bar along a path of [centre, radius y, radius z] stations (x runs along), rounded off at both ends */
function barGeo(n: number, at: (s: number) => { c: THREE.Vector3; ry: number; rz: number }, seg = 10) {
  const rings: THREE.Vector3[][] = [], CAP = 3;
  for (let k = -CAP; k <= n + CAP; k++) {
    const s = Math.max(0, Math.min(n, k)) / n * 2 - 1, q = at(s), over = k < 0 ? -k / CAP : k > n ? (k - n) / CAP : 0;
    const sc = Math.max(0.02, Math.cos((over * Math.PI) / 2)), dx = Math.sign(s) * q.ry * 1.1 * Math.sin((over * Math.PI) / 2);
    rings.push(Array.from({ length: seg }, (_, i) => { const a = (i / seg) * Math.PI * 2; return V(q.c.x + dx, q.c.y + q.ry * sc * Math.cos(a), q.c.z + q.rz * sc * Math.sin(a)); }));
  }
  return loft(rings);
}
function hiltGeo() {
  const W = SW.guardW / 2 - 0.0182;   // + the rounded ends (1.1 x the end's radius 0.0165) = 0.24 over all
  // the cross-guard: thick in the middle, a little slimmer along the arms, the ends swelling and bending toward the blade
  const guard = barGeo(18, (s) => {
    const a = Math.abs(s), swell = smooth((a - 0.72) / 0.28);
    return { c: V(s * W, SW.guardY - 0.02 * a * a, 0), ry: 0.0125 + 0.006 * (1 - smooth(a / 0.35)) + 0.004 * swell, rz: 0.014 + 0.006 * (1 - smooth(a / 0.35)) + 0.003 * swell };
  });
  // the pommel: a round disc facing +-z with a raised boss, and the peened button on top
  const R = SW.pommelR, T = 0.016;
  // flat faces with a rounded rim: centre -> rim -> centre
  const disc = new THREE.LatheGeometry([new THREE.Vector2(1e-4, -T * 1.12), new THREE.Vector2(R * 0.5, -T * 1.05), new THREE.Vector2(R - 0.012, -T * 0.92), new THREE.Vector2(R - 0.004, -T * 0.6), new THREE.Vector2(R, 0),
    new THREE.Vector2(R - 0.004, T * 0.6), new THREE.Vector2(R - 0.012, T * 0.92), new THREE.Vector2(R * 0.5, T * 1.05), new THREE.Vector2(1e-4, T * 1.12)], 28);
  disc.rotateX(Math.PI / 2); disc.translate(0, SW.pommelC, 0);
  const button = new THREE.SphereGeometry(0.011, 12, 8); button.scale(1, 1.25, 1); button.translate(0, SW.top - 0.014, 0);
  const collar = new THREE.CylinderGeometry(0.017, 0.019, 0.012, 14); collar.scale(1, 1, 0.85); collar.translate(0, 0.057, 0);
  const parts = [guard, disc, button, collar].map((q) => { const c = q.index ? q.toNonIndexed() : q.clone(); for (const k of Object.keys(c.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") c.deleteAttribute(k); return c; });
  return mergeGeometries(parts, false)!;
}
function gripGeo() {
  const pts: THREE.Vector2[] = [], n = 8;
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(new THREE.Vector2(SW.gripR * (0.86 + 0.14 * Math.sin(Math.PI * t)), -0.062 + 0.124 * t)); }
  const g = new THREE.LatheGeometry(pts, 14); g.scale(1, 1, 0.86);
  return g;
}
const gripTex = () => canvasTex(64, 128, (g) => {
  g.fillStyle = "#4a2c1e"; g.fillRect(0, 0, 64, 128);
  for (let y = -64; y < 192; y += 9) { g.strokeStyle = "rgba(20,10,6,0.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 22); g.stroke(); }
  for (const y of [10, 37, 64, 91, 118]) { // gold wire: five turns
    g.fillStyle = "#2a180c"; g.fillRect(0, y - 6, 64, 12); g.fillStyle = "#f0bd40"; g.fillRect(0, y - 4.5, 64, 9); g.fillStyle = "#fbe38a"; g.fillRect(0, y - 3, 64, 2.5);
  }
});

// ---------------- snow and moss ----------------
/** the block's outline at the walls (rounded corners), anticlockwise seen from above starting at the front-left
 *  corner going right along the front: points and outward normals, about `step` apart */
function outline(step = 0.045) {
  const pts: { p: THREE.Vector3; o: THREE.Vector3 }[] = [], r = BEV;
  const edge = (a: THREE.Vector3, b: THREE.Vector3, o: THREE.Vector3) => { const n = Math.max(1, Math.round(a.distanceTo(b) / step)); for (let i = 0; i < n; i++) pts.push({ p: a.clone().lerp(b, i / n), o: o.clone() }); };
  // a corner: three points on the quarter circle about c, the outward angle turning clockwise (seen from above) from a0
  const corner = (c: THREE.Vector3, a0: number) => { for (let i = 0; i < 3; i++) { const a = a0 - (i / 3) * (Math.PI / 2), o = V(Math.cos(a), 0, Math.sin(a)); pts.push({ p: c.clone().addScaledVector(o, r), o }); } };
  // angles: outward (cos a, sin a) in (x, z). front = +z (a = 90 deg), right = +x (0), back = -z (-90), left = -x (180)
  edge(V(-HX + r, 0, HZ), V(HX - r, 0, HZ), V(0, 0, 1)); corner(V(HX - r, 0, HZ - r), Math.PI / 2);
  edge(V(HX, 0, HZ - r), V(HX, 0, -HZ + r), V(1, 0, 0)); corner(V(HX - r, 0, -HZ + r), 0);
  edge(V(HX - r, 0, -HZ), V(-HX + r, 0, -HZ), V(0, 0, -1)); corner(V(-HX + r, 0, -HZ + r), -Math.PI / 2);
  edge(V(-HX, 0, -HZ + r), V(-HX, 0, HZ - r), V(-1, 0, 0)); corner(V(-HX + r, 0, HZ - r), Math.PI);
  return pts;
}
type Sweep = { from: number; to: number; closed?: boolean };
/** a soft strip swept along part of the outline. prof(i, e) -> the section at outline point i as [out, y] pairs
 *  (out = metres outward from the wall, y = height above the base y0); e = 0..1 = how far from the strip's ends
 *  (0 at an end, 1 well inside), for tapering */
function sweep(O: ReturnType<typeof outline>, s: Sweep, y0: number, prof: (i: number, e: number) => [number, number][]) {
  const rings: THREE.Vector3[][] = [], n = O.length, len = s.to - s.from;
  for (let k = 0; k <= len; k++) {
    const i = (((s.from + k) % n) + n) % n, q = O[i];
    const e = s.closed ? 1 : smooth(Math.min(k, len - k) / 3.2);
    rings.push(prof(s.from + k, e).map(([o, y]) => V(q.p.x + q.o.x * o, y0 + y, q.p.z + q.o.z * o)));
  }
  return loft(rings, { closed: false, flip: true });
}

const SHINE0 = 0.66, GLOW0 = 0.1; // the blade's / the letters' own light at rest
export function buildStone(M: Mats): StoneRig {
  const group = new THREE.Group(); group.name = "stone";
  const sword = new THREE.Group(); sword.name = "sword";

  // ----- the block -----
  const marble = canvasTex(1024, 1024, (g) => drawMarble(g, 1024, 1024, 1024 / 1.5, 2203), true);
  const ins = inscriptionTex();
  const stoneMat = M.paint({ map: marble, roughness: 0.78, specular: 0.3 });
  const faceMat = M.paint({ map: ins.map, roughness: 0.78, specular: 0.3 });
  faceMat.emissiveMap = ins.glow; faceMat.emissive = new THREE.Color("#ffc640"); faceMat.emissiveIntensity = GLOW0;
  const bg = blockGeo();
  group.add(mesh(bg.rest, stoneMat, "stone.block"), mesh(bg.front, faceMat, "stone.inscription"));

  // ----- the anvil -----
  const ag = anvilGeo();
  // (the studio matcap's key comes from behind the picture plane, bt/pbr KEY: faces toward the camera fall to slate.
  // Part of the steel is therefore left to the sun as plain diffuse, so the blade is bright from the front.)
  const anvilMat = M.ironWith({ color: "#737a88", roughness: 0.45, metalness: 0.6 });
  group.add(mesh(ag.g, anvilMat, "anvil"));
  const slot = new THREE.Mesh(ag.slot, new THREE.MeshBasicMaterial({ color: "#0d0e12", side: THREE.BackSide })); slot.name = "anvil.slot"; group.add(slot);

  // ----- the sword -----
  const bladeMat = M.metalWith({ color: "#ffffff", roughness: 0.22, metalness: 0.1, map: bladeTex(), envMapIntensity: 1.25 });
  bladeMat.emissive = new THREE.Color("#dbe6f7"); bladeMat.emissiveIntensity = SHINE0;
  const goldMat = M.metalWith({ color: "#ffc545", roughness: 0.3, map: null, envMapIntensity: 1.15 });
  goldMat.emissive = new THREE.Color("#d08a10"); goldMat.emissiveIntensity = 0.22;
  const gripMat = M.paint({ map: gripTex(), roughness: 0.7 });
  const swordGeos = [bladeGeo(), hiltGeo(), gripGeo()];
  const swordInk = new THREE.Mesh(inkHullGeo(swordGeos), inkHullMat()); swordInk.name = "sword.ink"; // (no shadow of its own: it is the line, not a thing)
  sword.add(mesh(swordGeos[0], bladeMat, "sword.blade"), mesh(swordGeos[1], goldMat, "sword.hilt"), mesh(swordGeos[2], gripMat, "sword.grip"), swordInk);
  for (const o of sword.children) o.layers.set(NOINK);   // the world's ink pass leaves the sword alone (see SWORD_INK)

  // ----- season dressing -----
  const O = outline(), n = O.length;
  const snowMat = M.paint({ color: "#f1f6fd", roughness: 0.9, specular: 0.2 });
  const mossMat = M.paint({ color: "#7fae3f", roughness: 0.95, specular: 0.1 });
  const idx = (pred: (q: (typeof O)[number]) => boolean) => O.findIndex(pred);
  const iR = idx((q) => q.o.x > 0.99 && q.p.z < 0.2), iL = n - 1 - [...O].reverse().findIndex((q) => q.o.x < -0.99 && q.p.z < 0.2);
  // 0: the rim of snow on the top's right, back and left edges (the front edge and the standing room stay clear)
  const nw = noise1(71, 23), nh = noise1(72, 19), nd = noise1(73, 31);
  const rim = sweep(O, { from: iR, to: iL }, SY, (i, e) => {
    const q = O[((i % n) + n) % n], back = Math.max(0, -q.o.z);           // deeper along the back edge
    const w = (0.058 + 0.02 * nw(i * 0.37) + back * (0.03 + 0.03 * nw(i * 0.37))) * (0.25 + 0.75 * e), h = (0.03 + 0.022 * nh(i * 0.29) + 0.012 * back) * e + 0.002;
    const dr = (0.012 + 0.04 * nd(i * 0.23) ** 2) * e;
    return [[-w, -0.012], [-w * 0.92, h * 0.5], [-w * 0.62, h * 0.93], [-w * 0.25, h], [0.004, h * 0.86], [0.02 * e + 0.004, h * 0.4], [0.023 * e + 0.004, -dr * 0.45], [0.014 * e + 0.002, -dr], [-0.012, -dr - 0.006]];
  });
  // the drift at the foot: all round in deep winter, low under the letters
  const drift = (seed: number, s: Sweep, H: number, W: number, frontK: number) => {
    // (the noise has the outline's own period and "front" is a smooth function of the place, so the closed drift
    // meets itself without a step at the seam, the front-left corner, and does not fold at the front corners)
    const a = noise1(seed, 25), b = noise1(seed + 1, 20);
    return sweep(O, s, 0, (i, e) => {
      const q = O[((i % n) + n) % n], front = smooth((q.p.z - 0.15) / 0.33), k = 1 - (1 - frontK) * front;
      const h = (H * (0.45 + 0.85 * a((i * 25) / n)) * k) * e + 0.004, w = (W * (0.6 + 0.7 * b((i * 20) / n)) * (0.6 + 0.4 * k)) * (0.3 + 0.7 * e);
      return [[-0.015, h], [0.012, h * 0.97], [w * 0.3, h * 0.8], [w * 0.62, h * 0.45], [w * 0.88, h * 0.14], [w, -0.006]];
    });
  };
  // the snow lying on the horn
  const hornSnow = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); hornSnow.scale(0.062, 0.02, 0.03); hornSnow.translate(0.163, ANVIL.top - 0.008, 0);
  const clean = (g: THREE.BufferGeometry) => { const c = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(c.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") c.deleteAttribute(k); return c; };
  const join = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs.map(clean), false)!;
  const s0 = mesh(join([rim, drift(81, { from: 0, to: n, closed: true }, 0.085, 0.2, 0.42), hornSnow]), snowMat, "stone.snow");
  // 1: a few remnants at the foot (back corners and sides)
  const at = (x: number, z: number) => { let best = 0, bd = 1e9; O.forEach((q, i) => { const d = (q.p.x - x) ** 2 + (q.p.z - z) ** 2; if (d < bd) { bd = d; best = i; } }); return best; };
  const patch = (seed: number, x: number, z: number, half: number, H: number, W: number) => drift(seed, { from: at(x, z) - half, to: at(x, z) + half }, H, W, 0.5);
  const s1 = mesh(join([patch(91, 0.75, -0.3, 7, 0.075, 0.2), patch(93, -0.75, -0.4, 8, 0.085, 0.22), patch(95, -0.5, 0.5, 6, 0.04, 0.16), patch(97, 0.75, 0.36, 5, 0.06, 0.17), patch(99, 0.2, -0.5, 7, 0.07, 0.16)]), snowMat, "stone.snowRemnants");
  // 2, 3: a little moss at the foot
  const moss = (seed: number) => join([patch(seed, -0.75, 0.3, 7, 0.085, 0.085), patch(seed + 2, -0.6, 0.5, 5, 0.06, 0.075), patch(seed + 4, 0.75, -0.1, 8, 0.08, 0.085), patch(seed + 6, 0.58, 0.5, 6, 0.07, 0.075), patch(seed + 8, -0.2, -0.5, 9, 0.07, 0.08), patch(seed + 10, 0.75, 0.42, 4, 0.065, 0.07)]);
  const s2 = mesh(moss(111), mossMat, "stone.moss");
  const dress = [s0, s1, s2];
  for (const d of dress) group.add(d);

  // ----- handling -----
  const A = STONE, _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = V(), _s = V(1, 1, 1), _x = V(), _y = V(), _z = V();
  /** put the sword at a world matrix (the sword may hang under any parent) */
  const place = (world: THREE.Matrix4) => {
    if (sword.parent) { sword.parent.updateWorldMatrix(true, false); _m.copy(sword.parent.matrixWorld).invert().multiply(world); } else _m.copy(world);
    _m.decompose(sword.position, sword.quaternion, sword.scale); sword.updateMatrixWorld(true);
  };
  /** the stuck pose in the group's frame: a lean about the slot, in the plane of the blade (about z) */
  const stuckLocal = (k: number, wobble: number, out: THREE.Matrix4) => {
    const lift = A.gripY + A.insert * Math.max(0, Math.min(1, k)) - A.anvilTop;
    _q.setFromAxisAngle(_z.set(0, 0, 1), wobble);
    _p.set(0, lift, 0).applyQuaternion(_q); _p.y += A.anvilTop;
    return out.compose(_p, _q, _s.set(1, 1, 1));
  };
  const _w = new THREE.Matrix4();
  const rig: StoneRig = {
    group, sword,
    setStuck(k = 0, wobble = 0) { group.updateWorldMatrix(true, false); place(_w.copy(group.matrixWorld).multiply(stuckLocal(k, wobble, new THREE.Matrix4()))); },
    setFree(p, up, face) {
      _y.copy(up); if (_y.lengthSq() < 1e-12) _y.set(0, 1, 0); _y.normalize();
      _z.copy(face ?? _z.set(0, 0, 1)); _z.addScaledVector(_y, -_z.dot(_y));
      if (_z.lengthSq() < 1e-8) { _z.set(1, 0, 0); _z.addScaledVector(_y, -_z.dot(_y)); if (_z.lengthSq() < 1e-8) _z.set(0, 0, 1); }
      _z.normalize(); _x.crossVectors(_y, _z);
      place(_w.makeBasis(_x, _y, _z).setPosition(p));
    },
    grip(k = 0, wobble = 0) { group.updateWorldMatrix(true, false); return V().setFromMatrixPosition(_w.copy(group.matrixWorld).multiply(stuckLocal(k, wobble, new THREE.Matrix4()))); },
    tip() { sword.updateWorldMatrix(true, false); return V(0, SW.tip, 0).applyMatrix4(sword.matrixWorld); },
    setSeason(k) {
      dress.forEach((d, i) => (d.visible = i === Math.min(k, 2)));
      mossMat.color.set(k === 3 ? "#4f8f2c" : "#8dbb3f"); s2.scale.y = k === 3 ? 1.35 : 1;   // early summer: deeper green, grown higher
      const wet = k === 1;   // thaw: the stone darker and a little glossy
      for (const m of [stoneMat, faceMat]) { m.color.set(wet ? "#d6d7dc" : k >= 2 ? "#fffaf2" : "#ffffff"); m.roughness = wet ? 0.42 : 0.78; m.specularIntensity = wet ? 0.8 : 0.3; }
    },
    setGlow(a) { faceMat.emissiveIntensity = GLOW0 + 2.6 * Math.max(0, a); },
    setShine(a) { bladeMat.emissiveIntensity = SHINE0 + 1.9 * Math.max(0, a); },
    colliders: [
      { name: "stone", min: [-HX, 0, -HZ], max: [HX, SY, HZ] },
      { name: "anvil", min: [ANVIL.x0, SY, -ANVIL.zh], max: [ANVIL.horn, ANVIL.top, ANVIL.zh] },
    ],
  };
  group.userData.triangles = tris(group) + tris(sword);
  rig.setSeason(0); rig.setStuck(0, 0);
  return rig;
}
