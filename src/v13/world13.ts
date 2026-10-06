import * as THREE from 'three';
import { noise2D } from '@remotion/noise';

/* ep13 《心流》 world: one landscape that IS the challenge × skill chart.
   chart coords: s = skill (world +x), c = challenge (world −z).
   river coords: u = (s + c)/√2 along the flow channel, d = (c − s)/√2 across it (d > 0 = too hard / anxiety). */
export const R2 = Math.SQRT1_2;
export const A_DIR = new THREE.Vector3(R2, 0, -R2); // downstream (more skill, more challenge)
export const N_DIR = new THREE.Vector3(-R2, 0, -R2); // toward the anxiety side
export const W = 1.05; // half width of the channel
export const toWorld = (u: number, d: number, y = 0) => new THREE.Vector3(u * R2 - d * R2, y, -(u * R2 + d * R2));
export const toUD = (x: number, z: number) => { const s = x, c = -z; return { u: (s + c) * R2, d: (c - s) * R2, s, c }; };

const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** terrain height and a 'crack' value (ember glow in the anxiety cliffs) */
export const terrain = (u: number, d: number) => {
  const a = Math.abs(d);
  const bed = -0.75 * Math.max(0, 1 - (a / (W * 1.25)) ** 2);
  if (d > 0) {
    const e = Math.max(0, a - W * 0.85);
    const ridge = 1 - Math.abs(noise2D('r', u * 0.16, d * 0.16));
    const ridge2 = 1 - Math.abs(noise2D('r2', u * 0.55, d * 0.55));
    const base = 6.0 * (1 - Math.exp(-e / 1.25)) + 0.38 * e;
    let H = base * (0.62 + 0.55 * ridge * ridge) + 0.18 * noise2D('n', u * 1.1, d * 1.1) * Math.min(1, e);
    // strata: ledges and risers, like a desert canyon
    const st = 0.62, f = H / st, fl = Math.floor(f), fr = f - fl;
    H = (fl + ss(0.55, 1, fr)) * st * 0.85 + H * 0.15;
    const h = H * ss(0, 0.4, e);
    const crack = ss(0.3, 1.4, e);
    return { h: bed + h, crack, side: 1 };
  }
  const e = Math.max(0, a - W * 0.85);
  // the same ripple, over and over: boredom
  const h = 0.3 * ss(0, 0.55, e) + (0.035 * Math.sin(u * 4.2 + d * 0.6) + 0.01 * noise2D('b', u * 0.4, d * 0.4)) * ss(0, 1.2, e);
  return { h: bed + h, crack: 0, side: -1 };
};

