import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Sequence, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { Vignette, Grain } from '../ui';
import { haloTex } from '../t3/Reveal3D';
import { mulberry } from '../v1/data';
import { GoldTitle } from '../brand/Brand';
import { CornerMark } from '../brand/CornerMark';
import { BOATS, TOTAL_SEATS, IN_WATER } from './boats';

/* 《应该没事吧》 opening: 0 → 24.75 s. Every frame is a pure function of T. */
const b = (i: number) => beats[i];
export const OPEN_END = b(48);
const CARD_IN = b(8), CARD_OUT = b(16), DROP1 = b(32);
const rnd = (() => { const r = mulberry(1912); return Array.from({ length: 6000 }, () => r()); })();
const win = (T: number, a: number, z: number, fi = 0.35, fo = 0.35) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));

/* ---------------- the sea: Gerstner waves on the CPU, deterministic in T ---------------- */
const WAVES = [
  { dir: [1, 0.3], amp: 0.06, len: 6.5, sp: 1.0 }, { dir: [0.4, 1], amp: 0.035, len: 3.2, sp: 1.2 },
  { dir: [-0.7, 0.6], amp: 0.02, len: 1.7, sp: 1.5 }, { dir: [0.9, -0.5], amp: 0.012, len: 0.9, sp: 1.9 },
].map((w) => { const n = Math.hypot(w.dir[0], w.dir[1]); return { ...w, dx: w.dir[0] / n, dz: w.dir[1] / n, k: (2 * Math.PI) / w.len }; });
export const waveY = (x: number, z: number, T: number) =>
  WAVES.reduce((y, w) => y + w.amp * Math.sin(w.k * (w.dx * x + w.dz * z) - w.sp * w.k * T * 0.6), 0);
const Sea: React.FC<{ T: number }> = ({ T }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 90, 220, 220);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, waveY(pos.getX(i), pos.getZ(i), T));
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[0, 0, 4]}>
      <meshStandardMaterial color="#0a1524" roughness={0.42} metalness={0.15} />
    </mesh>
  );
};

/* ---------------- sky: stars and a moon ---------------- */
const Sky: React.FC = () => {
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p: number[] = [];
    for (let i = 0; i < 1400; i++) {
      const th = rnd[i] * Math.PI * 2, ph = 0.05 + rnd[i + 1400] * 1.35;
      p.push(Math.cos(th) * Math.cos(ph) * 120, Math.sin(ph) * 120, Math.sin(th) * Math.cos(ph) * 120);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <>
      <points geometry={stars}><pointsMaterial color="#dfe7ff" size={0.35} sizeAttenuation transparent opacity={0.85} fog={false} /></points>
      <sprite position={[-55, 38, -80]} scale={[30, 30, 1]}>
        <spriteMaterial map={haloTex()} color="#e9edf6" transparent opacity={0.55} depthWrite={false} fog={false} />
      </sprite>
      <mesh position={[-55, 38, -80.5]}><circleGeometry args={[3.6, 48]} /><meshBasicMaterial color="#f1ede2" fog={false} /></mesh>
    </>
  );
};

