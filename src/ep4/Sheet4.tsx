import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH } from '../lib';
import { PeepFig } from '../v/scenesV';
import { YOU } from './scenes4a';
import { Avatar, STRATS, PlayCard, Coin, CoinStack, Trophy, IconHeart, IconShield, IconEye } from './props4';

const Cap: React.FC<{ x: number; y: number; w: number; t: string; s?: string }> = ({ x, y, w, t, s }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: 'center' }}>
    <div style={{ fontFamily: ZH, fontSize: 28, color: C.paper }}>{t}</div>
    {s && <div style={{ fontFamily: ZH, fontSize: 20, color: C.dim, marginTop: 6 }}>{s}</div>}
  </div>
);

export const CastSheet4: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#191c27,#0e0f14)' }}>
    <div style={{ position: 'absolute', left: 60, top: 36, fontFamily: ZH, fontSize: 44, color: C.goldHi }}>《好人会赢吗》人物设定</div>
    <PeepFig {...YOU} x={170} y={440} h={300} glow={false} />
    <PeepFig {...YOU} face="Smile" x={390} y={440} h={300} glow={false} />
    <Cap x={60} y={455} w={440} t="“你”：做得最多的那个人" s="熬夜（Tired）→ 被抢功（Concerned）→ 结尾释然（Smile）" />
    <PeepFig kind="stand" body="PointingFingerBW" face="SmileBig" hair="ShortMessy" x={640} y={520} h={420} flip glow={false} />
    <Cap x={520} y={535} w={240} t="抢功的同事" />
    <PeepFig body="Explaining" face="Explaining" hair="Short" fh="Full" acc="GlassRound" x={930} y={440} h={300} glow={false} />
    <Cap x={800} y={455} w={260} t="阿克塞尔罗德" s="政治学家（不做肖像）" />
    <PeepFig body="Shirt" face="Calm" hair="Bangs" x={1170} y={440} h={260} glow={false} />
    <PeepFig body="Shirt" face="Calm" hair="ShortWavy" x={1370} y={440} h={270} flip glow={false} />
    <Cap x={1080} y={455} w={380} t="游戏里的“你”和“对方”" />
    <div style={{ position: 'absolute', left: 60, top: 640, fontFamily: ZH, fontSize: 30, color: C.gold }}>14个程序，拟人化：每种策略一张脸</div>
    {STRATS.map((s, i) => (
      <Avatar key={i} s={{ ...s, name: s.name || `程序${i + 1}` }} d={96} x={120 + (i % 7) * 150 + (i >= 7 ? 0 : 0)} y={760 + Math.floor(i / 7) * 170} lsize={22} ring={i === 0 ? C.goldHi : '#1b1714'} glow={i === 0 ? 0.5 : 0} />
    ))}
    <div style={{ position: 'absolute', left: 1180, top: 690, width: 680, fontFamily: ZH, fontSize: 24, lineHeight: 1.75, color: C.dim }}>
      一报还一报 = 平静微笑（金框）；永远背叛 = 轻蔑；永远合作 = 天真；永不原谅 = 严肃；偷偷试探 = 狐疑；随机 = 慌乱。其余 8 个只露脸不起名（名字为示意，比赛里真实参赛者各有名字）。
    </div>
  </AbsoluteFill>
);

export const PropSheet4: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#191c27,#0e0f14)' }}>
    <div style={{ position: 'absolute', left: 60, top: 36, fontFamily: ZH, fontSize: 44, color: C.goldHi }}>《好人会赢吗》道具</div>
    <div style={{ position: 'absolute', left: 90, top: 160, display: 'flex', gap: 30 }}><PlayCard kind="c" w={150} /><PlayCard kind="d" w={150} /></div>
    <Cap x={80} y={380} w={360} t="两张牌：合作 / 背叛" />
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <g transform="translate(560 300)"><Coin r={40} /></g>
      <g transform="translate(690 330)"><CoinStack n={5} r={24} /></g>
      <g transform="translate(900 360) scale(1.1)"><Trophy /></g>
      <g transform="translate(1140 260)"><IconHeart /></g>
      <g transform="translate(1310 260)"><IconShield /></g>
      <g transform="translate(1480 260)"><IconHeart bandage /></g>
      <g transform="translate(1650 260)"><IconEye /></g>
    </svg>
    <Cap x={480} y={380} w={320} t="金币 = 分数" />
    <Cap x={800} y={380} w={200} t="奖杯" />
    <Cap x={1060} y={340} w={680} t="四个特点：善良 · 会反击 · 会原谅 · 简单" />
    <div style={{ position: 'absolute', left: 90, top: 520, width: 760, height: 250, background: '#efe6d0', border: '6px solid #1b1714', borderRadius: 12, padding: '22px 34px', transform: 'rotate(-1.5deg)',
      backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 46px, rgba(90,125,176,0.25) 46px 48px)' }}>
      <div style={{ fontFamily: ZH, fontSize: 24, color: '#6b5a44' }}>“一报还一报” · 全部规则</div>
      <div style={{ fontFamily: '"Ma Shan Zheng", serif', fontSize: 42, color: '#1b1714', marginTop: 20 }}>① 第一轮：先合作</div>
      <div style={{ fontFamily: '"Ma Shan Zheng", serif', fontSize: 42, color: '#1b1714', marginTop: 10 }}>② 之后：你怎么对我，我就怎么对你</div>
    </div>
    <Cap x={90} y={800} w={760} t="手写规则卡" />
    <div style={{ position: 'absolute', left: 1000, top: 540, padding: '10px 26px', borderRadius: 12, background: '#0b0c10', border: '4px solid #1b1714', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 64, color: '#e46b5c' }}>02:13</div>
    <Cap x={960} y={660} w={300} t="凌晨的时钟" />
    <div style={{ position: 'absolute', left: 1330, top: 520, width: 440, height: 260, background: '#efe6d0', border: '5px solid #1b1714', borderRadius: 8 }} />
    <Cap x={1330} y={800} w={440} t="汇报投影：小组项目" />
  </AbsoluteFill>
);
