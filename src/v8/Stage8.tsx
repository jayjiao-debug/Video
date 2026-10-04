import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Note, Line, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { GoldTitle } from '../brand/Brand';
import { SIM1K } from './common8';
import { Vignette, Grain } from '../ui';

/* 3D stage. S2, b32 -> b57.4: three doors, the intuition, 2/3, a 1000-game simulation, the title.
   S4, b96 -> b124: a hundred doors. */
export const S2_IN = b(32), S2_OUT = b(57.4), S4_IN = b(96), S4_OUT = b(124);
const TITLE = b(50), FOV = 40;
const LINES: Line[] = [
  [S2_IN + 0.12, b(40) - 0.08, '直觉说：剩两扇门，[五五开]', 'Intuition says: two doors left, fifty-fifty.'],
  [b(40) + 0.06, TITLE - 0.1, '错。换，赢面是[2/3]', 'Wrong. Switch, and you win two times in three.'],
  [S4_IN + 0.3, b(104) - 0.08, '换个想法：如果有100扇门', 'Think of it with 100 doors.'],
  [b(104) + 0.06, b(111) - 0.08, '你选1扇，主持人打开98扇空门', 'You pick one. The host opens 98 empty ones.'],
  [b(111) + 0.06, b(118) - 0.08, '剩下那扇，你还守着原来的吗？', 'Would you still keep your first door?'],
  [b(118) + 0.06, S4_OUT - 0.15, '三扇门也一样：你那扇只有[1/3]', 'Same with three: your door is only 1 in 3.'],
];
type V3 = [number, number, number];
const DOORS3: V3[] = [[-3.2, 0, 0], [0, 0, 0], [3.2, 0, 0]];
const N100 = 100, KEEP = 73;
const door100 = (i: number): V3 => [i * 1.5, 0, 0];

/* camera for each moment (shared by the 3D view and the HTML labels) */
const camAt = (T: number): { pos: V3; look: V3 } => {
  if (T < S4_IN - 0.5) {
    const k = easeInOut(prog(T, S2_IN, b(35.6)));
    const pos: V3 = [lerp(-3.2, 0.6, k), lerp(2.0, 2.9, k), zlerp(1.25, 12.5, k)];
    const look: V3 = [lerp(-3.2, 0, k), lerp(2.0, 1.9, k), 0];
    const d = 0.25 * Math.sin((T - S2_IN) * 0.25);
    pos[0] += d;
    return { pos, look };
  }
  const glide = easeInOut(prog(T, b(111.2), b(114.6)));
  const intro = easeOut(prog(T, S4_IN, b(99)));
  const k73 = door100(KEEP)[0];
  const pos: V3 = [lerp(lerp(-6, 1, intro), k73 - 6, glide), lerp(lerp(3.4, 2.5, intro), 2.1, glide), lerp(lerp(8.5, 11, intro), 5.4, glide)];
  const look: V3 = [lerp(lerp(26, 21, intro), k73 + 4, glide), lerp(0.9, 0.75, glide), lerp(lerp(-2.5, 0, intro), -1.5, glide)];
  return { pos, look };
};
const project = (T: number, p: V3, w: number, h: number) => {
  const { pos, look } = camAt(T);
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 500);
  cam.position.set(...pos); cam.lookAt(...look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, vis: v.z < 1 };
};

