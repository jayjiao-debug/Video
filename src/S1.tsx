import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, pop, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Tongue, Bud, Receptor, RECEPTOR, type MolName } from './Micro3D';
import { project } from './three-kit';
import { CubeIcon } from './Title';

/* S1 (b44–b96): sweetness is a lock. Dive into the tongue → a taste bud → the sweet receptor (T1R2 + T1R3) on a cell.
   Sucrose docks in T1R2's flytrap, the lobes close, a signal leaves the cell. Then aspartame docks too, and the signal
   is far stronger. The ladder: sweetness relative to sucrose (US FDA, "Aspartame and Other Sweeteners in Food"):
   aspartame 200×, sucralose 600×, advantame 20,000×. The balance: 35 g of sugar ≈ 175 mg of aspartame at 200×;
   WHO's own example assumes 200–300 mg of aspartame in a can of diet soda, so "about 0.2 g" (估算). */
export const S1_IN = b(43), S1_OUT = b(96) + 0.3;

export const LINES_S1: Line[] = [
  [b(44) + 0.1, b(52) - 0.1, '答案，在你的舌头上。', 'The answer is on your tongue.'],
  [b(52) + 0.06, b(60) - 0.1, '舌头的味蕾里，藏着一种"甜味受体"——', 'Inside its taste buds sits a "sweet receptor",'],
  [b(60) + 0.06, b(67) - 0.1, '它像一把锁，只等形状对的分子。', 'a lock that waits for a molecule of the right shape.'],
  [b(67) + 0.06, b(75) - 0.1, '糖分子卡进去，锁合上，信号传给大脑：[甜]。', 'Sugar slips in, the lock closes, and the brain hears: sweet.'],
  [b(75) + 0.06, b(82) - 0.1, '可是能开这把锁的，不只有糖。', 'But sugar is not the only key.'],
  [b(82) + 0.06, b(90) - 0.1, '阿斯巴甜，甜度约是糖的[200倍]；三氯蔗糖，[600倍]。', 'Aspartame is about 200 times as sweet as sugar; sucralose, 600 times.'],
  [b(90) + 0.06, b(96) - 0.1, '同样的甜，只要[零点几克]。', 'The same sweetness takes a fraction of a gram.'],
];

const KEYS_TONGUE: Key[] = [
  [b(43), [0.4, 3.4, 6.8], [0, 0, 0]],
  [b(49), [0.25, 1.0, 1.7], [0, 0.15, 0]],
  [b(53), [0, 0.42, 0.28], [0, 0.26, 0]],
];
const KEYS_BUD: Key[] = [
  [b(52), [0.3, 0.1, 6], [0, 0, 0]],
  [b(57), [0.2, 0.9, 3.0], [0, 0.85, 0]],
  [b(61), [0, 1.5, 0.7], [0, 1.38, 0]],
];
const C = RECEPTOR.cleft;
const KEYS_REC: Key[] = [
  [b(60), [0.3, 2.6, 8.4], [0, 0.8, 0]],
  [b(66), [-0.3, 2.0, 5.6], [-0.2, 1.0, 0]],
  [b(69), [C[0] - 0.5, C[1] + 0.45, 4.6], [C[0] + 0.25, C[1] - 0.15, 0]],
  [b(76), [C[0] - 0.35, C[1] + 0.4, 4.3], [C[0] + 0.25, C[1] - 0.15, 0]],
  [b(81), [C[0] - 0.2, C[1] + 0.35, 4.0], [C[0] + 0.3, C[1] - 0.15, 0]],
  [b(84), [0.2, 1.9, 6.4], [0.6, 1.0, 0]],
  [b(97), [0.2, 1.9, 6.8], [0.6, 1.0, 0]],
];

// docking clocks
const SU = { in0: b(67), in1: b(70) + 0.3, close: b(70) + 0.3, sig: b(71), out0: b(74), out1: b(75) + 0.6 };
const AS = { in0: b(75) + 0.4, in1: b(78) + 0.2, close: b(78) + 0.2, sig: b(78) + 0.8 };
const path = (T: number, a: number, z: number, from: number[], to: number[]) => {
  const k = easeInOut(prog(T, a, z));
  return [lerp(from[0], to[0], k), lerp(from[1], to[1], k) + 0.25 * Math.sin(Math.PI * k), lerp(from[2], to[2], k)];
};
const DOCK = [C[0] - 0.08, C[1] + 0.02, C[2] + 0.36];

