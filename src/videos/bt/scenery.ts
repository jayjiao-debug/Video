// Code-built far scenery for the backtest (replaces the AI-painted island plate, enemy-ship card and cloud cards):
//   seaStacks()            tall pink-tan sea stacks (strata, cracks, moss ledges, foliage crowns, an arch, a waterfall
//                          with foam, base bushes, a palm, a hazy mountain and a mist band at the waterline)
//   galleon()              the enemy ship: near-black hull, red gun-deck stripe with ports and guns, three masts with
//                          billowed cream square sails, yards, rigging, a black skull flag
//   cloudCluster(seed, w)  a cluster of soft round puffs (white tops, lavender undersides, flat bottom), 4 shape families
//   cloudField(center)     the shot's set of clusters laid out round the horizon (convenience)
//   animate(t)             waterfall scroll, mist billows, flag wave (all on one shared uniform)
// Everything is self-lit with small ShaderMaterials (own key light from the upper left like the reference, smooth toon
// ramps, crevice AO baked per vertex, a dark contour on round blobs) and hazed toward the film's sky-dome colour in the
// same direction, so it needs no scene lights and sits in the backdrop without ink outlines (all meshes on NOINK).
// Colours are designed in display (sRGB) space and written as pow(c, 2.2) like the film's sea and dome: the film renders
// to a linear target and tone-maps later; the standard tonemapping/colorspace chunks keep a direct render correct too.
// Deterministic: seeded RNG only, canvases drawn in code, no image files.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NOINK } from "../vasa/ink";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const sstep = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** mulberry32: deterministic [0,1) stream */
export const rng = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
/** polar placement round the deck: azimuth deg from +x toward +z (screen right when looking down +x) */
const polar = (azDeg: number, d: number, y = 0) => V(d * Math.cos(azDeg * D2R), y, d * Math.sin(azDeg * D2R));

// ---------------------------------------------------------------- shared shading
/** shared uniforms: time and the scenery key light (from upper left, in front: lit left faces, lavender right faces) */
export const SCENERY = {
  uT: { value: 0 },
  uLight: { value: V(-0.3, 0.5, -0.81).normalize() },
  /** render size in pixels (keeps the galleon's rigging ribbons at a constant ~1.5 px width) */
  uRes: { value: new THREE.Vector2(1080, 1920) },
};
const SKY = /* glsl */ `
vec3 s3(float r, float g, float b){ return vec3(r, g, b) / 255.0; }
// the film's sky dome gradient (BtCannon.tsx), display space, by view direction
vec3 skyAt(vec3 d){
  float e = degrees(asin(clamp(d.y, -1.0, 1.0)));
  vec3 c = mix(s3(150.,214.,214.), s3(248.,226.,204.), smoothstep(-1.6, 0.0, e));
  if (e > 0.0) {
    c = mix(s3(250.,222.,190.), s3(250.,236.,218.), smoothstep(0.0, 2.5, e));
    c = mix(c, s3(234.,240.,246.), smoothstep(2.5, 5.0, e));
    c = mix(c, s3(178.,214.,246.), smoothstep(5.0, 10.0, e));
    c = mix(c, s3(128.,188.,240.), smoothstep(10.0, 18.0, e));
    c = mix(c, s3(90.,163.,232.), smoothstep(18.0, 30.0, e));
    c = mix(c, s3(66.,142.,224.), smoothstep(30.0, 55.0, e)); }
  return c; }
`;
const FRAG_HEAD = /* glsl */ `
uniform vec3 uLight; uniform float uT;
varying vec3 vW; varying vec3 vN; varying vec2 vUv; varying float vH;
${SKY}
vec3 viewDir(){ return normalize(vW - cameraPosition); }
vec3 faceN(){ vec3 n = normalize(vN); return gl_FrontFacing ? n : -n; }
// mist: lighter, cooler toward the waterline (vH = height above the sea in the object's space)
vec3 mistMix(vec3 c, float h, float mistH, float k){
  vec3 sky = skyAt(viewDir());
  float m = 1.0 - smoothstep(0.0, mistH, h);
  return mix(c, mix(sky, vec3(0.97, 0.985, 0.985), 0.55), m * m * k); }
void emit(vec3 c, float a){
  gl_FragColor = vec4(pow(max(c, vec3(0.0)), vec3(2.2)), a);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;
const VERT_HEAD = /* glsl */ `
uniform float uT;
varying vec3 vW; varying vec3 vN; varying vec2 vUv; varying float vH;
`;
const VERT_BODY = /* glsl */ `
  vUv = uv; vH = p.y;
  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * w;
`;
const vert = (decl: string, pre = "") => `${VERT_HEAD}${decl}
void main(){ vec3 p = position; vec3 n = normal; ${pre}
${VERT_BODY} }`;

/** display-space colour straight from the hex (no sRGB->linear conversion: the shader works in display space) */
const rawColor = (hex: string) => { const n = parseInt(hex.slice(1), 16); return V(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const mat = (vs: string, fs: string, uniforms: Record<string, THREE.IUniform>, o: Partial<THREE.ShaderMaterialParameters> = {}) =>
  new THREE.ShaderMaterial({
    uniforms: { uLight: SCENERY.uLight, uT: SCENERY.uT, ...uniforms },
    vertexShader: vs, fragmentShader: `${FRAG_HEAD}\n${fs}`, side: THREE.DoubleSide, fog: false, ...o,
  });

/** rock: canvas albedo, crisp-soft terminator, lavender shade, darker overhang undersides, haze + base mist */
const rockMat = (map: THREE.Texture, haze: number, mistH: number) => mat(vert("attribute vec3 aRad; varying vec3 vRad;", "vRad = mat3(modelMatrix) * aRad;"), /* glsl */ `
uniform sampler2D uMap; uniform float uHaze; uniform float uMistH; varying vec3 vRad;
void main(){
  vec3 N = faceN(); vec3 alb = texture2D(uMap, vUv).rgb;
  // walls: the facet normal (broad vertical planes) eased toward the smooth radial one so facet seams stay soft
  float rl = dot(vRad, vRad);
  float wallK = (1.0 - smoothstep(0.45, 0.75, abs(N.y))) * step(0.01, rl);
  if (wallK > 0.0) N = normalize(mix(N, normalize(vRad * inversesqrt(rl) + N * 0.9), wallK * 0.45));
  float nl = dot(N, uLight);
  float lit = smoothstep(-0.1, 0.2, nl);
  vec3 cl = alb * (0.86 + 0.2 * smoothstep(0.25, 0.85, nl));
  vec3 cs = alb * vec3(0.47, 0.6, 0.9) + vec3(0.0, 0.02, 0.07);
  cs *= 1.0 - 0.3 * smoothstep(0.35, 0.95, -N.y);
  cs *= 1.0 - 0.1 * smoothstep(-0.1, -0.6, nl);
  vec3 c = mix(cs, cl, lit);
  c = mix(c, skyAt(viewDir()), uHaze);
  emit(mistMix(c, vH, uMistH, 0.92), 1.0); }`, { uMap: { value: map }, uHaze: { value: haze }, uMistH: { value: mistH } });

/** inverted-hull outline: flat ink colour, hazed like its object; draw only the shell's far faces (side depends on winding) */
const lineMat = (hex: string, haze: number, mistH: number, side: THREE.Side = THREE.FrontSide) => mat(vert(""), /* glsl */ `
uniform vec3 uColor; uniform float uHaze; uniform float uMistH;
void main(){ vec3 c = mix(uColor, skyAt(viewDir()), uHaze); if (uMistH > 0.0) c = mistMix(c, vH, uMistH, 0.95); emit(c, 1.0); }`,
  { uColor: { value: rawColor(hex) }, uHaze: { value: haze }, uMistH: { value: mistH } },
  { side, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 8 }); // coplanar ledge rings lose to the rock
const NOISE = /* glsl */ `
float h3(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }
`;
/** foliage: dark teal-green mass with olive leaf highlights. The shading normal is half the soft-union blob normal, half
 *  the crown's mass normal (aMass), so a crown lights as one form; value noise adds leaf clumps and small dark gaps;
 *  baked AO (with darker undersides) and a soft dark contour on the outer silhouette only */
const leafMat = (haze: number, mistH: number) => mat(vert("attribute float aAo; attribute float aTint; attribute vec3 aMass; varying float vAo; varying float vTint; varying vec3 vMass;", "vAo = aAo; vTint = aTint; vMass = mat3(modelMatrix) * aMass;"), /* glsl */ `
uniform float uHaze; uniform float uMistH; varying float vAo; varying float vTint; varying vec3 vMass;
${NOISE}
void main(){
  vec3 N0 = faceN(); vec3 Vv = -viewDir();
  vec3 N = normalize(mix(N0, normalize(vMass), 0.5));
  float nl = dot(N, uLight), nv = abs(dot(N0, Vv));
  vec3 dk = vec3(0.16, 0.29, 0.28), md = vec3(0.27, 0.46, 0.38) * (1.0 + 0.08 * vTint), lt = vec3(0.53, 0.65, 0.43) * (1.0 + 0.05 * vTint);
  float lf = vnoise(vW * 0.5) * 0.55 + vnoise(vW * 1.1 + 7.3) * 0.45;
  vec3 c = mix(dk, md, smoothstep(-0.3, 0.3, nl));
  c = mix(c, lt, smoothstep(0.42, 0.8, nl + (lf - 0.5) * 0.4) * 0.9);
  c *= mix(1.0, 0.9, smoothstep(0.32, 0.22, lf));
  c *= mix(0.62, 1.0, vAo);
  c = mix(c, dk * 0.75, (1.0 - smoothstep(0.05, 0.25, nv)) * 0.6);
  c = mix(c, skyAt(viewDir()), uHaze);
  emit(mistMix(c, vH, uMistH, 0.7), 1.0); }`, { uHaze: { value: haze }, uMistH: { value: mistH } });

/** clouds: soft wrap shading white -> lavender, pink-lavender flat bottom, baked AO between puffs, light rim, haze */
const cloudMat = (hazeK: number, white = false) => mat(vert("attribute float aAo; attribute float aH; varying float vAo; varying float vH01;", "vAo = aAo; vH01 = aH;"), /* glsl */ `
uniform float uHazeK; uniform float uWhite; varying float vAo; varying float vH01;
void main(){
  vec3 N = faceN(); vec3 d = viewDir();
  float nl = dot(N, uLight), nv = abs(dot(N, -d));
  vec3 lav = mix(vec3(0.76, 0.77, 0.94), vec3(0.86, 0.9, 0.97), uWhite), wht = vec3(1.0, 1.0, 0.995);
  float k = smoothstep(-0.45, 0.55, nl);
  vec3 c = mix(lav, wht, k);
  c = mix(c, vec3(0.93, 0.85, 0.92), (1.0 - smoothstep(0.0, 0.3, vH01)) * 0.4 * (1.0 - k) * (1.0 - uWhite));
  c = mix(c, lav * 0.95, smoothstep(0.35, 0.95, -N.y) * 0.55);
  c *= mix(0.8, 1.0, vAo);
  c = mix(c, mix(c, wht, 0.35), (1.0 - smoothstep(0.0, 0.4, nv)) * k);
  c *= 1.0 + 0.1 * smoothstep(0.3, 0.9, nl);
  float e = degrees(asin(clamp(d.y, -1.0, 1.0)));
  c = mix(c, skyAt(d), uHazeK * (1.0 - smoothstep(1.5, 16.0, e)));
  emit(c, 1.0); }`, { uHazeK: { value: hazeK }, uWhite: { value: white ? 1 : 0 } });

/** painted parts (hull, sails, spars, trunks): albedo colour x optional map, soft toon terminator, own shade colour */
type PaintOpts = { map?: THREE.Texture; shade?: [number, number, number]; soft?: number; haze?: number; mistH?: number; flat?: boolean; vs?: string };
const paint = (hex: string, o: PaintOpts = {}) => {
  return mat(o.vs ?? vert(""), /* glsl */ `
