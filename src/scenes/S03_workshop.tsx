/* S03 · workshop (12.4 – 24.707). Whip in from the title onto a court file standing on a subcontractor's bench.
   The camera pushes in while a holo highlighter sweeps one line; on the strongest onset of the film (16.603) a
   black-and-gold stamp `€53 / 只` slams onto the file, the bench jolts and the work lights stutter on. The camera
   pulls back and cranes up: hides hanging on a rail, a sewing machine, spools, the lamp, and our crimson bag on the
   bench. At 20.657 a gold price tag `€2,600` swings in beside the bag. A slow truck right carries into the whip. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { slam, impulse, swing, prog, easeOut, easeInOut } from '../scene';
import { HeroBag, Cut, rect, circle, ring, cutGeo } from '../foil';
import { Backdrop, MirrorFloor, Word, Confetti, Beam } from '../kit';
import { holoMat, mat } from '../foil';
import { Spot, Caption, hash } from './S03_parts';

const HIT = 16.603, TAG = 20.657;

/* local materials: dull leather for the hides, a lacquered machine, a dark bench that doesn't mirror the club strips */
const mcache = new Map<string, THREE.Material>();
const leather = (c: string) => mcache.get(c) ?? (mcache.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0, envMapIntensity: 0.25 })), mcache.get(c)!);
const machineMat = new THREE.MeshPhysicalMaterial({ color: '#0c0b12', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.7 });
const CutM: React.FC<{ d: string; m: THREE.Material; depth?: number } & JSX.IntrinsicElements['group']> = ({ d, m, depth = 0.006, ...g }) => {
  const geo = useMemo(() => cutGeo(d, depth), [d, depth]);
  return <group {...g}><mesh geometry={geo} material={m} castShadow receiveShadow /></group>;
};

/* ---------------------------------------------------------------- shapes (mm, y down) */
const hidePath = (seed: number, W: number, H: number) => {
  const N = 40, pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = 1 + 0.2 * Math.pow(Math.abs(Math.sin(2 * a + 0.1 * seed)), 9) - 0.07 * Math.pow(Math.abs(Math.cos(a)), 3) + 0.035 * Math.sin(5 * a + seed * 2.1) + 0.02 * Math.sin(9 * a + seed);
    pts.push([Math.cos(a) * r * (W / 2), H / 2 + Math.sin(a) * r * (H / 2)]);
  }
  const minY = Math.min(...pts.map((p) => p[1]));
  const P = pts.map(([x, y]) => [x, y - minY] as [number, number]);
  const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M ${mid(P[N - 1], P[0]).map((v) => v.toFixed(1)).join(' ')}`;
  for (let i = 0; i < N; i++) { const m = mid(P[i], P[(i + 1) % N]); d += ` Q ${P[i][0].toFixed(1)} ${P[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }
  return d + ' Z';
};
const MACHINE = 'M -200 0 L 200 0 L 200 -30 L 168 -30 L 168 -205 Q 168 -236 138 -236 L -148 -236 Q -174 -236 -174 -212 L -174 -112 L -110 -112 L -110 -178 L 108 -178 L 108 -30 L -200 -30 Z';
const SPOOL = { flange: 'M -24 -62 L 24 -62 L 24 -55 L -24 -55 Z M -24 -7 L 24 -7 L 24 0 L -24 0 Z', body: rect(-17, -55, 34, 48) };
const PENDANT = 'M -16 -56 L 16 -56 L 50 0 L -50 0 Z';
const SHADE = 'M -30 -20 L 30 -20 L 72 70 L -72 70 Z';
const rrect = (w: number, h: number, r: number) => `M ${-w / 2 + r} ${-h / 2} L ${w / 2 - r} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + r} L ${w / 2} ${h / 2 - r} Q ${w / 2} ${h / 2} ${w / 2 - r} ${h / 2} L ${-w / 2 + r} ${h / 2} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - r} L ${-w / 2} ${-h / 2 + r} Q ${-w / 2} ${-h / 2} ${-w / 2 + r} ${-h / 2} Z`;
const rframe = (w: number, h: number, t: number) => {
  const o = rect(-w / 2, -h / 2, w, h), i = `M ${-w / 2 + t} ${-h / 2 + t} L ${-w / 2 + t} ${h / 2 - t} L ${w / 2 - t} ${h / 2 - t} L ${w / 2 - t} ${-h / 2 + t} Z`;
  return `${o} ${i}`;
};
const PRICE_TAG = 'M -78 -30 L -52 -56 L 52 -56 L 78 -30 L 78 56 L -78 56 Z M 6 -38 A 6 6 0 1 1 -6 -38 A 6 6 0 1 1 6 -38 Z';

