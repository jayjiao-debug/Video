/* 《身体里住着两个人》 3D sets after the opening: the hall of 300 seats, the radio room, the three brass nameplates,
   the string and its tuning peg. Each set is a group far from the others; build*() returns { g, update(t) => camera }.
   Everything drawn in code. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { floorTex, plasterTex, drawGlass, drawCookie } from './PuppetTest';
import { glowSprite } from './Set';
import { ramp, eio, eo, clamp, SERIF, SANS } from './lib';

/* ------------------------------------------------------------------ shared helpers */
export const rng = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
export const M = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
export const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
export type Key = number[];
/* camera: cubic Hermite through keys [t, px,py,pz, lx,ly,lz, fov] */
export const herm = (keys: Key[], t: number) => {
  if (t <= keys[0][0]) return keys[0].slice(1); const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (keys[i + 1][0] < t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1[0] - k0[0], u = (t - k0[0]) / dt, u2 = u * u, u3 = u2 * u;
  const tan = (j: number, d: number) => { const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; if (j === 0 || j === n - 1) return 0; return ((b[d] - a[d]) / (b[0] - a[0])) * dt; };
  return k0.slice(1).map((_, d) => { const p0 = k0[d + 1], p1 = k1[d + 1]; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * tan(i, d + 1) + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * tan(i + 1, d + 1); });
};
/* shift a key list into a set's coordinates */
const at = (X: number, keys: Key[]): Key[] => keys.map(([t, a, b, c, d, e, f, fov]) => [t, a + X, b, c, d + X, e, f, fov]);
/* a visible light beam: an open cone, brightest along its axis and towards the lamp */
export const beam = (col: string, len: number, angle: number, top = 0.08) => {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color(col) }, uL: { value: len } },
    vertexShader: 'uniform float uL; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); vH = (position.y+uL*0.5)/uL; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform float uI; uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 2.2) * mix(0.2, 0.7, vH) * uI; gl_FragColor = vec4(uC, a); }' });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, top + len * Math.tan(angle), len, 48, 1, true), mat); return { mesh, mat };
};
export const canvasTex = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { c, g, tex }; };
export const makeEnv = (gl: THREE.WebGLRenderer, warm = '#ffc26e') => {
  const pm = new THREE.PMREMGenerator(gl); const env = new THREE.Scene(); env.background = new THREE.Color('#030303');
  const panel = (c: string, i: number, w: number, h: number, p: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
  panel(warm, 5, 3, 1.4, [0, 1, 4]); panel('#ffe2b8', 3, 6, 0.6, [0, 4, 0]); panel('#7f98b0', 1.2, 2, 3, [-4, 0, 0]); panel(warm, 2, 2, 3, [4, 0, -1]);
  return pm.fromScene(env, 0.04).texture;
};
const engrave = (g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string) => {
  g.font = font; g.textAlign = 'center'; g.fillStyle = 'rgba(255,238,200,.45)'; g.fillText(s, x, y + 2); g.fillStyle = 'rgba(38,26,10,.92)'; g.fillText(s, x, y);
};
const brassBg = (g: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  const r = rng(seed); const b = g.createLinearGradient(0, 0, w, h); b.addColorStop(0, '#8a6a34'); b.addColorStop(0.45, '#c9a560'); b.addColorStop(0.6, '#b38f4e'); b.addColorStop(1, '#7a5c2c'); g.fillStyle = b; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '60,40,10' : '255,240,200'},${r() * 0.06})`; g.fillRect(r() * w, r() * h, 1 + r() * 60, 1); } // brushed
  g.strokeStyle = 'rgba(40,28,10,.6)'; g.lineWidth = 4; g.strokeRect(18, 18, w - 36, h - 36); g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
};

/* ================================================================== HALL: 300 seats, one lit; rows numbered by age */
export const HALL_X = 120;
export const HALL = { t0: 40.87, band: 45.02, brk: 49.172, t1: 52.53 };
export const buildHall = () => {
  const g = new THREE.Group(); g.position.x = HALL_X;
  const ROWS = 15, PER = 20, ZC = -4, LIT_R = 6, LIT_S = 13, AISLE = 0.9;
  const velvet = M({ color: '#7a2124', roughness: 0.82 }), wood = M({ color: '#2c1d14', roughness: 0.55 }), brass = M({ color: '#b48d4c', metalness: 1, roughness: 0.35 }), carpet = M({ color: '#2a1a18', roughness: 0.95 });
  const geo = { back: new RoundedBoxGeometry(0.5, 0.56, 0.09, 3, 0.03), seat: new RoundedBoxGeometry(0.48, 0.1, 0.44, 3, 0.03), arm: new THREE.BoxGeometry(0.05, 0.6, 0.48), plate: new THREE.BoxGeometry(0.1, 0.04, 0.006) };
  const N = ROWS * PER; const backs = new THREE.InstancedMesh(geo.back, velvet, N), seats = new THREE.InstancedMesh(geo.seat, velvet, N), arms = new THREE.InstancedMesh(geo.arm, wood, ROWS * (PER + 2)), plates = new THREE.InstancedMesh(geo.plate, brass, N);
  for (const m of [backs, seats, arms, plates]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const P = new THREE.Object3D(), C = new THREE.Object3D(), mat = new THREE.Matrix4();
  const put = (im: THREE.InstancedMesh, i: number, lx: number, ly: number, lz: number, rx = 0) => { C.position.set(lx, ly, lz); C.rotation.set(rx, 0, 0); C.updateMatrix(); mat.multiplyMatrices(P.matrix, C.matrix); im.setMatrixAt(i, mat); };
  const seatPos: { a: number; R: number; y: number; r: number }[] = []; let ai = 0; let litPos = new THREE.Vector3();
  for (let r = 0; r < ROWS; r++) {
    const R = 6 + r * 0.95, y = r * 0.3, step = 0.56 / R, gap = AISLE / R;
    const span = PER * step + gap + 0.6 / R;
    /* the tread and the riser of this row */
    const tread = new THREE.Mesh(new THREE.RingGeometry(R - 0.5, R + 0.45, 48, 1, -Math.PI / 2 - span / 2, span), carpet); tread.rotation.x = -Math.PI / 2; tread.position.set(0, y + 0.001, ZC); tread.receiveShadow = true; g.add(tread);
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.5, R - 0.5, 0.3, 48, 1, true, -span / 2, span), carpet); riser.position.set(0, y - 0.15, ZC); riser.material = carpet; riser.receiveShadow = true; g.add(riser);
    const fill = new THREE.Mesh(new THREE.RingGeometry(R - 0.5, R + 0.45, 48, 1, -Math.PI / 2 - span / 2, span), carpet); fill.rotation.x = -Math.PI / 2; fill.position.set(0, y - 0.3, ZC); g.add(fill);
    for (let s = 0; s < PER; s++) {
      const a = (s - (PER - 1) / 2) * step + (s >= PER / 2 ? gap / 2 : -gap / 2); const i = r * PER + s;
      P.position.set(R * Math.sin(a), y, ZC + R * Math.cos(a)); P.rotation.set(0, a + Math.PI, 0); P.updateMatrix();
      put(seats, i, 0, 0.42, 0.02); put(backs, i, 0, 0.74, -0.23, -0.12); put(plates, i, 0, 0.93, -0.3, -0.12);
      put(arms, ai++, -0.27, 0.3, 0.0); if (s === PER - 1 || s === PER / 2 - 1) put(arms, ai++, 0.27, 0.3, 0.0);
      seatPos.push({ a, R, y, r }); if (r === LIT_R && s === LIT_S) litPos = new THREE.Vector3(R * Math.sin(a), y, ZC + R * Math.cos(a));
    }
  }
  arms.count = ai;
  for (let i = 0; i < N; i++) { backs.setColorAt(i, new THREE.Color(1, 1, 1)); seats.setColorAt(i, new THREE.Color(1, 1, 1)); }
  /* age numbers painted on the aisle risers, facing the stage: 16 … 30 */
  const nums: THREE.MeshBasicMaterial[] = [];
  for (let r = 0; r < ROWS; r++) { const R = 6 + r * 0.95, y = r * 0.3; const { g: c, tex } = canvasTex(256, 128); c.font = `700 110px ${SERIF}`; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText(String(16 + r), 128, 108);
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: '#8d7c66', toneMapped: false }); nums.push(m);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.28), m); pl.position.set(0, y - 0.15, ZC + R - 0.51); pl.rotation.y = Math.PI; g.add(pl); }
  /* the lit seat's brass plate: 22 */
  { const { g: c, tex } = canvasTex(256, 128); brassBg(c, 256, 128, 4); engrave(c, '22', 128, 98, `700 84px ${SERIF}`);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.05), M({ map: tex, metalness: 0.9, roughness: 0.35 })); P.position.copy(litPos); P.rotation.set(0, seatPos[LIT_R * PER + LIT_S].a + Math.PI, 0); P.updateMatrix();
    C.position.set(0, 0.97, -0.178); C.rotation.set(-0.12, 0, 0); C.updateMatrix(); pl.matrixAutoUpdate = false; pl.matrix.multiplyMatrices(P.matrix, C.matrix); g.add(pl); }
  /* lights: a cool wash from the stage, a warm spot on one seat, a warm band over the rows 18–25 */
  g.add(new THREE.HemisphereLight('#3a4656', '#0b0807', 0.3));
  const wash = new THREE.DirectionalLight('#8da3bd', 1.1); wash.position.set(-3, 6, -14); wash.target.position.set(0, 0, 6); g.add(wash, wash.target);
  const spot = new THREE.SpotLight('#ffd7a0', 0, 0, 0.075, 0.35, 2); spot.position.copy(litPos).add(new THREE.Vector3(0, 7, 0)); spot.target.position.copy(litPos).add(new THREE.Vector3(0, 0.4, 0));
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.camera.near = 4; spot.shadow.camera.far = 9; spot.shadow.bias = -0.0005; g.add(spot, spot.target);
  const b = beam('#ffd9a6', 7, 0.075, 0.05); b.mesh.position.copy(litPos).add(new THREE.Vector3(0, 3.9, 0)); g.add(b.mesh);
  const band = new THREE.SpotLight('#ffb979', 0, 0, 0.42, 0.8, 2); band.position.set(0, 9, ZC + 3); band.target.position.set(0, 1.5, ZC + 6 + 5.5 * 0.95); g.add(band, band.target);
  const NM = 260, mb = new Float32Array(NM * 3); const rr = rng(31); for (let i = 0; i < NM; i++) { const h = rr() * 6.5, rad = Math.sqrt(rr()) * (0.05 + (7 - h) * 0.07); const a = rr() * 7; mb[i * 3] = litPos.x + Math.cos(a) * rad; mb[i * 3 + 1] = litPos.y + 0.4 + h; mb[i * 3 + 2] = litPos.z + Math.sin(a) * rad; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(mb.slice(), 3)); const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#ffe0b0', size: 0.014, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(dust);
  const keys = at(HALL_X, [
    [HALL.t0, 0.0, 4.6, -6.8, 0, 2.2, 8, 44],
    [HALL.band, 0.7, 3.9, -3.4, 1.2, 2.2, 7.5, 38],
    [HALL.brk, 2.3, 3.4, 3.6, 1.96, 2.3, 7.5, 34],
    [HALL.t1, 1.75, 3.6, 5.6, 1.96, 2.55, 7.45, 28],
  ]);
  const lx = litPos.x;
  const update = (t: number) => {
    const k = ramp(t, HALL.t0 + 0.6, 0.12) * (1 - 0.3 * Math.max(0, Math.sin((t - HALL.t0) * 41)) * Math.exp(-(t - HALL.t0 - 0.6) * 7));
    spot.intensity = 420 * k; b.mat.uniforms.uI.value = 0.9 * k; (dust.material as THREE.PointsMaterial).opacity = 0.7 * k;
    const bk = eio(ramp(t, HALL.band, 1.0)); band.intensity = 160 * bk;
    const warm = new THREE.Color('#ffcf96'), lit = new THREE.Color('#ffe2a8').multiplyScalar(1.6), base = new THREE.Color(1, 1, 1), tmp = new THREE.Color();
    for (let i = 0; i < N; i++) { const r = seatPos[i].r; const inBand = r >= 2 && r <= 9; tmp.copy(base); if (inBand) tmp.lerp(warm, 0.55 * bk); if (i === LIT_R * PER + LIT_S) tmp.lerp(lit, k); backs.setColorAt(i, tmp); seats.setColorAt(i, tmp); }
    backs.instanceColor!.needsUpdate = true; seats.instanceColor!.needsUpdate = true;
    nums.forEach((m, r) => { const inBand = r >= 2 && r <= 9; m.color.set('#6f6252').lerp(new THREE.Color('#ffd48a'), inBand ? bk : 0).multiplyScalar(inBand ? 1 + 0.6 * bk : 1); });
    const dp = dust.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < dp.count; i++) { const j = i * 3; dp.setXYZ(i, mb[j] + Math.sin(t * 0.3 + i) * 0.03, mb[j + 1] + Math.sin(t * 0.2 + i) * 0.05, mb[j + 2] + Math.cos(t * 0.27 + i) * 0.03); } dp.needsUpdate = true;
    const p = herm(keys, t); void lx; return p;
  };
  return { g, update };
};

/* ================================================================== RADIO: a dark room, rain, an old valve radio tuned to three cities */
export const RADIO_X = 180;
export const RAD = { t0: 52.53, near: 56.74, dial: 60.52, ca: 65.45, ch: 69.51, ac: 73.99, why: 78.33, drop: 82.239, t1: 86.44 };
const STATIONS = [
  { u: 0.2, name: '加州 · 美国', stat: '20人中，无人以正面为主', col: '#ff5a3c' },
  { u: 0.5, name: '金奈 · 印度', stat: '20人中，11人听到家人', col: '#ffbf69' },
  { u: 0.8, name: '阿克拉 · 加纳', stat: '20人中，10人以正面为主', col: '#8fdcb0' },
];
const needleU = (t: number) => {
  if (t < RAD.dial) return 0.07 + 0.01 * Math.sin(t * 0.7);
  if (t < RAD.ca) return 0.07 + (0.2 - 0.07) * eio(ramp(t, RAD.ca - 1.2, 1.2)) + 0.004 * Math.sin(t * 9) * (1 - ramp(t, RAD.ca - 0.3, 0.3));
  if (t < RAD.ch) return 0.2 + 0.3 * eio(ramp(t, RAD.ch - 0.55, 0.55));
  if (t < RAD.ac) return 0.5 + 0.3 * eio(ramp(t, RAD.ac - 0.55, 0.55));
  if (t < RAD.drop) return 0.8 - 0.3 * eio(ramp(t, RAD.why + 0.3, 2.5));
  const s = t - RAD.drop; return 0.5 + 0.32 * Math.sin(s * 9) * Math.exp(-s * 1.6);
};
/* which station is speaking, and how loud (a voice envelope with that city's character) */
const voice = (t: number) => {
  const env = (kind: number) => kind === 0 ? clamp(0.35 + 0.65 * Math.abs(Math.sin(t * 13.1) * Math.sin(t * 5.3 + 1)) + 0.25 * Math.sin(t * 47) ** 8)
    : kind === 1 ? clamp(0.3 + 0.7 * Math.max(0, Math.sin(t * 4.7)) * (0.6 + 0.4 * Math.sin(t * 1.1) ** 2)) : clamp(0.55 + 0.3 * Math.sin(t * 2.3) + 0.1 * Math.sin(t * 5.1));
  if (t < RAD.dial) return { col: new THREE.Color('#a9c8ff'), e: 0.25 + 0.75 * ramp(t, RAD.t0 + 1.2, 1.5) * clamp(0.4 + 0.6 * Math.abs(Math.sin(t * 3.7) * Math.sin(t * 1.3))) };
  if (t < RAD.ca) return { col: new THREE.Color('#a9c8ff'), e: 0.3 + 0.2 * Math.abs(Math.sin(t * 2)) };
  if (t < RAD.why) { const i = t < RAD.ch ? 0 : t < RAD.ac ? 1 : 2; return { col: new THREE.Color(STATIONS[i].col), e: env(i) }; }
  if (t < RAD.drop) { const i = Math.floor((t - RAD.why) * 2.2) % 3; return { col: new THREE.Color(STATIONS[i].col), e: 0.45 * env(i) }; }
  const m = eio(ramp(t, RAD.drop + 0.4, 2.2)); const i = Math.floor((t - RAD.drop) * 9) % 3; return { col: new THREE.Color(STATIONS[i].col).lerp(new THREE.Color('#ffd27a'), m), e: 0.9 + 0.1 * Math.sin(t * 7) };
};
export const buildRadio = (gl: THREE.WebGLRenderer) => {
  const g = new THREE.Group(); g.position.x = RADIO_X; const envMap = makeEnv(gl, '#ffb36b');
  /* room */
  const pl = plasterTex(); pl.repeat.set(2, 1);
  const wallM = M({ map: pl, color: '#7c8790', roughness: 0.95 });
  const WZ = -0.55, WIN = { x0: -1.25, x1: -0.35, y0: 0.95, y1: 1.95 };
  const wp = (x0: number, x1: number, y0: number, y1: number) => add(g, new THREE.PlaneGeometry(x1 - x0, y1 - y0), wallM, (x0 + x1) / 2, (y0 + y1) / 2, WZ, false);
  wp(-3, WIN.x0, 0, 3); wp(WIN.x1, 3, 0, 3); wp(WIN.x0, WIN.x1, 0, WIN.y0); wp(WIN.x0, WIN.x1, WIN.y1, 3);
  add(g, new THREE.PlaneGeometry(4, 3).rotateY(Math.PI / 2), wallM, -2.2, 1.5, 1.0, false);
  const ft = floorTex(); ft.repeat.set(2, 2); const fl = add(g, new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2), M({ map: ft, color: '#8c7a68', roughness: 0.55 }), 0, 0, 1.5, false); void fl;
  const frameM = M({ color: '#262b2f', roughness: 0.5 }); const xc = (WIN.x0 + WIN.x1) / 2, yc = (WIN.y0 + WIN.y1) / 2;
  for (const x of [WIN.x0, WIN.x1]) add(g, new THREE.BoxGeometry(0.04, WIN.y1 - WIN.y0, 0.16), frameM, x, yc, WZ - 0.06);
  for (const y of [WIN.y0, WIN.y1]) add(g, new THREE.BoxGeometry(WIN.x1 - WIN.x0, 0.04, 0.16), frameM, xc, y, WZ - 0.06);
  add(g, new THREE.BoxGeometry(0.035, WIN.y1 - WIN.y0, 0.04), frameM, xc, yc, WZ - 0.1); add(g, new THREE.BoxGeometry(WIN.x1 - WIN.x0, 0.035, 0.04), frameM, xc, yc + 0.12, WZ - 0.1);
  const glass = canvasTex(512, 512); const gm = new THREE.Mesh(new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0), new THREE.MeshBasicMaterial({ map: glass.tex, fog: false })); gm.position.set(xc, yc, WZ - 0.12); g.add(gm);
  /* table */
  const tw = M({ color: '#3b2619', roughness: 0.4 });
  add(g, new THREE.BoxGeometry(1.4, 0.04, 0.7), tw, 0, 0.74, 0.0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, new THREE.BoxGeometry(0.05, 0.72, 0.05), tw, sx * 0.64, 0.36, sz * 0.3);
  /* the radio */
  const body = add(g, new RoundedBoxGeometry(0.52, 0.33, 0.25, 5, 0.045), M({ color: '#5a3219', roughness: 0.28, envMap, envMapIntensity: 0.6 }), 0, 0.76 + 0.165, 0); void body;
  const FZ = 0.1262;
  const fab = canvasTex(512, 256); { const c = fab.g; c.fillStyle = '#2a2018'; c.fillRect(0, 0, 512, 256); for (let y = 0; y < 256; y += 4) { c.fillStyle = 'rgba(160,130,90,.35)'; c.fillRect(0, y, 512, 2); } for (let x = 0; x < 512; x += 4) { c.fillStyle = 'rgba(120,95,65,.3)'; c.fillRect(x, 0, 2, 256); } }
  const grilleM = M({ map: fab.tex, emissiveMap: fab.tex, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.9 });
  add(g, new THREE.PlaneGeometry(0.36, 0.15), grilleM, 0, 0.975, FZ, false);
  const brass = M({ color: '#c9a35c', metalness: 1, roughness: 0.28, envMap });
  for (const y of [0.975 - 0.08, 0.975 + 0.08]) add(g, new THREE.BoxGeometry(0.38, 0.008, 0.008), brass, 0, y, FZ + 0.002);
  for (const x of [-0.186, 0.186]) add(g, new THREE.BoxGeometry(0.008, 0.168, 0.008), brass, x, 0.975, FZ + 0.002);
  for (let i = 1; i < 6; i++) add(g, new THREE.BoxGeometry(0.004, 0.15, 0.004), brass, -0.18 + i * 0.06, 0.975, FZ + 0.004);
  const dial = canvasTex(1024, 166); const dialM = new THREE.MeshBasicMaterial({ map: dial.tex, toneMapped: false });
  add(g, new THREE.PlaneGeometry(0.34, 0.055), dialM, 0, 0.84, FZ + 0.0025, false);
  add(g, new THREE.BoxGeometry(0.352, 0.066, 0.006), brass, 0, 0.84, FZ - 0.002);
  const knobM = M({ color: '#1a1410', roughness: 0.3, envMap, envMapIntensity: 0.5 });
  const knobs = [-0.215, 0.215].map((x) => add(g, new THREE.CylinderGeometry(0.026, 0.028, 0.026, 32).rotateX(Math.PI / 2), knobM, x, 0.84, FZ + 0.013));
  const eye = canvasTex(128, 128); add(g, new THREE.CircleGeometry(0.017, 32), new THREE.MeshBasicMaterial({ map: eye.tex, toneMapped: false }), 0, 1.066, FZ + 0.001, false);
  add(g, new THREE.TorusGeometry(0.019, 0.003, 8, 32), brass, 0, 1.066, FZ + 0.002);
  /* lights */
  g.add(new THREE.HemisphereLight('#3d5066', '#0b0907', 0.12));
  const cookie = canvasTex(256, 256); const rain = new THREE.SpotLight('#9fb8d0', 70, 0, 0.42, 0.6, 2); rain.position.set(xc + 0.2, 2.4, WZ - 1.6); rain.target.position.set(0.3, 0.7, 0.4); rain.map = cookie.tex;
  rain.castShadow = true; rain.shadow.mapSize.set(1024, 1024); rain.shadow.bias = -0.0006; rain.shadow.camera.near = 0.5; rain.shadow.camera.far = 6; g.add(rain, rain.target);
  const dialLight = new THREE.PointLight('#ffb15c', 0.5, 2.5, 2); dialLight.position.set(0, 0.86, 0.35); g.add(dialLight);
  const voiceLight = new THREE.PointLight('#a9c8ff', 0, 4, 2); voiceLight.position.set(0, 0.98, 0.45); g.add(voiceLight);
  const vglow = glowSprite('#ffffff', 0.7, 0); vglow.position.set(0, 0.975, FZ + 0.02); g.add(vglow);
  const NM = 160, mb = new Float32Array(NM * 3); const rr = rng(41); for (let i = 0; i < NM; i++) { mb[i * 3] = -1 + rr() * 1.8; mb[i * 3 + 1] = 0.8 + rr() * 1.2; mb[i * 3 + 2] = -0.4 + rr() * 1.2; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(mb.slice(), 3)); const motes = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#cfe0ec', size: 0.005, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(motes);
  const nx = (u: number) => -0.15 + 0.3 * u; // needle x on the radio face
  const keys = at(RADIO_X, [
    [RAD.t0, 1.55, 1.38, 2.35, 0.0, 0.95, 0.0, 34],
    [RAD.near, 0.78, 1.12, 1.28, 0.0, 0.96, 0.05, 32],
    [RAD.dial, 0.2, 1.0, 0.66, 0.0, 0.93, 0.1, 30],
    [RAD.ca - 0.3, nx(0.2) + 0.02, 0.885, 0.53, nx(0.2), 0.845, 0.12, 30],
    [RAD.ch - 0.2, nx(0.25) + 0.02, 0.885, 0.52, nx(0.25), 0.845, 0.12, 30],
    [RAD.ch + 0.4, nx(0.5) + 0.02, 0.885, 0.52, nx(0.5), 0.845, 0.12, 30],
    [RAD.ac - 0.2, nx(0.55), 0.89, 0.52, nx(0.55), 0.845, 0.12, 30],
    [RAD.ac + 0.4, nx(0.8) - 0.01, 0.885, 0.52, nx(0.8), 0.845, 0.12, 30],
    [RAD.why, nx(0.78), 0.9, 0.5, nx(0.75), 0.85, 0.12, 30],
    [RAD.drop - 0.3, 0.95, 1.3, 1.75, 0.0, 0.95, 0.0, 34],
    [RAD.drop + 0.75, 0.02, 0.985, 0.5, 0.0, 0.975, 0.1, 30],
    [RAD.t1, 0.0, 0.975, 0.4, 0.0, 0.975, 0.1, 30],
  ]);
  const drawDial = (t: number) => {
    const c = dial.g, W = 1024, Hh = 166; const bg = c.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#3a2408'); bg.addColorStop(0.5, '#b8782a'); bg.addColorStop(1, '#4a2c0a'); c.fillStyle = bg; c.fillRect(0, 0, W, Hh);
    const hot = c.createRadialGradient(W * 0.5, Hh * 0.5, 10, W * 0.5, Hh * 0.5, 600); hot.addColorStop(0, 'rgba(255,220,150,.35)'); hot.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = hot; c.fillRect(0, 0, W, Hh);
    c.strokeStyle = 'rgba(40,20,4,.85)'; c.lineWidth = 2; for (let i = 0; i <= 80; i++) { const x = 40 + (i / 80) * (W - 80); const L = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10; c.beginPath(); c.moveTo(x, 18); c.lineTo(x, 18 + L); c.stroke(); }
    c.font = `600 22px ${SERIF}`; c.fillStyle = 'rgba(40,20,4,.85)'; c.textAlign = 'center'; [55, 60, 70, 80, 100, 120, 140, 160, 170].forEach((n, i) => c.fillText(String(n), 40 + (i / 8) * (W - 80), 70));
    const u = needleU(t);
    STATIONS.forEach((s, i) => { const x = 40 + s.u * (W - 80); const act = (i === 0 && t >= RAD.ca && t < RAD.ch) || (i === 1 && t >= RAD.ch && t < RAD.ac) || (i === 2 && t >= RAD.ac && t < RAD.why + 2) || t >= RAD.drop;
      const near = clamp(1 - Math.abs(u - s.u) * 12); const show = t >= RAD.dial - 0.3 ? 1 : 0;
      c.globalAlpha = show * (0.55 + 0.45 * (act ? 1 : near)); c.font = `700 30px ${SANS}`; c.fillStyle = act ? '#2a0e02' : 'rgba(40,20,4,.85)'; c.fillText(s.name, x, 112);
      if (act && t < RAD.drop) { c.font = `500 21px ${SANS}`; c.fillStyle = 'rgba(40,18,4,.95)'; c.globalAlpha = ramp(t, i === 0 ? RAD.ca : i === 1 ? RAD.ch : RAD.ac, 0.4); c.fillText(s.stat, x, 146); }
      c.globalAlpha = 1; });
    if (t >= RAD.dial - 0.3 && t < RAD.ca) { c.font = `500 21px ${SANS}`; c.fillStyle = `rgba(40,18,4,${0.9 * ramp(t, RAD.dial, 0.5)})`; c.fillText('斯坦福 · Luhrmann · 3座城市 · 60位患者', W / 2, 146); }
    const x = 40 + u * (W - 80); c.strokeStyle = 'rgba(200,30,10,.95)'; c.lineWidth = 5; c.shadowColor = 'rgba(255,60,20,.8)'; c.shadowBlur = 10; c.beginPath(); c.moveTo(x, 8); c.lineTo(x, Hh - 8); c.stroke(); c.shadowBlur = 0;
    dial.tex.needsUpdate = true;
  };
  const drawEye = (e: number, col: THREE.Color) => { const c = eye.g; c.fillStyle = '#05160c'; c.fillRect(0, 0, 128, 128); const open = 0.25 + 0.7 * e; const g2 = c.createRadialGradient(64, 64, 6, 64, 64, 64); g2.addColorStop(0, '#d8ffd0'); g2.addColorStop(1, '#2fbf5f'); c.fillStyle = g2;
    c.beginPath(); c.moveTo(64, 64); c.arc(64, 64, 64, -Math.PI / 2 + open * 1.4, -Math.PI / 2 + Math.PI * 2 - open * 1.4); c.closePath(); c.fill(); c.fillStyle = '#05160c'; c.beginPath(); c.arc(64, 64, 14, 0, 7); c.fill(); void col; eye.tex.needsUpdate = true; };
  const update = (t: number) => {
    drawGlass(glass.g, 512, 512, t); glass.tex.needsUpdate = true; drawCookie(cookie.g, 256, t); cookie.tex.needsUpdate = true; drawDial(t);
    const v = voice(t); const on = ramp(t, RAD.t0 + 0.8, 1.2);
    grilleM.emissive.copy(v.col); grilleM.emissiveIntensity = (0.15 + 0.9 * v.e) * on * (t >= RAD.drop ? 1.6 : 1);
    voiceLight.color.copy(v.col); voiceLight.intensity = (0.4 + 2.2 * v.e) * on * (t >= RAD.drop ? 2 : 1);
    (vglow.material as THREE.SpriteMaterial).color.copy(v.col); (vglow.material as THREE.SpriteMaterial).opacity = 0.12 * v.e * on;
    drawEye(v.e * on, v.col);
    knobs[1].rotation.z = -needleU(t) * 9;
    const dp = motes.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < dp.count; i++) { const j = i * 3; dp.setXYZ(i, mb[j] + Math.sin(t * 0.2 + i) * 0.04, mb[j + 1] + ((t * 0.015 + i * 0.13) % 0.3) - 0.15, mb[j + 2] + Math.cos(t * 0.17 + i) * 0.04); } dp.needsUpdate = true;
    const p = herm(keys, t); const sh = t > RAD.drop ? 0.006 * Math.exp(-(t - RAD.drop) * 4) : 0; p[0] += sh * Math.sin(t * 57); p[1] += sh * Math.cos(t * 49); return p;
  };
  return { g, update };
};

/* ================================================================== PLATES: three brass nameplates; 調 lights in each and they fly into one 调 */
export const PLATES_X = 240;
export const PLT = { t0: 86.44, lit: 91.29, fly: 92.5, one: 94.0, t1: 95.28 };
const NAMES = [
  { top: '日本 · 2002年', big: '統合失調症', sub: '旧名：精神分裂病', ti: 3 },
  { top: '韩国 · 2011年', big: '調絃病', sub: '조현병 · 旧名：精神分裂病', ti: 0 },
  { top: '台湾 · 2014年', big: '思覺失調症', sub: '旧名：精神分裂症', ti: 3 },
];
export const buildPlates = (gl: THREE.WebGLRenderer) => {
  const g = new THREE.Group(); g.position.x = PLATES_X; const envMap = makeEnv(gl, '#ffcf8a');
  const pl = plasterTex(); pl.repeat.set(3, 2);
  add(g, new THREE.PlaneGeometry(9, 5), M({ map: pl, color: '#5e5650', roughness: 0.95 }), 0, 1.6, 0, false);
  add(g, new THREE.PlaneGeometry(9, 4).rotateX(-Math.PI / 2), M({ color: '#16110d', roughness: 0.8 }), 0, 0, 2, false);
  const PW = 0.95, PH = 0.5, X = [-1.15, 0, 1.15], Y = 1.5;
  const glyphs: THREE.Mesh[] = []; const glyphHome: THREE.Vector3[] = []; const plateMats: THREE.MeshStandardMaterial[] = [];
  const glyphTex = (ch: string, size: number) => { const { g: c, tex } = canvasTex(256, 256); c.font = `700 ${size}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,190,90,.95)'; c.shadowBlur = 26; const gr = c.createLinearGradient(0, 40, 0, 220); gr.addColorStop(0, '#fff3cc'); gr.addColorStop(0.5, '#f1c56d'); gr.addColorStop(1, '#c08a34'); c.fillStyle = gr; c.fillText(ch, 128, 132); c.shadowBlur = 0; c.fillText(ch, 128, 132); return tex; };
  NAMES.forEach((n, i) => {
    const { g: c, tex } = canvasTex(1024, 540); brassBg(c, 1024, 540, 10 + i);
    engrave(c, n.top, 512, 110, `700 40px ${SANS}`); engrave(c, n.big, 512, 330, `700 150px ${SERIF}`); engrave(c, n.sub, 512, 452, `600 40px ${SANS}`);
    /* the old name, struck out in red */
    { c.font = `600 40px ${SANS}`; const k = n.sub.indexOf('旧名：') + 3; const full = c.measureText(n.sub).width; const x0 = 512 - full / 2 + c.measureText(n.sub.slice(0, k)).width; const x1 = 512 + full / 2; c.strokeStyle = '#c0281c'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 6, 438); c.lineTo(x1 + 6, 438); c.stroke(); }
    for (const [sx, sy] of [[60, 60], [964, 60], [60, 480], [964, 480]]) { const sg = c.createRadialGradient(sx - 4, sy - 4, 1, sx, sy, 16); sg.addColorStop(0, '#f0d8a0'); sg.addColorStop(1, '#5a4018'); c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, 14, 0, 7); c.fill(); c.strokeStyle = 'rgba(40,26,8,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx - 9, sy); c.lineTo(sx + 9, sy); c.stroke(); }
    /* where is 調 on this plate */
    c.font = `700 150px ${SERIF}`; const full = c.measureText(n.big).width; const pre = c.measureText(n.big.slice(0, n.ti)).width; const cw = c.measureText(n.big[n.ti]).width; const gx = 512 - full / 2 + pre + cw / 2, gy = 330 - 150 * 0.36;
    const m = M({ map: tex, metalness: 0.92, roughness: 0.3, envMap, envMapIntensity: 1.1, color: '#ffffff' }); plateMats.push(m);
    const plate = add(g, new RoundedBoxGeometry(PW, PH, 0.02, 3, 0.006), m, X[i], Y, 0.015); void plate;
    const home = new THREE.Vector3(X[i] + (gx / 1024 - 0.5) * PW, Y + (0.5 - gy / 540) * PH, 0.027);
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: glyphTex('調', 180), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, fog: false }));
    gm.position.copy(home); g.add(gm); glyphs.push(gm); glyphHome.push(home);
  });
  const one = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: glyphTex('调', 190), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false })); one.position.set(0, 1.55, 0.9); g.add(one);
  const oneGlow = glowSprite('#ffb455', 1.6, 0); oneGlow.position.set(0, 1.55, 0.85); g.add(oneGlow);
  g.add(new THREE.HemisphereLight('#6b5a48', '#0c0906', 0.18));
  const rake = new THREE.SpotLight('#ffd9a8', 0, 0, 0.5, 0.7, 2); rake.position.set(-3, 3.2, 2.2); rake.target.position.set(0, 1.5, 0); g.add(rake, rake.target);
  const top = new THREE.SpotLight('#ffe7c4', 0, 0, 0.75, 0.6, 2); top.position.set(0, 3.4, 1.2); top.target.position.set(0, 1.4, 0); top.castShadow = true; top.shadow.mapSize.set(1024, 1024); top.shadow.bias = -0.0005; g.add(top, top.target);
  const glyphLight = new THREE.PointLight('#ffc070', 0, 2.5, 2); glyphLight.position.set(0, 1.55, 1.0); g.add(glyphLight);
  const keys = at(PLATES_X, [
    [PLT.t0, -1.75, 1.62, 1.25, -1.1, 1.5, 0.0, 32],
    [89.2, -0.35, 1.58, 1.5, 0.2, 1.5, 0.0, 32],
    [PLT.lit, 0.0, 1.56, 2.85, 0.0, 1.5, 0.0, 36],
    [PLT.one, 0.0, 1.56, 2.5, 0.0, 1.52, 0.4, 34],
    [PLT.t1, 0.0, 1.56, 2.15, 0.0, 1.55, 0.6, 33],
  ]);
  const update = (t: number) => {
    const on = ramp(t, PLT.t0, 0.5); const sweep = eio(ramp(t, PLT.t0, PLT.lit - PLT.t0));
    rake.position.set(-3 + 6 * sweep, 3.2, 2.2); rake.intensity = 55 * on * (1 - 0.6 * ramp(t, PLT.one, 0.8)); top.intensity = 30 * on * (1 - 0.5 * ramp(t, PLT.one, 0.8));
    const lit = ramp(t, PLT.lit, 0.35); const fly = eio(ramp(t, PLT.fly, PLT.one - PLT.fly)); const oneK = ramp(t, PLT.one - 0.15, 0.3);
    glyphs.forEach((gm, i) => { const h = glyphHome[i]; const target = new THREE.Vector3(0, 1.55, 0.9); const p = h.clone().lerp(target, fly); p.z += Math.sin(fly * Math.PI) * 0.35; p.y += Math.sin(fly * Math.PI) * (i === 1 ? 0.18 : 0.08);
      gm.position.copy(p); gm.scale.setScalar(1 + 1.6 * fly); (gm.material as THREE.MeshBasicMaterial).opacity = lit * (1 - oneK) * (0.85 + 0.15 * Math.sin(t * 6 + i)); });
    (one.material as THREE.MeshBasicMaterial).opacity = oneK; one.scale.setScalar(0.9 + 0.1 * eo(ramp(t, PLT.one, 0.6)) + 0.015 * Math.sin(t * 3));
    (oneGlow.material as THREE.SpriteMaterial).opacity = 0.18 * oneK; glyphLight.intensity = 1.5 * Math.max(lit * 0.6, oneK);
    plateMats.forEach((m) => m.color.setScalar(1 - 0.55 * ramp(t, PLT.one, 0.8)));
    return herm(keys, t);
  };
  return { g, update };
};

