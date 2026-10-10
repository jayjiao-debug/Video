/* 12 – 49.2 s: one camera travelling down one tunnel.
   12.0  the light tunnel from the title turns into a race tunnel; a car ahead (Senna, Monaco 1988)
   16.7  "the whole circuit became a tunnel": walls fall away, the ceiling lights stretch into lines, the frame narrows
   20.2  "the car and I became one": the car turns to light at the vanishing point
   23.0  back to the ring tunnel; windows drift in from the walls: Kobe 81, Jordan's six threes, Carmelo 62
   44.0  the three words side by side, 46.6 the question, and the tunnel slows and goes dark for the break (49.17) */
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { canvasTex, glowTex } from './Opening';
import { GOLD, INK, clamp, prog, easeOut, easeInOut, lerp, MONO, NameCard } from './art';
import { font } from './brand/lib';

/** camera speed (m/s) and distance travelled since 12.0 s */
const speed = (T: number) => {
  if (T < 16.7) return lerp(9, 16, prog(T, 12.0, 14.0));
  if (T < 20.2) return lerp(16, 26, prog(T, 16.7, 20.0));
  if (T < 23.2) return lerp(26, 3, easeInOut(prog(T, 20.6, 23.4)));
  if (T < 46.6) return 3;
  return lerp(3, 0, easeOut(prog(T, 46.6, 49.1)));
};
const DIST: number[] = []; { let s = 0; for (let i = 0; i <= 3800; i++) { DIST.push(s); s += speed(12 + i * 0.01) * 0.01; } }
const dist = (T: number) => { const x = clamp((T - 12) / 0.01, 0, DIST.length - 1.001), i = Math.floor(x); return lerp(DIST[i], DIST[i + 1], x - i); };

const raceO = (T: number) => 1 - prog(T, 16.8, 19.6); // walls, floor, ceiling panels
const ringO = (T: number) => prog(T, 21.6, 23.4) * (1 - prog(T, 47.6, 49.1)) + (1 - prog(T, 12.0, 13.2)) * 0.9;

const panelTex = (kind: 'K' | 'J' | 'M', T: number) => canvasTex(1200, 760, (g) => {
  g.fillStyle = 'rgba(8,10,16,0.94)'; g.fillRect(0, 0, 1200, 760);
  g.strokeStyle = 'rgba(241,197,109,0.85)'; g.lineWidth = 6; g.strokeRect(10, 10, 1180, 740);
  g.textAlign = 'center';
  const led = (txt: string) => { g.font = `700 330px JunoMono, monospace`; g.fillStyle = '#ff6a3d'; g.shadowColor = '#ff6a3d'; g.shadowBlur = 40; g.fillText(txt, 600, 450); g.shadowBlur = 0; };
  if (kind === 'K') { g.font = `700 54px "Noto Sans CJK SC", sans-serif`; g.fillStyle = 'rgba(243,237,226,0.7)'; g.fillText('单场得分', 600, 120); led('81'); g.font = `700 50px "Noto Sans CJK SC", sans-serif`; g.fillStyle = GOLD; g.fillText('NBA 历史第二', 600, 640); }
  if (kind === 'M') { g.font = `700 54px "Noto Sans CJK SC", sans-serif`; g.fillStyle = 'rgba(243,237,226,0.7)'; g.fillText('单场得分', 600, 120); led('62'); g.font = `700 50px "Noto Sans CJK SC", sans-serif`; g.fillStyle = GOLD; g.fillText('麦迪逊广场花园', 600, 640); }
  if (kind === 'J') {
    // half court from above: the three-point arc, the hoop, and six shots arcing in one after another
    const hx = 600, hy = 140;
    g.strokeStyle = 'rgba(243,237,226,0.55)'; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy, 470, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
    g.strokeRect(470, 60, 260, 380); g.beginPath(); g.arc(hx, hy, 12, 0, Math.PI * 2); g.strokeStyle = '#ff7a3a'; g.stroke();
    const spots = [[-430, 220], [-300, 410], [-60, 520], [180, 500], [380, 330], [450, 170]];
    const n = clamp((T - 31.1) / 2.6) * 6;
    spots.forEach(([dx, dy], i) => {
      const k = clamp(n - i); if (k <= 0) return; const sx = hx + dx, sy = hy + dy;
      g.strokeStyle = GOLD; g.lineWidth = 7; g.beginPath(); g.moveTo(sx, sy);
      const cx = (sx + hx) / 2 + (dy > 300 ? 0 : 0), cy = Math.min(sy, hy) - 120;
      for (let j = 1; j <= 24 * k; j++) { const u = j / 24; g.lineTo((1 - u) * (1 - u) * sx + 2 * u * (1 - u) * cx + u * u * hx, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * cy + u * u * hy); }
      g.stroke(); g.fillStyle = GOLD; g.beginPath(); g.arc(sx, sy, 12, 0, Math.PI * 2); g.fill();
    });
    g.font = `700 150px JunoMono, monospace`; g.fillStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 24; g.fillText(String(Math.floor(n)), 600, 690); g.shadowBlur = 0;
    g.font = `700 44px "Noto Sans CJK SC", sans-serif`; g.fillStyle = 'rgba(243,237,226,0.75)'; g.fillText('上半场三分', 830, 680);
  }
});

