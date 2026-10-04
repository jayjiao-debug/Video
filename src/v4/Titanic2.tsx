import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Vignette, Grain } from '../ui';
import { haloTex } from '../t3/Reveal3D';
import { mulberry } from '../v1/data';
import { GoldTitle } from '../brand/Brand';
import { CornerMark } from '../brand/CornerMark';
import { BOATS, TOTAL_SEATS, IN_WATER } from './boats';

/* 《应该没事吧》 opening: 0 → 24.75 s. Every frame is a pure function of T. */
const b = (i: number) => beats[i];
/* cold open b0-b16 (slow, inside boat No. 1), hook b16-b32, drop b32-b48, title card b48-b56 */
export const OPEN_END = b(56);
const COLD_END = b(16), CARD_OUT = b(16), DROP1 = b(32), CARD_IN = b(48), STORY_END = b(48);
const rnd = (() => { const r = mulberry(1912); return Array.from({ length: 6000 }, () => r()); })();
const win = (T: number, a: number, z: number, fi = 0.35, fo = 0.35) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));


/* ---------------- downloaded assets (Sketchfab, Poly Haven, three.js) ---------------- */
type Assets = { ship: THREE.Group; boat: THREE.Group; env: THREE.Texture; normals: THREE.Texture };
let ASSETS: Assets | null = null;
/** wrap a model so that its longest horizontal axis lies on x, centred, keel at y = 0, length = len */
const normalize = (obj: THREE.Object3D, len: number) => {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const inner = new THREE.Group();
  inner.add(obj);
  if (size.z > size.x) inner.rotation.y = Math.PI / 2;
  const s = len / Math.max(size.x, size.z);
  obj.position.set(-c.x, -box.min.y, -c.z);
  inner.scale.setScalar(s);
  const g = new THREE.Group();
  g.add(inner);
  g.userData = { height: size.y * s, beam: Math.min(size.x, size.z) * s };
  return g;
};
export const loadAssets = async () => {
  if (ASSETS) return ASSETS;
  const gl = new GLTFLoader();
  const [ship, boat, env, normals] = await Promise.all([
    gl.loadAsync(staticFile('models/titanic_s20.glb')),
    gl.loadAsync(staticFile('models/lifeboat_b1.glb')),
    new RGBELoader().loadAsync(staticFile('hdri/satara_night_2k.hdr')),
    new THREE.TextureLoader().loadAsync(staticFile('waternormals.jpg')),
  ]);
  env.mapping = THREE.EquirectangularReflectionMapping;
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
  const dimLines = (root: THREE.Object3D, op: number) => root.traverse((o: any) => {
    if (o.isLine || o.isLineSegments) o.material = new THREE.LineBasicMaterial({ color: '#8a8f99', transparent: true, opacity: op, depthWrite: false });
  });
  dimLines(ship.scene, 0.22); dimLines(boat.scene, 0.0);
  ASSETS = { ship: normalize(ship.scene, SHIP_L), boat: normalize(boat.scene, BOAT_L), env, normals };
  return ASSETS;
};

/* ---------------- the sea: three.js Water shader, time driven by T ---------------- */
const MOON_DIR = new THREE.Vector3(-0.55, 0.42, -0.72).normalize();
export const waveY = (x: number, z: number, T: number) => 0.025 * Math.sin(0.9 * x + 1.3 * T) + 0.018 * Math.sin(1.4 * z - 1.1 * T + 0.7 * x);
const Sea: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  const water = useMemo(() => {
    const w = new Water(new THREE.PlaneGeometry(500, 500), {
      textureWidth: 1024, textureHeight: 1024, waterNormals: a.normals, sunDirection: MOON_DIR.clone(),
      sunColor: 0x1e2638, waterColor: 0x02050b, distortionScale: 0.7, fog: true,
    });
    w.rotation.x = -Math.PI / 2;
    (w.material as THREE.ShaderMaterial).uniforms.size.value = 2.2;
    return w;
  }, [a]);
  (water.material as THREE.ShaderMaterial).uniforms.time.value = T * 0.3;
  return <primitive object={water} />;
};

