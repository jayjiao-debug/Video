import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, mulberry, camAt, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex } from './three-kit';
import { useModels } from './useModels';
import { softTex, gradientSky } from './kit';

/* S8, bamboo (b238–b294). Moso bamboo (毛竹): a new planting spreads its rhizomes for several years and puts up only thin,
   short culms; once established, a spring shoot grows up to ~1 m a day (record 114.5 cm) and reaches its full height of
   ten-odd metres in 40–60 days, never growing taller afterwards (湖南省林业局; 科学网 2022). "Only 3 cm in four years" is an
   internet exaggeration, and the film says so.
   A cut-away of the soil: golden rhizomes spread year by year under a few thin culms; then one shoot comes up. */
export const S8_IN = b(238) - 0.4, S8_OUT = b(294) + 0.4;

export const LINES_S8: Line[] = [
  [b(239), b(248) - 0.1, '最后说说竹子。网上说，竹子头四年只长3厘米——', 'Last, bamboo. The internet says it grows just 3 cm in four years—'],
  [b(248) + 0.06, b(256) - 0.1, '这是夸张。但新种的毛竹，头几年确实又细又矮。', "That's an exaggeration. But newly planted moso bamboo does stay thin and short at first,"],
  [b(256) + 0.06, b(264) - 0.1, '因为力气都花在地下：竹鞭一年年往外伸。', 'because the effort goes underground: the rhizomes spread year after year.'],
  [b(264) + 0.06, b(272) - 0.1, '等根扎好，春天的竹笋一天最快能长1米多，', 'Once they are established, a spring shoot can grow over a metre in a day,'],
  [b(272) + 0.06, b(282) - 0.1, '一两个月就长到十几米，一辈子的高度一次长完。', 'reaching ten-odd metres in a month or two: its whole height in one go.'],
  [b(282) + 0.06, b(288) - 0.1, '所以，回报不是没来，', 'So the reward did come;'],
  [b(288) + 0.06, b(294) - 0.1, '只是前几年，[还埋在地下]。', 'for the first few years it was just underground.'],
];

// years of spreading: b248 → b264 is years 1–4; the shoot: b264 → b282 is days 0–50
const yearAt = (T: number) => 4 * prog(T, b(250), b(263));
const dayAt = (T: number) => 50 * prog(T, b(264), b(282));
/** shoot height (m) after d days: logistic, 15 m in the end, fastest ~1 m a day around day 25 */
export const shootH = (d: number) => 15 / (1 + Math.exp(-(d - 25) / 3.7)) - 15 / (1 + Math.exp(25 / 3.7));

// rhizome network: branching random walks in a slab under the ground (y −0.25 … −0.8), each segment with a birth year
type Seg = { a: THREE.Vector3; b: THREE.Vector3; year: number };
const RHIZOME: Seg[] = (() => {
  const r = mulberry(11);
  const out: Seg[] = [];
  const grow = (p: THREE.Vector3, dir: number, year: number, depth: number) => {
    let q = p.clone(), d = dir;
    const n = 6 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      d += (r() - 0.5) * 0.5;
      const nq = q.clone().add(new THREE.Vector3(Math.cos(d) * 0.3, (r() - 0.5) * 0.09, Math.sin(d) * 0.12));
      nq.y = Math.max(-0.85, Math.min(-0.25, nq.y));
      nq.z = Math.max(-1.5, Math.min(-0.25, nq.z));
      nq.x = Math.max(-2.8, Math.min(2.8, nq.x));
      const y = year + k / n;
      out.push({ a: q, b: nq, year: y });
      if (depth < 3 && r() < 0.28) grow(nq, d + (r() > 0.5 ? 1 : -1) * (0.6 + r() * 0.6), y + 0.2, depth + 1);
      q = nq;
    }
  };
  for (let k = 0; k < 4; k++) grow(new THREE.Vector3(0, -0.4, -0.8), (k % 2 ? Math.PI : 0) + (k < 2 ? 0.25 : -0.25), k * 0.5, 0);
  return out;
})();

