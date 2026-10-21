/* 《身体里住着两个人》 v3 explanation scenes: one mannequin is "the person" all the way through, and every fact gets a
   picture you understand at a glance. Gears in a glass head; a crowd of 300; a globe with three cities. Everything code-drawn. */
import * as THREE from 'three';
import { feature } from 'topojson-client';
import land from 'world-atlas/land-50m.json';
import countries from 'world-atlas/countries-110m.json';
import { M, add, rng, herm, Key, canvasTex, beam } from './Sets3D';
import { glowSprite } from './Set';
import { floorTex } from './PuppetTest';
import { ramp, eio, eo, clamp, SERIF, SANS, GOLD } from './lib';

/* ------------------------------------------------------------------ the mannequin (same build as in the mirror) */
export const shellMat = () => new THREE.MeshPhysicalMaterial({ color: '#d8d2c8', roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15 });
export const mannequin = (shell: THREE.Material = shellMat(), headMat?: THREE.Material) => {
  const root = new THREE.Group(); const seam = M({ color: '#6d6861', roughness: 0.5 });
  const torso = new THREE.Group(); torso.position.y = 1.0; root.add(torso);
  const prof = [[0.0, -0.12], [0.13, -0.12], [0.135, -0.02], [0.125, 0.08], [0.145, 0.2], [0.17, 0.3], [0.178, 0.38], [0.165, 0.43], [0.12, 0.465], [0.055, 0.485], [0.0, 0.49]].map(([r, y]) => new THREE.Vector2(r, y));
  const tg = new THREE.LatheGeometry(prof, 48); tg.scale(1, 1, 0.6); const tm = new THREE.Mesh(tg, shell); tm.castShadow = true; torso.add(tm);
  /* hips and legs, so it can stand in a crowd */
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 16), shell); hips.scale.set(1, 0.7, 0.66); hips.position.y = -0.12; hips.castShadow = true; torso.add(hips);
  for (const sx of [-1, 1]) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 16), shell); sh.position.set(sx * 0.17, 0.405, 0); torso.add(sh);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.004, 8, 24), seam); ring.rotation.y = Math.PI / 2; ring.position.set(sx * 0.2, 0.39, 0); torso.add(ring);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.26, 8, 16), shell); arm.position.set(sx * 0.205, 0.23, 0); arm.rotation.z = sx * 0.06; arm.castShadow = true; torso.add(arm);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.24, 8, 16), shell); fore.position.set(sx * 0.222, -0.06, 0.02); fore.rotation.x = -0.12; fore.castShadow = true; torso.add(fore);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.36, 8, 16), shell); thigh.position.set(sx * 0.075, -0.42, 0); thigh.castShadow = true; torso.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.36, 8, 16), shell); shin.position.set(sx * 0.075, -0.82, 0.0); shin.castShadow = true; torso.add(shin);
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 0.1, 24), shell); neck.position.y = 0.52; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.565; torso.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 48, 32), headMat ?? shell); hd.scale.set(0.76, 1.14, 0.88); hd.position.set(0, 0.1, 0.004); hd.castShadow = !headMat; head.add(hd);
  return { root, torso, head, headMesh: hd };
};

