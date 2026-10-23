/* small shared kit for 3D films: materials, canvas textures, camera keys, glow sprites, env maps */
import * as THREE from 'three';
import { SANS } from './lib';
export const rng = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
export const M = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
export const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
export const canvasTex = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { c, g, tex }; };
export type Key = number[];
export const herm = (keys: Key[], t: number) => {
  if (t <= keys[0][0]) return keys[0].slice(1); const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (keys[i + 1][0] < t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1[0] - k0[0], u = (t - k0[0]) / dt, u2 = u * u, u3 = u2 * u;
  const tan = (j: number, d: number) => { const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; if (j === 0 || j === n - 1) return 0; return ((b[d] - a[d]) / (b[0] - a[0])) * dt; };
  return k0.slice(1).map((_, d) => { const p0 = k0[d + 1], p1 = k1[d + 1]; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * tan(i, d + 1) + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * tan(i + 1, d + 1); });
};
export const at = (X: number, keys: Key[]): Key[] => keys.map(([t, a, b, c, d, e, f, fov]) => [t, a + X, b, c, d + X, e, f, fov]);
let GLOW: THREE.CanvasTexture | null = null;
export const glowSprite = (col: string, size: number, opacity: number) => {
  if (!GLOW) { const { g, tex } = canvasTex(256, 256); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,255,255,.45)'); gr.addColorStop(0.45, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); GLOW = tex; }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.set(size, size, 1); return s;
};
export const makeEnv = (gl: THREE.WebGLRenderer, warm = '#ffc26e', cool = '#7f98b0') => {
  const pm = new THREE.PMREMGenerator(gl); const env = new THREE.Scene(); env.background = new THREE.Color('#030303');
  const panel = (c: string, i: number, w: number, h: number, p: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
  panel(warm, 5, 3, 1.4, [0, 1, 4]); panel('#ffe2b8', 3, 6, 0.6, [0, 4, 0]); panel(cool, 1.4, 2, 3, [-4, 0, 0]); panel(warm, 2, 2, 3, [4, 0, -1]);
  return pm.fromScene(env, 0.04).texture;
};
/* wood grain canvas */
export const woodTex = (seed = 7, base = '#5a3a22', w = 1024, h = 1024, rx = 1, ry = 1) => {
  const { g, tex } = canvasTex(w, h); const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const y = r() * h; g.strokeStyle = `rgba(${r() < 0.5 ? '20,12,6' : '140,100,60'},${0.05 + r() * 0.12})`; g.lineWidth = 0.6 + r() * 2.4; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 24) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + Math.sin(x * 0.03 + i * 2) * 1.5); g.stroke(); }
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry); return tex;
};
/* a visible light beam (open cone) */
export const beam = (col: string, len: number, angle: number, top = 0.08) => {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color(col) }, uL: { value: len } },
    vertexShader: 'uniform float uL; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); vH = (position.y+uL*0.5)/uL; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform float uI; uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 2.2) * mix(0.2, 0.7, vH) * uI; gl_FragColor = vec4(uC, a); }' });
  return { mesh: new THREE.Mesh(new THREE.CylinderGeometry(top, top + len * Math.tan(angle), len, 48, 1, true), mat), mat };
};

/* ------------------------------------------------------------------ the series figure: a glossy mannequin with shoulder/elbow pivots */
export const shellMat = (c = '#d8d2c8') => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15 });
export const posable = (shell: THREE.Material = shellMat()) => {
  const root = new THREE.Group(); const torso = new THREE.Group(); torso.position.y = 1.0; root.add(torso);
  const prof = [[0.0, -0.12], [0.13, -0.12], [0.135, -0.02], [0.125, 0.08], [0.145, 0.2], [0.17, 0.3], [0.178, 0.38], [0.165, 0.43], [0.12, 0.465], [0.055, 0.485], [0.0, 0.49]].map(([r, y]) => new THREE.Vector2(r, y));
  const tg = new THREE.LatheGeometry(prof, 48); tg.scale(1, 1, 0.6); const tm = new THREE.Mesh(tg, shell); tm.castShadow = true; torso.add(tm);
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 16), shell); hips.scale.set(1, 0.7, 0.66); hips.position.y = -0.12; torso.add(hips);
  const arms: { sh: THREE.Group; el: THREE.Group; hand: THREE.Object3D }[] = [];
  for (const sx of [-1, 1]) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 16), shell); ball.position.set(sx * 0.17, 0.405, 0); torso.add(ball);
    const sh = new THREE.Group(); sh.position.set(sx * 0.2, 0.39, 0); torso.add(sh);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.24, 8, 16), shell); up.position.y = -0.155; up.castShadow = true; sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.31; sh.add(el); el.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), shell));
    const fo = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.22, 8, 16), shell); fo.position.y = -0.14; fo.castShadow = true; el.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), shell); hand.scale.set(0.75, 1.25, 0.5); hand.position.y = -0.3; el.add(hand);
    arms.push({ sh, el, hand });
    for (const [y, r, h] of [[-0.42, 0.06, 0.36], [-0.82, 0.045, 0.36]] as const) { const lg = new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 8, 16), shell); lg.position.set(sx * 0.075, y, 0); lg.castShadow = true; torso.add(lg); }
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 0.1, 24), shell); neck.position.y = 0.52; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.565; torso.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 40, 30), shell); hd.scale.set(0.76, 1.14, 0.88); hd.position.y = 0.1; hd.castShadow = true; head.add(hd);
  return { root, torso, head, arms };
};

/* a floating text sign */
export const sign = (title: string, sub: string, col: string, w: number, h = w * 0.3, size = 120) => {
  const cw = 1600, ch = Math.round((cw * h) / w); const { g: c, tex } = canvasTex(cw, ch);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${size}px ${SANS}`; c.fillStyle = col; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 18; c.fillText(title, cw / 2, sub ? ch * 0.36 : ch / 2);
  if (sub) { c.font = `700 ${Math.round(size * 0.72)}px ${SANS}`; c.fillStyle = '#e9e1d2'; c.fillText(sub, cw / 2, ch * 0.76); }
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
};