uniform sampler2D uMap; uniform float uUseMap; uniform vec3 uColor; uniform vec3 uShade; uniform float uSoft; uniform float uHaze; uniform float uMistH; uniform float uFlat;
void main(){
  vec3 N = faceN(); vec3 alb = uColor; if (uUseMap > 0.5) { vec4 t = texture2D(uMap, vUv); alb *= t.rgb; }
  float nl = dot(N, uLight);
  float lit = smoothstep(-uSoft, uSoft, nl);
  vec3 c = mix(alb * uShade, alb * (0.9 + 0.14 * smoothstep(0.2, 0.9, nl)), lit);
  c = mix(c, alb, uFlat);
  c = mix(c, skyAt(viewDir()), uHaze);
  if (uMistH > 0.0) c = mistMix(c, vH, uMistH, 0.9);
  emit(c, 1.0); }`, {
    uMap: { value: o.map ?? null }, uUseMap: { value: o.map ? 1 : 0 }, uColor: { value: rawColor(hex) },
    uShade: { value: V(...(o.shade ?? [0.6, 0.58, 0.8])) }, uSoft: { value: o.soft ?? 0.2 }, uHaze: { value: o.haze ?? 0 },
    uMistH: { value: o.mistH ?? 0 }, uFlat: { value: o.flat ? 1 : 0 },
  });
};

// ---------------------------------------------------------------- canvas helpers
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, wrapS = true, wrapT = false) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; // values are display-space; shaders treat them as such
  t.anisotropy = 8;
  if (wrapS) t.wrapS = THREE.RepeatWrapping;
  if (wrapT) t.wrapT = THREE.RepeatWrapping;
  return t;
};
const rgba = (r: number, g: number, b: number, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;

/** rock albedo, u once round the pillar, v = height (0 sea, 1 top). Per band: broad vertical tone planes (one hard
 *  wobbly edge, fading out on the other side), a few long bold tapered cracks with a light bevel, sparse grain. Then per
 *  ledge: a thin dark line with a soft cast shadow, patchy olive moss (about 40 % cover) and a few big hanging V-clumps,
 *  both biased to the lit side by `lit(u)`; on the top band a dark contact shadow under the crown and thin vines. */
type RockOpts = { W?: number; H?: number; moss?: number; lit?: (u: number) => number; crown?: boolean };
const rockTex = (seed: number, bounds: number[], o: RockOpts = {}) => {
  const W = o.W ?? 1024, H = o.H ?? 1024, moss = o.moss ?? 1, lit = o.lit ?? (() => 0.6), sx = W / 1024, sy = H / 1024;
  return canvasTex(W, H, (g) => {
    const r = rng(seed);
    g.fillStyle = "#e5ae8c"; g.fillRect(0, 0, W, H);
    const edges = [0, ...bounds, 1];
    const wrap = (draw: (ox: number) => void) => { for (const ox of [-W, 0, W]) draw(ox); };
    const path = (pts: [number, number][], ox: number) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + ox, y) : g.moveTo(x + ox, y))); };
    const poly = (pts: [number, number][], style: string | CanvasGradient) => { g.fillStyle = style; wrap((ox) => { path(pts, ox); g.closePath(); g.fill(); }); };
    const line = (pts: [number, number][], style: string, lw: number) => { g.strokeStyle = style; g.lineWidth = lw; g.lineJoin = "round"; g.lineCap = "round"; wrap((ox) => { path(pts, ox); g.stroke(); }); };
    const pickX = (bias: number) => { for (let t = 0; t < 16; t++) { const x = r() * W; if (r() < 1 - bias + bias * lit(x / W)) return x; } return r() * W; };
    const band = (k: number) => { const y0 = (1 - edges[k + 1]) * H, y1 = (1 - edges[k]) * H; return { y0, y1, bh: y1 - y0 }; };
    // pass 1: rock surface per band
    for (let k = 0; k < edges.length - 1; k++) {
      const { y0, y1, bh } = band(k);
      g.fillStyle = r() < 0.5 ? rgba(220, 150, 116, 0.1 + 0.15 * r()) : rgba(246, 208, 170, 0.1 + 0.18 * r()); g.fillRect(0, y0, W, bh);
      const np = 3 + Math.floor(r() * 3);
      for (let i = 0; i < np; i++) {
        const x = r() * W, w = (70 + 170 * r()) * sx, kind = r(), hardL = r() < 0.5;
        const [cr, cg, cb, a] = kind < 0.42 ? [252, 222, 190, 0.3 + 0.15 * r()] : kind < 0.78 ? [204, 132, 106, 0.2 + 0.14 * r()] : [166, 116, 150, 0.14 + 0.1 * r()];
        const ya = y0 + (r() < 0.6 ? 0 : r() * bh * 0.3), yb = y1 - (r() < 0.6 ? 0 : r() * bh * 0.3);
        const xh = hardL ? x : x + w, xs = hardL ? x + w : x;
        const gr = g.createLinearGradient(xh, 0, xs, 0);
        gr.addColorStop(0, rgba(cr, cg, cb, a)); gr.addColorStop(0.55, rgba(cr, cg, cb, a * 0.55)); gr.addColorStop(1, rgba(cr, cg, cb, 0));
        const edge: [number, number][] = []; let xx = xh;
        for (let y = ya; y <= yb; y += 9 * sy) { edge.push([xx, y]); xx += (r() - 0.5) * 3 * sx; }
        poly([...edge, [xs, yb], [xs, ya]], gr);
        if (r() < 0.5) line(edge, rgba(150, 92, 100, 0.2), 1.5);
      }
      for (let i = 0; i < 6; i++) { // sparse grain
        const x = r() * W, ys = y0 + r() * bh * 0.4, ye = ys + (0.3 + 0.6 * r()) * (y1 - ys);
        const pts: [number, number][] = []; let xx = x; for (let y = ys; y <= ye; y += 12) { pts.push([xx, y]); xx += (r() - 0.5) * 2; }
        line(pts, r() < 0.5 ? rgba(255, 228, 206, 0.07 + 0.06 * r()) : rgba(176, 112, 112, 0.05 + 0.05 * r()), (3 + 5 * r()) * sx);
      }
      const nc = 4 + Math.floor(r() * 3);
      for (let i = 0; i < nc; i++) { // long bold cracks: tapered dark body + light bevel on the lit (left) side
        const x = r() * W, fromTop = r() < 0.7, len = (0.6 + 0.4 * r()) * (bh - 6);
        const ya = fromTop ? y0 + 3 : y1 - 3 - len, w0 = (4.5 + 2.5 * r()) * Math.max(0.7, sx);
        const c: [number, number][] = []; let xx = x;
        for (let y = ya; y <= ya + len; y += 8) { c.push([xx, y]); xx += (r() - 0.5) * 3.5; }
        const n = c.length; if (n < 3) continue;
        const wd = (j: number) => { const t = j / (n - 1); return w0 * (fromTop ? 1 - 0.85 * t : 0.2 + 0.8 * Math.sin(Math.PI * t)); };
        line(c.map(([px, py], j) => [px - wd(j) / 2 - 1.8, py] as [number, number]), rgba(255, 232, 214, 0.45), 1.6);
        poly([...c.map(([px, py], j) => [px - wd(j) / 2, py] as [number, number]), ...c.map(([px, py], j) => [px + wd(j) / 2, py] as [number, number]).reverse()], rgba(88, 48, 74, 0.9));
        if (r() < 0.35) {
          const j = Math.floor(n * (0.2 + 0.4 * r())), b: [number, number][] = [c[j]], dir = r() < 0.5 ? -1 : 1; let bx = c[j][0];
          for (let s = 1; s < 5 + r() * 6; s++) { bx += dir * (2 + 2 * r()); b.push([bx, c[j][1] + s * 8]); }
          line(b, rgba(104, 62, 84, 0.7), 1.6);
        }
      }
    }
    // pass 2: ledges, moss, crown contact
    for (let k = 0; k < edges.length - 1; k++) {
      const { y0, bh } = band(k);
      if (k === edges.length - 2) {
        if (o.crown === false) continue;
        const sh = 0.045 * H, gr = g.createLinearGradient(0, 0, 0, sh);
        gr.addColorStop(0, rgba(66, 38, 70, 0.6)); gr.addColorStop(0.5, rgba(66, 38, 70, 0.32)); gr.addColorStop(1, rgba(66, 38, 70, 0));
        g.fillStyle = gr; g.fillRect(0, 0, W, sh);
        const nv = 7 + Math.floor(r() * 5);
        for (let i = 0; i < nv; i++) { // thin dark vines hanging from the crown
          const x = pickX(0.6), len = bh * (r() < 0.75 ? 0.1 + 0.2 * r() : 0.35 + 0.25 * r()), w0 = (1.6 + 1.6 * r()) * sx, ph = r() * 6;
          const pts: [number, number][] = []; let xx = x;
          for (let y = 0; y <= len; y += 6) { pts.push([xx + 1.6 * Math.sin(y * 0.05 + ph), y]); xx += (r() - 0.5) * 0.8; }
          for (let j = 0; j < pts.length - 1; j++) line([pts[j], pts[j + 1]], "rgba(58,86,50,0.85)", w0 * (1 - (0.7 * j) / pts.length));
          for (let j = 2; j < pts.length; j += 3 + Math.floor(r() * 3)) { const [px, py] = pts[j], s = 1.5 + 2 * r(); poly([[px, py - s], [px + s * 1.4 * (r() < 0.5 ? -1 : 1), py], [px, py + s]], "rgba(70,100,56,0.85)"); }
        }
        continue;
      }
      const sg = g.createLinearGradient(0, y0, 0, y0 + 24 * sy);
      sg.addColorStop(0, rgba(96, 58, 98, 0.34)); sg.addColorStop(1, rgba(96, 58, 98, 0));
      g.fillStyle = sg; g.fillRect(0, y0, W, 24 * sy);
      g.fillStyle = rgba(86, 50, 76, 0.9); g.fillRect(0, y0 - 1, W, 2.5);
      if (moss <= 0) continue;
      let x = r() * 80 * sx;
      while (x < W) {
        const seg = (40 + 140 * r()) * sx;
        if (r() < 0.2 + 0.55 * lit((x + seg / 2) / W)) {
          const x1 = x + seg, col = r() < 0.5 ? "#7f9a45" : "#6a8a3c";
          const pts: [number, number][] = [[x, y0 - 1]];
          for (let xx = x; xx <= x1; xx += 5) pts.push([xx, y0 + 1 + (3 + 6 * r()) * moss * sstep(x, x + 12, xx) * sstep(x1, x1 - 12, xx)]);
          pts.push([x1, y0 - 1]);
          poly(pts, col);
          for (let xx = x + 8; xx < x1 - 8; xx += 18 + 40 * r()) {
            const w = 3 + 5 * r(), len = (6 + 22 * r() * r()) * moss;
            poly([[xx - w / 2, y0 + 3], [xx + w / 2, y0 + 3], [xx + (r() - 0.5) * 2, y0 + 3 + len]], col);
          }
          if (r() < 0.5) { const a = x + seg * 0.15 * r(), b = seg * (0.3 + 0.4 * r()); g.fillStyle = "rgba(168,186,98,0.8)"; wrap((ox) => g.fillRect(a + ox, y0, b, 1.5)); }
        }
        x += seg + (60 + 140 * r()) * sx;
      }
      const nV = Math.round((2 + r() * 3) * moss);
      for (let i = 0; i < nV; i++) { // big V-shaped hanging clumps
        const xc = pickX(0.75), w = (30 + 40 * r()) * sx, len = Math.min(bh * 0.7, (60 + 100 * r()) * sy), m = 6;
        const tip = xc + (r() - 0.5) * w * 0.4, pts: [number, number][] = [[xc - w / 2, y0 - 1]];
        for (let j = 1; j < m; j++) { const t = j / m; pts.push([lerp(xc - w / 2, tip, t) + (r() - 0.3) * 5, y0 + len * t + (r() - 0.5) * 6]); }
        pts.push([tip, y0 + len]);
        for (let j = m - 1; j > 0; j--) { const t = j / m; pts.push([lerp(xc + w / 2, tip, t) + (r() - 0.7) * 5, y0 + len * t + (r() - 0.5) * 6]); }
        pts.push([xc + w / 2, y0 - 1]);
        poly(pts, "#62803a");
        poly([...pts.slice(0, m + 1).map(([px, py]) => [px + 3, py] as [number, number]), [xc, y0]], "rgba(128,152,72,0.7)");
        line(pts, "rgba(58,78,40,0.55)", 1.4);
      }
    }
  });
};

// ---------------------------------------------------------------- geometry helpers
/** non-indexed triangle soup with uvs; optional per-corner normals (otherwise flat face normals) */
class Soup {
  p: number[] = []; uv: number[] = []; n: number[] = [];
  tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, ua: number[], ub: number[], uc: number[], na?: THREE.Vector3, nb?: THREE.Vector3, nc?: THREE.Vector3) {
    this.p.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); this.uv.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
    if (na && nb && nc) this.n.push(na.x, na.y, na.z, nb.x, nb.y, nb.z, nc.x, nc.y, nc.z);
  }
  quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, ua: number[], ub: number[], uc: number[], ud: number[], na?: THREE.Vector3, nb?: THREE.Vector3, nc?: THREE.Vector3, nd?: THREE.Vector3) {
    this.tri(a, b, c, ua, ub, uc, na, nb, nc); this.tri(a, c, d, ua, uc, ud, na, nc, nd);
  }
  build(axis?: THREE.Vector3) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    if (this.n.length === this.p.length) g.setAttribute("normal", new THREE.Float32BufferAttribute(this.n, 3)); else g.computeVertexNormals();
    // aRad: horizontal direction from a vertical axis (smooth "cylinder" normal for the rock shader); zero = none
    const rad = new Float32Array(this.p.length);
    if (axis) for (let i = 0; i < this.p.length; i += 3) { const dx = this.p[i] - axis.x, dz = this.p[i + 2] - axis.z, l = Math.hypot(dx, dz) || 1; rad[i] = dx / l; rad[i + 2] = dz / l; }
    g.setAttribute("aRad", new THREE.BufferAttribute(rad, 3));
    return g;
  }
}
/** c centre, r radius, tint, seg [width, height] segments; m = mass centre (aMass = direction from it, so a whole crown
 *  can light as one mass); ref/refK = height below which the blob darkens (crown undersides) */
type Blob = { c: THREE.Vector3; r: number; tint?: number; seg?: [number, number]; m?: THREE.Vector3; ref?: number; refK?: number };
/** merged spheres with smooth per-blob normals, baked crevice AO (aAo), tint (aTint), normalised height (aH), mass
 *  normal (aMass); triangles buried inside another blob are dropped; optional flat bottom at y = flatY */
const blobGeo = (blobs: Blob[], o: { flatY?: number; segK?: number; minSeg?: number; maxSeg?: number; aoK?: number; smooth?: number } = {}) => {
  const parts: THREE.BufferGeometry[] = [];
  let ymax = -Infinity, ymin = Infinity;
  for (const b of blobs) { ymax = Math.max(ymax, b.c.y + b.r); ymin = Math.min(ymin, o.flatY ?? b.c.y - b.r); }
  const aoK = o.aoK ?? 0.75, sk = o.smooth ?? 0;
  // neighbours: only blobs close enough to occlude / blend with blob i (sorted on x for a cheap sweep)
  const order = blobs.map((_b, i) => i).sort((i, j) => blobs[i].c.x - blobs[j].c.x), rmax = blobs.reduce((m, b) => Math.max(m, b.r), 0);
  const nbs: number[][] = blobs.map(() => []);
  for (let a = 0; a < order.length; a++) {
    const i = order[a], b = blobs[i];
    for (let c = a + 1; c < order.length; c++) {
      const j = order[c], q = blobs[j];
      if (q.c.x - b.c.x > (b.r + rmax) * 1.8) break;
      const d = b.c.distanceTo(q.c);
      if (d < b.r + q.r * 1.8) nbs[i].push(j);
      if (d < q.r + b.r * 1.8) nbs[j].push(i);
    }
  }
  const p = new THREE.Vector3(), nn = new THREE.Vector3(), tv = new THREE.Vector3(), mv = new THREE.Vector3();
  blobs.forEach((b, i) => {
    const nb = nbs[i];
    const ws = b.seg?.[0] ?? Math.max(o.minSeg ?? 8, Math.min(o.maxSeg ?? 18, Math.round(b.r * (o.segK ?? 1.6))));
    const hs = b.seg?.[1] ?? Math.max(6, Math.round(ws * 0.7));
    const s = new THREE.SphereGeometry(b.r, ws, hs).toNonIndexed();
    const pos = s.attributes.position as THREE.BufferAttribute, nor = s.attributes.normal as THREE.BufferAttribute;
    const n = pos.count, ao = new Float32Array(n), tint = new Float32Array(n).fill(b.tint ?? 0), hh = new Float32Array(n), mass = new Float32Array(n * 3);
    const cont: number[][] = []; // per vertex: neighbours that bury it
    for (let v = 0; v < n; v++) {
      p.set(pos.getX(v), pos.getY(v), pos.getZ(v)).add(b.c);
      nn.set(nor.getX(v), nor.getY(v), nor.getZ(v));
      if (sk) { // shading normal = gradient of a soft union of the blobs: soft creases instead of hard seams
        let dmin = 0; for (const j of nb) dmin = Math.min(dmin, p.distanceTo(blobs[j].c) - blobs[j].r);
        const gsum = V(0, 0, 0).addScaledVector(nn, Math.exp(dmin / (sk * b.r)));
        for (const j of nb) { const q = blobs[j], dd = p.distanceTo(q.c) - q.r, w = Math.exp(-(dd - dmin) / (sk * q.r)); if (w > 1e-4) gsum.addScaledVector(tv.copy(p).sub(q.c).normalize(), w); }
        nn.copy(gsum.normalize());
      }
      if (o.flatY !== undefined && p.y < o.flatY) {
        const k = clamp01((o.flatY - p.y) / (b.r * 0.5));
        p.y = o.flatY - (o.flatY - p.y) * 0.04; nn.lerp(V(0, -1, 0), k).normalize();
      }
      let occ = 0; const cv: number[] = [];
      for (const j of nb) {
        const q = blobs[j], dd = p.distanceTo(q.c) - q.r;
        if (dd < -0.02 * q.r && (o.flatY === undefined || p.y > o.flatY + 0.03 * b.r)) cv.push(j);
        const f = Math.max(0, 1 - Math.max(0, dd) / (0.8 * q.r));
        const facing = nn.dot(tv.set(q.c.x - p.x, q.c.y - p.y, q.c.z - p.z).normalize()); // normal turned toward the neighbour = deeper crevice
        occ += f * f * aoK * Math.max(0.25, 0.6 + 0.4 * facing);
      }
      cont.push(cv);
      let a = Math.max(0.15, 1 - occ);
      if (b.ref !== undefined) a *= 1 - 0.55 * clamp01((b.ref - p.y) / (b.refK ?? b.r));
      ao[v] = a;
      hh[v] = (p.y - ymin) / Math.max(1e-3, ymax - ymin);
      if (b.m && mv.copy(p).sub(b.m).lengthSq() > 1e-6) mv.normalize(); else mv.copy(nn);
      mass[v * 3] = mv.x; mass[v * 3 + 1] = mv.y; mass[v * 3 + 2] = mv.z;
      pos.setXYZ(v, p.x, p.y, p.z); nor.setXYZ(v, nn.x, nn.y, nn.z);
    }
    // drop a triangle only when one neighbour buries all three corners (convex, so the whole triangle is inside it)
    const keep: number[] = [];
    for (let t = 0; t < n; t += 3) { const c0 = cont[t]; if (!c0.some((j) => cont[t + 1].includes(j) && cont[t + 2].includes(j))) keep.push(t, t + 1, t + 2); }
    const g = new THREE.BufferGeometry();
    const pick = (src: ArrayLike<number>, sz: number) => { const out = new Float32Array(keep.length * sz); keep.forEach((v, k) => { for (let c = 0; c < sz; c++) out[k * sz + c] = src[v * sz + c]; }); return out; };
    g.setAttribute("position", new THREE.BufferAttribute(pick(pos.array as Float32Array, 3), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(pick(nor.array as Float32Array, 3), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(pick((s.attributes.uv as THREE.BufferAttribute).array as Float32Array, 2), 2));
    g.setAttribute("aAo", new THREE.BufferAttribute(pick(ao, 1), 1));
    g.setAttribute("aTint", new THREE.BufferAttribute(pick(tint, 1), 1));
    g.setAttribute("aH", new THREE.BufferAttribute(pick(hh, 1), 1));
    g.setAttribute("aMass", new THREE.BufferAttribute(pick(mass, 3), 3));
    parts.push(g); s.dispose();
  });
  return mergeGeometries(parts)!;
};
const onNoInk = (o: THREE.Object3D) => { o.traverse((m) => m.layers.set(NOINK)); return o; };
/** horizontal key-light direction (moss, vines and crown drapes favour the lit side) */
const litH = () => V(SCENERY.uLight.value.x, 0, SCENERY.uLight.value.z).normalize();

// ---------------------------------------------------------------- sea stacks
type StackSpec = { az: number; d: number; h: number; w: number; dep: number; seed: number; bands: number; yaw: number; flare: number; haze: number; fall?: boolean };
/** layout round the deck origin (group sits on the sea surface): az deg, distance, height, width (screen), depth */
const STACKS: StackSpec[] = [
  { az: -19.5, d: 575, h: 112, w: 33, dep: 28, seed: 11, bands: 4, yaw: 0.25, flare: 0.06, haze: 0.16 }, // far left, arch leg
  { az: -9.2, d: 545, h: 142, w: 36, dep: 32, seed: 23, bands: 4, yaw: -0.15, flare: 0.08, haze: 0.09 }, // tall
  { az: -2.0, d: 520, h: 121, w: 42, dep: 36, seed: 37, bands: 4, yaw: 0.35, flare: 0.1, haze: 0.08 },   // middle, wide
  { az: 4.9, d: 565, h: 94, w: 35, dep: 30, seed: 41, bands: 3, yaw: -0.3, flare: 0.04, haze: 0.1, fall: true }, // waterfall
  { az: 16.0, d: 650, h: 76, w: 30, dep: 26, seed: 53, bands: 3, yaw: 0.6, flare: 0.08, haze: 0.38 },    // far right, hazier
];
type Pillar = { mesh: THREE.Mesh; top: THREE.Vector3[]; centre: THREE.Vector3; spec: StackSpec; extent: (dir: THREE.Vector3) => number };
const TAU = Math.PI * 2;
const ctr = (rg: THREE.Vector3[]) => rg.reduce((q, p) => q.add(p), V(0, 0, 0)).multiplyScalar(1 / rg.length);

/** one eroded stack: a 7-8 sided plan (broad vertical facet planes) lofted through many rings. The radius wobbles at low
 *  frequency per plan vertex, a few arcs of the outline step in or out at random heights (silhouette notches, clear of
 *  the ledges), each band tapers either way, and the ledges step by at most 1.5 % (some flush). Normals are smoothed
 *  up the wall but kept crisp between plan faces and at ledges/notches. */
const pillar = (s: StackSpec): Pillar => {
  const r = rng(s.seed), C = polar(s.az, s.d), cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
  const N = 7 + Math.floor(r() * 2), poly: [number, number][] = [], ph = r() * TAU;
  for (let i = 0; i < N; i++) {
    const th = ph + ((i + (r() - 0.5) * 0.45) / N) * TAU, ca = Math.cos(th), sa = Math.sin(th);
    const rad = Math.pow(Math.pow(Math.abs(ca) / (s.dep / 2), 3.5) + Math.pow(Math.abs(sa) / (s.w / 2), 3.5), -1 / 3.5) * (1 + (r() - 0.5) * 0.1);
    poly.push([ca * rad, sa * rad]);
  }
  // bands: heights spread 0.4..1.6 (the foot band a little taller)
  const wts = Array.from({ length: s.bands }, (_v, k) => (k === 0 ? 1.2 : 1) * (0.4 + 1.2 * r()));
  const tot = wts.reduce((a, b) => a + b, 0), ys = [0]; wts.forEach((v, k) => ys.push(ys[k] + (v / tot) * s.h));
  const bot: number[] = [], tops: number[] = []; let prev = 0.95 + 0.04 * r();
  for (let k = 0; k < s.bands; k++) {
    const step = k === 0 || r() < 0.4 ? 0 : (r() < 0.5 ? -1 : 1) * (0.006 + 0.009 * r());
    const b0 = prev * (1 + step), target = 0.93 + s.flare * (ys[k + 1] / s.h) + (r() - 0.5) * 0.08;
    const t0 = Math.min(b0 / 0.95, Math.max(b0 / 1.04, target));
    bot.push(b0); tops.push(t0); prev = t0;
  }
  // low-frequency radial wobble per plan vertex (a bulge spans about a third of a band), partly shared by the ring
  const bandH = s.h / s.bands, wave = () => ({ l1: bandH * (0.5 + 0.35 * r()), p1: r() * TAU, l2: bandH * (0.22 + 0.12 * r()), p2: r() * TAU });
  const shared = wave(), cols = poly.map(wave);
  const wv = (q: { l1: number; p1: number; l2: number; p2: number }, y: number) => 0.065 * Math.sin((y / q.l1) * TAU + q.p1) + 0.025 * Math.sin((y / q.l2) * TAU + q.p2);
  const wob = (i: number, y: number) => 0.6 * wv(cols[i], y) + 0.4 * wv(shared, y);
  // silhouette notches/bulges: an arc of 2-4 plan vertices steps in or out over 5-25 m, clear of the ledges
  const ledges = ys.slice(1, -1), T = 0.8;
  const jogs = Array.from({ length: 4 + Math.floor(r() * 4) }, () => {
    let y0 = 0; for (let t = 0; t < 10; t++) { y0 = s.h * (0.07 + 0.85 * r()); if (ledges.every((l) => Math.abs(l - y0) > 3)) break; }
    const y1 = Math.min(s.h - 2.5, y0 + 5 + 20 * r()), a = (r() < 0.6 ? -1 : 1) * (0.05 + 0.06 * r());
    const c0 = Math.floor(r() * N), n = 1 + Math.floor(r() * 3), amp = new Array<number>(N).fill(0);
    for (let q = -1; q <= n; q++) amp[(((c0 + q) % N) + N) % N] += q < 0 || q === n ? a * 0.4 : a;
    return { y0, y1, amp };
  });
  const jogAt = (i: number, y: number) => jogs.reduce((m, J) => m + J.amp[i] * (sstep(J.y0 - T, J.y0 + T, y) - sstep(J.y1 - T, J.y1 + T, y)), 0);
  // rings: every ~3 m, doubled at stepped ledges, plus a pair at each notch transition
  type Rg = { y: number; band: number; hard: boolean };
  const bandOf = (y: number) => { let k = 0; while (k < s.bands - 1 && y > ys[k + 1]) k++; return k; };
  const jogYs = jogs.flatMap((J) => [J.y0 - T, J.y0 + T, J.y1 - T, J.y1 + T]).filter((y) => y > 1 && y < s.h - 1 && ledges.every((l) => Math.abs(l - y) > 0.8)).sort((a, b) => a - b)
    .filter((y, i, a) => i === 0 || y - a[i - 1] > 0.3);
  const rings: Rg[] = [];
  for (let k = 0; k < s.bands; k++) {
    const n = Math.max(3, Math.round((ys[k + 1] - ys[k]) / 3.2));
    for (let q = 0; q <= n; q++) {
      const y = lerp(ys[k], ys[k + 1], q / n), edge = q === 0 || q === n;
      if (q === n && k < s.bands - 1 && Math.abs(bot[k + 1] - tops[k]) < 0.002) continue; // flush ledge: one ring
      if (!edge && jogYs.some((j) => Math.abs(j - y) < 0.9)) continue;
      rings.push({ y, band: k, hard: edge });
    }
  }
  for (const y of jogYs) rings.push({ y, band: bandOf(y), hard: true });
  rings.sort((a, b) => a.y - b.y || a.band - b.band);
  const lp1 = r() * TAU, lp2 = r() * TAU;
  const P = rings.map((rg) => {
    const k = rg.band, sc = lerp(bot[k], tops[k], clamp01((rg.y - ys[k]) / (ys[k + 1] - ys[k])));
    const ox = 0.035 * s.dep * Math.sin((rg.y / s.h) * 2.3 + lp1), oz = 0.04 * s.w * Math.sin((rg.y / s.h) * 1.8 + lp2);
    return poly.map(([a, b], i) => { const q = sc * (1 + wob(i, rg.y) + jogAt(i, rg.y)), la = a * q + ox, lb = b * q + oz; return V(C.x + la * cy - lb * sy, rg.y, C.z + la * sy + lb * cy); });
  });
  const K = rings.length;
  // quad normals per row/column, following the triangle winding (faceN() flips by gl_FrontFacing, so a normal must agree
  // with the winding, as computeVertexNormals would give); corner normals averaged up the column unless the ring is hard
  const qn: THREE.Vector3[][] = [], wn = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => c.clone().sub(b).cross(a.clone().sub(b));
  let sgn = 0; const degen: [number, number, THREE.Vector3][] = [];
  for (let k = 0; k < K - 1; k++) {
    const row: THREE.Vector3[] = [], c = ctr(P[k]);
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N, a = P[k][i], b = P[k][j], cc = P[k + 1][j], d = P[k + 1][i];
      const n = cc.clone().sub(a).cross(d.clone().sub(b)), w = wn(a, b, cc).add(wn(a, cc, d)), rad = V((a.x + b.x) / 2 - c.x, 0, (a.z + b.z) / 2 - c.z).normalize();
      if (n.lengthSq() < 1e-8 || w.lengthSq() < 1e-8) { degen.push([k, i, rad]); n.copy(rad); }
      else { n.normalize(); if (n.dot(w) < 0) n.negate(); if (Math.abs(n.y) < 0.5) sgn += Math.sign(n.dot(rad)); }
      row.push(n);
    }
    qn.push(row);
  }
  for (const [k, i, rad] of degen) qn[k][i].copy(rad).multiplyScalar(sgn < 0 ? -1 : 1); // zero-area quads: radial, same sense
  const cn = (k: number, i: number, row: number) => (rings[k].hard || k === 0 || k === K - 1 ? qn[row][i] : qn[k - 1][i].clone().add(qn[k][i]).normalize());
  const per = [0]; for (let i = 0; i < N; i++) per.push(per[i] + Math.hypot(poly[(i + 1) % N][0] - poly[i][0], poly[(i + 1) % N][1] - poly[i][1]));
  const U = (i: number) => per[i] / per[N]; // the texture wraps once round the stack
  const soup = new Soup(), shell = new Soup(), OL = 0.55;
  // outline shell: the rings pushed out horizontally by OL from each ring's centroid, far faces only
  const grow = (rg: THREE.Vector3[], dy = 0) => { const c = ctr(rg); return rg.map((p) => { const d = V(p.x - c.x, 0, p.z - c.z).normalize(); return V(p.x + d.x * OL, p.y + dy, p.z + d.z * OL); }); };
  const S = P.map((rg) => grow(rg));
  for (let k = 0; k < K - 1; k++) {
    const va = rings[k].y / s.h, vb = rings[k + 1].y / s.h;
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N, n0 = cn(k, i, k), n1 = cn(k + 1, i, k);
      soup.quad(P[k][i], P[k][j], P[k + 1][j], P[k + 1][i], [U(i), va], [U(i + 1), va], [U(i + 1), vb], [U(i), vb], n0, n0, n1, n1);
      shell.quad(S[k][i], S[k][j], S[k + 1][j], S[k + 1][i], [0, 0], [0, 0], [0, 0], [0, 0]);
    }
  }
  const top = P[K - 1], tc = ctr(top), up = wn(tc, top[1], top[0]).normalize();
  for (let i = 0; i < N; i++) soup.tri(tc, top[(i + 1) % N], top[i], [0.5, 1], [0.5, 1], [0.5, 1], up, up, up);
  const stp = grow(top, OL), stc = tc.clone().setY(tc.y + OL);
  for (let i = 0; i < N; i++) shell.tri(stc, stp[(i + 1) % N], stp[i], [0, 0], [0, 0], [0, 0]);
  // moss and vines favour the plan faces that turn toward the key light
  const LH = litH(), c0 = ctr(P[0]);
  const faceLit = poly.map((_q, i) => {
    const a = P[0][i], b = P[0][(i + 1) % N], n = V(b.z - a.z, 0, a.x - b.x).normalize();
    if (n.x * ((a.x + b.x) / 2 - c0.x) + n.z * ((a.z + b.z) / 2 - c0.z) < 0) n.negate();
    return clamp01(0.5 + 0.8 * n.dot(LH));
  });
  const litU = (u: number) => { const uu = ((u % 1) + 1) % 1; for (let i = 0; i < N; i++) if (uu <= U(i + 1)) return faceLit[i]; return faceLit[N - 1]; };
  const map = rockTex(s.seed * 3 + 1, ledges.map((y) => y / s.h), { lit: litU });
  const mesh = new THREE.Mesh(soup.build(C), rockMat(map, s.haze, Math.min(40, s.h * 0.34)));
  mesh.add(new THREE.Mesh(shell.build(), lineMat("#3d2740", s.haze + 0.12, Math.min(40, s.h * 0.34))));
  const centre = V(tc.x, s.h, tc.z);
  const extent = (dir: THREE.Vector3) => { let m = -Infinity; for (const rg of P) for (const p of rg) m = Math.max(m, (p.x - centre.x) * dir.x + (p.z - centre.z) * dir.z); return m; };
  return { mesh, top, centre, spec: s, extent };
};

/** foliage crown: one wide, flattish mass ~12 % wider than the rock top. Overhanging rim clumps hide the rock edge and
 *  darken underneath, a middle ring and a few big inner masses make the dome, small bumps break the silhouette, a few
 *  drapes hang on the lit side. All blobs share one mass centre so the crown lights as a single form. */
const crownBlobs = (pl: Pillar, r: () => number): Blob[] => {
  const { top, centre, spec } = pl, H = spec.h, w = spec.w, N = top.length, out: Blob[] = [];
  const m = V(centre.x, H - 0.35 * w, centre.z), ref = H + 0.03 * w, refK = 0.1 * w, LH = litH();
  const add = (c: THREE.Vector3, rr: number, seg: [number, number]) => { const b: Blob = { c, r: rr, tint: r() * 2 - 1, m, ref, refK, seg }; out.push(b); return b; };
  const per = [0]; for (let i = 0; i < N; i++) per.push(per[i] + top[i].distanceTo(top[(i + 1) % N]));
  const at = (sp: number) => { const L = per[N], q = ((sp % L) + L) % L; let i = 0; while (i < N - 1 && q > per[i + 1]) i++; return top[i].clone().lerp(top[(i + 1) % N], (q - per[i]) / Math.max(1e-6, per[i + 1] - per[i])); };
  const outward = (p: THREE.Vector3) => V(p.x - centre.x, 0, p.z - centre.z).normalize();
  const rb = w * 0.11, nR = Math.max(8, Math.round(per[N] / (rb * 1.25))), rim: Blob[] = [];
  for (let q = 0; q < nR; q++) {
    const p = at(((q + 0.35 * r()) / nR) * per[N]), o = outward(p), rr = rb * (0.75 + 0.5 * r());
    rim.push(add(p.addScaledVector(o, (0.045 + 0.04 * r()) * w - rr).setY(H + rr * (0.05 + 0.3 * r())), rr, [12, 8]));
  }
  const nM = Math.round(nR * 0.55);
  for (let q = 0; q < nM; q++) {
    const p = centre.clone().lerp(at(((q + r()) / nM) * per[N]), 0.5 + 0.2 * r()), rr = w * (0.1 + 0.04 * r());
    add(p.setY(H + w * (0.12 + 0.04 * r()) - rr * 0.6), rr, [12, 8]);
  }
  const nB = 3 + Math.floor(r() * 3);
  for (let q = 0; q < nB; q++) {
    const p = centre.clone().lerp(top[Math.floor(r() * N)], 0.1 + 0.35 * r()), rr = w * (0.17 + 0.07 * r());
    add(p.setY(H + w * (0.19 + 0.05 * r()) - rr), rr, [16, 10]);
  }
  const nS = Math.round(nR * 0.8);
  for (let q = 0; q < nS; q++) {
    const b = rim[Math.floor(r() * rim.length)], o = outward(b.c);
    const d = V((r() - 0.5) * 0.4, 0.75, (r() - 0.5) * 0.4).addScaledVector(o, 0.55 + 0.3 * r()).normalize();
    add(b.c.clone().addScaledVector(d, b.r * 0.88), w * (0.035 + 0.03 * r()), [8, 6]);
  }
  for (let q = 0; q < 6; q++) {
    const p = at(r() * per[N]), o = outward(p); if (o.dot(LH) < 0.15) continue;
    add(p.addScaledVector(o, 0.02 * w).setY(H - rb * (0.5 + 0.8 * r())), rb * (0.45 + 0.25 * r()), [10, 7]);
  }
  return out;
};
/** palm-like frond tuft: arching V-folded leaves (two facets each for a lit/shaded midrib) */
const tuftGeo = (base: THREE.Vector3, L: number, n: number, r: () => number, droop = 1) => {
  const soup = new Soup();
  for (let f = 0; f < n; f++) {
    const az = (f / n) * Math.PI * 2 + r() * 0.6, h = V(Math.cos(az), 0, Math.sin(az)), side = V(-h.z, 0, h.x);
    const up = 0.9 + 0.5 * r(), seg = 7, len = L * (0.8 + 0.4 * r()), wd = len * 0.16;
    const P = (s: number) => base.clone().addScaledVector(h, len * s).add(V(0, len * (up * s - droop * 1.25 * s * s), 0));
    for (let i = 0; i < seg; i++) {
      const s0 = i / seg, s1 = (i + 1) / seg, w0 = wd * Math.sin(Math.PI * Math.min(1, s0 * 1.1 + 0.08)), w1 = wd * Math.sin(Math.PI * Math.min(1, s1 * 1.1 + 0.08)) * (i === seg - 1 ? 0.1 : 1);
      const a = P(s0), b = P(s1), fold = V(0, -0.35, 0);
      const al = a.clone().addScaledVector(side, w0).addScaledVector(fold, w0), bl = b.clone().addScaledVector(side, w1).addScaledVector(fold, w1);
      const ar = a.clone().addScaledVector(side, -w0).addScaledVector(fold, w0), br = b.clone().addScaledVector(side, -w1).addScaledVector(fold, w1);
      soup.quad(a, b, bl, al, [0, 0], [0, 0], [0, 0], [0, 0]); soup.quad(a, ar, br, b, [0, 0], [0, 0], [0, 0], [0, 0]);
    }
  }
  const g = soup.build(), nv = g.attributes.position.count;
  g.setAttribute("aAo", new THREE.BufferAttribute(new Float32Array(nv).fill(0.95), 1));
  g.setAttribute("aTint", new THREE.BufferAttribute(new Float32Array(nv).fill(-0.4), 1));
  g.setAttribute("aH", new THREE.BufferAttribute(new Float32Array(nv).fill(1), 1));
  g.setAttribute("aMass", new THREE.BufferAttribute(new Float32Array(nv * 3).map((_v, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
};
/** mound of bushes at a stack's foot (flat bottom on the sea, lit as one mound) */
const moundBlobs = (c: THREE.Vector3, w: number, h: number, dep: number, r: () => number, n: number): Blob[] => {
  const out: Blob[] = [], m = V(c.x, -0.5 * h, c.z);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, k = Math.sqrt(r()), x = Math.cos(a) * k * dep * 0.5, z = Math.sin(a) * k * w * 0.5;
    const top = h * Math.sqrt(Math.max(0, 1 - k * k)), rr = (0.16 + 0.1 * r()) * Math.min(w, h * 1.6);
    out.push({ c: V(c.x + x, Math.max(rr * 0.2, top - rr * 0.35), c.z + z), r: rr, tint: r() * 2 - 1, m });
  }
  return out;
};
/** soft camera-facing mist billows (one canvas puff, billboarded in the vertex shader). Cycling puffs rise, grow and
 *  fade on SCENERY.uT; static ones only breathe. Fades out at the waterline, so nothing shows below the sea. */
type Puff = { c: THREE.Vector3; s: number; ph: number; sp: number; cyc: number; rise: number };
const puffTex = () => canvasTex(256, 256, (g) => {
  const r = rng(2024);
  g.clearRect(0, 0, 256, 256);
  const discs: [number, number, number][] = [];
  for (let i = 0; i < 6; i++) discs.push([46 + (i / 5) * 164 + (r() - 0.5) * 12, 176 - 8 * r(), 30 + 10 * r()]);
  for (let i = 0; i < 5; i++) discs.push([70 + 116 * r(), 140 - 60 * r() * (1 - Math.abs(i - 2) / 3), 34 + 22 * r()]);
  for (const [x, y, rad] of discs) { // soft alpha mask, lumpy edge
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.5, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  g.globalCompositeOperation = "source-atop"; // shade the billow as one form: lit upper left, cool grey-lavender low right
  const sh = g.createLinearGradient(60, 60, 200, 210); sh.addColorStop(0, "#ffffff"); sh.addColorStop(0.5, "#f6f7fc"); sh.addColorStop(1, "#d9dcef");
  g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = "destination-in"; // soft flat bottom
  const fade = g.createLinearGradient(0, 168, 0, 214); fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = "source-over";
}, false);
const puffMesh = (puffs: Puff[], haze: number) => {
  const pos: number[] = [], cor: number[] = [], pa: number[] = [], pr: number[] = [], idx: number[] = [];
  puffs.forEach((q, k) => {
    for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { pos.push(q.c.x, q.c.y, q.c.z); cor.push(x, y); pa.push(q.s, q.ph, q.sp, q.cyc); pr.push(q.rise); }
    idx.push(k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("aCorner", new THREE.Float32BufferAttribute(cor, 2));
  g.setAttribute("aPuff", new THREE.Float32BufferAttribute(pa, 4)); g.setAttribute("aRise", new THREE.Float32BufferAttribute(pr, 1)); g.setIndex(idx);
  const vs = /* glsl */ `${VERT_HEAD}