const Door: React.FC<{ at: V3; open: number; w?: number; h?: number; gold?: number; reveal?: boolean; inward?: boolean }> = ({ at, open, w = 2.2, h = 4, gold = 0, reveal, inward }) => (
  <group position={at}>
    {/* recess */}
    <mesh position={[0, h / 2, -0.35]}><boxGeometry args={[w, h, 0.05]} /><meshStandardMaterial color="#07080c" roughness={1} /></mesh>
    {/* frame */}
    <mesh position={[-w / 2 - 0.08, h / 2, 0]}><boxGeometry args={[0.16, h + 0.16, 0.5]} /><meshStandardMaterial color={gold > 0 ? '#f1c56d' : '#8a7550'} emissive={gold > 0 ? '#6b4b14' : '#000'} emissiveIntensity={gold} metalness={0.4} roughness={0.5} /></mesh>
    <mesh position={[w / 2 + 0.08, h / 2, 0]}><boxGeometry args={[0.16, h + 0.16, 0.5]} /><meshStandardMaterial color={gold > 0 ? '#f1c56d' : '#8a7550'} emissive={gold > 0 ? '#6b4b14' : '#000'} emissiveIntensity={gold} metalness={0.4} roughness={0.5} /></mesh>
    <mesh position={[0, h + 0.08, 0]}><boxGeometry args={[w + 0.32, 0.16, 0.5]} /><meshStandardMaterial color={gold > 0 ? '#f1c56d' : '#8a7550'} emissive={gold > 0 ? '#6b4b14' : '#000'} emissiveIntensity={gold} metalness={0.4} roughness={0.5} /></mesh>
    {/* the leaf, hinged on its left edge */}
    <group position={[-w / 2, 0, inward ? -0.2 : 0.02]} rotation={[0, (inward ? 1.45 : -1.75) * open, 0]}>
      <mesh position={[w / 2, h / 2, 0]}><boxGeometry args={[w - 0.04, h - 0.04, 0.12]} /><meshStandardMaterial color="#e6dcc4" roughness={0.6} /></mesh>
      <mesh position={[w / 2, h * 0.72, 0.07]}><boxGeometry args={[w * 0.7, h * 0.32, 0.02]} /><meshStandardMaterial color="#d6c9ab" roughness={0.6} /></mesh>
      <mesh position={[w / 2, h * 0.3, 0.07]}><boxGeometry args={[w * 0.7, h * 0.36, 0.02]} /><meshStandardMaterial color="#d6c9ab" roughness={0.6} /></mesh>
      <mesh position={[w - 0.28, h * 0.48, 0.12]}><sphereGeometry args={[0.07, 12, 8]} /><meshStandardMaterial color="#c9a45c" metalness={0.8} roughness={0.3} /></mesh>
    </group>
    {reveal && open > 0.3 && <pointLight position={[0, h * 0.6, -0.2]} intensity={0.3 * open} color="#8fa6d8" distance={3} />}
  </group>
);

