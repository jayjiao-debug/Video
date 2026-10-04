import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, pop, rnd, EN, ZH, SANS, GOLD, INK, RED } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S2 (b128–b161, the build): the Chinese version. Generic bottles only (no brand's design): the name is said in the
   subtitles, the pictures stay unbranded.
   - 元气森林 (founded 2016) launched its sparkling water in 2018 on "0糖0脂0卡"; sweetened with erythritol and
     sucralose (凤凰网科技, 2020-07-27).
   - 2021: its milk tea said "0蔗糖" but contained lactose and crystalline fructose; on 2021-04-10 the company
     apologised and relabelled it "低糖" (每日经济新闻, 2021-04-12).
   - GB 28050 (预包装食品营养标签通则): "无糖" ≤ 0.5 g sugar per 100 ml; "无能量/0卡" ≤ 17 kJ per 100 ml, "并不是真正
     意义的无能量" (国家卫健委 interpretation of GB 28050—2025, 中新网 2025-04-22). */
export const S2_IN = b(128) - 0.2, S2_OUT = b(161) + 0.2;

export const LINES_S2: Line[] = [
  [b(128) + 0.1, b(135) - 0.1, '"0糖0脂0卡"的气泡水，火遍全国；', 'In 2018 a Chinese sparkling water sold itself on "0 sugar, 0 fat, 0 calories".'],
  [b(135) + 0.06, b(141) - 0.1, '甜味多来自赤藓糖醇、三氯蔗糖。', 'Its sweetness came from erythritol and sucralose.'],
  [b(141) + 0.06, b(149) - 0.1, '曾有乳茶印着"0蔗糖"，其实含乳糖和果糖。', 'In 2021 its milk tea said "0 sucrose" but held lactose and fructose; the company apologised.'],
  [b(149) + 0.06, b(155) - 0.1, '国标里，"无糖"是糖≤[0.5克]；', 'Under China\'s label standard, "sugar-free" means up to 0.5 g per 100 ml;'],
  [b(155) + 0.06, b(161) - 0.15, '"0卡"是≤17千焦，不是{零}。', '"zero calories" means up to 17 kJ. Not actually zero.'],
];

const Bottle: React.FC<{ T: number; tint: string }> = ({ T, tint }) => (
  <g>
    <path d="M-34,-300 L34,-300 L34,-268 Q34,-250 52,-230 Q92,-190 92,-130 L92,240 Q92,270 62,270 L-62,270 Q-92,270 -92,240 L-92,-130 Q-92,-190 -52,-230 Q-34,-250 -34,-268 Z" fill={tint} stroke="rgba(220,235,255,0.55)" strokeWidth={3} />
    <rect x={-40} y={-330} width={80} height={34} rx={6} fill="#e8e4dc" />
    {Array.from({ length: 26 }, (_, i) => {
      const y = 250 - ((T * (40 + rnd(i, 2) * 50) + rnd(i, 3) * 480) % 480);
      return <circle key={i} cx={-70 + rnd(i, 1) * 140} cy={y} r={2 + rnd(i, 4) * 4} fill="none" stroke="rgba(230,245,255,0.55)" strokeWidth={1.5} />;
    })}
    <path d="M-80,-120 Q-84,40 -78,220" stroke="rgba(255,255,255,0.35)" strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* the label band */}
    <rect x={-92} y={-40} width={184} height={150} fill="#f6f1e8" />
    <rect x={-92} y={-40} width={184} height={10} fill="#c8a25a" /><rect x={-92} y={100} width={184} height={10} fill="#c8a25a" />
  </g>
);

const Seal: React.FC<{ x: number; y: number; text: string; s: number }> = ({ x, y, text, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={Math.min(1, s * 1.4)}>
    <circle r={78} fill="none" stroke={GOLD} strokeWidth={4} />
    <circle r={68} fill="rgba(246,207,120,0.12)" stroke={GOLD} strokeWidth={1.5} />
    <text y={20} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 52, fill: GOLD }}>{text}</text>
  </g>
);

