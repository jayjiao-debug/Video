// SHARED BUILDING BLOCKS of the Qin film's six new places (sets/corridor.ts ... sets/museum.ts; WP2). Geometry helpers,
// materials, painted textures and small animated things that more than one place uses. Everything here keeps the
// kit's rules (src/kit/sets/okit.ts header, src/kit/fx/README.md):
//   - fine detail is PAINT (mip-mapped, anisotropic canvas textures: okit paint() already sets them), never geometry;
//   - inked geometry is chunky and closed; parts overlap by a centimetre or stand clearly apart;
//   - small loose things (lanterns, carriages, tableau pieces, statues) are props-kit Parts: NOINK + their own hull
//     outline (they never go through the ink pass, so they cannot sparkle);
//   - cloth, reeds, rain and glows are NOINK; their own outline (if any) is painted;
//   - seeded painting only (okit rng); every animate is a pure function of t (seconds).
import * as THREE from "three";
import type { Kit } from "../../../../kit/props/kit";
import { Part, hullGeo } from "../../../../kit/props/kit";
import { paint, rng, css, mix, blotch, NOINK, clamp, type G2, type RGB } from "../../../../kit/sets/okit";

export { NOINK, Part, hullGeo };

// =====================================================================================================================
// colour
// =====================================================================================================================
/** a colour made lighter (k > 0, toward white) or darker (k < 0, toward black), as a CSS rgb() */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
/** the same as a hex string */
export const shadeHex = (hex: string, k: number) => {
  const m = shade(hex, k).match(/\d+/g)!.map(Number);
  return "#" + m.map((v) => v.toString(16).padStart(2, "0")).join("");
};

// =====================================================================================================================
// materials and meshes
// =====================================================================================================================
export type Mk = ReturnType<typeof maker>;
/** the place builder's material and mesh factory over the props kit (bt/pbr paint lit by the place's fill) */
export const maker = (K: Kit, group: THREE.Group) => {
  const flat = (c: string, rough = 0.8) => K.flat(c, { rough });
  /** a painted surface: the texture's colours as they are (white base) */
  const tex = (map: THREE.Texture, rough = 0.85, side: THREE.Side = THREE.FrontSide) => K.flat("#ffffff", { map, rough, side });
  /** a fresh material (never the kit's cached one): for a colour or an emissive that changes per frame */
  const own = (c: string, o: { map?: THREE.Texture | null; rough?: number; side?: THREE.Side } = {}) =>
    K.M.paint({ color: c, map: o.map ?? null, roughness: o.rough ?? 0.8, specular: 0.25, envMapIntensity: 0.55, side: o.side ?? THREE.FrontSide }) as THREE.MeshPhysicalMaterial;
  /** an unlit colour (lantern paper, the moon): MeshBasic, not fogged */
  const basic = (c: string | THREE.Color, o: { map?: THREE.Texture | null; transparent?: boolean; opacity?: number; additive?: boolean; side?: THREE.Side; depthWrite?: boolean } = {}) =>
    new THREE.MeshBasicMaterial({
      color: c, map: o.map ?? null, transparent: o.transparent ?? !!o.additive, opacity: o.opacity ?? 1, fog: false, side: o.side ?? THREE.FrontSide,
      blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o.depthWrite ?? !(o.additive || o.transparent),
    });
  const mesh = (name: string, geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], o: { into?: THREE.Object3D; cast?: boolean; receive?: boolean; noink?: boolean } = {}) => {
    const x = new THREE.Mesh(geo, m); x.name = name; x.castShadow = o.cast ?? true; x.receiveShadow = o.receive ?? true;
    if (o.noink) x.layers.set(NOINK);
    (o.into ?? group).add(x); return x;
  };
  return { K, flat, tex, own, basic, mesh };
};

