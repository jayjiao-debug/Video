// SHARED BUILDING BLOCKS of the hall, the cell and the bedroom (set builder B). Geometry helpers, painted textures,
// lights you can see (flames, glows, a sun shaft) and small props. The kit's rules (src/kit/sets/okit.ts header,
// src/kit/props/kit.ts header, src/kit/fx/README.md):
//   - fine detail is PAINT (okit paint(): mip-mapped, anisotropic), never geometry;
//   - architecture is plain meshes (the ink pass outlines it); small loose things are props-kit Parts (NOINK + their
//     own hull outline), so nothing small sparkles;
//   - glows, flames, shafts are NOINK and unlit; seeded painting only; every animate is a pure function of t.
import * as THREE from "three";
import type { Kit } from "../../../../kit/props/kit";
import { Part } from "../../../../kit/props/kit";
import { paint, rng, css, mix, blotch, clamp, NOINK, glowCard, makeFlame, type G2, type RGB } from "../../../../kit/sets/okit";
import { BAKED_LIGHT } from "../../../../kit/day/sets";

export { NOINK, Part, glowCard, makeFlame, paint, rng, css, mix, blotch, clamp };
export type { G2, RGB };

/** the figures' light, the parts every place of this builder shares (BAKED_LIGHT's three values included) */
export const CAST_BASE = { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.92, 1.0], shadeK: 0.4, wrap: [30, 60], edge: 0.14, bodySat: 0.13, lift: 0.03, contactLen: 0.18, ...BAKED_LIGHT };

// ===================================================================================================== materials
export type Mk = ReturnType<typeof maker>;
export const maker = (K: Kit, group: THREE.Group) => {
  const flat = (c: string, rough = 0.85) => K.flat(c, { rough });
  /** a painted surface (white base: the texture's colours as painted) */
  const tex = (map: THREE.Texture, rough = 0.88, side: THREE.Side = THREE.FrontSide) => K.flat("#ffffff", { map, rough, side });
  /** a fresh material (not the kit's cached one): for colour changes per param */
  const own = (c: string, o: { map?: THREE.Texture | null; rough?: number; side?: THREE.Side } = {}) =>
    K.M.paint({ color: c, map: o.map ?? null, roughness: o.rough ?? 0.85, specular: 0.25, envMapIntensity: 0.55, side: o.side ?? THREE.FrontSide }) as THREE.MeshPhysicalMaterial;
  const basic = (c: string, o: { map?: THREE.Texture | null; transparent?: boolean; opacity?: number; additive?: boolean; side?: THREE.Side } = {}) =>
    new THREE.MeshBasicMaterial({ color: c, map: o.map ?? null, transparent: o.transparent ?? !!o.additive, opacity: o.opacity ?? 1, fog: false, side: o.side ?? THREE.FrontSide,
      blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !(o.additive || o.transparent) });
  const mesh = (name: string, geo: THREE.BufferGeometry, m: THREE.Material, o: { cast?: boolean; receive?: boolean; noink?: boolean; into?: THREE.Object3D } = {}) => {
    const x = new THREE.Mesh(geo, m); x.name = name; x.castShadow = o.cast ?? true; x.receiveShadow = o.receive ?? true;
    if (o.noink) x.layers.set(NOINK);
    (o.into ?? group).add(x); return x;
  };
  return { K, flat, tex, own, basic, mesh };
};

