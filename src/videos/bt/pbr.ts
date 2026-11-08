// PBR look for the backtest props (replaces the flat two-tone Lambert + matcap on props): two code-built light
// environments, the light rig / shadow / N8AO numbers they were tuned with, and physically based materials for gun
// steel, iron fittings, shot, wood and paint. Deterministic, no image files.
//
// STUDIO (ENV) is what makes the steel read like the reference barrels: a CPU-baked matcap (half-float, fitted to the
// reference's barrel profiles) fed into the metals' indirect-specular slot, so it is camera-locked by construction yet
// still goes through three's Fresnel/roughness BRDF, albedo/mottle and normal/bump maps. A barrel shows the same light
// top band / mid-grey body with one cream hot band / slate lower band from every orbit angle, never goes white-pipe
// from behind, and a world-space key mask (KEY) turns the aft-facing breech dark slate with a soft hotspot. FILL
// (ENV_FILL) is a world-frame PMREM: soft lavender sky + red-warm deck bounce that lights wood and paint diffusely, so
// shade drifts red-orange like the reference; a cheap ground-occlusion gradient on wood/paint plus N8AO give the
// baked-AO depth of game assets.
import * as THREE from "three";

type RGB = [number, number, number];
/** an emitter in a PMREM environment: centre at azimuth/elevation (deg), long side rotated `rot` deg from horizontal,
 *  half extents in deg, edge softness in deg, linear radiance. `round`: elliptical with a radial falloff (soft >= the
 *  smaller half extent = a smooth blob). `lobe` = p: instead an ADDITIVE broad cosine lobe col * max(cos(angle), 0)^p
 *  (w/h/soft unused). Azimuth: world frame 0 = +x, 90 = +z; view frame 0 = camera forward, 90 = camera right. */
export type SoftBox = { az: number; el: number; rot: number; w: number; h: number; soft: number; col: RGB; round?: boolean; lobe?: number };
/** a PMREM environment: radiance by elevation (deg, ascending stops, smooth between them; up to 10) plus up to 12
 *  softboxes. frame "world" (wood/paint fill) or "view" (camera frame; keep it there each frame with trackEnv()). */
export type EnvSpec = { frame: "world" | "view"; stops: [number, RGB][]; boxes: SoftBox[] };

/** a spot on the matcap, in view-space normal units (x right, y up, both -1..1): centre, half extents, rotation (deg),
 *  edge softness, linear radiance; `round` = elliptical with a radial falloff; `add` = added instead of mixed over. */
export type MatcapSpot = { x: number; y: number; w: number; h: number; rot?: number; soft: number; col: RGB; round?: boolean; add?: boolean };
/** a matcap authored in code (the STUDIO light for metals): radiance by the normal's ny (ascending stops), times a
 *  radial factor by rho = |n.xy| (0 = facing the camera, 1 = silhouette); then, from rho0 to rho1, a blend toward a
 *  silhouette ring whose colour and blend weight are set by the polar angle (deg clockwise from the top, -180..180
 *  ascending stops [angle, colour, weight]); then spots. Baked by matcapTex() into a small HDR texture, pre-blurred per roughness. Linear radiance: the metal
 *  multiplies it by its Fresnel reflectance (~0.5 face-on, ~0.8 near the silhouette). */
export type MatcapSpec = {
  frame: "matcap"; stops: [number, RGB][]; radial: [number, number][];
  ring?: { rho0: number; rho1: number; stops: [number, RGB, number][] }; spots: MatcapSpot[];
  /** a soft spot stored in the texture's alpha and added AFTER the world key mask (so it survives on aft-facing
   *  surfaces): the breech dome's hotspot. col = its radiance at full strength. */
  hotspot?: { x: number; y: number; w: number; h: number; soft: number; col: RGB };
};

/** STUDIO: the light for gun steel, a matcap FITTED TO THE REFERENCE: the cross-section values of the reference barrels
 *  in five frames (over the breech, three-quarter, side, opening, props close-up) were mapped to view-space normals
 *  and agree on one look: a warm cream hot band across the upper half (ny 0.4-0.85: the light top band of side and
 *  three-quarter barrels, and the hot band left of centre on a barrel pointing away), a fast fall through neutral grey
 *  to cool slate-violet below (~50-65 sRGB at the bottom, B > R, so ink outlines still separate), a darker top rim
 *  and a dark upper-right rim arc (the dark right half of a barrel seen from behind the breech), a dimmer centre with
 *  one soft hotspot left of centre (the breech dome, which faces the camera over the breech), and a small round
 *  glint upper-left (one cartoon highlight on balls, knobs, trunnions). Used as a true matcap lookup inside the PBR
 *  metal shader, so it is consistent wherever a barrel sits in frame and has full resolution at the silhouette. */
