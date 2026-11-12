// THE OUTDOOR KIT of the Hongmen film: what every place outside the command tent is built from (sets/outdoor.ts):
// geometry helpers, canvas painters, the sky dome, the painted far card, the cloth banner, the flame, the light rig.
//
// Rules this kit keeps (each one comes from a rejected picture):
//   - FAR OR SMALL DETAIL IS PAINT, NOT GEOMETRY. The ink pass (vasa/ink.ts) draws a line wherever depth or surface
//     direction jumps; geometry thinner than about 3 px of a 1080-wide frame, near-coplanar faces, dense slats and
//     small gaps sparkle when the camera moves. So: log joints, planks, seams, spokes, far tents and hills are drawn
//     on a canvas. The far view of a place is ONE painted card on the NOINK layer (no outlines at all, so nothing
//     can crawl there); its own lines are painted, pale.
//   - Geometry is chunky and closed: parts overlap by a centimetre or stand clearly apart; nothing stands a few
//     centimetres proud of what it sits on; round bars are 9 cm or more across (two lines and a core) where a lens
//     sees them from 5 to 12 m.
//   - Everything is seeded: rng(seed) only. animate(t) of anything here is a pure function of t.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LIGHTS, type Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import { rng } from "../../arthur/sets/yard_paint";

export { rng, NOINK };
export type V3 = [number, number, number];
export type G2 = CanvasRenderingContext2D;
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// =====================================================================================================================
// colour
// =====================================================================================================================
export type RGB = [number, number, number];
export const hex = (h: string): RGB => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const css = (c: RGB | string, a = 1) => { const q = typeof c === "string" ? hex(c) : c; return `rgba(${clamp(q[0], 0, 255) | 0},${clamp(q[1], 0, 255) | 0},${clamp(q[2], 0, 255) | 0},${a.toFixed(3)})`; };
export const mix = (a: RGB | string, b: RGB | string, k: number): RGB => {
  const p = typeof a === "string" ? hex(a) : a, q = typeof b === "string" ? hex(b) : b;
  return [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
};
export const toHex = (c: RGB) => "#" + c.map((v) => (clamp(Math.round(v), 0, 255) | 0).toString(16).padStart(2, "0")).join("");
/** the film's two camps and the things both share (sRGB). Nothing darker than about #2b2530: the ink must stay the
 *  darkest thing in the picture. */
export const PAL = {
  // Xiang Yu: charcoal + deep purple, gold trim
  xWall: "#6a6180", xWallLo: "#575069", xRoof: "#4b3382", xRoofLo: "#3f2b70", xBanner: "#5b36a0", xDark: "#3a3448",
  // Liu Bang: red, on undyed cloth (red figures must not stand in front of a red wall)
  lWall: "#dcc8a0", lWallLo: "#c9b388", lRoof: "#b93a2e", lRoofLo: "#a23228", lBanner: "#c8362c", lDark: "#7a2a24",
  gold: "#e2b03a", cream: "#eadfb8", lacquer: "#34303c", lacquerRed: "#b5332b",
  wood: "#a57c4e", woodLo: "#8a6540", woodDark: "#6a4a32", log: "#b08a58", rope: "#d8c190", bronze: "#b98a3a", iron: "#4a4854",
  earth: "#cdb47e", earthHi: "#dcc794", earthLo: "#bfa56e", grass: "#aab06c", grassLo: "#93a05c",
  inkLine: "#2e2634",
};

// =====================================================================================================================
// canvas painting
// =====================================================================================================================
export const canvasOf = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
export const texOf = (c: HTMLCanvasElement, repeat = false) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** a painted texture: fn draws on a w x h canvas */
export const paint = (w: number, h: number, fn: (g: G2, w: number, h: number) => void, repeat = false) => {
  const c = canvasOf(w, h), g = c.getContext("2d")!;
  fn(g, w, h);
  return texOf(c, repeat);
};
export const FONT = `FrSans, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
/** a soft round blotch */
export const blotch = (g: G2, x: number, y: number, r: number, col: RGB | string, a: number) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, css(col, a)); gr.addColorStop(0.55, css(col, a * 0.62)); gr.addColorStop(1, css(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};
/** a closed polygon path */
export const poly = (g: G2, pts: [number, number][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
/** fill + an ink-like stroke of a polygon */
export const shape = (g: G2, pts: [number, number][], fill: string, line: string | null = null, lw = 2) => {
  poly(g, pts); g.fillStyle = fill; g.fill();
  if (line) { g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); }
};
/** a soft-edged fill: draws fn blurred by `px` (the canvas filter), for worn tracks and pools of light */
export const soft = (g: G2, px: number, fn: () => void) => { g.save(); g.filter = `blur(${px}px)`; fn(); g.restore(); };

/** plain cloth: a light neutral (tinted by the material colour) with soft uneven tone and faint hanging folds.
 *  seams = vertical seams per tile (painted lines, the widths of the cloth) */
export const clothTex = (seed: number, o: { seams?: number; folds?: number; size?: number; band?: [number, number, string][] } = {}) =>
  paint(o.size ?? 512, o.size ?? 512, (g, S) => {
    const r = rng(seed);
    g.fillStyle = "#e9e9e9"; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 22; i++) blotch(g, r() * S, r() * S, S * (0.1 + 0.16 * r()), [186, 186, 190], 0.2);
    const nf = o.folds ?? 6;
    for (let i = 0; i < nf; i++) {
      const x = S * ((i + 0.3 + 0.4 * r()) / nf), w = S * 0.045, gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.45, "rgba(255,255,255,0.2)"); gr.addColorStop(0.55, "rgba(150,150,160,0.16)"); gr.addColorStop(1, "rgba(150,150,160,0)");
      g.fillStyle = gr; g.fillRect(x - w, 0, 2 * w, S);
    }
    const ns = o.seams ?? 0;
    for (let i = 0; i < ns; i++) { const x = S * ((i + 0.5) / ns); g.fillStyle = "rgba(70,60,80,0.42)"; g.fillRect(x - S / 300, 0, S / 150, S); }
    for (const [y0, y1, col] of o.band ?? []) { g.fillStyle = col; g.fillRect(0, S * y0, S, S * (y1 - y0)); }
  }, true);

/** upright logs side by side (ONE LOG PER TILE across; the tile is `rows` logs... no: v runs the log's whole height):
 *  a round log's shading, a dark joint at each edge, a few knots and two lashings of rope across */
export const logsTex = (seed: number, ropes: number[] = [0.3, 0.72]) =>
  paint(512, 512, (g, S) => {
    const r = rng(seed), n = 4, bw = S / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * bw, k = 0.9 + 0.2 * r(), gr = g.createLinearGradient(x0, 0, x0 + bw, 0);
      const c = (v: number) => css([232 * k * v, 232 * k * v, 232 * k * v]);
      gr.addColorStop(0, c(0.7)); gr.addColorStop(0.18, c(0.93)); gr.addColorStop(0.5, c(1.05)); gr.addColorStop(0.82, c(0.9)); gr.addColorStop(1, c(0.66));
      g.fillStyle = gr; g.fillRect(x0, 0, bw + 1, S);
      g.strokeStyle = "rgba(110,90,70,0.3)"; g.lineWidth = 2.5;
      for (let q = 0; q < 3; q++) { const x = x0 + bw * (0.25 + 0.5 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.1 * (r() - 0.5), S * 0.3, x + bw * 0.1 * (r() - 0.5), S * 0.7, x, S); g.stroke(); }
      for (let q = 0; q < 2; q++) { const x = x0 + bw * (0.3 + 0.4 * r()), y = S * r(); g.fillStyle = "rgba(96,70,50,0.5)"; g.beginPath(); g.ellipse(x, y, bw * 0.07, bw * 0.12, 0, 0, 7); g.fill(); }
      g.fillStyle = "rgba(52,40,44,0.92)"; g.fillRect(x0 - 3, 0, 6, S);
    }
    g.fillStyle = "rgba(52,40,44,0.92)"; g.fillRect(S - 3, 0, 3, S);
    for (const y of ropes) {
      g.fillStyle = "#efe2bd"; g.fillRect(0, S * y - 9, S, 18);
      g.strokeStyle = "rgba(120,96,60,0.8)"; g.lineWidth = 2.5;
      for (let x = -20; x < S + 20; x += 13) { g.beginPath(); g.moveTo(x, S * y + 9); g.lineTo(x + 9, S * y - 9); g.stroke(); }
      g.fillStyle = "rgba(60,44,40,0.85)"; g.fillRect(0, S * y - 11, S, 2.5); g.fillRect(0, S * y + 8.5, S, 2.5);
    }
  }, true);

/** planks: n boards (upright, or lying when `lying`), dark joints, a little grain; a light neutral */
export const planksTex = (seed: number, n: number, lying = false, size = 256) =>
  paint(size, size, (g, S) => {
    const r = rng(seed), bw = S / n;
    if (lying) { g.translate(S, 0); g.rotate(Math.PI / 2); }
    for (let i = 0; i < n; i++) {
      const v = 214 + 30 * r(); g.fillStyle = css([v, v, v]); g.fillRect(i * bw, 0, bw + 1, S);
      g.strokeStyle = "rgba(130,110,90,0.3)"; g.lineWidth = Math.max(1.5, S / 170);
      for (let k = 0; k < 2; k++) { const x = i * bw + bw * (0.2 + 0.6 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.14 * (r() - 0.5), S * 0.33, x + bw * 0.14 * (r() - 0.5), S * 0.66, x, S); g.stroke(); }
      g.fillStyle = "rgba(70,54,50,0.9)"; g.fillRect(i * bw - S / 128, 0, S / 64, S);
    }
    g.fillStyle = "rgba(70,54,50,0.9)"; g.fillRect(S - S / 128, 0, S / 128, S);
  }, true);

/** a hanging banner: a field, a border line, a big character; drawn 1 : `ratio` (w : h). No dags here: the banner's
 *  geometry cuts them. */
export const bannerTex = (o: { field: string; border: string; ch: string; chCol: string; ratio: number; disc?: string; chY?: number; dags?: number }) =>
  paint(256, Math.round(256 * o.ratio), (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, css(mix(o.field, "#000000", 0.1))); gr.addColorStop(0.5, o.field); gr.addColorStop(1, css(mix(o.field, "#000000", 0.14)));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = o.border; g.lineWidth = W * 0.06; g.strokeRect(W * 0.08, W * 0.08, W * 0.84, H - W * 0.16);
    const cy = H * (o.chY ?? 0.4), R = W * 0.33;
    if (o.disc) { g.fillStyle = o.disc; g.beginPath(); g.arc(W / 2, cy, R, 0, 7); g.fill(); }
    g.fillStyle = o.chCol; g.font = `700 ${Math.round(W * 0.5)}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.ch, W / 2, cy + W * 0.03);
    // the cloth's OUTLINE is paint (makeBanner's cloth is on the NOINK layer: an ink line on a swaying, nearly upright
    // edge crawls in whole-pixel steps): round the top and the sides, and along the dags of makeBanner's lower edge
    const lw = W * 0.018, n = (o.dags ?? 3) * 2, tail = W * 0.22;
    g.strokeStyle = PAL.inkLine; g.lineJoin = "miter"; g.lineWidth = 2 * lw; g.strokeRect(0, 0, W, H + 4 * lw);
    if (n > 0) { g.lineWidth = 2.4 * lw; g.beginPath(); for (let i = 0; i <= n; i++) { const x = (i / n) * W, y = i % 2 === 0 ? H - tail : H; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
  });