/* ================================================================== GEARS: what splits is not the person, it is the parts that should turn together */
export const GEAR_X = 400;
const gearGeo = (r: number, teeth: number, h: number, depth: number) => {
  const s = new THREE.Shape(); const N = teeth * 4;
  for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2; const k = i % 4; const rr = k === 0 || k === 1 ? r + h : r; const p = [Math.cos(a) * rr, Math.sin(a) * rr]; i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }
  const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.18, 0, Math.PI * 2, true); s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.15, bevelSize: depth * 0.15, bevelSegments: 2, curveSegments: 4 }); g.translate(0, 0, -depth / 2); return g;
};
export const GEAR_PARTS = [{ s: '看见', c: '#7fb2ff' }, { s: '听见', c: '#6fd6c2' }, { s: '思考', c: '#f2c46d' }, { s: '感受', c: '#f29a8a' }];
export const buildGears = (o: { t0: number; drift: number; t1: number; keys?: Key[]; X?: number; parts?: { s: string; c: string }[]; merge?: number }) => {
  const GX = o.X ?? GEAR_X; const PARTS = o.parts ?? GEAR_PARTS;
  const g = new THREE.Group(); g.position.x = GX;
  const ft = floorTex(); ft.repeat.set(3, 3);
  add(g, new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2), M({ map: ft, color: '#3b3129', roughness: 0.6 }), 0, 0, 0, false);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#dfe8f0', roughness: 0.05, transparent: true, opacity: 0.16, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
  const m = mannequin(shellMat(), glass); m.root.rotation.y = 0.5; g.add(m.root);
  const rimG = new THREE.Mesh(m.headMesh.geometry, new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(0.75,0.88,1.0, f*0.85); }' }));
  rimG.scale.copy(m.headMesh.scale).multiplyScalar(1.004); rimG.position.copy(m.headMesh.position); m.head.add(rimG);
  /* a backdrop: a dark curved wall with a soft pool of light behind the head */
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 64, 1, true, Math.PI * 0.6, Math.PI * 0.8), M({ color: '#2a2622', roughness: 0.95, side: THREE.BackSide })); wall.position.set(0, 3, 0.6); wall.receiveShadow = true; g.add(wall);
  const back = new THREE.SpotLight('#c9a27a', 30, 0, 0.35, 0.9, 2); back.position.set(0.6, 3.5, 1.5); back.target.position.set(-1.0, 1.7, -3.2); g.add(back, back.target);
  /* the gears sit in the head, facing the camera side; scaled so they read */
  const brain = new THREE.Group(); brain.position.set(0, 0.105, 0.0); brain.rotation.y = -0.5 + 0.38; m.head.add(brain);
  const R = 0.026, TEETH = 12, H = 0.006; const pitch = 2 * R + H * 1.05; const pos: [number, number][] = [[-pitch / 2, pitch / 2], [pitch / 2, pitch / 2], [pitch / 2, -pitch / 2], [-pitch / 2, -pitch / 2]];
  const turns: THREE.Mesh[] = [];
  const gears = PARTS.map((p, i) => { const gg = new THREE.Group(); gg.position.set(pos[i][0], pos[i][1], 0); brain.add(gg);
    const mesh = new THREE.Mesh(gearGeo(R, TEETH, H, 0.012), M({ color: p.c, metalness: 0.75, roughness: 0.3, emissive: p.c, emissiveIntensity: 0.25 })); gg.add(mesh); turns.push(mesh);
    const lab = canvasTex(256, 256); const c = lab.g; c.fillStyle = 'rgba(12,12,14,.92)'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.font = `900 92px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(p.s, 128, 134);
    const face = new THREE.Mesh(new THREE.CircleGeometry(R * 0.86, 40), new THREE.MeshBasicMaterial({ map: lab.tex, toneMapped: false })); face.position.z = 0.0082; gg.add(face);
    return gg; });
  /* callouts outside the head: the same four words, big, with leader lines, so nobody has to squint */
  const callouts = PARTS.map((p) => { const lab = canvasTex(512, 160); const c = lab.g; c.font = `900 110px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = p.c; c.fillText(p.s, 10, 86);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshBasicMaterial({ map: lab.tex, transparent: true, toneMapped: false, depthWrite: false })); g.add(pl); return pl; });
  const lines = PARTS.map((p) => { const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: p.c, transparent: true, opacity: 0.8 })); g.add(l); return l; });
  const sparks = glowSprite('#ff6a4a', 0.08, 0); brain.add(sparks);
  g.add(new THREE.HemisphereLight('#7d8ea0', '#120e0b', 0.35));
  const key = new THREE.SpotLight('#ffe0bc', 60, 0, 0.5, 0.6, 2); key.position.set(1.2, 2.8, 2.0); key.target.position.set(0, 1.5, 0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005; g.add(key, key.target);
  const rim = new THREE.SpotLight('#8fb2d6', 40, 0, 0.6, 0.7, 2); rim.position.set(-1.5, 2.4, -1.6); rim.target.position.set(0, 1.5, 0); g.add(rim, rim.target);
  const inner = new THREE.PointLight('#ffd9a0', 0.6, 0.6, 2); inner.position.set(0, 0.11, 0.05); m.head.add(inner);
  const keys = (o.keys ?? [[o.t0, 1.05, 1.82, 1.15, 0.0, 1.62, 0.0, 32], [o.drift, 0.68, 1.74, 0.72, 0.0, 1.67, 0.0, 30], [o.t1, 0.6, 1.72, 0.64, 0.0, 1.68, 0.0, 28]]).map(([t, a, b, c, d, e, f, fov]) => [t, a + GX, b, c, d + GX, e, f, fov]);
  const w = new THREE.Vector3();
  const update = (t: number) => {
    /* in step: all at one speed, neighbours turning opposite ways; after the drift, they slip apart and each keeps its own time */
    const d = Math.max(0, t - o.drift); const sep = o.merge !== undefined ? 1 - eio(ramp(t, o.merge, 1.8)) : eio(ramp(t, o.drift, 1.6));
    const speeds = [2.2, 3.4, 0.2, -2.4];
    gears.forEach((gg, i) => { const dir = i % 2 ? -1 : 1; const base = t * 1.6 * dir; const own = d * speeds[i] * 2.2 + (i === 2 ? Math.sin(d * 7) * 0.4 * sep : 0);
      turns[i].rotation.z = base + own * sep; gg.position.set(pos[i][0] * (1 + 0.6 * sep), pos[i][1] * (1 + 0.6 * sep), 0.004 * Math.sin(d * 3 + i) * sep); });
    (sparks.material as THREE.SpriteMaterial).opacity = sep * (0.3 + 0.3 * Math.abs(Math.sin(t * 17)));
    m.head.updateMatrixWorld(true);
    const side = [new THREE.Vector3(-0.17, 0.08, 0), new THREE.Vector3(0.17, 0.08, 0), new THREE.Vector3(0.17, -0.06, 0), new THREE.Vector3(-0.17, -0.06, 0)];
    const show = ramp(t, o.t0 + 0.4, 0.6);
    callouts.forEach((pl, i) => { gears[i].getWorldPosition(w); w.sub(g.position); const p = w.clone().add(side[i]); pl.position.copy(p); pl.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.38, 0)));
      (pl.material as THREE.MeshBasicMaterial).opacity = show; const pos2 = (lines[i].geometry.attributes.position as THREE.BufferAttribute); pos2.setXYZ(0, w.x, w.y, w.z); pos2.setXYZ(1, p.x + (i % 3 === 0 ? 0.08 : -0.08), p.y, p.z); pos2.needsUpdate = true; (lines[i].material as THREE.LineBasicMaterial).opacity = 0.8 * show; });
    m.torso.position.y = 1.0 + 0.002 * Math.sin(t * 1.5);
    return herm(keys, t);
  };
  return { g, update };
};