attribute vec2 aCorner; attribute vec4 aPuff; attribute float aRise; varying float vA;
void main(){
  float ph = fract(aPuff.y + uT * aPuff.z);
  float life = mix(1.0, sin(3.14159 * ph), aPuff.w);
  float sz = aPuff.x * mix(1.0 + 0.04 * sin(uT * 1.3 + aPuff.y * 6.0), 0.75 + 0.5 * ph, aPuff.w);
  vec3 c = position + vec3(0.0, aRise * ph * aPuff.w, 0.0);
  vec4 mv = modelViewMatrix * vec4(c, 1.0);
  mv.xy += aCorner * sz;
  vUv = aCorner * 0.5 + 0.5; vA = life; vH = c.y + aCorner.y * sz; vN = vec3(0.0, 1.0, 0.0);
  vW = (modelMatrix * vec4(c, 1.0)).xyz;
  gl_Position = projectionMatrix * mv;
}`;
  const m = mat(vs, /* glsl */ `
uniform sampler2D uMap; uniform float uHaze; varying float vA;
void main(){ vec4 t = texture2D(uMap, vUv);
  vec3 c = mix(t.rgb, skyAt(viewDir()), uHaze);
  emit(c, t.a * vA * 0.95 * smoothstep(0.0, 3.0, vH)); }`, { uMap: { value: puffTex() }, uHaze: { value: haze } }, { transparent: true, depthWrite: false });
  const me = new THREE.Mesh(g, m); me.frustumCulled = false; return me;
};
/** thin dark tapered wavy vines (camera-facing strips across `side`) */
const vineSoup = (soup: Soup, top: THREE.Vector3, len: number, side: THREE.Vector3, w0: number, r: () => number) => {
  const n = 5, ph = r() * TAU, sway = 0.6 + 1.2 * r();
  const at = (t: number) => top.clone().add(V(0, -len * t, 0)).addScaledVector(side, sway * t * Math.sin(t * 3.2 + ph));
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, a = at(t0), b = at(t1), wa = w0 * (1 - 0.75 * t0), wb = w0 * (1 - 0.75 * t1);
    soup.quad(a.clone().addScaledVector(side, -wa), a.clone().addScaledVector(side, wa), b.clone().addScaledVector(side, wb), b.clone().addScaledVector(side, -wb), [0, 0], [0, 0], [0, 0], [0, 0]);
  }
};

const ARCH_SIDE: THREE.Side = THREE.BackSide, HULL_SIDE: THREE.Side = THREE.FrontSide; // outline shells draw their far faces (side follows each mesh's winding)

export function seaStacks(): THREE.Group {
  const G = new THREE.Group(); G.name = "seaStacks";
  const r = rng(907);
  const pillars = STACKS.map(pillar);
  const leafBlobs: Blob[] = [], leafHaze: Blob[] = [];
  const tufts: THREE.BufferGeometry[] = [];
  for (const pl of pillars) {
    G.add(pl.mesh);
    (pl.spec.haze > 0.2 ? leafHaze : leafBlobs).push(...crownBlobs(pl, r));
    const nt = 1 + Math.floor(r() * 2);
    for (let i = 0; i < nt; i++) {
      const a = pl.top[Math.floor(r() * pl.top.length)], p = pl.centre.clone().lerp(a, 0.3 + 0.4 * r());
      tufts.push(tuftGeo(p.setY(pl.spec.h + pl.spec.w * 0.17), pl.spec.w * 0.2, 6 + Math.floor(r() * 3), r));
    }
  }
  const vines = new Soup();
  // --- arch between the far-left leg and the tall stack
  {
    const A = pillars[0], B = pillars[1];
    const a = A.centre.clone().setY(0), b = B.centre.clone().setY(0), span = a.distanceTo(b);
    const tdir = b.clone().sub(a).normalize(), nrm = V(-tdir.z, 0, tdir.x); if (nrm.x > 0) nrm.negate(); // nrm toward the camera
    const fa = A.extent(tdir), fb = B.extent(tdir.clone().negate());
    const s0 = (fa - 2) / span, s1 = 1 - (fb - 2) / span; // opening between the inner faces
    const yT = 0.72 * B.spec.h, thick = 15, F = 34, D = 21, NS = 44;
    const ra = rng(5151), jit: number[] = Array.from({ length: NS + 1 }, () => (ra() - 0.5) * 1.6);
    const soup = new Soup(), secs: THREE.Vector3[][] = [];
    for (let i = 0; i <= NS; i++) {
      const s = 0.04 + 0.92 * (i / NS), e = Math.min(1, Math.abs((s - s0) / (s1 - s0) * 2 - 1));
      const top = yT + 1.2 * Math.sin(s * 9.0) + jit[i] * 0.6, bot = yT - thick - F * (1 - Math.sqrt(Math.max(0, 1 - e * e))) + jit[i];
      const c = a.clone().lerp(b, s), q = (n: number, y: number) => c.clone().addScaledVector(nrm, n + jit[(i + 7) % NS] * 0.5).setY(y);
      const d2 = D / 2, ch = 1.8;
      secs.push([q(-d2, top - ch), q(-d2 + ch, top), q(d2 - ch, top), q(d2, top - ch), q(d2, bot + ch), q(d2 - ch, bot), q(-d2 + ch, bot), q(-d2, bot + ch)]);
    }
    const yLo = yT - thick - F - 4, vOf = (y: number) => (y - yLo) / (yT + 4 - yLo);
    for (let i = 0; i < NS; i++) for (let k = 0; k < 8; k++) {
      const p0 = secs[i][k], p1 = secs[i][(k + 1) % 8], p2 = secs[i + 1][(k + 1) % 8], p3 = secs[i + 1][k];
      const u0 = (i / NS) * span / 60, u1 = ((i + 1) / NS) * span / 60;
      soup.quad(p0, p1, p2, p3, [u0, vOf(p0.y)], [u0, vOf(p1.y)], [u1, vOf(p2.y)], [u1, vOf(p3.y)]);
    }
    const am = rockMat(rockTex(777, [0.42, 0.74], { W: 1024, H: 512, moss: 0.8 }), 0.15, 30);
    const arch = new THREE.Mesh(soup.build(), am); G.add(arch);
    const sh = new Soup(), gs = secs.map((sec) => { const c = sec.reduce((q, p) => q.add(p), V(0, 0, 0)).multiplyScalar(1 / sec.length); return sec.map((p) => p.clone().add(p.clone().sub(c).normalize().multiplyScalar(0.55))); });
    for (let i = 0; i < NS; i++) for (let k = 0; k < 8; k++) sh.quad(gs[i][k], gs[i][(k + 1) % 8], gs[i + 1][(k + 1) % 8], gs[i + 1][k], [0, 0], [0, 0], [0, 0], [0, 0]);
    arch.add(new THREE.Mesh(sh.build(), lineMat("#3d2740", 0.27, 30, ARCH_SIDE)));
    // foliage along the deck, thin vines hanging from the soffit
    for (let i = 0; i < 26; i++) {
      const s = 0.12 + 0.76 * (i / 25) + (r() - 0.5) * 0.02, c = a.clone().lerp(b, s), rr = 3 + 1.8 * r();
      const cc = c.addScaledVector(nrm, (r() - 0.5) * D * 0.7).setY(yT + rr * 0.25);
      leafBlobs.push({ c: cc, r: rr, tint: r() * 2 - 1, m: cc.clone().add(V(0, -2.5 * rr, 0)), ref: yT, refK: 3 });
    }
    for (let i = 0; i < 30; i++) {
      const s = lerp(s0, s1, 0.03 + 0.94 * r()), e = Math.abs((s - s0) / (s1 - s0) * 2 - 1);
      const yb = yT - thick - F * (1 - Math.sqrt(Math.max(0, 1 - e * e))) + 0.5, len = 4 + 22 * r() * r() * (1 - 0.6 * e);
      vineSoup(vines, a.clone().lerp(b, s).addScaledVector(nrm, -D / 2 + 1.5 + r() * 6).setY(yb), len, tdir, 0.2 + 0.08 * r(), r);
    }
  }
  G.add(new THREE.Mesh(vines.build(), paint("#3e5a34", { flat: true, haze: 0.18 })));
  // --- waterfall down the front of the waterfall stack
  {
    const pl = pillars.find((p) => p.spec.fall)!, H = pl.spec.h;
    const dir = polar(180 - 26, 1).normalize(); // out of the face toward the camera, a little right of centre
    const off = pl.extent(dir) + 1.0, W = 9.5;
    const base = pl.centre.clone().setY(0).addScaledVector(dir, off), side = V(-dir.z, 0, dir.x);
    const lip = pl.centre.clone().setY(0).addScaledVector(dir, off - 4);
    const path: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) { const k = i / 6; path.push(lip.clone().lerp(base, Math.sin(k * Math.PI / 2)).setY(H + 0.5 - 5 * k * k)); }
    for (let i = 1; i <= 16; i++) path.push(base.clone().setY(H - 4.5 - (H - 4.5) * (i / 16)));
    const soup = new Soup(); let vAcc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[i], p1 = path[i + 1], dv = p0.distanceTo(p1) / 30;
      const w0 = W * (0.85 + 0.15 * (i / path.length)), w1 = W * (0.85 + 0.15 * ((i + 1) / path.length));
      soup.quad(p0.clone().addScaledVector(side, -w0 / 2), p0.clone().addScaledVector(side, w0 / 2), p1.clone().addScaledVector(side, w1 / 2), p1.clone().addScaledVector(side, -w1 / 2),
        [0, vAcc], [1, vAcc], [1, vAcc + dv], [0, vAcc + dv]);
      vAcc += dv;
    }
    const ft = canvasTex(128, 512, (g) => {
      const rr = rng(4242); g.fillStyle = "rgb(110,0,0)"; g.fillRect(0, 0, 128, 512);
      for (let i = 0; i < 70; i++) {
        const x = 6 + rr() * 116, y = rr() * 512, L = 60 + 220 * rr(), w = 2 + 7 * rr();
        g.strokeStyle = rgba(255, 140 + 115 * rr(), 0, 0.5 + 0.5 * rr()); g.lineWidth = w; g.lineCap = "round";
        for (const oy of [-512, 0, 512]) { g.beginPath(); g.moveTo(x, y + oy); g.lineTo(x + (rr() - 0.5) * 3, y + L + oy); g.stroke(); }
      }
    }, true, true);
    const fallMat = mat(vert(""), /* glsl */ `