// =====================================================================================================================
// geometry
// =====================================================================================================================
/** static pieces collected per material, merged into one mesh each (one draw call per material and pass) */
export class Batch {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  tris = 0;
  add(mat: THREE.Material, g: THREE.BufferGeometry) {
    const q = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") q.deleteAttribute(k);
    if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2));
    if (!q.attributes.normal) q.computeVertexNormals();
    q.clearGroups();
    let l = this.map.get(mat); if (!l) this.map.set(mat, (l = []));
    l.push(q);
    return this;
  }
  flush(into: THREE.Object3D, name: string, cast = true, receive = true) {
    for (const [mat, list] of this.map) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = cast; m.receiveShadow = receive; m.name = name;
      this.tris += m.geometry.attributes.position.count / 3;
      into.add(m);
    }
    this.map.clear();
  }
}
export const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a box turned about y, centred at (x, y, z) */
export const boxR = (w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rz = 0, rx = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rz) g.rotateZ(rz); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry);
  return g.translate(x, y, z);
};
const _up = V(0, 1, 0), _q = new THREE.Quaternion();
/** a round bar from a to b */
export const limb = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra, seg = 10) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  g.applyQuaternion(_q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** multiplies a geometry's uv (a texture then repeats u x v times over each face) */
export const tile = <T extends THREE.BufferGeometry>(g: T, u: number, v: number): T => {
  const a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * u, a.getY(i) * v);
  return g;
};
/** uv = (x, y) of the position mapped from the box [x0, x1] x [y0, y1] to [0, 1]: a front-facing piece shows exactly
 *  that part of a texture */