/* ---------------- sky: 15 April 1912 was moonless and flat calm, the stars unusually bright ---------------- */
const SkyEnv: React.FC<{ a: Assets }> = ({ a }) => {
  const { scene } = useThree();
  scene.background = null;
  scene.environment = a.env; // HDRI kept only as faint image-based light
  (scene as any).environmentIntensity = 0.2;
  const { dome, stars } = useMemo(() => {
    const dm = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 hor = vec3(0.028,0.04,0.07); vec3 zen = vec3(0.008,0.012,0.03); vec3 c = mix(hor, zen, pow(h, 0.45)); if (vP.y < 0.0) c = hor; gl_FragColor = vec4(c, 1.0); }',
    });
    const n = 2600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const r = mulberry(1415);
    for (let i = 0; i < n; i++) {
      const u = r(), v = Math.pow(r(), 0.8);
      const th = u * Math.PI * 2, el = Math.asin(0.02 + 0.98 * v);
      pos.set([Math.cos(th) * Math.cos(el) * 300, Math.sin(el) * 300, Math.sin(th) * Math.cos(el) * 300], i * 3);
      const m = Math.pow(r(), 3.2) * (0.35 + 0.65 * Math.min(1, el * 3));
      const tint = r();
      col.set([m * (0.85 + 0.15 * tint), m * 0.9, m * (1.05 - 0.15 * tint)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pm = new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending });
    return { dome: dm, stars: new THREE.Points(g, pm) };
  }, []);
  return (
    <>
      <mesh material={dome} renderOrder={-1}><sphereGeometry args={[320, 32, 16]} /></mesh>
      <primitive object={stars} />
    </>
  );
};

/* ---------------- the ship (Sketchfab "RMS Titanic", CC-BY) ---------------- */
const SHIP_L = 26, SHIP_Z = -2;
const shipState = (T: number) => {
  const s = easeIn(prog(T, CARD_OUT, DROP1 - 0.3));
  return { tilt: lerp(0.02, 0.3, s), sink: lerp(0, 9, easeIn(prog(T, b(26), DROP1 - 0.1))) + lerp(0, 0.9, s), lights: T < b(29) ? 1 : Math.max(0, 1 - (T - b(29)) * 4) };
};
const Ship: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  const { tilt, sink, lights } = shipState(T);
  const draft = a.ship.userData.height * 0.17;
  if (sink > 9.5) return null;
  return (
    <group position={[0, -draft - sink, SHIP_Z]} rotation={[0, 0, -tilt]}>
      <primitive object={a.ship} />
      {/* warm light spilling from the decks and portholes */}
      {[-9, -4, 1, 6, 10].map((x, i) => (
        <pointLight key={i} position={[x, draft + 0.6, 1.6]} color="#ffcf8a" intensity={2.2 * lights} distance={6} decay={1.6} />
      ))}
      <pointLight position={[0, draft + 1.6, 0]} color="#ffd9a0" intensity={4 * lights} distance={14} decay={1.4} />
    </group>
  );
};

