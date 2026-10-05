import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, rnd, camAt, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig } from './three-kit';
import { useModels } from './useModels';
import { materials } from './models';
import { EnvFor, Spot, softTex } from './kit';

/* S4, practice (b96–b128, the quiet section: one slow shot).
   Macnamara, Hambrick & Oswald, Psychological Science (2014): 88 studies, 157 effect sizes, 11,135 people.
   Deliberate practice explained 26 % of the variance in performance in games, 21 % music, 18 % sports, 4 % education,
   < 1 % professions. A piano in the dark, a metronome swinging on its own clock (not on the beat); five gold columns rise. */
export const S4_IN = b(96) - 0.3, S4_OUT = b(128) + 0.3;

export const LINES_S4: Line[] = [
  [b(97), b(105) - 0.1, '那练习呢？练够一万小时，就能成为高手吗？', 'And practice? Do 10,000 hours make an expert?'],
  [b(105) + 0.06, b(113) - 0.1, '2014年，一项汇总了88项研究的分析发现：', 'A 2014 analysis of 88 studies found that'],
  [b(113) + 0.06, b(120) - 0.1, '练习能解释：游戏26%，音乐21%，', 'practice explains 26% of the differences in games, 21% in music,'],
  [b(120) + 0.06, b(128) - 0.1, '体育18%，读书4%，工作[不到1%]。', '18% in sports, 4% in education, and under 1% at work.'],
];

const KEYS: Key[] = [
  [S4_IN, [1.15, 1.25, 1.6], [0.0, 0.85, 0.2]],
  [b(128) + 0.3, [0.35, 1.15, 1.75], [-0.1, 0.85, 0.2]],
];
const BARS: [string, number, string][] = [['游戏', 26, '国际象棋等'], ['音乐', 21, ''], ['体育', 18, ''], ['读书', 4, ''], ['工作', 1, '']];

const Room: React.FC<{ T: number; m: Record<string, THREE.Group> }> = ({ T, m }) => {
  const piano = useMemo(() => m.piano.clone(true), [m.piano]);
  const met = useMemo(() => {
    const c = m.metronome.clone(true);
    return c;
  }, [m.metronome]);
  const rod = useMemo(() => met.getObjectByName('Object_6') ?? null, [met]);
  const weight = useMemo(() => met.getObjectByName('Object_8') ?? null, [met]);
  // the metronome swings at about 60 a minute, on its own clock; it slows and stops as the section ends
  const amp = 0.38 * (1 - easeInOut(prog(T, b(126), b(128) + 0.3)));
  const ang = amp * Math.sin((T - S4_IN) * Math.PI);
  if (rod) rod.rotation.z = ang;
  if (weight) weight.rotation.z = ang;
  const mats = useMemo(() => [...materials(piano), ...materials(met)], [piano, met]);
  const top = useMemo(() => new THREE.Box3().setFromObject(piano).max.y, [piano]);
  return (
    <>
      <primitive object={piano} />
      <group position={[-0.35, top, 0.55]} rotation={[0, 0.5, 0]}><primitive object={met} /></group>
      <EnvFor mats={mats} intensity={0.35} />
      {Array.from({ length: 36 }, (_, i) => {
        const s = 0.003 + rnd(i, 1) * 0.004;
        return <sprite key={i} position={[(rnd(i, 2) - 0.5) * 1.6, 0.6 + rnd(i, 3) * 1.0 + 0.02 * Math.sin(T * 0.3 + i), (rnd(i, 4) - 0.3) * 1.4]} scale={[s, s, s]}><spriteMaterial map={softTex()} color="#ffe2b0" transparent opacity={0.35 * rnd(i, 5)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>;
      })}
    </>
  );
};

const Bars: React.FC<{ T: number }> = ({ T }) => {
  const x0 = 1080, w = 110, gap = 52, base = 760, H = 440;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {BARS.map(([name, v], i) => {
        const at = i < 2 ? b(113) + 0.4 + i * 0.6 : b(120) + 0.3 + (i - 2) * 0.55;
        const k = easeOut(prog(T, at, at + 0.9));
        const h = Math.max(3, (v / 26) * H * k);
        const x = x0 + i * (w + gap);
        const o = easeOut(prog(T, at - 0.1, at + 0.3));
        return (
          <g key={name} opacity={o}>
            <defs><linearGradient id={`bar${i}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#6e4c18" /><stop offset="0.7" stopColor="#d9a645" /><stop offset="1" stopColor="#fff0c0" /></linearGradient></defs>
            <rect x={x} y={base - h} width={w} height={h} fill={`url(#bar${i})`} opacity={0.92} style={{ filter: 'drop-shadow(0 0 16px rgba(246,207,120,0.35))' }} />
            <text x={x + w / 2} y={base - h - 20} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 54, fill: i === 4 ? GOLD : INK, fontVariantNumeric: 'tabular-nums' }}>{i === 4 ? '<1' : Math.round(v * k)}%</text>
            <text x={x + w / 2} y={base + 46} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: 'rgba(243,237,226,0.85)' }}>{name}</text>
          </g>
        );
      })}
      <line x1={x0 - 20} y1={base} x2={x0 + 5 * (w + gap) - gap + 20} y2={base} stroke="rgba(243,237,226,0.4)" strokeWidth={2} opacity={easeOut(prog(T, b(113), b(113) + 0.4))} />
      <text x={x0 - 20} y={base + 96} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.5)' }} opacity={easeOut(prog(T, b(121), b(122)))}>刻意练习能解释的表现差异 · Macnamara 等，2014</text>
    </svg>
  );
};

export const S4: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['piano', 'metronome']);
  if (T < S4_IN || T > S4_OUT || !m) return null;
  const o = easeOut(prog(T, S4_IN, S4_IN + 0.8)) * (1 - easeIn(prog(T, S4_OUT - 0.6, S4_OUT)));
  const { pos, look } = camAt(KEYS, T);
  const focus = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  const hours = easeOut(prog(T, b(98), b(101)));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <Stage bloom={0.4} threshold={0.88} seed={Math.floor(T * 30) % 97} focus={focus} aperture={0.012} maxblur={0.01} fov={32}>
        <CamRig T={T} keys={KEYS} fov={32} />
        <ambientLight intensity={0.02} color="#8090b0" />
        <Spot position={[0.3, 2.6, 0.9]} target={[0, 0.8, 0.1]} angle={0.42} penumbra={0.9} intensity={6} color="#ffc98a" near={0.3} far={6} />
        <pointLight position={[-2, 1.6, -2]} intensity={0.6} decay={2} color="#6f8cff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#17110d" roughness={0.6} /></mesh>
        <Room T={T} m={m} />
      </Stage>
      {T < b(113) && hours > 0.01 && (
        <div style={{ position: 'absolute', left: 150, top: 300, opacity: hours * (1 - prog(T, b(111), b(112))) }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 130, color: INK, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Math.round(10000 * hours).toLocaleString('en-US')}</div>
          <div style={{ fontFamily: ZH, fontSize: 32, color: 'rgba(243,237,226,0.7)', marginTop: 8, letterSpacing: '0.1em' }}>小时的练习</div>
        </div>
      )}
      <Bars T={T} />
      <Chapter T={T} at={b(97) + 0.3} out={b(127)} text="练 习" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S4} />
    </AbsoluteFill>
  );
};