export const ENV: MatcapSpec = {
  frame: "matcap",
  stops: [ // by ny: cool slate low, neutral-cool middle, warm cream hot band, dimmer top rim
    [-1, [0.1, 0.102, 0.115]], [-0.9, [0.105, 0.107, 0.12]], [-0.75, [0.13, 0.135, 0.152]], [-0.5, [0.2, 0.208, 0.235]],
    [-0.25, [0.36, 0.39, 0.46]], [0, [0.7, 0.71, 0.76]], [0.2, [1.25, 1.18, 1.1]], [0.42, [2.1, 1.78, 1.35]],
    [0.65, [2.4, 2.0, 1.45]], [0.82, [1.35, 1.25, 1.12]], [0.92, [0.45, 0.46, 0.5]], [1, [0.35, 0.36, 0.4]],
  ],
  radial: [[0, 0.75], [0.3, 0.8], [0.56, 1], [1, 1]], // slightly dimmer centre
  ring: { // dark right / upper-right silhouette: the dark right half of a barrel seen from behind the breech
    rho0: 0.82, rho1: 0.93, stops: [
      [-180, [0.135, 0.138, 0.155], 0], [-12, [0.135, 0.138, 0.155], 0], [10, [0.135, 0.138, 0.155], 1],
      [120, [0.135, 0.138, 0.155], 1], [150, [0.135, 0.138, 0.155], 0], [180, [0.135, 0.138, 0.155], 0],
    ],
  },
  spots: [
    { x: -0.36, y: 0.47, w: 0.07, h: 0.07, soft: 0.05, col: [7, 6.6, 6.2], round: true },    // round glint, upper left
  ],
  hotspot: { x: -0.14, y: 0.06, w: 0.3, h: 0.3, soft: 0.3, col: [0.75, 0.72, 0.7] },       // breech dome hotspot, left of centre
};
/** FILL: the diffuse environment for wood and paint (world frame): soft lavender-blue sky overhead (no green, so
 *  shade drifts red-orange like the reference instead of olive), peach haze at the horizon, sea/hull ring, red-warm
 *  sunlit deck below. With LIGHTS.sun and ALBEDO.deck: sunlit deck ~(205,147,98) sRGB, shade ~(167,117,83), both
 *  G/R ~0.70-0.72 like the reference (sky is lavender, not blue-green, so shade never goes olive). */
export const ENV_FILL: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.38, 0.22, 0.13]], [-35, [0.37, 0.215, 0.13]], [-8, [0.28, 0.23, 0.25]], [-1, [0.52, 0.49, 0.54]],
    [3, [0.85, 0.73, 0.64]], [20, [0.65, 0.58, 0.7]], [60, [0.53, 0.475, 0.67]], [90, [0.49, 0.45, 0.65]],
  ],
  boxes: [
    { az: 135, el: 40, rot: 0, w: 30, h: 12, soft: 8, col: [0.97, 0.84, 0.7] },   // soft glow around the sun side
  ],
};