// =====================================================================================================================
// geometry
// =====================================================================================================================
export const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a level quad at height y facing up (one quad, no seams), uv from uv(x, z) (default: world metres / 1) */
export const levelQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number] = (x, z) => [x, -z]) => {
  const g = new THREE.BufferGeometry(), P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], pos: number[] = [], uvs: number[] = [];
  for (const [x, z] of P) { pos.push(x, y, z); uvs.push(...uv(x, z)); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
  return g;
};
/** a level quad at height y facing DOWN (a ceiling, a soffit) */
export const ceilQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number] = (x, z) => [x, -z]) => {
  const g = levelQuad(x0, x1, z0, z1, y, uv); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
};
/** a quad from four corners (counter-clockwise seen from the side it faces), uv (0,0) (1,0) (1,1) (0,1) scaled */
export const quad4 = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, u = 1, v = 1) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, v], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
};
/** an upright quad from floor point a to b (a = its LEFT end seen from the side it faces), y0..y1; uv: u = metres
 *  along / tileU + u0, v = (y - y0) / (y1 - y0) unless vTile is given (then v = y / vTile) */
export const wallQuad = (a: [number, number], b: [number, number], y0: number, y1: number, o: { u0?: number; tileU?: number; vTile?: number } = {}) => {
  const g = new THREE.BufferGeometry(), len = Math.hypot(b[0] - a[0], b[1] - a[1]), tu = o.tileU ?? len, ua = (o.u0 ?? 0), ub = ua + len / tu;
  const va = o.vTile ? y0 / o.vTile : 0, vb = o.vTile ? y1 / o.vTile : 1;
  g.setAttribute("position", new THREE.Float32BufferAttribute([a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([ua, va, ub, va, ub, vb, ua, vb], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
};
/** uv in metres / tile by each face's normal: front and back (x, y), the ends (z, y), top and bottom (x, z) */
export const tileUV = <T extends THREE.BufferGeometry>(g: T, tile: number, tileY = tile, ox = 0, oy = 0): T => {
  const q = g.index ? (g.toNonIndexed() as unknown as T) : g;
  const p = q.attributes.position as THREE.BufferAttribute;
  if (!q.attributes.normal) q.computeVertexNormals();
  const n = q.attributes.normal as THREE.BufferAttribute, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const a = ax > 0.5 ? p.getZ(i) : p.getX(i), b = ay > 0.5 ? p.getZ(i) : p.getY(i);
    uv[2 * i] = (a - ox) / tile; uv[2 * i + 1] = (b - oy) / tileY;
  }
  q.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return q;
};
/** uv = (x, y) of the position mapped from [x0, x1] x [y0, y1] to [0, 1] (a front-facing piece shows that part of a
 *  texture); the same with (z, y) for a piece facing x when `alongZ` */
export const uvRect = <T extends THREE.BufferGeometry>(g: T, a0: number, a1: number, y0: number, y1: number, alongZ = false, flipU = false): T => {
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) { let u = ((alongZ ? p.getZ(i) : p.getX(i)) - a0) / (a1 - a0); if (flipU) u = 1 - u; uv.setXY(i, u, (p.getY(i) - y0) / (y1 - y0)); }
  return g;
};
/** a box w x h x d (centred on the origin) with its edges rounded to radius r (Wanbi's hall roundBox: three's
 *  RoundedBoxGeometry builds flat boxes far too thin) */
export const roundBox = (w: number, h: number, d: number, r: number, seg = 3) => {
  const n = seg * 2 + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), S = [w, h, d], half = S.map((v) => v / 2);
  r = Math.min(r, ...half);
  const pos = g.attributes.position as THREE.BufferAttribute, nor = g.attributes.normal as THREE.BufferAttribute;
  const p = [0, 0, 0], q = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    for (let a = 0; a < 3; a++) {
      const k = Math.round((pos.getComponent(i, a) + 0.5) * n);
      p[a] = (k <= seg ? (r * k) / seg : S[a] - (r * (n - k)) / seg) - half[a];
      q[a] = p[a] - Math.max(-(half[a] - r), Math.min(half[a] - r, p[a]));
    }
    const L = Math.hypot(q[0], q[1], q[2]);
    if (L > 1e-9) { for (let a = 0; a < 3; a++) p[a] += (q[a] / L) * r - q[a]; nor.setXYZ(i, q[0] / L, q[1] / L, q[2] / L); }
    pos.setXYZ(i, p[0], p[1], p[2]);
  }
  return g;
};
/** a turned shape: [radius, height] profile swept round y (uv v = the profile's point index / (n - 1)). THE PROFILE
 *  MUST RUN UPWARD (rising y) for outward normals (a hull over inward normals is drawn inside out: black) */
