import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, camAt, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex, project } from './three-kit';
import { useAsset } from './useModels';
import { EnvFor, Spot, gradientSky, softTex } from './kit';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { loadBar } from './S1';

/* S5, gold (b96–b128, the quiet section: one slow shot, then one reveal).
   A  b96–b112  a single bar turning slowly in the dark while a narrow light slides over it; its four virtues appear.
   B  b112–b128 all the gold ever mined (≈216,265 t, World Gold Council, end of 2024) as one cube: ≈22 m a side
                (216,265 t ÷ 19.32 t/m³ = 11,194 m³ → 22.4 m). It stands at a street corner at dusk beside a seven-storey
                building of the same height. */
export const S5_IN = b(96) - 0.3, S5_OUT = b(128) + 0.35;

export const LINES_S5: Line[] = [
  [b(97), b(104) - 0.1, '那黄金，凭什么一直值钱？', 'And gold: why has it always been worth so much?'],
  [b(104) + 0.06, b(112) - 0.1, '它不生锈、不腐烂，很难造假，还能切开用。', "It doesn't rust or rot, it's hard to fake, and it can be cut into pieces."],
  [b(112) + 0.06, b(120) - 0.1, '而且很少：人类挖出的全部黄金，熔成一块——', 'And it is rare: melt all the gold ever mined into one block,'],
  [b(120) + 0.06, b(128) - 0.1, '边长只有[22米]，和一栋七层楼差不多高。', 'and it is only 22 metres a side, about as tall as a seven-storey building.'],
];

// ---------------- A ----------------
const KEYS_A: Key[] = [
  [b(96) - 0.3, [0.2, 0.09, 0.26], [0, 0.015, 0]],
  [b(110), [0.12, 0.06, 0.15], [0, 0.015, 0]],
  [b(112), [0.02, 0.03, 0.05], [0, 0.018, 0]],
];
const TAGS: [string, number[]][] = [['不生锈', []], ['不腐烂', []], ['难造假', []], ['可切分', []]];

const Bar: React.FC<{ T: number; bar: THREE.Mesh }> = ({ T, bar }) => {
  const obj = useMemo(() => bar.clone(), [bar]);
  const sweep = ((T - b(96)) / 5.5) % 1; // a slow light passing every 5.5 s, its own clock
  const lx = lerp(-0.35, 0.35, easeInOut(sweep));
  return (
    <Stage bloom={0.45} threshold={0.88} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(KEYS_A, T).pos.map((v, i) => v - [0, 0.015, 0][i]))} aperture={0.03} maxblur={0.01}>
      <CamRig T={T} keys={KEYS_A} fov={30} />
      <ambientLight intensity={0.015} color="#8090b0" />
      <Spot position={[lx, 0.35, 0.1]} target={[0, 0, 0]} angle={0.18} penumbra={0.9} intensity={1.6} color="#ffd9a0" near={0.05} far={2} />
      <pointLight position={[-0.2, 0.3, -0.3]} intensity={0.03} decay={2} color="#7d9cff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#0c0b0b" roughness={0.75} metalness={0.1} />
      </mesh>
      <primitive object={obj} rotation={[0, 0.6 + 0.12 * (T - b(96)), 0]} />
      <EnvFor mats={[obj.material as THREE.Material]} intensity={0.55} />
      {Array.from({ length: 30 }, (_, i) => {
        const s = 0.0012 + rnd(i, 1) * 0.0015;
        return (
          <sprite key={i} position={[(rnd(i, 2) - 0.5) * 0.4, 0.01 + rnd(i, 3) * 0.15 + 0.004 * Math.sin(T * 0.4 + i), (rnd(i, 4) - 0.6) * 0.3]} scale={[s, s, s]}>
            <spriteMaterial map={softTex()} color="#ffe2b0" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.35 * rnd(i, 5)} toneMapped={false} />
          </sprite>
        );
      })}
    </Stage>
  );
};

// ---------------- B ----------------
const E = 22.4; // cube edge, metres
const KEYS_B: Key[] = [
  [b(112) - 0.2, [7, 13, E / 2 + 10], [1.0, 11, 0]],
  [b(118), [34, 15, 88], [-8, 11, 0]],
  [b(128) + 0.4, [37, 15.5, 95], [-8, 11, 0]],
];
const BLD = { x: -E / 2 - 4 - 9, w: 18, d: 14, h: 22 };