const Carton: React.FC = () => (
  <g>
    <path d="M-110,-200 L110,-200 L110,250 L-110,250 Z" fill="#efe2cf" />
    <path d="M-110,-200 L0,-280 L110,-200 Z" fill="#e2d2bb" />
    <rect x={-110} y={-120} width={220} height={130} fill="#8a5a3a" />
    <text x={0} y={-36} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 56, fill: '#f6efe1' }}>乳茶</text>
    <text x={0} y={80} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 50, fill: '#5a3a24' }}>0蔗糖</text>
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-80} y={130 + i * 18} width={160 - (i % 2) * 40} height={6} fill="#5a3a24" opacity={0.3} />)}
  </g>
);

export const S2: React.FC<{ T: number }> = ({ T }) => {
  if (T < S2_IN || T > S2_OUT) return null;
  const o = easeOut(prog(T, S2_IN, S2_IN + 0.5)) * (1 - easeInOut(prog(T, S2_OUT - 0.4, S2_OUT)));
  const A = 1 - easeInOut(prog(T, b(141) - 0.3, b(141) + 0.3));           // bottle part
  const B = easeInOut(prog(T, b(141) - 0.3, b(141) + 0.3)) * (1 - easeInOut(prog(T, b(149) - 0.3, b(149) + 0.3))); // carton
  const C = easeInOut(prog(T, b(149) - 0.3, b(149) + 0.3));               // the standard
  const seal = (k: number) => pop(T, b(129) + 0.5 * k, 0.35);
  const ingr = easeOut(prog(T, b(135), b(136)));
  const mag = easeInOut(prog(T, b(143), b(144)));
  const strike = easeOut(prog(T, b(145), b(145) + 0.4));
  const sugarO = easeOut(prog(T, b(149) + 0.2, b(150)));
  const kjO = easeOut(prog(T, b(155), b(156)));
  const push = 1 + 0.04 * prog(T, S2_IN, S2_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070b12', opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg width={1920} height={1080}>
          <defs>
            <linearGradient id="s2-cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1a26" /><stop offset="1" stopColor="#060a10" /></linearGradient>
            <radialGradient id="s2-glow" cx="0.5" cy="0.4" r="0.55"><stop offset="0" stopColor="#bfe3ff" stopOpacity="0.18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#s2-cool)" />
          {/* a cooler's shelves behind, out of focus */}
          {[250, 520, 790].map((y) => <rect key={y} x={0} y={y} width={1920} height={8} fill="rgba(190,225,255,0.12)" />)}
          {Array.from({ length: 18 }, (_, i) => <rect key={i} x={40 + i * 108} y={i % 2 ? 300 : 570} width={60} height={200} rx={20} fill="rgba(150,190,230,0.06)" />)}
          <rect width={1920} height={1080} fill="url(#s2-glow)" />

          {/* A: the bottle, three seals, the sweeteners */}
          <g opacity={A}>
            <g transform="translate(700,470)"><Bottle T={T} tint="rgba(200,230,255,0.18)" /></g>
            <text x={700} y={470} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: '#5a4a2a' }}>气泡水</text>
            <text x={700} y={520} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 20, fill: '#8a7a5a', letterSpacing: '0.2em' }}>SPARKLING</text>
            {['0糖', '0脂', '0卡'].map((t, k) => <Seal key={t} x={1060 + k * 190} y={330} text={t} s={seal(k)} />)}
            <text x={1250} y={470} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.7)' }} opacity={seal(2)}>2018 起 · 无糖气泡水（示意）</text>
            <g opacity={ingr} transform={`translate(${lerp(1080, 1040, ingr)},560)`}>
              <rect x={0} y={0} width={440} height={170} fill="#f3eee4" />
              <text x={24} y={44} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: '#2a2a2a' }}>配料表（节选）</text>
              <text x={24} y={96} style={{ fontFamily: SANS, fontSize: 30, fill: '#2a2a2a' }}>…<tspan fill="#b07a1e" fontWeight={700}>赤藓糖醇</tspan>…</text>
              <text x={24} y={144} style={{ fontFamily: SANS, fontSize: 30, fill: '#2a2a2a' }}>…<tspan fill="#b07a1e" fontWeight={700}>三氯蔗糖</tspan>…</text>
            </g>
          </g>

          {/* B: "0蔗糖" is not "0糖" */}
          <g opacity={B}>
            <g transform="translate(680,470)"><Carton /></g>
            <g transform={`translate(${lerp(680, 1120, mag)},${lerp(550, 470, mag)}) scale(${lerp(0.4, 1, mag)})`} opacity={mag}>
              <circle r={200} fill="#f3eee4" stroke="#c8a25a" strokeWidth={10} />
              <text y={-60} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 30, fill: '#555' }}>配料中的糖：</text>
              <text y={10} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, fill: '#b23a2e' }}>乳糖</text>
              <text y={80} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, fill: '#b23a2e' }}>结晶果糖</text>
              <rect x={150} y={150} width={90} height={26} rx={13} fill="#c8a25a" transform="rotate(40 150 150)" />
            </g>
            <g opacity={strike}>
              <text x={1500} y={300} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: INK }}>0蔗糖 <tspan fill={RED}>≠</tspan> 0糖</text>
              <text x={1500} y={760} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 28, fill: 'rgba(243,237,226,0.75)' }}>后已公开道歉，改标“低糖”</text>
            </g>
          </g>

          {/* C: what the standard allows, per 100 ml */}
          <g opacity={C}>
            <text x={960} y={190} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 36, fill: INK, letterSpacing: '0.08em' }}>国标怎么算“无糖”“0卡”（每 100 毫升）</text>
            {/* beaker */}
            <g transform="translate(600,560)">
              <path d="M-120,-220 L120,-220 L110,180 Q108,200 88,200 L-88,200 Q-108,200 -110,180 Z" fill="rgba(200,230,255,0.12)" stroke="rgba(220,235,255,0.6)" strokeWidth={3} />
              <path d="M-114,-120 L114,-120 L110,180 Q108,200 88,200 L-88,200 Q-108,200 -110,180 Z" fill="rgba(170,210,255,0.16)" />
              {[0, 1, 2, 3].map((k) => <line key={k} x1={-120} x2={-90} y1={-120 + k * 80} y2={-120 + k * 80} stroke="rgba(220,235,255,0.6)" strokeWidth={2} />)}
              <text x={0} y={-150} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: 'rgba(220,235,255,0.75)' }}>100 毫升</text>
              {/* the allowance: a pinch of sugar at the bottom */}
              <g opacity={sugarO}>{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-14 + rnd(i, 7) * 28} cy={194 - rnd(i, 8) * 8} r={2.4} fill="#fbf7ef" />)}</g>
            </g>
            <g opacity={sugarO}>
              <text x={900} y={500} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK }}>“无糖” ＝ 糖 ≤ <tspan fontFamily={EN} fontSize={84} fill={GOLD} fontWeight={700} style={{ fontVariantNumeric: 'lining-nums' }}>0.5</tspan> 克</text>
            </g>
            <g opacity={kjO}>
              <text x={900} y={660} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK }}>“0卡” ＝ 能量 ≤ <tspan fontFamily={EN} fontSize={84} fill={GOLD} fontWeight={700} style={{ fontVariantNumeric: 'lining-nums' }}>17</tspan> 千焦</text>
              <text x={900} y={712} style={{ fontFamily: ZH, fontSize: 28, fill: 'rgba(243,237,226,0.7)' }}>官方解读：“并不是真正意义的无能量”</text>
            </g>
            <text x={960} y={800} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.42)' }}>GB 28050《预包装食品营养标签通则》· 国家卫生健康委员会解读（2025）</text>
          </g>
        </svg>
      </AbsoluteFill>
      <SubBand />
      <Chapter T={T} at={b(128)} out={b(161)} text="中 国 版 的 零 糖" />
      <Subs T={T} lines={LINES_S2} />
    </AbsoluteFill>
  );
};
