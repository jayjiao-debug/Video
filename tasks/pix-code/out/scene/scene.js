// 「假如你7天不喝水」 day 3 — code-built 3D test clip (three.js r160).
// Deterministic: window.renderFrame(i) draws frame i (t = i/30). No rAF, seeded randomness only.
// Shots: 0-3 face close-up | 3-6 wide desert walk | 6-9 hand + empty bottle | 9-12 eye ECU
import * as THREE from './node_modules/three/build/three.module.js';

const W = 360, H = 640, FPS = 30;

// ------------------------------------------------------------------ KNOBS
const K = {
  skin: 0xe6a47a, shirt: 0xd2b080, shirtTrim: 0x8a5a34, trousers: 0x3a2f2c, shoe: 0x4a2a1c,
  hair: 0x1c1411, pack: 0x9a4a2a,
  water: 0x5fdcff,                       // the ONLY cool colour in the film
  sunDir: new THREE.Vector3(0.38, 0.12, -1).normalize(),
  exposure: 1.05,
};

// ------------------------------------------------------------------ helpers
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(20240607);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u));
const hex = h => '#' + h.toString(16).padStart(6, '0');

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = K.exposure;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 900);

const SPH = new THREE.SphereGeometry(1, 48, 32);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });
function sph(parent, r, material, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(SPH, material); m.scale.set(r * sx, r * sy, r * sz); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function cylM(parent, rt, rb, h, material, x = 0, y = 0, z = 0, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function capsule(parent, r, len, material, x = 0, y = 0, z = 0) {            // vertical, centred
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 24), material); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
// a patch of a sphere with front-projected (planar) UVs: ideal for painted faces / irises
function patchGeo(R, a, n) {
  const pos = [], uv = [], nor = [], idx = [];
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const x = -a + 2 * a * i / n, y = -a + 2 * a * j / n;
    const z = Math.sqrt(Math.max(R * R - x * x - y * y, R * R * 0.02));
    const l = Math.hypot(x, y, z);
    pos.push(x, y, z); nor.push(x / l, y / l, z / l); uv.push(i / n, j / n);
  }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a0 = j * (n + 1) + i, b0 = a0 + 1, c0 = a0 + n + 1, d0 = c0 + 1;
    idx.push(a0, b0, c0, b0, d0, c0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); return g;
}
function canvasTex(size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { c, ctx: c.getContext('2d'), tex };
}
function coneAlong(parent, mat, base, len, pos, axis) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(base, len, 20, 1), mat);
  m.position.copy(pos).addScaledVector(axis, len * 0.45);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
  m.castShadow = true; parent.add(m); return m;
}

// ------------------------------------------------------------------ painted face
const FACE_PX = 512, FACE_A = 0.95;                // patch half-size in head radii
const FS = FACE_PX / (2 * FACE_A);                 // canvas px per head radius
function drawFace(ctx, e) {
  const S = FS, cx0 = FACE_PX / 2, cy0 = FACE_PX / 2;
  const X = x => cx0 + x * S, Y = y => cy0 - y * S;            // head-radius units, y up
  ctx.clearRect(0, 0, FACE_PX, FACE_PX);
  // opaque skin that fades out at the edge, so lids can be skin-coloured
  let g = ctx.createRadialGradient(X(0), Y(0), S * 0.62, X(0), Y(0), S * 0.94);
  g.addColorStop(0, hex(K.skin)); g.addColorStop(1, hex(K.skin) + '00');
  ctx.fillStyle = g; ctx.fillRect(0, 0, FACE_PX, FACE_PX);
  // blush
  for (const s of [-1, 1]) {
    g = ctx.createRadialGradient(X(s * 0.56), Y(-0.34), 0, X(s * 0.56), Y(-0.34), S * 0.24);
    g.addColorStop(0, 'rgba(232,96,84,' + (0.62 * e.blush) + ')'); g.addColorStop(1, 'rgba(232,96,84,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, FACE_PX, FACE_PX);
  }
  // nose: soft underside shade + highlight
  ctx.fillStyle = 'rgba(150,70,40,0.35)'; ctx.beginPath(); ctx.ellipse(X(0), Y(-0.40), S * 0.075, S * 0.032, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(255,225,190,0.35)'; ctx.beginPath(); ctx.ellipse(X(0.0), Y(-0.27), S * 0.04, S * 0.05, 0, 0, 6.283); ctx.fill();
  // eyes
  const eyeY = -0.10, rx = 0.20, ry = 0.255, ex = 0.43;
  for (const s of [-1, 1]) {
    const cx = X(s * ex + e.look * 0.01), cy = Y(eyeY), RX = S * rx, RY = S * ry;
    const o = e.open, sq = e.squint;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, RX, RY, 0, 0, 6.283); ctx.clip();
    g = ctx.createLinearGradient(0, cy - RY, 0, cy + RY);
    g.addColorStop(0, '#120a08'); g.addColorStop(0.6, '#241410'); g.addColorStop(1, '#5a3220');
    ctx.fillStyle = g; ctx.fillRect(cx - RX, cy - RY, RX * 2, RY * 2);
    // big highlight + small one
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.beginPath(); ctx.ellipse(cx - RX * 0.32 + e.look, cy - RY * 0.33, RX * 0.32, RX * 0.32, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + RX * 0.38 + e.look, cy + RY * 0.40, RX * 0.13, 0, 6.283); ctx.fill();
    // lids (skin coloured)
    const yc = cy + RY * (0.18 - 1.18 * o), yk = cy + RY * (0.42 - 0.75 * o);
    ctx.fillStyle = hex(K.skin);
    ctx.beginPath(); ctx.moveTo(cx - RX * 1.3, cy - RY * 1.5);
    for (let d = -1.3; d <= 1.3; d += 0.1) ctx.lineTo(cx + d * RX, yk + (yc - yk) * (1 - d * d * 0.59));
    ctx.lineTo(cx + RX * 1.3, cy - RY * 1.5); ctx.fill();
    const lowC = cy + RY * (1.0 - 1.15 * sq), lowK = cy + RY * (0.5 - 0.4 * sq);
    ctx.beginPath(); ctx.moveTo(cx - RX * 1.3, cy + RY * 1.5);
    for (let d = -1.3; d <= 1.3; d += 0.1) ctx.lineTo(cx + d * RX, lowK + (lowC - lowK) * (1 - d * d * 0.59));
    ctx.lineTo(cx + RX * 1.3, cy + RY * 1.5); ctx.fill();
    ctx.restore();
    // upper lash line (thick, flicks past the corner)
    ctx.strokeStyle = '#150c09'; ctx.lineWidth = S * 0.05; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let d = -1.12; d <= 1.12; d += 0.07) {
      const yy = yk + (yc - yk) * (1 - d * d * 0.59) - Math.max(0, Math.abs(d) - 1) * 0 ;
      if (d <= -1.12) ctx.moveTo(cx + d * RX, yy); else ctx.lineTo(cx + d * RX, yy);
    }
    ctx.stroke();
    // lower lid hint when squinting
    if (sq > 0.15) {
      ctx.strokeStyle = 'rgba(120,56,36,' + (0.55 * sq) + ')'; ctx.lineWidth = S * 0.025;
      ctx.beginPath();
      for (let d = -0.95; d <= 0.95; d += 0.07) { const yy = lowK + (lowC - lowK) * (1 - d * d * 0.59); if (d <= -0.95) ctx.moveTo(cx + d * RX, yy); else ctx.lineTo(cx + d * RX, yy); }
      ctx.stroke();
    }
  }
  // brows: thick, dark, furrowing
  const f = e.furrow;
  ctx.strokeStyle = '#1a0f0b'; ctx.lineWidth = S * 0.115; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const bx = ex, by = 0.40 + e.browLift;
    const inX = s * (bx - 0.21 + 0.07 * f), inY = by - 0.15 * f;
    const outX = s * (bx + 0.21), outY = by + 0.04 + 0.03 * f - 0.02 * f;
    const midX = s * bx, midY = by + 0.05 - 0.05 * f;
    ctx.beginPath(); ctx.moveTo(X(inX), Y(inY)); ctx.quadraticCurveTo(X(midX), Y(midY + 0.04), X(outX), Y(outY)); ctx.stroke();
  }
  // furrow lines between brows
  if (f > 0.3) { ctx.strokeStyle = 'rgba(130,60,40,' + (0.5 * f) + ')'; ctx.lineWidth = S * 0.02; ctx.lineCap = 'round';
    for (const s of [-0.03, 0.03]) { ctx.beginPath(); ctx.moveTo(X(s), Y(0.30)); ctx.lineTo(X(s * 1.2), Y(0.19)); ctx.stroke(); } }
  // mouth
  const my = -0.63, mw = 0.21 + 0.03 * e.mouthOpen;
  if (e.mouthOpen > 0.05) {
    ctx.fillStyle = '#3a1410'; ctx.beginPath(); ctx.ellipse(X(0), Y(my - 0.02), S * mw * 0.8, S * (0.035 + 0.06 * e.mouthOpen), 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#c85a50'; ctx.beginPath(); ctx.ellipse(X(0), Y(my - 0.045 - 0.03 * e.mouthOpen), S * mw * 0.5, S * 0.03 * e.mouthOpen, 0, 0, 6.283); ctx.fill();
  }
  ctx.strokeStyle = '#3a130d'; ctx.lineWidth = S * 0.06; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(X(-mw), Y(my + e.mouthCurve * 0.0 - 0.0 + (e.mouthCurve < 0 ? -0.02 * -e.mouthCurve : 0)));
  ctx.quadraticCurveTo(X(0), Y(my + e.mouthCurve * 0.10), X(mw), Y(my - 0.0 + (e.mouthCurve < 0 ? 0.0 : 0)));
  ctx.stroke();
}

