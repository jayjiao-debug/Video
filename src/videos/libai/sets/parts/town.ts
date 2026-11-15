// SHARED BUILDING BLOCKS of WP2a's three places (sets/market.ts, sets/yard.ts, sets/room.ts) and the far copy of the
// new house (parts/farhouse.ts): painted textures (grey roof tiles, timber-and-plaster walls, striped awning cloth,
// one-character shop signs, planks), closed slabs with metre-based uv (roofs, awnings), the gable roof, the toon tree
// crown, low-detail villagers (the market's far crowd), a pecking chicken, the painted panorama ring.
// The kit's rules hold (src/kit/sets/okit.ts header): fine detail is PAINT (mip-mapped canvas), inked geometry is
// chunky and closed, small loose things are props-kit Parts (NOINK + their own hull), far things are NOINK paint,
// seeded painting only, every animate is a pure function of t.
import * as THREE from "three";
import { Part } from "../../../../kit/props/kit";
import { paint, rng, css, mix, blotch, NOINK, type G2 } from "../../../../kit/sets/okit";
import { shade, lathe } from "./common";

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** a matrix that turns a piece built facing +z by `yaw` about y and puts its origin at (x, y, z) */
export const at = (x: number, z: number, yaw = 0, y = 0) => new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
/** the yaw that turns a piece built facing +z to face +x / -x / +z / -z */
export const FACE = { px: Math.PI / 2, nx: -Math.PI / 2, pz: 0, nz: Math.PI } as const;

// =====================================================================================================================
// textures
// =====================================================================================================================
/** GREY ROOF TILES, one repeating tile of `m` metres: channels of curved tiles running down the slope (cover rolls lit
 *  on one side, pans darker between), the courses' overlap lines, a soft mottle. u across the slope, v down it. */
export const tileTex = (seed: number, o: { base?: string; n?: number; courses?: number } = {}) => paint(256, 256, (g, W, H) => {
  const r = rng(seed), base = o.base ?? "#7c808c", n = o.n ?? 5, nc = o.courses ?? 4, cw = W / n;
  g.fillStyle = shade(base, -0.22); g.fillRect(0, 0, W, H);
  for (let i = 0; i < n; i++) {
    const x = i * cw, gr = g.createLinearGradient(x, 0, x + cw, 0);
    gr.addColorStop(0, shade(base, -0.3)); gr.addColorStop(0.18, shade(base, 0.05)); gr.addColorStop(0.42, shade(base, 0.22));
    gr.addColorStop(0.62, base); gr.addColorStop(0.86, shade(base, -0.18)); gr.addColorStop(1, shade(base, -0.32));
    g.fillStyle = gr; g.fillRect(x + cw * 0.08, 0, cw * 0.84, H);
  }
  for (let j = 0; j < nc; j++) {
    const y = (j / nc) * H;
    g.fillStyle = "rgba(40,38,52,0.35)"; g.fillRect(0, y, W, 3);
    g.fillStyle = "rgba(255,255,255,0.10)"; g.fillRect(0, y + 3, W, 3);
  }
  for (let i = 0; i < 14; i++) { const x = W * r(), y = H * r(), rr = 18 + 30 * r(); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, rr, r() < 0.5 ? "#ffffff" : "#20202c", 0.06); }
}, true);
/** PLAIN BOARDS (a floor, a counter front, a shop's side): n boards across the tile, soft grain, dark joints */
export const boardTex = (seed: number, o: { base: string; n?: number; joint?: string; lying?: boolean; px?: number }) => paint(o.px ?? 256, o.px ?? 256, (g, W, H) => {
  const r = rng(seed), n = o.n ?? 4, bw = W / n;
  if (o.lying) { g.translate(W, 0); g.rotate(Math.PI / 2); }
  for (let i = 0; i < n; i++) {
    g.fillStyle = shade(o.base, (r() - 0.5) * 0.14); g.fillRect(i * bw, 0, bw + 1, H);
    g.strokeStyle = css(shade(o.base, -0.3), 0.3); g.lineWidth = Math.max(1.5, W / 220);
    for (let k = 0; k < 3; k++) { const x = i * bw + bw * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.12 * (r() - 0.5), H * 0.33, x + bw * 0.12 * (r() - 0.5), H * 0.66, x, H); g.stroke(); }
    g.fillStyle = o.joint ?? css(shade(o.base, -0.45), 0.85); g.fillRect(i * bw - W / 400, 0, W / 200, H);
  }
}, true);
/** STRIPED AWNING CLOTH (u across, v down the awning): broad stripes of two colours, a darker hem along the lower edge,
 *  soft sag shading */