uniform sampler2D uMap;
void main(){
  vec4 t = texture2D(uMap, vec2(vUv.x, vUv.y - uT * 0.55));
  vec4 t2 = texture2D(uMap, vec2(vUv.x * 0.7 + 0.3, vUv.y * 0.6 - uT * 0.42));
  float s = max(t.r, t2.r * 0.8);
  float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
  vec3 c = mix(vec3(0.70, 0.88, 0.97), vec3(1.0), s);
  c *= mix(1.0, 0.86, smoothstep(0.45, 1.0, vUv.x));
  c = mix(c, skyAt(viewDir()), 0.1);
  emit(mistMix(c, vH, 30.0, 0.5), edge * (0.78 + 0.22 * t.g) * smoothstep(0.0, 2.0, vH)); }`, { uMap: { value: ft } }, { transparent: true, depthWrite: false });
    const fall = new THREE.Mesh(soup.build(), fallMat); fall.renderOrder = 1; G.add(fall);
    // foot of the fall: soft rising mist billows + a wide low splash skirt (sprites), over a faint mist plume
    const rf = rng(31), puffs: Puff[] = [];
    for (let i = 0; i < 3; i++) { const sz = 8 + 2.5 * rf(); puffs.push({ c: base.clone().addScaledVector(side, (i - 1) * 6 + (rf() - 0.5) * 2).addScaledVector(dir, 2).setY(0.55 * sz), s: sz, ph: rf(), sp: 0, cyc: 0, rise: 0 }); }
    for (let i = 0; i < 5; i++) { const sz = 4.5 + 2.5 * rf(); puffs.push({ c: base.clone().addScaledVector(side, (rf() - 0.5) * 9).addScaledVector(dir, 1 + rf() * 2).setY(0.5 * sz + 1.5 * rf()), s: sz, ph: i / 5 + 0.08 * rf(), sp: 0.16 + 0.1 * rf(), cyc: 1, rise: 9 + 6 * rf() }); }
    const foam = puffMesh(puffs, 0.08); foam.renderOrder = 3; G.add(foam);
    const plume = new THREE.Mesh(new THREE.PlaneGeometry(38, 28), mat(vert(""), /* glsl */ `
