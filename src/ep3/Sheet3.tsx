import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH } from '../lib';
import { PeepFig } from '../v/scenesV';
import { MOM, MOM_STAND, MOM_YOUNG, DAD, DAD_STAND, DAD_YOUNG } from './scenesA';
import { Suitcase, FoodBag, Train, NoodleCup, Bowl, Dish, Chopsticks, IconBottle, IconSchoolbag, IconBike, IconCake, IconLetter, Fu } from './props';
import { Steam } from '../ep2/ink';

const Cap: React.FC<{ x: number; y: number; w: number; t: string; s?: string }> = ({ x, y, w, t, s }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: 'center' }}>
    <div style={{ fontFamily: ZH, fontSize: 30, color: C.paper }}>{t}</div>
    {s && <div style={{ fontFamily: ZH, fontSize: 20, color: C.dim, marginTop: 6 }}>{s}</div>}
  </div>
);

export const CastSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#191c27,#0e0f14)' }}>
    <div style={{ position: 'absolute', left: 60, top: 36, fontFamily: ZH, fontSize: 44, color: C.goldHi }}>《还能见几次》人物设定</div>
    <PeepFig kind="stand" {...MOM_STAND} x={200} y={760} h={560} glow={false} />
    <PeepFig kind="stand" {...DAD_STAND} x={420} y={760} h={600} glow={false} />
    <Cap x={90} y={790} w={440} t="爸妈 · 现在" s="头发已经花白；门口送别、视频通话、晚饭、来电头像" />
    <PeepFig {...MOM} x={700} y={560} h={300} glow={false} />
    <PeepFig {...DAD} x={930} y={560} h={320} glow={false} />
    <PeepFig {...MOM_YOUNG} x={700} y={950} h={300} glow={false} />
    <PeepFig {...DAD_YOUNG} x={930} y={950} h={320} glow={false} />
    <Cap x={570} y={580} w={500} t="半身 · 现在（花白）" />
    <Cap x={570} y={965} w={500} t="半身 · 年轻时（黑发）" s="只出现在童年相框里：你长大，他们变老" />
    <PeepFig body="Paper" face="Calm" hair="ShortScratch" acc="GlassRound" x={1250} y={560} h={320} glow={false} />
    <Cap x={1110} y={580} w={280} t="蒂姆·厄班" s="《The Tail End》作者（不做肖像）" />
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <g transform="translate(1560 560) scale(0.95)"><Suitcase /></g>
      <g transform="translate(1760 560)"><Bowl w={190} food={1} /></g>
    </svg>
    <Cap x={1440} y={580} w={440} t="“你” · 永远不露脸" s="第一人称镜头：行李箱、你的碗、你的手机——每个观众都代入自己" />
    <div style={{ position: 'absolute', left: 1120, top: 720, width: 740, fontFamily: ZH, fontSize: 24, lineHeight: 1.7, color: C.dim }}>
      设计原则：墨线手绘、奶油底色，与前两集一致。爸妈始终微笑——温暖，不煽情。<br />
      不画病床、医院、老态龙钟；“变老”只用头发由黑变白来暗示。
    </div>
  </AbsoluteFill>
);

export const PropSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#191c27,#0e0f14)' }}>
    <div style={{ position: 'absolute', left: 60, top: 36, fontFamily: ZH, fontSize: 44, color: C.goldHi }}>《还能见几次》道具</div>
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <g transform="translate(170 430)"><Suitcase /></g>
      <g transform="translate(400 430)"><FoodBag /></g>
      <g transform="translate(600 330)"><Fu s={1.1} /></g>
      <g transform="translate(820 430)"><NoodleCup /></g>
      <g transform="translate(820 300)"><Steam t={0.6} /></g>
      <g transform="translate(1020 430)"><Bowl w={200} /></g>
      <g transform="translate(1300 360)"><Dish kind="fish" w={260} /></g>
      <g transform="translate(1600 360)"><Dish kind="pork" w={220} /></g>
      <g transform="translate(1300 470)"><Dish kind="greens" w={220} /></g>
      <g transform="translate(1600 470)"><Dish kind="eggs" w={200} /></g>
      <g transform="translate(1720 250) rotate(-30)"><Chopsticks len={180} /></g>
      <g transform="translate(160 760) scale(0.62)"><Train L={1500} /></g>
      {[IconBottle, IconSchoolbag, IconBike, IconCake, IconLetter].map((I, i) => <g key={i} transform={`translate(${1220 + i * 140} 720)`}><I /></g>)}
    </svg>
    {[['行李箱', 170], ['妈塞的一袋吃的', 400], ['门上的福', 600], ['泡面', 820], ['你的碗', 1020]].map(([t, x]) => <Cap key={t as string} x={(x as number) - 110} y={470} w={220} t={t as string} />)}
    <Cap x={1170} y={520} w={560} t="家常菜：鱼、红烧肉、青菜、番茄炒蛋" />
    <Cap x={160} y={800} w={930} t="高铁（离家）" />
    <Cap x={1150} y={800} w={720} t="童年记忆：奶瓶 · 书包 · 自行车 · 生日蛋糕 · 录取通知书" />
  </AbsoluteFill>
);