/* ================================================================== CROWD: 300 people, one of them lit; then the life ruler */
export const CROWD_X = 460;
export const buildCrowd = (o: { t0: number; age: number; t1: number; keys?: Key[]; lit?: number[]; signText?: string; band?: [number, number, string] }) => {
  const BAND = o.band ?? [15, 25, '最常发病'];
  const g = new THREE.Group(); g.position.x = CROWD_X;
  add(g, new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), M({ color: '#1d1a17', roughness: 0.7 }), 0, 0, 0, false);
  /* one instanced, simplified mannequin per person: body capsule + head egg */
  const COLS = 20, ROWS = 15, DX = 0.62, DZ = 0.62; const N = COLS * ROWS; const LITS = o.lit ?? [7 * COLS + 13]; const LIT = LITS[0];
  const body = new THREE.CapsuleGeometry(0.15, 1.05, 6, 14); body.translate(0, 0.68, 0); body.scale(1, 1, 0.65);
  const headG = new THREE.SphereGeometry(0.1, 20, 14); headG.scale(0.76, 1.14, 0.88); headG.translate(0, 1.52, 0);
  const shell = new THREE.MeshPhysicalMaterial({ color: '#e2dccf', roughness: 0.35, clearcoat: 0.6 });
  const bodies = new THREE.InstancedMesh(body, shell, N), heads = new THREE.InstancedMesh(headG, shell, N); bodies.castShadow = heads.castShadow = true; bodies.receiveShadow = true; g.add(bodies, heads);
  const r = rng(12); const P = new THREE.Object3D(); const posL: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) { const cx = i % COLS, rz = Math.floor(i / COLS); P.position.set((cx - (COLS - 1) / 2) * DX + (r() - 0.5) * 0.12, 0, (rz - (ROWS - 1) / 2) * DZ + (r() - 0.5) * 0.12); P.rotation.set(0, (r() - 0.5) * 0.5, 0); P.scale.setScalar(0.92 + r() * 0.14); P.updateMatrix();
    bodies.setMatrixAt(i, P.matrix); heads.setMatrixAt(i, P.matrix); bodies.setColorAt(i, new THREE.Color(1, 1, 1)); heads.setColorAt(i, new THREE.Color(1, 1, 1)); posL.push(P.position.clone()); }
  const lit = posL[LIT];
  const sign = canvasTex(1024, 400); { const c = sign.g; c.font = `700 300px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; const gr = c.createLinearGradient(0, 60, 0, 340); gr.addColorStop(0, '#fff3cc'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c08a34'); c.shadowColor = 'rgba(255,190,90,.9)'; c.shadowBlur = 30; c.fillStyle = gr; c.font = `700 ${(o.signText ?? '1 / 300').length > 8 ? 150 : 300}px ${SERIF}`; c.fillText(o.signText ?? '1 / 300', 512, 210); }
  const signM = new THREE.MeshBasicMaterial({ map: sign.tex, transparent: true, toneMapped: false, depthWrite: false, opacity: 0 }); const signP = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.64), signM); signP.position.set(0, 3.0, -2.9); g.add(signP);
  /* the life ruler on the floor in front of the crowd: 0 … 80, with 15–25 lighting up */
  const ruler = canvasTex(2048, 300); const RW = 9.0, RH = 1.32; const rulerM = new THREE.MeshBasicMaterial({ map: ruler.tex, transparent: true, toneMapped: false, opacity: 0 });
  const rp = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), rulerM); rp.rotation.x = -Math.PI / 2 + 0.0; rp.position.set(0, 0.01, 5.6); g.add(rp);
  const drawRuler = (band: number) => { const c = ruler.g, W2 = 2048, H2 = 300; c.clearRect(0, 0, W2, H2); const x = (a: number) => 80 + (a / 80) * (W2 - 160);
    c.fillStyle = 'rgba(20,18,16,.75)'; c.fillRect(0, 0, W2, H2);
    if (band > 0) { c.fillStyle = `rgba(241,197,109,${0.75 * band})`; c.fillRect(x(BAND[0]), 40, (x(BAND[1]) - x(BAND[0])) * band, 120); }
    c.strokeStyle = '#e9e1d2'; c.lineWidth = 6; c.beginPath(); c.moveTo(x(0), 160); c.lineTo(x(80), 160); c.stroke();
    c.font = `700 64px ${SANS}`; c.textAlign = 'center'; c.fillStyle = '#e9e1d2'; for (let a = 0; a <= 80; a += 10) { c.fillRect(x(a) - 3, 120, 6, 40); c.fillText(String(a), x(a), 240); }
    for (let a = 0; a <= 80; a += 5) c.fillRect(x(a) - 2, 140, 4, 20);
    if (band > 0) { c.globalAlpha = band; c.font = `900 70px ${SANS}`; if (BAND[1] - BAND[0] < 8) { c.textAlign = 'left'; c.fillStyle = '#f1c56d'; c.fillText(BAND[2] + '（' + BAND[0] + '–' + BAND[1] + ' 岁）', x(BAND[1]) + 24, 110); c.textAlign = 'center'; } else { c.fillStyle = '#1b1208'; c.fillText(BAND[2], (x(BAND[0]) + x(BAND[1])) / 2, 125); } c.globalAlpha = 1; }
    c.font = `700 52px ${SANS}`; c.textAlign = 'left'; c.fillStyle = '#bfb6a6'; c.fillText('岁', x(80) + 20, 240); ruler.tex.needsUpdate = true; };
  g.add(new THREE.HemisphereLight('#a0b0c4', '#141110', 0.8));
  const wash = new THREE.DirectionalLight('#c9d4e2', 1.3); wash.position.set(-6, 10, 6); wash.target.position.set(0, 0, 0); wash.castShadow = true; wash.shadow.mapSize.set(2048, 2048); Object.assign(wash.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 }); g.add(wash, wash.target);
  const spot = new THREE.SpotLight('#ffd7a0', 0, 0, 0.09, 0.3, 2); spot.position.copy(lit).add(new THREE.Vector3(0, 9, 0)); spot.target.position.copy(lit); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); g.add(spot, spot.target);
  const bm = beam('#ffd9a6', 8, 0.09, 0.05); bm.mesh.position.copy(lit).add(new THREE.Vector3(0, 4.6, 0)); g.add(bm.mesh);
  const extra = LITS.slice(1).map((li) => { const p = posL[li]; const sp = new THREE.SpotLight('#ffd7a0', 0, 0, 0.09, 0.3, 2); sp.position.copy(p).add(new THREE.Vector3(0, 9, 0)); sp.target.position.copy(p); g.add(sp, sp.target); const b = beam('#ffd9a6', 8, 0.09, 0.05); b.mesh.position.copy(p).add(new THREE.Vector3(0, 4.6, 0)); g.add(b.mesh); return { sp, b }; });
  const keys = (o.keys ?? [[o.t0, 0.0, 9.0, 11.0, 0, 0.9, -0.6, 40], [o.age - 0.1, 0.4, 7.8, 9.4, 0.2, 1.0, -0.8, 38], [o.age + 0.6, 0.0, 6.6, 12.0, 0, 0.0, 4.3, 40], [o.t1, 0.0, 6.2, 11.4, 0, 0.0, 4.5, 38]]).map(([t, a, b, c, d, e, f, fov]) => [t, a + CROWD_X, b, c, d + CROWD_X, e, f, fov]);
  const update = (t: number) => {
    const k = ramp(t, o.t0 + 0.8, 0.1); spot.intensity = 600 * k; bm.mat.uniforms.uI.value = k; extra.forEach((e, i) => { const kk = ramp(t, o.t0 + 1.0 + i * 0.25, 0.1); e.sp.intensity = 600 * kk; e.b.mat.uniforms.uI.value = kk; }); wash.intensity = 1.6 * (1 - 0.45 * k);
    const gold = new THREE.Color('#ffd27a').multiplyScalar(1.4); const dim = new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.2 * k);
    for (let i = 0; i < N; i++) { const c = LITS.includes(i) ? new THREE.Color(1, 1, 1).lerp(gold, k) : dim; bodies.setColorAt(i, c); heads.setColorAt(i, c); }
    bodies.instanceColor!.needsUpdate = true; heads.instanceColor!.needsUpdate = true;
    signM.opacity = ramp(t, o.t0 + 1.0, 0.5) * (1 - ramp(t, o.age - 0.3, 0.3));
    const rv = ramp(t, o.age - 0.2, 0.5); rulerM.opacity = rv; drawRuler(eio(ramp(t, o.age + 0.8, 1.0)));
    return herm(keys, t);
  };
  return { g, update };
};

/* ================================================================== GLOBE: three cities, twenty people each */
export const GLOBE_X = 520;
const CITIES = [
  { name: '加州 · 美国', lat: 37.56, lon: -122.32, col: '#ff5a3c', line1: '声音大多刺耳、带着威胁', line2: '以正面为主：0 / 20', n: 0 },
  { name: '金奈 · 印度', lat: 13.08, lon: 80.27, col: '#ffbf69', line1: '像家里长辈在叮嘱', line2: '听到家人：11 / 20', n: 11 },
  { name: '阿克拉 · 加纳', lat: 5.6, lon: -0.19, col: '#8fdcb0', line1: '大多是好的声音', line2: '以正面为主：10 / 20', n: 10 },
];
const ll = (lat: number, lon: number, r: number) => { const phi = (90 - lat) * (Math.PI / 180), th = (lon + 180) * (Math.PI / 180); return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); };
export const buildGlobe = (o: { t0: number; at: number[]; why: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = GLOBE_X;
  /* the map, drawn from Natural Earth land polygons (world-atlas) into an equirectangular canvas */
  const map = canvasTex(4096, 2048); { const c = map.g, W2 = 4096, H2 = 2048; const oc = c.createLinearGradient(0, 0, 0, H2); oc.addColorStop(0, '#0d1a26'); oc.addColorStop(0.5, '#132636'); oc.addColorStop(1, '#0d1a26'); c.fillStyle = oc; c.fillRect(0, 0, W2, H2);
    c.strokeStyle = 'rgba(140,180,210,.12)'; c.lineWidth = 2; for (let lon = -180; lon <= 180; lon += 15) { const x = ((lon + 180) / 360) * W2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H2); c.stroke(); } for (let lat = -75; lat <= 75; lat += 15) { const y = ((90 - lat) / 180) * H2; c.beginPath(); c.moveTo(0, y); c.lineTo(W2, y); c.stroke(); }
    const P = (lon: number, lat: number) => [((lon + 180) / 360) * W2, ((90 - lat) / 180) * H2];
    const drawGeo = (geo: any, fill: string, stroke: string, lw: number) => { const polys = geo.type === 'Polygon' ? [geo.coordinates] : geo.type === 'MultiPolygon' ? geo.coordinates : []; c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = lw;
      for (const shift of [-W2, 0, W2]) for (const poly of polys) { c.beginPath(); for (const ring of poly) { let pl = 0; ring.forEach(([lon, lat]: number[], i: number) => { let L = lon; if (i) { while (L - pl > 180) L -= 360; while (L - pl < -180) L += 360; } pl = L; const [x, y] = P(L, lat); i ? c.lineTo(x + shift, y) : c.moveTo(x + shift, y); }); c.closePath(); } c.fill('evenodd'); c.stroke(); } };
    const L = feature(land as any, (land as any).objects.land) as any; for (const f of L.features ?? [L]) drawGeo(f.geometry, '#5f5648', 'rgba(230,210,170,.5)', 2);
    const C = feature(countries as any, (countries as any).objects.countries) as any; for (const f of C.features) drawGeo(f.geometry, 'rgba(0,0,0,0)', 'rgba(230,210,170,.18)', 1.5); }
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), M({ map: map.tex, roughness: 0.7, metalness: 0.0 })); g.add(globe);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.025, 96, 64), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(0.45,0.7,1.0, f*0.9); }' })); g.add(atm);
  /* pins, beams and a data board at each city */
  const boards = CITIES.map((cty, i) => {
    const p = ll(cty.lat, cty.lon, 1.0); const n = p.clone().normalize();
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), new THREE.MeshBasicMaterial({ color: cty.col, toneMapped: false })); pin.position.copy(p); g.add(pin);
    const bm = beam(cty.col, 0.35, 0.02, 0.004); bm.mesh.position.copy(p.clone().addScaledVector(n, 0.175)); bm.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), n.clone().negate()); g.add(bm.mesh);
    const halo = glowSprite(cty.col, 0.12, 0); halo.position.copy(p.clone().addScaledVector(n, 0.01)); g.add(halo);
    const cv = canvasTex(1024, 640); const c = cv.g;
    c.fillStyle = 'rgba(10,12,16,.86)'; c.beginPath(); c.roundRect(8, 8, 1008, 624, 36); c.fill(); c.strokeStyle = cty.col; c.lineWidth = 6; c.beginPath(); c.roundRect(8, 8, 1008, 624, 36); c.stroke();
    c.textAlign = 'left'; c.font = `900 96px ${SANS}`; c.fillStyle = '#f3ede2'; c.fillText(cty.name, 60, 130);
    c.font = `700 62px ${SANS}`; c.fillStyle = cty.col; c.fillText(cty.line1, 60, 230);
    /* twenty little people, the counted ones in colour */
    for (let k = 0; k < 20; k++) { const x = 92 + (k % 10) * 88, y = 330 + Math.floor(k / 10) * 120; const on = k < cty.n; c.fillStyle = on ? cty.col : 'rgba(243,237,226,.28)';
      c.beginPath(); c.arc(x, y, 18, 0, 7); c.fill(); c.beginPath(); c.roundRect(x - 26, y + 24, 52, 64, 20); c.fill(); }
    c.font = `900 66px ${SANS}`; c.fillStyle = '#f3ede2'; c.fillText(cty.line2, 60, 600);
    const bmat = new THREE.MeshBasicMaterial({ map: cv.tex, transparent: true, toneMapped: false, opacity: 0, depthWrite: false });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), bmat); g.add(board);
    return { p, n, bm, halo, board, bmat, i };
  });
  const cul = canvasTex(1200, 300); { const c = cul.g; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 150px ${SANS}`; const gr = c.createLinearGradient(0, 60, 0, 240); gr.addColorStop(0, '#fff3cc'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c08a34'); c.shadowColor = 'rgba(255,190,90,.9)'; c.shadowBlur = 30; c.fillStyle = gr; c.fillText('文化的“口音”', 600, 150); }
  const culM = new THREE.MeshBasicMaterial({ map: cul.tex, transparent: true, toneMapped: false, opacity: 0, depthWrite: false }); const culP = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.275), culM); culP.position.set(0, -0.2, 2.55); g.add(culP);
  const title = canvasTex(1600, 220); { const c = title.g; c.textAlign = 'center'; c.font = `700 96px ${SANS}`; c.fillStyle = '#f3ede2'; c.fillText('斯坦福 · 3 座城市 · 60 位患者', 800, 140); }
  const titleM = new THREE.MeshBasicMaterial({ map: title.tex, transparent: true, toneMapped: false, opacity: 0, depthWrite: false }); const titleP = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.22), titleM); titleP.position.set(0, 1.28, 0); g.add(titleP);
  g.add(new THREE.HemisphereLight('#c4d4e6', '#0a0c10', 0.9));
  const sun = new THREE.DirectionalLight('#fff1dc', 2.2); sun.position.set(3, 2, 4); g.add(sun, sun.target);
  const stars = (() => { const N = 900, a = new Float32Array(N * 3); const r = rng(5); for (let i = 0; i < N; i++) { const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(18 + r() * 6); a.set([v.x, v.y, v.z], i * 3); } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(a, 3)); return new THREE.Points(gg, new THREE.PointsMaterial({ color: '#ffffff', size: 0.03, transparent: true, opacity: 0.7, fog: false })); })(); g.add(stars);
  /* camera: start wide on the whole globe, then fly to each city in turn and hover over its board */
  const sideOf = (n: THREE.Vector3) => new THREE.Vector3(0, 1, 0).cross(n).normalize();
  const camFor = (i: number) => { const b = boards[i]; return b.n.clone().multiplyScalar(2.7).addScaledVector(sideOf(b.n), 0.2).add(new THREE.Vector3(0, 0.1, 0)); };
  const update = (t: number, cam: THREE.PerspectiveCamera) => {
    const wide = new THREE.Vector3(0.6, 0.8, 3.6); let pos = wide.clone(); let look = new THREE.Vector3(0, 0, 0); let fov = 34;
    const seg = o.at.findIndex((a, i) => t >= a && t < (o.at[i + 1] ?? o.why));
    const fly = (from: THREE.Vector3, to: THREE.Vector3, k: number) => { const kk = eio(k); const p = from.clone().lerp(to, kk); const len = from.length() * (1 - kk) + to.length() * kk; return p.normalize().multiplyScalar(len + Math.sin(kk * Math.PI) * 0.9); };
    if (t < o.at[0]) { const k = ramp(t, o.t0, o.at[0] - o.t0); pos = wide.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.4 * k); }
    else if (seg >= 0) { const prev = seg === 0 ? wide.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.4) : camFor(seg - 1); pos = fly(prev, camFor(seg), ramp(t, o.at[seg], 1.1)); look = boards[seg].p.clone().addScaledVector(sideOf(boards[seg].n), 0.22).addScaledVector(boards[seg].n, 0.15).lerp(new THREE.Vector3(), 1 - eio(ramp(t, o.at[seg], 1.1))); fov = 34 - 4 * eio(ramp(t, o.at[seg], 1.1)); }
    else { const k = eio(ramp(t, o.why, 1.4)); pos = fly(camFor(2), new THREE.Vector3(0.0, 0.45, 4.9), k); look = boards[2].p.clone().addScaledVector(sideOf(boards[2].n), 0.22).multiplyScalar(1 - k); fov = 30 + 6 * k; }
    boards.forEach((b) => { const act = t >= o.at[b.i] + 0.6 && (t < (o.at[b.i + 1] ?? o.why) + 0.2 || t >= o.why); const a = act ? (t >= o.why ? 0.9 : ramp(t, o.at[b.i] + 0.6, 0.5)) : 0;
      b.bmat.opacity = clamp(a); b.bm.mat.uniforms.uI.value = 0.4 + 1.2 * (t >= o.at[b.i] ? 1 : 0); (b.halo.material as THREE.SpriteMaterial).opacity = (t >= o.at[b.i] ? 0.8 : 0.3) * (0.7 + 0.3 * Math.sin(t * 4 + b.i));
      const bp = b.p.clone().addScaledVector(b.n, 0.2).addScaledVector(sideOf(b.n), 0.42).add(new THREE.Vector3(0, 0.08, 0)); if (t >= o.why) bp.lerp(new THREE.Vector3((b.i - 1) * 0.72, 0.28, 2.55), eio(ramp(t, o.why, 1.3))); b.board.position.copy(bp); b.board.lookAt(g.position.clone().add(pos)); b.board.position.add(new THREE.Vector3(0, 0.0, 0)); });
    titleM.opacity = ramp(t, o.t0 + 0.4, 0.5) * (1 - ramp(t, o.at[0] + 0.4, 0.4)) + ramp(t, o.why + 0.8, 0.5) * 0;
    titleP.lookAt(g.position.clone().add(pos)); culP.lookAt(g.position.clone().add(pos)); culM.opacity = ramp(t, o.why + 3.9, 0.3); culP.scale.setScalar(1 + 0.3 * (1 - eo(ramp(t, o.why + 3.9, 0.35)))); globe.rotation.y = 0; void cam;
    sun.position.copy(pos.clone().normalize().multiplyScalar(5).add(new THREE.Vector3(1.5, 2.0, 0)));
    return [pos.x + GLOBE_X, pos.y, pos.z, look.x + GLOBE_X, look.y, look.z, fov];
  };
  return { g, update };
};