void main(){ vec2 q = (vUv - vec2(0.5, 0.22)) * vec2(1.0, 0.8); float a = smoothstep(0.5, 0.0, length(q)) * 0.6 * smoothstep(0.0, 0.2, vUv.y);
  emit(mix(skyAt(viewDir()), vec3(1.0), 0.7), a); }`, {}, { transparent: true, depthWrite: false }));
    plume.position.copy(base).addScaledVector(dir, 3).setY(14); plume.lookAt(plume.position.clone().addScaledVector(dir, 10)); plume.renderOrder = 2; G.add(plume);
  }
  // --- bushes at the feet, two leaning palms
  const RM = rng(77);
  for (const [az, d, w, h, n] of [[-5.2, 528, 30, 24, 30], [8.4, 572, 34, 21, 32], [-13.8, 566, 22, 15, 16], [1.3, 548, 18, 12, 12], [-21.8, 585, 20, 13, 12]] as const)
    leafBlobs.push(...moundBlobs(polar(az, d), w, h, w * 0.8, RM, n));
  {
    const b = polar(1.8, 548, 9), top = b.clone().add(V(-2, 26, -9));
    const curve = new THREE.QuadraticBezierCurve3(b, b.clone().add(V(0, 14, -1)), top);
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.75, 6), paint("#8a6648", { shade: [0.62, 0.56, 0.72], haze: 0.15, mistH: 30 }));
    G.add(trunk);
    tufts.push(tuftGeo(top, 10, 8, RM, 1.15));
    const b2 = polar(9.6, 575, 12), top2 = b2.clone().add(V(-1, 20, 6));
    G.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(b2, b2.clone().add(V(0, 11, 1)), top2), 8, 0.6, 6), trunk.material));
    tufts.push(tuftGeo(top2, 8, 7, RM, 1.15));
  }
  G.add(new THREE.Mesh(blobGeo(leafBlobs, { minSeg: 12, maxSeg: 14, segK: 2, smooth: 0.1, flatY: 0 }), leafMat(0.1, 16)));
  if (leafHaze.length) G.add(new THREE.Mesh(blobGeo(leafHaze, { minSeg: 10, maxSeg: 12, segK: 2, smooth: 0.1 }), leafMat(0.28, 30)));
  G.add(new THREE.Mesh(mergeGeometries(tufts)!, leafMat(0.1, 34)));
  // --- a hazy mountain range behind the arch: smooth soft silhouettes that cool and lighten into the base mist
  {
    const rm = rng(616), parts: THREE.BufferGeometry[] = [];
    for (const [az, d, hh, rad] of [[-14.6, 720, 96, 95], [-9.8, 760, 70, 80], [-25, 740, 60, 70]] as const) {
      const c = polar(az, d), n = 28, lv = [0, 0.18, 0.38, 0.58, 0.76, 0.9];
      const pk = c.clone().add(V((rm() - 0.5) * 10, hh, (rm() - 0.5) * 14)), f1 = rm() * TAU, f2 = rm() * TAU;
      const pos: number[] = [], idx: number[] = [];
      for (const k of lv) for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, rr = rad * Math.pow(1 - k, 1.15) * (1 + 0.14 * Math.sin(2 * a + f1) + 0.07 * Math.sin(5 * a + f2));
        const p = c.clone().lerp(pk, k); pos.push(p.x + Math.cos(a) * rr * 0.75, p.y, p.z + Math.sin(a) * rr);
      }
      pos.push(pk.x, pk.y, pk.z);
      for (let l = 0; l < lv.length - 1; l++) for (let i = 0; i < n; i++) { const j = (i + 1) % n, A = l * n; idx.push(A + i, A + j, A + n + j, A + i, A + n + j, A + n + i); }
      const tp = lv.length * n, T0 = (lv.length - 1) * n;
      for (let i = 0; i < n; i++) idx.push(T0 + i, T0 + ((i + 1) % n), tp);
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2)); g.setIndex(idx); g.computeVertexNormals();
      parts.push(g);
    }
    G.add(new THREE.Mesh(mergeGeometries(parts)!, paint("#a7a2bd", { shade: [0.84, 0.84, 0.95], soft: 0.6, haze: 0.6, mistH: 55 })));
  }
  // --- mist band hugging the waterline in front of the stacks (starts at the sea, soft bottom edge)
  {
    const a0 = -34, a1 = 30, R = 470, Hm = 24, n = 64, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const az = lerp(a0, a1, i / n), p = polar(az, R);
      pos.push(p.x, 0, p.z, p.x, Hm, p.z); uv.push(i / n, 0, i / n, 1);
      if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const mt = canvasTex(1024, 128, (c) => {
      const rr = rng(888); c.clearRect(0, 0, 1024, 128);
      const gr = c.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.35, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = gr; c.fillRect(0, 0, 1024, 128);
      for (let i = 0; i < 60; i++) { const x = rr() * 1024, y = 90 + 40 * rr(), rad = 18 + 40 * rr(); const rg = c.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, "rgba(255,255,255,0.35)"); rg.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = rg; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    }, false);
    const mm = mat(vert(""), /* glsl */ `
