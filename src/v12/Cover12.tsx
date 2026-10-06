import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { Defs12, Strip, GA, A, INK, SEC, F, roughEllipse, roughLine, G, Grease } from './kit12';

/* Douyin covers for ep12 (横版 1440×1080, 竖版 1080×1440), look A: the light table, the walk strip
   compressed into the replay strip (00:33:07 → 00:04:52, facts F1), the title, one hook line. */
export const Cover12: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const [handle] = useState(() => delayRender('cover12'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(['900 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Serif CJK SC"', '700 40px "DejaVu Sans Mono"']
      .map((f) => document.fonts.load(f, '为什么一年一眨眼分钟回忆只剩不到的路0123456789:')).map((p) => p.catch(() => null))).then(() => { setOk(true); continueRender(handle); });
  }, [handle]);
  if (!ok) return null;
  const tall = h > w;
  const s = tall ? 1080 / 1440 : 1; // scale of the strip block
  const EV: Record<number, string> = { 4: 'pPost', 11: 'pPaper', 21: 'pDrink', 29: 'pCafe' };
  const pitch = 1624 / 17;
  const rowFr = (row: number) => Array.from({ length: row ? 16 : 17 }, (_, i) => {
    const m = row * 17 + i + 1, k = EV[m];
    return { x: 148 + i * pitch, w: 88, state: (k ? 'key' : 'dim') as 'key' | 'dim', pic: k || 'pWalk', picO: k ? 1 : 0.6 };
  });
  const KX = 640, KY = 704, kLen = 20 + 4.87 * pitch + 6;
  const replay = ['pPost', 'pPaper', 'pDrink', 'pCafe', 'pWalk'].map((id, i) => ({ x: KX + 20 + i * pitch, w: i < 4 ? 88 : 0.87 * pitch - 7, state: (i < 4 ? 'key' : 'dim') as 'key' | 'dim', pic: id, picO: i < 4 ? 1 : 0.6 }));
  const sc = tall ? 0.6 : 0.78;
  const bx = (w - 1664 * sc) / 2 - 128 * sc;
  const by = (tall ? 500 : 250) - 340 * sc;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 78% 82% at 50% 40%, #FCFDFB 0%, #F4F7F3 46%, #E6EBE6 82%, #D7DDD8 100%)' }}>
      <Defs12 />
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <g stroke="#C3CBC5" strokeWidth={1} opacity={0.45}>
          {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} x1={i * 120} y1={0} x2={i * 120} y2={h} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} y1={60 + i * 120} x2={w} y2={60 + i * 120} />)}
        </g>
        {/* the walk (33 frames) and its replay (4.87 frames), at the film's own gauge, scaled to the cover */}
        <g transform={`translate(${bx},${by}) scale(${sc})`}>
          <Strip x0={128} x1={1792} y={376} g={GA.card} perf="dim" frames={rowFr(0)} />
          <Strip x0={128} x1={148 + 16 * pitch + 12} y={500} g={GA.card} perf="dim" frames={rowFr(1)} />
          <Strip x0={KX} x1={KX + kLen} y={KY} g={GA.card} perf="bright" frames={replay} hi />
          <text x={1792} y={358} textAnchor="end" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 64, fontFeatureSettings: "'tnum' 1" }} fill={INK}>00:33:07</text>
          <text x={1186} y={808} style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 112, fontFeatureSettings: "'tnum' 1" }} fill={A}>00:04:52</text>
          <Grease>
            {[[4, 0, 3], [11, 0, 10], [21, 1, 3], [29, 1, 11]].map(([m, row, i]) => <G key={m} d={roughEllipse(148 + i * pitch + 44, 376 + row * 124 + 58, 62, 47, m * 3, 1.12, 0.04, m % 2 ? 0.06 : -0.05)} w={7} />)}
            <G d={roughLine(1190, 834, 1660, 830, 21, 1.5, 5)} w={7} />
          </Grease>
        </g>
        {/* hook + title */}
        {tall ? (
          <g style={{ fontFamily: F.sans }}>
            <text x={w / 2} y={180} textAnchor="middle" style={{ fontWeight: 900, fontSize: 82, letterSpacing: '0.04em' }} fill={INK}>33分钟的路，</text>
            <text x={w / 2} y={290} textAnchor="middle" style={{ fontWeight: 900, fontSize: 82, letterSpacing: '0.04em' }} fill={INK}>回忆只剩不到<tspan fill={A}>5分钟</tspan></text>
            <text x={w / 2} y={960} textAnchor="middle" style={{ fontWeight: 900, fontSize: 132, letterSpacing: '0.04em' }} fill={INK}>为什么一年</text>
            <text x={w / 2} y={1112} textAnchor="middle" style={{ fontWeight: 900, fontSize: 132, letterSpacing: '0.04em' }} fill={A}>一眨眼？</text>
            <text x={w / 2} y={1170} textAnchor="middle" style={{ fontWeight: 500, fontSize: 30, letterSpacing: '0.4em' }} fill={SEC}>◆ VIBE知识大赏</text>
          </g>
        ) : (
          <g style={{ fontFamily: F.sans }}>
            <text x={w / 2} y={130} textAnchor="middle" style={{ fontWeight: 900, fontSize: 70, letterSpacing: '0.04em' }} fill={INK}>33分钟的路，回忆只剩不到<tspan fill={A}>5分钟</tspan></text>
            <text x={w / 2} y={968} textAnchor="middle" style={{ fontWeight: 900, fontSize: 100, letterSpacing: '0.04em' }} fill={INK}>为什么一年<tspan fill={A}>一眨眼</tspan>？</text>
            <text x={w / 2} y={1040} textAnchor="middle" style={{ fontWeight: 500, fontSize: 26, letterSpacing: '0.4em' }} fill={SEC}>◆ VIBE知识大赏</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