// ------------------------------------------------------------------ the boy
function makeBoy() {
  const B = {};
  const skin = std(K.skin, { roughness: 0.6 }), shirt = std(K.shirt, { roughness: 0.85 }), trim = std(K.shirtTrim, { roughness: 0.8 });
  const pants = std(K.trousers, { roughness: 0.85 }), shoe = std(K.shoe, { roughness: 0.6 }), hairM = std(K.hair, { roughness: 0.62 });
  const root = new THREE.Group(); B.root = root;
  const hips = new THREE.Group(); hips.position.y = 0.66; root.add(hips); B.hips = hips;

  // pelvis + belt
  sph(hips, 0.19, pants, 1.0, 0.75, 0.8, 0, 0.0, 0);
  cylM(hips, 0.178, 0.178, 0.05, std(0x4a2c1a), 0, 0.075, 0).scale.z = 0.82;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.02), std(0xe0b040, { metalness: 0.6, roughness: 0.35 })); buckle.position.set(0, 0.075, 0.15); hips.add(buckle);

  // torso (tapered cylinder, sand shirt) with trims
  const torso = new THREE.Group(); torso.position.y = 0.08; hips.add(torso); B.torso = torso;
  const body = cylM(torso, 0.2, 0.17, 0.52, shirt, 0, 0.28, 0); body.scale.z = 0.8;
  sph(torso, 0.2, shirt, 1, 0.45, 0.8, 0, 0.54, 0);                      // rounded shoulders
  cylM(torso, 0.171, 0.171, 0.04, trim, 0, 0.04, 0).scale.z = 0.8;       // hem band
  // V collar (dark-gold) : two angled bars + neck ring
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.03, 12, 40), std(0xc89a3c, { roughness: 0.6 }));
  collar.rotation.x = Math.PI / 2; collar.position.y = 0.6; torso.add(collar);
  for (const s of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.15, 6, 12), std(0xc89a3c, { roughness: 0.6 }));
    bar.position.set(s * 0.045, 0.52, 0.155); bar.rotation.z = s * 0.45; torso.add(bar);
  }
  // backpack (reads when he walks away)
  const pack = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.18, 8, 16), std(K.pack, { roughness: 0.8 }));
  pack.scale.set(1.05, 1, 0.75); pack.position.set(0, 0.34, -0.2); pack.castShadow = true; torso.add(pack);
  sph(torso, 0.07, std(0x7a3a20), 1.2, 0.8, 0.6, 0, 0.14, -0.2);
  for (const s of [-1, 1]) { const strap = cylM(torso, 0.022, 0.022, 0.42, std(0x5a3220), s * 0.1, 0.36, -0.1); strap.rotation.x = 0.15; strap.scale.z = 1.0; }

  // neck + head
  cylM(torso, 0.07, 0.08, 0.1, skin, 0, 0.64, 0);
  const neck = new THREE.Group(); neck.position.y = 0.66; torso.add(neck); B.neck = neck;
  const head = new THREE.Group(); head.position.y = 0.2; neck.add(head); B.head = head;
  const HR = 0.225;
  const shape = new THREE.Group(); shape.scale.set(1.08, 1.0, 1.0); head.add(shape);
  const skull = new THREE.Mesh(SPH, skin); skull.scale.setScalar(HR); skull.castShadow = true; skull.receiveShadow = true; shape.add(skull);
  // cheeks / jaw fullness (chibi)
  sph(shape, HR, skin, 0.86, 0.6, 0.86, 0, -0.34 * HR, 0.08 * HR);
  // face overlay
  B.face = canvasTex(FACE_PX);
  const faceMat = new THREE.MeshStandardMaterial({ map: B.face.tex, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false });
  const face = new THREE.Mesh(patchGeo(HR * 1.004, HR * FACE_A, 40), faceMat); face.receiveShadow = true; shape.add(face);
  // nose bump + ears
  sph(shape, HR * 0.075, skin, 1, 0.9, 1, 0, -0.30 * HR, HR * 0.99);
  for (const s of [-1, 1]) { sph(head, HR * 0.2, skin, 0.55, 1, 0.9, s * HR * 1.07, -0.05 * HR, -0.02 * HR); sph(head, HR * 0.1, std(0xb8704a), 0.4, 0.8, 0.5, s * HR * 1.12, -0.05 * HR, 0.0); }
  // hair: tilted cap + spikes + fringe + sideburns
  const hair = new THREE.Group(); head.add(hair); B.hair = hair;
  const capG = new THREE.Group(); capG.rotation.x = -0.50; hair.add(capG);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(HR * 1.09, 48, 32, 0, Math.PI * 2, 0, 1.62), hairM);
  cap.scale.set(1.08, 1.0, 1.0); cap.castShadow = true; cap.receiveShadow = true; capG.add(cap);
  const dirs = [[0, 0, 0.9], [0.55, 0.1, 0.8], [-0.55, 0.1, 0.8], [0.25, -0.5, 0.8], [-0.3, -0.45, 0.8], [0.85, -0.2, 0.5], [-0.85, -0.25, 0.5], [0.0, -1.0, 0.1], [0.6, -0.8, 0.0], [-0.6, -0.8, 0.0]];
  for (const [dx, dz, up] of dirs) {   // spikes: dir in the head frame, base on the cap
    const d = new THREE.Vector3(dx, up, dz).normalize();
    const p = d.clone().multiplyScalar(HR * 1.02); p.x *= 1.08;
    const ax = d.clone().add(new THREE.Vector3(dx * 0.5, 0.15, dz * 0.4 - 0.15)).normalize();
    coneAlong(hair, hairM, HR * 0.2, HR * 0.5, p, ax);
  }
  // fringe: pointed locks across the forehead, brow line sits below them
  const fr = [[-0.80, 0.52, 0.0], [-0.52, 0.56, 0.05], [-0.22, 0.58, 0.0], [0.08, 0.58, 0.08], [0.38, 0.57, 0.0], [0.66, 0.54, 0.05], [0.88, 0.45, 0.0]];
  for (const [x, y, l] of fr) {
    const d = new THREE.Vector3(x, y, 0).normalize(); d.z = Math.sqrt(Math.max(0, 1 - d.x * d.x - d.y * d.y));
    const p = d.clone().multiplyScalar(HR * 1.05); p.x *= 1.08;
    coneAlong(hair, hairM, HR * 0.17, HR * (0.34 + l * 1.0), p, new THREE.Vector3(x * 0.15, -1, 0.5));
  }
  for (const s of [-1, 1]) sph(hair, HR * 0.22, hairM, 0.55, 1.0, 0.8, s * HR * 1.03, 0.12 * HR, HR * 0.15);   // sideburns

  // arms
  B.arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.245, 0.5, 0); torso.add(sh);
    sph(sh, 0.085, shirt, 1, 1.05, 1, 0, 0, 0);
    cylM(sh, 0.082, 0.088, 0.13, shirt, 0, -0.07, 0);
    cylM(sh, 0.089, 0.089, 0.025, trim, 0, -0.13, 0);
    cylM(sh, 0.052, 0.045, 0.24, skin, 0, -0.26, 0);
    const hand = new THREE.Group(); hand.position.set(0, -0.40, 0); sh.add(hand);
    sph(hand, 0.07, skin, 1, 1.05, 0.95);                              // mitten
    sph(hand, 0.034, skin, 1, 1.3, 1, s * -0.05, 0.02, 0.04);          // thumb
    B.arms.push({ s, g: sh, hand });
  }
  // legs
  B.legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.095, -0.03, 0); hips.add(hip);
    capsule(hip, 0.082, 0.17, pants, 0, -0.16, 0);
    const knee = new THREE.Group(); knee.position.set(0, -0.32, 0); hip.add(knee);
    capsule(knee, 0.072, 0.16, pants, 0, -0.14, 0);
    cylM(knee, 0.074, 0.074, 0.03, std(0x2a201e), 0, -0.26, 0);
    const foot = new THREE.Group(); foot.position.set(0, -0.28, 0); knee.add(foot);
    sph(foot, 0.085, shoe, 0.95, 0.6, 1.55, 0, -0.01, 0.05);
    sph(foot, 0.088, std(0xe8d9b8, { roughness: 0.9 }), 0.96, 0.22, 1.5, 0, -0.065, 0.05);   // sole
    B.legs.push({ s, hip, knee, foot });
  }
  // sweat drop (pale cyan, the only water on him)
  B.sweat = new THREE.Mesh(SPH, new THREE.MeshStandardMaterial({ color: 0xbff4ff, emissive: K.water, emissiveIntensity: 0.55, roughness: 0.1, transparent: true, opacity: 0.92 }));
  B.sweat.visible = false; head.add(B.sweat);
  B.HR = HR;
  root.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  return B;
}

