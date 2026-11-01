import * as THREE from './node_modules/three/build/three.module.js';

/* ===================== KNOBS (see notes.md) ===================== */
const K = {
  W: 384, H: 216,          // low-res 3D render size (upscaled x5 by CSS)
  SNAP: 1.0,               // vertex snap grid = (W,H)/2 * SNAP  (lower = coarser wobble)
  BITS: 5,                 // bits per channel
  DITHER: 1.0,             // Bayer strength in LSBs (0 = off)
  FPS3D: 15,               // 3D update rate
  FOG_NEAR: 18, FOG_FAR: 150,
  FOG_COL: [0.80, 0.47, 0.27],
  TEX_UV_SCALE: 1 / 6,     // sand texture repeats per metre
};

/* ===================== seeded RNG ===================== */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(1234567);

/* ===================== renderer ===================== */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(K.W, K.H, false);
renderer.autoClear = true;
const target = new THREE.WebGLRenderTarget(K.W, K.H, {
  minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false,
});

/* ===================== procedural pixel textures ===================== */
function makeTex(size, fn) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const im = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4; const [r, gg, b] = fn(x, y, size);
    im.data[o] = r; im.data[o + 1] = gg; im.data[o + 2] = b; im.data[o + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
  return t;
}
const TAU = Math.PI * 2;
const texSand = makeTex(64, (x, y, s) => {            // wind ripples
  const v = Math.sin(TAU * (y / s * 7 + 0.35 * Math.sin(TAU * x / s * 2) + 0.12 * Math.sin(TAU * x / s * 5)));
  const n = rnd();
  let k = v > 0.55 ? 1.0 : v < -0.35 ? 0.62 : 0.82;
  if (n > 0.93) k += 0.12; else if (n < 0.07) k -= 0.1;
  return [Math.min(255, 236 * k), Math.min(255, 176 * k), Math.min(255, 100 * k)];
});
const texRock = makeTex(32, (x, y, s) => {
  const b = 0.55 + 0.25 * Math.sin(x * 0.7 + Math.sin(y * 0.5) * 2) * Math.cos(y * 0.6) + (rnd() - 0.5) * 0.25;
  const crack = ((x * 3 + y * 5) % 17 === 0) ? 0.55 : 1;
  const k = b * crack; return [150 * k + 20, 100 * k + 12, 70 * k + 8];
});
const texCloth = makeTex(32, (x, y, s) => {
  const w = ((x >> 1) + (y >> 1)) % 2 ? 1 : 0.84; const st = (y % 8 < 2) ? 0.78 : 1;
  const k = w * st * (0.93 + rnd() * 0.12); return [215 * k, 205 * k, 190 * k];
});
const texBark = makeTex(32, (x, y, s) => {
  const k = 0.55 + 0.35 * Math.sin(x * 1.3 + Math.sin(y * 0.4)) + (rnd() - 0.5) * 0.2;
  return [120 * k + 30, 90 * k + 20, 64 * k + 14];
});
const texSkin = makeTex(16, (x, y) => { const k = 0.92 + rnd() * 0.16; return [205 * k, 150 * k, 105 * k]; });
const texWhite = makeTex(4, () => [255, 255, 255]);

