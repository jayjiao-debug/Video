/* 《心流》 opening test (0–12.5 s), timed to the owner's track from 0:00 (title hit 8.473 s).
   Night arena, one lit hoop. Thirteen balls drop through the net, faster and faster, while the third-quarter clock
   runs from 12:00 to 0:00 and the board counts to 37 (Klay Thompson, 23 Jan 2015). Then the camera accelerates
   into the rim, the rim becomes the first ring of a light tunnel (Senna's "the whole circuit became a tunnel"),
   and the gold title lands on the hit. Everything is drawn in code. No faces: a name card carries the person. */
import React, { useMemo } from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const FPS = 30, OPEN_FRAMES = Math.round(12.5 * FPS);
const TITLE = 8.473, BEAT = 60 / 117.94;
const GOLD = JUNO.colors.gold, INK = JUNO.colors.ink;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------------------------------------------------------------- the shots */
// 13 makes, accelerating, deliberately not on the beat grid (a time-lapse of one quarter, not a metronome)
const MAKES = [0.75, 1.62, 2.38, 3.02, 3.58, 4.06, 4.47, 4.84, 5.17, 5.47, 5.76, 6.03, 6.3];
const FLIGHT = 0.62; // seconds of arc we see before the ball reaches the rim
const RIM = new THREE.Vector3(0, 3.05, 0);
const shotFrom = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453, r = s - Math.floor(s);
  const side = i % 2 ? 1 : -1;
  return new THREE.Vector3(side * (1.6 + 1.4 * r), 2.2 + 0.6 * r, 4.2 + 1.5 * ((i * 0.37) % 1));
};
/** ball position for make i at time T (null when not on screen) */
function ballAt(i: number, T: number): THREE.Vector3 | null {
  const tm = MAKES[i], t0 = tm - FLIGHT;
  if (T < t0 || T > tm + 0.9) return null;
  if (T <= tm) { // arc into the rim
    const u = (T - t0) / FLIGHT, p0 = shotFrom(i);
    const p = p0.clone().lerp(RIM.clone().add(new THREE.Vector3(0, 0.05, 0)), u);
    p.y += Math.sin(Math.PI * u) * 1.3 * (1 - u * 0.3);
    return p;
  }
  const d = T - tm; // through the net and down
  return new THREE.Vector3(0.02 * Math.sin(i), 3.05 - 2.2 * d - 4.9 * d * d, 0.04);
}
const netKick = (T: number) => { let k = 0; for (const tm of MAKES) { const d = T - tm; if (d >= 0 && d < 0.55) k = Math.max(k, Math.sin(Math.PI * d / 0.55) * Math.exp(-d * 2)); } return k; };

/* ---------------------------------------------------------------- textures */
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const ballTex = () => canvasTex(1024, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#c4561f'); gr.addColorStop(0.5, '#e07a34'); gr.addColorStop(1, '#b44c1a');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(80,30,10,${Math.random() * 0.15})`; g.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2); } // pebbled leather
  g.strokeStyle = '#1b1210'; g.lineWidth = 9;
  g.beginPath(); g.moveTo(0, 256); g.lineTo(1024, 256); g.stroke();
  for (const x of [256, 768]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  for (const off of [0, 512]) { g.beginPath(); for (let y = 0; y <= 512; y += 8) { const x = off + 128 + 110 * Math.cos((y / 512) * Math.PI); y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
});
const floorTex = () => canvasTex(2048, 2048, (g) => {
  for (let i = 0; i < 64; i++) { const l = 120 + Math.random() * 30; g.fillStyle = `rgb(${l + 60},${l + 25},${l - 25})`; g.fillRect(i * 32, 0, 32, 2048); }
  g.strokeStyle = 'rgba(60,30,10,0.35)'; g.lineWidth = 2; for (let i = 0; i < 64; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 2048); g.stroke(); }
  g.strokeStyle = 'rgba(245,240,230,0.9)'; g.lineWidth = 10; // the key and the three-point arc, seen from the court
  g.strokeRect(1024 - 240, 0, 480, 760); g.beginPath(); g.arc(1024, 760, 240, 0, Math.PI); g.stroke();
  g.beginPath(); g.arc(1024, 80, 860, 0.12, Math.PI - 0.12); g.stroke();
});
const glowTex = (inner: string, outer: string) => canvasTex(256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});
const coneTex = () => canvasTex(64, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,236,200,0.0)'); gr.addColorStop(0.15, 'rgba(255,236,200,0.5)'); gr.addColorStop(1, 'rgba(255,236,200,0.0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
});
const boardTex = (clock: string, fg: number, pts: number) => canvasTex(1024, 384, (g) => {
  g.fillStyle = '#07080c'; g.fillRect(0, 0, 1024, 384); g.strokeStyle = '#2a2f3a'; g.lineWidth = 8; g.strokeRect(4, 4, 1016, 376);
  g.font = '700 46px "Noto Sans CJK SC", sans-serif'; g.fillStyle = 'rgba(243,237,226,0.7)'; g.textAlign = 'center';
  g.fillText('第三节', 512, 70);
  g.font = '700 128px JunoMono, monospace'; g.fillStyle = '#ff6a3d'; g.shadowColor = '#ff6a3d'; g.shadowBlur = 24; g.fillText(clock, 512, 200);
  g.shadowBlur = 18; g.font = '700 84px JunoMono, monospace';
  g.fillStyle = GOLD; g.shadowColor = GOLD; g.textAlign = 'left'; g.fillText(`${fg}/13`, 70, 330);
  g.textAlign = 'right'; g.fillText(`${pts}`, 954, 330);
  g.shadowBlur = 0; g.font = '700 34px "Noto Sans CJK SC", sans-serif'; g.fillStyle = 'rgba(243,237,226,0.6)'; g.textAlign = 'left'; g.fillText('投篮', 74, 262); g.textAlign = 'right'; g.fillText('得分', 950, 262);
});