const Scene: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.set(...pos); camera.lookAt(...look); (camera as THREE.PerspectiveCamera).near = 0.05; camera.updateProjectionMatrix();
  const s2 = T < S4_IN - 0.5;
  if (s2) {
    const open3 = easeInOut(prog(T, b(34.2), b(35.4)));
    const gold = (i: number) => (i === 0 ? 0.6 : i === 1 ? 0.9 * easeOut(prog(T, b(40.3), b(41))) : 0);
    return (
      <>
        <ambientLight intensity={0.28} color="#9aa6c4" />
        <directionalLight position={[2, 8, 9]} intensity={0.55} color="#fff1d8" />
        {DOORS3.map((p, i) => <pointLight key={i} position={[p[0], 5.6, 2.2]} intensity={1.1} distance={9} color="#ffe2b0" />)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[60, 40, 30, 20]} /><meshStandardMaterial color="#0e1018" roughness={0.35} metalness={0.2} /></mesh>
        <mesh position={[0, 6, -0.4]}><planeGeometry args={[60, 14, 20, 6]} /><meshStandardMaterial color="#161a26" roughness={0.9} /></mesh>
        {DOORS3.map((p, i) => <Door key={i} at={p} open={i === 2 ? open3 : 0} gold={gold(i)} reveal={i === 2} />)}
        {/* your pick: a gold ring on the floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[DOORS3[0][0], 0.012, 1.0]}><ringGeometry args={[0.9, 1.05, 48]} /><meshBasicMaterial color="#f1c56d" transparent opacity={0.85} /></mesh>
      </>
    );
  }
  // a hundred doors
  const appear = (i: number) => easeOut(prog(T, S4_IN + 0.2 + i * 0.018, S4_IN + 0.6 + i * 0.018));
  const openT = (i: number) => { const j = i - 1 - (i > KEEP ? 1 : 0); return b(104.6) + j * 0.03; };
  return (
    <>
      <ambientLight intensity={0.6} color="#a8b2cc" />
      <hemisphereLight args={['#c9d6f5', '#1a1f2c', 0.5]} />
      <directionalLight position={[-4, 9, 8]} intensity={0.9} color="#fff1d8" />
      {[0, 20, 40, 60, 80, 100, 120, 140].map((x) => <pointLight key={x} position={[x, 3.5, 3]} intensity={0.9} distance={14} color="#ffe2b0" />)}
      <pointLight position={[door100(KEEP)[0], 4, 3]} intensity={1.6 * easeOut(prog(T, b(108), b(109)))} distance={10} color="#ffe2b0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0, 0]}><planeGeometry args={[220, 60, 60, 20]} /><meshStandardMaterial color="#1a1f2c" roughness={0.4} metalness={0.15} /></mesh>
      <mesh position={[70, 4, -0.45]}><planeGeometry args={[220, 10, 40, 4]} /><meshStandardMaterial color="#2a3248" roughness={0.9} /></mesh>
      {Array.from({ length: N100 }, (_, i) => {
        const a = appear(i);
        if (a <= 0) return null;
        const open = i === 0 || i === KEEP ? 0 : easeInOut(prog(T, openT(i), openT(i) + 0.35));
        const p = door100(i);
        return <group key={i} scale={[1, Math.max(0.001, a), 1]}><Door at={p} w={1.0} h={2.1} open={open} inward gold={i === 0 ? 0.7 : i === KEEP ? 0.9 * easeOut(prog(T, b(108), b(109))) : 0} /></group>;
      })}
    </>
  );
};

export const StageScene: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  const inS2 = T >= S2_IN - 0.02 && T <= S2_OUT + 0.05, inS4 = T >= S4_IN - 0.05 && T <= S4_OUT + 0.05;
  if (!inS2 && !inS4) return null;
  const o = inS2 ? Math.min(easeOut(prog(T, S2_IN - 0.02, S2_IN + 0.35)), 1 - prog(T, b(56.4), S2_OUT)) : Math.min(easeOut(prog(T, S4_IN - 0.05, S4_IN + 0.6)), 1 - prog(T, S4_OUT - 0.4, S4_OUT));
  const dim = inS2 ? 1 - 0.6 * easeInOut(prog(T, TITLE - 0.1, TITLE + 0.6)) - 0.85 * easeInOut(prog(T, b(42.2), b(43))) * (1 - easeInOut(prog(T, TITLE - 0.2, TITLE))) : 1;
  const label = (p: V3, text: string, o2: number, gold = false, big = 64) => {
    if (o2 <= 0) return null;
    const q = project(T, p, width, height);
    if (!q.vis) return null;
    return <div style={{ position: 'absolute', left: q.x - 200, top: q.y - big, width: 400, textAlign: 'center', opacity: o2, fontFamily: EN, fontWeight: 700, fontSize: big, color: gold ? GOLD : CREAM, ...(gold ? GOLD_TEXT : { textShadow: '0 2px 12px rgba(0,0,0,0.9)' }) }}>{text}</div>;
  };
  // the 1000-game simulation panel
  const simO = inS2 ? easeOut(prog(T, b(42.4), b(43.1))) * (1 - prog(T, TITLE - 0.3, TITLE)) : 0;
  const fill = easeInOut(prog(T, b(43), b(48.4)));
  const shown = Math.floor(1000 * fill);
  let stayW = 0, swW = 0;
  for (let i = 0; i < shown; i++) { stayW += SIM1K.games[i]; swW += 1 - SIM1K.games[i]; }
  const grid = (x0: number, win: (i: number) => boolean, title: string, wins: number, gold: boolean) => (
    <g transform={`translate(${x0} 150)`}>
      <text x={0} y={-24} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: gold ? GOLD : CREAM }}>{title}</text>
      {Array.from({ length: 1000 }, (_, i) => {
        if (i >= shown) return null;
        const c = i % 40, r = Math.floor(i / 40);
        return <rect key={i} x={c * 13} y={r * 13} width={10} height={10} rx={2} fill={win(i) ? (gold ? GOLD : CREAM) : '#3a4258'} />;
      })}
      <text x={520} y={360} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 56, fill: gold ? GOLD : CREAM }}>{wins}<tspan style={{ fontFamily: ZH, fontSize: 26 }} fill="rgba(243,237,226,0.7)"> 局赢</tspan></text>
    </g>
  );
  const tf = (T - TITLE) * 30;
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: FOV, near: 0.05, far: 500, position: [0, 2, 12] }}>
          <Scene T={T} />
        </ThreeCanvas>
      </AbsoluteFill>
      {inS2 && T < b(43) && <>
        {label([DOORS3[0][0], 4.9, 0], T < b(40.3) ? '50%？' : '1/3', easeOut(prog(T, b(36), b(36.6))) * (1 - 0.6 * prog(T, b(42.2), b(43))), false)}
        {label([DOORS3[1][0], 4.9, 0], T < b(40.3) ? '50%？' : '2/3', easeOut(prog(T, b(36), b(36.6))) * (1 - 0.6 * prog(T, b(42.2), b(43))), T >= b(40.3))}
        {label([DOORS3[0][0], -0.2, 1.3], '你选的', easeOut(prog(T, b(33), b(33.6))) * (1 - prog(T, b(42.2), b(43))), true, 30)}
        {label([DOORS3[2][0], 2.4, 0.2], '空', easeOut(prog(T, b(35), b(35.6))) * (1 - prog(T, b(42.2), b(43))), false, 44)}
      </>}
      {simO > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: simO }}>
          <text x={960} y={92} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: 'rgba(243,237,226,0.75)', letterSpacing: '0.1em' }}>电脑模拟 1000 局（每格一局）</text>
          {grid(330, (i) => SIM1K.games[i] === 1, '一直不换', stayW, false)}
          {grid(1070, (i) => SIM1K.games[i] === 0, '每次都换', swW, true)}
        </svg>
      )}
      {inS2 && <Chapter T={T} at={S2_IN + 0.6} out={b(42.2)} text="三 门 问 题" />}
      {inS2 && T >= TITLE - 0.05 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - prog(T, b(56.4), S2_OUT) }}>
          <text x={960} y={400} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={easeOut(prog(T, TITLE, TITLE + 0.5))}>THE MONTY HALL PROBLEM · 三 门 问 题</text>
          <GoldTitle text="换不换" f={tf} at={4} size={120} y={545} />
        </svg>
      )}
      {inS4 && <>
        {label(door100(0).map((v, k) => (k === 1 ? 2.75 : v)) as V3, '1%', easeOut(prog(T, b(111.4), b(112))), false, 54)}
        {label(door100(KEEP).map((v, k) => (k === 1 ? 2.75 : v)) as V3, '99%', easeOut(prog(T, b(112.6), b(113.2))), true, 64)}
        {label(door100(0).map((v, k) => (k === 1 ? -0.25 : k === 2 ? 0.8 : v)) as V3, '你选的', easeOut(prog(T, b(98.5), b(99))) * (1 - prog(T, b(111), b(111.5))), true, 26)}
        <Chapter T={T} at={S4_IN + 0.4} out={S4_OUT - 0.3} text="换 个 想 法" />
        <Note T={T} at={b(104.8)} out={S4_OUT - 0.2} text="主持人知道奖品在哪，只开空门" />
      </>}
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};