/* ===================== PS1 material ===================== */
const VERT = `
uniform vec2 uRes; uniform float uSnap;
uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uAmb; uniform vec3 uFill;
uniform float uFogNear; uniform float uFogFar; uniform float uUnlit; uniform float uUvScale;
attribute vec3 vcol;
varying vec3 vCol; varying vec3 vUvw; varying float vFog;
void main(){
  vec4 wp = modelMatrix * vec4(position,1.0);
  vec4 mv = viewMatrix * wp;
  vec4 p = projectionMatrix * mv;
  // --- PS1 vertex snapping: after projection, snap to low-res pixel grid
  vec2 g = uRes * 0.5 * uSnap;
  p.xy = floor(p.xy / p.w * g + 0.5) / g * p.w;
  gl_Position = p;
  // --- Gouraud: lighting per vertex
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vec3 lit = uAmb + uSunCol * max(dot(n, uSunDir), 0.0) + uFill * max(dot(n, normalize(vec3(0.35,0.5,0.8))), 0.0);
  lit = mix(lit, vec3(1.0), uUnlit);
  vCol = vcol * lit;
  // --- affine mapping: pass uv*w and w (divided again in fragment)
  vec2 uv = uv * uUvScale;
  vUvw = vec3(uv * p.w, p.w);
  vFog = uUnlit > 0.5 ? 0.0 : clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
}`;
const FRAG = `
precision highp float;
uniform sampler2D uMap; uniform vec3 uFogCol; uniform float uAlpha; uniform float uTint;
varying vec3 vCol; varying vec3 vUvw; varying float vFog;
void main(){
  vec2 uv = vUvw.xy / vUvw.z;                 // affine: no perspective correction
  vec3 c = texture2D(uMap, uv).rgb * vCol;
  c = mix(c, uFogCol, vFog);
  gl_FragColor = vec4(c, uAlpha);
}`;
const shared = {
  uRes: { value: new THREE.Vector2(K.W, K.H) }, uSnap: { value: K.SNAP },
  uSunDir: { value: new THREE.Vector3(-0.45, 0.22, -0.86).normalize() },
  uSunCol: { value: new THREE.Vector3(1.0, 0.62, 0.32) },
  uAmb: { value: new THREE.Vector3(0.50, 0.34, 0.28) },
  uFill: { value: new THREE.Vector3(0.30, 0.20, 0.15) },
  uFogNear: { value: K.FOG_NEAR }, uFogFar: { value: K.FOG_FAR },
  uFogCol: { value: new THREE.Vector3(...K.FOG_COL) },
};
function mat(tex, o = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: Object.assign({}, shared, {
      uMap: { value: tex || texWhite }, uUnlit: { value: o.unlit ? 1 : 0 }, uAlpha: { value: o.alpha ?? 1 },
      uUvScale: { value: o.uv ?? 1 }, uTint: { value: 0 },
    }),
    side: o.double ? THREE.DoubleSide : THREE.FrontSide,
    transparent: !!o.transparent, depthWrite: o.depthWrite ?? true, depthTest: o.depthTest ?? true,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  return m;
}
function paint(geo, col) {          // flat vertex colour attribute
  const n = geo.attributes.position.count; const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col[0]; a[i * 3 + 1] = col[1]; a[i * 3 + 2] = col[2]; }
  geo.setAttribute('vcol', new THREE.BufferAttribute(a, 3)); return geo;
}
const hex = (h) => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
let TRIS = {};
function count(name, geo) { TRIS[name] = (TRIS[name] || 0) + (geo.index ? geo.index.count : geo.attributes.position.count) / 3; return geo; }

