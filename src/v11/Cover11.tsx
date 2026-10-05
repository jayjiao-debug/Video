import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { Defs11, C, F, LNUM, Coin, Stamp } from './kit11';

/* Douyin covers for ep11 (横版 1440×1080, 竖版 1080×1440): the night desk, the ledger page with A's 7 months
   and the 被套牢 seal, and a 2-line gold hook. Same set and palette as the film. */
const PageArt: React.FC = () => {
  // a ledger page 1300×640 with the S08 chart (投入 high and climbing, 满意 flat) and the seal
  const X0 = 200, X1 = 1060, AX = 520, N = 12;
  const xs = Array.from({ length: N + 1 }, (_, i) => X0 + ((X1 - X0) * i) / N);
  const ease = (t: number) => 0.55 * t + (0.45 * (1 - Math.cos(Math.PI * t))) / 2;
  const inv = xs.map((_, i) => 200 - 70 * ease(i / N));
  const sat = xs.map((_, i) => 420 - 10 * ease(i / N));
  const path = (ys: number[]) => 'M' + xs.map((x, i) => `${x},${ys[i]}`).join(' L');
  return (
    <g>
      <rect x={6} y={18} width={1300} height={640} rx={4} fill="#000" opacity={0.5} filter="url(#k-soft)" />
      <rect x={0} y={0} width={1300} height={640} rx={3} fill="#f1e8d3" />
      <image href={staticFile('ep11_paper.png')} x={0} y={0} width={1300} height={640} preserveAspectRatio="none" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={0} y1={150 + i * 46} x2={1300} y2={150 + i * 46} stroke={C.rule} strokeOpacity={0.45} />)}
      <line x1={120} y1={0} x2={120} y2={640} stroke={C.margin} strokeWidth={1.6} strokeOpacity={0.75} />
      <line x1={127} y1={0} x2={127} y2={640} stroke={C.margin} strokeWidth={1.6} strokeOpacity={0.75} />
      <line x1={0} y1={96} x2={1300} y2={96} stroke={C.ink} strokeWidth={2} />
      <line x1={0} y1={102} x2={1300} y2={102} stroke={C.ink} strokeWidth={1} />
      <text x={190} y={72} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 52, letterSpacing: 4 }} fill={C.ink}>感情账本</text>
      <text x={1250} y={70} textAnchor="end" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 38, ...LNUM }} fill={C.ink3}>Ledger · No. 4</text>
      <line x1={X0 - 20} y1={AX} x2={X1 + 40} y2={AX} stroke={C.ink} strokeWidth={2} />
      <path d={path(inv)} fill="none" stroke={C.teal} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(sat)} fill="none" stroke="#b07c22" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => <circle key={`i${i}`} cx={x} cy={inv[i]} r={7} fill="#f3ebd8" stroke={C.teal} strokeWidth={4} />)}
      {xs.map((x, i) => <circle key={`s${i}`} cx={x} cy={sat[i]} r={7} fill="#f3ebd8" stroke="#b07c22" strokeWidth={4} />)}
      <text x={X0 - 34} y={inv[0] + 14} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 44 }} fill={C.teal}>投入</text>
      <text x={X0 - 34} y={sat[0] + 14} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 44 }} fill="#b07c22">满意</text>
      <line x1={1110} y1={120} x2={1110} y2={AX} stroke={C.redUI} strokeWidth={2.5} strokeDasharray="8 7" />
      <Coin x={1076} y={AX - 30} l="A" />
      <Coin x={1200} y={AX - 30} l="B" solid={false} o={0.45} />
      <Stamp x={660} y={318} rot={-7} s={1.25} w={356} h={176} text="被套牢" sub="ENTRAPMENT" />
    </g>
  );
};

export const Cover11: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const [handle] = useState(() => delayRender('cover11'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', 'italic 600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', '500 40px "Noto Sans CJK SC"']
      .map((f) => document.fonts.load(f, '都付出这么多了还走不走舍得是TA吗账本被套牢')).map((p) => p.catch(() => null))).then(() => { setOk(true); continueRender(handle); });
  }, [handle]);
  if (!ok) return null;
  const tall = h > w;
  const hookSize = tall ? 128 : 116;
  const hookY = tall ? 250 : 200;
  const pageT = tall ? `translate(${w / 2 - 650 * 0.78} 520) rotate(-4 650 320) scale(0.78)` : `translate(${w / 2 - 650 * 0.86} 392) rotate(-3.5 650 320) scale(0.86)`;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, #1d2538 0%, #111727 50%, #070a12 85%, #04060b 100%)' }}>
      <Defs11 />
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="cv-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.75" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
          </linearGradient>
          <radialGradient id="cv-vig" cx="50%" cy="50%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
          <radialGradient id="cv-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffe9b8" stopOpacity="0.16" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx={w / 2} cy={tall ? 800 : 690} rx={w * 0.6} ry={tall ? 420 : 340} fill="url(#cv-lamp)" />
        <g transform={pageT}><PageArt /></g>
        {/* hook: two lines, gold serif */}
        <g style={{ fontFamily: F.serif, fontWeight: 900 }}>
          <text x={w / 2} y={hookY} textAnchor="middle" style={{ fontSize: hookSize * 0.72, letterSpacing: '0.06em' }} fill="#f3ede2" stroke="#05070d" strokeWidth={10} paintOrder="stroke">都付出这么多了，</text>
          <text x={w / 2} y={hookY + hookSize * 1.1} textAnchor="middle" style={{ fontSize: hookSize, letterSpacing: '0.06em' }} fill="url(#cv-gold)" stroke="#05070d" strokeWidth={12} paintOrder="stroke">还走不走？</text>
        </g>
        <rect width={w} height={h} fill="url(#cv-vig)" />
        {/* series + episode title */}
        {tall ? (
          <g transform={`translate(${w / 2} 1092)`}>
            <text textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.08em' }} fill="#f1c56d">《舍不得的，是TA吗？》</text>
            <text y={56} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.45em' }} fill="rgba(243,237,226,0.7)">◆ VIBE知识大赏</text>
          </g>
        ) : (
          <g>
            <text x={w / 2} y={72} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 24, letterSpacing: '0.45em' }} fill="rgba(243,237,226,0.7)">◆ VIBE知识大赏</text>
            <text x={w / 2} y={1030} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 40, letterSpacing: '0.08em' }} fill="#f1c56d">《舍不得的，是TA吗？》</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