/* ---------------- the ship: a side-profile extrusion, four funnels, lit portholes ---------------- */
const SHIP_L = 26, SHIP_B = 2.8;
const shipState = (T: number) => {
  // sinking through the hook: bow down, then gone just before the drop
  const s = easeIn(prog(T, CARD_OUT, DROP1 - 0.3));
  return { tilt: lerp(0.035, 0.32, s), sink: lerp(0, 9, easeIn(prog(T, b(26), DROP1 - 0.1))) + lerp(0, 0.9, s), lights: T < b(29) ? 1 : Math.max(0, 1 - (T - b(29)) * 4) };
};
const Ship: React.FC<{ T: number }> = ({ T }) => {
  const parts = useMemo(() => {
    const prof = new THREE.Shape();
    const L = SHIP_L, h = 1.9;
    prof.moveTo(-L / 2, -1.3);
    prof.lineTo(L / 2 - 1.2, -1.3);
    prof.quadraticCurveTo(L / 2, -1.0, L / 2 + 0.15, h);
    prof.lineTo(-L / 2 + 0.6, h);
    prof.quadraticCurveTo(-L / 2 - 0.4, h - 0.2, -L / 2 - 0.2, 0.2);
    prof.closePath();
    const hull = new THREE.ExtrudeGeometry(prof, { depth: SHIP_B, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.25, bevelSegments: 3 });
    hull.translate(0, 0, -SHIP_B / 2);
    // portholes on both sides: three rows
    const ph: number[][] = [];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 70; i++) {
      const x = -L / 2 + 1.2 + i * ((L - 2.6) / 69);
      if (rnd[row * 70 + i + 3000] < 0.18) continue;
      for (const side of [1, -1]) ph.push([x, 0.15 + row * 0.42, side * (SHIP_B / 2 + 0.26)]);
    }
    const im = new THREE.InstancedMesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: '#ffd796' }), ph.length);
    const o = new THREE.Object3D();
    ph.forEach(([x, y, z], i) => { o.position.set(x, y, z); o.rotation.set(0, z > 0 ? 0 : Math.PI, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    return { hull, ports: im };
  }, []);
  const { tilt, sink, lights } = shipState(T);
  (parts.ports.material as THREE.MeshBasicMaterial).color.set(new THREE.Color('#ffd796').multiplyScalar(0.15 + 0.85 * lights));
  if (sink > 8.8) return null;
  return (
    <group position={[0, 1.15 - sink, -2]} rotation={[0, 0, -tilt]}>
      <mesh geometry={parts.hull} castShadow receiveShadow>
        <meshStandardMaterial color="#121418" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* white upper band and the superstructure */}
      <mesh position={[0.4, 1.75, 0]}><boxGeometry args={[SHIP_L - 2, 0.3, SHIP_B + 0.52]} /><meshStandardMaterial color="#d9d4c6" roughness={0.7} /></mesh>
      <mesh position={[0.6, 2.25, 0]}><boxGeometry args={[SHIP_L * 0.62, 0.7, SHIP_B * 0.8]} /><meshStandardMaterial color="#d6d0c0" roughness={0.75} /></mesh>
      {[-4.5, -1.4, 1.7, 4.8].map((x, i) => (
        <group key={i} position={[x, 3.6, 0]} rotation={[0, 0, 0.12]}>
          <mesh><cylinderGeometry args={[0.55, 0.62, 2.4, 24]} /><meshStandardMaterial color="#c9a36a" roughness={0.6} /></mesh>
          <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.57, 0.57, 0.4, 24]} /><meshStandardMaterial color="#111" /></mesh>
        </group>
      ))}
      {/* masts and the deck-light strings */}
      {[-10.5, 10.5].map((x, i) => <mesh key={i} position={[x, 4.4, 0]}><cylinderGeometry args={[0.05, 0.07, 5.2, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>)}
      <primitive object={parts.ports} />
      <pointLight position={[0, 1.2, SHIP_B / 2 + 1]} color="#ffcf8a" intensity={6 * lights} distance={14} decay={1.4} />
      <pointLight position={[0, 1.2, -SHIP_B / 2 - 1]} color="#ffcf8a" intensity={3 * lights} distance={10} decay={1.4} />
    </group>
  );
};