const WINDOWS: { kind: 'K' | 'J' | 'M'; t0: number; t1: number; side: number }[] = [
  { kind: 'K', t0: 23.0, t1: 30.9, side: -1 }, { kind: 'J', t0: 30.4, t1: 37.2, side: -1 }, { kind: 'M', t0: 36.7, t1: 44.3, side: -1 },
];
const Window: React.FC<{ T: number; w: (typeof WINDOWS)[number]; camZ: number }> = ({ T, w, camZ }) => {
  const live = T > w.t0 && T < w.t1;
  const key = w.kind === 'J' ? Math.round(clamp((T - 31.1) / 2.6) * 6 * 4) : 0;
  const tex = useMemo(() => panelTex(w.kind, T), [w.kind, key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!live) return null;
  // the window drifts in from the wall, holds in front-left while it is read, then slides past
  const inK = easeOut(prog(T, w.t0, w.t0 + 1.2)), outK = easeInOut(prog(T, w.t1 - 0.9, w.t1));
  const zRel = lerp(-9, -4.9, inK) + 5.4 * outK, x = w.side * lerp(3.6, 1.45, inK) + w.side * 2.4 * outK;
  return (
    <mesh position={[x, 0.15, camZ + zRel]} rotation={[0, -w.side * lerp(0.75, 0.28, inK), 0]}>
      <planeGeometry args={[3.0, 1.9]} />
      <meshBasicMaterial map={tex} transparent opacity={inK * (1 - outK * 0.8)} toneMapped={false} />
    </mesh>
  );
};

const Car: React.FC<{ T: number; z: number }> = ({ T, z }) => {
  const glow = prog(T, 20.0, 22.2), shrink = 1 - easeInOut(prog(T, 20.6, 22.6));
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e9e2d4', roughness: 0.35, metalness: 0.2 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15161b', roughness: 0.7 }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.7 }), []);
  body.emissive.set(GOLD); body.emissiveIntensity = 2.5 * glow; gold.emissive.set(GOLD); gold.emissiveIntensity = 3 * glow;
  const bob = Math.sin(T * 23) * 0.006;
  if (shrink <= 0.01) return null;
  return (
    <group position={[Math.sin(T * 0.9) * 0.15, -0.88 + bob, z]} scale={shrink}>
      <mesh material={body} position={[0, 0.14, 0]}><boxGeometry args={[0.56, 0.22, 2.6]} /></mesh>
      <mesh material={body} position={[0, 0.1, -1.55]} rotation={[0.08, 0, 0]}><boxGeometry args={[0.3, 0.12, 0.8]} /></mesh>
      <mesh material={gold} position={[0, 0.02, -1.95]}><boxGeometry args={[1.25, 0.03, 0.22]} /></mesh>
      <mesh material={gold} position={[0, 0.62, 1.15]}><boxGeometry args={[0.95, 0.04, 0.26]} /></mesh>
      {[-0.32, 0.32].map((x) => <mesh key={x} material={dark} position={[x, 0.4, 1.15]}><boxGeometry args={[0.03, 0.42, 0.18]} /></mesh>)}
      <mesh material={dark} position={[0, 0.3, 0.1]}><boxGeometry args={[0.36, 0.14, 0.6]} /></mesh>
      <mesh material={gold} position={[0, 0.38, 0.05]}><sphereGeometry args={[0.13, 20, 14]} /></mesh>
      {[[-0.55, -1.0], [0.55, -1.0], [-0.58, 0.95], [0.58, 0.95]].map(([x, zz], i) => (
        <mesh key={i} material={dark} position={[x, 0.02, zz]} rotation={[T * 40, 0, Math.PI / 2]}><cylinderGeometry args={[0.24 + (zz > 0 ? 0.03 : 0), 0.24 + (zz > 0 ? 0.03 : 0), 0.3 + (zz > 0 ? 0.08 : 0), 24]} /></mesh>))}
      <mesh position={[0, 0.2, 1.32]}><boxGeometry args={[0.2, 0.06, 0.02]} /><meshBasicMaterial color="#ff2a1a" toneMapped={false} /></mesh>
    </group>
  );
};