export const uvXY = <T extends THREE.BufferGeometry>(g: T, x0: number, x1: number, y0: number, y1: number): T => {
  const p = g.attributes.position as THREE.BufferAttribute, a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXY(i, (p.getX(i) - x0) / (x1 - x0), (p.getY(i) - y0) / (y1 - y0));
  return g;
};
/** a flat-shaded solid from quads / triangles given as vertex lists (counter-clockwise seen from outside); uv per
 *  face: its own bounding box mapped to [0, 1] along the face's longest horizontal direction and up */
export const facesG = (faces: THREE.Vector3[][]) => {
  const pos: number[] = [], uv: number[] = [], nor: number[] = [];
  for (const f of faces) {
    const n = f[1].clone().sub(f[0]).cross(f[2].clone().sub(f[0])).normalize();
    // the face's own axes: u = horizontal in the face, v = up the face
    const u = Math.abs(n.y) > 0.999 ? V(1, 0, 0) : V(0, 1, 0).cross(n).normalize(), v = n.clone().cross(u).normalize();
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    for (const p of f) { const a = p.dot(u), b = p.dot(v); u0 = Math.min(u0, a); u1 = Math.max(u1, a); v0 = Math.min(v0, b); v1 = Math.max(v1, b); }
    const put = (p: THREE.Vector3) => { pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); uv.push((p.dot(u) - u0) / Math.max(u1 - u0, 1e-6), (p.dot(v) - v0) / Math.max(v1 - v0, 1e-6)); };
    for (let i = 1; i < f.length - 1; i++) { put(f[0]); put(f[i]); put(f[i + 1]); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
};
/** a hip roof over the rectangle x0..x1, z0..z1 at height y0, its ridge at height y1 running along x between rx0
 *  and rx1 at z = rz: four slopes (closed underneath). Returns [front slope (toward +z), the other three + bottom]. */
export const hipRoofG = (x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, rx0: number, rx1: number, rz: number) => {
  const a = V(x0, y0, z1), b = V(x1, y0, z1), c = V(x1, y0, z0), d = V(x0, y0, z0), e = V(rx0, y1, rz), f = V(rx1, y1, rz);
  return { front: facesG([[a, b, f, e]]), rest: facesG([[b, c, f], [c, d, e, f], [d, a, e], [a, d, c, b]]) };
};
/** an (x, y) outline extruded from z0 to z1 (closed solid; its front and back faces carry uv = the outline's own x, y
 *  in metres: scale it with a repeating texture's `repeat`) */
export const extrudeXY = (pts: [number, number][], z0: number, z1: number) =>
  new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: z1 - z0, bevelEnabled: false }).translate(0, 0, z0);