// ---------------- matcap bake (CPU, deterministic) ----------------
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6))); return t * t * (3 - 2 * t); };
const pw = (pts: [number, number][], x: number) => { // smooth piecewise curve through (x, y) points
  let y = pts[0][1];
  for (let i = 1; i < pts.length; i++) y += (pts[i][1] - y) * sstep(pts[i - 1][0], pts[i][0], x);
  return y;
};
/** radiance of a matcap spec at view-space normal (nx, ny) */
export function matcapAt(spec: MatcapSpec, nx: number, ny: number): RGB {
  const rho = Math.min(1, Math.hypot(nx, ny));
  const c: RGB = [0, 1, 2].map((k) => pw(spec.stops.map(([y, col]) => [y, col[k]] as [number, number]), ny)) as RGB;
  const f = pw(spec.radial, rho); c[0] *= f; c[1] *= f; c[2] *= f;
  if (spec.ring) {
    const r = spec.ring, ang = (Math.atan2(nx, ny) * 180) / Math.PI, m = sstep(r.rho0, r.rho1, rho); // clockwise from the top
    const wgt = m > 0 ? m * pw(r.stops.map(([a, , w]) => [a, w] as [number, number]), ang) : 0;
    if (wgt > 0) for (let k = 0; k < 3; k++) c[k] += (pw(r.stops.map(([a, col]) => [a, col[k]] as [number, number]), ang) - c[k]) * wgt;
  }
  for (const s of spec.spots) {
    const a = ((s.rot ?? 0) * Math.PI) / 180, qx = nx - s.x, qy = ny - s.y;
    const x = Math.cos(a) * qx + Math.sin(a) * qy, y = -Math.sin(a) * qx + Math.cos(a) * qy;
    let m: number;
    if (s.round) { const r = Math.hypot(x / s.w, y / s.h), ed = Math.min(1, Math.max(1e-3, s.soft / Math.min(s.w, s.h))); m = 1 - sstep(1 - ed, 1, r); }
    else m = (1 - sstep(s.w - s.soft, s.w, Math.abs(x))) * (1 - sstep(s.h - s.soft, s.h, Math.abs(y)));
    for (let k = 0; k < 3; k++) c[k] = s.add ? c[k] + s.col[k] * m : c[k] + (s.col[k] - c[k]) * m;
  }
  return c;
}
/** bakes a matcap spec into a square HDR (half float) texture, gaussian pre-blurred by `blur` (normal units; ~ the
 *  material's roughness / 8). uv = n.xy * 0.495 + 0.5 as in MeshMatcapMaterial; outside the disc = the rim colour. */
export function matcapTex(spec: MatcapSpec = ENV, size = 256, blur = 0.03): THREE.DataTexture {
  const N = size, img = new Float32Array(N * N * 3), alpha = new Float32Array(N * N), hs = spec.hotspot;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let nx = ((i + 0.5) / N - 0.5) / 0.495, ny = ((j + 0.5) / N - 0.5) / 0.495; const r = Math.hypot(nx, ny);
    if (r > 0.999) { nx *= 0.999 / r; ny *= 0.999 / r; }
    const c = matcapAt(spec, nx, ny), o = (j * N + i) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2];
    if (hs) { const q = Math.hypot((nx - hs.x) / hs.w, (ny - hs.y) / hs.h); alpha[j * N + i] = 1 - sstep(1 - Math.min(1, hs.soft / Math.min(hs.w, hs.h)), 1, q); }
  }
  const sig = (blur * 0.495 * N), rad = Math.ceil(sig * 2.5);
  if (rad > 0) { // separable gaussian, clamped edges
    const w: number[] = []; let ws = 0; for (let k = -rad; k <= rad; k++) { const v = Math.exp(-(k * k) / (2 * sig * sig)); w.push(v); ws += v; }
    const tmp = new Float32Array(img.length);
    for (const pass of [0, 1]) {
      const src = pass ? tmp : img, dst = pass ? img : tmp;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        let r = 0, g = 0, b = 0;
        for (let k = -rad; k <= rad; k++) {
          const ii = pass ? i : Math.min(N - 1, Math.max(0, i + k)), jj = pass ? Math.min(N - 1, Math.max(0, j + k)) : j;
          const o = (jj * N + ii) * 3, q = w[k + rad]; r += src[o] * q; g += src[o + 1] * q; b += src[o + 2] * q;
        }
        const o = (j * N + i) * 3; dst[o] = r / ws; dst[o + 1] = g / ws; dst[o + 2] = b / ws;
      }
    }
  }
  const data = new Uint16Array(N * N * 4);
  for (let p = 0; p < N * N; p++) {
    data[p * 4] = THREE.DataUtils.toHalfFloat(img[p * 3]); data[p * 4 + 1] = THREE.DataUtils.toHalfFloat(img[p * 3 + 1]);
    data[p * 4 + 2] = THREE.DataUtils.toHalfFloat(img[p * 3 + 2]); data[p * 4 + 3] = THREE.DataUtils.toHalfFloat(alpha[p]);
  }
  const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.HalfFloatType);
  t.colorSpace = THREE.NoColorSpace; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true; t.name = "bt.studioMatcap";
  t.userData = { btMatcap: true, spec, blur };
  return t;
}

