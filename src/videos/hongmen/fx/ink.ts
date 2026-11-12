// Ink outlines for the 3D world, the STABLE pass (a corrected copy of src/videos/vasa/ink.ts; same exported names
// InkPass, NOINK, noInkFallback, InkOptions, same constructor, set() and debug modes, so a film switches with ONE
// import line:   import { InkPass, noInkFallback } from "./fx/ink";   (README.md in this folder has the whole story).
//
// What was wrong with the old pass (measured: /home/user/hm_notes/flicker_m.md, flicker_a1.md): it decided every line
// from ONE un-antialiased sample per pixel of its world normal + depth buffer. Anything thinner than a pixel (a
// stick, a cord, the top of a rail seen from the side, the gap between two planks) was hit or missed by the pixel
// centres, and every line sat on whole pixels. A camera move of a fraction of a pixel changed the hits: lines stepped
// a whole pixel (the crawl), sliver faces lit up as black dots and dashes (the pops). The thresholds, the 3x3 tent
// and the depth precision were NOT the cause (each changed alone moves the shimmer by under 3 %).
//
// What this pass does instead, per frame (nothing depends on another frame; a fixed table, no clock, no random number):
//  0. Figure gate, once: the MEDIAN of the 3x3 main depths, then the min over the cross. "No world ink where a
//     figure / card is in front" as before, but a one-pixel-wide run of wrong depth values (the multisampled main
//     depth holds some along faces seen edge-on) can no longer punch holes into an outline.
//  1. For k = 0 .. N-1 (N = `samples`, 8 for the film): shift the projection by a fixed sub-pixel offset, re-render the
//     WORLD ONLY (camera layer 0) normal + depth buffer exactly as the old pass did (output size, no multisampling,
//     nearest), run the SAME edge-mask maths on it and ADD mask / N into an accumulation target.
//     Cost option `skipFlat` (on): per buffer, 4x4 px tiles whose neighbourhood is one flat face are not searched; the
//     mask is 0 there by construction, so the picture is the same.
//  2. Composite as before: 3x3 tent, near-black ink blended in display gamma, fog tint, written back into the input
//     buffer (colour only; the composer's depth texture stays intact).
// Result: the same edges get lines of the same width and colour; a line is now placed with sub-pixel precision, and a
// thing thinner than a pixel gets ink in proportion to how much of the pixel it covers (a 0.4 px stick: a 40 % line
// in every frame, instead of a full black line that is there in one frame and gone in the next).
//
// The edge maths (unchanged from vasa/ink.ts): pixel steps along x, y and both diagonals;
//   depth  - signed 2nd difference of 1/z (exactly 0 on any plane) -> the NEAR side of a depth jump is inked, as a
//            band `width` px wide; crease - normal angle 35..50 deg to a neighbour at the same depth, two-sided band
//            0.8 * width, concave folds at 0.7; widths scale with the output height (5.1 px at 1080x1920 up to 6 m,
//            3.3 px at 90 m, log distance), ink #030303, far opacity 0.95, gone by 450 m, fog-tinted (x 0.3).
// This is a Pass (not an Effect), so R3F's <EffectComposer> keeps it as its own pass BEFORE lens blur / bloom / tone
// mapping. Works for Mesh and InstancedMesh; alpha-tested cut-outs (map + alphaTest) keep their shape.
// The world is drawn N times per frame with an override material (cheap: 0.07 s a time at 1080x1920 on software GL);
// an object's onBeforeRender therefore runs N times: it must not count calls.
import * as THREE from "three";
import { Pass } from "postprocessing";

/** Layer for things that must never be outlined (camera-facing sprites, sky, clouds, smoke). */
export const NOINK = 3;

export type InkOptions = {
  color?: THREE.ColorRepresentation; // sRGB hex of the ink
  strength?: number; // max opacity (0 = the pass does nothing and costs nothing)
  widthNear?: number; // silhouette / depth-jump line width in px at distNear (1080x1920 output)
  widthFar?: number; // ... at distFar
  distNear?: number; // m
  distFar?: number; // m
  creaseScale?: number; // crease line width / silhouette line width
  depthLo?: number; // relative depth jump (1 - z_near / z_far) where lines start
  depthHi?: number; // ... where they are full strength
  angleLo?: number; // crease angle (deg) where lines start
  angleHi?: number; // ... where they are full strength
  concaveGain?: number; // strength of concave folds (object meets ground, inner corners)
  farOpacity?: number; // opacity multiplier reached at distFar
  fadeNear?: number; // m: start of the far fade-out
  fadeFar?: number; // m: lines gone
  // ---- new in the stable pass
  /** sub-pixel sample buffers per frame: 8 (the film, default), 4 (previews: about half the extra cost, a little
   *  more crawl), 1 (draft: the old pass's sampling and cost). Also 2 and 16. Wins over `quality`. */
  samples?: number;
  /** "film" = 8 samples, "preview" = 4, "draft" = 1 */
  quality?: "film" | "preview" | "draft";
  /** true (default): flat 4x4 px tiles are not searched (same picture, less time) */
  skipFlat?: boolean;
  /** "robust" (default): median-of-3x3 figure gate; "legacy": the old 5-tap min of the main depth */
  gate?: "robust" | "legacy";
};

