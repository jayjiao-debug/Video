import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, prog, easeOut, easeIn, easeInOut, lerp, pop, hit, EN, ZH, SANS, GOLD, INK, RED, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Counter3D, Bokeh, CAN_H, type CanState } from './Counter3D';

/* S3 (b161–b240, the second drop): is it healthy? Three findings, each with its limit stated.
   - IARC classified aspartame Group 2B, "possibly carcinogenic", on limited evidence (WHO, 2023-07-14). Same group:
     aloe vera whole-leaf extract, traditional Asian pickled vegetables (IARC list; Korea Times, 2023-07-09).
   - JECFA kept the acceptable daily intake at 0–40 mg/kg body weight: a 70 kg adult would need more than 9–14 cans
     a day (assuming 200–300 mg aspartame per can) to exceed it (WHO, 2023-07-14).
   - Erythritol: Witkowski et al., Nature Medicine, 2023-02-27 — people in the top quartile of blood erythritol had
     about twice the 3-year risk of major cardiovascular events vs the bottom quartile (observational; cohorts of
     patients already at high cardiovascular risk), and drinking an erythritol-sweetened drink raised blood levels
     ~1000-fold for days (NIH Research Matters). No brand is named or shown in this part.
   - WHO guideline, 2023-05-15 (conditional): don't use non-sugar sweeteners to control body weight or reduce the
     risk of NCDs; no long-term benefit in reducing body fat; possible links to type 2 diabetes, cardiovascular
     disease and mortality. Not for people with existing diabetes. */
export const S3_IN = cut(161), S3_OUT = cut(240) - 1e-4;

export const LINES_S3: Line[] = [
  [b(161) + 0.1, b(168) - 0.1, '那么——它健康吗？', 'So is it healthy?'],
  [b(168) + 0.06, b(176) - 0.1, '2023年7月，阿斯巴甜被列为"可能致癌"。', 'In July 2023 aspartame was classed as "possibly carcinogenic" (Group 2B).'],
  [b(176) + 0.06, b(184) - 0.1, '同一类里，还有芦荟全叶提取物、传统腌菜。', 'The same group holds aloe vera leaf extract and traditional pickled vegetables.'],
  [b(184) + 0.06, b(192) - 0.1, '而安全线是：每公斤体重，每天40毫克。', 'The safe limit: 40 mg per kilogram of body weight a day.'],
  [b(192) + 0.06, b(200) - 0.1, '70公斤的人，一天得喝[9到14罐]以上才超标。', 'A 70 kg adult would need more than 9 to 14 cans a day to pass it.'],
  [b(200) + 0.06, b(208) - 0.1, '另一种代糖赤藓糖醇，2023年有研究发现：', 'Another common sweetener, erythritol: a 2023 study found'],
  [b(208) + 0.06, b(216) - 0.1, '血液里含量最高的人，心血管风险约是[2倍]。', 'people with the most in their blood had about twice the risk of heart attack or stroke.'],
  [b(216) + 0.06, b(224) - 0.1, '但这是观察性研究，不能证明因果。', 'But it was observational, in people already at high risk: it cannot show cause.'],
  [b(224) + 0.06, b(232) - 0.1, '同年5月，世卫建议：{别}靠代糖控制体重。', 'That May, the WHO advised against using sweeteners to control weight.'],
  [b(232) + 0.06, b(240) - 0.15, '长期看它不减脂，还可能和慢性病风险有关。', 'Long term they don\'t reduce body fat, and may be linked to some chronic disease risks.'],
];

// the can stack: 5-4-3-2 = 14 black cans, each dropped in on its own accelerating clock
const STACK: number[][] = [];
[5, 4, 3, 2].forEach((n, row) => { for (let i = 0; i < n; i++) STACK.push([(i - (n - 1) / 2) * 0.68, row * (CAN_H + 0.004)]); });
const dropAt = (i: number) => b(186) + 0.62 * i - 0.018 * i * i;
const KEYS_STACK: Key[] = [
  [b(184), [0.4, 1.6, 10.5], [0, 1.25, 0]],
  [b(200), [-0.2, 2.5, 16.5], [0, 2.05, 0]],
];

