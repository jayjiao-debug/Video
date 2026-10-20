/* 木偶动作测试: a quiet room at night. Rain runs down the window, one warm lamp. The puppet sits, breathes, turns its head
   toward the window, lifts a hand to its ear as if hearing something, then lowers it. Slow push-in.
   Motion: scripts/puppet_bake.py (CMU 14_30 seated base, 77_04 look, 80_25 hand to the ear). Everything drawn in code. */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildPuppet, applyRec, takeRec, TK, woodMat } from './Puppet';
import { chair, seatUnder, lamp, glowSprite } from './Set';
import { W, H, grain, vignette, mark, SANS, eio, clamp } from './lib';

export const TEST_FRAMES = Math.round(TK.meta.dur * 30);

/* ------------------------------------------------------------------ the set */
const PUPPET_AT = new THREE.Vector3(-0.15, 0, -1.25), PUPPET_YAW = 0.26;
const WALL_X = 2.2, BACK_Z = -2.3, CEIL = 2.85;
const WIN = { z0: -1.3, z1: -0.1, y0: 0.86, y1: 2.26 };

const rnd = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

const plasterTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d')!; const r = rnd(41);
  g.fillStyle = '#6d7880'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { const x = r() * 512, y = r() * 512, rr = 30 + r() * 120; const gr = g.createRadialGradient(x, y, 0, x, y, rr); const d = r() < 0.5;
    gr.addColorStop(0, d ? 'rgba(40,46,52,.10)' : 'rgba(200,210,215,.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '20,24,28' : '230,235,240'},${r() * 0.05})`; g.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
  for (let i = 0; i < 14; i++) { const x = r() * 512; const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(30,34,38,0)'); gr.addColorStop(1, 'rgba(30,34,38,.06)'); g.fillStyle = gr; g.fillRect(x, 0, 6 + r() * 20, 512); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
};
const floorTex = () => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d')!; const r = rnd(77);
  const boards = 8, bw = 1024 / boards;
  for (let b = 0; b < boards; b++) {
    let y = -r() * 600;
    while (y < 1024) { const len = 380 + r() * 520; const tone = 52 + r() * 22;
      g.fillStyle = `rgb(${tone + 6},${tone},${tone - 6})`; g.fillRect(b * bw, y, bw, len);
      for (let i = 0; i < 26; i++) { const x = b * bw + r() * bw; g.strokeStyle = `rgba(25,20,16,${0.08 + r() * 0.16})`; g.lineWidth = 0.6 + r() * 1.4; g.beginPath(); g.moveTo(x, y); for (let k = 0; k <= len; k += 16) g.lineTo(x + Math.sin(k * 0.01 + i) * 2.5, y + k); g.stroke(); }
      g.fillStyle = 'rgba(10,8,6,.85)'; g.fillRect(b * bw, y, bw, 2); y += len; }
    g.fillStyle = 'rgba(8,6,5,.9)'; g.fillRect(b * bw, 0, 2.5, 1024);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, 1.6); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

/* rain: one set of drops drives the glass and the light that falls through it */
type Drop = { x: number; y0: number; v: number; len: number; w: number; ph: number };
const R0 = rnd(5);
const BEADS = Array.from({ length: 560 }, () => ({ x: R0(), y: R0(), r: 0.6 + R0() * R0() * 3.2 }));
const RUNS: Drop[] = Array.from({ length: 22 }, () => ({ x: R0(), y0: R0() * 1.4, v: 0.05 + R0() * 0.16, len: 0.08 + R0() * 0.3, w: 1.2 + R0() * 1.6, ph: R0() * 6 }));
const BOKEH = Array.from({ length: 46 }, () => ({ x: R0(), y: 0.25 + R0() * 0.75, r: 6 + R0() * 26, warm: R0() < 0.55, a: 0.06 + R0() * 0.22 }));
const dropY = (d: Drop, t: number) => ((d.y0 + d.v * t) % 1.4) - 0.2;

const drawGlass = (g: CanvasRenderingContext2D, w: number, h: number, t: number) => {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0a131c'); bg.addColorStop(0.6, '#122230'); bg.addColorStop(1, '#1b2c38'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (const b of BOKEH) { const x = b.x * w, y = b.y * h; const gr = g.createRadialGradient(x, y, 0, x, y, b.r); const col = b.warm ? '255,190,120' : '150,190,230';
    gr.addColorStop(0, `rgba(${col},${b.a})`); gr.addColorStop(0.7, `rgba(${col},${b.a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - b.r, y - b.r, 2 * b.r, 2 * b.r); }
  const fog = g.createLinearGradient(0, h * 0.55, 0, h); fog.addColorStop(0, 'rgba(170,195,210,0)'); fog.addColorStop(1, 'rgba(170,195,210,.13)'); g.fillStyle = fog; g.fillRect(0, 0, w, h);
  for (const b of BEADS) { const x = b.x * w, y = b.y * h; g.fillStyle = 'rgba(8,14,20,.35)'; g.beginPath(); g.ellipse(x, y + b.r * 0.2, b.r, b.r * 1.15, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(200,222,240,.28)'; g.beginPath(); g.ellipse(x, y, b.r * 0.85, b.r, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - b.r * 0.35, y - b.r * 0.5, Math.max(1, b.r * 0.35), Math.max(1, b.r * 0.35)); }
  for (const d of RUNS) { const y = dropY(d, t) * h, x = d.x * w + Math.sin(y * 0.03 + d.ph) * 3; const L = d.len * h;
    const tr = g.createLinearGradient(0, y - L, 0, y); tr.addColorStop(0, 'rgba(190,215,235,0)'); tr.addColorStop(1, 'rgba(190,215,235,.32)'); g.strokeStyle = tr; g.lineWidth = d.w;
    g.beginPath(); g.moveTo(x - Math.sin((y - L) * 0.03 + d.ph) * 2, y - L); g.quadraticCurveTo(x + 2, y - L / 2, x, y); g.stroke();
    g.fillStyle = 'rgba(205,228,245,.55)'; g.beginPath(); g.ellipse(x, y, d.w * 1.5, d.w * 2, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x - d.w * 0.6, y - d.w, 1.5, 1.5); }
};
/* the light cookie: what the rain does to the light coming in (soft dark beads and streaks on a bright field) */
const drawCookie = (g: CanvasRenderingContext2D, s: number, t: number) => {
  g.fillStyle = '#fff'; g.fillRect(0, 0, s, s);
  const bg = g.createRadialGradient(s / 2, s / 2, s * 0.2, s / 2, s / 2, s * 0.5); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = bg; g.fillRect(0, 0, s, s);
  for (const b of BEADS) { g.fillStyle = 'rgba(40,50,60,.22)'; g.beginPath(); g.arc(b.x * s, b.y * s, b.r * 0.9, 0, 7); g.fill(); }
  for (const d of RUNS) { const y = dropY(d, t) * s, x = d.x * s; g.strokeStyle = 'rgba(30,40,50,.35)'; g.lineWidth = d.w * 1.4; g.beginPath(); g.moveTo(x, y - d.len * s); g.lineTo(x, y); g.stroke(); }
};

type SetRefs = { rig: ReturnType<typeof buildPuppet>; glass: CanvasRenderingContext2D; glassTex: THREE.CanvasTexture; cookie: CanvasRenderingContext2D; cookieTex: THREE.CanvasTexture;
  motes: THREE.Points; moteBase: Float32Array; lampLight: THREE.SpotLight; fill: THREE.PointLight };

const Room: React.FC<{ t: number; dbg?: number[] }> = ({ t, dbg }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo<SetRefs>(() => {
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = new THREE.Color('#0b1015'); scene.fog = new THREE.FogExp2('#18222a', 0.075);
    const plaster = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.95, color: '#c9d2d8' });
    const plane = (w: number, h: number, mat: THREE.Material, pos: [number, number, number], rot: [number, number, number], rep?: [number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), rep ? (() => { const mm = (mat as THREE.MeshStandardMaterial).clone(); mm.map = (mm.map as THREE.Texture).clone(); mm.map.repeat.set(...rep); mm.map.needsUpdate = true; return mm; })() : mat);
      m.position.set(...pos); m.rotation.set(...rot); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m;
    };
    // floor + ceiling
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.62, color: '#b3aaa0' }));
    fl.rotation.x = -Math.PI / 2; fl.position.set(-1, 0, 0.2); fl.receiveShadow = true; scene.add(fl);
    plane(9, 9, new THREE.MeshStandardMaterial({ color: '#1a1f24', roughness: 1 }), [-1, CEIL, 0.2], [Math.PI / 2, 0, 0]);
    // back wall
    plane(7.5, CEIL, plaster, [-1.55, CEIL / 2, BACK_Z], [0, 0, 0], [3, 1.2]);
    // right wall with the window opening (four pieces around the hole)
    const rw = (z0: number, z1: number, y0: number, y1: number) => plane(z1 - z0, y1 - y0, plaster, [WALL_X, (y0 + y1) / 2, (z0 + z1) / 2], [0, -Math.PI / 2, 0], [(z1 - z0) / 2.5, (y1 - y0) / 2.4]);
    rw(BACK_Z, WIN.z0, 0, CEIL); rw(WIN.z1, 4, 0, CEIL); rw(WIN.z0, WIN.z1, 0, WIN.y0); rw(WIN.z0, WIN.z1, WIN.y1, CEIL);
    // skirting boards
    const skirt = new THREE.MeshStandardMaterial({ color: '#2a2f33', roughness: 0.6 });
    const sk1 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.12, 0.02), skirt); sk1.position.set(-1.55, 0.06, BACK_Z + 0.01); sk1.receiveShadow = true; scene.add(sk1);
    const sk2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 6.3), skirt); sk2.position.set(WALL_X - 0.01, 0.06, 0.85); sk2.receiveShadow = true; scene.add(sk2);
    // window: deep reveal, frame, cross bars, sill, glass
    const frameM = new THREE.MeshStandardMaterial({ color: '#262c31', roughness: 0.55 });
    const fb = (w: number, h: number, d: number, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameM); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); };
    const zc = (WIN.z0 + WIN.z1) / 2, yc = (WIN.y0 + WIN.y1) / 2, ww = WIN.z1 - WIN.z0, wh = WIN.y1 - WIN.y0;
    const rev = new THREE.MeshStandardMaterial({ color: '#9aa4ab', roughness: 0.95 });
    for (const [z, y, w, h] of [[zc, WIN.y0, ww, 0.0], [zc, WIN.y1, ww, 0.0]] as const) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, w), rev); m.position.set(WALL_X + 0.1, y + (y === WIN.y0 ? -0.01 : 0.01), z); m.receiveShadow = true; scene.add(m); void h; }
    for (const z of [WIN.z0, WIN.z1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, wh, 0.02), rev); m.position.set(WALL_X + 0.1, yc, z + (z === WIN.z0 ? -0.01 : 0.01)); m.castShadow = m.receiveShadow = true; scene.add(m); }
    fb(0.06, wh, 0.06, WALL_X + 0.12, yc, WIN.z0 + 0.03); fb(0.06, wh, 0.06, WALL_X + 0.12, yc, WIN.z1 - 0.03);
    fb(0.06, 0.06, ww, WALL_X + 0.12, WIN.y0 + 0.03, zc); fb(0.06, 0.06, ww, WALL_X + 0.12, WIN.y1 - 0.03, zc);
    fb(0.045, wh, 0.04, WALL_X + 0.12, yc, zc); fb(0.045, 0.04, ww, WALL_X + 0.12, yc + 0.16, zc);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, ww + 0.16), new THREE.MeshStandardMaterial({ color: '#3a3f43', roughness: 0.5 })); sill.position.set(WALL_X - 0.02, WIN.y0 - 0.02, zc); sill.castShadow = sill.receiveShadow = true; scene.add(sill);
    const gc = document.createElement('canvas'); gc.width = 512; gc.height = 600; const glass = gc.getContext('2d')!; const glassTex = new THREE.CanvasTexture(gc); glassTex.colorSpace = THREE.SRGBColorSpace;
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: glassTex, fog: false }));
    gm.position.set(WALL_X + 0.14, yc, zc); gm.rotation.y = -Math.PI / 2; scene.add(gm);
    // lights: night outside through the rain (cool, the only light that reaches the far wall), the lamp (warm), soft sky fill
    scene.add(new THREE.HemisphereLight('#6a8296', '#121518', 0.55));
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const cookie = cc.getContext('2d')!; const cookieTex = new THREE.CanvasTexture(cc); cookieTex.colorSpace = THREE.SRGBColorSpace;
    const moon = new THREE.SpotLight('#9fb4c8', 210, 0, 0.42, 0.55, 2); moon.position.set(4.6, 3.3, -0.45); moon.target.position.set(-0.6, 0.0, -1.15);
    moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); moon.shadow.bias = -0.0005; moon.shadow.radius = 5; moon.shadow.camera.near = 1; moon.shadow.camera.far = 12; moon.map = cookieTex;
    scene.add(moon, moon.target);
    // a faint shaft of the window light in the dusty air: the window's outline swept along the light to the floor
    {
      const Lp = moon.position; const cs = [[WIN.z0, WIN.y0], [WIN.z1, WIN.y0], [WIN.z1, WIN.y1], [WIN.z0, WIN.y1]].map(([z, y]) => new THREE.Vector3(WALL_X, y, z));
      const fl = cs.map((p) => { const sF = -p.y / (p.y - Lp.y); return p.clone().add(p.clone().sub(Lp).multiplyScalar(sF)); });
      const pos: number[] = [], col: number[] = []; const near = new THREE.Color('#3a5068').multiplyScalar(0.05), far = new THREE.Color('#000000');
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; const quad = [cs[i], cs[j], fl[j], cs[i], fl[j], fl[i]]; const cc = [near, near, far, near, far, far];
        quad.forEach((v, k) => { pos.push(v.x, v.y, v.z); col.push(cc[k].r, cc[k].g, cc[k].b); }); }
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const shaft = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      scene.add(shaft);
    }
    const rim = new THREE.DirectionalLight('#7f9fbf', 0.35); rim.position.set(1.5, 3, -4); scene.add(rim);
    const L = lamp(); L.g.position.set(-1.0, 0, -1.5); scene.add(L.g);
    const bulb = L.bulbPos.clone().add(L.g.position);
    const lampLight = new THREE.SpotLight('#ffb36b', 16, 0, 1.12, 0.85, 2); lampLight.position.copy(bulb).add(new THREE.Vector3(0, -0.04, 0)); lampLight.target.position.set(bulb.x + 0.22, 0, bulb.z + 0.12); // nearly straight down: the shade's cut-off curves on the wall
    lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -0.0006; lampLight.shadow.radius = 6; lampLight.shadow.camera.near = 0.05; lampLight.shadow.camera.far = 6;
    scene.add(lampLight, lampLight.target);
    const up = new THREE.SpotLight('#ffbb7a', 2.2, 0, 0.9, 1, 2); up.position.copy(bulb).add(new THREE.Vector3(0, 0.06, 0)); up.target.position.set(bulb.x, CEIL, bulb.z - 0.2); scene.add(up, up.target);
    const fill = new THREE.PointLight('#ff9e5a', 0.9, 3.2, 2); fill.position.copy(bulb).add(new THREE.Vector3(0.1, 0.1, 0.3)); scene.add(fill);
    const g1 = glowSprite('#ffc27a', 0.55, 0.55); g1.position.copy(bulb); scene.add(g1);
    const g2 = glowSprite('#ff9d4d', 2.2, 0.13); g2.position.copy(bulb); scene.add(g2);
    // the puppet on its chair
    const rig = buildPuppet(); const holder = new THREE.Group(); holder.position.copy(PUPPET_AT); holder.rotation.y = PUPPET_YAW; holder.add(rig.root); scene.add(holder);
    applyRec(rig, TK.test[0]); holder.updateMatrixWorld(true);
    const { seatTop, hips } = seatUnder(rig);
    const ch = chair(seatTop); ch.position.set(hips.x, 0, hips.z + 0.07); holder.add(ch); // seatUnder works in the holder's space
    // dust in the lamp's light
    const N = 70, moteBase = new Float32Array(N * 3); const r = rnd(9);
    for (let i = 0; i < N; i++) { moteBase[i * 3] = bulb.x - 0.2 + r() * 1.1; moteBase[i * 3 + 1] = 0.3 + r() * 1.4; moteBase[i * 3 + 2] = bulb.z - 0.4 + r() * 1.0; }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(moteBase.slice(), 3));
    const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: '#ffd9a8', size: 0.007, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(motes);
    void woodMat;
    return { rig, glass, glassTex, cookie, cookieTex, motes, moteBase, lampLight, fill };
  }, [scene, gl]);

  // per frame: pose, rain, dust, camera
  applyRec(S.rig, takeRec(t));
  drawGlass(S.glass, 512, 600, t); S.glassTex.needsUpdate = true;
  drawCookie(S.cookie, 256, t); S.cookieTex.needsUpdate = true;
  const pos = S.motes.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) { const b = i * 3; pos.setXYZ(i, S.moteBase[b] + Math.sin(t * 0.21 + i) * 0.05, S.moteBase[b + 1] + ((t * 0.012 + i * 0.137) % 0.3) - 0.15, S.moteBase[b + 2] + Math.cos(t * 0.17 + i * 1.7) * 0.05); }
  pos.needsUpdate = true;
  const k = eio(clamp(t / TK.meta.dur));
  const cam = camera as THREE.PerspectiveCamera;
  const p0 = new THREE.Vector3(-0.78, 1.34, 3.15), p1 = new THREE.Vector3(-0.22, 1.2, 2.0);
  const a0 = new THREE.Vector3(0.38, 0.95, -1.0), a1 = new THREE.Vector3(0.36, 0.93, -1.12);
  const hand = new THREE.Vector3(Math.sin(t * 0.7) * 0.004 + Math.sin(t * 1.9 + 1) * 0.002, Math.sin(t * 0.9 + 2) * 0.003, 0);
  cam.position.copy(p0).lerp(p1, k).add(hand); cam.lookAt(a0.clone().lerp(a1, k)); cam.fov = 34;
  if (dbg) { cam.position.set(dbg[0], dbg[1], dbg[2]); cam.lookAt(dbg[3], dbg[4], dbg[5]); cam.fov = dbg[6]; } cam.near = 0.05; cam.far = 40; cam.updateProjectionMatrix();
  return null;
};

/* ------------------------------------------------------------------ grade, grain, corner mark */
const Grade: React.FC<{ f: number }> = ({ f }) => {
  const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { document.fonts.load(`500 22px ${SANS}`, '◆ Juno · VIBE知识大赏').catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); vignette(g, 0.6); grain(g, 11 + f, 0.055); mark(g, 0.9); }, [f, ok]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};

export const PuppetTest: React.FC<{ dbg?: number[] }> = ({ dbg }) => {
  const f = useCurrentFrame(); const t = f / 30;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.45, preserveDrawingBuffer: true }} camera={{ fov: 34, near: 0.05, far: 40 }}>
        <Room t={t} dbg={dbg} />
      </ThreeCanvas>
      {/* cool shadows, a little teal in the fog: soft-light wash over the whole frame */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(40,70,80,.35), rgba(20,40,55,.35))', mixBlendMode: 'soft-light' }} />
      <Grade f={f} />
    </AbsoluteFill>
  );
};