export const lathe = (pts: [number, number][], seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), seg);
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion();
/** a round bar from a to b */
export const bar = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra, seg = 12) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  g.applyQuaternion(_q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** a seeded lumpy rock: an icosphere pushed in and out by a few smooth lobes (closed, chunky), scaled w x h x d, its
 *  foot at y 0 (sunk `sink` m) */
export const rockG = (seed: number, w: number, h: number, d: number, detail = 2, sink = 0.04) => {
  const g = new THREE.IcosahedronGeometry(0.5, detail), p = g.attributes.position as THREE.BufferAttribute, r = rng(seed);
  const lobes = Array.from({ length: 5 }, () => ({ d: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), k: 0.1 + 0.16 * r() }));
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    let s = 1; for (const L of lobes) s += L.k * Math.max(0, n.dot(L.d)) ** 2 - L.k * 0.35;
    s += 0.05 * Math.sin(n.x * 7 + seed) * Math.sin(n.z * 6 + seed * 0.7);
    v.copy(n).multiplyScalar(0.5 * s);
    if (v.y < -0.2) v.y = -0.2 - (v.y + 0.2) * 0.25;                     // a flatter foot
    p.setXYZ(i, v.x * w, (v.y + 0.2) * h / 0.75 - sink, v.z * d);
  }
  const q = g.index ? g.toNonIndexed() : g; q.computeVertexNormals();
  return q;
};
/** a rockG rock FITTED to its box: exactly w (x) by d (z), its top at h, its foot sunk `sink` m (rockG's lobes make
 *  the raw rock smaller than asked; a rock a camera hides behind must keep its size) */
export const rockFit = (seed: number, w: number, h: number, d: number, detail = 2, sink = 0.04) => {
  const g = rockG(seed, 1, 1, 1, detail, 0); g.computeBoundingBox();
  const b = g.boundingBox!, c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
  g.translate(-c.x, -b.min.y, -c.z).scale(w / sz.x, (h + sink) / sz.y, d / sz.z).translate(0, -sink, 0);
  g.computeVertexNormals();
  return g;
};
/** a level shape (outline with holes, [x, z] world points) at height y, uv = world (x, -z) / tile */
export const levelShape = (outline: [number, number][], holes: [number, number][][], y: number, tile = 1) => {
  const sh = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes) sh.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ShapeGeometry(sh, 24).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
  return g;
};
/** points round an ellipse (cx, cz, rx, rz), counter-clockwise seen from above, n points */
export const ellipsePts = (cx: number, cz: number, rx: number, rz: number, n = 48, wob = 0, seed = 1): [number, number][] => {
  const r = rng(seed), ph = [r() * 6, r() * 6];
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, k = 1 + wob * (0.6 * Math.sin(a * 3 + ph[0]) + 0.4 * Math.sin(a * 5 + ph[1])); return [cx + Math.cos(a) * rx * k, cz - Math.sin(a) * rz * k] as [number, number]; });
};

// =====================================================================================================================
// painting
// =====================================================================================================================
/** a blotch drawn again across the edges of a repeating tile */
export const wrapBlotch = (g: G2, W: number, H: number, x: number, y: number, r: number, col: RGB | string, a: number) => {
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) if (x + dx + r > 0 && x + dx - r < W && y + dy + r > 0 && y + dy - r < H) blotch(g, x + dx, y + dy, r, col, a);
};
/** STONE FLAGS: an nx x ny block of flags per tile (rows offset by half a flag when `bond`), each its own tone, soft
 *  mottle inside, the grout lighter or darker; grout half on each tile edge (tiled, they make one line) */
