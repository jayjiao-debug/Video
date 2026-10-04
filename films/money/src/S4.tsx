import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, camAt, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, project } from './three-kit';
import { useAsset } from './useModels';
import { loadModel, materials, normalize } from './models';
import { EnvFor, Spot, softTex } from './kit';
import { Coin, COINS, coinMaterial, type CoinKind } from './coins';

/* S4, coins (b64–b96).
   A  b64–b80  Lydia, 7th century BC: a lump of electrum on an anvil; the punch comes down once, on b72, and the lump is
               a coin with a lion's head. The camera turns round it.  (LBMA; World History Encyclopedia: c. 630–600 BC)
   B  b80–b96  Qin 半两 (221 BC), then the same round coin with a square hole through two thousand years:
               汉五铢 118 BC · 唐开元通宝 621 · 北宋皇宋通宝 1039 · 明永乐通宝 1408 · 清光绪通宝 1875.
               The camera tracks the row and finally drops into the last square hole (to S5). */
export const S4_IN = b(64) - 0.35, S4_OUT = b(96) + 0.3;
const STAMP = b(72);

export const LINES_S4: Line[] = [
  [b(64) + 0.1, b(72) - 0.1, '公元前7世纪，吕底亚人铸出了最早的硬币。', 'In the 7th century BC, Lydia struck the first coins.'],
  [b(72) + 0.06, b(80) - 0.1, '国王的狮子印记，替你担保它的分量。', "The king's lion stamp vouched for its weight."],
  [b(80) + 0.06, b(88) - 0.1, '秦统一天下，圆形方孔的「半两」钱通行全国。', 'When Qin unified China, the round 半两 coin with a square hole ran everywhere.'],
  [b(88) + 0.06, b(96) - 0.1, '这个形状，一用就是[两千多年]。', 'That shape stayed in use for over two thousand years.'],
];

// ---------------- A: Lydia ----------------
const KEYS_A: Key[] = [
  [b(64) - 0.35, [0.13, 0.07, 0.17], [0, 0.03, 0]],
  [STAMP, [0.1, 0.06, 0.14], [0, 0.03, 0]],
  [b(76), [-0.06, 0.1, 0.09], [0, 0.016, 0]],
  [b(80), [-0.015, 0.12, 0.03], [0, 0.014, 0]],
];
const ANVIL_TOP = 0.012;

const loadLion = async () => {
  const g0 = (await loadModel('lioncoins')).clone(true);
  materials(g0).forEach((m) => { m.color = new THREE.Color('#f2dc93'); m.metalness = 0.9; m.roughness = 0.42; m.needsUpdate = true; });
  // the scan stands on edge; lay it flat, face up, and re-seat it on y = 0 at 30 mm across
  g0.rotation.x = -Math.PI / 2;
  return normalize(g0, 0.03, 'max');
};

const punchY = (T: number) => {
  if (T < STAMP - 0.09) return lerp(0.11, 0.135, easeInOut(prog(T, b(66), STAMP - 0.09))); // a slow wind-up
  if (T < STAMP) return lerp(0.135, ANVIL_TOP + 0.016 + 0.012, easeIn(prog(T, STAMP - 0.09, STAMP)));
  return lerp(ANVIL_TOP + 0.028, 0.3, easeInOut(prog(T, STAMP + 0.25, STAMP + 1.6)));
};