type Base = Required<Omit<InkOptions, "samples" | "quality" | "skipFlat" | "gate">>;
const DEF: Base = {
  color: "#030303", strength: 1.0,
  widthNear: 5.1, widthFar: 3.3, distNear: 6, distFar: 90, creaseScale: 0.8,
  depthLo: 0.01, depthHi: 0.03, angleLo: 35, angleHi: 50, concaveGain: 0.7,
  farOpacity: 0.95, fadeNear: 150, fadeFar: 450,
};

/** fixed sub-pixel sample positions in px from the pixel centre: one sample per row and per column of an N x N grid
 *  (near-level and near-upright edges are what sets are made of, so N different positions per axis matter most) */
const JIT: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.25, -0.25], [0.25, 0.25]],
  4: [[-0.125, -0.375], [0.375, -0.125], [-0.375, 0.125], [0.125, 0.375]],
  8: ([[1, -3], [-1, 3], [5, 1], [-3, -5], [-5, 5], [-7, -1], [3, 7], [7, -7]] as [number, number][]).map(([x, y]) => [x / 16, y / 16] as [number, number]),
  16: ([[1, 1], [-1, -3], [-3, 2], [4, -1], [-5, -2], [2, 5], [5, 3], [3, -5], [-2, 6], [0, -7], [-4, -6], [-6, 4], [-8, 0], [7, -4], [6, 7], [-7, -8]] as [number, number][]).map(([x, y]) => [x / 16, y / 16] as [number, number]),
};
const QUALITY = { film: 8, preview: 4, draft: 1 } as const;
const sampleCount = (o: InkOptions, fallback: number) => {
  const want = o.samples ?? (o.quality ? QUALITY[o.quality] : fallback);
  let n = 1;
  for (const k of [1, 2, 4, 8, 16]) if (k <= want) n = k;
  return n;
};

const FS_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// world-only normal pass (scene.overrideMaterial); works for Mesh and InstancedMesh. Cut-out materials
// (map + alphaTest, e.g. a sign board) keep their shape: see onBeforeRender in the constructor.
const NORMAL_VERT = /* glsl */ `
#include <common>
uniform mat3 cutUv;
varying vec3 vN;
varying vec3 vV;
varying vec2 vCut;
void main() {
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  vN = transformedNormal;
  vCut = (cutUv * vec3(uv, 1.0)).xy;
  #include <begin_vertex>
  #include <project_vertex>
  vV = mvPosition.xyz;
}`;
const NORMAL_FRAG = /* glsl */ `
uniform sampler2D tCut;
uniform float cut;
varying vec3 vN;
varying vec3 vV;
varying vec2 vCut;
void main() {
  if (cut > 0.0 && texture2D(tCut, vCut).a < cut) discard;
  vec3 n;
  if (dot(vN, vN) < 1e-8) n = normalize(cross(dFdx(vV), dFdy(vV)));   // geometry without normals
  else n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);            // back faces of double-sided planes
  gl_FragColor = vec4(n, 1.0);
}`;

// figure gate, prepass 1: the MEDIAN of the 3x3 main depths (view distance, m). A line of wrong depth values one pixel
// wide cannot pass a median; a figure two or more pixels wide does.
const GATE1_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tMainDepth;
uniform vec2 texel;
uniform float cNear;
uniform float cFar;
varying vec2 vUv;
float dist(vec2 uv) { return -perspectiveDepthToViewZ(textureLod(tMainDepth, uv, 0.0).x, cNear, cFar); }
#define SW(a, b) { float lo = min(v[a], v[b]); v[b] = max(v[a], v[b]); v[a] = lo; }
void main() {
  float v[9];
  for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++) v[j * 3 + i] = dist(vUv + vec2(float(i - 1), float(j - 1)) * texel);
  SW(1, 2) SW(4, 5) SW(7, 8) SW(0, 1) SW(3, 4) SW(6, 7) SW(1, 2) SW(4, 5) SW(7, 8) SW(0, 3) SW(5, 8) SW(4, 7) SW(3, 6) SW(1, 4) SW(2, 5) SW(4, 7) SW(4, 2) SW(6, 4) SW(4, 2)
  gl_FragColor = vec4(v[4], 0.0, 0.0, 1.0);
}`;
// prepass 2: the min over the cross (the figure grows by one pixel, as the old gate's 5-tap min did)
const GATE2_FRAG = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 texel;
varying vec2 vUv;
void main() {
  float z = textureLod(tSrc, vUv, 0.0).r;
  z = min(z, min(textureLod(tSrc, vUv + vec2(texel.x, 0.0), 0.0).r, textureLod(tSrc, vUv - vec2(texel.x, 0.0), 0.0).r));
  z = min(z, min(textureLod(tSrc, vUv + vec2(0.0, texel.y), 0.0).r, textureLod(tSrc, vUv - vec2(0.0, texel.y), 0.0).r));
  gl_FragColor = vec4(z, 0.0, 0.0, 1.0);
}`;

