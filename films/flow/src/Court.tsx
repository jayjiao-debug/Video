/* The arena, four visits:
   72.55  the switch: a dark court, one spotlight; a cloud of white powder bursts, and the arena lights come on row by row
   76.35  the basket: one shot, a timer from release to swish (one second: feedback that fast)
   80.6   the lights drop to almost nothing … 81.40 (the drop) everything on: LeBron, 25 points in a row, the board counting
   84.7   the camera dives into the rim and down the light tunnel while the three metaphors merge into one light
   105.1  the callback: the same hoop in the dark, one last ball, and the lights go out one by one */
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { canvasTex, glowTex, coneTex, ballTex, floorTex, Tunnel } from './Opening';
import { GOLD, INK, clamp, prog, easeOut, easeInOut, lerp, NameCard, Tag, MONO } from './art';
import { font } from './brand/lib';

const RIM = new THREE.Vector3(0, 3.05, 0);
type Shot = { t: number; from: [number, number, number]; flight: number };
const LB = [81.62, 81.98, 82.3, 82.6, 82.88, 83.14, 83.38, 83.62, 83.86, 84.1];
const SHOTS: Shot[] = [
  { t: 78.3, from: [-2.6, 2.3, 4.4], flight: 1.0 },
  ...LB.map((t, i): Shot => ({ t, from: [(i % 2 ? 1 : -1) * (1.6 + (i % 3) * 0.6), 2.3, 2.6 + (i % 4) * 0.5], flight: 0.55 })),
  { t: 106.3, from: [-2.2, 2.3, 4.2], flight: 1.05 },
];
const ballAt = (s: Shot, T: number): THREE.Vector3 | null => {
  const t0 = s.t - s.flight; if (T < t0 || T > s.t + 0.8) return null;
  if (T <= s.t) { const u = (T - t0) / s.flight, p = new THREE.Vector3(...s.from).lerp(RIM.clone().add(new THREE.Vector3(0, 0.05, 0)), u); p.y += Math.sin(Math.PI * u) * (1 + 0.6 * s.flight) * (1 - u * 0.3); return p; }
  const d = T - s.t; return new THREE.Vector3(0.02, 3.05 - 2.2 * d - 4.9 * d * d, 0.04);
};
const netKick = (T: number) => { let k = 0; for (const s of SHOTS) { const d = T - s.t; if (d >= 0 && d < 0.55) k = Math.max(k, Math.sin(Math.PI * d / 0.55) * Math.exp(-d * 2)); } return k; };

/** how lit the arena is (0 = one spotlight, 1 = everything on), and how many ceiling rows are on */
const litAt = (T: number) => {
  if (T < 76.35) return 0.12 + 0.88 * easeInOut(prog(T, 74.0, 75.7));
  if (T < 81.4) return 1 - 0.9 * easeInOut(prog(T, 80.5, 81.3));
  if (T < 100) return 1.15;
  return 0.25 * (1 - prog(T, 107.6, 109.9));
};
const rowOn = (T: number, r: number, n: number) => {
  if (T < 76.35) return prog(T, 74.0 + r * 0.22, 74.15 + r * 0.22);
  if (T < 81.4) return 1 - prog(T, 80.5 + r * 0.08, 80.7 + r * 0.08);
  if (T < 100) return 1;
  return T < 107.4 ? 0.35 : 0.35 * (1 - prog(T, 107.5 + (n - 1 - r) * 0.35, 107.7 + (n - 1 - r) * 0.35));
};

const boardTex = (pts: number) => canvasTex(1024, 384, (g) => {
  g.fillStyle = '#07080c'; g.fillRect(0, 0, 1024, 384); g.strokeStyle = '#2a2f3a'; g.lineWidth = 8; g.strokeRect(4, 4, 1016, 376);
  g.textAlign = 'center'; g.font = '700 50px "Noto Sans CJK SC", sans-serif'; g.fillStyle = 'rgba(243,237,226,0.75)'; g.fillText('詹姆斯 · 连续得分', 512, 84);
  g.font = '700 220px JunoMono, monospace'; g.fillStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 30; g.fillText(String(pts), 512, 320);
});

