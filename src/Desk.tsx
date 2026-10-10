/* The psychologist's desk (49.17 – 72.55 s, and again 93.1 – 105.1 s).
   The break: a lamp warms up over an open notebook; the people he interviewed are written in, one by one; then
   "FLOW · 心流" in gold ink, and a ribbon of water runs out of the page and splits into three streams (the rules).
   The build opens on the radio at the end of the desk: the needle finds noise (too hard), silence (too easy), music.
   Later the same desk, lit, carries the three take-away cards. Only objects act; nobody is shown. */
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { canvasTex, glowTex, coneTex } from './Opening';
import { GOLD, INK, RED, clamp, prog, easeOut, easeInOut, lerp, NameCard, MONO } from './art';
import { font } from './brand/lib';

const woodTex = () => canvasTex(2048, 1024, (g) => {
  for (let i = 0; i < 16; i++) { const l = 52 + ((i * 37) % 11); g.fillStyle = `rgb(${l + 40},${l + 18},${l - 4})`; g.fillRect(0, i * 64, 2048, 64);
    for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(30,14,4,${0.12 + 0.1 * Math.random()})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = i * 64 + Math.random() * 64;
      g.moveTo(0, y); for (let x = 0; x <= 2048; x += 64) g.lineTo(x, y + Math.sin(x * 0.004 + k) * 6); g.stroke(); } }
});
/** the notebook spread; written as time passes */
const PEOPLE = [['攀岩者', 50.2], ['画家', 51.1], ['棋手', 51.9], ['作曲家', 52.7], ['运动员', 53.5], ['外科医生', 54.3]] as const;
const pageTex = (T: number, v5 = false) => canvasTex(2048, 1400, (g) => {
  g.fillStyle = '#efe7d6'; g.fillRect(0, 0, 2048, 1400);
  const sh = g.createLinearGradient(980, 0, 1068, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.5, 'rgba(0,0,0,0.22)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(980, 0, 88, 1400);
  g.strokeStyle = 'rgba(80,110,150,0.25)'; g.lineWidth = 2; for (let y = 160; y < 1360; y += 70) { g.beginPath(); g.moveTo(60, y); g.lineTo(990, y); g.moveTo(1060, y); g.lineTo(1990, y); g.stroke(); }
  g.fillStyle = '#2d2620'; g.font = '700 64px "Noto Serif CJK SC", serif'; g.fillText('访谈笔记', 90, 120);
  PEOPLE.forEach(([w, t0], i) => {
    const k = clamp((T - t0) / 0.5); if (k <= 0) return; const y = 220 + i * 140;
    g.save(); g.beginPath(); g.rect(80, y - 70, 900 * k, 110); g.clip();
    g.fillStyle = '#2d2620'; g.font = '700 60px "Noto Sans CJK SC", sans-serif'; g.fillText(w, 100, y);
    g.strokeStyle = 'rgba(45,38,32,0.7)'; g.lineWidth = 4; g.beginPath(); for (let x = 400; x < 940; x += 6) { const yy = y - 18 + Math.sin(x * 0.09 + i * 2) * 10 * Math.sin(x * 0.013 + i); x === 400 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    g.restore();
  });
  const same = clamp((T - 55.4) / 0.6); if (same > 0) { g.save(); g.globalAlpha = same; g.fillStyle = '#8a2a1c'; g.font = '700 58px "Noto Sans CJK SC", sans-serif'; g.fillText('→ 同一种感觉', 100, 1100); g.restore(); }
  const flow = clamp((T - 57.9) / 0.9); if (flow > 0) {
    g.save(); g.beginPath(); g.rect(1080, 300, 900 * flow, 800); g.clip();
    g.fillStyle = '#b8862e'; g.font = 'italic 600 230px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center'; g.fillText('Flow', 1520, 560);
    g.font = '900 260px "Noto Serif CJK SC", serif'; g.fillText('心流', 1520, 900); g.restore();
  }
  const rules = (T > 93) ? 1 : 0; if (rules) {
    g.fillStyle = '#2d2620'; g.font = '700 64px "Noto Sans CJK SC", sans-serif';
    (v5 ? [['① 难度', 94.0], ['② 目标', 94.6], ['③ 反馈', 95.2]] : [['① 调频', 94.0], ['② 开关', 94.6], ['③ 篮筐', 95.2]]).forEach(([w, t0], i) => { if (T > (t0 as number)) g.fillText(w as string, 1140, 1030 + i * 100); });
  }
});
const dialTex = (needle: number, on: number) => canvasTex(1024, 256, (g) => {
  g.fillStyle = `rgb(${30 + 120 * on},${22 + 90 * on},${10 + 40 * on})`; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = 'rgba(30,20,10,0.8)'; g.lineWidth = 4; for (let i = 0; i <= 40; i++) { const x = 60 + i * 22.6; g.beginPath(); g.moveTo(x, 40); g.lineTo(x, i % 5 ? 90 : 120); g.stroke(); }
  g.fillStyle = 'rgba(30,20,10,0.85)'; g.font = '700 38px JunoMono, monospace'; ['88', '92', '96', '100', '104', '108'].forEach((m, i) => g.fillText(m, 40 + i * 180, 190));
  g.fillStyle = '#c0281c'; g.fillRect(60 + needle * 904 - 4, 20, 8, 216);
});
const grilleTex = () => canvasTex(512, 512, (g) => { g.fillStyle = '#3a2a1c'; g.fillRect(0, 0, 512, 512); g.fillStyle = '#1c130b'; for (let y = 16; y < 512; y += 22) for (let x = 16 + ((y / 22) % 2) * 11; x < 512; x += 22) { g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); } });

/** where the radio's needle points: noise (too hard) → silence (too easy) → the station */
const needleAt = (T: number) => { if (T < 65.6) return 0.5; if (T < 67.6) return lerp(0.5, 0.1, easeInOut(prog(T, 65.6, 66.4))); if (T < 69.5) return lerp(0.1, 0.9, easeInOut(prog(T, 67.6, 68.4))); return lerp(0.9, 0.52, easeInOut(prog(T, 69.5, 70.3))); };

const DeskWorld: React.FC<{ T: number; v5?: boolean }> = ({ T, v5 = false }) => {
  const { camera } = useThree();
  const tx = useMemo(() => ({ wood: woodTex(), glow: glowTex('rgba(255,226,170,1)', 'rgba(255,200,120,0)'), cone: coneTex(), grille: grilleTex() }), []);
  const pageKey = Math.round(T * 6);
  const page = useMemo(() => pageTex(T, v5), [pageKey, v5]); // eslint-disable-line react-hooks/exhaustive-deps
  const radioOn = prog(T, 65.45, 65.9) * (T > 72.6 && T < 93 ? 0 : 1);
  const nd = needleAt(T);
  const dial = useMemo(() => dialTex(nd, radioOn), [Math.round(nd * 200), Math.round(radioOn * 10)]); // eslint-disable-line react-hooks/exhaustive-deps
  const lamp = T < 90 ? easeOut(prog(T, 49.3, 49.9)) : 1;
  // camera
  let pos: THREE.Vector3, look: THREE.Vector3;
  if (T < 65.45) {
    const a = easeInOut(prog(T, 49.17, 57.6)), b = easeInOut(prog(T, 57.6, 64.8));
    pos = new THREE.Vector3(lerp(0.45, 0.2, a), lerp(1.55, 1.12, a) + 0.25 * b, lerp(2.3, 1.45, a) + 0.5 * b);
    look = new THREE.Vector3(lerp(0.05, 0.25, b), lerp(0.05, 0.3, b), lerp(0, -0.15, b));
  } else if (T < 80) {
    const a = easeInOut(prog(T, 65.45, 66.6)), d = prog(T, 65.45, 72.6);
    pos = new THREE.Vector3(lerp(0.35, 0.62 + 0.06 * d, a), lerp(1.35, 0.52, a), lerp(1.9, 0.95 - 0.12 * d, a));
    look = new THREE.Vector3(lerp(0.3, 0.98, a), lerp(0.25, 0.22, a), lerp(-0.1, -0.3, a));
  } else {
    const a = easeOut(prog(T, 93.1, 96.4));
    pos = new THREE.Vector3(lerp(0.1, 0.05, a), lerp(1.1, 1.5, a), lerp(1.2, 2.5, a)); look = new THREE.Vector3(0.1, 0.1, -0.1);
  }
  camera.position.copy(pos); camera.lookAt(look);
  // the water: a ribbon out of the right-hand page, splitting into three streams at 60.8
  const water = useMemo(() => { const n = 900, p = new Float32Array(n * 3), c = new Float32Array(n * 3); return { n, p, c, seed: Array.from({ length: n }, (_, i) => [(i * 0.618) % 1, ((i * 0.37) % 1) - 0.5, i % 3]) }; }, []);
  const wo = prog(T, 57.9, 58.8) * (1 - prog(T, 64.6, 65.4));
  if (wo > 0) {
    const split = easeInOut(prog(T, 60.8, 62.2));
    water.seed.forEach(([u0, j, lane], i) => {
      const u = (u0 + (T - 57.9) * 0.22) % 1, grow = clamp((T - 57.9) * 0.6 - u * 0.4 + 0.2);
      const x = lerp(0.3, 0.2, u) + Math.sin(u * 7 + T) * 0.05 + (lane - 1) * 0.35 * split * u, y = 0.02 + u * u * 0.9, z = lerp(-0.05, 1.0, u) + j * 0.03;
      water.p.set([x + j * 0.04, y + Math.sin(u * 20 + i) * 0.01, z], i * 3);
      const k = grow * (1 - u * 0.6); const gold = u; water.c.set([lerp(0.45, 1, gold) * k, lerp(0.7, 0.8, gold) * k, lerp(1, 0.45, gold) * k], i * 3);
    });
  }
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(water.p, 3)); g.setAttribute('color', new THREE.BufferAttribute(water.c, 3)); return g; }, [water]);
  geo.attributes.position.needsUpdate = true; (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  return (
    <>
      <ambientLight intensity={0.06 + 0.1 * lamp} />
      <spotLight position={[-0.62, 0.82, -0.12]} angle={0.75} penumbra={0.8} intensity={6 * lamp} decay={1.4} color="#ffd9a0" />
      <pointLight position={[1.0, 0.5, 0.2]} intensity={0.9 * radioOn} distance={2} color="#ffb060" />
      {/* desk + wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.4, 1.8]} /><meshStandardMaterial map={tx.wood} roughness={0.45} /></mesh>
      <mesh position={[0, 1.2, -0.95]}><planeGeometry args={[8, 4]} /><meshStandardMaterial color="#14161c" roughness={1} /></mesh>
      {/* lamp */}
      <group position={[-1.0, 0, -0.38]}>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.13, 0.15, 0.04, 32]} /><meshStandardMaterial color="#1d1f24" metalness={0.6} roughness={0.35} /></mesh>
        <mesh position={[0.08, 0.36, 0.06]} rotation={[0.18, 0, -0.35]}><cylinderGeometry args={[0.012, 0.012, 0.72, 12]} /><meshStandardMaterial color="#2a2c33" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0.3, 0.75, 0.2]} rotation={[0.5, 0, 0.9]}><cylinderGeometry args={[0.012, 0.012, 0.42, 12]} /><meshStandardMaterial color="#2a2c33" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0.4, 0.82, 0.27]} rotation={[0.3, 0, 0.55]}><coneGeometry args={[0.14, 0.18, 32, 1, true]} /><meshStandardMaterial color="#1f4a3a" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} /></mesh>
        <sprite position={[0.42, 0.76, 0.28]} scale={[0.35 * lamp, 0.35 * lamp, 1]}><spriteMaterial map={tx.glow} transparent opacity={0.9 * lamp} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      </group>
      <mesh position={[-0.35, 0.42, 0.0]} rotation={[0, 0, 0.62]}><cylinderGeometry args={[0.05, 0.62, 0.95, 32, 1, true]} /><meshBasicMaterial map={tx.cone} transparent opacity={0.16 * lamp} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
      {/* notebook */}
      <mesh position={[0.08, 0.008, 0.02]} rotation={[-Math.PI / 2, 0, 0.04]}><planeGeometry args={[1.16, 0.79]} /><meshStandardMaterial map={page} roughness={0.85} /></mesh>
      <mesh position={[0.08, 0.004, 0.02]} rotation={[-Math.PI / 2, 0, 0.04]}><planeGeometry args={[1.22, 0.84]} /><meshStandardMaterial color="#3b2416" roughness={0.6} /></mesh>
      <mesh position={[0.72, 0.012, 0.3]} rotation={[Math.PI / 2, 0, 0.9]}><cylinderGeometry args={[0.009, 0.009, 0.32, 12]} /><meshStandardMaterial color="#1a1a1e" metalness={0.5} roughness={0.3} /></mesh>
      {/* the radio */}
      <group position={[1.0, 0, -0.32]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.19, 0]}><boxGeometry args={[0.62, 0.38, 0.26]} /><meshStandardMaterial color="#7a4a2a" roughness={0.45} /></mesh>
        <mesh position={[-0.13, 0.19, 0.131]}><planeGeometry args={[0.3, 0.3]} /><meshStandardMaterial map={tx.grille} roughness={0.8} /></mesh>
        <mesh position={[0.15, 0.25, 0.131]}><planeGeometry args={[0.24, 0.06]} /><meshBasicMaterial map={dial} toneMapped={false} /></mesh>
        {[0.08, 0.22].map((x) => <mesh key={x} position={[x, 0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.03, 24]} /><meshStandardMaterial color="#d9c49a" metalness={0.6} roughness={0.3} /></mesh>)}
      </group>
      {wo > 0 && <points geometry={geo}><pointsMaterial size={0.018} map={tx.glow} vertexColors transparent opacity={wo} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation /></points>}
    </>
  );
};