const windowsTex = () => canvasTex(512, 1024, (g) => {
  g.fillStyle = '#2c2420'; g.fillRect(0, 0, 512, 1024);
  for (let f = 0; f < 7; f++) for (let c = 0; c < 9; c++) {
    const lit = rnd(f * 10 + c, 3) > 0.55;
    g.fillStyle = lit ? (rnd(f * 10 + c, 4) > 0.5 ? '#e8b070' : '#f0c896') : '#16130f';
    const x = 18 + c * 55, y = 1024 - (f + 1) * 146 + 40;
    g.fillRect(x, y, 34, 66);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y + 62, 34, 4);
  }
  for (let f = 1; f < 7; f++) { g.fillStyle = '#3a302a'; g.fillRect(0, 1024 - f * 146 - 8, 512, 8); }
});

const City: React.FC<{ T: number }> = ({ T }) => {
  const sky = useMemo(() => gradientSky([[0, '#0e1630'], [0.32, '#2a2c4a'], [0.46, '#a4583a'], [0.5, '#f0a060'], [0.53, '#3a2a28'], [1, '#100c0c']], { x: 0.72, y: 0.49, r: 0.25, color: 'rgba(255,190,120,0.8)' }), []);
  const win = useMemo(() => windowsTex(), []);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(E, E, E, 4, 0.35), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9a645', metalness: 0.88, roughness: 0.3 }), []);
  const people = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: -9 + rnd(i, 1) * 20, z: E / 2 + 2 + rnd(i, 2) * 7, s: 0.92 + rnd(i, 3) * 0.16 })), []);
  return (
    <Stage bloom={0.6} threshold={0.82} seed={Math.floor(T * 30) % 97} exposure={1.0} fov={34} near={0.5} far={1500}>
      <CamRig T={T} keys={KEYS_B} fov={34} />
      <fog attach="fog" args={['#2a2230', 60, 260]} />
      <mesh><sphereGeometry args={[400, 48, 24]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
      <hemisphereLight args={['#6a6c98', '#1a1210', 0.5]} />
      <directionalLight position={[120, 30, -40]} intensity={2.6} color="#ffb070" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-60} shadow-camera-right={60} shadow-camera-top={60} shadow-camera-bottom={-60} shadow-camera-near={10} shadow-camera-far={400} shadow-bias={-0.0004} />
      {/* ground, pavement, kerb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[600, 600]} /><meshStandardMaterial color="#1c1a1c" roughness={0.9} /></mesh>
      <mesh position={[0, 0.08, E / 2 + 6]} receiveShadow><boxGeometry args={[200, 0.16, 12]} /><meshStandardMaterial color="#2c2a2c" roughness={0.85} /></mesh>
      {/* the cube */}
      <mesh position={[0, E / 2, 0]} castShadow receiveShadow material={gold} geometry={cubeGeo} />
      <EnvFor mats={[gold]} intensity={0.7} />
      {/* the seven-storey building beside it, and darker blocks behind */}
      <mesh position={[BLD.x, BLD.h / 2, E / 2 - BLD.d / 2]} castShadow receiveShadow>
        <boxGeometry args={[BLD.w, BLD.h, BLD.d]} />
        <meshStandardMaterial map={win} emissiveMap={win} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.8} />
      </mesh>
      {[[-60, 34, -40, 20], [40, 46, -70, 24], [75, 28, -30, 18], [-95, 40, -60, 22]].map(([x, h, z, w], i) => (
        <mesh key={i} position={[x, h / 2, z]}><boxGeometry args={[w, h, w]} /><meshStandardMaterial map={win} emissiveMap={win} emissive="#ffffff" emissiveIntensity={0.2} color="#8a8090" roughness={0.9} /></mesh>
      ))}
      {/* street lamps */}
      {[-34, 22, 46].map((x, i) => (
        <group key={i} position={[x, 0, E / 2 + 4]}>
          <mesh position={[0, 3, 0]}><cylinderGeometry args={[0.07, 0.09, 6, 8]} /><meshStandardMaterial color="#111" /></mesh>
          <mesh position={[0, 6.05, 0]}><sphereGeometry args={[0.22, 12, 8]} /><meshBasicMaterial color={new THREE.Color('#ffd49a').multiplyScalar(2)} toneMapped={false} /></mesh>
          <pointLight position={[0, 5.8, 0]} intensity={60} distance={30} decay={2} color="#ffc27a" />
        </group>
      ))}
      {/* people, for scale */}
      {people.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} scale={p.s}>
          <mesh position={[0, 0.78, 0]} castShadow><capsuleGeometry args={[0.2, 1.0, 4, 8]} /><meshStandardMaterial color="#141214" roughness={0.9} /></mesh>
          <mesh position={[0, 1.58, 0]} castShadow><sphereGeometry args={[0.13, 12, 8]} /><meshStandardMaterial color="#141214" roughness={0.9} /></mesh>
        </group>
      ))}
    </Stage>
  );
};