/** the terrain mesh in river coordinates: u ∈ [u0,u1], d ∈ [−dw, dw] */
export const buildTerrain = (u0 = -14, u1 = 52, dw = 30, nu = 330, nd = 300) => {
  const pos = new Float32Array((nu + 1) * (nd + 1) * 3);
  const col = new Float32Array((nu + 1) * (nd + 1) * 3);
  const crk = new Float32Array((nu + 1) * (nd + 1));
  const rock = new THREE.Color('#5e4640'), rockHi = new THREE.Color('#a9806a'), wet = new THREE.Color('#1c1a1b');
  const sand = new THREE.Color('#9c9b98'), sand2 = new THREE.Color('#b3b1ac');
  const c = new THREE.Color();
  let k = 0;
  for (let j = 0; j <= nd; j++) {
    // denser rows near the channel
    const tj = j / nd * 2 - 1, d = Math.sign(tj) * Math.abs(tj) ** 1.6 * dw;
    for (let i = 0; i <= nu; i++) {
      const u = u0 + (u1 - u0) * i / nu;
      const t = terrain(u, d);
      const p = toWorld(u, d, t.h);
      pos.set([p.x, p.y, p.z], k * 3);
      if (t.side > 0) {
        const hh = Math.min(1, Math.max(0, t.h / 7));
        c.copy(rock).lerp(rockHi, hh * 0.8);
      } else {
        c.copy(sand).lerp(sand2, 0.5 + 0.5 * Math.sin(u * 4.2 + d * 0.6));
      }
      c.lerp(wet, 1 - ss(W * 0.7, W * 1.3, Math.abs(d)));
      col.set([c.r, c.g, c.b], k * 3);
      crk[k] = t.crack;
      k++;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < nd; j++) for (let i = 0; i < nu; i++) {
    const a = j * (nu + 1) + i, b = a + 1, cc = a + nu + 1, dd = cc + 1;
    idx.push(a, b, cc, b, dd, cc);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aCrack', new THREE.BufferAttribute(crk, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/* shared GLSL: fog + value noise */
export const GLSL_COMMON = /* glsl */ `
uniform vec3 uFog; uniform float uFogD; uniform vec3 uSunDir; uniform vec3 uSun; uniform vec3 uYou; uniform float uYouI;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
vec3 applyFog(vec3 col, float dist, vec3 vdir){
  float f = 1.0 - exp(-pow(uFogD * dist, 2.0));
  float sunAmt = pow(max(dot(vdir, uSunDir), 0.0), 6.0);
  vec3 fc = mix(uFog, uFog * 0.7 + uSun * 0.4, sunAmt);
  return mix(col, fc, clamp(f, 0.0, 1.0));
}
`;

export const terrainMat = () => new THREE.ShaderMaterial({
  vertexColors: true,
  uniforms: {
    uFog: { value: new THREE.Color() }, uFogD: { value: 0.03 }, uSunDir: { value: new THREE.Vector3() }, uSun: { value: new THREE.Color() },
    uYou: { value: new THREE.Vector3() }, uYouI: { value: 1 }, uSky: { value: new THREE.Color() }, uGround: { value: new THREE.Color() },
    uEmber: { value: 0 }, uT: { value: 0 }, uMuteSand: { value: 0 },
  },
  vertexShader: /* glsl */ `
    attribute float aCrack; varying vec3 vCol; varying vec3 vN; varying vec3 vW; varying float vCrack;
    void main(){ vCol = color; vN = normal; vCrack = aCrack; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: GLSL_COMMON + /* glsl */ `
    uniform vec3 uSky; uniform vec3 uGround; uniform float uEmber; uniform float uT; uniform float uMuteSand;
    varying vec3 vCol; varying vec3 vN; varying vec3 vW; varying float vCrack;
    void main(){
      vec3 n = normalize(vN);
      vec3 V = cameraPosition - vW; float dist = length(V); vec3 vdir = -V / dist;
      float hemi = 0.5 + 0.5 * n.y;
      vec3 amb = mix(uGround, uSky, hemi) * 1.25;
      float sd = max(dot(n, uSunDir), 0.0);
      vec3 col = vCol * (amb + uSun * sd * 1.7);
      // the bright one in the channel lights the banks
      vec3 L = uYou - vW; float ld = length(L);
      col += vCol * vec3(1.0, 0.78, 0.45) * uYouI * max(dot(n, L / ld), 0.0) * 3.2 / (1.0 + ld * ld * 0.9);
      // rock detail: strata bands and grain (cliffs only), ripple-flat sand stays plain
      float rockM = smoothstep(0.0, 0.2, vCrack);
      float band = 0.9 + 0.1 * sin(vW.y * 9.0 + vnoise(vW.xz * 0.6) * 3.0);
      float grain = 0.82 + 0.36 * vnoise(vW.xz * 4.0 + vW.y * 2.0);
      col *= mix(1.0, band * grain, rockM);
      // embers: thin glowing veins in the anxiety cliffs
      float vv = 1.0 - abs(2.0 * vnoise(vec2(vW.x + vW.z, vW.y * 2.6) * 1.3) - 1.0);
      float vv2 = 1.0 - abs(2.0 * vnoise(vec2(vW.x - vW.z, vW.y * 2.3) * 1.6 + 3.0) - 1.0);
      float veins = (smoothstep(0.955, 0.993, vv) + 0.7 * smoothstep(0.965, 0.995, vv2)) * smoothstep(0.12, 0.55, 1.0 - n.y);
      float flick = 0.7 + 0.3 * sin(uT * 3.1 + vW.x * 1.7) * sin(uT * 2.3 + vW.z * 1.3);
      col += vec3(1.0, 0.26, 0.1) * veins * rockM * uEmber * flick * 1.7;
      col = mix(col, vec3(dot(col, vec3(0.3, 0.59, 0.11))), uMuteSand * step(vCrack, 0.0001) * 0.0);
      gl_FragColor = vec4(applyFog(col, dist, vdir), 1.0);
    }`,
});

export const waterMat = () => new THREE.ShaderMaterial({
  transparent: false,
  uniforms: {
    uFog: { value: new THREE.Color() }, uFogD: { value: 0.03 }, uSunDir: { value: new THREE.Vector3() }, uSun: { value: new THREE.Color() },
    uYou: { value: new THREE.Vector3() }, uYouI: { value: 1 }, uFlow: { value: 0 }, uGlow: { value: 1 }, uHorizon: { value: new THREE.Color() },
  },
  vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: GLSL_COMMON + /* glsl */ `
    uniform float uFlow; uniform float uGlow; uniform vec3 uHorizon; varying vec3 vW;
    void main(){
      float s = vW.x, c = -vW.z; float u = (s + c) * 0.70710678, d = (c - s) * 0.70710678;
      vec3 V = cameraPosition - vW; float dist = length(V); vec3 vdir = -V / dist; vec3 v = -vdir;
      float fres = pow(1.0 - max(v.y, 0.0), 3.0);
      vec3 deep = vec3(0.035, 0.04, 0.05);
      vec3 col = mix(deep, uHorizon * 0.55, 0.08 + 0.55 * fres);
      // streaks: long along the flow, thin across it, drifting downstream
      float lane = 1.0 - smoothstep(0.0, ${W.toFixed(2)} * 1.05, abs(d));
      // light filaments: thin lanes across the channel, bending a little, pulsing downstream
      float warp = vnoise(vec2(u * 0.22 - uFlow * 0.25, d * 1.4)) * 2.0 - 1.0;
      float lanes = pow(0.5 + 0.5 * sin((d + 0.12 * warp) * 34.0), 10.0);
      float lanes2 = pow(0.5 + 0.5 * sin((d - 0.08 * warp) * 57.0 + 1.3), 16.0);
      float pulse = smoothstep(0.3, 0.85, vnoise(vec2(u * 0.42 - uFlow, d * 3.0)));
      float pulse2 = smoothstep(0.45, 0.95, vnoise(vec2(u * 0.9 - uFlow * 1.6 + 7.0, d * 5.0)));
      float st = lanes * pulse * 1.1 + lanes2 * pulse2 * 0.8;
      vec3 gold = vec3(1.0, 0.78, 0.45);
      col += gold * st * lane * uGlow * 1.5;
      col += gold * lane * lane * 0.08 * uGlow;
      // sun glitter
      vec3 r = reflect(v, vec3(0.0, 1.0, 0.0));
      float gl = pow(max(dot(r, uSunDir), 0.0), 80.0) * (0.5 + vnoise(vec2(u * 6.0 - uFlow * 3.0, d * 6.0)));
      col += uSun * gl * 1.6;
      // the bright one's reflection
      vec3 L = uYou - vW; float ld = length(L.xz);
      col += vec3(1.0, 0.85, 0.6) * uYouI * 0.9 / (1.0 + ld * ld * 2.5);
      gl_FragColor = vec4(applyFog(col, dist, vdir), 1.0);
    }`,
});

export const skyMat = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3() } },
  vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); vec4 w = modelMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */ `uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uSun; uniform vec3 uSunDir; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = max(d.y, 0.0);
      vec3 col = mix(uHor, uZen, pow(h, 0.45));
      float s = max(dot(d, uSunDir), 0.0);
      col += uSun * (pow(s, 8.0) * 0.22 + pow(s, 90.0) * 0.35 + 0.0);
      gl_FragColor = vec4(col, 1.0); }`,
});

/** soft additive dots (dust in the air, the pager rain later) */
export const dotsMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uSize: { value: 40 }, uCol: { value: new THREE.Color('#ffd9a0') }, uA: { value: 0.5 }, uFog: { value: new THREE.Color() }, uFogD: { value: 0.03 } },
  vertexShader: /* glsl */ `uniform float uSize; attribute float aS; varying float vDist; varying float vS;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = -mv.z; vS = aS; gl_PointSize = uSize * aS / max(vDist, 0.1); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: /* glsl */ `uniform vec3 uCol; uniform float uA; uniform float uFogD; varying float vDist; varying float vS;
    void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0; float a = smoothstep(1.0, 0.0, r); a *= a;
      float f = exp(-pow(uFogD * vDist, 2.0)); gl_FragColor = vec4(uCol * a * uA * f, 1.0); }`,
});

/** radial glow texture for sprites */
let _glow: THREE.Texture | null = null;
export const glowTex = () => {
  if (_glow) return _glow;
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(255,240,210,0.85)'); gr.addColorStop(0.35, 'rgba(255,190,110,0.25)'); gr.addColorStop(1, 'rgba(255,160,80,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(cv);
  return _glow;
};
