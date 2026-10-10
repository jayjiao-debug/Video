/* 12.0 – 30.5 s: "godlike moments", four stations on one dark set, the camera trucking right from one to the next,
   then rising until the four become four points of light (which the next section merges into one).
   Kobe 81 (2006) · Liu Xiang 12.91 (Athens 2004) · Su Bingtian 9.83 (Tokyo 2021) · Quan Hongchan, three perfect dives (Tokyo 2021).
   No faces: name cards carry the people; the places and the numbers carry the moment. */
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { canvasTex, glowTex, coneTex, floorTex } from './Opening';
import { GOLD, clamp, prog, easeOut, easeInOut, lerp, NameCard } from './art';

const SP = 14; // station spacing along x
const STOPS: [number, number, number][] = [[12.0, 12.6, 0], [15.6, 16.2, 1], [19.5, 20.1, 2], [23.2, 23.8, 3]]; // [leave prev, arrive, station]
const stationX = (T: number) => {
  let x = -3 + 3 * easeOut(prog(T, 12.0, 12.6));
  for (let i = 1; i < STOPS.length; i++) { const [a, b, s] = STOPS[i]; if (T > a) x = lerp((s - 1) * SP, s * SP, easeInOut(prog(T, a, b))); }
  return x;
};
const ledTex = (txt: string, color: string, label: string) => canvasTex(1024, 512, (g) => {
  g.fillStyle = '#07080c'; g.fillRect(0, 0, 1024, 512); g.strokeStyle = '#2a2f3a'; g.lineWidth = 10; g.strokeRect(5, 5, 1014, 502);
  g.textAlign = 'center'; g.font = '700 54px "Noto Sans CJK SC", sans-serif'; g.fillStyle = 'rgba(243,237,226,0.7)'; g.fillText(label, 512, 96);
  g.font = '700 300px JunoMono, monospace'; g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 40; g.fillText(txt, 512, 400);
});
const trackTex = (lanes: number) => canvasTex(1024, 2048, (g) => {
  g.fillStyle = '#9c3a2a'; g.fillRect(0, 0, 1024, 2048);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; g.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2); }
  g.fillStyle = 'rgba(245,240,230,0.9)'; for (let i = 0; i <= lanes; i++) g.fillRect(i * (1024 / lanes) - 4, 0, 8, 2048);
});
const waterTex = () => canvasTex(1024, 1024, (g) => {
  const gr = g.createRadialGradient(512, 512, 0, 512, 512, 720); gr.addColorStop(0, '#1d5a7a'); gr.addColorStop(1, '#071a26'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  g.strokeStyle = 'rgba(160,220,255,0.08)'; g.lineWidth = 3; for (let i = 0; i < 80; i++) { g.beginPath(); const y = Math.random() * 1024; g.moveTo(0, y); for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 6); g.stroke(); }
});
const scoreCard = (n: string) => canvasTex(256, 320, (g) => { g.fillStyle = '#f3ede2'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#14161c'; g.font = '700 190px JunoMono, monospace'; g.textAlign = 'center'; g.fillText(n, 128, 240); });

const count = (T: number, a: number, b: number, to: number, dec = 0) => (to * easeOut(prog(T, a, b))).toFixed(dec);

const World: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const tx = useMemo(() => ({ glow: glowTex('rgba(255,236,190,1)', 'rgba(255,200,120,0)'), cone: coneTex(), floor: floorTex(), track10: trackTex(1), track8: trackTex(8), water: waterTex(), ten: scoreCard('10') }), []);
  // camera: truck from station to station, then rise and pull back so the four become points of light
  const x = stationX(T), up = easeInOut(prog(T, 27.2, 30.5));
  const pos = new THREE.Vector3(lerp(x, 21, up), lerp(1.9, 34, up), lerp(7.2, 46, up));
  const look = new THREE.Vector3(lerp(x, 21, up), lerp(1.7, 0, up), lerp(0, -2, up));
  camera.position.copy(pos); camera.lookAt(look); (camera as THREE.PerspectiveCamera).fov = 42; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  const k81 = count(T, 12.9, 14.3, 81), k1291 = count(T, 16.3, 17.7, 12.91, 2), k983 = count(T, 20.2, 21.5, 9.83, 2);
  const b81 = useMemo(() => ledTex(k81, '#ff6a3d', '单场得分'), [k81]);
  const b1291 = useMemo(() => ledTex(k1291, GOLD, '110 米栏'), [k1291]);
  const b983 = useMemo(() => ledTex(k983, GOLD, '100 米'), [k983]);
  const ripple = prog(T, 24.4, 26.2);
  const lightUp = (i: number) => 0.35 + 0.65 * (T > STOPS[i][1] - 0.6 ? 1 : 0.2) ; // each station's spot is on once we arrive
  const beacon = prog(T, 27.6, 29.8); // the four become points of light
  const spot = (cx: number, i: number) => (
    <group>
      <spotLight position={[cx, 9, 2.5]} angle={0.5} penumbra={0.7} intensity={90 * lightUp(i)} decay={2} color="#ffe7c2" />
      <mesh position={[cx, 5.5, 0.6]}><cylinderGeometry args={[0.2, 3.0, 9, 40, 1, true]} /><meshBasicMaterial map={tx.cone} transparent opacity={0.16 * lightUp(i) * (1 - beacon)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
      <sprite position={[cx, 1.2, 0]} scale={[3 + 9 * beacon, 3 + 9 * beacon, 1]}><spriteMaterial map={tx.glow} transparent opacity={0.9 * beacon} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
    </group>
  );
  return (
    <>
      <ambientLight intensity={0.18} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[21, 0, -4]}><planeGeometry args={[90, 40]} /><meshStandardMaterial color="#0d0e12" roughness={0.9} /></mesh>
      {/* 1 · Kobe: hoop and board */}
      <group position={[0, 0, 0]}>
        {spot(0, 0)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.5]}><planeGeometry args={[7, 6]} /><meshStandardMaterial map={tx.floor} roughness={0.4} /></mesh>
        <mesh position={[0, 1.6, -1.6]}><boxGeometry args={[0.24, 3.2, 0.24]} /><meshStandardMaterial color="#20232b" /></mesh>
        <mesh position={[0, 3.3, -0.35]}><boxGeometry args={[1.8, 1.05, 0.03]} /><meshPhysicalMaterial color="#cfe3ff" transparent opacity={0.12} /></mesh>
        <mesh position={[0, 2.85, -0.05]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.014, 12, 48]} /><meshStandardMaterial color="#e2541e" /></mesh>
        <mesh position={[1.9, 2.4, -0.8]}><planeGeometry args={[2.0, 1.0]} /><meshBasicMaterial map={b81} toneMapped={false} /></mesh>
      </group>
      {/* 2 · Liu Xiang: one lane of hurdles running away from us, the clock at the finish */}
      <group position={[SP, 0, 0]}>
        {spot(0, 1)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.6, 0.006, -6]}><planeGeometry args={[1.4, 22]} /><meshStandardMaterial map={tx.track10} roughness={0.8} /></mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <group key={i} position={[-0.6, 0, 1.5 - i * 1.9]}>
            <mesh position={[0, 1.0, 0]}><boxGeometry args={[1.1, 0.08, 0.04]} /><meshStandardMaterial color={i % 2 ? '#f3ede2' : '#f3ede2'} /></mesh>
            {[-0.5, 0.5].map((dx) => <mesh key={dx} position={[dx, 0.5, 0.05]}><boxGeometry args={[0.03, 1.0, 0.03]} /><meshStandardMaterial color="#222" /></mesh>)}
          </group>))}
        <mesh position={[1.6, 2.2, -1.2]}><planeGeometry args={[2.0, 1.0]} /><meshBasicMaterial map={b1291} toneMapped={false} /></mesh>
      </group>
      {/* 3 · Su Bingtian: eight lanes, the time */}
      <group position={[2 * SP, 0, 0]}>
        {spot(0, 2)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -6]}><planeGeometry args={[6.4, 22]} /><meshStandardMaterial map={tx.track8} roughness={0.8} /></mesh>
        <mesh position={[0, 0.02, -9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6.4, 0.1]} /><meshBasicMaterial color="#f3ede2" /></mesh>
        <mesh position={[1.7, 2.3, -1.4]}><planeGeometry args={[2.0, 1.0]} /><meshBasicMaterial map={b983} toneMapped={false} /></mesh>
      </group>
      {/* 4 · Quan Hongchan: the tower, the water, one tiny ring, three tens */}
      <group position={[3 * SP, 0, 0]}>
        {spot(0, 3)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}><planeGeometry args={[9, 9]} /><meshStandardMaterial map={tx.water} roughness={0.15} metalness={0.3} emissive="#0e3550" emissiveIntensity={0.55} /></mesh>
        <mesh position={[-2.6, 2.6, -3.5]}><boxGeometry args={[0.6, 5.2, 0.6]} /><meshStandardMaterial color="#c8c4bc" roughness={0.85} /></mesh>
        <mesh position={[-1.9, 5.25, -3.2]}><boxGeometry args={[1.8, 0.12, 1.0]} /><meshStandardMaterial color="#b9b9bd" roughness={0.7} /></mesh>
        {ripple > 0 && ripple < 1 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.8, 0.02, -2.4]}><ringGeometry args={[0.05 + 0.5 * ripple, 0.07 + 0.52 * ripple, 48]} /><meshBasicMaterial color="#cfeaff" transparent opacity={0.8 * (1 - ripple)} toneMapped={false} /></mesh>}
        {[0, 1, 2].map((i) => { const a = easeOut(prog(T, 24.3 + i * 0.55, 24.6 + i * 0.55)); return (
          <mesh key={i} position={[0.9 + i * 0.75, 1.6 + 0.2 * (1 - a), -0.8]} scale={a}><planeGeometry args={[0.6, 0.75]} /><meshBasicMaterial map={tx.ten} toneMapped={false} /></mesh>); })}
      </group>
    </>
  );
};