/* ---------------------------------------------------------------- the arena (three.js) */
const additive = (m: THREE.Material) => { m.transparent = true; m.depthWrite = false; m.blending = THREE.AdditiveBlending; return m; };

const Arena: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const tex = useMemo(() => ({ ball: ballTex(), floor: floorTex(), pool: glowTex('rgba(255,226,170,0.55)', 'rgba(255,226,170,0)'), cone: coneTex(),
    bokeh: glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)') }), []);
  const crowd = useMemo(() => {
    const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (i * 0.618) % 1, b = (i * 0.37 + 0.11) % 1, c = (i * 0.233 + 0.5) % 1;
      const ang = (a - 0.5) * Math.PI * 1.1, r = 16 + 14 * b;
      pos.set([Math.sin(ang) * r, 2.5 + 11 * c * (0.5 + b * 0.5), -Math.cos(ang) * r * 0.8 - 4], i * 3);
      const w = 0.35 + 0.65 * ((i * 0.77) % 1); col.set([1 * w, 0.82 * w, 0.62 * w], i * 3); seed[i] = (i * 1.3) % 6.28;
    }
    return { pos, col, seed };
  }, []);
  // net: 12 strands, 6 levels, diamond weave
  const net = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 6 * 2 * 3 * 2), 3)), []);
  {
    const kick = netKick(T), arr = net.attributes.position.array as Float32Array; let o = 0;
    const P = (s: number, l: number) => { const k = l / 5, rr = lerp(0.23, 0.13 - 0.04 * kick, k), y = 3.05 - k * (0.42 + 0.18 * kick), a = (s / 12) * Math.PI * 2 + (l % 2) * (Math.PI / 12);
      return [Math.cos(a) * rr, y, Math.sin(a) * rr]; };
    for (let s = 0; s < 12; s++) for (let l = 0; l < 5; l++) { for (const [a, b] of [[P(s, l), P(s, l + 1)], [P(s + 1, l), P(s, l + 1)]]) { arr.set(a, o); arr.set(b, o + 3); o += 6; } }
    net.attributes.position.needsUpdate = true;
  }
  // camera: slow push, then accelerate into the rim, through it, and on down the tunnel
  const a = easeInOut(prog(T, 0, 6.6)), dive = prog(T, 6.6, TITLE);
  let z = lerp(10.5, 6.2, a), y = lerp(1.45, 2.35, a), x = lerp(0.9, 0.25, a);
  if (T > 6.6) { const k = Math.pow(dive, 2.2); z = lerp(6.2, 0, k); y = lerp(2.35, 3.05, easeOut(dive)); x = lerp(0.25, 0, easeOut(dive)); }
  if (T > TITLE) { const d = T - TITLE; z = -(7.06 / 0.55) * (1 - Math.exp(-0.55 * d)); y = 3.05; x = 0; }
  const shake = T > TITLE && T < TITLE + 0.12 ? 0.03 * Math.sin((T - TITLE) * 120) : 0;
  camera.position.set(x + shake, y + shake * 0.6, z);
  const look = new THREE.Vector3(0, 3.0, 0).lerp(new THREE.Vector3(0, 3.05, -60), easeInOut(prog(T, 7.2, TITLE)));
  if (T > TITLE) look.set(0, 3.05, z - 60);
  camera.lookAt(look);
  (camera as THREE.PerspectiveCamera).fov = lerp(42, 62, easeInOut(prog(T, 6.9, TITLE + 0.3))); (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  const arenaO = 1 - prog(T, 7.7, TITLE - 0.05); // the arena dissolves as the tunnel forms
  const tunnelO = prog(T, 7.3, TITLE);
  const clockS = Math.max(0, 720 * (1 - prog(T, 0.4, 6.55)));
  const fg = MAKES.filter((m) => T >= m).length;
  const clock = `${Math.floor(clockS / 60)}:${String(Math.floor(clockS % 60)).padStart(2, '0')}`;
  const board = useMemo(() => boardTex(clock, fg, fg === 13 ? 37 : Math.round(fg * 2.7)), [clock, fg]);
  const flash = (t: number) => MAKES.some((m) => t >= m && t < m + 0.06);

  return (
    <>
      <ambientLight intensity={0.22 * arenaO + 0.05} />
      <spotLight position={[0, 13, 3]} angle={0.42} penumbra={0.7} intensity={260 * arenaO} decay={2} color="#ffe7c2" />
      <directionalLight position={[2, 3, 10]} intensity={0.6 * arenaO} color="#9fb8e8" />
      <group visible={arenaO > 0.01}>
        {/* floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]}><planeGeometry args={[40, 40]} /><meshStandardMaterial map={tex.floor} roughness={0.35} metalness={0.05} transparent opacity={arenaO} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]}><planeGeometry args={[11, 11]} /><meshBasicMaterial map={tex.pool} opacity={1.0 * arenaO} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
        {/* light cone from the roof */}
        <mesh position={[0, 8, 0.6]}><cylinderGeometry args={[0.25, 3.2, 12, 48, 1, true]} /><meshBasicMaterial map={tex.cone} transparent opacity={0.22 * arenaO} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} /></mesh>
        {/* stanchion + backboard */}
        <mesh position={[0, 1.6, -1.6]}><boxGeometry args={[0.28, 3.2, 0.28]} /><meshStandardMaterial color="#20232b" roughness={0.6} transparent opacity={arenaO} /></mesh>
        <mesh position={[0, 3.25, -0.95]} rotation={[0.6, 0, 0]}><boxGeometry args={[0.16, 0.16, 1.4]} /><meshStandardMaterial color="#20232b" roughness={0.6} transparent opacity={arenaO} /></mesh>
        <mesh position={[0, 3.5, -0.15]}><boxGeometry args={[1.83, 1.07, 0.03]} /><meshPhysicalMaterial color="#cfe3ff" transmission={0} transparent opacity={0.12 * arenaO} roughness={0.05} /></mesh>
        {[[0, 4.02, 1.83, 0.05], [0, 2.98, 1.83, 0.05], [-0.9, 3.5, 0.05, 1.07], [0.9, 3.5, 0.05, 1.07], [0, 3.3, 0.59, 0.04], [0, 3.21 + 0.22, 0.04, 0.45], [-0.28, 3.43, 0.04, 0.45], [0.28, 3.43, 0.04, 0.45]].map(([px, py, w, h], i) => (
          <mesh key={i} position={[px, py, -0.13]}><planeGeometry args={[w, h]} /><meshBasicMaterial color="#f4f1ea" transparent opacity={0.85 * arenaO} toneMapped={false} /></mesh>
        ))}
        {/* net */}
        <lineSegments geometry={net}><lineBasicMaterial color="#f2efe8" transparent opacity={0.9 * arenaO} /></lineSegments>
        {/* scoreboard hanging behind */}
        <mesh position={[0, 7.4, -7]}><planeGeometry args={[4.2, 1.575]} /><meshBasicMaterial map={board} transparent opacity={arenaO} toneMapped={false} /></mesh>
        {/* crowd lights */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[crowd.pos, 3]} /><bufferAttribute attach="attributes-color" args={[crowd.col, 3]} /></bufferGeometry>
          <pointsMaterial size={0.38} map={tex.bokeh} vertexColors transparent opacity={(0.75 + 0.15 * Math.sin(T * 3)) * arenaO} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
        {/* ceiling light rows */}
        {Array.from({ length: 22 }, (_, i) => (
          <sprite key={'c' + i} position={[(i - 10.5) * 2.4, 15 + Math.cos((i - 10.5) * 0.18) * 1.5, -10 - Math.abs(i - 10.5) * 0.8]} scale={[1.4, 1.4, 1]}>
            <spriteMaterial map={tex.bokeh} color="#ffe2b0" transparent opacity={0.8 * arenaO} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>))}
        {/* a few camera flashes in the stands on the makes */}
        {MAKES.map((m, i) => (T >= m && T < m + 0.08 ? (
          <sprite key={i} position={[((i * 7.3) % 24) - 12, 4 + ((i * 3.1) % 7), -14 - ((i * 5.7) % 8)]} scale={[1.6, 1.6, 1]}>
            <spriteMaterial map={tex.bokeh} color="#ffffff" transparent opacity={arenaO} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>) : null))}
        {/* balls */}
        {MAKES.map((_, i) => { const p = ballAt(i, T); return p ? (
          <mesh key={i} position={p} rotation={[T * 9 + i, T * 3, 0]}><sphereGeometry args={[0.12, 40, 28]} /><meshStandardMaterial map={tex.ball} roughness={0.75} transparent opacity={arenaO} /></mesh>) : null; })}
      </group>
      {/* rim: becomes the first ring of the tunnel */}
      <mesh position={[0, 3.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.012, 16, 64]} />
        <meshStandardMaterial color="#e2541e" emissive="#ff6a2a" emissiveIntensity={0.3 + 2.2 * tunnelO + (flash(T) ? 0.6 : 0)} roughness={0.4} metalness={0.3} />
      </mesh>
      <Tunnel T={T} o={tunnelO} />
    </>
  );
};