const soilTex = (layers = true) => canvasTex(1024, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#3a2a1c'); gr.addColorStop(0.15, '#2c1f15'); gr.addColorStop(1, '#130d09');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd(i, 1) > 0.6 ? '120,96,70' : '0,0,0'},${0.08 + rnd(i, 2) * 0.2})`; g.beginPath(); g.arc(rnd(i, 3) * 1024, rnd(i, 4) * 512, 1 + rnd(i, 5) * 3.5, 0, Math.PI * 2); g.fill(); }
  if (layers) for (let k = 0; k < 5; k++) { g.strokeStyle = 'rgba(80,60,40,0.25)'; g.lineWidth = 2; g.beginPath(); const y = 60 + k * 90; g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + 10 * Math.sin(x * 0.01 + k)); g.stroke(); }
});
let LEAF: THREE.Texture | null = null;
const leafTex = () => LEAF ?? (LEAF = canvasTex(128, 128, (g) => {
  g.clearRect(0, 0, 128, 128);
  for (let k = 0; k < 5; k++) {
    g.save(); g.translate(64, 64); g.rotate(-1.2 + k * 0.6);
    g.fillStyle = k % 2 ? '#4f7d3a' : '#6a9a45';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, -26, 0, -60); g.quadraticCurveTo(-10, -26, 0, 0); g.fill(); g.restore();
  }
}));

/** a culm: a green cylinder with darker nodes; leaves at the top once grown */
const Culm: React.FC<{ x: number; z: number; h: number; r: number; leaves: number; tilt?: number }> = ({ x, z, h, r, leaves, tilt = 0 }) => {
  if (h < 0.005) return null;
  const nodes = Math.max(1, Math.floor(h / 0.32));
  return (
    <group position={[x, 0, z]} rotation={[0, 0, tilt]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r * 0.75, r, h, 14]} />
        <meshStandardMaterial color="#5f8a43" roughness={0.45} />
      </mesh>
      {Array.from({ length: nodes }, (_, k) => (
        <mesh key={k} position={[0, ((k + 1) * h) / (nodes + 1), 0]}><torusGeometry args={[r * (1 - 0.25 * (k / nodes)) * 1.02, r * 0.12, 6, 16]} /><meshStandardMaterial color="#3d5f2a" roughness={0.6} /></mesh>
      ))}
      {/* the sheath tip of a young shoot */}
      {leaves < 0.2 && <mesh position={[0, h + r * 1.5, 0]}><coneGeometry args={[r * 0.8, r * 3.2, 10]} /><meshStandardMaterial color="#7a6440" roughness={0.8} /></mesh>}
      {leaves > 0 && Array.from({ length: 14 }, (_, k) => {
        const yy = h * (0.6 + 0.4 * rnd(k, 1)), a = rnd(k, 2) * 6.28, d = 0.2 + rnd(k, 3) * 0.6 * Math.min(1, h / 6);
        const s = (0.5 + rnd(k, 4) * 0.6) * Math.min(1, h / 5) * leaves;
        return <sprite key={k} position={[Math.cos(a) * d, yy, Math.sin(a) * d]} scale={[s, s, 1]}><spriteMaterial map={leafTex()} transparent depthWrite={false} /></sprite>;
      })}
    </group>
  );
};

/** the grown grove behind: [x, z, turn, scale] */
const GROVE = Array.from({ length: 11 }, (_, i) => [(rnd(i, 1) - 0.5) * 30, -7 - rnd(i, 2) * 16, rnd(i, 3) * 6.28, 1.2 + rnd(i, 4) * 0.6]);

const KEYS: Key[] = [
  [S8_IN, [0.6, 0.55, 5.6], [0, 0.0, -0.8]],
  [b(256), [0.3, 0.1, 4.6], [0, -0.35, -0.8]],
  [b(263), [0.2, 0.05, 4.4], [0, -0.35, -0.8]],
  [b(265), [2.5, 1.4, 8.5], [0, 1.2, -0.8]],
];
/** camera for the shoot: follows the tip upward, then back down to the roots for the last two lines */
const camFor = (T: number): { pos: number[]; look: number[] } => {
  if (T < b(265)) return camAt(KEYS, T);
  const tip = shootH(dayAt(T));
  const up = { pos: [3.5 + tip * 0.2, Math.max(1.8, tip * 0.75 + 1.2), 9 + tip * 0.45], look: [0, Math.max(1.2, tip * 0.82), -0.7] };
  const k = easeInOut(prog(T, b(281), b(284)));
  const down = { pos: [0.3, 0.15, 4.8], look: [0, -0.35, -0.8] };
  return { pos: up.pos.map((v, i) => lerp(v, down.pos[i], k)), look: up.look.map((v, i) => lerp(v, down.look[i], k)) };
};