/* ---------------- lifeboats (Sketchfab "Titanic Lifeboat", CC-BY) with a seat overlay ---------------- */
const BOAT_L = 0.9;
/* seat grid fitted inside the real hull: outer half-width at the gunwale, measured from lifeboat_b1.glb (BOAT_L = 0.9) */
const HULL_W: [number, number][] = [[0, 0.136], [0.05, 0.132], [0.1, 0.132], [0.15, 0.122], [0.2, 0.104], [0.25, 0.102], [0.3, 0.078]];
const hullHalf = (x: number) => {
  const ax = Math.abs(x);
  for (let i = 0; i < HULL_W.length - 1; i++) {
    const [x0, w0] = HULL_W[i], [x1, w1] = HULL_W[i + 1];
    if (ax <= x1) return lerp(w0, w1, (ax - x0) / (x1 - x0));
  }
  return HULL_W[HULL_W.length - 1][1];
};
const SEAT_Y = 0.152, SEAT_X = 0.262; // just above the gunwale amidships, clear of the raised bow and stern
const LAYOUTS = new Map<number, { pts: number[][]; tile: number }>();
const seatLayout = (cap: number) => {
  const hit = LAYOUTS.get(cap);
  if (hit) return hit;
  const R = cap <= 40 ? 9 : cap <= 47 ? 10 : 11;
  const xs = Array.from({ length: R }, (_, r) => -SEAT_X + (2 * SEAT_X * (r + 0.5)) / R);
  const ws = xs.map((x) => hullHalf(x) - 0.018);
  const sw = ws.reduce((a, c) => a + c, 0);
  const n = ws.map((w) => Math.max(2, Math.round((cap * w) / sw)));
  let diff = cap - n.reduce((a, c) => a + c, 0);
  const byW = xs.map((_, r) => r).sort((a, c) => ws[c] - ws[a]);
  for (let k = 0; diff !== 0; k = (k + 1) % R) { const r = diff > 0 ? byW[k] : byW[R - 1 - k]; n[r] += Math.sign(diff); diff -= Math.sign(diff); }
  const rowPitch = (2 * SEAT_X) / R;
  const colPitch = Math.min(...ws.map((w, r) => (2 * w) / n[r]));
  const tile = Math.min(rowPitch, colPitch) * 0.74;
  const pts: number[][] = [];
  xs.forEach((x, r) => {
    const half = ws[r] - tile / 2, c = n[r];
    for (let k = 0; k < c; k++) pts.push([x, c === 1 ? 0 : -half + (2 * half * k) / (c - 1)]);
  });
  const out = { pts, tile };
  LAYOUTS.set(cap, out);
  return out;
};
type Placed = { x: number; y?: number; z: number; rot: number; scale: number; cap: number; occ: number; appear: number; fill: number; float: boolean };
const SEAT_OFF = new THREE.Color('#4a5670'), SEAT_EMPTY = new THREE.Color('#86b8ff'), SEAT_ON = new THREE.Color('#ffcf6e');
const Boats: React.FC<{ T: number; placed: Placed[]; a: Assets; emptyPulse: number }> = ({ T, placed, a, emptyPulse }) => {
  const total = placed.reduce((s, p) => s + p.cap, 0);
  const hulls = useMemo(() => placed.map(() => a.boat.clone(true)), [a, placed]);
  const { seats, glows } = useMemo(() => {
    const sm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.006, 0.04), new THREE.MeshBasicMaterial({ toneMapped: false }), total);
    sm.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(total * 3), 3);
    const hg = new THREE.PlaneGeometry(1, 1); hg.rotateX(-Math.PI / 2);
    const gm = new THREE.InstancedMesh(hg, new THREE.MeshBasicMaterial({ map: haloTex(), color: '#ffc46a', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), total);
    return { seats: sm, glows: gm };
  }, [total]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  const h = a.boat.userData.height, beam = a.boat.userData.beam;
  let k = 0;
  placed.forEach((p, bi) => {
    const ap = easeOut(prog(T, p.appear, p.appear + 0.35));
    const bob = p.float ? waveY(p.x, p.z, T) : 0;
    const base = (p.y ?? -h * 0.42 * p.scale) + bob;
    const hull = hulls[bi];
    hull.position.set(p.x, base - (1 - ap) * 0.6, p.z);
    hull.rotation.set(p.float ? 0.015 * Math.sin(T * 1.0 + bi) : 0, p.rot, p.float ? 0.02 * Math.sin(T * 0.9 + bi * 2) : 0);
    hull.scale.setScalar(Math.max(0.0001, p.scale));
    hull.visible = ap > 0.01;
    const { pts, tile } = seatLayout(p.cap);
    const ts = tile / 0.04;
    const rank = pts.map((_, j) => j).sort((u, v) => rnd[(bi * 97 + u) % 5000] - rnd[(bi * 97 + v) % 5000]);
    const order: number[] = []; rank.forEach((si, r) => (order[si] = r));
    const cos = Math.cos(p.rot), sin = Math.sin(p.rot);
    pts.forEach(([lx, lz], si) => {
      const wx = p.x + (lx * cos + lz * sin) * p.scale, wz = p.z + (-lx * sin + lz * cos) * p.scale;
      const r = order[si];
      const filled = r < p.occ ? easeOut(prog(T, p.fill + r * 0.012, p.fill + r * 0.012 + 0.2)) : 0;
      const empty = r >= p.occ;
      o.position.set(wx, base + SEAT_Y * p.scale, wz); o.rotation.set(0, p.rot, 0); o.scale.set(Math.max(0.0001, p.scale * ap * ts), Math.max(0.0001, p.scale * ap), Math.max(0.0001, p.scale * ap * ts)); o.updateMatrix();
      seats.setMatrixAt(k, o.matrix);
      c.copy(SEAT_OFF).lerp(SEAT_ON, filled);
      if (empty) c.copy(SEAT_OFF).lerp(SEAT_EMPTY, emptyPulse * (0.88 + 0.12 * Math.sin(T * 2.2)));
      seats.setColorAt(k, c);
      o.position.y += 0.012 * p.scale; o.scale.set(Math.max(0.0001, 2.2 * tile * p.scale * filled), 1, Math.max(0.0001, 2.2 * tile * p.scale * filled)); o.updateMatrix();
      glows.setMatrixAt(k, o.matrix);
      k++;
    });
  });
  seats.instanceMatrix.needsUpdate = true; glows.instanceMatrix.needsUpdate = true;
  if (seats.instanceColor) seats.instanceColor.needsUpdate = true;
  return (<>{hulls.map((hl, i) => <primitive key={i} object={hl} />)}<primitive object={seats} /><primitive object={glows} /></>);
};