/* ===================== post pass: 5-bit quantise + 4x4 Bayer ===================== */
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postMat = new THREE.ShaderMaterial({
  uniforms: { tMap: { value: target.texture }, uBits: { value: K.BITS }, uDither: { value: K.DITHER } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0);} `,
  fragmentShader: `
precision highp float;
uniform sampler2D tMap; uniform float uBits; uniform float uDither; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tMap, vUv).rgb;
  float bayer[16] = float[16](0.,8.,2.,10., 12.,4.,14.,6., 3.,11.,1.,9., 15.,7.,13.,5.);
  int ix = int(mod(gl_FragCoord.x,4.0)); int iy = int(mod(gl_FragCoord.y,4.0));
  float b = (bayer[iy*4+ix] + 0.5) / 16.0 - 0.5;
  float lv = exp2(uBits) - 1.0;
  c = floor(c * lv + b * uDither + 0.5) / lv;
  gl_FragColor = vec4(clamp(c,0.0,1.0), 1.0);
}`,
  depthTest: false, depthWrite: false,
});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

/* ===================== SCENE 1: chapter card (droplet) ===================== */
const cardScene = new THREE.Scene();
const cardCam = new THREE.PerspectiveCamera(40, K.W / K.H, 0.1, 50);
cardCam.position.set(0, 0, 5.5);
const dropLit = { sun: new THREE.Vector3(0.5, 0.7, 0.7).normalize() };
let dropMesh, glowGroup;
{
  const prof = [[0.0, 1.05], [0.10, 0.70], [0.30, 0.25], [0.48, -0.20], [0.46, -0.55], [0.25, -0.88], [0.0, -1.0]].map(([x, y]) => new THREE.Vector2(x, y));
  let g = new THREE.LatheGeometry(prof, 8).toNonIndexed(); g.computeVertexNormals();
  // vertex colours: white-ish top highlight -> deep cyan bottom
  const pos = g.attributes.position; const a = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const t = (pos.getY(i) + 1) / 2.05; const w = Math.pow(t, 2.2);
    a[i * 3] = 0.10 + 0.8 * w; a[i * 3 + 1] = 0.72 + 0.28 * w; a[i * 3 + 2] = 0.85 + 0.15 * w; }
  g.setAttribute('vcol', new THREE.BufferAttribute(a, 3));
  count('drop', g);
  const dm = mat(texWhite, { double: false });
  // brighter, drop-specific lighting
  dm.uniforms = Object.assign({}, dm.uniforms, { uAmb: { value: new THREE.Vector3(0.85, 0.95, 1.0) }, uSunCol: { value: new THREE.Vector3(0.6, 0.6, 0.55) }, uSunDir: { value: dropLit.sun }, uFill: { value: new THREE.Vector3(0, 0, 0) } });
  dropMesh = new THREE.Mesh(g, dm); dropMesh.position.y = 0.48; cardScene.add(dropMesh);
  glowGroup = new THREE.Group(); glowGroup.position.set(0, 0.48, -0.5);
  for (let i = 0; i < 6; i++) {
    const r = 1.55 - i * 0.2; const cg = paint(new THREE.CircleGeometry(r, 14), [0.02, 0.065, 0.075]);
    cg.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(cg.attributes.position.count * 3).fill(0), 3));
    const cm = mat(texWhite, { unlit: true, additive: true, transparent: true, depthWrite: false });
    glowGroup.add(new THREE.Mesh(count('glow', cg), cm));
  }
  cardScene.add(glowGroup);
}

/* ===================== SCENE 2: desert ===================== */
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(48, K.W / K.H, 0.3, 400);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const MIR = { x: 31, z: -60 };

function duneH(x, z) {
  const sx = smooth(6, 22, Math.abs(x)), sz = smooth(-38, -70, z);
  let flat = 1 - (1 - sx) * (1 - sz);
  let h = 4.2 * Math.sin(x * 0.045 + 1.2) * Math.cos(z * 0.035 + 0.4) + 3.0 * Math.sin(x * 0.021 - z * 0.03 + 2.0) + 2.0 * Math.sin(z * 0.08 + x * 0.03);
  h = (h + 3.5) * 0.7;
  const d = Math.hypot(x - MIR.x, z - MIR.z); h *= smooth(10, 34, d);     // basin around mirage
  return h * flat;
}
{ // terrain: irregular grid (cells grow with distance), ~220 triangles
  const xs = [-170, -105, -62, -32, -14, -6, 6, 14, 32, 62, 105, 170];
  const zs = [-175, -128, -92, -64, -44, -26, -14, -4, 6, 18, 40];
  const nx = xs.length, nz = zs.length;
  const pos = [], uvs = [], idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = xs[i], z = zs[j]; pos.push(x, duneH(x, z), z); uvs.push(x, z);
  }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const col = []; for (let k = 0; k < pos.length / 3; k++) { const t = 0.9 + (((k * 7919) % 13) / 13) * 0.2; col.push(t, t * 0.97, t * 0.94); }
  g.setAttribute('vcol', new THREE.Float32BufferAttribute(col, 3));
  const m = mat(texSand, { uv: K.TEX_UV_SCALE, double: true });
  scene.add(new THREE.Mesh(count('terrain', g), m));
}
// rocks
function rock(x, z, s, sy, ry) {
  let g = new THREE.IcosahedronGeometry(1, 0).toNonIndexed(); g.computeVertexNormals();
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 0.85 + ((i * 37) % 7) / 7 * 0.3; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * sy, p.getZ(i) * k); }
  g.computeVertexNormals(); paint(g, [1, 0.92, 0.88]);
  const u = g.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 4, u.getY(i) * 4);
  const m = new THREE.Mesh(count('rocks', g), mat(texRock, { uv: 0.25 })); m.position.set(x, 0.3 * s * sy * 0.5, z); m.scale.setScalar(s); m.rotation.y = ry; scene.add(m);
}
rock(-4.5, -3, 1.0, 0.7, 0.3); rock(-5.6, -6, 1.5, 0.8, 1.2); rock(5.0, -9, 1.2, 0.6, 2.1); rock(3.6, -14, 0.8, 0.7, 0.4); rock(-3, -22, 2.0, 0.9, 1.7); rock(7, 2, 0.7, 0.7, 0.2);
// dead tree
{
  const grp = new THREE.Group();
  const trunk = (() => { const g = new THREE.CylinderGeometry(0.12, 0.28, 3.2, 5, 1, true).toNonIndexed(); g.translate(0, 1.6, 0); g.computeVertexNormals(); return paint(g, [0.9, 0.85, 0.8]); })();
  const addBranch = (len, rx, rz, y, w) => { const g = new THREE.CylinderGeometry(w * 0.4, w, len, 4, 1, true).toNonIndexed(); g.translate(0, len / 2, 0); g.computeVertexNormals(); paint(g, [0.9, 0.85, 0.8]);
    const m = new THREE.Mesh(count('tree', g), mat(texBark, { uv: 0.6 })); m.position.y = y; m.rotation.set(rx, 0, rz); grp.add(m); };
  grp.add(new THREE.Mesh(count('tree', trunk), mat(texBark, { uv: 0.6 })));
  addBranch(1.6, 0.0, 0.9, 2.3, 0.1); addBranch(1.3, 0.5, -0.8, 2.8, 0.09); addBranch(1.0, -0.6, 0.7, 3.0, 0.07); addBranch(0.9, 0.2, -1.2, 1.7, 0.07);
  grp.position.set(-9, 0, -8); scene.add(grp);
}
// distant mesas
{
  const mm = mat(texRock, { uv: 0.05 }); const defs = [[-120, -130, 28, 14, 30], [-60, -150, 40, 11, 24], [10, -160, 30, 9, 20], [70, -150, 44, 15, 26], [120, -110, 26, 12, 22], [-135, -60, 22, 10, 28], [150, -40, 24, 11, 24], [40, -165, 20, 6, 14]];
  for (const [x, z, w, h, d] of defs) {
    const g = new THREE.CylinderGeometry(w * 0.38, w * 0.55, h, 6, 1).toNonIndexed(); g.translate(0, h / 2 - 1, 0); g.computeVertexNormals(); paint(g, [0.95, 0.8, 0.7]);
    const m = new THREE.Mesh(count('mesas', g), mm); m.position.set(x, 0, z); m.scale.z = d / w; scene.add(m);
  }
}
// sky dome + sun (unlit, follows camera)
const skyGroup = new THREE.Group(); scene.add(skyGroup);
{
  const g = new THREE.SphereGeometry(300, 12, 8); const p = g.attributes.position; const a = new Float32Array(p.count * 3);
  const hor = [0.98, 0.62, 0.30], mid = [0.62, 0.26, 0.17], top = [0.22, 0.09, 0.10];
  for (let i = 0; i < p.count; i++) {
    const y = Math.max(p.getY(i) / 300, -0.05); let c;
    if (y < 0.0) c = K.FOG_COL; else if (y < 0.22) { const t = y / 0.22; c = hor.map((v, k) => v + (mid[k] - v) * Math.pow(t, 0.7)); } else { const t = Math.min(1, (y - 0.22) / 0.6); c = mid.map((v, k) => v + (top[k] - v) * t); }
    a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2];
  }
  g.setAttribute('vcol', new THREE.BufferAttribute(a, 3));
  const m = new THREE.Mesh(count('sky', g), mat(texWhite, { unlit: true, double: true, depthWrite: false })); m.renderOrder = -10; skyGroup.add(m);
  const sd = shared.uSunDir.value.clone().normalize(); const sunPos = sd.clone().multiplyScalar(280);
  const discs = [[70, [1.0, 0.55, 0.25]], [46, [1.0, 0.68, 0.32]], [30, [1.0, 0.80, 0.45]], [17, [1.0, 0.95, 0.72]]];
  discs.forEach(([r, c], i) => { const cg = paint(new THREE.CircleGeometry(r, 12), c);
    const dm = mat(texWhite, { unlit: true, depthWrite: false }); const mesh = new THREE.Mesh(count('sun', cg), dm); mesh.position.copy(sunPos).multiplyScalar(0.995 - i * 0.001); mesh.lookAt(0, 0, 0); mesh.renderOrder = -9 + i; skyGroup.add(mesh); });
}
// character
const fig = new THREE.Group(); scene.add(fig);
const parts = {};
{
  const cloth = mat(texCloth, { uv: 1.6 }), skin = mat(texSkin, { uv: 1 });
  for (const m of [cloth, skin]) m.uniforms = Object.assign({}, m.uniforms, { uAmb: { value: new THREE.Vector3(0.95, 0.74, 0.62) }, uFill: { value: new THREE.Vector3(0.35, 0.25, 0.2) } });
  const box = (w, h, d, col, top) => { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); if (top) g.translate(0, -h / 2, 0); return paint(g, col); };
  const mk = (g, m, parent, x, y, z) => { const me = new THREE.Mesh(count('figure', g), m); me.position.set(x, y, z); parent.add(me); return me; };
  const rust = hex(0x8a4a24), dark = hex(0x4a2a18), cream = hex(0xf0e0b8), belt = hex(0x2a160c), skinC = [1, 1, 1];
  const body = new THREE.Group(); body.position.y = 0.95; fig.add(body); parts.body = body;
  mk(box(0.52, 0.68, 0.30, rust), cloth, body, 0, 0.34, 0);                 // tunic
  mk(box(0.54, 0.10, 0.32, belt), cloth, body, 0, 0.02, 0);                  // belt
  mk(box(0.34, 0.10, 0.34, cream), cloth, body, 0, 0.70, 0);                 // scarf
  mk(box(0.30, 0.30, 0.30, skinC), skin, body, 0, 0.90, 0);                  // faceless head
  mk(box(0.34, 0.12, 0.34, cream), cloth, body, 0, 1.08, 0);                 // head wrap
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.33, 0.66, 0); body.add(arm);
    mk(box(0.14, 0.52, 0.16, rust, true), cloth, arm, 0, 0, 0);
    mk(box(0.17, 0.17, 0.19, skinC, true), skin, arm, 0, -0.52, 0);          // mitten
    parts[s < 0 ? 'armL' : 'armR'] = arm;
    const leg = new THREE.Group(); leg.position.set(s * 0.14, 0.95, 0); fig.add(leg);
    mk(box(0.20, 0.48, 0.22, dark, true), cloth, leg, 0, 0, 0);
    const shin = new THREE.Group(); shin.position.y = -0.48; leg.add(shin);
    mk(box(0.18, 0.40, 0.20, dark, true), cloth, shin, 0, 0, 0);
    mk(box(0.20, 0.08, 0.30, belt, true), cloth, shin, 0, -0.40, 0.04);       // boot
    parts[s < 0 ? 'legL' : 'legR'] = leg; parts[s < 0 ? 'shinL' : 'shinR'] = shin;
  }
}
// blob shadow
const shadow = (() => { const g = paint(new THREE.CircleGeometry(0.55, 8), [0.05, 0.02, 0.01]); g.rotateX(-Math.PI / 2);
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).map((v, i) => i % 3 === 1 ? 1 : 0), 3));
  const m = mat(texWhite, { unlit: true, transparent: true, alpha: 0.55, depthWrite: false }); const me = new THREE.Mesh(count('shadow', g), m); me.scale.set(1, 1, 1.3); me.renderOrder = 2; scene.add(me); return me; })();
// mirage pool
const mirage = (() => {
  const SX = 20, SY = 3; const g = new THREE.PlaneGeometry(60, 7, SX, SY); const p = g.attributes.position; const a = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 3.5) / 7; const c = t > 0.85 ? [1, 1, 1] : t > 0.45 ? [0.35, 0.98, 1.0] : [0.15, 0.78, 0.9]; a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2]; }
  g.setAttribute('vcol', new THREE.BufferAttribute(a, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(p.count * 3).fill(0), 3));
  const base = p.array.slice();
  const m = mat(texWhite, { unlit: true, double: true });
  const me = new THREE.Mesh(count('mirage', g), m); me.position.set(MIR.x, 2.2, MIR.z); scene.add(me);
  me.userData = { base, g }; return me;
})();
// camera / animation
const lerp = (a, b, t) => a + (b - a) * t;
function figX(t) { return t < 6 ? 0 : -(t - 6) * 0.9; }
function figZ(t) { return -8 + (t - 2) * 1.7; }
function mirageAmt(t) {
  if (t < 6.6 || t > 9.5) return 0;
  const f = (x) => Math.floor(x);
  if (t < 7.3) return ((f(t * 12) % 3) === 0) ? 0 : (t - 6.6) / 0.7;                         // rising, flickering in
  if (t < 9.0) return 1;
  return ((f(t * 10) % 3) === 1 ? 0.15 : 1 - (t - 9.0) / 0.5) * ((f(t * 15) % 2) ? 0.5 : 1);  // fading, flickering out
}
function sceneAt(t) {
  // figure + walk cycle
  const fx = figX(t), fz = figZ(t), ph = t * 1.9 * TAU, sw = Math.sin(ph);
  fig.position.set(fx, 0, fz); fig.rotation.y = 0.0; fig.scale.setScalar(1.12);
  parts.body.position.y = 0.95 + Math.abs(Math.cos(ph)) * 0.06; parts.body.rotation.z = Math.sin(ph) * 0.03;
  parts.legL.rotation.x = sw * 0.65; parts.legR.rotation.x = -sw * 0.65;
  parts.shinL.rotation.x = Math.max(0, -Math.cos(ph)) * 0.0 + Math.max(0, -sw) * 0.9; parts.shinR.rotation.x = Math.max(0, sw) * 0.9;
  parts.armL.rotation.x = -sw * 0.55; parts.armR.rotation.x = sw * 0.55;
  shadow.position.set(fx + 0.05, 0.04, fz);
  // mirage shimmer
  const am = mirageAmt(t); mirage.visible = am > 0.02;
  if (mirage.visible) {
    const { base, g } = mirage.userData; const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const bx = base[i * 3], by = base[i * 3 + 1];
      p.setXYZ(i, bx + Math.sin(t * 9 + by * 3 + bx * 0.4) * 0.6, by * am * (0.9 + 0.1 * Math.sin(t * 13 + bx)), 0); }
    p.needsUpdate = true;
  }
  // camera
  let px, py, pz, tx, ty, tz;
  if (t < 6) { const u = (t - 2) / 4; px = 0; py = 1.0 + 0.15 * u; pz = 6 + 3.5 * u; tx = 0; ty = 1.55; tz = -12; }
  else {
    const v = (t - 6) / 4, e = smooth(0, 1, v);
    px = lerp(0, 5, v); py = lerp(1.15, 1.7, v); pz = lerp(9.5, 8, v);
    tx = lerp(0, MIR.x + 5, e); ty = lerp(1.55, 2.6, e); tz = lerp(-12, -70, e);
  }
  cam.position.set(px, py, pz); cam.lookAt(tx, ty, tz);
  skyGroup.position.copy(cam.position);
}
function cardAt(t) {
  dropMesh.rotation.y = t * 2.2; dropMesh.rotation.z = Math.sin(t * 2.0) * 0.06;
  dropMesh.position.y = 0.48 + Math.sin(t * 3) * 0.06; glowGroup.position.y = dropMesh.position.y;
  const pulse = 1 + 0.04 * Math.sin(t * 5); glowGroup.scale.setScalar(pulse);
}

/* ===================== HTML overlay ===================== */
const $ = (id) => document.getElementById(id);
const hlParse = (s) => s.replace(/\[(.+?)\]/g, '<span class="hl">$1</span>');
const SUBS = [
  { a: 2.2, b: 5.6, rows: ['[第3天]：失水约[5%]。'] },
  { a: 5.8, b: 9.8, rows: ['头痛、烦躁、头晕，', '远处好像有[水]。'] },
];
const bar = $('bar');
for (let i = 0; i < 10; i++) { const d = document.createElement('div'); d.className = 'seg'; bar.appendChild(d); }
const FONT5 = {
  N: ['10001', '11001', '10101', '10101', '10011', '10001', '10001'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'], G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  '.': ['0', '0', '0', '0', '0', '0', '1'], ' ': ['000', '000', '000', '000', '000', '000', '000'],
};
{ const txt = 'NOW LOADING...'; let w = 0; for (const ch of txt) w += FONT5[ch][0].length + 1; w -= 1;
  const c = $('load'); c.width = w; c.height = 7; const g = c.getContext('2d'); g.fillStyle = '#F3E6C8'; let x = 0;
  for (const ch of txt) { const gl = FONT5[ch]; for (let y = 0; y < 7; y++) for (let k = 0; k < gl[y].length; k++) if (gl[y][k] === '1') g.fillRect(x + k, y, 1, 1); x += gl[0].length + 1; }
  c.style.width = w * 6 + 'px'; c.style.height = 7 * 6 + 'px'; }
let lastSub = -1;
function overlayAt(t) {
  const card = t < 2.0;
  $('card').style.display = card ? 'block' : 'none'; $('game').style.display = card ? 'none' : 'block';
  if (card) { $('load').style.opacity = (Math.floor(t / 0.4) % 2 === 0) ? 1 : 0; return; }
  const si = SUBS.findIndex((s) => t >= s.a && t < s.b);
  if (si !== lastSub) { $('sub').innerHTML = si < 0 ? '' : SUBS[si].rows.map((r) => `<div>${hlParse(r)}</div>`).join(''); lastSub = si; }
  let op = 0; if (si >= 0) op = Math.min(1, (t - SUBS[si].a) / 0.2, (SUBS[si].b - t) / 0.2); $('sub').style.opacity = Math.max(0, op);
  $('scrim').style.opacity = 1;
  // water bar: last segment flickers out from 4.0 s
  const seg = bar.children[9]; let on = true;
  if (t >= 4.0) { const k = Math.floor((t - 4.0) * 30); on = k < 12 ? (k % 4 < 2) : false; }
  seg.className = on ? 'seg' : 'seg off';
}

/* ===================== frame entry ===================== */
function drawFrame(f) {
  const t = f / 30;
  const t3 = Math.floor(f / (30 / K.FPS3D) + 1e-4) / K.FPS3D;       // 3D held for 2 output frames
  renderer.setRenderTarget(target);
  if (t < 2.0) { renderer.setClearColor(0x000000, 1); cardAt(t3); renderer.clear(); renderer.render(cardScene, cardCam); }
  else { renderer.setClearColor(new THREE.Color(...K.FOG_COL), 1); sceneAt(t3); renderer.clear(); renderer.render(scene, cam); }
  renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(postScene, postCam);
  overlayAt(t);
}
window.renderFrame = async (f) => { await document.fonts.ready; drawFrame(f); await new Promise((r) => requestAnimationFrame(() => r())); return true; };
window.TRIS = TRIS;
drawFrame(0);
window.ready = true;