export const awningTex = (a: string, b: string, o: { n?: number; hem?: string } = {}) => paint(256, 128, (g, W, H) => {
  const n = o.n ?? 6;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * W) / n, 0, W / n + 1, H); }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,0.12)"); gr.addColorStop(0.6, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(30,20,20,0.18)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = o.hem ?? "rgba(60,40,40,0.55)"; g.fillRect(0, H * 0.88, W, H * 0.12);
}, true);
/** A HANGING SHOP SIGN (幌子 board): one big character on a lacquered board with a border, `w` x `h` px */
export const signTex = (ch: string, o: { bg: string; fg: string; border?: string; w?: number; h?: number } ) => paint(o.w ?? 128, o.h ?? 320, (g, W, H) => {
  g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = o.border ?? shade(o.bg, -0.35); g.lineWidth = W * 0.09; g.strokeRect(W * 0.045, W * 0.045, W * 0.91, H - W * 0.09);
  g.fillStyle = o.fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `700 ${Math.round(W * 0.66)}px FrSans, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
  g.fillText(ch, W / 2, H * 0.42);
  g.fillStyle = css(o.fg, 0.55); g.beginPath(); g.arc(W / 2, H * 0.8, W * 0.1, 0, 7); g.fill();
});
/** A PAINTED BOARD WITH WORDS (the 「德有邻堂」 board): carved-look gold characters on dark lacquer, a raised frame */
export const boardWordsTex = (text: string, o: { bg: string; fg: string; frame: string; w?: number; h?: number }) => paint(o.w ?? 1024, o.h ?? 300, (g, W, H) => {
  g.fillStyle = o.frame; g.fillRect(0, 0, W, H);
  const f = H * 0.11;
  g.fillStyle = shade(o.frame, -0.3); g.fillRect(f * 0.5, f * 0.5, W - f, H - f);
  g.fillStyle = o.bg; g.fillRect(f, f, W - 2 * f, H - 2 * f);
  const gr = g.createLinearGradient(0, f, 0, H - f); gr.addColorStop(0, "rgba(255,255,255,0.07)"); gr.addColorStop(1, "rgba(0,0,0,0.12)"); g.fillStyle = gr; g.fillRect(f, f, W - 2 * f, H - 2 * f);
  const n = [...text].length, px = Math.min((H - 2 * f) * 0.78, ((W - 2 * f) * 0.9) / n);
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${Math.round(px)}px FrSans, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
  [...text].forEach((ch, i) => {
    const x = f + ((W - 2 * f) * (i + 0.5)) / n, y = H / 2 + px * 0.03;
    g.fillStyle = "rgba(20,12,8,0.55)"; g.fillText(ch, x + px * 0.03, y + px * 0.035);
    g.fillStyle = o.fg; g.fillText(ch, x, y);
  });
});
/** soft blotches across a repeating tile's edges */
export const wrapSoft = (g: G2, W: number, H: number, x: number, y: number, rr: number, col: string, a: number) => { for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, rr, col, a); };
/** PLASTER (a repeating 1 m tile): a warm off-white with soft uneven tone */
export const plasterTex = (seed: number, base: string) => paint(256, 256, (g, W, H) => {
  const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) wrapSoft(g, W, H, W * r(), H * r(), 30 + 50 * r(), r() < 0.5 ? "#ffffff" : shade(base, -0.4), 0.08);
}, true);

// =====================================================================================================================
// geometry
// =====================================================================================================================
/** A CLOSED SLAB: the top face is the quad a b c d (counter-clockwise seen from above / outside), the slab is `t` thick
 *  under it. The top's uv is in metres / `tile` (u along a->b, v along a->d); the other faces get uv 0..1. Flat normals. */
export const slabG = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, t: number, tile = 1) => {
  const n = b.clone().sub(a).cross(d.clone().sub(a)).normalize().multiplyScalar(-t);
  const A = a.clone().add(n), B = b.clone().add(n), C = c.clone().add(n), D = d.clone().add(n);
  const pos: number[] = [], uv: number[] = [];
  const quad = (p: THREE.Vector3[], q: [number, number][]) => { for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(p[i].x, p[i].y, p[i].z); uv.push(q[i][0], q[i][1]); } };
  const lu = a.distanceTo(b) / tile, lv = a.distanceTo(d) / tile;
  quad([a, b, c, d], [[0, 0], [lu, 0], [lu, lv], [0, lv]]);
  quad([D, C, B, A], [[0, 1], [1, 1], [1, 0], [0, 0]]);
  quad([A, B, b, a], [[0, 0], [1, 0], [1, 1], [0, 1]]); quad([B, C, c, b], [[0, 0], [1, 0], [1, 1], [0, 1]]);
  quad([C, D, d, c], [[0, 0], [1, 0], [1, 1], [0, 1]]); quad([D, A, a, d], [[0, 0], [1, 0], [1, 1], [0, 1]]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return g;
};
/** a box from its extents whose uv on every face is in metres / tile (planks and plaster repeat at their true size) */
export const boxM = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tile = 1) => {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    uv.setXY(i, (ax > 0.5 ? p.getZ(i) : p.getX(i)) / tile, (ay > 0.5 ? p.getZ(i) : p.getY(i)) / tile);
  }
  return g;
};
/** a triangle wall piece (a gable end) in the plane x = const between z0 and z1 from y0 up to the apex (zA, yA), uv in
 *  metres / tile; faces +x when `px`, else -x */
export const gableG = (x: number, z0: number, z1: number, y0: number, zA: number, yA: number, px: boolean, tile = 1) => {
  const pts = px ? [[z1, y0], [z0, y0], [zA, yA]] : [[z0, y0], [z1, y0], [zA, yA]];
  const pos: number[] = [], uv: number[] = [];
  for (const [z, y] of pts) { pos.push(x, y, z); uv.push(z / tile, y / tile); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return g;
};
export type RoofMats = { tile: THREE.Material; under: THREE.Material; trim: THREE.Material };
/** A GABLE ROOF with its ridge along x: the front slope from the ridge (yR, at the middle of zB..zF) down to the front
 *  edge (zF, yE), the back slope to (zB, yE), `over` past x0 / x1 at the sides, `t` thick; the ridge roll on top, a
 *  fascia board along both eaves. Pieces pushed into `put(material, geometry)`. Returns the underside's height at z. */
export const gableRoof = (put: (m: THREE.Material, g: THREE.BufferGeometry) => void, m: RoofMats, s: { x0: number; x1: number; zF: number; zB: number; yE: number; yR: number; over?: number; t?: number; tile?: number; curl?: boolean }) => {
  const o = s.over ?? 0.35, t = s.t ?? 0.1, zM = (s.zF + s.zB) / 2, xa = s.x0 - o, xb = s.x1 + o, tile = s.tile ?? 1;
  put(m.tile, slabG(V3(xa, s.yE, s.zF), V3(xb, s.yE, s.zF), V3(xb, s.yR, zM), V3(xa, s.yR, zM), t, tile));
  put(m.tile, slabG(V3(xb, s.yE, s.zB), V3(xa, s.yE, s.zB), V3(xa, s.yR, zM), V3(xb, s.yR, zM), t, tile));
  // the ridge roll and its two upturned ends
  put(m.trim, new THREE.BoxGeometry(xb - xa - 0.1, 0.2, 0.26).translate((xa + xb) / 2, s.yR + 0.04, zM));
  if (s.curl !== false) for (const [x, k] of [[xa + 0.05, -1], [xb - 0.05, 1]] as [number, number][]) put(m.trim, new THREE.BoxGeometry(0.34, 0.16, 0.26).rotateZ(-k * 0.5).translate(x + k * 0.06, s.yR + 0.17, zM));
  // fascia boards along the eaves (chunky: 16 x 7 cm)
  put(m.trim, new THREE.BoxGeometry(xb - xa, 0.16, 0.07).translate((xa + xb) / 2, s.yE - 0.09, s.zF + 0.01));
  put(m.trim, new THREE.BoxGeometry(xb - xa, 0.16, 0.07).translate((xa + xb) / 2, s.yE - 0.09, s.zB - 0.01));
  const slope = (s.yR - s.yE) / (zM - s.zF);
  return (z: number) => s.yR - t / Math.cos(Math.atan(Math.abs(slope))) - Math.abs(slope) * Math.abs(z - zM);
};
/** a lumpy blob (an icosahedron pushed in and out by smooth lobes), unit size: tree crowns, bushes, heaps */
export const blobG = (seed: number, detail = 2, k = 0.18) => {
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position as THREE.BufferAttribute, r = rng(seed);
  const lobes = Array.from({ length: 6 }, () => ({ d: V3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), k: k * (0.5 + r()) }));
  const v = V3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const nn = v.clone().normalize();
    let s = 1; for (const L of lobes) s += L.k * Math.max(0, nn.dot(L.d)) ** 2 - L.k * 0.3;
    p.setXYZ(i, nn.x * s, nn.y * s, nn.z * s);
  }
  const q = g.index ? g.toNonIndexed() : g; q.computeVertexNormals();
  return q;
};
/** a bowed limb as one bent bar (three segments) from a to b, sagging by `bow` sideways (for trunks and branches) */
export const bentLimb = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, bow: THREE.Vector3) => {
  const pts = [0, 1 / 3, 2 / 3, 1].map((u) => a.clone().lerp(b, u).addScaledVector(bow, Math.sin(Math.PI * u)));
  const gs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const p = pts[i], q = pts[i + 1], d = q.clone().sub(p), len = d.length();
    const r0 = ra + (rb - ra) * (i / 3), r1 = ra + (rb - ra) * ((i + 1) / 3);
    const g = new THREE.CylinderGeometry(r1, r0, len + r0 * 0.6, 10, 1, false);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize())); g.translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2);
    gs.push(g.toNonIndexed());
  }
  return gs;
};

// =====================================================================================================================
// people far back, chickens
// =====================================================================================================================
/** LOW-DETAIL VILLAGERS (the market's far crowd, the set's own): a robe cone, a head, a bun or a straw hat, a basket on
 *  some; NOINK Parts with their own outline, one group each (animate bobs and turns them a little). Colours muted. */
export const makeVillager = (K: import("../../../../kit/props/kit").Kit, seed: number, o: { robe: string; hat?: boolean; basket?: boolean; skin?: string; s?: number } ) => {
  const P = new Part(K), r = rng(seed), s = o.s ?? 1, skin = K.flat(o.skin ?? "#efc9a8", { rough: 0.8 }), robe = K.flat(o.robe, { rough: 0.85 });
  const hair = K.flat("#3a3238", { rough: 0.8 }), straw = K.flat("#d8bf7a", { rough: 0.85 }), wick = K.flat("#b8925a", { rough: 0.9 });
  P.add(robe, lathe([[0.0, 0.0], [0.26, 0.0], [0.24, 0.3], [0.2, 0.75], [0.16, 1.05], [0.1, 1.12], [0.0, 1.14]].map(([a, b]) => [a * s, b * s] as [number, number]), 14), 0.012);
  P.add(skin, new THREE.SphereGeometry(0.17 * s, 14, 10).translate(0, 1.27 * s, 0), 0.012);
  if (o.hat) P.add(straw, new THREE.ConeGeometry(0.34 * s, 0.16 * s, 16).translate(0, 1.47 * s, 0), 0.012);
  else P.add(hair, new THREE.SphereGeometry(0.08 * s, 10, 8).translate(0, 1.45 * s, -0.04 * s), 0.01);
  if (o.basket) P.add(wick, lathe([[0.0, 0.0], [0.14, 0.0], [0.17, 0.2], [0.0, 0.2]].reverse().map(([a, b]) => [a, b] as [number, number]).reverse(), 12).translate(0.27 * s, 0.62 * s, 0.05), 0.01);
  void r;
  const g = new THREE.Group(); P.into(g, "villager", { cast: true, receive: false });
  return g;
};
/** A CHICKEN (toon): a round body, a head with a red comb, a beak, a tail; its head group pecks (animate). Origin = the
 *  ground under it, facing +z. */
export const makeChicken = (K: import("../../../../kit/props/kit").Kit, white: boolean) => {
  const body = new Part(K), head = new Part(K);
  const feather = K.flat(white ? "#f1ece0" : "#b86a3a", { rough: 0.85 }), red = K.flat("#d23a32", { rough: 0.7 }), beak = K.flat("#e8b040", { rough: 0.6 }), leg = K.flat("#d8a040", { rough: 0.7 });
  body.add(feather, new THREE.SphereGeometry(0.15, 14, 10).scale(1, 0.85, 1.2).translate(0, 0.24, 0), 0.008);
  body.add(feather, new THREE.SphereGeometry(0.09, 10, 8).scale(0.6, 1.2, 0.9).rotateX(-0.6).translate(0, 0.34, -0.15), 0.008);
  for (const x of [-0.05, 0.05]) body.add(leg, new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6).translate(x, 0.07, 0.01), 0.005);
  head.add(feather, new THREE.SphereGeometry(0.07, 12, 9).translate(0, 0.0, 0.0), 0.008);
  head.add(red, new THREE.BoxGeometry(0.03, 0.06, 0.08).translate(0, 0.07, 0.0), 0.006);
  head.add(red, new THREE.SphereGeometry(0.025, 8, 6).translate(0, -0.06, 0.04), 0.005);
  head.add(beak, new THREE.ConeGeometry(0.025, 0.06, 8).rotateX(Math.PI / 2).translate(0, -0.005, 0.085), 0.005);
  const g = new THREE.Group(), hg = new THREE.Group();
  body.into(g, "chicken", { cast: true, receive: false }); head.into(hg, "chicken.head", { cast: true, receive: false });
  hg.position.set(0, 0.4, 0.14); g.add(hg);
  /** a pure function of t: the head pecks down every couple of seconds, the body turns a little */
  const animate = (t: number, ph: number) => {
    const c = ((t + ph) % 2.3) / 2.3, peck = c > 0.7 ? Math.sin(((c - 0.7) / 0.3) * Math.PI) : 0;
    hg.position.set(0, 0.4 - 0.2 * peck, 0.14 + 0.08 * peck); hg.rotation.x = 0.9 * peck;
    g.rotation.y = 0.35 * Math.sin((t + ph) * 0.45);
  };
  return { group: g, animate };
};

// =====================================================================================================================
// the painted panorama
// =====================================================================================================================
/** THE PANORAMA RING: an unlit painted cylinder (NOINK, never outlined) of radius R round (cx, cz) from y0 to y1; `fn`
 *  paints it on a W x H canvas whose u runs round the ring (u 0 = toward -z, increasing toward +x ... as seen from
 *  inside: the canvas reads left to right as you turn right) and v from y1 (top row) to y0. el(y) gives the elevation in
 *  degrees of a canvas row seen from an eye at height `eye` at the middle. az(px) = the bearing of a canvas column in
 *  degrees (0 = -z, 90 = +x, 180 = +z, 270 = -x). */
export type RingPaint = (g: G2, k: { W: number; H: number; el: (row: number) => number; row: (el: number) => number; az: (col: number) => number; col: (az: number) => number }) => void;
export const panoramaRing = (cx: number, cz: number, R: number, y0: number, y1: number, W: number, H: number, eye: number, fn: RingPaint) => {
  const el = (row: number) => (Math.atan2(y1 - ((row + 0.5) / H) * (y1 - y0) - eye, R) * 180) / Math.PI;
  const row = (e: number) => ((y1 - (eye + R * Math.tan((e * Math.PI) / 180))) / (y1 - y0)) * H;
  const az = (col: number) => (col / W) * 360, col = (a: number) => ((((a % 360) + 360) % 360) / 360) * W;
  const t = paint(W, H, (g) => fn(g, { W, H, el, row, az, col }));
  t.wrapS = THREE.RepeatWrapping;
  const geo = new THREE.CylinderGeometry(R, R, y1 - y0, 96, 1, true);
  // three's cylinder puts u = theta / 2 PI with theta from +z toward +x (seen from outside); the bearing (0 = -z, 90 = +x)
  // is 180 - theta, so u' = 0.5 - u reads the canvas left to right from inside; the texture repeats, so the seam (u'
  // 0.5 and -0.5 at +z) samples one column and no triangle spans the canvas
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setX(i, 0.5 - uv.getX(i));
  geo.translate(cx, (y0 + y1) / 2, cz);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.layers.set(NOINK); m.renderOrder = -60; m.name = "panorama"; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  return m;
};
/** a soft toon cloud on a painted canvas: flat-bottomed puffs with a pale blue underside */
export const cloudPuff = (g: G2, x: number, y: number, w: number, r: () => number, top = "#ffffff", under = "rgba(196,214,236,0.95)") => {
  // a flat-bottomed toon cloud: lobes of ellipses (no clip: no straight cut edges), a bluish underside a little lower
  const n = 5, h = w * 0.26;
  for (const [col, dy, k] of [[under, h * 0.12, 1.0], [top, -h * 0.06, 0.92]] as [string, number, number][]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < n; i++) { const u = i / (n - 1), rr = k * h * (0.5 + 0.5 * Math.sin(Math.PI * u) + 0.1 * r()); g.moveTo(x + w * (u - 0.5) + rr * 1.25, y + dy - rr * 0.35); g.ellipse(x + w * (u - 0.5), y + dy - rr * 0.35, rr * 1.25, rr * 0.85, 0, 0, 7); }
    g.fill();
  }
};
/** a ridge line of hills across a canvas: fill below a wavy crest (sum of sines) from row `base` with amplitude `amp` */
export const hillRange = (g: G2, W: number, H: number, base: number, amp: number, f: number, ph: number, col: string, wrap = true) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) {
    const u = (x / W) * Math.PI * 2, s = wrap ? Math.sin(u * f + ph) * 0.5 + Math.sin(u * f * 2 + ph * 1.7) * 0.3 + Math.sin(u * f * 5 + ph * 0.6) * 0.2 : 0;
    g.lineTo(x, base - amp * (0.5 + 0.5 * s));
  }
  g.lineTo(W, H); g.closePath(); g.fill();
};
export { mix };
