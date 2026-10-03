import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from '../lib';
import { Person, CAST } from './rig';

const Label: React.FC<{ x: number; zh: string; en: string; note: string }> = ({ x, zh, en, note }) => (
  <div style={{ position: 'absolute', left: x - 200, width: 400, top: 1235, textAlign: 'center' }}>
    <div style={{ fontFamily: ZH, fontSize: 40, color: C.paper, letterSpacing: '0.12em' }}>{zh}</div>
    <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, color: C.gold, marginTop: 4 }}>{en}</div>
    <div style={{ fontFamily: ZH, fontSize: 22, color: C.dim, marginTop: 8 }}>{note}</div>
  </div>
);

export const CharSheet: React.FC = () => {
  const xs = [260, 730, 1200, 1670, 2140];
  const y = 730, s = 0.9;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 45%, #1f2333 0%, #0f1016 75%)' }}>
      <div style={{ position: 'absolute', left: 80, top: 50, fontFamily: ZH, fontSize: 44, color: C.paper, letterSpacing: '0.2em' }}>
        《缘分方程》人物设定 <span style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 30, color: C.gold, letterSpacing: 0 }}>Character sheet · v1</span>
      </div>
      <svg width={2400} height={1400} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Person look={CAST.youF} pose={{ head: -14, shR: 10, elR: 20 }} x={xs[0]} y={y} scale={s} />
        <Person look={CAST.youM} pose={{ head: -6, shR: 20, elR: 60, shL: -4, elL: 30 }} x={xs[1]} y={y} scale={s} />
        <Person look={CAST.drake} pose={{ head: -10, shR: 150, elR: -25, shL: -4 }} x={xs[2]} y={y} scale={s} />
        <Person look={CAST.backus} pose={{ head: 6, shR: 14, elR: 70, shL: 8, elL: 60 }} x={xs[3]} y={y} scale={s} />
        <Person look={CAST.rose} pose={{ head: 4, shR: 12, elR: 30 }} x={xs[4]} y={y} scale={s} flip />
      </svg>
      <Label x={xs[0]} zh="你（女）" en="You · her" note="开场 & 评论区互动场景" />
      <Label x={xs[1]} zh="你（男）" en="You · him" note="开场 & 评论区互动场景" />
      <Label x={xs[2]} zh="德雷克 · 1961" en="Frank Drake" note="天文学家 · 衬衫领带、眼镜" />
      <Label x={xs[3]} zh="巴克斯 · 2010" en="Peter Backus" note="经济学博士 · 单身" />
      <Label x={xs[4]} zh="Rose" en="Rose" note="“朋友的朋友”" />
    </AbsoluteFill>
  );
};