// skipFlat, pass 1 (one fragment = one 4x4 px tile of the world buffer): 1 if the tile holds anything that is not one
// flat face: a coverage edge, a normal change of more than 2 deg between direct neighbours, or a 2nd difference of
// 1/z between direct neighbours over `tau` (far below what the mask's search could add up to a line: see setSize)
const TILE_FRAG = /* glsl */ `
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 texel;      // one buffer pixel in uv
uniform float kd;        // 1 - near / far: 1/z = (1 - kd * depth) / near
uniform float tau;
uniform float cosEps;
void main() {
  vec2 base = floor(gl_FragCoord.xy) * 4.0 + 0.5;
  float flag = 0.0;
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) {
    vec2 uv = (base + vec2(float(i), float(j))) * texel;
    vec4 c = textureLod(tNormal, uv, 0.0), nx = textureLod(tNormal, uv + vec2(texel.x, 0.0), 0.0), ny = textureLod(tNormal, uv + vec2(0.0, texel.y), 0.0);
    if (abs(c.a - nx.a) > 0.5 || abs(c.a - ny.a) > 0.5) flag = 1.0;
    else if (c.a > 0.5) {
      if (dot(c.xyz, nx.xyz) < cosEps || dot(c.xyz, ny.xyz) < cosEps) flag = 1.0;
      float dc = textureLod(tDepth, uv, 0.0).x, W = 1.0 - kd * dc;
      float sx = textureLod(tDepth, uv + vec2(texel.x, 0.0), 0.0).x + textureLod(tDepth, uv - vec2(texel.x, 0.0), 0.0).x - 2.0 * dc;
      float sy = textureLod(tDepth, uv + vec2(0.0, texel.y), 0.0).x + textureLod(tDepth, uv - vec2(0.0, texel.y), 0.0).x - 2.0 * dc;
      if (max(abs(sx), abs(sy)) * kd > tau * W) flag = 1.0;
    }
  }
  gl_FragColor = vec4(flag, 0.0, 0.0, 1.0);
}`;
// pass 2: the marks grown by `m` tiles in every direction (the search radius + 1 px, rounded up to tiles)
const TILE2_FRAG = /* glsl */ `
uniform sampler2D tSrc;
uniform int m;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy), hi = textureSize(tSrc, 0) - 1;
  float f = 0.0;
  for (int j = -3; j <= 3; j++) for (int i = -3; i <= 3; i++) {
    if (abs(i) > m || abs(j) > m) continue;
    f = max(f, texelFetch(tSrc, clamp(p + ivec2(i, j), ivec2(0), hi), 0).r);
  }
  gl_FragColor = vec4(f, 0.0, 0.0, 1.0);
}`;

// the edge mask of ONE world buffer, added into the accumulation target with weight 1 / N.
// The maths between "float t = ..." and "float ink = ..." is vasa/ink.ts, line for line.
const MASK_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform sampler2D tMainDepth;
uniform sampler2D tGate;
uniform sampler2D tTile;
uniform vec2 texel;
uniform float cNear;
uniform float cFar;
uniform float p00;
uniform float p11;
uniform float wNear;
uniform float wFar;
uniform float dNear;
uniform float dFar;
uniform float creaseScale;
uniform float depthLo;
uniform float depthHi;
uniform float cosLo;
uniform float cosHi;
uniform float concaveGain;
uniform float farOpacity;
uniform float fadeNear;
uniform float fadeFar;
uniform float strength;
uniform float useMain;   // 0 = no main depth, 1 = the robust gate (tGate), 2 = the legacy 5-tap gate
uniform float skip;      // 1 = flat tiles are not searched
uniform float weight;    // 1 / N
uniform float pxScale;   // output px per 1080x1920 px
uniform vec2 fogRange;   // scene fog near / far (m); far <= near = no fog tint
uniform float fogStart;  // ink stays pure black up to here (m), then tints toward the fog colour
varying vec2 vUv;