/* ---------------- lifeboats: hull + a grid of seats; people on the occupied ones ---------------- */
const boatShape = (len: number, beam: number) => {
  const s = new THREE.Shape();
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = -1 + (2 * i) / N;
    const w = (beam / 2) * Math.pow(Math.max(0, 1 - t * t), 0.62);
    if (i === 0) s.moveTo(t * len / 2, w); else s.lineTo(t * len / 2, w);
  }
  for (let i = N; i >= 0; i--) {
    const t = -1 + (2 * i) / N;
    s.lineTo(t * len / 2, -(beam / 2) * Math.pow(Math.max(0, 1 - t * t), 0.62));
  }
  return s;
};
const boatGeo = (len: number, beam: number, depth: number) => {
  const g = new THREE.ExtrudeGeometry(boatShape(len, beam), { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
  g.rotateX(Math.PI / 2); // shape plane (x, y) -> (x, z); extrusion goes down
  return g;
};
const seatLayout = (cap: number, len: number, beam: number) => {
  // rows along the boat, as many across as fit; returns local [x, z]
  const across = cap >= 60 ? 5 : 4;
  const rows = Math.ceil(cap / across);
  const pts: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const t = -0.78 + (1.56 * (r + 0.5)) / rows;
    const half = (beam / 2) * Math.pow(Math.max(0, 1 - t * t), 0.62) * 0.78;
    const n = Math.min(across, cap - pts.length);
    for (let c = 0; c < n; c++) pts.push([t * len / 2, n === 1 ? 0 : -half + (2 * half * c) / (n - 1)]);
  }
  return pts;
};
type Placed = { x: number; z: number; rot: number; scale: number; cap: number; occ: number; appear: number; fill: number };
const BOAT_L = 0.9, BOAT_B = 0.27, BOAT_D = 0.1;
const SEAT_OFF = new THREE.Color('#3a4258'), SEAT_EMPTY = new THREE.Color('#8a96b4'), SEAT_ON = new THREE.Color('#f1c56d');
const Boats: React.FC<{ T: number; placed: Placed[]; people: number; emptyPulse: number }> = ({ T, placed, people, emptyPulse }) => {
  const total = placed.reduce((a, p) => a + p.cap, 0);
  const { hulls, inner, seats, heads, bodies } = useMemo(() => {
    const hg = boatGeo(BOAT_L, BOAT_B, BOAT_D);
    const ig = new THREE.ShapeGeometry(boatShape(BOAT_L * 0.94, BOAT_B * 0.86));
    ig.rotateX(-Math.PI / 2);
    const mk = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number, colors = false) => {
      const im = new THREE.InstancedMesh(geo, mat, n);
      if (colors) im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      return im;
    };
    return {
      hulls: mk(hg, [new THREE.MeshStandardMaterial({ color: '#5a3e26', roughness: 0.85 }), new THREE.MeshStandardMaterial({ color: '#d9d3c4', roughness: 0.6 })] as unknown as THREE.Material, placed.length),
      inner: mk(ig, new THREE.MeshBasicMaterial({ color: '#3a2a1c' }), placed.length),
      seats: mk(new THREE.BoxGeometry(0.036, 0.01, 0.036), new THREE.MeshBasicMaterial({ toneMapped: false }), total, true),
      heads: mk(new THREE.SphereGeometry(0.014, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8c3a0', roughness: 0.7 }), total),
      bodies: mk(new THREE.CapsuleGeometry(0.016, 0.028, 4, 8), new THREE.MeshStandardMaterial({ color: '#3a3330', roughness: 0.9 }), total, true),
    };
  }, [placed.length, total]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  let k = 0;
  placed.forEach((p, bi) => {
    const a = easeOut(prog(T, p.appear, p.appear + 0.35));
    const bob = waveY(p.x, p.z, T);
    const s = Math.max(0.0001, p.scale * a);
    o.position.set(p.x, 0.05 + bob, p.z); o.rotation.set(0, p.rot, 0); o.scale.setScalar(s); o.updateMatrix();
    hulls.setMatrixAt(bi, o.matrix);
    o.scale.setScalar(0.0001); o.updateMatrix();
    inner.setMatrixAt(bi, o.matrix);
    const pts = seatLayout(p.cap, BOAT_L, BOAT_B);
    const rank = pts.map((_, j) => j).sort((u, v) => rnd[(bi * 97 + u) % 5000] - rnd[(bi * 97 + v) % 5000]);
    const order: number[] = []; rank.forEach((si, r) => (order[si] = r));
    const cos = Math.cos(p.rot), sin = Math.sin(p.rot);
    pts.forEach(([lx, lz], si) => {
      const wx = p.x + (lx * cos + lz * sin) * p.scale, wz = p.z + (-lx * sin + lz * cos) * p.scale;
      const r = order[si];
      const filled = r < p.occ ? easeOut(prog(T, p.fill + r * 0.012, p.fill + r * 0.012 + 0.2)) : 0;
      const isEmpty = r >= p.occ;
      o.position.set(wx, 0.05 + 0.016 * p.scale + bob, wz); o.rotation.set(0, p.rot, 0); o.scale.setScalar(Math.max(0.0001, p.scale * a)); o.updateMatrix();
      seats.setMatrixAt(k, o.matrix);
      c.copy(SEAT_OFF).lerp(SEAT_ON, filled);
      if (isEmpty) c.copy(SEAT_OFF).lerp(SEAT_EMPTY, emptyPulse * (0.6 + 0.4 * Math.sin(T * 5 + si)));
      seats.setColorAt(k, c);
      const show = filled * people;
      o.position.set(wx, 0.05 + 0.04 * p.scale + bob, wz); o.scale.setScalar(Math.max(0.0001, p.scale * show)); o.updateMatrix();
      bodies.setMatrixAt(k, o.matrix);
      bodies.setColorAt(k, c.set(['#3a3330', '#4a3a2a', '#2f3542', '#5a3a3a'][si % 4]));
      o.position.set(wx, 0.05 + 0.078 * p.scale + bob, wz); o.updateMatrix();
      heads.setMatrixAt(k, o.matrix);
      k++;
    });
  });
  for (const im of [hulls, inner, seats, heads, bodies]) {
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }
  return (<><primitive object={hulls} /><primitive object={inner} /><primitive object={seats} /><primitive object={bodies} /><primitive object={heads} /></>);
};

/* cold open: lifeboat No. 1 hanging from its davits beside the hull, 40 seats, 12 people */
const B1 = { x: 6.2, y: 2.85, z: -2 + SHIP_B / 2 + 0.55 };
const boat1At = (T: number) => ({ ...B1, y: lerp(B1.y, 1.9, easeInOut(prog(T, 2.6, CARD_IN + 0.3))) });
const Boat1: React.FC<{ T: number }> = ({ T }) => {
  if (T > CARD_IN + 0.4) return null;
  const p = boat1At(T);
  const placed: Placed[] = [{ x: 0, z: 0, rot: 0, scale: 1, cap: 40, occ: 12, appear: -1, fill: 0.15 }];
  const pulse = easeInOut(prog(T, b(4), b(4) + 0.4));
  return (
    <group position={[p.x, p.y - 0.05, p.z]}>
      <Boats T={T} placed={placed} people={1} emptyPulse={pulse} />
      {/* davit ropes */}
      {[-0.36, 0.36].map((dx) => (
        <mesh key={dx} position={[dx, 1.6, 0]}><cylinderGeometry args={[0.004, 0.004, 3.2, 6]} /><meshStandardMaterial color="#b8ab90" /></mesh>
      ))}
      {/* the officer's lantern */}
      <sprite position={[0.3, 0.2, 0.08]} scale={[0.35, 0.35, 1]}>
        <spriteMaterial map={haloTex()} color="#ffcf8a" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <pointLight position={[0.3, 0.25, 0.1]} color="#ffcf8a" intensity={1.8} distance={2.2} decay={1.6} />
    </group>
  );
};

/* the hook: all twenty boats on the water in two rows, in launch order */
const HOOK_SCALE = 1.7;
const HOOK: Placed[] = BOATS.map((bt, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  const beat = 17 + Math.floor((i * 12) / 20); // boats land across beats 17..28
  return { x: -4.1 + col * 2.05, z: 2.5 + row * 1.12, rot: 0, scale: HOOK_SCALE, cap: bt.cap, occ: bt.occ, appear: b(beat), fill: b(beat) + 0.1 };
});
const HookBoats: React.FC<{ T: number }> = ({ T }) => {
  if (T < CARD_OUT - 0.3) return null;
  const pulse = easeInOut(prog(T, b(28), b(28) + 0.5));
  return <Boats T={T} placed={HOOK} people={0} emptyPulse={pulse} />;
};

/* the drop: people in the water, around where the ship went down */
const Swimmers: React.FC<{ T: number }> = ({ T }) => {
  const { dots, halos, pos } = useMemo(() => {
    const n = IN_WATER;
    const p: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = rnd[i] * Math.PI * 2, rr = Math.sqrt(rnd[i + 2000]) * 4.2;
      p.push([Math.cos(a) * rr * 2.1, Math.sin(a) * rr * 0.55 - 2.0, rnd[i + 4000]]);
    }
    const hg = new THREE.PlaneGeometry(1, 1); hg.rotateX(-Math.PI / 2);
    return {
      pos: p,
      dots: new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#eaf1ff' }), n),
      halos: new THREE.InstancedMesh(hg, new THREE.MeshBasicMaterial({ map: haloTex(), color: '#9fc0ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), n),
    };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  if (T < DROP1 - 0.05) return null;
  pos.forEach(([x, z, d], i) => {
    const a = easeOut(prog(T, DROP1 + d * 0.9, DROP1 + d * 0.9 + 0.25));
    const y = waveY(x, z, T) + 0.03;
    o.position.set(x, y, z); o.rotation.set(0, 0, 0); o.scale.setScalar(Math.max(0.0001, a)); o.updateMatrix();
    dots.setMatrixAt(i, o.matrix);
    o.position.set(x, y + 0.01, z); o.scale.set(Math.max(0.0001, a * 0.35), 1, Math.max(0.0001, a * 0.35)); o.updateMatrix();
    halos.setMatrixAt(i, o.matrix);
  });
  dots.instanceMatrix.needsUpdate = true; halos.instanceMatrix.needsUpdate = true;
  return (<><primitive object={dots} /><primitive object={halos} /></>);
};

/* ---------------- camera ---------------- */
type Key = [number, number[], number[]];
const KEYS: Key[] = [
  [0.0, [B1.x + 0.55, B1.y + 0.75, B1.z + 0.95], [B1.x - 0.02, B1.y - 0.05, B1.z]],
  [b(6), [B1.x + 0.7, B1.y + 0.8, B1.z + 1.15], [B1.x - 0.05, B1.y - 0.1, B1.z]],
  [CARD_IN + 0.3, [B1.x + 6, 2.2, B1.z + 9], [1.5, 1.2, 0]],
  [CARD_OUT, [0, 7.6, 14.2], [0, 1.2, 2.2]],
  [b(28), [0, 7.3, 13.6], [0, 1.2, 2.2]],
  [DROP1, [0, 8.4, 12.6], [0, 0.2, 1.4]],
  [b(36), [0, 6.6, 10.6], [0, 0, 0.6]],
  [b(40), [0, 7.4, 11.6], [0, 0, 1.2]],
  [OPEN_END, [0, 9.0, 13.2], [0, 0, 1.8]],
];
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i], [tb, pb, lb] = KEYS[i + 1];
  const k = easeInOut(prog(T, ta, tb));
  return { pos: pa.map((x, j) => lerp(x, pb[j], k)), look: la.map((x, j) => lerp(x, lb[j], k)) };
};
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

const Scene: React.FC<{ T: number }> = ({ T }) => {
  const flare = T >= DROP1 ? 1.2 * Math.exp(-(T - DROP1) * 2) : 0;
  const pre = 1 - 0.45 * easeInOut(prog(T, b(30), DROP1)) * (T < DROP1 ? 1 : 0);
  return (
    <>
      <CamRig T={T} />
      <color attach="background" args={['#05070d']} />
      <fog attach="fog" args={['#05070d', 22, 75]} />
      <ambientLight intensity={0.22 * pre * (1 + flare)} color="#5a6a98" />
      <directionalLight position={[-30, 25, -40]} intensity={0.9 * pre * (1 + flare)} color="#c9d6f5" />
      <directionalLight position={[10, 12, 20]} intensity={0.25 * pre} color="#8fa6d8" />
      <Sky />
      <Sea T={T} />
      <Ship T={T} />
      <Boat1 T={T} />
      <HookBoats T={T} />
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
const GOLD_TEXT: React.CSSProperties = { color: '#f6cf78', textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 12px rgba(0,0,0,0.9)' };
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
    seg.startsWith('[') ? <span key={i} style={GOLD_TEXT}>{seg.slice(1, -1)}</span>
      : seg.startsWith('{') ? <span key={i} style={{ color: '#ff6a5c' }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
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
const Chapter: React.FC<{ T: number; at: number; out: number; text: string }> = ({ T, at, out, text }) => {
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

type Line = [number, number, string, string];
const LINES: Line[] = [
  [0.4, b(4) - 0.08, '泰坦尼克号的1号救生艇，40个座位', "Titanic's lifeboat No. 1 had 40 seats."],
  [b(4) + 0.06, b(8) - 0.12, '只坐了[12]个人', 'Twelve people got in.'],
  [CARD_OUT + 0.06, b(24) - 0.08, '20艘救生艇，一共1178个座位', 'Twenty lifeboats. 1,178 seats.'],
  [b(24) + 0.06, DROP1 - 0.08, '放下去的时候，空着[400多个]', 'More than 400 of them left empty.'],
  [DROP1 + 0.12, b(40) - 0.08, '同一时刻，水里有1500多人', 'At the same time, more than 1,500 people were in the water.'],
  [b(40) + 0.06, OPEN_END - 0.1, '不是座位不够，是很多人{不肯上船}', "It wasn't the seats. Many people wouldn't get in."],
];

export const TitanicOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '0123应该没事吧').catch(() => null))).then(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) continueRender(handle); }, [ready, handle]);
  const cardF = Math.round(CARD_IN * fps), cardLen = Math.round((CARD_OUT - CARD_IN) * fps);
  const markO = Math.min(easeOut(prog(T, 0.3, 1.0)), 1 - prog(T, CARD_IN, CARD_IN + 0.15) + prog(T, CARD_OUT - 0.1, CARD_OUT + 0.4));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {ready && (
        <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: 34, near: 0.03, far: 220, position: [0, 10, 10] }}>
          <Scene T={T} />
        </ThreeCanvas>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.6) 50%, rgba(5,7,13,0.82) 100%)' }} />
      <Chapter T={T} at={0.3} out={CARD_IN - 0.1} text="1912 · 北 大 西 洋" />
      <Chapter T={T} at={CARD_OUT + 0.2} out={OPEN_END} text="凌 晨 0:40 — 2:20" />
      <Stat T={T} at={CARD_OUT + 0.3} out={DROP1 - 0.1} value={TOTAL_SEATS} label="救生艇座位" top={110} />
      <Stat T={T} at={b(24) + 0.2} out={DROP1 - 0.1} value={414} label="放下时空着" top={250} gold />
      <Stat T={T} at={DROP1 + 0.2} out={OPEN_END - 0.1} value={1500} label="人在水里" top={110} />
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
export const OPEN_FRAMES = Math.round(OPEN_END * 30);
export { clamp };