/** a box whose FRONT (+z) and back faces show `face` and whose other four sides show `side`: a plaque, a painted
 *  panel. One mesh, two materials (no second surface a hair in front of the first). */
export const faceBox = (w: number, h: number, d: number, face: THREE.Material, side: THREE.Material, backFace: THREE.Material = side) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, face, backFace]);
  m.castShadow = m.receiveShadow = true;
  return m;
};

// =====================================================================================================================
// sky, far card, ground
// =====================================================================================================================
export type SkyStops = [number, string][];
/** the sky's colour at an elevation (degrees) */
export const skyAt = (stops: SkyStops, el: number): RGB => {
  if (el <= stops[0][0]) return hex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) if (el <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (el - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return hex(stops[stops.length - 1][1]);
};
/** a sky dome round `at`: an unlit gradient by elevation, behind everything, never outlined */
export const skyDome = (at: THREE.Vector3, stops: SkyStops, extra?: (g: G2, W: number, H: number) => void) => {
  const t = paint(extra ? 2048 : 8, 1024, (g, W, H) => {
    for (let y = 0; y < H; y++) { const el = 90 - (180 * (y + 0.5)) / H; g.fillStyle = css(skyAt(stops, el)); g.fillRect(0, y, W, 1); }
    extra?.(g, W, H);
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, depthWrite: false, fog: false }));
  m.position.copy(at); m.layers.set(NOINK); m.renderOrder = -100; m.name = "sky"; m.frustumCulled = false;
  return m;
};
/** THE FAR VIEW: one painted card (unlit, NOINK: the ink pass does not see it, so nothing on it can flicker). It
 *  stands at z, from x0 to x1 and y0 to y1; `fn` paints it on a W x H canvas whose pixel (0, 0) is the card's upper
 *  left. `px(x), py(y)` in fn turn world metres ON THE CARD into pixels. */