const molsAt = (T: number) => {
  const out: { name: MolName; p: number[]; r: number[]; s: number; glow?: number }[] = [];
  if (T > SU.in0 - 0.1 && T < SU.out1) {
    const leaving = prog(T, SU.out0, SU.out1);
    const p = leaving > 0 ? path(T, SU.out0, SU.out1, DOCK, [-3.4, 3.4, 1.0]) : path(T, SU.in0, SU.in1, [-3.6, 2.9, 1.4], DOCK);
    const spin = (1 - prog(T, SU.in0, SU.in1)) * 3 + leaving * 2;
    out.push({ name: 'sucrose', p, r: [0.3 + spin, 1.1 + spin * 0.7, 0.2], s: 0.1, glow: 0.35 * prog(T, SU.sig, SU.sig + 0.3) * (1 - leaving) });
  }
  if (T > AS.in0 - 0.1) {
    const p = path(T, AS.in0, AS.in1, [-3.6, 2.4, 1.6], DOCK);
    const spin = (1 - prog(T, AS.in0, AS.in1)) * 3;
    out.push({ name: 'aspartame', p, r: [0.8 + spin, 0.4 + spin * 0.6, 0.5], s: 0.095, glow: 0.9 * prog(T, AS.sig, AS.sig + 0.3) });
  }
  return out;
};

const LADDER: [string, number, string][] = [['蔗糖', 1, '×1'], ['阿斯巴甜', 200, '×200'], ['三氯蔗糖', 600, '×600'], ['爱德万甜', 20000, '×20,000']];