// walk cycle / pose
function poseBoy(B, o) {
  const ph = o.phase, a = o.walk;                  // a: 0 = standing, 1 = full trudge
  const sw = Math.sin(ph), sw2 = Math.sin(ph + Math.PI);
  B.hips.position.y = 0.66 - Math.abs(Math.cos(ph)) * 0.035 * a + 0.0;
  B.hips.rotation.set(0.0, 0.0, 0.05 * Math.sin(ph) * a);
  B.torso.rotation.set(0.12 * a + (o.slump || 0), 0.1 * Math.sin(ph) * a, -0.05 * Math.sin(ph) * a);
  B.legs.forEach((L, i) => {
    const q = i === 0 ? sw : sw2;
    L.hip.rotation.x = q * 0.62 * a;
    L.knee.rotation.x = Math.max(0, -Math.cos(ph + (i ? Math.PI : 0)) * 0 + (i === 0 ? -Math.cos(ph) : Math.cos(ph)) * 0) + Math.max(0, (i === 0 ? -sw : -sw2) * 0 + (i === 0 ? Math.cos(ph - 0.6) : Math.cos(ph + Math.PI - 0.6))) * 0.9 * a * (q < 0.3 ? 1 : 0.2);
    L.foot.rotation.x = -L.knee.rotation.x * 0.3 - L.hip.rotation.x * 0.3;
  });
  B.arms.forEach((A, i) => {
    const q = i === 0 ? sw2 : sw;
    A.g.rotation.x = q * 0.55 * a + (o.armsX || 0); A.g.rotation.z = A.s * (0.06 + 0.02 * a);
    A.hand.rotation.x = 0;
  });
  B.neck.rotation.set(o.nodX || 0, 0, 0);
  B.head.rotation.set((o.headPitch || 0) + 0.04 * Math.abs(Math.cos(ph)) * a, o.headYaw || 0, o.headRoll || 0);
}