uniform sampler2D uMap;
void main(){ float a = texture2D(uMap, vUv).a * smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x) * smoothstep(0.0, 0.08, vUv.y);
  emit(mix(skyAt(viewDir()), vec3(0.98, 0.99, 0.99), 0.6), a * 0.75); }`, { uMap: { value: mt } }, { transparent: true, depthWrite: false });
    const band = new THREE.Mesh(g, mm); band.renderOrder = 3; G.add(band);
  }
  return onNoInk(G) as THREE.Group;
}

// ---------------------------------------------------------------- galleon
const skullFlag = () => canvasTex(256, 176, (g) => {
  g.fillStyle = "#17151a"; g.fillRect(0, 0, 256, 176);
  g.fillStyle = "#26232b"; for (let y = 0; y < 176; y += 22) g.fillRect(0, y, 256, 2);
  g.fillStyle = "#f4f0e6"; g.strokeStyle = "#f4f0e6"; g.lineCap = "round";
  g.lineWidth = 15; g.beginPath(); g.moveTo(84, 128); g.lineTo(172, 150); g.moveTo(172, 128); g.lineTo(84, 150); g.stroke();
  for (const [x, y] of [[80, 124], [80, 154], [176, 124], [176, 154]]) { g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); g.arc(128, 70, 40, 0, Math.PI * 2); g.fill(); g.fillRect(104, 90, 48, 32);
  g.fillStyle = "#17151a"; g.beginPath(); g.arc(112, 70, 11, 0, Math.PI * 2); g.arc(144, 70, 11, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(128, 82); g.lineTo(121, 96); g.lineTo(135, 96); g.closePath(); g.fill();
  for (let x = 110; x <= 146; x += 9) g.fillRect(x, 106, 3, 16);
}, false);
const sailTex = () => canvasTex(256, 256, (g) => {
  const r = rng(99);
  g.fillStyle = "#f6ecd8"; g.fillRect(0, 0, 256, 256);
  for (let i = 1; i < 6; i++) { const x = (i * 256) / 6 + (r() - 0.5) * 4; g.fillStyle = "rgba(170,140,104,0.55)"; g.fillRect(x, 0, 2, 256); g.fillStyle = "rgba(255,252,240,0.6)"; g.fillRect(x + 2, 0, 2, 256); }
  for (let i = 0; i < 40; i++) { const x = r() * 256; g.fillStyle = rgba(200, 176, 140, 0.08 + 0.08 * r()); g.fillRect(x, 0, 3 + 10 * r(), 256); }
  g.strokeStyle = "rgba(150,118,84,0.9)"; g.lineWidth = 7; g.strokeRect(3, 3, 250, 250);
  g.fillStyle = "rgba(150,118,84,0.7)"; for (let x = 16; x < 250; x += 20) g.fillRect(x, 26, 3, 7);
}, false);
const HULL = { L: 15.5, B: 4.5, KEEL: -1.6, VMIN: -1.6, VMAX: 5.8 };
const sheer = (t: number) => 2.75 + 1.45 * (1 - sstep(0.19, 0.25, t)) + 0.9 * Math.pow(sstep(0.6, 1.0, t), 1.6);
const halfB = (t: number) => (HULL.B / 2) * (t < 0.12 ? 0.82 + 0.18 * sstep(0, 0.12, t) : t < 0.6 ? 1 : Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.6) / 0.4, 2))));
const keelY = (t: number) => (t > 0.8 ? lerp(HULL.KEEL, sheer(1) - 0.6, Math.pow((t - 0.8) / 0.2, 2)) : HULL.KEEL);
const hullX = (t: number, y: number) => {
  const hb = halfB(t), top = sheer(t), kl = keelY(t), wy = Math.max(kl + 0.01, Math.min(1.0, top - 0.2));
  if (y >= wy) return hb * (1 - 0.09 * clamp01((y - wy) / Math.max(0.1, top - wy)));
  return hb * Math.sqrt(Math.max(0, 1 - Math.pow((wy - y) / Math.max(0.05, wy - kl), 2)));
};
const PORTS = [0.27, 0.355, 0.44, 0.525, 0.61, 0.695, 0.78];
const hullTex = () => canvasTex(1024, 512, (g) => {
  const W = 1024, H = 512, r = rng(321);
  const py = (y: number) => (1 - (y - HULL.VMIN) / (HULL.VMAX - HULL.VMIN)) * H;
  g.fillStyle = "#4e2d20"; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x++) {
    const t = x / W, top = sheer(t);
    const band = (y0: number, y1: number, c: string) => { g.fillStyle = c; g.fillRect(x, py(y1), 1, py(y0) - py(y1)); };
    band(-0.4, 0.2, "#e6d9bc");            // light waterline
    band(0.2, 0.32, "#2a1810");
    band(0.32, 1.22, "#66392a");           // dark-brown lower planking
    band(1.22, 1.3, "#d6a24a");            // yellow wale
    band(1.3, 2.05, "#a3352a");            // red gun-deck stripe
    band(2.05, 2.13, "#d6a24a");
    band(2.13, top - 0.22, "#5b3323");     // dark-brown upper works
    band(top - 0.22, top - 0.12, "#cf9b46"); // rail line
    band(top - 0.12, top + 0.1, "#2c1a12");
    if (t < 0.22) { band(2.8, 2.86, "#cf9b46"); band(3.65, 3.71, "#cf9b46"); }
  }
  // plank seams
  for (let y = 0.45; y < 5.4; y += 0.27) { g.fillStyle = "rgba(10,5,3,0.35)"; g.fillRect(0, py(y), W, 1.5); g.fillStyle = "rgba(255,220,180,0.06)"; g.fillRect(0, py(y) + 1.5, W, 1); }
  for (let i = 0; i < 90; i++) { const x = r() * W, y = 0.4 + r() * 4.8; g.fillStyle = "rgba(10,5,3,0.3)"; g.fillRect(x, py(y) - 8, 1.5, 8); }
  for (let i = 0; i < 160; i++) { const x = r() * W, y = 0.3 + r() * 5; g.fillStyle = rgba(255, 210, 170, 0.05 + 0.05 * r()); g.fillRect(x, py(y), 20 + 60 * r(), 2); }
  // gunports: lid-red frame, black opening
  const sx = W / HULL.L;
  for (const t of PORTS) {
    const cx = t * W, cy = py(1.67), s = 0.58 * sx;
    g.fillStyle = "#c9573b"; g.fillRect(cx - s / 2 - 5, cy - s / 2 - 5, s + 10, s + 10);
    g.fillStyle = "#120a08"; g.fillRect(cx - s / 2, cy - s / 2, s, s);
    g.fillStyle = "rgba(255,190,140,0.35)"; g.fillRect(cx - s / 2 - 5, cy - s / 2 - 5, s + 10, 3);
  }
  // stern castle windows (warm glow) + quarter gallery
  for (const t of [0.05, 0.1, 0.15]) {
    const cx = t * W, cy = py(3.25), w = 0.5 * sx, h = 0.55 * sx;
    g.fillStyle = "#1a100c"; g.fillRect(cx - w / 2 - 4, cy - h / 2 - 4, w + 8, h + 8);
    g.fillStyle = "#f0c35c"; g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.fillStyle = "#1a100c"; g.fillRect(cx - 1.5, cy - h / 2, 3, h); g.fillRect(cx - w / 2, cy - 1.5, w, 3);
  }
}, false);

/** rigging: thin camera-facing ribbons of a constant pixel width (SCENERY.uRes = render size), hazed like the hull.
 *  1 px GL lines alias and crawl as the camera moves; these keep ~1.5 px. segs = [ax, ay, az, bx, by, bz, ...] */
const ropeMesh = (segs: number[], hex: string, px: number, haze: number) => {
  const pos: number[] = [], oth: number[] = [], sd: number[] = [], idx: number[] = [];
  for (let i = 0; i < segs.length; i += 6) {
    const a = segs.slice(i, i + 3), b = segs.slice(i + 3, i + 6), k = pos.length / 3;
    pos.push(...a, ...a, ...b, ...b); oth.push(...b, ...b, ...a, ...a); sd.push(1, -1, 1, -1);
    idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("aOther", new THREE.Float32BufferAttribute(oth, 3));
  g.setAttribute("aSide", new THREE.Float32BufferAttribute(sd, 1)); g.setIndex(idx);
  const vs = /* glsl */ `${VERT_HEAD}