export type CardPaint = (g: G2, k: { W: number; H: number; px: (x: number) => number; py: (y: number) => number; s: number }) => void;
export const farCard = (x0: number, x1: number, y0: number, y1: number, z: number, W: number, H: number, fn: CardPaint) => {
  const t = paint(W, H, (g) => fn(g, { W, H, px: (x) => ((x - x0) / (x1 - x0)) * W, py: (y) => (1 - (y - y0) / (y1 - y0)) * H, s: W / (x1 - x0) }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0).translate((x0 + x1) / 2, (y0 + y1) / 2, z), new THREE.MeshBasicMaterial({ map: t, fog: false }));
  m.layers.set(NOINK); m.name = "far"; m.renderOrder = -50;
  return m;
};
/** THE GROUND: one big flat mesh (y = 0) whose texture covers the square of `size` metres round (cx, cz) and whose
 *  edge colour runs on to the horizon. `fn` paints that square: `px(x), pz(z)` turn world metres into pixels. PAINT
 *  THE BORDER PIXELS ONE PLAIN COLOUR (the fill does: draw nothing within 2 % of the edges). */
export type GroundPaint = (g: G2, k: { S: number; px: (x: number) => number; pz: (z: number) => number; s: number }) => void;
export const groundG = (cx: number, cz: number, size: number, reach = 420) => {
  const g = new THREE.PlaneGeometry(2 * reach, 2 * reach, 1, 1).rotateX(-Math.PI / 2).translate(cx, 0, cz);
  const p = g.attributes.position as THREE.BufferAttribute, a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXY(i, (p.getX(i) - cx) / size + 0.5, 0.5 - (p.getZ(i) - cz) / size);
  return g;
};
export const groundTex = (cx: number, cz: number, size: number, S: number, base: string, fn: GroundPaint) =>
  paint(S, S, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    g.save(); g.beginPath(); g.rect(S * 0.02, S * 0.02, S * 0.96, S * 0.96); g.clip();
    fn(g, { S, px: (x) => ((x - cx) / size + 0.5) * S, pz: (z) => ((z - cz) / size + 0.5) * S, s: S / size });
    g.restore();
  });