// ===================================================================================================== geometry
export const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a level quad facing up; uv = (x, -z) / tile (or the given uv function) */
export const levelQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number] = (x, z) => [x, -z]) => {
  const g = new THREE.BufferGeometry(), P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], pos: number[] = [], uvs: number[] = [];
  for (const [x, z] of P) { pos.push(x, y, z); uvs.push(...uv(x, z)); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
  return g;
};
export const ceilQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv?: (x: number, z: number) => [number, number]) => {
  const g = levelQuad(x0, x1, z0, z1, y, uv); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
};
/** an upright quad from floor point a to b (a = its left end seen from the side it faces); uv in metres / tile */
export const wallQuad = (a: [number, number], b: [number, number], y0: number, y1: number, tile = 1, u0 = 0) => {
  const g = new THREE.BufferGeometry(), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  g.setAttribute("position", new THREE.Float32BufferAttribute([a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, y0 / tile, u0 + len / tile, y0 / tile, u0 + len / tile, y1 / tile, u0, y1 / tile], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
};
/** uv in metres / tile by each face's normal */
export const tileUV = <T extends THREE.BufferGeometry>(g: T, tile: number, tileY = tile): T => {
  const q = g.index ? (g.toNonIndexed() as unknown as T) : g;
  const p = q.attributes.position as THREE.BufferAttribute;
  if (!q.attributes.normal) q.computeVertexNormals();
  const n = q.attributes.normal as THREE.BufferAttribute, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const a = ax > 0.5 ? p.getZ(i) : p.getX(i), b = ay > 0.5 ? p.getZ(i) : p.getY(i);
    uv[2 * i] = a / tile; uv[2 * i + 1] = b / tileY;
  }
  q.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return q;
};
/** a turned shape: [radius, height] profile (rising) swept round y */
export const lathe = (pts: [number, number][], seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), seg);
export const bar = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra, seg = 10) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};

/** AN ARCADE / A WALL WITH OPENINGS, built in its own plane and extruded `thick`: the outline u0..u1 (along the wall),
 *  y0..y1; `notches` are round-headed openings cut up from the bottom edge (c = centre along u, w = width, spring = the
 *  height where the arch starts; spring = y0 makes a plain semicircular arch notch); `holes` are round-headed (or square)
 *  openings inside. axis "z": the wall runs along z at x = at (u = z); axis "x": along x at z = at (u = x).
 *  uv in metres / tile. Faces both ways (a solid slab). */
export type Opening = { c: number; w: number; y0: number; spring: number; round?: boolean };
export const archWallG = (o: { axis: "x" | "z"; at: number; u0: number; u1: number; y0: number; y1: number; thick: number; notches?: Opening[]; holes?: Opening[]; tile?: number }) => {
  const s = new THREE.Shape();
  s.moveTo(o.u0, o.y0);
  for (const n of [...(o.notches ?? [])].sort((a, b) => a.c - b.c)) {
    const r = n.w / 2;
    s.lineTo(n.c - r, o.y0);
    if (n.spring > o.y0 + 1e-4) s.lineTo(n.c - r, n.spring);
    if (n.round === false) { s.lineTo(n.c - r, n.spring); s.lineTo(n.c + r, n.spring); }
    else s.absarc(n.c, n.spring, r, Math.PI, 0, true);
    s.lineTo(n.c + r, o.y0);
  }
  s.lineTo(o.u1, o.y0); s.lineTo(o.u1, o.y1); s.lineTo(o.u0, o.y1); s.lineTo(o.u0, o.y0);
  for (const h of o.holes ?? []) {
    const p = new THREE.Path(), r = h.w / 2;
    p.moveTo(h.c - r, h.y0); p.lineTo(h.c + r, h.y0); p.lineTo(h.c + r, h.spring);
    if (h.round === false) p.lineTo(h.c - r, h.spring); else p.absarc(h.c, h.spring, r, 0, Math.PI, false);
    p.lineTo(h.c - r, h.y0);
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: o.thick, bevelEnabled: false, curveSegments: 14 });
  const t = o.tile ?? 1, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / t, uv.getY(i) / t);
  g.translate(0, 0, -o.thick / 2);
  if (o.axis === "z") { g.rotateY(-Math.PI / 2); g.translate(o.at, 0, 0); }   // local x -> world z, local z -> world -x
  else g.translate(0, 0, o.at);
  return g;
};

// ===================================================================================================== paint
export const wrapBlotch = (g: G2, W: number, H: number, x: number, y: number, r: number, col: RGB | string, a: number) => {
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) if (x + dx + r > 0 && x + dx - r < W && y + dy + r > 0 && y + dy - r < H) blotch(g, x + dx, y + dy, r, col, a);
};
/** LIMEWASH / PLASTER: a soft uneven wash (tileable) */
export const plasterTex = (seed: number, base: string, lo: string, hi = "#fbf6ea", s = 512) => paint(s, s, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, r() * W, r() * H, W * (0.05 + 0.13 * r()), r() < 0.55 ? lo : hi, 0.13);
  for (let i = 0; i < 14; i++) wrapBlotch(g, W, H, r() * W, r() * H, W * (0.02 + 0.04 * r()), lo, 0.1);
}, true);
/** ASHLAR: dressed stone blocks in courses, nx blocks of bw x ny courses of bh metres per tile (tileable), soft
 *  joints a few shades darker (never hairlines) */