const Lydia: React.FC<{ T: number; lion: THREE.Group }> = ({ T, lion }) => {
  const struck = T >= STAMP;
  const fl = 0.85 + 0.1 * Math.sin(T * 11.3) * Math.sin(T * 5.9 + 2) + 0.05 * Math.sin(T * 27.1);
  const k = Math.exp(-(T - STAMP) / 0.12) * (struck ? 1 : 0);
  const shake: [number, number] = [0.004 * k * Math.sin(T * 90), 0.004 * k * Math.cos(T * 77)];
  const coin = useMemo(() => lion.clone(true), [lion]);
  const mats = useMemo(() => materials(coin), [coin]);
  const electrum = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e4cd84', metalness: 0.9, roughness: 0.38 }), []);
  return (
    <Stage bloom={0.4} threshold={0.88} shake={shake} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(KEYS_A, T).pos.map((v, i) => v - [0, 0.02, 0][i]))} aperture={0.05} maxblur={0.01}>
      <CamRig T={T} keys={KEYS_A} fov={30} />
      <ambientLight intensity={0.02} color="#8090b0" />
      <Spot position={[-0.3, 0.3, 0.15]} target={[0, 0.01, 0]} angle={0.5} penumbra={0.9} intensity={0.9 * fl} color="#ff9a52" near={0.05} far={2} />
      <pointLight position={[0.25, 0.25, -0.25]} intensity={0.04} decay={2} color="#7d9cff" />
      <Spot position={[0.0, 0.4, -0.1]} target={[0, 0, 0]} angle={0.35} penumbra={1} intensity={0.25} color="#ffd2a0" near={0.05} far={2} />
      <pointLight position={[0.05, 0.15, 0.2]} intensity={0.03} decay={2} color="#ffd9b0" />
      {/* anvil: a dark iron block on a stone floor */}
      <mesh position={[0, ANVIL_TOP / 2 - 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.1 + ANVIL_TOP, 48]} />
        <meshStandardMaterial color="#3a3430" metalness={0.7} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#2a221c" roughness={0.95} />
      </mesh>
      {!struck && (
        <mesh position={[0, ANVIL_TOP + 0.006, 0]} scale={[1, 0.42, 0.85]} castShadow material={electrum}>
          <sphereGeometry args={[0.016, 40, 24]} />
        </mesh>
      )}
      {struck && <primitive object={coin} position={[0, ANVIL_TOP, 0]} rotation={[0, 0.4, 0]} />}
      <EnvFor mats={[...mats, electrum]} intensity={0.6} />
      {/* the punch */}
      <mesh position={[0, punchY(T) + 0.1, 0]} castShadow>
        <boxGeometry args={[0.022, 0.2, 0.022]} />
        <meshStandardMaterial color="#3a3430" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* sparks on the strike */}
      {struck && T < STAMP + 0.8 && Array.from({ length: 40 }, (_, i) => {
        const t = T - STAMP, a = rnd(i, 1) * Math.PI * 2, v = 0.15 + rnd(i, 2) * 0.35, up = 0.1 + rnd(i, 3) * 0.4;
        const s = 0.0015 + rnd(i, 4) * 0.002;
        return (
          <sprite key={i} position={[Math.cos(a) * v * t, ANVIL_TOP + 0.01 + up * t - 0.5 * 0.9 * t * t, Math.sin(a) * v * t]} scale={[s, s, s]}>
            <spriteMaterial map={softTex()} color="#ffc070" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={1 - t / 0.8} toneMapped={false} />
          </sprite>
        );
      })}
    </Stage>
  );
};

// ---------------- B: two thousand years of square holes ----------------
const ROW: CoinKind[] = ['banliang', 'wuzhu', 'kaiyuan', 'huangsong', 'yongle', 'guangxu'];
const GAP = 0.05;
const coinX = (i: number) => i * GAP;
const KEYS_B: Key[] = [
  [b(79), [0.03, 0.075, 0.07], [0, 0, -0.004]],
  [b(87), [0.018, 0.06, 0.06], [0, 0, -0.004]],
  [b(89), [0.04, 0.09, 0.13], [0.06, 0, -0.01]],
  [b(94), [0.2, 0.08, 0.1], [0.215, 0, -0.005]],
  [b(96) + 0.3, [coinX(5), 0.012, 0.0005], [coinX(5), 0, 0]],
];

const Silk: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g = c.getContext('2d')!;
    g.fillStyle = '#2a0f10'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 2) { g.fillStyle = `rgba(0,0,0,${0.08 + 0.06 * Math.sin(i * 0.7)})`; g.fillRect(0, i, 512, 1); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 30);
    return t;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial map={tex} roughness={0.6} color="#a06060" />
    </mesh>
  );
};

