import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, prog, easeOut, easeInOut, lerp, pop, rnd, EN, ZH, SANS, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S4 (b240–b280): the turn. China's sugar-free drinks grew from ¥2.26 bn (2015) to ¥57.05 bn (2024); in 2024 about
   40 % of that was unsweetened tea, and one brand, 东方树叶 (Nongfu Spring), held 75 % of the unsweetened-tea market
   (勤策消费研究《2025年中国无糖茶行业报告》, data from 国家统计局, 中国饮料工业协会, 欧睿 etc., via 36氪).
   The WHO's own words (2023-05-15): "reduce the sweetness of the diet altogether, starting early in life".
   (The lock callback was cut at the owner's request; the music loses b288–b304 in the final edit.) */
export const S4_IN = cut(240), S4_OUT = cut(280) - 1e-4;

export const LINES_S4: Line[] = [
  [b(240) + 0.1, b(248) - 0.1, '有意思的是，中国的饮料货架，自己拐了个弯。', 'Meanwhile China\'s drinks shelf took its own turn.'],
  [b(248) + 0.06, b(256) - 0.1, '无糖饮料，9年涨到[570.5亿元]，约25倍；', 'Sugar-free drinks grew from ¥2.26 bn in 2015 to ¥57.05 bn in 2024;'],
  [b(256) + 0.06, b(264) - 0.1, '其中约四成，是根本不加甜味的[无糖茶]。', 'about 40% of it was tea with no sweetener at all.'],
  [b(264) + 0.06, b(272) - 0.1, '一家龙头品牌，就占了无糖茶的[75%]。', 'One brand alone held 75% of that tea.'],
  [b(272) + 0.06, b(280) - 0.15, '世卫组织原话：从小开始，整体降低饮食的甜度。', 'The WHO\'s own words: reduce the sweetness of the diet altogether, starting early in life.'],
];


export const S4: React.FC<{ T: number }> = ({ T }) => {
  if (T < S4_IN || T > S4_OUT) return null;
  const o = 1;
  const chartO = T < cut(272) ? 1 : 0;
  const quoteO = T >= cut(272) ? 1 : 0;
  // bars: 2015 and 2024 on one linear axis (¥ bn)
  const BASE = 700, K = 0.72; // px per 亿元
  const g15 = easeOut(prog(T, b(248) + 0.2, b(249)));
  const g24 = easeOut(prog(T, b(250), b(252) + 0.3));
  const tea = easeInOut(prog(T, b(256) + 0.2, b(258)));
  const zoom = easeInOut(prog(T, b(264), b(265) + 0.2));
  const share = easeOut(prog(T, b(265), b(267)));
  const h24 = 570.5 * K * g24, h15 = 22.6 * K * g15;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0b08', opacity: o }}>
      {/* a tea-coloured light */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(185,128,42,0.18), rgba(0,0,0,0) 70%)' }} />
      {chartO > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: chartO }}>
          {/* the shelf turning: a row of plain tea bottles fading in (b240–b248) */}
          <g opacity={T < cut(248) ? 1 : 0}>
            {Array.from({ length: 9 }, (_, i) => {
              const d = easeOut(prog(T, b(240) + 0.25 * i, b(241) + 0.25 * i));
              const x = 380 + i * 145;
              return (
                <g key={i} transform={`translate(${x},${640 - 20 * (1 - d)})`} opacity={d}>
                  <path d="M-16,-300 L16,-300 L16,-272 Q40,-240 46,-190 L46,0 Q46,14 32,14 L-32,14 Q-46,14 -46,0 L-46,-190 Q-40,-240 -16,-272 Z" fill={i % 3 === 1 ? 'rgba(185,128,42,0.55)' : 'rgba(150,170,90,0.45)'} stroke="rgba(243,237,226,0.4)" strokeWidth={2} />
                  <rect x={-46} y={-150} width={92} height={70} fill="rgba(243,237,226,0.85)" />
                  <text x={0} y={-104} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 30, fill: '#3a4a2a' }}>茶</text>
                </g>
              );
            })}
            <rect x={300} y={656} width={1320} height={12} fill="#4a3a24" />
          </g>
          {/* market size */}
          <g opacity={easeOut(prog(T, b(248), b(249)))} transform={`translate(${lerp(0, -420, zoom)},0)`}>
            <text x={760} y={200} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: INK }}>中国无糖饮料市场（亿元）</text>
            <line x1={700} x2={1300} y1={BASE} y2={BASE} stroke="rgba(243,237,226,0.4)" strokeWidth={2} />
            <rect x={800} y={BASE - h15} width={150} height={h15} fill="#8a8a8e" />
            <text x={875} y={BASE - h15 - 16} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: INK, fontVariantNumeric: 'lining-nums' }} opacity={g15}>22.6</text>
            <text x={875} y={BASE + 40} textAnchor="middle" style={{ fontFamily: EN, fontSize: 30, fill: 'rgba(243,237,226,0.7)', fontVariantNumeric: 'lining-nums' }}>2015</text>
            <rect x={1060} y={BASE - h24} width={150} height={h24} fill="#c9c2b0" />
            <rect x={1060} y={BASE - h24 * 0.4 * tea} width={150} height={h24 * 0.4 * tea} fill={GOLD} />
            <text x={1135} y={BASE - h24 - 16} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: INK, fontVariantNumeric: 'lining-nums' }} opacity={g24}>570.5</text>
            <text x={1135} y={BASE + 40} textAnchor="middle" style={{ fontFamily: EN, fontSize: 30, fill: 'rgba(243,237,226,0.7)', fontVariantNumeric: 'lining-nums' }}>2024</text>
            <text x={1235} y={BASE - h24 * 0.2} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: GOLD }} opacity={tea * (1 - zoom)}>无糖茶 ≈ 四成</text>
            <text x={980} y={BASE - h24 * 0.62} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: GOLD, fontVariantNumeric: 'lining-nums' }} opacity={g24 * (1 - tea)}>≈ 25 ×</text>
          </g>
          {/* who sells the unsweetened tea */}
          <g opacity={share}>
            <text x={1000} y={300} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: INK }}>无糖茶市场份额（2024）</text>
            <rect x={1000} y={360} width={700} height={90} fill="rgba(243,237,226,0.12)" />
            <rect x={1000} y={360} width={700 * 0.75 * share} height={90} fill={GOLD} />
            <text x={1020} y={420} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 36, fill: '#2a1d10' }}>龙头品牌</text>
            <text x={1000 + 700 * 0.75 * share - 20} y={424} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 52, fill: '#2a1d10', fontVariantNumeric: 'lining-nums' }}>75%</text>
            <text x={1690} y={420} textAnchor="end" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.6)' }}>其他</text>
          </g>
          <text x={960} y={800} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.42)' }} opacity={easeOut(prog(T, b(248), b(249)))}>勤策消费研究《2025 年中国无糖茶行业报告》（数据来源：国家统计局、中国饮料工业协会、欧睿等）</text>
        </svg>
      )}
      {quoteO > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: quoteO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 140 }}>
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 40, color: 'rgba(243,237,226,0.6)', maxWidth: 1300, textAlign: 'center', lineHeight: 1.4 }}>"Reduce the sweetness of the diet altogether, starting early in life."</div>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, color: GOLD, marginTop: 30, textShadow: '0 0 30px rgba(246,207,120,0.35)' }}>整体降低饮食的甜度</div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.55)', marginTop: 18 }}>世界卫生组织 · 2023</div>
        </div>
      )}
      <SubBand />
      <Chapter T={T} at={b(240)} out={b(272)} text="另 一 条 路" />
      <Subs T={T} lines={LINES_S4} />
    </AbsoluteFill>
  );
};