/* ================================================================== STRING: one string out of tune; the peg turns; on the hit it rings true */
export const STRING_X = 300;
export const STR = { t0: 95.28, turn: 99.6, tune: 101.57, t1: 103.55 };
export const buildString = () => {
  const g = new THREE.Group(); g.position.x = STRING_X;
  const ft = floorTex(); ft.repeat.set(1, 0.25);
  const wood = M({ map: ft, color: '#7a4a28', roughness: 0.38 }), ebony = M({ color: '#15100d', roughness: 0.32 }), ivory = M({ color: '#e8dcc0', roughness: 0.4 });
  add(g, new THREE.BoxGeometry(2.4, 0.04, 0.34), wood, 0.1, -0.03, 0); // the body under the strings
  add(g, new THREE.BoxGeometry(1.9, 0.016, 0.12), ebony, -0.05, 0.0, 0); // fingerboard
  add(g, new THREE.BoxGeometry(0.012, 0.03, 0.12), ivory, -0.85, 0.012, 0); // nut
  const bridge = add(g, new THREE.BoxGeometry(0.02, 0.045, 0.13), wood, 0.9, 0.018, 0); void bridge;
  add(g, new THREE.BoxGeometry(0.3, 0.07, 0.13), wood, -1.06, 0.02, 0); // pegbox
  const pegs: THREE.Group[] = [];
  const SZ = [-0.039, -0.013, 0.013, 0.039];
  SZ.forEach((z, i) => { const pg = new THREE.Group(); pg.position.set(-1.12 + i * 0.05, 0.03, 0); g.add(pg); pegs.push(pg);
    add(pg, new THREE.CylinderGeometry(0.008, 0.01, 0.24, 16).rotateX(Math.PI / 2), ebony, 0, 0, 0.04 * (i % 2 ? 1 : -1));
    const head = add(pg, new THREE.SphereGeometry(0.03, 24, 16), ebony, 0, 0, (i % 2 ? 1 : -1) * 0.17); head.scale.set(0.35, 1, 0.9); void z; });
  const steel = M({ color: '#d6d2c8', metalness: 1, roughness: 0.25 });
  const X0 = -0.85, X1 = 0.9, Y = 0.035;
  SZ.forEach((z, i) => { const L = X1 - X0; const s = add(g, new THREE.CylinderGeometry(0.0011 + i * 0.0003, 0.0011 + i * 0.0003, L, 8).rotateZ(Math.PI / 2), steel, (X0 + X1) / 2, Y, z); void s;
    add(g, new THREE.CylinderGeometry(0.001, 0.001, 0.28, 6).rotateZ(Math.PI / 2 - 0.06), steel, X0 - 0.13, Y + 0.004, z); });
  /* the vibration envelope of the out-of-tune string: a ribbon whose outline is the string's swing */
  const SEG = 96; const rib = new THREE.PlaneGeometry(1, 1, SEG, 1); const ribPos = rib.attributes.position as THREE.BufferAttribute;
  const ribM = new THREE.MeshBasicMaterial({ color: '#cfd8e6', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
  const ribbon = new THREE.Mesh(rib, ribM); ribbon.position.set(0, 0, SZ[1]); ribbon.frustumCulled = false; g.add(ribbon);
  const glowLine = glowSprite('#ffc86e', 0.5, 0); g.add(glowLine);
  g.add(new THREE.HemisphereLight('#4a3a2c', '#080605', 0.15));
  const key = new THREE.SpotLight('#ffd8a8', 26, 0, 0.6, 0.7, 2); key.position.set(-0.6, 1.4, 0.9); key.target.position.set(-0.3, 0, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.camera.near = 0.5; key.shadow.camera.far = 3; g.add(key, key.target);
  const rim = new THREE.SpotLight('#9fb6d0', 10, 0, 0.6, 0.8, 2); rim.position.set(1.4, 0.5, -1.0); rim.target.position.set(-0.4, 0, 0); g.add(rim, rim.target);
  const gold = new THREE.PointLight('#ffc070', 0, 1.5, 2); gold.position.set(0, 0.12, 0.05); g.add(gold);
  /* a clip-on tuner on the pegbox: the needle says how far out of tune the string is */
  const tuner = new THREE.Group(); tuner.position.set(-0.93, 0.17, 0.07); tuner.rotation.set(-0.25, 0.75, 0); g.add(tuner);
  add(tuner, new RoundedBoxGeometry(0.15, 0.1, 0.02, 3, 0.01), M({ color: '#121314', roughness: 0.4 }), 0, 0, 0);
  add(g, new THREE.BoxGeometry(0.012, 0.12, 0.012), M({ color: '#121314', roughness: 0.4 }), -0.95, 0.09, 0.05);
  const disp = canvasTex(600, 400); add(tuner, new THREE.PlaneGeometry(0.136, 0.09), new THREE.MeshBasicMaterial({ map: disp.tex, toneMapped: false }), 0, 0, 0.0105, false);
  const drawTuner = (cents: number, ok: number) => { const c = disp.g; c.fillStyle = ok > 0.5 ? '#0d2a16' : '#2a0e0c'; c.fillRect(0, 0, 600, 400);
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 4; for (let k = -5; k <= 5; k++) { const a = (k / 5) * 0.9 - Math.PI / 2; c.beginPath(); c.moveTo(300 + Math.cos(a) * 220, 330 + Math.sin(a) * 220); c.lineTo(300 + Math.cos(a) * (k ? 245 : 260), 330 + Math.sin(a) * (k ? 245 : 260)); c.stroke(); }
    c.fillStyle = '#41d36b'; c.beginPath(); c.arc(300, 70, 14, 0, 7); c.fill();
    const a = (Math.max(-50, Math.min(50, cents)) / 50) * 0.9 - Math.PI / 2; c.strokeStyle = ok > 0.5 ? '#41d36b' : '#ff5a3c'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(300, 330); c.lineTo(300 + Math.cos(a) * 230, 330 + Math.sin(a) * 230); c.stroke();
    c.textAlign = 'center'; c.font = `900 84px ${SANS}`; c.fillStyle = ok > 0.5 ? '#41d36b' : '#ff7a5a'; c.fillText(ok > 0.5 ? '准了 ✓' : '走调', 300, 390); disp.tex.needsUpdate = true; };
  const keys = at(STRING_X, [
    [STR.t0, 0.8, 0.17, 0.34, 0.0, 0.03, 0.0, 30],
    [98.0, 0.1, 0.15, 0.3, -0.5, 0.035, 0.0, 30],
    [STR.turn, -0.5, 0.24, 0.42, -0.95, 0.1, 0.03, 32],
    [STR.tune, -0.68, 0.26, 0.42, -1.0, 0.11, 0.04, 30],
    [STR.t1, 0.35, 0.3, 0.48, -0.2, 0.03, 0.0, 32],
  ]);
  const update = (t: number) => {
    const tuned = ramp(t, STR.tune, 0.12); const turn = eio(ramp(t, STR.turn, STR.tune - STR.turn)); const bounce = t > STR.tune ? 0.06 * Math.exp(-(t - STR.tune) * 8) * Math.sin((t - STR.tune) * 40) : 0;
    pegs[1].rotation.z = turn * Math.PI * 3 + bounce;
    /* envelope: before, lumpy and wandering (several partials beating); after, one clean spindle */
    const L = X1 - X0; const amp0 = 0.022 * (1 - 0.4 * turn), amp1 = 0.009 * (0.6 + 0.4 * Math.exp(-(t - STR.tune) * 1.2));
    for (let i = 0; i <= SEG; i++) { const s = i / SEG; const x = X0 + s * L;
      const messy = amp0 * Math.abs(Math.sin(Math.PI * s) * (0.7 + 0.3 * Math.sin(t * 3.1)) + 0.55 * Math.sin(2 * Math.PI * s + t * 2.3) * Math.sin(t * 1.7) + 0.35 * Math.sin(3 * Math.PI * s - t * 4.1));
      const clean = amp1 * Math.sin(Math.PI * s) * (0.9 + 0.1 * Math.sin(t * 31));
      const e = messy * (1 - tuned) + clean * tuned; const wob = (1 - tuned) * 0.003 * Math.sin(s * 9 + t * 5) * Math.sin(Math.PI * s);
      ribPos.setXYZ(i, x, Y + e + wob, 0); ribPos.setXYZ(i + SEG + 1, x, Y - e + wob, 0); }
    ribPos.needsUpdate = true;
    ribM.color.set('#cfd8e6').lerp(new THREE.Color('#ffcf7a'), tuned); ribM.opacity = 0.55 + 0.35 * tuned;
    glowLine.position.set((X0 + X1) / 2, Y, SZ[1]); glowLine.scale.set(1.9, 0.12, 1); (glowLine.material as THREE.SpriteMaterial).opacity = 0.35 * tuned;
    gold.intensity = 0.8 * tuned;
    drawTuner((1 - turn) * (-36 + 6 * Math.sin(t * 2.7)) + (1 - tuned) * turn * 3 * Math.sin(t * 9), tuned);
    return herm(keys, t);
  };
  return { g, update };
};