/* cold open: lifeboat No. 1 hanging from its falls beside the hull: 40 seats, 12 taken */
const B1 = { x: 6.0, y: 2.08, z: SHIP_Z + 1.8 };
const boat1Y = (T: number) => lerp(B1.y, 0.95, easeInOut(prog(T, b(12), COLD_END + 0.3)));
const Boat1: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  const placed = useMemo<Placed[]>(() => [{ x: 0, y: 0, z: 0, rot: 0, scale: 1, cap: 40, occ: 12, appear: -1, fill: 0.15, float: false }], []);
  if (T > b(20)) return null;
  const pulse = easeInOut(prog(T, b(4), b(4) + 0.4));
  return (
    <group position={[B1.x, boat1Y(T), B1.z]}>
      <Boats T={T} placed={placed} a={a} emptyPulse={pulse} />
      {[-0.34, 0.34].map((dx) => (
        <mesh key={dx} position={[dx, 0.1 + (B1.y + 1.0 - boat1Y(T)) / 2, 0]}><cylinderGeometry args={[0.003, 0.003, B1.y + 0.8 - boat1Y(T), 6]} /><meshStandardMaterial color="#c8bca2" /></mesh>
      ))}
      <pointLight position={[0.2, 0.5, 0.25]} color="#ffcf8a" intensity={1.4} distance={2.4} decay={1.6} />
    </group>
  );
};

/* the hook: all twenty boats on the water, in launch order */
const HOOK_SCALE = 1.7;
const HOOK: Placed[] = BOATS.map((bt, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  const beat = 17 + Math.floor((i * 12) / 20);
  return { x: -4.1 + col * 2.05, z: 0.9 + row * 0.95, rot: 0, scale: HOOK_SCALE, cap: bt.cap, occ: bt.occ, appear: b(beat), fill: b(beat) + 0.1, float: true };
});
const HookBoats: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  if (T < CARD_OUT - 0.3) return null;
  return <Boats T={T} placed={HOOK} a={a} emptyPulse={easeInOut(prog(T, b(28), b(28) + 0.5))} />;
};