const CourtWorld: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const tx = useMemo(() => ({ ball: ballTex(), floor: floorTex(), bokeh: glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), pool: glowTex('rgba(255,226,170,0.55)', 'rgba(255,226,170,0)'), cone: coneTex() }), []);
  const lit = litAt(T);
  // ---- camera
  let pos = new THREE.Vector3(), look = new THREE.Vector3(), fov = 40;
  if (T < 76.35) { const a = easeInOut(prog(T, 72.55, 76.35)); pos.set(lerp(-0.4, 0.3, a), lerp(1.7, 1.95, a), lerp(7.9, 7.2, a)); look.set(0.4, lerp(2.4, 2.8, a), lerp(3.0, 1.0, a)); }
  else if (T < 81.4) { const a = easeInOut(prog(T, 76.35, 81.3)); pos.set(lerp(1.2, 0.5, a), lerp(2.2, 2.5, a), lerp(6.4, 5.0, a)); look.set(0, 3.05, 0); fov = 38; }
  else if (T < 84.7) { const a = easeOut(prog(T, 81.4, 84.7)); pos.set(lerp(0.4, 0.2, a), lerp(2.35, 2.6, a), lerp(6.6, 5.4, a)); look.set(0, lerp(3.9, 3.7, a), -1); fov = 44; }
  else if (T < 104) {
    const dive = prog(T, 84.7, 86.3), k = Math.pow(dive, 2.2);
    pos.set(lerp(0.2, 0, easeOut(dive)), lerp(2.6, 3.05, easeOut(dive)), lerp(5.4, 0, k)); look.set(0, 3.05, 0).lerp(new THREE.Vector3(0, 3.05, -60), easeInOut(prog(T, 85.4, 86.3))); fov = lerp(44, 62, easeInOut(prog(T, 85.4, 86.5)));
    if (T > 86.3) { const d = T - 86.3; pos.set(0, 3.05, -(6.5 / 0.35) * (1 - Math.exp(-0.35 * d))); look.set(0, 3.05, pos.z - 60); }
  } else { const a = easeInOut(prog(T, 105.1, 110.2)); pos.set(lerp(0.7, 0.3, a), lerp(2.1, 2.35, a), lerp(6.2, 5.4, a)); look.set(0, 3.1, 0); }
  if (T >= 81.4 && T < 81.55) { const s = (1 - (T - 81.4) / 0.15) * 0.04; pos.x += Math.sin(T * 130) * s; pos.y += Math.cos(T * 110) * s; }
  camera.position.copy(pos); camera.lookAt(look); (camera as THREE.PerspectiveCamera).fov = fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  // ---- crowd, ceiling rows
  const crowd = useMemo(() => { const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = (i * 0.618) % 1, b = (i * 0.37 + 0.11) % 1, c = (i * 0.233 + 0.5) % 1, ang = (a - 0.5) * Math.PI * 1.1, r = 16 + 14 * b;
      pos.set([Math.sin(ang) * r, 2.5 + 11 * c * (0.5 + b * 0.5), -Math.cos(ang) * r * 0.8 - 4], i * 3); const w = 0.35 + 0.65 * ((i * 0.77) % 1); col.set([w, 0.82 * w, 0.62 * w], i * 3); }
    return { pos, col }; }, []);
  const heads = useMemo(() => { const out: [number, number, number][] = []; for (let row = 0; row < 7; row++) for (let k = 0; k < 46; k++) { const ang = ((k + (row % 2) * 0.5) / 46 - 0.5) * Math.PI * 1.05, r = 13 + row * 1.9; out.push([Math.sin(ang) * r, 1.3 + row * 1.25, -Math.cos(ang) * r * 0.8 - 3]); } return out; }, []);
  const ROWS = 6;
  // ---- net
  const net = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 5 * 2 * 2 * 3), 3)), []);
  { const kick = netKick(T), arr = net.attributes.position.array as Float32Array; let o = 0;
    const P = (s: number, l: number) => { const k = l / 5, rr = lerp(0.23, 0.13 - 0.04 * kick, k), y = 3.05 - k * (0.42 + 0.18 * kick), a = (s / 12) * Math.PI * 2 + (l % 2) * (Math.PI / 12); return [Math.cos(a) * rr, y, Math.sin(a) * rr]; };
    for (let s = 0; s < 12; s++) for (let l = 0; l < 5; l++) for (const [a, b] of [[P(s, l), P(s, l + 1)], [P(s + 1, l), P(s, l + 1)]]) { arr.set(a, o); arr.set(b, o + 3); o += 6; }
    net.attributes.position.needsUpdate = true; }
  // ---- chalk
  const chalk = useMemo(() => { const n = 1400, v: number[][] = [], p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = (i * 0.618) % 1, w = (i * 0.37) % 1, th = u * Math.PI * 2, ph = Math.acos(1 - w * 1.6), sp = 0.8 + 2.6 * ((i * 0.233) % 1);
    v.push([Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp * 0.9 + 0.6, Math.sin(ph) * Math.sin(th) * sp * 0.7]); } return { n, v, p, geo: new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3)) }; }, []);
  const ct = T - 73.25, chalkO = ct > 0 && T < 76.6 ? Math.exp(-ct / 2.4) * (1 - prog(T, 76.0, 76.5)) : 0;
  if (chalkO > 0) { const tau = (1 - Math.exp(-2.2 * ct)) / 2.2; chalk.v.forEach(([vx, vy, vz], i) => chalk.p.set([0.6 + vx * tau, 2.25 + vy * tau - 0.12 * ct * ct, 3.2 + vz * tau], i * 3)); chalk.geo.attributes.position.needsUpdate = true; }
  // ---- scoreboard (LeBron)
  const made = LB.filter((t) => T >= t).length, pts = made === 10 ? 25 : Math.round(made * 2.5);
  const board = useMemo(() => boardTex(pts), [pts]);
  const boardO = prog(T, 81.4, 81.5) * (1 - prog(T, 85.6, 86.1));
  const arenaO = T > 84.7 && T < 104 ? 1 - prog(T, 85.7, 86.35) : 1;
  const tunnelO = T > 84.7 && T < 104 ? prog(T, 85.4, 86.35) * (1 - prog(T, 92.6, 93.1)) : 0;
  const rimTurn = T > 84.7 && T < 104 ? easeInOut(prog(T, 85.75, 86.2)) : 0;

  return (
    <>
      <ambientLight intensity={0.05 + 0.3 * lit} />
      <spotLight position={[0, 13, 3]} angle={0.42} penumbra={0.7} intensity={(150 + 160 * lit) * arenaO} decay={2} color="#ffe7c2" />
      {T < 76.4 && <spotLight position={[0.6, 12, 3.2]} angle={0.16} penumbra={0.6} intensity={220 * (1 - 0.5 * lit)} decay={2} color="#fff2dc" />}
      <directionalLight position={[2, 3, 10]} intensity={(0.2 + 0.8 * lit) * arenaO} color="#9fb8e8" />
      <group visible={arenaO > 0.01}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]}><planeGeometry args={[40, 40]} /><meshStandardMaterial map={tx.floor} roughness={0.35} metalness={0.05} transparent opacity={arenaO} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]}><planeGeometry args={[11, 11]} /><meshBasicMaterial map={tx.pool} transparent opacity={arenaO * (0.5 + 0.5 * lit)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
        <mesh position={[0, 8, 0.6]}><cylinderGeometry args={[0.25, 3.2, 12, 48, 1, true]} /><meshBasicMaterial map={tx.cone} transparent opacity={0.2 * arenaO} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} /></mesh>
        {T < 76.4 && <mesh position={[0.6, 7.5, 3.2]}><cylinderGeometry args={[0.15, 1.3, 11, 32, 1, true]} /><meshBasicMaterial map={tx.cone} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} /></mesh>}
        {/* hoop */}
        <mesh position={[0, 1.6, -1.6]}><boxGeometry args={[0.28, 3.2, 0.28]} /><meshStandardMaterial color="#20232b" roughness={0.6} transparent opacity={arenaO} /></mesh>
        <mesh position={[0, 3.25, -0.95]} rotation={[0.6, 0, 0]}><boxGeometry args={[0.16, 0.16, 1.4]} /><meshStandardMaterial color="#20232b" roughness={0.6} transparent opacity={arenaO} /></mesh>
        <mesh position={[0, 3.5, -0.15]}><boxGeometry args={[1.83, 1.07, 0.03]} /><meshPhysicalMaterial color="#cfe3ff" transparent opacity={0.12 * arenaO} roughness={0.05} /></mesh>
        {[[0, 4.02, 1.83, 0.05], [0, 2.98, 1.83, 0.05], [-0.9, 3.5, 0.05, 1.07], [0.9, 3.5, 0.05, 1.07], [0, 3.3, 0.59, 0.04], [0, 3.43, 0.04, 0.45], [-0.28, 3.43, 0.04, 0.45], [0.28, 3.43, 0.04, 0.45]].map(([px, py, w, h], i) => (
          <mesh key={i} position={[px, py, -0.13]}><planeGeometry args={[w, h]} /><meshBasicMaterial color="#f4f1ea" transparent opacity={0.85 * arenaO} toneMapped={false} /></mesh>))}
        <lineSegments geometry={net}><lineBasicMaterial color="#f2efe8" transparent opacity={0.9 * arenaO} /></lineSegments>
        {/* scoreboard */}
        {boardO > 0 && <mesh position={[0, 5.15, -2.2]}><planeGeometry args={[3.0, 1.125]} /><meshBasicMaterial map={board} transparent opacity={boardO * arenaO} toneMapped={false} /></mesh>}
        {/* crowd */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[crowd.pos, 3]} /><bufferAttribute attach="attributes-color" args={[crowd.col, 3]} /></bufferGeometry>
          <pointsMaterial size={0.38} map={tx.bokeh} vertexColors transparent opacity={(0.25 + 0.55 * lit) * arenaO} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
        {heads.map(([hx, hy, hz], i) => (
          <group key={'h' + i} position={[hx, hy, hz]}>
            <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.2, 10, 8]} /><meshStandardMaterial color="#090a0e" roughness={0.9} transparent opacity={0.85 * arenaO} /></mesh>
            <mesh><sphereGeometry args={[0.34, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#090a0e" roughness={0.9} transparent opacity={0.85 * arenaO} /></mesh>
          </group>))}
        {/* ceiling rows: they switch on (the switch), and off (the callback) */}
        {Array.from({ length: ROWS }, (_, r) => Array.from({ length: 14 }, (_, k) => (
          <sprite key={r + '-' + k} position={[(k - 6.5) * 2.6, 14.5 - r * 0.2, -13 + r * 3.2]} scale={[1.3, 1.3, 1]}>
            <spriteMaterial map={tx.bokeh} color="#ffe2b0" transparent opacity={0.9 * rowOn(T, r, ROWS) * arenaO} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>)))}
        {/* balls */}
        {SHOTS.map((s, i) => { const p = ballAt(s, T); return p ? <mesh key={i} position={p} rotation={[T * 9 + i, T * 3, 0]}><sphereGeometry args={[0.12, 40, 28]} /><meshStandardMaterial map={tx.ball} roughness={0.75} transparent opacity={arenaO} /></mesh> : null; })}
        {/* chalk */}
        {chalkO > 0 && <points geometry={chalk.geo}><pointsMaterial size={0.13} map={tx.bokeh} color="#ffffff" transparent opacity={0.8 * chalkO} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation /></points>}
      </group>
      <mesh position={[0, 3.05, 0]} rotation={[(Math.PI / 2) * (1 - rimTurn), 0, 0]} scale={1 + 1.2 * easeInOut(prog(T, 85.9, 86.3)) * (T < 104 ? 1 : 0)}>
        <torusGeometry args={[0.23, 0.012, 16, 64]} /><meshStandardMaterial color="#e2541e" emissive="#ff6a2a" emissiveIntensity={0.3 + 2.2 * tunnelO} roughness={0.4} metalness={0.3} />
      </mesh>
      <Tunnel T={T} o={tunnelO} />
    </>
  );
};