/** soft uneven tone for a ground: light and dark blotches inside the texture's safe area */
export const mottle = (g: G2, S: number, seed: number, hi: string, lo: string, n = 60, a = 0.16) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) blotch(g, S * (0.08 + 0.84 * r()), S * (0.08 + 0.84 * r()), S * (0.03 + 0.07 * r()), r() < 0.5 ? hi : lo, a * (0.6 + 0.6 * r()));
};

// =====================================================================================================================
// light
// =====================================================================================================================
/** the three lights EVERY place of the film has (sets/index.ts, the contract): a shadowed key toward `dir` over a
 *  square of +-half metres round `at`, a hemisphere, a point light (intensity 0 unless given) */
export const lightRig = (g: THREE.Object3D, o: { dir: V3; k: number; col: string; at: V3; half: number; hemi: [string, string, number]; point?: { col: string; k: number; at: V3; dist: number } }) => {
  const key = new THREE.DirectionalLight(o.col, o.k), d = V(...o.dir).normalize(), at = V(...o.at);
  key.position.copy(at).addScaledVector(d, 30); key.target.position.copy(at);
  key.castShadow = true; key.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  key.shadow.radius = LIGHTS.shadow.radius; key.shadow.bias = LIGHTS.shadow.bias; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -o.half, right: o.half, bottom: -o.half, top: o.half, near: 1, far: 80 }); key.shadow.camera.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight(o.hemi[0], o.hemi[1], o.hemi[2]);
  const p = o.point, point = new THREE.PointLight(p?.col ?? "#ffffff", p?.k ?? 0, p?.dist ?? 4, 2);
  point.position.set(...(p?.at ?? o.at));
  g.add(key, key.target, hemi, point);
  return { key, hemi, point };
};
export const SUN_DIR: V3 = [-0.4997, 0.5496, 0.6695];

// =====================================================================================================================
// things
// =====================================================================================================================
export type Animated = { animate(t: number): void };
/** A HANGING BANNER (幡): a cloth w x h hanging from its top edge (the origin is the middle of the top edge, the
 *  cloth hangs down -y and faces +z), `dags` pointed tails cut into its lower edge. It sways a little: animate(t)
 *  rewrites the cloth as a pure function of t. Lit, double-sided, casts a shadow, NOT outlined by the ink pass (the
 *  outline is painted in bannerTex). */
export const makeBanner = (mat: THREE.Material, w: number, h: number, o: { dags?: number; tail?: number; amp?: number; ph?: number } = {}) => {
  const dags = o.dags ?? 3, tail = o.tail ?? w * 0.22, amp = o.amp ?? 0.05, ph = o.ph ?? 0, nx = dags * 2, ny = 7;
  const g = new THREE.PlaneGeometry(w, h, nx, ny).translate(0, -h / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute, base = new Float32Array(p.array.length);
  // the lowest row: every second vertex stays up by `tail` (the dags); uv follows so that the picture is not squeezed
  for (let i = 0; i < p.count; i++) {
    const col = i % (nx + 1), row = Math.floor(i / (nx + 1));
    if (row === ny && col % 2 === 0 && dags > 0) { p.setY(i, p.getY(i) + tail); uv.setY(i, uv.getY(i) + tail / h); }
  }
  base.set(p.array as Float32Array);
  const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = "banner"; mesh.layers.set(NOINK);   // (its outline is painted: bannerTex)
  const animate = (t: number) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], k = Math.pow(clamp(-y / h), 1.4);
      const s = Math.sin(t * 1.5 + ph + k * 2.4 + x * 1.2) + 0.45 * Math.sin(t * 2.7 + ph * 1.7 + k * 4.1);
      p.setXYZ(i, x + amp * 0.35 * k * Math.sin(t * 1.1 + ph), y, amp * k * s);
    }
    p.needsUpdate = true; g.computeVertexNormals();
  };
  animate(0);
  return { mesh, animate };
};
/** A FLAME: three nested tongues (unlit, NOINK; their colours stay under 1 so that the tone mapping keeps them
 *  orange instead of bleaching them; the halo is a glowCard BEHIND the flame). The
 *  origin is the fire's base. size = the flame's height in metres. animate(t): a slow lick, sums of sines only. */