// ---------------- PMREM environments ----------------
const NS = 10, NB = 12;
const ENV_VS = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ENV_FS = /* glsl */ `
#define NS ${NS}
#define NB ${NB}
varying vec3 vDir;
uniform float uE[NS]; uniform vec3 uG[NS]; uniform int uN;
uniform vec3 uC[NB]; uniform vec3 uU[NB]; uniform vec3 uV[NB]; uniform vec4 uS[NB]; uniform vec3 uCol[NB];
void main(){
  vec3 d = normalize(vDir);
  float e = degrees(asin(clamp(d.y, -1.0, 1.0)));
  vec3 c = uG[0];
  for (int i = 1; i < NS; i++) { if (i < uN) c = mix(c, uG[i], smoothstep(uE[i - 1], uE[i], e)); }
  for (int i = 0; i < NB; i++) {
    float k = dot(d, uC[i]);
    if (uS[i].w < -0.5) { c += uCol[i] * pow(max(k, 0.0), -uS[i].w); continue; }
    if (k <= 0.05) continue;
    float x = degrees(atan(dot(d, uU[i]), k)), y = degrees(atan(dot(d, uV[i]), k));
    vec4 S = uS[i];
    float m;
    if (S.w > 0.5) { // round: elliptical radial falloff
      float r = length(vec2(x / S.x, y / S.y)), ed = clamp(S.z / min(S.x, S.y), 0.001, 1.0);
      m = 1.0 - smoothstep(1.0 - ed, 1.0, r);
    } else {
      m = (1.0 - smoothstep(S.x - S.z, S.x, abs(x))) * (1.0 - smoothstep(S.y - S.z, S.y, abs(y)));
    }
    c = mix(c, uCol[i], m);
  }
  gl_FragColor = vec4(max(c, vec3(0.0)), 1.0);
}`;

const dirAzEl = (az: number, el: number) => {
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  return new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
};

/** a PMREM env's scene (a backside sphere with the gradient + softboxes); exported for previews / debugging */
export function envScene(env: EnvSpec = ENV_FILL) {
  const bx = env.boxes.slice(0, NB);
  while (bx.length < NB) bx.push({ az: 0, el: -90, rot: 0, w: 1e-3, h: 1e-3, soft: 0.01, col: [0, 0, 0], round: true });
  const C: THREE.Vector3[] = [], U: THREE.Vector3[] = [], Vv: THREE.Vector3[] = [], S: THREE.Vector4[] = [], Col: THREE.Vector3[] = [];
  for (const b of bx) {
    const c = dirAzEl(env.frame === "view" ? b.az - 90 : b.az, b.el); // view: forward = -z, right = +x
    const h = new THREE.Vector3(0, 1, 0).cross(c);              // horizontal tangent (azimuth direction)
    if (h.lengthSq() < 1e-6) h.set(1, 0, 0); else h.normalize();
    const v0 = c.clone().cross(h).normalize();                  // "up" tangent
    const r = THREE.MathUtils.degToRad(b.rot);
    const u = h.clone().multiplyScalar(Math.cos(r)).addScaledVector(v0, Math.sin(r));
    const v = c.clone().cross(u).normalize();
    C.push(c); U.push(u); Vv.push(v); Col.push(new THREE.Vector3(...b.col));
    S.push(new THREE.Vector4(Math.max(1e-3, b.w), Math.max(1e-3, b.h), Math.max(0.01, b.soft), b.lobe ? -Math.max(1, b.lobe) : b.round ? 1 : 0));
  }
  const st = env.stops.slice(0, NS), E: number[] = [], G: THREE.Vector3[] = [];
  for (let i = 0; i < NS; i++) { const s = st[Math.min(i, st.length - 1)]; E.push(s[0] + (i >= st.length ? i : 0)); G.push(new THREE.Vector3(...s[1])); }
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, vertexShader: ENV_VS, fragmentShader: ENV_FS,
    uniforms: {
      uE: { value: E }, uG: { value: G }, uN: { value: st.length },
      uC: { value: C }, uU: { value: U }, uV: { value: Vv }, uS: { value: S }, uCol: { value: Col },
    },
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 96, 48), mat));
  return scene;
}

/** builds an environment texture, once. Default (STUDIO matcap spec) -> the metals' matcap (CPU bake, ~30 ms, no GL
 *  work); an EnvSpec (ENV_FILL) -> a PMREM baked on the GPU (~0.2 s on software GL), the env sphere disposed after.
 *  makeEnv(gl) -> metals, makeEnv(gl, ENV_FILL) -> wood/paint (pass both to mats). */