export const S5: React.FC<{ T: number }> = ({ T }) => {
  const bar = useAsset('goldbar1', loadBar);
  if (T < S5_IN || T > S5_OUT || !bar) return null;
  const o = easeOut(prog(T, S5_IN, S5_IN + 0.6)) * (1 - easeIn(prog(T, S5_OUT - 0.35, S5_OUT)));
  const shotB = T >= b(112) - 0.2;
  const xB = easeInOut(prog(T, b(112) - 0.2, b(112) + 0.25));
  // dimension line along the cube's front vertical edge
  const dim = easeInOut(prog(T, b(120) + 0.1, b(121) + 0.2));
  const pTop = project(KEYS_B, T, [E / 2 + 1.2, E, E / 2 + 0.5], 34), pBot = project(KEYS_B, T, [E / 2 + 1.2, 0, E / 2 + 0.5], 34);
  const yMid = lerp(pBot.y, pTop.y, 0.5);
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {(!shotB || xB < 1) && <Bar T={T} bar={bar} />}
      {shotB && <AbsoluteFill style={{ opacity: xB }}><City T={T} /></AbsoluteFill>}
      {!shotB && TAGS.map(([t], i) => {
        const at = b(104) + 0.5 + i * 0.75;
        const to = easeOut(prog(T, at, at + 0.35)) * (1 - prog(T, b(111), b(111) + 0.4));
        if (to <= 0.01) return null;
        return (
          <div key={t} style={{ position: 'absolute', left: 1420, top: 300 + i * 96, width: 220, textAlign: 'center', opacity: to, transform: `translateY(${(1 - to) * 10}px)` }}>
            <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 30, border: '1.5px solid rgba(246,207,120,0.55)', background: 'rgba(5,6,11,0.55)', fontFamily: ZH, fontWeight: 700, fontSize: 32, color: INK, letterSpacing: '0.1em' }}>{t}</span>
          </div>
        );
      })}
      {shotB && dim > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <g stroke={GOLD} strokeWidth={2.5} opacity={dim}>
            <line x1={pBot.x} y1={pBot.y} x2={pBot.x} y2={lerp(pBot.y, pTop.y, dim)} />
            <line x1={pBot.x - 12} y1={pBot.y} x2={pBot.x + 12} y2={pBot.y} />
            {dim > 0.98 && <line x1={pTop.x - 12} y1={pTop.y} x2={pTop.x + 12} y2={pTop.y} />}
          </g>
          <g opacity={easeOut(prog(T, b(121), b(121) + 0.4))}>
            <text x={pBot.x + 26} y={yMid + 20} style={{ fontFamily: EN, fontWeight: 700, fontSize: 96, fill: GOLD, filter: 'drop-shadow(0 0 16px rgba(246,207,120,0.45))' }}>22<tspan style={{ fontFamily: ZH, fontSize: 44 }}> 米</tspan></text>
            <text x={pBot.x + 30} y={yMid + 62} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.7)' }}>约 21.6 万吨 · 世界黄金协会（截至2024年底）</text>
          </g>
        </svg>
      )}
      <Chapter T={T} at={b(97) + 0.2} out={b(111)} text="黄 金" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S5} />
    </AbsoluteFill>
  );
};