export const ashlarTex = (o: { seed: number; base: string; lo: string; hi: string; joint: string; nx?: number; ny?: number; bw?: number; bh?: number; px?: number; weather?: number }) => {
  const nx = o.nx ?? 3, ny = o.ny ?? 4, bw = o.bw ?? 0.6, bh = o.bh ?? 0.32, ppm = o.px ?? 180, W = Math.round(nx * bw * ppm), H = Math.round(ny * bh * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed), j = Math.max(3, 0.018 * ppm);
    g.fillStyle = o.joint; g.fillRect(0, 0, W, H);
    for (let row = 0; row < ny; row++) {
      const y = row * bh * ppm, off = row % 2 ? bw * ppm * 0.5 : 0;
      for (let x = -bw * ppm + off; x < W; x += bw * ppm) {
        g.fillStyle = css(mix(o.base, r() < 0.5 ? o.lo : o.hi, 0.1 + 0.35 * r()));
        const bx = x + j / 2, by = y + j / 2, w = bw * ppm - j, h = bh * ppm - j;
        g.fillRect(bx, by, w, h); if (bx < 0) g.fillRect(bx + W, by, w, h);
        for (let k = 0; k < 2; k++) blotch(g, bx + w * r(), by + h * r(), w * 0.3, r() < 0.5 ? o.hi : o.lo, 0.1 * (o.weather ?? 1));
      }
    }
  }, true);
};
/** BOARDS: n boards across (u), grain along v; quiet (wide soft joints, broad faint grain) */
export const boardsTex = (o: { seed: number; n: number; base: string; lo: string; px?: number }) => paint(o.px ?? 512, o.px ?? 512, (g, W, H) => {
  const r = rng(o.seed), bw = W / o.n, jw = Math.max(4, W / 100);
  for (let i = 0; i < o.n; i++) {
    g.fillStyle = css(mix(o.base, o.lo, 0.1 + 0.22 * r())); g.fillRect(i * bw, 0, bw + 1, H);
    g.strokeStyle = css(o.lo, 0.1); g.lineWidth = Math.max(4, W / 90);
    for (let k = 0; k < 3; k++) { const x = i * bw + bw * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.1 * (r() - 0.5), H * 0.33, x + bw * 0.1 * (r() - 0.5), H * 0.66, x, H); g.stroke(); }
    g.fillStyle = css(mix(o.base, o.lo, 0.7), 0.6); g.fillRect(i * bw - jw / 2, 0, jw, H);
    const y = H * ((i * 0.37 + 0.2 * r()) % 1); g.fillRect(i * bw + jw / 2, y - jw / 2, bw - jw, jw);
  }
}, true);
/** a soft radial light pool (additive decal / glow), white: tint it with the material colour */
let _pool: THREE.Texture | null = null;
export const poolTex = () => (_pool ??= paint(128, 128, (g, S) => {
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.55)"); gr.addColorStop(0.7, "rgba(255,255,255,0.15)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
}));
/** A LIGHT POOL lying on a surface (additive, NOINK, no depth write): a w x h ellipse facing `normal` at p. On a floor
 *  where figures stand put it at y 0.0015 (over a 1 mm rug, under the figures' contact blob band 2-4 mm: fx/stable.ts) */
export const lightPool = (p: THREE.Vector3, normal: THREE.Vector3, w: number, h: number, col: string, a: number) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: poolTex(), color: col, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
  m.position.copy(p); m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.renderOrder = 4; m.name = "pool";
  return m;
};

// ===================================================================================================== visible light
/** A FIRE THAT LIGHTS: a flame (okit makeFlame), its halo (a glow card turned to the camera in y) and the pools it
 *  throws; animate(t, cam?) flickers them all (pure in t). */