const RhizomeMesh: React.FC<{ year: number; glow: number }> = ({ year, glow }) => {
  const segs = useMemo(() => RHIZOME.map((s) => {
    const curve = new THREE.LineCurve3(s.a, s.b);
    return { geo: new THREE.TubeGeometry(curve, 2, 0.014, 8, false), year: s.year, mid: s.a.clone().lerp(s.b, 0.5) };
  }), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8b46a', roughness: 0.5, emissive: '#f1c56d', emissiveIntensity: 0.25 }), []);
  mat.emissiveIntensity = 0.25 + 0.9 * glow;
  return <>{segs.map((s, i) => (year >= s.year ? <mesh key={i} geometry={s.geo} material={mat} scale={1} /> : null))}</>;
};

export const Bamboo: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['bamboo']);
  const soil = useMemo(() => soilTex(), []);
  const sky = useMemo(() => gradientSky([[0, '#1d3550'], [0.36, '#4a6a84'], [0.48, '#d8b588'], [0.52, '#3a2e24'], [1, '#120c08']], { x: 0.3, y: 0.48, r: 0.28, color: 'rgba(255,214,160,0.7)' }), []);
  const top = useMemo(() => { const t = soilTex(false); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; }, []);
  const grove = useMemo(() => (m ? GROVE.map(() => m.bamboo.clone(true)) : null), [m]);
  if (T < S8_IN || T > S8_OUT || !m || !grove) return null;
  const o = easeOut(prog(T, S8_IN, S8_IN + 0.6)) * (1 - easeIn(prog(T, S8_OUT - 0.5, S8_OUT)));
  const year = yearAt(T), day = dayAt(T), h = shootH(day);
  const { pos, look } = camFor(T);
  const glow = easeInOut(prog(T, b(284), b(287)));
  const myth = easeOut(prog(T, b(240), b(240) + 0.5)) * (1 - prog(T, b(255), b(256)));
  const mythX = easeOut(prog(T, b(248) + 0.3, b(249)));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <Stage bloom={0.5} threshold={0.85} seed={Math.floor(T * 30) % 97} fov={34} near={0.02} far={200}
        focus={Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2])} aperture={0.004} maxblur={0.008}>
        <CamPose pos={pos} look={look} />
        <fog attach="fog" args={['#6a7480', 22, 80]} />
        <hemisphereLight args={['#b8c8d8', '#2a2016', 0.9]} />
        <directionalLight position={[6, 14, 8]} intensity={1.8} color="#ffe2b8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={18} shadow-camera-bottom={-4} shadow-camera-near={1} shadow-camera-far={60} />
        <pointLight position={[0.3, -0.3, 1.2]} intensity={0.5 + 1.5 * glow} decay={2} color="#ffcf7a" />
        {/* sky, then the ground cut open at z = 0: the cut face is half transparent so the rhizomes behind it show (an X-ray section) */}
        <mesh><sphereGeometry args={[120, 32, 16]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} receiveShadow><planeGeometry args={[80, 40]} /><meshStandardMaterial map={top} color="#6a5a44" roughness={1} /></mesh>
        <mesh position={[0, -0.75, -1.7]}><planeGeometry args={[8, 1.5]} /><meshStandardMaterial map={soil} roughness={1} /></mesh>
        <mesh position={[0, -1.5, -0.85]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8, 1.7]} /><meshStandardMaterial map={soil} color="#806050" roughness={1} /></mesh>
        <mesh position={[0, -0.75, 0]}><planeGeometry args={[8, 1.5]} /><meshStandardMaterial map={soil} transparent opacity={0.42} roughness={1} depthWrite={false} /></mesh>
        <mesh position={[0, 0.0, 0.0]}><boxGeometry args={[8, 0.03, 0.03]} /><meshStandardMaterial color="#8a7050" roughness={1} /></mesh>
        <RhizomeMesh year={year + (T > b(264) ? 4 : 0)} glow={glow} />
        {/* the thin, short culms of the first years */}
        {[[-1.6, -1.2, 0.9], [-0.9, -1.4, 1.4], [0.8, -1.3, 1.1], [1.7, -1.0, 1.7], [-2.2, -0.9, 0.7]].map(([x, z, hh], i) => (
          <Culm key={i} x={x} z={z} h={hh * Math.min(1, 0.3 + year / 4)} r={0.012} leaves={1} tilt={(rnd(i, 1) - 0.5) * 0.15} />
        ))}
        {/* the shoot */}
        {T > b(264) && <Culm x={0} z={-0.8} h={h} r={0.075} leaves={easeOut(prog(T, b(277), b(281)))} />}
        {GROVE.map((g, i) => <group key={i} position={[g[0], 0, g[1]]} rotation={[0, g[2], 0]} scale={g[3]}><primitive object={grove[i]} /></group>)}
        {/* spring rain as the shoot starts */}
        {T > b(263) && T < b(272) && Array.from({ length: 80 }, (_, i) => {
          const ph = ((T * 1.6 + rnd(i, 1)) % 1);
          return <mesh key={i} position={[(rnd(i, 2) - 0.5) * 10, 8 - ph * 9, (rnd(i, 3) - 0.6) * 6]}><boxGeometry args={[0.006, 0.25, 0.006]} /><meshBasicMaterial color="#9fb6c8" transparent opacity={0.35 * (1 - prog(T, b(270), b(272)))} /></mesh>;
        })}
      </Stage>
      {myth > 0.01 && (
        <div style={{ position: 'absolute', right: 160, top: 280, textAlign: 'right', opacity: myth }}>
          <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.6)' }}>网上的说法</div>
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 56, color: INK, position: 'relative', display: 'inline-block' }}>4年只长3厘米
            <div style={{ position: 'absolute', left: -8, right: -8, top: '52%', height: 5, background: '#ff6a5c', transform: `scaleX(${mythX})`, transformOrigin: 'left' }} />
          </div>
          <div style={{ fontFamily: ZH, fontSize: 26, color: '#ff8a76', marginTop: 8, opacity: mythX }}>夸张了</div>
        </div>
      )}
      {T > b(250) && T < b(264) && (
        <div style={{ position: 'absolute', left: 150, top: 260, opacity: easeOut(prog(T, b(250), b(251))) * (1 - prog(T, b(263), b(264))) }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 110, color: INK, lineHeight: 1 }}>第 {Math.max(1, Math.ceil(year))} 年</div>
          <div style={{ fontFamily: ZH, fontSize: 28, color: GOLD, marginTop: 10 }}>地下：竹鞭在扩张</div>
          <div style={{ fontFamily: ZH, fontSize: 28, color: 'rgba(243,237,226,0.6)', marginTop: 4 }}>地上：又细又矮</div>
        </div>
      )}
      {T > b(264) && T < b(283) && (
        <div style={{ position: 'absolute', right: 150, top: 230, textAlign: 'right', opacity: easeOut(prog(T, b(264), b(265))) * (1 - prog(T, b(282), b(283))) }}>
          <div style={{ fontFamily: ZH, fontSize: 28, color: 'rgba(243,237,226,0.65)' }}>出土第 <b style={{ fontFamily: EN, fontSize: 44, color: INK }}>{Math.round(day)}</b> 天</div>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 130, color: h > 12 ? GOLD : INK, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums lining-nums' }}>{h.toFixed(h < 10 ? 1 : 0)}<span style={{ fontFamily: ZH, fontSize: 48 }}> 米</span></div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: 'rgba(243,237,226,0.5)', marginTop: 6 }}>最快一天约1米（纪录114.5厘米）</div>
        </div>
      )}
      <Chapter T={T} at={b(239) + 0.2} out={b(293)} text="毛 竹" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S8} />
    </AbsoluteFill>
  );
};

const CamPose: React.FC<{ pos: number[]; look: number[] }> = ({ pos, look }) => {
  const k: Key[] = [[0, pos, look], [1, pos, look]];
  return <CamRig T={0} keys={k} fov={34} />;
};