export function makeEnv(renderer: THREE.WebGLRenderer, env: EnvSpec | MatcapSpec = ENV, size = 512): THREE.Texture {
  if (env.frame === "matcap") return matcapTex(env, 256, 0.03);
  const sc = envScene(env);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(sc, 0, 0.1, 100, { size });
  pm.dispose();
  sc.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
  rt.texture.name = env.frame === "world" ? "bt.envFill" : "bt.envView";
  return rt.texture;
}

// ---------------- light rig ----------------
/** recommended rig for PBR props (exposure judged through NEUTRAL tone mapping, as in the film's post chain) */
export const LIGHTS = {
  sun: { color: "#fff1dc", intensity: 1.7, position: [-5, 7.5, 4.5] as RGB, target: [0, 0, -1] as RGB },
  /** no hemisphere light: the env map supplies sky fill and ground bounce to every PBR material */
  hemi: null as null | { sky: string; ground: string; intensity: number },
  /** scene.environmentIntensity if the env is set as scene.environment (mats() sets envMap per material instead and
   *  bakes this scale into each envMapIntensity, so leave scene.environment unset or at the same map) */
  environmentIntensity: 1.0,
  shadow: {
    type: THREE.PCFShadowMap, // 17-tap PCF honours radius (PCFSoftShadowMap ignores it); R3F: <Canvas shadows="percentage">
    mapSize: 2048, radius: 3, bias: -0.0003, normalBias: 0.015, // 14 m frustum / 2048 = 6.8 mm per texel
    camera: { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30 },
  },
  /** N8AO first in the composer (before InkPass / lens blur / bloom / tone mapping). R3F: <N8AO aoRadius={0.55}
   *  distanceFalloff={1} intensity={2.2} color="#2a1a10" quality="high" halfRes={false} /> from @react-three/postprocessing */
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 2.2, color: "#2a1a10", quality: "High" as const, halfRes: false },
  bloom: { luminanceThreshold: 1.0, intensity: 0.35 },
};
export const PBR_LIGHTS = LIGHTS;

/** builds the sun from LIGHTS (shadow configured); add it and its target to the scene/root */
export function makeSun(L = LIGHTS) {
  const s = new THREE.DirectionalLight(L.sun.color, L.sun.intensity);
  s.position.set(...L.sun.position); s.target.position.set(...L.sun.target);
  s.castShadow = true; s.shadow.mapSize.set(L.shadow.mapSize, L.shadow.mapSize);
  s.shadow.radius = L.shadow.radius; s.shadow.bias = L.shadow.bias; s.shadow.normalBias = L.shadow.normalBias;
  Object.assign(s.shadow.camera, L.shadow.camera); s.shadow.camera.updateProjectionMatrix();
  return s;
}
/** applies LIGHTS.ao to an N8AOPostPass / N8AOPass (typed structurally so this module does not import n8ao) */
export function applyAO(pass: { configuration: Record<string, unknown>; setQualityMode(m: string): void }, L = LIGHTS) {
  pass.configuration.aoRadius = L.ao.aoRadius; pass.configuration.distanceFalloff = L.ao.distanceFalloff;
  pass.configuration.intensity = L.ao.intensity; pass.configuration.color = new THREE.Color(L.ao.color);
  pass.configuration.halfRes = L.ao.halfRes; pass.setQualityMode(L.ao.quality);
}

// ---------------- albedo contract ----------------
/** base colours (sRGB) the texture agent's wood/paint maps should average to under this rig. PBR shade puts a shaded
 *  vertical face at ~0.35-0.45 x albedo (linear), so saturated orange/red with blue < ~45 goes burnt and muddy. These
 *  are ~10-15 % lighter and less saturated than the colour the reference shows on screen, with sRGB blue >= 45-60.
 *  Seams/grain may go darker locally; the map's MEAN should sit near these. */
export const ALBEDO = {
  deck: "#dcab74",     // sunlit deck lands ~(200,150,100) on screen
  carriage: "#e0784a", // truck carriage cheeks / transoms / wheels
  bulwark: "#d8603c",  // red painted bulwark boards
  bulwarkDark: "#6a3424", // frames, gunport linings
  rail: "#b97a48",     // rail cap, poles, mast (oiled brown)
  bucket: "#c08850",   // bucket / barrel staves
  rope: "#c9a46a",
} as const;

