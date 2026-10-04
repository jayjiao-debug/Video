import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, camAt, DROP, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex } from './three-kit';
import { useAsset, useModels } from './useModels';
import { materials } from './models';
import { Bill, EnvFor, Spot, softTex, loadBillTex } from './kit';
import { coinGeometry, coinMaterial } from './coins';
import { loadBar } from './S1';

/* S6, paper (b128 → the drop at 81.38 s; the build).
   A  b128–b142  Northern Song, Sichuan: a heap of iron coins on a counter by an oil lamp. A sheet of paper drifts down on it.
   B  b142–b148  1024: the 交子 under a lamp; the official seal comes down once (b145, a hit).
                 (中新网 2024; 吴钩《宋朝的纸币》: Sichuan used heavy iron coin; 益州交子务 set up 1023, official 交子 from 1024)
   C  b148–DROP  1944, Bretton Woods: a $100 note and a gold bar joined by a gold chain. $35 = 1 oz (Federal Reserve History).
                 The chain draws tight as the music builds; S7 breaks it on the drop. */
export const S6_IN = b(128) - 0.35, S6_OUT = DROP;

export const LINES_S6: Line[] = [
  [b(129), b(136) - 0.1, '北宋时的四川，用的是铁钱：又重又不值钱。', 'In Song-dynasty Sichuan, money was iron coin: heavy and worth little.'],
  [b(136) + 0.06, b(142) - 0.1, '商人们开始用一张纸，代替一堆铁。', 'So merchants began using a slip of paper instead of a pile of iron.'],
  [b(142) + 0.06, b(148) - 0.1, '1024年，官府发行了[「交子」]。', 'In 1024, the government issued the jiaozi.'],
  [b(148) + 0.06, b(155) - 0.1, '二战后，美元和黄金挂钩：[35美元]换1盎司。', 'After WWII, the dollar was tied to gold: $35 bought one ounce.'],
  [b(155) + 0.06, DROP - 0.04, '直到1971年8月15日——', 'Until 15 August 1971—'],
];

// ---------------- A + B: Song Sichuan ----------------
const TOP = 0.76;
const HEAP_N = 260;
const HEAP = Array.from({ length: HEAP_N }, (_, i) => {
  const a = i * 2.39996 + rnd(i, 1);
  const r = 0.006 * Math.sqrt(i) + rnd(i, 2) * 0.004;
  const h = Math.max(0, 0.07 - r * 0.62) * (0.7 + 0.3 * rnd(i, 3));
  return { p: [Math.cos(a) * r * 1.2, TOP + 0.0015 + h, Math.sin(a) * r], r: [(rnd(i, 4) - 0.5) * 0.9, rnd(i, 5) * 6.28, (rnd(i, 6) - 0.5) * 0.9] };
});

const IronHeap: React.FC<{ dim: number }> = ({ dim }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(coinGeometry('iron'), coinMaterial('iron', 'iron'), HEAP_N);
    const o = new THREE.Object3D();
    HEAP.forEach((c, i) => { o.position.set(c.p[0], c.p[1], c.p[2]); o.rotation.set(c.r[0], c.r[1], c.r[2]); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }, []);
  return <primitive object={mesh} visible={dim > 0.01} />;
};