export type Fire = { group: THREE.Group; pools: THREE.Mesh[]; halo: THREE.Mesh; level(t: number): number; animate(t: number): void; face(cam: THREE.Vector3): void };
export const makeFire = (at: THREE.Vector3, size: number, ph: number, o: { halo?: number; haloA?: number; col?: string } = {}): Fire => {
  const group = new THREE.Group(); group.name = "fire"; group.position.copy(at);
  const f = makeFlame(size, ph); group.add(f.group);
  const halo = glowCard(o.halo ?? size * 3.2, o.col ?? "#ffb060", o.haloA ?? 0.55); halo.position.set(0, size * 0.45, -0.02); group.add(halo);
  const pools: THREE.Mesh[] = [], base: number[] = [];
  const level = (t: number) => 1 + 0.06 * Math.sin(t * 6.1 + ph) + 0.04 * Math.sin(t * 10.3 + 1.7 + ph) + 0.03 * Math.sin(t * 17.9 + 0.6 + ph);
  return {
    group, pools, halo, level,
    animate(t: number) {
      f.animate(t); const k = level(t);
      (halo.material as THREE.MeshBasicMaterial).opacity = (o.haloA ?? 0.55) * k;
      pools.forEach((p, i) => { if (base[i] === undefined) base[i] = (p.material as THREE.MeshBasicMaterial).opacity; (p.material as THREE.MeshBasicMaterial).opacity = base[i] * (0.94 + 0.06 * k * k); });
    },
    face(cam: THREE.Vector3) { const w = new THREE.Vector3(); group.getWorldPosition(w); halo.rotation.set(0, Math.atan2(cam.x - w.x, cam.z - w.z), 0); f.group.rotation.set(0, Math.atan2(cam.x - w.x, cam.z - w.z), 0); },
  };
};
/** A CANDLE (a Part: wax on a dish) with its flame and a small halo. Returns the fire (for the flicker). */
export const addCandle = (P: Part, m: { wax: THREE.Material; dish: THREE.Material }, x: number, y: number, z: number, h = 0.14, ph = 0, dish = true) => {
  if (dish) {
    P.add(m.dish, new THREE.CylinderGeometry(0.05, 0.058, 0.016, 16).translate(x, y + 0.008, z), 0.004);
    P.add(m.dish, new THREE.CylinderGeometry(0.02, 0.026, 0.03, 12).translate(x, y + 0.03, z), 0.004);
  }
  const y0 = y + (dish ? 0.04 : 0);
  P.add(m.wax, new THREE.CylinderGeometry(0.018, 0.02, h, 12).translate(x, y0 + h / 2, z), 0.004);
  return makeFire(new THREE.Vector3(x, y0 + h + 0.004, z), 0.05, ph, { halo: 0.2, haloA: 0.5, col: "#ffc070" });
};