export const S1: React.FC<{ T: number }> = ({ T }) => {
  if (T < S1_IN || T > S1_OUT) return null;
  const o = easeOut(prog(T, S1_IN, S1_IN + 0.5)) * (1 - easeInOut(prog(T, S1_OUT - 0.5, S1_OUT)));
  const tongueO = 1 - easeInOut(prog(T, b(52) + 0.2, b(53)));
  const budO = easeInOut(prog(T, b(52) + 0.2, b(53))) * (1 - easeInOut(prog(T, b(60) + 0.2, b(61))));
  const recO = easeInOut(prog(T, b(60) + 0.2, b(61)));
  // receptor state
  const closeSu = easeInOut(prog(T, SU.close, SU.close + 0.5)) * (1 - easeInOut(prog(T, SU.out0, SU.out0 + 0.5)));
  const closeAs = easeInOut(prog(T, AS.close, AS.close + 0.45));
  const open = lerp(0.5, 0.06, Math.max(closeSu, closeAs));
  const pulse = T > AS.sig ? (T - AS.sig) * 0.9 : T > SU.sig ? (T - SU.sig) * 0.7 : 0;
  const glow = T > AS.sig ? 1.2 * Math.exp(-(T - AS.sig) / 2.5) + 0.25 : T > SU.sig && T < SU.out0 + 0.4 ? 0.35 : 0;
  const dim = easeInOut(prog(T, b(82), b(83)));
  const recLabel = easeOut(prog(T, b(61), b(62))) * (1 - prog(T, b(66), b(67)));
  const l2 = project(KEYS_REC, T, [-0.62 - 0.62, 1.4, 0]), l3 = project(KEYS_REC, T, [0.62 + 0.62, 1.4, 0]);
  const molLabel = (name: string, a: number, z: number) => {
    const oo = easeOut(prog(T, a, a + 0.4)) * (1 - prog(T, z - 0.3, z));
    if (oo <= 0) return null;
    const p = project(KEYS_REC, T, [DOCK[0] - 0.3, DOCK[1] + 0.32, DOCK[2]]);
    return <div style={{ position: 'absolute', left: p.x - 200, top: p.y - 40, width: 200, textAlign: 'right', fontFamily: ZH, fontWeight: 700, fontSize: 36, color: GOLD, opacity: oo, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>{name}</div>;
  };
  const ladO = easeOut(prog(T, b(82) + 0.2, b(83))) * (1 - easeInOut(prog(T, b(89) + 0.6, b(90) + 0.2)));
  const balO = easeOut(prog(T, b(90) + 0.2, b(91))) ;
  const XL = 300, WL = 1100; // ladder x0 and width for log10(20000)
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0716', opacity: o }}>
      {tongueO > 0.01 && <AbsoluteFill style={{ opacity: tongueO }}><Tongue T={T} keys={KEYS_TONGUE} /></AbsoluteFill>}
      {budO > 0.01 && <AbsoluteFill style={{ opacity: budO }}><Bud T={T} keys={KEYS_BUD} lit={prog(T, b(57), b(60))} /></AbsoluteFill>}
      {recO > 0.01 && (
        <AbsoluteFill style={{ opacity: recO, filter: dim > 0 ? `brightness(${1 - 0.6 * dim}) blur(${3 * dim}px)` : undefined }}>
          <Receptor T={T} keys={KEYS_REC} open={open} glow={glow} pulse={pulse} mols={molsAt(T)} />
        </AbsoluteFill>
      )}
      {recLabel > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: recLabel }}>
          <line x1={l2.x - 70} y1={l2.y} x2={l2.x - 190} y2={l2.y} stroke={GOLD} strokeWidth={2} />
          <line x1={l3.x + 70} y1={l3.y} x2={l3.x + 190} y2={l3.y} stroke={GOLD} strokeWidth={2} />
          <text x={l2.x - 205} y={l2.y + 14} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: INK }}>T1R2</text>
          <text x={l3.x + 205} y={l3.y + 14} style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: INK }}>T1R3</text>
          <text x={l2.x - 205} y={l2.y + 60} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: GOLD, letterSpacing: '0.1em' }}>甜味受体</text>
        </svg>
      )}
      {molLabel('蔗糖', SU.in1 - 0.3, SU.out0 + 0.4)}
      {molLabel('阿斯巴甜', AS.in1 - 0.3, b(82))}
      {/* the brain hears it */}
      {[[SU.sig, 0.7], [AS.sig, 1]].map(([a, s], i) => {
        const oo = easeOut(prog(T, a, a + 0.3)) * (1 - prog(T, a + 1.6, a + 2.2)) * (1 - dim);
        if (oo <= 0) return null;
        return <div key={i} style={{ position: 'absolute', right: 110, top: 150, fontFamily: ZH, fontWeight: 900, fontSize: 150 * s, color: GOLD, opacity: oo, transform: `scale(${0.8 + 0.2 * pop(T, a, 0.35)})`, textShadow: `0 0 ${40 * s}px rgba(246,207,120,0.6)` }}>甜</div>;
      })}
      {/* the sweetness ladder (log scale) */}
      {ladO > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: ladO }}>
          <text x={XL} y={200} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: INK }}>甜度：以蔗糖为 1</text>
          {[1, 10, 100, 1000, 10000].map((v) => {
            const x = XL + 150 + (Math.log10(v) / Math.log10(20000)) * WL;
            return <g key={v}><line x1={x} x2={x} y1={240} y2={700} stroke="rgba(243,237,226,0.15)" strokeDasharray="4 6" /><text x={x} y={736} textAnchor="middle" style={{ fontFamily: EN, fontSize: 24, fill: 'rgba(243,237,226,0.5)', fontVariantNumeric: 'lining-nums' }}>{v.toLocaleString('en-US')}</text></g>;
          })}
          {LADDER.map(([name, v, lab], i) => {
            const grow = easeOut(prog(T, b(82) + 0.4 + i * 0.7, b(82) + 1.2 + i * 0.7));
            const w = Math.max(10, (Math.log10(v) / Math.log10(20000)) * WL) * grow;
            const y = 280 + i * 105;
            return (
              <g key={name}>
                <text x={XL + 130} y={y + 38} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: i === 0 ? 'rgba(243,237,226,0.75)' : INK }}>{name}</text>
                <rect x={XL + 150} y={y} width={w} height={54} fill={i === 0 ? '#e9e4da' : GOLD} opacity={i === 0 ? 0.8 : 0.9} />
                <text x={XL + 170 + w} y={y + 40} style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: i === 0 ? INK : GOLD, fontVariantNumeric: 'lining-nums' }} opacity={grow}>{lab}</text>
              </g>
            );
          })}
          <text x={XL} y={790} style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.45)' }}>对数刻度 · 甜度倍数：美国食品药品管理局（FDA）</text>
        </svg>
      )}
      {/* the balance: same sweetness */}
      {balO > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: balO }}>
          <text x={960} y={200} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK, letterSpacing: '0.1em' }}>一样甜</text>
          <rect x={955} y={300} width={10} height={380} fill="#c8a25a" />
          <rect x={860} y={676} width={200} height={14} rx={7} fill="#c8a25a" />
          <rect x={560} y={296} width={800} height={10} rx={5} fill="#e2c27e" />
          <circle cx={960} cy={300} r={16} fill="#f6cf78" />
          {[640, 1280].map((x) => <g key={x}><line x1={x} y1={306} x2={x - 120} y2={480} stroke="#c8a25a" strokeWidth={2} /><line x1={x} y1={306} x2={x + 120} y2={480} stroke="#c8a25a" strokeWidth={2} /><path d={`M${x - 150},480 Q${x},540 ${x + 150},480 Z`} fill="#c8a25a" /></g>)}
          {Array.from({ length: 9 }, (_, k) => <CubeIcon key={k} x={640 + ((k % 3) - 1) * 46 + (Math.floor(k / 3) % 2) * 10} y={466 - Math.floor(k / 3) * 40} s={22} />)}
          {Array.from({ length: 7 }, (_, k) => <circle key={k} cx={1280 + (k - 3) * 4} cy={474 - (k % 2) * 3} r={2.4} fill="#fbf7ef" />)}
          <text x={640} y={600} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: INK, fontVariantNumeric: 'lining-nums' }}>35<tspan fontFamily={ZH} fontSize={32}> 克蔗糖</tspan></text>
          <text x={1280} y={600} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: GOLD, fontVariantNumeric: 'lining-nums' }}>≈0.2<tspan fontFamily={ZH} fontSize={32}> 克甜味剂</tspan></text>
          <text x={1280} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>按阿斯巴甜 200 倍估算</text>
        </svg>
      )}
      <SubBand />
      <Chapter T={T} at={b(44)} out={b(82)} text="舌 头 上 的 锁" />
      <Subs T={T} lines={LINES_S1} />
    </AbsoluteFill>
  );
};