const TunnelWorld: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const s = dist(T), camZ = -s;
  const low = 1 - prog(T, 21.5, 23.4);
  camera.position.set(Math.sin(T * 0.7) * 0.06, lerp(-0.35, -0.55, low) + Math.sin(T * 1.3) * 0.02, camZ);
  camera.lookAt(0, lerp(-0.42, -0.75, low), camZ - 30);
  const v = speed(T);
  (camera as THREE.PerspectiveCamera).fov = 52 + v * 0.45; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  const tx = useMemo(() => ({ glow: glowTex('rgba(255,236,190,1)', 'rgba(255,200,120,0)'), red: glowTex('rgba(255,60,40,1)', 'rgba(255,40,20,0)') }), []);
  const ro = raceO(T), go = ringO(T);
  // world-fixed repeating elements around the camera
  const base = Math.floor(s / 2) * 2;
  const panels = Array.from({ length: 26 }, (_, i) => -(base + i * 6 - (base % 6)));
  const kerbs = Array.from({ length: 70 }, (_, i) => -(Math.floor(s) + i - 4));
  const rings = Array.from({ length: 40 }, (_, i) => -(base + i * 2 - 2));
  const stretch = 1 + v * 0.12 * prog(T, 16.7, 19.5);
  const carZ = camZ - lerp(4.6, 6.5, prog(T, 16.7, 20)) - 14 * easeInOut(prog(T, 20.6, 22.6));
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 1.2, camZ - 4]} intensity={30 * ro} distance={18} color="#ffe2b0" />
      {/* the race tunnel */}
      {ro > 0.01 && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, camZ - 40]}><planeGeometry args={[7, 140]} /><meshStandardMaterial color="#1a1b20" roughness={0.55} transparent opacity={ro} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, camZ - 40]}><cylinderGeometry args={[3.7, 3.7, 140, 48, 1, true]} /><meshStandardMaterial color="#34353b" roughness={0.85} side={THREE.BackSide} transparent opacity={ro} /></mesh>
          {panels.map((z, i) => [-1, 1].map((sd) => (
            <mesh key={'w' + i + sd} position={[sd * 3.3, 0.4, z - 3]} rotation={[0, 0, sd * 0.35]} scale={[1, 1, stretch]}><boxGeometry args={[0.06, 0.12, 1.8]} /><meshBasicMaterial color="#ffd9a0" transparent opacity={0.85 * ro} toneMapped={false} /></mesh>)))}
          {kerbs.map((z, i) => [-1, 1].map((sd) => (
            <mesh key={i + '-' + sd} position={[sd * 3.05, -1.19, z]}><boxGeometry args={[0.45, 0.02, 0.98]} /><meshStandardMaterial color={(Math.abs(Math.round(z)) % 2) ? '#c8352a' : '#eeeae2'} roughness={0.6} transparent opacity={ro} /></mesh>)))}
          {panels.map((z, i) => (
            <mesh key={'p' + i} position={[0, 2.85, z]} scale={[1, 1, stretch]}><boxGeometry args={[1.6, 0.05, 0.7]} /><meshBasicMaterial color="#fff1d6" transparent opacity={ro + (1 - ro) * prog(T, 16.7, 18) * (1 - prog(T, 19.5, 20.8))} toneMapped={false} /></mesh>))}
        </group>
      )}
      <Car T={T} z={carZ} />
      {T < 22.6 && <sprite position={[0, -0.7, carZ + 1.4]} scale={[0.9 + 2.5 * prog(T, 20, 22), 0.5 + 2.5 * prog(T, 20, 22), 1]}><spriteMaterial map={tx.red} transparent opacity={0.7 * (1 - prog(T, 20.2, 21.5))} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>}
      {/* the light at the end: grows as the car becomes light */}
      <sprite position={[0, -0.4, camZ - 60]} scale={[14 + 40 * easeInOut(prog(T, 19.5, 22.4)) * (1 - prog(T, 22.6, 24.5)), 14 + 40 * easeInOut(prog(T, 19.5, 22.4)) * (1 - prog(T, 22.6, 24.5)), 1]}>
        <spriteMaterial map={tx.glow} transparent opacity={0.25 + 0.65 * prog(T, 17, 21) * (1 - 0.6 * prog(T, 23, 25)) * (1 - prog(T, 47, 49))} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* the ring tunnel */}
      {go > 0.01 && rings.map((z, i) => (
        <mesh key={'r' + i} position={[0, -0.4, z]}>
          <torusGeometry args={[2.1 + (i % 3) * 0.05, 0.018, 8, 128]} />
          <meshBasicMaterial color={Math.abs(Math.round(z / 2)) % 4 === 0 ? '#8fb8ff' : GOLD} transparent opacity={go * 0.75 * Math.exp(-(camZ - z) * -0.0 - Math.abs(z - camZ) * 0.03)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>))}
      {WINDOWS.map((w) => <Window key={w.kind} T={T} w={w} camZ={camZ} />)}
    </>
  );
};

