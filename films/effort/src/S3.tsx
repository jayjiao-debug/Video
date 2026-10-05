import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, pop, EN, ZH, GOLD, INK, RED, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { useModels } from './useModels';
import { Shop, TOP, allShells, output } from './S1';

/* S3, the shop's numbers (b40–b96).
   Health of Munition Workers Committee, set up September 1915; Pencavel (IZA DP 8129, 2014; Economic Journal 2015)
   re-estimated its records: output proportional to hours below 49 a week, rising ever more slowly above, a maximum
   near 63, and 70 h ≈ 56 h. Working all seven days cost about ten per cent of weekly output.
   The shop stays behind, out of focus; the chart is drawn over it one segment per line. */
export const S3_IN = b(39), S3_OUT = b(96) + 0.3;

export const LINES_S3: Line[] = [
  [b(41), b(49) - 0.1, '1915年，英国专门成立了军工工人健康委员会。', 'In 1915 Britain set up a committee on the health of munition workers.'],
  [b(49) + 0.06, b(57) - 0.1, '一百年后，经济学家彭卡维尔重算了这批数据。', 'A century later, the economist John Pencavel re-ran their numbers.'],
  [b(57) + 0.06, b(65) - 0.1, '49小时以内：多干一小时，就多一份产出。', 'Up to 49 hours a week, every extra hour brought an extra hour of output.'],
  [b(65) + 0.06, b(73) - 0.1, '过了49小时，每多干一小时，产出涨得越来越少。', 'Beyond 49, each extra hour added less and less.'],
  [b(73) + 0.06, b(81) - 0.1, '到63小时左右，产出到顶；再多干，反而更少。', 'Output peaked around 63 hours; past that, more work made less.'],
  [b(81) + 0.06, b(89) - 0.1, '一周七天不休息，产出还要再少大约[一成]。', 'And working all seven days cost about another tenth.'],
  [b(89) + 0.06, b(96) - 0.1, '付出翻倍，回报[不会翻倍]。', "Double the effort, and the reward does not double."],
];

const KEYS: Key[] = [
  [b(39), [-0.9, TOP + 0.55, 1.5], [-0.1, TOP + 0.12, 0]],
  [b(96) + 0.3, [0.9, TOP + 0.6, 1.4], [0.1, TOP + 0.12, 0]],
];

