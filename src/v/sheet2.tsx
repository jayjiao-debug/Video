import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from '../lib';
import { PeepFig } from './scenesV';

const L: React.FC<{ x: number; zh: string; en: string; note: string }> = ({ x, zh, en, note }) => (
  <div style={{ position: 'absolute', left: x - 220, width: 440, top: 1010, textAlign: 'center' }}>
    <div style={{ fontFamily: ZH, fontSize: 42, color: C.paper, letterSpacing: '0.12em' }}>{zh}</div>
    <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 28, color: C.gold, marginTop: 4 }}>{en}</div>
    <div style={{ fontFamily: ZH, fontSize: 24, color: C.dim, marginTop: 8 }}>{note}</div>
  </div>
);

export const Sheet2: React.FC = () => {
  const xs = [250, 710, 1190, 1680, 2140];
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 45%, #1f2333 0%, #0f1016 75%)' }}>
      <div style={{ position: 'absolute', left: 80, top: 50, fontFamily: ZH, fontSize: 44, color: C.paper, letterSpacing: '0.2em' }}>
        《缘分方程》人物设定 v2 <span style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 30, color: C.gold, letterSpacing: 0 }}>hand-drawn · ink on cream</span>
      </div>
      <PeepFig kind="stand" body="ShirtPantsWB" face="Calm" hair="Long" x={xs[0] + 40} y={960} h={760} />
      <PeepFig kind="stand" body="WalkingBW" face="Smile" hair="ShortMessy" x={xs[1] + 40} y={960} h={760} />
      <PeepFig body="PointingUp" face="Explaining" hair="Pomp" acc="GlassRound" x={xs[2]} y={960} h={520} />
      <PeepFig body="Geek" face="Calm" hair="ShortWavy" x={xs[3]} y={960} h={520} />
      <PeepFig body="Coffee" face="Smile" hair="Bangs" x={xs[4]} y={960} h={520} flip />
      <L x={xs[0]} zh="你（女）" en="You · her" note="开场仰望星空 · 评论区互动" />
      <L x={xs[1]} zh="你（男）" en="You · him" note="开场 · 评论区互动" />
      <L x={xs[2]} zh="德雷克 · 1961" en="Frank Drake" note="指向星空 · 眼镜" />
      <L x={xs[3]} zh="巴克斯 · 2010" en="Peter Backus" note="抱着电脑算自己的机会" />
      <L x={xs[4]} zh="Rose" en="Rose" note="晚餐上，端着咖啡" />
    </AbsoluteFill>
  );
};