/** the radio's read-out: needle position → noise, silence, or the station */
const RadioPanel: React.FC<{ T: number }> = ({ T }) => {
  const k = easeOut(prog(T, 65.7, 66.1)) * (1 - prog(T, 72.2, 72.55)); if (k <= 0) return null;
  const nd = needleAt(T), noisy = nd < 0.3, quiet = nd > 0.7, clear = !noisy && !quiet && T > 69.9;
  const W = 900, H = 160, pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const x = (i / 180) * W; let y = H / 2;
    if (noisy) { const r = Math.sin(i * 12.9898 + Math.floor(T * 24) * 7.1) * 43758.5453; y += ((r - Math.floor(r)) - 0.5) * 120; }
    else if (clear) y += Math.sin(i * 0.18 + T * 9) * 34 + Math.sin(i * 0.07 - T * 4) * 16;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const col = noisy ? RED : quiet ? 'rgba(243,237,226,0.45)' : GOLD;
  const label = noisy ? '太难 · 焦虑' : quiet ? '太简单 · 无聊' : clear ? '刚好够不着 · 心流' : '';
  return (
    <div style={{ position: 'absolute', left: '50%', top: 70, transform: 'translateX(-50%)', opacity: k, width: W + 60, padding: '20px 30px', borderRadius: 18, background: 'rgba(6,8,14,0.78)', border: `1.5px solid ${col}` }}>
      <svg width={W} height={H}><polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" /></svg>
      <div style={{ textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 46, color: col, height: 60 }}>{label}</div>
    </div>
  );
};