// ---------------- materials ----------------
/** cheap baked-looking ground occlusion for wood/paint: indirect light on non-up-facing surfaces fades toward the deck
 *  (x = height in m over which it fades in, y = strength at deck level). Shared by every wood()/paint() material.
 *  It uses onBeforeCompile: chain, do not overwrite, if you add your own (or set GROUND_AO.value.y = 0 to disable). */
export const GROUND_AO = { value: new THREE.Vector2(0.55, 0.5) };
const groundAO = (m: THREE.MeshPhysicalMaterial) => {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uGroundAO = GROUND_AO;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGW; varying vec3 vGN;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xyz; vGN = mat3(modelMatrix) * objectNormal;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGW; varying vec3 vGN; uniform vec2 uGroundAO;")
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>
        { float gAO = 1.0 - uGroundAO.y * (1.0 - smoothstep(0.0, uGroundAO.x, vGW.y)) * (1.0 - max(normalize(vGN).y, 0.0));
          reflectedLight.indirectDiffuse *= gAO; reflectedLight.indirectSpecular *= gAO; }`);
  };
  m.customProgramCacheKey = () => "btGroundAO1";
  return m;
};

/** seeded, tileable low-frequency value noise (two octaves) as a linear DataTexture: R = G = B = albedo multiplier
 *  1 - amp .. 1 (use as `map`), A unused. Used for the faint hand-finished mottle on gun steel. Deterministic. */
export function mottleTex(seed = 7, amp = 0.1, size = 128, cells = 4): THREE.DataTexture {
  let s = seed >>> 0 || 1;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const oct = (n: number) => { const g = new Float32Array(n * n); for (let i = 0; i < g.length; i++) g[i] = rnd(); return g; };
  const g1 = oct(cells), g2 = oct(cells * 2);
  const sm = (t: number) => t * t * (3 - 2 * t);
  const val = (g: Float32Array, n: number, u: number, v: number) => {
    const x = u * n, y = v * n, x0 = Math.floor(x), y0 = Math.floor(y), fx = sm(x - x0), fy = sm(y - y0);
    const at = (i: number, j: number) => g[((j % n + n) % n) * n + ((i % n + n) % n)];
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx, b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
  const data = new Uint8Array(size * size * 4);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const n = 0.65 * val(g1, cells, i / size, j / size) + 0.35 * val(g2, cells * 2, i / size, j / size); // 0..1
    const m = 1 - amp * n, k = (j * size + i) * 4;
    data[k] = data[k + 1] = data[k + 2] = Math.round(m * 255); data[k + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.needsUpdate = true; t.name = "bt.mottle";
  return t;
}

/** STUDIO matcap as the metals' image-based light: the matcap (looked up by the view-space normal exactly like
 *  MeshMatcapMaterial, perspective-corrected) is fed into three's indirect-specular slot, so it is weighted by the
 *  metal's Fresnel/roughness BRDF and tinted by its albedo/mottle maps, normal/bump maps bend it, and the sun's direct
 *  glint, shadows and N8AO stack on top. Camera-locked by construction (no trackEnv needed).
 *  KEY: a world-space key mask on top: on surfaces facing away from KEY.dir (world) the matcap's bright parts fall to KEY.slate, as
 *  in the reference, where the aft-facing breech dome is dark while barrel tops and port-facing sides carry the hot
 *  band (a pure matcap cannot do both). The matcap's alpha hotspot is added after the mask. Shared uniforms. */
export const KEY = {
  dir: { value: new THREE.Vector3(0.5, 0.75, -0.45).normalize() }, // world direction the steel's key comes from
  mask: { value: new THREE.Vector3(0.1, -0.05, 0.55) },           // residual, dot(N, dir) where the ramp starts, where it ends
  /** radiance the matcap's bright parts fall to on surfaces facing away from dir (darker matcap parts are kept), so
   *  the aft breech lands on dark slate ~55-70 sRGB with B-R ~ +10 instead of crushing to navy-black */
  slate: { value: new THREE.Vector3(0.11, 0.112, 0.124) },
  gain: { value: 1 },                                             // overall matcap gain
};
const withMatcap = (m: THREE.MeshStandardMaterial, tex: THREE.Texture, gain: number) => {
  const uTex = { value: tex }, uGain = { value: gain };
  const hc = (tex.userData.spec as MatcapSpec | undefined)?.hotspot?.col ?? [0, 0, 0];
  const uHot = { value: new THREE.Vector3(...hc) };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uMatcapTex: uTex, uMatcapGain: uGain, uMatcapAll: KEY.gain, uKeyDir: KEY.dir, uKeyMask: KEY.mask, uKeySlate: KEY.slate, uMatcapHot: uHot });
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uMatcapTex; uniform float uMatcapGain; uniform float uMatcapAll; uniform vec3 uKeyDir; uniform vec3 uKeyMask; uniform vec3 uKeySlate; uniform vec3 uMatcapHot;")
      .replace("#include <lights_fragment_maps>", `#include <lights_fragment_maps>
        { vec3 mvd = normalize( vViewPosition ); vec3 mx = normalize( vec3( mvd.z, 0.0, - mvd.x ) ); vec3 my = cross( mvd, mx );
          vec2 muv = vec2( dot( mx, normal ), dot( my, normal ) ) * 0.495 + 0.5;
          vec4 mc = texture2D( uMatcapTex, muv );
          float km = max( uKeyMask.x, smoothstep( uKeyMask.y, uKeyMask.z, dot( inverseTransformDirection( normal, viewMatrix ), uKeyDir ) ) );
          radiance += ( mix( min( mc.rgb, uKeySlate ), mc.rgb, km ) + mc.a * uMatcapHot ) * uMatcapGain * uMatcapAll; }`);
  };
  m.customProgramCacheKey = () => "btMatcapIBL3";
  return m;
};

/** maps/params the texture agent's wood, paint and metal can plug in */
export type SurfOpts = {
  map?: THREE.Texture | null; color?: THREE.ColorRepresentation;
  bumpMap?: THREE.Texture | null; bumpScale?: number;
  normalMap?: THREE.Texture | null; normalScale?: number;
  roughnessMap?: THREE.Texture | null; roughness?: number;
  metalnessMap?: THREE.Texture | null; metalness?: number;
  aoMap?: THREE.Texture | null; aoMapIntensity?: number;
  envMapIntensity?: number; specular?: number; side?: THREE.Side;
};

/** materials; `env` = makeEnv(gl) (the STUDIO matcap for metals), `fill` = makeEnv(gl, ENV_FILL) (PMREM for wood and
 *  paint). Passing one texture for both is allowed only if it is a PMREM. */
export function mats(env: THREE.Texture | null, fill: THREE.Texture | null = env, L = LIGHTS) {
  const E = L.environmentIntensity;
  if (fill && fill.userData && fill.userData.btMatcap) fill = null; // a matcap is not an environment for wood/paint
  const surf = (o: SurfOpts, d: { rough: number; spec: number; env: number }) => {
    const m = new THREE.MeshPhysicalMaterial({
      color: o.color ?? "#ffffff", map: o.map ?? null,
      roughness: o.roughness ?? d.rough, roughnessMap: o.roughnessMap ?? null, metalness: 0,
      bumpMap: o.bumpMap ?? null, bumpScale: o.bumpScale ?? 1,
      normalMap: o.normalMap ?? null, aoMap: o.aoMap ?? null, aoMapIntensity: o.aoMapIntensity ?? 1,
      envMap: fill, envMapIntensity: (o.envMapIntensity ?? d.env) * E,
      specularIntensity: o.specular ?? d.spec, side: o.side ?? THREE.FrontSide,
    });
    if (o.normalScale !== undefined) m.normalScale.set(o.normalScale, o.normalScale);
    return groundAO(m);
  };
  const tracked: THREE.MeshStandardMaterial[] = [];
  const mottle = mottleTex(7, 0.1);
  // STUDIO: a matcap texture (default makeEnv(gl)) -> matcap IBL; blurrier copies for rougher iron. Any other texture
  // (a PMREM from a "view" EnvSpec) is used as a plain envMap, kept camera-locked by trackEnv.
  const mc = env && env.userData && env.userData.btMatcap ? env : null;
  const mcSpec = mc ? (mc.userData.spec as MatcapSpec) : null;
  const mcFor: Record<string, THREE.Texture> = {};
  const matcapFor = (rough: number) => { // pre-blur ~ roughness / 7 (0.22 -> 0.03); cached per roughness
    if (!mc || !mcSpec) return null;
    const blur = Math.max(0.012, rough / 7), key = blur.toFixed(3);
    if (Math.abs(blur - (mc.userData.blur as number)) < 0.004) return mc;
    return (mcFor[key] ??= matcapTex(mcSpec, 256, blur));
  };
  // metals: MeshStandard (no clear coat: one specular lobe, single round glints, cheaper on SwiftShader)
  const steel = (o: SurfOpts, d: { color: string; rough: number; metal: number; env: number; map: THREE.Texture | null }) => {
    const rough = o.roughness ?? d.rough, mt = matcapFor(rough);
    const m = new THREE.MeshStandardMaterial({
      color: o.color ?? d.color, map: o.map !== undefined ? o.map : d.map,
      roughness: rough, roughnessMap: o.roughnessMap ?? null,
      metalness: o.metalness ?? d.metal, metalnessMap: o.metalnessMap ?? null,
      bumpMap: o.bumpMap ?? null, bumpScale: o.bumpScale ?? 1,
      normalMap: o.normalMap ?? null, aoMap: o.aoMap ?? null, aoMapIntensity: o.aoMapIntensity ?? 1,
      envMap: mt ? null : env, envMapIntensity: (o.envMapIntensity ?? d.env) * E, side: o.side ?? THREE.FrontSide,
    });
    if (o.normalScale !== undefined) m.normalScale.set(o.normalScale, o.normalScale);
    tracked.push(m);
    return mt ? withMatcap(m, mt, (o.envMapIntensity ?? d.env) * E) : m;
  };
  // the mottle map darkens by 0..10 % (mean ~5 %), so the base colours sit ~5 % above the target mean
  const D_METAL = { color: "#c1c5cd", rough: 0.22, metal: 1, env: 1.0, map: mottle as THREE.Texture | null };
  const D_IRON = { color: "#80848d", rough: 0.4, metal: 0.9, env: 0.9, map: mottle as THREE.Texture | null };
  const D_BALL = { color: "#33363c", rough: 0.2, metal: 0.85, env: 1.0, map: null as THREE.Texture | null };
  const metalWith = (o: SurfOpts = {}) => steel(o, D_METAL);
  const ironWith = (o: SurfOpts = {}) => steel(o, D_IRON);
  const ballWith = (o: SurfOpts = {}) => steel(o, D_BALL);
  const metal = metalWith(), iron = ironWith(), ball = ballWith();
  return {
    /** gun steel: satin gunmetal (~#b8bcc4 mean with a faint low-frequency mottle), soft bands + crisp streaks */
    metal,
    /** iron fittings (straps, bolts, hubs, hoops): darker, rougher, still metallic */
    iron,
    /** cannonball: near-black glossy iron with one round highlight */
    ball,
    /** factories taking the texture agent's maps (map replaces the built-in mottle; pass map: null for none; a
     *  normal/bump map bends the matcap, e.g. engraved rings). Each new material is also added to `tracked`. */
    metalWith, ironWith, ballWith,
    /** bore / touch hole: flat near-black */
    bore: new THREE.MeshBasicMaterial({ color: "#121316" }),
    /** bare or oiled wood (carriage, deck, rail, bucket staves): matte, low specular so grazing sky never greys it */
    wood: (o: SurfOpts = {}) => surf(o, { rough: 0.78, spec: 0.35, env: 1.0 }),
    /** painted boards (red bulwark): a little smoother and more specular than bare wood */
    paint: (o: SurfOpts = {}) => surf(o, { rough: 0.6, spec: 0.5, env: 1.0 }),
    /** the metal materials (for trackEnv when a "view" PMREM is used instead of the matcap) */
    tracked,
  };
}
export type Mats = ReturnType<typeof mats>;

const _eul = new THREE.Euler(), _q = new THREE.Quaternion();
/** keep a camera-frame PMREM env (an EnvSpec with frame "view") locked to the camera: call once per frame after the
 *  camera moves. Not needed with the default STUDIO matcap (it is camera-locked by construction; calling it is
 *  harmless). Accepts mats() output or any list of standard/physical materials. pitch = how much of the camera's pitch
 *  the env follows (1 = fully; 0 = horizon stays level). */
export function trackEnv(target: Mats | THREE.MeshStandardMaterial[], camera: THREE.Camera, pitch = 1) {
  const list = Array.isArray(target) ? target : target.tracked;
  camera.updateMatrixWorld();
  _eul.setFromQuaternion(camera.getWorldQuaternion(_q), "YXZ");
  // three negates envMapRotation and builds R = Rx(-x) Ry(-y) (order XYZ), i.e. inverse(Ry(yaw) Rx(pitch)): world -> camera frame
  for (const m of list) m.envMapRotation.set(_eul.x * pitch, _eul.y, 0, "XYZ");
}