uniform vec2 uRes; uniform float uPx; attribute vec3 aOther; attribute float aSide;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec4 ca = projectionMatrix * viewMatrix * w, cb = projectionMatrix * viewMatrix * (modelMatrix * vec4(aOther, 1.0));
  vec2 d = (cb.xy / cb.w - ca.xy / ca.w) * uRes; d = length(d) > 1e-6 ? normalize(d) : vec2(1.0, 0.0);
  ca.xy += vec2(-d.y, d.x) * aSide * uPx / uRes * ca.w;
  vUv = vec2(0.0); vH = position.y; vW = w.xyz; vN = vec3(0.0, 1.0, 0.0);
  gl_Position = ca;
}`;
  return new THREE.Mesh(g, mat(vs, /* glsl */ `
uniform vec3 uColor; uniform float uHaze;
void main(){ emit(mix(uColor, skyAt(viewDir()), uHaze), 1.0); }`, { uColor: { value: rawColor(hex) }, uHaze: { value: haze }, uRes: SCENERY.uRes, uPx: { value: px } }));
};

export function galleon(): THREE.Group {
  const G = new THREE.Group(); G.name = "galleon";
  const { L, VMIN, VMAX } = HULL;
  const zOf = (t: number) => -L / 2 + t * L;
  // --- hull: lofted stations, both sides, smooth normals, side-projected texture
  {
    const NS = 48, NP = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (const sd of [-1, 1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= NS; i++) {
        const t = Math.pow(i / NS, 1.0), top = sheer(t), kl = keelY(t);
        for (let j = 0; j <= NP; j++) {
          const a = j / NP, y = lerp(top, kl, a * a * 0.4 + a * 0.6);
          pos.push(sd * hullX(t, y), y, zOf(t)); uv.push(t, (y - VMIN) / (VMAX - VMIN));
        }
      }
      for (let i = 0; i < NS; i++) for (let j = 0; j < NP; j++) {
        const a = base + i * (NP + 1) + j, b = a + NP + 1;
        if (sd < 0) idx.push(a, b, a + 1, a + 1, b, b + 1); else idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const hull = new THREE.Mesh(g, paint("#ffffff", { map: hullTex(), shade: [0.55, 0.52, 0.66], soft: 0.35, haze: 0.05 })); G.add(hull);
    const og = g.clone(), op = og.attributes.position as THREE.BufferAttribute, on = og.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < op.count; i++) { const sx = Math.sign(op.getX(i)) || 1, k = on.getX(i) * sx < 0 ? -0.07 : 0.07; op.setXYZ(i, op.getX(i) + on.getX(i) * k, op.getY(i) + on.getY(i) * k, op.getZ(i) + on.getZ(i) * k); }
    hull.add(new THREE.Mesh(og, lineMat("#140b08", 0.04, 0, HULL_SIDE)));
    // transom + deck
    const soup = new Soup(), t0 = 0, top0 = sheer(t0), ctr = V(0, (top0 + HULL.KEEL) / 2, zOf(t0)), prof: THREE.Vector3[] = [];
    for (let j = 0; j <= NP; j++) { const y = lerp(top0, HULL.KEEL, j / NP); prof.push(V(-hullX(t0, y), y, zOf(t0))); }
    for (let j = NP; j >= 0; j--) { const y = lerp(top0, HULL.KEEL, j / NP); prof.push(V(hullX(t0, y), y, zOf(t0))); }
    for (let k = 0; k < prof.length - 1; k++) soup.tri(ctr, prof[k], prof[k + 1], [0, 0], [0, 0], [0, 0]);
    G.add(new THREE.Mesh(soup.build(), paint("#553022", { shade: [0.55, 0.52, 0.66], haze: 0.05 })));
    const deck = new Soup();
    for (let i = 0; i < 30; i++) {
      const ta = i / 30, tb = (i + 1) / 30, ya = sheer(ta) - 0.85, yb = sheer(tb) - 0.85;
      const xa = hullX(ta, ya) * 0.97, xb = hullX(tb, yb) * 0.97;
      deck.quad(V(-xa, ya, zOf(ta)), V(xa, ya, zOf(ta)), V(xb, yb, zOf(tb)), V(-xb, yb, zOf(tb)), [0, 0], [0, 0], [0, 0], [0, 0]);
    }
    G.add(new THREE.Mesh(deck.build(), paint("#8d6142", { shade: [0.6, 0.56, 0.7], haze: 0.05 })));
  }
  const spar = paint("#4a2f21", { shade: [0.5, 0.46, 0.6], soft: 0.3, haze: 0.05 });
  const dark = paint("#22201f", { shade: [0.5, 0.5, 0.62], soft: 0.3, haze: 0.05 });
  const cyl = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, m: THREE.Material, seg = 8) => {
    const L2 = a.distanceTo(b), g = new THREE.CylinderGeometry(r1, r0, L2, seg, 1);
    const me = new THREE.Mesh(g, m); me.position.copy(a).lerp(b, 0.5);
    me.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); G.add(me); return me;
  };
  // --- guns run out of the ports (both sides)
  for (const t of PORTS) for (const sd of [-1, 1]) {
    const x = sd * hullX(t, 1.67);
    cyl(V(x - sd * 0.1, 1.67, zOf(t)), V(x + sd * 0.55, 1.69, zOf(t)), 0.15, 0.12, dark, 8);
  }
  // --- bowsprit, masts, sails, yards, flag
  const bowTip = V(0, sheer(1) + 2.0, L / 2 + 4.6);
  cyl(V(0, sheer(1) - 0.4, L / 2 - 2.2), bowTip, 0.2, 0.1, spar);
  const sailMap = sailTex();
  const sailM = paint("#ffffff", { map: sailMap, shade: [0.76, 0.7, 0.72], soft: 0.45, haze: 0.05 });
  const MASTS = [ // t, deck y, mast top, sail scale, brace (rad)
    { t: 0.3, top: 13.0, k: 0.88, y0: 4.9 },
    { t: 0.53, top: 15.6, k: 1.0, y0: 3.9 },
    { t: 0.74, top: 13.6, k: 0.9, y0: 3.9 },
  ];
  const lines: number[] = [];
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const tops: THREE.Vector3[] = [];
  const brace = -1.08; // yards braced round so the sails show their (lit) faces at an angle
  const bdir = V(Math.cos(brace), 0, Math.sin(brace)); // yard direction (unit, horizontal)
  const bn = V(-bdir.z, 0, bdir.x); // sail normal before billow (points toward -x/+z mix)
  for (const m of MASTS) {
    const z = zOf(m.t), deckY = sheer(m.t) - 0.85, top = V(0, m.top, z);
    cyl(V(0, deckY, z), top, 0.24 * m.k, 0.12, spar);
    tops.push(top);
    // three tiers: course, topsail, topgallant
    const tiers = [[m.y0, m.y0 + 3.9 * m.k, 3.3 * m.k, 3.1 * m.k], [m.y0 + 4.2 * m.k, m.y0 + 7.4 * m.k, 3.0 * m.k, 2.7 * m.k], [m.y0 + 7.7 * m.k, m.y0 + 9.9 * m.k, 2.6 * m.k, 2.2 * m.k]];
    for (const [ya, yb, wb, wt] of tiers) {
      if (yb > m.top - 0.3) continue;
      const nu = 8, nv = 6, pos: number[] = [], uv: number[] = [], idx: number[] = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
        const u = i / nu, v = j / nv, w = lerp(wb, wt, v), y = lerp(ya, yb, v) - 0.15 * Math.sin(Math.PI * u) * (1 - v);
        const bil = 0.75 * Math.sin(Math.PI * u) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, v * 1.1)));
        const p = V(0, y, z).addScaledVector(bdir, (u - 0.5) * w).addScaledVector(bn, -bil - 0.25);
        pos.push(p.x, p.y, p.z); uv.push(u, v);
        if (i < nu && j < nv) { const a = j * (nu + 1) + i; idx.push(a, a + 1, a + nu + 1, a + 1, a + nu + 2, a + nu + 1); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      G.add(new THREE.Mesh(g, sailM));
      const yd = (y: number, w: number) => cyl(V(0, y, z).addScaledVector(bdir, -w / 2 - 0.3).addScaledVector(bn, -0.2), V(0, y, z).addScaledVector(bdir, w / 2 + 0.3).addScaledVector(bn, -0.2), 0.09, 0.09, spar, 6);
      yd(yb + 0.05, wt); if (ya === m.y0) yd(ya - 0.1, wb);
      // sheets from the lower corners down to the rail
      const lc = V(0, ya, z).addScaledVector(bdir, -wb / 2).addScaledVector(bn, -0.25), rc = V(0, ya, z).addScaledVector(bdir, wb / 2).addScaledVector(bn, -0.25);
      if (ya === m.y0) { seg(lc, V(-halfB(m.t), sheer(m.t), z - 1.6)); seg(rc, V(halfB(m.t), sheer(m.t), z + 1.6)); }
    }
    // shrouds: fans from the masthead to both rails
    for (const sd of [-1, 1]) for (const dz of [-1.3, -0.4, 0.5]) seg(V(0, m.top - 2.2, z), V(sd * halfB(m.t) * 0.98, sheer(m.t) - 0.05, z + dz));
    // crow's nest on the main
    if (m.k === 1) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.45, 10), spar); n.position.set(0, m.y0 + 7.6, z); G.add(n); }
  }
  // stays
  seg(tops[2], bowTip); seg(V(0, tops[2].y - 3, tops[2].z), bowTip.clone().add(V(0, -0.8, -1.5)));
  seg(tops[1], V(0, sheer(0.74) - 0.5, zOf(0.74) + 0.3)); seg(tops[1], V(0, tops[2].y - 2, tops[2].z));
  seg(tops[0], V(0, tops[1].y - 2.5, tops[1].z)); seg(tops[0], V(0, sheer(0) + 0.1, zOf(0.02)));
  seg(bowTip, V(0, sheer(1) - 0.9, L / 2 + 0.4));
  G.add(ropeMesh(lines, "#2b1e18", 1.5, 0.06));
  // black flag streaming aft from a staff on the main masthead
  {
    const staffTop = tops[1].clone().add(V(0, 1.9, 0));
    cyl(tops[1], staffTop, 0.08, 0.06, spar, 6);
    const fw = 2.0, fh = 1.35, g = new THREE.PlaneGeometry(fw, fh, 10, 4);
    g.translate(fw / 2, 0, 0); g.rotateY(Math.PI / 2); // flag spans -z (aft) from the staff
    const fm = paint("#ffffff", { map: skullFlag(), shade: [0.62, 0.6, 0.72], soft: 0.4, haze: 0.04,
      vs: vert("", "float k = clamp(-p.z / 2.0, 0.0, 1.0); p.x += k * (0.22 * sin(-p.z * 3.2 - uT * 9.0) + 0.08 * sin(p.y * 4.0 - uT * 6.0)); p.y -= k * k * 0.12;") });
    const fl = new THREE.Mesh(g, fm); fl.position.copy(staffTop).add(V(0, -fh / 2 - 0.05, 0)); G.add(fl);
  }
  // stern lantern: small dark cage with a warm pane, on a short bracket
  {
    const at = V(0, sheer(0) + 0.32, zOf(0) - 0.1);
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.2), dark); cage.position.copy(at); G.add(cage);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.13), paint("#f2c45e", { flat: true, haze: 0.05 })); pane.position.copy(at); G.add(pane);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 6), dark); cap.position.copy(at).add(V(0, 0.19, 0)); G.add(cap);
    cyl(V(0, sheer(0) - 0.05, zOf(0) + 0.05), at.clone().add(V(0, -0.13, 0)), 0.04, 0.04, dark, 5);
  }
  return onNoInk(G) as THREE.Group;
}

// ---------------------------------------------------------------- clouds
/** one cloud: `size` = overall width in metres (local x); origin at the flat base centre; depth along local z, so
 *  `cluster.lookAt(camera)` turns its broad side to the view. seed % 4 picks the family:
 *  0 flat-bottomed cumulus with a central dome, 1 tower of stacked balls, 2 wide low heap, 3 small ragged puff */
export function cloudCluster(seed: number, size: number, hazeK = 0.55): THREE.Group {
  const r = rng(seed * 7919 + 13), W = size, out: Blob[] = [], fam = ((seed % 4) + 4) % 4;
  const add = (x: number, y: number, z: number, rad: number) => out.push({ c: V(x * W, y * W, z * W), r: rad * W });
  if (fam === 0) {
    const n = 5 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) { const u = i / (n - 1), rad = 0.1 + 0.05 * Math.exp(-Math.pow((u - 0.45) / 0.35, 2)) + 0.015 * r(); add((u - 0.5) * 0.74, rad * 0.42, (r() - 0.5) * 0.06, rad); }
    const cx = -0.04 + (r() - 0.5) * 0.08;
    add(cx - 0.12, 0.12, 0.0, 0.15); add(cx + 0.11, 0.11, 0.01, 0.14); add(cx, 0.2, -0.02, 0.17);
    add(cx - 0.02, 0.32, 0.0, 0.1 + 0.02 * r());
    for (let i = 0; i < 4; i++) { const ang = Math.PI * (0.18 + 0.64 * (i / 3)) + (r() - 0.5) * 0.2; add(cx + Math.cos(ang) * 0.17, 0.2 + Math.sin(ang) * 0.13, 0.03, 0.065 + 0.02 * r()); }
  } else if (fam === 1) {
    // organic stack: a base row, then balls grown upward off existing ones (biased to one column)
    const nb = 4 + Math.floor(r() * 2), base = 0.1;
    for (let i = 0; i < nb; i++) add((i / (nb - 1) - 0.5) * 0.62 + (r() - 0.5) * 0.04, base * 0.4, (r() - 0.5) * 0.1, base * (0.85 + 0.3 * r()));
    const colX = (r() < 0.5 ? -1 : 1) * 0.12;
    for (let k = 0; k < 7 + Math.floor(r() * 4); k++) {
      const par = out[Math.floor(out.length * (0.35 + 0.65 * r()))], rad = (0.085 + 0.045 * r()) * W;
      const ang = Math.PI * (0.5 + (r() - 0.5) * 0.9) - Math.sign(par.c.x / W - colX) * 0.35, dd = (par.r + rad) * 0.72;
      const c = par.c.clone().add(V(Math.cos(ang) * dd, Math.abs(Math.sin(ang)) * dd, (r() - 0.5) * 0.06 * W));
      if (c.y / W < 0.85) out.push({ c, r: rad });
    }
  } else if (fam === 2) {
    const n = 6 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) { const u = i / (n - 1), rad = 0.09 + 0.035 * Math.sin(Math.PI * u) + 0.015 * r(); add((u - 0.5) * 0.8, rad * 0.35, (r() - 0.5) * 0.1, rad); }
    const m = 3 + Math.floor(r() * 2);
    for (let i = 0; i < m; i++) { const u = (i + 0.5) / m, rad = 0.1 + 0.03 * r(); add((u - 0.5) * 0.45 + (r() - 0.5) * 0.06, 0.13 + 0.04 * Math.sin(Math.PI * u) + 0.02 * r(), (r() - 0.5) * 0.08, rad); }
    if (r() < 0.6) add((r() - 0.5) * 0.15, 0.25, 0, 0.085);
  } else {
    const n = 5 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) { const u = i / (n - 1), rad = 0.12 + 0.07 * Math.sin(Math.PI * u) + 0.03 * r(); add((u - 0.5) * 0.66, rad * 0.4 + 0.03 * r(), (r() - 0.5) * 0.12, rad); }
    add((r() - 0.5) * 0.2, 0.22, 0.02, 0.13);
  }
  const g = blobGeo(out, { flatY: 0, segK: 22 / Math.max(8, W * 0.12), minSeg: 12, maxSeg: 20, aoK: 0.45, smooth: 0.1 });
  const G = new THREE.Group(); G.name = `cloud${seed}`;
  G.add(new THREE.Mesh(g, cloudMat(hazeK)));
  return onNoInk(G) as THREE.Group;
}
/** the shot's sky: [azimuth deg, elevation deg, width deg, distance m, seed]. Low clouds that sit behind the stacks
 *  are pushed past them (>= 600 m); the film's dome does not write depth, so anything up to the far plane shows. */
export const CLOUDS: [number, number, number, number, number][] = [
  [-1.5, 16.5, 9.5, 520, 4], [13.5, 8.5, 4.6, 540, 1], [9.5, 0.6, 8.5, 620, 2], [-10, 25, 9, 480, 8],
  [27, 14, 8, 500, 12], [-27, 7, 7, 610, 3], [44, 4, 9, 560, 6], [58, 17, 10, 470, 5],
  [80, 9, 8, 520, 9], [104, 15, 11, 500, 16], [128, 5, 9, 560, 10], [150, 20, 10, 480, 13], [-48, 19, 9, 500, 17],
];
export function cloudField(center = V(0, 1.5, 0)): THREE.Group {
  const G = new THREE.Group(); G.name = "cloudField";
  for (const [az, el, wd, d, seed] of CLOUDS) {
    const w = 2 * d * Math.tan((wd * D2R) / 2), c = cloudCluster(seed, w, 0.55);
    const e = el * D2R, a = az * D2R;
    c.position.set(center.x + d * Math.cos(e) * Math.cos(a), center.y + d * Math.sin(e), center.z + d * Math.cos(e) * Math.sin(a));
    c.lookAt(center.x, c.position.y, center.z);
    G.add(c);
  }
  return G;
}

// ---------------------------------------------------------------- animation
/** call once per frame with the film time in seconds */
export function animate(t: number) {
  SCENERY.uT.value = t;
}
/** triangle count of an object tree (budget checks) */
export const triCount = (o: THREE.Object3D) => {
  let n = 0;
  o.traverse((m) => { const me = m as THREE.Mesh; if (me.isMesh) { const g = me.geometry; n += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  return Math.round(n);
};