const Card: React.FC<{ o: number; children: React.ReactNode; y?: number }> = ({ o, children, y = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateY(${(1 - o) * 16 + y}px)` }}>{children}</div>
);

export const S3: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN || T > S3_OUT) return null;
  const o = 1;
  // hard cuts on the bar: each card is on screen from its beat to the next card's beat
  const win = (a: number, z: number) => (T >= a - 0.02 && T < z - 0.02 ? 1 : 0);
  const qO = win(b(161), b(168));
  const iarcO = win(b(168), b(184));
  const shelf = easeOut(prog(T, b(176), b(177)));
  const stackO = win(b(184), b(200));
  const studyO = win(b(200), b(224));
  const whoO = win(b(224), b(240));
  const cans: CanState[] = STACK.map(([x, y], i) => {
    const k = easeOut(prog(T, dropAt(i), dropAt(i) + 0.35));
    return { kind: 'black', p: [x, y + 2.2 * (1 - k), 0], ry: 0.2 + i * 0.37, o: k } as CanState;
  }).filter((c) => (c.o ?? 0) > 0.01);
  const n = STACK.filter((_, i) => T > dropAt(i) + 0.2).length;
  return (
    <AbsoluteFill style={{ backgroundColor: '#06070c', opacity: o }}>
      {/* the question, on the drop */}
      <Card o={qO}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(246,207,120,0.12), rgba(0,0,0,0) 70%)' }} />
        <div style={{ position: 'absolute', top: 380, left: 0, right: 0, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 150, color: GOLD, transform: `scale(${0.85 + 0.15 * pop(T, b(161), 0.4)})`, textShadow: '0 0 40px rgba(246,207,120,0.4)' }}>健康吗？</div>
      </Card>
      {/* IARC: the headline, then the shelf it sits on */}
      <Card o={iarcO}>
        <svg width={1920} height={1080}>
          <g transform={`translate(0,${-120 * shelf})`}>
            <rect x={460} y={250} width={1000} height={200} fill="#efe8d8" />
            <rect x={460} y={250} width={1000} height={8} fill="#2a2a2a" />
            <text x={500} y={310} style={{ fontFamily: SANS, fontSize: 24, fill: '#555', letterSpacing: '0.1em' }}>2023 年 7 月 14 日 · 国际癌症研究机构（IARC）</text>
            <text x={500} y={400} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 70, fill: '#1a1a1a' }}>阿斯巴甜：<tspan fill="#b23a2e">“可能致癌”</tspan></text>
          </g>
          <g opacity={shelf}>
            <text x={960} y={372} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: GOLD }}>2B 类 · 人类致癌证据有限</text>
            <rect x={420} y={700} width={1080} height={18} fill="#6a4a2a" />
            {['阿斯巴甜', '芦荟全叶提取物', '传统亚洲腌菜'].map((t, k) => {
              const x = 600 + k * 360, d = easeOut(prog(T, b(176) + 0.3 + k * 0.35, b(176) + 0.8 + k * 0.35));
              return (
                <g key={t} opacity={d} transform={`translate(${x},${700 - 20 * (1 - d)}) scale(1.25)`}>
                  <rect x={-80} y={-200} width={160} height={200} rx={20} fill={k === 0 ? 'rgba(246,207,120,0.22)' : 'rgba(200,220,200,0.16)'} stroke="rgba(243,237,226,0.5)" strokeWidth={3} />
                  <rect x={-70} y={-226} width={140} height={30} rx={6} fill="#8a6a4a" />
                  <rect x={-70} y={-140} width={140} height={70} fill="#efe8d8" />
                  <text x={0} y={-95} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: t.length > 5 ? 20 : 27, fill: '#2a2a2a' }}>{t}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </Card>
      {/* the safe limit: a stack of cans */}
      {stackO > 0.01 && (
        <AbsoluteFill style={{ opacity: stackO }}>
          <Bokeh seed={3} />
          <Counter3D T={T} keys={KEYS_STACK} cans={cans} lamp={3.2} lampPos={[-2.5, 10, 6]} />
          <div style={{ position: 'absolute', left: 120, top: 200, width: 560 }}>
            <div style={{ fontFamily: ZH, fontSize: 30, color: 'rgba(243,237,226,0.75)' }}>每日允许摄入量（JECFA）</div>
            <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 96, color: INK, lineHeight: 1.1, fontVariantNumeric: 'lining-nums' }}>40<span style={{ fontFamily: ZH, fontSize: 40 }}> 毫克/公斤</span></div>
            <div style={{ fontFamily: ZH, fontSize: 28, color: 'rgba(243,237,226,0.65)', marginTop: 20, opacity: easeOut(prog(T, b(192), b(193))) }}>70 公斤成年人 · 按每罐 200–300 毫克估算</div>
          </div>
          <div style={{ position: 'absolute', right: 140, top: 230, textAlign: 'right' }}>
            <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 180, color: n >= 9 ? GOLD : INK, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums', textShadow: n >= 9 ? '0 0 30px rgba(246,207,120,0.45)' : 'none', transform: `scale(${1 + 0.06 * hit(T, dropAt(Math.max(0, n - 1)) + 0.2, 0.15)})` }}>{n}</div>
            <div style={{ fontFamily: ZH, fontSize: 32, color: INK }}>罐 / 天</div>
            <div style={{ fontFamily: ZH, fontSize: 26, color: GOLD, marginTop: 10, opacity: easeOut(prog(T, b(193), b(194))) }}>超过 9–14 罐，才会越线</div>
          </div>
        </AbsoluteFill>
      )}
      {/* erythritol: the study and its limits */}
      <Card o={studyO}>
        <svg width={1920} height={1080}>
          <text x={960} y={190} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK }}>赤藓糖醇 · 《自然·医学》2023</text>
          <text x={960} y={236} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.6)' }}>血液中赤藓糖醇水平 vs 三年内心血管事件风险</text>
          {[['最低 1/4', 1], ['最高 1/4', 2]].map(([lab, v], k) => {
            const g = easeOut(prog(T, b(208) + k * 0.4, b(209) + k * 0.4));
            const h = 170 * (v as number) * (k === 0 ? easeOut(prog(T, b(201), b(202))) : g);
            return (
              <g key={k}>
                <rect x={760 + k * 260} y={680 - h} width={140} height={h} fill={k ? RED : '#8a8a8e'} />
                <text x={830 + k * 260} y={720} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.75)' }}>{lab as string}</text>
                <text x={830 + k * 260} y={680 - h - 18} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 48, fill: k ? RED : INK }} opacity={k ? g : 1}>{k ? '≈2×' : '1×'}</text>
              </g>
            );
          })}
          <g opacity={easeOut(prog(T, b(216), b(217)))} transform={`rotate(-6 1460 450) translate(1460,450) scale(${0.9 + 0.1 * pop(T, b(216), 0.3)}) translate(-1460,-450)`}>
            <rect x={1260} y={390} width={400} height={120} rx={10} fill="none" stroke={GOLD} strokeWidth={4} />
            <text x={1460} y={444} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 36, fill: GOLD }}>观察性研究</text>
            <text x={1460} y={490} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: GOLD }}>关联 ≠ 因果</text>
          </g>
          <text x={960} y={790} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.42)' }}>Witkowski 等, Nature Medicine (2023) · 研究对象多为心血管高风险人群</text>
        </svg>
      </Card>
      {/* WHO */}
      <Card o={whoO}>
        <svg width={1920} height={1080}>
          <rect x={460} y={230} width={1000} height={460} fill="rgba(239,232,216,0.06)" stroke="rgba(243,237,226,0.25)" />
          <text x={510} y={300} style={{ fontFamily: SANS, fontSize: 24, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.1em' }}>2023 年 5 月 15 日 · 世界卫生组织 指南</text>
          <text x={510} y={400} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 60, fill: INK }}>不建议用代糖</text>
          <text x={510} y={480} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 60, fill: INK }}>来<tspan fill={GOLD}>控制体重</tspan></text>
          <g opacity={easeOut(prog(T, b(232), b(233)))}>
            <text x={510} y={560} style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.8)' }}>长期：对减少体脂没有好处</text>
            <text x={510} y={608} style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.8)' }}>可能与 2 型糖尿病、心血管疾病风险有关</text>
          </g>
          <text x={510} y={660} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.5)' }}>"有条件建议" · 不适用于已患糖尿病的人</text>
        </svg>
      </Card>
      <SubBand />
      <Chapter T={T} at={b(168)} out={S3_OUT} text="它 健 康 吗" />
      <Subs T={T} lines={LINES_S3} />
    </AbsoluteFill>
  );
};