/** rings and streaks down −Z from the rim: the light tunnel */
const Tunnel: React.FC<{ T: number; o: number }> = ({ T, o }) => {
  const rings = useMemo(() => Array.from({ length: 34 }, (_, i) => i), []);
  const streaks = useMemo(() => {
    const n = 420, p = new Float32Array(n * 6), c = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.sin(i * 3.1) * 0.05, r = 1.6 + ((i * 0.37) % 1) * 0.5, z0 = -((i * 2.71) % 60) - 1, len = 2 + ((i * 0.53) % 1) * 5;
      p.set([Math.cos(a) * r, 3.05 + Math.sin(a) * r, z0, Math.cos(a) * r, 3.05 + Math.sin(a) * r, z0 - len], i * 6);
      const warm = i % 3 !== 0, w = 0.5 + 0.5 * ((i * 0.61) % 1);
      const col = warm ? [1 * w, 0.78 * w, 0.42 * w] : [0.55 * w, 0.72 * w, 1 * w]; c.set([...col, ...col], i * 6);
    }
    return { p, c };
  }, []);
  const vg = useMemo(() => glowTex('rgba(255,236,190,0.9)', 'rgba(255,200,120,0)'), []);
  if (o <= 0.001) return null;
  return (
    <group>
      {rings.map((i) => { const zr = -1.4 - i * 1.6, r = 0.23 + Math.min(1.75, (i + 1) * 0.55) * easeOut(o);
        const glow = 0.6 + 0.4 * Math.sin(i * 1.7 + T * 2);
        return (
          <mesh key={i} position={[0, 3.05, zr]}>
            <torusGeometry args={[r, 0.018 + 0.008 * (i % 3), 10, 128]} />
            <meshBasicMaterial color={i % 4 === 0 ? '#8fb8ff' : GOLD} transparent opacity={o * glow * Math.exp(-i * 0.05)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>); })}
      <sprite position={[0, 3.05, -58]} scale={[18, 18, 1]}><spriteMaterial map={vg} transparent opacity={0.8 * o} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[streaks.p, 3]} /><bufferAttribute attach="attributes-color" args={[streaks.c, 3]} /></bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.8 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
};