// pixel steps along x, y and both diagonals, and their length in px
const vec2 STEP[4] = vec2[4](vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(1.0, -1.0));
const float SLEN[4] = float[4](1.0, 1.0, 1.41421, 1.41421);
#define RMAX 12   // covers 5.1 px x pxScale 2 = 10.2 px at 2160x3840 (+0.5 AA ramp)

// textureLod: explicit LOD inside loops (nearest-filtered targets, no derivatives needed)
float dist(sampler2D t, vec2 uv) { return -perspectiveDepthToViewZ(textureLod(t, uv, 0.0).x, cNear, cFar); }
vec3 viewPos(vec2 uv, float d) { vec2 n = uv * 2.0 - 1.0; return vec3(n.x * d / p00, n.y * d / p11, -d); }

// crease strength between this pixel (n0, P0) and a neighbour
float crease(vec3 n0, vec3 P0, float zc, vec2 uq, float zq) {
  vec4 nq = textureLod(tNormal, uq, 0.0);
  if (nq.a < 0.5 || abs(zq - zc) > zc * depthLo) return 0.0;       // sky / depth jump: not a crease
  float k = 1.0 - smoothstep(cosHi, cosLo, dot(n0, nq.xyz));
  if (dot(viewPos(uq, zq) - P0, n0) > 0.0) k *= concaveGain;        // neighbour in front of our tangent plane: concave
  return k;
}