export const makeFlame = (size: number, ph = 0) => {
  const group = new THREE.Group(); group.name = "flame";
  const tongue = (r: number, h: number, col: THREE.Color, z: number) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(new THREE.Vector2(r * Math.sin(Math.PI * Math.pow(u, 0.62)) * (1 - 0.25 * u), h * u)); }
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), new THREE.MeshBasicMaterial({ color: col, fog: false }));
    m.position.z = z; m.layers.set(NOINK); group.add(m);
    return m;
  };
  const a = tongue(0.36 * size, size, new THREE.Color(0.92, 0.2, 0.02), 0), b = tongue(0.25 * size, 0.72 * size, new THREE.Color(1.0, 0.5, 0.05), 0.2 * size), c = tongue(0.13 * size, 0.42 * size, new THREE.Color(1.0, 0.86, 0.36), 0.42 * size);
  const animate = (t: number) => {
    const k = 1 + 0.07 * Math.sin(t * 6.1 + ph) + 0.04 * Math.sin(t * 10.3 + 1.7 * ph), q = 1 + 0.06 * Math.sin(t * 7.3 + 1 + ph) + 0.04 * Math.sin(t * 12.1 + ph);
    a.scale.set(1 / Math.sqrt(k), k, 1); b.scale.set(1 / Math.sqrt(q), q, 1); c.scale.set(1, 1 + 0.08 * Math.sin(t * 9.1 + ph), 1);
    a.rotation.z = 0.05 * Math.sin(t * 3.3 + ph); b.rotation.z = -0.07 * Math.sin(t * 4.1 + ph);
  };
  animate(0);
  return { group, animate, /** 1 +- 0.06: the fire's light follows it */ level: (t: number) => 1 + 0.05 * Math.sin(t * 6.1 + ph) + 0.03 * Math.sin(t * 10.3 + 1.7 * ph) };
};
/** a soft round glow (an additive card on NOINK, facing +z): the halo round a flame, a moon's haze */
export const glowCard = (r: number, col: string, a: number) => {
  const t = paint(128, 128, (g, S) => {
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, css(col, 1)); gr.addColorStop(0.35, css(col, 0.5)); gr.addColorStop(1, css(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * r, 2 * r), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.layers.set(NOINK); m.name = "glow"; m.renderOrder = 5;
  return m;
};
/** a bronze fire basket on three legs (庭燎): the basket's rim at height h, radius r, round the floor point (0, 0, 0).
 *  Chunky on purpose (legs 9 cm). Returns the geometry in two materials. */
export const fireBasketG = (h: number, r: number) => {
  const legs: THREE.BufferGeometry[] = [];
  for (const a of [Math.PI / 2, Math.PI / 2 + 2.094, Math.PI / 2 + 4.189]) legs.push(limb(V(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * 1.25), V(Math.cos(a) * r * 0.55, h - 0.16, Math.sin(a) * r * 0.55), 0.045, 0.045, 8));
  const bowl = new THREE.LatheGeometry([[0.02, h - 0.24], [r * 0.6, h - 0.22], [r * 0.95, h - 0.08], [r, h], [r * 0.86, h], [r * 0.8, h - 0.06], [0.02, h - 0.1]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
  return { legs: mergeGeometries(legs.map((q) => q.toNonIndexed()), false), bowl };
};
/** a material from bt/pbr: flat paint with an optional map */
export const flatOf = (M: Mats) => (color: string, map: THREE.Texture | null = null, rough = 0.9, side: THREE.Side = THREE.FrontSide) => M.paint({ color, map, roughness: rough, side });