/* ---------------------------------------------------------------- 2D layers */
const LINES: { t: number; end: number; text: string }[] = [
  { t: 0.45, end: 2.9, text: '12分钟，13投13中。' },
  { t: 3.0, end: 5.75, text: '一节37分，NBA纪录。' },
  { t: 5.85, end: 8.35, text: '他说：“一切都有点模糊。”' },
];
const Subtitle: React.FC<{ T: number }> = ({ T }) => {
  const l = LINES.find((x) => T >= x.t && T < x.end); if (!l) return null;
  const k = prog(T, l.t, l.t + 0.12) * (1 - prog(T, l.end - 0.12, l.end));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 86, textAlign: 'center', opacity: k, fontFamily: font.sans, fontWeight: 700, fontSize: 68, color: INK,
      WebkitTextStroke: '2px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 4px 18px rgba(0,0,0,0.9)', letterSpacing: '0.02em', fontVariantNumeric: 'lining-nums' }}>{l.text}</div>
  );
};
const NameCard: React.FC<{ T: number }> = ({ T }) => {
  const k = easeOut(prog(T, 2.95, 3.35)) * (1 - prog(T, 6.3, 6.6)); if (k <= 0) return null;
  const rows: [string, number][] = [['13 投 13 中', 3.4], ['9 记三分', 3.85], ['单节 37 分 · NBA 纪录', 4.35]];
  return (
    <div style={{ position: 'absolute', left: 120, top: 330, opacity: k, transform: `translateX(${(1 - k) * -30}px)` }}>
      <div style={{ width: 80, height: 3, background: GOLD, marginBottom: 18 }} />
      <div style={{ fontFamily: font.sans, fontWeight: 900, fontSize: 54, color: INK, letterSpacing: '0.04em' }}>克莱·汤普森</div>
      <div style={{ fontFamily: font.latin, fontWeight: 600, fontSize: 30, color: 'rgba(243,237,226,0.65)', letterSpacing: '0.18em', marginTop: 6, fontVariantNumeric: 'lining-nums' }}>KLAY THOMPSON · 2015.01.23</div>
      {rows.map(([r, t0], i) => { const a = easeOut(prog(T, t0, t0 + 0.3)); return (
        <div key={i} style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: i === 2 ? GOLD : 'rgba(243,237,226,0.85)', marginTop: i ? 8 : 22, opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>{r}</div>); })}
    </div>
  );
};
const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < TITLE - 0.02) return null;
  const chars = [...'《心流》'], pour = TITLE + 0.3 + 2 * BEAT;
  const out = 1 - prog(T, 11.9, 12.45);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(3,4,8,0.62), rgba(3,4,8,0.15) 70%)', opacity: easeOut(prog(T, TITLE, TITLE + 0.25)) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 292, textAlign: 'center', fontFamily: font.latin, fontWeight: 600, fontSize: 30, letterSpacing: '0.34em', color: GOLD, fontVariantNumeric: 'lining-nums', opacity: easeOut(prog(T, TITLE, TITLE + 0.3)) }}>
        FLOW · CSIKSZENTMIHALYI · 1990
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 336, display: 'flex', justifyContent: 'center' }}>
        {chars.map((c, i) => { const a = TITLE + (i === 0 || i === 3 ? 0 : (i - 1) * BEAT / 2), k = prog(T, a, a + 0.1); return (
          <span key={i} style={{ fontFamily: font.serif, fontWeight: 900, fontSize: 168, display: 'inline-block', opacity: k, transform: `scale(${1 + 0.3 * (1 - easeOut(k))})`,
            ...(T > pour ? { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 26px rgba(241,197,109,0.55))' } : { color: INK }) }}>{c}</span>); })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 572, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 44, color: INK, opacity: easeOut(prog(T, pour, pour + 0.3)) }}>
        顶级运动员，是怎么“进入状态”的？
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: font.latin, fontStyle: 'italic', fontSize: 32, color: 'rgba(243,237,226,0.6)', opacity: easeOut(prog(T, pour + 0.2, pour + 0.5)) }}>
        How do the greats get into the zone?
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 706, textAlign: 'center', fontFamily: 'JunoMono, monospace', fontSize: 22, letterSpacing: '0.4em', color: 'rgba(241,197,109,0.7)', opacity: easeOut(prog(T, pour + 0.3, pour + 0.6)) }}>
        — {JUNO.series} —
      </div>
    </AbsoluteFill>
  );
};

export const Opening: React.FC = () => {
  const f = useCurrentFrame(), T = f / FPS;
  const flashO = T >= TITLE ? Math.exp(-(T - TITLE) / 0.09) * 0.85 : 0;
  const fadeIn = easeOut(prog(T, 0, 0.5));
  return (
    <AbsoluteFill style={{ background: '#040509' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; }`}</style>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <ThreeCanvas width={1920} height={1080} camera={{ fov: 42, position: [0.9, 1.45, 10.5], near: 0.02, far: 200 }} gl={{ antialias: true }}>
          <color attach="background" args={['#040509']} />
          <fog attach="fog" args={['#040509', 14, 60]} />
          <Arena T={T} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <NameCard T={T} />
      <TitleCard T={T} />
      <Subtitle T={T} />
      <AbsoluteFill style={{ background: '#fff6e0', opacity: flashO }} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * (T < TITLE - 0.2 ? fadeIn : 0), fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