/* the drop: people in the water where the ship went down */
const Swimmers: React.FC<{ T: number }> = ({ T }) => {
  const { dots, halos, pos } = useMemo(() => {
    const n = IN_WATER;
    const p: number[][] = [];
    for (let i = 0; i < n; i++) {
      const ang = rnd[i] * Math.PI * 2, rr = Math.sqrt(-2 * Math.log(1 - 0.995 * rnd[i + 2000])) * 1.5;
      p.push([Math.cos(ang) * rr * 2.2, Math.sin(ang) * rr * 0.7 - 2.6, rnd[i + 4000]]);
    }
    const hg = new THREE.PlaneGeometry(1, 1); hg.rotateX(-Math.PI / 2);
    return {
      pos: p,
      dots: new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshBasicMaterial({ color: '#f4ead8', toneMapped: false }), n),
      halos: new THREE.InstancedMesh(hg, new THREE.MeshBasicMaterial({ map: haloTex(), color: '#ffd9a0', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), n),
    };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  if (T < DROP1 - 0.05) return null;
  pos.forEach(([x, z, d], i) => {
    const ap = easeOut(prog(T, DROP1 + d * 0.9, DROP1 + d * 0.9 + 0.25));
    const y = waveY(x, z, T) + 0.03;
    o.position.set(x, y, z); o.rotation.set(0, 0, 0); o.scale.setScalar(Math.max(0.0001, ap)); o.updateMatrix();
    dots.setMatrixAt(i, o.matrix);
    o.position.set(x, y + 0.01, z); o.scale.set(Math.max(0.0001, ap * 0.3), 1, Math.max(0.0001, ap * 0.3)); o.updateMatrix();
    halos.setMatrixAt(i, o.matrix);
  });
  dots.instanceMatrix.needsUpdate = true; halos.instanceMatrix.needsUpdate = true;
  return (<><primitive object={dots} /><primitive object={halos} /></>);
};

/* ---------------- camera ---------------- */
type Key = [number, number[], number[]];
const KEYS: Key[] = [
  [0.0, [B1.x + 0.12, B1.y + 1.25, B1.z + 0.62], [B1.x, B1.y + 0.12, B1.z]],
  [b(8), [B1.x + 0.3, B1.y + 1.05, B1.z + 0.8], [B1.x - 0.02, B1.y + 0.12, B1.z]],
  [b(12), [B1.x + 0.55, B1.y + 0.95, B1.z + 1.3], [B1.x - 0.05, B1.y + 0.1, B1.z]],
  [COLD_END + 0.4, [B1.x + 5, 2.6, B1.z + 8.5], [2.0, 1.2, SHIP_Z]],
  [b(20), [0, 7.6, 14.2], [0, 1.2, 2.2]],
  [b(28), [0, 7.3, 13.6], [0, 1.2, 2.2]],
  [DROP1, [0, 8.4, 12.6], [0, 0, 2.0]],
  [b(36), [0, 7.0, 10.9], [0, 0, 1.3]],
  [b(40), [0, 7.6, 11.8], [0, 0, 1.8]],
  [STORY_END, [0, 9.2, 13.4], [0, 0, 2.3]],
  [OPEN_END, [0, 9.6, 13.8], [0, 0, 2.4]],
];
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i], [tb, pb, lb] = KEYS[i + 1];
  const k = easeInOut(prog(T, ta, tb));
  const dy = boat1Y(T) - B1.y; // the first two keys ride down with boat No. 1
  const off = (ix: number, v: number[]) => (ix <= 2 ? [v[0], v[1] + dy, v[2]] : v);
  const A = off(i, pa), B = off(i + 1, pb), LA = off(i, la), LB = off(i + 1, lb);
  return { pos: A.map((x, j) => lerp(x, B[j], k)), look: LA.map((x, j) => lerp(x, LB[j], k)) };
};
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

const Scene: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  const flare = T >= DROP1 ? 1.2 * Math.exp(-(T - DROP1) * 2) : 0;
  const pre = 1 - 0.45 * easeInOut(prog(T, b(30), DROP1)) * (T < DROP1 ? 1 : 0);
  return (
    <>
      <CamRig T={T} />
      <SkyEnv a={a} />
      <fog attach="fog" args={['#070b16', 30, 120]} />
      <ambientLight intensity={0.12 * pre * (1 + flare)} color="#5a6a98" />
      <directionalLight position={[MOON_DIR.x * 50, MOON_DIR.y * 50, MOON_DIR.z * 50]} intensity={0.6 * pre * (1 + flare)} color="#c9d6f5" />
      <directionalLight position={[10, 12, 20]} intensity={0.16 * pre} color="#8fa6d8" />
      <Sea T={T} a={a} />
      <Ship T={T} a={a} />
      <Boat1 T={T} a={a} />
      <HookBoats T={T} a={a} />
      <Swimmers T={T} />
    </>
  );
};