// chart frame: weekly hours 30–72 on x, output 0–60 on y
const CX = 400, CY = 730, CW = 1120, CH = 430;
const X = (h: number) => CX + ((h - 30) / 42) * CW;
const Y = (v: number) => CY - (v / 60) * CH;
const path = (h0: number, h1: number, f: (h: number) => number) => {
  const pts: string[] = [];
  for (let h = h0; h <= h1 + 1e-6; h += 0.5) pts.push(`${X(h).toFixed(1)},${Y(f(h)).toFixed(1)}`);
  return `M${pts.join(' L')}`;
};
const seg = (d: string, k: number, color: string, w = 5) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`}
    opacity={k > 0 ? 1 : 0} style={{ filter: 'drop-shadow(0 0 10px rgba(246,207,120,0.55))' }} />
);

const Chart: React.FC<{ T: number }> = ({ T }) => {
  const k1 = easeInOut(prog(T, b(57) + 0.2, b(59) + 0.2));
  const ghost = easeOut(prog(T, b(65), b(66)));
  const k2 = easeInOut(prog(T, b(65) + 0.3, b(68)));
  const k3 = easeInOut(prog(T, b(73) + 0.3, b(75)));
  const sun = easeInOut(prog(T, b(81) + 0.3, b(84)));
  const fin = easeOut(prog(T, b(89) + 0.2, b(90)));
  const o = (a: number, d = 0.4) => easeOut(prog(T, a, a + d));
  const appear = easeOut(prog(T, b(57) - 0.4, b(57) + 0.2));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: appear }}>
      <rect x={CX - 150} y={Y(60) - 70} width={CW + 260} height={CH + 150} rx={10} fill="rgba(5,6,11,0.8)" />
      <g stroke="rgba(243,237,226,0.12)">
        {[10, 20, 30, 40, 50].map((v) => <line key={v} x1={CX} y1={Y(v)} x2={CX + CW} y2={Y(v)} />)}
      </g>
      <line x1={CX} y1={CY} x2={CX + CW + 20} y2={CY} stroke="rgba(243,237,226,0.55)" strokeWidth={2} />
      <line x1={CX} y1={CY} x2={CX} y2={Y(60)} stroke="rgba(243,237,226,0.55)" strokeWidth={2} />
      {[35, 49, 56, 63, 70].map((h) => <text key={h} x={X(h)} y={CY + 38} textAnchor="middle" style={{ fontFamily: EN, fontSize: 28, fill: [49, 63].includes(h) ? GOLD : 'rgba(243,237,226,0.6)' }}>{h}</text>)}
      <text x={CX + CW + 20} y={CY - 14} textAnchor="end" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>每周工时（小时）</text>
      <text x={CX - 20} y={Y(60) + 10} textAnchor="end" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.6)' }}>产出</text>
      {/* what a straight line would promise */}
      <line x1={X(49)} y1={Y(49)} x2={X(60)} y2={Y(60)} stroke="rgba(243,237,226,0.35)" strokeWidth={2.5} strokeDasharray="8 10" opacity={ghost} />
      <text x={X(60) + 14} y={Y(60) + 8} style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.5)' }} opacity={ghost}>如果是直线</text>
      {seg(path(30, 49, output), k1, GOLD)}
      {seg(path(49, 63, output), k2, GOLD)}
      {seg(path(63, 70, output), k3, GOLD)}
      {/* knots */}
      <g opacity={o(b(59))}><circle cx={X(49)} cy={Y(49)} r={9 * pop(T, b(59))} fill={GOLD} /><text x={X(49) - 16} y={Y(49) - 22} textAnchor="end" style={{ fontFamily: ZH, fontSize: 28, fill: INK }}>49小时：开始变弯</text></g>
      <g opacity={o(b(75))}><circle cx={X(63)} cy={Y(output(63))} r={9 * pop(T, b(75))} fill={GOLD} /><text x={X(63)} y={Y(output(63)) - 26} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 28, fill: INK }}>63小时：到顶</text></g>
      <g opacity={o(b(76))}>
        <line x1={X(56)} y1={Y(output(56))} x2={X(70)} y2={Y(output(70))} stroke="rgba(243,237,226,0.5)" strokeWidth={1.5} strokeDasharray="4 6" />
        <circle cx={X(56)} cy={Y(output(56))} r={7} fill={INK} /><circle cx={X(70)} cy={Y(output(70))} r={7} fill={INK} />
        <text x={X(70) + 18} y={Y(output(70)) + 8} style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.75)' }}>70 ≈ 56</text>
      </g>
      {/* seven days a week, no rest: about a tenth less */}
      <path d={path(49, 70, (h) => 0.9 * output(h))} fill="none" stroke={RED} strokeWidth={3.5} strokeDasharray="10 9" opacity={sun} />
      <text x={X(70) + 18} y={Y(0.9 * output(70)) + 34} style={{ fontFamily: ZH, fontSize: 24, fill: RED }} opacity={sun}>七天无休 −10%</text>
      {/* the verdict: effort ×2 (35 → 70 h), output × 1.55 */}
      <g opacity={fin}>
        <line x1={X(35)} y1={CY + 56} x2={X(70)} y2={CY + 56} stroke={INK} strokeWidth={2} />
        <line x1={X(35)} y1={CY + 48} x2={X(35)} y2={CY + 64} stroke={INK} strokeWidth={2} /><line x1={X(70)} y1={CY + 48} x2={X(70)} y2={CY + 64} stroke={INK} strokeWidth={2} />
        <text x={X(70) + 16} y={CY + 65} style={{ fontFamily: ZH, fontSize: 26, fill: INK }}>付出 ×2</text>
        <line x1={X(30) - 40} y1={Y(35)} x2={X(30) - 40} y2={Y(output(70))} stroke={GOLD} strokeWidth={2} />
        <text x={X(30) - 56} y={(Y(35) + Y(output(70))) / 2 + 10} textAnchor="end" style={{ fontFamily: ZH, fontSize: 26, fill: GOLD }}>回报 ×1.5</text>
      </g>
    </svg>
  );
};

/** b41–b57: the two documents behind the numbers */
const Doc: React.FC<{ T: number; at: number; out: number; x: number; kicker: string; title: string; sub: string }> = ({ T, at, out, x, kicker, title, sub }) => {
  const o = easeOut(prog(T, at, at + 0.5)) * (1 - easeIn(prog(T, out - 0.4, out)));
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: 230 + (1 - o) * 20, width: 560, padding: '34px 40px', background: 'linear-gradient(170deg, #e9dfc8, #d4c6a6)', color: '#2a2218', opacity: o,
      boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: 'rotate(-1.6deg)', borderRadius: 2 }}>
      <div style={{ fontFamily: EN, fontSize: 22, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6a5a40' }}>{kicker}</div>
      <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, lineHeight: 1.15, marginTop: 14 }}>{title}</div>
      <div style={{ height: 2, background: '#6a5a40', opacity: 0.4, margin: '18px 0' }} />
      <div style={{ fontFamily: ZH, fontSize: 26, lineHeight: 1.6, color: '#3a3024', whiteSpace: 'pre-line' }}>{sub}</div>
    </div>
  );
};

export const S3: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['table', 'lamp', 'wallclock', 'shell']);
  if (T < S3_IN || T > S3_OUT || !m) return null;
  const o = easeOut(prog(T, S3_IN, S3_IN + 0.5)) * (1 - easeIn(prog(T, S3_OUT - 0.5, S3_OUT)));
  const dim = lerp(0.85, 0.45, easeInOut(prog(T, b(56), b(58))));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <Shop T={T} keys={KEYS} m={m} shells={allShells} dim={dim} aperture={0.03} />
      <Doc T={T} at={b(41) + 0.2} out={b(49)} x={1180} kicker="Ministry of Munitions · 1915" title="Health of Munition Workers Committee" sub={'1915年9月成立\n记录了女工每周的工时和产量'} />
      <Doc T={T} at={b(49) + 0.2} out={b(57)} x={1180} kicker="IZA Discussion Paper 8129 · 2014" title="The Productivity of Working Hours" sub={'约翰·彭卡维尔（斯坦福大学）\n用这些记录估算工时和产出的关系'} />
      <Chart T={T} />
      <Chapter T={T} at={b(41)} out={b(95)} text="1915年 · 英国 · 军工厂" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S3} />
    </AbsoluteFill>
  );
};