export const flagsTex = (o: { seed: number; base: string; grout: string; nx: number; ny: number; px?: number; vary?: number; bond?: boolean; mottle?: [string, string]; lip?: number }) =>
  paint(o.px ?? 1024, Math.round((o.px ?? 1024) * o.ny / o.nx), (g, W, H) => {
    const r = rng(o.seed), sx = W / o.nx, sy = H / o.ny, gr = Math.max(2, sx * 0.035);
    g.fillStyle = o.grout; g.fillRect(0, 0, W, H);
    for (let j = 0; j < o.ny; j++) for (let i = -1; i < o.nx + 1; i++) {
      const off = o.bond && j % 2 ? sx / 2 : 0, x = i * sx + off + gr / 2, y = j * sy + gr / 2, w = sx - gr, h = sy - gr;
      if (x > W || x + w < 0) continue;
      g.fillStyle = shade(o.base, (r() - 0.5) * (o.vary ?? 0.12)); g.fillRect(x, y, w, h);
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
      for (let b = 0; b < 4; b++) blotch(g, x + r() * w, y + r() * h, w * (0.2 + 0.3 * r()), r() < 0.5 ? (o.mottle?.[0] ?? "#ffffff") : (o.mottle?.[1] ?? "#000000"), 0.06);
      if (o.lip) { g.fillStyle = `rgba(255,250,240,${o.lip})`; g.fillRect(x, y, w, gr * 0.8); g.fillStyle = `rgba(20,16,26,${o.lip})`; g.fillRect(x, y + h - gr * 0.8, w, gr * 0.8); }
      g.restore();
    }
    // the bond's wrap: the half flags at the tile's left / right edges were drawn by i = -1 / nx
  }, true);
/** PLANKS (a floor or a wall): n boards across the tile, grain lines, dark joints; colours as given */
export const boardsTex = (o: { seed: number; n: number; base: string; lo: string; joint: string; px?: number; ends?: number }) =>
  paint(o.px ?? 512, o.px ?? 512, (g, W, H) => {
    const r = rng(o.seed), bw = W / o.n;
    for (let i = 0; i < o.n; i++) {
      g.fillStyle = css(mix(o.base, o.lo, 0.15 + 0.5 * r())); g.fillRect(i * bw, 0, bw + 1, H);
      g.strokeStyle = css(o.lo, 0.35); g.lineWidth = Math.max(1.5, W / 300);
      for (let k = 0; k < 3; k++) { const x = i * bw + bw * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.12 * (r() - 0.5), H * 0.33, x + bw * 0.12 * (r() - 0.5), H * 0.66, x, H); g.stroke(); }
      if (r() < 0.5) { g.fillStyle = css(o.lo, 0.45); g.beginPath(); g.ellipse(i * bw + bw * (0.3 + 0.4 * r()), H * r(), bw * 0.08, bw * 0.14, 0, 0, 7); g.fill(); }
      g.fillStyle = o.joint; g.fillRect(i * bw - W / 512, 0, W / 256, H);
      for (let e = 0; e < (o.ends ?? 0); e++) { const y = H * ((e + (i % 2) * 0.5) / (o.ends ?? 1)); g.fillRect(i * bw, y - W / 512, bw, W / 256); }
    }
  }, true);
/** a cloud scroll (云纹): a spiral with a tail, size s, turning dir (stroke with the current style) */
export const cloudScroll = (g: G2, x: number, y: number, s: number, dir: number) => {
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const t = i / 40, a = dir * t * Math.PI * 3.2, rad = s * (0.12 + 0.88 * t); const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.8; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.lineTo(x + dir * s * 1.9, y + s * 0.55);
  g.stroke();
};
/** LATTICE (棂格) painted over a panel: a frame and a grid of bars with a diamond / step pattern, the paper behind
 *  glowing `paper`; draws into the rectangle (x, y, w, h) of g */