/** three take-away cards over the dimmed desk (no subtitles under them) */
const TIPS: [string, string, string, number][] = [['①', '调频', '比现在的水平难一点', 96.6], ['②', '开关', '开始前，做同一个仪式', 99.3], ['③', '篮筐', '每做完一步，马上检查', 102.0]];
const Tips: React.FC<{ T: number }> = ({ T }) => {
  const on = easeOut(prog(T, 96.3, 96.8)) * (1 - prog(T, 104.6, 105.05)); if (on <= 0) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(3,4,8,0.62)', opacity: on }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: on, fontFamily: font.sans, fontWeight: 900, fontSize: 52, color: GOLD, letterSpacing: '0.12em' }}>心流的三个条件</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 46, opacity: on * (1 - prog(T, 104.6, 105.05)) }}>
        {TIPS.map(([n, k, d, t0]) => { const a = easeOut(prog(T, t0, t0 + 0.45)); return (
          <div key={n} style={{ width: 500, height: 430, borderRadius: 22, background: 'rgba(10,12,20,0.92)', border: `2px solid ${GOLD}`, opacity: a, transform: `translateY(${(1 - a) * 30}px)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, boxSizing: 'border-box' }}>
            <div style={{ fontFamily: MONO, fontSize: 64, color: GOLD }}>{n}</div>
            <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: 96, color: INK, marginTop: 6 }}>{k}</div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 40, color: 'rgba(243,237,226,0.85)', marginTop: 22, textAlign: 'center', lineHeight: 1.4 }}>{d}</div>
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};

export const DeskScene: React.FC<{ T: number; v5?: boolean }> = ({ T, v5 = false }) => (
  <AbsoluteFill style={{ background: '#05060a' }}>
    <ThreeCanvas width={1920} height={1080} camera={{ fov: 42, position: [0.45, 1.55, 2.3], near: 0.02, far: 40 }} gl={{ antialias: true }}>
      <color attach="background" args={['#05060a']} />
      <DeskWorld T={T} v5={v5} />
    </ThreeCanvas>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 45% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} />
    <NameCard T={T} t0={49.8} t1={57.5} x={110} y={250} align="right" name="契克森米哈赖" latin="MIHALY CSIKSZENTMIHALYI · 1934–2021"
      rows={[['心理学家', 50.4], ['访谈了运动员、画家、棋手……', 51.0], ['《心流》· 1990', 51.6, true]]} />
    <RadioPanel T={T} />
    {!v5 && <Tips T={T} />}
  </AbsoluteFill>
);