void main() {
  vec4 nc = textureLod(tNormal, vUv, 0.0);
  if (nc.a < 0.5) { gl_FragColor = vec4(0.0); return; }          // sky / empty: ink lives on the near object only
  float zc = dist(tDepth, vUv);

  // characters, cards etc. (not in the world buffer) in front of this pixel: no world ink over them.
  // The sub-pixel offset of this buffer is under half a pixel, so the gate is read at the pixel itself.
  if (useMain > 0.5) {
    float zm;
    if (useMain < 1.5) zm = textureLod(tGate, vUv, 0.0).r;
    else {
      zm = dist(tMainDepth, vUv);
      zm = min(zm, dist(tMainDepth, vUv + vec2(texel.x, 0.0)));
      zm = min(zm, dist(tMainDepth, vUv - vec2(texel.x, 0.0)));
      zm = min(zm, dist(tMainDepth, vUv + vec2(0.0, texel.y)));
      zm = min(zm, dist(tMainDepth, vUv - vec2(0.0, texel.y)));
    }
    if (zm < zc * 0.985 - 0.03) { gl_FragColor = vec4(0.0); return; }
  }

  float f0 = max(fogRange.x, fogStart);
  float fogK = fogRange.y > f0 ? clamp((zc - f0) / (fogRange.y - f0), 0.0, 1.0) : 0.0;
  // one flat face all round: no line can start here (the fog amount is still written, as without the skip)
  if (skip > 0.5 && texelFetch(tTile, ivec2(gl_FragCoord.xy) / 4, 0).r < 0.5) { gl_FragColor = vec4(0.0, fogK * weight, 0.0, weight); return; }

  float t = clamp(log(zc / dNear) / log(dFar / dNear), 0.0, 1.0);
  float w = mix(wNear, wFar, t) * pxScale;           // silhouette line width (output px) at this distance, near side only
  float hc = 0.5 * w * creaseScale;                  // crease line half width (px), drawn on both faces
  float Wc = 1.0 / zc;
  vec3 n0 = nc.xyz;
  vec3 P0 = viewPos(vUv, zc);
  float eD = 0.0, eN = 0.0;
  for (int a = 0; a < 4; a++) {
    for (int r = 1; r <= RMAX; r++) {
      vec2 o = STEP[a] * texel * float(r);
      float d = (float(r) - 0.5) * SLEN[a];          // distance of this pixel's centre to an edge first seen at r
      float cw = clamp(w + 0.5 - d, 0.0, 1.0);       // continuous coverage -> no width popping, built-in AA
      float ch = clamp(hc + 0.5 - d, 0.0, 1.0);
      if (cw <= 0.0 && ch <= 0.0) break;
      float z1 = dist(tDepth, vUv - o), z2 = dist(tDepth, vUv + o);
      // depth jump: this pixel is in front of its neighbours (2nd difference of 1/z < 0; exactly 0 on planes)
      float s = (1.0 / z1 + 1.0 / z2 - 2.0 * Wc) / Wc;
      eD = max(eD, smoothstep(depthLo, depthHi, -s) * cw);
      // crease: normal turns towards a neighbour at the same depth
      if (ch > 0.0) eN = max(eN, max(crease(n0, P0, zc, vUv - o, z1), crease(n0, P0, zc, vUv + o, z2)) * ch);
    }
  }

  float ink = max(eD, eN) * strength * mix(1.0, farOpacity, t) * (1.0 - smoothstep(fadeNear, fadeFar, zc));
  gl_FragColor = vec4(ink * weight, fogK * weight, 0.0, weight);
}`;

const COMP_FRAG = /* glsl */ `
uniform sampler2D inputBuffer;
uniform sampler2D tMask;
uniform sampler2D tNormal;
uniform sampler2D tTile;
uniform vec2 texel;
uniform vec3 inkColor;
uniform vec3 fogColor;
uniform float fogInk;   // how far fully fogged ink moves toward the fog colour (0.3)
uniform int debug;
varying vec2 vUv;
float m(float x, float y) { return texture2D(tMask, vUv + vec2(x, y) * texel).r; }
void main() {
  float a = (4.0 * m(0.0, 0.0)
    + 2.0 * (m(1.0, 0.0) + m(-1.0, 0.0) + m(0.0, 1.0) + m(0.0, -1.0))
    + m(1.0, 1.0) + m(-1.0, 1.0) + m(1.0, -1.0) + m(-1.0, -1.0)) / 16.0;   // 1-2-1 tent = anti-aliasing
  a = clamp(a, 0.0, 1.0);
  vec4 c = texture2D(inputBuffer, vUv);
  if (debug == 1) { gl_FragColor = vec4(vec3(1.0 - a), 1.0); return; }               // mask only
  if (debug == 2) { gl_FragColor = vec4(texture2D(tNormal, vUv).xyz * 0.5 + 0.5, 1.0); return; } // world normals (last buffer)
  if (debug == 3) { gl_FragColor = vec4(vec3(1.0 - a) * (0.55 + 0.45 * texelFetch(tTile, ivec2(gl_FragCoord.xy) / 4, 0).r), 1.0); return; } // mask, searched tiles bright (last buffer)
  // blend in display (gamma) space like Canvas2D does for the character drawings: coverage -> darkness is linear
  // on screen, so the measured line widths equal the coverage widths (a linear-light blend reads ~30 % thinner)
  float fk = texture2D(tMask, vUv).g;                       // fog amount of the line (max over the AA footprint)
  fk = max(fk, max(texture2D(tMask, vUv + vec2(texel.x, 0.0)).g, texture2D(tMask, vUv - vec2(texel.x, 0.0)).g));
  fk = max(fk, max(texture2D(tMask, vUv + vec2(0.0, texel.y)).g, texture2D(tMask, vUv - vec2(0.0, texel.y)).g));
  vec3 inkC = mix(inkColor, fogColor, clamp(fk, 0.0, 1.0) * fogInk);
  vec3 g = pow(max(c.rgb, 0.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(pow(mix(g, pow(inkC, vec3(1.0 / 2.2)), a), vec3(2.2)), c.a);
}`;

const COPY_FRAG = /* glsl */ `
uniform sampler2D tSrc;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tSrc, vUv);
  #include <colorspace_fragment>
}`;

const target = (type: THREE.TextureDataType, filter: THREE.MagnificationTextureFilter = THREE.NearestFilter) =>
  new THREE.WebGLRenderTarget(1, 1, { type, minFilter: filter, magFilter: filter, generateMipmaps: false, depthBuffer: false });

export class InkPass extends Pass {
  /** 0 = normal, 1 = show the ink mask, 2 = show the world normal buffer, 3 = the mask with the searched tiles bright */
  debug = 0;
  private world: THREE.Scene;
  private cam: THREE.PerspectiveCamera;
  private rt: THREE.WebGLRenderTarget;      // world normal + depth of ONE sub-pixel sample (reused N times a frame)
  private accRT: THREE.WebGLRenderTarget;   // the mask: the mean of the N samples' masks (r), fog amount (g)
  private tmpRT: THREE.WebGLRenderTarget;
  private gateA: THREE.WebGLRenderTarget;
  private gateB: THREE.WebGLRenderTarget;
  private tileA: THREE.WebGLRenderTarget;
  private tileB: THREE.WebGLRenderTarget;
  private normalMat: THREE.ShaderMaterial;
  private maskMat: THREE.ShaderMaterial;
  private gate1Mat: THREE.ShaderMaterial;
  private gate2Mat: THREE.ShaderMaterial;
  private tileMat: THREE.ShaderMaterial;
  private tile2Mat: THREE.ShaderMaterial;
  private compMat: THREE.ShaderMaterial;
  private copyMat: THREE.ShaderMaterial;
  private fsScene = new THREE.Scene();
  private fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: THREE.Mesh;
  private clearCol = new THREE.Color();
  private n: number;
  private skipFlat: boolean;
  private robust: boolean;
  private hasMain = false;
  private W = 1;
  private H = 1;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, options: InkOptions = {}) {
    super("InkPass");
    const o = { ...DEF, ...options };
    this.world = scene;
    this.cam = camera;
    this.cam.layers.enable(NOINK); // the main render still shows the NOINK layer (and its shadows)
    this.needsSwap = false; // writes back into the input buffer (keeps the composer's depth texture intact)
    this.needsDepthTexture = true;
    this.n = sampleCount(options, 8);
    this.skipFlat = options.skipFlat ?? true;
    this.robust = (options.gate ?? "robust") === "robust";

    this.rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
      generateMipmaps: false, depthBuffer: true, samples: 0,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    this.accRT = target(THREE.HalfFloatType);
    this.gateA = target(THREE.HalfFloatType); this.gateB = target(THREE.HalfFloatType);
    this.tileA = target(THREE.UnsignedByteType); this.tileB = target(THREE.UnsignedByteType);
    this.tmpRT = target(THREE.HalfFloatType, THREE.LinearFilter);

    this.normalMat = new THREE.ShaderMaterial({
      vertexShader: NORMAL_VERT, fragmentShader: NORMAL_FRAG, side: THREE.DoubleSide,
      uniforms: { tCut: { value: null }, cut: { value: 0 }, cutUv: { value: new THREE.Matrix3() } },
    });
    // per object: copy the original material's cut-out (map + alphaTest) so alpha-tested world planes keep their shape
    this.normalMat.onBeforeRender = (_r, _s, _c, _g, object, group) => {
      const mat = (object as THREE.Mesh).material as THREE.Material | THREE.Material[];
      const gi = (group as unknown as { materialIndex?: number } | null)?.materialIndex ?? 0; // geometry group at runtime
      const src = (Array.isArray(mat) ? mat[gi] : mat) as THREE.MeshLambertMaterial;
      const u = this.normalMat.uniforms;
      const map = src && src.alphaTest > 0 ? src.map : null;
      u.tCut.value = map; u.cut.value = map ? src.alphaTest : 0;
      if (map) { map.updateMatrix(); (u.cutUv.value as THREE.Matrix3).copy(map.matrix); }
      this.normalMat.uniformsNeedUpdate = true;
    };
    const fs = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({ vertexShader: FS_VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false });
    const texel = new THREE.Vector2(1, 1);
    this.maskMat = fs(MASK_FRAG, {
      tNormal: { value: this.rt.texture }, tDepth: { value: this.rt.depthTexture }, tMainDepth: { value: null },
      tGate: { value: this.gateB.texture }, tTile: { value: this.tileB.texture },
      texel: { value: texel }, cNear: { value: 0.2 }, cFar: { value: 1500 }, p00: { value: 1 }, p11: { value: 1 },
      wNear: { value: o.widthNear }, wFar: { value: o.widthFar }, dNear: { value: o.distNear }, dFar: { value: o.distFar },
      creaseScale: { value: o.creaseScale }, depthLo: { value: o.depthLo }, depthHi: { value: o.depthHi },
      cosLo: { value: Math.cos((o.angleLo * Math.PI) / 180) }, cosHi: { value: Math.cos((o.angleHi * Math.PI) / 180) },
      concaveGain: { value: o.concaveGain }, farOpacity: { value: o.farOpacity },
      fadeNear: { value: o.fadeNear }, fadeFar: { value: o.fadeFar }, strength: { value: o.strength },
      useMain: { value: 0 }, skip: { value: 0 }, weight: { value: 1 }, pxScale: { value: 1 },
      fogRange: { value: new THREE.Vector2(0, 0) }, fogStart: { value: 60 },
    });
    // the N masks are ADDED into the accumulation target (each already carries its weight 1 / N)
    this.maskMat.blending = THREE.CustomBlending; this.maskMat.blendEquation = THREE.AddEquation;
    this.maskMat.blendSrc = THREE.OneFactor; this.maskMat.blendDst = THREE.OneFactor;
    this.maskMat.blendSrcAlpha = THREE.OneFactor; this.maskMat.blendDstAlpha = THREE.OneFactor;
    this.gate1Mat = fs(GATE1_FRAG, { tMainDepth: { value: null }, texel: { value: texel }, cNear: { value: 0.2 }, cFar: { value: 1500 } });
    this.gate2Mat = fs(GATE2_FRAG, { tSrc: { value: this.gateA.texture }, texel: { value: texel } });
    this.tileMat = fs(TILE_FRAG, {
      tNormal: { value: this.rt.texture }, tDepth: { value: this.rt.depthTexture }, texel: { value: texel },
      kd: { value: 1 }, tau: { value: 1e-4 }, cosEps: { value: Math.cos((2 * Math.PI) / 180) },
    });
    this.tile2Mat = fs(TILE2_FRAG, { tSrc: { value: this.tileA.texture }, m: { value: 2 } });
    this.compMat = fs(COMP_FRAG, {
      inputBuffer: { value: null }, tMask: { value: this.accRT.texture }, tNormal: { value: this.rt.texture }, tTile: { value: this.tileB.texture },
      texel: { value: texel }, inkColor: { value: new THREE.Color(o.color) }, debug: { value: 0 },
      fogColor: { value: new THREE.Color() }, fogInk: { value: 0.3 },
    });
    this.copyMat = fs(COPY_FRAG, { tSrc: { value: this.tmpRT.texture } });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.maskMat);
    this.quad.frustumCulled = false;
    this.fsScene.add(this.quad);
  }

  /** live tuning, e.g. ink.set({ widthNear: 4.2, concaveGain: 0.5 }) or ink.set({ samples: 4 }) */
  set(options: InkOptions) {
    const u = this.maskMat.uniforms;
    const map: [keyof InkOptions, string][] = [["widthNear", "wNear"], ["widthFar", "wFar"], ["distNear", "dNear"], ["distFar", "dFar"],
      ["creaseScale", "creaseScale"], ["depthLo", "depthLo"], ["depthHi", "depthHi"], ["concaveGain", "concaveGain"],
      ["farOpacity", "farOpacity"], ["fadeNear", "fadeNear"], ["fadeFar", "fadeFar"], ["strength", "strength"]];
    for (const [k, n] of map) if (options[k] !== undefined) u[n].value = options[k];
    if (options.angleLo !== undefined) u.cosLo.value = Math.cos((options.angleLo * Math.PI) / 180);
    if (options.angleHi !== undefined) u.cosHi.value = Math.cos((options.angleHi * Math.PI) / 180);
    if (options.color !== undefined) (this.compMat.uniforms.inkColor.value as THREE.Color).set(options.color);
    if (options.samples !== undefined || options.quality !== undefined) this.n = sampleCount(options, this.n);
    if (options.skipFlat !== undefined) this.skipFlat = options.skipFlat;
    if (options.gate !== undefined) this.robust = options.gate === "robust";
  }

  /** the number of sub-pixel sample buffers per frame in use */
  get samples() { return this.n; }

  override setDepthTexture(depthTexture: THREE.Texture) {
    this.maskMat.uniforms.tMainDepth.value = depthTexture ?? null;
    this.gate1Mat.uniforms.tMainDepth.value = depthTexture ?? null;
    this.hasMain = !!depthTexture;
  }

  override setSize(width: number, height: number) {
    this.W = width; this.H = height;
    this.rt.setSize(width, height);
    this.accRT.setSize(width, height);
    this.tmpRT.setSize(width, height);
    this.gateA.setSize(width, height); this.gateB.setSize(width, height);
    this.tileA.setSize(Math.ceil(width / 4), Math.ceil(height / 4)); this.tileB.setSize(Math.ceil(width / 4), Math.ceil(height / 4));
    (this.maskMat.uniforms.texel.value as THREE.Vector2).set(1 / width, 1 / height);
    this.maskMat.uniforms.pxScale.value = height / 1920; // widths are specified at 1080x1920
  }

  /** world-only normals + depth for the camera's current projection (no characters / sprites / sky; shadow maps are
   *  not re-rendered) */
  private worldBuffer(renderer: THREE.WebGLRenderer) {
    const scene = this.world, cam = this.cam;
    const shadowAuto = renderer.shadowMap.autoUpdate;
    const mask = cam.layers.mask, override = scene.overrideMaterial, background = scene.background;
    cam.layers.disable(NOINK);
    scene.overrideMaterial = this.normalMat;
    scene.background = null;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(this.rt);
    renderer.clear(true, true, false);
    renderer.render(scene, cam);
    cam.layers.mask = mask;
    scene.overrideMaterial = override;
    scene.background = background;
    renderer.shadowMap.autoUpdate = shadowAuto;
  }

  private draw(renderer: THREE.WebGLRenderer, material: THREE.ShaderMaterial, to: THREE.WebGLRenderTarget | null) {
    this.quad.material = material;
    renderer.setRenderTarget(to);
    renderer.render(this.fsScene, this.fsCam);
  }

  override render(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget) {
    const scene = this.world, cam = this.cam;
    const u = this.maskMat.uniforms;
    if (u.strength.value <= 0 && this.debug === 0 && !this.renderToScreen) return;   // no ink in this shot: nothing to do
    const autoClear = renderer.autoClear;
    renderer.getClearColor(this.clearCol);
    const clearAlpha = renderer.getClearAlpha();
    renderer.autoClear = false;

    const e = cam.projectionMatrix.elements;
    u.cNear.value = cam.near; u.cFar.value = cam.far; u.p00.value = e[0]; u.p11.value = e[5];
    const fog = scene.fog as THREE.Fog | null;
    if (fog && (fog as THREE.Fog).isFog) { (u.fogRange.value as THREE.Vector2).set(fog.near, fog.far); (this.compMat.uniforms.fogColor.value as THREE.Color).copy(fog.color); }
    else (u.fogRange.value as THREE.Vector2).set(0, 0);

    // 0) figure gate from the main depth (once per frame)
    u.useMain.value = !this.hasMain ? 0 : this.robust ? 1 : 2;
    if (this.hasMain && this.robust) {
      const g = this.gate1Mat.uniforms; g.cNear.value = cam.near; g.cFar.value = cam.far;
      this.draw(renderer, this.gate1Mat, this.gateA);
      this.draw(renderer, this.gate2Mat, this.gateB);
    }

    // skipFlat: the mask's search reaches R px along the axes (the widest line + its ramp); + 1 px for the diagonals.
    // A tile counts as flat only if the 2nd difference of 1/z between direct neighbours is under depthLo / (2 R^2):
    // summed over R steps that stays under depthLo / 2, where no depth line starts.
    const skip = this.skipFlat && this.debug !== 2;
    if (skip) {
      const R = Math.min(12, Math.ceil(Math.max(u.wNear.value, u.wFar.value) * u.pxScale.value + 0.5));
      this.tile2Mat.uniforms.m.value = Math.min(3, Math.ceil((R + 1) / 4));
      this.tileMat.uniforms.tau.value = Math.min(u.depthLo.value, (0.5 * u.depthLo.value) / (R * R));
      this.tileMat.uniforms.kd.value = 1 - cam.near / cam.far;
    }
    u.skip.value = skip ? 1 : 0;

    // 1) N sub-pixel samples: world buffer -> edge mask -> accumulate
    const offs = JIT[this.n] ?? JIT[8], e8 = e[8], e9 = e[9];
    u.weight.value = 1 / offs.length;
    renderer.setRenderTarget(this.accRT);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, false, false);
    try {
      for (const [jx, jy] of offs) {
        e[8] = e8 + (2 * jx) / this.W; e[9] = e9 + (2 * jy) / this.H;     // what camera.setViewOffset does to the matrix
        this.worldBuffer(renderer);
        if (skip) { this.draw(renderer, this.tileMat, this.tileA); this.draw(renderer, this.tile2Mat, this.tileB); }
        this.draw(renderer, this.maskMat, this.accRT);
      }
    } finally { e[8] = e8; e[9] = e9; }                                   // nothing else ever sees the shifted projection
    renderer.setClearColor(this.clearCol, clearAlpha);

    // 2) composite into a temp target, 3) copy back into the input buffer (colour only; depth untouched)
    this.compMat.uniforms.inputBuffer.value = inputBuffer.texture;
    this.compMat.uniforms.debug.value = this.debug;
    this.draw(renderer, this.compMat, this.tmpRT);
    this.draw(renderer, this.copyMat, this.renderToScreen ? null : inputBuffer);

    renderer.autoClear = autoClear;
  }

  override dispose() {
    this.rt.depthTexture?.dispose();
    for (const t of [this.rt, this.accRT, this.tmpRT, this.gateA, this.gateB, this.tileA, this.tileB]) t.dispose();
    for (const m of [this.normalMat, this.maskMat, this.gate1Mat, this.gate2Mat, this.tileMat, this.tile2Mat, this.compMat, this.copyMat]) m.dispose();
    this.quad.geometry.dispose();
  }
}

/** Safety net for the NOINK contract (CHAR / WORLD put cards, sky, clouds and smoke on NOINK themselves): anything
 *  that does not write depth in the main render (sky sphere, cloud and smoke cards, soft effect sprites) and every
 *  camera-facing billboard (meshes with a customDepthMaterial cut-out = cast actors; alpha-tested MeshBasicMaterial
 *  effect cards) goes on NOINK. Idempotent, cheap (one traversal), safe to call every frame. */
export function noInkFallback(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!(m.isMesh || (o as THREE.Sprite).isSprite || (o as THREE.Points).isPoints || (o as THREE.Line).isLine)) return;
    if (o.layers.mask === 1 << NOINK) return;
    const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
    const card = !!m.customDepthMaterial || (o as THREE.Sprite).isSprite || (o as THREE.Points).isPoints || (o as THREE.Line).isLine;
    const noDepth = mats.some((x) => x && x.depthWrite === false);
    const basicCut = mats.some((x) => x && (x as THREE.MeshBasicMaterial).isMeshBasicMaterial && x.alphaTest > 0);
    if (card || noDepth || basicCut) o.layers.set(NOINK);
  });
}