/** the three words, side by side, then the question */
const Summary: React.FC<{ T: number }> = ({ T }) => {
  const items: [string, string][] = [['隧道', '塞纳'], ['模糊', '汤普森'], ['说不清', '科比']];
  const out = 1 - prog(T, 46.3, 46.9); if (T < 43.9 || out <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 70, opacity: out }}>
      {items.map(([w, who], i) => { const k = easeOut(prog(T, 44.0 + i * 0.55, 44.4 + i * 0.55)); return (
        <div key={i} style={{ width: 360, height: 230, borderRadius: 18, border: `2px solid ${GOLD}`, background: 'rgba(6,8,14,0.78)', opacity: k, transform: `translateY(${(1 - k) * 24}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: 84, color: INK }}>{w}</div>
          <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 30, color: 'rgba(243,237,226,0.6)', marginTop: 8 }}>{who}</div>
        </div>); })}
    </div>
  );
};

export const TunnelScene: React.FC<{ T: number }> = ({ T }) => {
  // the frame narrows to the light while "the whole circuit became a tunnel"
  const narrow = easeInOut(prog(T, 16.9, 19.8)) * (1 - easeInOut(prog(T, 21.4, 23.4)));
  const dark = prog(T, 48.2, 49.15);
  return (
    <AbsoluteFill style={{ background: '#040509' }}>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 60, position: [0, -0.35, 0], near: 0.05, far: 300 }} gl={{ antialias: true }}>
        <color attach="background" args={['#040509']} />
        <fog attach="fog" args={['#040509', 20, 90]} />
        <TunnelWorld T={T} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) ${lerp(55, 9, narrow)}%, rgba(2,3,6,${0.55 + 0.4 * narrow}) ${lerp(100, 30, narrow)}%)` }} />
      <NameCard T={T} t0={12.5} t1={16.6} name="塞纳" latin="AYRTON SENNA · MONACO 1988" rows={[['排位赛 1:23.998', 13.0], ['队友普罗斯特 1:25.425', 13.5], ['快了 1.4 秒', 14.1, true]]} />
      <NameCard T={T} t0={23.4} t1={30.5} align="right" name="科比" latin="KOBE BRYANT · 2006.01.22" rows={[['对猛龙', 23.9], ['单场 81 分', 24.4, true]]} />
      <NameCard T={T} t0={30.8} t1={36.8} align="right" name="乔丹" latin="MICHAEL JORDAN · 1992 FINALS G1" rows={[['对开拓者', 31.3], ['上半场 35 分', 31.8, true]]} />
      <NameCard T={T} t0={37.0} t1={43.9} align="right" name="安东尼" latin="CARMELO ANTHONY · 2014.01.24" rows={[['对山猫', 37.5], ['单场 62 分', 38.0, true]]} />
      <Summary T={T} />
      <AbsoluteFill style={{ background: '#000', opacity: dark }} />
    </AbsoluteFill>
  );
};
export const LED_FONT = MONO;