/** a 交子-style note: a woodblock print in black ink on pale paper with red seals (an illustration, not a copy of a surviving note) */
const JZ: Record<string, THREE.Texture> = {};
const jiaoziTex = (sealed: boolean) => JZ[String(sealed)] ?? (JZ[String(sealed)] = canvasTex(600, 1000, (g) => {
  g.fillStyle = '#d9cba8'; g.fillRect(0, 0, 600, 1000);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + rnd(i, 1) * 0.06})`; g.fillRect(rnd(i, 2) * 600, rnd(i, 3) * 1000, 1 + rnd(i, 4) * 3, 1); }
  g.strokeStyle = '#231a12'; g.lineWidth = 10; g.strokeRect(34, 34, 532, 932);
  g.lineWidth = 3; g.strokeRect(58, 58, 484, 884);
  // border of repeated coin marks
  for (let k = 0; k < 18; k++) for (const [x, y] of [[80 + k * 25, 46], [80 + k * 25, 954]]) { g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#231a12'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '900 120px "Noto Serif CJK SC", serif'; g.fillText('交', 300, 190); g.fillText('子', 300, 320);
  g.font = '700 46px "Noto Serif CJK SC", serif'; g.fillText('壹 貫 文 省', 300, 450);
  g.font = '500 30px "Noto Serif CJK SC", serif';
  ['益州交子務', '同一見錢', '流通行使'].forEach((t, i) => g.fillText(t, 300, 540 + i * 48));
  // a woodblock picture panel: a granary, people carrying
  g.strokeRect(110, 700, 380, 200); g.beginPath(); g.moveTo(140, 800); g.lineTo(300, 720); g.lineTo(460, 800); g.stroke();
  g.strokeRect(190, 800, 220, 90);
  for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(160 + k * 70, 880, 10, 0, Math.PI * 2); g.stroke(); }
  // red seals
  g.fillStyle = 'rgba(176,32,28,0.85)'; g.fillRect(400, 560, 110, 110); g.fillRect(90, 380, 90, 90);
  g.fillStyle = '#d9cba8'; g.font = '700 34px "Noto Serif CJK SC", serif'; g.fillText('官', 455, 595); g.fillText('印', 455, 638);
  if (sealed) {
    // the official seal of the 益州交子务, stamped over the lower half
    g.save(); g.translate(300, 640); g.rotate(-0.08);
    g.fillStyle = 'rgba(190,30,26,0.82)'; g.fillRect(-120, -120, 240, 240);
    g.fillStyle = '#d9cba8'; g.fillRect(-104, -104, 208, 208);
    g.fillStyle = 'rgba(190,30,26,0.82)'; g.font = '900 78px "Noto Serif CJK SC", serif';
    g.fillText('交子', 0, -42); g.fillText('務印', 0, 50);
    g.restore();
  }
}));

const SEAL_AT = b(145);
const NOTE_LAND = b(139);
const noteY = (T: number) => (T < NOTE_LAND ? lerp(0.3, 0, easeOut(prog(T, b(136), NOTE_LAND))) : 0);
const KEYS_A: Key[] = [
  [b(128) - 0.35, [0.28, TOP + 0.16, 0.3], [0, TOP + 0.03, 0]],
  [b(136), [0.2, TOP + 0.13, 0.22], [0, TOP + 0.03, 0]],
  [b(142), [0.07, TOP + 0.36, 0.14], [0.03, TOP + 0.06, 0]],
  [b(148), [0.06, TOP + 0.32, 0.11], [0.03, TOP + 0.075, 0]],
];

const Song: React.FC<{ T: number; table: THREE.Group }> = ({ T, table }) => {
  const t = useMemo(() => {
    const c = table.clone(true);
    const bb = new THREE.Box3().setFromObject(c);
    c.position.y += TOP - bb.max.y;
    c.rotation.y = Math.PI / 2;
    materials(c).forEach((m) => { m.color = new THREE.Color('#5d4a3a'); m.roughness = 0.8; });
    return c;
  }, [table]);
  const jz = jiaoziTex(T >= SEAL_AT);
  const fl = 0.85 + 0.1 * Math.sin(T * 9.7) * Math.sin(T * 6.1 + 1.3) + 0.05 * Math.sin(T * 21);
  const heapDim = 1 - 0.6 * easeInOut(prog(T, b(140), b(143)));
  const y = noteY(T);
  const sway = T < NOTE_LAND ? Math.sin((T - b(136)) * 5) * 0.4 * (1 - prog(T, b(136), NOTE_LAND)) : 0;
  return (
    <Stage bloom={0.4} threshold={0.88} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(KEYS_A, T).pos.map((v, i) => v - camAt(KEYS_A, T).look[i]))} aperture={0.03} maxblur={0.01}
      shake={T >= SEAL_AT ? [0.002 * Math.exp(-(T - SEAL_AT) / 0.1) * Math.sin(T * 80), 0] : [0, 0]}>
      <CamRig T={T} keys={KEYS_A} fov={30} />
      <ambientLight intensity={0.02} color="#8090b0" />
      <Spot position={[-0.15, TOP + 0.45, 0.12]} target={[0, TOP, 0]} angle={0.6} penumbra={0.85} intensity={1.0 * fl} color="#ffb066" near={0.05} far={2} />
      <pointLight position={[0.5, TOP + 0.3, -0.5]} intensity={0.08} decay={2} color="#6f8cff" />
      {/* the oil lamp: a small flame by the heap */}
      <group position={[-0.17, TOP, -0.08]}>
        <mesh position={[0, 0.012, 0]} castShadow><cylinderGeometry args={[0.03, 0.022, 0.024, 24]} /><meshStandardMaterial color="#4a3020" roughness={0.6} /></mesh>
        <sprite position={[0, 0.045 + 0.002 * Math.sin(T * 17), 0]} scale={[0.02, 0.035, 0.02]}><spriteMaterial map={softTex()} color="#ffb050" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.9 * fl} /></sprite>
        <sprite position={[0, 0.045, 0]} scale={[0.12, 0.12, 0.12]}><spriteMaterial map={softTex()} color="#ff9040" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.25 * fl} /></sprite>
        <pointLight position={[0, 0.05, 0]} intensity={0.05 * fl} decay={2} color="#ff9a40" />
      </group>
      <primitive object={t} />
      <group><IronHeap dim={heapDim} /></group>
      <EnvFor mats={[coinMaterial('iron', 'iron')]} intensity={0.2 * heapDim} />
      {T >= b(136) && (
        <mesh position={[0.01, TOP + 0.075 + y, 0.005]} rotation={[-Math.PI / 2 + sway * 0.3, 0, 0.25 + sway]} castShadow receiveShadow>
          <planeGeometry args={[0.072, 0.12, 8, 12]} />
          <meshStandardMaterial map={jz} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </Stage>
  );
};

// ---------------- C: the chain (shared with S7) ----------------
export const BILL_C: [number, number, number] = [-0.14, 0, 0];
export const BAR_C: [number, number, number] = [0.15, -0.012, 0];
const A0 = [-0.064, 0.0], A1 = [0.094, -0.004];
export const LINKS = 15;
/** the link positions on a sagging line between the note and the bar; `tight` pulls the sag out */
export const linkPose = (i: number, tight: number) => {
  const u = (i + 0.5) / LINKS;
  const x = lerp(A0[0], A1[0], u);
  const sag = 0.03 * (1 - tight * 0.85);
  const y = lerp(A0[1], A1[1], u) - sag * 4 * u * (1 - u);
  return [x, y, 0];
};

let LINK_GEO: THREE.TorusGeometry | null = null;
export const linkGeo = () => LINK_GEO ?? (LINK_GEO = new THREE.TorusGeometry(0.0062, 0.0017, 12, 32));
export const chainMat = new THREE.MeshStandardMaterial({ color: '#f0c060', metalness: 1, roughness: 0.25 });

export const KEYS_C: Key[] = [
  [b(148) - 0.4, [0.02, 0.06, 0.62], [0.005, 0.0, 0]],
  [b(155), [0.01, 0.03, 0.42], [0.008, -0.005, 0]],
  [DROP, [0.012, 0.012, 0.16], [0.012, -0.012, 0]],
];

export const ChainSet: React.FC<{ T: number; keys: Key[]; tension: number; broken?: number; barVisible?: boolean; billPose?: { p: number[]; r: number[] }; barPose?: { p: number[]; r: number[] }; children?: React.ReactNode; shake?: [number, number]; bloom?: number }> = ({ T, keys, tension, broken = -1, billPose, barPose, children, shake = [0, 0], bloom = 0.5 }) => {
  const tex = useAsset('billtex', loadBillTex);
  const bar = useAsset('goldbar1', loadBar);
  const barObj = useMemo(() => (bar ? bar.clone() : null), [bar]);
  if (!tex || !barObj) return null;
  const tb = broken >= 0 ? T - broken : -1;
  return (
    <Stage bloom={bloom} threshold={0.86} shake={shake} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(keys, T).pos.map((v, i) => v - camAt(keys, T).look[i]))} aperture={0.02} maxblur={0.01}>
      <CamRig T={T} keys={keys} fov={30} />
      <ambientLight intensity={0.03} color="#8090b0" />
      <Spot position={[0.05, 0.45, 0.25]} target={[0, -0.01, 0]} angle={0.42} penumbra={0.9} intensity={1.3} color="#ffd2a0" near={0.05} far={3} />
      <pointLight position={[-0.3, 0.1, -0.3]} intensity={0.08} decay={2} color="#7d9cff" />
      <Bill tex={tex} position={billPose?.p ?? BILL_C} rotation={billPose?.r ?? [Math.PI / 2, 0, 0]} curl={0.002} />
      {(barPose || tb < 0) && <primitive object={barObj} position={barPose?.p ?? BAR_C} rotation={barPose?.r ?? [0, -0.25, 0]} />}
      <EnvFor mats={[barObj.material as THREE.Material, chainMat]} intensity={0.9} />
      {Array.from({ length: LINKS }, (_, i) => {
        const p = linkPose(i, tension);
        const jit = tb < 0 ? 0.0012 * tension * tension * Math.sin(T * 61 + i * 1.7) : 0;
        let pos = [p[0], p[1] + jit, p[2]], rot = [i % 2 ? Math.PI / 2 : 0, 0, 0];
        if (tb >= 0) {
          // the break: the middle link goes; links fly out from the gap, spinning, under gravity
          const mid = (LINKS - 1) / 2, side = i < mid ? -1 : 1, d = Math.abs(i - mid);
          const v = 0.12 / (1 + d * 0.5) + rnd(i, 1) * 0.05;
          pos = [p[0] + side * v * tb, p[1] + (0.12 + rnd(i, 2) * 0.1) * tb - 0.5 * 0.6 * tb * tb, p[2] + (rnd(i, 3) - 0.5) * 0.15 * tb];
          rot = [rot[0] + tb * (4 + rnd(i, 4) * 6), tb * (3 + rnd(i, 5) * 5), 0];
          if (i === Math.floor(mid) || i === Math.ceil(mid)) return null;
        }
        return <mesh key={i} geometry={linkGeo()} material={chainMat} position={pos as [number, number, number]} rotation={rot as [number, number, number]} scale={[1.55, 1, 1]} castShadow />;
      })}
      {children}
    </Stage>
  );
};

export const S6: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['table']);
  if (T < S6_IN || T > S6_OUT || !m) return null;
  const o = easeOut(prog(T, S6_IN, S6_IN + 0.4));
  const shotC = T >= b(148) - 0.4;
  const xC = easeInOut(prog(T, b(148) - 0.4, b(148) + 0.1));
  const tension = easeIn(prog(T, b(150), DROP));
  const sealO = easeOut(prog(T, SEAL_AT + 0.2, SEAL_AT + 0.6)) * (1 - prog(T, b(148) - 0.5, b(148) - 0.1));
  const rate = easeOut(prog(T, b(149), b(150))) * (1 - prog(T, b(155) - 0.2, b(155) + 0.2));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {(!shotC || xC < 1) && <Song T={T} table={m.table} />}
      {shotC && <AbsoluteFill style={{ opacity: xC }}><ChainSet T={T} keys={KEYS_C} tension={tension} /></AbsoluteFill>}
      {sealO > 0.01 && (
        <div style={{ position: 'absolute', left: 140, top: 300, width: 520, opacity: sealO }}>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, color: GOLD, textShadow: '0 0 20px rgba(246,207,120,0.35)' }}>交子</div>
          <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.75)', marginTop: 10, lineHeight: 1.6 }}>世界上最早由官府发行的纸币<br />1023年 设益州交子务 · 1024年 首次发行</div>
          <div style={{ fontFamily: ZH, fontSize: 18, color: 'rgba(243,237,226,0.45)', marginTop: 10 }}>画面中的交子为示意，原物没有留存</div>
        </div>
      )}
      {rate > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', opacity: rate }}>
          <span style={{ fontFamily: EN, fontWeight: 700, fontSize: 110, color: INK, fontVariantNumeric: 'lining-nums' }}>$35</span>
          <span style={{ fontFamily: EN, fontSize: 80, color: 'rgba(243,237,226,0.6)', margin: '0 36px' }}>=</span>
          <span style={{ fontFamily: EN, fontWeight: 700, fontSize: 110, color: GOLD, textShadow: '0 0 24px rgba(246,207,120,0.4)', fontVariantNumeric: 'lining-nums' }}>1<span style={{ fontFamily: ZH, fontSize: 52 }}> 盎司黄金</span></span>
        </div>
      )}
      <Chapter T={T} at={b(128) + 0.3} out={b(142)} text="北宋 · 四川" />
      <Chapter T={T} at={b(142) + 0.1} out={b(148) - 0.3} text="1024年 · 成都" />
      <Chapter T={T} at={b(148) + 0.2} out={b(155)} text="1944年 · 布雷顿森林体系" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S6} />
    </AbsoluteFill>
  );
};