const Row: React.FC<{ T: number }> = ({ T }) => {
  const lightX = lerp(0, coinX(5), easeInOut(prog(T, b(88), b(95))));
  return (
    <Stage bloom={0.35} threshold={0.9} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(KEYS_B, T).pos.map((v, i) => v - camAt(KEYS_B, T).look[i]))} aperture={0.06} maxblur={0.012}>
      <CamRig T={T} keys={KEYS_B} fov={30} />
      <ambientLight intensity={0.02} color="#8090b0" />
      <Spot position={[lightX - 0.12, 0.28, 0.12]} target={[lightX, 0, 0]} angle={0.55} penumbra={0.9} intensity={0.75} color="#ffc68a" near={0.05} far={2} />
      <pointLight position={[lightX + 0.3, 0.1, -0.3]} intensity={0.06} decay={2} color="#7d9cff" />
      <Silk />
      {ROW.map((k, i) => <Coin key={k} kind={k} position={[coinX(i), 0.0016, 0]} rotation={[0, (rnd(i, 3) - 0.5) * 0.25, 0]} />)}
      <EnvFor mats={ROW.map((k) => coinMaterial(k))} intensity={0.35} />
    </Stage>
  );
};

const RowLabels: React.FC<{ T: number }> = ({ T }) => (
  <>
    {ROW.map((k, i) => {
      const at = i === 0 ? b(80) + 0.6 : b(88) + 0.4 + (i - 1) * 0.95;
      const o = easeOut(prog(T, at, at + 0.4)) * (1 - prog(T, b(95), b(95) + 0.4));
      if (o <= 0.01) return null;
      const p = project(KEYS_B, T, [coinX(i), 0.002, -COINS[k].d / 2 - 0.004], 30);
      const [era, name] = COINS[k].era.split(' · ');
      return (
        <div key={k} style={{ position: 'absolute', left: p.x - 150, top: p.y - 120, width: 300, textAlign: 'center', opacity: o }}>
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: i === 0 ? 46 : 34, color: INK, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>{name}</div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: 'rgba(243,237,226,0.65)', marginTop: 2, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>{`${era} · ${COINS[k].year}`}</div>
        </div>
      );
    })}
  </>
);

export const S4: React.FC<{ T: number }> = ({ T }) => {
  const lion = useAsset('lion', loadLion);
  if (T < S4_IN || T > S4_OUT || !lion) return null;
  const o = easeOut(prog(T, S4_IN, S4_IN + 0.35)) * (1 - easeIn(prog(T, S4_OUT - 0.5, S4_OUT)));
  const shotB = T >= b(80) - 0.4;
  const xB = easeInOut(prog(T, b(80) - 0.4, b(80) + 0.1));
  const span = easeOut(prog(T, b(91), b(93)));
  const lionLabel = easeOut(prog(T, b(74), b(74) + 0.5)) * (1 - prog(T, b(79), b(80) - 0.3));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {(!shotB || xB < 1) && <Lydia T={T} lion={lion} />}
      {shotB && <AbsoluteFill style={{ opacity: xB }}><Row T={T} /><RowLabels T={T} /></AbsoluteFill>}
      {lionLabel > 0.01 && (
        <div style={{ position: 'absolute', right: 150, top: 330, width: 420, opacity: lionLabel, textAlign: 'left' }}>
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, color: INK }}>金银合金 · 狮子头</div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: 'rgba(243,237,226,0.6)', marginTop: 8, lineHeight: 1.5 }}>吕底亚（今土耳其西部）<br />约公元前630–600年</div>
        </div>
      )}
      {span > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: span * (1 - prog(T, b(95), b(95) + 0.4)) }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22 }}>
            <span style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)' }}>前221年</span>
            <span style={{ width: 520 * span, height: 2, background: GOLD, boxShadow: '0 0 12px rgba(246,207,120,0.6)' }} />
            <span style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)' }}>清末 1911年</span>
          </div>
        </div>
      )}
      <Chapter T={T} at={b(64) + 0.2} out={b(80) - 0.3} text="公元前7世纪 · 吕底亚" />
      <Chapter T={T} at={b(80) + 0.2} out={b(95)} text="公元前221年 · 秦" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S4} />
    </AbsoluteFill>
  );
};