export const latticePaint = (g: G2, x: number, y: number, w: number, h: number, o: { wood: string; woodLo: string; paper: string; paperHi?: string; cell: number; frame: number; kind?: "grid" | "step" | "diamond" }) => {
  // the paper: a soft gradient (brighter in the middle)
  const pg = g.createLinearGradient(x, y, x, y + h); pg.addColorStop(0, o.paperHi ?? o.paper); pg.addColorStop(0.5, o.paper); pg.addColorStop(1, o.paperHi ?? o.paper);
  g.fillStyle = pg; g.fillRect(x, y, w, h);
  const bw = Math.max(2, o.cell * 0.16), kind = o.kind ?? "step";
  g.fillStyle = o.wood;
  const nx = Math.max(2, Math.round(w / o.cell)), ny = Math.max(2, Math.round(h / o.cell)), cx = w / nx, cy = h / ny;
  if (kind === "diamond") {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = o.wood; g.lineWidth = bw;
    for (let k = -ny; k <= nx + ny; k++) { g.beginPath(); g.moveTo(x + k * cx, y); g.lineTo(x + (k - ny) * cx, y + h); g.stroke(); g.beginPath(); g.moveTo(x + k * cx, y); g.lineTo(x + (k + ny) * cx, y + h); g.stroke(); }
    g.restore();
  } else {
    for (let i = 1; i < nx; i++) g.fillRect(x + i * cx - bw / 2, y, bw, h);
    for (let j = 1; j < ny; j++) g.fillRect(x, y + j * cy - bw / 2, w, bw);
    if (kind === "step") {                                    // 步步锦: short bars in alternate cells
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) if ((i + j) % 2 === 0) {
        g.fillRect(x + i * cx + cx * 0.3, y + j * cy + cy * 0.5 - bw / 2, cx * 0.4, bw);
      } else g.fillRect(x + i * cx + cx * 0.5 - bw / 2, y + j * cy + cy * 0.3, bw, cy * 0.4);
    }
  }
  // a soft shadow line under each bar (depth) and the frame
  g.strokeStyle = o.woodLo; g.lineWidth = o.frame; g.strokeRect(x + o.frame / 2, y + o.frame / 2, w - o.frame, h - o.frame);
};
/** roof tile ends (瓦当) along a fascia strip: round discs with a cloud mark between dripping tiles; draws into (x, y, w, h) */
export const tileEnds = (g: G2, x: number, y: number, w: number, h: number, o: { n: number; tile: string; tileLo: string; mark: string }) => {
  const s = w / o.n;
  g.fillStyle = o.tileLo; g.fillRect(x, y, w, h);
  for (let i = 0; i < o.n; i++) {
    const cx = x + (i + 0.5) * s, cy = y + h * 0.5, R = Math.min(s * 0.42, h * 0.46);
    g.fillStyle = o.tile; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.strokeStyle = o.mark; g.lineWidth = Math.max(1.5, R * 0.12); g.beginPath(); g.arc(cx, cy, R * 0.72, 0, 7); g.stroke();
    cloudScroll(g, cx - R * 0.15, cy, R * 0.35, 1);
  }
};

// =====================================================================================================================
// small animated things
// =====================================================================================================================
/** A CLOTH (banner, curtain, streamer): a w x h sheet hanging from its top edge (origin = the middle of the top edge,
 *  it hangs -y, faces +z). sway(t, amp) rewrites it as a pure function of t and the amplitude; the outline is paint.
 *  Double-sided, lit, NOINK. `pin` = also hold the bottom edge (a curtain tied at the foot moves less there). */