// ------------------------------------------------------------------ world: sky, dunes, tree
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { sun: { value: K.sunDir.clone() } },
  vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `varying vec3 vD; uniform vec3 sun;
  void main(){ vec3 d = normalize(vD); float e = d.y;
    vec3 hor = vec3(1.0,0.50,0.17), mid = vec3(0.78,0.24,0.10), top = vec3(0.22,0.07,0.10);
    vec3 c = mix(hor, mid, smoothstep(0.0,0.22,e)); c = mix(c, top, smoothstep(0.18,0.85,e));
    float ang = acos(min(dot(d, normalize(sun)),1.0));
    c += vec3(1.0,0.46,0.12) * exp(-ang*4.5) * 0.9 + vec3(1.0,0.7,0.3) * exp(-ang*14.0) * 0.8;
    c = mix(c, vec3(2.2,1.7,1.0), 1.0 - smoothstep(0.075,0.085,ang));
    gl_FragColor = vec4(c,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), skyMat); sky.frustumCulled = false;
const HAZE = new THREE.Color().setRGB(1.0, 0.50, 0.17, THREE.LinearSRGBColorSpace);

const world = new THREE.Group(); scene.add(world); world.add(sky);
// path frame: D = walking direction (azimuth 15deg right of -z), R = right
const AZ = 0.262;
const D = new THREE.Vector3(Math.sin(AZ), 0, -Math.cos(AZ)), Rt = new THREE.Vector3(Math.cos(AZ), 0, Math.sin(AZ));
const P0 = new THREE.Vector3(0, 0, 0);
function hgt(x, z) {
  const f = x * Rt.x + z * Rt.z, g = x * D.x + z * D.z;                 // across / along the path
  const near = 1 - sstep(4, 60, Math.hypot(f, g + 6));
  let h = 0.35 * Math.sin(0.11 * f + 0.4 * Math.sin(0.05 * g)) * Math.sin(0.07 * g + 1.0) * 0.6;
  const sn = Math.sin(0.045 * f + 0.9 * Math.sin(0.02 * g) + 0.3), ridge = 1 - Math.sqrt(sn * sn + 0.04) + 0.2;
  h += (3.2 + 0.06 * Math.max(0, g)) * Math.pow(ridge, 3) * (1 - near * 0.92) * sstep(14, 40, Math.hypot(f * 0.6, g - 4));
  h += 1.2 * Math.sin(0.03 * f + 1) * Math.sin(0.031 * g) * (1 - near);
  return h;
}
{
  const N = 220, SZ = 700, geo = new THREE.PlaneGeometry(SZ, SZ, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c1 = new THREE.Color(0xe0a860), c2 = new THREE.Color(0xc86a38), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 150;               // terrain extends mostly ahead of the camera
    p.setZ(i, z); p.setY(i, hgt(x, z));
    const n = 0.5 + 0.5 * Math.sin(x * 0.7 + Math.sin(z * 0.5) * 2.0) * Math.sin(z * 0.43);
    tmp.copy(c1).lerp(c2, clamp(0.25 + 0.5 * n + p.getY(i) * 0.05)); col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  // ripple texture
  const t = canvasTex(256); const cx = t.ctx; cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 38; i++) { const y = i * 6.7 + rand() * 3; cx.strokeStyle = 'rgba(150,90,50,' + (0.10 + rand() * 0.10) + ')'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(0, y); for (let x = 0; x <= 256; x += 16) cx.lineTo(x, y + Math.sin(x * 0.05 + i) * 2.0); cx.stroke(); }
  t.tex.wrapS = t.tex.wrapT = THREE.RepeatWrapping; t.tex.repeat.set(60, 60);
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: t.tex, roughness: 0.95 }));
  ground.receiveShadow = true; ground.frustumCulled = false; world.add(ground);
}
// dead tree
function deadTree() {
  const g = new THREE.Group(), bark = std(0x3a2a22, { roughness: 0.9 });
  function branch(parent, len, r0, r1, rotZ, rotX, y) {
    const pivot = new THREE.Group(); pivot.position.y = y; pivot.rotation.set(rotX, 0, rotZ); parent.add(pivot);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 12), bark); m.position.y = len / 2; m.castShadow = true; pivot.add(m);
    return pivot;
  }
  const trunk = branch(g, 2.6, 0.17, 0.09, 0.05, 0, 0);
  const b1 = branch(trunk, 1.5, 0.08, 0.035, 0.9, 0.2, 1.7); const b1b = branch(b1, 0.9, 0.035, 0.015, -0.7, 0.3, 1.45);
  const b2 = branch(trunk, 1.3, 0.07, 0.03, -1.0, -0.2, 1.3); const b2b = branch(b2, 0.8, 0.03, 0.012, 0.8, 0.0, 1.2);
  const b3 = branch(trunk, 1.0, 0.06, 0.02, 0.35, 0.5, 2.4); branch(b3, 0.6, 0.02, 0.01, 0.9, 0.0, 0.9);
  branch(b1, 0.6, 0.03, 0.012, 0.3, -0.5, 0.8);
  return g;
}
const tree = deadTree(); world.add(tree); const rocks = [];
{ const a = -2.4, f = 8.0; tree.position.set(P0.x + Rt.x * a + D.x * f, 0, P0.z + Rt.z * a + D.z * f); tree.position.y = hgt(tree.position.x, tree.position.z) - 0.05; tree.scale.setScalar(1.15); }
// a few rocks / tufts for scale
for (let i = 0; i < 7; i++) {
  const a = (rand() - 0.5) * 9, f = 1 + rand() * 12; const x = Rt.x * a + D.x * f, z = Rt.z * a + D.z * f;
  if (Math.abs(a) < 0.7 && f < 5) continue;
  const m = sph(world, 0.1 + rand() * 0.12, std(0x7a4a32, { roughness: 0.95 }), 1.3, 0.7, 1, x, hgt(x, z) + 0.02, z);
}

const boy = makeBoy(); world.add(boy.root);

// ------------------------------------------------------------------ hand + bottle (shot 3)
const bottleGroup = new THREE.Group(); scene.add(bottleGroup);
const hand3 = {};
{
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(14, 14, 80, 80), new THREE.MeshStandardMaterial({ color: 0x9a5c2c, roughness: 1 }));
  sand.rotation.x = -Math.PI / 2; sand.receiveShadow = true;
  const p = sand.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.025 * Math.sin(x * 9 + Math.sin(y * 4)) * Math.sin(y * 7) + 0.05 * Math.sin(x * 1.7) * Math.cos(y * 1.3)); }
  sand.geometry.computeVertexNormals(); bottleGroup.add(sand); hand3.sand = sand;
  // bottle (upright profile; flipped by the pose)
  const pts = [], Hb = 0.34, Rb = 0.082;
  const prof = [[0, 0], [0.55, 0.006], [0.9, 0.02], [1, 0.05]];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(Rb * r, y));
  for (let y = 0.07; y <= 0.20; y += 0.012) pts.push(new THREE.Vector2(Rb * (1 - 0.035 * (0.5 + 0.5 * Math.sin(y * 150))), y));   // ribs
  for (let y = 0.21; y <= 0.235; y += 0.005) pts.push(new THREE.Vector2(Rb, y));
  pts.push(new THREE.Vector2(Rb * 0.95, 0.26), new THREE.Vector2(Rb * 0.7, 0.29), new THREE.Vector2(Rb * 0.42, 0.31), new THREE.Vector2(Rb * 0.34, 0.325), new THREE.Vector2(Rb * 0.34, 0.34), new THREE.Vector2(Rb * 0.40, 0.345), new THREE.Vector2(Rb * 0.36, 0.348));
  const bm = new THREE.MeshPhysicalMaterial({ color: 0xfff1de, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.30, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.1 });
  const bottle = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), bm); bottle.castShadow = true; bottle.renderOrder = 2;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(Rb * 1.012, Rb * 1.012, 0.075, 40, 1, true), std(0xe8dcc4, { side: THREE.DoubleSide }));
  label.position.y = 0.135; label.castShadow = true;
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(Rb * 1.016, Rb * 1.016, 0.022, 40, 1, true), std(0xc2502a, { side: THREE.DoubleSide })); stripe.position.y = 0.135;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(Rb * 0.37, 0.007, 8, 24), std(0xf0e6d6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.318;
  const bPivot = new THREE.Group(); const bFlip = new THREE.Group();     // bFlip: upside down (mouth down), about the bottle centre
  bottle.position.y = -Hb / 2; label.position.y -= Hb / 2; stripe.position.y -= Hb / 2; ring.position.y -= Hb / 2;
  bFlip.add(bottle, label, stripe, ring); bFlip.rotation.x = Math.PI; bPivot.add(bFlip); bottleGroup.add(bPivot);
  // forearm + mitten hand gripping the bottle's upper (base) half; forearm leaves the frame at the top
  const skin = std(K.skin, { roughness: 0.6 }), shirt = std(K.shirt, { roughness: 0.85 });
  const hand = new THREE.Group(); bPivot.add(hand);
  sph(hand, 0.092, skin, 1.0, 1.2, 1.05, 0, 0.05, 0);                     // fist mitten around the bottle
  sph(hand, 0.036, skin, 1.0, 1.4, 1.0, -0.07, 0.03, 0.07);             // thumb
  for (let i = 0; i < 4; i++) sph(hand, 0.03, skin, 1.0, 1.4, 1.0, 0.0 + (i - 1.5) * 0.002, 0.0 - i * 0.0, 0.1 - i * 0.003).visible = false;
  const fore = cylM(hand, 0.056, 0.05, 0.4, skin, 0.03, 0.30, -0.01); fore.rotation.z = -0.1;
  cylM(hand, 0.088, 0.082, 0.2, shirt, 0.06, 0.68, -0.02).rotation.z = -0.1;
  cylM(hand, 0.092, 0.092, 0.03, std(K.shirtTrim), 0.052, 0.585, -0.02).rotation.z = -0.1;
  hand.position.y = 0.14;                                                    // bottle centre = 0; mouth is at y = -0.17 (flipped)
  Object.assign(hand3, { bPivot, bFlip, hand, Hb });
  // drop + splash
  const wm = new THREE.MeshStandardMaterial({ color: 0x20c0f0, emissive: 0x30d0ff, emissiveIntensity: 1.6, roughness: 0.08, transparent: true, opacity: 0.95 });
  hand3.drop = new THREE.Mesh(SPH, wm); bottleGroup.add(hand3.drop);
  hand3.parts = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(SPH, wm); m.visible = false; bottleGroup.add(m); hand3.parts.push({ m, a: rand() * 6.283, v: 0.35 + rand() * 0.45, up: 0.9 + rand() * 1.0, r: 0.008 + rand() * 0.008 }); }
  hand3.wet = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x5a2c14, transparent: true, opacity: 0.8, depthWrite: false })); hand3.wet.rotation.x = -Math.PI / 2; hand3.wet.position.y = 0.012; bottleGroup.add(hand3.wet);
  hand3.ripple = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), new THREE.MeshBasicMaterial({ color: K.water, transparent: true, opacity: 0.8, depthWrite: false })); hand3.ripple.rotation.x = -Math.PI / 2; hand3.ripple.position.y = 0.016; bottleGroup.add(hand3.ripple);
}
const MOUTH_LOCAL = new THREE.Vector3(0, -0.17, 0);                          // in bPivot space (bottle centre)
const HAND_X = 0.0;
function poseBottle(t) {                                                     // t in 6..9
  const u = t - 6;
  const shakeAmp = (0.22 * (1 - sstep(0.7, 1.15, u)) + 0.045 * sstep(1.0, 1.4, u) * (1 - sstep(2.0, 3.0, u) * 0.3)) * sstep(0, 0.12, u);
  const f = 6.3;
  const sa = Math.sin(u * f * 2 * Math.PI * 0.5);
  const rz = sa * shakeAmp, rx = Math.sin(u * f * 3.1) * shakeAmp * 0.35;
  hand3.bPivot.position.set(HAND_X + Math.sin(u * 11) * shakeAmp * 0.06, 0.405 + Math.abs(Math.sin(u * 8)) * shakeAmp * 0.03, 0);
  hand3.bPivot.rotation.set(rx + 0.04, 0, rz + 0.1);
  hand3.bPivot.updateMatrixWorld(true);
  return hand3.bPivot.localToWorld(MOUTH_LOCAL.clone());
}
const T_DROP0 = 6.1, T_REL = 6.45, T_HIT = 6.78;
let releasePos = null;
function updateDrop(t) {
  const m = hand3.drop; m.visible = false; hand3.wet.visible = false; hand3.ripple.visible = false; hand3.parts.forEach(p => p.m.visible = false);
  const mouth = poseBottle(t);
  if (t < T_REL) {
    const g = sstep(T_DROP0, T_REL, t);                                      // swelling at the lip
    const wob = 1 + 0.12 * Math.sin(t * 38);
    m.visible = t > T_DROP0; m.position.copy(mouth).add(new THREE.Vector3(0, -0.012 - 0.014 * g * g, 0));
    m.scale.set(0.012 * g * wob, (0.012 + 0.012 * g * g) * g * (2 - wob), 0.012 * g * wob);
  } else {
    const rp = poseBottle(T_REL); poseBottle(t);
    const ground = 0.03, tt = t - T_REL, T = T_HIT - T_REL, H0 = rp.y - ground;
    if (t < T_HIT) {
      const s = (tt / T) ** 2; m.visible = true; m.position.set(rp.x, rp.y - H0 * s - 0.012, rp.z);
      const st = 1 + 1.4 * Math.min(1, tt / T);
      m.scale.set(0.013, 0.013 * st, 0.013);
    } else {
      const k = t - T_HIT;
      hand3.sandHit = new THREE.Vector3(rp.x, 0, rp.z);
      hand3.parts.forEach(p => { const x = p.v * k, y = p.up * k - 4.2 * k * k * 0.5; if (y > -0.001 && k < 0.45) { p.m.visible = true; p.m.position.set(rp.x + Math.cos(p.a) * x * 0.5, ground + y * 0.5, rp.z + Math.sin(p.a) * x * 0.5); p.m.scale.set(p.r, p.r * 1.3, p.r); } });
      hand3.wet.visible = true; const ws = 0.03 * (1 + 0.8 * (1 - Math.exp(-k * 6))); hand3.wet.position.set(rp.x, 0.014, rp.z); hand3.wet.scale.set(ws, ws, ws);
      hand3.ripple.visible = k < 0.5; const rr = 0.02 + 0.09 * k * 2; hand3.ripple.scale.set(rr, rr, rr); hand3.ripple.position.set(rp.x, 0.017, rp.z); hand3.ripple.material.opacity = 0.9 * (1 - k * 2);
    }
  }
}

// ------------------------------------------------------------------ eye ECU (shot 4)
const eyeG = new THREE.Group(); scene.add(eyeG);
const E = {};
{
  const skin = std(0xe8ad88, { roughness: 0.55 });
  const iris = canvasTex(512); E.iris = iris;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), std(0xeadac6, { roughness: 0.3 })); ball.receiveShadow = true;
  E.eye = new THREE.Group(); E.eye.add(ball); eyeG.add(E.eye);
  const irisMesh = new THREE.Mesh(patchGeo(1.004, 0.46, 40), new THREE.MeshStandardMaterial({ map: iris.tex, emissiveMap: iris.tex, emissive: 0xffffff, emissiveIntensity: 0.45, transparent: true, roughness: 0.25, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false })); irisMesh.receiveShadow = true;
  E.eye.add(irisMesh);
  const cornea = new THREE.Mesh(new THREE.SphereGeometry(1.012, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.10, depthWrite: false, clearcoat: 1 }));
  cornea.scale.set(1, 1, 1); E.eye.add(cornea);
  // lids: hemispherical shells rotated about X
  function lidShell(upper) {
    const g = new THREE.Group();
    const geo = new THREE.SphereGeometry(1.075, 64, 32, 0, Math.PI * 2, upper ? 0 : Math.PI / 2, Math.PI / 2);
    const m = new THREE.Mesh(geo, skin); m.castShadow = true; m.receiveShadow = true; g.add(m);
    const lash = new THREE.Mesh(new THREE.TorusGeometry(1.075, upper ? 0.05 : 0.028, 12, 64, Math.PI), std(upper ? 0x1a0f0b : 0x6a3a28, { roughness: 0.6 }));
    lash.rotation.x = Math.PI / 2; g.add(lash);   // arc over +z
    if (upper) {
      const cr = new THREE.Mesh(new THREE.TorusGeometry(0.949, 0.014, 8, 64, Math.PI), std(0x8a4a30, { roughness: 0.7 })); cr.rotation.x = Math.PI / 2; cr.position.y = 0.505; g.add(cr);
      const lm = std(0x140b08, { roughness: 0.7 });
      for (let i = 0; i < 17; i++) { const a = Math.PI * (0.1 + 0.8 * i / 16); const p = new THREE.Vector3(Math.cos(a) * 1.07, 0.0, Math.sin(a) * 1.07);
        const ax = new THREE.Vector3(Math.cos(a) * 0.5, 0.7, Math.sin(a) * 0.8 + 0.3).normalize(); coneAlong(g, lm, 0.03, 0.2, p, ax).castShadow = true; }
    }
    eyeG.add(g); return g;
  }
  E.up = lidShell(true); E.lo = lidShell(false);
  // brow + surrounding skin
  const skinBig = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 48), skin); skinBig.position.set(0, 0.3, -5.6); skinBig.receiveShadow = true; eyeG.add(skinBig);
  const browM = std(0x1a0f0b, { roughness: 0.7 });
  E.brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 2.7, 10, 24), browM); E.brow.rotation.z = Math.PI / 2; E.brow.castShadow = true; eyeG.add(E.brow);
  E.brow.scale.set(1, 1, 0.7);
}
function drawIris(t) {
  const { ctx, tex } = E.iris, S = 512, c = S / 2, R = S / 2 * 0.98;
  ctx.clearRect(0, 0, S, S);
  ctx.save(); ctx.beginPath(); ctx.arc(c, c, R, 0, 6.283); ctx.clip();
  let g = ctx.createRadialGradient(c, c, R * 0.12, c, c, R);
  g.addColorStop(0, '#0a0504'); g.addColorStop(0.26, '#1a0c06'); g.addColorStop(0.34, '#7a4418'); g.addColorStop(0.62, '#4a2410'); g.addColorStop(0.9, '#2a130a'); g.addColorStop(1, '#0c0605');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  ctx.lineWidth = 2;                                                          // radial fibres
  for (let i = 0; i < 90; i++) { const a = i / 90 * 6.283 + Math.sin(i * 12.9) * 0.05; ctx.strokeStyle = 'rgba(' + (i % 2 ? '170,100,40' : '20,8,4') + ',0.28)'; ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * R * 0.28, c + Math.sin(a) * R * 0.28); ctx.lineTo(c + Math.cos(a) * R * 0.9, c + Math.sin(a) * R * 0.9); ctx.stroke(); }
  g = ctx.createRadialGradient(c, c, 0, c, c, R * 0.27); g.addColorStop(0, '#000'); g.addColorStop(1, '#050202'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 0.27 * (1 + 0.04 * Math.sin(t * 2.0)), 0, 6.283); ctx.fill();
  // mirage reflection: orange sky, ochre sand, shimmering cyan lake
  const mx = c + 8, my = c + R * 0.40, mw = R * 0.60, mh = R * 0.28;
  ctx.save(); ctx.beginPath(); ctx.ellipse(mx, my, mw, mh, 0, 0, 6.283); ctx.clip();
  g = ctx.createLinearGradient(0, my - mh, 0, my + mh); g.addColorStop(0, '#b8501c'); g.addColorStop(0.45, '#d86a28'); g.addColorStop(0.5, '#c88a50'); g.addColorStop(1, '#8a4a22');
  ctx.fillStyle = g; ctx.fillRect(mx - mw, my - mh, mw * 2, mh * 2);
  ctx.fillStyle = '#c2703a'; ctx.beginPath(); ctx.moveTo(mx - mw, my + 4); for (let x = -mw; x <= mw; x += 8) ctx.lineTo(mx + x, my - 4 - 10 * Math.sin(x * 0.03 + 1)); ctx.lineTo(mx + mw, my + mh); ctx.lineTo(mx - mw, my + mh); ctx.fill();
  const ly = my + 4, lh = mh * 0.34;
  ctx.fillStyle = '#18bfee'; ctx.beginPath();
  for (let x = -mw * 0.62; x <= mw * 0.62; x += 4) { const w = Math.sin(x * 0.09 + t * 7) * 2.5 + Math.sin(x * 0.21 - t * 11) * 1.5; const yy = ly - lh * 0.5 + w * 0.5 - (1 - Math.abs(x) / (mw * 0.62)) * 0; if (x === -mw * 0.62) ctx.moveTo(mx + x, yy); else ctx.lineTo(mx + x, yy); }
  for (let x = mw * 0.62; x >= -mw * 0.62; x -= 4) { const w = Math.sin(x * 0.11 - t * 8) * 2.5; const k = Math.sqrt(Math.max(0, 1 - (x / (mw * 0.62)) ** 2)); ctx.lineTo(mx + x, ly + lh * k * 0.9 + w * 0.5); }
  ctx.fill();
  ctx.fillStyle = 'rgba(190,245,255,0.7)';
  for (let i = 0; i < 4; i++) { const sx = (Math.sin(t * 5 + i * 2.1)) * mw * 0.38, sy = ly + (i - 2) * lh * 0.22; ctx.fillRect(mx + sx - 9, sy, 18 + 8 * Math.sin(t * 9 + i), 2.5); }
  ctx.restore();
  ctx.restore();
  // window-shaped highlight (outside the clip: crisp) + small one
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath(); ctx.roundRect(c - R * 0.58, c - R * 0.62, R * 0.34, R * 0.30, R * 0.07); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(c + R * 0.42, c - R * 0.26, R * 0.07, 0, 6.283); ctx.fill();
  // soft limbal fade
  tex.needsUpdate = true;
}

// ------------------------------------------------------------------ lights
const sun = new THREE.DirectionalLight(0xffa860, 3.0); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
{ const c = sun.shadow.camera; c.left = -9; c.right = 9; c.top = 9; c.bottom = -9; c.near = 1; c.far = 120; }
const hemi = new THREE.HemisphereLight(0xffb070, 0x7a3a22, 0.9);
const key = new THREE.DirectionalLight(0xffd2a0, 1.4);
const rim = new THREE.DirectionalLight(0xff9040, 2.0);
const fillL = new THREE.DirectionalLight(0xe9a58a, 0.5);
scene.add(sun, sun.target, hemi, key, key.target, rim, rim.target, fillL, fillL.target);
function lights(o) {
  sun.intensity = o.sun ?? 0; hemi.intensity = o.hemi ?? 0; key.intensity = o.key ?? 0; rim.intensity = o.rim ?? 0; fillL.intensity = o.fill ?? 0;
  sun.castShadow = !!o.sunShadow;
}

// ------------------------------------------------------------------ shots
function setFog(on, color, near, far) { scene.fog = on ? new THREE.Fog(color, near, far) : null; }
function faceExpr(t) {
  const u = ease(t / 3);
  const blink = (t0, d) => { const x = Math.abs(t - t0) / (d / 2); return x >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x); };
  const baseOpen = lerp(0.68, 0.46, u);
  return { open: baseOpen * (1 - blink(1.2, 0.26)), squint: lerp(0.35, 0.7, u) * (1 - blink(1.2, 0.26) * 0.5),
    furrow: lerp(0.25, 1.0, u), browLift: -0.02 * u, blush: 0.9, look: 0, mouthCurve: lerp(-0.5, -0.9, u), mouthOpen: 0.25 + 0.15 * Math.sin(t * 3.2) };
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function shot1(t) {
  tree.visible = false; world.visible = true; bottleGroup.visible = false; eyeG.visible = false;
  const u = ease(t / 3), PSI = -0.30;
  boy.root.visible = true;
  boy.root.position.set(0, hgt(0, 0), 0); boy.root.rotation.set(0, PSI, 0);
  poseBoy(boy, { phase: 0.0, walk: 0, headYaw: 0.07 * Math.sin(t * 1.3), headRoll: 0.045 * Math.sin(t * 0.9 + 0.5), headPitch: 0.05 + 0.03 * u + 0.012 * Math.sin(t * 2.4), slump: 0.04 * u, nodX: 0.0 });
  boy.arms.forEach(A => { A.g.rotation.x = 0.0; });
  const ex = faceExpr(t); drawFace(boy.face.ctx, ex); boy.face.tex.needsUpdate = true;
  // sweat drop sliding down the viewer-right temple of the face (head space)
  const sw = boy.sweat, su = sstep(1.6, 2.9, t);
  sw.visible = t > 1.55 && t < 3.0;
  { const HR = boy.HR, y = lerp(0.42, -0.28, su * su * 0.6 + su * 0.4) * HR, x0 = lerp(0.80, 0.84, su), x = x0 * HR * 1.08;
    const z = Math.sqrt(Math.max(0.0, HR * HR * 1.0 - (x / 1.08) ** 2 - y * y)) + 0.004; sw.position.set(x, y, z);
    sw.scale.set(0.016, 0.026, 0.014); sw.rotation.z = 0.1; }
  const dist = lerp(2.25, 1.85, u);
  const hp = boy.head.getWorldPosition(new THREE.Vector3());
  const fwd = V(Math.sin(PSI), 0, Math.cos(PSI));
  cam.fov = 30; cam.position.copy(hp).addScaledVector(fwd, dist).add(V(0, 0.0, 0));
  cam.position.y = hp.y - 0.06;
  cam.lookAt(hp.x, hp.y - 0.02 - 0.13, hp.z); cam.up.set(0, 1, 0);
  cam.rotation.z = 0.0;
  sun.position.copy(K.sunDir).multiplyScalar(60); sun.target.position.set(0, 1, 0);
  key.position.copy(hp).add(V(-0.9, 0.5, 1.6).applyAxisAngle(V(0, 1, 0), PSI)); key.target.position.copy(hp);
  rim.position.copy(hp).add(V(0.8, 0.4, -1.2)); rim.target.position.copy(hp);
  fillL.position.copy(hp).add(V(1.2, -0.3, 1.5).applyAxisAngle(V(0, 1, 0), PSI)); fillL.target.position.copy(hp);
  lights({ sun: 4.2, hemi: 0.75, key: 1.5, rim: 0.0, fill: 0.55, sunShadow: false });
  setFog(true, HAZE, 20, 300); scene.background = null;
}
function shot2(t) {
  tree.visible = true; world.visible = true; bottleGroup.visible = false; eyeG.visible = false;
  const u = (t - 3) / 3, v = 1.12, walkT = t - 3;
  const f = -2.0 + v * walkT, a = 0;
  const px = P0.x + D.x * f + Rt.x * a, pz = P0.z + D.z * f + Rt.z * a;
  boy.root.position.set(px, hgt(px, pz), pz); boy.root.rotation.set(0, Math.atan2(D.x, D.z) + 0.0, 0);
  // boy's local +z is his facing; D = walk dir -> rotation.y = atan2(D.x, D.z)
  const ph = walkT * 2 * Math.PI * 0.86;
  poseBoy(boy, { phase: ph, walk: 1, headPitch: 0.1, headRoll: 0.03 * Math.sin(ph), slump: 0.05, armsX: 0 });
  const cf = -13.4 + 0.9 * ease(u) * 3;
  const cpx = P0.x + D.x * cf + Rt.x * 0.55, cpz = P0.z + D.z * cf + Rt.z * 0.55;
  cam.fov = lerp(32, 27, ease(u)); const cy = hgt(cpx, cpz) + 1.25; cam.position.set(cpx, cy, cpz);
  const tf = 30; cam.up.set(0, 1, 0);
  const pitch = Math.atan(0.52 * Math.tan(cam.fov * Math.PI / 360));
  cam.lookAt(P0.x + D.x * tf, cy - tf * Math.tan(pitch), P0.z + D.z * tf);
  const bp = boy.root.position;
  sun.position.copy(bp).addScaledVector(K.sunDir, 60); sun.target.position.copy(bp);
  key.position.copy(bp).add(V(-2, 3, 6)); key.target.position.copy(bp);
  rim.position.copy(bp).add(V(2, 3, -3)); rim.target.position.copy(bp);
  fillL.position.copy(bp).add(V(2, 2, 6)); fillL.target.position.copy(bp);
  lights({ sun: 3.6, hemi: 1.05, key: 1.4, rim: 0.0, fill: 0.5, sunShadow: true });
  cam.setViewOffset(W, H, -W * 0.12, 0, W, H);
  setFog(true, HAZE, 25, 330); scene.background = null;
  return u;
}
function shot3(t) {
  world.visible = false; bottleGroup.visible = true; eyeG.visible = false;
  updateDrop(t);
  cam.fov = 34; cam.up.set(0, 1, 0);
  const u = ease((t - 6) / 3);
  cam.position.set(0.0 + 0.04 * u, 0.50, 2.1 - 0.15 * u); cam.lookAt(0.0, 0.14, 0);
  cam.setViewOffset(W, H, -W * 0.12, H * 0.012, W, H);
  scene.background = new THREE.Color(0x24100a); setFog(true, 0x2a120a, 1.4, 3.6);
  sun.position.set(-1.2, 1.1, -1.4); sun.target.position.set(0, 0.2, 0);
  key.position.set(-1.0, 1.0, 1.6); key.target.position.set(0, 0.5, 0);
  rim.position.set(1.4, 1.2, -1.0); rim.target.position.set(0, 0.5, 0);
  fillL.position.set(1.5, 0.4, 1.5); fillL.target.position.set(0, 0.5, 0);
  sun.shadow.camera.left = -1.5; sun.shadow.camera.right = 1.5; sun.shadow.camera.top = 1.5; sun.shadow.camera.bottom = -1.5; sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 8; sun.shadow.camera.updateProjectionMatrix();
  lights({ sun: 3.0, hemi: 0.55, key: 1.5, rim: 3.0, fill: 0.5, sunShadow: true });
}
function shot4(t) {
  world.visible = false; bottleGroup.visible = false; eyeG.visible = true;
  const u = ease((t - 9) / 3);
  const blink = (t0, d) => { const x = Math.abs(t - t0) / (d / 2); return x >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x); };
  const bl = blink(11.25, 0.55);
  const open = 1 - bl, droop = 0.10 * u;
  E.up.rotation.x = lerp(-0.62 + droop, 0.62, bl); E.lo.rotation.x = lerp(0.40, -0.02, bl);
  E.up.rotation.x = lerp(-0.72 + droop, 0.52, bl); E.lo.rotation.x = lerp(0.30, -0.1, bl);
  E.eye.rotation.set(0.04 * Math.sin(t * 0.8) - 0.04, 0.05 * Math.sin(t * 0.6) + 0.04, 0);
  E.brow.position.set(0, 1.62 - 0.0 * u, 0.62); E.brow.rotation.z = Math.PI / 2 + 0.07 * (1 - u * 0.2);
  E.brow.rotation.x = 0; E.brow.position.y = 1.55 - 0.12 * u;
  drawIris(t);
  const z = lerp(4.0, 2.75, u);
  cam.fov = 50; cam.up.set(0, 1, 0); cam.position.set(0.0, 0.0, z + 0.0); cam.lookAt(0, 0.0, 0);
  cam.setViewOffset(W, H, 0, H * 0.10, W, H);
  scene.background = new THREE.Color(0x1a0a06); setFog(false);
  sun.position.set(-1.5, 2.5, 4); sun.target.position.set(0, 0, 0);
  key.position.set(-2, 1.5, 5); key.target.position.set(0, 0, 0);
  rim.position.set(2, 3, -1); rim.target.position.set(0, 0, 0);
  fillL.position.set(2.5, -1, 4); fillL.target.position.set(0, 0, 0);
  sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4; sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 20; sun.shadow.camera.updateProjectionMatrix();
  lights({ sun: 2.2, hemi: 0.7, key: 1.6, rim: 1.2, fill: 0.6, sunShadow: true });
}

window.renderFrame = function (i) {
  const t = i / FPS;
  cam.clearViewOffset();
  if (t < 3) shot1(t); else if (t < 6) shot2(t); else if (t < 9) shot3(t); else shot4(t);
  cam.aspect = W / H; cam.updateProjectionMatrix();
  renderer.render(scene, cam);
};
window.sceneReady = true;