/** the basket's stopwatch: release → swish */
const Stopwatch: React.FC<{ T: number }> = ({ T }) => {
  const k = easeOut(prog(T, 76.9, 77.2)) * (1 - prog(T, 79.8, 80.2)); if (k <= 0) return null;
  const t = clamp(T - 77.3, 0, 1.0), done = T >= 78.3;
  return (
    <div style={{ position: 'absolute', right: 120, top: 120, opacity: k, textAlign: 'right' }}>
      <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 30, color: 'rgba(243,237,226,0.7)', letterSpacing: '0.2em' }}>出手 → 进球</div>
      <div style={{ fontFamily: MONO, fontSize: 120, color: done ? GOLD : INK, textShadow: done ? '0 0 24px rgba(241,197,109,0.6)' : 'none' }}>{t.toFixed(2)}<span style={{ fontSize: 50 }}> 秒</span></div>
      <div style={{ fontFamily: font.sans, fontWeight: 900, fontSize: 40, color: GOLD, opacity: prog(T, 78.35, 78.6) }}>马上知道：进了</div>
    </div>
  );
};

/** the three metaphors meet: radio, switch, basket → one light */
const Merge: React.FC<{ T: number }> = ({ T }) => {
  if (T < 84.8 || T > 92.8) return null;
  const items: [string, number][] = [['调频', -1], ['开关', 0], ['篮筐', 1]];
  const join = easeInOut(prog(T, 87.6, 88.8)), out = 1 - prog(T, 91.6, 92.6);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {items.map(([w, x], i) => { const a = easeOut(prog(T, 84.9 + i * 0.4, 85.3 + i * 0.4)); return (
        <div key={w} style={{ position: 'absolute', left: 960 + x * 360 * (1 - join) - 120, top: 400 - 120, width: 240, height: 240, borderRadius: '50%', border: `3px solid ${GOLD}`, background: 'rgba(6,8,14,0.6)',
          opacity: a * (1 - join * 0.9), transform: `scale(${lerp(0.8, 1, a) * (1 - 0.5 * join)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 64, color: INK }}>{w}</div>); })}
      <div style={{ position: 'absolute', left: 960 - 260, top: 400 - 260, width: 520, height: 520, borderRadius: '50%', opacity: join * (1 - prog(T, 90.2, 91.4)),
        background: 'radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(241,197,109,0.5) 30%, rgba(241,197,109,0) 70%)', transform: `scale(${lerp(0.3, 1.2, join)})` }} />
    </AbsoluteFill>
  );
};

export const CourtScene: React.FC<{ T: number }> = ({ T }) => {
  const flash = T >= 81.4 && T < 81.75 ? Math.exp(-(T - 81.4) / 0.08) * 0.75 : 0;
  const white = T < 100 ? prog(T, 92.6, 93.1) : 0;
  return (
    <AbsoluteFill style={{ background: '#040509' }}>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 40, position: [0, 1.8, 8], near: 0.02, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={['#040509']} />
        <fog attach="fog" args={['#040509', 14, 60]} />
        <CourtWorld T={T} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <NameCard T={T} t0={72.8} t1={76.3} name="詹姆斯" latin="LEBRON JAMES" rows={[['赛前仪式：抛一把粉', 73.3]]} />
      <Tag T={T} t0={74.7} t1={76.3} text="固定的仪式 = 告诉大脑：开始了" x={960} y={770} center />
      <Stopwatch T={T} />
      <NameCard T={T} t0={81.6} t1={84.6} name="詹姆斯" latin="LEBRON JAMES · 2007 EAST FINALS G5" rows={[['对活塞', 82.0], ['连得 25 分', 82.4, true]]} />
      <Merge T={T} />
      <AbsoluteFill style={{ background: '#fff6e0', opacity: flash }} />
      <AbsoluteFill style={{ background: '#f6efe0', opacity: white }} />
    </AbsoluteFill>
  );
};