export const makeCloth = (mat: THREE.Material, w: number, h: number, o: { nx?: number; ny?: number; ph?: number; tails?: number; pin?: number; freq?: number } = {}) => {
  const nx = o.nx ?? 8, ny = o.ny ?? 8, ph = o.ph ?? 0, fq = o.freq ?? 1;
  const g = new THREE.PlaneGeometry(w, h, nx, ny).translate(0, -h / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  if (o.tails) for (let i = 0; i < p.count; i++) { const col = i % (nx + 1), row = Math.floor(i / (nx + 1)); if (row === ny && col % 2 === 1) { p.setY(i, p.getY(i) + o.tails); uv.setY(i, uv.getY(i) + o.tails / h); } }
  const base = Float32Array.from(p.array as Float32Array);
  const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.layers.set(NOINK); mesh.frustumCulled = false;
  const sway = (t: number, amp: number) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], k0 = clamp(-y / h), k = Math.pow(k0, 1.3) * (o.pin ? 1 - o.pin * Math.pow(k0, 6) : 1);
      const s = Math.sin(fq * t * 1.6 + ph + k * 2.6 + x * 1.4) + 0.45 * Math.sin(fq * t * 2.9 + ph * 1.7 + k * 4.3 - x * 2.1);
      p.setXYZ(i, x + amp * 0.25 * k * Math.sin(fq * t * 1.1 + ph), y, amp * k * s);
    }
    p.needsUpdate = true; g.computeVertexNormals();
  };
  sway(0, 0.05);
  return { mesh, sway };
};
/** a soft round glow card (additive, NOINK, facing +z) */
export const glowSprite = (r: number, col: string, a: number) => {
  const t = paint(128, 128, (g, S) => {
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, css(col, 1)); gr.addColorStop(0.3, css(col, 0.45)); gr.addColorStop(1, css(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * r, 2 * r), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.layers.set(NOINK); m.name = "glow"; m.renderOrder = 5; m.castShadow = false; m.receiveShadow = false;
  return m;
};
/** turns a glow card to face a camera position in the y axis only (a billboard that stays upright) */
export const faceY = (o: THREE.Object3D, cam: THREE.Vector3) => { o.rotation.set(0, Math.atan2(cam.x - o.position.x, cam.z - o.position.z), 0); };
/** A HANGING PAPER LANTERN into a props-kit Part (NOINK + hull): the glowing body (unlit paper), dark caps, a red
 *  tassel, a cord `cord` m up from the hook. (x, y, z) = the hook at its top; it hangs -y, `h` m long (body r 0.42 h). */
export type LanternMats = { paper: THREE.Material; cap: THREE.Material; tassel: THREE.Material };
export const addLantern = (P: Part, m: LanternMats, x: number, y: number, z: number, h: number, cord = 0) => {
  const r = 0.42 * h, T = (g: THREE.BufferGeometry) => g.translate(x, y, z);
  P.add(m.paper, T(lathe(Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [r * (0.62 + 0.38 * Math.sin(Math.PI * u)), -h * 0.88 + u * h * 0.78] as [number, number]; }), 20)), 0.006);   // (the profile runs UP: outward normals)
  P.add(m.cap, T(new THREE.CylinderGeometry(r * 0.66, r * 0.7, h * 0.12, 20).translate(0, -h * 0.06, 0)), 0.006);
  P.add(m.cap, T(new THREE.CylinderGeometry(r * 0.7, r * 0.62, h * 0.1, 20).translate(0, -h * 0.91, 0)), 0.006);
  P.add(m.tassel, T(new THREE.CylinderGeometry(0.018, 0.04, h * 0.36, 10).translate(0, -h * 0.96 - h * 0.18, 0)), 0.005);
  if (cord > 0) P.add(m.cap, T(new THREE.CylinderGeometry(0.009, 0.009, cord + 0.02, 6).translate(0, cord / 2, 0)), 0.004);
};
/** paints the ribs of a paper lantern body onto a canvas (unused when the body is plain) */
export const lanternRibs = (g: G2, W: number, H: number, col: string) => { g.strokeStyle = col; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const y = (H * (i + 0.5)) / 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } };

// =====================================================================================================================
// terrain
// =====================================================================================================================
/** A HEIGHTFIELD over the rectangle x0..x1, z0..z1 (nx x nz cells) at base height y0 + h(x, z); uv = the rectangle
 *  mapped to [0, 1] (u along x, v = 1 at z0: a top-down painting with its canvas top at z0). Smooth normals. */
export const terrainG = (x0: number, x1: number, z0: number, z1: number, nx: number, nz: number, y0: number, h: (x: number, z: number) => number) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx, z = z0 + ((z1 - z0) * j) / nz;
    pos.push(x, y0 + h(x, z), z); uv.push(i / nx, 1 - j / nz);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** a smooth bump: height a at (cx, cz), radii rx, rz, its flank's sharpness p (2 = gaussian-like) */
export const bump = (x: number, z: number, cx: number, cz: number, a: number, rx: number, rz: number, p = 2) => a * Math.exp(-Math.pow(Math.hypot((x - cx) / rx, (z - cz) / rz), p));
/** a smoothstep */
export const smooth01 = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
/** a STARBURST card (the cartoon "pop"): a yellow star with a white core and a painted ink outline, NOINK, transparent */
export const starTex = (fill = "#ffd84a", core = "#fff6c8", line = "#2a2230") => paint(256, 256, (g, S) => {
  const c = S / 2, n = 10, pts: [number, number][] = [];
  for (let i = 0; i < 2 * n; i++) { const a = (i / (2 * n)) * Math.PI * 2 - Math.PI / 2, r = (i % 2 ? 0.48 : 0.24) * S * (0.92 + 0.08 * Math.sin(i * 2.3)); pts.push([c + Math.cos(a) * r * 0.98, c + Math.sin(a) * r * 0.98]); }
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = fill; g.fill(); g.strokeStyle = line; g.lineWidth = S * 0.03; g.lineJoin = "round"; g.stroke();
  const gr = g.createRadialGradient(c, c, 0, c, c, S * 0.2); gr.addColorStop(0, core); gr.addColorStop(1, "rgba(255,246,200,0)"); g.fillStyle = gr; g.beginPath(); g.arc(c, c, S * 0.2, 0, 7); g.fill();
});
/** RAIN: n streaks (thin quads facing +z, NOINK, unlit, transparent) falling through the box x0..x1, y0..y1, z0..z1;
 *  update(t, k, slant) moves them (a pure function of t) and sets their opacity to k */
export const makeRain = (n: number, box: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }, o: { len?: number; w?: number; speed?: number; col?: string; seed?: number } = {}) => {
  const len = o.len ?? 0.07, w = o.w ?? 0.004, sp = o.speed ?? 2.4, r = rng(o.seed ?? 5);
  const seeds = Array.from({ length: n }, () => [r(), r(), r(), 0.7 + 0.6 * r()]);
  const pos = new Float32Array(n * 12), idx: number[] = [];
  for (let i = 0; i < n; i++) { const b = i * 4; idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: o.col ?? "#dfe9f6", transparent: true, opacity: 0.5, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, mat); mesh.layers.set(NOINK); mesh.frustumCulled = false; mesh.name = "rain"; mesh.renderOrder = 4; mesh.castShadow = false; mesh.receiveShadow = false;
  const H = box.y1 - box.y0;
  const update = (t: number, k: number, slant = 0.15) => {
    mesh.visible = k > 0.001; mat.opacity = 0.55 * clamp(k);
    for (let i = 0; i < n; i++) {
      const [a, b, c, s] = seeds[i], ph = ((t * sp * s) / H + a) % 1, y = box.y1 - ph * H, x = box.x0 + (box.x1 - box.x0) * b + slant * ph * H, z = box.z0 + (box.z1 - box.z0) * c, L = len * s;
      const dx = slant * L, j = i * 12;
      pos.set([x - w / 2, y, z, x + w / 2, y, z, x + w / 2 + dx, y + L, z, x - w / 2 + dx, y + L, z], j);
    }
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
  update(0, 0);
  return { mesh, update };
};