/* ---------------- 2D: lifebuoy title, subtitles, counters ---------------- */
const LifebuoyTitle: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  const s = f / 30;
  const inP = prog(f, 0, 6), out = prog(f, dur - 14, dur);
  const drop = easeOut(prog(s, 0.05, 0.9));
  const bob = Math.sin(s * 3.2) * 6 * drop;
  const rot = lerp(-40, 0, drop);
  const ring = (cx: number, cy: number, R: number, r: number) => {
    const segs = Array.from({ length: 8 }, (_, i) => {
      const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
      const P = (a: number, rad: number) => `${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad}`;
      return <path key={i} d={`M ${P(a0, R)} A ${R} ${R} 0 0 1 ${P(a1, R)} L ${P(a1, r)} A ${r} ${r} 0 0 0 ${P(a0, r)} Z`} fill={i % 2 ? '#efe9dc' : '#c8322c'} />;
    });
    return segs;
  };
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id="lt-bg" cx="50%" cy="40%" r="75%"><stop offset="0" stopColor="#14243c" /><stop offset="1" stopColor="#04060b" /></radialGradient>
          <radialGradient id="lt-sh" cx="50%" cy="50%" r="50%"><stop offset="0.6" stopColor="#000" stopOpacity="0.5" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#lt-bg)" />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M -20 ${640 + i * 34} Q 480 ${630 + i * 34 + Math.sin(s * 1.5 + i) * 8} 960 ${640 + i * 34} T 1940 ${640 + i * 34}`} stroke="#29466e" strokeWidth={1.4} fill="none" opacity={0.25 + 0.03 * i} />
        ))}
        <text x={960} y={150} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={0.9 * prog(f, 6, 22)}>
          NORMALCY BIAS · R.M.S. TITANIC · 1912
        </text>
        <g transform={`translate(960, ${300 + bob}) rotate(${rot})`} opacity={drop}>
          <circle r={152} fill="url(#lt-sh)" transform="translate(10, 14)" />
          {ring(0, 0, 140, 84)}
          <circle r={140} fill="none" stroke="#7a1f1a" strokeWidth={3} />
          <circle r={84} fill="none" stroke="#7a1f1a" strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            return <path key={i} d={`M ${Math.cos(a - 0.16) * 146} ${Math.sin(a - 0.16) * 146} Q ${Math.cos(a) * 168} ${Math.sin(a) * 168} ${Math.cos(a + 0.16) * 146} ${Math.sin(a + 0.16) * 146}`} stroke="#e6dcc4" strokeWidth={6} fill="none" />;
          })}
        </g>
        <GoldTitle text="应该没事吧" f={f} at={20} size={128} y={640} />
        <text x={960} y={760} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 42, fill: '#f3ede2', letterSpacing: '0.1em' }} opacity={prog(f, 50, 66)}>危险来的时候，你会先跑吗？</text>
        <text x={960} y={806} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.5)' }} opacity={prog(f, 56, 72)}>When danger comes, do you move first?</text>
      </svg>
      <Grain />
    </AbsoluteFill>
  );
};
export const GOLD_TEXT: React.CSSProperties = { color: '#f6cf78', textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 12px rgba(0,0,0,0.9)' };
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
    seg.startsWith('[') ? <span key={i} style={GOLD_TEXT}>{seg.slice(1, -1)}</span>
      : seg.startsWith('{') ? <span key={i} style={{ color: '#ff6a5c' }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
export const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.35)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.45))) * 12;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 880 - 56 * 0.62, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: 56, fontWeight: 700, color: '#f6efe1', letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, color: 'rgba(243,237,226,0.42)', marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};
export const Chapter: React.FC<{ T: number; at: number; out: number; text: string }> = ({ T, at, out, text }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.5)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const w = 70 * easeOut(prog(T, at, at + 0.7));
  return (
    <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: o }}>
      <div style={{ width: w, height: 1.5, background: 'rgba(241,197,109,0.7)' }} />
      <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, letterSpacing: '0.18em', color: '#f1c56d', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{text}</div>
      <div style={{ width: w, height: 1.5, background: 'rgba(241,197,109,0.7)' }} />
    </div>
  );
};
const Stat: React.FC<{ T: number; at: number; out: number; value: number; label: string; top: number; gold?: boolean }> = ({ T, at, out, value, label, top, gold }) => {
  const o = win(T, at, out, 0.4, 0.3);
  if (o <= 0) return null;
  const n = Math.round(value * easeInOut(prog(T, at, at + 1.6)));
  return (
    <div style={{ position: 'absolute', top, right: 64, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 78, lineHeight: 1, color: gold ? '#f6cf78' : '#f3ede2', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{n.toLocaleString('en-US')}</div>
      <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.65)', marginTop: 6, letterSpacing: '0.12em' }}>{label}</div>
    </div>
  );
};

/* the cold-open tally: 12 of 40 seats taken */
const Tally: React.FC<{ T: number }> = ({ T }) => {
  const o = Math.min(easeOut(prog(T, b(4), b(4) + 0.4)), 1 - prog(T, b(12) - 0.3, b(12)));
  if (o <= 0) return null;
  const k = 1;
  const n = Math.round(12 * easeOut(prog(T, b(4), b(4) + 0.8)));
  return (
    <div style={{ position: 'absolute', top: 120, right: 72, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: ZH, fontSize: 24, letterSpacing: '0.16em', color: 'rgba(243,237,226,0.7)' }}>1 号救生艇</div>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 96, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
        <span style={k > 0 ? GOLD_TEXT : { color: '#f3ede2' }}>{n}</span>
        <span style={{ color: 'rgba(243,237,226,0.55)', fontSize: 60 }}> / 40</span>
      </div>
      <div style={{ fontFamily: ZH, fontSize: 24, letterSpacing: '0.12em', color: '#9cc2ff', opacity: easeOut(prog(T, b(5), b(5) + 0.4)), marginTop: 4 }}>空着 28 个座位</div>
    </div>
  );
};

type Line = [number, number, string, string];
const LINES: Line[] = [
  [0.4, b(4) - 0.08, '泰坦尼克号的1号救生艇，40个座位', "Titanic's lifeboat No. 1 had 40 seats."],
  [b(4) + 0.06, b(8) - 0.1, '只坐了[12]个人', 'Twelve people got in.'],
  [b(8) + 0.06, b(12) - 0.1, '船在沉，船上还有两千多人', 'The ship was sinking. Over two thousand people were still aboard.'],
  [b(12) + 0.06, COLD_END - 0.08, '它为什么[没坐满]？', 'So why was it not full?'],
  [CARD_OUT + 0.06, b(24) - 0.08, '20艘救生艇，一共1178个座位', 'Twenty lifeboats. 1,178 seats.'],
  [b(24) + 0.06, DROP1 - 0.08, '放下去的时候，空着[400多个]', 'More than 400 of them left empty.'],
  [DROP1 + 0.12, b(40) - 0.08, '同一时刻，水里有1500多人', 'At the same time, more than 1,500 people were in the water.'],
  [b(40) + 0.06, STORY_END - 0.1, '不是座位不够，是很多人{不肯上船}', "It wasn't the seats. Many people wouldn't get in."],
];

export const TitanicOpen2: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [assets, setAssets] = useState<Assets | null>(ASSETS);
  const [handle] = useState(() => delayRender('fonts and models', { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    loadAssets().then(setAssets);
  }, []);
  useEffect(() => {
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '0123应该没事吧').catch(() => null))).then(() => setReady(true));
  }, []);
  useEffect(() => { if (ready && assets) continueRender(handle); }, [ready, assets, handle]);
  const cardF = Math.round(CARD_IN * fps), cardLen = Math.round((OPEN_END - CARD_IN) * fps);
  const markO = Math.min(easeOut(prog(T, 0.3, 1.0)), 1 - prog(T, CARD_IN, CARD_IN + 0.15));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {ready && assets && (
        <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
          camera={{ fov: 34, near: 0.03, far: 400, position: [0, 10, 10] }}>
          <Scene T={T} a={assets} />
        </ThreeCanvas>
      )}
      {/* cold open: a night spotlight on boat No. 1, everything else falls into the dark */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - easeInOut(prog(T, b(12), COLD_END + 0.3)), background: 'radial-gradient(ellipse 46% 50% at 50% 50%, rgba(3,5,10,0) 0%, rgba(3,5,10,0.25) 55%, rgba(3,5,10,0.82) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 620, height: 420, opacity: Math.min(easeOut(prog(T, b(4), b(4) + 0.4)), 1 - prog(T, b(12) - 0.3, b(12))), background: 'radial-gradient(ellipse 70% 70% at 85% 30%, rgba(3,5,10,0.85) 0%, rgba(3,5,10,0.5) 50%, rgba(3,5,10,0) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.6) 50%, rgba(5,7,13,0.82) 100%)' }} />
      <Chapter T={T} at={0.3} out={COLD_END - 0.1} text="1912 · 北 大 西 洋" />
      <Tally T={T} />
      <Chapter T={T} at={CARD_OUT + 0.2} out={STORY_END} text="凌 晨 0:40 — 2:20" />
      <Stat T={T} at={CARD_OUT + 0.3} out={DROP1 - 0.1} value={TOTAL_SEATS} label="救生艇座位" top={110} />
      <Stat T={T} at={b(24) + 0.2} out={DROP1 - 0.1} value={414} label="放下时空着" top={250} gold />
      <Stat T={T} at={DROP1 + 0.2} out={STORY_END - 0.1} value={1500} label="人在水里" top={110} />
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      <CornerMark o={markO} />
      <Sequence from={cardF} durationInFrames={cardLen}>
        <LifebuoyTitle f={frame - cardF} dur={cardLen} />
      </Sequence>
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};
export const OPEN_FRAMES2 = Math.round(OPEN_END * 30);
export { clamp };