/* ---------------------------------------------------------------- the court file (canvas) */
const DOC_W = 0.21, DOC_H = 0.297, HL_LINE = 8, LINE0 = 360, LSTEP = 50;
const docTex = () => {
  const W = 1024, H = 1448, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(60,40,10,${hash(i, 2) * 0.05})`; g.fillRect(hash(i, 3) * W, hash(i, 4) * H, 2, 2); }
  g.strokeStyle = 'rgba(150,110,45,0.95)'; g.lineWidth = 6; g.strokeRect(46, 46, W - 92, H - 92); g.lineWidth = 2; g.strokeRect(60, 60, W - 120, H - 120);
  g.fillStyle = '#1d1a16'; g.textAlign = 'center';
  g.font = '700 50px "Cormorant Garamond", "Noto Serif CJK SC", serif'; g.fillText('TRIBUNALE DI MILANO', W / 2, 168);
  g.font = '900 40px "Noto Serif CJK SC", serif'; g.fillText('调 查 文 件  ·  2024', W / 2, 236);
  g.fillStyle = 'rgba(150,110,45,0.95)'; g.fillRect(W / 2 - 160, 270, 320, 3);
  for (let l = 0; l < 17; l++) {
    const y = LINE0 + l * LSTEP; let x = l % 6 === 0 ? 170 : 120; const end = l % 6 === 5 ? 520 + hash(l, 7) * 200 : W - 120;
    g.fillStyle = 'rgba(40,32,24,0.5)';
    while (x < end - 30) { const w = Math.min(end - x, 30 + hash(l * 31 + x, 5) * 110); g.fillRect(x, y - 9, w, 16); x += w + 14; }
    if (l === HL_LINE) { g.fillStyle = '#efe6d2'; g.fillRect(W - 300, y - 30, 190, 44); g.fillStyle = '#1d1a16'; g.font = '900 44px "Noto Serif CJK SC", serif'; g.textAlign = 'right'; g.fillText('€ 53', W - 122, y + 14); g.textAlign = 'center'; }
  }
  // signature + seal
  g.strokeStyle = 'rgba(30,30,60,0.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(150, 1290);
  for (let i = 0; i < 40; i++) g.lineTo(150 + i * 7, 1290 - Math.sin(i * 0.9) * 22 - i * 0.6); g.stroke();
  g.strokeStyle = 'rgba(140,20,30,0.7)'; g.lineWidth = 5; g.beginPath(); g.arc(W - 220, 1270, 70, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(W - 220, 1270, 54, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const lineY = (l: number) => (0.5 - (LINE0 + l * LSTEP) / 1448) * DOC_H;
const markerMask = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const g = c.getContext('2d')!;
  for (let x = 0; x < 256; x++) { const top = 3 + hash(x, 1) * 3, bot = 29 - hash(x, 2) * 3; g.fillStyle = `rgba(255,255,255,${0.62 + hash(x, 9) * 0.1})`; g.fillRect(x, top, 1, bot - top); }
  return new THREE.CanvasTexture(c);
};

const CourtDoc: React.FC<{ T: number }> = ({ T }) => {
  const tex = useMemo(docTex, []);
  const hl = useMemo(() => holoMat('#ffffff', 1.25, markerMask()), []);
  const sweep = easeInOut(prog(T, 14.35, 15.55));
  const y = lineY(HL_LINE), x0 = -0.082, x1 = 0.088, L = (x1 - x0) * sweep;
  const s = slam(T, HIT, 0.12), land = T >= HIT;
  const kick = impulse(T, HIT, 0.12);
  return (
    <group position={[-0.36, 0.45, 0.17]} rotation={[-0.12 - 0.05 * kick, 0.28, 0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[DOC_W, DOC_H, 0.003]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
      {/* a black backing card, so the file reads as a mounted exhibit */}
      <Cut d={rect(-113, -156, 226, 312)} kind="black" depth={0.003} position={[0, 0, -0.006]} />
      {L > 0.001 && <mesh material={hl} position={[x0 + L / 2, y, 0.0022]}><planeGeometry args={[L, 0.016]} /></mesh>}
      {/* the stamp: a black label with a gold frame, slammed on the hit */}
      {s > 0 && <group position={[0.012, -0.06, 0.004 + 0.18 * (1 - s)]} rotation={[0, 0, -0.09]} scale={1 + 2.4 * (1 - s)}>
        <Cut d={rrect(156, 64, 8)} kind="black" color="#08070c" depth={0.0015} bevel={0.0006} />
        <Cut d={rframe(146, 54, 3)} kind="gold" depth={0.0008} bevel={0} position={[0, 0, 0.0022]} shadow={false} />
        <Word text="€53 / 只" size={0.04} kind="gold" position={[0, 0.001, 0.0035]} />
      </group>}
      {/* gold flecks thrown off by the impact */}
      {land && T < HIT + 0.9 && Array.from({ length: 22 }, (_, i) => {
        const a = hash(i, 1) * Math.PI * 2, sp = 0.05 + hash(i, 2) * 0.12, u = easeOut(prog(T, HIT, HIT + 0.7)), d = T - HIT;
        const fade = 1 - prog(T, HIT + 0.35, HIT + 0.9);
        return <Cut key={i} d="M 0 -5 L 4 0 L 0 5 L -4 0 Z" kind={i % 3 ? 'gold' : 'holo'} depth={0.0005} bevel={0} shadow={false}
          position={[0.012 + Math.cos(a) * sp * u * 1.4, -0.06 + Math.sin(a) * sp * u - 0.05 * d * d, 0.01 + hash(i, 3) * 0.06 * u]} rotation={[d * 9 * hash(i, 4), d * 7, a]} scale={fade * (0.8 + hash(i, 5))} />;
      })}
      {/* the brass ledge it leans on */}
      <Cut d={rect(-120, 146, 240, 10)} kind="gold" depth={0.012} position={[0, 0, 0.004]} />
    </group>
  );
};

/* ---------------------------------------------------------------- the room */
const HIDES = [
  { x: -1.12, z: -1.02, w: 380, h: 600, c: '#3a0a12', s: 1 },
  { x: -0.68, z: -0.82, w: 420, h: 640, c: '#24120a', s: 2 },
  { x: -0.22, z: -1.08, w: 360, h: 580, c: '#4a0c18', s: 3 },
  { x: 0.24, z: -0.86, w: 400, h: 660, c: '#1a0d10', s: 4 },
  { x: 0.7, z: -1.04, w: 390, h: 610, c: '#3d140c', s: 5 },
  { x: 1.12, z: -0.84, w: 420, h: 630, c: '#2e0a14', s: 6 },
];
const Hides: React.FC<{ T: number }> = ({ T }) => (
  <group>
    <Cut d={rect(-1500, -6, 3000, 12)} kind="gold" depth={0.01} position={[0, 1.12, -0.95]} />
    {HIDES.map((h, i) => {
      const sway = 0.025 * Math.sin(T * 0.7 + i * 1.7) + 0.012 * Math.sin(T * 1.3 + i);
      return <group key={i} position={[h.x, 1.12, h.z]} rotation={[0, 0, sway]}>
        <Cut d={rect(-3, 0, 6, 40)} kind="gold" depth={0.004} position={[0, 0, 0.004]} />
        <CutM d={hidePath(h.s, h.w, h.h)} m={leather(h.c)} position={[0, -0.035, 0]} depth={0.005} />
        <Cut d={rect(-22, 0, 44, 18)} kind="gold" depth={0.006} position={[0, -0.03, 0.006]} />
      </group>;
    })}
  </group>
);
const Windows: React.FC<{ glow: number }> = ({ glow }) => (
  <group position={[0, 0, -1.5]}>
    {[-0.82, 0, 0.82].map((x) => <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, 0.98, -0.04]}><planeGeometry args={[0.52, 0.84]} /><meshBasicMaterial color={new THREE.Color('#2a3d86').multiplyScalar(glow)} toneMapped={false} /></mesh>
      <Cut d={rframe(540, 860, 16) + ' ' + [-90, 90].map((v) => rect(v - 4, -420, 8, 840)).join(' ') + ' ' + [-210, -70, 70, 210].map((v) => rect(-262, v - 4, 524, 8)).join(' ')} kind="gold" color="#b8913f" depth={0.008} position={[0, 0.98, 0]} />
    </group>)}
  </group>
);
const Machine: React.FC = () => (
  <group position={[-0.2, 0.3, -0.22]} scale={0.95}>
    <CutM d={MACHINE} m={machineMat} depth={0.012} />
    <Cut d={rect(-140, -228, 260, 5)} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.0145]} />
    <Cut d={rect(-200, -30, 400, 5)} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.0145]} />
    <Cut d={rect(-144, -112, 5, 62)} kind="chrome" depth={0.003} position={[0, 0, 0.004]} />
    <CutM d={circle(196, -160, 44)} m={machineMat} depth={0.008} position={[0, 0, 0.003]} />
    <Cut d={ring(196, -160, 36, 44)} kind="gold" depth={0.006} position={[0, 0, 0.006]} />
    <Cut d={[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return `M ${196 + Math.cos(a) * 6} ${-160 + Math.sin(a) * 6} L ${196 + Math.cos(a) * 37} ${-160 + Math.sin(a) * 37} L ${196 + Math.cos(a + 0.12) * 37} ${-160 + Math.sin(a + 0.12) * 37} L ${196 + Math.cos(a + 0.5) * 6} ${-160 + Math.sin(a + 0.5) * 6} Z`; }).join(' ') + ' ' + circle(196, -160, 9)} kind="gold" depth={0.004} bevel={0} position={[0, 0, 0.012]} />
    <Cut d={SPOOL.flange} kind="gold" depth={0.004} position={[0.04, 0.236, 0.004]} scale={0.8} />
    <Cut d={SPOOL.body} kind="lacquer" color="#8a0f22" depth={0.004} position={[0.04, 0.236, 0.003]} scale={0.8} />
  </group>
);
const Spools: React.FC = () => (
  <group>
    {[[0.4, -0.2, '#f0c46a'], [0.5, -0.24, '#8a0f22'], [0.6, -0.17, '#efe6d2']].map(([x, z, col], i) => (
      <group key={i} position={[x as number, 0.3, z as number]}>
        <Cut d={SPOOL.flange} kind="black" depth={0.006} />
        <Cut d={SPOOL.body} kind={col === '#f0c46a' ? 'gold' : 'lacquer'} color={col as string} depth={0.005} position={[0, 0, -0.001]} />
      </group>))}
  </group>
);
/* the lamp: base on the bench at the back right, two arms, the shade over the middle of the bench */
const LAMP = { base: [-0.66, 0.3] as [number, number], elbow: [-0.6, 0.9] as [number, number], head: [-0.04, 0.86] as [number, number], z: -0.26 };
const Arm: React.FC<{ a: [number, number]; b: [number, number]; z: number }> = ({ a, b, z }) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return <group position={[a[0], a[1], z]} rotation={[0, 0, ang]}><Cut d={rect(0, -6, L * 1000, 12)} kind="black" color="#121018" depth={0.008} /><Cut d={rect(0, -1.5, L * 1000, 3)} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.0095]} /></group>;
};
const Lamp: React.FC<{ k: number }> = ({ k }) => (
  <group>
    <Cut d={rect(-60, -16, 120, 16)} kind="black" depth={0.03} position={[LAMP.base[0], LAMP.base[1], LAMP.z - 0.015]} />
    <Cut d={rect(-62, -18, 124, 4)} kind="gold" depth={0.032} position={[LAMP.base[0], LAMP.base[1], LAMP.z - 0.016]} />
    <Arm a={[LAMP.base[0], LAMP.base[1] + 0.016]} b={LAMP.elbow} z={LAMP.z} />
    <Arm a={LAMP.elbow} b={[LAMP.head[0] - 0.03, LAMP.head[1] + 0.02]} z={LAMP.z} />
    <Cut d={circle(0, 0, 12)} kind="gold" depth={0.012} position={[LAMP.elbow[0], LAMP.elbow[1], LAMP.z]} />
    <group position={[LAMP.head[0], LAMP.head[1], LAMP.z + 0.02]} rotation={[0.5, 0, -0.12]}>
      <Cut d={SHADE} kind="black" color="#121018" depth={0.01} />
      <Cut d={rect(-74, 66, 148, 7)} kind="gold" depth={0.012} position={[0, 0, -0.001]} />
      <mesh position={[0, -0.068, 0.012]}><circleGeometry args={[0.022, 24]} /><meshBasicMaterial color={new THREE.Color('#ffe2b0').multiplyScalar(1.5 + 2.5 * k)} toneMapped={false} /></mesh>
    </group>
  </group>
);
const Pendants: React.FC<{ on: number }> = ({ on }) => (
  <group>
    {[-0.95, -0.32, 0.32, 0.95].map((x, i) => (
      <group key={i} position={[x, 1.02 - (i % 2) * 0.05, -0.5]}>
        <Cut d={rect(-1, -600, 2, 600)} kind="black" depth={0.002} bevel={0} position={[0, 0, 0]} shadow={false} />
        <Cut d={PENDANT} kind="black" color="#121018" depth={0.008} />
        <Cut d={rect(-50, -4, 100, 5)} kind="gold" depth={0.009} position={[0, 0, -0.0005]} />
        <mesh position={[0, -0.01, 0.01]}><circleGeometry args={[0.014, 20]} /><meshBasicMaterial color={new THREE.Color('#ffe9c4').multiplyScalar(0.1 + 1.6 * on)} toneMapped={false} /></mesh>
              </group>
    ))}
  </group>
);

/* ---------------------------------------------------------------- the set */
const flick = (T: number) => (T < HIT ? 0 : T < HIT + 0.09 ? 1 : T < HIT + 0.15 ? 0.15 : T < HIT + 0.2 ? 0.9 : T < HIT + 0.25 ? 0.3 : 1);

const Set: React.FC<{ T: number }> = ({ T }) => {
  const on = flick(T), k = impulse(T, HIT, 0.22);
  const tagSwing = (() => { const d = T - (TAG - 0.257); if (d < 0) return null; return 1.15 * Math.exp(-1.7 * d) * Math.cos(6.1 * d); })();
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      <Windows glow={0.55 + 0.1 * on} />
      <Beam from={[0.0, 1.45, -1.45]} len={2.0} r={0.4} o={0.03} color="#9fb4ff" tilt={[0.55, 0.2]} />
      <Hides T={T} />
      <Pendants on={on} />
      {/* the bench: velvet top, gold edge, black front */}
      <mesh position={[0, 0.29, 0]} receiveShadow castShadow><boxGeometry args={[1.7, 0.02, 0.64]} /><meshPhysicalMaterial color="#24160f" roughness={0.7} specularIntensity={0.12} /></mesh>
      <Cut d={rect(-850, -6, 1700, 6)} kind="gold" depth={0.004} position={[0, 0.3, 0.322]} />
      <CutM d={rect(-850, -280, 1700, 274)} m={leather('#0a0808')} depth={0.006} position={[0, 0, 0.318]} />
      <Machine />
      <Spools />
      <Lamp k={k} />
      <HeroBag position={[0.16, 0.3, -0.02]} swing={swing(T, HIT, 9) + 4 * Math.sin(T * 1.1)} />
      <CourtDoc T={T} />
      {/* foreground: a leather strap and a hide corner hanging close to the lens, so the pull-back has something to pass */}
      <group position={[-0.62, 1.25, 0.52]} rotation={[0, 0, 0.02 * Math.sin(T * 0.9)]}><Cut d={rect(-14, 0, 28, 640)} kind="lacquer" color="#4a0a16" depth={0.004} /><Cut d={rect(-14, 600, 28, 8)} kind="gold" depth={0.005} /></group>
      <group position={[0.86, 1.2, 0.46]} rotation={[0, -0.3, 0.03 * Math.sin(T * 0.6 + 1)]}><CutM d={hidePath(9, 420, 640)} m={leather('#1a0a0c')} depth={0.005} /></group>
      {/* €2,600 · the shop's tag swings in on its gold thread */}
      {tagSwing !== null && <group position={[0.54, 1.14, 0.04]} rotation={[0, 0, tagSwing]}>
        <mesh position={[0, -0.21, 0]} material={mat('gold')}><boxGeometry args={[0.0016, 0.42, 0.0016]} /></mesh>
        <group position={[0, -0.42 - 0.067, 0]}>
          <group scale={1.2}><Cut d={PRICE_TAG} kind="gold" depth={0.003} />
          <Word text="€2,600" size={0.044} kind="ink" color="#2a1a06" position={[0, -0.01, 0.0045]} />
          <Word text="店 里 同 款" size={0.013} kind="ink" color="#2a1a06" weight="700" position={[0, -0.04, 0.0045]} /></group>
        </group>
      </group>}
      {/* light: the lamp is the key (and the only shadow); work lights stutter on at the hit; a cool window rim */}
      <Spot pos={[LAMP.head[0], LAMP.head[1] - 0.05, LAMP.z + 0.12]} at={[-0.06, 0.3, 0.1]} intensity={1.5 + 2.2 * k} angle={0.62} penumbra={0.9} color="#ffe6c0" shadow />
      <Spot pos={[0, 2.6, 1.2]} at={[0.1, 0.4, -0.2]} intensity={on * 3.2} angle={0.42} penumbra={1} color="#fff0d8" />
      <Spot pos={[0.3, 1.8, -1.4]} at={[0.1, 0.45, 0]} intensity={4} angle={0.5} penumbra={0.9} color="#8aa6ff" />
      <Spot pos={[-2.2, 1.1, 1.2]} at={[0, 0.62, -0.1]} intensity={1.6} angle={0.3} penumbra={0.9} color="#ff3ec8" />
      <Spot pos={[2.2, 1.1, 1.2]} at={[0, 0.62, -0.1]} intensity={1.6} angle={0.3} penumbra={0.9} color="#29e6ff" />
      <Confetti T={T} box={[1.0, 0.6, 0.5]} center={[-0.1, 0.62, 0.0]} n={14} seed={3} fall={0.015} />
      <ambientLight intensity={0.035} />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => <Caption T={T} t0={17} t1={24.5} text="注：该子公司整改后，2025年2月法院提前解除管理" />;

export const S03: SceneDef = {
  id: 'S03_workshop', t0: 12.4, t1: 24.707, x: 28, enter: 'whip', Set, Overlay,
  keys: [
    { t: 12.7, pos: [-0.2, 0.52, 0.86], look: [-0.34, 0.41, 0.17], fov: 32, ap: 0.012, bloom: 0.75 },
    { t: 14.5, pos: [-0.25, 0.5, 0.74], look: [-0.35, 0.41, 0.17], fov: 32, ap: 0.014, bloom: 0.7 },
    { t: 16.6, pos: [-0.3, 0.47, 0.6], look: [-0.355, 0.405, 0.17], fov: 32, ap: 0.016, bloom: 0.8 },
    { t: 16.95, pos: [-0.29, 0.48, 0.64], look: [-0.35, 0.405, 0.17], fov: 32, ap: 0.014, bloom: 0.75 },
    { t: 18.4, pos: [-0.1, 0.66, 1.08], look: [-0.12, 0.43, 0.04], fov: 34, ap: 0.008, bloom: 0.7 },
    { t: 20.6, pos: [0.2, 0.74, 1.32], look: [0.04, 0.5, -0.05], fov: 34, ap: 0.006, bloom: 0.7 },
    { t: 22.6, pos: [0.4, 0.68, 1.22], look: [0.12, 0.5, -0.05], fov: 34, ap: 0.007, bloom: 0.7 },
    { t: 24.407, pos: [0.6, 0.64, 1.14], look: [0.2, 0.5, -0.05], fov: 34, ap: 0.007, bloom: 0.72 },
  ],
  lines: [
    { t: 12.5, end: 16.45, text: '2024年，米兰法院公布了一份调查文件：' },
    { t: 16.65, end: 20.55, text: '迪奥一款包，代工厂每只最低收53欧元；' },
    { t: 20.65, end: 24.6, text: '店里，同款卖2600欧元。' },
  ],
  hits: [[TAG, 0.35]],
  bg: '#030308', env: 0.5,
};