export const MontageScene: React.FC<{ T: number }> = ({ T }) => (
  <AbsoluteFill style={{ background: '#040509' }}>
    <ThreeCanvas width={1920} height={1080} camera={{ fov: 42, position: [0, 1.9, 7.2], near: 0.05, far: 300 }} gl={{ antialias: true }}>
      <color attach="background" args={['#040509']} />
      <fog attach="fog" args={['#040509', 18, 90]} />
      <World T={T} />
    </ThreeCanvas>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
    <NameCard T={T} t0={12.7} t1={15.8} name="科比" latin="KOBE BRYANT · 2006.01.22" rows={[['对猛龙', 13.2], ['单场 81 分 · NBA 历史第二', 13.7, true]]} />
    <NameCard T={T} t0={16.2} t1={19.6} name="刘翔" latin="LIU XIANG · ATHENS 2004" rows={[['110 米栏决赛', 16.7], ['12 秒 91 · 平世界纪录', 17.4, true]]} />
    <NameCard T={T} t0={20.1} t1={23.4} name="苏炳添" latin="SU BINGTIAN · TOKYO 2021" rows={[['100 米半决赛', 20.6], ['9 秒 83 · 亚洲纪录', 21.3, true]]} />
    <NameCard T={T} t0={23.8} t1={27.2} name="全红婵" latin="QUAN HONGCHAN · TOKYO 2021" rows={[['10 米台决赛 · 14 岁', 24.3], ['三跳满分 · 466.20 分', 25.0, true]]} />
  </AbsoluteFill>
);
export const _unused = clamp;