/** A SUN SHAFT: the window's four corners swept along dir by len, additive, its ends faded (a soft volume) */
let _shaftT: THREE.Texture | null = null;
export const sunShaft = (corners: THREE.Vector3[], dir: THREE.Vector3, len: number, col: string, opacity: number) => {
  _shaftT ??= paint(64, 256, (g, W, H) => {
    const img = g.createImageData(W, H), sm = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
    for (let py = 0; py < H; py++) {
      const v = 1 - py / (H - 1), pv = sm(0.0, 0.5, v) * (1 - 0.6 * sm(0.8, 1, v));
      for (let px = 0; px < W; px++) { const u = px / (W - 1), a = pv * sm(0, 0.35, u) * sm(0, 0.35, 1 - u), i = 4 * (py * W + px); img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(255 * a); }
    }
    g.putImageData(img, 0, 0);
  });
  const dn = dir.clone().normalize(), pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4], base = pos.length / 3;
    for (const v of [a, b, b.clone().addScaledVector(dn, len), a.clone().addScaledVector(dn, len)]) pos.push(v.x, v.y, v.z);
    uv.push(0, 1, 1, 1, 1, 0, 0, 0); idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: _shaftT, color: col, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  mesh.layers.set(NOINK); mesh.castShadow = mesh.receiveShadow = false; mesh.renderOrder = 6; mesh.frustumCulled = false; mesh.name = "shaft";
  return mesh;
};
/** DUST MOTES turning slowly in a shaft (pure in t) */
export const dustMotes = (n: number, corners: THREE.Vector3[], dir: THREE.Vector3, len: number, seed = 31, col = "#fff2d6") => {
  const tex = paint(32, 32, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S); });
  const r = rng(seed), d = dir.clone().normalize().multiplyScalar(len);
  const seeds = Array.from({ length: n }, () => [r(), r(), 0.08 + 0.8 * r(), r() * 6.28, 0.12 + 0.2 * r(), r() * 6.28]);
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.014, map: tex, color: col, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
  const pts = new THREE.Points(geo, mat); pts.layers.set(NOINK); pts.frustumCulled = false; pts.renderOrder = 7; pts.name = "dust";
  const [c0, c1, , c3] = corners, eu = c1.clone().sub(c0), ev = c3.clone().sub(c0), P = new THREE.Vector3();
  const update = (t: number, k: number) => {
    pts.visible = k > 0.001; mat.opacity = 0.8 * clamp(k);
    for (let i = 0; i < n; i++) {
      const [u, v, w, ph, sp, ph2] = seeds[i];
      const uu = clamp(0.15 + 0.7 * (u + 0.08 * Math.sin(t * sp + ph))), vv = clamp(0.15 + 0.7 * (v + 0.08 * Math.cos(t * sp * 0.8 + ph2))), ww = clamp(w + 0.04 * Math.sin(t * sp * 0.6 + ph2));
      P.copy(c0).addScaledVector(eu, uu).addScaledVector(ev, vv).addScaledVector(d, ww);
      pos[3 * i] = P.x; pos[3 * i + 1] = P.y + 0.02 * Math.sin(t * 0.7 + ph); pos[3 * i + 2] = P.z;
    }
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
  update(0, 1);
  return { points: pts, update };
};

// ===================================================================================================== cloth
/** A HANGING CLOTH w x h (top edge at the origin, hanging down -y, facing +z) with soft vertical folds (depth `fold`),
 *  lit, double sided, NOINK (its edge is painted). sway(t): a faint breath, pure in t. */
export const hangingCloth = (mat: THREE.Material, w: number, h: number, o: { folds?: number; fold?: number; ph?: number; amp?: number; nx?: number } = {}) => {
  const nx = o.nx ?? 24, ny = 6, g = new THREE.PlaneGeometry(w, h, nx, ny).translate(0, -h / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute, base = Float32Array.from(p.array as Float32Array), folds = o.folds ?? 5, fold = o.fold ?? 0.03, ph = o.ph ?? 0, amp = o.amp ?? 0.01;
  const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.layers.set(NOINK); mesh.name = "cloth";
  const sway = (t: number) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], k = clamp(-y / h);
      p.setZ(i, fold * Math.sin((x / w + 0.5) * Math.PI * 2 * folds) + amp * k * Math.sin(t * 0.9 + ph + x * 2.0));
    }
    p.needsUpdate = true; g.computeVertexNormals();
  };
  sway(0);
  return { mesh, sway };
};
/** a cloth's painted face: field, a border band, optional emblem and pattern (the outline painted dark at the edge) */
export const clothFaceTex = (o: { w: number; h: number; field: string; fieldLo: string; border: string; borderW?: number; seed?: number; draw?: (g: G2, W: number, H: number) => void; px?: number; edge?: string }) => {
  const ppm = o.px ?? 160, W = Math.round(o.w * ppm), H = Math.round(o.h * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed ?? 5);
    g.fillStyle = o.field; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) blotch(g, W * r(), H * r(), W * (0.1 + 0.2 * r()), o.fieldLo, 0.12);
    // woven texture: faint horizontal threads
    g.fillStyle = css(o.fieldLo, 0.08); for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
    const b = (o.borderW ?? 0.07) * ppm;
    g.strokeStyle = o.border; g.lineWidth = b * 0.55; g.strokeRect(b * 0.8, b * 0.8, W - b * 1.6, H - b * 1.6);
    o.draw?.(g, W, H);
    g.strokeStyle = o.edge ?? "#2b2228"; g.lineWidth = Math.max(4, ppm * 0.02); g.strokeRect(0, 0, W, H);
  });
};
